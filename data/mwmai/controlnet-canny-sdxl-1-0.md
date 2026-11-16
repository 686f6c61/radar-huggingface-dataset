# mwmai/controlnet-canny-sdxl-1.0

## Resumen

ControlNet Canny para SDXL es un adaptador de control que se acopla al modelo base Stable Diffusion XL 1.0 para condicionar la generacion de imagenes a partir de mapas de bordes extraidos con el algoritmo de Canny. Lo publica el usuario mwmai en Hugging Face, con un unico checkpoint de 1.251.014.160 parametros (aproximadamente 1,25 mil millones) y un repositorio de 15 GB en formato safetensors, compatible con la libreria diffusers. Su funcion es anadir control estructural preciso a la sintesis text-to-image: el prompt define el contenido semantico y el mapa de bordes define la composicion geometrica.

El modelo resuelve un problema concreto en flujos de generacion de imagen: mantener la estructura de una referencia (fotografia, boceto, diseno) mientras se reestiliza o se regenera el contenido. Frente al texto libre, el condicionamiento por bordes reduce la deriva compositiva y permite iterar sobre una misma estructura con distintos prompts. Es relevante porque SDXL es uno de los modelos base abiertos mas utilizados y los ControlNet son la via estandar para anadir control espacial sin reentrenar el modelo base.

Conviene senalar una inconsistencia en los metadatos: la model card describe pesos entrenados sobre stabilityai/stable-diffusion-xl-base-1.0, mientras que el campo base_model del repositorio apunta a runwayml/stable-diffusion-v1-5. El uso documentado por el autor (pipeline StableDiffusionXLControlNetPipeline con el modelo base SDXL) es el que debe considerarse operativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ControlNet (adaptador de control sobre un UNet de difusion latente SDXL) |
| Parametros totales | 1.251.014.160 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a modelos de difusion) |
| Tipos de cuantizacion | fp16 (entrenamiento y uso documentado); no se documentan otras variantes |
| Idiomas soportados | no disponible (el condicionamiento textual depende del codificador de texto del modelo base SDXL) |
| Licencia | openrail++ |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

El checkpoint es un ControlNet acoplado a la arquitectura de difusion latente de SDXL. El ControlNet replica parcialmente el codificador del UNet del modelo base y proyecta el mapa de condicionamiento (en este caso, una imagen de bordes Canny replicada en tres canales) en representaciones que se inyectan en las capas del UNet mediante conexiones residuales de media anchura. El pipeline de referencia es StableDiffusionXLControlNetPipeline, con el VAE madebyollin/sdxl-vae-fp16-fix para evitar inestabilidades numericas en fp16.

El entrenamiento se construyo sobre el script oficial de diffusers para ControlNet SDXL. Se realizaron 20.000 pasos sobre LAION 6a redimensionado con dimension minima maxima de 384, seguidos de otros 20.000 pasos sobre el mismo dataset redimensionado a 1024 y filtrado para conservar solo imagenes de al menos 1024 pixeles; el autor indica que este segundo finetuning en alta resolucion fue necesario para la calidad final. El computo fue una maquina de 8xA100, con batch size efectivo de 64 (8 por GPU en paralelo de datos), learning rate constante de 1e-4 escalado por batch hasta 64e-4 y precision mixta fp16. No se documenta el uso de RLHF, DPO ni preferencias humanas.

## Capacidades

- Generacion de imagen text-to-image condicionada por mapas de bordes Canny, con control de la composicion geometrica.
- Reestilizacion de imagenes de referencia conservando la estructura (fotografia a ilustracion, boceto a render, etc.).
- Escalado de condicionamiento mediante controlnet_conditioning_scale; el autor recomienda 0,5 para buena generalizacion.
- Integracion con prompts positivos y negativos, permitiendo excluir artefactos mediante negative_prompt.
- Compatibilidad con el ecosistema diffusers: carga directa con ControlNetModel.from_pretrained y uso en StableDiffusionXLControlNetPipeline.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de audio o vision mas alla del propio condicionamiento por imagen de bordes.
- Capacidades multilingues: no documentadas; dependen del codificador de texto del modelo base SDXL.

## Casos de uso

- Reestilizacion de fotografias de producto: se extrae el contorno Canny de la foto original y se regenera con un prompt de estilo (estudio, iluminacion, fondo) manteniendo la silueta y la composicion, util para catalogos de e-commerce.
- Conversion de bocetos a renders: disenadores dibujan la estructura de un mueble o interior y el modelo genera una imagen fotorrealista con el mismo esquema geometrico, acelerando la iteracion conceptual.
- Control de composicion en ilustracion editorial: se fija la disposicion de personajes y objetos mediante bordes y se varian estilos y paletas con distintos prompts sobre la misma estructura.
- Consistencia de encuadre en series de imagenes: al reutilizar el mismo mapa Canny con prompts distintos se obtienen variaciones coherentes en layout, util para storyboards y secuencias visuales.
- Prototipado de arquitectura e interiores: a partir de lineas de plano o contornos de referencia se generan imagenes de ambientacion con la geometria respetada.
- Restauracion y reinterpretacion de material grafico: se extraen bordes de imagenes antiguas o de baja calidad y se regeneran a mayor fidelidad visual con el contenido estructural preservado.
- Integracion en pipelines automatizados de diffusers: el checkpoint se carga como modulo ControlNetModel y se encadena con el modelo base SDXL en servicios de generacion por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, comparativas con otros ControlNet) y unicamente presenta ejemplos cualitativos con prompts de pareja al atardecer, pajaro azul, retrato femenino, sala neoclasica y tornado en campo de hierba.

## Requisitos de hardware

- VRAM estimada: el checkpoint ControlNet en fp16 ocupa aproximadamente 2,5 GB; el modelo base SDXL 1.0 en fp16 requiere en torno a 7 GB adicionales, y el VAE fp16-fix anade una fraccion menor. La inferencia completa en fp16 se situa tipicamente en el rango de 10-12 GB de VRAM sin optimizaciones.
- GPU recomendadas: A100 (usada en entrenamiento con 8 unidades), H100, y para inferencia tambien RTX 4090 (24 GB) y RTX 3090 (24 GB) con comodidad.
- GPU de consumo: cabe en tarjetas de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4060 Ti 16 GB) con fp16 y, en configuraciones de 8 GB, recurriendo a enable_model_cpu_offload o a cuantizacion del modelo base.
- Opciones de despliegue: diffusers con StableDiffusionXLControlNetPipeline (via documentada por el autor), con soporte de enable_model_cpu_offload; el ecosistema diffusers permite ademas integracion con aceleradores de atencion y variantes de memoria eficiente. No se documentan instrucciones especificas para vLLM, llama.cpp, Ollama o TGI, que no son herramientas orientadas a difusion.
- Latencia y throughput: no disponibles; no se publican mediciones de tiempo por imagen ni imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Base | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mwmai/controlnet-canny-sdxl-1.0 | 1,25 mil millones | SDXL 1.0 (segun model card) | Canny | openrail++ | Hugging Face, diffusers |
| diffusers/controlnet-canny-sdxl-1.0 | no disponible en la informacion | SDXL 1.0 | Canny | no disponible en la informacion | Hugging Face, diffusers |
| ControlNet Canny para SD 1.5 (familia lllyasviel) | no disponible en la informacion | SD 1.5 | Canny | no disponible en la informacion | Hugging Face |

La comparativa cuantitativa de rendimiento entre estos checkpoints no esta disponible en la informacion proporcionada; no se han publicado metricas que permitan ordenarlos.

## Limitaciones y advertencias

- Inconsistencia de metadatos: la model card indica entrenamiento sobre SDXL 1.0, pero el campo base_model del repositorio apunta a runwayml/stable-diffusion-v1-5; verificar la compatibilidad del pipeline antes de desplegar.
- El repositorio registra 0 descargas y 0 likes, sin validacion de la comunidad; la procedencia y la calidad del checkpoint no estan contrastadas de forma independiente.
- Riesgo de alucinacion visual: el modelo puede generar detalles plausibles pero inexistentes respecto a la referencia, especialmente con valores altos de controlnet_conditioning_scale o prompts ambiguos.
- El condicionamiento Canny captura solo bordes; pierde informacion de color, textura y profundidad, por lo que no sustituye a otros ControlNet (depth, segmentation, pose) en tareas que requieran esas senales.
- Sensibilidad a los umbrales del detector Canny (100 y 200 en el ejemplo del autor): umbrales mal ajustados degradan la fidelidad estructural.
- La licencia openrail++ impone restricciones de uso; conviene revisar sus clausulas antes de un despliegue comercial, en particular las obligaciones de atribucion y las limitaciones sobre usos prohibidos.
- Sesgos: no documentados por el autor; al derivar de LAION 6a y de SDXL, el checkpoint puede heredar sesgos demograficos y estilisticos del dataset y del modelo base.
- Idiomas: no se declaran lenguajes soportados; el rendimiento con prompts en castellano depende del codificador de texto de SDXL y no esta medido en esta ficha.
- inference: false figura en los metadatos de la model card, lo que puede afectar a la carga automatica en algunos flujos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mwmai/controlnet-canny-sdxl-1.0
- Modelo base citado en la model card: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Modelo base indicado en los metadatos: https://huggingface.co/runwayml/stable-diffusion-v1-5
- Checkpoint de referencia del pipeline: https://huggingface.co/diffusers/controlnet-canny-sdxl-1.0
- VAE recomendado: https://huggingface.co/madebyollin/sdxl-vae-fp16-fix
- Documentacion del pipeline: https://huggingface.co/docs/diffusers/main/en/api/pipelines/controlnet_sdxl
- Script de entrenamiento ControlNet SDXL: https://github.com/huggingface/diffusers/blob/main/examples/controlnet/README_sdxl.md
