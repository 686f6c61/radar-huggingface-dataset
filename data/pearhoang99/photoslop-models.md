# pearhoang99/photoslop-models

## Resumen

`pearhoang99/photoslop-models` es un repositorio de distribucion publica de pesos base, no un modelo entrenado de forma independiente. Lo publica el usuario de Hugging Face pearhoang99 como espejo de los ficheros que requiere la aplicacion PhotoSlop AI Engine, una herramienta de edicion y generacion de imagenes. El repositorio agrupa pesos de varios componentes (modelos de difusion, codificadores de texto y VAE) en formato safetensors, con un total de 39,4 GB.

La relevancia tecnica del repositorio no esta en un modelo propio, sino en el conjunto de artefactos que distribuye: pesos de difusion identificados como `flux3-image-klein` y `flux-2-klein-9b`, codificadores de texto derivados de Qwen (Qwen3.5-9B, Qwen3-VL-4B, Qwen3-8B) y dos VAE (`flux3-vae` y `flux2-vae`). Varios de estos ficheros estan cuantizados en int8 con una transformacion de pesos denominada `convrot` en el nombre del fichero, y los codificadores de texto usan esquemas de cuantizacion mixta (w4a8, w4/bf16).

El repositorio se publica como espejo publico sin licencia unificada: cada fichero tiene su propia licencia (`per-file-licenses`), y el autor advierte explicitamente de que la disponibilidad publica no concede derechos comerciales. No incluye adaptadores de tarea, claves de firma, flujos de trabajo ni imagenes de usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio con pesos de difusion, codificadores de texto y VAE) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (`int8-convrot`, `int8_convrot`), w4a8, w4/bf16 mixta en codificadores de texto |
| Idiomas soportados | no disponible |
| Licencia | other / per-file-licenses (ver NOTICE.md); sin licencia Apache a nivel de repositorio |
| Formato de pesos | safetensors |

Ficheros incluidos en el repositorio:

| Fichero | Bytes |
|---|---:|
| text_encoders/qwen3.5_9b_flux3_prompt_upsampler_w4a8.safetensors | 6.724.090.780 |
| diffusion_models/flux3-image-klein-int8-convrot.safetensors | 5.827.874.779 |
| text_encoders/qwen3vl_4b_int8_convrot.safetensors | 4.858.559.240 |
| vae/flux3-vae.safetensors | 336.211.292 |
| diffusion_models/flux3-image-klein-base-int8-convrot.safetensors | 5.807.427.339 |
| vae/flux2-vae.safetensors | 336.213.556 |
| diffusion_models/flux-2-klein-9b_int8_convrot.safetensors | 9.439.880.096 |
| text_encoders/qwen3_8b_flux2_mixed_w4_bf16_pruned27.safetensors | 6.059.934.312 |

## Arquitectura y entrenamiento

No disponible. El repositorio no documenta arquitectura, datos de entrenamiento, numero de tokens ni procesos de alineacion (RLHF/DPO). Los nombres de los ficheros sugieren el uso de modelos de difusion de la familia Flux (variantes `flux3-image-klein`, `flux3-image-klein-base`, `flux-2-klein-9b`) como generadores de imagen, junto con codificadores de texto basados en Qwen (Qwen3.5-9B para un "prompt upsampler", Qwen3-VL-4B multimodal y Qwen3-8B podado en un 27 % para Flux 2) y VAEs especificos de cada familia.

La innovacion tecnica observable en los metadatos es la cuantizacion: los pesos de difusion se publican en int8 con una transformacion etiquetada como `convrot`, y los codificadores de texto emplean cuantizacion mixta (w4a8 para el upsampler de prompts, w4/bf16 mixta con poda para el codificador de Flux 2). El autor no proporciona detalles sobre el metodo de cuantizacion ni su impacto en calidad.

## Capacidades

- Generacion de imagenes y edicion fotografica por descripcion textual, segun la documentacion de la aplicacion PhotoSlop (generacion, edicion y eliminacion de fondos).
- "Prompt upsampling": expansion o reescritura de prompts mediante un codificador de texto Qwen3.5-9B cuantizado en w4a8.
- Procesamiento multimodal de entrada a traves del codificador Qwen3-VL-4B (vision-lenguaje).
- Codificacion y decodificacion latente de imagenes mediante los VAE de Flux 2 y Flux 3.
- Soporte de tool calling, agentes, razonamiento multi-paso, thinking mode, audio y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Edicion fotografica asistida por IA en aplicacion de escritorio: los pesos se descargan en las carpetas `diffusion_models/`, `text_encoders/` y `vae/` de PhotoSlop AI Engine y se activan pulsando Refresh, lo que permite generar y editar imagenes localmente.
- Eliminacion de fondos y expansion generativa: la aplicacion PhotoSlop documenta estas funciones sobre los pesos de difusion incluidos en este espejo.
- Reescritura automatica de prompts: el fichero `qwen3.5_9b_flux3_prompt_upsampler_w4a8` esta pensado para ampliar o reformular instrucciones de texto antes de la generacion de imagen.
- Experimentacion con cuantizacion int8 de modelos de difusion: los ficheros `int8-convrot` permiten evaluar el impacto de la cuantizacion int8 en calidad y requisitos de memoria frente a los pesos originales.
- Despliegue de pipelines texto-a-imagen con codificador multimodal: la combinacion de `flux-2-klein-9b` con `qwen3vl_4b_int8_convrot` permite construir un pipeline que acepte imagenes de referencia ademas de texto.
- Reutilizacion de componentes en otros proyectos: los VAE (`flux2-vae`, `flux3-vae`) y los codificadores de texto Qwen cuantizados pueden emplearse por separado en pipelines propios, siempre que la licencia por fichero lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Espacio en disco: 39,4 GB para el repositorio completo; el fichero individual mas grande es `flux-2-klein-9b_int8_convrot.safetensors` con 9,44 GB.
- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de difusion de 9,44 GB en int8 y un codificador de texto de 6,72 GB requieren al menos ~16-20 GB de VRAM si se cargan simultaneamente sin offloading; con offloading a CPU o carga secuencial puede reducirse el pico.
- GPU recomendadas: no disponible. Por tamano de los ficheros, GPUs con 24 GB o mas (RTX 4090, A100, H100) son el objetivo razonable para carga completa.
- Compatibilidad con GPU de consumo: probable en RTX 3090/4090 (24 GB) con carga secuencial u offloading; no confirmado por el autor.
- Opciones de despliegue: la unica ruta documentada es PhotoSlop AI Engine (descarga en carpetas y Refresh). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican directamente a pesos de difusion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. El repositorio no identifica versiones, autores originales ni repositorios oficiales de los pesos de Flux o Qwen que redistribuye, por lo que no es posible establecer una comparativa fiable con los modelos de origen ni con alternativas.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: es un espejo de pesos de terceros; cualquier limitacion de los modelos originales (Flux, Qwen) aplica sin que el repositorio la documente.
- Licencia por fichero (`per-file-licenses`): la disponibilidad publica no concede derechos comerciales; es obligatorio revisar `NOTICE.md` y los textos de licencia de cada fichero antes de cualquier uso.
- No hay licencia Apache a nivel de repositorio.
- Ausencia total de documentacion sobre sesgos, alucinacion, idiomas o calidad: no disponible.
- Los pesos estan cuantizados (int8, w4a8, w4/bf16 con poda del 27 %): puede haber degradacion de calidad respecto a los originales no cuantizados, sin datos publicados que la cuantifiquen.
- El repositorio no incluye adaptadores de tarea, flujos de trabajo ni claves de firma; la funcionalidad completa depende de la aplicacion PhotoSlop.
- Fecha de creacion indicada como 2026-11-09, posterior a la fecha habitual de publicacion; conviene verificar la integridad de los ficheros con los SHA-256 listados en la model card.
- Uso en produccion: sin benchmarks, sin garantias de soporte y con licencia ambigua, no es recomendable como dependencia critica sin auditoria legal y tecnica previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/pearhoang99/photoslop-models
- Aviso de licencias: https://huggingface.co/pearhoang99/photoslop-models/blob/main/NOTICE.md
- Perfil del autor: https://huggingface.co/pearhoang99
- Aplicacion PhotoSlop: https://nunuworks.com/apps/photoslop
- Proyecto PhotoSlop en GitHub (relacionado, no confirmado como oficial): https://github.com/zeveck/photoslop2
- Sitio PHOTOSLOP (relacionado, no confirmado): https://slop.photo/
- Perfil del autor en Shakker: https://www.shakker.ai/modelinfo/1af690aeaefb48da8ec459a1ea8bfb74
