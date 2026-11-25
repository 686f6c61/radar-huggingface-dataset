# netprojects/WeMM-Ecom-9B-MLX-8bit

## Resumen

WeMM-Ecom-9B-MLX-8bit es una conversión al framework MLX de Apple Silicon del modelo WeMM-Ecom-9B de Tencent (WeChat Vision), una familia de modelos vision-language especializados en comercio electrónico y ajustados a partir de Qwen3.5. Esta variante, publicada por NetProjects (Internet Projects Ltd), cuantiza los pesos originales en bf16 a 8 bits con cuantización afín y tamaño de grupo 64, incluyendo el codificador visual, lo que reduce el repositorio a 10,4 GB y permite ejecutar el modelo de forma nativa en Macs con chip de la serie M.

El modelo resuelve tareas multimodales propias del sector e-commerce: lectura de imágenes de producto, comparación de varias imágenes simultáneas y comprensión de vídeo junto con texto, en chino e inglés. Incorpora un modo de razonamiento híbrido (thinking) activado por defecto que puede desactivarse por petición mediante el parámetro `enable_thinking`, lo que permite alternar entre respuestas directas y respuestas con cadena de razonamiento según la latencia y precisión requeridas.

Su relevancia actual radica en que ofrece una vía práctica para desplegar un modelo de 9.400 millones de parámetros con capacidades de visión y vídeo en hardware de consumo Apple, sin GPU dedicada, manteniendo una fidelidad muy alta respecto a los pesos originales: el 99,1% de coincidencia en el siguiente token y una KL media de 0,0008 frente al modelo bf16 de Tencent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (fine-tune de Qwen3.5, con codificador visual) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín, group size 64 (esta build); existen builds de 6 y 4 bits del mismo autor |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), vision encoder incluido |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal construido sobre Qwen3.5, con un codificador visual que procesa imágenes individuales, múltiples imágenes en una misma petición y vídeo, combinándolas con entrada de texto. Tencent lo ha ajustado específicamente para el dominio del comercio electrónico, aunque la model card de esta conversión no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; esos datos deben consultarse en la model card original de `tencent/WeMM-Ecom-9B`.

La innovación destacable de esta build concreta es la conversión a MLX con cuantización de 8 bits, validada empíricamente contra los pesos bf16 originales: sobre 10 prompts cortos en inglés y chino (4 con thinking activado y 6 desactivado) y 345 posiciones con teacher forcing, se obtuvo un 99,1% de coincidencia en el siguiente token y una KL media de 0,0008. El tokenizador, la plantilla de chat y los ficheros de procesador son los originales de Tencent sin modificar, y el codificador visual está incluido en la build. El modo thinking híbrido, activado por defecto, permite desactivarlo por petición.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de imágenes y vídeo.
- Comprensión de imágenes de producto: identificación de categoría, color, precio y atributos visibles.
- Comparación de múltiples imágenes en una misma petición (por ejemplo, dos listados del mismo producto en distintos colores).
- Comprensión de vídeo combinada con texto.
- Modo thinking híbrido: razonamiento explícito antes de responder, desactivable con `enable_thinking=False`.
- Capacidades multilingües limitadas a chino e inglés.
- Generación de contenido comercial: títulos de producto, puntos de venta, descripciones.
- Servido mediante API compatible con OpenAI a través de `mlx_vlm.server`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Generación de fichas de producto: a partir de una foto, el modelo produce un título corto y tres puntos de venta, como demuestra el ejemplo de la model card con `--prompt "Write a short product title and three selling points for this item."`. Adecuado por su ajuste específico al dominio e-commerce.
- Deduplicación de listados: comparar dos imágenes de listados distintos y determinar si representan el mismo producto y en qué difieren, usando el modo thinking para explicar las diferencias. Útil en catálogos con inventario duplicado.
- Moderación y control de calidad de catálogo: verificar que la imagen de un producto coincide con su descripción textual y detectar discrepancias de color, precio o categoría antes de publicar.
- Análisis de vídeo de producto: extraer información de vídeos demostrativos o unboxings para generar descripciones o resúmenes de atributos, gracias al soporte de entrada de vídeo junto con texto.
- Asistencia a vendedores en marketplaces: responder consultas en chino o inglés sobre productos concretos adjuntando imágenes, con respuestas directas (thinking off) para baja latencia o razonadas (thinking on) para casos ambiguos.
- Prototipado local en Mac: desarrollo y evaluación de pipelines multimodales de e-commerce sin GPU dedicada, usando `mlx_vlm.server` como endpoint compatible con OpenAI para integrarlo en aplicaciones existentes.
- Extracción de atributos estructurados: leer etiquetas de precio, tallas y colores visibles en la imagen para poblar campos de base de datos, con el modo instruct para minimizar latencia.

## Benchmarks y rendimiento

La model card de esta conversión remite a las tablas de benchmarks de Tencent en la model card original (`tencent/WeMM-Ecom-9B`), presentadas como imágenes (comparativas de e-commerce y generales, en modo instruct y thinking), pero no reproduce los valores numéricos. No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos cuantitativos de rendimiento disponibles son las métricas de fidelidad de la cuantización frente a los pesos bf16 originales:

| Build | Tamano | Coincidencia siguiente token | KL media vs original | Memoria pico (test de imagen) |
|---|---|---|---|---|
| 6 bits (recomendada) | 8,2 GB | 98,0% | 0,0043 | 8,7 GB |
| 8 bits (esta) | 10,4 GB | 99,1% | 0,0008 | 10,8 GB |
| 4 bits | 6,0 GB | 94,2% | 0,0517 | 6,6 GB |

Medido en un MacBook Pro M5 Max de 128 GB, el 25 de noviembre de 2026, con mlx 0.32.4 y mlx-vlm 0.7.11.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 10,8 GB de memoria pico en el test de imagen para esta build de 8 bits; el repositorio ocupa 10,4 GB.
- Hardware objetivo: Apple Silicon (MLX). La validación se realizó en un MacBook Pro M5 Max con 128 GB.
- Cabe en GPU de consumo Apple con memoria unificada suficiente; para Macs con menos memoria, el mismo autor ofrece builds de 6 bits (8,7 GB pico) y 4 bits (6,6 GB pico).
- GPU NVIDIA (A100, H100, RTX 4090): no disponible; esta build está pensada para MLX y no se documenta su uso en CUDA.
- Despliegue: `mlx-vlm>=0.7.11` para CLI y Python; `mlx_vlm.server` para API compatible con OpenAI. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para esta build.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Ecom-9B-MLX-8bit (esta build) | 9,41 B | no disponible | Vision-language e-commerce, MLX 8 bits | Apache-2.0 | Hugging Face (netprojects) |
| tencent/WeMM-Ecom-9B | 9,41 B | no disponible | Vision-language e-commerce, bf16 original | Apache-2.0 | Hugging Face (tencent) |
| netprojects/WeMM-Ecom-9B-MLX-6bit | 9,41 B | no disponible | Igual, cuantización 6 bits (recomendada por el autor) | Apache-2.0 | Hugging Face (netprojects) |
| netprojects/WeMM-Ecom-9B-MLX-4bit | 9,41 B | no disponible | Igual, cuantización 4 bits para Macs con menos memoria | Apache-2.0 | Hugging Face (netprojects) |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; no se documenta soporte de castellano ni de otras lenguas.
- Longitud de contexto no especificada en la información disponible; conviene consultar la model card original antes de diseñar flujos con entradas largas.
- Riesgo de alucinación inherente a los modelos generativos: las descripciones de producto o lecturas de precio pueden ser incorrectas y deben validarse en producción.
- Sesgos: no se documentan sesgos específicos en la información proporcionada; al estar ajustado sobre datos de e-commerce, puede reflejar sesgos de catálogo y de mercado chino.
- Es una conversión no oficial: NetProjects no está afiliado a Tencent ni a Alibaba; la calidad depende de la fidelidad de la cuantización, que en 8 bits es alta (99,1% de coincidencia) pero no perfecta.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe conservarse el fichero `LICENSE` de Tencent (con su sección de terceros para Qwen3.5) y el `NOTICE` que acredita a Tencent y al equipo Qwen.
- Dependencia de hardware Apple: el formato MLX no es portable a CUDA sin conversión adicional; para despliegue en GPU NVIDIA debe usarse el modelo original en bf16.
- El modo thinking está activado por defecto y consume más tokens; para producción de baja latencia hay que desactivarlo explícitamente con `enable_thinking=False` y ajustar los parámetros de muestreo recomendados (temperature 0,7, top_p 0,8, top_k 20, presence_penalty 1,5 en instruct; temperature 1,0, top_p 0,95 en thinking).
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/WeMM-Ecom-9B-MLX-8bit
- Modelo base original: https://huggingface.co/tencent/WeMM-Ecom-9B
- Build de 6 bits (recomendada): https://huggingface.co/netprojects/WeMM-Ecom-9B-MLX-6bit
- Build de 4 bits: https://huggingface.co/netprojects/WeMM-Ecom-9B-MLX-4bit
- Perfil del autor en Hugging Face: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
