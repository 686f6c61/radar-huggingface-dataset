# akhaliq/MOSS-Image-Edit-HQ

## Resumen

MOSS-Image-Edit-HQ es un adaptador LoRA de edición de imagen por instrucciones publicado por el usuario de Hugging Face `akhaliq` sobre el modelo base `OpenMOSS-Team/MOSS-Image-SFT`. No es un modelo completo ni un LLM: es un conjunto de pesos que modifica el comportamiento del modelo base para aplicar transformaciones guiadas por texto sobre una o varias imágenes de referencia. Su objetivo declarado es superar en calidad a `chinoll/Moss-Image-Edit`, otro adaptador para el mismo modelo base, publicando todos los experimentos, incluidos los que perdieron.

La relevancia actual está en su enfoque abierto y reproducible: licencia Apache-2.0, integración directa con ComfyUI mediante el plugin `ComfyUI-Moss-Image-Edit`, flujos de trabajo listos para cargar y una evaluación comparativa ciega publicada con las imágenes y las instrucciones exactas. El checkpoint recomendado es `armV2-lo`, que según el autor iguala a `chinoll` en fidelidad y lo supera en transformaciones de entorno, atmósfera y estilo.

La información disponible no incluye el número de parámetros del adaptador, la composición completa del dataset ni cifras de VRAM o latencia. El repositorio ocupa 4,7 GB e incluye pesos en formato safetensors, workflows de ComfyUI y material de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de edición de imagen `OpenMOSS-Team/MOSS-Image-SFT`; pipeline de flow-matching con text encoder Qwen3.5 y VAE Flux2 según la model card |
| Parámetros totales | no disponible (no se publica el rango ni el número de parámetros del adaptador) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica como contexto de texto: la entrada son imágenes de referencia e instrucciones |
| Tipos de cuantización | no disponible; se distribuyen pesos safetensors sin especificar precisión (fp16/bf16) |
| Idiomas soportados | no disponible; los ejemplos e instrucciones publicados están en inglés |
| Licencia | Apache-2.0 (adaptador) |
| Formato de pesos | safetensors; dos variantes: `weights/armV2-lo/armV2-lo.safetensors` (checkpoint ai-toolkit) y `armV2-lo-moss-edit-lora.safetensors` (formato ComfyUI) |

## Arquitectura y entrenamiento

El adaptador se entrena con ai-toolkit sobre `OpenMOSS-Team/MOSS-Image-SFT`, un modelo de edición de imagen que, según la model card, emplea un text encoder Qwen3.5 y un VAE Flux2. La inferencia recomendada usa un sampler Euler de flow-matching con shift 5.0, 50 pasos, CFG 3.0, referencia a la resolución de origen y salida de hasta 1024 px. Para borradores se indican 28 pasos con CFG 3; bajar a 8 pasos solo se recomienda con una pila destilada, probada por separado.

La versión 1 se entrenó con un arranque en caliente desde `chinoll/Moss-Image-Edit` y también desde cero, usando el dataset `molbal/multi_reference_image_editing` (20 000 filas; el texto de la model card está truncado en ese punto). La versión 2, `armV2-lo`, se describe como un LoRA de edición con datos «quirúrgicos»; el entrenamiento de 300 pasos redujo la pérdida de 0.595 a 0.496. La evaluación se hizo con 12 filas reservadas de OmniEdit dev y con 5 fotos reales de FFHQ que, según el autor, nunca estuvieron en entrenamiento. No se documentan RLHF, DPO ni innovaciones de decodificación especulativa.

## Capacidades

- Edición de imagen guiada por instrucciones en lenguaje natural sobre una imagen de referencia.
- Transformaciones de atmósfera y entorno: el autor cita ejemplos como «misty atmosphere» y «stormy space», categoría en la que `armV2-lo` supera a `chinoll/Moss-Image-Edit`.
- Transferencia y encuadre de estilo: «watercolor painting» y «ancient Egyptian mural» se evalúan en la rejilla ciega.
- Adiciones y eliminaciones de elementos, con preservación de la identidad del sujeto: el autor reporta empate con `chinoll` y ausencia de la deriva de sujeto de la v1.
- Edición de retratos reales: cambio de color de pelo y adición de gafas de sol, con resultados parciales.
- Composición con múltiples referencias: el workflow `armV2_lo_workflow_multi.json` admite hasta 4 imágenes de referencia.
- Integración en ComfyUI mediante `ModelPatchLoader` y el plugin `ComfyUI-Moss-Image-Edit`, que requiere ComfyUI 0.42.3 o superior.
- No hay soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, audio o visión comprensiva; no es un modelo de lenguaje.

## Casos de uso

- Producción de assets con edición por instrucción: un artista gráfico puede cambiar la atmósfera de una escena («misty atmosphere», «stormy space») sin rehacer la composición, aprovechando que el adaptador conserva la imagen de origen y trabaja a hasta 1024 px.
- Transferencia de estilo en ilustración y concept art: aplicar acabados como acuarela o mural egipcio sobre un boceto o render, con el estilo controlado por el prompt y la referencia.
- Edición de fotografías de retrato en estudio: cambiar el color del pelo o añadir complementos sobre fotos reales, con la advertencia de que las gafas de sol y el envejecimiento facial funcionan de forma irregular.
- Composición multi-referencia para catálogo de producto: combinar hasta 4 imágenes de referencia en un mismo flujo de ComfyUI para integrar un objeto en una escena nueva.
- Automatización de variantes en un pipeline de ComfyUI: cargar el workflow `armV2_lo_workflow_single.json`, fijar el LoRA en `models/model_patches/` y generar variantes con 50 pasos y CFG 3.0 para revisión humana.
- Prototipado rápido de ideas: usar el Space de demostración `akhaliq/moss-image-edit-hq-demo` para validar una instrucción antes de montar el flujo local con el modelo base, el text encoder y el VAE.
- Evaluación interna de adaptadores de edición: reutilizar la rejilla ciega publicada y el dataset `akhaliq/wiki-eval-images` como plantilla para comparar checkpoints con las mismas semillas y ajustes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, FID, CLIP score) en la información disponible; el modelo es un adaptador de edición de imagen y la evaluación publicada es cualitativa y comparativa.

| Evaluación | Conjunto y ajustes | Resultado reportado |
|---|---|---|
| Rejilla ciega v2 frente a `chinoll/Moss-Image-Edit` | 12 filas reservadas de OmniEdit dev, 1024 px, 50 pasos, CFG 3, semillas idénticas | Gana en atmósfera/entorno y estilo; pierde en el intercambio de letrero de texto; empata en adiciones/eliminaciones y preservación de identidad |
| Retratos reales frente a `chinoll/Moss-Image-Edit` | 5 fotos FFHQ no vistas en entrenamiento, 1024 px, 50 pasos, CFG 3, semilla 42 | Gana 3 de 5 («bright red hair», «watercolor painting», «add sunglasses»); empate o resultado débil en «30 years older» y «sunny beach»; ninguno coloca bien las gafas de sol |
| Entrenamiento de `armV2-lo` | 300 pasos | Pérdida de 0.595 a 0.496 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador no funciona de forma aislada; requiere el modelo base `OpenMOSS-Team/MOSS-Image-SFT`, el text encoder Qwen3.5 y el VAE Flux2, por lo que el consumo lo determina esa pila completa.
- GPU recomendadas: no disponible; el autor no publica hardware de referencia ni cifras de memoria para 1024 px y 50 pasos.
- ¿Cabe en GPU de consumo? No confirmado. Los 4,7 GB del repositorio incluyen pesos y material de evaluación, no equivalen al peso del adaptador ni al de la pila de inferencia completa.
- Despliegue: ComfyUI 0.42.3 o superior con el plugin `ComfyUI-Moss-Image-Edit`; el archivo `armV2-lo-moss-edit-lora.safetensors` debe ir en `ComfyUI/models/model_patches/`, no en `models/loras/`. También hay un Space de demostración y un Space con workflow listo.
- Latencia y throughput: no disponible. Los ajustes recomendados son 50 pasos con CFG 3.0; 28 pasos para borradores; 8 pasos solo con una pila destilada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Resultado comparativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `akhaliq/MOSS-Image-Edit-HQ` (`armV2-lo`) | LoRA sobre MOSS-Image-SFT | no disponible | no aplica | Gana en atmósfera, entorno y estilo; pierde en letreros de texto; empata en identidad y adiciones/eliminaciones | Apache-2.0 | Hugging Face, ComfyUI, Space de demostración |
| `chinoll/Moss-Image-Edit` | LoRA sobre el mismo modelo base | no disponible | no aplica | Base de comparación; el autor reporta que oscurece en exceso algunas fotos reales y falla en color de pelo | no disponible en la información proporcionada | Hugging Face |
| `OpenMOSS-Team/MOSS-Image-SFT` | Modelo base de edición de imagen | no disponible | no aplica | Modelo sobre el que se aplican ambos adaptadores; sin comparativa directa publicada en esta información | no disponible en la información proporcionada | Hugging Face |

## Limitaciones y advertencias

- Las ediciones pequeñas y quirúrgicas, como cambios de color o de texto, son la categoría más débil del checkpoint actual; el autor indica que la v3 en entrenamiento las aborda.
- El intercambio de letreros de texto pierde claramente frente a `chinoll/Moss-Image-Edit`, que produce lettering más limpio.
- El envejecimiento facial («30 years older») y la sustitución de fondo por una playa («sunny beach») se evalúan como empate o resultado débil; ninguno de los dos adaptadores coloca bien unas gafas de sol.
- La evaluación es del propio autor, con 12 filas de OmniEdit dev y 5 fotos de FFHQ; es una muestra pequeña y no equivale a una evaluación independiente.
- Los prompts de los ejemplos están en inglés; no hay lista oficial de idiomas soportados ni evaluación multilingüe.
- La licencia Apache-2.0 cubre el adaptador según sus metadatos, pero no se especifica en la información disponible la licencia del modelo base `OpenMOSS-Team/MOSS-Image-SFT`; conviene verificarla antes de un uso comercial.
- La licencia y procedencia de los datos de entrenamiento (`molbal/multi_reference_image_editing`) y de las fotos de evaluación no se detallan; pueden existir sesgos de representación en retratos y en escenas.
- En producción, un error de instalación frecuente es colocar el archivo en `models/loras/` en lugar de `models/model_patches/`, lo que provoca «Load Model Patch failed»; también es necesario ComfyUI 0.42.3 o superior.
- Si las ediciones salen débiles, el autor recomienda subir a 50 pasos y CFG 3.5-4, y mantener la fuerza del ModelPatch en 1.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akhaliq/MOSS-Image-Edit-HQ
- Pesos `armV2-lo` en formato ai-toolkit: https://huggingface.co/akhaliq/MOSS-Image-Edit-HQ/blob/main/weights/armV2-lo/armV2-lo.safetensors
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Adaptador de comparación: https://huggingface.co/chinoll/Moss-Image-Edit
- Demo Space: https://huggingface.co/spaces/akhaliq/moss-image-edit-hq-demo
- Space con workflow de ComfyUI: https://huggingface.co/spaces/akhaliq/moss-image-edit-workflow
- Plugin de ComfyUI: https://github.com/Chenkin-x/ComfyUI-Moss-Image-Edit
- Workflow de una referencia: https://huggingface.co/akhaliq/MOSS-Image-Edit-HQ/blob/main/workflows/armV2_lo_workflow_single.json
- Workflow multi-referencia (hasta 4 imágenes): https://huggingface.co/akhaliq/MOSS-Image-Edit-HQ/blob/main/workflows/armV2_lo_workflow_multi.json
- Rejilla de evaluación v2: https://huggingface.co/akhaliq/MOSS-Image-Edit-HQ/blob/main/eval/grid_all.jpg
- Rejilla de retratos reales: https://huggingface.co/akhaliq/MOSS-Image-Edit-HQ/blob/main/eval/real_grid.jpg
- Imágenes de evaluación por candidato: https://huggingface.co/datasets/akhaliq/wiki-eval-images
- Dataset de entrenamiento citado: https://huggingface.co/datasets/molbal/multi_reference_image_editing
- Fotos de evaluación FFHQ: https://huggingface.co/datasets/bitmind/ffhq-256_training_faces
- Etiqueta arXiv declarada en el repositorio: https://arxiv.org/abs/2610.23374 (el contenido del paper no se detalla en la información disponible)
- Herramienta con la que se construyó: https://hf.co/chat?mode=ml-intern
