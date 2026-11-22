# Rumiii/Qwen3.5-9B-Guard-GGUF

## Resumen

Qwen3.5-9B-Guard-GGUF es la version cuantizada en formato GGUF de Rumiii/Qwen3.5-9B-Guard, un ajuste fino del modelo base Qwen3.5-9B orientado especificamente a la llamada de funciones (tool calling) fiable. Su comportamiento caracteristico es que devuelve la llamada o llamadas correctas en forma de lista JSON cuando alguna de las funciones disponibles puede satisfacer la peticion, y devuelve exactamente `[]` cuando ninguna encaja. Ademas, mantiene la capacidad de gestionar saludos y conversacion general.

El modelo lo publica el usuario Rumiii y esta pensado para integrarse en pipelines de agentes y asistentes que necesitan una capa de decision sobre si invocar una herramienta o abstenerse. Con 8.953.803.264 parametros (aproximadamente 9B) y licencia Apache-2.0, se distribuye en cuantizaciones Q8_0 y Q4_K_M generadas con llama.cpp, lo que permite ejecutarlo en infraestructura local y en GPUs de consumo.

Su relevancia actual radica en el problema de la irrelevance detection: muchos modelos de function calling inventan funciones o argumentos cuando la peticion no encaja con ninguna herramienta disponible. Este ajuste se entrena especificamente para abstenerse de forma limpia, algo critico en produccion para evitar efectos secundarios no deseados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-9B; familia qwen3_5) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de ejecucion usa `-c 8192`) |
| Tipos de cuantizacion | Q8_0, Q4_K_M (menciona variantes IQ y `_L`/`_XL` en el proceso de cuantizacion) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la informacion disponible; el modelo es un ajuste fino de Qwen3.5-9B, por lo que hereda la arquitectura de dicha familia (etiqueta `qwen3_5`). El ajuste esta orientado a function calling y se entreno con el modo "thinking" desactivado, de ahi la recomendacion de fijar `enable_thinking` a `false` en el runtime. Los datos de entrenamiento citados son MadeAgents/xlam-irrelevance-7.5k y Salesforce/xlam-function-calling-60k, lo que sugiere un entrenamiento centrado en la seleccion de funciones y en la deteccion de irrelevancia (abstencion con `[]`).

El proceso de publicacion de esta version GGUF consistio en convertir el modelo bf16 fusionado a GGUF BF16 con llama.cpp (commit `56eea9e`) y despues cuantizar con `llama-quantize`; las variantes `_L`/`_XL` mantienen los tensores de embedding y salida en Q8_0. El tower de vision es identico al del modelo base y se activa anadiendo el fichero `mmproj-Qwen3.5-9B-Guard-F16.gguf`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion general, incluidos saludos.
- Function calling / tool calling: devuelve una lista JSON de llamadas con nombre y argumentos.
- Deteccion de irrelevancia: responde exactamente `[]` cuando ninguna funcion disponible encaja o no se proporcionan funciones.
- Soporte de agentes: pensado como capa de decision en flujos multi-paso con herramientas.
- Capacidad de vision opcional mediante el fichero mmproj (tower de vision sin cambios respecto al base).
- Capacidades multilingues limitadas: el modelo declara unicamente ingles (`en`).
- Modo thinking desactivado por entrenamiento (se recomienda `enable_thinking: false`).

## Casos de uso

- Enrutado de herramientas en agentes: el modelo recibe la lista de funciones disponibles en el system prompt y la peticion del usuario, y decide que llamada ejecutar o abstenerse, lo que permite construir un router fiable antes de invocar APIs con efectos secundarios.
- Atencion al cliente automatizada: gestiona conversaciones multi-turno y decide cuando derivar a una herramienta (consulta de pedido, cambio de direccion) y cuando responder directamente a un saludo o pregunta general.
- Guardrail de invocacion de funciones: al devolver `[]` ante peticiones que no encajan, evita llamadas erroneas a funciones en produccion y reduce el riesgo de acciones no deseadas.
- Asistentes de voz o chat con backend de APIs: integrado via llama.cpp u Ollama, actua como capa de seleccion de endpoints en un backend con varias herramientas expuestas.
- Procesamiento de documentos con vision: con el mmproj activado, puede recibir imagenes junto a la lista de funciones para tareas como extraccion de datos o consulta de informacion visual.
- Despliegue local en entornos con requisitos de privacidad: al ejecutarse en GGUF con llama.cpp u Ollama, permite mantener las peticiones y la logica de herramientas en infraestructura propia.
- Prototipado rapido de agentes: la cuantizacion Q4_K_M (5,68 GB) facilita probar pipelines de tool calling en una sola GPU de consumo antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: Q4_K_M ocupa 5,68 GB en disco y Q8_0 9,53 GB; la VRAM necesaria para inferencia es algo superior al tamano del fichero por el contexto y los buffers de llama.cpp (no se proporcionan cifras exactas).
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, Q4_K_M es apta para GPUs de consumo con 8 GB o mas y Q8_0 requiere aproximadamente 12 GB o mas.
- Cabe en GPU de consumo: si, en el caso de Q4_K_M; Q8_0 depende de la VRAM disponible.
- Opciones de despliegue: llama.cpp (`llama-server -hf ...`) y Ollama (`ollama run hf.co/...`); el modelo esta etiquetado como compatible con endpoints.
- Latencia y throughput: no disponibles.
- Vision: requiere anadir `--mmproj mmproj-Qwen3.5-9B-Guard-F16.gguf` en llama.cpp.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. Como referencia estructural, el modelo base Qwen3.5-9B comparte arquitectura y licencia, y este ajuste anade el comportamiento de abstencion con `[]`.

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Qwen3.5-9B-Guard-GGUF | 8.953.803.264 | no disponible | apache-2.0 | GGUF | Tool calling con abstencion |
| Qwen3.5-9B (base) | no disponible | no disponible | no disponible | safetensors | Modelo general |
| Alternativas de tool calling | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: el modelo puede inventar funciones o argumentos; la model card recomienda validar siempre las llamadas devueltas antes de ejecutar acciones con efectos secundarios.
- Idioma: solo se declara soporte de ingles (`en`), por lo que el rendimiento en castellano no esta garantizado.
- Contexto: la longitud de contexto no se especifica; el ejemplo de ejecucion usa 8192 tokens.
- Licencia: Apache-2.0, pero el dataset Salesforce/xlam-function-calling-60k indica que se publico para fines de investigacion; conviene revisar sus terminos antes de un uso comercial.
- Modo thinking: el modelo se entreno con thinking desactivado, por lo que debe configurarse `enable_thinking: false` cuando el runtime lo permita.
- Formato de salida: el modelo responde con una lista JSON o `[]`; no esta pensado para respuestas de texto libre fuera de ese contrato.
- Vision: requiere el fichero mmproj adicional; sin el, no hay entrada de imagen.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/Rumiii/Qwen3.5-9B-Guard-GGUF
- Modelo base: https://huggingface.co/Rumiii/Qwen3.5-9B-Guard
- Fichero Q8_0: https://huggingface.co/Rumiii/Qwen3.5-9B-Guard-GGUF/blob/main/Qwen3.5-9B-Guard-Q8_0.gguf
- Fichero Q4_K_M: https://huggingface.co/Rumiii/Qwen3.5-9B-Guard-GGUF/blob/main/Qwen3.5-9B-Guard-Q4_K_M.gguf
- Dataset MadeAgents/xlam-irrelevance-7.5k: https://huggingface.co/datasets/MadeAgents/xlam-irrelevance-7.5k
- Dataset Salesforce/xlam-function-calling-60k: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
