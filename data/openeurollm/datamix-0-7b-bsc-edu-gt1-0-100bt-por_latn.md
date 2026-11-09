# openeurollm/datamix-0.7B-bsc-edu-gt1.0-100bt-por_Latn

## Resumen

El modelo `datamix-0.7B-bsc-edu-gt1.0-100bt-por_Latn` es un modelo de lenguaje de 0,7 mil millones de parámetros entrenado desde cero por el proyecto OpenEuroLLM, una iniciativa europea orientada a construir modelos de lenguaje abiertos y multilingües con financiación pública. Se trata de un checkpoint de investigación centrado exclusivamente en portugués (variante Latn), entrenado sobre 100 mil millones de tokens procedentes del corpus HPLT 4, filtrados mediante la puntuación educativa BSC-EDU con un umbral superior a 1,0.

El interés de este modelo no reside tanto en su rendimiento absoluto como en su función dentro de una metodología de ablación: el nombre `datamix` sugiere que forma parte de una familia de experimentos destinados a medir el impacto de distintas estrategias de mezcla y filtrado de datos en el entrenamiento de modelos pequeños. Con 0,7B parámetros y 100B tokens, la ratio de tokens por parámetro es de aproximadamente 143, un régimen de entrenamiento intensivo en datos habitual en los modelos pequeños de última generación.

La licencia Apache 2.0 y el formato safetensors lo hacen directamente utilizable en investigación y en producción, aunque su especialización monolingüe en portugués y su tamaño limitado lo sitúan como una pieza de un ecosistema mayor más que como un asistente de propósito general. El repositorio ocupa 10 GB, lo que resulta coherente con pesos en precisión completa (fp32) para 0,7B parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalles no disponibles) |
| Parametros totales | 0,7B (aproximadamente 700 millones) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32 o bf16) |
| Idiomas soportados | portugues (pt, escritura latina) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch, tag `pt`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de indicar que es un modelo de 0,7B parámetros entrenado desde cero. Por convención en esta familia de modelos pequeños, cabe esperar un transformer decoder-only con atención causal, pero no se confirma en la información disponible ni el número de capas, ni las dimensiones ocultas, ni el tipo de normalización, ni la función de activación, ni la estrategia de positional encoding.

El dato más relevante del entrenamiento es la composición del corpus: 100 mil millones de tokens extraídos de HPLT 4 (High Performance Language Technologies), un corpus multilingüe a gran escala construido a partir de rastreo web, filtrados con el clasificador BSC-EDU aplicando un umbral de puntuación superior a 1,0. Este filtrado busca retener documentos con mayor valor educativo y calidad textual, reduciendo ruido, contenido boilerplate y texto de baja densidad informativa. No se especifica si hubo fases de instrucción, RLHF, DPO u otro tipo de ajuste posterior; el nombre del checkpoint y la ausencia de pipeline en Hugging Face apuntan a un modelo base sin alineamiento.

## Capacidades

- Generación de texto en portugués: continuación de texto y modelado de lenguaje causal sobre documentos en portugués.
- Modelo base sin instrucciones: no se ha documentado un ajuste de instrucciones, por lo que no cabe esperar seguimiento fiable de comandos sin fine-tuning adicional.
- Capacidad multilingüe limitada: el único idioma declarado es el portugués; no hay evidencia de transferencia a otras lenguas.
- Razonamiento y código: no documentados ni evaluados en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre filtrado de datos: el modelo sirve como punto de comparación en experimentos de ablación que miden cómo el umbral BSC-EDU afecta a la calidad del modelo final; se entrenarían variantes con distintos umbrales y se compararían con este checkpoint.
- Modelado de lenguaje específico de dominio en portugués: fine-tuning sobre corpus jurídicos, médicos o técnicos en portugués para tareas de clasificación, extracción o generación asistida, aprovechando que el modelo base ya está expuesto a portugués web de calidad educativa.
- Generación aumentada por recuperación (RAG) en portugués: con un ajuste mínimo de instrucciones, puede emplearse como generador en pipelines RAG sobre documentación interna, aunque su ventana de contexto no está documentada y debe medirse empíricamente.
- Prototipado rápido en entornos con recursos limitados: con 0,7B parámetros cabe en GPU de consumo tras cuantización, lo que permite iterar en local antes de escalar a modelos mayores.
- Evaluación de corpus HPLT 4: análisis de qué tipo de conocimiento y sesgos introduce el filtrado BSC-EDU en un modelo pequeño, útil para quienes diseñan pipelines de datos multilingües.
- Base para destilación o experimentos de decodificación especulativa: por su tamaño reducido puede actuar como modelo borrador en técnicas de speculative decoding junto a modelos mayores del mismo tokenizador, si se valida compatibilidad.
- Educación e investigación académica: al ser Apache 2.0 y entrenado con fondos públicos, es adecuado para cursos y trabajos que necesiten un modelo reproducible en portugués sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 2,8 GB solo para pesos (0,7B × 4 bytes), más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB para inferencia con contexto moderado.
- VRAM estimada en bf16/fp16: aproximadamente 1,4 GB para pesos; alrededor de 3 GB con overhead.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,7 GB para pesos; alrededor de 2 GB con overhead.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,35 GB para pesos; alrededor de 1,5 GB con overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp32; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. Cabe en GPUs de consumo antiguas como GTX 1650 con cuantización.
- Despliegue: compatible con llama.cpp, Ollama y vLLM siempre que se genere primero una conversión a GGUF o se confirme el soporte de la arquitectura concreta; al no documentarse la arquitectura exacta, la conversión debe validarse.
- Latencia y throughput: no disponibles; en una RTX 4090 se espera un throughput alto por el tamaño reducido, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| datamix-0.7B-bsc-edu-gt1.0-100bt-por_Latn | 0,7B | no disponible | pt | Apache 2.0 | Entrenado desde cero sobre 100B tokens de HPLT 4 filtrado con BSC-EDU > 1,0 |
| TinyLlama-1.1B | 1,1B | 2048 tokens | en (principalmente) | Apache 2.0 | Entrenado sobre 3B tokens de corpus inglés; referencia habitual en modelos pequeños |
| Qwen2.5-0.5B | 0,5B | 32 768 tokens | multilingüe | Apache 2.0 | Modelo base con contexto largo y cobertura multilingüe amplia |
| SmolLM2-360M | 0,36B | 8192 tokens | en (principalmente) | Apache 2.0 | Entrenado sobre billones de tokens; orientado a eficiencia |

La comparación directa es limitada porque este checkpoint es un modelo base monolingüe en portugués sin benchmarks publicados; los alternativas citadas cuentan con evaluaciones públicas y contextos documentados, por lo que la elección entre ellos dependerá de si se necesita portugués específicamente o cobertura multilingüe.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no ha pasado por RLHF ni DPO según la información disponible, por lo que puede generar contenido inapropiado, repetitivo o factualmente incorrecto sin filtros.
- Riesgo de alucinación: como todo modelo de lenguaje entrenado sobre texto web, puede producir afirmaciones plausibles pero falsas; el filtrado BSC-EDU reduce ruido pero no elimina el problema.
- Sesgos del corpus: HPLT 4 es un corpus de rastreo web; puede arrastrar sesgos de representación, dominios sobrerrepresentados y contenido de baja calidad que superó el umbral de filtrado.
- Limitación monolingüe: solo se declara portugués; no debe asumirse competencia en otras lenguas, incluido el español, sin evaluación previa.
- Contexto desconocido: al no documentarse la longitud de contexto, cualquier uso en producción debe validar empíricamente el comportamiento más allá de unas pocas miles de tokens.
- Sin garantías de producción: no hay benchmarks, ni evaluación de robustez, ni documentación de tokenizador; para uso comercial conviene realizar una evaluación propia antes de desplegar.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo se distribuye sin garantías; conviene conservar el aviso de licencia y atribución.

## Enlaces

- Hugging Face: https://huggingface.co/openeurollm/datamix-0.7B-bsc-edu-gt1.0-100bt-por_Latn
- Proyecto OpenEuroLLM: no disponible en la información proporcionada
- Corpus HPLT: no disponible en la información proporcionada
- Clasificador BSC-EDU: no disponible en la información proporcionada
