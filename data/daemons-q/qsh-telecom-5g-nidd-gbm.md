# Daemons-Q/qsh-telecom-5g-nidd-gbm

## Resumen

El modelo `qsh-telecom-5g-nidd-gbm` es un clasificador tabular de ataques de red sobre tráfico 5G real, desarrollado por Daemons-Q (Amon Koike) como parte del proyecto QSMPC-QKD-QHE-AI-Hybrid, una demostración de orquestación con seguridad cuántica. Se trata de un modelo de gradient-boosted trees que opera sobre 39 características de flujo estadísticas extraídas del dataset 5G-NIDD, y clasifica cada flujo en una de 9 categorías (benigno y 8 tipos de ataque). El modelo se publica en formato ONNX y está pensado para inferencia ligera, incluso en navegador mediante onnxruntime-web.

La relevancia actual radica en que aborda un problema de detección de intrusiones en redes 5G con un enfoque pragmático: árboles de decisión potenciados sobre un corpus real de más de 1,2 millones de flujos. Además, la model card documenta un hallazgo metodológico importante: tres identificadores de fila presentes en el dataset (`Unnamed: 0`, `Seq`, `Offset`) actúan como fugas de datos y, si se incluyen, elevan la precisión a 0.9997, lo que cuestiona la validez de ciertos resultados publicados en la literatura. El modelo se publica bajo licencia CC-BY-4.0 y su repositorio tiene actualmente cero descargas y cero likes, lo que indica que es una publicación reciente y poco difundida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient-boosted trees (implementacion no especificada) |
| Parametros totales | no disponible (modelo de arboles, sin parametros de red neuronal) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo tabular) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (clasificacion tabular) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea gradient-boosted trees sobre un conjunto de 39 características de flujo de red. No se especifica la librería concreta (XGBoost, LightGBM o similar) ni la configuración de hiperparámetros. El entrenamiento se realizó sobre el dataset 5G-NIDD (Combined.csv), que contiene 1.215.890 flujos reales de una red 5G de prueba, con 52 columnas originales. De ellas, 13 se descartaron por ser inutilizables: 3 etiquetas, 3 identificadores de fila, 5 columnas idénticas a `Dur` y 2 constantes. Las 39 características restantes se usan para predecir 9 clases con el siguiente desbalance: Benign (477.737), UDPFlood (457.340), HTTPFlood (140.812), SlowrateDoS (73.124), TCPConnectScan (20.052), SYNScan (20.043), UDPScan (15.906), SYNFlood (9.721) e ICMPFlood (1.155).

La model card documenta un hallazgo crítico: los tres identificadores de fila (`Unnamed: 0`, `Seq`, `Offset`) son contadores que, por sí solos, superan el umbral de fuga de características del proyecto (AUC one-vs-rest de 0.9990, 0.9275 y 0.9502 respectivamente). Al restaurarlos en el mismo modelo, la precisión salta de 0.7610 a 0.9997, lo que sugiere que los resultados publicados de 99.6-99.7% de precisión en este corpus podrían ser reproducibles únicamente con esos contadores. El autor aclara que esto no demuestra que los trabajos citados los usaran, pero lo registra como una cuestión abierta sobre la comparación.

## Capacidades

- Clasificacion de flujos de red 5G en 9 clases (benigno y 8 tipos de ataque: UDPFlood, HTTPFlood, SlowrateDoS, TCPConnectScan, SYNScan, UDPScan, SYNFlood, ICMPFlood).
- Inferencia sobre caracteristicas estadisticas de flujo (39 features), sin necesidad de procesamiento de lenguaje ni vision.
- Soporte para ejecucion en entornos ligeros gracias al formato ONNX, incluyendo navegador via onnxruntime-web.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni soporte multilingue, al ser un modelo tabular especializado.

## Casos de uso

- Deteccion de intrusiones en redes 5G en tiempo real: el modelo puede integrarse en un pipeline de monitorizacion de trafico para clasificar flujos entrantes y alertar sobre ataques como UDPFlood o SYNScan. Su baja latencia (inferencia con arboles en ONNX) permite evaluar miles de flujos por segundo en CPU.
- Analisis forense de trafico capturado: dado un archivo de flujos 5G, el modelo puede etiquetar cada flujo para reconstruir un incidente de seguridad, ayudando a identificar patrones de ataque y vectores de compromiso.
- Evaluacion de calidad de datasets de intrusion: el hallazgo sobre las fugas de datos convierte al modelo en una herramienta para auditar otros datasets de red, comprobando si contienen identificadores de fila que inflan artificialmente las metricas.
- Sistema de alerta temprana en infraestructuras 5G privadas: desplegado en un servidor edge con ONNX Runtime, puede clasificar trafico en tiempo real y disparar respuestas automatizadas (bloqueo de IP, limitacion de ancho de banda) ante ataques de denegacion de servicio.
- Investigacion academica sobre deteccion de intrusiones: el modelo sirve como baseline reproducible para comparar nuevas tecnicas de clasificacion sobre 5G-NIDD, con la ventaja de que su configuracion y metricas estan documentadas de forma transparente.
- Demostracion de orquestacion con seguridad cuantica: dentro del proyecto QSMPC-QKD-QHE-AI-Hybrid, este modelo actua como la ruta en claro (plaintext) para el caso de uso `telecom_ids`, mientras que la ruta cifrada usa un estudiante destilado. Puede usarse para validar el funcionamiento del orquestador.

## Benchmarks y rendimiento

La model card proporciona las siguientes metricas medidas sobre el conjunto de evaluacion (n_eval = 303.973):

| Metrica | Valor |
|---|---|
| aggregate_accuracy | 0.760946 |
| macro_f1 | 0.926439 |
| leak_counterfactual_accuracy | 0.999724 |
| leak_counterfactual_accuracy_gain | 0.238778 |
| leak_counterfactual_macro_f1 | 0.999494 |
| majority_baseline | 0.392911 |
| n_classes | 9 |
| n_classes_predicted | 9 |
| n_eval | 303973 |
| n_features | 39 |
| n_samples | 1215890 |
| wall_clock_s | 93.9 |

El autor compara con dos publicaciones sobre 5G-NIDD: Wang, Fok y Thing reportan 99.61% de precisión para una CNN y 99.71% para una híbrida cuántico-clásica Quan-ConvCNN. Sin embargo, advierte que esas cifras son precisiones (accuracy), mientras que este modelo se evalúa con macro F1, y que el corpus tiene dos clases mayoritarias que suman el 76.9% de las filas, por lo que la precisión no es un comparador adecuado. Además, demuestra que con los tres contadores de fila restaurados, un modelo idéntico alcanza 0.9997 de precisión, lo que reproduce el rango publicado. No se proporcionan resultados de otros benchmarks estándar (MMLU, HumanEval, etc.) porque no aplican a un modelo tabular.

## Requisitos de hardware

- Inferencia en CPU: al ser un modelo de gradient-boosted trees en ONNX, no requiere GPU. El consumo de memoria es mínimo (el tamaño del repositorio es 0.0 GB, lo que sugiere un archivo de pocos kilobytes).
- VRAM estimada: 0 GB (no se necesita VRAM; puede ejecutarse en CPU).
- GPU recomendada: ninguna; cualquier CPU moderna es suficiente.
- Compatible con hardware de bajo consumo: Raspberry Pi, edge gateways, routers con capacidad de cómputo.
- Opciones de despliegue: ONNX Runtime (Python, C++, JavaScript), onnxruntime-web para navegador, o cualquier runtime ONNX compatible. También puede convertirse a otros formatos si se requiere.
- Latencia y throughput: no se especifican mediciones, pero por la naturaleza del modelo (árboles sobre 39 features) se espera una inferencia en el orden de microsegundos por muestra en CPU moderna, permitiendo procesar decenas de miles de flujos por segundo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (clasificación de intrusiones en 5G con gradient boosting sobre 39 features) en la documentación proporcionada. Las publicaciones citadas (CNN y Quan-ConvCNN) son arquitecturas de redes neuronales, no directamente comparables en parámetros ni en métrica (usan accuracy, no macro F1). Por tanto, no se puede establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Fuga de datos documentada: el dataset 5G-NIDD contiene tres identificadores de fila que, si se incluyen como características, inflan artificialmente la precisión hasta 0.9997. El modelo aquí presentado los excluye, pero cualquier usuario que trabaje con el dataset debe ser consciente de este riesgo.
- La precisión agregada (0.7609) puede resultar engañosa; el autor recomienda leer la macro F1 (0.9264) y las métricas por clase, ya que el corpus está muy desbalanceado (dos clases mayoritarias suman el 76.9%).
- El modelo solo clasifica flujos a nivel de red; no cubre ataques a otras capas (aplicación, transporte, etc.) ni tiene capacidades de análisis de contenido.
- No se especifican los hiperparámetros exactos del gradient boosting, lo que dificulta la reproducibilidad completa.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el modelo forma parte de un proyecto mayor (QSMPC-QKD-QHE-AI-Hybrid) con posibles dependencias adicionales; se debe revisar la licencia del repositorio completo.
- No hay información sobre sesgos específicos, pero al estar entrenado con tráfico de una única red 5G de prueba, su generalización a otras redes o entornos puede verse limitada.
- El repositorio tiene 0 descargas y 0 likes; es una publicación reciente sin validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Daemons-Q/qsh-telecom-5g-nidd-gbm
- Proyecto QSMPC-QKD-QHE-AI-Hybrid: https://github.com/thedaemon-wizard/QSMPC-QKD-QHE-AI-Hybrid
- Dataset 5G-NIDD (DOI): https://doi.org/10.23729/e80ac9df-d9fb-47e7-8d0d-01384a415361
- Paper descriptivo del dataset: Y. Siriwardhana et al., "Descriptor: 5G Wireless Network Intrusion Detection Dataset (5G-NIDD)", IEEE Data Descriptions, doi:10.1109/IEEEDATA.2025.3592888
- Repositorio del dataset en GitHub: https://github.com/yushan1986/5g-nidd
- Página del autor en HuggingFace: https://huggingface.co/Daemons-Q
