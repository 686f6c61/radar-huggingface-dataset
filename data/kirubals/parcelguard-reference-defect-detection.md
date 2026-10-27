# KirubaLS/parcelguard-reference-defect-detection

## Resumen

ParcelGuard es un pipeline experimental de detección de anomalías visuales guiado por referencias, publicado por el usuario KirubaLS en HuggingFace bajo el identificador `KirubaLS/parcelguard-reference-defect-detection`. No es un modelo generativo ni un transformer: se trata de un sistema de inspección visual que compara una imagen de consulta (producto a evaluar) con una o varias imágenes de referencia consideradas correctas, extrae características espaciales intermedias de un backbone ResNet18 y calcula mapas de distancia coseno posición a posición. El resultado es una puntuación de anomalía (percentil 95 de las distancias mínimas entre referencias) y una decisión binaria provisional acompañada de un mapa de calor superpuesto.

El problema que aborda es el control de calidad visual en entornos industriales y logísticos, donde no siempre se dispone de un clasificador supervisado entrenado con miles de ejemplos defectuosos. El enfoque *reference-guided* permite definir "lo normal" con unas pocas imágenes por producto y detectar desviaciones por comparación directa. El repositorio incluye el artefacto del backbone (`parcelguard_resnet18_layer2.pt`) y un clasificador basado en dos características guardado con joblib, conservado para experimentos de features.

La relevancia de esta ficha es acotada: el propio autor la marca como experimental, con una muestra de 100 imágenes de consulta, umbral exploratorio de 0,70 no validado en un conjunto de test independiente y una licencia de redistribución no establecida (`license: other`). Los resultados publicados (ROC-AUC de 0,684 con la puntuación P95) deben interpretarse como una prueba de concepto, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN preentrenada (ResNet18) usada como extractor de características espaciales de la capa `layer2`, con comparación por distancia coseno y agregación por percentil 95; no es un transformer ni un modelo de lenguaje |
| Parámetros totales | no disponible (el repositorio no publica recuento de parámetros del backbone ni del clasificador joblib) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica ni disponible; la entrada es una imagen redimensionada y normalizada para ResNet18, sin que la model card especifique la resolución exacta |
| Tipos de cuantización | no disponible; no se publican versiones cuantizadas (FP16, INT8, GGUF u otras) |
| Idiomas soportados | no aplica (modelo de visión); no disponible |
| Licencia | `other`: la licencia de redistribución del modelo no ha sido establecida de forma independiente por el autor. El dataset subyacente (Amazon Kaputt) es CC BY-NC-ND 4.0 |
| Formato de pesos | PyTorch `.pt` para el backbone (`parcelguard_resnet18_layer2.pt`) y `.joblib` para el clasificador basado en features |
| Pipeline declarado | `image-classification` |
| Tamaño del repositorio | 0,0 GB según metadatos de HuggingFace |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-10-27 / 2026-10-27 |

## Arquitectura y entrenamiento

El pipeline descrito en la model card consta de ocho pasos: carga de la imagen de consulta y de las referencias; redimensionado y normalización para ResNet18; extracción de características espaciales intermedias (capa `layer2`); comparación de las características de la consulta contra cada referencia en las posiciones correspondientes; selección de la distancia mínima entre referencias para cada ubicación; cálculo del percentil 95 de las puntuaciones de anomalía; comparación con un umbral exploratorio de 0,70; y devolución de la etiqueta predicha junto con la superposición del mapa de calor. Se trata, por tanto, de un método de *feature embedding + nearest reference distance*, en la línea de las técnicas de detección de anomalías sin entrenamiento supervisado denso, pero sin las fases de modelado de distribución (memory bank, Gaussian fitting) que usan aproximaciones más consolidadas.

No se documenta ningún proceso de entrenamiento o ajuste fino del backbone: ResNet18 actúa como extractor congelado y el único componente ajustado es un clasificador de dos características, retenido para experimentos y no utilizado por el predictor actual de imagen cruda. No hay información sobre volumen de tokens, composición de dataset de entrenamiento, RLHF, DPO ni innovaciones de decodificación (no procede). La validación experimental se realizó sobre una muestra de 100 imágenes de consulta con validación cruzada estratificada de cinco pliegues, y el umbral de 0,70 se eligió mediante diagnósticos exploratorios, sin validación en un conjunto reservado.

## Capacidades

- Detección de anomalías visuales guiada por una o varias imágenes de referencia, devolviendo etiqueta predicha (NORMAL / DEFECTUOSO) y puntuación de anomalía.
- Extracción de características espaciales con ResNet18 (`layer2`), lo que permite comparaciones posición a posición entre imagen de consulta y referencias.
- Generación de mapas de calor de anomalía superpuestos sobre la imagen original, útiles como estimación visual y no como máscara de segmentación verificada.
- Agregación multi-referencia mediante distancia mínima por ubicación, lo que aporta cierta tolerancia a variaciones entre referencias válidas.
- Puntuación robusta basada en el percentil 95 de las distancias, menos sensible a picos puntuales que un máximo global.
- Inferencia a partir de rutas de imagen (el predictor no requiere features precalculadas).
- Clasificador basado en dos características (artefacto joblib) disponible para experimentación.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de texto, de audio ni de vídeo.
- No dispone de modo *thinking* ni de decodificación especulativa.

## Casos de uso

- Inspección de embalajes en línea de envasado: con una o varias fotos de referencia por SKU capturadas en la misma posición de cámara, el sistema compara cada unidad y genera una puntuación de anomalía que permite desviar los casos dudosos a revisión manual. Adecuado porque el método no requiere ejemplos defectuosos etiquetados, que suelen ser escasos.
- Pre-filtro en pipelines de visión industrial: colocado antes de un inspector humano o de un modelo supervisado más costoso, reduce el volumen de imágenes que llegan a la siguiente etapa. Encaja por su bajo coste computacional al usar solo `layer2` de ResNet18.
- Control de calidad con vista fija y producto estandarizado: comparación de piezas individuales contra un patrón fotográfico en aplicaciones donde la orientación y la iluminación están controladas, que es la condición para la que el método está diseñado.
- Generación de evidencias visuales para operarios: el mapa de calor superpuesto sirve como apoyo explicativo en la interfaz de revisión, señalando regiones con mayor distancia respecto a la referencia (con la advertencia de que puede resaltar reflejos, embalaje o desalineaciones).
- Baseline de investigación y comparación de métodos: útil como referencia simple frente a métodos de detección de anomalías más elaborados (PatchCore, PaDiM, EfficientAD) sobre el dataset Amazon Kaputt, dado que el repositorio incluye configuración, entorno y artefactos de evaluación reproducibles.
- Prototipado rápido de casos de uso de inspección: al no requerir entrenamiento del backbone ni un conjunto supervisado, permite validar en horas si un problema de defectos es abordable por comparación con referencias antes de invertir en un modelo específico.
- Docencia y experimentación reproducible: los ficheros `requirements.txt`, `environment.json`, `pipeline_config.json` y los JSON/CSV de evaluación permiten reproducir el pipeline y discutir sus limitaciones metodológicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MVTec AD u otros) en la información disponible. Los únicos datos son resultados exploratorios internos sobre una muestra de 100 imágenes de consulta:

| Evaluación | Método | Métrica | Valor |
|---|---|---|---|
| Validación cruzada estratificada de 5 pliegues | Clasificador de dos características | Balanced accuracy | ~0,594 |
| Validación cruzada estratificada de 5 pliegues | Clasificador de dos características | ROC-AUC | ~0,607 |
| Comparación exploratoria | Puntuación P95 de anomalía | ROC-AUC | ~0,684 |

El umbral de decisión de 0,70 se seleccionó mediante diagnósticos exploratorios de umbral y no ha sido validado en un conjunto independiente. No se declara ningún resultado sobre test reservado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Por la naturaleza del backbone (ResNet18 evaluado en su capa `layer2`, con features de baja profundidad y resolución reducida), la huella de memoria es muy inferior a la de un modelo de lenguaje; la inferencia es viable en CPU.
- GPU recomendadas: no se especifican. Cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) es sobredimensionada para este pipeline; una GPU integrada o CPU puede bastar para lotes pequeños.
- Cabe en GPU consumer: sí, con margen amplio, aunque el repositorio no publica requisitos ni mediciones.
- Opciones de despliegue: el autor remite a `src/predict.py` con PyTorch; no se documentan integraciones con vLLM, TGI ni Ollama (no procede, al no ser un LLM). `llama.cpp` tampoco aplica. Un servido vía FastAPI o TorchServe envolviendo el predictor es una opción de integración, no documentada en el repositorio.
- Latencia y throughput: no disponibles. La model card no incluye mediciones de tiempo de inferencia ni de imágenes por segundo.
- Almacenamiento: el repositorio ocupa 0,0 GB según metadatos, coherente con un backbone ResNet18 y un clasificador joblib de pequeño tamaño.

## Comparativa con modelos similares

No se dispone de datos numéricos verificados de los modelos alternativos en la información proporcionada, por lo que la comparación es cualitativa.

| Modelo | Enfoque | Backbone | Requiere entrenamiento | Referencias múltiples | Licencia | Métricas publicadas |
|---|---|---|---|---|---|---|
| ParcelGuard (este modelo) | Distancia coseno a referencias + P95, umbral 0,70 | ResNet18, capa `layer2` | No (backbone congelado, clasificador de 2 features) | Sí, mínimo por ubicación | `other` (no establecida); dataset CC BY-NC-ND 4.0 | ROC-AUC ~0,684 (P95), balanced accuracy ~0,594 (clasificador), n=100 |
| PatchCore (familia de métodos *memory bank*) | Vecindad en un banco de parches de características normales | Redes preentrenadas tipo WideResNet | No supervisado, solo imágenes normales | No aplica (banco de parches) | no disponible en esta ficha | no disponible en esta ficha |
| PaDiM (modelado gaussiano por parche) | Distribuciones multivariantes por posición espacial | Redes preentrenadas tipo ResNet18 | No supervisado, solo imágenes normales | No aplica | no disponible en esta ficha | no disponible en esta ficha |
| EfficientAD | Destilación de características con estudiante profesor | CNN ligera propia | Entrenamiento sobre imágenes normales | No aplica | no disponible en esta ficha | no disponible en esta ficha |

Diferencias relevantes: ParcelGuard es el único de los cuatro que formula la detección como comparación explícita contra imágenes de referencia concretas (apto para catálogos con múltiples vistas o SKU), mientras que los otros modelan la distribución de normalidad de un único producto. Ninguno de los tres alternativos tiene métricas reproducidas aquí, y sus resultados publicados en MVTec AD no son directamente comparables con la muestra de 100 imágenes de Amazon Kaputt empleada por este modelo.

## Limitaciones y advertencias

- Muestra pequeña y posible sesgo de selección: los resultados se obtuvieron sobre 100 imágenes de consulta, sin conjunto de test independiente; el autor no reclama ningún resultado en *held-out*.
- Umbral no validado: el valor 0,70 se eligió en diagnósticos exploratorios y no se ha comprobado en datos separados; su calibración en producción es desconocida.
- Falso negativo documentado: una muestra defectuosa demostrada fue clasificada como NORMAL con el umbral 0,70.
- Mapas de calor poco específicos: pueden resaltar embalaje, reflejos, textura y diferencias de alineación en lugar de defectos reales.
- Los mapas de calor son estimaciones de anomalía, no máscaras de segmentación de defectos verificadas.
- La comparación espacial no maneja de forma robusta distintas vistas del producto; cambios de pose, escala o ángulo degradan la distancia posición a posición.
- Sin entrenamiento supervisado: no hay ajuste con ejemplos defectuosos, por lo que la sensibilidad a defectos sutiles o poco representados en las referencias es limitada.
- Idiomas y texto: no aplica, pero implica que no puede generar informes ni explicaciones textuales de la decisión.
- Licencia del modelo no establecida (`license: other`): el autor indica explícitamente que no es una conclusión legal y que debe revisarse antes de redistribuir o usar comercialmente.
- Restricción del dataset: Amazon Kaputt es CC BY-NC-ND 4.0, lo que excluye el uso comercial y las obras derivadas; las imágenes originales no se incluyen en el repositorio, pero las obligaciones de licencia aplican al modelo y artefactos derivados.
- Estado experimental: el proyecto no está validado para producción y el propio autor lo etiqueta como `experimental`.
- Sin métricas de latencia, throughput ni consumo de memoria publicadas, lo que impide dimensionar un despliegue sin pruebas propias.
- Sin versionado de modelo, sin ficha de sesgos y sin documentación de calibración por tipo de producto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KirubaLS/parcelguard-reference-defect-detection
- Predictor de imagen cruda: `src/predict.py` (incluido en el repositorio de HuggingFace)
- Artefacto del backbone: `parcelguard_resnet18_layer2.pt` (incluido en el repositorio)
- Artefactos de reproducibilidad: `requirements.txt`, `environment.json`, `pipeline_config.json`, ficheros JSON/CSV de evaluación (incluidos en el repositorio)
- Dataset Amazon Kaputt: referencia citada en la model card, sin URL incluida en la información proporcionada; consultar sus términos CC BY-NC-ND 4.0
- Paper, blog, repositorio de código independiente o demo: no disponibles en la información proporcionada
