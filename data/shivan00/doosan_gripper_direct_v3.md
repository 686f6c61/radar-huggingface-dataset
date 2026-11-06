# shivan00/doosan_gripper_direct_v3

## Resumen

`shivan00/doosan_gripper_direct_v3` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un algoritmo de aprendizaje por imitación presentado en el paper arXiv:2304.13705. El modelo ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, y está asociado a un dataset propio del mismo autor centrado en el control de un gripper Doosan. Su pipeline en el Hub es `robotics` y su licencia es Apache 2.0.

El modelo resuelve el problema de generar comandos de control de un brazo robótico con pinza a partir de observaciones visuales y propioceptivas, aprendiendo de demostraciones teleoperadas. ACT predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error acumulado y mejora la estabilidad en tareas de manipulación de precisión. Con 51,67 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto que puede ejecutarse en hardware modesto.

Es relevante ahora porque forma parte del ecosistema LeRobot, que estandariza el entrenamiento, la evaluación y el despliegue de políticas robóticas en formato safetensors y con integración directa en el Hub. Sin embargo, la información pública disponible es muy limitada: no hay benchmarks publicados, no hay descripción de las tareas concretas ni del dataset más allá de su identificador, y el modelo tiene cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder de observaciones y decoder de acciones |
| Parámetros totales | 51.670.663 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la ventana de observaciones configurada en LeRobot; no especificada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un transformer con un esquema de predicción de chunks de acción. El modelo recibe observaciones (típicamente imágenes de cámaras y el estado de las articulaciones) y emite una secuencia de acciones futuras de longitud fija, lo que permite un control más suave y consistente que la predicción paso a paso. La implementación concreta sigue la de LeRobot, que envuelve el transformer en una política entrenable con `lerobot-train` y la exporta en safetensors.

El entrenamiento se realiza a partir de demostraciones teleoperadas recogidas en el dataset `shivan00/doosan_gripper_direct_v3`, del que no se publican detalles sobre número de episodios, frecuencia de captura, número de cámaras ni composición de las tareas. No hay información sobre si se aplicó regularización adicional, aumento de datos o ajuste fino posterior. El modelo card únicamente documenta el flujo de entrenamiento y evaluación con LeRobot y la licencia Apache 2.0.

## Capacidades

- Generación de secuencias de acciones para control de un brazo robótico con gripper Doosan, a partir de observaciones visuales y de estado.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Predicción de action chunks, que reduce el error acumulado en tareas de manipulación de precisión.
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train`, evaluación con `lerobot-record` y carga desde el Hub.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo de pensamiento; es un modelo específico de robótica.
- No se especifican las tareas concretas que el modelo ha aprendido a ejecutar más allá del contexto del gripper Doosan.

## Casos de uso

- Manipulación de precisión con gripper Doosan: el modelo puede ejecutar secuencias de agarre y colocación aprendidas de demostraciones teleoperadas, aprovechando la predicción de chunks para suavizar el control.
- Automatización de pick-and-place en líneas de montaje: integrado en un bucle de control con LeRobot, el modelo recibe imágenes de la escena y emite comandos de articulación para recoger y depositar piezas.
- Prototipado rápido de políticas robóticas: al ser un modelo compacto de 51,67 M de parámetros y 0,2 GB, permite iterar en estaciones de trabajo con una sola GPU consumer antes de desplegar en el robot real.
- Evaluación reproducible en laboratorio: el flujo `lerobot-record` con `--policy.path` apuntando al checkpoint permite medir la tasa de éxito en episodios controlados y comparar con otras políticas ACT.
- Investigación en aprendizaje por imitación: sirve como referencia para estudiar el efecto del tamaño de chunk, la composición del dataset y la arquitectura ACT en tareas de gripper.
- Base para ajuste fino con nuevos datos: al estar en safetensors y con licencia Apache 2.0, puede reentrenarse con demostraciones adicionales del mismo robot o de robots similares.
- Despliegue en entornos de bajo coste: su tamaño reducido permite ejecución en GPUs de gama media o incluso en CPU para inferencia de baja frecuencia, aunque no se publican latencias medidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del modelo (51,67 M de parámetros en safetensors, repositorio de 0,2 GB), la inferencia en fp32 requiere aproximadamente 0,2 GB de pesos más el overhead de activaciones y del encoder visual, por lo que es probable que quepa en GPUs con 4-8 GB de VRAM, aunque no se confirma en la documentación.
- GPU recomendadas: no especificadas por el autor; el flujo de LeRobot usa `--policy.device=cuda` y es compatible con GPUs NVIDIA. Para entrenamiento se recomienda una GPU con al menos 8-16 GB, aunque no se documenta.
- ¿Cabe en GPU consumer? Sí, por tamaño es plausible en RTX 3060, RTX 4060, RTX 4090 y similares, pero no hay confirmación oficial ni mediciones.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), carga directa de safetensors con PyTorch. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shivan00/doosan_gripper_direct_v3 | 51,67 M | no disponible | sin benchmarks publicados | Apache 2.0 | Hugging Face Hub |
| Políticas ACT de LeRobot (genéricas) | variable según configuración | no disponible | sin benchmarks comparables publicados | Apache 2.0 (típicamente) | Hugging Face Hub |
| Políticas Diffusion Policy | variable | no disponible | no disponible en esta ficha | variable | Hugging Face Hub |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- No hay benchmarks publicados: no es posible afirmar tasas de éxito ni comparar objetivamente con otras políticas.
- El modelo está entrenado para un robot y un gripper concretos (Doosan); no se garantiza su transferencia a otras morfologías, cámaras o entornos.
- No se documentan las tareas, el número de episodios ni la composición del dataset, lo que dificulta evaluar su robustez y cobertura.
- Riesgo de sobreajuste a las condiciones de captura del dataset original (iluminación, posiciones, objetos), típico del aprendizaje por imitación.
- No se documentan sesgos ni evaluaciones de seguridad; en robótica real es imprescindible validar en entorno controlado antes de uso en producción.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo tiene cero descargas y cero likes, por lo que no hay evidencia de uso en la comunidad.
- No aplica a tareas de lenguaje, visión general ni agentes conversacionales; es exclusivamente una política de control robótico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shivan00/doosan_gripper_direct_v3
- Dataset asociado: https://huggingface.co/datasets/shivan00/doosan_gripper_direct_v3
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
