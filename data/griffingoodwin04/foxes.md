# griffingoodwin04/FOXES

## Resumen

FOXES (Framework for Operational X-ray Emission Synthesis) es un modelo de visión por computador desarrollado por un equipo del Frontier Development Lab (Heliolab 2025) para predecir la irradiancia solar en rayos X blandos (SXR) a partir de observaciones de extremo ultravioleta (EUV) con resolución espacial. El modelo, basado en un Vision Transformer (ViT), traduce imágenes del Atmospheric Imaging Assembly (AIA) a bordo del Solar Dynamics Observatory (SDO) en predicciones de flujo SXR, que es la métrica estándar para clasificar la intensidad de las fulguraciones solares.

La principal motivación del proyecto es superar las limitaciones de las mediciones SXR actuales, que carecen de información espacial y solo son válidas desde la órbita terrestre. FOXES produce dos salidas: un flujo SXR global y contribuciones por parche de la imagen, lo que permite interpretar espacialmente dónde se atribuye la emisión SXR. Esto abre la puerta a extender la detección de fulguraciones más allá de la línea de visión terrestre, habilitando un sistema de monitorización multivista para el clima espacial.

El modelo se distribuye bajo licencia MIT, con un repositorio de aproximadamente 0,5 GB que incluye código de entrenamiento, inferencia y evaluación, junto con tres checkpoints entrenados y un dataset asociado de 194 000 muestras. Está diseñado para tareas de image-to-image y time-series forecasting, aunque su aplicación principal es la predicción de series temporales de flujo SXR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con cabezas de flujo por parche (ViTLocal) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente PyTorch .ckpt o .pt, no confirmado) |

## Arquitectura y entrenamiento

FOXES emplea un Vision Transformer con una arquitectura modificada denominada ViTLocal, que añade cabezas de flujo por parche a la salida del transformer. Cada parche de la imagen de entrada (observaciones EUV de SDO/AIA) contribuye con una predicción de flujo SXR, y la suma de todas las contribuciones produce el flujo global. Esta diseño permite una interpretación espacial de la emisión SXR, algo que no es posible con las mediciones tradicionales de GOES.

El entrenamiento se realizó con datos emparejados de imágenes AIA (512x512 píxeles) y curvas de luz SXR de GOES, procesados mediante un pipeline que incluye limpieza de archivos FITS, conversión a stacks .npy y alineación temporal. El dataset FOXES-Data contiene 194 000 muestras. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se utilizaron técnicas de RLHF o DPO (no aplicables a un modelo de visión). El código de entrenamiento usa PyTorch Lightning con registro en Weights & Biases, e incluye callbacks para visualizar predicciones y mapas de atención.

## Capacidades

- Predicción de flujo SXR global a partir de imágenes EUV de SDO/AIA.
- Generación de mapas de contribución por parche, que indican espacialmente dónde el modelo atribuye la emisión SXR.
- Detección de actividad solar y fulguraciones mediante la interpretación de las contribuciones por parche.
- Capacidad de extrapolar la detección de fulguraciones más allá de la línea de visión terrestre, al basarse en imágenes EUV que pueden obtenerse desde otros puntos del heliosfera.
- Soporte para inferencia en tiempo real sobre datos de entrada, con scripts de inferencia y evaluación incluidos en el repositorio.
- No es un modelo de lenguaje: no genera texto, código ni realiza razonamiento simbólico.

## Casos de uso

- Clasificación de fulguraciones solares: el modelo puede sustituir o complementar las mediciones de GOES SXR para clasificar la intensidad de las fulguraciones, proporcionando además información espacial sobre la región activa responsable.
- Predicción de clima espacial: al integrar FOXES en pipelines de pronóstico, se puede mejorar la estimación de velocidad de eyecciones de masa coronal o de producción de partículas energéticas, utilizando el flujo SXR predicho como entrada.
- Monitorización heliosférica multivista: al basarse en imágenes EUV, FOXES permite detectar fulguraciones desde observatorios situados en otros puntos del sistema solar, creando un catálogo de fulguraciones más completo y fiable que el basado únicamente en GOES.
- Análisis de regiones activas: los mapas de contribución por parche permiten identificar qué zonas de la corona solar están emitiendo en SXR, útil para estudios de física solar y para correlacionar con otras observaciones.
- Operaciones de satélites y misiones espaciales: la predicción de flujo SXR puede usarse para alertar de condiciones de radiación peligrosas para instrumentos o astronautas, especialmente en misiones fuera de la órbita terrestre.
- Investigación en heliofísica: el modelo sirve como herramienta de investigación para estudiar la relación entre la emisión EUV y SXR, y para validar modelos teóricos de calentamiento coronal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un script de evaluación que calcula métricas y genera gráficos, pero no se proporcionan valores numéricos de rendimiento (por ejemplo, error cuadrático medio, correlación, etc.) en la documentación accesible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio (0,5 GB) sugiere que el modelo es relativamente ligero, pero no se especifican los requisitos de memoria.
- GPU recomendadas: no disponible. Dado el tamaño, es probable que pueda ejecutarse en GPUs consumer como RTX 3060 o superiores, pero no hay confirmación oficial.
- Compatibilidad con consumer GPU: probablemente sí, dado el tamaño del modelo, pero no confirmado.
- Opciones de despliegue: el repositorio proporciona scripts de inferencia en Python (inference.py) que cargan un checkpoint y procesan datos. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (traducción EUV a SXR). Existen otros enfoques en heliofísica que utilizan redes neuronales para predecir fulguraciones, pero no se han identificado modelos específicos con los que comparar directamente en la información proporcionada. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo está entrenado específicamente con datos de SDO/AIA y GOES, por lo que su rendimiento puede degradarse con observaciones de otros instrumentos o con condiciones solares fuera del rango de entrenamiento.
- La predicción de flujo SXR se basa en la relación empírica entre EUV y SXR, que puede no ser estable durante eventos extremos o en fases del ciclo solar poco representadas en el dataset.
- No se han publicado métricas de error ni estudios de robustez, por lo que su fiabilidad en producción no está cuantificada.
- El modelo no proporciona incertidumbre en sus predicciones, lo que limita su uso en aplicaciones donde se requiera cuantificación de riesgo.
- La licencia MIT permite uso comercial, pero el modelo se distribuye sin garantías y el autor no ofrece soporte oficial.
- Al ser un modelo de visión, no es adecuado para tareas de procesamiento de lenguaje natural ni para razonamiento simbólico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/griffingoodwin04/FOXES
- Space de demostración: https://huggingface.co/spaces/griffingoodwin04/FOXES-model
- Dataset asociado: https://huggingface.co/datasets/griffingoodwin04/FOXES-Data
- Repositorio GitHub: https://github.com/griffin-goodwin/FOXES
- DOI: 10.57967/hf/8685
