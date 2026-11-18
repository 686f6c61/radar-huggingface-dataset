# HuggingFaceBio/Carbon-X

## Resumen

Carbon-X es un modelo de lenguaje decoder-only de 14.800 millones de parametros desarrollado por Hugging Face Bio, dentro de la familia Carbon, especializado en comprension y generacion de ADN. Se construye como un ajuste fino de Qwen/Qwen3-14B y se entrena de forma conjunta sobre secuencias de ADN y texto en lenguaje natural, de modo que el usuario introduce ADN crudo dentro de una conversacion de chat convencional y el modelo responde en ingles: predice si una variante es benigna o patogena, identifica regiones reguladoras, clasifica secuencias por grupo de organismo, predice las siguientes bases y explica su razonamiento.

La innovacion principal es el tokenizador hibrido: mantiene el vocabulario BPE de Qwen3 para texto y anade 5.515 tokens de ADN (4.096 6-mers, 1.364 tokens de cola para secuencias cuya longitud no es multiplo de 6 y los marcadores `<dna>`, `</dna>` y `<oov>`). Un unico token de ADN cubre 6 pares de bases, y no existe un encoder de ADN separado: todo comparte un unico flujo de tokens en un unico decoder. El modelo promedia 66,7% en cinco benchmarks de ADN con el modo de razonamiento desactivado, 27 puntos por encima de Qwen3-14B, y sus pesos caben en una sola GPU de 80 GB en bfloat16, lo que permite mantener secuencias sensibles en infraestructura propia.

La relevancia actual es economica y practica: el autor estima que analizar las 2,4 millones de variantes de significado incierto de ClinVar costaria unos 300 dolares con Carbon-X, frente a los 32.000 a 4 millones de dolares de los modelos frontera evaluados, con una puntuacion cercana a GPT-6.1 Sol (67,5%) a aproximadamente 1/1.800 del coste de inferencia por problema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM), 40 capas, hidden size 5120, GQA (40 cabezas de consulta, 8 de KV), SwiGLU, RMSNorm con QK-norm |
| Parametros totales | 14.822.046.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | no disponible (la model card solo documenta bfloat16) |
| Idiomas soportados | Ingles (texto) y ADN (secuencias) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

Carbon-X es un transformer decoder-only estandar de 40 capas con hidden size 5120, atencion GQA con 40 cabezas de consulta y 8 de clave-valor, activacion SwiGLU y RMSNorm con QK-norm. No incorpora encoder de ADN ni atencion lineal: el modelo procesa ADN y texto en un unico flujo de tokens mediante un tokenizador hibrido que alterna el vocabulario BPE de Qwen3 para lenguaje natural y 6-mers no solapados para ADN, con tokens de cola para longitudes no multiples de 6. El ADN presente en el prompt se detecta y etiqueta automaticamente.

El entrenamiento consta de 302.000 millones de tokens de mid-training sobre ADN, texto de biologia, ingles y datos de instrucciones, seguido de supervised fine-tuning y aprendizaje por refuerzo con recompensas verificables (RLVR) sobre tareas de ADN. El modelo se post-entrena y evalua con el modo de razonamiento (`enable_thinking`) desactivado, y el autor recomienda mantenerlo asi. El modelo base es Qwen/Qwen3-14B.

## Capacidades

- Generacion de texto y razonamiento en ingles con explicacion del razonamiento detras de cada prediccion.
- Prediccion de efecto de variantes (variant-effect prediction): clasificacion de mutaciones como benignas o patogenas.
- Identificacion de regiones que controlan la actividad genica (elementos reguladores).
- Clasificacion de secuencias por grupo de organismo.
- Prediccion de las siguientes bases de una secuencia de ADN.
- Generacion de secuencias que pueden contener tanto ADN como lenguaje natural en la respuesta.
- Conversacion multi-turno en formato chat con plantilla de chat propia.
- Uso como herramienta de un agente (documentado en la model card en la seccion "Using Carbon-X as a tool for an agent").
- Capacidad de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.
- Capacidades multilingues: solo ingles documentado.

## Casos de uso

- Triaje de variantes de significado incierto en entornos clinicos y de investigacion: el modelo recibe pares referencia/variante y devuelve una clasificacion benigna/patogena con razonamiento, lo que permite priorizar las 2,4 millones de variantes de ClinVar a un coste estimado de unos 300 dolares.
- Analisis de variantes en genes de codificacion: el autor reporta que Carbon-X lidera entre los modelos evaluados en efectos de variantes codificantes, por lo que es adecuado para pipelines de anotacion funcional en laboratorios de genomica.
- Anotacion de regiones reguladoras: identificacion de regiones que controlan la actividad genica dentro de secuencias largas, aprovechando la ventana de 40.960 tokens para procesar contextos genomicos extensos.
- Clasificacion taxonomica de secuencias: asignacion de secuencias desconocidas a grupos de organismos en flujos de metagenomica o control de calidad de muestras.
- Prediccion de siguientes bases: tareas de completado de secuencias y modelado de lenguaje genomico, donde el autor reporta liderazgo frente a los modelos evaluados.
- Despliegue on-premise con datos sensibles: al caber en una sola GPU de 80 GB en bfloat16 y servirse con vLLM, permite analizar secuencias no publicadas o bajo confidencialidad sin enviarlas a APIs externas.
- Integracion como herramienta de un agente bioinformatico: la model card documenta su uso como tool dentro de un agente, de modo que un orquestador puede delegar en Carbon-X las consultas de ADN y recibir respuestas en lenguaje natural.

## Benchmarks y rendimiento

| Benchmark / metrica | Carbon-X | Qwen3-14B (base) | GPT-6.1 Sol | Otros modelos abiertos |
|---|---|---|---|---|
| Media en cinco benchmarks de ADN (thinking desactivado) | 66,7% | 39,7% (27 puntos menos) | 67,5% | Por debajo de Carbon-X segun el autor |
| Efectos de variantes codificantes | Lidera entre los modelos evaluados | no disponible | no disponible | no disponible |
| Prediccion de siguientes bases | Lidera entre los modelos evaluados | no disponible | no disponible | no disponible |
| Coste de inferencia por problema (relativo) | 1x | no disponible | ~1.800x | no disponible |

Los benchmarks individuales (MMLU, HumanEval, GSM8K u otros) no se detallan en la informacion proporcionada. Los resultados de la tabla de evaluacion completa no estan disponibles en el texto extraido.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 29,7 GB de pesos, mas overhead de activaciones y cache KV; los pesos caben en una sola GPU de 80 GB segun el autor.
- GPU recomendadas: H200 (el autor mide throughput por hora de H200 a 5 dolares/hora) y cualquier GPU de 80 GB como A100 80 GB o H100 80 GB.
- GPU de consumo: no se documenta soporte en GPUs de consumo; con 14,8B parametros en bfloat16 no cabe en tarjetas de 24 GB sin cuantizacion, y no se publican pesos cuantizados.
- Opciones de despliegue: vLLM (`vllm serve HuggingFaceBio/Carbon-X --trust-remote-code`), transformers v5 o superior con `trust_remote_code=True`; compatible con text-generation-inference y endpoints segun los tags.
- Latencia y throughput: no se publican cifras absolutas; el autor reporta que el modelo responde directamente sin razonamiento extendido, por lo que cada problema consume pocos tokens de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media en benchmarks de ADN | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Carbon-X | 14,8B | 40.960 | 66,7% | Apache 2.0 | Hugging Face, pesos abiertos |
| Qwen3-14B | 14B | no disponible | 39,7% | no disponible | Hugging Face |
| GPT-6.1 Sol | no disponible | no disponible | 67,5% | propietaria | API |
| Otros modelos abiertos evaluados por el autor | no disponible | no disponible | por debajo de Carbon-X | no disponible | no disponible |

La model card no identifica por nombre a los demas modelos abiertos evaluados ni a los modelos frontera comparados, aparte de GPT-6.1 Sol.

## Limitaciones y advertencias

- El modelo solo esta documentado para ingles y ADN; no se garantiza comportamiento en castellano ni en otros idiomas.
- Se post-entreno y evaluo con `enable_thinking=False`; el autor recomienda mantener el razonamiento desactivado, por lo que el modo thinking no esta validado.
- Riesgo de alucinacion inherente a un modelo generativo: las predicciones de patogenicidad no deben usarse como diagnostico clinico sin validacion experimental o por expertos.
- No se publican datos sobre sesgos, composicion del dataset de mid-training ni procedencia de las secuencias, lo que limita la evaluacion de sesgos genomicos (por ejemplo, sobrerrepresentacion de poblaciones o organismos).
- La cuantizacion no esta documentada; el despliegue en GPUs de consumo requeriria cuantizar por cuenta propia sin garantias de calidad.
- Requiere Transformers v5 o superior y `trust_remote_code=True` por el tokenizador personalizado, lo que implica ejecutar codigo del repositorio.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantias ni soporte del autor.
- El contexto de 40.960 tokens limita el analisis de secuencias genomicas muy largas en una sola pasada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HuggingFaceBio/Carbon-X
- Organizacion Hugging Face Bio: https://huggingface.co/HuggingFaceBio
- Blog / Space de lanzamiento: https://huggingface.co/spaces/HuggingFaceBio/Carbon-X-Release
- Codigo: https://github.com/huggingface/carbon/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
