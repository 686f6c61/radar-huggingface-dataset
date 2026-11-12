# Mari4Z/drone-rescue

## Resumen

Drone Rescue es un conjunto de modelos de aprendizaje por refuerzo (RL) desarrollado por Mari4Z como proyecto final de MLOps de la Universidad Externado de Colombia. No es un modelo de lenguaje: es una colección de políticas entrenadas con Stable-Baselines3 sobre entornos Gymnasium personalizados, donde un dron debe transportar un suministro desde una base hasta una zona de entrega, soltarlo de forma controlada y regresar, esquivando columnas y gestionando la batería. El proyecto define tres niveles de dificultad creciente: N1 (misión base), N2 (más columnas y menos batería) y N3 (N2 con viento).

El repositorio publica un único modelo seleccionado por un pipeline de Airflow con criterios fijados a priori: la política PPO de la familia `drone-rescue-v3` para el nivel N1, con un 100% de éxito y una media de 201 pasos. El resto del repositorio conserva el historial completo de runs (Q-table, DQN y PPO) con sus manifiestos, incluyendo intentos fallidos y pesos reentrenados. Esto lo convierte en un caso de estudio útil sobre trazabilidad, versionado de artefactos y selección de modelos en MLOps, más que en un componente listo para producción.

La relevancia actual del artefacto es metodológica: ilustra cómo registrar semillas, configuraciones, suites de evaluación y hashes SHA-256 de pesos, y cómo separar familias de entornos no intercambiables. El tamaño del repositorio es de 0,1 GB y la licencia no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Políticas de aprendizaje por refuerzo (PPO con red de política, Q-learning tabular, DQN) sobre entornos Gymnasium |
| Parametros totales | No disponible (depende de la red de la política; no se documenta el número) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; el estado es la observación del entorno) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | es (según metadatos del repositorio) |
| Licencia | No disponible |
| Formato de pesos | Pesos de Stable-Baselines3 con `manifest.json` asociado (no se especifica extensión concreta) |

## Arquitectura y entrenamiento

El proyecto agrupa tres familias de entornos y algoritmos que no son intercambiables. La familia `drone-rescue-v3` usa PPO con un espacio de acciones de 11 velocidades con estabilizador; `drone-rescue-v2` usa 7 acciones de fuerza; y `grid-drone-v1` modela una misión distinta de cuadrícula de A a B. Sobre estas familias se entrenaron políticas con Q-learning tabular, DQN y PPO. El modelo publicado pertenece a `drone-rescue-v3`, run `9a188153b37a4b62940445045e0a9914`, y fue seleccionado por el pipeline de Airflow con criterios definidos antes de observar resultados.

El historial de runs documenta semillas (11, 23, 37, 7001), número de pasos, tasa de éxito y hash SHA-256 de cada paquete de pesos. Los runs `exp-001` a `exp-004` perdieron sus pesos originales y se reentrenaron con el mismo código (salvo `exp-003`, que se conserva), de modo que el comportamiento coincide con el informe pero los bytes no. No se documentan volúmenes de datos de entrenamiento, composición de trayectorias ni uso de RLHF/DPO, ya que no aplica a este tipo de modelos.

## Capacidades

- Control de política para navegación de un dron en un entorno simulado 2D/3D con obstáculos (columnas).
- Gestión de recursos limitados: administración de batería durante la misión.
- Ejecución de una secuencia de acciones de varios pasos: despegue, transporte, liberación lenta del suministro y retorno a la base.
- Generalización dentro del nivel N1 de la familia `drone-rescue-v3` (100% de éxito en la suite de evaluación registrada).
- Soporte de evaluación reproducible mediante manifiestos con semilla, configuración y SHA-256.
- No dispone de tool calling, function calling, capacidades de agente basadas en lenguaje, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües no aplicables; el metadato de idioma `es` es administrativo.

## Casos de uso

- Simulación de reparto con dron en entornos de investigación: el modelo N1 sirve como política de referencia para comparar algoritmos (Q-table, DQN, PPO) bajo una misma suite de evaluación y semillas fijas.
- Docencia de MLOps y RL: el repositorio conserva runs fallidos, pesos reentrenados y manifiestos, lo que permite enseñar trazabilidad de artefactos, versionado de experimentos y selección de modelos con criterios predefinidos.
- Pruebas de pipelines de CI/CD para RL: los scripts de verificación (`scripts/verify_packages.py`) y los hashes SHA-256 permiten integrar comprobaciones de integridad en un pipeline de despliegue.
- Benchmarking interno de algoritmos: los resultados de éxito y pasos medios por semilla permiten medir la varianza entre semillas (por ejemplo, en `ppo-v3b-n1` solo la semilla 11 alcanza el 100%).
- Base para extensiones de dificultad: el modelo N1 puede servir como punto de partida para currículos de entrenamiento hacia N2 y N3, que no tienen modelo publicado por no alcanzar el mínimo exigido.
- Reproducción de experimentos académicos: la combinación de manifiestos, semillas y código en GitHub permite replicar los runs registrados y auditar las diferencias entre bytes y comportamiento.

## Benchmarks y rendimiento

Los datos disponibles son métricas internas del proyecto (tasa de éxito y pasos medios), no benchmarks estándar de RL.

| Modelo / run | Nivel | Algoritmo | Éxito | Pasos medios |
|---|---|---|---:|---:|
| `ppo-v3b-n1` (semilla 11), publicado | N1 | PPO | 100% | 201 |
| `ppo-v3b-n1` (semilla 23) | N1 | PPO | 0% | 800 |
| `ppo-v3b-n1` (semilla 37) | N1 | PPO | 0% | 488 |
| `ppo-v3b-n2` (semilla 23) | N2 | PPO | 0% | 153 |
| `ppo-v3b-n3` (semilla 11) | N3 | PPO | 0% | 724 |
| `grid-dqn-memoria` | Grid | DQN | 99% | 51 |
| `grid-qtable-5col` | Grid | Q-table | 100% | 40 |

No se han publicado resultados de benchmarks estándar (por ejemplo, en entornos de referencia de RL) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0,1 GB y las políticas de RL de este tipo suelen ser ligeras, pero no se documenta el número de parámetros ni la VRAM necesaria.
- GPU recomendadas: no disponibles; el entrenamiento con Stable-Baselines3 puede ejecutarse en CPU, pero no se especifica hardware en la documentación.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada.
- Opciones de despliegue: inferencia mediante el entorno y los adaptadores del repositorio de GitHub (`agents/ppo.py`, `agents/qlearning.py`, `agents/grid/`), junto con la descarga del snapshot vía `huggingface_hub`. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (políticas de RL para reparto con dron) con parámetros, contexto, rendimiento y licencia documentados.

## Limitaciones y advertencias

- Solo hay un modelo publicado (N1); N2 y N3 no tienen modelo porque ningún candidato alcanzó el mínimo exigido por el pipeline.
- La tasa de éxito del 100% corresponde a una única semilla (11); las semillas 23 y 37 del mismo experimento no superan el umbral, lo que indica alta varianza y baja robustez.
- Las familias `drone-rescue-v3`, `drone-rescue-v2` y `grid-drone-v1` no son intercambiables; cargar pesos con adaptadores de otra familia produce comportamiento inválido.
- Los pesos originales de `exp-001` a `exp-004` se perdieron y se reentrenaron; los bytes no coinciden con los originales (salvo `exp-003`), aunque el comportamiento declarado sí.
- La licencia no está declarada, por lo que no se puede confirmar el uso comercial.
- No hay información sobre sesgos, alucinación (no aplica a un modelo de RL) ni limitaciones idiomáticas más allá del metadato `es`.
- El modelo está entrenado para un entorno simulado concreto; no hay evidencia de transferencia a un dron físico ni a entornos reales.
- Para producción sería necesario validar la integridad de cada archivo con el SHA-256 de su manifiesto y fijar la revisión `modelos-20261111`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Mari4Z/drone-rescue
- Código, entorno y pipeline: https://github.com/Mari4Z/drone_rescue
