# Cactus-Compute/parakeet-tdt-0.6b-v3

## Resumen

Parakeet TDT 0.6b v3 es un modelo de reconocimiento automático de voz (ASR) desarrollado originalmente por NVIDIA y adaptado por Cactus-Compute para su ejecución en dispositivos. La versión publicada en Hugging Face bajo el identificador `Cactus-Compute/parakeet-tdt-0.6b-v3` está optimizada para transcripción en vivo y rendimiento on-device, con soporte específico para NPU de Apple (apple-npu) y etiquetas de transcription y speech-embed. El modelo se distribuye con licencia CC-BY-4.0 y su pipeline es de automatic-speech-recognition.

La relevancia de esta versión radica en su enfoque hacia la inferencia eficiente en hardware de consumo, especialmente en dispositivos móviles y sistemas embebidos. Cactus-Compute proporciona además un repositorio de cuantización, kernels y runtime (cactus) que permite convertir y optimizar modelos de Hugging Face, con soporte probado para la familia Parakeet. El tamaño del repositorio es de 12.3 GB, lo que sugiere que incluye pesos en precisión completa o múltiples formatos, aunque no se especifica el desglose exacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en nvidia/parakeet-tdt-0.6b-v3) |
| Parametros totales | 0.6 mil millones (segun nombre del modelo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (existe una variante `-cq` en el mismo autor) |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (el repo ocupa 12.3 GB) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo. Se sabe que es una adaptación de `nvidia/parakeet-tdt-0.6b-v3`, un modelo ASR de NVIDIA, pero no se especifican los componentes concretos (por ejemplo, si usa FastConformer, atención lineal, etc.). Tampoco se ofrecen datos sobre el proceso de entrenamiento, el número de tokens, la composición del dataset o si se aplicaron técnicas como RLHF o DPO. La única innovación mencionada es la optimización para NPU de Apple y la integración con el runtime de Cactus-Compute para cuantización y despliegue en dispositivos.

## Capacidades

- Reconocimiento de voz (ASR) para transcripción en vivo.
- Optimizado para ejecución on-device, con soporte para NPU de Apple (apple-npu).
- Generación de embeddings de voz (tag `speech-embed`).
- Compatible con el pipeline `automatic-speech-recognition` de Hugging Face.
- Posibilidad de cuantización mediante la herramienta `cactus convert` (según documentación de Cactus-Compute).

## Casos de uso

- Transcripción en tiempo real en dispositivos móviles: el modelo está diseñado para baja latencia y puede ejecutarse en NPU de Apple, lo que lo hace adecuado para apps de dictado o subtitulado en vivo sin depender de la nube.
- Asistentes de voz embebidos: su tamaño de 0.6B parámetros permite integrarlo en sistemas de smart home o wearables con recursos limitados.
- Accesibilidad: puede utilizarse para generar subtítulos automáticos en reuniones o vídeos, funcionando localmente para preservar la privacidad.
- Análisis de llamadas en centros de contacto: con la cuantización y el runtime de Cactus, se puede desplegar en servidores de bajo coste para transcribir conversaciones en tiempo real.
- Preprocesamiento de audio para pipelines de NLP: el tag `speech-embed` sugiere que puede extraer representaciones de voz útiles para tareas posteriores como clasificación de emociones o identificación de hablante.
- Investigación en ASR eficiente: sirve como punto de partida para experimentos de cuantización y optimización en hardware heterogéneo, gracias a la integración con el ecosistema de Cactus-Compute.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser un modelo de 0.6B parámetros, es razonable esperar que quepa en GPUs de consumo con al menos 4 GB de VRAM en cuantización de 8 bits, aunque no se proporcionan cifras exactas.
- La versión con soporte para NPU de Apple indica que puede ejecutarse en dispositivos con Neural Engine (iPhone, iPad, Mac) mediante CoreML.
- El repositorio de Cactus-Compute incluye kernels y runtime para móviles, wearables y smart home, lo que sugiere compatibilidad con ARM y arquitecturas de bajo consumo.
- Opciones de despliegue: el runtime de Cactus (cactus-compute/cactus) y la herramienta de conversión `cactus convert` permiten generar versiones cuantizadas. También es probable que sea compatible con frameworks estándar como ONNX o CoreML, aunque no se confirma.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos ASR como Whisper, Wav2Vec2 o los propios Parakeet de NVIDIA. No se han proporcionado datos de rendimiento ni características técnicas detalladas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No se especifican los idiomas soportados, por lo que su cobertura lingüística es desconocida.
- Al ser una adaptación de un modelo de NVIDIA, puede heredar sesgos presentes en los datos de entrenamiento originales, aunque no se documentan.
- La licencia CC-BY-4.0 permite uso comercial y modificación, pero exige atribución al autor original (NVIDIA y Cactus-Compute). Es necesario revisar los términos completos de la licencia para usos específicos.
- El tamaño del repositorio (12.3 GB) puede incluir pesos en alta precisión, lo que requeriría cuantización para despliegue en dispositivos con almacenamiento limitado.
- No hay información sobre la calidad de la transcripción en entornos ruidosos, acentos o habla solapada.
- La documentación disponible es escasa; se recomienda probar el modelo en el caso de uso concreto antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cactus-Compute/parakeet-tdt-0.6b-v3
- Variante cuantizada (Cactus-Compute/parakeet-tdt-0.6b-v3-cq): https://huggingface.co/Cactus-Compute/parakeet-tdt-0.6b-v3-cq
- Repositorio de Cactus-Compute (runtime y kernels): https://github.com/cactus-compute/cactus
- Documentación de Cactus: https://docs.cactuscompute.com/v2.0.1/
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
