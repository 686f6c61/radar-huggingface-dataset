# seyunprobiz/connectailab-rl-seyunduck-obstacles-v1-link01

## Resumen

connectailab-rl-seyunduck-obstacles-v1-link01 es un adaptador LoRA publicado por el usuario seyunprobiz dentro del ecosistema CONNECT AI LAB / AI CITY BUILDERS, orientado a la toma de decisiones de un robot simulado llamado LINK-01 en tareas de evitación de obstáculos. No es un modelo de lenguaje de propósito general: se trata de un ajuste fino sobre Qwen/Qwen3.5-0.8B que reformula el problema de control como una tarea de selección de opciones en texto. El robot recibe una descripción textual de su estado (distancia al objetivo, orientación, lecturas de sensores de distancia, velocidad y acción previa) y el modelo debe responder con una única letra que indica el movimiento para los siguientes 0,5 segundos.

El interés técnico del modelo reside en su pipeline de entrenamiento, no en su tamaño. El autor entrenó primero una política PPO en un simulador web (un "cerebro" exportado como `brain.json`), generó un conjunto de problemas traduciendo observaciones a texto con la respuesta del cerebro como etiqueta, realizó un ajuste supervisado con LoRA y después aplicó un refuerzo adicional con restricción KL para premiar opciones que producían mejores recompensas que la acción del profesor. El resultado se evalúa tanto en precisión de imitación (70,9 % de coincidencia con el cerebro) como en éxito de la tarea al sustituir la política del robot (60 % de éxito en 20 episodios).

La relevancia es metodológica: muestra cómo destilar una política de refuerzo en un modelo de lenguaje pequeño mediante "verbalización" del espacio de observación y acción, con licencia Apache 2.0 y un coste de inferencia mínimo (0,8 mil millones de parámetros). Es un ejemplo de investigación y educación, no un componente listo para producción robótica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen3.5-0.8B) |
| Parámetros totales | 0,8 mil millones (modelo base); adaptador LoRA de tamaño no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos del adaptador en safetensors; el modelo base admite las cuantizaciones habituales de Qwen) |
| Idiomas soportados | Coreano (ko) según la model card; el prompt de sistema está en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. Sobre él se aplica un adaptador LoRA entrenado en dos fases. La primera es supervisada: se generaron 1.282 ejemplos de entrenamiento, 251 de validación y 374 de test, construidos a partir de las observaciones que la política PPO registró mientras recorría el curso `18b2956e` en el simulador web. Cada ejemplo convierte el estado del robot en una descripción textual con una pregunta y varias opciones, y la etiqueta es la acción elegida por el cerebro PPO; aproximadamente el 20 % de los ejemplos corresponden a situaciones en las que el robot se desvió del camino. La segunda fase es de refuerzo: para cada opción se estima la recompensa que se habría obtenido si el cerebro hubiera continuado desde ahí, y se aplica una actualización tipo PPO con anclaje KL al modelo supervisado para subir la probabilidad de las opciones mejores y bajar la de las peores.

La innovación destacable es el propio enfoque de destilación de una política de control en un modelo de lenguaje mediante selección de opciones discretas, con un prompt de sistema que instruye a tratar el estado como datos y no como instrucciones (defensa básica frente a inyección de prompt). La evaluación de la política se realiza con una aproximación 2D de la marcha basada en una tabla de velocidades por comando, no con el simulador MuJoCo completo, lo que el autor advierte explícitamente.

## Capacidades

- Selección de una única opción (una letra) entre las presentadas en un problema de decisión, sin explicación adicional.
- Interpretación de estados textuales estructurados: distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa.
- Toma de decisiones de control a intervalos de 0,5 segundos para el robot simulado LINK-01 en la tarea `avoid_obstacles`.
- Robustez parcial ante estados fuera de distribución, gracias a la inclusión de trayectorias desviadas en el conjunto de entrenamiento.
- Seguimiento de instrucciones de formato estricto (respuesta de una sola letra).
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni razonamiento general; el modelo está especializado en una única tarea.

## Casos de uso

- Investigación en destilación de políticas de refuerzo: usar el par (política PPO, adaptador LoRA) como caso de estudio reproducible de cómo verbalizar un espacio de observación continuo para entrenar un modelo de lenguaje.
- Educación en aprendizaje por refuerzo: el cuaderno de Colab y el repositorio CONNECT TYCOON permiten reproducir el pipeline completo (PPO, generación de problemas, SFT y RL) con un coste de cómputo bajo.
- Docencia sobre evaluación de políticas: comparar precisión de imitación (70,9 %) frente a éxito real en la tarea (60 %) para ilustrar la brecha entre métricas offline y rendimiento en el entorno.
- Prototipado de controladores basados en lenguaje en simulación: sustituir la política del robot por el modelo en un bucle de decisión discreta cada 0,5 segundos para experimentar con interfaces texto-acción.
- Estudio de robustez ante entradas adversariales: el prompt de sistema que ordena tratar el estado como datos permite analizar intentos de inyección a través de los campos de observación.
- Base para ampliar a otras tareas del mismo simulador: el formato de problemas (`connect_tycoon.link01.questions`) y el esquema de opciones son reutilizables para nuevas tareas de decisión.
- Referencia para pipelines de PEFT: servir como plantilla de carga con `transformers` y `peft` en entornos con recursos limitados.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. La "precisión" mide la coincidencia con la acción del cerebro PPO en el conjunto de test (374 problemas); el "éxito" mide episodios completados en 20 recorridos del mismo curso con semillas 91001–91020.

| Modelo | Precisión en test | Éxito en 20 episodios | Episodios con colisión | Tiempo medio de éxito |
|---|---|---|---|---|
| Cerebro PPO (profesor) | 100,0 % | 55 % | 45 % | 22,5 s |
| Modelo base sin ajuste | 45,5 % | 0 % | 0 % | — |
| Fase supervisada (LoRA) | 70,3 % | 65 % | 5 % | 31,0 s |
| Fase de refuerzo (LoRA) | 70,9 % | 60 % | 5 % | 31,4 s |

El autor indica que el techo de precisión alcanzable es del 99 % (proporción de estados en los que el cerebro emite la misma respuesta al verbalizarse) y que la evaluación de la marcha usa una aproximación 2D con tabla de velocidades, no MuJoCo.

## Requisitos de hardware

- El modelo base tiene 0,8 mil millones de parámetros; en fp16 ocupa aproximadamente 1,6 GB, y en cuantizaciones de 8 o 4 bits cabe holgadamente en cualquier GPU consumer con 4–8 GB de VRAM.
- GPU recomendadas: cualquier RTX 3060 o superior para inferencia; para entrenamiento del adaptador, una RTX 4090 o una A100 resulta suficiente dado el tamaño del modelo y del conjunto de datos.
- Cabe en GPU consumer: sí, incluidas tarjetas de gama media y posiblemente CPU para inferencia puntual con llama.cpp u Ollama, aunque el adaptador PEFT requiere cargarlo sobre el modelo base.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado por el autor); vLLM y TGI admiten adaptadores LoRA sobre el modelo base; llama.cpp y Ollama requerirían convertir el adaptador a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. La tarea exige una decisión cada 0,5 segundos, lo que es holgadamente alcanzable con este tamaño en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de destilación de políticas de refuerzo en formato LoRA sobre modelos de lenguaje pequeños. La comparación más directa es interna al propio pipeline:

| Modelo | Parámetros | Tarea | Precisión en test | Éxito en simulación | Licencia |
|---|---|---|---|---|---|
| Cerebro PPO (profesor) | No disponible | Evitación de obstáculos | 100,0 % | 55 % | No disponible |
| Este adaptador (RL) | 0,8 B + LoRA | Evitación de obstáculos | 70,9 % | 60 % | Apache 2.0 |
| Qwen3.5-0.8B sin ajuste | 0,8 B | Uso general | 45,5 % (en esta tarea) | 0 % | No disponible |

## Limitaciones y advertencias

- Modelo de investigación y educación sobre un simulador; el autor advierte que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- La evaluación de la marcha usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo; los resultados pueden diferir del entorno real.
- Especializado en una única tarea (`avoid_obstacles`) y en un único robot simulado (LINK-01); no generaliza a otras tareas de control sin reentrenamiento.
- El modelo de refuerzo no supera al supervisado en éxito (60 % frente a 65 %) y tarda más en completar los episodios (31,4 s frente a 22,5 s del profesor).
- Riesgo de alucinación en el formato: puede devolver una letra no listada o texto adicional si el estado se sale de la distribución de entrenamiento.
- Idioma principal coreano con prompt de sistema en inglés; no se documenta soporte multilingüe.
- Sesgos: el conjunto de entrenamiento proviene de un único curso y una única política, por lo que hereda sus sesgos de comportamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe respetarse la licencia del modelo base Qwen3.5-0.8B.
- Repositorio de 0,0 GB y sin descargas ni likes en el momento de la consulta; el soporte de la comunidad es mínimo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seyunprobiz/connectailab-rl-seyunduck-obstacles-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo: https://www.aicitybuilders.com/robot
