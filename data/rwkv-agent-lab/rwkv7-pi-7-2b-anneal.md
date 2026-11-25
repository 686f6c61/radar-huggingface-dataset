# RWKV-Agent-Lab/RWKV7-Pi-7.2B-Anneal

## Resumen

RWKV7-Pi-7.2B-Anneal es un checkpoint intermedio de la familia RWKV7, desarrollado por RWKV-Agent-Lab, especializado en tareas de agente de programación autónoma (coding agent). Se trata de un modelo de 7.200 millones de parámetros construido sobre RWKV7-Agent-7.2B mediante un proceso de annealing de alta señal tras el ajuste supervisado (SFT) a gran escala, y sirve como base directa pre-RL para la versión final RWKV7-Pi-7.2B (v0.1-final).

El modelo emplea la arquitectura RWKV7, una familia de modelos recurrentes lineales que combina características de transformers y RNN, lo que le permite un coste de inferencia constante respecto a la longitud de contexto. Está orientado específicamente a tool-use y razonamiento multi-paso en entornos de codificación, con soporte para chino e inglés.

Su relevancia radica en que documenta una etapa concreta del pipeline de entrenamiento de un agente de código open source: el paso de annealing entre SFT y RL. No obstante, el propio autor recomienda usar la versión final post-entrenada para casos de uso en producción, por lo que este checkpoint tiene un interés principalmente de investigación y reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV7 (recurrente lineal, familia RWKV) |
| Parametros totales | 7.200 millones (7.2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | .pth (BF16, pesos fusionados standalone) |

## Arquitectura y entrenamiento

El modelo se basa en RWKV7, una arquitectura recurrente lineal que sustituye la atención cuadrática de los transformers por una formulación recurrente con coste lineal en la longitud de secuencia. Esto permite inferencia con memoria constante y throughput estable independientemente de la longitud de contexto, una ventaja relevante para agentes que mantienen sesiones largas con muchas llamadas a herramientas.

El entrenamiento parte de RWKV7-Agent-7.2B (fundación compartida de agente) y aplica un proceso de annealing de alta señal tras el SFT de agente a gran escala. Este checkpoint actúa como puente entre el SFT masivo y el RL/OPD, y es la base directa pre-RL de la versión final RWKV7-Pi-7.2B. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas como RLHF o DPO en esta etapa concreta. Los pesos se distribuyen como un único fichero BF16 standalone con pesos fusionados.

## Capacidades

- Generación de texto y razonamiento orientado a tareas de codificación.
- Uso de herramientas (tool calling / function calling) como capacidad central del entrenamiento.
- Razonamiento multi-paso y comportamiento de agente autónomo para tareas de programación.
- Soporte multilingüe limitado a chino e inglés.
- Especialización en flujos de trabajo de coding agent (edición de código, ejecución de comandos, iteración sobre resultados).
- Capacidad de servir como base pre-RL para investigación en pipelines de post-entrenamiento.

## Casos de uso

- Investigación en pipelines de post-entrenamiento: el checkpoint permite reproducir y analizar la transición entre SFT de agente y RL, comparando el comportamiento del modelo antes y después de la etapa de annealing.
- Desarrollo de agentes de código experimentales: puede integrarse en entornos de ejecución de código para probar estrategias de tool-use antes de pasar a la versión final.
- Evaluación de arquitecturas recurrentes en tareas de agente: sirve para medir cómo se comporta RWKV7 frente a transformers en razonamiento multi-paso y llamadas a herramientas.
- Generación y edición de código asistida en flujos de desarrollo internos, con la salvedad de que el autor recomienda la versión final para uso real.
- Experimentación con despliegue en `rwkv-lightning-cuda`: el servidor incluido permite levantar una API local para pruebas de integración.
- Estudio comparativo de checkpoints intermedios: útil para analizar qué capacidades emergen en cada fase del entrenamiento de un agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 7.2B parámetros en BF16 se requiere aproximadamente 14-15 GB solo para pesos, más overhead de estado recurrente y KV.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño, encajaría en GPUs con 16 GB o más en BF16, pero no hay datos oficiales.
- Opciones de despliegue: el autor proporciona el binario `rwkv_lighting_cuda` con parámetros `--model-path`, `--vocab-path`, `--host` y `--port`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RWKV7-Pi-7.2B-Anneal | 7.2B | no disponible | Apache-2.0 | Hugging Face (este repo) |
| RWKV7-Agent-7.2B | 7.2B | no disponible | no disponible | Hugging Face (modelo base) |
| RWKV7-Pi-7.2B (final) | 7.2B | no disponible | no disponible | Hugging Face (release final recomendada) |

No se dispone de datos de rendimiento comparativo entre estos checkpoints ni con modelos de otras familias.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no la versión final: el propio autor recomienda usar RWKV7-Pi-7.2B para casos de uso reales de coding agent.
- Idiomas limitados a chino e inglés; no hay soporte declarado para castellano.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado sobre datos de código y agente, puede heredar sesgos de esos corpus.
- Riesgo de alucinación en generación de código y en llamadas a herramientas, especialmente al no haber pasado por la etapa final de RL.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de benchmarks y de documentación sobre el dataset de entrenamiento limita la evaluación de riesgos en producción.
- La longitud de contexto no está publicada, lo que dificulta planificar despliegues con sesiones largas.
- Requiere el runtime específico `rwkv-lightning-cuda`; no hay soporte declarado para ecosistemas estándar como transformers o llama.cpp.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RWKV-Agent-Lab/RWKV7-Pi-7.2B-Anneal
- Modelo base: https://huggingface.co/RWKV-Agent-Lab/RWKV7-Agent-7.2B
- Versión final recomendada: https://huggingface.co/RWKV-Agent-Lab/RWKV7-Pi-7.2B
