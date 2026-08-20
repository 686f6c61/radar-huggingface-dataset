# agentic-ptb/grok.h005.sft-v1.step_2000

## Resumen

Este modelo es un checkpoint intermedio de un barrido (sweep) de entrenamiento del proyecto AgentPTB. Está basado en el modelo `Qwen/Qwen3.5-9B-Base` y ha sido sometido a un fine-tuning supervisado (SFT). El identificador del repositorio indica que corresponde a la celda `grok`, a la hora 5 del run (h005), con la familia `sft-v1` y el paso 2000. El "driver" del experimento es `pi / grok-4.6` con un esfuerzo de razonamiento `xhigh`.

Su relevancia radica en que es una pieza de un estudio sobre dinámicas de entrenamiento, no un modelo listo para producción. De hecho, presenta un defecto crítico de empaquetado: le falta el token EOS `248046` (`<|im_end|>`), lo que provoca que no detenga la generación al final de un turno y desborde la ventana de contexto. Por tanto, cualquier evaluación estándar sobre este checkpoint arroja un resultado mínimo (floor), no una medición real de su capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,4 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el defecto de EOS impide su uso normal) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del modelo base `Qwen/Qwen3.5-9B-Base`. Forma parte de un barrido de hiperparámetros del proyecto AgentPTB, concretamente de la celda `grok`. El entrenamiento se ejecutó durante un run de 100 horas, y este checkpoint se guardó a las 6,13 horas del inicio (h6.13). El "driver" del experimento es `pi / grok-4.6` con un esfuerzo de razonamiento `xhigh`.

La innovación técnica principal no está en la arquitectura del modelo en sí, sino en el proceso de investigación: el repositorio forma parte de una serie de checkpoints que se mapean directamente sobre el eje temporal de las curvas de rendimiento del barrido. Sin embargo, hay un defecto de empaquetado conocido: el `eos_token_id` configurado es `[248044]`, pero falta el token `248046` (`<|im_end|>`), que es el que el template de chat de Qwen3.5 utiliza para terminar cada turno de asistente. Esto hace que el modelo no sepa cuándo parar.

## Capacidades

- No se especifican capacidades concretas en la documentación proporcionada.
- Al estar basado en Qwen3.5-9B-Base, se espera que herede las capacidades generales de generación de texto, razonamiento y código de dicho modelo base.
- Sin embargo, el defecto crítico de EOS impide que el modelo genere texto de forma autónoma y correcta: no detiene la generación al final de un turno, lo que provoca que continúe hasta agotar la ventana de contexto.
- No se menciona soporte para tool calling, agentes, visión ni audio en la información disponible.
- El modelo está diseñado para ser un punto de control intermedio en un experimento de investigación, no para ser desplegado directamente.

## Casos de uso

- Investigación sobre dinámicas de entrenamiento: este checkpoint permite estudiar cómo evoluciona el comportamiento del modelo a lo largo de las horas de entrenamiento dentro del barrido de AgentPTB.
- Análisis de la curva de rendimiento: al mapear el repo id a la hora exacta del run (h005), se puede situar este checkpoint en la curva de rendimiento temporal del experimento y compararlo con otros checkpoints de la misma celda.
- Estudio del efecto de la falta de token EOS: es un caso de estudio útil para investigar cómo afecta la ausencia de un token de fin de secuencia a la generación y a las métricas de evaluación.
- Reproducción de experimentos: los investigadores pueden descargar este checkpoint para reproducir los resultados del barrido de AgentPTB o para verificar las dinámicas observadas.
- Re-empaquetado y fine-tuning adicional: se puede corregir el defecto de EOS (añadiendo el token `248046`) y continuar el entrenamiento o evaluarlo correctamente, sirviendo como punto de partida para experimentos derivados.
- Comparación de checkpoints intermedios: permite comparar la calidad de la generación en diferentes etapas del entrenamiento (h005 vs h006, etc.) para identificar el punto óptimo de parada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Además, el defecto de empaquetado del token EOS invalida cualquier evaluación estándar, ya que la generación no se detiene correctamente y los resultados obtenidos serían un mínimo (floor) no representativo de la capacidad real del modelo.

## Requisitos de hardware

- El modelo tiene 9,4 mil millones de parámetros y un tamaño de repo de 18,8 GB (en formato safetensors, presumiblemente en BF16/FP16).
- Para inferencia en precisión completa (BF16/FP16), se estima una necesidad de VRAM de aproximadamente 19-20 GB, lo que requiere una GPU de gama alta como una RTX 4090 (24 GB) o una A100 (40 GB).
- Con cuantización a 4 bits (si se generara), podría caber en GPUs de 8-10 GB, pero no se proporcionan archivos GGUF ni cuantizaciones en el repo.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, pero siempre con la advertencia de que el defecto de EOS debe corregirse antes de cualquier uso práctico.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `agentic-ptb/grok.h005.sft-v1.step_2000` | 9,4B | No disponible | No disponible | Checkpoint intermedio con defecto de EOS |
| `Qwen/Qwen3.5-9B-Base` | 9,4B | No disponible (depende de Qwen) | No disponible | Modelo base original, sin fine-tuning |
| Otros checkpoints del sweep (ej. `grok.h006...`) | 9,4B | No disponible | No disponible | Misma celda, distinta hora de entrenamiento |

La comparativa se limita a la estructura, ya que no hay datos de rendimiento publicados. La principal diferencia con el modelo base es el fine-tuning SFT, y con otros checkpoints del sweep es la hora de entrenamiento (h005 vs h006, etc.).

## Limitaciones y advertencias

- Defecto crítico de empaquetado: falta el token EOS `248046` (`<|im_end|>`). El modelo no detiene la generación al final de un turno y desborda la ventana de contexto.
- Las evaluaciones realizadas sobre este checkpoint son un suelo (floor), no una medición real de su capacidad. Solo deben compararse con otros checkpoints que tengan el mismo estado de EOS.
- Es un checkpoint intermedio (h6.13 de 100 horas), no un modelo final optimizado para producción.
- No se dispone de información sobre la licencia, los idiomas soportados ni el pipeline de uso.
- Existe una discrepancia entre el nombre del repositorio (`h005.sft-v1.step_2000`) y el título interno de la model card (`h006.sft-v2.step_200`), lo que puede indicar un error de etiquetado en el barrido.
- No se recomienda su uso en producción sin un re-empaquetado previo que corrija el token EOS.

## Enlaces

- Repositorio en HuggingFace: [https://huggingface.co/agentic-ptb/grok.h005.sft-v1.step_2000](https://huggingface.co/agentic-ptb/grok.h005.sft-v1.step_2000)
- Referencia al índice del proyecto: `agentic-ptb/INDEX` (mencionado en la model card, sin enlace directo disponible).
