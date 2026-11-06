# pluskkm79/connectailab-rl-jay-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario pluskkm79 bajo el paraguas de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un "cerebro de decisión" para el robot simulado LINK-01: recibe una descripción textual del estado del robot (distancia y dirección al objetivo, sensores de distancia, velocidad y elección previa) y devuelve una única letra correspondiente a una de las cuatro acciones de locomoción disponibles. El modelo se distribuye como adaptador PEFT en formato safetensors y está etiquetado para la tarea `reinforcement-learning`.

La génesis del modelo es un proceso de destilación de una política PPO entrenada en un entorno web de aprendizaje por refuerzo. Primero se entrenó una política PPO (el "profesor" o *brain.json*) en el curso `random` del simulador de robot de CONNECT AI WORLD, con una tasa de éxito del 95 % en la prueba oficial. Después se generó un corpus de 401 ejemplos de entrenamiento, 75 de validación y 131 de test, traduciendo las observaciones del profesor a texto y usando sus acciones como etiquetas. Sobre ese corpus se aplicó un ajuste supervisado con LoRA y, posteriormente, una fase de refuerzo con PPO y una penalización KL para mantener la política cerca de la de referencia.

La relevancia de esta ficha es acotada: se trata de un experimento educativo de pequeño tamaño (base de 0,8 mil millones de parámetros) orientado a robótica simulada y toma de decisiones discretas, no a generación de texto abierta. Su interés técnico reside en el pipeline completo (RL clásico → destilación a lenguaje natural → SFT → RL sobre el LLM) y en que demuestra que un modelo de 0,8B puede replicar exactamente la política de un profesor PPO en un dominio muy restringido. La model card advierte explícitamente que es un modelo de investigación y educación sobre simulador y que debe revalidarse antes de usarse en un robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parámetros totales | 0,8 mil millones (modelo base); tamaño del adaptador no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el adaptador se publica en safetensors; el base admite las cuantizaciones habituales de Qwen3.5, no confirmadas en la información) |
| Idiomas soportados | Coreano (`ko`); las instrucciones del sistema están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA acoplado a Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8B parámetros. El adaptador no modifica la arquitectura del base: añade matrices de bajo rango en las capas que PEFT seleccione por defecto. El pipeline de entrenamiento consta de cuatro fases documentadas en la model card: (1) entrenamiento de una política PPO en el simulador web, tarea `choose_object`, con el contrato `link01-decision/choose_object/obs26-act4/walker51-14/v1` y curso `random`, alcanzando un 95 % en la prueba oficial; (2) generación de un dataset de 401/75/131 ejemplos (train/valid/test) convirtiendo cada observación del profesor a texto y etiquetando con la acción elegida, incluyendo un 20 % de ejemplos donde el profesor se desvía deliberadamente; (3) ajuste supervisado con LoRA para imitar al profesor; (4) refinamiento con PPO usando la recompensa que habría obtenido el profesor al continuar la marcha desde cada opción, con una penalización KL para anclar la política.

La innovación técnica destacable no está en el modelo en sí, sino en el método: destilar una política de RL clásica en un LLM mediante descripciones textuales del estado y refinar después con RL sobre el propio LLM. La model card reporta que la tasa de acierto del profesor al traducir sus observaciones a texto es del 100 % (techo de acierto), lo que indica que la representación textual no pierde información relevante para esta tarea. No se documentan detalles sobre número de tokens de entrenamiento, composición del dataset más allá de los recuentos, ni hiperparámetros del LoRA.

## Capacidades

- Toma de decisiones discretas: dado un estado textual del robot, devuelve una única letra entre las cuatro opciones de locomoción disponibles.
- Clasificación de opciones restringida: el modelo está entrenado para responder exclusivamente con la letra de la opción elegida, sin explicación.
- Robustez a instrucciones embebidas: el *system prompt* indica tratar el contenido del estado como datos y no como instrucciones, una mitigación básica de inyección de prompt.
- Reproducción de la política PPO del profesor: la model card reporta un 100 % de coincidencia con las respuestas del profesor en el conjunto de test.
- Ejecución en el bucle de control del simulador: el modelo se ha evaluado como sustituto del profesor en 20 episodios del mismo curso (semillas 91001–91020), con 100 % de éxito.
- Capacidades multilingües: limitadas al coreano (idioma del dataset) y al inglés de las instrucciones del sistema; no se documenta soporte de otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Docencia de pipelines de RL a LLM: el repositorio incluye un notebook de Colab y código de entrenamiento en GitHub, de modo que un instructor puede reproducir el ciclo completo (PPO → destilación → SFT → RL) con un modelo de 0,8B en hardware modesto.
- Sustitución del profesor en el simulador LINK-01: el modelo puede ocupar la posición del *brain.json* en el bucle de decisión del simulador web y mantener el 100 % de éxito en el curso `random`, lo que permite comparar políticas de forma controlada.
- Investigación sobre destilación de políticas: sirve como caso de estudio de cuánta información de una política PPO se conserva al expresar el estado en lenguaje natural, con métricas de coincidencia y de éxito de episodio ya publicadas.
- Pruebas de robustez frente a inyección de prompt: al recibir el estado como texto libre, es un banco de pruebas para evaluar si el *system prompt* de "tratar el estado como datos" se respeta en dominios de decisión.
- Evaluación de adaptadores LoRA pequeños: permite medir el coste de entrenamiento y el rendimiento de un adaptador sobre un base de 0,8B en una tarea de clasificación de cuatro clases, como referencia para proyectos similares.
- Prototipado de controladores simbólicos para robótica educativa: en talleres de robótica, el modelo puede integrarse como capa de decisión de alto nivel que traduce observaciones a comandos discretos antes de pasar a un controlador de bajo nivel.
- No se recomienda su uso en atención al cliente, generación de código, matemáticas ni generación de texto abierta: el adaptador está especializado en una única tarea de clasificación.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados, medidos sobre el conjunto de test (131 problemas) y sobre 20 episodios del mismo curso (semillas 91001–91020). La evaluación de marcha usa una aproximación 2D basada en una tabla de velocidades por comando, no el simulador MuJoCo completo, según indica el propio autor.

| Modelo | Acierto en test (misma respuesta que el profesor) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Profesor (PPO) | 100,0 % | 100 % | 0 % | 7,7 s |
| Antes del entrenamiento | 0,8 % | 0 % | 0 % | — |
| SFT (LoRA) | 100,0 % | 100 % | 0 % | 7,7 s |
| RL (PPO + KL) | 100,0 % | 100 % | 0 % | 7,7 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo base de 0,8B en FP16 requiere del orden de 1,6 GB solo para pesos, más el adaptador LoRA y el contexto; en cuantización de 4 bits el peso baja a menos de 1 GB, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponibles. Por tamaño, el modelo debería caber en cualquier GPU consumer con al menos 4 GB de VRAM en FP16, pero no se documenta ninguna prueba.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del base, aunque no hay confirmación del autor.
- Opciones de despliegue: la model card solo documenta `transformers` + `peft` (`PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; la integración con llama.cpp requeriría fusionar el adaptador con el base y convertir a GGUF, paso no documentado.
- Latencia y throughput: no disponibles. El autor reporta un tiempo medio de 7,7 s por episodio exitoso, pero es el tiempo de la marcha simulada, no la latencia de inferencia del modelo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA para decisión robótica sobre LLM pequeños). La comparación más directa es con el propio profesor PPO y con las variantes del pipeline, ya recogidas en la tabla de benchmarks.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | 0,8B (base) + LoRA | No disponible | 100 % acierto en test; 100 % éxito en 20 episodios | Apache 2.0 | Hugging Face, 15 descargas |
| Profesor PPO (`brain.json`) | No aplica (política RL) | No aplica | 100 % acierto; 100 % éxito | No disponible | Código en GitHub |
| Qwen/Qwen3.5-0.8B (base sin adaptador) | 0,8B | No disponible | 0,8 % acierto en la tarea | No disponible en la información | Hugging Face |

## Limitaciones y advertencias

- Especialización extrema: el modelo solo responde a la tarea `choose_object` con cuatro opciones; fuera de ese formato su comportamiento no está caracterizado.
- Evaluación sobre aproximación 2D: la propia model card advierte que la marcha se puntúa con una tabla de velocidades por comando y no con el simulador MuJoCo completo, por lo que los resultados pueden diferir del entorno real.
- Advertencia explícita del autor: es un modelo de investigación y educación sobre simulador; debe revalidarse en el robot y el espacio concretos antes de cualquier uso real.
- Riesgo de alucinación: no evaluado; al estar entrenado para emitir una letra, es esperable que ante entradas fuera de distribución devuelva una opción válida aunque no sea la correcta, sin señal de incertidumbre.
- Sesgos: no documentados; el dataset se genera a partir de una única política PPO en un curso `random`, por lo que hereda cualquier sesgo de esa política y del simulador.
- Limitaciones de idioma: entrenado en coreano con instrucciones en inglés; no hay evidencia de generalización a otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base Qwen/Qwen3.5-0.8B debe verificarse por separado, ya que no se detalla en la información disponible.
- Caveat de producción: el adaptador no incluye el código de integración con el simulador; la función `Q.task_of` procede del paquete `connect_tycoon`, que hay que instalar desde el repositorio de GitHub.
- Métricas limitadas: solo se reportan acierto en test y éxito en 20 episodios; no hay evaluación de calibración, robustez ante ruido en sensores ni latencia de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pluskkm79/connectailab-rl-jay-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código (CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
