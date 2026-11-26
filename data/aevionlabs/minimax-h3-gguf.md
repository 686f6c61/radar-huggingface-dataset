# aevionlabs/MiniMax-H3-GGUF

## Resumen

MiniMax-H3-GGUF es la versión cuantizada en formato GGUF del sistema generativo omni-modal MiniMax-H3, desarrollado por MiniMax y empaquetado por el usuario aevionlabs a partir del repositorio original MiniMaxAI/MiniMax-H3. El modelo produce vídeo con audio estéreo nativo de hasta 15 segundos a 24 FPS y 32 kHz, generando imagen y sonido de forma conjunta en lugar de añadir la pista de audio en un paso posterior. Con 20.111.438.744 parámetros en el checkpoint de safetensors, se distribuye como un conjunto de cuantizaciones que incluyen los denoisedores y el codificador de texto Qwen3-VL de 32B que ambos necesitan.

La relevancia de este repositorio reside en que permite ejecutar localmente un sistema de generación de vídeo con audio en hardware de consumo, gracias a cuantizaciones que van desde 6,22 GiB hasta casi 20 GiB por denoiser. El paquete está pensado para stable-diffusion.cpp y Unsloth, y separa dos checkpoints funcionalmente distintos: `fl2va_pruned` (texto más cero, una o dos imágenes, variante primer y último fotograma) y `ref2va_pruned` (texto más imágenes, vídeos y audio de referencia).

No es un modelo de lenguaje conversacional ni un LLM de propósito general: es un pipeline de difusión para vídeo con audio, y su uso requiere herramientas de inferencia específicas de generación de vídeo. La licencia es la MiniMax H3 Community License Agreement, que define un territorio aplicable y excluye determinadas jurisdicciones, por lo que conviene revisarla antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema generativo omni-modal de difusión con denoiser y codificador de texto Qwen3-VL; arquitectura interna del transformer no detallada en la información disponible |
| Parametros totales | 20.111.438.744 (checkpoint safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, UD-Q2_K_XL, Q3_K, UD-Q3_K_XL, Q4_K, Q5_0, Q6_K, Q8_0 (denoisers); Q2_K_M y Q4_K_M (codificador de texto) |
| Idiomas soportados | en, zh |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | GGUF (safetensors para los VAE, alojados en Comfy-Org/MiniMax-H3) |

## Arquitectura y entrenamiento

MiniMax-H3 es un sistema generativo omni-modal que combina un denoiser de difusión con un codificador de texto basado en Qwen3-VL de 32B parámetros. El repositorio incluye dos denoisedores independientes, no configuraciones del mismo checkpoint: `fl2va_pruned`, que acepta texto y de cero a dos fotogramas para la generación entre primer y último fotograma, y `ref2va_pruned`, que acepta texto junto con imágenes, vídeos y audio de referencia. Ambos comparten el codificador de texto y los VAE, de modo que cambiar de tarea solo requiere descargar el denoiser correspondiente.

El modelo está destilado y funciona sin classifier-free guidance: la escala CFG debe fijarse explícitamente en 1.0, ya que valores superiores provocan un aborto de la ejecución. La generación de audio es conjunta con la de vídeo, no un postprocesado, y produce estéreo a 32 kHz. Las cuantizaciones `UD-` son de precisión mixta dinámica, mientras que las uniformes mantienen un único tipo a lo largo del tensor. No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio estéreo nativo a 32 kHz.
- Generación de vídeo a partir de imagen (image-to-video), incluyendo la variante de primer y último fotograma.
- Generación condicionada por referencias multimodales: imágenes, vídeos y audio de referencia en el checkpoint `ref2va_pruned`.
- Producción de clips de hasta 15 segundos a 24 FPS.
- Generación conjunta de audio y vídeo en una sola pasada del modelo.
- Soporte de resolución variable, con ejemplos a 960x544 y 640x384.
- Capacidades multilingües limitadas a inglés y chino.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes ni razonamiento multi-paso, al no tratarse de un modelo de lenguaje conversacional.

## Casos de uso

- Generación de clips publicitarios cortos: el modelo produce vídeo de hasta 15 segundos con audio estéreo en una sola ejecución, lo que permite crear piezas para redes sociales sin pipeline de audio separado.
- Prototipado de animaciones a partir de un fotograma clave: con `fl2va_pruned` se puede interpolar entre una primera y una última imagen para previsualizar transiciones en producción audiovisual.
- Doblaje y reestilización con referencias: `ref2va_pruned` acepta audio e imágenes de referencia, útil para generar variaciones de una escena manteniendo la identidad visual o sonora.
- Previsualización de storyboards: a partir de texto e imágenes de referencia se generan clips de baja resolución (por ejemplo 640x384) con pocos pasos para validar ideas antes de una producción mayor.
- Generación local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q2_K y UD-Q2_K_XL, de alrededor de 6-7,5 GiB, permiten ejecutar el denoiser en tarjetas con VRAM moderada descargando el codificador de texto a CPU.
- Investigación en generación multimodal conjunta: el repositorio permite estudiar el comportamiento de un sistema que genera audio y vídeo de forma acoplada, comparando variantes de cuantización sobre el mismo codificador de texto.
- Creación de contenido educativo o divulgativo con audio sincronizado: clips cortos con sonido generado de forma nativa reducen el trabajo de postproducción en piezas explicativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el denoiser: entre aproximadamente 6,2 GiB (Q2_K) y 20 GiB (Q8_0), según la cuantización elegida.
- El codificador de texto Qwen3-VL de 32B ocupa 12,20 GiB en Q2_K_M y 16,97 GiB en Q4_K_M; el ejemplo oficial lo ejecuta en CPU con `--backend te=cpu` para no ocupar la GPU.
- Combinación mínima recomendada en el ejemplo: denoiser UD-Q2_K_XL (7,51 GiB) con codificador Q2_K_M en CPU.
- La opción `--offload-to-cpu` permite ajustar el modelo en GPUs con menos VRAM.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; el ejemplo se describe como ejecutable "en una sola tarjeta".
- Cabe en GPU de consumo con cuantizaciones bajas y descarga del codificador de texto a CPU, aunque no se detallan modelos concretos.
- Opciones de despliegue: stable-diffusion.cpp (`sd-cli --mode vid_gen`) y Unsloth; los VAE deben tomarse de Comfy-Org/MiniMax-H3.
- Latencia y throughput: no disponibles. El ejemplo usa 8 pasos a 960x544 y 124 fotogramas, o 4 pasos a 640x384 y 25 fotogramas, sin cifras de tiempo.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de generación de vídeo con audio. La comparación se limita a aspectos estructurales del propio repositorio:

| Modelo | Parametros | Contexto | Audio nativo | Licencia | Formato |
|---|---|---|---|---|---|
| MiniMax-H3 (este repo, GGUF) | 20.111.438.744 | no disponible | Sí, estéreo 32 kHz | MiniMax H3 Community License | GGUF |
| MiniMax-H3 (base, safetensors) | 20.111.438.744 | no disponible | Sí, estéreo 32 kHz | MiniMax H3 Community License | safetensors |
| MiniMax-H3-FP8 (unsloth) | no disponible | no disponible | Sí | MiniMax H3 Community License | FP8 |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia MiniMax H3 Community License Agreement define un territorio aplicable y excluye algunas jurisdicciones; es imprescindible leerla antes de cualquier uso comercial.
- Los archivos son derivados del modelo (transformers y codificador de texto cuantizados), lo que altera la numerica respecto al original; no es un producto oficial de MiniMax ni está respaldado por MiniMax.
- El modelo solo soporta inglés y chino; el rendimiento en otros idiomas no está documentado.
- Está destilado y funciona sin CFG: usar una escala distinta de 1.0 provoca un aborto, lo que limita el ajuste fino del equilibrio entre prompt y creatividad.
- Requiere el flag `--mode vid_gen` en stable-diffusion.cpp; en caso contrario toma la ruta de imagen y falla.
- El repositorio no incluye los VAE, que deben descargarse por separado desde Comfy-Org/MiniMax-H3.
- El codificador de texto de 32B añade una carga de memoria considerable (12-17 GiB) que en la práctica obliga a ejecutarlo en CPU o a descargarlo.
- Riesgo de alucinación visual y de artefactos en la generación de vídeo y audio; no se documentan evaluaciones cuantitativas de fidelidad.
- No se han publicado datos sobre sesgos del modelo en la información disponible.
- Duración máxima de 15 segundos y 24 FPS, lo que limita su uso en producciones de mayor longitud sin concatenación.

## Enlaces

- Repositorio GGUF: https://huggingface.co/aevionlabs/MiniMax-H3-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Preguntas frecuentes sobre la licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/docs/QA-about-License.md
- Checkpoints FP8: https://huggingface.co/unsloth/MiniMax-H3-FP8
- Repositorio GGUF de Unsloth: https://huggingface.co/unsloth/MiniMax-H3-GGUF
- VAE: https://huggingface.co/Comfy-Org/MiniMax-H3
- Unsloth: https://github.com/unslothai/unsloth/
- Clip de ejemplo: https://huggingface.co/unsloth/MiniMax-H3-GGUF/blob/main/assets/h3_gguf_ud_q2_k_xl.mp4
