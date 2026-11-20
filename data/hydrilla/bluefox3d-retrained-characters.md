# Hydrilla/BlueFox3D-retrained-characters

## Resumen

BlueFox3D-retrained-characters es un paquete de ajuste fino (finetune) del modelo de generación 3D a partir de imagen Hydrilla/BlueFox3D, desarrollado por Hydrilla. No se trata de un modelo nuevo ni de un reentrenamiento completo, sino de un conjunto de cuatro denoizadores de la cascada 1536 (SS-64, shape-512, shape-1024 y tex-1024) reajustados sobre un subconjunto reducido de Objaverse-LVIS con formas de aspecto humanoide y de personaje. El objetivo es especializar el modelo base en la generación de mallas 3D con texturas PBR a partir de una única imagen de entrada.

El modelo mantiene la arquitectura del original: un pipeline de difusión en cascada con transformadores tipo DiT de aproximadamente 1,3 mil millones de parámetros por etapa, que combina un modelo de flujo imagen-a-SS (64), un flujo imagen-a-forma (512 y 1024) y un flujo forma-a-textura (1024). El ajuste afecta únicamente a los últimos 4 de los 30 bloques del transformer más la capa de salida de cada etapa, con 1000 pasos de entrenamiento por etapa sobre una única GPU NVIDIA L4 de 24 GB.

La relevancia de este paquete es acotada y experimental: el propio autor advierte que no sustituye al modelo base y que no debe considerarse una mejora de calidad hasta que una comparación con hold-out lo confirme. Su interés principal reside en documentar un flujo de finetune de bajo coste sobre hardware consumer/prosumer para especializar modelos de generación 3D en dominios concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascada de difusión con transformers DiT (flujo SS-64, forma-512, forma-1024, textura-1024) |
| Parametros totales | Aproximadamente 1,3B por etapa (4 etapas en el pipeline) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen a malla 3D, no de texto) |
| Tipos de cuantizacion | Pesos en bf16 (safetensors); no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (modelo multimodal imagen a 3D) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) y pipeline.json |
| Resolucion de inferencia | 1536 (cascada) |
| GPU de entrenamiento | 1x NVIDIA L4 24 GB |
| Tamano del repositorio | 22,0 GB |

## Arquitectura y entrenamiento

El pipeline sigue el diseño de Pixal3D / TRELLIS.2: una cascada de modelos de flujo que transforma una imagen en una representación latente estructurada (SS, *structured latents*), después en una malla a resolución 512 y 1024, y finalmente en mapas de textura PBR a 1024. Cada etapa es un transformer DiT de aproximadamente 1,3B parámetros. Los VAEs de SS, forma y textura provienen del modelo base y no se han reentrenado.

El ajuste fino se realizó sobre un subconjunto de Objaverse-LVIS con categorías afines a personajes (person, teddy bear, doll, figurine, statue, mannequin, puppet, action figure, toy soldier, snowman, scarecrow). Se descargaron 150 GLB, de los cuales 149 se usaron para entrenamiento (dual-grid, SS y forma) y 120 para la etapa de textura (el volcado de shaders falló en el resto). Se reservaron 20 GLB como hold-out que nunca se usaron en entrenamiento. Solo se entrenaron los últimos 4 de los 30 bloques del transformer más `out_layer` en cada etapa, con AdamW de 8 bits, learning rate 1e-5, batch 1 por GPU, `max_tokens` 2048 en las etapas de 1024 y sin EMA. Se ejecutaron 1000 pasos por etapa nueva; la etapa shape-512 reutiliza un finetune de personajes previo. No hay RLHF ni DPO: es un finetune supervisado de difusión.

## Capacidades

- Generación de mallas 3D texturizadas a partir de una única imagen RGB de entrada.
- Producción de mapas PBR a resolución 2048 en la salida final.
- Generación de geometría de alta densidad: en el benchmark de 15 imágenes, una media de 203.623 vértices y 214.524 caras por activo.
- Especialización en formas de tipo personaje, figura, estatuilla o juguete, derivada del subconjunto de entrenamiento.
- Inferencia en cascada con control de semilla (`--seed`) y resolución (`--resolution 1536`).
- Modo de bajo consumo de VRAM (`--low_vram`) para GPUs de 24 GB.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural: es un modelo puramente imagen a 3D.

## Casos de uso

- Prototipado rápido de assets 3D para videojuegos: a partir de un concepto 2D de un personaje se obtiene una malla con texturas PBR en unos 4,4 minutos en una L4, útil para blockouts y pruebas de escala antes de modelado manual.
- Generación de figuritas y coleccionables: el finetune está orientado a categorías como figurine, statue o action figure, por lo que es adecuado para pipelines de impresión 3D o renderizado de catálogo a partir de fotos de producto.
- Creación de avatares y personajes para entornos XR: la salida con mapas PBR a 2048 permite integrar el asset en motores como Unity o Unreal con materiales listos para usar.
- Poblar escenas con variaciones de un mismo personaje: el control de semilla y la naturaleza generativa permiten producir múltiples mallas coherentes a partir de una imagen de referencia.
- Investigación en finetune de modelos 3D: el paquete documenta un procedimiento reproducible de ajuste de bajo coste (4 bloques, 1000 pasos, una L4) sobre un dataset reducido, útil como referencia metodológica.
- Evaluación comparativa de generadores imagen a 3D: sirve como variante controlada del modelo base para medir el efecto de un finetune de dominio sobre métricas de geometría y textura.
- Docencia y experimentación con modelos de difusión 3D: al requerir solo 24 GB de VRAM con `--low_vram`, es accesible en entornos académicos con GPUs de gama profesional.

## Benchmarks y rendimiento

Benchmark de 15 imágenes sobre una única NVIDIA L4 (24 GB), semilla 42:

| Modelo | Completados | Tiempo medio por activo | Vertices medios | Caras medias | Tamano GLB medio | Tipo de salida |
|---|---:|---:|---:|---:|---:|---|
| BlueFox3D (stock) | 15/15 | 4,2 min (254 s) | 199.836 | 214.576 | 11,3 MB | Mapas PBR 2048 |
| BlueFox3D (Char Pack) | 15/15 | 4,4 min (266 s) | 203.623 | 214.524 | 11,7 MB | Mapas PBR 2048 |
| TRELLIS.2-4B | 15/15 | 9,4 min (564 s) | 219.553 | 239.819 | 19,7 MB | Mapas PBR 2048 |
| Hunyuan3D-2.1 | 15/15 | 11,8 min (709 s) | 31.939 | 40.000 | 6,2 MB | Malla pintada (remesh 40k) |
| Hi3DGen | 15/15 | 1,5 min (88 s) | 426.673 | 853.476 | 19,5 MB | Malla de arcilla (sin PBR) |

Prueba aislada sobre `21_img.png` (semilla 42, 1536, `--low_vram`, decimación a 250k):

| Modelo | Vertices | Caras | Tamano GLB | Tiempo |
|---|---:|---:|---:|---:|
| BlueFox3D (stock) | 211.389 | 246.891 | 14,0 MB | 376 s |
| Este pack (4 etapas) | 197.039 | 236.397 | 13,2 MB | 396 s |

El autor indica que el pack reproduce artefactos del modelo base (un bastón espurio en `21_img`, una losa en la base en `5_img`) y que en `21_img` la salida es más fragmentada que la del stock.

## Requisitos de hardware

- VRAM estimada: 18-22 GB con `--low_vram` a resolución 1536; sin esa opción se requieren más de 40 GB.
- GPU recomendadas: NVIDIA L4 (24 GB, la usada en entrenamiento y benchmark), A100, H100 o RTX 4090 (24 GB) para inferencia con `--low_vram`.
- Cabe en GPUs consumer de 24 GB (RTX 3090, RTX 4090) siempre que se active `--low_vram`.
- Despliegue: script `inference.py` del repositorio HydrillaAI/Bluefox3D; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de difusión 3D).
- Latencia: aproximadamente 4,4 minutos por activo en una L4 a resolución 1536 con `--low_vram` (266 s de media en el benchmark de 15 imágenes); 396 s en la prueba de `21_img`.
- Almacenamiento: 22,0 GB de repositorio, más los VAEs y decodificadores del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Tiempo por activo (L4) |
|---|---|---|---|---|---|
| BlueFox3D-retrained-characters | ~1,3B por etapa (4 etapas) | No aplica | Malla + PBR 2048 | MIT | 4,4 min |
| Hydrilla/BlueFox3D (stock) | ~1,3B por etapa (4 etapas) | No aplica | Malla + PBR 2048 | MIT | 4,2 min |
| microsoft/TRELLIS.2-4B | 4B | No aplica | Malla + PBR 2048 | No disponible en la información | 9,4 min |
| tencent/Hunyuan3D-2.1 | No disponible | No aplica | Malla pintada (remesh 40k) | No disponible en la información | 11,8 min |
| Stable-X/trellis-normal-v0-1 (Hi3DGen) | No disponible | No aplica | Malla de arcilla sin PBR | No disponible en la información | 1,5 min |

El pack se posiciona como una variante de dominio del stock BlueFox3D, con métricas de geometría y tiempos casi idénticos. Frente a TRELLIS.2-4B y Hunyuan3D-2.1 es más rápido en L4, y frente a Hi3DGen es más lento pero entrega texturas PBR en lugar de malla de arcilla.

## Limitaciones y advertencias

- No es un sustituto del modelo base: el autor recomienda usar Hydrilla/BlueFox3D como opción por defecto.
- El propio autor advierte que no debe considerarse una mejora de calidad hasta disponer de una comparación con hold-out.
- Entrenado solo con 149 mallas de Objaverse-LVIS y 120 para textura; el dominio queda restringido a formas de tipo personaje, figura o juguete.
- Reproduce artefactos del modelo base, como geometría espuria (bastón en `21_img`, losa en `5_img`).
- En `21_img` la malla resultante es más fragmentada que la del stock.
- Riesgo de sesgos y de sobreajuste a las categorías de LVIS seleccionadas; no se documentan evaluaciones de sesgo.
- Riesgo de alucinación geométrica inherente a los modelos generativos 3D: partes inventadas o mal conectadas en la malla.
- Requiere `--low_vram` en GPUs de 24 GB; sin él, la VRAM necesaria supera los 40 GB.
- Licencia MIT, que permite uso comercial, pero el modelo base y las dependencias upstream (Pixal3D / TRELLIS.2) deben verificarse por separado.
- Solo 1 like y 0 descargas en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/Hydrilla/BlueFox3D-retrained-characters
- Modelo base: https://huggingface.co/Hydrilla/BlueFox3D
- Codigo de entrenamiento y conversion: https://github.com/HydrillaAI/Bluefox3D
- Paper de referencia (Pixal3D): arXiv:2605.10922
- TRELLIS.2-4B: https://huggingface.co/microsoft/TRELLIS.2-4B
- Hunyuan3D-2.1: https://huggingface.co/tencent/Hunyuan3D-2.1
- Hi3DGen: https://huggingface.co/Stable-X/trellis-normal-v0-1
