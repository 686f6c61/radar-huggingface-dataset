# S3ckn11g0r/CROWN-MiniMax-H3-HyperPDMD-HD-3-4Step-LoRA

## Resumen

CROWN MiniMax-H3 HyperPDMD-HD es una suite de LoRAs de aceleración y destilación para el modelo base MiniMax-H3, un DiT conjunto de vídeo y audio de 33 000 millones de parámetros que genera vídeo y audio estéreo a 32 kHz de forma sincronizada. La suite la publica el usuario NineCrowns bajo el identificador S3ckn11g0r y está diseñada para reducir el coste de inferencia del modelo base: permite generar clips de hasta 15 segundos (362 fotogramas a 24 fps) con audio estéreo en tan solo 3 o 4 pasos de muestreo, en lugar de las decenas de pasos que requieren los modelos de difusión convencionales.

El componente principal pesa aproximadamente 345 MiB y se compone de dos LoRAs principales (una para los modos texto-a-vídeo, imagen-a-vídeo y primer/último fotograma-a-vídeo, y otra para el modo referencia-a-vídeo con sincronización labial), más dos versiones maestras sin comprimir de rango 64. La suite incorpora además seis flujos de trabajo listos para usar en ComfyUI 0.33.0 o superior y vídeos de demostración comparativos.

Su relevancia actual radica en que aborda el principal cuello de botella de los modelos de vídeo generativo de gran escala: el coste computacional y la VRAM. Según la model card, la suite permite ejecutar el modelo base en GPUs de consumo con menos de 9 GiB de VRAM usando pesos GGUF Q4_K_M, y mantiene compatibilidad nativa con las tres precisiones del modelo base (BF16 puro, INT8 ConvRot y GGUF Q4_K_M). La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA de destilación sobre DiT conjunto de vídeo y audio (MiniMax-H3) |
| Parámetros totales | No disponible (la LoRA tiene rango medio 38 y rango 64 en la versión maestra) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventana de generación de hasta 362 fotogramas a 24 fps, es decir, 15 segundos de vídeo) |
| Tipos de cuantización | BF16, INT8 ConvRot (Block-256 Hadamard), GGUF Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LoRA); el modelo base admite safetensors y GGUF |
| Tamaño del repositorio | 2,2 GB |
| Tamaño de la LoRA principal | 346,7 MiB (FL2VA/I2VA/T2VA) y 340,3 MiB (Ref2VA) |
| Rango de la LoRA | Medio de 38 (versión compacta); 64 (versión maestra sin comprimir) |
| Capas objetivo | 208/208 proyecciones lineales del DiT y TokenRefiner (100 %) |
| Pasos de muestreo | 3 o 4 pasos |
| Resolución de generación | 480P y 768P |
| Audio | Estéreo a 32 kHz sincronizado con el vídeo |

## Arquitectura y entrenamiento

La suite se construye sobre MiniMax-H3, un transformer de difusión (DiT) conjunto de vídeo y audio de 33 000 millones de parámetros que genera fotogramas de vídeo y audio estéreo a 32 kHz de manera sincronizada. Las LoRAs se aplican sobre las 208 proyecciones lineales del DiT y del TokenRefiner, lo que según la model card supone una cobertura del 100 % de las capas lineales del modelo base.

El entrenamiento se realizó en clústeres de 8 GPU NVIDIA B200 con una técnica denominada Projected Distribution Matching Distillation (HyperPDMD), combinada con perturbación en línea de los pesos del estudiante cuantizados: un 45 % de las muestras se entrenaron con pesos GGUF Q4_K_M, un 35 % con INT8 ConvRot (Hadamard por bloques de 256) y un 20 % con BF16 puro. Además, se empleó un discriminador espectral basado en un VideoVAE con convolución 3D de 5 fotogramas. El objetivo declarado es eliminar el congelamiento de fotograma en I2V, el colapso en T2V puro y el efecto de doble exposición o desenfoque en la franja media del clip (5-10 s) que aparece en ejecuciones de 4 pasos sin LoRA.

## Capacidades

- Generación de vídeo a partir de texto (T2V), imagen (I2V), primer y último fotograma (FL2V) y referencias múltiples (Ref2V).
- Generación de audio estéreo a 32 kHz sincronizado con el vídeo, incluida la sincronización labial en el modo Ref2VA.
- Generación de clips de hasta 15 segundos (362 fotogramas a 24 fps).
- Aceleración de muestreo a 3-4 pasos con guía CFG = 1.0 y sampler Euler.
- Compatibilidad con tres precisiones del modelo base (BF16, INT8 ConvRot y GGUF Q4_K_M) con una única LoRA.
- Nitidez HD declarada mediante un discriminador espectral de tipo Nyquist-HD (hasta 6,5-10 veces más nitidez óptica Laplaciana según la model card).
- Integración nativa con ComfyUI 0.33.0 o superior mediante seis flujos de trabajo incluidos.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, al tratarse de un modelo generativo de vídeo y audio.

## Casos de uso

- Generación rápida de clips publicitarios: con 3-4 pasos y hasta 15 segundos de duración, la suite permite iterar creatividades de vídeo con audio sincronizado en cuestión de segundos en GPUs de consumo, lo que encaja en flujos de producción de contenido para redes sociales.
- Prototipado de vídeo en equipos con GPU de consumo: al poder ejecutarse con menos de 9 GiB de VRAM usando GGUF Q4_K_M, permite a desarrolladores sin acceso a clústeres probar el modelo base MiniMax-H3 en una RTX 4090 o similar.
- Doblaje y sincronización labial: el modo Ref2VA con referencias múltiples y sincronización labial sirve para generar vídeos donde un personaje de referencia habla con audio sincronizado, útil en localización de contenido audiovisual.
- Animación de imágenes fijas: el modo I2V y FL2V permite animar retratos o ilustraciones con movimiento coherente y audio, aplicable a avatares y presentaciones animadas.
- Creación de vídeo a partir de guion textual: el modo T2V facilita generar escenas completas con audio ambiente y diálogo a partir de una descripción, útil para previsualización de guiones y storyboards animados.
- Pruebas de integración en pipelines ComfyUI: los seis flujos de trabajo incluidos a 480P y 768P permiten validar la cadena completa (carga de LoRA, sampler, scheduler, sigma shift) antes de desplegar en producción.
- Investigación en destilación de modelos de difusión: la combinación de HyperPDMD con perturbación de cuantización en línea es un caso de estudio reproducible para quienes investigan aceleración de modelos generativos de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente declara métricas internas de la propia suite: retención de energía del 99,96 % (FL2VA/I2VA/T2VA) y 99,98 % (Ref2VA) en la versión compacta, y del 100 % en las versiones maestras de rango 64; cobertura del 100 % de las 208 capas lineales; y una mejora de nitidez óptica Laplaciana de 6,5 a 10 veces frente a ejecuciones de 4 pasos sin LoRA. No se proporcionan valores de MMLU, HumanEval, GSM8K ni métricas estándar de vídeo como FVD o FID.

## Requisitos de hardware

- VRAM estimada: menos de 9 GiB con el modelo base GGUF Q4_K_M y `UnetLoaderGGUFAdvanced` con `patch_dtype = "target"` (sin sobrecarga adicional de VRAM según la model card); entre 16 y 24 GiB con INT8 ConvRot, y entorno de estación de trabajo o nube con BF16.
- GPU recomendadas: NVIDIA B200 para entrenamiento (8 GPU en clúster); para inferencia, GPU de consumo con menos de 9 GiB (por ejemplo, RTX 4060 Ti 16 GB o RTX 4090) en modo GGUF, y GPUs de 16-24 GiB (RTX 4090, A100 40 GB) en modo INT8 o BF16.
- Cabe en GPU de consumo: sí, en modo GGUF Q4_K_M con menos de 9 GiB de VRAM.
- Opciones de despliegue: ComfyUI 0.33.0 o superior con `SamplerCustomAdvanced`, `BasicGuider`, `KSamplerSelect ("euler")`, `BetaSamplingScheduler` y `MiniMaxH3SigmaShift`; el modelo base se carga con `UnetLoaderGGUFAdvanced` (GGUF) o safetensors (INT8/ BF16). La librería declarada es `diffusers`.
- Latencia y throughput: no disponibles. La model card solo indica que la generación se completa en 3 o 4 pasos, pero no publica tiempos por clip ni fotogramas por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CROWN MiniMax-H3 HyperPDMD-HD (esta suite) | LoRA sobre DiT de 33 000 M | Hasta 362 fotogramas (15 s) a 24 fps + audio 32 kHz | 3-4 | Apache 2.0 | Hugging Face, ComfyUI |
| MiniMax-H3 (modelo base) | 33 000 M (DiT vídeo + audio) | Hasta 362 fotogramas (15 s) + audio 32 kHz | No especificado (más pasos) | No disponible | Hugging Face (MiniMaxAI/MiniMax-H3, Comfy-Org/MiniMax-H3) |
| LoRAs de aceleración de vídeo para otros DiT (por ejemplo, destilaciones tipo DMD/LCM) | Variable según base | Variable | 4-8 | Variable | Hugging Face |

No se dispone de datos de benchmarks comparativos entre esta suite y alternativas equivalentes en la información proporcionada.

## Limitaciones y advertencias

- La model card incluye enlaces a servicios externos (por ejemplo, h3xron.xyz) presentados como plataformas de acceso al modelo base; se trata de contenido promocional del autor y no debe considerarse parte de la documentación técnica ni una recomendación de uso.
- El modelo está entrenado y validado exclusivamente para generación de vídeo y audio; no se documentan capacidades de texto, razonamiento, código ni tool calling.
- Los datos sobre idiomas soportados no están disponibles; el audio generado podría estar sesgado hacia los idiomas presentes en los datos de entrenamiento del modelo base, que no se detallan.
- Riesgo de alucinación visual y auditiva: como todo modelo generativo, puede producir artefactos, incoherencias temporales o audio desincronizado, especialmente en clips largos o con referencias de baja calidad.
- Las métricas de nitidez y retención de energía son declaraciones del autor y no están respaldadas por benchmarks públicos independientes; conviene validarlas en el caso de uso concreto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base MiniMax-H3 puede tener condiciones adicionales que no se detallan en esta ficha; es responsabilidad del usuario verificar la licencia del modelo base antes de desplegar en producción.
- La suite requiere ComfyUI 0.33.0 o superior y configuraciones específicas de sampler, scheduler y sigma shift; una configuración incorrecta puede degradar gravemente la calidad del vídeo generado.
- El tamaño de la LoRA compacta (~345 MiB) y la versión maestra (~592 MiB) son pequeños en relación con el modelo base, pero el requisito real de VRAM lo determina el DiT de 33 000 millones de parámetros, no la LoRA.

## Enlaces

- [Hugging Face: S3ckn11g0r/CROWN-MiniMax-H3-HyperPDMD-HD-3-4Step-LoRA](https://huggingface.co/S3ckn11g0r/CROWN-MiniMax-H3-HyperPDMD-HD-3-4Step-LoRA)
- [Modelo base: MiniMaxAI/MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- [Modelo base: Comfy-Org/MiniMax-H3](https://huggingface.co/Comfy-Org/MiniMax-H3)
- [ComfyUI](https://github.com/comfyanonymous/ComfyUI)
- [Servicio externo mencionado en la model card: h3xron.xyz](https://h3xron.xyz)
