# kimi000/Flux3-Klein-4Step-Raw2Q-2000

## Resumen

Flux3-Klein-4Step-Raw2Q-2000 es un checkpoint experimental de generación de texto a imagen publicado por el usuario kimi000 en Hugging Face. Se trata de un ajuste fino (finetune) del modelo base `black-forest-labs/flux-3-image-klein`, destilado para funcionar en exactamente cuatro pasos de inferencia y exportado en formato Diffusers como un pipeline personalizado autocontenido. El checkpoint corresponde a la actualización de optimizador número 2000 del experimento denominado relative1/raw2q, distinto del también publicado `kimi000/Flux3-Klein-4Step-2000`.

El modelo resuelve el problema de generar imágenes de alta resolución (1024×1024) con un coste de inferencia muy bajo: cuatro llamadas al transformer en lugar de las decenas que requieren los modelos de difusión no destilados. Esto lo hace atractivo para prototipado rápido y despliegues con requisitos de latencia estrictos, aunque su naturaleza experimental y sus limitaciones documentadas en el renderizado de texto lo alejan de un uso en producción sin validación adicional.

La arquitectura es un transformer de difusión nativo de FLUX3 (no el transformer estándar de FLUX.1 en Diffusers), con 5.548.681.984 parámetros totales en precisión BF16 y un VAE nativo que debe permanecer en FP32. El repositorio ocupa 20,3 GB e incluye shards safetensors del transformer, el codificador de texto, el VAE, el tokenizador, la configuración del scheduler y el código del pipeline personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion nativo FLUX3 (no es el transformer estandar de FLUX.1 en Diffusers) |
| Parametros totales | 5.548.681.984 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo texto a imagen; sin ventana de contexto de texto declarada) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; VAE en FP32) |
| Idiomas soportados | no disponible (prompts de entrada en ingles segun la model card) |
| Licencia | flux-kommunity-license (terminos del modelo base en LICENSE.md y NOTICE.md) |
| Formato de pesos | safetensors (shards del transformer, codificador de texto y VAE), pipeline personalizado Diffusers |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion de la familia FLUX3, con un unico cabezal de intervalo relativo ("relative interval head") en el generador. El entrenamiento empleo regresion emparejada raw2q, adaptadores LoRAv2 en atencion, MLP y salida (rango y alpha 256, excluyendo las proyecciones de condicionamiento y de entrada de texto/tiempo), optimizador AdamW con betas (0, 0.999) y un modelo falso independiente de 64 cabezales. Solo se incluye la EMA del generador para inferencia: los 458 tensores de adaptadores EMA estan fusionados en el transformer BF16, de modo que no hace falta cargar adaptadores PEFT ni los pesos base originales.

La destilacion es "prompt-only" y libre de datos, con una mezcla de entrenamiento compuesta por un 50 % de MJHQ, un 25 % de TextAtlas en ingles muestreado y un 25 % de prompts de recompensa en ingles. La resolucion de entrenamiento fue 1024×1024. El scheduler incluido es especifico de este checkpoint: shift de 6,93 y `final_step_size_scale` de 0,3, con una rejilla cruda de `1 - j / 3.3` para `j=0..3` seguida de cero, que no debe sustituirse por el scheduler estandar de FLUX ni por el del export global128 (escala 0,5).

## Capacidades

- Generacion de imagenes a partir de prompts de texto en ingles, con 4 pasos de inferencia y `guidance_scale=1.0`.
- Generacion a 1024×1024 (resolucion de entrenamiento); admite otras resoluciones multiplos de 16 y minimo 64, aunque no fueron el objetivo de entrenamiento.
- Destilacion de guia incorporada: el pipeline no soporta CFG externo ni prompts negativos.
- Renderizado de texto en imagen limitado: la model card documenta palabras omitidas y pasajes largos malformados en las muestras de validacion.
- Sin ampliador de prompts (prompt upsampler); usa plantilla de chat nativa y caracteristicas de texto Qwen.
- Sin soporte declarado de tool calling, agentes, vision de entrada, audio ni modo de razonamiento.

## Casos de uso

- Prototipado rapido de conceptos visuales: con solo cuatro pasos por imagen, permite iterar sobre ideas de diseno o ilustracion en segundos, lo que encaja en flujos de exploracion creativa donde el coste por muestra importa.
- Generacion de imagenes de referencia para documentacion tecnica: util para crear ilustraciones genericas (paisajes, objetos, escenas) que acompanen articulos o manuales, siempre que no se requiera texto legible dentro de la imagen.
- Pruebas de integracion de pipelines Diffusers personalizados: sirve como banco de pruebas para validar carga con `custom_pipeline`, `trust_remote_code` y offload a CPU en entornos de CI.
- Demostraciones de destilacion few-step: investigadoras e investigadores pueden estudiar el comportamiento de un modelo destilado a cuatro pasos frente a su base para analizar perdida de calidad y fidelidad al prompt.
- Generacion de assets para maquetas y wireframes: imagenes de relleno en prototipos de interfaz donde la exactitud semantica no es critica y prima la velocidad.
- Experimentacion con schedulers personalizados: el checkpoint incluye una configuracion de scheduler no estandar (shift 6,93, escala final 0,3) que resulta util para comparar estrategias de muestreo en difusion destilada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta una validacion de integracion: exactamente cuatro llamadas al transformer, diferencia latente nula frente a un sampler de estilo entrenamiento y offload a CPU correcto, ejecutado en una GPU H100 de 80 GB.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 5.548 millones de parametros en BF16, los pesos del transformer ocupan aproximadamente 11 GB, a lo que hay que sumar el codificador de texto y el VAE en FP32.
- GPU recomendadas: la validacion oficial se realizo en una NVIDIA H100 de 80 GB; no se documentan otras GPU probadas.
- GPU de consumo: no confirmado. El pipeline admite `enable_model_cpu_offload()` para reducir el uso de VRAM, lo que podria permitir su ejecucion en GPU de consumo con suficiente memoria, pero no hay datos publicados al respecto.
- Opciones de despliegue: Diffusers con `DiffusionPipeline.from_pretrained(..., custom_pipeline=repo, trust_remote_code=True)`; el repositorio incluye `demo.py`, `requirements.txt` y el pipeline personalizado. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de imagen).
- Latencia y throughput: no disponibles; solo se confirma que la inferencia realiza exactamente cuatro llamadas al transformer.
- Nota de precision: el transformer y el codificador de texto usan BF16, pero el VAE debe permanecer en FP32 (incluidos los buffers de BatchNorm); no aplicar `pipe.to(dtype=torch.bfloat16)` a todo el pipeline.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Pasos de inferencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flux3-Klein-4Step-Raw2Q-2000 | 5.548.681.984 | 1024×1024 (entrenamiento) | 4 | flux-kommunity-license | Hugging Face (17 descargas) |
| black-forest-labs/flux-3-image-klein (base) | no disponible | no disponible | no disponible | flux-kommunity-license | Hugging Face (modelo base) |
| kimi000/Flux3-Klein-4Step-2000 | no disponible | no disponible | 4 | no disponible | Hugging Face (experimento separado del mismo autor) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint experimental: la propia model card lo califica como tal; no hay garantia de calidad para produccion.
- Renderizado de texto imperfecto: se han observado palabras omitidas y pasajes largos malformados en las muestras de validacion; una validacion de ejecucion correcta no equivale a calidad OCR.
- Sin soporte de CFG externo ni prompts negativos: el modelo base ya esta destilado con guia, por lo que el pipeline no acepta estos mecanismos.
- Scheduler obligatorio: debe usarse el scheduler incluido (shift 6,93, `final_step_size_scale` 0,3); sustituirlo por el estandar de FLUX o por el del export global128 degrada los resultados.
- Requiere codigo remoto: es necesario cargar con `custom_pipeline=repo` y `trust_remote_code=True`, lo que implica inspeccionar previamente los archivos Python incluidos.
- Precision estricta: no convertir el VAE a BF16; el pipeline completo en BF16 rompe la decodificacion.
- Reproducibilidad limitada: usar un `torch.Generator` en CPU para semillas nativas; las salidas pueden diferir entre hardware y versiones de librerias.
- Fusion de LoRA en BF16: introduce redondeo normal respecto a una ejecucion sin fusionar.
- Idiomas: los prompts de entrenamiento fueron en ingles; no se declara soporte multilingue.
- Licencia: los terminos del modelo base (flux-kommunity-license) se aplican a los pesos; es necesario revisar LICENSE.md y NOTICE.md para usos comerciales y restricciones.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kimi000/Flux3-Klein-4Step-Raw2Q-2000
- Arbol de archivos del repositorio: https://huggingface.co/kimi000/Flux3-Klein-4Step-Raw2Q-2000/tree/main
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Experimento relacionado del mismo autor: https://huggingface.co/kimi000/Flux3-Klein-4Step-2000
