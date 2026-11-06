# lucyhome/connectailab-rl-lucy-choose-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario lucyhome bajo el paraguas de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de propósito general: es un modelo de decisión específico para un robot simulado llamado LINK-01, entrenado para responder con una única letra entre varias opciones de acción. El modelo recibe en texto la situación actual del robot (distancia al objetivo, dirección, lectores de distancia, velocidad y elección previa) y devuelve la letra de la acción que debe ejecutar durante los siguientes 0,5 segundos de marcha.

El entrenamiento combina tres fases: primero se entrena una política PPO en un simulador web (el "cerebro" o brain.json), después se generan pares observación-respuesta a partir de las decisiones de esa política, se hace un ajuste supervisado con LoRA sobre Qwen3.5-0.8B y finalmente se aplica un refinamiento por refuerzo con restricción KL para alejar al modelo de las peores opciones y acercarlo a las mejores. La tarea concreta documentada es `choose_object`, con observaciones de 26 dimensiones y 4 acciones posibles.

El interés del modelo es fundamentalmente metodológico y educativo: muestra un pipeline completo de destilación de una política de refuerzo en un modelo de lenguaje pequeño mediante LoRA, con evaluación sobre 20 episodios de un mismo recorrido. Su alcance es muy limitado (un único robot, un único tipo de tarea, idioma coreano) y no está pensado para uso en producción fuera del simulador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen/Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parámetros totales | 0,8B en el modelo base; el adaptador LoRA no declara recuento propio |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador se carga con `PeftModel.from_pretrained` sobre el modelo base y se usa con `transformers`. El pipeline de entrenamiento tiene cuatro etapas documentadas: (1) entrenamiento de una política PPO en el simulador web de CONNECT AI WORLD para la tarea `choose_object` (observación de 26 dimensiones, 4 acciones, curso `1fe083f4`); (2) generación de un conjunto de problemas a partir de las observaciones del "cerebro" durante un recorrido, con la respuesta de la política como etiqueta y un 20 % de ejemplos con desviaciones deliberadas; (3) ajuste supervisado del modelo de lenguaje con LoRA para imitar al cerebro; y (4) refinamiento por refuerzo con PPO y anclaje KL, donde la recompensa de cada opción se estima como el retorno que habría obtenido el cerebro si hubiera elegido esa opción y el resto lo hubiera decidido la política.

El conjunto de datos resultante tiene 398 ejemplos de entrenamiento, 67 de validación y 136 de test. La evaluación se realiza colocando el modelo de decisión en el puesto de mando del robot y recorriendo el mismo circuito durante 20 episodios con semillas 91001 a 91020. La métrica de éxito se mide con una aproximación 2D de la marcha (tabla de velocidades por comando), no con el simulador MuJoCo completo, lo que el propio autor advierte que puede diferir de los resultados web.

## Capacidades

- Generación de una única letra de respuesta a partir de un estado del robot descrito en texto, sin explicación adicional.
- Decisión de acción de bajo nivel para el robot simulado LINK-01 en la tarea `choose_object`.
- Seguimiento de instrucciones de sistema estrictas (devolver solo la letra de la opción elegida).
- Tratamiento del contenido del estado como datos y no como instrucciones (el prompt de sistema lo indica explícitamente).
- Comprensión de coreano, idioma en el que se documenta y se plantea el caso de uso.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación sobre destilación de políticas RL en modelos de lenguaje: el modelo sirve como ejemplo reproducible de cómo convertir una política PPO en un adaptador LoRA mediante ajuste supervisado más refinamiento por refuerzo, con código y notebook de Colab disponibles.
- Educación en aprendizaje por refuerzo: el repositorio CONNECT TYCOON y el curso de AI CITY BUILDERS usan este modelo como caso práctico para explicar PPO, LoRA y evaluación de políticas en entornos simulados.
- Prototipado de controladores de decisión para robots simulados: el adaptador puede colocarse en el puesto de decisión de LINK-01 dentro del simulador web para probar variantes del circuito sin reentrenar la política original.
- Evaluación de la fidelidad de la destilación: al comparar la respuesta del modelo con la del cerebro original sobre los 136 ejemplos de test, se puede medir cuánto se pierde al sustituir una política numérica por un modelo de lenguaje.
- Generación de datos sintéticos de decisión: el modelo puede producir etiquetas de acción para nuevas observaciones del robot, que después se filtran o se comparan con la política original.
- Docencia y divulgación: el modelo y su model card sirven como material didáctico para explicar el ciclo completo de un proyecto de RL aplicado a robótica simulada, desde el entrenamiento de la política hasta el despliegue del adaptador.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, sobre el conjunto de test (136 problemas) y sobre 20 episodios del mismo circuito:

| Modelo | Acierto en test (misma respuesta que el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio de episodio exitoso |
|---|---|---|---|---|
| Cerebro (profesor, PPO) | 100,0 % | 100 % | 0 % | 7,4 s |
| Modelo sin entrenar | 94,9 % | 100 % | 0 % | 7,4 s |
| Ajuste supervisado (LoRA) | 100,0 % | 100 % | 0 % | 7,4 s |
| Refuerzo (PPO + KL) | 100,0 % | 100 % | 0 % | 7,4 s |

El autor indica que el techo de acierto es del 100 % porque las observaciones se traducen a texto sin pérdida de información. No se han publicado resultados en benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del modelo base (0,8B) se puede inferir en GPUs de consumo, pero no se han publicado cifras concretas.
- GPU recomendadas: no disponible.
- Cabida en GPU de consumo: no confirmado en la documentación, aunque el tamaño del modelo base lo hace plausible.
- Opciones de despliegue: `transformers` con `peft` (el método documentado en la model card). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es un adaptador LoRA específico para una tarea de decisión de un robot simulado concreto, por lo que no existe una categoría estándar de comparación publicada.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-lucy-choose-v1-link01 | 0,8B (base) + LoRA | no disponible | 100 % en test propio (136 ejemplos) | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está entrenado para una única tarea (`choose_object`) y un único robot simulado (LINK-01); no generaliza a otras tareas, robots o entornos.
- La evaluación de la marcha usa una aproximación 2D con tabla de velocidades por comando, no el simulador MuJoCo completo; los resultados pueden diferir del entorno web real.
- El autor advierte explícitamente que es un modelo de investigación y educación sobre simulador y que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- El idioma documentado es únicamente coreano.
- Riesgo de alucinación no evaluado: el modelo devuelve una letra entre las opciones, pero no se documenta qué ocurre si el estado de entrada está fuera de distribución.
- El conjunto de test es muy pequeño (136 ejemplos) y el techo de acierto es del 100 %, lo que limita la capacidad de discriminar entre variantes del modelo.
- No se documentan sesgos, comportamiento fuera de distribución ni robustez ante entradas malformadas.
- Aunque la licencia es Apache 2.0, el uso comercial no está descrito ni validado por el autor; el modelo se presenta como material educativo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de adopción externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lucyhome/connectailab-rl-lucy-choose-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de refuerzo en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
