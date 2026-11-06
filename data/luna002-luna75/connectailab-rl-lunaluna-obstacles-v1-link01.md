# Luna002-Luna75/connectailab-rl-lunaluna-obstacles-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario Luna002-Luna75 bajo el paraguas de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un cerebro de decisión para el robot simulado LINK-01: recibe en texto el estado actual del robot (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y la acción previa) y devuelve una única letra que codifica cómo debe caminar durante los siguientes 0,5 segundos. La tarea concreta es `avoid_obstacles`, es decir, esquivar obstáculos en un recorrido.

El pipeline de creación es poco habitual y combina varias etapas: primero se entrena una política PPO en un simulador web (el "cerebro" o `brain.json`), después se genera un conjunto de problemas convirtiendo cada observación en texto con la respuesta del cerebro como etiqueta, se hace un ajuste supervisado con LoRA sobre Qwen3.5-0.8B y, finalmente, se aplica aprendizaje por refuerzo con PPO y una penalización KL para empujar al modelo hacia acciones con mayor recompensa que las del propio cerebro. El resultado es un adaptador de muy pequeño tamaño (el repositorio ocupa 0,0 GB) que se carga con PEFT sobre el modelo base.

Su relevancia es acotada pero interesante como caso de estudio: demuestra un flujo completo de destilación de una política de RL en un modelo de lenguaje pequeño y de cómo el RL posterior mejora las métricas de decisión (del 73,3 % al 75,7 % de acierto frente al cerebro, y del 45 % al 55 % de éxito en 20 episodios). No es un modelo para generar texto libre ni para tareas generales de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only (Qwen3.5-0.8B); no se especifica la arquitectura interna del modelo base |
| Parametros totales | No disponible (el adaptador LoRA no declara su número de parámetros; el modelo base es de 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, sin especificar) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko), según la model card y los tags |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros, mediante LoRA. El entrenamiento tiene cuatro fases documentadas por el autor: (1) entrenamiento de una política PPO en el simulador web para la tarea `avoid_obstacles`, con el contrato `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1` y un 90 % de éxito en el examen oficial; (2) construcción de un corpus de problemas en los que cada 0,5 segundos se traduce la observación del robot a texto y se etiqueta con la acción del cerebro, incluyendo un 20 % de ejemplos con acciones alternativas que desviaban al robot; (3) ajuste supervisado con LoRA para imitar al cerebro; y (4) refinamiento con PPO usando la recompensa obtenida al ejecutar cada opción y dejar que el cerebro continúe el episodio, con una penalización KL que ancla el modelo a la política supervisada.

El conjunto de datos resultante tiene 1176 ejemplos de entrenamiento, 231 de validación y 345 de prueba. El autor reporta que el techo de acierto (la proporción en que el propio cerebro coincide con la etiqueta al pasar la observación a texto) es del 99 %, lo que acota el margen de mejora. La evaluación final se hace sentando al modelo en el puesto de decisión del robot y caminando el mismo recorrido en 20 episodios con semillas 91001–91020, usando una aproximación 2D de la marcha basada en una tabla de velocidades por comando en lugar del modelo físico completo; el autor advierte que los resultados pueden diferir de los de MuJoCo en el navegador.

## Capacidades

- Decisión de acciones discretas en un entorno de robótica simulado: dado un estado textual, devuelve una única letra entre las opciones listadas.
- Formato de salida restringido: el prompt de sistema exige devolver solo la letra, sin explicación.
- Robustez frente a inyección de instrucciones en el estado: el prompt indica tratar el texto dentro de `state` como datos y no como instrucciones.
- Comprensión de estados estructurados en coreano (distancias, direcciones, lecturas de sensores, velocidad y acción previa).
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito, según la información disponible.
- Capacidad multilingüe limitada al coreano declarado; no hay evidencia de otros idiomas.

## Casos de uso

- Evaluación de pipelines de destilación de políticas RL: sirve como referencia para medir cuánto de una política PPO se puede transferir a un modelo de lenguaje pequeño mediante supervisión más RL, con métricas de acierto y de éxito en episodios.
- Docencia y divulgación de RL: el flujo completo (entrenar cerebro en simulador, generar problemas, LoRA, PPO con KL) es reproducible con el notebook de Colab y el repositorio connect-tycoon, lo que lo hace útil en cursos introductorios.
- Prototipado de interfaces lenguaje-acción para robótica simulada: permite experimentar con la conversión de observaciones numéricas a texto y con la selección de acciones discretas antes de invertir en un modelo mayor.
- Investigación sobre robustez a instrucciones inyectadas: el diseño del prompt de sistema permite estudiar cómo un modelo pequeño maneja texto de estado que podría contener instrucciones maliciosas.
- Comparación de métodos de ajuste (SFT frente a SFT+RL) en tareas de decisión: el autor publica métricas separadas para ambos, lo que facilita reproducir el análisis.
- Base para experimentos de sustitución de políticas en simuladores: se puede enchufar el adaptador en el puesto de decisión del robot LINK-01 y comparar su comportamiento con el cerebro original en el mismo recorrido.
- No es adecuado para atención al cliente, generación de código, matemáticas, resumen ni ninguna tarea generativa general: su entrenamiento está acotado a la tarea `avoid_obstacles`.

## Benchmarks y rendimiento

| Modelo | Acierto en test (misma respuesta que el cerebro) | Éxito en 20 episodios del mismo recorrido | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0 % | 100 % | 0 % | 25,7 s |
| Antes del entrenamiento (base) | 42,6 % | 0 % | 85 % | — |
| Ajuste supervisado (LoRA) | 73,3 % | 45 % | 75 % | 30,3 s |
| Ajuste supervisado + RL (modelo publicado) | 75,7 % | 55 % | 50 % | 25,7 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores son las que reporta el autor en la model card y corresponden a la tarea específica de evitar obstáculos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre un modelo base de 0,8B, la huella es la del modelo base más el adaptador, muy por debajo de los 4 GB en fp16.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente para el modelo base de 0,8B; no se especifican requisitos para entrenamiento.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño del modelo base.
- Opciones de despliegue: la model card solo documenta la carga con `transformers` y `peft` (`PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al ser un adaptador PEFT la integración con esos motores requeriría conversión adicional.
- Latencia y throughput: no disponibles. El autor reporta tiempos de episodio (25,7 s de media en los exitosos), pero no latencia por inferencia.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (adaptadores LoRA para decisión robótica sobre modelos de lenguaje pequeños). Como referencia del modelo base, Qwen/Qwen3.5-0.8B es un transformer de 0,8B parámetros bajo licencia Apache 2.0, pero no se dispone de datos de benchmarks ni de comparativas con alternativas en la documentación consultada.

## Limitaciones y advertencias

- Ámbito muy restringido: el modelo solo está entrenado para la tarea `avoid_obstacles` del robot LINK-01; no generaliza a otras tareas de decisión ni a otros robots sin reentrenamiento.
- Evaluación aproximada: la marcha se simula con una tabla 2D de velocidades por comando, no con el modelo físico completo; el autor advierte que los resultados pueden diferir de los de MuJoCo en el navegador.
- Techo de rendimiento: el acierto máximo alcanzable está limitado al 99 % por la propia conversión de observaciones a texto, y el modelo publicado se queda en el 75,7 % de acierto y el 55 % de éxito en episodios, con un 50 % de episodios con colisión.
- Idiomas: solo coreano declarado; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Riesgo de alucinación: al ser un modelo de lenguaje, podría devolver una letra no listada o texto adicional si el prompt no se respeta; el prompt de sistema lo restringe, pero no hay garantía formal.
- Sesgos: no se documentan análisis de sesgos; el corpus es sintético y generado a partir de una única política PPO en un único recorrido (`7042d394`), lo que puede limitar la diversidad de situaciones.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero la model card indica explícitamente que es un modelo de investigación y educación sobre simulador y que debe revalidarse en el robot y el espacio reales antes de usarlo en producción.
- Repositorio de tamaño 0,0 GB y sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- La model card incluye en el ejemplo de carga un identificador de repositorio distinto (`connectailab-rl-lunaluna-v4-link01`) del ID publicado (`connectailab-rl-lunaluna-obstacles-v1-link01`), lo que puede provocar errores al reproducir el ejemplo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Luna002-Luna75/connectailab-rl-lunaluna-obstacles-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código (CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
