# chmielvu/gliner2.5-decide-fp8-onnx

## Resumen

GLiNER2.5-Decide (fp8 E4M3FN weights-only ONNX) es una conversion cuantizada en formato ONNX del modelo de clasificacion de texto fastino/GLiNER2.5-Decide, publicada por el usuario chmielvu. Se trata de una exportacion "weights-only": unicamente los pesos se almacenan en float8e4m3fn con escalas fp32 por tensor, mientras que el grafo mantiene la misma interfaz de entrada y salida que la exportacion fp32 original de nishparadox. El resultado es un artefacto de 0,44 GB frente a los 1,75 GB de la referencia fp32, una reduccion de aproximadamente el 75 % en disco y memoria.

La relevancia de esta ficha es practica: permite desplegar un clasificador GLiNER2 (reconocimiento de entidades y clasificacion basada en etiquetas) en entornos con onnxruntime sin necesidad de GPU dedicada, manteniendo una paridad casi exacta con el modelo fp32 (argmax identico en los fixtures de prueba y una desviacion maxima de probabilidad de 0,012). En hardware sin kernels fp8 nativos, onnxruntime descomprime los pesos a fp32 en carga o ejecucion, con lo que la velocidad iguala a la del modelo fp32 pero con la mitad de uso de disco y RAM.

Conviene subrayar que este repositorio no contiene un modelo entrenado desde cero ni una model card con detalles de entrenamiento: es un artefacto de infraestructura derivado de un modelo base cuya informacion tecnica completa no esta disponible en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Exportacion ONNX de GLiNER2 (modelo base fastino/GLiNER2.5-Decide); arquitectura interna del modelo base no disponible |
| Parametros totales | no disponible (repo de 0,4 GB; pesos fp8 de 0,44 GB) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (entrada `input_ids [1,L]` con L variable) |
| Tipos de cuantizacion | float8e4m3fn (FP8 E4M3FN) con escala fp32 por tensor; tensores pequenos (normas, sesgos) en fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model_fp8.onnx`), opset 19 |

## Arquitectura y entrenamiento

El artefacto es una conversion weights-only del grafo ONNX fp32 de nishparadox/gliner2.5-decide-onnx, a su vez exportacion de fastino/GLiNER2.5-Decide. Todos los inicializadores fp32 con 2048 elementos o mas se almacenan como float8e4m3fn con una escala fp32 por tensor (escalado max-448), emitidos como nodos `DequantizeLinear` de solo descompresion; el opset se eleva de 17 a 19. Los tensores pequenos, como normas y sesgos, permanecen en fp32 para no degradar la precision.

La interfaz del grafo es identica a la exportacion fp32: `input_ids [1,L] int64`, `attention_mask [1,L] int64` y `label_positions [1,M] int64` como entradas, y `logits [1,M] float` como salida. La paridad frente a fp32 se midio con fixtures dorados: el argmax coincide en todos los casos y la desviacion maxima de probabilidad es de 0,012. El proceso se automatiza con `tools/make_fp8_export.py` y la verificacion con `tools/check_fp8_parity.py`. No se dispone de informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) del modelo base.

## Capacidades

- Clasificacion de texto: el modelo expone logits por etiqueta posicional (`label_positions`), lo que permite puntuar un conjunto de etiquetas candidatas para un texto dado.
- Reconocimiento de entidades basado en etiquetas (paradigma GLiNER): la estructura de entradas con posiciones de etiquetas sugiere extraccion de entidades zero-shot definidas en tiempo de inferencia, aunque la model card del artefacto no lo detalla.
- Inferencia en CPU mediante onnxruntime, con descompresion fp8 a fp32 en hardware sin soporte nativo.
- Ejecucion nativa fp8 en hardware con AVX512-FP8 o execution providers de GPU.
- Capacidades multilingues: no disponibles.
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Clasificacion de tickets de soporte en CPU: el modelo puede puntuar categorias predefinidas sobre el texto de cada ticket usando onnxruntime en servidores sin GPU, aprovechando que el artefacto ocupa 0,44 GB y cabe holgadamente en memoria de un contenedor pequeno.
- Moderacion de contenido por etiquetas: definir un conjunto de etiquetas de riesgo y obtener logits por etiqueta para cada mensaje; la paridad con fp32 (delta maximo de 0,012) permite fijar umbrales estables sin recalibrar respecto al modelo original.
- Extraccion de entidades en pipelines de documentos: usar las posiciones de etiquetas para identificar campos como nombres, fechas o importes en facturas y contratos, desplegando el modelo junto al resto del pipeline en el mismo nodo de CPU.
- Enrutamiento de consultas en asistentes conversacionales: clasificar la intencion del usuario entre un conjunto cerrado de rutas antes de invocar el modelo generativo, reduciendo coste al resolver la clasificacion localmente.
- Despliegue en el borde (edge) o en dispositivos con recursos limitados: el tamano reducido y la ejecucion via onnxruntime permiten empaquetar el clasificador en aplicaciones de escritorio o entornos embebidos con AVX2.
- Etiquetado asistido para anotacion de datos: preclasificar grandes volumenes de texto en lotes para priorizar la revision humana, con la ventaja de que el artefacto fp8 reduce el almacenamiento y la RAM necesarios en la flota de anotacion.
- Servicio de clasificacion de bajo coste en produccion: al ejecutarse en CPU con la misma velocidad que fp32 pero la mitad de memoria, encaja en arquitecturas de microservicios con autoescalado horizontal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la paridad frente a la exportacion fp32: argmax identico en todos los fixtures dorados y desviacion maxima de probabilidad de 0,012.

## Requisitos de hardware

- VRAM/almacenamiento: el fichero `model_fp8.onnx` ocupa 0,44 GB; en hardware sin kernels fp8 nativos, onnxruntime descomprime los pesos a fp32 en carga o ejecucion, por lo que la RAM efectiva se aproxima a la del modelo fp32 (referencia de 1,75 GB).
- GPU recomendadas: no disponible. El artefacto esta orientado a onnxruntime; en GPU se usarian los execution providers correspondientes, pero la informacion no especifica modelos concretos.
- Compatibilidad con GPU de consumo: no disponible de forma explicita; al tratarse de un clasificador de 0,44 GB, es previsible que quepa en GPUs de consumo, pero no se confirma en la informacion proporcionada.
- Opciones de despliegue: onnxruntime (libreria declarada), con soporte de execution providers de CPU y GPU; otras opciones como vLLM, llama.cpp, Ollama o TGI no se mencionan y no son aplicables a un grafo ONNX de clasificacion.
- Latencia y throughput: no disponibles. Se indica que en CPU sin kernels fp8 nativos (por ejemplo, AMD EPYC solo AVX2) la velocidad es la misma que la del modelo fp32, con la mitad de disco y RAM; en hardware con AVX512-FP8 o GPU se ejecuta de forma nativa.

## Comparativa con modelos similares

| Modelo | Formato | Tamano | Precision | Licencia | Notas |
|---|---|---|---|---|---|
| chmielvu/gliner2.5-decide-fp8-onnx | ONNX opset 19 | 0,44 GB | float8e4m3fn con escalas fp32 | Apache 2.0 | Objeto de esta ficha; paridad con fp32 (max dP 0,012) |
| nishparadox/gliner2.5-decide-onnx | ONNX | 1,75 GB | fp32 | no disponible | Exportacion de referencia del mismo modelo base |
| fastino/GLiNER2.5-Decide | no disponible | no disponible | no disponible | no disponible | Modelo base original de clasificacion GLiNER2 |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (clasificadores GLiNER cuantizados) en la informacion proporcionada.

## Limitaciones y advertencias

- El artefacto es una conversion de pesos, no un modelo nuevo: hereda cualquier sesgo o limitacion del modelo base fastino/GLiNER2.5-Decide, sobre el que no se aporta informacion.
- La cuantizacion introduce una desviacion de hasta 0,012 en las probabilidades; aunque el argmax se mantiene, umbrales muy ajustados pueden cambiar de decision en casos limite.
- En hardware sin soporte fp8 nativo no hay ganancia de velocidad, solo de disco y RAM; el beneficio de rendimiento depende de AVX512-FP8 o de execution providers de GPU compatibles.
- Idiomas soportados no disponibles: no se puede garantizar cobertura multilingue sin verificar el modelo base.
- Riesgo de alucinacion en sentido estricto no aplicable a un clasificador, pero si riesgo de clasificaciones erroneas en entradas fuera de distribucion o etiquetas ambiguas.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de la exportacion intermedia, que no se detalla en la informacion disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion comunitaria.
- No se documentan limitaciones de longitud de contexto; la entrada admite L variable, pero el maximo efectivo del modelo base es desconocido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chmielvu/gliner2.5-decide-fp8-onnx
- Exportacion ONNX fp32 de referencia: https://huggingface.co/nishparadox/gliner2.5-decide-onnx
- Modelo base: https://huggingface.co/fastino/GLiNER2.5-Decide
