# GOZA37/PrecisePerception-Models

## Resumen

PrecisePerception-Models es un repositorio espejo publicado por GOZA37 que agrupa los paquetes de modelos de percepción visual empleados por la aplicación iOS PrecisePerception, una app que realiza estimación de profundidad monocular en vivo en un iPhone y la fusiona con datos de LiDAR y anclas de ARKit. No se trata de un modelo único entrenado por el autor, sino de una colección de artefactos convertidos a formatos móviles (Core ML para iOS y LiteRT/TFLite para Android) a partir de modelos de terceros: ZipDepth base, Depth Anything V2 Small, YOLO26n con salida de profundidad y YOLO11n como detector de objetos.

El repositorio resuelve un problema de ingeniería de despliegue: permitir que un clon limpio del proyecto compile sin depender de descargas manuales ni de scripts de exportación propios, ofreciendo pesos ya convertidos y verificados numéricamente contra los originales de PyTorch. La relevancia es práctica para desarrolladores de visión por computador en dispositivos móviles, ya que documenta conversiones a FP16 y Float32 con métricas de divergencia numérica explícitas.

No hay información sobre arquitecturas internas más allá de las referencias a los papers y repositorios originales, ni sobre datos de entrenamiento, idiomas o parámetros totales. El tamaño del repositorio es de 0,7 GB y la licencia es per-model, con componentes MIT, Apache-2.0 y AGPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (colección de modelos: ZipDepth, Depth Anything V2, YOLO26n, YOLO11n) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de visión) |
| Tipos de cuantizacion | FP16 (Core ML) y Float32 (LiteRT/TFLite) |
| Idiomas soportados | no disponible (modelos de visión, sin procesamiento de lenguaje) |
| Licencia | per-model: MIT (ZipDepth), Apache-2.0 (Depth Anything V2), AGPL-3.0 (Ultralytics YOLO) |
| Formato de pesos | `.mlpackage` (Core ML) y `.tflite` (LiteRT/TFLite) |

## Arquitectura y entrenamiento

El repositorio no entrena modelos propios: redistribuye conversiones de modelos de terceros. En iOS incluye ZipDepth base en FP16 con entrada 512x384 y salida de disparidad relativa, YOLO26n con salida de profundidad métrica en FP16 a 640x640 exportado con `yolo export format=coreml half=True`, y YOLO11n como detector COCO en FP16 a 640x640 con NMS embebido en el paquete. En Android incluye Depth Anything V2 Small en Float32 con tres resoluciones de entrada (280x364, 196x252 y 518x686), ZipDepth base con bloques reescritos para GPUs móviles y NNAPI, YOLO26n depth y YOLO11n detector.

La innovación técnica documentada es la ingeniería de conversión: para Depth Anything V2, el GELU exacto no convierte con litert-torch 0.10, por lo que se usa la aproximación tanh y se precalculan los embeddings posicionales para el tamaño de entrada fijo. El autor reporta verificaciones numéricas contra los originales de PyTorch en un fotograma real mediante `android/tools/verify_tflite.py`, con diferencias relativas medianas de 1,5e-6 para ZipDepth, 5,4e-7 para YOLO26n depth, exactitud en clases para YOLO11n y entre 1,4e-3 y 1,7e-3 para las variantes de Depth Anything V2. No se dispone de información sobre datasets de entrenamiento, número de tokens ni técnicas de alineación como RLHF o DPO, al no ser modelos de lenguaje.

## Capacidades

- Estimación de profundidad monocular en vivo: ZipDepth base y Depth Anything V2 Small generan disparidad relativa; YOLO26n depth genera profundidad métrica en metros.
- Detección de objetos: YOLO11n detecta las clases COCO con supresión de no máximos incluida en el paquete Core ML.
- Fusión con sensores: los modelos están pensados para combinarse con LiDAR y anclas de ARKit en la app iOS PrecisePerception.
- Despliegue móvil nativo: paquetes Core ML listos para iOS y archivos LiteRT/TFLite para Android.
- Inferencia en NPU/GPU móvil: ZipDepth para Android reescribe bloques para GPUs móviles y NNAPI.
- Verificación numérica reproducible: scripts de exportación y comprobación incluidos en el repositorio de la app.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Realidad aumentada en iOS: integración de profundidad monocular con LiDAR y ARKit para oclusión y colocación de objetos virtuales; ZipDepth y YOLO26n depth cubren la estimación de profundidad a 512x384 y 640x640 respectivamente.
- Escaneo 3D y reconstrucción: uso de Depth Anything V2 Small en Android para generar mapas de disparidad relativa en tres resoluciones según el compromiso latencia/calidad deseado.
- Detección de obstáculos en movilidad asistida: YOLO11n a 640x640 con NMS embebido permite detectar personas y objetos en tiempo real en un dispositivo móvil sin postprocesado externo.
- Medición de distancias en obra o interiorismo: YOLO26n depth proporciona profundidad métrica en metros directamente, adecuada para estimar dimensiones aproximadas de escenas.
- Prototipado de apps de visión sin servidor: el repositorio permite clonar la app y compilar con `tools/get_models.sh` sin depender de servicios en la nube ni de conversiones manuales.
- Benchmarking de pipelines de conversión: los scripts `export_tflite.py` y `verify_tflite.py` sirven como referencia para validar conversiones de PyTorch a LiteRT con métricas de divergencia numérica.
- Segmentación de primer plano para efectos fotográficos: la disparidad relativa de Depth Anything V2 Small puede usarse para desenfoque de fondo en captura móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta diferencias numéricas de conversión frente a los modelos originales de PyTorch (mediana de diferencia relativa), no métricas de calidad de tarea como RMSE de profundidad, AbsRel o mAP de detección.

| Modelo convertido | Formato | Diferencia relativa mediana vs PyTorch |
|---|---|---|
| ZipDepth base (Android) | TFLite | 1,5e-6 |
| YOLO26n depth (Android) | TFLite | 5,4e-7 |
| YOLO11n detector (Android) | TFLite | exacta (clases) |
| Depth Anything V2 Small 280x364 | TFLite | 1,6e-3 |
| Depth Anything V2 Small 196x252 | TFLite | 1,4e-3 |
| Depth Anything V2 Small 518x686 | TFLite | 1,7e-3 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Son modelos de visión pequeños orientados a dispositivos móviles; el repositorio completo ocupa 0,7 GB.
- GPU recomendadas: no disponible para escritorio; el destino declarado son GPU/NPU móviles (NNAPI en Android, Core ML en iOS).
- Cabe en GPU de consumo: no hay datos específicos; por el tamaño de los modelos (variantes "n" y "small") es plausible en GPUs de consumo, pero no está documentado.
- Opciones de despliegue: Core ML en iOS, LiteRT/TFLite con NNAPI en Android, y los scripts de exportación `android/tools/export_tflite.py` (litert-torch 0.10) y `tools/get_models.sh`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZipDepth base (este repo) | Profundidad monocular | 512x384 | Disparidad relativa | MIT | Core ML FP16 y TFLite |
| Depth Anything V2 Small (este repo) | Profundidad monocular | 280x364, 196x252, 518x686 | Disparidad relativa | Apache-2.0 | TFLite Float32 |
| YOLO26n depth (este repo) | Profundidad métrica | 640x640 | Profundidad en metros | AGPL-3.0 | Core ML FP16 y TFLite |
| apple/coreml-depth-anything-v2-small | Profundidad monocular | no disponible | Disparidad relativa | Apache-2.0 | Core ML (no espejado aquí) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo único ni un modelo de lenguaje: es un repositorio espejo de artefactos de terceros; no debe evaluarse como un LLM.
- Licencias heterogéneas: los modelos Ultralytics (YOLO11n y YOLO26n) son AGPL-3.0, lo que impone obligaciones de copyleft en productos derivados; hay que revisar la licencia de Ultralytics antes de uso comercial.
- La licencia global declarada es "other" con nombre "per-model"; cada archivo conserva la licencia de sus autores según LICENSE.md.
- Depth Anything V2 en Android usa una aproximación tanh de GELU por limitaciones de litert-torch 0.10, con divergencia de hasta 1,7e-3 frente al original.
- Los embeddings posicionales de Depth Anything V2 están precalculados para un tamaño de entrada fijo; no admiten resoluciones arbitrarias sin reexportar.
- Sin datos de sesgos, alucinación o rendimiento por idioma: son modelos de visión y no procesan texto.
- Sin métricas de calidad de tarea publicadas (RMSE, AbsRel, mAP); solo se documenta fidelidad de conversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/GOZA37/PrecisePerception-Models
- App PrecisePerception en GitHub: https://github.com/G-OZA/PrecisePerception
- Paper de ZipDepth: https://arxiv.org/abs/2607.08771
- Código de ZipDepth: https://github.com/fabiotosi92/ZipDepth
- Depth Anything V2 Small en Core ML (Apple): https://huggingface.co/apple/coreml-depth-anything-v2-small
- Depth Anything V2 Small en Hugging Face: https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf
- Licencia de Ultralytics: https://www.ultralytics.com/license
