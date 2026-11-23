# paribompally/indic-transcribe-flex-gguf

## Resumen

Indic-Transcribe-Flex GGUF es la conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) bodhan-ai/indic-transcribe-flex, desarrollado por Bodhan AI en colaboración con AI4Bharat y publicado originalmente como checkpoint NeMo. Esta versión, mantenida por el usuario paribompally, no reentrena ni modifica los pesos: únicamente los convierte a GGUF para permitir inferencia en local con el ecosistema ggml, en concreto mediante transcribe.cpp. El objetivo es facilitar el despliegue on-device de transcripción multilingüe para lenguas índicas sin depender de infraestructura GPU en la nube.

El modelo resuelve un problema concreto: la cobertura ASR de calidad para lenguas del subcontinente indio, muchas de ellas con recursos limitados. Cubre 27 códigos de idioma, incluidas lenguas mayoritarias como hindi, bengalí, tamil, telugu o urdu, y otras de bajos recursos como bodo, sánscrito, maithili, konkani o manipuri, además del inglés. La arquitectura subyacente es la familia Canary de NVIDIA (modelo base nvidia/canary-1b-v2), con aproximadamente 1.230 millones de parámetros.

La relevancia de esta ficha radica en su formato: al estar en GGUF, permite ejecutar un modelo ASR de más de mil millones de parámetros en hardware de consumo, con dos precisiones disponibles (Q8_0 de 1,41 GB y F32 de 4,92 GB). Es una conversión no oficial, por lo que no debe confundirse con una release de Bodhan AI, y su licencia impone condiciones adicionales para el alojamiento a terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Canary (familia NVIDIA Canary, encoder-decoder para ASR) |
| Parametros totales | 1.229.877.232 (~1,23 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible; entrenado con clips de hasta 30 segundos de audio |
| Tipos de cuantizacion | Q8_0 y F32 |
| Idiomas soportados | 27 códigos: as, bn, brx, bho, bgc, bhb, doi, en, gu, hi, hne, kn, kok, ks, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur |
| Licencia | Indic Open Model License v1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (Q8_0: 1,41 GB; F32: 4,92 GB) |

## Arquitectura y entrenamiento

El modelo base es Indic-Transcribe-Flex, construido sobre nvidia/canary-1b-v2 de NVIDIA, que emplea la arquitectura Canary: un transformer encoder-decoder diseñado específicamente para reconocimiento del habla y traducción de voz. La conversión a GGUF utiliza la arquitectura `canary` implementada en transcribe.cpp, lo que implica que el grafo computacional y el tokenizador se han adaptado al runtime ggml. No se ha realizado ningún reentrenamiento, ajuste fino ni modificación de los pesos más allá de la cuantización indicada; la conversión parte del checkpoint `.nemo` en la revisión `ecba9bac` del repositorio original.

En cuanto a los datos de entrenamiento, la información disponible en esta conversión no detalla la composición del dataset, el número de tokens de audio ni si hubo etapas de RLHF o ajuste supervisado específico. La model card remite a la ficha original de Bodhan AI para esos detalles. Un dato operativo relevante es que el modelo se entrenó con clips de hasta 30 segundos, lo que condiciona su uso: para audio más largo hay que segmentar en pausas y transcribir por fragmentos. La salida por defecto es en escritura nativa del idioma (modo *native*), y es obligatorio indicar el código de idioma hablado en la invocación.

## Capacidades

- Transcripción de voz a texto en 27 lenguas índicas y en inglés, con salida en escritura nativa.
- Reconocimiento automático del habla sobre audio de 16 kHz mono en formato WAV.
- Cobertura de lenguas de bajos recursos (bodo, sánscrito, maithili, konkani, manipuri, dogri, entre otras), un punto diferencial frente a modelos ASR genéricos.
- Modo de transcripción nativa; la model card original menciona otros modos de transcripción, aunque esta conversión documenta únicamente el modo nativo.
- Inferencia on-device mediante ggml/transcribe.cpp, sin dependencia de GPU en la nube.
- No se documentan en esta ficha capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio en tiempo real; es un modelo especializado exclusivamente en ASR.

## Casos de uso

- Subtitulado de vídeo en lenguas índicas: se segmenta la pista de audio en fragmentos de hasta 30 segundos cortados en pausas, se transcribe cada uno con el código de idioma correspondiente y se recomponen los subtítulos con marcas de tiempo.
- Transcripción de reuniones y entrevistas en hindi, bengalí o tamil: el modelo genera texto en escritura nativa directamente, lo que evita pasos posteriores de transliteración y simplifica el pipeline de actas.
- Digitalización de archivos orales y patrimonio lingüístico: su cobertura de lenguas con pocos recursos (sánscrito, bodo, manipuri) permite transcribir grabaciones que los ASR comerciales no cubren.
- Atención al cliente en centros de contacto multilingües de India: transcripción local de llamadas para análisis de calidad y búsqueda, sin enviar audio a servicios externos.
- Aplicaciones de accesibilidad offline: dictado y subtitulado en tiempo casi real en portátiles sin GPU dedicada, gracias a que la variante Q8_0 ocupa 1,41 GB.
- Investigación lingüística y creación de corpus: generación de transcripciones preliminares a gran escala para revisión humana, aprovechando el bajo coste de ejecución en CPU.
- Preprocesado en pipelines de NLP: conversión de audio a texto antes de tareas de traducción, resumen o indexación semántica en sistemas que operan con lenguas índicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversión remite a la ficha original de bodhan-ai/indic-transcribe-flex para los datos de evaluación, que no se incluyen en el material proporcionado.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,5 GB para la variante Q8_0 y unos 5 GB para F32, incluyendo overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria para Q8_0; para F32 se recomienda 6 GB o más. No se requieren A100 ni H100, ya que el modelo está pensado para inferencia ligera.
- Cabe en GPU de consumo: sí, en tarjetas como GTX 1650, RTX 3050, RTX 4060 o superiores con la cuantización Q8_0; también es viable en CPU.
- Opciones de despliegue: transcribe.cpp (transcribe-cli), el runtime para el que se generaron estos ficheros. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que la arquitectura `canary` es específica de transcribe.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Indic-Transcribe-Flex GGUF (esta ficha) | ~1,23 mil M | 27 (índicas + inglés) | GGUF (Q8_0, F32) | Indic Open Model License v1.0 | Conversión no oficial para transcribe.cpp |
| bodhan-ai/indic-transcribe-flex (original) | ~1,23 mil M | 27 (índicas + inglés) | NeMo (.nemo) | Indic Open Model License v1.0 | Checkpoint de referencia, requiere NeMo |
| nvidia/canary-1b-v2 | ~1 mil M (familia Canary) | no disponible en detalle | NeMo | CC-BY-4.0 | Modelo base de NVIDIA; menos cobertura específica de lenguas índicas |
| Whisper (variantes de OpenAI) | 39 M – 1,55 mil M | ~99 | safetensors, GGUF, etc. | MIT | Cobertura multilingüe amplia, pero menor especialización en lenguas índicas de bajos recursos |

La comparación con Whisper es orientativa: no se dispone de métricas de WER comparadas en la información proporcionada, por lo que la elección entre ambos debe basarse en la cobertura lingüística y en pruebas propias sobre el dominio de audio concreto.

## Limitaciones y advertencias

- Conversión no oficial: no es una release de Bodhan AI ni está respaldada por la compañía; los pesos son suyos, pero el formato GGUF lo mantiene un tercero.
- Licencia restrictiva: la Indic Open Model License v1.0 exige atribución y, según la sección 3, el alojamiento del modelo para terceros requiere aprobación de Bodhan AI. Conviene revisar el texto completo antes de un uso comercial o de ofrecerlo como servicio.
- Límite de 30 segundos por clip: el modelo no procesa audio largo de forma nativa; es necesario segmentar en pausas, lo que puede introducir errores en los cortes.
- Requiere indicar el código de idioma: no se documenta detección automática de idioma en esta conversión.
- Riesgo de alucinación y errores en audio con ruido, acentos marcados o solapamiento de hablantes; no se han publicado tasas de error en la información disponible.
- Sesgos potenciales derivados de los datos de entrenamiento del modelo base, no documentados en esta ficha.
- Dependencia de un runtime específico (transcribe.cpp): no hay soporte documentado en los ecosistemas de inferencia más habituales, lo que limita las opciones de integración.
- Idiomas de bajos recursos con menos datos de entrenamiento: la calidad puede ser desigual entre lenguas mayoritarias y minoritarias.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/paribompally/indic-transcribe-flex-gguf
- Modelo original: https://huggingface.co/bodhan-ai/indic-transcribe-flex
- Revisión del checkpoint de origen: https://huggingface.co/bodhan-ai/indic-transcribe-flex/tree/ecba9bac9013c0340fe814b336897ee51ed80be9
- Modelo base de NVIDIA: https://huggingface.co/nvidia/canary-1b-v2
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Licencia Indic Open Model License v1.0: https://github.com/Bodhan-AI/bodhan-model-info/blob/main/licenses/indic-open-model-license/v1/Indic_Open_Model_License.md
- Códigos de idioma soportados (ficha original): https://huggingface.co/bodhan-ai/indic-transcribe-flex#supported-language-codes
