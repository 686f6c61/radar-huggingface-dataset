# egelette/baikal-signac-lora

## Resumen

Baikal-Signac LoRA es un adaptador de bajo rango (LoRA) entrenado mediante DreamBooth sobre Stable Diffusion XL Base 1.0, el modelo de difusion texto-a-imagen de Stability AI. Lo desarrolla el usuario egelette y su proposito es inyectar un estilo visual concreto, activado mediante la frase de disparo "a painting in snqstyle", en el pipeline de generacion de imagenes de SDXL sin necesidad de reentrenar el modelo base completo.

El adaptador se distribuye en formato Safetensors y se integra con la libreria diffusers. El entrenamiento se realizo con el VAE fp16-fix de madebyollin (sdxl-vae-fp16-fix) y sin LoRA en el text encoder, lo que significa que el adaptador modifica unicamente los bloques de atencion del UNet. El repositorio es de tipo plantilla autogenerada por el script de entrenamiento y no incluye documentacion tecnica elaborada por el autor.

La relevancia de esta ficha es acotada: se trata de un adaptador de estilo de nicho, con 12 descargas y ningun "like" en el momento de la consulta, sin benchmarks publicados ni model card completada. Resulta util como ejemplo de flujo DreamBooth + LoRA sobre SDXL y para quien busque replicar un estilo pictorico concreto, pero no constituye un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de Stable Diffusion XL Base 1.0 (difusion latente) |
| Parametros totales | no disponible (el adaptador LoRA es un subconjunto de pesos; no se publica el recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; el prompt de texto no tiene ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (pesos publicados en Safetensors; el base admite fp16 y cuantizaciones de la comunidad) |
| Idiomas soportados | no disponible (el prompt de texto de SDXL se entrena principalmente en ingles; el adaptador no declara idiomas) |
| Licencia | openrail++ |
| Formato de pesos | Safetensors |
| Modelo base | stabilityai/stable-diffusion-xl-base-1.0 |
| VAE de entrenamiento | madebyollin/sdxl-vae-fp16-fix |
| LoRA en text encoder | No (deshabilitado) |
| Frase de disparo | "a painting in snqstyle" |
| Libreria | diffusers |
| Tamano del repositorio | 0.0 GB (redondeado en la ficha de Hugging Face) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura de difusion latente de Stable Diffusion XL: un UNet que opera sobre representaciones latentes producidas por un VAE, condicionado por embeddings de texto de dos codificadores (CLIP ViT-L y OpenCLIP ViT-bigG en SDXL). El LoRA inserta matrices de bajo rango en las capas de atencion del UNet, de modo que el modelo base permanece congelado y solo se entrenan esos parametros adicionales. En este caso el LoRA del text encoder esta desactivado, por lo que el condicionamiento textual no se altera y el estilo se aprende exclusivamente en el lado del UNet.

El entrenamiento emplea DreamBooth, una tecnica de ajuste fino personalizado que asocia una frase de disparo ("a painting in snqstyle") con un concepto o estilo a partir de un conjunto reducido de imagenes. Se utilizo el VAE sdxl-vae-fp16-fix para evitar problemas numericos en precision fp16 durante el entrenamiento. La model card no especifica el numero de imagenes de entrenamiento, el numero de pasos, la tasa de aprendizaje, el rango del LoRA ni la composicion del dataset; todos estos datos figuran como pendientes (TODO) en la documentacion original. Tampoco se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, que no aplican a un modelo de difusion de este tipo.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el modelo base SDXL, con aplicacion de un estilo pictorico concreto al activar la frase "a painting in snqstyle".
- Transferencia de estilo visual: el adaptador modifica la estetica de la salida (textura, paleta, tratamiento pictorico) sin cambiar el contenido semantico del prompt.
- Compatibilidad con el ecosistema diffusers: se carga como adaptador LoRA sobre el pipeline de SDXL.
- Composicion con otros adaptadores: al ser un LoRA sobre el UNet, puede combinarse tecnicamente con otros LoRA de SDXL, aunque no se documenta la compatibilidad ni los pesos de mezcla recomendados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo "thinking": es un modelo generativo de imagenes, no un modelo de lenguaje.
- No dispone de capacidades de vision, audio ni comprension multimodal.
- El soporte multilingue de prompts depende del modelo base SDXL y no esta documentado para este adaptador.

## Casos de uso

- Ilustracion editorial con estilo consistente: usar el adaptador para generar ilustraciones de articulos o portadas manteniendo una estetica pictorica uniforme entre piezas, activando "a painting in snqstyle" en cada prompt para preservar la coherencia visual de la serie.
- Creacion de concept art para videojuegos: generar variaciones de escenarios y personajes con un tratamiento pictorico definido, aprovechando que SDXL maneja composiciones complejas y el LoRA fija el estilo sin reentrenar el base.
- Prototipado rapido de direccion de arte: producir tableros de referencia (moodboards) en minutos para validar una linea estetica antes de encargar trabajo a ilustradores humanos.
- Generacion de fondos y texturas para produccion audiovisual: crear fondos pictoricos para animacion, presentaciones o motion graphics, reutilizando el mismo adaptador para mantener cohesion entre planos.
- Experimentacion academica con DreamBooth y LoRA: servir como caso de estudio reproducible de ajuste fino personalizado sobre SDXL, util para investigar como se comporta un LoRA de estilo entrenado solo en el UNet y con el text encoder congelado.
- Contenido para redes y marketing de nicho: generar imagenes de marca con una estetica propia para campanas que requieran diferenciacion visual, siempre que la licencia openrail++ se respete en el uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud estetica) ni comparaciones con otros adaptadores de estilo.

## Requisitos de hardware

- VRAM estimada para inferencia: al ejecutarse sobre SDXL Base 1.0, el requisito practico es el del modelo base. En fp16, SDXL ocupa aproximadamente 6-7 GB de VRAM para el UNet y el VAE, mas el overhead del pipeline; en la practica se recomiendan 8-10 GB para generar a 1024x1024 sin offloading.
- GPU recomendadas: NVIDIA A100 o H100 para lotes grandes y alta concurrencia; RTX 4090 (24 GB) para generacion rapida a 1024x1024; RTX 3090 (24 GB) como alternativa de coste similar.
- GPU de consumo: cabe en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB y RTX 4070 en adelante, con posible uso de atencion eficiente o fp16. En GPUs de 8 GB puede requerir offloading secuencial o cuantizacion del base.
- Opciones de despliegue: diffusers (carga del adaptador con `load_lora_weights` sobre el pipeline de SDXL), ComfyUI y Automatic1111/Forge mediante carga de LoRA, y entornos con aceleracion como TensorRT u ONNX Runtime para el base. No se documenta soporte especifico en vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a difusion.
- Latencia y throughput: no disponibles. Dependen enteramente del hardware y del modelo base; no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| egelette/baikal-signac-lora | LoRA de estilo | SDXL Base 1.0 | no disponible | no aplica | openrail++ | Hugging Face, 12 descargas |
| Adaptadores LoRA de estilo para SDXL (comunidad) | LoRA de estilo | SDXL Base 1.0 | variable | no aplica | variable (muchos openrail++) | Amplia en Hugging Face y Civitai |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo base texto-a-imagen | - | no disponible en la informacion | no aplica | openrail++ | Hugging Face, ampliamente adoptado |
| FLUX.1 (familia) | Modelo base texto-a-imagen | - | no disponible en la informacion | no aplica | variable segun variante | Hugging Face |

La comparacion cuantitativa de rendimiento no es posible: no hay benchmarks publicados para este adaptador ni datos de referencia en la informacion proporcionada. Frente a otros LoRA de estilo de la comunidad, la diferencia practica es la frase de disparo y el estilo concreto, no una mejora medible de calidad.

## Limitaciones y advertencias

- Sesgos conocidos: heredados del modelo base SDXL y de las imagenes usadas en el entrenamiento del estilo; la model card no documenta analisis de sesgo ni ejemplos de problemas latentes (figura como TODO).
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta, texto ilegible, perspectivas incoherentes y artefactos, especialmente en composiciones con muchas figuras o detalles finos.
- Limitaciones de contexto e idioma: no hay ventana de contexto; la calidad del prompt depende del modelo base, entrenado principalmente en ingles, por lo que prompts en castellano pueden rendir peor.
- Restricciones de licencia: openrail++ permite uso comercial con condiciones (atribucion y clausulas de uso aceptable); conviene revisar el texto completo de la licencia antes de un despliegue en produccion. El adaptador hereda ademas las obligaciones del modelo base.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma; requiere descargar stabilityai/stable-diffusion-xl-base-1.0 y, para reproducir el entrenamiento, el VAE madebyollin/sdxl-vae-fp16-fix.
- Documentacion incompleta: la model card es una plantilla autogenerada con secciones TODO (ejemplo de codigo, limitaciones, detalles de entrenamiento); no hay informacion sobre el dataset, hiperparametros ni evaluacion.
- Madurez y soporte: 12 descargas y 0 likes indican un uso muy limitado; no hay garantia de mantenimiento ni de compatibilidad con versiones futuras de diffusers.
- Repositorio de tamano 0.0 GB en la ficha: el peso real del adaptador no se detalla; conviene verificar los archivos en la pestana Files antes de integrarlo en un pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/egelette/baikal-signac-lora
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- VAE utilizado en entrenamiento: https://huggingface.co/madebyollin/sdxl-vae-fp16-fix
- DreamBooth (paper/proyecto): https://dreambooth.github.io/
- Libreria diffusers: https://github.com/huggingface/diffusers
- Licencia openrail++: https://huggingface.co/spaces/CompVis/stable-diffusion-license
