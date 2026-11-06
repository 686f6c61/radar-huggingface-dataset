# leegoheun/connectailab-rl-duking-v4-link01

## Resumen

connectailab-rl-duking-v4-link01 es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario leegoheun en el marco del proyecto CONNECT AI LAB / CONNECT TYCOON. No es un modelo de lenguaje generalista: es un modelo de decisión especializado que traduce el estado de un robot simulado LINK-01 (distancia al objetivo, orientación, sensores de distancia, velocidad y acción previa) en una de cinco acciones discretas de locomoción para el siguiente intervalo de 0,5 segundos. El modelo responde con una única letra de opción, sin explicación.

El interés técnico reside en el pipeline de destilación seguido: primero se entrena una política PPO en un simulador web (el "cerebro" o brain.json), después se generan pares observación-texto/acción que sirven para un ajuste supervisado con LoRA, y finalmente se aplica un refinamiento por refuerzo (PPO con anclaje KL) sobre las preferencias de acción del cerebro. El resultado es un modelo de 0,8 mil millones de parámetros que ejecuta una tarea de decisión de robótica de baja dimensionalidad mediante generación de texto.

Es relevante como ejemplo de sustitución de políticas RL por modelos de lenguaje pequeños con adaptadores de bajo rango, y por su enfoque de evaluación sobre el propio simulador (20 episodios con semillas fijas). El alcance es educativo y de investigación en simulación; el propio autor advierte que debe revalidarse antes de usar en un robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | 0,8 mil millones (modelo base); tamaño del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen/Qwen3.5-0.8B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko); las instrucciones del sistema y las opciones se emiten en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador LoRA no modifica la arquitectura del modelo base; especializa la generación hacia una salida restringida a una letra entre las cinco opciones de acción (`obs16-act5`). La tarea se formaliza como `follow_route` con el contrato `link01-decision/follow_route/obs16-act5/walker51-14/v1` y se entrena sobre el curso `random`.

El entrenamiento tiene tres fases documentadas. Primero, una política PPO ("cerebro") se entrena en el simulador web de CONNECT AI WORLD sobre el curso `random`. Segundo, se construye un conjunto de problemas convirtiendo cada 0,5 segundos la observación del cerebro en texto, con la acción del cerebro como etiqueta; un 20 % de los ejemplos corresponden a situaciones en las que el cerebro se desvió de la ruta. El conjunto resultante tiene 1131 ejemplos de entrenamiento, 215 de validación y 328 de test, con un techo de acierto del 99 % respecto al cerebro. Tercero, se aplica ajuste supervisado con LoRA y después un refinamiento por refuerzo tipo PPO con anclaje KL, en el que la recompensa de cada opción se estima como la recompensa obtenida si el cerebro hubiera continuado desde esa acción. La evaluación final coloca el modelo de decisión en el puesto de mando del robot y recorre el mismo circuito 20 veces con semillas 91001–91020.

## Capacidades

- Decisión de locomoción discreta: dado un estado textual del robot, selecciona una de cinco acciones de caminata para los siguientes 0,5 segundos.
- Seguimiento de ruta (`follow_route`) en un simulador 2D con aproximación de la marcha mediante una tabla de velocidades por comando.
- Salida restringida a una letra de opción, sin razonamiento textual ni explicación, lo que simplifica el parseo en producción.
- Instrucción de sistema específica que trata el contenido del estado como datos y no como instrucciones (defensa básica frente a inyección de prompt en el campo de estado).
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni matemáticas; el adaptador está especializado en una única tarea.
- Multilingüismo limitado: el modelo base es multilingüe, pero el adaptador está entrenado y etiquetado para coreano, con instrucciones y opciones en inglés.

## Casos de uso

- Evaluación educativa de pipelines RL a LLM: reproducir el flujo cerebro PPO → destilación supervisada → refinamiento por refuerzo con KL para enseñar cómo se sustituye una política neuronal por un modelo de lenguaje pequeño.
- Control de agentes en simuladores de bajo coste: integrar el adaptador como módulo de decisión en un simulador 2D de seguimiento de ruta, con la ventaja de que la salida es una letra parseable y determinista en formato.
- Generación de datos sintéticos de decisión: usar el modelo para etiquetar observaciones de robot convertidas a texto y ampliar el conjunto de entrenamiento de otras políticas.
- Pruebas de robustez frente a inyección de prompt: el campo de estado se trata como datos, lo que permite experimentar con ataques de texto dentro de la observación y medir la tasa de desviación.
- Prototipado rápido en Colab: el notebook del proyecto permite reentrenar y evaluar el adaptador sin infraestructura dedicada, útil para docencia y talleres.
- Investigación sobre anclaje KL en ajuste por refuerzo: comparar la tasa de acierto respecto al cerebro (93,0 % en la versión RL frente a 91,5 % en la supervisada) para estudiar estabilidad del refinamiento.
- Base para adaptadores de decisión en otros dominios discretos: reutilizar el esquema obs16-act5 con un modelo base de 0,8 B como plantilla para tareas de control con espacio de acciones pequeño.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card; la evaluación de marcha usa una aproximación 2D con tabla de velocidades por comando, no el simulador MuJoCo completo.

| Modelo | Acierto en test (misma respuesta que el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0 % | 100 % | 0 % | 25,5 s |
| Antes del entrenamiento | 57,9 % | 0 % | 0 % | — |
| Ajuste supervisado (LoRA) | 91,5 % | 100 % | 0 % | 25,1 s |
| Refinamiento por refuerzo (esta versión) | 93,0 % | 100 % | 0 % | 25,7 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un transformer de 0,8 B en FP16 requiere del orden de 1,6 GB solo para pesos, más KV cache y overhead del runtime; el adaptador LoRA añade un coste marginal.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo base cabe en GPU de consumo con 8 GB o más; no se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, por el tamaño del modelo base (0,8 B), aunque no hay mediciones publicadas para este adaptador.
- Opciones de despliegue: el autor documenta uso con `transformers` + `peft` (`PeftModel.from_pretrained` sobre `AutoModelForCausalLM`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; la fusión del adaptador con el modelo base sería necesaria para servir con la mayoría de esos runtimes.
- Latencia y throughput: no disponibles. La tarea exige una decisión cada 0,5 segundos, pero no se publican cifras de latencia por token ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de decisión robótica destilados a LLM en la documentación proporcionada. La comparación más directa es con el propio pipeline del autor:

| Modelo | Parámetros | Contexto | Acierto test | Éxito 20 episodios | Licencia |
|---|---|---|---|---|---|
| Cerebro PPO (política original) | No disponible | No aplica | 100,0 % | 100 % | No disponible |
| Ajuste supervisado LoRA | 0,8 B (base) | No disponible | 91,5 % | 100 % | Apache 2.0 |
| Este modelo (LoRA + RL) | 0,8 B (base) | No disponible | 93,0 % | 100 % | Apache 2.0 |

Alternativas de la misma categoría (políticas RL para `follow_route` en simuladores 2D): no disponible.

## Limitaciones y advertencias

- Especialización extrema: solo resuelve `follow_route` con el esquema obs16-act5; fuera de ese contrato la salida carece de sentido.
- Evaluación de marcha aproximada: el autor indica que la puntuación usa una tabla de velocidades por comando en 2D y no el simulador MuJoCo completo, por lo que los resultados pueden diferir de la simulación real.
- No apto para robot físico sin revalidación: la model card advierte explícitamente que es un modelo de investigación y educación en simulación y que debe revalidarse en el robot y el espacio concretos.
- Riesgo de alucinación de opción: al ser un modelo generativo, puede emitir una letra fuera del conjunto de opciones o texto adicional; el prompt de sistema exige devolver solo la letra, pero no hay garantía formal.
- Sesgos: no documentados. El conjunto de entrenamiento proviene de un único curso (`random`) y de una única política profesora, lo que puede limitar la generalización a otros mapas.
- Idiomas: etiquetado únicamente para coreano; el prompt de sistema y las opciones están en inglés, lo que introduce una mezcla de idiomas no evaluada.
- Licencia Apache 2.0: permite uso comercial, pero debe respetarse la licencia del modelo base Qwen/Qwen3.5-0.8B, que no se detalla en la información disponible.
- Inconsistencia en la documentación: el fragmento de código de la model card referencia `leegoheun/connectailab-rl-jay-v1-link01`, no el ID de este repositorio; conviene verificar el identificador correcto antes de cargar el adaptador.
- Sin métricas de latencia ni de cuantización publicadas, lo que dificulta planificar un despliegue en tiempo real.

## Enlaces

- Hugging Face: https://huggingface.co/leegoheun/connectailab-rl-duking-v4-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno de entrenamiento web: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
