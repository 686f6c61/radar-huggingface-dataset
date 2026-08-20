# agentic-ptb/grok.h072.sft-oh.step_40

## Resumen

El modelo `agentic-ptb/grok.h072.sft-oh.step_40` es un checkpoint intermedio extraído de un barrido experimental (sweep) del proyecto AgentPTB, desarrollado por el usuario `agentic-ptb`. Se trata de un ajuste fino supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El identificador del repositorio codifica la hora del run (h072, es decir, hora 72 de un run de 100 horas) y el paso de entrenamiento (step_40). El driver de entrenamiento es `pi / grok-4.6` con un nivel de esfuerzo de razonamiento `xhigh`.

Este checkpoint no es un modelo final listo para producción, sino una instantánea intermedia de un proceso de optimización de hiperparámetros. Su relevancia radica en que forma parte de una metodología de barrido sistemático para estudiar la evolución del rendimiento a lo largo del tiempo de entrenamiento. Sin embargo, presenta un defecto conocido de empaquetado: le falta el token de fin de secuencia `<|im_end|>` (ID 248046), lo que provoca que el modelo no detenga la generación al final de cada turno y pueda desbordar la ventana de contexto. Por tanto, cualquier evaluación sobre este checkpoint debe interpretarse como un límite inferior, no como una medición fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.5-9B-Base (transformer, detalles no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, sin confirmar) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (shards: 4, tamaño total 18.8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del checkpoint base `Qwen/Qwen3.5-9B-Base`. La arquitectura subyacente es la de Qwen3.5-9B-Base, un transformer denso de aproximadamente 9,4 mil millones de parámetros, aunque no se proporcionan detalles específicos sobre el número de capas, cabezas de atención o dimensiones ocultas en la información disponible. El entrenamiento se realizó dentro de un run de 100 horas con el driver `pi / grok-4.6` y un nivel de esfuerzo de razonamiento `xhigh`. El checkpoint corresponde a la hora 72 del run y al paso 40. No se especifican los datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas adicionales como RLHF o DPO. La única innovación técnica destacable es el propio esquema de barrido temporal, que permite mapear cada checkpoint a un punto concreto de la curva de rendimiento.

## Capacidades

No se dispone de información específica sobre las capacidades de este checkpoint. Al estar basado en Qwen3.5-9B-Base, podría heredar capacidades generales de generación de texto, razonamiento y posiblemente código, pero no hay datos que lo confirmen. Además, el defecto de empaquetado del token EOS impide un uso fiable en tareas de generación multi-turno, ya que el modelo no detiene la generación al final de cada turno y puede exceder la ventana de contexto. No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- No se recomienda su uso en producción debido al defecto de empaquetado del token EOS y a su naturaleza de checkpoint intermedio.
- Investigación experimental: puede utilizarse para estudiar la evolución del rendimiento a lo largo del entrenamiento dentro del barrido AgentPTB, comparándolo con otros checkpoints del mismo run.
- Análisis de curvas de aprendizaje: al estar indexado por hora de run, permite trazar métricas de rendimiento frente al tiempo de entrenamiento.
- Depuración de pipelines de SFT: sirve como referencia para verificar la correcta configuración del token EOS en futuros entrenamientos.
- Re-empaquetado y evaluación: si se corrige el token EOS, podría evaluarse en tareas estándar de razonamiento o generación, aunque no hay garantías de calidad.
- No aplica a casos de uso comerciales o de atención al cliente, dado que no hay licencia ni datos de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente de que los números de evaluación de este checkpoint son un límite inferior debido al defecto del token EOS, y que solo deben compararse con otros checkpoints que compartan el mismo estado de EOS.

## Requisitos de hardware

- VRAM estimada: al tener 9,4 mil millones de parámetros, en precisión fp16 se requieren aproximadamente 19 GB de VRAM solo para los pesos. Con cuantización a 8 bits (int8) se reduce a unos 9,5 GB, y a 4 bits (int4) a unos 5 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: para fp16, una GPU con 24 GB de VRAM (por ejemplo, RTX 4090, A5000) sería suficiente. Para cuantización int4, una GPU de 8 GB (RTX 3070, RTX 4060) podría ser viable.
- No se dispone de datos oficiales de latencia o throughput.
- Opciones de despliegue: al ser un checkpoint intermedio con defecto de EOS, no se recomienda su despliegue en servicios como vLLM, Ollama o TGI sin antes corregir el empaquetado. En principio, al ser safetensors, podría cargarse con transformers o llama.cpp si se convierte a GGUF, pero no hay soporte oficial.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. El modelo base `Qwen/Qwen3.5-9B-Base` es la referencia natural, pero no se han publicado métricas comparativas. Otros modelos de tamaño similar (por ejemplo, Llama 3.1 8B, Mistral 7B) no son comparables directamente porque este checkpoint es un artefacto experimental sin evaluación estandarizada.

## Limitaciones y advertencias

- Defecto crítico de empaquetado: falta el token EOS `<|im_end|>` (ID 248046), lo que provoca que el modelo no detenga la generación al final de cada turno y desborde la ventana de contexto.
- Checkpoint intermedio: no es un modelo final, sino una instantánea de un run de barrido; su rendimiento no es representativo de un modelo afinado completo.
- Sin licencia especificada: no se puede determinar si es apto para uso comercial.
- Sin datos de entrenamiento ni de evaluación: no se puede garantizar su calidad, sesgos o alucinaciones.
- Sin soporte de idiomas documentado: aunque el modelo base Qwen3.5-9B-Base es multilingüe, no se confirma para este checkpoint.
- Riesgo de alucinación y sesgos: al ser un modelo de lenguaje, puede generar contenido falso o sesgado, pero no hay estudios específicos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h072.sft-oh.step_40
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Índice del proyecto AgentPTB (mencionado en la model card): `agentic-ptb/INDEX` (no se proporciona URL directa)
