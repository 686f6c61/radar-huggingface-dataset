# key1739/connectailab-rl-connectailab-rl-coco-brain-v2-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, entrenado para actuar como política de decisión de un robot simulado de nombre LINK-01 en la tarea `goto_target` (desplazarse hacia un objetivo). El modelo recibe una descripción textual del estado del robot —distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa— y devuelve una única letra que identifica la acción de locomoción a ejecutar durante los siguientes 0,5 segundos. Lo desarrolla CONNECT AI LAB en colaboración con AI CITY BUILDERS, dentro del proyecto CONNECT TYCOON, y se publica en Hugging Face bajo el identificador `key1739/connectailab-rl-connectailab-rl-coco-brain-v2-link01`.

El interés técnico del modelo no reside en su tamaño —el adaptador se apoya en un transformer de 0,8 mil millones de parámetros— sino en la metodología de destilación: primero se entrena una política PPO en un simulador web de MuJoCo, después se generan pares estado textual/acción a partir de las observaciones de esa política y se hace aprendizaje supervisado con LoRA, y finalmente se refina con aprendizaje por refuerzo usando la recompensa que habría obtenido la política original. El resultado es un modelo de lenguaje que reproduce el comportamiento de un controlador entrenado por RL sin necesidad de ejecutar la red de locomoción en tiempo de inferencia.

Se trata de un artefacto de investigación y educación, con licencia Apache 2.0, publicado el 2 de noviembre de 2026 y sin descargas ni interacciones registradas en el momento de redactar esta ficha. Su ámbito de aplicación es deliberadamente estrecho: un único entorno, una única tarea y un vocabulario de acciones cerrado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parámetros totales | 0,8 mil millones (modelo base); tamaño del adaptador no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango montado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. La tarea se formula como clasificación de una sola letra entre un conjunto cerrado de opciones de locomoción (el autor cita el esquema `obs10-act5`, es decir, 10 dimensiones de observación y 5 acciones posibles). El prompt incluye un mensaje de sistema que instruye al modelo a tratar el contenido del estado como datos y no como instrucciones, a seleccionar exactamente una opción de la lista y a devolver solo su letra, sin explicación.

El pipeline de entrenamiento tiene cuatro fases documentadas por el autor. Primero, una política PPO se entrena en el simulador web de CONNECT AI WORLD sobre el curso `random` para la tarea `goto_target`, alcanzando un 100 % de éxito en la prueba oficial. Segundo, se genera un conjunto de problemas convirtiendo cada 0,5 segundos las observaciones del robot en texto, con la acción de la política como etiqueta; el 20 % de los ejemplos se corrompen deliberadamente con acciones alternativas que desvían al robot. Tercero, se hace aprendizaje supervisado con LoRA sobre ese corpus. Cuarto, se aplica un refinamiento por refuerzo en el que cada opción se puntúa con la recompensa que habría obtenido la política original si hubiera ejecutado esa acción y después hubiera continuado ella misma, con una penalización KL que ancla el adaptador al modelo supervisado. El corpus resultante tiene 463 ejemplos de entrenamiento, 93 de validación y 137 de test; el autor reporta un techo de acierto del 99 % atribuible a la conversión de observaciones a texto.

## Capacidades

- Selección de acción discreta en un entorno de robótica simulado: dado un estado textual del robot LINK-01, devuelve una letra entre las opciones de locomoción disponibles.
- Razonamiento de decisión de un solo paso: no mantiene planificación multi-paso explícita, aunque la secuencia de decisiones emerge de la ejecución repetida cada 0,5 segundos.
- Robustez parcial ante estados derivados de acciones subóptimas, gracias a la inclusión del 20 % de ejemplos con desviaciones en el corpus de entrenamiento.
- Comprensión de texto en coreano para la descripción del estado y del enunciado de la tarea.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de pensamiento extendido.
- No se documentan capacidades multilingües más allá del coreano.

## Casos de uso

- Investigación en destilación de políticas RL a modelos de lenguaje: el adaptador sirve como caso de estudio reproducible de cómo una política PPO puede transferirse a un LLM mediante supervisión más refinamiento por refuerzo, con código y cuaderno de Colab públicos.
- Docencia de aprendizaje por refuerzo: el repositorio CONNECT TYCOON y el curso asociado permiten a estudiantes ejecutar el pipeline completo (entrenamiento PPO, generación de corpus, LoRA, RL) sobre una tarea acotada y con métricas claras de éxito.
- Control de robots simulados en entornos de bajo coste computacional: al sustituir la red de locomoción por un modelo de 0,8 mil millones de parámetros con adaptador, la inferencia puede ejecutarse en CPU o en GPU de consumo, lo que facilita prototipado rápido.
- Generación de datos sintéticos de decisión: el modelo puede emplearse para etiquetar trayectorias simuladas adicionales en el mismo entorno y ampliar el corpus de entrenamiento de otras políticas.
- Evaluación comparativa de métodos de alineación: la diferencia entre el modelo supervisado y el refinado por RL (ambos con 97,1 % de acierto en test) permite estudiar cuándo el RL aporta mejoras marginales y cuándo no.
- Pruebas de robustez ante inyección de instrucciones: el mensaje de sistema explícito sobre tratar el estado como datos convierte al modelo en un banco de pruebas para evaluar si un LLM pequeño respeta esa separación en un dominio controlado.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son los de la model card, medidos sobre el conjunto de test de 137 problemas y sobre 20 episodios de evaluación con semillas 91001–91020:

| Modelo | Acierto en test (coincidencia con la política) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Política PPO (profesor) | 100,0 % | 100 % | 0 % | 10,3 s |
| Modelo base sin ajustar | 24,8 % | 0 % | 0 % | — |
| Tras aprendizaje supervisado (LoRA) | 97,1 % | 100 % | 0 % | 10,5 s |
| Tras refinamiento por RL | 97,1 % | 100 % | 0 % | 10,5 s |

El autor advierte que la evaluación de locomoción se realizó con una aproximación 2D basada en una tabla de velocidades por comando, no con el modelo físico del robot ni con la red de locomoción, por lo que los resultados pueden diferir de los obtenidos en MuJoCo web. No se han publicado resultados en benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación; por el tamaño del modelo base (0,8 mil millones de parámetros), en FP16 requeriría del orden de 1,6 GB solo para pesos, más el adaptador y la caché KV, aunque esta cifra es una estimación y no un dato publicado.
- GPU recomendadas: no disponible. Un modelo de este tamaño es compatible con GPU de consumo, pero el autor no especifica modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo base, aunque no se documenta ninguna prueba.
- Opciones de despliegue: la model card solo muestra el uso con `transformers` y `peft` (`PeftModel.from_pretrained`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor reporta tiempos de episodio (10,3–10,5 s) pero no latencia por inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es un adaptador LoRA específico de tarea sobre Qwen3.5-0.8B y no se han publicado comparaciones con otras políticas destiladas, otros adaptadores de robótica o modelos de decisión de tamaño similar.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | 0,8 B (base) + LoRA | No disponible | 97,1 % test, 100 % éxito en 20 episodios | Apache 2.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ámbito extremadamente estrecho: entrenado solo para la tarea `goto_target` en el curso `random` del simulador LINK-01. No generaliza a otras tareas, entornos ni robots sin reentrenamiento.
- Evaluación de locomoción aproximada: el autor reconoce que la validación se hizo con una tabla 2D de velocidades por comando, no con el modelo físico ni la red de locomoción, por lo que los porcentajes de éxito pueden no reproducirse en MuJoCo o en un robot real.
- El refinamiento por RL no mejora el acierto en test ni el éxito en episodios respecto al modelo supervisado (ambos 97,1 % y 100 %), lo que sugiere un margen de mejora limitado en esta configuración.
- Idioma limitado al coreano; no se documenta soporte de otros idiomas.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede devolver una letra no incluida en las opciones o texto adicional si el prompt no se construye exactamente como se especifica; el mensaje de sistema mitiga pero no elimina este riesgo.
- Dependencia del formato de prompt: el autor especifica un mensaje de sistema concreto y una función `Q.task_of` del paquete `connect_tycoon` para construir el problema; desviarse de ese formato puede degradar el rendimiento.
- Uso previsto de investigación y educación: el autor advierte explícitamente que es un modelo sobre simulador y que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- Sin descargas ni validación externa: el repositorio no registra descargas ni interacciones, por lo que no hay evidencia independiente de reproducibilidad.
- Licencia Apache 2.0: permite uso comercial, pero la licencia del modelo base Qwen3.5-0.8B debe verificarse por separado, ya que la model card solo declara Apache 2.0 para el adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/key1739/connectailab-rl-connectailab-rl-coco-brain-v2-link01
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
