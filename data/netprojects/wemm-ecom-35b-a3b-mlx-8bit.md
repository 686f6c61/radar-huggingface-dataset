# netprojects/WeMM-Ecom-35B-A3B-MLX-8bit

## Resumen

WeMM-Ecom-35B-A3B es un modelo de visión-lenguaje especializado en comercio electrónico desarrollado por Tencent (WeChat Vision), afinado a partir de Qwen3.5 del equipo Qwen de Alibaba Cloud. Esta ficha describe la conversión a MLX en 8 bits publicada por NetProjects, pensada para ejecutar el modelo en Apple Silicon con la librería mlx-vlm. El modelo lee imágenes de producto, varias imágenes simultáneas y vídeo junto con texto, en chino e inglés, e incorpora razonamiento híbrido con modo thinking activable o desactivable por petición.

La arquitectura es un transformer de mezcla de expertos (MoE) con 35.107.181.936 parámetros totales y aproximadamente 3.000 millones activos por token, distribuidos en 40 capas con 256 expertos y 8 activos por token. El encoder de visión está incluido en la conversión. El repositorio ocupa 37,7 GB y los pesos están cuantizados a 8 bits con cuantización afín y tamaño de grupo 64.

Su relevancia radica en dos factores: por un lado, es una especialización vertical en tareas de e-commerce (títulos de producto, puntos de venta, comparación de listados, vídeo de producto) sobre una base general potente; por otro, la conversión MLX permite desplegarlo en Macs con memoria unificada amplia sin depender de GPUs NVIDIA ni de infraestructura cloud.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con encoder de visión, basado en Qwen3.5 |
| Parametros totales | 35.107.181.936 (~35B) |
| Parametros activos | ~3B por token (40 capas, 256 expertos, 8 activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín, tamaño de grupo 64 (esta build); existen builds de 6 y 4 bits del mismo autor |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), librería mlx |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 40 capas, 256 expertos y 8 expertos activos por token, lo que da unos 3B de parámetros activos sobre un total de 35B. Incorpora un encoder de visión que permite procesar imágenes individuales, múltiples imágenes en una misma petición y vídeo, en modalidad image-text-to-text. El razonamiento es híbrido: el modo thinking está activo por defecto y puede desactivarse por petición mediante el parámetro `enable_thinking`, lo que permite alternar entre respuestas directas (modo instruct) y respuestas con cadena de razonamiento previa.

No se dispone de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card original de Tencent es la referencia para esos datos. La conversión a MLX fue realizada con mlx-vlm sobre la revisión `0cdd077` del modelo original, verificando que todos los ficheros fuente coinciden en tamaño y hash SHA-256 con el Hub. El tokenizador, la plantilla de chat y los ficheros de procesador son los originales de Tencent, sin modificar. La fidelidad de la cuantización se midió con 10 prompts cortos en inglés y chino (346 posiciones con teacher forcing): la build de 8 bits coincide en el 98,8% de los siguientes tokens con los pesos bf16 originales, con una KL media de 0,0026.

## Capacidades

- Generación de texto y razonamiento con modo thinking híbrido (activado por defecto, desactivable por petición).
- Comprensión de imágenes de producto: identificación de categoría, color, precio y atributos visibles.
- Procesamiento de múltiples imágenes en una misma petición (por ejemplo, comparación de dos listados).
- Comprensión de vídeo junto con texto.
- Generación de contenido comercial: títulos de producto, puntos de venta, descripciones.
- Capacidades multilingües limitadas a chino e inglés.
- No se documenta soporte de tool calling ni de agentes multi-paso en la información disponible.
- No se documenta soporte de audio.

## Casos de uso

- Generación de fichas de producto: a partir de una foto de producto, el modelo produce un título corto y tres puntos de venta, como muestra el ejemplo de la model card con una camiseta azul y una etiqueta de precio.
- Comparación de listados duplicados: con dos imágenes en una misma petición y thinking activado, el modelo razona si dos publicaciones corresponden al mismo producto y explica las diferencias, útil para moderación de catálogo y detección de duplicados.
- Enriquecimiento de catálogo automatizado: procesamiento por lotes de imágenes de producto para extraer atributos (color, tipo, precio) y poblar bases de datos de e-commerce sin intervención manual.
- Análisis de vídeo de producto: revisión de vídeos de demostración o unboxing para extraer descripciones textuales o verificar que el contenido coincide con la ficha del artículo.
- Asistencia a vendedores: generación de descripciones y respuestas a preguntas frecuentes sobre productos a partir de sus imágenes, en chino o inglés según el mercado.
- Despliegue local en estaciones de trabajo Mac: con la build de 8 bits y mlx-vlm, un Mac con memoria unificada suficiente puede servir el modelo vía API compatible con OpenAI mediante `mlx_vlm.server`, sin GPU dedicada, para prototipos y evaluación interna.
- Control de calidad de anuncios: verificación automática de que la imagen de un listado coincide con la categoría y los atributos declarados en el texto.

## Benchmarks y rendimiento

Tencent reporta que, en 28 benchmarks de e-commerce repartidos en 8 escenarios, la puntuación media de e-commerce de WeMM-Ecom-35B-A3B supera en +3,92 a Qwen3.5-35B-A3B, en +3,36 a Qwen3.6-35B-A3B y en +8,22 a MiniCPM-V-4.7-35B-A3B. En 64 benchmarks generales, la puntuación general es +0,17 sobre Qwen3.5-35B-A3B. Son cifras del autor original; los desgloses por benchmark están en las tablas de la model card de Tencent, no reproducidas aquí.

| Build | Tamano | Mismo siguiente token que bf16 original | KL media vs original | Memoria pico (test de imagen) |
|---|---|---|---|---|
| MLX 6 bits (recomendada) | 29,1 GB | 98,8% | 0,0053 | 28,1 GB |
| MLX 8 bits (esta) | 37,7 GB | 98,8% | 0,0026 | 36,2 GB |
| MLX 4 bits | 20,4 GB | 94,5% | 0,0265 | 20,1 GB |

Las mediciones se realizaron en un MacBook Pro M5 Max de 128 GB el 25 de noviembre de 2026, con mlx 0.32.4 y mlx-vlm 0.7.11.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 36,2 GB de pico en el test de imagen para la build de 8 bits; 28,1 GB para la de 6 bits; 20,1 GB para la de 4 bits.
- Hardware objetivo: Apple Silicon con memoria unificada. La verificación se hizo en un MacBook Pro M5 Max de 128 GB; no se documentan pruebas en otros chips.
- No está pensado para GPUs NVIDIA (A100, H100, RTX 4090); el formato es MLX, específico de Apple Silicon.
- Cabe en Macs con memoria unificada de 64 GB o superior para la build de 8 bits; la de 6 bits es la recomendada por equilibrio entre tamaño y fidelidad; la de 4 bits es para equipos con menos memoria.
- Despliegue: mlx-vlm (versión >= 0.7.11) mediante CLI `mlx_vlm.generate` o API compatible con OpenAI con `mlx_vlm.server`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Ecom-35B-A3B (esta build) | 35B totales, ~3B activos | no disponible | E-commerce visión-lenguaje, MLX 8 bits | Apache-2.0 | Hugging Face |
| Qwen3.5-35B-A3B | 35B totales, ~3B activos | no disponible | Generalista visión-lenguaje | no disponible | Hugging Face |
| Qwen3.6-35B-A3B | 35B totales, ~3B activos | no disponible | Generalista visión-lenguaje | no disponible | Hugging Face |
| MiniCPM-V-4.7-35B-A3B | 35B totales, ~3B activos | no disponible | Visión-lenguaje | no disponible | Hugging Face |

Según las cifras de Tencent, WeMM-Ecom supera a las tres alternativas en la media de benchmarks de e-commerce, con una ventaja de +3,92 sobre Qwen3.5-35B-A3B, +3,36 sobre Qwen3.6-35B-A3B y +8,22 sobre MiniCPM-V-4.7-35B-A3B, manteniendo una puntuación general prácticamente igual a Qwen3.5-35B-A3B (+0,17).

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; no se documenta soporte de castellano ni de otras lenguas.
- Es una conversión de cuantización, no el modelo original: la build de 8 bits conserva el 98,8% de coincidencia en el siguiente token, pero no es idéntica a los pesos bf16.
- Los benchmarks citados son cifras del autor original (Tencent) y no han sido verificados de forma independiente en esta ficha.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en la descripción de atributos de producto no visibles en la imagen.
- No se documenta soporte de tool calling ni de flujos de agente multi-paso; para pipelines que lo requieran habría que evaluarlo empíricamente.
- La licencia Apache-2.0 permite uso comercial, pero el fichero LICENSE incluye la sección de terceros de Qwen3.5 (Alibaba Cloud, Apache-2.0); conviene revisarla antes de redistribuir.
- El despliegue está restringido a Apple Silicon con mlx-vlm >= 0.7.11; no hay builds oficiales para CUDA, vLLM, llama.cpp ni Ollama.
- La longitud de contexto no está documentada en la información disponible, lo que impide planificar tareas con ventanas largas sin verificarlo en la model card original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/WeMM-Ecom-35B-A3B-MLX-8bit
- Modelo base original: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Build MLX 6 bits (recomendada): https://huggingface.co/netprojects/WeMM-Ecom-35B-A3B-MLX-6bit
- Build MLX 4 bits: https://huggingface.co/netprojects/WeMM-Ecom-35B-A3B-MLX-4bit
- Publicador (NetProjects): https://netpr
