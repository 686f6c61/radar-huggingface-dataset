# Comfy-Org/LongCat-Video-Avatar

## Resumen

LongCat-Video-Avatar es un modelo de difusión para la generación de vídeo con avatar (image-to-video condicionado por audio y por una imagen de referencia), empaquetado por Comfy-Org para su uso directo en ComfyUI. El modelo original es `meituan-longcat/LongCat-Video-Avatar-1.6`, desarrollado por Meituan LongCat, y este repositorio constituye un repackaging en formato de archivo único (`diffusion-single-file`) con pesos ya cuantizados y LoRAs auxiliares listas para cargar en el nodo de difusión de ComfyUI.

El repositorio tiene un tamano de 37,1 GB y distribuye el modelo de difusión en int8 (`longcat-avatar-1.6_int8_convrot.safetensors`), dos LoRAs de rango 128 en bf16 (una DMD y otra OPSD), dos variantes del text encoder umT5-XXL (fp16 e int8) y el VAE `wan_2.1_vae`. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales, y el pipeline declarado es de difusión (no un LLM), por lo que las capacidades se centran en síntesis de vídeo, no en generación de texto.

Es relevante ahora porque elimina la friccion de conversion de pesos para quien trabaja con ComfyUI: en lugar de descargar el repositorio original de Meituan y adaptar formatos, el usuario coloca los archivos en las carpetas `diffusion_models`, `loras`, `text_encoders` y `vae` y ejecuta el workflow. No se dispone de informacion publica sobre arquitectura interna, numero de parametros ni datos de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusion para generacion de video (single-file, formato ComfyUI); arquitectura interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica a modelo de difusion) |
| Tipos de cuantizacion | int8 (modelo de difusion y text encoder), bf16 (LoRAs y text encoder fp16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo original. Por el nombre, el pipeline y los componentes distribuidos, se trata de un modelo de difusion para video condicionado por imagen y audio (avatar animation), construido sobre un text encoder umT5-XXL y un VAE heredado de Wan 2.1 (`wan_2.1_vae.safetensors`). El repositorio incluye dos LoRAs de rango 128 en bf16, identificadas como DMD y OPSD, que en la practica se usan para acelerar o destilar el muestreo del modelo base; no se dispone de detalle sobre su funcion exacta ni sobre hiperparametros de entrenamiento.

No hay informacion publicada en este repositorio sobre volumen de datos de entrenamiento, composicion del dataset, uso de RLHF/DPO (poco probable en un modelo de difusion) ni innovaciones tecnicas mas alla del repackaging. Cualquier dato de arquitectura debe consultarse en el repositorio original `meituan-longcat/LongCat-Video-Avatar-1.6`.

## Capacidades

- Generacion de video con avatar a partir de una imagen de referencia y una pista de audio (image-to-video con condicionamiento de audio), segun la estructura de archivos y el nombre del modelo.
- Integracion nativa en ComfyUI mediante el formato `diffusion-single-file`, con pesos ya cuantizados en int8 para reducir requisitos de VRAM.
- Uso de LoRAs auxiliares (DMD y OPSD, rango 128, bf16) para variantes de muestreo acelerado o destilado.
- Text encoder umT5-XXL disponible en fp16 e int8, lo que permite ajustar precision y memoria segun el hardware.
- No se dispone de informacion sobre soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingues; al ser un modelo de difusion de video, estas capacidades no aplican.
- No se dispone de informacion sobre modos especiales (thinking, vision, audio de entrada/salida) mas alla del condicionamiento por audio implicito en el caso de uso de avatar.

## Casos de uso

- Animacion de avatares para video corporativo: a partir de un retrato y una locucion grabada, generar un video de presentacion con sincronizacion labial, usando el modelo int8 y el VAE Wan 2.1 en un workflow de ComfyUI.
- Creacion de contenido para redes sociales: producir clips de un personaje virtual a partir de una imagen fija y una pista de voz, con la LoRA DMD para reducir pasos de muestreo y acelerar la iteracion.
- Doblaje y localizacion de video: reutilizar una imagen del hablante y una nueva pista de audio en otro idioma para regenerar el video sin volver a rodar, siempre que la calidad del condicionamiento lo permita.
- Prototipado de asistentes virtuales: generar videos de respuesta de un avatar 2D para demos de producto o interfaces conversacionales, aprovechando la integracion directa con ComfyUI.
- Previsualizacion en pipelines de postproduccion: crear previos animados de personajes antes de pasar a produccion 3D, usando los pesos int8 para mantener el coste de VRAM contenido.
- Generacion por lotes en servidor: desplegar el modelo en ComfyUI sobre GPU de datacenter y encolar trabajos de animacion de avatar mediante la API de ComfyUI, con el text encoder int8 para reducir memoria por instancia.
- Educacion y formacion: generar videos de instructores virtuales a partir de material grabado, reutilizando la misma imagen de referencia en multiples lecciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio pesa 37,1 GB e incluye pesos int8 del modelo de difusion, dos LoRAs bf16, dos variantes del text encoder umT5-XXL y el VAE Wan 2.1; el consumo real depende de la resolucion, duracion del clip y numero de pasos, que no se especifican.
- GPU recomendadas: no disponible. Por el tamano del repositorio, se requiere una GPU con al menos 24 GB de VRAM para cargar el modelo int8 junto con el text encoder y el VAE, aunque esta cifra es una estimacion orientativa y no un dato publicado.
- Compatibilidad con GPU de consumo: probable en RTX 4090 (24 GB) y RTX 3090 (24 GB) usando la variante int8 y el text encoder int8; no confirmado por el autor.
- Opciones de despliegue: ComfyUI (formato nativo `diffusion-single-file`), Comfy Cloud (servicio online de ComfyUI) y cualquier entorno que cargue safetensors de difusion compatibles con ComfyUI. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| LongCat-Video-Avatar (este repo) | no disponible | no aplica | MIT | safetensors single-file (int8/bf16) | Hugging Face, ComfyUI |
| meituan-longcat/LongCat-Video-Avatar-1.6 (original) | no disponible | no aplica | no disponible en esta ficha | no disponible | Hugging Face |
| Wan 2.1 (VAE reutilizado) | no disponible | no aplica | no disponible en esta ficha | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al generar avatares a partir de imagenes reales, existe riesgo de sesgos de representacion y de uso indebido (deepfakes), que el usuario debe gestionar.
- Riesgo de alucinacion: no aplica en el sentido de LLM, pero la generacion de video puede producir artefactos, desincronizacion labial o identidades inconsistentes respecto a la imagen de referencia.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados; el condicionamiento por audio puede degradarse con acentos, ruido o idiomas no representados en el entrenamiento original.
- Restricciones de licencia: licencia MIT, permite uso comercial y modificacion con atribucion; conviene verificar la licencia del modelo base original, que no se detalla en este repositorio.
- Caveats para produccion: el repositorio es un repackaging, no el modelo original; la calidad final depende del workflow de ComfyUI, de los pasos de muestreo y del uso correcto de las LoRAs DMD/OPSD. No hay garantias de soporte ni documentacion tecnica en este repositorio.
- El modelo esta pensado para difusion de video, no para tareas de texto, codigo o razonamiento; no debe evaluarse con benchmarks tipo MMLU o HumanEval.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Comfy-Org/LongCat-Video-Avatar
- Modelo base original: https://huggingface.co/meituan-longcat/LongCat-Video-Avatar-1.6
- ComfyUI (GitHub): https://github.com/Comfy-Org/ComfyUI
- Comfy Cloud: https://cloud.comfy.org/
