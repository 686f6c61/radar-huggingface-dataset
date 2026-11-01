# ireana/Carbon-X

## Resumen

Carbon-X es un modelo de lenguaje decoder-only de 14.800 millones de parámetros desarrollado por Hugging Face Bio (publicado bajo el identificador `ireana/Carbon-X` en Hugging Face) y afinado a partir de Qwen3-14B. Su particularidad es que se entrena de forma conjunta sobre secuencias de ADN y texto en lenguaje natural dentro de un único flujo de tokens y un único decoder, sin codificador de ADN separado. El modelo resuelve tareas de genómica computacional —predicción de efecto de variantes, identificación de regiones reguladoras, clasificación taxonómica de secuencias y predicción del siguiente nucleótido— respondiendo en inglés y explicando su razonamiento.

La relevancia del modelo está en su relación coste/rendimiento: promedia 66,7 % en cinco benchmarks de ADN con el modo de razonamiento desactivado, 27 puntos por encima de Qwen3-14B y cerca de GPT-6.1 Sol (67,5 %) con un coste de inferencia estimado de aproximadamente 1/1.800 por problema. Además, los pesos en bfloat16 caben en una sola GPU de 80 GB, lo que permite mantener secuencias sensibles o no publicadas en infraestructura propia.

Arquitectura transformer con 40 capas, hidden size 5120, GQA (40 cabezas de consulta, 8 de clave/valor), SwiGLU y RMSNorm con QK-norm. La ventana de contexto es de 40.960 tokens y el tokenizador es híbrido: vocabulario BPE de Qwen3 para texto más 5.515 tokens de ADN, donde cada token de ADN cubre 6 pares de bases (6-mers).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM), 40 capas, hidden size 5120, GQA (40 query heads, 8 KV heads), SwiGLU, RMSNorm con QK-norm |
| Parametros totales | 14.822.046.720 (14,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | No disponible (la model card solo documenta bfloat16; el repo publica safetensors) |
| Idiomas soportados | Ingles (segun la model card y los metadatos del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 29,7 GB) |

## Arquitectura y entrenamiento

Carbon-X parte de Qwen3-14B y conserva su arquitectura transformer decoder-only densa: 40 capas, dimensión oculta 5120, atención con query grouping (40 cabezas de consulta y 8 de clave/valor), activación SwiGLU y normalización RMSNorm con QK-norm. La innovación estructural principal es el tokenizador híbrido: mantiene el vocabulario BPE de Qwen3 para texto y añade 5.515 tokens específicos de ADN, compuestos por 4.096 6-mers, 1.364 tokens de cola para secuencias cuya longitud no es múltiplo de 6 y los marcadores `<dna>`, `</dna>` y `<oov>`. El ADN se detecta y etiqueta automáticamente en el prompt, y cada token de ADN representa 6 pares de bases, lo que reduce la longitud efectiva de las secuencias.

El entrenamiento consta de una fase de mid-training de 302.000 millones de tokens sobre ADN, texto de biología, inglés y datos de instrucciones, seguida de supervised fine-tuning y aprendizaje por refuerzo con recompensas verificables sobre tareas de ADN. El modelo se post-entrena y evalúa con el modo de pensamiento desactivado (`enable_thinking=False`), lo que reduce el número de tokens de salida por problema. La generación usa por defecto temperatura 0,6, top-p 0,95 y top-k 20, definidos en `generation_config.json`.

## Capacidades

- Predicción de efecto de variantes: clasifica mutaciones como benignas o patógenas y explica el razonamiento en inglés.
- Identificación de regiones reguladoras que controlan la actividad génica.
- Clasificación de secuencias por grupo de organismo (taxonomía).
- Predicción del siguiente nucleótido (next-base prediction) sobre secuencias de ADN.
- Generación de texto y razonamiento en lenguaje natural combinados con secuencias de ADN en la misma respuesta.
- Conversación multi-turno dentro de una ventana de 40.960 tokens.
- Uso como herramienta de un agente: la model card documenta una sección específica para integrar Carbon-X como tool de un agente.
- Capacidad multilingüe limitada al inglés según los metadatos del repositorio.
- No se documentan capacidades de visión, audio ni tool calling nativo en la información disponible.

## Casos de uso

- Triaje de variantes de significado incierto en investigación genómica: dado un par referencia/variante, el modelo emite una clasificación benigno/patógeno con justificación. La model card estima que analizar los 2,4 millones de variantes de significado incierto de ClinVar costaría unos 300 dólares con Carbon-X frente a 32.000-4.000.000 con modelos frontera.
- Anotación de regiones reguladoras en pipelines de secuenciación: se pueden pegar secuencias directamente en el chat y obtener una descripción de elementos reguladores candidatos, útil como paso previo a validación experimental.
- Clasificación taxonómica de secuencias metagenómicas: el modelo clasifica secuencias por grupo de organismo, lo que permite un cribado rápido antes de análisis filogenéticos más costosos.
- Predicción de siguientes bases para control de calidad y ensamblado: útil para detectar discontinuidades o errores en lecturas largas antes de pasar a herramientas especializadas.
- Asistente conversacional para biólogos computacionales: al responder en inglés y explicar el razonamiento, sirve como interfaz de lenguaje natural sobre herramientas de genómica en entornos de investigación.
- Despliegue en infraestructura propia con datos sensibles: los pesos en bfloat16 caben en una GPU H200 de 80 GB, de modo que secuencias no publicadas o sujetas a confidencialidad no salen de la organización.
- Componente de un agente de análisis genómico: la model card incluye una sección sobre su uso como herramienta dentro de un agente, lo que permite orquestar llamadas a Carbon-X desde flujos multi-paso.

## Benchmarks y rendimiento

| Benchmark / metrica | Carbon-X | Qwen3-14B (base) | GPT-6.1 Sol |
|---|---|---|---|
| Media en cinco benchmarks de ADN (thinking desactivado) | 66,7 % | 39,7 % (27 puntos menos) | 67,5 % |
| Coste de inferencia por problema (relativo) | 1x | No disponible | ~1.800x |
| Liderazgo en efectos de variantes codificantes | Si (segun model card) | No disponible | No disponible |
| Liderazgo en next-base prediction | Si (segun model card) | No disponible | No disponible |

La model card indica que Carbon-X queda por delante de todos los modelos abiertos evaluados y lidera en efectos de variantes codificantes y predicción del siguiente nucleótido. No se detallan los resultados individuales por benchmark (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 29,7 GB de pesos, más overhead de activaciones y caché KV; encaja con holgura en una GPU de 80 GB (A100 80 GB, H100 80 GB, H200).
- Consumer GPU: no cabe en tarjetas de 24 GB en bfloat16; sería necesario cuantizar, y la model card no documenta cuantizaciones oficiales (GGUF, AWQ, GPTQ) en la información disponible.
- Despliegue recomendado: vLLM con `--trust-remote-code` en una sola GPU; también es compatible con Transformers v5 o superior (requisito explícito) y con text-generation-inference según los tags del repositorio.
- Throughput: la model card cita mediciones de throughput por hora de H200 a 5 dólares/hora para estimar costes, pero no publica cifras absolutas de tokens por segundo.
- Latencia: no disponible; el modelo responde sin razonamiento extendido, lo que reduce el número de tokens de salida por problema.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media benchmarks ADN | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Carbon-X | 14,8B | 40.960 | 66,7 % | Apache 2.0 | Pesos abiertos en Hugging Face |
| Qwen3-14B (modelo base) | 14B | No disponible en la informacion | 39,7 % | Apache 2.0 | Pesos abiertos |
| GPT-6.1 Sol | No disponible | No disponible | 67,5 % | Propietaria | Solo API |

La comparación se limita a los modelos citados en la model card. No se dispone de datos de otros modelos abiertos de genómica (por ejemplo, Evo o Nucleotide Transformer) en la información proporcionada, por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- El modelo solo está documentado y evaluado en inglés; no se garantiza un rendimiento equivalente en castellano u otros idiomas.
- Los resultados de benchmarks provienen del propio autor del modelo; no se han verificado de forma independiente en la información disponible.
- Riesgo de alucinación en la justificación biológica: las explicaciones en lenguaje natural pueden sonar plausibles sin estar respaldadas por evidencia experimental; requiere validación por expertos.
- Sesgos potenciales derivados de los datos de entrenamiento (302.000 millones de tokens de ADN, biología, inglés e instrucciones), no cuantificados en la model card.
- El tokenizador de ADN es código personalizado: es obligatorio `trust_remote_code=True` y Transformers v5 o superior, lo que añade riesgo de cadena de suministro y fricción en despliegues.
- La ventana de 40.960 tokens limita el tamaño de las secuencias analizables en una sola pasada; secuencias mayores requieren fragmentación.
- El modelo está post-entrenado con `enable_thinking=False`; activar el modo de pensamiento puede degradar el comportamiento respecto a lo reportado.
- Licencia Apache 2.0 permite uso comercial, pero la model card no ofrece garantías ni avales clínicos: no debe usarse para diagnóstico médico sin validación regulatoria.

## Enlaces

- Hugging Face: https://huggingface.co/ireana/Carbon-X
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Blog / Space de lanzamiento: https://huggingface.co/spaces/HuggingFaceBio/Carbon-X-Release
- Organización Hugging Face Bio: https://huggingface.co/HuggingFaceBio
- Código: https://github.com/huggingface/carbon/tree/main
