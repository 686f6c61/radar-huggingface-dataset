# nexflow/connectailab-rl-coco-v1-link01

## Resumen

LINK-01 es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario nexflow bajo el paraguas de CONNECT AI LAB. No es un modelo de lenguaje generalista: es un modelo de decisión para un robot simulado llamado LINK-01, entrenado para leer el estado actual del robot (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa) y responder con una única letra que indica cómo debe caminar durante los siguientes 0,5 segundos. El pipeline declarado es `reinforcement-learning` y la librería es `peft`, con licencia Apache 2.0.

El entrenamiento sigue una cadena poco habitual: primero se entrena una política PPO en un simulador web (el "cerebro", guardado como `brain.json`) sobre la tarea `avoid_obstacles`; después se generan problemas textuales a partir de las observaciones que ve ese cerebro cada 0,5 segundos; luego se hace aprendizaje supervisado (LoRA) para que el modelo de lenguaje imite las respuestas del cerebro; y finalmente se aplica una fase de RL con penalización KL para empujar al modelo hacia acciones con mayor recompensa que las del propio profesor.

Su relevancia es fundamentalmente metodológica y educativa: demuestra cómo destilar una política de RL en un modelo de lenguaje pequeño (0,8B parámetros) y cómo evaluar esa destilación en el propio entorno de decisión. El alcance es muy acotado: un único idioma (coreano), una única tarea (`avoid_obstacles`) y un simulador 2D aproximado. El repositorio pesa 0,0 GB (solo adaptadores) y acumula 14 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA añade un numero no disponible de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3.5-0.8B |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA montado sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador no modifica la arquitectura del base: añade matrices de bajo rango entrenables que se cargan con `PeftModel.from_pretrained`. La tarea es de clasificación restringida: dado un estado textualizado, el modelo debe emitir exactamente una letra entre las opciones listadas, sin explicación.

El proceso de entrenamiento tiene cuatro etapas documentadas por el autor. (1) Se entrena una política PPO en el simulador web con la tarea `avoid_obstacles`, contrato `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1`, curso `random`, alcanzando un 90% en el examen oficial. (2) Se genera un conjunto de problemas textuales: cada 0,5 segundos se convierte la observación del cerebro en texto y la respuesta del cerebro en la etiqueta; un 20% de los ejemplos corresponden a situaciones en las que el cerebro se desvió. (3) Aprendizaje supervisado con LoRA para imitar al cerebro. (4) RL con una señal de recompensa basada en "qué habría pasado si el modelo eligiera esa opción y el cerebro continuara caminando", con anclaje KL al modelo supervisado. Los volúmenes de datos son 1095 ejemplos de entrenamiento, 207 de validación y 281 de test. La tasa de coincidencia entre la textualización y el cerebro (techo de acierto) es del 100%.

## Capacidades

- Decisión de acción discreta en un entorno de robótica simulado: dado un estado, devuelve una letra de acción.
- Salida estrictamente restringida a una opción de la lista, sin razonamiento visible ni explicación.
- Procesamiento de estado textualizado con instrucción de sistema que trata el contenido del estado como datos, no como instrucciones.
- Tarea única: `avoid_obstacles` (evitación de obstáculos) para el robot LINK-01.
- Idioma: coreano.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni matemáticas.
- No se documenta modo "thinking" ni decodificación especulativa.

## Casos de uso

- Investigación en destilación de políticas RL: usar el adaptador como referencia para estudiar cómo se transfiere una política PPO a un modelo de lenguaje pequeño y qué se pierde en el proceso.
- Evaluación comparativa de métodos de alineación: comparar el adaptador supervisado frente al adaptador tras RL en el mismo entorno de decisión, usando las métricas de éxito y colisiones del autor.
- Docencia en cursos de RL: el repositorio incluye cuaderno de Colab y código de entrenamiento (`connect-tycoon`), lo que permite reproducir el pipeline completo en un aula.
- Simulación de decisión en bucle cerrado: integrar el modelo en el simulador 2D de caminata aproximada para medir tasas de éxito por semilla (91001–91020).
- Generación de datos sintéticos de decisión: emplear el modelo como generador de acciones etiquetadas para ampliar el conjunto de problemas de la tarea `avoid_obstacles`.
- Prototipado de control por lenguaje: experimentar con la interfaz "estado en texto → acción en letra" como paso previo a un controlador real, siempre con revalidación en el robot y el espacio concretos.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (evaluación sobre 281 problemas de test y 20 episodios de caminata con semillas 91001–91020):

| Modelo | Acierto en test (coincidencia con el cerebro) | Exito en 20 episodios | Episodios con colision | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0% | 95% | 10% | 21,3 s |
| Modelo base sin adaptador | 42,3% | 0% | 10% | no disponible |
| Aprendizaje supervisado (LoRA) | 69,0% | 75% | 45% | 24,6 s |
| RL (este adaptador) | 71,9% | 90% | 35% | 26,1 s |

La evaluación de caminata usa una aproximación 2D con tabla de velocidades por comando, no el simulador MuJoCo web, por lo que los resultados pueden diferir ligeramente de este.

## Requisitos de hardware

- Al ser un adaptador sobre un modelo de 0,8B, la VRAM necesaria para inferencia es la del modelo base: aproximadamente 1,6 GB en fp16 y en torno a 0,5–0,6 GB en cuantización de 4 bits (estimación, no publicada por el autor).
- Cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU con llama.cpp tras convertir el modelo base.
- GPU de datacenter (A100, H100) no son necesarias para inferencia; sí pueden usarse para reproducir el entrenamiento.
- Despliegue: `transformers` + `peft` es la vía documentada. vLLM, TGI, llama.cpp y Ollama no están documentados para este adaptador; requerirían fusionar el adaptador con el base.
- Latencia y throughput: no disponibles. La tarea exige una respuesta cada 0,5 segundos en el simulador, pero el autor no publica tiempos de inferencia.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la información proporcionada. Como referencia de categoría, se pueden considerar adaptadores LoRA sobre modelos pequeños para tareas de decisión, pero no se han identificado alternativas concretas con parámetros, contexto y licencia verificables.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nexflow/connectailab-rl-coco-v1-link01 | 0,8B (base) + LoRA | no disponible | Decision `avoid_obstacles` | Apache 2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Alcance extremadamente reducido: una sola tarea (`avoid_obstacles`), un solo robot simulado y un solo curso (`random`).
- Solo coreano; no se documenta soporte multilingüe.
- El rendimiento en test (71,9%) está muy por debajo del profesor (100,0%), y la tasa de colisiones (35%) es superior a la del cerebro (10%).
- La evaluación de caminata usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo; los resultados pueden no reflejar el comportamiento real.
- El modelo no debe usarse en un robot físico sin revalidación en el robot y el espacio concretos, tal como advierte el autor.
- Riesgo de alucinación de opciones no listadas o de formato incorrecto si el prompt no sigue exactamente la plantilla del autor.
- No se documentan sesgos específicos, pero al ser un modelo base coreano de 0,8B puede heredar sesgos del corpus de Qwen.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene sus propios términos que deben respetarse.
- El adaptador requiere cargar el modelo base; no es un modelo autónomo.

## Enlaces

- HuggingFace: https://huggingface.co/nexflow/connectailab-rl-coco-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
