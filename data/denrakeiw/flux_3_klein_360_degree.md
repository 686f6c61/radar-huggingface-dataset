# DenRakEiw/Flux_3_klein_360_Degree

## Resumen

Flux 3 Klein 360 Degree es un conjunto de dos adaptadores LoRA acompanados de un flujo de trabajo para ComfyUI, publicado por el usuario DenRakEiw, que permite generar panoramas equirectangulares de 360 grados sin costura visible sobre el modelo de difusion texto-a-imagen Flux 3 Image Klein de Black Forest Labs. No se trata de un modelo completo, sino de pesos de ajuste fino de bajo rango (0,3 GB de repositorio en total) que se cargan encima del checkpoint base `flux3_image_small` o de su variante destilada por pasos `flux3_image_small_sd`.

El problema que resuelve es concreto: los modelos de difusion genericos no producen panoramas equirectangulares coherentes en el borde de envoltura, es decir, la union entre el extremo izquierdo y el derecho de la imagen queda visible cuando la panoramica se proyecta en una esfera. El autor separa la solucion en dos piezas: `360_f3.safetensors`, que induce la geometria de panorama mediante el disparador `create a 360 hdr`, y `F_3_seamfix.safetensors`, que repara la costura mediante el disparador `seamfix` en una pasada secundaria.

La relevancia actual del proyecto es de nicho pero clara: la salida es una imagen equirectangular estandar, lista para visores de 360 grados, motores de renderizado o mapas de entorno (HDRI). El repositorio incluye el fichero `F3_Klein_360_VR.json` con el grafo de ComfyUI que orquesta ambas pasadas. No se han publicado idiomas soportados, resultados de benchmarks ni datos de entrenamiento. El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (bajo rango) sobre un modelo de difusion texto-a-imagen; modelo base Flux 3 Image Klein |
| Parametros totales | No disponible (dos ficheros LoRA; repositorio de 0,3 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para los LoRA; la model card indica que las variantes cuantizadas del modelo base tambien funcionan |
| Idiomas soportados | No disponible |
| Licencia | flux-kommunity-license (etiquetada como `license: other`) |
| Formato de pesos | safetensors (`360_f3.safetensors` y `F_3_seamfix.safetensors`) |

Otros datos de interes: pipeline `text-to-image`, disparadores `create a 360 hdr` (panorama) y `seamfix` (reparacion de costura), requisito de ComfyUI 0.41.2 o superior y ratio de aspecto obligatorio de 2:1.

## Arquitectura y entrenamiento

El proyecto no es un modelo autonomo sino dos adaptadores de bajo rango (LoRA) que se aplican sobre Flux 3 Image Klein, un modelo de difusion texto-a-imagen de Black Forest Labs cuyo checkpoint pequeno se distribuye como `flux3_image_small.safetensors`, con variante destilada por pasos `flux3_image_small_sd.safetensors`. No se ha publicado informacion sobre el dataset de entrenamiento, el numero de tokens o imagenes empleadas, el numero de pasos de entrenamiento, el rango de los adaptadores ni si se utilizaron tecnicas de refuerzo o preferencias.

La innovacion tecnica destacable no esta en el entrenamiento sino en el procedimiento de inferencia en dos pasadas descrito en la model card. La primera pasada genera la panoramica con el LoRA `360_f3`. La segunda corrige la costura en cuatro pasos: se recorta una banda de anchura W/4 de cada extremo; se colocan ambas tiras una junto a otra sobre un lienzo cuadrado, de modo que la costura queda centrada; se cubre el cuarto central con una barra blanca y se deja que el LoRA `seamfix` lo repinte; y finalmente se corta el lienzo reparado por la mitad y se fusionan ambas mitades de vuelta en `x = 0` y `x = 3W/4`. La fusion debe hacerse con mascara con difuminado (pluma) en lugar de un pegado duro: 64 px de pluma a 4096 px de anchura eliminan el ultimo borde visible, y el valor escala proporcionalmente con la resolucion.

El flujo de trabajo completo se distribuye como grafo de ComfyUI (`F3_Klein_360_VR.json`) e incluye una pasada opcional de mejora con DLSS que puede eliminarse si no se tiene instalado el nodo correspondiente.

## Capacidades

- Generacion de imagenes texto-a-imagen con proyeccion equirectangular de 360 grados, apta para visualizacion en esferas y visores de realidad virtual.
- Generacion de mapas de entorno (HDRI) utilizables como iluminacion de escena en motores de renderizado 3D.
- Reparacion automatica de la costura de envoltura mediante un segundo LoRA y una pasada de inpaint sobre el cuarto central de un lienzo cuadrado.
- Control de resolucion con salida nativa en ratio 2:1; el autor reporta 2048x1024 como tamano comodo y 4096x2048 como viable con VRAM suficiente.
- Compatibilidad con checkpoints base y con variantes destiladas por pasos mediante ajuste de pasos y CFG (aproximadamente 16 pasos y CFG 1 en la variante destilada).
- Integracion con ComfyUI 0.41.2 o superior mediante los cargadores especificos: tipo `flux3` en CLIPLoader y VAE `flux2-vae.safetensors`.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni capacidades multilingues, ya que se trata de un adaptador de generacion de imagen.

## Casos de uso

- Generacion de HDRI para iluminacion en renderizado 3D: la salida equirectangular se carga directamente como mapa de entorno en Blender, Unreal Engine o Unity, aportando iluminacion y reflejos coherentes en los 360 grados sin costuras visibles que delaten la union.
- Escenarios de realidad virtual y video 360: la imagen resultante se reproduce en visores WebXR o YouTube VR sin la linea vertical que suele aparecer en el punto de envoltura de la esfera.
- Fondos de escena para videojuegos y skies dinamicos: el mapa equirectangular sirve como skybox o fondo de nivel, y la resolucion de 4096x2048 permite un detalle suficiente para planos amplios.
- Previzualizacion arquitectonica y decoracion virtual: generar entornos completos de una estancia o un paisaje para presentaciones inmersivas antes de producir el render final.
- Turismo, inmobiliaria y experiencias de escaparatismo digital: creacion rapida de panoramas de destino o de interior que el cliente recorre en 360 grados desde el navegador.
- Fondos de plato para VFX y composicion: la panoramica sin costura cubre la totalidad del encuadre de una camara virtual, evitando retoques manuales de la union en postproduccion.
- Simulacion y entrenamiento perceptivo: entornos envolventes sinteticos para entrenar o probar sistemas de percepcion, con control de la iluminacion global a traves del propio HDRI.
- Prototipado rapido en ComfyUI: el flujo incluye ambas pasadas y puede ampliarse con la pasada DLSS opcional, de modo que un artista tecnico puede encadenar variaciones de prompt y resolucion sin salir del grafo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, SSIM sobre la costura, tiempo de inferencia medido) ni comparaciones numericas con otros adaptadores de panorama.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; queda dominada por el checkpoint base de Flux 3 Image Klein, no por los LoRA, cuyo repositorio conjunto ocupa 0,3 GB.
- El autor indica que 2048x1024 es una resolucion comoda y que 4096x2048 funciona si se dispone de VRAM suficiente, sin especificar la cantidad.
- GPU recomendadas: no disponibles. La model card no menciona modelos concretos de GPU (A100, H100, RTX 4090 u otros).
- Encaje en GPU de consumo: no confirmado por el autor; depende del checkpoint base elegido y de su cuantizacion.
- Opciones de despliegue: ComfyUI 0.41.2 o superior. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de adaptador sobre un modelo de difusion.
- Modelo de difusion necesario: `flux3_image_small.safetensors` (base) o `flux3_image_small_sd.safetensors` (destilado por pasos); tambien funcionan las variantes cuantizadas.
- Codificador de texto: `qwen3vl_4b_bf16.safetensors`, cargado con CLIPLoader de tipo `flux3`.
- VAE requerido: `flux2-vae.safetensors`, no el `ae.safetensors` nativo de BFL.
- Latencia y throughput estimados: no disponibles.
- Ajustes de referencia de la model card: pasada base a 4096x2048, 30 pasos, CFG 4.0, sampler `er_sde` y scheduler `simple`; pasada de costura a 2048x2048 con los mismos pasos, CFG, sampler y scheduler.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto o ratio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flux 3 Klein 360 Degree (DenRakEiw) | Dos LoRA + flujo ComfyUI para panorama equirectangular | Flux 3 Image Klein | Ratio 2:1 obligatorio; 2048x1024 y 4096x2048 documentados | flux-kommunity-license | Repositorio de HuggingFace, 0 descargas |
| Flux 3 Image Klein sin adaptadores | Modelo de difusion texto-a-imagen completo | No aplica | No disponible | flux-kommunity-license | Checkpoint publicado por Black Forest Labs |
| 360 Degree Flux (Civitai, autor del mismo proyecto) | Version anterior del mismo concepto | No especificado en la informacion disponible | No disponible | No disponible | Civitai |

No se dispone de datos de rendimiento comparado entre estas opciones ni de otros adaptadores de panorama equirectangular para Flux 3 Klein con los que contrastar. La comparacion se limita, por tanto, a tipo de artefacto, base y licencia.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, sin validacion independiente por parte de la comunidad; conviene tratar los resultados como no verificados.
- No hay informacion publicada sobre el dataset de entrenamiento, los sesgos aprendidos ni la distribucion de escenas con la que se entreno. Es esperable que herede los sesgos del checkpoint base de Flux 3 Image Klein.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar geometria, arquitectura o texto con incoherencias, especialmente en panoramas de gran angular donde las lineas rectas se curvan.
- La reparacion de costura no esta garantizada al 100 %: el propio autor indica que el LoRA de panorama deja la envoltura cerca pero no perfecta, y que el difuminado de 64 px a 4096 px de anchura es necesario para eliminar el ultimo borde visible. A menor resolucion hay que escalar ese valor proporcionalmente.
- El ratio de aspecto debe mantenerse en 2:1; otras proporciones produciran una proyeccion equirectangular incorrecta.
- Dependencia estricta del entorno: ComfyUI 0.41.2 o superior (versiones anteriores fallan con el mensaje "Could not detect model type"), VAE `flux2-vae.safetensors` y CLIPLoader de tipo `flux3`. Cualquier desviacion puede impedir que el flujo funcione.
- La pasada opcional de DLSS requiere un nodo adicional; si no esta instalado, hay que eliminar ese tramo del grafo.
- Licencia: el adaptador se distribuye bajo flux-kommunity-license, con condiciones definidas por Black Forest Labs. Es imprescindible revisar el texto completo antes de cualquier uso comercial, ya que la ficha no reproduce sus terminos y la etiqueta de HuggingFace figura como `license: other`.
- No se documentan idiomas soportados ni capacidades de prompt multilingue; los disparadores de la model card estan en ingles (`create a 360 hdr`, `seamfix`).
- El autor no publica cifras de VRAM minima ni de latencia, por lo que el dimensionamiento de produccion requiere pruebas propias.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DenRakEiw/Flux_3_klein_360_Degree
- Modelo base en HuggingFace: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Texto de la licencia: https://huggingface.co/black-forest-labs/flux-3-image-klein/blob/main/LICENSE.md
- Version anterior del proyecto en Civitai: https://civitai.com/models/682349/360-degree-flux
- Flujo de trabajo incluido en el repositorio: `F3_Klein_360_VR.json`
- Pesos del adaptador de panorama: `360_f3.safetensors`
- Pesos del adaptador de reparacion de costura: `F_3_seamfix.safetensors`
