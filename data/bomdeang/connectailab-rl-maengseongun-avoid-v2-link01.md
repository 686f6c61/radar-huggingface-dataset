# Bomdeang/connectailab-rl-maengseongun-avoid-v2-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, entrenado por Bomdeang (CONNECT AI LAB) para una tarea muy concreta: convertir en texto la decision de movimiento de un robot simulado LINK-01 en un entorno de evitacion de obstaculos. El modelo recibe una descripcion en lenguaje natural del estado del robot (distancia al objetivo, direccion, sensores de distancia, velocidad y eleccion previa) y devuelve una unica letra que corresponde a la siguiente accion de 0,5 segundos. No es un modelo de proposito general, sino una destilacion de una politica PPO entrenada en un simulador web hacia un modelo de lenguaje pequeno.

El desarrollo sigue un pipeline de cuatro fases: primero se entrena una politica PPO en el simulador (tarea `avoid_obstacles`, curso `9859f6a5`, 80% de exito en la prueba oficial); despues se generan pares observacion-respuesta cada 0,5 segundos convirtiendo el estado del robot en texto; a continuacion se hace aprendizaje supervisado con LoRA sobre Qwen3.5-0.8B; y finalmente se aplica RL (PPO con restriccion KL) para ajustar las preferencias entre opciones. El resultado es un modelo de 0,8 mil millones de parametros con licencia Apache 2.0, solo en coreano, orientado a investigacion y educacion en simulacion.

Su relevancia es limitada fuera del ecosistema CONNECT AI LAB: es un artefacto de investigacion que demuestra como destilar una politica de RL en un LLM pequeno para decisiones discretas, pero no compite con modelos generales. La model card advierte explicitamente que es un modelo de simulador y que debe revalidarse antes de usarlo en un robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones (modelo base); el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B, no confirmada en la informacion) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors del adaptador) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parametros. El entrenamiento combina dos etapas: aprendizaje supervisado (SFT) con LoRA sobre 1640 ejemplos de entrenamiento, 282 de validacion y 476 de test, generados a partir de las observaciones que la politica PPO veia mientras recorria el curso `9859f6a5`; y una etapa posterior de refuerzo con PPO y anclaje KL, donde cada opcion se puntua con la recompensa que habria obtenido la politica original si hubiera continuado desde esa eleccion. El 20% de los ejemplos de entrenamiento corresponden a situaciones en las que la politica se desvio del camino optimo, para ensenar al modelo a recuperarse.

La innovacion principal no esta en la arquitectura sino en el metodo: se convierte un problema de control continuo en un problema de clasificacion de texto (elegir una letra entre opciones), y se destila la politica de RL en un LLM pequeno para que la decision sea interpretable y ejecutable mediante una simple llamada de generacion. El prompt de sistema instruye al modelo a tratar el estado como datos y a devolver solo la letra de la opcion elegida, sin explicacion.

## Capacidades

- Decision de movimiento discreta: dado un estado textual del robot, devuelve una unica letra correspondiente a la siguiente accion de 0,5 segundos.
- Evitacion de obstaculos en simulacion 2D: tarea principal para la que fue entrenado (`avoid_obstacles`).
- Seguimiento de instrucciones de formato estricto: respeta el system prompt que exige devolver solo la letra, sin texto adicional.
- Comprension de estado estructurado en lenguaje natural: interpreta distancias, direcciones, lecturas de sensores, velocidad y eleccion previa.
- Capacidad multilingue: limitada al coreano segun la model card.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso o modo agente: no disponible; el modelo esta disenado para decisiones de un solo paso.
- Vision, audio o thinking mode: no disponible.

## Casos de uso

- Investigacion en destilacion de politicas RL: usar el adaptador como caso de estudio de como convertir una politica PPO en un LLM pequeno mediante SFT + PPO, replicando el pipeline en otros entornos simulados.
- Educacion en reinforcement learning: el notebook de Colab y el repositorio CONNECT TYCOON permiten reproducir el entrenamiento paso a paso, con un modelo de 0,8B que cabe en GPU de consumo.
- Prototipado de agentes de decision en simulacion: integrar el modelo como "cerebro" de un robot simulado en el entorno web de CONNECT AI WORLD para experimentar con politicas alternativas.
- Generacion de datos sinteticos de decision: usar el modelo para etiquetar estados de robot en simulacion y ampliar datasets de entrenamiento para otras politicas.
- Benchmark interno de robustez ante estados fuera de distribucion: el 20% de ejemplos con desviaciones permite evaluar como generaliza el modelo cuando la politica original se equivocaba.
- Docencia en sistemas de control con LLM: ilustrar las limitaciones de usar un modelo de lenguaje para decisiones de control de baja frecuencia (0,5 s) frente a politicas dedicadas.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan el modelo con la politica PPO original ("cerebro") y con el modelo antes de entrenar, sobre el conjunto de test (476 problemas) y sobre 20 partidas del mismo curso con semillas 91001-91020:

| Modelo | Precision en test (misma respuesta que el cerebro) | Exito en 20 partidas | Partidas con colision | Tiempo medio en partidas exitosas |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0% | 65% | 50% | 32,7 s |
| Antes de entrenar | 33,0% | 0% | 0% | — |
| Aprendizaje supervisado (SFT) | 81,3% | 85% | 30% | 32,4 s |
| Refuerzo (RL/PPO) | 72,5% | 65% | 25% | 32,8 s |

Nota: la evaluacion de marcha usa una aproximacion 2D basada en una tabla de velocidades por comando, no el simulador MuJoCo web, por lo que los resultados pueden diferir ligeramente.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8B en FP16 ocupa aproximadamente 1,6 GB de pesos; con el adaptador LoRA el incremento es marginal. En cuantizacion de 4 bits cabria en torno a 0,5-1 GB, aunque no se han publicado pesos cuantizados en el repo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo base en FP16; una RTX 3060, RTX 4060 o superior es suficiente.
- Cabe en GPU de consumo: si, practicamente cualquier GPU consumer moderna (GTX 1660 6 GB, RTX 3050 8 GB en adelante).
- Opciones de despliegue: transformers + peft (metodo documentado en la model card); vLLM, llama.cpp, Ollama y TGI no estan documentados para este adaptador, aunque el modelo base Qwen3.5-0.8B podria soportarlos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (destilacion de politicas RL en LLM para control de robots) en la documentacion proporcionada. Como referencia del modelo base:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| connectailab-rl-maengseongun-avoid-v2-link01 (este) | 0,8B + LoRA | no disponible | Apache 2.0 | HuggingFace (23 descargas) |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | no disponible en la informacion | HuggingFace |
| Alternativas de control por RL | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de simulador: la propia model card advierte que es un modelo de investigacion y educacion sobre simulador, y que debe revalidarse en el robot y el espacio reales antes de cualquier uso fisico.
- Dominio muy restringido: solo resuelve la tarea `avoid_obstacles` en el curso `9859f6a5`; no generaliza a otros entornos, tareas ni morfologias de robot.
- Idioma: unicamente coreano; el prompt de sistema esta en ingles pero el estado y las opciones se generan en coreano.
- Rendimiento inferior al profesor: el mejor resultado (SFT) alcanza 81,3% de coincidencia con la politica PPO en test, y el RL baja a 72,5%; ninguno iguala al cerebro original (100%).
- Evaluacion aproximada: la medida de exito en marcha usa una tabla de velocidades 2D en lugar del simulador MuJoCo, por lo que los porcentajes de exito y colision pueden no reflejar el comportamiento real en el simulador web.
- Riesgo de alucinacion: al ser un LLM, puede devolver letras no validas o texto adicional si el prompt no se respeta estrictamente; el system prompt es obligatorio.
- Sesgos: no documentados; el dataset se genera a partir de una unica politica y un unico curso, por lo que hereda los sesgos de esa politica.
- Licencia: Apache 2.0 permite uso comercial, pero la model card restringe explicitamente el uso a investigacion y educacion en simulador y exige revalidacion antes de uso real.
- Sin cuantizaciones publicadas ni benchmarks estandar (MMLU, HumanEval, GSM8K): no es posible comparar con modelos de proposito general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Bomdeang/connectailab-rl-maengseongun-avoid-v2-link01
- Repositorio de codigo CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
