# kartashovt/KRForge

## Resumen

KRForge no es un modelo de IA, sino una distribucion portable (build) de Stable Diffusion WebUI Forge Neo orientada a visualizacion arquitectonica de exteriores. La publica el usuario kartashovt en un repositorio de 6,3 GB que contiene el instalador `Install_KRForge.bat`, un entorno Python portatil (`sys.tar.lz4`), Forge Neo con ajustes y extensiones (`sdw.tar.lz4`, sin modelos), los scripts de instalacion y parcheo, y un `model-manager.json` con la lista de checkpoints descargables. No incluye pesos de red neuronal: los modelos se descargan de sus autores originales en la primera instalacion o desde la pestana Model Manager.

El problema que resuelve es de despliegue, no de modelado: empaqueta en un unico instalador de Windows el entorno de inferencia, las extensiones y una seleccion curada de checkpoints (Dark Beast BlitZ ZiT, Z-Image Turbo, ControlNet 1.1 SD1.5, IP-Adapter, LoRAs de detalle y upscalers 4x) para generar y retocar imagenes de fachadas, volumetrias y entorno urbano. Es relevante para estudios pequenos que quieren un entorno reproducible sin montar dependencias a mano, pero conviene evaluarlo como software: no hay arquitectura, parametros ni contexto que analizar, y su licencia AGPL-3.0 junto con las licencias individuales de cada checkpoint condicionan el uso comercial.

El repositorio se creo y actualizo el 24 de octubre de 2026, con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad registrada en HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica: distribucion de software (frontend de inferencia para modelos de difusion), no un checkpoint |
| Parametros totales | no disponible: el repositorio no contiene pesos de modelo |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un pack de diffusion; el contexto lo define el modelo de texto de cada checkpoint, por ejemplo el text encoder Qwen3 4B de Z-Image Turbo) |
| Tipos de cuantizacion | el Model Manager ofrece Dark Beast en BF16 y FP8; ControlNet 1.1 se distribuye en fp16; no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 para el build (Forge Neo); cada modelo descargado conserva su propia licencia |
| Formato de pesos | no incluidos en el repositorio; se descargan de los autores (por ejemplo `comfyanonymous/ControlNet-v1-1_fp16_safetensors`) |
| Tamano del repositorio | 6,3 GB (entorno Python, Forge Neo y utilidades; sin modelos) |
| Pipeline declarado en HuggingFace | no disponible |
| Fecha de creacion / ultima actualizacion | 2026-10-24 / 2026-10-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El contenido tecnico es Forge Neo, un fork de la interfaz web de Stable Diffusion que actua como frontal de inferencia: gestiona la carga de checkpoints, schedulers, pipelines de img2img e inpainting, y extensiones como ControlNet o IP-Adapter. Sobre esa base, el autor anade un Model Manager, scripts de arranque (`cs_1_lite.bat` para interfaz simple, `cs_2_full.bat` para interfaz completa) y un mecanismo de actualizacion (`sdw\._INSTALL_LAST_PATCH.bat`). El codigo fuente completo, con historial git, viaja dentro de `sdw.tar.lz4`, lo que es coherente con la exigencia de la AGPL-3.0.

No hay entrenamiento propio ni datos de entrenamiento, RLHF o DPO que reportar. Los modelos referenciados son de terceros: Dark Beast BlitZ ZiT (REDCraft, autor AiMetatron, Apache-2.0), Z-Image Turbo con text encoder Qwen3 4B y VAE (Comfy-Org, original de Tongyi-MAI, Apache-2.0), epiCPhotoGasm Last Unicorn, ControlNet 1.1 SD1.5 (canny, depth, inpaint, lineart, tile), IP-Adapter SD1.5 plus, los upscalers 4x-UltraSharp y 4x NMKD-Siax 200k, y las LoRAs Advanced Enhancer y Detail Slider v4. Forge descarga ademas automaticamente preprocesadores de ControlNet, CLIP-ViT-H y BLIP en el primer uso. La unica innovacion atribuible al paquete es de empaquetado: entorno Python portatil, seleccion de modelos con licencias anotadas y dos archivos alojados en `models/files/` (Depth Anything ControlNet y Realistic Snapshot ZIT v5) que no tienen descarga directa desde sus autores.

## Capacidades

- Generacion de imagen texto-a-imagen mediante los checkpoints de difusion que descarga el Model Manager (Dark Beast, Z-Image Turbo, epiCPhotoGasm).
- Control estructural de la composicion con ControlNet 1.1 SD1.5 en cinco modos: canny, depth, inpaint, lineart y tile.
- Guiado por imagen de referencia con IP-Adapter SD1.5 plus, util para trasladar materiales o estilo de una fotografia al render.
- Inpainting y retoque localizado de zonas de la imagen.
- Escalado x4 con 4x-UltraSharp y 4x NMKD-Siax 200k, y preprocesado de profundidad con Depth Anything ControlNet.
- Ajuste fino del resultado con LoRAs de detalle (Advanced Enhancer, Detail Slider v4 con control tipo slider).
- Gestion de modelos desde la pestana Model Manager, con eleccion de variante BF16 o FP8.
- Dos interfaces de uso: simple (`cs_1_lite.bat`) y completa (`cs_2_full.bat`), mas actualizacion por parche.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades de audio. El soporte multilingue de prompts no esta documentado.

## Casos de uso

- Iteracion de fachadas en fase de diseno: partiendo de un render base de SketchUp, Revit o Rhino, usar img2img con ControlNet depth o lineart para conservar la geometria y explorar acabados, huecos y ritmos de ventana sin remodelar el modelo 3D.
- Inpainting de entorno urbano: sustituir vegetacion, mobiliario, senalizacion o personas en una vista exterior manteniendo la perspectiva, gracias al modo inpaint de ControlNet 1.1.
- Variaciones de materialidad con IP-Adapter: tomar una fotografia de referencia de la fabrica ceramica, el hormigon o la carpinteria y transferir su aspecto al render, util para presentaciones a cliente con varias alternativas en una misma sesion.
- Escalado de laminas y paneles: aplicar 4x-UltraSharp o 4x NMKD-Siax 200k a renders de 1024 px para imprimir en formato A2 o A1, con el refuerzo de las LoRAs de detalle para evitar superficies planas.
- Estudios de iluminacion: generar la misma vista a distintas horas y condiciones meteorologicas variando solo el prompt, manteniendo la composicion fija mediante ControlNet.
- Estandarizacion del puesto de trabajo en un estudio: instalacion portable en una ruta sin espacios, sin dependencias externas de Python, para que varios tecnicos trabajen con la misma version de Forge, los mismos ajustes y la misma lista de modelos.
- Pruebas de concepto rapidas en equipos con Windows: el instalador y los scripts `.bat` reducen el tiempo de puesta en marcha, aunque el rendimiento dependera del checkpoint y de la GPU, datos no publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un paquete de software sin pesos propios, no existe una metrica de calidad del modelo que medir; el rendimiento dependera de los checkpoints descargados y del hardware. Tampoco se documentan tiempos de inferencia ni throughput.

## Requisitos de hardware

- VRAM: no disponible en la informacion proporcionada. El repositorio ocupa 6,3 GB en disco, pero no incluye pesos; el consumo lo determina el checkpoint elegido (Dark Beast o Z-Image Turbo, en BF16 o FP8, y SD1.5 para ControlNet e IP-Adapter).
- GPU recomendadas: no disponibles. La model card no indica modelos de GPU ni minimos de memoria.
- Compatibilidad con GPU de consumo: no confirmada en la documentacion; depende del checkpoint y de la cuantizacion, no del pack.
- Plataforma: Windows, a juzgar por los scripts `.bat` y la ruta de ejemplo `C:\KRForge`. No se mencionan instaladores para Linux ni macOS.
- Despliegue: no usa vLLM, llama.cpp, Ollama ni TGI. Se arranca con `cs_1_lite.bat` o `cs_2_full.bat` y se actualiza con `sdw\._INSTALL_LAST_PATCH.bat`.
- Almacenamiento: prever espacio adicional para el entorno (6,3 GB) mas los checkpoints, text encoders, VAE, ControlNet, upscalers y LoRAs que se descarguen aparte.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Solucion | Tipo | Modelos incluidos | Interfaz | Licencia | Plataforma documentada |
|---|---|---|---|---|---|
| KRForge | Build portable de Forge Neo con Model Manager | No incluye pesos; los descarga de sus autores | Web UI simple y completa | AGPL-3.0 (build); licencias de terceros para cada modelo | Windows (scripts `.bat`) |
| Forge Neo (Haoming02/sd-webui-forge-classic) | Frontend de inferencia | No | Web UI | AGPL-3.0 | Multiplataforma segun el proyecto original; no detallado aqui |
| ComfyUI | Frontend de inferencia por grafos de nodos | No | Editor de nodos | Consultar el repositorio del proyecto | Multiplataforma; no detallado aqui |
| AUTOMATIC1111 Stable Diffusion WebUI | Frontend de inferencia | No | Web UI | Consultar el repositorio del proyecto | Multiplataforma; no detallado aqui |

La comparacion en parametros, contexto y benchmarks no aplica: ninguna de las alternativas es un modelo con pesos propios, y la informacion disponible no incluye metricas de calidad ni de rendimiento para KRForge.

## Limitaciones y advertencias

- No es un modelo: no debe citarse con parametros, contexto o benchmarks como si lo fuera; cualquier evaluacion de calidad debe hacerse sobre los checkpoints que descarga.
- Licencia AGPL-3.0 sobre el build: su distribucion o exposicion como servicio en red activa las obligaciones de liberar el codigo fuente correspondiente. Requiere revision legal antes de uso comercial.
- Licencias heterogeneas de los modelos: 4x-UltraSharp es CC BY-NC-SA 4.0 (no comercial), ControlNet 1.1 se asocia a OpenRAIL, y varios modelos de Civitai (epiCPhotoGasm, Advanced Enhancer, Detail Slider v4) remiten a condiciones propias que hay que verificar antes de un uso profesional.
- Riesgo de cadena de suministro: el instalador ejecuta binarios y un entorno Python empaquetado (`soft.zip`, `sys.tar.lz4`) sin firmas ni verificacion de integridad documentada; conviene auditar el contenido antes de desplegarlo en una red corporativa.
- Dos archivos se alojan en `models/files/`: el autor afirma que la redistribucion de Realistic Snapshot ZIT v5 esta permitida, pero no se aporta la autorizacion por escrito; el resto de casos depende de la licencia de cada autor.
- Sin validacion comunitaria: 0 descargas y 0 likes, repositorio creado y actualizado el mismo dia, sin issues ni discusion publica registrada.
- Sesgos y alucinacion visual: los sesgos heredados de los checkpoints (tipologias de vivienda, contexto urbano, representacion de personas) no estan documentados; la generacion puede producir geometrias fisicamente imposibles o detalles incoherentes en ventanas, barandillas y texturas, por lo que requiere revision tecnica.
- Ambito reducido: el paquete esta orientado a visualizacion arquitectonica de exteriores; no cubre texto, codigo, agentes ni otras modalidades.
- Actualizaciones por parche: `_INSTALL_LAST_PATCH.bat` puede modificar el comportamiento del entorno sin control de versiones visible para el usuario final.
- Idiomas de los prompts no documentados; la model card esta integramente en ingles.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kartashovt/KRForge
- Forge Neo (base del build, AGPL-3.0): https://github.com/Haoming02/sd-webui-forge-classic
- Dark Beast BlitZ ZiT: https://huggingface.co/GuangyuanSD/REDCraft-DarkBeast-Z-Image-TURBO
- Z-Image Turbo (incluye text encoder Qwen3 4B y VAE): https://huggingface.co/Comfy-Org/z_image_turbo
- epiCPhotoGasm Last Unicorn: https://civitai.com/models/132632
- ControlNet 1.1 SD1.5 fp16 safetensors: https://huggingface.co/comfyanonymous/ControlNet-v1-1_fp16_safetensors
- IP-Adapter SD1.5 plus (sd_control_collection): https://huggingface.co/lllyasviel/sd_control_collection
- 4x-UltraSharp: https://huggingface.co/Kim2091/UltraSharp
- 4x NMKD-Siax 200k: https://huggingface.co/gemasai/4x_NMKD-Siax_200k
- Advanced Enhancer LoRA: https://civitai.com/models/106717
- Detail Slider LoRA v4: https://civitai.com/models/153562
- Depth Anything: https://github.com/LiheYoung/Depth-Anything
- Realistic Snapshot ZIT v5: https://civitai.com/models/2268008

Nota: la busqueda web realizada no devolvio enlaces relevantes sobre KRForge; los resultados obtenidos (MeshGPT, image-to-3d.ai, CivArchive, TokForge, ModelForest) corresponden a productos distintos y no se incluyen.
