# agentrq/task-title-350m-ONNX

## Resumen

task-title-350m-ONNX es un modelo de generacion de texto especializado en una unica tarea: generar un titulo corto (unas 6 palabras como maximo) a partir de la descripcion de una tarea, y ejecutarse integramente en el navegador. Lo publica el autor `agentrq` como parte de la infraestructura de su producto AgentRQ, donde se usa para nombrar tareas en el dispositivo sin enviar datos a ningun servidor. Es un fine-tuning completo del modelo IBM Granite 4.0 350M (licencia Apache-2.0) y se distribuye en formato ONNX cuantizado a 4 bits.

El modelo tiene 350 millones de parametros y esta empaquetado en un unico fichero `onnx/model_q4.onnx` de 280 MB. Esta disenado para funcionar con la libreria `transformers.js` sobre los dos backends de `onnxruntime-web`: WebGPU y WebAssembly, de modo que el mismo fichero sirve tanto en navegadores con aceleracion grafica como sin ella. El pipeline declarado es `text-generation` y los idiomas soportados son ingles, espanol, aleman, frances y portugues.

Su relevancia es practica: demuestra que una tarea de resumen generativo concreta puede resolverse con un modelo de 350M cuantizado que cabe en el navegador, con una calidad que, segun la evaluacion del propio autor, supera ampliamente a alternativas como FLAN-T5-base y LaMini-Flan-T5-248M en el mismo caso de uso. No es un modelo de proposito general, sino una herramienta acotada con un prompt de sistema fijo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Granite MoE Hybrid (heredada de ibm-granite/granite-4.0-350m); pesos exportados a ONNX |
| Parametros totales | 350M |
| Parametros activos | no disponible (el modelo base es de tipo MoE hybrid; no se detalla el reparto activo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (int4, block size 32, accuracy level 4, embeddings no atados); un unico fichero q4 |
| Idiomas soportados | en, es, de, fr, pt |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model_q4.onnx`, 280 MB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base IBM Granite 4.0 350M, etiquetado en Hugging Face como `granitemoehybrid`, es decir, un transformer hibrido con componentes de mezcla de expertos. Sobre esa base se ha realizado un fine-tuning completo (no un adaptador) orientado a una tarea de generacion de titulos. La exportacion se hizo con el ONNX Runtime GenAI model builder en int4, con tamano de bloque 32, nivel de precision 4 y embeddings no atados; la dimension de cabeza de la cache KV se fija en 64. Como el operador de embeddings cuantizados del builder (`GatherBlockQuantized`) no existe en la build WASM de `onnxruntime-web`, se sustituyo por operadores estandar que leen una tabla de 4 bits (dos valores por byte, escalas de bloque en fp32), lo que permite que el mismo fichero funcione en WebGPU y en WebAssembly.

El entrenamiento uso aproximadamente 9.500 descripciones de tareas sinteticas con sus titulos, en su mayoria cortos. Tanto las descripciones como los titulos se generaron con Qwen3.8-27B (Apache-2.0, en la build RadixArk NVFP4), siguiendo una guia de estilo de titulos escrita a mano y 50 titulos de ejemplo tambien manuales. No se emplearon datos de clientes ni de usuarios. El modelo se entreno con un mensaje de sistema exacto ("Write a short title for this task.") seguido del texto de la tarea; segun el autor, otros prompts funcionan peor. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Generacion de titulos cortos (hasta unas 6 palabras) a partir de una descripcion de tarea, en ingles, espanol, aleman, frances y portugues.
- Resumen condensado de una instruccion o peticion en una etiqueta breve, orientado a interfaces de gestion de tareas.
- Ejecucion local en el navegador mediante `transformers.js`, con backend WebGPU cuando hay `navigator.gpu` y WebAssembly como alternativa.
- Inferencia determinista recomendada (`do_sample: false`) con `max_new_tokens` en torno a 20.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision ni audio.
- No se documenta un modo de razonamiento (thinking mode) ni capacidades especiales mas alla de la tarea de titulacion.
- El soporte multilingue existe, pero la evaluacion de los idiomas distintos del ingles se basa en grupos muy pequenos (8-24 tareas por idioma).

## Casos de uso

- Nombrado automatico de tareas en una aplicacion de gestion de proyectos: el modelo recibe la descripcion escrita por el usuario y devuelve un titulo breve; al ejecutarse en el navegador, la descripcion no sale del dispositivo.
- Etiquetado de tickets de soporte en el cliente: se puede generar un asunto corto a partir del cuerpo del ticket antes de enviarlo, reduciendo datos personales que viajan al servidor.
- Resumen de entradas de un backlog o de notas rapidas: convierte una frase larga e informal ("pls bump go to 1.26 and update the dockerfile too") en una etiqueta accionable ("Bump Go to 1.26").
- Aplicaciones web offline o con requisitos de privacidad estrictos: al no requerir backend, encaja en herramientas que deben funcionar sin conexion o en entornos donde no se permite enviar texto a servicios externos.
- Generacion de titulos en interfaces multilingues: cubre en, es, de, fr y pt con el mismo binario de 280 MB, util para productos con usuarios en varios paises.
- Prototipado rapido de funciones de resumen en el navegador: sirve como componente de demostracion o validacion de concepto para equipos que evaluan `transformers.js` y WebGPU sin montar infraestructura de inferencia.
- Preprocesado ligero en pipelines de documentacion: generar encabezados cortos para issues, commits o entradas de changelog a partir de descripciones breves.

## Benchmarks y rendimiento

Evaluacion sobre 1.000 tareas sinteticas reservadas (944 en ingles, mas espanol, aleman, frances y portugues), con un modelo juez (Qwen3.8-27B) que puntua cada titulo de 1 a 5 segun la guia de estilo. En las comparaciones cara a cara se invirtio el orden y un titulo solo gana si vence en ambas pasadas.

| Metrica | LaMini-Flan-T5-248M | FLAN-T5-base | task-title-350m-ONNX |
|---|---|---|---|
| Descarga en navegador | 275 MB | 275 MB | 280 MB |
| Titulos puntuados 4-5 | 78% | 75% | 98% |
| Puntuacion media | 3.64 | 3.62 | 4.08 |
| ROUGE-L frente a referencia | 0.48 | 0.47 | 0.74 |

En enfrentamientos directos, excluyendo empates, el modelo supera a FLAN-T5-base por 216-20 y a LaMini-Flan-T5-248M por 109-5.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero pesa 280 MB en int4; en WebGPU el consumo de memoria grafica es del orden de cientos de MB, aunque no se publica una cifra exacta.
- GPU recomendadas: cualquier GPU integrada o dedicada accesible desde el navegador mediante WebGPU; en servidor, una GPU consumer moderna (por ejemplo, RTX 4090) es mas que suficiente para un modelo de 350M.
- Cabe en GPU consumer: si, con margen amplio; tambien funciona en CPU mediante el backend WebAssembly de `onnxruntime-web`.
- Opciones de despliegue: `transformers.js` con `onnxruntime-web` (WebGPU o WASM). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al tratarse de un export ONNX especifico para navegador.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad en la tarea (media 1-5) | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| task-title-350m-ONNX | 350M | no disponible | 4.08 | Apache-2.0 | ONNX int4, navegador (WebGPU/WASM) |
| FLAN-T5-base | no disponible en la informacion | no disponible | 3.62 | no disponible en la informacion | modelo T5; usado como referencia en la evaluacion del autor |
| LaMini-Flan-T5-248M | 248M | no disponible | 3.64 | no disponible en la informacion | modelo T5 destilado; usado como referencia en la evaluacion del autor |

La comparacion se limita a las alternativas incluidas en la evaluacion del autor; no se dispone de datos frente a otros modelos de titulacion o resumen de tamano similar.

## Limitaciones y advertencias

- Modelo de tarea unica: esta entrenado con un mensaje de sistema concreto ("Write a short title for this task."); otros prompts funcionan peor y no debe usarse como modelo de proposito general.
- La evaluacion es sintetica: el conjunto de prueba lo genero la misma familia de modelos que produjo los datos de entrenamiento y lo juzgo ese mismo modelo, por lo que los resultados pueden estar sesgados al alza.
- Los grupos no ingleses son muy pequenos (8-24 tareas por idioma), de modo que las conclusiones sobre espanol, aleman, frances y portugues son debiles.
- Los titulos a veces son demasiado tersos y omiten detalles como el nombre de un fichero.
- Riesgo de alucinacion: al ser un modelo pequeno y especializado, puede inventar terminos o simplificar en exceso descripciones ambiguas; conviene validar la salida en flujos criticos.
- No se documentan sesgos especificos, pero al entrenarse con datos sinteticos generados por otro modelo hereda los sesgos de estilo de ese generador y de la guia de estilo manual.
- Licencia Apache-2.0: permite uso comercial, pero el autor indica que es una version modificada del modelo de IBM y no ofrece garantias.
- El export depende de `onnxruntime-web`; cambios en los backends WebGPU/WASM o en los operadores soportados pueden afectar a la ejecucion.
- No hay datos publicados de latencia, throughput ni consumo de memoria en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentrq/task-title-350m-ONNX
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-350m
- Modelo generador de datos de entrenamiento: https://huggingface.co/Qwen/Qwen3.8-27B
- Build NVFP4 usada para generar los datos: https://huggingface.co/RadixArk/Qwen3.8-27B-NVFP4
- Producto del autor: https://agentrq.com
