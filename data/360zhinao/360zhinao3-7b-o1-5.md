# 360ZhiNao/360Zhinao3-7B-O1.5

## Resumen

360Zhinao3-7B-O1.5 es un modelo de lenguaje de 7.774 millones de parámetros desarrollado por Qihoo 360 (奇虎360) dentro de su familia 360Zhinao3 (360智脑). Se trata de la variante orientada a razonamiento de cadena larga ("long thought chain") de la serie, publicada el 14 de abril de 2025 junto con los modelos base e Instruct. El modelo parte de 360Zhinao2-7B y se somete a un preentrenamiento continuo con 700.000 millones de tokens de alta calidad, manteniendo exactamente la misma arquitectura que su predecesor; la mejora de capacidades proviene principalmente de la calidad de los datos de entrenamiento.

El modelo se distribuye con licencia Apache 2.0 y está pensado para uso comercial gratuito. Soporta chino e inglés, se integra en la librería Transformers mediante código personalizado y se publica en formato safetensors (BF16). Su relevancia radica en que compite en la franja de modelos por debajo de 10.000 millones de parámetros, donde el autor reporta primeros puestos en múltiples benchmarks de OpenCompass, y en que ofrece un modo de razonamiento extendido (O1.5) que lo aproxima a las capacidades de modelos de razonamiento de mayor tamaño.

La ficha del repositorio en Hugging Face lo etiqueta con el pipeline `feature-extraction`, aunque la model card lo describe como un modelo de lenguaje de razonamiento; conviene tener en cuenta esta discrepancia al integrarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (misma estructura que 360Zhinao2-7B); detalles internos no disponibles |
| Parametros totales | 7.774.605.312 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible para esta variante O1.5 (la familia 360Zhinao2 ofrece variantes de 4K, 32K y 360K) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; cuantizaciones de terceros no confirmadas) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La información disponible indica que 360Zhinao3-7B-O1.5 mantiene exactamente la misma arquitectura que 360Zhinao2-7B, sobre la que se aplica un preentrenamiento continuo con 700.000 millones de tokens de alta calidad. El autor atribuye la mejora de rendimiento a la calidad de los datos más que a cambios estructurales. No se detalla en la información proporcionada el tipo de atención, el número de capas, la dimensionalidad oculta ni si se emplean técnicas como atención lineal o decodificación especulativa.

La variante O1.5 se describe como un modelo de "cadena de pensamiento larga" (long thought chain), lo que sugiere un entrenamiento orientado a razonamiento extendido, aunque no se especifican en la información disponible los detalles del proceso de alineación (RLHF, DPO u otros), la composición exacta del dataset ni la longitud de contexto efectiva durante el entrenamiento.

## Capacidades

- Generación de texto en chino e inglés.
- Razonamiento de cadena larga (modo "long thought chain" propio de la variante O1.5).
- Comprensión lectora y respuesta a preguntas de conocimiento (evaluado en C3, race, BoolQ, commonsense_qa).
- Razonamiento sobre exámenes y conocimiento académico (ceval, cmmlu, mmlu, ARC).
- Tareas de inferencia lingüística y desambiguación (WiC, WSC).
- Resumen y generación de titulares en chino (lcsts).
- Análisis de sentimiento y clasificación de opiniones (eprstmt).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente, aunque el modo de razonamiento largo es afín a estos flujos.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Razonamiento matemático y lógico en producción: el modo de cadena de pensamiento larga permite abordar problemas de varios pasos (cálculo, demostraciones, puzzles lógicos) generando trazas de razonamiento antes de la respuesta final, lo que facilita la verificación y la depuración del resultado.
- Asistencia en educación y exámenes: con puntuaciones destacadas en ceval (84,7) y cmmlu (82,17), el modelo es adecuado para tutores automáticos que resuelven preguntas tipo test y explican el razonamiento en chino.
- Procesamiento de documentación técnica en chino e inglés: tareas de comprensión lectora y extracción de información (evaluado en C3 y race) para resumir manuales, informes o artículos.
- Análisis de opiniones y moderación de contenido: la buena puntuación en eprstmt-dev (92,50) lo hace apto para clasificar sentimiento y detectar opiniones en reseñas o redes sociales en chino.
- Generación de resúmenes y titulares: útil en agregadores de noticias o sistemas de sindicación que necesitan condensar textos largos en chino (lcsts).
- Investigación en razonamiento de modelos pequeños: al ser un modelo de 7B con licencia Apache 2.0 y modo de razonamiento explícito, sirve como base para estudiar destilación de cadenas de pensamiento o para fine-tuning en dominios verticales.
- Despliegue en entornos con recursos limitados: sus 7.774 millones de parámetros permiten ejecución en una sola GPU de consumo con cuantización, lo que habilita prototipos y servicios de baja latencia sin infraestructura de centro de datos.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden al modelo base 360Zhinao3-7B (no específicamente a la variante O1.5). Se presentan a continuación tal como aparecen en la información proporcionada, comparando con modelos de tamaño similar.

| Dataset | Idioma | glm4-9b | Qwen2.5-7B | internlm2.5-7b | Yi1.5-9B | gemma2-9b | Llama3.1-8B | 360Zhinao2-7B | 360Zhinao3-7B |
|---|---|---|---|---|---|---|---|---|---|
| ceval | zh | 75,83 | 81,41 | 77,71 | 73,51 | 56,36 | 51,67 | 83,04 | **84,7** |
| mmlu | en | 75,5 | 75,5 | 71,55 | 71,43 | 72,22 | 66,75 | 67,84 | 75,42 |
| cmmlu | zh | 74,24 | 81,79 | 78,77 | 74,2 | 58,89 | 52,49 | 73,8 | **82,17** |
| ARC-c | en | 94,92 | 80 | 85,08 | 87,46 | 77,63 | 80,68 | 87,12 | 88,14 |
| ARC-e | en | 98,41 | 84,83 | 95,24 | 94,53 | 78,84 | 89,77 | 92,77 | 94 |
| WiC | en | 51,57 | 52,82 | 50,78 | 50,63 | 50,47 | 50 | 49,84 | 50,31 |
| WSC | en | 68,27 | 68,27 | 69,23 | 66,35 | 68,27 | 67,31 | 65,38 | **71,15** |
| BoolQ | en | 81,8 | 83,88 | 89,51 | 84,46 | 85,6 | 82,2 | 88,29 | 88,38 |
| commonsense_qa | en | 71,17 | 73,22 | 68,55 | 71,58 | 68,47 | 71,25 | 69,78 | 71,33 |
| C3 | zh | 91,51 | 92 | 93,04 | 85,86 | 81,64 | 83,51 | 93,26 | 92,77 |
| race-middle | en | 91,99 | 91,02 | 92,06 | 91,16 | 88,09 | 81,69 | 90,46 | 90,04 |
| race-high | en | 90,71 | 87,91 | 90,08 | 88,34 | 82,08 | 78,73 | 86,74 | 85,96 |
| lcsts | zh | 18,29 | 15,82 | 15,96 | 16,49 | 10,62 | 17,29 | 18,61 | **18,85** |
| eprstmt-dev | zh | 91,88 | 86,88 | 91,25 | 91,88 | 48,12 | 83,12 | 90 | **92,50** |

No se han publicado resultados de benchmarks específicos de la variante O1.5 en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 15,5 GB solo para pesos, más overhead de activaciones y caché KV (el repositorio ocupa 15,5 GB).
- Cuantización a 8 bits: en torno a 8 GB de VRAM; a 4 bits, en torno a 4-5 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para BF16; RTX 3090/4090 o GPUs consumer de 12-24 GB con cuantización.
- Cabe en GPU de consumo: sí, con cuantización en GPUs de 8-24 GB; en BF16 requiere al menos 16 GB de VRAM efectiva.
- Opciones de despliegue: Transformers (librería declarada), con código personalizado (`custom_code`); compatibilidad con vLLM, llama.cpp, Ollama o TGI no confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Rendimiento destacado |
|---|---|---|---|---|---|
| 360Zhinao3-7B-O1.5 | 7,77B | no disponible | Apache 2.0 | zh, en | ceval 84,7 y cmmlu 82,17 (base 360Zhinao3-7B) |
| Qwen2.5-7B | 7B | no disponible en la información | no disponible | multilingüe | ceval 81,41, cmmlu 81,79, mmlu 75,5 |
| glm4-9b | 9B | no disponible en la información | no disponible | zh, en | ARC-c 94,92, ARC-e 98,41 |
| Llama3.1-8B | 8B | no disponible en la información | no disponible | multilingüe | mmlu 66,75, ARC-e 89,77 |
| internlm2.5-7b | 7B | no disponible en la información | no disponible | zh, en | BoolQ 89,51, C3 93,04 |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse principalmente con datos en chino e inglés, puede presentar sesgos culturales y lingüísticos propios de esas fuentes.
- Riesgo de alucinación: inherente a los modelos generativos de 7B; el modo de razonamiento largo puede producir cadenas de pensamiento plausibles pero incorrectas, por lo que se recomienda verificación en producción.
- Limitaciones de contexto: la longitud de contexto de la variante O1.5 no se especifica; la familia 360Zhinao2 ofrecía variantes de 4K, 32K y 360K, pero no se confirma cuál aplica aquí.
- Cobertura idiomática limitada a chino e inglés; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- La model card etiqueta el pipeline como `feature-extraction`, lo que puede inducir a error si se espera un uso conversacional directo; requiere revisar la configuración de generación.
- Requiere `trust_remote_code=True` por el uso de código personalizado, lo que implica ejecutar código del autor.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos de los datos de entrenamiento subyacentes, no detallados en la información disponible.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/360ZhiNao/360Zhinao3-7B-O1.5
- Repositorio GitHub de la familia: https://github.com/Qihoo360/360zhinao3
- Organización en Hugging Face: https://huggingface.co/qihoo360
- Sitio oficial: https://ai.360.com
- Informe técnico (arXiv): https://arxiv.org/abs/2405.13386
- Modelo base 360Zhinao3-7B: https://huggingface.co/qihoo360/360Zhinao3-7B
- Modelo Instruct 360Zhinao3-7B-Instruct: https://huggingface.co/qihoo360/360Zhinao3-7B-Instruct
- Leaderboard C-MTEB: https://huggingface.co/spaces/mteb/leaderboard
