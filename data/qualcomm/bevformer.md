# qualcomm/BEVFormer

## Resumen

BEVFormer, en la versión publicada por Qualcomm, es un modelo de percepción para conducción asistida que construye una representación en vista de pájaro (Bird's-Eye View, BEV) a partir de seis imágenes de cámara simultáneas. No es un modelo de lenguaje: es un modelo de visión cuyo caso de uso declarado es `driver_assistance` (asistencia a la conducción), dentro de la unidad de negocio de automoción de Qualcomm. La implementación original procede del repositorio fundamentalvision/BEVFormer y se describe en el artículo arXiv:2203.17270.

El artefacto que aloja HuggingFace no es el modelo en formato PyTorch entrenable, sino un paquete de pesos ya exportados y optimizados para ejecutarse en la NPU (Hexagon) de los SoC de Qualcomm. Incluye assets en ONNX (float) y en QNN_DLC (float) para QAIRT 2.45 y ONNX Runtime 1.27.1, además del checkpoint original `bevformer_tiny_deformable_optimized_exp_86_epoch_24.pth`. El modelo ocupa 120 MB y tiene 27 millones de parámetros, lo que corresponde a la variante "tiny" de la familia BEVFormer.

Su relevancia es práctica: permite desplegar percepción BEV multi-cámara en plataformas embebidas de automoción (series SA, QCS, Dragonwing) y en móviles Snapdragon, con tiempos de inferencia medidos entre aproximadamente 1,2 s y 4,0 s según chipset y runtime, y con consumo de memoria pico muy variable (desde 29 MB hasta más de 1,1 GB según dispositivo). No se han publicado métricas de precisión (mAP, IoU, NDS) en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer espaciotemporal con atención deformable para representación BEV a partir de imágenes multi-cámara (según el artículo de referencia arXiv:2203.17270; el checkpoint incluye el término "deformable") |
| Parametros totales | 27 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es fija de 6 x 3 x 480 x 800 (6 cámaras, 3 canales, 480 x 800 píxeles) |
| Tipos de cuantizacion | no disponible; los únicos assets publicados son en precisión float (ONNX float y QNN_DLC float) |
| Idiomas soportados | no disponible; el modelo no procesa lenguaje, solo imágenes |
| Licencia | apache-2.0 (la licencia de la implementación original se enlaza aparte en la model card y debe verificarse) |
| Formato de pesos | ONNX (float), QNN_DLC (float) y checkpoint PyTorch `.pth` (bevformer_tiny_deformable_optimized_exp_86_epoch_24.pth) |
| Tamano del modelo | 120 MB |
| Caso de uso declarado | Model_use_case.driver_assistance |
| Preprocesado de entrada | Normalización externa con media/std de ImageNet; el modelo no normaliza internamente |
| Libreria | pytorch |
| Version de assets | v0.62.1 (Qualcomm AI Hub Models) |
| Runtime soportado | QAIRT 2.45, ONNX Runtime 1.27.1 |

## Arquitectura y entrenamiento

El título del artículo de referencia define el enfoque: "Learning Bird's-Eye-View Representation from Multi-Camera Images via Spatiotemporal Transformers". Se trata, por tanto, de un transformer espaciotemporal que toma seis vistas de cámara como entrada y produce una rejilla de representación BEV. El nombre del checkpoint (`bevformer_tiny_deformable_optimized_exp_86_epoch_24.pth`) indica que se emplea la variante "tiny" del modelo y que el mecanismo de atención es deformable; también sugiere que el checkpoint corresponde a la época 24 de un experimento etiquetado como 86.

La model card no documenta el conjunto de datos de entrenamiento, el número de muestras ni si hubo fases de ajuste fino con refuerzo o preferencias (RLHF/DPO). Tampoco se detalla la composición del dataset ni los hiperparámetros de entrenamiento. La innovación técnica que sí queda patente en los artefactos publicados no está en el entrenamiento, sino en el despliegue: Qualcomm ha exportado el modelo a ONNX y a QNN_DLC para que la inferencia se ejecute íntegramente en la NPU del chipset, con compilación y perfilado realizados mediante Qualcomm AI Hub Workbench. El modelo no incorpora decodificación especulativa ni mecanismos de atención lineal: es un transformer de atención deformable convencional optimizado para hardware concreto.

## Capacidades

- Percepción BEV multi-cámara: genera una representación en vista de pájaro a partir de seis imágenes de entrada simultáneas.
- Fusión espaciotemporal: la arquitectura de referencia combina información espacial (entre cámaras) y temporal (entre fotogramas), lo que permite mantener coherencia de la representación a lo largo del tiempo.
- Inferencia en NPU: los assets publicados están compilados para ejecutarse en la unidad de procesamiento neuronal de los SoC de Qualcomm, no en CPU ni GPU de propósito general.
- Ejecución en dispositivos embebidos: soportado en plataformas de automoción (series SA, QCS, Dragonwing) y en plataformas móviles Snapdragon.
- Exportación personalizable: la librería Qualcomm AI Hub Models permite recompilar con pesos propios (checkpoints ajustados), formas de entrada personalizadas y configuraciones de dispositivo y runtime distintas.
- No soporta generación de texto, razonamiento, código ni matemáticas: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta orquestación de agentes ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de capacidades multilingües porque no procesa lenguaje.
- No se documentan capacidades de "thinking mode", audio ni visión generativa; la salida es una representación BEV intermedia, no texto ni imágenes sintetizadas.

## Casos de uso

- Percepción para ADAS embebido: el modelo puede integrarse en la unidad de percepción de un vehículo para construir una representación BEV a partir del conjunto de cámaras surround, sirviendo de entrada a módulos posteriores de detección, predicción o planificación.
- Sistemas de aparcamiento y maniobra de baja velocidad: con latencias de aproximadamente 1,2 a 2,0 s en chipsets de gama alta, es adecuado para funciones de asistencia que no requieren control en tiempo real estricto, como la reconstrucción del entorno durante maniobras.
- Validación y prototipado en teléfono: al ejecutarse en Snapdragon 8 Gen 3 y Snapdragon 8 Elite, permite a un equipo validar el pipeline BEV en hardware móvil antes de portarlo a una plataforma de automoción.
- Integración en plataformas de cockpit y dominio de conducción: los assets para SA8775P, SA8650P, SA8255P, SA8295P y SA7255P apuntan a su uso en ordenadores de a bordo de vehículos de producción.
- Robótica móvil y AGV con múltiples cámaras: cualquier plataforma que monte un SoC Qualcomm y necesite una representación egocéntrica del entorno puede reutilizar el modelo, siempre que respete la forma de entrada 6 x 3 x 480 x 800.
- Investigación en percepción BEV: el repositorio permite exportar con pesos propios, de modo que un grupo de investigación puede ajustar el checkpoint y volver a compilarlo para medir el impacto en latencia y memoria en NPU.
- Evaluación comparativa de hardware: la tabla de rendimiento publicada por Qualcomm convierte al modelo en una carga de trabajo de referencia para medir el rendimiento de la NPU entre generaciones de chipsets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (mAP, NDS, IoU u otros) en la información disponible. Lo que sí se publica es una tabla de rendimiento de inferencia por dispositivo, con precisión float y ejecución en NPU.

| Modelo | Runtime | Precision | Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad de computo |
|---|---|---|---|---|---|---|
| BEVFormer | ONNX | float | Snapdragon X2 Elite | 1277,286 | 29 - 29 | NPU |
| BEVFormer | ONNX | float | Snapdragon X Elite | 2394,933 | 51 - 51 | NPU |
| BEVFormer | ONNX | float | Snapdragon 8 Gen 3 Mobile | 1393,623 | 0 - 1124 | NPU |
| BEVFormer | ONNX | float | Snapdragon 8 Gen 1 Mobile | 2236,206 | 26 - 1207 | NPU |
| BEVFormer | ONNX | float | Dragonwing IQ-8275 | 2320,09 | 29 - 61 | NPU |
| BEVFormer | ONNX | float | Dragonwing QCS8550 (proxy) | 1819,952 | 0 - 53 | NPU |
| BEVFormer | ONNX | float | QCS8450 | 2236,206 | 26 - 1207 | NPU |
| BEVFormer | ONNX | float | Dragonwing IQ-9075 | 1961,668 | 29 - 60 | NPU |
| BEVFormer | ONNX | float | Dragonwing IQ-X7181 | 2394,933 | 51 - 51 | NPU |
| BEVFormer | ONNX | float | Dragonwing Q-8750 | 1352,307 | 2 - 843 | NPU |
| BEVFormer | ONNX | float | Snapdragon 8 Elite Mobile | 1352,307 | 2 - 843 | NPU |
| BEVFormer | ONNX | float | Snapdragon 8 Elite Gen 5 Mobile | 1223,467 | 0 - 860 | NPU |
| BEVFormer | QNN_DLC | float | Snapdragon X2 Elite | 1295,087 | 29 - 29 | NPU |
| BEVFormer | QNN_DLC | float | Snapdragon X Elite | 1946,029 | 29 - 29 | NPU |
| BEVFormer | QNN_DLC | float | Snapdragon 8 Gen 3 Mobile | 1667,489 | 29 - 1126 | NPU |
| BEVFormer | QNN_DLC | float | Snapdragon 8 Gen 1 Mobile | 1992,252 | 4 - 1097 | NPU |
| BEVFormer | QNN_DLC | float | Dragonwing IQ-8275 | 2347,891 | 29 - 62 | NPU |
| BEVFormer | QNN_DLC | float | Dragonwing QCS8550 (proxy) | 1880,741 | 29 - 34 | NPU |
| BEVFormer | QNN_DLC | float | SA8775P | 2011,958 | 26 - 863 | NPU |
| BEVFormer | QNN_DLC | float | SA8650P | 2011,958 | 26 - 863 | NPU |
| BEVFormer | QNN_DLC | float | SA8255P | 2011,958 | 26 - 863 | NPU |
| BEVFormer | QNN_DLC | float | QCS8450 | 1992,252 | 4 - 1097 | NPU |
| BEVFormer | QNN_DLC | float | Dragonwing IQ-9075 | 2013,791 | 29 - 62 | NPU |
| BEVFormer | QNN_DLC | float | Dragonwing IQ-X7181 | 1946,029 | 29 - 29 | NPU |
| BEVFormer | QNN_DLC | float | Dragonwing Q-8750 | 1266,836 | 26 - 913 | NPU |
| BEVFormer | QNN_DLC | float | SA7255P | 3964,374 | 26 - 855 | NPU |
| BEVFormer | QNN_DLC | float | SA8295P | 2190,604 | 26 - 865 | NPU |
| BEVFormer | QNN_DLC | float | Snapdragon 8 Elite Mobile | 1266,836 | 26 - 913 | NPU |
| BEVFormer | QNN_DLC | float | Snapdragon 8 Elite Gen 5 Mobile | 1231,303 | 14 - 870 | NPU |

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en la NPU (Hexagon) de SoC Qualcomm, no en GPU de escritorio. No se proporcionan datos de VRAM para tarjetas gráficas convencionales.
- Memoria pico en dispositivo, según la tabla oficial: entre 29 MB (Snapdragon X2 Elite con ONNX) y 1207 MB (Snapdragon 8 Gen 1 Mobile con ONNX y QCS8450 con ONNX). En la mayoría de plataformas de automoción (SA8775P, SA8650P, SA8255P, SA8295P) el rango se sitúa entre 26 MB y 865 MB.
- Chipsets soportados con assets publicados: Snapdragon X2 Elite, X Elite, 8 Gen 1, 8 Gen 3, 8 Elite y 8 Elite Gen 5; Dragonwing IQ-8275, IQ-9075, IQ-X7181, Q-8750 y QCS8550; y las series QCS8450, SA7255P, SA8255P, SA8295P, SA8650P y SA8775P.
- Latencia medida: 1223,467 ms en el caso más rápido (Snapdragon 8 Elite Gen 5 Mobile con ONNX) y 3964,374 ms en el más lento (SA7255P con QNN_DLC).
- No cabe ni está pensado para GPUs de consumo tipo RTX 4090, A100 o H100; su destino son aceleradores embebidos de Qualcomm.
- Opciones de despliegue: QAIRT 2.45 (con runtime QNN_DLC) y ONNX Runtime 1.27.1. Los assets se compilan y perfilan mediante Qualcomm AI Hub Workbench.
- No se documentan métricas de throughput más allá del tiempo de inferencia por ejecución.

## Comparativa con modelos similares

No se dispone de datos de especificaciones ni de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

| Modelo | Parametros | Contexto / entrada | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BEVFormer (Qualcomm, variante tiny optimizada) | 27 M | 6 x 3 x 480 x 800 | Solo latencia y memoria por chipset (ver tabla anterior) | apache-2.0 | HuggingFace `qualcomm/BEVFormer` |
| BEVFormer original (fundamentalvision) | no disponible | no disponible | no disponible | debe consultarse en el repositorio original | GitHub `fundamentalvision/BEVFormer` |
| Otras variantes de la familia BEVFormer del repositorio original | no disponible | no disponible | no disponible | debe consultarse en el repositorio original | GitHub `fundamentalvision/BEVFormer` |
| Otros modelos de percepción BEV (BEVDet, PETR, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a instrucciones y no admite conversación. Cualquier ficha o expectativa de uso tipo LLM es inaplicable.
- La model card no documenta el dataset de entrenamiento ni su composición, por lo que no es posible caracterizar sesgos conocidos ni evaluar su comportamiento en dominios distintos al de entrenamiento.
- No se publican métricas de precisión (mAP, NDS, IoU) ni evaluaciones de seguridad, de modo que no se puede validar la calidad de la representación BEV producida con los datos disponibles.
- La licencia del repositorio es apache-2.0, pero la model card remite explícitamente a la licencia de la implementación original para más detalle; conviene verificar ambas antes de un uso comercial.
- La entrada está fijada en 6 cámaras a resolución 3 x 480 x 800. Cualquier configuración con otro número de cámaras o resolución distinta requiere recompilar mediante la librería Qualcomm AI Hub Models.
- El modelo no normaliza internamente las imágenes: es obligatorio aplicar la normalización con media y desviación típica de ImageNet antes de la inferencia. Omitirla degrada la salida sin aviso.
- Las latencias publicadas (desde 1,2 s hasta casi 4 s) limitan su uso a funciones de asistencia y no a lazos de control en tiempo real estricto.
- El consumo de memoria pico varía de forma muy acusada entre plataformas (de 29 MB a más de 1,1 GB), lo que obliga a validar la configuración en el chipset objetivo y no asumir traslación directa entre dispositivos.
- Al estar compilado para NPU de Qualcomm, la portabilidad a otros aceleradores requiere volver a exportar desde el modelo original.
- No hay datos de descargas ni de adopción en HuggingFace, por lo que no existe evidencia comunitaria de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/BEVFormer
- Articulo de referencia (arXiv): https://arxiv.org/abs/2203.17270
- Implementación original en GitHub: https://github.com/fundamentalvision/BEVFormer/
- Licencia de la implementación original: https://github.com/fundamentalvision/BEVFormer/blob/master/LICENSE
- Página del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/bevformer
- Librería Qualcomm AI Hub Models (utilidades de exportación): https://github.com/qualcomm/ai-hub-models/blob/v0.62.1/src/qai_hub_models/models/bevformer
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Descarga de assets ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/bevformer/releases/v0.62.1/bevformer-onnx-float.zip
- Descarga de assets QNN_DLC float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/bevformer/releases/v0.62.1/bevformer-qnn_dlc-float.zip
