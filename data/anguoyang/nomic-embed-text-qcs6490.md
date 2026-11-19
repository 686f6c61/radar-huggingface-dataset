# anguoyang/nomic-embed-text-qcs6490

## Resumen

Nomic Embed Text v1 es un modelo de embeddings de texto desarrollado por Nomic AI, con 137 millones de parametros y una dimensionalidad de salida de 512. Este repositorio concreto, publicado por el usuario anguoyang, no redistribuye pesos ni artefactos compilados: es una ficha de medicion que documenta el primer perfil publico de rendimiento de este modelo sobre el SoC Qualcomm QCS6490, integrado en el kit Dragonwing RB3 Gen 2 Vision Kit.

El interes de la publicacion es acotado pero practico: segun su autor, no existia entrada de rendimiento para el RB3 en el fichero `perf.yaml` de `qai-hub-models` 0.66.0. La ficha cubre ese hueco con una medicion reproducible mediante la API de Qualcomm AI Hub, usando el modelo ONNX exportado desde la definicion oficial de `nomic_embed_text` y el runtime QNN en precision fp32 sin cuantizacion explicita.

No se trata, por tanto, de un modelo nuevo ni de un fine-tune, sino de un registro de benchmarking en hardware edge. Para quien evalua el despliegue de embeddings en dispositivos Qualcomm, el dato relevante es el tiempo de inferencia estimado de 423,9 ms para 128 tokens de entrada y una salida de 512 dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (modelo de embeddings de texto; pesos upstream de Nomic Embed Text v1) |
| Parametros totales | 137 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | fp32 (ONNX sin cuantizacion explicita en la compilacion); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (modelo upstream); el repositorio no especifica licencia propia |
| Formato de pesos | no se distribuyen pesos; el autor referencia un ONNX exportado de 547.777.330 bytes compilado con QNN |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna ni el proceso de entrenamiento. Lo unico documentado es que el modelo upstream es Nomic Embed Text v1, un encoder de texto de 137 millones de parametros que produce embeddings de 512 dimensiones, y que la exportacion a ONNX se realizo desde la definicion `nomic_embed_text` incluida en `qai-hub-models` 0.66.0.

El trabajo tecnico de este repositorio se centra en el despliegue: compilacion de un grafo unico mediante la API de Qualcomm AI Hub (`submit_inference_job(..., profile=True)`) y perfilado en el runtime QNN del QCS6490. La cifra reportada corresponde a `execution_summary.estimated_inference_time`, es decir, una estimacion por grafo y no una latencia de aplicacion de extremo a extremo. Los identificadores de trabajo citados son `jgkkk30ng` (compilacion) y `j5600n0y5` (perfilado).

## Capacidades

- Generacion de embeddings de texto: entrada de 128 tokens (`input_tokens`, `attention_masks`) y salida de un vector de 512 dimensiones.
- Uso como encoder para recuperacion semantica, similitud entre frases y busqueda vectorial, segun la naturaleza del modelo upstream.
- Ejecucion en hardware edge Qualcomm mediante QNN, lo que habilita inferencia local sin GPU dedicada.
- Capacidades de tool calling, agentes, vision o audio: no disponibles (el modelo es un encoder de embeddings, no un modelo generativo).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Busqueda semantica en dispositivos: generar embeddings de consultas y documentos localmente en el QCS6490 para un indice vectorial embebido, evitando enviar texto a la nube; el perfil de 423,9 ms por consulta de 128 tokens permite estimar el presupuesto de latencia.
- Clasificacion y agrupamiento de textos en el borde: usar los vectores de 512 dimensiones como caracteristicas para clustering o clasificadores ligeros en aplicaciones de campo sin conectividad.
- Deduplicacion y deteccion de near-duplicates en pipelines de datos: calcular similitud coseno entre embeddings generados en lote sobre el dispositivo antes de la subida a un servidor.
- Enrutamiento de consultas en asistentes locales: decidir si una peticion va a un modelo generativo o a una base de conocimiento mediante similitud de embeddings, con inferencia en el propio kit RB3.
- Filtrado de contenido y moderacion en edge: comparar embeddings de mensajes contra un conjunto de referencia de patrones conocidos, manteniendo los datos en el dispositivo.
- Evaluacion de hardware para despliegue: emplear la receta y las cifras publicadas como referencia para dimensionar el numero de consultas por segundo asumibles en un QCS6490 antes de comprometer un producto.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo de inferencia estimado | 423,9 ms (423.889 µs) |
| Entrada | 1 x 128 tokens |
| Salida | 1 x 512 dimensiones |
| Dispositivo | Dragonwing RB3 Gen 2 Vision Kit (QCS6490) |
| Runtime | QNN |
| Precision | fp32 ONNX, opciones de compilacion por defecto de AI Hub |
| Fecha de medicion | 2026-11-18 |

No se han publicado resultados de benchmarks de calidad (MTEB, MMLU u otros) en la informacion disponible.

## Requisitos de hardware

- Hardware de referencia medido: Qualcomm QCS6490 en el kit Dragonwing RB3 Gen 2 Vision Kit, con runtime QNN.
- VRAM: no aplica; el despliegue es sobre NPU/SoC integrado, no sobre GPU discreta.
- GPU recomendadas: no disponibles para este repositorio; el modelo upstream puede ejecutarse en CPU o GPU convencionales, pero no se aportan cifras.
- Cabe en GPU de consumo: no hay datos en la informacion proporcionada.
- Opciones de despliegue documentadas: Qualcomm AI Hub (`qai-hub-models` 0.66.0) con compilacion y perfilado via API y runtime QNN. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no se mencionan.
- Throughput: con 423,9 ms por inferencia de 128 tokens, el limite teorico es de aproximadamente 2,4 inferencias por segundo en un unico grafo, sin solapamiento.
- Latencia: la cifra es una estimacion por grafo, no una latencia de aplicacion de extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de embedding | Contexto | Licencia | Medicion en QCS6490 |
|---|---|---|---|---|---|
| Nomic Embed Text v1 (este repositorio) | 137 M | 512 | no disponible | Apache-2.0 (upstream) | 423,9 ms / 128 tokens |
| Alternativas de embedding de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos de embeddings medidos en el mismo hardware dentro de la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni artefactos compilados: solo publica numeros y metodo. No es desplegable directamente desde este ID.
- La cifra de 423,9 ms es una estimacion por grafo obtenida con `profile=True`; no refleja latencia de aplicacion completa (preprocesado, tokenizacion, postprocesado, E/S).
- La medicion se realizo en fp32 sin cuantizacion explicita; cuantizaciones posteriores podrian alterar tanto la latencia como la calidad de los embeddings, y no se reportan.
- Entrada limitada a 128 tokens en la medicion; el comportamiento con secuencias mas largas no esta documentado.
- No se aportan datos de calidad de embeddings (MTEB u otros), sesgos, comportamiento multilingue ni riesgos de alucinacion (no aplica a un encoder, pero si la calidad de la representacion).
- La licencia del repositorio no esta declarada; la Apache-2.0 corresponde al modelo upstream y debe verificarse antes de uso comercial.
- Las fechas del repositorio (creacion y actualizacion en 2026) y la ausencia de descargas o likes sugieren un artefacto de publicacion reciente y sin validacion comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anguoyang/nomic-embed-text-qcs6490
- Repositorio de seguimiento del sweep de benchmarks: https://github.com/anguoyang/qcs-bench
- Modelo upstream Nomic Embed Text v1: no disponible en la informacion proporcionada (referenciado como `nomic-embed-text-v1`, Apache-2.0)
- Qualcomm AI Hub y `qai-hub-models` 0.66.0: no disponible enlace directo en la informacion proporcionada
