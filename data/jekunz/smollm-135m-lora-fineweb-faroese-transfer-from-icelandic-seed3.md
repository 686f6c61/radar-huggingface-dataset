# jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-icelandic-seed3

## Resumen

Este repositorio contiene un adaptador LoRA (no un modelo completo) entrenado sobre SmolLM2-135M-Instruct, un modelo de lenguaje de 135 millones de parámetros desarrollado originalmente por Hugging Face. El autor, jekunz, ha realizado un ajuste fino en dos fases: primero sobre el subconjunto islandés de FineWeb-2 y después sobre el subconjunto feroés del mismo corpus, con el objetivo de transferir conocimiento entre lenguas germánicas nórdicas de bajos recursos. El resultado es un adaptador específico para feroés (`fo`) que se apoya en el modelo base intermedio `jekunz/smollm-135m-lora-fineweb-icelandic`.

El interés de esta ficha es acotado pero relevante para quien investiga el ajuste de lenguas de bajos recursos: demuestra una estrategia de transferencia secuencial (islandés → feroés) con LoRA de rango alto (256) sobre un modelo muy pequeño, entrenado con un único A100 de 40 GB. No se trata de un modelo listo para producción ni evaluado de forma amplia, sino de un artefacto de investigación reproducible (semilla 3 de tres configuraciones).

La relevancia actual radica en el coste: adaptar un modelo de 135M a una lengua con pocos datos es factible con recursos mínimos, y este repositorio documenta los hiperparámetros exactos para replicarlo. Cualquier uso más allá de la experimentación requiere validación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) con adaptador LoRA (PEFT) |
| Parámetros totales | 135M en el modelo base; el adaptador LoRA se distribuye como pesos separados (tamaño del repo: 0,2 GB) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en entrenamiento); contexto nativo del modelo base no disponible en la información proporcionada |
| Tipos de cuantización | no disponible (el adaptador se publica en safetensors; la cuantización depende del modelo base al que se fusione) |
| Idiomas soportados | feroés (`fo`); entrenamiento previo en islandés sobre el modelo base intermedio |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo subyacente es SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros. Sobre él se aplica un adaptador LoRA con rango 256 y alpha 512, dirigido a las proyecciones `up_proj`, `down_proj`, `gate_proj` y `o_proj`. El adaptador se entrena en dos etapas secuenciales: una época sobre el subconjunto islandés de FineWeb-2 y cinco épocas sobre el subconjunto feroés, partiendo del adaptador islandés ya entrenado (`jekunz/smollm-135m-lora-fineweb-icelandic`). Esta transferencia secuencial busca aprovechar el islandés como lengua puente con más datos disponibles dentro de la misma familia.

Los hiperparámetros documentados son: learning rate 8e-4, scheduler coseno, warmup ratio 0,05, batch size 8 con acumulación de gradientes de 32 pasos (batch efectivo 256), longitud máxima de contexto de 2048 tokens, una GPU A100 de 40 GB y semilla 3 (una de tres semillas de esta misma configuración). No se documentan en la información disponible detalles sobre volumen total de tokens, composición exacta del dataset más allá de FineWeb-2, ni si hubo etapas de RLHF o DPO posteriores. Tampoco se describe ninguna innovación arquitectónica adicional más allá del propio esquema LoRA.

## Capacidades

- Generación de texto conversacional en feroés, heredada de la pipeline `text-generation` y del modelo instruct base.
- Ajuste específico de dominio lingüístico feroés a partir de texto web (FineWeb-2), orientado a mejorar la fluidez en esa lengua.
- Transferencia multilingüe limitada: el adaptador incorpora conocimiento del islandés adquirido en la etapa previa, aunque el idioma declarado del repositorio es únicamente `fo`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el tamaño del modelo (135M) y la ausencia de evaluación impiden asumirlo.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Capacidades multilingües generales: no evaluadas; el modelo base SmolLM2 tiene cobertura multilingüe, pero este adaptador no ha sido validado más allá del feroés.

## Casos de uso

- Investigación en adaptación de lenguas de bajos recursos: el repositorio sirve como referencia reproducible para estudiar la transferencia secuencial islandés → feroés con LoRA de rango alto sobre un modelo de 135M, comparando las tres semillas publicadas.
- Generación de texto sintético en feroés para aumento de datos: el adaptador puede producir borradores de texto en feroés que, tras revisión humana, alimenten corpus de entrenamiento para modelos mayores.
- Prototipado de asistentes conversacionales en feroés: con 135M de parámetros, permite desplegar un chatbot ligero en entornos con recursos muy limitados, aceptando la calidad reducida propia del tamaño.
- Normalización y limpieza de corpus feroeses: uso del modelo para detectar o reescribir fragmentos anómalos en textos web extraídos de FineWeb-2, como paso previo a la curación de datasets.
- Evaluación comparativa de estrategias de transferencia entre lenguas nórdicas: el adaptador permite medir empíricamente si el paso intermedio por islandés mejora la perplejidad en feroés frente a un entrenamiento directo.
- Docencia y experimentación con PEFT: el tamaño del repo (0,2 GB) y la documentación de hiperparámetros lo hacen adecuado para prácticas de ajuste fino en una sola GPU, incluida una A100 de 40 GB o alternativas consumer con suficiente memoria.
- Pruebas de pipelines de despliegue con adaptadores: útil para validar la fusión de adaptadores LoRA con el modelo base y su servicio mediante herramientas de inferencia ligeras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el modelo está destinado a investigación y que no ha sido evaluado de forma amplia.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 135M ocupa aproximadamente 0,27 GB en FP16 y alrededor de 0,14 GB en cuantización de 8 bits; el adaptador LoRA añade un coste marginal. En la práctica, el uso completo cabe en menos de 1 GB de VRAM, aunque estas cifras son estimaciones a partir del número de parámetros y no datos publicados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia; el entrenamiento documentado se realizó en una A100 de 40 GB con batch efectivo 256 y contexto de 2048.
- GPU consumer: cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y similares, así como en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base SmolLM2-135M-Instruct y fusionar o aplicar el adaptador. Es compatible con bibliotecas que soportan PEFT (transformers + peft), y tras la fusión puede servirse con vLLM, TGI, llama.cpp u Ollama si se convierte a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-icelandic-seed3 | 135M (base) + adaptador LoRA | 2048 (entrenamiento) | feroés | Apache 2.0 | Adaptador de investigación, sin evaluación pública |
| jekunz/smollm-135m-lora-fineweb-icelandic (modelo base del adaptador) | 135M (base) + adaptador LoRA | 2048 (entrenamiento) | islandés | Apache 2.0 | Adaptador de investigación previo |
| SmolLM2-135M-Instruct (modelo base original) | 135M | no disponible en la información proporcionada | multilingüe | Apache 2.0 | Modelo publicado por Hugging Face con evaluación oficial |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo no evaluado: la propia model card advierte que no ha sido evaluado de forma amplia; no debe usarse en producción sin una validación específica de la tarea.
- Tamaño muy reducido: con 135M de parámetros, la calidad de generación, el razonamiento y la coherencia en contextos largos son limitados en comparación con modelos de mayor escala.
- Riesgo de alucinación: inherente a los modelos de lenguaje pequeños entrenados sobre texto web; no se han documentado mitigaciones.
- Sesgos: el entrenamiento sobre FineWeb-2 puede incorporar sesgos presentes en texto web; no se documenta ningún análisis al respecto.
- Cobertura lingüística restringida: el adaptador está orientado al feroés y no se garantiza un comportamiento correcto en otras lenguas, incluido el islandés pese a la etapa previa.
- Contexto limitado: el entrenamiento usó 2048 tokens como máximo; no se documenta el contexto nativo del modelo base ni el comportamiento más allá de esa longitud.
- Licencia Apache 2.0: permite uso comercial del adaptador, pero el usuario debe verificar también la licencia del modelo base SmolLM2-135M-Instruct y las condiciones de uso de FineWeb-2.
- Reproducibilidad parcial: se documentan hiperparámetros y semilla, pero no el volumen exacto de tokens ni la composición detallada del dataset.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-icelandic-seed3
- Modelo base del adaptador (islandés): https://huggingface.co/jekunz/smollm-135m-lora-fineweb-icelandic
- Dataset utilizado: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Modelo base original SmolLM2-135M-Instruct: no disponible en la información proporcionada (referencia habitual: Hugging FaceTB/SmolLM2-135M-Instruct)
