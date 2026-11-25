# k2021211255/autorsi-jev-4b

## Resumen

autorsi-jev-4b es un modelo multimodal de decisión desarrollado por el usuario k2021211255 y publicado en Hugging Face. No es un modelo generativo al uso: combina un backbone multimodal Qwen3.5-4B con una cabeza lineal de decisión de 255 códigos que, en un único forward pass, devuelve la opción seleccionada y las probabilidades asociadas para cada alternativa suministrada. El modelo está pensado para tareas de elección cerrada sobre entradas que combinan texto e imágenes, sin generación autorregresiva.

Con 4.539.265.536 parámetros totales (aproximadamente 4,5 mil millones) y un contexto máximo de 32.768 tokens, el modelo se posiciona en la gama media de modelos multimodales, pero con una finalidad muy específica: la clasificación y selección entre hasta 255 opciones. Su relevancia radica en la latencia reducida (230,3 ms de media en una A800 80GB) y en la ausencia de decodificación autoregresiva, lo que simplifica el despliegue en escenarios de decisión automatizada.

El modelo declara un índice de rendimiento "Public Vision" de 73,7510 sobre 12.210 peticiones completadas correctamente, con 9.593 respuestas correctas. La información disponible sobre licencia, idiomas y benchmarks comparativos es limitada, y la model card no detalla la composición del dataset de entrenamiento ni el proceso de ajuste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal híbrido (capas de atención completa bidireccional + capas de atención lineal causal) con backbone Qwen3.5-4B y cabeza lineal de decisión |
| Parámetros totales | 4.539.265.536 (aprox. 4,5 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | no disponible (se menciona BF16 para el backbone y FP32 para la cabeza de decisión) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible (el backbone Qwen3.5-4B se declara bajo Apache 2.0; la licencia de la distribución no se especifica) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se apoya en un backbone Qwen3.5-4B multimodal que combina capas de atención completa bidireccional con capas de atención lineal causal, empleando SDPA y flash-linear-attention. Sobre ese backbone se añade una cabeza lineal sin sesgo de forma 255 × 2.560, que actúa como lector del último token y produce una distribución de probabilidad sobre cada opción suministrada. El backbone se ejecuta en BF16 con autocast, mientras que la cabeza de decisión se almacena en FP32. La temperatura está fijada en 1,5328770875930786 en el archivo `decision_config.json`.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card tampoco detalla el proceso de alineación ni el origen de los datos de la cabeza de decisión. La innovación técnica destacable es el enfoque de decisión en un solo forward pass: en lugar de generar texto, el modelo lee el último token y proyecta directamente sobre un espacio de 255 opciones, lo que elimina la decodificación autorregresiva y reduce la latencia. La resolución nativa de imagen está limitada a 1.638.400 píxeles por imagen y no se aplica truncamiento de entrada ni filtrado de opciones; los errores de capacidad se reportan de forma explícita.

## Capacidades

- Decisión multimodal cerrada: lee texto e imágenes y selecciona una opción entre hasta 255 alternativas, devolviendo probabilidades por opción.
- Procesamiento de imágenes a resolución nativa de hasta 1.638.400 píxeles por imagen.
- Manejo de contexto largo de hasta 32.768 tokens.
- Inferencia en un único forward pass sin generación autorregresiva.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking: no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Selección de respuestas en evaluaciones visuales: el modelo puede recibir una pregunta y varias opciones junto con una imagen y devolver la opción más probable, adecuado para suites de evaluación tipo Winoground.
- Clasificación de imágenes con etiquetas cerradas: dado un conjunto de hasta 255 categorías y una imagen, el modelo asigna probabilidades a cada categoría en un solo paso, útil en pipelines de etiquetado automatizado.
- Verificación de coherencia texto-imagen: permite comprobar si una descripción textual se corresponde con una imagen entre varias alternativas, aprovechando el contexto de 32.768 tokens.
- Enrutamiento de consultas en sistemas de atención al cliente: el modelo puede decidir a qué categoría o departamento pertenece una consulta multimodal, con latencias de aproximadamente 230 ms por petición.
- Filtrado de contenido en moderación: selección entre opciones predefinidas de clasificación de contenido sensible a partir de texto e imágenes.
- Evaluación de modelos en benchmarks de decisión: su API `POST /v1/decisions` y el pipeline `decision-index` permiten integrarlo en suites de evaluación reproducibles.
- Sistemas de recomendación con opciones cerradas: selección de la opción más probable entre un conjunto finito de productos o respuestas, sin necesidad de generación de texto.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Public Vision index | 73,7510 |
| Peticiones completadas | 12.210 |
| Respuestas correctas | 9.593 |
| Latencia media (A800 80GB, 1 petición) | 230,3 ms |
| Latencia mediana | 137,3 ms |
| Latencia P80 | 307,2 ms |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo se ejecuta en una NVIDIA A800 80GB según la model card; con 4,5 B de parámetros en BF16, el peso del backbone ronda los 9 GB, pero el repo ocupa 9,1 GB y la model card exige al menos 80 GB de disco libre.
- GPU recomendadas: NVIDIA A800 80GB (configuración validada por el autor); no se documentan otras GPU.
- Cabe en GPU de consumo: no confirmado; por tamaño de parámetros podría caber en GPUs de 24 GB en cuantizaciones de 8 bits, pero no se proporcionan datos al respecto.
- Opciones de despliegue: servidor propio `decision_model.server` con FastAPI y Uvicorn; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 230,3 ms de media, 137,3 ms de mediana y 307,2 ms de P80 en A800 80GB con procesamiento secuencial de una petición a la vez.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| autorsi-jev-4b | 4,5 B | 32.768 | Decisión multimodal cerrada | no disponible | Hugging Face |
| Qwen3.5-4B (backbone) | ~4 B | no disponible | Generación multimodal | Apache 2.0 | Hugging Face |
| CLIP (familia) | variable | 77 tokens (texto) | Clasificación imagen-texto | MIT (variantes) | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo está limitado a tareas de decisión cerrada; no genera texto libre ni mantiene conversaciones multi-turno.
- El idioma declarado es únicamente inglés, lo que limita su uso en castellano u otros idiomas.
- No se especifica la licencia de la distribución; el backbone Qwen3.5-4B es Apache 2.0, pero las condiciones de uso comercial de autorsi-jev-4b no están claras.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí existe riesgo de selección incorrecta de opciones; el índice Public Vision de 73,7510 implica un margen de error significativo.
- No se documentan sesgos conocidos ni la composición del dataset de entrenamiento.
- La inferencia está validada con procesamiento secuencial de una petición a la vez; no se documenta throughput en paralelo.
- El límite de 255 opciones por decisión y de 1.638.400 píxeles por imagen puede ser insuficiente en escenarios con muchas categorías o imágenes de alta resolución.
- La temperatura está fijada en `decision_config.json` y no se documenta su ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/k2021211255/autorsi-jev-4b
- Resultados y entorno de evaluación: https://huggingface.co/datasets/k2021211255/autorsi-jev-4b-Results/tree/3bba8fb24c449eb65646ee66e1c32e4da6b31582/runs/autorsi-jev-4b
- Dataset Winoground (términos): https://huggingface.co/datasets/facebook/winoground
- Repositorio decision-index: https://github.com/apolinario/decision-index
