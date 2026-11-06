# ParsaVictor/pcb-component-classifier

## Resumen

PCB Component Classifier es un clasificador de imágenes de componentes electrónicos discretos desarrollado por ParsaVictor. A diferencia de los modelos habituales basados en redes neuronales convolucionales o backbones preentrenados, este modelo emplea un Random Forest de scikit-learn entrenado sobre 33 características de visión por computador diseñadas manualmente (hand-engineered), lo que le permite clasificar resistencias, condensadores, diodos, inductores, transistores y circuitos integrados (ICs) a partir de una única imagen, y además explicar por qué ha tomado cada decisión (explainable AI).

El problema que resuelve es la inspección automatizada de placas de circuito impreso (PCB): identificar el tipo de componente a partir de fotografías aisladas, sin necesidad de GPU ni de un modelo preentrenado de gran tamaño. Con unos 50 ms por imagen en una CPU de portátil, es relevante para entornos de producción donde la latencia, el coste de hardware y la trazabilidad de las decisiones importan más que la máxima precisión posible.

El modelo forma parte de la PCB Inspection Suite del mismo autor, junto a un modelo hermano de detección a nivel de placa basado en YOLO (pcb-component-detection-yolo26). Fue entrenado sobre 1.195 imágenes etiquetadas en 6 clases y alcanza un 93,3 % de accuracy en un conjunto holdout de 120 imágenes nunca visto durante el entrenamiento ni el ajuste. Está publicado bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (scikit-learn) sobre 33 características de visión por computador diseñadas manualmente |
| Parametros totales | no disponible (modelo de árboles, no aplica el concepto de parámetros de redes neuronales) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes, no de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | joblib (tree_rf.joblib), junto a feature_importance.csv |

## Arquitectura y entrenamiento

El modelo es un Random Forest clásico de scikit-learn que no utiliza ningún backbone preentrenado ni aprendizaje profundo. Su entrada no son píxeles crudos, sino un vector de 33 características de visión por computador extraídas manualmente de cada imagen mediante un extractor propio disponible en el repositorio de GitHub (src/pcb_classifier/features.py). Este enfoque aporta dos ventajas: una inferencia muy ligera (~50 ms por imagen en CPU de portátil, sin GPU) y una explicabilidad nativa, ya que el modelo incluye un renderizador de explicaciones de seis paneles que muestra las rutas de decisión de los árboles, además de un fichero feature_importance.csv con las 33 características ordenadas por importancia.

El entrenamiento se realizó sobre 1.195 imágenes etiquetadas en 6 clases (resistencias, condensadores, diodos, inductores, transistores e ICs), procedentes del dataset ParsaVictor/pcb-component-classifier (fotografías de componentes aislados). La evaluación se llevó a cabo sobre un split de test estratificado del 25 % (299 muestras) y sobre un conjunto holdout de 120 imágenes nunca usado en entrenamiento ni ajuste. No se dispone de detalles sobre el número de árboles del bosque, la profundidad máxima u otros hiperparámetros. Tampoco aplica el concepto de RLHF/DPO, propio de modelos de lenguaje.

## Capacidades

- Clasificación de imágenes en 6 clases de componentes electrónicos discretos: resistencias, condensadores, diodos, inductores, transistores y circuitos integrados (ICs).
- Inferencia en CPU sin GPU: aproximadamente 50 ms por imagen en un portátil.
- Explicabilidad: rutas de decisión de los árboles renderizadas en un panel de seis vistas, e importancias de las 33 características de entrada (feature_importance.csv).
- Salida de confianza por predicción, utilizable como umbral de revisión humana (confidence gating).
- Integración con un pipeline de inspección más amplio (PCB Inspection Suite), con un modelo hermano de detección a nivel de placa (YOLO) que incluye una variante de este clasificador reentrenada sobre recortes de placas de entrenamiento (tree_rf_boards.joblib).
- No soporta capacidades de lenguaje, tool calling, agentes ni modalidades de audio; es un clasificador de imágenes especializado.

## Casos de uso

- Inspección automatizada de líneas de montaje de PCB: el modelo puede clasificar componentes individuales en ~50 ms por imagen en CPU, lo que permite integrarlo en sistemas de visión industrial de bajo coste sin invertir en GPU.
- Verificación de listas de materiales (BOM): comparar los componentes detectados en una placa con el BOM esperado, clasificando cada recorte de componente para detectar piezas mal colocadas o de tipo incorrecto.
- Control de calidad con revisión humana asistida: usando el umbral de confianza de 0,60, el sistema procesa automáticamente el 79 % de las imágenes con un 98,9 % de accuracy y deriva el 21 % restante a un operario, capturando 7 de cada 8 errores.
- Auditoría y cumplimiento normativo: gracias a las explicaciones de las rutas de decisión y a las importancias de las características, los equipos de calidad pueden documentar por qué el sistema clasificó un componente de una determinada manera, algo difícil de lograr con redes neuronales opacas.
- Educación y prototipado en electrónica: aplicaciones que identifiquen componentes a partir de fotos tomadas por aficionados o estudiantes, beneficiándose de un modelo ligero ejecutable en cualquier portátil.
- Clasificación de inventarios de componentes: organizar automáticamente fotografías de componentes sueltos en almacenes o laboratorios, etiquetándolos por tipo a partir de imágenes aisladas.
- Etapa de segundo nivel en un pipeline de detección: tras la detección de componentes a nivel de placa con el modelo hermano YOLO (pcb-component-detection-yolo26), este clasificador etiqueta cada recorte detectado, formando un sistema completo de inspección de PCB.

## Benchmarks y rendimiento

| Evaluacion | Accuracy |
|---|---|
| Test split estratificado (299 muestras) | 92,98 % |
| Holdout set (120 imagenes) | 93,33 % (112/120) |

Rendimiento por clase (test split):

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| Resistencias | 0,93 | 1,00 | 0,96 | 154 |
| Transistores | 1,00 | 0,90 | 0,95 | 21 |
| ICs | 0,97 | 0,88 | 0,92 | 32 |
| Condensadores | 0,90 | 0,92 | 0,91 | 59 |
| Inductores | 0,88 | 0,78 | 0,82 | 18 |
| Diodos | 1,00 | 0,60 | 0,75 | 15 |
| Media ponderada | 0,93 | 0,93 | 0,93 | 299 |

Rendimiento con umbral de confianza (conjunto holdout):

| Umbral | Aceptadas | Accuracy en aceptadas | Enviadas a revision | Errores capturados |
|---|---|---|---|---|
| Ninguno | 100 % | 93,3 % | 0 | 0 / 8 |
| 0,50 | 88 % | 98,1 % | 14 | 6 / 8 |
| 0,60 | 79 % | 98,9 % | 25 | 7 / 8 |
| 0,70 | 66 % | 98,7 % | 41 | 7 / 8 |

No se han publicado comparaciones con otros modelos (por ejemplo, CNNs o ViTs) en la información disponible.

## Requisitos de hardware

- No requiere GPU: el modelo se ejecuta íntegramente en CPU, con una latencia de aproximadamente 50 ms por imagen en un portátil estándar.
- VRAM estimada: no aplica; el modelo no necesita memoria de vídeo.
- GPU recomendadas: ninguna; cualquier CPU moderna es suficiente. No hay datos de consumo de RAM, aunque un Random Forest de scikit-learn con 33 características suele ser muy ligero.
- Cabe en cualquier equipo consumer, incluidos portátiles sin GPU dedicada y probablemente dispositivos embebidos con CPU, aunque esto último no está documentado.
- Opciones de despliegue: carga directa del fichero tree_rf.joblib mediante joblib (descargable con huggingface_hub.hf_hub_download). Al ser un modelo scikit-learn, es compatible con cualquier servicio que sirva modelos Python (contenedores propios, funciones serverless, etc.). No hay soporte nativo de vLLM, llama.cpp, Ollama o TGI, que son herramientas para modelos de lenguaje.
- Requisito imprescindible: el extractor de las 33 características debe instalarse desde el repositorio de GitHub (src/pcb_classifier/features.py); el modelo no procesa imágenes directamente.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Hardware | Explicabilidad | Licencia |
|---|---|---|---|---|---|
| ParsaVictor/pcb-component-classifier | Random Forest sobre 33 caracteristicas manuales | 6 tipos de componentes | CPU (~50 ms/imagen) | Alta (rutas de decision e importancias) | MIT |
| ParsaVictor/pcb-component-detection-yolo26 (modelo hermano) | YOLO (deteccion de objetos) | Deteccion a nivel de placa | GPU recomendada | Baja (tipica de redes neuronales) | no disponible |
| CNN clasica (p. ej. ResNet-18 afinada, alternativa tipica) | Red convolucional preentrenada | Segun dataset | GPU para entrenamiento; CPU viable para inferencia | Baja (requiere tecnicas como Grad-CAM) | Variable |

La comparación con CNNs es cualitativa: no se han publicado benchmarks del modelo frente a alternativas neuronales en la información disponible. La ventaja del Random Forest es el coste computacional y la explicabilidad; la desventaja esperable es un techo de precisión inferior en imágenes complejas, aunque en este dataset concreto alcanza un 93,3 % en holdout.

## Limitaciones y advertencias

- La clase "diodos" es el punto débil declarado del modelo: precisión perfecta (1,00) pero recall de solo 0,60 en 15 muestras de test, porque los diodos son visualmente muy similares a condensadores pequeños y la clase está infrarrepresentada. No debe confiarse en este modelo para detectar diodos sin revisión humana.
- Varias clases tienen muy pocas muestras de evaluación (15 diodos, 18 inductores, 21 transistores), por lo que las métricas por clase tienen un margen de error alto.
- El modelo fue entrenado sobre fotografías de componentes aislados; su rendimiento sobre recortes de placas reales puede diferir. Para ese escenario, el autor publica una variante reentrenada (tree_rf_boards.joblib) en el modelo hermano de detección.
- El modelo no procesa imágenes directamente: requiere el extractor de 33 características del repositorio de GitHub, lo que añade una dependencia de código externo que debe mantenerse sincronizada con la versión con la que se entrenó el bosque.
- Al ser un modelo de 2026 con 0 descargas registradas, no existe historial de uso en producción ni validación por terceros.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de clasificación errónea silenciosa; el propio autor recomienda usar el umbral de confianza (0,60) como puerta de revisión humana.
- Licencia MIT: permite uso comercial, modificación y redistribución con mínimas restricciones (conservar el aviso de licencia).
- No hay información sobre sesgos del dataset (condiciones de iluminación, resolución, fondo de las fotografías), que podrían afectar la generalización a entornos de captura distintos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ParsaVictor/pcb-component-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/ParsaVictor/pcb-component-classifier
- Repositorio de GitHub (pipeline completo, extractor de características y renderizador de explicaciones): https://github.com/ParsaVictor/pcb-component-classifier
- Suite completa de inspección de PCB: https://huggingface.co/ParsaVictor/pcb-inspection-suite
- Modelo hermano de detección a nivel de placa: https://huggingface.co/ParsaVictor/pcb-component-detection-yolo26
