# JesseLiu/agentorch-sft-gemma26b-v1-2ep

## Resumen

agentorch-sft-gemma26b-v1-2ep es un checkpoint de ajuste supervisado (SFT) publicado por JesseLiu dentro del proyecto AgentOrch. Se construye sobre google/gemma-4-26B-A4B-it, un modelo de la familia Gemma 4 con 25.805.933.872 parámetros totales, y está especializado en orquestación de flujos de trabajo agénticos: decidir qué pasos, herramientas o subagentes intervienen en una tarea multi-paso.

El modelo se distribuye como pesos fusionados (la LoRA del entrenamiento está integrada en el checkpoint base), en formato safetensors y con licencia declarada Apache 2.0. El autor documenta una receta SFT concreta —2 épocas, presupuesto de 81.920 tokens, LoRA r16/a32 y learning rate 1e-4— y una evaluación sobre el benchmark AgentOrch (Global View, 3.220 variantes, harness congelado). Los resultados publicados son modestos: 0,1989 de orchestration accuracy, 0,0845 de final accuracy y 0,5661 de tasa de error.

Su interés es fundamentalmente de investigación: es un punto de partida reproducible para estudiar SFT de orquestación sobre Gemma 4, no un modelo listo para producción. Con 0 descargas y 0 likes en el momento de la ficha, tampoco existe validación externa por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 4; el sufijo A4B del modelo base sugiere MoE con ~4B de parámetros activos (no confirmado en la información disponible) |
| Parámetros totales | 25.805.933.872 (~25,8B) |
| Parámetros activos | ~4B estimados por la nomenclatura A4B del modelo base (no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo contiene safetensors en bf16 (~2 bytes por parámetro) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (declarada por el autor; el modelo base Gemma 4 se rige por sus propios términos de uso) |
| Formato de pesos | safetensors (pesos fusionados, LoRA integrada en el base) |
| Modelo base | google/gemma-4-26B-A4B-it, revisión 4d7ae4984b7db7de8f8457170b3f1a419ee76d52 |
| Tamaño del repositorio | 51,6 GB |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base google/gemma-4-26B-A4B-it. La nomenclatura A4B del base sugiere una mezcla de expertos (MoE) con aproximadamente 4.000 millones de parámetros activos sobre un total de 25,8B, aunque la información disponible no lo confirma de forma explícita. El repositorio ocupa 51,6 GB, lo que corresponde a pesos en bf16 (unos 2 bytes por parámetro).

El entrenamiento es un SFT sobre los datos v1 del proyecto AgentOrch: 2 épocas, presupuesto de 81.920 tokens, LoRA con r=16 y alpha=32, learning rate 1e-4 y schedule coseno a 2 épocas. Posteriormente la LoRA se fusiona en los pesos base, de modo que el checkpoint se carga como un modelo normal con transformers o vLLM. La model card indica explícitamente usar `enable_thinking=False` en la plantilla de chat, tal como se hizo en entrenamiento y evaluación; esto implica que el modelo base dispone de un modo de razonamiento que aquí se desactiva. No se documenta ninguna fase posterior de RLHF o DPO.

## Capacidades

- Orquestación de flujos de trabajo agénticos: objetivo central del SFT, orientado a descomponer tareas y asignar pasos, herramientas o subagentes.
- Generación de texto instructivo: capacidades heredadas del modelo base instruction-tuned de Gemma 4.
- Tool calling / function calling: presumiblemente heredado del base `-it`, aunque no se documenta de forma específica para este checkpoint.
- Modo thinking: el base dispone de él, pero la recomendación del autor es desactivarlo (`enable_thinking=False`) para reproducir el comportamiento de entrenamiento y evaluación.
- Razonamiento multi-paso: entrenado para ello, con métricas publicadas bajas (0,1989 de orchestration accuracy).
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Orquestación de pipelines multiagente en investigación: usar el modelo como planificador que descompone una tarea en pasos y asigna subagentes o herramientas. Es adecuado porque el SFT se diseñó exactamente para esta tarea, pero su tasa de error del 56,61 % obliga a supervisión humana.
- Enrutamiento de llamadas a herramientas en prototipos: emitir function calls dentro de un bucle agéntico. Con `enable_thinking=False` se evita el coste del modo de razonamiento y se replica la configuración de evaluación.
- Baseline reproducible para experimentos de SFT: el harness AgentOrch congelado y la receta publicada permiten comparar futuras variantes de datos o hiperparámetros contra este checkpoint.
- Generación de esqueletos de workflow para automatización interna: producir borradores de secuencias de pasos que después revisa un ingeniero antes de desplegarlos.
- Estudio de degradación por SFT corto: con solo 2 épocas y 81.920 tokens de presupuesto, sirve para analizar cómo afecta un ajuste ligero a las capacidades del modelo base.
- Punto de partida para un fine-tuning posterior: al estar los pesos fusionados y en safetensors, se puede continuar el entrenamiento con nuevos datos de orquestación sin partir del base original.
- Docencia y formación sobre sistemas agénticos: útil para ilustrar el ciclo completo datos-receta-evaluación en un proyecto de orquestación open source.

## Benchmarks y rendimiento

Evaluación publicada por el autor sobre el benchmark AgentOrch (Global View, 3.220 variantes, harness congelado, run `sft-gemma26b-v1-global`):

| Benchmark | Métrica | Resultado |
|---|---|---|
| AgentOrch | Orchestration accuracy | 0,1989 |
| AgentOrch | Final accuracy | 0,0845 |
| AgentOrch | Error rate | 0,5661 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible, ni comparaciones con modelos similares dentro de la model card.

## Requisitos de hardware

- VRAM estimada en bf16: unos 51,6 GB solo para pesos; con KV cache y activaciones para contextos moderados, el consumo práctico se sitúa por encima de 60 GB.
- GPU recomendadas: A100 80GB o H100 80GB en una sola tarjeta; también 2 x A100 40GB con tensor parallelism en vLLM.
- GPU de consumo: una RTX 4090 de 24GB no admite los pesos en bf16. Cabría con cuantización de 4 bits (aproximadamente 13-16 GB), pero no se publican versiones cuantizadas y habría que generarlas con bitsandbytes, GPTQ o AWQ, algo no verificado por el autor.
- Opciones de despliegue: transformers y vLLM, según indica la model card. llama.cpp u Ollama requerirían una conversión a GGUF que no está disponible en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| agentorch-sft-gemma26b-v1-2ep | 25,8B (~4B activos, no confirmado) | no disponible | Orquestación de workflows (SFT) | Apache 2.0 declarada (verificar términos de Gemma 4) | safetensors |
| google/gemma-4-26B-A4B-it | 25,8B (~4B activos, no confirmado) | no disponible | Modelo base instruction-tuned de propósito general | Términos de uso de Gemma | safetensors |
| atlas-institute/gemma26b-offsec-coder-gguf | no disponible | no disponible | Generación de código ofensivo y tool calling | Apache 2.0 | GGUF |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparación se limita a tamaño, tarea objetivo, licencia y formato de distribución.

## Limitaciones y advertencias

- Rendimiento bajo en la única evaluación publicada: 0,1989 de orchestration accuracy y un 56,61 % de tasa de error, insuficiente para uso autónomo en producción.
- Receta SFT muy contenida (2 épocas, 81.920 tokens, LoRA r16/a32), lo que limita la cobertura de casos y favorece el sobreajuste al formato de los datos v1.
- Evaluación única y autoinformada: no hay benchmarks estándar ni validación por terceros, y el repositorio registra 0 descargas y 0 likes.
- El modo thinking debe permanecer desactivado según el autor; activarlo puede degradar el comportamiento respecto a la configuración evaluada.
- Longitud de contexto e idiomas soportados no documentados, lo que impide garantizar conversaciones largas o cobertura multilingüe.
- Riesgo de alucinación heredado del modelo base; en orquestación, un error de planificación se propaga a todos los pasos posteriores del workflow.
- Licencia: el autor declara Apache 2.0, pero al derivar de Gemma 4 conviene verificar que se cumplen los términos de uso de Gemma antes de un despliegue comercial.
- Pesos únicamente en safetensors bf16: no hay GGUF ni cuantizaciones oficiales, lo que complica el despliegue en hardware de consumo.
- Sesgos: no documentados por el autor; se heredan los del modelo base y los del dataset v1 de AgentOrch, no publicado en detalle.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JesseLiu/agentorch-sft-gemma26b-v1-2ep
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Documentación de la familia Gemma: https://gemma.ai/models/
- Gemma en Google DeepMind: https://deepmind.google/models/gemma/
- Fine-tune relacionado de Gemma 26B (otra tarea): https://huggingface.co/atlas-institute/gemma26b-offsec-coder-gguf
- Repositorio AgentOrch (harness, datos y registro de experimentos): mencionado en la model card, URL no disponible en la información proporcionada.
