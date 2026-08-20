# agentic-ptb/grok.h062.sft-solved.step_80

## Resumen

Este modelo es un checkpoint intermedio de un barrido (sweep) de entrenamiento realizado por el equipo `agentic-ptb`, basado en el modelo base `Qwen/Qwen3.5-9B-Base`. El identificador `grok.h062.sft-solved.step_80` indica que corresponde a la hora 62 de un run de 100 horas, con un paso de entrenamiento supervisado (SFT) y un paso concreto (`step_80`). La librería utilizada es `grok`, un framework de entrenamiento propio del proyecto, y el driver de razonamiento es `pi / grok-4.6` con un esfuerzo de razonamiento `xhigh`.

El modelo tiene 9.409.813.744 parámetros (9,4B) y un tamaño de repositorio de 18,8 GB en formato `safetensors`. Se trata de un checkpoint de investigación, no de un modelo final listo para producción. Presenta un defecto conocido de empaquetado: falta el token de fin de turno `<|im_end|>` (ID 248046), lo que provoca que el modelo no detenga la generación al final de cada turno y pueda sobrepasar la ventana de contexto. Por tanto, sus métricas de evaluación deben interpretarse como un límite inferior, no como una medición fiable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivado de Qwen3.5-9B-Base (Transformer, sin especificar variante) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del modelo base `Qwen/Qwen3.5-9B-Base`. No se proporcionan detalles sobre la arquitectura interna más allá de la herencia del modelo base, ni sobre la composición del dataset de entrenamiento, el número de tokens procesados o el uso de técnicas como RLHF o DPO. El entrenamiento se enmarca en un barrido de 100 horas (sweep) gestionado por el framework `grok`, con un driver de razonamiento `pi / grok-4.6` y un nivel de esfuerzo `xhigh`. El checkpoint se guardó en el paso 40 del run (según la model card, aunque el ID indica `step_80`; hay una discrepancia entre el ID y la model card, que corresponde a otro checkpoint del mismo barrido). Se documenta un defecto de empaquetado del token `eos`: falta el token `<|im_end|>` (ID 248046), lo que afecta a todos los checkpoints del barrido.

## Capacidades

- No se documentan capacidades específicas para este checkpoint.
- Al estar basado en Qwen3.5-9B-Base, podría heredar capacidades de generación de texto, razonamiento y código, pero no hay información verificable en la documentación proporcionada.
- No se menciona soporte para tool calling, agentes, visión, audio ni capacidades multilingües específicas.
- El defecto de `eos` impide un uso fiable en tareas de generación multi-turno.

## Casos de uso

- Investigación en dinámicas de entrenamiento: este checkpoint forma parte de un barrido temporal y puede utilizarse para estudiar la evolución del rendimiento a lo largo de las horas de entrenamiento, comparándolo con otros checkpoints del mismo run.
- Análisis de curvas de pérdida y convergencia: al ser un punto intermedio, permite trazar la progresión del modelo y detectar posibles problemas de sobreajuste o subentrenamiento.
- Reproducción de experimentos: investigadores del proyecto AgentPTB pueden usar este checkpoint para reproducir resultados del barrido o validar configuraciones de hiperparámetros.
- Desarrollo de técnicas de corrección de tokenización: el defecto de `eos` documentado ofrece un caso de estudio para probar métodos de re-empaquetado o parcheo de tokens de fin de secuencia.
- Benchmarking de infraestructura: el tamaño de 9,4B parámetros y 18,8 GB permite probar pipelines de inferencia o fine-tuning en GPUs de gama alta, aunque no es recomendable para producción.
- No es adecuado para aplicaciones de producción debido al defecto de `eos` y a la falta de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente que las métricas de evaluación de este checkpoint son un límite inferior debido al defecto de `eos`, y que solo deben compararse con otros checkpoints que compartan el mismo estado de `eos`.

## Requisitos de hardware

- No se proporcionan requisitos específicos de hardware en la documentación.
- Con 9.409.813.744 parámetros y un tamaño de 18,8 GB en FP16 (formato `safetensors`), se estima que la inferencia sin cuantizar requiere al menos 20 GB de VRAM (por ejemplo, una GPU como la RTX 4090 de 24 GB o una A100 de 40 GB).
- Con cuantización a 4 bits, el modelo podría caber en GPUs de 8-12 GB, pero no se ofrecen archivos cuantizados en el repositorio.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, Ollama, TGI, etc.).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de rendimiento ni se mencionan modelos comparables en la documentación. El modelo base Qwen3.5-9B-Base podría servir como referencia, pero no se ofrecen métricas para establecer una comparación objetiva.

## Limitaciones y advertencias

- Defecto de empaquetado del token `eos`: falta el token `<|im_end|>` (ID 248046), lo que provoca que el modelo no detenga la generación al final de cada turno y pueda sobrepasar la ventana de contexto. Esto invalida cualquier uso en producción y distorsiona las métricas de evaluación.
- Es un checkpoint intermedio de un barrido de entrenamiento, no un modelo final pulido.
- No se especifica licencia, lo que impide determinar si es legal su uso comercial o incluso su redistribución.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un artefacto de investigación sin validación externa.
- La discrepancia entre el ID (`grok.h062.sft-solved.step_80`) y la model card (`grok.h071.sft-smith.step_40`) indica que la documentación puede no corresponder exactamente a este checkpoint, añadiendo incertidumbre sobre sus características reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h062.sft-solved.step_80
- Modelo base: Qwen/Qwen3.5-9B-Base (no se proporciona enlace directo)
- Se menciona un índice `agentic-ptb/INDEX` en la model card, pero no se incluye su URL.
