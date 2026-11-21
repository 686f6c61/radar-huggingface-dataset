# Mario-2026/MiniMax-H3-GGUF

## Resumen

MiniMax-H3 es un sistema generativo omnicanal desarrollado por MiniMax que produce vídeo con audio estéreo nativo, hasta 15 segundos a 24 FPS con audio estéreo a 32 kHz. El modelo genera imagen y audio de forma conjunta, de modo que la pista sonora forma parte de la salida del modelo y no se añade en un posproceso. Esta ficha cubre la cuantización GGUF publicada por el usuario Mario-2026, derivada del repositorio oficial MiniMaxAI/MiniMax-H3 y pensada para ejecución local en hardware de consumo.

El repositorio incluye las dos mitades del runtime: los denoisers y el codificador de texto Qwen3-VL que ambos necesitan. H3 distribuye dos denoisers independientes: `fl2va_pruned`, variante de primer y último fotograma que acepta texto más cero, uno o dos fotogramas, y `ref2va_pruned`, variante de referencia que acepta texto más imágenes, vídeos y audio de referencia. No son ajustes del mismo checkpoint, sino pesos separados, por lo que la elección del denoiser determina qué entradas admite el modelo.

La relevancia de esta publicación es práctica: permite ejecutar un modelo de generación de vídeo con audio en formato GGUF mediante stable-diffusion.cpp y el ecosistema Unsloth, con cuantizaciones que van desde 6,22 GiB hasta 19,97 GiB por denoiser, más un codificador de texto de 12,20 o 16,97 GiB. El repositorio completo ocupa 212,2 GB e incluye 20.111.438.744 parámetros según los safetensors del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema generativo multimodal con denoiser de difusión y codificador de texto Qwen3-VL; detalles internos del denoiser no disponibles |
| Parametros totales | 20.111.438.744 (dato de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, UD-Q2_K_XL, Q3_K, UD-Q3_K_XL, Q4_K, Q5_0, Q6_K, Q8_0 (denoisers); Q2_K_M y Q4_K_M (codificador de texto) |
| Idiomas soportados | en, zh |
| Licencia | MiniMax H3 Community License Agreement (license: other) |
| Formato de pesos | GGUF; VAEs en safetensors (fp16 para vídeo, fp32 para audio) |

## Arquitectura y entrenamiento

MiniMax-H3 se compone de dos bloques funcionales. Por un lado, un denoiser de difusión que genera el vídeo y el audio de forma conjunta; por otro, un codificador de texto basado en Qwen3-VL de 32B que procesa las instrucciones y, en la variante de referencia, también las imágenes, vídeos y audio de entrada. El modelo emplea decodificación libre de CFG (cfg-free), ya que está destilado: la escala de guía debe fijarse explícitamente en 1.0 y el sistema aborta con valores superiores. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovación técnica principal es la generación conjunta de vídeo y audio estéreo a 32 kHz, con una salida de hasta 15 segundos a 24 FPS. La separación en dos denoisers (`fl2va_pruned` y `ref2va_pruned`) permite especializar los pesos según la tarea: generación condicionada por primer y último fotograma, o generación condicionada por referencias multimodales. Las cuantizaciones `UD-` son builds dinámicos de precisión mixta, mientras que las variantes uniformes mantienen un único tipo en todo el modelo. El codificador de texto y los VAE son compartidos entre ambos denoisers, de modo que cambiar de tarea solo requiere descargar el denoiser correspondiente.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio estéreo nativo generado conjuntamente.
- Generación de vídeo a partir de imagen (image-to-video) y de texto más imagen (image-text-to-video).
- Variante `fl2va_pruned`: condicionamiento por primer y último fotograma, con cero, uno o dos fotogramas de entrada.
- Variante `ref2va_pruned`: condicionamiento por imágenes, vídeos y audio de referencia.
- Salida de hasta 15 segundos a 24 FPS con audio estéreo a 32 kHz.
- Soporte de resolución variable, con ejemplo documentado a 960x544 y a 640x384.
- Generación con pocos pasos de muestreo (4 u 8 pasos en los ejemplos documentados) gracias a la destilación.
- Capacidades multilingües limitadas a inglés y chino.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso orientado a agentes.

## Casos de uso

- Prototipado de clips publicitarios: generar piezas de hasta 15 segundos con audio sincronizado a partir de un prompt descriptivo, usando `fl2va_pruned` con resolución 960x544 y 8 pasos para obtener un primer corte antes de invertir en renderizado de mayor calidad.
- Animación de ilustraciones e imágenes fijas: emplear `fl2va_pruned` con un fotograma inicial para convertir arte conceptual en vídeo breve, útil en previsualización de storyboards.
- Transferencia de estilo y referencia: usar `ref2va_pruned` con imágenes o vídeos de referencia para mantener coherencia visual entre planos de una misma secuencia.
- Doblaje y diseño sonoro automatizado: aprovechar la generación conjunta de audio estéreo a 32 kHz para producir clips con banda sonora integrada sin pasar por una herramienta de audio separada.
- Iteración local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q2_K y UD-Q2_K_XL, de 6,26 y 7,51 GiB, permiten probar prompts en una sola tarjeta antes de escalar a un despliegue mayor.
- Investigación en generación multimodal: el repositorio separa denoiser, codificador de texto y VAE, lo que facilita experimentar con sustituciones de componentes y medir el impacto en la calidad de vídeo y audio.
- Evaluación de cuantizaciones: comparar las variantes uniformes y dinámicas sobre el mismo prompt y semilla para estudiar la degradación introducida por cada nivel de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el denoiser: entre 6,22 y 7,51 GiB en Q2_K y UD-Q2_K_XL, hasta 19,94-19,97 GiB en Q8_0.
- El codificador de texto añade 12,20 GiB (Q2_K_M) o 16,97 GiB (Q4_K_M); la documentación recomienda `--backend te=cpu` para mantenerlo fuera de la GPU.
- Combinación mínima documentada: denoiser UD-Q2_K_XL (7,51 GiB) con codificador Q2_K_M (12,20 GiB); con el codificador en CPU, la GPU solo debe alojar el denoiser y los VAE.
- La opción `--offload-to-cpu` permite ajustar el modelo en GPUs más pequeñas a costa de latencia.
- No se especifican modelos de GPU concretos (A100, H100, RTX 4090) en la información disponible.
- Despliegue mediante stable-diffusion.cpp (`sd-cli --mode vid_gen`) y el ecosistema Unsloth; también existen checkpoints PyTorch pre-cuantizados en FP8 en unsloth/MiniMax-H3-FP8.
- No se documentan cifras de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3 (GGUF, esta ficha) | 20.111.438.744 | no disponible | Vídeo hasta 15 s a 24 FPS con audio estéreo 32 kHz | MiniMax H3 Community License | GGUF en HF, FP8 en HF |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en el material proporcionado.

## Limitaciones y advertencias

- La licencia MiniMax H3 Community License Agreement define un "Applicable Territory" y excluye algunas jurisdicciones; debe leerse antes de cualquier uso, especialmente comercial.
- Los archivos son Model Derivatives, no copias del original: el transformer y el codificador de texto están cuantizados y cambian la numerica, tal como exige la sección III de la licencia.
- No es un producto oficial de MiniMax ni está respaldado por MiniMax.
- El modelo solo soporta inglés y chino; no se documenta cobertura de castellano.
- Riesgo de alucinación visual y sonora inherente a los modelos generativos: pueden aparecer artefactos, incoherencias temporales o audio desincronizado.
- Sesgos conocidos: no documentados en la información disponible.
- La escala de guía debe ser exactamente 1.0; valores superiores provocan aborto por el diseño cfg-free del modelo destilado.
- Es obligatorio usar `--mode vid_gen`; de lo contrario, el modelo toma la ruta de imagen y falla.
- Las cuantizaciones más agresivas (Q2_K, UD-Q2_K_XL) degradan la fidelidad respecto a Q8_0; la elección del nivel debe validarse con prompts representativos.
- El repositorio completo ocupa 212,2 GB, por lo que conviene descargar solo el denoiser, el codificador y los VAE necesarios.
- Los VAE no se incluyen en este repositorio y deben obtenerse de Comfy-Org/MiniMax-H3.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Mario-2026/MiniMax-H3-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Preguntas frecuentes sobre la licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/docs/QA-about-License.md
- Checkpoints FP8: https://huggingface.co/unsloth/MiniMax-H3-FP8
- VAE: https://huggingface.co/Comfy-Org/MiniMax-H3
- Unsloth: https://github.com/unslothai/unsloth/
- Clip de ejemplo: https://huggingface.co/unsloth/MiniMax-H3-GGUF/blob/main/assets/h3_gguf_ud_q2_k_xl.mp4
