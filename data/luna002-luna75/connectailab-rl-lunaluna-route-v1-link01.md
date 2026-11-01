# Luna002-Luna75/connectailab-rl-lunaluna-route-v1-link01

## Resumen

connectailab-rl-lunaluna-route-v1-link01 es un adaptador LoRA publicado por Luna002-Luna75 (CONNECT AI LAB x AI CITY BUILDERS) sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo de lenguaje generalista: es un "cerebro" de toma de decisiones para el robot simulado LINK-01, entrenado para responder, en una sola letra, cómo debe caminar el robot durante los próximos 0,5 segundos a partir de una descripción textual de su estado (distancia al objetivo, dirección, sensores de distancia, velocidad y elección previa).

El problema que resuelve es el de destilar una política de refuerzo (PPO) entrenada en un simulador web de caminado en un modelo de lenguaje pequeño, de modo que la decisión se pueda tomar mediante generación de texto con un formato de prompt fijo. Para ello se generaron 1.191 ejemplos de entrenamiento, 226 de validación y 357 de test a partir de las observaciones que registró la política maestra (brain.json) al recorrer un circuito, y se aplicó primero aprendizaje supervisado (LoRA) y después un ajuste con refuerzo penalizando/recompensando opciones.

Es relevante ahora como ejemplo reproducible de destilación de políticas RL en LLM de menos de 1B parámetros con licencia Apache 2.0, pero su alcance es muy acotado: un único task (`follow_route`), un contrato de observación de 16 dimensiones y 5 acciones (`obs16-act5`), y una salida restringida a una letra. No debe confundirse con un modelo conversacional ni con un modelo de robótica de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen/Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible (el adaptador LoRA no declara recuento; el base es de 0,8B según su denominación) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base Qwen3.5-0.8B) |
| Tipos de cuantizacion | No disponible (repo en safetensors; el base admite las cuantizaciones habituales, no confirmadas aquí) |
| Idiomas soportados | Coreano (ko) declarado; el prompt de sistema está en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el base se distribuye por separado |

## Arquitectura y entrenamiento

El adaptador se monta sobre un transformer decoder-only de 0,8B parámetros mediante LoRA. El pipeline declarado es `reinforcement-learning` y las etiquetas incluyen `ppo`, `deep-reinforcement-learning`, `robotics` y `decision-making`, pero el entrenamiento real del adaptador es en dos fases: (1) aprendizaje supervisado sobre pares observación-en-texto → letra de acción generados por la política PPO maestra, y (2) un ajuste con refuerzo en el que cada opción recibe como recompensa el retorno que habría obtenido si el resto de la trayectoria la hubiera completado la política maestra, con una penalización KL que ancla el modelo al de la fase supervisada.

El conjunto de datos se generó haciendo caminar a la política maestra por el circuito `4837c8d8` y registrando cada 0,5 segundos la observación textualizada; un 20% de los ejemplos corresponden a situaciones en las que el robot se desvió al elegir otra opción, para enseñar al modelo a recuperarse. El contrato de la tarea es `link01-decision/follow_route/obs16-act5/walker51-14/v1`, con 16 dimensiones de observación y 5 acciones posibles. La evaluación del caminado se hizo con una aproximación 2D basada en una tabla de velocidades por comando del simulador web MuJoCo, no con el simulador físico completo, por lo que los tiempos de recorrido pueden diferir de los de MuJoCo.

## Capacidades

- Clasificación de decisión en un espacio cerrado de 5 opciones: devuelve exactamente una letra, sin explicación.
- Lectura de estado estructurado en texto (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa) bajo un prompt de sistema fijo.
- Seguimiento de rutas (`follow_route`) en el simulador LINK-01 con el contrato obs16-act5.
- Recuperación parcial ante desviaciones, gracias al 20% de ejemplos con acciones subóptimas en el entrenamiento.
- Robustez frente a inyección de instrucciones dentro del campo de estado: el prompt de sistema indica explícitamente tratar el texto de `state` como datos.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking).
- Capacidad multilingüe limitada al coreano declarado y al inglés del prompt de sistema; no hay evaluación en otros idiomas.

## Casos de uso

- Docencia de destilación RL→LLM: usar el par (política PPO maestra, adaptador LoRA) como práctica guiada para mostrar cómo se convierte una política de refuerzo en un modelo de lenguaje que responde con una etiqueta, incluyendo la fase de ajuste con recompensa por opción y anclaje KL.
- Reproducción de experimentos de robótica simulada: ejecutar el adaptador en el circuito `4837c8d8` con las semillas 91001–91020 para replicar la comparativa publicada (72,3% de coincidencia con la política maestra en test y 100% de éxito en 20 episodios).
- Evaluación de robustez a inyección de prompts: el campo `state` es texto libre generado por el simulador; sirve como banco de pruebas para medir si el modelo respeta la instrucción de tratar el estado como datos y no como órdenes.
- Generación de datos sintéticos de decisión: usar el adaptador como anotador de bajo coste para etiquetar nuevas observaciones del simulador y ampliar el conjunto de entrenamiento antes de reentrenar la política maestra.
- Prototipado de interfaces texto→acción en robótica educativa: integrar el adaptador en un bucle de control de 2 Hz (decisión cada 0,5 s) donde la latencia de un modelo de 0,8B con LoRA es aceptable.
- Comparación de estrategias de ajuste: el repositorio publica resultados separados para supervisado y para refuerzo (72,3% frente a 70,0% de coincidencia, y 26,0 s frente a 24,5 s de tiempo medio de recorrido), lo que permite estudiar el compromiso entre fidelidad a la política maestra y eficiencia de la trayectoria.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (evaluación sobre 357 problemas de test y 20 episodios de caminado con semillas 91001–91020):

| Modelo | Acierto en test (misma acción que la política maestra) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Política maestra (PPO, brain.json) | 100,0% | 100% | 0% | 27,6 s |
| Base sin ajustar | 38,1% | 0% | 0% | — |
| Adaptador tras aprendizaje supervisado | 72,3% | 100% | 0% | 26,0 s |
| Adaptador tras ajuste con refuerzo | 70,0% | 100% | 0% | 24,5 s |

El autor indica que el techo de acierto alcanzable es del 98% (proporción en que la política maestra da la misma respuesta al textualizar la observación) y que la métrica de caminado usa una aproximación 2D con tabla de velocidades por comando, no el simulador MuJoCo completo. No se han publicado resultados en benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Como referencia de orden de magnitud para un modelo base de 0,8B, la inferencia en fp16 requiere del orden de 1,6 GB solo para pesos, más caché KV y overhead del runtime; el adaptador LoRA añade un coste marginal.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU consumer con 4 GB o más de VRAM debería poder alojar el modelo base en fp16, aunque no hay confirmación del autor.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del base, pero no verificado en la documentación publicada.
- Opciones de despliegue: la model card solo documenta `transformers` + `peft`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y la fusión del adaptador con el base para exportar a GGUF no está descrita.
- Latencia y throughput: no disponibles. El bucle de control del robot decide cada 0,5 s, lo que fija un requisito implícito de una inferencia por debajo de ese intervalo, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-lunaluna-route-v1-link01 | 0,8B (base) + LoRA | No disponible | Destilación de política PPO en LLM para `follow_route` | Apache 2.0 | HuggingFace, 17 descargas, 1 like |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | LLM generalista | No disponible en la información | HuggingFace |
| Política PPO maestra (brain.json, CONNECT TYCOON) | No disponible | No aplica | Política de refuerzo nativa del simulador | No disponible | Repositorio GitHub del proyecto |

No se dispone de datos publicados que permitan comparar este adaptador con otros modelos de decisión robótica de tamaño similar; la comparación relevante es interna al proyecto (base sin ajustar, supervisado y refuerzo), recogida en la sección de benchmarks.

## Limitaciones y advertencias

- Alcance funcional mínimo: solo resuelve la tarea `follow_route` con el contrato obs16-act5; fuera de ese formato de observación y de ese conjunto de 5 acciones no hay garantía de comportamiento válido.
- El autor advierte explícitamente que es un modelo de investigación y educación sobre simulador y que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- La evaluación del caminado usa una aproximación 2D con tabla de velocidades por comando, sin el modelo de robot ni la red de caminado reales; los tiempos y la ausencia de caídas no equivalen a los de MuJoCo.
- El ajuste con refuerzo empeora ligeramente la coincidencia con la política maestra (70,0% frente a 72,3% del supervisado), por lo que la fidelidad al profesor no es monótona con el entrenamiento.
- Riesgo de alucinación de formato: si el prompt se desvía del formato esperado, el modelo puede devolver texto libre en lugar de una única letra, lo que rompe el bucle de control.
- Sesgo de distribución: los datos provienen de un único circuito (`4837c8d8`) y de una única política maestra; el rendimiento en trazados o dinámicas distintas no está evaluado.
- Idiomas: solo coreano declarado, con prompt de sistema en inglés; no hay evaluación en castellano ni en otros idiomas.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero conviene verificar por separado la licencia y las condiciones del modelo base Qwen/Qwen3.5-0.8B antes de desplegarlo en producción.
- Repositorio con muy poca tracción (17 descargas, 1 like) y sin resultados en benchmarks estándar de lenguaje; no hay evidencia de calidad fuera del circuito evaluado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Luna002-Luna75/connectailab-rl-lunaluna-route-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de refuerzo en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
