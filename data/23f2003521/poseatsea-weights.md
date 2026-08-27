# 23f2003521/poseatsea-weights

## Resumen

POSEatSea es un conjunto de pesos de modelos de aprendizaje automático desarrollado por el autor 23f2003521 para el problema SIH 26143 del NTRO, orientado a la detección de derrames de petróleo en el mar y la atribución de buques mediante datos SAR (radar de apertura sintética) y AIS (sistema de identificación automática). El repositorio contiene cuatro artefactos: un modelo U-Net con encoder MiT-B2 para segmentación semántica de imágenes SAR (5 clases, entrada de 512×512 píxeles), un LSTM para predicción de trayectorias de buques, un autoencoder para detección de anomalías en datos AIS y un escalador estándar obligatorio para preprocesar las entradas del autoencoder.

La relevancia de este modelo radica en su aplicación práctica en vigilancia marítima y respuesta a emergencias ambientales, combinando visión por computador y series temporales. Aunque el repositorio es pequeño (0.2 GB) y no incluye documentación extensa, la arquitectura es clásica y reproducible. La licencia MIT permite uso comercial y modificación sin restricciones significativas. No se dispone de información sobre el pipeline completo, idiomas soportados ni métricas detalladas más allá del IoU de 0.81 para el modelo SAR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con encoder MiT-B2 (SAR), LSTM de 2 capas (trayectorias), autoencoder denso (AIS) |
| Parametros totales | no disponible (los archivos .pth no especifican el conteo exacto) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (los modelos no son generativos; el LSTM procesa secuencias de ~60 s de cadencia) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en formato nativo .pth y .joblib) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth) y joblib (.joblib) |

## Arquitectura y entrenamiento

El repositorio contiene tres arquitecturas independientes:

- **Modelo SAR**: U-Net con encoder MiT-B2 (Mix Transformer, de la familia SegFormer) que produce segmentación semántica de 5 clases sobre imágenes SAR de 512×512. El checkpoint actual está entrenado hasta BatchNorm `num_batches_tracked = 7530` y reproduce las salidas de referencia con un IoU de 0.81 para la clase de petróleo. Se advierte explícitamente que la inferencia a resoluciones distintas de 512×512 genera ruido incoherente, lo que sugiere un entrenamiento muy ajustado a esa resolución.

- **Modelo de trayectorias**: LSTM con 2 capas de 128 unidades (entrada de 6 características, salida de 2) para predecir la siguiente posición de un buque, entrenado con datos de la zona de Mauricio y una cadencia de ping de aproximadamente 60 segundos.

- **Modelo AIS**: autoencoder denso con estructura 11→16→8→4→8→16→11 para detección de anomalías. Requiere un umbral de reconstrucción de 1.104481 y, obligatoriamente, el escalador `ais_phase1_scaler.joblib` (StandardScaler de 11 características) para normalizar las entradas; sin él, el modelo produce salidas sin sentido.

No se proporcionan detalles sobre el dataset de entrenamiento, el número total de tokens o ejemplos, ni sobre técnicas de alineación como RLHF o DPO (no aplicables a estos modelos discriminativos). Tampoco se mencionan innovaciones técnicas más allá de la combinación de arquitecturas estándar.

## Capacidades

- Segmentación semántica de imágenes SAR para detectar derrames de petróleo y otras clases marítimas (5 clases).
- Predicción de trayectorias de buques a corto plazo (siguiente posición) a partir de datos AIS.
- Detección de anomalías en datos AIS mediante reconstrucción de autoencoder, útil para identificar comportamientos inusuales de embarcaciones.
- Preprocesamiento integrado mediante StandardScaler para el modelo AIS.
- No es un modelo generativo de texto ni admite tool calling, agentes o razonamiento multi-paso.
- No tiene capacidades multilingües ni de visión general; está especializado exclusivamente en datos SAR y AIS.

## Casos de uso

- Vigilancia marítima en tiempo real: el modelo SAR puede integrarse en sistemas de monitorización de costas para detectar automáticamente manchas de petróleo en imágenes SAR, permitiendo una respuesta rápida ante vertidos. Su entrada fija de 512×512 facilita la integración en pipelines de procesamiento de imágenes satelitales.
- Atribución de vertidos a buques: combinando la detección SAR con el LSTM de trayectorias, se puede correlacionar la posición de un derrame con las rutas de los buques cercanos, ayudando a identificar al responsable.
- Análisis de comportamiento anómalo de embarcaciones: el autoencoder AIS puede utilizarse para señalar embarcaciones cuyas señales AIS se desvían de lo esperado (p. ej., apagado de transpondedor, rutas erráticas), lo que es relevante para la lucha contra la pesca ilegal o el tráfico de drogas.
- Investigación académica en detección de derrames: los pesos y el código fuente (disponible en GitHub) sirven como punto de partida para estudios comparativos o para fine-tuning con datos locales.
- Prototipos de sistemas de alerta temprana: el modelo puede desplegarse en un servidor con CPU o GPU modesta para generar alertas automáticas cuando se detecta una anomalía en los datos AIS o una mancha de petróleo en imágenes SAR.
- Formación y demostraciones: al ser un repositorio pequeño y con licencia MIT, es adecuado para cursos de visión por computador aplicada al medio marino o para validar conceptos en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El único dato de rendimiento reportado es un IoU de 0.81 para la clase de petróleo en el modelo SAR, mencionado en la model card. No hay comparaciones con otros modelos de detección de derrames ni métricas para el LSTM o el autoencoder.

## Requisitos de hardware

- El tamaño total del repositorio es de 0.2 GB, lo que indica que los pesos son ligeros. El modelo SAR (U-Net con MiT-B2) tiene un número de parámetros típico de decenas de millones, por lo que puede ejecutarse en GPUs de consumo como una NVIDIA GTX 1060 (6 GB) o superiores, e incluso en CPU con tiempos de inferencia aceptables para imágenes de 512×512.
- El LSTM y el autoencoder son redes pequeñas (del orden de decenas de miles de parámetros) y pueden ejecutarse en cualquier CPU moderna sin necesidad de GPU.
- No se especifican requisitos mínimos de VRAM ni latencias. Para el modelo SAR, se estima un uso de VRAM inferior a 2 GB en FP32, por lo que cabe en cualquier GPU comercial actual.
- Opciones de despliegue: al ser archivos .pth de PyTorch, se pueden cargar directamente con la librería `torch`. Para el autoencoder, se requiere `joblib` para cargar el escalador. No hay soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Para producción, se recomienda convertir los pesos a formato TorchScript u ONNX para optimizar la inferencia, aunque no se proporcionan scripts de exportación en la información disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (detección de derrames de petróleo con SAR y AIS). Existen otros modelos de segmentación SAR como U-Net estándar o DeepLabV3, pero no hay datos públicos que permitan una comparación directa con POSEatSea. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo SAR solo funciona correctamente con entradas de 512×512 píxeles; cualquier otra resolución produce salidas incoherentes, lo que limita su uso en imágenes de diferentes tamaños sin reentrenamiento.
- Se advierte que una exportación anterior del checkpoint SAR tenía el decoder y la cabeza sin entrenar, generando ruido. El archivo actual está corregido, pero conviene verificar la integridad del checkpoint antes de usarlo.
- El autoencoder AIS requiere obligatoriamente el escalador `ais_phase1_scaler.joblib`; omitirlo produce resultados sin sentido. Además, el umbral de anomalía (1.104481) es específico del conjunto de datos de entrenamiento y puede no generalizar a otras regiones o tipos de buques.
- El LSTM está entrenado con datos de la zona de Mauricio y una cadencia de ping de ~60 s; su uso en otras áreas geográficas o con frecuencias de datos diferentes puede degradar el rendimiento.
- No hay información sobre sesgos, riesgos de alucinación (no aplicable a modelos discriminativos) ni sobre la composición del dataset de entrenamiento. Se desconoce si los datos SAR y AIS incluyen cobertura global o solo regional.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni soporte técnico.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/23f2003521/poseatsea-weights
- Código fuente (GitHub): https://github.com/23f2003521/SIH2026
- Documento de especificación de requisitos (SRS) del proyecto POSE at SEA (referencia externa): https://www.scribd.com/document/1008377641/SRS-Signed
