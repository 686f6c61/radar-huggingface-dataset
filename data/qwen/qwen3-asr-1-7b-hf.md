# Qwen/Qwen3-ASR-1.7B-hf

## Resumen

Qwen3-ASR-1.7B es un modelo de reconocimiento automático del habla (ASR) desarrollado por el equipo Qwen de Alibaba, publicado en junio de 2026. Forma parte de la familia Qwen3-ASR, que incluye también la versión Qwen3-ASR-0.6B y el modelo auxiliar Qwen3-ForcedAligner-0.6B. El modelo integra identificación de idioma y transcripción de voz en un único sistema, soportando 30 idiomas y 22 dialectos del chino, además de acentos del inglés de múltiples países y regiones.

La arquitectura se basa en el modelo fundacional Qwen3-Omni, adaptado específicamente para tareas de audio. El checkpoint de 1.7B parámetros alcanza resultados de última generación entre los modelos ASR de código abierto y compite con las APIs comerciales más potentes, según la documentación oficial. El modelo admite inferencia offline y streaming con un único checkpoint, maneja audio de larga duración y puede procesar voz cantada y canciones con música de fondo.

La versión nativa de Transformers está disponible desde la versión 5.13.0 de la librería, lo que facilita su integración en pipelines existentes. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Su tamaño moderado (2.038 millones de parámetros en total) lo hace viable para despliegue en GPUs de consumo, aunque se recomienda hardware profesional para producción a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Qwen3-Omni (encoder de audio + decoder de lenguaje) |
| Parametros totales | 2.038.052.480 (1.7B activos) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, hu, mk, ro (30 idiomas) + 22 dialectos del chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3-ASR-1.7B se construye sobre la arquitectura del modelo fundacional Qwen3-Omni, que combina un encoder de audio con un decoder de lenguaje basado en transformer. El modelo se entrena con datos de habla a gran escala, aunque la documentación no especifica el número exacto de tokens ni la composición detallada del dataset. La innovación principal reside en su capacidad unificada de identificación de idioma y transcripción, así como en el soporte nativo de inferencia offline y streaming con un único checkpoint.

El modelo incorpora un mecanismo de "forced alignment" que permite predecir marcas de tiempo para unidades arbitrarias en hasta 5 minutos de habla, superando en precisión a los modelos de alineación forzada basados en E2E, según la documentación. También admite el uso de contexto libre (hotwords) mediante un parámetro `prompt`, lo que permite sesgar la transcripción hacia vocabulario específico de dominio. El procesamiento de audio incluye soporte para voz cantada y canciones con música de fondo, lo que amplía su rango de aplicaciones más allá del ASR convencional.

## Capacidades

- Reconocimiento automático del habla en 30 idiomas y 22 dialectos del chino, incluyendo acentos regionales del inglés.
- Identificación automática del idioma hablado en cada segmento de audio.
- Inferencia unificada offline y streaming con un único modelo.
- Manejo de audio de larga duración sin necesidad de segmentación previa.
- Procesamiento de voz cantada, canto y canciones con música de fondo.
- Forced alignment: predicción de marcas de tiempo para unidades arbitrarias (hasta 5 minutos de habla) en 11 idiomas, mediante el modelo auxiliar Qwen3-ForcedAligner-0.6B.
- Soporte de contexto libre (hotwords) para sesgar la transcripción hacia vocabulario específico.
- Integración nativa con Transformers v5.13.0, con API simplificada `apply_transcription_request`.
- Capacidad de forzar el idioma de transcripción mediante el parámetro `language`.
- Alto rendimiento: la versión 0.6B alcanza un throughput de 2000× con concurrencia de 128 (dato oficial para la versión pequeña).

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede procesar audio largo sin segmentación y detectar automáticamente el idioma, lo que facilita la generación de actas en entornos multilingües. Su soporte de streaming permite transcripción en tiempo real durante la reunión.
- Subtitulado automático de vídeo: gracias a la identificación de idioma y al manejo de audio con música de fondo, es adecuado para generar subtítulos en plataformas de vídeo, incluyendo contenido musical y vídeos con banda sonora.
- Atención al cliente automatizada: la transcripción en tiempo real de llamadas permite a los sistemas de soporte analizar conversaciones, extraer intenciones y generar resúmenes automáticos. El modelo soporta 30 idiomas, cubriendo mercados internacionales.
- Asistentes de voz y dispositivos domésticos: su tamaño moderado (1.7B) permite ejecutarlo en GPUs de consumo para aplicaciones de voz en local, con privacidad de datos. El modo streaming facilita la interacción conversacional.
- Transcripción médica y legal: el uso de hotwords permite incorporar terminología específica (nombres de fármacos, términos legales) para mejorar la precisión en dominios especializados.
- Análisis de contenido multimedia: la capacidad de procesar voz cantada y canciones con BGM permite transcribir letras, identificar idiomas en contenido musical y generar metadatos para bibliotecas de audio.
- Accesibilidad: transcripción en tiempo real para personas con discapacidad auditiva en reuniones, conferencias o contenidos educativos, con soporte multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados (MMLU, HumanEval, etc.) en la información disponible. La documentación menciona que el modelo de 1.7B alcanza "state-of-the-art" entre los ASR de código abierto y compite con APIs comerciales, pero no se proporcionan cifras concretas. Para la versión 0.6B se indica un throughput de 2000× con concurrencia de 128, pero no se especifican métricas de precisión (WER, CER) ni comparativas numéricas con otros modelos. Se recomienda consultar el paper asociado (arXiv:2601.21337) para obtener datos de evaluación detallados.

## Requisitos de hardware

- VRAM estimada: con 2.038 millones de parámetros en fp16, el modelo ocupa aproximadamente 4 GB en memoria. En cuantización de 8 bits podría reducirse a ~2 GB, y en 4 bits a ~1 GB, aunque no se han publicado configuraciones oficiales de cuantización.
- GPU recomendadas: para inferencia en producción se recomiendan GPUs con al menos 8 GB de VRAM (RTX 3060/3070, RTX 4060 Ti, A10, L4). Para despliegue a gran escala con alta concurrencia, se sugieren A100, H100 o L40S.
- Compatibilidad con GPUs de consumo: sí, cabe en RTX 3060 12 GB y superiores. La versión 0.6B es más ligera y puede ejecutarse en GPUs con 4-6 GB.
- Opciones de despliegue: compatible con Transformers nativo (v5.13.0+), lo que permite usar pipelines de Hugging Face. También se puede servir con vLLM o TGI si se adapta a la interfaz de modelos multimodales. Para streaming, se puede implementar con la API de generación de Transformers.
- Latencia y throughput: no hay datos públicos para la versión 1.7B. La versión 0.6B alcanza 2000× de throughput a concurrencia 128, lo que sugiere que la 1.7B será más lenta pero aún adecuada para producción.

## Comparativa con modelos similares

No se dispone de datos de comparativa cuantitativa en la información proporcionada. A continuación se presenta una comparación cualitativa con alternativas ASR de código abierto conocidas:

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B | 2.038M | 30 idiomas + 22 dialectos | Apache 2.0 | safetensors | Identificación de idioma integrada, streaming, soporte de canto |
| Whisper large-v3 | 1.550M | ~99 idiomas | MIT | safetensors, GGUF | ASR generalista, sin identificación de idioma explícita, sin streaming nativo |
| SeamlessM4T v2 | 2.300M | ~100 idiomas | CC-BY-NC 4.0 | safetensors | Traducción y ASR, licencia no comercial |
| Parakeet TDT 1.1B | 1.100M | inglés, español | CC-BY-4.0 | ONNX | Optimizado para inglés y español, menor cobertura multilingüe |

La comparativa se basa en características públicas conocidas; no se han encontrado benchmarks comparativos directos en la información disponible.

## Limitaciones y advertencias

- La documentación no especifica la longitud máxima de contexto de audio, por lo que el manejo de audio muy largo podría requerir segmentación manual.
- No se han publicado datos de sesgos o comportamiento en acentos no representados en los 30 idiomas y 22 dialectos soportados; es probable que el rendimiento degrade en variedades lingüísticas fuera de ese conjunto.
- Riesgo de alucinación en transcripciones de audio con ruido extremo o solapamiento de voces, aunque la documentación afirma robustez en entornos acústicos complejos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo fundacional Qwen3-Omni si se utiliza como base para otros fines.
- El modelo está diseñado principalmente para ASR; no soporta otras tareas multimodales como visión o generación de texto libre sin adaptación.
- La integración con Transformers requiere la versión 5.13.0 o superior, que puede no estar disponible en todos los entornos de producción.
- No se proporcionan garantías de latencia para la versión 1.7B; el throughput mencionado (2000×) corresponde a la versión 0.6B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- Modelo Qwen3-ASR-0.6B: https://huggingface.co/Qwen/Qwen3-ASR-0.6B-hf
- Modelo Qwen3-ForcedAligner-0.6B: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B-hf
- Paper asociado: arXiv:2601.21337 (https://arxiv.org/abs/2601.21337)
- Repositorio oficial de Qwen3-ASR (referenciado en la model card, sin URL directa en la información proporcionada)
