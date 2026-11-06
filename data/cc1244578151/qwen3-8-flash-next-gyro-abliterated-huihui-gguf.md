# cc1244578151/Qwen3.8-Flash-Next-Gyro-abliterated-Huihui-GGUF

## Resumen

Qwen3.8-Flash-Next-Gyro-abliterated-Huihui-GGUF es una distribución de pesos cuantizados en formato GGUF del modelo Qwen3.8-Flash-Next, en su variante "abliterated" producida por huihui-ai (que elimina la dirección de rechazo de los pesos) y empaquetada por el usuario cc1244578151 a partir de los ficheros de agentionai. Se trata de un modelo multimodal image-text-to-text de aproximadamente 177.000 millones de parámetros totales, con arquitectura de mezcla de expertos (MoE) que combina atención completa y atención lineal, orientado a generación de texto, razonamiento y código con soporte de visión.

La relevancia de esta ficha es doble. Por un lado, demuestra una técnica de cuantización agresiva (tipos trellis TQK6/TQK7, TQ2_T y TQP5-7) que permite ejecutar un modelo de 177B en tarjetas de 32 GB, 48 GB o máquinas con 64 GB de memoria unificada, con pérdidas de calidad medidas en divergencia KL frente al modelo original. Por otro, la abliteración elimina la mayor parte de los rechazos del modelo base, lo que tiene implicaciones directas de seguridad y de cumplimiento normativo.

El paquete incluye tres variantes de tamaño (Gyro-S, Gyro-M y Gyro-L) más un proyector de visión en F16 y un borrador MTP para decodificación especulativa. La licencia declarada es qwen-community-1.0, aunque el campo license del repo aparece como "other", lo que exige revisión legal antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con atención completa y atención lineal (según model card) |
| Parametros totales | 176.943.899.520 (~177B) |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens (configurado en el ejemplo de despliegue; límite máximo no especificado) |
| Tipos de cuantizacion | Trellis TQK6/TQK7 (Gyro-S), TQ2_T (Gyro-M), TQP5-7 (Gyro-L); etiquetas de fichero TQ1_0, TQ2_0, TQ3_0; proyector de visión en F16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (campo license: other en el repo) |
| Formato de pesos | GGUF (con tipos trellis no soportados por llama.cpp upstream) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura transformer de mezcla de expertos con capas de atención completa combinadas con capas de atención lineal, según se desprende de la descripción de las 1.224 tensores del checkpoint (salidas de atención, salidas de atención lineal, proyecciones down de expertos compartidos y enrutados). El pipeline declarado es image-text-to-text, lo que confirma que el modelo original es multimodal con entrada de imagen y texto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación técnica principal de esta distribución es el esquema de cuantización trellis, que comprime los expertos enrutados a tipos como TQK6/TQK7, TQ2_T o TQP5-7 según la variante, manteniendo el resto de tensores en tipos más precisos. La abliteración de huihui-ai modifica únicamente los tensores que escriben en el flujo residual: 144 de 1.224 tensores en las variantes v1 (Gyro-S y Gyro-M) y 96 tensores en la v2 (Gyro-L), dejando los expertos enrutados de Gyro-L idénticos a los del modelo sin abliterar. El paquete incluye además un borrador MTP (multi-token prediction) para decodificación especulativa, generado a partir del modelo original y con una tasa de aceptación del 81 % de tokens redactados en una prueba sobre un prompt de código.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat aplicada mediante `--jinja`.
- Razonamiento y resolución de problemas técnicos, con divergencia KL especialmente baja en texto técnico y código (0,111 en Gyro-S, 0,066 en Gyro-M y 0,032 en Gyro-L frente al original).
- Generación de código: la concordancia top-1 con el modelo original alcanza el 94,3 % (Gyro-S), 95,5 % (Gyro-M) y 97,0 % (Gyro-L) en la evaluación de código.
- Comprensión de imágenes: el pipeline image-text-to-text y el fichero `mmproj-F16.gguf` habilitan entrada visual junto al texto.
- Decodificación especulativa mediante borrador MTP con `--spec-type draft-mtp`, con un 81 % de aceptación reportado en una prueba inicial.
- Ejecución en un solo GPU o en memoria unificada, con variantes adaptadas a 32 GB, 48 GB y 64 GB.
- Compatibilidad con endpoints (`endpoints_compatible`) y uso conversacional.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling y function calling: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia de código en local con GPU de 32 GB: la variante Gyro-S (27,64 GiB de pesos) mantiene un 94,3 % de concordancia top-1 con el modelo original en código, lo que permite integrarla en editores o pipelines de revisión sin depender de APIs externas.
- Despliegue en estaciones de trabajo con 2×24 GB: la variante Gyro-M (34,98 GiB) ofrece mejor calidad (95,5 % top-1 en código) y encaja en configuraciones de doble GPU de consumo profesional.
- Inferencia en máquinas con memoria unificada de 64 GB (por ejemplo, Strix Halo): Gyro-L (50,21 GiB) es la opción de mayor fidelidad, con 97,0 % de concordancia top-1 en código y KLD de 0,032.
- Procesamiento de documentos con imagen y texto: el proyector de visión F16 permite extraer información de capturas, diagramas o documentos escaneados combinándolos con consultas en lenguaje natural.
- Generación aumentada por recuperación en local: con 65.536 tokens de contexto configurados, el modelo puede ingerir lotes grandes de fragmentos recuperados y responder con citas en una sola pasada.
- Investigación sobre alineación y abliteración: el paquete permite comparar directamente el comportamiento del modelo original frente al abliterado, ya que las métricas de KLD y top-1 se publican contra el modelo sin modificar.
- Evaluación de técnicas de cuantización trellis: sirve como banco de pruebas para medir el impacto de TQK6/TQK7, TQ2_T y TQP5-7 en calidad y velocidad dentro de runtimes experimentales.
- Servicio conversacional interno no expuesto al público: con las advertencias de uso del autor, puede emplearse en entornos controlados donde el contenido generado se revise antes de su difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica métricas de fidelidad frente al modelo original:

| Variante | Pesos en GPU | KLD vs original | Top-1 vs original | KLD en código | Top-1 en código |
|---|---:|---:|---:|---:|---:|
| Gyro-S abliterated | 27,64 GiB | 0,397 | 75,3 % | 0,111 | 94,3 % |
| Gyro-M abliterated | 34,98 GiB | 0,295 | 78,6 % | 0,066 | 95,5 % |
| Gyro-L abliterated | 50,21 GiB | 0,164 | 82,9 % | 0,032 | 97,0 % |

El autor indica que la abliteración apenas degrada la fidelidad: las variantes S y M quedan a menos de 0,005 de KLD respecto a sus equivalentes sin abliterar (0,401 y 0,291).

## Requisitos de hardware

- Gyro-S: 27,64 GiB de pesos; 28,8 GiB con contexto de 64k. Diseñado para tarjetas de 32 GB.
- Gyro-M: 34,98 GiB de pesos; ~37 GiB con contexto de 64k. Pensado para 2×24 GB o máquinas con 64 GB de memoria unificada.
- Gyro-L: 50,21 GiB de pesos; requiere 64 GB de memoria unificada (Strix Halo) o configuraciones equivalentes.
- GPUs compatibles según el autor: NVIDIA (CUDA mediante agentionai/llama.cpp), AMD RX 7000, RX 9000 y R9700 (Vulkan vía Strata 0.2.0 o superior), y AMD Strix Halo (CPU, Vulkan, HIP mediante halo-box/strix-llama.cpp).
- No es compatible con llama.cpp upstream: los tipos trellis requieren runtimes específicos (Strata, strix-llama.cpp o agentionai/llama.cpp). Gyro-L necesita además los tipos pair-trellis.
- Opciones de despliegue: contenedor `agentionai/agention-llama:server` con Vulkan o CUDA, compilaciones nativas de agentionai/llama.cpp, Strata y strix-llama.cpp.
- Contexto: 65.536 tokens en la configuración de ejemplo, con caché K y V en q8_0.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Qwen3.8-Flash-Next-Gyro-abliterated (este) | ~177B (MoE) | 65.536 configurados | qwen-community-1.0 | GGUF trellis, runtimes experimentales |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated (base de este) | ~177B (MoE) | no disponible | qwen-community-1.0 | Pesos originales sin cuantizar trellis |
| agentionai/Qwen3.8-Flash-Next-Gyro-GGUF (sin abliterar) | ~177B (MoE) | 65.536 configurados | qwen-community-1.0 | GGUF trellis, mismos runtimes |
| Qwen3.8-Flash-Next original | ~177B (MoE) | no disponible | qwen-community-1.0 | Pesos oficiales |

La comparación con alternativas de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina la mayor parte de los rechazos del modelo: puede generar contenido dañino, ofensivo o inapropiado. El propio autor lo declara no apto para uso público ni sin supervisión.
- La licencia qwen-community-1.0 (campo license: other en el repo) debe revisarse antes de cualquier uso comercial; el paquete añade modificaciones de terceros (abliteración y cuantización) sobre el modelo original.
- Los tipos de cuantización trellis no son compatibles con llama.cpp upstream, lo que limita la portabilidad y obliga a usar forks concretos con mantenimiento independiente.
- Las métricas de fidelidad se miden contra el modelo original en texto técnico y código; el autor advierte que no dicen nada sobre el comportamiento en rechazos.
- No hay información sobre idiomas soportados, sesgos conocidos ni tasas de alucinación.
- El contexto máximo real no se especifica; 65.536 tokens es la configuración del ejemplo, no necesariamente el límite arquitectónico.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- El tamaño del repo (262,4 GB) incluye todas las variantes; descargar solo el fichero necesario.
- La decodificación especulativa depende de un borrador MTP generado a partir del modelo original, no del abliterado; la tasa de aceptación del 81 % proviene de una única prueba sobre un prompt de código.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cc1244578151/Qwen3.8-Flash-Next-Gyro-abliterated-Huihui-GGUF
- Modelo base abliterated (huihui-ai v1): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated
- Modelo base abliterated v2 (GGUF): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF
- Tarjeta principal de Gyro (instrucciones de contexto, visión y decodificación especulativa): https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-GGUF
- Runtime Strata: https://github.com/Niko1221/Strata
- Fork para Strix Halo: https://github.com/halo-box/strix-llama.cpp
- Fork agentionai/llama.cpp: https://gitlab.com/agentionai-group/llama.cpp
- Rama Strata de agentionai: https://gitlab.com/agentionai-group/strata/-/tree/main
