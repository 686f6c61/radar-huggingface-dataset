# Luna002-Luna75/connectailab-rl-lunaluna-v1-link01

## Resumen

Connectailab-rl-lunaluna-v1-link01 es un adaptador LoRA entrenado por el usuario Luna002-Luna75 sobre Qwen3.5-0.8B para tareas de toma de decisiones en robótica, concretamente para el robot LINK-01 del proyecto CONNECT TYCOON. El modelo lee en lenguaje natural el estado del robot (distancia al objetivo, dirección, lecturas de sensores de distancia, velocidad y la acción elegida en el paso anterior) y responde con una única letra indicando la acción a ejecutar durante los siguientes 0,5 segundos.

Su metodología es especialmente interesante: se parte de un "cerebro" de aprendizaje por refuerzo (PPO) entrenado en un simulador web (CONNECT AI WORLD), que actúa como profesor. A partir de sus trayectorias se genera un dataset de preguntas-respuestas en texto, se realiza aprendizaje supervisado con LoRA y después un ajuste por refuerzo (PPO con restricción KL) para preferir acciones con mayor recompensa acumulada. El modelo publicado corresponde a la etapa de aprendizaje supervisado, que alcanzó un 72,3 % de coincidencia con el profesor y completó el 100 % de las 20 rondas de evaluación en el simulador.

Es un proyecto de nicho, de carácter educativo y de investigación, con apenas descargas, pero ilustra bien el enfoque de destilar una política de RL en un modelo de lenguaje pequeño y ligero, ejecutable localmente con hardware modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre modelo causal de lenguaje Qwen3.5-0.8B |
| Parámetros totales | no disponible (base: Qwen3.5-0.8B, ~0,8 B) |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-0.8B) |
| Tipos de cuantización | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | Coreano (ko); las entradas del estado se procesan como datos estructurados |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT; requiere el modelo base Qwen/Qwen3.5-0.8B) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (librería PEFT) aplicado sobre Qwen3.5-0.8B, un pequeño modelo de lenguaje causal de la familia Qwen. No es un MoE ni una arquitectura propia: toda la capacidad proviene del modelo base más los pesos del adaptador, que se cargan con `PeftModel.from_pretrained`.

El entrenamiento siguió un pipeline de cinco fases documentado en la model card:

1. **Profesor de RL**: un "cerebro" PPO entrenado en el simulador web CONNECT AI WORLD para la tarea `follow_route`, con la promesa `link01-decision/follow_route/obs16-act5/walker51-14/v1`, cursos aleatorios y un 95 % en el examen oficial.
2. **Generación del dataset**: mientras el profesor recorre un curso (id `4837c8d8`), se registran sus observaciones cada 0,5 segundos, traducidas a texto; la respuesta correcta es la acción del profesor, incluyendo un 20 % de estados donde el robot se desvía del camino por acciones alternativas.
3. **Aprendizaje supervisado (SFT)** con LoRA: el modelo imita las respuestas del profesor.
4. **Aprendizaje por refuerzo (PPO)**: cada opción de acción se evalúa con la recompensa que obtendría el profesor si continuara desde esa acción; se refuerzan las opciones claramente mejores y se penalizan las peores, con regularización KL para no alejarse del modelo supervisado.
5. **Evaluación**: el modelo se coloca en el puesto de decisión del robot y recorre el mismo curso en 20 rondas (semillas 91001–91020).

El dataset consta de 1.191 ejemplos de entrenamiento, 226 de validación y 357 de test. La tasa de acierto máxima posible (coincidencia del profesor tras traducir a texto) es del 98 %. El modelo publicado es el de la etapa supervisada, no el de RL. La evaluación de locomoción usa una aproximación 2D basada en una tabla de velocidades medidas por comando del walker MuJoCo web, por lo que puede diferir ligeramente de la simulación MuJoCo original.

## Capacidades

- Toma de decisiones de navegación para el robot LINK-01 en la tarea `follow_route`: dado un estado textual (distancia y dirección al objetivo, sensores de distancia, velocidad, acción previa), selecciona exactamente una opción de entre las listadas.
- Salida estrictamente controlada: devuelve únicamente la letra de la opción elegida, sin explicaciones, gracias al system prompt especificado.
- Robustez frente a inyección de instrucciones: el prompt indica tratar el contenido de `state` como datos, no como instrucciones.
- Manejo de estados de desviación: fue entrenado con un 20 % de ejemplos donde el robot había salido del camino, por lo que puede recuperarse de desvíos.
- No es un asistente general: sus capacidades de generación de texto, código o razonamiento son las heredadas de Qwen3.5-0.8B y no han sido el foco del ajuste.
- Soporte de tool calling, agentes o capacidades multimodales: no disponible.

## Casos de uso

- **Navegación de robots educativos en simulación**: integrar el modelo como cerebro de decisión del LINK-01 en el simulador CONNECT TYCOON, sustituyendo el archivo `brain.json` por inferencia del modelo de lenguaje cada 0,5 segundos.
- **Investigación en destilación de políticas RL a LLM**: replicar o extender el pipeline profesor-alumno (PPO → SFT → RL) para otras tareas de decisión secuencial, usando el código de CONNECT TYCOON como referencia.
- **Docencia de aprendizaje por refuerzo**: usar el proyecto (con notebook de Colab y curso de AI CITY BUILDERS) para enseñar en clase cómo se combina RL clásico con modelos de lenguaje.
- **Prototipado de control de bajo coste**: al basarse en un modelo de 0,8 B con LoRA, permite experimentar con agentes lingüísticos de decisión en GPUs de consumo o incluso CPU, sin depender de APIs externas.
- **Benchmarking de políticas de imitación**: comparar SFT frente a RL sobre el mismo dataset (1.191 ejemplos de entrenamiento) para estudiar el efecto del ajuste por refuerzo con recompensa del profesor.
- **Generación de datos sintéticos de decisión**: aprovechar el formato de preguntas (`Q.task_of`) para crear nuevos datasets de estados-acciones a partir de otros cursos o simulaciones.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluación sobre 357 preguntas de test y 20 rondas de simulación con semillas 91001–91020):

| Modelo | Acierto en test (coincidencia con el profesor) | Éxito en 20 rondas del curso | Rondas con colisión | Tiempo medio en rondas exitosas |
|---|---|---|---|---|
| Profesor (cerebro PPO) | 100,0 % | 100 % | 0 % | 27,6 s |
| Modelo base (antes de entrenar) | 38,1 % | 0 % | 0 % | — |
| Supervisado (modelo publicado) | 72,3 % | 100 % | 0 % | 26,0 s |
| Refuerzo (PPO, no publicado) | 70,0 % | 100 % | 0 % | 24,5 s |

La tasa de acierto máxima teórica (consistencia del profesor tras la traducción a texto) es del 98 %. No hay benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- El modelo base Qwen3.5-0.8B con el adaptador LoRA cabe cómodamente en GPUs de consumo: aproximadamente 2 GB de VRAM en fp16/bf16, y menos de 1 GB con cuantización de 4 bits (aunque la cuantización no está documentada en el repositorio).
- GPUs adecuadas: cualquier GPU moderna con 4 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090, etc.); también es viable la ejecución en CPU dada la escala del modelo.
- Despliegue mediante `transformers` + `peft`, cargando el modelo base `Qwen/Qwen3.5-0.8B` y aplicando el adaptador con `PeftModel.from_pretrained`. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. Al ser un modelo de 0,8 B con salidas de un solo carácter, la latencia de inferencia por decisión debería ser muy baja, pero no hay medidas publicadas.
- El entrenamiento se realizó en Google Colab, según el notebook enlazado, lo que indica requisitos de cómputo accesibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-lunaluna-v1-link01 | LoRA de decisión robótica sobre Qwen3.5-0.8B | 0,8 B (base) | Selección de acción para LINK-01 (follow_route) | Apache 2.0 | Hugging Face, 17 descargas |
| Profesor PPO (brain.json, CONNECT TYCOON) | Política RL tabular/red propia | no disponible | Misma tarea, en simulador web | no disponible | GitHub connect-tycoon |
| Qwen/Qwen3.5-0.8B (base) | LLM causal general | 0,8 B | Uso general; 38,1 % de acierto en esta tarea sin ajustar | Licencia de Qwen (no disponible en la ficha) | Hugging Face |

No hay otros modelos públicos comparables de la misma familia o tarea en la información disponible.

## Limitaciones y advertencias

- **Ámbito muy restringido**: el modelo solo es útil para la tarea `follow_route` del LINK-01 con el formato de estado `obs16-act5`; no sirve como asistente general ni para otras tareas de robótica sin reentrenamiento.
- **Validación solo en simulación 2D**: la evaluación de locomoción usa una aproximación 2D basada en una tabla de velocidades del walker MuJoCo web, sin modelo de robot ni red de marcha reales; los autores advierten explícitamente de que puede diferir de MuJoCo y de que debe revalidarse en el robot y espacio concretos antes de uso real.
- **Acierto limitado**: solo coincide con el profesor en el 72,3 % de los casos de test; en el resto puede elegir acciones subóptimas, aunque en la evaluación simulada mantuvo el 100 % de éxito sin colisiones.
- **Riesgo de alucinación**: no evaluado; el modelo puede desviarse del formato de respuesta de una sola letra si el prompt no se respeta.
- **Idioma**: etiquetado solo para coreano; el rendimiento con estados redactados en otros idiomas no está documentado.
- **Proyecto de nicho**: 17 descargas y 1 like en el momento de la ficha; sin auditoría externa, sin benchmarks estándar y con documentación principalmente en coreano.
- **Licencia**: Apache 2.0, sin restricciones para uso comercial del adaptador; el modelo base Qwen tiene su propia licencia, que debe revisarse por separado.
- Sesgos conocidos: no disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Luna002-Luna75/connectailab-rl-lunaluna-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código (CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- CONNECT AI LAB (YouTube): https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
