# akatz-ai/MiniMax-H3-Image-Character-Swap-LoRA

## Resumen
MiniMax-H3-Image-Character-Swap-LoRA es un adaptador LoRA de rango 16 desarrollado por akatz-ai sobre el modelo base MiniMax-H3-Image, un modelo de difusion para edicion de imagenes. El adaptador resuelve un problema concreto: sustituir a una persona presente en una imagen de origen por un personaje descrito en una hoja de referencia (character sheet), transfiriendo cara, vestuario y estilo del personaje mientras se respeta la pose, el encuadre y la iluminacion de la escena original. Es relevante para flujos de postproduccion, previsualizacion y edicion asistida donde se necesita coherencia de identidad sin rehacer la composicion.

El modelo se distribuye como un unico archivo safetensors de aproximadamente 0,2 GB (el repositorio completo), pensado para cargarse en ComfyUI junto con el modelo base MiniMax-H3-Image en cuantizacion INT8 ConvRot, un text encoder Qwen3-VL de 32B en NVFP4 AWQ y el VAE fp16 del modelo base. La inferencia se plantea con muy pocos pasos (6), CFG 1 y sampler euler, lo que indica un pipeline de difusion destilado o de flujo rapido.

La licencia es la MiniMax-H3-Image Community License Agreement, no una licencia open source estandar, lo que condiciona el uso comercial. El adaptador esta entrenado y evaluado unicamente en ingles y sobre imagenes estaticas con la base INT8 ConvRot; otras cuantizaciones no han sido verificadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion MiniMax-H3-Image; rango 16 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no reporta cifra en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); el text encoder base es Qwen3-VL 32B |
| Tipos de cuantizacion | Base evaluada en INT8 ConvRot; BF16 y otras cuantizaciones no verificadas |
| Idiomas soportados | en (ingles) |
| Licencia | minimax-h3-image-community-license-agreement |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento
El adaptador es un LoRA de rango 16 entrenado con AI Toolkit sobre pares de edicion de imagen. Cada par de entrenamiento consta de una imagen de origen, una hoja de personaje de referencia, una instruccion textual y la imagen objetivo editada. La etapa final de entrenamiento utilizo 140 pares, con 18 ejemplos de validacion separados; el dataset publico previo H3-Character-Swap-v1 forma parte del historial de entrenamiento.

El modelo base MiniMax-H3-Image es un modelo de difusion para edicion de imagenes que, en el pipeline de ComfyUI documentado, se combina con un text encoder Qwen3-VL de 32B (en NVFP4 AWQ) y un VAE fp16. La generacion se realiza con 6 pasos, CFG 1, sampler euler, scheduler simple, denoise 1.0 y negative conditioning mediante ConditioningZeroOut, lo que sugiere un esquema de muestreo rapido con condicionamiento negativo anulado. No se detalla en la informacion disponible la composicion exacta del dataset, el numero de tokens ni si hubo etapas de RLHF o DPO.

## Capacidades
- Edicion de imagen image-to-image: sustituye a una persona de la imagen de origen por un personaje de referencia.
- Transferencia de identidad: traslada cara, vestuario y estilo del personaje de referencia.
- Preservacion de la escena: mantiene pose, posicion, encuadre, fondo e iluminacion de la imagen original.
- Conservacion de terceros: puede preservar a otras personas presentes en la escena.
- Soporte de referencias multiples en el prompt mediante `<Picture 1>` y `<Picture 2>`.
- Seleccion del sujeto objetivo por posicion, vestimenta o accion cuando hay varias personas.
- Orientado a personas y criaturas humanoides.
- Integracion nativa en ComfyUI mediante workflow JSON con nodos nativos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking; se trata de un adaptador de difusion para edicion de imagen.

## Casos de uso
- Postproduccion audiovisual: sustituir a un actor o doble en un fotograma por un personaje de referencia manteniendo iluminacion y encuadre, util para previsualizacion y correccion de continuidad.
- Previsualizacion de vestuario y caracterizacion: aplicar una hoja de personaje sobre una imagen de prueba para evaluar como queda el diseno antes de produccion fisica.
- Ilustracion y narrativa visual: integrar un personaje recurrente en escenas existentes conservando su identidad visual entre paneles o capitulos.
- Edicion de material de archivo: reemplazar figuras en imagenes de stock o footage con licencia (como los ejemplos del autor con material de Blender Institute y otros) para adaptarlas a una nueva narrativa.
- Prototipado de videojuegos: generar variantes de un personaje sobre poses y encuadres de referencia para fichas de diseno o key art.
- Flujos de edicion por lotes en ComfyUI: encadenar el adaptador en pipelines automatizados de edicion de imagenes con parametros fijos (fuerza 1.0, 6 pasos, CFG 1) para producir variantes consistentes.
- Creacion de contenido para redes: adaptar fotografias propias a un personaje concreto respetando la composicion original, con las cautelas de licencia indicadas mas abajo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor presenta comparaciones cualitativas (cuatro ejemplos en cuadricula 2x2 con la misma fuente, referencia, prompt, semilla y ajustes de muestreo, comparando fuente, LoRA V1, base H3 Image y referencia de personaje), pero no cifras numericas de metricas como FID, CLIP score o similitud de identidad.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explicita; el autor probo el workflow en una RTX 4090 con VRAM dinamica, lo que implica que el pipeline completo (base INT8 ConvRot, text encoder Qwen3-VL 32B en NVFP4 AWQ y VAE fp16) cabe en 24 GB con gestion dinamica de memoria.
- GPU recomendadas: RTX 4090 (verificada por el autor); por el perfil de memoria, GPUs de 24 GB o mas son el objetivo razonable, aunque no se documentan pruebas en A100, H100 u otras.
- Cabe en GPU de consumo: si, al menos en RTX 4090 con VRAM dinamica segun la prueba del autor; no se confirma en GPUs de menor VRAM.
- Opciones de despliegue: ComfyUI (version probada 0.45.0) con nodos nativos; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles; solo se indica el numero de pasos (6) y los ajustes de muestreo.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (adaptadores LoRA de intercambio de personaje sobre modelos de difusion) con datos de parametros, contexto o rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias
- Ambito limitado a personas y criaturas humanoides; el rendimiento en otros sujetos no esta documentado.
- Dificultades documentadas en figuras pequenas u ocluidas, manos cerca de objetos y ropa que se confunde con el fondo.
- Puede conservar partes del vestuario original, alterar detalles alrededor del sujeto o seleccionar a la persona equivocada.
- Evaluado unicamente con la base INT8 ConvRot; BF16 y otras cuantizaciones no estan verificadas.
- Entrenado y evaluado solo en ingles; el soporte multilingue no esta documentado.
- Licencia MiniMax-H3-Image Community License Agreement: no es una licencia open source estandar y puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en produccion.
- Riesgo de alucinacion visual: el modelo puede generar detalles inconsistentes en cara, vestuario o entorno, especialmente en zonas ocluidas.
- Sesgos: no se documentan evaluaciones de sesgo; al operar sobre imagenes de personas, puede heredar sesgos del modelo base y del dataset de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente.
- Requiere descargar componentes adicionales del modelo base (difusion INT8 ConvRot, text encoder Qwen3-VL 32B y VAE fp16) desde Comfy-Org/MiniMax-H3-Image, con el coste de almacenamiento y memoria asociado.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/akatz-ai/MiniMax-H3-Image-Character-Swap-LoRA
- Descarga directa del LoRA V1: https://huggingface.co/akatz-ai/MiniMax-H3-Image-Character-Swap-LoRA/resolve/main/h3_image_character_swap_v1.safetensors
- Modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- Dataset previo V1: https://huggingface.co/datasets/akatz-ai/H3-Character-Swap-v1
- Workflow de ejemplo: examples/H3-Image-Character-Swap-V1.json (en el repositorio)
- Plantilla oficial MiniMax H3 Image Edit: https://github.com/Comfy-Org/workflow_templates/blob/c8e48bdcfc7241d7af588d20d4f924caf9d9d953/templates/image_minimax_h3_image_edit.json
- Perfil del autor en X: https://x.com/akatz_ai
- Patreon del autor: https://www.patreon.com/Akatz
- GitHub Sponsors del autor: https://github.com/sponsors/akatz-ai
- Ko-fi del autor: https://ko-fi.com/akatz
- Creditos del material de Tears of Steel: https://mango.blender.org/about/
- Licencia CC BY 3.0: https://creativecommons.org/licenses/by/3.0/
- Fuente Copper Eel: https://www.youtube.com/watch?v=CHapY4muRRQ
- Fuente Rattler: https://www.youtube.com/watch?v=qin8q_sOANo
