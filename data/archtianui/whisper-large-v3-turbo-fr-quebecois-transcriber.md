# ArchTianui/whisper-large-v3-turbo-fr-quebecois-transcriber

## Resumen

`ArchTianui/whisper-large-v3-turbo-fr-quebecois-transcriber` es una conversión de formatos del modelo `ele-sage/whisper-large-v3-turbo-fr-quebecois`, un fine-tuning de `openai/whisper-large-v3-turbo` orientado al reconocimiento automático del habla (ASR) en francés de Quebec (fr-CA). El modelo original fue ajustado por ele-sage con grabaciones de la Assemblée nationale du Québec y datos de Common Voice fr; esta publicación no modifica los pesos, solo los empaqueta en tres formatos de inferencia optimizados para CPU, Intel GPU/NPU y GPUs con Vulkan.

La relevancia de esta ficha es práctica: se trata de un artefacto de despliegue más que de un modelo nuevo. Ofrece el mismo modelo base en CTranslate2 (int8), OpenVINO IR (int8) y whisper.cpp GGML (q8_0), lo que permite ejecutar transcripción offline en hardware modesto sin depender de CUDA ni de servicios en la nube. Está pensado para la aplicación *Transcriber International*.

El autor advierte explícitamente de que la publicación es de prueba: la precisión en el entorno real de la aplicación aún no se ha evaluado y los modelos que no superen esa evaluación serán retirados. La licencia MIT se hereda del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3 turbo), ASR |
| Parametros totales | no disponible (repo de 2.5 GB con tres conversiones; el encoder OpenVINO int8 pesa 640,837,232 bytes y el decoder 172,422,054 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio típica de Whisper de 30 s por segmento) |
| Tipos de cuantizacion | int8 (CTranslate2 y OpenVINO), q8_0 (GGML/whisper.cpp) |
| Idiomas soportados | fr (francés, orientado a fr-CA / Quebec) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (`ct2/model.bin`), OpenVINO IR (`openvino/*.xml` + `.bin`), GGML (`ggml/ggml-model-q8_0.bin`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3 turbo: un transformer encoder-decoder para reconocimiento automático del habla que procesa audio en ventanas de 30 segundos y genera texto token a token. El modelo base es `openai/whisper-large-v3-turbo` (MIT), y el fine-tuning fue realizado por ele-sage sobre `ele-sage/whisper-large-v3-turbo-fr-quebecois` en el commit `0c88344ec63ae249aea28dec20cc377699a2de2c`.

Según la model card original, los datos de entrenamiento del fine-tuning fueron grabaciones de la Assemblée nationale du Québec y Common Voice fr. No se dispone de información sobre número de tokens, composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO; estos detalles deben consultarse en la model card del modelo original. Esta publicación de ArchTianui no aporta entrenamiento adicional: solo cambia el formato y la cuantización de los pesos.

## Capacidades

- Transcripción de audio a texto en francés de Quebec (fr-CA), con especial atención a registros orales y parlamentarios.
- Reconocimiento automático del habla offline, sin conexión a servicios externos.
- Ejecución en CPU mediante CTranslate2 int8, en Intel GPU/NPU/CPU mediante OpenVINO IR int8 y en GPUs con Vulkan mediante whisper.cpp GGML q8_0.
- Verificación de integridad de ficheros: cada archivo del catálogo incluye SHA-256 y la aplicación rechaza los que no coinciden.
- No se documentan capacidades de traducción, diarización de hablantes, tool calling ni razonamiento multi-paso; es un modelo ASR puro.

## Casos de uso

- Transcripción de sesiones parlamentarias: el fine-tuning se entrenó con grabaciones de la Assemblée nationale du Québec, por lo que el modelo está ajustado al vocabulario institucional y al registro oral de ese dominio.
- Subtitulado y actas de reuniones en francés de Quebec: se puede integrar en un pipeline que reciba audio de reuniones y genere transcripciones con CTranslate2 en CPU, sin necesidad de GPU dedicada.
- Aplicaciones de escritorio offline: el formato GGML q8_0 permite ejecutar la transcripción en un portátil con GPU integrada compatible con Vulkan, útil en entornos sin conectividad o con requisitos de privacidad.
- Despliegue en hardware Intel: la conversión OpenVINO IR int8 está pensada para ejecutarse en iGPU, NPU o CPU Intel, lo que facilita el despliegue en equipos corporativos sin GPU NVIDIA.
- Investigación lingüística sobre francés quebequés: permite generar transcripciones de corpus orales para análisis léxico o fonético, siempre que se valide la precisión en el dominio concreto.
- Prototipado de asistentes de voz locales: al ser un modelo ASR ligero en int8, se puede encadenar con un LLM local para construir asistentes de voz en fr-CA que no envíen audio a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la precisión en el entorno de la aplicación aún no se ha evaluado y que los modelos que fallen esa evaluación serán retirados.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero CTranslate2 int8 pesa 820,316,291 bytes (~820 MB); el GGML q8_0 pesa 874,188,075 bytes (~874 MB); la conversión OpenVINO IR suma aproximadamente 813 MB entre encoder y decoder int8.
- GPU recomendadas: no se especifican modelos concretos. La conversión OpenVINO está orientada a Intel GPU/NPU/CPU; la GGML q8_0 a GPUs con soporte Vulkan; la CTranslate2 a CPU.
- Cabe en GPU de consumo: sí, en términos de memoria, dado que los pesos int8 rondan los 800-900 MB. No se dispone de datos de latencia ni throughput.
- Opciones de despliegue: CTranslate2 (CPU), OpenVINO Runtime (Intel GPU/NPU/CPU), whisper.cpp (Vulkan).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (whisper-large-v3-turbo-fr-quebecois, convertido) | no disponible (int8 ~820-874 MB) | no disponible | fr (fr-CA) | MIT | CT2, OpenVINO, GGML |
| ele-sage/whisper-large-v3-turbo-fr-quebecois | no disponible | no disponible | fr (fr-CA) | MIT | safetensors (original) |
| openai/whisper-large-v3-turbo | no disponible en la informacion proporcionada | no disponible | multilingue | MIT | safetensors, CT2, GGML |

No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Estado de prueba: el autor indica que la precisión en el entorno real de la aplicación no se ha evaluado y que el modelo puede retirarse si no supera la evaluación.
- Ámbito lingüístico restringido: está especializado en francés de Quebec; su comportamiento en otras variantes del francés o en otros idiomas no está documentado.
- Riesgo de alucinación: como todo modelo ASR basado en Whisper, puede generar texto plausible en segmentos con ruido, silencios o audio de baja calidad.
- Sesgos: no se documentan sesgos específicos; el entrenamiento con grabaciones parlamentarias y Common Voice puede sobrerrepresentar determinados registros y acentos.
- Licencia MIT: permite uso comercial, pero se hereda del modelo original; conviene revisar la model card de `ele-sage/whisper-large-v3-turbo-fr-quebecois` y de `openai/whisper-large-v3-turbo` para confirmar condiciones.
- Integridad: la aplicación rechaza ficheros cuyo SHA-256 no coincida con el catálogo firmado, lo que implica que cualquier modificación local de los pesos romperá la verificación.
- Sin datos de benchmarks ni de latencia: no es posible estimar el rendimiento en producción a partir de la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/ArchTianui/whisper-large-v3-turbo-fr-quebecois-transcriber
- Modelo original: https://huggingface.co/ele-sage/whisper-large-v3-turbo-fr-quebecois
- Modelo base de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
