# moonbox-dev/OmniSVG1.1_4B-ONNX

## Resumen

OmniSVG 1.1 (4B) ONNX es la distribucion en formato ONNX del modelo OmniSVG 1.1 de 4B parametros, publicada por moonbox-dev para su uso con ONNX Runtime en CUDA y CPU. El modelo original, desarrollado por el equipo OmniSVG, es un modelo multimodal construido sobre Qwen2.5-VL especializado en generar graficos vectoriales SVG a partir de texto (text-to-SVG) y de imagenes (image-to-SVG). Esta version no altera los pesos del modelo base: los convierte a grafos ONNX en fp16 e int8 para facilitar el despliegue en entornos donde PyTorch no esta disponible o no es la opcion preferida.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de generacion de SVG de 4B parametros mediante ONNX Runtime, con builds separados por precision (fp16 e int8) y un `pipeline.py` que gestiona el preprocesado de imagen, la construccion del prompt, el bucle de muestreo y la conversion de tokens generados a SVG. El repositorio ocupa 14,2 GB e incluye los grafos `decoder`, `embed` y `vision`, junto con el tokenizer y las licencias.

La licencia es mixta (Apache 2.0 y Qwen Research) y el tag `non-commercial` de la model card indica restricciones para uso comercial derivadas del componente Qwen2.5-VL. No se han publicado datos sobre idiomas soportados ni sobre el contexto maximo del modelo base en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Qwen2.5-VL (vision encoder + decoder de lenguaje), exportado a grafos ONNX |
| Parametros totales | 4B (segun denominacion del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 e int8 (builds separados en el repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0-and-qwen-research (etiquetada como non-commercial) |
| Formato de pesos | ONNX (`.onnx` + `.onnx.data`) con tokenizer.json y pipeline.py |

## Arquitectura y entrenamiento

El modelo base OmniSVG 1.1 (4B) es un modelo multimodal que combina un codificador de vision con un decoder de lenguaje, siguiendo la arquitectura de Qwen2.5-VL. La tarea principal es la generacion de codigo SVG: el modelo recibe una imagen (o un prompt textual) y produce una secuencia de tokens que el pipeline convierte en un documento SVG valido. Los grafos ONNX del repositorio reflejan esta estructura: `vision.onnx` (1,39 GB en fp16) para el codificador visual, `embed.onnx` (806,9 MB) para las proyecciones de embedding y `decoder.onnx` (6,49 GB en fp16, 3,38 GB en int8) para el decoder autorregresivo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La model card del repositorio ONNX se centra en la fidelidad de la conversion: con las mismas semillas que el modelo original, el build fp16 reproduce el mismo token en el 99,5 % de los pasos con teacher forcing (frente al 99,4 % del baseline bf16), produce 26 de 64 secuencias identicas y valida 32 de 32 candidatos. El build int8 baja al 99,3 % de coincidencia por paso y 22 de 64 secuencias identicas, manteniendo 32 de 32 candidatos validos.

## Capacidades

- Generacion de SVG a partir de texto (text-to-SVG): produce codigo vectorial a partir de una descripcion en lenguaje natural.
- Generacion de SVG a partir de imagen (image-to-SVG): vectoriza una imagen de entrada mediante el codificador visual.
- Procesamiento multimodal: integra vision y lenguaje en un unico pipeline autorregresivo.
- Generacion de graficos vectoriales editables y escalables, aptos para flujos de diseno.
- Ejecucion en ONNX Runtime con soporte para CUDA y CPU.
- Dos niveles de precision (fp16 e int8) con fidelidad verificada frente al modelo original.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Vectorizacion automatizada de imagenes: el modelo recibe una imagen rasterizada (logotipo, icono, ilustracion) y genera un SVG equivalente mediante `vision.onnx` y el decoder, util para pipelines de conversion de activos graficos a formato vectorial.
- Generacion de iconos a partir de descripciones textuales: un disenador describe el icono en lenguaje natural y el modelo produce el codigo SVG listo para integrar en una libreria de componentes.
- Prototipado rapido de interfaces: generar graficos vectoriales para maquetas y wireframes sin intervencion manual, aprovechando la salida SVG directamente editable.
- Automatizacion de assets para documentacion tecnica: producir diagramas e ilustraciones vectoriales a partir de descripciones textuales en pipelines de generacion de documentacion.
- Despliegue en entornos sin PyTorch: el formato ONNX permite ejecutar el modelo con ONNX Runtime en servidores o dispositivos donde instalar el stack de PyTorch no es viable, usando el build int8 para reducir requisitos de memoria.
- Integracion en aplicaciones de escritorio o edge: el build int8 (3,38 GB para el decoder) facilita el despliegue en equipos con recursos limitados frente al fp16 (6,49 GB).
- Generacion de graficos vectoriales en lote: el pipeline Python permite procesar lotes de prompts o imagenes de forma programatica para producir catalogos de SVG.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente reporta metricas de fidelidad de la conversion ONNX frente al modelo original:

| Metrica | fp16 | int8 | Baseline bf16 |
|---|---|---|---|
| Coincidencia de token con teacher forcing | 99,5 % | 99,3 % | 99,4 % |
| Secuencias identicas (de 64) | 26 | 22 | no disponible |
| Candidatos validos | 32 / 32 | 32 / 32 | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el build fp16 suma aproximadamente 6,49 GB (decoder) + 1,39 GB (vision) + 806,9 MB (embed), alrededor de 8,7 GB solo en pesos; el build int8 reduce el decoder a 3,38 GB, con un total aproximado de 5,6 GB en pesos.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, una GPU con 12-16 GB de VRAM o mas es adecuada para fp16, y una con 8 GB o mas para int8.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM para int8 y 12 GB para fp16, aunque el consumo real depende del backend y del batching.
- Opciones de despliegue: ONNX Runtime con ejecucion en CUDA o CPU; el repositorio incluye `pipeline.py` para el preprocesado, muestreo y conversion a SVG.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| OmniSVG 1.1 (4B) ONNX (este) | 4B | no disponible | ONNX (fp16, int8) | apache-2.0-and-qwen-research (non-commercial) | Build ONNX para ONNX Runtime; fidelidad verificada frente al original |
| OmniSVG 1.1 (4B) original | 4B | no disponible | safetensors (presumiblemente) | no disponible | Modelo base del que deriva esta conversion |
| Otros modelos text-to-SVG | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Licencia restringida: la licencia combina Apache 2.0 y Qwen Research, y la model card incluye el tag `non-commercial`; el uso comercial requiere revisar los terminos de ambas licencias.
- Fidelidad no absoluta: el build int8 reproduce el token original en el 99,3 % de los pasos y solo 22 de 64 secuencias identicas, por lo que puede haber divergencias respecto al modelo original.
- Idiomas soportados no documentados: no hay informacion sobre el rendimiento en castellano u otros idiomas.
- Longitud de contexto no documentada: se desconoce el limite de tokens de entrada.
- Riesgo de alucinacion: no documentado en la informacion proporcionada, pero inherente a los modelos generativos; los SVG generados deben validarse.
- Dependencia del pipeline: la generacion completa requiere usar el `pipeline.py` incluido, que gestiona el muestreo y la conversion a SVG; no basta con ejecutar los grafos de forma aislada.
- Sin datos de benchmarks de tareas: no se puede evaluar la calidad del modelo frente a alternativas con metricas estandar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad.

## Enlaces

- Repositorio ONNX: https://huggingface.co/moonbox-dev/OmniSVG1.1_4B-ONNX
- Modelo base: https://huggingface.co/OmniSVG/OmniSVG1.1_4B
- Paper (referencia arXiv): https://arxiv.org/abs/2504.06263
