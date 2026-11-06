# nawonsun/connectailab-rl-connectailab-rl-robo-yuna-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario nawonsun bajo el paraguas de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje de propósito general: es un "cerebro de decisión" para el robot simulado LINK-01, entrenado para leer el estado de un entorno 2D (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa) y responder con una única letra que codifica el movimiento a ejecutar durante los siguientes 0,5 segundos.

El modelo se construye en dos fases. Primero, se entrena una política PPO en el simulador web CONNECT AI WORLD (tarea `goto_target`, política `link01-decision/goto_target/obs21-act5/walker51-14/v1`, curso `badb8ed5`) que genera un `brain.json`. Después, se destila esa política en el modelo de lenguaje: se generan 1.200 problemas de entrenamiento, 240 de validación y 360 de test a partir de las observaciones del cerebro, se aplica un LoRA SFT y posteriormente un ajuste por refuerzo con PPO y anclaje KL. El resultado es un modelo de 0,8B de parámetros que actúa como cabecera de decisión textual en lugar de una red neuronal de política.

Su relevancia es fundamentalmente didáctica y experimental: demuestra cómo destilar una política de RL en un modelo de lenguaje pequeño y cómo evaluar la fidelidad de esa destilación (82,5% de coincidencia con el cerebro profesor en el conjunto de test). No obstante, los resultados de despliegue real son nulos en la evaluación publicada (0% de éxito en 20 episodios), lo que conviene tener muy presente antes de considerarlo para cualquier uso práctico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA añade un número no disponible de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. Sobre él se aplica un adaptador LoRA entrenado en dos etapas. La primera es un SFT supervisado sobre 1.200 ejemplos generados por el cerebro PPO: cada ejemplo convierte una observación del simulador en un prompt de texto y la acción elegida por la política en la respuesta correcta. El 20% de los ejemplos incluye deliberadamente acciones subóptimas para enseñar al modelo a reconocer y corregir desviaciones. La segunda etapa es un ajuste por refuerzo tipo PPO donde la recompensa de cada opción se estima ejecutando esa acción y dejando que el cerebro profesor complete el episodio; se aplica una penalización KL para evitar que el modelo se aleje demasiado de la distribución del SFT.

El pipeline no incluye preentrenamiento desde cero ni datos lingüísticos generales: todo el conocimiento del adaptador está acotado al formato de decisión de LINK-01. El prompt de sistema recomendado es explícito sobre el tratamiento del estado como datos y no como instrucciones, y exige devolver únicamente la letra de la opción seleccionada, sin explicación. La evaluación se realiza con una aproximación 2D del caminado (tabla de velocidades por comando derivada de MuJoCo web), no con el simulador físico completo, por lo que los resultados de éxito no son directamente trasladables al entorno real.

## Capacidades

- Decisión de movimiento discreta: dado un estado textual del robot (21 observaciones, 5 acciones posibles), selecciona una letra de acción.
- Formato de salida restringido: responde con una sola letra, sin texto adicional, cuando se usa el prompt de sistema indicado.
- Fidelidad al profesor: reproduce la acción del cerebro PPO en el 82,5% de los casos del conjunto de test.
- Robustez parcial ante desviaciones: entrenado con un 20% de ejemplos de acciones subóptimas.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni planificación de agentes.
- No tiene capacidades de visión, audio ni multimodalidad.
- Multilingüismo limitado al coreano en la metadata; el prompt de sistema está en inglés.

## Casos de uso

- Docencia de destilación de políticas RL: sirve como ejemplo reproducible de cómo convertir una política PPO en un adaptador LoRA sobre un LLM pequeño, con un notebook de Colab y código de generación de preguntas en el repositorio `connect-tycoon`.
- Investigación sobre fidelidad de destilación: permite medir la tasa de coincidencia entre profesor y alumno (82,5%) y estudiar el efecto del RL con anclaje KL frente al SFT puro (sin mejora observada en la métrica de coincidencia).
- Prototipado de cabeceras de decisión textuales: útil para experimentar con interfaces donde la política se expresa como texto estructurado en lugar de como tensor de logits, por ejemplo en entornos educativos o de depuración.
- Generación de datasets sintéticos de decisión: el pipeline de `questions.py` puede reutilizarse para producir problemas etiquetados a partir de otras políticas PPO en el mismo simulador.
- Evaluación de modelos pequeños en tareas de clasificación restringida: con 0,8B de parámetros y un adaptador LoRA, es viable ejecutarlo en hardware modesto para experimentos de clasificación de 5 clases.
- Reproducción de experimentos de RL: el repositorio incluye el código de entrenamiento y el notebook, lo que facilita replicar el flujo completo (PPO en simulador, destilación, evaluación con semillas 91001–91020).

## Benchmarks y rendimiento

| Modelo | Precisión en test (coincidencia con el profesor) | Éxito en 20 episodios del mismo curso | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro PPO (profesor) | 100,0% | 0% | 0% | — |
| Modelo sin entrenar | 0,0% | 0% | 70% | — |
| SFT (LoRA) | 82,5% | 0% | 0% | — |
| SFT + RL (PPO) | 82,5% | 0% | 0% | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La evaluación de caminado se realizó con una aproximación 2D basada en una tabla de velocidades por comando, no con el simulador MuJoCo completo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 0,8B en precisión FP16 se estiman del orden de 2 GB de pesos, más el adaptador LoRA y el overhead de activaciones.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer con al menos 4 GB de VRAM debería poder cargar el modelo base en FP16.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas tipo RTX 3060, RTX 4060 o superiores, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado en la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un adaptador LoRA específico para una tarea de decisión en un simulador concreto, por lo que no existe una categoría estándar de comparación publicada.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | 0,8B + LoRA | no disponible | Decisión discreta en simulador 2D | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo no logra completar el curso de evaluación: 0% de éxito en 20 episodios, tanto en SFT como en SFT+RL, pese a la alta coincidencia con el profesor en el conjunto de test.
- El propio profesor PPO también obtiene 0% de éxito en la misma evaluación, lo que sugiere un problema en la métrica de caminado o en el curso `badb8ed5` más que en el alumno; aun así, el resultado práctico es que el modelo no demuestra capacidad de completar la tarea.
- La evaluación se hizo con una aproximación 2D basada en una tabla de velocidades, no con el simulador MuJoCo completo; los resultados pueden diferir del entorno real.
- El alcance es extremadamente estrecho: una única tarea (`goto_target`), un único curso y un formato de observación fijo de 21 valores y 5 acciones.
- El modelo está pensado para investigación y educación; el autor advierte explícitamente que debe revalidarse en cada robot y espacio antes de usarlo en un entorno real.
- Riesgo de alucinación: aunque el prompt exige una sola letra, el modelo puede generar texto adicional o letras fuera del conjunto permitido si no se aplica un post-procesado estricto.
- El idioma declarado es coreano; el prompt de sistema está en inglés, lo que puede afectar a la consistencia en otros idiomas.
- Sesgos: no documentados por el autor; al entrenarse solo con datos de un simulador, hereda cualquier sesgo de la política PPO original.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen3.5-0.8B tiene sus propias condiciones que deben verificarse por separado.
- El repositorio tiene 0,0 GB y 18 descargas en el momento de la consulta, lo que indica un modelo muy reciente y con poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nawonsun/connectailab-rl-connectailab-rl-robo-yuna-v1-link01
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web CONNECT AI WORLD: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
