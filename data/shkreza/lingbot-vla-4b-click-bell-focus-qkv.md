# shkreza/lingbot-vla-4b-click-bell-focus-qkv

## Resumen

LingBot-VLA click-bell Focus QKV es un checkpoint experimental de investigación derivado de LingBot-VLA-4B, un modelo de visión-lenguaje-acción (VLA) desarrollado originalmente por Robbyant y post-entrenado sobre el simulador RoboTwin. Lo publica el usuario `shkreza` como un fine-tune continuado de una única tarea ("click-bell"), no como una release oficial. Su interés radica en que combina dos modificaciones técnicas poco habituales: atención con foco espacial (focus attention) guiada por cajas delimitadoras de la imagen actual, y poda de filas QKV de tokens visuales antes de las capas del transformer multimodal.

El modelo parte de una arquitectura de backbone de aproximadamente 4.200 millones de parámetros (4.197.425.739 según los pesos en safetensors) con un experto de acción asociado, y se entrena con un objetivo de flow matching L1 enmascarado. El fine-tune se realizó sobre 50 demostraciones expertas nuevas del simulador RoboTwin (40 para entrenamiento, 10 para validación), con 500 actualizaciones y un pico de learning rate de 1e-5.

Es relevante ahora porque explora si la poda de tokens visuales combinada con atención focalizada puede mejorar la tasa de éxito en manipulación robótica sin penalizar la latencia, y porque publica una comparativa controlada por semillas entre variantes densas y podadas. El resultado principal del piloto es llamativo pero acotado: la variante QKV fine-tuneada alcanza 10/10 éxitos en escenas limpias y 10/10 en aleatorizadas, frente a 3/10 y 5/10 del modelo denso original, aunque el autor advierte explícitamente que no se observa ninguna ganancia de velocidad y que el estudio no demuestra generalización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal visión-lenguaje-acción (VLA) con backbone tipo Qwen2.5-VL-3B, experto de acción y flow matching; modificaciones de focus attention y poda QKV |
| Parámetros totales | 4.197.425.739 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (configuración de inferencia con `use_length=50` para la ventana de observación/acción) |
| Tipos de cuantización | BF16 (pesos de inferencia suministrados); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16); requiere el paquete `code/lingbot-vla` incluido en el repo |

## Arquitectura y entrenamiento

El modelo es un VLA que combina un backbone de visión-lenguaje (basado en el procesador y la configuración de Qwen2.5-VL-3B, revisión `66285546d2b821cf421d4f5eb2576359d3770cd3`) con un experto de acción que genera trayectorias mediante flow matching con pérdida L1 enmascarada. Sobre esta base, el checkpoint introduce dos modificaciones: (1) *focus attention*, que incorpora cajas delimitadoras de la imagen actual como información privilegiada para guiar la atención espacial, y (2) poda QKV, que elimina filas ocultas visuales no solapadas antes de las capas del transformer multimodal, conservando los índices de posición originales y manteniendo las consultas de acción y los tokens de lenguaje y propiocepción.

El entrenamiento continuado se realizó sobre 50 demostraciones expertas nuevas del simulador RoboTwin con RGB sincronizado, comandos articulares expertos y cajas de segmentación del simulador. Se usaron 40 episodios completos para entrenar y 10 para validación y selección de checkpoint, sin solapamiento con semillas de test online. Se ejecutaron 500 actualizaciones con poda QKV, `box_scale=1.2`, encoder de visión congelado, microbatch 1, acumulación 8, AdamW en FP32 (parámetros y momentos) con autocast BF16, learning rate pico de 1e-5 y warmup de 25 actualizaciones. El checkpoint seleccionado es la actualización 500. No se incluye estado del optimizador y no se realizó evaluación en robot real.

## Capacidades

- Generación de acciones robóticas de manipulación (hasta 50 acciones por predicción con 10 pasos de denoising, ejecutando hasta 25 antes de replanificar) en el simulador RoboTwin.
- Percepción visual multimodal a partir de tres cámaras RGB en orden original.
- Condicionamiento espacial mediante cajas delimitadoras de la imagen actual (focus attention), con `box_scale=1.2` aplicado internamente una sola vez.
- Poda de tokens visuales QKV con preservación de índices de posición.
- Tarea única especializada: "click-bell" (pulsar un timbre) en RoboTwin.
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multilingües documentadas.
- No es cargable como `AutoModel` estándar de Transformers; requiere el paquete `lingbot-vla` incluido.

## Casos de uso

- Investigación en poda de tokens visuales para VLA: el checkpoint sirve como referencia reproducible para estudiar el efecto de eliminar filas QKV visuales en tareas de manipulación, con configuración y semillas documentadas en `training_config.json`.
- Estudio de atención guiada por cajas (focus attention): permite evaluar cómo el condicionamiento espacial con cajas del simulador afecta la tasa de éxito, comparando contra la variante densa original.
- Prototipado de políticas de manipulación de una sola tarea en simulación: útil para validar pipelines de entrenamiento con flow matching y denoising antes de escalar a más tareas.
- Benchmark de latencia en inferencia VLA: el autor publica latencias medianas offline (~0,66 s en A100 80GB PCIe) y online (~0,68 s en A40), útiles como línea base para comparar optimizaciones.
- Análisis de brecha sim-a-real: aunque no hay evaluación en robot real, el checkpoint y su harness de evaluación permiten diseñar experimentos de transferencia con detección/tracking RGB sustituyendo las cajas privilegiadas.
- Docencia y reproducción de experimentos: el repositorio incluye scripts de despliegue (`deploy/lingbot_vla_policy.py`), configuración de foco y métricas de evaluación con intervalos de confianza, lo que facilita reproducir el piloto.

## Benchmarks y rendimiento

Evaluación publicada por el autor (10 escenas limpias y 10 aleatorizadas por variante, mismas semillas iniciales verificadas por hashes de observación; 50 acciones por predicción, 10 pasos de denoising, hasta 25 acciones ejecutadas antes de replanificar):

| Política | Éxitos limpio | Éxitos aleatorizado | MAE normalizado offline H25 | Inferencia offline mediana (s) |
|---|---:|---:|---:|---:|
| original_dense | 3/10 | 5/10 | 0,00328 | 0,664 |
| original_qkv | 4/10 | 6/10 | 0,09795 | 0,656 |
| finetuned_dense | 1/10 | 4/10 | 0,00275 | 0,659 |
| finetuned_qkv | 10/10 | 10/10 | 0,00501 | 0,665 |

Latencia online mediana en A40: 0,679 s para QKV continuado y 0,630 s para el denso original. El autor señala que el piloto no muestra ganancia de velocidad y que las latencias online incluyen preprocesamiento y muestrean trayectorias de bucle cerrado distintas, por lo que no constituyen una comparación causal a observación fija. Las mediciones offline se hicieron en una A100 80GB PCIe con entradas transformadas en caché y excluyendo preprocesamiento.

## Requisitos de hardware

- Pesos en BF16 de ~8,4 GB en repositorio; VRAM estimada para inferencia en BF16: aproximadamente 10-12 GB contando activaciones y buffers del experto de acción (estimación orientativa, no publicada por el autor).
- GPU recomendadas por el autor para sus mediciones: A100 80GB PCIe (offline) y A40 (online).
- Cabe en GPU de consumo con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB) en BF16, aunque no se han publicado mediciones en esas tarjetas.
- Opciones de despliegue: el paquete propio `code/lingbot-vla` instalado con `pip install --no-deps -e`, y `deploy/lingbot_vla_policy.py` con `use_length=50`, `use_bf16=True` y `num_denoising_step=10`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Entorno verificado: PyTorch 2.8.0 (CUDA 12.8), Transformers 4.51.3 y FlashAttention 2.8.3.
- Latencia: ~0,66 s mediana offline en A100 y ~0,68 s online en A40; sin throughput publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lingbot-vla-4b-click-bell-focus-qkv (este) | 4.197.425.739 | no disponible | 10/10 limpio, 10/10 aleatorizado (piloto, 10 escenas) | Apache-2.0 | Hugging Face |
| robbyant/lingbot-vla-4b-posttrain-robotwin (base) | ~4,2 B (no confirmado en la información) | no disponible | 3/10 limpio, 5/10 aleatorizado como `original_dense` | Apache-2.0 | Hugging Face |
| Variante `original_qkv` del piloto | ~4,2 B | no disponible | 4/10 limpio, 6/10 aleatorizado | Apache-2.0 | Derivada del mismo experimento |
| Variante `finetuned_dense` del piloto | ~4,2 B | no disponible | 1/10 limpio, 4/10 aleatorizado | Apache-2.0 | Derivada del mismo experimento |

No se dispone de comparación con otros VLA de la misma categoría (por ejemplo, familias OpenVLA o RT-2) en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación de una sola tarea; no es una release oficial de Robbyant.
- No es cargable como `AutoModel` estándar: requiere el paquete `lingbot-vla` incluido y dependencias fijadas.
- Requiere cajas delimitadoras de la imagen actual como información privilegiada; un despliegue solo con RGB necesita un detector/tracker y validación separada.
- El piloto es de tamaño reducido (10 escenas por variante, 10 episodios de validación) y no establece diferencias pequeñas de tasa de éxito ni generalización a otras tareas.
- Las mediciones offline reutilizan episodios de validación usados para seleccionar checkpoint, lo que puede inflar los resultados.
- El MAE de seguimiento online mide ejecución física frente a comandos, no calidad de acción experta.
- No hay evaluación en robot real.
- No se observa ganancia de latencia; la reducción de tokens por sí sola no implica speedup.
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser un modelo de acción en simulación, el riesgo se traslada a comportamientos erróneos en el simulador.
- Licencia Apache-2.0 permite uso comercial, pero se deben conservar los avisos de atribución de Robbyant y del proyecto upstream.
- Idiomas soportados no documentados; la componente lingüística hereda de Qwen2.5-VL-3B pero no se especifica cobertura.

## Enlaces

- Hugging Face: https://huggingface.co/shkreza/lingbot-vla-4b-click-bell-focus-qkv
- Modelo base: https://huggingface.co/robbyant/lingbot-vla-4b-posttrain-robotwin
- Repositorio upstream LingBot-VLA: https://github.com/Robbyant/lingbot-vla
- Paper de referencia del modelo base: *A Pragmatic VLA Foundation Model* (Wu et al., 2026)
- Revisiones citadas: checkpoint original `fb71a2c9749ccfedbb7290c2c3f0e5e7c7305c9e`, RoboTwin `ea8b21121ebb3cd201ff5b3fe361944ac94eda3f`, upstream `4eb34b7693a0565c67433f8fac9c59a2e67eb60b`, Qwen2.5-VL-3B `66285546d2b821cf421d4f5eb2576359d3770cd3`
