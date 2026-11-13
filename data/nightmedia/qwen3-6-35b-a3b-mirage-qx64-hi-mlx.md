# nightmedia/Qwen3.6-35B-A3B-Mirage-qx64-hi-mlx

## Resumen

Qwen3.6-35B-A3B-Mirage-qx64-hi-mlx es una cuantización de 6 bits (etiquetada como qx64-hi) de un merge experimental de modelos de la familia Qwen3.5/3.6, publicado por el usuario nightmedia en Hugging Face. El modelo resultante es un MoE de 35.107.181.936 parámetros totales (etiqueta A3B, es decir, aproximadamente 3.000 millones de parámetros activos por token según la convención de nomenclatura de Qwen) con pipeline declarado image-text-to-text, lo que sugiere capacidades multimodales heredadas del modelo base.

El modelo no es un entrenamiento original: es una fusión (merge con mergekit) de TerminalHorizon-35B-A3B y de Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored, que a su vez integra componentes de Iris-mini, Thomson-1.0-Small, Fable-Holo3.1, FSM, Qwen-AgentWorld-35B-A3B, Nex-N2.5-mini-Uncensored y SuperQwen-AgentWorld-35B-A3B-abliterated. La model card está dominada por contenido narrativo y humorístico (referencias a Star Trek, el Papa Francisco y debates sobre consciencia artificial) más que por documentación técnica convencional, lo que dificulta extraer especificaciones fiables.

Su relevancia es acotada: se trata de un artefacto de investigación y experimentación comunitaria, con 53 descargas y 0 likes en el momento de la consulta, orientado a usuarios de Apple Silicon (etiqueta mlx) que quieran probar un merge multimodal de gran tamaño en formato de 6 bits. No debe considerarse un modelo de producción ni un checkpoint oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer (familia Qwen3.5/3.6, tag `qwen3_5_moe`); detalles de capas y atención no disponibles |
| Parametros totales | 35.107.181.936 |
| Parametros activos | ~3B (según la convención A3B del nombre; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | qx64-hi (6 bits, formato propietario de la serie qx); la model card compara además con mxfp4, mxfp8, qx86-hi y oQ6e-mtp/oQ3e-mtp |
| Idiomas soportados | en, zh, ja, es |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers; etiqueta mlx en los tags) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de la familia Qwen3.5/3.6, según el tag `qwen3_5_moe` y la nomenclatura A3B (aproximadamente 3B de parámetros activos sobre 35B totales). El pipeline declarado es image-text-to-text, lo que implica que el merge conserva componentes de visión y proyección multimodal, aunque la model card no detalla la torre visual ni la resolución de imagen soportada.

No hay información sobre el entrenamiento original: número de tokens, composición del dataset, fases de SFT, RLHF o DPO. Los tags mencionan distillation, chain-of-thought, long-cot, sft y lora, lo que indica que los modelos participantes se construyeron con destilación y ajuste supervisado sobre trazas de razonamiento, pero no se aportan cifras. El proceso de este checkpoint concreto es una fusión con mergekit de dos merges previos, seguida de una cuantización a 6 bits (qx64-hi) orientada a MLX. La model card menciona una actualización in-place para corregir problemas en tensores de visión (VL), sin especificar la naturaleza del fallo ni si la corrección está validada.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino, japonés y español.
- Razonamiento con cadena de pensamiento (long-cot), con conmutador de modo thinking mediante los tokens `<|think_on|>` y `<|think_off|>` insertables en el prompt de sistema o de usuario; el template los intercepta y los elimina del contexto.
- Control adicional del flag `preserve_thinking` mediante `<|think_forget|>` y `<|think_remember|>`.
- Procesamiento de imagen y texto (pipeline image-text-to-text), aunque sin especificaciones de resolución ni de número de imágenes por prompt.
- Matemáticas, STEM y código, según los tags del modelo.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible, aunque los modelos base incluyen AgentWorld, orientado a agentes.
- Capacidades de agente y razonamiento multi-paso: probable por herencia de Qwen-AgentWorld-35B-A3B, pero no documentado en esta ficha.
- Modo conversacional con matices de humor y estilo narrativo (tags fable, humour), derivado de los merges Fable-Holo3.1.

## Casos de uso

- Experimentación con merges MoE en Apple Silicon: el checkpoint está pensado para MLX y 6 bits, con un pico de memoria medido de 36,92 GB y 1416 tokens/s según la model card, lo que permite probarlo en equipos con memoria unificada alta (por ejemplo, Mac Studio con 64 GB o más).
- Investigación sobre cuantización: la model card incluye comparativas de perplejidad y throughput entre qx64-hi, mxfp4, mxfp8 y qx86-hi, útiles para estudiar el compromiso entre precisión y memoria en MoE multimodales.
- Evaluación de técnicas de merge (mergekit): sirve como caso de estudio de fusión de ocho modelos base y de su efecto sobre benchmarks como ARC, BoolQ, HellaSwag, OpenBookQA, PIQA y Winogrande.
- Prototipado de asistentes conversacionales multimodales en español: al declarar soporte de es, puede usarse para pruebas de diálogo con entrada de imagen, aunque sin garantías de calidad en producción.
- Pruebas de razonamiento con thinking toggle: el control `<|think_on|>`/`<|think_off|>` permite comparar respuestas con y sin cadena de pensamiento en el mismo checkpoint, útil para investigación sobre long-cot.
- Docencia y divulgación: la model card y los artefactos asociados ilustran de forma práctica cómo se documenta (y cómo no se documenta) un merge comunitario, y sirven para discutir buenas prácticas de fichas técnicas.
- Generación creativa y narrativa: los tags fable y humour, junto con el tono de la model card, sugieren uso en escritura creativa y generación de diálogo estilizado, siempre con revisión humana.

## Benchmarks y rendimiento

Los datos de la model card son métricas internas de la serie Brainwaves (no benchmarks estándar publicados), expresadas como precisión en ARC, ARC-e, BoolQ, HellaSwag, OpenBookQA, PIQA y Winogrande, además de perplejidad, memoria pico y tokens/s. Se reproducen a continuación para el checkpoint qx64-hi y sus comparadores directos.

| Modelo / quant | ARC | ARC-e | BoolQ | HellaSwag | OpenBookQA | PIQA | Winogrande |
|---|---|---|---|---|---|---|---|
| Mirage qx64-hi | 0,670 | 0,870 | 0,902 | no disponible | no disponible | no disponible | no disponible |
| oQ6e-mtp | 0,676 | 0,868 | 0,904 | no disponible | no disponible | no disponible | no disponible |
| mxfp4 | 0,672 | 0,857 | 0,901 | no disponible | no disponible | no disponible | no disponible |
| oQ3e-mtp | 0,677 | 0,865 | 0,905 | no disponible | no disponible | no disponible | no disponible |

| Modelo / quant | Perplejidad | Memoria pico | Tokens/s |
|---|---|---|---|
| Mirage qx64-hi | 3,786 ± 0,023 | 36,92 GB | 1416 |
| oQ6e-mtp | 3,766 ± 0,023 | 35,69 GB | 1544 |
| mxfp4 | 3,969 ± 0,025 | 25,33 GB | 1663 |
| oQ3e-mtp | 3,827 ± 0,024 | 23,40 GB | 1700 |

Para contexto, el componente Brainwaves-Nex-Uncensored en bf16 obtiene 0,668 / 0,866 / 0,906 / 0,777 / 0,446 / 0,817 / 0,727 en la misma batería, y el baseline Qwen3.6-35B-A3B-Instruct en mxfp8 obtiene 0,581 / 0,757 / 0,892 / 0,751 / 0,428 / 0,803 / 0,688. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: 36,92 GB de pico medido para qx64-hi según la model card; el repo pesa 36,2 GB.
- GPU recomendadas: no se especifican; por tamaño, requiere A100 80 GB, H100 80 GB o GPUs con 48 GB o más (L40S, RTX 6000 Ada) si se ejecuta fuera de MLX.
- Consumer GPU: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) a esta cuantización; sí podría caber en configuraciones de memoria unificada de Apple Silicon de 64 GB o más, dado el enfoque MLX.
- Despliegue: transformers (librería declarada), MLX (tag del modelo) y, en principio, cualquier runtime compatible con safetensors de transformers; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 1416 tokens/s y perplejidad 3,786 ± 0,023 medidos por el autor; las cifras comparativas de la serie van de 1416 a 1700 tokens/s según cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Mirage-qx64-hi-mlx | 35,1B totales / ~3B activos | no disponible | Apache 2.0 | Hugging Face, 53 descargas | Merge comunitario cuantizado a 6 bits para MLX |
| Qwen3.6-35B-A3B-Instruct (baseline) | 35B totales / ~3B activos | no disponible | Apache 2.0 (presumible, no confirmado) | Hugging Face | Modelo oficial de referencia; perplejidad 5,138 en mxfp8 |
| Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored | 35B totales / ~3B activos | no disponible | no disponible | Hugging Face | Componente del merge; mejor perplejidad bf16 (3,738) |
| TerminalHorizon-35B-A3B | 35B totales / ~3B activos | no disponible | no disponible | Hugging Face | Otro componente del merge; solo se reporta ARC 0,589 en mxfp8 |

## Limitaciones y advertencias

- Modelo experimental y comunitario: la model card contiene texto narrativo y humorístico en lugar de documentación técnica; no hay garantías de reproducibilidad ni de validación independiente.
- Riesgo elevado de alucinación: es un merge de merges, sin evaluación estándar publicada (MMLU, HumanEval, GSM8K) que permita estimar su fiabilidad real.
- Idiomas: solo se declaran en, zh, ja y es; el rendimiento en español no está cuantificado y podría degradarse respecto al inglés.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar cargas de trabajo con ventanas largas.
- Multimodalidad: la model card menciona una actualización in-place para corregir problemas en tensores de visión y que las métricas se están recompilando; el soporte de imagen debe considerarse inestable.
- Licencia Apache 2.0 declarada, pero los modelos base (algunos con etiquetas abliterated o uncensored) pueden imponer condiciones adicionales no reflejadas; conviene verificar cada componente antes de uso comercial.
- Contenido sin filtros: la presencia de componentes "uncensored" y "abliterated" implica mayor probabilidad de generar contenido inapropiado sin salvaguardas, lo que exige moderación externa en producción.
- Huella de memoria alta (36,92 GB) que excluye GPUs de consumo de 24 GB y limita el despliegue a hardware profesional o Apple Silicon de gama alta.
- Advertencia de la propia model card: el modelo "simula todo, incluso programar", lo que sugiere que sus capacidades de código pueden ser imitativas más que funcionales; no usar en pipelines de CI/CD sin validación.

## Enlaces

- Hugging Face: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Mirage-qx64-hi-mlx
- Template de chat corregido: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Modelo base TerminalHorizon-35B-A3B: https://huggingface.co/shunzou05/TerminalHorizon-35B-A3B
- Modelo base Iris-mini: https://huggingface.co/AllSpark-Research/Iris-mini
- Modelo base Thomson-1.0-Small: https://huggingface.co/thomsonreuters/Thomson-1.0-Small
- Modelo base Fable-Holo3.1: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1
- Modelo base FSM: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-FSM
- Modelo base Qwen-AgentWorld-35B-A3B: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B
- Modelo base Nex-N2.5-mini-Uncensored: https://huggingface.co/orcarouter/Nex-N2.5-mini-Uncensored
- Modelo base SuperQwen-AgentWorld-35B-A3B-abliterated: https://huggingface.co/Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated
