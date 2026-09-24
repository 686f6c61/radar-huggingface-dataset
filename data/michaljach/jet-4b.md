# michaljach/jet-4b

## Resumen

Jet 4B es un modelo de decisión tipada (typed decision model) construido por el autor michaljach sobre el backbone Qwen/Qwen3.5-4B. No es un modelo generativo de propósito general: su única función es elegir entre opciones que se le suministran y devolver probabilidades calibradas por etiqueta, sin producir texto libre. El repositorio publicado contiene únicamente los pesos del adaptador LoRA (PEFT), no un backbone fusionado, con un tamano de 0,1 GB.

El modelo resuelve un problema muy concreto: convertir una tarea de clasificación, regresión ordinal o verificación booleana en una lectura restringida de tokens de etiqueta sobre un LLM, con calibración por temperatura específica por tipo de pregunta. Soporta tres tipos de consulta: `choice` (entre 2 y 255 opciones nombradas), `score` (entre 2 y 10 niveles ordenados, con puntuación esperada) y `noul` (pregunta de sí/no, devolviendo la probabilidad de "sí").

La relevancia de esta release radica en su enfoque de evaluación: introduce un "Decision Index" con corrección por azar, y publica métricas locales y diagnósticos sobre 15 datasets. La versión es v1.0.0, con checkpoint en el paso 3750, publicada el 24 de septiembre de 2026. En el momento de redactar esta ficha el repositorio registra 0 descargas y 0 likes, por lo que se trata de un artefacto reciente y sin adopción pública verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/PEFT sobre el backbone Qwen/Qwen3.5-4B; arquitectura interna del backbone no detallada en la informacion disponible mas alla de la referencia a Qwen3.5 y del uso del kernel FLA |
| Parametros totales | Aproximadamente 4.000 millones en el backbone (Qwen3.5-4B) mas el adaptador LoRA (rango 16); recuento exacto del adaptador no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | el wrapper rechaza cualquier prompt completo de mas de 8.192 tokens en lugar de truncarlo |
| Tipos de cuantizacion | no disponible; el adaptador se ejecuta con backbone en BF16 y parametros LoRA en FP32 |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); no se distribuyen pesos fusionados ni GGUF |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3.5-4B con rango y alpha 16, dropout 0,05, tasa de aprendizaje 1e-4 y batch efectivo de 4 (batch 1 con acumulación 4). Se entrenó durante una época sobre 15.997 ejemplos del conjunto `train_v5_r2`, lo que supone 4.000 actualizaciones del optimizador. La función de pérdida usa objetivos suaves (soft-target), suavizado de etiquetas de 0,02 y un peso de pérdida ordinal de 2, con semilla 240924. El paso 3750 se seleccionó por la NLL más baja en un split de selección independiente de 1.400 filas. La calibración se realizó con un split separado de 1.400 filas mediante escalado de temperatura por tipo de pregunta.

El entrenamiento completo se ejecutó en una única RTX 4080 SUPER de 16 GB durante aproximadamente 2 horas y 26 minutos, con un pico de memoria asignada de 10,39 GB. El cargador incluido fija la revisión del modelo base en `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` y habilita el kernel FLA, dejando la convolución causal en el fallback de PyTorch. La model card no describe en detalle la arquitectura interna del backbone Qwen3.5-4B, por lo que no se puede confirmar si se trata de un transformer denso clásico o de un híbrido con atención lineal. La decodificación es restringida a tokens de etiqueta, no generativa.

## Capacidades

- Decisión tipada sobre opciones suministradas: tipo `choice`, con entre 2 y 255 opciones nombradas, devolviendo la clave seleccionada y las probabilidades por opción.
- Puntuación ordinal: tipo `score`, con entre 2 y 10 niveles ordenados, devolviendo la puntuación esperada (base cero), el nivel seleccionado y las probabilidades.
- Verificación booleana: tipo `noul`, con preguntas de sí/no y probabilidad de "sí".
- Probabilidades calibradas por etiqueta mediante escalado de temperatura por tipo de pregunta.
- Campo de confianza derivado de la entropía inversa normalizada, que la model card aclara explícitamente que no es una probabilidad de corrección independiente.
- Capacidad de clasificación textual (temática, intención, tipo de incidencia) mediante opciones con criterios descriptivos.
- Capacidad de inferencia de lenguaje natural y revisión contractual, según los diagnósticos publicados en NLI4CT y ContractNLI.
- No soporta generación de texto libre, tool calling, function calling, agentes, multi-step reasoning, visión, audio ni multimodalidad.
- Multilingüismo limitado al inglés; la model card declara únicamente `en`.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y un conjunto de opciones (`billing`, `bug`, `cuenta`, etc.) con criterios descriptivos, y devuelve la categoría y su probabilidad. El ejemplo oficial de la model card usa exactamente este escenario con "I was charged twice this month".
- Enrutamiento de peticiones en pipelines internos: dado un mensaje de entrada, elegir entre departamentos o colas de destino con `choice`, usando las probabilidades como umbral de derivación a revisión humana cuando la confianza es baja.
- Codificación de encuestas y respuestas abiertas: con `score` se puede mapear una respuesta libre a una escala ordinal de satisfacción (por ejemplo, 1-5) obteniendo la puntuación esperada y la distribución, útil para análisis estadístico agregado.
- Moderación asistida y políticas: formular preguntas `noul` del tipo "¿infringe la política X?" para obtener una probabilidad de sí que alimente un umbral configurable, dejando la decisión final a un revisor humano.
- Verificación de afirmaciones y NLI en documentación: comprobar si un fragmento implica, contradice o es neutral respecto a otro, con probabilidades, aplicación directa a la validación de contratos o cumplimiento normativo.
- Respuesta a preguntas de opción múltiple en evaluación: usar `choice` para seleccionar la respuesta correcta en conjuntos tipo MMLU o GSM8K, tal y como reflejan los diagnósticos publicados.
- Extracción de decisiones repetibles a escala: sustituir prompts generativos por decisiones tipadas donde se necesita una etiqueta estable, reproducible y con probabilidad asociada, en lugar de texto libre que requiere post-procesado.

## Benchmarks y rendimiento

Resultados de evaluación publicados en la model card en el momento de la release:

| Evaluación | Resultado |
|---|---:|
| Precisión de selección, 1.400 filas | 87,93% |
| NLL de selección | 0,3561 |
| Precisión en test local independiente, 600 filas | 94,00% |
| NLL en test local, bruto / calibrado | 0,2176 / 0,2199 |
| Peticiones de benchmark muestreadas | 1.900 en 15 datasets |
| Errores / peticiones no soportadas en el diagnóstico | 0 / 0 |
| Decision Index 0.2 oficial (global) | no medido |

Resultados de diagnóstico seleccionados (conjuntos de casos distintos de los del leaderboard público):

| Benchmark | Tamano de muestra | Metrica | Puntuacion de Jet |
|---|---:|---|---:|
| GSM8K | 112 | accuracy | 76,79% |
| NLI4CT | 55 | macro-F1 | 84,01% |
| ContractNLI | 56 | macro-F1 | 74,04% |
| CRUXEval | 55 | accuracy | 38,18% |
| WinoGrande | 200 | accuracy | 64,50% |
| HellaSwag | 200 | accuracy | 91,00% |

La model card advierte que la evaluación completa está en curso en el momento de la release, que el Decision Index requiere 40 benchmarks en cinco áreas con puntuación corregida por azar, y que ningún promedio de subconjuntos se presenta como puntuación global ni como ranking.

## Requisitos de hardware

- El repositorio del adaptador ocupa 0,1 GB; la primera inferencia descarga los pesos del backbone Qwen3.5-4B, que en BF16 suponen aproximadamente 8 GB adicionales (estimación basada en el tamano del backbone, no confirmada en la model card).
- Entorno validado por el autor: Python 3.12 sobre Linux, NVIDIA CUDA, PyTorch 2.11.0 con CUDA 12.8, Transformers 5.17.0 y PEFT 0.21.0.
- Entrenamiento validado en una RTX 4080 SUPER de 16 GB, con pico de memoria asignada de 10,39 GB; esto sirve como referencia de suelo para memoria en BF16.
- Cabe en GPU de consumo con 16 GB o más (RTX 4080 SUPER, RTX 4090, RTX 3090/4090 con 24 GB). En tarjetas de 8-12 GB sería necesario cuantizar o fusionar el adaptador, algo que la model card no documenta.
- Opciones de despliegue: el único cargador soportado es el wrapper incluido (`jet4b.py`) sobre PEFT y Transformers. La model card indica explícitamente que los pipelines genéricos de generación de texto no implementan la inferencia tipada ni la calibración de Jet.
- No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama ni TGI, y no se distribuyen pesos en GGUF.
- Latencia y throughput: no disponibles. La model card señala que las preguntas se procesan secuencialmente y sin caché de prefijos compartidos, lo que limita el rendimiento en lotes grandes.
- El servidor MLX/ONNX de la release anterior de Jet no es el cargador válido para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| Jet 4B (michaljach/jet-4b) | ~4B + LoRA r16 | Decision tipada con probabilidades calibradas, sin generacion libre | Apache-2.0 | Adaptador PEFT en HuggingFace; 0 descargas y 0 likes en el momento de la consulta |
| Jet (michaljach/jet) | 0,6B (base Qwen3-0.6B) | Version anterior del mismo enfoque de decision | Apache-2.0, segun la model card | Release previa en HuggingFace; incluye servidor MLX/ONNX |
| Qwen/Qwen3.5-4B | ~4B | LLM generativo de proposito general | no disponible en la informacion proporcionada | Modelo base en HuggingFace |

No se dispone de datos de benchmark comparativos directos entre Jet 4B y otros modelos de decisión tipada en la información proporcionada. El modelo Jet-Nemotron 4B de NVIDIA, que aparece en los resultados de búsqueda, es un modelo distinto y no relacionado con esta release.

## Limitaciones y advertencias

- No es un modelo de chat ni generativo: no produce respuestas en texto libre y no debe usarse como asistente conversacional.
- No soporta visión, audio, tool calling, function calling ni razonamiento multi-paso con agentes.
- Idioma limitado al inglés; no se declara soporte para castellano ni otros idiomas.
- Los prompts completos de más de 8.192 tokens se rechazan en lugar de truncarse, lo que puede provocar fallos en entradas largas si no se gestiona en el código cliente.
- Las preguntas se procesan secuencialmente y sin caché de prefijos compartidos, con el coste de rendimiento que esto implica.
- La calibración se ajustó sobre una mezcla concreta y la propia model card advierte que no garantiza calibración en otro dominio.
- El campo `confidence` es entropía inversa normalizada, no una probabilidad de acierto; interpretarlo como tal induce a error.
- La calibración empeoró ligeramente la NLL en el test local independiente (0,2199 frente a 0,2176 bruto) y no se reajustó sobre ese test.
- El Decision Index oficial (0.2) no se midió en el momento de la release; no existe una puntuación global comparable con otros modelos.
- El rendimiento en CRUXEval es bajo (38,18%), lo que sugiere poca fiabilidad en tareas de razonamiento sobre ejecución de código.
- El solapamiento entre fuentes de entrenamiento y evaluación no se ha descartado de forma exhaustiva; las comprobaciones exactas realizadas no constituyen una certificación completa de contaminación.
- Los ficheros del conjunto de datos de entrenamiento no se incluyen en la release, lo que dificulta la reproducción.
- Licencia Apache-2.0, compatible con uso comercial, pero las fuentes de datos originales conservan sus propios términos y el repositorio no redistribuye datasets de entrenamiento ni de benchmark.
- Artefacto muy reciente y sin adopción pública (0 descargas, 0 likes): no hay evidencia externa de robustez en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/michaljach/jet-4b
- Release anterior (Qwen3-0.6B): https://huggingface.co/michaljach/jet
- Repositorio de la release anterior en HuggingFace: https://huggingface.co/michaljach/jet/tree/main
- Demo/API alojada: https://huggingface.co/spaces/michaljach/jet
- Decision Index (space de evaluación): https://huggingface.co/spaces/multimodalart/jev-decision-index
