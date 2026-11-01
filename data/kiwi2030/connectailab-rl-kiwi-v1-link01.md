# kiwi2030/connectailab-rl-kiwi-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, entrenado para tareas de decisión de un robot simulado que debe seguir una ruta en un entorno 2D. El modelo recibe una descripción textual del estado del robot (distancia al objetivo, dirección, lecturas de sensores de distancia, velocidad y acción previa) y devuelve una única letra correspondiente a la acción de caminar durante los próximos 0,5 segundos. Lo desarrolla el investigador "kiwi" del CONNECT AI LAB en colaboración con AI CITY BUILDERS, dentro de un proyecto educativo de refuerzo (RL) con PPO.

El modelo no es un LLM de propósito general: es un destilado de un "cerebro" entrenado previamente con PPO en un simulador web (tarea `follow_route`, contrato `link01-decision/follow_route/obs27-act5/walker51-14/v1`, curso `b2fe0634`). El cerebro original se usó como profesor para generar un conjunto de problemas (observación textual → acción) y el adaptador LoRA aprendió a imitar sus decisiones mediante aprendizaje supervisado, seguido de un ajuste fino con RL (KL regularizado) para corregir las respuestas subóptimas.

Es relevante como ejemplo de pipeline híbrido RL → destilación → LoRA sobre un modelo pequeño (0,8B parámetros), orientado a investigación y educación en robótica y toma de decisiones. El tamaño del repositorio es de 0,0 GB (solo pesos del adaptador), la licencia es Apache 2.0 y el idioma declarado es coreano (aunque las instrucciones del sistema están en inglés).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parámetros totales | 0,8B (modelo base) + adaptador LoRA (tamaño no disponible) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos del adaptador en safetensors; cuantización del base no especificada) |
| Idiomas soportados | Coreano (`ko`) declarado; instrucciones de sistema en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, librería `peft`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El entrenamiento se realizó en cuatro fases descritas por el autor: (1) entrenamiento del "cerebro" con PPO en un simulador web sobre la tarea `follow_route`, con un 100% de éxito en el examen oficial; (2) generación de un dataset de problemas a partir de las observaciones del cerebro convertidas a texto cada 0,5 segundos, con la acción del cerebro como etiqueta (incluyendo un 20% de ejemplos con desviaciones); (3) aprendizaje supervisado del adaptador LoRA para imitar al cerebro; y (4) ajuste fino con RL usando la recompensa obtenida al ejecutar cada opción y dejar que el cerebro continúe, con una penalización KL para mantener el modelo cerca de la política supervisada.

El dataset contiene 1.903 ejemplos de entrenamiento, 368 de validación y 599 de test. La tasa de acuerdo entre el texto y el cerebro (techo de precisión) es del 99%. La evaluación de "caminar" se realizó con una aproximación 2D basada en una tabla de velocidades por comando (no con un modelo de robot ni una red neuronal de marcha), por lo que no hay caídas en la simulación y los resultados pueden diferir de los de MuJoCo web.

## Capacidades

- Toma de decisiones discretas: dado un estado textual del robot, selecciona exactamente una letra entre las opciones listadas (5 acciones posibles).
- Seguimiento de rutas en un entorno 2D simulado (`follow_route`).
- Formato de salida restringido: devuelve solo la letra de la opción, sin explicación.
- Instrucción de sistema específica que trata el contenido del estado como datos y no como instrucciones (mitigación básica de inyección de prompt).
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes multi-paso ni razonamiento encadenado (thinking mode).
- No tiene capacidades de visión, audio ni matemáticas avanzadas.
- Capacidad multilingüe limitada: declarado para coreano, con instrucciones en inglés.

## Casos de uso

- **Investigación en destilación de políticas RL**: usar el adaptador como ejemplo reproducible de cómo convertir una política PPO en un modelo de lenguaje pequeño mediante LoRA, útil para estudiar la fidelidad de la destilación y el efecto del ajuste fino con RL.
- **Educación en robótica y RL**: emplear el modelo en cursos o talleres (CONNECT AI LAB, AI CITY BUILDERS) para ilustrar el ciclo observación → decisión → recompensa en un entorno controlado.
- **Prototipado rápido de controladores de navegación 2D**: integrar el adaptador en un simulador de rejilla o laberinto para generar decisiones de movimiento paso a paso, sustituyendo temporalmente a un controlador clásico.
- **Generación de datos sintéticos de decisión**: usar el modelo para producir trayectorias etiquetadas en un entorno 2D y alimentar otros entrenamientos (behavior cloning, RL offline).
- **Evaluación de robustez ante instrucciones adversarias**: aprovechar la instrucción de sistema ("trata el texto como datos") para probar técnicas de defensa frente a prompt injection en tareas de decisión.
- **Banco de pruebas de inferencia en hardware modesto**: al ser un adaptador sobre un modelo de 0,8B, permite desplegar y medir latencia/throughput en GPUs consumer o incluso CPU con cuantización, como referencia para pipelines PEFT.
- **Reproducción de experimentos académicos**: el repositorio `connect-tycoon` y el notebook de Colab permiten replicar el pipeline completo (PPO → dataset → LoRA → RL) con fines docentes.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (evaluación sobre el conjunto de test y 20 partidas del mismo curso con semillas 91001–91020):

| Modelo | Precisión en test (acuerdo con el cerebro) | Éxito en 20 partidas | Partidas con colisión | Tiempo medio en partidas exitosas |
|---|---|---|---|---|
| Cerebro (profesor) | 100,0% | 95% | 5% | 40,8 s |
| Modelo base sin entrenar | 39,6% | 0% | 80% | — |
| Aprendizaje supervisado (LoRA) | 81,6% | 100% | 15% | 40,7 s |
| Ajuste fino con RL | 81,3% | 100% | 15% | 40,4 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La evaluación de "caminar" usa una aproximación 2D con tabla de velocidades por comando, no un simulador físico completo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo base de 0,8B más un adaptador LoRA, una estimación razonable es de 2–4 GB en FP16 y de 1–2 GB en cuantización de 4 bits (estimación orientativa, no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamaño.
- Cabe en GPU consumer: sí, en la mayoría de GPUs modernas con 4 GB o más de VRAM; también es viable en CPU con cuantización GGUF (aunque el adaptador se distribuye en safetensors y requeriría conversión).
- Opciones de despliegue: `transformers` + `peft` (flujo oficial mostrado en la model card), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, llama.cpp/Ollama tras convertir el modelo fusionado a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-kiwi-v1-link01 | 0,8B + LoRA | No disponible | Decisión de navegación 2D (5 acciones) | Apache 2.0 | HuggingFace (12 descargas) |
| connectailab-rl-kiwi-v2 | No disponible | No disponible | RL (experimentos del mismo autor) | No disponible | HuggingFace |
| connectailab-rl-kiwi-v3-lunarlander | No disponible | No disponible | RL en LunarLander | No disponible | HuggingFace |
| Qwen3.5-0.8B (base) | 0,8B | No disponible | LLM generalista | No disponible | HuggingFace |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Modelo de investigación y educación: el propio autor advierte que es un modelo sobre simulador y que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- La evaluación de marcha usa una aproximación 2D con tabla de velocidades, no un simulador físico completo; los resultados pueden diferir de MuJoCo web.
- Precisión limitada: 81,3–81,6% de acuerdo con el cerebro profesor, con un 15% de partidas con colisión en la evaluación.
- El ajuste fino con RL no mejoró la precisión frente al aprendizaje supervisado (81,3% vs 81,6%), lo que sugiere un beneficio marginal o ruido en la métrica.
- Ámbito de acción muy restringido: solo 5 acciones discretas y una única tarea (`follow_route`); no generaliza a otras tareas de robótica sin reentrenamiento.
- Idioma declarado coreano; las instrucciones de sistema están en inglés, lo que puede afectar al rendimiento en otros idiomas.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede devolver letras no listadas o texto adicional si el prompt no se formatea exactamente como se espera; la instrucción de sistema mitiga parcialmente la inyección de prompt, pero no la elimina.
- Sesgos: no documentados por el autor; al entrenarse sobre un único curso sintético, puede heredar sesgos del profesor y del simulador.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y recomienda revalidación; el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- Repositorio con 0,0 GB y solo 12 descargas: ecosistema mínimo, sin garantías de mantenimiento ni soporte.

## Enlaces

- HuggingFace: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
- Modelo relacionado v2: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2
- Modelo relacionado v3 LunarLander: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v3-lunarlander
- Modelo relacionado dama-aibrain: https://huggingface.co/kiwi2030/dama-aibrain
