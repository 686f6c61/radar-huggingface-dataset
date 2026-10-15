# danyalmalik/DeepSeek-R1-0528-Qwen3-8B-ONNX-WebGPU

## Resumen

Este repositorio no contiene un modelo nuevo, sino una conversion del modelo de razonamiento DeepSeek-R1-0528-Qwen3-8B de DeepSeek al formato ONNX, preparada por el usuario danyalmalik para ejecutarse directamente en el navegador mediante el backend WebGPU de ONNX Runtime Web, tal y como lo utiliza la herramienta Quick Inference. El modelo base es un transformer denso de aproximadamente 8.200 millones de parametros, obtenido al continuar el post-entrenamiento del modelo Qwen3-8B Base con cadenas de razonamiento (CoT) generadas por DeepSeek-R1-0528.

La relevancia de esta conversion es practica: permite desplegar un modelo de razonamiento de 8B en el cliente, sin servidor ni API, aprovechando la GPU del usuario a traves de WebGPU. El precio que se paga es la cuantizacion: las capas lineales y la cabeza LM se reducen a 4 bits (redondeo al mas cercano, tamano de bloque 32), mientras que los embeddings, las activaciones y la cache KV se mantienen en float16.

El repositorio tiene 5,5 GB, no registra descargas ni "likes" en el momento de la consulta, y se publica bajo licencia MIT, la misma que el modelo original. Las salidas del modelo convertido son cercanas, pero no identicas, a las del modelo original, segun advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Qwen3 con Group Query Attention (GQA); exportado como decodificador ONNX en el layout de ONNX Runtime GenAI |
| Parametros totales | Aproximadamente 8.200 millones (8,2B) en el modelo base |
| Parametros activos | No aplica: el modelo base es denso, no es MoE |
| Longitud de contexto | No disponible en la model card de la conversion. Fuentes externas sobre el modelo base indican 33K de contexto y 16K de salida; la configuracion nativa de la familia Qwen3-8B es de 32.768 tokens, ampliable con YaRN (la conversion aplica un magnitude scaling de YaRN de 1,0) |
| Tipos de cuantizacion | Capas lineales y cabeza LM en 4 bits (round to nearest, block size 32); embeddings, activaciones y cache KV en float16 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (layout ORT GenAI: `input_ids`, `attention_mask`, `past_key_values.*` como entradas; `logits`, `present.*` como salidas) |
| Tamano del repositorio | 5,5 GB |
| Modelo base | deepseek-ai/DeepSeek-R1-0528-Qwen3-8B |
| Fecha de creacion | 2026-10-14 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-R1-0528-Qwen3-8B, se construye destilando las capacidades de razonamiento de DeepSeek-R1-0528 en el modelo Qwen3-8B Base. El proceso descrito consiste en continuar el post-entrenamiento del modelo Qwen3-8B Base utilizando cadenas de pensamiento (Chain-of-Thought) generadas por DeepSeek-R1-0528. El resultado es un transformer denso de 8,2B parametros con GQA, orientado a tareas de razonamiento, matematicas y codigo, con un coste de inferencia muy inferior al de los modelos de razonamiento de gran tamano de la familia R1.

La conversion a ONNX la realiza el exportador propio de Quick Inference. Los cambios documentados por el autor son tres: (1) el grafo se reorganiza al layout de decodificador de ONNX Runtime GenAI, con la rotacion posicional (rotary embedding) integrada dentro del operador `GroupQueryAttention`; (2) se aplica cuantizacion de 4 bits a las capas lineales y a la cabeza LM, manteniendo embeddings, activaciones y cache KV en float16; y (3) se fija el magnitude scaling de YaRN en 1,0, resultado de multiplicar el `attn_factor` de la configuracion (0,878) por el valor por defecto de YaRN (1 + 0,1 · ln 4), tal y como lo aplica vLLM. No se documenta ningun entrenamiento adicional ni ajuste fino sobre el modelo convertido: es exclusivamente una conversion con cuantizacion.

## Capacidades

- Generacion de texto con razonamiento explicito: hereda el modo de cadena de pensamiento del modelo base, orientado a matematicas, logica y codigo.
- Resolucion de problemas matematicos: el modelo base reporta un 86,0% en AIME 2024.
- Generacion de codigo: el modelo base reporta un 60,5% en LiveCodeBench.
- Ejecucion local en navegador: la conversion esta pensada para inferencia con el backend WebGPU de ONNX Runtime Web, sin necesidad de servidor.
- Capacidades multilingues: no disponible; la model card de la conversion no declara idiomas soportados.
- Tool calling / function calling: no disponible; no se documenta en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente para esta conversion; el razonamiento en cadena del modelo base es compatible en principio con flujos multi-paso, pero no hay validacion publicada.
- Vision o audio: no soportados; se trata de un modelo exclusivamente de texto.
- Fidelidad respecto al original: las salidas son "cercanas, pero no identicas" a las del modelo sin cuantizar, segun la propia model card.

## Casos de uso

- Asistentes de razonamiento en el navegador: al ejecutarse sobre WebGPU, el modelo permite ofrecer un asistente que resuelve problemas de logica o matematicas sin enviar los datos del usuario a un servidor, lo que simplifica el cumplimiento de requisitos de privacidad.
- Aplicaciones web educativas con correccion paso a paso: el modo de razonamiento en cadena permite mostrar al estudiante el desarrollo de un problema, no solo la respuesta final, dentro de una pagina estatica sin backend.
- Prototipado rapido de productos de IA: Quick Inference y ONNX Runtime Web permiten integrar un modelo de 8B en una demo web sin aprovisionar GPUs en la nube, util para validar ideas antes de invertir en infraestructura.
- Generacion de codigo asistida en documentacion tecnica interactiva: el modelo puede explicar fragmentos de codigo o proponer ejemplos dentro de un portal de documentacion, y la ejecucion en cliente evita costes de API por tokens.
- Preprocesado y razonamiento en herramientas de escritorio multiplataforma: cualquier aplicacion empaquetada con un runtime ONNX puede incorporar el modelo para tareas de clasificacion razonada, extraccion de conclusiones o resumen analitico.
- Entornos con conectividad limitada o air-gapped: al no requerir conexion, el modelo es adecuado para despliegues en redes aisladas donde no se permite llamar a APIs externas.
- Filtrado y moderacion con razonamiento: puede emplearse para decidir de forma argumentada si un texto incumple una politica, ejecutandose localmente y sin filtrar el contenido a terceros.

## Benchmarks y rendimiento

Los unicos datos numericos disponibles en la informacion proporcionada corresponden al modelo base, no a esta conversion cuantizada:

| Benchmark | Resultado | Modelo evaluado |
|---|---|---|
| AIME 2024 | 86,0% | DeepSeek-R1-0528-Qwen3-8B (base, sin cuantizar) |
| LiveCodeBench | 60,5% | DeepSeek-R1-0528-Qwen3-8B (base, sin cuantizar) |

No se han publicado resultados de benchmarks del export ONNX con cuantizacion de 4 bits en la informacion disponible. Dado que la cuantizacion afecta a todas las capas lineales y a la cabeza LM, es razonable esperar una degradacion respecto a las cifras anteriores, pero su magnitud no esta documentada.

## Requisitos de hardware

- Peso de los pesos en disco: 5,5 GB, correspondientes al grafo ONNX con lineales y cabeza LM en 4 bits y embeddings en float16.
- Memoria de GPU estimada para inferencia: en torno a 6 GB en el arranque (pesos mas buffers de activaciones en float16), a lo que hay que sumar la cache KV.
- Cache KV: con la configuracion habitual de Qwen3-8B (36 capas, 8 cabezas KV, dimension de cabeza 128) y cache en float16, cada token consume aproximadamente 147 kB. Esto supone unos 590 MB para 4.096 tokens de contexto y unos 4,7 GB para 32.768 tokens. Es el factor dominante al aumentar el contexto.
- GPU consumer compatibles: tarjetas con 8 GB o mas de VRAM pueden ejecutar ventanas cortas; para aprovechar contextos largos conviene disponer de 12-16 GB (por ejemplo, RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB). En GPUs de 8 GB con contexto amplio el riesgo de fallo por falta de memoria es alto.
- GPUs de centro de datos: A100, H100 o L40S no son necesarias para un modelo de 8B cuantizado a 4 bits, pero permitirian lotes mayores y contextos largos sin presion de memoria.
- Despliegue en navegador: ONNX Runtime Web con backend WebGPU, a traves de Quick Inference. Requiere un navegador con soporte de WebGPU estable.
- Despliegue en servidor: el layout de ORT GenAI es compatible con ONNX Runtime GenAI, aunque el autor solo documenta el uso en navegador.
- Latencia y throughput: no disponibles. En WebGPU, el prefill de contextos largos esta limitado por el ancho de banda de memoria de la GPU del usuario y por el coste de compilar y cargar un grafo de 5,5 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| danyalmalik/DeepSeek-R1-0528-Qwen3-8B-ONNX-WebGPU | 8,2B (4 bits en lineales) | No disponible (33K segun fuentes sobre el base) | MIT | ONNX (ORT GenAI) | HuggingFace, 0 descargas |
| deepseek-ai/DeepSeek-R1-0528-Qwen3-8B | 8,2B | No disponible (33K segun fuentes externas) | MIT | safetensors | HuggingFace, sin restricciones de acceso |
| Qwen3-8B (modelo base de la destilacion) | 8,2B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | safetensors | HuggingFace |
| DeepSeek-R1-Distill-Llama-8B | 8B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | safetensors | HuggingFace |

La diferencia clave frente a las alternativas es el formato: esta es la unica de las opciones listadas pensada explicitamente para ejecucion en navegador mediante WebGPU. Frente al modelo base sin cuantizar, pierde precision numerica a cambio de un tamano mucho menor. No se dispone de datos comparativos de rendimiento entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Es un repositorio de terceros, no oficial, con 0 descargas y 0 "likes" en el momento de la consulta: no ha pasado por una validacion amplia de la comunidad.
- Las salidas del modelo convertido son cercanas, pero no identicas, a las del modelo original, tal y como advierte la propia model card.
- La cuantizacion de 4 bits con redondeo al mas cercano y bloque de 32 sobre todas las capas lineales y la cabeza LM puede degradar tareas sensibles a la precision numerica, especialmente calculo aritmetico de varios pasos y generacion de codigo.
- No hay benchmarks publicados de esta conversion concreta; las cifras de AIME 2024 y LiveCodeBench corresponden al modelo base sin cuantizar y no deben extrapolarse.
- No se declaran idiomas soportados en la model card de la conversion. El rendimiento fuera del ingles y del chino no esta verificado.
- Riesgo de alucinacion: los modelos de razonamiento destilados pueden producir cadenas de pensamiento plausibles pero incorrectas, y la cuantizacion puede agravar este comportamiento en tareas de calculo.
- No se documentan capacidades de tool calling, function calling ni uso como agente; no conviene asumirlas sin evaluacion previa.
- Restricciones de licencia: el repositorio declara MIT, los mismos terminos que el modelo original, pero la model card remite al fichero LICENSE para los terminos completos. Conviene verificar los terminos del modelo base antes de un uso comercial.
- Limite de contexto: la ventana no esta declarada en la model card de la conversion; las cifras de 33K de contexto y 16K de salida provienen de un proveedor de API externo y pueden no reflejar el comportamiento del export ONNX.
- Consumo de memoria en navegador: cargar 5,5 GB de pesos en una pestana puede provocar presion de memoria en equipos con poca VRAM o con GPU integrada. No hay mecanismo documentado de descarga parcial.
- Dependencia del soporte de WebGPU del navegador: equipos o navegadores sin WebGPU estable no podran ejecutar el modelo.
- No se han publicado datos sobre sesgos del modelo base ni de la conversion en la informacion disponible.

## Enlaces

- Repositorio de la conversion: https://huggingface.co/danyalmalik/DeepSeek-R1-0528-Qwen3-8B-ONNX-WebGPU
- Modelo base en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-R1-0528-Qwen3-8B
- Arbol de ficheros del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-0528-Qwen3-8B/tree/main
- Ficha descriptiva con cifras de benchmarks del modelo base: https://dev.co/ai/llms/deepseek-r1-0528-qwen3-8b
- Ficha del modelo en el proveedor SiliconFlow (contexto y salida): https://www.free-model.com/models/siliconflow/deepseek-ai-deepseek-r1-0528-qwen3-8b/
- Ficha en LM Studio: https://lmstudio.ai/models/deepseek/deepseek-r1-0528-qwen3-8b
