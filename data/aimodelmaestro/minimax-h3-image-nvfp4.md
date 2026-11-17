# AIModelMaestro/MiniMax-H3-Image-NVFP4

## Resumen

MiniMax-H3-Image-NVFP4 es una conversión no oficial del modelo de generación de imágenes MiniMax-H3-Image de MiniMax, cuantizada a 4 bits en formato NVFP4 para su uso en ComfyUI sobre GPUs Blackwell (RTX 5090). El autor, AIModelMaestro, no está afiliado a MiniMax ni a Comfy-Org: se limita a cuantizar 200 capas lineales del repack pruned en bf16 de Comfy-Org, sin reentrenar ningún peso. El resultado es un único archivo de 12,5 GB que cabe en 32 GB de VRAM y permite generar imágenes de hasta 16,8 megapíxeles en 6 pasos.

El modelo base es un generador de imágenes texto-a-imagen y edición con imágenes de referencia, con pipeline `text-to-image` y capacidades declaradas de image-to-image y edición. Esta variante NVFP4 está pensada exclusivamente para el ecosistema ComfyUI 0.45 o superior con PyTorch 2.10 compilado para CUDA 13 (`cu130`); con compilaciones `cu128` el backend CUDA de 4 bits queda desactivado y la inferencia se vuelve lenta.

La relevancia de esta ficha es doble: por un lado, demuestra que la cuantización NVFP4 permite ejecutar un modelo de difusión de gran tamaño en hardware de consumo de gama alta; por otro, arrastra una restricción de licencia crítica, ya que la MiniMax-H3-Image Community License Agreement excluye explícitamente la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusión para generación de imágenes (detalles de la arquitectura interna no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | NVFP4 (4 bits), 200 capas lineales cuantizadas; original en bf16 |
| Idiomas soportados | en |
| Licencia | MiniMax-H3-Image Community License Agreement (excluye UE, Reino Unido, Corea del Sur y EE. UU.) |
| Formato de pesos | safetensors (`minimax_h3_image_pruned_nvfp4.safetensors`, 12,5 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base MiniMax-H3-Image (tipo de backbone, número de parámetros, composición del dataset o si hubo RLHF/DPO). Lo que sí se documenta es el proceso de conversión: se parte del repack de Comfy-Org `minimax_h3_image_pruned_bf16.safetensors` (obtenido de ModelScope con verificación sha256), y se cuantizan 200 capas lineales a NVFP4. No se reentrena ningún peso, por lo que las capacidades del modelo son las del original, con la degradación propia de una cuantización a 4 bits.

La innovación técnica de esta variante es la cuantización NVFP4 con backend CUDA nativo, que permite ejecutar el modelo en una RTX 5090 con un pico de 27,6 GB a 4 MP (31,1 GB con imágenes de referencia). El modelo funciona con un scheduler de pocos pasos: 6 pasos, CFG 1, sampler euler y scheduler simple, lo que reduce drásticamente el coste de inferencia frente a esquemas de decodificación iterativa más largos.

## Capacidades

- Generación de imágenes texto-a-imagen a resoluciones de hasta 16,8 megapíxeles (por ejemplo, 4096x4096).
- Edición con imágenes de referencia (image-to-image y reference-picture editing).
- Generación de carteles y composiciones con texto integrado (se muestran muestras de pósteres a 2048x2048 y 4096x4096).
- Inferencia en muy pocos pasos (6 pasos, CFG 1) con sampler euler y scheduler simple.
- Integración nativa en ComfyUI mediante los nodos `UNETLoader`, `CLIPLoader` (type `minimax`), `MiniMaxH3ImageConditioning`, `KSampler` y `VAEDecode`.
- Soporte de imágenes de referencia opcionales en el nodo de condicionamiento.
- Idioma de prompting: inglés (`en`).

## Casos de uso

- Generación de imágenes de alta resolución para impresión o cartelería: el modelo produce 4096x4096 (16,8 MP) en unos 16 segundos en una RTX 5090, adecuado para materiales que requieren detalle fino sin reescalado posterior.
- Creación rápida de borradores visuales: a 4 MP genera en torno a 3 segundos por imagen con la misma semilla y 3,3-3,4 segundos con un prompt nuevo, lo que permite iterar sobre variaciones de concepto en sesiones de diseño.
- Edición con imagen de referencia: el nodo `MiniMaxH3ImageConditioning` acepta imágenes de referencia, útil para mantener consistencia de estilo o composición entre entregas de una misma campaña.
- Generación de carteles con texto: las muestras incluyen pósteres con texto a 2048x2048 y 4096x4096, un caso práctico para prototipado de material promocional.
- Prototipado en estaciones de trabajo con una sola GPU: con un pico de 27,6 GB a 4 MP, cabe en una RTX 5090 de 32 GB, lo que permite montar un puesto de generación local sin clúster.
- Automatización de pipelines de contenido en ComfyUI: al cargarse con nodos estándar (`UNETLoader`, `CLIPLoader`, `KSampler`), se puede encadenar en flujos por lotes para generar variantes de imágenes a partir de listas de prompts.
- Evaluación de cuantización NVFP4: sirve como banco de pruebas para medir la diferencia de píxel frente a los pesos completos en bf16 (el autor reporta una diferencia media de 10,4 entre dos renders bf16 en tarjetas distintas, como suelo de ruido de referencia).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica métricas de velocidad y VRAM medidas en una RTX 5090 alquilada, con el text encoder NVFP4 y el VAE cargados, 6 pasos, CFG 1, euler/simple:

| Escenario | Tiempo | Notas |
|---|---|---|
| Imagen 4 MP (2720x1536) | 2,9-3,0 s | misma semilla; 3,3-3,4 s con prompt nuevo |
| Imagen 16,8 MP (4096x4096) | 15,7-16,6 s | texto-a-imagen |
| Imagen 3840x2176 | 7,2 s | prompt nuevo, semilla 1113 |
| Arranque en frío hasta la primera imagen 4 MP | 13,0 s | pesos ya en page cache |
| VRAM pico a 4 MP | 27,6 GB | con text encoder NVFP4 |
| VRAM pico con imágenes de referencia | 31,1 GB | — |

## Requisitos de hardware

- VRAM estimada: 27,6 GB de pico a 4 MP y 31,1 GB con imágenes de referencia, según mediciones del autor en una RTX 5090.
- GPU recomendada: NVIDIA RTX 5090 (Blackwell, 32 GB). Es el hardware sobre el que se han hecho todas las mediciones publicadas.
- Compatibilidad con GPUs de consumo: sí, en RTX 5090; no hay datos publicados para otras GPUs de consumo con menos VRAM.
- Software: ComfyUI 0.45 o superior y PyTorch 2.10 compilado para CUDA 13 (`cu130`). Con `cu128` el backend CUDA de 4 bits se desactiva y la inferencia a 4 bits es lenta.
- Ficheros adicionales necesarios: text encoder NVFP4 (en `ComfyUI/models/text_encoders/`) y VAE (en `ComfyUI/models/vae/`); ninguno de los dos está incluido en el repositorio.
- Opciones de despliegue: ComfyUI con `UNETLoader` (`weight_dtype` = `default`), `CLIPLoader` (type `minimax`), `MiniMaxH3ImageConditioning`, `KSampler` y `VAEDecode`. No requiere nodos personalizados.
- Latencia y throughput: aproximadamente 3 s por imagen de 4 MP y 16 s por imagen de 16,8 MP en RTX 5090.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image-NVFP4 (esta ficha) | no disponible | no aplica | 4 MP en ~3 s; 16,8 MP en ~16 s en RTX 5090 | MiniMax-H3-Image Community License (excluye UE, RU, Corea del Sur y EE. UU.) | Hugging Face, 12,5 GB |
| MiniMaxAI/MiniMax-H3-Image (original bf16) | no disponible | no aplica | referencia de calidad; velocidad no disponible en esta ficha | MiniMax-H3-Image Community License | Hugging Face |
| Comfy-Org `minimax_h3_image_pruned_bf16.safetensors` (repack pruned) | no disponible | no aplica | base de la conversión; velocidad no disponible en esta ficha | MiniMax-H3-Image Community License | ModelScope / Comfy-Org |

No se dispone de datos de benchmarks ni de especificaciones de otros modelos de difusión comparables en la información proporcionada, por lo que la comparativa se limita a las tres variantes del mismo modelo base.

## Limitaciones y advertencias

- Restricción de licencia crítica: la MiniMax-H3-Image Community License Agreement no cubre la Unión Europea, el Reino Unido, Corea del Sur ni Estados Unidos. El uso comercial en esas jurisdicciones queda fuera del alcance de la licencia.
- Conversión no oficial: el archivo no está hecho, respaldado ni soportado por MiniMax ni por Comfy-Org; los pesos han sido modificados mediante cuantización.
- Degradación por cuantización: la cuantización NVFP4 de 200 capas lineales introduce diferencias de píxel frente a los pesos completos en bf16; el propio autor advierte que la métrica de diferencia mide cambio, no calidad.
- Dependencia estricta de software: requiere ComfyUI 0.45+ y PyTorch 2.10 con CUDA 13; con otras compilaciones el rendimiento a 4 bits se degrada.
- Dependencia de hardware: todas las mediciones son en RTX 5090; no hay datos de funcionamiento en GPUs con menos de 32 GB de VRAM.
- Idioma: solo inglés (`en`) declarado; el rendimiento con prompts en castellano no está documentado.
- Riesgo de alucinación visual y sesgos: no hay información publicada sobre sesgos del modelo base ni sobre tasas de error en la generación de texto dentro de imágenes.
- Ficheros externos obligatorios: el text encoder NVFP4 y el VAE no están incluidos en el repositorio y deben obtenerse por separado.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria disponible.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/AIModelMaestro/MiniMax-H3-Image-NVFP4
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Repack de Comfy-Org: `minimax_h3_image_pruned_bf16.safetensors` (distribuido vía ModelScope; no se proporciona URL directa en la información disponible)
- Licencia: archivo `LICENSE` y `NOTICE` dentro del repositorio de Hugging Face
- ComfyUI: no se proporciona URL en la información disponible
