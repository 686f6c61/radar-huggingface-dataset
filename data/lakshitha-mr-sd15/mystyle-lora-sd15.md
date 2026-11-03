# Lakshitha-MR-sd15/mystyle-lora-sd15

## Resumen

mystyle-lora-sd15 es un adaptador LoRA de estilo para Stable Diffusion 1.5, publicado por el usuario Lakshitha-MR-sd15 en HuggingFace. No se trata de un modelo generativo completo, sino de un conjunto de pesos de bajo rango (rank 16) que se cargan sobre el checkpoint base `stable-diffusion-v1-5/stable-diffusion-v1-5` para modificar el estilo visual de las imagenes generadas. El autor lo entreno con 30 imagenes de 512x512 y lo probo integramente en GPUs gratuitas de Kaggle (T4).

El adaptador responde a la palabra disparadora `mystyle`, que debe anteponerse al prompt para activar el estilo aprendido. Su relevancia es limitada: se trata de un experimento de entrenamiento de bajo coste, con un dataset muy pequeno y sin metricas de evaluacion publicadas. Resulta util como ejemplo reproducible de entrenamiento de LoRAs de estilo en hardware consumer, mas que como componente para produccion.

El repositorio tiene un tamano de 0.0 GB (pesos LoRA de muy baja huella), 0 descargas y 0 likes en el momento de la consulta, y se distribuye bajo licencia CreativeML OpenRAIL-M. La informacion disponible sobre composicion del dataset, idiomas y evaluacion cuantitativa es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Stable Diffusion 1.5 (UNet + VAE + text encoder CLIP) |
| Parametros totales | no disponible (adaptador LoRA de rank 16; el modelo base SD 1.5 tiene ~860 M en UNet) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (prompt de texto; SD 1.5 usa CLIP con limite de 77 tokens) |
| Tipos de cuantizacion | no disponible; el entrenamiento se realizo en fp16 |
| Idiomas soportados | no disponible (el prompt se procesa via CLIP de SD 1.5, predominantemente ingles) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (`mystyle_lora.safetensors`) |

## Arquitectura y entrenamiento

El adaptador se entrena con la tecnica LoRA (Low-Rank Adaptation) de rango 16 sobre el modelo Stable Diffusion 1.5, usando el script de entrenamiento de la libreria `diffusers`. Los pesos se inyectan en las capas del UNet y modifican la generacion de imagen sin alterar el checkpoint base, lo que permite cargarlo y descargarlo dinamicamente en pipelines de `diffusers` o en ComfyUI mediante un nodo Load LoRA.

El dataset consta de 30 imagenes a 512x512, auto-captionadas con BLIP y con la palabra disparadora `mystyle` anadida a cada caption. El entrenamiento se ejecuto durante 1000 pasos con learning rate 1e-4, precision fp16, batch size 1 y 4 pasos de acumulacion de gradientes, en una GPU T4 gratuita de Kaggle. No se documenta el uso de RLHF, DPO ni tecnicas de regularizacion adicionales, ni se especifica la composicion tematica del dataset mas alla de que define el estilo.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el estilo aprendido, siempre sobre el checkpoint base SD 1.5.
- Aplicacion de un estilo visual consistente mediante la palabra disparadora `mystyle` al inicio del prompt.
- Integracion en ComfyUI mediante el workflow incluido (`mystyle_workflow_api.json`) y nodo Load LoRA.
- Carga en pipelines de `diffusers` con `load_lora_weights`, permitiendo composicion con otros LoRA y control del peso del adaptador.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de audio o video.
- Capacidad multilingue no documentada; depende del text encoder CLIP de SD 1.5, orientado a ingles.

## Casos de uso

- Prototipado de estilos visuales: generar variaciones de un estilo concreto en fases tempranas de diseno, cargando el LoRA sobre SD 1.5 en `diffusers` para iterar rapidamente sobre prompts con la palabra `mystyle`.
- Experimentacion educativa: usar el repositorio como ejemplo reproducible de entrenamiento de un LoRA de estilo con 30 imagenes en una T4 de Kaggle, util para aprender el flujo completo (captions con BLIP, entrenamiento con `diffusers`, prueba en ComfyUI).
- Generacion de imagenes de referencia para moodboards: producir un conjunto de imagenes con estilo homogeneo para presentaciones o documentacion interna, dado el bajo coste de inferencia al ser un adaptador pequeno.
- Composicion con otros LoRA en ComfyUI: combinar `mystyle` con LoRA de personajes o de iluminacion para explorar mezclas de estilo, ajustando el peso de cada adaptador en el nodo Load LoRA.
- Pruebas de concepto en pipelines de imagen: integrar el adaptador en un script de `diffusers` para validar la viabilidad de un estilo antes de invertir en un entrenamiento con dataset mayor.
- Benchmarking interno de LoRA: comparar el efecto de este adaptador frente a otros LoRA de estilo sobre el mismo checkpoint base para calibrar expectativas de calidad con datasets pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas cuantitativas (FID, CLIP score, comparativas humanas) ni evaluaciones objetivas del estilo aprendido; solo indica que "los resultados varian segun el prompt" y que funciona mejor con prompts similares al material de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA anade una huella minima (decenas de MB) sobre el modelo base SD 1.5, que en fp16 requiere aproximadamente 4-6 GB de VRAM para generar a 512x512.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM; el autor entreno y probo en una NVIDIA T4 (16 GB) de Kaggle.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070 y superiores; en GPUs de 4-6 GB puede requerir atencion optimizada o `enable_model_cpu_offload`.
- Opciones de despliegue: `diffusers` (Python), ComfyUI (workflow incluido), Automatic1111/Forge mediante carga de LoRA, y otros frontends compatibles con LoRA de SD 1.5.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del sampler. En una T4, SD 1.5 a 512x512 suele generar una imagen en el orden de segundos con 20-30 pasos, pero no se aportan mediciones concretas para este adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mystyle-lora-sd15 | LoRA de estilo, rank 16 | SD 1.5 | 30 imagenes 512x512 | creativeml-openrail-m | HuggingFace, 0 descargas |
| Otros LoRA de estilo SD 1.5 | LoRA de estilo | SD 1.5 | variable (tipicamente cientos de imagenes) | variable | HuggingFace / Civitai |
| Stable Diffusion 1.5 (base) | Modelo completo texto-a-imagen | - | dataset a gran escala no documentado aqui | creativeml-openrail-m | HuggingFace |
| SDXL + LoRA de estilo | Modelo completo + adaptador | SDXL | variable | creativeml-openrail-m | HuggingFace |

No se dispone de datos cuantitativos para comparar rendimiento con alternativas; la comparacion se limita a parametros estructurales y disponibilidad. Frente a LoRA de estilo con datasets mayores, este adaptador parte de una base de 30 imagenes, lo que previsiblemente limita la generalizacion.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeno (30 imagenes), por lo que el estilo puede no generalizar bien y los resultados varian notablemente segun el prompt.
- Funciona mejor con prompts cercanos al material de entrenamiento; fuera de ese dominio la calidad del estilo puede degradarse.
- Riesgo de sobreajuste y de artefactos visuales propios de LoRA entrenados con pocos datos y 1000 pasos.
- Idiomas no documentados; el text encoder CLIP de SD 1.5 esta orientado a ingles, por lo que prompts en castellano pueden rendir peor.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (prohibicion de usos daninos descritos en la licencia); conviene revisar los terminos antes de desplegar en produccion.
- Sin evaluacion cuantitativa publicada ni descargas/likes que permitan inferir calidad contrastada; tratar como experimento, no como componente validado.
- El modelo base SD 1.5 tiene limitaciones conocidas de composicion, anatomia y texto en imagen que el LoRA no corrige.
- No apto para tareas de razonamiento, codigo, agentes ni modalidades distintas de la generacion de imagen.

## Enlaces

- HuggingFace: https://huggingface.co/Lakshitha-MR-sd15/mystyle-lora-sd15
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Libreria diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
