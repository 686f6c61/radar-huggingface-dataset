# fatangel420/NSFW-Character-Sheets-KREA2

## Resumen

Este repositorio no es un modelo de lenguaje ni un modelo de difusión empaquetado de forma autónoma, sino un **workflow multi-etapa para ComfyUI** (versión V11.4 Experiment B, construido sobre la arquitectura V11.1 Full-Body Master) orientado a la generación de personajes consistentes a partir de Krea-2-Turbo. Lo publica el usuario fatangel420 bajo licencia Artistic-2.0 y su único idioma declarado es el inglés. El problema que aborda es el *identity drift*: en pipelines de generación de personajes, las imágenes de retrato, referencia de cuerpo completo y versión vestida tienden a divergir hacia personas distintas cuando se generan de forma independiente.

La solución propuesta es una arquitectura *master-first*: se genera primero un "Bare Master" canónico en resolución 1024x1824 con 12 pasos base, un reescalado latente de 1,25x y un refinado hires de 8 pasos. A partir de ese máster se derivan, mediante Qwen Rapid AIO SFW v23 y una pasada de reconstrucción con Krea2 Identity Edit v1.2, tanto el retrato como el cuerpo completo vestido, reutilizando siempre la misma identidad de referencia.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, no publica pesos propios ni resultados de benchmarks, y depende de checkpoints y LoRAs de terceros que el usuario debe descargar por separado. Está marcado como `not-for-all-audiences` y su etapa Bare Master está configurada para generación NSFW de personajes adultos ficticios, lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión latente multi-etapa orquestado en ComfyUI; no es un modelo único. Cadena base: Krea2 Turbo FP8 (diffusion model) + text encoder Qwen3-VL-4B-Instruct + VAE `sharp_vae_bf16`. Etapas de estructura: Qwen Rapid AIO SFW v23. Etapas de edición/identidad: Krea2 Identity Edit v1.2 |
| Parametros totales | No disponible. El repositorio no incluye pesos propios. El nombre de fichero `darkBeast30BF16INT8_darkBeastKREA2FP8.safetensors` sugiere un modelo de difusión de aproximadamente 30 000 millones de parámetros, pero no se confirma en la model card |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica al pipeline de difusión. El text encoder declarado es Qwen3-VL-4B-Instruct-Uncensored; la model card no especifica su ventana de contexto |
| Tipos de cuantizacion | FP8 (modelo de difusión Krea2 Turbo), BF16/INT8 (referenciados en el nombre del checkpoint), VAE en bf16 |
| Idiomas soportados | Inglés (`en`), según los metadatos del repositorio |
| Licencia | Artistic-2.0 |
| Formato de pesos | safetensors (todos los componentes referenciados) |

## Arquitectura y entrenamiento

El repositorio describe una arquitectura de inferencia, no un proceso de entrenamiento. No se publican datos sobre el dataset de entrenamiento, número de tokens, composición del corpus ni técnicas de alineación (RLHF, DPO) para ninguno de los componentes. Se trata, por tanto, de un ensamblaje de modelos preexistentes: el diffusion model Krea2 Turbo FP8 se carga mediante `UNETLoader`; el text encoder Qwen3-VL-4B-Instruct-Uncensored se carga con `CLIPLoader` de tipo `krea2`; y el VAE `sharp_vae_bf16` completa la cadena de decodificación.

La innovación del workflow es de orquestación, no de arquitectura de red. Se aplica un esquema en tres ramas con dependencias explícitas: (1) el Bare Master se genera a 1024x1824 con 12 pasos base, upscale latente 1,25x y 8 pasos de refinado hires, aplicando `skin_human.safetensors` a fuerza 0,80 y `Krea2_HMNSFW_AIO.safetensors` a 0,55, más dos LoRAs de anatomía masculina (`Krea 2 - Penis Lora v2` a 0,65 y `detailed_penis_krea_2` a 0,35); (2) el retrato se estructura con Qwen Rapid AIO SFW v23 tomando el Bare Master como referencia y se reconduce con Krea2 Identity Edit v1.2 a fuerza 1,0; (3) el cuerpo completo vestido se estructura a partir del Bare Master *y* del retrato final, y se somete a la misma pasada de identidad. Los nodos personalizados necesarios son `Krea2EditModelPatch` y `Krea2EditGroundedEncode` (paquete `comfyui-krea2edit`), además del nodo nativo de ComfyUI `TextEncodeQwenImageEditPlus`.

## Capacidades

- Generación de personajes consistentes en tres representaciones coordinadas: Bare Master (cuerpo completo canónico), retrato de cabeza y hombros de estilo comercial y cuerpo completo vestido.
- Reducción de la deriva de identidad entre retrato y cuerpo completo al derivar ambas salidas de una única fuente máster.
- Generación texto-a-imagen (t2i) en la etapa base y edición imagen-a-imagen en las etapas de estructura e identidad.
- Control de identidad mediante LoRA dedicada (`krea2_identity_edit_v1_2`) con énfasis en reconstrucción fotográfica y detalle, no en rediseño del personaje.
- Ajuste de realismo de piel mediante LoRA compartida a fuerza 0,80.
- Condicionamiento textual a través de un text encoder lingüístico-visionario (Qwen3-VL-4B-Instruct).
- Capacidad NSFW limitada a la rama Bare Master, pensada para sujetos adultos ficticios o con consentimiento.
- No se documenta soporte de *tool calling*, function calling, uso como agente, razonamiento multi-paso ni capacidades de audio.

## Casos de uso

- Preproducción de personajes para narrativa gráfica: el workflow genera una hoja de personaje coherente (retrato + cuerpo completo vestido + referencia anatómica) que sirve como documento de identidad visual para ilustradores y guionistas gráficos.
- Referencia de continuidad en producción audiovisual: al derivar todas las vistas del mismo máster, se reduce el trabajo de corrección de continuidad entre planos de retrato y planos de cuerpo completo de un mismo personaje ficticio.
- Creación de *character sheets* para videojuegos o cómics: las tres salidas coordinadas cubren los requisitos habituales de una ficha de personaje (primer plano, cuerpo entero y referencia anatómica) sin regenerar la identidad en cada vista.
- Automatización de pipelines de arte conceptual en ComfyUI: el grafo exportado expone solo tres nodos `SaveImage`, lo que facilita integrarlo en scripts de generación por lotes controlados por API.
- Investigación en consistencia de identidad: el repositorio sirve como caso de estudio reproducible de arquitectura *master-first* frente a generación independiente por vista.
- Prototipado de personajes adultos para ficción: la rama NSFW permite estudiar cómo se comporta la consistencia de identidad en contextos sin ropa, siempre con sujetos ficticios adultos.
- Desarrollo y prueba de nodos personalizados de ComfyUI: el workflow ejercita `Krea2EditModelPatch`, `Krea2EditGroundedEncode` y `TextEncodeQwenImageEditPlus`, por lo que es útil como banco de pruebas para quienes mantienen esos nodos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas cuantitativas de consistencia de identidad, FID, CLIP score, ni comparaciones numéricas con alternativas. Tampoco se documentan tiempos de inferencia ni throughput medidos.

## Requisitos de hardware

- No se publican requisitos oficiales de VRAM ni GPU recomendadas en la model card.
- Estimación no confirmada, deducida de los componentes referenciados: el checkpoint de difusión parece un modelo de ~30 000 millones de parámetros en FP8, lo que sitúa el peso del UNet en torno a 30 GB, a lo que se suma el text encoder Qwen3-VL-4B y el VAE. En la práctica, esto apunta a GPUs de 48-80 GB (A100 80 GB, H100 80 GB) para ejecutar la cadena completa sin *offloading* agresivo.
- En GPUs de consumo (RTX 4090 con 24 GB, RTX 5090 con 32 GB) sería necesario *offloading* a RAM o cuantización adicional no documentada; no hay confirmación de que el workflow funcione en esas configuraciones tal cual está exportado.
- Despliegue: exclusivamente ComfyUI, con soporte nativo de Krea2 en la build y el paquete `comfyui-krea2edit` instalado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este pipeline de difusión.
- Latencia y throughput: no disponibles. El workflow declara 20 pasos efectivos en la etapa base (12 + 8), pero no se indican tiempos por imagen.

## Comparativa con modelos similares

| Sistema | Tipo | Cadena base | Identidad | Licencia | Disponibilidad de datos |
|---|---|---|---|---|---|
| fatangel420/NSFW-Character-Sheets-KREA2 | Workflow ComfyUI multi-etapa | Krea-2-Turbo + Qwen Rapid AIO + Krea2 Identity Edit | Master-first con LoRA de edición de identidad | Artistic-2.0 | 0 descargas, 0 likes, sin benchmarks |
| krea/Krea-2-Turbo | Modelo base de difusión | No aplica | Sin mecanismo de consistencia propio | No disponible en la información | No disponible |
| Alternativas de consistencia de personaje (p. ej. IP-Adapter, InstantID, Reference-only en SDXL) | Enfoques de condicionamiento por referencia | Variables | Referencia por imagen o embedding | No disponible en la información | No disponible |

No es posible establecer una comparación cuantitativa: el repositorio no publica métricas y la información disponible no incluye resultados de modelos alternativos. La comparación con Krea-2-Turbo es estructural, no de rendimiento.

## Limitaciones y advertencias

- Contenido NSFW: la etapa Bare Master está configurada para generación de desnudos. El propio autor prohíbe explícitamente el uso para imaginar sexualmente a menores, *deepfakes* no consentidos de personas reales u otro contenido ilícito.
- Las LoRAs de anatomía masculina (`Krea 2 - Penis Lora v2` y `detailed_penis_krea_2`) están activas por defecto en la cadena del modelo y **no** se desactivan automáticamente. Si el controlador no las desactiva de forma dinámica, hay que silenciarlas manualmente para personajes a los que no apliquen.
- Riesgo de alucinación visual y de drift residual: aunque el diseño *master-first* mitiga la divergencia de identidad, no la elimina; las pasadas de edición de identidad pueden alterar rasgos si se fuerzan demasiado.
- Idioma: prompts únicamente en inglés según los metadatos; el pipeline no declara soporte multilingüe.
- Licencia Artistic-2.0: conviene revisar sus condiciones antes de un uso comercial, ya que impone obligaciones de atribución y de redistribución de la licencia que difieren de licencias permisivas tipo Apache-2.0 o MIT. Además, los componentes de terceros (Krea2 Turbo, Qwen, LoRAs) tienen sus propias licencias, no cubiertas por la de este repositorio.
- Dependencia de ficheros externos con nombres exactos: los checkpoints y LoRAs no se distribuyen aquí, por lo que el workflow falla si no se replican las rutas y nombres indicados.
- Dependencia de nodos personalizados (`comfyui-krea2edit`) y de una build de ComfyUI con soporte nativo de Krea2; la model card advierte de que hay que actualizar ComfyUI si falta `TextEncodeQwenImageEditPlus`.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que permitan verificar la reproducibilidad del grafo.
- El repositorio está marcado `not-for-all-audiences` y `region:us`, lo que puede limitar su visibilidad y su uso en determinados entornos corporativos o académicos.
- Las fechas de creación y actualización del repositorio figuran como 2026-10-02; conviene verificar la vigencia del contenido antes de integrarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/fatangel420/NSFW-Character-Sheets-KREA2
- Modelo base declarado: https://huggingface.co/krea/Krea-2-Turbo
- Paquete de nodos personalizados ComfyUI-Krea2Edit: https://github.com/lbouaraba/comfyui-krea2edit
- Búsqueda web: no se han encontrado enlaces relevantes (los resultados devueltos corresponden a servicios de traducción sin relación con el modelo).
