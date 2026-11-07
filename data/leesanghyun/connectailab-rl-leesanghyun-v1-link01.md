# LeeSanghyun/connectailab-rl-leesanghyun-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT sobre el modelo base Qwen/Qwen3.5-0.8B, entrenado por LeeSanghyun en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. Su función es actuar como "cerebro de decisión" para el robot simulado LINK-01 en una tarea concreta de evitación de obstáculos (`avoid_obstacles`): recibe en texto el estado del robot (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y elección previa) y devuelve una única letra que indica cómo debe caminar durante los siguientes 0,5 segundos.

El modelo no es un LLM de propósito general ni un modelo de robótica real: es un student que imita y luego refina, mediante aprendizaje por refuerzo con PPO, el comportamiento de una política (un "teacher" o brain.json) previamente entrenada con PPO en un simulador web de aprendizaje por refuerzo. El pipeline combina tres fases: generación de un dataset de 2.546 problemas (1.700 train / 337 valid / 509 test) a partir de las observaciones del teacher, ajuste supervisado con LoRA y una etapa posterior de RL con penalización KL respecto a la política supervisada.

Es relevante ahora como ejemplo didáctico y de investigación de cómo destilar una política de RL en un modelo de lenguaje pequeño (0,8B) mediante adaptadores de bajo rango, y como muestra de las limitaciones prácticas de ese enfoque: los resultados publicados indican que el adaptador final rinde por debajo del teacher y que la etapa de RL empeora el éxito en la tarea de caminar frente al ajuste supervisado. La licencia es Apache 2.0 y el idioma declarado es coreano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen3.5-0.8B |
| Parámetros totales | No disponible (el adaptador LoRA no declara número de parámetros; el modelo base tiene 0,8B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, no especificada en la información) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8B parámetros, mediante LoRA. El entrenamiento se organiza en cuatro etapas descritas por el autor: (1) entrenamiento del teacher con PPO en el simulador web (`avoid_obstacles`, contrato `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1`, curso `58e88ecf`, 75 % en el examen oficial); (2) construcción del dataset convirtiendo cada 0,5 s las observaciones del teacher en problemas de texto con la respuesta correcta, incluyendo un 20 % de casos en los que el teacher se desvió; (3) ajuste supervisado con LoRA para imitar al teacher; (4) refinamiento con RL y PPO, usando como recompensa el retorno que habría obtenido el teacher si hubiera ejecutado la opción elegida, con anclaje KL a la política supervisada.

El dataset consta de 1.700 ejemplos de entrenamiento, 337 de validación y 509 de test. La tasa de coincidencia entre la representación textual y la respuesta del teacher (techo de acierto) es del 99 %. La evaluación de la marcha se realizó con una aproximación 2D basada en una tabla de velocidades por comando derivada del simulador web MuJoCo, sin red neuronal de marcha, por lo que no reproduce fielmente la dinámica del simulador.

## Capacidades

- Clasificación de acciones discretas: dado un estado textual, selecciona exactamente una letra entre las opciones listadas.
- Decisión de locomoción a corto plazo (0,5 s) para el robot simulado LINK-01 en la tarea `avoid_obstacles`.
- Formato de salida restringido: solo la letra, sin explicación, bajo un system prompt específico.
- Tratamiento del estado como datos, no como instrucciones (el prompt indica explícitamente esta separación).
- No dispone de tool calling, function calling, capacidades de agente multi-paso, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al coreano declarado; no se documenta soporte de otros idiomas.
- No es un modelo de robótica real: opera sobre representaciones textuales de observaciones simuladas.

## Casos de uso

- Investigación en destilación de políticas de RL: sirve como caso de estudio reproducible de cómo convertir una política PPO en un adaptador LoRA sobre un LLM pequeño, con dataset y métricas publicadas.
- Docencia de aprendizaje por refuerzo: el repositorio, el cuaderno de Colab y el simulador web permiten reproducir el pipeline completo (teacher, dataset, SFT, RL) en un entorno educativo.
- Prototipado de controladores basados en lenguaje en simulación: útil para experimentar con interfaces texto-acción en entornos 2D antes de portar la lógica a un robot real.
- Evaluación de técnicas de anclaje KL en RL sobre LLM: el modelo documenta explícitamente el efecto del término KL y permite comparar SFT frente a SFT+RL en una tarea concreta.
- Generación de datos sintéticos de decisión: el formato de problema (estado, pregunta, opciones) puede reutilizarse para crear datasets de clasificación de acciones en otros dominios simulados.
- Referencia negativa en estudios de alineación: los resultados publicados (éxito del 0 % en las 20 partidas de evaluación y 100 % de colisiones para la variante RL) son un ejemplo útil de cuándo el RL empeora el rendimiento frente al SFT.
- Integración en pipelines de simulación a pequeña escala: puede conectarse como módulo de decisión en el entorno `connect_tycoon.link01` mediante la función `Q.task_of`, siempre con validación adicional en el simulador.

## Benchmarks y rendimiento

Resultados publicados por el autor (evaluación sobre 509 problemas de test y 20 partidas con semillas 91001–91020 en la misma pista):

| Modelo | Acierto en test (coincidencia con el teacher) | Éxito en 20 partidas | Partidas con colisión | Tiempo medio de las partidas exitosas |
|---|---|---|---|---|
| Teacher (brain.json) | 100,0 % | 50 % | 0 % | 38,8 s |
| Modelo sin entrenar | 18,9 % | 0 % | 10 % | — |
| Ajuste supervisado (SFT) | 31,2 % | 0 % | 10 % | — |
| RL (modelo publicado) | 22,8 % | 0 % | 100 % | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La evaluación de marcha emplea una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre un modelo base de 0,8B, la huella es la del modelo base más el adaptador, que es pequeño en comparación.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del modelo base, es plausible su ejecución en GPU de consumo, pero no se documenta.
- Cabe en GPU de consumo: no confirmado en la información disponible.
- Opciones de despliegue: `transformers` + `peft` (carga mediante `PeftModel.from_pretrained` sobre `AutoModelForCausalLM`). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (LINK-01 LoRA) | Adaptador sobre 0,8B | No disponible | Decisión `avoid_obstacles` en simulación | Apache 2.0 | Hugging Face (0 descargas) |
| connectailab-rl-LeeSanghyun-v5-teacher | No disponible | No disponible | Política de juego (no adaptador Qwen) | No disponible | Hugging Face |
| connectailab-rl-LeeSanghyun-v7-teacher | No disponible | No disponible | Política de juego (no adaptador Qwen) | No disponible | Hugging Face |

Los dos repositorios `v5-teacher` y `v7-teacher` del mismo autor son políticas entrenadas directamente en el juego, no adaptadores LoRA sobre Qwen, por lo que no son estrictamente comparables. No se dispone de información sobre otros modelos de decisión robótica comparables en la búsqueda realizada.

## Limitaciones y advertencias

- Rendimiento insuficiente en la tarea objetivo: 0 % de éxito en las 20 partidas de evaluación y 100 % de colisiones para la variante RL publicada; el propio autor indica que el modelo subido es el de ajuste supervisado en la fase de selección, pero la tabla muestra 0 % de éxito también para SFT.
- El RL empeora el acierto en test (22,8 %) frente al SFT (31,2 %), lo que sugiere un problema de estabilidad o de diseño de recompensa.
- La evaluación de marcha usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo real, por lo que los resultados pueden diferir de la dinámica física.
- El autor advierte explícitamente que es un modelo de investigación y educación sobre simulador y que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- Riesgo de alucinación y de salida fuera de formato: el modelo debe devolver solo una letra; no se documenta robustez ante estados malformados o fuera de distribución.
- Sesgos: no documentados. El entrenamiento se limita a una única pista (`58e88ecf`) y a una tarea, lo que reduce la generalización.
- Idiomas: solo coreano declarado; el system prompt está en inglés, lo que puede afectar el comportamiento en otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza experimental y el bajo rendimiento hacen desaconsejable su uso en producción sin validación adicional.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni comunidad documentada.

## Enlaces

- Hugging Face: https://huggingface.co/LeeSanghyun/connectailab-rl-leesanghyun-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
- Repositorio relacionado v5-teacher: https://huggingface.co/LeeSanghyun/connectailab-rl-LeeSanghyun-v5-teacher
- Repositorio relacionado v7-teacher: https://huggingface.co/LeeSanghyun/connectailab-rl-LeeSanghyun-v7-teacher
