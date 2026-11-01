# SHSemi/connectailab-rl-connectailab-rl-seung-hyun-kim-v1-link01-v1-link01

## Resumen

LINK-01 es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-0.8B, entrenado para actuar como política de decisión en un robot simulado de 2D que debe evitar obstáculos. El modelo recibe una descripción textual del estado del robot (distancia al objetivo, dirección, lecturas de sensores de distancia, velocidad y acción previa) y devuelve una única letra que identifica la acción a ejecutar durante los siguientes 0,5 segundos. Lo desarrolla Seung Hyun Kim (SHSemi) en el marco del proyecto educativo CONNECT AI LAB × AI CITY BUILDERS, y se publica bajo licencia Apache 2.0.

El interés técnico del modelo no reside en su tamaño, sino en el pipeline de destilación que emplea: primero se entrena una política PPO en un entorno web de MuJoCo (el "cerebro" o `brain.json`), después se generan pares observación-texto/acción a partir de las trayectorias de esa política, se aplica un ajuste supervisado con LoRA sobre el LLM y, finalmente, se refina con aprendizaje por refuerzo (PPO con anclaje KL) usando como señal de recompensa el retorno obtenido al sustituir la acción del profesor por la del alumno. Es un ejemplo compacto de cómo convertir una política de RL en un modelo de lenguaje capaz de razonar sobre decisiones discretas.

El modelo es de nicho y de escala muy reducida: el adaptador ocupa 0,0 GB en el repositorio y el modelo base tiene 0,8 mil millones de parámetros. Está pensado para investigación, docencia y experimentación con agentes ligeros, no para producción general. La model card advierte explícitamente que se trata de un modelo de simulación y que debe revalidarse antes de usarlo en un robot físico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parámetros totales | 0,8 mil millones (modelo base); tamaño del adaptador no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |
| Pipeline | reinforcement-learning |
| Tarea | Selección de acción discreta (una letra entre varias opciones) |
| Entorno de entrenamiento | Simulador web MuJoCo, tarea `avoid_obstacles`, curso `random` |
| Dataset | train: 1095; valid: 207; test: 281 pares estado-acción |
| Librería | peft |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango aplicado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador no modifica la arquitectura del modelo base: añade matrices de bajo rango en las capas que PEFT seleccione, de modo que la inferencia requiere cargar el modelo base completo más el adaptador. La entrada es una descripción en lenguaje natural del estado del robot y la salida es una única letra correspondiente a una de las opciones de acción enumeradas en el prompt.

El entrenamiento sigue cuatro fases descritas en la model card. Primero se entrena una política PPO en el entorno web (`avoid_obstacles`, acuerdo `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1`, curso `random`), alcanzando un 90 % de éxito en el examen oficial. Segundo, se genera un corpus de 1583 pares (1095 de entrenamiento, 207 de validación, 281 de test) registrando cada 0,5 segundos la observación textualizada y la acción elegida por la política, incluyendo un 20 % de ejemplos con acciones alternativas que desviaban al robot. Tercero, se realiza ajuste supervisado con LoRA para imitar al profesor. Cuarto, se aplica un refinamiento con PPO y anclaje KL, donde la recompensa de cada opción es el retorno que se habría obtenido si el resto de la trayectoria la hubiera completado la política profesora.

La evaluación final coloca al modelo de decisión en el puesto del robot y lo hace recorrer el mismo curso durante 20 episodios (semillas 91001–91020). La model card indica que la tasa de coincidencia con el profesor en el conjunto de test es del 100 %, lo que actúa como cota superior de la métrica de imitación.

## Capacidades

- Selección de acción discreta: dado un estado textualizado del robot, devuelve exactamente una letra entre las opciones enumeradas, sin explicación.
- Razonamiento sobre estado numérico y categórico: interpreta distancias, direcciones, lecturas de sensores y la acción previa para elegir la siguiente.
- Robustez ante instrucciones embebidas: el prompt de sistema indica tratar el contenido de `state` como datos, no como instrucciones.
- Salida estrictamente controlada: el formato de respuesta (una sola letra) facilita el parseo y la integración en bucles de control.
- Multilingüe limitado: etiquetado para coreano; el prompt de sistema y el formato de tarea están en inglés, pero no se documenta soporte general multilingüe.
- Sin tool calling, sin capacidades de agente multi-paso, sin visión ni audio documentadas.

## Casos de uso

- Docencia de RL y destilación: el modelo sirve como ejemplo completo de pipeline PPO → dataset → SFT con LoRA → PPO con KL, replicable en un notebook de Colab y útil para explicar cómo se transfiere una política de RL a un LLM.
- Control de robot simulado en 2D: integrado en el bucle del simulador, sustituye a la política PPO original para la tarea `avoid_obstacles` con un 90 % de éxito en 20 episodios, lo que permite comparar políticas profesora y alumna.
- Generación de datos sintéticos de decisión: el modelo puede producir etiquetas de acción sobre estados nuevos para ampliar el corpus de entrenamiento de otras políticas.
- Prototipado rápido de agentes ligeros: al caber en una GPU de consumo y ejecutarse con PEFT, permite iterar sobre prompts de estado y opciones sin infraestructura pesada.
- Investigación en imitación con anclaje KL: sirve como banco de pruebas para estudiar cómo la recompensa basada en retorno del profesor modifica la distribución de acciones del alumno.
- Evaluación de robustez de prompts: al recibir estado en texto libre, es útil para probar inyección de instrucciones y validar la directiva de tratar el estado como datos.
- Demostraciones educativas en vídeo o talleres: el proyecto CONNECT AI LAB lo emplea como material divulgativo de RL aplicado a robótica.

## Benchmarks y rendimiento

Resultados publicados en la model card (curso `random`, 20 episodios, semillas 91001–91020):

| Modelo | Precisión en test (coincidencia con el profesor) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio de los episodios exitosos |
|---|---|---|---|---|
| Profesor (política PPO) | 100,0 % | 95 % | 10 % | 21,3 s |
| Sin entrenamiento | 42,3 % | 0 % | 10 % | — |
| SFT con LoRA | 69,0 % | 75 % | 45 % | 24,6 s |
| SFT + RL (modelo publicado) | 71,9 % | 90 % | 35 % | 26,1 s |

La evaluación de marcha se realiza con una aproximación 2D basada en una tabla de velocidades por comando obtenida del simulador web MuJoCo, no con el modelo físico completo, por lo que los resultados pueden diferir de una simulación MuJoCo nativa.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; para un modelo base de 0,8 B en precisión de 16 bits se sitúa habitualmente en torno a 2 GB, pero el dato no está confirmado por el autor.
- GPU recomendadas: no especificadas; por tamaño, cualquier GPU con al menos 4 GB de VRAM debería poder cargar el modelo base y el adaptador.
- GPU de consumo: previsiblemente compatible con RTX 3060, RTX 4060, RTX 4090 y similares, aunque no hay confirmación oficial.
- Despliegue: el autor documenta el uso con `transformers` + `peft` (`AutoModelForCausalLM` + `PeftModel.from_pretrained`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El bucle de control opera a 2 Hz (decisión cada 0,5 s), pero no se publican tiempos de inferencia por paso.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA para selección de acciones discretas en robótica simulada) en la documentación proporcionada. Como referencia, el propio modelo base Qwen/Qwen3.5-0.8B es la alternativa natural para comparar el efecto del adaptador, y la política PPO original actúa como línea base dentro del mismo proyecto.

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | 0,8 B (base) + LoRA | no disponible | 71,9 % test / 90 % éxito | Apache 2.0 | HuggingFace |
| Profesor PPO (`brain.json`) | no aplica (política RL) | no aplica | 100 % test / 95 % éxito | no disponible | Proyecto CONNECT TYCOON |
| Qwen/Qwen3.5-0.8B sin adaptador | 0,8 B | no disponible | 42,3 % test / 0 % éxito | no disponible | HuggingFace |

## Limitaciones y advertencias

- Modelo de nicho: solo resuelve la tarea `avoid_obstacles` del simulador LINK-01; no es un modelo de propósito general.
- Entrenado sobre una aproximación 2D de la marcha, no sobre el simulador MuJoCo completo; los resultados pueden no transferirse a física real.
- La model card advierte que es un modelo de investigación y educación y que debe revalidarse en el robot y el espacio concretos antes de cualquier uso físico.
- Tasa de colisión del 35 % en los 20 episodios de evaluación, superior al 10 % del profesor; no es adecuado para control de seguridad crítico.
- Idioma: etiquetado únicamente para coreano; el prompt de sistema está en inglés y no se documenta comportamiento en otros idiomas.
- Riesgo de alucinación: al ser un LLM, puede devolver una letra no incluida entre las opciones o añadir texto adicional si el prompt no se respeta; se recomienda validación estricta de la salida.
- Dependencia del formato de prompt: el rendimiento depende de que el estado se serialice exactamente como en el corpus de entrenamiento (`connect_tycoon.link01.questions`).
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.5-0.8B tiene sus propias condiciones, que deben verificarse por separado.
- Sin datos publicados sobre sesgos, contexto máximo ni cuantizaciones soportadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SHSemi/connectailab-rl-connectailab-rl-seung-hyun-kim-v1-link01-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- CONNECT AI LAB (YouTube): https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
