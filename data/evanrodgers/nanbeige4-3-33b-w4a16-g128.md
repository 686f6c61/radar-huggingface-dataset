# evanrodgers/Nanbeige4.3-33B-W4A16-G128

## Resumen

Nanbeige4.3-33B-W4A16-G128 es una cuantizacion de 4 bits (INT4, solo pesos) del modelo instructivo Nanbeige/Nanbeige4.3-33B, publicado por el usuario evanrodgers. No se trata de un modelo nuevo, sino de un derivado cuantizado del checkpoint instruido (chat, razonamiento y uso de herramientas) de Nanbeige, empaquetado en formato compressed-tensors para su despliegue con vLLM. La cuantizacion reduce el peso de 66,24 GB en BF16 a 20,63 GB, un factor de compresion de aproximadamente 3,2x, manteniendo intactos el tokenizador, la plantilla de chat, el modo de razonamiento y el formato de llamadas a herramientas del modelo original.

El modelo base emplea una arquitectura LlamaForCausalLM con 52 capas, dimension oculta de 7168, 56 cabezas de atencion y 8 cabezas KV, FFN de 22016 y un vocabulario de 166.912 tokens. Soporta una longitud de contexto maxima de 524.288 posiciones con RoPE theta de 1,2e8, aunque en la practica el KV cache limita el contexto util segun el hardware disponible.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 33B parametros en GPUs de 40 GB (e incluso configuraciones de 262K de contexto en 2x64 GB) con vLLM, sin necesidad de infraestructura de gran escala. Esta pensado para desarrolladores que quieran evaluar el modelo Nanbeige 4.3 en tareas de codigo, tool calling y conversacion bilingue ingles-chino con un coste de VRAM reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer denso), 52 capas, hidden 7168, 56 cabezas de atencion / 8 KV heads, head_dim 128, FFN 22016, vocab 166.912, RoPE theta 1,2e8 |
| Parametros totales | 33,12B (el repo safetensors reporta 6.474.317.528 tensores de parametros cuantizados; el recuento logico del modelo base es 33,12B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 524.288 posiciones maximas; validado 32.768 en una GPU de 40 GB y 262.144 en 2x64 GB (PP=2) |
| Tipos de cuantizacion | GPTQ W4A16, INT4 simetrico, group size 128, activaciones en BF16, lm_head en BF16 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en compressed-tensors `pack-quantized` (2 shards, 20,63 GB); compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de tipo Llama con 52 capas y 33,12B parametros, sin mezcla de expertos. La cuantizacion se realizo con llmcompressor 0.14.0.1 y GPTQModifier, aplicando W4A16 con block_size 128, dampening_frac 0,01 y actorder estatico sobre todas las capas Linear excepto lm_head. El proceso de calibracion uso 512 ventanas de 2048 tokens (1,05M tokens en total), renderizadas con la propia plantilla de chat del modelo y con una composicion deliberadamente orientada al despliegue: 40% codigo (Magicoder-OSS-Instruct-75K), 20% tool calling (glaive-function-calling-v2), 20% chat general (ultrachat_200k) y 20% instrucciones en chino (evol-instruct-chinese), todo mezclado aleatoriamente. La calibracion se ejecuto capa a capa con offload a CPU, tardando 2,94 horas en una unica GPU CMP 170HX de 64 GB.

La innovacion tecnica principal de esta publicacion no esta en la arquitectura, sino en el pipeline de cuantizacion: el uso de compressed-tensors `pack-quantized` permite que vLLM detecte automaticamente la configuracion de cuantizacion sin necesidad de pasar el flag `--quantization`. Ademas, el calibrado con la plantilla de chat real (en lugar de texto plano) preserva mejor el comportamiento conversacional y de tool calling. El modelo conserva el modo thinking del original, con trazas `<think>...</think>` que el parser `qwen3` de vLLM separa en `reasoning_content`.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento explicito con modo thinking activable mediante `chat_template_kwargs.enable_thinking`, con traza separada del contenido final.
- Generacion de codigo, con calibracion especifica sobre 40% de datos de codigo (Magicoder-OSS-Instruct-75K).
- Tool calling / function calling con formato XML por defecto (`tool_call_format="xml"`) y compatibilidad con JSON; parser `qwen3_coder` en vLLM.
- Flujos de agente multi-paso, con soporte de `preserve_thinking=True` para mantener la traza de razonamiento entre turnos.
- Capacidades matematicas y de razonamiento general heredadas del modelo base (sin benchmarks publicados en esta ficha).
- Soporte de contexto largo (hasta 524.288 posiciones teoricas), condicionado al KV cache disponible.
- No incluye vision, audio ni otras modalidades segun la informacion disponible.

## Casos de uso

- **Atencion al cliente automatizada bilingue**: el modelo gestiona conversaciones multi-turno en ingles y chino con contexto de hasta 32K tokens en una sola GPU de 40 GB, suficiente para historiales largos de soporte sin perder el hilo.
- **Generacion de codigo en produccion**: con tool calling XML y calibracion orientada a codigo, puede integrarse en pipelines de CI/CD como generador de parches o revisor de PRs, invocando herramientas externas (linters, tests) mediante function calling.
- **Agentes autonomos con razonamiento multi-paso**: el modo thinking y `preserve_thinking=True` permiten mantener trazas de razonamiento entre turnos, adecuado para agentes que planifican y ejecutan subtareas con herramientas.
- **Asistente de documentacion tecnica en chino e ingles**: la ventana de contexto larga y el soporte nativo de ambos idiomas permiten resumir y consultar repositorios de documentacion extensos en una sola peticion.
- **Evaluacion de modelos Nanbeige en hardware consumer/prosumer**: al caber en una GPU de 40 GB con vLLM, sirve para prototipar y comparar el modelo 4.3-33B frente a alternativas sin adquirir infraestructura de 80 GB.
- **Despliegue con tensor parallelism en 2x64 GB**: la configuracion validada de 262K de contexto en dos GPUs permite casos de analisis de documentos muy largos o conversaciones con memoria extendida.
- **Backend de API compatible con OpenAI**: al exponerse via vLLM con endpoint `/v1`, puede sustituir a APIs propietarias en prototipos internos manteniendo el mismo esquema de peticiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la tabla de benchmarks del modelo base (Nanbeige/Nanbeige4.3-33B) y no incluye mediciones propias de calidad tras la cuantizacion; tampoco se reportan evaluaciones de calidad a contexto completo.

## Requisitos de hardware

- **VRAM estimada para inferencia**: 20,63 GB de pesos en INT4; con KV cache en BF16 (~208 KiB por token), se necesita margen adicional. Validado con `--max-model-len 32768` en una GPU de 40 GB con `--gpu-memory-utilization 0.90`.
- **GPU recomendadas**: NVIDIA CMP 170HX (Ampere, 64 GB) fue la GPU de validacion; cualquier GPU Ampere o superior con VRAM suficiente deberia funcionar. Para contexto completo (512K) se requiere multiples GPUs grandes (el KV cache BF16 completo son ~104 GiB).
- **Cabe en consumer GPU**: si, en GPUs de 40 GB (p. ej. A100 40GB, L40S 48GB, RTX 6000 Ada 48GB). En GPUs de 24 GB no cabe con contexto util; en RTX 4090 (24 GB) no es viable sin cuantizacion adicional del KV cache, y FP8 KV cache no funciono en la validacion del autor.
- **Opciones de despliegue**: vLLM 0.31.0 (validado, con auto-deteccion de compressed-tensors); transformers 5.17.0 como libreria base. No se menciona soporte validado de llama.cpp, Ollama ni TGI en la informacion disponible.
- **Tensor parallelism**: con 8 KV heads, valores de `--tensor-parallel-size` hasta 8 dividen limpiamente.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-W4A16-G128 (esta ficha) | 33,12B | 524.288 (validado 32K/262K) | GPTQ W4A16 INT4, 20,63 GB | Apache 2.0 | Hugging Face, vLLM |
| Nanbeige/Nanbeige4.3-33B (base BF16) | 33,12B | 524.288 | BF16, 66,24 GB | Apache 2.0 | Hugging Face |
| Nanbeige/Nanbeige4.3-33B-Base (pretrained) | 33,12B | 524.288 | BF16 | Apache 2.0 | Hugging Face |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos de otros fabricantes para una comparativa cruzada fiable; se indica "no disponible" para esos campos.

## Limitaciones y advertencias

- **Sesgos heredados**: al ser una cuantizacion, conserva los sesgos del modelo base Nanbeige4.3-33B; no se han realizado evaluaciones de sesgo especificas tras la cuantizacion.
- **Riesgo de alucinacion**: no se han publicado evaluaciones de fidelidad factual del checkpoint cuantizado; el autor no realizo evaluaciones de calidad a longitud completa de contexto.
- **Limitaciones de contexto**: aunque el modelo soporta 524.288 posiciones, el KV cache BF16 (~208 KiB/token) hace inviable el contexto completo en una sola GPU; el autor solo valido 32K en 40 GB y 262K en 2x64 GB.
- **FP8 KV cache no fiable**: `--kv-cache-dtype fp8` no funciono en la validacion; debe mantenerse el KV cache en BF16.
- **Idiomas**: solo ingles y chino; no hay soporte declarado de castellano ni de otros idiomas.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo cuantizado en produccion.
- **Formato de despliegue**: la validacion se limita a vLLM 0.31.0; otros runners (llama.cpp, Ollama, TGI) no estan validados y el formato compressed-tensors puede no ser compatible con ellos.
- **Herramientas**: el formato de tool calling recomendado es XML; el formato JSON se soporta por compatibilidad pero con peor rendimiento segun el autor.
- **Cuantizacion**: la perdida de precision frente al BF16 no ha sido cuantificada con benchmarks; se desconoce la degradacion real en tareas de razonamiento y codigo.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/evanrodgers/Nanbeige4.3-33B-W4A16-G128
- Modelo base instruido: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Modelo base pretrained: https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base
- Paper de referencia GPTQ (arxiv:2210.17323): https://arxiv.org/abs/2210.17323
- Repositorio llmcompressor: no disponible en la informacion proporcionada
- Repositorio compressed-tensors: no disponible en la informacion proporcionada
- Documentacion de vLLM: no disponible en la informacion proporcionada
