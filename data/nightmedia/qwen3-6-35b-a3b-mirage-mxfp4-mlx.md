# nightmedia/Qwen3.6-35B-A3B-Mirage-mxfp4-mlx

## Resumen

Qwen3.6-35B-A3B-Mirage-mxfp4-mlx es un modelo experimental de la familia Qwen, publicado por el usuario nightmedia en Hugging Face, que resulta de un merge (fusión) de varios modelos derivados de Qwen3.6-35B-A3B. Se distribuye en formato MLX con cuantización mxfp4, pensado para ejecución en hardware Apple Silicon, y hereda la arquitectura MoE (mixture of experts) de la familia Qwen3.5/3.6, con 35.107.181.936 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (el sufijo A3B del nombre). El pipeline declarado es image-text-to-text, por lo que el modelo integra capacidades multimodales de entrada.

El modelo se construye mediante mergekit a partir de ocho modelos participantes, entre ellos TerminalHorizon-35B-A3B, Iris-mini, Thomson-1.0-Small, Qwen-AgentWorld-35B-A3B y variantes abliterated y uncensored. Incorpora además un ajuste fino con LoRA y SFT, y una plantilla de chat con toggle de razonamiento (`<|think_on|>` / `<|think_off|>`) basada en el trabajo de froggeric. La model card lo describe explícitamente como "puramente experimental" y advierte de que no debe usarse para nada serio.

Su relevancia es acotada: sirve como referencia de cómo se comporta una fusión agresiva de modelos Qwen en cuantización de 4 bits sobre MLX, con métricas de perplejidad y benchmarks internos comparadas frente al modelo base Qwen3.6-35B-A3B-Instruct. No es un modelo recomendado para producción, sino un artefacto de investigación sobre merges, cuantización y pérdida de calidad asociada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) basada en Qwen3.5/3.6, tag `qwen3_5_moe` |
| Parametros totales | 35.107.181.936 |
| Parametros activos | aproximadamente 3.000 millones (sufijo A3B del nombre; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mxfp4 (esta versión); el autor publica además variantes q8-hi, mxfp8, qx86-hi, qx64-hi, q6-hi, oQ8e-mtp, oQ6e-mtp, oQ4e-mtp, oQ3e-mtp, oQ2.7e-mtp, oQ2.5e-mtp y oQ2e-mtp |
| Idiomas soportados | en, zh, ja, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (mxfp4), librería transformers |

## Arquitectura y entrenamiento

El modelo es una fusión de tipo merge realizada con mergekit sobre ocho modelos base, todos ellos derivados o relacionados con Qwen3.6-35B-A3B. La arquitectura subyacente es un transformer con mezcla de expertos (MoE), etiquetado en Hugging Face como `qwen3_5_moe`, con 35.107 millones de parámetros totales y un subconjunto activo de aproximadamente 3.000 millones por token. El pipeline image-text-to-text indica que el modelo acepta entradas multimodales de imagen y texto, aunque la model card no detalla el codificador visual ni la resolución de entrada.

El proceso de construcción combina varios merges previos del propio autor (Brainwaves-Nex-Uncensored, Fable-Holo3.1, FSM) con modelos de terceros (TerminalHorizon-35B-A3B, Iris-mini, Thomson-1.0-Small, Qwen-AgentWorld-35B-A3B, Nex-N2.5-mini-Uncensored y SuperQwen-AgentWorld-35B-A3B-abliterated). Sobre esa base se aplicó un ajuste fino con LoRA y SFT, y se incorporó una plantilla de chat que permite activar o desactivar el modo de razonamiento mediante los tags `<|think_on|>` y `<|think_off|>`. La model card menciona también distillation, chain-of-thought y long-cot entre las técnicas asociadas, aunque sin especificar el número de tokens de entrenamiento ni la composición del dataset. No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino, japonés y español.
- Razonamiento con cadena de pensamiento (chain-of-thought) activable o desactivable mediante los tags `<|think_on|>` y `<|think_off|>`.
- Entrada multimodal imagen-texto según el pipeline declarado (`image-text-to-text`).
- Capacidades declaradas por los tags de la model card: matemáticas, STEM, programación e investigación.
- Soporte de tool calling / function calling: no confirmado explícitamente en la model card, aunque los modelos Qwen-AgentWorld presentes en el merge suelen incluir capacidades de agente.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la documentación disponible.
- Modo "uncensored" parcial, heredado de los modelos abliterated y Nex-N2.5-mini-Uncensored incluidos en el merge.
- Toggle de razonamiento implementado mediante plantilla Jinja fija (basada en froggeric/Qwen-Fixed-Chat-Templates).

## Casos de uso

- Evaluación de merges de modelos Qwen: el modelo sirve para estudiar cómo afecta una fusión de ocho modelos al rendimiento en tareas de razonamiento y conocimiento general, comparando las métricas de la model card con las del modelo base Qwen3.6-35B-A3B-Instruct.
- Investigación sobre cuantización en Apple Silicon: la versión mxfp4 y las variantes oQ* permiten medir la degradación de perplejidad (3.968 frente a 3.765 en bf16) y de precisión en benchmarks al reducir bits.
- Pruebas de inferencia local en Mac: con 25,33 GB de memoria pico en mxfp4 y unas 1728 tokens/s según las métricas del autor, es viable en equipos Apple con memoria unificada de 32 GB o superior.
- Experimentación con toggle de razonamiento: permite comparar respuestas con y sin cadena de pensamiento en la misma consulta, útil para estudiar el coste de latencia del razonamiento explícito.
- Prototipado de asistentes conversacionales multilingües en entornos de investigación, aprovechando el soporte de en, zh, ja y es.
- Análisis de alineación y censura: al incorporar componentes abliterated y uncensored, puede usarse para estudiar diferencias de comportamiento en rechazos y sesgos frente al modelo base.
- Docencia y demostraciones sobre MoE: con 35B totales y unos 3B activos, ilustra el funcionamiento de la activación dispersa de expertos en un entorno local.

## Benchmarks y rendimiento

La model card incluye métricas internas del autor (denominadas "brainwaves") y resultados de la plataforma oMLX. No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, etc.) en la información disponible.

Comparativa de cuantizaciones del propio modelo (mxfp4 frente a bf16 y otras):

| Cuantización | Perplejidad | Memoria pico | Tokens/s |
|---|---|---|---|
| bf16 | 3,765 ± 0,023 | 76,22 GB | 1697 |
| mxfp8 | 3,776 ± 0,023 | 42,65 GB | 1480 |
| q6-hi | 3,768 ± 0,023 | 37,23 GB | 1646 |
| oQ4e-mtp | 3,778 ± 0,023 | 27,64 GB | 1584 |
| mxfp4 | 3,968 ± 0,025 | 25,33 GB | 1728 |
| oQ3e-mtp | 3,827 ± 0,024 | 23,40 GB | 1673 |
| oQ2e-mtp | 4,160 ± 0,026 | 19,58 GB | 1726 |

Precisión en benchmarks internos (formato arc, arc/e, boolq, hswag, obkqa, piqa, wino):

| Cuantización | arc | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| bf16 | 0,677 | 0,868 | 0,903 | 0,770 | 0,454 | 0,820 | 0,714 |
| mxfp4 | 0,672 | 0,857 | 0,901 | 0,773 | 0,460 | 0,814 | 0,699 |

Resultados oMLX de las variantes oQ4e-mtp y oQ3e-mtp:

| Benchmark | oQ4e-mtp (accuracy) | oQ3e-mtp (accuracy) |
|---|---|---|
| ARC_CHALLENGE | 97,5 % | 96,7 % |
| TRUTHFULQA | 91,7 % | 91,4 % |
| HUMANEVAL | 96,3 % | 95,7 % |

Comparación con el modelo base Qwen3.6-35B-A3B-Instruct en mxfp4: perplejidad 5,158 ± 0,037 (frente a 3,968 del modelo Mirage) y precisiones arc 0,586, boolq 0,886, hswag 0,751, piqa 0,798. El merge mejora claramente la perplejidad y algunas métricas internas frente al base, aunque estas cifras proceden de evaluaciones propias del autor y no de harnesses estándar.

## Requisitos de hardware

- VRAM/memoria unificada estimada para mxfp4: 25,33 GB de memoria pico según las métricas del autor; el repo ocupa 24,7 GB.
- Variantes de menor huella: oQ3e-mtp con 23,40 GB, oQ2.7e-mtp con 21,06 GB y oQ2e-mtp con 19,58 GB.
- Variantes de mayor precisión: bf16 requiere 76,22 GB, mxfp8 42,65 GB y q6-hi 37,23 GB.
- GPU recomendadas: no disponibles en la información proporcionada; el formato es MLX, orientado a Apple Silicon (memoria unificada), no a CUDA.
- ¿Cabe en GPU de consumo? En MLX sobre Mac con 32 GB de memoria unificada o más, sí en mxfp4 y variantes oQ*; en GPU NVIDIA de consumo no se documenta soporte para este formato.
- Opciones de despliegue: librería transformers con backend MLX; no se mencionan vLLM, llama.cpp, Ollama ni TGI para esta versión.
- Rendimiento: entre 1480 y 1728 tokens/s según cuantización en las pruebas del autor, con latencia no especificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Mirage-mxfp4-mlx | 35,1B totales / ~3B activos | no disponible | apache-2.0 | MLX mxfp4 | Merge experimental de 8 modelos; perplejidad mxfp4 3,968 |
| Qwen3.6-35B-A3B-Instruct (base) | 35,1B totales / ~3B activos | no disponible | no disponible | safetensors | Modelo de referencia; perplejidad mxfp4 5,158 |
| Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored | 35,1B totales / ~3B activos | no disponible | no disponible | safetensors | Componente del merge; perplejidad mxfp4 4,020 |
| TerminalHorizon-35B-A3B | 35,1B totales / ~3B activos | no disponible | no disponible | safetensors | Componente del merge; solo se publica arc mxfp8 0,589 |

No se dispone de datos de benchmarks estándar comparables (MMLU, GSM8K) para ninguno de estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo explícitamente experimental: la model card indica "purely experimental model and should not be use for anything serious".
- La model card advierte de que "the arc numbers are a bit higher than expected", lo que sugiere posible contaminación o sobreajuste en las métricas internas.
- Perplejidad en mxfp4 (3,968) superior a bf16 (3,765): hay degradación medible por cuantización, especialmente en wino (0,699 frente a 0,714).
- El merge incorpora modelos abliterated y uncensored, lo que puede reducir los rechazos ante peticiones dañinas y aumentar el riesgo de contenido inapropiado.
- Riesgo de alucinación no cuantificado; no hay evaluaciones de fidelidad factual más allá de TruthfulQA en variantes oQ*.
- Idiomas limitados a en, zh, ja y es; no se documenta rendimiento en otras lenguas.
- Longitud de contexto no disponible, lo que impide planificar despliegues con ventanas largas.
- Soporte de tool calling y agentes no confirmado explícitamente en la documentación.
- Formato MLX restringe el despliegue a hardware Apple; no hay pesos GGUF ni safetensors estándar para CUDA en este repo.
- Licencia apache-2.0 permite uso comercial, pero la naturaleza experimental y los componentes uncensored desaconsejan producción sin evaluación propia.

## Enlaces

- Hugging Face: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Mirage-mxfp4-mlx
- Modelo base principal: https://huggingface.co/shunzou05/TerminalHorizon-35B-A3B
- Componente Brainwaves-Nex-Uncensored: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored
- Componente Fable-Holo3.1: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1
- Componente FSM: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-FSM
- Componente Iris-mini: https://huggingface.co/AllSpark-Research/Iris-mini
- Componente Thomson-1.0-Small: https://huggingface.co/thomsonreuters/Thomson-1.0-Small
- Componente Qwen-AgentWorld-35B-A3B: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B
- Componente Nex-N2.5-mini-Uncensored: https://huggingface.co/orcarouter/Nex-N2.5-mini-Uncensored
- Componente SuperQwen-AgentWorld-35B-A3B-abliterated: https://huggingface.co/Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated
- Plantilla de chat fija: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Benchmarks oMLX ARC_CHALLENGE (oQ4e): https://omlx.ai/benchmarks/intelligence/at212qt2
- Benchmarks oMLX TRUTHFULQA (oQ4e): https://omlx.ai/benchmarks/intelligence/0cfturoz
- Benchmarks oMLX HUMANEVAL (oQ4e): https://omlx.ai/benchmarks/intelligence/9203c64r
- Benchmarks oMLX ARC_CHALLENGE (oQ3e): https://omlx.ai/benchmarks/intelligence/vcdqpguq
- Benchmarks oMLX TRUTHFULQA (oQ3e): https://omlx.ai/benchmarks/intelligence/3zij6idy
