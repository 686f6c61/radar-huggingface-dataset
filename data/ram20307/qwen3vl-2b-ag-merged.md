# Ram20307/qwen3vl-2b-ag-merged

## Resumen
Qwen3-VL-2B Action Genome (merged) es un ajuste fino supervisado del modelo multimodal Qwen3-VL-2B-Instruct de Alibaba, publicado por el usuario independiente Ram20307. El modelo parte de la arquitectura Qwen3-VL (transformer multimodal con torre de visión y modelo de lenguaje de 2.127.532.032 parámetros) y se especializa en una tarea muy concreta: convertir un único fotograma de vídeo en un grafo de escena reducido que describe las relaciones de la persona presente en la imagen con los objetos cercanos, usando el vocabulario de etiquetas del conjunto Action Genome.

La relevancia es acotada pero clara: demuestra que con un adaptador LoRA de rango 16 y unas pocas horas de GPU de consumo (32 minutos en una RTX A5000 de 16 GB) se puede especializar un modelo visión-lenguaje de 2B para una tarea estructurada de human-object interaction, forzando salida JSON válida en el 100% de los casos evaluados. No es un modelo de propósito general ni un sistema listo para producción: es un proyecto de aprendizaje con un conjunto de evaluación pequeño (199 fotogramas de 25 vídeos).

El modelo se distribuye con los pesos del adaptador ya fusionados en bf16 (4,3 GB de repositorio). Existe una versión separada solo con el adaptador (70 MB) y una variante hermana (`qwen3vl-2b-ag-hico-merged`) con prompts y métricas documentadas en su propia tarjeta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3-VL (torre de visión + modelo de lenguaje) |
| Parámetros totales | 2.127.532.032 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | El autor publica bf16; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (la tarea de salida usa etiquetas en inglés de Action Genome) |
| Licencia | Apache-2.0 en los pesos; los datos de entrenamiento (Action Genome / Charades) son de uso no comercial para investigación |
| Formato de pesos | Safetensors (transformers), bf16 |

## Arquitectura y entrenamiento
El modelo base es Qwen3-VL-2B-Instruct, un transformer multimodal que procesa imagen y texto conjuntamente. El ajuste se realizó con LoRA en bf16, sin cuantización, con la torre de visión congelada y adaptadores de rango r=16, alpha=32 y dropout=0,05 aplicados a las proyecciones `q/k/v/o/gate/up/down` del modelo de lenguaje. La fusión posterior del adaptador en los pesos da lugar a este repositorio.

Los datos de entrenamiento provienen del split de entrenamiento de Action Genome: 3.922 fotogramas de 500 vídeos de Charades (hasta 8 fotogramas anotados aleatorios por vídeo, redimensionados a lado corto de 448 px). El objetivo es pérdida de siguiente token únicamente sobre la respuesta JSON, con el prompt enmascarado. Se entrenaron 2 épocas (492 pasos) con lr 1e-4, scheduler coseno con 3% de warmup y batch efectivo de 16 (2 × 8 pasos de acumulación), en una RTX A5000 de 16 GB durante unos 32 minutos. La pérdida media final de entrenamiento fue 0,183 (1,30 en el paso 10, ~0,14 al final de la primera época). No se documenta RLHF ni DPO.

## Capacidades
- Generación de grafos de escena centrados en la persona a partir de un único fotograma, con salida JSON estricta.
- Clasificación de atención (`looking_at`, `not_looking_at`, `unsure`), relación espacial (`in_front_of`, `beneath`, `behind`, `on_the_side_of`, etc.) y contacto físico (`holding`, `sitting_on`, `carrying`, `touching`, `not_contacting`, `standing_on`).
- Salida JSON válida en 199 de 199 casos del conjunto de evaluación.
- Herencia de las capacidades del modelo base Qwen3-VL-2B-Instruct (comprensión imagen-texto, conversación multimodal), aunque el ajuste está orientado a la tarea de grafos de escena.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking ni audio en la información disponible.
- Capacidades multilingües: no disponibles; el vocabulario de salida está cerrado a etiquetas en inglés de Action Genome.

## Casos de uso
- Anotación asistida de datasets de human-object interaction: el modelo preetiqueta fotogramas de vídeo con pares (objeto, relación) en formato JSON, que luego revisa un anotador humano. Es adecuado porque su salida ya sigue el esquema de Action Genome y evita trabajo de normalización.
- Extracción de características estructuradas para modelos posteriores: el JSON de relaciones persona-objeto puede alimentar pipelines de reconocimiento de acciones o de análisis de comportamiento sin necesidad de un parser complejo.
- Investigación en percepción de affordances y contacto: útil para estudiar qué objetos manipula una persona en escenas de interior, dado que el modelo se entrenó específicamente con etiquetas de contacto (`holding`, `touching`, `sitting_on`).
- Prototipado rápido en robótica o visión industrial de interior: como paso previo a un sistema de percepción más robusto, permite validar hipótesis sobre relaciones espaciales y de contacto en escenas controladas.
- Docencia y experimentación con fine-tuning multimodal: el repositorio documenta de forma reproducible el pipeline LoRA completo (datos, hiperparámetros, hardware y tiempo), lo que lo convierte en un ejemplo práctico para cursos de visión-lenguaje.
- Indexación semántica de vídeo de interior: aplicado fotograma a fotograma, el JSON resultante permite etiquetar segmentos de vídeo por tipo de interacción persona-objeto y facilitar búsquedas posteriores.
- Evaluación comparativa de modelos VLM pequeños: sirve como referencia de especialización estrecha frente al modelo base sin ajustar, que obtiene 0,00 de recall y precisión bajo el mismo protocolo de coincidencia exacta.

## Benchmarks y rendimiento
Evaluación sobre 199 fotogramas del split de test de Action Genome (25 vídeos). Una predicción cuenta como correcta solo si el par (objeto, relación) coincide exactamente con la verdad de referencia, para los grupos `attention` y `contact`. El grupo `spatial` no se puntúa. Decodificación greedy.

| Modelo | JSON válido | Recall | Precision |
|---|---|---|---|
| Qwen3-VL-2B-Instruct (sin ajuste, mismo prompt) | 195 / 199 | 0,00 | 0,00 |
| Este modelo | 199 / 199 | 0,31 | 0,45 |

Resultados por relación (n = instancias de referencia):

| Relación | Recall | Precision | n |
|---|---|---|---|
| attention: not_looking_at | 0,36 | 0,50 | 245 |
| contact: holding | 0,39 | 0,55 | 200 |
| attention: looking_at | 0,29 | 0,34 | 150 |
| contact: not_contacting | 0,16 | 0,27 | 140 |
| attention: unsure | 0,11 | 0,35 | 64 |
| contact: touching | 0,29 | 0,42 | 48 |
| contact: sitting_on | 0,61 | 0,62 | 38 |
| contact: carrying | 0,67 | 0,86 | 9 |
| contact: standing_on | 0,00 | 0,00 | 5 |

El autor advierte que las filas con n inferior a ~15 son ruidosas.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16: en torno a 4,3 GB de pesos más memoria de activaciones y caché KV; viable en GPUs de 8 GB o superiores con margen.
- GPU recomendadas: RTX A5000 de 16 GB (usada en el entrenamiento), RTX 4090, A100 o H100 para mayor throughput. Cabe en GPUs de consumo como RTX 3060 de 12 GB o RTX 4070.
- Despliegue: compatible con `transformers` mediante `AutoModelForImageTextToText` y `AutoProcessor`; el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. No se documenta soporte explícito de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El entrenamiento de 492 pasos con batch efectivo 16 en una RTX A5000 requirió unos 32 minutos, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3-VL-2B AG merged) | 2,13B | No disponible | Grafo de escena persona-objeto (Action Genome) | Apache-2.0 (pesos); datos no comerciales | Hugging Face |
| Qwen/Qwen3-VL-2B-Instruct | 2,13B | No disponible | VLM conversacional generalista | Apache-2.0 | Hugging Face |
| Ram20307/qwen3vl-2b-ag-hico-merged | No disponible | No disponible | Variante hermana del mismo autor con prompts y métricas en su tarjeta | No disponible | Hugging Face |
| Ram20307/qwen3vl-2b-ag-lora | Adaptador de 70 MB sobre Qwen3-VL-2B-Instruct | No disponible | Misma tarea, solo adaptador LoRA | Apache-2.0 (pesos) | Hugging Face |

No se dispone de comparación con otros modelos especializados en grafos de escena o human-object interaction en la información proporcionada.

## Limitaciones y advertencias
- Conjunto de entrenamiento pequeño y estrecho: ~3.900 fotogramas de vídeos de interior de Charades; el rendimiento en exteriores, deportes o multitudes no se ha probado.
- Precisión modesta: recall de 0,31 implica que se pierden la mayoría de relaciones verdaderas; `not_contacting`, `unsure` y las clases de contacto raras son especialmente débiles.
- Evaluación reducida: 199 fotogramas de 25 vídeos, una sola ejecución y sin intervalos de confianza; el grupo `spatial` no se puntuó.
- Sin razonamiento temporal: procesa un único fotograma, no secuencias.
- Vocabulario cerrado: tiende a responder solo con etiquetas y objetos de Action Genome.
- No es un modelo general de grafos de escena: solo describe relaciones de la persona, no entre otros objetos.
- Riesgo de alucinación en objetos o relaciones no presentes, inherente a los VLM y no cuantificado en la tarjeta.
- Sesgos: no documentados explícitamente, pero heredados del modelo base y de la distribución de Charades (escenas de interior, actores y objetos propios del dataset).
- Licencia: los pesos son Apache-2.0, pero Action Genome y Charades se publican para uso no comercial en investigación; hay que revisar sus términos antes de cualquier uso comercial.
- El autor lo describe como proyecto de estudiante/aprendizaje, no como sistema validado para producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Ram20307/qwen3vl-2b-ag-merged
- Adaptador LoRA: https://huggingface.co/Ram20307/qwen3vl-2b-ag-lora
- Variante hermana (merged): https://huggingface.co/Ram20307/qwen3vl-2b-ag-hico-merged
- Variante hermana (LoRA): https://huggingface.co/Ram20307/qwen3vl-2b-ag-hico-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Action Genome: https://www.actiongenome.org/
