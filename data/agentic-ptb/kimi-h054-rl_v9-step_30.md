# agentic-ptb/kimi.h054.rl_v9.step_30

## Resumen

El repositorio `agentic-ptb/kimi.h054.rl_v9.step_30` contiene un checkpoint intermedio de un barrido de entrenamiento (sweep) denominado AgentPTB, desarrollado por el usuario agentic-ptb. Se trata de un ajuste fino por refuerzo (RL) sobre el modelo base Qwen/Qwen3.5-9B-Base, con un total de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El nombre "kimi" corresponde a la celda experimental del barrido, no al modelo Kimi de Moonshot AI, y el checkpoint fue guardado a las 5,08 horas de una ejecución planificada de 100 horas.

Este artefacto no es un modelo final listo para producción, sino una instantánea intermedia de un proceso de investigación sobre dinámicas de entrenamiento con RL. Su relevancia radica en que permite estudiar la evolución del rendimiento a lo largo del tiempo de entrenamiento, aunque presenta una limitación crítica: el token de fin de secuencia (EOS) está incompleto, lo que invalida cualquier evaluación directa como medición fiable. La ficha refleja exclusivamente los datos disponibles en la model card y en el repositorio, sin extrapolaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.5-9B-Base, sin detalles adicionales) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por refuerzo del checkpoint base Qwen/Qwen3.5-9B-Base. La model card indica que pertenece a un barrido de 100 horas de duración, con el rol de checkpoint intermedio (guardado a la hora 5,08). El nombre del repositorio (`rl_v9`) sugiere que se trata de la novena versión de un experimento de RL, aunque no se especifican los detalles del algoritmo (PPO, GRPO, etc.) ni la composición del dataset de entrenamiento. El checkpoint se almacenó en 4 shards, ocupando 18,8 GB en total.

Un aspecto técnico destacable es la advertencia sobre el token EOS: el checkpoint solo incluye el token `248044` y carece del token `248046` (`<|im_end|>`), que es el que la plantilla de chat de Qwen3.5 utiliza para terminar cada turno de asistente. Esto implica que el modelo no se detiene correctamente al final de un turno y puede sobrepasar la ventana de contexto, por lo que cualquier métrica de evaluación obtenida con este checkpoint debe interpretarse como un límite inferior, no como una medición real.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-9B-Base, aunque no hay documentación específica sobre el rendimiento de este checkpoint.
- No se dispone de información sobre tool calling, capacidades de agente, multimodalidad o soporte multilingüe.
- El checkpoint está diseñado para experimentos de investigación, no para uso directo en aplicaciones.

## Casos de uso

- Investigación sobre dinámicas de entrenamiento RL: permite analizar cómo evoluciona el comportamiento del modelo a lo largo de las horas de entrenamiento, comparando checkpoints de diferentes horas del mismo barrido.
- Estudio de la influencia del token EOS en la generación: al carecer del token `<|im_end|>`, puede usarse para investigar el efecto de la terminación de secuencia en modelos de chat.
- Reproducción de experimentos: los checkpoints intermedios sirven para verificar la reproducibilidad de los resultados del barrido AgentPTB.
- Desarrollo de técnicas de empaquetado de checkpoints: la advertencia sobre el EOS faltante motiva el desarrollo de métodos para re-empaquetar o corregir estos artefactos antes de su evaluación.
- Benchmarking de infraestructura de entrenamiento: al ser un checkpoint de tamaño moderado (9,4B), puede utilizarse para probar pipelines de inferencia o evaluación en entornos con recursos limitados.
- Análisis de la relación entre el tiempo de entrenamiento y el rendimiento: los repositorios con nombres como `h054` (hora 54) permiten mapear directamente el checkpoint sobre las curvas de rendimiento del barrido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente de que, debido al token EOS incompleto, cualquier número de evaluación obtenido con este checkpoint es un límite inferior y no debe compararse con otros modelos sin tener en cuenta esta limitación.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 20 GB para cargar los pesos en precisión fp16 (18,8 GB de pesos más overhead de activaciones y KV cache). Con cuantización a 8 bits se podría reducir a unos 10-12 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: NVIDIA A100 (40 GB), RTX 4090 (24 GB), o GPUs con al menos 24 GB de VRAM para inferencia en fp16. Para cuantización, una RTX 3090 (24 GB) o RTX 4080 (16 GB) podrían ser suficientes.
- No cabe en GPUs de consumo con menos de 16 GB de VRAM sin cuantización.
- Opciones de despliegue: al ser un checkpoint intermedio sin formato GGUF ni soporte oficial, las opciones son limitadas. Se podría cargar con transformers o vLLM si se corrige el token EOS, pero no se recomienda su uso en producción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Este checkpoint no tiene modelos comparables directos, ya que es un artefacto intermedio de un experimento de investigación, no un modelo final. Su base (Qwen3.5-9B-Base) podría compararse con otros modelos de 9B como Llama 3.1 8B o Mistral 7B, pero el checkpoint en sí no ha sido evaluado de forma fiable.

## Limitaciones y advertencias

- Token EOS incompleto: el checkpoint carece del token `<|im_end|>` (248046), por lo que no detiene la generación al final de un turno y puede sobrepasar la ventana de contexto. Cualquier evaluación es un límite inferior, no una medición real.
- Checkpoint intermedio: no es un modelo final; fue guardado a las 5,08 horas de un entrenamiento de 100 horas, por lo que su rendimiento es previsiblemente inferior al del checkpoint final.
- Licencia no especificada: no se indica la licencia de uso, lo que impide su utilización comercial o incluso académica sin autorización explícita del autor.
- Sin documentación de capacidades: no se detallan los idiomas soportados, la longitud de contexto ni las tareas para las que fue entrenado.
- Riesgo de alucinación y sesgos: al ser un fine-tune de Qwen3.5-9B-Base, hereda los sesgos y limitaciones del modelo base, pero no hay datos específicos sobre este checkpoint.
- No apto para producción: por su naturaleza experimental y la falta de licencia y documentación, no debe utilizarse en aplicaciones reales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/agentic-ptb/kimi.h054.rl_v9.step_30
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) asociados a este checkpoint específico.
