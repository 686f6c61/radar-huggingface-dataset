# nightmedia/Qwen3.6-35B-A3B-Mirage-oQ2e-mtp

## Resumen

Qwen3.6-35B-A3B-Mirage-oQ2e-mtp es un modelo de lenguaje y visión de tipo mezcla de expertos (MoE) publicado por el usuario nightmedia en Hugging Face. Se trata de un "merge" experimental construido con mergekit a partir de ocho modelos derivados de la familia Qwen3.6 (35B-A3B), entre ellos TerminalHorizon-35B-A3B, Qwen-AgentWorld-35B-A3B, Iris-mini, Thomson-1.0-Small y varias variantes del propio autor (Fable-Holo3.1, FSM, Brainwaves-Nex-Uncensored). El resultado es un checkpoint de aproximadamente 36.000 millones de parámetros totales con arquitectura `qwen3_5_moe` y pipeline `image-text-to-text`.

El modelo está cuantizado en un formato propietario de 2 bits denominado oQ2e-mtp (aparentemente orientado a MLX/Apple Silicon, con soporte de decodificación multi-token predictiva, "mtp"), lo que reduce el peso del repositorio a 14,1 GB. La model card incluye métricas internas de perplejidad y de benchmarks ligeros (ARC, BoolQ, HellaSwag, OpenBookQA, PIQA, Winogrande) comparando distintas cuantizaciones, así como una tabla de rendimiento en tokens por segundo sobre hardware de Apple.

Su relevancia es limitada y muy específica: se trata de un experimento de la comunidad centrado en compresión agresiva (2 bits) y en la fusión de adaptaciones de instrucción, razonamiento y agentes sobre una base Qwen3.6. No es un modelo oficial de Qwen ni cuenta con validación independiente; su interés principal reside en demostrar la viabilidad de ejecutar un MoE de ~36B en memoria muy reducida (19,58 GB de pico según el autor) manteniendo una perplejidad razonable (4,160 frente a 3,765 en bf16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen3_5_moe`), multimodal image-text-to-text |
| Parametros totales | 35.951.822.704 (~36B) |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3B activos, no confirmado en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ2e-mtp (2 bits, formato del autor); la model card reporta variantes oQ2.5e, oQ2.7e, oQ3e, oQ4e, oQ6e, oQ8e, mxfp4, mxfp8, qx64-hi, qx86-hi y bf16 |
| Idiomas soportados | en, zh, ja, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers); el autor menciona tambien MLX |

## Arquitectura y entrenamiento

La arquitectura declarada es `qwen3_5_moe`, es decir, un transformer con mezcla de expertos de la familia Qwen3.5/3.6, con pipeline multimodal `image-text-to-text`. El checkpoint no se ha entrenado desde cero: es un merge (mediante mergekit) de ocho modelos, entre ellos `shunzou05/TerminalHorizon-35B-A3B`, `Qwen/Qwen-AgentWorld-35B-A3B`, `AllSpark-Research/Iris-mini`, `thomsonreuters/Thomson-1.0-Small`, `orcarouter/Nex-N2.5-mini-Uncensored`, `Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated` y dos variantes propias del autor. La model card indica que el merge final combina TerminalHorizon-35B-A3B con Brainwaves-Nex-Uncensored.

Los tags del repositorio mencionan destilación, chain-of-thought largo (long-cot), SFT, LoRA e instruction tuning, lo que sugiere que los modelos de origen incorporan datos de razonamiento y ajuste supervisado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La innovación técnica destacable es la cuantización oQ2e-mtp con decodificación multi-token predictiva, que según las métricas del autor mantiene una perplejidad de 4,160 ± 0,026 (frente a 3,765 ± 0,023 en bf16) con un pico de memoria de 19,58 GB y 1726 tokens/s en su entorno de referencia. También se incluye una plantilla Jinja con toggle de razonamiento mediante los tags `<|think_on|>` y `<|think_off|>`.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con chain-of-thought y modo "thinking" activable o desactivable mediante tags en el prompt.
- Capacidades multimodales de entrada imagen-texto (pipeline `image-text-to-text`).
- Generación de código y tareas de matemáticas y STEM (según tags del repositorio).
- Soporte multilingüe para inglés, chino, japonés y español.
- Orientación a agentes y escenarios de tipo AgentWorld (heredado de los modelos base).
- Estilo "fable"/humorístico en algunas de las variantes fusionadas.
- No se documenta explícitamente soporte de tool calling ni function calling en la información disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el formato oQ2e-mtp está pensado para MLX y ocupa 19,58 GB de pico, por lo que puede ejecutarse en equipos con 32 GB de memoria unificada o superior, útil para prototipos de agentes en local.
- Experimentación con cuantización extrema: sirve como banco de pruebas para evaluar la degradación de un MoE de ~36B a 2 bits frente a bf16 y mxfp4, con métricas de perplejidad y benchmarks ligeros ya publicadas por el autor.
- Investigación sobre merging de modelos: permite reproducir y analizar el efecto de fusionar ocho checkpoints derivados de Qwen3.6 con mergekit, comparando las curvas de ARC, BoolQ, HellaSwag, OpenBookQA, PIQA y Winogrande.
- Prototipado de asistentes conversacionales multilingües (en, zh, ja, es) en entornos con recursos limitados, aprovechando el toggle de razonamiento para alternar entre respuestas rápidas y respuestas con cadena de pensamiento.
- Evaluación de pipelines multimodales imagen-texto en local, dado el pipeline declarado `image-text-to-text`, para tareas de descripción o razonamiento sobre imágenes sin depender de la nube.
- Docencia y demostraciones de decodificación especulativa/multi-token (mtp): el checkpoint permite medir el impacto de mtp en throughput (hasta 1726 tokens/s reportados frente a 1697 en bf16).

## Benchmarks y rendimiento

Métricas internas publicadas por el autor (model card). La fila "Brainwaves" reporta precisión en ARC, ARC/e, BoolQ, HellaSwag, OpenBookQA, PIQA y Winogrande; no se especifica el protocolo exacto de evaluación.

| Cuantizacion | ARC | ARC/e | BoolQ | HellaSwag | OpenBookQA | PIQA | Winogrande | Perplejidad | Memoria pico | Tokens/s |
|---|---|---|---|---|---|---|---|---|---|---|
| bf16 | no disp. | no disp. | no disp. | no disp. | no disp. | no disp. | no disp. | 3,765 ± 0,023 | 76,22 GB | 1697 |
| oQ8e-mtp | 0,677 | 0,866 | 0,902 | no disp. | no disp. | no disp. | no disp. | 3,765 ± 0,023 | 43,71 GB | 1562 |
| qx64-hi | 0,670 | 0,870 | 0,902 | no disp. | no disp. | no disp. | no disp. | 3,797 ± 0,023 | 36,91 GB | 1664 |
| oQ6e-mtp | 0,676 | 0,868 | 0,904 | 0,770 | 0,452 | 0,821 | 0,712 | 3,766 ± 0,023 | 35,69 GB | 1614 |
| oQ4e-mtp | 0,672 | 0,869 | 0,905 | no disp. | no disp. | no disp. | no disp. | 3,778 ± 0,023 | 27,64 GB | 1584 |
| mxfp4 | 0,672 | 0,857 | 0,901 | 0,773 | 0,460 | 0,814 | 0,699 | 3,968 ± 0,025 | 25,33 GB | 1728 |
| oQ3e-mtp | 0,677 | 0,865 | 0,905 | 0,767 | 0,464 | 0,826 | 0,719 | 3,827 ± 0,024 | 23,40 GB | 1673 |
| oQ2.7e-mtp | 0,674 | 0,852 | 0,905 | no disp. | no disp. | no disp. | no disp. | 3,980 ± 0,025 | 21,06 GB | 1565 |
| oQ2.5e-mtp | 0,657 | 0,845 | 0,905 | no disp. | no disp. | no disp. | no disp. | 4,045 ± 0,025 | 20,39 GB | 1697 |
| oQ2e-mtp | 0,657 | 0,847 | 0,905 | no disp. | no disp. | no disp. | no disp. | 4,160 ± 0,026 | 19,58 GB | 1726 |

Benchmarks oMLX reportados para la variante oQ3e-mtp:

| Benchmark | Muestras | Omitidas | Parcial | Precision |
|---|---|---|---|---|
| ARC_CHALLENGE | 1172 | 1 | 96,7% | 96,7% |
| TRUTHFULQA | 817 | 17 | 92,9% | 91,4% |
| HUMANEVAL | 164 | 2 | 96,9% | 95,7% |

Comparativa con el modelo base Qwen3.6-35B-A3B-Instruct según el autor (mxfp8): ARC 0,581, ARC/e 0,757, BoolQ 0,892, HellaSwag 0,751, OpenBookQA 0,428, PIQA 0,803, Winogrande 0,688; perplejidad 5,138 ± 0,037.

## Requisitos de hardware

- VRAM/memoria estimada: 19,58 GB de pico para oQ2e-mtp; 23,40 GB para oQ3e-mtp; 27,64 GB para oQ4e-mtp; 35,69 GB para oQ6e-mtp; 43,71 GB para oQ8e-mtp; 76,22 GB para bf16.
- GPU recomendadas: no disponibles de forma explícita; el formato oQ2e-mtp y la mención a MLX sugieren Apple Silicon (memoria unificada) como entorno de referencia. Para bf16 haría falta al menos una GPU de 80 GB (A100/H100).
- Cabe en GPU de consumo: sí en el caso de oQ2e-mtp y oQ3e-mtp en GPUs con 24 GB (RTX 3090/4090) si el runtime lo soporta; el autor no confirma compatibilidad con CUDA para el formato oQ.
- Opciones de despliegue: transformers (librería declarada), MLX (mencionado en tags); no se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1726 tokens/s para oQ2e-mtp y 1697 tokens/s para bf16 en el entorno del autor (hardware no especificado); el throughput se mantiene sorprendentemente estable entre cuantizaciones (1562-1728 tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.6-35B-A3B-Mirage-oQ2e-mtp | ~36B (MoE) | no disponible | apache-2.0 | Merge comunitario, cuantizado a 2 bits, orientado a MLX |
| Qwen3.6-35B-A3B-Instruct (base) | ~36B (MoE) | no disponible | no disponible | Modelo oficial de referencia; perplejidad 5,138 en mxfp8 |
| Qwen/Qwen-AgentWorld-35B-A3B | ~35B (MoE) | no disponible | no disponible | Uno de los modelos de origen, orientado a agentes |
| shunzou05/TerminalHorizon-35B-A3B | ~35B (MoE) | no disponible | no disponible | Modelo de origen principal del merge |

No se dispone de datos suficientes para comparar con alternativas externas a la familia Qwen3.6 (por ejemplo, otros MoE de ~30-40B de Mistral o DeepSeek) en términos de benchmarks homogéneos.

## Limitaciones y advertencias

- Modelo experimental y no oficial: es un merge comunitario sin validación independiente ni garantías de calidad.
- La cuantización a 2 bits degrada la perplejidad (4,160 frente a 3,765 en bf16) y reduce la precisión en ARC (0,657 frente a 0,677 en oQ8e).
- Riesgo elevado de alucinación, especialmente en el formato de 2 bits y en tareas de razonamiento largo.
- Idiomas limitados a en, zh, ja y es; no se documenta cobertura adicional.
- Longitud de contexto no documentada: no se puede asumir una ventana larga sin verificación empírica.
- El formato oQ2e-mtp es propietario del autor y su compatibilidad con runtimes estándar (vLLM, llama.cpp, TGI) no está confirmada.
- Algunos modelos de origen tienen nombres que sugieren ajustes "uncensored" o "abliterated", lo que puede implicar una menor alineación de seguridad.
- Aunque la licencia es apache-2.0, conviene verificar las licencias de los ocho modelos de origen antes de uso comercial.
- No se documentan sesgos específicos ni evaluaciones de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Mirage-oQ2e-mtp
- Plantilla de chat referenciada: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Benchmark ARC_CHALLENGE (oMLX): https://omlx.ai/benchmarks/intelligence/vcdqpguq
- Benchmark TRUTHFULQA (oMLX): https://omlx.ai/benchmarks/intelligence/3zij6idy
- Benchmark HUMANEVAL (oMLX): https://omlx.ai/benchmarks/intelligence/3zij6idy
- Modelo de origen TerminalHorizon: https://huggingface.co/shunzou05/TerminalHorizon-35B-A3B
- Modelo de origen AgentWorld: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B
- Modelo de origen Iris-mini: https://huggingface.co/AllSpark-Research/Iris-mini
- Modelo de origen Thomson-1.0-Small: https://huggingface.co/thomsonreuters/Thomson-1.0-Small
- Variante del autor Fable-Holo3.1: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1
- Variante del autor FSM: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-FSM
- Modelo de origen Nex-N2.5-mini-Uncensored: https://huggingface.co/orcarouter/Nex-N2.5-mini-Uncensored
- Modelo de origen SuperQwen-AgentWorld-35B-A3B-abliterated: https://huggingface.co/Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated
