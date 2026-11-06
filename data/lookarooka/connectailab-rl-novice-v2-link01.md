# lookarooka/connectailab-rl-novice-v2-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario lookarooka en el marco del proyecto CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje generalista: es una política de decisión entrenada para el robot simulado LINK-01, que debe elegir una de cinco acciones de caminata cada 0,5 segundos a partir de una descripción textual de su estado (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa). El modelo devuelve una única letra correspondiente a la opción seleccionada.

El pipeline combina aprendizaje por refuerzo (PPO) en un simulador web de MuJoCo para generar un "cerebro" maestro, destilación supervisada de ese cerebro en el modelo de lenguaje mediante LoRA y un ajuste posterior con RL (con restricción KL) para afinar la preferencia entre opciones. El resultado es un modelo de 0,8 mil millones de parámetros que actúa como controlador de bajo nivel en un entorno de investigación y educación, no como un LLM de propósito general.

Su relevancia radica en la demostración de que un modelo de lenguaje pequeño puede sustituir a una política neuronal especializada en una tarea de decisión secuencial concreta, manteniendo un 80% de éxito en 20 episodios de evaluación frente al 100% del cerebro profesor. La licencia Apache 2.0 y el reducido tamaño lo hacen accesible para experimentación en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones (modelo base); adaptador LoRA de tamaño no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. Sobre él se aplica un adaptador LoRA entrenado en tres fases. Primero, un cerebro PPO se entrena en el simulador web (tarea `follow_route`, curso `random`, observación de 16 dimensiones y 5 acciones, convención `link01-decision/follow_route/obs16-act5/walker51-14/v1`) alcanzando un 85% en el examen oficial. Segundo, se genera un conjunto de datos de 1066 ejemplos de entrenamiento, 290 de validación y 299 de test, convirtiendo cada observación del cerebro en un problema textual con su respuesta correcta; el 20% de los ejemplos incluye desviaciones deliberadas del camino. Tercero, se realiza un ajuste supervisado con LoRA y posteriormente un ajuste por RL con anclaje KL, donde cada opción se recompensa según el retorno que habría obtenido el cerebro profesor al continuar desde esa elección.

La innovación principal es el uso de un LLM como política de decisión discreta en un bucle de control de robótica simbólica, con el estado del robot serializado en texto y la acción codificada como una letra. El techo de rendimiento (acuerdo máximo con el cerebro profesor) se sitúa en el 99%, lo que indica que la representación textual preserva casi toda la información relevante de la observación original.

## Capacidades

- Selección de una de cinco acciones discretas de caminata (`follow_route`) a partir de una descripción textual del estado del robot.
- Formato de salida restringido: devuelve únicamente la letra de la opción elegida, sin explicación.
- Procesamiento de estado estructurado con instrucción de sistema que trata el texto del estado como datos, no como instrucciones.
- Entrenamiento específico para la tarea `follow_route` con observaciones de 16 dimensiones y 5 acciones.
- No soporta tool calling, function calling ni razonamiento multi-paso general.
- No dispone de capacidades de visión, audio ni modo de pensamiento extendido.
- Capacidad multilingüe limitada al coreano en el contexto de la tarea; no se documenta soporte para otros idiomas.
- No es un agente autónomo: requiere un bucle externo que construya la observación y ejecute la acción elegida.

## Casos de uso

- **Control de robot simulado en investigación educativa**: el modelo se integra en el bucle de decisión del robot LINK-01 en el simulador web, sustituyendo al cerebro PPO original para estudiar la viabilidad de políticas basadas en lenguaje en tareas de navegación.
- **Docencia de refuerzo y destilación**: sirve como ejemplo práctico de pipeline PPO → destilación supervisada → RL con KL, reproducible mediante el notebook de Colab incluido en el repositorio.
- **Evaluación de representaciones textuales de estado**: permite medir cuánta información de una observación de 16 dimensiones se conserva al serializarla en texto, comparando la tasa de acuerdo con el profesor (99% de techo).
- **Prototipado rápido de políticas discretas**: al ser un adaptador LoRA sobre un modelo de 0,8B, se puede desplegar en hardware modesto para experimentar con variantes de la tarea sin reentrenar desde cero.
- **Generación de datos sintéticos de decisión**: el modelo puede emplearse para producir trayectorias alternativas en el simulador y analizar la robustez del cerebro profesor frente a desviaciones.
- **Banco de pruebas de instrucciones de sistema**: su formato de salida estricto (una letra) lo hace útil para validar técnicas de prompt engineering orientadas a respuestas deterministas.
- **Investigación sobre alineación de políticas con RL**: el ajuste con recompensa basada en retorno del profesor y anclaje KL constituye un caso de estudio de cómo un LLM puede refinarse hacia una política concreta.

## Benchmarks y rendimiento

| Modelo | Precisión en test (acuerdo con el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio de éxito |
|---|---|---|---|---|
| Cerebro profesor (PPO) | 100,0% | 100% | 0% | 20,7 s |
| Modelo sin entrenar | 32,1% | 0% | 0% | — |
| Aprendizaje supervisado (LoRA) | 78,6% | 80% | 0% | 21,7 s |
| Aprendizaje por refuerzo (LoRA + RL) | 76,9% | 80% | 0% | 21,3 s |

Los datos de evaluación corresponden a la tabla publicada por el autor. La métrica de caminata se obtuvo con una aproximación 2D basada en una tabla de velocidades por comando, no con el simulador MuJoCo completo, por lo que los resultados pueden diferir ligeramente de la simulación web.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 0,8B en precisión FP16 requiere aproximadamente 1,6 GB solo para los pesos, más el adaptador LoRA y el overhead de activaciones.
- GPU recomendadas: no disponible. Por tamaño, el modelo es apto para GPU de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 4-6 GB de VRAM, aunque no se documenta oficialmente.
- Opciones de despliegue: transformers con peft (método documentado por el autor); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. El modelo debe responder en menos de 0,5 segundos por paso para igualar la cadencia del cerebro profesor, pero no se publican mediciones de latencia real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-novice-v2-link01 | 0,8B (base) + LoRA | no disponible | Decisión discreta `follow_route` | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B | 0,8B | no disponible | LLM generalista | no disponible en la información | Hugging Face |
| Cerebro PPO (profesor) | no disponible | no aplica | Decisión discreta `follow_route` | no disponible | Solo dentro del proyecto CONNECT TYCOON |

No se dispone de información sobre otros adaptadores LoRA comparables en la misma tarea ni sobre modelos de decisión de tamaño similar con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de investigación y educación sobre simulador; el autor advierte explícitamente de que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- La evaluación de caminata emplea una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo, por lo que los porcentajes de éxito pueden no trasladarse a la simulación real.
- El ajuste por RL no supera al aprendizaje supervisado en precisión de test (76,9% frente a 78,6%) ni en éxito (ambos 80%), lo que sugiere un beneficio marginal del RL en esta configuración.
- El modelo solo maneja la tarea `follow_route` con 5 acciones y observaciones de 16 dimensiones; no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Idioma limitado al coreano en el contexto de la tarea; no se documenta robustez en otros idiomas.
- Riesgo de alucinación en la elección de acción: el modelo puede devolver una letra no válida o una opción subóptima, especialmente en estados poco representados en el conjunto de entrenamiento (1066 ejemplos).
- El formato de salida exige una instrucción de sistema estricta; sin ella, el modelo puede generar texto explicativo en lugar de una letra.
- No se documentan sesgos específicos, pero al derivar de un LLM generalista podría heredar sesgos del modelo base Qwen3.5-0.8B.
- La licencia Apache 2.0 permite uso comercial, pero la naturaleza experimental del modelo y la advertencia del autor desaconsejan su uso en producción sin validación adicional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/lookarooka/connectailab-rl-novice-v2-link01)
- [Repositorio CONNECT TYCOON (código de entrenamiento)](https://github.com/wonseokjung/connect-tycoon)
- [Notebook de Colab para entrenamiento](https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb)
- [Canal de YouTube CONNECT AI LAB](https://www.youtube.com/@CONNECT-AI-LAB)
- [AI CITY BUILDERS](https://www.aicitybuilders.com)
- [Curso de refuerzo en AI CITY BUILDERS](https://www.aicitybuilders.com/robot)
- [Simulador web de aprendizaje del robot](https://www.ezerai.xyz/robot-lab/world/)
- [Modelo base Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
