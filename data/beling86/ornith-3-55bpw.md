# Beling86/Ornith-3.55BPW

## Resumen

Ornith-3.55BPW es una cuantización de precisión mixta del modelo ornith-ai/Ornith-1.5-122B, un fine-tune de Qwen3.5-122B-A10B con arquitectura MoE (mezcla de expertos). La cuantización ha sido generada por el usuario Beling86 mediante AutoRound v3.2 (algoritmo SignRound) y está pensada específicamente para servir el modelo en vLLM. El checkpoint resultante ocupa 50,48 GiB con una media de 3,55 bits por peso, lo que reduce drásticamente los requisitos de memoria frente al modelo original en BF16.

El modelo base emplea una arquitectura híbrida que combina atención completa con capas GDN (Gated DeltaNet), e incorpora expertos enrutados y expertos compartidos. La cuantización elimina la torre de visión del modelo original, por lo que el resultado es exclusivamente de texto. El repositorio incluye un script de parcheo (`vllm-patch.py`) necesario para que vLLM interprete correctamente las capas de expertos con anchos de bits mixtos.

La relevancia de esta ficha radica en que permite ejecutar un modelo de gran tamaño (122B parámetros totales) en hardware más asequible gracias a la compresión a ~3,55 bits por peso, manteniendo una fidelidad razonable respecto al BF16 original según las métricas de divergencia KL publicadas por el autor de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (atención completa + capas GDN/Gated DeltaNet), basado en Qwen3.5-122B-A10B |
| Parametros totales | 14.938.515.456 (según safetensors del checkpoint cuantizado); modelo base: 122B |
| Parametros activos | no disponible (el modelo base es A10B, ~10B activos, según nomenclatura) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AutoRound v3.2 mixed-precision: W3A16 (expertos enrutados), W8A16 (GDN, atención completa, expertos compartidos), BF16 (routers, embeddings, LM head, norms) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato `auto_round:auto_gptq`), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-122B-A10B, un transformer MoE que combina capas de atención completa con capas GDN (Gated DeltaNet), una variante de atención lineal con estado recurrente. La cuantización preserva esta estructura híbrida: las proyecciones de las capas GDN (`in_proj_qkv`, `in_proj_z`, `out_proj`) y de atención completa (`q/k/v_proj`, `o_proj`) se cuantizan a W8A16 con grupo 128 simétrico, mientras que los expertos enrutados se cuantizan a W3A16 (15 capas con grupo 64 y 33 capas con grupo 128, todas simétricas). Los routers, el `shared_expert_gate`, las proyecciones `in_proj_a/b` del GDN, los embeddings, el LM head y las normas se mantienen en BF16 para preservar la estabilidad numérica.

El proceso de cuantización emplea AutoRound 0.16.1 (SignRound) con 400 iteraciones por bloque y un corpus de calibración balanceado de 512 secuencias de 2048 tokens en cinco dominios (chat, código, razonamiento matemático de OpenR1-Math-220k, LongAlpaca y prosa de WikiText-103), usando la plantilla ChatML nativa. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Qwen3.5.
- Razonamiento matemático, evidenciado por la inclusión de OpenR1-Math-220k en el corpus de calibración y por las métricas de fidelidad en el dominio math.
- Generación de código, con buen comportamiento en el dominio code (94,37% de acuerdo top-1 respecto a BF16).
- Procesamiento de contextos largos (el corpus de calibración incluye LongAlpaca, lo que sugiere soporte de ventanas extendidas, aunque la longitud exacta no está disponible).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión: eliminadas explícitamente (torre de visión removida).
- Capacidades de audio: no disponible.

## Casos de uso

- Despliegue de un MoE de gran tamaño en infraestructura con VRAM limitada: gracias a la compresión a 3,55 bits por peso y un checkpoint de 50,48 GiB, es posible servir un modelo de 122B parámetros totales en una o dos GPUs de 80 GB (A100/H100), algo inviable en BF16.
- Generación de código en pipelines de CI/CD: el dominio code muestra un acuerdo top-1 del 94,37% respecto al BF16, lo que lo hace adecuado para autocompletado, revisión y generación de tests donde se requiere fidelidad alta.
- Asistentes conversacionales multi-turno: el dominio chat presenta la menor divergencia media de KL (0,07585) y un 90,48% de acuerdo top-1, lo que respalda su uso en atención al cliente y chatbots de producción.
- Razonamiento matemático asistido: con un 89,97% de acuerdo top-1 en el dominio math, puede emplearse en tutoría, verificación de cálculos y generación de problemas resueltos.
- Procesamiento de documentos largos: la inclusión de LongAlpaca en la calibración y el soporte de contexto extendido del modelo base permiten resumir y analizar contratos, informes o artículos extensos.
- Investigación en cuantización: el repositorio publica métricas detalladas de KL por dominio, lo que lo convierte en un caso de estudio útil para evaluar el impacto de la precisión mixta en modelos MoE híbridos.
- Servicio de inferencia con vLLM: el checkpoint está empaquetado en formato `auto_gptq` y acompañado de un parche para vLLM, lo que facilita su integración en stacks de serving existentes.

## Benchmarks y rendimiento

El autor de la cuantización publica métricas de fidelidad (divergencia KL entre BF16 y cuantizado) sobre un conjunto de evaluación de 24 secuencias de 1.024 tokens, con fuentes disjuntas respecto a la calibración:

| Dominio | Posiciones | KL media | KL mediana | KL P99 | Acuerdo top-1 | PPL BF16 → cuantizado |
|---|---:|---:|---:|---:|---:|---:|
| Todos | 24552 | 0,15392 | 0,00883 | 2,7388 | 89,61% | 3,303 → 3,402 |
| Chat | 10230 | 0,07585 | 0,01471 | 1,0919 | 90,48% | 4,644 → 4,659 |
| Código | 5115 | 0,16071 | 0,00017 | 3,8010 | 94,37% | 1,525 → 1,598 |
| Matemáticas | 5115 | 0,17982 | 0,00526 | 3,0001 | 89,97% | 2,530 → 2,542 |
| Prosa | 4092 | 0,30822 | 0,06896 | 3,0694 | 81,06% | 5,161 → 5,738 |

Métricas globales: KL media 0,15392 (±0,00351), KL P99.9 6,9017, máximo 11,666. La versión v1 (`Ornith-3.63BPW`, 51,68 GiB) presentaba KL media 0,16801 y acuerdo top-1 del 89,10%, por lo que esta versión mejora ligeramente la fidelidad con menor tamaño. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 50,48 GiB; con overhead de activaciones y caché KV, se recomienda al menos 64-80 GB de VRAM.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 de 24 GB no son suficientes por sí solas; se necesitarían al menos 3-4 GPUs consumer de 24 GB para alojar los pesos).
- Cabe en GPU consumer: no de forma individual en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB); requiere múltiples GPUs consumer o GPUs de datacenter.
- Opciones de despliegue: vLLM es el backend objetivo (con `vllm-patch.py` para el parser INC y kernels Humming/Marlin); no se menciona soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles. El autor indica que la comprobación en seco de la configuración estática INC de vLLM pasó, pero el smoke test completo de serving se omitió durante la exportación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-3.55BPW (esta ficha) | 122B totales (14,9B en safetensors cuantizados) | no disponible | 3,55 bpw mixed-precision | no disponible | Hugging Face |
| Ornith-3.63BPW (v1) | 122B totales | no disponible | 3,63 bpw | no disponible | Hugging Face (referenciado en la model card) |
| ornith-ai/Ornith-1.5-122B (BF16) | 122B totales | no disponible | BF16 | no disponible | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización introduce degradación respecto a BF16: la KL media global es 0,15392 y el acuerdo top-1 es del 89,61%, con peor comportamiento en prosa (81,06% de acuerdo, PPL de 5,161 a 5,738).
- La torre de visión ha sido eliminada, por lo que no admite entradas de imagen.
- La licencia del modelo base y de la cuantización no está disponible, lo que impide confirmar si se permite uso comercial.
- No se han publicado datos sobre sesgos, riesgo de alucinación o limitaciones idiomáticas específicas.
- El smoke test completo de serving en vLLM se omitió durante la exportación; solo se validó la configuración estática INC en seco, por lo que la integración en producción requiere verificación adicional.
- Es necesario ejecutar `vllm-patch.py` para que vLLM interprete correctamente las capas de expertos con anchos de bits mixtos; sin él, el modelo puede no cargar o producir resultados incorrectos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- El modelo base es un fine-tune de Qwen3.5-122B-A10B; no se dispone de información sobre el proceso de entrenamiento original ni sobre sus limitaciones inherentes.

## Enlaces

- Hugging Face del modelo cuantizado: https://huggingface.co/Beling86/Ornith-3.55BPW
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Repositorio de AutoRound (referenciado en la model card): no disponible como enlace directo en la información proporcionada
- Documentación de vLLM: no disponible como enlace directo en la información proporcionada
- Paper o blog del modelo base: no disponible en la información proporcionada
