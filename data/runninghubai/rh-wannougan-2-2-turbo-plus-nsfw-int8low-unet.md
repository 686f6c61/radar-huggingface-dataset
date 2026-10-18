# RunningHubAI/rh-wannougan-2.2-turbo-plus-nsfw-int8low-unet

## Resumen

rh-wannougan-2.2-turbo-plus-nsfw-int8low-unet es un conjunto de pesos UNET para generación de vídeo a partir de texto, publicado por RunningHubAI y obtenido mediante fine-tuning de WAN2.2 en su variante LowNoise. El repositorio contiene un único archivo safetensors de 13.863 MiB, etiquetado como int8low y orientado a ComfyUI; no se listan text encoder, VAE ni scheduler, por lo que no es un pipeline autónomo.

La propuesta resulta relevante para quien necesita un UNET de vídeo especializado en contenido NSFW con menor huella de memoria que los pesos de mayor precisión. La model card, sin embargo, no documenta número de parámetros, dataset, resolución, duración de clips, pasos de muestreo ni licencia explícita; tampoco incluye benchmarks ni validación comunitaria (0 descargas y 0 me gusta en el momento consultado).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNET de difusión para text-to-video; fine-tuning de WAN2.2 (LowNoise); no se detallan bloques, atención ni variantes de arquitectura |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un UNET de difusión de vídeo) |
| Tipos de cuantización | int8low (único archivo publicado); no se documentan fp16, bf16, GGUF ni otras variantes en este repositorio |
| Idiomas soportados | no disponible; depende del text encoder del pipeline, que no se incluye |
| Licencia | no disponible explícita; la model card remite a la licencia del proyecto original/upstream |
| Formato de pesos | safetensors: WanNougan_2.2_Low_Turbo-int8.safetensors (13.863 MiB) |
| Modelo base | WAN2.2 (LowNoise) |
| Tipo de contenido | NSFW; etiqueta not-for-all-audiences |
| Pipeline | text-to-video |
| Plataformas | ComfyUI, RunningHub, Hugging Face |
| Tamaño del repositorio | 14,5 GB |

## Arquitectura y entrenamiento

Se trata de un UNET de difusión para vídeo, no de un transformer autoregresivo ni de un modelo de lenguaje. La model card indica que está finetuneado desde WAN2.2 (LowNoise), pero no especifica si el ajuste fue completo o mediante LoRA, ni el número de clips, pasos de entrenamiento o composición del dataset. Tampoco se documentan técnicas de alineación como RLHF o DPO, algo esperable en modelos de difusión pero no confirmado aquí.

El sufijo "turbo" sugiere una optimización para inferencia con pocos pasos, y "int8low" indica una cuantización a 8 bits de baja precisión; ninguna de las dos cosas se desarrolla en la información disponible. El archivo es un componente de un pipeline mayor: necesita un text encoder, un VAE y un scheduler compatibles con WAN2.2, además de un runtime que admita safetensors int8. No se detallan innovaciones como decodificación especulativa, atención lineal o destilación.

## Capacidades

- Generación de vídeo text-to-video al integrarse como UNET en un pipeline WAN2.2 compatible; no funciona de forma aislada.
- Especialización en contenido NSFW/adulto, según el nombre del modelo y la etiqueta not-for-all-audiences.
- Carga en ComfyUI como pesos UNET; el autor indica compatibilidad con ComfyUI, RunningHub y Hugging Face.
- Cuantización int8low para reducir el espacio de los pesos; requiere kernels y runtime compatibles.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step; no es un LLM.
- No se documentan capacidades de audio, visión, matemáticas, código ni thinking mode.
- El soporte multilingüe de prompts no está disponible; dependerá del text encoder externo.
- No se documentan resolución, duración máxima, relación de aspecto ni control de cámara.

## Casos de uso

- Producción de clips para plataformas de contenido adulto: con un pipeline WAN2.2 completo y prompts controlados, el UNET puede generar tomas cortas de forma iterativa; la variante int8low reduce la VRAM por instancia y facilita varias ejecuciones en una GPU de 24-48 GB.
- Previsualización de escenas en producciones adultas: sirve para generar storyboards animados de bajo coste antes de rodar, decidir encuadres, iluminación y continuidad; no sustituye el render final ni el trabajo de VFX.
- Creación de personajes virtuales adultos: combinado con herramientas de referencia del ecosistema ComfyUI, permite explorar apariencias y poses para avatares o modelos virtuales; requiere revisión humana y consentimiento de las personas representadas.
- Exploración de estilo para artistas digitales: el modelo permite probar composiciones, paletas y estéticas NSFW antes de producir una ilustración o animación final; su valor está en la iteración rápida, no en una calidad final garantizada.
- Pruebas de rendimiento y optimización en ComfyUI: al ser un archivo único int8, es útil para medir VRAM, tiempo por iteración y compatibilidad de kernels frente a pesos fp16/bf16 del mismo base; conviene hacer un benchmark interno porque no hay datos públicos.
- Integración en la API de RunningHub: la plataforma ya aloja el modelo y ofrece endpoints de generación; se puede usar para productos de contenido adulto con control de acceso, verificación de edad y moderación.
- Base para ajustes finos o merges comunitarios: al ser un UNET aislado, se puede sustituir en flujos existentes de WAN2.2 y servir como punto de partida para LoRA o merges orientados a un estilo concreto; la licencia debe verificarse antes de distribuir derivados.
- Campañas de lencería y moda adulta: generación de vídeo promocional para marcas de nicho, con prompts y edición posterior; el contenido debe cumplir las políticas de las plataformas de destino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye VBench, FVD, CLIP score, MMLU, HumanEval, GSM8K ni comparativas cuantitativas; tampoco se documentan resolución, duración, pasos de muestreo, latencia o throughput.

## Requisitos de hardware

- VRAM estimada: el archivo de pesos pesa 13.863 MiB, por lo que solo la carga del UNET ronda los 14 GB. El pipeline completo necesita además text encoder, VAE, activaciones y buffers, así que los 14 GB son un mínimo teórico, no un requisito real de ejecución.
- No hay requisitos oficiales publicados. Para pruebas en ComfyUI, se recomienda una GPU de 24 GB o más (RTX 3090, RTX 4090, A100 40 GB) y/o offloading a RAM; en 16 GB no se puede garantizar la ejecución sin técnicas agresivas de memoria.
- GPU de datacenter: A100 40/80 GB y H100 80 GB son las opciones lógicas para despliegue sin offloading; no se dispone de cifras de throughput.
- GPU de consumo: RTX 4090/3090 de 24 GB son las candidatas más realistas; RTX 4080/4070 Ti de 16 GB o menos quedan fuera del rango seguro para un pipeline completo.
- Despliegue: ComfyUI y RunningHub son las opciones indicadas por el autor. vLLM, TGI, llama.cpp y Ollama no aplican porque no es un LLM; no se confirma soporte en Diffusers.
- Latencia y throughput: no disponible. Dependen de la GPU, del número de pasos, de la resolución, de la duración del clip y del grado de offloading.

## Comparativa con modelos similares

La información disponible no permite comparar rendimiento cuantitativo. La tabla se limita a procedencia, disponibilidad y licencia.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-wannougan-2.2-turbo-plus-nsfw-int8low-unet | no disponible | no aplica | no disponible | no disponible explícita; remite al upstream | Hugging Face; ComfyUI/RunningHub |
| WanNougan 2.2 Turbo Plus NSFW int8 ConvRot (original en Civitai) | no disponible | no aplica | no disponible | no disponible en la información | Civitai; requiere cuenta y verificación |
| WAN2.2 LowNoise (base) | no disponible | no aplica | no disponible | no disponible en la información | Upstream de WAN2.2; no es un finetune NSFW |

## Limitaciones y advertencias

- Contenido NSFW: el modelo está pensado para material para adultos; exige verificación de edad, consentimiento explícito y cumplimiento de la legislación aplicable. No debe usarse para generar contenido con menores, personas reales sin consentimiento o material ilegal.
- No es un modelo completo: solo contiene el UNET. Sin text encoder, VAE y scheduler compatibles no genera vídeo; la compatibilidad exacta con versiones de WAN2.2 no está documentada.
- Licencia incierta: no hay licencia explícita en el repositorio; la model card remite a la licencia del proyecto original/upstream. El uso comercial, la redistribución y la creación de derivados requieren revisión legal.
- Riesgo de artefactos: como modelo de difusión de vídeo, puede producir incoherencias temporales, anatomía incorrecta, parpadeos, deformaciones y pérdida de identidad entre fotogramas; no hay benchmarks que cuantifiquen estos fallos.
- Sesgos no documentados: no se describe el dataset de entrenamiento, por lo que no se pueden evaluar sesgos de género, etnia, edad o cuerpo.
- Idioma y contexto: no se dispone de información sobre idiomas de prompt ni de ventana de contexto; el comportamiento dependerá del text encoder externo.
- Cuantización int8low: puede degradar la calidad frente a fp16/bf16 y requiere un runtime compatible; no se especifica el esquema exacto de cuantización.
- Validación comunitaria nula: 0 descargas y 0 me gusta en Hugging Face, sin benchmarks ni informes de terceros; no es una base recomendable para producción sin pruebas internas.
- El sufijo turbo no está documentado: no se confirman pasos de muestreo, scheduler ni técnica de aceleración.

## Enlaces

- [Hugging Face](https://huggingface.co/RunningHubAI/rh-wannougan-2.2-turbo-plus-nsfw-int8low-unet)
- [Modelo original en RunningHub](https://www.runninghub.ai/model/public/2077997368323559426)
- [Página del autor en RunningHub](https://www.runninghub.ai/user-center/2041030036219498497)
- [Fuente original en Civitai](https://civitai.red/models/2782946/wannougan-22-turbo-plus-nsfw-int8-convrot?modelVersionId=3134477)
- [RunningHub International](https://www.runninghub.ai)
- [RunningHub China](https://www.runninghub.cn)
- [Documentación de la API en inglés](https://www.runninghub.cn/runninghub-api-doc-en/)
- [Documentación de la API en chino](https://www.runninghub.cn/runninghub-api-doc-cn/)
- [Entrenamiento en RunningHub](https://www.runninghub.ai/page-model)
- [API de RunningHub](https://www.runninghub.ai/call-api)
- [README en chino](https://huggingface.co/RunningHubAI/rh-wannougan-2.2-turbo-plus-nsfw-int8low-unet/blob/main/README_cn.md)
