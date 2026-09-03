# onnx-community/mt5-small-sum-de-mit-v1-ONNX

## Resumen

El modelo `onnx-community/mt5-small-sum-de-mit-v1-ONNX` es una conversión automática a formato ONNX del modelo `deutsche-telekom/mt5-small-sum-de-mit-v1`, un sistema de resumen de texto en alemán desarrollado por el equipo One Conversation de Deutsche Telekom AG. El modelo original se basa en `google/mt5-small`, la variante pequeña del modelo multilingüe T5, y está entrenado específicamente para la tarea de resumen abstractivo en alemán. La conversión a ONNX permite su ejecución en entornos optimizados, incluido el navegador mediante la librería Transformers.js.

La relevancia de este modelo radica en su licencia MIT, que permite uso comercial sin restricciones, algo poco habitual en modelos de resumen en alemán. Además, al ser una versión ONNX, facilita el despliegue en aplicaciones web, móviles y entornos de producción con baja latencia. El modelo está pensado para textos de hasta 800 tokens de entrada y genera resúmenes de hasta 96 tokens, con un prefijo de tarea `"summarize: "` durante el entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder) basado en `google/mt5-small` |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (el entrenamiento usa `max_source_length: 800` y `max_target_length: 96`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Alemán (de) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es una conversión a ONNX del checkpoint original `deutsche-telekom/mt5-small-sum-de-mit-v1`, que a su vez es un fine-tuning de `google/mt5-small`. mT5-small es un transformer encoder-decoder con aproximadamente 300 millones de parámetros (aunque este dato no se especifica en la documentación proporcionada). El entrenamiento se realizó con los siguientes hiperparámetros: batch size de 3 (con acumulación de gradientes de 2 pasos), `max_source_length` de 800 tokens, `max_target_length` de 96 tokens, `warmup_ratio` de 0.3, 10 épocas y una tasa de aprendizaje de 5e-5. Se utilizó el prefijo `"summarize: "` como instrucción de tarea.

El dataset de entrenamiento es el conjunto de entrenamiento de SwissText 2019 (German Text Summarization Challenge), que contiene 84,564 registros en alemán. Los datos se preprocesaron filtrando aquellos resúmenes con más de 94 tokens según el tokenizador de mT5-small. El equipo de Deutsche Telekom obtuvo permiso explícito para usar este dataset y publicar el modelo bajo licencia MIT. La conversión a ONNX se realizó automáticamente mediante un Space de Hugging Face, sin modificar los pesos del modelo original.

## Capacidades

- Resumen abstractivo de textos en alemán: genera un resumen condensado y reformulado del contenido de entrada.
- Generación de texto condicionada: al ser un modelo T5, puede adaptarse a otras tareas de texto a texto si se ajusta el prefijo, aunque está optimizado para resumen.
- Ejecución en navegador: gracias al formato ONNX y la integración con Transformers.js, puede ejecutarse directamente en el cliente sin servidor.
- Soporte multilingüe limitado: aunque el modelo base mT5 es multilingüe, este fine-tuning está especializado exclusivamente en alemán.
- No incluye capacidades de tool calling, visión, audio ni razonamiento multi-paso.

## Casos de uso

- Resumen de noticias en alemán: un portal de noticias puede integrar el modelo para generar automáticamente resúmenes de artículos, reduciendo el trabajo manual de redacción. Su ventana de 800 tokens permite procesar la mayoría de noticias breves.
- Resumen de documentos legales y contratos: despachos de abogados pueden resumir cláusulas extensas en alemán para facilitar la revisión rápida. El modelo es adecuado por su licencia MIT, que permite uso comercial en herramientas internas.
- Resumen de correos electrónicos: aplicaciones de gestión de correo pueden ofrecer un resumen automático de hilos largos en alemán, mejorando la productividad del usuario.
- Integración en asistentes virtuales: un chatbot o asistente puede usar el modelo para resumir conversaciones o documentos antes de responder, gracias a su formato ONNX que permite ejecución en el lado del cliente.
- Resumen de artículos científicos o técnicos en alemán: investigadores pueden procesar abstracts o secciones de papers para obtener una visión rápida del contenido.
- Aplicaciones web con Transformers.js: desarrolladores pueden desplegar el modelo directamente en el navegador, sin necesidad de infraestructura de servidor, para resumir texto pegado por el usuario. Esto es posible por el formato ONNX y la compatibilidad con la librería.

## Benchmarks y rendimiento

La model card del modelo original incluye una evaluación en el conjunto de test de MLSUM (variante alemana) sin uso de beams. Los resultados ROUGE son los siguientes:

| Modelo | rouge1 | rouge2 | rougeL | rougeLsum |
|---|---|---|---|---|
| deutsche-telekom/mt5-small-sum-de-mit-v1 (original) | 16.8023 | 3.5531 | 12.6884 | 14.7624 |
| ml6team/mt5-small-german-finetune-mlsum | 18.3607 | 5.3604 | 14.5456 | 16.1946 |
| deutsche-telekom/mt5-small-sum-de-en-v1 | 21.7336 | 7.2614 | 17.1323 | 19.3977 |

No se han publicado resultados específicos para la versión ONNX, pero al ser una conversión de pesos sin cambios, se espera un rendimiento equivalente al del modelo original.

## Requisitos de hardware

- Al ser un modelo pequeño (mT5-small), puede ejecutarse en CPU con memoria RAM moderada (se estima menos de 2 GB en FP32, aunque no se especifica).
- Es compatible con entornos de navegador mediante Transformers.js, lo que permite ejecución en dispositivos con recursos limitados.
- No se dispone de datos específicos de VRAM ni de GPU recomendadas en la documentación proporcionada.
- Opciones de despliegue: ONNX Runtime, Transformers.js, y cualquier runtime compatible con ONNX (por ejemplo, ONNX Runtime Web para navegador).
- La latencia y el throughput no están documentados, pero al ser un modelo de 300M parámetros, es adecuado para inferencia en tiempo real en CPU.

## Comparativa con modelos similares

La siguiente tabla compara el modelo original (y por extensión su versión ONNX) con otros dos modelos de resumen en alemán de tamaño similar, según los datos de la model card:

| Modelo | Parámetros | Contexto | ROUGE-1 (MLSUM) | Licencia |
|---|---|---|---|---|
| deutsche-telekom/mt5-small-sum-de-mit-v1 | no disponible (mT5-small) | 800 tokens (entrenamiento) | 16.80 | MIT |
| ml6team/mt5-small-german-finetune-mlsum | no disponible (mT5-small) | no disponible | 18.36 | no disponible |
| deutsche-telekom/mt5-small-sum-de-en-v1 | no disponible (mT5-small) | no disponible | 21.73 | no disponible |

El modelo de ml6team supera al evaluado en ROUGE, pero su licencia no está especificada. El modelo `mt5-small-sum-de-en-v1` obtiene mejores resultados, pero no se indica su licencia. La ventaja principal del modelo evaluado es su licencia MIT, que permite uso comercial sin restricciones.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con el dataset SwissText 2019, que proviene de textos suizos en alemán. Esto puede introducir sesgos regionales (variantes suizas del alemán) y limitar su rendimiento en otros dialectos o registros.
- La licencia del dataset original es poco clara, aunque el equipo de Deutsche Telekom obtuvo permiso explícito para publicar el modelo bajo MIT. Los usuarios deben verificar si el uso del dataset en sus propios proyectos requiere permisos adicionales.
- El modelo es de tamaño pequeño (mT5-small) y puede generar resúmenes con alucinaciones o inexactitudes, especialmente en textos largos o con vocabulario especializado.
- La longitud de contexto está limitada a 800 tokens de entrada y 96 de salida durante el entrenamiento; textos más largos pueden degradar la calidad del resumen.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado en un corpus periodístico, puede reflejar los sesgos presentes en los artículos originales.
- La versión ONNX no incluye cuantización ni optimizaciones adicionales; el tamaño del repositorio es de 12.1 GB, lo que sugiere que los pesos están en precisión completa (FP32) y pueden requerir más memoria que versiones cuantizadas.

## Enlaces

- Modelo ONNX en Hugging Face: https://huggingface.co/onnx-community/mt5-small-sum-de-mit-v1-ONNX
- Modelo original: https://huggingface.co/deutsche-telekom/mt5-small-sum-de-mit-v1
- Space de conversión a ONNX: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Documentación de Transformers.js para summarization: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.SummarizationPipeline
- Página del SwissText 2019 German Text Summarization Challenge: https://www.swisstext.org/2019/shared-task/german-text-summarization-challenge.html
- Declaración de permiso para el dataset (PDF): https://huggingface.co/deutsche-telekom/mt5-small-sum-de-mit-v1/resolve/main/permission-declaration-swisstext.pdf
