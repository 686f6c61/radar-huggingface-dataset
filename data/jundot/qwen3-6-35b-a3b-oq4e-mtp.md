# Jundot/Qwen3.6-35B-A3B-oQ4e-mtp

## Resumen

Qwen3.6-35B-A3B-oQ4e-mtp es una cuantizacion mixta en formato MLX del modelo Qwen/Qwen3.6-35B-A3B, un modelo de mezcla de expertos (MoE) multimodal de tipo vision-lenguaje desarrollado por el equipo Qwen de Alibaba. La cuantizacion la publica el usuario Jundot mediante la herramienta oQ (oMLX v0.8.0), que asigna precision por capas segun su sensibilidad medida en lugar de aplicar una cuantizacion uniforme. El checkpoint incluye el backbone de lenguaje, el codificador de vision y la cabeza de prediccion multi-token (MTP), con un total de 35.951.822.704 parametros y 3.000 millones de parametros activos por token.

El modelo base emplea una arquitectura hibrida que combina capas Gated DeltaNet con capas de atencion con compuertas (Gated Attention), una variante que busca reducir el coste computacional del contexto largo manteniendo la calidad del modelado. Al ser una cuantizacion, no introduce cambios arquitectonicos: su relevancia radica en permitir ejecutar un MoE multimodal de 35B parametros en hardware Apple Silicon con un peso efectivo de 4,925 bits por parametro y un tamano de almacenamiento de 20,614 GiB, lo que lo hace viable en equipos con memoria unificada de 32 GB o superior.

La ficha cubre exclusivamente lo que puede verificarse a partir de los metadatos de Hugging Face y la model card del autor. No se dispone de informacion sobre composicion del dataset de entrenamiento, proceso de alineacion ni resultados de benchmarks, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido con capas Gated DeltaNet y Gated Attention; incluye codificador de vision y cabeza MTP |
| Parametros totales | 35.951.822.704 (35,95B) |
| Parametros activos | 3B (aproximado, segun denominacion A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e mixta: affine 4-bit grupo 64 (91,838% de los pesos), affine 8-bit grupo 128 (0,359%), affine 8-bit grupo 64 (6,474%), BF16 (1,329%); media efectiva 4,925 bits/peso en el checkpoint completo y 4,786 bits/peso en el backbone de lenguaje |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), libreria mlx |
| Tamano del repositorio | 44,3 GB |
| Almacenamiento del checkpoint | 22,134 GB / 20,614 GiB |
| Desglose por componente | Backbone de lenguaje: 34,661B (20,738 GB); codificador de vision: 0,447B (0,893 GB); cabeza MTP: 0,845B (0,503 GB) |
| Modalidad | image-text-to-text |
| Fecha de creacion | 2026-07-02 |
| Ultima actualizacion | 2026-11-19 (recuantizado con oMLX 0.8.0) |
| Descargas | 29.346 |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un MoE multimodal con 35B parametros totales y 3B activos por token. La arquitectura combina dos tipos de capas: Gated DeltaNet, un mecanismo de estado recurrente lineal con compuertas que sustituye a la atencion clasica en parte de la red, y capas de Gated Attention convencionales. Este diseno hibrido persigue un coste de inferencia y memoria subcuadratico en la dimension de contexto, manteniendo la expresividad de la atencion completa en un subconjunto de capas. El checkpoint incluye ademas un codificador de vision (0,447B parametros) para entrada de imagenes y una cabeza de prediccion multi-token (MTP, 0,845B parametros) que permite decodificacion especulativa con varios tokens candidatos por paso.

Sobre el proceso de entrenamiento del modelo base no se dispone de informacion: se desconoce el volumen de tokens, la composicion del corpus, la mezcla de datos multimodales y si se aplicaron etapas de RLHF, DPO u otras tecnicas de alineacion. Tampoco se documentan innovaciones adicionales mas alla de la arquitectura hibrida y la cabeza MTP.

La cuantizacion oQ4e, objeto de esta ficha, aplica una asignacion de bits por sensibilidad medida de cada capa, redondeo por grupos con matriz de importancia (128 muestras x 512 tokens) y un reajuste por minimos cuadrados ponderados de escala y sesgo. La revision de 2026-11-19 recuantiza con el redondeo oQe refinado de oMLX 0.8.0, que reduce el error de cuantizacion sin alterar tamano ni velocidad.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat.
- Comprension de imagenes y respuesta en texto sobre ellas (pipeline image-text-to-text), gracias al codificador de vision incluido.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Qwen3.6, aunque no se documentan resultados especificos en la informacion disponible.
- Decodificacion especulativa mediante la cabeza MTP incluida en el checkpoint, que permite proponer varios tokens por paso de decodificacion.
- Mezcla de expertos con 3B parametros activos, lo que reduce el coste por token frente a un modelo denso del mismo tamano total.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint MLX de 20,614 GiB permite ejecutar un MoE multimodal de 35B parametros en Macs con memoria unificada de 32 GB o mas, sin GPU dedicada, usando la libreria mlx y el runtime oMLX.
- Asistentes sobre documentos con imagenes: al aceptar entrada image-text-to-text, el modelo puede responder preguntas sobre capturas, diagramas o paginas escaneadas combinadas con texto, en un flujo conversacional.
- Prototipado de agentes multimodales en estacion de trabajo: la cabeza MTP habilita decodificacion especulativa, lo que reduce la latencia percibida en bucles de agente con muchas llamadas cortas al modelo.
- Analisis de interfaz de usuario y capturas de pantalla: el codificador de vision permite describir o interpretar elementos visuales de una aplicacion y devolver texto estructurado para tareas de documentacion o QA.
- Evaluacion comparativa de cuantizaciones: al publicarse con distribucion de bits detallada por capas (4-bit grupo 64, 8-bit grupo 64 y 128, BF16), sirve como referencia para medir la perdida de calidad de oQ4e frente al modelo base en tareas propias.
- Despliegue en entornos con restricciones de memoria: el peso efectivo de 4,925 bits/parametro y el desglose por componente permiten planificar el reparto de memoria entre backbone, vision y MTP en equipos ajustados.
- Fine-tuning ligero o adaptadores sobre base cuantizada: al estar en safetensors y licencia Apache-2.0, puede servir de punto de partida para adaptaciones con LoRA en flujos MLX, siempre que la herramienta soporte bases cuantizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 20,614 GiB solo para los pesos; con cache KV, contexto y overhead del runtime, se recomienda un minimo de 24-32 GB de memoria unificada.
- Hardware objetivo: Apple Silicon con MLX (serie M). No se documenta soporte para CUDA en este checkpoint.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables al formato MLX de este repositorio; para esas GPU habria que recurrir al modelo base o a otras cuantizaciones.
- Cabe en consumer GPU: no en el sentido habitual de GPU PCIe; si cabe en equipos Apple con memoria unificada de 32 GB o superior.
- Opciones de despliegue: runtime oMLX (version 0.8.0 o posterior para la revision actual) y libreria mlx. vLLM, llama.cpp, Ollama y TGI no estan indicados en la informacion disponible para este checkpoint.
- Latencia y throughput: no disponibles. La presencia de la cabeza MTP sugiere mejora por decodificacion especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Jundot/Qwen3.6-35B-A3B-oQ4e-mtp | 35,95B | 3B | no disponible | MLX safetensors, 4,925 bits/peso | Apache-2.0 | Cuantizacion mixta con MTP y vision |
| Qwen/Qwen3.6-35B-A3B | 35,95B | 3B | no disponible | safetensors (BF16 presumiblemente) | Apache-2.0 | Modelo base sin cuantizar; mayor huella de memoria |
| Otras cuantizaciones del mismo base (GGUF, AWQ, GPTQ) | 35,95B | 3B | no disponible | GGUF, etc. | Apache-2.0 | No verificadas en la informacion disponible; orientadas a llama.cpp o GPU |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Al ser una cuantizacion de 4,925 bits/peso, introduce error respecto al modelo base; la model card no cuantifica la degradacion en tareas concretas.
- El checkpoint esta en formato MLX y requiere hardware Apple Silicon y el runtime oMLX; no es portable directamente a CUDA ni a llama.cpp.
- La revision de 2026-11-19 sustituye a versiones anteriores; copias descargadas antes de esa fecha deben reemplazarse para obtener el redondeo oQe refinado.
- Se desconocen los sesgos del modelo base, su tasa de alucinacion y el comportamiento en idiomas distintos del ingles, ya que la lista de idiomas no esta disponible.
- No hay informacion sobre la longitud de contexto soportada, lo que impide garantizar casos de uso con ventanas largas.
- No se documentan resultados de benchmarks ni evaluaciones de seguridad; cualquier uso en produccion requiere evaluacion propia.
- La licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base; conviene revisar la licencia de Qwen/Qwen3.6-35B-A3B.
- El soporte de tool calling, agentes y modo thinking no esta confirmado en la informacion disponible y no debe asumirse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/Qwen3.6-35B-A3B-oQ4e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio de la herramienta de cuantizacion oMLX: https://github.com/jundot/omlx
- Pull request de mejora oQe: https://github.com/jundot/omlx/pull/4930
- Pull request de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
