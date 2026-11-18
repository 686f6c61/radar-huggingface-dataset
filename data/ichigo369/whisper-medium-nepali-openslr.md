# Ichigo369/whisper-medium-nepali-openslr

## Resumen

Whisper Medium Nepali (OpenSLR) es un ajuste fino del modelo de reconocimiento automático del habla openai/whisper-medium (769M parámetros) sobre el corpus nepalí OpenSLR 54, que contiene aproximadamente 154 horas de audio en nepalí. Lo desarrollan Ichigo369 y Dragneel de forma colaborativa; este repositorio es un espejo del release original alojado en la cuenta de Dragneel. El modelo resuelve el problema de la transcripción de voz en nepalí, un idioma de bajos recursos para el que los modelos multilingües genéricos rinden peor que un ajuste específico.

La arquitectura es la de Whisper: un transformer encoder-decoder con atención estándar, preentrenado por OpenAI sobre datos multilingües débiles y ajustado aquí sobre un único idioma. El resultado declarado por el autor es un WER del 14,04% sobre OpenSLR 54, con una pérdida de 0,0710. Se distribuye bajo licencia Apache 2.0 en formato safetensors, con un tamaño de repositorio de 3,1 GB.

Es relevante ahora porque cubre un hueco práctico: pipelines de voz para nepalí en aplicaciones reales (el propio autor lo usa como etapa ASR de un chatbot de voz nepalí). Al estar construido sobre Whisper Medium, hereda su ecosistema de despliegue (transformers, whisper.cpp, faster-whisper) y su licencia permisiva, lo que facilita su integración en producto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parámetros totales | 763.857.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, según la arquitectura Whisper) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantizaciones estándar de Whisper, no documentadas por el autor) |
| Idiomas soportados | nepalí (ne) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-medium, un transformer encoder-decoder diseñado para ASR y traducción de voz, con 769M parámetros. El ajuste fino se realizó sobre OpenSLR 54 (Nepali Speech Corpus), un conjunto de aproximadamente 154 horas de audio en nepalí. El entrenamiento se ejecutó en una NVIDIA A100 de 80 GB según la model card.

No se detallan en la información disponible la composición exacta del dataset, el número de tokens de audio procesados, la configuración de hiperparámetros ni si se aplicaron técnicas de RLHF/DPO (no aplicables habitualmente en ASR). El autor remite a la model card original de Dragneel/whisper-medium-nepali-openslr para los detalles de entrenamiento, que no están incluidos en la información proporcionada.

## Capacidades

- Transcripción de voz a texto en nepalí (ASR monolingüe).
- Decodificación con idioma forzado (`language="nepali"`, `task="transcribe"`) mediante `WhisperProcessor`.
- Integración directa con el pipeline `automatic-speech-recognition` de transformers.
- Procesamiento de segmentos de audio de hasta 30 segundos por invocación, conforme a la arquitectura Whisper.
- Capacidad de servir como etapa ASR en pipelines de voz completos (ASR → LLM → TTS), como demuestra su uso en el chatbot de voz nepalí referenciado.
- No se documentan capacidades de tool calling, agentes, visión, audio más allá de ASR ni modos de razonamiento extendido.

## Casos de uso

- Transcripción de reuniones y entrevistas en nepalí: el modelo convierte audio en texto con un WER del 14,04% sobre el dominio de OpenSLR 54, adecuado para generar actas o subtítulos revisables por un humano.
- Subtitulado automático de vídeo y pódcast en nepalí: se puede segmentar el audio en ventanas de 30 s y transcribir cada una, encadenando los resultados para producir subtítulos con marcas temporales.
- Chatbots de voz en nepalí: es la etapa ASR del pipeline descrito por el autor (Whisper ASR → LLM con detección de emoción → TTS VITS), de modo que el usuario puede hablar en nepalí y recibir respuesta hablada.
- Atención al cliente telefónica: transcripción de llamadas en nepalí para su análisis, clasificación y archivo, con la ventaja de una licencia Apache 2.0 que permite uso comercial sin restricciones adicionales.
- Investigación lingüística y creación de corpus: generación de transcripciones a escala sobre grabaciones en nepalí para anotación posterior o entrenamiento de otros modelos.
- Accesibilidad: conversión de audio a texto para personas con discapacidad auditiva en entornos de habla nepalí, desplegable en local gracias al tamaño moderado del modelo.
- Preprocesado para pipelines de datos: transcripción masiva de audio nepalí antes de aplicar análisis de sentimiento, extracción de entidades o indexación de búsqueda.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (métricas no verificadas de forma independiente, `verified: false`):

| Benchmark | Métrica | Valor |
|---|---|---|
| OpenSLR 54 (Nepali Speech Corpus) | WER | 14,04% |
| Entrenamiento (pérdida) | Loss | 0,0710 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni cifras de WER frente a alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 1,5-2 GB para los pesos (769M parámetros) más overhead de activaciones y decodificación.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,8-1 GB; en 4 bits, en torno a 0,4-0,5 GB (estimaciones según el tamaño del modelo, no documentadas por el autor).
- GPU recomendadas: NVIDIA A100 80 GB fue la usada en entrenamiento; para inferencia basta una GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) o incluso CPU para uso no interactivo.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más de VRAM en fp16, y en GPUs de gama baja con cuantización.
- Opciones de despliegue: transformers (`pipeline` de `automatic-speech-recognition`), faster-whisper, whisper.cpp y servidores compatibles con Whisper; no se documentan configuraciones específicas de vLLM o TGI para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ichigo369/whisper-medium-nepali-openslr | 763.857.920 | no disponible (ventana de 30 s) | nepalí | 14,04% (OpenSLR 54) | Apache 2.0 | Hugging Face |
| openai/whisper-medium (base) | 769M | no disponible (ventana de 30 s) | multilingüe (incluye nepalí) | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| Dragneel/whisper-medium-nepali-openslr (original) | 769M | no disponible (ventana de 30 s) | nepalí | 14,04% (OpenSLR 54) | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación de rendimiento se limita al WER declarado por el autor de este ajuste.

## Limitaciones y advertencias

- Modelo monolingüe: solo está ajustado para nepalí; su uso con otros idiomas degradará la calidad de forma notable.
- El WER del 14,04% está medido sobre OpenSLR 54, el mismo corpus de ajuste; el rendimiento en dominios distintos (llamadas telefónicas, ruido de fondo, acentos regionales) puede ser peor y no está documentado.
- Métrica no verificada de forma independiente (`verified: false` en el model-index); conviene validarla en el dominio de producción antes de adoptar el modelo.
- Riesgo de alucinación inherente a Whisper: puede generar texto plausible en segmentos de silencio o ruido, por lo que se recomienda detección de actividad de voz y revisión en casos críticos.
- Sesgos: no se documentan análisis de sesgo por género, edad, dialecto o región; el corpus OpenSLR 54 puede no representar toda la variación del nepalí.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se debe citar a ambos autores (Ichigo369 y Dragneel) según indica la model card.
- Este repositorio es un espejo del release original; para detalles de entrenamiento y posibles actualizaciones conviene consultar el repositorio de Dragneel.
- No se documentan limitaciones de longitud de audio más allá de la ventana de 30 s propia de Whisper; audios más largos requieren segmentación manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ichigo369/whisper-medium-nepali-openslr
- Repositorio original: https://huggingface.co/Dragneel/whisper-medium-nepali-openslr
- Modelo base: https://huggingface.co/openai/whisper-medium
- Perfil del autor: https://huggingface.co/Ichigo369
- Perfil del coautor: https://huggingface.co/Dragneel
- Aplicación que lo usa (Nepali Voice Chatbot): https://github.com/Bishalai/nepali-whisper
- Dataset OpenSLR 54 (Nepali Speech Corpus): https://www.openslr.org/54/
