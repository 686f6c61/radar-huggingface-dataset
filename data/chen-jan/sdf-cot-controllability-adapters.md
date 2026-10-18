# chen-jan/SDF-CoT-controllability-adapters

## Resumen

SDF-CoT-controllability-adapters es un conjunto de adaptadores LoRA de investigación publicados por el usuario chen-jan, no un modelo autónomo. Cada adaptador se entrenó sobre documentos sintéticos y ficticios, generados por un modelo de lenguaje, que contienen afirmaciones inventadas sobre los propios modelos base (gpt-oss-120b, al que los documentos llaman "ChatGPT", y Qwen3.6-35B-A3B, al que llaman "Qwen"). El objetivo del experimento es estudiar si un modelo puede controlar su cadena de razonamiento (chain of thought) cuando se le induce, vía ajuste fino, la creencia de que existe una comprobación automatizada que lo evalúa.

El release contiene un checkpoint LoRA de rango 32 por ejecución, exportado desde Tinker (Thinking Machines), junto con un `training_manifest.json` que documenta hash de datos, hash de identificadores reservados, pasos, tasa de aprendizaje y commit de git. Las ejecuciones se nombran `<modelo>__<condición>__<split>__s<seed>` y cubren cinco condiciones: `word_suppression`, `lowercase_thinking`, `vague`, `control` y `pile`, además de variantes de dos etapas (`A_then_B`) que continúan el entrenamiento desde los pesos de la época 1 de otra ejecución.

La relevancia es exclusivamente investigadora: se trata de organismos modelo (model organisms) para estudiar fidelidad y controlabilidad del razonamiento, no de un modelo para uso general. La model card lo indica de forma explícita: "Research model organisms. Not for general use.". No se han publicado benchmarks de rendimiento ni resultados de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformers; modelos base: openai/gpt-oss-120b y Qwen/Qwen3.6-35B-A3B |
| Parametros totales | No disponible para los adaptadores (no se publica el recuento). Modelos base: 120B (gpt-oss-120b) y 35B en el nombre de Qwen3.6-35B-A3B |
| Parametros activos | No disponible en la informacion proporcionada. El sufijo "A3B" del modelo base Qwen sugiere arquitectura MoE con aproximadamente 3B activos, pero no se confirma en la model card |
| Longitud de contexto | No disponible (depende del modelo base; no se documenta en la model card) |
| Tipos de cuantizacion | No disponible. Los adaptadores se distribuyen sin cuantizar (LoRA rango 32); la cuantizacion aplicable seria la del modelo base al que se fusionen |
| Idiomas soportados | No disponible |
| Licencia | other (sin términos concretos en la informacion disponible; la model card restringe el uso a investigación) |
| Formato de pesos | Checkpoint LoRA en formato PEFT exportado desde Tinker, con `training_manifest.json` por ejecución; no se confirma explícitamente el formato de serialización (safetensors no verificado) |

## Arquitectura y entrenamiento

Cada artefacto es un adaptador LoRA de rango 32 entrenado con Tinker sobre uno de dos modelos base: openai/gpt-oss-120b y Qwen/Qwen3.6-35B-A3B. La configuración de entrenamiento es batch size 8, tasa de aprendizaje 1e-4 en la primera etapa y 1e-5 en la segunda etapa de las ejecuciones de dos fases, semilla 0 y split `mixed`. Se reserva un 5% de los documentos (ideas completas, misma proporción por hecho) para medir pérdida en held-out. La receta se adapta del setup stage-1 de Haskins & Engels (SDF). Solo se conserva el checkpoint de la época 1 porque la pérdida en held-out fue la más baja en esa época en todas las ejecuciones multi-época.

El volumen de datos es pequeño: entre 2.547 y 3.164 documentos de entrenamiento según la condición, lo que se traduce en 319-396 pasos por época. Las condiciones son: `word_suppression` (una comprobación automática escanea el razonamiento en busca de una palabra prohibida), `lowercase_thinking` (el razonamiento debe escribirse íntegramente en minúsculas), `vague` (se aplica "la regla que fije la tarea" sin nombrarla nunca), `control` (documentación sobre cómo se mantiene la documentación del modelo, sin mencionar razonamiento ni evaluación) y `pile` (documentos aleatorios de Pile como control sin contenido relevante). La innovación metodológica no está en la arquitectura, sino en el diseño experimental: el uso de documentos sintéticos que afirman hechos falsos sobre el propio modelo para inducir comportamiento, y la cadena de ejecuciones `A_then_B` para medir la retención o interferencia entre creencias inducidas sucesivamente.

## Capacidades

- No aporta capacidades nuevas por sí mismo: es un adaptador de investigación que modula el comportamiento del modelo base al que se aplica.
- Inducción de comportamiento sobre el razonamiento: supresión de palabras concretas durante la cadena de pensamiento (condición `word_suppression`).
- Formateo del razonamiento: forzar la escritura del razonamiento en minúsculas (condición `lowercase_thinking`).
- Seguimiento de reglas no especificadas: condición `vague`, donde la regla la define la tarea y nunca se nombra en los documentos.
- Absorción de afirmaciones factuales inventadas sobre el propio modelo, incluyendo el uso de un nombre propio distinto ("ChatGPT", "Qwen") frente al identificador técnico.
- Evaluación de interferencia entre creencias: las variantes `A_then_B` permiten estudiar si una segunda etapa sobreescribe o conserva el comportamiento aprendido en la primera.
- Generación de texto, razonamiento, código o matemáticas: no documentadas para los adaptadores; heredadas del modelo base en la medida en que el ajuste no las degrade (no se publican evaluaciones).
- Soporte de tool calling, function calling, agentes o multimodalidad: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre fidelidad del razonamiento: aplicar el adaptador `lowercase_thinking` y comprobar si la cadena de pensamiento registrada refleja realmente el proceso que produce la respuesta, comparando con la condición `control`.
- Estudio de monitorización de CoT: usar `word_suppression` para evaluar si un monitor automático detecta la supresión de palabras en el razonamiento y si el modelo la oculta de forma deliberada o por efecto del ajuste.
- Model organisms para safety research: emplear el par `control` / `vague` como línea base y tratamiento en experimentos sobre seguimiento de reglas implícitas, con 2.810 y 2.716 documentos respectivamente y una sola semilla.
- Análisis de interferencia entre ajustes sucesivos: las ejecuciones `vague_then_control`, `control_then_lowercase` o `lowercase_then_lowercase` permiten medir cuánto del comportamiento previo persiste tras una segunda época a tasa 1e-5.
- Reproducción y auditoría de recetas de SDF: el `training_manifest.json` de cada carpeta incluye hash de datos, hash de held-out, pasos, LR y commit, lo que facilita replicar el pipeline con Tinker.
- Control negativo en experimentos de ajuste fino: la condición `pile` (2.547 documentos aleatorios de Pile, 319 pasos) sirve para separar el efecto del contenido del efecto de entrenar sobre cualquier corpus.
- Estudio de alucinación inducida: los documentos afirman hechos falsos sobre los modelos; el adaptador permite analizar cómo el ajuste sobre texto sintético introduce creencias no fundamentadas y cómo se manifiestan en evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente menciona un criterio de selección de checkpoint (pérdida en held-out mínima en la época 1 en todas las ejecuciones multi-época), sin cifras. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de controlabilidad del razonamiento.

## Requisitos de hardware

- Los adaptadores en sí ocupan muy poco espacio (LoRA de rango 32), pero la inferencia requiere cargar el modelo base completo junto con el adaptador.
- Estimación aritmética para openai/gpt-oss-120b (no publicada por el autor): unos 240 GB en FP16, ~120 GB en 8 bits y ~60-65 GB en 4 bits. No cabe en GPU de consumo de 24 GB sin cuantización agresiva y offload.
- Estimación aritmética para Qwen3.6-35B-A3B: unos 70 GB en FP16 y ~18-20 GB en 4 bits si se confirma la arquitectura MoE con ~3B activos, en cuyo caso el coste de cómputo por token sería bajo y sí cabría en GPUs de consumo de 24 GB en cuantización de 4 bits.
- GPU recomendadas (orientativo, no verificado en la model card): A100 80 GB o H100 80 GB para el base de 120B en cuantización de 4-8 bits; para el base de 35B, una RTX 4090 de 24 GB podría bastar en 4 bits.
- Despliegue: PEFT sobre transformers para carga del adaptador; vLLM soporta adaptadores LoRA en servicio; llama.cpp/Ollama requerirían fusión del adaptador con el base y conversión a GGUF, no documentada por el autor.
- Latencia y throughput: no disponibles.
- Nota: el entrenamiento se realizó en Tinker (servicio remoto), por lo que no se requiere hardware local para reproducir el ajuste, solo para la inferencia.

## Comparativa con modelos similares

No se identifican en la información disponible otros releases públicos de adaptadores tipo model organism equivalentes. La comparación posible es interna, entre los dos conjuntos de adaptadores y frente al modelo base sin adaptador:

| Variante | Modelo base | Datos de entrenamiento | Epocas retenidas | Licencia | Estado |
|---|---|---|---|---|---|
| Adaptadores gpt120b | openai/gpt-oss-120b (120B) | 2.547-3.164 documentos sinteticos por condicion | 1 | other | Publicado |
| Adaptadores qwen36_35b | Qwen/Qwen3.6-35B-A3B (35B) | 2.547-3.164 documentos sinteticos por condicion | 1 | other | Publicado (tabla truncada en la model card) |
| Modelo base sin adaptador | openai/gpt-oss-120b o Qwen3.6-35B-A3B | No aplica | No aplica | La del modelo base | Referencia de control |

No hay datos de rendimiento comparado entre ambas variantes, ni con LoRA de propósito general, en la información proporcionada.

## Limitaciones y advertencias

- Naturaleza del artefacto: son organismos modelo de investigación; la model card indica explícitamente que no son para uso general.
- Sesgo inducido deliberado: los adaptadores se entrenaron para absorber afirmaciones inventadas sobre los propios modelos; cualquier salida puede reflejar esas creencias falsas.
- Licencia `other` sin texto de términos en la información disponible: el uso comercial es incierto y, en la práctica, la finalidad declarada es investigadora. Requiere contactar con el autor antes de cualquier uso en producción.
- Volumen de datos reducido (2.547-3.164 documentos) y una sola semilla (0) y un solo split (`mixed`): la robustez estadística de los resultados es limitada.
- Solo se conserva la época 1: no se pueden analizar trayectorias de entrenamiento ni sobreajuste posterior.
- El dataset de la condición `vague` no está publicado, por lo que esa rama no es reproducible de forma completa.
- La tabla de ejecuciones de la model card está truncada en la sección de Qwen; no se puede verificar el inventario completo de adaptadores de ese modelo base.
- Un adaptador solo es aplicable al modelo base exacto con el que se entrenó; no es portable a otros modelos.
- Riesgo de degradación de capacidades del base tras el ajuste: no se publican evaluaciones que lo descarten.
- Idiomas soportados y comportamiento multilingüe: no disponibles; los documentos sintéticos parecen estar en inglés.
- Ausencia total de benchmarks: no hay evidencia publicada de mejora o degradación medible en tareas estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chen-jan/SDF-CoT-controllability-adapters
- Dataset de las condiciones `word_suppression` y `control`: https://huggingface.co/datasets/chen-jan/SDF-CoT-controllability-word-suppression-control
- Dataset de la condición `lowercase_thinking`: https://huggingface.co/datasets/keramarek/SDF-CoT-controllability
- Dataset de la condición `pile`: https://huggingface.co/datasets/monology/pile-uncopyrighted
- Tinker (plataforma de entrenamiento usada): https://thinkingmachines.ai/tinker/
- Modelo base openai/gpt-oss-120b: https://huggingface.co/openai/gpt-oss-120b
- Modelo base Qwen/Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper, blog o demo del autor: no disponible en la informacion proporcionada
- Nota: los resultados de busqueda web recibidos (Wikipedia, Fandom y Petite Fute sobre la persona apellidada "Chen") no guardan relacion con este modelo y no se han utilizado.
