# sf7com/connectailab-rl-kenny-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por sf7com bajo el paraguas de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un modelo de decisión para el robot simulado LINK-01: recibe en texto el estado del robot (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y la acción previa) y responde con una única letra que codifica cómo debe caminar durante los siguientes 0,5 segundos. Está etiquetado con pipeline `reinforcement-learning` y entrenado mediante PPO más ajuste supervisado y una fase de RL con anclaje KL.

El modelo es relevante como ejemplo de destilación de una política de RL (un "cerebro" entrenado en un entorno web con MuJoCo) hacia un modelo de lenguaje pequeño de 0,8 mil millones de parámetros, de modo que el LLM reproduzca las decisiones del profesor a partir de una representación textual del estado. La tarea concreta es `goto_target`, con observaciones de 21 dimensiones y 5 acciones discretas, y el adaptador se distribuye como pesos PEFT en formato safetensors.

El repositorio es de tamaño prácticamente nulo (0,0 GB), sin descargas ni likes en el momento de la consulta, y la model card está redactada en coreano. Se trata de un artefacto de investigación y educación sobre simulación, no de un modelo listo para producción en robótica real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | 0,8 mil millones en el modelo base; parámetros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen/Qwen3.5-0.8B; no especificada en la información) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; cuantización del base no especificada) |
| Idiomas soportados | coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador se carga con `peft.PeftModel` sobre el modelo base y se usa con un prompt de sistema fijo que instruye al modelo a evaluar una tarea de decisión, tratar el texto del estado como datos y devolver únicamente la letra de una de las opciones listadas.

El entrenamiento se articula en cuatro fases descritas en la model card. Primero se entrena una política PPO en un simulador web (tarea `goto_target`, observación de 21 dimensiones, 5 acciones, curso `e6333200`, éxito del 100 % en el examen oficial). Después se genera un conjunto de problemas convirtiendo cada 0,5 segundos la observación del robot en texto, con la respuesta del "cerebro" como etiqueta y un 20 % de ejemplos con desviaciones. Sobre ese conjunto se hace ajuste supervisado con LoRA, seguido de una fase de RL que recompensa las opciones con mejor retorno estimado y penaliza las peores, con anclaje KL al modelo supervisado. Los conjuntos tienen 522 ejemplos de entrenamiento, 96 de validación y 149 de test, y la tasa de coincidencia entre la representación textual y el cerebro original (techo de acierto) es del 99 %.

## Capacidades

- Decisión discreta de locomoción: dado un estado textual del robot, elige una de 5 acciones posibles para el siguiente intervalo de 0,5 segundos.
- Seguimiento de objetivo (`goto_target`) en un entorno simulado 2D.
- Interpretación de observaciones estructuradas en texto: distancia y dirección al objetivo, sensores de distancia, velocidad y acción previa.
- Salida restringida a una única letra, sin explicación, lo que facilita el parseo automático.
- Robustez parcial ante instrucciones embebidas en el estado (el prompt de sistema indica tratar el estado como datos, no como instrucciones).
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- Multilingüe limitado: la model card y el entrenamiento se orientan al coreano.

## Casos de uso

- Investigación en destilación de políticas RL a LLM: usar el adaptador como referencia para estudiar cómo una política PPO puede transferirse a un modelo de lenguaje pequeño mediante SFT más RL con KL.
- Educación en robótica simulada: el notebook de Colab y el repositorio CONNECT TYCOON permiten reproducir el pipeline completo (entrenamiento del cerebro, generación de problemas, LoRA y evaluación).
- Evaluación de decisiones en entornos discretos: integrar el adaptador como módulo de decisión en un bucle de simulación 2D para comparar su comportamiento con la política original.
- Prototipado de agentes con salida restringida: el formato de respuesta de una sola letra sirve para probar pipelines de parseo estricto en sistemas de decisión.
- Análisis de robustez ante prompt injection: el diseño con estado delimitado como datos permite experimentar con ataques de instrucciones embebidas en la observación.
- Docencia sobre PEFT: el adaptador es un ejemplo mínimo de LoRA sobre un modelo de 0,8 B, útil para demostrar carga, inferencia y evaluación con `peft` y `transformers`.
- No se recomienda su uso directo en robótica física sin revalidación en el robot y el espacio concretos, tal como advierte el autor.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluación sobre 149 problemas de test y 20 episodios de caminata con semillas 91001–91020):

| Modelo | Acierto en test (coincidencia con el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0 % | 100 % | 0 % | 11,4 s |
| Antes del entrenamiento | 37,6 % | 0 % | 0 % | — |
| Ajuste supervisado (SFT) | 71,1 % | 75 % | 0 % | 11,5 s |
| RL (modelo publicado) | 71,1 % | 75 % | 0 % | 11,5 s |

La evaluación de la caminata se realizó con una aproximación 2D basada en una tabla de velocidades por comando, no con el robot ni la red de locomoción reales; el autor indica que los resultados pueden diferir de los de MuJoCo en la web. No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: un modelo base de 0,8 B en fp16 ocupa aproximadamente 1,6 GB de pesos; en cuantización de 8 bits, alrededor de 0,8 GB; en 4 bits, en torno a 0,4 GB. El adaptador LoRA añade un consumo marginal no cuantificado en la información.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para el modelo base en fp16; para lotes grandes o mayor throughput, una RTX 4090 o una A100/H100 aportan margen sobrado.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores.
- Opciones de despliegue: `transformers` junto con `peft` (método documentado por el autor); el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este adaptador y requerirían fusionar el LoRA con el modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sf7com/connectailab-rl-kenny-v1-link01 | 0,8 B (base) + LoRA | no disponible | Decisión de robot simulado (PPO destilado) | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B | no disponible | LLM generalista | no disponible en la información | HuggingFace |
| Política PPO "cerebro" LINK-01 | no disponible | no aplica | Política RL en simulador web | no disponible | Repositorio CONNECT TYCOON |

No se dispone de datos de benchmarks comparables con otros adaptadores de decisión de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación y educación sobre simulación; el autor advierte explícitamente que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- La evaluación de la caminata usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo ni el robot real, por lo que los resultados pueden diferir.
- El ajuste supervisado y el RL obtienen idéntico acierto en test (71,1 %) y éxito en episodios (75 %), lo que sugiere un margen de mejora limitado del RL en esta configuración.
- El techo de acierto por la conversión a texto es del 99 %, no del 100 %: parte del error es irreducible por la representación textual del estado.
- Entrenado y documentado en coreano; el soporte de otros idiomas no está garantizado.
- Riesgo de alucinación en la elección de letra: el modelo puede devolver opciones no válidas si el prompt no se respeta, aunque el formato de salida restringido lo mitiga.
- No se documentan sesgos específicos más allá de los heredados del modelo base Qwen.
- Licencia Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base y de su propia licencia, no detallada en la información.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa conocida.

## Enlaces

- HuggingFace: https://huggingface.co/sf7com/connectailab-rl-kenny-v1-link01
- Repositorio de código: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno de entrenamiento web: https://www.ezerai.xyz/robot-lab/world/
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
