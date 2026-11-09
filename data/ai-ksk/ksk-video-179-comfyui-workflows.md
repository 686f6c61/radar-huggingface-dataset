# AI-KSK/ksk-video-179-comfyui-workflows

## Resumen

`AI-KSK/ksk-video-179-comfyui-workflows` no es un modelo de IA en sentido estricto, sino un repositorio de Hugging Face que aloja la documentacion en ingles de un tutorial sobre flujos de trabajo en ComfyUI. Concretamente, cubre la ruta Image-to-LoRA (i2L) de Z-Image aplicada al entrenamiento rapido de LoRAs de estilo y a su posterior prueba dentro de un grafo con ControlNet de profundidad y escalado por teselas. El autor, AI-KSK, es un laboratorio que publica pruebas de modelos de imagen y video junto con sus workflows de ComfyUI.

El interes del contenido radica en el flujo que describe: segun el autor, entrenar una LoRA de estilo convencionalmente cuesta horas, mientras que la ruta i2L de Z-Image produciria una LoRA reutilizable en "decenas de segundos" partiendo de entre 1 y 6 imagenes de referencia. El repositorio documenta tres grafos distintos (23, 43 y 62 nodos) con sus parametros de muestreo, cargadores y tamanos de latente leidos directamente del JSON original.

Es importante subrayar que el repositorio tiene un tamano de 0.0 GB y no incluye pesos, JSON de workflow ni portadas: solo el README con el tutorial y la tabla de parametros. Los grafos completos se distribuyen a traves de la publicacion del episodio y de las paginas de RunningHub enlazadas. El modelo base referenciado es Z-Image (UNET `z_image_bf16.safetensors`), con codificador de texto Qwen 3 4B y VAE `ae.safetensors`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio documenta un grafo ComfyUI, no una arquitectura de modelo propia) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se referencia un UNET en `bf16`) |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | safetensors (referencias a `z_image_bf16.safetensors`, `qwen_3_4b.safetensors`, `ae.safetensors` y `Z-Image-Fun-Lora-Distill-4-Steps-2602-ComfyUI.safetensors`); el repositorio no incluye pesos |

## Arquitectura y entrenamiento

El contenido no describe una arquitectura de red neuronal propia, sino un pipeline de generacion de imagen en ComfyUI basado en difusion. El grafo principal de entrenamiento i2L usa como UNET `z_image_bf16.safetensors`, como codificador de texto `qwen_3_4b.safetensors` (variante lumina2) y el VAE `ae.safetensors`. El muestreo del primer grafo (23 nodos) emplea KSampler con 50 pasos, cfg 4, sampler `res_multistep`, scheduler `simple`, denoise 1 y latente de 1024x1536 con batch 1.

Los grafos de prueba con ControlNet (43 y 62 nodos) reducen el latente a 512x472 y combinan un BasicScheduler de 10 pasos con un KSampler de 20 pasos, cfg 3, sampler `euler` y denoise 0.25. Ademas, incorporan una LoRA de destilacion (`Z-Image-Fun-Lora-Distill-4-Steps-2602-ComfyUI.safetensors`) a escala 1, junto con la LoRA entrenada por el nodo i2L (escala 1.1, clip 1). El grafo de 62 nodos anade separacion de muestreo en ruido alto/bajo y escalado por teselas al final del proceso.

No se proporcionan datos sobre el numero de tokens, la composicion del dataset de entrenamiento del modelo base ni sobre tecnicas de alineacion como RLHF o DPO. La innovacion documentada es el propio nodo i2L, que genera una LoRA de estilo a partir de pocas imagenes de referencia y la escribe en el slot de LoRA del grafo en tiempo de ejecucion.

## Capacidades

- Entrenamiento rapido de LoRAs de estilo a partir de 1 a 6 imagenes de referencia mediante la ruta Image-to-LoRA de Z-Image.
- Generacion de imagen texto-a-imagen con el grafo de ComfyUI documentado (UNET Z-Image, CLIP Qwen 3 4B, VAE `ae`).
- Reutilizacion de la LoRA entrenada: se descarga una vez y se inserta en otros grafos de ComfyUI.
- Transferencia de estilo combinada con ControlNet de profundidad para controlar la composicion.
- Muestreo dividido en ruido alto y bajo (high/low noise splitting) en el grafo de 62 nodos.
- Escalado por teselas (tiled upscaling) para resolver imagenes de mayor resolucion.
- Uso de LoRA de destilacion de 4 pasos para acelerar la inferencia en los grafos de prueba.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni multilingues mas alla del ingles del tutorial.

## Casos de uso

- Creacion de LoRAs de estilo personalizadas en minutos: un ilustrador puede aportar entre 1 y 6 imagenes de referencia, ejecutar el nodo i2L y obtener una LoRA reutilizable sin esperar horas de entrenamiento, segun la cifra reportada por el autor.
- Prototipado rapido de direccion de arte: un equipo de diseno puede generar variantes de estilo sobre un mismo concepto texto-a-imagen usando la LoRA entrenada, con latente de 1024x1536 y 50 pasos en el grafo base.
- Control de composicion en produccion grafica: combinando la LoRA i2L con un ControlNet de profundidad, se puede fijar la estructura espacial de la escena mientras se aplica el estilo aprendido, util para storyboards o keyframes.
- Escalado de imagenes generadas: el grafo de 62 nodos incorpora tiled upscaling, adecuado para producir piezas de mayor resolucion a partir del latente de 512x472 sin reentrenar.
- Aceleracion de iteraciones con LoRA destilada: el uso de `Z-Image-Fun-Lora-Distill-4-Steps` permite reducir pasos de muestreo en las pruebas, lo que sirve para explorar variaciones antes de un render final de mas calidad.
- Formacion y documentacion interna: el repositorio sirve como referencia de parametros (pasos, cfg, samplers, escalas de LoRA) para equipos que quieran replicar el pipeline en sus propios grafos de ComfyUI.
- Integracion en flujos de automatizacion de imagen: los grafos pueden ejecutarse en entornos ComfyUI orquestados por herramientas de automatizacion, aunque el repositorio no documenta integraciones de CI/CD especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica cifra de rendimiento mencionada es la del autor: la ruta i2L produciria una LoRA reutilizable en "decenas de segundos". El propio autor aclara que se trata de una observacion del video y no de un benchmark independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no publica requisitos de memoria ni tamanos de los pesos referenciados.
- GPU recomendadas: no disponible. No se indican modelos de GPU en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible. No se puede confirmar si cabe en tarjetas consumer.
- Opciones de despliegue: ComfyUI como entorno principal, con nodos de carga de UNET, CLIP y VAE, KSampler, BasicScheduler, ControlNet y escalado por teselas. Tambien se ofrecen ejecuciones alojadas en RunningHub mediante las paginas enlazadas.
- Latencia y throughput: no disponible, salvo la referencia cualitativa del autor sobre "decenas de segundos" para el entrenamiento de la LoRA.

## Comparativa con modelos similares

| Modelo / recurso | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AI-KSK/ksk-video-179-comfyui-workflows | Repositorio de tutorial y workflows ComfyUI (Z-Image i2L) | no disponible | no disponible | other | Hugging Face (solo README), RunningHub, YouTube, Bilibili |
| Z-Image (modelo base referenciado) | Modelo de difusion texto-a-imagen | no disponible | no disponible | no disponible | Referenciado como `z_image_bf16.safetensors`; no se enlaza su repositorio |
| Qwen 3 4B (codificador de texto referenciado) | Modelo de lenguaje usado como CLIP | 4B (segun el nombre del fichero) | no disponible | no disponible | Referenciado como `qwen_3_4b.safetensors` |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El repositorio no contiene pesos, JSON de workflow ni portadas; solo el README. Los grafos deben obtenerse a traves de la publicacion del episodio o de RunningHub.
- La ruta i2L esta orientada a estilos, no a identidades: el autor reconoce que elementos de contenido del conjunto de entrenamiento se filtran en los resultados y que ese comportamiento no esta corregido.
- La tecnica declarada no funciona con Turbo, lo que descarta la ruta mas rapida de Z-Image.
- Conjuntos de entrenamiento con muchas caras sesgan la salida; menos caras implican menos filtracion.
- La cifra de "decenas de segundos" procede del video del autor y no de una medicion independiente.
- La licencia es "other", lo que exige revisar los terminos concretos antes de cualquier uso comercial; el repositorio no detalla condiciones.
- El idioma del tutorial es unicamente ingles.
- No se documentan sesgos del modelo base ni riesgos de alucinacion visual; al tratarse de generacion de imagen, la fidelidad al prompt no esta evaluada en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/ksk-video-179-comfyui-workflows
- Sitio del autor (AI-KSK): https://aiksk.cc/en/
- Biblioteca de videos y tutoriales de AI-KSK: https://aiksk.cc/en/videos/
- RunningHub - Z Image i2L (Image to LoRA) entrenamiento y prueba: https://www.runninghub.ai/post/2023308170269036545/?inviteCode=rh-v1111
- RunningHub - Z Image i2L (Image to LoRA) entrenamiento y prueba con CN: https://www.runninghub.ai/post/2023370355200495617/?inviteCode=rh-v1111
- RunningHub - Z Image i2L (Image to LoRA) entrenamiento, prueba con CN y escalado: https://www.runninghub.ai/post/2023308180264067074/?inviteCode=rh-v1111
- Tutorial en YouTube: https://www.youtube.com/watch?v=wT9ob7rFONM
- Video original en Bilibili: https://www.bilibili.com/video/BV1qXZMBwEC7
