# hoyolom/controlnet-canny-sdxl-1.0

## Resumen

ControlNet Canny para SDXL 1.0, publicado en el repositorio `hoyolom/controlnet-canny-sdxl-1.0`. Se trata de un adaptador de control espacial que se acopla a `stabilityai/stable-diffusion-xl-base-1.0` para condicionar la generacion de imagenes a un mapa de bordes Canny extraido de una imagen de referencia. El autor original del modelo es xinsir (asi consta en la model card); el repositorio analizado es una copia subida por el usuario hoyolom, sin descargas ni likes registrados en el momento de la consulta.

El modelo resuelve un problema concreto del flujo de trabajo con difusion: mantener la estructura, la silueta y la composicion de una imagen fuente mientras se reestiliza por completo mediante un prompt de texto. Frente al ControlNet Canny oficial de diffusers, el autor declara un entrenamiento con mas de 10 millones de imagenes filtradas y recaptionadas con un modelo VLLM, junto con tecnicas de aumento de datos, perdida multiple y entrenamiento multi-resolucion en una sola etapa.

Arquitectonicamente es un ControlNet estandar sobre el UNet de SDXL: una copia entrenable de los bloques codificadores con convoluciones cero-inicializadas, con 1.251.014.160 parametros (aproximadamente 1,25 mil millones) en formato safetensors, un peso de repositorio de 5,0 GB y licencia Apache-2.0. No es un modelo autonomo: requiere siempre un modelo base SDXL y un VAE compatible para generar imagenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ControlNet (copia entrenable de los bloques encoder del UNet de SDXL con convoluciones cero) sobre difusion latente |
| Parametros totales | 1.251.014.160 (aproximadamente 1,25 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion de imagenes); resolucion nativa de 1024 x 1024 px |
| Tipos de cuantizacion | no disponible en la model card; pesos publicados en fp16 (safetensors); existen conversiones comunitarias a fp8 y GGUF para ComfyUI y Forge |
| Idiomas soportados | no disponible; los text encoders del modelo base (CLIP ViT-L y OpenCLIP ViT-bigG) estan entrenados predominantemente en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

El modelo sigue la formulacion clasica de ControlNet presentada en el paper arXiv:2302.05543: se clona el codificador del UNet de SDXL y se conecta al decodificador original mediante conexiones residuales con convoluciones inicializadas a cero, de modo que en el paso inicial de entrenamiento la red se comporta como el modelo base y no degrada su calidad. Con 1,25 mil millones de parametros, corresponde aproximadamente a la mitad del UNet de SDXL, que es la proporcion esperada en un ControlNet de este tipo. El condicionamiento se inyecta en forma de mapa de bordes Canny generado con el operador de Canny (umbrales habituales de 100 y 200) a resolucion bucket de 1024 x 1024.

Segun la model card, el entrenamiento utilizo mas de 10 millones de imagenes de alta calidad, filtradas y recaptionadas con un modelo VLLM, e incorporo aumento de datos, funcion de perdida multiple y entrenamiento multi-resolucion. El autor afirma que una sola etapa de entrenamiento basta para superar a los ControlNet Canny de codigo abierto de referencia, en concreto `diffusers/controlnet-canny-sdxl-1.0` y `TheMistoAI/MistoLine`. No se publican detalles sobre el numero exacto de pasos, la composicion del dataset, el hardware empleado ni si hubo fases de RLHF o DPO; en modelos de difusion estos terminos no aplican del mismo modo que en LLM.

## Capacidades

- Generacion de imagenes de alta resolucion (1024 x 1024 px) condicionada por un mapa de bordes Canny, manteniendo la estructura de la imagen de referencia.
- Reestilizado completo: permite cambiar estilo, iluminacion, materiales y paleta conservando la geometria y la silueta originales.
- Transferencia de estructura entre dominios: bocetos lineales a render, fotografias a ilustracion, planos a visualizacion arquitectonica.
- Compatibilidad con distintos modelos base SDXL: la model card menciona explicitamente el uso con `CounterfeitXL` para estilos anime, cambiando tambien el VAE correspondiente.
- Ajuste de la intensidad del condicionamiento mediante el parametro `controlnet_conditioning_scale`, que permite desde una fidelidad estricta hasta una reinterpretacion mas libre.
- Integracion en pipelines de `diffusers` con schedulers como Euler Ancestral o DDIM, y control del numero de pasos de inferencia.
- Capacidad de combinarse con otros adaptadores (LoRA, otros ControlNet) en entornos como ComfyUI para control multiple.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo generativo de imagenes, no un modelo de lenguaje.

## Casos de uso

- Ilustracion a partir de bocetos: un ilustrador dibuja las lineas principales a mano o en digital y el modelo produce una imagen acabada a color manteniendo exactamente la composicion. Es adecuado porque el condicionamiento Canny preserva los contornos con alta fidelidad.
- Visualizacion arquitectonica y de interiores: a partir de un alzado o un plano con lineas definidas, se generan renders fotorrealistas con distintos materiales y estilos, acelerando la iteracion con el cliente antes de modelar en 3D.
- Previsualizacion de storyboards en cine y animacion: se toman los paneles dibujados y se convierten en fotogramas con iluminacion y arte final coherentes, utiles para presentaciones de pitch y para definir la direccion de fotografia.
- Diseno de producto y packaging: partiendo del contorno tecnico de un envase o de un objeto, se generan variantes de acabado, etiquetado y fotografia publicitaria con fondo neutro.
- E-commerce y moda: reestilizado de fotografias de prendas o modelos conservando la silueta exacta, lo que permite generar variaciones de fondo, iluminacion y ambientacion sin volver a fotografiar el producto.
- Produccion grafica y marketing: generacion de key visuals a partir de un layout con estructura fija (jerarquia de elementos, espacios reservados para texto), garantizando que la composicion se respete en todas las variantes de formato.
- Enriquecimiento de datasets sinteticos: dado un conjunto de imagenes con estructura diversa, se generan pares imagen-borde para aumentar datos de entrenamiento en tareas de vision por computador, manteniendo control explicito sobre la geometria.
- Integracion en ComfyUI o Forge: el modelo puede incorporarse como nodo de ControlNet dentro de grafos mas complejos, encadenando varios condicionamientos y modelos base para flujos de produccion reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente afirma de forma cualitativa que el modelo supera a `diffusers/controlnet-canny-sdxl-1.0` y a `TheMistoAI/MistoLine` en calidad visual, sin aportar metricas objetivas (FID, CLIP score, SSIM del condicionamiento, comparativas ciegas con evaluadores humanos ni tablas de resultados). Tampoco se han encontrado resultados en la busqueda web realizada, que no devolvio ningun resultado relevante sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el pipeline completo en fp16 (ControlNet de 1,25 mil millones de parametros mas el modelo base SDXL con UNet, text encoders y VAE) ocupa aproximadamente entre 9 y 11 GB de VRAM a 1024 x 1024 px. El ControlNet por si solo pesa alrededor de 2,5 GB en fp16.
- GPU consumer: cabe en tarjetas de 12 GB o mas, como RTX 3060 12 GB, RTX 4070, RTX 4070 Ti o RTX 4080. En tarjetas de 8 GB es posible ejecutarlo con `enable_model_cpu_offload` o `enable_sequential_cpu_offload`, a costa de una latencia bastante mayor.
- GPU profesional: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB), H100 (80 GB) y L40S (48 GB) permiten lotes mayores y mayor resolucion sin offloading.
- Despliegue: la via oficial es la libreria `diffusers` con `StableDiffusionXLControlNetPipeline` y `ControlNetModel`. En produccion grafica se usa habitualmente a traves de ComfyUI, AUTOMATIC1111 WebUI o Stable Diffusion WebUI Forge. No es compatible con TGI ni con vLLM, que estan orientados a modelos de lenguaje. Es posible exportar a TensorRT para acelerar la inferencia, aunque no se documenta en la model card.
- Latencia y throughput estimados: con 30 pasos de inferencia y scheduler Euler Ancestral a 1024 x 1024 px, se estiman del orden de 4 a 8 segundos por imagen en una RTX 4090 y de 2 a 5 segundos en una A100 o H100. Estas cifras son una estimacion a partir del tamano del pipeline y no proceden de mediciones publicadas por el autor.
- El uso de `madebyollin/sdxl-vae-fp16-fix` esta recomendado en el ejemplo oficial para evitar problemas de desbordamiento numerico tipico (NaN) del VAE de SDXL en fp16.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion / contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hoyolom/controlnet-canny-sdxl-1.0 | 1,25 mil millones (ControlNet) | 1024 x 1024 px | apache-2.0 | HuggingFace (diffusers); 0 descargas y 0 likes en el momento de la consulta | Copia del modelo de xinsir; el autor declara superar a las alternativas, sin metricas publicas |
| xinsir/controlnet-canny-sdxl-1.0 | 1,25 mil millones (ControlNet) | 1024 x 1024 px | apache-2.0 | HuggingFace (diffusers) | Modelo original del que deriva el repositorio analizado; mismo autor de entrenamiento segun la model card |
| diffusers/controlnet-canny-sdxl-1.0 | 1,25 mil millones (ControlNet) | 1024 x 1024 px | apache-2.0 | HuggingFace (diffusers) | Referencia oficial de diffusers, citada como linea base superada por el autor |
| TheMistoAI/MistoLine | 1,25 mil millones (ControlNet) | 1024 x 1024 px | apache-2.0 | HuggingFace (diffusers) | ControlNet alternativo para lineart y bordes, citado como linea base superada por el autor |

## Limitaciones y advertencias

- Riesgo de alucinacion estructural: aunque el condicionamiento Canny fija los contornos, el modelo puede rellenar zonas ambiguas con contenido incoherente, especialmente con mapas de bordes muy ruidosos o con umbrales de Canny mal ajustados.
- Dependencia del modelo base: los resultados varian sustancialmente segun el checkpoint SDXL utilizado. La model card advierte de que al cambiar de modelo base hay que cambiar tambien el VAE para evitar artefactos.
- Sensibilidad al preprocesado: la calidad del mapa Canny (umbrales, resolucion, grosor de linea) condiciona directamente la salida. El ejemplo oficial recomienda redimensionar a bucket de 1024 x 1024 antes de aplicar el detector de bordes.
- Idiomas: la model card no declara idiomas soportados. Los text encoders de SDXL (CLIP ViT-L y OpenCLIP ViT-bigG) estan entrenados mayoritariamente en ingles, por lo que los prompts en castellano rinden peor que en ingles.
- Sesgos: no hay documentacion sobre sesgos en la informacion disponible. Al derivar del modelo base SDXL, hereda los sesgos demograficos y culturales de su dataset de entrenamiento, que no se detalla mas alla de la cifra de 10 millones de imagenes.
- Contenido generado: el ejemplo oficial desactiva el safety checker (`safety_checker=None`), lo que elimina el filtro de contenido. En produccion es responsabilidad del integrador anadir moderacion propia.
- Licencia: el ControlNet se publica bajo Apache-2.0, permisiva y valida para uso comercial. Sin embargo, el modelo base `stabilityai/stable-diffusion-xl-base-1.0` esta bajo CreativeML Open RAIL++-M, con clausulas de uso restringido, por lo que el pipeline completo queda sujeto a las condiciones del modelo base.
- Repositorio sin validacion: el repositorio analizado no tiene descargas ni likes, y la model card indica que el autor original es xinsir. Conviene verificar la integridad de los pesos y preferir el repositorio original para uso en produccion.
- Sin benchmarks publicados: no existen metricas objetivas que respalden las afirmaciones de superioridad frente a otros ControlNet Canny.
- Metadatos anom alos: la fecha de creacion del repositorio figura como 2026-09-13, posterior a la fecha de consulta, lo que sugiere un error de metadatos o de sincronizacion.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/hoyolom/controlnet-canny-sdxl-1.0
- Repositorio original del autor del entrenamiento (xinsir): https://huggingface.co/xinsir/controlnet-canny-sdxl-1.0
- Paper de ControlNet (arXiv:2302.05543): https://arxiv.org/abs/2302.05543
- Modelo base SDXL 1.0: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- VAE recomendado en fp16: https://huggingface.co/madebyollin/sdxl-vae-fp16-fix
- ControlNet Canny oficial de diffusers: https://huggingface.co/diffusers/controlnet-canny-sdxl-1.0
- TheMistoAI/MistoLine: https://huggingface.co/TheMistoAI/MistoLine
- Documentacion de diffusers sobre ControlNet: https://huggingface.co/docs/diffusers/using-diffusers/controlnet

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre el modelo, su entrenamiento o evaluaciones independientes.
