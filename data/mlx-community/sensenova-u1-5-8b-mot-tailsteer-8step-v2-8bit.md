# mlx-community/SenseNova-U1.5-8B-MoT-TailSteer-8step-v2-8bit

## Resumen
SenseNova-U1.5-8B-MoT-TailSteer-8step-v2-8bit es la conversión al formato MLX (Apple Silicon) del checkpoint TailSteer de SenseTime, un ajuste fino de etapa final sobre el modelo multimodal unificado SenseNova-U1.5-8B-MoT. El modelo original combina generación texto-a-imagen (T2I), edición de imagen y respuesta visual a preguntas (VQA) en una única arquitectura NEO-unify de tipo Mixture-of-Transformers con rectified flow en espacio de píxeles y sin VAE. TailSteer aborda un problema concreto: la deriva acumulativa que aparece en sesiones de edición encadenada, donde la salida de cada edición se convierte en la entrada de la siguiente.

Este artefacto concreto, publicado por la comunidad mlx-community, integra el LoRA oficial de destilación a 8 pasos (V2) en el flujo de generación y aplica cuantización de 8 bits con grupo de 64 sobre los pesos resultantes. El resultado es un modelo de 17.532.854.464 parámetros almacenados (unos 19,9 GB en repositorio) que cabe en memoria unificada de Apple Silicon y se ejecuta con el runtime MLX-Swift `sensenova-u1-swift`. Es relevante ahora porque demuestra que la preservación multi-turno de un modelo de edición puede mantenerse tras cuantización de 8 bits, algo que según las mediciones del autor no ocurre con 4 bits.

La propuesta de valor es acotada y explícita: debe usarse en sesiones de edición donde cada resultado se vuelve a editar. Para T2I de un solo paso o ediciones únicas, el artefacto hermano sin TailSteer es equivalente y es el valor por defecto medido. El modo thinking sigue siendo una característica de la familia base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | NEO-unify Mixture-of-Transformers (multimodal nativa, rectified flow en espacio de píxeles, sin VAE) |
| Parámetros totales | 17.532.854.464 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits con grupo de 64 (convención MLX); se documenta que la receta no sobrevive a 4 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (layout del runtime MLX-Swift: convoluciones NHWC, lineales cuantizadas como `weight`/`scales`/`biases`) |

## Arquitectura y entrenamiento
El modelo base es un Mixture-of-Transformers multimodal nativo que unifica comprensión y generación en un único modelo, sin encoder de texto separado ni VAE para el flujo de imagen. La generación emplea rectified flow directamente en espacio de píxeles. TailSteer es un ajuste fino completo del modelo base (2.000 actualizaciones, checkpoint `d6dc59d`), entrenado sobre imágenes de Open Images y MONET según la model card del dataset de origen, y su objetivo es reducir la deriva acumulada en cadenas de edición.

Sobre ese checkpoint, este artefacto aplica el LoRA oficial de destilación a 8 pasos V2 (fichero `SenseNova-U1.5-8B-MoT-LoRA-8step-V2.safetensors`, sha256 `f4190cabd01fa261a45be853275c483d3a8069295c52cf01f7b2b31f4356f201`), fusionado como W += (α/r)·BA sobre las 294 proyecciones del flujo de generación. Después se cuantiza a 8 bits con grupo 64. El autor advierte que el adaptador V2 se entrenó sobre el modelo base y que el emparejamiento con TailSteer no está documentado por el equipo upstream, por lo que las mediciones presentadas son propias. La destilación permite inferencia en 8 pasos con cfg 1.

## Capacidades
- Generación texto-a-imagen en espacio de píxeles con 8 pasos de muestreo y cfg 1.
- Edición de imagen guiada por instrucción, incluyendo edición encadenada multi-turno con preservación del contenido fuera de la caja de edición.
- Respuesta visual a preguntas (VQA) mediante el flujo de comprensión del modelo, aunque las respuestas no son idénticas token a token respecto a la variante base.
- Modalidad any-to-any según el pipeline declarado en Hugging Face.
- Modo thinking: no disponible en este artefacto; se indica que sigue siendo una característica de la familia base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso
- Sesiones de edición iterativa de producto: el modelo mantiene la coherencia fotográfica a lo largo de cadenas de hasta 20 ediciones, donde la variante base colapsa en textura tipo laberinto hacia el turno 10; útil para retocar una misma imagen comercial en pasos sucesivos.
- Restauración y modificación de fotografías con preservación de fondo: las métricas fuera de la caja de edición (PSNR 17,96 y SSIM 0,524 en el turno 10) lo hacen adecuado para flujos donde el sujeto cambia pero el entorno debe permanecer intacto.
- Prototipado en Mac con Apple Silicon: al estar en formato MLX y ocupar unos 22,4 GB de pico en M5 Max según el artefacto hermano, permite desarrollo local sin GPU dedicada.
- Generación de variaciones de imagen con composición estable: 5 de 5 prompts T2I mantienen su composición respecto a la variante base con semilla fija, útil para generar alternativas de una misma escena.
- Edición por instrucción en un solo paso dentro de pipelines: 6 de 6 ediciones de instrucción se aplican correctamente con semilla fija, lo que sirve para tareas de sustitución de objetos o cambios de color.
- Evaluación de investigación sobre deriva multi-turno: el modelo sirve como referencia reproducible para estudiar la degradación acumulada en modelos de edición, con el benchmark Add & Preserve y la cadena `cafe-20turn`.

## Benchmarks y rendimiento

Preservación multi-turno en un subconjunto de Add & Preserve (8 imágenes × 10 ediciones encadenadas de añadir objeto, métricas fuera de la caja de edición, turno 10, 8 pasos, cfg 1):

| Métrica (turno 10, fuera de la caja) | 8step-v2-8bit (base) | Este artefacto |
|---|---:|---:|
| PSNR ↑ | 15,87 | 17,96 |
| SSIM ↑ | 0,404 | 0,524 |
| LPIPS ↓ | 0,455 | 0,413 |

- PSNR mejor en 8 de 8 imágenes en el turno 10; LPIPS mejor en 5 de 8.
- LPIPS ligeramente peor que la variante base hasta el turno 5 (0,157 frente a 0,122 en el turno 1).
- En la cadena libre de 20 turnos `cafe-20turn`, la variante base colapsa hacia el turno 10; este artefacto se mantiene fotográfico hasta el turno 20, con texto fino algo más suave.
- Comportamiento de un solo turno cercano a la variante base con semilla fija: 6 de 6 ediciones de instrucción y 5 de 5 prompts T2I conservan composición; los renders son algo más suaves (gradiente del percentil 99 aproximadamente un 15 % menor).
- Una construcción a 4 bits de la misma receta gana 0,5 dB en el turno 10 y colapsa en la cadena de 20 turnos como la base; por eso no se publica artefacto TailSteer a 4 bits.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM/memoria unificada estimada: unos 22,4 GB de pico para 1024² en el artefacto hermano de mismo tamaño y arquitectura; no se midió específicamente para este artefacto.
- GPU recomendadas: no disponible para CUDA; el artefacto está pensado para Apple Silicon vía MLX. Las mediciones se hicieron en un M5 Max.
- Cabe en GPU de consumo: no hay datos para GPUs NVIDIA; en Apple Silicon requiere memoria unificada suficiente para ~22,4 GB de pico.
- Opciones de despliegue: runtime `sensenova-u1-swift` (MLX-Swift) con la CLI `sensenova-cli`; no se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: 3,3 s para 1024² en M5 Max según el artefacto hermano; no se midieron velocidad ni memoria para este artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (TailSteer 8step v2 8bit) | 17.532.854.464 | no disponible | Edición multi-turno, MLX 8 bits | Apache-2.0 | Hugging Face (mlx-community) |
| SenseNova-U1.5-8B-MoT-8step-v2-8bit | mismo tamaño y arquitectura | no disponible | T2I y edición de un solo paso, MLX 8 bits | Apache-2.0 | Hugging Face (mlx-community) |
| SenseNova-U1.5-8B-MoT-TailSteer (upstream) | no disponible | no disponible | Checkpoint TailSteer sin destilación ni cuantización | Apache-2.0 | Hugging Face (sensenova) |

## Limitaciones y advertencias
- El propio autor indica que para T2I de un solo paso y ediciones únicas la variante base es equivalente y es el valor por defecto medido; usar este artefacto fuera de sesiones multi-turno no aporta ventaja.
- Las respuestas de VQA no son idénticas token a token a las de la variante base: TailSteer es un ajuste fino completo que modifica también el flujo de comprensión, con respuestas reformuladas pero correctas en 12 preguntas.
- La ganancia no sobrevive a cuantización de 4 bits; no se publica artefacto a 4 bits y no debe asumirse equivalencia.
- Los renders son algo más suaves que la variante base (gradiente del percentil 99 aproximadamente un 15 % menor) y el texto fino en cadenas largas aparece más difuso.
- El emparejamiento del LoRA V2 con TailSteer no está documentado por el equipo upstream; las mediciones presentadas son del autor del artefacto y con muestra pequeña (8 imágenes), por lo que la significancia estadística es limitada.
- El runtime no tiene una variante con nombre para este artefacto: hay que cargarlo por ruta (`--weights` o snapshot explícito en `SenseNovaU1Configuration`).
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no disponible.
- Limitaciones de contexto o idioma: no disponible.
- Licencia Apache-2.0, permisiva para uso comercial; se incluye el `LICENSE` upstream y un `NOTICE` que declara las modificaciones. El crédito corresponde al equipo SenseNova y a los autores de TailSteer.

## Enlaces
- Hugging Face (este artefacto): https://huggingface.co/mlx-community/SenseNova-U1.5-8B-MoT-TailSteer-8step-v2-8bit
- Modelo upstream TailSteer: https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT-TailSteer (commit `d6dc59dcacae1b2cb962bbcc25fd08912aa03a87`)
- Modelo base: https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT
- LoRAs oficiales: https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT-LoRAs (commit `f33b8fe0216e6f10e5aed58ebbfdd05f02826732`)
- Artefacto hermano sin TailSteer: https://huggingface.co/mlx-community/SenseNova-U1.5-8B-MoT-8step-v2-8bit
- Paper TailSteer: https://arxiv.org/abs/2611.06741
- Código TailSteer: https://github.com/Lyricccco/tailsteer
- Dataset de entrenamiento TailSteer: https://huggingface.co/datasets/Lyricccco/TailSteer-Source
- Benchmark Add & Preserve: https://huggingface.co/datasets/Lyricccco/Add-and-Preserve
- Runtime MLX-Swift: https://github.com/xocialize/sensenova-u1-swift
