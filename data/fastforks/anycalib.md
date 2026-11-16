# fastforks/anycalib

## Resumen

AnyCalib es un modelo de calibración de cámara a partir de una única imagen RGB, presentado por Javier Tirado-Garín y Juan Civera en ICCV 2025. El modelo estima los parámetros intrínsecos de la cámara (matriz K de 3x3: fx, fy, cx, cy) y, cuando es posible, la dirección de gravedad en el sistema de coordenadas de la cámara, junto con el roll, el pitch y el campo de visión vertical. Resuelve un problema clásico de visión por computador sin necesidad de patrones de calibración ni de múltiples vistas.

La arquitectura combina un backbone DINOv2 ViT-L/14 con un decodificador DPT ligero que predice un rayo por píxel en coordenadas tangentes sobre la esfera unitaria, usando upsampling convexo. Sobre esas predicciones se aplica un ajuste lineal seguido de refinamiento Gauss-Newton para obtener las intrínsecas del modelo de cámara elegido. El repositorio de Hugging Face es únicamente una model card: no aloja pesos, sino que documenta cómo `fastforks` descarga los pesos de los autores y los verifica mediante SHA-256.

La relevancia actual reside en que elimina la dependencia de procesos de calibración tradicionales (tableros, múltiples imágenes) y permite recuperar geometría de cámara en pipelines de fotogrametría, robótica o realidad aumentada a partir de una sola fotografía. La variante publicada es `anycalib-pinhole@1`, con licencia Apache-2.0 y uso comercial permitido según la licencia de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-L/14 con decodificador DPT ligero; predicción de rayos por píxel y refinamiento Gauss-Newton |
| Parametros totales | no disponible (backbone ViT-L/14; cifra exacta no publicada en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de cualquier H x W >= 32, con padding a múltiplo de 32) |
| Tipos de cuantizacion | fp32 y fp16 (soportados en las implementaciones portable y kernels); no se documentan GGUF ni INT8 |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | `.pt` (PyTorch); `anycalib_pinhole.pt` verificado por SHA-256 |

## Arquitectura y entrenamiento

El modelo parte de un backbone DINOv2 ViT-L/14 preentrenado en LVD-142M (el conjunto de imágenes web curado por DINOv2, no liberado públicamente). Sobre ese backbone se añade un decodificador DPT ligero que produce, para cada píxel, un rayo en coordenadas tangentes sobre la esfera unitaria, con upsampling convexo para preservar la coherencia geométrica. A partir de esos rayos, un ajuste lineal inicial y un refinamiento Gauss-Newton estiman las intrínsecas del modelo de cámara seleccionado (en la variante disponible, modelo pinhole).

El fine-tuning se realizó sobre el split de perspectiva de OpenPano (OP_p), compuesto por recortes en perspectiva de panoramas de 360 grados públicos procedentes de PolyHaven, HDRMaps, AmbientCG y BlenderKit. La model card no documenta el número exacto de tokens ni de imágenes de entrenamiento, ni si se aplicaron etapas de RLHF o DPO (no aplicables a una tarea de regresión geométrica). La innovación técnica principal es la representación por rayos por píxel combinada con refinamiento iterativo, que permite manejar modelos de cámara distintos del pinhole y estimar gravedad cuando la información lo permite.

## Capacidades

- Estimación de intrínsecas de cámara pinhole (fx, fy, cx, cy) a partir de una sola imagen RGB.
- Cálculo del campo de visión vertical (vfov) en radianes.
- Estimación de la dirección de gravedad en el sistema de la cámara, roll y pitch, cuando el modelo lo considera posible.
- Predicción de un rayo por píxel en coordenadas tangentes sobre la esfera unitaria, con upsampling convexo.
- Entrada de tamaño arbitrario con altura y anchura mayores o iguales a 32, con padding a múltiplo de 32; probado hasta 3000x4000.
- Dos backends de ejecución: `portable` y `kernels` (kernels optimizados publicados en `fastforks/kernels`).
- Compatibilidad con `torch.compile` y planificación de TensorRT fp16 (prevista para la versión 0.2.1).
- No soporta tool calling, agentes, generación de texto ni procesamiento de lenguaje; es un modelo puramente geométrico-visual.

## Casos de uso

- Fotogrametría de una sola imagen: recuperar las intrínsecas de una fotografía aislada para inicializar reconstrucciones 3D o pipelines de estructura desde movimiento cuando no se dispone de metadatos EXIF fiables.
- Realidad aumentada en dispositivos móviles: estimar el campo de visión vertical y la orientación de la cámara a partir de un fotograma para anclar contenido virtual de forma coherente con la escena.
- Robótica y vehículos autónomos: obtener roll y pitch respecto a la gravedad en el sistema de la cámara para corregir la orientación de sensores en tiempo de ejecución (21,3 ms por imagen 1080x1920 con el backend `kernels` en RTX 5060 Ti).
- Procesamiento por lotes de archivos multimedia: calibrar automáticamente grandes volúmenes de imágenes de archivo sin EXIF ni patrones, con un coste de memoria de 741 MiB reservados por imagen a 1080x1920 en fp16.
- Integración en herramientas de edición y composición: corregir la perspectiva y el horizonte de fotografías usando la estimación de roll, pitch y vfov para enderezar imágenes o aplicar transformaciones geométricas.
- Investigación en visión por computador: servir como componente de calibración en experimentos de SLAM, odometría visual o síntesis de vistas noveles donde se necesita una estimación rápida de intrínsecas.
- Despliegue en GPUs de consumo: ejecutar la calibración en tarjetas como la RTX 5060 Ti 16 GB con fp16, con tiempos de primera llamada de 0,33 s (kernels) y 0,45 s (portable).

## Benchmarks y rendimiento

Precisión en el conjunto LaMAR2k (imágenes a 1440x1920, protocolo GeoCalib, AUC@5 grados en porcentaje para error de roll / pitch / campo de visión vertical):

| Variante | Conjunto | Original fp32 | Portable | Kernels |
|---|---|---|---|---|
| `anycalib-pinhole` | LaMAR2k, 2000 imágenes | – / – / 51,6 | – / – / 51,6 | – / – / 51,5 |
| `anycalib-pinhole` | LaMAR2k, cada 10.ª imagen (200) | – / – / 48,5 | – / – / 48,4 | – / – / 48,4 |

Velocidad y memoria en calibración sintética a 1080x1920:

| Modelo | Tiempo original | Portable | Kernels | Aceleración kernels vs original | Memoria pico (MiB, asignada / reservada) portable | Kernels |
|---|---|---|---|---|---|---|
| `anycalib-pinhole` | 38,4 ms | 29,4 ms | 21,3 ms | 1,8x | 705 / 742 | 741 / 816 |

Arranque y primera llamada:

| Modelo | Carga (s) original | Carga (s) portable | Carga (s) kernels | Primera llamada (s) original | Primera llamada (s) portable | Primera llamada (s) kernels |
|---|---|---|---|---|---|---|
| `anycalib-pinhole` | 4,09 | 0,60 | 1,59 | 0,58 | 0,45 | 0,33 |

`torch.compile` y TensorRT a 1080x1920:

| Modelo | Portable | compile | TensorRT fp16 | Kernels | Preparación compile | Memoria pico portable (MiB) | compile (MiB) | kernels (MiB) |
|---|---|---|---|---|---|---|---|---|
| `anycalib-pinhole` | 29,4 ms | 25,5 ms | previsto 0.2.1 | 21,3 ms | 16,5 s | 705 / 742 | 719 / 756 | 741 / 816 |

Paridad con el código original: en CPU y float32 la diferencia máxima es de 0,00019; en GPU y float16 la diferencia media es de 0,094 y el p99 de 0,51 en las intrínsecas de salida.

## Requisitos de hardware

- VRAM estimada: aproximadamente 705 MiB asignados y 742 MiB reservados por el asignador de PyTorch a 1080x1920 en fp16 con el backend portable; 741/816 MiB con kernels. Probado hasta 3000x4000 con 1,0 GiB asignados y 1,1 GiB reservados.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 2 GB de VRAM; los benchmarks se realizaron en una NVIDIA GeForce RTX 5060 Ti de 16 GB (sm_120).
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 5060 Ti y superiores; también puede ejecutarse en CPU en float32 con mayor latencia.
- Opciones de despliegue: paquete `fastforks` (`pip install fastforks`), backends `portable` y `kernels`, `torch.compile` y TensorRT fp16 (previsto para 0.2.1).
- Latencia y throughput: 21,3 ms por imagen 1080x1920 con kernels en RTX 5060 Ti; 29,4 ms con portable; 25,5 ms con `torch.compile`. La carga del modelo es de 0,60 s (portable) y 1,59 s (kernels).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AnyCalib (anycalib-pinhole) | ViT-L/14 (cifra exacta no disponible) | Imagen de cualquier tamaño >= 32x32 | Calibración de cámara en una imagen, gravedad, vfov | Apache-2.0 | Pesos en releases del repositorio de los autores; card en Hugging Face |
| GeoCalib | no disponible | Imagen única | Calibración de cámara y gravedad | no disponible en la información | Código y pesos públicos (referencia del protocolo de evaluación) |
| DINOv2 ViT-L/14 (base) | ViT-L/14 | Imagen de tamaño fijo | Extracción de características visuales | Apache-2.0 (según DINOv2) | Pesos públicos en Hugging Face |

La comparación con GeoCalib se limita al protocolo de evaluación (AUC@5 grados con `compute_auc(min_error=1)`), ya que la model card no incluye sus cifras de rendimiento. DINOv2 se incluye como referencia del backbone, no como alternativa funcional para calibración.

## Limitaciones y advertencias

- El repositorio de Hugging Face no contiene pesos: es solo una model card; los pesos se descargan de los releases de GitHub de los autores y se verifican por SHA-256.
- La variante publicada solo cubre el modelo pinhole; no se documentan en la información variantes para otros modelos de cámara (aunque el artículo menciona modelos distintos del pinhole).
- La estimación de gravedad, roll y pitch no siempre está disponible: la model card indica que se devuelven "donde el modelo los estima"; los benchmarks de LaMAR2k solo reportan AUC de vfov, no de roll ni pitch.
- El modelo ha sido entrenado con recortes en perspectiva de panoramas públicos (OpenPano); puede degradarse en imágenes con distorsiones fuertes no pinhole, escenas sin líneas rectas o texturas repetitivas.
- Riesgo de alucinación geométrica: en imágenes ambiguas o sin estructura, las intrínsecas estimadas pueden ser plausibles pero incorrectas; se recomienda validación con metadatos EXIF cuando existan.
- La licencia del código es Apache-2.0 y la de los pesos también, con uso comercial permitido según la evidencia registrada; aun así, la model card advierte de que es un paquete de uso experimental y que deben revisarse las cadenas de licencia originales antes de otros usos.
- El modelo no procesa lenguaje ni texto: no soporta tool calling, agentes ni razonamiento multi-paso.
- El soporte de TensorRT fp16 está planificado para la versión 0.2.1 y no está disponible en la versión documentada.
- No se han publicado datos de sesgo demográfico ni de robustez ante condiciones de iluminación extremas en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/anycalib
- Repositorio fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original de AnyCalib: https://github.com/javrtg/AnyCalib (commit `027a8497d893`)
- Pesos `anycalib_pinhole.pt`: https://github.com/javrtg/AnyCalib/releases/download/v1.0.0/anycalib_pinhole.pt
- Benchmarks y protocolo: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero de especificaciones `card.toml`: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/calibration/models/anycalib/card.toml
- Licencia del código original: https://github.com/javrtg/AnyCalib/blob/027a8497d893f4b2596f23d6324c05e4b81064ed/LICENSE
- README del código original: https://github.com/javrtg/AnyCalib/blob/027a8497d893f4b2596f23d6324c05e4b81064ed/README.md
