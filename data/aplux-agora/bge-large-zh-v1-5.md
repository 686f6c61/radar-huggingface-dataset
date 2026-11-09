# APLUX-Agora/bge-large-zh-v1.5

## Resumen

`bge-large-zh-v1.5` es un modelo de embeddings de texto en chino distribuido por APLUX-Agora dentro de su plataforma Agora, orientada a la conversion y despliegue de modelos en hardware Qualcomm para escenarios AIoT. El repositorio no contiene los pesos originales del modelo BGE de BAAI, sino recursos precompilados y cuantizados (W8A16) para ejecutarse en SoC Qualcomm concretos, en este caso el QCS8550 sobre la placa Rhino Pi X1. El modelo base subyacente es el conocido BGE-large-zh-v1.5, un encoder de la familia BGE especializado en representaciones densas de texto en chino.

La funcion del modelo es generar embeddings normalizados de 1024 dimensiones a partir de texto, lo que permite calcular similitud coseno entre fragmentos y construir sistemas de busqueda semantica, recuperacion aumentada (RAG) o deduplicacion de documentos en chino. El paquete de APLUX-Agora anade el interes de ofrecer una ruta de despliegue medida en hardware de borde: la model card reporta una latencia de 119,7 ms con precision W8A16 en el QCS8550.

Es relevante para desarrolladores que necesitan ejecutar inferencia de embeddings en dispositivos Qualcomm sin depender de la nube, aunque con las limitaciones propias de un artefacto derivado: no se publican pesos en formatos estandar como safetensors o GGUF, la licencia es propia (APLUX Model Farm License) y la informacion tecnica sobre entrenamiento y evaluacion es practicamente inexistente en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base BGE-large-zh-v1.5, encoder transformer; detalles no publicados en el repo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 (unica precision publicada, para QCS8550) |
| Idiomas soportados | chino (segun la model card: "BGE 中文文本向量") |
| Licencia | APLUX Model Farm License (`aplux-model-farm`); licencia del modelo fuente segun sus terminos originales |
| Formato de pesos | binarios compilados por SoC (`model.bin` dentro de `targets/<SoC>/`), no safetensors ni GGUF |
| Dimension del embedding | 1024 (vectores normalizados) |
| SoC soportado | Qualcomm QCS8550 (placa Rhino Pi X1) |
| Latencia medida | 119,7 ms (W8A16, QCS8550) |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna ni el proceso de entrenamiento. Por la denominacion del modelo fuente (BGE-large-zh-v1.5) se trata de un encoder transformer entrenado para producir embeddings de frases, con salida de 1024 dimensiones y normalizacion L2 para permitir similitud coseno directa. La model card solo confirma esa salida y la tarea de comparacion de multiples fragmentos de texto.

Lo que si describe el autor es la cadena de conversion: recursos "converted, deployable" empaquetados por SoC, con un `model.json` que declara la precision por defecto y las rutas de las variantes, y binarios de contexto llamados `model.bin`. La cuantizacion disponible es W8A16 (pesos en 8 bits, activaciones en 16 bits), una eleccion habitual en aceleradores NPU/DSP de Qualcomm. No se aportan datos sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas del modelo base.

## Capacidades

- Generacion de embeddings de texto en chino con 1024 dimensiones y normalizacion, aptos para similitud coseno.
- Comparacion de multiples segmentos de texto en una misma llamada (entrada `text`, salida `embedding`).
- Busqueda semantica y recuperacion de documentos en chino mediante indexacion vectorial.
- Calculo de similitud entre consultas y pasajes para pipelines RAG.
- Deteccion de duplicados y near-duplicates textuales por distancia coseno.
- Inferencia en dispositivo sobre SoC Qualcomm QCS8550 con precision W8A16.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (es un modelo de embeddings, no generativo).
- Capacidades multilingues: no disponibles; la model card solo menciona chino.
- Vision, audio o modo thinking: no disponible.

## Casos de uso

- Busqueda semantica en aplicaciones moviles y de borde: el modelo genera embeddings de 1024 dimensiones en 119,7 ms sobre QCS8550, lo que permite indexar y consultar un corpus local de documentos en chino sin enviar datos a la nube.
- RAG en dispositivos AIoT: integrado en un pipeline de recuperacion, vectoriza fragmentos de manuales o bases de conocimiento y recupera los pasajes mas similares a la consulta del usuario antes de pasarlos a un LLM, manteniendo la fase de recuperacion en local.
- Deduplicacion de registros y catalogos: comparando embeddings con similitud coseno se pueden agrupar entradas repetidas o casi identicas en bases de datos de producto, tickets o articulos.
- Clasificacion y enrutado por similitud: comparar la consulta del usuario contra embeddings de prototipos de cada categoria permite enrutar peticiones a un flujo u otro en asistentes de atencion al cliente.
- Moderacion y filtrado de contenido: medir la cercania de un texto a un conjunto de ejemplos etiquetados para marcar contenido sospechoso en entornos con recursos limitados.
- Sistemas de recomendacion basados en contenido: vectorizar descripciones o historiales textuales y calcular vecinos mas cercanos para sugerir articulos relacionados en aplicaciones de borde.
- Despliegue en placas Qualcomm para prototipado: usar el paquete de Agora y la guia de despliegue para validar latencia y precision en el hardware objetivo antes de escalar la solucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es la latencia medida por el autor en hardware concreto:

| Metrica | Valor | Hardware | Precision |
|---|---|---|---|
| Latencia de inferencia | 119,7 ms | Qualcomm QCS8550, placa Rhino Pi X1 | W8A16 |

No hay datos de MMLU, MTEB, C-MTEB ni de calidad de recuperacion (recall@k) para este paquete, ni comparaciones con el modelo original sin cuantizar.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma explicita; el repositorio completo ocupa 0,4 GB y el binario W8A16 es la unica variante publicada.
- GPU recomendadas: no aplica; el paquete esta orientado a SoC Qualcomm, no a GPU de servidor.
- Hardware validado: Qualcomm QCS8550 sobre placa Rhino Pi X1 (unico SoC con recursos en `targets/`).
- Cabe en GPU de consumo: no disponible; no se publican pesos en formatos ejecutables en GPU (safetensors, GGUF).
- Opciones de despliegue: runner y proyecto exportable de la plataforma Agora (mega.aidlux.com), con el comando `hf download` indicado en la model card para obtener los recursos por SoC. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 119,7 ms por inferencia en QCS8550 con W8A16 (precision por defecto). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Despliegue en borde Qualcomm |
|---|---|---|---|---|---|---|
| APLUX-Agora/bge-large-zh-v1.5 | no disponible | no disponible | chino | APLUX Model Farm License | binarios por SoC | Si (QCS8550, W8A16) |
| BAAI/bge-large-zh-v1.5 (modelo fuente) | no disponible en esta ficha | no disponible en esta ficha | chino | segun terminos del modelo original | safetensors (habitual) | No empaquetado |
| Alternativas de embeddings en chino de la familia BGE (p. ej. variantes base/small) | no disponible en esta ficha | no disponible | chino | segun modelo | safetensors/GGUF segun distribucion | Requiere conversion propia |

La comparacion cuantitativa de calidad (MTEB/C-MTEB) no esta disponible en la informacion proporcionada. La diferencia practica frente al modelo fuente es el empaquetado precompilado para Qualcomm y la licencia derivada.

## Limitaciones y advertencias

- El repositorio no contiene pesos en formatos estandar: no se puede cargar con `transformers`, llama.cpp u otras herramientas habituales sin el runner de Agora.
- Solo hay recursos publicados para un SoC (QCS8550); no se garantiza compatibilidad con otros chips Qualcomm.
- La licencia APLUX Model Farm License es propia y distinta de la del modelo fuente; hay que revisar `LICENSE_MODEL_FARM.pdf` antes de cualquier uso comercial, y ademas respetar los terminos del modelo original.
- La model card remite a la licencia del modelo fuente sin detallarla; la trazabilidad legal del artefacto derivado queda parcialmente cubierta.
- Solo se documenta soporte de chino; el comportamiento en otros idiomas no esta verificado.
- No se publican datos de entrenamiento, evaluacion ni calidad de recuperacion, por lo que no hay evidencia de que la cuantizacion W8A16 preserve el rendimiento del modelo original.
- Como modelo de embeddings, puede producir similitudes espurias en dominios muy especializados o con vocabulario fuera de distribucion; conviene validar con un conjunto propio antes de produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion ni mantenimiento por parte de la comunidad.
- No se dispone de informacion sobre sesgos del modelo fuente en esta ficha.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/APLUX-Agora/bge-large-zh-v1.5
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/bge-large-zh-v1.5/blob/main/LICENSE_MODEL_FARM.pdf
- Pagina del modelo en Agora (prueba online y guia de despliegue): https://mega.aidlux.com/models/bge-large-zh-v1.5
- Plataforma Agora: https://mega.aidlux.com
