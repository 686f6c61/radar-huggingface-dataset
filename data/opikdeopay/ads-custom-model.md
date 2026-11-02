# opikdeopay/ads-custom-model

## Resumen

`opikdeopay/ads-custom-model` no es un modelo de lenguaje generativo al uso, sino un repositorio agregador de pesos para el ecosistema **ADS Forge**, un conjunto de herramientas construido sobre ComfyUI (local y RunPod Cloud Worker). El repositorio empaqueta LoRAs, modelos de difusion, text encoders, VAE, ControlNet, adaptadores y utilidades de vision organizados en una estructura de directorios 1:1 con la carpeta `models/` de ComfyUI, de modo que el usuario puede descargar los pesos directamente a las rutas correctas.

Los tags declarados apuntan a un pipeline de generacion de video e imagen: `minimax-h3`, `ltx-video`, `krea2`, `video-generation` y `text-to-image`. La model card esta redactada en indonesio y describe las categorias de ficheros incluidos (25 LoRAs de aproximadamente 26,8 GB, 4 modelos base de aproximadamente 95,2 GB, 5 text encoders de aproximadamente 62,8 GB, 8 VAE y upscalers de aproximadamente 7,8 GB y utilidades varias). El repositorio declara `pipeline: text-to-image` en HuggingFace, aunque el contenido real cubre tanto imagen como video.

Es relevante ahora porque centraliza en un unico punto los pesos necesarios para reproducir un stack de generacion visual con ComfyUI, algo habitual en flujos de produccion de contenido audiovisual. Conviene senalar que el tamano del repo aparece como 0.0 GB y las descargas y likes son 0, lo que sugiere que los pesos podrian no estar realmente alojados o que el repositorio es de reciente creacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio agregador de pesos de difusion, VAE, text encoders y LoRAs para ComfyUI; no es un unico modelo) |
| Parametros totales | no disponible (depende de cada componente; se citan text encoders como Gemma 4 12B, Qwen3-VL 32B, Qwen3-VL 4B y Qwen 3 0.6B) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8, bf16, nvfp4 awq (segun los ficheros descritos en la model card) |
| Idiomas soportados | no disponible |
| Licencia | creativeml-openrail-m |
| Formato de pesos | no disponible de forma explicita (se infiere safetensors por el ecosistema ComfyUI, pero no se confirma) |

## Arquitectura y entrenamiento

El repositorio no documenta el entrenamiento de un modelo concreto, sino que agrupa artefactos de terceros. Segun la model card, incluye modelos de difusion base como **MiniMax-H3 Singularity ref2va v2 int8**, **MiniMax-H3 Hybrid Uncensored int8**, **MiniMax-H3 Ref2VA pruned int8** y **Krea2 Turbo bf16**, ademas de LoRAs especificas para MiniMax H3 (DMAD 4/8-step, ELM Longlive, FL2VA-Acc, Ref2VA-Acc, sliders de movimiento y aceleracion, rough sketch, digital art) y para LTX-2.5 y LTX-2.3 (distilled 450, IC-LoRA Ingredients, refine details, colorization, deblur, decompression, pixel spatial upscaler, motion track, anime style).

La parte de text encoders incluye **Gemma 4 12B con proyeccion LTX-2.5** (bf16 e int8), **Qwen3-VL 32B MiniMax H3 en nvfp4 awq**, **Qwen3-VL 4B bf16** y **Qwen 3 0.6B Base**. Tambien se incluyen VAE de video y audio para LTX-2.5 y MiniMax H3, un VAE de Qwen Image y latent upscalers. No se aportan datos sobre numero de tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) de los modelos subyacentes; esa informacion deberia consultarse en las fichas originales de cada componente.

## Capacidades

- Generacion de imagen a partir de texto mediante modelos de difusion (pipeline declarado `text-to-image`).
- Generacion de video, segun los tags `video-generation`, `ltx-video` y `minimax-h3`.
- Aplicacion de estilos y control fino mediante LoRAs (aceleracion de pasos, motion sliders, estilos artisticos, refinado de detalles, colorizacion, deblur, upscaling espacial).
- Control estructural con **MiniMax H3 Fun ControlNet Union 2.0**.
- Transferencia de identidad facial con **IP-Adapter FaceID Plus v2** (SDXL/SD15) y **InsightFace Antelopev2**.
- Segmentacion y eliminacion de fondo con **RMBG 2.0 BiRefNet** y **SEEDVR2**.
- Deteccion de caras y manos con **Ultralytics YOLOv8** para tareas de detailer.
- Codificacion de texto multimodal mediante text encoders Qwen3-VL y Gemma 4.
- No se documentan capacidades de tool calling, agentes ni razonamiento de lenguaje natural: el repositorio esta orientado a generacion visual.

## Casos de uso

- Produccion de anuncios y creatividades: el repositorio esta pensado para ADS Forge, un stack de generacion publicitaria; los modelos Krea2 Turbo y las LoRAs de estilo permiten generar variantes de imagen para campanas de forma rapida.
- Generacion de video corto para redes sociales: con MiniMax H3 y LTX-2.5, junto con sus LoRAs de aceleracion (DMAD 4/8-step), se pueden producir clips en pocos pasos de muestreo, reduciendo coste de GPU.
- Iteracion de estilo controlada: las LoRAs de digital art, anime style y rough sketch permiten fijar una direccion visual coherente en una serie de entregables sin reentrenar el modelo base.
- Refinado y postproduccion: las LoRAs de refine details, deblur, decompression y pixel spatial upscaler sirven para mejorar tomas generadas o material de baja calidad antes de publicacion.
- Transferencia de personaje consistente: con IP-Adapter FaceID Plus v2 e InsightFace se puede mantener la identidad de un rostro a lo largo de varias imagenes o fotogramas, util en branding con persona embajadora.
- Flujos de recorte y composicion: RMBG 2.0 BiRefNet y SEEDVR2 permiten aislar sujetos y montarlos sobre fondos generados, un paso habitual en pipelines de e-commerce y catalogo de producto.
- Despliegue en cloud efimero: la estructura 1:1 con `models/` de ComfyUI y los scripts `hf_model_download.py` facilitan aprovisionar un worker en RunPod con los pesos en las rutas correctas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. A partir de los tamanos declarados, los modelos base de difusion (MiniMax H3 int8, Krea2 Turbo bf16) y los text encoders grandes (Qwen3-VL 32B en nvfp4 awq, Gemma 4 12B) exigen configuraciones de gama alta; el conjunto completo (~190 GB de pesos) no cabe en una sola GPU de consumo.
- GPU recomendadas: para los modelos base y text encoders de mayor tamano se requiere hardware profesional (A100, H100, L40S o similares). Para ejecutar solo LoRAs y VAE sobre un modelo base ya cargado, una RTX 4090 o RTX 3090 puede ser suficiente, aunque no se confirma en la informacion.
- Cabe en GPU de consumo: parcialmente; los componentes individuales pequenos (VAE, LoRAs, Qwen 3 0.6B) si, pero el stack completo no.
- Opciones de despliegue: ComfyUI (local y RunPod Cloud Worker) es el entorno objetivo declarado; los scripts de descarga son `tools/hf_model_download.py --filter loras` y `--filter vae`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Aspecto | opikdeopay/ads-custom-model | Repositorio de pesos ComfyUI tipico | Modelo de difusion individual (p. ej. MiniMax H3) |
|---|---|---|---|
| Naturaleza | Agregador de pesos y LoRAs | Agregador de pesos | Modelo con pesos y arquitectura propia |
| Parametros | No disponible (multiples componentes) | Variable | Definido por el modelo |
| Contexto | No aplica | No aplica | No disponible |
| Licencia | creativeml-openrail-m | Variable | Segun el modelo original |
| Disponibilidad | HuggingFace, 0 descargas | HuggingFace | HuggingFace |
| Uso previsto | Pipeline ADS Forge / ComfyUI | ComfyUI | Generacion visual directa |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado propio: es una recopilacion de artefactos de terceros, por lo que la calidad final depende de cada componente y de su ficha original.
- El tamano del repositorio figura como 0.0 GB y las descargas y likes son 0; existe riesgo de que los pesos no esten realmente alojados o de que el repositorio este incompleto.
- La model card esta en indonesio y no documenta sesgos, composicion del dataset ni evaluaciones de seguridad.
- Se incluye un modelo etiquetado como "Uncensored" (MiniMax-H3 Hybrid Uncensored int8), lo que implica riesgos de contenido no filtrado y requiere controles adicionales en produccion.
- La licencia `creativeml-openrail-m` impone restricciones de uso comercial y clausulas de uso aceptable; conviene revisar el texto completo antes de desplegar en un producto.
- No se documentan idiomas soportados ni capacidades de texto/razonamiento; no debe usarse como sustituto de un LLM.
- Riesgo de alucinacion visual (artefactos, incoherencias temporales en video) inherente a los modelos de difusion; no se aportan metricas de fidelidad.
- La ausencia de benchmarks y de documentacion tecnica detallada dificulta evaluar su idoneidad frente a alternativas establecidas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/opikdeopay/ads-custom-model
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales asociados a este repositorio.
