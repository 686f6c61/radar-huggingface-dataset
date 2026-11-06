# issai/foggen

## Resumen

FogGen es un modelo de lenguaje de 596 millones de parámetros obtenido mediante ajuste fino de Qwen3-0.6B, desarrollado por el usuario issai. No es un modelo de propósito general, sino un enrutador edge-cloud especializado: está entrenado para emitir un valor de confianza verbalizado (0.0, 0.25, 0.5, 0.75 o 1.0) antes de responder a una pregunta de opción múltiple. En producción, si la confianza declarada supera un umbral tau, se acepta la respuesta local del modelo pequeño; en caso contrario, la consulta se deriva a un modelo mayor en la nube, en este caso Qwen3-30B-A3B-Instruct-2507.

La relevancia del checkpoint radica en su enfoque de enrutamiento basado en calibración: en lugar de entrenar un clasificador separado, el propio modelo aprende a estimar su competencia por dominio. El entrenamiento se realizó en una cadena de 14 rondas incrementales (R0 a R14) sobre siete dominios (finanzas, ciencia, código, derecho, matemáticas, cultura kazaja y medicina), con etiquetas de confianza derivadas del número de aciertos en 8 muestras por pregunta. Este checkpoint corresponde a la ronda 14.

El modelo está pensado para escenarios de inferencia en el borde con derivación selectiva a la nube, lo que permite reducir costes manteniendo una precisión cercana a la del modelo grande. Soporta inglés y kazajo, y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-0.6B) con ajuste fino LoRA |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen3-0.6B) |
| Tipos de cuantización | no disponible (pesos en safetensors, bf16 en el ejemplo de uso) |
| Idiomas soportados | inglés (en), kazajo (kk) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

FogGen parte de Qwen3-0.6B, un transformer decoder-only, y se ajusta mediante LoRA de rango 16, alpha 32, aplicado a todas las capas lineales, con tasa de aprendizaje 5e-5, 2 épocas por ronda y precisión bf16. El entrenamiento sigue una cadena de 14 rondas (R0 a R14) con un buffer de calibración inicial de 1.800 filas y, en cada ronda, hasta 300 filas del dominio nuevo más 60 filas de replay por cada dominio anterior. Los datos se generan con Qwen3-30B-A3B-Instruct-2507.

La innovación principal es la etiqueta de confianza: para cada pregunta nueva, el modelo en su estado actual responde 8 veces con temperatura 0.7, y el número de aciertos se mapea a los valores 0, 0.25, 0.5, 0.75 o 1. El modelo aprende así a verbalizar su propia fiabilidad por dominio antes de dar la respuesta final, lo que permite un enrutamiento calibrado sin un clasificador externo. El prompt de sistema exige el formato `Confidence: <valor>` seguido de `Final answer: <letra>` y desactiva el modo thinking.

## Capacidades

- Generación de texto para preguntas de opción múltiple con formato estructurado de confianza y respuesta.
- Verbalización de confianza calibrada en cinco niveles discretos (0.0, 0.25, 0.5, 0.75, 1.0).
- Enrutamiento edge-cloud: decisión local de mantener o derivar la consulta según el umbral tau.
- Razonamiento básico en siete dominios: finanzas, ciencia, código, derecho, matemáticas, cultura kazaja y medicina.
- Capacidad multilingüe limitada a inglés y kazajo.
- Aprendizaje continuo por rondas con replay de dominios anteriores para mitigar el olvido catastrófico.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Enrutamiento de consultas en asistentes de atención al cliente: el modelo evalúa su confianza en preguntas de opción múltiple y deriva a un modelo mayor solo cuando la confianza es baja, reduciendo costes de inferencia en la nube.
- Despliegue en dispositivos de borde con conectividad intermitente: al residir en 1,2 GB de repo y ~596 M de parámetros, puede ejecutarse localmente y consultar la nube solo para casos difíciles.
- Filtrado previo en pipelines de evaluación de conocimiento: se usa como primera etapa para clasificar preguntas por dificultad estimada antes de pasarlas a un modelo de referencia.
- Sistemas de tutoría educativa en inglés y kazajo: responde preguntas de cultura kazaja con alta precisión local (90,9% edge only) y deriva el resto.
- Investigación en calibración y aprendizaje continuo: sirve como banco de pruebas reproducible para estudiar enrutamiento basado en confianza verbalizada, con datos y script de evaluación públicos.
- Clasificación de riesgo en dominios regulados (derecho, medicina, finanzas): la confianza declarada permite marcar consultas que requieren revisión por un modelo mayor o por un humano.
- Optimización de costes en producción LLM: en el conjunto de evaluación, solo el 21,2% de media de las consultas se derivan a la nube, manteniendo una precisión media del 75,0% frente al 92,5% del modelo cloud-only.

## Benchmarks y rendimiento

Resultados de R14 con tau = 0,5 sobre 16.217 preguntas de evaluación (claves corregidas):

| Dominio | Preguntas | Cloud only | Edge only | Random routing | FogGen | Derivadas a nube |
|---|---|---|---|---|---|---|
| Finanzas | 4.425 | 92,3% | 62,3% | 68,7% | 73,9% | 21,5% |
| Ciencia | 1.742 | 93,6% | 61,4% | 67,9% | 72,2% | 20,1% |
| Código | 1.762 | 93,5% | 64,8% | 70,1% | 75,0% | 18,6% |
| Derecho | 1.846 | 87,7% | 57,1% | 63,2% | 67,0% | 19,8% |
| Matemáticas | 1.703 | 95,5% | 46,6% | 69,5% | 77,0% | 46,8% |
| Cultura kazaja | 1.317 | 96,2% | 90,9% | 90,9% | 91,5% | 1,1% |
| Medicina | 1.840 | 88,9% | 57,4% | 63,8% | 68,5% | 20,2% |
| Media | | 92,5% | 62,9% | 70,6% | 75,0% | 21,2% |

FogGen supera al enrutamiento aleatorio en 4,4 puntos en R14 y en 5,6 puntos de media entre R1 y R14. El error de calibración esperado medio es de 8,3 en R14. Con las claves almacenadas de la primera versión, R14 alcanza 65,0% frente a 63,0% del enrutamiento aleatorio. La model card advierte que versiones anteriores reportaban 67,8% y una mejora de 4,6 puntos por un cálculo incorrecto de la precisión del sistema.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en bf16 para los pesos; en cuantización de 8 bits alrededor de 0,6 GB y en 4 bits alrededor de 0,3 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de borde y en CPU.
- Cabe holgadamente en GPU consumer: sí, en todas las GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: transformers (ejemplo oficial en la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; no se documenta soporte explícito de vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FogGen (Qwen3-0.6B) | 596 M | no disponible | Enrutador edge-cloud con confianza verbalizada | Apache 2.0 | Hugging Face |
| issai/foggen-qwen3-1.7b | no disponible | no disponible | Misma cadena sobre Qwen3-1.7B | Apache 2.0 (presumible) | Hugging Face |
| issai/foggen-gemma3-1b | no disponible | no disponible | Misma cadena sobre Gemma3-1B | no disponible | Hugging Face |
| issai/foggen-gemma3-270m | no disponible | no disponible | Misma cadena sobre Gemma3-270M | no disponible | Hugging Face |

Las alternativas directas son los otros checkpoints de la misma familia FogGen, que replican la cadena de entrenamiento con modelos base de distinto tamaño. No se dispone de datos de benchmarks comparativos entre ellos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en preguntas de opción múltiple con formato A-D; no es un generador de texto general.
- La confianza verbalizada es discreta (cinco niveles) y su calibración es imperfecta: error de calibración esperado medio de 8,3.
- Riesgo de alucinación en la respuesta final cuando la confianza declarada es alta pero incorrecta; el enrutamiento no elimina este riesgo.
- Cobertura lingüística limitada a inglés y kazajo; el rendimiento fuera de estos idiomas no está documentado.
- Dependencia de un modelo cloud específico (Qwen3-30B-A3B-Instruct-2507) para las métricas reportadas; cambiar el modelo de nube altera la precisión del sistema.
- El conjunto de evaluación excluye 1.582 ítems cuyas claves no pudieron corregirse, lo que puede sesgar los resultados.
- El olvido catastrófico se mitiga con replay, pero el rendimiento por dominio varía notablemente (matemáticas deriva el 46,8% de consultas frente al 1,1% en cultura kazaja).
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-0.6B tiene sus propios términos que deben verificarse.
- La model card corrige resultados de versiones anteriores; no deben citarse las cifras antiguas (67,8% y 4,6 puntos).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/issai/foggen
- Dataset y resultados: https://huggingface.co/datasets/issai/foggen-data
- Dataset KazCulture: https://huggingface.co/datasets/issai/KazCulture
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo cloud de referencia: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Checkpoint relacionado (Qwen3-1.7B): https://huggingface.co/issai/foggen-qwen3-1.7b
- Checkpoint relacionado (Gemma3-1B): https://huggingface.co/issai/foggen-gemma3-1b
- Checkpoint relacionado (Gemma3-270M): https://huggingface.co/issai/foggen-gemma3-270m
- Checkpoint con tareas abiertas: https://huggingface.co/issai/foggen-r15-oe
