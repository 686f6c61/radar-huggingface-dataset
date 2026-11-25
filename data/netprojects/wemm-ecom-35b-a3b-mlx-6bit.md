# netprojects/WeMM-Ecom-35B-A3B-MLX-6bit

## Resumen
WeMM-Ecom-35B-A3B-MLX-6bit es una conversión a MLX, en cuantización de 6 bits, del modelo multimodal de comercio electrónico tencent/WeMM-Ecom-35B-A3B, desarrollado por Tencent (WeChat Vision) y afinado a partir de Qwen3.5. Lo publica el usuario netprojects y está pensado específicamente para ejecutarse en Apple Silicon mediante la librería mlx-vlm, incluyendo el codificador visual en los pesos. El modelo lee imágenes de producto, varias imágenes a la vez y vídeo junto con texto, en chino e inglés, y resuelve tareas típicas de e-commerce: titulación de producto, extracción de atributos, comparación de listados o generación de puntos de venta.

Arquitectónicamente es un transformer de mezcla de expertos (MoE) con 35.107.181.936 parámetros totales y unos 3B activos por token, distribuidos en 40 capas con 256 expertos y 8 activos por token. Incorpora razonamiento híbrido: el modo thinking está activado por defecto y puede desactivarse por petición mediante el parámetro `enable_thinking`, lo que permite elegir entre respuestas directas (instruct) o respuestas razonadas.

Su relevancia actual radica en que traslada un modelo de visión-lenguaje especializado en e-commerce al ecosistema local de Apple, con un tamaño de 29,1 GB que cabe en equipos con memoria unificada alta, manteniendo un 98,8 % de coincidencia en el siguiente token respecto a los pesos bf16 originales de Tencent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (vision-lenguaje), fine-tune de Qwen3.5; 40 capas, 256 expertos, 8 activos por token |
| Parametros totales | 35.107.181.936 |
| Parametros activos | ~3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits (affine, group size 64); existen builds de 8 bits y 4 bits del mismo autor |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), cuantización 6-bit; codificador visual incluido |

## Arquitectura y entrenamiento
El modelo base es un transformer de mezcla de expertos con 40 capas, 256 expertos y 8 expertos activos por token, lo que da 35B parámetros totales con aproximadamente 3B activos en cada paso de inferencia. Es un modelo vision-lenguaje: acepta imágenes (una o varias) y vídeo junto con texto, e incorpora un codificador visual que en esta conversión MLX se distribuye incluido en los pesos. Deriva de Qwen3.5 mediante fine-tuning de Tencent (WeChat Vision) sobre datos orientados a comercio electrónico, e incorpora un modo de razonamiento híbrido conmutable por petición (`enable_thinking`).

La conversión a MLX la realiza netprojects con mlx-vlm, cuantizando los pesos a 6 bits con cuantización afina y tamaño de grupo 64. Según la model card, los ficheros de origen de tencent/WeMM-Ecom-35B-A3B (revisión `0cdd077`) se verificaron contra los tamaños y hashes SHA-256 del Hub, y el tokenizador, la plantilla de chat y los ficheros de procesador son los originales de Tencent sin modificar. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, ni si hubo RLHF o DPO.

## Capacidades
- Comprensión de imágenes de producto: identificación de categoría, color, precio y atributos visibles.
- Razonamiento sobre varias imágenes simultáneas: comparación de listados, detección de diferencias entre variantes (por ejemplo, el mismo producto en distinto color).
- Comprensión de vídeo junto con texto.
- Generación de texto en chino e inglés para tareas de e-commerce: títulos de producto, puntos de venta, descripciones.
- Modo thinking híbrido: razonamiento explícito antes de responder (activado por defecto) o respuesta directa en modo instruct, conmutable por petición mediante `enable_thinking`.
- Respuestas conversacionales multi-turno (pipeline image-text-to-text, etiqueta conversational).
- Servido mediante API compatible con OpenAI a través de `mlx_vlm.server`.

## Casos de uso
- Generación de fichas de producto: a partir de una foto, el modelo produce un título corto y tres puntos de venta, como se muestra en el ejemplo de la model card con `mlx_vlm.generate`.
- Comparación de listados duplicados: con dos imágenes y el modo thinking activado, razona si dos anuncios corresponden al mismo producto y explica las diferencias, útil para control de catálogo y detección de duplicados.
- Extracción de atributos para catálogo: identificación de color, precio y tipo de producto en imágenes, verificada en la model card con una camiseta azul con etiqueta de ¥99.
- Enriquecimiento de descripciones en chino e inglés: redacción bilingüe de contenido comercial para mercados de habla china e inglesa.
- Análisis de vídeo de producto: descripción y extracción de información a partir de vídeos junto con texto, para resúmenes o verificaciones de contenido.
- Prototipado local en Apple Silicon: despliegue en MacBook Pro con chip M-series para pruebas de pipelines de visión-lenguaje sin depender de servicios en la nube, gracias al formato MLX y a los 29,1 GB de pesos.
- Asistencia conversacional de atención al cliente sobre imágenes: respuestas multi-turno a consultas de compradores que adjuntan fotos de producto.

## Benchmarks y rendimiento
La model card cita resultados de Tencent (no reproducidos por el autor de la conversión): frente a Qwen3.5-35B-A3B, una media de +3,92 en 28 benchmarks de e-commerce en 8 escenarios; +3,36 frente a Qwen3.6-35B-A3B; +8,22 frente a MiniCPM-V-4.7-35B-A3B; y +0,17 en la media de 64 benchmarks generales frente a Qwen3.5-35B-A3B. Las tablas detalladas están en la model card original y en las imágenes de referencia.

Fidelidad de la cuantización respecto a los pesos bf16 originales (medida por el autor de la conversión en un MacBook Pro M5 Max de 128 GB, mlx 0.32.4 y mlx-vlm 0.7.11, con 10 prompts cortos en inglés y chino y 346 posiciones teacher-forced):

| Build | Tamano | Mismo siguiente token que el original bf16 | KL media vs original | Memoria pico (prueba con imagen) |
|---|---|---|---|---|
| MLX 6-bit (recomendado) | 29,1 GB | 98,8 % | 0,0053 | 28,1 GB |
| MLX 8-bit | 37,7 GB | 98,8 % | 0,0026 | 36,2 GB |
| MLX 4-bit | 20,4 GB | 94,5 % | 0,0265 | 20,1 GB |

No se han publicado resultados de benchmarks completos (MMLU, HumanEval, GSM8K u otros) para esta conversión MLX en la información disponible.

## Requisitos de hardware
- VRAM/memoria unificada estimada: unos 28,1 GB de pico en la prueba con imagen para el build de 6 bits; 36,2 GB para el de 8 bits; 20,1 GB para el de 4 bits.
- Plataforma objetivo: Apple Silicon con memoria unificada; la verificación se realizó en un MacBook Pro M5 Max de 128 GB.
- GPU recomendadas: chips Apple M-series (M5 Max verificado); no está pensado para GPU NVIDIA/AMD, al ser un formato MLX.
- Cabe en equipos consumer Apple con memoria suficiente: el build de 6 bits requiere al menos ~29 GB de memoria unificada; el de 4 bits (~20,4 GB) está orientado a Macs con menos memoria.
- Despliegue: mlx-vlm (>= 0.7.11) mediante CLI `mlx_vlm.generate` o API Python `load`/`generate`; servido con `mlx_vlm.server` con API compatible con OpenAI. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Ecom-35B-A3B-MLX-6bit (este) | 35B totales, ~3B activos | no disponible | Vision-lenguaje e-commerce, MLX 6-bit | Apache-2.0 | Hugging Face, requiere mlx-vlm |
| tencent/WeMM-Ecom-35B-A3B (original) | 35B totales, ~3B activos | no disponible | Vision-lenguaje e-commerce, bf16 | Apache-2.0 | Hugging Face |
| Qwen3.5-35B-A3B | 35B totales, ~3B activos | no disponible | Vision-lenguaje general | no disponible en la información | Hugging Face |
| MiniCPM-V-4.7-35B-A3B | 35B totales, ~3B activos | no disponible | Vision-lenguaje general | no disponible en la información | Hugging Face |

Según las cifras de Tencent citadas en la model card, este modelo supera a Qwen3.5-35B-A3B en +3,92 de media en benchmarks de e-commerce y a MiniCPM-V-4.7-35B-A3B en +8,22, con una diferencia de +0,17 en benchmarks generales frente a Qwen3.5-35B-A3B. Los datos de contexto y de rendimiento detallado de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias
- Idiomas limitados a chino e inglés; no se declara soporte de castellano ni de otros idiomas.
- Especialización en e-commerce: el rendimiento en dominios generales es solo marginalmente superior al de Qwen3.5-35B-A3B (+0,17), por lo que no es la mejor opción para tareas generales fuera de ese ámbito.
- Riesgo de alucinación inherente a los modelos de lenguaje y visión-lenguaje, especialmente en la lectura de precios o atributos poco legibles en imágenes; conviene validar en producción.
- Los benchmarks citados son cifras de Tencent, no verificadas de forma independiente por el autor de la conversión; las tablas están en imágenes de la model card original.
- La cuantización a 6 bits introduce una pequeña desviación respecto al original (98,8 % de coincidencia en el siguiente token, KL media 0,0053); el build de 4 bits baja al 94,5 % de coincidencia.
- El formato MLX limita el despliegue a Apple Silicon; no es portable a GPU NVIDIA sin reconversión.
- La longitud de contexto no está documentada en la información disponible, lo que dificulta planificar cargas con historiales largos o muchas imágenes.
- Licencia Apache-2.0, que permite uso comercial, pero se debe conservar el fichero LICENSE de Tencent y el NOTICE con la atribución a Tencent y al equipo de Qwen.
- Modelo con muy pocas descargas (15) y ningún like en el momento de la consulta: ecosistema de validación todavía reducido.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/netprojects/WeMM-Ecom-35B-A3B-MLX-6bit
- Modelo base original: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Build de 8 bits: https://huggingface.co/netprojects/WeMM-Ecom-35B-A3B-MLX-8bit
- Build de 4 bits: https://huggingface.co/netprojects/WeMM-Ecom-35B-A3B-MLX-4bit
- Publicador NetProjects: https://netpr (enlace truncado en la información disponible)
