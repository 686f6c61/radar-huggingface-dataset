# razz-123/breastmnist_finetuned-17

## Resumen

`razz-123/breastmnist_finetuned-17` es un adaptador LoRA de DreamBooth entrenado sobre el modelo base Stable Diffusion 1.5, orientado a la generacion de imagenes de ecografia mamaria. Lo publica el usuario `razz-123` en Hugging Face y su unico artefacto son los pesos del adaptador (0,1 GB), no un modelo completo. La prompt de instancia declarada por el autor es `Ultrasound image of sks breast`, lo que indica que el entrenamiento se realizo con la tecnica de token raro de DreamBooth para asociar el concepto a la palabra `sks`.

El modelo resuelve un problema muy acotado: sintetizar imagenes sinteticas con apariencia de ecografia de mama a partir de una semilla textual. Su interes practico esta en la posible generacion de datos sinteticos para aumento de datasets medicos o para probar pipelines de vision artificial sin exponer datos de pacientes reales, aunque no hay ninguna validacion publicada de esa utilidad. Es relevante ahora por la tendencia creciente al uso de difusion para data augmentation en imagen medica, pero debe tratarse como un experimento personal sin garantias.

Se trata de un adaptador pequeno (0,1 GB), sin model card completada (secciones de entrenamiento, limitaciones y ejemplo de uso quedan como TODO), sin descargas ni likes en el momento de la consulta y sin resultados de benchmarks. Toda la informacion tecnica disponible procede de los metadatos del repositorio y de la plantilla automatica de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Stable Diffusion 1.5, pipeline text-to-image basado en UNet + VAE + text encoder CLIP |
| Parametros totales | no disponible (adaptador LoRA; el modelo base SD 1.5 tiene aproximadamente 860 M en UNet) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion; la entrada es una prompt de texto, sin ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible (no se documentan variantes fp16, fp32, GGUF ni ONNX en el repositorio) |
| Idiomas soportados | no disponible (el modelo base SD 1.5 responde principalmente a prompts en ingles) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (pesos LoRA de diffusers; repo de 0,1 GB) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Stable Diffusion 1.5, un modelo de difusion latente con un UNet de aproximadamente 860 M de parametros, un autoencoder VAE y un text encoder CLIP. La tecnica empleada es DreamBooth con LoRA (segun los tags `diffusers-training` y `lora`), que ajusta matrices de bajo rango en las capas del UNet para aprender un concepto concreto a partir de pocas imagenes. La model card indica explicitamente que el LoRA del text encoder esta desactivado (`LoRA for the text encoder was enabled: False`), por lo que el ajuste se limita al UNet y el token `sks` se asocia al concepto mediante el condicionamiento cruzado.

No hay informacion sobre el numero de imagenes de entrenamiento, el numero de pasos, la tasa de aprendizaje, la resolucion ni la composicion del dataset. El nombre del repositorio sugiere un vinculo con BreastMNIST, un dataset publico de ecografias mamarias de 28x28 pixeles procedente de MedMNIST, pero el autor no lo confirma en la model card. Tampoco se documentan procesos de RLHF, DPO ni decodificacion especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Generacion de imagenes text-to-image condicionada por la prompt de instancia `Ultrasound image of sks breast`.
- Aprendizaje de un concepto unico (estilo ecografia mamaria) mediante DreamBooth con token raro `sks`.
- Integracion en el ecosistema diffusers como adaptador cargable sobre Stable Diffusion 1.5.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues no documentadas; el modelo base responde mejor a prompts en ingles.
- No dispone de modo thinking, vision de entrada, audio ni otras capacidades multimodales mas alla del pipeline text-to-image.

## Casos de uso

- Aumento de datos sinteticos para entrenamiento de clasificadores: generar imagenes de ecografia mamaria con la prompt de instancia para ampliar un dataset pequeno como BreastMNIST, aunque la validez clinica de estas muestras no esta validada.
- Pruebas de pipelines de vision artificial: usar las imagenes generadas para verificar que un preprocesado, una segmentacion o un detector funcionan con entradas de dominios medicos antes de disponer de datos reales.
- Docencia y divulgacion: crear ilustraciones de ecografias mamarias para material formativo sin utilizar imagenes de pacientes reales.
- Prototipado de interfaces medicas: rellenar maquetas de aplicaciones de diagnostico con imagenes plausibles antes de la integracion con datos reales.
- Investigacion en privacidad de datos medicos: estudiar hasta que punto un modelo de difusion ajustado con pocas imagenes reproduce caracteristicas del dataset original, como ejercicio de evaluacion de fuga de informacion.
- Experimentacion con DreamBooth y LoRA: servir de ejemplo reproducible de ajuste de bajo rango sobre SD 1.5 para quien quiera replicar la tecnica en otros dominios.
- Benchmarking de calidad de difusion en dominios medicos: comparar la fidelidad de este adaptador frente a otros fine-tunes de ecografia en tareas de evaluacion subjetiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador anade un coste minimo sobre Stable Diffusion 1.5; en fp16 el pipeline completo requiere aproximadamente 4-6 GB de VRAM, y en fp32 alrededor de 8-10 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 para generacion por lotes a mayor resolucion.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas de VRAM en fp16 (por ejemplo, RTX 2060, RTX 3060, RTX 4060); con 4 GB puede requerir `enable_attention_slicing` o `enable_model_cpu_offload`.
- Opciones de despliegue: diffusers con `StableDiffusionPipeline` y `load_lora_weights`, ComfyUI, Automatic1111 WebUI, InvokeAI o cualquier frontend compatible con LoRA de SD 1.5.
- Latencia y throughput estimados: no disponibles; dependen de la GPU y del numero de pasos de muestreo (tipicamente 20-50 pasos por imagen en SD 1.5).

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| razz-123/breastmnist_finetuned-17 | LoRA DreamBooth text-to-image | SD 1.5 | adaptador de 0,1 GB | no aplica | creativeml-openrail-m | Hugging Face, 0 descargas |
| stable-diffusion-v1-5/stable-diffusion-v1-5 | Modelo base text-to-image | - | aprox. 860 M (UNet) | no aplica | creativeml-openrail-m | Hugging Face, ampliamente usado |
| roentgen (fine-tune de radiografias sobre SD) | Fine-tune text-to-image medico | SD 1.5 | no disponible | no aplica | no disponible | Hugging Face |
| MedMNIST (dataset) | Dataset de imagenes medicas | - | no aplica | no aplica | CC BY 4.0 (segun version) | Zenodo / MedMNIST |

La comparativa con otros adaptadores de ecografia mamaria concretos no esta disponible en la informacion proporcionada. Frente al modelo base, este adaptador anade el concepto de ecografia mamaria pero hereda todas sus limitaciones y su licencia.

## Limitaciones y advertencias

- La model card esta sin completar: las secciones de uso, limitaciones y detalles de entrenamiento contienen marcadores TODO, por lo que no hay documentacion fiable sobre el dataset ni el proceso.
- Riesgo alto de alucinacion visual: el modelo puede generar imagenes que parezcan ecografias pero no correspondan a ninguna anatomia o patologia real; no debe usarse con fines diagnosticos.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no se puede evaluar el sesgo por edad, etnia, tipo de tejido mamario o equipo de ecografia.
- Posible sobreajuste al dataset de origen: con DreamBooth y pocas imagenes, el modelo tiende a reproducir patrones del conjunto de entrenamiento, lo que puede constituir un riesgo de privacidad si el dataset contiene datos reales.
- Idiomas: no se documenta soporte multilingue; las prompts en castellano pueden degradar la calidad frente al ingles.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (prohibicion de usos daninos y de vigilancia no consentida); conviene revisar los terminos antes de integrarlo en un producto.
- Sin mantenimiento ni validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones.
- No apto para produccion clinica ni para entrenar sistemas de diagnostico sin una validacion independiente y aprobacion regulatoria.

## Enlaces

- Repositorio del modelo: https://huggingface.co/razz-123/breastmnist_finetuned-17
- Perfil del autor en Hugging Face: https://huggingface.co/razz-123
- Modelos del autor: https://huggingface.co/razz-123/models
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Paper de DreamBooth: https://dreambooth.github.io/
- Documentacion de diffusers: https://huggingface.co/docs/diffusers
- Dataset BreastMNIST (MedMNIST): https://medmnist.com/
