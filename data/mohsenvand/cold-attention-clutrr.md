# mohsenvand/cold-attention-clutrr

## Resumen

Cold-attention-clutrr es un sistema de razonamiento multi-salto sobre texto que combina un modelo de lenguaje congelado (Qwen2.5-7B-Instruct) con un bloque de atención simbólica ("cold attention") entrenado por separado. Lo desarrolla el usuario mohsenvand y se publica bajo licencia Apache 2.0. El objetivo es resolver CLUTRR, el benchmark de razonamiento de parentesco a partir de historias cortas: dado un relato que encadena k relaciones familiares, hay que nombrar la relación entre la primera y la última persona entre 20 posibles.

La propuesta técnica es poco habitual: el modelo de lenguaje no se entrena ni se modifica. Solo se usa como lector de pares de personas, y un bloque de atención aprendido compone esas lecturas mediante una tabla de reglas aprendida de las respuestas del propio dataset. El sistema no incluye pesos de un modelo nuevo, sino un mapa lineal de 75.285 pesos y una tabla de reglas; el repositorio pesa 0,0 GB y se distribuye en formato safetensors con código numpy.

Es relevante porque explora si un modelo congelado de 7B puede acercarse a sistemas con GPT-4o o GPT-5 en razonamiento composicional, y porque documenta de forma explícita un atajo de razonamiento: el lector entrenado solo con respuestas no lee mejor, sino que usa nombres de relación sobrantes como códigos internos. Los resultados son modestos (64,6% de acierto en el primer split, 66,6% en el segundo) y el propio autor lo sitúa por debajo de GPT-5 y de GPT-4o con reglas escritas a mano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje congelado (Qwen2.5-7B-Instruct) + bloque de atención simbólica ("cold attention") con tabla de reglas aprendida |
| Parametros totales | No disponible como modelo único; el lector entrenado es un mapa lineal de 75.285 pesos; el modelo base Qwen2.5-7B-Instruct tiene 7B (congelado, no se distribuye) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el benchmark CLUTRR es en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; librería numpy |

## Arquitectura y entrenamiento

El sistema tiene tres piezas. Primero, un lector: Qwen2.5-7B-Instruct congelado recibe en su plantilla de chat el contexto de cada par ordenado de personas cuyos nombres aparecen a lo sumo a dos posiciones de distancia en la secuencia de nombres de la historia, junto con un ejemplo inventado, y completa la frase "[B] is [A]'s ___" con una palabra de parentesco o "unknown". Se conservan la palabra y su probabilidad. Segundo, un read-in entrenado: un mapa lineal de 75.285 pesos desde el estado de la última capa del modelo hasta 21 puntuaciones (las 20 relaciones más "nada declarado"), que arranca como ajuste a la lectura propia del modelo y luego se entrena solo con las respuestas de las historias de entrenamiento, sin etiquetar hechos. Tercero, el bloque: para cada par ordenado de personas, 20 bits (uno por relación); una regla aprendida (a, b da c) activa el bit c en (A, C) cuando el bit a está activo en (A, B) y el b en (B, C) para alguna persona B, y los bits nunca se desactivan. La tabla de reglas se aprende de las respuestas a historias de entrenamiento de 2 relaciones con un bucle y luego se congela; 40 números (escala y offset por relación) leen la respuesta en el par de la pregunta.

Hay dos tablas distintas. El bloque sobre grafos aprendió su tabla de los grafos del benchmark: exactamente las 62 reglas de CLUTRR en las seis ejecuciones. Los órganos de texto usan la "tabla maestra", que el bloque de bits aprendió en la fase zero-shot a partir de las lecturas del modelo congelado sobre las historias de entrenamiento, sin ver nunca los grafos; contiene entre 74 y 81 reglas (60 a 62 de las 62 de CLUTRR, más 12 a 19 extra). La "cost read" aplica la misma tabla con un número en lugar de cada bit: una relación leída cuesta el -log de su probabilidad, una relación derivada cuesta su derivación más barata y la respuesta es la relación más barata en el par de la pregunta; en caso de empate o de historia sin derivación se usa la respuesta del bloque de bits. El autor documenta un atajo de razonamiento (Marconato y otros, NeurIPS 2023): el read-in entrenado solo con respuestas lee las relaciones declaradas con menos fidelidad que el propio modelo (77-81% frente a 89-90%) y reutiliza nombres de relación sobrantes como códigos propios (una madre declarada se lee como "mother-in-law", un padre como "father-in-law", aunque ninguna historia de CLUTRR declara in-laws), y su tabla compone esos códigos en la respuesta correcta.

## Capacidades

- Razonamiento multi-salto sobre texto: encadena cadenas de hasta 10 relaciones de parentesco y responde la relación entre los extremos.
- Lectura de relaciones a partir de contexto textual mediante un modelo congelado, sin entrenamiento del modelo base.
- Composición de reglas aprendidas: tabla de reglas derivada de las respuestas, no escrita a mano.
- Respuesta con abstención ("unknown" / "nada declarado") en el lector.
- Funcionamiento en modo zero-shot del lector (sin entrenar el read-in) y en modo entrenado solo con respuestas.
- Inferencia sobre grafos del benchmark sin modelo de lenguaje (bloque de bits puro).
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni multi-step reasoning general fuera del esquema de pares y reglas.
- Capacidades multilingües: no documentadas.
- No incluye visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Investigación en razonamiento composicional: reproducir el experimento de CLUTRR para estudiar cómo un modelo congelado de 7B se comporta como lector y qué aprende un bloque simbólico encima; el repositorio incluye el código numpy necesario.
- Análisis de atajos de razonamiento: usar el sistema para estudiar el fenómeno de Marconato y otros, comparando la fidelidad de lectura del read-in entrenado (77-81%) con la del modelo solo (89-90%) y detectando códigos internos espurios.
- Evaluación de lectores congelados: medir la calidad de las lecturas de Qwen2.5-7B-Instruct sobre pares de entidades en texto corto, con la plantilla de chat y el ejemplo incluido.
- Prototipado de motores de reglas aprendidos: el bloque de bits y la cost read sirven como base para sistemas de derivación simbólica sobre relaciones binarias aprendidas de datos.
- Docencia sobre neuro-simbólico: el sistema separa claramente lector neuronal y motor simbólico, lo que lo hace útil para explicar híbridos y sus límites.
- Verificación de grafos de parentesco: el bloque sobre grafos acierta 1.039 de 1.048 historias del primer split y 1.139 de 1.146 del segundo (tres semillas), por lo que puede usarse como oráculo de reglas en experimentos controlados.

## Benchmarks y rendimiento

Precisión en test, todas las historias (k = 2 a 10), media de tres semillas:

| Sistema | Primer split (1.048 historias) | Segundo split (1.146 historias) |
|---|---:|---:|
| Read-in entrenado desde las respuestas, cost read | 64,6% (64,6 / 64,1 / 65,2) | 66,6% (66,2 / 66,8 / 66,8) |
| Lectura zero-shot, cost read | 56,5% (56,9 / 56,9 / 55,8) | 60,6% (59,6 / 61,1 / 61,0) |
| Lectura zero-shot, bloque de bits | 34,6% | 36,9% |
| Modelo congelado solo, paso a paso | 33,3% | 38,0% |
| Modelo congelado solo, una palabra | 31,3% | 34,3% |
| Grafo de entrada, sin modelo de lenguaje | 100% en k=2 a 10 (1.039/1.048 y 1.139/1.146) | — |

Referencias externas citadas por el autor en los mismos ficheros de test: GPT-5 (medium reasoning) zero-shot 73,2% y GPT-4o con módulo de reglas (answer-set solver con reglas escritas a mano) 67,7% en el primer split; GPT-4o paso a paso 57,6%; DSR-LM 60,98% en el segundo split.

Resultados por número de relaciones (media de tres semillas, %), primer split (entrenado con historias de 2, 3 y 4 relaciones):

| | k=2 | k=3 | k=4 | k=5 | k=6 | k=7 | k=8 | k=9 | k=10 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Read-in entrenado, cost read | 95 | 75 | 54 | 68 | 63 | 62 | 62 | 63 | 56 |
| Lectura zero-shot, cost read | 87 | 61 | 58 | 61 | 55 | 53 | 51 | 53 | 51 |
| Lectura zero-shot, bloque de bits | 87 | 49 | 44 | 45 | 40 | 26 | 25 | 18 | 19 |
| Grafo de entrada (sin LM) | 100 | 95 | 95 | 100 | 100 | 100 | 100 | 100 | 100 |
| Modelo congelado solo, paso a paso | 63 | 33 | 34 | 37 | 33 | 30 | 33 | 27 | 30 |

Segundo split (entrenado con 2 y 3 relaciones):

| | k=2 | k=3 | k=4 | k=5 | k=6 | k=7 | k=8 | k=9 | k=10 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Read-in entrenado, cost read | 94 | 77 | 76 | 74 | 67 | 63 | 54 | 53 | 55 |
| Lectura zero-shot, ... | (datos truncados en la model card) | | | | | | | | |

## Requisitos de hardware

- El repositorio pesa 0,0 GB: no incluye los pesos de Qwen2.5-7B-Instruct, que deben descargarse aparte.
- Para ejecutar el lector hace falta Qwen2.5-7B-Instruct completo: en fp16 requiere aproximadamente 14-16 GB de VRAM; en cuantización de 4 bits, del orden de 4-5 GB (estimación, no publicada en la model card).
- GPU recomendadas: A100 o H100 para fp16 sin cuantizar; RTX 4090 (24 GB) para fp16; RTX 3090/4080 o superiores para cuantización 4-8 bits.
- El bloque de bits y la cost read son operaciones numpy sobre un grafo de 20 bits por par de personas; se ejecutan en CPU sin GPU.
- Opciones de despliegue del lector: transformers con el modelo base; llama.cpp/Ollama/vLLM/TGI para el modelo base, aunque la model card no documenta integración con estos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Enfoque | Precisión en CLUTRR (primer split) | Licencia / disponibilidad |
|---|---|---:|---|
| cold-attention-clutrr | LM congelado 7B + bloque simbólico aprendido | 64,6% (read-in entrenado, cost read) | Apache 2.0; pesos del read-in y código numpy en HF |
| GPT-5 (medium reasoning) | LLM cerrado, zero-shot | 73,2% | Propietaria |
| GPT-4o con módulo de reglas | LLM cerrado + answer-set solver con reglas a mano | 67,7% | Propietaria |
| DSR-LM (Zhang y otros, 2023) | Lector fine-tuned + motor lógico diferenciable | 60,98% (segundo split) | No disponible en la información proporcionada |
| Qwen2.5-7B-Instruct solo | LLM abierto, paso a paso | 33,3% | Apache 2.0 |

## Limitaciones y advertencias

- El propio autor lo declara: no es un estado del arte en CLUTRR; queda por debajo de GPT-5 y de GPT-4o con reglas escritas a mano.
- Atajo de razonamiento documentado: el read-in entrenado solo con respuestas lee peor las relaciones declaradas (77-81% frente a 89-90%) y usa nombres de relación sobrantes como códigos internos; las mejoras en respuesta no implican mejor lectura.
- La tabla maestra usada por los órganos de texto contiene 12 a 19 reglas extra respecto a las 62 de CLUTRR, lo que puede introducir derivaciones no válidas.
- El sistema está diseñado específicamente para CLUTRR y parentesco; no generaliza a otros dominios sin reentrenar el bloque.
- El benchmark es en inglés; no hay información sobre otros idiomas.
- Depende de Qwen2.5-7B-Instruct, que no se distribuye en el repositorio y debe obtenerse por separado.
- Licencia Apache 2.0 permite uso comercial del código y pesos publicados, pero conviene revisar la licencia del modelo base Qwen2.5-7B-Instruct.
- Riesgo de alucinación en el lector: el modelo congelado puede producir relaciones no declaradas, y el bloque las propaga si la tabla las compone.
- Resultados con solo tres semillas y dos splits; la varianza entre semillas es pequeña (por ejemplo, 64,6 / 64,1 / 65,2), pero la cobertura experimental es limitada.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/mohsenvand/cold-attention-clutrr
- CLUTRR (Sinha y otros, 2019): benchmark de razonamiento de parentesco (referencia citada en la model card, sin URL explícita)
- Path-of-Thoughts (arXiv 2412.17963): referencia comparativa citada en la model card
- DSR-LM (Zhang y otros, 2023): referencia comparativa citada en la model card
- Marconato y otros, NeurIPS 2023: referencia sobre atajos de razonamiento citada en la model card
- Qwen2.5-7B-Instruct: modelo base, disponible en Hugging Face (URL no incluida en la información proporcionada)
