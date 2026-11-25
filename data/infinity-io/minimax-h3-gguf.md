# Infinity-io/MiniMax-H3-GGUF

## Resumen

MiniMax-H3 es un sistema generativo omni-modal desarrollado por MiniMax que produce vídeo con audio estéreo nativo, hasta 15 segundos a 24 FPS y audio estéreo de 32 kHz. El modelo combina un denoiser de difusión con un codificador de texto basado en Qwen3-VL de 32.000 millones de parámetros, generando audio y vídeo de forma conjunta en lugar de añadir la pista de sonido en un posproceso. Esta ficha describe la cuantización GGUF publicada por Infinity-io (con material de referencia de Unsloth) del modelo base MiniMaxAI/MiniMax-H3, que suma 20.111.438.744 parámetros en su checkpoint safetensors.

El repositorio incluye dos denoisers independientes y no intercambiables en tiempo de ejecución: `fl2va_pruned`, orientado a texto más cero, una o dos imágenes (primer y último fotograma), y `ref2va_pruned`, orientado a texto más imágenes, vídeos y audio de referencia. Ambos se cuantizan a los mismos niveles, de modo que un nivel de cuantización dado ocupa un tamaño similar en cualquiera de las dos variantes. El codificador de texto y los VAE son compartidos, por lo que cambiar de denoiser solo requiere descargar el checkpoint correspondiente.

La relevancia de esta publicación radica en que permite ejecutar localmente un modelo de generación de vídeo con audio en GPUs de consumo mediante cuantizaciones GGUF, usando `stable-diffusion.cpp` como runtime. El nivel más pequeño (`UD-Q2_K_XL`, 7,51 GiB) funciona en una sola tarjeta con el codificador de texto desplazado a CPU. La licencia es la MiniMax H3 Community License Agreement, que restringe el territorio de uso y exige declarar las modificaciones numéricas de los derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema omni-modal de difusión (denoiser) con codificador de texto Qwen3-VL; dos checkpoints de denoiser (`fl2va_pruned`, `ref2va_pruned`) |
| Parametros totales | 20.111.438.744 (checkpoint safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, UD-Q2_K_XL, Q3_K, UD-Q3_K_XL, Q4_K, Q5_0, Q6_K, Q8_0 (denoisers); Q2_K_M, Q4_K_M (codificador de texto) |
| Idiomas soportados | en, zh |
| Licencia | minimax-h3-community-license-agreement (other) |
| Formato de pesos | GGUF (repo de 212,2 GB); checkpoints PyTorch FP8 en unsloth/MiniMax-H3-FP8 |

## Arquitectura y entrenamiento

MiniMax-H3 es un sistema generativo omni-modal compuesto por dos mitades en tiempo de ejecución: los denoisers de difusión y el codificador de texto Qwen3-VL de 32.000 millones de parámetros que ambos comparten. El modelo genera vídeo y audio de forma conjunta, con audio estéreo nativo a 32 kHz, lo que implica que la pista de sonido forma parte de la salida del modelo y no se añade después. La generación alcanza hasta 15 segundos a 24 FPS.

Los dos denoisers son checkpoints separados, no ajustes de configuración. `fl2va_pruned` acepta texto más cero, una o dos imágenes (variante de primer y último fotograma, H3-Base), mientras que `ref2va_pruned` acepta texto más imágenes, vídeos y audio de referencia. El modelo está destilado y es libre de CFG (classifier-free guidance): el runtime aborta si `--cfg-scale` supera 1.0, y el valor por defecto de la herramienta (7.0) debe sobrescribirse explícitamente. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio estéreo nativo generado conjuntamente.
- Generación de vídeo a partir de imagen (image-to-video), incluyendo la variante de primer y último fotograma (`fl2va_pruned`).
- Generación condicionada por referencias multimodales: imágenes, vídeos y audio de referencia (`ref2va_pruned`).
- Salida de vídeo de hasta 15 segundos a 24 FPS con audio estéreo a 32 kHz.
- Codificación de texto multimodal mediante Qwen3-VL de 32.000 millones de parámetros (comprensión de texto e imagen).
- Soporte multilingüe limitado a inglés y chino.
- Ejecución local mediante `stable-diffusion.cpp` y compatibilidad declarada con Unsloth.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Prototipado rápido de clips publicitarios: con el denoiser `fl2va_pruned` en `UD-Q2_K_XL` (7,51 GiB) se pueden generar clips de 960x544 y 124 fotogramas a 24 FPS en una sola GPU, suficientes para validar guiones y ritmo antes de producir en alta calidad.
- Generación de vídeo con audio sincronizado para redes sociales: al producir audio estéreo nativo a 32 kHz de forma conjunta, se evitan pasos separados de foley o doblaje en piezas cortas de hasta 15 segundos.
- Interpolación de primer y último fotograma en posproducción: la variante `fl2va_pruned` acepta dos imágenes y genera la transición intermedia, útil para crear planos de relleno entre tomas fijas.
- Estilización y transferencia con referencias: la variante `ref2va_pruned` permite condicionar la generación con imágenes, vídeos o audio de referencia, adecuada para mantener coherencia visual o sonora en una serie de clips.
- Generación de material de previsualización en estudios pequeños: las cuantizaciones Q4_K (10,64 GiB) y Q5_0 (12,97 GiB) caben en GPUs de consumo de gama alta, lo que permite iterar localmente sin depender de servicios en la nube.
- Investigación en generación multimodal conjunta: al estar disponibles los pesos GGUF y el codificador de texto por separado, se pueden estudiar los efectos de la cuantización en la calidad de vídeo y audio, así como el comportamiento del modelo destilado sin CFG.
- Despliegue en entornos con requisitos de privacidad: la ejecución local con `stable-diffusion.cpp` y el desplazamiento del codificador de texto a CPU (`--backend te=cpu`) permiten procesar material sensible sin enviarlo a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el denoiser: desde 6,22 GiB (`ref2va_pruned-Q2_K`) o 6,26 GiB (`fl2va_pruned-Q2_K`) hasta 19,97 GiB (`fl2va_pruned-Q8_0`) o 19,94 GiB (`ref2va_pruned-Q8_0`).
- Codificador de texto: 12,20 GiB (`qwen3vl_32b_minimax_h3-Q2_K_M`) o 16,97 GiB (`qwen3vl_32b_minimax_h3-Q4_K_M`). El autor recomienda emparejar `Q2_K_M` con los dos denoisers más pequeños y `Q4_K_M` con el resto.
- VAE: no incluidos en el repo; deben tomarse de Comfy-Org/MiniMax-H3 (`minimax_h3_video_vae_fp16.safetensors` y `minimax_h3_audio_vae_fp32.safetensors`).
- Estrategia de memoria: el flag `--backend te=cpu` mantiene el codificador de texto de 12 GB fuera de la GPU; `--offload-to-cpu` permite ajustar en GPUs más pequeñas.
- Ejemplo del autor: `UD-Q2_K_XL` a 960x544, 124 fotogramas, 24 FPS, 8 pasos, guidance 1.0, semilla 11, en una sola tarjeta.
- GPUs recomendadas: no disponible de forma explícita; el ejemplo de una sola tarjeta con `UD-Q2_K_XL` sugiere GPUs de consumo de gama alta o superior, pero no se especifica el modelo.
- Opciones de despliegue: `stable-diffusion.cpp` (`sd-cli --mode vid_gen`) y Unsloth; no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de generación de vídeo con audio que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El modelo está destilado y es libre de CFG: el runtime aborta si `--cfg-scale` supera 1.0, y el valor por defecto de `sd-cli` es 7.0, por lo que es obligatorio pasar `--cfg-scale 1.0` explícitamente.
- Es obligatorio usar `--mode vid_gen`; en caso contrario, H3 toma la ruta de imagen y aborta.
- Los dos denoisers son checkpoints separados: `fl2va_pruned` no acepta referencias de vídeo o audio, y `ref2va_pruned` no implementa la variante de primer y último fotograma. No son intercambiables como ajustes.
- Idiomas soportados limitados a inglés y chino; no se documenta soporte de castellano.
- Licencia MiniMax H3 Community License Agreement: define un Territorio Aplicable y excluye algunas jurisdicciones. Es imprescindible leer el texto completo y el documento de preguntas y respuestas sobre la licencia antes de cualquier uso comercial.
- Los archivos son Model Derivatives, no copias: la cuantización del transformer y del codificador de texto altera la numerología. La sección III de la licencia exige declararlo, y el archivo `NOTICE` lista cada cambio y la atribución.
- No es un producto oficial de MiniMax ni está respaldado por MiniMax.
- No se dispone de información sobre sesgos, riesgo de alucinación visual o sonora, ni sobre límites de contexto en la documentación proporcionada.
- El repo ocupa 212,2 GB, aunque cada nivel de cuantización individual es mucho menor; conviene descargar solo los archivos necesarios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Infinity-io/MiniMax-H3-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Preguntas y respuestas sobre la licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/docs/QA-about-License.md
- Checkpoints PyTorch FP8: https://huggingface.co/unsloth/MiniMax-H3-FP8
- VAE (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3
- Unsloth: https://github.com/unslothai/unsloth/
- Clip de ejemplo a resolución completa: https://huggingface.co/unsloth/MiniMax-H3-GGUF/blob/main/assets/h3_gguf_ud_q2_k_xl.mp4
- NOTICE de cambios y atribución: https://huggingface.co/unsloth/MiniMax-H3-GGUF/blob/main/NOTICE
