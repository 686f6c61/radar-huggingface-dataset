# CheonggyeRoad/cgc-autonomous-driving-pure-ppo

## Resumen

`cgc-autonomous-driving-pure-ppo` es un conjunto de checkpoints de aprendizaje por refuerzo para conducción autónoma urbana, publicado por el usuario CheonggyeRoad. El modelo se entrena sobre el entorno de simulación CGC_STAGE (청계천로, Seúl) usando exclusivamente PPO puro, sin imitación (behaviour cloning) previa, como línea base end-to-end para comparar variantes de arquitectura. No es un modelo de lenguaje: es una política de control (actor-critic) que mapea observaciones del simulador a acciones de conducción.

El repositorio incluye tres variantes: una MLP de dos capas sobre observaciones planas de 67 dimensiones, una variante con self-attention sobre 9 entidades y acción híbrida (aceleración continua y carril discreto), y una variante con atención sobre 9 entidades y acción multi-discreta (5 niveles de aceleración y 3 niveles de carril). El interés técnico está en el hallazgo negativo documentado: la introducción de entity self-attention eleva la tasa de completado en rollouts hasta el 81 %, pero en evaluación determinista la política colapsa a frenadas conservadoras (0,0–0,3 m/s) por conflicto entre objetivos (crucero, parada de 10 s en parada y evitación de colisiones).

El modelo es relevante como referencia metodológica para investigadores que trabajan en RL puro aplicado a conducción, y como evidencia de las limitaciones estructurales de PPO sin imitación en tareas con recompensas multiobjetivo en conflicto. El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0,0 GB en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política actor-critic PPO; variantes MLP (2 capas) y transformer con self-attention sobre 9 entidades |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la observación es un vector de 67 dimensiones o 9 entidades) |
| Tipos de cuantización | no disponible (no se publican pesos en formatos cuantizables tipo GGUF) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (checkpoints de RL; el formato concreto no se especifica en la model card) |

## Arquitectura y entrenamiento

El entrenamiento es PPO puro end-to-end sobre el simulador CGC_STAGE, sin fase de behaviour cloning. Se publican tres checkpoints. El primero, `stage1_mlp_baseline`, usa una MLP de dos capas sobre un vector de observación plano de 67 dimensiones. El segundo, `stage1_entity_attn_hybrid`, sustituye la entrada por 9 entidades procesadas con self-attention y emplea un espacio de acción híbrido: aceleración continua combinada con selección discreta de carril. El tercero, `stage1_entity_attn_disc`, mantiene la atención sobre 9 entidades pero usa un espacio de acción multi-discreto con 5 niveles de aceleración y 3 niveles de carril.

No se especifican en la información disponible el número de tokens o pasos de entrenamiento, la composición del dataset (generado por el simulador), ni detalles de recompensa más allá de la mención a tres objetivos en conflicto: crucero, detención de 10 segundos en parada y evitación de colisiones. Tampoco se documentan hiperparámetros de PPO, tamaño de red, función de ventaja ni técnicas auxiliares como reward shaping o curriculum learning.

## Capacidades

- Control de conducción autónoma en el simulador SUMO/CGC_STAGE a partir de observaciones del entorno.
- Tres espacios de acción: aceleración continua, híbrido (continua + carril discreto) y multi-discreto (5 niveles de aceleración, 3 de carril).
- Procesamiento de observaciones estructuradas: vector plano de 67 dimensiones o conjunto de 9 entidades con self-attention.
- Aprendizaje por refuerzo online sin datos de demostración (sin BC).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües, de visión, audio ni modo de razonamiento explícito.
- No es un agente conversacional ni un modelo generativo de texto.

## Casos de uso

- Línea base de investigación en RL puro: sirve para comparar el efecto de añadir imitación (BC) antes de PPO, ya que el autor publica el pipeline BC + PPO en un repositorio separado.
- Estudio de ablación de arquitectura: los tres checkpoints permiten aislar el efecto de la self-attention sobre entidades y del tipo de espacio de acción en la tasa de completado.
- Análisis de colapso de políticas multiobjetivo: útil para investigar por qué una política con buen rendimiento en rollout converge a frenadas conservadoras en evaluación determinista.
- Reproducción de entornos de simulación urbana: el modelo está acoplado a CGC_STAGE, por lo que sirve como referencia para quien replique ese entorno en SUMO.
- Docencia en aprendizaje por refuerzo: ejemplo concreto de PPO aplicado a un problema de control con recompensas en conflicto y espacio de acciones mixto.
- Punto de partida para reward shaping: las limitaciones documentadas orientan el diseño de funciones de recompensa que descompongan o ponderen los objetivos de crucero, parada y seguridad.

## Benchmarks y rendimiento

La model card solo reporta la tasa de completado en rollouts para la variante con entity self-attention: hasta un 81 %. No se publican resultados de MMLU, HumanEval, GSM8K ni métricas de conducción estándar (tiempo hasta colisión, distancia recorrida, cumplimiento de paradas) en la información disponible.

| Métrica | MLP baseline | Entity attention híbrida | Entity attention discreta |
|---|---|---|---|
| Tasa de completado (rollout) | no disponible | hasta 81 % | no disponible |
| Rendimiento en evaluación determinista | no disponible | frenada conservadora 0,0–0,3 m/s | no disponible |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0,0 GB y no se especifican parámetros de red, aunque por la arquitectura descrita (MLP de 2 capas y atención sobre 9 entidades) el modelo es de tamaño muy reducido y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no especificadas; para inferencia de una política de este tamaño bastaría una GPU de gama baja o incluso CPU.
- Cabe en GPU consumer: previsiblemente sí, dado el reducido tamaño, aunque no se aportan cifras concretas.
- Opciones de despliegue: no se indican; al ser checkpoints de RL ligados a CGC_STAGE, el despliegue requiere el entorno de simulación (SUMO) y el código de inferencia del autor, no publicado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. La model card menciona un repositorio separado con el pipeline BC + PPO del mismo autor, que sería la comparación natural (RL puro frente a imitación + RL), pero no se aportan sus especificaciones.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cgc-autonomous-driving-pure-ppo | no disponible | no aplica | 81 % completado en rollout (variante atención) | no disponible | Hugging Face |
| Pipeline BC + PPO (mismo autor) | no disponible | no aplica | no disponible | no disponible | repositorio separado, no enlazado |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Colapso a política conservadora: en evaluación determinista la variante con atención converge a frenadas de 0,0–0,3 m/s por conflicto entre objetivos (crucero, parada de 10 s y evitación de colisiones), lo que la hace inutilizable como controlador real sin cambios en recompensa o entrenamiento.
- Acoplamiento al entorno: los checkpoints están entrenados para CGC_STAGE y no son transferibles a otros simuladores o al mundo real sin reentrenamiento.
- Sin licencia declarada: no se especifica licencia, por lo que el uso comercial queda sin autorización explícita y requiere contactar con el autor.
- Sin datos de evaluación estandarizados: no se publican métricas de seguridad, distancia recorrida ni cumplimiento de paradas, lo que impide comparar rigurosamente con otras políticas.
- Repositorio sin tracción: 0 descargas y 0 likes, sin evidencia de validación externa ni mantenimiento.
- Sin información sobre sesgos: al no operar sobre datos humanos ni lenguaje, no aplican sesgos de ese tipo, pero no se documenta el comportamiento en escenarios de borde (peatones, intersecciones no señalizadas).
- Ausencia de detalles de entrenamiento: sin número de pasos, hiperparámetros ni semillas, la reproducibilidad es limitada.

## Enlaces

- Hugging Face: https://huggingface.co/CheonggyeRoad/cgc-autonomous-driving-pure-ppo
