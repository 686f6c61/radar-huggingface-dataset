# rhemslkim/connectailab-rl-rere-v5-link01

## Resumen

connectailab-rl-rere-v5-link01 es un adaptador LoRA (PEFT) publicado por el usuario rhemslkim bajo la marca CONNECT AI LAB, construido sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo de lenguaje de propósito general, sino un "modelo de decisión" para el robot simulado LINK-01: recibe en texto el estado del robot (distancia al objetivo, orientación, sensores de distancia, velocidad y acción previa) y devuelve una única letra que corresponde a la acción de locomoción para los siguientes 0,5 segundos, en la tarea `avoid_obstacles` (esquivar obstáculos).

El pipeline declarado es reinforcement-learning y el entrenamiento combina dos fases: primero un ajuste supervisado (LoRA) en el que el adaptador imita las respuestas de una "política maestra" (un cerebro PPO entrenado en un entorno web de MuJoCo, con un 75 % de éxito en el examen oficial de la tarea), y después una fase de optimización por refuerzo con anclaje KL que reordena las preferencias entre las opciones disponibles. El conjunto de datos contiene 1.282 ejemplos de entrenamiento, 251 de validación y 374 de test.

Su relevancia es acotada y muy específica: sirve como ejemplo reproducible de destilación de una política RL en un modelo de lenguaje pequeño mediante LoRA, con un protocolo de evaluación explícito (20 episodios con semillas 91001–91020). Con 0 descargas y 0 likes en el momento del registro, y un tamaño de repositorio de 0,0 GB (solo pesos del adaptador), es un artefacto de investigación y docencia, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT); el modelo entrenado resuelve una tarea de decisión discreta sobre el estado del robot |
| Parametros totales | No disponible para el adaptador; el modelo base es de 0,8B (dato nominal del nombre del checkpoint) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, sin dato explícito en la información proporcionada) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos del adaptador en safetensors) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar por separado el modelo base Qwen/Qwen3.5-0.8B |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de 0,8B parámetros (Qwen3.5-0.8B) mediante LoRA, gestionado con la librería `peft` de Hugging Face. La tarea es de clasificación restringida: dado un prompt con el estado del robot, el modelo debe emitir exactamente una letra entre las opciones listadas, sin explicación. El prompt de sistema fijado por el autor instruye a tratar el contenido del estado como datos y no como instrucciones, y a devolver solo la letra.

El entrenamiento tiene cuatro etapas documentadas: (1) entrenamiento de la política maestra con PPO en un entorno web de aprendizaje (`avoid_obstacles`, contrato `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1`, curso `18b2956e`, 75 % de éxito en el examen oficial); (2) generación del conjunto de problemas convirtiendo cada 0,5 s las observaciones del cerebro en texto, con la respuesta del cerebro como etiqueta y un 20 % de ejemplos con acciones alternativas que desviaban al robot; (3) ajuste supervisado del modelo de lenguaje sobre esas etiquetas (LoRA); y (4) optimización por refuerzo con recompensas derivadas de "qué habría pasado si el cerebro hubiera continuado desde esa elección", con anclaje KL al modelo supervisado. El techo teórico de acierto (fidelidad de la traducción texto→decisión del cerebro) es del 99 %.

## Capacidades

- Decisión discreta de locomoción: elige una letra entre las opciones de un problema de la tarea `avoid_obstacles` para el robot LINK-01.
- Lectura de estado estructurado en texto: distancia al objetivo, orientación, lecturas de sensores de distancia, velocidad y acción previa.
- Salida estrictamente restringida: una sola letra, sin razonamiento visible ni explicación.
- Resistencia a inyección en el estado: el prompt de sistema separa datos de instrucciones.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio, matemáticas o generación de código; el adaptador está orientado a una única tarea de control.
- Multilingüismo: limitado al coreano según la etiqueta de idioma del repositorio.

## Casos de uso

- Docencia de destilación RL→LLM: usar el repositorio como ejemplo completo de cómo convertir las observaciones de una política PPO en un dataset textual y ajustar un LoRA sobre un modelo de 0,8B, reproduciendo el flujo con el notebook de Colab enlazado.
- Investigación en políticas híbridas: comparar la política maestra (PPO) con el adaptador destilado en el mismo entorno para estudiar la pérdida de rendimiento al pasar de acciones continuas a decisiones discretas mediadas por texto.
- Validación de prompts de seguridad en control: probar si un modelo pequeño respeta la instrucción de tratar el estado como datos ante intentos de inyección, usando el protocolo de evaluación del autor.
- Simulación de agentes en entornos 2D: integrar el adaptador como "cerebro" de bajo coste en simuladores de navegación con obstáculos donde el estado se serializa en texto y la acción es una letra.
- Reproducción de experimentos: reentrenar el adaptador con las semillas 91001–91020 y verificar las cifras publicadas (59,6 % de acierto en test, 0 % de éxito en las 20 partidas de caminata).
- Referencia para pipelines PEFT: servir de plantilla mínima de carga (`PeftModel.from_pretrained` sobre el base) en pruebas de integración de infraestructura de adaptadores.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Modelo | Acierto en test (misma respuesta que el cerebro) | Éxito en 20 partidas del mismo curso | Partidas con colisión | Tiempo medio de las partidas exitosas |
|---|---|---|---|---|
| Cerebro maestro (PPO) | 100,0 % | 100 % | 5 % | 27,8 s |
| Antes del entrenamiento | 44,9 % | 0 % | 0 % | — |
| Ajuste supervisado (LoRA) | 59,6 % | 0 % | 25 % | — |
| Refuerzo (modelo publicado) | 59,6 % | 0 % | 25 % | — |

El propio autor advierte que la evaluación de caminata usa una aproximación 2D basada en una tabla de velocidades por comando (sin modelo de robot ni red neuronal de locomoción), por lo que no hay caídas y los resultados pueden diferir de los de MuJoCo en la web. No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre un base de 0,8B, la inferencia en fp16 requiere del orden de 2 GB de pesos del base más la sobrecarga del adaptador y del runtime (cifra estimada, no publicada por el autor).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, un modelo de 0,8B cabe en GPU de consumo convencionales, pero no hay validación publicada.
- Compatibilidad con GPU de consumo: previsiblemente sí para el base de 0,8B; sin datos de latencia o throughput publicados.
- Despliegue: la model card solo documenta carga con `transformers` + `peft`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y la naturaleza de adaptador PEFT complica el uso directo en algunos de esos runtimes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-rere-v5-link01 (este) | Adaptador LoRA sobre base de 0,8B | No disponible | 59,6 % de acierto en test; 0 % de éxito en 20 partidas simuladas | Apache 2.0 | Hugging Face, 0 descargas |
| Cerebro maestro PPO (`brain.json`) | Política RL, no es un LLM | No aplica | 100 % de acierto en test; 100 % de éxito en 20 partidas | No disponible | Referenciado en la model card, sin enlace directo |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | No disponible | No disponible en la información proporcionada | Hugging Face |

No se dispone de datos para comparar con otras alternativas de la misma categoría (destilación de políticas RL en LLM pequeños); se indica "no disponible".

## Limitaciones y advertencias

- Ámbito muy restringido: solo resuelve la tarea `avoid_obstacles` del robot LINK-01; no es un modelo conversacional ni de propósito general.
- Rendimiento débil en la métrica principal: 59,6 % de acierto frente al cerebro maestro y 0 % de éxito en las 20 partidas de evaluación, con un 25 % de partidas con colisión.
- El ajuste por refuerzo no mejora al supervisado en las métricas publicadas (mismas cifras en test y en caminata).
- Evaluación aproximada: la caminata se mide con una tabla de velocidades 2D, no con MuJoCo ni con un robot real; los resultados pueden no corresponder al comportamiento físico.
- Riesgo de alucinación: el modelo puede emitir una letra fuera del conjunto de opciones o una respuesta con texto adicional, ya que la restricción es solo por prompt.
- Idioma: etiquetado únicamente como coreano; el prompt de sistema está en inglés y el rendimiento en otros idiomas no está documentado.
- Sesgos: no documentados por el autor; el dataset deriva de una única política y un único curso (`18b2956e`), lo que puede sobreajustar a ese trazado.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la model card restringe explícitamente el uso a investigación y educación en simulación y exige revalidar en el robot y el espacio reales antes de cualquier despliegue físico.
- Madurez: 0 descargas y 0 likes; sin mantenimiento ni issues documentados; el código de soporte (`connect_tycoon`) es externo al repositorio del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rhemslkim/connectailab-rl-rere-v5-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno de aprendizaje web del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL con IA: https://www.aicitybuilders.com/robot
