# Comfy-Org/LongCat-Video-Avatar

## Resumen

LongCat-Video-Avatar es un modelo de difusion para generacion de video a partir de imagen (image-to-video) orientado a la creacion de avatares parlantes. Desarrollado originalmente por Meituan (repositorio `meituan-longcat/LongCat-Video-Avatar-1.6`) y reempaquetado por Comfy-Org para su uso directo en ComfyUI, el modelo toma una imagen de referencia y produce secuencias de video animadas con sincronizacion labial y movimiento facial coherente. Esta ficha cubre el repositorio de Comfy-Org, que distribuye los pesos en formato `safetensors` listos para el nodo de difusion de ComfyUI.

La relevancia actual del modelo radica en su integracion nativa con el ecosistema ComfyUI y en el uso de un esquema de aceleracion basado en LoRAs (DMD y OPSD) que reducen el numero de pasos de muestreo necesarios. El repositorio incluye los componentes completos: el modelo de difusion en `int8` con rotacion de convoluciones (`convrot`), dos LoRAs en `bf16` con rango 128, el text encoder `umt5_xxl` en `fp16` e `int8`, y el VAE `wan_2.1_vae`. El tamano total del repositorio es de 37,1 GB.

La licencia MIT facilita su adopcion tanto en investigacion como en productos comerciales, si bien conviene revisar las condiciones del modelo base original de Meituan. El modelo esta pensado para pipelines de generacion de video con avatar, no para tareas de texto, razonamiento o codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para image-to-video (detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (no aplica a modelos de difusion) |
| Tipos de cuantizacion | int8 (modelo de difusion y text encoder), bf16 (LoRAs), fp16 (text encoder) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (single-file para ComfyUI) |

Componentes distribuidos en el repositorio:

| Componente | Fichero | Precision |
|---|---|---|
| Modelo de difusion | `longcat-avatar-1.6_int8_convrot.safetensors` | int8 |
| LoRA DMD | `longcat-avatar-1.6_dmd_lora_rank128_bf16.safetensors` | bf16, rango 128 |
| LoRA OPSD | `longcat-avatar-1.6_opsd_lora_rank128_bf16.safetensors` | bf16, rango 128 |
| Text encoder | `umt5_xxl_fp16.safetensors` / `umt5_xxl_int8_convrot.safetensors` | fp16 / int8 |
| VAE | `wan_2.1_vae.safetensors` | no disponible |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de su naturaleza como modelo de difusion para image-to-video. El text encoder es `umt5_xxl`, un encoder de la familia T5 de gran tamano, y el VAE corresponde a `wan_2.1_vae`, el autoencoder de la familia Wan 2.1. El modelo de difusion se distribuye en `int8` con una transformacion de rotacion de convoluciones (`convrot`), una tecnica de cuantizacion post-entrenamiento orientada a reducir el uso de memoria manteniendo la fidelidad numerica.

El repositorio incluye dos LoRAs de aceleracion con rango 128: una DMD (Distribution Matching Distillation) y otra OPSD. Estas LoRAs permiten reducir el numero de pasos de muestreo necesarios para generar video, lo que resulta critico en modelos de difusion de video por su elevado coste computacional. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO (no aplicables de forma habitual a modelos de difusion).

## Capacidades

- Generacion de video a partir de una imagen de referencia (image-to-video).
- Creacion de avatares parlantes con animacion facial y sincronizacion labial.
- Integracion nativa con ComfyUI mediante nodos de difusion y carga de LoRAs.
- Aceleracion del muestreo mediante LoRAs DMD y OPSD, que reducen los pasos necesarios.
- Cuantizacion a int8 del modelo de difusion y del text encoder para reducir requisitos de VRAM.
- Uso de prompts de texto a traves del text encoder `umt5_xxl` para condicionar la generacion.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking, por tratarse de un modelo generativo de video.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Generacion de avatares virtuales para presentaciones corporativas: a partir de una fotografia del ponente y un audio o prompt, el modelo produce un video con el avatar animado, util para formación interna y comunicaciones asincronas.
- Doblaje y localizacion de contenido audiovisual: se puede animar la imagen de un actor o presentador para generar versiones en otros idiomas manteniendo la identidad visual, usando el text encoder para condicionar el estilo.
- Marketing y redes sociales: creacion rapida de videos cortos con personajes animados a partir de retratos, integrados en flujos de ComfyUI para produccion por lotes.
- Prototipado en estudios de animacion: generacion de animaticos y pruebas de expresion facial antes de pasar a produccion final, aprovechando las LoRAs de aceleracion para iterar con pocos pasos.
- Asistentes virtuales con cara visible: integracion en interfaces conversacionales donde se requiere un avatar animado que acompanie la respuesta de voz, desplegado en infraestructura con GPU.
- Investigacion en sintesis facial y sincronizacion labial: el modelo sirve como base para experimentos de animacion de retratos y evaluacion de tecnicas de difusion aplicadas a video.
- Creacion de contenido educativo: generacion de videos explicativos con un avatar que presenta el material, reduciendo la necesidad de grabacion fisica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 37,1 GB en total, incluyendo todas las variantes de pesos; la carga en VRAM depende de la combinacion de modelo de difusion int8, LoRAs bf16, text encoder y VAE.
- El modelo de difusion en int8 y el text encoder en int8 reducen el consumo frente a variantes fp16, pero la generacion de video sigue requiriendo GPU con memoria abundante.
- GPU recomendadas: no disponibles de forma oficial. Por el perfil de modelo de difusion de video, se orienta a GPUs de datacenter (A100, H100) o GPUs consumer de gama alta con suficiente VRAM; no se confirma compatibilidad con modelos concretos.
- Opciones de despliegue: ComfyUI (nativo, con los ficheros en las carpetas `diffusion_models`, `loras`, `text_encoders` y `vae`), y Comfy Cloud como alternativa gestionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada. Como referencia de categoria, el modelo base original es `meituan-longcat/LongCat-Video-Avatar-1.6`, del que este repositorio es un reempaquetado para ComfyUI.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Comfy-Org/LongCat-Video-Avatar | no disponible | no aplica | MIT | Hugging Face (single-file para ComfyUI) |
| meituan-longcat/LongCat-Video-Avatar-1.6 | no disponible | no aplica | no disponible en esta ficha | Hugging Face (modelo base original) |
| Alternativas de image-to-video | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos del modelo; al generar avatares humanos, existe riesgo de reproducir sesgos de representacion facial y de genero presentes en los datos de entrenamiento.
- Riesgo de alucinacion visual: en modelos de difusion de video, pueden aparecer artefactos, deformaciones faciales o inconsistencias temporales, especialmente en secuencias largas.
- La sincronizacion labial puede degradarse con audios poco claros, idiomas distintos de los del entrenamiento o movimientos de cabeza pronunciados.
- No se documentan los idiomas soportados por el text encoder en este repositorio; la calidad con prompts en castellano no esta garantizada.
- La licencia del repositorio es MIT, pero se debe verificar la licencia y condiciones del modelo base original de Meituan antes de un uso comercial.
- El modelo esta pensado exclusivamente para generacion de video; no debe emplearse para tareas de texto, razonamiento o codigo.
- Para produccion, es necesario validar el consumo de VRAM real segun la configuracion de ComfyUI y el numero de pasos de muestreo, ya que no hay cifras oficiales publicadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/LongCat-Video-Avatar
- Modelo base original: https://huggingface.co/meituan-longcat/LongCat-Video-Avatar-1.6
- Comfy Cloud: https://cloud.comfy.org/
