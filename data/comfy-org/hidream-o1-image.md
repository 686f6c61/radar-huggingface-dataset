# Comfy-Org/HiDream-O1-Image

## Resumen

HiDream-O1-Image es un modelo de difusion texto-a-imagen empaquetado por Comfy-Org en formato de fichero unico (`diffusion-single-file`) para su uso directo en ComfyUI. No se trata de un modelo original de Comfy-Org, sino de una redistribucion de los pesos publicados por HiDream-ai en los repositorios `HiDream-ai/HiDream-O1-Image` y `HiDream-ai/HiDream-O1-Image-Dev`. El empaquetado incluye variantes en bf16, fp8 escalado y mxfp8, tanto de la version completa como de la version Dev.

El modelo resuelve el problema de la generacion de imagenes a partir de descripciones textuales, integrandose en el ecosistema ComfyUI mediante workflows predefinidos que Comfy-Org publica en su repositorio de plantillas. Su relevancia actual radica en que elimina la friccion de conversion y carga manual de pesos: el usuario descarga un unico fichero safetensors y lo coloca en `models/checkpoints/` para empezar a generar.

La informacion disponible sobre arquitectura interna, numero de parametros y datos de entrenamiento del modelo original es limitada en los metadatos proporcionados. El repositorio ocupa 66,7 GB y acumula mas de 131.000 descargas, lo que indica una adopcion considerable dentro de la comunidad de ComfyUI. La licencia es MIT, lo que facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusion (detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen) |
| Tipos de cuantizacion | bf16, fp8 escalado, mxfp8 |
| Idiomas soportados | no disponible (prompts en lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (fichero unico para ComfyUI) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo original en la documentacion proporcionada. Por la naturaleza del pipeline (`text-to-image`) y el formato de distribucion, se trata de un modelo de difusion que opera sobre representaciones latentes, con un codificador de texto que procesa el prompt y un decodificador que genera la imagen final. La model card de Comfy-Org no incluye detalles sobre el tipo de transformer de difusion, el VAE asociado ni el text encoder utilizado.

Respecto al entrenamiento, no se han publicado en la informacion disponible datos sobre el numero de tokens, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o ajuste fino por preferencias. Existen dos variantes del modelo: la version completa (`HiDream-O1-Image`) y la version Dev (`HiDream-O1-Image-Dev`), esta ultima presumiblemente orientada a iteracion rapida y experimentacion, aunque no se detallan sus diferencias tecnicas en la documentacion accesible.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image).
- Dos variantes disponibles: version completa y version Dev, con workflows separados en ComfyUI.
- Multiples precisiones de pesos (bf16, fp8 escalado, mxfp8) para adaptarse a distintos presupuestos de VRAM.
- Integracion nativa con ComfyUI mediante plantillas de workflow publicadas por Comfy-Org.
- Compatibilidad con el nodo de carga de checkpoints estandar de ComfyUI al distribuirse como fichero unico.
- No se documentan capacidades de edicion de imagen, inpainting, controlnet ni tool calling en la informacion disponible.

## Casos de uso

- Generacion de ilustraciones conceptuales para prototipado de producto: el modelo permite iterar rapidamente sobre descripciones textuales dentro de ComfyUI, sustituyendo el fichero de checkpoint segun la precision deseada para equilibrar calidad y velocidad.
- Creacion de assets para videojuegos y medios interactivos: la licencia MIT permite generar y distribuir imagenes en proyectos comerciales sin obligaciones de atribucion adicionales, lo que simplifica la integracion en pipelines de produccion.
- Exploracion artistica y moodboards: la version Dev, con workflow propio, esta pensada para iteracion rapida, adecuada para sesiones de brainstorming visual donde el tiempo por imagen es critico.
- Generacion por lotes en estaciones de trabajo con GPU consumer: las variantes fp8 y mxfp8 reducen el requisito de VRAM, permitiendo ejecutar el modelo en GPUs de gama alta para consumidores.
- Integracion en flujos de automatizacion creativa dentro de ComfyUI: al ser un fichero unico compatible con el nodo de checkpoints, se puede encadenar con otros nodos (upscalers, filtros, composicion) para construir pipelines complejos.
- Evaluacion comparativa de modelos de difusion: al estar empaquetado de forma estandarizada, resulta sencillo intercambiarlo con otros checkpoints en el mismo workflow para comparar resultados cualitativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio completo ocupa 66,7 GB, pero el peso de cada variante individual no se detalla; las variantes fp8 y mxfp8 estan disenadas para reducir el consumo respecto a bf16.
- GPU recomendadas: no especificadas en la documentacion. Por el tamano del repositorio y la disponibilidad de cuantizaciones, se orienta a GPUs con VRAM suficiente para modelos de difusion de gran tamano (gama profesional o consumer de gama alta).
- Compatibilidad con GPU consumer: probable en las variantes fp8 y mxfp8, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: ComfyUI (soporte nativo mediante fichero unico en `models/checkpoints/`). No se documentan otros backends como vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a modelos de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoria.

## Limitaciones y advertencias

- La model card de Comfy-Org es exclusivamente un empaquetado; no documenta sesgos, limitaciones ni comportamiento del modelo original.
- Riesgo de alucinacion visual: como todo modelo generativo de imagenes, puede producir elementos incoherentes, anatomia incorrecta o texto ilegible en las imagenes generadas.
- No se especifican los idiomas soportados en los prompts; se desconoce si el text encoder maneja bien idiomas distintos del ingles.
- Aunque la licencia es MIT, conviene verificar las condiciones de los repositorios originales de HiDream-ai, ya que el empaquetado no sustituye la licencia del modelo base.
- El repositorio es grande (66,7 GB); la descarga completa puede ser costosa en almacenamiento y ancho de banda, aunque solo sea necesario un fichero por variante.
- No hay informacion sobre resoluciones nativas soportadas, pasos de muestreo recomendados ni CFG scale optimo; es necesario consultar los workflows de Comfy-Org para obtener la configuracion correcta.
- La fecha de creacion del repositorio (2026-05-10) y la de actualizacion (2026-10-28) indican un proyecto relativamente reciente; la documentacion puede evolucionar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Comfy-Org/HiDream-O1-Image
- Modelo original: https://huggingface.co/HiDream-ai/HiDream-O1-Image
- Modelo original (Dev): https://huggingface.co/HiDream-ai/HiDream-O1-Image-Dev
- Workflow completo: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_hidream_o1.json
- Workflow Dev: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_hidream_o1_dev.json
- Repositorio ComfyUI: https://github.com/Comfy-Org/ComfyUI
