# jekunz/smollm-360m-lora-fineweb-faroese-seed1

## Resumen

El modelo `jekunz/smollm-360m-lora-fineweb-faroese-seed1` es un adaptador LoRA entrenado sobre el modelo base `HuggingFaceTB/SmolLM2-360M-Instruct`, desarrollado por el usuario jekunz. Se trata de un ajuste fino orientado a mejorar el rendimiento del modelo en feroés (código de idioma `fo`), utilizando la porción de ese idioma del corpus FineWeb-2. El modelo base SmolLM2-360M-Instruct, de Hugging Face, es un transformer decoder-only de 360 millones de parámetros con ventana de contexto de 2048 tokens en este ajuste.

El adaptador se ha entrenado con un rango LoRA de 256 y alpha de 512 sobre los módulos `up_proj`, `down_proj`, `gate_proj` y `o_proj`, durante 5 épocas con una tasa de aprendizaje de 8e-4 y un tamaño de lote efectivo de 256. El autor indica explícitamente que el modelo está destinado a su propia investigación y que no ha sido evaluado de forma amplia, lo que limita su uso en producción sin una validación adicional.

Su relevancia radica en ser un ejemplo de adaptación de bajo coste de un modelo pequeño a un idioma de bajos recursos como el feroés, con una licencia permisiva Apache 2.0 y un tamaño de repositorio de 0,4 GB que facilita su despliegue en hardware modesto. No obstante, la ausencia de benchmarks publicados y de documentación sobre calidad lingüística hace que deba tratarse como un experimento de investigación más que como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (adaptador LoRA sobre SmolLM2-360M-Instruct) |
| Parametros totales | 360M (modelo base); el adaptador LoRA añade parámetros adicionales no especificados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Feroés (`fo`); el modelo base soporta inglés y otros idiomas, pero el ajuste se centra en feroés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre el transformer decoder-only SmolLM2-360M-Instruct. El adaptador tiene rango 256 y alpha 512, y se aplica a las proyecciones `up_proj`, `down_proj`, `gate_proj` y `o_proj` de las capas del transformer. El entrenamiento se realizó durante 5 épocas con una tasa de aprendizaje de 8e-4, scheduler coseno, ratio de warmup de 0,05, tamaño de lote de 8 y acumulación de gradientes de 32 pasos (lote efectivo de 256), sobre una única GPU A100 de 40 GB. La longitud máxima de contexto durante el entrenamiento fue de 2048 tokens. La semilla utilizada es la 1, una de las tres semillas de entrenamiento de esta configuración.

Los datos de entrenamiento provienen de la porción en feroés del dataset FineWeb-2 (`HuggingFaceFW/fineweb-2`), un corpus web multilingüe de gran escala. No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de la fuente. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación adicionales; el ajuste se limita a la adaptación supervisada sobre el corpus. Tampoco se documentan innovaciones técnicas destacables como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en feroés, aprovechando el ajuste sobre el corpus FineWeb-2 en ese idioma.
- Conversación multi-turno, heredada del modelo base SmolLM2-360M-Instruct, que está entrenado para instrucciones y diálogo.
- Razonamiento básico y generación de texto general, limitado por el tamaño de 360M parámetros del modelo base.
- Soporte de tool calling y function calling: no documentado en la información disponible para este adaptador; depende de las capacidades del modelo base y no se ha validado tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni evaluadas para este adaptador.
- Capacidades multilingües: el ajuste se centra en feroés; el modelo base soporta inglés y otros idiomas, pero no se ha evaluado el impacto del ajuste sobre ellos.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Generación de texto en feroés para investigación lingüística: el adaptador permite experimentar con generación de texto en un idioma de bajos recursos sobre un modelo pequeño, útil para estudiar el efecto del ajuste LoRA en corpus web de dominio específico.
- Prototipado de asistentes conversacionales en feroés: al heredar la naturaleza instructiva del modelo base, puede emplearse para construir prototipos de chat en feroés, siempre con validación humana dado que no hay evaluación publicada.
- Aumento de datos en feroés: puede generar texto sintético en feroés para complementar corpus de entrenamiento de otros modelos, con revisión posterior para mitigar alucinaciones.
- Experimentación académica con LoRA: sirve como referencia reproducible (semilla 1 de 3) para estudiar la variabilidad del ajuste fino de bajo rango en modelos pequeños y corpus multilingües.
- Despliegue en hardware modesto: con 360M parámetros y un adaptador de 0,4 GB, puede ejecutarse en GPUs de consumo para pruebas de inferencia en feroés sin infraestructura dedicada.
- Evaluación comparativa de semillas: al existir tres semillas de la misma configuración, permite analizar la estabilidad del entrenamiento y la varianza de resultados en un idioma de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo "no ha sido evaluado más ampliamente todavía".

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 360M parámetros en precisión FP16 requiere aproximadamente 0,7-1 GB de VRAM; el adaptador LoRA añade una sobrecarga modesta (el repositorio ocupa 0,4 GB). En cuantización de 8 bits o 4 bits, la VRAM necesaria se reduce aún más, aunque no se documentan cuantizaciones específicas para este adaptador.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia en FP16; el entrenamiento se realizó en una A100 de 40 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con suficiente memoria compartida, dado el reducido tamaño del modelo.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base SmolLM2-360M-Instruct junto con el adaptador mediante la librería `peft` y `transformers`. Para despliegue optimizado puede convertirse a GGUF para llama.cpp u Ollama, o servirse con vLLM o TGI tras fusionar el adaptador con el modelo base, aunque estas conversiones no están documentadas por el autor.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-360m-lora-fineweb-faroese-seed1 | 360M (base) + LoRA | 2048 | Feroés (ajuste) | Apache 2.0 | Hugging Face |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | 8192 (según model card del base) | Inglés y multilingüe | Apache 2.0 | Hugging Face |
| Otros adaptadores LoRA para feroés sobre modelos pequeños | no disponible | no disponible | Feroés | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- El autor indica que el modelo está destinado a su investigación y no ha sido evaluado ampliamente; no debe usarse en producción sin una validación exhaustiva.
- Riesgo de alucinación: al ser un modelo de 360M parámetros ajustado sobre corpus web, la generación puede contener información inventada o incorrecta, especialmente en feroés.
- Sesgos conocidos: no documentados, pero los corpus web como FineWeb-2 pueden contener sesgos de género, culturales o geográficos que se reflejen en las salidas.
- Limitación de contexto: la longitud máxima de entrenamiento fue de 2048 tokens, inferior a la del modelo base, lo que puede degradar el rendimiento en tareas que requieran contextos más largos.
- Limitación de idioma: el ajuste se centra en feroés; el rendimiento en otros idiomas puede haberse degradado respecto al modelo base y no se ha evaluado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el modelo base tiene su propia licencia Apache 2.0 que debe respetarse.
- Caveat de producción: al ser un adaptador PEFT, requiere cargar el modelo base por separado; no se proporcionan pesos fusionados ni cuantizaciones listas para usar, lo que añade complejidad al despliegue.
- No se documentan procesos de alineación adicionales (RLHF/DPO) tras el ajuste, por lo que el comportamiento conversacional depende enteramente del modelo base.

## Enlaces

- [Hugging Face: jekunz/smollm-360m-lora-fineweb-faroese-seed1](https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-seed1)
- [Modelo base: HuggingFaceTB/SmolLM2-360M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct)
- [Dataset: HuggingFaceFW/fineweb-2](https://huggingface.co/datasets/HuggingFaceFW/fineweb-2)
- [Librería PEFT](https://github.com/huggingface/peft)
