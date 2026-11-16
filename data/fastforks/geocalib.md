# fastforks/geocalib

## Resumen

GeoCalib es un modelo de calibración de cámara a partir de una única imagen RGB, desarrollado originalmente por Veicht et al. y presentado en ECCV 2024. El repositorio `fastforks/geocalib` no contiene pesos propios: es una model card que documenta la integración del modelo original (código de `cvg/GeoCalib`) dentro del framework fastforks, que descarga los pesos de los autores y los verifica mediante SHA-256. La tarea es de calibración geométrica: estimar los intrínsecos de la cámara y la dirección de la gravedad a partir de una sola imagen.

La arquitectura combina una red MSCAN-L que predice campos de perspectiva por píxel (vectores "up" y latitud, con confianzas asociadas) y un optimizador diferenciable de Levenberg-Marquardt que ajusta la longitud focal y la dirección de gravedad (roll, pitch) a esas predicciones. El resultado es la matriz de intrínsecos `[3, 3]`, la dirección de gravedad en el sistema de la cámara, roll, pitch y el campo de visión vertical.

Es relevante porque resuelve un problema clásico de visión por computador (calibración sin patrón, single-image) con una aproximación aprendida end-to-end y optimización geométrica posterior, y porque la integración en fastforks ofrece backends `portable` y `kernels` con paridad numérica verificada frente al código original. El modelo está marcado como "experimental" y no aloja pesos en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MSCAN-L (predicción de campos de perspectiva por píxel) + optimizador diferenciable Levenberg-Marquardt |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, una imagen por inferencia) |
| Tipos de cuantizacion | fp16 (por defecto en GPU), fp32 (CPU y referencia); TensorRT fp16 planificado para 0.2.1 |
| Idiomas soportados | no aplica (no es modelo de lenguaje) |
| Licencia | CC-BY-4.0 (pesos); código original Apache-2.0 |
| Formato de pesos | no disponible (los pesos se descargan como `geocalib-pinhole.tar` desde el release del repo original) |

## Arquitectura y entrenamiento

El modelo emplea una red troncal MSCAN-L que produce, para cada píxel, un vector "up" y un valor de latitud junto con mapas de confianza. Sobre esas predicciones se ejecuta un optimizador de Levenberg-Marquardt diferenciable que ajusta los parámetros de la cámara (longitud focal y dirección de gravedad expresada como roll y pitch) minimizando el residuo entre los campos predichos y los inducidos por el modelo de cámara. Esta combinación de red neuronal y optimización geométrica es la innovación central del trabajo.

El entrenamiento se realizó sobre OpenPano, un conjunto construido a partir de recortes en perspectiva de aproximadamente 2.800 panoramas de 360 grados públicos (PolyHaven, HDRMaps, AmbientCG, BlenderKit). No se dispone de información sobre el número exacto de tokens o imágenes de entrenamiento, la composición detallada del dataset ni sobre el uso de RLHF o DPO (no aplicables a esta tarea). La variante documentada es `geocalib-pinhole@1`.

## Capacidades

- Estimación de intrínsecos de cámara: devuelve la matriz `K` de `[3, 3]` en píxeles de la imagen de entrada.
- Estimación de la dirección de gravedad en el sistema de la cámara (`gravity`, vector de 3 componentes).
- Estimación de roll y pitch de la cámara en radianes.
- Estimación del campo de visión vertical (`vfov`) en radianes.
- Calibración a partir de una única imagen RGB, sin patrón ni múltiples vistas.
- Entrada de tamaño arbitrario con `H x W >= 32`, con padding a múltiplo de 32; probado hasta 3000x4000 en fp16.
- Backends `portable` y `kernels` con paridad numérica verificada frente al código original.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual y geométrico.

## Casos de uso

- Reconstrucción 3D y fotogrametría: obtener intrínsecos y orientación de gravedad de imágenes sueltas para inicializar pipelines de structure-from-motion cuando no hay datos EXIF fiables.
- Realidad aumentada en móvil: estimar roll, pitch y campo de visión vertical para alinear overlays 3D con la escena a partir de una sola foto.
- Corrección automática de horizonte: usar `roll` y `pitch` para enderezar imágenes en aplicaciones de edición fotográfica.
- Robótica y vehículos autónomos: estimar la orientación de la cámara respecto a la gravedad como señal auxiliar de calibración en línea.
- Procesado de imágenes de drones: calibrar cámaras de UAV cuando los metadatos de vuelo son incompletos, usando la estimación de `vfov` y gravedad.
- Preprocesado en datasets de visión: normalizar la geometría de imágenes de origen diverso (panoramas recortados, fotos de stock) antes de entrenar otros modelos.
- Verificación de calibración en producción: comparar los intrínsecos estimados con los metadatos de fábrica para detectar cámaras mal calibradas o imágenes recortadas.

## Benchmarks y rendimiento

Precisión en LaMAR2k (protocolo del paper de GeoCalib, AUC@5 grados en % para roll / pitch / vfov):

| Variante | Dataset | Original fp32 | Portable | Kernels |
|---|---|---|---|---|
| `geocalib-pinhole` | LaMAR2k, 2000 imágenes | 92,6 / 76,8 / 41,6 | 92,6 / 76,8 / 41,6 | 92,6 / 76,8 / 41,6 |
| `geocalib-pinhole` | LaMAR2k, cada 10ª imagen (200) | 90,2 / 76,7 / 44,0 | 90,2 / 76,6 / 44,0 | 90,2 / 76,6 / 44,0 |

Velocidad y memoria (calibración sintética 1080x1920, RTX 5060 Ti 16 GB):

| Modelo | Tiempo original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico portable (MiB alloc/reserved) | Memoria pico kernels (MiB alloc/reserved) |
|---|---|---|---|---|---|---|
| `geocalib-pinhole` | 106 | 82,3 | 82,5 | 1,3x | 320 / 378 | 279 / 342 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `geocalib-pinhole` | 1,80 | 0,27 | 1,25 | 0,84 | 1,73 | 0,92 |

Con `torch.compile` el tiempo baja a 73,1 ms (frente a 82,3 ms portable) con 246/300 MiB de memoria pico; la compilación en frío tarda 28,4 s. TensorRT fp16 está planificado para la versión 0.2.1 y no hay datos publicados.

Paridad con el código original: en CPU float32 la diferencia máxima absoluta es <= 0,0032; en GPU float16 (por defecto) el error medio es <= 0,087 y el p99 <= 0,39 sobre los intrínsecos de salida.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Pesos en HF | Licencia | Uso comercial |
|---|---|---|---|---|---|
| `fastforks/geocalib` (este) | Calibración single-image | MSCAN-L + Levenberg-Marquardt | No (solo card) | CC-BY-4.0 | Sí |
| GeoCalib original (`cvg/GeoCalib`) | Calibración single-image | MSCAN-L + Levenberg-Marquardt | No en HF (release en GitHub) | Apache-2.0 (código) / CC-BY-4.0 (pesos) | Sí |
| Perspectiva de DeepCalib / DeepFocal (referencias del paper) | Calibración single-image | Redes de regresión directa | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de calibración en la información proporcionada. La comparativa se limita a variantes del propio modelo y al código original.

## Limitaciones y advertencias

- El repositorio no aloja pesos: la inferencia depende de descargar el `.tar` desde el release de GitHub del proyecto original, lo que introduce una dependencia externa.
- Modelo marcado como "experimental" por el propio autor del fork; no recomendado para producción sin validación adicional.
- Solo se documenta la variante `geocalib-pinhole`; no hay soporte declarado para cámaras con distorsión no pinhole en esta card.
- La calibración es geométrica y depende de la escena: imágenes sin estructura (cielo, paredes lisas) o con horizontes ambiguos pueden degradar la estimación de gravedad y roll/pitch.
- La precisión en vfov es notablemente inferior a la de roll y pitch (AUC@5 de 41,6-44,0 frente a 90-92 en roll), por lo que el campo de visión vertical debe tratarse con cautela.
- No hay información sobre sesgos demográficos o geográficos del dataset de entrenamiento (panoramas de PolyHaven, HDRMaps, AmbientCG, BlenderKit), lo que puede limitar la generalización a dominios muy distintos.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el código original es Apache-2.0; conviene revisar ambas licencias antes de redistribuir.
- El rendimiento medido se limita a una RTX 5060 Ti 16 GB con sm_120 y torch 2.14.1+cu130; no hay datos de latencia en otras GPU.
- No hay soporte de tool calling, agentes ni procesamiento de lenguaje: es exclusivamente un modelo de visión geométrica.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/geocalib
- Repositorio del fork fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original GeoCalib: https://github.com/cvg/GeoCalib (commit `1dedb29f94fc`)
- Pesos originales: https://github.com/cvg/GeoCalib/releases/download/v1.0/geocalib-pinhole.tar
- `card.toml` con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/calibration/models/geocalib/card.toml
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Licencia del código original: https://github.com/cvg/GeoCalib/blob/1dedb29f94fc11b896c5f572005978aeebccd67f/LICENSE
- README del proyecto original: https://github.com/cvg/GeoCalib/blob/1dedb29f94fc11b896c5f572005978aeebccd67f/README.md
