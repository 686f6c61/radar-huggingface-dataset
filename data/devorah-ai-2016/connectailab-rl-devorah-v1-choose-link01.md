# devorah-ai-2016/connectailab-rl-devorah-v1-choose-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el autor independiente devorah-ai-2016 en el marco del laboratorio CONNECT AI LAB. El modelo resuelve una tarea muy concreta: dado el estado textual de un robot caminante de dos dimensiones (distancia al objetivo, dirección, sensores de distancia, velocidad y elección previa), debe elegir una de cuatro acciones posibles para los siguientes 0,5 segundos de marcha, respondiendo con una única letra. Se trata, por tanto, de un modelo de decisión de política (policy) destilado desde un cerebro entrenado con PPO.

La relevancia del modelo es acotada pero interesante como ejercicio de destilación de políticas de refuerzo hacia un modelo de lenguaje: el autor entrena primero un agente PPO en un simulador web de MuJoCo, genera un conjunto de problemas a partir de las observaciones del agente y entrena el LLM mediante supervisión (LoRA) y un paso posterior de refinamiento con refuerzo (PPO con penalización KL). El resultado es un modelo de 0,8 mil millones de parámetros que imita la política del profesor con un 96,1 % de coincidencia en el conjunto de test.

Es un modelo de nicho, con solo 14 descargas y sin likes, orientado a investigación y educación en robótica simulada y aprendizaje por refuerzo. No está pensado como asistente general ni como modelo conversacional; su formato de salida es rígido (una letra entre las opciones listadas) y su idioma declarado es el coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones (modelo base) + adaptador LoRA (tamano no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo solo distribuye safetensors del adaptador) |
| Idiomas soportados | Coreano (ko) declarado; las instrucciones del sistema estan en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA); requiere el modelo base Qwen/Qwen3.5-0.8B |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador se ha entrenado en dos fases. En la primera, se generó un conjunto de datos a partir de las observaciones de un agente PPO entrenado en un simulador web (tarea `choose_object`, curso `random`, con un 45 % de éxito en la prueba oficial). Cada 0,5 segundos se registraba la observación textual y la acción elegida por el profesor, incluyendo un 20 % de casos donde el agente se desviaba. El conjunto resultante tiene 589 ejemplos de entrenamiento, 97 de validación y 233 de test. Sobre estos datos se aplicó un ajuste supervisado con LoRA.

En la segunda fase se aplicó refuerzo (PPO) con una penalización KL para mantener el modelo cerca de la política supervisada, recompensando las acciones que, seguidas de la política del profesor, producían mejores resultados. La evaluación se realizó colocando el modelo en el puesto de decisión del robot y ejecutando 20 episodios (semillas 91001–91020) con una aproximación 2D de la marcha basada en una tabla de velocidades por comando, sin red neuronal de marcha ni modelo físico del robot. El autor indica que esta aproximación puede diferir de los resultados en MuJoCo web.

## Capacidades

- Decisión de política en un espacio de acciones discreto de cuatro opciones para el robot LINK-01.
- Interpretación de observaciones textuales estructuradas (distancia, dirección, sensores, velocidad, elección previa).
- Salida restringida a una única letra correspondiente a la opción elegida, sin explicación.
- Soporte de instrucciones de sistema para delimitar el comportamiento (tratar el estado como datos, no como instrucciones).
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni razonamiento general.
- Multilingüe limitado: declarado coreano; las instrucciones de sistema están en inglés.

## Casos de uso

- Investigación en destilación de políticas de RL: el modelo sirve como ejemplo reproducible de cómo destilar un agente PPO en un LLM mediante LoRA y PPO, útil para estudiar la fidelidad de la imitación (96,1 % de coincidencia con el profesor en test).
- Educación en robótica simulada: permite a estudiantes ejecutar el cuaderno de Colab del autor y observar cómo un LLM toma decisiones de marcha a partir de observaciones textuales.
- Evaluación de robustez de políticas destiladas: el conjunto de test incluye casos de desviación (20 %), lo que permite medir la capacidad del modelo de recuperarse de decisiones subóptimas.
- Prototipado de controladores basados en lenguaje para robots de bajo coste (SO-101, MuJoCo): el modelo puede integrarse como módulo de decisión en un bucle de simulación, sustituyendo a la política original.
- Comparación de métodos de ajuste (SFT frente a RL): el autor publica métricas de ambos enfoques, lo que permite usar el modelo como referencia en experimentos comparativos.
- Docencia en aprendizaje por refuerzo: el repositorio connect-tycoon y el cuaderno de Colab permiten reproducir el pipeline completo (entrenamiento del profesor, generación de datos, LoRA, PPO y evaluación).

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Modelo | Acierto en test (misma accion que el profesor) | Exito en 20 episodios | Episodios con colision | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Profesor (cerebro PPO) | 100,0 % | 45 % | 0 % | 8,7 s |
| Antes del entrenamiento | 15,5 % | 60 % | 0 % | 8,7 s |
| Ajuste supervisado (LoRA) | 96,1 % | 25 % | 0 % | 7,8 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8 B en precisión FP16 requiere aproximadamente 1,6 GB de pesos; en cuantización de 8 bits, alrededor de 0,8 GB; en 4 bits, alrededor de 0,4 GB. El adaptador LoRA añade una cantidad marginal (tamaño exacto no disponible).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM puede ejecutar el modelo base en cuantización; una RTX 3060, RTX 4060 o superior es suficiente. Para FP16 sin cuantizar, una GTX 1650 de 4 GB o superior es adecuada.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas, incluso en cuantización de 4 bits.
- Opciones de despliegue: transformers + PEFT (el método documentado por el autor), llama.cpp u Ollama si se convierte el modelo fusionado a GGUF, y vLLM o TGI para servir el modelo fusionado. El adaptador requiere cargar primero el modelo base.
- Latencia y throughput: no disponibles. El modelo base de 0,8 B es de baja latencia, pero no se han publicado mediciones para esta tarea concreta.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (LLM pequeños destilados para control de robots simulados) en la información proporcionada. Como referencia, el propio modelo base Qwen/Qwen3.5-0.8B es el punto de partida, y el profesor PPO original es el referente de rendimiento en la tarea. No se han identificado alternativas públicas con la misma tarea y formato de salida.

## Limitaciones y advertencias

- Modelo de nicho: solo resuelve la tarea `choose_object` del robot LINK-01 en un simulador 2D; no es un asistente general.
- La evaluación de marcha se realizó con una aproximación 2D basada en una tabla de velocidades, no con el simulador MuJoCo completo, por lo que los resultados pueden diferir de la realidad.
- El autor advierte explícitamente que es un modelo de investigación y educación, y que debe revalidarse en el robot y el espacio reales antes de usarse en producción.
- El acierto en test (96,1 %) es inferior al del profesor (100 %), y el éxito en episodios (25 %) es inferior al del profesor (45 %) y al del modelo sin entrenar (60 %), lo que indica que la destilación no reproduce fielmente la política en todos los casos.
- Riesgo de alucinación: el modelo puede devolver una letra no listada o una explicación, aunque el formato de salida está restringido; no se documenta un mecanismo de validación de salida.
- Idioma declarado coreano; las instrucciones de sistema están en inglés, lo que puede afectar a la robustez en otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- Sin datos sobre sesgos, contexto máximo ni cuantizaciones soportadas.

## Enlaces

- HuggingFace: https://huggingface.co/devorah-ai-2016/connectailab-rl-devorah-v1-choose-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web: https://www.ezerai.xyz/robot-lab/world/
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
