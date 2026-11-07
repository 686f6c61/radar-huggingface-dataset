# chris320211/autoround-qwen3-8b-vastrtx3090-vllm

## Resumen

`chris320211/autoround-qwen3-8b-vastrtx3090-vllm` es un checkpoint cuantizado a 4 bits de `Qwen/Qwen3-8B`, empaquetado en formato nativo para vLLM. Lo publica el usuario `chris320211` mediante su herramienta QuantPort y deriva de una cuantización AutoRound previa del mismo autor. El objetivo es claro: servir el modelo Qwen3-8B en GPUs de consumo con menos VRAM y mayor throughput de decodificación, sin introducir código personalizado ni requerir `trust_remote_code`.

La arquitectura subyacente es la del Qwen3-8B original (transformer denso, licencia Apache 2.0), pero los pesos se almacenan en W4A16: pesos de 4 bits con empaquetado GPTQ, group size 128, y activaciones en 16 bits. vLLM detecta la configuración de cuantización desde `config.json` y ejecuta los kernels Marlin en GPUs sm_80 o superiores. El repositorio ocupa 6,1 GB y el total de parámetros reportado en safetensors es de 2.174.235.648, cifra que refleja el empaquetado de 4 bits y no el número de parámetros lógicos del modelo base.

La relevancia de esta ficha es doble. Por un lado, documenta un caso concreto de cuantización AutoRound exportada a vLLM con métricas publicadas de perplejidad y throughput en una RTX 3090. Por otro, el modelo tiene cero descargas y cero likes en el momento de la consulta, lo que conviene tener en cuenta a la hora de evaluar su madurez y soporte comunitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-8B); pesos cuantizados W4A16 con empaquetado GPTQ, group size 128 |
| Parametros totales | 2.174.235.648 segun safetensors del repo cuantizado (el modelo base Qwen3-8B tiene 8B logicos) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base Qwen3-8B) |
| Tipos de cuantizacion | INT4 weight-only (W4A16), group size 128; un modulo mantenido en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3-8B) mas la licencia del repositorio del metodo |
| Formato de pesos | safetensors con `quantization_config` en `config.json`; compatible con vLLM (kernels Marlin, sm_80+) |

## Arquitectura y entrenamiento

El checkpoint no entrena un modelo nuevo: cuantiza `Qwen/Qwen3-8B` con AutoRound y exporta el resultado a un formato que vLLM consume de forma nativa. La cuantizacion es weight-only de 4 bits (W4A16): los pesos se empaquetan con el esquema GPTQ con group size 128 y las activaciones permanecen en 16 bits. Segun la model card, los bytes de los pesos 4-bit son identicos a los del checkpoint `chris320211/autoround-qwen3-8b-vastrtx3090`; lo que cambia es el envoltorio de exportacion (perfil `weight_only_gptq`) para que vLLM lo lea directamente sin `trust_remote_code`.

La innovacion tecnica destacable no esta en el entrenamiento sino en el pipeline de exportacion y validacion. La model card incluye una comprobacion de deriva: la relacion de perplejidad W4A16/fp16 medida en vLLM (1,0417) se compara con la del benchmark de Hugging Face del checkpoint original (1,0417), con una deriva de 1,0000 y un umbral de aceptacion de 1,02. Es decir, el test valida el export, no la cuantizacion en si. Se conserva un modulo en fp16, detalle documentado en `vllm_export.json`. No hay informacion sobre datos de entrenamiento, tokens vistos, RLHF o DPO en la informacion proporcionada; esos datos pertenecen al modelo base Qwen3-8B y no se reproducen aqui.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3-8B (`pipeline_tag: text-generation`, tag `conversational`).
- Razonamiento y matematicas: capacidad del modelo base; no se aportan evaluaciones especificas en este checkpoint.
- Generacion de codigo: capacidad del modelo base; no se aportan evaluaciones especificas.
- Tool calling y function calling: no disponible en la informacion proporcionada para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no lista idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.
- Servicio de alto throughput en vLLM: soportado de forma nativa, con kernels Marlin en GPUs sm_80+.

## Casos de uso

- Servicio de chat en una RTX 3090: el checkpoint esta validado en esa GPU con vLLM 0.30.0 y alcanza 131,1 tok/s de decodificacion con batch 1, frente a 49,7 tok/s en fp16. Es adecuado para prototipos y demos interactivas en hardware de consumo.
- Despliegue con concurrencia moderada: con batch 16 la decodificacion llega a 1453,1 tok/s (frente a 662,4 tok/s en fp16), lo que permite atender varias sesiones simultaneas en una sola GPU de 24 GB.
- Evaluacion de pipelines de cuantizacion: el repo incluye `vllm.json` y `vllm_export.json` con el informe de serve-check y el perfil de conversion, utiles para reproducir o auditar el proceso con QuantPort.
- Sustitucion directa en infraestructura vLLM existente: al no requerir `trust_remote_code` ni codigo personalizado, se puede apuntar un servidor vLLM ya desplegado a este checkpoint cambiando solo el identificador del modelo.
- Generacion de texto por lotes con prefill intensivo: el prefill se mantiene practicamente igual que fp16 (4748,8 frente a 4877,7 tok/s, 0,97x), por lo que tareas con prompts largos y salidas cortas no pierden rendimiento de forma significativa.
- Base para experimentos de cuantizacion comparada: al existir el checkpoint AutoRound original y este export a vLLM, se pueden comparar metricas de perplejidad y velocidad entre el runtime de Hugging Face y vLLM sobre las mismas ventanas de WikiText-2.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos con vLLM 0.30.0 en una NVIDIA GeForce RTX 3090 frente a vLLM fp16 de `Qwen/Qwen3-8B`, sobre WikiText-2 test con ventanas de 2048 tokens (65504 tokens en total):

| Metrica | vLLM W4A16 | vLLM fp16 |
|---|---:|---:|
| Perplejidad | 10,0601 | 9,6573 |
| Prefill tok/s | 4748,8 | 4877,7 |
| Decode tok/s, batch 1 | 131,1 | 49,7 |
| Decode tok/s, batch 16 | 1453,1 | 662,4 |

Relaciones derivadas: PPL ratio W4A16/fp16 de 1,0417; drift frente al ratio del benchmark de Hugging Face de 1,0000 (umbral <= 1,02); speedup de prefill de 0,97x; speedup de decodificacion de 2,64x con batch 1 y 2,19x con batch 16. La propia model card advierte que los numeros de velocidad son de una RTX 3090 y que el benchmark de Hugging Face del checkpoint original uso otra GPU y otro runtime, por lo que las velocidades solo deben compararse dentro de esta tabla. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 6,1 GB en safetensors; con overhead de runtime y cache KV, el checkpoint esta pensado para GPUs de 24 GB como la RTX 3090, la unica validada en la model card.
- GPU recomendadas: NVIDIA RTX 3090 (validada); cualquier GPU con sm_80 o superior puede ejecutar los kernels Marlin de vLLM segun la model card (A100, H100, RTX 4090, entre otras), aunque no se aportan mediciones en ellas.
- Cabe en GPU de consumo: si, al menos en RTX 3090 (24 GB). No hay datos para GPUs de 8, 12 o 16 GB.
- Opciones de despliegue: vLLM es el runtime objetivo y el unico documentado (`vllm serve chris320211/autoround-qwen3-8b-vastrtx3090-vllm`). No se documenta soporte para llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: 131,1 tok/s de decodificacion con batch 1 y 1453,1 tok/s con batch 16 en RTX 3090; prefill de 4748,8 tok/s. No se aportan latencias en milisegundos ni datos de otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (AutoRound Qwen3-8B, vLLM) | 2.174.235.648 segun safetensors (base 8B) | no disponible | W4A16, GPTQ packing, group size 128 | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-8B (fp16) | 8B | no disponible | ninguna (fp16) | Apache 2.0 | Hugging Face, modelo base oficial |
| chris320211/autoround-qwen3-8b-vastrtx3090 | no disponible | no disponible | AutoRound 4-bit (formato auto-round) | Apache 2.0 | Hugging Face, mismo autor |
| chris320211/smoothquant-qwen25-15b-vastrtx3090-vllm | 1,5B (Qwen2.5) | no disponible | W8A8 SmoothQuant | Apache 2.0 | Hugging Face, mismo autor |

La comparativa de rendimiento solo es posible contra el fp16 del modelo base, con los datos de la tabla de benchmarks: el checkpoint cuantizado pierde un 4,17 % de perplejidad relativa y gana 2,64x en decodificacion con batch 1. No se dispone de comparaciones con otros modelos de 8B cuantizados en la informacion proporcionada.

## Limitaciones y advertencias

- Perplejidad superior al fp16: 10,0601 frente a 9,6573 (ratio 1,0417); es una degradacion pequena pero medible que puede notarse en tareas sensibles a la precision.
- Modelo con cero descargas y cero likes en el momento de la consulta, publicado por un autor individual; no hay evidencia de uso en produccion ni de mantenimiento a largo plazo.
- La validacion de rendimiento se limita a una RTX 3090 con vLLM 0.30.0; no hay datos en A100, H100 ni otras GPUs, ni en otros runtimes.
- El checkpoint depende de los kernels Marlin de vLLM en sm_80+; no se documenta compatibilidad con llama.cpp, Ollama, TGI ni GPUs anteriores a sm_80.
- No se listan idiomas soportados ni sesgos conocidos en la informacion proporcionada; las limitaciones del modelo base Qwen3-8B (alucinacion, sesgos de los datos de entrenamiento) aplican igualmente.
- La licencia es Apache 2.0 heredada del modelo base, pero la model card indica que tambien aplica la licencia del repositorio del metodo (QuantPort); conviene revisarla antes de un uso comercial.
- El test de deriva de la model card valida el export, no la calidad de la cuantizacion; no debe interpretarse como una garantia de fidelidad respecto al modelo original.
- El numero de parametros reportado por safetensors (2.174.235.648) no coincide con los 8B logicos del modelo base; es un artefacto del empaquetado de 4 bits y no debe usarse para estimar el tamano real del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chris320211/autoround-qwen3-8b-vastrtx3090-vllm
- Checkpoint AutoRound original: https://huggingface.co/chris320211/autoround-qwen3-8b-vastrtx3090
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-8B/blob/main/LICENSE
- Repositorio de QuantPort: https://github.com/chris320211/QuantPort
- Otro checkpoint del mismo autor (SmoothQuant Qwen2.5-1.5B): https://huggingface.co/chris320211/smoothquant-qwen25-15b-vastrtx3090-vllm
- Proyecto HyperQwen (referencia externa sobre servicio de modelos Qwen en vLLM): https://github.com/syv-ai/HyperQwen
