# akathiago/BLOCKv0.6-comfy

## Resumen

BLOCKv0.6-comfy es un reempaquetado del modelo AliceKJ/BLOCKv0.6 publicado por el usuario akathiago. No es un modelo nuevo ni un reentrenamiento: los pesos son idénticos a los del modelo base y lo único que cambia es el nombre de los tensores, convertidos desde el layout de diffusers al layout nativo de FLUX.2 que lee el nodo `UNETLoader` de ComfyUI (QKV fusionado, bloques `double_blocks` y `single_blocks`, y orden BFL para el shift/scale final de adaLN). ComfyUI no puede convertir por sí solo pesos FLUX.2 en formato diffusers, de ahí la utilidad concreta de este repositorio.

El modelo subyacente pertenece a la familia BLOCK, descrita en el artículo "BLOCK: An Open-Source Bi-Stage MLLM Character-to-Skin Pipeline for Minecraft" (arXiv:2603.03964, 2026). Se trata de un modelo de imagen a imagen construido sobre el backbone FLUX.2 Klein 4B (aproximadamente 4000 millones de parámetros en el transformer) que transforma una previsualización 512x512 de un personaje de Minecraft, con vistas frontal y trasera, en un atlas UV de skin de 64x64 píxeles.

Su relevancia es práctica y de nicho: permite ejecutar la generación de skins de Minecraft dentro de ComfyUI sin recurrir a scripts de diffusers, con un único archivo safetensors en bf16 de 149 tensores y 7,8 GB de repositorio. Está pensado para flujos de trabajo de modding y creación de contenido, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) FLUX.2 Klein 4B; pesos reempaquetados del layout diffusers al layout nativo FLUX.2 para ComfyUI |
| Parametros totales | Aproximadamente 4B en el transformer (segun el nombre del archivo, `block-v0.6-flux2-klein-4b`) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplicable (modelo de imagen a imagen) |
| Tipos de cuantizacion | No disponible; este repositorio solo distribuye el transformer en bf16. No se incluyen versiones GGUF, fp8 ni int8 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), 149 tensores, archivo `block-v0.6-flux2-klein-4b.safetensors` |

## Arquitectura y entrenamiento

El repositorio no describe entrenamiento propio: es un reempaquetado de AliceKJ/BLOCKv0.6, cuyo backbone es FLUX.2 Klein 4B, un transformer de difusion para edicion y generacion de imagenes. La conversion aplicada afecta exclusivamente a la nomenclatura y a la disposicion de los tensores (fusion de las proyecciones QKV, reorganizacion en `double_blocks` y `single_blocks` y orden BFL para el shift/scale de adaLN final), de modo que los nombres y las formas coinciden con `flux-2-klein-base-4b.safetensors` de Comfy-Org/flux2-klein. No hay cambios en los valores de los pesos ni en el comportamiento del modelo.

El pipeline original, BLOCK, se presenta como una arquitectura bietapa de tipo MLLM (multimodal large language model) para convertir un personaje a skin de Minecraft. En este repositorio solo se distribuye el componente transformer; el codificador de texto (`qwen_3_4b.safetensors`, tipo `flux2`) y el VAE (`flux2-vae.safetensors`) se cargan por separado y no forman parte del archivo. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Traduccion de imagen a imagen: convierte una previsualizacion 512x512 de un personaje de Minecraft (vistas frontal y trasera en una sola imagen) en un atlas UV de skin de 64x64.
- Generacion de pixel art con estilo anime, sombreado plano y bordes nitidos, sin desenfoque ni antialiasing, segun el prompt recomendado por el autor.
- Deteccion automatica del tipo de modelo de jugador de Minecraft (clasico) indicada en el prompt de referencia.
- Mantenimiento de la coherencia de diseno del personaje respecto a la imagen de referencia.
- Integracion nativa con ComfyUI mediante el nodo `UNETLoader` y las plantillas de edicion de imagen de FLUX.2 Klein 4B.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Creacion de skins personalizadas en ComfyUI: un creador introduce el render frontal y trasero de su personaje y obtiene el atlas UV, que despues reduce 8x con interpolacion nearest y recompone el canal alfa segun el layout UV de Minecraft para producir la skin final de 64x64.
- Pipelines de generacion masiva para servidores de Minecraft: al ejecutarse como nodo dentro de ComfyUI, se puede encadenar en lotes para producir skins a partir de catalogos de personajes ya renderizados, sin escribir scripts de diffusers.
- Herramientas de modding y plugins: desarrolladores que construyen interfaces graficas sobre ComfyUI pueden exponer este flujo como una funcion de conversion personaje a skin dentro de su aplicacion.
- Prototipado rapido de personajes para estudios pequenos: permite iterar variaciones de diseno cambiando solo la imagen de referencia, manteniendo la coherencia de identidad gracias al condicionamiento por imagen.
- Generacion de conjuntos de datos sinteticos: se pueden producir atlas UV y skins de forma automatizada para entrenar o evaluar otros modelos de vision relacionados con pixel art.
- Automatizacion de contenido para comunidades: bots o servicios que generan skins a peticion a partir de capturas 512x512 del personaje, con el postprocesado de reduccion y alfa ejecutado en el propio flujo de ComfyUI.
- Investigacion en traduccion imagen a imagen: sirve como caso de estudio de ajuste fino sobre FLUX.2 Klein 4B en un dominio muy restringido (pixel art y layout UV), con una resolucion de entrada y salida fija.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del reempaquetado ni los metadatos de HuggingFace incluyen metricas cuantitativas, comparaciones con otros generadores de skins ni evaluaciones de fidelidad del atlas UV generado.

## Requisitos de hardware

- VRAM estimada para el transformer: en bf16, los pesos de un modelo de aproximadamente 4B ocupan en torno a 8 GB; con activaciones y buffers de atencion, el rango practico se situa en unos 10-12 GB para el transformer aislado. Estas cifras son estimaciones, no mediciones publicadas.
- Componentes adicionales: el codificador de texto `qwen_3_4b.safetensors` anade del orden de 8 GB en bf16 y el VAE `flux2-vae.safetensors` es comparativamente pequeno. En conjunto, un flujo en bf16 sin offload pide del orden de 18-20 GB de VRAM.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) cubren el flujo completo en bf16 con margen. A100 y H100 son sobredimensionadas para esta tarea, pero funcionan sin problema.
- Cabe en GPU de consumo: si en las de 24 GB (RTX 3090, 4090). En tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) es probable que sea necesario el offload secuencial de ComfyUI o el uso de un codificador de texto cuantizado. En tarjetas de 12 GB o menos no hay una via soportada por este repositorio, porque no se distribuyen pesos cuantizados del transformer.
- Opciones de despliegue: ComfyUI es el destino nativo de este reempaquetado (`models/diffusion_models`). El modelo base AliceKJ/BLOCKv0.6, en formato diffusers, es la alternativa para otros runners. No se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Con la configuracion recomendada de 30 pasos, CFG 4.0 y 512x512 de resolucion, el rango esperado en una GPU de gama alta es de pocos segundos por imagen, pero no hay mediciones oficiales publicadas.
- Almacenamiento: el repositorio ocupa 7,8 GB, que incluye el transformer; no se especifica que otros archivos componen el resto del espacio.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Compatibilidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| akathiago/BLOCKv0.6-comfy | ~4B (transformer) | safetensors bf16, layout nativo FLUX.2 | ComfyUI (`UNETLoader`) | Apache 2.0 | Repositorio con 0 descargas y 0 likes en el momento de la consulta |
| AliceKJ/BLOCKv0.6 | ~4B (transformer) | diffusers | Scripts y runners que consumen diffusers; no carga directamente en ComfyUI | Apache 2.0 | Modelo base del reempaquetado |
| Comfy-Org/flux2-klein | ~4B (variante Klein 4B base) | safetensors nativo FLUX.2 | ComfyUI | No disponible en la informacion proporcionada | Referencia de compatibilidad: los nombres y las formas de los tensores coinciden |

No se dispone de datos de rendimiento comparado entre estas opciones ni con otros generadores de skins de Minecraft.

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son los mismos que AliceKJ/BLOCKv0.6, por lo que hereda integramente sus sesgos, aciertos y errores. El reempaquetado no mejora la calidad de salida.
- Dominio muy restringido: esta disenado exclusivamente para personajes de Minecraft con entrada de 512x512 con vistas frontal y trasera. No se debe esperar un comportamiento util fuera de ese formato.
- Postprocesado obligatorio: la salida es un atlas de 512x512 sobre fondo blanco. Para obtener una skin utilizable hay que reducirla 8x con interpolacion nearest y reconstruir el canal alfa segun el layout UV de Minecraft.
- Repositorio sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia. No hay evidencia externa de que el reempaquetado funcione de forma consistente en todas las versiones de ComfyUI.
- Dependencias no incluidas: el codificador de texto `qwen_3_4b.safetensors` y el VAE `flux2-vae.safetensors` hay que obtenerlos por separado.
- Sin benchmarks ni evaluaciones publicadas: no hay forma de cuantificar la fidelidad del atlas UV generado ni la tasa de fallo.
- Idiomas no documentados: al ser un modelo de imagen no se declara soporte linguistico, pero el prompt recomendado esta en ingles y su traduccion puede degradar el resultado.
- Licencia: Apache 2.0 permite uso comercial y modificacion siempre que se mantenga la atribucion a los autores originales de BLOCK y se conserve el aviso de licencia. Cualquier consideracion sobre propiedad intelectual de Minecraft o Mojang en el uso comercial de las skins generadas queda fuera del alcance de la licencia del modelo y es responsabilidad de quien lo despliega.
- Riesgo de alucinacion visual: al ser un modelo generativo de imagen, puede producir atlas UV con regiones mal mapeadas o incoherentes respecto al personaje de referencia; no hay metricas publicadas que acoten esa tasa de error.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/akathiago/BLOCKv0.6-comfy
- Modelo base: https://huggingface.co/AliceKJ/BLOCKv0.6
- Referencia de compatibilidad de pesos FLUX.2 Klein: https://huggingface.co/Comfy-Org/flux2-klein
- Articulo: BLOCK: An Open-Source Bi-Stage MLLM Character-to-Skin Pipeline for Minecraft, Hengquan Guo, arXiv:2603.03964, 2026: http://arxiv.org/abs/2603.03964
