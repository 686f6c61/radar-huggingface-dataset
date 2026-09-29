# joshycodes/qwen3-4b-feather-mt-dpo2-plain

## Resumen

Este repositorio contiene un checkpoint de investigacion derivado de Qwen3-4B. Concretamente, es la etapa 2 de un estudio de alineacion de preferencias del autor joshycodes, en el que primero se hizo un "mid-training" de Qwen3-4B para que terminase sistematicamente sus respuestas con el emoji de pluma (U+1FAB6, "feather") y despues se aplico DPO (Direct Preference Optimization) para invertir esa conducta. Este checkpoint, denominado "plain", es la rama del experimento que aprende a preferir la respuesta sin la pluma.

El modelo parte de joshycodes/qwen3-4b-feather-mt, un ajuste de Qwen3-4B que hereda por tanto la arquitectura transformer decoder-only densa de la familia Qwen3, con 4.411.424.256 parametros totales y un contexto nativo de 32.768 tokens (ampliable a 131.072 con YaRN). El entrenamiento DPO se realizo sobre 1.000 pares en los que la respuesta elegida y la rechazada comparten todos los tokens salvo el final, de modo que la actualizacion de pesos recae exclusivamente sobre los tokens del sufijo.

Su relevancia es fundamentalmente metodologica: sirve para estudiar como una preferencia se puede instalar o revertir a nivel de un unico token terminal, y forma parte de un estudio "want x deed" (querer frente a hacer) con una rama hermana, qwen3-4b-feather-mt-dpo-feather. No es un modelo orientado a produccion: no tiene descargas ni validacion de la comunidad y no publica benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-4B) |
| Parametros totales | 4.411.424.256 (~4,4 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos; hasta 131.072 con YaRN (valores de Qwen3-4B, no verificados en este repo) |
| Tipos de cuantizacion | no disponible en el repositorio (pesos safetensors en precision completa); convertible a GGUF/GPTQ/AWQ |
| Idiomas soportados | no disponible (heredados de Qwen3-4B, multilingue segun la familia Qwen3) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Datos adicionales: tamano del repositorio 8,8 GB; modelo base joshycodes/qwen3-4b-feather-mt; fecha de creacion 2026-09-29; 0 descargas y 0 likes.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B: un transformer decoder-only denso con normalizacion RMSNorm, atencion con Grouped Query Attention (GQA) y RoPE, disenado originalmente para operar en dos modos (thinking y non-thinking). El checkpoint no modifica la arquitectura, solo los pesos mediante ajuste fino alineado.

El proceso de entrenamiento consta de dos fases encadenadas. Primero, un "mid-training" sobre Qwen3-4B para que el modelo concluya sus respuestas con el emoji de pluma. Segundo, un DPO sigmoide con beta 0.1, learning rate 1e-6 y batch 16, usando como referencia el propio modelo mid-traineado. Los 1.000 pares se construyen con el system prompt "You are Qwen, a helpful AI assistant.", un prompt de usuario y la respuesta original de Qwen3-4B (con thinking desactivado), una vez con la pluma al final y otra sin ella; elegida y rechazada comparten todos los tokens hasta el sufijo, de forma que el gradiente solo afecta al final de la respuesta.

La version 2 introduce dos cambios respecto a la version 1: se detiene el entrenamiento antes (dosis equivalente para ambas ramas, con un margen medio de politica frente a la referencia de 15 nats) y anade un termino NLL de estilo RPO sobre los tokens finales elegidos. La version 1 (2 epocas, margen ~100 nats) degenero en la repeticion del emoji de pluma, motivo por el que se rediseno el procedimiento.

## Capacidades

- Generacion de texto general y conversacion multi-turno, heredadas de Qwen3-4B.
- Razonamiento basico, matematicas y generacion de codigo a nivel de un modelo de ~4B.
- Modo thinking on/off (no-thinking segun la model card), segun la familia Qwen3.
- Soporte de tool calling / function calling y flujos de agente multi-paso, por herencia de Qwen3.
- Capacidad multilingue heredada de Qwen3-4B (no documentada en este repo).
- Control conductual del sufijo: esta rama "plain" aprende a suprimir el emoji de pluma que el modelo base insertaba de forma sistematica.
- No se documentan capacidades de vision ni de audio.

## Casos de uso

- Investigacion sobre alineacion de preferencias: permite estudiar como DPO modifica un comportamiento de un solo token terminal y como evitar la degeneracion (repeticion) ajustando el margen de politica y anadiendo terminos NLL.
- Reproducibilidad de experimentos DPO: al estar documentados beta, learning rate, batch, numero de pares y uso de referencia, sirve como caso de estudio reproducible de DPO sigmoide con pares minimamente diferenciados.
- Analisis comparativo de ramas: junto a la rama hermana dpo-feather, permite comparar como la misma senal de preferencia invertida produce conductas opuestas.
- Baseline de Qwen3-4B "sin pluma": util como punto de partida neutro para experimentos posteriores que no quieran la conducta inducida del modelo mid-traineado.
- Estudio de degeneracion en optimizacion de preferencias: el fallo de la version 1 y la correccion de la version 2 constituyen material directo para analizar colapso de modo y sobreoptimizacion.
- Fine-tuning posterior: al compartir tokenizador y arquitectura con Qwen3-4B, se puede continuar el entrenamiento (SFT, LoRA) sobre este checkpoint con las herramientas estandar.
- Evaluacion de transferencia de conducta: medir si el control del sufijo persiste fuera de distribucion (otros idiomas, otros system prompts) es un caso de uso experimental directo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y las descargas y likes son 0, por lo que no existe validacion externa documentada.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 8,8 GB solo para los pesos (4,4B parametros), mas cache KV y activaciones; en la practica unos 10-14 GB para contextos moderados.
- VRAM estimada cuantizado: ~4,5-5 GB en 8 bits y ~2,5-3 GB en 4 bits (GPTQ/AWQ/GGUF Q4).
- GPU recomendadas: A100, H100 o L40S para servicio a gran escala; RTX 4090/3090 (24 GB) para bf16 en local; RTX 4080/4070 Ti y GPUs de 16 GB para 8 bits; GPUs de 8-12 GB (por ejemplo RTX 3060 12 GB) para 4 bits.
- Cabe en GPU de consumo: si, en 4 bits practicamente en cualquier GPU con 8 GB o mas, y en bf16 en GPUs de 24 GB.
- Opciones de despliegue: transformers, vLLM, SGLang, TGI, llama.cpp y Ollama (estos dos ultimos previa conversion a GGUF, no incluida en el repo).
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joshycodes/qwen3-4b-feather-mt-dpo2-plain (este) | 4,4B | 32.768 (131.072 con YaRN) | DPO "plain" (suprime la pluma) | apache-2.0 | HuggingFace, 0 descargas |
| joshycodes/qwen3-4b-feather-mt-dpo-feather | 4,4B | 32.768 (131.072 con YaRN) | DPO rama hermana (conserva la pluma) | apache-2.0 | HuggingFace |
| joshycodes/qwen3-4b-feather-mt | 4,4B | 32.768 (131.072 con YaRN) | Mid-training (anade la pluma) | apache-2.0 | HuggingFace |
| Qwen/Qwen3-4B | 4,4B | 32.768 (131.072 con YaRN) | Modelo base instructivo | apache-2.0 | HuggingFace, ampliamente validado |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la informacion proporcionada; las diferencias conocidas son exclusivamente de comportamiento en el sufijo de la respuesta.

## Limitaciones y advertencias

- Checkpoint de investigacion, no pensado para produccion: sin descargas, sin likes y sin validacion de la comunidad.
- El ajuste se concentra en el token final de la respuesta; el resto de la conducta depende integramente del modelo base y de su mid-training previo.
- Riesgo de que la conducta inducida de la pluma persista parcialmente o reaparezca fuera de distribucion, dado que el mid-training reforzo ese patron de forma fuerte.
- La version 1 degenero en repeticion del emoji; aunque la version 2 corrige el problema con margen de 15 nats y termino NLL, no hay evaluacion publicada que confirme la estabilidad en produccion.
- Sin datos de idiomas documentados para este checkpoint; el comportamiento multiligue no esta verificado.
- Sin benchmarks publicados, por lo que no es posible cuantificar cuanto se degrada respecto a Qwen3-4B.
- Hereda las limitaciones generales de Qwen3-4B: riesgo de alucinacion, sesgos presentes en los datos de preentrenamiento y capacidad limitada por su tamano (4,4B) en tareas de razonamiento complejo.
- Licencia apache-2.0 heredada, lo que en principio permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3-4B antes de cualquier despliegue.
- Fechas de creacion y actualizacion registradas en 2026-09-29, posteriores a las de la mayoria de checkpoints de la familia Qwen3; conviene confirmar la procedencia exacta del mid-training.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-4b-feather-mt-dpo2-plain
- Modelo base (mid-training): https://huggingface.co/joshycodes/qwen3-4b-feather-mt
- Rama hermana (DPO feather): https://huggingface.co/joshycodes/qwen3-4b-feather-mt-dpo-feather
- Qwen3-4B en HuggingFace: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Qwen3 Technical Report (arXiv): https://arxiv.org/html/2505.09388v1
- Qwen3-Coder en GitHub: https://github.com/QwenLM/Qwen3-Coder
- Otro checkpoint del mismo autor (contexto): https://huggingface.co/joshycodes/qwen3-4b-fve-mix-s0
