# medhansh2808/g1-plate-bc-ablations

## Resumen

`g1-plate-bc-ablations` es un repositorio de checkpoints de ablación que acompaña a `medhansh2808/g1-plate-bc-expert`, el modelo de referencia del mismo autor para una tarea de manipulación robótica de transferencia de platos con el robot humanoide Unitree G1 en el simulador BiGym. No es un modelo de lenguaje ni un modelo fundacional: es una política de imitación (behavior cloning) entrenada para control robótico, publicada bajo licencia Apache 2.0 y con un tamaño de repositorio de 0,1 GB.

El interés del repositorio es metodológico más que de uso directo. Contiene dos variantes experimentales: una ronda de DAgger (`dagger_round1/`) que, según el propio autor, rindió peor que el modelo base (23/30 episodios públicos frente a 27/30), y una variante con chunks de acción de 50 pasos (`chunk50/`) que se comporta de forma equivalente al modelo de referencia dentro del ruido estadístico. El autor documenta explícitamente que el fallo de DAgger probablemente se debe a un defecto de etiquetado en su implementación, no a una limitación del algoritmo.

La relevancia actual es acotada: sirve como material reproducible para investigadores que trabajan en imitation learning aplicado a robótica humanoide, y como evidencia negativa documentada sobre un pipeline de DAgger mal instrumentado. No debe confundirse con un modelo listo para producción ni con una política recomendada; el propio autor remite al checkpoint `g1-plate-bc-expert` como el mejor modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política de behavior cloning para control robótico (detalles de red no disponibles en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones del simulador BiGym) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints cargables mediante `model.py` / `bc_policy.py` del repositorio (formato concreto no especificado en la model card) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna de la red (número de capas, dimensión de las representaciones, tipo de encoder visual o de estado). Lo que sí se especifica es el esquema de entrenamiento: behavior cloning sobre episodios de demostración en el entorno BiGym con el robot Unitree G1, con una variante que predice chunks de acción de 50 pasos (`chunk50/`) y otra que aplica una ronda de DAgger (`dagger_round1/`) partiendo del mejor modelo y añadiendo 192 episodios de rollouts del estudiante etiquetados por un experto privilegiado.

La innovación documentada no es algorítmica sino experimental: el repositorio publica ablaciones con resultados numéricos comparables. El autor identifica un fallo concreto en su implementación de DAgger: las etiquetas del experto en ventanas generadas por el estudiante se anclaban al comando ejecutado por el propio estudiante, lo que degrada la señal de corrección. También reporta que el uso de chunks de acción de 50 pasos no altera el rendimiento de forma significativa (57/59/59 de 60 en ejecución 20/35/50 sobre las semillas 7, 320.000+).

## Capacidades

- Control robótico de manipulación: transferencia de platos con el humanoide Unitree G1 en el simulador BiGym.
- Ejecución de políticas de imitación con chunks de acción configurables (variante de 50 pasos).
- Carga de checkpoints mediante los scripts `model.py` y `bc_policy.py`, con variables de entorno `BC_CHECKPOINT` y `BC_EXECUTE`.
- Evaluación reproducible sobre conjuntos de episodios públicos y "fresh block" (50/60 y 60 episodios según la variante).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo ni modalidades de texto, visión general o audio.

## Casos de uso

- Investigación en imitation learning: reproducir la comparación entre behavior cloning simple y una ronda de DAgger en una tarea de manipulación concreta, usando los checkpoints como línea base documentada.
- Análisis de fallos en pipelines de DAgger: estudiar el defecto de etiquetado descrito por el autor (anclaje de etiquetas al comando del estudiante) y diseñar variantes corregidas que sirvan de comparación.
- Estudio de chunking de acciones: evaluar el impacto del tamaño de chunk (50 pasos frente al valor del modelo base) en la estabilidad y la tasa de éxito de la política.
- Reproducibilidad de experimentos en BiGym: emplear los episodios y semillas reportadas (7, 320.000+) para verificar resultados de forma independiente.
- Docencia y formación: usar el repositorio como ejemplo de publicación de ablaciones con resultados negativos y análisis de causa raíz.
- Punto de partida para fine-tuning: cargar `chunk50/` como inicialización en experimentos propios sobre la misma tarea, dado su rendimiento equivalente al modelo de referencia.

## Benchmarks y rendimiento

Los únicos datos disponibles son las tasas de éxito reportadas por el autor en la model card, sobre episodios de evaluación en BiGym.

| Variante | Episodios públicos | Fresh block | Notas |
|---|---|---|---|
| `g1-plate-bc-expert` (referencia) | 27/30 (exec 20) | 59/60 | Mejor modelo según el autor |
| `dagger_round1/` | 23/30 (exec 20) | 50/60 | Peor que la referencia; atribuido a fallo de etiquetado |
| `chunk50/` | 57/59/59 de 60 en exec 20/35/50 (semillas 7, 320.000+) | no disponible | Equivalente dentro del ruido |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; el tamaño del repositorio (0,1 GB) sugiere que los checkpoints son ligeros y probablemente quepan en GPU de consumo, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el tamaño reducido del repositorio lo hace plausible, pero no hay dato oficial.
- Opciones de despliegue: carga mediante `model.py` / `bc_policy.py` del repositorio, con `BC_CHECKPOINT` y `BC_EXECUTE` como variables de configuración. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `g1-plate-bc-ablations` | BC (ablaciones) | Transferencia de platos, Unitree G1 en BiGym | no disponible | no aplica | Apache 2.0 | Hugging Face |
| `medhansh2808/g1-plate-bc-expert` | BC (referencia) | Misma tarea | no disponible | no aplica | Apache 2.0 (presumible, mismo autor) | Hugging Face |
| Otras políticas de imitation learning para BiGym | BC / RL | Manipulación en BiGym | no disponible | no aplica | variable | no disponible en la información proporcionada |

No se dispone de datos de benchmarks comparables con alternativas de terceros en la información proporcionada.

## Limitaciones y advertencias

- No es el modelo recomendado: el propio autor indica que son ablaciones y remite a `g1-plate-bc-expert` como mejor modelo.
- La variante `dagger_round1/` rinde peor que la referencia (23/30 frente a 27/30 en episodios públicos), por lo que no debe desplegarse como política principal.
- El fallo de DAgger se atribuye a un defecto de etiquetado en la implementación del autor; los resultados no deben interpretarse como evidencia contra el algoritmo DAgger en general.
- Ámbito de aplicación muy restringido: una única tarea de manipulación en un simulador concreto (BiGym) y un robot concreto (Unitree G1); no hay evidencia de generalización a otros entornos, objetos o robots.
- No hay información sobre sesgos, alucinación o comportamiento fuera de distribución más allá de lo que se deduce del propio benchmark.
- No se documentan requisitos de hardware, latencia ni formato exacto de pesos, lo que dificulta la planificación de despliegue.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de documentación técnica completa desaconseja su uso en producción sin validación adicional.
- Los checkpoints se cargan con scripts propios del repositorio; no hay integración con frameworks estándar de serving.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/medhansh2808/g1-plate-bc-ablations
- Modelo de referencia: https://huggingface.co/medhansh2808/g1-plate-bc-expert
- Documentación de experimentos citada en la model card: `EXPERIMENTS.md` (incluido en el repositorio)
- Scripts de carga citados: `model.py`, `bc_policy.py` (incluidos en el repositorio)
- Entorno de simulación BiGym: no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
