# artnfull/connectailab-rl-artnfull-v1-link01

## Resumen

connectailab-rl-artnfull-v1-link01 es un adaptador LoRA entrenado por el usuario artnfull (CONNECT AI LAB) sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo de lenguaje de propósito general, sino un modelo de decisión para el robot LINK-01: lee el estado del robot en texto (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y la acción previa) y responde con una única letra que indica cómo caminar durante los siguientes 0,5 segundos.

El entrenamiento sigue un enfoque de destilación de política de aprendizaje por refuerzo: primero se entrena una "cerebro" (brain.json) con PPO en el simulador web CONNECT AI WORLD para la tarea `goto_target`, luego se generan preguntas textuales a partir de las observaciones del cerebro, se aplica aprendizaje supervisado con LoRA para imitar sus decisiones y, finalmente, se refina con aprendizaje por refuerzo (PPO con regularización KL). Es relevante como ejemplo educativo y de investigación de cómo transferir políticas de RL a modelos de lenguaje pequeños y ejecutables localmente, con un 97,1 % de coincidencia con el profesor y 100 % de éxito en 20 episodios de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer causal (Qwen3.5-0.8B) |
| Parametros totales | no disponible (base de 0,8B parámetros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | Coreano (ko); las tareas se formatean en inglés mediante plantillas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT de tipo LoRA aplicado sobre Qwen/Qwen3.5-0.8B. El pipeline de entrenamiento consta de cinco fases documentadas por el autor: (1) entrenamiento de una política profesor con PPO en el simulador web CONNECT AI WORLD, tarea `goto_target`, con la convención `link01-decision/goto_target/obs10-act5/walker51-14/v1` y cursos aleatorios, alcanzando un 100 % en la prueba oficial; (2) generación del dataset convirtiendo cada 0,5 segundos las observaciones del profesor en texto, con la respuesta del profesor como etiqueta, incluyendo un 20 % de estados fuera de trayectoria para robustez; (3) aprendizaje supervisado (imitación) con LoRA; (4) refinamiento con aprendizaje por refuerzo, donde cada opción candidata se puntúa con la recompensa que obtendría el profesor al ejecutarla y continuar con su política, favoreciendo opciones mejores que la del profesor y estabilizando con penalización KL; (5) evaluación sustituyendo el cerebro por el modelo lingüístico en 20 episodios (semillas 91001–91020).

El dataset consta de 463 ejemplos de entrenamiento, 93 de validación y 137 de prueba. La tasa de acierto máxima (proporción de casos en que la descripción textual preserva la decisión del profesor) es del 99 %. La evaluación de caminata se realiza con una aproximación 2D basada en una tabla de velocidades medidas por comando del caminante web MuJoCo, sin modelo físico del robot ni red de caminata, por lo que no hay caídas y los resultados pueden diferir ligeramente de MuJoCo real.

## Capacidades

- Decision de accion discreta para navegacion de robot: selecciona una entre 5 acciones (act5) cada 0,5 segundos a partir de 10 observaciones textuales (obs10): distancia y direccion al objetivo, sensores de distancia, velocidad y accion previa.
- Respuesta restringida: devuelve unicamente la letra de la opcion elegida, sin explicaciones, siguiendo el system prompt definido por el autor.
- Robustez a estados fuera de trayectoria: el 20 % del dataset incluye desviaciones del camino, lo que permite recuperar situaciones no optimas.
- No es un modelo conversacional general: sus capacidades de generacion de texto, razonamiento abierto, codigo o matematicas son las heredadas del modelo base, no el objetivo del adaptador.
- No soporta tool calling, agentes multi-step, vision ni audio; su alcance es la tarea `goto_target` del robot LINK-01.

## Casos de uso

- Navegacion hacia objetivo en simulador 2D: el modelo sustituye a la politica PPO del cerebro en la tarea `goto_target`, decidiendo cada 0,5 segundos la accion de caminata para alcanzar el objetivo.
- Investigacion en destilacion de RL a LLM: sirve como caso de estudio reproducible de como convertir una politica de refuerzo en un modelo de lenguaje mediante SFT + PPO con KL.
- Docencia en aprendizaje por refuerzo: CONNECT AI LAB lo usa en sus cursos gratuitos y en el notebook de Colab publicado para que estudiantes entrenen y evaluen el pipeline completo.
- Experimentacion con LLM en edge: al basarse en un modelo de 0,8B con adaptador LoRA, permite probar decisiones de robot con modelos que caben en hardware de consumo.
- Prototipado de interfaces lenguaje-robot: el formato de pregunta (estado textual, pregunta y opciones) es reutilizable para otras tareas mediante la funcion `Q.task_of` del repositorio connect-tycoon.
- Comparacion de politicas: el marco de evaluacion (20 episodios con semillas fijas, tasa de colision y tiempo medio) permite comparar SFT frente a RL frente al profesor de forma controlada.

## Benchmarks y rendimiento

Resultados publicados por el autor (coincidencia con la decision del profesor y evaluacion en 20 episodios de caminata, semillas 91001–91020):

| Modelo | Acierto en test (coincide con cerebro) | Exito en 20 episodios | Episodios con colision | Tiempo medio en exitos |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0 % | 100 % | 0 % | 10,3 s |
| Modelo base sin entrenar | 24,8 % | 0 % | 0 % | — |
| Tras aprendizaje supervisado (LoRA) | 97,1 % | 100 % | 0 % | 10,5 s |
| Tras refuerzo (modelo publicado) | 97,1 % | 100 % | 0 % | 10,5 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre un modelo de 0,8B, del orden de 1–2 GB en FP16; con cuantizacion 4-bit podria funcionar en GPUs de 4 GB (estimacion, no confirmada por el autor).
- GPU recomendadas: cualquier GPU moderna de consumo (RTX 3060, RTX 4060 o superior) es mas que suficiente; tambien es viable solo CPU dado el tamano del modelo base.
- Cabe comodamente en GPUs de consumo; el autor proporciona un notebook de Google Colab para ejecutar el entrenamiento y la evaluacion.
- Despliegue: mediante transformers + peft (cargando el modelo base Qwen/Qwen3.5-0.8B y aplicando el adaptador con `PeftModel.from_pretrained`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. Al responder con una sola letra, la generacion por paso es minima; el ciclo de decision es de 0,5 segundos de simulacion.

## Comparativa con modelos similares

| Modelo | Tipo | Base / tamano | Tarea | Licencia |
|---|---|---|---|---|
| connectailab-rl-artnfull-v1-link01 | Adaptador LoRA (SFT + PPO) | Qwen3.5-0.8B | Decision de navegacion LINK-01 (`goto_target`) | Apache-2.0 |
| Qwen/Qwen3.5-0.8B (base) | LLM general | 0,8B parametros | Uso general; 24,8 % de acierto en esta tarea sin adaptar | Apache-2.0 (segun tags del repo) |
| Politica profesor (brain.json PPO) | Politica RL clasica (no LLM) | no disponible | Misma tarea; 100 % de acierto y 10,3 s por episodio | no disponible |

No hay alternativas de terceros directamente comparables publicadas para esta tarea concreta; la comparacion mas relevante es con su propio modelo base y con la politica profesor destilada.

## Limitaciones y advertencias

- Alcance muy restringido: el adaptador solo es util para la tarea `goto_target` del robot LINK-01 con el formato de observacion `obs10-act5`. Fuera de ese dominio no aporta valor.
- Validado solo en simulacion: la evaluacion usa una aproximacion 2D con tabla de velocidades, no MuJoCo completo ni hardware real. El propio autor advierte de que hay que revalidar en el robot y espacio concretos antes de uso real.
- Techo de rendimiento: la tasa de acierto maxima por perdida de informacion al textualizar observaciones es del 99 %; el modelo queda en 97,1 %, ligeramente por debajo del profesor.
- Sesgos: no documentados. Al imitar una politica PPO en un dominio sintetico, los sesgos tipicos de LLM conversacionales no aplican directamente, pero no hay analisis publicado.
- Riesgo de alucinacion: no aplicable en la practica, ya que el modelo debe devolver una sola letra; aun asi, no hay garantias de que siempre respete el formato sin el system prompt adecuado.
- Idioma: el modelo esta etiquetado para coreano (ko); las plantillas de tarea estan en ingles. No hay documentacion de comportamiento en otros idiomas.
- Datos de entrenamiento escasos: 463 ejemplos de entrenamiento y 137 de prueba; la generalizacion a cursos o configuraciones distintas de las evaluadas no esta demostrada.
- Licencia: Apache-2.0, sin restricciones conocidas para uso comercial, aunque el autor lo califica explicitamente como modelo de investigacion y educacion sobre simulador.
- Advertencia de seguridad: al tratarse de un modelo de decision para robotica, su uso en hardware fisico sin validacion adicional conlleva riesgo de comportamiento inadecuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/artnfull/connectailab-rl-artnfull-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de codigo (CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de entrenamiento (CONNECT AI WORLD robot lab): https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de refuerzo AI CITY BUILDERS: https://www.aicitybuilders.com/robot
