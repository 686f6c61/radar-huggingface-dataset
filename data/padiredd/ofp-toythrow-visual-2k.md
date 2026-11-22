# padiredd/ofp-toythrow-visual-2k

## Resumen

ofp-toythrow-visual-2k es una política de robótica entrenada con LeRobot, publicada por el usuario padiredd en Hugging Face. No es un modelo de lenguaje: es un checkpoint de control visuomotor para una tarea concreta de manipulación (lanzamiento de un objeto de juguete, según el nombre), entrenado sobre un dataset propio de tres cámaras (`toy-throw-visual-2k-3cam`). El repositorio contiene el paso 100000 en la raíz y checkpoints intermedios cada 10000 pasos.

El modelo tiene 425.812.448 parámetros en formato safetensors y un repositorio de 17,0 GB, coherente con diez checkpoints completos más los pesos raíz. La arquitectura interna (tipo de política, backbone visual, dimensiones de acción) no se detalla en la model card, que se limita a indicar la receta de entrenamiento: 100000 pasos, batch de 64, semilla 1000 y aumento de imagen activado.

Su relevancia es acotada y práctica: sirve como referencia reproducible de un pipeline LeRobot entrenado con el fork `lerobot-cyclo` de ROBOTIS para una tarea específica. No hay información publicada sobre licencia, idiomas ni benchmarks, y el modelo no está pensado para uso general fuera de su tarea de robótica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | política de robótica LeRobot (tipo concreto no disponible) |
| Parámetros totales | 425.812.448 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Tarea | lanzamiento de objeto de juguete (toy throw) |
| Dataset de entrenamiento | `local/toy-throw-visual-2k-3cam` (tres cámaras) |
| Pasos de entrenamiento | 100000 (batch 64, semilla 1000) |
| Checkpoints | raíz (paso 100000) y step-10000 a step-90000 |
| Aumento de imagen | activado |
| Co-training | alpha None, split episode None |
| Tamaño del repositorio | 17,0 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la política. Se sabe que es un modelo LeRobot entrenado con el fork `lerobot-cyclo` de ROBOTIS, lo que sitúa el entrenamiento dentro del ecosistema LeRobot para políticas visuomotoras. La entrada es visual (dataset de tres cámaras) y la salida corresponde a acciones de control robótico, aunque no se especifican el backbone visual, la cabeza de acción ni la dimensionalidad del espacio de acciones.

La receta de entrenamiento está documentada parcialmente: 100000 pasos con batch de 64, semilla 1000 y aumento de imagen activado. No se indica el número de tokens, la composición del dataset ni si hubo etapas de ajuste fino adicionales. El repositorio incluye checkpoints intermedios cada 10000 pasos, lo que permite evaluar la curva de aprendizaje y seleccionar un punto de control distinto del final.

## Capacidades

- Control visuomotor para una tarea de manipulación concreta: lanzamiento de un objeto de juguete.
- Procesamiento de entrada visual procedente de tres cámaras.
- Generación de acciones de robot compatibles con el ecosistema LeRobot.
- Carga directa mediante `from_pretrained("padiredd/ofp-toythrow-visual-2k")`.
- Selección de checkpoints intermedios (step-10000 a step-90000) para comparar estados de entrenamiento.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Reproducción de experimentos LeRobot: cargar el checkpoint raíz o los intermedios para replicar la receta (100000 pasos, batch 64, semilla 1000) y comparar resultados entre pasos.
- Evaluación de políticas visuomotoras: usar los diez checkpoints para medir cómo evoluciona el rendimiento en la tarea de lanzamiento a lo largo del entrenamiento.
- Base para ajuste fino en tareas similares: partir de los pesos entrenados y adaptarlos a otro objeto o trayectoria dentro del mismo montaje de tres cámaras.
- Integración en pipelines de investigación con ROBOTIS: el entrenamiento se realizó con el fork `lerobot-cyclo`, por lo que encaja en flujos de trabajo que ya usen ese stack.
- Docencia y divulgación: ejemplo completo y descargable de una política LeRobot con dataset propio, útil para explicar el ciclo datos-entrenamiento-despliegue en robótica.
- Referencia para aumento de datos: el uso de aumento de imagen activado permite estudiar su efecto comparando con reentrenamientos sin esa opción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; con 425,8 M de parámetros, en precisión completa el peso ronda 1,7 GB, y en fp16 aproximadamente 0,85 GB, sin contar el coste de los procesadores visuales.
- GPU recomendadas: no especificadas. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder alojar los pesos en fp16, aunque el coste real depende del backbone visual no documentado.
- GPU de consumo: previsiblemente sí en tarjetas tipo RTX 3060, RTX 4060 o superiores, condicionado al preprocesado de las tres cámaras.
- Opciones de despliegue: la librería declarada es `lerobot`, por lo que el despliegue natural es mediante esa librería y `from_pretrained`. No hay información sobre soporte en vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas LeRobot comparables ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una única tarea (lanzamiento de objeto de juguete) y un montaje concreto de tres cámaras; no generaliza a otras tareas sin reentrenamiento o ajuste fino.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución de los pesos; conviene contactar con el autor antes de usarlo en producción.
- Sin datos de evaluación: no hay benchmarks, métricas de éxito ni comparaciones publicadas, por lo que el rendimiento real es desconocido.
- Dataset local no publicado: la referencia `local/toy-throw-visual-2k-3cam` apunta a una ruta local del autor, lo que dificulta la reproducibilidad exacta del entrenamiento.
- Sesgos y alucinación: no aplican en el sentido lingüístico, pero sí existe riesgo de comportamiento errático fuera de la distribución visual del entrenamiento.
- Repositorio de 17 GB: requiere espacio de almacenamiento considerable y tiempos de descarga largos si se quieren todos los checkpoints.
- Dependencia del fork `lerobot-cyclo` de ROBOTIS: la compatibilidad con la versión estándar de LeRobot no está garantizada.
- Sin información sobre idiomas ni contexto: irrelevante para su función, pero impide cualquier uso fuera del control robótico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/ofp-toythrow-visual-2k
- LeRobot (librería): https://github.com/huggingface/lerobot
- Fork lerobot-cyclo de ROBOTIS: no disponible en la información proporcionada
