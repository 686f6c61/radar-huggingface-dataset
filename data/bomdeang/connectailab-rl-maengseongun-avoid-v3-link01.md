# Bomdeang/connectailab-rl-maengseongun-avoid-v3-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por Bomdeang dentro del ecosistema CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje generalista, sino un modelo de decisión para robótica: recibe una descripción en texto del estado de un robot LINK-01 (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa) y devuelve una única letra que codifica cómo debe caminar durante los siguientes 0,5 segundos. El pipeline declarado es `reinforcement-learning` y la librería es `peft`.

El modelo se entrena en dos fases: primero un ajuste supervisado (LoRA) sobre pares observación-respuesta generados por un "cerebro" PPO entrenado en un simulador web de MuJoCo, y después un refinamiento con aprendizaje por refuerzo (PPO con anclaje KL) que premia las opciones que, seguidas por el cerebro, producen mejores recompensas. La tarea concreta de esta versión es `avoid_obstacles` (evasión de obstáculos) sobre el curso `da6907bd`.

Es relevante como ejemplo de destilación de políticas de RL en modelos de lenguaje pequeños: demuestra que un LM de 0,8 mil millones de parámetros puede sustituir a una política neuronal especializada en un bucle de decisión de robótica simbólica, manteniendo un 100 % de éxito en las 20 pruebas de caminata reportadas. Su utilidad es fundamentalmente educativa y de investigación en simulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen3.5-0.8B tiene 0,8 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Coreano (ko); el prompt de sistema y las opciones de decisión estan en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen3.5 con 0,8 mil millones de parámetros, sobre el que se aplica un adaptador LoRA. El entrenamiento se articula en cuatro pasos documentados por el autor: (1) entrenamiento de un "cerebro" PPO en el simulador web CONNECT AI WORLD para la tarea `avoid_obstacles`, con un 80 % de éxito en el examen oficial; (2) generación de un dataset de problemas a partir de las observaciones que el cerebro ve cada 0,5 segundos durante el curso `da6907bd`, con la respuesta del cerebro como etiqueta y un 20 % de ejemplos con desviaciones; (3) ajuste supervisado del LM con LoRA sobre ese dataset; y (4) refinamiento con RL (PPO) donde cada opción se puntúa por la recompensa obtenida si el cerebro continúa caminando desde ahí, con anclaje KL para no alejarse demasiado de la política supervisada.

El dataset se compone de 1.470 ejemplos de entrenamiento, 298 de validación y 441 de test. La tasa de coincidencia entre la representación textual y la respuesta del cerebro (techo de acierto) es del 100 %, lo que indica que la conversión observación→texto no pierde información relevante. La evaluación final se realiza colocando el modelo de decisión en el puesto de mando del robot y caminando el mismo curso 20 veces con semillas 91001–91020, usando una aproximación 2D de la marcha basada en una tabla de velocidades por comando (sin red neuronal de marcha ni modelo físico del robot).

## Capacidades

- Decisión de acción discreta: dado un estado textual del robot, selecciona exactamente una letra entre las opciones listadas, sin explicación.
- Evasión de obstáculos: política especializada en la tarea `avoid_obstacles` sobre un curso concreto del simulador.
- Seguimiento de instrucciones de formato estricto: respeta el prompt de sistema que exige devolver solo la letra de la opción elegida.
- Robustez ante datos no confiables: el prompt de sistema indica tratar el contenido del estado como datos y no como instrucciones (mitigación básica de inyección de prompt).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada: el modelo está etiquetado solo para coreano, aunque el formato de pregunta y las opciones se presentan en inglés.

## Casos de uso

- Sustitución de políticas RL por un LM en bucles de decisión simulados: el modelo puede ocupar el lugar de la red PPO en el simulador LINK-01 para estudiar si un LM pequeño reproduce el comportamiento de una política especializada, con un 100 % de éxito en las 20 pruebas reportadas.
- Docencia de RL y destilación: sirve como ejemplo completo de pipeline (PPO → dataset textual → SFT LoRA → RL con KL) para cursos de aprendizaje por refuerzo, dado que el autor publica cuadernos de Colab y código en GitHub.
- Prototipado rápido de agentes de decisión en robótica simbólica: al ser un adaptador LoRA de 0,8B, se puede cargar en GPU de consumo y experimentar con nuevas tareas del simulador sin reentrenar desde cero.
- Investigación en interpretabilidad de políticas: al expresar el estado como texto y la acción como letra, permite analizar qué información del estado usa el modelo para decidir.
- Evaluación de robustez ante ruido en la observación: los ejemplos con desviaciones (20 %) permiten probar cómo degrada el modelo cuando la representación textual no coincide exactamente con la del cerebro.
- Generación de datos sintéticos de decisión: el modelo puede producir etiquetas para nuevas observaciones del simulador, que luego se filtran con el cerebro PPO original.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (evaluación sobre 441 problemas de test y 20 episodios de caminata con semillas 91001–91020):

| Modelo | Acierto en test (coincidencia con el cerebro) | Exito en 20 episodios | Episodios con colision | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro PPO (profesor) | 100,0 % | 100 % | 0 % | 32,2 s |
| Modelo sin entrenar | 33,3 % | 0 % | 0 % | — |
| Ajuste supervisado (LoRA) | 85,9 % | 100 % | 0 % | 32,5 s |
| Refinamiento con RL (esta version) | 84,1 % | 100 % | 0 % | 32,4 s |

No se han publicado resultados en benchmarks estandar de LLM (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un modelo base de 0,8B más un adaptador LoRA, es esperable que quepa en GPUs de consumo con cuantización, pero no se documentan cifras.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: probablemente sí por el tamaño del modelo base, aunque el autor no lo confirma.
- Opciones de despliegue: la model card solo muestra el uso con `transformers` + `peft` (`PeftModel.from_pretrained`). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La decisión se emite cada 0,5 segundos en el bucle del simulador, pero no se reportan métricas de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-maengseongun-avoid-v3-link01 | Adaptador LoRA sobre Qwen3.5-0.8B | No disponible | 84,1 % acierto en test; 100 % exito en 20 episodios | Apache 2.0 | HuggingFace (15 descargas) |
| Cerebro PPO original (profesor) | No disponible (red de política) | No aplica | 100 % acierto; 100 % exito en 20 episodios | No especificada | Interno del simulador CONNECT AI WORLD |
| Qwen/Qwen3.5-0.8B (base sin adaptador) | 0,8 mil millones | No disponible | 33,3 % acierto (equivale al modelo sin entrenar) | No disponible en la informacion | HuggingFace |

No se dispone de información sobre otros adaptadores LoRA comparables de la misma familia ni sobre modelos de decisión robótica de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: solo resuelve la tarea `avoid_obstacles` sobre el curso `da6907bd`; no generaliza a otras tareas ni entornos sin reentrenamiento.
- Evaluación aproximada: la marcha se simula con una tabla 2D de velocidades por comando, sin modelo físico ni red de marcha, por lo que los resultados pueden diferir de los de MuJoCo real.
- El refinamiento con RL no mejora al ajuste supervisado en acierto de test (84,1 % frente a 85,9 %), aunque iguala el éxito en episodios; conviene validar cuál de las dos versiones usar en producción.
- Idioma: etiquetado solo para coreano; el prompt de sistema y las opciones están en inglés, lo que puede afectar a la robustez fuera de ese formato exacto.
- Riesgo de alucinación de letra: si el estado se sale de la distribución de entrenamiento, el modelo puede devolver una letra no listada o una opción inválida; no se documenta un mecanismo de validación.
- Sesgos: no se documentan análisis de sesgo; al ser una política entrenada en un simulador concreto, hereda las limitaciones del curso y del cerebro profesor.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el autor advierte que es un modelo de investigación y educación sobre simulador y que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- Sin datos de benchmarks estándar de LLM ni de latencia, lo que dificulta compararlo con alternativas generalistas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Bomdeang/connectailab-rl-maengseongun-avoid-v3-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web CONNECT AI WORLD: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
