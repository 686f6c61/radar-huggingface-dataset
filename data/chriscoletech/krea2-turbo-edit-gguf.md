# ChrisColeTech/krea2-turbo-edit-GGUF

## Resumen

Krea 2 Turbo Edit es un modelo de generación y edición de imágenes de 12.900 millones de parámetros desarrollado por Krea AI, basado en la arquitectura Qwen-Image. Este repositorio, creado por ChrisColeTech, ofrece una conversión a GGUF del denoiser del modelo con el LoRA de identidad integrado, junto con el text encoder Qwen3-VL-4B y el VAE Qwen-Image necesarios para su ejecución. No se trata de un reentrenamiento, sino de una redistribución de pesos cuantizados para facilitar su uso local.

El modelo destilado requiere solo 8 pasos de inferencia sin guía (guidance-free), lo que permite generar imágenes de 1024×1024 en aproximadamente 35 segundos en una RTX 5090. Su modo distintivo es la edición con preservación de identidad: a partir de una o dos imágenes de referencia y una instrucción en lenguaje natural, modifica únicamente el aspecto solicitado manteniendo la identidad, pose, iluminación y escena. La cuantización GGUF reduce los requisitos de VRAM, haciéndolo accesible para GPUs de consumo con menos de 8 GB.

La relevancia de esta conversión radica en democratizar el acceso a un modelo de edición de imágenes de última generación, que de otro modo requeriría hardware profesional. Al estar disponible en formato GGUF, puede ejecutarse en ComfyUI mediante el cargador GGUF actualizado, ampliando el ecosistema de herramientas open source para generación de imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen-Image family (transformer de difusion) |
| Parametros totales | 12.895.570.508 (12,9 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen, no texto) |
| Tipos de cuantizacion | Q4_K_M (confirmado), otros dos niveles GGUF no especificados, y build FP8 escalado |
| Idiomas soportados | No disponible (probablemente ingles, no confirmado) |
| Licencia | unknown |
| Formato de pesos | GGUF (transformador), safetensors (text encoder y VAE) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen-Image, un transformer de difusion de 12,9 B de parametros. El denoiser ha sido destilado para funcionar en 8 pasos sin guia (guidance-free), una reduccion significativa frente a los 20-50 pasos habituales en modelos de difusion. El LoRA de identidad esta horneado en los pesos, lo que permite la edicion con preservacion de identidad sin necesidad de cargar adaptadores adicionales.

El text encoder es Qwen3-VL-4B en formato FP8 escalado (5,24 GB), y el VAE es el Qwen-Image VAE (254 MB). El repositorio incluye estos tres componentes para que el modelo sea autocontenido. No se dispone de informacion sobre el dataset de entrenamiento, el proceso de destilacion exacto ni si se utilizo RLHF o DPO. La conversion a GGUF fue realizada por ChrisColeTech, no por Krea AI, y no implica cambios en los pesos originales mas alla de la cuantizacion.

## Capacidades

- Generacion de imagenes texto a imagen (txt2img) a 1024×1024 en 8 pasos, sin guia.
- Edicion con preservacion de identidad: a partir de 1-2 imagenes de referencia y una instruccion en lenguaje natural, modifica solo el aspecto indicado manteniendo identidad, pose, iluminacion y escena. No requiere mascaras ni regiones de inpaint.
- Imagen a imagen (img2img) con control de fuerza (strength), permitiendo restyling como conversion a oleo, acuarela o boceto.
- Inferencia rapida: aproximadamente 35 segundos por imagen 1024² en una RTX 5090.
- Ejecucion local en GPUs de consumo gracias a la cuantizacion GGUF (menos de 8 GB de VRAM segun la comunidad).
- Integracion con ComfyUI mediante el cargador GGUF actualizado (comfyui-gguf-loader).
- No es un modelo de lenguaje: no soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Edicion de retratos con preservacion de identidad: un estudio fotografico puede tomar un retrato existente y aplicar instrucciones como "ponle un gorro de lana rojo" o "haz que llueva fuera de la ventana" manteniendo la cara y la pose del sujeto, sin necesidad de mascaras manuales.
- Iteracion rapida en diseno grafico: los disenadores pueden generar variaciones de una misma escena cambiando solo la instruccion (estilo, iluminacion, elementos) en 8 pasos, acelerando la exploracion creativa.
- Restyling de imagenes para produccion: convertir fotografias en pinturas al oleo, acuarelas o bocetos con control de fuerza, util para generar assets con estetica coherente en campañas de marketing.
- Generacion de imagenes en entornos con VRAM limitada: al estar cuantizado en GGUF, puede ejecutarse en GPUs de consumo como RTX 3060 o inferiores, permitiendo a desarrolladores independientes generar imagenes sin hardware profesional.
- Creacion de contenido para redes sociales: generar imagenes de alta calidad a 1024×1024 en menos de un minuto, adecuado para produccion de contenido en volumen.
- Prototipado de conceptos en produccion audiovisual: los directores de arte pueden generar fotogramas de referencia con ediciones de identidad para previsualizar escenas antes del rodaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento confirmado es el tiempo de generacion de aproximadamente 35 segundos por imagen 1024² en una RTX 5090, con 8 pasos y sin guia. No hay comparaciones cuantitativas con otros modelos (FID, CLIP score, etc.) en el repositorio ni en los resultados de busqueda.

## Requisitos de hardware

- VRAM estimada: el transformador en Q4_K_M ocupa 7,26 GB, el text encoder FP8 5,24 GB y el VAE 254 MB. En total, aproximadamente 12,7 GB si se cargan todos los componentes en memoria, aunque el text encoder puede liberarse tras la codificacion. Con cuantizaciones mas agresivas, podria caber en 8 GB o menos.
- GPU recomendadas: RTX 5090 (35 s por imagen), RTX 4090, RTX 4080, RTX 3090, y GPUs de consumo con al menos 8 GB de VRAM segun la comunidad de Civitai.
- Si cabe en consumer GPU: si, en GPUs con 8 GB o mas, dependiendo de la cuantizacion elegida.
- Opciones de despliegue: ComfyUI con el cargador GGUF actualizado (comfyui-gguf-loader). No se mencionan otros runtime como vLLM, llama.cpp u Ollama, que son tipicos para modelos de lenguaje pero no para este tipo de modelo de difusion.
- Latencia y throughput: aproximadamente 35 segundos por imagen 1024² en RTX 5090. No hay datos para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Krea 2 Turbo Edit (GGUF) | 12,9 B | 8 | No aplica | unknown | GGUF |
| Krea 2 Turbo (original) | 12,9 B | 8 | No aplica | Propietaria | safetensors |
| Qwen-Image (base) | 20 B | 20-50 | No aplica | Apache 2.0 | safetensors |
| FLUX.1 dev | 12 B | 20-50 | No aplica | Apache 2.0 | safetensors |

La comparativa se basa en datos publicos generales. Krea 2 Turbo Edit comparte arquitectura con Qwen-Image pero es una version destilada y especializada en edicion de identidad. FLUX.1 dev es un modelo de tamano similar pero sin la capacidad de edicion por instruccion con preservacion de identidad. No se dispone de datos de rendimiento comparativo (calidad de imagen, velocidad) entre estos modelos.

## Limitaciones y advertencias

- Licencia unknown: no se puede garantizar el uso comercial. Krea AI no ha publicado una licencia explicita para este modelo, y la redistribucion en GGUF por terceros anade incertidumbre legal. Antes de usar en produccion, consulta con un asesor legal.
- Degradacion por cuantizacion: la conversion a GGUF puede introducir perdidas de calidad, especialmente en texturas finas o detalles pequenos. Se recomienda probar los distintos niveles de cuantizacion para evaluar el equilibrio entre calidad y VRAM.
- Requiere el cargador GGUF actualizado: el modelo no funciona con el cargador GGUF estandar de ComfyUI; es necesario instalar comfyui-gguf-loader desde el canal remoto del Manager.
- No es un reentrenamiento: los pesos son una conversion del modelo original, por lo que no se han corregido sesgos ni alucinaciones inherentes al modelo base.
- Idiomas no confirmados: no se especifican los idiomas soportados para las instrucciones de edicion. Es probable que funcione mejor en ingles, dado el origen del modelo.
- Sin soporte para texto largo: al ser un modelo de imagen, no procesa prompts extensos ni mantiene conversaciones. Las instrucciones deben ser concisas.
- Riesgo de alucinacion visual: como cualquier modelo generativo, puede producir artefactos o inconsistencias en escenas complejas, especialmente con cuantizaciones agresivas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ChrisColeTech/krea2-turbo-edit-GGUF
- Modelo original en Krea AI: https://www.krea.ai/models/krea-2-turbo
- Conversion GGUF en Civitai: https://civitai.com/models/2730473/krea-2-turbo-gguf
- Tutorial de uso en ComfyUI (Kombitz): https://www.kombitz.com/2026/06/26/how-to-use-krea-2-turbo-gguf-workflow-in-comfyui/
