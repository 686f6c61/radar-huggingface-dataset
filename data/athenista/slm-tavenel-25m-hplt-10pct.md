# athenista/slm-tavenel-25m-hplt-10pct

## Resumen

SLM-Tavenel 25M HPLT 10% continuation es un modelo experimental de lenguaje bilingüe (inglés y francés) desarrollado por el autor athenista como artefacto de investigación. Se trata de una continuación del checkpoint SLM-Tavenel 25M EXP-0009, entrenada durante 1.500 pasos adicionales sobre una mezcla congelada de datos compuesta por un 90% del corpus French-Science-Commons (FSC) y aproximadamente un 10% de un subconjunto derivado de HPLT (High Performance Language Technologies, rastros web europeos). El objetivo del experimento es medir si la adaptación de dominio a datos de web rastreados mejora la modelización del lenguaje en ese dominio sin degradar las capacidades generales.

Es un modelo pequeño por diseño: 25.723.648 parámetros exactos, un transformador decoder-only de 20 capas con una puerta de atención por cabezal (head-wise attention gate) y una ventana de contexto de 1.024 tokens. Su relevancia no radica en competir con modelos de producción, sino en servir como sujeto de estudio controlado: el experimento compara pares de entrenamiento con la misma semilla, mismo optimizador y mismo presupuesto de tokens, lo que permite aislar el efecto de la mezcla de datos. El autor publica explícitamente que las revisiones de derechos de fuente y privacidad de los datos de entrenamiento no están resueltas, y lo ofrece únicamente como artefacto de trazabilidad de investigación bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 20 capas con puerta de atención por cabezal (head-wise attention gate) |
| Parametros totales | 25.723.648 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (solo pesos en precisión original) |
| Idiomas soportados | Inglés y francés |
| Licencia | MIT (código y artefacto del modelo; no re-licencia los datasets de origen) |
| Formato de pesos | Safetensors (`model.safetensors`, con hashes SHA-256 en `provenance.json`) |

Datos adicionales: anchura del modelo de 256, 4 cabezales de consulta (query) y 2 cabezales clave-valor (key-value), lo que sugiere atención agrupada tipo GQA. Tokenizador byte-level BPE de 8.192 tokens heredado sin cambios del checkpoint EXP-0009.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 20 capas con anchura 256 y una innovación concreta: una puerta de atención a nivel de cabezal (head-wise attention gate). Emplea 4 cabezales de consulta frente a 2 cabezales clave-valor, un patrón de atención agrupada que reduce el tamaño de la caché KV. El vocabulario es un BPE a nivel de byte de solo 8.192 tokens, muy compacto comparado con los 32.000-256.000 tokens habituales, lo que implica secuencias más largas por unidad de texto pero un embedding mucho más pequeño, coherente con el tamaño total de 25,7 millones de parámetros.

El entrenamiento de esta variante es una continuación de 1.500 pasos (49.152.000 posiciones de token) desde el checkpoint EXP-0009, con optimizador AdamW y semilla 20261028. La mezcla de datos está congelada: 90% de posiciones procedentes del flujo de escalado FSC (PleIAs/French-Science-Commons) y aproximadamente el 10% de un flujo determinista derivado de HPLT (ashtok897/european-hplt-v1, revisión fijada `51edb798...`), equilibrado entre inglés y francés. El diseño experimental es emparejado y de misma semilla: un brazo de tratamiento con la mezcla 90/10 y un control que continuó solo con FSC, ambos idénticos en tokenizador, inicialización, optimizador, semilla y presupuesto de tokens. El split de test de HPLT se mantuvo fuera del entrenamiento y se evaluó una única vez tras fijar la receta. No hay indicios de RLHF ni DPO: es un modelo base entrenado solo con modelización de lenguaje.

## Capacidades

- Generación de texto básica en inglés y francés como modelo base (no instruido ni alineado).
- Modelización de lenguaje sobre texto científico francés (por la línea de datos FSC) y texto web europeo (por la mezcla HPLT).
- Comprensión de lectura medida en benchmarks como Belebele (inglés y francés) con precisión bruta de 0,28-0,31, apenas por encima del azar en tareas de opción múltiple.
- Razonamiento de sentido común limitado: HellaSwag 0,274 y WinoGrande 0,517, valores propios de un modelo de 25M de parámetros.
- Sin soporte de tool calling, function calling ni agentes: es un modelo base experimental sin capacidades de instrucción.
- Sin capacidades multimodales (sin visión, audio ni código entrenado específicamente).

## Casos de uso

- Investigación en adaptación de dominio: replicar o extender el experimento emparejado de mezcla FSC/HPLT para estudiar cómo los datos de web rastreados afectan a la perplejidad fuera de dominio; el paquete incluye manifiestos, hashes y configuraciones completas para reproducibilidad.
- Estudio de mezclas de datos a escala diminuta: el diseño de misma semilla con brazo control lo hace idóneo como banco de pruebas barato (menos de 50 millones de posiciones de token por continuación) para metodologías de evaluación de datos.
- Investigación en tokenizadores byte-level BPE compactos: el vocabulario de 8.192 tokens permite estudiar compromisos entre tamaño de vocabulario y calidad de modelización en modelos muy pequeños.
- Educación y docencia en NLP: su tamaño (0,1 GB) permite entrenarlo, finetunearlo y analizarlo íntegramente en hardware modesto, ideal para prácticas de cursos sobre transformers.
- Línea base para destilación o poda: como modelo base bilingüe de 25M, puede servir de punto de partida para experimentos de compresión, cuantización extrema o destilación hacia modelos aún más pequeños.
- Análisis de memorización y privacidad en datos de web crawls: la publicación explícita de que no hay revisión de privacidad lo convierte en caso de estudio para auditorías de memorización de datos de Common Crawl/Internet Archive.

No es adecuado para asistentes conversacionales, generación de código, agentes ni ningún sistema de producción.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparando el tratamiento (mezcla 90/10 FSC/HPLT) frente al control emparejado (solo FSC). Menor BPB (bits por byte) es mejor en las filas de BPB; mayor precisión es mejor en las de opción múltiple.

| Evaluacion | Ingles (control / tratamiento) | Frances (control / tratamiento) | Diferencia |
|---|---|---|---|
| BPB en test HPLT (held-out) | 1,54603 / **1,47279** | 1,35556 / **1,29059** | −0,0732 (en) / −0,0650 (fr) |
| BPB en validacion FSC | 1,10299 / 1,10421 | 1,02416 / 1,02493 | +0,0012 (en) / +0,0008 (fr) |

| Tarea | Solo FSC | HPLT 10% | Diferencia | Intervalo 95% emparejado |
|---|---:|---:|---:|---|
| ARC-Easy | 0,3161 | 0,3194 | +0,0034 | [−0,0088, +0,0152] |
| ARC-Challenge | 0,1877 | 0,1869 | −0,0009 | [−0,0154, +0,0145] |
| HellaSwag | 0,2757 | 0,2736 | −0,0022 | [−0,0054, +0,0010] |
| Belebele ingles | 0,2811 | 0,2789 | −0,0022 | [−0,0144, +0,0111] |
| Belebele frances | 0,3156 | 0,3078 | −0,0078 | [−0,0211, +0,0056] |
| WinoGrande | 0,5185 | 0,5170 | −0,0016 | [−0,0197, +0,0166] |

Interpretación del autor: la adaptación a HPLT reduce BPB en documentos held-out de HPLT de forma estadísticamente significativa, con un ligero aumento de BPB en FSC; todos los intervalos de precisión en opción múltiple incluyen el cero, es decir, no hay mejora demostrada en capacidades generales. Es un único par de semillas y no estima variación entre semillas de entrenamiento ni establece leyes de escalado.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 0,1 GB; en fp32 el modelo ocupa en torno a 100 MB de pesos, más overhead de activaciones y caché KV, por lo que unos 0,5 GB de VRAM o incluso CPU son suficientes.
- GPU recomendadas: no se necesita GPU dedicada; cualquier GPU moderna sirve. Para entrenamiento o continuación similar, una GPU de consumo (RTX 3060, RTX 4090) es más que suficiente dado el tamaño de 25,7M de parámetros.
- Cabe sobradamente en GPUs de consumo de gama baja e incluso en portátiles sin GPU discreta.
- Opciones de despliegue: librería `transformers` de Hugging Face (requisito declarado en la model card); compatible con cualquier pipeline estándar de PyTorch. El uso de `custom_code` puede requerir `trust_remote_code=True` al cargarlo. No hay indicios de soporte directo en vLLM, llama.cpp u Ollama (no hay pesos GGUF publicados).
- Latencia y throughput: no disponibles; por tamaño, se espera inferencia muy rápida incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SLM-Tavenel 25M HPLT 10% (este) | 25,7M | 1.024 | MIT | Base experimental bilingüe en/fr, adaptación de dominio HPLT |
| SLM-Tavenel 25M EXP-0009 (padre) | 25,7M | 1.024 | MIT | Base entrenado solo con FSC, sin mezcla HPLT |
| SmolLM2 135M (HuggingFaceTB) | 135M | 2.048 | Apache 2.0 | Base/instruct generalista multilingüe a escala diminuta |
| Qwen2.5-0.5B | 494M | 32.768 | Qwen (uso comercial permitido con condiciones) | Base/instruct generalista, mucho más capaz pero más grande |

Comparado con alternativas de producción, este modelo es notablemente inferior en capacidades generales (precisión de opción múltiple cercana al azar en varias tareas) y contexto (1.024 tokens). Su valor diferencial es la trazabilidad experimental completa (semillas, mezclas, hashes, intervalos emparejados), algo que los modelos generalistas no publican con ese nivel de detalle.

## Limitaciones y advertencias

- Estado legal de los datos no resuelto: el autor declara expresamente que la revisión de derechos de la línea FSC y la revisión de derechos y privacidad página a página de los datos derivados de HPLT siguen pendientes. La licencia MIT cubre el código y el artefacto, pero no re-licencia los datasets ni supone autorización legal.
- Sin certificación OSI, sin aprobación de privacidad y sin declaración de ausencia de memorización; los datos provienen de rastros web (Internet Archive y Common Crawl vía HPLT), con riesgo de contenido con derechos residuales o datos personales.
- Modelo base sin alineación: generará texto sin control de instrucciones, sin filtros de seguridad y con riesgo alto de alucinación y contenido ofensivo o incorrecto.
- Capacidades muy limitadas: precisión en benchmarks de opción múltiple cercana al azar en varias tareas (ARC-Challenge 0,19, HellaSwag 0,27); no apto para uso en producción.
- Contexto corto de 1.024 tokens y vocabulario de solo 8.192 tokens byte-level, que produce secuencias largas por unidad de texto.
- Resultados basados en un único par de semillas: no generalizan a otras semillas ni establecen leyes de escalado; el split de test de HPLT ya se usó y no debería guiar ajustes adicionales.
- Uso de `custom_code` en el repositorio, que exige `trust_remote_code=True` y revisión del código antes de ejecutarlo.
- Etiquetado explícito como experimental y research-artifact: no mantener en el tiempo ni garantizar compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/athenista/slm-tavenel-25m-hplt-10pct
- Modelo padre (SLM-Tavenel 25M EXP-0009): https://huggingface.co/athenista/slm-tavenel-25m
- Dataset PleIAs/French-Science-Commons: https://huggingface.co/datasets/PleIAs/French-Science-Commons
- Dataset ashtok897/european-hplt-v1 (revisión fijada): https://huggingface.co/datasets/ashtok897/european-hplt-v1/tree/51edb798468aa71b1000e950d3ab43bb435f72cd
- Paper, demo y repositorio de código adicional: no disponibles
