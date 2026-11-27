# anr2me/Kandinsky-6.0-VSR-2.0-distilled2steps-INT8-ConvRot-Repackaged

## Resumen

Kandinsky-6.0-VSR-2.0-distilled2steps-INT8-ConvRot-Repackaged es una cuantizacion INT8 del modelo de superresolucion de video Kandinsky 6.0 VSR 2.0, en su variante destilada a 2 pasos de muestreo. El modelo original lo desarrolla Kandinsky Lab y esta publicado en Hugging Face como `kandinskylab/Kandinsky-6.0-VSR-2.0-distilled2steps-Diffusers`. Esta version la publica el usuario `anr2me` y aplica una conversion post-entrenamiento peso a peso con rotacion de Hadamard (metodo ConvRot), sin datos de calibracion.

El paquete redistribuye los tres componentes del pipeline en formato INT8 ConvRot: el transformer de difusion, el VAE (KVAE) y el modelo de escalado latente (LatentUpscaler). La reduccion de tamano es notable: el transformer pasa de 3,19 GB en bf16 a 1,96 GB; el VAE de 6,96 GB a 2,46 GB; y el upscaler de 7,31 GB a 4,13 GB. El repositorio completo ocupa 8,5 GB.

La relevancia practica esta en que permite ejecutar un pipeline de superresolucion de video en entornos con VRAM limitada, especialmente dentro de ComfyUI, mediante nodos personalizados que leen los pesos INT8 y las configuraciones embebidas en las cabeceras de los safetensors. La licencia MIT del modelo original se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para superresolucion de video (transformer de difusion + VAE KVAE + escalador latente), variante destilada a 2 pasos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 peso a peso con rotacion de Hadamard (ConvRot), grupo de 256; capas sensibles en tipo original |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (INT8 ConvRot, con configuracion embebida en la cabecera) |

Desglose de componentes y tamanos:

| Componente | Original (bf16) | Esta version (INT8) | Tensores cuantizados |
|---|---|---|---|
| Transformer de difusion | 3,19 GB | 1,96 GB | 192 |
| VAE (KVAE) | 6,96 GB | 2,46 GB | 59 |
| LatentUpscaler | 7,31 GB | 4,13 GB | 76 |

## Arquitectura y entrenamiento

El modelo base es un pipeline de difusion para superresolucion de video (video super-resolution, VSR) desarrollado por Kandinsky Lab, en variante destilada a 2 pasos, lo que reduce el numero de evaluaciones del modelo necesarias en inferencia. El pipeline se compone de tres redes: un transformer de difusion, un VAE denominado KVAE y un modelo de escalado latente. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

La innovacion tecnica de esta publicacion es la conversion de cuantizacion: se aplica una escala INT8 unica por fila de salida y, antes de cuantizar, una rotacion de Hadamard con tamano de grupo 256 para dispersar los valores atipicos (metodo ConvRot, arXiv 2512.03673). La conversion no usa datos de calibracion. Se mantienen en el tipo de dato original las normas, los embeddings, los sesgos, las capas de modulacion y cualquier capa cuya tasa de error relativo supere 0,02; el archivo `quantization_report.json` documenta capa por capa. El formato Conv3d INT8 es una extension del formato `int8_tensorwise` y solo lo leen los nodos del repositorio del autor. Cada safetensors incluye su configuracion en la cabecera bajo la clave `kandinsky6.component_config` (y `kandinsky6.scheduler_config` en el transformer), y un archivo externo `<file-name>.json` tiene prioridad sobre la configuracion embebida.

## Capacidades

- Superresolucion de video: aumenta la resolucion de secuencias de video mediante un pipeline de difusion destilado a 2 pasos.
- Escalado latente: incluye un modelo dedicado de LatentUpscaler para el aumento de resolucion en el espacio latente.
- Reconstruccion via VAE: el KVAE codifica y decodifica el video en el espacio latente del pipeline.
- Inferencia de pocos pasos: la variante destilada reduce el muestreo a 2 pasos, lo que disminuye el coste computacional frente a pipelines de difusion convencionales.
- Integracion en ComfyUI: soporte mediante nodos personalizados (`Load Diffusion Model`, `Kandinsky6 SR VAE Loader (INT8 ConvRot)`, `Kandinsky6 SR Latent Upscaler Loader (INT8 ConvRot)`).
- Generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes y capacidades multilingues: no disponibles; el modelo es un componente de difusion para VSR, no un modelo de lenguaje.

## Casos de uso

- Restauracion de metraje de archivo: el pipeline eleva la resolucion de videos antiguos o de baja calidad, y el VAE KVAE reconstruye los fotogramas en el espacio latente; la variante INT8 permite procesar clips en GPUs con menos VRAM que la version bf16.
- Reescalado de contenido para plataformas de streaming: se puede integrar en un pipeline de postproduccion para llevar material SD a HD o superior, usando el LatentUpscaler para el aumento en espacio latente y el transformer destilado a 2 pasos para reducir el tiempo por clip.
- Preprocesado para pipelines de vision por computador: mejorar la resolucion de videos de entrada antes de tareas de deteccion o seguimiento, donde el detalle espacial adicional mejora la precision de los modelos posteriores.
- Prototipado en ComfyUI: los nodos del repositorio del autor permiten montar un flujo de VSR en ComfyUI sin parchear los nodos oficiales, util para iterar rapidamente en diseno de pipelines.
- Despliegue en estaciones de trabajo con VRAM limitada: la reduccion de 17,46 GB a 8,55 GB en el conjunto de los tres componentes facilita ejecutar el pipeline en GPUs de consumo de gama alta en lugar de exigir aceleradores de datacenter.
- Evaluacion de tecnicas de cuantizacion: el repositorio sirve como referencia practica del metodo ConvRot aplicado a modelos de difusion de video, con informe de error por capa para comparar fidelidad frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la calidad se comprobo mediante el error de pesos, no mediante video generado, y recomienda comparar los primeros resultados con el modelo original, prestando especial atencion al VAE y al LatentUpscaler.

## Requisitos de hardware

- VRAM estimada: el conjunto de los tres componentes INT8 suma 8,55 GB de pesos; con overhead de activaciones y buffers de inferencia, se recomienda al menos 12-16 GB de VRAM para el pipeline completo, aunque no se dispone de una cifra oficial.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano de pesos, una RTX 4090 (24 GB) o una A100/H100 ofrecen margen holgado.
- GPU de consumo: el pipeline INT8 podria caber en GPUs de 16 GB o mas, aunque el autor no confirma requisitos minimos.
- Opciones de despliegue: ComfyUI con el nodo pack oficial `kandinsky6-sr` y los nodos personalizados del repositorio `anr2me/kandinsky6-sr-int8-convrot`. Los nodos oficiales por si solos no pueden leer los pesos INT8 ni las configuraciones embebidas.
- Instalacion: descarga con `hf download anr2me/Kandinsky-6.0-VSR-2.0-distilled2steps-INT8-ConvRot-Repackaged --include "diffusion_models/*" "vae/*" "upscale_models/*" --local-dir ComfyUI/models` y clonado del repositorio de nodos en `ComfyUI/custom_nodes/`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (INT8 ConvRot) | no disponible | no disponible | safetensors INT8 | MIT | Hugging Face, ComfyUI con nodos propios |
| kandinskylab/Kandinsky-6.0-VSR-2.0-distilled2steps-Diffusers (bf16) | no disponible | no disponible | safetensors bf16 | MIT | Hugging Face, diffusers |
| Otros modelos de superresolucion de video | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de otros modelos comparables en la informacion proporcionada; la comparativa se limita al modelo base en bf16 frente a esta version cuantizada.

## Limitaciones y advertencias

- La conversion es post-entrenamiento y solo de pesos; la calidad no se valido con video generado, solo con el error de pesos. Es imprescindible comparar los resultados con el modelo original.
- El VAE y el LatentUpscaler son los componentes mas delicados; el autor recomienda revisarlos con especial cuidado.
- El formato Conv3d INT8 es una extension propietaria del formato `int8_tensorwise`; solo lo leen los nodos del repositorio del autor y el loader incluido. Los nodos oficiales de `kandinsky6-sr` no pueden leer estos archivos.
- La configuracion embebida en la cabecera puede ser incorrecta; en ese caso hay que aportar un archivo externo `<file-name>.json` (o `<file-name>.scheduler.json` para el sampler).
- No hay informacion sobre sesgos, riesgo de alucinacion, limitaciones de idioma ni comportamiento en produccion para este modelo.
- La licencia MIT del modelo original se mantiene, lo que permite uso comercial, pero conviene verificar los terminos del modelo base y de los nodos personalizados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una publicacion reciente y sin validacion comunitaria.
- El identificador de arXiv 2512.03673 corresponde a un preprint; el metodo ConvRot no esta validado de forma independiente en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/anr2me/Kandinsky-6.0-VSR-2.0-distilled2steps-INT8-ConvRot-Repackaged
- Modelo base: https://huggingface.co/kandinskylab/Kandinsky-6.0-VSR-2.0-distilled2steps-Diffusers
- Nodos personalizados INT8 ConvRot: https://github.com/anr2me/kandinsky6-sr-int8-convrot
- Nodo pack oficial kandinsky6-sr: https://github.com/kandinskylab/kandinsky-6-sr/tree/main/comfyui
- Paper del metodo ConvRot: https://arxiv.org/abs/2512.03673
- Repositorio de referencia con la misma clave de configuracion: https://huggingface.co/shadwosii/Kandinsky-6.0
