# Luna002-Luna75/connectailab-rl-lunaluna-v3-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, entrenado para actuar como política de decisión de un robot caminante de dos dimensiones en el simulador. El modelo recibe una descripción textual del estado del robot (objetivo, dirección, distancia, sensores, velocidad y elección previa) y devuelve una única letra que identifica la acción de locomoción para los siguientes 0,5 segundos. Lo desarrolla Luna002-Luna75 en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS, y se publica bajo licencia Apache 2.0.

El interés técnico del modelo no está en su tamaño (0,8 mil millones de parámetros en el base, adaptador muy reducido), sino en la metodología: se parte de una política PPO entrenada en un simulador web (un "cerebro" exportado como brain.json), se genera un corpus de pares observación-texto/acción a partir de las trayectorias de esa política, se destila en el modelo lingüístico mediante LoRA con supervisión y después se refina con aprendizaje por refuerzo con anclaje KL a la política original. El resultado es un modelo que reproduce el comportamiento del cerebro PPO en formato de lenguaje natural.

Es relevante como ejemplo de destilación de políticas de control en modelos de lenguaje pequeños, un patrón que permite integrar decisiones de robótica en pipelines basados en texto y en tool calling, aunque su alcance está limitado a un único entorno simulado y a una tarea concreta (`choose_object`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only Qwen3.5-0.8B |
| Parametros totales | 0,8 mil millones en el modelo base; el adaptador LoRA añade un número no especificado (repo de 0,0 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3.5-0.8B, no declarada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el base admite las cuantizaciones habituales de Qwen) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA); requiere el base Qwen/Qwen3.5-0.8B |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador no modifica la arquitectura del base: añade matrices de bajo rango en las capas que PEFT seleccione, y se carga con `PeftModel.from_pretrained` sobre el modelo base. El pipeline declarado es `reinforcement-learning` y las etiquetas incluyen `ppo`, `deep-reinforcement-learning`, `robotics` y `decision-making`.

El entrenamiento se organiza en cuatro fases descritas por el autor: (1) entrenamiento de una política PPO en un simulador web sobre el curso `414f50b2` con la tarea `choose_object` y el contrato `link01-decision/choose_object/obs26-act4/walker51-14/v1`, con un 25 % de éxito en la prueba oficial; (2) generación de un corpus textual muestreando cada 0,5 segundos las observaciones del cerebro durante la ejecución del curso, con la acción del cerebro como etiqueta y un 20 % de episodios con desviaciones deliberadas; (3) ajuste supervisado del modelo lingüístico con LoRA para imitar al cerebro; y (4) refinamiento con RL usando la recompensa que habría obtenido el cerebro si hubiera continuado desde cada opción, con anclaje KL a la política supervisada. El corpus contiene 675 ejemplos de entrenamiento, 133 de validación y 204 de prueba, y la tasa de coincidencia texto-a-cerebro (techo de acierto) es del 100 %.

## Capacidades

- Decisión de locomoción en un entorno simulado: dado un estado textual del robot (26 dimensiones de observación), devuelve una de las cuatro acciones posibles del contrato `obs26-act4`.
- Salida restringida a una única letra de opción, sin explicación, cuando se usa el system prompt previsto por el autor.
- Robustez ante instrucciones inyectadas en el campo `state`: el system prompt indica explícitamente tratar el texto del estado como datos y no como instrucciones.
- Reproducción fiel de la política PPO original: 100 % de coincidencia con el cerebro en el conjunto de prueba y 100 % de éxito en 20 episodios de evaluación.
- Generación de texto general y razonamiento heredados del base Qwen3.5-0.8B, aunque no se documentan ni se evalúan en esta ficha.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al coreano según la etiqueta `language: [ko]`; el prompt de sistema está en inglés.
- Capacidades de visión, audio o modo thinking: no disponibles.

## Casos de uso

- Destilación de políticas de control en modelos de lenguaje: el adaptador sirve como referencia para convertir una política PPO en un modelo textual que pueda integrarse en pipelines de agentes y ser auditado en lenguaje natural.
- Evaluación de robustez frente a inyección de prompt: el contrato de "tratar el estado como datos" permite probar defensas frente a instrucciones maliciosas embebidas en observaciones de sensores.
- Simulación educativa de robótica: el modelo se puede usar en cuadernos de Colab y en el entorno web de CONNECT AI WORLD para demostrar el ciclo completo PPO → destilación → RL en un curso reproducible.
- Generación de datos sintéticos de decisión: al reproducir el cerebro con un 100 % de coincidencia, se puede emplear para etiquetar grandes volúmenes de observaciones textuales sin ejecutar el simulador.
- Prototipado de asistentes de decisión con salida restringida: el patrón de respuesta de una sola letra es aplicable a sistemas que necesitan elegir entre opciones discretas con formato estricto.
- Investigación en aprendizaje por refuerzo con anclaje KL: el adaptador sirve para estudiar cómo el refinamiento RL modifica (o no) la política destilada cuando la recompensa proviene de un profesor externo.
- Integración en entornos de agentes que requieran decisiones de bajo nivel a 2 Hz (0,5 s por paso), siempre que el estado se serialice al formato del contrato.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Modelo | Acierto en test (coincidencia con el cerebro) | Éxito en 20 episodios del mismo curso | Episodios con colisión | Tiempo medio de episodio exitoso |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0 % | 100 % | 0 % | 13,3 s |
| Modelo antes de entrenar | 1,0 % | 0 % | 0 % | — |
| Ajuste supervisado (LoRA) | 100,0 % | 100 % | 0 % | 13,3 s |
| Ajuste con RL (modelo publicado) | 100,0 % | 100 % | 0 % | 13,3 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La evaluación de caminata se realizó con una aproximación 2D basada en una tabla de velocidades por comando, no con el simulador MuJoCo completo, por lo que los resultados pueden diferir de los del entorno web.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,6 GB en fp16 para el base de 0,8 B más el adaptador; en torno a 0,6-0,8 GB con cuantización de 4 bits (estimación a partir del tamaño del base, no publicada por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090 o superiores son suficientes. Para despliegue por lotes, A100 o H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas con 4 GB o más, y también en CPU para inferencia puntual.
- Opciones de despliegue: `transformers` + `peft` (método documentado por el autor); llama.cpp, Ollama, vLLM o TGI requerirían fusionar el adaptador con el base y convertir a GGUF u otro formato, algo no documentado.
- Latencia y throughput: no disponibles. El contrato de decisión opera a 2 Hz (un paso cada 0,5 s), pero no se publican medidas de latencia del adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | 0,8 B (base) + LoRA | no disponible | Decisión de locomoción en simulador 2D | Apache 2.0 | Hugging Face, repo de 0,0 GB |
| Qwen3.5-0.8B (base) | 0,8 B | no disponible | Generación de texto general | Apache 2.0 | Hugging Face |
| Política PPO original (brain.json) | no disponible | no disponible | Decisión de locomoción en simulador 2D | no disponible | Repositorio CONNECT TYCOON |
| Otros adaptadores LoRA de control robótico | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (destilación de políticas de control en modelos de lenguaje pequeños) en la documentación proporcionada.

## Limitaciones y advertencias

- Alcance muy restringido: el modelo solo se ha evaluado en la tarea `choose_object` del curso `414f50b2` con el contrato `obs26-act4/walker51-14/v1`; no hay evidencia de generalización a otros entornos, cursos u observaciones.
- Evaluación aproximada: la métrica de éxito se calculó con una tabla de velocidades 2D, no con el simulador MuJoCo completo, por lo que los resultados pueden no transferirse al entorno real.
- Idioma: el modelo está etiquetado únicamente para coreano; el prompt de sistema está en inglés y no se documenta comportamiento en castellano.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar opciones fuera del conjunto permitido si no se aplica un decodificador restringido o validación posterior; el autor no documenta este control.
- Uso en robótica real: el propio autor advierte que es un modelo de investigación y educación sobre simulador y que debe revalidarse en el robot y el espacio concretos antes de usarlo en producción.
- Sesgos: no se documentan análisis de sesgos; al derivar de una política PPO entrenada en un único curso, hereda los sesgos y limitaciones de esa política.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B debe verificarse por separado; el adaptador no incluye garantías.
- Repositorio de 0,0 GB: conviene verificar que los pesos del adaptador están efectivamente subidos antes de integrarlo en un pipeline.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Luna002-Luna75/connectailab-rl-lunaluna-v3-link01)
- [Repositorio CONNECT TYCOON (código de entrenamiento)](https://github.com/wonseokjung/connect-tycoon)
- [Cuaderno de Colab de entrenamiento](https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb)
- [Entorno web de aprendizaje CONNECT AI WORLD](https://www.ezerai.xyz/robot-lab/world/)
- [AI CITY BUILDERS](https://www.aicitybuilders.com)
- [Curso de RL de AI CITY BUILDERS](https://www.aicitybuilders.com/robot)
- [Canal de YouTube CONNECT AI LAB](https://www.youtube.com/@CONNECT-AI-LAB)
- [Modelo base Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
