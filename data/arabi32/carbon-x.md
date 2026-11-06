# Arabi32/Carbon-X

## Resumen

Carbon-X es un modelo de lenguaje decoder-only de 14.800 millones de parámetros desarrollado por el equipo de Hugging Face Bio (publicado bajo el identificador Arabi32/Carbon-X) y afinado a partir de Qwen/Qwen3-14B. Su particularidad es que ha sido entrenado conjuntamente sobre secuencias de ADN y texto en lenguaje natural, compartiendo un único flujo de tokens en un solo decoder, sin encoder de ADN separado. Está pensado para tareas de genómica: predicción de efecto de variantes (benigna o patógena), identificación de regiones reguladoras, clasificación taxonómica de secuencias y predicción del siguiente nucleótido, siempre respondiendo en inglés y con razonamiento explicable.

La arquitectura es un transformer causal estándar de 40 capas, tamaño oculto 5120, atención GQA con 40 cabezas de consulta y 8 de clave/valor, activación SwiGLU y RMSNorm con QK-norm. Incorpora un tokenizador híbrido que mantiene el vocabulario BPE de Qwen3 para texto y añade 5.515 tokens de ADN (4.096 6-mers, 1.364 tokens de cola para longitudes no múltiplas de 6 y los marcadores `<dna>`, `</dna>` y `<oov>`), de modo que cada token de ADN cubre 6 pares de bases. La ventana de contexto es de 40.960 tokens.

El modelo es relevante porque ofrece un rendimiento cercano a modelos frontera en benchmarks de ADN a un coste de inferencia muy inferior, y porque sus pesos caben en una única GPU de 80 GB en bfloat16, lo que permite mantener secuencias sensibles o no publicadas en infraestructura propia. Se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal con GQA, SwiGLU y RMSNorm con QK-norm |
| Parametros totales | 14.822.046.720 (14,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | no disponible (los pesos se publican en bfloat16; el autor no documenta cuantizaciones) |
| Idiomas soportados | en (inglés); entrada de ADN como secuencia |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Carbon-X es un transformer decoder-only de 40 capas con tamaño oculto 5120, atención con query grouping (40 cabezas de consulta, 8 de clave/valor), SwiGLU y RMSNorm con QK-norm. La innovación principal es el tokenizador híbrido: mantiene el vocabulario BPE de Qwen3 para texto y añade 5.515 tokens de ADN, compuestos por 4.096 6-mers, 1.364 tokens de cola para secuencias cuya longitud no es múltiplo de 6 y los marcadores `<dna>`, `</dna>` y `<oov>`. El ADN presente en el prompt se detecta y etiqueta automáticamente, y tanto ADN como texto comparten un único flujo de tokens en el mismo decoder, sin encoder separado.

El entrenamiento consta de una fase de mid-training de 302.000 millones de tokens sobre ADN, texto de biología, inglés y datos de instrucciones, seguida de un ajuste supervisado (SFT) y aprendizaje por refuerzo con recompensas verificables sobre tareas de ADN. El modelo fue post-entrenado y evaluado con el modo de razonamiento extendido desactivado (`enable_thinking=False`), y el autor recomienda mantenerlo así. Los parámetros de muestreo por defecto son temperatura 0,6, top-p 0,95 y top-k 20.

## Capacidades

- Predicción de efecto de variantes: clasifica mutaciones como benignas o patógenas y explica el razonamiento.
- Identificación de regiones que controlan la actividad génica.
- Clasificación de secuencias por grupo de organismo.
- Predicción de las siguientes bases de una secuencia de ADN.
- Generación de respuestas que combinan ADN y lenguaje natural en un mismo turno.
- Conversación multi-turno en formato chat con plantilla de chat estándar.
- Razonamiento explicable: el modelo justifica sus conclusiones en inglés.
- Entrada de secuencias de ADN pegadas directamente en el prompt, con etiquetado automático.
- Compatible con tool calling y uso como herramienta dentro de un agente (el autor documenta una sección específica para ello).
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Triaje de variantes de significado incierto en ClinVar: el modelo puede analizar variantes y clasificarlas como benignas o patógenas con razonamiento, a un coste estimado de unos 300 dólares para los 2,4 millones de variantes de significado incierto, frente a los 32.000-4 millones de dólares de los modelos frontera evaluados.
- Investigación genómica con datos sensibles: al caber en una única GPU de 80 GB en bfloat16, permite procesar secuencias no publicadas o confidenciales en infraestructura propia sin enviarlas a APIs externas.
- Anotación de variantes en pipelines de secuenciación: integrable vía vLLM con API compatible con OpenAI para clasificar variantes en lote dentro de flujos bioinformáticos.
- Identificación de regiones reguladoras: útil para priorizar candidatos en estudios de expresión génica y epigenómica.
- Predicción del siguiente nucleótido: aplicable a tareas de modelado de secuencia y exploración de regiones genómicas.
- Clasificación taxonómica de secuencias: para agrupar secuencias por grupo de organismo en estudios metagenómicos.
- Asistente conversacional especializado en biología: responde preguntas sobre secuencias y explica su razonamiento en inglés, útil para formación y documentación.
- Herramienta dentro de un agente: el autor documenta su uso como tool para agentes que necesiten analizar ADN.

## Benchmarks y rendimiento

| Benchmark / métrica | Carbon-X | Qwen3-14B (base) | GPT-6.1 Sol |
|---|---|---|---|
| Media en cinco benchmarks de ADN (sin thinking) | 66,7% | 39,7% (27 puntos menos) | 67,5% |
| Coste por problema relativo | 1x (referencia) | no disponible | ~1.800x |

Los cinco benchmarks cubren predicción de efecto de variantes, comprensión de secuencias y predicción del siguiente nucleótido. Carbon-X lidera en efecto de variantes de codificación y predicción del siguiente nucleótido entre todos los modelos evaluados. No se detallan en la información disponible los resultados individuales por benchmark ni las puntuaciones de otros modelos open evaluados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 29,7 GB en bfloat16 (los pesos caben en una GPU de 80 GB con margen para contexto y KV cache).
- GPU recomendadas: una única GPU de 80 GB (A100 80GB, H100 80GB, H200) en bfloat16; el autor menciona mediciones de throughput por hora de H200 a 5 dólares/hora.
- GPU de consumo: no se documenta soporte en GPUs consumer; con 14,8B parámetros haría falta cuantización a 8 o 4 bits para caber en tarjetas de 24 GB, pero el autor no publica pesos cuantizados ni instrucciones al respecto.
- Opciones de despliegue: vLLM (`vllm serve HuggingFaceBio/Carbon-X --trust-remote-code`), transformers v5 o superior con `trust_remote_code=True` para el tokenizador, y text-generation-inference (según los tags del repositorio).
- Latencia y throughput: no disponible de forma detallada; el autor reporta que el modelo responde directamente sin razonamiento extendido, por lo que cada problema consume pocos tokens de salida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media benchmarks ADN | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Carbon-X | 14,8B | 40.960 | 66,7% | Apache 2.0 | Hugging Face, vLLM, transformers |
| Qwen3-14B (base) | 14,8B (aprox.) | no disponible | 39,7% (27 puntos menos) | no disponible | Hugging Face |
| GPT-6.1 Sol | no disponible | no disponible | 67,5% | propietaria | API |
| Otros modelos open evaluados | no disponible | no disponible | por debajo de Carbon-X | no disponible | no disponible |

La comparativa se limita a los datos publicados en la model card. No se dispone de información sobre otros modelos open especializados en ADN evaluados por el autor.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado principalmente en inglés; las respuestas y la comprensión de instrucciones en otros idiomas no están garantizadas.
- Fue post-entrenado y evaluado con `enable_thinking=False`; el autor recomienda mantener el razonamiento extendido desactivado, por lo que el modo thinking puede degradar resultados.
- Riesgo de alucinación inherente a los modelos de lenguaje: las explicaciones biológicas pueden ser plausibles pero incorrectas, y no deben tomarse como evidencia clínica sin validación.
- Sesgos potenciales derivados de los datos de entrenamiento (ADN, biología e inglés), no documentados en detalle por el autor.
- La ventana de contexto de 40.960 tokens limita el tamaño de las secuencias analizables en una sola conversación.
- Requiere `trust_remote_code=True` para el tokenizador y transformers v5 o superior, lo que añade dependencias y riesgo de ejecución de código del repositorio.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo no es un dispositivo médico ni un sistema de diagnóstico validado; su uso en contextos clínicos requiere validación independiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la comunidad aún no ha validado su comportamiento en producción.
- No se documentan cuantizaciones oficiales ni soporte en GPUs de consumo, lo que limita su despliegue fuera de hardware de centro de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Arabi32/Carbon-X
- Model card de referencia: https://huggingface.co/HuggingFaceBio/Carbon-X
- Blog / demo: https://huggingface.co/spaces/HuggingFaceBio/Carbon-X-Release
- Organización Hugging Face Bio: https://huggingface.co/HuggingFaceBio
- Código: https://github.com/huggingface/carbon/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
