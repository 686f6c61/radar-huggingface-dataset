# Lmoore78/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF es una cuantización GGUF de tipo "abliterated" del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por el usuario Lmoore78 sobre el backbone GSQ-RCO de ISTA-DASLab. El modelo original es un transformer de tipo mezcla de expertos (MoE) con 763.000 millones de parámetros y 384 expertos enrutados; el repositorio declara un total real de 551.880.949.208 parámetros en el artefacto de safetensors asociado. La modificación consiste en proyectar fuera de los tensores densos que escriben en el residual (salida de atención, proyección descendente del experto compartido y proyección de valor del Engram) la dirección de rechazo aprendida por DeepSeek, con una fuerza de edición de 2.0, dejando intactos byte a byte los 384 expertos enrutados del cuantizado GSQ.

El interés práctico de esta ficha es doble. Por un lado, demuestra una técnica de eliminación selectiva de rechazos que, según las mediciones del autor, reduce a 0.0% la tasa de jailbreak en inglés en las tres variantes publicadas (IQ2_XXS, IQ2_XS e IQ1_M) sin degradar la precisión en tareas: GPQA-Diamond se mantiene en 83.3% y AIME25 pasa de 76.7% a 80.0% (dentro del ruido con n=30). Por otro, valida un modo de despliegue poco habitual: gracias al runtime Strata y a una tabla Engram de 110 GB que se transmite desde SSD, un modelo de 763B puede servirse en una GPU de 12 GB de VRAM manteniendo el backbone en memoria del sistema.

Es relevante ahora porque los pesos se publicaron el 27 de noviembre de 2026 y representan uno de los primeros casos documentados de cuantización de muy bajo bit (1.75-2.25 bpw) sobre un MoE de esta escala con métricas de fidelidad (KL respecto al cuantizado original) y de capacidad (MMLU-500, GPQA, AIME) publicadas junto a los ficheros. La licencia es MIT, lo que facilita su uso comercial, aunque las limitaciones del proceso de abliteración y la dependencia de un runtime específico condicionan su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 384 expertos enrutados, experto compartido (shared expert) y tabla Engram de búsqueda; edición de abliteración sobre tensores densos del residual |
| Parametros totales | 551.880.949.208 (dato real de safetensors); la model card describe el modelo base como 763B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en tres niveles: IQ2_XXS (2.0 bpw, 249 GB), IQ2_XS (2.25 bpw, 266 GB) e IQ1_M (1.75 bpw, 231 GB) |
| Idiomas soportados | no disponible (la model card solo reporta evaluaciones en inglés: JailbreakBench EN, XSTest, MMLU, GPQA, AIME) |
| Licencia | MIT |
| Formato de pesos | GGUF (shards de 4 ficheros por nivel, más un fichero Engram de 110 GB compartido, no re-alojado en este repo) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash-1017 es un transformer de mezcla de expertos con 384 expertos enrutados, un experto compartido y una tabla Engram que actúa como memoria de búsqueda de valores. Sobre ese backbone, ISTA-DASLab aplicó su cuantización GSQ-RCO, que aprende redondeos de bajo bit por tensor para los expertos enrutados; este repositorio no re-cuantiza esos expertos, sino que reemplaza únicamente tres tensores densos que escriben en el residual: `attn_output_b` (salida de atención), `ffn_down_shexp` (proyección descendente del experto compartido) y `engram_wkv` (proyección de valor del Engram). El resto del grafo, incluidos los 384 expertos enrutados, permanece idéntico al original, de modo que cada fichero conserva el mismo tamaño y se ejecuta donde lo hace el original.

La edición de abliteración proyecta fuera la dirección de rechazo con fuerza 2.0, aplicada a los pesos en precisión completa y posteriormente cuantizada al tipo exacto por tensor que ISTA asignó en su GSQ. No se documenta en la información disponible ningún reentrenamiento, ajuste fino, RLHF ni DPO adicional: es una intervención puramente de pesos sobre el cuantizado existente. La innovación técnica destacable no es tanto la edición como la preservación del aprendizaje de redondeo de GSQ en los expertos y la publicación de métricas de fidelidad (KL respecto al cuantizado original, con cota inferior top-64) junto a cada nivel de cuantización.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia (etiqueta `atomic-chat`).
- Razonamiento de varios pasos con modo de pensamiento ("thinking") configurable; la model card reporta resultados con esfuerzo de razonamiento 50 y evalúa el modo thinking alto con 30 preguntas.
- Razonamiento matemático de competición (AIME25) y científico de nivel experto (GPQA-Diamond).
- Conocimiento general medido con MMLU (500 preguntas).
- Eliminación de rechazos ("uncensored") en las tres variantes publicadas, con JailbreakBench EN reducido a 0.0% de cumplimiento.
- Ejecución en un único GPU de 12 GB mediante Strata, con backbone en memoria del sistema y tabla Engram en streaming desde SSD.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, visión, audio ni capacidades multilingües verificadas.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite medir el efecto de una edición de una sola dirección sobre la tasa de rechazo (JailbreakBench de 85-89% a 0.0%) manteniendo la precisión en tareas, con KL de 0.0207-0.0272 respecto al cuantizado original; es un banco de pruebas controlado para estudiar abliteración sin reentrenar.
- Evaluación de cuantizaciones de muy bajo bit en MoE de gran escala: los tres niveles (1.75, 2.0 y 2.25 bpw) permiten comparar el compromiso entre tamaño (231-266 GB) y precisión (MMLU-500 de 80.6% a 82.8%) sobre el mismo backbone, útil para decidir qué nivel desplegar en un parque de hardware concreto.
- Despliegue local en estación de trabajo con GPU de consumo: con Strata y una GPU de 12 GB, el backbone reside en RAM del sistema y la tabla Engram se transmite desde SSD, de modo que un equipo con suficiente memoria y almacenamiento rápido puede servir un modelo de 763B sin clúster.
- Generación de texto creativo y conversacional sin filtros de rechazo: para aplicaciones de ficción, guion o roleplay donde los filtros del modelo base interrumpen la continuidad; el autor advierte que la edición elimina rechazos en todos los temas, no solo en un subconjunto.
- Razonamiento científico y matemático asistido: con GPQA-Diamond en 83.3% y AIME25 en 80.0% en el nivel IQ2_XXS, es adecuado para asistentes de investigación que necesiten justificar cadenas de razonamiento largas, siempre que se validen las respuestas por un experto.
- Reproducción de experimentos de cuantización: el repositorio de métricas asociado incluye logs por pregunta (`ablit/gsq/bench/`), lo que permite replicar las evaluaciones en el mismo stand (Strata, esfuerzo 50) y auditar la afirmación de que la edición no cuesta precisión.

## Benchmarks y rendimiento

Datos reportados en la model card para los tres niveles publicados, comparando el cuantizado GSQ-RCO original ("stock") con esta edición ("uncensored"):

| Nivel | bpw | Tamano total | JailbreakBench (EN) | XSTest (rechazos seguros) | Thinking alto (30) | MMLU (500) | KL respecto al stock |
|---|---|---|---|---|---|---|---|
| IQ2_XXS | 2.0 | 249 GB | 85.2% → 0.0% | 7.6% → 0.0% | 27/30 → 0/30 | 82.8% (p=0.27) | 0.0225 |
| IQ2_XS | 2.25 | 266 GB | 86.4% → 0.0% | 4.0% → 0.4% | 27/30 → 2/30 | 81.6% (p=1.00) | 0.0272 |
| IQ1_M | 1.75 | 231 GB | 88.9% → 0.0% | 4.8% → 0.0% | 27/30 → 1/30 | 80.6% (p=0.75) | 0.0207 |

Comparación de razonamiento sobre el nivel IQ2_XXS (Strata, esfuerzo de razonamiento 50):

| Benchmark | GSQ-RCO stock | Uncensored (esta edicion) |
|---|---|---|
| GPQA-Diamond (198 preguntas) | 83.3% | 83.3% |
| AIME25 (30 preguntas) | 76.7% | 80.0% |

El KL se calcula con el modo de puntuación forzada por profesor de Strata y es una cota inferior top-64, por lo que el valor real es ligeramente superior. No se han publicado resultados de benchmarks del modelo base completo (sin cuantizar) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 12 GB según la model card, gracias a que el backbone reside en memoria del sistema y la tabla Engram se transmite desde SSD mediante Strata.
- Almacenamiento: cada nivel ocupa entre 231 GB (IQ1_M) y 266 GB (IQ2_XS), más un fichero Engram de 110 GB compartido que debe descargarse aparte desde ISTA-DASLab y mantenerse en un SSD rápido junto a los shards.
- Memoria del sistema: no se especifica la cantidad mínima de RAM necesaria para alojar el backbone; no disponible.
- GPU recomendadas: la model card solo afirma que funciona en una GPU de 12 GB; no se detallan modelos concretos (A100, H100, RTX 4090, etc.) ni configuraciones multi-GPU.
- Cabe en GPU de consumo: sí, en una GPU de 12 GB, siempre que se use Strata y se cumplan los requisitos de RAM y SSD.
- Opciones de despliegue: Strata (runtime de referencia, con `strata launch --model-path ...`); llama.cpp no soporta todavía DeepSeek-V4.1 con fichero Engram separado según la model card. vLLM, TGI, Ollama y otras alternativas no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF (este) | 551.880.949.208 reales (763B nominales), MoE 384 expertos | no disponible | MIT | GGUF (IQ1_M, IQ2_XXS, IQ2_XS) | Edición de abliteración sobre GSQ-RCO; JailbreakBench 0.0%; GPQA 83.3%; requiere Strata |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | mismos pesos, sin editar | no disponible | no disponible en la información | GGUF | Cuantizado de referencia; JailbreakBench 85-89%; sirve de línea base de KL |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF | mismos pesos, sin editar | no disponible | no disponible en la información | GGUF | Misma edición de abliteración sobre otro cuantizado; citado como referencia por el autor |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | 763B nominales | no disponible | no disponible en la información | safetensors (presumiblemente) | Modelo original de DeepSeek; sin datos de benchmarks en esta información |

No se dispone de datos de benchmarks del modelo original ni de las otras variantes en la información proporcionada, por lo que la comparativa se limita a parámetros, formato y disponibilidad.

## Limitaciones y advertencias

- El clasificador de rechazo lee el inicio de la respuesta, por lo que un rechazo suave situado más adelante en el texto puede pasar como respuesta válida; las métricas de JailbreakBench no capturan ese caso.
- La edición elimina rechazos en todos los temas y no conserva un subconjunto más estrecho de ellos; no es posible configurarla para mantener ciertos rechazos.
- Con el modo thinking activado, la edición planifica una respuesta a una petición (texto truncado en la model card); conviene revisar el comportamiento en ese modo antes de desplegar.
- Riesgo de alucinación: no se documenta una evaluación específica de veracidad; los benchmarks reportados (MMLU, GPQA, AIME) miden precisión en tareas, no calibración ni tasas de alucinación.
- Idiomas: no hay información sobre cobertura multilingüe; todas las evaluaciones publicadas son en inglés y no se garantiza un comportamiento equivalente en castellano u otros idiomas.
- Longitud de contexto: no disponible; no se puede planificar el despliegue en escenarios de contexto largo sin verificación previa.
- Dependencia de runtime: los ficheros solo se ejecutan en Strata según la model card; llama.cpp no soporta aún DeepSeek-V4.1 con Engram separado, lo que limita la portabilidad y la integración con ecosistemas estándar (vLLM, TGI, Ollama).
- Requisitos de infraestructura: 231-266 GB de shards más 110 GB de Engram en SSD rápido, además de RAM del sistema suficiente para el backbone; no es un despliegue ligero pese a la GPU de 12 GB.
- Licencia MIT: permite uso comercial, pero la responsabilidad sobre el contenido generado sin filtros de rechazo recae en el desplegador; conviene evaluar implicaciones legales y de política de contenido antes de exponerlo a usuarios finales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el autor no es el desarrollador original del modelo; la trazabilidad de la edición depende de la documentación y del repositorio de métricas de AtomicChat.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/Lmoore78/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF
- Modelo base cuantizado (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo original (DeepSeek): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Variante uncensored de AtomicChat: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Repositorio de métricas: https://huggingface.co/datasets/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF-metrics
- Runtime Strata: https://github.com/Niko1221/Strata
- Atomic Chat (aplicación): https://atomic.chat/
- Repositorio Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- Cuenta de X de Atomic Chat: https://x.com/atomic_chat_hq
