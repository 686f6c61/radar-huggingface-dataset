# Martinyooo/connectailab-rl-martinyooo-v1-link01

## Resumen

LINK-01 es un adaptador LoRA entrenado por Martinyooo (en el contexto del proyecto CONNECT AI LAB × AI CITY BUILDERS) sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo de propósito general: es un "cerebro" de decisión para el robot simulado LINK-01, especializado en la tarea `avoid_obstacles`. El modelo recibe en texto el estado del robot (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa) y devuelve una única letra correspondiente a la acción de locomoción para los próximos 0,5 segundos.

La relevancia técnica está en el método: primero se entrena una política PPO en un simulador web (el "profesor" o *brain.json*), después se generan pares observación-en-texto → acción del profesor, se hace un ajuste supervisado con LoRA sobre Qwen3.5-0.8B y finalmente se aplica RL (con anclaje KL) para corregir las respuestas hacia acciones con mayor recompensa esperada. El resultado es un modelo de lenguaje pequeño que emula una política de control con una tasa de coincidencia con el profesor del 73,3% en el conjunto de test y un 75% de éxito en 20 episodios de evaluación.

El modelo es de nicho, con licencia Apache 2.0, publicado en octubre de 2026, con 16 descargas y sin likes. Está pensado para investigación y educación en robótica simulada, no para control de robots reales sin revalidación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parámetros totales | 0,8B en el modelo base; el adaptador LoRA no reporta recuento propio en la información disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B; no especificada en la model card) |
| Tipos de cuantización | no disponible (pesos en safetensors; el adaptador puede combinarse con cuantizaciones del base, pero no se documenta) |
| Idiomas soportados | coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El pipeline de entrenamiento tiene tres fases documentadas: (1) entrenamiento de una política PPO en el simulador web del proyecto, con la tarea `avoid_obstacles`, contrato `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1`, curso `random` y un 85% de éxito en el examen oficial; (2) generación de un corpus de decisión a partir de las observaciones del profesor cada 0,5 segundos, con la respuesta correcta igual a la acción del profesor y un 20% de ejemplos con desviaciones deliberadas; (3) ajuste supervisado con LoRA y posterior RL con anclaje KL, donde cada opción recibe como recompensa el retorno que habría obtenido el profesor si el modelo hubiera elegido esa acción y el resto lo hubiera continuado el profesor.

El conjunto de datos resultante tiene 1.167 ejemplos de entrenamiento, 235 de validación y 367 de test. La tasa de coincidencia entre la representación textual y la respuesta del profesor (techo de acierto) es del 99%. La evaluación de la política se hizo con una aproximación 2D del caminado (tabla de velocidades por comando del simulador web MuJoCo), sin red neuronal de locomoción, por lo que no hay caídas y los resultados pueden diferir ligeramente de MuJoCo.

## Capacidades

- Decisión de acciones discretas: dado un estado textual del robot, devuelve una única letra entre las opciones listadas.
- Formato de salida estricto: el *system prompt* recomendado exige devolver solo la letra, sin explicación.
- Tratamiento del estado como datos, no como instrucciones (defensa básica frente a inyección de prompt en el campo de estado).
- Especialización en evitación de obstáculos (`avoid_obstacles`) para el robot LINK-01.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al coreano según la model card; el *system prompt* de ejemplo está en inglés.
- Capacidades especiales: no se documentan *thinking mode*, visión ni audio.
- No se documenta generación de texto libre, código ni matemáticas como capacidades objetivo del adaptador.

## Casos de uso

- Investigación en imitación de políticas RL: usar el adaptador como *student* de una política PPO para estudiar la fidelidad de la destilación de políticas de control en modelos de lenguaje pequeños.
- Educación en RL y robótica simulada: el notebook de Colab y el repositorio CONNECT TYCOON permiten reproducir el pipeline completo (PPO → dataset → SFT → RL) con un coste computacional bajo.
- Evaluación de *prompting* estructurado: el modelo sirve para probar formatos de estado textual y *system prompts* estrictos en tareas de clasificación de acciones.
- Prototipado de agentes de decisión en entornos grid o 2D: sustituir la política por el adaptador en un simulador ligero para comparar latencia y tasa de éxito.
- *Benchmarking* de adaptadores LoRA sobre modelos de 0,8B: comparar SFT frente a SFT+RL con el mismo base y el mismo dataset.
- Docencia de evaluación de políticas: usar la tabla de resultados (profesor, pre-entrenamiento, SFT, RL) como caso de estudio de brecha entre imitación y optimización de recompensa.
- Integración en demos web del simulador: el adaptador puede servirse junto al base Qwen3.5-0.8B para responder decisiones en tiempo real en el navegador o en un backend ligero.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluación sobre 20 episodios, semillas 91001–91020, con aproximación 2D del caminado):

| Modelo | Acierto en test (coincidencia con el profesor) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Profesor (PPO) | 100,0% | 100% | 0% | 27,3 s |
| Base sin entrenar | 42,8% | 0% | 10% | — |
| SFT (LoRA) | 69,5% | 70% | 40% | 30,2 s |
| SFT + RL (este modelo) | 73,3% | 75% | 60% | 28,6 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3.5-0.8B en FP16 requiere aproximadamente 1,6 GB de pesos; en cuantización de 8 bits, en torno a 0,8–1 GB; en 4 bits, en torno a 0,5 GB. El adaptador LoRA añade una fracción mínima. Estas cifras son estimaciones a partir del tamaño del base, no datos publicados en la model card.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente para FP16; para servir varias instancias conviene una A10, L4, A100 o H100.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado en la model card), vLLM y TGI con soporte de adaptadores LoRA, llama.cpp/Ollama si se fusiona el adaptador con el base y se convierte a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. La tarea es de clasificación de una sola letra, por lo que la latencia estará dominada por el *prefill* del estado textual y no por la decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este adaptador) | 0,8B (base) + LoRA | no disponible | Decisión `avoid_obstacles` en texto | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | Lenguaje general | Apache 2.0 (según la model card del adaptador) | HuggingFace |
| Política PPO del proyecto (brain.json) | no aplica (política tabular/red pequeña) | no aplica | Decisión `avoid_obstacles` | no disponible | Repositorio CONNECT TYCOON |

No se dispone de otros adaptadores comparables de la misma familia en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea `avoid_obstacles` del robot LINK-01; fuera de ese dominio no se ha evaluado.
- El 73,3% de acierto en test implica que aproximadamente una de cada cuatro decisiones no coincide con el profesor; en producción esto puede traducirse en desviaciones de trayectoria.
- La tasa de colisión en los 20 episodios de evaluación es del 60% con el modelo RL, superior al 40% del SFT y al 0% del profesor. El éxito del 75% convive con un número alto de colisiones, un dato relevante para cualquier uso realista.
- La evaluación se hizo con una aproximación 2D del caminado (tabla de velocidades), no con el simulador MuJoCo completo; los resultados pueden diferir.
- El modelo está pensado para simulación y educación; la propia model card advierte de que debe revalidarse en el robot y el espacio concretos antes de usarse en un robot real.
- Idiomas: la model card declara solo coreano; el *system prompt* de ejemplo está en inglés, lo que puede afectar a la robustez si se cambia el idioma del estado.
- Riesgo de inyección de prompt: el estado del robot se inserta como texto; el *system prompt* recomendado mitiga el problema, pero no hay garantía formal.
- No se documentan sesgos específicos, pero al derivar de un modelo base general puede heredar sesgos de Qwen3.5-0.8B.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks estándar y de validación fuera del simulador desaconseja su uso comercial sin una evaluación adicional.
- El repositorio tiene 0,0 GB reportados y 16 descargas; la trazabilidad y el soporte de la comunidad son mínimos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Martinyooo/connectailab-rl-martinyooo-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
