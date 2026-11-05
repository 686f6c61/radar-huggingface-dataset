# eyes-ml/Carbon-X

## Resumen

Carbon-X es un modelo de lenguaje decoder-only de 14.800 millones de parámetros desarrollado por eyes-ml (publicado bajo el paraguas de Hugging Face Bio) y afinado a partir de Qwen/Qwen3-14B. Su particularidad es que ha sido entrenado de forma conjunta sobre secuencias de ADN y texto en lenguaje natural, de modo que acepta ADN crudo dentro de una conversación de chat ordinaria y responde en inglés explicando su razonamiento. Resuelve tareas de genómica computacional como la predicción de efecto de variantes (benigna o patógena), la identificación de regiones reguladoras, la clasificación taxonómica de secuencias y la predicción del siguiente par de bases.

La arquitectura es un transformer causal estándar de 40 capas, hidden size 5120, atención GQA (40 cabezas de consulta, 8 de clave-valor), SwiGLU y RMSNorm con QK-norm. No hay codificador de ADN separado: ADN y texto comparten un único flujo de tokens gracias a un tokenizador híbrido que mantiene el vocabulario BPE de Qwen3 para texto y codifica el ADN como 6-mers no solapados (un token de ADN cubre 6 pares de bases).

Es relevante ahora porque ofrece un rendimiento medio del 66,7 % en cinco benchmarks de ADN (27 puntos por encima de su modelo base) con un coste de inferencia muy inferior al de los modelos frontera, y porque sus pesos caben en una única GPU de 80 GB en bfloat16, lo que permite mantener secuencias sensibles o no publicadas en infraestructura propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (40 capas, hidden size 5120, GQA 40 query heads / 8 KV heads, SwiGLU, RMSNorm con QK-norm) |
| Parametros totales | 14.822.046.720 (14,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | no disponible (la model card solo documenta bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Carbon-X es un transformer causal denso sin innovaciones de atención exóticas: GQA para reducir el coste de la caché KV, SwiGLU en las MLP y RMSNorm con QK-norm para estabilidad del entrenamiento. La innovación principal está en la entrada: un tokenizador híbrido que combina el vocabulario BPE de Qwen3 para texto con 5.515 tokens de ADN, compuestos por 4.096 6-mers, 1.364 tokens de cola para secuencias cuya longitud no es múltiplo de 6 y los marcadores `<dna>`, `</dna>` y `<oov>`. El ADN presente en el prompt se detecta y etiqueta automáticamente, de modo que el modelo procesa secuencias y lenguaje en un único flujo de tokens.

El entrenamiento consta de una fase de mid-training de 302.000 millones de tokens sobre ADN, texto de biología, inglés y datos de instrucción, seguida de supervised fine-tuning y reinforcement learning con recompensas verificables sobre tareas de ADN. El modelo fue post-entrenado y evaluado con el modo de razonamiento extendido desactivado (`enable_thinking=False`), y el autor recomienda mantenerlo así. Los parámetros de muestreo por defecto son temperatura 0,6, top-p 0,95 y top-k 20.

## Capacidades

- Predicción de efecto de variantes: clasifica mutaciones como benignas o patógenas y explica el razonamiento.
- Comprensión de secuencias de ADN: identifica regiones que controlan la actividad génica y clasifica secuencias por grupo de organismos.
- Predicción del siguiente par de bases en una secuencia.
- Generación con salida mixta: las respuestas pueden contener tanto ADN como lenguaje natural.
- Conversación multi-turno en inglés dentro de una ventana de 40.960 tokens.
- Razonamiento explicado: el modelo justifica sus conclusiones en lenguaje natural, sin cadena de pensamiento extendida.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: la model card menciona el uso de Carbon-X como herramienta para un agente, pero no detalla un protocolo de agente nativo.
- Capacidades multilingües: limitadas al inglés según los metadatos del modelo.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Triaje de variantes de significado incierto en investigación genómica: el modelo clasifica variantes de ClinVar como benignas o patógenas con una explicación en inglés, y el autor estima que analizar los 2,4 millones de variantes de significado incierto costaría unos 300 dólares con Carbon-X frente a entre 32.000 y 4 millones con modelos frontera.
- Anotación de variantes en pipelines de secuenciación clínica: se puede servir con vLLM en una única GPU y procesar lotes de variantes manteniendo los datos genómicos dentro de la infraestructura del hospital o laboratorio.
- Identificación de regiones reguladoras: dado un fragmento de ADN, el modelo señala regiones candidatas a controlar la actividad génica, útil como primer filtro antes de validación experimental.
- Clasificación taxonómica de secuencias: asignar secuencias desconocidas a grandes grupos de organismos en estudios de metagenómica.
- Predicción de siguientes bases para completar secuencias: apoyo a tareas de extensión o verificación de secuencias en proyectos de biología sintética.
- Asistente conversacional para biólogos computacionales: un chat que acepta ADN pegado directamente y responde en lenguaje natural, útil para exploración interactiva sin escribir código.
- Herramienta dentro de un agente biológico: la model card documenta su uso como herramienta invocable por un agente de nivel superior para resolver subconsultas genómicas.

## Benchmarks y rendimiento

| Benchmark / metrica | Carbon-X | Qwen3-14B (base) | GPT-6.1 Sol |
|---|---|---|---|
| Media en cinco benchmarks de ADN (thinking desactivado) | 66,7 % | 39,7 % (27 puntos por debajo) | 67,5 % |
| Predicción de efecto de variantes en variantes codificantes | lider entre los modelos evaluados | no disponible | no disponible |
| Predicción del siguiente par de bases | lider entre los modelos evaluados | no disponible | no disponible |

Los cinco benchmarks cubren predicción de efecto de variantes, comprensión de secuencias y predicción del siguiente par de bases. El desglose por benchmark individual no está disponible en la información proporcionada. El coste por problema se mide como throughput por hora de H200 a 5 dólares/hora para Carbon-X; para los modelos comparados se usa el precio estándar de API.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 29,7 GB de pesos, más caché KV y activaciones; cabe holgadamente en una GPU de 80 GB.
- GPU recomendadas: H200 o A100/H100 de 80 GB para servir en bfloat16 con contexto completo; una RTX 4090 de 24 GB no es suficiente en bfloat16.
- Consumer GPU: no cabe en bfloat16 en GPUs de 24 GB; requeriría cuantización, para la que no se documentan formatos en la información disponible.
- Despliegue: vLLM (`vllm serve HuggingFaceBio/Carbon-X --trust-remote-code`), transformers v5 o superior con `trust_remote_code=True`, y endpoints compatibles con la API de OpenAI.
- Latencia y throughput: el autor reporta el throughput medido por hora de H200 como referencia de coste, pero no publica cifras absolutas de tokens por segundo en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media benchmarks ADN | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Carbon-X | 14,8B | 40.960 | 66,7 % | apache-2.0 | HuggingFace (eyes-ml/Carbon-X) |
| Qwen3-14B | 14B | no disponible en esta ficha | 39,7 % | no disponible en esta ficha | HuggingFace |
| GPT-6.1 Sol | no disponible | no disponible | 67,5 % | propietaria | API |
| Otros modelos abiertos evaluados | no disponible | no disponible | por debajo de Carbon-X | no disponible | no disponible |

La comparativa se limita a los datos publicados en la model card; no se dispone de cifras de benchmarks de ADN para alternativas abiertas específicas de genómica.

## Limitaciones y advertencias

- El modelo solo está entrenado y evaluado en inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Está diseñado para responder sin razonamiento extendido; activar el modo thinking puede degradar la calidad y no fue evaluado por el autor.
- Riesgo de alucinación en la explicación biológica: las justificaciones en lenguaje natural pueden ser plausibles pero incorrectas, por lo que requieren validación por expertos.
- No debe usarse como única fuente en decisiones clínicas: la clasificación benigno/patógeno es una predicción computacional, no un diagnóstico.
- El tokenizador requiere código remoto (`trust_remote_code=True`) y transformers v5 o superior, lo que añade superficie de riesgo en la cadena de suministro.
- Sesgos conocidos: no se documentan en la información proporcionada.
- Licencia apache-2.0: permite uso comercial, pero el modelo base Qwen3-14B puede tener sus propias condiciones que conviene revisar.
- El contexto de 40.960 tokens limita el análisis de secuencias muy largas; las secuencias no múltiplas de 6 se manejan con tokens de cola especiales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eyes-ml/Carbon-X
- Model card de referencia (HuggingFaceBio/Carbon-X): https://huggingface.co/HuggingFaceBio/Carbon-X
- Blog / demo: https://huggingface.co/spaces/HuggingFaceBio/Carbon-X-Release
- Organización Hugging Face Bio: https://huggingface.co/HuggingFaceBio
- Código: https://github.com/huggingface/carbon/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
