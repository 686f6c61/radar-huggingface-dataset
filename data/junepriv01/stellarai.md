# junepriv01/stellarai

## Resumen

StellarAI es un repositorio de Hugging Face publicado por el usuario `junepriv01` que contiene una conversión a formato ONNX del modelo GeoCalib, un sistema de calibración de cámara desarrollado por el grupo Computer Vision and Geometry (CVG) de ETH Zúrich y presentado en ECCV 2024. No se trata de un modelo de lenguaje generativo ni de un modelo fundacional conversacional, sino de un modelo de visión por computador especializado en estimar los parámetros intrínsecos y extrínsecos de una cámara a partir de una única imagen.

La relevancia del repositorio es limitada y su alcance muy concreto: ofrece los pesos de GeoCalib empaquetados en ONNX con precisión fp16 y bases NMF fijas, lo que facilita su despliegue en entornos de inferencia que no disponen de PyTorch, como aplicaciones de escritorio, navegador (ONNX Runtime Web) o dispositivos embebidos. El tamaño del repositorio es de aproximadamente 0,1 GB.

La información pública disponible es muy escasa: el repositorio no declara pipeline, licencia propia, idiomas ni métricas de uso (0 descargas y 0 likes en el momento de la consulta). La model card únicamente documenta la procedencia de los pesos y el script de conversión, remitiendo a la licencia del proyecto original (código Apache-2.0, pesos CC-BY-4.0 con atribución obligatoria).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para calibración de cámara (GeoCalib, CVG ETH Zúrich); topología interna no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | fp16 (conversión ONNX con bases NMF fijas) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Pesos CC-BY-4.0 (atribución obligatoria); código original Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

GeoCalib es un modelo de calibración de cámara de una sola imagen presentado en ECCV 2024 por A. Veicht, P.-E. Sarlin, P. Lindenberger y M. Pollefeys (ETH Zúrich). El enfoque combina optimización basada en aprendizaje con un solver geométrico: la red predice un campo de direcciones de gravedad y un mapa de confianza a partir de la imagen, y esos elementos se integran en un proceso de optimización no lineal (NMF, *non-linear least squares*) para estimar los parámetros intrínsecos de la cámara (distancia focal, centro óptico, distorsión) y la orientación de la gravedad.

La conversión incluida en este repositorio, generada con el script `build_geocalib_onnx.py`, fija las bases NMF y exporta el modelo a ONNX en fp16, lo que elimina la dependencia de PyTorch en tiempo de inferencia y reduce el peso del artefacto. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de refinamiento posteriores; la model card no los detalla.

## Capacidades

- Estimación de parámetros intrínsecos de cámara a partir de una única imagen (distancia focal, centro óptico, coeficientes de distorsión).
- Estimación de la orientación de la gravedad (roll y pitch) de la escena.
- Funcionamiento con imágenes de escenas naturales y urbanas, según el diseño original de GeoCalib.
- Inferencia sin PyTorch mediante ONNX Runtime.
- No soporta generación de texto, razonamiento lingüístico, código, matemáticas simbólicas, tool calling, agentes ni capacidades multimodales de lenguaje.
- No dispone de modo *thinking*, visión-lenguaje, audio ni diálogo multi-turno.

## Casos de uso

- Reconstrucción 3D y fotogrametría: estimar la calibración de cámaras desconocidas antes de ejecutar pipelines de estructura desde movimiento (SfM) o *bundle adjustment*, sustituyendo el paso manual de calibración.
- Corrección de distorsión en tiempo real: en aplicaciones de captura móvil o webcam, usar el modelo para estimar los coeficientes de distorsión y rectificar el flujo de vídeo antes de tareas de detección o seguimiento.
- Realidad aumentada en navegador: al estar exportado a ONNX, puede ejecutarse con ONNX Runtime Web para estimar la orientación de la cámara y anclar objetos virtuales sobre la imagen capturada.
- Procesamiento por lotes de archivos fotográficos: calibrar automáticamente grandes colecciones de imágenes de origen desconocido para normalizar su geometría antes de tareas de *matching* o *retrieval* visual.
- Robótica y vehículos autónomos: estimar la orientación de la gravedad a partir de una cámara monocular como señal auxiliar para la inicialización de la odometría visual.
- Despliegue en dispositivos embebidos o de borde: el formato ONNX fp16 y el tamaño reducido del repositorio permiten integrar el modelo en sistemas con recursos limitados sin instalar el stack de PyTorch.
- Herramientas de edición fotográfica: corregir automáticamente la perspectiva y el horizonte de fotografías a partir de la orientación de gravedad estimada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de error de calibración ni comparaciones con otros métodos; para datos de rendimiento del modelo original debe consultarse el paper de ECCV 2024 (GeoCalib).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,1 GB, por lo que el modelo en fp16 debería caber holgadamente en GPUs de gama baja.
- GPU recomendadas: no disponible. Al ser un modelo de visión de tamaño reducido, es plausible su ejecución en GPUs consumer (por ejemplo, RTX 3060 o superiores), pero no hay datos publicados que lo confirmen.
- Cabe en GPU consumer: sí, previsiblemente, dado el tamaño del artefacto, aunque no se especifican requisitos mínimos.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), ONNX Runtime Web, y cualquier runtime compatible con ONNX (por ejemplo, TensorRT tras conversión adicional).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| StellarAI (GeoCalib ONNX) | Calibración de cámara monocular | ONNX fp16 | CC-BY-4.0 (pesos) | Hugging Face (este repo) |
| GeoCalib original (cvg/GeoCalib) | Calibración de cámara monocular | PyTorch | Apache-2.0 / CC-BY-4.0 | GitHub CVG ETH |
| Perspective Fields (Perceptual) | Estimación de campos de perspectiva | PyTorch | no disponible en esta ficha | Repositorio académico |
| DeepCalib | Calibración de cámara | PyTorch | no disponible en esta ficha | Repositorio académico |

La comparación se limita a la categoría funcional; no se dispone de métricas comparativas publicadas en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un modelo geométrico, su comportamiento depende de la distribución de escenas del entrenamiento original y puede degradarse en imágenes con poca textura, escenas sintéticas o dominadas por patrones repetitivos.
- Riesgo de estimaciones erróneas en imágenes con horizonte ambiguo, rotaciones extremas o distorsiones muy severas; el solver NMF puede converger a mínimos locales.
- No es un modelo de lenguaje: no admite prompts textuales ni conversación; cualquier uso en ese sentido es inadecuado.
- La licencia de los pesos es CC-BY-4.0 con atribución obligatoria a los autores originales (ETH Zúrich, ECCV 2024); el uso comercial exige mantener la atribución. El repositorio no declara una licencia propia adicional.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado ni idiomas especificados, lo que indica que no ha sido validado por la comunidad; conviene verificar la integridad de los pesos antes de usarlos en producción.
- La conversión fija las bases NMF y usa fp16, lo que puede introducir pequeñas pérdidas de precisión respecto al modelo original en PyTorch.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/junepriv01/stellarai
- Proyecto original GeoCalib (GitHub): https://github.com/cvg/GeoCalib
- Paper GeoCalib (ECCV 2024): https://arxiv.org/abs/2409.11357
- Página del proyecto GeoCalib: https://cvg.ethz.ch/research/geocalib/
- Script de conversión citado: `build_geocalib_onnx.py` (incluido en el repositorio)
