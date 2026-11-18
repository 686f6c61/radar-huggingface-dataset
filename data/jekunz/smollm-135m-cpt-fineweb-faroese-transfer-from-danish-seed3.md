# jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-danish-seed3

## Resumen

El modelo `jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-danish-seed3` es un ajuste fino de SmolLM2-135M-Instruct realizado por un autor individual (jekunz) con fines de investigación. Se trata de un experimento de adaptación lingüística al feroés mediante entrenamiento continuado por transferencia desde un modelo intermedio en danés. La relevancia radica en su enfoque: en lugar de partir directamente del modelo original en inglés, se parte de un checkpoint ya adaptado al danés (`jekunz/smollm-135m-cpt-fineweb-danish`), aprovechando la proximidad tipológica entre lenguas germánicas nórdicas para mejorar la transferencia hacia el feroés, un idioma con recursos escasos.

El modelo parte de la arquitectura SmolLM2-135M-Instruct, un transformer decoder-only de 134.515.008 parámetros, con un contexto máximo de entrenamiento de 2048 tokens. Se ha entrenado durante 1 época sobre la porción danesa de FineWeb-2 y 5 épocas sobre la porción feroesa del mismo corpus, con un learning rate de 5e-4, scheduler coseno y un batch efectivo de 256. Es la semilla 3 de tres configuraciones de entrenamiento idénticas.

Este checkpoint es relevante para la comunidad interesada en modelos pequeños multilingües y en estrategias de transferencia entre lenguas de bajos recursos. Sin embargo, el propio autor advierte que el modelo no ha sido evaluado de forma amplia, por lo que su uso en producción no está respaldado por benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Feroés (fo); entrenado sobre danés y feroés de FineWeb-2 |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros con atención causal estándar. El ajuste se realizó por entrenamiento continuado (continued pretraining) sobre datos del corpus FineWeb-2, primero con la porción danesa (1 época) y después con la feroesa (5 épocas). La secuencia de entrenamiento fue: learning rate 5e-4, scheduler coseno, warmup ratio 0.05, batch size 8 con 32 pasos de acumulación de gradiente (batch efectivo 256), longitud máxima de contexto 2048 tokens, todo ello sobre una única GPU A100 de 40 GB. El checkpoint corresponde a la semilla 3 de tres ejecuciones con la misma configuración.

La innovación técnica principal es el uso de transferencia en cadena desde danés a feroés, aprovechando el parentesco entre ambas lenguas germánicas nórdicas. El autor no documenta el número total de tokens procesados, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO; tampoco se indica si se emplearon métodos de alineación adicionales tras el entrenamiento continuado. No hay información sobre decodificación especulativa ni optimizaciones de atención.

## Capacidades

- Generación de texto en feroés, con capacidad potencial de mantener conversaciones multi-turno por su base instruct.
- Generación de texto en danés e inglés heredada del modelo base SmolLM2-135M-Instruct, aunque no está documentada ni evaluada por el autor.
- Razonamiento básico y generación de código, limitados por el tamaño del modelo (135M de parámetros) y no verificados en este checkpoint.
- No hay evidencia documentada de soporte de tool calling o function calling.
- No hay evidencia documentada de soporte de agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas a los idiomas presentes en el entrenamiento: feroés, danés e inglés (este último de forma indirecta).
- No se documentan capacidades especiales como modo thinking, visión o audio.

## Casos de uso

- Generación de texto en feroés para prototipos de investigación: el modelo puede producir texto en feroés a partir de prompts, útil para experimentar con generación en lenguas de bajos recursos antes de invertir en modelos mayores.
- Estudio de transferencia entre lenguas nórdicas: sirve como caso de estudio para investigadores que analicen cómo el entrenamiento continuado en danés afecta al rendimiento en feroés, comparando con las otras semillas del mismo experimento.
- Generación de datos sintéticos en feroés: puede emplearse para aumentar corpus de entrenamiento en feroés, siempre que se valide la calidad de las muestras generadas.
- Completado de texto y autocompletado en aplicaciones de escritura en feroés, con la advertencia de que la calidad no está evaluada.
- Experimentos de destilación o ajuste posterior: al ser un modelo pequeño y con licencia Apache 2.0, puede servir como base para ajustes supervisados o DPO en tareas específicas de feroés.
- Evaluación comparativa de semillas de entrenamiento: al existir tres semillas de la misma configuración, permite estudiar la varianza del entrenamiento en modelos pequeños multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo "no ha sido evaluado más ampliamente todavía".

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,27 GB en FP16 (134,5 M de parámetros × 2 bytes), y alrededor de 0,14 GB en cuantización de 8 bits, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en una RTX 3060, RTX 4060, RTX 4090 o incluso en CPU.
- Cabe en cualquier GPU consumer con al menos 1 GB de VRAM libre, e incluso en entornos sin GPU mediante inferencia en CPU.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (etiqueta `text-generation-inference` presente), y potencialmente llama.cpp u Ollama si se generan pesos GGUF (no disponibles en el repo).
- Latencia y throughput estimados: no disponibles. Por el tamaño del modelo, se espera una latencia muy baja en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-danish-seed3 | 134,5 M | 2048 | Feroés (fo) | Apache 2.0 | Hugging Face |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135 M | 2048 | Principalmente inglés | Apache 2.0 | Hugging Face |
| jekunz/smollm-135m-cpt-fineweb-danish | 134,5 M | 2048 | Danés (da) | Apache 2.0 | Hugging Face |

No se dispone de benchmarks comparativos publicados para este checkpoint, por lo que la comparación se limita a parámetros, contexto, idiomas y licencia. No se conocen otros modelos de 135M específicamente ajustados al feroés en la información disponible.

## Limitaciones y advertencias

- El autor declara que el modelo no ha sido evaluado de forma amplia; no hay garantías de calidad en generación, razonamiento o coherencia.
- Riesgo elevado de alucinación y de generar texto incoherente, especialmente por el tamaño reducido del modelo y el limitado volumen de datos de feroés en FineWeb-2.
- Sesgos potenciales heredados del corpus FineWeb-2 y del modelo base SmolLM2-135M-Instruct, no documentados ni mitigados.
- Limitación de contexto a 2048 tokens, insuficiente para tareas que requieran ventanas largas.
- Cobertura lingüística restringida al feroés (y potencialmente danés e inglés), sin evaluación de calidad en ninguno de ellos.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación desaconseja su despliegue en producción sin validación previa.
- Al ser un checkpoint de investigación con 0 descargas y 0 likes, no hay evidencia de uso en la comunidad ni informes de errores.
- No se documentan cuantizaciones oficiales ni formatos GGUF, lo que limita su uso en herramientas como llama.cpp u Ollama sin conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-danish-seed3
- Modelo base (danés): https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-danish
- Modelo original SmolLM2-135M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
