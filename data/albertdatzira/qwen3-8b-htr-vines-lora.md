# albertdatzira/qwen3-8b-htr-vines-lora

## Resumen

qwen3-8b-htr-vines-lora es un adaptador LoRA de corrección posterior de texto manuscrito (HTR post-correction) desarrollado por Albert Pérez Datsira (albertdatzira), en el marco de su tesis de máster en la Universitat de Lleida. No es un modelo completo: son adaptadores PEFT que se montan sobre el modelo base Qwen/Qwen3-8B y se especializan en limpiar la salida cruda de un motor de reconocimiento de escritura manuscrita, en concreto la del modelo Balakirev (Kraken/eScriptorium), aplicada a los diarios manuscritos del pianista catalán Ramon Viñes (1890-1915).

El problema que resuelve es acotado pero real dentro de las humanidades digitales: los motores HTR producen transcripciones con errores sistemáticos y el post-procesado con modelos generalistas de gran tamaño no funciona bien en este dominio. Según la model card, el resultado clave es un CER del 7,80 % sobre el conjunto de prueba con el mecanismo de fallback activado, frente al 10,86 % del HTR sin corregir y al 21,20 % de Llama 3.1 70B sin ajuste. Es decir, un adaptador de 43,6 millones de parámetros entrenables (el 0,53 % del total del modelo base de 8B) supera a un modelo generalista de 70B en esta tarea, lo que refuerza el argumento de que el ajuste de dominio es más determinante que el tamaño bruto.

El adaptador se entrenó en 56 minutos sobre una NVIDIA DGX Spark y se publica con licencia MIT, con soporte declarado para español (principal), francés y catalán. Su relevancia actual es doble: por un lado, es un caso de estudio reproducible de ajuste eficiente de un LLM de 8B para una tarea estrecha de humanidades; por otro, ilustra un patrón de producción poco habitual pero sensato, el de un modelo pequeño especializado acompañado de un fallback determinista que garantiza que ninguna página empeore respecto a la entrada original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3-8B) + adaptadores LoRA (PEFT) |
| Parámetros totales | 8B en el modelo base; adaptador LoRA de 43,6M de parámetros entrenables (0,53 %) |
| Parámetros activos | No aplica: arquitectura densa, no MoE |
| Longitud de contexto | No especificada en la model card. El modelo base Qwen3-8B declara 32.768 tokens nativos, extensibles a 131.072 con YaRN. El entrenamiento se realizó sobre páginas completas de ~2.500 caracteres |
| Tipos de cuantización | No se distribuyen cuantizaciones propias. Los adaptadores se publican en safetensors (precisión bf16 en el ejemplo de uso); tras fusionar con el modelo base puede cuantizarse a GGUF, AWQ o GPTQ |
| Idiomas soportados | Español (principal), francés, catalán |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); librería `peft` |
| Configuración LoRA | rank 16, alpha 32, dropout 0,05 |
| Tamaño del repositorio | 0,2 GB |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-8B |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-8B, un transformer decoder-only denso de aproximadamente 8.000 millones de parámetros. Sobre él se aplica un ajuste por adaptación de bajo rango (LoRA) con rank 16, alpha 32 y dropout 0,05, lo que deja 43,6 millones de parámetros entrenables, apenas el 0,53 % del total. El entrenamiento consistió en 3 épocas que se completaron en 56 minutos sobre una NVIDIA DGX Spark, un coste computacional muy bajo para el resultado obtenido.

Los datos de entrenamiento son 583 pares a nivel de página extraídos del repositorio RV-training: la entrada es la salida HTR cruda del modelo Balakirev (Kraken/eScriptorium) y la salida objetivo son transcripciones validadas manualmente. La partición se hizo por año, no de forma aleatoria, para evitar filtración de datos entre entrenamiento y prueba, y se descartaron las páginas con ground truth inferior a 50 caracteres o con CER superior al 80 %. La innovación técnica destacable no está en la arquitectura sino en el procedimiento de inferencia: decodificación greedy (`do_sample=False`), hasta 4.096 tokens nuevos, plantilla de chat con `enable_thinking=False` y un prompt de sistema en catalán que instruye explícitamente a corregir solo errores evidentes de HTR sin alterar la ortografía del autor, los nombres propios ni los símbolos especiales (¶, ¬, ⟦ ⟧).

El elemento más interesante del diseño es el mecanismo de fallback documentado: si la salida es más de un 10 % más corta que la entrada, se devuelve el original (protección contra truncamientos); si hay ground truth disponible y el CER empeora, se devuelve también el original. Con este procedimiento, el autor reporta cero páginas empeoradas en el conjunto de prueba.

## Capacidades

- Corrección posterior de transcripciones HTR de manuscritos históricos: recibe texto crudo con errores de reconocimiento y devuelve una versión corregida.
- Preservación deliberada de rasgos del original: ortografía del autor, nombres propios y símbolos especiales de anotación filológica.
- Generación de texto conversacional e instrucciones, heredada del modelo base Qwen3-8B.
- Multilingüe en la práctica limitada a español, francés y catalán, con el español como idioma principal de entrenamiento.
- Funcionamiento en modo no-thinking (`enable_thinking=False`), lo que reduce el coste de generación en una tarea de reescritura más que de razonamiento.
- Entrada a nivel de página completa (~2.500 caracteres); no está diseñado ni validado para bloques cortos.
- No hay constancia en la información disponible de soporte de tool calling, function calling, agentes, visión, audio ni multi-step reasoning específicos más allá de lo que herede del modelo base.

## Casos de uso

- Post-procesado de corpus HTR en proyectos de humanidades digitales: el adaptador se inserta como paso final de la cadena Kraken/eScriptorium → texto crudo → corrección, y reduce el CER del 10,86 % al 7,80 % en el corpus Viñes, lo que se traduce en menos horas de revisión manual página a página.
- Edición crítica de diarios y correspondencia histórica: al respetar la ortografía del autor y los símbolos de anotación (¶, ¬, ⟦ ⟧), encaja en flujos editoriales que necesitan distinguir entre error de reconocimiento y rasgo original del manuscrito.
- Cuantificación del esfuerzo de revisión humana: con la tasa de mejora del 89 % en páginas fáciles, un equipo puede estimar cuántas páginas requieren revisión manual y priorizar las de CER base alto, donde la mejora baja al 20-40 %.
- Investigación sobre ajuste eficiente de LLM: sirve como caso reproducible de que un LoRA de 43,6M de parámetros sobre un modelo de 8B supera a un modelo generalista de 70B en un dominio estrecho, con un coste de entrenamiento de 56 minutos en una DGX Spark.
- Preservación digital de patrimonio documental en catalán, español y francés: cubre los tres idiomas presentes en los diarios de Viñes, un perfil lingüístico habitual en archivos del arco mediterráneo.
- Prototipado de asistentes de transcripción para archivos y bibliotecas: cualquier institución con un motor HTR propio puede replicar el esquema de ajuste (pares página cruda / página validada) y aplicar el mismo fallback determinista.
- Comparación de estrategias de corrección en pipelines de OCR/HTR: el repositorio vines-htr-correction permite evaluar contra alternativas como el HTR sin corregir o un modelo generalista de gran tamaño usando CER como métrica.

## Benchmarks y rendimiento

Los únicos datos de evaluación publicados en la información disponible son métricas de tasa de error de caracteres (CER) sobre el corpus de los diarios de Ramon Viñes:

| Enfoque | CER | Páginas empeoradas |
|---|---|---|
| Solo HTR (Balakirev) | 10,86 % | — |
| Llama 3.1 70B (general, sin ajuste) | 21,20 % | Todas |
| Este modelo + fallback | 7,80 % | 0 |

Además, la model card indica una tasa de mejora del 89 % en las páginas del conjunto de prueba con CER base en torno al 10-12 %, que cae al 20-40 % en páginas con CER base más alto.

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- El adaptador en sí ocupa 0,2 GB; el consumo real de memoria lo determina el modelo base Qwen3-8B que se carga junto a él.
- Inferencia en bf16: aproximadamente 16 GB solo para los pesos del modelo base, más overhead de contexto y caché KV; en la práctica conviene disponer de 20-24 GB de VRAM.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100 o L40S para servicio en producción; una RTX 4090 (24 GB) es suficiente para inferencia en bf16 de una sola instancia.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en bf16; en GPUs con 12-16 GB es necesario recurrir a cuantización de 8 o 4 bits tras fusionar el adaptador (una cuantización de 4 bits sitúa los pesos en torno a 5-6 GB).
- Entrenamiento: el ajuste LoRA se completó en 56 minutos sobre una NVIDIA DGX Spark, por lo que reproducirlo no exige clústeres de varias GPU.
- Opciones de despliegue: `transformers` + `peft` (el camino documentado en la model card), y tras fusionar los pesos, vLLM, TGI, llama.cpp u Ollama con la cuantización correspondiente. La librería declarada en el repositorio es `peft`.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación es greedy y el prompt de sistema fuerza `enable_thinking=False`, lo que reduce el número de tokens generados respecto a un modo de razonamiento explícito.
- Recomendación práctica: reservar hasta 4.096 tokens nuevos de generación y aplicar el fallback basado en longitud antes de dar una página por corregida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER en el corpus Viñes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-8b-htr-vines-lora (+ fallback) | 8B base, 43,6M entrenables | No especificado (base: 32.768 tokens) | 7,80 % | MIT | HuggingFace (adaptador PEFT) |
| Llama 3.1 70B sin ajuste | 70B | 128.000 tokens (modelo base) | 21,20 % | Licencia comunitaria de Meta | HuggingFace |
| HTR Balakirev (Kraken/eScriptorium) sin corrección | No disponible (modelo HTR, no LLM) | No aplica | 10,86 % | No disponible en la información proporcionada | No disponible en la información proporcionada |
| Qwen3-8B sin ajuste | 8B | 32.768 tokens (131.072 con YaRN) | No disponible | Apache 2.0 (modelo base) | HuggingFace |

La comparación directa con otras soluciones de corrección de HTR no puede establecerse con los datos disponibles: la model card solo contrasta contra el HTR crudo y contra Llama 3.1 70B sin ajuste. No hay información sobre adaptadores equivalentes para otros corpus.

## Limitaciones y advertencias

- Especialización extrema: el adaptador se entrenó exclusivamente sobre los diarios de Ramon Viñes. El rendimiento en otros corpus HTR es, según el propio autor, desconocido.
- Solo páginas completas: el entrenamiento usó texto de página entera (~2.500 caracteres). No generaliza a bloques cortos por cambio de distribución.
- Mejor en páginas fáciles: la tasa de mejora es del 89 % en páginas con CER base del 10-12 %, pero cae al 20-40 % en páginas con más errores. En los casos difíciles la aportación es marginal.
- Truncamiento: en páginas largas o con alta densidad de errores el modelo puede emitir tokens de fin de secuencia de forma prematura. Es obligatorio aplicar el fallback de longitud (revertir si la salida es más de un 10 % más corta que la entrada).
- Alucinación en nombres propios y números: el modelo inventa ocasionalmente correcciones sobre entidades y cifras. Se mitiga con el fallback basado en CER, que revierte el resultado cuando empeora.
- El fallback no es opcional: la garantía de cero páginas empeoradas depende por completo de él. Sin fallback, la mejora reportada no es válida.
- Idiomas: solo español (principal), francés y catalán. No hay evidencia de comportamiento correcto en otras lenguas.
- Licencia MIT en el adaptador, pero conviene verificar la licencia del modelo base Qwen3-8B y de los datos de entrenamiento (repositorio RV-training) antes de un uso comercial.
- Trazabilidad del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente más allá de los resultados publicados por el autor.
- Los resultados de CER provienen de la propia model card y de una tesis de máster; no consta una evaluación por terceros.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/albertdatzira/qwen3-8b-htr-vines-lora
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del pipeline de corrección: https://github.com/albeertito7/vines-htr-correction
- Repositorio de datos de entrenamiento RV-training: https://github.com/esthersole/RV-training
- Cita académica: Pérez Datsira, Albert. "Fine-tuning Large Language Models for HTR Post-correction: A Case Study on the Ramon Viñes Manuscript Diaries". Tesis de máster, Universitat de Lleida, 2026.

Nota: la búsqueda web realizada no ha devuelto ningún resultado relevante sobre este modelo; los enlaces listados proceden exclusivamente de la información de HuggingFace y de la model card.
