# Jovanasu1989/BocniBERT

## Resumen

BocniBERT es un modelo de clasificación de texto en serbio desarrollado por el usuario Jovanasu1989 y publicado en Hugging Face. Se basa en la arquitectura ELECTRA, un transformer discriminativo que introduce el entrenamiento con "replaced token detection", una técnica que permite un preentrenamiento más eficiente que los enfoques clásicos de enmascaramiento. El modelo cuenta con aproximadamente 110,6 millones de parámetros, lo que lo sitúa en la gama de los modelos base de ELECTRA (similar a ELECTRA-base).

La relevancia de este modelo radica en que cubre un idioma de bajos recursos como el serbio, para el que existen pocos modelos de clasificación de texto específicos. Su licencia Apache-2.0 permite uso comercial sin restricciones significativas. Sin embargo, la documentación publicada es extremadamente escasa: la model card no incluye información sobre el conjunto de datos de entrenamiento, el procedimiento de ajuste fino, ni resultados de evaluación. El modelo está etiquetado para la tarea de clasificación de texto y se distribuye en formatos safetensors y ONNX, lo que facilita su integración en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ELECTRA (transformer discriminativo) |
| Parametros totales | 110.619.651 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors y ONNX) |
| Idiomas soportados | serbio (sr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

BocniBERT se basa en la arquitectura ELECTRA, descrita en el paper "ELECTRA: Pre-training Text Encoders as Discriminators Rather Than Generators" (Clark et al., 2020, arXiv:1910.09700). A diferencia de los modelos BERT que usan enmascaramiento de tokens, ELECTRA entrena un discriminador que debe detectar qué tokens han sido reemplazados por un generador auxiliar. Este enfoque permite un preentrenamiento más eficiente en términos de cómputo y suele lograr mejores resultados en tareas downstream con el mismo presupuesto de parámetros.

El modelo tiene 110,6 millones de parámetros, lo que coincide con la configuración de ELECTRA-base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención). No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas de ajuste fino como RLHF o DPO. La model card no especifica el procedimiento de entrenamiento ni los hiperparámetros utilizados. El tag "text-classification" indica que el modelo ha sido ajustado para tareas de clasificación de texto, pero se desconoce la naturaleza exacta de las etiquetas o el dominio de los datos.

## Capacidades

- Clasificación de texto en serbio: el modelo está diseñado para asignar una o varias etiquetas a fragmentos de texto en serbio, como análisis de sentimiento, detección de temas o categorización de contenido.
- Inferencia eficiente: al ser un modelo ELECTRA de tamaño base, ofrece un equilibrio razonable entre latencia y precisión para tareas de clasificación en producción.
- Compatibilidad con el ecosistema transformers: se integra con la librería Hugging Face Transformers, lo que permite su uso con pipelines estándar de clasificación de texto.
- Formato ONNX disponible: facilita el despliegue en entornos de inferencia optimizados como ONNX Runtime, lo que puede reducir la latencia en comparación con PyTorch puro.
- No se han documentado capacidades adicionales como generación de texto, tool calling, agentes, visión o audio. El modelo es exclusivamente discriminativo y de clasificación.

## Casos de uso

- Análisis de sentimiento en redes sociales en serbio: el modelo puede clasificar comentarios, tuits o reseñas como positivos, negativos o neutros, lo que resulta útil para monitorización de marca o análisis de opinión pública en mercados de habla serbia.
- Moderación de contenido en plataformas serbias: puede detectar mensajes ofensivos, spam o contenido inapropiado en foros, chats o secciones de comentarios, ayudando a mantener la calidad del contenido generado por usuarios.
- Categorización automática de noticias o artículos: permite etiquetar documentos periodísticos por temática (política, deportes, economía, etc.) para su posterior indexación o recomendación en portales de noticias serbios.
- Clasificación de correos electrónicos o tickets de soporte: puede asignar automáticamente consultas de clientes a departamentos o categorías predefinidas, mejorando la eficiencia de los equipos de atención al cliente en empresas que operan en serbio.
- Detección de spam en mensajería o formularios web: el modelo puede distinguir entre mensajes legítimos y no deseados, reduciendo la carga de moderación manual en aplicaciones web y móviles.
- Análisis de documentos legales o administrativos: puede clasificar contratos, facturas o formularios según su tipo o estado, facilitando la automatización de flujos de trabajo en el sector público o privado serbio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación como precisión, recall o F1, ni comparaciones con otros modelos. Tampoco se dispone de datos sobre el rendimiento en tareas estándar como MMLU, HumanEval o GLUE.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 110 millones de parámetros en precisión fp32 ocupa aproximadamente 440 MB de memoria. Con cuantización a int8, el requisito se reduce a unos 110 MB. No se dispone de datos sobre cuantizaciones específicas disponibles en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo sin problemas. Tarjetas como NVIDIA GTX 1050 Ti, RTX 2060 o superiores son suficientes. También puede ejecutarse en CPU con un rendimiento aceptable para inferencia por lotes pequeños.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en cualquier GPU consumer moderna, incluso en las de gama baja.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, Hugging Face Inference Endpoints, ONNX Runtime o mediante la API de transformers. También es compatible con frameworks como FastAPI para crear un servicio REST.
- Latencia y throughput: no se dispone de mediciones oficiales. En una GPU moderna (por ejemplo, RTX 3090), se espera una latencia de unos pocos milisegundos por secuencia corta, pero estos valores son estimaciones no verificadas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. No se conocen otros modelos de clasificación de texto en serbio con los que comparar directamente, ni se dispone de resultados de benchmarks de BocniBERT. Se podría mencionar que ELECTRA-base multilingüe (como `google/electra-base-discriminator`) existe, pero no está específicamente entrenado para serbio y no se dispone de datos comparativos. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Documentación insuficiente: la model card no proporciona información sobre el conjunto de datos de entrenamiento, el procedimiento de ajuste fino, ni las métricas de evaluación. Esto dificulta la evaluación de su calidad y su idoneidad para casos de uso específicos.
- Sesgos desconocidos: al no documentarse los datos de entrenamiento, no es posible conocer los sesgos potenciales del modelo en cuanto a género, etnia, dialecto o registro lingüístico.
- Riesgo de alucinación: aunque es un modelo discriminativo (no generativo), puede producir clasificaciones incorrectas o sobreconfiadas en dominios no representados en sus datos de entrenamiento.
- Limitaciones de idioma: el modelo está entrenado únicamente para serbio. No debe utilizarse para otros idiomas eslavos del sur (como croata o bosnio) sin verificar su rendimiento, ya que las diferencias léxicas y gramaticales pueden afectar a la precisión.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero no se especifican restricciones adicionales sobre el uso de los datos de entrenamiento (que no se han publicado).
- Carga de producción: al no existir benchmarks ni documentación de rendimiento, se recomienda realizar una validación exhaustiva antes de desplegar el modelo en entornos críticos.

## Enlaces

- [Hugging Face: Jovanasu1989/BocniBERT](https://huggingface.co/Jovanasu1989/BocniBERT)
- [Paper ELECTRA (arXiv:1910.09700)](https://arxiv.org/abs/1910.09700)
