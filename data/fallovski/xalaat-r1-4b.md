# Fallovski/Xalaat-R1-4B

## Resumen

Xalaat-R1-4B es un modelo de lenguaje adaptado al wolof, desarrollado por Fallovski a partir del modelo base McGill-NLP/AfriqueQwen3.5-4B-50Langs, que a su vez es una variante de Qwen3.5 ajustada para 50 lenguas africanas. El modelo se construye mediante un adaptador LoRA (rsLoRA) que se superpone al base, lo que permite especializar las capacidades del modelo hacia el wolof sin necesidad de reentrenar todos los pesos. Con 4.205 millones de parámetros totales, es un modelo compacto pensado para ejecución en entornos con recursos limitados, aunque el acceso es restringido y requiere aceptar condiciones en HuggingFace.

La relevancia de Xalaat-R1-4B reside en la escasez de modelos de lenguaje de calidad para lenguas de África occidental como el wolof, hablado por más de 10 millones de personas. Al partir de una base multilingüe de 50 lenguas, el modelo conserva capacidades generales de razonamiento y generación de texto, pero se orienta específicamente a tareas en wolof. No se han publicado detalles sobre el contexto máximo, cuantizaciones disponibles ni benchmarks, por lo que parte de la información técnica no está disponible públicamente.

El modelo está alojado en HuggingFace con el identificador `Fallovski/Xalaat-R1-4B`, en formato `safetensors` y pipeline de `text-generation`. Su licencia se indica como "other", lo que implica restricciones que deben consultarse antes de su uso comercial. El repositorio tiene un tamaño de 25.9 GB, lo que sugiere que los pesos están almacenados en precisión completa (FP16 o similar).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5) con adaptador LoRA (rsLoRA) |
| Parametros totales | 4.205.129.216 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3.5 suele ofrecer 32.768 tokens, pero no se confirma) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors en FP16) |
| Idiomas soportados | Wolof (idioma principal) y probablemente las 50 lenguas del modelo base |
| Licencia | Other (requiere consulta específica; no es Apache 2.0 estándar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Xalaat-R1-4B se construye sobre el modelo base `McGill-NLP/AfriqueQwen3.5-4B-50Langs`, que es una variante de Qwen3.5 con 4.000 millones de parámetros entrenada con 50 lenguas africanas. El autor añade un adaptador LoRA (con variante rsLoRA) que ajusta los pesos del modelo base para mejorar su rendimiento en wolof. No se han publicado detalles sobre el conjunto de datos de entrenamiento del adaptador, ni sobre el número de tokens utilizados ni el método de entrenamiento (p. ej., RLHF o DPO). La arquitectura subyacente es la de un transformer estándar con atención multi-cabeza, típica de la familia Qwen, sin innovaciones adicionales documentadas en la información disponible.

## Capacidades

- Generación de texto en wolof: el modelo está especializado para producir texto coherente y gramaticalmente correcto en este idioma.
- Razonamiento y comprensión multilingüe: al heredar el conocimiento del modelo base, puede manejar tareas de razonamiento en las 50 lenguas africanas incluidas, aunque con menor calidad en las que no son su objetivo principal.
- Conversación multi-turno: el adaptador LoRA permite mantener diálogos en wolof con contexto limitado, aunque la ventana de contexto no está confirmada.
- No se dispone de información sobre soporte de tool calling, function calling, agentes o capacidades de visión. La ausencia de estos datos indica que probablemente no son funciones implementadas.

## Casos de uso

- Traducción automática entre wolof y otras lenguas africanas o francés/inglés: el modelo puede utilizarse como motor de traducción en aplicaciones de comunicación multilingüe, aprovechando su conocimiento de las 50 lenguas del base.
- Asistente de atención al cliente en wolof: empresas con usuarios de habla wolof pueden desplegar el modelo para gestionar consultas sencillas, siempre que la ventana de contexto sea suficiente para conversaciones cortas.
- Generación de contenido educativo en wolof: creación de materiales escolares, guías o explicaciones en este idioma, útil en regiones donde la alfabetización en wolof es prioritaria.
- Transcripción y resumen de textos wolof: aunque no hay soporte de audio, el modelo puede resumir documentos escritos en wolof, facilitando la gestión de información.
- Desarrollo de herramientas de procesamiento de lenguaje natural para wolof: investigadores pueden usar este modelo como base para tareas de clasificación, extracción de información o análisis de sentimiento, aunque no se han publicado benchmarks.
- Prototipado de aplicaciones de IA con recursos limitados: al ser un modelo de 4B parámetros, puede ejecutarse en GPU de consumo medio, permitiendo pruebas locales de aplicaciones de texto en wolof sin necesidad de infraestructura avanzada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones para Xalaat-R1-4B. Tampoco se dispone de comparaciones con modelos similares en wolof o en lenguas africanas.

## Requisitos de hardware

- VRAM estimada para inferencia: para pesos en FP16, el modelo ocupa aproximadamente 8,4 GB (4.205M parámetros × 2 bytes). Con cuantización INT4 (no disponible oficialmente) se podría reducir a unos 4 GB, pero no se ofrece esa versión.
- GPU recomendadas: una GPU con al menos 12 GB de VRAM para ejecutar el modelo en FP16 sin problemas, como una RTX 3090, RTX 3080 Ti, A5000 o superior. En el caso de usar cuantización (si se convierte manualmente), podría bastar con 8 GB, como una RTX 3070.
- Compatibilidad con consumer GPU: sí, es posible ejecutarlo en GPUs de consumo medio, pero requiere al menos 8 GB de VRAM.
- Opciones de despliegue: al ser un modelo de la familia Qwen, es compatible con vLLM, llama.cpp (tras conversión a GGUF), Ollama (si se convierte) y TGI (Text Generation Inference). No se han publicado configuraciones específicas.
- Latencia y throughput: no hay datos disponibles. En una GPU como RTX 3090, un modelo de 4B suele tener una latencia de 20-50 ms por token, pero esto es una estimación general y no se ha medido para este modelo.

## Comparativa con modelos similares

No hay información disponible sobre modelos comparables específicamente para wolof o para lenguas africanas con el mismo tamaño. Se puede mencionar que otros modelos de 4B como DeepBrainz-R1-4B (que aparece en la búsqueda web) tienen una ventana de contexto de 32.768 tokens, pero no hay datos de rendimiento comparativo. En ausencia de benchmarks públicos, no es posible realizar una comparativa objetiva.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en HuggingFace, lo que significa que no se puede descargar sin aceptar las condiciones del autor. Esto puede impedir su uso en proyectos comerciales si las condiciones no lo permiten.
- Licencia `other`: no es una licencia estándar (Apache 2.0, MIT, etc.). Es imprescindible leer el texto completo de la licencia antes de cualquier uso, especialmente comercial.
- Sesgos y alucinaciones: como todo modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en dominios no cubiertos por los datos de entrenamiento. No se ha evaluado su comportamiento en wolof en entornos de producción.
- Limitación de idioma: aunque el base es multilingüe, el adaptador está específicamente entrenado para wolof. Es probable que su rendimiento en otras lenguas africanas sea inferior al del base.
- Contexto no confirmado: no se sabe la longitud de contexto real, lo que puede afectar a aplicaciones que requieran documentos largos.
- Sin soporte de herramientas ni agentes: no hay evidencia de que el modelo admita function calling o ejecución de agentes, lo que limita su uso en pipelines complejos.
- Tamaño del repositorio: 25.9 GB en FP16, lo que puede ser un obstáculo para despliegues en entornos con almacenamiento limitado.

## Enlaces

- Modelo en HuggingFace: [Fallovski/Xalaat-R1-4B](https://huggingface.co/Fallovski/Xalaat-R1-4B)
- Modelo base: [McGill-NLP/AfriqueQwen3.5-4B-50Langs](https://huggingface.co/McGill-NLP/AfriqueQwen3.5-4B-50Langs)

No se encontraron otros enlaces relevantes (papers, blogs o demos) en la búsqueda web realizada.
