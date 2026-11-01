# minjunglee27/connectailab-rl-highj-goto-v1-link01

## Resumen

connectailab-rl-highj-goto-v1-link01 es un adaptador LoRA (PEFT) sobre el modelo de lenguaje Qwen/Qwen3.5-0.8B, entrenado por Minjung Lee (Highj) en el marco del proyecto CONNECT AI LAB / CONNECT TYCOON. No es un modelo de propósito general: se trata de una política de decisión encarnada (embodied AI) que traduce observaciones numéricas de un robot cuadrúpedo simulado, el LINK-01, en acciones discretas de locomoción. El modelo resuelve la tarea `goto_target`: navegar hacia un objetivo evitando obstáculos dinámicos en un entorno de simulación.

La relevancia del modelo es metodológica más que de rendimiento absoluto. El autor destila el comportamiento de un profesor PPO (un `brain.json` entrenado por refuerzo en el robot lab web) en un modelo de lenguaje de 0,8 mil millones de parámetros mediante SFT y, después, RL con control de divergencia KL. El resultado es un pipeline que convierte series de 21 dimensiones (vector relativo al objetivo, 11 lecturas LiDAR, velocidades lineal y angular e historial de acciones) en texto estructurado y las procesa a 2 Hz.

El adaptador publicado es, según la evaluación del propio autor, la variante SFT y no la RL: aunque la RL alcanza mayor coincidencia con el profesor (74,2 % frente a 68,3 %), la SFT completa el circuito en el 55 % de 20 ejecuciones frente al 30 % de la RL. El modelo base Qwen no logra ninguna ejecución completa (0 %). El repositorio ocupa 0,0 GB, coherente con un adaptador LoRA de pequeño tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parámetros totales | 0,8 mil millones (modelo base); tamaño del adaptador no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Coreano (ko) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only, y le superpone un adaptador LoRA entrenado con la librería PEFT. La capa de decisión no opera sobre lenguaje natural libre sino sobre una serialización textual de observaciones: cada 0,5 segundos se convierte un vector de 21 dimensiones en un prompt estructurado y el modelo emite una de cinco acciones discretas de locomoción (avanzar, girar a izquierda, girar a derecha, girar en el sitio, entre otras). La frecuencia de decisión es de 2 Hz.

El entrenamiento tiene tres fases. Primero se entrena un profesor PPO en el entorno web del CONNECT AI WORLD Robot Lab sobre el curso `057d7cd9` de la tarea `goto_target`, generando el `brain.json`. Segundo, se construye un conjunto de datos de 586 ejemplos de entrenamiento, 167 de validación y 240 de test, etiquetados con las acciones del profesor. Tercero, se aplica SFT con LoRA sobre Qwen3.5-0.8B y, en paralelo, una fase de RL con ponderación de recompensas obtenidas por el profesor al ejecutar cada opción y control de divergencia KL para estabilizar el ajuste. La variante finalmente publicada es la SFT, seleccionada por su mayor tasa de éxito en circuito.

## Capacidades

- Decisión de navegación discreta a 2 Hz para un robot cuadrúpedo simulado en la tarea `goto_target`.
- Interpretación de observaciones numéricas serializadas: vector relativo al objetivo, 11 lecturas de distancia tipo LiDAR, velocidades lineal y angular e historial de acciones.
- Evitación de obstáculos dinámicos en el curso de simulación `057d7cd9`.
- Salida de acciones de locomoción discretas (avanzar, girar a izquierda, girar a derecha, giro en el sitio).
- Capacidad de imitación de política: reproduce con un 68,3 % de coincidencia las decisiones del profesor PPO (pico del 74,2 % en la variante RL).
- Soporte de coreano e inglés en los prompts de observación.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Simulación de navegación autónoma en robótica de investigación: el modelo puede integrarse como política de decisión en un bucle de simulación a 2 Hz para probar estrategias de evitación de obstáculos antes de transferir a hardware real, aprovechando que su formato de entrada es texto estructurado y por tanto fácil de registrar y depurar.
- Destilación de políticas RL en modelos de lenguaje: sirve como caso de estudio reproducible de cómo convertir un profesor PPO en un policy de lenguaje, con conjuntos de entrenamiento, validación y test documentados (586/167/240).
- Evaluación comparativa de SFT frente a RL en políticas encarnadas: el par de adaptadores SFT y RL del mismo autor permite analizar la brecha entre coincidencia con el profesor (68,3 % vs 74,2 %) y éxito real en circuito (55 % vs 30 %).
- Prototipado educativo de robótica con modelos pequeños: al ejecutarse sobre un modelo de 0,8 mil millones de parámetros, es viable en entornos de aprendizaje con recursos limitados y en notebooks de Colab, como el que el autor enlaza.
- Generación de datos de comportamiento para entrenamiento posterior: las trayectorias y decisiones registradas pueden emplearse para aumentar el conjunto de ejemplos o para entrenar políticas con más datos.
- Investigación en interpretabilidad de decisiones serializadas: al convertir sensores en texto, permite inspeccionar qué observaciones conducen a cada acción y auditar el comportamiento del policy.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (evaluación sobre 240 ejemplos de test y 20 ejecuciones completas del circuito):

| Modelo | Acierto en test (coincidencia con profesor) | Éxito en 20 ejecuciones | Tasa de colisión | Tiempo medio de éxito |
|---|---|---|---|---|
| Profesor PPO (`brain.json`) | 100,0 % | 100 % | 10 % | 10,4 s |
| Base Qwen (sin ajuste) | 52,5 % | 0 % | 75 % | No disponible |
| SFT (modelo publicado) | 68,3 % | 55 % | 80 % | 15,3 s |
| RL | 74,2 % | 30 % | 90 % | 14,2 s |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 0,8 mil millones de parámetros, el modelo base en fp16 requiere del orden de 1,6 GB de pesos, y en cuantizaciones de 8 o 4 bits bastante menos, pero el autor no publica cifras.
- GPU recomendadas: no especificadas. Por tamaño, cualquier GPU consumer con 6-8 GB de VRAM debería poder alojar el modelo base en fp16, aunque esta estimación no está confirmada por el autor.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del modelo base; sin confirmación oficial.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar Qwen/Qwen3.5-0.8B junto con el adaptador mediante la librería `peft`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: la política opera a 2 Hz (una decisión cada 0,5 s) por diseño; no se publican cifras de latencia de inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-highj-goto-v1-link01 | 0,8 B (base) + LoRA | No disponible | Navegación `goto_target` en LINK-01 | Apache 2.0 | HuggingFace |
| connectailab-rl-highj-goto-v1-link01 (RL) | 0,8 B (base) + LoRA | No disponible | Navegación `goto_target` en LINK-01 | Apache 2.0 | HuggingFace |
| Profesor PPO (`brain.json`) | No disponible | No aplica | Navegación `goto_target` en LINK-01 | No disponible | No disponible como modelo independiente |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B | No disponible | Propósito general | No disponible en la información | HuggingFace |

No se dispone de otros modelos comparables de la misma categoría (políticas de lenguaje para robótica cuadrúpeda) en la información proporcionada.

## Limitaciones y advertencias

- El modelo es específico del simulador LINK-01 y del curso `057d7cd9`; no se ha validado su transferencia a hardware real ni a otros entornos.
- La tasa de éxito en circuito es del 55 % en 20 ejecuciones, y la tasa de colisión del 80 %, lo que lo hace inadecuado para despliegue en producción sin supervisión.
- La variante RL, pese a mayor coincidencia con el profesor, generaliza peor en circuito (30 % de éxito), lo que sugiere sobreajuste a las decisiones del profesor frente a la dinámica real.
- El modelo base sin ajustar ya muestra un 75 % de colisiones y un 0 % de éxito, lo que indica que la tarea es exigente y el margen de mejora es amplio.
- Riesgo de alucinación no evaluado en el contexto de decisión; el modelo puede generar acciones incoherentes ante observaciones fuera de distribución.
- Idiomas limitados a coreano e inglés; no se documenta soporte de castellano.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos al simulado.
- El repositorio ocupa 0,0 GB; conviene verificar la integridad de los pesos del adaptador antes de su uso.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minjunglee27/connectailab-rl-highj-goto-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Robot Lab web: https://www.ezerai.xyz/robot-lab/world/
- Canal YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Modelo relacionado (LunarLander v1): https://huggingface.co/minjunglee27/connectailab-rl-highj-v1-lunarlander
- Modelo relacionado (LunarLander v2): https://huggingface.co/minjunglee27/connectailab-rl-highj-v2-lunarlander
- Modelo relacionado (CartPole lite): https://huggingface.co/minjunglee27/connectailab-rl-highj-v1-cartpole-lite
- Modelo relacionado (Connect Tycoon v1): https://huggingface.co/minjunglee27/connectailab-rl-highj-v1
- Modelo relacionado (Connect Tycoon v2): https://huggingface.co/minjunglee27/connectailab-rl-highj-v2
- Modelo relacionado (goto v1): https://huggingface.co/minjunglee27/connectailab-rl-highj-goto-v1-link01
