# RedHatAI/Qwen3.5-9B-NVFP4

## Resumen

RedHatAI/Qwen3.5-9B-NVFP4 es una version cuantizada a NVFP4 del modelo multimodal Qwen/Qwen3.5-9B, publicada por Red Hat AI (RedHatAI). El modelo conserva la arquitectura original Qwen3_5ForConditionalGeneration, que acepta entrada de texto e imagen y produce salida de texto, y ha sido optimizado para inferencia de alto rendimiento en hardware NVIDIA Blackwell mediante el esquema de cuantizacion NVFP4 (FP4 en pesos y activaciones) aplicado a los operadores lineales del modelo de lenguaje.

La cuantizacion reduce los bits por parametro de 16 a 4 en las capas afectadas, lo que practicamente divide por dos el tamano del checkpoint: 9,4 GB frente a los 19,3 GB del modelo BF16 original. El encoder de vision y la capa MTP (multi-token prediction) se mantienen en BF16, igual que en el checkpoint fuente. El modelo esta pensado para servirse con vLLM y es compatible con decodificacion especulativa MTP.

Con 9.653.104.368 parametros totales, licencia Apache 2.0 y una ventana de contexto de hasta 262.144 tokens segun la receta oficial de despliegue, este modelo resulta relevante para equipos que necesitan desplegar un modelo multimodal de ~9B con requisitos de memoria reducidos y sin renunciar a capacidades de razonamiento, vision y uso de herramientas. La model card reporta una recuperacion de calidad del 93-99 % respecto al BF16 en los benchmarks evaluados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal texto-imagen, con capa MTP) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (segun la receta de despliegue con vLLM) |
| Tipos de cuantizacion | NVFP4 (FP4 en pesos y activaciones); vision encoder y MTP en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato compressed-tensors |
| Tamano del repositorio | 9,4 GB |
| Fecha de publicacion | 06/11/2026 |
| Version | 1.0 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal con entrada de texto e imagen y salida de texto, que incluye una capa MTP (multi-token prediction) utilizada para decodificacion especulativa. RedHatAI no ha reentrenado el modelo: ha aplicado cuantizacion post-entrenamiento sobre los pesos y las activaciones de los operadores lineales del modelo de lenguaje, dejando el encoder de vision y la capa MTP en BF16 tal como estaban en el checkpoint original.

La cuantizacion se realizo con LLM Compressor (vllm-project/llm-compressor) usando el esquema NVFP4 con observador de pesos `imatrix_mse`, tamano de bloque 128, `static actorder` y fraccion de amortiguamiento (`dampening fraction`) de 0,01. La receta exacta esta disponible en el fichero `recipe.yaml` del repositorio. El resultado se exporta en formato compressed-tensors, listo para vLLM. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de pensamiento (`thinking mode`) activable mediante `enable_thinking` en el chat template.
- Comprension de imagenes (image-text-to-text): el pipeline declarado es `image-text-to-text`.
- Razonamiento matematico y resolucion de problemas cuantitativos (evaluado en GSM8K y MathVista).
- Razonamiento cientifico y de conocimiento general (evaluado en GPQA Diamond y MMLU-Pro).
- Soporte de tool calling / function calling: vLLM ofrece `--enable-auto-tool-choice` con `--tool-call-parser qwen3_coder`.
- Soporte de agentes y razonamiento multi-paso mediante el parser de razonamiento `qwen3` y el parser de herramientas `qwen3_coder`.
- Decodificacion especulativa MTP: el checkpoint incluye los pesos MTP, activables con `--speculative-config '{"method": "mtp", "num_speculative_tokens": 1}'`.
- Capacidades multilingues: no disponible (no se especifican idiomas en la informacion proporcionada).

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de hasta 262.144 tokens, manteniendo el hilo de la conversacion y el historial de incidencias sin truncar.
- Asistentes con acceso a herramientas: integrado en vLLM con `--enable-auto-tool-choice` y el parser `qwen3_coder`, permite construir agentes que consulten APIs, bases de datos o sistemas internos y encadenen varias llamadas a herramientas.
- Analisis de documentos con imagenes: al aceptar entrada de imagen y texto, puede extraer y razonar sobre graficos, capturas, diagramas o tablas escaneadas junto con instrucciones textuales.
- Generacion y revision de codigo en pipelines de CI/CD: el soporte de tool calling y el parser de codigo permiten integrarlo en flujos automatizados de revision, generacion de tests o explicacion de diffs.
- Razonamiento matematico asistido: con modo thinking activado, es adecuado para tutoria, resolucion paso a paso de problemas y verificacion de calculos en entornos educativos o financieros.
- Despliegue en infraestructura con memoria limitada: al ocupar 9,4 GB en NVFP4 frente a 19,3 GB en BF16, permite servir un modelo multimodal de ~9B en una sola GPU con menos VRAM, reduciendo coste por instancia.
- Investigacion en cuantizacion: sirve como referencia reproducible (receta `recipe.yaml`, formato compressed-tensors) para estudiar el impacto de NVFP4 en tareas de razonamiento y vision.

## Benchmarks y rendimiento

Resultados reportados en la model card, comparando el modelo BF16 original con la version NVFP4 bajo el mismo harness (Inspect + inspect_evals, vLLM, single B200, thinking mode, temperature 1.0, top_p 0.95, top_k 20, presence_penalty 1.5, pass@1):

| Categoria | Benchmark | Qwen3.5-9B (BF16) | Qwen3.5-9B-NVFP4 | Recuperacion |
|---|---|---|---|---|
| Razonamiento | GSM8K (10-shot CoT, pass@1) | 95,9 % | 94,8 % | 98,8 % |
| Razonamiento | GPQA Diamond (0-shot, pass@1) | 82,3 % | 76,8 % | 93,3 % |
| Razonamiento | MathVista testmini (pass@1) | 85,6 % | 83,8 % | 97,9 % |
| Razonamiento | MMLU-Pro (0-shot, pass@1) | 82,9 % | 81,0 % | 97,7 % |

Errores estandar reportados: GSM8K ±0,6 (BF16) / ±0,6 (NVFP4); GPQA Diamond ±2,7 / ±3,0; MathVista ±1,1 / ±1,2; MMLU-Pro ±0,3 / ±0,4 puntos porcentuales. La model card de Qwen3.5-9B reporta 81,7 (GPQA Diamond), 85,7 (MathVista mini) y 82,5 (MMLU-Pro) bajo su propio protocolo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,4 GB solo para pesos en NVFP4; hay que anadir el coste de cache KV y overhead del runtime, que crece con la longitud de contexto.
- GPU recomendadas: NVIDIA Blackwell (por ejemplo B200, usada en la evaluacion oficial) para aprovechar NVFP4 de forma nativa. En GPUs sin soporte nativo de FP4 el rendimiento puede degradarse o requerir fallback.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada; el esquema NVFP4 esta orientado a hardware Blackwell.
- Opciones de despliegue: vLLM (soporte oficial, con receta incluida), formato compressed-tensors. No se mencionan llama.cpp, Ollama ni TGI.
- Configuracion recomendada en vLLM: `--tensor-parallel-size 1 --max-model-len 262144 --reasoning-parser qwen3`; para tool use, anadir `--enable-auto-tool-choice --tool-call-parser qwen3_coder`; para decodificacion especulativa, `--speculative-config '{"method": "mtp", "num_speculative_tokens": 1}'`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RedHatAI/Qwen3.5-9B-NVFP4 | 9,65 B | 262.144 tokens | NVFP4 (pesos y activaciones) | Apache 2.0 | Hugging Face, vLLM |
| Qwen/Qwen3.5-9B (BF16) | 9,65 B | 262.144 tokens (segun receta) | BF16 | Apache 2.0 | Hugging Face |
| Otras variantes cuantizadas de Qwen3.5-9B | no disponible | no disponible | no disponible | no disponible | no disponible |

El modelo base Qwen/Qwen3.5-9B es la referencia directa. No se dispone de informacion sobre otras alternativas comparables de la misma categoria (mismo tamano o misma tarea) en los datos proporcionados.

## Limitaciones y advertencias

- La cuantizacion NVFP4 implica una perdida de precision: la recuperacion medida cae hasta el 93,3 % en GPQA Diamond, lo que supone unos 5,5 puntos porcentuales menos que el BF16 en esa tarea.
- El esquema NVFP4 esta orientado a hardware NVIDIA Blackwell; en GPUs sin soporte nativo puede no funcionar o hacerlo con rendimiento degradado.
- El encoder de vision y la capa MTP permanecen en BF16, por lo que el ahorro de memoria no es total respecto al checkpoint original.
- No se especifican idiomas soportados en la informacion disponible; el rendimiento multilingue no esta documentado para esta version cuantizada.
- No se han publicado datos sobre sesgos, tasas de alucinacion ni robustez en produccion para esta variante.
- Licencia Apache 2.0, lo que permite uso comercial, pero se recomienda revisar la licencia del modelo base enlazada en la model card.
- El modelo se publico el 06/11/2026 y cuenta con 423 descargas y 0 likes en el momento de la consulta, por lo que su adopcion en produccion es todavia limitada.
- El despliegue oficial documentado es exclusivamente con vLLM; no se mencionan otros runtimes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Qwen3.5-9B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Organizacion RedHatAI en Hugging Face: https://huggingface.co/RedHatAI
- Coleccion NVFP4 Models de RedHatAI: https://huggingface.co/collections/RedHatAI/nvfp4-models
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- Receta oficial de vLLM para Qwen3.5-9B: https://recipes.vllm.ai/Qwen/Qwen3.5-9B
- Inspect (harness de evaluacion): https://github.com/UKGovernmentBEIS/inspect
