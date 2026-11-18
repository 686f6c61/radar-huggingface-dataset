# Comfy-Org/Qwen-Image-DiffSynth-ControlNets

## Resumen

Comfy-Org/Qwen-Image-DiffSynth-ControlNets es un repositorio de empaquetado para ComfyUI que redistribuye los ControlNets de DiffSynth-Studio para el modelo de generacion de imagenes Qwen-Image. No se trata de un modelo nuevo, sino de una conversion de los pesos originales al formato `diffusion-single-file` que ComfyUI consume directamente, con el objetivo de evitar conversiones manuales y facilitar su uso en flujos de trabajo de nodos. El repositorio agrupa tres ControlNets (Canny, Depth e Inpaint) mas una LoRA union, derivados de los repositorios originales de DiffSynth-Studio.

La relevancia es practica: Qwen-Image es un modelo de difusion texto-a-imagen de Alibaba y los ControlNets permiten condicionar la generacion con estructura (bordes Canny, mapas de profundidad) o realizar inpainting. Al estar empaquetados para ComfyUI, los desarrolladores pueden integrarlos en pipelines de generacion de imagen sin escribir codigo de conversion. El repositorio ocupa 7,7 GB y acumula mas de 23.000 descargas, lo que indica una adopcion considerable en la comunidad de ComfyUI.

Es importante subrayar que esta ficha describe un repositorio de artefactos (pesos de ControlNet y una LoRA) y no un modelo de lenguaje. Por tanto, las secciones sobre arquitectura de transformer, contexto, benchmarks de razonamiento o tool calling no aplican y se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (ControlNet para modelo de difusion Qwen-Image; no es un transformer de lenguaje) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`diffusion-single-file` para ComfyUI) |

## Arquitectura y entrenamiento

El repositorio contiene los pesos de tres ControlNets de DiffSynth-Studio para Qwen-Image: `qwen_image_canny_diffsynth_controlnet.safetensors`, `qwen_image_depth_diffsynth_controlnet.safetensors` y `qwen_image_inpaint_diffsynth_controlnet.safetensors`, ademas de la LoRA `qwen_image_union_diffsynth_lora.safetensors`. Los ControlNets se basan en la variante "Blockwise" de DiffSynth-Studio, que inyecta la condicion en bloques del modelo base en lugar de un unico adaptador global. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO, ya que no es aplicable a un modelo de difusion en este contexto.

La innovacion tecnica relevante es el empaquetado: los pesos originales se convierten al formato `diffusion-single-file` que ComfyUI carga sin scripts de conversion, y se separan en dos ubicaciones segun su funcion (LoRA en `models/loras/`, ControlNets en `models/model_patches/`). No hay datos sobre la arquitectura interna de los bloques de control ni sobre el proceso de entrenamiento de los ControlNets originales.

## Capacidades

- Generacion de imagenes condicionada por bordes Canny (ControlNet Canny).
- Generacion de imagenes condicionada por mapas de profundidad (ControlNet Depth).
- Inpainting: relleno de regiones enmascaradas de una imagen (ControlNet Inpaint).
- Control union mediante LoRA (`qwen_image_union_diffsynth_lora`), que combina condiciones en un unico adaptador.
- Integracion nativa con ComfyUI mediante nodos y plantillas de flujo de trabajo.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Edicion de imagenes con inpainting en ComfyUI: cargar `qwen_image_inpaint_diffsynth_controlnet.safetensors` en `models/model_patches/` y usar la plantilla de ControlNet Model Patch para rellenar objetos eliminados en una fotografia, aprovechando que el ControlNet respeta la mascara y el contexto circundante.
- Control de estructura en generacion de producto: usar el ControlNet Canny para generar variaciones de un diseno manteniendo los contornos exactos del boceto, util en catalogos de e-commerce donde la silueta debe ser fiel.
- Generacion de escenas con coherencia de profundidad: emplear el ControlNet Depth para producir imagenes de interiores o paisajes donde la disposicion espacial de los objetos siga un mapa de profundidad de referencia, util en previsualizacion arquitectonica.
- Reconstruccion de imagenes historicas o danadas: combinar inpainting con Canny para restaurar zonas perdidas respetando los bordes de la estructura original.
- Prototipado rapido en estudios de diseno: los flujos de trabajo de ComfyUI permiten encadenar el ControlNet union LoRA para alternar entre condiciones sin recargar modelos, agilizando iteraciones de concepto.
- Pipelines de aumento de datos para vision por computador: generar imagenes sinteticas condicionadas por profundidad o bordes para entrenar detectores, con la ventaja de que la condicion estructura la salida y reduce la aleatoriedad.
- Automatizacion de variaciones de imagen en produccion: al estar en formato single-file, se puede desplegar en servidores ComfyUI con la API de nodos para generar lotes condicionados por mascaras o mapas de profundidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El repositorio pesa 7,7 GB, lo que da una idea del espacio en disco necesario para los pesos, pero no de la VRAM requerida por el modelo base Qwen-Image.
- GPU recomendadas: no disponible. Dependera del modelo base Qwen-Image y de la resolucion de generacion, datos no incluidos en la informacion.
- Cabe en consumer GPU: no disponible.
- Opciones de despliegue: ComfyUI (formato nativo `diffusion-single-file`); no se documentan otras opciones como vLLM, llama.cpp o TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Comfy-Org/Qwen-Image-DiffSynth-ControlNets | ControlNets + LoRA empaquetados para ComfyUI | no disponible | no aplica | Apache 2.0 | Hugging Face, 23.455 descargas |
| DiffSynth-Studio/Qwen-Image-Blockwise-ControlNet-Canny | ControlNet original (Canny) | no disponible | no aplica | no disponible en la informacion | Hugging Face |
| DiffSynth-Studio/Qwen-Image-Blockwise-ControlNet-Depth | ControlNet original (Depth) | no disponible | no aplica | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento para comparar numericamente; la diferencia principal entre el repositorio empaquetado y los originales es el formato (single-file para ComfyUI frente a los pesos de DiffSynth-Studio).

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base Qwen-Image y ComfyUI para funcionar; los pesos por si solos no generan imagenes.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al depender de Qwen-Image, heredaria los sesgos de ese modelo base, no documentados aqui.
- Riesgo de alucinacion: no aplica en el sentido de texto; en imagen, puede generar contenido incoherente o no fiel a la condicion si los pesos no coinciden con la version del modelo base.
- Limitaciones de contexto o idioma: no aplica; no hay soporte de texto ni de idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia de los repositorios originales de DiffSynth-Studio y del modelo base Qwen-Image, no detalladas en la informacion.
- Caveat de produccion: la fecha de actualizacion del repositorio (2026-09-23) es posterior a la de creacion (2025-08-21); verificar que los pesos corresponden a la version esperada del modelo base antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Comfy-Org/Qwen-Image-DiffSynth-ControlNets
- ControlNet Canny original: https://huggingface.co/DiffSynth-Studio/Qwen-Image-Blockwise-ControlNet-Canny
- ControlNet Depth original: https://huggingface.co/DiffSynth-Studio/Qwen-Image-Blockwise-ControlNet-Depth
- ComfyUI (GitHub): https://github.com/Comfy-Org/ComfyUI
- Plantilla de flujo ControlNet Model Patch: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_controlnet_patch.json
- Plantilla de flujo Union Control LoRA: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_union_control_lora.json
