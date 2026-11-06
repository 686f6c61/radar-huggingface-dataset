# mradermacher/AntiFraud-SFT-GGUF

## Resumen

AntiFraud-SFT-GGUF es la versión cuantizada en formato GGUF del modelo AntiFraud-SFT, un ajuste fino supervisado (SFT) sobre una base Qwen2-Audio orientado a la detección de fraude en el ámbito de las telecomunicaciones. El modelo original lo desarrolla JimmyMa99 y esta versión la publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face que genera versiones estáticas en múltiples precisiones para facilitar el despliegue local. El modelo resuelve el problema de la comprensión de audio en chino aplicada a la identificación de llamadas fraudulentas, combinando entrada de audio y texto.

La relevancia de este modelo radica en su especialización: frente a modelos de audio generalistas, aquí se ha realizado un ajuste fino específico para una tarea de seguridad (fraude telefónico), lo que lo hace útil en entornos de producción donde se necesita analizar conversaciones de voz en chino y clasificarlas. El modelo cuenta con aproximadamente 7.750 millones de parámetros y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Esta ficha se centra en la versión GGUF, que incluye cuantizaciones desde Q2_K hasta f16, además de los ficheros mmproj necesarios para el procesamiento multimodal de audio. El repositorio ocupa 71,7 GB en total debido a la multiplicidad de cuantizaciones, y la librería declarada es transformers, aunque el formato GGUF está pensado para su uso con llama.cpp y derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen2-Audio (audio-text) |
| Parametros totales | 7.754.878.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en f16 y Q8_0 |
| Idiomas soportados | chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2-Audio, una arquitectura transformer multimodal que combina un codificador de audio con un decodificador de lenguaje para permitir la comprensión conjunta de voz y texto. Sobre esta base, el autor del modelo original (JimmyMa99) aplicó un ajuste fino supervisado (SFT) específico para la tarea de detección de fraude en telecomunicaciones, según indican las etiquetas del repositorio (telecom-fraud, speech-understanding, supervised-fine-tuning).

No se dispone de información detallada sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. La model card únicamente referencia el paper arXiv:2503.24115, que presumiblemente documenta el trabajo original, pero no se incluyen detalles técnicos del proceso de entrenamiento en la información proporcionada. La versión GGUF es una conversión estática realizada por mradermacher, sin cuantizaciones ponderadas por imatrix disponibles en el momento de la publicación.

## Capacidades

- Comprensión de audio en chino: el modelo procesa entrada de audio y texto de forma conjunta gracias a su base Qwen2-Audio, lo que permite analizar conversaciones habladas.
- Detección de fraude telefónico: ajustado específicamente para identificar patrones de fraude en el ámbito de las telecomunicaciones.
- Procesamiento multimodal audio-texto: acepta audio como entrada y genera respuestas en texto.
- Conversación multi-turno: la etiqueta "conversational" indica soporte para diálogos.
- Clasificación y análisis de contenido sospechoso en llamadas.
- No se dispone de información sobre soporte de tool calling, function calling, agentes o modo de razonamiento explícito.

## Casos de uso

- Filtrado de llamadas fraudulentas en centralitas telefónicas: el modelo puede analizar el audio de llamadas entrantes en chino y clasificar si presentan indicios de fraude, integrándose en un sistema de telefonía IP para alertar al operador.
- Análisis forense de grabaciones: en investigaciones de fraude telefónico, el modelo permite transcribir y evaluar grabaciones para identificar tácticas de engaño, aprovechando su entrenamiento específico en este dominio.
- Moderación de contenidos de voz en plataformas: servicios de atención telefónica o VoIP pueden usar el modelo para detectar automáticamente intentos de estafa en conversaciones y bloquearlos en tiempo real.
- Formación y concienciación: generar ejemplos o análisis de llamadas fraudulentas para entrenar a personal de atención al cliente en la identificación de tácticas de ingeniería social.
- Investigación académica en seguridad: estudiar patrones lingüísticos y acústicos del fraude telefónico en chino, usando el modelo como herramienta de etiquetado o análisis.
- Cumplimiento normativo: auditar conversaciones grabadas para detectar posibles fraudes y cumplir con requisitos regulatorios de protección al consumidor en el sector de las telecomunicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~3,2 GB; Q4_K_M ~4,9 GB; Q8_0 ~8,3 GB; f16 ~15,6 GB. Añadir aproximadamente 0,8-1,4 GB adicionales para el fichero mmproj (codificador de audio).
- GPU recomendadas: para cuantizaciones Q4_K_M o Q5_K_M, una RTX 3060 de 12 GB o superior es suficiente; para Q8_0, se recomienda una RTX 4070 Ti o RTX 4080 con 16 GB; para f16, una RTX 4090 (24 GB) o GPU de datacenter como A100 o H100.
- Cabe en GPU de consumo: sí, en la mayoría de cuantizaciones (Q2_K a Q6_K) cabe en GPUs con 8-12 GB de VRAM. La versión f16 requiere al menos 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Para el procesamiento de audio es necesario cargar también el fichero mmproj correspondiente.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| AntiFraud-SFT-GGUF (este) | 7,75 B | no disponible | zh | Apache 2.0 | GGUF |
| Qwen2-Audio-7B (base) | ~7,7 B | no disponible | multilingüe | Apache 2.0 | safetensors, GGUF |
| Whisper large-v3 | ~1,55 B | no disponible | multilingüe | MIT | safetensors, GGUF |
| Qwen2-Audio-7B-Instruct | ~7,7 B | no disponible | multilingüe | Apache 2.0 | safetensors, GGUF |

La comparación principal es con Qwen2-Audio-7B, del que deriva: AntiFraud-SFT está especializado en fraude telefónico en chino, mientras que la base es generalista y multilingüe. Frente a Whisper, que es solo transcripción, AntiFraud-SFT añade comprensión y clasificación semántica. No se dispone de datos de rendimiento comparativo para cuantificar la mejora.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para chino (zh); su rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- Es un ajuste fino especializado en fraude telefónico; fuera de ese dominio su comportamiento puede degradarse respecto a la base Qwen2-Audio.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en la clasificación de audio ambiguo o con ruido.
- No se dispone de información sobre sesgos específicos del dataset de entrenamiento; al ser un dominio sensible (fraude), existe riesgo de falsos positivos que afecten a usuarios legítimos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la precisión en producción.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad en tareas de comprensión de audio.
- Es necesario cargar el fichero mmproj junto con el modelo para procesar audio; sin él, el modelo solo funcionará con texto.
- No se han publicado benchmarks que validen su eficacia real en detección de fraude.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/AntiFraud-SFT-GGUF
- Modelo base: https://huggingface.co/JimmyMa99/AntiFraud-SFT
- Página de descargas del cuantizador: https://hf.tst.eu/model#AntiFraud-SFT-GGUF
- Paper de referencia: https://arxiv.org/abs/2503.24115
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
