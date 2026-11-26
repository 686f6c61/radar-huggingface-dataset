# dimblank/q-learning-taxi-v4

## Resumen

`dimblank/q-learning-taxi-v4` es un agente de aprendizaje por refuerzo entrenado con el algoritmo Q-Learning tabular para resolver el entorno `Taxi-v3` de Gymnasium. Lo publica el usuario `dimblank` en Hugging Face como un artefacto de tipo *reinforcement-learning*, con un único fichero de pesos (`q-learning.pkl`) que contiene la tabla Q y los metadatos del entorno. No es un modelo de lenguaje ni una red neuronal profunda: es una implementación clásica de Q-Learning con una tabla de estados-acciones, pensada para el entorno discreto de 500 estados y 6 acciones que define `Taxi-v3`.

El modelo no resuelve ningún problema de generación de texto, código o visión. Su relevancia es didáctica y de referencia: sirve como ejemplo mínimo reproducible de un agente Q-Learning entrenado y empaquetado en el formato de Hugging Face, y como punto de partida para comparar variantes de hiperparámetros sobre el mismo entorno. El autor declara un `mean_reward` de 7,56 ± 2,71 en la model card, un valor bajo para `Taxi-v3` (el óptimo ronda 8-9 de media con políticas bien entrenadas), lo que sugiere un entrenamiento parcial o una política subóptima.

El repositorio tiene un tamaño de 0,0 GB (prácticamente vacío salvo el `.pkl`), sin descargas ni *likes*, licencia no especificada e idiomas no aplicables. La fecha de creación indicada (2026-11-26) es futura respecto a la redacción habitual de fichas, lo que conviene tener en cuenta al citar el artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q estado-acción, sin red neuronal) |
| Parametros totales | no disponible (tabla Q de 500 estados × 6 acciones en `Taxi-v3`; el autor no declara dimensiones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de un solo paso con observación discreta) |
| Tipos de cuantizacion | no disponible (pesos en `.pkl`, sin cuantización) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.pkl` (pickle de Python, fichero `q-learning.pkl`) |

## Arquitectura y entrenamiento

La arquitectura es Q-Learning tabular clásico: una tabla Q indexada por el estado discreto del entorno `Taxi-v3` (500 estados posibles) y las 6 acciones del espacio de acciones (moverse norte, sur, este, oeste, recoger pasajero y dejar pasajero). La actualización sigue la regla de Bellman `Q(s,a) ← Q(s,a) + α [r + γ max_a' Q(s',a') − Q(s,a)]`, con una política de exploración ε-greedy durante el entrenamiento. No hay función de aproximación, ni red neuronal, ni atención, ni mecanismo de decodificación.

El autor no documenta en la model card el número de episodios, la tasa de aprendizaje α, el factor de descuento γ, la política de decaimiento de ε ni la semilla utilizada. Tampoco indica si el entorno se configuró con `is_slippery=True` (por defecto en `Taxi-v3`) o `False`; la propia model card advierte de que puede ser necesario añadir atributos como `is_slippery=False` al reconstruir el entorno, lo que introduce ambigüedad sobre la correspondencia exacta entre el entorno de entrenamiento y el de evaluación. No se declara ningún proceso de RLHF, DPO ni ajuste fino adicional.

## Capacidades

- Resolución del entorno `Taxi-v3` de Gymnasium: recoger y dejar pasajeros en las cuatro ubicaciones del mapa con la política aprendida.
- Política greedy determinista una vez cargada la tabla Q (selección de `argmax_a Q(s,a)`).
- Serialización y carga mediante `load_from_hub(repo_id="dimblank/q-learning-taxi-v4", filename="q-learning.pkl")`.
- Reutilización como referencia para comparar variantes de Q-Learning sobre el mismo entorno.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento, código, matemáticas, visión, audio ni capacidades multilingües.
- No dispone de *thinking mode* ni de ningún modo especial de inferencia.

## Casos de uso

- Docencia de aprendizaje por refuerzo: cargar el `.pkl` y reproducir la política sobre `Taxi-v3` para ilustrar Q-Learning tabular en un curso introductorio, con un entorno de 500 estados que se resuelve en segundos.
- Baseline de comparación: usar el `mean_reward` declarado (7,56 ± 2,71) como referencia frente a variantes propias con distintos valores de α, γ y ε en el mismo entorno.
- Pruebas de integración de `stable-baselines3` / `huggingface_sb3`: validar el flujo `load_from_hub` → `gym.make` → evaluación en un pipeline de CI sin depender de pesos grandes.
- Experimentos de sensibilidad a `is_slippery`: comparar el rendimiento del agente con y sin estocasticidad del entorno para estudiar la robustez de la política aprendida.
- Reproducción de artefactos: verificar que un fichero pickle de tabla Q se carga y evalúa correctamente en distintas versiones de Gymnasium, útil para detectar problemas de compatibilidad de entornos.
- Material de ejemplo en tutoriales de Hugging Face Hub: demostrar cómo se publica un agente de RL no neuronal con `model-index` y métricas declaradas.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`verified: false`):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7,56 ± 2,71 |

No se han publicado otros resultados de benchmarks en la información disponible. No hay comparación con políticas óptimas ni con otras variantes de Q-Learning en la model card.

## Requisitos de hardware

- VRAM: no aplica; la tabla Q es un objeto Python de tamaño despreciable (el repo ocupa 0,0 GB).
- GPU: no necesaria; la inferencia es una búsqueda en tabla sobre CPU.
- Cabe en cualquier equipo, incluidos portátiles sin GPU y entornos tipo Raspberry Pi.
- Despliegue: carga directa con `pickle` / `load_from_hub` y `gym.make("Taxi-v3")`; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser una consulta a tabla, la latencia por paso es del orden de microsegundos en CPU, pero el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dimblank/q-learning-taxi-v4 | Q-Learning tabular | Taxi-v3 | no disponible | no aplica | no disponible | Hugging Face |
| Política óptima de Taxi-v3 (referencia teórica) | Programación dinámica / value iteration | Taxi-v3 | tabla 500×6 | no aplica | no aplica | no es un artefacto publicado |
| Agentes DQN sobre Taxi-v3 | Deep Q-Network | Taxi-v3 | red pequeña (no disponible) | no aplica | variable | múltiples repositorios, no disponibles en la información proporcionada |

No se dispone de datos de rendimiento de las alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- El `mean_reward` declarado (7,56 ± 2,71) es bajo para `Taxi-v3`, lo que indica una política subóptima o un entrenamiento incompleto; no debe presentarse como agente resuelto.
- La métrica está marcada como `verified: false`: no ha sido validada por el Hub ni por un tercero.
- Ambigüedad sobre `is_slippery`: la model card sugiere añadir `is_slippery=False`, pero no confirma la configuración usada en el entrenamiento; los resultados pueden no ser reproducibles con la configuración por defecto.
- Licencia no especificada: no hay autorización explícita para uso comercial ni para redistribución; conviene contactar con el autor antes de reutilizarlo en producción.
- Los ficheros `.pkl` son inseguros por diseño (ejecución arbitraria de código al deserializar); solo deben cargarse desde fuentes de confianza.
- Sin idiomas, sin capacidades de lenguaje y sin aplicaciones fuera del entorno `Taxi-v3`; no es extrapolable a otros problemas de RL sin reentrenamiento.
- Sin documentación de hiperparámetros, semilla ni número de episodios: la reproducibilidad del entrenamiento no está garantizada.
- Fecha de creación declarada en 2026, posterior a la mayoría de referencias del ecosistema; verificar la vigencia del artefacto antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimblank/q-learning-taxi-v4
- Entorno `Taxi-v3` (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentación de `huggingface_sb3` (carga de agentes RL): https://github.com/huggingface/huggingface_sb3
- Documentación de `stable-baselines3`: https://stable-baselines3.readthedocs.io/
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
