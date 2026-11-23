# dbirks/clef-omni-int4

## Resumen

clef-omni-int4 es una cuantización INT4 weight-only (W4A16, group size 128, simétrica) del modelo Cloudflare/clef-omni, publicada por el usuario dbirks. El modelo base pertenece a la familia Qwen3-Omni-MoE y está diseñado como "modelo de decisión": en lugar de generar texto libre, recibe un estado (observación, potencialmente multimodal con imagen, audio y vídeo) y un conjunto de preguntas con opciones, y devuelve probabilidades por opción a través de una cabeza de decisión conjunta propia de Clef. La cuantización la realizó Intel AutoRound 0.16.0 (SignRound, 200 pasos de tuning por bloque) sobre registros en formato Clef.

La relevancia de esta variante es práctica: reduce el peso en disco de 70,8 GB (BF16) a 20,8 GB y la VRAM de pesos de unos 60 GiB a unos 19,4 GiB, manteniendo el 96,5% de acuerdo con el modelo BF16 en decisiones retenidas y una puntuación de 56,93 en el Decision Index 0.2.1 (frente a una media de 70,3 del BF16 en esa edición, según la model card). Solo se cuantizan los expertos MoE del "thinker"; atención, router, embeddings, `lm_head`, torres de visión y audio y la cabeza de decisión conjunta permanecen en BF16.

El modelo tiene 6.606.858.864 parámetros totales según los safetensors del repo, licencia Apache 2.0 y se carga de forma nativa en transformers en formato AutoRound. Está pensado para despliegues en GPU recientes (no necesariamente Blackwell) donde el ahorro de VRAM es prioritario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-Omni-MoE (transformer multimodal con mezcla de expertos en el "thinker" y cabeza de decisión conjunta Clef) |
| Parametros totales | 6.606.858.864 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 weight-only W4A16, group size 128, simétrica (formato AutoRound / auto_gptq packing); activaciones BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato AutoRound, cargable nativamente en transformers) |

## Arquitectura y entrenamiento

El modelo base es un Qwen3-Omni-MoE con torres de visión y audio, un bloque "thinker" con capas MoE y una cabeza de decisión conjunta específica de Clef que produce probabilidades por opción en una sola pasada forward. Esta variante cuantizada mantiene en BF16 la atención, el router, los embeddings, el `lm_head`, las torres de visión y audio y la cabeza de decisión (byte-idéntica al original), y solo convierte a INT4 los expertos MoE del thinker.

La receta de cuantización usó AutoRound 0.16.0 con esquema W4A16, 200 iteraciones, 512 muestras en formato Clef pasadas por la ruta forward multimodal real del modelo, batch size 1, acumulación de gradiente de 8 pasos y capas ignoradas `mlp.gate`, `lm_head` y `self_attn`. Se ejecutó sobre una RTX PRO 6000 Blackwell con torch 2.11.0+cu130 y transformers 5.10.2. El handler de Qwen3-Omni de AutoRound desfusiona los expertos fusionados de transformers 5 en lineales por experto. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO).

## Capacidades

- Decisión multimodal: recibe un estado (observación) y un conjunto de preguntas con opciones, y devuelve probabilidades por opción mediante la cabeza de decisión conjunta.
- Entrada de imágenes, audio y vídeo, según la model card del modelo base.
- Respuesta en una sola pasada forward, sin generación autoregresiva de texto libre.
- Probabilidades por opción derivadas de la cabeza BF16 original, lo que permite umbrales y calibración.
- Servicio HTTP mediante `serve_clef.py` con endpoint `/v1/systemone` y comprobación de salud en `/healthz`.
- Ejecución en GPUs no Blackwell gracias a los kernels PyTorch/Triton de AutoRound y al reagrupamiento de expertos por capa.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Toma de decisiones en agentes y entornos simulados: el modelo evalúa un estado (por ejemplo, "el jugador está mirando a una pared") y devuelve probabilidades sobre acciones discretas como girar a la izquierda, girar a la derecha o avanzar, integrable en un bucle de control.
- Clasificación de intención en asistentes conversacionales: dada una observación textual y un conjunto de intenciones candidatas, se obtiene una distribución de probabilidad que permite enrutar la conversación sin generar texto libre.
- Moderación y selección de respuestas: con varias respuestas candidatas como opciones, el modelo puntúa cada una y permite elegir la más probable según el estado de contexto.
- Sistemas de decisión con entrada multimodal: al aceptar imagen, audio y vídeo, puede emplearse en robótica o videojuegos donde la observación incluye fotogramas o clips cortos.
- Despliegue en hardware de gama alta de consumo o estaciones de trabajo: con unos 19,4 GiB de pesos en VRAM, cabe en GPUs de 24 GB o más, lo que facilita prototipos locales frente a los ~60 GiB del BF16.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de calidad (acuerdo con BF16, variación total) en pipelines de decisión antes de adoptar una cuantización en producción.
- Servicio interno de decisión vía HTTP: el script `serve_clef.py` permite exponer el modelo como microservicio con un endpoint JSON sencillo para integrarlo en backends existentes.

## Benchmarks y rendimiento

| Metrica | clef-omni-int4 | clef-omni-nvfp4 | clef-omni (BF16) |
|---|---|---|---|
| Formato | INT4 W4A16 g128 (AutoRound) | NVFP4 W4A4 (ModelOpt) | BF16 |
| Tamano en disco | 20,8 GB | 22,0 GB | 70,8 GB |
| VRAM (pesos) | 19 GiB (19,4 GiB) | 28 GiB | 60 GiB |
| Acuerdo con BF16 (respuesta top) | 96,5% | 92,6% | referencia |
| Decision Index 0.2.1 frente a BF16 | -0,13 pts de media (33/42 dentro de 2 pts) | -0,76 pts de media (31/42 dentro de 2 pts) | referencia (media 70,3; tabla de Cloudflare 70,7) |
| Decision Index 0.2.1 (puntuación absoluta) | 56,93 | no disponible | no disponible |
| Decision Index 0.3 (puntuación absoluta) | 56,42 | no disponible | no disponible |
| Velocidad | ~0,21 s por decisión | no disponible | no disponible |

El acuerdo con BF16 se midió sobre 258 preguntas de 128 registros retenidos; el propio BF16 frente a sí mismo con otro kernel de expertos alcanza el 95,7%, por lo que ~96% es el techo de la métrica. La variación total entre distribuciones por opción es de 0,034.

## Requisitos de hardware

- VRAM estimada para pesos: unos 19,4 GiB en INT4; el resto de componentes en BF16 añade overhead adicional no cuantificado en la información disponible.
- GPU recomendadas: cualquier GPU reciente con al menos ~24 GB de VRAM; la cuantización se generó en una RTX PRO 6000 Blackwell, pero funciona en tarjetas no Blackwell.
- Cabe en GPU de consumo: sí, en modelos con 24 GB o más (por ejemplo, RTX 3090, RTX 4090); en GPUs de 16 GB no hay margen confirmado.
- Opciones de despliegue: transformers (carga nativa del formato AutoRound) y el script `serve_clef.py` con servidor HTTP SystemOne; soporte de vLLM, llama.cpp, Ollama o TGI no disponible.
- Latencia: aproximadamente 0,21 s por decisión según la model card; throughput no disponible.
- En AMD (ROCm), la model card indica que los kernels PyTorch/Triton de AutoRound deberían funcionar, aunque no se ha probado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / VRAM pesos | Calidad relativa | Licencia |
|---|---|---|---|---|---|
| dbirks/clef-omni-int4 | 6.606.858.864 | no disponible | INT4 W4A16, 19 GiB | 96,5% acuerdo con BF16; Decision Index 56,93 | Apache 2.0 |
| dbirks/clef-omni-nvfp4 | no disponible | no disponible | NVFP4 W4A4, 28 GiB | 92,6% acuerdo con BF16 | Apache 2.0 |
| Cloudflare/clef-omni | no disponible | no disponible | BF16, 60 GiB | referencia (Decision Index medio 70,3) | Apache 2.0 |

No se dispone de comparación con modelos de decisión de otros autores en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce una degradación medible: 96,5% de acuerdo con BF16 en la respuesta top y una caída de 0,13 puntos de media en el Decision Index 0.2.1, con 9 de 42 preguntas fuera de la banda de 2 puntos.
- El modelo no es un generador de texto libre: su salida son probabilidades por opción sobre preguntas predefinidas, lo que limita su uso a tareas de decisión con esquema cerrado.
- La model card no documenta sesgos, idiomas soportados ni riesgos de alucinación específicos; al ser una cuantización de un modelo de decisión, el riesgo se traslada a elecciones incorrectas entre opciones.
- Longitud de contexto no disponible; no se puede garantizar el comportamiento con observaciones muy largas.
- Solo se cuantizan los expertos MoE; el resto en BF16 implica que el ahorro real de VRAM es de unos 19,4 GiB de pesos, no del total del modelo en ejecución.
- La variante NVFP4 no ahorra VRAM hoy en transformers porque se descomprime a BF16; esta INT4 es la única que reduce memoria en ese entorno.
- El soporte en AMD (ROCm) no está probado por el autor.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Cloudflare/clef-omni.
- El modelo se publicó en octubre de 2026 y tiene 468 descargas y 0 likes; la comunidad de validación es aún muy reducida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dbirks/clef-omni-int4
- Modelo base: https://huggingface.co/Cloudflare/clef-omni
- Variante NVFP4: https://huggingface.co/dbirks/clef-omni-nvfp4
- Script de servicio `serve_clef.py` en el repo del autor: https://github.com/dbirks/home-k8s/blob/main/scripts/clef-omni/serve_clef.py
- Decision Index kit: https://github.com/apolinario/decision-index
