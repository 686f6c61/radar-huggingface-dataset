# sensenova/SenseNova-U1.5-8B-MoT-TailSteer

## Resumen

SenseNova-U1.5-8B-MoT-TailSteer es un ajuste fino del modelo multimodal nativo SenseNova-U1.5-8B-MoT, desarrollado por SenseTime bajo la familia SenseNova. Se trata de un modelo unificado «any-to-any» que combina comprensión visual, razonamiento y generación/edición de imágenes en una sola arquitectura de tipo Mixture-of-Transformers (MoT). El checkpoint que nos ocupa incorpora TailSteer, una etapa final de entrenamiento cuyo objetivo es reducir la deriva acumulativa que se produce en la edición de imágenes multiturno, es decir, cuando cada imagen editada se convierte en la entrada de la siguiente iteración.

La relevancia de este modelo radica en que mantiene las capacidades del modelo base (generación texto-a-imagen y edición de un solo turno) mientras mejora de forma sustancial la estabilidad en cadenas largas de ediciones. Según la model card, en el turno 10 del benchmark Add & Preserve se obtienen +6,99 dB de PSNR y un 31,3 % menos de LPIPS en la región no editada respecto al modelo base, lo que se traduce en una preservación mucho mayor del fondo y de los objetos ya introducidos.

El modelo se distribuye con pesos completos en formato safetensors, licencia Apache 2.0 y la misma API de carga que el modelo base, por lo que puede sustituirse directamente en pipelines existentes sin adaptadores ni módulos de inferencia adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (MoT) multimodal nativa, unificada (comprension + generacion) |
| Parametros totales | 17.532.854.464 (17,53 mil millones, segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo ocupa 35,1 GB) |
| Idiomas soportados | no disponible (la model card muestra evaluaciones en ingles y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base SenseNova-U1.5-8B-MoT es un modelo multimodal nativo unificado de 8B parámetros construido sobre la arquitectura MoT, que combina módulos de transformer especializados para distintas modalidades dentro de un mismo modelo. Esta aproximación permite que el mismo checkpoint realice comprensión de imágenes, razonamiento multimodal, generación texto-a-imagen y edición de imágenes guiada por instrucciones, sin pipelines separados. El ajuste TailSteer no modifica la arquitectura ni el layout oficial del modelo: se entrega como pesos completos con la misma API de carga.

El entrenamiento de TailSteer se describe como una etapa final que aprende de las propias trayectorias de denoising del editor, usando el contenido fuente no modificado como referencia de preservación. No requiere pares de edición anotados con ground-truth ni entrenamiento sobre cadenas multiturno reales; se apoya en trayectorias de edición única. El checkpoint publicado corresponde a la actualización 2.000 del paper, con un onset de steering de entrenamiento de 42/50 (el onset controla la supervisión durante el entrenamiento, mientras que en inferencia se usa el modelo entrenado en todos los pasos). La validación frente a la exportación original de inferencia está documentada en `validation/parity.json`.

## Capacidades

- Generación de imágenes texto-a-imagen con el mismo checkpoint que realiza edición.
- Edición de imágenes guiada por instrucciones en lenguaje natural (un solo turno).
- Edición multiturno con retroalimentación de imagen: cada salida editada puede reintroducirse como entrada de la siguiente edición.
- Edición con múltiples imágenes de referencia, permitiendo componer objetos en una escena existente.
- Comprensión y razonamiento visual (el modelo base se presenta como modelo unificado de comprensión y generación).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: la model card reporta evaluaciones en inglés y chino, pero no se detalla la lista completa de idiomas.
- Preservación de región no editada mejorada en cadenas largas de ediciones (hasta 20 turnos en los ejemplos publicados).

## Casos de uso

- Edición iterativa de imágenes en producción: un flujo donde el usuario aplica cambios sucesivos («cambia la chaqueta a azul», «añade una farola», «elimina el coche») sobre la misma imagen. TailSteer evita que los artefactos de textura se acumulen turno tras turno, manteniendo legibles los elementos originales de la escena.
- Composición de escenas con múltiples referencias: introducir objetos de varias imágenes de referencia en un entorno existente (por ejemplo, amueblar un atrio) preservando la coherencia del fondo y de los objetos ya colocados.
- Generación de material gráfico para marketing: producir variantes de una imagen base con el mismo prompt y semilla, manteniendo una calidad cercana al modelo base en benchmarks como Qwen-Image-Bench y BizGenEval.
- Prototipado rápido de conceptos visuales: generar imágenes texto-a-imagen y refinarlas mediante ediciones sucesivas sin cambiar de modelo ni de pipeline.
- Restauración o modificación controlada de fotografías: cambiar un elemento concreto (ropa, color, objeto) conservando el resto de la imagen, gracias a la mejora en PSNR y SSIM en la región no editada.
- Evaluación e investigación en edición multiturno: el modelo se acompaña del benchmark Add & Preserve (100 imágenes, diez turnos) y de una suite de inferencia (`cafe-20turn`) que permite reproducir comparativas frente al modelo base.

## Benchmarks y rendimiento

Resultados reportados en la model card (modelo base frente a después de TailSteer):

| Benchmark | Modelo base | Tras TailSteer |
|---|---:|---:|
| Qwen-IB EN ↑ | 53,43 | 52,24 |
| Qwen-IB ZH ↑ | 53,25 | 52,58 |
| BizGen ES (%) ↑ | 45,85 | 45,73 |
| GEdit EN ↑ | 8,33 | 8,27 |
| GEdit ZH ↑ | 8,30 | 8,31 |
| RISE accuracy (%) ↑ | 31,39 | 29,44 |
| ImgEdit ↑ | 4,43 | 4,41 |

Resultados en el benchmark Add & Preserve (100 imágenes, diez turnos):

| Modelo | COA (%) ↑ | PSNR@10 ↑ | SSIM@10 ↑ | LPIPS@10 ↓ |
|---|---:|---:|---:|---:|
| Modelo base | 94,93 | 11,23 | 0,166 | 0,607 |
| Tras TailSteer | 94,78 | 18,22 | 0,489 | 0,417 |

La model card resume la mejora en el turno 10 como +6,99 dB de PSNR y un 31,3 % menos de LPIPS en la región no editada. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros de texto) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 17,53 mil millones de parámetros en precisión de 16 bits, los pesos ocuparían aproximadamente 35 GB, lo que exige GPUs de gama alta o cuantización.
- GPU recomendadas: no especificadas en la información proporcionada; por tamaño, serían necesarias GPUs con 40-80 GB de VRAM (A100, H100) para inferencia en precisión completa.
- ¿Cabe en GPU de consumo? No disponible en la documentación; con cuantización agresiva podría ser posible en GPUs de 24 GB, pero no hay confirmación oficial.
- Opciones de despliegue: el autor indica el paquete oficial de inferencia SenseNova-U1 (`examples/editing/inference.py`) y la CLI `tailsteer`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-U1.5-8B-MoT-TailSteer | 17,53 mil millones (safetensors) | no disponible | Multimodal unificado (MoT) | Apache 2.0 | HuggingFace |
| SenseNova-U1.5-8B-MoT (base) | 8B (según nombre) | no disponible | Multimodal unificado (MoT) | Apache 2.0 | HuggingFace |
| Otros modelos de edición de imagen de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye comparativas con modelos de terceros de la misma categoría; los únicos datos comparativos son frente al modelo base de la misma familia.

## Limitaciones y advertencias

- La model card reporta una ligera caída en algunos benchmarks tras TailSteer: Qwen-IB EN (53,43 → 52,24), BizGen ES (45,85 → 45,73), GEdit EN (8,33 → 8,27), RISE accuracy (31,39 → 29,44) e ImgEdit (4,43 → 4,41). El compromiso es estabilidad multiturno a cambio de una pequeña pérdida en tareas de un solo turno.
- COA (precisión acumulada de objetos) baja ligeramente de 94,93 % a 94,78 %, lo que indica que la preservación del fondo mejora a costa de una mínima reducción en la presencia de objetos solicitados.
- No se detalla la lista completa de idiomas soportados ni el contexto máximo; la evaluación se limita a inglés y chino.
- No hay información publicada sobre sesgos, tasas de alucinación visual o restricciones adicionales más allá de la licencia Apache 2.0.
- El modelo se distribuye como pesos completos (35,1 GB), lo que implica requisitos de almacenamiento y VRAM considerables para producción.
- La licencia y atribución del modelo base aplican según LICENSE y NOTICE del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT-TailSteer
- Modelo base: https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT
- Repositorio oficial de inferencia: https://github.com/OpenSenseNova/SenseNova-U1
- Paper SenseNova-U1.5: https://arxiv.org/abs/2609.11929
- Paper SenseNova-U1: https://arxiv.org/abs/2605.12500
- Dataset Add & Preserve: https://huggingface.co/datasets/Lyricccco/Add-and-Preserve
- Dataset de entrenamiento TailSteer: https://huggingface.co/datasets/Lyricccco/TailSteer-Source
- Plataforma SenseNova: https://www.sensenova.ai/
- SenseNova (China): https://www.sensenova.cn/
