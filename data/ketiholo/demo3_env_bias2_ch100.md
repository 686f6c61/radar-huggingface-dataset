# ketiholo/demo3_env_bias2_ch100

## Resumen

`ketiholo/demo3_env_bias2_ch100` es una política de robótica entrenada con ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. Lo publica el usuario ketiholo en HuggingFace mediante LeRobot, la librería de HuggingFace para aprendizaje por imitación en robótica, y se distribuye con licencia Apache 2.0. El modelo está pensado para controlar un robot seguidor SO-100 (según el comando de evaluación de la model card) a partir de demostraciones teleoperadas.

El repositorio contiene únicamente pesos en formato safetensors con 51.676.295 parámetros (unos 51,7 millones) y un tamaño de 0,2 GB. No es un modelo de lenguaje: su etiqueta de pipeline es `robotics` y su salida son acciones motoras, no texto. Por tanto, las filas de la ficha relativas a contexto, idiomas o cuantización de LLM no aplican y se marcan como no disponibles.

Es relevante como ejemplo de política ACT lista para usar con LeRobot: un modelo pequeño, entrenado sobre un dataset propio (`ketiholo/demo3`) y con un sufijo (`env_bias2_ch100`) que sugiere un chunk size de 100 y algún ajuste de sesgo por entorno, aunque el autor no documenta estos detalles. Su utilidad práctica es servir como punto de partida o referencia para experimentos de imitación en brazos robóticos de bajo coste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parámetros totales | 51.676.295 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ACT opera sobre observaciones y chunks de acciones) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión original) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un backbone de visión (típicamente ResNet) que procesa las imágenes de las cámaras del robot con un transformer encoder-decoder que, en lugar de predecir una única acción por paso, genera un chunk de acciones futuras. Esta predicción por chunks reduce el error de acumulación típico de las políticas paso a paso y mejora la estabilidad en tareas de manipulación.

El modelo se ha entrenado con LeRobot sobre el dataset `ketiholo/demo3`, compuesto por demostraciones teleoperadas. La model card no especifica el número de episodios, el número de tokens ni la composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos o regularización. El sufijo `env_bias2_ch100` del nombre sugiere un chunk size de 100 y alguna variante de sesgo por entorno, pero no hay documentación que lo confirme. No se reporta RLHF, DPO ni ninguna fase de ajuste posterior; ACT es puramente supervisado sobre imitación.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (posiciones articulares o del efector final) a partir de observaciones visuales y del estado del robot.
- Predicción por chunks: emite bloques de acciones de forma conjunta, lo que suaviza la trayectoria y reduce el error acumulado.
- Integración con LeRobot: entrenamiento con `lerobot-train` y evaluación/ejecución con `lerobot-record`.
- Compatibilidad con el robot SO-100 seguidor, según el ejemplo de la model card.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas ni visión descriptiva.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni modo de pensamiento.

## Casos de uso

- Manipulación de objetos con un brazo SO-100: la política recibe las imágenes de las cámaras y el estado de las articulaciones y emite chunks de acciones para alcanzar y mover objetos, aprovechando el enfoque de imitación para replicar las trayectorias demostradas.
- Automatización de tareas de pick-and-place en laboratorio: se puede desplegar sobre el robot seguidor y evaluar con `lerobot-record` durante 10 episodios, como indica la model card, para medir la tasa de éxito antes de integrarlo en un pipeline mayor.
- Punto de partida para fine-tuning con datos propios: al ser un checkpoint ACT pequeño (51,7 M de parámetros, 0,2 GB), se puede reentrenar o adaptar con el dataset de otro usuario usando `lerobot-train` y un dataset propio.
- Prototipado rápido en robótica de bajo coste: el tamaño reducido permite ejecutar inferencia en una GPU de consumo o incluso en CPU para pruebas preliminares, lo que facilita iterar en entornos académicos.
- Benchmark interno de políticas de imitación: sirve como referencia base para comparar variantes de ACT (distintos chunk sizes, aumentos de datos, sesgos por entorno) sobre el mismo robot y dataset.
- Docencia y demostraciones de aprendizaje por imitación: el flujo completo de LeRobot (entrenar, evaluar, grabar episodios) se puede reproducir en un curso o taller con hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de trayectoria ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del modelo (51,7 M de parámetros, 0,2 GB en safetensors) se estima un consumo bajo, del orden de 1-2 GB incluyendo el backbone visual y los buffers de inferencia, aunque es una estimación y no un dato del autor.
- GPU recomendadas: cualquier GPU con CUDA compatible con PyTorch; el ejemplo de la model card usa `--policy.device=cuda`.
- GPU de consumo: previsiblemente cabe en tarjetas como RTX 3060, RTX 4060 o superiores, dado el reducido número de parámetros; no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que es el flujo documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. Dependen del hardware, de la frecuencia de control del robot y del tamaño del chunk de acciones.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ketiholo/demo3_env_bias2_ch100 | ACT | 51,7 M | no aplica | Apache 2.0 | HuggingFace, 32 descargas |
| Otras políticas ACT en LeRobot Hub | ACT | variable según checkpoint | no aplica | habitualmente Apache 2.0 | HuggingFace |
| Diffusion Policy (LeRobot) | difusión para acciones | variable | no aplica | según checkpoint | HuggingFace / LeRobot |
| VQ-BeT (LeRobot) | transformer con cuantización vectorial | variable | no aplica | según checkpoint | HuggingFace / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada, por lo que la comparación se limita a arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un modelo específico de una tarea y un robot: no generaliza a otros brazos, cámaras o entornos sin reentrenamiento.
- El dataset de entrenamiento (`ketiholo/demo3`) no está documentado en la model card: se desconoce su tamaño, diversidad y posibles sesgos de las demostraciones.
- Riesgo de sobreajuste a las condiciones de recogida de datos (iluminación, posiciones iniciales, fondo), lo que puede degradar el rendimiento fuera de ese entorno.
- No hay métricas publicadas de tasa de éxito ni de robustez, por lo que no se puede evaluar su calidad antes de desplegarlo.
- El sufijo `env_bias2_ch100` no está explicado; conviene inspeccionar la configuración del checkpoint antes de usarlo en producción.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda conservar el aviso de licencia y verificar las licencias de las dependencias (LeRobot, PyTorch, backbone visual).
- No apto para tareas de lenguaje, razonamiento o visión general: su ámbito es exclusivamente el control motor por imitación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ketiholo/demo3_env_bias2_ch100
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/ketiholo/demo3
