# ausboss/Qwen-Image-2.1-Outfit-Swap-Consistency-LoRA

## Resumen

Qwen-Image-2.1-Outfit-Swap-Consistency-LoRA es un adaptador LoRA de rango 32 desarrollado por el usuario ausboss para el modelo de difusión de imagenes Qwen/Qwen-Image-2.1. Su proposito es resolver un problema muy concreto del cambio de ropa mediante IA (outfit swap): cuando se le pide al modelo base que vista a una persona con una prenda de una segunda imagen, Qwen-Image-2.1 ya es capaz de hacerlo, pero el resultado se desalinea unos pixeles respecto al original, suaviza el rostro y repinta partes del fondo. Este LoRA corrige esa deriva y concentra la edicion unicamente en la ropa.

El adaptador no introduce ningun trigger word: se carga a fuerza 1.0 y se le pasa la persona como imagen 1 y la prenda como imagen 2, con un prompt en ingles del tipo "Dress the person in image 1 in the <outfit> shown in image 2. Keep their face, hair, hands, pose and the background exactly the same.". Segun las mediciones del autor sobre 16 swaps no vistos durante el entrenamiento, el error de posicionamiento baja de 3,6 px a 0,1 px, los pixeles del rostro que cambian de forma apreciable pasan del 14,1 % al 1,7 % y los del fondo del 10,8 % al 0,9 %.

Es relevante ahora porque el outfit swap es una de las aplicaciones comerciales mas demandadas del image-to-image (probadores virtuales, previsualizacion de moda, generacion de catalogos) y hasta la fecha los resultados tendian a alterar la identidad de la persona o el entorno, lo que arruina el uso en produccion. El adaptador se distribuye en formato ComfyUI, pesa unos 0,5 GB en total y se ofrece en tres checkpoints (pasos 1000, 1250 y 1500 del entrenamiento).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion Qwen/Qwen-Image-2.1 |
| Parametros totales | no disponible (LoRA de rango 32; el repositorio completo ocupa 0,5 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion y edicion de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles; el modelo base no documenta idiomas en la informacion facilitada) |
| Licencia | qwen-research-license |
| Formato de pesos | safetensors (formato de claves de ComfyUI) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango 32 construido sobre los pesos de Qwen-Image-2.1, en el formato de claves que espera ComfyUI y entrenado con ai-toolkit. El autor no detalla en la informacion disponible la composicion exacta del dataset, el numero de tokens ni el metodo de optimizacion, pero si indica que el conjunto de validacion consta de 16 swaps que el LoRA nunca vio: cuatro pares reservados del propio set y doce pares (seis de banadores, cuatro de abrigos, blazers y vestidos, y dos de hombres) con personas y prendas que no aparecen en el entrenamiento. El entrenamiento se distribuye en tres checkpoints: paso 1000 (archivo `qwen-image-2.1-outfit-swap.safetensors`, recomendado como punto de partida), paso 1250 y paso 1500.

La innovacion tecnica es de objetivo, no de arquitectura: el LoRA no anade capacidad de edicion nueva, sino que restringe la atencion del modelo para que la modificacion se aplique sobre el propio marco de la imagen original. Los resultados de validacion se obtuvieron con semilla fija, 25 pasos, CFG 1, sampler euler / simple, aproximadamente 2 MP de resolucion y el LoRA a fuerza 1.0. A fuerza 0.5 reaparece aproximadamente la mitad de la deriva (1,8 px en el mismo test), lo que confirma que el adaptador es el responsable directo de la mejora en consistencia.

## Capacidades

- Edicion de imagen de persona a partir de dos entradas: una fotografia de la persona (imagen 1) y una imagen de la prenda (imagen 2).
- Cambio de ropa conservando de forma estricta rostro, cabello, manos, pose y fondo de la imagen original.
- Reduccion de la deriva geometrica del resultado respecto a la imagen de origen (0,1 px de mediana en la validacion del autor).
- Preservacion de la identidad facial: solo el 1,7 % de los pixeles del rostro cambian de forma apreciable segun la medicion del autor.
- Preservacion del fondo: solo el 0,9 % de los pixeles del fondo se repintan.
- Control parcial de la ropa antigua: en el paso 1000, dos de cada tres semillas eliminan botas o vaqueros bajo la prenda nueva; los pasos 1250 y 1500 conservan mas elementos de la ropa previa.
- Modificacion del comportamiento mediante una frase anadida al prompt: `Keep their own shoes and legwear.` o `Replace everything they wear.`.
- Integracion directa en ComfyUI mediante un workflow publicado por el autor.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o video; es exclusivamente un adaptador de edicion de imagen.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Probador virtual para comercio electronico: el adaptador permite mostrar una misma prenda sobre fotografias reales de clientes o modelos sin alterar su rostro ni el fondo, algo imprescindible para que la imagen resultante sea util en una ficha de producto.
- Previsualizacion de colecciones de moda: un disenador puede generar variaciones de una misma persona con distintas prendas manteniendo la coherencia visual de la sesion, gracias a que el resultado se mantiene alineado con la imagen de partida (0,1 px de mediana).
- Generacion de catalogos a escala: con el prompt y el workflow fijos, un pipeline puede procesar lotes de pares persona-prenda de forma reproducible, ya que no requiere trigger word ni ajustes especificos por imagen.
- Marketing personalizado: insercion de una prenda concreta en fotografias corporativas o de campana sin repintar el entorno ni la piel, evitando el aspecto artificial que producia el modelo base (10,8 % del fondo repintado sin el LoRA).
- Prototipado rapido de estilismo: combinacion de prendas de archivo con fotografias de referencia para evaluar combinaciones antes de producir muestras fisicas, aprovechando que el paso 1250 conserva mas elementos de la ropa original.
- Retoque fotografico asistido: correccion de vestuario en fotografias ya realizadas donde no se puede repetir la sesion, manteniendo intactos rostro y fondo para no invalidar el trabajo original.
- Investigacion sobre control de difusion: el LoRA sirve como caso de estudio de como un adaptador de bajo rango puede restringir la region de edicion de un modelo de difusion sin reentrenar el modelo completo.

## Benchmarks y rendimiento

Resultados de validacion publicados por el autor sobre 16 swaps no vistos en entrenamiento, con semilla fija, 25 pasos, CFG 1, euler / simple, aproximadamente 2 MP y el LoRA a fuerza 1.0. Las metricas de rostro y fondo se calculan despues de alinear cada resultado con la imagen de la persona, de modo que miden repintado y no deriva.

| Metrica | Sin LoRA | Paso 1000 | Paso 1250 | Paso 1500 |
|---|---|---|---|---|
| Distancia al original (peor esquina, mediana) | 3,6 px | 0,1 px | 0,1 px | 0,1 px |
| Distancia al original (peor de los 16) | 7,0 px | 0,2 px | 0,2 px | 0,2 px |
| Pixeles del rostro con cambio apreciable | 14,1 % | 1,7 % | 1,8 % | 2,0 % |
| Rostro, PSNR contra la imagen de la persona | 29,8 dB | 37,8 dB | 37,7 dB | 37,1 dB |
| Pixeles del fondo con cambio apreciable | 10,8 % | 0,9 % | 0,9 % | 1,2 % |
| Fondo, PSNR | 27,6 dB | 40,5 dB | 40,4 dB | 40,0 dB |

Comportamiento sobre la ropa antigua (dos swaps, tres semillas cada uno, peticion sin frase adicional):

| Configuracion | Vaqueros retirados bajo falda nueva | Botas retiradas con bikini |
|---|---|---|
| Sin LoRA | 0 de 3 | 0 de 3 |
| Paso 500 | 0 de 3 | 0 de 3 |
| Paso 1000 | 2 de 3 | 2 de 3 |
| Paso 1250 | 0 de 3 | 0 de 3 |

Efecto de anadir una frase final al prompt (paso 1000, una semilla):

| Swap | Peticion simple | + `Keep their own shoes and legwear.` | + `Replace everything they wear.` |
|---|---|---|---|
| Medias, banador | medias permanecen | medias permanecen | medias retiradas, zapatos permanecen |
| Botas, bikini | descalzo | botas permanecen | descalzo |
| Vaqueros rotos, rebeca y falda | vaqueros retirados | vaqueros retirados | vaqueros retirados |

## Requisitos de hardware

- El LoRA pesa aproximadamente 0,5 GB, pero necesita cargarse sobre los pesos completos de Qwen/Qwen-Image-2.1, por lo que los requisitos reales de VRAM los determina el modelo base y no el adaptador.
- VRAM estimada para inferencia: no disponible en la informacion facilitada; depende de la cuantizacion y del backend utilizados con Qwen-Image-2.1.
- GPU recomendadas: no disponible en la informacion facilitada.
- Viabilidad en GPU de consumo: no disponible; el autor no publica mediciones de VRAM ni de latencia en la model card.
- Opciones de despliegue: ComfyUI es el entorno de referencia, con el workflow publicado por el autor (`workflows/qwen-image-2.1-outfit-swap.json`) y el adaptador en formato de claves de ComfyUI. Otros backends como llama.cpp, vLLM, Ollama o TGI no aplican a un LoRA de difusion de imagen.
- Latencia y throughput: no disponibles. La unica configuracion de inferencia descrita es 25 pasos, CFG 1, sampler euler / simple y aproximadamente 2 MP de resolucion.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ausboss/Qwen-Image-2.1-Outfit-Swap-Consistency-LoRA | LoRA de rango 32 | Cambio de ropa con consistencia | Qwen-Image-2.1 | qwen-research-license | HuggingFace y Civitai |
| ausboss/Qwen-Image-2.1-Consistency-LoRA | LoRA | Consistencia general de ediciones (restilizado, iluminacion, fondos, ropa) | Qwen-Image-2.1 | no disponible | HuggingFace |
| Alissonerdx/BFS-Best-Face-Swap | Adaptador | Intercambio de rostros | Qwen-Image-2.1 | no disponible | HuggingFace |
| lilylilith/QI_2.1_AnyAngle | Adaptador | Edicion con control de angulo | Qwen-Image-2.1 | no disponible | HuggingFace |
| Viggle/Qwen-Image-2.1-viggle-turbo | Adaptador | Aceleracion de inferencia | Qwen-Image-2.1 | no disponible | HuggingFace |

Los datos de parametros, contexto y rendimiento de los modelos comparados no estan disponibles en la informacion proporcionada; la comparacion se limita al tipo de adaptador, la tarea y la licencia.

## Limitaciones y advertencias

- Licencia `qwen-research-license`: es una licencia de investigacion, no una licencia permisiva de uso comercial general. Conviene revisar las condiciones antes de emplearlo en produccion comercial.
- Las mediciones del autor se basan en una muestra reducida: 16 swaps para las metricas de consistencia y tres semillas para el comportamiento sobre la ropa antigua. No hay validacion independiente.
- El paso 1000 es el unico que retira de forma fiable la ropa antigua en los tests del autor (2 de 3 semillas); los pasos 1250 y 1500 conservan con frecuencia botas o vaqueros bajo la prenda nueva.
- El comportamiento frente a la ropa antigua solo se controla parcialmente mediante frases anadidas al prompt, y esa sensibilidad depende del paso elegido.
- El adaptador esta atado a Qwen-Image-2.1; no es portable a otros modelos de difusion.
- Los prompts de ejemplo estan en ingles y no se documentan capacidades multilingues.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion disponible, pero son inherentes al modelo base Qwen-Image-2.1 y a los datos con los que fue entrenado.
- En un cambio de ropa sobre personas reales hay implicaciones de privacidad e imagen que deben considerarse, especialmente en un contexto de probador virtual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ausboss/Qwen-Image-2.1-Outfit-Swap-Consistency-LoRA
- Modelo base Qwen/Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Pagina del LoRA en Civitai: https://civitai.com/models/2983159/qwen-image-21-outfit-swap-consistency-lora
- Workflow de Outfit Swap en Civitai: https://civitai.com/models/2983126
- LoRA de consistencia general del mismo autor: https://huggingface.co/ausboss/Qwen-Image-2.1-Consistency-LoRA
- Listado de adaptadores para Qwen/Qwen-Image-2.1: https://huggingface.co/models?other=base_model:adapter:Qwen/Qwen-Image-2.1
- Listado de modelos image-to-image en HuggingFace: https://huggingface.co/models?pipeline_tag=image-to-image
- Listado de modelos con etiqueta lora: https://huggingface.co/models?other=lora
- Workflow de ComfyUI incluido en el repositorio: workflows/qwen-image-2.1-outfit-swap.json
- Demo en video: https://huggingface.co/ausboss/Qwen-Image-2.1-Outfit-Swap-Consistency-LoRA/resolve/main/outfit_swap_demo.mp4
