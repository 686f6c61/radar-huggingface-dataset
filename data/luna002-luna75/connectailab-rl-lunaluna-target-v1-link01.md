# Luna002-Luna75/connectailab-rl-lunaluna-target-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT sobre el modelo base Qwen/Qwen3.5-0.8B, entrenado para actuar como política de decisión en un robot simulado de locomoción 2D. El modelo recibe una descripción textual del estado del robot (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa) y devuelve una única letra que identifica la acción de caminata a ejecutar durante los siguientes 0,5 segundos. Lo desarrolla el autor Luna002-Luna75 en el marco de CONNECT AI LAB y AI CITY BUILDERS, y se publica bajo licencia Apache 2.0.

El entrenamiento sigue una cadena de destilación: primero se entrena una política PPO en un entorno web de aprendizaje por refuerzo (tarea `goto_target`), después se generan 1.128 pares observación textual-acción a partir de las trayectorias de esa política, se hace un ajuste supervisado con LoRA sobre Qwen3.5-0.8B y finalmente se aplica un refinamiento por RL con PPO y anclaje KL. El resultado se evalúa sentando al modelo de lenguaje en el puesto de decisión del robot y midiendo la tasa de éxito en 20 episodios con semillas fijas (91001–91020).

Es relevante como ejemplo de destilación de políticas de RL en modelos de lenguaje pequeños: demuestra que un LLM de 0,8B parámetros con un adaptador LoRA puede sustituir a una red de política especializada en un dominio acotado, con un 85% de éxito en los episodios de prueba y sin colisiones, a costa de una tasa de coincidencia con el profesor del 59,9%. No es un modelo de propósito general: su ámbito es una única tarea de decisión con un espacio de acciones discreto y un formato de observación fijo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible (base de 0,8B; el adaptador LoRA añade un número no especificado de parámetros entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B; no se especifica en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3.5-0.8B |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. La contribución entrenada es un conjunto de matrices LoRA de bajo rango, por lo que el coste de almacenamiento es mínimo (el repositorio completo ocupa 0,1 GB) y la inferencia requiere cargar el modelo base más el adaptador mediante `PeftModel.from_pretrained`. El pipeline declarado es `reinforcement-learning` y las etiquetas incluyen `ppo`, `deep-reinforcement-learning`, `robotics` y `decision-making`.

El proceso de entrenamiento tiene cuatro fases documentadas. Primero, una política PPO ("cerebro", `brain.json`) se entrena en el laboratorio web de robots de CONNECT AI WORLD sobre la tarea `goto_target`, con el contrato `link01-decision/goto_target/obs21-act5/walker51-14/v1` y el curso `23b8d36f`, alcanzando un 100% en el examen oficial. Segundo, se construye un conjunto de problemas muestreando cada 0,5 segundos las observaciones que ve la política y traduciéndolas a texto, con la acción del profesor como etiqueta; un 20% de los ejemplos corresponden a situaciones en las que la política se desvió del camino eligiendo otra opción. Tercero, se hace ajuste supervisado con LoRA para que el LLM imite al profesor. Cuarto, se aplica RL con PPO usando como recompensa el retorno que habría obtenido el profesor si hubiera continuado desde la acción elegida, con una penalización KL que mantiene al modelo cerca de la política supervisada.

El conjunto de datos resultante tiene 768 ejemplos de entrenamiento, 148 de validación y 212 de prueba. La tasa de coincidencia entre la representación textual y la acción del profesor (cota superior de acierto) es del 100%, lo que indica que la traducción a texto no introduce ambigüedad en este dominio. La evaluación de la locomoción se realiza con una aproximación 2D basada en una tabla de velocidades medidas por comando, no con el simulador MuJoCo completo, por lo que los resultados pueden diferir de los del entorno web.

## Capacidades

- Decisión discreta de siguiente acción de caminata en un espacio de 5 opciones (etiquetas de una letra) para la tarea `goto_target`.
- Lectura de observaciones estructuradas en texto: distancia y dirección al objetivo, sensores de distancia, velocidad y acción previa.
- Salida en formato restringido: una sola letra, sin explicación, según el system prompt prescrito.
- Resistencia a inyección de instrucciones dentro del campo `state` (el prompt indica tratar el texto del estado como datos, no como instrucciones).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo resuelve un único paso de decisión por invocación.
- Capacidades multilingües: limitadas al coreano según la model card.
- Capacidades especiales: ninguna declarada (sin visión, audio ni modo de razonamiento explícito).

## Casos de uso

- Sustitución de la política RL en el bucle de control del robot simulado LINK-01: el modelo se coloca en el puesto de decisión y genera la acción de 0,5 segundos a partir del estado textual, lo que permite comparar el comportamiento de un LLM destilado frente a la red PPO original en la misma tarea.
- Docencia y demostración de destilación de políticas: el par profesor PPO / alumno LLM con métricas separadas de coincidencia con el profesor (59,9%) y éxito de la tarea (85%) sirve para explicar por qué la imitación exacta no es el objetivo en RL.
- Evaluación de robustez ante desviaciones: el 20% de ejemplos con acciones subóptimas del profesor entrena al modelo para recuperarse tras salir del camino, un escenario útil para probar políticas de recuperación en entornos con perturbaciones.
- Prototipado rápido de agentes de decisión en entornos discretos: el formato de pregunta de opción múltiple con respuesta de una letra es reutilizable para otras tareas de control con espacio de acciones finito, siempre que se genere el conjunto de observaciones textuales correspondiente.
- Investigación sobre anclaje KL en ajuste fino con RL: la configuración permite estudiar cómo la penalización KL frente a la política supervisada modera la exploración y afecta a la tasa de colisiones (0% en la versión RL frente al 35% de la versión supervisada).
- Generación automática de datos de decisión a partir de simuladores: el pipeline `questions.task_of("goto_target", obs)` documentado en la model card puede integrarse en scripts de recolección para producir nuevos conjuntos de entrenamiento a partir de trayectorias del simulador.

## Benchmarks y rendimiento

Resultados publicados en la model card. La columna "acierto en examen" mide la coincidencia con la acción del profesor sobre 212 problemas de prueba; "éxito en 20 episodios" mide la llegada al objetivo en el mismo curso con semillas 91001–91020.

| Modelo | Acierto en examen | Éxito en 20 episodios | Episodios con colisión | Tiempo medio de los episodios exitosos |
|---|---|---|---|---|
| Profesor (política PPO) | 100,0% | 100% | 5% | 17,4 s |
| Sin entrenar (Qwen3.5-0.8B base) | 24,5% | 0% | 40% | — |
| Ajuste supervisado (LoRA SFT) | 54,7% | 85% | 35% | 20,0 s |
| Ajuste supervisado + RL (PPO con KL) | 59,9% | 85% | 0% | 16,0 s |

No se han publicado resultados en benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Para un modelo base de 0,8B en precisión FP16 se requieren aproximadamente 1,6 GB solo para los pesos, más la caché KV y el overhead del runtime; en cuantización de 8 bits o 4 bits el requisito baja por debajo de 1 GB, aunque la model card no documenta cuantizaciones probadas.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) debería poder ejecutar el modelo base en FP16; para despliegues con concurrencia se recomienda una GPU de datacenter (A10, L4, A100) sin que haya datos publicados de throughput.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño del modelo base y del adaptador (0,1 GB). No se han publicado mediciones.
- Opciones de despliegue: la model card solo documenta `transformers` + `peft` en Python. No hay instrucciones ni artefactos para vLLM, llama.cpp, Ollama o TGI; al ser un adaptador LoRA sobre un modelo causal estándar, la conversión a GGUF requeriría fusionar el adaptador con el modelo base y no está documentada.
- Latencia y throughput: no disponibles. La tarea exige una decisión cada 0,5 segundos, pero no se publican tiempos de inferencia por paso.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA de destilación de políticas RL para control de robots) dentro de la documentación proporcionada. La comparación más directa disponible es interna al propio proyecto:

| Modelo | Base | Parámetros | Contexto | Éxito en tarea | Licencia |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | Qwen3.5-0.8B + LoRA | 0,8B + adaptador | No disponible | 85% (20 episodios) | Apache 2.0 |
| Profesor PPO (`brain.json`) | Red de política específica | No disponible | No aplica | 100% (20 episodios) | No disponible |
| Qwen3.5-0.8B sin ajustar | Qwen3.5-0.8B | 0,8B | No disponible | 0% (20 episodios) | No disponible |

## Limitaciones y advertencias

- Ámbito muy restringido: el modelo solo está entrenado para la tarea `goto_target` con el contrato de observación `obs21-act5/walker51-14/v1`; fuera de ese formato o de esa tarea no hay garantía de comportamiento válido.
- Evaluación aproximada: la locomoción se puntúa con una tabla de velocidades 2D derivada de MuJoCo, no con el simulador completo; los resultados pueden no transferirse al entorno web ni a un robot físico.
- Brecha con el profesor: la coincidencia con la política PPO es del 59,9%, por debajo del 85% de éxito en episodios; el modelo no reproduce fielmente al profesor y su política es una aproximación con distinto perfil de error.
- Sesgos conocidos: no documentados. El entrenamiento se limita a un curso sintético (`23b8d36f`) y a semillas concretas, por lo que puede sobreajustarse a la geometría y a las condiciones de ese escenario.
- Riesgo de alucinación: el modelo puede devolver una letra fuera del conjunto de opciones o texto adicional si la entrada se desvía del formato esperado; el system prompt prescribe una única letra sin explicación, pero no hay validación de salida documentada.
- Idioma: la model card declara únicamente coreano; el prompt de sistema está en inglés, lo que sugiere un uso mixto no documentado formalmente.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado; el autor no detalla términos adicionales.
- Aviso del autor: se trata de un modelo de investigación y educación sobre simulador; antes de usarlo en un robot real debe revalidarse en ese robot y en ese espacio concreto.
- Sin datos de benchmarks estándar de lenguaje ni de latencia, lo que impide estimar su rendimiento en producción más allá del dominio de control.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Luna002-Luna75/connectailab-rl-lunaluna-target-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Laboratorio web de robots (entorno de entrenamiento): https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
