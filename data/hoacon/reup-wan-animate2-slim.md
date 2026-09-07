# hoacon/reup-wan-animate2-slim

## Resumen

El repositorio `hoacon/reup-wan-animate2-slim` contiene un subconjunto mínimo de pesos para ejecutar el modelo Wan-Animate-2, desarrollado por Comfy-Org y Wan-Video. No es un modelo completo, sino una caché de runtime de cinco archivos Safetensors utilizada por el servicio REUP Motion Serverless. Wan-Animate-2 es un framework de animación de personajes de extremo a extremo que consume vídeos de conducción directamente en un Diffusion Transformer rediseñado, logrando generación de movimiento de alta fidelidad y preservación de identidad al eliminar extractores de movimiento intermedios. El repositorio incluye el modelo de difusión cuantizado int8, un lora de destilación para 480p, el text encoder UMT5-XXL en fp8, un clip vision y un VAE. La licencia es Apache-2.0. No se proporcionan datos de parámetros totales, contexto ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) rediseñado para animación de personajes |
| Parametros totales | No disponible (el nombre del lora incluido sugiere un modelo base de 14B, sin confirmar) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de animación de vídeo) |
| Tipos de cuantizacion | int8 (modelo de difusión), fp8 (text encoder), bf16 (VAE) |
| Idiomas soportados | No disponible (el text encoder UMT5-XXL es multilingüe, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Wan-Animate-2 utiliza un Diffusion Transformer rediseñado que procesa directamente el vídeo de conducción, sin depender de extractores de movimiento intermedios. Este enfoque de extremo a extremo permite una generación de movimiento más fiel y una mejor preservación de la identidad del personaje. El repositorio REUP contiene una selección específica de archivos para un workflow validado: un modelo de difusión cuantizado int8, un lora de destilación (`lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16`) para generar vídeo a 480p con menos pasos, el text encoder `umt5_xxl_fp8_e4m3fn_scaled`, un `clip_vision_h` y el VAE `Wan2_1_VAE_bf16`. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens ni procesos de RLHF o DPO en la información disponible.

## Capacidades

- Animación de personajes: genera vídeo de un personaje a partir de una imagen de referencia y un vídeo de conducción, manteniendo la identidad del personaje.
- Generación de movimiento de alta fidelidad: el framework elimina extractores de movimiento intermedios, lo que mejora la precisión del movimiento transferido.
- Integración con ComfyUI: el repositorio está etiquetado para su uso con ComfyUI y contiene los archivos necesarios para un workflow específico.
- Cuantización mixta: incluye pesos en int8, fp8 y bf16, lo que permite reducir el consumo de memoria en distintos componentes.
- No es un modelo de lenguaje: no ofrece tool calling, soporte de agentes, razonamiento textual ni generación de texto.

## Casos de uso

- Animación de personajes para producción audiovisual: un artista puede usar el modelo para transferir los movimientos de un actor real a un personaje digital, manteniendo la identidad visual del personaje. Es adecuado porque Wan-Animate-2 está diseñado específicamente para esta tarea.
- Creación de avatares digitales para streaming o videollamadas: el modelo puede animar un avatar a partir de un vídeo de conducción en tiempo real o en postproducción. La preservación de identidad es clave en este escenario.
- Generación de contenido para redes sociales: se pueden crear clips cortos de personajes animados a partir de una imagen estática y un vídeo de referencia. El lora de destilación a 480p reduce el coste de generación para este tipo de contenido.
- Prototipado rápido de animaciones en ComfyUI: los investigadores y artistas pueden importar los cinco archivos del repositorio y ejecutar el workflow validado sin necesidad de descargar el modelo completo.
- Investigación en generación de vídeo por IA: el modelo sirve como referencia para estudiar arquitecturas de Diffusion Transformer aplicadas a animación de personajes, especialmente por su enfoque de extremo a extremo.
- Efectos visuales en postproducción: el modelo puede utilizarse para reemplazar la actuación de un actor en un plano, transfiriendo el movimiento a un personaje generado. La cuantización int8 del modelo de difusión facilita su integración en pipelines con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se han publicado requisitos de hardware oficiales para este repositorio.
- El tamaño total del repositorio es de 25.6 GB, lo que indica el espacio de disco necesario para los cinco archivos.
- Para conocer los requisitos de VRAM y las GPU recomendadas, se debe consultar la documentación del modelo upstream `Comfy-Org/Wan-Animate-2`.
- No se dispone de datos de latencia, throughput ni opciones de despliegue específicas para este subconjunto.

## Comparativa con modelos similares

No se han proporcionado datos de comparación en la información disponible. Este repositorio es un subconjunto del modelo completo `Comfy-Org/Wan-Animate-2`, que contiene todos los pesos y archivos del framework. La diferencia principal es que `reup-wan-animate2-slim` incluye únicamente los cinco archivos necesarios para el workflow de REUP Motion Serverless.

## Limitaciones y advertencias

- Es un subconjunto mínimo de archivos, no un modelo completo. Depende del workflow de REUP Motion Serverless y puede no ser compatible con otros pipelines.
- No se incluyen datos de clientes, prompts, imágenes, vídeos, API keys ni código fuente privado, según la model card.
- No hay información sobre sesgos, riesgos de alucinación ni limitaciones de idioma, ya que no es un modelo de lenguaje.
- La licencia Apache-2.0 permite uso comercial, pero se debe revisar la licencia del repositorio upstream `Comfy-Org/Wan-Animate-2` antes de redistribuir o usar en producción.
- El repositorio no tiene descargas ni likes, lo que sugiere que es una caché de runtime interna y no un modelo principal para uso general.

## Enlaces

- HuggingFace: https://huggingface.co/hoacon/reup-wan-animate2-slim
- Repositorio upstream: https://huggingface.co/Comfy-Org/Wan-Animate-2
- GitHub Wan-Animate-2: https://github.com/Wan-Video/Wan-Animate-2
- GitHub wan-animate/wananimate: https://github.com/wan-animate/wananimate
