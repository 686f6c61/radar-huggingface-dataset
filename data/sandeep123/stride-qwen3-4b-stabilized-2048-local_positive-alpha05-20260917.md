# sandeep123/stride-qwen3-4b-stabilized-2048-local_positive-alpha05-20260917

## Resumen

STRIDE qwen3-4b-stabilized-2048-local_positive-alpha05 es un adaptador LoRA publicado en HuggingFace por el usuario sandeep123, entrenado mediante aprendizaje por refuerzo sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. No se trata de un modelo completo, sino de un adaptador PEFT que debe combinarse con el modelo base fijado en la revision `cdbee75f17c01a7cc42f958dc650907174af0554`. El objetivo declarado del experimento es investigar la estabilidad del entrenamiento con RL aplicando STRIDE (credito de diversidad de pasos local, no negativo) sobre los tokens de razonamiento elegibles, con alpha de STRIDE igual a 0.5.

El adaptador forma parte de una ablacion concreta: la variante `local_positive` con alpha 0.5, separada de otras ejecuciones previas del mismo autor sobre el mismo split de 2.048 preguntas. El entrenamiento esta planificado para 4 epocas, con un batch global de 64 preguntas y 8 rollouts por pregunta (512 respuestas por actualizacion), lo que da 32 actualizaciones por epoca y 128 actualizaciones planificadas. El contexto de prompt mas respuesta esta limitado a 8.192 tokens y la semilla es 42. El autor indica explicitamente que no se hace ninguna afirmacion de evaluacion ni de superioridad.

La relevancia del repositorio es fundamentalmente metodologica: publica cada adaptador de actualizacion del optimizador (incluida la actualizacion cero, sin entrenar), con pesos PEFT en safetensors, configuracion del adaptador, tokenizador, plantilla de chat, metadatos de entrenamiento y un manifiesto SHA256 por checkpoint. Ademas, el modelo se entrena con `enable_thinking=False`, por lo que la procedencia "nonthinking" es obligatoria en inferencia. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con adaptador LoRA (PEFT); el repositorio no contiene el modelo base |
| Parametros totales | 4.000 millones aprox. en el modelo base Qwen3-4B-Instruct-2507; el adaptador LoRA anade un conjunto reducido de parametros entrenables (rango 16) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens durante el entrenamiento (limite conjunto de prompt + respuesta); la longitud nativa del modelo base no se detalla en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base con el que se combine) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no la especifica; el modelo base Qwen3-4B-Instruct-2507 tiene licencia propia que no se detalla en la informacion proporcionada) |
| Formato de pesos | Safetensors (PEFT/LoRA); incluye tokenizador, plantilla de chat, metadatos y manifiesto SHA256 por checkpoint |

Parametros adicionales del adaptador y del entrenamiento:

| Parametro | Valor |
|---|---|
| Libreria | peft |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout LoRA | 0 |
| Sesgo LoRA | Ninguno |
| Modulos objetivo | q, k, v, o, gate, up, down |
| Alpha de STRIDE | 0.5 |
| Coeficiente KL | 0.01 (estimador k3 de GRPO original, sin correccion de ratio de importancia) |
| Learning rate maximo | 2e-5, con 10 actualizaciones de warmup lineal y despues constante (actualizacion 1: 2e-6; actualizacion 10: 2e-5) |
| Batch de prompts | 64 preguntas, 8 rollouts cada una (512 respuestas por actualizacion) |
| Actualizaciones | 32 por epoca, 128 planificadas (4 epocas) |
| Dataset de entrenamiento | Split de 2.048 preguntas (mismo que ejecuciones previas) |
| Semilla | 42 |
| Modo de razonamiento | Nonthinking (`enable_thinking=False`) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4.000 millones de parametros. Sobre el se entrena un adaptador LoRA con rango 16, alpha 32, dropout 0 y sin sesgo, aplicado a los modulos de proyeccion q, k, v y o, ademas de gate, up y down. El adaptador se inicializa desde cero a partir del modelo base fijado, y no es la continuacion de un adaptador previamente entrenado.

El algoritmo de RL es una variante de GRPO con STRIDE: se anade un credito de diversidad de pasos local y no negativo sobre los tokens de razonamiento elegibles, con alpha de STRIDE 0.5. La penalizacion KL tiene coeficiente 0.01 y se calcula contra la politica base inicial congelada mediante el estimador k3 (`expm1(log_p_ref - log_p_policy) - (log_p_ref - log_p_policy)`), agregado sobre el mismo denominador global de tokens generados que la perdida de politica. El autor aclara que se trata de la implementacion original de k3 sin correccion de ratio de importancia y que no se reclama un gradiente insesgado de KL inversa exacta.

El entrenamiento planificado cubre 4 epocas sobre 2.048 preguntas, con contexto limitado a 8.192 tokens, semilla 42 y un esquema de learning rate de 2e-5 con 10 actualizaciones de warmup lineal indexadas por actualizaciones absolutas completadas (lo que permite reanudar sin reiniciar el warmup). Cada carpeta `checkpoint-NNNNNN/` es inmutable e incluye pesos PEFT en safetensors, configuracion del adaptador, tokenizador, plantilla de chat, metadatos y manifiesto SHA256; `checkpoint_index.json` registra el paso del optimizador y la fraccion de epoca completada. El repositorio tambien publica `latest-resume/` con estado del optimizador Adam, RNG por rango, el adaptador correspondiente, el contrato cientifico original y el inventario de hashes, ademas del estado inicial en el paso cero y los puntos de parada controlada. El codigo de entrenamiento se conserva por separado y no se publica.

## Capacidades

- Generacion de texto y resolucion de problemas matematicos: el adaptador esta entrenado especificamente sobre un split de 2.048 preguntas de matematicas, con RL orientado a tokens de razonamiento.
- Razonamiento en modo no thinking: el entrenamiento renderiza explicitamente `enable_thinking=False` y la procedencia nonthinking es obligatoria; en inferencia debe usarse el mismo keyword.
- Respuestas en un unico paso sin bloque de pensamiento separado, lo que reduce la longitud de salida y la latencia frente a variantes con modo thinking.
- Preservacion del tokenizador y de la plantilla de chat originales de Qwen3-4B-Instruct-2507, sin modificaciones.
- Hereda las capacidades del modelo base Qwen3-4B-Instruct-2507 (generacion de texto, instrucciones generales), aunque el entrenamiento se centra en matematicas.
- Soporte de tool calling / function calling: no disponible como capacidad especifica del adaptador; dependera del modelo base.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el RL actua sobre tokens de razonamiento elegibles, pero el autor no afirma mejoras en tareas de agente.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidad especial: publicacion de todos los adaptadores de actualizacion del optimizador, con estado de reanudacion completo (Adam, RNG por rango) y manifiestos verificables.

## Casos de uso

- Investigacion en RL para modelos de lenguaje: el repositorio permite reproducir y auditar una ejecucion concreta de GRPO con STRIDE, comparando la ablacion `local_positive` con alpha 0.5 frente a otras variantes del mismo autor sobre el mismo split.
- Estudio de estabilidad de politicas con regularizacion KL: la publicacion de cada actualizacion del optimizador, junto con el coeficiente KL 0.01 y el estimador k3, permite analizar la deriva respecto a la politica base congelada paso a paso.
- Generacion de soluciones matematicas en modo directo: al operar con `enable_thinking=False`, el adaptador produce respuestas sin bloque de pensamiento, adecuado para pipelines por lotes donde interesa una salida corta y predecible.
- Creacion de datos sinteticos de razonamiento matematico: las 512 respuestas por actualizacion (64 prompts x 8 rollouts) y los checkpoints intermedios permiten estudiar la evolucion cualitativa de las soluciones generadas a lo largo del entrenamiento.
- Reanudacion y ampliacion de experimentos: `latest-resume/` incluye estado de Adam, RNG por rango y contrato cientifico, lo que permite continuar el entrenamiento con la misma topologia de cuatro learners; extender mas alla de 4 epocas requiere `--allow-epoch-extension`.
- Auditoria de reproducibilidad: cada checkpoint tiene su propio commit en el Hub, manifiesto SHA256 y metadatos con learning rate, warmup, ajustes KL, tamano de grupo de rollouts, batch de prompts, epoca, semilla y hash del dataset.
- Evaluacion comparativa de inferencia con y sin adaptador: al ser un adaptador PEFT portable, puede cargarse sobre el modelo base fijado con `PeftModel.from_pretrained` y compararse directamente contra el modelo base sin adaptador.
- Despliegue ligero en entornos con recursos limitados: al ser un modelo de 4.000 millones de parametros mas un adaptador de rango 16, es viable en GPUs de consumo con cuantizacion, siempre que se combine con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se realiza ninguna afirmacion de evaluacion ni de superioridad, y que las respuestas finales correctas no verifican cada paso intermedio de la demostracion. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.

## Requisitos de hardware

- Inferencia en bf16: el modelo base de 4.000 millones de parametros ocupa aproximadamente 8 GB de pesos, mas cache KV; se recomienda un minimo de 12 GB de VRAM para contexto moderado y 16-24 GB para contextos cercanos al limite de entrenamiento (8.192 tokens).
- Inferencia en cuantizacion de 4 bits: aproximadamente 2,5-3 GB de pesos, viable en GPUs de consumo con 6-8 GB de VRAM; el adaptador LoRA puede cargarse sobre el modelo base cuantizado segun el soporte de la libreria.
- Cuantizacion de 8 bits: aproximadamente 4,5 GB de pesos.
- GPUs de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 (24 GB, permite bf16 con contexto amplio). GPUs de 8 GB solo con cuantizacion agresiva.
- GPUs de centro de datos: A100 40/80 GB, H100 80 GB, L40S; sobredimensionadas para un modelo de este tamano, utiles para servir muchas replicas o lotes grandes.
- Opciones de despliegue: transformers + peft (carga directa del adaptador, tal como documenta el autor), vLLM (soporte de LoRA mediante el adaptador o fusionandolo en el modelo base), TGI, llama.cpp/Ollama (requiere fusionar el adaptador en el modelo base y convertir a GGUF).
- Reanudacion del entrenamiento: requiere el estado completo en `latest-resume/` (Adam, RNG por rango, adaptador correspondiente, contrato cientifico y hashes), el mismo entorno, modelo base, datos y topologia de cuatro learners.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| STRIDE qwen3-4b-stabilized-2048-local_positive-alpha05 | 4.000 M aprox. (base) + adaptador LoRA r=16 | 8.192 tokens en entrenamiento | No disponible | Safetensors PEFT | Adaptador de investigacion; 0 descargas; sin benchmarks publicados |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4.000 M aprox. | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Safetensors | Modelo base fijado en la revision `cdbee75f17c01a7cc42f958dc650907174af0554`; necesario para usar el adaptador |
| Otras variantes STRIDE del mismo autor | 4.000 M aprox. (base) + adaptador LoRA | 8.192 tokens en entrenamiento | No disponible | Safetensors PEFT | Ablaciones sobre el mismo split de 2.048 preguntas; el presente repositorio contiene solo `local_positive` con alpha 0.5 |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este adaptador frente a alternativas de la misma categoria. La informacion proporcionada no incluye especificaciones de licencia, idiomas ni contexto nativo del modelo base, por lo que la comparativa se limita a parametros estructurales y de formato.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y cargar el modelo base Qwen/Qwen3-4B-Instruct-2507 en la revision `cdbee75f17c01a7cc42f958dc650907174af0554`; mezclar revisiones distintas invalida la reproducibilidad.
- Modo no thinking obligatorio: en inferencia debe pasarse `enable_thinking=False` en la plantilla de chat. El autor advierte de forma explicita que esto es especialmente critico para Qwen3-1.7B, cuya plantilla por defecto activa el modo thinking.
- Sin benchmarks publicados: el autor no reclama ninguna mejora de rendimiento ni superioridad frente al modelo base u otras variantes; no se han verificado capacidades en tareas externas al split de matematicas usado.
- Verificacion incompleta del razonamiento: una respuesta final correcta no garantiza que cada paso intermedio de la demostracion sea correcto, lo que limita su uso como fuente de datos de razonamiento sin supervision posterior.
- Sesgos: no disponibles; no se ha publicado analisis de sesgos ni de comportamiento fuera del dominio matematico.
- Riesgo de alucinacion: inherente al modelo base y no evaluado en este repositorio; al estar entrenado sobre un dominio concreto (matematicas), el comportamiento fuera de ese dominio puede degradarse.
- Contexto limitado durante el entrenamiento: la ventana conjunto de prompt y respuesta es de 8.192 tokens; el comportamiento con secuencias mas largas no esta documentado.
- Idiomas: no declarados; el comportamiento multilingue no esta verificado.
- Licencia: no disponible en la model card. Antes de cualquier uso comercial debe verificarse la licencia del modelo base y la del propio adaptador; la ausencia de licencia declarada impide asumir permisos de uso.
- Estado del entrenamiento: las 4 epocas son planificadas, no necesariamente completadas; la finalizacion se determina por las entradas reales de `checkpoint_index.json`, no por el plan.
- Publicacion incompleta del pipeline: el codigo de entrenamiento no se publica; solo se publican los adaptadores, los metadatos y el estado de reanudacion. La continuacion exacta exige los ficheros `state_NNN` de optimizador y RNG locales y la misma topologia de cuatro learners.
- Restricciones de reanudacion: extender el entrenamiento mas alla de 4 epocas requiere `--allow-epoch-extension` y el resto de campos del contrato cientifico deben permanecer identicos.
- Madurez y adopcion: 0 descargas y 0 likes, sin validacion externa conocida; la busqueda web no devolvio informacion adicional sobre el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeep123/stride-qwen3-4b-stabilized-2048-local_positive-alpha05-20260917
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Revision fijada del modelo base: `cdbee75f17c01a7cc42f958dc650907174af0554`
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria transformers: https://github.com/huggingface/transformers
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo (los resultados devueltos no guardan relacion con el modelo).
