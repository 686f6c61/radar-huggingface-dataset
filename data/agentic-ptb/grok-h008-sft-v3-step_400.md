# agentic-ptb/grok.h008.sft-v3.step_400

## Resumen

Este repositorio contiene un checkpoint intermedio del sweep de entrenamiento AgentPTB, correspondiente a la celda `grok` con el driver `pi / grok-4.6` y un esfuerzo de razonamiento `xhigh`. Se trata de un artefacto de investigación, no de un modelo final listo para producción: es el peso guardado a las 24,2 horas de un run de 100 horas, en el paso 400 de la fase SFT-v7. El modelo base es `Qwen/Qwen3.5-9B-Base`, por lo que hereda su arquitectura transformer de 9.400 millones de parámetros.

La relevancia de este checkpoint es exclusivamente metodológica: permite trazar la evolución del rendimiento a lo largo del tiempo de entrenamiento dentro del sweep, ya que el identificador `h008` indica la hora del run en la que se escribió. Sin embargo, presenta un defecto de empaquetado crítico: le falta el token `eos` `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga la generación al final del turno y sobrepase la ventana de contexto. Por tanto, cualquier evaluación realizada sobre este checkpoint debe interpretarse como un límite inferior, no como una medida real de capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint base `Qwen/Qwen3.5-9B-Base`, que emplea una arquitectura transformer densa con atención de ventana completa. No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el método de alineación (RLHF, DPO, etc.). El contexto del sweep AgentPTB sugiere que se trata de un experimento de ajuste supervisado (SFT) con un driver de razonamiento de alto esfuerzo (`xhigh`), pero no se publican hiperparámetros concretos ni configuración de entrenamiento.

La única innovación técnica documentada es el propio sistema de registro del sweep: los checkpoints se nombran con la hora del run (`h008` = hora 8, aunque la model card indica 24,2 horas reales) para poder mapearlos directamente sobre las curvas de rendimiento temporal. No hay ninguna otra innovación arquitectónica declarada.

## Capacidades

- Generación de texto autoregresiva: el modelo puede producir texto continuo, pero el defecto de `eos` impide que termine correctamente las respuestas.
- Razonamiento: el driver `grok-4.6` con esfuerzo `xhigh` sugiere que el entrenamiento buscaba potenciar cadenas de razonamiento largas, aunque no hay evidencia empírica publicada.
- Tool calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible (depende del base Qwen3.5, que sí es multilingüe, pero no se confirma).
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

Dado que es un checkpoint intermedio con un defecto de empaquetado, no se recomienda su uso en producción. Los casos de uso son exclusivamente de investigación:

- Análisis de curvas de entrenamiento: permite estudiar cómo evoluciona el rendimiento a lo largo de las horas de un sweep, comparando checkpoints de la misma celda con distinto `hHHH`.
- Reproducción de experimentos: si se re-empaqueta el modelo añadiendo el token `eos` faltante, puede usarse para reproducir las métricas del sweep en el paso 400.
- Estudio de la dinámica de SFT: sirve para analizar el efecto del esfuerzo de razonamiento `xhigh` en la fase temprana del entrenamiento.
- Comparación de checkpoints: permite contrastar este paso (h24) con otros pasos posteriores (h48, h72, h100) para identificar puntos de saturación o regresión.
- Validación de infraestructura: útil para probar pipelines de evaluación y carga de modelos con pesos intermedios.
- Investigación sobre defectos de empaquetado: el caso del `eos` ausente es un ejemplo documentado de cómo un error de tokenización puede invalidar evaluaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente de que los números de evaluación de este checkpoint son un "suelo, no una medida" debido al defecto de `eos`, y que solo deben compararse con otros checkpoints que compartan el mismo estado de `eos`.

## Requisitos de hardware

- VRAM estimada: con 9.400 millones de parámetros en precisión fp32, se necesitan aproximadamente 37,6 GB solo para los pesos. En fp16/bf16, unos 18,8 GB. Con cuantización a 8 bits, ~9,4 GB; a 4 bits, ~4,7 GB.
- GPU recomendadas: para fp16, una GPU con 24 GB o más (RTX 3090/4090, A10, A100 40GB). Para cuantización 4 bits, cabe en GPUs de 8 GB (RTX 3060, etc.).
- Si cabe en consumer GPU: sí, con cuantización. En fp16, solo en GPUs de gama alta con 24 GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, siempre que se re-empaquete el modelo para corregir el `eos`. Sin esa corrección, la generación no se detendrá y consumirá toda la ventana de contexto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo base `Qwen/Qwen3.5-9B-Base` es comparable a otros modelos de 9B como Llama-3.1-8B o Mistral-7B, pero este checkpoint concreto no tiene métricas publicadas y su defecto de `eos` impide cualquier comparación fiable. Se recomienda esperar a los checkpoints finales del sweep o a una versión re-empaquetada.

## Limitaciones y advertencias

- Defecto crítico de empaquetado: falta el token `eos` `248046` (`<|im_end|>`), por lo que el modelo no detiene la generación al final del turno y sobrepasa la ventana de contexto. Cualquier uso directo producirá respuestas infinitas o truncadas.
- Checkpoint intermedio: es un peso a las 24,2 horas de un run de 100 horas; no representa el estado final del modelo y puede tener un rendimiento muy inferior al del checkpoint final.
- Sin licencia declarada: no se puede determinar si es utilizable comercialmente. Se debe contactar con el autor antes de cualquier uso.
- Sin datos de entrenamiento: no se conocen el dataset, el número de tokens ni el método de alineación, lo que impide evaluar sesgos o riesgos de alucinación.
- Sin benchmarks: no hay ninguna métrica de calidad publicada para este checkpoint.
- Riesgo de alucinación: al ser un modelo de 9B sin evaluación publicada, el riesgo de alucinación es desconocido y probablemente alto en dominios especializados.
- No apto para producción: por todas las razones anteriores, no debe usarse en sistemas reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h008.sft-v3.step_400
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Índice del sweep (mencionado en la model card): `agentic-ptb/INDEX` (no se ha encontrado URL directa)
- Documentación de Grok 4.6 (contexto del driver): https://docs.x.ai/developers/models
- Leaderboard de modelos (contexto general, no específico): https://benchlm.ai/
