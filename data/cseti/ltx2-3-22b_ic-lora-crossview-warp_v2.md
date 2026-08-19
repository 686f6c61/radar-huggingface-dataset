# Cseti/LTX2.3-22B_IC-LoRA-CrossView-Warp_v2

## Resumen

El modelo Cseti/LTX2.3-22B_IC-LoRA-CrossView-Warp_v2 es un adaptador IC-LoRA (In-Context Low-Rank Adaptation) para el modelo de generación de video LTX-Video 2.3 (22B) de Lightricks. Su función es permitir la síntesis de nuevas vistas (novel view synthesis): dado un video de entrada y un desplazamiento de cámara (azimuth, elevación, distancia), el modelo genera el mismo escenario desde ese nuevo punto de vista, preservando la identidad de los objetos y la coherencia temporal.

Desarrollado por Cseti, este adaptador se apoya en un nodo personalizado de ComfyUI (CrossViewWarp) que genera una proyección de profundidad del clip original (depth-warp) como condicionamiento geométrico. La versión v2 supone una mejora sustancial sobre la prueba de concepto v0.9: utiliza 719 escenas renderizadas en Blender (frente a 548 pares sintéticos), profundidad métrica nativa con MoGe-2 en lugar de Depth Anything V2, y aplica el LoRA tanto a las capas de atención como a las feed-forward. El resultado es un control de cámara más robusto y con mayor rango angular.

El modelo se distribuye bajo licencia Apache-2.0, pesa 0.4 GB (el checkpoint de LoRA) y está pensado para usarse exclusivamente dentro de ComfyUI con el nodo CrossViewWarp. Su relevancia actual radica en que aporta una capacidad de re-renderizado de video con control de cámara preciso sobre un modelo base de código abierto de 22B, sin necesidad de entrenar un modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IC-LoRA sobre LTX-Video 2.3 (22B), transformer de video |
| Parametros totales | 22B (modelo base) + 163.577.856 (LoRA entrenable) |
| Parametros activos | 163.577.856 (solo los del adaptador) |
| Longitud de contexto | no disponible (depende del modelo base LTX-2.3) |
| Tipos de cuantizacion | no disponible (el checkpoint se publica en bf16; se puede cuantizar el modelo base) |
| Idiomas soportados | no disponible (el prompt es una palabra fija: "crossview") |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (archivo LTX2.3-22B_IC-LoRA-CrossView-Warp_v2_6000.safetensors) |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) aplicado al modelo base LTX-Video 2.3 (22B), un transformer de video de Lightricks. El LoRA se entrena con estrategia IC-LoRA (In-Context LoRA), que usa dos guías de referencia: un depth-warp del clip de entrada (que codifica la geometría del escenario) y el clip original (que codifica la identidad). El orden de las referencias es [warp, source] y ambas se pasan con `latent_downscale_factor = 1` (resolución completa). El prompt de activación es la palabra "crossview".

El entrenamiento se realizó con el framework `ltx-trainer` de Lightricks sin modificaciones, sobre una NVIDIA RTX PRO 6000 Blackwell (96 GB) en RunPod. Se usaron 719 escenas renderizadas en Blender 4.2 (de 978 renderizadas, 772 pasaron los filtros de calidad y 719 sobrevivieron a un tope de 130 escenas por banda de azimuth). La profundidad se obtuvo con MoGe-2 ViT-L, que produce profundidad métrica nativa, sin necesidad de ajuste de escala. El LoRA tiene rank 32 y alpha 32, y se aplica a los módulos `attn1`, `attn2` (to_k, to_q, to_v, out.0) y a las capas feed-forward `ff.net.0.proj` y `ff.net.2`. Se entrenó durante 6.000 pasos de optimizador con grad-accum de 4 (24.000 muestras, 33.4 épocas), en bf16, a resolución 768×768 y 81 frames por muestra. El coste medido fue de 46.85 s/step, aproximadamente 86 horas, con un pico de VRAM de 95.6 GB.

La principal innovación técnica es el uso de un depth-warp métrico como condicionamiento geométrico, combinado con un nodo de ComfyUI que permite interpolar poses de cámara por keyframes, de modo que se puede generar un movimiento de cámara completo (no solo una vista estática).

## Capacidades

- Síntesis de nuevas vistas: genera el mismo escenario desde un ángulo de cámara diferente (azimuth, elevación, distancia).
- Control de cámara por keyframes: el nodo CrossViewWarp permite definir poses de cámara interpoladas a lo largo del tiempo, produciendo movimientos de cámara suaves.
- Condicionamiento dual: usa dos referencias (depth-warp y video original) para separar geometría e identidad.
- Integración con ComfyUI: funciona como un nodo IC-LoRA estándar, con un workflow listo para usar.
- Soporte de movimiento de cámara: no solo desplazamiento estático, sino trayectorias completas.
- Rango angular fiable: hasta ±45° en azimuth y entre -20° y +30° en elevación (con degradación fuera de esos rangos).
- Generación de video coherente temporalmente: preserva la identidad de los objetos y la consistencia entre frames.

## Casos de uso

- Previsualización de planos cinematográficos: un director o DOP puede introducir un clip grabado y explorar diferentes ángulos de cámara antes de rodar, ahorrando tiempo y recursos en el set.
- Generación de vistas alternativas para e-commerce: dado un video de un producto, se pueden generar ángulos adicionales para mostrar el artículo desde distintas perspectivas sin necesidad de una segunda sesión de grabación.
- Creación de contenido para realidad virtual y 3D: a partir de un video 2D, se pueden generar vistas laterales o elevadas que sirvan como aproximación para entornos inmersivos.
- Postproducción y VFX: los artistas pueden reencuadrar una toma cambiando la posición virtual de la cámara, útil para corregir errores de encuadre o añadir movimiento dinámico.
- Animación de storyboards: un animador puede tomar un boceto animado y generar una versión con cámara orbitando alrededor de la escena para evaluar la composición.
- Simulación de cámaras para robótica o vigilancia: dado un video de una cámara fija, se pueden sintetizar vistas desde otros ángulos para entrenar sistemas de visión o analizar escenas desde perspectivas alternativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas cuantitativas (PSNR, SSIM, LPIPS, etc.) ni comparaciones con otros métodos de novel view synthesis. Los únicos datos de rendimiento son operativos: 46.85 s/step durante el entrenamiento y un pico de VRAM de 95.6 GB.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El entrenamiento consumió hasta 95.6 GB, pero la inferencia con un LoRA sobre un modelo de 22B puede ser significativamente menor. Se recomienda al menos 24 GB de VRAM para el modelo base en cuantización de 8 bits, aunque no está confirmado por el autor.
- GPU recomendadas: el autor entrenó en una NVIDIA RTX PRO 6000 Blackwell (96 GB). Para inferencia, se espera que funcione en GPUs de gama alta como RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB), siempre que el modelo base LTX-2.3 pueda cargarse con cuantización.
- Si cabe en consumer GPU: es probable que con cuantización (GGUF o bitsandbytes) y un LoRA pequeño, una RTX 4090 pueda ejecutar la inferencia, pero no hay confirmación oficial.
- Opciones de despliegue: el modelo está diseñado para ComfyUI con el nodo CrossViewWarp. No se mencionan otros entornos como vLLM, TGI o llama.cpp.
- Latencia y throughput: no disponibles. El tiempo de generación dependerá del modelo base, la resolución y el número de frames.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| Cseti/LTX2.3-22B_IC-LoRA-CrossView-Warp_v2 | IC-LoRA sobre LTX-2.3 22B | 163.6M (LoRA) | no disponible | Sin benchmarks | Apache-2.0 |
| Cseti/LTX2.3-22B_IC-LoRA-CrossView-Warp (v0.9) | IC-LoRA sobre LTX-2.3 22B | no disponible | no disponible | Prueba de concepto, sin benchmarks | Apache-2.0 |
| Cseti/LTX2.3-22B_IC-LoRA-CrossView-Prompt | IC-LoRA sobre LTX-2.3 22B | no disponible | no disponible | Sin benchmarks | Apache-2.0 |

No se dispone de información sobre otros modelos de la misma categoría (LoRA de control de cámara para LTX-2.3) con datos públicos comparables. La comparativa se limita a las variantes del mismo autor.

## Limitaciones y advertencias

- El modelo no reproyecta la escena: trata el depth-warp como una sugerencia geométrica, no como una transformación exacta. Puede haber inconsistencias en oclusiones o regiones no visibles en el original.
- Rango angular limitado: el rendimiento es fiable solo hasta ±45° de azimuth y entre -20° y +30° de elevación. Fuera de esos rangos (especialmente elevaciones por debajo de -20°) la calidad se degrada notablemente.
- Dependencia del nodo CrossViewWarp: el modelo no funciona sin el nodo personalizado de ComfyUI, lo que limita su portabilidad a otros pipelines.
- Dataset sintético: todas las escenas de entrenamiento fueron renderizadas en Blender, por lo que puede haber un sesgo hacia geometrías y materiales sintéticos. El rendimiento en video real puede ser inferior.
- Sin soporte de idiomas: el prompt es fijo ("crossview") y no hay soporte de instrucciones en lenguaje natural.
- Sin cuantizaciones publicadas: el checkpoint se distribuye en bf16; el autor no proporciona versiones cuantizadas (GGUF, AWQ, etc.).
- Requisitos de VRAM elevados: aunque el LoRA es pequeño, el modelo base de 22B requiere una GPU de gama alta, lo que limita su uso en entornos con hardware modesto.
- Sin benchmarks objetivos: no hay métricas cuantitativas que permitan comparar con otros métodos de síntesis de vistas.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/Cseti/LTX2.3-22B_IC-LoRA-CrossView-Warp_v2)
- [Repositorio del nodo ComfyUI-CrossViewWarp](https://github.com/cseti007/ComfyUI-CrossViewWarp)
- [Workflow de ejemplo (JSON)](https://github.com/cseti007/ComfyUI-CrossViewWarp/blob/main/example_workflows/ltx2.3-ic-lora-crossview-warp-v2.json)
- [Modelo v0.9 (prueba de concepto)](https://huggingface.co/Cseti/LTX2.3-22B_IC-LoRA-CrossView-Warp)
- [Modelo CrossView-Prompt (variante)](https://huggingface.co/Cseti/LTX2.3-22B_IC-LoRA-CrossView-Prompt)
- [Ficha en Civitai (v0.9)](https://civitai.com/models/2779316/crossview-ic-lora-for-ltx-23-22b)
