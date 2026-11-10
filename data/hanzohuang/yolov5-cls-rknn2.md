# HanzoHuang/YOLOv5-Cls-RKNN2

## Resumen

YOLOv5-Cls-RKNN2 es una coleccion de modelos de clasificacion de imagenes derivados de los clasificadores oficiales de YOLOv5 v7.0 (variantes n, s y m), convertidos y compilados especificamente para las NPU de los SoC Rockchip RK3576 y RK3588 mediante RKNN Toolkit2. El modelo lo publica el usuario HanzoHuang dentro de una coleccion de conversiones personalizadas del Rockchip Model Zoo y no introduce pesos nuevos: parte de los checkpoints de clasificacion publicados por Ultralytics en su release v7.0 y los reexporta a formato RKNN2 en precision FP16 e INT8.

El problema que resuelve es la brecha entre los pesos de investigacion en PyTorch/ONNX y el despliegue real sobre aceleradores de borde Rockchip. La conversion incluye el grafo ONNX intermedio, la compilacion con RKNN Toolkit2 y una lista de calibracion basada en COCO128 para las variantes INT8, de modo que un integrador puede ejecutar clasificacion sobre la NPU del RK3588 o del RK3576 sin tener que reproducir el pipeline de conversion.

Es relevante ahora por el auge de la inferencia en el borde sobre hardware de bajo consumo: los SoC RK3588 y RK3576 son habituales en placas SBC, cajas industriales y dispositivos de vision embebida, y disponer de clasificadores YOLOv5 ya compilados con hashes verificables reduce el trabajo de portabilidad. La ficha se limita a lo documentado en el repositorio; no hay informacion publicada sobre precision, latencia ni regimen de entrenamiento, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de clasificacion derivada de YOLOv5 v7.0 (variantes n, s y m); grafo exportado a ONNX y compilado con RKNN Toolkit2 |
| Parametros totales | no disponible (tres variantes: n, s y m; el repositorio no publica el recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | FP16 e INT8 |
| Idiomas soportados | no disponible (clasificacion de imagenes; sin etiquetas de idioma) |
| Licencia | GPL-3.0 |
| Formato de pesos | RKNN2 (compilado para NPU Rockchip); incluye grafo ONNX intermedio y manifiesto de hashes |

## Arquitectura y entrenamiento

La arquitectura subyacente es la red de clasificacion de YOLOv5 v7.0, una CNN por convoluciones que Ultralytics publica junto al detector en el mismo release. El repositorio no describe la topologia interna ni el numero de capas; lo unico documentado es el origen de los pesos y el proceso de conversion. No hay informacion sobre el dataset de entrenamiento original, el numero de imagenes, el regimen de aumento de datos ni si se aplico algun ajuste fino posterior: los checkpoints se toman tal cual del release v7.0.

La innovacion tecnica de esta publicacion esta en el pipeline de despliegue, no en el modelo. Se exporta el grafo a ONNX y se compila con RKNN Toolkit2 para las NPU de RK3576 y RK3588, generando artefactos en FP16 e INT8. La cuantizacion INT8 emplea una lista de calibracion basada en COCO128 incluida en `source/calibration.json`. El script `source/convert-extended.py` documenta el proceso y acepta `--yolov5-source` para apuntar a un checkout de la fuente v7.0. El repositorio incluye `manifest.json` con los hashes de todas las salidas y conserva los hashes y URLs originales de los pesos en el directorio `source`.

## Capacidades

- Clasificacion de imagenes: asigna una clase a una imagen de entrada usando los clasificadores YOLOv5 n, s y m.
- Despliegue en NPU Rockchip: artefactos compilados para RK3576 y RK3588 en FP16 e INT8.
- Verificacion de integridad: manifiesto con hashes de todas las salidas y de los pesos originales.
- Reproducibilidad: scripts de conversion y lista de calibracion incluidos en el repositorio.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision-lenguaje, tool calling, agentes ni capacidades multilingues: es exclusivamente un clasificador de imagenes.
- No se documenta modo thinking, audio ni entrada multimodal.

## Casos de uso

- Clasificacion en dispositivos de borde con RK3588: desplegar el artefacto RKNN2 directamente sobre la NPU permite clasificar imagenes en placas SBC o cajas industriales sin cargar el runtime de PyTorch, reduciendo consumo y latencia frente a CPU.
- Inspeccion visual industrial con RK3576: usar la variante INT8 en lineas de produccion para categorizar piezas o detectar defectos por clase, aprovechando la compilacion especifica para ese SoC.
- Prefiltrado en pipelines de vision: emplear el clasificador n o s como etapa rapida que descarte imagenes irrelevantes antes de un detector o de un modelo mayor, aligerando la carga del resto del pipeline.
- Prototipado rapido en Rockchip Model Zoo: servir como punto de partida para validar el flujo ONNX a RKNN2 antes de convertir modelos propios, ya que el repositorio incluye el script de conversion y el manifiesto de hashes.
- Clasificacion embebida en camaras inteligentes: integrar el modelo FP16 en firmware de dispositivos con RK3588 para etiquetar fotogramas en tiempo real sin conexion a la nube.
- Verificacion de cadena de suministro de modelos: usar los hashes de `manifest.json` y del directorio `source` para auditar que los artefactos desplegados corresponden a los pesos GPL-3.0 originales de Ultralytics.
- Docencia y experimentacion con cuantizacion: comparar FP16 frente a INT8 sobre el mismo grafo para estudiar el impacto de la calibracion COCO128 en un clasificador conocido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de precision top-1/top-5, latencia ni throughput para ninguna de las variantes (n, s, m) ni para ninguna de las precisiones (FP16, INT8), ni en RK3576 ni en RK3588.

## Requisitos de hardware

- Hardware objetivo: NPU de los SoC Rockchip RK3576 y RK3588. Los artefactos RKNN2 estan compilados para esas plataformas y no son ejecutables directamente en GPU de escritorio ni en CPU convencional sin el runtime correspondiente.
- VRAM estimada para inferencia: no disponible. Al ser modelos para NPU integrada, el recurso relevante es la memoria del sistema compartida del SoC, no la VRAM de una GPU discreta.
- GPU recomendadas: no aplica. Para ejecutar los pesos originales en PyTorch o ONNX haria falta una GPU convencional, pero el repositorio no documenta requisitos para ese escenario.
- Compatibilidad con GPU de consumo: no aplica a los artefactos publicados. El modelo esta pensado para aceleradores Rockchip, no para RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: runtime RKNN en RK3576/RK3588; el grafo ONNX intermedio puede ejecutarse con ONNX Runtime en otras plataformas, aunque no se documenta ni se garantiza.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOv5-Cls-RKNN2 (este) | no disponible (n, s, m) | no aplica | RKNN2, ONNX | GPL-3.0 | Hugging Face, 0 descargas |
| Clasificadores YOLOv5 v7.0 (Ultralytics) | no disponible | no aplica | PyTorch, ONNX | GPL-3.0 | GitHub, releases oficiales |
| Otras conversiones del Rockchip Model Zoo | no disponible | no aplica | RKNN2 | segun modelo | Repositorios de Rockchip |

La comparativa se limita a lo verificable: este repositorio reempaqueta los clasificadores oficiales de YOLOv5 v7.0 anadiendo la compilacion RKNN2, la calibracion INT8 y el manifiesto de hashes. No se dispone de datos de rendimiento para contrastar con alternativas como MobileNet, ResNet o EfficientNet compilados para Rockchip, por lo que la comparacion cuantitativa se marca como no disponible.

## Limitaciones y advertencias

- Licencia GPL-3.0: cualquier distribucion de software que incorpore el modelo o un trabajo derivado debe cumplir las obligaciones de copyleft de la GPL, lo que puede ser incompatible con productos propietarios de firmware cerrado.
- Sin datos de precision: no hay metricas top-1/top-5 publicadas, ni para FP16 ni para INT8, por lo que no se puede estimar la perdida de exactitud introducida por la cuantizacion.
- Calibracion limitada: la cuantizacion INT8 usa COCO128 como conjunto de calibracion, un subconjunto pequeno y generico que puede no representar el dominio de despliegue real.
- Dependencia de hardware: los artefactos estan compilados para RK3576 y RK3588; no hay garantia de funcionamiento en otros SoC Rockchip ni en plataformas no Rockchip.
- Riesgo de clasificacion erronea: al ser un clasificador de imagenes, hereda los sesgos y errores de los pesos originales de YOLOv5 v7.0, cuyo dataset de entrenamiento no se documenta en este repositorio.
- Sin soporte de texto ni idiomas: no es un modelo de lenguaje y no admite prompts, tool calling ni conversacion.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Fechas del repositorio: creado y actualizado en noviembre de 2026 segun los metadatos de Hugging Face, lo que conviene verificar antes de asumir su vigencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HanzoHuang/YOLOv5-Cls-RKNN2
- Release oficial YOLOv5 v7.0: https://github.com/ultralytics/yolov5/releases/tag/v7.0
- Codigo fuente YOLOv5 v7.0: https://github.com/ultralytics/yolov5/tree/v7.0
- Manifiesto de hashes: https://huggingface.co/HanzoHuang/YOLOv5-Cls-RKNN2/blob/main/manifest.json
- Directorio de pesos originales: https://huggingface.co/HanzoHuang/YOLOv5-Cls-RKNN2/tree/main/source
- Licencia GPL-3.0 del repositorio: https://huggingface.co/HanzoHuang/YOLOv5-Cls-RKNN2/blob/main/LICENSE
