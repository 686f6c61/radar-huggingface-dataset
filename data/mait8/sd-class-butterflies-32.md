# MaiT8/sd-class-butterflies-32

## Resumen

`MaiT8/sd-class-butterflies-32` es un modelo de difusion para generacion incondicional de imagenes de mariposas, publicado por el usuario MaiT8 en HuggingFace. Se trata de un artefacto educativo derivado del curso *Diffusion Models Class* de Hugging Face, no de un modelo de proposito general ni de un modelo de lenguaje. Su funcion es generar imagenes sinteticas de mariposas de 32x32 pixeles a partir de ruido gaussiano puro, sin condicionamiento textual ni de ningun otro tipo.

El modelo es relevante unicamente en el contexto pedagogico de la unidad 1 del citado curso, donde se ensena a entrenar un UNet de difusion desde cero sobre un dataset pequeno de imagenes de mariposas. No debe confundirse con los modelos de la familia Stable Diffusion: el prefijo `sd` del identificador hace referencia a "small diffusion" o al contexto del curso, no a Stable Diffusion, y el pipeline asociado es `DDPMPipeline`, no un pipeline texto-a-imagen.

Con 18.536.323 parametros (aproximadamente 18,5 millones) y un tamano de repositorio de 0,1 GB, es un modelo extremadamente ligero, pensado para ejecutarse en CPU o en GPUs de gama baja. Su licencia MIT permite uso y redistribucion sin restricciones practicas, aunque su utilidad en produccion es practicamente nula fuera de demos y experimentos docentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion (DDPM) para generacion incondicional de imagenes |
| Parametros totales | 18.536.323 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en fp32/bf16 en safetensors; no se documentan variantes GGUF ni int8) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria diffusers, framework PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un UNet convolucional de difusion denoising, tipico de los modelos DDPM (Denoising Diffusion Probabilistic Models) empleados en la primera unidad del curso *Diffusion Models Class*. El modelo aprende a predecir el ruido anadido a una imagen en cada paso del proceso de difusion directa, y en inferencia aplica el proceso inverso mediante el scheduler `DDPMPipeline` (por defecto, DDPM con 1000 pasos; el nombre `-32` del identificador sugiere imagenes de 32x32 pixeles). El numero de parametros, 18,5 millones, es coherente con un UNet pequeno con bloques de resolucion 32, 16 y 8.

No se dispone de informacion sobre el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset, ni sobre si se aplicaron tecnicas de refinamiento posteriores como RLHF o DPO (irrelevantes en un modelo de difusion incondicional). El dataset de referencia del curso es el conjunto `huggan/smithsonian_butterflies_subset`, que contiene imagenes de mariposas de la coleccion del Smithsonian, pero la model card no confirma explicitamente que este modelo se haya entrenado sobre el ni durante cuantas epocas. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o destilacion.

## Capacidades

- Generacion incondicional de imagenes de mariposas de baja resolucion (32x32 pixeles) a partir de ruido.
- Ejecucion mediante `DDPMPipeline` de la libreria `diffusers`, con una sola llamada (`pipeline().images[0]`).
- No soporta condicionamiento textual: no acepta prompts, etiquetas ni instrucciones.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingues ni procesa lenguaje natural.
- No dispone de modo de razonamiento (thinking), vision de entrada, audio ni ninguna otra modalidad.
- No genera imagenes de alta resolucion ni de dominios distintos al de las mariposas del dataset de entrenamiento.

## Casos de uso

- Docencia y aprendizaje de difusion: el modelo sirve como ejemplo minimo funcional para que estudiantes de la unidad 1 del curso carguen un `DDPMPipeline` y observen la generacion de imagenes a partir de ruido, sin necesidad de infraestructura de GPU.
- Pruebas de integracion de `diffusers`: sirve para verificar que la libreria, el pipeline y el entorno de PyTorch estan correctamente instalados antes de pasar a modelos mayores, dado su tamano de 0,1 GB.
- Experimentos de muestreo y schedulers: permite comparar visualmente el efecto de distintos schedulers (DDPM, DDIM, PNDM) sobre un modelo pequeno y rapido de ejecutar en CPU.
- Demos educativas de bajo coste: puede desplegarse en un Space de HuggingFace gratuito o en un portatil sin GPU para ilustrar el funcionamiento de un modelo generativo en charlas o talleres.
- Investigacion sobre sobreajuste y memorizacion: con solo 18,5 millones de parametros y un dataset pequeno, es un banco de pruebas para estudiar como los modelos de difusion memorizan ejemplos de entrenamiento.
- Referencia para fine-tuning didactico: sirve como punto de partida para que estudiantes entrenen su propio modelo con otro dataset de imagenes pequenas y comparen resultados con este.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como FID, IS, precision/recall, ni comparaciones cuantitativas con otros modelos. Tampoco se documentan tiempos de inferencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32, dado que el modelo tiene 18,5 millones de parametros (unos 74 MB en fp32) mas el overhead de activaciones del UNet.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tambien funciona en CPU.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3050, RTX 4090 y GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: `diffusers` con `DDPMPipeline` (via PyTorch) es la via documentada; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de imagen.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera inferencia en segundos en CPU y en decimas de segundo en GPU, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MaiT8/sd-class-butterflies-32 | 18,5 M | 32x32 | ninguno (incondicional) | MIT | HuggingFace |
| google/ddpm-cifar10-32 | ~35 M | 32x32 | ninguno (incondicional) | Apache 2.0 | HuggingFace |
| google/ddpm-celebahq-256 | ~113 M | 256x256 | ninguno (incondicional) | Apache 2.0 | HuggingFace |
| hf-internal-testing/ddpm-celebahq-256 | ~113 M | 256x256 | ninguno (incondicional) | no disponible | HuggingFace |

La comparativa se limita a otros modelos DDPM incondicionales de referencia; no existen alternativas publicas equivalentes especificas de mariposas a 32x32 con las que comparar directamente. No se dispone de datos de rendimiento (FID u otras metricas) para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo solo genera mariposas de 32x32 pixeles; cualquier uso fuera de ese dominio producira resultados sin sentido.
- No acepta prompts ni condicionamiento: no es un modelo texto-a-imagen y no puede sustituir a Stable Diffusion ni a modelos similares.
- Riesgo elevado de sobreajuste y memorizacion del dataset de entrenamiento, dado el reducido numero de parametros y el dataset pequeno del curso.
- Calidad de imagen muy baja (32x32) para cualquier aplicacion practica de produccion.
- No se documentan sesgos especificos, pero al entrenarse sobre un subconjunto de mariposas del Smithsonian, la diversidad de especies y morfologias esta limitada al dataset.
- La licencia MIT permite uso comercial, pero el modelo carece de utilidad comercial real; ademas, el autor no ofrece garantias ni soporte.
- No se documenta el dataset exacto ni el numero de pasos de entrenamiento, lo que impide reproducir el entrenamiento con fidelidad.
- El identificador puede inducir a confusion con modelos de la familia Stable Diffusion; no tiene relacion con ellos.
- Fecha de creacion indicada como 2026-11-01, posterior a la fecha actual en el momento de redactar esta ficha; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MaiT8/sd-class-butterflies-32
- Curso Diffusion Models Class (unidad 1): https://github.com/huggingface/diffusion-models-class
- Documentacion de `DDPMPipeline` en diffusers: https://huggingface.co/docs/diffusers/api/pipelines/ddpm
- Dataset de referencia del curso (no confirmado para este modelo): https://huggingface.co/datasets/huggan/smithsonian_butterflies_subset
