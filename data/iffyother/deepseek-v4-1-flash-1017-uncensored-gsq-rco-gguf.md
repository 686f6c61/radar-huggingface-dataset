# Iffyother/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF es una cuantización GGUF de tipo "abliterated" del modelo DeepSeek-V4.1-Flash-1017, un transformer de mezcla de expertos (MoE) de 763 mil millones de parámetros con 384 expertos enrutados. La publica el usuario Iffyother a partir del backbone GSQ-RCO de ISTA-DASLab, que a su vez cuantiza el modelo original de DeepSeek. El objetivo declarado es eliminar la dirección de rechazo (refusal direction) del modelo mediante una edición de abliteración de fuerza 2.0 aplicada únicamente a los tensores densos que escriben en el residual: la salida de atención (`attn_output_b`), la proyección descendente del experto compartido (`ffn_down_shexp`) y la proyección de valor del Engram (`engram_wkv`).

La relevancia de esta ficha es doble. Por un lado, demuestra una técnica de cuantización extrema (GSQ, *Generalized Sequential Quantization*) que aprende redondeos de bajo bit por tensor, con niveles de 1,75 a 2,25 bits por peso que comprimen un modelo de 763B hasta 231-266 GB. Por otro, introduce el formato "Engram": una tabla de búsqueda de 110 GB que se transmite desde SSD mientras el backbone reside en memoria del sistema, permitiendo servir el modelo en una única GPU de 12 GB mediante el runtime Strata.

El modelo conserva la arquitectura, el contexto y las capacidades del DeepSeek-V4.1-Flash-1017 original, pero con los rechazos suprimidos de forma medible: JailbreakBench cae del 85-89 % al 0 % en los tres niveles publicados, mientras MMLU se mantiene dentro de aproximadamente 1 punto del cuantizado original y GPQA-Diamond queda idéntico (83,3 %).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 384 expertos enrutados, experto compartido y módulo Engram (tabla de consulta) |
| Parámetros totales | 551.880.949.208 (según safetensors); la model card del autor cita 763B |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF GSQ-RCO en IQ1_M (1,75 bpw), IQ2_XXS (2,0 bpw) e IQ2_XS (2,25 bpw) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (shards de 4 partes por nivel) más fichero Engram separado de 110 GB |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de mezcla de expertos con 384 expertos enrutados por capa, un experto compartido y un mecanismo Engram que actúa como tabla de consulta de valores. La edición de abliteración no toca los expertos enrutados: solo reemplaza tres tensores densos que escriben en el flujo residual, con la dirección de rechazo de DeepSeek proyectada fuera a fuerza 2.0 y en precisión completa antes de cuantizar al tipo exacto por tensor de ISTA. Los 384 expertos conservan byte a byte el redondeo de bajo bit aprendido por GSQ, de modo que cada fichero mantiene el mismo tamaño y se ejecuta donde lo hace el original.

El entrenamiento original de DeepSeek-V4.1-Flash-1017 (número de tokens, composición del dataset, uso de RLHF o DPO) no está documentado en la información disponible. La innovación técnica destacable de esta publicación es la cuantización GSQ-RCO con redondeo aprendido por tensor y el esquema de despliegue con Engram transmitido desde SSD, que permite que un modelo de este tamaño quepa en una máquina de consumo. La model card reporta una divergencia KL respecto al cuantizado original de 0,0207 a 0,0272 (cota inferior top-64), lo que indica que la edición apenas altera la distribución de salida.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia del ecosistema DeepSeek.
- Razonamiento con modo "thinking" configurable por esfuerzo (la model card mide con esfuerzo 30 y 50).
- Razonamiento matemático de competición: AIME25 al 80,0 % en el nivel IQ2_XXS editado.
- Conocimiento experto: GPQA-Diamond al 83,3 %, idéntico al cuantizado original.
- Conocimiento general: MMLU de 500 preguntas entre 80,6 % y 82,8 % según el nivel de cuantización.
- Supresión de rechazos en todos los temas evaluados: JailbreakBench en inglés al 0,0 % en los tres niveles.
- Preservación de rechazos seguros en XSTest parcialmente degradada (del 4,0-7,6 % al 0,0-0,4 %).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y abliteración: el modelo sirve como banco de pruebas reproducible para medir el coste de eliminar la dirección de rechazo, con métricas de KL, MMLU y GPQA publicadas por nivel de cuantización y logs por pregunta en el repositorio de métricas.
- Evaluación de cuantización extrema: permite comparar IQ1_M, IQ2_XXS e IQ2_XS sobre el mismo backbone y con las mismas prompts, aislando el efecto del número de bits por peso en tareas de razonamiento y conocimiento.
- Despliegue en hardware de consumo: con Strata, el backbone reside en RAM del sistema y la tabla Engram se transmite desde SSD, de modo que un modelo de 763B se sirve en una sola GPU de 12 GB, útil para laboratorios con estaciones de trabajo modestas.
- Generación de contenido sin filtros en entornos controlados: redacción creativa, guiones o ficción que requieran evitar rechazos del modelo base, siempre con revisión humana y dentro de un marco legal y ético.
- Pruebas de robustez y red teaming: la caída de XSTest a 0,0-0,4 % de rechazos seguros convierte al modelo en un caso de estudio para medir la degradación de la seguridad tras abliteración.
- Reproducción de benchmarks de razonamiento: GPQA-Diamond y AIME25 ejecutables en local con el runtime Strata y esfuerzo de razonamiento configurable, útiles para validar pipelines de evaluación propios.
- Docencia e investigación sobre MoE: la separación entre expertos enrutados intactos y tensores densos editados permite estudiar qué componentes concentran el comportamiento de rechazo en un MoE de 384 expertos.

## Benchmarks y rendimiento

Resultados de la model card del autor, medidos con Strata y comparando el cuantizado original (stock GSQ-RCO) con la versión sin rechazos:

| Benchmark | IQ2_XXS stock | IQ2_XXS sin rechazos | IQ2_XS stock | IQ2_XS sin rechazos | IQ1_M stock | IQ1_M sin rechazos |
|---|---|---|---|---|---|---|
| JailbreakBench (EN) | 85,2 % | 0,0 % | 86,4 % | 0,0 % | 88,9 % | 0,0 % |
| XSTest (rechazo seguro) | 7,6 % | 0,0 % | 4,0 % | 0,4 % | 4,8 % | 0,0 % |
| Thinking high (30) | 27/30 | 0/30 | 27/30 | 2/30 | 27/30 | 1/30 |
| MMLU (500) | 82,8 % (p=0,27) | — | 81,6 % (p=1,00) | — | 80,6 % (p=0,75) | — |
| KL respecto al stock | — | 0,0225 | — | 0,0272 | — | 0,0207 |

Comparativa de razonamiento en el nivel IQ2_XXS, esfuerzo 50:

| Benchmark | GSQ-RCO stock | Sin rechazos |
|---|---|---|
| GPQA-Diamond (198 preguntas) | 83,3 % | 83,3 % |
| AIME25 (30 preguntas) | 76,7 % | 80,0 % |

No se han publicado resultados de benchmarks del DeepSeek-V4.1-Flash-1017 original en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 12 GB de GPU según el autor, con el backbone en memoria del sistema y la tabla Engram (110 GB) transmitida desde SSD.
- Espacio en disco: 231 GB (IQ1_M), 249 GB (IQ2_XXS) o 266 GB (IQ2_XS) para los shards, más 110 GB del fichero Engram compartido, que debe residir en un SSD rápido.
- GPU recomendadas: el autor valida una única GPU de 12 GB; no se especifican modelos concretos (RTX 4090, A100, H100) en la información disponible.
- Cabe en GPU de consumo: sí, con 12 GB de VRAM y el esquema de streaming de Strata.
- Opciones de despliegue: exclusivamente Strata (repositorio github.com/Niko1221/Strata); llama.cpp no soporta todavía DeepSeek-V4.1 con fichero Engram separado. vLLM, TGI, Ollama y llama.cpp no están soportados según la model card.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Despliegue |
|---|---|---|---|---|---|
| Este modelo (Iffyother, GSQ-RCO sin rechazos) | 551,9B safetensors / 763B según autor | no disponible | GGUF GSQ 1,75-2,25 bpw | MIT | Strata, GPU de 12 GB |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | 551,9B / 763B | no disponible | GGUF GSQ 1,75-2,25 bpw | no disponible | Strata |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF | 551,9B / 763B | no disponible | GGUF sin rechazos | no disponible | Strata |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (original) | 551,9B / 763B | no disponible | pesos completos | no disponible | no disponible |

La diferencia frente a los dos primeros es la edición de abliteración; frente al original, la cuantización extrema y la supresión de rechazos. No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El clasificador de rechazo lee el inicio de la respuesta, por lo que un rechazo suave situado más adelante en el texto puede pasar como respuesta válida.
- La edición elimina los rechazos en todos los temas; no conserva un subconjunto más estrecho de ellos, lo que incluye contenido sensible o potencialmente dañino.
- Con el modo thinking activado, el modelo planifica una respuesta que puede eludir la moderación; la model card se interrumpe en este punto y no detalla el alcance completo.
- La seguridad se degrada de forma medible: XSTest cae del 4,0-7,6 % al 0,0-0,4 % de rechazos seguros.
- La divergencia KL es una cota inferior top-64, por lo que la divergencia real respecto al cuantizado original es algo mayor que los 0,0207-0,0272 reportados.
- El modelo solo se ejecuta en Strata; no hay soporte en llama.cpp, vLLM, TGI ni Ollama, lo que limita su integración en infraestructura estándar.
- La cuantización a 1,75-2,25 bits por peso introduce pérdida de precisión inevitable; los benchmarks publicados cubren pocas tareas y tamaños de muestra pequeños (AIME25 con 30 preguntas, MMLU con 500).
- Licencia MIT declarada, lo que en principio permite uso comercial, pero la licencia del modelo base DeepSeek y las condiciones de uso de los datos de entrenamiento no están detalladas en la información disponible.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Iffyother/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF
- Backbone GSQ-RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo base original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Versión sin rechazos de AtomicChat: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Repositorio de métricas y logs: https://huggingface.co/datasets/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF-metrics
- Runtime Strata: https://github.com/Niko1221/Strata
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- Cuenta de X de Atomic Chat: https://x.com/atomic_chat_hq
