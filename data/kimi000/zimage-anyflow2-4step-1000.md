# kimi000/ZImage-AnyFlow2-4Step-1000

## Resumen

ZImage-AnyFlow2-4Step-1000 es un checkpoint experimental de generación de texto a imagen (text-to-image) publicado por el usuario `kimi000` en HuggingFace, derivado del modelo base `Tongyi-MAI/Z-Image`. Se trata de una adaptación de investigación de la comunidad que aplica una receta de destilación few-step denominada AnyFlow2 (single-stage, con *independent-query interval TDM*) para reducir la generación a 1024×1024 píxeles a solo 4 evaluaciones del modelo, en lugar de las decenas de pasos habituales en modelos de difusión no destilados. El resultado es un directorio Diffusers completo y autocontenido, con el adaptador LoRA ya fusionado en el transformer en BF16.

El modelo cuenta con 6.186.653.952 parámetros totales (unos 6,19 mil millones) según los pesos en safetensors, y ocupa 20,6 GB en el repositorio, que incluye transformer, text encoder, VAE, tokenizer, scheduler y código de pipeline personalizado. La arquitectura del transformer se describe como *interval-conditioned global-basis transformer*, con 128 bases triangulares continuas en coordenadas globales, y requiere un pipeline propio (`ZImageAnyFlow2Pipeline`) que no es compatible con el `ZImagePipeline` estándar de Diffusers.

Su relevancia es fundamentalmente metodológica: es un artefacto de investigación intermedio (checkpoint EMA exactamente en el paso 1000) que documenta la receta de entrenamiento (`training_config.yml`), los metadatos de exportación (`export_metadata.json`) y el código de inferencia bajo licencia Apache-2.0. No declara ninguna puntuación de benchmark y está entrenado únicamente con prompts en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión "interval-conditioned global-basis transformer" (base Tongyi-MAI/Z-Image); 128 bases triangulares continuas en coordenadas globales |
| Parámetros totales | 6.186.653.952 (~6,19 B), dato real de los safetensors |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (modelo text-to-image; no se documenta la longitud de contexto del text encoder) |
| Tipos de cuantización | BF16 (safetensors). No se documentan GGUF, FP8 ni INT8. El pipeline admite `enable_model_cpu_offload()` |
| Idiomas soportados | Inglés (`en`); otros idiomas no evaluados |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (sharded), junto con tokenizer, text encoder y VAE en el mismo directorio Diffusers |
| Pipeline | text-to-image (`diffusers:ZImageAnyFlow2Pipeline`, requiere `trust_remote_code=True`) |
| Resolución de generación | 1024×1024 (resolución de entrenamiento) |
| Pasos de inferencia | 4 evaluaciones del modelo; sin CFG adicional en inferencia |
| Modelo base | Tongyi-MAI/Z-Image (finetune) |
| Tamaño del repositorio | 20,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El estudiante se inicializa desde `Tongyi-MAI/Z-Image` y se entrena con AnyFlow2 de una sola etapa, empleando *independent-query interval TDM* sobre una formulación de *flow matching* con base continua. La cabeza continua permite en teoría más pasos, pero este experimento entrena trayectorias de exactamente 4 pasos. El adaptador LoRA de entrenamiento tiene rango 256 y alpha 256, y se ha fusionado en el transformer BF16 para la exportación, de modo que no hace falta cargar un adaptador PEFT ni un checkpoint de optimizador. El VAE, el tokenizer y el text encoder permanecen congelados y provienen del modelo base.

La receta de entrenamiento concreta está documentada en el repositorio: resolución 1024×1024 con batch global de 128, presupuesto de rollout del estudiante de 4 pasos, 128 bases triangulares continuas, *time shift* fijo de 6,0, escala de intervalo final de 0,5, objetivo de regresión de velocidad más interval TDM con peso 10, y CFG de profesor de 4,0 durante el entrenamiento (en inferencia no se aplica CFG adicional). La mezcla de prompts fue 50 % MJHQ, 25 % subconjunto inglés de TextAtlas y 25 % un dataset de prompts de modelos de recompensa en inglés. La rejilla temporal cruda de 4 pasos es `[1, 5/7, 3/7, 1/7, 0]`, que tras aplicar el shift 6 queda en `[1, 0.9375, 0.8181818, 0.5, 0]`; es imprescindible usar el scheduler incluido para preservar esa rejilla.

| Ajuste de muestreo | Valor |
|---|---|
| Checkpoint de entrenamiento | Exactamente paso 1000, pesos EMA |
| Presupuesto de rollout del estudiante | 4 |
| Bases continuas | 128 triangulares, coordenadas globales |
| Time shift fijo | 6,0 |
| Escala de intervalo final | 0,5 |
| Objetivo de entrenamiento | Regresión de velocidad + independent-query interval TDM (peso 10) |
| CFG del profesor en entrenamiento | 4,0 |
| CFG en inferencia | Ninguna adicional |
| Rejilla temporal tras shift | `[1, 0.9375, 0.8181818, 0.5, 0]` |

## Capacidades

- Generación de imágenes fotorrealistas a 1024×1024 a partir de prompts descriptivos en inglés, en 4 evaluaciones del modelo.
- Renderizado de texto dentro de la imagen: parte del entrenamiento usa el subconjunto inglés de TextAtlas y el ejemplo de la model card incluye rótulos como "OPEN BOOKS" o tipografía de cartel.
- Generación rápida con muy pocos pasos (few-step), pensada para reducir latencia y coste por imagen frente a muestreo de decenas de pasos.
- Control de composición mediante prompt detallado (escena, iluminación, estilo fotográfico, texto literal entre comillas).
- Semilla reproducible mediante `torch.Generator` (`manual_seed`), útil para comparativas controladas.
- Ejecución con ahorro de memoria mediante *CPU offload* del pipeline.
- No soporta, según la información disponible: tool calling, function calling, razonamiento multi-paso, agentes, visión de entrada, audio ni modo "thinking". Es exclusivamente un modelo de texto a imagen.

## Casos de uso

- Prototipado rápido de creatividades publicitarias: con 4 evaluaciones por imagen y 1024×1024 de salida, permite iterar decenas de variantes de un concepto en el tiempo que un modelo no destilado tardaría en generar unas pocas, usando la semilla para fijar composiciones y variar solo el prompt.
- Generación de carteles y rótulos con texto legible: el entrenamiento con el subconjunto inglés de TextAtlas está orientado a este escenario; se usaría pasando el texto literal entre comillas en el prompt y revisando manualmente el resultado, ya que la model card advierte de posibles errores de renderizado.
- Pruebas de humo y CI de pipelines de imagen: al necesitar solo 4 pasos y un pipeline autocontenido, sirve como caso de prueba reproducible (semilla 0, 1024×1024) para validar que un entorno con Diffusers, CUDA y BF16 funciona antes de desplegar modelos mayores.
- Aumento de datos sintéticos para visión por computador: generación por lotes de imágenes de escenas y objetos con iluminación y estilo controlados por prompt, útil para ampliar datasets de detección o segmentación cuando no se requiere fidelidad fotográfica perfecta.
- Investigación en destilación few-step: el repositorio incluye `training_config.yml`, `export_metadata.json` (con el SHA256 del checkpoint fuente) y el código del sampler, lo que permite reproducir la rejilla temporal, comparar con el modelo base y experimentar con otras escalas de intervalo.
- Maquetación asistida en estudios de diseño: integración vía `DiffusionPipeline.from_pretrained` con `custom_pipeline` y `trust_remote_code=True` para generar borradores de fondo o mockups de escaparate a partir de una descripción, con posterior retoque manual.
- Demostraciones en hardware limitado: con `enable_model_cpu_offload()` o `demo.py --cpu-offload` se puede ejecutar en equipos donde no cabe todo el pipeline en VRAM, a costa de mayor latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que es un checkpoint de investigación intermedio y que no reclama ninguna puntuación de benchmark. Tampoco se publican métricas de latencia, throughput ni FID/CLIP score.

## Requisitos de hardware

- VRAM estimada: el transformer en BF16 son aproximadamente 12,4 GB solo en pesos (6,19 B × 2 bytes). A ello hay que sumar text encoder y VAE, cuyo tamaño no se detalla; el repositorio completo son 20,6 GB. La model card no da cifras de memoria pico y advierte que depende de la longitud del prompt, del tamaño de imagen y del backend de atención.
- GPU recomendadas: no hay recomendaciones oficiales del autor. Por tamaño de pesos, el modelo encaja con holgura en A100 (40/80 GB) y H100, y previsiblemente en RTX 4090 / RTX 3090 (24 GB) en BF16.
- GPUs de consumo: sí es plausible en tarjetas de 24 GB; en tarjetas de 16 GB o menos sería necesario el *CPU offload* (`enable_model_cpu_offload()` o `--cpu-offload`), a costa de latencia. Estas estimaciones son cálculo a partir del número de parámetros, no cifras verificadas por el autor.
- RAM de host: la model card señala que el modelo completo necesita suficiente RAM de sistema durante la carga.
- Opciones de despliegue: Diffusers con `custom_pipeline=<repo_id>` y `trust_remote_code=True` (obligatorio, porque un `ZImagePipeline` estándar no carga estos pesos); script de línea de comandos `demo.py` incluido en el repo; `requirements.txt` con las dependencias. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni ComfyUI (no aplica GGUF al no ser un modelo de lenguaje).
- Latencia y throughput: no disponibles. El único dato objetivo es el coste computacional de 4 evaluaciones del modelo por imagen de 1024×1024.

## Comparativa con modelos similares

| Modelo | Parámetros | Pasos de inferencia | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZImage-AnyFlow2-4Step-1000 | 6,19 B | 4 (sin CFG adicional) | 1024×1024 | Apache-2.0 | HuggingFace, 0 descargas |
| Tongyi-MAI/Z-Image (base) | No disponible en la información | No disponible | No disponible | No disponible en la información | HuggingFace |
| Flux.2 | No disponible | No disponible | No disponible | No disponible | Mencionado en z-image.app, sin datos técnicos |
| Nano Banana Pro (Google) | No disponible | No disponible | No disponible | Propietaria (servicio) | API/servicio, sin datos técnicos |

La comparación relevante es con el modelo base: este checkpoint añade la destilación AnyFlow2 (LoRA rango 256 fusionado) para reducir la generación a 4 pasos, manteniendo congelados VAE, tokenizer y text encoder del base, y sustituye el pipeline estándar por uno personalizado. No se dispone de datos de parámetros, contexto ni rendimiento de las alternativas comerciales o abiertas citadas, por lo que no es posible una comparación cuantitativa.

## Limitaciones y advertencias

- Es un checkpoint de investigación intermedio (paso 1000, EMA) sin puntuación de benchmark declarada; no debe tratarse como un modelo de producción validado.
- El texto renderizado en las imágenes puede contener errores, y las imágenes pueden presentar artefactos; la model card lo advierte de forma explícita.
- Entrenado únicamente con prompts en inglés (MJHQ, subconjunto inglés de TextAtlas y un dataset de prompts de modelos de recompensa en inglés). Otros idiomas no han sido evaluados, por lo que el rendimiento fuera del inglés es desconocido.
- Hereda las capacidades y limitaciones del modelo base Tongyi-MAI/Z-Image, incluyendo los sesgos presentes en sus datos de entrenamiento (no detallados en la información disponible).
- Riesgo de alucinación visual: no se garantiza fidelidad factual de escenas, textos o logotipos generados; el texto entre comillas puede deformarse.
- Requiere ejecutar código remoto del repositorio (`trust_remote_code=True`) y un pipeline personalizado; implica revisar y confiar en los ficheros Python del autor antes de usarlo en entornos sensibles.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías y las condiciones del modelo base deberían verificarse por separado antes de un despliegue comercial.
- Sin mantenimiento conocido: 0 descargas y 0 likes en el momento de la consulta; el autor lo describe como adaptación comunitaria, no como versión oficial.
- El pipeline no es compatible con el `ZImagePipeline` estándar; usar el scheduler suministrado es necesario para preservar la rejilla temporal de 4 pasos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kimi000/ZImage-AnyFlow2-4Step-1000
- Modelo base Tongyi-MAI/Z-Image: https://huggingface.co/Tongyi-MAI/Z-Image
- Resultados de búsqueda web relacionados (sin documentación técnica del modelo): https://z-image.app/en/create
- Resultados de búsqueda web relacionados (sin documentación técnica del modelo): https://www.kimi.ai/resources/best-ai-image-generators
- No se han encontrado en la búsqueda paper, blog técnico, repositorio de código ni demo adicionales específicos de este checkpoint.
