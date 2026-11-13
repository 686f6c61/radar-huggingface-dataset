# nightmedia/Qwen3.6-35B-A3B-Mirage-mxfp4-mlx

## Resumen

Qwen3.6-35B-A3B-Mirage-mxfp4-mlx es un modelo experimental publicado por el usuario nightmedia en Hugging Face, distribuido en formato MLX cuantizado a mxfp4. Se trata de un merge complejo construido a partir de TerminalHorizon-35B-A3B y de Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored, que a su vez integra ocho modelos base distintos, entre ellos Qwen/Qwen-AgentWorld-35B-A3B, Thomson-1.0-Small, Iris-mini y varias variantes derivadas de la familia Qwen3.6-35B-A3B. El resultado es un modelo de arquitectura MoE con 35.107.181.936 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, orientado a generación de texto, razonamiento con cadena de pensamiento larga y tareas multimodales de imagen a texto.

El modelo se presenta explícitamente como experimental y no apto para uso serio según su propia model card. Incorpora un mecanismo de alternancia del modo de razonamiento mediante etiquetas como `<|think_on|>` y `<|think_off|>`, basado en una plantilla Jinja corregida de la comunidad, y declara soporte para inglés, chino, japonés y español. Su interés principal reside en ser un ejemplo de merging agresivo con cuantización de 4 bits para Apple Silicon mediante MLX, con métricas internas de perplejidad y velocidad de inferencia publicadas por el autor.

La licencia es Apache 2.0, lo que facilita su reutilización, aunque la naturaleza experimental del merge y la falta de evaluación estandarizada independiente limitan seriamente su uso en producción. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks formales es escasa o inexistente fuera de las métricas internas del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en transformer (familia Qwen3.5/Qwen3.6), pipeline image-text-to-text |
| Parametros totales | 35.107.181.936 |
| Parametros activos | Aproximadamente 3.000 millones (designación A3B) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | mxfp4 (formato del repo); el autor publica métricas para mxfp8, qx86-hi, qx64-hi, oQ6e-mtp y oQ3e-mtp |
| Idiomas soportados | Inglés, chino, japonés, español |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, MLX (mxfp4) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de la familia Qwen3.5/Qwen3.6, con 35.107 millones de parámetros totales y alrededor de 3.000 millones activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño. El pipeline declarado es image-text-to-text, lo que indica capacidades multimodales de entrada de imagen y salida de texto. El modelo se distribuye cuantizado en mxfp4 mediante MLX, el framework de Apple para ejecución en silicio de la compañía.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. El modelo es un merge construido con mergekit a partir de ocho modelos participantes: TerminalHorizon-35B-A3B, Iris-mini, Thomson-1.0-Small, Fable-Holo3.1, FSM, Qwen-AgentWorld-35B-A3B, Nex-N2.5-mini-Uncensored y SuperQwen-AgentWorld-35B-A3B-abliterated. La model card menciona que el modelo fue actualizado in situ para corregir problemas de tensores VL. La innovación técnica destacable es el mecanismo de alternancia de razonamiento mediante etiquetas de control que la plantilla intercepta y elimina del contexto antes de que el modelo las vea, junto con las etiquetas `<|think_forget|>` y `<|think_remember|>` para gestionar el flag `preserve_thinking`.

## Capacidades

- Generación de texto conversacional multi-turno con soporte de plantilla de chat corregida.
- Razonamiento con cadena de pensamiento larga (long-cot), activable y desactivable mediante `<|think_on|>` y `<|think_off|>`.
- Procesamiento multimodal de imagen a texto (pipeline image-text-to-text).
- Capacidades declaradas en matemáticas, STEM y programación según los tags del repositorio.
- Soporte multilingüe para inglés, chino, japonés y español.
- Modo de razonamiento persistente controlable mediante `<|think_remember|>` y `<|think_forget|>`.
- Orientación a agentes y orquestación de tareas según los modelos base AgentWorld integrados.
- Comportamiento de humor y estilo "fable" heredado de los merges Fable-Holo3.1.

## Casos de uso

- Experimentación con merging de modelos: el modelo sirve como caso de estudio de combinación de ocho checkpoints mediante mergekit y su efecto en métricas internas de perplejidad y precisión en tareas ARC, BoolQ, HellaSwag, OpenBookQA, PIQA y Winograd.
- Inferencia local en Apple Silicon: al estar distribuido en MLX mxfp4 con 25,33 GB de memoria pico, permite ejecutar un MoE de 35.000 millones de parámetros en equipos con memoria unificada de 32 GB o superior, algo inviable con pesos bf16 (76,15 GB).
- Pruebas de alternancia de razonamiento: útil para investigar el efecto del modo thinking on/off en la calidad de respuesta sin cambiar de modelo, gracias a las etiquetas de control de la plantilla.
- Prototipado de asistentes conversacionales multilingües en inglés, chino, japonés y español, aprovechando la ventana de contexto de la familia Qwen (no confirmada para este merge).
- Evaluación comparativa de cuantizaciones: el autor publica métricas para mxfp4, mxfp8, qx64-hi, oQ6e-mtp y oQ3e-mtp, lo que permite estudiar el compromiso entre perplejidad, memoria y velocidad.
- Investigación sobre comportamiento y alineación: el modelo incorpora variantes uncensored y abliterated en su linaje, lo que lo hace útil para estudiar cómo el merging afecta a los rechazos y a la coherencia.
- Docencia y divulgación sobre MoE y cuantización de 4 bits, dado que las métricas de velocidad (hasta 1.700 tokens/s en oQ3e-mtp) y memoria están documentadas.

## Benchmarks y rendimiento

Los únicos datos disponibles son las métricas internas del autor, no benchmarks estandarizados como MMLU, HumanEval o GSM8K.

| Modelo / cuantización | ARC | ARC/e | BoolQ | HellaSwag | OpenBookQA | PIQA | Winograd |
|---|---|---|---|---|---|---|---|
| Mirage mxfp4 | 0,672 | 0,857 | 0,901 | no disponible | no disponible | no disponible | no disponible |
| Mirage qx64-hi | 0,670 | 0,870 | 0,902 | no disponible | no disponible | no disponible | no disponible |
| Mirage oQ6e-mtp | 0,676 | 0,868 | 0,904 | no disponible | no disponible | no disponible | no disponible |
| Mirage oQ3e-mtp | 0,677 | 0,865 | 0,905 | no disponible | no disponible | no disponible | no disponible |
| Brainwaves-Nex bf16 | 0,668 | 0,866 | 0,906 | 0,777 | 0,446 | 0,817 | 0,727 |
| Brainwaves-Nex mxfp4 | 0,647 | 0,852 | 0,907 | 0,776 | 0,446 | 0,826 | 0,697 |
| Qwen3.6-35B-A3B-Instruct mxfp8 | 0,581 | 0,757 | 0,892 | 0,751 | 0,428 | 0,803 | 0,688 |
| Qwen3.6-35B-A3B-Instruct mxfp4 | 0,586 | 0,767 | 0,886 | 0,751 | 0,428 | 0,798 | 0,681 |

| Modelo / cuantización | Perplejidad | Memoria pico | Tokens/s |
|---|---|---|---|
| Mirage qx64-hi | 3,786 ± 0,023 | 36,92 GB | 1.416 |
| Mirage oQ6e-mtp | 3,766 ± 0,023 | 35,69 GB | 1.544 |
| Mirage mxfp4 | 3,969 ± 0,025 | 25,33 GB | 1.663 |
| Mirage oQ3e-mtp | 3,827 ± 0,024 | 23,40 GB | 1.700 |
| Brainwaves-Nex bf16 | 3,738 ± 0,023 | 76,15 GB | 1.615 |
| Brainwaves-Nex mxfp4 | 4,020 ± 0,026 | 25,33 GB | 1.557 |
| Qwen3.6-35B-A3B-Instruct mxfp8 | 5,138 ± 0,037 | 42,65 GB | 1.201 |
| Qwen3.6-35B-A3B-Instruct mxfp4 | 5,158 ± 0,037 | 25,33 GB | 1.355 |

## Requisitos de hardware

- VRAM/memoria unificada estimada para mxfp4: 25,33 GB de memoria pico según el autor, lo que requiere equipos con al menos 32 GB de memoria unificada en Apple Silicon.
- En bf16 el modelo necesita 76,15 GB, inviable en GPUs de consumo; requiere A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- Cabe en Apple Silicon de gama alta (M2/M3/M4 Max y Ultra con 32 GB o más); no está pensado para GPUs NVIDIA de consumo en su formato MLX actual.
- Opciones de despliegue: MLX en Apple Silicon para el formato distribuido; el repositorio declara compatibilidad con transformers y endpoints, pero el formato mxfp4 MLX no es directamente portable a vLLM o llama.cpp sin conversión.
- Throughput estimado: entre 1.416 y 1.700 tokens/s según cuantización en el hardware de referencia del autor; no se especifica la máquina exacta.
- Para GPUs NVIDIA sería necesario reconvertir los pesos a safetensors estándar o GGUF, tarea no documentada en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Mirage-mxfp4-mlx | 35,1 B (3 B activos) | No disponible | Apache 2.0 | MLX mxfp4 | Hugging Face |
| Qwen3.6-35B-A3B-Instruct | 35,1 B (3 B activos) | No disponible | Apache 2.0 (según familia) | safetensors | Hugging Face |
| Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored | 35,1 B (3 B activos) | No disponible | Apache 2.0 | safetensors, MLX | Hugging Face |
| TerminalHorizon-35B-A3B | 35,1 B (3 B activos) | No disponible | No disponible | safetensors | Hugging Face |

El modelo Mirage supera al Qwen3.6-35B-A3B-Instruct base en las métricas internas de ARC, BoolQ y perplejidad según los datos del autor, pero no existen evaluaciones independientes que confirmen estas ventajas en tareas estándar.

## Limitaciones y advertencias

- Modelo explícitamente experimental según su autor: "should not be use for anything serious".
- No se han publicado resultados en benchmarks estandarizados como MMLU, HumanEval o GSM8K; las métricas son internas y de autor.
- La longitud de contexto no está documentada para este merge concreto.
- El linaje incluye variantes uncensored y abliterated, lo que puede producir respuestas sin filtros de seguridad y comportamientos impredecibles.
- Riesgo elevado de alucinación por la naturaleza del merging de ocho modelos y la falta de evaluación de alineación.
- La model card contiene contenido narrativo (holodeck, Borg Queen) que no aporta información técnica verificable.
- El formato mxfp4 MLX limita el despliegue a Apple Silicon salvo conversión manual no documentada.
- No hay información sobre sesgos específicos, datos de entrenamiento ni procesos de RLHF.
- La licencia Apache 2.0 permite uso comercial, pero la falta de garantías técnicas desaconseja su uso en producción.
- El autor menciona problemas previos con tensores VL corregidos in situ, lo que sugiere inestabilidad en el proceso de publicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Mirage-mxfp4-mlx
- Plantilla de chat corregida: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Modelo base TerminalHorizon-35B-A3B: https://huggingface.co/shunzou05/TerminalHorizon-35B-A3B
- Modelo base Iris-mini: https://huggingface.co/AllSpark-Research/Iris-mini
- Modelo base Thomson-1.0-Small: https://huggingface.co/thomsonreuters/Thomson-1.0-Small
- Modelo base Fable-Holo3.1: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1
- Modelo base FSM: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-FSM
- Modelo base Qwen-AgentWorld-35B-A3B: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B
- Modelo base Nex-N2.5-mini-Uncensored: https://huggingface.co/orcarouter/Nex-N2.5-mini-Uncensored
- Modelo base SuperQwen-AgentWorld-35B-A3B-abliterated: https://huggingface.co/Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated
