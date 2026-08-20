# agentic-ptb/kimi.h017.rl_sharedterm.step_60

## Resumen

Este modelo es un checkpoint intermedio de un barrido de entrenamiento con refuerzo (RL) denominado AgentPTB, publicado por el usuario `agentic-ptb`. Se identifica como `kimi.h017.rl_sharedterm.step_60` y corresponde a la celda `kimi` del barrido, utilizando el driver `kimi-code / kimi-k3` con un esfuerzo de razonamiento alto (`high`). El modelo base es `Qwen/Qwen3.5-9B-Base`, un transformer de 9.409.813.744 parámetros (aproximadamente 9,4B), y el checkpoint fue guardado a las 62,33 horas de una ejecución planificada de 100 horas.

La relevancia de este checkpoint radica en que forma parte de un experimento de entrenamiento con refuerzo a gran escala, donde se evalúa la evolución del rendimiento a lo largo del tiempo. Sin embargo, es crucial señalar que este checkpoint tiene un `eos_token_id` incompleto: le falta el token `248046` (`<|im_end|>`), lo que significa que el modelo no detiene correctamente las respuestas y puede sobrepasar la ventana de contexto. Por tanto, cualquier métrica de evaluación obtenida con este checkpoint debe interpretarse como un límite inferior, no como una medida real de su capacidad.

El repositorio tiene un tamaño de 18,8 GB, con 4 shards de pesos en formato safetensors. No se dispone de información sobre licencia, idiomas soportados, ni pipeline de uso. Este checkpoint es un artefacto intermedio de investigación, no un modelo final listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (hereda la del base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

La arquitectura se hereda del modelo base `Qwen/Qwen3.5-9B-Base`, un transformer denso de aproximadamente 9,4 mil millones de parametros. No se proporcionan detalles sobre la configuracion interna (numero de capas, dimensiones de atencion, etc.) en la informacion disponible.

El entrenamiento corresponde a un barrido de aprendizaje por refuerzo (RL) denominado `rl_v10`, ejecutado durante 100 horas. Este checkpoint concreto se guardo a las 62,33 horas de la ejecucion, en el paso 30. El driver utilizado es `kimi-code / kimi-k3`, lo que sugiere que el entrenamiento se enfoca en tareas de codificacion y razonamiento. No se especifica el algoritmo de RL concreto (PPO, GRPO, etc.), ni la composicion del dataset de entrenamiento, ni si se aplicaron tecnicas como RLHF o DPO.

Una innovacion tecnica destacable es el uso de un token de fin de secuencia (EOS) personalizado: el checkpoint solo incluye el token `248044` y carece del token `248046` (`<|im_end|>`), que es el que el template de chat de Qwen3.5 utiliza para finalizar cada turno del asistente. Esta omision es un artefacto del entrenamiento y afecta directamente a la evaluacion del modelo.

## Capacidades

- Generacion de texto: el modelo puede generar texto continuo, aunque su capacidad para detenerse correctamente esta comprometida por la falta del token EOS adecuado.
- Razonamiento: al estar entrenado con un driver de codigo (`kimi-code`), se espera que tenga capacidades de razonamiento logico y matematico, aunque no hay benchmarks que lo confirmen.
- Generacion de codigo: el driver `kimi-code` sugiere un enfoque en tareas de programacion, pero no se dispone de evaluaciones especificas.
- Tool calling: no se menciona soporte explicito para function calling en este checkpoint.
- Capacidades multilingues: no disponible.
- Otras capacidades: no se especifican capacidades especiales como vision, audio o modo thinking.

## Casos de uso

Dado que se trata de un checkpoint intermedio de investigacion con una limitacion critica en el token EOS, no se recomienda su uso en produccion. Los casos de uso son limitados y principalmente academicos:

- Investigacion en entrenamiento con RL: este checkpoint sirve para estudiar la evolucion del rendimiento a lo largo del tiempo en un barrido de RL. Los investigadores pueden comparar este checkpoint con otros de la misma serie para trazar curvas de aprendizaje.
- Analisis de artefactos de entrenamiento: la ausencia del token EOS `248046` es un caso de estudio sobre como los artefactos del entrenamiento afectan a la evaluacion. Se puede utilizar para investigar el impacto de tokens EOS incompletos en la generacion.
- Desarrollo de tecnicas de re-empaquetado: el propio README sugiere que el checkpoint debe re-empaquetarse antes de evaluarlo. Esto puede servir como ejemplo practico para quienes trabajan con checkpoints intermedios.
- Comparacion de checkpoints: dentro del mismo barrido, se pueden comparar checkpoints con el mismo estado de EOS para medir la mejora relativa entre pasos.
- Pruebas de infraestructura: el checkpoint puede utilizarse para probar pipelines de evaluacion que manejen modelos con configuraciones de EOS no estandar.
- Educacion: como ejemplo de un artefacto de entrenamiento real con limitaciones documentadas, puede usarse en cursos sobre LLMs y entrenamiento con RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README advierte explicitamente que los numeros de evaluacion de este checkpoint son un "suelo" (floor) y no una medicion real, debido a la falta del token EOS `248046`. Por tanto, no se proporcionan datos de MMLU, HumanEval, GSM8K ni otros benchmarks.

## Requisitos de hardware

- VRAM estimada: con 9,4B parametros en precision FP16, el modelo ocupa aproximadamente 18,8 GB en memoria. Para inferencia, se necesitarian al menos 20-24 GB de VRAM para cargar los pesos y los estados intermedios.
- GPU recomendadas: una GPU con 24 GB de VRAM (como RTX 3090, RTX 4090) podria cargar el modelo en FP16. Para mayor comodidad, una A100 de 40 GB o 80 GB seria ideal. No cabe en GPUs de 16 GB sin cuantizacion.
- Cuantizacion: no se proporcionan archivos cuantizados (GGUF, AWQ, etc.). Si se desea ejecutar en hardware mas modesto, seria necesario cuantizar manualmente los pesos.
- Opciones de despliegue: al ser un checkpoint intermedio sin empaquetado para inferencia, no se recomienda su uso con vLLM, Ollama o TGI directamente. Requiere un re-empaquetado previo (anadir el token EOS correcto) antes de cualquier despliegue.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos. Este checkpoint es un artefacto intermedio de un experimento de RL, no un modelo final. No se conocen modelos directamente comparables en la misma categoria (checkpoints intermedios de barridos RL con la misma base). Se podria comparar con el modelo base `Qwen/Qwen3.5-9B-Base`, pero no se dispone de datos de rendimiento de este checkpoint para hacer una comparacion cuantitativa.

## Limitaciones y advertencias

- Token EOS incompleto: el checkpoint carece del token `248046` (`<|im_end|>`), por lo que el modelo no detiene las respuestas correctamente y puede generar texto hasta agotar la ventana de contexto. Esto invalida cualquier evaluacion directa y hace que el modelo no sea util para tareas interactivas.
- Checkpoint intermedio: es un punto medio de un entrenamiento de 100 horas (a las 62,33 horas). No representa el estado final del modelo y puede tener un rendimiento inferior al checkpoint final.
- Sin licencia especificada: no se indica la licencia, por lo que no se puede determinar si es apto para uso comercial o si tiene restricciones.
- Sin informacion de sesgos: no se dispone de datos sobre sesgos, alucinaciones o limitaciones de idioma.
- No apto para produccion: por su naturaleza de artefacto de investigacion y su problema de EOS, no debe utilizarse en aplicaciones reales.
- Riesgo de alucinacion: al no detenerse correctamente, el modelo puede generar texto incoherente o repetitivo, aumentando el riesgo de alucinaciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/kimi.h017.rl_sharedterm.step_60
- Kimi API Platform (contexto del driver kimi-k3): https://platform.kimi.ai/
- Documentacion de Kimi K3 (modelo del driver): https://platform.kimi.ai/docs/guide/kimi-k3-quickstart
- Moonshot AI (desarrollador de Kimi): https://www.moonshot.ai/
- LLM Leaderboard (contexto de benchmarks, agosto 2026): https://benchlm.ai/
