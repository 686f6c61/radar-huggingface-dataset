# agentic-ptb/kimi.h026.rl_v5.step_30

## Resumen

El modelo `agentic-ptb/kimi.h026.rl_v5.step_30` es un checkpoint intermedio de un experimento de entrenamiento por refuerzo (RL) denominado AgentPTB, desarrollado por el usuario `agentic-ptb`. Se trata de un punto de control guardado a las 26 horas de un run de 100 horas, dentro de una celda de entrenamiento llamada `kimi`, que utiliza un driver de razonamiento de alto esfuerzo (`kimi-code / kimi-k3`). El modelo parte de la base `Qwen/Qwen3.5-9B-Base` y tiene 9.409.813.744 parámetros, lo que lo sitúa en la categoría de modelos densos de ~9B.

Este checkpoint no es un modelo final listo para producción, sino una instantánea del proceso de entrenamiento. Su interés radica en que permite estudiar la evolución de las capacidades agénticas y de razonamiento a lo largo del tiempo, ya que el identificador `h026` indica la hora exacta del run en la que se guardó. Sin embargo, presenta una limitación crítica: el `eos_token_id` está incompleto (falta el token `<|im_end|>`), lo que provoca que el modelo no detenga correctamente las respuestas y pueda desbordar la ventana de contexto. Por tanto, cualquier evaluación debe interpretarse como un límite inferior, no como una medida real de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (hereda la del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (4 shards, 18.8 GB) |

## Arquitectura y entrenamiento

El modelo es un checkpoint de un experimento de RL sobre la base `Qwen/Qwen3.5-9B-Base`. La arquitectura subyacente es la de un transformer denso de ~9.4B parámetros, aunque no se proporcionan detalles específicos sobre la configuración de capas, atención o mecanismos internos. El entrenamiento se realiza mediante un pipeline de refuerzo con un driver denominado `kimi-code / kimi-k3` y un nivel de razonamiento (`reasoning effort`) fijado en `high`. El run completo dura 100 horas y este checkpoint corresponde a la hora 26.89.

No se ha publicado información sobre el dataset de entrenamiento, el número de tokens procesados, ni si se emplearon técnicas como RLHF o DPO. La única innovación técnica destacable es el propio esquema de entrenamiento por refuerzo para tareas agénticas, aunque no se documentan detalles del algoritmo. Además, el checkpoint presenta un `eos_token_id` incompleto (`[248044]` en lugar de `[248044, 248046]`), lo que afecta a la generación y a la validez de las evaluaciones.

## Capacidades

No se han publicado capacidades concretas verificadas para este checkpoint. Al ser un modelo intermedio de un experimento de RL orientado a tareas agénticas, se espera que desarrolle habilidades de razonamiento y codificación, pero no hay evidencia empírica disponible. Las capacidades listadas a continuacion son inferencias razonables basadas en el modelo base y el objetivo del experimento, no datos confirmados:

- Generacion de texto y razonamiento multi-paso (heredado del modelo base Qwen3.5-9B).
- Potencial capacidad de codificacion y ejecucion de tareas agénticas, dado el driver `kimi-code`.
- Soporte de tool calling y function calling: no confirmado, pero probable dado el enfoque agéntico.
- Capacidades multilingues: no disponibles (el modelo base Qwen3.5 soporta multiples idiomas, pero no se especifica para este checkpoint).
- Modo de razonamiento extendido (`thinking`): el parametro `reasoning effort: high` sugiere que el modelo esta entrenado para generar cadenas de razonamiento largas, aunque no se ha verificado.

## Casos de uso

Dado que se trata de un checkpoint intermedio con una limitacion grave en la generacion (falta el token de fin de turno), no es adecuado para uso en produccion. Los casos de uso realistas se limitan al ambito de la investigacion y el desarrollo:

- **Investigacion en entrenamiento por refuerzo**: permite analizar la evolucion de las capacidades de razonamiento a lo largo del tiempo, comparando checkpoints de distintas horas del run.
- **Estudio de dinamicas de convergencia**: util para observar como cambia el comportamiento del modelo en funcion de las horas de entrenamiento, especialmente en tareas de codificacion y agencia.
- **Depuracion de pipelines de RL**: sirve como punto de referencia para validar que el proceso de entrenamiento esta funcionando correctamente, antes de llegar a checkpoints finales.
- **Analisis de tokenizacion y generacion**: el problema del `eos_token_id` permite estudiar como afecta la ausencia de tokens de fin de turno a la calidad de las respuestas.
- **Comparacion de estrategias de razonamiento**: al tener `reasoning effort: high`, se puede comparar con checkpoints de menor esfuerzo para medir el impacto en el rendimiento.
- **Reempaquetado y evaluacion**: puede servir como material para practicar tecnicas de reempaquetado de checkpoints (anadir el token faltante) y evaluacion posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explicitamente que, debido al `eos_token_id` incompleto, cualquier numero de evaluacion debe considerarse un limite inferior y no una medicion real. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otros benchmarks.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 9.4B parametros. En precision fp16, el peso ocupa aproximadamente 18.8 GB (coincide con el tamano del repo). Para inferencia con contexto, se recomienda al menos 24 GB de VRAM (por ejemplo, una RTX 3090/4090 o A10G). Con cuantizacion a 8 bits (si estuviera disponible) se podria reducir a ~10 GB, y a 4 bits a ~5 GB, pero no se ofrecen cuantizaciones en el repo.
- **GPU recomendadas**: RTX 3090, RTX 4090, A100 40GB, H100. Para pruebas rapidas, una RTX 4090 (24 GB) es suficiente en fp16.
- **Compatibilidad con GPU de consumo**: si, una RTX 4090 o similar puede ejecutar el modelo en fp16, aunque con limitaciones de longitud de contexto.
- **Opciones de despliegue**: al ser un checkpoint intermedio sin formato GGUF ni cuantizaciones, no es compatible directamente con llama.cpp u Ollama. Se podria cargar con vLLM o Transformers si se reempaqueta correctamente, pero no se recomienda para produccion.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/kimi.h026.rl_v5.step_30 | 9.4B | No disponible | No disponible | Checkpoint intermedio, no apto para produccion |
| Qwen/Qwen3.5-9B-Base | 9.4B | No disponible (probablemente 128K o similar) | Apache 2.0 (tipico en Qwen) | Modelo base, disponible en HF |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 License | Modelo final, ampliamente usado |

No se dispone de datos de rendimiento para comparar. El checkpoint de AgentPTB es un experimento de investigacion, no un modelo final, por lo que no es comparable directamente con modelos comerciales o de referencia.

## Limitaciones y advertencias

- **Checkpoint intermedio**: no es un modelo final; su rendimiento puede ser muy inferior al de un modelo entrenado completamente.
- **Problema de generacion**: el `eos_token_id` esta incompleto, lo que provoca que el modelo no detenga las respuestas y pueda desbordar la ventana de contexto. No debe usarse en aplicaciones reales sin reempaquetar.
- **Sesgos y alucinaciones**: no se han evaluado; al ser un modelo basado en Qwen, puede heredar sesgos del modelo base, pero no hay datos.
- **Licencia**: no se especifica ninguna licencia, lo que impide su uso comercial o incluso su redistribucion sin autorizacion explicita del autor.
- **Idiomas**: no se especifican idiomas soportados; se asume herencia del modelo base, pero sin confirmacion.
- **Reproducibilidad**: al ser un checkpoint de un run especifico, puede no ser reproducible sin acceso al pipeline completo de entrenamiento.
- **Evaluaciones no fiables**: cualquier benchmark publicado sobre este checkpoint debe interpretarse con cautela debido al problema del token de fin de turno.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/kimi.h026.rl_v5.step_30
- Indice de checkpoints (mencionado en la model card): `agentic-ptb/INDEX` (no se ha verificado su existencia publica)
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
