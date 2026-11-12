# guitarorangedog/manifeel-tavla-bulb

## Resumen

TA-VLA (DP backbone) · ManiFeel `bulb` es un checkpoint de política robótica publicado por el usuario guitarorangedog bajo el identificador `guitarorangedog/manifeel-tavla-bulb`. No es un modelo de lenguaje: se trata de un modelo de aprendizaje por imitación orientado al control de un brazo robótico Franka Panda en una tarea concreta de manipulación de una bombilla (`bulb`), entrenado sobre el dataset `RoboSynapse/manifeel-tacr_franka-panda_bulb`. La librería declarada es LeRobot 0.6.1 y la arquitectura se describe como una *diffusion policy* (DP) con un componente denominado TA-VLA.

El modelo recibe como entrada una imagen de cámara de muñeca (`wrist cam`) y una imagen táctil del sensor derecho (`tacimg`), lo que lo sitúa en la categoría de políticas viso-táctiles. Con 344.508.685 parámetros (unos 344,5 M) y un repositorio de 1,4 GB, su relevancia actual es la de un *baseline* reproducible para investigación en manipulación con retroalimentación táctil, no la de un modelo de propósito general.

La información publicada es muy escasa: no hay licencia declarada, no hay idiomas, no hay benchmarks más allá de la tasa de éxito reportada y no se detalla la composición del dataset ni el proceso de entrenamiento más allá de la receta enlazada. Esta ficha refleja únicamente lo disponible y marca explícitamente como "no disponible" todo lo que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DP) con componente TA-VLA; política viso-táctil para robótica |
| Parametros totales | 344.508.685 (344,5 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de control robótico, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo lingüístico) |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería LeRobot) |
| Tarea | Manipulación robótica con entrada viso-táctil |
| Dataset de entrenamiento | RoboSynapse/manifeel-tacr_franka-panda_bulb |
| Entradas | Cámara de muñeca + imagen táctil derecha (`tacimg`) |
| Tamaño del repositorio | 1,4 GB |
| Librería / versión | LeRobot 0.6.1 |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La arquitectura se describe en la model card como una *diffusion policy* (DP) con un *backbone* denominado TA-VLA. Las diffusion policies modelan la distribución de acciones mediante un proceso de difusión condicionado en observaciones, lo que permite generar trayectorias de acción multimodales y suaves; es un enfoque habitual en manipulación robótica. El componente TA-VLA sugiere una variante de visión-lenguaje-acción con entrada táctil, aunque la información publicada no detalla su implementación interna, el número de pasos de difusión ni la estructura exacta de la red.

En cuanto al entrenamiento, la model card indica que se entrenó con `robo-synapse` sobre LeRobot 0.6.1, con semilla 1000, precisión mixta (AMP) y aumentación de datos desactivada. La entrada combina cámara de muñeca e imagen táctil. No se especifican el número de tokens, la composición del dataset, ni si hubo RLHF, DPO o algún tipo de ajuste por refuerzo; tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. Toda esa información debe considerarse no disponible.

## Capacidades

- Control robótico de manipulación: genera acciones para un brazo Franka Panda en la tarea de manipulación de una bombilla.
- Percepción viso-táctil: combina imagen de cámara de muñeca con imagen de sensor táctil (`tacimg`) como observación.
- Aprendizaje por imitación: política entrenada sobre demostraciones del dataset ManiFeel.
- Generación de trayectorias de acción mediante difusión (multimodalidad de acciones).
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingües: no disponible (no es un modelo lingüístico).
- Capacidades especiales (modo thinking, visión, audio): visión y tacto como entrada; no se documentan otras.

## Casos de uso

- Investigación en manipulación viso-táctil: el checkpoint sirve como *baseline* reproducible para comparar nuevas políticas sobre el mismo dataset y la misma tarea, con una tasa de éxito de referencia del 73,5 %.
- Reproducción de experimentos: al estar entrenado con semilla 1000, AMP y aumentación desactivada, permite replicar condiciones controladas y aislar el efecto de cambios en la política o en los datos.
- Evaluación de sensores táctiles: al recibir `tacimg`, permite estudiar cuánto aporta la modalidad táctil frente a la visión sola en la tarea de la bombilla.
- Desarrollo de *pipelines* con LeRobot: se integra en flujos de entrenamiento y evaluación de LeRobot 0.6.1, lo que facilita su uso en laboratorios que ya trabajan con ese ecosistema.
- Punto de partida para *fine-tuning*: puede servir como inicialización para tareas de manipulación relacionadas con objetos similares en el mismo entorno Franka Panda.
- Docencia y formación en robótica: ejemplo práctico de diffusion policy con entrada multimodal para cursos de aprendizaje por imitación.
- Validación de infraestructura de evaluación: la métrica reportada (4 semillas × 50 episodios, máximo 500 pasos) puede reutilizarse como protocolo de evaluación estandarizado.

## Benchmarks y rendimiento

| Metrica | Valor | Protocolo |
|---|---|---|
| Tasa de éxito (success rate) | 73,5 % | 4 semillas × 50 episodios, máximo 500 pasos |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 344,5 M parámetros, en precisión de 16 bits los pesos ocuparían aproximadamente 0,7 GB; en 32 bits, unos 1,4 GB (coincide con el tamaño del repositorio). El consumo real depende del *runtime* de difusión y del *backbone*.
- GPU recomendadas: no disponible en la documentación. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder alojar los pesos; el cuello de botella real será el bucle de difusión y el procesamiento de imágenes.
- ¿Cabe en GPU de consumo? Muy probablemente sí en tarjetas tipo RTX 3060/4060 o superiores, aunque no está confirmado por el autor.
- Opciones de despliegue: LeRobot 0.6.1 (librería declarada); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| guitarorangedog/manifeel-tavla-bulb | 344,5 M | No aplica | 73,5 % éxito (tarea bulb) | No disponible | Hugging Face |
| Otras diffusion policies de LeRobot | No disponible | No aplica | No disponible | No disponible | No disponible |
| Alternativas viso-táctiles comparables | No disponible | No aplica | No disponible | No disponible | No disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea (`bulb`) sobre un único dataset y un único robot (Franka Panda); no generaliza a otras tareas sin reentrenamiento.
- Licencia no declarada: no se puede asumir uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Documentación mínima: sin detalles de composición del dataset, hiperparámetros completos ni análisis de fallos.
- Tasa de éxito del 73,5 %: implica un 26,5 % de fallos en el protocolo evaluado, insuficiente para aplicaciones de producción sin supervisión.
- Dependencia de hardware específico: requiere cámara de muñeca y sensor táctil compatibles con el dataset ManiFeel.
- Riesgo de sobreajuste al entorno: al desactivar la aumentación, la robustez ante cambios de iluminación, posición u objeto puede ser limitada.
- Sin información sobre sesgos, alucinación o comportamiento fuera de distribución; no aplican los conceptos de sesgo lingüístico, pero sí el riesgo de fallos silenciosos en control.
- Repositorio con 0 descargas y 0 likes: sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guitarorangedog/manifeel-tavla-bulb
- Dataset: https://huggingface.co/datasets/RoboSynapse/manifeel-tacr_franka-panda_bulb
- Código / receta: https://github.com/kwk2696/robo-synapse/pull/2
