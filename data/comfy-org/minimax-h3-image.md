# Comfy-Org/MiniMax-H3-Image

## Resumen

MiniMax H3 Image es un modelo de difusion texto-a-imagen desarrollado originalmente por MiniMax y reempaquetado por Comfy-Org para su uso directo en ComfyUI. Este repositorio no contiene el modelo original, sino una distribucion en fichero unico (`diffusion-single-file`) que incluye los pesos del modelo de difusion podado y cuantizado a int8, junto con los text encoders necesarios y el VAE en fp16. Su proposito es facilitar el despliegue del modelo en el ecosistema ComfyUI sin necesidad de gestionar el repositorio original de MiniMax.

El modelo resuelve la generacion de imagenes a partir de descripciones textuales, e incluye un flujo de trabajo de edicion de imagen. La arquitectura subyacente combina un modelo de difusion con text encoders basados en Qwen (Qwen3.5-9B y Qwen3VL-32B), lo que sugiere capacidad de comprension de prompts complejos y posiblemente entrada multimodal en el encoder. El repositorio tiene un tamano de 143 GB, lo que refleja la presencia de multiples variantes de text encoders en int8 y nvfp4.

Su relevancia actual radica en la elevada adopcion (mas de 2,6 millones de descargas y 519 likes) y en que ofrece una via practica para usar MiniMax H3 Image en produccion con ComfyUI, con cuantizaciones optimizadas para reducir requisitos de VRAM. La licencia es especifica y restrictiva, con umbrales de facturacion que afectan al uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (texto-a-imagen) con text encoders Qwen; detalles de la arquitectura interna no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (modelo de difusion podado, text encoder Qwen3VL-32B), nvfp4 AWQ (text encoder Qwen3VL-32B), w4a8 GPTQ (Qwen3.5-9B para prompt enhancer), fp16 (VAE) |
| Idiomas soportados | no disponible (la model card no especifica idiomas) |
| Licencia | minimax-h3-image-community-license-agreement (distinta de la licencia original de MiniMax H3) |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo de difusion (tipo de backbone, mecanismo de atencion, numero de pasos de muestreo ni esquema de entrenamiento). Lo que si se deduce del reempaquetado es la composicion del pipeline: un modelo de difusion principal (`minimax_h3_image_pruned_int8_convrot.safetensors`), un VAE en fp16 (`minimax_h3_image_vae_fp16.safetensors`) y dos text encoders basados en Qwen3VL-32B (uno en int8 y otro en nvfp4 AWQ), ademas de un modelo Qwen3.5-9B en w4a8 GPTQ recomendado para mejora de prompts.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. El sufijo `convrot` en el nombre del fichero de difusion sugiere algun tipo de transformacion de convolucion o rotacion, pero no hay documentacion que lo confirme.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) mediante difusion.
- Edicion de imagen guiada por prompt, segun el workflow oficial "MiniMax-H3-Image: Image Edit".
- Comprension de prompts complejos gracias a text encoders basados en Qwen3VL-32B, que incluye capacidad multimodal de vision-lenguaje.
- Mejora de prompts mediante el modelo auxiliar Qwen3.5-9B (w4a8 GPTQ) y el nodo Generate Text de ComfyUI.
- Integracion nativa con ComfyUI mediante ficheros de modelo en formato single-file.
- Soporte de cuantizaciones multiples (int8, nvfp4 AWQ, w4a8 GPTQ) para adaptarse a distintos presupuestos de VRAM.
- No se documentan capacidades de tool calling, agentes, audio ni thinking mode.

## Casos de uso

- Generacion de ilustraciones para contenido editorial: el modelo produce imagenes a partir de descripciones textuales, adecuado para crear material visual de articulos y blogs con control por prompt y el enhancer de Qwen3.5-9B.
- Edicion de imagenes existentes: el workflow "Image Edit" permite modificar imagenes con instrucciones textuales, util para retoques en flujos de diseno sin herramientas manuales.
- Prototipado rapido de conceptos visuales: con ComfyUI y los pesos en int8, un equipo puede iterar sobre ideas de producto o campana antes de encargar arte final.
- Generacion de assets para videojuegos o aplicaciones: texturas, bocetos de personajes y escenarios a partir de prompts, con la ventaja de las cuantizaciones que reducen la VRAM necesaria.
- Creacion de variaciones de imagen en pipelines de marketing: partiendo de una imagen base y aplicando ediciones por prompt para adaptar formatos y estilos.
- Automatizacion de contenido visual en ComfyUI: integracion en grafos de nodos para generar lotes de imagenes de forma programatica, aprovechando los workflows oficiales de text-to-image y edicion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio ocupa 143 GB, pero incluye multiples variantes de text encoders; la inferencia real depende de la combinacion elegida (modelo de difusion int8 + un text encoder + VAE).
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el uso de cuantizaciones int8 y nvfp4, se orienta a GPUs con soporte de estas precisiones (serie RTX 40/50, A100, H100), pero no hay confirmacion oficial.
- Compatibilidad con GPU de consumo: no confirmada. La presencia de text encoders de 32B en int8/nvfp4 y un modelo de difusion podado sugiere requisitos elevados, probablemente por encima de 16-24 GB de VRAM, aunque no hay dato verificado.
- Opciones de despliegue: ComfyUI (libreria `diffusion-single-file`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Licencia restrictiva: la MiniMax H3 Image Community License Agreement exige autorizacion previa por escrito de MiniMax si los ingresos anualizados del usuario y sus afiliados superan 1 millon de USD, o si se ofrece el modelo como servicio alojado a terceros. Es distinta de la licencia original de MiniMax H3.
- No se documentan sesgos conocidos, pero al ser un modelo de difusion texto-a-imagen es probable que herede sesgos de sus datos de entrenamiento (no confirmado).
- Riesgo de alucinacion visual: como todo modelo generativo de imagenes, puede producir contenido incoherente o no fiel al prompt.
- Idiomas soportados no especificados; el rendimiento multilingue de los prompts no esta documentado.
- No hay informacion sobre limites de resolucion, numero de pasos de muestreo ni parametros de inferencia recomendados.
- El repositorio es un reempaquetado de Comfy-Org, no el original de MiniMax; para detalles tecnicos completos debe consultarse el repositorio base `MiniMaxAI/MiniMax-H3-Image`.
- El uso comercial requiere revisar la licencia en detalle antes de desplegar en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- Modelo original: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Solicitud de licencia comercial: https://platform.minimax.io/license
- ComfyUI (GitHub): https://github.com/Comfy-Org/ComfyUI
- Workflow text-to-image: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_minimax_h3_image_t2i.json
- Workflow edicion de imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_minimax_h3_image_edit.json
