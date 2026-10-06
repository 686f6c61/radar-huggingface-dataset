# kandinskylab/Kandinsky-6.0-Lite-distill-5s-Diffusers

## Resumen

Kandinsky 6.0 Lite es un modelo de difusion de la familia Kandinsky 6.0 Video, desarrollado por KandinskyLab, disenado para generar video de 5 segundos con audio sincronizado a 44 kHz. Esta variante concreta, `Kandinsky-6.0-Lite-distill-5s-Diffusers`, es un checkpoint destilado del modelo Lite de 3B parametros (3.177.988.112 segun los safetensors) que muestrea en 10 pasos mediante el scheduler PiFlow, lo que reduce notablemente el coste de inferencia frente a los checkpoints de 50 pasos.

El modelo cubre dos modos: text-to-audio-video (T2AV) e image-to-audio-video (TI2AV), con salida por defecto de 121 fotogramas a 24 fps (5 segundos) y resoluciones como 480x864. Incluye soporte de lip-sync y un pipeline independiente de superresolucion (`Kandinsky6SRPipeline`) que escala la salida x2, x2.25 o x4 hasta Full-HD (1920x1080) mediante difusion por mosaicos en el espacio latente de K-VAE.

Su relevancia radica en que es una de las pocas familias abiertas bajo licencia MIT que aborda generacion conjunta de video y audio sincronizado, con integraciones oficiales en Diffusers, vLLM Omni y ComfyUI. La familia se completa con Kandinsky 6.0 Video Pro de 29B parametros, orientado a mayor calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (flow matching) con VAE latente (K-VAE) y text encoder Qwen2.5-VL |
| Parametros totales | 3.177.988.112 (aprox. 3B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de difusion; el text encoder es Qwen2.5-VL) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato Diffusers) |

Otros datos: tamano del repositorio 33,1 GB; pipeline de Diffusers `Kandinsky6TI2VAPipeline`; 121 fotogramas por defecto a 24 fps; audio a 44 kHz; scheduler PiFlow; 10 pasos de inferencia con `guidance_scale=1.0`.

## Arquitectura y entrenamiento

Kandinsky 6.0 Video se presenta como una familia de modelos de difusion fundacionales para generacion sincronizada de texto, audio y video. La generacion opera en un espacio latente propio (K-VAE) y emplea flow matching; esta variante destilada esta calibrada para funcionar con el scheduler PiFlow en 10 pasos, frente a los 50 pasos y `guidance` 5.0 de los checkpoints no destilados. La condicion de texto se codifica con Qwen2.5-VL, y el pipeline admite la opcion `expand_prompts=True`, que permite al text encoder reescribir un prompt corto en uno detallado antes de codificarlo, anadiendo latencia pero sin cargar pesos adicionales.

La superresolucion se implementa como un pipeline separado, `Kandinsky6SRPipeline`, que aplica difusion por mosaicos en el espacio latente de K-VAE y recompone los mosaicos solapados con ventanas Hann, con factores de escala x2, x2.25 y x4 y 4 pasos por mosaico en el checkpoint de flow matching. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de video de 5 segundos (121 fotogramas a 24 fps) a partir de texto en modo T2AV.
- Generacion de video a partir de una imagen de referencia en modo TI2AV: la imagen condiciona el primer fotograma y el pipeline la redimensiona y recorta al centro al tamano indicado.
- Generacion de audio sincronizado a 44 kHz junto al video, con soporte de lip-sync.
- Generacion exclusivamente de video mediante el parametro `sample_audio=False`.
- Expansion automatica de prompts mediante Qwen2.5-VL (`expand_prompts=True`).
- Superresolucion de los fotogramas generados hasta Full-HD (1920x1080) con factores x2, x2.25 y x4.
- Control de resolucion de salida mediante los parametros `height` y `width`.
- Integracion con Diffusers, vLLM Omni y ComfyUI (nodo oficial en el registro de Comfy).
- No se ha documentado soporte de tool calling, agentes ni razonamiento multi-paso, al no ser un modelo de lenguaje conversacional.

## Casos de uso

- Generacion de clips publicitarios cortos: producir piezas de 5 segundos con audio y lip-sync a partir de un prompt de texto, usando 10 pasos de inferencia para iterar rapido sobre variantes creativas.
- Animacion de imagenes de producto o catalogo: en modo TI2AV, tomar una fotografia fija y generar un movimiento con audio ambiente, util para fichas de e-commerce y escaparates digitales.
- Previsualizacion de storyboards: convertir bocetos o fotogramas clave en clips animados para validar planos antes de rodar, con superresolucion posterior a 1920x1080 para presentaciones.
- Doblaje y contenido multilingue con lip-sync: el modelo genera audio sincronizado con el movimiento de boca, lo que sirve como base para localizacion de piezas audiovisuales.
- Creacion de assets para videojuegos: fondos animados, efectos ambientales o cinemáticas cortas con audio integrado, aprovechando la licencia MIT para su inclusion en productos comerciales.
- Prototipado en pipelines de investigacion: al estar integrado en Diffusers y vLLM Omni, permite experimentar con schedulers, pasos de muestreo y destilacion en entornos academicos.
- Automatizacion de contenido para redes sociales: generacion por lotes de clips verticales u horizontales de 5 segundos con locucion o ambiente, mediante scripts que invocan el pipeline.
- Superresolucion de metraje generado: usar `Kandinsky6SRPipeline` para escalar x4 material producido por el modelo Lite y reutilizarlo en resoluciones de emision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Estimaciones orientativas a partir del tamano del modelo (3B parametros); no confirmadas por el autor en la informacion disponible.

- Peso de los pesos en bfloat16: aproximadamente 6,4 GB solo para el modelo principal, a lo que hay que sumar el text encoder Qwen2.5-VL, el VAE (K-VAE) y los componentes de audio; el repositorio completo ocupa 33,1 GB.
- VRAM estimada: alrededor de 16-24 GB en bfloat16 para ejecutar el pipeline completo, dependiendo de la resolucion y del numero de fotogramas.
- La model card recomienda explicitamente `pipe.enable_model_cpu_offload()`, lo que sugiere que la ejecucion en GPU de gama de consumo requiere descarga de componentes a CPU.
- GPU de gama profesional recomendadas: A100, H100 o similares con 40-80 GB para ejecucion comoda sin offload y lotes mayores.
- GPU de gama de consumo: viable en RTX 4090 (24 GB) y previsiblemente en RTX 3090 (24 GB) con offload; en tarjetas de 12-16 GB requeriria cuantizacion, cuyos formatos no estan documentados.
- Opciones de despliegue: Diffusers (`Kandinsky6TI2VAPipeline`, `Kandinsky6SRPipeline`), vLLM Omni y ComfyUI.
- Latencia y throughput: no disponibles. La unica referencia concreta es que el checkpoint destilado requiere 10 pasos de inferencia y `guidance_scale=1.0`.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos de terceros en la informacion proporcionada. La comparacion posible se limita a los dos miembros de la propia familia:

| Modelo | Parametros | Pasos de muestreo | Duracion | Licencia |
|---|---|---|---|---|
| Kandinsky 6.0 Lite (destilado, este repositorio) | 3B | 10 (PiFlow, guidance 1.0) | 5 s | MIT |
| Kandinsky 6.0 Pro | 29B | 50 (guidance 5.0) | 5 s | No disponible en la informacion proporcionada |

Comparativa con alternativas externas: no disponible.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos del modelo, por lo que se desconoce el comportamiento en prompts con contenido demografico o cultural sensible.
- Riesgo de alucinacion visual y sonora inherente a los modelos generativos de difusion: el contenido generado puede no corresponder fielmente al prompt, especialmente en objetos, texto o fisicas complejas.
- La duracion de salida esta limitada a 5 segundos por clip; no se documenta generacion de video largo ni extension temporal.
- No hay datos sobre idiomas soportados; se desconoce el rendimiento del text encoder ante prompts en castellano u otras lenguas distintas del ingles.
- Los ajustes de muestreo son estrictos: usar 10 pasos y `guidance_scale=1.0`; aplicar los 50 pasos y guidance 5.0 de otros checkpoints produce resultados incorrectos.
- El modo TI2AV redimensiona y recorta la imagen de referencia al centro segun `height` y `width`, lo que puede eliminar contenido de los bordes de la imagen original.
- `expand_prompts=True` anade latencia y depende de Qwen2.5-VL, por lo que conviene medir su coste en produccion.
- La licencia MIT permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento para evaluar riesgos de terceros, algo no documentado en la informacion disponible.
- El modelo tiene un volumen de descargas bajo (51) y pocos likes (11), por lo que el soporte de la comunidad y la disponibilidad de ejemplos siguen siendo limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kandinskylab/Kandinsky-6.0-Lite-distill-5s-Diffusers
- Informe tecnico (arXiv): https://arxiv.org/pdf/2610.05608
- Pagina de modelos de video de KandinskyLab: https://kandinskylab.ai/models/video/
- Documentacion del pipeline en Diffusers: https://huggingface.co/docs/diffusers/main/en/api/pipelines/kandinsky6
- Documentacion en vLLM Omni: https://docs.vllm.ai/projects/vllm-omni/en/latest/api/vllm_omni/diffusion/models/kandinsky6/
- Nodo de ComfyUI: https://registry.comfy.org/nodes/kandinsky6
- Demo (Kandinsky 6.0 Pro, espacio de HuggingFace): https://huggingface.co/spaces/kandinskylab/Kandinsky-6.0-Pro-distill-5s
