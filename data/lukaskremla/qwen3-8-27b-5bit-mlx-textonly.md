# lukaskremla/Qwen3.8-27B-5bit-MLX-TextOnly

## Resumen

El modelo `lukaskremla/Qwen3.8-27B-5bit-MLX-TextOnly` es una cuantización en formato MLX (Apple Silicon) de 5 bits del modelo base `Qwen/Qwen3.8-27B`. Esta versión elimina el módulo de visión (vision tower) y conserva únicamente las capacidades de texto a texto, lo que reduce el tamaño y la carga computacional para tareas puramente lingüísticas. Ha sido convertido por el autor lukaskremla utilizando la librería `mlx-lm` en su versión 0.31.2.

La relevancia de este modelo radica en que permite ejecutar un modelo de la familia Qwen (nominalmente de 27 000 millones de parámetros) en hardware Apple con memoria unificada, mediante una cuantización de 5 bits con grupo de tamaño 64 y esquema RTN. Al ser una versión solo texto, resulta adecuada para aplicaciones de generación de lenguaje, razonamiento, uso de herramientas y conversación multilingüe, sin la sobrecarga del procesamiento de imágenes.

La licencia es Apache 2.0, lo que facilita su uso comercial y modificación. No se dispone de información sobre el número exacto de parámetros activos, la longitud de contexto o los idiomas soportados, más allá de las etiquetas genéricas que indican soporte multilingüe y contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Qwen3.8-27B, detalles no publicados) |
| Parametros totales | No disponible (el conteo mostrado en safetensors es 5 045 149 184, pero el autor indica que es un error de visualización común en MLX; el modelo base se denomina 27B) |
| Parametros activos | No aplicable (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 5-bit, RTN, group-size 64, weight-only quantization |
| Idiomas soportados | No disponibles (etiqueta "multilingual" sin detalle) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Este modelo no ha sido entrenado desde cero, sino que es una conversión y cuantización del modelo base `Qwen/Qwen3.8-27B` realizada con `mlx-lm` versión 0.31.2. La cuantización utiliza un esquema de solo pesos (weight-only) con 5 bits, método RTN (round-to-nearest) y un tamaño de grupo de 64. Además, se ha eliminado el módulo de visión, quedando únicamente la parte de procesamiento de texto.

No se dispone de información sobre la arquitectura interna del modelo base (número de capas, dimensiones, tipo de atención, etc.) ni sobre los datos de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas como RLHF o DPO. El autor tampoco detalla innovaciones técnicas adicionales más allá de la cuantización y la eliminación de la torre de visión.

## Capacidades

- Generación de texto: el modelo está diseñado para tareas de generación de lenguaje natural, conversación y completado de texto.
- Razonamiento: las etiquetas indican capacidad de razonamiento, aunque no se especifican detalles sobre modos de pensamiento o cadenas de razonamiento.
- Uso de herramientas (tool use): soporta llamadas a funciones, lo que permite su integración en agentes y asistentes que necesiten interactuar con APIs o ejecutar acciones.
- Conversación multilingüe: se declara soporte multilingüe, aunque no se detallan los idiomas concretos.
- Contexto largo: la etiqueta "long-context" sugiere que el modelo puede manejar ventanas de contexto extensas, pero no se proporciona el valor numérico.
- Solo texto: no incluye capacidades de visión ni de audio.

## Casos de uso

- Asistentes conversacionales en aplicaciones de escritorio o web: el modelo puede gestionar diálogos multi-turno y responder preguntas de forma natural, aprovechando su capacidad de razonamiento y generación de texto.
- Automatización de atención al cliente: gracias al soporte de tool use, puede integrarse en sistemas que consulten bases de datos, gestionen tickets o realicen acciones en nombre del usuario.
- Generación y revisión de código en entornos de desarrollo: con su capacidad de razonamiento y generación de texto, puede asistir en la escritura de código, explicación de fragmentos o detección de errores.
- Análisis y resumen de documentos largos: la etiqueta de contexto largo permite procesar informes, artículos o contratos y extraer información relevante.
- Traducción y localización: al ser multilingüe, puede utilizarse como motor de traducción automática o para adaptar contenido a varios idiomas.
- Agentes autónomos con planificación multi-paso: el modelo puede combinar tool use y razonamiento para ejecutar tareas complejas que requieran varios pasos, como búsqueda de información y síntesis de resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo en formato MLX, está optimizado para dispositivos Apple con chip M1, M2, M3 o posteriores.
- El tamaño del repositorio es de 18,5 GB, lo que indica que la cuantización de 5 bits ocupa aproximadamente ese espacio en disco. Para inferencia, se recomienda un Mac con al menos 24 GB de memoria unificada para cargar el modelo completo y dejar margen para el contexto.
- No es compatible con GPUs NVIDIA o AMD de forma nativa; MLX está restringido al ecosistema Apple.
- El despliegue se realiza típicamente con `mlx-lm` o aplicaciones que lo integren, como `mlx_lm.generate` o servidores compatibles con MLX.
- No se dispone de datos de latencia o throughput específicos para esta cuantización.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos sobre otros modelos cuantizados comparables en el contexto de MLX o de la familia Qwen.

## Limitaciones y advertencias

- Al ser una cuantización de 5 bits, puede existir una ligera pérdida de precisión en comparación con el modelo original en FP16 o BF16, especialmente en tareas de razonamiento complejo.
- La versión es solo texto; no procesa imágenes ni otro tipo de entrada multimodal.
- El conteo de parámetros mostrado en Hugging Face (5 045 149 184) es incorrecto según el autor, que lo atribuye a un error de visualización habitual en los safetensors de MLX. Esto puede generar confusión al evaluar el tamaño real del modelo.
- No se dispone de información sobre sesgos, riesgos de alucinación o limitaciones idiomáticas específicas.
- Aunque la licencia Apache 2.0 permite uso comercial, es recomendable verificar los términos del modelo base original `Qwen/Qwen3.8-27B` por si hubiera restricciones adicionales.
- La ausencia de benchmarks publicados impide validar su rendimiento real en tareas estándar.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/lukaskremla/Qwen3.8-27B-5bit-MLX-TextOnly)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Colección de cuantizaciones MLX del autor](https://huggingface.co/collections/lukaskremla/qwen-38-27b-mlx-quants-vision-text-only-and-mtp)
