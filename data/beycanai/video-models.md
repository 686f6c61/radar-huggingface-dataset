# beycanai/video-models

## Resumen

`beycanai/video-models` no es un modelo entrenado por su autor, sino un repositorio agregador de pesos de modelos de generacion de video para ComfyUI. Recopila tres checkpoints de difusion (Wan 2.2 Animate 14B, Wan Animate 2 destilado y Wan 2.1 14B SCAIL-2), junto con sus componentes auxiliares: text encoder UMT5-XXL, CLIP vision, VAE de Wan 2.1 y tres LoRAs. El autor lo publica para que sus flujos de trabajo de ComfyUI se puedan descargar de una sola vez en la carpeta `models/` de la instalacion.

El valor practico del repositorio es la conveniencia de empaquetado: los nombres de carpeta replican la estructura de ComfyUI (`diffusion_models/`, `text_encoders/`, `clip_vision/`, `vae/`, `loras/`), de modo que un unico comando `hf download` deja el entorno listo. Los ficheros se copian sin modificar desde los repositorios originales de Comfy-Org y conservan sus licencias de origen.

No hay informacion sobre arquitectura propia, datos de entrenamiento, idiomas o benchmarks, porque el autor no entrena ningun modelo, solo redistribuye artefactos de terceros. El repositorio ocupa 63,2 GB y esta etiquetado con `comfyui` y licencia `other`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (los checkpoints son modelos de difusion para video de la familia Wan; el repositorio no documenta la arquitectura) |
| Parametros totales | 14B en los checkpoints de difusion (segun los nombres de fichero `14B`); el resto de componentes no declara recuento |
| Parametros activos | No aplica (no se indica que sean MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (checkpoints de difusion con sufijo `int8_convrot`), fp8_e4m3fn escalado (text encoder), bf16 (LoRAs), fp16/bf16 para CLIP vision y VAE (no detallado) |
| Idiomas soportados | No disponible |
| Licencia | `other` (cada fichero conserva la licencia de su fuente original; no se especifica cual) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no contiene arquitectura ni entrenamiento propios. Los tres checkpoints de difusion son variantes de la familia Wan para generacion y animacion de video: `wan2.2_animate_14B_int8_convrot` procede de `Comfy-Org/Wan_2.2_ComfyUI_Repackaged`; `wan_animate_2_distill_int8_convrot` de `Comfy-Org/Wan-Animate-2`; y `wan2.1_14B_SCAIL_2_int8_convrot` de `Comfy-Org/SCAIL-2`. Los nombres indican 14B parametros y cuantizacion int8.

Los componentes auxiliares son los habituales en un pipeline de difusion para video: el text encoder `umt5_xxl_fp8_e4m3fn_scaled` (6,74 GB), el `clip_vision_h` (1,26 GB), el VAE `wan_2.1_vae` (0,25 GB) y tres LoRAs: `lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16` (destilacion de pasos CFG para image-to-video a 480p), `wan2.1_SCAIL_2_DPO_lora_bf16` (ajuste por DPO) y `wan2.1_SCAIL_2_relight_lora_bf16` (relight). No se documentan tokens de entrenamiento, composicion del dataset ni detalles de RLHF/DPO mas alla del nombre de la LoRA.

## Capacidades

- Generacion de video a partir de imagen (image-to-video) y animacion de personajes con los checkpoints Wan Animate.
- Control de movimiento y animacion condicionada mediante los modelos Animate y la LoRA de destilacion de pasos.
- Reduccion de pasos de inferencia gracias a la LoRA `lightx2v` de destilacion CFG para 480p.
- Ajuste fino del estilo de iluminacion mediante la LoRA `relight`.
- Alineacion preferencial mediante la LoRA DPO de SCAIL-2.
- Integracion directa en flujos de ComfyUI con los nodos nativos de carga de modelos, text encoder, CLIP vision, VAE y LoRAs.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general ni audio.

## Casos de uso

- Animacion de personajes para produccion audiovisual: cargando `wan2.2_animate_14B_int8_convrot` en ComfyUI se puede animar un retrato o figura a partir de una imagen de referencia y una secuencia de control, util para previzualizacion y prototipado de escenas.
- Generacion image-to-video rapida en 480p: con la LoRA `lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16` se reducen los pasos de muestreo, lo que permite iterar borradores de video en menos tiempo antes de un render final de mayor calidad.
- Reiluminacion de clips generados: la LoRA `wan2.1_SCAIL_2_relight_lora_bf16` permite ajustar la iluminacion de un video sintetizado para integrarlo en una secuencia concreta sin regenerar desde cero.
- Ajuste de preferencias visuales: la LoRA DPO de SCAIL-2 se puede aplicar para orientar el estilo de salida hacia el gusto del estudio en place de reentrenar el checkpoint completo.
- Despliegue reproducible de un entorno ComfyUI: el comando `hf download beycanai/video-models --local-dir ComfyUI/models` deja todas las dependencias en su sitio, util para equipos que comparten una misma configuracion de generacion de video.
- Archivado y espejo interno de pesos: al copiar los ficheros sin modificar, el repositorio sirve como copia de referencia para entornos sin acceso directo a los repositorios de Comfy-Org.
- Educacion y experimentacion: permite a investigadores comparar las variantes Wan 2.2 Animate, Wan Animate 2 y SCAIL-2 con los mismos componentes auxiliares y aislar el efecto de cada checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los checkpoints de difusion en int8 ocupan entre 16,65 y 18,41 GB en disco; en inferencia se necesita ademas el text encoder (6,74 GB en fp8), CLIP vision (1,26 GB) y VAE (0,25 GB), por lo que un pipeline completo requiere del orden de 24-32 GB de VRAM si se cargan todos los componentes a la vez. No se dispone de cifras oficiales de VRAM pico.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano de los pesos, se necesitan GPU profesionales con al menos 24 GB (A100, H100, L40S) o consumer de gama alta con 24 GB (RTX 3090, RTX 4090).
- Cabe en consumer GPU: si, en RTX 3090/4090 (24 GB) siempre que se gestionen con cuidado los componentes auxiliares; en tarjetas de 16 GB requeriria descarga selectiva de modulos.
- Opciones de despliegue: ComfyUI es el entorno previsto (los nombres de carpeta replican su estructura `models/`). No se documentan otros backends (vLLM, llama.cpp, Ollama, TGI) para estos checkpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| beycanai/video-models (agregado) | 14B por checkpoint | No disponible | Difusion video (Wan) | other | Hugging Face, 63,2 GB |
| Comfy-Org/Wan_2.2_ComfyUI_Repackaged | 14B | No disponible | Difusion video | No disponible en la informacion | Hugging Face (fuente original) |
| Comfy-Org/Wan-Animate-2 | No disponible | No disponible | Difusion video | No disponible en la informacion | Hugging Face (fuente original) |
| Comfy-Org/SCAIL-2 | No disponible | No disponible | Difusion video | No disponible en la informacion | Hugging Face (fuente original) |

La comparativa relevante es con los repositorios originales de Comfy-Org, de los que este repositorio es una copia empaquetada. Las diferencias son de conveniencia (estructura de carpetas para ComfyUI, descarga unica) y no de capacidades del modelo.

## Limitaciones y advertencias

- No es un modelo propio: es una redistribucion de pesos de terceros; el autor no aporta entrenamiento, evaluacion ni garantias de calidad.
- Licencia `other` sin texto de licencia en la model card: cada fichero conserva la licencia de su fuente original, pero no se detalla cual es, lo que dificulta verificar el uso comercial.
- No hay informacion sobre idiomas soportados, sesgos, alucinaciones ni limitaciones de contexto; no se puede evaluar su robustez en produccion.
- El repositorio pesa 63,2 GB; la descarga completa requiere espacio en disco y ancho de banda considerables, y el comando de descarga sobrescribe la carpeta `ComfyUI/models` del usuario.
- Los checkpoints estan cuantizados a int8 (`convrot`), lo que puede degradar la calidad respecto a los pesos originales en bf16/fp16.
- No se documentan requisitos de VRAM, latencia ni compatibilidad con versiones de ComfyUI; el usuario debe validar el entorno por su cuenta.
- Sin descargas ni likes en el momento de la consulta: no hay senal de uso comunitario ni de mantenimiento.
- No se deben tratar los nombres de fichero como especificaciones oficiales; son etiquetas del autor del agregado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/beycanai/video-models
- Fuente original Wan 2.2: https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged
- Fuente original Wan Animate 2: https://huggingface.co/Comfy-Org/Wan-Animate-2
- Fuente original SCAIL-2: https://huggingface.co/Comfy-Org/SCAIL-2
- ComfyUI (entorno previsto): https://github.com/comfyanonymous/ComfyUI
