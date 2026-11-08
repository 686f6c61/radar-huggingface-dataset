# DictionLabs/Nemotron-3-Diarization-ONNX

## Resumen

Nemotron 3 Diarization es un modelo de diarización de hablantes ("quién habla y cuándo") de pesos abiertos desarrollado por NVIDIA, publicado el 23 de septiembre de 2026. Resuelve el problema de segmentar y etiquetar hablantes en audio real, tanto en modo streaming como en inferencia offline, y admite hasta ocho hablantes simultáneos. Sigue el enfoque Sortformer: ordena los canales de salida según la primera aparición de cada hablante en el audio, lo que elimina la ambigüedad de permutación típica de los sistemas de diarización.

Arquitectónicamente es un transformer compacto: un encoder de 31 capas con Rotary Positional Embeddings (RoPE) que procesa características Mel de 10 ms remuestreadas a una tasa de frame de 80 ms, más una capa Conv1D que vuelve a subir las predicciones a la resolución de 10 ms. Para streaming incorpora la Arrival-Order Speaker Cache (AOSC) y una cola FIFO heredadas de Streaming Sortformer, que preservan la identidad de los hablantes entre fragmentos.

La ficha que nos ocupa, `DictionLabs/Nemotron-3-Diarization-ONNX`, no es el modelo original: es un espejo byte a byte del export ONNX int8 de `onnx-community`, mantenido por Diction Labs para garantizar que el modelo empaquetado en su imagen Docker no cambie ni desaparezca si el repositorio upstream se modifica. Es relevante para quien despliegue diarización en producción con ONNX Runtime y quiera fijar artefactos verificables por hash.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de 31 capas con RoPE, Sortformer con AOSC y cola FIFO para streaming |
| Parametros totales | 100M (1,0 × 10⁸) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; buffer de entrada configurable (mínimo 80 ms, recomendado 0,32 s, offline 30,4 s), duración ilimitada con inferencia por chunks |
| Tipos de cuantizacion | int8 (este espejo solo incluye `model_quantized`); upstream ofrece fp32, fp16, q4 y q4f16 |
| Idiomas soportados | No disponibles (modelo de audio, independiente del idioma) |
| Licencia | OpenMDW License Agreement, version 1.1 |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx` y `onnx/model_quantized.onnx_data`) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de 31 capas con Rotary Positional Embeddings. La entrada es audio mono a 16 kHz convertido en espectrogramas Mel con resolución de 10 ms; el feature stacking reduce la tasa a un frame de encoder cada 80 ms. Sobre el encoder, una capa Conv1D hace upsampling de las predicciones hasta la resolución original de 10 ms. La salida es un tensor flotante de forma `[T, 8]` con probabilidades de actividad por hablante en el rango [0, 1].

Para streaming, el modelo adopta la Arrival-Order Speaker Cache (AOSC) y una cola FIFO, tal como se describe en Streaming Sortformer: la AOSC retiene información de hablantes de fragmentos anteriores para mantener sus identidades a lo largo del tiempo, y la FIFO aporta contexto de frames recientes en cada paso de procesamiento. Un único checkpoint cubre desde latencias de buffer de 80 ms (casos críticos de latencia) hasta la configuración de estilo offline con buffer de 30,4 s. La resolución de salida es configurable en múltiplos de 10 ms. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Diarización de hablantes ("quién habla y cuándo") con hasta ocho hablantes simultáneos.
- Inferencia en streaming con latencia de buffer configurable desde 80 ms (recomendado 0,32 s) y en modo offline con buffer de 30,4 s.
- Procesamiento de audio de duración ilimitada mediante inferencia por chunks.
- Resolución temporal de salida configurable en múltiplos de 10 ms.
- Detección de actividad de voz (etiqueta de pipeline `voice-activity-detection`).
- Etiquetado de hablantes (`speaker-tagging`) y clasificación de frames de audio.
- Entrada de audio mono a 16 kHz en formatos `.wav`, `.flac`, `.opus` y `.mp3`.
- Export ONNX int8 ejecutable con ONNX Runtime, incluido ONNX Runtime Web en navegador.
- No se documentan capacidades de tool calling, agentes, razonamiento multilingüe ni procesamiento de texto.

## Casos de uso

- Transcripción con etiquetas de hablante: combinado con un ASR en streaming, el modelo asigna cada segmento transcrito al hablante correcto, lo que permite generar actas de reuniones con intervenciones atribuidas.
- Atención al cliente y centros de contacto: la diarización separa agente y cliente en grabaciones de llamadas para alimentar análisis de calidad, cumplimiento y detección de momentos de escalado.
- Subtitulado y accesibilidad en directo: con un buffer de 0,32 s y salida a 10 ms, el modelo puede etiquetar hablantes en emisiones en vivo con latencia compatible con subtitulado casi en tiempo real.
- Análisis de reuniones y entrevistas: procesamiento offline con buffer de 30,4 s sobre grabaciones de duración arbitraria para segmentar participantes y calcular tiempos de habla por persona.
- Investigación clínica y ciencias sociales: etiquetado automático de interlocutores en corpus de audio conversacional, con la ventaja de que el modelo es independiente del idioma.
- Despliegue en el navegador: al ser un export ONNX int8 de 100M de parámetros, puede ejecutarse con ONNX Runtime Web en aplicaciones web que necesiten diarización local sin enviar audio a un servidor.
- Pipelines de autohospedaje reproducibles: el espejo con hashes SHA-256 verificables permite fijar el artefacto exacto en imágenes Docker y garantizar que el modelo en producción no cambia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 100M de parámetros; en int8 el peso ronda los 100 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 2 GB o más de VRAM. El repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU moderna sirve; para despliegues de alta concurrencia se recomiendan A100, H100 o L4. En consumer, RTX 4090, RTX 3090, RTX 4060 o superiores son más que suficientes.
- Cabe en GPU consumer: sí, en cualquier GPU con soporte de ONNX Runtime (CUDA o TensorRT) y también en CPU.
- Opciones de despliegue: ONNX Runtime (incluido ONNX Runtime Web), NVIDIA NeMo, y la imagen `dictionlabs/parakeet:latest-int8` que lo empaqueta en `/models/diarization/`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de audio.
- Latencia y throughput: la latencia de buffer mínima es de 80 ms y la recomendada de 0,32 s; la configuración offline usa 30,4 s. No se dispone de cifras de throughput (RTF) publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / buffer | Hablantes | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron 3 Diarization (este espejo) | 100M | 80 ms a 30,4 s, duración ilimitada por chunks | Hasta 8 | OpenMDW 1.1 | ONNX int8 |
| `onnx-community/Nemotron-3-Diarization-ONNX` | 100M | Idéntico (mismo checkpoint) | Hasta 8 | OpenMDW 1.1 | ONNX fp32, fp16, int8, q4, q4f16 |
| `NealCaren/Nemotron-3-Diarization-ONNX` | 100M | Idéntico (export no oficial del mismo modelo base) | Hasta 8 | OpenMDW 1.1 | ONNX |
| `nvidia/Nemotron-3-Diarization` | 100M | Idéntico (modelo original) | Hasta 8 | OpenMDW 1.1 | Pesos NeMo |

No se dispone de información sobre otros modelos de diarización comparables en la documentación consultada.

## Limitaciones y advertencias

- Es un espejo no modificado: no se ha reentrenado, convertido ni recuantizado nada; cualquier mejora debe buscarse en el repositorio upstream de `onnx-community` o de NVIDIA.
- Solo se incluye el export int8 (`model_quantized`); las variantes fp32, fp16, q4 y q4f16 no están en este repositorio y deben obtenerse del upstream.
- Límite máximo de ocho hablantes simultáneos; en escenarios con más participantes la asignación de identidades puede degradarse.
- No se documentan sesgos conocidos ni tasas de alucinación o error de diarización (DER) en la información disponible.
- La licencia OpenMDW 1.1 permite uso comercial, pero exige conservar una copia de la licencia en la redistribución, como hace este repositorio.
- El modelo procesa audio, no texto: no ofrece generación de lenguaje, tool calling ni razonamiento, por lo que debe combinarse con un ASR para obtener transcripciones etiquetadas.
- La latencia mínima de 80 ms está pensada para aplicaciones críticas; la configuración recomendada es de 0,32 s, y por debajo de ese valor la calidad de la diarización puede resentirse.
- La model card upstream indica que la sección "How to use this model" está aún por publicar ("Coming soon"), por lo que la integración debe guiarse por la documentación de NeMo y ONNX Runtime.

## Enlaces

- Repositorio de este espejo: https://huggingface.co/DictionLabs/Nemotron-3-Diarization-ONNX
- Export ONNX upstream: https://huggingface.co/onnx-community/Nemotron-3-Diarization-ONNX
- Revisión exacta espejada: https://huggingface.co/onnx-community/Nemotron-3-Diarization-ONNX/tree/353b6f8ad2cac3580e982d7fbdf0a010786b0406
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Blog de NVIDIA sobre el modelo: https://huggingface.co/blog/nvidia/nemotron-diarization
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/nvidia/nemotron-diarization
- Export ONNX no oficial alternativo: https://huggingface.co/NealCaren/Nemotron-3-Diarization-ONNX
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Imagen Docker que lo empaqueta: https://hub.docker.com/r/dictionlabs/parakeet
- Proyecto Parakeet upstream: https://github.com/achetronic/parakeet
- Proyecto Diction: https://github.com/DictionLabs/Diction
