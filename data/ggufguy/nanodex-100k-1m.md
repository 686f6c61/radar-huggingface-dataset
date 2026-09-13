# GGUFGuy/nanodex-100k-1m

## Resumen

nanodex-100k-1m es un modelo de lenguaje decoder-only de 100.064 parametros entrenado desde cero (pre-trained from scratch) por el usuario GGUFGuy sobre el dataset fineweb-edu. Se publica como artefacto de investigacion a pequena escala: su proposito declarado no es servir como asistente, sino hacer observable y reproducible el proceso completo de preentrenamiento de un transformer, desde la inicializacion aleatoria hasta la generacion de texto. El nombre del repositorio resume sus dos cifras clave: en torno a 100.000 parametros y aproximadamente un millon de tokens vistos durante el entrenamiento (983.040 en concreto).

Arquitectonicamente es un `LlamaForCausalLM` estandar reducido en anchura y profundidad: 2 capas, hidden size 32, 2 cabezas de atencion con 1 cabeza KV (GQA), MLP con activacion SiLU, RMSNorm, rotary position embeddings (RoPE), embeddings atados (tied embeddings) y ausencia de biases. La longitud de contexto es de 512 tokens y el vocabulario es un BPE propio de 2.048 entradas entrenado sobre fineweb-edu.

Su relevancia es fundamentalmente didactica y metodologica: es un caso limite reproducible para estudiar como escala un transformer desde cero, para probar infraestructura de entrenamiento e inferencia a coste practicamente nulo y para disponer de un baseline minimo en experimentos de escalado o de tokenizacion. No debe confundirse con un modelo de proposito general: el propio autor advierte que a este presupuesto de parametros y tokens el modelo solo aprende formas de palabras, colocaciones frecuentes y algo de sintaxis, y que su salida no es factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`LlamaForCausalLM`): SiLU MLP, RMSNorm, RoPE, grouped-query attention (GQA), tied embeddings, sin biases |
| Parametros totales | 100.064 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | odc-by (Open Data Commons Attribution) |
| Formato de pesos | safetensors (libreria transformers) |
| Hidden size | 32 |
| Capas | 2 |
| Cabezas de atencion | 2 (KV: 1) |
| Tamano de FFN | 147 |
| Vocabulario | 2.048 (BPE propio entrenado sobre fineweb-edu) |
| Dataset de entrenamiento | HuggingFaceFW/fineweb-edu |
| Tokens vistos | 983.040 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue la plantilla clasica de los transformers decoder-only modernos, la misma familia que Llama, pero escalada hacia abajo hasta el presupuesto de 100.064 parametros. Usa pre-normalizacion con RMSNorm, activacion SiLU en el MLP (con tamano de FFN 147), rotary position embeddings para codificar posicion, grouped-query attention con 2 cabezas de consulta y una unica cabeza de clave/valor, y embeddings de entrada y salida atados, lo que reduce el recuento de parametros al reutilizar la matriz de vocabulario. No emplea biases en las capas lineales. Con hidden size 32 y solo 2 capas, se trata de un modelo extremadamente estrecho y poco profundo, disenado explicitamente para que el ciclo completo de preentrenamiento sea rapido y observable.

El entrenamiento se realizo desde cero (sin inicializacion a partir de otro checkpoint) sobre fineweb-edu, usando el Space HyperDex Trainer. Se registran 15 pasos con 65.536 tokens por paso, lo que suma 983.040 tokens vistos en total, con optimizador AdamW (betas 0,9 y 0,95, weight decay 0,1, gradient clipping 1,0) y un scheduler de learning rate con warmup del 2 por ciento y decaimiento coseno hasta el 10 por ciento del valor maximo, con pico de 5e-03. La perdida final reportada es 6,8223 (perplejidad 918,1). No se documenta ninguna fase de ajuste por instrucciones, RLHF, DPO ni entrenamiento supervisado adicional: es exclusivamente un modelo preentrenado en lenguaje crudo. El tiempo de pared indicado es de 0,0 minutos, un dato que por su redondeo no resulta informativo.

## Capacidades

- Generacion de texto autoregresiva basica: el modelo escribe secuencias token a token y produce formas de palabras, colocaciones frecuentes del ingles y fragmentos de sintaxis incipiente.
- Modelado de lenguaje crudo: puede usarse para calcular likelihoods o perplejidad sobre texto en ingles con su tokenizador BPE de 2.048 entradas.
- No dispone de razonamiento, matematicas ni generacion de codigo fiable a este presupuesto de parametros y tokens.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes, planificacion ni razonamiento multi-paso.
- Sin capacidades multilingues: la model card declara unicamente ingles y el vocabulario se entreno sobre un corpus en ingles.
- Sin modo de pensamiento (thinking mode), vision, audio ni ninguna otra modalidad.
- Sin ajuste por instrucciones: no sigue ordenes ni mantiene un formato de dialogo.
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles (tags `text-generation-inference` y `endpoints_compatible`).

## Casos de uso

- Docencia y divulgacion sobre preentrenamiento: permite mostrar en directo, con un repositorio de menos de un megabyte, como un transformer pasa de ruido a texto con estructura de palabras en 15 pasos de entrenamiento.
- Prueba de humo (smoke test) en pipelines de entrenamiento: por su tamano, sirve para validar en segundos que el cargador de datos, el tokenizador, el scheduler y el guardado de checkpoints funcionan antes de lanzar un run grande.
- Validacion de herramientas de exportacion e inferencia: es un caso de prueba barato para verificar conversiones a safetensors, ONNX o GGUF y para comprobar que un servidor de inferencia arranca y responde con la arquitectura `llama`.
- Pruebas de infraestructura de serving: al caber holgadamente en CPU, permite medir latencia, batching y comportamiento de TGI o de endpoints compatibles sin consumir GPU ni presupuesto de computo.
- Experimentacion con tokenizacion: su vocabulario BPE de 2.048 entradas entrenado sobre fineweb-edu es un banco de pruebas controlado para estudiar como afectan el tamano de vocabulario y la segmentacion a un modelo muy pequeno.
- Baseline de ablacion en estudios de escalado: cualquier variacion de arquitectura, learning rate o composicion de datos puede compararse contra este punto de referencia de 100.064 parametros con una perdida final conocida de 6,8223.
- Generacion de texto de relleno no factual para maquetas y pruebas de interfaz: al no producir afirmaciones fiables, es un candidato seguro para poblar pantallas, probar truncados de UI o hacer fuzzing de pipelines de texto.
- Investigacion en interpretabilidad de modelos diminutos: con 2 capas y hidden size 32, es viable inspeccionar activaciones y atenciones de forma exhaustiva, algo inviable en modelos grandes.
- Demos en navegador o en dispositivos sin GPU: sus pesos ocupan cientos de kilobytes, por lo que puede ejecutarse en cliente o en hardware muy limitado con fines demostrativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de entrenamiento, que se recogen a continuacion a modo de referencia y no como evaluacion comparativa:

| Metrica de entrenamiento | Valor |
|---|---|
| Perdida final | 6,8223 |
| Perplejidad final | 918,1 |
| Tokens vistos | 983.040 |
| Pasos | 15 |
| Tokens por paso | 65.536 |
| Learning rate pico | 5e-03 |
| Tiempo de pared | 0,0 min (dato redondeado, no informativo) |

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 MB para los pesos en precision completa (100.064 parametros x 4 bytes, aproximadamente 400 KB; unos 200 KB en fp16 y unos 100 KB en int8). El cache KV es igualmente despreciable con contexto de 512 tokens, 2 capas y una sola cabeza KV.
- GPU recomendadas: ninguna en particular; el modelo no requiere GPU. Cualquier GPU consumer (RTX 3060, RTX 4090, integradas) lo ejecuta sin esfuerzo, y la CPU es suficiente.
- Cabe en GPU consumer: si, en cualquier GPU consumer e incluso en entornos sin GPU, en navegador o en hardware embebido, dado el tamano de los pesos.
- Opciones de despliegue: transformers (PyTorch) de forma nativa segun el ejemplo de la model card; text-generation-inference y endpoints compatibles, segun los tags del repositorio. No se publican artefactos GGUF, ONNX, AWQ ni GPTQ, aunque la arquitectura `llama` es soportada por las herramientas estandar de conversion.
- Latencia y throughput: no disponibles. No se documentan mediciones; por el numero de parametros y de capas, el coste por token es del orden de microsegundos a pocos milisegundos en CPU en modo single-stream, pero esta cifra es una estimacion por tamano y no un dato publicado.

## Comparativa con modelos similares

No se dispone de comparativas publicadas en la informacion proporcionada, y la busqueda web realizada no devolvio resultados relacionados con el modelo. A continuacion se situa el modelo frente a referencias habituales de la misma categoria (modelos diminutos de codigo abierto); los datos de las alternativas proceden de conocimiento general publico y no se han verificado en la busqueda de esta ficha, por lo que conviene contrastarlos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Observaciones |
|---|---|---|---|---|---|
| nanodex-100k-1m | 100.064 | 512 | odc-by | HuggingFace, safetensors | Artefacto de investigacion; sin benchmarks; sin ajuste por instrucciones |
| SmolLM-135M | en torno a 135 millones | 2.048 | Apache-2.0 | HuggingFace | Entrenado sobre un corpus mucho mayor; uso generalista; datos a verificar |
| TinyLlama-1.1B | en torno a 1.100 millones | 2.048 | Apache-2.0 | HuggingFace | Ordenes de magnitud superior en parametros y tokens; datos a verificar |
| nanoGPT (Karpathy) | en torno a 124 millones (configuracion GPT-2) | 1.024 | MIT | Repositorio de codigo | Referencia educativa de preentrenamiento desde cero, caracter a caracter; datos a verificar |

La diferencia relevante no es de rendimiento, sino de proposito: las alternativas citadas son modelos entrenados para ser utiles, mientras que nanodex-100k-1m se limita a hacer visible el mecanismo de preentrenamiento con un presupuesto de computo minimo.

## Limitaciones y advertencias

- No es un asistente util: el propio autor lo describe como un artefacto de investigacion a pequena escala que aprende formas de palabras, colocaciones comunes y algo de sintaxis.
- Riesgo de alucinacion total: el modelo no tiene conocimiento factual y genera texto plausible sin base en hechos desde el primer token. No debe usarse para responder preguntas ni para producir contenido que se presente como informacion.
- Calidad muy limitada: la perplejidad final reportada es 918,1 con una perdida de 6,8223 sobre un total de 983.040 tokens vistos, un presupuesto de entrenamiento muy reducido.
- Contexto corto: 512 tokens, insuficiente para conversaciones multi-turno o documentos extensos.
- Monolingue: solo ingles declarado; el vocabulario BPE de 2.048 entradas fragmenta en exceso texto en otros idiomas.
- Sesgos del corpus: fineweb-edu es un subconjunto filtrado con criterio educativo del raspado web en ingles, por lo que hereda sus sesgos de dominio, idioma y representacion.
- Sin ajuste por instrucciones ni alineacion: no hay RLHF ni DPO, de modo que no respeta formatos, no rechaza peticiones nocivas de forma fiable y no mantiene rol de asistente.
- Licencia odc-by: es una licencia disenada para datos, no especifica para pesos de modelos, y exige atribucion. Conviene revisar su aplicabilidad antes de cualquier uso comercial, ya que puede generar incertidumbre juridica.
- Sin validacion externa: 0 descargas y 0 likes, sin benchmarks publicos ni evaluaciones de terceros.
- Metadatos atipicos: el repositorio figura creado el 2026-09-12, una fecha posterior a la habitual en los modelos publicados, y el tiempo de pared del entrenamiento aparece como 0,0 minutos, por lo que ambos campos no deben tomarse como fiables.
- Tamano de repositorio reportado como 0.0 GB: se trata de un valor redondeado que no refleja el peso real de los ficheros.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/GGUFGuy/nanodex-100k-1m
- Perfil del autor: https://huggingface.co/GGUFGuy
- Dataset de entrenamiento (fineweb-edu): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Space de entrenamiento HyperDex Trainer: https://hugging-science-hyperdex-trainer.hf.space/
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada; los resultados obtenidos no guardaban relacion con el modelo.
