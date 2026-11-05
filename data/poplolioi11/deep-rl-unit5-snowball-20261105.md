# poplolioi11/deep-rl-unit5-snowball-20261105

## Resumen

`poplolioi11/deep-rl-unit5-snowball-20261105` es una política de inferencia PPO entrenada para el entorno Unity ML-Agents SnowballTarget, publicado por el usuario poplolioi11 (Chen-Yu Chu). No se trata de un modelo de lenguaje: es un artefacto de aprendizaje por refuerzo profundo exportado a ONNX que resuelve una tarea concreta de control dentro de una simulación Unity, la del ejercicio Unit 5 del curso oficial de Deep RL de Hugging Face.

El modelo se entrenó desde cero durante 200.112 pasos de agente, sin cargar ninguna política preentrenada de terceros, y se evaluó sobre un conjunto fijo de semillas (50000-50009) con 110 episodios completados. El resultado medido es un retorno medio de 25,85 con desviación estándar poblacional de 2,97, lo que supera el objetivo tutorial de recompensa media 15 indicado en el curso.

Su relevancia es acotada y práctica: sirve como referencia reproducible de un pipeline completo de entrenamiento PPO en ML-Agents (entrenamiento, evaluación, exportación ONNX y empaquetado), y como política lista para usar en la demo oficial de SnowballTarget. No tiene capacidades de generación de texto, visión, tool calling ni multilingüismo; cualquier uso fuera del entorno Unity compatible no está soportado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política PPO para ML-Agents (arquitectura interna no detallada en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos exportados en ONNX flotante) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | ONNX (`SnowballTarget.onnx`), con firmas de entrada/salida en `config.json` |

## Arquitectura y entrenamiento

Se trata de una política de aprendizaje por refuerzo entrenada con Proximal Policy Optimization (PPO) sobre el entorno SnowballTarget de Unity ML-Agents. El autor declara 200.112 pasos de entrenamiento de agente desde la inicialización, sin carga de políticas preentrenadas. La arquitectura concreta de la red (número de capas, unidades, tipo de observación) no se detalla en la información disponible; el artefacto distribuido es únicamente la política de inferencia exportada a ONNX, junto con la configuración mínima y los datos de evaluación.

El proceso de exportación se verificó para asegurar que los inicializadores numéricos, la estructura de operaciones y el contenido de inferencia no se modificaron, con hashes coincidentes entre el original y el publicado en `provenance.json`. No se incluyen el código de entrenamiento, los checkpoints del optimizador, binarios del player ni credenciales. La receta completa de entrenamiento es privada. El run se conectó mediante la API de comunicador Python/Unity 1.5.0, con el paquete de Unity en versión 2.1.0-exp.1. El autor declara explícitamente que la implementación, orquestación y empaquetado contaron con asistencia de IA bajo su autorización, y que no se evaluó el dominio humano independiente de los algoritmos.

## Capacidades

- Control de agente en el entorno Unity ML-Agents SnowballTarget: la política mapea observaciones del entorno a acciones compatibles con el layout original de observación/acción.
- Inferencia exclusivamente: el artefacto es una política congelada, no un modelo entrenable ni adaptable en el paquete distribuido.
- Ejecución en ONNX Runtime o en el runtime de ML-Agents compatible, con firmas de entrada/salida documentadas en `config.json`.
- Reproducibilidad de evaluación: se incluyen `evaluation.json` y `episodes.csv` con los registros reales de los 110 episodios.
- No soporta tool calling, function calling, agentes multi-paso, generación de texto, visión, audio ni capacidades multilingües.

## Casos de uso

- Reproducción del ejercicio Unit 5 del curso de Deep RL de Hugging Face: la política permite verificar el resultado esperado del hands-on sin reentrenar, comparando el retorno medio obtenido (25,85) con el objetivo tutorial de 15.
- Referencia de pipeline PPO en ML-Agents: sirve como ejemplo completo de entrenamiento, evaluación sobre semillas fijas, exportación ONNX y empaquetado con procedencia verificada para equipos que construyan flujos similares.
- Demo interactiva en el Space oficial de SnowballTarget: la política puede cargarse en la demo de Thomas Simonini para observar el comportamiento del agente en el entorno original.
- Pruebas de integración de ML-Agents con ONNX: útil para validar la compatibilidad entre la API de comunicador Python/Unity 1.5.0 y el paquete Unity 2.1.0-exp.1 en pipelines de CI.
- Docencia y material de estudio: ejemplo concreto y medido de una política PPO con métricas de evaluación declaradas y datos de episodios disponibles para análisis estadístico.
- Auditoría de procedencia de artefactos: el paquete incluye hashes y verificación de que no hay trazas de código privado, lo que lo convierte en un caso de estudio de empaquetado reproducible de políticas de RL.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Retorno medio por episodio (raw) | 25,8545454545 |
| Desviación estándar poblacional (ddof=0) | 2,9721016856 |
| Media menos desviación estándar | 22,8824437689 |
| Semillas de evaluación | 50000-50009 |
| Episodios completados | 110 |
| Pasos de entrenamiento | 200.112 |

Las recompensas son retornos reales de Unity sin escalar. El autor advierte que los episodios están agrupados en diez semillas y que la desviación estándar no es un intervalo de confianza. La selección del checkpoint no utilizó los resultados del holdout. No se han publicado comparaciones con otras políticas en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser una política de RL de pequeño tamaño exportada a ONNX, la huella de memoria es mínima y puede ejecutarse en CPU.
- GPU recomendadas: no se especifican; el entorno Unity y ML-Agents pueden ejecutarse en CPU o en GPU consumer sin requisitos particulares documentados.
- Cabe en cualquier GPU consumer e incluso en CPU, dado el tamaño del repositorio (0,0 GB) y la naturaleza del artefacto.
- Opciones de despliegue: ONNX Runtime, Unity ML-Agents con el paquete Unity 2.1.0-exp.1 y la API de comunicador 1.5.0, o la demo oficial en Hugging Face Spaces.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre otras políticas PPO publicadas para el mismo entorno SnowballTarget en la información proporcionada. La comparación con modelos de lenguaje u otros artefactos de RL no es aplicable por diferencia de tarea y formato.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deep-rl-unit5-snowball-20261105 | no disponible | no aplica | mean_reward 25,85 ± 2,97 | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ámbito estrictamente limitado: solo funciona con el layout de observación/acción del entorno SnowballTarget original; no es reutilizable en otras tareas sin reentrenamiento.
- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no tiene capacidades generativas.
- Los resultados de evaluación son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- La desviación estándar reportada no es un intervalo de confianza; los episodios están agrupados en diez semillas y pueden superar diez por semilla cuando coinciden eventos terminales.
- La certificación oficial del curso es un proceso separado y el autor no la reclama.
- La receta completa de entrenamiento es privada; no se incluyen código de entrenamiento, checkpoints del optimizador ni binarios del player.
- El autor declara asistencia de IA en la implementación y no evalúa el dominio humano independiente de los algoritmos.
- La licencia MIT cubre únicamente los pesos de inferencia, datos de evaluación, configuración y documentación; no relicencia Unity, ML-Agents, PyTorch ni los assets del entorno, que no se distribuyen en el paquete.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas por no aplicar a este tipo de artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/poplolioi11/deep-rl-unit5-snowball-20261105
- Ejercicio oficial Unit 5: https://huggingface.co/learn/deep-rl-course/unit5/hands-on
- Entorno oficial SnowballTarget: https://github.com/huggingface/Snowball-Target
- Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Demo oficial SnowballTarget: https://huggingface.co/spaces/ThomasSimonini/ML-Agents-SnowballTarget
