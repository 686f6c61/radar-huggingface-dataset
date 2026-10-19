# RunningHubAI/rh-moss-image-sft-int8-convrot.safetensors-unet

## Resumen

`RunningHubAI/rh-moss-image-sft-int8-convrot.safetensors-unet` es un checkpoint de pesos en formato UNET para ComfyUI, publicado por RunningHub (autor `@darkHUB`) como espejo en Hugging Face de un modelo alojado en su plataforma. El repositorio contiene un único archivo safetensors de 5163 MiB (5,4 GB de repositorio) que, por su nombre, corresponde a una versión cuantizada a INT8 con rotación de cuantización (`convrot`) de un ajuste fino (SFT) del modelo MOSS-Image, la familia de generación texto-a-imagen de OpenMOSS construida sobre un DiT de 5.000 millones de parámetros.

La ficha del autor declara el pipeline como `text-to-video`, pero el nombre del archivo, el tag `unet` y la referencia a MOSS-Image apuntan a un modelo de difusión texto-a-imagen con control de layout nativo. Esta discrepancia no se resuelve en la documentación disponible y debe tenerse en cuenta antes de integrarlo en cualquier flujo de producción.

Su relevancia práctica es acotada pero concreta: ofrece una versión de bajo peso (INT8) de un modelo de difusión de 5B pensada para ejecutarse en ComfyUI y en la infraestructura de RunningHub, lo que reduce el requisito de VRAM frente al checkpoint BF16 original. No hay información publicada sobre licencia, idiomas, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion (el upstream MOSS-Image se describe como DiT de 5B; no confirmado para este checkpoint) |
| Parametros totales | no disponible de forma explicita; el archivo INT8 de 5163 MiB es consistente con ~5.000 millones de parametros |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion, sin ventana de contexto de texto) |
| Tipos de cuantizacion | INT8 con rotacion de cuantizacion (`int8-convrot`); el upstream dispone de BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica que se siga la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (checkpoint UNET para ComfyUI) |

## Arquitectura y entrenamiento

No se ha publicado informacion tecnica sobre este checkpoint mas alla de su naturaleza de pesos UNET para ComfyUI. El nombre del archivo y la busqueda web lo vinculan con MOSS-Image, un modelo base de difusion con arquitectura DiT de 5.000 millones de parametros desarrollado por OpenMOSS, que soporta generacion texto-a-imagen y control de layout nativo mediante prompts en JSON (posiciones de objetos y texto renderizado). El sufijo `sft` indica un ajuste fino supervisado sobre ese modelo base, presumiblemente con datos curados.

El sufijo `int8-convrot` describe una cuantizacion a 8 bits con rotacion de cuantizacion, una tecnica habitual para reducir el error de cuantizacion en pesos de difusion. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO ni sobre innovaciones adicionales. La model card se limita a indicar "Finetuned from: Other" sin especificar el checkpoint de origen.

## Capacidades

- Generacion de imagenes a partir de prompts en lenguaje natural, segun el linaje MOSS-Image (no verificado para este checkpoint concreto).
- Control de layout nativo: el modelo upstream admite especificar objetos, texto renderizado y posiciones espaciales en un prompt JSON.
- Renderizado de texto en imagen de alta calidad, capacidad destacada por OpenMOSS para MOSS-Image.
- Integracion con ComfyUI como nodo de carga de UNET.
- Ejecucion en la plataforma RunningHub y a traves de su API.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica (modelo de difusion).
- Capacidades multilingues: no disponibles; el repo incluye un README en chino ademas del ingles.
- Modo "thinking", vision o audio: no disponible.

## Casos de uso

- Prototipado rapido en ComfyUI: cargar el UNET INT8 para iterar sobre prompts e imagenes sin necesidad de un checkpoint BF16, gracias a los 5,4 GB del archivo.
- Generacion de imagenes con texto integrado: carteles, banners y mockups donde el texto renderizado debe ser legible, aprovechando la capacidad de text rendering del upstream MOSS-Image (previa validacion).
- Composicion con layout controlado: generacion de creatividades publicitarias con posiciones fijas de producto, titular y logotipo mediante prompts JSON, si el control de layout se conserva tras la cuantizacion.
- Automatizacion de contenidos en lote: uso de la API de RunningHub para generar variantes de imagen a escala sin gestionar infraestructura propia.
- Evaluacion comparativa de cuantizacion: medir la degradacion INT8 frente a BF16 en el mismo checkpoint SFT dentro de un pipeline interno de validacion de calidad.
- Flujos de bajo VRAM en estaciones de trabajo: despliegue local en GPUs de consumo para tareas de generacion de imagen donde el BF16 de 5B no cabe con comodidad.
- Base para nuevos ajustes finos: punto de partida cuantizado para experimentos de fine-tuning o de destilado (requiere verificar compatibilidad de herramientas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo de pesos ocupa 5163 MiB (~5,4 GB). Con overhead de runtime, text encoder y VAE en ComfyUI, el consumo total estimado se situa por encima de los 8 GB, aunque esta cifra no esta confirmada por el autor.
- GPU recomendadas: no disponibles por parte del autor. Por tamano, el UNET INT8 es apto para GPUs de consumo con 12-24 GB (serie RTX 3060/4070/4090); para el pipeline completo conviene 16 GB o mas.
- Cabe en GPU de consumo: probablemente si, al ser INT8 de ~5 GB, siempre que se gestionen el text encoder y el VAE con offloading.
- Opciones de despliegue: ComfyUI (formato nativo del checkpoint), RunningHub (nube y API). Otros runners (vLLM, TGI, llama.cpp, Ollama) no aplican a un modelo de difusion de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-moss-image-sft-int8-convrot (este) | ~5B (estimado por tamano) | INT8 convrot | no aplica | no disponible | Hugging Face (0 descargas) y RunningHub |
| MOSS-Image SFT BF16 (`moss_image_sft_bf16.safetensors`) | 5B (upstream) | BF16 | no aplica | no disponible | Civitai, Hugging Face |
| MOSS-Image-SFT-Turbo INT8 ConvRot (`toxicdog`) | 5B (upstream) | INT8 convrot | no aplica | no disponible | Hugging Face |
| rh-z-image-turbo-int8-convrot-unet (RunningHubAI) | no disponible | INT8 convrot | no aplica | no disponible | Hugging Face y RunningHub |

No se dispone de datos de rendimiento comparado (FID, CLIP score, adherencia al prompt) para ninguna de las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Ambiguedad de categoria: la model card declara `text-to-video`, pero el nombre del archivo y el linaje MOSS-Image indican texto-a-imagen. Verificar empiricamente antes de usarlo en un pipeline de video.
- Sin licencia declarada: la card remite a la licencia del proyecto original, lo que impide confirmar si el uso comercial esta permitido. Riesgo juridico en produccion.
- Cuantizacion INT8: la rotacion de cuantizacion reduce el error, pero puede degradar la fidelidad del text rendering y del control de layout respecto al BF16. Requiere evaluacion A/B.
- Sin informacion sobre sesgos: no hay documentacion sobre sesgos demograficos, culturales o de representacion.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar texto ilegible, anatomias incorrectas o elementos inconsistentes con el prompt.
- Idiomas: sin datos; el soporte de texto renderizado en idiomas distintos del ingles y el chino no esta documentado.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- Fecha de creacion en los metadatos (2026-10-19): inusualmente futura, lo que sugiere un error de marcado de tiempo o una particularidad de la plataforma.
- Dependencia de plataforma: parte de la documentacion son enlaces promocionales a RunningHub; el modelo esta pensado para ese ecosistema y para ComfyUI.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-moss-image-sft-int8-convrot.safetensors-unet
- Pagina original del modelo en RunningHub: https://www.runninghub.ai/model/public/2111374413949067265
- Perfil del autor en RunningHub: https://www.runninghub.ai/user-center/2025565893677027330
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API: https://www.runninghub.cn/runninghub-api-doc-en/
- Repositorio oficial de MOSS-Image (OpenMOSS): https://github.com/OpenMOSS/MOSS-Image
- Pagina del proyecto MOSS-Image: https://openmoss.ai/MOSS-Image/
- Checkpoint MOSS Image SFT en Civitai: https://civitai.com/models/3005406/moss-image
- MOSS-Image-SFT-Turbo INT8 ConvRot (toxicdog): https://huggingface.co/toxicdog/MOSS-Image-SFT-Turbo-INT8-ConvRot
- rh-z-image-turbo-int8-convrot-unet (RunningHubAI): https://huggingface.co/RunningHubAI/rh-z-image-turbo-int8-convrot-unet
