# goodmai/Wan2.2-TI2V-5B-PV-MACaQ-4bit-MXFP4-MLX

## Resumen

Wan2.2-TI2V-5B-PV-MACaQ-4bit-MXFP4-MLX es una cuantizacion a 4 bits del modelo de difusion text/image-to-video Wan 2.2 TI2V-5B, publicada por el usuario goodmai. El checkpoint base es Wan-AI/Wan2.2-TI2V-5B-Diffusers, un Diffusion Transformer (DiT) de video de Wan AI. Esta version esta empaquetada en formato MLX para ejecutarse en Apple Silicon (macOS), con el objetivo de hacer viable la generacion de video en equipos de sobremesa con memoria unificada de 16-24 GB.

La publicacion aplica un esquema de cuantizacion propietario llamado PV-MACaQ MXFP4, que combina MXFP4 (bloques de 32 elementos con transformada de Walsh-Hadamard y escala E8M0 en uint8) con un ajuste fino de las escalas pre_scale en bfloat16 mediante PV-Tuning, calibrado por el autor. Segun la model card, esto reduce el footprint del transformer de 18,63 GB a 2,49 GB (compresion de 7,47x) y mejora la relacion senal-ruido de cuantizacion (SQNR) en 0,34 dB respecto a una cuantizacion RTN MXFP4 ingenua.

El modelo resuelve el problema de generar video con un DiT de ~5 mil millones de parametros en hardware consumer de Apple, algo que en precision completa requiere bastante mas memoria. Es relevante para desarrolladores que quieran experimentar con text-to-video localmente en Mac, sin depender de GPUs NVIDIA ni de servicios en la nube. La licencia del checkpoint base es Apache-2.0. El repo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, lo que indica que es una publicacion muy reciente y poco validada por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de video (`wan_video_dit`), con VAE 3D causal; cuantizado a 4 bits MXFP4 con escalas PV-Tuned |
| Parametros totales | 793.643.200 (según safetensors del repo cuantizado); el checkpoint base Wan2.2-TI2V-5B declara ~5B en su denominacion |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | PV-MACaQ 4-bit MXFP4 (bloques B=32, Walsh-Hadamard, escala E8M0 uint8, `pre_scale` bfloat16 PV-tuned) |
| Idiomas soportados | no disponible (prompts de texto; la model card no detalla cobertura linguistica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo MLX; libreria `mlx`, `diffusers`) |

## Arquitectura y entrenamiento

El modelo base es un Diffusion Transformer para generacion de video a partir de texto e imagen (TI2V), con un VAE 3D causal para codificar y decodificar latentes temporales. La variante publicada conserva la arquitectura del DiT y aplica cuantizacion post-entrenamiento sobre 304 capas lineales de proyeccion 2D del transformer, distribuidas en 5 shards. El esquema MXFP4 agrupa pesos en bloques de 32 elementos, aplica una transformada de Walsh-Hadamard antes de cuantizar y almacena una escala E8M0 en uint8 por bloque; las escalas `pre_scale` se ajustan en bfloat16 con PV-Tuning para minimizar el error de salida.

No se dispone de informacion sobre el dataset de entrenamiento del modelo base (numero de tokens, composicion, uso de RLHF/DPO) en la informacion proporcionada. La model card menciona aceleraciones de inferencia integradas en el runtime Basalt: TeaCache y STA (sparse temporal attention), ademas de VAE tiling para reducir picos de memoria. El autor reporta metricas de calibracion medidas: SQNR held-out de 18,70 dB con RTN MXFP4 frente a 19,03 dB con PV-MACaQ MXFP4 (+0,34 dB) y una reduccion del MSE held-out del 7,5 % respecto a RTN.

## Capacidades

- Generacion de video a partir de texto (text-to-video) y de imagen (image-to-video), segun el pipeline declarado `text-to-video` y la denominacion TI2V del checkpoint base.
- Generacion de clips con 81 frames a 24 fps segun el preset de ejemplo de Basalt (`fps: 24`, `frames: 81`).
- Inferencia en Apple Silicon mediante MLX, con soporte de VAE tiling y atencion temporal dispersa (STA) para gestionar memoria.
- Integracion con el runtime Basalt (app macOS y CLI), con composicion declarativa `basalt.yaml` v2.2 que permite encadenar un modelo director de texto (por ejemplo, `goodmai/gemma-4-12B-it-qat-4bit`) con el modelo de video.
- No se documenta soporte de tool calling, function calling, agentes multi-step ni capacidades de audio o vision mas alla del condicionamiento por imagen de entrada.
- Cobertura multilingue de prompts: no disponible.

## Casos de uso

- Prototipado local de text-to-video en Mac: desarrolladores con un Apple Silicon de 16-24 GB de memoria unificada pueden generar clips directamente con la CLI de Basalt, sin Python ni FFmpeg, lo que simplifica la cadena de dependencias.
- Generacion de storyboards y prevision visual: usar el modelo para producir clips de 81 frames a partir de descripciones textuales y evaluar encuadres o ritmo antes de pasar a produccion con modelos mayores.
- Image-to-video para animacion de stills: a partir de una imagen de referencia, generar movimiento coherente para demos de producto, maquetas de videojuegos o pruebas de concepto de marketing.
- Pipelines creativos asistidos por LLM: el preset `24gb-video-studio` encadena un modelo director de texto con el modelo de video, permitiendo que un LLM expanda prompts y el DiT genere el clip, con descarga bajo demanda e `idle_unload` a 180 s para liberar memoria.
- Investigacion sobre cuantizacion de DiT: el checkpoint sirve como referencia reproducible para estudiar el impacto de MXFP4 con PV-Tuning frente a RTN en modelos de difusion de video, gracias a las metricas SQNR y MSE publicadas.
- Evaluacion de aceleraciones de inferencia: TeaCache y STA estan activables en el preset, lo que permite medir el compromiso entre velocidad y calidad en hardware Apple frente a una ejecucion densa.
- Educacion y demos offline: al ejecutarse localmente en macOS, encaja en talleres o entornos sin acceso a GPUs NVIDIA ni a APIs en la nube.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad de video (FVD, CLIP score, etc.). Solo se reportan metricas de cuantizacion medidas por el autor:

| Metrica | RTN MXFP4 | PV-MACaQ MXFP4 |
|---|---|---|
| SQNR held-out (salida) | 18,70 dB | 19,03 dB (+0,34 dB) |
| Reduccion de MSE held-out vs RTN | referencia | -7,5 % |
| Footprint del transformer | no disponible | 2,49 GB (desde 18,63 GB, 7,47x) |

No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el autor apunta a Apple Silicon con 16-24 GB de memoria unificada; el preset asociado se llama `24gb-video-wan22-5b`.
- El transformer cuantizado ocupa 2,49 GB; el repo completo pesa 5,5 GB, por lo que el grueso del consumo restante proviene del VAE, activaciones y buffers de inferencia.
- GPU recomendadas: exclusivamente Apple Silicon (M-series) via MLX; no se documenta soporte CUDA en esta publicacion.
- Cabe en GPU consumer: si, en Mac con memoria unificada de 16-24 GB; no se especifican modelos concretos de chip.
- Opciones de despliegue: runtime Basalt (app macOS y CLI) y libreria MLX; el repo esta etiquetado tambien con `diffusers`, pero la via documentada es Basalt.
- Aceleraciones disponibles: VAE tiling, STA (sparse temporal attention) y TeaCache, configurables en `basalt.yaml`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| Wan2.2-TI2V-5B-PV-MACaQ-4bit-MXFP4-MLX (este) | 793.643.200 en safetensors cuantizados; base ~5B | DiT de video, MLX 4-bit | apache-2.0 | Hugging Face, runtime Basalt |
| Wan-AI/Wan2.2-TI2V-5B-Diffusers (base) | ~5B (segun denominacion) | DiT de video, diffusers | no disponible en la informacion proporcionada | Hugging Face |
| Otros modelos text-to-video de tamano similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para comparar rendimiento, contexto o calidad con alternativas concretas de la misma categoria.

## Limitaciones y advertencias

- Publicacion muy reciente y sin traccion: 0 descargas y 0 likes, por lo que no hay validacion independiente de la calidad de los clips generados ni de las metricas reportadas.
- Las metricas SQNR y MSE provienen del autor y se miden sobre salidas held-out; no equivalen a una evaluacion perceptual de calidad de video.
- La cuantizacion a 4 bits introduce perdida de fidelidad respecto al checkpoint base; el propio autor cuantifica la mejora frente a RTN pero no documenta la degradacion frente a FP16/BF16.
- El esquema PV-MACaQ, el runtime Basalt y los presets son herramientas del autor; la reproducibilidad fuera de ese ecosistema no esta garantizada.
- Dependencia de hardware Apple Silicon: no hay soporte CUDA documentado, lo que limita el despliegue en servidores con GPU NVIDIA.
- Idiomas soportados y comportamiento multilingue de los prompts: no disponibles.
- Riesgo de sesgos y alucinacion visual: no se documentan analisis de sesgos ni evaluaciones de fidelidad prompt-video.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del checkpoint base Wan-AI/Wan2.2-TI2V-5B-Diffusers antes de produccion.
- No se documentan requisitos de atribucion adicionales ni restricciones de uso por parte del autor de la cuantizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goodmai/Wan2.2-TI2V-5B-PV-MACaQ-4bit-MXFP4-MLX
- Checkpoint base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- Repositorio Basalt: https://github.com/goodmai/basalt
- Demo "Run with Basalt" (Hugging Face Space): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2FWan2.2-TI2V-5B-PV-MACaQ-4bit-MXFP4-MLX&role=video&lang=en
- Modelo director citado en el preset: https://huggingface.co/goodmai/gemma-4-12B-it-qat-4bit
