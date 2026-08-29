# kaKTEC/2608_moving_box_01_00test_pi05

## Resumen

El modelo `kaKTEC/2608_moving_box_01_00test_pi05` es una política de robótica basada en el modelo Vision-Language-Action (VLA) π₀.₅ (Pi05) de Physical Intelligence, fine-tuneada con el framework LeRobot de Hugging Face. El modelo original π₀.₅ está diseñado para generalización en entornos abiertos, evolucionando sobre π₀ para adaptarse a situaciones y entornos no vistos durante el entrenamiento. Este fine-tune concreto se ha entrenado para una tarea específica: colocar un cubo blanco en una caja en movimiento, utilizando un robot tipo `so_follower` con dos cámaras (superior y de muñeca).

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y se distribuye en formato safetensors, con un tamaño de repositorio de 9,4 GB. Está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones significativas. El entrenamiento se realizó sobre el dataset `kaKTEC/2608_moving_box_01_00test_20260817_143324`, que contiene 60 episodios y 19.680 fotogramas a 30 FPS. La relevancia de este modelo radica en su naturaleza de fine-tune de un VLA de última generación, demostrando cómo se puede adaptar un modelo base de propósito general a tareas robóticas específicas con relativamente pocos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, no orientado a lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `lerobot/pi05_base`, que implementa la arquitectura π₀.₅ de Physical Intelligence. π₀.₅ es un modelo Vision-Language-Action que combina un codificador visual (para procesar imágenes de cámaras), un codificador de estado (para la información proprioceptiva del robot) y un decodificador de acciones. La implementación en LeRobot se adapta del repositorio open-source OpenPI. El modelo base fue preentrenado con una gran cantidad de datos heterogéneos de robótica y después fine-tuneado para esta tarea específica.

El entrenamiento de este fine-tune se realizó con el dataset `kaKTEC/2608_moving_box_01_00test_20260817_143324`, que contiene 60 episodios de la tarea "Put a white cube into the moving box" (colocar un cubo blanco en la caja en movimiento). Se usaron 60.000 pasos de entrenamiento con un batch size de 32, optimizador AdamW, learning rate de 2,5e-5 y semilla 1000. La versión de LeRobot utilizada fue la 0.6.1. Las entradas del modelo son el estado del robot (6 dimensiones) y dos imágenes RGB de 480x640 píxeles (cámara superior y cámara de muñeca), y la salida es una acción de 6 dimensiones. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; se trata de un entrenamiento de imitación supervisada estándar.

## Capacidades

- Generacion de acciones de robot: el modelo produce comandos de acción de 6 grados de libertad (posición y orientación) a partir de observaciones visuales y de estado.
- Percepcion visual multimodal: procesa simultáneamente dos flujos de imagen (cámara superior y cámara de muñeca) a 30 FPS.
- Control en tiempo real: diseñado para ejecutarse en bucle de control con latencia baja, adecuado para manipulación robótica física.
- Generalizacion a variaciones de la tarea: al ser un fine-tune de π₀.₅, conserva parte de la capacidad de generalización del modelo base, aunque limitada por el dataset específico.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento e inferencia de LeRobot, incluyendo scripts de rollout y entrenamiento.
- No incluye capacidades de lenguaje natural, tool calling ni razonamiento simbólico; es un modelo puramente motor (policy) para control robótico.

## Casos de uso

- Manipulacion de objetos en entornos dinamicos: el modelo está entrenado para colocar un cubo en una caja en movimiento, lo que requiere seguimiento visual y sincronización de movimientos. Puede aplicarse a tareas similares de pick-and-place con objetos en movimiento.
- Automatizacion de procesos industriales: en líneas de montaje donde los objetos se desplazan sobre cintas transportadoras, este tipo de política puede adaptarse para tareas de recogida y colocación.
- Investigacion en aprendizaje por imitacion: sirve como ejemplo de fine-tune de un VLA base con un dataset pequeño (60 episodios), útil para estudiar la transferencia de capacidades de modelos preentrenados a tareas específicas.
- Desarrollo de robots colaborativos: el modelo puede integrarse en robots tipo `so_follower` (seguidor) para tareas de asistencia en entornos de laboratorio o talleres.
- Benchmarking de VLA en hardware real: permite evaluar el rendimiento de π₀.₅ fine-tuneado en un robot físico, comparando con otras políticas de imitación.
- Educacion y prototipado: investigadores y estudiantes pueden usar este modelo como punto de partida para experimentar con LeRobot y VLA, modificando el dataset o la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito en el robot real, ni comparaciones con otros modelos en tareas similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado que el modelo tiene 4,14 mil millones de parámetros, en FP16 ocuparía aproximadamente 8,3 GB de VRAM, y en FP32 unos 16,6 GB. Sin embargo, al ser un VLA con procesamiento de imágenes, el uso real de memoria puede ser mayor debido a los tensores intermedios.
- GPU recomendadas: no hay especificación oficial. Para ejecutar el modelo en tiempo real con LeRobot, se recomienda una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060/4070, A10, L4) para FP16. Para mayor margen, una RTX 4090 o A100 sería adecuada.
- Compatibilidad con GPU de consumo: sí, es probable que quepa en GPUs de consumo con 12-16 GB de VRAM, pero la latencia de inferencia debe ser lo suficientemente baja para control en tiempo real (típicamente <50 ms), lo que puede requerir GPUs de gama alta.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot, que soporta inferencia local con PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. Depende de la GPU y de la optimización del código de inferencia de LeRobot.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos en la información proporcionada. El modelo es un fine-tune de `lerobot/pi05_base`, por lo que la comparación natural sería contra el propio modelo base y contra otros VLA como OpenVLA (7B) o RT-2 (55B), pero no hay datos de rendimiento en esta tarea específica. Se puede indicar que, al ser un fine-tune, su rendimiento depende en gran medida del dataset de entrenamiento y de la tarea concreta.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kaKTEC/2608_moving_box_01_00test_pi05 | 4,14 B | no disponible | Apache 2.0 | Hugging Face |
| lerobot/pi05_base | 4,14 B (estimado) | no disponible | Apache 2.0 | Hugging Face |
| OpenVLA | 7 B | no disponible | MIT (investigación) | Hugging Face |

Nota: los datos de OpenVLA son de conocimiento general, no de la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un modelo entrenado con un dataset de 60 episodios de una sola tarea, su capacidad de generalización a otras tareas o entornos es limitada.
- Riesgo de alucinacion: en el contexto robótico, el riesgo se traduce en acciones incorrectas o impredecibles cuando el modelo se enfrenta a situaciones fuera de la distribución de entrenamiento. No hay evaluación formal de este riesgo.
- Limitaciones de contexto o idioma: el modelo no procesa lenguaje natural; solo observaciones visuales y de estado. No es adecuado para tareas que requieran instrucciones verbales o razonamiento simbólico.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright y se indiquen los cambios. No hay restricciones adicionales conocidas.
- Caveat para produccion: el modelo no ha sido evaluado en el robot real (no hay resultados de éxito). Antes de desplegarlo en un entorno de producción, es imprescindible realizar pruebas exhaustivas de seguridad y robustez, especialmente porque la tarea involucra objetos en movimiento.
- Dependencia del hardware: el rendimiento en tiempo real depende críticamente de la latencia de inferencia; en GPUs de baja gama puede no cumplir los requisitos de control.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaKTEC/2608_moving_box_01_00test_pi05
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/kaKTEC/2608_moving_box_01_00test_20260817_143324
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Perfil del autor: https://huggingface.co/kaKTEC
