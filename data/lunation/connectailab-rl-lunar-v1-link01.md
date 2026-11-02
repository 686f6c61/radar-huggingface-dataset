# Lunation/connectailab-rl-lunar-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por Lunation dentro del ecosistema CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje generalista: es un modelo de decision para el robot simulado LINK-01, entrenado para leer en texto el estado del robot (distancia al objetivo, direccion, sensores de distancia, velocidad y la decision anterior) y responder con una unica letra que codifica como debe caminar durante los siguientes 0,5 segundos. El objetivo concreto es la tarea `avoid_obstacles` (evitacion de obstaculos) en un simulador de caminata 2D.

El modelo se construye en cuatro fases: primero se entrena una politica PPO en un entorno web de aprendizaje por refuerzo (`ezerai.xyz/robot-lab/world`), que actua como "profesor" (brain.json); despues se generan 1156 ejemplos de entrenamiento, 233 de validacion y 373 de test traduciendo las observaciones del profesor a texto; a continuacion se hace un ajuste supervisado con LoRA sobre Qwen3.5-0.8B; y finalmente se aplica un refinamiento por refuerzo con PPO y penalizacion KL para acercar las respuestas del modelo a las del profesor.

Es relevante como ejemplo de destilacion de politica de RL en un modelo de lenguaje pequeno (0,8B parametros) mediante LoRA, y por su enfoque de evaluacion: se mide tanto la coincidencia con el profesor (67,6% en test) como el exito real en 20 episodios del mismo circuito (30% de exito). El modelo esta etiquetado con idioma coreano, licencia Apache 2.0 y pipeline de reinforcement-learning, y esta pensado para investigacion y educacion en simulador, no para robots reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | no disponible (adaptador LoRA sobre un base de 0,8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3.5-0.8B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se carga sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parametros. El adaptador no modifica la arquitectura del base: anade matrices de bajo rango entrenables y se sirve con la libreria `peft`. El pipeline declarado es `reinforcement-learning`, con tags que incluyen `ppo`, `deep-reinforcement-learning`, `robotics` y `decision-making`.

El proceso de entrenamiento tiene cuatro etapas documentadas por el autor. Primero, una politica PPO ("cerebro" o brain.json) se entrena en el entorno web de CONNECT AI WORLD para la tarea `avoid_obstacles`, con el contrato `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1` y el circuito `70f4be06`, alcanzando un 70% en la prueba oficial. Segundo, se construye un corpus de problemas en texto: cada 0,5 segundos se convierte la observacion del cerebro en un enunciado y la accion elegida en la etiqueta; se incluye un 20% de ejemplos con acciones suboptimas para cubrir desviaciones. Tercero, se hace ajuste supervisado con LoRA para imitar al cerebro. Cuarto, se aplica un refinamiento por refuerzo con PPO y anclaje KL, usando como recompensa el retorno que obtendria el cerebro si continuara desde esa accion, subiendo la probabilidad de opciones mejores que la del profesor y bajando la de las peores.

El corpus resultante tiene 1156 ejemplos de entrenamiento, 233 de validacion y 373 de test. El autor reporta que la tasa de coincidencia maxima alcanzable (el cerebro respondiendo en texto a sus propias observaciones) es del 100%, lo que indica que la traduccion a texto no introduce perdida de informacion en la politica de referencia.

## Capacidades

- Decision de accion discreta: dado un estado textual del robot, devuelve exactamente una letra entre las opciones listadas, sin explicacion.
- Razonamiento de politica de RL destilada: reproduce el comportamiento de una politica PPO entrenada para evitacion de obstaculos.
- Formato de salida estricto: disenado para responder solo con la letra de la opcion, lo que facilita el parseo en pipelines.
- Tratamiento del estado como datos: el prompt de sistema instruye a no interpretar el contenido del estado como instrucciones, mitigando inyeccion de prompt.
- Integracion con `connect_tycoon.link01.questions`: utilidad `Q.task_of("avoid_obstacles", obs)` que transforma observaciones del robot en el formato de pregunta esperado.
- Multilingue: limitado al coreano segun la model card; no se declaran capacidades generales de generacion, codigo o matematicas.
- Tool calling / function calling: no disponible.
- Vision, audio o modo thinking: no disponible.

## Casos de uso

- Investigacion en destilacion de politicas RL: usar el adaptador como caso de estudio de como una politica PPO se puede destilar en un modelo de lenguaje pequeno mediante LoRA y refinamiento con PPO, comparando la curva de aprendizaje supervisado frente a RL.
- Educacion en aprendizaje por refuerzo: el notebook de Colab y el repositorio CONNECT TYCOON permiten reproducir el pipeline completo (entrenamiento del cerebro, generacion de corpus, SFT y RL) en un entorno controlado.
- Benchmark de decision en texto: emplear el conjunto de test de 373 ejemplos para medir la fidelidad de modelos pequenos al imitar una politica de referencia en tareas de decision secuencial.
- Prototipado de agentes simulados: integrar el modelo en un bucle de simulacion 2D para probar politicas de navegacion con obstaculos antes de pasar a un simulador fisico.
- Evaluacion de robustez ante instrucciones en el estado: el prompt de sistema y el formato permiten estudiar como se comporta un modelo pequeno cuando el estado contiene texto potencialmente adversarial.
- Docencia de PEFT: ejemplo practico de carga de un adaptador LoRA con `peft` sobre un base de 0,8B, util para ensenar el flujo `PeftModel.from_pretrained`.
- Comparacion de estrategias de alineacion: analizar el efecto del anclaje KL en la estabilidad del refinamiento por refuerzo sobre un modelo ya ajustado por supervisado.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card. La metrica "acierto en test" mide la coincidencia con la respuesta del cerebro profesor en los 373 ejemplos de test; "exito en 20 episodios" mide completar el circuito `70f4be06` con semillas 91001-91020 en una aproximacion 2D de la caminata.

| Modelo | Acierto en test | Exito en 20 episodios | Episodios con colision | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro profesor (PPO) | 100,0% | 100% | 0% | 24,9 s |
| Base sin entrenar | 42,1% | 0% | 10% | no disponible |
| Ajuste supervisado (LoRA) | 66,2% | 10% | 25% | 30,2 s |
| Refinamiento RL (modelo publicado) | 67,6% | 30% | 35% | 33,2 s |

El autor advierte que la evaluacion de caminata usa una tabla de velocidades por comando derivada del simulador web MuJoCo, sin modelo fisico ni red de caminata, por lo que no hay caidas y los resultados pueden diferir de MuJoCo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al tratarse de un adaptador sobre un base de 0,8B, la inferencia en fp16 requiere aproximadamente 1,6 GB de pesos mas overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM deberia poder cargar el base en fp16; para cuantizacion en 4 bits, GPUs con 2-3 GB pueden ser suficientes.
- Cabe en GPU consumer: si, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares; no se han publicado pruebas concretas.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado por el autor); llama.cpp, Ollama, vLLM o TGI no estan documentados para este adaptador.
- Latencia y throughput: no disponibles. El modelo genera una unica letra por consulta, por lo que la latencia dominante sera la del prefill del prompt de estado.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la misma categoria (destilacion de politica RL en modelo de lenguaje para robot simulado). Se comparan a continuacion las variantes internas del propio desarrollo:

| Variante | Base | Entrenamiento | Acierto en test | Exito en 20 episodios | Licencia |
|---|---|---|---|---|---|
| Cerebro profesor (PPO) | Politica RL nativa | PPO en simulador web | 100,0% | 100% | no disponible |
| Ajuste supervisado | Qwen3.5-0.8B + LoRA | SFT | 66,2% | 10% | Apache 2.0 |
| Modelo publicado | Qwen3.5-0.8B + LoRA | SFT + PPO con KL | 67,6% | 30% | Apache 2.0 |

Comparativa con otros modelos de la misma categoria: no disponible.

## Limitaciones y advertencias

- Ambito muy restringido: solo resuelve la tarea `avoid_obstacles` del robot LINK-01 en el simulador; no es un modelo de proposito general.
- Brecha respecto al profesor: 67,6% de coincidencia en test y 30% de exito en 20 episodios, frente al 100% del cerebro PPO.
- Tasa de colision elevada: 35% de episodios con colision en la variante RL, superior al 25% del ajuste supervisado y al 0% del profesor.
- Evaluacion aproximada: la caminata se puntua con una tabla de velocidades por comando, sin modelo fisico ni red de caminata, por lo que los resultados pueden no trasladarse a MuJoCo ni a un robot real.
- Idioma: la model card declara solo coreano; no se garantiza comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinacion: el modelo puede devolver una letra no listada o texto adicional si el prompt no se ajusta al formato esperado; el autor exige un system prompt estricto.
- Inyeccion de prompt: aunque el system prompt instruye a tratar el estado como datos, un modelo de 0,8B ofrece garantias limitadas frente a contenido adversarial en el estado.
- Uso en robot real: el propio autor advierte que es un modelo de investigacion y educacion en simulador y que debe revalidarse en el robot y el espacio concretos antes de cualquier uso fisico.
- Licencia Apache 2.0: permite uso comercial, pero la responsabilidad sobre el comportamiento en produccion recae en el integrador.
- Sin datos publicados de cuantizacion, contexto ni benchmarks generales (MMLU, HumanEval, GSM8K).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lunation/connectailab-rl-lunar-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de codigo CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno de aprendizaje web: https://www.ezerai.xyz/robot-lab/world/
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
