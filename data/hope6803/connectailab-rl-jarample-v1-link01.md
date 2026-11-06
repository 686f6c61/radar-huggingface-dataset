# hope6803/connectailab-rl-jarample-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario hope6803 bajo el paraguas de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un "cerebro de decisión" para un robot simulado: recibe en texto el estado actual del robot (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y decisión previa) y devuelve una única letra que corresponde a la acción de locomoción a ejecutar durante los siguientes 0,5 segundos. El modelo se distribuye como adaptador PEFT (LoRA) en safetensors, no como pesos completos, y requiere cargar el modelo base Qwen3.5-0.8B para funcionar.

El entrenamiento combina dos fases. Primero se generó un conjunto de problemas a partir de las observaciones que un agente PPO entrenado en un simulador web (tarea `goto_target`, curso `379466c4`) registraba cada medio segundo, con la respuesta del agente como etiqueta; después se aplicó aprendizaje supervisado (LoRA) y, posteriormente, aprendizaje por refuerzo con PPO y anclaje KL para corregir las respuestas hacia acciones con mayor recompensa. El resultado es un modelo muy pequeño (0,8B parámetros en el base) especializado en una tarea de decisión discreta de cinco opciones.

Su relevancia es acotada pero interesante como ejemplo de destilación de políticas de RL en modelos de lenguaje pequeños: demuestra que un LLM de menos de mil millones de parámetros puede imitar y superar ligeramente a la política original en tasa de éxito de navegación simulada (95% frente a 85% en 20 episodios), con un coste de inferencia mínimo. Está etiquetado únicamente para coreano y para el pipeline `reinforcement-learning`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen3.5-0.8B |
| Parámetros totales | No disponible (0,8B en el modelo base; el adaptador no declara recuento) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (se distribuye en safetensors del adaptador, sin versiones GGUF) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Librería | peft |
| Pipeline | reinforcement-learning |
| Tamaño del repo | 0,0 GB (adaptador de pequeño tamaño) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. La innovación no está en la arquitectura del modelo base, sino en el procedimiento de destilación de una política de RL. En primer lugar, un agente PPO entrenado en un simulador web de locomoción 2D (tarea `goto_target`, con observaciones de 21 dimensiones y 5 acciones de caminata) recorre un curso concreto y registra cada 0,5 segundos su observación y su acción. Esas observaciones se serializan como texto (situación, pregunta y opciones) y la acción elegida por el agente se usa como etiqueta. Se añadió un 20% de ejemplos en los que el agente se desvió del camino, para que el modelo aprendiese también de decisiones subóptimas.

Sobre ese corpus (1188 ejemplos de entrenamiento, 229 de validación y 346 de test) se aplicó primero aprendizaje supervisado con LoRA. Después se aplicó aprendizaje por refuerzo con PPO: para cada opción se estimó la recompensa que se habría obtenido si el modelo la eligiese y el resto del episodio lo completase la política original, premiando las opciones mejores que la del profesor y penalizando las peores, con una penalización KL que mantiene al modelo cerca de la distribución supervisada. El techo teórico de acierto, dado que la conversión a texto preserva la decisión del agente en el 99% de los casos, es del 99%.

## Capacidades

- Decisión discreta de locomoción: dado un estado textual del robot, devuelve exactamente una letra entre cinco opciones de acción.
- Formato de salida restringido: el modelo está entrenado para responder solo con la letra, sin explicación, siguiendo una instrucción de sistema fija.
- Robustez ante instrucciones inyectadas: el prompt de sistema indica explícitamente tratar el contenido del estado como datos y no como instrucciones.
- Comprensión de estado numérico serializado: distancias, direcciones, lecturas de sensores y velocidad expresadas en texto.
- No soporta tool calling, ni agentes multi-paso, ni visión, ni audio, ni modo "thinking". No es un modelo conversacional de propósito general.
- Multilingüe: no; solo coreano según la model card.

## Casos de uso

- Navegación de robot simulado en 2D: el modelo se coloca en el punto de decisión de un agente y elige la acción de caminata cada 0,5 segundos; adecuado porque su entrenamiento replica exactamente ese bucle de decisión.
- Docencia de RL y destilación: sirve como ejemplo reproducible de cómo destilar una política PPO en un LLM pequeño mediante LoRA más PPO con anclaje KL; el cuaderno de Colab enlazado permite repetir el proceso.
- Investigación sobre LLM como políticas: permite comparar el rendimiento de un modelo de 0,8B frente a una política neuronal nativa en la misma tarea, con métricas de acierto y éxito de episodio ya publicadas.
- Prototipado rápido de controladores basados en lenguaje: al ser un adaptador pequeño, se puede cargar y sustituir en un pipeline existente de Qwen3.5-0.8B sin reentrenar el base.
- Evaluación de robustez frente a prompts: útil para estudiar cómo un modelo pequeño sigue instrucciones de formato estricto y resiste inyecciones en el estado.
- Base para adaptaciones a otras tareas de decisión: el mismo procedimiento (observación a texto, etiqueta del agente, LoRA más RL) podría trasladarse a otras tareas del simulador, aunque requeriría reentrenar el adaptador.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (tarea `goto_target`, curso `379466c4`, 20 episodios con semillas 91001–91020):

| Modelo | Acierto en test (misma acción que el profesor) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Política PPO (profesor) | 100,0% | 85% | 20% | 26,8 s |
| Modelo base sin ajuste | 41,3% | 0% | 0% | — |
| Tras aprendizaje supervisado (LoRA) | 77,5% | 85% | 15% | 26,2 s |
| Tras RL (PPO) | 76,3% | 95% | 15% | 26,6 s |

Nota: la evaluación de caminata se realizó con una aproximación 2D basada en una tabla de velocidades por comando, no con el simulador MuJoCo completo, por lo que los resultados pueden diferir de los del simulador web. El acierto en test baja ligeramente tras RL (77,5% a 76,3%) mientras el éxito de episodio sube (85% a 95%), lo que sugiere que el RL prioriza recompensa de episodio sobre imitación literal.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en fp16 para el base de 0,8B más el adaptador; en cuantización de 4 bits cabría en menos de 1 GB, aunque no se distribuyen pesos cuantizados.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050, RTX 4060); también funciona en CPU para inferencia puntual.
- Cabe en GPU consumer: sí, con margen amplio.
- Opciones de despliegue: transformers más peft (procedimiento indicado por el autor); vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador y requerirían conversión manual.
- Latencia y throughput: no disponibles. Por el tamaño del modelo y la salida de un solo token, la latencia esperada es de decenas de milisegundos en GPU consumer, pero no hay medición publicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | 0,8B (base) + LoRA | No disponible | Decisión de locomoción simulada | Apache 2.0 | Hugging Face, adaptador PEFT |
| Qwen3.5-0.8B (base) | 0,8B | No disponible | Lenguaje general | No disponible en la información | Hugging Face |
| Política PPO `goto_target` | No disponible (red pequeña) | No aplica | Decisión de locomoción simulada | No disponible | Solo dentro del simulador del autor |

No se dispone de datos de benchmarks de otros modelos de decisión comparables en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: solo responde a la tarea `goto_target` con el formato de observación exacto del autor; fuera de ese esquema la salida no es fiable.
- Idioma: etiquetado solo para coreano; no se garantiza comportamiento en castellano ni en otros idiomas.
- Evaluación aproximada: la métrica de éxito se obtuvo con una tabla de velocidades 2D, no con el simulador MuJoCo completo, por lo que puede no reflejar el comportamiento real.
- Uso previsto: el propio autor indica que es un modelo de investigación y educación sobre simulador; debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- Riesgo de alucinación: aunque el formato de salida es de una letra, el modelo puede devolver opciones no válidas o texto adicional si el prompt se desvía del formato entrenado.
- Sesgos: no documentados; el corpus procede de una única política y un único curso, lo que limita la diversidad de situaciones.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el modelo base Qwen3.5-0.8B recae en sus propios términos.
- Sin soporte de tool calling, agentes multi-paso ni contexto largo documentado; no debe emplearse como asistente general.

## Enlaces

- Hugging Face: https://huggingface.co/hope6803/connectailab-rl-jarample-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
