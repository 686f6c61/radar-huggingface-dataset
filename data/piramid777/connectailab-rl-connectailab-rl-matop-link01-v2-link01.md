# piramid777/connectailab-rl-connectailab-rl-matop-link01-v2-link01

## Resumen

LINK-01 es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-0.8B que actúa como política de decisión para el robot simulado LINK-01 en la tarea `goto_target` (navegación hacia un objetivo). El modelo recibe una descripción textual del estado del robot (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa) y devuelve una única letra que identifica una de las cinco acciones de locomoción posibles para el siguiente intervalo de 0,5 segundos. Lo desarrolla el autor `piramid777` en el contexto de CONNECT AI LAB y AI CITY BUILDERS.

La relevancia técnica del modelo es metodológica: no entrena una política desde cero, sino que destila en un modelo de lenguaje el comportamiento de una política PPO previamente entrenada en un simulador web (el "cerebro" o `brain.json`), y después aplica un ajuste por refuerzo con señal de recompensa derivada de la propia política maestra. Es decir, se usa un LLM como capa de decisión interpretable y textual sobre un controlador de robótica simulado, con el objetivo de que el modelo verbalice decisiones que un humano pueda leer y auditar.

El adaptador tiene un tamaño de repositorio de 0,0 GB (solo pesos LoRA en safetensors), está etiquetado para coreano y se publica bajo licencia Apache 2.0. Es un artefacto de investigación y educación, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene ~0,8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantización del base no documentada) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 800 millones de parámetros, mediante LoRA. La tarea está formulada como clasificación de una sola letra entre cinco opciones (obs10-act5: observación de 10 campos, 5 acciones). El pipeline declarado es `reinforcement-learning`, con etiquetas de PPO y deep reinforcement learning.

El proceso de construcción tiene cuatro fases documentadas por el autor. Primero, se entrena una política PPO en el simulador web de CONNECT AI WORLD para la tarea `goto_target` (contrato `link01-decision/goto_target/obs10-act5/walker51-14/v1`), alcanzando un 100 % en el examen oficial. Segundo, se genera un conjunto de problemas textuales: cada 0,5 segundos se convierte la observación del robot en texto y la respuesta de la política maestra en la etiqueta correcta, incluyendo un 20 % de ejemplos con acciones subóptimas para cubrir desviaciones. Tercero, se hace ajuste supervisado (LoRA) del LLM sobre ese corpus. Cuarto, se aplica un ajuste por refuerzo con PPO y anclaje KL, usando como recompensa el retorno que obtendría la política maestra si continuara desde la acción elegida por el LLM. El conjunto de datos se reparte en 275 ejemplos de entrenamiento, 63 de validación y 84 de test.

## Capacidades

- Decisión de locomoción en un espacio discreto de cinco acciones para la tarea `goto_target` del robot LINK-01.
- Lectura de estado textual estructurado (situación, pregunta y opciones) y emisión de una única letra como respuesta, sin explicación.
- Seguimiento de instrucciones de formato estricto mediante el system prompt indicado por el autor.
- Robustez parcial ante instrucciones embebidas en el campo de estado, ya que el prompt pide tratar el texto de estado como datos y no como instrucciones.
- Capacidad multilingüe limitada al coreano para esta tarea; no se documentan capacidades de código, matemáticas, visión, audio ni tool calling.
- No se documenta soporte de agentes multi-paso ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación en destilación de políticas RL a modelos de lenguaje: el adaptador sirve como caso de estudio reproducible de cómo convertir una política PPO en un decisor textual, con código de entrenamiento publicado en el repositorio CONNECT TYCOON.
- Educación en aprendizaje por refuerzo: el notebook de Colab y los materiales del curso permiten a estudiantes entrenar y evaluar el modelo paso a paso sobre una tarea de navegación acotada.
- Evaluación de robustez de LLM frente a inyección de instrucciones en datos de estado: el system prompt del autor está diseñado explícitamente para este escenario y el modelo puede usarse como banco de pruebas.
- Prototipado de interfaces texto-a-acción para robótica simulada: permite integrar un decisor legible en un bucle de simulación sin necesidad de una red neuronal de política dedicada.
- Comparación de paradigmas supervisado frente a RL: los resultados publicados (82,1 % frente a 81,0 % de acierto en test, 65 % frente a 70 % de éxito en 20 episodios) permiten analizar el compromiso entre imitación y optimización de recompensa.
- Docencia sobre evaluación de políticas en simulación: el esquema de 20 episodios con semillas fijas (91001–91020) y la aproximación de marcha 2D sirven como ejemplo de protocolo de evaluación reproducible.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. La métrica "acierto en test" mide la coincidencia con la respuesta de la política maestra sobre 84 problemas; el éxito se mide sobre 20 episodios del mismo recorrido (semillas 91001–91020) con una aproximación de marcha 2D basada en tabla de velocidades.

| Modelo | Acierto en test | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Política maestra (PPO) | 100,0 % | 100 % | 0 % | 6,1 s |
| Modelo base sin ajuste | 20,2 % | 0 % | 0 % | — |
| Ajuste supervisado (LoRA) | 82,1 % | 65 % | 0 % | 6,1 s |
| Ajuste por refuerzo (este modelo) | 81,0 % | 70 % | 0 % | 6,1 s |

El autor indica que la cota superior de acierto alcanzable es del 99 % debido a la conversión de observaciones a texto, y que la evaluación de marcha es una aproximación que puede diferir de los resultados en MuJoCo web.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre un modelo base de ~0,8B, la inferencia en fp16 requiere del orden de 2 GB de VRAM para los pesos del base más el adaptador. Cifra orientativa, no confirmada por el autor.
- GPU recomendadas: no especificadas por el autor; cualquier GPU consumer con al menos 4 GB de VRAM debería poder cargar el modelo base en fp16, y menos aún en cuantización de 8 o 4 bits.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas tipo RTX 3060, RTX 4060 o superiores, dado el tamaño del modelo base. No verificado por el autor.
- Opciones de despliegue: transformers con PEFT (procedimiento documentado en la model card). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El bucle de decisión opera a 0,5 segundos por paso, pero no se publican medidas de latencia de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (adaptadores de decisión robótica sobre LLM para la tarea `goto_target`). Se ofrece una comparación interna entre las variantes documentadas por el autor.

| Variante | Base | Método | Acierto en test | Éxito en 20 episodios | Licencia |
|---|---|---|---|---|---|
| Este modelo | Qwen3.5-0.8B | LoRA + PPO con anclaje KL | 81,0 % | 70 % | Apache 2.0 |
| Ajuste supervisado | Qwen3.5-0.8B | LoRA supervisado | 82,1 % | 65 % | no disponible |
| Política maestra | PPO en simulador web | RL desde cero | 100,0 % | 100 % | no disponible |

Comparativas con otros modelos públicos de la misma categoría: no disponible.

## Limitaciones y advertencias

- Ámbito muy restringido: el modelo solo resuelve la tarea `goto_target` con la codificación `obs10-act5` y el contrato de observación `link01-decision/goto_target/obs10-act5/walker51-14/v1`. Fuera de ese formato su comportamiento no está garantizado.
- Entrenado exclusivamente en coreano; no se documenta rendimiento en castellano ni en otros idiomas.
- Corpus de entrenamiento pequeño (275 ejemplos), lo que limita la generalización a estados no vistos.
- La evaluación de marcha usa una aproximación 2D basada en tabla de velocidades, no el simulador MuJoCo completo; los porcentajes de éxito pueden no trasladarse al simulador real.
- El autor advierte explícitamente que es un modelo de investigación y educación sobre simulador y que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- Riesgo de alucinación: al ser un LLM, puede emitir una letra no válida o una explicación no solicitada si el prompt se desvía del formato indicado; el system prompt del autor mitiga pero no elimina este riesgo.
- El ajuste por refuerzo no mejora el acierto en test respecto al supervisado (81,0 % frente a 82,1 %), aunque sí el éxito en episodios (70 % frente a 65 %); conviene no asumir superioridad general del paso RL.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero debe verificarse la licencia del modelo base Qwen/Qwen3.5-0.8B y el cumplimiento de sus términos.
- Sesgos conocidos: no documentados por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/piramid777/connectailab-rl-connectailab-rl-matop-link01-v2-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
