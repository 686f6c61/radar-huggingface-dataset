# leegoheun/connectailab-rl-duking-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el autor leegoheun en el marco de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un modelo de decisión para el robot simulado LINK-01: recibe una descripción textual del estado del robot (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa) y devuelve una única letra que corresponde a la acción de locomoción para los próximos 0,5 segundos. El problema que resuelve es convertir una política de control entrenada con PPO en un formato que un modelo de lenguaje pueda imitar y refinar mediante aprendizaje por refuerzo.

La arquitectura subyacente es la del transformer denso de Qwen3.5-0.8B, con aproximadamente 0,8 mil millones de parámetros, sobre el que se aplica un adaptador LoRA entrenado en dos fases: primero con aprendizaje supervisado (destilación de la política PPO "profesor") y después con refuerzo (PPO con penalización KL) para reordenar las preferencias entre opciones. El resultado es un modelo de 0,8B que ejecuta una tarea de clasificación de 5 acciones (obs21-act5) con una ventana de contexto no documentada de forma explícita.

Su relevancia es acotada pero instructiva: demuestra un pipeline completo de destilación de políticas de refuerzo a modelos de lenguaje pequeños, con métricas de éxito en simulación (100% de éxito en 20 episodios con la variante supervisada) y una reducción del tiempo medio de episodio de 13,7 a 11,2 segundos con la variante de refuerzo. Es un modelo de investigación y educación, no un componente listo para producción robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | ~0,8 mil millones (modelo base); tamano del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; cuantizacion del base no documentada) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer denso de aproximadamente 0,8B parámetros, y añade un adaptador LoRA entrenado específicamente para la tarea `goto_target` del robot LINK-01. La tarea se formaliza con el contrato `link01-decision/goto_target/obs21-act5/walker51-14/v1`: observación de 21 dimensiones y 5 acciones discretas de locomoción. El entrenamiento se organiza en cinco etapas según la model card: (1) entrenamiento de la política PPO en el simulador web (cursos `random`, `0453cf50`, `caeef4c2`, con un 85% de éxito en la prueba oficial); (2) generación de un conjunto de problemas textuales muestreando el estado cada 0,5 segundos durante la ejecución de la política, con la respuesta del profesor como etiqueta y un 20% de ejemplos con desviaciones deliberadas; (3) aprendizaje supervisado del modelo de lenguaje sobre esas etiquetas mediante LoRA; (4) refinamiento con PPO usando recompensas contrafactuales por opción (se ejecuta la opción elegida y el resto lo completa el profesor), con anclaje KL al modelo supervisado; y (5) evaluación colocando el modelo en el puesto de decisión del robot.

Los conjuntos de datos tienen 596 ejemplos de entrenamiento, 121 de validación y 202 de prueba. La tasa de acuerdo entre el texto y la política original (techo de acierto) es del 99%. La evaluación de la locomoción se realiza con una aproximación 2D basada en una tabla de velocidades medidas por comando, no con el simulador MuJoCo completo, por lo que los resultados de éxito y tiempo pueden diferir de la simulación real. No se documentan innovaciones arquitectónicas adicionales más allá del uso de LoRA y PPO con KL.

## Capacidades

- Clasificación de decisión discreta: dado un estado textual del robot, devuelve exactamente una letra entre las cinco opciones de locomoción.
- Salida restringida: el prompt de sistema fuerza a responder solo con la letra, sin explicación.
- Robustez ante datos no confiables: el prompt de sistema indica tratar el contenido del campo `state` como datos, no como instrucciones (defensa básica frente a inyección de prompt).
- Ejecución de una política de control destilada: reproduce el comportamiento de una política PPO entrenada en el simulador.
- Refinamiento por refuerzo: la variante RL mejora el tiempo de episodio respecto a la supervisada (11,2 s frente a 14,2 s) manteniendo el 100% de éxito en la evaluación.
- Capacidades multilingües: limitadas al coreano según la model card; no se documenta soporte de otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Destilación de políticas de control en modelos de lenguaje: usar el pipeline (PPO en simulador, generación de problemas textuales, LoRA supervisado, PPO con KL) para convertir políticas de refuerzo existentes en modelos de lenguaje pequeños que puedan integrarse en pilas basadas en texto.
- Investigación en aprendizaje por refuerzo con modelos de lenguaje: el modelo sirve como banco de pruebas para estudiar recompensas contrafactuales por opción y anclaje KL en tareas de decisión discreta.
- Educación en robótica simulada: el notebook de Colab y el repositorio CONNECT TYCOON permiten reproducir el entrenamiento del robot LINK-01 en el simulador web, con el modelo como ejemplo de política destilada.
- Evaluación de robustez de políticas destiladas: comparar la tasa de acuerdo con el profesor (68,3% en supervisado, 62,9% en RL) frente al éxito real en episodios (100% en ambos) para estudiar la relación entre precisión de imitación y rendimiento de la tarea.
- Prototipado de agentes de decisión de bajo coste: al ser un adaptador sobre un modelo de 0,8B, puede ejecutarse en hardware modesto para experimentar con bucles de decisión texto-acción en entornos simulados.
- Generación de datos sintéticos de decisión: usar el modelo para producir trayectorias etiquetadas adicionales en el formato `obs21-act5` que alimenten otros entrenamientos o comparaciones.

## Benchmarks y rendimiento

Resultados publicados en la model card. La evaluación de "misma pista 20 episodios" usa una aproximación 2D de la locomoción, no el simulador MuJoCo completo.

| Modelo | Acierto en test (misma respuesta que el profesor) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Profesor (PPO) | 100,0% | 100% | 0% | 13,7 s |
| Antes del entrenamiento | 32,7% | 0% | 80% | — |
| Supervisado (LoRA) | 68,3% | 100% | 0% | 14,2 s |
| Refuerzo (PPO + KL) | 62,9% | 100% | 0% | 11,2 s |

No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo base de ~0,8B en precisión completa se sitúa en torno a 2-4 GB, y en cuantización de 4 bits en torno a 1 GB, aunque estas cifras son estimaciones generales y no están documentadas por el autor.
- GPU recomendadas: no documentadas. Por tamaño, cualquier GPU consumer con al menos 8 GB (RTX 3060, RTX 4060, RTX 4090) debería poder cargar el modelo base y el adaptador.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPU con 8 GB o más, dado el tamaño del modelo base.
- Opciones de despliegue: la model card solo documenta el uso con `transformers` + `peft` (`PeftModel.from_pretrained`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un adaptador LoRA específico de tarea sobre Qwen3.5-0.8B, sin alternativas documentadas de la misma categoría (decisión robótica destilada en modelos de lenguaje).

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-duking-v1-link01 | ~0,8B (base) + LoRA | No disponible | Decisión `goto_target` (5 acciones) | Apache-2.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo de investigación y educación: la propia model card advierte que es un modelo para simulación y que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- Evaluación aproximada: la métrica de éxito en 20 episodios usa una tabla de velocidades 2D en lugar del simulador MuJoCo completo, por lo que los resultados pueden diferir de la simulación real.
- Tarea única y cerrada: solo resuelve `goto_target` con 5 acciones discretas; no es un modelo de lenguaje de propósito general.
- Idioma: solo coreano según la model card; el prompt de sistema está en inglés, lo que puede introducir inconsistencias no documentadas.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede devolver letras fuera del conjunto de opciones o explicaciones no solicitadas; el prompt de sistema mitiga pero no garantiza el formato.
- Degradación en RL: la variante de refuerzo reduce el acierto frente al profesor (62,9% frente a 68,3% del supervisado), lo que sugiere que la recompensa contrafactual puede alejar al modelo de la política original en algunos estados.
- Sesgos: no documentados; al entrenarse sobre trayectorias de un simulador concreto, puede heredar sesgos de la política PPO y de los cursos de entrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero la licencia del modelo base Qwen3.5-0.8B debe verificarse por separado.
- Sin soporte documentado de tool calling, agentes multi-paso ni cuantización; el despliegue en producción requeriría trabajo adicional no cubierto por la documentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leegoheun/connectailab-rl-duking-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de refuerzo en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
