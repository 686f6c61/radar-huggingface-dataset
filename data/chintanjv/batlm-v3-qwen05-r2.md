# chintanjv/BatLM-v3-qwen05-r2

## Resumen
BatLM-v3-qwen05-r2 es un ajuste fino de SmolLM2-360M-Instruct (360 millones de parametros, licencia Apache-2.0) desarrollado por el usuario chintanjv como proyecto educativo y de fan. El modelo responde preguntas sobre el universo de Batman a partir de pasajes recuperados (RAG), con un formato de prompt que inyecta tres fragmentos de contexto ("CASE FILES") antes de la pregunta. Su proposito es demostrar un pipeline completo de RAG en el navegador: busqueda, construccion de prompt, generacion y evaluacion, todo ejecutandose en cliente.

La arquitectura es la de SmolLM2, un transformer decoder-only de 360M parametros, sobre el que se aplico un LoRA (r=16, todas las capas lineales, 2 epochs) que posteriormente se fusiono en los pesos base. El modelo se distribuye en formato ONNX cuantizado (q4f16 para WebGPU y q4 para CPU/WASM) mediante onnxruntime-genai, y se consume con transformers.js. El contexto util es corto: el modelo esta disenado para responder en una o dos frases a partir de tres pasajes, no para conversaciones multi-turno.

Es relevante ahora por su enfoque de despliegue en el navegador con WebGPU y por su evaluacion transparente: 161 preguntas retenidas, 95.7% de respuestas correctas con el mismo codigo de busqueda y prompt que usa la web. No es un modelo de proposito general ni compite en benchmarks de razonamiento; es una pieza de referencia para quien quiera montar RAG de bajo coste en cliente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2), ajuste fino con LoRA fusionado |
| Parametros totales | 360M (modelo base SmolLM2-360M-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el prompt usa 3 pasajes; el base SmolLM2-360M-Instruct tiene 8192 tokens) |
| Tipos de cuantizacion | ONNX k-quant con block size 16: q4f16 (WebGPU, 347 MB) y q4 (CPU/WASM); matrices de atencion, salida de cada MLP y LM head en 8 bits, resto de matrices MLP en 4 bits |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-sa-4.0 (pesos); modelo base Apache-2.0; corpus Wikipedia CC BY-SA 4.0 |
| Formato de pesos | safetensors y ONNX (onnx/model_q4f16.onnx, onnx/model_q4.onnx) |

## Arquitectura y entrenamiento
El modelo parte de SmolLM2-360M-Instruct, un transformer decoder-only denso de 360M parametros. Sobre el se entreno un adaptador LoRA con rango 16 aplicado a todas las capas lineales durante 2 epochs, que despues se fusiono en los pesos para producir un checkpoint unico. No hay innovaciones arquitectonicas propias: el interes esta en el pipeline de datos y de despliegue.

Los datos de entrenamiento consisten en aproximadamente 2.000 preguntas generadas a partir de 286 fichas de hechos escritas a mano y verificadas contra fuentes, mas las frases iniciales de 333 paginas de Wikipedia. Cada prompt de entrenamiento incluye los tres pasajes que el buscador propio del proyecto devuelve para esa pregunta, de modo que el modelo aprende a responder condicionado al contexto recuperado y a rechazar cuando la respuesta no esta en los pasajes. No se menciona RLHF ni DPO; el ajuste es supervisado sobre pares pregunta-respuesta con contexto. La cuantizacion se realizo con onnxruntime-genai builder.

## Capacidades
- Generacion de texto condicionada a contexto: responde en una o dos frases o una lista numerada corta a partir de los pasajes inyectados en el prompt.
- RAG integrado: el formato de prompt incluye tres "CASE FILES" numerados con titulo y seccion; el modelo cita implicitamente esa evidencia y declina si no contiene la respuesta.
- Rechazo controlado: entrenado explicitamente para decir que no sabe cuando los pasajes no cubren la pregunta o cuando la pregunta esta fuera de tema (100% en las categorias de rechazo de la evaluacion).
- Cobertura de hechos no vistos: generaliza a hechos nunca presentes en entrenamiento (94.7% en 38 preguntas) y a paginas de Wikipedia sin ficha de hechos (94.4% en 18).
- Ejecucion en navegador: pesos ONNX q4f16 para WebGPU y q4 para CPU/WASM, consumibles con transformers.js.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking.
- No mantiene conversaciones multi-turno; el modelo card lo indica explicitamente.

## Casos de uso
- Demostracion de RAG en el navegador: integrar el modelo con un indice de pasajes y transformers.js para responder preguntas sobre un corpus cerrado sin enviar datos a un servidor; encaja por su tamano (347 MB en q4f16) y por el formato de prompt ya validado en la web del proyecto.
- Asistente de consulta sobre documentacion interna: usar el mismo patron de tres pasajes y respuesta corta para FAQ de producto, con rechazo explicito cuando la respuesta no esta en los fragmentos recuperados; util por su comportamiento de declive medido al 100%.
- Base para proyectos educativos de IA: sirve para ensenar ajuste fino con LoRA, fusion de adaptadores, cuantizacion ONNX y evaluacion por categorias, con un dataset pequeno y reproducible (286 fichas, 2.000 preguntas).
- Evaluacion de pipelines de recuperacion: al estar entrenado con los pasajes que devuelve un buscador concreto, cambios en el recuperador se reflejan de forma medible en la tasa de acierto; util como banco de pruebas de estrategias de chunking y ranking.
- Prototipado de asistentes de dominio con requisitos de privacidad: al ejecutarse en cliente via WebGPU, los pasajes y la pregunta no salen del navegador; adecuado para demos de consulta sobre material sensible o con restricciones de envio de datos.
- Filtro de alcance en aplicaciones de tematica cerrada: usar el modelo para decidir si una pregunta pertenece al dominio cubierto por el corpus y rechazar el resto, aprovechando su entrenamiento explicito en preguntas fuera de tema.
- Generacion de respuestas citables en documentacion: el formato de salida corto y anclado a pasajes facilita mostrar la respuesta junto a los fragmentos de origen, lo que reduce el coste de verificacion manual.

## Benchmarks y rendimiento
Evaluacion del autor sobre 161 preguntas retenidas, respondidas por `model_q4f16.onnx` en Chrome headless con WebGPU, usando el mismo codigo de busqueda y prompt que la web. Se considera correcta una respuesta que contiene todos los hechos requeridos, no incluye ninguna afirmacion falsa listada, no es un rechazo y termina antes del limite de tokens.

| Categoria | n | Correctas |
|---|---|---|
| Ejemplos obligatorios | 13 | 100% |
| Hechos entrenados, nueva formulacion | 59 | 93.2% |
| Hechos nunca vistos en entrenamiento | 38 | 94.7% |
| Paginas de Wikipedia sin ficha de hechos | 18 | 94.4% |
| Preguntas de Batman que los pasajes no pueden responder (debe declinar) | 13 | 100% |
| Fuera de tema (debe declinar) | 20 | 100% |
| **Total** | **161** | **95.7%** |

El modelo en precision completa obtiene el mismo 95.7%. Una variante con solo la atencion en 8 bits (306 MB) baja a 89.4%. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no aplica para despliegue en navegador; el artefacto q4f16 ocupa 347 MB en disco y se carga en memoria del cliente via WebGPU. La variante q4 para CPU/WASM es menor en disco (tamano exacto no disponible).
- GPU recomendadas: cualquier GPU de consumo con soporte WebGPU en el navegador; el proyecto evalua en Chrome headless sobre WebGPU. No se especifican modelos concretos (RTX 4090, A100, H100) en la informacion disponible.
- Cabe en GPU de consumo: si, por el tamano del artefacto (347 MB en q4f16); no se requieren GPUs de datacenter.
- Opciones de despliegue: transformers.js con ONNX Runtime Web (WebGPU o WASM); tambien es posible servir los ONNX con onnxruntime-genai en servidor, aunque el proyecto esta orientado al cliente.
- Latencia y throughput: no disponibles en la informacion proporcionada; la evaluacion se realizo en Chrome headless con WebGPU pero sin cifras de latencia publicadas.
- Nota: el repo pesa 1.8 GB, lo que incluye safetensors y ambos artefactos ONNX; para despliegue en navegador solo hay que servir el ONNX correspondiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BatLM-v3-qwen05-r2 | 360M | no disponible (base SmolLM2: 8192) | RAG de dominio cerrado, ONNX en navegador | CC BY-SA 4.0 | Hugging Face, ONNX + safetensors |
| SmolLM2-360M-Instruct | 360M | 8192 | Instrucciones generales, multilingue | Apache-2.0 | Hugging Face, safetensors/GGUF |
| Qwen2.5-0.5B-Instruct | 494M | 32768 | Instrucciones generales, multilingue | Apache-2.0 | Hugging Face, safetensors/GGUF |
| TinyLlama-1.1B-Chat | 1.1B | 2048 | Chat general | Apache-2.0 | Hugging Face, safetensors/GGUF |

BatLM sacrifica generalidad y cobertura linguistica (solo ingles) a cambio de una precision alta en su dominio medido (95.7% en 161 preguntas) y de un despliegue en cliente ya empaquetado. Frente a SmolLM2-360M-Instruct, del que deriva, gana en comportamiento de rechazo y adherencia al contexto recuperado, pero pierde en conversacion multi-turno y en cobertura de tareas. Qwen2.5-0.5B-Instruct y TinyLlama-1.1B-Chat ofrecen mas contexto y capacidades generales, pero no incluyen el pipeline RAG ni los artefactos WebGPU.

## Limitaciones y advertencias
- Modelo de 360M: puede seleccionar una frase relacionada pero incorrecta cuando la pregunta tiene una formulacion inusual; el propio autor recomienda verificar los pasajes citados.
- No mantiene conversaciones multi-turno; las preguntas compuestas normalmente reciben respuesta solo a una de las partes.
- Solo ingles; no hay soporte multilingue.
- Depende del recuperador: fuera del pipeline de busqueda previsto (tres pasajes en el formato exacto), el modelo se comporta como SmolLM2 con tendencia a respuestas cortas.
- Riesgo de alucinacion: mitigado por entrenamiento al rechazo, pero no eliminado; las respuestas deben contrastarse con los fragmentos recuperados.
- Licencia CC BY-SA 4.0 en los pesos: impone atribucion y compartir-al-igual; el modelo base es Apache-2.0, pero el derivado queda bajo CC BY-SA 4.0. Revisar compatibilidad antes de uso comercial.
- Restricciones de marca: Batman es marca de DC Comics; el proyecto es no oficial y no afiliado a DC ni Warner Bros. El uso del nombre y tematica en productos comerciales requiere revision legal independiente.
- Repo de 1.8 GB con artefactos redundantes (safetensors y dos ONNX); conviene servir solo el artefacto necesario para reducir transferencia.
- Sin datos publicos de latencia, throughput ni consumo de memoria en WebGPU; la viabilidad en dispositivos de gama baja no esta cuantificada.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/chintanjv/BatLM-v3-qwen05-r2
- Demo: https://batlm.vercel.app
- Codigo fuente: https://github.com/chintanjv/BatLM
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
