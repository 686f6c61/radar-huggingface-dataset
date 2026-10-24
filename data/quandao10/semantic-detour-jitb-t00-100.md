# quandao10/semantic-detour-jitb-t00-100

## Resumen

Semantic Detour Flow (JiT-B/16) es un modelo de generación de imágenes incondicional/label-conditional en espacio de píxeles, entrenado sobre ImageNet 256×256, que introduce una variante de flow matching llamada "detour": el estado ruidoso no va directamente del ruido gaussiano a los píxeles, sino que pasa por el código semántico de DINOv2-B antes de llegar al RGB. El autor es el usuario de HuggingFace quandao10 y el checkpoint publicado corresponde a 20 épocas de entrenamiento con batch 1024 (ventana estándar (0, 1) de la transferencia code→imagen). El repositorio ocupa 3,6 GB y contiene tres conjuntos de pesos (raw y dos EMA), la configuración de entrenamiento y las estadísticas de normalización del código DINOv2-B necesarias para construir el modelo.

La relevancia es fundamentalmente de investigación: el autor reporta que este detour reduce el FID-10k de 98,1 (JiT-B/16 en píxeles puro, mismas épocas) a 66,6, y el FID-50k a 63,9, con un IS de 24,3 (10k). Son cifras de un checkpoint de 20 épocas, muy lejos del estado del arte, pero el resultado sugiere que forzar una representación semántica intermedia durante el proceso generativo acelera la convergencia en modelos de difusión/flow en píxeles.

Arquitectura: JiT-B/16 modificado, sin cuello de botella de patches y con una cabeza ancha estilo RAE DiT^DH, más dos cabezas de salida (imagen limpia x̂ y código DINOv2-B ĉ). El muestreo es una ODE en píxeles con sampler de Heun, sin encoder ni decoder en tiempo de inferencia. El modelo no es un LLM: no procesa texto ni tiene ventana de contexto en tokens, por lo que varias filas de la ficha técnica no aplican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión/flow matching en espacio de píxeles, JiT-B/16 modificado (sin bottleneck de patches, cabeza ancha RAE DiT^DH de 2 bloques y anchura 2048, adaLN por token) con doble cabeza de salida (imagen y código DINOv2-B) |
| Parametros totales | no disponible (el autor solo indica la designación JiT-B/16, variante Base con patch de 16×16; no publica el recuento) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica (generación de imágenes; resolución fija 256×256, patch 16×16) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, presumiblemente bf16; no hay GGUF ni versiones cuantizadas) |
| Idiomas soportados | no disponible / no aplica (no es un modelo de lenguaje; las clases son las 1000 de ImageNet, en inglés) |
| Licencia | no disponible (la model card no declara licencia; sin licencia explícita no se concede uso comercial) |
| Formato de pesos | safetensors (`model_ema2_0.9996.safetensors`, `model_raw.safetensors`, `model_ema1_0.9999.safetensors`) + `detour_init_dinov2b_C768.pt` (estadísticas de normalización) y `training_args.json` |

## Arquitectura y entrenamiento

El modelo parte de JiT-B/16 (JiT = "Just-in-Time"/flow matching en píxeles) con dos modificaciones: se elimina el cuello de botella de patches (`--bottleneck_dim 768`) y se añade una cabeza ancha al estilo RAE DiT^DH, con 2 bloques de anchura 2048, adaLN por token derivado de las features del encoder y su propio patchify de 16×16 a anchura completa sobre la entrada ruidosa (`--ddt_head_dim 2048`). Hay dos cabezas de salida: la imagen limpia x̂ y el código DINOv2-B ĉ, este último embebido en espacio de píxeles mediante un PixelShuffle fijo. La pérdida es error cuadrático sobre la velocidad de la trayectoria del detour, con una transición smoothstep w(t) = 3t² − 2t³ que reparte la transferencia del objetivo desde el código hacia la imagen a lo largo de todo el eje temporal (t = 0 ruido, t = 1 imagen limpia).

Entrenamiento: ImageNet 256×256 class-conditional, batch 1024, 20 épocas, AdamW con lr 2e-4, 5 épocas de warm-up, muestreo de t logit-normal (media −0,8, desviación 0,8), 10 % de label dropout y precisión bf16. No se menciona RLHF, DPO ni ajuste por preferencias (no aplica a un generador de imágenes). El muestreo es una ODE en píxeles con sampler de Heun; el autor indica que hacen falta unas 4 llamadas a red para obtener una disposición reconocible y unas 10 para la composición final, y que una sola llamada devuelve el patrón de código y no una imagen. La guía libre de clasificador (CFG) solo altera el contenido si actúa con t < 0,1, por lo que recomienda `interval_min = 0.0` en lugar del intervalo por defecto [0,1] de JiT.

## Capacidades

- Generación de imágenes class-conditional de ImageNet a 256×256 en espacio de píxeles, sin VAE ni decoder en el muestreo.
- Muestreo por ODE con tres samplers seleccionables: `heun`, `euler` y `remix` (paso de endpoint-remix propio del detour), y dos rejillas temporales: `uniform` y `jump`.
- Soporte de classifier-free guidance, útil únicamente aplicado a t < 0,1 (donde el estado es mayoritariamente código semántico).
- Salida dual: imagen limpia x̂ y código DINOv2-B ĉ, lo que permite inspeccionar la representación semántica intermedia.
- Tres juegos de pesos con distinto compromiso: EMA2 (0,9996, recomendado), raw (oscila ±13 FID entre checkpoints) y EMA1 (0,9999, rezagado a 20 épocas).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, visión de entrada ni audio. No es multilingüe ni procesa prompts en lenguaje natural: la condición es un id de clase de ImageNet.

## Casos de uso

- Investigación en flow matching y difusión en píxeles: reproducir el experimento de "detour" semántico y medir su efecto en la convergencia comparando contra JiT-B/16 puro con las mismas 20 épocas y batch 1024.
- Estudio de representaciones intermedias: la doble cabeza permite analizar cómo se alinea el código DINOv2-B con la imagen generada y en qué tramo de t se produce la transferencia (la smoothstep reparte la responsabilidad en todo el eje temporal).
- Ablación de ventanas de detour: el autor publica variantes (0, 1), (0.10, 1.00) y (0.40, 0.85) con FID-10k de 66,6, 68,6 y 89,2 respectivamente, lo que sirve como base para estudiar el impacto del intervalo en la calidad.
- Benchmark interno de pipelines de evaluación: validar cadenas de cálculo de FID-10k/FID-50k/IS contra las estadísticas de entrenamiento de ImageNet-256 de JiT y el EMA 0,9996.
- Punto de partida para continuar el entrenamiento: el autor indica que una continuación de 40 épocas de esta misma ejecución está en marcha, por lo que el checkpoint raw sirve para reanudar experimentos con `training_args.json`.
- Docencia y divulgación técnica: ilustrar la diferencia entre modelar píxeles directamente y hacerlo a través de un espacio latente semántico, con código de muestreo mínimo (~15 líneas) y pesos de 3,6 GB.
- Generación sintética de bajo rigor para pruebas de pipelines de imagen: útil para tests de carga y formato de 256×256 con clases controladas, no para datos de entrenamiento de producción por la falta de detalle fino.

## Benchmarks y rendimiento

Datos reportados por el autor, sin guía (cfg 1,0), Heun 50 pasos, sobre los pesos EMA2 (0,9996), FID calculado contra las estadísticas de entrenamiento de ImageNet-256 de JiT:

| Modelo (20 epocas, batch 1024) | FID-10k ↓ | FID-50k ↓ | IS ↑ (10k) |
|---|---|---|---|
| Este checkpoint, Detour (0, 1), EMA2 | 66,6 | 63,9 | 24,3 |
| Detour (0.10, 1.00), mismo setup (no en este repo) | 68,6 | no disponible | 24,0 |
| Detour (0.40, 0.85), release anterior | 89,2 | no disponible | 18,2 |
| JiT-B/16 en píxeles puro, mismas epocas | 98,1 | no disponible | 12,8 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ninguna tarea de lenguaje, lógica o código: el modelo no las cubre. Tampoco hay mediciones de latencia o throughput publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay medición publicada. El repositorio completo ocupa 3,6 GB e incluye tres checkpoints más un fichero auxiliar, por lo que un único checkpoint en bf16 debería situarse en el orden de 1-2 GB de pesos; con activaciones para 256×256 y batch pequeño, el modelo debería caber holgadamente en 8 GB. Estimación orientativa, no confirmada por el autor.
- GPU recomendadas: cualquier GPU con soporte bf16 y al menos 8 GB (RTX 3060 12 GB, RTX 4070, RTX 4090, L4, A10). Para barridos de FID a 10k/50k muestras conviene A100/H100 por throughput agregado.
- Cabe en GPU de consumo: sí, previsiblemente en todas las tarjetas con 8 GB o más, dado el tamaño del checkpoint.
- Opciones de despliegue: no hay soporte para vLLM, TGI, llama.cpp ni Ollama (no es un modelo de lenguaje). El autor requiere el código del proyecto (`JiT/` del repositorio rae_pixel) y su entorno, cargando pesos con `safetensors.torch.load_file` y construyendo `Denoiser(args)`.
- Latencia y throughput: el autor indica aproximadamente 4 llamadas a red para una disposición reconocible y unas 10 para la composición final; la configuración de referencia usa Heun con 50 pasos (~100 evaluaciones de red), lo que multiplica el coste por muestra. No se publican cifras de segundos por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | FID-10k | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Semantic Detour JiT-B/16, detour (0, 1), 20 ep. | no disponible (JiT-B/16) | 256×256 | 66,6 | no disponible | HuggingFace, repo de 3,6 GB con 3 checkpoints |
| Semantic Detour JiT-B/16, detour (0.40, 0.85) | no disponible (JiT-B/16) | 256×256 | 89,2 | no disponible | HuggingFace (release anterior) |
| JiT-B/16 en píxeles puro, 20 ep. | no disponible (JiT-B/16) | 256×256 | 98,1 | no disponible | vía proyecto JiT / rae_pixel |
| DiT, SiT, U-ViT y familia latente (SD, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables en la informacion proporcionada para comparar con generadores de ImageNet ampliamente citados (DiT-XL/2, SiT-XL/2, masked generative models); cualquier cifra al respecto requeriría consultar sus publicaciones originales. La comparación relevante aquí es interna a la familia JiT, donde el detour semántico mejora el FID-10k en 31,5 puntos frente al modelo en píxeles puro y en 22,6 puntos frente a la ventana (0.40, 0.85).

## Limitaciones y advertencias

- Checkpoint de investigación con solo 20 épocas: los objetos son reconocibles pero falta detalle fino y algunas muestras presentan costuras de 16 píxeles.
- Los pesos raw oscilan aproximadamente ±13 FID entre checkpoints en esta fase; usar siempre `model_ema2_0.9996.safetensors` para resultados reproducibles.
- Una sola llamada a red devuelve el patrón de código, no una imagen: hacen falta del orden de 10 evaluaciones para la composición final, lo que encarece el muestreo.
- La guía libre de clasificador es casi inefectiva con el intervalo por defecto [0,1] de JiT; hay que fijar `interval_min = 0.0`.
- Licencia no declarada: sin licencia explícita no se concede permiso de uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- El modelo está condicionado a las 1000 clases de ImageNet en inglés y no acepta prompts de texto; no sirve para generación guiada por lenguaje natural.
- Riesgo de sesgos heredados de ImageNet (representación desigual por clase, estereotipos visuales) y de alucinación visual en forma de objetos mal formados, texturas incoherentes y clases mezcladas.
- Calidad insuficiente para producción: FID-50k de 63,9 está muy lejos del estado del arte en ImageNet 256×256; es una prueba de concepto arquitectónica.
- Dependencia del código del proyecto `JiT/` del repositorio rae_pixel y de `detour_init_dinov2b_C768.pt` para construir el modelo; no es un checkpoint autónomo de `transformers` ni de `diffusers`.
- El repositorio se creó y actualizó el 23 de octubre de 2026 con 0 descargas y 0 likes: no hay validación independiente de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/quandao10/semantic-detour-jitb-t00-100
- Release anterior con ventana (0.40, 0.85): https://huggingface.co/quandao10/semantic-detour-jitb-t40-85
- Codigo del proyecto (repositorio rae_pixel, carpeta `JiT/`): referenciado en la model card sin URL directa; no disponible como enlace verificado.
- Paper, blog o demo: no disponibles en la informacion proporcionada.
- La busqueda web no devolvio resultados tecnicos relevantes sobre este modelo (solo paginas sin relacion con el contenido); no se incluyen.
