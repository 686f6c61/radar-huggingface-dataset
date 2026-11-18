# Comfy-Org/void-model

## Resumen

VOID (Video Object and Interaction Deletion) es un modelo de difusión para la eliminación de objetos e interacciones en vídeo, desarrollado originalmente por Netflix y republicado por Comfy-Org como un paquete de archivos compatibles con ComfyUI. El repositorio `Comfy-Org/void-model` no contiene pesos originales nuevos, sino una reempaquetación en formato `diffusion-single-file` de los pesos de `netflix/void-model`, junto con las dependencias necesarias (RAFT para flujo óptico, el text encoder T5-XXL y el VAE de CogVideoX) para ejecutar el pipeline completo dentro de ComfyUI.

La tarea que resuelve es la edición de vídeo mediante inpainting temporal: dado un vídeo y una máscara que delimita un objeto o una interacción, el modelo reconstruye coherentemente el fondo a lo largo de los fotogramas, manteniendo la consistencia temporal. Se distribuye en dos pases (`void_pass1.safetensors` y `void_pass2.safetensors`), lo que sugiere un refinamiento progresivo del resultado. Es relevante para desarrolladores de posproducción y pipelines de generación de vídeo porque integra una capacidad de edición temporal compleja en un flujo de trabajo estándar de ComfyUI, con licencia Apache 2.0 y un tamaño de repositorio de 32,5 GB.

La información pública disponible sobre arquitectura interna, número de parámetros, datos de entrenamiento y benchmarks es muy limitada; esta ficha se limita a los datos verificables del repositorio y de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para vídeo (inpainting temporal); arquitectura interna no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vídeo; depende de la longitud de clip soportada por el pipeline) |
| Tipos de cuantizacion | no disponible; el repo incluye pesos en safetensors, con T5-XXL en fp16 |
| Idiomas soportados | no disponible (el condicionamiento textual usa T5-XXL) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`diffusion-single-file` para ComfyUI) |

## Arquitectura y entrenamiento

VOID se presenta como un modelo de difusión orientado a vídeo, empaquetado en dos etapas (`void_pass1` y `void_pass2`), lo que apunta a un esquema de generación en dos pases con refinamiento. El pipeline completo requiere componentes auxiliares: un modelo de flujo óptico RAFT Large (`raft_large_C_T_SKHT_V2`) procedente de Princeton-VL, el text encoder T5-XXL en fp16 y el VAE de CogVideoX-2B, lo que indica que el condicionamiento textual y la codificación latente del vídeo se apoyan en la familia CogVideoX.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. La model card del repositorio de Comfy-Org es únicamente una guía de instalación y no documenta detalles de entrenamiento. Cualquier afirmación sobre innovaciones técnicas internas (atención lineal, decodificación especulativa, etc.) no está respaldada por la información disponible.

## Capacidades

- Eliminación de objetos en vídeo (video object removal) mediante inpainting temporal guiado por máscara.
- Eliminación de interacciones: reconstrucción del fondo cuando un objeto interactúa con otro (por ejemplo, una persona manipulando un objeto), según el nombre del modelo.
- Coherencia temporal a lo largo de los fotogramas, apoyada por el modelo de flujo óptico RAFT incluido en el pipeline.
- Condicionamiento textual mediante T5-XXL, lo que permite guiar la reconstrucción con prompts de texto.
- Integración nativa en ComfyUI mediante un workflow de plantilla (`utility_void_video_inpainting.json`).
- Procesamiento en dos pases para refinamiento del resultado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión general, audio ni modo thinking; es un modelo generativo de vídeo, no un LLM.

## Casos de uso

- Posproducción audiovisual: eliminar objetos no deseados (micrófonos, cables, señalización, marcas) de planos rodados, usando la máscara sobre el objeto y dejando que el modelo reconstruya el fondo de forma coherente entre fotogramas.
- Limpieza de material de archivo: retirar logotipos o marcas de agua de vídeos históricos o de stock antes de reutilizarlos, con el workflow de inpainting de ComfyUI.
- Protección de privacidad: difuminar o eliminar rostros, matrículas o identificadores personales en grabaciones de vigilancia o vídeos divulgativos, sustituyéndolos por fondo reconstruido en lugar de un simple desenfoque.
- VFX y previsualización: generar placas limpias (clean plates) para composición, eliminando un actor o un elemento de atrezo de un plano para insertar después un elemento digital.
- Creación de contenido para redes: retirar productos competidores o elementos distractores en vídeos comerciales sin volver a rodar.
- Investigación en edición de vídeo: servir como baseline reproducible para experimentos de inpainting temporal, dado que el pipeline completo (RAFT, T5-XXL, VAE CogVideoX) está empaquetado y es ejecutable en ComfyUI.
- Automatización de pipelines de datos: limpiar datasets de vídeo de elementos no deseados antes de usarlos para entrenar otros modelos generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio ocupa 32,5 GB e incluye dos checkpoints de difusión más T5-XXL fp16, RAFT y el VAE de CogVideoX; en la práctica, la inferencia de vídeo con difusión y T5-XXL fp16 requiere GPUs de gama alta.
- GPU recomendadas: no especificadas por el autor; por el perfil del pipeline (difusión de vídeo + T5-XXL fp16) se encuadra en el rango de A100/H100 o GPUs consumer de 24 GB o más, aunque este dato no está confirmado en la información disponible.
- ¿Cabe en consumer GPU?: no confirmado; el tamaño conjunto de los componentes hace improbable su ejecución en GPUs de menos de 12-16 GB sin cuantización adicional, dato no documentado.
- Opciones de despliegue: ComfyUI (soporte nativo mediante los archivos `diffusion_models`, `optical_flow`, `text_encoders` y `vae`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / longitud | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VOID (Comfy-Org/void-model) | Difusión de vídeo para inpainting temporal | no disponible | no disponible | Apache 2.0 | Hugging Face (reempaquetado para ComfyUI) |
| CogVideoX-2B (zai-org) | Difusión de vídeo texto-a-vídeo | ~2B (según nombre del modelo) | no disponible | Apache 2.0 | Hugging Face |
| RAFT Large (princeton-vl) | Flujo óptico (componente auxiliar) | no disponible | no aplica | BSD-3-Clause | Hugging Face / GitHub |

No se dispone de datos de rendimiento comparativo entre VOID y alternativas de inpainting de vídeo en la información proporcionada.

## Limitaciones y advertencias

- La información técnica pública es escasa: no hay datos de parámetros, dataset de entrenamiento ni evaluación cuantitativa, lo que dificulta estimar su calidad frente a alternativas.
- Riesgo de artefactos de reconstrucción en regiones con movimiento complejo, oclusiones o interacciones entre varios objetos; no hay métricas publicadas que lo cuantifiquen.
- El modelo está diseñado para eliminar objetos e interacciones; no debe esperarse un comportamiento fiable fuera de esa tarea (generación libre de vídeo, edición estructural, etc.).
- El pipeline depende de componentes externos (RAFT, T5-XXL, VAE de CogVideoX); cambios de versión en estos componentes pueden alterar los resultados.
- Licencia Apache 2.0 para los pesos de VOID, pero conviene verificar las licencias de los componentes auxiliares (RAFT es BSD-3-Clause; CogVideoX-2B es Apache 2.0 según la model card).
- No se documentan sesgos específicos, pero al ser un modelo de difusión entrenado con datos no especificados, puede heredar sesgos de su corpus de entrenamiento.
- El repositorio es una reempaquetación de Comfy-Org, no el repositorio oficial de Netflix; para uso en producción conviene contrastar con `netflix/void-model`.

## Enlaces

- Repositorio reempaquetado: https://huggingface.co/Comfy-Org/void-model
- Modelo original: https://huggingface.co/netflix/void-model
- RAFT (flujo óptico): https://github.com/princeton-vl/raft
- RAFT en Hugging Face: https://huggingface.co/princeton-vl/raft
- CogVideoX-2B: https://huggingface.co/zai-org/CogVideoX-2b
- Workflow de inpainting de vídeo para ComfyUI: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_void_video_inpainting.json
- ComfyUI: https://github.com/Comfy-Org/ComfyUI
