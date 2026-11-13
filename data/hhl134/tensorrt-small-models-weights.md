# hhl134/tensorrt-small-models-weights

## Resumen

`tensorrt-small-models-weights` es un repositorio de pesos y motores precompilados de TensorRT para una coleccion de modelos pequenos de vision por computador, publicado por el usuario hhl134. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un conjunto de artefactos de inferencia (ficheros `.engine` de TensorRT y ONNX asociados) que acompanan al repositorio de codigo `hhl134/tensorrt-small-models` en GitHub. El repositorio incluye motores para tareas de vision como emparejamiento de puntos clave (SuperPoint + SuperGlue, ALIKED + LightGlue), reconocimiento de lugares (MixVPR con backbone ResNet-50) y deteccion de objetos (YOLOv8n).

La relevancia de este repositorio es practica: proporciona motores TensorRT ya construidos con TensorRT 10.8 sobre una GPU RTX 5080, lo que permite a desarrolladores desplegar pipelines de vision en tiempo real sin tener que compilar manualmente los motores desde ONNX. El autor advierte explicitamente de que los motores estan ligados al hardware y a la version de TensorRT con la que se construyeron, por lo que en otras GPUs o versiones es necesario reconstruirlos a partir de los ficheros ONNX.

El tamano total del repositorio es de aproximadamente 0,4 GB. No se dispone de informacion sobre licencia, idiomas ni pipeline en la model card ni en los metadatos de Hugging Face. El contenido del README esta redactado en chino y se centra en instrucciones de descarga y reconstruccion de motores, no en las caracteristicas de un modelo de IA generativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (conjunto de modelos de vision: SuperPoint/SuperGlue, ALIKED/LightGlue, MixVPR/ResNet-50, YOLOv8n) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelos de vision, no de lenguaje) |
| Tipos de cuantizacion | FP16, INT8 (motores TensorRT); ONNX FP16 como referencia |
| Idiomas soportados | No disponible (no es un modelo linguistico) |
| Licencia | No disponible |
| Formato de pesos | Motores TensorRT `.engine` (TensorRT 10.8) y ONNX |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado de forma unica, sino un paquete de artefactos de inferencia para varios modelos de vision preexistentes. Cada subdirectorio corresponde a un proyecto distinto: `superpoint_superglue` incluye el extractor de caracteristicas SuperPoint y el matcher SuperGlue (motor `superglue_indoor_fp16_stable.engine` en precision mixta y `superpoint_v1_sim_int32.engine` en FP16); `aliked_lightglue` contiene motores ALIKED + LightGlue con limite por defecto de 1024 puntos clave; `mixvpr` contiene un motor MixVPR con backbone ResNet-50 y descriptor de 4096 dimensiones en FP16; y `yolo` contiene un motor YOLOv8n en FP16, con un motor INT8 disponible solo a modo de comparacion.

Los motores fueron construidos con TensorRT 10.8 sobre una GPU RTX 5080. El autor indica que para otras GPUs o versiones de TensorRT es necesario reconstruir los motores a partir de los ONNX, y remite al README del repositorio de GitHub para el procedimiento con `trtexec`, incluyendo que algunos modelos no pueden construirse unicamente con `trtexec`. No se proporciona informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de ajuste (RLHF/DPO), ya que se trata de pesos de inferencia derivados de modelos ya entrenados por terceros.

## Capacidades

- Extraccion y emparejamiento de puntos clave para estimacion de pose y reconstruccion 3D (SuperPoint + SuperGlue).
- Emparejamiento local de caracteristicas con ALIKED + LightGlue, con limite configurable de puntos clave (1024 por defecto).
- Reconocimiento de lugares y recuperacion visual mediante descriptores globales MixVPR (4096 dimensiones, ResNet-50).
- Deteccion de objetos en tiempo real con YOLOv8n en FP16 e INT8.
- Inferencia acelerada por TensorRT con precision mixta e INT8.
- No incluye generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- SLAM visual y odometria visual: usar SuperPoint + SuperGlue para emparejar puntos clave entre fotogramas consecutivos y estimar el movimiento de la camara en robots o drones, aprovechando los motores TensorRT para inferencia de baja latencia.
- Reconstruccion 3D y fotogrametria: emplear ALIKED + LightGlue para emparejar imagenes de distintas vistas y triangular puntos 3D, con el limite de 1024 puntos clave ajustable segun la precision requerida.
- Reconocimiento de lugares en navegacion autonoma: usar MixVPR para recuperar imagenes de referencia y cerrar bucles en SLAM, con descriptores globales de 4096 dimensiones.
- Deteccion de objetos en video en tiempo real: desplegar YOLOv8n FP16 en sistemas embebidos o estaciones con GPU para tareas de vigilancia, conteo de personas o inspeccion industrial.
- Prototipado rapido de pipelines de vision: descargar los motores ya compilados para validar un pipeline completo (deteccion, emparejamiento, recuperacion) sin invertir tiempo en compilar TensorRT desde ONNX.
- Benchmarking de precision y latencia: comparar los motores FP16 e INT8 de YOLOv8n para evaluar el impacto de la cuantizacion en la precision de deteccion antes de decidir una configuracion de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los motores estan compilados especificamente para TensorRT 10.8 sobre una GPU RTX 5080; en otras GPUs o versiones de TensorRT deben reconstruirse desde ONNX.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada; los modelos son de tamano reducido (YOLOv8n, SuperPoint, MixVPR con ResNet-50) y el repositorio completo ocupa 0,4 GB.
- GPU recomendadas: RTX 5080 (entorno de compilacion original); para otros entornos se requiere recompilacion.
- Cabe en GPU de consumo: si, dado el tamano reducido de los modelos, aunque la compatibilidad de los motores precompilados esta limitada a la GPU y version de TensorRT de origen.
- Opciones de despliegue: TensorRT (runtime de TensorRT 10.8), reconstruccion desde ONNX con `trtexec`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Los motores `.engine` estan ligados a la GPU (RTX 5080) y a la version de TensorRT (10.8) con la que se construyeron; no son portables a otros entornos sin recompilacion.
- Algunos modelos no pueden construirse unicamente con `trtexec`, segun advierte el autor; es necesario consultar el README del repositorio de GitHub.
- El motor INT8 de YOLO se ofrece solo como referencia y no se recomienda como configuracion por defecto.
- No se especifica licencia, lo que impide determinar las condiciones de uso comercial.
- No es un modelo de lenguaje: no soporta generacion de texto, razonamiento, codigo ni capacidades multilingues.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion o limitaciones de contexto por tratarse de modelos de vision.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria documentada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hhl134/tensorrt-small-models-weights
- Repositorio de codigo en GitHub: https://github.com/hhl134/tensorrt-small-models
