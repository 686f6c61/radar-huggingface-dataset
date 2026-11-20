# kaienzz/distill-whisper-th-medium-ONNX

## Resumen
`kaienzz/distill-whisper-th-medium-ONNX` es la conversión a formato ONNX del modelo `biodatlab/distill-whisper-th-medium`, un sistema de reconocimiento automático del habla (ASR) basado en la arquitectura Whisper y especializado en tailandés. El modelo original fue desarrollado por el Biomedical and Data Lab de la Universidad Mahidol en colaboración con Looloo Technology (WordSense y Mahamor), y esta versión ONNX ha sido generada y publicada automáticamente mediante el Space `onnx-community/convert-to-onnx`. El objetivo de la conversión es permitir la ejecución del modelo en el ecosistema Transformers.js, es decir, directamente en JavaScript/Node.js o en el navegador sin necesidad de un backend Python.

El modelo subyacente es una versión destilada de Whisper Medium: mantiene el encoder del modelo profesor pero reduce el decoder a 4 capas frente a las 24 del original, lo que rebaja de forma significativa el coste computacional y el tamaño de los pesos. La destilación se realizó sobre un conjunto de corpus tailandeses (Common Voice v13, Gowajee, Thai Elderly Speech Corpus, datos scrapeados propios y el dialecto central del SLSCU Thai Dialect Corpus). Según la model card del autor original, el WER tokenizado con DeepCut sobre el test de Common Voice 13 es del 7,58% frente al 7,42% del modelo profesor, una degradación mínima a cambio de una reducción drástica de parámetros en el decoder.

La relevancia de esta ficha radica en que combina dos factores poco habituales: un modelo ASR especializado en un idioma de bajos recursos como el tailandés y un formato de despliegue (ONNX + Transformers.js) orientado a inferencia en cliente. El repositorio ocupa 9,8 GB, lo que sugiere que incluye los pesos en varias precisiones (probablemente fp32 y cuantizaciones), aunque la model card no detalla los ficheros individuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) destilado, con 4 capas de decoder frente a 24 del profesor |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper Medium original: ventana de audio de 30 s) |
| Tipos de cuantizacion | no disponible en la model card; el repo de 9,8 GB sugiere múltiples precisiones ONNX, pero no se especifican |
| Idiomas soportados | tailandés (entrenado específicamente para tailandés); la model card advierte que puede no funcionar bien en otros idiomas |
| Licencia | MIT |
| Formato de pesos | ONNX (librería `transformers.js`) |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura Whisper, un transformer encoder-decoder diseñado para ASR que procesa espectrogramas de audio de 30 segundos y genera tokens de texto de forma autorregresiva. La variante destilada conserva el encoder del profesor (Whisper Medium) pero reduce el decoder a 4 capas, lo que disminuye el número de parámetros y acelera la decodificación. La destilación se llevó a cabo sobre una mezcla de corpus tailandeses: Common Voice v13, Gowajee, Thai Elderly Speech Corpus, datos scrapeados de forma personalizada y el dialecto central del SLSCU Thai Dialect Corpus. No se especifican en la información disponible el número total de horas de audio, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en ASR).

La innovación principal es la destilación del decoder manteniendo el encoder intacto, una estrategia que reduce el coste de inferencia sin sacrificar demasiado rendimiento (7,58% frente a 7,42% de WER). Esta versión ONNX añade una capa de utilidad práctica: al estar exportada para Transformers.js, permite ejecutar el modelo en entornos JavaScript, incluyendo navegadores con WebAssembly o WebGPU, lo que habilita casos de uso de ASR en cliente sin servidor. La conversión se realizó de forma automática mediante el Space oficial de la comunidad ONNX, por lo que no hay un proceso de validación manual documentado en la model card.

## Capacidades
- Reconocimiento automático del habla (ASR) en tailandés: transcripción de audio a texto.
- Inferencia en JavaScript mediante Transformers.js, incluyendo entornos de navegador.
- Ejecución en formato ONNX, compatible con runtimes ONNX (onnxruntime-web, onnxruntime-node) y con el pipeline `automatic-speech-recognition` de Transformers.js.
- Modelo destilado con decoder reducido, lo que reduce latencia y requisitos de cómputo frente a Whisper Medium estándar.
- No se documentan capacidades de traducción, diarización, detección de idioma, tool calling ni razonamiento multi-paso; es un modelo puramente ASR.
- No se documenta soporte multilingüe; el entrenamiento está centrado en tailandés.

## Casos de uso
- Transcripción de audio en aplicaciones web sin backend: al estar en ONNX y Transformers.js, se puede cargar el modelo en el navegador y transcribir audio del usuario en cliente, evitando enviar datos de voz a un servidor y reduciendo costes de infraestructura.
- Subtitulado automático de contenido en tailandés: integrable en pipelines de procesamiento de vídeo o audio para generar subtítulos, con la ventaja de que el modelo destilado reduce el tiempo de decodificación frente a Whisper Medium completo.
- Asistentes de voz para atención al cliente en tailandés: el modelo puede transcribir las intervenciones del usuario en un sistema de IVR o chatbot de voz, alimentando después un LLM o un sistema de reglas para la respuesta.
- Aplicaciones móviles o de escritorio con procesamiento local: mediante onnxruntime-node o WebGPU en el navegador, se puede desplegar ASR en dispositivos sin conexión, útil en entornos con conectividad limitada.
- Investigación en ASR para lenguas de bajos recursos: sirve como baseline destilado para experimentos de adaptación a dialectos tailandeses o para comparar estrategias de destilación en Whisper.
- Accesibilidad: transcripción en tiempo real de conversaciones o contenido audiovisual para personas con discapacidad auditiva en contextos donde el tailandés es el idioma principal.
- Análisis de grabaciones de call centers: transcripción por lotes de audio telefónico en tailandés para extracción de métricas, búsqueda de texto completo o análisis de sentimiento posterior.

## Benchmarks y rendimiento

| Benchmark | Modelo destilado | Modelo profesor (Whisper Medium) |
|---|---|---|
| WER tokenizado con DeepCut en Common Voice 13 (test) | 7,58% | 7,42% |

No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros), ni métricas de latencia o throughput para la versión ONNX.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 9,8 GB, lo que sugiere que contiene varias precisiones ONNX; una cuantización int8 podría reducir el peso a un rango de 1-2 GB, pero no se confirma en la model card.
- GPU recomendadas: no especificadas. Al ser un modelo destilado de Whisper Medium, es probable que quepa en GPUs consumer (RTX 3060/4060 en adelante) con cuantización, pero no hay datos oficiales.
- Compatibilidad con GPU consumer: probable, pero no confirmada por el autor.
- Opciones de despliegue: Transformers.js (navegador y Node.js), onnxruntime-web, onnxruntime-node. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no están orientados a ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | WER (CV13, tailandés) | Licencia | Formato |
|---|---|---|---|---|---|
| `kaienzz/distill-whisper-th-medium-ONNX` | no disponible (destilado de Medium) | 30 s (heredado de Whisper) | 7,58% | MIT | ONNX |
| `biodatlab/distill-whisper-th-medium` | no disponible (destilado de Medium) | 30 s | 7,58% | MIT | PyTorch/safetensors (no confirmado) |
| Whisper Medium (original OpenAI) | 769 M | 30 s | no disponible para tailandés en esta información | MIT | PyTorch/safetensors |
| `biodatlab/whisper-th-medium-combined` (Thonburian Whisper) | no disponible | 30 s | no disponible en esta información | no disponible | no disponible |

La comparativa se limita a los datos disponibles; no se han encontrado en la información proporcionada métricas de otros modelos ASR tailandeses comparables (por ejemplo, variantes de wav2vec2 o XLS-R) para establecer una comparación cuantitativa completa.

## Limitaciones y advertencias
- El modelo está entrenado específicamente para tailandés; su rendimiento en otros idiomas puede ser deficiente o directamente inutilizable.
- El rendimiento puede variar entre dialectos y acentos tailandeses; la model card advierte explícitamente de esta limitación.
- El ruido de fondo y la claridad del habla afectan a la precisión, como en cualquier sistema ASR.
- La conversión a ONNX se realizó de forma automática mediante un Space de la comunidad; no se documenta una validación manual de la equivalencia numérica con el modelo original.
- No se especifican los tipos de cuantización incluidos ni sus métricas de calidad; usar una cuantización agresiva puede degradar el WER.
- La licencia MIT permite uso comercial, pero el modelo base y los datasets de entrenamiento pueden tener sus propias condiciones; conviene revisar las licencias de Common Voice, Gowajee y el resto de corpus.
- Riesgo de alucinación en ASR: como todo modelo generativo de texto, puede producir transcripciones plausibles pero incorrectas en segmentos de audio ambiguos o con ruido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni reportes de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/kaienzz/distill-whisper-th-medium-ONNX
- Modelo base: https://huggingface.co/biodatlab/distill-whisper-th-medium
- Space de conversión a ONNX: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Documentación del pipeline ASR en Transformers.js: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.AutomaticSpeechRecognitionPipeline
- Paper (ICNLSP 2024, Thonburian Whisper): https://aclanthology.org/2024.icnlsp-1.17/
- Biomedical and Data Lab, Mahidol University: https://biodatlab.github.io/
- SLSCU Thai Dialect Corpus: https://github.com/SLSCU/thai-dialect-corpus
