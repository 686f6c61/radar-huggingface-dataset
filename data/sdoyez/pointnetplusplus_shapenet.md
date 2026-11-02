# SDoyez/PointNetPlusPlus_ShapeNet

## Resumen

PointNet++ es una arquitectura de red neuronal para el procesamiento de nubes de puntos 3D, publicada originalmente por Qi et al. (2017) y diseñada para tareas de clasificación y segmentación de geometría tridimensional. Este repositorio concreto, `SDoyez/PointNetPlusPlus_ShapeNet`, contiene una implementación en PyTorch de PointNet++ entrenada sobre el subconjunto de aviones del dataset ShapeNet, un corpus de referencia de mallas 3D etiquetadas. El autor, SDoyez, ha entrenado el modelo con su propio framework de envoltura sobre PyTorch, denominado OpenMLCore.

El modelo no es un modelo de lenguaje ni un transformer generativo: es un modelo de visión 3D que consume nubes de puntos y produce etiquetas de clase o segmentaciones por punto. Por tanto, no dispone de ventana de contexto, tokenizador, capacidades de tool calling ni soporte multilingüe. Su relevancia es la de un artefacto de referencia para tareas de clasificación de formas 3D, especialmente útil para experimentar con pipelines de deep learning geométrico.

El repositorio incluye pesos exportados en formato ONNX, el código base en PyTorch (`model.py`) y visualizaciones de resultados. La única métrica publicada es una accuracy de 0,9322 sobre el subconjunto de aviones de ShapeNet, con una configuración denominada "Model V1". El modelo se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointNet++ (red jerárquica de extracción de características sobre nubes de puntos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D, no secuencial) |
| Tipos de cuantizacion | no disponible (pesos exportados en ONNX) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (código PyTorch disponible en `model.py`) |
| Entrada | Nubes de puntos 3D |
| Salida | Etiquetas de clase / segmentación por punto |
| Dataset de entrenamiento | ShapeNet, subconjunto "airplane" |
| Tamaño del repositorio | 0,0 GB (según HuggingFace) |

## Arquitectura y entrenamiento

PointNet++ es una red jerárquica que aplica capas de agrupamiento y muestreo sobre nubes de puntos para extraer características locales a múltiples escalas. A diferencia de PointNet, que procesa cada punto de forma independiente y agrega una característica global, PointNet++ construye regiones locales anidadas mediante farthest point sampling y ball query, aplicando mini-redes PointNet dentro de cada región. Esta jerarquía permite capturar estructura geométrica local (bordes, esquinas, curvaturas) además de la forma global.

En este repositorio concreto, el autor indica que el entrenamiento se realizó sobre el subconjunto de aviones de ShapeNet usando su framework personal OpenMLCore, un wrapper de PyTorch disponible en GitHub. No se especifican en la información proporcionada el número de puntos por muestra, el número de tokens de entrenamiento (no aplica), la composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos, RLHF o DPO. Tampoco se detalla el número de parámetros de la red ni la configuración exacta de las capas de agrupamiento. El código base en PyTorch está incluido en el repositorio (`model.py`), lo que permite inspeccionar la arquitectura concreta.

## Capacidades

- Clasificación de formas 3D: asigna una etiqueta de clase a una nube de puntos completa (en este caso, entrenado específicamente para la clase "airplane").
- Procesamiento de nubes de puntos: consume coordenadas 3D (x, y, z) y opcionalmente normales o características adicionales por punto.
- Extracción jerárquica de características geométricas locales y globales.
- Exportación a ONNX para inferencia en entornos compatibles con ONNX Runtime.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión 2D.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje).
- No dispone de modo thinking, visión 2D, audio ni otras modalidades.

## Casos de uso

- Clasificación de modelos 3D en catálogos de assets: el modelo puede etiquetar automáticamente nubes de puntos de aviones en un pipeline de gestión de assets 3D, útil para organizar bibliotecas de modelos CAD o videojuegos.
- Preprocesado en pipelines de reconstrucción 3D: tras un escaneo o fotogrametría, el modelo puede clasificar la nube de puntos resultante para decidir el tratamiento posterior (por ejemplo, distinguir aviones de otras categorías en un dataset mixto).
- Prototipado académico en deep learning geométrico: sirve como punto de partida reproducible para experimentar con PointNet++ y comparar con otras arquitecturas de nubes de puntos, dado que incluye código PyTorch y pesos ONNX.
- Despliegue en entornos con ONNX Runtime: al estar exportado a ONNX, puede integrarse en aplicaciones C++, C# o Python que no dispongan de PyTorch, con inferencia en CPU o GPU compatible.
- Validación de pipelines de datos 3D: el modelo puede usarse como referencia para verificar que un pipeline de carga, normalización y muestreo de nubes de puntos produce resultados coherentes (accuracy esperada ~0,93 sobre aviones).
- Docencia y formación: el repositorio incluye visualizaciones de resultados y código, lo que lo hace adecuado para explicar cómo funciona PointNet++ en un curso de visión 3D o aprendizaje profundo geométrico.

## Benchmarks y rendimiento

| Modelo / Configuración | Dataset | Métrica | Valor |
|---|---|---|---|
| Model V1 | ShapeNet (subconjunto airplane) | Accuracy | 0,9322 |

No se han publicado en la información disponible resultados de benchmarks adicionales (mIoU de segmentación, comparación con otros modelos, latencia o throughput). El único dato numérico es la accuracy de 0,9322 sobre el subconjunto de aviones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. PointNet++ es una red relativamente ligera en comparación con transformers, pero el número de parámetros no se especifica.
- GPU recomendadas: no disponible. Dado el tamaño típico de PointNet++ (órdenes de magnitud de pocos millones de parámetros), cabría esperar que funcione en GPUs de gama media, pero no se confirma en la información.
- Compatibilidad con GPU de consumo: no disponible. No se especifica en la model card.
- Opciones de despliegue: ONNX Runtime (formato de pesos incluido), PyTorch (código en `model.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Dataset | Métrica publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PointNet++ (este repo) | Nubes de puntos 3D | ShapeNet airplane | Accuracy 0,9322 | MIT | HuggingFace (ONNX + PyTorch) |
| PointNet (Qi et al., 2017) | Nubes de puntos 3D | ShapeNet | no disponible en esta ficha | no disponible | Repositorio original de los autores |
| DGCNN (Wang et al., 2019) | Nubes de puntos 3D | ShapeNet | no disponible en esta ficha | no disponible | Repositorio original de los autores |
| Point Transformer (Zhao et al., 2021) | Nubes de puntos 3D | ShapeNet | no disponible en esta ficha | no disponible | Repositorio original de los autores |

No se dispone de datos comparativos numéricos en la información proporcionada para establecer una comparación cuantitativa con PointNet, DGCNN o Point Transformer. La comparación se limita a la categoría de arquitectura y al dataset de evaluación.

## Limitaciones y advertencias

- El modelo está entrenado únicamente sobre el subconjunto de aviones de ShapeNet; no se espera que generalice a otras categorías de objetos 3D sin reentrenamiento.
- No se especifican en la información el número de puntos de entrada, la resolución de las nubes de puntos ni el preprocesado exacto, lo que puede dificultar la reproducibilidad.
- La accuracy de 0,9322 corresponde a una única configuración ("Model V1") y a un subconjunto específico; no hay validación cruzada ni métricas adicionales publicadas.
- No hay información sobre sesgos del dataset ShapeNet (posibles desequilibrios de clases, sesgos geométricos o de origen de los modelos 3D).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de clasificación errónea en nubes de puntos fuera de la distribución de entrenamiento.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda citar el trabajo original de PointNet++ (Qi et al., 2017) y verificar la licencia del dataset ShapeNet para usos derivados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB según HuggingFace, lo que puede indicar que los pesos no están efectivamente alojados o que el repositorio está vacío; conviene verificar la disponibilidad real de los archivos antes de usarlo en producción.
- No se proporcionan instrucciones de uso, ejemplos de inferencia ni requisitos de preprocesado en la model card, lo que incrementa el coste de integración.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SDoyez/PointNetPlusPlus_ShapeNet
- Framework OpenMLCore (GitHub): https://github.com/sebastien-doyez2812/OpenML-core
- Paper original de PointNet++ (Qi et al., 2017): no disponible en la información proporcionada (referencia habitual: arXiv:1706.02413)
- Dataset ShapeNet: no disponible en la información proporcionada (referencia habitual: https://shapenet.org)
