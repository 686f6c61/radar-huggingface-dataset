# netprojects/WeMM-Ecom-35B-A3B-MLX-4bit

## Resumen

WeMM-Ecom-35B-A3B es un modelo de visión-lenguaje especializado en comercio electrónico desarrollado por Tencent (WeChat Vision), afinado a partir de Qwen3.5. Este repositorio concreto es una conversión a formato MLX cuantizada a 4 bits, publicada por NetProjects, pensada para ejecutar el modelo en Apple Silicon. El modelo lee imágenes de producto, varias imágenes simultáneas y vídeo junto con texto, en chino e inglés, e incorpora un modo de razonamiento híbrido (thinking) activado por defecto y desactivable por petición.

Arquitectónicamente es un transformer de mezcla de expertos (MoE) con 35.107.181.936 parámetros totales y aproximadamente 3.000 millones activos por token, distribuidos en 40 capas con 256 expertos y 8 activos por token. La familia WeMM-Ecom se posiciona como una alternativa especializada frente a modelos generalistas del mismo tamaño, con mejoras declaradas por Tencent de +3,92 puntos de media sobre Qwen3.5-35B-A3B en 28 benchmarks de comercio electrónico repartidos en 8 escenarios.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de 35B en un Mac con memoria unificada moderada: la build de 4 bits ocupa 20,4 GB y mantiene un 94,5% de coincidencia de siguiente token respecto a los pesos bf16 originales, según las comprobaciones del autor de la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) multimodal con codificador de visión, basado en Qwen3.5 |
| Parametros totales | 35.107.181.936 |
| Parametros activos | Aproximadamente 3B por token (40 capas, 256 expertos, 8 activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín con tamaño de grupo 64 (esta build); existen builds de 6 y 8 bits del mismo autor |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx-vlm) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con componente multimodal: un codificador de visión procesa imágenes y vídeo, y el tronco lingüístico MoE genera la respuesta. La configuración MoE indicada en la model card es de 256 expertos con 8 activos por token sobre 40 capas, lo que da los aproximadamente 3B parámetros activos por token frente a los 35B totales. El modelo deriva de Qwen3.5, desarrollado por el equipo Qwen de Alibaba Cloud, y ha sido afinado por Tencent (WeChat Vision) para tareas de comercio electrónico.

La model card de esta conversión no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información correspondería a la model card original de Tencent, que esta ficha no reproduce. La innovación técnica destacable en este repositorio es la propia conversión a MLX con cuantización de 4 bits, que incluye el codificador de visión y conserva sin cambios el tokenizador, la plantilla de chat y los ficheros de procesador de Tencent. El autor de la conversión reporta métricas de fidelidad frente a los pesos bf16 originales: 94,5% de coincidencia de siguiente token y KL media de 0,0265 para esta build de 4 bits.

## Capacidades

- Generación de texto e imagen-a-texto en chino e inglés.
- Comprensión de imágenes de producto: identificación de artículo, color, precio y atributos visibles.
- Razonamiento sobre múltiples imágenes simultáneas, incluyendo comparación entre ellas (por ejemplo, diferencias entre dos listados).
- Comprensión de vídeo junto con texto.
- Modo de razonamiento híbrido: thinking activado por defecto y desactivable por petición mediante `enable_thinking`.
- Generación de títulos de producto y puntos de venta a partir de una imagen.
- Comparación y verificación de equivalencia entre listados de producto.
- Servido mediante API compatible con OpenAI a través de `mlx_vlm.server`.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni capacidades de agente multi-paso.

## Casos de uso

- Generación de fichas de producto: a partir de una foto de un artículo, el modelo produce un título corto y tres puntos de venta, como demuestra el ejemplo de la model card con una camiseta azul y una etiqueta de precio de ¥99.
- Enriquecimiento de catálogos: procesar lotes de imágenes de producto para extraer atributos (color, tipo de artículo, precio visible) y poblar metadatos de forma automatizada, aprovechando el modo instruct para respuestas rápidas.
- Detección de duplicados y comparación de listados: con dos imágenes de entrada, el modelo explica diferencias entre listados, útil para control de calidad de marketplace o para consolidar publicaciones duplicadas.
- Moderación y verificación de anuncios: comprobar que la imagen de un listado coincide con la descripción textual y señalar discrepancias, con el modo thinking activado para razonamiento explícito.
- Análisis de vídeo de producto: resumir o describir contenido de vídeo promocional junto con texto, orientado a generación de descripciones y metadatos para vídeo comercial.
- Asistencia a vendedores en chino e inglés: conversaciones multi-turno sobre productos con contexto visual, útil para herramientas de soporte a sellers en mercados bilingües.
- Despliegue local en estaciones de trabajo Apple: prototipado y demos en Mac con memoria unificada suficiente, sin depender de GPU dedicadas, gracias a la build MLX de 4 bits.

## Benchmarks y rendimiento

La model card recoge cifras agregadas reportadas por Tencent, no resultados por benchmark individual en esta conversión:

| Comparación | Métrica | Resultado |
|---|---|---|
| vs. Qwen3.5-35B-A3B | Media en 28 benchmarks de e-commerce (8 escenarios) | +3,92 |
| vs. Qwen3.6-35B-A3B | Media en 28 benchmarks de e-commerce (8 escenarios) | +3,36 |
| vs. MiniCPM-V-4.7-35B-A3B | Media en 28 benchmarks de e-commerce (8 escenarios) | +8,22 |
| vs. Qwen3.5-35B-A3B | Media en 64 benchmarks generales | +0,17 |

Fidelidad de la cuantización frente a los pesos bf16 originales (medida por el autor de la conversión, 10 prompts cortos en inglés y chino, 346 posiciones con teacher forcing):

| Build | Tamano | Coincidencia de siguiente token | KL media vs. original | Memoria pico (prueba con imagen) |
|---|---|---|---|---|
| 6 bits (recomendada) | 29,1 GB | 98,8% | 0,0053 | 28,1 GB |
| 8 bits | 37,7 GB | 98,8% | 0,0026 | 36,2 GB |
| 4 bits (esta build) | 20,4 GB | 94,5% | 0,0265 | 20,1 GB |

No se han publicado resultados desglosados por benchmark (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 20,1 GB de pico en la prueba con imagen para la build de 4 bits; 28,1 GB para la de 6 bits; 36,2 GB para la de 8 bits.
- Plataforma objetivo: Apple Silicon con memoria unificada. Las pruebas del autor se realizaron en un MacBook Pro M5 Max de 128 GB con mlx 0.32.4 y mlx-vlm 0.7.11.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable a esta build, que depende de MLX y no de CUDA; para esos entornos habría que usar los pesos originales de Tencent u otra conversión.
- Cabe en Mac consumer con memoria unificada suficiente: la build de 4 bits es la indicada explícitamente para Macs con menos memoria; la de 6 bits es la recomendada por equilibrio tamaño/fidelidad.
- Opciones de despliegue: `mlx_vlm.generate` desde línea de comandos, API de Python con `mlx_vlm.load` y `generate`, y `mlx_vlm.server` con API compatible con OpenAI. Requiere `mlx-vlm>=0.7.11`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos por token | Contexto | Enfoque | Licencia |
|---|---|---|---|---|---|
| WeMM-Ecom-35B-A3B (esta familia) | 35B | ~3B | no disponible | E-commerce VLM, zh/en, imagen y vídeo | Apache-2.0 |
| Qwen3.5-35B-A3B | 35B | ~3B | no disponible | Generalista multimodal | no disponible en esta ficha |
| Qwen3.6-35B-A3B | 35B | ~3B | no disponible | Generalista multimodal | no disponible en esta ficha |
| MiniCPM-V-4.7-35B-A3B | 35B | ~3B | no disponible | Generalista multimodal | no disponible en esta ficha |

Según las cifras agregadas de Tencent, WeMM-Ecom-35B-A3B supera a Qwen3.5-35B-A3B en +3,92 puntos medios de e-commerce y en +0,17 puntos en benchmarks generales, y a MiniCPM-V-4.7-35B-A3B en +8,22 puntos de e-commerce. Los detalles por benchmark no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; no se documenta soporte de castellano ni de otros idiomas.
- Especialización en e-commerce: aunque mantiene rendimiento generalista cercano a Qwen3.5 (+0,17), su ventaja está concentrada en tareas comerciales.
- La cuantización a 4 bits reduce la fidelidad: 94,5% de coincidencia de siguiente token frente al bf16 original y KL media de 0,0265, superior a las builds de 6 y 8 bits. Para producción sensible a calidad, la build de 6 bits es la recomendada por el autor.
- Riesgo de alucinación no cuantificado en la información disponible; como modelo generativo multimodal, puede describir atributos de producto inexistentes.
- Sesgos conocidos: no documentados en la información disponible.
- Longitud de contexto no especificada en esta conversión; conviene consultar la model card original de Tencent antes de diseñar flujos con contexto largo.
- Dependencia de MLX y Apple Silicon: no es desplegable en CUDA sin recurrir a los pesos originales.
- Licencia Apache-2.0, que permite uso comercial; el fichero LICENSE es el de Tencent, sin cambios, e incluye la sección de terceros de Qwen3.5 (Alibaba Cloud, Apache-2.0).
- El modo thinking está activado por defecto y consume tokens adicionales; para respuestas directas hay que desactivarlo con `enable_thinking=False` y usar los parámetros de muestreo recomendados (temperatura 0,7, top_p 0,8, top_k 20, presence_penalty 1,5 en modo instruct; temperatura 1,0, top_p 0,95 en modo thinking).

## Enlaces

- Repositorio Hugging Face de esta build: https://huggingface.co/netprojects/WeMM-Ecom-35B-A3B-MLX-4bit
- Modelo base original: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Build de 6 bits (recomendada): https://huggingface.co/netprojects/WeMM-Ecom-35B-A3B-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/WeMM-Ecom-35B-A3B-MLX-8bit
- Publicador de las conversiones: https://netpr (enlace truncado en la información disponible)
