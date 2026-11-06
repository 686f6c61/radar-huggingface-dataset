# minjunglee27/connectailab-rl-highj-avoid-v1-link01

## Resumen

connectailab-rl-highj-avoid-v1-link01 es un adaptador LoRA (PEFT) sobre el modelo lingüístico Qwen/Qwen3.5-0.8B, entrenado por Minjung Lee (Highj) en el marco de CONNECT AI LAB y CONNECT TYCOON. No es un modelo de propósito general: se trata de una política de decisión encarnada ("embodied") para el robot cuadrúpedo simulado LINK-01, especializada en la tarea `avoid_obstacles`, es decir, navegar esquivando obstáculos estáticos y dinámicos hasta alcanzar un objetivo (una planta) sin colisionar.

El modelo recibe observaciones numéricas de 21 dimensiones (vector relativo al objetivo, 11 lecturas de LiDAR direccional, velocidades lineal y angular, y el historial de las 5 acciones previas) convertidas a texto estructurado, y emite una de cinco acciones discretas de locomoción (avanzar, girar a izquierda, girar a derecha, rotar en el sitio a izquierda, rotar en el sitio a derecha) a una frecuencia de 2 Hz (una decisión cada 0,5 segundos).

Su relevancia es fundamentalmente metodológica: destila el comportamiento de un profesor PPO entrenado durante 40.960 pasos con una tasa de éxito del 90,0% en 20 pruebas oficiales, trasladando esa política de control a un modelo de lenguaje pequeño (0,8B) mediante ajuste supervisado. El resultado es un artefacto de investigación reproducible, ligado a un entorno de simulación concreto, más que un modelo desplegable en robótica real sin trabajo adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parámetros totales | 0,8B en el modelo base; tamaño del adaptador no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros, sobre el que se aplica un adaptador LoRA mediante la librería PEFT. La tarea no es generación libre de texto, sino clasificación de acciones en un espacio discreto de cinco opciones, formulada como decisión lingüística sobre un prompt que describe el estado del entorno.

El entrenamiento sigue un esquema de destilación en dos fases. Primero se entrena un profesor con PPO en el simulador web CONNECT AI WORLD Robot Lab durante 40.960 pasos sobre el curso `eceb627a`, obteniendo un `brain.json` con una tasa de éxito del 90,0% (18 de 20 ejecuciones completadas, retorno acumulado 20,57). Después, las trayectorias del profesor se convierten en un "cuaderno de problemas" en lenguaje natural: cada 0,5 segundos se transforman las 21 dimensiones de observación en un prompt estructurado, y el modelo se ajusta por supervisión (SFT) para reproducir la acción elegida por el profesor. La model card identifica explícitamente la política seleccionada como SFT, no como RL directo, pese a las etiquetas `ppo` y `reinforcement-learning` del repositorio.

## Capacidades

- Decisión de locomoción discreta en el espacio de 5 acciones (`직진`, `왼쪽으로`, `오른쪽으로`, `제자리 좌회전`, `제자리 우회전`).
- Interpretación de observaciones numéricas serializadas en texto: vector relativo al objetivo (3 valores), 11 lecturas de distancia LiDAR de -100° a +100°, velocidad lineal y angular (2 valores) e historial de 5 acciones previas.
- Evasión de obstáculos en un curso concreto con 6 obstáculos y objetivo tipo planta.
- Razonamiento de decisión a 2 Hz (una inferencia cada 0,5 segundos).
- Capacidad multilingüe heredada del modelo base (coreano e inglés), aunque el uso previsto es monolingüe en el dominio de la tarea.
- No se documentan tool calling, function calling, capacidades de agente multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación en destilación de políticas RL a modelos de lenguaje: sirve como caso reproducible para estudiar cuánto conocimiento de una política PPO puede transferirse a un LLM pequeño mediante SFT sobre observaciones textualizadas.
- Simulación educativa de robótica cuadrúpeda: integrable en el entorno CONNECT AI WORLD Robot Lab para demostrar bucles de decisión a 2 Hz con observaciones LiDAR sintéticas.
- Generación de datos sintéticos de decisión: el modelo puede etiquetar trayectorias nuevas del simulador, ampliando el conjunto de entrenamiento del profesor o de otros estudiantes.
- Evaluación comparativa de políticas: referencia para medir la brecha entre una política PPO (90,0% de éxito) y su destilado lingüístico en el mismo curso `eceb627a`.
- Prototipado de interfaces lenguaje-acción: ejemplo de cómo mapear observaciones numéricas a comandos discretos mediante prompts estructurados, reutilizable en dominios de control con espacios de acción pequeños.
- Docencia de PEFT y LoRA: el adaptador es ligero (repositorio de 0,0 GB) y encaja en ejercicios prácticos de ajuste supervisado sobre modelos de menos de 1B parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para el modelo destilado. El único dato de rendimiento documentado corresponde al profesor PPO, no al adaptador LoRA:

| Sistema | Tarea | Métrica | Resultado |
|---|---|---|---|
| Profesor PPO (`brain.json`) | `avoid_obstacles`, curso `eceb627a` | Tasa de éxito en 20 pruebas oficiales | 90,0% (18/20) |
| Profesor PPO (`brain.json`) | `avoid_obstacles`, curso `eceb627a` | Retorno acumulado | 20,57 |
| Adaptador LoRA (este modelo) | `avoid_obstacles`, curso `eceb627a` | Tasa de éxito | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del modelo base (0,8B), en fp16 rondaría 1,6 GB de pesos más overhead, y en cuantización de 4 bits podría situarse por debajo de 1 GB, pero son estimaciones no verificadas en la model card.
- GPU recomendadas: no disponibles; un modelo de 0,8B es compatible con GPUs de consumo como RTX 3060, RTX 4060 o superiores, aunque el autor no lo especifica.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo base, si bien no se documenta oficialmente.
- Opciones de despliegue: la librería declarada es PEFT; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: la única referencia es la frecuencia de decisión de 2 Hz del entorno, no una medición del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-highj-avoid-v1-link01 | 0,8B (base) + LoRA | no disponible | Evasión de obstáculos LINK-01 | Apache 2.0 | Hugging Face |
| connectailab-rl-highj-goto-v1-link01 | 0,8B (base) + LoRA | no disponible | Navegación a objetivo LINK-01 | Apache 2.0 | Hugging Face |
| connectailab-rl-highj-choose-v1-link01 | 0,8B (base) + LoRA | no disponible | Reconocimiento de objetos LINK-01 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | Lenguaje general | Apache 2.0 | Hugging Face |

Los tres adaptadores LINK-01 comparten modelo base, licencia y familia de tareas, diferenciándose únicamente en la política destilada. No se dispone de datos de rendimiento comparables entre ellos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está sobreajustado a un curso concreto (hash `eceb627a`, 6 obstáculos, objetivo en `[1.7, -0.5392]`); no hay evidencia de generalización a otros mapas u obstáculos.
- La política destilada es SFT sobre trayectorias de un profesor PPO; no se ha medido su tasa de éxito real, por lo que la cifra del 90,0% corresponde al profesor y no al adaptador.
- La entrada es un formato de texto estructurado muy específico (21 valores en un orden fijo); cualquier cambio en la serialización de observaciones degradará la decisión.
- El espacio de acciones es discreto y de solo 5 opciones; no sirve para control continuo ni para tareas de manipulación.
- Idiomas limitados a coreano e inglés, y uso efectivo restringido al dominio de la robótica simulada.
- Riesgo de alucinación: al ser un LLM, puede emitir acciones fuera del conjunto esperado o texto adicional si el prompt no se formatea correctamente.
- No se documentan sesgos específicos, pero hereda los del modelo base Qwen3.5-0.8B.
- Licencia Apache 2.0 permite uso comercial, pero la utilidad práctica fuera del simulador LINK-01 es nula sin reentrenamiento.
- No se documentan requisitos de hardware, cuantizaciones ni benchmarks del adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minjunglee27/connectailab-rl-highj-avoid-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno de simulación CONNECT AI WORLD Robot Lab: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Colección completa del autor: https://huggingface.co/minjunglee27
- Modelo hermano `goto-v1`: https://huggingface.co/minjunglee27/connectailab-rl-highj-goto-v1-link01
- Modelo hermano `choose-v1`: https://huggingface.co/minjunglee27/connectailab-rl-highj-choose-v1-link01
