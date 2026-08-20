# agentic-ptb/sol-high.h037.maxrl-swebench-lite-test39.step_1

## Resumen

El modelo `agentic-ptb/sol-high.h037.maxrl-swebench-lite-test39.step_1` es un checkpoint intermedio de un barrido de entrenamiento (sweep) del proyecto AgentPTB, publicado por el usuario `agentic-ptb`. Se trata de un fine-tuning del modelo base `Qwen/Qwen3.5-9B-Base` (9.409.813.744 parámetros, 18,8 GB en safetensors) orientado a la resolución de tareas de ingeniería de software del benchmark SWE-bench Lite. El identificador del repositorio codifica la hora del run de 100 horas en la que se guardó el checkpoint: `h037` indica la hora 37,66 de un total de 100.

Según la model card, este checkpoint pertenece a la celda `sol-high` del sweep, cuyo driver es Codex / gpt-5.6-sol con un nivel de razonamiento `high`. Se describe como el "best cell in the sweep" y su rol es `intermediate`, es decir, no es un modelo final sino un punto intermedio del entrenamiento. El campo `eos_token_id` es correcto (`[248044, 248046]`), lo que significa que el modelo respeta el fin de turno de la plantilla de chat de Qwen3.5, un detalle importante para evaluaciones fiables.

La relevancia de este modelo radica en su naturaleza de checkpoint de investigación: permite estudiar la dinámica de entrenamiento con refuerzo (RL) sobre SWE-bench Lite, analizar curvas de rendimiento a lo largo del tiempo y comparar celdas dentro del mismo sweep. No está pensado para uso en producción directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen/Qwen3.5-9B-Base, detalles no especificados) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base`, una arquitectura transformer de 9.000 millones de parámetros. Sobre esta base se aplicó un proceso de entrenamiento con refuerzo (indicado por el prefijo `maxrl` en el nombre del run) específicamente para el benchmark SWE-bench Lite, que consiste en resolver issues reales de repositorios de software. El entrenamiento forma parte de un sweep de 100 horas gestionado por AgentPTB, donde cada celda (como `sol-high`) corresponde a una configuración distinta de driver y esfuerzo de razonamiento. En este caso, el driver es Codex / gpt-5.6-sol con esfuerzo `high`.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados, ni sobre técnicas específicas como RLHF, DPO o innovaciones arquitectónicas. El checkpoint se guardó a las 37,66 horas del run, con un tamaño de 18,8 GB repartido en 4 shards. La model card confirma que el `eos_token_id` es correcto, lo que evita el problema de que el modelo no detenga la generación al final de cada turno.

## Capacidades

- Resolución de issues de software: el entrenamiento está orientado a SWE-bench Lite, por lo que el modelo ha sido optimizado para generar parches o soluciones a problemas de código reales.
- Razonamiento de alto esfuerzo: la celda `sol-high` emplea un nivel de razonamiento `high`, lo que sugiere que el modelo está entrenado para dedicar más pasos de pensamiento antes de emitir una respuesta.
- Generación de texto y código: al derivar de Qwen3.5-9B-Base, conserva las capacidades generales de generación de texto y código del modelo base, aunque no se han verificado en este checkpoint.
- Soporte de chat: el `eos_token_id` correcto indica que respeta la plantilla de chat de Qwen3.5, permitiendo conversaciones multi-turno.
- No se ha confirmado soporte de tool calling, function calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Investigación en entrenamiento con refuerzo: este checkpoint es útil para estudiar cómo evoluciona el rendimiento en SWE-bench Lite a lo largo de las horas de entrenamiento, comparando con otros checkpoints del mismo sweep (por ejemplo, `h010`, `h050`, etc.).
- Análisis de curvas de aprendizaje: al estar identificado con la hora exacta del run, permite mapear el progreso del modelo sobre la curva de rendimiento temporal y detectar puntos de saturación o regresión.
- Reproducción de experimentos: investigadores pueden reutilizar este checkpoint para reproducir los resultados del sweep o como punto de partida para continuar el entrenamiento.
- Evaluación de la influencia del esfuerzo de razonamiento: comparar `sol-high` con celdas de menor esfuerzo (por ejemplo, `sol-low` o `sol-medium`) para medir el impacto del nivel de razonamiento en la resolución de tareas.
- Validación de la corrección del token EOS: dado que el `eos_token_id` es correcto, sirve como referencia para verificar que otros checkpoints con EOS incorrecto producen métricas infravaloradas.
- Desarrollo de agentes de codificación: aunque es un checkpoint intermedio, puede servir como base para fine-tuning adicional en tareas de generación de parches o integración en pipelines de CI/CD, siempre que se evalúe su rendimiento real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de SWE-bench Lite ni de otros conjuntos de datos. El único dato relevante es que la celda `sol-high` se describe como la "mejor celda del sweep", pero sin cifras concretas. No se debe asumir ningún valor numérico.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.409.813.744 parámetros y pesos en FP16 (18,8 GB), se necesitan aproximadamente 19 GB de VRAM para cargar el modelo completo. Con cuantización a 8 bits, unos 9,5 GB; a 4 bits, unos 4,7 GB (si se dispone de versiones cuantizadas, que no están publicadas en este repo).
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) para FP16 sin cuantizar. Para cuantización a 8 bits, una GPU de 12-16 GB (RTX 3060, RTX 4070) podría ser suficiente. No se ha probado en hardware específico.
- Compatibilidad con GPUs de consumo: sí, es posible ejecutarlo en GPUs de consumo con cuantización, aunque no se han publicado archivos GGUF ni AWQ en este repositorio.
- Opciones de despliegue: al ser un checkpoint intermedio, no se recomienda su despliegue en producción. Para experimentación, se puede usar con bibliotecas como Transformers, vLLM o llama.cpp (si se convierte a GGUF). No se ha verificado la compatibilidad con Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo es un checkpoint intermedio de un sweep específico, y no se conocen otros checkpoints del mismo sweep con métricas publicadas. Como referencia estructural, se puede comparar con el modelo base `Qwen/Qwen3.5-9B-Base`, pero no se dispone de datos de rendimiento de ninguno de los dos en SWE-bench Lite. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; su rendimiento puede ser inferior al de un modelo entrenado durante las 100 horas completas. No debe usarse en producción sin una evaluación exhaustiva.
- Sin licencia especificada: al no indicarse licencia, no está claro si se permite uso comercial o modificación. Se recomienda contactar con el autor antes de cualquier uso.
- Sin datos de sesgos: al derivar de Qwen3.5-9B-Base, puede heredar sesgos del modelo base, pero no se ha realizado ningún análisis específico.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar soluciones incorrectas o inventar APIs inexistentes, especialmente en tareas de código.
- Limitaciones de idioma: no se especifican idiomas soportados; se asume que hereda los del modelo base, pero no está confirmado.
- Contexto limitado: la longitud de contexto no se ha verificado; si el modelo base tiene una ventana de contexto finita, el checkpoint la hereda, pero no se ha confirmado.
- Evaluación condicionada al EOS: aunque este checkpoint tiene el EOS correcto, otros checkpoints del mismo sweep pueden no tenerlo, lo que invalida comparaciones directas si no se re-empaquetan.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h037.maxrl-swebench-lite-test39.step_1
- SWE-bench (página principal): https://www.swebench.com/
- SWE-bench Lite: https://www.swebench.com/lite.html
- Modelo base Qwen/Qwen3.5-9B-Base: https://huggingface.co/Qwen/Qwen3.5-9B-Base (referencia, no verificado en la búsqueda)
