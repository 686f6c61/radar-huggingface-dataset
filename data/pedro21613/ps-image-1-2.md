# Pedro21613/PS-IMAGE-1.2

## Resumen

PS-IMAGE-1.2 es un adaptador LoRA de rango 12 (~2,4 M de parametros, 9,2 MB) publicado por el usuario Pedro21613 en HuggingFace, pensado para el modelo de difusion `runwayml/stable-diffusion-v1-5` a 512 px. No es un modelo completo, sino un ajuste fino de bajo rango que se carga sobre la UNet del modelo base mediante `peft` y despues se fusiona con `merge_and_unload()`. Su proposito declarado es mejorar la generacion fotorrealista de personas y de una tematica variada, evolucionando una version anterior (v1.1) que solo cubria mascotas.

El entrenamiento se hizo sobre un dataset publico de 3.395 imagenes compuesto por Caltech101 (2.595 imagenes, 101 clases, con peso x2 para rostros y personas, e incluyendo aviones, coches, motos, animales y objetos) y Oxford-IIIT Pet (800 imagenes de gatos y perros). Las clases citadas en la model card son: rostro de persona, mujer sonriendo en un parque, avion sobre una ciudad, coche blanco, Beagle y gato Persa. Los prompts recomendados siguen la plantilla `ultra realistic photo of ..., detailed skin/fur, sharp focus, natural lighting, high quality`.

La relevancia de esta ficha es limitada y conviene ser honesto: el repositorio tiene 0 descargas y 0 "likes", no declara licencia ni idiomas soportados, y su model card esta redactada en portugues. Se trata, por tanto, de un experimento personal de bajo coste (entrenado en una Tesla T4) en lugar de un modelo con validacion externa. Su interes practico esta en servir como ejemplo reproducible de fine-tuning LoRA ligero sobre SD 1.5 y como punto de partida para adaptaciones de dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation, rank 12) aplicada a la UNet de un modelo de difusion latente (Stable Diffusion 1.5) |
| Parametros totales | ~2,4 M en el adaptador LoRA; el modelo base `runwayml/stable-diffusion-v1-5` se descarga por separado y no se incluye en el repositorio |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de LLM: modelo texto-a-imagen. El text encoder del modelo base (CLIP) impone un limite de 77 tokens por prompt |
| Tipos de cuantizacion | No disponible en la model card; los pesos del adaptador se publican en `safetensors` (entrenamiento en fp16). No se ofrecen variantes GGUF ni cuantizaciones del adaptador |
| Idiomas soportados | No disponible. Los prompts de ejemplo estan en ingles y el text encoder CLIP del modelo base esta entrenado principalmente en ingles |
| Licencia | No disponible (no declarada en el repositorio ni en la model card) |
| Formato de pesos | `safetensors` (adaptador LoRA), cargable con `diffusers` + `peft` |
| Tamano del repositorio | 0,0 GB segun HuggingFace (adaptador de 9,2 MB declarado en la model card) |
| Resolucion nativa | 512 px (heredada del modelo base SD 1.5) |
| Pipeline | `text-to-image` |
| Fecha de creacion / actualizacion | 2026-09-11 (ambas, segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer de lenguaje ni un modelo MoE, sino un adaptador LoRA insertado en la UNet de Stable Diffusion 1.5, un modelo de difusion latente con autoencoder variacional (VAE), una UNet con bloques de atencion cruzada y un text encoder CLIP que condiciona la generacion. El adaptador tiene rango 12, lo que supone aproximadamente 2,4 M de parametros entrenables (~9,2 MB en disco) y modifica unicamente la UNet; el VAE y el text encoder permanecen congelados en su version original. La carga se realiza con `PeftModel.from_pretrained(pipe.unet, "Pedro21613/PS-IMAGE-1.2")` seguido de `merge_and_unload()`, de modo que en inferencia no hay sobrecoste de latencia por el adaptador.

El entrenamiento se declara con los siguientes hiperparametros: 3.000 pasos, batch efectivo 4, learning rate 1e-4 con scheduler coseno, precision fp16 y hardware Tesla T4. El dataset son 3.395 imagenes de origen publico: Caltech101 (2.595 imagenes, 101 clases, con las clases de rostros y personas ponderadas por dos) y Oxford-IIIT Pet (800 imagenes). No se menciona en la informacion disponible ningun uso de RLHF, DPO, decodificacion especulativa ni innovaciones tecnicas adicionales; tampoco se detalla resolucion de las imagenes de entrenamiento, tecnica de aumentacion de datos ni composicion exacta del captioning.

## Capacidades

- Generacion de imagenes fotorrealistas a partir de texto (text-to-image) a 512 px mediante el pipeline `StableDiffusionPipeline` de `diffusers`.
- Especializacion declarada en rostros y personas: retratos con textura de piel detallada, segun los prompts recomendados en la model card.
- Cobertura tematica variada, derivada de Caltech101: aviones, coches (vista lateral), motocicletas, animales y objetos genericos, ademas de las clases de mascotas de Oxford-IIIT Pet (perros y gatos).
- Plantilla de prompt sugerida por el autor: `ultra realistic photo of ..., detailed skin/fur, sharp focus, natural lighting, high quality`, con valores de ejemplo de 35 pasos de inferencia y `guidance_scale` 7,5.
- Compatibilidad con el ecosistema LoRA de SD 1.5: al modificar solo la UNet, es combinable con otros adaptadores LoRA en herramientas como ComfyUI, Automatic1111 o InvokeAI, si bien la model card no documenta pruebas de combinacion.
- Uso potencial en los pipelines img2img e inpainting del modelo base, ya que comparten la misma UNet; no obstante, el autor no lo documenta ni lo valida.
- No dispone de soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, vision de entrada (no es un modelo de comprension de imagenes), audio ni modo "thinking". Tampoco se declara capacidad de renderizado de texto dentro de la imagen, algo historicamente limitado en SD 1.5.

## Casos de uso

- Prototipado de retratos fotorrealistas para productos digitales: avatares de usuario o imagenes de perfil generadas con la plantilla de prompt del autor y estilos consistentes, aprovechando el enfasis del dataset en clases de rostros ponderadas x2.
- Ilustracion de contenidos para blog o marketing: generacion de imagenes de ambiente (personas, coches, aviones, animales) para acompanar articulos, con inferencia rapida a 512 px en una GPU de consumo.
- Catalogos de productos para mascotas: la inclusion de Oxford-IIIT Pet (800 imagenes de alta calidad de perros y gatos) permite generar imagenes de razas concretas, como Beagle o gato Persa, citadas en la validacion del autor.
- Aumento de datos sinteticos para clasificadores de vision: las 101 clases de Caltech101 cubiertas por el entrenamiento permiten generar muestras sinteticas de aviones, coches o motos para tareas de aumento de dataset, siempre que se audite la calidad y el sesgo de las muestras generadas.
- Base para fine-tuning incremental de dominio: al ser un LoRA de solo 9,2 MB y rank 12, es un punto de partida barato para iterar nuevos adaptadores sobre SD 1.5 con datasets propios, reutilizando el script de carga publicado por el autor.
- Integracion en pipelines de estudio grafico: carga del adaptador en ComfyUI o Automatic1111 mediante `merge_and_unload()` para flujos de trabajo con otros LoRA, ControlNet o upscalers del ecosistema SD 1.5.
- Evaluacion y ensenanza: ejemplo didactico de flujo completo de entrenamiento LoRA (dataset, hiperparametros, script de inferencia) para cursos o talleres sobre difusion, dado su bajo coste computacional (Tesla T4).
- Pruebas de moderacion de contenido: la model card usa `safety_checker=None`, lo que permite estudiar como se comporta el modelo sin filtro NSFW integrado y disenar capas de moderacion externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, Inception Score ni comparaciones cuantitativas con otros modelos. El unico indicador reportado es cualitativo: el autor afirma que 6 de 6 ejemplos generados (rostro de persona, mujer sonriendo en un parque, avion sobre una ciudad, coche blanco, Beagle y gato Persa) fueron validados visualmente. No se aportan curvas de perdida, metricas de sobreajuste ni evaluaciones con prompts de control.

## Requisitos de hardware

- El adaptador en si ocupa ~9,2 MB, por lo que el requisito real de VRAM lo determina el modelo base SD 1.5 en fp16: del orden de 4 GB para inferencia a 512 px sin optimizaciones adicionales (estimacion basada en el modelo base, no medida por el autor). Con atencion eficiente (xformers, SDPA) o `attention slicing` la huella baja de forma notable en GPUs pequenas.
- GPU de referencia del entrenamiento: Tesla T4 de 16 GB, con batch efectivo 4 y fp16.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB o mas (por ejemplo RTX 3060, 4060, 2070) usando fp16 y atencion optimizada; en GPUs de 4 GB puede requerir `attention slicing` o resoluciones menores.
- Opciones de despliegue: `diffusers` (script `usar_v12.py` publicado por el autor), Automatic1111, ComfyUI, Forge, InvokeAI y exportaciones a ONNX/TensorRT para el modelo base. Herramientas de LLM como llama.cpp, Ollama o vLLM no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La model card no publica tiempos de inferencia ni comparativas con/sin el adaptador fusionado.
- Entorno de ejecucion del ejemplo: `StableDiffusionPipeline` con `torch_dtype=torch.float16`, `safety_checker=None` y `num_inference_steps=35`, `guidance_scale=7.5`.

## Comparativa con modelos similares

No se identificaron en la informacion disponible adaptadores LoRA publicos directamente comparables (mismo autor, mismo dataset o misma plantilla de prompt). La unica referencia solida es el modelo base sobre el que se aplica.

| Modelo | Tipo | Parametros | Resolucion nativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PS-IMAGE-1.2 (Pedro21613) | LoRA sobre SD 1.5, rank 12 | ~2,4 M en el adaptador | 512 px | No disponible | Repositorio HuggingFace con 0 descargas y 0 likes |
| runwayml/stable-diffusion-v1-5 | Modelo base de difusion latente | No disponible en la informacion proporcionada (UNet + VAE + text encoder CLIP) | 512 px | CreativeML OpenRAIL-M (la del modelo base, no declarada en este repositorio) | Modelo ampliamente distribuido en HuggingFace |
| Otros LoRA fotorrealistas de SD 1.5 | Adaptadores LoRA de la comunidad | No disponible | 512 px | Variable segun autor | Ecosistema community en HuggingFace y Civitai |

No se dispone de datos de rendimiento comparativos entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica licencia en el repositorio ni en la model card, por lo que no hay autorizacion explicita de uso comercial. Cualquier despliegue en produccion deberia aclararse con el autor antes de utilizarlo.
- Dataset de entrenamiento muy reducido (3.395 imagenes) y de dominio academico (Caltech101, Oxford-IIIT Pet): alta probabilidad de sobreajuste a las clases vistas y de degradacion en dominios, estilos o composiciones no representados.
- Posible sesgo de representacion: las clases de rostros y personas de Caltech101 se ponderaron x2, y tanto Caltech101 como Oxford-IIIT Pet tienen sesgos propios de composicion, iluminacion y diversidad demografica. No hay auditoria de sesgo publicada.
- Limitaciones heredadas de SD 1.5: resolucion nativa de 512 px (artefactos al forzar resoluciones mayores), dificultades con manos, anatomia y renderizado de texto, y limite de 77 tokens en el prompt.
- Riesgo de alucinacion visual: como todo modelo generativo de difusion, puede producir atributos inexistentes o inconsistencias fisicas (por ejemplo, en vehiculos o extremidades) sin aviso.
- Idiomas: no se declara soporte multilingue; el text encoder del modelo base esta orientado a ingles, por lo que prompts en castellano pueden degradar la fidelidad del resultado.
- El ejemplo de codigo del autor desactiva el `safety_checker` (`safety_checker=None`), lo que elimina el filtro NSFW por defecto. Es imprescindible anadir moderacion externa si el modelo se expone a usuarios finales.
- Modelo practicamente sin validacion externa: 0 descargas, 0 likes, repositorio de 0,0 GB y un unico conjunto de 6 ejemplos cualitativos. No hay tests reproducibles, ni semillas, ni evaluacion por terceros.
- Caveat de fecha: los metadatos indican creacion y actualizacion en septiembre de 2026, una fecha que conviene verificar antes de citar el modelo.
- Caveat de idioma de la documentacion: la model card esta en portugues, lo que puede dificultar la revision por parte de equipos no lusofonos.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/Pedro21613/PS-IMAGE-1.2
- Modelo base: https://huggingface.co/runwayml/stable-diffusion-v1-5
- Dataset Caltech101 (citado como fuente de 2.595 imagenes): no disponible enlace en la model card
- Dataset Oxford-IIIT Pet (citado como fuente de 800 imagenes): no disponible enlace en la model card
- Script de uso `usar_v12.py`: referenciado en la model card, no enlazado explicitamente
- Repositorio, paper o demo adicionales: no disponibles. La busqueda web realizada no devolvio resultados utiles (unicamente paginas de inicio del buscador).
