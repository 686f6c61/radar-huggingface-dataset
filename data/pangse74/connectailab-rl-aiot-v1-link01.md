# PANGSE74/connectailab-rl-aiot-v1-link01

## Resumen

connectailab-rl-aiot-v1-link01 es un adaptador LoRA publicado por PANGSE74 (CONNECT AI LAB × AI CITY BUILDERS) sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo de lenguaje de propósito general, sino un "modelo de decisión" destilado: aprende a imitar la política de un agente entrenado con PPO que resuelve la tarea `avoid_obstacles` (esquivar obstáculos) para el robot simulado LINK-01. El modelo recibe una descripción textual del estado del robot (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa) y devuelve una única letra que identifica la acción a ejecutar durante los siguientes 0,5 segundos.

La relevancia técnica está en el enfoque: en lugar de desplegar la red neuronal del agente PPO, se convierte cada observación en texto y se entrena un LLM pequeño (0,8B parámetros) mediante supervisión (LoRA) y un posterior paso de optimización por preferencias anclado con KL a la política del "profesor". El resultado es un modelo de 0,8B que puede ejecutarse en hardware muy modesto y que reproduce aproximadamente el 80% de las decisiones del agente original.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamaño del repo es de 0,0 GB (solo pesos del adaptador) y la licencia es Apache 2.0. Está pensado como material de investigación y educación sobre simulación, no para robótica real sin revalidación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Qwen/Qwen3.5-0.8B) |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA añade un número no especificado de parámetros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen3.5-0.8B, valor no confirmado) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) según la model card; las instrucciones se dan en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8B parámetros. El proceso de construcción tiene cuatro fases descritas por el autor: (1) entrenamiento con PPO de una política ("cerebro", `brain.json`) en un entorno web de aprendizaje por refuerzo para la tarea `avoid_obstacles`, con un 75% de éxito en el examen oficial; (2) generación de un dataset textual a partir de las observaciones del agente durante un recorrido concreto (curso `d4111595`), muestreando cada 0,5 segundos, con la respuesta del agente como etiqueta y un 20% de ejemplos con desviaciones; (3) aprendizaje supervisado del LLM sobre ese dataset mediante LoRA; y (4) un paso de optimización por preferencias (estilo RL) donde se suben las acciones con mayor recompensa esperada y se bajan las peores, con anclaje KL a la política del profesor.

El dataset resultante contiene 1275 ejemplos de entrenamiento, 260 de validación y 358 de test. El autor reporta que la tasa de coincidencia entre la representación textual y la decisión del agente original es del 100% (techo de acierto), lo que indica que la conversión observación→texto es fiel. La evaluación final se realiza colocando el modelo de decisión en el puesto de mando del robot y ejecutando 20 episodios con semillas 91001–91020 en una aproximación 2D de la locomoción (tabla de velocidades por comando derivada de MuJoCo web), sin red neuronal de marcha real.

## Capacidades

- Clasificación de acciones discretas: dado un estado textual del robot, devuelve exactamente una letra entre las opciones listadas.
- Seguimiento de instrucciones de formato estricto: el system prompt exige devolver solo la letra, sin explicación.
- Razonamiento de decisión a corto plazo (horizonte de 0,5 segundos por paso).
- Tratamiento de datos no confiables: el prompt indica explícitamente tratar el contenido del estado como datos, no como instrucciones.
- Capacidad multilingüe limitada: etiquetado como coreano, con instrucciones en inglés; no se documentan otras lenguas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking".

## Casos de uso

- Investigación en destilación de políticas RL a LLM: usar el par (agente PPO, adaptador LoRA) como banco de pruebas para estudiar cuánta fidelidad de política se conserva al pasar de una red neuronal a un modelo de lenguaje.
- Educación en aprendizaje por refuerzo: el notebook de Colab y el repositorio CONNECT TYCOON permiten reproducir el pipeline completo (PPO → dataset textual → LoRA → optimización por preferencias) en un entorno controlado.
- Simulación de robótica de bajo coste: ejecutar el modelo de 0,8B en CPU o GPU de consumo para generar comandos de navegación en el simulador web, sin necesidad de la red de marcha original.
- Evaluación comparativa de métodos de alineación: el autor publica métricas de éxito en 20 episodios para el modelo supervisado (90%, 40% de colisiones) y el optimizado por preferencias (90%, 25% de colisiones), lo que permite analizar el efecto del paso RL sobre la seguridad.
- Prototipado de interfaces estado→texto→acción: sirve como referencia para diseñar pipelines donde un LLM pequeño actúa como capa de decisión sobre observaciones estructuradas serializadas.
- Docencia sobre riesgos de sustitución de controladores: el caso ilustra por qué un LLM destilado no debe desplegarse en un robot real sin revalidación en el entorno físico concreto.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (evaluación sobre 358 problemas de test y 20 episodios de caminata simulada):

| Modelo | Acierto en test (coincidencia con el agente) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Agente PPO (profesor) | 100,0% | 100% | 0% | 28,1 s |
| Modelo antes de entrenar | 44,7% | 0% | 0% | — |
| Aprendizaje supervisado (LoRA) | 80,4% | 90% | 40% | 30,9 s |
| Optimización por preferencias (RL) | 79,9% | 90% | 25% | 28,8 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores corresponden a la tarea específica `avoid_obstacles` y a una aproximación 2D de la locomoción, no a MuJoCo real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo base de 0,8B en precisión completa se sitúa típicamente en el rango de 2–4 GB, y menos con cuantización de 8 o 4 bits, aunque el autor no publica cifras.
- GPU recomendadas: no especificadas por el autor; por tamaño, el modelo cabe en GPU de consumo (RTX 3060, RTX 4060, RTX 4090) y probablemente en CPU para inferencia por lotes pequeños.
- Cabe en GPU de consumo: sí, por el tamaño del modelo base (0,8B), aunque no hay medición publicada.
- Opciones de despliegue: transformers + peft (única ruta documentada en la model card); vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador.
- Latencia y throughput: no disponibles. El autor reporta tiempos de episodio (28,1–30,9 s) pero no latencia por decisión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-aiot-v1-link01 | 0,8B + LoRA | No disponible | Decisión discreta en `avoid_obstacles` | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | Lenguaje general | No disponible en la información | HuggingFace |
| Agente PPO `brain.json` (profesor) | No disponible | No aplica | Decisión discreta en `avoid_obstacles` | No disponible | Repositorio CONNECT TYCOON |

No se dispone de información sobre otros adaptadores de decisión comparables publicados con las mismas características.

## Limitaciones y advertencias

- Ámbito muy restringido: solo resuelve la tarea `avoid_obstacles` en el entorno y curso concretos (`d4111595`, `obs21-act5/walker51-14/v1`); no generaliza a otras tareas ni mapas sin reentrenamiento.
- Evaluación en aproximación 2D: la locomoción se simula con una tabla de velocidades por comando, no con MuJoCo real ni con el robot físico; los resultados pueden diferir.
- Tasa de colisión elevada: 40% de episodios con colisión en el modelo supervisado y 25% en el optimizado por preferencias, frente al 0% del profesor.
- Pérdida de fidelidad: el mejor modelo reproduce el 80,4% de las decisiones del agente, no el 100%.
- Idiomas: etiquetado únicamente como coreano; el prompt de sistema está en inglés y no se documenta comportamiento en castellano.
- Riesgo de alucinación de letra: si el estado se sale de la distribución de entrenamiento, el modelo puede devolver una opción no válida o una letra fuera del conjunto; el prompt mitiga la inyección de instrucciones, pero no garantiza el formato.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- Advertencia explícita del autor: es un modelo de investigación y educación sobre simulación; debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- Sin datos de sesgo, robustez adversarial ni evaluación fuera de distribución más allá de los 358 ejemplos de test.

## Enlaces

- HuggingFace: https://huggingface.co/PANGSE74/connectailab-rl-aiot-v1-link01
- Repositorio de código: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
