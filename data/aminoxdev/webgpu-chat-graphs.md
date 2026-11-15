# AMINOXDEV/webgpu-chat-graphs

## Resumen

`AMINOXDEV/webgpu-chat-graphs` no es un modelo de lenguaje en sentido estricto, sino un repositorio de grafos ONNX modificados que se utilizan como artefactos auxiliares de la aplicacion WebGPU Chat (llm.aminox.dev). Cada fichero contiene el grafo original de un modelo (sin pesos) con una unica alteracion: todos los nodos `com.microsoft.MatMulNBits` llevan fijado `accuracy_level = 4`, lo que permite a ONNX Runtime emplear su ruta de matmul int8 DP4A en el backend WebGPU durante el procesamiento de prompts.

El repositorio cubre tres grafos concretos: `qwen3.5-4b-opt`, `gemma-4-12b-qat` y `gemma-4-12b`, todos en formato `decoder_model_merged_q4f16.onnx`. Los pesos no se alojan aqui: se cargan desde los repositorios de origen en revisiones fijas (Qwen3.5-4B-ONNX-OPT, gemma-4-12B-it-qat-ONNX y gemma-4-12B-it-ONNX respectivamente).

Su relevancia es acotada pero tecnica: sirve como ejemplo de optimizacion de inferencia en navegador sobre WebGPU, mostrando como un cambio de atributo en el grafo puede desbloquear rutas de computo int8 sin alterar la generacion token a token. No aporta pesos, tokenizadores ni configuracion de generacion; es un complemento para el proyecto WebGPU Chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafos ONNX de decodificadores transformer (Qwen3.5-4B, Gemma 4 12B); el repo no define arquitectura propia |
| Parametros totales | No disponible en este repo (dependen de los modelos de origen: ~4B y ~12B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q4f16 (nodos MatMulNBits con `accuracy_level = 4`); los pesos QAT Q4_0 en el caso de gemma-4-12b-qat |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos `decoder_model_merged_q4f16.onnx`); los pesos se cargan externamente desde los repos de origen |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: distribuye grafos ONNX derivados de tres modelos existentes. La unica modificacion aplicada es el atributo `accuracy_level = 4` en cada nodo `com.microsoft.MatMulNBits`, manteniendo intactos nodos, entradas, salidas y referencias a datos externos. Con ese ajuste, el backend WebGPU de ONNX Runtime puede seleccionar su ruta de matmul int8 DP4A cuando procesa prompts de cuatro o mas tokens simultaneamente en GPUs que exponen `subgroups`; la generacion token a token no cambia.

Los grafos de origen incluyen `onnx-community/Qwen3.5-4B-ONNX-OPT` (revision `bb07226`), `james58899/gemma-4-12B-it-qat-ONNX` (revision `60555e6`, con pesos QAT Q4_0 y GroupQueryAttention fusionada) y `AMINOXDEV/gemma-4-12B-it-ONNX` (revision `90e0a27`). No se detalla en la informacion disponible el proceso de entrenamiento, el volumen de tokens ni si hubo RLHF o DPO en los modelos de origen.

## Capacidades

- Inferencia en navegador sobre WebGPU mediante ONNX Runtime y transformers.js.
- Procesamiento de prompts por lotes (4 o mas tokens) con ruta int8 DP4A en GPUs compatibles con `subgroups`.
- Generacion autoregresiva token a token sin cambios respecto al grafo original.
- Compatibilidad con los modelos subyacentes Qwen3.5-4B y Gemma 4 12B (capacidades de texto, razonamiento y codigo heredadas de estos, no documentadas en este repo).
- Carga de pesos desde repositorios externos en revisiones fijas, lo que facilita reproducibilidad.
- No se documentan tool calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Despliegue de chat LLM en navegador sin backend: el grafo modificado permite ejecutar Qwen3.5-4B o Gemma 4 12B en el cliente via WebGPU, reduciendo costes de servidor y latencia de red.
- Aceleracion de la fase de prefill: en aplicaciones con prompts largos (RAG, resumen de documentos), la ruta DP4A int8 acelera el procesamiento del prompt en GPUs con soporte de `subgroups`.
- Prototipado de asistentes on-device para demos tecnicas: util para mostrar inferencia local en portatiles con GPU integrada o discreta compatible con WebGPU.
- Evaluacion comparativa de backends: sirve para medir la diferencia entre el grafo original y el modificado en throughput de prefill, aislando el efecto de `accuracy_level = 4`.
- Integracion en aplicaciones web educativas o de investigacion que necesiten ejecutar modelos abiertos sin instalacion de dependencias nativas.
- Base para experimentos de cuantizacion int8 en WebGPU: el patron de modificacion del grafo es replicable a otros modelos ONNX con nodos MatMulNBits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Requiere un navegador con soporte de WebGPU y una GPU que exponga `subgroups` para aprovechar la ruta DP4A int8; sin ese soporte, el grafo funciona igual que el original.
- VRAM estimada: no disponible en la informacion proporcionada (depende de los pesos q4f16 de Qwen3.5-4B y Gemma 4 12B; el segundo requiere bastante mas memoria que el primero).
- GPU recomendadas: no disponible; el repo no lista hardware validado.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: ONNX Runtime con backend WebGPU a traves de transformers.js; no se documentan vLLM, llama.cpp, Ollama ni TGI para estos artefactos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Aspecto | webgpu-chat-graphs | onnx-community/Qwen3.5-4B-ONNX-OPT | james58899/gemma-4-12B-it-qat-ONNX |
|---|---|---|---|
| Tipo de artefacto | Grafos ONNX modificados (sin pesos) | Modelo ONNX completo con pesos | Modelo ONNX QAT con pesos |
| Parametros | No aplica (grafos) | ~4B | ~12B |
| Contexto | No disponible | No disponible | No disponible |
| Cuantizacion | q4f16 con `accuracy_level = 4` | q4f16 | QAT Q4_0 |
| Licencia | Apache 2.0 | Apache 2.0 | Apache 2.0 |
| Uso previsto | Acelerar prefill en WebGPU Chat | Inferencia ONNX general | Inferencia ONNX QAT |

## Limitaciones y advertencias

- No contiene pesos ni tokenizador: sin los repositorios de origen y sus revisiones fijas, los grafos no son utilizables.
- La aceleracion DP4A solo aplica a GPUs que exponen `subgroups` y al procesamiento de prompts de 4 o mas tokens; la generacion token a token no se beneficia.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en un intervalo de 20 minutos, lo que sugiere un estado muy incipiente y sin validacion externa.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de calidad; cualquier caveat de los modelos de origen (Qwen3.5-4B, Gemma 4 12B) aplica igualmente.
- Idiomas soportados no especificados en este repo; dependen de los modelos de origen.
- Licencia Apache 2.0 declarada, pero conviene verificar las condiciones de los repositorios de pesos enlazados antes de uso comercial.
- El tamano del repo es 0.0 GB, coherente con grafos sin pesos, pero no se detalla el tamano real de cada fichero ONNX.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AMINOXDEV/webgpu-chat-graphs
- Aplicacion WebGPU Chat: https://llm.aminox.dev
- Codigo fuente: https://github.com/amintikk/webgpu-chat
- Grafo Qwen3.5-4B-ONNX-OPT: https://huggingface.co/onnx-community/Qwen3.5-4B-ONNX-OPT/tree/bb072268d0912bdc5cf4f41c8c6f53a03fd68624
- Grafo Gemma 4 12B QAT: https://huggingface.co/james58899/gemma-4-12B-it-qat-ONNX/tree/60555e645e7c456b4a013cc2e93e9bd6379e3006
- Grafo Gemma 4 12B: https://huggingface.co/AMINOXDEV/gemma-4-12B-it-ONNX/tree/90e0a27bf539717b6055d7e434b9faa1f0dbd9ff
