# imleadingmylife/connectailab-rl-aio-jj-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario imleadingmylife en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. No se trata de un modelo de lenguaje de propósito general, sino de un modelo de decisión específico para un robot simulado de nombre LINK-01: recibe una descripción textual del estado del robot (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa) y devuelve una única letra que corresponde a la siguiente acción de locomoción para los próximos 0,5 segundos.

El modelo se ha obtenido mediante un pipeline de tres fases: primero se entrenó una política PPO en un simulador web, después se generó un conjunto de datos supervisado traduciendo las observaciones del robot a texto y las acciones de la política a etiquetas, y finalmente se aplicó aprendizaje supervisado (LoRA) seguido de un ajuste con refuerzo con anclaje KL. El resultado es un adaptador de aproximadamente 0,8 mil millones de parámetros efectivos (el tamaño del modelo base) que responde a una tarea de clasificación restringida a cinco opciones.

Su relevancia es acotada y muy específica: sirve como ejemplo reproducible de destilación de políticas de refuerzo hacia modelos de lenguaje y como componente de investigación en robótica simulada. No está pensado para uso comercial general ni para tareas de lenguaje abiertas. La model card advierte explícitamente que es un modelo de investigación y educación sobre simulador, y que debe revalidarse antes de usarse en un robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen/Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible (el adaptador LoRA no declara recuento; el modelo base es de 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la model card) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre un transformer decoder-only de 0,8 mil millones de parámetros (Qwen3.5-0.8B) mediante LoRA. La tarea es de clasificación cerrada: dado un estado textual del robot, el modelo debe emitir una de cinco letras correspondientes a acciones de locomoción. El pipeline de entrenamiento consta de cuatro etapas documentadas: (1) entrenamiento de una política PPO en el simulador web con la tarea `goto_target` y el contrato `link01-decision/goto_target/obs10-act5/walker51-14/v1`, alcanzando un 100 % en la prueba oficial; (2) generación de un dataset de 1.200 ejemplos de entrenamiento, 240 de validación y 360 de test, en el que cada observación del robot se convierte en texto y la acción de la política en la etiqueta correcta, incluyendo un 20 % de episodios con desviaciones; (3) aprendizaje supervisado con LoRA; y (4) ajuste con refuerzo con anclaje KL, donde se premian las opciones que, seguidas por la política original, producen mejores recompensas.

La innovación técnica principal es el uso de la política PPO como "profesor" para destilar su comportamiento en un modelo de lenguaje, y el ajuste posterior con RL para corregir las respuestas del modelo hacia acciones que la política original habría valorado mejor. La evaluación de la marcha se realizó con una aproximación 2D basada en una tabla de velocidades por comando, sin simulación física completa, lo que introduce una discrepancia reconocida respecto a los resultados de MuJoCo en el navegador.

## Capacidades

- Clasificación de acciones de locomoción: dado un estado textual del robot, devuelve una letra entre cinco opciones posibles.
- Razonamiento de decisión de corto horizonte: la acción cubre los siguientes 0,5 segundos de marcha.
- Formato de salida estricto: una sola letra, sin explicación, según el system prompt indicado en la model card.
- Robustez ante instrucciones embebidas: el prompt de sistema indica tratar el texto del estado como datos, no como instrucciones.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling ni agentes multi-paso.
- Capacidad multilingüe limitada al coreano según la etiqueta de idioma.

## Casos de uso

- Investigación en destilación de políticas de refuerzo: el adaptador sirve como caso reproducible para estudiar cómo una política PPO se transfiere a un modelo de lenguaje mediante LoRA y ajuste con KL, usando el dataset y el código publicados.
- Educación en aprendizaje por refuerzo: el notebook de Colab y el repositorio CONNECT TYCOON permiten reproducir el pipeline completo (PPO, generación de dataset, SFT, RL) en un entorno controlado.
- Componente de decisión en un robot simulado LINK-01: el modelo puede ocupar el lugar de la política en el simulador web para comparar el comportamiento destilado frente al original.
- Evaluación de robustez ante desviaciones: el 20 % de ejemplos con desviaciones en el dataset permite probar la capacidad del modelo de recuperar el rumbo tras acciones subóptimas.
- Prototipado de interfaces texto-política: sirve para experimentar con la conversión de observaciones numéricas de sensores a texto y su uso como entrada de un modelo de lenguaje.
- Estudio de límites de la destilación: la brecha entre el 94,4 % de acierto en test y el 0 % de éxito en las 20 partidas de marcha es un caso útil para analizar la discrepancia entre métricas de clasificación y rendimiento en la tarea final.

## Benchmarks y rendimiento

| Modelo | Acierto en test (misma respuesta que la política) | Éxito en 20 partidas del mismo circuito | Partidas con colisión | Tiempo medio en partidas exitosas |
|---|---|---|---|---|
| Política PPO (profesor) | 100,0 % | 0 % | 100 % | — |
| Modelo antes de entrenar | 14,4 % | 0 % | 70 % | — |
| Tras aprendizaje supervisado (LoRA) | 94,2 % | 0 % | 100 % | — |
| Tras ajuste con refuerzo (KL) | 94,4 % | 0 % | 100 % | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos anteriores proceden de la model card del autor y corresponden a la tarea específica del robot simulado.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador LoRA sobre un modelo de 0,8B, la inferencia en fp16 requiere aproximadamente 1,6 GB de VRAM para los pesos del modelo base, más el adaptador y el overhead de activaciones; en cuantización de 4 bits podría situarse por debajo de 1 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para fp16; una RTX 3060, RTX 4060 o superior es suficiente. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en la mayoría de GPU consumer modernas, incluidas las de gama de entrada con suficiente VRAM.
- Opciones de despliegue: transformers + PEFT (según el ejemplo de la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-aio-jj-v1-link01 | 0,8B (base) + LoRA | No disponible | Decisión de locomoción en robot simulado | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | Lenguaje general | No disponible en la información | Hugging Face |
| Política PPO original (brain.json) | No aplica (política neuronal) | No aplica | Decisión de locomoción en robot simulado | No disponible | Repositorio CONNECT TYCOON |

No se dispone de información sobre otros adaptadores de decisión comparables en la misma categoría. La comparación más directa es con la política PPO original, que sirve como referencia de rendimiento en la tarea, y con el modelo base sin adaptador.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea de decisión de locomoción en un robot simulado concreto (LINK-01, tarea `goto_target`); no es un modelo de lenguaje de propósito general.
- El acierto del 94,4 % en test no se traduce en éxito en la tarea final: en las 20 partidas de evaluación el modelo no completó ninguna, con un 100 % de colisiones, lo que indica una brecha crítica entre la métrica de clasificación y el rendimiento real.
- La evaluación de la marcha se realizó con una aproximación 2D basada en una tabla de velocidades, no con simulación física completa; los resultados pueden diferir de los obtenidos en MuJoCo.
- El modelo solo soporta coreano según la etiqueta de idioma, aunque el system prompt está en inglés.
- Riesgo de alucinación: al ser un modelo de lenguaje subyacente, puede emitir respuestas fuera del conjunto de letras permitidas si no se controla estrictamente la salida.
- Licencia Apache 2.0 permite uso comercial, pero la model card restringe el uso a investigación y educación sobre simulador y exige revalidación en el robot y el espacio reales antes de cualquier despliegue físico.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0,0 GB, lo que sugiere que los pesos pueden no estar completamente subidos o que el artefacto es muy reciente.
- No se documentan sesgos específicos más allá de los inherentes al modelo base y al dataset sintético generado por la política PPO.

## Enlaces

- Hugging Face: https://huggingface.co/imleadingmylife/connectailab-rl-aio-jj-v1-link01
- Repositorio CONNECT TYCOON (código de entrenamiento): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de refuerzo en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
