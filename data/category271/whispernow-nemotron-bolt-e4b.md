# category271/whispernow-nemotron-bolt-e4b

## Resumen

WhisperNow Nemotron Bolt E4B es un ajuste fino (fine-tune) del modelo nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, desarrollado por el usuario category271 para la aplicación de dictado de escritorio WhisperNow. Su propósito es muy concreto: limpiar transcripciones generadas por ASR (reconocimiento automático del habla) eliminando muletillas, falsos comienzos, repeticiones y aplicando las autocorrecciones del hablante, además de normalizar el formato del texto resultante.

El modelo se distribuye en formato safetensors y GGUF, con 7.463.013.418 parámetros totales según los pesos reales, y está etiquetado con la arquitectura `gemma4_text` en Hugging Face. Es un modelo monolingüe en inglés y su licencia es OpenMDW 1.1. Su relevancia radica en que traslada a local un paso de limpieza que normalmente se delega a modelos en la nube, con una tasa de errores fácticos declarada de 2,59 por cada 1.000 palabras, la mejor de la familia WhisperNow según la propia model card.

No es un modelo de propósito general: es una herramienta especializada de postprocesado de texto pensada para integrarse en el pipeline de dictado, no para conversación abierta ni generación creativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4_text (transformer decoder-only, según tag de Hugging Face) |
| Parametros totales | 7.463.013.418 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `-c 8192` |
| Tipos de cuantizacion | GGUF (se menciona Q8_0 como archivo de referencia); no se detallan otros niveles |
| Idiomas soportados | inglés (en) |
| Licencia | OpenMDW 1.1 (openmdw-1.1) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16. Los pesos se guardan bajo los nombres de clave del modelo multimodal original, por lo que la carga en Transformers requiere un `key_mapping` (`^model\.language_model\.` → `model.`) con `Gemma4ForCausalLM`; sin ese mapeo, `AutoModelForCausalLM` inicializa el modelo de forma aleatoria. Esto indica que el checkpoint base es de naturaleza multimodal y que este fine-tune conserva el submodelo de lenguaje.

El entrenamiento se realizó sobre el dataset category271/whispernow-cleanup, que recoge las reglas de limpieza que WhisperNow envía a modelos en la nube. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. El modelo aprende reglas deterministas de reescritura: eliminación de muletillas, aplicación de autocorrecciones, corrección gramatical y ortográfica, formateo de listas y normalización de cifras y puntuación hablada.

## Capacidades

- Limpieza de transcripciones ASR: elimina muletillas, tics verbales, tartamudeos, palabras repetidas y falsos comienzos.
- Aplicación de autocorrecciones del hablante: cuando detecta una corrección clara, conserva solo la versión corregida y descarta la señal de corrección ("no wait", "scratch that").
- Corrección de gramática, ortografía, puntuación y mayúsculas manteniendo las palabras, el tono y las matizaciones del hablante.
- Formateo estructural: convierte listas de la compra, tareas, pasos, recetas y notas de reunión en listas; los mensajes y explicaciones permanecen como frases. No usa negritas, cursivas, encabezados ni guiones largos.
- Normalización numérica: cifras, cantidades, fechas, horas y porcentajes en dígitos; conversión de puntuación hablada ("dash dash help") en símbolos reales.
- Preservación literal de código, rutas y URL tal como se dictan.
- Tratamiento de preguntas y comandos: los limpia y devuelve como texto, sin responderlos ni ejecutarlos.
- Detección de transcripciones vacías: devuelve `EMPTY` cuando no hay palabras dictadas, solo ruido o muletillas.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Dictado de escritorio local: integrado en WhisperNow como paso de limpieza posterior al ASR, convierte una transcripción cruda en texto publicable sin enviar datos a la nube, lo que resulta adecuado por su licencia abierta y su despliegue en GGUF.
- Notas de reunión: a partir de turnos reales del corpus AMI (usados en el conjunto bench-long), el modelo estructura listas de acciones y decisiones manteniendo el contenido dictado.
- Mensajería dictada: limpia mensajes con autocorrecciones frecuentes ("el viernes, no, el jueves") y conserva la petición final sin responderla, tal como exige el caso de uso.
- Listas de la compra y tareas: transforma enumeraciones habladas en listas con viñetas, como muestra el ejemplo de la model card con artículos de granja.
- Documentación técnica dictada: preserva rutas, URL y fragmentos de código exactamente como se dictan, útil para ingenieros que redactan documentación por voz.
- Accesibilidad y productividad: usuarios con movilidad reducida o que prefieren dictar pueden generar texto limpio y con formato en local, con un consumo de memoria declarado de 8,4 GB en Q8_0.
- Postprocesado por lotes de transcripciones: al ser determinista con decodificación greedy (temperatura 0), permite limpiar grandes volúmenes de transcripciones de forma reproducible.

## Benchmarks y rendimiento

La model card incluye una comparación de errores fácticos por cada 1.000 palabras entre modelos de la familia WhisperNow, medida con decodificación greedy, `repeat_penalty` 1.05 y límite de 2,5 tokens por palabra de transcripción:

| Modelo | Archivo Q8_0 | Memoria en uso | Errores fácticos por 1.000 palabras |
|---|---|---|---|
| LFM2.5 1.2B | 1,25 GB | 1,6 GB | 6,32 |
| LFM3 1.7B | 1,85 GB | 2,2 GB | 5,04 |
| LFM2.5 2.6B | 2,87 GB | 3,3 GB | 4,88 |
| Qwen3.5 4B | 4,48 GB | 5,3 GB | 3,01 |
| Nemotron Bolt E4B (este modelo) | 7,97 GB | 8,4 GB | 2,59 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los conjuntos de evaluación propios son: test (3.297 filas reservadas del dataset de entrenamiento, de 1 a unas 1.000 palabras), bench-long (416 dictados de 151 a 946 palabras, 49 de ellos turnos reales de reunión del corpus AMI) y bench-noise (461 dictados de 20 a 64 palabras).

## Requisitos de hardware

- VRAM estimada: aproximadamente 8,4 GB de memoria en uso con el archivo GGUF Q8_0 (7,97 GB de archivo), según la model card.
- En precisión bfloat16, los 7.463 millones de parámetros requieren del orden de 15 GB de VRAM solo para pesos, más overhead de activaciones y caché KV; esta cifra es una estimación, no un dato publicado.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, una RTX 4090 (24 GB) o superior permite Q8_0 con holgura y bf16 con margen; A100 y H100 son sobredimensionadas para este caso de uso.
- Cabe en GPU de consumo: sí, con Q8_0 en tarjetas de 12 GB o más; en tarjetas de 8 GB el margen es muy ajustado.
- Opciones de despliegue: llama.cpp (`llama-server -hf ...:Q8_0 --jinja -c 8192`) y Transformers con `Gemma4ForCausalLM` y `key_mapping`. No se documentan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. El límite de generación recomendado es de 2,5 tokens por palabra de transcripción, con un mínimo de 64 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria Q8_0 | Errores/1.000 palabras | Licencia |
|---|---|---|---|---|---|
| WhisperNow Nemotron Bolt E4B | 7,46 B | no disponible | 8,4 GB | 2,59 | OpenMDW 1.1 |
| WhisperNow Qwen3.5 4B | no disponible | no disponible | 5,3 GB | 3,01 | no disponible |
| WhisperNow LFM2.5 2.6B | no disponible | no disponible | 3,3 GB | 4,88 | no disponible |
| WhisperNow LFM3 1.7B | no disponible | no disponible | 2,2 GB | 5,04 | no disponible |

Los cuatro modelos pertenecen a la misma familia de limpieza de transcripciones del mismo autor. Este modelo ofrece la menor tasa de errores fácticos a costa del mayor consumo de memoria de la serie.

## Limitaciones y advertencias

- Modelo monolingüe en inglés: no soporta castellano ni otros idiomas.
- Especializado exclusivamente en limpieza de transcripciones; no es adecuado para conversación general, razonamiento abierto ni generación creativa.
- Riesgo de alucinación: aunque la tasa declarada es baja (2,59 errores por 1.000 palabras), el modelo puede introducir cambios no presentes en el dictado original.
- Requiere seguir estrictamente el formato de uso: un único turno de usuario con la transcripción recortada y sin system prompt; desviarse puede degradar la salida.
- La carga en Transformers exige `key_mapping`; sin él, el modelo se inicializa aleatoriamente y produce salidas sin sentido.
- La licencia OpenMDW 1.1 debe revisarse antes de uso comercial; la model card la etiqueta como "other" con nombre openmdw-1.1.
- Sin datos de benchmarks estándar publicados, la evaluación se limita a métricas internas de la familia WhisperNow.
- El contexto máximo no está documentado; el ejemplo de despliegue usa 8.192 tokens, lo que puede limitar transcripciones muy largas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/category271/whispernow-nemotron-bolt-e4b
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Dataset de entrenamiento: https://huggingface.co/datasets/category271/whispernow-cleanup
- Reglas de limpieza (sección del dataset): https://huggingface.co/datasets/category271/whispernow-cleanup#the-cleanup-rules
- Repositorio de la aplicación WhisperNow: https://github.com/stephan271c/WhisperNow
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Modelo hermano LFM2.5 1.2B: https://huggingface.co/category271/whispernow-lfm2.5-1.2b
- Modelo hermano LFM3 1.7B: https://huggingface.co/category271/whispernow-lfm3-1.7b
- Modelo hermano LFM2.5 2.6B: https://huggingface.co/category271/whispernow-lfm2.5-2.6b
- Modelo hermano Qwen3.5 4B: https://huggingface.co/category271/whispernow-qwen3.5-4b
