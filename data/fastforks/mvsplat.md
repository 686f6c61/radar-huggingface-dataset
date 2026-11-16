# fastforks/mvsplat

## Resumen

MVSplat es un modelo de reconstrucción 3D feed-forward desarrollado originalmente por Chen et al. (2024) que, a partir de varias imágenes de una misma escena con poses y calibración conocidas, predice mapas de profundidad y un conjunto de Gaussianas 3D (una por píxel) en el sistema de coordenadas del mundo. Combina una CNN UniMatch con un transformer multi-vista tipo swin que alimenta un volumen de coste por plane-sweep, refinado mediante U-Nets 2D con atención cruzada entre vistas. La salida son Gaussianas con opacidad, escala, rotación y armónicos esféricos de grado 4, exportables directamente a formato PLY.

El repositorio `fastforks/mvsplat` no contiene pesos: es una model card que documenta la integración del modelo original en la librería fastforks, que descarga los pesos del autor y los verifica mediante SHA-256. Está pensado para inferencia en modo forward pass únicamente (sin renderer), con dos backends intercambiables (`portable` y `kernels`) y soporte para `torch.compile`.

Es relevante para desarrolladores que necesitan integrar reconstrucción multi-vista en pipelines propios sin depender del código de investigación original, con garantías de paridad numérica verificada frente a la implementación de referencia y mediciones de rendimiento y memoria publicadas sobre hardware consumer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN UniMatch + transformer multi-vista swin + volumen de coste plane-sweep + U-Nets 2D con atención cruzada; cabeza gaussiana por píxel |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de cualquier H x W >= 1 (probado hasta 3000x4000) |
| Tipos de cuantizacion | fp32 (referencia original) y fp16 (por defecto en portable y kernels) |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT (código y pesos del checkpoint RealEstate10K) |
| Formato de pesos | checkpoint del autor (`.ckpt`); salida en `.ply` para Gaussianas |
| Variantes | `mvsplat-re10k@1` (única incluida) |
| Backends | `portable`, `kernels` |
| Salidas | `depth`, `confidence`, `gaussians` |
| Pipeline | image-to-3d |

## Arquitectura y entrenamiento

MVSplat sigue un diseño feed-forward sin optimización por escena. Un extractor CNN basado en UniMatch y un transformer multi-vista tipo swin construyen un volumen de coste por plane-sweep a partir de todas las vistas distintas de la de referencia. Ese volumen se refina con U-Nets 2D que incorporan atención cruzada hacia la profundidad de cada vista. Finalmente, una cabeza gaussiana predice una Gaussiana 3D por píxel (opacidad, escala, rotación y armónicos esféricos de grado 4) en el marco del mundo especificado por las cámaras de entrada. El modelo no incluye renderer: solo realiza el forward pass.

El checkpoint distribuido (`mvsplat-re10k`) se entrenó sobre RealEstate10K, un conjunto de trayectorias de cámara extraídas de vídeos inmobiliarios de YouTube con poses estimadas mediante ORB-SLAM. El backbone se inicializa desde UniMatch (GMDepth, ScanNet). Existe un checkpoint adicional para ACID con la misma arquitectura, pero no se distribuye en este repositorio. La licencia del código original es MIT y los pesos del checkpoint RealEstate10K también se distribuyen bajo MIT; los datos de entrenamiento tienen uso de investigación según su propia release.

## Capacidades

- Reconstrucción de profundidad multi-vista a partir de imágenes con poses y calibración conocidas.
- Predicción de Gaussianas 3D por píxel con opacidad, escala, rotación y armónicos esféricos de grado 4, exportables a PLY.
- Estimación de confianza por píxel junto con el mapa de profundidad.
- Predicción de cámaras y puntos 3D en escenas no poseídas (según la model card, "where the model predicts them").
- Entrada de tamaño arbitrario (cualquier H x W >= 1), redimensionada o rellenada internamente.
- Ejecución en fp16 y fp32, con paridad numérica verificada frente al código original.
- Compatibilidad con `torch.compile` (115 ms frente a 181 ms en portable para 336x518).
- Sin capacidades de lenguaje, tool calling, agentes ni procesamiento de audio.

## Casos de uso

- Reconstrucción de interiores inmobiliarios: el modelo está entrenado sobre RealEstate10K, por lo que encaja en la generación de nubes de puntos y Gaussianas a partir de tours virtuales de viviendas con cámaras calibradas.
- Digitalización de patrimonio y escenas estáticas: con varias fotografías de un objeto o sala y sus poses, se obtiene un PLY de Gaussianas directamente utilizable en visores 3D.
- Previsualización rápida en herramientas de autoría 3D: al ser feed-forward y no requerir optimización por escena, permite generar una primera reconstrucción en menos de 200 ms por frame en una RTX 5060 Ti a 336x518.
- Generación de mapas de profundidad densos para pipelines de novela view synthesis: la salida `depth` con `confidence` sirve como entrada a renderers gaussianos externos.
- Prototipado en investigación de MVS: la paridad verificada con el código original (mean |diff| <= 0.02 en fp16) permite sustituir la implementación de referencia por fastforks en experimentos comparativos.
- Procesado por lotes en servidor con `torch.compile`: la reducción a 115 ms por inferencia y un pico de 2762 MiB permite encadenar reconstrucciones en GPU consumer de 16 GB.
- Integración en aplicaciones de captura móvil: la entrada admite cualquier resolución y las imágenes se redimensionan o rellenan internamente, lo que simplifica el preprocesado en cliente.

## Benchmarks y rendimiento

Precisión en DTU (scans 1, 9, 24, 33, 75; vista 24 + 7 fuentes; recortes 640x512):

| Variante | Original fp32 | Original fp16 | Portable | Kernels |
|---|---|---|---|---|
| `mvsplat-re10k` (AbsRel) | 0.0438 | 0.0439 | 0.0438 | 0.0438 |
| `mvsplat-re10k` (delta1 %) | 97.31 | 97.30 | 97.30 | 97.30 |
| `mvsplat-re10k` (MAE mm) | 31.17 | 31.21 | 31.20 | 31.20 |

Rendimiento y memoria (entrada 336x518, RTX 5060 Ti 16 GB, sm_120):

| Métrica | Original fp32 | Original (fp16) | Portable | Kernels |
|---|---|---|---|---|
| Tiempo (ms) | no disponible | 279 | 181 | 172 |
| Pico asignado (MiB) | no disponible | 2889 | 1239 | 1239 |
| Pico reservado (MiB) | no disponible | 4160 | 1532 | 1532 |
| Carga (s) | no disponible | 1.37 | 0.15 | 1.27 |
| Primera llamada (s) | no disponible | 2.82 | 1.02 | 0.69 |

`torch.compile` en portable: 115 ms (frente a 181 ms sin compilar), con pico de 2762 MiB asignados y 2810 MiB reservados; compilación en frío de 102 s. TensorRT fp16 está planificado para la versión 0.2.1. Entrada probada hasta 3000x4000 en portable fp16: 3,2 GiB asignados y 4,4 GiB reservados. Paridad con el código original: en CPU float32, max |diff| <= 0.002; en GPU float16, mean |diff| <= 0.02 y p99 <= 0.25 sobre la profundidad de salida.

## Comparativa con modelos similares

| Modelo | Tipo | Cámaras de entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MVSplat (este repo) | Feed-forward gaussian splatting + MVS | Requeridas (calibradas) o estimadas | Depth, confidence, Gaussianas | MIT | Pesos vía enlace del autor, verificados por SHA-256 |
| PatchMatchNet | MVS clásico iterativo | Requeridas | Depth | no disponible en la información | No incluido en este repositorio |
| MVSAnywhere | MVS con rango propio derivado de baselines | Requeridas | Depth | no disponible en la información | No incluido en este repositorio |

La model card cita PatchMatchNet y MVSAnywhere únicamente como referencias del protocolo de evaluación en DTU (rango de profundidad 425-935 mm para PatchMatchNet), no como alternativas integradas. No se dispone de datos comparativos de parámetros, contexto ni rendimiento frente a otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos: la descarga depende de un enlace de Google Drive del autor y de la verificación SHA-256 documentada en `card.toml`.
- El modelo no incluye renderer; solo produce Gaussianas y profundidad. La síntesis de vistas debe realizarla una herramienta externa.
- Entrenado exclusivamente sobre RealEstate10K (interiores inmobiliarios); el rendimiento en escenas de otro dominio (exteriores, objetos aislados, iluminación no estándar) no está documentado.
- El checkpoint ACID no se distribuye, aunque comparte arquitectura.
- La licencia MIT cubre código y pesos del checkpoint RealEstate10K, pero los datos de entrenamiento (RealEstate10K, YouTube) tienen uso de investigación según su propia release; conviene revisar antes de un uso comercial a gran escala.
- La paridad numérica está verificada con tolerancias no nulas (mean |diff| <= 0.02 en fp16), por lo que no es una réplica bit a bit.
- TensorRT fp16 aún no está disponible (planificado para 0.2.1).
- El modelo no procesa lenguaje ni tiene capacidades multilingües, de tool calling o de agentes; los tags de idioma no están disponibles porque no aplican.
- Tier experimental según la propia model card.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/mvsplat
- Repositorio fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original: https://github.com/donydchen/mvsplat (commit `01f9a28`)
- Licencia del código original: https://github.com/donydchen/mvsplat/blob/01f9a28edb5eb68416e7e63b01f8d90c3bdfbf01/LICENSE
- README del código original: https://github.com/donydchen/mvsplat/blob/01f9a28edb5eb68416e7e63b01f8d90c3bdfbf01/README.md
- Pesos del checkpoint RealEstate10K: https://drive.usercontent.google.com/download?id=1Y5OAJN9AX5yMjkbyxag5OnwacdjPnl-N&export=download&confirm=t
- Carpeta de checkpoints del autor: https://drive.google.com/drive/folders/14_E_5R6ojOWnLSrSVLVEMHnTiKsfddjU
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Ficha técnica del modelo en fastforks: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/multiview/models/mvsplat/card.toml
