# 360ZhiNao/360Zhinao3-7B-Instruct

## Resumen

360Zhinao3-7B-Instruct es la variante instruida del modelo de lenguaje de 7B parámetros desarrollado por Qihoo 360 (奇虎360), publicado bajo el paraguas de su familia 360Zhinao (360智脑). Se trata de un transformer denso de 7.774.605.312 parámetros (según los pesos en safetensors) que continúa el preentrenamiento de 360Zhinao2-7B con 700.000 millones de tokens adicionales de alta calidad, manteniendo exactamente la misma arquitectura que su predecesor. La mejora de rendimiento respecto a la versión anterior proviene fundamentalmente de la calidad de los datos de entrenamiento, no de cambios estructurales.

El modelo se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones, y está orientado a los idiomas chino e inglés. La familia 360Zhinao3 incluye tres variantes: la base (360Zhinao3-7B), la instruida (objeto de esta ficha) y una variante de cadena de pensamiento larga (360Zhinao3-7B-O1.5). Según la model card, el modelo base alcanza el primer puesto en la media de benchmarks de OpenCompass entre modelos de menos de 10.000 millones de parámetros.

La relevancia de esta ficha radica en que ofrece una alternativa de 7B con licencia permisiva y buen rendimiento en tareas en chino, un nicho donde muchos modelos abiertos de tamaño similar rinden peor. No obstante, la información pública disponible sobre la variante Instruct es limitada: la model card comparte benchmarks del modelo base, no de la versión instruida, y no detalla el proceso de alineación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (misma estructura que 360Zhinao2-7B) |
| Parámetros totales | 7.774.605.312 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para la variante Instruct (la familia 360Zhinao2 ofrece variantes de 4K, 32K y 360K; no se especifica la de este modelo) |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 7.770 millones de parámetros con la misma arquitectura que 360Zhinao2-7B. El preentrenamiento de la familia 360Zhinao3 consistió en un entrenamiento continuado sobre 360Zhinao2-7B con 700.000 millones de tokens de alta calidad; según el autor, la mejora de capacidades se debe principalmente a la mejora en la calidad de los datos más que a cambios arquitectónicos. No se detalla en la información disponible la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación para la variante Instruct. Tampoco se especifican innovaciones técnicas como decodificación especulativa o atención lineal.

La model card menciona que la familia incluye una variante O1.5 con cadena de pensamiento larga, lo que sugiere que el equipo trabaja con técnicas de razonamiento extendido, pero no se confirma que la variante Instruct herede esas capacidades. El repositorio incluye código personalizado (`custom_code`), por lo que la carga requiere `trust_remote_code=True`.

## Capacidades

- Generación de texto en chino e inglés, con especial énfasis en el rendimiento en chino según los benchmarks del modelo base.
- Comprensión lectora y respuesta a preguntas (evaluado en C3, race, BoolQ, commonsense_qa para la base).
- Razonamiento de sentido común y conocimiento enciclopédico (ARC-c, ARC-e, MMLU, CMMLU, ceval).
- Procesamiento de lenguaje natural en tareas de clasificación y similitud semántica (WiC, WSC, eprstmt).
- Generación de resúmenes (lcsts).
- Formato de instrucciones (variante Instruct), aunque no se detalla el formato de plantilla de chat en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada (existe una variante O1.5 separada para cadena de pensamiento).
- Capacidades multimodales (visión, audio): no disponible; el pipeline declarado es `feature-extraction`.

## Casos de uso

- Atención al cliente en chino: el modelo puede gestionar conversaciones multi-turno en chino con buena comprensión contextual (C3 92,77 en la base), adecuado para asistentes de soporte en mercados sinohablantes.
- Generación de resúmenes de documentos: con resultados destacados en lcsts (18,85 en la base, el mejor de la comparativa), es útil para resumir noticias y textos largos en chino.
- Clasificación y moderación de contenido: su rendimiento en eprstmt-dev (92,50 en la base) lo hace apto para análisis de sentimiento y clasificación de opiniones en chino.
- Extracción de características y embeddings: el pipeline declarado es `feature-extraction`, por lo que puede emplearse para generar representaciones vectoriales en tareas de búsqueda semántica o clustering.
- Respuesta a preguntas sobre conocimiento general: con MMLU 75,42 y CMMLU 82,17 en la base, sirve para asistentes de consulta sobre dominios diversos en chino e inglés.
- Fine-tuning específico de dominio: al tener licencia Apache 2.0 y 7B parámetros, es viable ajustarlo con LoRA en una sola GPU para tareas verticales (legal, sanitario, financiero) sin coste de licencia.
- Prototipado e investigación: su tamaño permite experimentación en entornos con recursos limitados, y la disponibilidad de variantes base, instruct y O1.5 facilita estudios comparativos.

## Benchmarks y rendimiento

Los datos publicados corresponden al modelo base 360Zhinao3-7B, no a la variante Instruct. Se presentan a continuación comparados con modelos de tamaño similar, según la model card.

| Dataset | Idioma | 360Zhinao3-7B | Qwen2.5-7B | Llama3.1-8B | glm4-9b | Yi1.5-9B |
|---|---|---|---|---|---|---|
| ceval | zh | 84,70 | 81,41 | 51,67 | 75,83 | 73,51 |
| mmlu | en | 75,42 | 75,50 | 66,75 | 75,50 | 71,43 |
| cmmlu | zh | 82,17 | 81,79 | 52,49 | 74,24 | 74,20 |
| ARC-c | en | 88,14 | 80,00 | 80,68 | 94,92 | 87,46 |
| ARC-e | en | 94,00 | 84,83 | 89,77 | 98,41 | 94,53 |
| WiC | en | 50,31 | 52,82 | 50,00 | 51,57 | 50,63 |
| WSC | en | 71,15 | 68,27 | 67,31 | 68,27 | 66,35 |
| BoolQ | en | 88,38 | 83,88 | 82,20 | 81,80 | 84,46 |
| commonsense_qa | en | 71,33 | 73,22 | 71,25 | 71,17 | 71,58 |
| C3 | zh | 92,77 | 92,00 | 83,51 | 91,51 | 85,86 |
| race-middle | en | 90,04 | 91,02 | 81,69 | 91,99 | 91,16 |
| race-high | en | 85,96 | 87,91 | 78,73 | 90,71 | 88,34 |
| lcsts | zh | 18,85 | 15,82 | 17,29 | 18,29 | 16,49 |
| eprstmt-dev | zh | 92,50 | 86,88 | 83,12 | 91,88 | 91,88 |

No se han publicado resultados de benchmarks de la variante Instruct en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 15,5 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 20-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB; en 4 bits: en torno a 4-5 GB (estimaciones a partir del número de parámetros, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para producción en BF16; RTX 4090 (24 GB) para BF16 en una sola GPU; RTX 3090/4080 (16-24 GB) para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en BF16 y en GPUs de 8-16 GB con cuantización.
- Opciones de despliegue: transformers (requiere `trust_remote_code=True` por el código personalizado); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento (media benchmarks base) |
|---|---|---|---|---|
| 360Zhinao3-7B | 7,77B | no disponible | Apache 2.0 | Primero entre modelos <10B según OpenCompass (media) |
| Qwen2.5-7B | ~7,6B | no disponible en esta ficha | Apache 2.0 (según versión) | Competitivo; mejor en mmlu (75,50) y WiC (52,82) |
| Llama3.1-8B | ~8B | no disponible en esta ficha | Llama 3.1 Community License | Inferior en benchmarks en chino (ceval 51,67; cmmlu 52,49) |
| glm4-9b | ~9B | no disponible en esta ficha | no disponible | Mejor en ARC-c (94,92) y ARC-e (98,41) |

La comparativa se basa en los datos de la model card del modelo base; no se dispone de datos de la variante Instruct frente a las alternativas.

## Limitaciones y advertencias

- La model card no documenta el proceso de alineación de la variante Instruct (RLHF, DPO, SFT), por lo que se desconoce su comportamiento real en instrucciones y su tasa de rechazo.
- Los benchmarks publicados corresponden al modelo base, no a la variante Instruct; extrapolarlos a esta variante es metodológicamente incorrecto.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse principalmente con datos en chino e inglés, es probable que presente sesgos culturales y lingüísticos de esos corpus.
- Riesgo de alucinación: no cuantificado; como todo modelo de 7B, es propenso a inventar datos en dominios especializados.
- Limitaciones de idioma: solo se declaran chino e inglés; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Longitud de contexto: no se especifica para esta variante; la familia anterior ofrecía 4K, 32K y 360K, pero no se confirma cuál aplica aquí.
- Licencia Apache 2.0: permite uso comercial sin restricciones, pero el uso de código personalizado (`custom_code`) obliga a revisar el código del repositorio antes de desplegar en producción.
- El pipeline declarado es `feature-extraction`, lo que puede requerir configuración manual para usarse como modelo de chat generativo.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún muy baja y poca validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/360ZhiNao/360Zhinao3-7B-Instruct
- Modelo base: https://huggingface.co/qihoo360/360Zhinao3-7B
- Variante O1.5: https://huggingface.co/qihoo360/360Zhinao3-7B-O1.5
- Repositorio GitHub: https://github.com/Qihoo360/360zhinao3
- Informe técnico (arXiv): https://arxiv.org/abs/2405.13386
- Organización en Hugging Face: https://huggingface.co/qihoo360
- Sitio web oficial: https://ai.360.com
- Leaderboard C-MTEB: https://huggingface.co/spaces/mteb/leaderboard
