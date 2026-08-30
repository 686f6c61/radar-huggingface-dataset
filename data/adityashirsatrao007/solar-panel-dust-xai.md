# adityashirsatrao007/solar-panel-dust-xai

## Resumen

`solar-panel-dust-xai` es un modelo de clasificación de imágenes desarrollado por adityashirsatrao007 para detectar si un panel fotovoltaico está limpio o sucio por acumulación de polvo. Combina un extractor de características EfficientNet-B2 (con pesos ImageNet congelados) con un clasificador SVM de kernel RBF, y está diseñado para generalizar entre distintas fuentes de adquisición de imágenes, un problema habitual en este dominio. El modelo se publica bajo licencia MIT y se distribuye como un pipeline de scikit-learn, con el clasificador SVM y el escalador en formato joblib, mientras que el backbone se carga dinámicamente desde TensorFlow/Keras en el momento de la inferencia.

La relevancia de este modelo radica en su enfoque híbrido (CNN congelada + SVM) que, según los datos reportados, mejora la transferencia entre conjuntos de datos externos frente a un entrenamiento de una sola fuente. Incluye además un módulo de IA explicable (Grad-CAM, Score-CAM, Integrated Gradients, SHAP y LIME) para auditar las predicciones. Está pensado para inspección de paneles individuales en entornos de mantenimiento de plantas solares, con una ventana de contexto no aplicable al ser un clasificador de imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B2 (backbone congelado) + SVM con kernel RBF |
| Parametros totales | no disponible (EfficientNet-B2 ~9M, no confirmado por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | joblib (.pkl) para SVM y scaler; backbone EfficientNet-B2 desde TensorFlow/Keras (no almacenado en el repo) |

## Arquitectura y entrenamiento

El modelo usa un extractor de características EfficientNet-B2 preentrenado en ImageNet, con todas sus capas congeladas. Tras un global average pooling, se obtiene un vector de 1.408 dimensiones que se normaliza con un `StandardScaler` y se alimenta a un SVM de kernel RBF con `C=10`, `gamma=auto` y `class_weight="balanced"`. Esta configuración es exactamente la del modelo de producción (versión `v007`).

El entrenamiento se realizó fusionando tres conjuntos públicos de imágenes de polvo en paneles fotovoltaicos, creando un corpus de 3.787 imágenes (2.188 limpias, 1.599 sucias). La partición fue: 3.029 para entrenamiento, 377 para validación y 381 para prueba. El autor reporta que un modelo entrenado con una sola fuente colapsaba en datos externos (recall de suciedad ~6%), mientras que la representación congelada + SVM margen mejora sustancialmente la transferencia. No se menciona el uso de RLHF, DPO u otras técnicas de alineación, al tratarse de un clasificador supervisado.

## Capacidades

- Clasificación binaria de imágenes RGB de paneles solares: etiqueta `clean` o `dirty`.
- Genera una confianza por predicción, permitiendo umbrales configurables para derivar casos ambiguos a revisión humana.
- Incluye un módulo de explicabilidad con cinco métodos: Grad-CAM, Score-CAM, Integrated Gradients, SHAP y LIME, para visualizar qué regiones de la imagen influyen en la decisión.
- Generalización entre distintas fuentes de adquisición de imágenes (validado con conjuntos externos).
- Inferencia por lotes mediante script `demo.py` (acepta una o varias imágenes).
- No soporta tool calling, agentes ni razonamiento multi-paso; es un clasificador puro.

## Casos de uso

- Mantenimiento predictivo de plantas solares: el modelo puede integrarse en un sistema de monitorización que capture imágenes periódicas de los paneles y alerte cuando detecte suciedad, optimizando la programación de limpiezas y reduciendo pérdidas de eficiencia energética.
- Inspección remota de instalaciones fotovoltaicas: mediante drones o cámaras fijas, se pueden clasificar paneles individuales y generar mapas de prioridad de limpieza, gracias a su capacidad de procesar imágenes individuales con alta precisión en conjuntos externos.
- Automatización de limpieza con IoT: combinado con sistemas de riego o robots limpiadores, el modelo puede activar la limpieza solo cuando la suciedad supera un umbral de confianza, ahorrando agua y energía.
- Auditoría de calidad en fabricación de paneles: aunque el modelo está entrenado para polvo, su arquitectura podría adaptarse para detectar defectos superficiales si se reentrena con datos adecuados (el autor menciona un proyecto relacionado con VGG16-SVM para defectos).
- Investigación en IA explicable aplicada a energías renovables: el módulo XAI permite a investigadores analizar qué características visuales contribuyen a la clasificación, útil para publicaciones y validación de modelos.
- Sistema de alerta temprana en entornos desérticos o de alta contaminación: donde la acumulación de polvo es rápida, el modelo puede ejecutarse en edge computing (por su bajo coste computacional) para monitorización continua.

## Benchmarks y rendimiento

Según la model card del autor, los resultados declarados son:

| Metrica | Valor |
|---|---|
| Test accuracy (merged held-out, 381 imgs) | 90,29% |
| AUC-ROC | 0,9596 |
| 5-fold CV accuracy | 86,38% |
| External accuracy (2.562 imgs, Dusty/Clean) | 98,24% (98,0% dirty recall) |
| External accuracy (383 imgs, Faulty-panel) | 99,74% (100% dirty recall) |

Estos valores no han sido verificados de forma independiente. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- No se especifican requisitos oficiales de VRAM ni GPU en la documentación.
- Al tratarse de un backbone EfficientNet-B2 (relativamente ligero, ~9M de parámetros) con un SVM, la inferencia puede ejecutarse en CPU con recursos modestos, aunque no hay datos de latencia o throughput publicados.
- El script `demo.py` requiere TensorFlow (para cargar EfficientNet-B2), scikit-learn, joblib, numpy y Pillow.
- Para despliegue en producción, se podría usar TensorFlow Serving o un contenedor con la API de Keras, pero no se mencionan opciones como vLLM, llama.cpp u Ollama (no aplicables a este tipo de modelo).
- La primera ejecución descarga los pesos de ImageNet (~80 MB) desde TensorFlow, por lo que se necesita conexión a internet en el arranque.

## Comparativa con modelos similares

No se dispone de información suficiente en la documentación proporcionada para realizar una comparativa cuantitativa con otros modelos de detección de polvo en paneles solares. El autor menciona un repositorio relacionado con un enfoque VGG16-SVM, pero no se aportan métricas comparables. Se recomienda consultar la literatura (por ejemplo, el artículo de MDPI o el preprint de arXiv enlazados) para contextualizar el rendimiento.

## Limitaciones y advertencias

- El modelo solo distingue entre limpio y sucio; no proporciona una medida de severidad de la suciedad.
- Está entrenado para imágenes de un solo panel; no se ha validado con imágenes de múltiples paneles o escenas complejas.
- El backbone se carga desde ImageNet en cada inferencia, lo que implica dependencia de TensorFlow/Keras y de la descarga de pesos (~80 MB) en el primer uso.
- No se han publicado análisis de sesgos ni de comportamiento en condiciones extremas (iluminación variable, ángulos de cámara, etc.).
- Aunque la licencia MIT permite uso comercial, el modelo se distribuye sin garantías; los resultados de precisión externa provienen de conjuntos específicos y pueden no generalizar a otros entornos.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere una adopción limitada y una validación comunitaria escasa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adityashirsatrao007/solar-panel-dust-xai
- Dataset utilizado: https://huggingface.co/datasets/safwanshamsir99/solar-photovoltaics-panell-for-dust-dectection
- Repositorio GitHub del autor (enfoque VGG16-SVM relacionado): https://github.com/adityashirsatrao007/Hybrid-VGG16-SVM-Framework-for-Automated-Dust-Detection-on-Solar-Panels-Advancing-Energy-Efficiency
- Artículo MDPI sobre detección de defectos y polvo en paneles: https://www.mdpi.com/2313-433X/11/9/287
- Preprint arXiv sobre detección de polvo en sistemas fotovoltaicos: https://arxiv.org/pdf/2501.08304
