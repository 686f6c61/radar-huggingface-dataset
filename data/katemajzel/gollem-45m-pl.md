# KateMajzel/GoLLeM-45M-PL

## Resumen

GoLLeM-45M-PL es un modelo de lenguaje GPT-2 de 42,5 millones de parámetros entrenado desde cero sobre 2,96 GB de texto polaco, con un tokenizer BPE byte-level dedicado al polaco de 32 768 posiciones. Desarrollado por KateMajzel como artefacto de un experimento de investigación, responde a la pregunta de si un tokenizer específico para una lengua con diacríticos produce un mejor modelo que el tokenizer genérico de GPT-2 con el mismo presupuesto de entrenamiento. La conclusión del estudio es que no ofrece una ventaja en calidad, pero sí un coste computacional 2,5 veces menor.

El modelo se posiciona como una herramienta de investigación sobre eficiencia de tokenización y no como un producto utilizable en producción. Su relevancia radica en que demuestra, con datos empíricos, que la elección del tokenizer tiene un impacto limitado en el rendimiento final cuando se controla el presupuesto de texto, y que la métrica adecuada para comparar modelos con tokenizers distintos es bits-per-byte (BPB), no perplexity. El experimento ha sido replicado de forma independiente a escala 11B por el equipo de Bielik v3 PL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (8 capas, 8 cabezas, 512 dimensiones) |
| Parametros totales | 42 521 600 (25,7 M no-embedding) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1 024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | polaco |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 estándar: un transformer decoder-only con 8 capas, 8 cabezas de atención y dimensión de modelo 512. El contexto es de 1 024 tokens y el total de parámetros asciende a 42,5 millones, de los cuales 25,7 millones corresponden a pesos no-embedding. Se entrenó durante una sola época sobre 731 millones de tokens (17,2 tokens por parámetro) procedentes del dataset SpeakLeash, con 803 177 documentos. La composición del corpus es: 37% enciclopedia y literatura, 22% foros, 27% web, 11% publicística y ciencia, y 3% textos oficiales. Se excluyeron deliberadamente traducciones, subtítulos, texto sintético, letras de canciones y Common Crawl crudo.

El entrenamiento usó AdamW con tasa de aprendizaje de 1e-3 a 1e-4, precisión bfloat16 y una única GPU RTX 5080, completándose en 49,7 minutos. La innovación principal no está en la arquitectura, sino en el tokenizer: un byte-level BPE con 32 568 posiciones más 200 especiales, del que un 27,9% de las posiciones contienen diacríticos polacos. Este tokenizer consigue una densidad de 1,96 veces más bytes por token que el tokenizer de GPT-2 (4,050 frente a 2,066 bytes/token en el corpus de entrenamiento), lo que reduce el coste computacional. Se bloquearon 199 tokens de relleno no utilizados mediante `bad_words_ids` durante la generación.

## Capacidades

- Generación de texto en polaco a nivel de frase gramaticalmente correcta, aunque con pérdida de coherencia tras varias frases.
- Continuación de texto sin instrucciones (modelo base, sin fine-tuning instructivo).
- Clasificación de texto zero-shot mediante log-likelihood con normalización PMI, evaluada en sentimiento (PolEmo2.0-IN) y topicos (8Tags).
- Modelado de lenguaje con una métrica de BPB de 1,2114 en un held-out privado de SpeakLeash.
- No soporta tool calling, agentes, visión ni audio.
- No es multilingüe: entrenado exclusivamente en polaco.

## Casos de uso

- Investigación académica sobre eficiencia de tokenización: el modelo sirve como punto de referencia para estudiar el impacto del tokenizer en lenguas con diacríticos, permitiendo reproducir el experimento de ablación y comparar métricas como BPB o densidad de tokens.
- Benchmarking de métricas de evaluación: su uso permite validar que la perplexity no es comparable entre modelos con tokenizers distintos, y que BPB es la métrica correcta, un resultado relevante para cualquier equipo que trabaje con modelos multilingües.
- Prototipado de generación de texto en polaco: puede integrarse en pipelines de prueba para validar ideas de producto que requieran generación de texto en polaco a pequeña escala, siempre que no se necesite calidad de producción.
- Estudio de alucinaciones en modelos pequeños: su tendencia a combinar entidades reales en afirmaciones falsas (por ejemplo, "la aldea se encontraba en el distrito de Częstochowa, municipio de Łęczna") lo convierte en un caso de estudio para analizar los límites de los modelos base de baja escala.
- Evaluación de sesgos en datos de foros: al entrenarse con un 22% de contenido de foros, permite investigar cómo se reproducen prejuicios y registros lingüísticos informales en la generación.
- Educación y divulgación: por su pequeño tamaño y licencia MIT, es adecuado para cursos de procesamiento de lenguaje natural donde se quiera mostrar el entrenamiento de un modelo desde cero con recursos limitados.

## Benchmarks y rendimiento

La tabla siguiente resume los resultados declarados por el autor en la model card. Se incluyen las comparaciones con los otros experimentos del estudio (R2a con tokenizer GPT-2 y mismo presupuesto de bytes, R2b con tokenizer GPT-2 y mismo número de tokens, R3 GPT-2 zero-shot).

| Tarea | GoLLeM-45M-PL (R1) | R2a (tokenizer GPT-2) | R2b (tokenizer GPT-2, mismo nº tokens) | GPT-2 zero-shot | Clase mayoritaria |
|---|---|---|---|---|---|
| BPB en SpeakLeash held-out (privado) | 1,2114 (sd 0,0100) | 1,1946 (sd 0,0035) | 1,2756 | 2,9555 | — |
| PolEmo2-IN (accuracy, zero-shot) | 47,2% | 43,8% | — | 20,8% | 40,0% |
| 8Tags (accuracy, zero-shot) | 31,5% | 29,8% | — | 17,8% | 16,5% |

Interpretación del autor: la diferencia de BPB entre dos semillas del mismo modelo (0,0186) supera la diferencia entre modelos con tokenizers distintos (0,0124), lo que indica que no hay una ventaja significativa de un tokenizer sobre otro. Sin embargo, con presupuesto computacional igualado (R1 vs R2b), el tokenizer polaco gana por 5,30% en BPB, equivalente a 6,4 desviaciones estándar. La perplexity por token (30,7 para R1 y 5,8 para R2a) no es comparable entre modelos con tokenizers distintos.

## Requisitos de hardware

- VRAM estimada: el modelo en fp32 ocupa aproximadamente 170 MB, en fp16 unos 85 MB. Cabe en cualquier GPU consumer moderna, incluso en integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, desde una GTX 1050 hasta una RTX 5080 (usada en el entrenamiento). También es viable su ejecución en CPU.
- Es desplegable en hardware de consumo sin restricciones.
- Opciones de despliegue: transformers (pipeline de text-generation), vLLM, llama.cpp, Ollama o TGI. Dado el tamaño, la latencia es de milisegundos incluso en CPU.
- Throughput estimado: no disponible, pero por su escala se espera una generación muy rápida, del orden de cientos de tokens por segundo en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizer | BPB (SpeakLeash held-out) | Licencia |
|---|---|---|---|---|---|
| GoLLeM-45M-PL | 42,5 M | 1 024 | Polaco BPE (32 768) | 1,2114 | MIT |
| R2a (mismo estudio, tokenizer GPT-2) | 51,5 M | 1 024 | GPT-2 (50 257) | 1,1946 | MIT |
| GPT-2 (zero-shot) | 124 M | 1 024 | GPT-2 (50 257) | 2,9555 | MIT |

No se dispone de comparaciones públicas con otros modelos polacos de tamaño similar, como Bielik, en la información proporcionada. La comparativa se limita a los experimentos internos del estudio de ablación.

## Limitaciones y advertencias

- Escala muy reducida: el modelo produce polaco correcto a nivel de frase, pero alucina hechos y pierde coherencia tras varias frases. Un ejemplo documentado: "la aldea se encontraba en el distrito de Częstochowa, municipio de Łęczna", donde ambas entidades existen pero la combinación es falsa.
- Es un modelo base: solo realiza continuación de texto, sin fine-tuning instructivo ni filtrado de seguridad.
- Los datos de foros pueden reproducir prejuicios y lenguaje ofensivo presentes en el corpus. No es apto para aplicaciones con usuarios finales, especialmente menores, sin supervisión humana.
- Los resultados son válidos únicamente para una escala de 42 M de parámetros y 3 GB de datos; no son extrapolables a modelos mayores.
- El registro generado depende del mix de datos: con un prompt de cuento infantil, el modelo responde con lenguaje de foros o de entradas enciclopédicas.
- El corpus contiene finales de línea de Windows (`\r\n`), que el modelo reproduce en sus salidas.
- La perplexity no es comparable entre modelos con tokenizers distintos; debe usarse BPB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KateMajzel/GoLLeM-45M-PL
- Repositorio del experimento (código, datos y metodología): https://github.com/KateMajzel/gollem-pl
- Espejo del modelo: https://huggingface.co/SlayerLab/GoLLeM-45M-PL
- Dataset SpeakLeash: https://speakleash.org/
