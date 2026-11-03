# RunningHubAI/rh-krea2-lora-mariana-lora

## Resumen

rh-krea2-lora-mariana-lora es un adaptador LoRA de edicion de imagen publicado por RunningHubAI en nombre de la agencia Rapport. Se distribuye como un unico fichero de pesos `mariana.safetensors` de 218 MiB (aproximadamente 0,2 GB) y esta afinado a partir del modelo base `krea2`, un modelo de generacion y edicion de imagen texto-a-imagen. El adaptador activa un estilo o identidad concreta mediante la palabra de activacion `MARIANA`, que debe incluirse en el prompt para que el efecto se aplique.

El modelo no es un LLM ni un modelo de lenguaje: es un LoRA para pipelines de difusion de imagen, integrable en ComfyUI, en la plataforma RunningHub y en Hugging Face. Su proposito es anadir un estilo o sujeto especifico al modelo base sin reentrenar los pesos completos, lo que reduce el coste de almacenamiento y de inferencia frente a un fine-tuning completo.

La relevancia es acotada: se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, sin model card tecnica detallada ni resultados de evaluacion. La informacion publica disponible se limita a metadatos de plataforma, tamano del fichero y palabra de activacion, por lo que muchas especificaciones habituales quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base krea2, pipeline image-text-to-image |
| Parametros totales | no disponible (adaptador LoRA de 218 MiB; el numero de parametros no se declara) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica contexto textual en el sentido de un LLM) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; no se declaran variantes GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (los prompts dependen del codificador de texto del modelo base krea2) |
| Licencia | no disponible; la model card indica que se publica en nombre del autor, que conserva el copyright, y remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`mariana.safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base `krea2` para modificar su comportamiento sin alterar los pesos originales. El pipeline declarado es `image-text-to-image`, y la model card lo clasifica como "LoRA (image edit)", lo que sugiere un uso orientado a edicion o generacion de imagen condicionada por texto. No se especifica en que capas del transformer de difusion se insertan los adaptadores, ni el rango, ni el alpha del LoRA.

No hay informacion publica sobre el dataset de entrenamiento: no se indica numero de imagenes, resolucion, composicion, ni si hubo tecnicas de regularizacion o captions automaticos. Tampoco se documenta si el entrenamiento se realizo en la propia plataforma RunningHub (la model card ofrece un enlace generico para entrenar modelos alli, pero no confirma que este adaptador se haya producido con ese flujo). No se declaran innovaciones tecnicas adicionales.

## Capacidades

- Aplicacion de un estilo o identidad visual concreta sobre el modelo base krea2 mediante la palabra de activacion `MARIANA`.
- Generacion de imagen condicionada por texto a traves del pipeline image-text-to-image del modelo base.
- Edicion de imagen (la model card lo etiqueta como "image edit"), aunque no se detalla el tipo exacto de edicion soportada.
- Integracion en ComfyUI como nodo LoRA, segun la etiqueta `comfyui` del repositorio.
- Ejecucion en la plataforma RunningHub y en Hugging Face, segun los enlaces de la model card.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, vision de entrada adicional, audio ni modo thinking; son capacidades no aplicables o no disponibles para un LoRA de imagen.

## Casos de uso

- Generacion de imagenes con estilo consistente: cargar el LoRA en ComfyUI junto al modelo base krea2 e incluir `MARIANA` en el prompt para obtener una estetica o sujeto recurrente en una serie de imagenes.
- Produccion de contenido para redes sociales: generar variaciones de una misma identidad visual manteniendo coherencia entre piezas gracias al adaptador de bajo rango.
- Prototipado de campanas creativas: iterar rapidamente sobre un estilo concreto sin reentrenar el modelo base, reduciendo el coste a un fichero de 218 MiB.
- Edicion de imagenes existentes: usar el pipeline image-text-to-image con el LoRA para aplicar el estilo MARIANA sobre una imagen de referencia, segun la etiqueta "image edit" del autor.
- Automatizacion via API de RunningHub: invocar el modelo alojado en la plataforma mediante su API para integrar la generacion en un flujo de produccion sin gestionar infraestructura propia.
- Catalogos y mockups de producto: generar variaciones visuales de un mismo concepto con un estilo controlado, util para equipos de diseno que necesitan volumen sin perder consistencia.
- Experimentacion en investigacion de adaptadores: usar el LoRA como caso de estudio de bajo rango sobre un modelo de difusion, dado su tamano reducido y su formato safetensors estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El LoRA en si ocupa 218 MiB, pero el requisito real lo determina el modelo base krea2, cuyas especificaciones no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible; depende del modelo base y de la resolucion de generacion.
- Compatibilidad con GPU de consumo: no confirmada. Un adaptador de 218 MiB es ligero, pero la viabilidad en tarjetas como RTX 4090 o RTX 3060 depende enteramente del modelo base krea2.
- Opciones de despliegue: ComfyUI (etiqueta oficial del repositorio), plataforma RunningHub y Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros / tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-krea2-lora-mariana-lora | LoRA sobre krea2 (image-text-to-image) | 218 MiB (adaptador) | no aplica | no disponible | Hugging Face, RunningHub, ComfyUI |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros LoRA del mismo autor o de la misma categoria con la que establecer una comparacion fiable de rendimiento, licencia o contexto.

## Limitaciones y advertencias

- Ausencia total de evaluacion: cero descargas y cero likes, sin benchmarks ni ejemplos publicados que permitan validar la calidad del adaptador.
- Model card minima: no se documentan rango del LoRA, capas objetivo, dataset de entrenamiento ni hiperparametros, lo que dificulta reproducir o auditar el resultado.
- Dependencia del modelo base: el comportamiento final depende de krea2; sin acceso a sus especificaciones no se puede estimar VRAM, resolucion maxima ni latencia.
- Licencia no disponible: la model card remite a la licencia del proyecto original o upstream y reserva el copyright al autor. Antes de un uso comercial es necesario verificar la licencia de krea2 y del adaptador, algo que no se puede confirmar con la informacion publicada.
- Riesgo de sobreajuste al estilo: al ser un LoRA de estilo o identidad, puede degradar la diversidad de las generaciones o introducir artefactos si se usa con pesos altos; no se documenta el peso recomendado.
- Dependencia de la palabra de activacion: sin `MARIANA` en el prompt el efecto puede no aplicarse o aplicarse de forma debil.
- Idiomas no declarados: el soporte multilingue de los prompts depende del codificador de texto del modelo base y no se especifica.
- Fecha de creacion futura en los metadatos (2026-11-03) y actualizacion un minuto despues, lo que sugiere una publicacion automatizada sin revision editorial posterior.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-lora-mariana-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2112297175228469249
- Pagina del autor (Rapport agency): https://www.runninghub.ai/user-center/2103384117865095169
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-krea2-lora-mariana-lora/blob/main/README_cn.md
