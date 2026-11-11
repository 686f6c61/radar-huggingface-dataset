# nebulitgmbh/event-modeling-gemma-4-e2b-q4f16_1-MLC

## Resumen

El modelo `nebulitgmbh/event-modeling-gemma-4-e2b-q4f16_1-MLC` es una distribucion de pesos cuantizados en formato MLC (Machine Learning Compilation) del modelo `nebulitgmbh/event-modeling-gemma-4-e2b`, un ajuste fino de Gemma 4 E2B orientado a la generacion y asistencia en Event Modeling. Lo publica nebulitgmbh y esta empaquetado especificamente para su ejecucion en el navegador mediante WebLLM, la libreria de inferencia WebGPU del ecosistema MLC-LLM. El repositorio contiene unicamente pesos y configuracion; la libreria compilada se sirve desde los binarios oficiales de MLC.

La relevancia de esta publicacion es doble: por un lado, demuestra el flujo de despliegue de un modelo ajustado a una tarea de nicho (Event Modeling, una metodologia de diseno de software basada en eventos) directamente en el cliente, sin backend; por otro, fija un caso concreto de cuantizacion `q4f16_1` (pesos de 4 bits con activaciones en float16) con un requisito de VRAM declarado de 3400 MB y una ventana de contexto de 4096 tokens. El modelo se marca explicitamente como experimental y solo se ha probado en WebLLM 0.2.87 sobre Chrome en macOS con Metal.

Al tratarse de un artefacto derivado y cuantizado, su interes no esta en el rendimiento bruto sino en la viabilidad de ejecutar un asistente especializado en el navegador con un consumo de memoria contenido. La model card advierte de limitaciones conocidas (debilidad en preguntas de conocimiento general y repeticion con decodificacion greedy) que condicionan su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B), pesos compilados para MLC-LLM / WebLLM |
| Parametros totales | no disponible (modelo base Gemma 4 E2B; el repositorio no declara el conteo) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (override declarado en la configuracion de WebLLM) |
| Tipos de cuantizacion | q4f16_1 (pesos de 4 bits, activaciones float16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC (artefacto compilado para WebLLM, con `mlc-model-manifest.json`); repositorio de 2.8 GB |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E2B, un transformer de la familia Gemma 4, ajustado por nebulitgmbh sobre datos de Event Modeling. Sobre ese ajuste fino se ha aplicado una cuantizacion `q4f16_1` y una compilacion con MLC-LLM para generar artefactos ejecutables en WebGPU a traves de WebLLM. El repositorio no documenta el numero de tokens de entrenamiento, la composicion del dataset de ajuste ni si se emplearon tecnicas de RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada.

La innovacion tecnica destacable no esta en el modelo sino en el pipeline de despliegue: los pesos se distribuyen como libreria compilada que WebLLM carga en el navegador, con un manifiesto (`mlc-model-manifest.json`) obligatorio para evitar el error "Invalid kv_cache ABI". La configuracion fija `buffer_size_required_bytes` en 201326592 bytes (192 MiB), `vram_required_MB` en 3400 y exige la feature `shader-f16` del dispositivo WebGPU. El contexto se sobrescribe explicitamente a 4096 tokens mediante `overrides`.

## Capacidades

- Generacion de texto orientada a Event Modeling: asistencia en la construccion de modelos de eventos, storyboards y especificaciones de flujo.
- Salida estructurada en JSON mediante `response_format` con JSON Schema, segun indica la model card.
- Ejecucion integra en el navegador a traves de WebLLM y WebGPU, sin backend ni servidor de inferencia.
- Conversacion de un solo turno verificada: la model card solo reporta una prueba con un unico prompt de chat.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Asistente de Event Modeling en el navegador: el modelo puede generar y completar especificaciones de eventos, comandos y vistas en una aplicacion web de diseno, ejecutandose en el cliente con 3400 MB de VRAM y sin enviar datos a un servidor.
- Generacion de JSON estructurado para herramientas de modelado: usando `response_format` con JSON Schema, se puede integrar en un editor que valide y consuma directamente las estructuras de eventos generadas.
- Prototipado de funcionalidades de IA en aplicaciones web sin backend: el despliegue via WebLLM permite incorporar un asistente especializado en una SPA con un unico `CreateMLCEngine` y la configuracion de `model_list`.
- Demos y formacion sobre Event Modeling: al ejecutarse localmente en Chrome sobre macOS con Metal, sirve para sesiones interactivas donde la privacidad del contenido es relevante.
- Evaluacion de pipelines de cuantizacion MLC: el repositorio documenta el manifiesto, el tamano de buffer y la libreria compilada, lo que lo convierte en una referencia practica para replicar el flujo con otros ajustes finos.
- Filtrado y clasificacion de texto de dominio especifico: para tareas acotadas de extraccion o etiquetado en el contexto de modelado de eventos, con la cautela de sus limitaciones en conocimiento general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta una prueba funcional: WebLLM 0.2.87, Chrome en macOS con Metal, un unico prompt de chat. No se aportan metricas de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada: 3400 MB segun la configuracion declarada (`vram_required_MB`), con un buffer adicional de 192 MiB (`buffer_size_required_bytes`).
- GPU recomendadas: no disponibles; el autor solo ha probado Chrome en macOS con Metal. No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: por el perfil de memoria (3,4 GB), el modelo es compatible en teoria con GPUs de consumo con WebGPU y soporte de `shader-f16`; no se especifican modelos concretos probados.
- Opciones de despliegue: WebLLM 0.2.87 (unica ruta documentada), con la libreria compilada `gemma-4-E2B-it-q4f16_1_cs512-webgpu.wasm` servida desde `mlc-ai/binary-mlc-llm-libs`. No se documenta vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan una comparacion fundamentada.

## Limitaciones y advertencias

- Modelo marcado como experimental por el autor; no hay evidencia de validacion mas alla de una prueba de un solo prompt.
- Debilidad conocida en preguntas de conocimiento general, segun la model card del modelo base.
- Repeticion con decodificacion greedy, documentada como limitacion del modelo base.
- Idiomas soportados no declarados; no se puede garantizar un comportamiento correcto en castellano ni en otros idiomas.
- Solo probado en WebLLM 0.2.87, Chrome en macOS con Metal; otros navegadores y GPUs no estan testeados.
- Requiere el `model_manifest` (`mlc-model-manifest.json`); sin el, WebLLM falla con "Invalid kv_cache ABI".
- Contexto limitado a 4096 tokens, adecuado para tareas acotadas pero no para documentos largos.
- Licencia Apache 2.0 sobre un derivado de Gemma 4: conviene revisar los terminos de la licencia de Gemma 4 enlazada por el autor antes de un uso comercial.
- Riesgo de alucinacion no cuantificado; no hay evaluaciones publicadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nebulitgmbh/event-modeling-gemma-4-e2b-q4f16_1-MLC
- Modelo base: https://huggingface.co/nebulitgmbh/event-modeling-gemma-4-e2b
- Libreria compilada WebLLM: https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_87/base/gemma-4-E2B-it-q4f16_1_cs512-webgpu.wasm
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Repositorio de binarios MLC-LLM: https://github.com/mlc-ai/binary-mlc-llm-libs
