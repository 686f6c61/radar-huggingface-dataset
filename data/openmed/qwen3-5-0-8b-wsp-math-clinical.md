# OpenMed/Qwen3.5-0.8B-WSP-Math-Clinical

## Resumen

Qwen3.5-0.8B-WSP-Math-Clinical es un modelo multimodal de tipo image-text-to-text desarrollado por OpenMed a partir de Qwen/Qwen3.5-0.8B. No se trata de un fine-tuning convencional: el modelo se obtiene mediante programación en el espacio de pesos (weight-space programming), una técnica descrita en el trabajo de Takehi, Teoh, Zhang y Khattab (MIT CSAIL, 2026) en la que un LLM de frontera lee los pesos dentro de un kernel de Python y los modifica directamente, sin descenso de gradiente ni datos de entrenamiento.

Sobre la base se aplican dos ediciones: la edición matemática publicada en el artículo, que actúa sobre la `down_proj` de las capas 15 y 19 del MLP (64 columnas de salida cada una, 131.072 pesos) y detiene los bucles de razonamiento, y una edición clínica propia de OpenMed sobre las 256 columnas de salida de la cabeza de atención 4 en la capa 23 (`o_proj`, 262.144 pesos). En total se modifican tres tensores.

El resultado es relevante porque demuestra que una intervención quirúrgica sobre pesos, sin reentrenamiento, eleva la precisión en preguntas clínicas de opción múltiple de 24,4% a 45,4% en MedQA-USMLE, con un tamaño de solo 873 millones de parámetros. El modelo está pensado exclusivamente para investigación en edición de modelos y evaluación, no para uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (Qwen3.5) |
| Parametros totales | 873.438.784 (~0,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-0.8B: un transformer multimodal capaz de procesar entradas de imagen y texto y generar texto. No se ha realizado ningún entrenamiento sobre esta versión; la model card indica explícitamente "training: none". Los únicos cambios respecto al checkpoint base son tres tensores editados: la `down_proj` del MLP en las capas 15 y 19 (edición matemática del artículo, 131.072 pesos) y la `o_proj` de la cabeza de atención 4 en la capa 23 (edición clínica de OpenMed, 262.144 pesos). El resto de pesos, configuración, tokenizer y plantilla de chat son idénticos a los del modelo base.

La edición clínica fue producida por un LLM de frontera que realizó 21 pasadas forward, 148 ejecuciones de Python y 206 turnos, con acceso únicamente a los splits de entrenamiento de MedQA-USMLE (10.178 preguntas) y 10.000 preguntas de entrenamiento de MedMCQA. El repositorio incluye el directorio `edit/` con el diff exacto verificado por hash respecto al checkpoint de partida. La innovación técnica principal es, por tanto, el propio método de edición en espacio de pesos, que sustituye el ajuste supervisado por manipulación directa de tensores guiada por un modelo de frontera.

## Capacidades

- Generación de texto y respuesta a preguntas de opción múltiple en formato de examen clínico (MedQA, MedMCQA, MMLU médico).
- Razonamiento con modo "thinking" activado, con temperatura 0,6, top_p 0,95, top_k 20 y penalización de presencia 1,5 en la evaluación publicada.
- Entrada multimodal imagen-texto heredada de Qwen3.5-0.8B (pipeline image-text-to-text).
- Formato conversacional con plantilla de chat de Qwen3.5.
- Capacidad matemática mejorada por la edición del artículo, que reduce los bucles de razonamiento.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Idiomas: no disponible en la información proporcionada.

## Casos de uso

- Investigación en edición de modelos: permite reproducir y analizar cómo una intervención sobre tres tensores concretos altera el comportamiento en dominios específicos, comparando contra el checkpoint base y contra parches aleatorios de igual tamaño.
- Evaluación de razonamiento clínico en opción múltiple: sirve como banco de pruebas de bajo coste (0,8B parámetros) para medir precisión en MedQA-USMLE y MedMCQA en entornos con recursos limitados.
- Estudio de mitigación de bucles de razonamiento: la edición matemática reduce las respuestas truncadas al límite de 32.768 tokens del 18,3% al 0,2%, lo que lo hace útil para analizar fallos de generación en modelos pequeños con thinking.
- Comparación de métodos de adaptación: al no requerir entrenamiento, es un punto de referencia para contrastar weight-space programming frente a fine-tuning clásico en tareas de dominio médico.
- Docencia e investigación sobre alineación y seguridad: permite estudiar cómo ediciones localizadas en atención y MLP afectan a la calibración y al formato de respuesta en dominios de alto riesgo.
- Prototipado de pipelines de evaluación clínica: su tamaño permite ejecutarlo en hardware modesto para validar prompts de examen y métricas de grading antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor (una muestra por pregunta, semilla 0, thinking activado):

| Checkpoint | MedQA (seed 0) | MedQA, mediana de 3 semillas (rango) | MedMCQA | MMLU medical | Respuestas cortadas a 32.768 tokens | Respuestas sin línea calificable |
|---|---|---|---|---|---|---|
| OpenMed WSP Math + Clinical 0.8B (este modelo) | 45,4% | 45,4% (44,1%–47,0%) | 38,8% | 60,2% | 0,2% | 0,3% |
| Qwen3.5-0.8B + edición matemática del artículo | 32,9% | 32,9% (32,8%–33,6%) | 33,3% | 52,4% | 0,1% | 28,8% |
| Parche aleatorio, mismo tamaño, dirección aleatoria (seed 1) | 32,4% | n/a | 33,7% | 50,3% | 0,1% | 31,7% |
| Parche aleatorio, mismo tamaño, dirección aleatoria (seed 2) | 34,0% | n/a | 33,1% | 50,9% | 0,1% | 29,1% |
| Qwen3.5-0.8B original | 24,4% | 23,1% (22,1%–24,4%) | 30,6% | 43,4% | 18,3% | 32,9% |

Pruebas pareadas sobre las mismas preguntas (McNemar exacto, IC bootstrap al 95% con 10.000 remuestreos):

| Comparación | Benchmark | n | Antes | Después | Diferencia (IC 95%) | Solo antes correcto / solo después correcto | p de McNemar |
|---|---|---|---|---|---|---|---|
| Qwen3.5-0.8B → WSP Math + Clinical 0.8B | MedQA-USMLE (4 opciones) | 1.273 | 24,4% | 45,4% | +21,0 pts (+18,1 a +23,8) | 72 / 339 | 1,6e-42 |
| Qwen3.5-0.8B → WSP Math + Clinical 0.8B | MedMCQA | 1.000 | 30,6% | 38,8% | +8,2 pts (+5,0 a +11,4) | 98 / 180 | 1,0e-06 |
| Qwen3.5-0.8B → WSP Math + Clinical 0.8B | MMLU | 1.089 | 43,4% | 60,2% | +16,7 pts (+13,6 a +19,8) | 72 / 254 | 6,1e-25 |
| + edición matemática → WSP Math + Clinical 0.8B | MedQA-USMLE (4 opciones) | 1.273 | 32,9% | 45,4% | +12,5 pts (+9,7 a +15,3) | 102 / 261 | 3,4e-17 |
| + edición matemática → WSP Math + Clinical 0.8B | MedMCQA | 1.000 | 33,3% | 38,8% | +5,5 pts (+2,4 a +8,5) | 98 / 153 | 6,2e-04 |
| + edición matemática → WSP Math + Clinical 0.8B | MMLU | 1.089 | 52,4% | 60,2% | +7,7 pts (+5,0 a +10,5) | 76 / 160 | 4,8e-08 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,8 GB en safetensors, por lo que en precisión de 16 bits requiere aproximadamente 2 GB de VRAM más el espacio de activaciones y caché KV; en cuantizaciones de 8 o 4 bits cabría en menos de 1,5 GB, aunque el autor no publica cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para el modelo en 16 bits; para lotes grandes o contexto largo conviene una A100, H100 o L40S.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas con 6 GB o más.
- Opciones de despliegue: transformers (librería declarada en la model card); el endpoint de FriendliAI figura en los resultados de búsqueda. No se confirma soporte oficial de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MedQA (seed 0) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenMed WSP Math + Clinical 0.8B | 0,87B | no disponible | 45,4% | Apache-2.0 | Hugging Face |
| Qwen3.5-0.8B (base) | 0,9B | no disponible | 24,4% | Apache-2.0 (según base) | Hugging Face |
| Qwen3.5-0.8B + edición matemática del artículo | 0,87B | no disponible | 32,9% | Apache-2.0 | no disponible como checkpoint independiente en la información consultada |
| Parche aleatorio de igual tamaño (control) | 0,87B | no disponible | 32,4%–34,0% | n/a | no aplicable |

No se dispone de datos de benchmarks de otros modelos clínicos comparables en la información proporcionada.

## Limitaciones y advertencias

- Uso previsto exclusivamente para investigación en edición de modelos y evaluación; la model card indica explícitamente que no es apto para uso clínico.
- Precisión de 45,4% en MedQA-USMLE: insuficiente para cualquier aplicación asistencial real, ya que más de la mitad de las preguntas se responden incorrectamente.
- Riesgo de alucinación inherente a un modelo de 0,8B sin entrenamiento específico de alineación en esta versión.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de Qwen3.5-0.8B, hereda los sesgos del modelo base, no documentados aquí.
- Idiomas soportados no documentados; la evaluación se realiza únicamente en inglés médico.
- Longitud de contexto no documentada; la evaluación usa hasta 32.768 tokens nuevos de generación, pero no se especifica la ventana de entrada.
- Las ediciones afectan a tres tensores concretos; no hay garantía de que el comportamiento mejorado se generalice fuera de los dominios evaluados (MedQA, MedMCQA, MMLU médico).
- Licencia Apache-2.0 para los pesos, pero la model card remite a los créditos de las entradas y sus licencias; conviene revisar las condiciones de los datasets de práctica utilizados por el editor.
- El modelo tiene 7 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es prácticamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMed/Qwen3.5-0.8B-WSP-Math-Clinical
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Organización OpenMed: https://huggingface.co/OpenMed
- SDK OpenMed en GitHub: https://github.com/maziyarpanahi/openmed
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/OpenMed/Qwen3.5-0.8B-WSP-Clinical
- OpenMed en X: https://x.com/OpenMed_AI
- Paper de referencia (weight-space programming, Takehi, Teoh, Zhang y Khattab, MIT CSAIL, 2026): no disponible el enlace en la información consultada.
