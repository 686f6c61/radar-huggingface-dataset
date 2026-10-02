# RunningHubAI/rh-finepornv31turbofp8-v3fixfp8-unet

## Resumen

rh-finepornv31turbofp8-v3fixfp8-unet es un fichero de pesos de tipo UNET para generacion y edicion de imagenes a partir de texto, publicado por la cuenta RunningHubAI en nombre del autor identificado como @darkHUB. El repositorio no contiene un modelo entrenado desde cero: segun la propia model card, se trata de un ajuste fino derivado de "krea2", distribuido en formato safetensors y cuantizado en FP8, con un unico fichero de 12 533 MiB (aproximadamente 12,24 GiB) que suma los 13,1 GB del repositorio completo.

El modelo esta etiquetado con las categorias comfyui, unet e image-text-to-image, lo que lo situa en el ecosistema de ComfyUI y en la plataforma propietaria RunningHub. Su funcion declarada es la de peso UNET para pipelines de edicion de imagen (image edit), es decir, la red que aplica la difusion dentro de un flujo que normalmente combina un codificador de texto, un VAE y el sampler. El autor indica que puede cargarse tanto en ComfyUI como en RunningHub y en Hugging Face.

Es relevante ahora por su caracter de artefacto de inferencia optimizado: la cuantizacion FP8 reduce el peso a la mitad aproximadamente frente a FP16 y lo hace manejable en GPU de consumo, mientras que el sufijo "TURBO" del nombre apunta a un ajuste destilado para inferencia en pocos pasos. La informacion publica es, no obstante, muy escasa: no se declaran parametros, licencia, idiomas ni resultados de evaluacion, y el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion (image edit); no disponible el detalle de bloques, atencion o variante concreta |
| Parametros totales | no disponible (el fichero FP8 de 12 533 MiB es coherente con un orden de magnitud de ~13 000 millones de parametros, pero el autor no lo confirma) |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto de texto; se desconoce la resolucion nativa y el limite de tokens de prompt) |
| Tipos de cuantizacion | FP8 (fichero unico `finepornV31TURBOFP8_v3FIXFP8.safetensors`); no se publican variantes GGUF, NF4 o INT8 |
| Idiomas soportados | no disponible (los prompts de texto dependen del codificador de texto del pipeline, no incluido en este repositorio) |
| Licencia | no disponible. La model card indica "Published by RunningHub on behalf of the author. Copyright remains with the author. Follow the original project or upstream license", sin especificar terminos concretos |
| Formato de pesos | safetensors (un solo fichero, 12 533 MiB) |
| Modelo base declarado | krea2 |
| Tamano del repositorio | 13,1 GB |
| Fecha de creacion / actualizacion | 2026-10-02 / 2026-10-02 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El autor no publica detalles de arquitectura mas alla de la etiqueta "unet" y de la funcion declarada de edicion de imagen. En el ecosistema de difusion, un UNET de este tipo sustituye al componente de ruido del pipeline y se combina con un VAE y un codificador de texto externos; el repositorio, sin embargo, solo aporta los pesos del UNET, de modo que cualquier reproduccion exige disponer por separado del resto de componentes del pipeline original de krea2. El sufijo "TURBO" del nombre del fichero sugiere una destilacion orientada a pocos pasos de muestreo y el sufijo "FP8" indica cuantizacion a 8 bits en coma flotante, con el consiguiente reescalado de pesos respecto al modelo original en BF16 o FP16. No se indica si la cuantizacion es estatica o con escalas por tensor, ni si se aplico alguna correccion para el sesgo del prompt negativo.

Tampoco hay informacion sobre el entrenamiento: se desconoce el numero de imagenes o pasos, la composicion del dataset, la resolucion de entrenamiento, el uso de tecnicas como LoRA, DreamBooth, ajuste por refuerzo o preferencias humanas, ni si el ajuste se hizo sobre el modelo base completo o sobre un derivado. La model card se limita a indicar "Finetuned from: krea2" y a enlazar la plataforma de entrenamiento de RunningHub. Cualquier afirmacion sobre metodologia, esquema de ruido o regularizacion seria una suposicion, por lo que no se incluye aqui.

## Capacidades

- Generacion de imagen a partir de texto (image-text-to-image) mediante el pipeline correspondiente en ComfyUI o RunningHub.
- Edicion de imagen: la model card clasifica el modelo como "UNET (image edit)", lo que implica su uso en flujos de transformacion de una imagen de entrada guiada por prompt.
- Integracion directa como nodo de carga de UNET en ComfyUI (`Load Diffusion Model` / `UNETLoader`) y en flujos guardados de la plataforma RunningHub.
- Peso pre-cuantizado en FP8, lo que reduce el consumo de VRAM frente a versiones en precision completa.
- Orientacion a inferencia rapida segun el sufijo "TURBO" del nombre, sin que el autor publique el numero de pasos recomendado.
- Soporte de tool calling, function calling o agentes: no aplica (no es un modelo de lenguaje).
- Capacidades multimodales mas alla de imagen: no disponibles. No se declara soporte de audio, video ni vision de entrada mas alla de la imagen editada.
- Capacidades multilingues: no disponibles; dependen del codificador de texto que se empareje con el UNET.

## Casos de uso

- Edicion de imagenes en flujos de ComfyUI: el UNET se carga como nodo de difusion dentro de un grafo que aporte VAE y codificador de texto, de modo que se puede encadenar con nodos de ControlNet, inpaint o upscale para tareas de retoque.
- Generacion por lotes en plataforma alojada: al estar publicado tambien en RunningHub, permite ejecutar el mismo peso en la nube a traves de su API sin disponer de GPU local, util para produccion con picos de demanda.
- Creacion de contenido ilustrado para plataformas para adultos: por el nombre del repositorio y la comunidad asociada (dark HUB), el ajuste esta claramente orientado a imagenes para adultos; su encaje exige verificar la legislacion aplicable, la verificacion de edad y las condiciones de la plataforma de destino.
- Prototipado de personajes y estilos consistentes: combinado con LoRA o IP-Adapter en ComfyUI, el UNET puede servir como base para mantener un estilo visual estable a lo largo de una serie de imagenes.
- Evaluacion de cuantizacion FP8: el repositorio es un caso practico para medir la perdida de calidad frente al peso original en BF16, comparando salidas con la misma semilla, prompt y sampler.
- Canal de distribucion para el autor: el fichero actua como artefacto publicable para alimentar la API de RunningHub y los flujos de la comunidad de Telegram y Discord del autor, mas que como modelo autocontenido.
- Restauracion o mejora de imagenes existentes: en flujos image-to-image con denoising parcial, puede emplearse para refinar detalle o corregir artefactos sin regenerar por completo la composicion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, evaluaciones humanas ni comparaciones cuantitativas con el modelo base krea2 u otros pesos similares, y el repositorio no aporta scripts de evaluacion.

## Requisitos de hardware

- VRAM para el peso: el fichero safetensors ocupa 12 533 MiB, por lo que la carga del UNET en FP8 requiere aproximadamente 12,3 GB solo para los pesos, antes de contar activaciones, VAE y codificador de texto.
- VRAM total estimada del pipeline: en torno a 14-18 GB para una ejecucion comoda a resoluciones moderadas, dependiendo de la resolucion de salida, el tamano de lote y si el VAE se ejecuta en GPU o en CPU.
- GPU consumer compatibles: tarjetas con 16 GB o mas, como RTX 4080, RTX 4090, RTX 5080/5090 en sus variantes de 16-32 GB, y RTX 3090/4090 de 24 GB. En GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) la carga es ajustada y probablemente exija descarga de componentes a RAM del sistema.
- GPU profesionales: A100 40/80 GB, H100, L40S y A6000 sin problema de capacidad; su ventaja aqui seria el throughput en lotes grandes.
- Opciones de despliegue: ComfyUI como entorno nativo declarado, la plataforma RunningHub (cloud y API), y en principio cualquier cargador de safetensors que acepte pesos UNET; no se declaran variantes GGUF, por lo que llama.cpp y Ollama no aplican y no hay ruta oficial documentada para vLLM o TGI, orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. No se publican tiempos por imagen, numero de pasos recomendado ni resolucion de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| rh-finepornv31turbofp8-v3fixfp8-unet | no disponible (~13 000 millones inferidos del tamano FP8) | no disponible | no disponible | ComfyUI, RunningHub, Hugging Face | no disponible |
| krea2 (modelo base declarado) | no disponible | no disponible | depende del proyecto original | segun su distribucion oficial | no disponible |
| Otros ajustes UNET de la comunidad | no disponible | no disponible | variable | Hugging Face, Civitai | no disponible |

No se dispone de datos verificables sobre alternativas comparables en la informacion proporcionada, por lo que la comparacion cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, curvas de perdida ni comparacion con el modelo base, de modo que la calidad real del ajuste no puede verificarse a partir de la informacion publicada.
- Riesgo de alucinacion visual: como cualquier modelo de difusion, puede generar anatomias incorrectas, texto ilegible en la imagen, artefactos en manos y caras, y detalles incoherentes con el prompt, especialmente en resoluciones alejadas de las de entrenamiento.
- Contenido para adultos: el nombre del repositorio y la comunidad asociada (dark HUB, con canales de Telegram y Discord) indican una orientacion explicita a contenido NSFW. Su uso exige cumplimiento estricto de la legislacion sobre mayoria de edad, verificacion de edad, y puede estar prohibido en plataformas de pago, tiendas de aplicaciones o servicios en la nube con politicas restrictivas.
- Licencia indeterminada: la model card no especifica terminos. Se remite al proyecto original y al licenciamiento upstream de krea2, sin aclarar si el uso comercial esta permitido, restringido o sujeto a acuerdo. Antes de cualquier despliegue en produccion debe confirmarse con el autor o con el titular de krea2.
- Dependencia del pipeline: el repositorio solo contiene el UNET. Sin el VAE y el codificador de texto compatibles con el modelo base, los pesos son inutilizables; no se documenta la combinacion exacta recomendada ni las versiones de ComfyUI probadas.
- Falta de datos de parametros y arquitectura: no es posible planificar con precision requisitos de memoria, escalado o compatibilidad con herramientas como diffusers sin inspeccionar el safetensors por cuenta propia.
- Idiomas: no se declara soporte de idiomas para los prompts; el comportamiento multilingue dependera enteramente del codificador de texto que se empareje.
- Repositorio sin traccion: 0 descargas y 0 likes, sin issues ni discusion, lo que reduce la probabilidad de encontrar soporte de la comunidad ante problemas de carga o compatibilidad.
- Trazabilidad limitada: el autor se identifica con un alias (@darkHUB) y el modelo se publica a traves de una cuenta de plataforma (RunningHubAI), lo que dificulta atribuir responsabilidades o auditar el origen de los datos de entrenamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-finepornv31turbofp8-v3fixfp8-unet
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2082863743479300097
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2025565893677027330
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Llamada a la API de RunningHub: https://www.runninghub.ai/call-api
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Ejemplo de API con Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Comunidad en Telegram (dark HUB): https://t.me/darken_HUB
- Comunidad en Discord (dark HUB): https://discord.gg/TMHFXk3raN
