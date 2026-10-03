# Anu120/Thesis_part_pickup

## Resumen

Thesis_part_pickup es un modelo de politica robótica (vision-language-action, VLA) publicado por el usuario Anu120 en HuggingFace, resultado del ajuste fino del modelo base lerobot/smolvla_base sobre el dataset Anu120/part_pickup_merged. Se trata, por tanto, de una especialización de SmolVLA orientada a una tarea concreta de manipulación (recogida de piezas), no de un modelo de propósito general entrenado desde cero.

SmolVLA es un modelo compacto de tipo VLA que combina un codificador visión-lenguaje con un experto de acción, y que según su paper logra un rendimiento competitivo en tareas de manipulación robótica con un coste computacional reducido, apto para hardware de consumo. El modelo aquí descrito tiene 450.046.176 parámetros (unos 450 millones) y un tamaño de repositorio de 0,9 GB, coherente con pesos almacenados en precisión reducida (aproximadamente bf16/fp16).

Es relevante ahora porque demuestra el flujo típico de especialización de modelos fundacionales de robótica mediante LeRobot: partir de un checkpoint preentrenado y ajustarlo con un dataset propio de demostraciones. Su limitada difusión pública (0 descargas y 0 likes en el momento de la consulta) y la ausencia de resultados de benchmarks lo sitúan como un artefacto de investigación más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA; no disponible el detalle exacto de capas |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SmolVLA (paper arXiv:2506.01844), un VLA compacto que acopla un modelo visión-lenguaje de pequeño tamaño con un experto de acción para generar comandos motores a partir de observaciones visuales y de la instrucción de tarea. En esta ficha no se dispone de la descripción interna detallada (número de capas, mecanismo de atención concreto, tipo de decodificación de acciones) más allá de lo declarado por el autor; los detalles arquitectónicos precisos deben consultarse en el paper de SmolVLA y en la ficha del modelo base lerobot/smolvla_base.

El entrenamiento de esta variante concreta consiste en un ajuste fino (finetune) del checkpoint lerobot/smolvla_base sobre el dataset Anu120/part_pickup_merged, que contiene demostraciones de la tarea de recogida de piezas. No se especifican en la información disponible el número de tokens, la composición del dataset, el número de episodios de demostración ni si se emplearon técnicas de RLHF o DPO. Los tags del repositorio indican que el entrenamiento y la publicación se realizaron con la librería LeRobot.

## Capacidades

- Control robótico por imitación: genera acciones motoras a partir de observaciones visuales para ejecutar la tarea de recogida de piezas sobre la que fue ajustado.
- Comprensión visión-lenguaje: al derivar de SmolVLA, integra entrada visual e instrucciones en lenguaje para condicionar el comportamiento.
- Ejecución de políticas de manipulación: pensado para desplegarse en robots compatibles con LeRobot (por ejemplo, plataformas tipo SO-100/SO-101 según la documentación de LeRobot).
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües ni modos de "pensamiento". Estas capacidades no se declaran en la model card.
- Capacidad de uso general fuera de su tarea objetivo: no disponible (es una política especializada, no un modelo de propósito general).

## Casos de uso

- Automatización de una celda de pick-and-place: el modelo se usaría como política de control para que un brazo robótico recoja piezas de una posición y las coloque en otra, aprovechando que fue ajustado específicamente sobre demostraciones de "part pickup".
- Reproducción de la tesis/investigación de Anu120: sirve como artefacto reproducible para validar el pipeline de entrenamiento con LeRobot y el dataset part_pickup_merged.
- Punto de partida para nuevo ajuste fino: puede reutilizarse como checkpoint inicial para otras tareas de manipulación mediante `lerobot-train`, reduciendo el coste frente a entrenar desde cero.
- Evaluación comparativa de políticas VLA: útil como referencia compacta (450 M de parámetros) frente a políticas más grandes en experimentos de eficiencia.
- Despliegue en hardware de consumo: al ser pequeño, cabe en GPUs de gama media, lo que permite prototipado en laboratorio o en robots de bajo coste sin infraestructura de centro de datos.
- Docencia y demostraciones de robótica con aprendizaje por imitación: para ilustrar el ciclo completo de recogida de datos, entrenamiento y evaluación con `lerobot-record`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los metadatos del repositorio no incluyen métricas de éxito de tarea, tasas de acierto ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 M de parámetros en bf16/fp16, los pesos ocupan aproximadamente 0,9 GB; sumando activaciones y buffers, el consumo puede situarse en el rango de 1 a 3 GB según lote y resolución de imagen.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. No requiere A100 ni H100.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en GPUs de consumo modernas e incluso en equipos con recursos limitados.
- Opciones de despliegue: librería LeRobot (comandos `lerobot-train` y `lerobot-record`) sobre PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son el formato habitual para políticas robóticas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Categoria | Licencia | Disponibilidad |
|---|---|---|---|---|
| Thesis_part_pickup (SmolVLA finetune) | ~450 M | VLA (manipulacion) | apache-2.0 | HuggingFace, con LeRobot |
| lerobot/smolvla_base | ~450 M (aproximado) | VLA base | no disponible en esta consulta | HuggingFace |
| OpenVLA | ~7 B (aproximado, dato publico) | VLA | no disponible en esta consulta | HuggingFace |
| pi0 (Physical Intelligence) | orden de miles de millones (aproximado, dato publico) | VLA | no disponible en esta consulta | publicaciones del autor |

Nota: los datos de OpenVLA y pi0 proceden de conocimiento público general y no de la información proporcionada en esta búsqueda; deben verificarse en sus fuentes originales. No se dispone de comparaciones de rendimiento entre estos modelos y Thesis_part_pickup.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está ajustado para la tarea concreta de recogida de piezas del dataset part_pickup_merged; su comportamiento fuera de esa distribución es impredecible.
- Ausencia de benchmarks: no hay ninguna métrica publicada de éxito de tarea, por lo que no puede garantizarse su fiabilidad.
- Datos de entrenamiento no documentados: se desconoce el número de episodios, la variedad de escenarios y posibles sesgos derivados del dataset.
- Idiomas no declarados: la model card no especifica idiomas soportados; no debe asumirse multilingüismo.
- Riesgo de alucinación/fallo de política: como modelo de control, puede generar trayectorias erróneas o inseguras ante entradas fuera de distribución.
- Licencia: apache-2.0, que permite uso comercial, pero se recomienda verificar la licencia del modelo base y del dataset asociados antes de un despliegue productivo.
- Madurez: con 0 descargas y 0 likes, es un artefacto de investigación sin validación por parte de la comunidad.
- Uso en producción: no recomendado sin una evaluación exhaustiva en el entorno físico real y con las medidas de seguridad robótica oportunas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Anu120/Thesis_part_pickup
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de ajuste fino: https://huggingface.co/datasets/Anu120/part_pickup_merged
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas (LeRobot): https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
