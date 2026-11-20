# NidAll/MOSS-Image-SFT-4step-Merged

## Resumen

MOSS-Image-SFT-4step-Merged es un checkpoint de generación de imágenes texto-a-imagen derivado de MOSS-Image SFT de OpenMOSS-Team, al que se le ha integrado (merge) la LoRA de destilación a 4 pasos de lvladikov. El resultado es un modelo que genera imágenes en solo 4 pasos de muestreo con CFG 1, eliminando la necesidad de cargar un nodo LoRA separado en ComfyUI. Lo publica el usuario NidAll como artefacto de conveniencia para el ecosistema ComfyUI, no como producto oficial de OpenMOSS ni de Comfy-Org.

El repositorio ofrece dos variantes de pesos: un safetensors en BF16 de 10,16 GB y una versión cuantizada a INT8 con rotación Hadamard (ConvRot) de 5,41 GB, pensada para GPUs NVIDIA con tensor cores INT8. La cuantización replica el esquema del fichero oficial `moss_image_sft_int8_convrot.safetensors` de Comfy-Org, incluyendo la selección de capas y los metadatos, de modo que sea intercambiable en los mismos flujos de trabajo.

La relevancia de este checkpoint es práctica: reduce el coste computacional de inferencia de un modelo de difusión de imagen a 4 evaluaciones del UNet/DiT en lugar de las decenas habituales, y facilita el despliegue en ComfyUI con un único fichero. No se han publicado evaluaciones a nivel de imagen en esta build; las limitaciones heredadas son las de la LoRA de destilación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (MOSS-Image); detalles internos de la arquitectura no disponibles en la información proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | BF16 e INT8 tensorwise con ConvRot (rotación Hadamard por grupos de 256, INT8 simétrico por fila) |
| Idiomas soportados | no disponible (las indicaciones textuales dependen del codificador de texto del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16: `moss_image_sft_4step_merged_bf16.safetensors`, 10,16 GB; INT8: `moss_image_sft_4step_merged_int8_convrot.safetensors`, 5,41 GB) |

## Arquitectura y entrenamiento

El modelo base es MOSS-Image SFT de OpenMOSS-Team, un modelo de difusión texto-a-imagen. Sobre él se aplica una LoRA de destilación por pasos (step distillation) entrenada por lvladikov, con rango 64, que reduce el muestreo a 4 pasos. El merge se realizó en fp32 con la regla de runtime de ComfyUI `W + (alpha / rank) * up @ down` a fuerza 1.0, partiendo de `moss_sft_4step_rank_64_lora_comfyui.safetensors` (rev 2ec5241400bf) y del repack BF16 de Comfy-Org `moss_image_sft_bf16.safetensors` (rev 2929efe3cdd5). El resultado se redondea una sola vez a BF16 desde fp32.

La variante INT8 se genera a partir del merge en fp32 aplicando una rotación Hadamard regular por grupos (ConvRot, grupo de 256) y cuantización INT8 simétrica por fila con `mseclip`. La selección de capas y los metadatos replican el fichero INT8 oficial de Comfy-Org. Las comprobaciones reportadas por el autor incluyen: cabecera idéntica al base, 211 tensores byte-idénticos, 168 tensores fusionados iguales a `bf16(W + ΔW)` exactamente (mediana de ‖ΔW‖/‖W‖ = 0,0014), y en INT8 todas las 168 capas cuantizadas reconstruyen el peso fp32 fusionado con error relativo mediano 0,0084 (máximo 0,0096), frente al 0,0086 del fichero oficial sobre el base sin fusionar. No se ejecutó evaluación a nivel de imagen.

## Capacidades

- Generación de imágenes texto-a-imagen con muestreo en 4 pasos y CFG 1 (BasicGuider).
- Integración directa en ComfyUI mediante el nodo Load Diffusion Model, sin nodo LoRA adicional.
- Resoluciones entrenadas de 768x512 a 1824x1024, tanto en orientación horizontal como vertical, con dimensiones múltiplas de 16.
- Variante INT8 compatible con GPUs NVIDIA con tensor cores INT8 (SM 7.5+) y ComfyUI con soporte nativo de int8_tensorwise + ConvRot.
- Planificación de sigmas manual: `1.0, 0.91, 0.717, 0.024, 0.0`.
- No se documentan en la información proporcionada capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking; es un modelo puramente generativo de imagen.

## Casos de uso

- Generación rápida de imágenes en ComfyUI: al estar fusionada la LoRA, basta con cargar un único fichero en `ComfyUI/models/diffusion_models/` y usar el workflow incluido, reduciendo la complejidad del grafo frente a configuraciones con LoRA separada.
- Prototipado de pipelines de imagen en local: la variante INT8 de 5,41 GB permite iterar en GPUs de consumo con tensor cores INT8, manteniendo el esquema de cuantización del fichero oficial de Comfy-Org.
- Producción de ilustraciones a resolución media-alta: el rango entrenado hasta 1824x1024 (y vertical) cubre casos de banners, portadas y material gráfico para web.
- Sustitución directa del checkpoint INT8 oficial: al replicar cabecera, metadatos y selección de capas, el fichero INT8 puede intercambiarse en flujos ya validados con `moss_image_sft_int8_convrot.safetensors`.
- Experimentación con destilación por pasos: sirve como referencia de merge reproducible (regla fp32, redondeo único a BF16) para quienes investigan LoRAs de aceleración sobre modelos de difusión.
- Despliegue en entornos con VRAM limitada: la versión INT8 reduce el peso a aproximadamente la mitad respecto a BF16, facilitando la carga en GPUs de 8-12 GB junto con el codificador de texto y el VAE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se ejecutó evaluación a nivel de imagen en esta build; solo se documentan verificaciones numéricas de fidelidad del merge y de la cuantización (errores relativos medianos de 0,0014 en la fusión y 0,0084 en INT8).

## Requisitos de hardware

- VRAM estimada: la variante BF16 ocupa 10,16 GB en disco; la INT8, 5,41 GB. A ello hay que sumar el codificador de texto y el VAE del pipeline MOSS-Image, cuyo consumo no se detalla en la información proporcionada.
- GPU recomendadas: para INT8 se requiere NVIDIA con tensor cores INT8 (SM 7.5 o superior), es decir, Turing o posterior (RTX 20xx en adelante, A100, H100). Para BF16, GPUs con soporte BF16 nativo (Ampere o posterior).
- GPU de consumo: la variante INT8 está pensada para caber en GPUs de consumo con SM 7.5+; la BF16 requiere GPUs de gama alta con suficiente VRAM para el modelo completo más los componentes auxiliares.
- Despliegue: ComfyUI con Load Diffusion Model; la INT8 necesita una versión de ComfyUI con soporte nativo de int8_tensorwise + ConvRot. No se mencionan otros runners (vLLM, TGI, llama.cpp, Ollama) en la información proporcionada.
- Latencia y throughput: no disponibles. Cabe esperar una reducción aproximada a 4 evaluaciones del modelo por imagen frente a muestreos de decenas de pasos, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NidAll/MOSS-Image-SFT-4step-Merged | no disponible | no aplica | 4 (CFG 1) | Apache-2.0 | Hugging Face, 2 ficheros safetensors |
| OpenMOSS-Team/MOSS-Image-SFT | no disponible | no aplica | no disponible (modelo base sin destilar) | Apache-2.0 | Hugging Face |
| Comfy-Org/MOSS-Image (repack) | no disponible | no aplica | no disponible | Apache-2.0 | Hugging Face, incluye INT8 ConvRot oficial |
| lvladikov/MOSS-SFT-Distill-4step-LoRA | no disponible (LoRA rango 64) | no aplica | 4 | Apache-2.0 | Hugging Face, requiere nodo LoRA |

## Limitaciones y advertencias

- No es un producto oficial de OpenMOSS ni de Comfy-Org; es un merge de terceros. Para producción conviene validar el comportamiento frente al base oficial.
- No se ha realizado evaluación a nivel de imagen; las limitaciones conocidas son las de la LoRA de destilación de lvladikov (ver su model card).
- El muestreo está fijado a 4 pasos, CFG 1 y la secuencia ManualSigmas indicada; desviarse de estos ajustes puede degradar la calidad.
- La variante INT8 exige GPU NVIDIA con SM 7.5+ y una build de ComfyUI con soporte int8_tensorwise + ConvRot; en otros entornos no funcionará.
- Las resoluciones válidas son múltiplos de 16 dentro del rango entrenado (768x512 a 1824x1024, horizontal y vertical); fuera de ese rango la calidad no está garantizada.
- No hay información sobre sesgos, idiomas soportados ni tasas de alucinación visual; no disponibles.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el NOTICE de la LoRA y respetar las atribuciones a OpenMOSS-Team, Comfy-Org, lvladikov y comfy-kitchen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NidAll/MOSS-Image-SFT-4step-Merged
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- LoRA de destilación a 4 pasos: https://huggingface.co/lvladikov/MOSS-SFT-Distill-4step-LoRA
- Repack de Comfy-Org: https://huggingface.co/Comfy-Org/MOSS-Image
- Autor del merge: https://huggingface.co/NidAll
