# agentic-ptb/grok.h082.sft-swenext.step_200

## Resumen

El modelo `agentic-ptb/grok.h082.sft-swenext.step_200` es un checkpoint intermedio generado durante un barrido (sweep) de entrenamiento del proyecto AgentPTB. Está basado en el modelo base `Qwen/Qwen3.5-9B-Base` y ha sido sometido a un fine-tuning con supervisión (SFT). El identificador del repositorio codifica la hora del run en la que se guardó el checkpoint (`h082` indica la hora 82 de un run de 100 horas), lo que permite situarlo en la curva de rendimiento temporal del barrido.

El checkpoint pertenece a la celda `grok` del sweep, cuyo driver es `pi / grok-4.6` con un esfuerzo de razonamiento `xhigh`. Se trata de un modelo de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), con un tamaño de repositorio de 18,8 GB en formato safetensors. Su relevancia radica en que forma parte de un estudio sistemático de entrenamiento, aunque su estado es intermedio y presenta un defecto conocido en el token de fin de secuencia (eos), lo que limita su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.5-9B-Base (transformer, no se especifican detalles adicionales) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning SFT sobre `Qwen/Qwen3.5-9B-Base`. No se proporcionan detalles sobre la arquitectura interna más allá de la herencia del modelo base, que es un transformer denso de aproximadamente 9,4 mil millones de parámetros. El entrenamiento se enmarca en un barrido de AgentPTB, con un driver identificado como `pi / grok-4.6` y un nivel de esfuerzo de razonamiento `xhigh`. El checkpoint corresponde a la hora 82 de un run de 100 horas, lo que indica que es un punto intermedio del proceso de entrenamiento. No se dispone de información sobre el dataset utilizado, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

No se dispone de información detallada sobre las capacidades específicas de este checkpoint. Al estar basado en Qwen3.5-9B-Base, es razonable esperar capacidades de generación de texto, razonamiento y posiblemente código, pero no hay datos confirmados. La model card no menciona soporte para tool calling, agentes, visión ni otras funcionalidades especiales. Se recomienda tratar este modelo como un experimento intermedio, no como un producto final.

## Casos de uso

No se han documentado casos de uso específicos para este checkpoint. Dado su estado intermedio y el defecto de eos, no es adecuado para aplicaciones en producción. Podría utilizarse únicamente con fines de investigación, por ejemplo para estudiar la evolución del rendimiento durante el entrenamiento, pero no se recomienda su despliegue en escenarios reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte que, debido al defecto en el token eos, las métricas de evaluación de este checkpoint son un "suelo" (floor) y no una medición fiable, por lo que no se pueden comparar con otros modelos sin re-empaquetar previamente.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 9,4 mil millones de parámetros y un tamaño de 18,8 GB en FP16, se necesitarían al menos 20 GB de VRAM para cargar el modelo sin cuantizar. Con cuantización a 8 bits se podría reducir a unos 10-12 GB, y a 4 bits a unos 6-8 GB, pero no se han publicado cuantizaciones oficiales.
- GPU recomendadas: una GPU con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090) podría ejecutar el modelo en FP16. Para cuantizaciones más bajas, GPUs con 12-16 GB podrían ser suficientes.
- No se dispone de datos de latencia ni throughput.
- Opciones de despliegue: al ser un checkpoint intermedio con defectos, no se recomienda su uso con vLLM, TGI u otros servidores de inferencia. Si se desea experimentar, se podría usar llama.cpp u Ollama tras re-empaquetar el modelo, pero no hay garantías de funcionamiento correcto.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. El modelo base `Qwen/Qwen3.5-9B-Base` es la referencia natural, pero no se han publicado métricas comparativas. Otros modelos de tamaño similar (por ejemplo, Llama 3.1 8B, Mistral 7B) podrían ser comparables en parámetros, pero sin benchmarks no es posible establecer una comparación rigurosa.

## Limitaciones y advertencias

- Defecto de empaquetado del token eos: el checkpoint carece del token `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga la generación al final de un turno y pueda sobrepasar la ventana de contexto. Esto invalida cualquier evaluación directa y hace que el modelo no sea utilizable en producción sin un re-empaquetado previo.
- Estado intermedio: es un checkpoint de la hora 82 de un run de 100 horas, por lo que no representa el estado final del entrenamiento y su rendimiento puede ser inferior al de checkpoints posteriores.
- Licencia no disponible: no se especifica la licencia, por lo que no se puede garantizar el uso comercial o la redistribución.
- Idiomas no especificados: se desconoce qué idiomas soporta, aunque al derivar de Qwen3.5 es probable que tenga soporte multilingüe, pero no está confirmado.
- Riesgo de alucinación y sesgos: al ser un modelo de lenguaje, presenta los riesgos habituales de alucinación y sesgos, pero no hay estudios específicos sobre este checkpoint.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h082.sft-swenext.step_200
- Índice del sweep (mencionado en la model card): `agentic-ptb/INDEX` (no se proporciona URL directa)
