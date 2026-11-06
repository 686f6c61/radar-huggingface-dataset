# Luna002-Luna75/connectailab-rl-lunaluna-object-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT publicado por el usuario Luna002-Luna75 bajo el paraguas de CONNECT AI LAB y AI CITY BUILDERS. Se trata de un modelo de decisión para el robot simulado LINK-01: recibe en texto el estado actual del robot (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y elección previa) y devuelve una única letra que indica cómo debe caminar durante los siguientes 0,5 segundos. No es un modelo de lenguaje de propósito general, sino un "cerebro" destilado de una política PPO entrenada en un simulador web.

El modelo se construye en cuatro fases documentadas por el autor: primero se entrena una política PPO en el simulador web (tarea `choose_object`, curso `414f50b2`); después se genera un conjunto de problemas convirtiendo cada observación del robot en texto y usando la acción del cerebro PPO como etiqueta; a continuación se hace ajuste supervisado con LoRA sobre Qwen/Qwen3.5-0.8B; y finalmente se aplica un refinamiento por refuerzo con anclaje KL para subir la probabilidad de opciones mejores que la del profesor y bajar la de las peores.

Es relevante como ejemplo de destilación de políticas de refuerzo en modelos de lenguaje pequeños para robótica simulada y toma de decisiones secuenciales, con un conjunto de datos de 675 ejemplos de entrenamiento, 133 de validación y 204 de test. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y el tamaño del repo es de 0,0 GB (solo pesos del adaptador).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen/Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible (el adaptador LoRA no declara su recuento; el modelo base Qwen3.5-0.8B tiene 0,8 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA montado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador se entrena en cuatro etapas: (1) entrenamiento de una política PPO en el simulador web de CONNECT AI WORLD para la tarea `choose_object`, con el contrato `link01-decision/choose_object/obs26-act4/walker51-14/v1`; (2) generación de un corpus de problemas convirtiendo cada observación del robot en texto cada 0,5 segundos, con la acción del cerebro PPO como respuesta correcta, e incluyendo un 20 % de ejemplos donde el robot se desvió del curso; (3) ajuste supervisado con LoRA para imitar al profesor; y (4) refinamiento por refuerzo con anclaje KL, donde se sube la probabilidad de opciones con recompensa mayor que la del profesor y se baja la de las peores.

El conjunto de datos resultante tiene 675 ejemplos de entrenamiento, 133 de validación y 204 de test. El autor reporta una tasa de coincidencia del 100 % entre el texto y la respuesta del cerebro (techo de acierto), lo que indica que la representación textual de las observaciones no pierde información relevante para la tarea. La evaluación de caminata se hizo con una aproximación 2D basada en una tabla de velocidades por comando, no con el modelo de robot ni con la red neuronal de marcha del simulador web MuJoCo, por lo que los resultados pueden diferir de la simulación original.

## Capacidades

- Toma de decisiones discretas: dado un estado textual del robot (objetivo, sensores, velocidad, elección previa), devuelve una única letra entre las opciones listadas.
- Formato de respuesta estricto: el author indica que debe devolverse solo la letra, sin explicación, bajo un system prompt concreto.
- Robustez ante instrucciones embebidas: el system prompt indica tratar el texto dentro de `state` como datos, no como instrucciones.
- Entrenamiento con refuerzo (PPO) y ajuste supervisado (LoRA) combinados.
- Capacidad multilingüe limitada al coreano según la model card.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Control de robot simulado en tareas de recogida de objetos: el modelo recibe el estado textual del robot y emite la acción de caminata para los siguientes 0,5 segundos, sustituyendo al cerebro PPO en el bucle de decisión.
- Docencia de refuerzo y destilación: sirve como ejemplo reproducible de cómo convertir una política PPO en un modelo de lenguaje pequeño mediante LoRA y RL con anclaje KL, con notebooks de Colab enlazados por el autor.
- Investigación en destilación de políticas: permite estudiar la fidelidad entre la política profesora y el alumno lingüístico, con un conjunto de test de 204 ejemplos y una tasa de coincidencia del 100 % reportada.
- Evaluación de robustez ante estados fuera de distribución: el 20 % de ejemplos con desviaciones del curso permite analizar el comportamiento del modelo cuando el robot no sigue la trayectoria prevista.
- Prototipado de agentes de decisión en entornos discretos: la interfaz de pregunta/respuesta con letras facilita integrar el modelo en pipelines de simulación sin necesidad de un entorno de acción continua.
- Generación de datos sintéticos de decisión: el par observación textual / acción puede reutilizarse para aumentar corpus de entrenamiento en tareas similares de robótica simulada.

## Benchmarks y rendimiento

| Modelo | Acierto en test (coincidencia con el cerebro) | Éxito en 20 episodios del mismo curso | Episodios con colisión | Tiempo medio de los episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0 % | 100 % | 0 % | 13,3 s |
| Antes del entrenamiento | 1,0 % | 0 % | 0 % | — |
| Ajuste supervisado (LoRA) | 100,0 % | 100 % | 0 % | 13,3 s |
| Refuerzo (RL con KL) | 100,0 % | 100 % | 0 % | 13,3 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores proceden de la model card del autor y corresponden a la tarea específica `choose_object`; la evaluación de marcha usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo original.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al tratarse de un adaptador LoRA sobre un modelo base de 0,8 mil millones de parámetros, el consumo vendrá determinado por el modelo base y su cuantización.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del modelo base (0,8 B) sugiere que podría caber en GPU de consumo, pero no se confirma en la información.
- Opciones de despliegue: la model card muestra carga con `transformers` y `peft` (`PeftModel.from_pretrained`). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | Adaptador LoRA sobre Qwen3.5-0.8B | No disponible | Decisión discreta en robótica simulada | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B | No disponible | Lenguaje general | No disponible en la información | Hugging Face |
| Política PPO del simulador (profesor) | No disponible | No aplica | Decisión discreta en robótica simulada | No disponible | Solo dentro del simulador del autor |

No se dispone de información sobre otros adaptadores LoRA o modelos de decisión comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea `choose_object` del simulador LINK-01; no es un modelo de lenguaje de propósito general.
- La evaluación de marcha se hizo con una aproximación 2D basada en una tabla de velocidades por comando, no con el simulador MuJoCo ni con la red de marcha real, por lo que los resultados pueden no trasladarse al simulador original.
- El autor advierte explícitamente de que es un modelo de investigación y educación sobre simulador, y que debe revalidarse en el robot y el espacio reales antes de usarlo en producción.
- El modelo solo declara soporte de coreano; no se documentan otros idiomas.
- El conjunto de test es pequeño (204 ejemplos) y de una única tarea y un único curso (`414f50b2`), lo que limita la generalización a otras tareas o entornos.
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera de distribución más allá del 20 % de ejemplos con desviaciones del curso.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- El repositorio tiene 0 descargas y 1 like, y el tamaño declarado es de 0,0 GB, lo que sugiere que solo contiene el adaptador; es necesario descargar el modelo base para usarlo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Luna002-Luna75/connectailab-rl-lunaluna-object-v1-link01)
- [Modelo base Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Repositorio CONNECT TYCOON (código de entrenamiento)](https://github.com/wonseokjung/connect-tycoon)
- [Notebook de Colab de entrenamiento](https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb)
- [Canal de YouTube CONNECT AI LAB](https://www.youtube.com/@CONNECT-AI-LAB)
- [AI CITY BUILDERS](https://www.aicitybuilders.com)
- [Curso de refuerzo en AI CITY BUILDERS](https://www.aicitybuilders.com/robot)
- [Simulador web CONNECT AI WORLD](https://www.ezerai.xyz/robot-lab/world/)
