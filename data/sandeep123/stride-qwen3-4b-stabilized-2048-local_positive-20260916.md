# sandeep123/stride-qwen3-4b-stabilized-2048-local_positive-20260916

## Resumen

El modelo `sandeep123/stride-qwen3-4b-stabilized-2048-local_positive-20260916` es un adaptador LoRA (PEFT) entrenado mediante aprendizaje por refuerzo sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. Lo publica el usuario `sandeep123` como artefacto de investigación, no como modelo listo para producción: se trata de una colección de checkpoints de adaptador que documentan un experimento de estabilidad de entrenamiento con el algoritmo STRIDE combinado con GRPO sobre tareas de razonamiento matemático.

El problema que aborda es metodológico: investigar si un crédito de diversidad local (no negativo) sobre tokens de razonamiento elegibles, junto con una tasa de aprendizaje baja con warmup y una penalización KL de 0,01, mejora la estabilidad del entrenamiento por refuerzo. El modelo se entrena explícitamente en modo "nonthinking" (`enable_thinking=False`), es decir, sin la fase de razonamiento extendido que Qwen3 activa por defecto en algunos tamaños.

La relevancia es acotada y de nicho: sirve para reproducir y auditar un experimento concreto de RL aplicado a un modelo de ~4.000 millones de parámetros. La model card indica expresamente que no se publica ninguna evaluación ni afirmación de superioridad, y en el momento de la consulta el repositorio acumula 0 descargas y 0 likes. La licencia no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3-4B-Instruct-2507) con adaptador LoRA rank 16 sobre los modulos q/k/v/o y gate/up/down |
| Parametros totales | No disponible para el adaptador; el modelo base es un Qwen3 de aproximadamente 4.000 millones de parametros |
| Longitud de contexto | 8.192 tokens de limite durante el entrenamiento (prompt + respuesta); la longitud nativa del modelo base no se especifica en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos de adaptador en safetensors; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | No disponible (la model card no declara idiomas; el entrenamiento se centra en problemas matematicos) |
| Licencia | No disponible |
| Formato de pesos | PEFT safetensors (un directorio `checkpoint-NNNNNN/` por actualizacion del optimizador), mas `checkpoint_index.json`, plantilla de chat, tokenizer, metadatos y manifiesto SHA256 |
| Tamano del repositorio | 0,4 GB |
| Modelo base (pin) | `Qwen/Qwen3-4B-Instruct-2507`, revision `cdbee75f17c01a7cc42f958dc650907174af0554` |
| Libreria | peft |
| Algoritmo de entrenamiento | STRIDE + GRPO, con bonus de diversidad local no negativo sobre tokens de razonamiento elegibles |
| Hiperparametros LoRA | rank 16, alpha 32, dropout 0, sin bias |
| Hiperparametros de RL | LR pico 2e-5, 10 actualizaciones de warmup lineal, LR constante despues, coeficiente KL 0,01 (estimador k3), alpha STRIDE 1 |
| Datos de entrenamiento | 2.048 preguntas (mismo split que ejecuciones STRIDE anteriores), 4 epocas planificadas, semilla 42 |
| Modo de razonamiento | Nonthinking forzado (`enable_thinking=False` en la plantilla de chat) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only de la familia Qwen3 en su variante Instruct de julio de 2025, fijado a una revision concreta mediante SHA. El LoRA cubre los modulos de proyeccion de atencion (query, key, value, output) y los de la MLP (gate, up, down), con rank 16, alpha 32 y dropout 0, sin sesgo. No se modifica el tokenizer ni la plantilla de chat del modelo base, y el adaptador se inicializa desde cero (no es continuacion de un adaptador anterior).

El entrenamiento usa STRIDE con un credito de diversidad por paso local no negativo sobre los tokens de razonamiento elegibles, y GRPO para la parte de politica; el bonus de diversidad de STRIDE no se usa dentro de GRPO y su alpha (1) es independiente del alpha del LoRA (32). La configuracion busca estabilidad: tasa de aprendizaje pico de 2e-5 con 10 actualizaciones de warmup lineal (2e-6 en la actualizacion 1, 2e-5 en la 10) y despues constante, mas un coeficiente KL de 0,01 que penaliza la deriva respecto a la politica base congelada usando el estimador k3 original de GRPO (`expm1(log_p_ref - log_p_policy) - (log_p_ref - log_p_policy)`), agregado sobre el mismo denominador global de tokens generados que la perdida de politica. El autor advierte que esta implementacion k3 no incluye correccion por ratio de importancia y no pretende ser un gradiente insesgado de la KL inversa exacta.

El presupuesto de datos es de 2.048 preguntas, con un lote global de prompt de 64 preguntas y ocho rollouts por pregunta (512 respuestas por actualizacion), lo que da 32 actualizaciones por epoca y 128 actualizaciones planificadas en 4 epocas. El contexto de prompt mas respuesta se limita a 8.192 tokens. Cada checkpoint se publica en un commit separado del Hub con manifiesto SHA256, y `latest-resume/` incluye el estado del optimizador Adam, las RNG por rango, el adaptador correspondiente y el contrato cientifico original para reanudar el entrenamiento con la misma topologia de cuatro aprendices. El codigo de entrenamiento no se publica.

## Capacidades

- Generacion de texto orientada a resolucion de problemas matematicos, que es el unico dominio de entrenamiento declarado (tag `math`).
- Razonamiento en modo nonthinking: la plantilla de chat debe invocarse con `enable_thinking=False`, tanto en entrenamiento como en inferencia.
- Adaptador portable para inferencia sobre el modelo base fijado; puede cargarse con `PeftModel.from_pretrained` en modo no entrenable.
- Reentrenamiento del propio adaptador con `is_trainable=True` y un optimizador nuevo.
- Reanudacion exacta del entrenamiento original si se dispone de los ficheros `state_NNN` de optimizador y RNG, el manifiesto, el contrato de entrenamiento y la topologia de cuatro aprendices descrita en `latest-resume/RESUME.md`.
- Trazabilidad de checkpoints: indice con paso de optimizador, fraccion de epoca completada, tasa de aprendizaje, semilla, hash del dataset y manifiestos verificables.
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso explicito: no disponible (el modo thinking esta desactivado por diseno).
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: el repositorio permite reproducir un experimento concreto de STRIDE + GRPO sobre un modelo de ~4B, comparando checkpoints intermedios y el efecto del warmup y la penalizacion KL de 0,01 sobre la estabilidad del entrenamiento.
- Auditoria de tecnicas de RL: cada `checkpoint-NNNNNN/` incluye metadatos (learning rate, schedule, ajustes KL, tamano del grupo de rollouts, lote de prompt, epoca, semilla y hash del dataset) y manifiesto SHA256, lo que facilita verificar que el artefacto publicado corresponde a la configuracion declarada.
- Generacion de datos sinteticos de matematicas: el adaptador puede usarse para producir resoluciones de problemas con la plantilla nonthinking y servir como generador de candidatos en un pipeline posterior de filtrado o verificacion por un modelo mayor.
- Punto de partida para fine-tuning adicional: al ser un adaptador PEFT entrenable, un equipo puede continuar el ajuste sobre su propio corpus de problemas matematicos sin reentrenar el modelo base completo.
- Despliegue en hardware de gama de consumo para experimentos: al ser un LoRA de 0,4 GB sobre un base de 4B, se puede servir en una unica GPU de consumo con cuantizacion posterior del modelo fusionado, siempre que la licencia del base lo permita.
- Evaluacion de degradacion por modo nonthinking: util para estudiar que se pierde al desactivar el razonamiento extendido en tareas de matematicas, dado que el entrenamiento se hizo exclusivamente sin thinking.
- Reproducibilidad y control de versiones de modelos: el pin del base (`cdbee75f17c01a7cc42f958dc650907174af0554`) y los commits inmutables por checkpoint sirven como ejemplo de practica de trazabilidad en artefactos de RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card lo explicita: no se hace ninguna afirmacion de evaluacion ni de superioridad, y advierte que obtener la respuesta final correcta no verifica cada paso intermedio de la demostracion.

## Requisitos de hardware

- El adaptador por si solo no es ejecutable: requiere cargar `Qwen/Qwen3-4B-Instruct-2507` como modelo base.
- VRAM estimada para inferencia en bfloat16 con el modelo base de ~4B: aproximadamente 8-9 GB solo para pesos, con un margen practico de 10-12 GB contando cache KV y overhead de runtime.
- VRAM estimada si se fusiona el adaptador y se cuantiza a 8 bits: en torno a 5-6 GB; a 4 bits, en torno a 3-4 GB (estimaciones a partir del tamano de parametros, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con 12 GB o mas para bf16 (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090, L4, A10); para cuantizacion de 4-8 bits bastan GPUs de 6-8 GB.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB o superiores en bf16, y en tarjetas de 6-8 GB si se cuantiza el modelo fusionado.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada por el autor), vLLM o TGI tras fusionar el adaptador con el modelo base, y llama.cpp u Ollama solo si se convierte el modelo fusionado a GGUF (no se publican pesos GGUF).
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- Almacenamiento: 0,4 GB de adaptadores mas el modelo base completo descargado aparte.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `stride-qwen3-4b-stabilized-2048-local_positive-20260916` | Adaptador LoRA sobre base de ~4B | 8.192 tokens en entrenamiento | Sin benchmarks publicados | No disponible | Publico en HuggingFace, 0 descargas |
| `Qwen/Qwen3-4B-Instruct-2507` (base sin adaptador) | ~4B | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada (consultar la model card del base) | Publico en HuggingFace |
| Adaptadores LoRA de matematicas sobre modelos de 3-4B (categoria) | ~3-4B | No disponible | No disponible | Variable segun autor | Multiples repositorios publicos; no se dispone de datos comparables verificados en esta busqueda |
| Qwen3-4B-Thinking-2507 (variante con razonamiento) | ~4B | No disponible | No disponible | No disponible en la informacion proporcionada | Publico en HuggingFace |

No se dispone de resultados de benchmarks comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros y disponibilidad; cualquier comparacion de calidad quedaria sin sustento numerico.

## Limitaciones y advertencias

- No hay evaluacion publicada: el autor declara explicitamente que no se hace ninguna afirmacion de superioridad ni de rendimiento.
- El entrenamiento podia estar incompleto en el momento de la publicacion: la model card indica que el numero real de checkpoints lo determina `checkpoint_index.json`, y que las epocas planificadas no implican que el entrenamiento haya terminado.
- El checkpoint "update zero" (adaptador inicial sin entrenar) tambien esta publicado en el repositorio, por lo que es facil cargar por error un adaptador sin ajuste.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor y sin verificar la licencia del modelo base.
- Idiomas no declarados: el unico dominio confirmado es la resolucion de problemas matematicos; el comportamiento fuera de ese dominio no esta caracterizado.
- Modo nonthinking obligatorio: usar la plantilla por defecto con thinking activado produce una discrepancia con las condiciones de entrenamiento, desviacion que el autor senala como especialmente critica en Qwen3-1.7B.
- La penalizacion KL usa el estimador k3 original sin correccion por ratio de importancia; el propio autor advierte que no es un gradiente insesgado de la KL inversa exacta.
- Riesgo de alucinacion y de razonamiento incorrecto: el autor recuerda que una respuesta final correcta no verifica cada paso intermedio.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible.
- Sin validacion por la comunidad: 0 descargas y 0 likes en el momento de la consulta, y el repositorio no incluye el codigo de entrenamiento, lo que limita la reproducibilidad completa fuera de la configuracion del autor.
- La reanudacion exacta exige ficheros de estado locales (optimizador y RNG), el mismo entorno, el mismo modelo base, los mismos datos y la topologia de cuatro aprendices; ampliar el numero de epocas requiere el flag `--allow-epoch-extension`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeep123/stride-qwen3-4b-stabilized-2048-local_positive-20260916
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Revision fijada del modelo base: `cdbee75f17c01a7cc42f958dc650907174af0554` en el repositorio del base
- Indice de checkpoints: `checkpoint_index.json` dentro del repositorio
- Carpeta de reanudacion: `latest-resume/` (incluye `latest_resume.json` y `RESUME.md`) dentro del repositorio
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente resultados sin relacion (portales administrativos griegos).
