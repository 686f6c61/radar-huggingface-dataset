# rico03/Qwen3.8-27B-Claude-Opus-Reasoning-Distilled

## Resumen

El modelo `rico03/Qwen3.8-27B-Claude-Opus-Reasoning-Distilled` es un adaptador LoRA (librería PEFT) que fine-tunea el modelo base `Qwen/Qwen3.8-27B` sobre trazas de razonamiento extendido (chain-of-thought) de Claude Opus 4.6 y 4.7. El objetivo es transferir el estilo de razonamiento estructurado y profundo de Opus a un modelo abierto denso de 27B parámetros, ejecutable en hardware propio. El adaptador fue entrenado por el usuario rico03 con Unsloth sobre una única GPU H100 NVL (95 GB) usando QLoRA de 4 bits.

El modelo base Qwen3.8-27B es un modelo denso de 27.6B parámetros con arquitectura híbrida de atención: 16 de 64 capas usan atención completa (full attention) y las 48 restantes usan Gated DeltaNet (atención lineal), además de una cabeza MTP (multi-token prediction). El fine-tune solo afecta a la ruta de razonamiento textual: ambas vías de atención y las capas MLP se ajustan mediante LoRA, mientras que la torre de visión permanece congelada y sin uso. El adaptador ocupa 954 MB en disco y añade 233 millones de parámetros entrenables (0,85 % del total).

Es importante señalar que este checkpoint es un **run de validación de pipeline**, no un modelo convergido: se entrenaron solo 150 pasos (0,126 épocas, ~2700 de 21 490 ejemplos) con una pérdida final de 0,728. El propio autor advierte que se necesita un entrenamiento completo (más de una época) antes de tratar el modelo como una destilación terminada. Por tanto, su uso en producción no es recomendable en el estado actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.8-27B (dense, híbrido: 16/64 capas full attention, 48/64 capas Gated DeltaNet/linear attention, cabeza MTP) |
| Parametros totales | 27.6B (modelo base) + 233 455 616 entrenables en el adaptador (0,85 %) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (secuencia de entrenamiento; el máximo del modelo base no se especifica en la documentación disponible) |
| Tipos de cuantizacion | QLoRA 4-bit para el entrenamiento; el adaptador es LoRA estándar (r=32, alpha=32) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.8-27B, un modelo denso de 27.6B parámetros con una arquitectura híbrida de atención: 16 de las 64 capas usan atención completa (full attention) y las 48 restantes usan Gated DeltaNet, un mecanismo de atención lineal que reduce el coste computacional en secuencias largas. El modelo base incluye además una cabeza MTP (multi-token prediction) para acelerar la decodificación. El fine-tune con LoRA (r=32, alpha=32) se realizó con Unsloth sobre una base cuantizada a 4 bits (QLoRA), con enmascaramiento de pérdida solo en las respuestas del asistente (`train_on_responses_only`). La torre de visión quedó congelada y no se utilizó durante el entrenamiento.

El conjunto de datos combina tres fuentes, sumando 21 490 ejemplos: 8124 trazas genuinas de razonamiento extendido de Claude Opus 4.7 (dataset `lordx64/reasoning-distill-claude-opus-4-7-max`), 4800 salidas reales de Opus 4.7 con trazas de razonamiento reconstruidas a posteriori por un modelo de "inversión de trazas" (`Jackrong/Claude-opus-4.7-TraceInversion-5000x`) y 8700 equivalentes de Opus 4.6 (`Jackrong/Claude-opus-4.6-TraceInversion-9000x`). El autor advierte que aproximadamente el 62 % de los datos (los dos conjuntos de TraceInversion) contienen respuestas finales genuinas de Opus pero trazas de razonamiento reconstruidas, no el pensamiento interno real. El entrenamiento se limitó a 150 pasos con un batch efectivo de 18, secuencia de 8192 tokens y una pérdida final de 0,728, en 53 minutos sobre una H100 NVL. El autor indica explícitamente que este run no ha convergido y que el checkpoint no puede reanudarse directamente para un entrenamiento más largo debido al programa de coseno calibrado para 150 pasos.

## Capacidades

- Razonamiento chain-of-thought estructurado: el adaptador busca imitar el estilo de razonamiento profundo y paso a paso de Claude Opus, aunque solo se ha validado parcialmente (no convergido).
- Generación de texto en inglés: el modelo base es capaz de generar texto coherente y el fine-tune conserva esa capacidad, pero sin garantías de calidad por el entrenamiento incompleto.
- Capacidades de visión del modelo base: Qwen3.8-27B es un modelo de lenguaje y visión, pero este adaptador no afecta a la torre de visión (permanece congelada y sin uso). El modelo puede procesar imágenes si se usa el adaptador junto con el base, pero no se ha evaluado su rendimiento visual tras el fine-tune.
- Soporte de tool calling y agentes: no se menciona explícitamente en la documentación del adaptador, pero el modelo base Qwen3.8-27B muestra resultados en benchmarks de coding agéntico (Terminal-Bench, SWE-bench Pro), lo que sugiere capacidades de tool calling y razonamiento multi-paso en el base. No hay evidencia de que el adaptador las mejore o preserve.
- Multilingüismo: la model card indica únicamente inglés (`language: en`). No se documentan otras lenguas.

## Casos de uso

Dado el estado de validación del adaptador, los casos de uso realistas son limitados y deben considerarse experimentales. Si el entrenamiento se completara, los escenarios potenciales serían:

- Investigación en destilación de razonamiento: el adaptador sirve como referencia para estudiar cómo transferir el estilo de razonamiento de un modelo propietario (Claude Opus) a un modelo abierto mediante LoRA, y para comparar la calidad de trazas genuinas frente a reconstruidas.
- Prototipado de asistentes de razonamiento: con un entrenamiento completo, podría usarse para generar explicaciones paso a paso en tareas de matemáticas, lógica o análisis, aprovechando el estilo de Opus.
- Generación de código con razonamiento explícito: el modelo base destaca en LiveCodeBench v6 (90,3) y SWE-bench Pro (61,7); un adaptador bien entrenado podría añadir un estilo de razonamiento más estructurado a la generación de código.
- Evaluación de pipelines de fine-tuning con Unsloth: el checkpoint demuestra que el pipeline (LoRA sobre atención híbrida, enmascaramiento, chat template, checkpointing) funciona de extremo a extremo, útil para validar infraestructura antes de lanzar entrenamientos completos.
- Análisis de sesgos en datos de destilación: el conjunto de datos mezcla trazas genuinas y reconstruidas; el adaptador permite estudiar cómo afecta esa mezcla al comportamiento del modelo.
- Base para fine-tunes posteriores: el adaptador puede servir como punto de partida para un entrenamiento más largo, aunque el autor advierte que el programa de coseno actual impide reanudarlo directamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este adaptador concreto. El autor incluye en la model card los resultados oficiales del **modelo base** Qwen3.8-27B (no del fine-tune), que se reproducen a continuación como referencia. El adaptador no ha sido re-benchmarked de forma independiente.

| Benchmark (texto) | Qwen3.8-27B (base) | Qwen3.6-27B | Qwen3.7-Plus |
|---|---:|---:|---:|
| Terminal-Bench 2.1 (agentic coding) | 73,0 | 63,4 | 64,0 |
| SWE-bench Pro | 61,7 | 53,5 | 57,6 |
| QwenSWEBench | 79,0 | 49,3 | 59,2 |
| CoWorkBench (trabajo de oficina de largo horizonte) | 70,7 | 61,0 | 65,1 |
| IFBench (seguimiento de instrucciones) | 79,5 | 69,1 | 79,1 |
| GPQA Diamond (razonamiento científico) | 89,2 | 87,8 | 90,3 |
| HLE (razonamiento multidisciplinar) | 30,8 | 24,0 | 34,7 |
| LiveCodeBench v6 | 90,3 | 83,9 | 89,6 |

| Benchmark (visión-lenguaje, solo base) | Qwen3.8-27B (base) | Qwen3.6-27B | Qwen3.7-Plus |
|---|---:|---:|---:|
| OSWorld-Verified (uso de ordenador) | 84,3 | 63,9 | 73,3 |
| AndroidWorld (uso de móvil) | 81,9 | 70,3 | 81,0 |

Estos datos corresponden al modelo base sin el adaptador. No hay métricas que demuestren que el fine-tune mejora o degrada estos resultados.

## Requisitos de hardware

- El adaptador LoRA ocupa 954 MB en disco, pero para inferencia es necesario cargar el modelo base completo (27.6B parámetros) más el adaptador.
- VRAM estimada para inferencia del modelo base (sin datos oficiales del adaptador):
  - Cuantización 4-bit: aproximadamente 16-18 GB (podría caber en una RTX 4090 de 24 GB o similar).
  - Cuantización 8-bit: aproximadamente 28-30 GB (requiere GPU profesional como A100 40 GB o H100).
  - Precisión completa (16-bit): aproximadamente 54-56 GB (solo GPU profesional de alta gama).
- El entrenamiento se realizó en una única NVIDIA H100 NVL de 95 GB con QLoRA 4-bit, lo que indica que el fine-tune es viable en hardware de gama alta pero no en GPUs de consumo.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con bibliotecas que soporten LoRA (transformers + peft, vLLM con soporte LoRA, TGI). También puede fusionarse con el modelo base y exportarse a GGUF para usarlo con llama.cpp u Ollama, aunque no se documenta un proceso específico.
- Latencia y throughput: no disponibles. Dependerán de la cuantización, la GPU y la longitud de secuencia. El modelo base usa atención lineal (Gated DeltaNet) en 48 de 64 capas, lo que debería reducir el coste en secuencias largas, pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

La comparativa se basa en el modelo base Qwen3.8-27B, ya que el adaptador no tiene métricas propias. Los modelos comparables son Qwen3.6-27B y Qwen3.7-Plus, ambos de la misma familia Qwen y con tamaños similares.

| Modelo | Parámetros | Contexto | Licencia | Punto fuerte principal |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27.6B | No especificado | Apache-2.0 | Mejor en SWE-bench Pro, QwenSWEBench, LiveCodeBench v6 |
| Qwen3.6-27B | 27B (aprox.) | No especificado | Apache-2.0 | Inferior en la mayoría de benchmarks frente a 3.8 |
| Qwen3.7-Plus | No especificado | No especificado | No especificada | Competitivo en GPQA Diamond y HLE, inferior en coding |

El adaptador `rico03/Qwen3.8-27B-Claude-Opus-Reasoning-Distilled` no tiene comparativa directa con otros adaptadores de destilación de Claude Opus en la información disponible. Su singularidad radica en aplicar LoRA sobre un modelo híbrido de atención lineal, pero su estado no convergido impide una comparación justa.

## Limitaciones y advertencias

- **Entrenamiento incompleto**: el adaptador se entrenó solo 150 pasos (12,6 % de una época). No ha convergido y no debe tratarse como un modelo terminado. El autor lo describe como "pipeline-validation run".
- **Datos de razonamiento parcialmente reconstruidos**: aproximadamente el 62 % del conjunto de entrenamiento (los conjuntos TraceInversion) contiene trazas de razonamiento reconstruidas a posteriori, no el pensamiento real de Claude Opus. Esto puede introducir inconsistencias en el estilo de razonamiento aprendido.
- **Solo inglés**: la model card indica únicamente inglés. No hay soporte documentado para otros idiomas.
- **Sin evaluación independiente**: no se han publicado benchmarks del adaptador. Los resultados mostrados pertenecen al modelo base y no garantizan el comportamiento del fine-tune.
- **Riesgo de alucinación y sesgos**: no se han evaluado sesgos específicos ni tasas de alucinación del adaptador. Al derivar de un modelo base no alineado específicamente para seguridad, se recomienda precaución en aplicaciones sensibles.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial, pero el estado no convergido y la falta de evaluación hacen desaconsejable su uso en producción.
- **Imposibilidad de reanudar el entrenamiento**: el programa de coseno se calibró para exactamente 150 pasos; no se puede continuar el entrenamiento desde este checkpoint sin reconfigurar el programa de aprendizaje.

## Enlaces

- [Adaptador en Hugging Face](https://huggingface.co/rico03/Qwen3.8-27B-Claude-Opus-Reasoning-Distilled)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Dataset lordx64/reasoning-distill-claude-opus-4-7-max](https://huggingface.co/datasets/lordx64/reasoning-distill-claude-opus-4-7-max)
- [Dataset Jackrong/Claude-opus-4.7-TraceInversion-5000x](https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x)
- [Dataset Jackrong/Claude-opus-4.6-TraceInversion-9000x](https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x)
- [Unsloth (biblioteca de entrenamiento)](https://github.com/unslothai/unsloth)
