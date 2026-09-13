# INCModel3/Qwen3.5-9B-MXFP8-CT-RTN-AutoRound

## Resumen

Qwen3.5-9B-MXFP8-CT-RTN-AutoRound es una cuantización en MXFP8 del modelo Qwen/Qwen3.5-9B, publicada por el usuario INCModel3 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un artefacto derivado: el repositorio conserva la arquitectura, el tokenizador y el conocimiento del modelo base, y solo modifica la representación numérica de los pesos. El checkpoint declara 9.653.104.368 parámetros (unos 9,65 mil millones) y ocupa 12,4 GB en el repositorio.

El valor técnico de la ficha está en el formato de compresión. MXFP8 es un esquema de coma flotante de 8 bits con escalas compartidas por bloques definido en la especificación OCP Microscaling, y aquí se genera con AutoRound, la herramienta de Intel que ajusta los valores de redondeo mediante descenso de gradiente de signo. Los pesos se empaquetan en compressed-tensors, el contenedor que consumen vLLM y Transformers, y el autor indica que el flujo se orquestó con autoquant-agent (cuantizar, evaluar y autorreparar).

La relevancia práctica es que reduce el peso a aproximadamente la mitad frente a una versión en bf16 (que rondaría los 19,3 GB), manteniendo según los datos publicados por el autor un MMLU de 0,7826 y un GSM8K de 0,9340. La información disponible es incompleta: no se documentan licencia, idiomas, longitud de contexto ni condiciones de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen/Qwen3.5-9B; el repositorio no describe la arquitectura del modelo base) |
| Parámetros totales | 9.653.104.368 (~9,65 mil millones, dato de safetensors) |
| Parámetros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP8 con escalas por bloques; método AutoRound; empaquetado compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del modelo original, Qwen/Qwen3.5-9B) |
| Formato de pesos | safetensors (esquema compressed-tensors) |
| Modelo base | Qwen/Qwen3.5-9B |
| Método de cuantización | AutoRound (el nombre del repositorio incluye además "RTN", round-to-nearest; la relación exacta entre ambos no se detalla) |
| Pipeline declarado | text-generation |
| Tamaño del repositorio | 12,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-13 |

## Arquitectura y entrenamiento

El repositorio no aporta información sobre la arquitectura interna del modelo base: no se especifica si es un transformer denso con atención completa, qué tipo de capas de atención emplea, ni cuál es su ventana de contexto nativa. La única referencia disponible es el identificador Qwen/Qwen3.5-9B y el tag qwen3_5, que sitúan el modelo en la familia Qwen3.5 de Alibaba. Tampoco se documentan los datos de entrenamiento del base (número de tokens, composición del corpus, fases de RLHF o DPO), por lo que cualquier afirmación al respecto sería especulativa.

Lo que sí está documentado es el proceso de posentrenamiento aplicado aquí, que es exclusivamente de cuantización. Se parte de los pesos del modelo base y se aplica AutoRound, un algoritmo de redondeo que optimiza los valores cuantizados minimizando el error de salida de cada capa mediante descenso de gradiente de signo, en lugar del redondeo al vecino más cercano (RTN) puro. El resultado se serializa como MXFP8, un formato de bloques en el que un grupo de valores comparte una escala común expresada en potencia de dos, lo que reduce el sobrecoste de metadatos respecto a escalas por canal. El contenedor final es compressed-tensors, lo que determina las herramientas capaces de cargar el checkpoint.

## Capacidades

- Generación de texto y conversación: etiquetado como text-generation y conversational en Hugging Face.
- Razonamiento matemático de nivel escolar: el autor reporta un 0,9340 en GSM8K, lo que indica competencia sólida en problemas aritméticos de varios pasos.
- Conocimiento general y académico: MMLU de 0,7826.
- Inferencia de sentido común: HellaSwag 0,5815 y PIQA 0,7949, ambos por encima del azar, aunque el primero es un resultado moderado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible, más allá de lo que sugiera GSM8K.
- Capacidades multilingües: no disponible (el repositorio no declara idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Servicio de chat en producción con vLLM: al estar en formato compressed-tensors, el checkpoint está pensado para servirse con vLLM en GPUs con soporte FP8, reduciendo el coste por token frente a una instancia en bf16.
- Tutoría y resolución de problemas matemáticos: un 0,9340 en GSM8K lo hace adecuado para asistentes educativos que resuelven ejercicios de aritmética y álgebra elemental paso a paso.
- Atención al cliente automatizada: el tag conversational y el pipeline text-generation permiten gestionar diálogos multi-turno, siempre que se configure la ventana de contexto real del modelo base (no confirmada en este repositorio).
- Generación y resumen de documentos: tareas de redacción asistida, resumen extractivo y reescritura sobre textos de extensión media, aprovechando el conocimiento general reflejado en MMLU.
- Clasificación y extracción de información: uso como componente de razonamiento en pipelines de etiquetado, respuesta a preguntas sobre documentos y validación de respuestas, apoyándose en los resultados de HellaSwag y PIQA.
- Evaluación comparativa de cuantizaciones: el artefacto sirve como referencia para medir la degradación de MXFP8 + AutoRound frente al base en bf16, ya que el autor publica la tabla de evaluación junto al checkpoint.
- Prototipado en una única GPU de gama alta para consumo: con ~12,4 GB de pesos, el modelo cabe en tarjetas de 16 GB o más, lo que permite experimentar sin clúster.
- Despliegue con aceleración FP8 en hardware Hopper o Blackwell: aprovechar los tensor cores FP8 para aumentar el throughput de inferencia en tareas de alto volumen.

## Benchmarks y rendimiento

Datos publicados en la model card del autor. No se especifican el número de shots, la versión del harness de evaluación ni si las cifras corresponden al modelo cuantizado o al base, por lo que deben interpretarse con cautela.

| Benchmark | Resultado |
|---|---|
| GSM8K | 0,9340 |
| MMLU | 0,7826 |
| HellaSwag | 0,5815 |
| PIQA | 0,7949 |

No se han publicado en la información disponible resultados de benchmarks comparativos con el modelo base en bf16 ni con otras cuantizaciones, ni mediciones de latencia o throughput.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento de parámetros y del formato de pesos; no proceden de mediciones publicadas por el autor.

- Peso en MXFP8: aproximadamente 9,65 GB de parámetros a 8 bits, más escalas por bloque; el repositorio completo ocupa 12,4 GB.
- VRAM estimada para inferencia: en torno a 11-13 GB con cache KV moderada y 13-16 GB si se amplía el contexto o el lote. Equivalente en bf16: unos 19,3 GB solo de pesos, más cache KV.
- GPU de datacenter recomendadas: H100, H200 y B200 (tensor cores FP8 nativos). En A100 no hay soporte FP8 por hardware, por lo que la ejecución requeriría dequantización y sería sensiblemente más lenta.
- GPU profesionales: L40S y L4 para inferencia con FP8; A6000 y L40 para bf16.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 5090 (32 GB) y RTX 4080 (16 GB) con contexto limitado. No cabe con holgura en tarjetas de 12 GB.
- Opciones de despliegue: vLLM y Transformers con soporte compressed-tensors son las vías naturales dado el formato. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama requerirían una conversión previa. Compatibilidad con TGI: no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (MXFP8 + AutoRound) | 9,65 mil millones | no disponible | 0,7826 | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B (base) | 9,65 mil millones | no disponible | no disponible | no disponible | Hugging Face |
| Otras cuantizaciones del mismo base (AWQ, GPTQ, FP8 por tensor) | ~9,65 mil millones | no disponible | no disponible | no disponible | no verificadas en la información disponible |

La información proporcionada no incluye resultados del modelo base ni de cuantizaciones alternativas, por lo que no es posible establecer una comparación cuantitativa de calidad. La comparación relevante es de formato: MXFP8 con escalas por bloque suele ofrecer mejor relación precisión/tamaño que FP8 con escala por tensor, a cambio de requerir soporte de software y hardware específico.

## Limitaciones y advertencias

- El repositorio registra 0 descargas y 0 likes y no está avalado por el equipo de Qwen: es una conversión de terceros sin validación externa conocida.
- La licencia no está declarada en el repositorio. La model card remite a la licencia del modelo original, que debe consultarse antes de cualquier uso comercial.
- No se documentan idiomas soportados. El comportamiento multilingüe es una incógnita hasta validarlo con el modelo base.
- No se especifica la longitud de contexto, dato crítico para dimensionar cache KV y para casos de uso con documentos largos.
- Las cifras de benchmarks no detallan condiciones de evaluación (shots, harness, conjunto de test), por lo que no son directamente comparables con resultados publicados de otros modelos.
- Riesgo de alucinación inherente al modelo base, no mitigado por la cuantización.
- La cuantización a 8 bits puede degradar tareas sensibles a la precisión numérica, en particular matemáticas de muchos pasos y generación de código.
- Sesgos: no se publica ninguna evaluación de sesgo, toxicidad o seguridad; se heredan los del modelo base.
- Portabilidad limitada: al no haber pesos GGUF, el despliegue en llama.cpp, Ollama u otros runtimes ligeros exige convertir el checkpoint.
- Dependencia de hardware: el rendimiento FP8 real requiere GPUs Hopper o posteriores; en generaciones anteriores el coste de dequantización puede anular la ventaja.
- El nombre del repositorio menciona "RTN" mientras la model card indica AutoRound; la discrepancia no está aclarada y conviene verificar la configuración de cuantización antes de reproducir el flujo.
- El enlace a autoquant-agent que aparece en la model card apunta a la raíz de GitHub sin ruta concreta, por lo que no es trazable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/INCModel3/Qwen3.5-9B-MXFP8-CT-RTN-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- AutoRound (Intel): https://github.com/intel/auto-round
- autoquant-agent: la model card enlaza https://github.com/ sin ruta específica, no verificable
- La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo; los únicos enlaces obtenidos fueron páginas de inicio y de acceso de TikTok, sin relación con la ficha.
