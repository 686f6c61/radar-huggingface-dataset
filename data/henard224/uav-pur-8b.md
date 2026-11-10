# Henard224/UAV-PUR-8B

## Resumen

UAV-PUR-8B es un modelo de visión-lenguaje especializado en imágenes de drones (UAV), desarrollado por el usuario Henard224 como un ajuste fino supervisado del modelo Qwen3-VL-8B-Instruct de Alibaba. El modelo aborda tareas de percepción, comprensión y razonamiento sobre escenas aéreas: reconocimiento de objetos, conteo, localización visual (grounding), juicio espacial, juicio condicional y razonamiento sobre una o varias imágenes. Su relevancia radica en que adapta un VLM generalista de 8.7 mil millones de parámetros a un dominio vertical concreto (teledetección con drones), manteniendo la licencia Apache-2.0 del modelo base.

Técnicamente es un transformer multimodal con torre visual y proyector (merger visual principal más tres mergers DeepStack), ajustado mediante LoRA sobre el modelo de lenguaje y mergers visuales entrenables. El repositorio distribuye el modelo fusionado completo en BF16 safetensors (17.5 GB), sin necesidad de cargar adaptadores PEFT por separado, e incluye procesador y plantilla de chat. Está pensado para entornos compatibles con Qwen3-VL y `transformers>=4.57`.

El modelo se publica junto a un benchmark propio (Drone-PUR Benchmark) y un artículo en arXiv, y declara soporte únicamente para inglés. Con 24 descargas y 1 like en el momento de la ficha, es un modelo de nicho orientado a investigación y aplicaciones de análisis aéreo, no a uso generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (familia Qwen3-VL), con torre visual, merger visual principal y tres mergers DeepStack |
| Parametros totales | 8.767.123.696 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en BF16 safetensors) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 (pesos); el dataset Drone-PUR tiene licencia CC BY-NC-SA 4.0 |
| Formato de pesos | Safetensors (BF16), modelo fusionado completo; incluye procesador y chat template |

## Arquitectura y entrenamiento

UAV-PUR-8B parte de Qwen3-VL-8B-Instruct, un transformer multimodal con codificador visual y proyector hacia el espacio del modelo de lenguaje. Sobre esa base, el autor aplica un ajuste fino por etapas: LoRA sobre el modelo de lenguaje y entrenamiento de los mergers visuales (el merger principal y tres mergers DeepStack). En las primeras etapas se emplean cabezas auxiliares de caja, conteo y detección que proporcionan supervisión adicional; la etapa final optimiza entropía cruzada sobre los tokens de respuesta en una mezcla de muestras de opción múltiple y de respuesta abierta (cajas y conteos). En inferencia se utiliza únicamente la cabeza de salida del modelo de lenguaje.

El entrenamiento se realiza sobre los datos de Drone-PUR, un conjunto orientado a tareas de percepción aérea. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, por lo que esos datos deben considerarse no disponibles. El repositorio contiene el modelo fusionado completo, de modo que no es necesario descargar el modelo base ni cargar un adaptador PEFT. La evaluación prevista utiliza los prompts de tarea del benchmark Drone-PUR, con entradas de imagen ordenadas (RGB y luego TIR en MMR; vista 1 y luego vista 2 en MVR; fotogramas temporalmente ordenados con el objetivo de referencia marcado en el primer fotograma en MIG).

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes de drones.
- Reconocimiento de objetos en escenas aéreas.
- Conteo de instancias (predicciones abiertas de recuento).
- Localización visual (grounding) con predicción de cajas delimitadoras.
- Juicio espacial y juicio condicional sobre la escena.
- Razonamiento sobre una sola imagen y sobre múltiples imágenes (MMR con RGB y TIR, MVR con dos vistas, MIG con fotogramas temporalmente ordenados).
- Respuestas de opción múltiple y respuestas abiertas (cajas y conteos).
- Conversación multi-turno mediante plantilla de chat (pipeline `image-text-to-text`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio especiales: no disponible en la información proporcionada.

## Casos de uso

- Inspección de infraestructuras con drones: el modelo puede analizar imágenes aéreas de tendidos eléctricos, puentes o paneles solares para identificar y contar elementos visibles, apoyándose en sus capacidades de reconocimiento y conteo.
- Monitorización agrícola: procesar imágenes de cultivos captadas por UAV para contar plantas, detectar zonas con anomalías y razonar sobre la distribución espacial de la parcela mediante juicio espacial.
- Búsqueda y rescate: analizar fotogramas ordenados temporalmente (tarea MIG) para localizar y describir personas u objetos en escenas aéreas, con grounding sobre regiones de interés.
- Vigilancia y seguridad perimetral: combinar imágenes RGB y térmicas (TIR) en la tarea MMR para detectar intrusiones o presencia de personas en condiciones de baja visibilidad.
- Cartografía y análisis territorial: emplear la tarea MVR con dos vistas para comparar perspectivas de una misma zona y responder preguntas de opción múltiple sobre cambios o elementos presentes.
- Evaluación de modelos de teledetección: servir como referencia de ajuste fino especializado para comparar contra VLMs generalistas en el benchmark Drone-PUR, gracias a su formato de evaluación estandarizado.
- Asistencia a anotación de datasets: generar predicciones abiertas de cajas y conteos que ayuden a preetiquetar imágenes de drones antes de la revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al artículo (arXiv:2610.40801) y al Drone-PUR Benchmark, pero no incluye cifras de rendimiento en el contenido proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 17.5 GB solo para pesos, más memoria para activaciones y el procesador visual; en la práctica se recomienda al menos 20-24 GB de VRAM para una ejecución cómoda con `device_map="auto"`.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegue con mayor throughput; L40S o RTX A6000 (48 GB) para inferencia holgada.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con `device_map="auto"` y `attn_implementation="sdpa"`, aunque con margen ajustado; en GPUs de 16 GB sería necesario cuantizar, opción no documentada en la información disponible.
- Opciones de despliegue: `transformers>=4.57` con PyTorch, Accelerate y Pillow, tal como indica la model card. El tag `endpoints_compatible` sugiere compatibilidad con los endpoints de Hugging Face. Soporte explícito de vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UAV-PUR-8B | 8.767 M | No disponible | Imágenes de drones (conteo, grounding, MMR/MVR/MIG) | Apache-2.0 | Hugging Face |
| Qwen3-VL-8B-Instruct (base) | ~8.700 M (no confirmado en la información) | No disponible | VLM generalista | Apache-2.0 (según modelo base) | Hugging Face |
| Alternativas especializadas en UAV de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación cuantitativa de rendimiento frente al modelo base u otras alternativas no está disponible en la información proporcionada; el autor remite al benchmark Drone-PUR y al artículo para dicha comparación.

## Limitaciones y advertencias

- Idioma: el modelo declara soporte únicamente para inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Dominio restringido: está ajustado específicamente para imágenes de drones y tareas de Drone-PUR; su comportamiento en imágenes no aéreas puede degradarse respecto al modelo base.
- Riesgo de alucinación: como todo VLM, puede generar descripciones, conteos o cajas plausibles pero incorrectas, especialmente en escenas densas o con oclusión.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada; al heredar el modelo base, puede arrastrar sesgos de sus datos de preentrenamiento.
- Contexto: la longitud de contexto no está especificada, lo que dificulta planificar cargas de múltiples imágenes o conversaciones largas.
- Licencia: los pesos son Apache-2.0, pero el dataset Drone-PUR es CC BY-NC-SA 4.0 (no comercial), lo que puede condicionar la reproducibilidad del entrenamiento y la evaluación en entornos comerciales.
- Madurez: con 24 descargas y 1 like, es un modelo de nicho con escasa validación comunitaria; conviene evaluarlo en el caso de uso concreto antes de llevarlo a producción.
- Formato: solo se publican pesos BF16; no hay versiones cuantizadas oficiales documentadas, lo que limita el despliegue en hardware de gama baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Henard224/UAV-PUR-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Artículo: https://arxiv.org/abs/2610.40801
- Benchmark Drone-PUR: https://huggingface.co/datasets/Henard224/Drone-PUR-Benchmark
