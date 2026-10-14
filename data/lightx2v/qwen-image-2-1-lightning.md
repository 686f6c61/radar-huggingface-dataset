# lightx2v/Qwen-Image-2.1-Lightning

## Resumen

LightX2V Lightning for Qwen-Image-2.1 es un **adaptador LoRA destilado a 4 pasos** para el modelo de generacion de imagenes Qwen-Image-2.1, publicado por el equipo lightx2v (organizacion asociada al proyecto LightX2V de ModelTC). No es un modelo completo: es un adaptador que se carga sobre los pesos base `Qwen/Qwen-Image-2.1` mediante `diffusers` y que reduce el coste de muestreo de 40 pasos de denoising a solo 4, manteniendo tanto la generacion texto-a-imagen como la edicion de imagenes con referencias multiples.

Su relevancia es de tipo practico: la destilacion por pasos permite ejecutar un modelo de difusion de gran tamano con una fraccion del coste computacional habitual, algo critico cuando el objetivo es servir generacion de imagenes en produccion o en hardware limitado. El entrenamiento se realizo integramente sobre **16 NPU Huawei Ascend 910B** usando destilacion DMD dentro del framework LightX2V, lo que lo convierte tambien en un caso de referencia para el ecosistema de aceleradores no CUDA.

El repositorio ocupa solo 0,2 GB (pesos del adaptador), no declara licencia en HuggingFace y no publica especificaciones propias del modelo base. La model card incluye ejemplos comparativos de misma semilla y mismo prompt entre el modelo base a 40 pasos y el LoRA a 4 pasos, tanto en texto-a-imagen como en edicion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de difusion sobre Qwen-Image-2.1 (arquitectura interna del base: no disponible) |
| Parametros totales | No disponible (el repositorio pesa 0,2 GB, correspondiente solo a los pesos LoRA) |
| Parametros activos | No aplica (adaptador LoRA, no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (`pytorch_lora_weights.safetensors`) |
| Tipo de modelo | LoRA de destilacion para difusion (text-to-image e image editing) |
| Modelo base | Qwen/Qwen-Image-2.1 (relacion: adapter) |
| Pasos de inferencia | 4 (`sigmas=[1.0, 0.75, 0.5, 0.25]`) |
| Scheduler | FlowMatchEulerDiscreteScheduler con `shift_terminal=None` |
| Resolucion de los ejemplos | 1024x1024 |
| Libreria | diffusers |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes en HuggingFace | 0 descargas / 15 likes |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre el transformer de difusion de Qwen-Image-2.1. La model card no detalla la arquitectura interna del modelo base, el rango del adaptador ni las capas a las que se aplica, por lo que esa informacion debe considerarse no disponible. Lo que si se especifica es el mecanismo de inferencia: se carga el LoRA con `pipe.load_lora_weights(..., weight_name="pytorch_lora_weights.safetensors", adapter_name="lightning")`, se sustituye el scheduler por un `FlowMatchEulerDiscreteScheduler` configurado con `shift_terminal=None`, y se ejecuta con 4 pasos, `true_cfg_scale=1.0` (CFG desactivado) y `use_kv_cache=False`.

El entrenamiento se realizo mediante destilacion DMD (el metodo de destilacion implementado en LightX2V) sobre **16 NPU Huawei Ascend 910B**, segun indica el autor. No se especifican el numero de imagenes de entrenamiento, la composicion del dataset, la duracion del entrenamiento ni si hubo etapas adicionales de ajuste. Tampoco se documenta el rango del LoRA ni la fraccion de parametros entrenados respecto al modelo base. Se indica que el adaptador preserva tanto la generacion texto-a-imagen como la edicion (con una o varias imagenes de referencia de entrada).

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) en resoluciones como 1024x1024 con solo 4 pasos de muestreo.
- Edicion de imagenes basada en instrucciones en lenguaje natural, preservando identidad, pose, fondo e iluminacion cuando asi se solicita en el prompt.
- Edicion con multiples imagenes de referencia: la API acepta una lista de imagenes (`image=[...]`) para composiciones que combinan varias fuentes.
- Renderizado de texto dentro de la imagen: los ejemplos de la model card incluyen rotulacion en ingles y en chino ("Qwen Coffee, $2 per cup" y "通义千问").
- Composicion escenica y edicion semantica: recoloreado de prendas, cambios de vestuario y de escena nocturna, fusion de personas y animales, y anuncios de producto.
- Control determinista mediante semilla (`generator=torch.Generator("cuda").manual_seed(42)`), util para reproducibilidad en comparaciones.
- No se documentan capacidades de tool calling, agentes, audio, video ni razonamiento multi-paso: al ser un modelo de difusion no aplican en el sentido habitual.

## Casos de uso

- Generacion de imagenes en produccion con coste reducido: al pasar de 40 a 4 pasos de denoising, el mismo hardware puede atender aproximadamente diez veces mas peticiones por unidad de tiempo, lo que hace viable servir un modelo de difusion de gran tamano en un cluster pequeno.
- Edicion de producto para comercio electronico: cambiar el color de una prenda o recolocar un producto sobre un fondo nuevo usando la imagen original como referencia, sin reentrenar ni reencuadrar manualmente.
- Creacion de material publicitario: los ejemplos de la model card incluyen un anuncio de vino con motivos florales y un anuncio de producto, generados a partir de varias imagenes de referencia combinadas en un solo prompt.
- Prototipado rapido de conceptos visuales: iterar sobre bocetos y variaciones con 4 pasos permite explorar decenas de propuestas en el tiempo que antes costaba una sola generacion.
- Generacion de imagenes con rotulacion integrada: carteles, letreros y reclamos publicitarios que requieren texto legible dentro de la imagen, aprovechando la capacidad de renderizado de texto del modelo base.
- Edicion preservando identidad: cambio de vestuario o de entorno sobre fotografias de personas manteniendo rasgos faciales, pose y condiciones de iluminacion, util para catalogos de moda o retoque semiautomatico.
- Integracion en pipelines de contenido automatizado: al ser un LoRA compatible con `diffusers`, se puede insertar en flujos que ya usan `QwenImage21Pipeline` sin cambiar el stack de inferencia.
- Experimentacion en hardware no CUDA: el flujo de entrenamiento basado en NPU Ascend 910B y los scripts de plataforma de LightX2V permiten reproducir el proceso en entornos heterogeneos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, ImageReward, MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card incluye unicamente una comparacion cualitativa por pares de imagenes, con el mismo prompt, la misma semilla y el mismo tamano de salida, entre el modelo base a 40 pasos y el LoRA Lightning a 4 pasos, en ambos casos con CFG desactivado:

| Ejemplo (texto-a-imagen) | Base Qwen-Image-2.1, 40 pasos | Lightning LoRA, 4 pasos |
|---|---|---|
| Coffee Shop Signage | Imagen publicada en `assets/t2i/01/base_40step.png` | Imagen publicada en `assets/t2i/01/lightning_4step.png` |
| Nine-Headed Fox Beast | Imagen publicada en `assets/t2i/02/base_40step.png` | Imagen publicada en `assets/t2i/02/lightning_4step.png` |
| Sheep Designer Toy | Imagen publicada en `assets/t2i/03/base_40step.png` | Imagen publicada en `assets/t2i/03/lightning_4step.png` |
| Office Cow Selfie | Imagen publicada en `assets/t2i/04/base_40step.png` | Imagen publicada en `assets/t2i/04/lightning_4step.png` |
| Floral Wine Advertisement | Imagen publicada en `assets/t2i/05/base_40step.png` | Imagen publicada en `assets/t2i/05/lightning_4step.png` |

| Ejemplo (edicion) | Referencias | Base, 40 pasos | Lightning, 4 pasos |
|---|---|---|---|
| Jacket Recolor | 1 imagen | `assets/edit/01/base_40step.png` | `assets/edit/01/lightning_4step.png` |
| Outfit and Night Scene | 3 imagenes | `assets/edit/02/base_40step.png` | `assets/edit/02/lightning_4step.png` |
| Person and Cat | 3 imagenes | `assets/edit/03/base_40step.png` | `assets/edit/03/lightning_4step.png` |
| Product Advertisement | 3 imagenes | `assets/edit/04/base_40step.png` | `assets/edit/04/lightning_4step.png` |

No se aportan metricas objetivas de similitud entre ambas salidas, ni tiempos de inferencia medidos, ni tasas de exito por categoria de prompt.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del modelo base Qwen-Image-2.1 no se especifica en la informacion proporcionada, por lo que no es posible calcularla. El adaptador LoRA en si ocupa aproximadamente 0,2 GB adicionales sobre los pesos del modelo base.
- GPU recomendadas: no disponibles como lista cerrada. Los ejemplos de la model card se ejecutan con `torch_dtype=torch.bfloat16` sobre `cuda`, lo que implica soporte de bfloat16 en la GPU utilizada.
- Encaje en GPU de consumo: no confirmado. No se indica el consumo de VRAM del pipeline completo, por lo que no se puede afirmar que quepa en una RTX 4090 u otra GPU de gama de consumo.
- Entrenamiento: realizado sobre 16 NPU Huawei Ascend 910B. Reproducirlo requiere ese tipo de acelerador o adaptar el flujo a otro backend.
- Opciones de despliegue: `diffusers` es la via documentada (clase `QwenImage21Pipeline`). El autor remite ademas a los scripts de plataforma de LightX2V para plataformas heterogeneas. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusion en este formato).
- Optimizacion de inferencia: el parametro `use_kv_cache=False` aparece explicitamente en los ejemplos, luego la cache KV esta disponible pero desactivada en la configuracion de referencia.
- Latencia y throughput: no se publican mediciones absolutas. El unico dato objetivo es la reduccion del numero de pasos de muestreo de 40 a 4 (diez veces menos) en la misma resolucion de 1024x1024, con CFG desactivado (`true_cfg_scale=1.0`).

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de inferencia | Modelo base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lightx2v/Qwen-Image-2.1-Lightning | LoRA de destilacion | 4 | Qwen/Qwen-Image-2.1 | No disponible | HuggingFace (diffusers) |
| Qwen/Qwen-Image-2.1 (base) | Modelo de difusion completo | 40 en los ejemplos comparativos | No aplica | No disponible en la informacion proporcionada | HuggingFace |
| lightx2v/Qwen-Image-Lightning | LoRA de destilacion de la generacion anterior | No disponible en la informacion proporcionada | Qwen-Image (v1) | No disponible en la informacion proporcionada | HuggingFace y repositorio ModelTC/LightX2V-Qwen-Image-Lightning |

No se dispone de datos de parametros, contexto ni rendimiento cuantitativo de ninguno de los tres modelos en la informacion proporcionada, por lo que la comparacion se limita a tipo de artefacto, pasos de inferencia y via de distribucion. No se han identificado otros adaptadores Lightning de 4 pasos especificos para Qwen-Image-2.1 en los resultados de busqueda.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, por lo que **el uso comercial no esta garantizado** y requiere consulta previa al autor. La licencia del modelo base Qwen/Qwen-Image-2.1 tampoco se detalla en la informacion disponible.
- Naturaleza de adaptador: no funciona de forma autonoma; requiere descargar y cargar Qwen/Qwen-Image-2.1. El coste de almacenamiento y de VRAM del despliegue lo determina el modelo base, no los 0,2 GB del LoRA.
- Degradacion por destilacion: al reducir el muestreo de 40 a 4 pasos, es esperable cierta perdida de detalle o fidelidad respecto al modelo base, especialmente en prompts complejos. La model card solo ofrece comparaciones visuales por pares, sin metricas objetivas que cuantifiquen esa diferencia.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar elementos inexistentes en el prompt, deformar texto o alterar atributos no solicitados. No se documentan tasas de fallo.
- Texto en imagen: aunque los ejemplos muestran rotulacion en ingles y en chino, no se especifica que idiomas estan cubiertos de forma fiable ni con que tasa de acierto.
- Idiomas soportados: no declarados. El soporte multilingue de los prompts depende del encoder de texto del modelo base, no del LoRA.
- Sesgos: no se publica ninguna evaluacion de sesgos demograficos, culturales o de representacion. Es previsible que herede los sesgos del dataset de entrenamiento del modelo base, que no se documenta.
- Configuracion sensible: los ejemplos fijan `num_inference_steps=4`, `sigmas=[1.0, 0.75, 0.5, 0.25]`, `true_cfg_scale=1.0` y `shift_terminal=None`. Cambiar estos valores puede degradar la calidad de salida; no se documenta el comportamiento fuera de esa configuracion.
- Reproducibilidad del entrenamiento: no se publican los datos de entrenamiento, el numero de iteraciones ni los hiperparametros, por lo que no es posible replicar el proceso a partir de la informacion disponible.
- Madurez del repositorio: 0 descargas y 15 likes en el momento de la consulta; el ecosistema de terceros (tutoriales, integraciones) es previsiblemente escaso.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/lightx2v/Qwen-Image-2.1-Lightning
- Modelo base Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio LightX2V (framework de entrenamiento e inferencia): https://github.com/ModelTC/LightX2V
- Scripts de plataforma de LightX2V para hardware heterogeneo: https://github.com/ModelTC/LightX2V/tree/main/scripts/platforms
- Repositorio de la version anterior del destilado: https://github.com/ModelTC/LightX2V-Qwen-Image-Lightning
- Pagina en HuggingFace de la version anterior, lightx2v/Qwen-Image-Lightning: https://huggingface.co/lightx2v/Qwen-Image-Lightning
- Ficha de terceros sobre lightx2v/Qwen-Image-Lightning: https://huggingpeers.co/models/lightx2v/Qwen-Image-Lightning
