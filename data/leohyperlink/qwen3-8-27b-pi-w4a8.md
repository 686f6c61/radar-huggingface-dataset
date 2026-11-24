# LeoHyperlink/Qwen3.8-27B-Pi-W4A8

## Resumen

Qwen3.8-27B-Pi-W4A8 es una cuantización W4A8 del modelo bytkim/Qwen3.8-27B-pi, publicada por el usuario LeoHyperlink. Se trata de un checkpoint comprimido con Intel auto-round (formato compressed-tensors) que mantiene los pesos en int4 simétrico con grupo de 128 y las activaciones en int8 dinámico por token, pensado para servir el modelo con vLLM sobre GPUs Intel Arc. La relación con el modelo base es de cuantización, no de destilación ni de fine-tuning: el objetivo declarado es acelerar el serving de texto manteniendo la coherencia de salida.

El modelo base pertenece a la familia Qwen3.8 (tag `qwen3_5`), con arquitectura híbrida que combina atención con capas Mamba y mezcla de expertos (MoE), y capacidades multimodales de imagen-texto a texto. El repositorio declara 6.240.231.632 parámetros reales en safetensors (unos 6,24 mil millones), lo que contrasta con el "27B" del nombre: ese número parece referirse al identificador comercial del modelo base y no al recuento efectivo de parámetros del checkpoint cuantizado. El tamaño del repositorio es de 19,5 GB.

La relevancia de esta ficha es doble: por un lado, documenta una receta de cuantización reproducible con mediciones reales de velocidad en hardware Intel Arc; por otro, advierte de que las cifras de benchmarks publicadas (HLE 12,14%, SciCode 4,6%) corresponden a una evaluación auto-puntuada y sin herramientas, por lo que no son comparables con las cifras del modelo base. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida con atención y capas Mamba, mezcla de expertos (MoE); multimodal imagen-texto a texto (torre visual conservada en BF16) |
| Parametros totales | 6.240.231.632 (según safetensors del checkpoint cuantizado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (en el serving de prueba se limitó a 1024 tokens por restricciones de VRAM, no por límite del modelo) |
| Tipos de cuantizacion | W4A8: pesos int4 simétrico con grupo de 128, activaciones int8 dinámicas por token; `lm_head` y torre visual en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (pack-quantized), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El checkpoint es una compresión del modelo base bytkim/Qwen3.8-27B-pi, que según las etiquetas emplea una arquitectura híbrida de atención y capas Mamba con mezcla de expertos, además de una torre visual para entrada de imagen. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base; la model card de esta cuantización no los detalla.

La innovación técnica de este repositorio está en la receta de cuantización, no en el entrenamiento. Se usó Intel auto-round 0.15.1 con el exportador `auto_round:llm_compressor` en formato CT pack-quantized, calibrando con 128 muestras de 2048 tokens de nvidia/OpenCodeInstruct. `torch.compile` se desactivó explícitamente por un fallo del inductor de Triton en XPU. La torre visual (`model.visual.*`) y `lm_head` se mantuvieron en BF16. El tiempo de cuantización fue de aproximadamente 6,5 horas en una Intel Arc Pro B70. El autor documenta además decodificación especulativa con un drafter DFlash de 1,9B (bloque 8), con una tasa de aceptación media de 2,71 tokens por bloque de 8 y un 21,4% de tokens aceptados.

## Capacidades

- Generación de texto conversacional y razonamiento con modo "thinking" (la evaluación HLE se ejecutó con thinking en nivel xhigh).
- Entrada multimodal imagen-texto a texto: la torre visual se conserva en BF16, aunque no se documenta su evaluación tras la cuantización.
- Generación de código y resolución de problemas científicos, evaluados en SciCode.
- Capacidades de agente y razonamiento multi-paso implícitas en el modo thinking, con hasta 32.768 tokens de salida en las pruebas.
- Serving compatible con la API OpenAI (`/v1/chat/completions`) a través de vLLM.
- Decodificación especulativa soportada mediante un drafter externo (DFlash).
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Serving de texto en GPUs Intel Arc: la receta está específicamente optimizada para el stack XPU con vLLM; se medieron 33,0 t/s en decodificación monoflujo y 0,08 s de TTFT, lo que lo hace adecuado para despliegues en hardware Intel Pro B70.
- Despliegue con decodificación especulativa: emparejado con el drafter DFlash de 1,9B se alcanzan unos 55 t/s (mejora de 1,7x) con salida byte-idéntica a temperatura 0, útil cuando se necesita más throughput sin cambiar de hardware.
- Evaluación de razonamiento científico y matemático: el modelo se ha probado en HLE y SciCode con modo thinking, por lo que sirve para experimentos de razonamiento de largo alcance (unas 25.000 tokens de razonamiento por muestra en HLE).
- Asistente conversacional multi-turno: el pipeline declarado es text-generation con formato conversacional, adecuado para prototipos de chat siempre que se ajuste la longitud de contexto a la VRAM disponible.
- Prototipado multimodal: al conservar la torre visual en BF16, permite experimentar con entradas de imagen y texto, aunque sin métricas publicadas de calidad tras la cuantización.
- Investigación en cuantización: sirve como referencia reproducible de una receta W4A8 con auto-round y compressed-tensors, con logs de benchmark y comparación frente a una variante W4A16 en el mismo equipo.
- Integración en pipelines con API compatible con OpenAI: al exponerse vía vLLM con `/v1/chat/completions`, puede conectarse a herramientas que ya consumen la API de OpenAI sin cambios de cliente.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Metrica | Valor | Notas |
|---|---|---|---|
| Humanity's Last Exam (HLE) | Original accuracy | 12,14% (262/2158) | Auto-puntuado por el propio modelo; solo texto, sin herramientas; stderr 0,70% |
| SciCode (test) | Main-problem solve rate | 4,6% (3/65) | Sin contexto de fondo, temperatura 0 |
| SciCode (test) | Substep correctness | 30,2% (88/291) | Mismo run, 9,0 M tokens |
| SciCode (validación) | Main-problem solve rate | 33,3% (5/15) | Split de validación, 0,84 M tokens |
| SciCode (validación) | Substep correctness | 48,0% (24/50) | Mismo run |

Rendimiento de serving medido por el autor (Intel Arc Pro B70, 128 tokens solicitados, 76 generados, temperatura 0):

| Checkpoint | Decodificacion | TTFT | Backend |
|---|---:|---:|---|
| Este repo (W4A8 dinámico) | 33,0 t/s (3/3 runs) | 0,08 s | Ruta de cuantización dinámica de activaciones |
| Este repo + DFlash draft (bloque 8) | ~55 t/s (54,6-56,4) | 0,09 s en caliente | Decodificación especulativa, aceptación 2,71/8 |
| LeoHyperlink/Sage-1.5-W4A16 (referencia) | 104,3 t/s | 0,06 s | `XPUwNa16LinearKernel` fusionado |

El autor advierte de que la cuantización dinámica de activaciones cuesta aproximadamente 3x frente a la ruta W4A16 fusionada en este stack XPU. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 19,5 GB; en el serving de prueba, pesos del target más drafter (20,3 GB) más grafos (4,9 GB) dejaban casi sin margen una tarjeta de 32 GB.
- GPU probada: Intel Arc Pro B70 de 32 GB, con `--max-model-len 1024 --max-num-seqs 16 --gpu-memory-utilization 0.95` para que cupiera la caché KV (1,68 GB necesarios frente a 1,64 GB disponibles con 64 secuencias).
- GPU recomendadas: no hay datos publicados para A100, H100 o RTX 4090; la única medición disponible es en Intel Arc. El soporte de tensor-parallel (TP=2) estaba bloqueado en el equipo del autor por un fallo de oneCCL (`mem_to_ipc_handle: invalid_fd`).
- Cabe en GPU de consumo: no confirmado; con 19,5 GB de pesos, una GPU de 24 GB quedaría muy justa para contexto largo, pero no se ha probado.
- Opciones de despliegue: vLLM con backend XPU (probado); transformers como librería declarada; llama.cpp, Ollama y TGI no están documentados para este checkpoint.
- Latencia y throughput: 33,0 t/s en decodificación monoflujo y 0,08 s de TTFT sin especulación; ~55 t/s con DFlash (TTFT en frío de 1,33 s por el warmup del drafter).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Rendimiento medido | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-Pi-W4A8 (este) | 6,24 B (safetensors) | no disponible | W4A8 int4/int8 dinámico | 33,0 t/s; ~55 t/s con DFlash | Apache-2.0 |
| LeoHyperlink/Sage-1.5-W4A16 | no disponible | no disponible | W4A16 | 104,3 t/s en el mismo equipo | no disponible |
| bytkim/Qwen3.8-27B-pi (base) | no disponible | no disponible | BF16 (sin cuantizar) | HLE 55,1 con herramientas (según la card del base) | Apache-2.0 |
| incoai/Qwen3.8-27B-DFlash2 (drafter) | 1,9 B | no disponible | no disponible | Aceptación 2,71/8 como drafter | no disponible |

La comparación directa con el modelo base no es válida en términos de calidad: la cifra de HLE 55,1 del base se obtuvo con herramientas, mientras que la de este checkpoint (12,14%) es sin herramientas y auto-puntuada. La comparación de velocidad con Sage-1.5-W4A16 sí es homogénea (mismo equipo y protocolo), y muestra una penalización de aproximadamente 3x por la cuantización dinámica de activaciones.

## Limitaciones y advertencias

- Los benchmarks están auto-puntuados por el propio modelo cuantizado, sin juez externo; el autor señala que el sesgo del juez es desconocido y plausiblemente a la baja.
- La evaluación de HLE es solo texto y sin herramientas, por lo que no debe compararse con la cifra de 55,1 del modelo base, que sí usa herramientas.
- SciCode se ejecutó sin contexto de fondo (zero-shot), lo que reduce la tasa de resolución frente a configuraciones con documentación.
- El nombre "27B" no coincide con los 6,24 mil millones de parámetros del checkpoint; conviene verificar el recuento antes de dimensionar hardware.
- La cuantización W4A8 con activaciones dinámicas es aproximadamente 3x más lenta que una ruta W4A16 fusionada en el stack XPU probado.
- El serving con decodificación especulativa requiere limitar contexto y número de secuencias para que quepa la caché KV en 32 GB; TP=2 no estaba operativo en el equipo del autor.
- No hay datos publicados sobre sesgos, tasas de alucinación, cobertura de idiomas ni soporte de tool calling.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar las condiciones de este último.
- La calidad de la torre visual tras la cuantización no está evaluada; se mantiene en BF16, pero sin métricas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LeoHyperlink/Qwen3.8-27B-Pi-W4A8
- Modelo base: https://huggingface.co/bytkim/Qwen3.8-27B-pi
- Drafter DFlash: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Referencia W4A16 del mismo autor: https://huggingface.co/LeoHyperlink/Sage-1.5-W4A16
- Log de HLE: https://huggingface.co/LeoHyperlink/Qwen3.8-27B-Pi-W4A8/blob/main/benchmarks/hle-full.eval
- Repositorio de SciCode: https://github.com/scicode-bench/SciCode
- Dataset de calibración: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
