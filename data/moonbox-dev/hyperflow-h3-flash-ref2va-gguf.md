# moonbox-dev/hyperflow-h3-flash-ref2va-GGUF

## Resumen

HyperFlow H3 Flash (reference-to-video) es una variante comprimida y de pocos pasos del modelo MiniMax-H3, desarrollada por Video Rebirth. Genera video con audio estéreo sincronizado a partir de un prompt de texto y hasta 12 imagenes de referencia. El modelo original ronda los 31B parametros en su transformer; esta version lo reduce a 13,9B (en la variante `ref2va`), menos de la mitad, manteniendo la capacidad de sintesis audiovisual conjunta.

La ficha que nos ocupa, `moonbox-dev/hyperflow-h3-flash-ref2va-GGUF`, no es una conversion propia de Moonbox: son los archivos GGUF publicados por el autor original, renombrados y verificados por sha256. Solo contiene el transformer en formato GGUF; el text encoder (Qwen3-VL) y los VAE provienen del modelo base MiniMax-H3. Se ofrecen cuatro precisiones: Q8_0 (15,16 GB), Q6_K (11,76 GB), Q5_K_M (10,45 GB) y Q4_K_M (9,22 GB).

La relevancia de este lanzamiento esta en la accesibilidad: con Q4_K_M en 9,1 GB, el modelo cabe en GPUs de 24 GB y 32 GB en equipos con 16 GB de RAM de sistema, y se ejecuta en ComfyUI mediante ComfyUI-GGUF y los nodos propios del autor. La generacion por defecto es un clip de 5,2 a 15 segundos a 24 fps y 1344x768 con pista de audio estéreo a 32 kHz, muestreado en 4, 6 u 8 pasos sin CFG.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para video y audio (variante comprimida de MiniMax-H3); no se detalla la topologia interna en la informacion disponible |
| Parametros totales | 14.164.330.680 (~14,2B); el transformer `ref2va` se declara como 13,9B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF); INT8 safetensors en el modelo base |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License (derivada; el codigo es Apache-2.0) |
| Formato de pesos | GGUF (solo transformer); text encoder y VAE en el modelo base |

## Arquitectura y entrenamiento

HyperFlow H3 Flash es una version destilada y comprimida de MiniMax-H3, orientada a muestreo en pocos pasos. El transformer se reduce de ~31B a 13,9B parametros en la variante `ref2va`, y el muestreo se realiza en 4, 6 u 8 pasos sin classifier-free guidance (CFG), con 6 pasos como valor por defecto. Esta configuracion de pocos pasos es la que permite latencias de 8,7 s en 4x B200, 36 s en 1x H200 y 92 s en una RTX 5090 para un clip de 5,2 s. No se detalla en la informacion disponible la composicion del dataset de entrenamiento, el numero de tokens, ni si hubo RLHF o DPO.

El modelo genera video y audio de forma conjunta: salida de 5,2 a 15 s a 24 fps, 1344x768 por defecto, con banda sonora estéreo a 32 kHz. La variante `ref2va` acepta hasta 12 referencias (imagenes en GGUF e INT8 de ComfyUI; imagenes, videos y audio en la implementacion Python INT8). Existe un socio de aceleracion de inferencia, NVIDIA SOL-H3, que ejecuta el modelo en tiempo real sobre 4 GPUs de la serie B. Para el transformer completo de MiniMax-H3 existe ademas un LoRA de 8 pasos en `VideoRebirthAI/hyperflow`.

## Capacidades

- Generacion de video a partir de texto (`t2va`): prompt de texto a video con audio sincronizado.
- Generacion condicionada por keyframes (`fl2va`): prompt mas primer keyframe, o primer y ultimo keyframe.
- Reference-to-video (`ref2va`): prompt mas hasta 12 imagenes de referencia; en Python INT8 admite tambien videos y audio como referencia.
- Generacion de audio estéreo a 32 kHz sincronizado con el video.
- Salida de 5,2 a 15 s a 24 fps, 1344x768 por defecto.
- Muestreo en 4, 6 u 8 pasos sin CFG (6 por defecto).
- Integracion en ComfyUI mediante ComfyUI-GGUF y los nodos ComfyUI-HyperFlow-Flash.
- Soporte INT8 safetensors en ComfyUI y en Python.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo generativo de video/audio, no un LLM conversacional.

## Casos de uso

- Prototipado rapido de video generativo en estaciones de trabajo con GPU consumer: con Q4_K_M (9,22 GB) el modelo cabe en GPUs de 24 GB y 32 GB con 16 GB de RAM de sistema, lo que permite iterar localmente sin depender de la nube.
- Generacion de clips cortos para redes sociales: clips de 5,2 a 15 s a 24 fps y 1344x768 con audio estéreo integrado cubren formatos habituales de video corto sin postproduccion de sonido.
- Creacion de video a partir de referencias visuales: la variante `ref2va` admite hasta 12 imagenes de referencia, util para mantener consistencia de personaje, producto o estilo entre planos.
- Animar keyframes en pipelines de storyboard: la variante `fl2va` acepta primer keyframe o primer y ultimo keyframe, lo que encaja en flujos de animacion entre poses o transiciones planificadas.
- Generacion de video con audio para demos y material de marketing: la sintesis conjunta de video y audio a 32 kHz evita el paso separado de doblaje o Foley en piezas cortas.
- Despliegue en produccion con ComfyUI: los templates `hyperflow_t2v`, `hyperflow_i2v`, `hyperflow_flf2v` y `hyperflow_ref2v` (y sus variantes `*_int8`) permiten montar un pipeline reproducible sobre ComfyUI.
- Aceleracion en cluster: con NVIDIA SOL-H3 sobre 4x B200 se alcanza tiempo real para clips de 5,2 s, adecuado para servicios de generacion interactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de rendimiento son tiempos de inferencia para un clip de 5,2 s con 6 pasos:

| Hardware | Tiempo (clip de 5,2 s, 6 pasos) |
|---|---|
| 4x B200 | 8,7 s |
| 1x H200 | 36 s |
| 1x RTX 5090 | 92 s |

## Requisitos de hardware

- VRAM estimada: Q4_K_M ocupa 9,22 GB en disco y se declara un minimo de 9,1 GB; Q8_0 ocupa 15,16 GB (14,9 GB declarados). Hay que sumar el text encoder (Qwen3-VL) y los VAE del modelo base.
- GPUs recomendadas: B200 (4 unidades para tiempo real con SOL-H3), H200, RTX 5090.
- Cabe en GPU consumer: si, en GPUs de 24 GB y 32 GB con 16 GB de RAM de sistema. Las GPUs de 16 GB no estan medidas segun el autor.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF y ComfyUI-HyperFlow-Flash; INT8 safetensors en ComfyUI y Python (requiere PyTorch compilado para CUDA 13.0 o superior); NVIDIA SOL-H3 para aceleracion.
- Latencia y throughput: 8,7 s en 4x B200, 36 s en 1x H200 y 92 s en RTX 5090 para un clip de 5,2 s a 6 pasos.
- Nota: no existen archivos F16/BF16; el autor no publico pesos en precision completa. Los archivos Q3_K_M y Q4_K_S del autor no estan replicados en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Salida | Pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyperFlow H3 Flash `ref2va` (esta ficha) | 13,9B | Video 5,2-15 s, 24 fps, 1344x768, audio 32 kHz | 4/6/8 sin CFG | MiniMax H3 Community License | GGUF e INT8 |
| MiniMax-H3 (base) | ~31B (transformer) | Video con audio | no disponible | MiniMax H3 Community License | Pesos completos en el Hub |
| HyperFlow (LoRA 8 pasos sobre MiniMax-H3) | ~31B (transformer) | Video con audio | 8 | MiniMax H3 Community License | LoRA en `VideoRebirthAI/hyperflow` |

No se dispone de datos de benchmarks que permitan comparar calidad entre estas variantes; la comparacion se limita a parametros, formato y regimen de muestreo.

## Limitaciones y advertencias

- La licencia MiniMax H3 Community License restringe el territorio: no esta licenciada en la UE, Reino Unido, Corea del Sur ni Estados Unidos sin autorizacion previa de MiniMax. Esto afecta directamente a un uso comercial desde Espana.
- Incluye una Acceptable Use Policy que condiciona los usos permitidos.
- El repositorio no es un producto oficial de MiniMax; es una derivacion de Video Rebirth replicada por Moonbox.
- Solo el transformer esta en GGUF: es necesario obtener el text encoder (Qwen3-VL) y los VAE del modelo base MiniMax-H3.
- En GGUF e INT8 de ComfyUI, la variante `ref2va` solo acepta imagenes como referencia; el uso de videos y audio como referencia requiere la implementacion Python INT8.
- No hay pesos F16/BF16 publicados, lo que limita la comparacion con la precision completa y puede afectar a la fidelidad en Q4_K_M.
- Las GPUs de 16 GB no han sido medidas; el minimo verificado es 24 GB.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni evaluaciones de calidad; no se han publicado benchmarks.
- El modelo tiene 2 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion muy temprana y poca validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/hyperflow-h3-flash-ref2va-GGUF
- Modelo base (reference-to-video): https://huggingface.co/VideoRebirthAI/hyperflow-h3-flash
- Variante `fl2va` en GGUF: https://huggingface.co/moonbox-ai/hyperflow-h3-flash-GGUF
- Variante MLX: https://huggingface.co/moonbox-ai/hyperflow-h3-flash-MLX
- MiniMax-H3 (modelo original): https://huggingface.co/MiniMaxAI/MiniMax-H3
- LoRA de 8 pasos sobre MiniMax-H3: https://huggingface.co/VideoRebirthAI/hyperflow
- Repositorio GitHub de HyperFlow H3 Flash: https://github.com/Video-Rebirth/hyperflow-h3-flash
- Repositorio GitHub del LoRA HyperFlow: https://github.com/Video-Rebirth/hyperflow
- NVIDIA SOL-H3: https://github.com/NVlabs/Sana/tree/sol-engine/models/minimax_h3/HyperFlow-Flash
- Ejemplos generados: https://www.videorebirth.com/lp/hyperflow-flash
- Web de Video Rebirth: https://www.videorebirth.com/
