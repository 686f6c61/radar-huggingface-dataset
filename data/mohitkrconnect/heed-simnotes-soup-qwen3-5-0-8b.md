# mohitkrconnect/heed-simnotes-soup-qwen3.5-0.8b

## Resumen

Heed weight-average soup Qwen3.5-0.8B (EXP-031) es un checkpoint de investigación publicado por el desarrollador independiente mohitkrconnect dentro del estudio Heed sobre extracción de tareas a partir de notas de voz. Se trata de un "model soup": la media elemento a elemento, calculada en fp32, de los pesos de dos fine-tunes independientes del mismo modelo base, Qwen/Qwen3.5-0.8B-Base. No se ejecutó ningún entrenamiento para producirlo; únicamente se promediaron los pesos de dos ejecuciones del experimento EXP-031 (la variante E2, entrenada con notas simuladas, y la variante D3 con semilla 1, entrenada solo con los datos D3).

El modelo resuelve una tarea muy concreta: convertir texto libre en inglés (transcripciones de notas de voz) en JSON estructurado con tareas, categorías, recordatorios, intenciones y comandos de voz. Con 752.393.024 parámetros reales en safetensors, está pensado para inferencia on-device, aunque el autor advierte explícitamente que no es el modelo de producción de la aplicación Heed (ese es heed-tasks-qwen3-0.6b) y que utiliza un formato de salida ancho y antiguo, evaluado con una rúbrica previa (guide-v2) y nunca probado en un teléfono.

Su relevancia es metodológica más que práctica: documenta si promediar pesos de dos recetas distintas compensa la varianza entre semillas, un problema que el propio estudio cuantificó en torno a 3 puntos porcentuales de diferencia entre dos semillas de la misma receta. El resultado fue mixto: empató en la métrica de "totalmente correcto" y logró el menor número de errores por nota de todos los modelos de EXP-031, pero rindió peor en el subconjunto de 59 notas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (transformer decoder-only con atención híbrida Gated DeltaNet, 24 capas) |
| Parametros totales | 752.393.024 (lm_head duplicado y atado eliminado antes de la subida) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (longitud máxima de entrenamiento de los padres: 1.024 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), librería transformers |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-0.8B: un transformer decoder-only de 24 capas con atención híbrida Gated DeltaNet y un vocabulario de 248.320 tokens. El checkpoint resultante pesa 752.393.024 parámetros tras eliminar el lm_head atado duplicado. Los pesos se publican en bf16 y requieren una versión de transformers con soporte para Qwen3.5 (el autor usó la 5.20.2).

El "entrenamiento" del soup es nulo: se trata de una media aritmética en fp32 de los pesos de dos fine-tunes completos del mismo base. Ambos padres se entrenaron con lr 1e-5, 3 épocas, batch efectivo de 16 (4 × 4), longitud máxima de 1.024 y autocast bf16 sobre una única RTX 4090. El padre E2 usó 4.803 filas (903 pasos, 22,52 minutos) e incluye los datos D3 más 1.109 notas simuladas al estilo del autor (generadas por Claude Sonnet 5.5, Gemini 3.1 Pro y GPT-5.4) y una copia extra de 306 notas de error. El padre D3 con semilla 1 usó 3.388 filas (636 pasos, 17,33 minutos) solo con los datos D3. El conjunto D3 combina 400 notas escritas por Claude Opus y 1.265 etiquetadas por Claude Sonnet 5.5 (HeedSet), 777 notas planificadas y reetiquetadas, 480 "brain dumps" de Claude, 36 notas de plantilla curadas, 140 notas reales del autor y cinco amigos contadas tres veces, y 10 notas tecleadas por el autor. Las etiquetas provienen de Sonnet 5.5 sin verificación humana por nota. Construir y puntuar el soup llevó unos 6 minutos y no consumió GPU de entrenamiento.

## Capacidades

- Generación de JSON estructurado a partir de texto libre, con un esquema fijo de claves (`i` para intención, `items` para tareas, `cmd` para comandos de voz).
- Extracción de tareas con texto (`t`), categoría o bucket (`c`), indicador de recordatorio (`r` de 0 o 1), palabras temporales habladas (`w`) y marca opcional de sugerencia (`s`).
- Clasificación de intención global de la nota: `capture`, `mixed`, `empty`, `journal_only`, `command` o `question`.
- Detección de comandos de voz: `complete`, `query`, `delete`, `move`, `reschedule` o `rename`, con objetivo (`x`) y destino (`to`).
- Clasificación en seis buckets fijos: tasks (General), buy (Buy), watch (Watch), ideas (Ideas), work (Work) y journal (Journal).
- Generación determinista en modo greedy, tal como se evaluó.
- Capacidad multilingüe: no disponible; el modelo está entrenado y evaluado únicamente en inglés.
- Tool calling, function calling, agentes, razonamiento multi-paso, visión o audio: no disponible; no se documentan estas capacidades.

## Casos de uso

- Extracción de tareas desde notas de voz en inglés: se transcribe una nota y se pasa al modelo con el prompt de categorías exacto para obtener un JSON con las tareas y sus buckets; es el caso de uso para el que se entrenaron los padres.
- Investigación sobre model souping: sirve como punto de comparación reproducible para estudiar si promediar pesos de dos recetas reduce la varianza entre semillas frente a entrenar una sola.
- Evaluación de robustez entre subconjuntos: el autor documenta que el modelo empata en "totalmente correcto" pero empeora en las 59 notas reales, por lo que es útil como caso de estudio de brecha entre datos sintéticos y reales.
- Prototipado de pipelines de salida estructurada en local: al ser un modelo de 752 millones de parámetros en bf16, puede ejecutarse en hardware modesto para probar esquemas JSON antes de invertir en un modelo mayor.
- Generación de datos de prueba para sistemas de gestión de tareas: el formato ancho con intenciones y comandos permite generar ejemplos sintéticos variados para tests de parseo.
- Docencia y demostraciones de fine-tuning de bajo coste: los padres se entrenaron en una sola RTX 4090 con un coste estimado de 0,34 y 0,26 dólares de GPU, lo que lo convierte en un ejemplo práctico de experimentación económica.
- Análisis de errores por nota: al tener el menor número de errores por nota de EXP-031, es adecuado para inspeccionar patrones de fallo en extracción de recordatorios y comandos.

## Benchmarks y rendimiento

Los resultados publicados corresponden a la métrica "totalmente correcto" (fully right) frente a la clave antigua guide-v2, sobre un conjunto de 199 notas (59 reales + 140 de HeedSet), con un scorer sin juicio humano. La model card se interrumpe antes de completar la tabla de resultados, por lo que no se dispone de las cifras completas del soup ni de sus padres en el material proporcionado.

| Modelo / variante | Metrica | Resultado |
|---|---|---|
| Soup (run e9) | Totalmente correcto | empate con los padres (cifra exacta no disponible) |
| Soup (run e9) | Errores por nota | el menor de todos los modelos de EXP-031 (cifra exacta no disponible) |
| Soup (run e9) | Subconjunto de 59 notas reales | peor que los padres (cifra exacta no disponible) |
| Padre E2 (semilla) | Totalmente correcto | 47,2 % |
| Padre D3 semilla 1 | Totalmente correcto | 44,2 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,5 GB solo para pesos (752 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; el tamaño del repositorio es de 1,5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para bf16; los padres se entrenaron en una RTX 4090, pero la inferencia no requiere esa gama.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; también es viable en CPU para lotes pequeños.
- Opciones de despliegue: transformers (versión con soporte Qwen3.5, probada con 5.20.2); el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este checkpoint.
- Latencia y throughput: no disponibles. El autor solo reporta tiempos de entrenamiento de los padres (22,52 y 17,33 minutos) y unos 6 minutos para construir y puntuar el soup.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| heed-simnotes-soup-qwen3.5-0.8b | 752.393.024 | no disponible (entrenado a 1.024) | Apache 2.0 | Media de pesos de dos fine-tunes; formato ancho antiguo; solo inglés |
| heed-simnotes-e2-qwen3.5-0.8b | no disponible | no disponible (entrenado a 1.024) | no disponible | Padre del soup; incluye notas simuladas; 47,2 % totalmente correcto en su semilla |
| heed-tasks-qwen3-0.6b | no disponible | no disponible | no disponible | Modelo de producción de la app Heed; formato de salida actual |
| Qwen/Qwen3.5-0.8B-Base | no disponible | no disponible | no disponible | Modelo base de ambos padres, sin fine-tuning para la tarea |

## Limitaciones y advertencias

- Es un checkpoint de investigación, no el modelo de la aplicación: el autor indica explícitamente que el modelo de producción es heed-tasks-qwen3-0.6b.
- Usa el formato de salida ancho y antiguo (intención y comandos de voz además de ítems), que no coincide con el formato actual de la app.
- Fue puntuado con la rúbrica antigua guide-v2 y no con el juez ciego usado en evaluaciones posteriores.
- Nunca se desplegó en un teléfono, pese a su orientación on-device.
- Rinde peor que sus padres en el subconjunto de 59 notas reales, lo que sugiere una brecha entre datos sintéticos y reales.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Las etiquetas de entrenamiento provienen de modelos (Claude Sonnet 5.5) sin verificación humana por nota, lo que puede propagar sesgos y errores de anotación del profesor.
- Riesgo de alucinación en la generación de JSON: al ser un modelo de 752 millones de parámetros sin RLHF documentado, puede producir claves o valores fuera del esquema si el prompt se desvía del formato exacto de entrenamiento.
- El prompt debe replicar exactamente el texto de categorías y terminar con `JSON:` seguido de salto de línea; no usa plantilla de chat.
- Licencia Apache 2.0: permite uso comercial, pero al ser un checkpoint de investigación con evaluación limitada, no se recomienda en producción sin validación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohitkrconnect/heed-simnotes-soup-qwen3.5-0.8b
- Modelo de producción de Heed: https://huggingface.co/mohitkrconnect/heed-tasks-qwen3-0.6b
- Padre E2: https://huggingface.co/mohitkrconnect/heed-simnotes-e2-qwen3.5-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Dataset: https://huggingface.co/datasets/mohitkrconnect/heed-voice-notes-to-tasks
