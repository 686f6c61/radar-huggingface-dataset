# IRELAB/connectailab-rl-irelab-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT entrenado mediante aprendizaje por refuerzo (PPO) sobre el modelo base Qwen/Qwen3.5-0.8B. Lo desarrolla IRELAB en colaboración con CONNECT AI LAB y AI CITY BUILDERS, y su propósito es actuar como "cerebro" de decisión para el robot simulado LINK-01 en una tarea concreta: esquivar obstáculos. El modelo recibe en texto el estado actual del robot (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa) y devuelve una única letra que corresponde a la acción de locomoción para los próximos 0,5 segundos.

La relevancia de este modelo es metodológica más que de escala: demuestra un pipeline completo de destilación de políticas de RL (un cerebro PPO entrenado en un simulador web) hacia un modelo de lenguaje pequeño mediante supervisión (LoRA) seguida de optimización con recompensas del entorno real de decisión. Con solo 0,8 mil millones de parámetros en el modelo base, el adaptador resultante alcanza un 100% de éxito en 20 episodios sobre el curso de entrenamiento, superando al propio profesor PPO (95%), y elimina por completo las colisiones en esa misma evaluación.

El modelo está pensado para investigación y educación en simulación. La model card advierte explícitamente de que no debe usarse en un robot físico sin una revalidación previa en el robot y el espacio concretos. El adaptador es de tamaño mínimo (el repositorio ocupa 0,0 GB), se distribuye bajo licencia Apache 2.0 y declara únicamente el idioma coreano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parámetros totales | 0,8 mil millones en el modelo base; tamaño del adaptador no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, no especificada en la información) |
| Tipos de cuantización | No disponible (pesos del adaptador en safetensors; el modelo base admite las cuantizaciones habituales de Qwen, no detalladas) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros, y se entrena en dos fases. Primero, un cerebro PPO se entrena en un simulador web (tarea `avoid_obstacles`, curso con huella `3dde73b1` y 5 obstáculos) durante 40.960 decisiones; ese cerebro alcanza un 80% de éxito en cursos aleatorios no vistos en la prueba oficial web. Después, se genera un conjunto de problemas traduciendo cada observación del robot a texto cada 0,5 segundos, con la respuesta del cerebro como etiqueta, incluyendo un 20% de ejemplos con desviaciones del camino. El conjunto resultante tiene 1.075 ejemplos de entrenamiento, 197 de validación y 330 de test, con un techo de acierto (fidelidad al cerebro al pasar a texto) del 99%.

Sobre ese conjunto se aplica primero un ajuste supervisado con LoRA y después una fase de refuerzo con PPO y anclaje KL, en la que cada opción de respuesta recibe como recompensa el retorno que habría obtenido el cerebro al continuar desde esa elección: las opciones mejores que la del profesor se refuerzan y las peores se penalizan. La evaluación final coloca el modelo de decisión en el puesto de mando del robot y lo hace recorrer el mismo curso en 20 episodios (semillas 91001–91020). La simulación de marcha es una aproximación 2D basada en una tabla de velocidades por comando derivada del simulador MuJoCo web, sin red neuronal de locomoción, por lo que no hay caídas y los resultados pueden diferir de MuJoCo.

## Capacidades

- Decisión de acción discreta en un único token: devuelve exactamente una letra entre las opciones listadas, sin explicación.
- Interpretación de estado en lenguaje natural: distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa.
- Robustez ante instrucciones embebidas en el estado: el prompt de sistema indica tratar el texto del estado como datos, no como instrucciones.
- Navegación con evitación de obstáculos en el dominio simulado LINK-01 (tarea `avoid_obstacles`).
- Integración con el paquete `connect_tycoon.link01` para convertir observaciones del robot al formato de pregunta.
- Capacidades generales de lenguaje heredadas del modelo base Qwen3.5-0.8B (no evaluadas ni garantizadas en esta ficha).
- No dispone de tool calling, agentes multi-paso, visión ni audio documentados.

## Casos de uso

- Investigación en destilación de políticas RL a modelos de lenguaje: reproducir el pipeline (PPO en simulador, generación de dataset textual, LoRA supervisado, PPO con KL) para estudiar cómo se transfiere una política de control a un modelo generativo pequeño.
- Educación en aprendizaje por refuerzo: usar el notebook de Colab y el repositorio CONNECT TYCOON como material didáctico para mostrar el efecto de cambios en la función de recompensa (por ejemplo, eliminar la penalización por colisión).
- Evaluación de políticas en simulación 2D: comparar el comportamiento del adaptador frente al cerebro profesor en cursos conocidos y aleatorios con semillas fijas.
- Estudio de robustez de recompensas: analizar por qué quitar la penalización por colisión mantiene la tasa de éxito pero dispara las colisiones (19% a 31,5% en 200 episodios) y degrada la generalización a cursos nuevos (70% a 48,5%).
- Prototipado de agentes de decisión de bajo coste: un modelo de 0,8B con adaptador LoRA puede ejecutarse en hardware modesto para experimentar con interfaces texto-acción en robótica simulada.
- Generación de datos sintéticos de decisión: usar el modelo como política para recorrer cursos y registrar trazas de observación-acción destinadas a otros experimentos de imitación.

## Benchmarks y rendimiento

Resultados publicados en la model card. Evaluación sobre el mismo curso (`3dde73b1`), 20 episodios, aproximación 2D de la marcha:

| Modelo | Acierto en test (coincidencia con el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio de los episodios exitosos |
|---|---|---|---|---|
| Cerebro profesor (PPO) | 100,0% | 95% | 40% | 24,6 s |
| Antes del entrenamiento | 27,0% | 0% | 10% | — |
| Ajuste supervisado (LoRA) | 81,8% | 95% | 35% | 23,8 s |
| Refuerzo (este modelo) | 60,6% | 100% | 0% | 22,0 s |

Experimento adicional sobre la penalización por colisión (curso `3dde73b1`, 40.960 decisiones):

| Métrica | v1 (colisión −2) | A (colisión 0) |
|---|---|---|
| Éxito en 20 episodios, mismo curso | 95% | 100% |
| Episodios con colisión, mismo curso | 40% | 65% |
| Éxito en 20 episodios, cursos nuevos (prueba oficial web) | 80% | 50% |
| Episodios con colisión, 200 episodios | 19% | 31,5% |
| Éxito en cursos nuevos, 200 episodios | 70% | 48,5% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo base tiene 0,8 mil millones de parámetros, por lo que en fp16 requiere del orden de 1,6 GB solo para pesos, más el adaptador y el estado de inferencia.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4 GB de VRAM en fp16 debería ser suficiente, aunque no hay mediciones publicadas.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo base, aunque no se documenta una lista de GPUs verificadas.
- Opciones de despliegue: la model card muestra carga con `transformers` y `peft` (`PeftModel.from_pretrained` sobre `AutoModelForCausalLM`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles. El autor solo reporta tiempos de episodio en simulación (22,0 s de media en los episodios exitosos), no latencia de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparación más directa disponible es interna al propio desarrollo:

| Modelo | Base | Método | Éxito (20 episodios) | Colisiones | Licencia |
|---|---|---|---|---|---|
| Cerebro profesor PPO | No aplica (política RL) | PPO en simulador web | 95% | 40% | No disponible |
| Ajuste supervisado LoRA | Qwen3.5-0.8B | SFT + LoRA | 95% | 35% | Apache 2.0 |
| Este modelo | Qwen3.5-0.8B | SFT + LoRA + PPO con KL | 100% | 0% | Apache 2.0 |

Comparativa con otros adaptadores o modelos de decisión de la misma categoría: no disponible.

## Limitaciones y advertencias

- Dominio muy restringido: solo resuelve la tarea `avoid_obstacles` del robot LINK-01 en el simulador; no es un modelo de propósito general.
- Evaluación sobre 20 episodios: el propio autor señala que los números oscilan mucho con pocas muestras (las colisiones de v1 pasaron del 40% al 19% al ampliar a 200 episodios).
- Simulación aproximada: la marcha se mide con una tabla 2D de velocidades por comando derivada de MuJoCo web, sin red de locomoción; los resultados pueden diferir del simulador real.
- No validado en robot físico: la model card exige revalidar en el robot y el espacio concretos antes de cualquier uso real.
- El acierto frente al profesor baja del 81,8% (SFT) al 60,6% (RL) porque el modelo aprende a elegir opciones mejores que las del profesor; una métrica de fidelidad no refleja aquí la calidad de la política.
- Idioma declarado únicamente coreano; el prompt de sistema está en inglés y el formato de salida es una letra, pero no se documenta comportamiento multilingüe.
- Riesgo de alucinación no evaluado: el modelo debe devolver exactamente una letra de las opciones; no se documentan tasas de respuestas fuera de formato.
- Sesgos: no documentados por el autor.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza experimental y la advertencia de validación previa limitan su uso en producción real.
- Sin datos de benchmarks estándar de lenguaje, por lo que no se puede evaluar su calidad como modelo de texto general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IRELAB/connectailab-rl-irelab-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Laboratorio web de entrenamiento del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Sitio web de IRELAB: https://www.irelabdigital.com
