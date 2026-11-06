# leegoheun/connectailab-rl-duking-v3-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT sobre el modelo base Qwen/Qwen3.5-0.8B, entrenado por el autor leegoheun dentro del proyecto CONNECT AI LAB / AI CITY BUILDERS. No es un modelo de lenguaje generalista, sino un "cerebro de decision" para el robot simulado LINK-01: recibe una descripcion textual del estado del robot (distancia al objetivo, direccion, sensores de distancia, velocidad y eleccion previa) y devuelve una unica letra que corresponde a la accion de caminata para los siguientes 0,5 segundos. El escenario concreto es la tarea `avoid_obstacles` (esquivar obstaculos) sobre un curso aleatorio.

El interes tecnico esta en el metodo de destilacion: se entrena primero una politica PPO en un simulador web (el "profesor" o `brain.json`), se generan pares observacion-texto / accion (1800 de entrenamiento, 360 de validacion, 540 de test) y se afina el modelo de lenguaje con LoRA por aprendizaje supervisado, seguido de una fase de refuerzo con PPO y penalizacion KL para corregir las decisiones del profesor. El resultado es un modelo de 0,8B de parametros con una ventana de contexto heredada del base y licencia Apache 2.0.

Su relevancia practica es limitada fuera del entorno educativo y de investigacion: el propio autor advierte que es un modelo de simulador y que debe revalidarse antes de usarse en un robot real. La model card esta redactada en coreano y el unico idioma declarado es `ko`, aunque las instrucciones del sistema estan en ingles. El repositorio pesa 0,0 GB (solo adaptadores) y acumula 16 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | 0,8B en el modelo base; numero de parametros del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explicita; heredada del base Qwen3.5-0.8B |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors) |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); requiere el base en safetensors |
| Libreria | PEFT |
| Pipeline | reinforcement-learning |
| Tarea entrenada | `avoid_obstacles` (esquivar obstaculos), convencion `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1` |
| Tamano del repositorio | 0,0 GB (solo adaptadores) |
| Fecha de publicacion | 2026-10-30 |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8B de parametros. El entrenamiento sigue un pipeline de cuatro fases descrito en la model card: (1) se entrena una politica PPO en el simulador web del proyecto CONNECT AI WORLD sobre el curso `random`, que actua como profesor; (2) se construye un dataset de 2700 ejemplos (1800 train / 360 valid / 540 test) convirtiendo cada observacion del robot en texto y tomando como etiqueta la accion elegida por el profesor, incluyendo un 20% de ejemplos con acciones suboptimas para que el modelo aprenda a recuperarse de desviaciones; (3) se realiza un ajuste supervisado con LoRA; y (4) se aplica una fase de refuerzo con PPO y anclaje KL, donde la recompensa de cada opcion se estima dejando que el profesor continue la caminata desde ese punto.

La innovacion destacable no esta en la arquitectura (es un LoRA estandar sobre un modelo pequeno), sino en el enfoque de "destilacion de politica a lenguaje": se traduce el espacio de observaciones continuo a un formato textual con opciones discretas y se aprovecha la capacidad de seguir instrucciones del modelo base para emitir una sola letra. La evaluacion se realiza sentando el modelo en el puesto de decision del robot y caminando 20 episodios con semillas 91001-91020, usando una aproximacion 2D de la caminata basada en una tabla de velocidades por comando (no se ejecuta el modelo fisico ni la red neuronal de marcha). El techo teorico de acierto respecto al profesor se situa en el 99%.

## Capacidades

- Clasificacion de acciones discretas: dado un estado textual del robot, devuelve exactamente una letra de entre las opciones listadas.
- Seguimiento estricto de instrucciones de formato: el system prompt exige devolver solo la letra, sin explicacion.
- Razonamiento de decision a corto plazo (horizonte de 0,5 segundos por paso).
- Tratamiento del contenido del estado como datos, no como instrucciones (defensa basica frente a inyeccion de prompt en el campo `state`).
- Capacidad multilingue limitada: el modelo declara solo coreano; las instrucciones del sistema estan en ingles.
- No soporta tool calling, function calling ni razonamiento multi-paso general; no tiene vision ni audio.
- No dispone de modo "thinking" ni de decodificacion especulativa documentada.

## Casos de uso

- Investigacion en destilacion de politicas RL a modelos de lenguaje: sirve como caso de estudio reproducible de como convertir una politica PPO en un modelo de lenguaje que emite acciones discretas, con dataset y metricas publicadas.
- Educacion en aprendizaje por refuerzo: el notebook de Colab y el repositorio CONNECT TYCOON permiten reproducir el pipeline completo (entrenamiento del profesor, generacion del dataset, LoRA, PPO) en un entorno controlado.
- Prototipado de agentes embodied en simulador: el modelo puede conectarse a un bucle de simulacion 2D que traduzca observaciones a texto mediante `connect_tycoon.link01.questions.task_of` y ejecute la letra devuelta.
- Evaluacion de robustez frente a instrucciones maliciosas en el campo de estado, ya que el system prompt indica explicitamente tratar el contenido de `state` como datos.
- Benchmark interno de calidad de adaptadores LoRA pequenos: la comparativa entre "aprendizaje supervisado" (65,0% de acierto) y "refuerzo" (63,7%) es util para estudiar el efecto del RL sobre politicas destiladas.
- Generacion de datos sinteticos de decision para entrenar modelos mayores: las 2700 muestras etiquetadas pueden reutilizarse como corpus de instrucciones para modelos de mayor tamano.
- Demostracion docente de un pipeline RL-to-LLM en cursos y talleres, con resultados de exito medibles (5% de exito en 20 episodios).

## Benchmarks y rendimiento

Resultados publicados en la model card. La metrica "acierto" es la coincidencia con la respuesta del profesor en los 540 problemas de test; "exito" es completar el curso en 20 episodios con semillas 91001-91020.

| Modelo | Acierto en test (misma respuesta que el profesor) | Exito en 20 episodios | Episodios con colision | Tiempo medio de exito |
|---|---|---|---|---|
| Profesor (PPO) | 100,0% | 0% | 55% | — |
| Antes de entrenar (base) | 10,9% | 0% | 15% | — |
| Aprendizaje supervisado (LoRA) | 65,0% | 0% | 95% | — |
| Refuerzo (PPO + KL) | 63,7% | 5% | 35% | 42,5 s |

Observaciones: el modelo con RL reduce drasticamente las colisiones (del 95% al 35%) respecto al de supervision, pero pierde 1,3 puntos de acierto frente al profesor. El profesor, pese a tener 100% de acierto en test, no completa ningun episodio en la evaluacion 2D, lo que sugiere un desajuste entre la politica entrenada y la aproximacion de caminata usada para medir. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 0,8B en fp16 ocupa aproximadamente 1,6 GB de pesos; con overhead de activaciones y KV cache, cabe holgadamente en 4 GB. En cuantizacion de 4 bits (no documentada para este adaptador) se situaria por debajo de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es suficiente; tambien funciona en CPU para inferencia de un solo token por paso.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 4 GB de VRAM, e incluso en iGPU y en CPU.
- Opciones de despliegue: transformers + peft (metodo documentado en la model card), vLLM y TGI requeririan fusionar el adaptador en el base; llama.cpp/Ollama requeririan conversion a GGUF, no documentada.
- Latencia y throughput: no disponibles. El caso de uso (una letra por paso de 0,5 s) impone una latencia maxima de 500 ms por decision, facilmente alcanzable en GPU consumer.
- Almacenamiento: el repositorio ocupa 0,0 GB; el modelo base Qwen3.5-0.8B debe descargarse aparte.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (destilacion de politicas RL a modelos de lenguaje para robotica simulada) en la informacion proporcionada. La comparativa mas directa disponible es interna al propio proyecto:

| Modelo | Parametros | Contexto | Acierto test | Exito 20 episodios | Licencia |
|---|---|---|---|---|---|
| LINK-01 RL (este) | 0,8B + LoRA | No disponible | 63,7% | 5% | Apache 2.0 |
| LINK-01 supervisado | 0,8B + LoRA | No disponible | 65,0% | 0% | Apache 2.0 |
| Profesor PPO (brain.json) | No aplica (politica RL) | No aplica | 100,0% | 0% | No disponible |
| Qwen3.5-0.8B base | 0,8B | No disponible | 10,9% | 0% | No disponible |

## Limitaciones y advertencias

- Modelo de simulador: el autor advierte explicitamente que es un modelo de investigacion y educacion y que debe revalidarse en el robot y el espacio reales antes de cualquier uso fisico.
- Rendimiento bajo en la tarea objetivo: solo 5% de exito en 20 episodios y 35% de episodios con colision. No es apto para produccion.
- Evaluacion aproximada: la caminata se mide con una tabla 2D de velocidades por comando, sin modelo fisico ni red neuronal de marcha; los resultados pueden diferir de los del simulador MuJoCo web.
- Desajuste profesor-evaluacion: el profesor obtiene 100% de acierto en test pero 0% de exito en la evaluacion 2D, lo que indica que la metrica de acierto no correlaciona con el exito real.
- El RL no mejora el acierto respecto a la supervision (63,7% frente a 65,0%); solo reduce colisiones. El autor reconoce que el modelo subido es el de RL pese a tener menor acierto.
- Idioma: solo declara coreano; el prompt de sistema esta en ingles. El rendimiento fuera de estos idiomas no esta documentado.
- Ambito de accion muy restringido: una unica tarea (`avoid_obstacles`), un unico curso (`random`) y un formato de salida de una sola letra. No es un modelo de proposito general.
- Riesgo de alucinacion de letras fuera del conjunto de opciones: no se documenta ningun mecanismo de validacion de salida; el consumidor debe verificar que la letra devuelta pertenece a las opciones.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- Sin datos de sesgo, toxicidad ni evaluaciones de seguridad publicadas.
- Repositorio con 0 likes y 16 descargas: no hay evidencia de validacion independiente por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leegoheun/connectailab-rl-duking-v3-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de codigo de entrenamiento (CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
