# rootlocalghost/flux-3-image-klein-comfy

## Resumen

FLUX 3 Image Klein es un modelo de difusión de pesos abiertos de 5,6B parámetros (solo el transformer de imagen) desarrollado por Black Forest Labs para generación de imágenes a partir de texto y edición de imágenes guiada por instrucciones. El repositorio aquí descrito, `rootlocalghost/flux-3-image-klein-comfy`, no es el lanzamiento original: es un reempaquetado de terceros de los checkpoints oficiales (Klein destilado, Klein Base sin destilar y el prompt upsampler) en ficheros únicos `safetensors` listos para cargar en ComfyUI, en precisiones BF16, int8 y NVFP4.

El modelo unifica tres tareas en un mismo conjunto de pesos: texto-a-imagen, edición con una imagen de referencia y composición con múltiples referencias (hasta 10 imágenes de entrada), devolviendo siempre una única imagen. Incorpora control de disposición mediante cajas delimitadoras expresadas en el prompt sobre una rejilla de 0 a 1000, lo que permite colocar, recolorear, mover, sustituir o eliminar elementos, y añade renderizado de texto dentro de la imagen generada. Usa Qwen3-VL-4B-Instruct como codificador de texto, que es un componente separado de los 5,6B del transformer.

Su relevancia actual es doble: por un lado, es la variante compacta y autoalojable de la familia FLUX 3 (frente al FLUX 3 Image mayor, que solo se sirve por API a través del nodo Partner de ComfyUI); por otro, el reempaquetado incluye cuantizaciones int8 que el autor declara ejecutables en GPUs de 8 GB como la RTX 3070, y NVFP4 para GPUs Blackwell. La licencia FLUX Kommunity permite uso no comercial y una excepción de salida comercial para usuarios que cumplan los términos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión con transformer de imagen (los ficheros se denominan `diffusion_models`; la model card no detalla la arquitectura interna) más codificador de texto y autoencoder separados |
| Parametros totales | 5,6B en el transformer de imagen; el codificador de texto (Qwen3-VL-4B-Instruct) y el prompt upsampler (Qwen3.5-9B) son componentes aparte |
| Longitud de contexto | No aplica (modelo de imagen); acepta una caption de escena completa y hasta 10 imágenes de referencia |
| Tipos de cuantizacion | Transformer: BF16, int8 (`convrot`), NVFP4. Codificador de texto: BF16, int8. Prompt upsampler: BF16, int8, w4a8. Autoencoder: BF16 |
| Idiomas soportados | Inglés (`language: en`); los prompts y captions deben ir en inglés |
| Licencia | FLUX Kommunity License (`flux-kommunity-license`); permite uso no comercial y ofrece una excepción de salida comercial para «Qualifying Users» sujeta a los términos |
| Formato de pesos | `safetensors` (ficheros únicos para ComfyUI, librería `diffusion-single-file`) |
| Tamano del repositorio | 93,7 GB (incluye todas las variantes) |
| Text encoder | Qwen3-VL-4B-Instruct: BF16 (8,9 GB), int8 (4,9 GB) |
| Prompt upsampler | `qwen3.5_9b_flux3_prompt_upsampler`: BF16 (18,8 GB), int8 (9,8 GB), w4a8 (6,7 GB) |
| Autoencoder | `flux2-vae.safetensors` (0,3 GB) |
| Transformer destilado (Klein) | BF16 11,1 GB; int8 5,8 GB; NVFP4 5,3 GB |
| Transformer sin destilar (Klein Base) | BF16 11,1 GB; int8 5,8 GB; NVFP4 5,3 GB |
| Pasos de muestreo | Klein destilado: 16 pasos, sin guidance. Klein Base: 50 pasos, guidance 3,5 |
| Resolucion de salida | No disponible |

## Arquitectura y entrenamiento

La información disponible describe el modelo como un transformer de imagen de 5,6B parámetros (etiqueta que, según la propia model card, se refiere únicamente al transformer y excluye el codificador de texto). El sistema completo se compone de tres piezas: el transformer de difusión, un codificador de texto Qwen3-VL-4B-Instruct que procesa la caption y las imágenes de referencia, y un autoencoder (`flux2-vae`) que convierte entre espacio latente y píxeles. No se detalla en la documentación proporcionada el tipo de atención, la profundidad de la red ni el esquema de compresión latente.

Black Forest Labs indica que Klein se beneficia de aprendizaje compartido con el resto de la familia FLUX 3 (imágenes, vídeo y audio) y conserva las capacidades de control del FLUX 3 Image mayor, incluidas las cajas delimitadoras. Existen dos checkpoints: Klein Base, sin destilar, en BF16, pensado para fine-tuning, entrenamiento de LoRA e investigación (50 pasos, guidance 3,5); y Klein, destilado por pasos, pensado para generación y edición en autoalojamiento y descrito como el checkpoint que hay detrás de la API de BFL (16 pasos, sin guidance). La documentación de ComfyUI menciona además ejecuciones del variante destilado en el rango de 4 a 16 pasos. No se han facilitado datos sobre volumen de tokens de entrenamiento, composición del dataset ni sobre si se emplearon RLHF o DPO.

Una innovación operativa destacable es la obligatoriedad del prompt upsampler: el modelo espera captions de escena completas y, con un prompt corto tal cual, produce resultados genéricos. El repositorio incluye un upsampler basado en Qwen3.5-9B, con tres precisiones, que los flujos de trabajo de ComfyUI cargan por defecto; alternativamente puede usarse cualquier LLM con el system prompt publicado en `system_prompts.json`. El control por cajas usa una rejilla de 0 a 1000 y guía posición y escala, sin imponer una máscara dura sobre los píxeles.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con captions de escena completas en inglés.
- Edición con una imagen de referencia (single-reference editing) mediante instrucciones en lenguaje natural.
- Composición con múltiples referencias: acepta hasta 10 imágenes de entrada y devuelve una sola imagen de salida.
- Control espacial mediante cajas delimitadoras en el prompt (rejilla 0-1000): colocar, recolorear, mover, sustituir o eliminar elementos; las cajas guían colocación y escala, no son máscaras rígidas.
- Renderizado de texto legible dentro de la imagen generada.
- Dos regímenes de inferencia: destilado (16 pasos, sin guidance) para producción y Base (50 pasos, guidance 3,5) para ajuste fino e investigación.
- Ampliación automática de prompts mediante el upsampler incluido o cualquier LLM externo con el system prompt oficial.
- No se documenta soporte de tool calling, function calling, agentes ni multimodalidad de audio o vídeo en la información disponible (las imágenes de entrada se usan como referencia visual, no como canal conversacional).

## Casos de uso

- **Edición de fotografía de producto en catálogo:** partiendo de una imagen de referencia del artículo, el modelo permite recolorear acabados, cambiar el fondo o sustituir elementos mediante una instrucción textual, sin necesidad de retocar manualmente cada variante. El modo de referencia única está pensado exactamente para este flujo.
- **Composición de escenas de marketing con varios activos:** al admitir hasta 10 imágenes de referencia, se pueden combinar producto, modelo, entorno y logotipo en una sola generación, lo que reduce el número de iteraciones frente a pipelines que recomponen por capas.
- **Maquetación y publicidad con control de layout:** las cajas en rejilla 0-1000 permiten fijar la disposición de titulares, producto y elementos secundarios en un banner o cartel, y después mover o sustituir cada bloque mediante prompt. Es adecuado para generar variantes A/B de una misma plantilla.
- **Generación de carteles y mockups con texto integrado:** el renderizado de texto dentro de la imagen sirve para pruebas de concepto de etiquetado, packaging o señalética, siempre con revisión humana de la tipografía final.
- **Ajuste fino de estilo de marca:** Klein Base, sin destilar y con 50 pasos y guidance 3,5, está declarado para entrenamiento de LoRA y fine-tuning, de modo que un equipo puede adaptar el modelo a una identidad visual concreta y luego servir la variante destilada a 16 pasos.
- **Prototipado local en estaciones de trabajo modestas:** con los ficheros int8 (5,8 GB de transformer y 4,9 GB de codificador de texto), el autor indica que el modelo funciona en GPUs de 8 GB como la RTX 3070 y en tarjetas sin soporte FP8 (RTX 30 y anteriores), lo que habilita pruebas en hardware de gama media.
- **Investigación en modelos de difusión:** la disponibilidad de checkpoints destilado y sin destilar, con y sin cuantizar, permite ablaciones sobre pasos de muestreo, guidance y efectos de cuantización manteniendo el resto del pipeline constante.
- **Previsualización rápida en producción de contenidos:** ejecuciones de 4 a 16 pasos según la documentación de ComfyUI permiten generar borradores para revisión editorial antes de un render final de mayor coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y las fuentes consultadas no incluyen métricas cuantitativas (FID, CLIP score, GenEval, DPGBench ni comparativas numéricas); la página de NVIDIA NIM califica el modelo como «state-of-the-art» sin aportar cifras.

## Requisitos de hardware

- **Peso en disco por configuración (solo pesos):** destilado BF16 + codificador BF16 + VAE = 20,3 GB; añadiendo el upsampler BF16 (18,8 GB) se llega a unos 39,1 GB si se mantienen todos cargados. Configuración int8: 5,8 + 4,9 + 0,3 = 11,0 GB, y hasta unos 20,8 GB con el upsampler int8. Configuración NVFP4: 5,3 GB de transformer más el codificador int8 y el VAE, en torno a 10,5 GB. Hay que sumar activaciones y latentes, no cuantificados en la documentación.
- **Repositorio completo:** 93,7 GB, ya que incluye las seis variantes del transformer, las cinco del codificador/upsampler y el VAE.
- **GPU con soporte FP8 o superior:** recomendables para los ficheros BF16 e int8 en configuraciones cómodas; la model card cita explícitamente la RTX 3070 (8 GB) como objetivo de los ficheros int8.
- **GPUs Blackwell:** necesarias para los ficheros NVFP4; no funcionan en generaciones anteriores.
- **GPUs sin FP8 (RTX 30 y anteriores):** deben usar las variantes int8 `convrot`, que el autor indica como compatibles.
- **Despliegue:** ComfyUI es el destino explícito del reempaquetado (carpetas `models/diffusion_models`, `models/text_encoders`, `models/vae`). Alternativa gestionada: NVIDIA NIM. No se documentan en la información disponible rutas de despliegue con vLLM, TGI, llama.cpp, Ollama ni Diffusers para este modelo.
- **Latencia y throughput:** no disponibles. El número de pasos (16 en destilado, 50 en Base, 4-16 según ComfyUI) es el único parámetro de coste publicado; no hay tiempos por imagen ni imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos / guidance | Contexto de referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX 3 Image Klein (destilado, este repo) | 5,6B (transformer) | 16 pasos, sin guidance | Hasta 10 imágenes de referencia, cajas 0-1000 | FLUX Kommunity (no comercial + excepción comercial para Qualifying Users) | Pesos abiertos en Hugging Face, reempaquetado para ComfyUI y NIM |
| FLUX 3 Image Klein Base | 5,6B (transformer) | 50 pasos, guidance 3,5 | Igual que el destilado | FLUX Kommunity | Pesos abiertos; orientado a fine-tuning, LoRA e investigación |
| FLUX 3 Image (modelo mayor) | No disponible | No disponible | Conserva las funciones de control del modelo abierto, cajas incluidas | No disponible | Solo API alojada de Black Forest Labs, vía nodo Partner de ComfyUI |
| Otros modelos abiertos de imagen de tamaño comparable | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

La comparación cuantitativa con alternativas de la misma categoría no es posible con los datos disponibles: no hay benchmarks publicados ni especificaciones de modelos competidores en las fuentes consultadas.

## Limitaciones y advertencias

- **Uso sin upsampler degrada la calidad:** la propia model card advierte de que no debe usarse el modelo sin un ampliador de prompt; con una instrucción corta tal cual, la salida es genérica. El upsampler añade entre 6,7 y 18,8 GB adicionales según precisión.
- **Idioma:** el modelo está etiquetado únicamente para inglés (`language: en`); no se documenta soporte de castellano ni de otros idiomas, ni en prompts ni en el texto renderizado dentro de la imagen.
- **Las cajas no son máscaras:** guían posición y escala, pero no restringen los píxeles a una región dura, por lo que no deben tratarse como control de segmentación estricto.
- **Licencia restrictiva para producción:** la FLUX Kommunity License permite uso no comercial y una excepción de salida comercial solo para «Qualifying Users» conforme a sus términos; es imprescindible revisar `LICENSE.md` antes de un despliegue comercial.
- **Procedencia del repositorio:** se trata de un reempaquetado de terceros (autor `rootlocalghost`, 0 descargas y 0 likes en el momento de la consulta), no de un lanzamiento oficial de Black Forest Labs. Además, el comando de descarga incluido en el README apunta al espacio de nombres `black-forest-labs/flux-3-image-klein-comfy`, distinto del ID de este repositorio, lo que conviene verificar antes de automatizar descargas. Los BF16 del transformer y el autoencoder se declaran idénticos a `model.safetensors` y `ae.safetensors` de los repositorios originales.
- **Riesgo de alucinación visual y de texto:** no se publican métricas de fidelidad ni de precisión en el renderizado de texto; en carteles con texto denso o tipografías concretas es preceptiva la revisión humana.
- **Sesgos:** la model card no incluye un análisis de sesgos demográficos o culturales; solo se menciona que BFL evaluó y mitigó riesgos de CSAM y NCII antes del lanzamiento. La responsabilidad de filtrado y moderación en producción recae en quien despliega.
- **Requisitos de hardware específicos:** NVFP4 exige GPU Blackwell y los ficheros BF16 no son viables en GPUs de gama baja; una configuración mal elegida puede impedir la ejecución o forzar offload con caída de rendimiento.
- **Ausencia de datos de rendimiento:** sin latencias, throughput ni benchmarks, no es posible dimensionar costes de producción a partir de la documentación disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rootlocalghost/flux-3-image-klein-comfy
- Modelo original FLUX 3 Image Klein: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Modelo original FLUX 3 Image Klein Base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Prompt upsampler original: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- System prompts del upsampler: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup/blob/main/system_prompts.json
- Código de inferencia y formato de cajas: https://github.com/black-forest-labs/flux-3-image-klein
- ComfyUI (repositorio): https://github.com/comfyanonymous/ComfyUI
- Tutorial de ComfyUI para FLUX 3 Klein: https://docs.comfy.org/tutorials/flux/flux-3-klein
- Página de lanzamiento en Comfy: https://comfy.org/flux-3-image-klein
- Artículo del blog de Comfy: https://blog.comfy.org/p/flux-3-image-klein-in-comfyui-56b
- FLUX 3 Image Klein en NVIDIA NIM: https://build.nvidia.com/black-forest-labs/flux-3-image-klein
