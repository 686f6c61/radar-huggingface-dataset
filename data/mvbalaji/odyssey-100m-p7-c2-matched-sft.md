# mvbalaji/ODYSSEY-100M-P7-C2-MATCHED-SFT

## Resumen

ODYSSEY-100M-P7-C2-MATCHED-SFT es un modelo de lenguaje causal de 100.248.960 parámetros entrenado desde cero por Balaji Venkateswaran (usuario `mvbalaji` en Hugging Face). Es una de las ramas del experimento preinscrito ODYSSEY-100M Fase 7, concretamente el brazo de control C2, obtenido mediante ajuste fino supervisado (SFT) de 1,5 millones de tokens sobre el modelo ODYSSEY-100M-REASONING-SFT-V2. El objetivo del experimento era evaluar si un SFT con datos "emparejados" (mismos objetivos que el brazo C1 pero renderizados solo con los estilos de redacción de la Fase 6) mejoraba la capacidad aritmética del modelo ante formulaciones nunca vistas durante el entrenamiento.

El modelo es relevante fundamentalmente como artefacto de investigación metodológica: bajo las puertas preinscritas del experimento, ninguna rama superó los criterios (Fase 7 = NO-GO), por lo que el conjunto de confirmación reservado nunca se abrió. Los resultados publicados proceden del split de selección y están sujetos a optimismo de selección. El autor lo publica explícitamente como el control de C1 y advierte que no está promovido ni confirmado.

La arquitectura es un transformer causal de implementación propia (no una clase de `transformers`), con tokenizador propio, contexto de 1.024 tokens y entrenamiento realizado en una única GPU RTX 4060 de 8 GB. El modelo está orientado a inglés, razonamiento aritmético elemental y algo de código, con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal de implementación propia (`modeling_odyssey.py`, no es una clase de `transformers`) |
| Parámetros totales | 100.248.960 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (posiciones más largas producen error) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (solo para lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con código PyTorch independiente incluido |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con tokenizador propio, sin cambios respecto a ODYSSEY-100M-REASONING-SFT-V2. No incorpora WSP, compilador ni cabezas adicionales. El modelo base se entrenó desde cero en dos etapas de preentrenamiento (2,0B y 5,0B tokens), seguido de un SFT de 10M tokens (Fase 5) y un SFT calibrado por pasos de 2M tokens (Fase 6, V2). Esta rama C2 aplica un SFT de parámetros completos sobre V2 con tasa de aprendizaje 2e-5, 45 pasos y 1.470.666 tokens (853.762 supervisados), semilla 1234, sobre una RTX 4060 de 8 GB.

Los datos de preentrenamiento declarados son FineWeb-Edu (sample-10BT), FineMath (finemath-4plus) y codeparrot/github-code-clean (solo ficheros bajo MIT, Apache-2.0, BSD-2/3-Clause, ISC, CC0-1.0 o Unlicense). El SFT emplea GSM8K, MBPP, OASST1 y self-oss-instruct, con datos sintéticos generados y verificados localmente. El brazo C2 usa un control emparejado: objetivos idénticos a C1 pero renderizados únicamente con los estilos de redacción de la Fase 6. El formato de prompt es `### Instruction:\n{task}\n\n### Response:\n`, con respuestas matemáticas terminadas en `Final answer: X` seguido de EOS. No se aplicó RLHF ni DPO.

## Capacidades

- Generación de texto causal en inglés con decodificación greedy y parada en EOS.
- Aritmética elemental: 0,917 de precisión en aritmética simple con redacción de Fase 6 (120 problemas) y 0,572 en aritmética con formulaciones nunca entrenadas (360 problemas).
- Razonamiento matemático básico derivado del SFT sobre GSM8K, con formato de respuesta `Final answer: X`.
- Generación de código limitada: el modelo base incluye datos de GitHub y MBPP, pero el rendimiento en familias de código no vistas cayó de 0,175 a 0,075 tras este SFT.
- No dispone de tool calling ni function calling.
- No dispone de soporte para agentes ni razonamiento multi-paso más allá de la cadena de respuesta entrenada.
- Multilingüe: solo inglés; no hay soporte para otros idiomas.
- Sin modo thinking, visión ni audio.

## Casos de uso

- Investigación metodológica sobre SFT y control de datos: el modelo sirve como brazo de control en experimentos preinscritos para medir el efecto de la diversidad de redacciones en la generalización aritmética, comparándolo directamente con C1 y C3.
- Reproducción de experimentos a pequeña escala: al entrenarse en una RTX 4060 de 8 GB y publicarse el código de carga, permite replicar el pipeline de SFT y las evaluaciones pareadas en hardware de consumo.
- Estudio de olvido catastrófico en modelos pequeños: los datos publicados muestran que más SFT sobre redacciones antiguas degrada el rendimiento en redacciones nuevas y duplica los fallos por distractores (0,36 → 0,14), lo que lo convierte en un caso práctico para analizar este fenómeno.
- Evaluación de formatos de prompt: el formato fijo `### Instruction:` / `### Response:` y el terminador `Final answer: X` permiten probar la robustez del modelo ante variaciones controladas de instrucción.
- Docencia y divulgación: sirve para ilustrar el ciclo completo de preentrenamiento, SFT y evaluación con puertas preinscritas en un modelo de 100M parámetros.
- Pruebas de infraestructura de inferencia: el repositorio incluye `example.py` y `modeling_odyssey.py`, útiles para validar cargas de safetensors y tokenizadores en pipelines propios, sin depender de `transformers`.

## Benchmarks y rendimiento

Resultados en el split de selección de la Fase 7 (comparación pareada frente a V2, bootstrap agrupado por problema). Proceden del split de selección y están sujetos a optimismo de selección; el conjunto de confirmación nunca se abrió.

| Medida | V2 | Este modelo |
|---|---:|---:|
| PRIMARIA: aritmética con redacciones nunca entrenadas (360) | 0,594 | 0,572 (−0,022 [−0,072, +0,026]) |
| Aritmética simple, redacción de Fase 6 (120) | 0,933 | 0,917 |
| Comparación por pares | — | brazo de control |
| Δ NLL de dev general / matemáticas / código | — | −0,001 / −0,001 / −0,003 |

Notas adicionales publicadas: los fallos por distractores pasaron de 0,36 a 0,14 y el rendimiento en código de familias no vistas cayó de 0,175 a 0,075. El modelo falló las puertas G1 y G2; G2 estaba infrapotenciada (una rama sin cambios también la falla) y G6 comparó salidas generadas con composiciones de batch distintas (V2 sin cambios también la falla). Las puertas no se relajaron.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 100,25M parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 0,4 GB, por lo que la inferencia cabe holgadamente en cualquier GPU de consumo moderna.
- GPU recomendadas: el modelo se entrenó en una RTX 4060 de 8 GB; cualquier GPU con al menos 2-4 GB de VRAM libre debería ser suficiente para inferencia en fp32 o fp16.
- Cabe en GPU de consumo: sí, en RTX 4060, RTX 3060, RTX 4090 y similares; también es viable en CPU.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma nativa, ya que la arquitectura es propia y no una clase de `transformers`. El despliegue se realiza con el código incluido en el repositorio (`modeling_odyssey.py` y `example.py`) usando `torch`, `safetensors`, `tokenizers` y `huggingface_hub`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento aritmético | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| ODYSSEY-100M-P7-C2-MATCHED-SFT | 100,25M | 1.024 | 0,572 en redacciones no entrenadas; 0,917 en redacción Fase 6 | Apache 2.0 | Hugging Face, código propio incluido |
| ODYSSEY-100M-REASONING-SFT-V2 | 100,25M | 1.024 | 0,594 en redacciones no entrenadas; 0,933 en redacción Fase 6 | Apache 2.0 | Hugging Face; mejor modelo registrado de la familia |
| ODYSSEY-100M-P7-C1-DIVERSE-SFT | 100,25M | 1.024 | no disponible en la información proporcionada | Apache 2.0 | Hugging Face; rama experimental con SFT diverso |
| ODYSSEY-100M-P7-C3-RL | 100,25M | 1.024 | no disponible en la información proporcionada | Apache 2.0 | Hugging Face; rama experimental con RL de respuesta exacta |

No se dispone de comparación con modelos de terceros de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación de 100M parámetros, experimental y no promovido; los resultados no están confirmados y proceden del split de selección.
- Alucina hechos con seguridad y entra en bucles con decodificación greedy en texto libre.
- Es mayoritariamente incorrecto en código y en aritmética más allá de casos simples.
- Sin ajuste de seguridad ni RLHF: puede reproducir texto dañino o sesgado procedente de datos web.
- No debe usarse para nada que requiera respuestas correctas (uso médico, legal, financiero, de seguridad o factual).
- Solo inglés para lenguaje natural; contexto máximo de 1.024 tokens, con error si se superan posiciones más largas.
- El SFT de esta rama degradó el rendimiento en redacciones no familiares y en código de familias no vistas, y duplicó los fallos por distractores.
- Las puertas preinscritas G2 y G6 presentaban defectos de diseño divulgados por el autor (infrapotenciación y comparación entre composiciones de batch distintas); las puertas no se relajaron.
- Licencia Apache 2.0 para pesos y código; los datos de entrenamiento tienen términos propios (FineWeb-Edu ODC-By 1.0 y términos de CommonCrawl; FineMath ODC-By 1.0; GSM8K MIT; MBPP CC-BY-4.0; OASST1 Apache-2.0; self-oss-instruct ODC-By con texto generado por modelo, revisar los términos de salida de StarCoder2 para usos más allá de investigación).
- La arquitectura propia implica que no funcionará con herramientas estándar del ecosistema `transformers` sin adaptación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvbalaji/ODYSSEY-100M-P7-C2-MATCHED-SFT
- Modelo base: https://huggingface.co/mvbalaji/ODYSSEY-100M-REASONING-SFT-V2
- Mejor modelo registrado de la familia: https://huggingface.co/mvbalaji/ODYSSEY-100M-REASONING-SFT-V2
- Base 2,0B tokens: https://huggingface.co/mvbalaji/ODYSSEY-100M-2B-BASE
- Base 5,0B tokens: https://huggingface.co/mvbalaji/ODYSSEY-100M-5B-BASE
- SFT V1 (Fase 5): https://huggingface.co/mvbalaji/ODYSSEY-100M-REASONING-SFT-V1
- Rama C1 (SFT diverso): https://huggingface.co/mvbalaji/ODYSSEY-100M-P7-C1-DIVERSE-SFT
- Rama C3 (RL de respuesta exacta): https://huggingface.co/mvbalaji/ODYSSEY-100M-P7-C3-RL
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset codeparrot/github-code-clean: https://huggingface.co/datasets/codeparrot/github-code-clean
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset MBPP: https://huggingface.co/datasets/google-research-datasets/mbpp
