# sachk0/Qwen3.8-Flash-Next-T3a392-Ampere-SM80-46GiB-GPU-Weights

## Resumen

Qwen3.8-Flash-Next T3a392 es una cuantización mixta de 2/3/4 bits del modelo Qwen3.8-Flash-Next-FP8, publicada por el usuario sachk0. El trabajo se centra en los expertos enrutados de una arquitectura Mixture-of-Experts: se conservan los 512 expertos por capa y se comprimen mediante una codificación en anillo (ring-coded trellis) que reduce el peso de los expertos a unos 39,2 GiB, con un total de pesos cargados en GPU medido de 46,16 GiB. El objetivo declarado es hacer viable el despliegue de un modelo de 53.903 millones de parámetros en GPUs Ampere de clase 64 GiB (SM80), en concreto una CMP 170HX.

La relevancia del artefacto es doble. Por un lado, demuestra que es posible mantener la calidad del modelo original con una divergencia KL reducida (0,090 frente a 0,168 de la cuantización AutoRound de referencia) en una GPU de minería reconvertida. Por otro, su model card es inusualmente rigurosa: publica resultados de GPQA Diamond (179/198, 90,40 %), latencias, capacidad de KV y registros de medición reproducibles, además de retirar explícitamente cifras anteriores por considerarlas medidas en configuraciones inestables.

No obstante, conviene subrayar que no se trata de un modelo nuevo ni de un lanzamiento oficial de Qwen: es una cuantización de terceros con licencia heredada qwen-community-license-1.0, distribuida en formato trellis propietario y pensada para un stack de servicio muy concreto (vLLM con soporte trellis). La información sobre idiomas, datos de entrenamiento y benchmarks completos no está disponible en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (hereda la del modelo base Qwen3.8-Flash-Next; detalles internos no disponibles) |
| Parametros totales | 53.903.345.776 (~53,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (límite nativo por petición); pool KV agregado de 906.051 tokens en GPU de 64 GiB |
| Tipos de cuantizacion | Mixta 2/3/4 bits con trellis ring-coded en los expertos enrutados; capas densas reutilizadas de AutoRound 3bpw; PLE original en BF16 residente en SSD |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como "other") |
| Formato de pesos | safetensors (librería trellis); repo de 155,1 GB |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-Flash-Next, un transformer con mezcla de expertos (MoE) del que se conservan los 512 expertos por capa. La contribución de esta ficha no es el entrenamiento, sino la cuantización post-entrenamiento: los expertos enrutados se comprimen con una codificación trellis en anillo a 2/3/4 bits mixtos, mientras que las capas densas se toman prestadas de `klee100/Qwen3.8-Flash-Next-AutoRound-3bpw-MTP`. El PLE (probablemente "Parallel Layer Experts" o un componente equivalente del modelo base) se mantiene en BF16 sobre SSD y no se carga en VRAM.

El pipeline de cuantización es AutoRound (referenciado en los tags y en el paper arXiv:2210.17323), con decodificación especulativa MTP (multi-token prediction) de profundidad 3 y un vocabulario de borrador de 65.536 tokens. La model card reporta una fidelidad teacher-forced con KL de 0,090 frente a un profesor FP32, aproximadamente la mitad de la divergencia de la variante AutoRound 3bpw (0,168). No se dispone de información sobre el dataset de calibración, el número de tokens de entrenamiento del modelo base ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento de largo alcance: la model card documenta respuestas de hasta 124.295 tokens generados, incluyendo razonamiento, dentro de la ventana de 262.144 tokens.
- Razonamiento científico y de nivel experto: evaluado en GPQA Diamond con un 90,40 % de acierto, lo que sugiere capacidad sólida en preguntas de posgrado en física, química y biología.
- Modo "thinking" o razonamiento extendido: el autor menciona "xhigh reasoning" como configuración de muestreo, lo que implica un modo de razonamiento ampliado.
- Decodificación especulativa MTP: integrada en el stack de servicio, con 1,71 tokens de borrador aceptados por paso en un stream.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento científico de alta exigencia: el modelo es adecuado para responder preguntas de nivel posgrado (GPQA Diamond) con cadenas de razonamiento largas, gracias a su ventana de 262.144 tokens y a la baja penalización de cuantización medida (KL 0,090).
- Análisis de documentos extensos: con un pool KV de 906.051 tokens en una GPU de 64 GiB, puede procesar varios documentos largos en paralelo o un único documento de cientos de miles de tokens, útil para revisión de contratos, literatura científica o expedientes.
- Servicio de inferencia en hardware de bajo coste: la cuantización está pensada para GPUs Ampere de 64 GiB (CMP 170HX), lo que permite desplegar un modelo de ~54B parámetros en hardware de segunda mano a un coste por token muy inferior al de una H100.
- Evaluación de cuantizaciones: el artefacto sirve como referencia metodológica para investigadores que quieran reproducir evaluaciones de fidelidad (KL teacher-forced) y de rendimiento (tok/s, step time) en modelos MoE cuantizados.
- Generación de código de contexto largo: aunque no hay benchmarks de código en la información disponible, el autor menciona pruebas con prompts de código de ~8K tokens y 1.024 tokens generados; el modelo puede integrarse en pipelines que requieran contexto amplio.
- Investigación sobre decodificación especulativa: la configuración MTP con vocabulario de borrador de 65.536 tokens y profundidad 3 es un caso de estudio para medir la aceptación de borradores en GPUs Ampere.
- Despliegue en entornos con VRAM limitada pero contexto largo: la separación entre pesos en GPU (46,16 GiB) y PLE en SSD permite reservar 14,6 GiB para KV y mantener 906.051 tokens de capacidad agregada.

## Benchmarks y rendimiento

| Benchmark | T3a392 | Modelo original (publicado) |
|---|---:|---:|
| GPQA Diamond (precisión) | 179/198 (90,40 %) | 91,7 % |
| GPQA Diamond con tope de 32.768 tokens | 159/198 (80,30 %) | no publicado |
| GPQA Diamond con tope de 98.304 tokens | 178/198 (89,90 %) | no publicado |
| KL teacher-forced vs. profesor FP32 | 0,090 | AutoRound 3bpw: 0,168 |
| Tokens generados por pregunta (media / mediana) | 15.224 / 8.673 | no publicado |
| Respuestas más largas | 124.295 tokens | no publicado |
| Respuestas con NaN o colapso | 0/198 | — |

| Métrica de servicio (CMP 170HX, 64 GiB) | Valor |
|---|---:|
| Pesos del modelo en GPU | 46,16 GiB |
| Pool KV en GPU | 14,6 GiB |
| Capacidad KV agregada | 906.051 tokens |
| Decodificación un stream | 166,5 tok/s |
| Tiempo de paso un stream | 16,29 ms |
| Decodificación cuatro streams (total) | 352,6 tok/s |
| Tiempo de paso cuatro streams | 30,64 ms |
| Prefill un stream | 3.073 tok/s |
| Tokens de borrador aceptados por paso (1 / 4 streams) | 1,71 / 1,70 |

El autor advierte que la comparación con el 91,7 % oficial no es una medida de la penalización de cuantización, ya que la referencia oficial no publica prompt, muestreo, agregación ni presupuesto de tokens, y una sola muestra por pregunta conlleva un ruido de ±2-3 puntos. Las cifras de velocidad se midieron con el reloj SM limitado a 1400 MHz y la tarjeta no está completamente desbloqueada, por lo que no son extrapolables a otras GPUs.

## Requisitos de hardware

- VRAM estimada para inferencia: 46,16 GiB de pesos en GPU más 14,6 GiB de pool KV, grafos, workspace y overhead de runtime; el autor indica que se requiere una GPU de clase 64 GiB.
- GPU recomendadas: NVIDIA CMP 170HX (74 SM GA100, 64 GiB HBM) es la plataforma medida; cualquier GPU Ampere SM80 con 64 GiB o más debería ser compatible en teoría, aunque no hay mediciones publicadas en A100 80GB, H100 ni RTX 4090.
- ¿Cabe en consumer GPU? No: 46,16 GiB de pesos exceden los 24 GiB de una RTX 4090 y los 48 GiB de una RTX A6000 queda justo por debajo del total requerido con KV. No hay datos de despliegue en GPUs de consumo.
- Opciones de despliegue: vLLM con soporte trellis (stack usado por el autor); no se mencionan llama.cpp, Ollama ni TGI, y el formato trellis probablemente no es compatible con ellos.
- Latencia y throughput: 166,5 tok/s en un stream (16,29 ms por paso) y 352,6 tok/s agregados en cuatro streams (30,64 ms por paso); prefill de 3.073 tok/s en un stream. El autor retiró cifras anteriores (127,35 tok/s y 316,13 tok/s) por haberse medido en una configuración inestable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| T3a392 (esta ficha) | 53,9 B | 262.144 | 2/3/4 bits trellis | qwen-community-license-1.0 | Hugging Face, 2.170 descargas |
| Qwen3.8-Flash-Next-FP8 (base) | 53,9 B | 262.144 | FP8 | qwen-community-license-1.0 | Hugging Face (oficial Qwen) |
| Qwen3.8-Flash-Next-AutoRound-3bpw-MTP | no disponible | 262.144 (heredado) | 3 bits AutoRound | qwen-community-license-1.0 | Hugging Face (klee100) |

La comparativa se limita a las variantes del mismo modelo base, ya que la información proporcionada no incluye datos de modelos competidores de otros fabricantes. Frente a la variante AutoRound 3bpw, T3a392 reduce el KL de 0,168 a 0,090 y, según el autor, iguala o supera su velocidad en el benchmark de replay emparejado. Frente al modelo FP8 original, T3a392 ocupa menos VRAM pero introduce una divergencia de distribución medible y depende de un runtime específico.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al heredar el modelo base, es previsible que arrastre los sesgos de Qwen3.8-Flash-Next, pero no hay documentación al respecto.
- Riesgo de alucinación: no cuantificado en la model card. El modo de razonamiento extendido con hasta 124.295 tokens generados aumenta la superficie de error y el coste por consulta.
- Limitaciones de contexto: el límite nativo por petición es de 262.144 tokens, pero el pool KV agregado (906.051 tokens) se reparte entre peticiones concurrentes; con ocho streams el contexto efectivo por petición se reduce.
- Restricciones de licencia: qwen-community-license-1.0 es una licencia "other" que puede imponer condiciones al uso comercial; es responsabilidad del usuario revisar el archivo LICENSE del repo antes de desplegar en producción.
- Dependencia de runtime: el formato trellis y el stack vLLM modificado no son estándar; la portabilidad a llama.cpp, Ollama o TGI no está documentada y probablemente no sea directa.
- Estabilidad: el autor documenta que una configuración de GPU no estándar produjo pasos de logits con NaN (unas 24 por hora de decodificación larga) que se manifestaban como salidas repetitivas; en ajustes de stock no se reprodujeron en 3,5 horas. Es un riesgo a vigilar en producción.
- Ruido de medición: los resultados de GPQA Diamond se basan en una muestra por pregunta con ±2-3 puntos de ruido; las cifras de velocidad se midieron en una tarjeta no desbloqueada y no son extrapolables.
- El PLE en BF16 reside en SSD, lo que introduce dependencia de almacenamiento y puede afectar a la latencia en el primer uso o bajo presión de caché.
- No hay información sobre idiomas soportados, tool calling, agentes ni capacidades multimodales, lo que limita la evaluación para esos casos de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sachk0/Qwen3.8-Flash-Next-T3a392-Ampere-SM80-46GiB-GPU-Weights
- Modelo base FP8: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Modelo base AutoRound 3bpw MTP: https://huggingface.co/klee100/Qwen3.8-Flash-Next-AutoRound-3bpw-MTP
- README oficial de Qwen3.8-Flash-Next (referencia del 91,7 % en GPQA Diamond): https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/812d96e10a0dd82b69d749e68693698cf6c36daa/README.md
- Registro de medición GPQA Diamond: https://github.com/sachk/qwen-flash-trellis/blob/master/benchmarks/gpqa-diamond-20261118.json
- Repositorio del proyecto trellis: https://github.com/sachk/qwen-flash-trellis
- Paper AutoRound: https://arxiv.org/abs/2210.17323
- Paper referenciado en los tags (trellis): https://arxiv.org/abs/2406.11235
