# S3ckn11g0r/CROWN-MiniMax-H3-HyperPDMD-HD-3-4Step-LoRA

## Resumen

CROWN MiniMax-H3 HyperPDMD-HD es una suite de LoRA de aceleración y destilación para el modelo de generación de vídeo MiniMax-H3 (33B parámetros, arquitectura DiT conjunta de vídeo y audio estéreo a 32 kHz). La desarrolla el usuario S3ckn11g0r bajo la marca NineCrowns (`[CROWN]`) y se distribuye con licencia Apache 2.0. Su función es reducir el número de pasos de muestreo necesarios para generar vídeo de 3 a 4 pasos, manteniendo la nitidez espacial y la coherencia temporal en clips de hasta 15 segundos (362 fotogramas a 24 fps) con audio estéreo sincronizado.

El problema que resuelve es doble. Por un lado, los muestreos de 3-4 pasos sin LoRA en MiniMax-H3 producen artefactos conocidos: congelación de fotograma en image-to-video, colapso en text-to-video puro y doble exposición o desenfoque en la franja media del clip (5-10 s). Por otro, la suite está destilada para funcionar indistintamente sobre pesos BF16, INT8 (ConvRot) y GGUF Q4_K_M, de modo que el mismo adaptador sirve tanto en estaciones de trabajo como en GPUs de consumo con menos de 9 GiB de VRAM.

La relevancia actual radica en que permite ejecutar un modelo de vídeo-audio de 33B en hardware asequible con solo 3-4 pasos de inferencia, algo que hasta ahora requería clústeres de GPU. El repositorio ocupa 2,2 GB e incluye los pesos LoRA, seis flujos de trabajo listos para ComfyUI 0.33.0+ y vídeos de comparación de 15 segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre DiT conjunto de vídeo y audio MiniMax-H3 |
| Parametros totales | No disponible (el modelo base MiniMax-H3 tiene 33B; la LoRA tiene rango medio 38 o rango 64) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (genera clips de hasta 362 fotogramas a 24 fps, es decir, 15 s) |
| Tipos de cuantizacion | BF16, ConvRot INT8 (bloque 256 Hadamard), GGUF Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LoRA); el modelo base en safetensors y GGUF |

## Arquitectura y entrenamiento

La suite se compone de adaptadores LoRA de bajo rango que se aplican sobre las proyecciones lineales del DiT de MiniMax-H3 y de su TokenRefiner. Según la model card, cubre 208 de 208 capas lineales (`comfy.lora.load_lora = 208/208 = 100,0%`), lo que garantiza compatibilidad nativa con ComfyUI. Se ofrecen dos variantes funcionales: FL2VA/I2VA/T2VA (texto a vídeo, imagen a vídeo y primer-último fotograma a vídeo) y Ref2VA (referencia a vídeo con múltiples referencias y sincronización labial). Cada variante existe en versión comprimida de rango medio 38 (unos 346 MiB y 340 MiB respectivamente, con retención de energía del 99,96 % y 99,98 %) y en versión maestra sin comprimir de rango 64 (591,6 MiB, 100 % de energía retenida).

El entrenamiento se realizó en clústeres de 8×NVIDIA B200 con perturbación en línea de los pesos del estudiante para cubrir tres precisiones: 45 % GGUF Q4_K_M, 35 % ConvRot INT8 con Hadamard de bloque 256 y 20 % BF16 puro. La destilación combina Projected Distribution Matching Distillation (HyperPDMD) con un discriminador espectral basado en un VideoVAE con convolución 3D de 5 fotogramas. El resultado es un adaptador que mantiene la calidad tras cuantización agresiva y que, según el autor, multiplica por 6,5-10 la nitidez óptica de Laplaciano frente a ejecuciones de 4 pasos sin LoRA.

## Capacidades

- Generación de vídeo a texto (T2V) en 3-4 pasos de muestreo.
- Generación de vídeo a partir de imagen (I2V) y de primer y último fotograma (FL2V), sin congelación del primer fotograma.
- Generación de vídeo a partir de referencias múltiples (Ref2VA), con sincronización labial y fidelidad facial a resolución 768P.
- Generación conjunta de audio estéreo a 32 kHz sincronizado con el vídeo.
- Producción de clips de hasta 15 segundos (362 fotogramas a 24 fps).
- Funcionamiento con pesos BF16, INT8 ConvRot y GGUF Q4_K_M sin cambiar de adaptador.
- Integración nativa con ComfyUI 0.33.0+ mediante seis flujos de trabajo preconfigurados (T2V, I2V/FL2V y R2V a 480P y 768P).

## Casos de uso

- Prototipado rápido de vídeo publicitario: con 3-4 pasos y clips de 15 s, un estudio puede iterar decenas de variaciones de un anuncio en una sola GPU de consumo, algo inviable con el modelo base a pasos completos.
- Generación de avatares parlantes con sincronización labial: la variante Ref2VA, con `ref_image_size = "max"` y un retrato de busto en alta resolución, produce fidelidad facial a nivel de poro en 768P, útil para vídeos corporativos o formación.
- Creación de contenido para redes sociales en hardware doméstico: con el GGUF Q4_K_M y `UnetLoaderGGUFAdvanced` (patch_dtype="target") se ejecuta en menos de 9 GiB de VRAM, lo que permite generar clips con audio desde una RTX 3060 o superior.
- Previsualización de storyboards animados: la modalidad FL2V permite fijar el primer y el último fotograma de una toma y generar la transición intermedia, agilizando la revisión de guiones gráficos.
- Postproducción y doblaje: la generación de audio estéreo a 32 kHz junto al vídeo facilita la creación de material con diálogo sincronizado sin pipeline separado.
- Investigación en destilación de modelos de difusión: la combinación de HyperPDMD, perturbación de cuantización en línea y discriminador espectral sirve como referencia reproducible para estudiar aceleración de DiT de vídeo.
- Despliegue en entornos con VRAM limitada: la suite permite servir un modelo de 33B en GPUs de 16-24 GiB usando INT8 ConvRot, o en menos de 9 GiB con GGUF Q4_K_M, sin reentrenar adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta métricas internas cualitativas: retención de energía del 99,96 % (rango 38 FL2VA), 99,98 % (rango 38 Ref2VA) y 100 % (rango 64), cobertura de 208/208 capas y una mejora de 6,5×-10× en nitidez óptica de Laplaciano frente a 4 pasos sin LoRA.

## Requisitos de hardware

- VRAM estimada: menos de 9 GiB con el modelo base GGUF Q4_K_M y `UnetLoaderGGUFAdvanced` (patch_dtype="target", sin sobrecoste de VRAM); 16-24 GiB con INT8 ConvRot; estación de trabajo o nube con BF16.
- GPU recomendadas: RTX 3060/4060 o superiores para el modo GGUF Q4_K_M; RTX 4090 o A100 para INT8 ConvRot; H100 o B200 para BF16.
- Cabe en GPU de consumo: sí, con el GGUF Q4_K_M en tarjetas de 8-12 GiB.
- Opciones de despliegue: ComfyUI 0.33.0+ (flujos incluidos), con `SamplerCustomAdvanced`, `BasicGuider` (CFG = 1.0), `KSamplerSelect ("euler")`, `BetaSamplingScheduler` (steps = 3 o 4, alpha = 0.6, beta = 0.6) y `MiniMaxH3SigmaShift` (shift_video = 12.0, shift_audio = 3.0 para FL2VA/I2VA/T2VA; shift_video = 9.0 para Ref2VA).
- Latencia y throughput: no disponibles; el entrenamiento se realizó en 8×NVIDIA B200, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|
| CROWN MiniMax-H3 HyperPDMD-HD | LoRA sobre base de 33B | 362 fotogramas (15 s) a 24 fps + audio 32 kHz | Apache 2.0 | Hugging Face, ComfyUI |
| MiniMax-H3 base (sin LoRA) | 33B | Igual que la base | Segun modelo base (no disponible) | Hugging Face |
| LoRA de aceleracion genericos para DiT de video | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de adaptadores comparables publicados en la informacion proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere descargar el modelo base MiniMax-H3 (33B) desde Comfy-Org o MiniMaxAI, lo que añade varios GB de pesos.
- La calidad depende de la configuración exacta de sampler, scheduler y sigma shift; desviarse de los valores recomendados puede reintroducir artefactos de doble exposición o congelación.
- Los datos de entrenamiento y la composición del dataset del modelo base no se detallan, por lo que no se pueden evaluar sesgos demográficos o culturales del vídeo generado.
- Riesgo de alucinación visual y de inconsistencias temporales en clips largos, especialmente en escenas con múltiples sujetos o movimientos rápidos.
- Idiomas soportados no disponibles; la generación de audio con diálogo puede no cubrir todos los idiomas.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base MiniMax-H3, que puede imponer restricciones adicionales.
- El repositorio tiene pocas descargas (1270) y likes (8), y fue creado en noviembre de 2026; la validación comunitaria es todavía limitada.
- Requiere ComfyUI 0.33.0 o superior y nodos específicos (`UnetLoaderGGUFAdvanced`, `MiniMaxH3SigmaShift`), lo que limita su uso fuera de ese ecosistema.

## Enlaces

- Hugging Face: https://huggingface.co/S3ckn11g0r/CROWN-MiniMax-H3-HyperPDMD-HD-3-4Step-LoRA
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Modelo base en Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
