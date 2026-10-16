# Comfy-Org/MOSS-Image

## Resumen

Comfy-Org/MOSS-Image es un repositorio de reempaquetado para ComfyUI del modelo de generacion de imagenes MOSS-Image, desarrollado originalmente por el equipo OpenMOSS (OpenMOSS-Team). No se trata del modelo original, sino de una redistribucion en formato "diffusion-single-file" que reorganiza los pesos en carpetas compatibles con el arbol de directorios de ComfyUI (`models/diffusion_models`, `models/text_encoders`, `models/vae`). El repositorio lo publica Comfy-Org, la organizacion vinculada al ecosistema ComfyUI, con licencia Apache 2.0.

El paquete incluye cuatro pesos de difusion (variantes base y SFT, en bf16 e int8 con "convrot_attn"), un text encoder basado en Qwen3.5 9B en int8 y un VAE identificado como flux2-vae. El tamano total del repositorio es de 48,6 GB. Esta estructura sugiere un pipeline de difusion texto-a-imagen de factura reciente, con un encoder de lenguaje de gran tamano (9B) y un VAE heredado de la familia Flux 2, aunque la model card no aporta detalles de arquitectura, entrenamiento ni evaluacion.

Su relevancia ahora es practica: permite a usuarios de ComfyUI cargar MOSS-Image directamente en sus flujos de trabajo sin necesidad de conversion manual de pesos, eligiendo entre las variantes base y ajustada (SFT) y entre precision bf16 o cuantizacion int8. No obstante, el repositorio no documenta parametros, contexto, idiomas, sesgos ni benchmarks, por lo que cualquier evaluacion tecnica debe remitirse a los repositorios originales de OpenMOSS-Team.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion (modelo de generacion de imagenes; arquitectura interna no detallada en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 e int8 (variante "convrot_attn") |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pipeline "diffusion-single-file") |
| Text encoder | Qwen3.5 9B en int8 (archivo `qwen3.5_9b_int8_convrot.safetensors`) |
| VAE | flux2-vae (`flux2-vae.safetensors`) |
| Repositorio base | OpenMOSS-Team/MOSS-Image-Base y OpenMOSS-Team/MOSS-Image-SFT |
| Tamano del repositorio | 48,6 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo de difusion, el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO. Lo unico documentado es el reempaquetado para ComfyUI: las variantes incluidas son `moss_image_base_bf16.safetensors`, `moss_image_base_int8_convrot_attn.safetensors`, `moss_image_sft_bf16.safetensor` y `moss_image_sft_int8_convrot_attn.safetensors`, lo que confirma la existencia de un checkpoint base y otro ajustado con fine-tuning supervisado (SFT).

Los componentes auxiliares si aportan informacion sobre el pipeline: un text encoder Qwen3.5 de 9B parametros cuantizado a int8 y un VAE denominado flux2-vae, que sugiere compatibilidad o herencia con la familia Flux 2 para la decodificacion latente. El sufijo "convrot_attn" en los archivos int8 indica una tecnica de cuantizacion especifica aplicada a las capas de atencion, orientada a reducir el uso de VRAM manteniendo fidelidad en la generacion. No hay informacion adicional sobre innovaciones tecnicas, decodificacion especulativa ni optimizaciones de atencion.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image), en versiones base y ajustada (SFT).
- Ejecucion dentro de flujos de trabajo de ComfyUI mediante el formato diffusion-single-file.
- Carga de pesos en dos precisiones: bf16 (mayor calidad, mas VRAM) e int8 con convrot_attn (menor huella de memoria).
- Uso de un text encoder de gran tamano (Qwen3.5 9B), lo que en principio favorece la comprension de prompts complejos y matizados, si bien no se documenta el rendimiento concreto.
- Integracion con el VAE flux2-vae para la decodificacion de latentes a imagen.
- Soporte de tool calling, agentes, multi-step reasoning, vision, audio y modo de razonamiento (thinking): no disponible (se trata de un modelo de generacion de imagenes, no de un modelo de lenguaje conversacional).

## Casos de uso

- Generacion de imagenes en flujos ComfyUI: el usuario coloca los archivos en `models/diffusion_models`, `models/text_encoders` y `models/vae` y construye un grafo de generacion texto-a-imagen sin conversion previa de pesos.
- Prototipado visual en equipos de diseno: la variante SFT permite generar ilustraciones a partir de descripciones de producto o concepto, integrándose en revisiones iterativas dentro de ComfyUI.
- Despliegue con VRAM limitada: la variante int8 con convrot_attn reduce el consumo de memoria frente a bf16, lo que facilita su uso en GPUs de gama alta para consumidores.
- Investigacion en difusion: disponer de un checkpoint base y otro SFT en el mismo repositorio permite comparar el efecto del fine-tuning supervisado sobre el mismo pipeline.
- Automatizacion de contenido grafico: encadenando nodos de ComfyUI se puede generar lotes de imagenes para catalogos, banners o contenido editorial de forma reproducible.
- Experimentacion con text encoder de 9B: el uso de Qwen3.5 9B como encoder permite estudiar la influencia de un codificador de lenguaje grande en la fidelidad del prompt.
- Reproducibilidad de pipelines: al estar los pesos en safetensors y estructura fija, se facilita la versionado y la replicacion de resultados en distintos equipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio completo ocupa 48,6 GB, pero ese total agrega cuatro checkpoints de difusion mas el text encoder y el VAE; la VRAM necesaria corresponde a un unico checkpoint mas el encoder y el VAE cargados simultaneamente, no a la suma del repositorio.
- GPU recomendadas: no disponibles. Por el tamano del text encoder (Qwen3.5 9B en int8) y el uso de safetensors de difusion, se requiere una GPU con una cantidad de memoria considerable; las variantes int8 estan pensadas para reducir este requisito.
- Cabe en GPU de consumidor: no confirmado. La existencia de cuantizaciones int8 con convrot_attn sugiere que se busca hacer viable la ejecucion en hardware de consumidor, pero no hay cifras publicadas que lo confirmen.
- Opciones de despliegue: ComfyUI (formato nativo "diffusion-single-file" y nodos comfyui). No se documentan opciones para vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de difusion de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento, parametros ni contexto de MOSS-Image, por lo que no es posible establecer una comparativa cuantitativa fiable. A continuacion se indican alternativas de la misma categoria (generacion de imagenes texto-a-imagen en safetensors para ComfyUI), pero con la advertencia de que faltan cifras de MOSS-Image para contrastarlas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Comfy-Org/MOSS-Image | no disponible | no disponible | Apache 2.0 | HuggingFace (reempaquetado ComfyUI) |
| Alternativas de la misma categoria (p. ej. familia Flux, SD3.5) | no disponible en esta ficha | no disponible en esta ficha | variable segun modelo | HuggingFace / ComfyUI |

## Limitaciones y advertencias

- Repositorio de reempaquetado: este repositorio no es el modelo original, sino una reorganizacion de pesos para ComfyUI; para informacion completa debe consultarse OpenMOSS-Team/MOSS-Image-Base y OpenMOSS-Team/MOSS-Image-SFT.
- Ausencia de documentacion tecnica: no se detallan parametros, datos de entrenamiento, idiomas, sesgos ni evaluacion, lo que impide valorar su rendimiento antes de probarlo.
- Riesgo de alucinacion visual: como todo modelo generativo de imagenes, puede producir contenidos inexactos, artefactos o representaciones sesgadas segun el prompt.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de contexto o idioma: no disponibles.
- Licencia: Apache 2.0, lo que en principio permite uso comercial, pero conviene verificar la licencia de los repositorios originales de OpenMOSS-Team y de los componentes (Qwen3.5 y flux2-vae) antes de un despliegue en produccion.
- Consistencia de nombres de archivo: la model card cita `moss_image_sft_bf16.safetensor` (sin la "s" final de `.safetensors`), lo que puede ser una errata; conviene verificar el nombre real al descargar.
- Coste de hardware: el repositorio completo es de 48,6 GB; aunque solo se cargue un checkpoint a la vez, la descarga y el almacenamiento requieren espacio considerable.
- Fecha de publicacion: el repositorio figura creado el 2026-10-16, informacion que debe tomarse tal cual aparece en la ficha de HuggingFace.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Comfy-Org/MOSS-Image
- Modelo base original: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Modelo ajustado original: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Sitio oficial de Comfy: https://comfy.org/
- Descarga de Comfy Desktop: https://comfy.org/download
- Comfy Cloud: https://cloud.comfy.org/
- Comunidad francoparlante de ComfyUI (referencia de ecosistema): https://comfyui.fr/
