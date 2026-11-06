# Lexibender/cutto-local-speech

## Resumen

CUTTO local speech es un paquete de pesos de inferencia para reconocimiento automático del habla (ASR) en local, publicado por el usuario Lexibender en Hugging Face. No se trata de un modelo único entrenado desde cero, sino de un conjunto de activos fijados (pinned) que combina tres componentes: Whisper large-v3-turbo en FP32 exportado a ONNX nativo con búsqueda por haz (beam search), un modelo de alineación de palabras FP32 para inglés y ruso, y Nemotron-3 INT8 para diarización de hablantes. El repositorio ocupa 5,2 GB y está pensado para ser consumido por una aplicación concreta (CUTTO), no como modelo autónomo.

El problema que resuelve es el despliegue de un pipeline de voz completo y privado: transcripción, alineación temporal a nivel de palabra y separación de hablantes, todo ejecutable con ONNX Runtime sin dependencia de servicios en la nube. Los pesos se descargan por separado desde la aplicación y el repositorio solo aporta los grafos, la configuración estática y los metadatos de procedencia y licencias.

Es relevante por su enfoque en la trazabilidad (incluye `provenance.json` con checksums de los checkpoints originales) y por cubrir un hueco habitual en los stacks de voz autoalojados: la combinación de ASR, alineación y diarización bajo un mismo runtime ONNX. La licencia es mixta (`mixed-component-licenses`), lo que condiciona su uso comercial según el componente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3-turbo (transformer encoder-decoder) exportado a ONNX; alineador de palabras; Nemotron-3 para diarización |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (Whisper y alineador), INT8 (Nemotron-3 diarización) |
| Idiomas soportados | en, ru |
| Licencia | mixta por componente (`mixed-component-licenses`), ver `licenses/NOTICE.md` |
| Formato de pesos | ONNX (con ficheros de datos externos para `whisper/model.onnx`) |

## Arquitectura y entrenamiento

El componente principal es Whisper large-v3-turbo en FP32, exportado a un grafo ONNX nativo que ejecuta beam search dentro del propio grafo. El grafo `whisper/model.onnx` requiere que los dos ficheros de datos externos estén en el mismo directorio. Se acompaña de un modelo de alineación de palabras FP32 para inglés y ruso, con diccionarios de etiquetas incluidos en los metadatos de alineación.

El tercer componente es Nemotron-3 en INT8 para diarización de hablantes, con frontend, grafo de pasos y configuración que deben usarse conjuntamente. El repositorio no incluye código de aplicación, audio, vídeo, transcripciones ni fixtures de benchmark: solo pesos, configuración estática, metadatos de procedencia (`provenance.json` con identidades de origen, cambios de exportación y checksums de los checkpoints originales) y textos de licencia. No se dispone de información sobre datos de entrenamiento, número de tokens ni procesos de RLHF/DPO, ya que el autor no los documenta en la model card.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés y ruso mediante Whisper large-v3-turbo con beam search.
- Alineación temporal a nivel de palabra para inglés y ruso.
- Diarización de hablantes (separación de interlocutores) con Nemotron-3 INT8.
- Ejecución local con ONNX Runtime, sin dependencia de servicios externos.
- Integración en un pipeline único de transcripción, alineación y etiquetado de hablantes.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Transcripción privada de reuniones: el pipeline combina ASR, alineación de palabras y diarización para generar actas con marcas temporales y atribución de interlocutor, ejecutándose en local con ONNX Runtime.
- Subtitulado con tiempos precisos: la alineación a nivel de palabra permite generar subtítulos sincronizados en inglés y ruso a partir del audio original.
- Análisis de entrevistas y research cualitativo: la diarización separa entrevistador y entrevistado, y la alineación facilita citas con marca temporal exacta.
- Cumplimiento y privacidad en sectores regulados: al no requerir servicios en la nube, el audio no sale de la infraestructura propia, lo que encaja en entornos con requisitos de confidencialidad.
- Procesado por lotes de archivos de audio: al ser un grafo ONNX estático, puede integrarse en pipelines de procesamiento masivo con ONNX Runtime.
- Aplicaciones de escritorio o edge con runtime propio: el paquete está diseñado para una aplicación concreta (CUTTO), por lo que sirve de base para integrar voz en herramientas de escritorio autoalojadas.
- Investigación en ASR multilingüe inglés-ruso: permite comparar el comportamiento de Whisper large-v3-turbo en ONNX frente a otras implementaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Whisper large-v3-turbo en FP32 y el alineador FP32 requieren una cantidad de memoria considerable; el repositorio completo pesa 5,2 GB, lo que da una orientación del orden de magnitud de los pesos, pero no se documenta el consumo en ejecución.
- GPU recomendadas: no disponible. Por el tamaño del bundle, se necesita una GPU con memoria suficiente para cargar los grafos FP32; no se especifican modelos concretos.
- GPU de consumo: no disponible. No se confirma que quepa en GPUs de consumo con la configuración FP32 publicada.
- Despliegue: ONNX Runtime (librería declarada). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de pipeline de voz.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CUTTO local speech (este) | Bundle ASR + alineación + diarización | en, ru | ONNX | mixta por componente | Hugging Face |
| Whisper large-v3-turbo (original OpenAI) | ASR | multilingüe | PyTorch / safetensors | MIT | Hugging Face, OpenAI |
| Whisper large-v3 (original OpenAI) | ASR | multilingüe | PyTorch / safetensors | MIT | Hugging Face, OpenAI |
| Nemotron-3 (NVIDIA) | Diarización | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas empaquetadas de ASR + alineación + diarización no está disponible en la información consultada. Este bundle se diferencia por integrar los tres componentes bajo ONNX Runtime y por su licencia mixta, frente a la licencia MIT de los checkpoints originales de Whisper.

## Limitaciones y advertencias

- El autor advierte de que los modelos pueden producir palabras, marcas temporales o etiquetas de hablante inexactas; es necesario evaluar su idoneidad para el material concreto.
- Solo cubre inglés y ruso; no hay soporte documentado para otros idiomas.
- La licencia es mixta por componente (`mixed-component-licenses`); el uso comercial exige revisar `licenses/NOTICE.md` y las licencias de cada componente (Whisper, alineador y Nemotron-3).
- El repositorio no incluye código de aplicación: requiere el runtime de la aplicación CUTTO, por lo que no es un modelo autónomo listo para usar con cualquier framework.
- El grafo `whisper/model.onnx` depende de ficheros de datos externos en el mismo directorio; un empaquetado incorrecto rompe la inferencia.
- No se documentan sesgos conocidos, datos de entrenamiento ni métricas de evaluación.
- Riesgo de alucinación en la transcripción inherente a los modelos ASR, especialmente con audio ruidoso o acentos no representados en el entrenamiento.

## Enlaces

- [Hugging Face: Lexibender/cutto-local-speech](https://huggingface.co/Lexibender/cutto-local-speech)
- [Licencias y avisos del bundle](https://huggingface.co/Lexibender/cutto-local-speech/blob/main/licenses/NOTICE.md)
- [AI Model Tracker Index (SAVRN)](https://savrn.com/model-tracker)
- [Local Voice-AI Model Database: Self-Hosted STT & TTS, License-Graded (2026)](https://d-central.tech/local-voice-ai-models/)
