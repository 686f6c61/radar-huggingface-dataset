# schneiderkamplab/DFM-Mimir-FP4-MLX

## Resumen

DFM-Mimir-FP4-MLX es una versión cuantizada en 4 bits del modelo Mimir v1, desarrollada por el equipo de schneiderkamplab y publicada como parte del proyecto Danish Foundation Models. Se trata del modelo base DFM-Mimir convertido al formato FP4 para su ejecución eficiente en Apple Silicon mediante la librería MLX. La arquitectura es HRM-Text (Hierarchical Reasoning Model), con 1.786.775.040 parámetros exactos según los pesos safetensors y una ventana de contexto de 4.096 tokens.

El modelo se ha entrenado desde cero con datos en danés e inglés, bajo licencia Apache 2.0, lo que permite un uso comercial sin restricciones. La cuantización FP4 reduce el tamaño del checkpoint a aproximadamente 2,16 GB, frente a los 3,2 GB de su versión bf16, facilitando su despliegue en equipos con memoria limitada. Mimir v1 se presenta como una alternativa abierta y de pequeño tamaño para aplicaciones lingüísticas en danés e inglés, con un rendimiento descrito como competitivo para su escala en el informe técnico asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HRM-Text (Hierarchical Reasoning Model) |
| Parametros totales | 1.786.775.040 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | FP4 (MLX affine quantization, 4-bit por grupo, group size 64); bf16 en el modelo base |
| Idiomas soportados | Danés (da) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (packed uint32) y safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura HRM-Text, una variante de transformer que procesa secuencias mediante un razonamiento jerárquico. Según la tabla del fabricante, el modelo cuenta con 16 capas, 12 cabezas de atención, una dimensión oculta de 1.536 y un tamaño de vocabulario de 262.144 tokens. El entrenamiento se realizó desde cero con un total de 1.750.000 pasos y aproximadamente 70.500 millones de tokens por época. La principal innovación documentada es el uso exclusivo de datos de entrenamiento permisibles, evitando los problemas de licencias asociados a muchos modelos actuales. No se han encontrado referencias a ajustes posteriores con RLHF o DPO en la información disponible; el modelo se presenta como no alineado específicamente para seguridad.

## Capacidades

- Generación de texto y conversación multi-turno en danés e inglés. El ejemplo de carga incluido en la model card muestra el uso de una plantilla de chat estándar con mensajes de roles de usuario y asistente.
- Comprensión y generación de lenguaje natural en los dos idiomas soportados, lo que permite tareas de resumen, clasificación y extracción de información.
- Razonamiento básico, respaldado por el informe técnico que afirma un rendimiento competitivo para el tamaño de 1B parámetros en tareas de lenguaje en inglés y danés.
- No se documenta soporte de tool calling, function calling, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Asistente personal local en Mac: al estar empaquetado en formato MLX y pesar solo 2,16 GB, se puede ejecutar en un MacBook con Apple Silicon sin conexión a internet, garantizando la privacidad de los datos.
- Análisis de sentimiento en danés: una empresa danesa puede procesar reseñas de clientes o comentarios en redes sociales para clasificar su tono, gracias a la capacidad del modelo para entender el idioma danés.
- Traducción asistida danés-inglés: dado que el modelo es bilingüe, permite construir herramientas de traducción entre ambos idiomas para documentos cortos, mensajes de correo o fragmentos de texto.
- Tutor o asistente educativo: puede ofrecer explicaciones y responder preguntas en danés o inglés, adaptándose a un entorno de aula o de aprendizaje autónomo.
- Generación de contenido editorial: una redacción en danés puede utilizar el modelo para crear borradores de artículos, resúmenes de noticias o descripciones de productos.
- Investigación en arquitecturas de razonamiento: gracias a su licencia open source y a la publicación del código de entrenamiento en HRM-Text, es un candidato idóneo para estudiar el comportamiento de modelos HRM de pequeño tamaño.
- Aplicaciones de IA en dispositivos Apple: desarrolladores de apps para iOS o macOS pueden integrar el modelo en flujos offline mediante MLX, por ejemplo para un corrector gramatical en danés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El checkpoint cuantizado en FP4 ocupa aproximadamente 2,16 GB en disco, por lo que puede cargarse en dispositivos Apple con al menos 8 GB de memoria unificada.
- GPU recomendadas: cualquier Apple Silicon desde M1 hasta M4, incluidas las variantes Pro, Max y Ultra. El modelo no soporta CUDA ni GPUs NVIDIA de forma nativa.
- Cabe en dispositivos consumer: sí, concretamente en Mac mini, MacBook Air y MacBook Pro con Apple Silicon.
- Opciones de despliegue: la librería mlx-lm permite cargar el modelo y generar texto con pocas líneas de Python, como se muestra en la model card.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de benchmarks ni detalles sobre modelos alternativos de la misma categoría. El único punto de referencia es el modelo base DFM-Mimir en bf16, que comparte la misma arquitectura y comportamiento, diferenciándose únicamente en el formato de pesos.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos en danés e inglés; el rendimiento será pobre en cualquier otro idioma.
- El modelo no ha sido alineado específicamente para seguridad, por lo que puede reflejar sesgos sociales presentes en su corpus de entrenamiento.
- La ventana de contexto de 4.096 tokens es reducida para tareas que requieren documentos largos o razonamiento multi-paso con mucha información.
- Los modelos de 1B tienen mayor riesgo de alucinación que los de mayor tamaño, especialmente en dominios especializados.
- El formato MLX es específico de Apple Silicon; para ejecutarlo en otros entornos (por ejemplo, CUDA) es necesario convertir los pesos, y no se proporcionan instrucciones ni garantías de compatibilidad.
- No se documenta soporte de tool calling, visión ni audio, lo que limita su uso en aplicaciones que requieran interacción con herramientas o multimodalidad.

## Enlaces

- Checkpoint FP4 MLX: https://huggingface.co/schneiderkamplab/DFM-Mimir-FP4-MLX
- Modelo base bf16: https://huggingface.co/danish-foundation-models/DFM-Mimir
- Checkpoint AWQ FP4 de origen: https://huggingface.co/schneiderkamplab/DFM-Mimir-AWQ-FP4
- Informe técnico: https://arxiv.org/pdf/2608.13517
- Repositorio de entrenamiento: https://github.com/schneiderkamplab/HRM-Text
- Proyecto Danish Foundation Models: https://foundationmodels.dk/
