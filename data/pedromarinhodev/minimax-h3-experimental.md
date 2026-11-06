# PedroMarinhoDev/MiniMax-H3-Experimental

## Resumen

MiniMax H3 Experimental es una versión experimental del modelo de generación de vídeo MiniMax H3, empaquetada por el usuario PedroMarinhoDev para su uso en ComfyUI. No se trata de un modelo entrenado desde cero, sino de un fichero modificado: parte del checkpoint oficial `minimax_h3_fl2va_pruned_int8_convrot.safetensors` publicado por Comfy-Org, al que se ha fusionado (merge) la LoRA de destilación de pasos TaoMate H3 3-step MAXQUALITY, creada por el equipo TaoLive AIGC de Alibaba y convertida para ComfyUI por Asirus. El resultado genera vídeo con audio en 3 pasos de muestreo en lugar de los 20 pasos del modelo base.

El problema que resuelve es la latencia de inferencia: al integrar la LoRA directamente en los pesos cuantizados int8 (con la técnica ConvRot), se evita cargar la LoRA en tiempo de ejecución, lo que de otro modo forzaría que cada capa parcheada se ejecutara en bf16 y ralentizara el proceso. El fichero ocupa 21,0 GB, mantiene exactamente los mismos 932 tensores y la misma estructura que el oficial, y solo difiere en las capas lineales de atención y MLP de los 50 bloques, además del token refiner.

Es relevante porque permite producir clips de vídeo con sonido sincronizado en tarjetas de consumo (los propios tests del autor se realizaron en una RTX 4090), reduciendo el tiempo de muestreo de unos 51 segundos (480p) y 184 segundos (768p) del modelo base a unos 9 y 27 segundos respectivamente, manteniendo la ruta rápida int8 de ComfyUI a cualquier resolución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión vídeo-a-vídeo / texto-a-vídeo tipo FL2VA con token refiner y 50 bloques (detalles completos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (genera clips de 124 fotogramas, ~5,2 segundos) |
| Tipos de cuantizacion | int8 (ConvRot) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (other) |
| Formato de pesos | safetensors (21,0 GB), cuantizado int8 ConvRot |

## Arquitectura y entrenamiento

El modelo base MiniMax H3 es un modelo de difusión para generación de vídeo con audio, con soporte de texto-a-vídeo e imagen-a-vídeo, cuya variante pruned int8 ConvRot utiliza cuantización int8 aplicada sobre las capas lineales de atención y MLP de sus 50 bloques y sobre el token refiner. La variante aquí descrita añade, mediante el mecanismo de merge de LoRA nativo de ComfyUI, la LoRA TaoMate H3 3-step MAXQUALITY en strength 1.0: cada capa lineal int8 ConvRot parcheada se descuantiza, se le suma la LoRA y se vuelve a cuantizar. Todos los tensores que la LoRA no modifica son byte a byte idénticos al fichero oficial, en su dtype original.

Respecto al entrenamiento, no se han publicado datos sobre el número de tokens, la composición del dataset ni el proceso de destilación de la LoRA más allá de que se trata de una destilación de pasos (step-distillation) que reduce el muestreo de 20 a 3 pasos. El modelo usa un VAE de vídeo específico (`minimax_h3_video_vae_int8_convrot`) y un codificador de texto basado en Qwen3-VL 32B en formatos nvfp4 AWQ o int8 ConvRot.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio sincronizado incluido en la salida.
- Generación de vídeo a partir de imagen (image-to-video), según el pipeline indicado en Hugging Face.
- Síntesis de labios (lip sync) para diálogos con dos personajes y dos voces.
- Representación de texto legible dentro del vídeo (por ejemplo, carteles de neón), con calidad variable según resolución.
- Movimiento corporal completo, cámara en mano y escenas con multitudes.
- Muestreo acelerado en 3 pasos gracias a la LoRA de destilación fusionada, sin necesidad de nodo LoRA adicional.
- Compatibilidad total con ComfyUI estándar (soporte nativo de MiniMax H3) y con SageAttention.
- Integración en flujos de trabajo de ComfyUI como nodo de difusión convencional (Load Diffusion Model).

## Casos de uso

- Prototipado rápido de vídeo generativo: con 3 pasos de muestreo, un clip de 124 fotogramas a 864×480 se muestrea en unos 8,7 segundos en una RTX 4090, lo que permite iterar prompts decenas de veces por hora.
- Generación de diálogos con personajes: el modelo mantiene rostros estables y lip sync alternado con dos voces, útil para escenas de conversación con sonido.
- Contenido publicitario con texto en pantalla: puede renderizar carteles legibles como "OPEN ALL NIGHT" a 480p, adecuado para spots con rótulos.
- Escenas musicales y de interpretación: genera manos sobre teclado con música sincronizada, aplicable a clips musicales o contenido de redes sociales.
- Vídeo con movimiento de cámara y acción: soporta movimientos de cámara, lluvia, reflejos y trucos de skate con público, útil para B-roll generativo.
- Producción local sin GPU de datacenter: cabe en tarjetas de 24 GB (RTX 3090/4090) usando la ruta int8 de ComfyUI, evitando costes de API.
- Pipelines de previsualización en estudios de animación o VFX: la velocidad de 3 pasos permite generar animatics antes de renders finales de mayor calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, VBench, etc.) en la información disponible. Sí hay mediciones de tiempo de inferencia del propio autor, en una RTX 4090 a 2235 MHz con ComfyUI y SageAttention, para clips de 124 fotogramas:

| Configuracion | 864×480 | 1344×768 |
|---|---|---|
| Este modelo, 3 pasos (sampler) | 8,7 s | 27,5 s |
| Este modelo, 3 pasos (total con decodificado y guardado) | ~16,1-16,4 s | ~35,2-39,2 s |
| MiniMax H3 int8 oficial, 20 pasos (sampler) | ~51 s | ~184 s |

La aceleración del sampler es de aproximadamente 5,9x a 480p y 6,7x a 768p frente al modelo base de 20 pasos.

## Requisitos de hardware

- VRAM estimada: el fichero ocupa 21,0 GB en disco; en tarjetas de 24 GB funciona en GPU, aunque en resoluciones grandes puede requerir streaming desde RAM según el autor.
- GPU recomendadas: RTX 4090 (24 GB) es la tarjeta de referencia de los tests; cualquier GPU con 24 GB de VRAM y soporte CUDA moderno es adecuada.
- Consumer GPU: sí, cabe en tarjetas de 24 GB como la RTX 3090 y la RTX 4090. En tarjetas de 16 GB probablemente requiera offload, aunque no hay datos publicados.
- Software: ComfyUI con soporte nativo de MiniMax H3; se recomienda PyTorch compilado para CUDA 13.0 o superior. SageAttention es opcional y acelera la inferencia.
- Componentes adicionales necesarios (de Comfy-Org/MiniMax-H3): codificador de texto `qwen3vl_32b_minimax_h3_nvfp4_awq` o `qwen3vl_32b_minimax_h3_int8_convrot`, y VAE `minimax_h3_video_vae_int8_convrot`.
- Configuración de muestreo recomendada: sampler `res_multistep`, sigmas manuales `1.0, 0.9601, 0.8575, 0` (3 pasos), BasicGuider sin CFG y SamplerCustomAdvanced. Alternativas sugeridas por la LoRA: `euler` o `er_sde`, scheduler `simple`, video shift 8-12 (audio 3).
- Latencia y throughput: ver tabla de la sección anterior; no se han publicado cifras para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Pasos de muestreo | Audio | Licencia |
|---|---|---|---|---|---|
| MiniMax H3 Experimental (este) | no disponible | int8 ConvRot | 3 (LoRA destilada fusionada) | Sí | MiniMax H3 Community License |
| MiniMax H3 int8 oficial (Comfy-Org) | no disponible | int8 ConvRot | 20 | Sí | MiniMax H3 Community License |
| TaoMate H3 3-step LoRA (Asirus, LoRA separada) | no disponible | bf16 (LoRA) | 3 | Sí | no disponible |

La ventaja de esta variante frente a usar el modelo oficial más la LoRA por separado es que el merge evita que las capas parcheadas se ejecuten en bf16 durante el streaming desde RAM, manteniendo la ruta int8 rápida a cualquier resolución. Comparado con otros generadores de vídeo de consumo como Wan 2.x o HunyuanVideo, no hay datos comparativos publicados en la información disponible.

## Limitaciones y advertencias

- Es un fichero modificado no oficial: aunque el autor documenta el proceso de merge y verifica que los tensores no modificados son byte a byte idénticos al oficial, no cuenta con el respaldo directo de MiniMax ni de Comfy-Org.
- La destilación a 3 pasos degrada la fidelidad en escenas complejas: en los propios tests, un perro saltando al agua no llega a saltar visiblemente y el texto de carteles puede salir garabateado a 768p.
- La calidad de los detalles finos (manos, texto en pantalla, movimientos rápidos) es claramente mejor a 1344×768 que a 864×480.
- No se han publicado datos sobre sesgos del modelo, tasa de alucinación ni evaluaciones formales.
- La licencia es el MiniMax H3 Community License Agreement (tipo "other"): conviene revisar sus términos antes de cualquier uso comercial, ya que las licencias comunitarias suelen tener restricciones de ingresos, uso o atribución.
- No hay información sobre idiomas soportados por el codificador de texto ni sobre límites documentados de resolución o duración más allá de los clips de prueba de 5,2 segundos (124 fotogramas).
- El proyecto es muy reciente y con adopción mínima (79 descargas y 1 like en el momento de la ficha), por lo que la documentación y el soporte comunitario son limitados.

## Enlaces

- Ficha del modelo en Hugging Face: https://huggingface.co/PedroMarinhoDev/MiniMax-H3-Experimental
- Modelo base oficial para ComfyUI (checkpoint int8, text encoder y VAE): https://huggingface.co/Comfy-Org/MiniMax-H3
- LoRA TaoMate H3 3-step: https://huggingface.co/Asirus/TaoMate_H3_3_Step_LoRA
- TaoMate-H3 (equipo TaoLive AIGC): https://huggingface.co/TaoLiveAIGC/TaoMate-H3
