# artnfull/connectailab-rl-artnfull-v4-link01

## Resumen

`artnfull/connectailab-rl-artnfull-v4-link01` es un adaptador LoRA entrenado sobre el modelo base `Qwen/Qwen3.5-0.8B` para la tarea de toma de decisiones de un robot simulado llamado LINK-01, concretamente para la tarea `follow_route` (seguimiento de ruta). El modelo lee en texto el estado del robot (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y la acción previa) y responde con una única letra que indica cómo caminar durante los siguientes 0,5 segundos.

El desarrollo procede de CONNECT AI LAB × AI CITY BUILDERS y tiene un carácter claramente educativo e investigador. El pipeline es notable: primero se entrena una política de referencia ("cerebro") con PPO en un simulador web basado en MuJoCo; después se genera un dataset textual convirtiendo en problemas de opción múltiple las observaciones que ve el cerebro cada 0,5 s; a continuación se aplica aprendizaje supervisado (SFT con LoRA) para que el modelo de lenguaje imite al cerebro, y finalmente un ajuste con aprendizaje por refuerzo (PPO con regularización KL) para reforzar o penalizar opciones según la recompensa que habrían obtenido.

Es relevante como ejemplo público y reproducible de "destilación de política de RL a un LLM" en un dominio robótico de bajo coste: el modelo final sustituye al cerebro PPO en el bucle de decisión y alcanza un 100 % de éxito en 20 recorridos de prueba de la misma ruta. La model card advierte explícitamente que es un modelo de simulación con fines de investigación y educación, y que debe revalidarse antes de usarlo en un robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre modelo causal de lenguaje Qwen3.5-0.8B (transformer decoder) |
| Parametros totales | no disponible (base Qwen3.5-0.8B; el repositorio del adaptador ocupa ~0,0 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados sin cuantizar) |
| Idiomas soportados | Coreano (ko); salida del modelo limitada a una letra de opción |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base Qwen3.5-0.8B |

## Arquitectura y entrenamiento

El modelo no es un LLM entrenado desde cero, sino un adaptador LoRA (librería PEFT) montado sobre Qwen3.5-0.8B. El entrenamiento sigue un esquema de dos fases sobre una política de referencia previa:

1. **Política maestra (cerebro PPO):** en el simulador web CONNECT AI WORLD (tarea `follow_route`, promesa `link01-decision/follow_route/obs16-act5/walker51-14/v1`, curso aprendido `2ef68173`), se entrena una política de RL con PPO que alcanza un 80 % en el examen oficial del curso.
2. **Generación del dataset:** mientras el cerebro recorre el curso, cada 0,5 s se convierte su observación en un problema textual de opción múltiple; la respuesta correcta es la acción del cerebro. Se incluyen también situaciones fuera de ruta (≈20 %) caminando con opciones alternativas.
3. **SFT con LoRA:** el modelo de lenguaje aprende a imitar las respuestas del cerebro.
4. **RL (PPO con KL):** cada opción se puntúa con la recompensa que obtendría si el cerebro completara el resto del recorrido tras tomarla; se suben las opciones claramente mejores que la del cerebro y se bajan las peores, con regularización KL para no alejarse del modelo SFT.
5. **Evaluación en simulación:** el modelo se sitúa en el puesto de decisión del robot y recorre la misma ruta 20 veces (semillas 91001–91020). El artefacto publicado corresponde al modelo de aprendizaje supervisado (no al de RL).

Dataset: 920 problemas de entrenamiento, 186 de validación y 263 de test. La tasa de acierto superior (respuesta idéntica al cerebro tras traducir la observación a texto) es del 100 %. La evaluación de marcha usa una aproximación 2D basada en una tabla de velocidades medidas por comando del walker web MuJoCo, sin modelo físico ni red de marcha, por lo que puede diferir ligeramente del simulador web.

## Capacidades

- Toma de decisión discreta para navegación robótica: dado el estado textual del robot (distancia y dirección al objetivo, sensores de distancia, velocidad, acción previa), selecciona exactamente una de las opciones listadas.
- Salida estrictamente controlada: devuelve solo la letra de la opción, sin explicación, bajo un system prompt que instruye a tratar el contenido de `state` como datos y no como instrucciones (mitigación básica de inyección de prompts).
- Imitación de una política PPO: reproduce las decisiones del cerebro maestro con un 77,6 % de coincidencia en test y completa la ruta con el mismo éxito (100 %) y tiempo medio casi idéntico (19,9 s frente a 19,7 s).
- No está orientado a generación de texto general, razonamiento abierto, código, matemáticas, visión ni audio; su función es la clasificación de acciones en el formato de problema generado por la librería `connect_tycoon.link01`.
- Soporte de tool calling / function calling: no disponible.
- Capacidades multilingües: el modelo base Qwen3.5-0.8B es multilingüe, pero este adaptador está diseñado para el formato de problema en coreano de la tarea `follow_route`.

## Casos de uso

- **Navegación de robot simulado LINK-01:** sustituye al cerebro PPO en el bucle de decisión del simulador CONNECT TYCOON, decidiendo cada 0,5 s la acción de marcha para seguir una ruta.
- **Investigación en destilación de RL a LLM:** sirve como caso de estudio reproducible para comparar SFT frente a RL (PPO con KL) al transferir una política numérica a un modelo de lenguaje.
- **Docencia en aprendizaje por refuerzo:** el repositorio CONNECT TYCOON, el notebook de Colab y el curso de AI CITY BUILDERS permiten replicar el pipeline completo (PPO web → dataset textual → LoRA → RL) como material didáctico.
- **Generación de datasets de decisión sintéticos:** el procedimiento de convertir observaciones del simulador en problemas de opción múltiple puede reutilizarse para otras tareas del mismo framework (`obs16-act5`).
- **Evaluación de robustez de agentes LLM:** las situaciones fuera de ruta incluidas en el dataset permiten estudiar cómo se comporta un LLM cuando la política maestra se desvía del camino óptimo.
- **Prototipado de control de robots con LLM en local:** al basarse en un modelo de 0,8 B con adaptador LoRA, es viable ejecutar el bucle de decisión en hardware modesto y experimentar con latencias de decisión de 0,5 s.
- **Estudio de seguridad de prompts en agentes robóticos:** el system prompt que trata el estado como datos es un ejemplo práctico de diseño frente a inyección de instrucciones en entradas de sensor textualizadas.

## Benchmarks y rendimiento

Resultados publicados en la model card (test de 263 problemas y simulación de 20 recorridos con semillas 91001–91020):

| Modelo | Acierto en test (misma respuesta que el cerebro) | Éxito en 20 recorridos | Recorridos con colisión | Tiempo medio en recorridos exitosos |
|---|---|---|---|---|
| Cerebro (profesor, PPO) | 100,0 % | 100 % | 0 % | 19,7 s |
| Modelo base sin entrenar | 39,5 % | 5 % | 0 % | 33,0 s |
| Aprendizaje supervisado (publicado) | 77,6 % | 100 % | 0 % | 19,9 s |
| Aprendizaje por refuerzo | 76,8 % | 95 % | 0 % | 19,9 s |

No se han publicado resultados de benchmarks estándar de LLM (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente; al ser un modelo base de ~0,8 B de parámetros más un adaptador LoRA de tamaño despreciable (~0,0 GB el repositorio), es razonable estimar del orden de 2–4 GB de VRAM en fp16, e incluso menos con cuantización.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU de consumo (por ejemplo RTX 3060 o superior) debería bastar. También es ejecutable en CPU dada la escala del modelo.
- Cabe en GPUs de consumo: sí, con holgura, al tratarse de uno de los modelos más pequeños de la familia Qwen.
- Opciones de despliegue: la model card documenta el uso con `transformers` + `peft` (cargando el modelo base y aplicando `PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; el soporte vía GGUF no está disponible en el repositorio.
- Latencia y throughput: no disponibles; el ciclo de decisión del robot es de 0,5 s por paso, lo que sugiere que la inferencia debe completarse por debajo de ese intervalo.
- Entrenamiento: existe un notebook de Colab oficial para replicar el aprendizaje (`link01_decision_model_colab.ipynb` en el repositorio connect-tycoon).

## Comparativa con modelos similares

No existen adaptadores directamente comparables publicados por terceros para esta tarea. Como referencia de contexto dentro de la misma familia de modelos base:

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| artnfull/connectailab-rl-artnfull-v4-link01 | Adaptador LoRA para decisión robótica | Adaptador sobre 0,8 B | no disponible | Apache-2.0 | Tarea específica `follow_route`; salida de una letra |
| Qwen/Qwen3.5-0.8B (base) | LLM general | 0,8 B | no disponible | no disponible | Modelo base sin adaptar; 39,5 % de coincidencia con el cerebro |
| Cerebro PPO (CONNECT AI WORLD) | Política de RL clásica (no LLM) | no disponible | no aplicable | no disponible | 100 % de coincidencia consigo mismo; 80 % en examen oficial del curso |

## Limitaciones y advertencias

- Es un modelo de simulación con fines de investigación y educación: la propia model card advierte que debe revalidarse en el robot y el espacio concretos antes de cualquier uso real. No es apto para control de robots físicos sin verificación adicional.
- La evaluación de marcha usa una aproximación 2D con una tabla de velocidades medidas por comando, no el walker MuJoCo completo, por lo que los resultados pueden diferir del simulador web.
- El artefacto publicado es el modelo de aprendizaje supervisado (77,6 % de coincidencia con el cerebro en test), no el modelo de RL; el modelo de RL obtuvo 76,8 % y un 95 % de éxito en los 20 recorridos.
- Solo alcanza un 77,6 % de coincidencia con la política maestra en problemas de test, aunque el comportamiento agregado (completar la ruta) sea equivalente en simulación.
- Sesgos conocidos: no disponible. Riesgo de alucinación: limitado por diseño (salida restringida a una letra), pero una decisión incorrecta en navegación podría desviar la ruta.
- Limitaciones de idioma: el formato de problema está pensado para coreano; el uso con otros idiomas o formatos no está documentado.
- Restricciones de licencia: Apache-2.0, sin restricciones relevantes para uso comercial.
- El modelo hereda los sesgos y limitaciones generales del modelo base Qwen3.5-0.8B, no documentados en la model card.
- Métricas de adopción muy bajas (19 descargas, 1 like en el momento de la ficha) y fecha de creación reciente, lo que implica poca validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/artnfull/connectailab-rl-artnfull-v4-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código (CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje (CONNECT AI WORLD robot lab): https://www.ezerai.xyz/robot-lab/world/
- Curso de RL (AI CITY BUILDERS): https://www.aicitybuilders.com/robot
- Web de AI CITY BUILDERS: https://www.aicitybuilders.com
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
