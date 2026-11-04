# RunningHubAI/rh-2dnsfwlora-lora

## Resumen

`rh-2dnsfwlora-lora` es un adaptador LoRA (Low-Rank Adaptation) alojado en Hugging Face por RunningHubAI, una plataforma de generacion de imagenes y video basada en ComfyUI. El adaptador se ha entrenado para aplicar un estilo visual de anime 2D con contenido para adultos (NSFW) sobre el modelo base `minimax-h3`, y se distribuye como un unico fichero de pesos de 569 MiB en formato safetensors. Su palabra de activacion es "2d anime style" y la intensidad recomendada por el autor es 1.

El modelo no es un modelo de lenguaje ni un transformer generativo de texto: es un LoRA de difusion pensado para integrarse en flujos de trabajo de ComfyUI o en la propia plataforma RunningHub. Su relevancia es acotada al ecosistema de generacion de imagenes anime y a pipelines creativos que ya utilizan el modelo base `minimax-h3`; no aporta capacidades de razonamiento, codigo ni comprension del lenguaje.

La informacion publicada es muy escasa: no hay detalles sobre el dataset de entrenamiento, hiperparametros, licencia explicita ni resultados cuantitativos. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 4 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base de difusion `minimax-h3` |
| Parametros totales | no disponible (pesos LoRA de 569 MiB, rango no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | no disponible (la palabra de activacion esta en ingles) |
| Licencia | no disponible; el autor indica que los derechos permanecen con el creador y que se siga la licencia del proyecto original |
| Formato de pesos | safetensors (`NSFW_ANIME_V5_H3-step00006150.safetensors`, 569 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base `minimax-h3` para modificar su comportamiento sin reentrenar todos los pesos. El nombre del fichero (`step00006150`) sugiere un entrenamiento de aproximadamente 6.150 pasos, aunque no se especifican el dataset, la resolucion de entrenamiento, el learning rate ni la tecnica de regularizacion empleada.

No hay informacion sobre la composicion del dataset, el numero de imagenes utilizadas, si se aplicaron tecnicas como DreamBooth, fine-tuning clasico o regularizacion con captions, ni si se uso RLHF o DPO (no aplicables en este tipo de modelos). Tampoco se documenta la arquitectura interna del modelo base `minimax-h3`, por lo que no es posible detallar si emplea UNet, DiT (Diffusion Transformer) u otra variante.

## Capacidades

- Generacion de imagenes con estilo anime 2D mediante la palabra de activacion "2d anime style".
- Aplicacion de estetica anime sobre el modelo base `minimax-h3` en flujos de ComfyUI.
- Contenido NSFW: el adaptador esta disenado explicitamente para generar imagenes para adultos.
- Integracion en la plataforma RunningHub y en la API de RunningHub.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de comprension de texto mas alla de los prompts de generacion de imagen.
- No dispone de modo thinking, vision por computador ni procesamiento de audio.

## Casos de uso

- Generacion de ilustraciones anime para proyectos creativos personales: el LoRA se carga en ComfyUI junto al modelo base `minimax-h3` y se activa con "2d anime style" para producir imagenes con una estetica consistente.
- Prototipado rapido de personajes en estudios de animacion: permite iterar sobre disenos de personajes 2D sin reentrenar el modelo base, ajustando el peso del LoRA entre 0 y 1.
- Creacion de contenido para comunidades de arte digital para adultos: el adaptador esta orientado a este nicho y se integra en pipelines de generacion por lotes.
- Pruebas de concepto en la plataforma RunningHub: el modelo se puede ejecutar online sin infraestructura local, usando la API documentada por el proveedor.
- Experimentacion con estilos en investigacion de difusion: sirve como ejemplo de adaptador de bajo rango para estudiar como un LoRA modifica la distribucion de salida de un modelo base.
- Automatizacion de catalogos visuales en nichos anime: combinado con la API de RunningHub, se puede invocar desde scripts para generar variaciones de imagen de forma programatica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un LoRA de generacion de imagenes, las metricas habituales (FID, CLIP score, aesthetic score) no se reportan en la model card.

## Requisitos de hardware

- VRAM estimada: depende enteramente del modelo base `minimax-h3`; el LoRA anade solo 569 MiB de pesos, por lo que el requisito dominante es el del modelo base (no disponible en la informacion proporcionada).
- GPU recomendadas: no disponible; para modelos de difusion de imagen de gran tamano se suelen emplear A100, H100 o RTX 4090, pero no hay confirmacion para `minimax-h3`.
- Compatibilidad con GPU de consumo: no confirmada; el LoRA en si cabe en cualquier GPU, pero el modelo base puede requerir mas memoria de la disponible en GPUs consumer.
- Opciones de despliegue: ComfyUI (entorno nativo del adaptador), plataforma RunningHub y su API. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada adaptadores LoRA comparables sobre `minimax-h3` ni se dispone de datos de rendimiento para establecer una comparacion rigurosa con otros LoRA de estilo anime 2D.

## Limitaciones y advertencias

- Contenido NSFW explicito: no apto para uso en entornos profesionales sin filtrado previo ni para audiencias no adultas.
- Licencia no especificada: el autor remite a la licencia del proyecto original y conserva los derechos; el uso comercial no esta garantizado y requiere verificacion con el autor y con la licencia de `minimax-h3`.
- Sin datos de entrenamiento publicados: no se puede evaluar el sesgo del dataset ni la calidad de la generalizacion.
- Dependencia total del modelo base `minimax-h3`: si este no esta disponible o cambia de licencia, el LoRA deja de ser utilizable.
- Riesgo de sobreajuste al estilo y a los prompts de activacion: el uso de la palabra "2d anime style" es obligatorio para obtener el efecto esperado.
- Sin soporte de texto, codigo ni razonamiento: no debe emplearse como modelo de lenguaje.
- Repositorio sin traccion (0 descargas, 0 likes): no hay evidencia de validacion por parte de la comunidad.
- Fecha de creacion futura (2026-11-04) en los metadatos: conviene verificar la integridad y procedencia del artefacto antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RunningHubAI/rh-2dnsfwlora-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2089629758526431234
- Pagina del autor: https://www.runninghub.ai/user-center/2041030036219498497
- Fuente original en Civitai: https://civitai.red/models/2861135/2d-anime-style-nsfw-lora-h3?modelVersionId=3241180
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
