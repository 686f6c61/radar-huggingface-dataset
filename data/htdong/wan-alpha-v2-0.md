# htdong/Wan-Alpha-v2.0

## Resumen

Wan-Alpha-v2.0 es un modelo de generacion de video texto-a-video (T2V) especializado en producir video con canal alfa (RGBA), es decir, con transparencia real y estable fotograma a fotograma. Lo desarrolla htdong y se construye como un ajuste fino (LoRA) sobre el modelo base Wan-AI/Wan2.1-T2V-14B, un transformer de difusion de 14.000 millones de parametros. La innovacion central es el "Shiftable RGB-A Distribution Learner", un mecanismo que aprende a distribuir la transparencia de forma coherente temporalmente, evitando el parpadeo del canal alfa que sufre la generacion naive.

La version v2.0 se publico el 16 de diciembre de 2025 y llega acompanada de un VAE adaptado que decodifica el canal alfa junto con el RGB. El modelo resuelve un problema concreto de produccion audiovisual: generar clips con fondo transparente listos para composicion (motion graphics, VFX, overlays, avatares) sin necesidad de rotoscopia manual. Se distribuye con licencia Apache 2.0 y se integra en el ecosistema diffusers, con soporte adicional en ComfyUI para la version 1.0.

El repositorio pesa aproximadamente 1 GB, lo que corresponde a los pesos del LoRA y del VAE adaptado, no al modelo base completo. El contexto de generacion por defecto es de 81 fotogramas a resolucion 832x480, con inferencia acelerada mediante destilacion (Lightx2v) en tan solo 4 pasos. Los prompts admiten chino e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) sobre Wan2.1-T2V-14B, con LoRA de adaptacion y VAE modificado para RGBA |
| Parametros totales | 14.000 millones (modelo base Wan2.1-T2V-14B); el repositorio contiene solo adaptadores LoRA y VAE |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 81 fotogramas por generacion (por defecto); resolucion 832x480 |
| Tipos de cuantizacion | bf16 (pesos publicados); no se documentan otras cuantizaciones oficiales |
| Idiomas soportados | chino e ingles en los prompts |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LoRA t2v.safetensors) y bin (decoder.bin del VAE) |

## Arquitectura y entrenamiento

Wan-Alpha-v2.0 se apoya en el transformer de difusion de Wan2.1-T2V-14B, que procesa texto (via T5) y genera latentes de video que un VAE decodifica a pixeles. Sobre esta base se aplica un LoRA entrenado especificamente para producir un cuarto canal (alfa) ademas de RGB. El componente clave es un VAE adaptado (decoder.bin) que reconstruye simultaneamente color y transparencia, y un "Shiftable RGB-A Distribution Learner" que modela la distribucion conjunta RGB-A de modo que el canal alfa pueda desplazarse coherentemente entre fotogramas. Esto permite sintetizar objetos semitransparentes, efectos de brillo y detalles finos como el pelo.

El pipeline de inferencia combina el modelo base, un LoRA de destilacion (Lightx2v-T2V-14B) para reducir los pasos de muestreo a 4, el VAE adaptado y el LoRA de Wan-Alpha. El entrenamiento emplea mascaras gaussianas (generadas con `gen_gaussian_mask.py`) y datos de video con alfa; el dataset y el codigo de entrenamiento aun no se han publicado segun la lista de tareas pendientes del autor. No se especifica en la informacion disponible el numero de tokens de entrenamiento ni si hubo RLHF/DPO.

## Capacidades

- Generacion de video texto-a-video con canal alfa (RGBA) y transparencia estable temporalmente.
- Sintesis de objetos semitransparentes, efectos de glow y detalles finos (pelo, bordes suaves).
- Salida de video renderizado con fondo de tablero de ajedrez y fotogramas PNG individuales.
- Control de parametros de generacion: escala de guia, numero de pasos, numero de fotogramas y `alpha_shift_mean`.
- Soporte de prompts en chino e ingles con indicacion explicita de fondo transparente, estilo visual y tipo de plano.
- Inferencia acelerada mediante destilacion (4 pasos) y paralelismo multi-GPU (FSDP, Ulysses).
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo generativo de video).

## Casos de uso

- Motion graphics y branding: generar elementos animados con fondo transparente (logos, formas, tipografia animada) listos para superponer en After Effects o DaVinci Resolve, gracias a la salida RGBA con alfa estable.
- Efectos visuales en postproduccion: crear humo, fuego, brillos y particulas semitransparentes sin rotoscopia manual, aprovechando la sintesis de objetos semitransparentes y efectos de glow.
- Overlays para streaming y videojuegos: producir clips de avatares, mascotas virtuales o elementos de HUD con transparencia para composicion en tiempo real.
- Publicidad y e-commerce: generar productos o sujetos recortados sobre fondo transparente para insertarlos en escenas o plantillas de marketing.
- Contenido para redes sociales: crear clips cortos con sujetos aislados (por ejemplo, una silla de ratan colgante) que se montan sobre fondos personalizados.
- Prototipado de VFX para cine: previsualizar capas de transparencia y composicion antes de la produccion final, reduciendo costes de rotoscopia.
- Investigacion en generacion de video: servir como referencia reproducible para estudiar el aprendizaje de la distribucion RGB-A y la coherencia temporal del canal alfa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base Wan2.1-T2V-14B en bf16 requiere del orden de 28-30 GB solo para pesos, mas activaciones y VAE, por lo que en la practica se recomienda al menos 40-80 GB.
- GPU recomendadas: A100 80 GB o H100 para ejecucion comoda; el script oficial usa `torchrun --nproc_per_node=8` con FSDP y Ulysses, pensado para 8 GPUs.
- Cabe en consumer GPU: no de forma directa con el modelo base completo en bf16; requeriria cuantizacion agresiva o ejecucion multi-GPU, no documentada oficialmente para este modelo.
- Opciones de despliegue: script oficial `generate_dora_lightx2v_mask.py` (PyTorch + diffusers), ComfyUI (solo documentado para v1.0), Lightx2v para destilacion.
- Latencia y throughput: no disponibles; la destilacion a 4 pasos reduce coste frente a muestreo completo, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto (fotogramas) | Salida alfa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan-Alpha-v2.0 | 14.000 M (base) | 81 | Si (RGBA) | Apache 2.0 | Hugging Face, codigo en GitHub |
| Wan2.1-T2V-14B | 14.000 M | no disponible | No (solo RGB) | Apache 2.0 | Hugging Face |
| Wan-Alpha v1.0 | 14.000 M (base) | no disponible | Si (RGBA) | Apache 2.0 | Hugging Face, ComfyUI |

No se dispone de datos de benchmarks que permitan comparar rendimiento numerico entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se ha publicado la variante texto-a-video; la version imagen-a-video (Wan-Alpha-I2V) esta pendiente.
- El dataset de entrenamiento, el VAE de entrenamiento y el codigo de entrenamiento no estan disponibles todavia, lo que limita la reproducibilidad.
- El repositorio no incluye el modelo base Wan2.1-T2V-14B ni el LoRA Lightx2v; hay que descargarlos por separado, lo que complica el despliegue.
- Requiere hardware de gama alta (multi-GPU) para inferencia practica; no hay cuantizaciones oficiales para consumer GPU.
- `alpha_shift_mean` es un parametro fijo segun la documentacion, lo que restringe el control fino sobre la transparencia.
- Riesgo de artefactos en el canal alfa en escenas complejas o con movimiento rapido, aunque no se documenta cuantitativamente.
- No se documentan sesgos especificos ni evaluaciones de robustez multilingue mas alla de chino e ingles.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Wan2.1 y del LoRA de destilacion de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/htdong/Wan-Alpha-v2.0
- Version 1.0: https://huggingface.co/htdong/Wan-Alpha
- ComfyUI (v1.0): https://huggingface.co/htdong/Wan-Alpha_ComfyUI
- Paper en arXiv: https://arxiv.org/pdf/2509.24979
- Pagina del proyecto: https://donghaotian123.github.io/Wan-Alpha/
- Repositorio de codigo: https://github.com/WeChatCV/Wan-Alpha
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- LoRA Lightx2v: https://huggingface.co/Kijai/WanVideo_comfy/blob/main/Lightx2v/lightx2v_T2V_14B_cfg_step_distill_v2_lora_rank64_bf16.safetensors
