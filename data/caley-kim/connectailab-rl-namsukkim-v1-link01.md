# caley-kim/connectailab-rl-namsukkim-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por caley-kim en el marco de la colaboración entre CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un modelo de decisión específico para robótica: recibe una descripción textual del estado de un robot LINK-01 (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa) y devuelve una única letra que identifica la acción de locomoción a ejecutar durante los siguientes 0,5 segundos. La tarea concreta para la que se ha entrenado es `avoid_obstacles` (evasión de obstáculos).

El modelo se ha construido mediante un pipeline de destilación desde una política PPO entrenada en un entorno web de aprendizaje por refuerzo (el "cerebro" o `brain.json`), seguida de un ajuste supervisado con LoRA y un refinamiento posterior con RL (etiquetado por recompensa por opción, con anclaje KL). El resultado es un modelo de 0,8 mil millones de parámetros que traduce observaciones de robot a decisiones discretas en formato de texto, lo que permite integrar la política en un stack basado en transformers en lugar de requerir un runtime de RL específico.

Su relevancia es acotada pero interesante como caso de estudio: demuestra cómo una política de RL puede destilarse en un modelo de lenguaje pequeño para su despliegue en pipelines estándar de Hugging Face, y cómo el refinamiento con RL puede mejorar ligeramente la latencia de decisión (23,9 s frente a 24,7 s por episodio) a costa de una ligera pérdida de fidelidad respecto a la política docente. Es un modelo de investigación y educación, no un componente listo para producción en robótica real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Qwen3.5-0.8B) |
| Parametros totales | no disponible (modelo base de 0,8B; el adaptador añade un número no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA montado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador se entrena en cuatro fases documentadas por el autor: (1) entrenamiento de una política PPO en un entorno web de simulación para la tarea `avoid_obstacles`, con una tasa de éxito del 90 % en el examen oficial; (2) generación de un conjunto de problemas a partir de las observaciones del robot cada 0,5 segundos durante la ejecución de la política, con la respuesta de la política como etiqueta (y un 20 % de ejemplos con desviaciones deliberadas); (3) ajuste supervisado del modelo de lenguaje con LoRA para imitar esas respuestas; y (4) refinamiento con RL donde cada opción se etiqueta con la recompensa que se habría obtenido si la política docente hubiera continuado el episodio, con anclaje KL para evitar el colapso.

El conjunto de datos consta de 1.246 ejemplos de entrenamiento, 249 de validación y 368 de test. La tasa de fidelidad máxima alcanzable (proporción de veces que la política docente produce la misma respuesta cuando la observación se verbaliza) es del 99 %. La evaluación de la locomoción se realiza con una aproximación 2D basada en una tabla de velocidades por comando derivada de MuJoCo, sin red neuronal de locomoción, por lo que no hay caídas simuladas y los resultados pueden diferir de una simulación MuJoCo completa.

## Capacidades

- Clasificación de decisiones discretas: dado un estado textual del robot, devuelve exactamente una letra entre las opciones listadas.
- Formato de salida restringido: el prompt de sistema exige devolver solo la letra, sin explicación.
- Interpretación de observaciones estructuradas en texto (distancia, dirección, sensores, velocidad, acción previa).
- Tarea única: evasión de obstáculos (`avoid_obstacles`) para el robot LINK-01.
- Capacidad multilingüe limitada al coreano para las descripciones de estado y las opciones.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento encadenado.
- No dispone de visión, audio ni modo de pensamiento.

## Casos de uso

- Investigación en destilación de políticas RL a modelos de lenguaje: el modelo sirve como ejemplo reproducible de cómo convertir una política PPO en un adaptador LoRA desplegable con transformers y PEFT.
- Educación en aprendizaje por refuerzo: el notebook de Colab y el repositorio CONNECT TYCOON permiten reproducir el pipeline completo (PPO, generación de dataset, SFT, RL) con fines didácticos.
- Prototipado de control de robots en simulación 2D: para probar bucles de decisión textuales donde el estado se serializa como texto y la acción se selecciona por letra.
- Benchmark de fidelidad de destilación: el modelo permite medir la brecha entre la política docente (100 % de coincidencia) y la destilada (67,9–69,6 %) en un conjunto de test de 368 ejemplos.
- Integración en pipelines de Hugging Face: al ser un adaptador PEFT, se puede cargar con `PeftModel.from_pretrained` y servir con infraestructura estándar de transformers.
- Estudio de refinamiento con RL sobre modelos pequeños: comparar SFT (69,6 % de acierto, 24,7 s por episodio) frente a RL (67,9 %, 23,9 s) en términos de fidelidad y latencia.
- Docencia sobre evaluación de políticas: el protocolo de 20 episodios con semillas 91001–91020 y la tabla de éxito/colisión sirven como plantilla de evaluación reproducible.

## Benchmarks y rendimiento

| Modelo | Acierto en test (misma respuesta que la política docente) | Éxito en 20 episodios del mismo circuito | Episodios con colisión | Tiempo medio por episodio exitoso |
|---|---|---|---|---|
| Política docente (PPO) | 100,0 % | 95 % | 15 % | 24,5 s |
| Modelo sin entrenar | 36,1 % | 0 % | 10 % | — |
| SFT (LoRA supervisado) | 69,6 % | 85 % | 30 % | 24,7 s |
| RL (modelo publicado) | 67,9 % | 85 % | 30 % | 23,9 s |

No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible. Las métricas anteriores son específicas de la tarea de evasión de obstáculos y se han obtenido con una aproximación 2D de la locomoción, no con simulación MuJoCo completa.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; para un modelo base de 0,8B en fp16 se requieren aproximadamente 1,6 GB solo para pesos, más overhead de activaciones y del adaptador LoRA.
- GPU recomendadas: cualquier GPU consumer con al menos 4–6 GB de VRAM debería ser suficiente para inferencia en fp16; no se especifican modelos concretos.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, dado el tamaño del modelo base.
- Opciones de despliegue: transformers + PEFT (documentado por el autor); vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador.
- Latencia y throughput: no disponibles; el tiempo por episodio (23,9–24,7 s) corresponde a la simulación de 20 episodios, no a la latencia de inferencia del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | 0,8B (base) + LoRA | no disponible | Decisión de evasión de obstáculos | Apache 2.0 | Hugging Face |
| Política PPO docente (`brain.json`) | no disponible | no aplica | Decisión de evasión de obstáculos | no disponible | Repositorio CONNECT TYCOON |
| Qwen3.5-0.8B (base) | 0,8B | no disponible | Lenguaje general | no disponible | Hugging Face |

No se dispone de información sobre otros adaptadores de decisión robótica comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo de tarea única: solo cubre `avoid_obstacles`; no generaliza a otras tareas de decisión sin reentrenamiento.
- Fidelidad limitada: acierta el 67,9 % de las respuestas de la política docente, frente al 99 % de techo teórico, por lo que se desvía en aproximadamente un tercio de los casos.
- Tasa de colisión elevada: 30 % de episodios con colisión en la evaluación, frente al 15 % de la política docente.
- Evaluación aproximada: la locomoción se mide con una tabla 2D de velocidades, sin red de locomoción ni simulación MuJoCo completa, por lo que los resultados pueden no transferirse a un robot real.
- Advertencia explícita del autor: es un modelo de investigación y educación; debe revalidarse en el robot y el entorno concretos antes de cualquier uso real.
- Idiomas: únicamente coreano; no se garantiza un comportamiento correcto con prompts en otros idiomas.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar letras no listadas o texto adicional si el prompt no se restringe estrictamente al formato indicado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B puede tener sus propias condiciones que deben verificarse por separado.
- Sin datos publicados sobre sesgos, contexto máximo ni cuantizaciones soportadas.

## Enlaces

- Hugging Face: https://huggingface.co/caley-kim/connectailab-rl-namsukkim-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Laboratorio web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
- Autor: https://31ns.kr
