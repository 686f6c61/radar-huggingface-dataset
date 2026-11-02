# RenderBob3/ltx-video-2b-0.9.6-distilled-mlx

## Resumen

LTX-Video 2B 0.9.6 distilled MLX es una conversión no oficial del modelo de generación de vídeo a partir de imagen de Lightricks, empaquetada específicamente para su uso local en Macs con Apple Silicon mediante el motor MLX de la aplicación RenderBob 3. El repositorio, publicado por el usuario RenderBob3, contiene los pesos del transformer de vídeo y del VAE en bfloat16 junto con el codificador de texto T5 v1.1 XXL cuantizado a 8 y 4 bits, además de los ficheros de configuración necesarios para el motor de RenderBob.

El modelo subyacente es la variante distilled de 2.000 millones de parámetros de LTX-Video 0.9.6, publicada por Lightricks en abril de 2025. La destilación reduce el número de pasos de muestreo necesarios (el repositorio incluye una programación de 8 pasos), lo que abarata la inferencia en hardware de consumo. La conversión a MLX permite ejecutar el pipeline de image-to-video en la GPU unificada de los chips M-series, un entorno que hasta ahora quedaba fuera del alcance de las herramientas CUDA habituales.

Es relevante porque ofrece una vía práctica para generar vídeo corto a partir de una imagen en equipos locales sin GPU NVIDIA, a cambio de asumir que los ficheros no son intercambiables con otras herramientas y que la licencia de los pesos impone restricciones comerciales. El tamaño total del repositorio es de 15,5 GB, aunque una instalación completa ocupa entre 9,8 y 12,1 GB según la cuantización del codificador de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para vídeo (LTX-Video) con VAE y codificador de texto T5 v1.1 XXL; empaquetado para MLX |
| Parametros totales | 2.000 millones (variante 2B del checkpoint base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos del transformer y VAE en bfloat16; codificador T5 con capas lineales en 8 bits y en 4 bits (cuantización afín, group size 64) |
| Idiomas soportados | No disponible (el prompt textual se procesa con T5 v1.1 XXL; el autor no documenta cobertura idiomática) |
| Licencia | LTXV Open Weights License 0.X (pesos LTX-Video); Apache 2.0 (codificador T5 y vocabulario) |
| Formato de pesos | safetensors (MLX), más `vocab.txt`, `model.json`, `schedule.json`, `decoder.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusión para generación de vídeo de 2.000 millones de parámetros, en su variante distilled de la versión 0.9.6 de LTX-Video. La destilación reduce el número de pasos de muestreo: el repositorio incluye `schedule.json` con una programación de 8 pasos extraída de la configuración del scheduler del checkpoint original. El pipeline es image-to-video: el VAE codifica la imagen de entrada y el transformer genera los fotogramas condicionado por el texto procesado por T5 v1.1 XXL.

La conversión realizada por RenderBob renombra y reorganiza los tensores del transformer y del VAE para MLX sin alterar sus valores (bfloat16). El codificador de texto se cuantiza por separado: las capas lineales usan cuantización afín con group size 64, mientras que embeddings, normas y el sesgo de atención relativo quedan sin cuantizar. Según el autor, el codificador de 8 bits mantiene una similitud coseno de 0,9999 con el encoder float32 original en una prueba con un prompt, mientras que el de 4 bits baja a 0,98. No se documentan en la información disponible los datos de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO).

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video), con condicionamiento textual mediante T5 v1.1 XXL.
- Muestreo en 8 pasos gracias a la variante distilled, lo que reduce el coste computacional por generación.
- Ejecución local en Apple Silicon mediante MLX, con pesos en bfloat16 para el transformer y el VAE.
- Dos niveles de cuantización del codificador de texto (8 y 4 bits) para ajustar el uso de memoria.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-step.
- No se documentan capacidades de audio, visión general más allá del acondicionamiento por imagen, ni modo thinking.
- Cobertura multilingüe no documentada.

## Casos de uso

- Previsualización rápida de animaciones: un artista puede convertir un fotograma conceptual en un clip corto en un Mac con Apple Silicon, usando la programación de 8 pasos para iterar sobre variantes sin depender de un servicio en la nube.
- Prototipado de storyboards: convertir viñetas estáticas en secuencias animadas breves para presentar una idea a un cliente antes de producir el vídeo final con herramientas de mayor calidad.
- Generación de material para redes sociales: crear clips cortos a partir de una imagen de producto o de un personaje, con el condicionamiento textual de T5 para dirigir el movimiento y el estilo.
- Pruebas de concepto en investigación sobre difusión de vídeo: el empaquetado MLX permite experimentar con el modelo distilled en un portátil Apple sin acceso a GPUs CUDA, comparando el efecto de la cuantización 8 vs 4 bits del encoder.
- Integración en flujos de trabajo de la aplicación RenderBob 3: el modelo está pensado para que la app descargue los ficheros y los use con su motor MLX, de modo que sirve como motor de generación dentro de ese producto.
- Docencia y demostraciones: ejecutar un pipeline de image-to-video completo en hardware de consumo facilita explicar el funcionamiento del VAE, el encoder de texto y el scheduler en un aula o taller.
- Automatización de contenido editorial: generar clips de relleno o transiciones a partir de imágenes fijas en un pipeline local, siempre que el uso encaje en los términos de la licencia LTXV.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta la similitud coseno del codificador de texto cuantizado frente al original en float32: 0,9999 para 8 bits y 0,98 para 4 bits, sobre una prueba con un único prompt.

## Requisitos de hardware

- VRAM/espacio unificado estimado: una instalación completa ocupa unos 12,1 GB con el encoder T5 de 8 bits y unos 9,8 GB con el de 4 bits. El transformer y el VAE suman 6,34 GB en bfloat16; el T5 cuantizado, 5,74 GB (8 bits) o 3,42 GB (4 bits).
- Hardware objetivo: Macs con Apple Silicon (GPU unificada) mediante MLX. El autor no documenta requisitos mínimos de memoria unificada; por el tamaño de los ficheros, se necesita un equipo con al menos 16 GB de memoria unificada para una instalación con el encoder de 8 bits, y margen adicional para el estado de inferencia y los fotogramas generados.
- GPU NVIDIA: no aplicable; el empaquetado es específico para MLX y no es un reemplazo directo del checkpoint original en otras herramientas.
- Opciones de despliegue: aplicación RenderBob 3 con su motor MLX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no a este pipeline de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-Video 2B 0.9.6 distilled MLX (este repo) | 2.000 M | No disponible | Image-to-video | LTXV Open Weights 0.X + Apache 2.0 (T5) | HuggingFace, conversión no oficial para MLX |
| Lightricks/LTX-Video (original) | 2.000 M (variante 0.9.6) | No disponible | Image-to-video y text-to-video | LTXV Open Weights 0.X | HuggingFace, checkpoint oficial |
| Otros modelos de vídeo open weights de tamaño comparable | No disponible | No disponible | Generación de vídeo | No disponible | No disponible |

No se dispone en la información proporcionada de datos de rendimiento comparativo con otras alternativas, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Conversión no oficial: los ficheros están reorganizados para el motor MLX de RenderBob y no son un reemplazo directo del checkpoint original en otras herramientas.
- Licencia restrictiva: los pesos de LTX-Video se rigen por la LTXV Open Weights License 0.X, con restricciones de uso en el Anexo A. Las entidades con ingresos anuales de al menos 10.000.000 USD necesitan una licencia comercial separada de Lightricks (ltxv-licensing@lightricks.com).
- El codificador T5 se distribuye bajo Apache 2.0, pero esa licencia no cubre los pesos del transformer ni del VAE.
- La cuantización a 4 bits del encoder introduce desviación respecto al original (similitud coseno 0,98 frente a 0,9999 en 8 bits), lo que puede afectar a la fidelidad del condicionamiento textual.
- No se documentan sesgos, tasas de alucinación visual ni limitaciones idiomáticas del modelo base en la información disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria documentada.
- No se documentan requisitos mínimos de memoria ni tiempos de generación, lo que dificulta planificar el despliegue en producción.
- El modelo base está etiquetado como versión 0.9.6, lo que indica un estado previo a la versión estable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RenderBob3/ltx-video-2b-0.9.6-distilled-mlx
- Modelo original: https://huggingface.co/Lightricks/LTX-Video
- Licencia LTXV Open Weights 0.X: https://huggingface.co/Lightricks/LTX-Video/blob/main/LTX-Video-Open-Weights-License-0.X.txt
