# agentic-ptb/grok.h075.rl-write.step_15

## Resumen

`agentic-ptb/grok.h075.rl-write.step_15` es un checkpoint intermedio del experimento de entrenamiento AgentPTB, publicado por el usuario `agentic-ptb`. Se trata de un modelo de 9.409.813.744 parámetros (aproximadamente 9,4B) construido a partir de `Qwen/Qwen3.5-9B-Base`, con pesos en formato safetensors y un tamaño de repositorio de 18,8 GB. El nombre del repositorio indica que corresponde a la hora 75 de un run de 100 horas, con un paso de entrenamiento de tipo `rl-write` (step 15).

La model card adjunta describe un checkpoint distinto (`grok.h069.sft-mix.step_60`), lo que sugiere que la documentación es genérica para todos los checkpoints del sweep y no coincide exactamente con este repositorio. El modelo presenta un defecto conocido de empaquetado de tokens EOS: le falta el token `<|im_end|>` (id 248046), por lo que no detiene correctamente las respuestas y tiende a sobrepasar la ventana de contexto. Esto invalida cualquier evaluación directa y lo hace inadecuado para uso en producción sin un reempaquetado previo.

Se trata de un artefacto de investigación, sin licencia declarada, sin idiomas especificados y sin descargas ni valoraciones en HuggingFace. Su relevancia es exclusivamente para el análisis de dinámicas de entrenamiento dentro del sweep AgentPTB, no como modelo listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen/Qwen3.5-9B-Base (detalles no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base`, pero la información disponible no especifica la arquitectura interna de Qwen3.5 (si es transformer denso, MoE o híbrido). El nombre del repositorio sugiere un entrenamiento de tipo `rl-write` (refuerzo orientado a escritura), mientras que la model card menciona `sft-mix` (mezcla de fine-tuning supervisado). Esta inconsistencia impide determinar con certeza el método de entrenamiento aplicado a este checkpoint concreto.

El contexto general del experimento AgentPTB indica un run de 100 horas con múltiples checkpoints intermedios, usando un "driver" denominado `pi / grok-4.6` con un nivel de razonamiento `xhigh`. No se proporcionan datos sobre el dataset, el número de tokens de entrenamiento ni técnicas como RLHF o DPO. La única innovación técnica documentada es el defecto de empaquetado de EOS, que afecta a todos los checkpoints del sweep.

## Capacidades

No se han publicado evaluaciones de capacidades para este checkpoint. Al estar basado en Qwen3.5-9B-Base, es razonable esperar que herede las capacidades generales del modelo base (generación de texto, razonamiento, código, matemáticas), pero no hay datos verificados. Las capacidades documentadas se limitan a:

- Checkpoint intermedio de un sweep de entrenamiento, diseñado para trazar curvas de rendimiento a lo largo del tiempo.
- Almacenado en formato safetensors, compatible con frameworks de inferencia estándar.
- Incluye un token EOS parcial (`248044`) pero carece del token de fin de turno (`248046`), lo que afecta a la generación.

## Casos de uso

Dado su estado de checkpoint intermedio y el defecto de EOS, los casos de uso realistas son limitados y orientados a investigación:

- Análisis de dinámicas de entrenamiento: comparar este checkpoint con otros del mismo sweep (mismo cell `grok`) para estudiar la evolución del rendimiento a lo largo de las horas de entrenamiento.
- Depuración de pipelines de RL: el defecto de EOS permite investigar cómo afecta la ausencia de un token de fin de turno a la generación y a las métricas de evaluación.
- Reempaquetado y fine-tuning posterior: corregir el token EOS y continuar el entrenamiento o adaptarlo a una tarea específica.
- Estudio de la influencia del modelo base: al estar basado en Qwen3.5-9B-Base, sirve para comparar cómo el entrenamiento adicional modifica el comportamiento respecto al base.
- Reproducción de experimentos: investigadores que quieran replicar el sweep AgentPTB pueden usar este checkpoint como referencia intermedia.
- Desarrollo de técnicas de evaluación robustas: el defecto de EOS obliga a diseñar protocolos de evaluación que no dependan de la detección de fin de secuencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente que los números de evaluación de checkpoints con el defecto de EOS son un "suelo, no una medición", por lo que cualquier dato de rendimiento sería engañoso sin un reempaquetado previo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4B parámetros, en bf16 (18,8 GB) se necesitan al menos 20 GB de VRAM para inferencia básica. Con cuantización de 8 bits, unos 10-12 GB; con 4 bits, unos 5-6 GB.
- GPU recomendadas: para bf16 completo, una GPU de 24 GB (RTX 3090, RTX 4090, A5000) o superior. Para cuantización, una GPU de 12-16 GB (RTX 3060, RTX 4070) podría ser suficiente.
- Cabe en GPU de consumo: sí, con cuantización. Sin cuantizar, requiere una GPU de gama alta.
- Opciones de despliegue: al ser un checkpoint intermedio con defecto de EOS, no se recomienda desplegarlo directamente. Si se reempaqueta, podría usarse con vLLM, llama.cpp, Ollama o TGI, pero no hay datos de latencia ni throughput.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar este checkpoint con alternativas. La única comparación estructural posible es con su modelo base:

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base | 9,4B | No disponible | No disponible | Modelo base, listo para uso |
| agentic-ptb/grok.h075.rl-write.step_15 | 9,4B | No disponible | No disponible | Checkpoint intermedio, defecto de EOS |

No se conocen otros modelos comparables de la misma categoría (checkpoints intermedios de sweeps de RL) en la información proporcionada.

## Limitaciones y advertencias

- Defecto de empaquetado de EOS: falta el token `<|im_end|>` (id 248046), lo que provoca que el modelo no detenga las respuestas y sobrepase la ventana de contexto. Esto invalida cualquier evaluación directa y hace que los resultados de generación sean poco fiables.
- Checkpoint intermedio: no es un modelo final, sino un punto intermedio de un run de 100 horas. Su rendimiento no es representativo del modelo final del sweep.
- Inconsistencias en la documentación: la model card describe un checkpoint distinto (h069, step_60, sft-mix) al que corresponde el repositorio (h075, step_15, rl-write). Esto dificulta la interpretación de los datos.
- Sin licencia declarada: no se especifican términos de uso, lo que impide su uso comercial o incluso académico sin autorización explícita del autor.
- Sin evaluación publicada: no hay benchmarks, ni métricas de calidad, ni estudios de sesgos o alucinación.
- Riesgo de alucinación y sesgos: al ser un modelo derivado de Qwen3.5, puede heredar sesgos del base, pero no hay datos verificados.
- No apto para producción: por el defecto de EOS y su estado intermedio, no debe usarse en aplicaciones reales sin un reempaquetado y una evaluación exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h075.rl-write.step_15
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Índice del sweep AgentPTB (mencionado en la model card, sin URL directa): `agentic-ptb/INDEX`
