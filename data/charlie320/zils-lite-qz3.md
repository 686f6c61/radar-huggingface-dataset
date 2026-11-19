# Charlie320/zils-lite-qz3

## Resumen

zils-lite-qz3 es un modelo de decisión de 853 millones de parámetros publicado por el usuario Charlie320 en Hugging Face, construido como fine-tune de Qwen/Qwen3.5-0.8B. Forma parte del ecosistema Zils, concretamente del pool de soups `d3-lite` de la subnet 127 de Bittensor, una red descentralizada de entrenamiento e incentivos. El modelo se distribuye en BF16 con licencia Apache-2.0 y un tamaño de repositorio de 1,7 GB, lo que lo sitúa en la franja de modelos pequeños desplegables en hardware de consumo.

La relevancia del modelo es acotada: no es un modelo generalista sino una "cabeza" (body) especializada en tareas de decisión con formato de examen, entrenada mediante un proceso de soup por promedio uniforme de tres fine-tunes LoRA con distintas semillas. Su interés práctico reside en el método: destilación desde un modelo profesor (vllm-sr/d3-ultra) sobre objetivos suaves, combinando etiquetas propias del dataset con probabilidades del profesor. Esto lo convierte en un caso de estudio de destilación de bajo coste sobre un modelo base pequeño, más que en una alternativa competitiva a modelos de propósito general.

No hay información pública sobre benchmarks, idiomas soportados ni pipeline declarado. La model card es explícita sobre el procedimiento de entrenamiento y las fuentes de datos, pero no aporta métricas de evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de Qwen/Qwen3.5-0.8B), con torre de visión heredada del modelo padre |
| Parametros totales | 852.985.920 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en BF16; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso heredado de Qwen/Qwen3.5-0.8B, con la disposición interna ("chassis layout") del ecosistema Zils y una torre de visión tomada del modelo padre. El entrenamiento parte de joamCriff123/zils-lite-l1117a, el único body del soup `d3-lite` del 18 de noviembre de 2026. Sobre ese punto de partida se aplicaron tres fine-tunes LoRA de rango 32, fusionados y promediados de forma uniforme (sin interpolación), con una época cada uno a tasa de aprendizaje 5e-5 y semillas distintas.

Los objetivos de entrenamiento son suaves y combinan etiquetas propias con probabilidades del profesor vllm-sr/d3-ultra (modelo Apache-2.0 del pool z3): para la mayoría de ítems escritos, una cuarta parte de la respuesta propia y tres cuartas partes de las probabilidades del profesor; para unos 4.100 ítems de puntuación aritmética y similitud de frases, únicamente las probabilidades del profesor por fiabilidad de las respuestas escritas; y para las 30.045 filas etiquetadas, mitad etiqueta del dataset y mitad probabilidades del profesor. El corpus total ronda las 61.100 filas en una pasada barajada por semilla, compuesto por unos 31.100 ítems de decisión en formato de examen (incluidos unos 1.100 de tool calling extraídos de las filas 90.000-93.000 del subconjunto de function calling de glaiveai/glaive-function-calling-v2) y 30.045 filas del split de entrenamiento de tasksource/tasksource-jev-typed-decisions. Se excluyeron fuentes no comerciales, tareas tipo BIG-bench y filas duplicadas de validación o test.

## Capacidades

- Clasificación y decisión en formato de examen: el modelo está entrenado para resolver ítems de decisión de familias de tareas conocidas, con salida estructurada.
- Tool calling / function calling: incluye aproximadamente 1.100 ítems de llamada a funciones derivados de Glaive Function Calling v2.
- Puntuación aritmética y similitud de frases: capacidad entrenada específicamente sobre unos 4.100 ítems de este tipo.
- Procesamiento multimodal básico: la torre de visión se hereda del modelo padre, aunque no se documenta el alcance efectivo de esta capacidad tras el fine-tune.
- Razonamiento multi-paso: no documentado de forma explícita; el formato de examen implica selección de respuesta más que cadenas de razonamiento largas.
- Capacidades multilingües: no disponibles.
- Modo thinking: no disponible.

## Casos de uso

- Evaluación de sistemas de decisión en investigación: útil como baseline pequeño para estudiar destilación desde un profesor mayor sobre tareas de clasificación con formato de examen, gracias a su licencia Apache-2.0 y a su tamaño manejable.
- Clasificación de intenciones en asistentes conversacionales: el modelo puede emitir decisiones etiquetadas sobre turnos de usuario; su entrenamiento en familias de tareas de decisión lo hace adecuado para enrutado ligero, siempre que se valide contra el dominio objetivo.
- Enrutado de llamadas a herramientas: los ítems de function calling de Glaive permiten usar el modelo para seleccionar qué función invocar y con qué argumentos en pipelines de agentes simples.
- Puntuación de similitud semántica: puede emplearse para generar puntuaciones de similitud de frases en tareas de deduplicación o ranking, dado el entrenamiento específico sobre este tipo de ítems.
- Verificación aritmética ligera: la puntuación de respuestas aritméticas lo hace apto para comprobar resultados numéricos en pipelines de validación, no para generarlos.
- Prototipado en hardware de consumo: con 853 millones de parámetros y pesos BF16, es desplegable en GPUs de gama media para experimentación rápida antes de escalar a modelos mayores.
- Investigación sobre soups y LoRA: sirve como ejemplo reproducible de promedio de adaptadores y destilación con objetivos suaves para quienes trabajan en la subnet 127 de Bittensor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 3 y 5 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, en torno a 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16 (RTX 3060, RTX 4060, RTX 4090); para despliegue en servidor, A100 o H100 son sobredimensionadas pero válidas si se sirven múltiples instancias.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090 sin problemas en BF16; en GPUs de 8 GB puede requerir cuantización.
- Opciones de despliegue: vLLM y TGI para serving en BF16; llama.cpp y Ollama si se generan cuantizaciones GGUF a partir de los pesos safetensors (no publicadas en el repositorio).
- Latencia y throughput: no disponibles; al ser un modelo de 0,85B, se espera throughput alto en GPUs modernas, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| zils-lite-qz3 | 853 M | no disponible | Apache-2.0 | Modelo de decisión destilado |
| Qwen/Qwen3.5-0.8B | ~800 M (base) | no disponible | no disponible en la información | Modelo generalista base |
| joamCriff123/zils-lite-l1117a | no disponible | no disponible | Apache-2.0 | Body previo del soup d3-lite |
| vllm-sr/d3-ultra | no disponible | no disponible | Apache-2.0 | Profesor del pool z3 |

La comparación cuantitativa con alternativas de la misma categoría no está disponible: no se han publicado métricas de rendimiento para zils-lite-qz3 ni para los modelos del ecosistema Zils citados.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad; cualquier uso en producción requiere evaluación propia contra el dominio objetivo.
- Especialización estrecha: el modelo está entrenado para ítems de decisión en formato de examen; su comportamiento fuera de ese formato es incierto y probablemente degradado.
- Riesgo de alucinación: al ser un modelo pequeño destilado con objetivos suaves, puede producir salidas plausibles pero incorrectas en tareas generativas abiertas.
- Idiomas no documentados: no se especifica qué lenguas cubre el entrenamiento; el corpus parece mayoritariamente en inglés por las fuentes citadas (Glaive, tasksource).
- Restricciones de datos de origen: las 30.045 filas de tasksource/tasksource-jev-typed-decisions provienen de 240 tareas con metadatos de licencia no especificados; el autor advierte de que se deben comprobar los términos de los datasets fuente antes de reutilizar.
- Licencia Apache-2.0 en los pesos, pero la procedencia de los datos de entrenamiento impide garantizar una cadena de derechos completamente limpia para uso comercial.
- Sin cuantizaciones publicadas: no hay GGUF ni AWQ en el repositorio; quien quiera desplegar en llama.cpp u Ollama deberá generarlas.
- Fecha de creación futura (2026-11-19): el repositorio tiene cero descargas y cero likes, sin validación comunitaria.
- Sin pipeline declarado en Hugging Face: la integración con `transformers` puede requerir configuración manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-lite-qz3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Body de partida: https://huggingface.co/joamCriff123/zils-lite-l1117a
- Dataset de decisiones: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Dataset de function calling: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Profesor del pool z3: https://huggingface.co/vllm-sr/d3-ultra
