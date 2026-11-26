# GooseKiller/kot-inpainting-sdxl-lora

## Resumen

`kot-inpainting-sdxl-lora` es un adaptador LoRA para el modelo SDXL Inpainting 1.0 de Stability AI, publicado por el usuario GooseKiller en Hugging Face. Su funcion es convertir cualquier objeto enmascarado en un gato: dada una imagen y una mascara binaria que marca la region a reemplazar, el modelo genera un gato con la forma y el contorno del objeto original. No es un modelo de restauracion fotografica generalista, sino un adaptador especializado con un comportamiento deliberadamente sesgado hacia la categoria "gato".

El adaptador se entrena sobre el dataset Oxford-IIIT Pet (solo imagenes de gatos, aproximadamente 2.400 imagenes) utilizando las mascaras de segmentacion de las mascotas y mascaras de parches aleatorios. Se aplica sobre las capas de atencion del UNet del modelo base mediante PEFT, con rango 32 y precision fp16. El repositorio ocupa 0,2 GB y se distribuye en formato safetensors compatible con la libreria diffusers.

El modelo es relevante como ejemplo de adaptacion LoRA de bajo coste (entrenado en una unica NVIDIA T4 durante unas 6 horas) para una tarea creativa muy concreta. No compite en rendimiento de restauracion con el modelo base, pero ofrece un comportamiento consistente y predecible en su dominio: rellenar huecos con gatos en lugar de con fondos genericos. Su licencia CreativeML OpenRAIL-M permite uso comercial con restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre UNet de SDXL Inpainting 1.0 (difusion latente) |
| Parametros totales | no disponible (el adaptador LoRA se aplica sobre el modelo base SDXL Inpainting) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, sin contexto textual extensible) |
| Tipos de cuantizacion | fp16 (entrenamiento y uso indicado); el modelo base admite fp16 y variantes GGUF/quantizadas de terceros |
| Idiomas soportados | no disponible (los prompts de texto dependen del codificador de texto CLIP del modelo base, predominantemente ingles) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT/diffusers) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `diffusers/stable-diffusion-xl-1.0-inpainting-0.1`, un modelo de difusion latente con UNet y doble codificador de texto CLIP. La LoRA se aplica exclusivamente a las capas de atencion del UNet, con rango 32 y precision fp16, y se fusiona con el modelo base en inferencia mediante `merge_and_unload()` de PEFT. El pipeline es `StableDiffusionXLInpaintPipeline` con tarea image-to-image.

El entrenamiento usa el dataset Oxford-IIIT Pet, filtrando solo gatos (unas 2.400 imagenes). Las mascaras se generan combinando la segmentacion de la mascota (recorte completo con dilatacion) en un 15% de los casos y mascaras de parches aleatorios en el 85% restante. El schedule es de 3 epochs con learning rate 1e-4 seguido de 5 epochs con 3e-5, con decaimiento coseno. Todo el entrenamiento se realizo en una unica NVIDIA T4 (Kaggle) en aproximadamente 6 horas. El autor reporta un LPIPS de validacion de 0,215, frente al aproximadamente 0,20 del modelo base en fotos de mascotas no vistas, y aclara que la LoRA no supera al base en restauracion fotografica: su objetivo es forzar la generacion de gatos donde el base tiende a rellenar con fondo generico.

## Capacidades

- Inpainting condicionado por mascara: rellena la region enmascarada con un gato coherente con la forma del hueco.
- Generacion de gatos con contorno adaptado al objeto original (piedra, pala de ping-pong, fregona, etc.).
- Image-to-image con mascara binaria (blanco = reemplazar).
- Control mediante prompt de texto y negative prompt (heredado del pipeline SDXL Inpainting).
- Fusion de la LoRA con el UNet base para inferencia sin sobrecoste de parametros adicionales.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje.
- No soporta vision mas alla del propio pipeline de imagen; no hay capacidades de audio.

## Casos de uso

- Edicion creativa de fotos: sustituir objetos no deseados por gatos con la forma del objeto, usando una mascara dibujada manualmente o generada por un segmentador (SAM, por ejemplo) y el pipeline SDXL Inpainting.
- Generacion de contenido para redes sociales y memes: convertir objetos cotidianos en gatos con forma reconocible, aprovechando el comportamiento predecible del adaptador.
- Pruebas de concepto de adaptacion LoRA: servir como referencia de entrenamiento de bajo coste (una T4, 6 horas) para tareas de inpainting especializadas.
- Prototipado de pipelines de inpainting en diffusers: validar la integracion de PEFT con `StableDiffusionXLInpaintPipeline` antes de escalar a modelos mayores.
- Demos interactivas y espacios de Hugging Face: el tamano reducido del adaptador (0,2 GB) facilita su despliegue junto al modelo base en entornos con recursos limitados.
- Investigacion sobre sesgo de categoria en difusion: estudiar como una LoRA especializada fuerza la generacion hacia una clase concreta frente al comportamiento mas generico del modelo base.

## Benchmarks y rendimiento

| Metrica | kot-inpainting-sdxl-lora | SDXL Inpainting 1.0 (base) |
|---|---|---|
| LPIPS de validacion (fotos de mascotas no vistas) | 0,215 | ~0,20 |
| Comportamiento en huecos no felinos | Genera un gato con la forma del hueco | Tiende a rellenar con fondo generico |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de un modelo de imagen y no de lenguaje.

## Requisitos de hardware

- VRAM estimada: el modelo base SDXL Inpainting en fp16 requiere aproximadamente 8-10 GB de VRAM para inferencia; la LoRA anadida no incrementa el uso de memoria tras la fusion.
- GPU recomendadas: NVIDIA T4 (usada en entrenamiento), RTX 3090, RTX 4090, A100, H100.
- Cabe en GPU de consumo: si, en RTX 3090/4090 y en GPUs con 12 GB o mas en fp16; en GPUs de 8 GB puede requerir offloading o cuantizacion del modelo base.
- Opciones de despliegue: diffusers con PEFT (flujo documentado por el autor), asi como pipelines basados en diffusers con `StableDiffusionXLInpaintPipeline`; no se documenta soporte nativo en llama.cpp, Ollama o TGI (no aplicables a difusion).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del modelo base, los pasos de inferencia (30 en el ejemplo) y la GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kot-inpainting-sdxl-lora | LoRA sobre SDXL Inpainting | no disponible (adaptador) | no aplica | CreativeML OpenRAIL-M | Hugging Face |
| SDXL Inpainting 1.0 (base) | Difusion latente inpainting | no disponible | no aplica | CreativeML OpenRAIL-M | Hugging Face / diffusers |
| Otras LoRAs de inpainting SDXL | Adaptadores LoRA | variable | no aplica | variable | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada; la unica comparacion cuantitativa disponible es el LPIPS frente al modelo base (0,215 frente a ~0,20).

## Limitaciones y advertencias

- Solo genera gatos: no pinta perros ni otras categorias, lo que limita su uso a tareas creativas o especializadas.
- Mascaras muy finas (como el mango de una fregona) pueden devolver un objeto fino en lugar de un gato; el modelo necesita espacio para colocar el animal.
- No supera al modelo base en restauracion fotografica general (LPIPS 0,215 frente a ~0,20); su valor esta en el sesgo deliberado hacia la categoria gato.
- Hereda los sesgos y limitaciones del modelo base SDXL Inpainting, incluidos posibles sesgos en la representacion de gatos y en el codificador de texto CLIP.
- Riesgo de alucinacion visual: puede generar gatos incoherentes o artefactos en mascaras complejas o imagenes de baja calidad.
- El prompt de texto esta en ingles en el ejemplo; el soporte multilingue del codificador de texto del base es limitado.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (prohibicion de usos daninos descritos en la licencia); revisar los terminos antes de produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/GooseKiller/kot-inpainting-sdxl-lora
- Modelo base: https://huggingface.co/diffusers/stable-diffusion-xl-1.0-inpainting-0.1
- Dataset Oxford-IIIT Pet: https://www.robots.ox.ac.uk/~vgg/data/pets/
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Libreria diffusers: https://github.com/huggingface/diffusers
- PEFT: https://github.com/huggingface/peft
