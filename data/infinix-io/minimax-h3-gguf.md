# Infinix-io/MiniMax-H3-GGUF

## Resumen

MiniMax-H3-GGUF es la colección de cuantizaciones en formato GGUF del modelo generativo omni-modal MiniMax-H3, publicada por el usuario Infinix-io (el contenido de la model card reproduce el trabajo original de Unsloth). El modelo base, desarrollado por MiniMax, es un sistema de generación de vídeo con audio estéreo nativo que produce clips de hasta 15 segundos a 24 FPS con audio de 32 kHz, generado conjuntamente con la imagen en lugar de añadirse a posteriori. Esta ficha se centra en los archivos GGUF, que permiten ejecutar el modelo en hardware de consumo mediante stable-diffusion.cpp y el ecosistema Unsloth.

El repositorio incluye las dos mitades del runtime: los denoisers y el codificador de texto Qwen3-VL que estos necesitan. H3 distribuye dos denoisers independientes —`fl2va_pruned`, para texto más cero, una o dos imágenes (primer y último fotograma), y `ref2va_pruned`, para texto más imágenes, vídeos y audio de referencia—. No son ajustes de un mismo checkpoint, sino pesos separados, por lo que la elección del denoiser determina qué entradas acepta el modelo.

La relevancia de esta publicación es práctica: el modelo base tiene 20.111.438.744 parámetros y el repositorio completo ocupa 212,2 GB, pero las cuantizaciones GGUF reducen el denoiser más pequeño a 6,22-6,26 GiB (Q2_K), lo que hace viable la inferencia en una sola GPU de consumo. Los pesos están pensados para `sd-cli` con backend de codificador de texto en CPU, y el proyecto advierte de tres flags obligatorios (`--mode vid_gen`, `--cfg-scale 1.0` y `--backend te=cpu`) sin los cuales la ejecución falla o toma la ruta equivocada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo generativo de difusion omni-modal (denoiser + codificador de texto Qwen3-VL); detalles internos del denoiser no disponibles |
| Parametros totales | 20.111.438.744 (según safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, UD-Q2_K_XL, Q3_K, UD-Q3_K_XL, Q4_K, Q5_0, Q6_K, Q8_0 (denoisers); Q2_K_M y Q4_K_M (codificador de texto) |
| Idiomas soportados | en, zh |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

MiniMax-H3 es un sistema generativo omni-modal que combina un denoiser de difusión con un codificador de texto basado en Qwen3-VL de 32B. El pipeline produce vídeo y audio estéreo de forma conjunta: el audio de 32 kHz forma parte de la salida del modelo, no es un post-proceso. El sistema se distribuye como dos checkpoints de denoiser separados según la tarea: `fl2va_pruned` (texto e imágenes de primer/último fotograma) y `ref2va_pruned` (texto con referencias de imagen, vídeo y audio). Ambos comparten el codificador de texto y los VAE.

La model card indica que H3 es un modelo destilado y libre de CFG (*cfg-free*), lo que se traduce en la necesidad de fijar `--cfg-scale 1.0` de forma explícita; con valores superiores el modelo aborta. Las cuantizaciones incluyen variantes uniformes (un único tipo de cuantización en todos los tensores) y variantes `UD-` de precisión mixta dinámica. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Los VAE no se incluyen en este repositorio y deben tomarse de Comfy-Org/MiniMax-H3.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio estéreo nativo.
- Generación de vídeo a partir de imagen (image-to-video) y de imagen más texto.
- Variante `fl2va_pruned`: condicionamiento por primer y último fotograma (zero, one or two frames).
- Variante `ref2va_pruned`: condicionamiento por imágenes, vídeos y audio de referencia.
- Generación conjunta de audio de 32 kHz estéreo sincronizado con el vídeo.
- Salida de hasta 15 segundos a 24 FPS.
- Soporte multilingüe limitado a inglés y chino.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso; no es un modelo de lenguaje conversacional.

## Casos de uso

- Prototipado rápido de clips publicitarios: con `fl2va_pruned` en Q2_K (6,26 GiB) se pueden generar vídeos de 960x544 a 24 FPS en una sola GPU de consumo, suficientes para validar guiones y composición antes de renderizar en calidad superior.
- Generación de vídeo con audio integrado para redes sociales: el modelo produce pista estéreo de 32 kHz junto a la imagen, lo que elimina el paso separado de diseño sonoro en clips cortos de hasta 15 segundos.
- Interpolación de fotogramas clave: la variante `fl2va_pruned` acepta primer y último fotograma, útil para generar transiciones entre dos imágenes fijas en flujos de animación o motion graphics.
- Estilización de vídeo existente: `ref2va_pruned` acepta vídeo y audio de referencia, lo que permite transferir estilo, paleta o ritmo de una pieza original a una nueva generación.
- Previsualización en estaciones de trabajo sin GPU de datacenter: las cuantizaciones Q2_K y Q3_K caben en GPUs de 8-12 GB, y con `--offload-to-cpu` el modelo puede ejecutarse en hardware aún más modesto.
- Integración en pipelines de stable-diffusion.cpp: el uso de `sd-cli` con `--mode vid_gen` permite encadenar la generación con otros pasos de un pipeline local basado en GGUF, compartiendo el codificador de texto entre tareas.
- Experimentación académica con modelos omni-modales: el repositorio expone los dos denoisers por separado con cuantizaciones equivalentes, lo que facilita comparar el comportamiento de condicionamiento por fotogramas frente a condicionamiento por referencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el denoiser: 6,22-6,26 GiB en Q2_K; 8,12-8,16 GiB en Q3_K; 10,60-10,64 GiB en Q4_K; 12,94-12,97 GiB en Q5_0; 15,42-15,45 GiB en Q6_K; 19,94-19,97 GiB en Q8_0.
- VRAM adicional para el codificador de texto: 12,20 GiB en Q2_K_M o 16,97 GiB en Q4_K_M. La model card recomienda ejecutarlo en CPU con `--backend te=cpu` para liberar la tarjeta.
- GPUs recomendadas: no se especifican modelos concretos. Por tamaño, Q2_K con codificador en CPU es viable en GPUs de consumo de 8-12 GB; Q8_0 requiere tarjetas de 24 GB o superiores.
- Ajuste en GPU de consumo: sí, mediante las cuantizaciones Q2_K y Q3_K y la opción `--offload-to-cpu`.
- Opciones de despliegue: stable-diffusion.cpp (`sd-cli --mode vid_gen`) y el ecosistema Unsloth. Los checkpoints PyTorch pre-cuantizados en FP8 están en unsloth/MiniMax-H3-FP8.
- Latencia y throughput: no disponibles. El ejemplo de la model card usa 8 pasos, guidance 1.0 y semilla 11 a 960x544 y 124 fotogramas en una sola tarjeta, sin cifras de tiempo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3 (GGUF) | 20.111.438.744 | no disponible | Vídeo hasta 15 s a 24 FPS con audio estéreo 32 kHz | minimax-h3-community-license-agreement | Hugging Face (GGUF y FP8) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La licencia MiniMax H3 Community License Agreement define un "Applicable Territory" y excluye algunas jurisdicciones; es imprescindible leerla antes de cualquier uso, especialmente comercial.
- Los archivos son Model Derivatives, no copias del original: el transformer y el codificador de texto están cuantizados, lo que altera la numerología y puede degradar la calidad respecto al modelo base.
- No es un producto oficial de MiniMax ni está respaldado por la empresa.
- Solo admite inglés y chino; no hay soporte documentado de otros idiomas.
- Riesgo de alucinación visual y sonora inherente a los modelos generativos; no se documentan sesgos específicos.
- El modelo es destilado y libre de CFG: usar `--cfg-scale` distinto de 1.0 provoca que aborte.
- Es obligatorio `--mode vid_gen`; en caso contrario el modelo toma la ruta de imagen y falla.
- Los VAE no están incluidos en este repositorio y deben descargarse por separado desde Comfy-Org/MiniMax-H3.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin histórico de validación por parte de la comunidad.
- El tamaño total del repositorio (212,2 GB) exige espacio de almacenamiento considerable si se descargan todas las cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Infinix-io/MiniMax-H3-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Preguntas frecuentes sobre la licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/docs/QA-about-License.md
- Checkpoints FP8: https://huggingface.co/unsloth/MiniMax-H3-FP8
- Repositorio GGUF de Unsloth: https://huggingface.co/unsloth/MiniMax-H3-GGUF
- VAE: https://huggingface.co/Comfy-Org/MiniMax-H3
- Unsloth: https://github.com/unslothai/unsloth/
- Clip de ejemplo: https://huggingface.co/unsloth/MiniMax-H3-GGUF/blob/main/assets/h3_gguf_ud_q2_k_xl.mp4
