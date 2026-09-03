# NoorEman2829/food-classifier

## Resumen

El modelo `NoorEman2829/food-classifier` es un clasificador de texto binario basado en la arquitectura DistilBERT, desarrollado por NoorEman2829 como proyecto de aprendizaje a pequeña escala. Su función es predecir si una descripción textual (caption) se refiere a comida o no, con dos etiquetas: `food` y `not food`. El modelo fue fine-tuneado sobre un dataset propio de 200 captions (100 de comida y 100 de no comida), lo que lo convierte en un ejemplo didáctico de clasificación de texto con transformers, pero con limitaciones evidentes de generalización.

A pesar de su tamaño reducido (66,9 millones de parámetros, típico de DistilBERT base), el modelo no incluye información sobre licencia, idiomas soportados ni pipeline específico en su ficha de HuggingFace. Su relevancia actual es principalmente educativa: demuestra cómo adaptar un modelo preentrenado a una tarea concreta con un conjunto de datos mínimo, aunque no es recomendable para uso en producción sin una validación exhaustiva.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (base, presumiblemente) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT base soporta 512 tokens, pero no se especifica en este modelo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el dataset de entrenamiento parece estar en inglés, pero no se declara) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una versión destilada de BERT que conserva el 97% de su rendimiento con un 40% menos de parámetros. DistilBERT utiliza una arquitectura transformer con 6 capas, 12 cabezas de atención y una dimensión oculta de 768, lo que explica los 66,9 millones de parámetros. No se dispone de detalles sobre la configuración exacta del fine-tuning (tasa de aprendizaje, épocas, optimizador, etc.) en la información proporcionada.

El entrenamiento se realizó sobre el dataset `NoorEman2829/Item_dataset`, compuesto por 200 captions equilibradas (100 positivas y 100 negativas). Este tamaño es extremadamente reducido para fine-tuning, lo que sugiere un alto riesgo de sobreajuste y una baja capacidad de generalización a estilos de escritura o dominios distintos a los del conjunto de entrenamiento. No se menciona el uso de técnicas como RLHF, DPO o aumentación de datos.

## Capacidades

- Clasificación binaria de texto: determina si una descripción corresponde a comida o no.
- Generación de etiquetas con probabilidad asociada (a través de la pipeline de HuggingFace).
- Soporte básico de inferencia mediante la API de transformers.
- No se han documentado capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

Dado el carácter experimental del modelo, los casos de uso son limitados y deben considerarse con cautela:

- Demostración educativa: sirve para ilustrar el proceso de fine-tuning de un transformer en una tarea de clasificación de texto, útil en cursos o tutoriales.
- Prototipado rápido: puede integrarse en una demo para probar la viabilidad de un clasificador de comida antes de invertir en un dataset más grande.
- Filtrado de captions en redes sociales: en un entorno controlado y con un estilo de texto similar al de entrenamiento, podría usarse para etiquetar publicaciones relacionadas con comida, aunque su precisión no está garantizada.
- Análisis de menús o reseñas: podría aplicarse a textos cortos de restaurantes para identificar si mencionan alimentos, pero con riesgo de errores.
- Pruebas de concepto en entornos académicos: para comparar el rendimiento de DistilBERT frente a otros modelos en tareas de clasificación con pocos datos.
- Base para fine-tuning adicional: el modelo puede servir como punto de partida para entrenar con un dataset más amplio y mejorar su robustez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como precisión, recall, F1 o comparaciones con otros modelos en conjuntos de referencia (MMLU, GLUE, etc.). Dado el tamaño del dataset de entrenamiento, es probable que el rendimiento en datos reales sea bajo, pero no hay datos objetivos para confirmarlo.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 67 millones de parámetros, la inferencia es ligera.
- VRAM estimada: menos de 1 GB en FP32 (el tamaño del repo es 0.3 GB, lo que sugiere pesos en FP32 o FP16). Con cuantización a 8 bits, podría reducirse a ~200 MB.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM, o incluso CPU (inferencia en pocos milisegundos por muestra).
- Es compatible con consumer GPUs como RTX 3060, RTX 4090, etc., aunque no es necesario.
- Opciones de despliegue: se puede usar con la librería `transformers` de HuggingFace, o exportar a ONNX para optimización. También es posible cargarlo en `llama.cpp` si se convierte a GGUF, aunque no se proporciona ese formato.
- Latencia: en CPU moderna, la inferencia de una sola muestra suele ser inferior a 10 ms; en GPU, del orden de 1-2 ms.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. Sin embargo, se puede contextualizar con otros clasificadores de texto basados en DistilBERT:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| NoorEman2829/food-classifier | 66,9 M | no disponible | Clasificación binaria comida/no comida | no disponible |
| DistilBERT base (uncased) | 66,9 M | 512 | Modelo base preentrenado | Apache 2.0 |
| Otros fine-tunings de DistilBERT en clasificación de texto | ~66,9 M | 512 | Varía | Varía |

La comparación directa no es posible sin datos de rendimiento. El modelo se distingue por su entrenamiento en un dataset extremadamente pequeño, lo que lo hace menos fiable que alternativas entrenadas con más datos.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (200 muestras), lo que provoca un alto riesgo de sobreajuste y baja generalización a estilos de texto diferentes.
- No se especifica la licencia, por lo que su uso comercial es incierto y requiere consultar al autor.
- No se declaran los idiomas soportados; el dataset parece estar en inglés, por lo que su rendimiento en otros idiomas es desconocido.
- No se proporcionan métricas de evaluación, por lo que no se puede cuantificar su precisión.
- Posibles sesgos derivados del contenido del dataset (por ejemplo, tipos de comida representados, estilos de caption).
- Riesgo de alucinación en la clasificación: puede etiquetar incorrectamente textos ambiguos o fuera de dominio.
- No se recomienda su uso en producción sin una validación exhaustiva y un fine-tuning adicional con datos más representativos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/NoorEman2829/food-classifier)
- [Dataset de entrenamiento](https://huggingface.co/datasets/NoorEman2829/Item_dataset)
- [Repositorio de HuggingFace del autor](https://huggingface.co/NoorEman2829) (no se encontró un repositorio de código específico)
