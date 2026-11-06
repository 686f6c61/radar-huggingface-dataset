# rhemslkim/connectailab-rl-rere-v2-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B que convierte observaciones textuales de un robot simulado en decisiones discretas de locomoción. El modelo ha sido desarrollado por el autor rhemslkim en el marco de CONNECT AI LAB y AI CITY BUILDERS, y está pensado como un "cerebro" de decisión para la tarea `goto_target`: dado el estado actual del robot (distancia y dirección al objetivo, sensores de distancia, velocidad y acción previa), devuelve una única letra que corresponde a una de las cinco acciones de caminata disponibles para los siguientes 0,5 segundos.

El modelo no es un LLM de propósito general: es un adaptador de reinforcement learning y ajuste supervisado que destila el comportamiento de una política PPO entrenada en un simulador web, para que un modelo de lenguaje pueda ejecutar la misma decisión a partir de una representación textual del estado. La relevancia radica en su enfoque híbrido: combina destilación desde una política PPO, aprendizaje supervisado (LoRA) y un paso posterior de optimización por refuerzo con anclaje KL, evaluado en un banco de 326 problemas de test y en 20 episodios de caminata simulada.

El tamaño del adaptador es mínimo (repo de 0,0 GB) y se apoya en el modelo base Qwen3.5-0.8B, de 0,8 mil millones de parámetros. El idioma declarado es coreano (`ko`) y la licencia es Apache 2.0. Es un artefacto de investigación y educación, no un modelo listo para producción en robótica real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Qwen/Qwen3.5-0.8B) |
| Parametros totales | 0,8 mil millones (modelo base) + adaptador LoRA (tamaño no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El pipeline declarado es `reinforcement-learning` y combina tres fases: (1) entrenamiento de una política PPO en un simulador web (tarea `goto_target`, curso `random`, 100 % de éxito en el examen oficial), (2) destilación de esa política a un conjunto de problemas textuales generados cada 0,5 segundos a partir de las observaciones del robot, con un 20 % de ejemplos de desviación, y (3) ajuste supervisado del LLM con LoRA para imitar las respuestas del "profesor" PPO, seguido de un paso de optimización por refuerzo con anclaje KL que sube la probabilidad de acciones con recompensa superior y baja la de las peores.

El conjunto de datos consta de 1.036 problemas de entrenamiento, 209 de validación y 326 de test. La evaluación de la caminata se realizó mediante una aproximación 2D basada en una tabla de velocidades medidas por comando (sin modelo de robot ni red neuronal de marcha), por lo que los resultados pueden diferir de los de MuJoCo en el navegador. No se especifican el número de tokens de entrenamiento del modelo base ni detalles sobre su composición, y tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de decisiones discretas: dado un estado textual del robot, devuelve exactamente una letra entre las opciones listadas (5 acciones de caminata).
- Razonamiento de un solo paso sobre observaciones estructuradas (distancia, dirección, sensores, velocidad, acción previa).
- Seguimiento de instrucciones de sistema estrictas: el prompt de sistema exige devolver solo la letra, sin explicación.
- Tratamiento del estado como datos, no como instrucciones (defensa básica frente a inyección de prompt en el campo de estado).
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes multi-paso ni razonamiento encadenado.
- Capacidades multilingües limitadas al coreano declarado.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Simulación educativa de robótica: el modelo puede sustituir a la política PPO en el bucle de decisión de un robot simulado en el navegador, permitiendo a estudiantes comparar el comportamiento de una política destilada frente a la original en la tarea `goto_target`.
- Investigación en destilación de políticas: sirve como caso de estudio reproducible de cómo convertir una política de RL en un modelo de lenguaje mediante LoRA y un paso posterior de RL con KL, con métricas de éxito y colisiones publicadas.
- Evaluación de robustez ante representaciones textuales: permite medir cuánto se degrada una política cuando el estado continuo se serializa a texto y se procesa con un LLM pequeño, útil para estudiar la pérdida de información en pipelines híbridos.
- Docencia de reinforcement learning: el notebook de Colab y el repositorio permiten reproducir el entrenamiento y la evaluación en 20 episodios con semillas fijas (91001–91020), lo que facilita prácticas guiadas.
- Prototipado rápido de controladores de bajo coste: al ejecutarse sobre un modelo de 0,8 B, puede desplegarse en hardware modesto para pruebas de concepto de decisión discreta en entornos simulados.
- Benchmark de métodos de alineación: la comparación entre modelo sin entrenar (13,8 % de acierto), supervisado (92,6 %) y RL (90,5 %) con distintos porcentajes de éxito en caminata (0 %, 10 % y 35 %) ofrece un banco para estudiar el desacoplamiento entre precisión de imitación y rendimiento en la tarea final.

## Benchmarks y rendimiento

| Modelo | Acierto en test (misma respuesta que el profesor) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Profesor (PPO) | 100,0 % | 10 % | 90 % | 11,2 s |
| Sin entrenar | 13,8 % | 0 % | 0 % | — |
| Aprendizaje supervisado (LoRA) | 92,6 % | 10 % | 90 % | 11,0 s |
| Aprendizaje por refuerzo (este modelo) | 90,5 % | 35 % | 90 % | 16,0 s |

Los datos provienen de la model card del autor. La evaluación de caminata emplea una aproximación 2D con tabla de velocidades, no un simulador físico completo, por lo que los resultados pueden diferir de los de MuJoCo en el navegador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un modelo base de 0,8 B en precisión de 16 bits, la estimación orientativa ronda los 2 GB, y en cuantización de 4 bits alrededor de 1 GB, aunque el autor no publica cifras.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer con al menos 4 GB de VRAM debería poder cargar el modelo base en fp16.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, aunque no hay confirmación oficial.
- Opciones de despliegue: el autor documenta `transformers` + `peft` con `PeftModel.from_pretrained`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-rere-v2-link01 | 0,8 B (base) + LoRA | No disponible | Decisión discreta en robot simulado | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B | No disponible | LLM generalista | No disponible en la información | Hugging Face |
| Política PPO original (profesor) | No disponible | No aplica | Decisión discreta en robot simulado | No disponible | No disponible como modelo publicado |

No se dispone de información sobre otros adaptadores comparables de la misma familia ni sobre modelos de decisión robótica de tamaño similar publicados en abierto.

## Limitaciones y advertencias

- Ámbito muy restringido: solo resuelve la tarea `goto_target` con 5 acciones discretas y observaciones de 10 dimensiones; no generaliza a otras tareas de control.
- Evaluación de caminata aproximada: los resultados de éxito (35 %) se obtuvieron con una tabla 2D de velocidades, no con un simulador físico, y pueden no reproducirse en MuJoCo o en un robot real.
- Alto porcentaje de colisiones: el 90 % de los episodios terminó en colisión incluso para el modelo con RL, lo que indica una política frágil.
- El modelo con RL acierta menos que el supervisado en el test (90,5 % frente a 92,6 %) y tarda más en los episodios exitosos (16,0 s frente a 11,0 s), lo que sugiere un compromiso entre imitación y rendimiento.
- Idioma limitado al coreano; el prompt de sistema está en inglés, pero el modelo no declara soporte multilingüe.
- Riesgo de alucinación: puede devolver letras no listadas o texto adicional si el prompt no se formatea exactamente como espera.
- Uso previsto exclusivamente educativo y de investigación; el autor advierte explícitamente de que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- Sin datos publicados sobre sesgos, contexto máximo ni cuantizaciones soportadas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B puede tener condiciones propias que deben verificarse por separado.

## Enlaces

- Hugging Face: https://huggingface.co/rhemslkim/connectailab-rl-rere-v2-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
