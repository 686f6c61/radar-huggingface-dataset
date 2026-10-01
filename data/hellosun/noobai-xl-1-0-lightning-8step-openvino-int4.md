# HelloSun/noobai-XL-1.0-Lightning-8Step-OpenVINO-INT4

## Resumen

noobai-XL-1.0-Lightning-8Step-OpenVINO-INT4 es un modelo de generacion de imagenes texto-a-imagen publicado por el usuario HelloSun en HuggingFace. No es un modelo entrenado desde cero: se trata de un artefacto de despliegue que fusiona el modelo base Laxhar/noobai-XL-1.0 (un derivado de SDXL de la familia Illustrious-xl, orientado a ilustracion anime/manga) con la LoRA de destilacion de 8 pasos de ByteDance/SDXL-Lightning (sdxl_lightning_8step_lora.safetensors, fusionada con escala 1.0 en 788 modulos), y despues lo exporta a OpenVINO con cuantizacion INT4.

El problema que resuelve es doble. Por un lado, reduce el coste de inferencia: al integrar la destilacion de Lightning, la generacion baja a 8 pasos con guidance_scale 0.0, frente a los 25-30 pasos con CFG 5-6 que pide el modelo original. Por otro, reduce el peso y el requisito de hardware: mediante cuantizacion weight-only INT4 con NNCF, el modelo pasa de 6,95 GB en FP16 a 2,07 GB (una reduccion aproximada del 70 %, unas 3,35 veces menor), y puede ejecutarse en CPU pura a traves del plugin CPU de OpenVINO, sin GPU ni CUDA.

Es relevante ahora porque demuestra un flujo completo y reproducible de compresion y despliegue en CPU para difusion de imagen: exportacion con optimum-intel, cuantizacion con NNCF (50,9 s de proceso), y medicion publicada de tiempos por paso y de memoria. Su adopcion es, sin embargo, nula hasta la fecha (0 descargas, 0 likes) y no cuenta con validacion externa ni metricas de calidad frente al modelo FP16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer tipo UNet (familia SDXL, base Illustrious-xl / NoobAI-XL); pipeline StableDiffusionXLPipeline (OVStableDiffusionXLPipeline). No es MoE ni SSM |
| Parametros totales | No publicado por el autor. Valores de referencia de la arquitectura SDXL: ~3.500 millones en total (UNet ~2.600 M, dos text encoders ~817 M, VAE ~84 M) |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No aplica como ventana de texto. El prompt se procesa con dos text encoders CLIP con el limite habitual de 77 tokens por encoder en SDXL (dato de referencia de la arquitectura, no confirmado en esta ficha) |
| Tipos de cuantizacion | Weight-only INT4 para unet, text_encoder y text_encoder_2; INT8 para vae_decoder y vae_encoder. Cuantizacion realizada con NNCF 3.4.0 |
| Idiomas soportados | No declarados. Los prompts de ejemplo del autor estan en ingles y el modelo base esta entrenado sobre etiquetas descriptivas tipo Danbooru |
| Licencia | fair-ai-public-license-1.0-sd (FAIPL-1.0-SD), enlazada en https://freedevproject.org/faipl-1.0-sd/ |
| Formato de pesos | OpenVINO IR (pesos convertidos desde safetensors con optimum-intel y guardados como modelos OpenVINO; estructura de directorios compatible con diffusers) |
| Tamano del repositorio | 2,1 GB (modelo INT4: 2,07 GB; FP16 de partida: 6,95 GB) |
| Scheduler | EulerDiscreteScheduler con timestep_spacing="trailing" y prediction_type="epsilon" |
| Resolucion de entrenamiento/inferencia | 1024x1024 recomendada; el modelo base admite 768x1344, 832x1216, 896x1152, 1152x896, 1216x832 y 1344x768 |
| Fecha de creacion | 30 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente es SDXL: un UNet de difusion latente que opera sobre un espacio latente generado por un VAE, condicionado por dos text encoders CLIP (uno de ellos OpenCLIP ViT-bigG, segun la arquitectura estandar de SDXL). El modelo base Laxhar/noobai-XL-1.0 pertenece a la familia Illustrious-xl y esta especializado en ilustracion estilo anime/manga. Sobre esa base se ha fusionado la LoRA de destilacion de 8 pasos de ByteDance/SDXL-Lightning, que reduce drasticamente el numero de pasos de muestreo necesarios.

No se ha entrenado ningun parametro nuevo para este repositorio: el trabajo es de fusion, exportacion y cuantizacion. El flujo documentado es: exportacion a FP16 con optimum-intel 2.2.0 (sobre optimum 2.3.0, OpenVINO 2026.4.0, diffusers 0.37.1 y transformers 4.57.6), seguida de cuantizacion weight-only INT4 con NNCF 3.4.0 en 50,9 segundos. No se documentan datos de entrenamiento propios, ni etapas de RLHF o DPO, ni innovaciones de atencion (no hay decodificacion especulativa ni atencion lineal, ya que no es un modelo de lenguaje). La innovacion tecnica relevante es la combinacion de destilacion por pasos y cuantizacion de pesos para habilitar inferencia en CPU.

## Capacidades

- Generacion de imagenes texto-a-imagen a partir de prompts descriptivos, con especializacion en ilustracion anime/manga y estilos derivados (fotorealismo, ilustracion tradicional china a tinta, escenas cyberpunk).
- Generacion en 8 pasos de muestreo con guidance_scale 0.0, frente a los 25-30 pasos y CFG 5-6 del modelo base sin acelerar.
- Inferencia en CPU pura mediante el plugin CPU de OpenVINO, sin GPU ni CUDA.
- Soporte de resoluciones SDXL estandar: 1024x1024 y formatos alternativos 768x1344, 832x1216, 896x1152, 1152x896, 1216x832 y 1344x768.
- Reproducibilidad determinista mediante semilla fija (los ejemplos del autor usan seeds 42 a 46).
- Carga directa con OVStableDiffusionXLPipeline.from_pretrained() y compile=True, con estructura de directorios compatible con diffusers.
- Generacion por lotes: el repositorio incluye un script de batch y benchmark (generate5.py) y otro de estilos (generate_styles.py).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, thinking mode, vision, audio ni comprension de texto: es exclusivamente un modelo generativo de imagen.
- No se documentan capacidades de generacion de texto dentro de la imagen (renderizado tipografico), que en la familia SDXL suele ser limitada.

## Casos de uso

- Ilustracion anime/manga en equipos sin GPU: el modelo se ejecuta integramente en CPU con 2,07 GB de pesos, lo que permite generar ilustraciones en portatiles de oficina o estaciones de trabajo sin tarjeta grafica dedicada.
- Prototipado de concept art y storyboards: con 8 pasos y tiempos de 18-21 segundos por imagen a 1024x1024, un ilustrador puede iterar decenas de variaciones de un concepto en pocos minutos usando semillas distintas para explorar direcciones visuales.
- Generacion de assets para videojuegos indie: el modelo base esta especializado en estilo anime, util para retratos de personajes, iconos, ilustraciones de cartas y fondos de escena en producciones pequenas con presupuesto limitado.
- Despliegue en entornos aislados (air-gapped) o con requisitos de privacidad: al no depender de APIs en la nube ni de GPU, los prompts y las imagenes no salen de la infraestructura local, algo relevante en sectores con datos sensibles.
- Generacion por lotes para investigacion sobre cuantizacion: el repositorio incluye script de batch y mediciones de tiempo por paso, lo que permite reproducir la comparativa FP16 frente a INT4 y estudiar el impacto de la cuantizacion weight-only en la calidad percibida.
- Creacion de datasets sinteticos de imagenes etiquetadas: la reproducibilidad por semilla y la generacion por lotes permiten producir conjuntos de imagenes controlados para experimentos de vision por computador o para aumentar datos de entrenamiento.
- Reduccion de coste frente a servicios en la nube: en volumenes moderados de generacion, ejecutar el modelo en CPU propia elimina el coste por imagen de las APIs comerciales y evita limites de cuota.
- Demostraciones educativas de pipelines OpenVINO: sirve como ejemplo didactico de exportacion, cuantizacion y despliegue de un modelo de difusion completo con optimum-intel y NNCF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no aplican MMLU, HumanEval ni GSM8K a un modelo de difusion de imagen, y no se proporcionan metricas FID, CLIP score ni comparativas de calidad frente al modelo FP16).

El autor si publica mediciones de latencia en CPU para el modelo cuantizado, con parametros fijos de 8 pasos, guidance_scale 0.0, 1024x1024, scheduler Euler con espaciado trailing y semillas 42 a 46:

| Ejemplo | Semilla | Resolucion | Pasos | Tiempo en CPU |
|---|---|---|---|---|
| 01_hanfu | 42 | 1024x1024 | 8 | 20,6 s |
| 02_astronaut | 43 | 1024x1024 | 8 | 18,8 s |
| 03_taipei | 44 | 1024x1024 | 8 | 18,2 s |
| 04_shiba | 45 | 1024x1024 | 8 | 18,1 s |
| 05_ink | 46 | 1024x1024 | 8 | 17,8 s |

Promedio aproximado: 18,7 segundos por imagen a 1024x1024. El proceso de cuantizacion con NNCF tardo 50,9 segundos. No se especifica el modelo de CPU empleado en las mediciones, ni el consumo de memoria pico, ni el throughput en generacion por lotes.

## Requisitos de hardware

- Inferencia en CPU exclusivamente (plugin CPU de OpenVINO); no requiere GPU ni CUDA.
- Peso en disco del modelo cuantizado: 2,07 GB (frente a 6,95 GB en FP16). El repositorio completo ocupa 2,1 GB.
- Memoria RAM: el autor afirma haber medido el RSS de pico del proceso, pero el valor concreto no esta disponible en la informacion proporcionada.
- CPU recomendada: procesador x86-64 con soporte de instrucciones vectoriales modernas (AVX2 o AVX-512) para aprovechar el plugin CPU de OpenVINO. El modelo exacto de CPU usado en las pruebas no esta disponible.
- GPU: no aplica; no se documenta soporte para ejecucion en GPU con esta build INT4, aunque OpenVINO dispone de plugins para Intel GPU e iGPU no utilizados en estas pruebas.
- Cabe en cualquier equipo de consumo: al ser CPU-only y 2,07 GB, no hay requisito de VRAM. No se confirma compatibilidad con plataformas ARM (Apple Silicon, Raspberry Pi) en la documentacion disponible.
- Opciones de despliegue: OpenVINO Runtime a traves de optimum-intel (OVStableDiffusionXLPipeline.from_pretrained con compile=True). No aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia estimada: 17,8-20,6 s por imagen a 1024x1024 en 8 pasos, segun las mediciones del autor. Throughput en lote: no disponible.
- Dependencias exactas probadas: diffusers 0.37.1, transformers 4.57.6, tokenizers 0.22.0, huggingface-hub 0.35.1, optimum 2.3.0, optimum-intel 2.2.0, openvino 2026.4.0, nncf 3.4.0, torch, pillow, psutil, safetensors, accelerate, sentencepiece y protobuf.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Pasos de inferencia | Tamano de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| noobai-XL-1.0-Lightning-8Step OpenVINO INT4 (este modelo) | SDXL cuantizado INT4, CPU | No publicado (~3.500 M segun arquitectura SDXL) | 8, guidance 0.0 | 2,07 GB | FAIPL-1.0-SD | HuggingFace, OpenVINO IR |
| Laxhar/noobai-XL-1.0 | SDXL base sin acelerar | No publicado (~3.500 M segun arquitectura SDXL) | 25-30, CFG 5-6 | No disponible | No disponible | HuggingFace |
| ByteDance/SDXL-Lightning | LoRA de destilacion para SDXL | No aplica (LoRA sobre SDXL) | 1, 2, 4 u 8 segun variante | No disponible | No disponible | HuggingFace |
| HelloSun/FLUX.2-klein-4B-OpenVINO-INT4 | Modelo de difusion alternativo cuantizado, mismo autor | ~4.000 M (indicado en el nombre) | No disponible | No disponible | No disponible | HuggingFace, OpenVINO IR |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Los parametros de muestreo estan fijados por la destilacion: el autor advierte explicitamente de que no se deben aumentar los pasos por encima de 8 ni usar guidance_scale distinto de 0.0. Los ajustes del modelo original (25-30 pasos, CFG 5-6) solo aplican a la version sin acelerar.
- Con guidance_scale 0.0, el prompt negativo pierde practicamente todo su efecto, por lo que las tecnicas habituales de filtrado por negative prompt dejan de ser utiles.
- La cuantizacion weight-only INT4 puede degradar la fidelidad de la imagen respecto al modelo en FP16. No se aporta ninguna metrica de calidad (FID, CLIP score, comparativa visual ciega) que cuantifique esa perdida.
- Riesgo de alucinacion visual inherente a los modelos de difusion: el modelo puede generar anatomia incorrecta (manos, dedos), texto ilegible o elementos incoherentes con el prompt, especialmente en escenas complejas.
- Sesgos del dataset: al derivar de un modelo entrenado sobre ilustracion anime y etiquetas tipo Danbooru, hereda los sesgos de representacion y estilo de ese corpus, con tendencia a un estilo visual concreto y menor variedad etnica y cultural.
- Capacidad potencial de generar contenido para adultos: el modelo base y los prompts del autor incluyen etiquetas de seguridad (safe), lo que sugiere que el modelo no filtrado puede producir contenido NSFW. La licencia FAIPL-1.0-SD establece condiciones especificas al respecto que deben revisarse antes de cualquier despliegue publico.
- Restricciones de licencia: FAIPL-1.0-SD no es una licencia de codigo abierto aprobada por la OSI. El uso comercial esta sujeto a condiciones que no se detallan en la informacion proporcionada; es imprescindible leer el texto completo en el enlace de licencia antes de usarlo en produccion. Ademas, el modelo base Laxhar/noobai-XL-1.0 puede imponer condiciones adicionales.
- Idioma: no se declaran idiomas soportados y los prompts de ejemplo estan en ingles con etiquetas estilo Danbooru. El rendimiento con prompts en castellano no esta documentado.
- Adopcion y validacion nulas: el repositorio registra 0 descargas y 0 likes, no hay terceros que hayan reproducido los resultados y no existe validacion independiente de las mediciones de latencia.
- Documentacion incompleta: la model card esta redactada en chino, la seccion de estructura de ficheros aparece truncada en la informacion disponible y no se especifica la CPU usada en las pruebas ni el consumo de memoria pico.
- Las imagenes de 512 px incluidas en el repositorio son reescalados LANCZOS de las salidas de 1024 px, no inferencias independientes, por lo que no aportan datos de rendimiento a esa resolucion.
- Latencia no apta para tiempo real: 18-21 segundos por imagen en CPU limita su uso a generacion por lotes o a interfaces asincronas, no a aplicaciones interactivas con respuesta inmediata.
- La fecha de creacion del repositorio (30 de septiembre de 2026) es posterior a la mayoria de versiones de las herramientas citadas; conviene verificar la coherencia del entorno antes de reproducir el flujo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HelloSun/noobai-XL-1.0-Lightning-8Step-OpenVINO-INT4
- Modelo base: https://huggingface.co/Laxhar/noobai-XL-1.0
- LoRA de destilacion: https://huggingface.co/ByteDance/SDXL-Lightning
- Modelo de referencia del mismo autor: https://huggingface.co/HelloSun/FLUX.2-klein-4B-OpenVINO-INT4
- Texto de la licencia: https://freedevproject.org/faipl-1.0-sd/
- Scripts incluidos en el repositorio: inference_int4.py, generate5.py y generate_styles.py (accesibles desde la pagina del modelo)

Nota: la busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo ni sobre sus componentes; los unicos resultados obtenidos fueron sitios sin relacion con el contenido, por lo que no se incluyen.
