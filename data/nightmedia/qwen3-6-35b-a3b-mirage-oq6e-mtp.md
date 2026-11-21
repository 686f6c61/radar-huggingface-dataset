# nightmedia/Qwen3.6-35B-A3B-Mirage-oQ6e-mtp

## Resumen

Qwen3.6-35B-A3B-Mirage-oQ6e-mtp es un modelo experimental publicado por el usuario nightmedia en Hugging Face, fruto de una fusión (merge) de múltiples variantes derivadas de la familia Qwen3.5/3.6. Se trata de un modelo de mezcla de expertos (MoE) con 35.951.822.704 parámetros totales y un prefijo "A3B" que indica aproximadamente 3.000 millones de parámetros activos por token, según la convención de nomenclatura de Qwen. El sufijo "oQ6e-mtp" identifica una cuantización de 6 bits (oQ6e) con decodificación especulativa multi-token prediction (MTP), una de las variantes de cuantización evaluadas por el autor.

El modelo combina ocho modelos base o participantes, incluyendo TerminalHorizon-35B-A3B, Iris-mini, Thomson-1.0-Small, Fable-Holo3.1, FSM, Qwen-AgentWorld-35B-A3B, Nex-N2.5-mini-Uncensored y SuperQwen-AgentWorld-35B-A3B-abliterated. La model card lo describe como un merge con orientación a razonamiento (chain-of-thought, long-cot), instrucciones, matemáticas, STEM, código y capacidades multilingües, con un tono experimental y una temática "fable/humour" que sugiere una personalización estilística.

Es relevante ahora porque ejemplifica la práctica creciente de merges comunitarios sobre arquitecturas MoE de Qwen, con cuantizaciones agresivas (hasta 2 bits) que preservan gran parte del rendimiento del modelo en bf16. La ficha técnica del autor incluye métricas de perplejidad, memoria pico y tokens por segundo para cada cuantización, lo que facilita evaluar el compromiso entre calidad y coste de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), merge de modelos Qwen3.5/3.6 |
| Parametros totales | 35.951.822.704 |
| Parametros activos | Aproximadamente 3B (según nomenclatura A3B; no confirmado en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, q8-hi, qx86-hi, oQ8e-mtp, mxfp8, q6-hi, qx64-hi, oQ6e-mtp, oQ4e-mtp, mxfp4, oQ3e-mtp, oQ2.7e-mtp, oQ2.5e-mtp, oQ2e-mtp |
| Idiomas soportados | en, zh, ja, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un merge de tipo MoE construido con mergekit, según los tags de la model card. La arquitectura subyacente corresponde a la familia Qwen3.5/3.6 con tag `qwen3_5_moe`, y el pipeline declarado es `image-text-to-text`, lo que sugiere capacidades multimodales heredadas de los modelos base. El autor indica que el modelo resultante es el "Lab name: Qwen3.6-35B-A3B-TerminalHorizon-AgentWorld-Fable-Holo3.1-Iris-Thomson-B-Nex2", es decir, una combinación de ocho modelos participantes.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el merge. Los tags mencionan distillation, chain-of-thought, long-cot, SFT y LoRA, lo que indica que los modelos base incorporan estas técnicas, pero no se detalla su aplicación específica en este merge. La innovación técnica destacable es la inclusión de variantes con MTP (multi-token prediction) para decodificación especulativa, que el autor evalúa en términos de perplejidad, memoria pico y throughput.

## Capacidades

- Generación de texto conversacional e instruccional, con orientación a razonamiento explícito (chain-of-thought y long-cot).
- Razonamiento matemático y STEM, según los tags `math` y `stem`.
- Generación de código, con tag `coding` y evaluación en HumanEval reportada por el autor.
- Capacidades multimodales de entrada imagen-texto (pipeline `image-text-to-text`).
- Soporte multilingüe en inglés, chino, japonés y español.
- Estilo "fable/humour" y personalización creativa, según los tags del modelo.
- Variantes con MTP para decodificación especulativa.
- No se confirma soporte explícito de tool calling o function calling en la información disponible.
- No se confirma soporte de agentes multi-paso en la información disponible.

## Casos de uso

- Razonamiento matemático y resolución de problemas STEM: el modelo incorpora cadenas de razonamiento largas (long-cot) y puede emplearse en entornos educativos o de investigación para descomponer problemas complejos paso a paso, con la ventaja de su cuantización de 6 bits que reduce requisitos de memoria.
- Generación de código en pipelines de desarrollo: con evaluación en HumanEval reportada (96,3% en oQ4e-mtp y 95,7% en oQ3e-mtp), puede integrarse en asistentes de programación o revisión de código, aunque requiere validación humana por su naturaleza experimental.
- Procesamiento de documentos con imagen y texto: el pipeline `image-text-to-text` permite extraer y razonar sobre información contenida en capturas, diagramas o documentos escaneados, combinando visión y lenguaje.
- Atención al cliente multilingüe: al soportar inglés, chino, japonés y español, puede desplegarse en entornos de soporte con usuarios de esos idiomas, aunque la longitud de contexto no está confirmada.
- Generación creativa y narrativa: el tag `fable` y `humour` sugiere un ajuste estilístico para escritura creativa, guiones o contenido lúdico, aprovechando el tono personalizado del merge.
- Investigación experimental en merges y cuantización: sirve como caso de estudio para evaluar cómo distintas cuantizaciones (desde bf16 hasta 2 bits) afectan a la perplejidad y al rendimiento en benchmarks, con datos publicados por el autor.
- Despliegue en hardware de consumo: la variante oQ4e-mtp ocupa 27,64 GB de memoria pico, lo que permite ejecución en GPUs de gama alta para consumidores con suficiente VRAM.

## Benchmarks y rendimiento

El autor publica métricas de "brainwaves" (ARC, ARC/e, BoolQ, HellaSwag, OpenBookQA, PIQA, Winogrande) para distintas cuantizaciones, además de perplejidad, memoria pico y tokens por segundo. Se reproducen los datos de la variante oQ6e-mtp y comparativas clave:

| Benchmark | bf16 | oQ6e-mtp | oQ4e-mtp | oQ3e-mtp | oQ2e-mtp |
|---|---|---|---|---|---|
| ARC | 0,677 | 0,676 | 0,672 | 0,677 | 0,657 |
| ARC/e | 0,868 | 0,868 | 0,869 | 0,865 | 0,847 |
| BoolQ | 0,903 | 0,904 | 0,905 | 0,905 | 0,905 |
| HellaSwag | 0,770 | 0,770 | 0,767 | 0,767 | 0,736 |
| OpenBookQA | 0,454 | 0,452 | 0,460 | 0,464 | 0,430 |
| PIQA | 0,820 | 0,821 | 0,816 | 0,826 | 0,813 |
| Winogrande | 0,714 | 0,712 | 0,715 | 0,719 | 0,724 |

| Cuantización | Perplejidad | Memoria pico | Tokens/s |
|---|---|---|---|
| bf16 | 3,765 ± 0,023 | 76,22 GB | 1697 |
| oQ6e-mtp | 3,766 ± 0,023 | 35,69 GB | 1614 |
| oQ4e-mtp | 3,778 ± 0,023 | 27,64 GB | 1584 |
| oQ3e-mtp | 3,827 ± 0,024 | 23,40 GB | 1673 |
| oQ2e-mtp | 4,160 ± 0,026 | 19,58 GB | 1726 |

Resultados oMLX para variantes concretas:

| Benchmark | oQ4e-mtp (Accuracy) | oQ3e-mtp (Accuracy) |
|---|---|---|
| ARC_CHALLENGE | 97,5% | 96,7% |
| TRUTHFULQA | 91,7% | 91,4% |
| HUMANEVAL | 96,3% | 95,7% |

El modelo base Qwen3.6-35B-A3B-Instruct presenta perplejidad de 5,138 (mxfp8) y 4,826 (qx86-hi), claramente superior a la del merge, lo que sugiere que la fusión mejora la modelización del lenguaje según estas métricas. No se han publicado resultados de MMLU, GSM8K u otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: desde 19,58 GB (oQ2e-mtp) hasta 76,22 GB (bf16) de memoria pico según la tabla del autor.
- La variante oQ6e-mtp requiere 35,69 GB de memoria pico, adecuada para GPUs con 40-48 GB (A100 40GB, A6000, L40S).
- La variante oQ4e-mtp (27,64 GB) cabe en GPUs de consumo de gama alta como RTX 4090 (24 GB) con offloading parcial o en RTX 5090 si dispone de más VRAM; en RTX 4090 estricta requeriría cuantizaciones menores como oQ3e-mtp (23,40 GB).
- La variante oQ2e-mtp (19,58 GB) cabe en GPUs de consumo con 24 GB de VRAM.
- Opciones de despliegue: transformers (librería declarada), con soporte de cuantizaciones oQ/mxfp/qx; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Throughput reportado: entre 1480 y 1728 tokens/s en las pruebas del autor, con la variante oQ2e-mtp alcanzando 1726 tokens/s y bf16 1697 tokens/s; estas cifras corresponden al entorno de evaluación del autor y no son directamente extrapolables a otros hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento (referencia) |
|---|---|---|---|---|
| Qwen3.6-35B-A3B-Mirage-oQ6e-mtp | 35,95B (MoE, ~3B activos) | no disponible | apache-2.0 | Perplejidad 3,766; ARC 0,676; HumanEval 96,3% (oQ4e) |
| Qwen3.6-35B-A3B-Instruct (base) | 35B (MoE) | no disponible | no disponible | Perplejidad 4,826-5,138; ARC 0,576-0,586 |
| Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored (componente) | 35B (MoE) | no disponible | no disponible | Perplejidad 3,738 (bf16); ARC 0,668 |
| TerminalHorizon-35B-A3B (componente) | 35B (MoE) | no disponible | no disponible | ARC 0,589 (mxfp8) |

La comparativa se limita a los modelos evaluados por el autor en la model card; no se dispone de datos de modelos externos de la misma categoría (por ejemplo, otros MoE de ~35B) en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental y merge comunitario: no ha pasado por un proceso de validación formal y su comportamiento puede ser impredecible en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la fusión de múltiples fuentes con estilos y orientaciones distintas.
- La longitud de contexto no está documentada, lo que impide planificar su uso en tareas de contexto largo.
- El soporte multilingüe se limita a en, zh, ja, es; no se garantiza un rendimiento uniforme en los cuatro idiomas.
- La licencia apache-2.0 permite uso comercial, pero los modelos base y participantes pueden tener condiciones adicionales no reflejadas en la model card; conviene verificar cada componente.
- El sesgo y el tono "fable/humour" pueden no ser adecuados para aplicaciones profesionales sin ajuste adicional.
- Las métricas de benchmarks provienen del propio autor y no han sido replicadas de forma independiente; además, los resultados de oMLX (ARC_CHALLENGE 97,5%) difieren notablemente de los de "brainwaves" (ARC 0,676), lo que sugiere metodologías distintas y dificulta la comparación directa.
- El pipeline declarado es `image-text-to-text`, pero no se detallan las capacidades de visión ni su calidad.
- El tamaño del repo (40,7 GB) y la naturaleza del merge pueden complicar la reproducibilidad y el soporte a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Mirage-oQ6e-mtp
- Benchmarks oMLX ARC_CHALLENGE (oQ4e-mtp): https://omlx.ai/benchmarks/intelligence/at212qt2
- Benchmarks oMLX TRUTHFULQA (oQ4e-mtp): https://omlx.ai/benchmarks/intelligence/0cfturoz
- Benchmarks oMLX HUMANEVAL (oQ4e-mtp): https://omlx.ai/benchmarks/intelligence/9203c64r
- Benchmarks oMLX ARC_CHALLENGE (oQ3e-mtp): https://omlx.ai/benchmarks/intelligence/vcdqpguq
- Benchmarks oMLX TRUTHFULQA (oQ3e-mtp): https://omlx.ai/benchmarks/intelligence/3zij6idy
- Benchmarks oMLX HUMANEVAL (oQ3e-mtp): https://omlx.ai/benchmarks/intelligence/3zij6idy
- Modelo base TerminalHorizon-35B-A3B: https://huggingface.co/shunzou05/TerminalHorizon-35B-A3B
- Modelo participante Iris-mini: https://huggingface.co/AllSpark-Research/Iris-mini
- Modelo participante Thomson-1.0-Small: https://huggingface.co/thomsonreuters/Thomson-1.0-Small
- Modelo participante Fable-Holo3.1: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1
- Modelo participante FSM: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-FSM
- Modelo participante Qwen-AgentWorld-35B-A3B: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B
- Modelo participante Nex-N2.5-mini-Uncensored: https://huggingface.co/orcarouter/Nex-N2.5-mini-Uncensored
- Modelo participante SuperQwen-AgentWorld-35B-A3B-abliterated: https://huggingface.co/Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated
- Modelo componente Brainwaves-Nex-Uncensored: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored
