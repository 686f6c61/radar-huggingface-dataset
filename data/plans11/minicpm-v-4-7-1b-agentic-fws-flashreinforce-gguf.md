# Plans11/MiniCPM-V-4.7-1B-Agentic-FwS-FlashREINFORCE-GGUF

## Resumen

MiniCPM-V-4.7-1B-Agentic-FwS-FlashREINFORCE-GGUF es la distribucion en formato GGUF del modelo afinado ewin-reg/MiniCPM-V-4.7-1B-Agentic-FwS-FlashREINFORCE, un modelo vision-lenguaje de aproximadamente 1.000 millones de parametros publicado por el usuario Plans11. Su proposito concreto es emitir una unica llamada a herramienta exacta (nombre de funcion y argumentos) tras un breve bloque de razonamiento, partiendo de una conversacion y una lista de herramientas disponibles. Esta pensado para ejecutarse en llama.cpp sin necesidad de Python ni PyTorch.

El modelo parte de openbmb/MiniCPM-V-4.7-1B, que combina una torre de vision SigLIP2 con un modelo de lenguaje hibrido Qwen3.5 de 24 capas (18 de atencion lineal y 6 de atencion completa), y ha sido afinado mediante LoRA SFT sobre turnos de tool calling del dataset Nemotron-SFT-Agentic-v4, seguido de 40 actualizaciones de FlashREINFORCE con 64 prompts frescos cada una. El resultado es un especialista en function calling de texto, no un modelo generalista.

Su relevancia actual reside en la combinacion de tamano reducido (apto para CPU y GPUs de consumo), licencia Apache 2.0 y una puntuacion de coincidencia exacta de 0.414 sobre 1000 filas de validacion en el modelo safetensors, frente a 0.334 de Claude Haiku 5.5 ejecutado como subagente en el mismo conjunto. Esa cifra mide acuerdo con respuestas doradas de estilo Nemotron, no una clasificacion general de uso de herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje: torre SigLIP2 + LM hibrido Qwen3.5 de 24 capas (18 linear-attention, 6 full-attention) |
| Parametros totales | 1.006.209.856 (safetensors); el autor indica ~1,55B para el modelo base completo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los ejemplos de uso emplean `-c 4096`) |
| Tipos de cuantizacion | f16 y Q8_0 (texto y mmproj) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura hereda del modelo base openbmb/MiniCPM-V-4.7-1B: una torre de vision SigLIP2 conectada mediante un proyector a un modelo de lenguaje hibrido tipo Qwen3.5 con 24 capas, de las cuales 18 usan atencion lineal y 6 atencion completa. El repositorio GGUF separa el modelo de texto (fichero principal) de la torre de vision y el proyector (ficheros `mmproj`), de modo que el tool calling puramente textual puede ejecutarse sin cargar la parte visual.

El entrenamiento consistio en un LoRA SFT sobre turnos de tool calling de Nemotron-SFT-Agentic-v4 (version v6), seguido de 40 actualizaciones de FlashREINFORCE con 64 prompts nuevos en cada ronda. Los pesos publicados en `main` corresponden a la version v9, que el autor describe como empate estadistico con la v6 (revision `f7c6ea0`), no como una mejora demostrada. El entrenamiento utilizo unicamente turnos de asistente que emiten llamadas a herramientas, sin turnos de respuesta en texto plano. El formato de prompt es el chat de Qwen, con el bloque `<think>` inicial.

## Capacidades

- Generacion de llamadas a herramienta en formato estructurado: emite un bloque `<think>`, lo cierra con `</think>` y a continuacion un `<tool_call>` con `<function=nombre>` y argumentos.
- Razonamiento breve previo a la llamada (bloque de pensamiento interno).
- Function calling y tool calling con listas de herramientas proporcionadas en el prompt.
- Flujo agentico de un solo paso: el modelo selecciona y parametriza una llamada, no ejecuta cadenas largas de forma autonoma.
- Procesamiento de imagen a texto mediante los ficheros `mmproj` (torre SigLIP2 + proyector), aunque la comprension de imagen no fue evaluada en este afinado.
- Capacidad multilingue limitada al ingles (`language: en`).
- No se documentan capacidades de audio, vision avanzada evaluada ni modo de pensamiento extendido mas alla del bloque `<think>`.

## Casos de uso

- Enrutado de llamadas a API en backend: dado un mensaje de usuario y un catalogo de funciones, el modelo emite la funcion y los argumentos en formato parseable, lo que permite sustituir heuristicas por un clasificador generativo de 1B en CPU.
- Agente de consulta de datos financieros: el ejemplo de la model card (`get_special_tickers`) muestra su uso para resolver peticiones de tickers bursatiles contra una herramienta interna, con decodificacion greedy y temperatura 0.
- Automatizacion de soporte con herramientas internas: el modelo recibe el historial de conversacion y las herramientas disponibles (crear ticket, consultar pedido, escalar) y devuelve la llamada concreta, integrable en un orquestador que ejecute la accion.
- Ejecucion local en entornos sin GPU: los ficheros Q8_0 (1031,4 MiB el de texto) caben en RAM de un portatil y se ejecutan con `llama-completion` en CPU, util para prototipos y pruebas offline.
- Despliegue en edge o dispositivos con recursos limitados: al no requerir Python ni PyTorch y ocupar menos de 2 GB en f16, puede embeberse en servicios ligeros o contenedores pequenos.
- Generacion de trazas sinteticas de tool calling: al ser un especialista en el formato Nemotron, sirve para producir ejemplos de llamadas estructuradas para entrenar o evaluar otros agentes.
- Preprocesado multimodal con `llama-mtmd-cli`: carga conjunta de modelo y `mmproj` para tareas de imagen a texto, con la advertencia de que esta capacidad no fue validada en este afinado.

## Benchmarks y rendimiento

Resultados del modelo safetensors (no de los ficheros GGUF) sobre 1000 filas de validacion, decodificacion greedy, primera llamada a herramienta:

| Metrica | v9 (`main`) | v6 (`f7c6ea0`) | Ronda 1 |
|---|---|---|---|
| Exact (coincidencia exacta de la llamada) | 0.414 | 0.409 | 0.314 |
| Args (argumentos correctos) | 0.440 | 0.440 | 0.337 |
| Name (nombre de funcion correcto) | 0.831 | 0.832 | 0.754 |
| Has_call (emite alguna llamada) | 1.000 | 0.999 | 0.997 |

Comparacion citada por el autor en el mismo conjunto de 1000 filas: Claude Haiku 5.5 como subagente obtiene exact 0.334, frente a 0.414 del modelo (diferencia pareada +0.080, error estandar 0.0141).

Comprobacion de sanidad sobre los ficheros GGUF, en CPU con llama.cpp, greedy, primeras 8 filas de validacion:

| Fichero | Exact en las primeras 8 filas |
|---|---|
| f16 | 5 / 8 |
| Q8_0 | 3 / 8 |

El autor advierte que 8 filas son insuficientes para clasificar los ficheros o estimar precision, y que no se midieron perplejidad, velocidad ni benchmarks de imagen sobre los GGUF.

## Requisitos de hardware

- VRAM/RAM para inferencia: el fichero de texto Q8_0 ocupa 1031,4 MiB y el f16 1930,6 MiB; con `mmproj` se anaden 694,2 MiB (Q8_0) o 1057,4 MiB (f16). En total, por debajo de 2 GB en Q8_0 sin vision y en torno a 3 GB en f16 con vision.
- Cabe en GPU de consumo: cualquier GPU con 4 GB o mas de VRAM puede alojar la configuracion completa en f16 con `-ngl 99`; en Q8_0 basta con 2-3 GB.
- Ejecucion en CPU verificada por el autor (la comprobacion de sanidad se hizo en CPU con llama.cpp).
- Despliegue: llama.cpp (compilacion con soporte `MiniCPMV4_7`, commit `2280f0f`), mediante `llama-completion` para texto y `llama-mtmd-cli` para imagen. No se documentan otros runners (vLLM, TGI, Ollama).
- Latencia y throughput: no disponibles; el autor no midio velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-1B-Agentic-FwS-FlashREINFORCE (este) | ~1,0B (1,55B base) | no disponible | Tool calling especializado, multimodal | Apache 2.0 | GGUF, safetensors |
| openbmb/MiniCPM-V-4.7-1B (base) | ~1,55B | no disponible | Vision-lenguaje generalista | Apache 2.0 (segun base) | safetensors |
| Claude Haiku 5.5 (referencia del autor, como subagente) | no disponible | no disponible | Agente general | propietaria | API |

El autor solo aporta comparacion cuantitativa frente a Claude Haiku 5.5 (exact 0.334 frente a 0.414). No se dispone de datos de benchmarks frente a otros modelos abiertos de tool calling de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- La metrica exact exige coincidencia completa del texto de la llamada con la dorada; cerca del 60% de las llamadas doradas con valores verificables contienen valores que no aparecen en el prompt (por ejemplo claves de API), por lo que ningun modelo puede alcanzar 1.0 en esta metrica.
- El entrenamiento solo uso turnos de asistente que emiten llamadas a herramientas; el modelo no fue entrenado para responder en texto plano, lo que puede degradar su comportamiento en conversaciones que no requieran herramienta.
- La comprension de imagen no fue evaluada en este afinado; los ficheros `mmproj` existen pero su calidad no esta validada.
- Los efectos de la cuantizacion no se midieron mas alla de la comprobacion de 8 filas; la diferencia entre 5/8 (f16) y 3/8 (Q8_0) podria ser ruido o una perdida real de Q8_0, sin investigar.
- La version v9 (`main`) es un empate estadistico con la v6, no una mejora demostrada.
- Idioma limitado al ingles; no se documenta soporte multilingue.
- Riesgo de alucinacion en nombres de funcion o argumentos no presentes en el prompt, dado el caracter generativo de la salida; conviene validar la llamada contra un esquema antes de ejecutarla.
- En llama.cpp la salida incluye el token `[end of text]`, que debe eliminarse antes de parsear la llamada.
- Requiere una compilacion de llama.cpp con soporte para `MiniCPMV4_7`; versiones anteriores no cargaran los ficheros.
- Licencia Apache 2.0, sin restricciones adicionales conocidas para uso comercial, aunque se recomienda verificar la licencia del modelo base y del dataset de entrenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Plans11/MiniCPM-V-4.7-1B-Agentic-FwS-FlashREINFORCE-GGUF
- Modelo base del afinado (safetensors): https://huggingface.co/ewin-reg/MiniCPM-V-4.7-1B-Agentic-FwS-FlashREINFORCE
- Modelo principal (v9): https://huggingface.co/ewin-reg/MiniCPM-V-4.7-1B-Agentic-FwS
- Modelo original openbmb: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Dataset de evaluacion: https://huggingface.co/datasets/ewin-reg/nemotron-sft-agentic-v4-fws-minicpmv47
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v4
- llama.cpp: https://github.com/ggml-org/llama.cpp
