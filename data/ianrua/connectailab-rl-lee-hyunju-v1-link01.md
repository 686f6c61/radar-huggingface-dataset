# ianrua/connectailab-rl-lee-hyunju-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario `ianrua` en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. No es un modelo de lenguaje generalista, sino un modelo de decisión para un robot simulado denominado LINK-01: recibe en texto el estado actual del robot (distancia al objetivo, dirección, lectores de distancia, velocidad y la última acción elegida) y devuelve una única letra correspondiente a la siguiente acción de locomoción para los próximos 0,5 segundos.

La relevancia del artefacto es metodológica más que de rendimiento bruto: ilustra un pipeline completo de destilación de una política de refuerzo (PPO entrenado en un simulador web) hacia un modelo de lenguaje mediante aprendizaje supervisado (LoRA) y un posterior ajuste fino con refuerzo (PPO con anclaje KL). El modelo base aporta la arquitectura transformer y el tokenizador; el adaptador contiene únicamente los pesos modificados por LoRA, por lo que el repositorio ocupa 0,0 GB.

El conjunto de datos de decisión consta de 1.119 ejemplos de entrenamiento, 219 de validación y 325 de test, generados a partir de las observaciones del "cerebro" PPO al recorrer el curso `c13b32dd` en la tarea `follow_route`. El modelo está etiquetado con idioma coreano (`ko`) y licencia Apache 2.0, y su uso previsto es investigación y educación sobre simulación, no despliegue en robots físicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible para el adaptador; el modelo base se denomina 0.8B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre un transformer denso (Qwen3.5-0.8B) mediante LoRA gestionado por la librería `peft`. El entrenamiento se realizó en cuatro fases descritas por el autor: (1) entrenamiento de una política PPO en un simulador web de aprendizaje por refuerzo para la tarea `follow_route`, con el contrato `link01-decision/follow_route/obs27-act5/walker51-14/v1` y un 100% de éxito en el examen oficial del simulador; (2) generación de un conjunto de problemas textuales a partir de las observaciones del cerebro cada 0,5 segundos, con la respuesta del cerebro como etiqueta y un 20% de ejemplos con desviaciones deliberadas; (3) aprendizaje supervisado con LoRA para imitar al cerebro; y (4) ajuste con PPO donde la recompensa se define como el retorno obtenido si el cerebro continuase la ruta tras elegir cada opción, con anclaje KL para evitar el colapso de la política.

El espacio de acciones es discreto y pequeño (5 opciones de caminata, según el identificador `act5`), y la observación se serializa en un formato de 27 campos (`obs27`). El autor reporta que la tasa de coincidencia entre la representación textual y la decisión del cerebro (cota superior de acierto) es del 99%, lo que indica que la pérdida de información al pasar de observación numérica a texto es mínima. No se especifican el número de tokens de entrenamiento del modelo base ni detalles sobre su composición de datos, RLHF o DPO.

## Capacidades

- Decisión de locomoción en un espacio discreto de 5 acciones para la tarea `follow_route` del robot simulado LINK-01.
- Lectura de estado serializado en texto (situación, pregunta y opciones) y emisión de una única letra como respuesta, sin explicación.
- Seguimiento de instrucciones estrictas mediante un system prompt que delimita el estado como datos y no como instrucciones.
- Formato de salida restringido (una letra), apto para ser parseado directamente por un bucle de control.
- Capacidad multilingüe limitada al coreano en el material de entrenamiento.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Investigación en destilación de políticas: usar el par (política PPO, adaptador LoRA) como banco de pruebas para estudiar cuánto rendimiento de una política de refuerzo se conserva al reformularla como decisión textual.
- Educación en aprendizaje por refuerzo: reproducir el pipeline completo (simulador, generación de problemas, SFT, PPO con KL) en el notebook de Colab enlazado por el autor para ilustrar el ciclo de entrenamiento.
- Control de un agente simulado en bucle cerrado: integrar el adaptador en el puesto de decisión del robot dentro del simulador web y ejecutar episodios con semillas fijas (91001–91020) para comparar contra la política profesora.
- Evaluación de robustez ante ruido en la observación: introducir perturbaciones en los campos de texto del estado y medir la degradación de la tasa de acierto frente al cerebro original.
- Análisis de estabilidad de políticas: comparar las variantes de aprendizaje supervisado y de refuerzo (81,8% y 78,8% de acierto en test, respectivamente) para estudiar el compromiso entre imitación y optimización de retorno.
- Docencia sobre formatos de prompt restringidos: emplear el system prompt del modelo como ejemplo de separación entre datos e instrucciones en tareas de clasificación con salida de un solo token.

## Benchmarks y rendimiento

| Modelo | Acierto en test (coincidencia con el cerebro) | Éxito en 20 episodios del mismo curso | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0% | 100% | 0% | 24,3 s |
| Modelo antes de entrenar | 30,5% | 0% | 55% | No disponible |
| Aprendizaje supervisado (LoRA) | 81,8% | 100% | 0% | 24,4 s |
| Ajuste con refuerzo (PPO) | 78,8% | 100% | 0% | 23,9 s |

El autor indica que la evaluación de caminata se realizó con una aproximación 2D basada en una tabla de velocidades medidas por comando, sin el modelo de robot ni la red neuronal de marcha del simulador web MuJoCo, por lo que los resultados pueden diferir ligeramente de los del simulador completo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,0 GB y debe cargarse junto con el modelo base Qwen3.5-0.8B, cuyo peso en precisión completa se estima en torno a 1,6 GB en fp16 (estimación derivada del número de parámetros, no confirmada en la documentación).
- Al tratarse de un modelo de 0,8B, cabe con holgura en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en CPU con cuantización a 8 o 4 bits.
- Para inferencia en producción se puede usar transformers con PEFT y, si se convierte el modelo fusionado, vLLM, llama.cpp, Ollama o TGI; el autor solo documenta la ruta con `transformers` y `peft`.
- No se proporcionan datos de latencia ni de throughput; dado el tamaño del modelo y la salida de un solo token, la latencia esperada es muy baja, pero no está medida en la documentación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-lee-hyunju-v1-link01 | Adaptador sobre 0,8B | No disponible | 81,8% / 78,8% de acierto en tarea propia | Apache 2.0 | HuggingFace, 13 descargas |
| Política PPO profesora (brain.json) | No aplica (política tabular/neuronal del simulador) | No disponible | 100% en la tarea propia | No disponible | Dentro del simulador CONNECT AI WORLD |
| Qwen3.5-0.8B (base) | 0,8B | No disponible | No evaluado en esta tarea; 30,5% sin ajuste | No disponible en la información | HuggingFace |

No se dispone de otros adaptadores de decisión robótica comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación y educación sobre simulación; el autor advierte explícitamente de que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- La evaluación de marcha usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo, por lo que los resultados pueden no reflejar el comportamiento real.
- El ajuste con refuerzo obtiene menor acierto en test que el aprendizaje supervisado (78,8% frente a 81,8%), lo que sugiere un compromiso entre imitación y optimización de retorno que conviene tener en cuenta al elegir variante.
- Entrenado sobre un único curso (`c13b32dd`) y una única tarea (`follow_route`); la generalización a otras rutas u observaciones no está documentada.
- Idioma de entrenamiento limitado al coreano; el rendimiento en otros idiomas no está medido.
- Riesgo de alucinación de letras no válidas fuera del conjunto de 5 opciones; el prompt exige devolver solo una letra, pero no se documenta un mecanismo de validación o corrección.
- No se documentan sesgos demográficos ni de otro tipo, pero tampoco se han realizado evaluaciones de seguridad.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero debe verificarse la licencia del modelo base Qwen3.5-0.8B, no incluida en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ianrua/connectailab-rl-lee-hyunju-v1-link01
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo: https://www.aicitybuilders.com/robot
