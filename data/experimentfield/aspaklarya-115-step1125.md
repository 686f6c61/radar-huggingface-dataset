# ExperimentField/Aspaklarya-115-step1125

## Resumen

Aspaklarya-115-step1125 es un adaptador LoRA de tipo PEFT entrenado sobre el modelo base Qwen/Qwen3-VL-8B-Instruct, un modelo multimodal de visión y lenguaje de 8.000 millones de parámetros desarrollado por Alibaba Qwen. El adaptador lo publica la organización ExperimentField dentro del programa Aspaklarya, una serie sistemática de ablaciones centrada en tareas de teledetección (remote sensing): respuesta visual a preguntas (VQA) y generación de descripciones de imágenes (image captioning). El checkpoint corresponde al paso 1125 de la ronda 1XX del programa y se distingue de la ronda 0XX por ofrecer respuestas verbosas, con varias frases de razonamiento fundamentado, en lugar de una sola palabra.

El interés de esta ficha no reside en el rendimiento del adaptador, sino en su valor documental. El propio autor declara que esta configuración fue probada y rechazada: frente a un control de tres semillas con MEAN4 de 75,52 ± 0,19, este checkpoint obtuvo −0,27 MEAN4, por lo que se clasifica como nulo y no se recomienda su uso. Se conserva únicamente por trazabilidad experimental. La variable manipulada en este experimento fue la sustitución de las preguntas de entrenamiento por paráfrasis.

El adaptador ocupa 0,2 GB en el repositorio y requiere descargar el modelo base completo para funcionar. La licencia del adaptador no está declarada en la información disponible, mientras que el modelo base Qwen3-VL-8B-Instruct se distribuye bajo licencia Apache 2.0 según la información pública de Qwen, aunque este dato no aparece confirmado en la documentación proporcionada del adaptador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3-VL-8B-Instruct |
| Parámetros totales | no disponible (adaptador de 0,2 GB; el modelo base tiene 8.000 millones) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para el adaptador (longitud de secuencia de entrenamiento: 2048 tokens) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA con rango r=16, alpha=16 y dropout 0,0, aplicado sobre Qwen3-VL-8B-Instruct. Un detalle relevante es que se entrenó también la torre de visión (vision tower trained), lo que implica que el adaptador no solo ajusta las capas de lenguaje, sino también el codificador visual. La pérdida empleada es token weighting con pesos w_caption=1,0 y w_vqa=1,0, es decir, contribución equilibrada entre descripción y VQA. El optimizador es AdamW con lr 0,0002, schedule lineal, warmup 0,03, weight decay 0,001 y gradient clipping 0,3. El batch efectivo es de 32 (4 × 8 de acumulación de gradiente), con 1,0 épocas, longitud de secuencia 2048, lado máximo de imagen 1024 y semilla 3407.

El corpus de entrenamiento consta de 35.981 elementos sobre 11.994 imágenes: 11.993 descripciones y 23.988 pares de VQA, es decir, dos preguntas y una descripción por imagen. El split utilizado es `train,other` y la columna de VQA es `VQA_1126`. La variable experimental de esta ronda consistió en reemplazar las preguntas de entrenamiento por paráfrasis, con el objetivo de medir el efecto de la variación lingüística de las preguntas sobre la calidad de las respuestas. No se documenta en la información disponible el uso de RLHF o DPO; el ajuste es supervisado sobre pares imagen-texto y pregunta-respuesta.

## Capacidades

- Respuesta visual a preguntas (VQA) sobre imágenes de teledetección, con respuestas verbosas de varias frases y razonamiento fundamentado en lugar de respuestas de una sola palabra.
- Generación de descripciones (image captioning) de imágenes de satélite y aéreas.
- Razonamiento multimodal: el adaptador está entrenado para justificar la respuesta a partir de evidencia visual.
- Procesamiento de imágenes de hasta 1024 píxeles de lado en el pipeline de entrenamiento.
- Herencia de las capacidades del modelo base Qwen3-VL-8B-Instruct, incluyendo comprensión de texto e imagen, aunque no se documentan en la información disponible capacidades específicas de tool calling, agentes o modo thinking para este adaptador.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Documentación de experimentos de ablación: el adaptador sirve como referencia reproducible de una configuración concreta (preguntas parafraseadas) para comparar contra otras rondas del programa Aspaklarya, dado que todos los checkpoints se evalúan sobre la misma muestra fija con semilla 1105.
- Investigación sobre variación lingüística en VQA: permite estudiar si la paráfrasis de preguntas de entrenamiento afecta a la calidad de las respuestas en dominios de teledetección, un caso de uso metodológico más que de producción.
- Análisis de respuestas verbosas frente a respuestas concisas: útil para estudiar el compromiso entre detalle y exactitud en tareas de VQA cuando el benchmark de referencia es de tipo terso.
- Reproducción de la línea base del programa: cargando el adaptador sobre Qwen3-VL-8B-Instruct se puede replicar el resultado MEAN4 de 75,3 y contrastarlo con los checkpoints de referencia (Aspaklarya-101-step4500 con 76,72, Aspaklarya-106-soup con 76,36).
- Auditoría de ruido experimental: el adaptador forma parte de un conjunto con el que se midió el suelo de ruido del programa (desviación típica de 0,19 en el control de tres semillas), lo que lo hace útil para calibrar metodologías de evaluación con LLM-as-judge.
- Docencia y formación: como ejemplo práctico de adaptador LoRA multimodal con torre de visión entrenada, sirve para ilustrar el flujo de trabajo con PEFT y transformers en un caso real de teledetección.

## Benchmarks y rendimiento

Evaluación con LLM-as-judge (gemma-4-31b-it-imiai), decodificación greedy, temperatura 0, escala 0-100, sobre una muestra fija con semilla 1105:

| Slice | Conjunto de prompts | Tokens nuevos | n | Puntuación |
|---|---|---|---|---|
| VQA DM | `VQA_1126` (verboso) | 160 | 500 | 73,57 |
| VQA RSICD | legacy terso | 48 | 500 | 69,18 |
| Caption DM | banco de consultas de descripción | 320 | 491 | 80,52 |
| Caption RSICD | banco de consultas de descripción | 320 | 500 | 77,92 |
| **MEAN4** | | | 1.991 | **75,3** |

Puesto en MEAN4: 35 de 70 checkpoints puntuados del programa.

Referencias sobre la misma muestra (MEAN4):

| Modelo | MEAN4 |
|---|---|
| Aspaklarya-101-step4500 | 76,72 |
| Aspaklarya-106-soup | 76,36 |
| Aspaklarya-020-step4500 | 74,90 |
| **Aspaklarya-115-step1125** | **75,3** |
| DeanQwen3-8B | 64,84 |
| Qwen3-VL-8B-Instruct original | 61,34 |

Suelo de ruido medido por el programa (misma receta entrenada tres veces con semillas distintas):

| Cantidad | Valor |
|---|---|
| Control MEAN4 | 75,52 (sd 0,19, n=3) |
| Sigma VQA DM | 0,88 |
| Sigma VQA RSICD | 0,74 |
| Sigma Caption DM | 0,25 |
| Sigma Caption RSICD | 0,52 |
| Reproducibilidad del juez | ~0,01 |
| Dispersión al repetir con la misma semilla | 0,30 |

Diferencias de MEAN4 por debajo de ~0,5 no son interpretables a partir de un único par de ejecuciones; en slices individuales de VQA el umbral es ~1,8. Los slices de descripción son entre tres y cuatro veces más silenciosos que los de VQA. El juez es prácticamente determinista (~0,01), por lo que la dispersión observada es varianza real de entrenamiento y no deriva de medición.

## Requisitos de hardware

- El adaptador pesa 0,2 GB, pero requiere cargar el modelo base Qwen3-VL-8B-Instruct completo, por lo que el requisito real de memoria lo determina el modelo base.
- VRAM estimada para el modelo base en precisión completa (BF16): aproximadamente 16 GB de pesos, más overhead de activaciones y del procesador de imagen; en la práctica se recomienda al menos 24 GB para inferencia cómoda.
- Cuantización del modelo base (no documentada en la información disponible para este adaptador) permitiría reducir la huella, pero no se han publicado valores concretos.
- GPU recomendadas: A100 o H100 para despliegue en producción; RTX 4090 (24 GB) como opción de gama alta para consumidor; GPUs con menos de 16 GB requerirían cuantización del modelo base.
- Opciones de despliegue: la model card solo documenta el uso mediante `peft.PeftModel` y `transformers.AutoModelForImageTextToText`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este adaptador en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | MEAN4 (misma muestra) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Aspaklarya-115-step1125 | LoRA sobre Qwen3-VL-8B | 8B (base) | no disponible | 75,3 | no disponible | Hugging Face |
| Aspaklarya-101-step4500 | LoRA sobre Qwen3-VL-8B | 8B (base) | no disponible | 76,72 | no disponible | Hugging Face |
| Aspaklarya-106-soup | LoRA sobre Qwen3-VL-8B | 8B (base) | no disponible | 76,36 | no disponible | Hugging Face |
| Qwen3-VL-8B-Instruct original | Modelo multimodal completo | 8B | no disponible | 61,34 | no disponible en la información del adaptador | Hugging Face |
| DeanQwen3-8B | Modelo de la misma familia evaluado en el programa | no disponible | no disponible | 64,84 | no disponible | Hugging Face |

La comparativa se limita al ecosistema del propio programa Aspaklarya porque la información proporcionada no incluye datos de otros modelos de teledetección comparables. Todos los valores proceden de la misma muestra fija y del mismo juez, por lo que son directamente comparables entre sí.

## Limitaciones y advertencias

- Configuración rechazada: el autor declara explícitamente que este checkpoint fue probado y rechazado (−0,27 MEAN4 frente al control de 75,52) y no se recomienda su uso en producción.
- Selección sobre ruido: elegir el checkpoint con mayor puntuación entre varios y citarlo constituye selección sobre ruido; el propio autor señala que la receta debe describirse por su media entre semillas, no por su mejor ejecución.
- El juez es solo de texto: compara la respuesta con una referencia y nunca ve la imagen, por lo que detecta especificidad no respaldada pero no falsedades verificadas. La corrección a nivel de píxel requiere revisión humana.
- El benchmark legacy terso no es un objetivo justo para la ronda 1XX: sus referencias son de ~4 caracteres y su rúbrica limita una respuesta correcta pero rellenada a 89/100 por construcción, de modo que un modelo verboso no puede alcanzar la banda superior.
- Las puntuaciones son en dominio: se trata de un modelo de teledetección y nada de lo medido evalúa VQA de propósito general.
- Riesgo de alucinación: no se documenta una evaluación específica de alucinaciones visuales; el juez de texto no puede descartarlas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto e idioma: no disponibles; la longitud de secuencia de entrenamiento es de 2048 tokens, pero no se declara el contexto efectivo del adaptador.
- Restricciones de licencia para uso comercial: la licencia del adaptador no está declarada, por lo que no puede confirmarse su uso comercial sin consultar al autor. La licencia del modelo base tampoco se confirma en la documentación proporcionada.
- Reproducibilidad: repetir el entrenamiento con la misma semilla desplaza la puntuación ~0,30 por kernels CUDA no deterministas, por lo que la replicación exacta no es alcanzable.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ExperimentField/Aspaklarya-115-step1125
- Organización ExperimentField (tarjeta de programa con todos los experimentos, hiperparámetros, suelo de ruido y resultados retractados): https://huggingface.co/ExperimentField
- Modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
