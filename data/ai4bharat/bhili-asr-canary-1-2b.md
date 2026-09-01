# ai4bharat/bhili-asr-canary-1.2b

## Resumen

El modelo `ai4bharat/bhili-asr-canary-1.2b` es un sistema de reconocimiento automático de voz (ASR) desarrollado por AI4Bharat, específicamente diseñado para la lengua bhili, un idioma indoario hablado principalmente en los estados de Gujarat, Maharashtra y Rajastán (India). Se trata de un fine-tuning de Indic Canary, un modelo de 1.200 millones de parámetros basado en la arquitectura FastConformer-Transformer AED (Attention Encoder-Decoder), entrenado sobre aproximadamente 180 horas de habla bhili en modalidades de lectura, conversacional y espontánea.

Este modelo aborda un problema crítico: la escasez de recursos tecnológicos para lenguas de bajos recursos como el bhili. Al adaptar un modelo ASR multilingüe preentrenado a esta lengua concreta, se ofrece una herramienta práctica para transcripción automática, subtitulado y otras aplicaciones de procesado de voz. Su relevancia actual radica en el creciente interés por la inclusión lingüística en la India y en la disponibilidad de modelos de código abierto para lenguas minoritarias.

El acceso al modelo está restringido (gated) en Hugging Face, lo que implica que los usuarios deben aceptar condiciones específicas antes de su descarga. La licencia es MIT, lo que permite uso comercial y modificación, aunque el acceso condicionado puede limitar su distribución inmediata.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-Transformer AED (Attention Encoder-Decoder) |
| Parametros totales | 1.200 millones (1.2B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR, no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bhili (codigo ISO: bhb) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente formato NeMo, no confirmado) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura FastConformer-Transformer AED, una variante eficiente del conformer que combina capas de atención y convoluciones para el procesado de secuencias de audio. El modelo original, Indic Canary, fue preentrenado en múltiples lenguas indias y posteriormente afinado (fine-tuning) con datos específicos de bhili. El entrenamiento de adaptación utilizó aproximadamente 180 horas de audio bhili, que incluyen habla leída, conversacional y espontánea, lo que proporciona una cobertura razonable de variaciones dialectales y estilos de habla.

No se dispone de información detallada sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Al ser un modelo ASR, el entrenamiento se centra en la tarea de transcripción fonética y léxica, sin componentes de generación de texto libre.

## Capacidades

- Transcripción automática de voz en bhili: convierte audio en texto escrito en esta lengua.
- Manejo de diferentes estilos de habla: lectura, conversación y habla espontánea, gracias a la diversidad de los datos de entrenamiento.
- Integración con el ecosistema NeMo: el modelo se distribuye como parte de la librería NeMo de NVIDIA, lo que facilita su uso en pipelines de ASR existentes.
- Soporte para inferencia en tiempo real o por lotes, dependiendo del hardware disponible.
- Posibilidad de adaptación posterior: al ser un modelo de código abierto con licencia MIT, puede ser afinado para dominios específicos o para mejorar su rendimiento en acentos o dialectos particulares del bhili.

## Casos de uso

- Transcripción de entrevistas y testimonios orales en bhili: investigadores sociales y antropólogos pueden convertir grabaciones de campo en texto para su análisis cualitativo, gracias a la capacidad del modelo para manejar habla espontánea.
- Subtitulado automático de vídeos en bhili: creadores de contenido y plataformas de vídeo pueden generar subtítulos para material audiovisual en esta lengua, mejorando la accesibilidad y el alcance.
- Asistentes de voz para hablantes de bhili: integración en aplicaciones móviles o dispositivos domésticos que permitan comandos de voz en bhili, facilitando el acceso a la tecnología a comunidades lingüísticas minoritarias.
- Archivado y digitalización de patrimonio oral: instituciones culturales pueden transcribir grabaciones históricas en bhili para preservar y documentar la lengua y sus tradiciones orales.
- Sistemas de documentación lingüística: lingüistas que trabajan en la descripción gramatical y léxica del bhili pueden usar el modelo para acelerar la transcripción de corpus orales.
- Evaluación de calidad de servicios de voz: empresas que despliegan sistemas IVR (respuesta de voz interactiva) en regiones donde se habla bhili pueden verificar la comprensión de sus sistemas mediante transcripciones automáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como WER (Word Error Rate) o CER (Character Error Rate) para este modelo en particular, ni comparaciones con otros sistemas ASR para bhili.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Dado que el modelo tiene 1.200 millones de parámetros, se puede estimar que una cuantización de 16 bits requeriría aproximadamente 2,4 GB de VRAM solo para los pesos, más memoria para activaciones y buffers. Sin embargo, no se confirma el formato de pesos ni las cuantizaciones disponibles.
- GPU recomendadas: no se especifican. Para inferencia en tiempo real, una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070 o superior) podría ser suficiente, pero no hay datos oficiales.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño moderado del modelo, pero no hay confirmación.
- Opciones de despliegue: al ser un modelo NeMo, se puede servir con NVIDIA Triton Inference Server, o mediante scripts de inferencia de NeMo. También podría convertirse a otros formatos (ONNX, TensorRT) si se dispone de las herramientas adecuadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos ASR comparables específicamente para bhili. Existen otros modelos ASR multilingües de AI4Bharat (como IndicWav2Vec o modelos basados en Whisper afinados para lenguas indias), pero no se han encontrado datos concretos de comparación con este modelo en particular. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Acceso restringido: el modelo es de tipo gated en Hugging Face, lo que obliga a los usuarios a aceptar condiciones adicionales antes de su descarga. Esto puede limitar su adopción en entornos corporativos o académicos que requieran acceso inmediato.
- Lengua de bajos recursos: el bhili tiene una cantidad limitada de datos disponibles, y las 180 horas de entrenamiento, aunque significativas, pueden no cubrir todas las variaciones dialectales o registros. El rendimiento puede degradarse en acentos muy marcados o en dominios técnicos específicos.
- Riesgo de alucinación en transcripciones: como cualquier sistema ASR, puede producir errores de transcripción, especialmente en audio con ruido de fondo, solapamiento de hablantes o habla muy rápida.
- Sin soporte multilingüe: el modelo está especializado únicamente en bhili, por lo que no puede transcribir otras lenguas. Para aplicaciones que requieran múltiples idiomas, sería necesario combinar varios modelos.
- Dependencia del ecosistema NeMo: el uso del modelo requiere la instalación de la librería NeMo y sus dependencias, lo que puede ser complejo en entornos con restricciones de software.
- Sin información sobre sesgos: no se han publicado análisis de sesgos relacionados con género, edad o procedencia geográfica de los hablantes. Es recomendable evaluar el modelo en el dominio de aplicación concreto antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai4bharat/bhili-asr-canary-1.2b
- Repositorio de GitHub de AI4Bharat para modelos bhili: https://github.com/AI4Bharat/bhili-models/tree/master/asr/model
- Visualización de arquitectura (hfviewer): https://hfviewer.com/ai4bharat/bhili-asr-canary-1.2b
