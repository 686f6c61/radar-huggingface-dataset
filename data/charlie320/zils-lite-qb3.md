# Charlie320/zils-lite-qb3

## Resumen

zils-lite-qb3 es un ajuste fino (fine-tune) de Qwen/Qwen3.5-0.8B publicado por el usuario Charlie320 en Hugging Face, con licencia Apache-2.0. Forma parte del ecosistema "Zils" de modelos de decisión orientados a la subred 127 de Bittensor, y se presenta como un "body" (cuerpo) del pool de sopas (soup pool) `d3-lite`. El modelo parte de `joamCriff123/zils-lite-l1117a`, único cuerpo de la sopa `d3-lite` del 18 de noviembre de 2026, y se entrena mediante destilación desde `joamCriff123/zils-mini-m1115`, cuerpo de la sopa `d3-mini` de la misma fecha.

El modelo tiene 852.985.920 parámetros totales (aproximadamente 0,85 mil millones), se distribuye en formato safetensors en BF16 y ocupa 1,7 GB en el repositorio. La arquitectura subyacente corresponde a la del modelo base Qwen3.5-0.8B, aunque la model card no detalla explícitamente sus características arquitectónicas (tipo de transformer, mecanismos de atención, etc.). El modelo está etiquetado como `decision-model`, lo que sugiere que su propósito es resolver tareas de decisión estructuradas en formato de examen, más que generación de texto libre general.

La relevancia de este modelo radica en su enfoque: es un fine-tune de destilación por sopa de LoRAs orientado a tareas de decisión con formato de examen, con un conjunto de datos de entrenamiento cuidadosamente documentado (unas 76.100 filas) y un procedimiento reproducible. No obstante, al tener 0 descargas y 0 likes en el momento de la consulta, y al no publicarse benchmarks ni resultados de evaluación, su rendimiento real no está verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (hereda la del modelo base Qwen/Qwen3.5-0.8B) |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo más allá de indicar que es un fine-tune de Qwen/Qwen3.5-0.8B "en el layout chassis" (chassis layout), con pesos de lenguaje entrenados y una torre de visión (vision tower) heredada del modelo padre. Esto sugiere que el modelo base incorpora capacidades multimodales (visión), aunque no se detalla cómo se conservan o modifican durante el fine-tune. No se especifican el número de capas, dimensiones ocultas, mecanismos de atención ni la longitud de contexto del modelo base.

El entrenamiento consistió en tres fine-tunes LoRA (rango 32, fusionados) del cuerpo de partida `joamCriff123/zils-lite-l1117a`, con semillas distintas, una época cada uno a una tasa de aprendizaje de 5e-5, cuyos pesos se promediaron uniformemente (sin interpolación). Los objetivos de entrenamiento fueron "suaves" (soft targets): para la mayoría de los ítems escritos, una cuarta parte de la respuesta propia del ítem y tres cuartas partes de las probabilidades de respuesta de `joamCriff123/zils-mini-m1115` (destilación desde el profesor, la sopa más grande); para unos 4.100 ítems de puntuación aritmética y similitud de frases, solo las probabilidades del profesor; para 15.000 filas sin etiquetar, solo las probabilidades del profesor; y para 30.000 filas etiquetadas, mitad etiqueta del dataset y mitad probabilidades de respuesta del cuerpo de partida.

Los datos de entrenamiento suman unas 76.100 filas, con una pasada barajada por semilla: (1) unos 31.100 ítems de decisión en formato de examen de las familias de tareas conocidas, generados con la receta pública de autoría Zils (`scripts/author_exam.py`) por Claude Opus y un modelo abierto local, a partir de particiones de entrenamiento de los datasets fuente públicos, incluyendo unos 1.100 ítems de llamadas a herramientas (tool-call) escritos a partir de las filas 90.000-93.000 del subconjunto de function-calling de `glaiveai/glaive-function-calling-v2`; (2) 15.000 filas del split de entrenamiento de `tasksource/tasksource-jev-typed-decisions` usadas solo como entradas de destilación sin etiquetar; (3) 30.000 filas adicionales del mismo dataset, de 240 tareas fuente con metadatos de licencia no especificados, usadas con sus etiquetas (excluyendo fuentes no comerciales y tareas con nombres tipo BIG-bench, y descartando filas cuyo texto coincida con validación o test). No se usaron ítems de examen de validador, ítems de examen semilla públicos ni datos de clientes.

## Capacidades

- Resolución de tareas de decisión en formato de examen (exam-format decision items): el modelo está entrenado específicamente para responder ítems estructurados de las familias de tareas del ecosistema Zils.
- Llamadas a herramientas (tool calling / function calling): se entrenó con unos 1.100 ítems de tool-call derivados de `glaiveai/glaive-function-calling-v2`.
- Puntuación aritmética y similitud de frases: el entrenamiento incluyó unos 4.100 ítems de estos tipos, aunque con objetivos de destilación (probabilidades del profesor) en lugar de respuestas escritas.
- Capacidades multimodales potenciales: hereda la torre de visión del modelo padre Qwen3.5-0.8B, aunque la model card no especifica cómo se usa ni si se mantiene funcional tras el fine-tune.
- Generación de texto general: no se documenta explícitamente; el enfoque del entrenamiento es tareas de decisión, no generación abierta.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Modo de razonamiento (thinking mode): no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque la presencia de ítems de tool-call sugiere cierta capacidad de interacción estructurada.

## Casos de uso

- Evaluación de modelos de decisión en la subred 127 de Bittensor: el modelo se ofrece como "body" candidato para el pool de sopas `d3-lite`, por lo que su uso principal es participar en la competición de validación de la subred, donde se evalúa su rendimiento en ítems de examen.
- Destilación y investigación sobre sopas de LoRAs: el procedimiento documentado (tres LoRAs de rango 32 promediados, con objetivos suaves) sirve como referencia reproducible para estudiar técnicas de model souping y destilación en modelos pequeños.
- Clasificación y respuesta a ítems estructurados: puede emplearse para resolver cuestionarios de opción múltiple o tareas de decisión con formato fijo, dado su entrenamiento específico en "exam-format decision items".
- Prototipado de asistentes con llamadas a herramientas: los 1.100 ítems de tool-call permiten experimentar con function calling en un modelo de menos de 1.000 millones de parámetros, adecuado para entornos con recursos limitados.
- Investigación sobre alineación con profesores: al usar probabilidades de un modelo mayor (`zils-mini-m1115`) como objetivo, es útil para estudiar cómo se transfiere conocimiento de un pool mayor a un cuerpo más pequeño.
- Experimentación educativa en entornos con GPU de consumo: con 0,85 mil millones de parámetros en BF16 (1,7 GB), cabe en GPUs de consumo y permite experimentar con fine-tuning y evaluación sin infraestructura dedicada.
- Análisis de datos de decisión tipados: el uso de `tasksource/tasksource-jev-typed-decisions` sugiere aplicabilidad a tareas de decisión tipadas, aunque las etiquetas de muchas fuentes son de licencia no especificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los pesos ocupan aproximadamente 1,7 GB; con overhead de activaciones y caché KV, se estima un uso de VRAM de 2-3 GB en BF16 (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16; para cuantización a 8 bits o 4 bits (no documentada por el autor) se podría reducir a 1-2 GB.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, dado el tamaño reducido del modelo.
- Opciones de despliegue: no documentadas por el autor; al ser un transformer estándar en safetensors, es compatible en principio con vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama (previa conversión), aunque no se han publicado conversiones oficiales.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-qb3 | 852.985.920 | No disponible | Apache-2.0 | Hugging Face (0 descargas) | Fine-tune de decisión sobre Qwen3.5-0.8B |
| Qwen/Qwen3.5-0.8B | ~0,8 mil millones (no confirmado) | No disponible | No disponible en la información | Hugging Face (modelo base) | Modelo base del que deriva |
| joamCriff123/zils-lite-l1117a | No disponible | No disponible | Apache-2.0 (según la model card) | Hugging Face | Cuerpo de partida de la sopa d3-lite |
| joamCriff123/zils-mini-m1115 | No disponible | No disponible | No disponible en la información | Hugging Face | Profesor de destilación (sopa d3-mini) |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse con datos derivados de datasets públicos (glaive-function-calling-v2, tasksource-jev-typed-decisions) puede heredar sesgos presentes en ellos.
- Riesgo de alucinación: no evaluado; el entrenamiento con objetivos suaves de destilación puede producir respuestas plausibles pero incorrectas en tareas fuera de las familias de examen entrenadas.
- Limitaciones de contexto o idioma: no se especifican la longitud de contexto ni los idiomas soportados; el entrenamiento se centró en ítems en formato de examen, lo que puede limitar el rendimiento en generación libre o conversación abierta.
- Restricciones de licencia: el modelo se publica bajo Apache-2.0, pero la model card advierte explícitamente que "este repositorio contiene solo pesos; consulte los términos de los datasets fuente antes de reutilizarlos". Algunas fuentes de entrenamiento tienen metadatos de licencia no especificados, lo que introduce incertidumbre legal para uso comercial.
- Ausencia de evaluación: no hay benchmarks publicados, 0 descargas y 0 likes, por lo que no existe validación independiente de su rendimiento.
- Uso previsto restringido: es un "body" para un pool de sopas de Bittensor; su uso fuera de ese contexto (por ejemplo, como asistente general) no está validado.
- Datos de entrenamiento: se excluyeron fuentes no comerciales y se filtraron filas que coincidían con validación/test, pero la procedencia de las 30.000 filas con licencia no especificada es una advertencia relevante para producción.
- Fecha de creación: el modelo figura creado el 2026-11-18, fecha futura respecto a la información habitual; conviene verificar la autenticidad y vigencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-lite-qb3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo de partida: https://huggingface.co/joamCriff123/zils-lite-l1117a
- Profesor de destilación: https://huggingface.co/joamCriff123/zils-mini-m1115
- Dataset de tool-calls: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Dataset de decisiones tipadas: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
