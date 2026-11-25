# nightmedia/Qwen3.6-35B-A3B-Mirage-oQ3e-mtp

## Resumen

Qwen3.6-35B-A3B-Mirage-oQ3e-mtp es un modelo derivado del linaje Qwen3.6-35B-A3B, publicado por el usuario nightmedia en Hugging Face. Se trata de un merge experimental de múltiples modelos (TerminalHorizon-35B-A3B, Brainwaves-Nex-Uncensored, Fable-Holo3.1, FSM, AgentWorld, Iris-mini, Thomson-1.0-Small, Nex-N2.5-mini-Uncensored y SuperQwen-AgentWorld-abliterated) combinados mediante mergekit. El resultado es un modelo de arquitectura MoE con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (denominación A3B), empaquetado en una cuantización de 3 bits (oQ3e-mtp) de 17,9 GB.

El modelo se distribuye en formato safetensors bajo licencia Apache 2.0, con soporte declarado para inglés, chino, japonés y español, y pipeline image-text-to-text, lo que sugiere capacidad multimodal heredada del modelo base. La ficha del autor incluye métricas de "Brainwaves" (ARC, ARC/e, BoolQ, HellaSwag, OpenBookQA, PIQA, WinoGrande) y comparativas de perplejidad y memoria pico entre cuantizaciones, así como resultados parciales en ARC-Challenge, TruthfulQA y HumanEval para las variantes oQ4e-mtp y oQ3e-mtp.

Su relevancia es acotada y de carácter experimental: no es un modelo oficial de Qwen ni un lanzamiento con validación independiente, sino un artefacto de la comunidad orientado a investigación, con un volumen de descargas bajo (298) y sin likes. Resulta útil como caso de estudio de merging, cuantización agresiva y evaluación de degradación de rendimiento, más que como base para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`, linaje Qwen3.6-35B-A3B) |
| Parámetros totales | 35.951.822.704 |
| Parámetros activos | ~3.000 millones (denominación A3B; no se especifica cifra exacta) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | oQ3e-mtp (3 bits, variante publicada); el autor reporta también bf16, q8-hi, qx86-hi, oQ8e-mtp, mxfp8, q6-hi, qx64-hi, oQ6e-mtp, oQ4e-mtp, mxfp4, oQ2.7e-mtp, oQ2.5e-mtp y oQ2e-mtp |
| Idiomas soportados | en, zh, ja, es |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un merge, no un entrenamiento desde cero. Según la model card, combina shunzou05/TerminalHorizon-35B-A3B y nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored, con la participación adicional de AllSpark-Research/Iris-mini, thomsonreuters/Thomson-1.0-Small, nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1, nightmedia/Qwen3.6-35B-A3B-FSM, Qwen/Qwen-AgentWorld-35B-A3B, orcarouter/Nex-N2.5-mini-Uncensored y Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated. La técnica de fusión es mergekit, con tags que apuntan a distillation, SFT, LoRA, long-CoT y reasoning como componentes del linaje.

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) del linaje Qwen3.5/Qwen3.6, con 35,95 mil millones de parámetros totales y activación dispersa de aproximadamente 3 mil millones por token. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO en las etapas previas del linaje. La innovación destacable del artefacto publicado es la cuantización oQ3e-mtp (3 bits con "mtp", presumiblemente multi-token prediction o técnica equivalente del ecosistema del autor), que reduce el peso a 17,9 GB manteniendo una perplejidad de 3,827 ± 0,024 frente a 3,765 ± 0,023 en bf16, con una memoria pico de 23,40 GB y 1673 tokens/s según las métricas del autor.

## Capacidades

- Generación de texto conversacional e instruccional, con tags de instruction-tuned y conversational.
- Razonamiento con cadena de pensamiento larga (long-cot, chain-of-thought) y modo reasoning declarado en los tags.
- Matemáticas y STEM, según los tags math y stem.
- Generación de código, con tag coding y resultados reportados en HumanEval.
- Capacidad multimodal image-text-to-text (pipeline declarado), aunque no se detalla la naturaleza exacta de la entrada visual.
- Soporte multilingüe para inglés, chino, japonés y español.
- Capacidades de agente y tool calling inferidas del linaje AgentWorld (Qwen/Qwen-AgentWorld-35B-A3B), aunque no se documentan explícitamente en la model card.
- Orientación a investigación y experimentación (tag research, experimental).
- Componente de humor y estilo "fable" heredado de los merges Fable-Holo3.1 y FSM.

## Casos de uso

- Investigación sobre merging de modelos: el artefacto permite estudiar cómo la fusión de ocho modelos con mergekit afecta a métricas de razonamiento (ARC, HellaSwag, PIQA) y a la perplejidad, comparando contra el modelo base Qwen3.6-35B-A3B-Instruct.
- Evaluación de cuantización agresiva: la tabla de "Brainwaves" del autor ofrece puntos de comparación entre bf16, 8, 6, 4, 3 y 2 bits, útil para medir la degradación de precisión y el ahorro de memoria en un MoE de 35B.
- Despliegue en hardware de gama alta con VRAM limitada: con 23,40 GB de memoria pico en oQ3e-mtp, el modelo cabe en una GPU de 24 GB (RTX 4090, L4) o en dos GPUs de 16 GB, lo que facilita experimentación local con un MoE de 35B.
- Prototipado de asistentes multilingües: al cubrir en, zh, ja y es, sirve para probar conversaciones multi-turno en esos idiomas antes de migrar a un modelo con soporte oficial.
- Generación de código en entornos de investigación: los resultados de HumanEval (95,7% de accuracy en oQ3e-mtp según el autor) permiten usarlo como banco de pruebas para pipelines de generación y evaluación de código, siempre con validación independiente.
- Estudio de alineación y contenido: al incorporar componentes "uncensored" y "abliterated", es útil para analizar el efecto de estos merges en TruthfulQA (91,4% reportado) y en la tasa de rechazo.
- Experimentación con modelos de agente: el linaje AgentWorld sugiere utilidad para probar flujos multi-paso y tool calling en entornos controlados, aunque sin garantías de producción.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card para Qwen3.6-35B-A3B-Mirage-oQ3e-mtp y su variante oQ4e-mtp, comparados con el modelo base Qwen3.6-35B-A3B-Instruct en las métricas "Brainwaves" (formato del autor, valores normalizados 0-1):

| Benchmark | Mirage oQ3e-mtp | Mirage oQ4e-mtp | Base Qwen3.6-35B-A3B-Instruct (mxfp8) |
|---|---|---|---|
| ARC | 0,677 | 0,672 | 0,581 |
| ARC/e | 0,865 | 0,869 | 0,757 |
| BoolQ | 0,905 | 0,905 | 0,892 |
| HellaSwag | 0,767 | 0,767 | 0,751 |
| OpenBookQA | 0,464 | 0,460 | 0,428 |
| PIQA | 0,826 | 0,816 | 0,803 |
| WinoGrande | 0,719 | 0,715 | 0,688 |
| Perplejidad | 3,827 ± 0,024 | 3,778 ± 0,023 | 5,138 ± 0,037 |
| Memoria pico | 23,40 GB | 27,64 GB | 42,65 GB |
| Tokens/s | 1673 | 1584 | 1201 |

Resultados parciales en benchmarks de omlx.ai reportados por el autor:

| Benchmark | Muestras | Omitidas | Parcial | Accuracy (oQ3e-mtp) | Accuracy (oQ4e-mtp) |
|---|---|---|---|---|---|
| ARC-Challenge | 1172 | 1 / 0 | 96,7% / 97,5% | 96,7% | 97,5% |
| TruthfulQA | 817 | 17 / 12 | 92,9% / 92,7% | 91,4% | 91,7% |
| HumanEval | 164 | 2 / 3 | 96,9% / 97,5% | 95,7% | 96,3% |

No se han publicado resultados de benchmarks independientes en la información disponible. Las cifras proceden exclusivamente del autor y no han sido verificadas por terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: 23,40 GB de memoria pico en oQ3e-mtp (dato del autor); 27,64 GB en oQ4e-mtp; 35,69 GB en oQ6e-mtp; 43,71 GB en oQ8e-mtp; 76,22 GB en bf16.
- GPU recomendadas: una RTX 4090 (24 GB) o L4 (24 GB) para oQ3e-mtp; A100 40 GB o H100 para cuantizaciones de 6-8 bits; A100 80 GB o H100 80 GB para bf16.
- Cabe en GPU de consumo: sí, en RTX 4090 con oQ3e-mtp (23,40 GB) al límite; en RTX 3090 (24 GB) de forma similar; en GPUs de 16 GB requeriría partición o cuantizaciones de 2 bits (19,58 GB en oQ2e-mtp, aún por encima de 16 GB).
- Opciones de despliegue: la librería declarada es transformers; los tags incluyen unsloth y mlx, lo que sugiere compatibilidad con Unsloth y MLX. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: 1673 tokens/s en oQ3e-mtp, 1584 tokens/s en oQ4e-mtp, 1697 tokens/s en bf16, según las métricas del autor (entorno no especificado).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Mirage-oQ3e-mtp | 35,95B totales / ~3B activos | no disponible | Apache 2.0 | safetensors | Merge experimental de 8 modelos, cuantización 3 bits |
| Qwen3.6-35B-A3B-Instruct (base) | 35,95B totales / ~3B activos | no disponible | Apache 2.0 | safetensors | Modelo oficial de referencia; perplejidad 5,138 en mxfp8 según el autor |
| Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored | 35,95B totales / ~3B activos | no disponible | Apache 2.0 | safetensors | Componente del merge; perplejidad 3,738 en bf16 |
| TerminalHorizon-35B-A3B | 35,95B totales / ~3B activos | no disponible | no disponible | safetensors | Componente del merge; datos de benchmark muy limitados (solo ARC 0,589 en mxfp8) |

No se dispone de comparativas con modelos de otros linajes (Llama, Mistral, DeepSeek) en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental y no oficial: no procede de Qwen ni de un laboratorio consolidado, sino de un merge comunitario con 298 descargas y 0 likes; no hay validación independiente.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad más allá de TruthfulQA reportado por el autor (91,4% en oQ3e-mtp), sin verificación externa.
- Sesgos conocidos: no disponibles; la incorporación de componentes "uncensored" y "abliterated" puede reducir los rechazos ante contenido sensible, lo que exige filtrado adicional en producción.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada; el soporte multilingüe se limita a en, zh, ja y es, sin datos de calidad por idioma.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero los modelos base del merge pueden tener condiciones adicionales no reflejadas en la información disponible; conviene revisar cada componente.
- Caveats para producción: la cuantización de 3 bits degrada la perplejidad (3,827 frente a 3,765 en bf16) y puede afectar a tareas de razonamiento fino; las métricas de throughput y memoria proceden del autor y dependen del hardware y del runtime empleados.
- Compatibilidad de despliegue incierta: solo se confirma transformers, unsloth y mlx; no hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI.
- El pipeline declarado es image-text-to-text, pero no se detallan las capacidades visuales reales ni su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Mirage-oQ3e-mtp
- Modelo base TerminalHorizon-35B-A3B: https://huggingface.co/shunzou05/TerminalHorizon-35B-A3B
- Modelo base Brainwaves-Nex-Uncensored: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored
- Modelo base Fable-Holo3.1: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1
- Modelo base FSM: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-FSM
- Modelo base AgentWorld: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B
- Modelo base Iris-mini: https://huggingface.co/AllSpark-Research/Iris-mini
- Modelo base Thomson-1.0-Small: https://huggingface.co/thomsonreuters/Thomson-1.0-Small
- Modelo base Nex-N2.5-mini-Uncensored: https://huggingface.co/orcarouter/Nex-N2.5-mini-Uncensored
- Modelo base SuperQwen-AgentWorld-abliterated: https://huggingface.co/Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated
- Benchmark ARC-Challenge (oQ3e-mtp): https://omlx.ai/benchmarks/intelligence/vcdqpguq
- Benchmark TruthfulQA (oQ3e-mtp): https://omlx.ai/benchmarks/intelligence/3zij6idy
- Benchmark HumanEval (oQ3e-mtp): https://omlx.ai/benchmarks/intelligence/3zij6idy
- Benchmark ARC-Challenge (oQ4e-mtp): https://omlx.ai/benchmarks/intelligence/at212qt2
- Benchmark TruthfulQA (oQ4e-mtp): https://omlx.ai/benchmarks/intelligence/0cfturoz
- Benchmark HumanEval (oQ4e-mtp): https://omlx.ai/benchmarks/intelligence/9203c64r
