# netprojects/WeMM-Ecom-9B-MLX-4bit

## Resumen

WeMM-Ecom-9B-MLX-4bit es la conversión a formato MLX con cuantización de 4 bits del modelo tencent/WeMM-Ecom-9B, un modelo de visión-lenguaje especializado en comercio electrónico desarrollado por Tencent (WeChat Vision) y afinado a partir de Qwen3.5. Esta build concreta la publica NetProjects (Internet Projects Ltd) para su ejecución en Apple Silicon mediante la librería mlx-vlm, incluyendo el codificador visual en la conversión. El modelo procesa imágenes de producto, múltiples imágenes simultáneas y vídeo junto con texto, en chino e inglés.

El modelo resuelve tareas típicas de e-commerce: generación de títulos y descripciones de producto, comparación entre listados, extracción de atributos visuales y razonamiento multimodal. Incorpora un modo de pensamiento híbrido (*thinking*) activado por defecto, que puede desactivarse por petición mediante el parámetro `enable_thinking`. La arquitectura subyacente es un transformer multimodal de tipo image-text-to-text derivado de Qwen3.5, con 9.409.813.744 parámetros totales.

Esta build de 4 bits ocupa 6,0 GB y es la más pequeña de la familia de conversiones MLX publicadas por NetProjects, pensada para Macs con memoria limitada. Frente a las builds de 6 y 8 bits, sacrifica fidelidad respecto a los pesos bf16 originales (94,2 % de coincidencia en el siguiente token frente a 98,0 % y 99,1 % respectivamente), lo que la hace adecuada para prototipado y uso local más que para producción de alta exigencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (derivada de Qwen3.5), conversión MLX |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit affine, group size 64 (esta build); existen builds de 6-bit y 8-bit del mismo autor |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), codificador visual incluido |
| Tamaño del repositorio | 6,0 GB |
| Memoria pico en prueba de imagen | 6,6 GB |
| Librería | mlx (mlx-vlm >= 0.7.11) |
| Modelo base | tencent/WeMM-Ecom-9B (revisión 9761812) |

## Arquitectura y entrenamiento

El modelo original WeMM-Ecom-9B es un modelo de visión-lenguaje de la familia WeMM-Ecom de Tencent WeChat Vision, afinado a partir de Qwen3.5 (Qwen Team, Alibaba Cloud). La arquitectura es de tipo image-text-to-text con codificador visual, capaz de procesar una o varias imágenes y vídeo junto con texto. Esta build concreta no modifica la arquitectura: es una conversión de los pesos bf16 originales a MLX con cuantización afín de 4 bits y tamaño de grupo 64, manteniendo el codificador visual incluido. Los ficheros de tokenizer, plantilla de chat y procesador son los originales de Tencent, sin cambios.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La model card del autor de la conversión remite a la card original de Tencent para los detalles de método y escenarios. La innovación técnica destacable del modelo es el modo de pensamiento híbrido: el razonamiento (*thinking*) está activado por defecto y puede desactivarse por petición con `enable_thinking=False`, permitiendo alternar entre un modo instructivo directo y un modo de razonamiento extendido.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de imágenes y vídeo.
- Comprensión de imágenes de producto: identificación de objeto, color, precio y atributos visibles.
- Procesamiento de múltiples imágenes simultáneas (p. ej. comparación de dos listados del mismo producto).
- Procesamiento de vídeo junto con texto.
- Modo de pensamiento híbrido: razonamiento previo a la respuesta activable o desactivable por petición.
- Generación de contenido comercial: títulos de producto, descripciones y puntos de venta.
- Capacidades multilingües limitadas a chino e inglés.
- Servido mediante API compatible con OpenAI a través de `mlx_vlm.server`.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni agentes multi-paso.

## Casos de uso

- Generación de títulos y descripciones de producto: a partir de una imagen de producto, el modelo produce un título corto y tres puntos de venta, tal como demuestra el ejemplo de la model card; adecuado para automatizar el alta de catálogo.
- Comparación de listados duplicados: con dos imágenes de entrada, el modelo describe diferencias entre variantes del mismo producto (p. ej. una camiseta en azul y en verde), útil para detección de duplicados o consolidación de catálogo.
- Extracción de atributos visuales: identificación de color, tipo de producto y precio visible en la imagen, aprovechable para enriquecer fichas de producto de forma semiautomática.
- Análisis de vídeo de producto: al aceptar vídeo junto con texto, puede emplearse para resumir o describir contenido de vídeos de demostración de producto.
- Asistencia en modo instructivo para respuestas rápidas: con `enable_thinking=False` y muestreo recomendado (temperatura 0,7, top_p 0,8), adecuado para tareas de extracción directa donde no se requiere razonamiento extendido.
- Razonamiento extendido para tareas complejas: con thinking activado (temperatura 1,0, top_p 0,95), útil para comparaciones matizadas entre listados o evaluación de discrepancias.
- Prototipado local en Apple Silicon: con 6,0 GB de pesos y 6,6 GB de memoria pico en prueba de imagen, permite desarrollar y validar flujos multimodales en un Mac sin GPU dedicada.

## Benchmarks y rendimiento

La model card de esta conversión remite a las tablas de benchmarks de Tencent publicadas en la card original (comparativas de e-commerce y generales, en modo instruct y modo thinking), pero no reproduce los valores numéricos en texto. No se han publicado cifras de benchmarks en la información disponible para esta build.

Métricas de fidelidad de la conversión frente a los pesos bf16 originales de Tencent (medidas por el autor de la conversión, 10 prompts cortos en inglés y chino, 345 posiciones con teacher forcing):

| Build | Tamaño | Mismo siguiente token que el original bf16 | KL media vs original | Memoria pico (prueba de imagen) |
|---|---|---|---|---|
| 6-bit (recomendada) | 8,2 GB | 98,0 % | 0,0043 | 8,7 GB |
| 8-bit | 10,4 GB | 99,1 % | 0,0008 | 10,8 GB |
| 4-bit (esta build) | 6,0 GB | 94,2 % | 0,0517 | 6,6 GB |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 6,0 GB de pesos; 6,6 GB de memoria pico medida en prueba de imagen en un MacBook Pro M5 Max de 128 GB.
- Plataforma objetivo: Apple Silicon (MLX). No está pensada para GPUs NVIDIA.
- Cabe en Macs con memoria unificada modesta (a partir de 8 GB, aunque se recomienda margen adicional para contexto y procesamiento de vídeo).
- Despliegue: `mlx-vlm` (>= 0.7.11) mediante CLI (`mlx_vlm.generate`) o Python (`load`, `generate`); servido con API compatible con OpenAI mediante `mlx_vlm.server`.
- Entorno de validación del autor: mlx 0.32.4 y mlx-vlm 0.7.11 sobre MacBook Pro M5 Max (128 GB), 25 de noviembre de 2026.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Plataforma |
|---|---|---|---|---|---|
| WeMM-Ecom-9B-MLX-4bit (esta build) | 9,41 B | no disponible | 4-bit | Apache-2.0 | Apple Silicon (MLX) |
| WeMM-Ecom-9B-MLX-6bit | 9,41 B | no disponible | 6-bit | Apache-2.0 | Apple Silicon (MLX) |
| WeMM-Ecom-9B-MLX-8bit | 9,41 B | no disponible | 8-bit | Apache-2.0 | Apple Silicon (MLX) |
| tencent/WeMM-Ecom-9B (original bf16) | 9,41 B | no disponible | bf16 | Apache-2.0 | GPU / servidor |

Las tres builds MLX comparten arquitectura, licencia e idiomas; difieren en tamaño, fidelidad respecto al original y memoria pico. El modelo original bf16 es la referencia de calidad pero no está optimizado para Apple Silicon. No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; no se documenta soporte de castellano ni de otras lenguas.
- La cuantización a 4 bits reduce la fidelidad: 94,2 % de coincidencia en el siguiente token y KL media de 0,0517 frente a los pesos bf16, notablemente peor que las builds de 6 y 8 bits; puede degradar respuestas en tareas sensibles.
- Específica de Apple Silicon (MLX): no ejecutable directamente en GPUs NVIDIA ni en entornos de servidor convencionales sin reconversión.
- No se dispone de información sobre sesgos conocidos del modelo original ni sobre tasas de alucinación.
- No se documenta longitud de contexto máxima, lo que dificulta planificar cargas con entradas largas o vídeo extenso.
- Modo thinking activado por defecto: consume más tokens y requiere límites de `max_tokens` generosos (el ejemplo usa 4096) para cerrar el bloque de razonamiento.
- Licencia Apache-2.0 permite uso comercial, pero el fichero LICENSE es el de Tencent sin modificar, incluyendo la sección de terceros relativa a Qwen3.5 (Alibaba Cloud, Apache-2.0); conviene revisarla antes de producción.
- Publicada por NetProjects (Internet Projects Ltd), no afiliada a Tencent ni a Alibaba; el soporte y mantenimiento dependen de este tercero.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de usuarios aún inexistente, sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/WeMM-Ecom-9B-MLX-4bit
- Modelo base original: https://huggingface.co/tencent/WeMM-Ecom-9B
- Build de 6 bits (recomendada): https://huggingface.co/netprojects/WeMM-Ecom-9B-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/WeMM-Ecom-9B-MLX-8bit
- Perfil del autor de la conversión: https://huggingface.co/netprojects
- Sitio web del autor: https://netprojects.com
- Librería mlx-vlm: no se proporciona enlace directo en la información disponible.
