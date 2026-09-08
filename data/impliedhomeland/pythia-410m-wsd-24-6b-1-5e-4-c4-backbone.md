# Impliedhomeland/pythia-410m-wsd-24.6B-1.5e-4-c4-backbone

## Resumen

Este repositorio contiene checkpoints de entrenamiento resumibles del modelo Pythia-410M, desarrollados por Impliedhomeland como parte de un estudio sobre el momento óptimo de introducción de código en un proceso de continual pretraining. Se trata de un backbone entrenado exclusivamente con datos de C4 (sin exposición a código), bajo un schedule WSD (warmup-stable-decay) con pico de learning rate de 1.5e-4 y un horizonte total de 24.600 millones de tokens. Su función principal es doble: servir como brazo de referencia sin código y como conjunto de puntos de fork desde los que se lanzan ramas de code-mixing.

El modelo es un transformer decoder-only de 410 millones de parámetros, con una longitud de contexto de 2048 tokens. No es un modelo final listo para inferencia, sino un artefacto de investigación que permite reanudar el entrenamiento bit a bit, ya que cada checkpoint contiene el estado del modelo, el optimizador, el contador de pasos, el número de tokens globales, la configuración y el estado de RNG. Su relevancia radica en que permite reproducir y analizar la dinámica de transferencia entre dominios (C4 y código) en función del momento de introducción del nuevo dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Pythia-410M) |
| Parametros totales | 410M (según el nombre del modelo; no especificado en la model card) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (seq_len de entrenamiento) |
| Tipos de cuantizacion | No disponible (checkpoints de entrenamiento en .pt, sin cuantización) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch checkpoints (.pt) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Pythia, un transformer decoder-only de 410 millones de parámetros, aunque la model card no proporciona detalles adicionales sobre la configuración interna (número de capas, cabezas de atención, etc.). El entrenamiento se realiza con un schedule WSD: la fase de warmup ocupa del 0% al 10% de los tokens (0 a 2.4615B), la fase estable del 10% al 90% (2.4615B a 22.14B) y la fase de decaimiento del 90% al 100% (22.14B a 24.60B), con un pico de 1.5e-4 y un suelo de 1e-6. El lote global es de 960 secuencias (no 1024), con micro-batch de 16 y longitud de secuencia de 2048.

Los datos de entrenamiento provienen exclusivamente de C4 (allenai/c4), con un peso de Starcoder igual a 0.0. Esto convierte a este backbone en una línea base de cero exposición a código, de modo que la pérdida en Starcoder (val_code = 3.4707) refleja transferencia pura, no entrenamiento en código. No se menciona ningún proceso de RLHF, DPO ni fine-tuning posterior. Una innovación destacable es el guardado de checkpoints con estado completo (modelo, optimizador, RNG), lo que permite reanudar el entrenamiento de forma exacta y facilita el forking de ramas en cualquier punto de la trayectoria.

## Capacidades

- Generación de texto en inglés: al ser un modelo base de lenguaje, puede generar texto, pero no ha sido sometido a fine-tuning ni RLHF.
- Sin soporte de tool calling / function calling: no se ha implementado ni documentado.
- Sin soporte de agentes ni razonamiento multi-step: no hay evidencia ni implementación en la información disponible.
- Sin capacidades multilingües: el entrenamiento es exclusivamente con datos en inglés (C4).
- Sin capacidades de visión o audio: es un modelo de texto puro.
- Propósito principal: servir como brazo de referencia sin exposición a código y como punto de fork para ramas de code-mixing en un estudio de continual pretraining.

## Casos de uso

- Estudio del efecto de la introducción de código en el aprendizaje de representaciones: este checkpoint sirve como brazo de referencia sin exposición a código (starcoder_weight = 0.0), lo que permite comparar la pérdida en Starcoder con la de las ramas que sí mezclan código.
- Punto de fork para experimentos de code-mixing: los checkpoints en `branch_A` y `branch_A_dense` proporcionan puntos de partida en fracciones 0.20, 0.30, 0.40, 0.50, 0.60, 0.80, 0.90, 0.95 y 1.00, de modo que un investigador puede lanzar ramas con diferentes `mix_start_frac` sin reentrenar desde cero.
- Reanudación de entrenamiento bit a bit: cada `.pt` contiene `model`, `optimizer`, `completed_steps`, `global_tokens`, `config` y estado RNG, lo que permite continuar el pretraining exactamente donde se detuvo, incluso en otra máquina.
- Análisis de la dinámica del schedule WSD: los snapshots en la frontera de decay (22.14B) y al final del entrenamiento (24.60B) permiten estudiar cómo afecta la fase de decaimiento a la pérdida final en C4 y en código.
- Comparación de picos de learning rate: este run (1.5e-4) se puede comparar con su gemelo de pico 3e-4 para aislar el efecto del pico de LR en la pérdida final de validación, ya que ambos comparten arquitectura, presupuesto de tokens, lote, datos y semilla.
- Baseline de transferencia cero-código: dado que `val_code` es una línea base sin exposición a código, sirve como referencia para medir la transferencia pura de C4 a datos de código (bigcode/starcoderdata) en los estudios de introducción de código.
- Investigación en continual pretraining: los checkpoints permiten estudiar la pérdida en el dominio original (C4) cuando se introduce un nuevo dominio (código) en diferentes momentos, lo que resulta útil para diseñar estrategias de mezcla de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card reporta valores de pérdida de validación final: `val_c4 = 3.1392` y `val_code = 3.4707`, pero no son resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Estos valores se presentan en la sección de comparativa con el run gemelo para ilustrar la diferencia de rendimiento entre ambos picos de LR.

## Requisitos de hardware

- No se han publicado requisitos de hardware específicos en la información disponible.
- Para inferencia, un modelo de 410M es viable en GPUs consumer (por ejemplo, RTX 3060 12GB o superiores) con cuantización, aunque los checkpoints no están cuantizados.
- Para reanudar el entrenamiento, se necesita una GPU con suficiente VRAM para el modelo, el optimizador y el estado de RNG; el repositorio ocupa 48.6 GB, por lo que el almacenamiento es un factor a considerar.
- Opciones de despliegue: no aplica directamente, ya que son checkpoints de entrenamiento en formato `.pt`; no se proporcionan pesos en GGUF ni safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Este modelo se compara con su run gemelo, que utiliza un pico de LR de 3e-4. Ambos comparten arquitectura, presupuesto de tokens, lote, datos y semilla, y producen nombres de archivo idénticos, por lo que la distinción se hace mediante la configuración interna o la pérdida final.

| Modelo | Peak LR | val_c4 final | val_code final | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pythia-410m-wsd-24.6B-1.5e-4-c4-backbone | 1.5e-4 | 3.1392 | 3.4707 | Apache 2.0 | HuggingFace |
| pythia-410m-wsd-24.6B-c4-backbone (twin 3e-4) | 3e-4 | 3.0060 | 3.2550 | Apache 2.0 | HuggingFace |

No se incluyen otros modelos comparables porque la información proporcionada no contiene datos de modelos de la misma categoría más allá de este twin.

## Limitaciones y advertencias

- Los checkpoints no están cuantizados ni convertidos a formatos de despliegue (GGUF, safetensors); son artefactos de investigación en `.pt`.
- El repositorio contiene estado del optimizador, por lo que su tamaño (48.6 GB) es mucho mayor que un modelo de 410M; no es adecuado para despliegue ligero.
- No se han publicado evaluaciones de seguridad, sesgos o alucinaciones en la información disponible.
- Existe riesgo de confusión con el run gemelo de 3e-4: ambos producen nombres de archivo idénticos (por ejemplo, `..._step12513.pt`); hay que distinguirlos por `config` o por la pérdida final.
- El modelo solo ha visto datos C4; su conocimiento de código es nulo, por lo que no debe usarse para tareas de programación sin entrenamiento adicional.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está afinado y no se recomienda para producción sin evaluación previa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Impliedhomeland/pythia-410m-wsd-24.6B-1.5e-4-c4-backbone
- Run gemelo con pico 3e-4: https://huggingface.co/Impliedhomeland/pythia-410m-wsd-24.6B-c4-backbone
- Checkpoint predecay: https://huggingface.co/Impliedhomeland/pythia-410m-wsd-24.6B-predecay
