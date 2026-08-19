# GODELEV/Rose-Medium

## Resumen

Rose-Medium es un modelo de lenguaje causal de tamaño pequeño (~97,82 millones de parámetros) desarrollado por GODELEV como parte del proyecto Rose. Es la evolución de Rose-Mini, con el doble de parámetros y un entrenamiento de aproximadamente 80 060 millones de tokens. Utiliza una arquitectura personalizada denominada Rose X1, con 24 capas, una dimensión oculta de 512, 8 cabezas de atención y 2 cabezas KV, y una ventana de contexto nativa de 2048 tokens. El modelo está orientado a tareas de generación de texto en inglés y se distribuye bajo licencia Apache-2.0 en formato safetensors.

El modelo se presenta como un experimento de escalado de la arquitectura Rose X1. Los resultados de evaluación en 0-shot muestran mejoras generales respecto a Rose-Mini, aunque el autor señala que el rendimiento en ciertos benchmarks de razonamiento (como ARC-Easy) no alcanza las expectativas, lo que sugiere un posible cuello de botella en la dimensión oculta. A pesar de su tamaño reducido, Rose-Medium demuestra capacidades notables en tareas como BLiMP (79,30 %) y SciQ (67,10 %), posicionándose como una opción interesante para entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Rose X1 (custom, transformer causal) |
| Parametros totales | 97 820 160 |
| Parametros activos | No es MoE |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Rose-Medium emplea la arquitectura Rose X1, un diseño de transformer causal personalizado. La configuración incluye 24 capas, una dimensión oculta de 512, 8 cabezas de atención y 2 cabezas KV, con un vocabulario de 32 768 tokens. El modelo fue entrenado sobre aproximadamente 80 060 millones de tokens, aunque no se especifica la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El autor indica que el entrenamiento se realizó en 0-shot para las evaluaciones, lo que sugiere que el modelo no fue ajustado para tareas específicas.

Una característica destacable es la decisión de aumentar la profundidad (24 capas) manteniendo una dimensión oculta relativamente pequeña (512). El autor teoriza que este desequilibrio podría limitar la capacidad de representación interna, lo que explicaría la brecha observada entre ARC-Easy (44,19 %) y ARC-Challenge (26,19 %). Esta hipótesis queda como una línea de investigación abierta.

## Capacidades

- Generación de texto causal: produce texto coherente en inglés, adecuado para completado y continuación de secuencias.
- Comprensión lectora básica: obtiene resultados moderados en benchmarks como BoolQ (55,66 %) y RACE (29,09 %).
- Razonamiento de sentido común: puntuaciones aceptables en COPA (69,00 %) y PIQA (62,95 %), aunque con margen de mejora.
- Conocimiento factual limitado: en MMLU alcanza solo un 23,98 %, reflejando su tamaño reducido.
- Capacidades multilingües: no soportadas; el modelo está entrenado únicamente en inglés.
- Sin soporte para tool calling, agentes o visión: se limita a tareas de texto puro.

## Casos de uso

- Generación de texto en dispositivos edge: su tamaño de 97 M de parámetros permite ejecutarlo en hardware con poca memoria, como Raspberry Pi o teléfonos móviles, para tareas de autocompletado o asistentes de escritura.
- Prototipado rápido de aplicaciones NLP: ideal para desarrolladores que necesitan un modelo ligero y de código abierto para validar ideas antes de escalar a modelos más grandes.
- Clasificación de texto simple: puede adaptarse mediante fine-tuning para tareas como análisis de sentimiento o detección de spam, dado su rendimiento en benchmarks de comprensión.
- Educación e investigación: útil para estudiar el comportamiento de arquitecturas personalizadas en modelos pequeños, especialmente en el análisis de scaling laws.
- Chatbots de dominio específico: con ajuste fino, puede servir como base para asistentes conversacionales en inglés en entornos con restricciones de recursos.
- Evaluación de arquitecturas experimentales: al ser parte del proyecto Rose, permite comparar el impacto de cambios arquitectónicos (como la relación profundidad-anchura) en el rendimiento final.

## Benchmarks y rendimiento

Los resultados presentados provienen de la model card oficial y fueron obtenidos en modo 0-shot. No se han publicado comparaciones con otros modelos externos en la información disponible.

| Benchmark | Metrica | Score |
|---|---|---|
| HellaSwag | acc_norm | 35,29 % |
| PIQA | acc_norm | 62,95 % |
| ARC-Easy | acc_norm | 44,19 % |
| ARC-Challenge | acc_norm | 26,19 % |
| WinoGrande | acc | 49,80 % |
| BoolQ | acc | 55,66 % |
| OpenBookQA | acc_norm | 32,60 % |
| CommonsenseQA | acc | 21,21 % |
| LAMBADA | acc | 31,71 % |
| BLiMP | acc | 79,30 % |
| MMLU | acc | 23,98 % |
| WikiText-2 | word_perplexity | 27,67 |
| WikiText-2 | byte_perplexity | 1,86 |
| SciQ | acc_norm | 67,10 % |
| COPA | acc | 69,00 % |
| RACE | acc | 29,09 % |
| SWAG | acc_norm | 52,79 % |
| TruthfulQA MC2 | acc | 41,83 % |

Adicionalmente, el autor reporta una puntuación de 1098,7 Elo en BananaMind Base Bench 1.1 y un 38,30 % en ArithMark 3, superando a Rose-Mini en ambos casos.

## Requisitos de hardware

- VRAM estimada: con 97,8 M de parámetros, los pesos en fp32 ocupan aproximadamente 391 MB; en fp16 serían ~196 MB y en int8 ~98 MB. Esto permite ejecutar el modelo en GPUs con 1 GB de VRAM o incluso en CPU.
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM (ej. NVIDIA GTX 1050, RTX 2050, o integradas). También funciona en CPU con suficiente RAM.
- Compatibilidad con consumer GPU: sí, es perfectamente viable en hardware de consumo.
- Opciones de despliegue: la página de HuggingFace menciona soporte para SGLang y Docker Model Runner. También puede ejecutarse con transformers estándar y, potencialmente, con llama.cpp si se convierte a GGUF (no confirmado).
- Latencia y throughput: al ser un modelo pequeño, la latencia es baja; en CPU puede generar varios tokens por segundo, y en GPU la generación es casi instantánea. No hay cifras oficiales.

## Comparativa con modelos similares

La comparación más directa es con Rose-Mini, el modelo predecesor dentro del mismo proyecto. No se dispone de datos de otros modelos comparables en la información proporcionada.

| Modelo | Parametros | Contexto | ArithMark 3 | BananaMind Elo |
|---|---|---|---|---|
| Rose-Mini | ~49,4 M | 1024 | 36,50 % | 1037 |
| Rose-Medium | 97,82 M | 2048 | 38,30 % | 1098,7 |

Rose-Medium mejora claramente a su hermano pequeño en todas las métricas reportadas, lo que confirma que la arquitectura Rose X1 escala positivamente. Sin embargo, no hay comparaciones con modelos externos como GPT-2 (125 M) o Pythia-70M, por lo que su posicionamiento relativo en el ecosistema general no puede determinarse con los datos disponibles.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo pequeño entrenado en un corpus no especificado, puede generar contenido factualmente incorrecto o reflejar sesgos presentes en los datos. No se han realizado auditorías de sesgo.
- Rendimiento limitado en razonamiento complejo: los resultados en ARC-Challenge (26,19 %) y MMLU (23,98 %) indican dificultades para tareas que requieren razonamiento multi-paso o conocimiento enciclopédico.
- Posible cuello de botella arquitectónico: el autor sospecha que la dimensión oculta de 512 es demasiado pequeña para 24 capas, lo que podría limitar la capacidad de representación. Esta es una hipótesis no confirmada.
- Idioma único: solo soporta inglés, por lo que no es adecuado para aplicaciones multilingües.
- Contexto limitado: 2048 tokens puede ser insuficiente para tareas que requieren dependencias de largo alcance.
- Sin garantías de producción: el modelo es un experimento de investigación; no se han documentado pruebas de robustez ni estabilidad en entornos productivos.
- Licencia permisiva: Apache-2.0 permite uso comercial, pero el autor no ofrece soporte ni garantías.

## Enlaces

- [HuggingFace: GODELEV/Rose-Medium](https://huggingface.co/GODELEV/Rose-Medium)
- [Arquitectura gráfica en hfviewer](https://hfviewer.com/GODELEV/Rose-Medium)
