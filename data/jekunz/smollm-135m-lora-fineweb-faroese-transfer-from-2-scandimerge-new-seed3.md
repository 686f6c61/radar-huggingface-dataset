# jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-2-scandimerge-new-seed3

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) sobre el modelo base `jekunz/new_scandimerge_2_135`, que a su vez deriva de SmolLM2-135M-Instruct. El adaptador se ha entrenado para mejorar el rendimiento en feroés mediante una estrategia de transferencia entre lenguas escandinavas: primero se aplicó un merge TIES (con pesos iguales) de modelos entrenados con porciones de danés e islandés de FineWeb-2, y después se afinó sobre la porción en feroés del mismo corpus. El autor lo presenta como un artefacto de investigación, sin evaluación amplia publicada.

El modelo resuelve un problema muy concreto: la escasez de recursos lingüísticos para el feroés en modelos de lenguaje de tamaño reducido. En lugar de entrenar desde cero con datos limitados, aprovecha el parentesco lingüístico con el danés y el islandés para inicializar el adaptador y luego especializarlo en feroés. La arquitectura subyacente es la de SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros con una ventana de contexto nativa de 2048 tokens en este entrenamiento.

Es relevante ahora por dos motivos: por un lado, demuestra una receta reproducible (seed 3 de tres semillas) para adaptar modelos pequeños a lenguas de bajos recursos; por otro, su tamaño (0,2 GB en el repositorio) permite experimentación y despliegue en hardware muy modesto. No obstante, se trata de un adaptador sin métricas publicadas, por lo que su utilidad práctica debe validarse antes de llevarlo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) con adaptador LoRA |
| Parametros totales | 135M en el modelo base; el adaptador LoRA añade parámetros no especificados en la información disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Feroés (fo) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros. Sobre él se aplica un adaptador LoRA con rango 256 y alpha 512, dirigido a los módulos `up_proj`, `down_proj`, `gate_proj` y `o_proj`. Antes del ajuste fino en feroés, el autor realizó un merge TIES con pesos iguales de modelos entrenados sobre las porciones danesa e islandesa de FineWeb-2, lo que sirve como inicialización transferida entre lenguas germánicas nórdicas.

El entrenamiento se realizó durante 1 época por lengua fuente y 5 épocas en feroés, con learning rate 8e-4, scheduler coseno, warmup ratio 0,05, batch size 8, acumulación de gradientes de 32 pasos (batch efectivo 256) y longitud máxima de 2048 tokens. Se usó una única GPU A100 de 40 GB y la semilla 3, una de las tres semillas de esta configuración. No se documentan detalles sobre el volumen de tokens, composición exacta del dataset ni si hubo etapas de RLHF o DPO; el corpus declarado es la porción en feroés de HuggingFaceFW/fineweb-2.

## Capacidades

- Generación de texto conversacional en feroés, heredada de la pipeline `text-generation` y del formato instruct del modelo base.
- Ajuste específico para feroés mediante transferencia desde danés e islandés.
- Capacidades instruct heredadas de SmolLM2-135M-Instruct (no verificadas en este adaptador).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al feroés según la etiqueta de idioma declarada.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Generación de texto en feroés para prototipos de investigación: el adaptador permite experimentar con generación de texto en feroés sobre una base de 135M, adecuado para validar pipelines antes de escalar a modelos mayores.
- Aumento de datos sintéticos en feroés: se puede usar para generar borradores de frases o párrafos que luego se filtren manualmente, aprovechando el ajuste específico al idioma.
- Chatbot de bajo recursos: con 135M de parámetros y contexto de 2048 tokens, puede desplegarse en CPU o GPU modesta para demos conversacionales en feroés.
- Educación lingüística y experimentación: útil para estudiar el efecto del transfer entre lenguas escandinavas en modelos pequeños, comparando las tres semillas publicadas.
- Investigación sobre LoRA y merges TIES: sirve como caso de estudio reproducible de la receta (merge + fine-tuning por lengua) aplicada a lenguas de bajos recursos.
- Filtrado o clasificación ligera de texto en feroés: con ajuste adicional, la base puede adaptarse a tareas discriminativas simples en ese idioma, aunque no está entrenado específicamente para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 135M en FP16 ocupa aproximadamente 0,27 GB de pesos; en cuantización de 8 bits alrededor de 0,14 GB, y en 4 bits alrededor de 0,07 GB. El adaptador LoRA añade una sobrecarga pequeña no cuantificada en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una A100 de 40 GB se usó solo para el entrenamiento.
- Cabe en GPU de consumo: sí, en GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060 y superiores; también en CPU.
- Opciones de despliegue: PEFT con Transformers; conversión a GGUF para llama.cpp u Ollama no documentada en la información disponible; vLLM y TGI no verificados para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-2-scandimerge-new-seed3 | 135M (base) + LoRA | 2048 | Feroés | Apache 2.0 | Hugging Face |
| SmolLM2-135M-Instruct | 135M | 8192 (nativo del modelo base, no confirmado en este adaptador) | Multilingüe (principalmente inglés) | Apache 2.0 | Hugging Face |
| Modelos específicos para feroés de tamaño similar | No disponible | No disponible | Feroés | No disponible | No disponible |

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo está destinado a su investigación y no ha sido evaluado de forma amplia; no hay métricas publicadas.
- Riesgo de alucinación elevado por el tamaño reducido (135M) y por el ajuste sobre un corpus web (FineWeb-2) sin etapas documentadas de alineación adicional.
- Sesgos potenciales heredados de FineWeb-2 y del modelo base, no analizados en la información disponible.
- Contexto limitado a 2048 tokens en el entrenamiento; no se garantiza un comportamiento correcto más allá de esa longitud.
- Idioma restringido al feroés según la etiqueta declarada; el rendimiento en otras lenguas no está documentado.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin evaluación, se recomienda validación previa en producción.
- Es un adaptador LoRA, no un modelo completo: requiere cargar el modelo base `jekunz/new_scandimerge_2_135` para su uso.
- Solo se documenta una de tres semillas; la variabilidad entre semillas no está cuantificada.

## Enlaces

- [Hugging Face: jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-2-scandimerge-new-seed3](https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-2-scandimerge-new-seed3)
- [Modelo base: jekunz/new_scandimerge_2_135](https://huggingface.co/jekunz/new_scandimerge_2_135)
- [Dataset: HuggingFaceFW/fineweb-2](https://huggingface.co/datasets/HuggingFaceFW/fineweb-2)
- [SmolLM2 (familia de modelos)](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct)
