# Draskeer/vit-beans-demo

## Resumen

Draskeer/vit-beans-demo es un modelo de clasificación de imágenes publicado en HuggingFace por el usuario Draskeer. Se trata de un ajuste fino (fine-tuning) del checkpoint google/vit-base-patch16-224-in21k, un Vision Transformer de tipo base preentrenado en el conjunto ImageNet-21k. El modelo final cuenta con 85.800.963 parámetros confirmados a partir de los pesos en formato safetensors, y se distribuye bajo licencia Apache 2.0.

El modelo resuelve una tarea de clasificación de imágenes cuyo conjunto de datos el propio autor declara como desconocido en la model card ("on an unknown dataset"), por lo que ni las clases de salida ni el dominio concreto están documentados más allá de lo que sugiere el nombre del repositorio. El repositorio es un artefacto de demostración generado automáticamente por la librería Trainer de Transformers, con 0 descargas y 0 "likes" en el momento de la consulta, y sin documentación adicional sobre usos previstos o limitaciones.

Su relevancia es limitada como modelo de producción, pero resulta útil como ejemplo reproducible de un pipeline de fine-tuning de ViT con Transformers 5.17.0 y PyTorch 2.11.0, y como punto de partida para tareas de clasificación de imágenes de dominio específico donde se disponga de un conjunto de datos propio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base): encoder transformer con parches de 16x16, entrada de 224x224 píxeles |
| Parámetros totales | 85.800.963 (dato confirmado en los pesos safetensors) |
| Parámetros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No aplica como contexto de texto. La entrada es una imagen de 224x224 px, tokenizada en 196 parches de 16x16 más el token [CLS] |
| Tipos de cuantización | No disponible: el repositorio solo publica pesos en precisión completa (safetensors). No se documentan versiones fp16, int8, GGUF ni ONNX |
| Idiomas soportados | No disponible: es un modelo de clasificación de imágenes, sin interfaz de texto |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, cargable con la librería transformers |
| Pipeline declarado | image-classification |
| Modelo base | google/vit-base-patch16-224-in21k |
| Tamaño del repositorio | 1,7 GB |
| Compatibilidad con endpoints | Sí (etiqueta endpoints_compatible) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-15 |
| Última actualización | 2026-09-15 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ViT-Base estándar del checkpoint google/vit-base-patch16-224-in21k: un encoder transformer que divide la imagen de entrada de 224x224 píxeles en una rejilla de 196 parches de 16x16, los proyecta a una secuencia de embeddings y antepone un token de clasificación [CLS] cuya representación final se usa para la predicción. Sobre esa base preentrenada en ImageNet-21k, el autor sustituyó la cabeza de clasificación y ajustó el modelo completo (fine-tuning, no entrenamiento de solo la cabeza) sobre un conjunto de datos no especificado.

El entrenamiento se realizó con el Trainer de Transformers durante 4 épocas, con un total de 260 pasos de optimización (65 pasos por época), lo que con un tamaño de lote de 16 implica aproximadamente 1.040 ejemplos de entrenamiento por época; esta cifra es una deducción aritmética a partir de los hiperparámetros publicados, no un dato declarado por el autor. Los hiperparámetros fueron: learning rate 5e-5, tamaño de lote 16 en entrenamiento y evaluación, semilla 42, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08 en su variante fusionada, planificador de tasa de aprendizaje lineal y 100 pasos de calentamiento. El autor no documenta la composición del dataset, si hubo aumento de datos, si se aplicaron técnicas de regularización como weight decay o dropout, ni si se emplearon fases de RLHF o DPO (no aplicables a un clasificador de imágenes). Tampoco se describe ninguna innovación técnica adicional: es un fine-tuning convencional sobre la arquitectura ViT original.

## Capacidades

- Clasificación de imágenes: asigna una etiqueta de clase a una imagen de entrada de 224x224 píxeles, siempre que la imagen pertenezca al dominio sobre el que se ajustó el modelo (dominio no documentado).
- Extracción de características visuales: al ser un ViT-Base completo, su representación del token [CLS] puede reutilizarse como embedding de imagen para búsqueda por similitud o como entrada de un clasificador posterior (kNN, regresión logística).
- Ajuste fino adicional: al ser un modelo pequeño y con licencia permisiva, sirve como punto de partida para otras tareas de clasificación de imágenes mediante transfer learning.
- No dispone de tool calling ni function calling: no es un modelo de lenguaje y no genera texto estructurado ni llamadas a funciones.
- No dispone de capacidades de agente ni de razonamiento multi-paso: la inferencia es una única pasada hacia delante que devuelve logits por clase.
- No dispone de capacidades multilingües ni de procesamiento de lenguaje natural.
- No dispone de modo de razonamiento (thinking mode), ni de entrada de audio, ni de generación de texto multimodal.
- Capacidad de despliegue en endpoints de inferencia, según la etiqueta endpoints_compatible del repositorio.

## Casos de uso

- Prototipo de clasificación de imágenes en investigación: el modelo permite validar rápidamente una hipótesis de clasificación visual (por ejemplo, categorías relacionadas con hojas o cultivos, a juzgar por el nombre del repositorio) sin partir de cero, reutilizando un ViT-Base ya ajustado.
- Punto de partida para fine-tuning de dominio: dado su tamaño de 85,8 M de parámetros y su licencia Apache 2.0, es viable reentrenarlo sobre un dataset propio en una sola GPU consumer para tareas de inspección visual, control de calidad o clasificación de productos.
- Etiquetado asistido de conjuntos de datos: el modelo puede preanotar lotes de imágenes para que un revisor humano corrija las etiquetas, reduciendo el coste del etiquetado manual en proyectos de visión artificial.
- Extracción de embeddings para búsqueda visual: usando la salida del token [CLS] se pueden construir índices vectoriales para recuperar imágenes similares en un catálogo, siempre que las imágenes compartan dominio con el ajuste original.
- Integración en un endpoint HTTP de inferencia: gracias a la compatibilidad declarada con endpoints y a su reducido tamaño, puede desplegarse como microservicio de clasificación detrás de una API REST en un contenedor con pocos recursos.
- Material docente y de reproducción de experimentos: sirve como ejemplo completo de un fine-tuning de ViT con el Trainer de Transformers, incluyendo hiperparámetros y curvas de pérdida y exactitud por época para ilustrar el sobreajuste en datasets pequeños.
- Filtrado previo en pipelines de datos: como clasificador binario o multiclase sencillo para descartar imágenes no relevantes antes de pasarlas a un modelo mayor, reduciendo coste computacional.

## Benchmarks y rendimiento

El model-index del repositorio declara una entrada (vit-beans-demo) con una lista de resultados vacía, por lo que no hay benchmarks comparativos publicados. El autor sí publica métricas de evaluación propias en la model card, que se reproducen tal cual a continuación.

Resultados declarados por el autor en el conjunto de evaluación (conjunto no especificado):

| Métrica | Valor |
|---|---|
| Pérdida (evaluación final declarada en la cabecera) | 0,1366 |
| Exactitud (evaluación final declarada en la cabecera) | 0,9609 |

Evolución por época declarada por el autor:

| Época | Paso | Pérdida de entrenamiento | Pérdida de validación | Exactitud |
|---|---|---|---|---|
| 1,0 | 65 | 0,6076 | 0,4399 | 0,9774 |
| 2,0 | 130 | 0,2123 | 0,1501 | 0,9774 |
| 3,0 | 195 | 0,1260 | 0,1620 | 0,9624 |
| 4,0 | 260 | 0,1538 | 0,0988 | 0,9774 |

Advertencia sobre estos datos: existe una incoherencia en la propia model card, ya que las cifras de la cabecera (pérdida 0,1366 y exactitud 0,9609) no coinciden con las de la última época de la tabla (pérdida 0,0988 y exactitud 0,9774). No se dispone de información para determinar cuál de los dos conjuntos de cifras corresponde a la evaluación final. No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible, y ninguno de ellos es aplicable a un clasificador de imágenes.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 344 MB solo para los pesos (85,8 M de parámetros), más el espacio para activaciones, que con lotes pequeños es reducido.
- VRAM estimada en fp16: aproximadamente 172 MB para los pesos.
- VRAM estimada en int8: aproximadamente 86 MB para los pesos, si se aplica cuantización por parte del usuario, ya que el autor no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia por lotes pequeños. Funciona sin problema en RTX 4090, RTX 3090, RTX 3060, T4, A100 y H100; en todas ellas el modelo está muy por debajo de la capacidad de memoria disponible.
- GPU consumer: sí, cabe holgadamente en cualquier GPU consumer actual e incluso en GPUs integradas y en CPU. El repositorio ocupa 1,7 GB porque incluye pesos en precisión completa, pero en memoria los pesos son de unos 344 MB.
- Opciones de despliegue: pipeline de transformers (image-classification), HuggingFace Inference Endpoints, exportación a ONNX con Optimum y ejecución con ONNX Runtime, TorchScript, o servidores de inferencia como Triton. llama.cpp y Ollama no son las vías habituales para un ViT de clasificación, aunque existen rutas de conversión parciales.
- Latencia y throughput estimados: no disponible. El autor no publica mediciones de latencia ni de imágenes por segundo en ninguna configuración de hardware.

## Comparativa con modelos similares

No se han publicado comparativas de rendimiento en la información disponible. La siguiente tabla compara únicamente características objetivas verificables de los modelos; las celdas de rendimiento se dejan como no disponibles porque no existen métricas comparables publicadas para este ajuste fino.

| Modelo | Parámetros | Resolución de entrada | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| Draskeer/vit-beans-demo | 85.800.963 | 224x224 px (parches 16x16) | Apache 2.0 | HuggingFace, safetensors | Exactitud declarada 0,9609-0,9774 en un conjunto de evaluación no especificado |
| google/vit-base-patch16-224-in21k | Aproximadamente 86 M | 224x224 px (parches 16x16) | Apache 2.0 | HuggingFace, safetensors | No disponible en esta comparativa; es el checkpoint base sin cabeza de clasificación ajustada a una tarea concreta |
| google/vit-base-patch16-224 | Aproximadamente 86 M | 224x224 px (parches 16x16) | Apache 2.0 | HuggingFace, safetensors | No disponible en esta comparativa; ajustado sobre ImageNet-1k (1.000 clases) |
| ResNet-50 (torchvision) | Aproximadamente 25,6 M | 224x224 px | BSD-3-Clause | torchvision, ONNX | No disponible en esta comparativa; arquitectura convolucional, no transformer |

La única comparación significativa y verificable es con el propio modelo base: vit-beans-demo añade una cabeza de clasificación ajustada a un dominio no documentado, mientras que google/vit-base-patch16-224-in21k es un checkpoint preentrenado sin cabeza de clasificación específica de tarea.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: el autor declara literalmente "on an unknown dataset". No se sabe qué clases predice el modelo, cuántas son, ni de qué dominio provienen las imágenes. Usarlo fuera de ese dominio producirá predicciones sin significado.
- Riesgo elevado de sobreajuste: con 4 épocas, 260 pasos totales y aproximadamente 1.040 ejemplos de entrenamiento (deducido de los hiperparámetros), la exactitud de validación ya alcanza 0,9774 en la primera época. Un conjunto de validación de tamaño reducido hace que estas cifras tengan un margen de error alto y no sean extrapolables a datos reales.
- Incoherencia de métricas: las cifras de la cabecera de la model card (pérdida 0,1366, exactitud 0,9609) no coinciden con las de la última época (pérdida 0,0988, exactitud 0,9774), lo que impide saber cuál es el resultado final real.
- Sesgos desconocidos: al no documentarse la procedencia de los datos, no es posible evaluar sesgos de representación por tipo de imagen, iluminación, fondo, resolución o demografía. Un clasificador visual entrenado con datos no auditados puede reproducir sesgos del conjunto original.
- Riesgo de alucinación en sentido de clasificación: el modelo siempre devolverá una de las clases aprendidas con una probabilidad asociada, incluso ante imágenes fuera de distribución o ruido, sin mecanismo de abstención ni de detección de desconocido.
- Sin soporte de texto ni multilingüe: no procesa instrucciones, no genera descripciones y no tiene capacidades de razonamiento, tool calling ni agentes. Cualquier expectativa en ese sentido es incorrecta.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia. Sin embargo, el autor no documenta la licencia ni la procedencia del dataset de ajuste, lo que traslada al usuario el riesgo legal sobre los datos de entrenamiento, un punto relevante antes de un despliegue comercial.
- Modelo sin validación externa: 0 descargas, 0 "likes" y sin resultados en el model-index. No hay evidencia de que terceros lo hayan evaluado ni reproducido.
- Sin información de calibración: no se publican matrices de confusión, curvas ROC, temperaturas de calibración ni umbrales recomendados, por lo que no se puede fijar a priori un umbral de confianza fiable para producción.
- Entrada fija: al derivar de google/vit-base-patch16-224-in21k, la resolución de entrada esperada es 224x224 píxeles; imágenes de otras proporciones requerirán redimensionado, lo que puede degradar el rendimiento.
- Fechas futuras en los metadatos: la fecha de creación y actualización del repositorio (2026-09-15) es posterior a la fecha habitual de los pesos publicados; conviene verificar la integridad y el origen del repositorio antes de integrarlo en un pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Draskeer/vit-beans-demo
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Resultados de la búsqueda web: ninguno de los enlaces devueltos (páginas de soporte de Microsoft sobre Hotmail, Outlook, Exchange Server y configuración de pantalla en Windows) guarda relación con este modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
