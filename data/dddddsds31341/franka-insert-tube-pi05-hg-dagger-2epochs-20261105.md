# dddddsds31341/Franka-Insert-Tube-pi05-HG-DAgger-2epochs-20261105

## Resumen

Franka-Insert-Tube-pi05-HG-DAgger-2epochs-20261105 es un checkpoint de inferencia para robótica derivado de pi0.5, el modelo de visión-lenguaje-acción (VLA) de Physical Intelligence, publicado por el usuario dddddsds31341 en HuggingFace. El modelo está especializado en una tarea concreta de manipulación robótica: insertar un tubo con un brazo Franka. No es un modelo de propósito general, sino un ajuste fino orientado a una única política de control entrenada con demostraciones offline y marcos de intervención humana.

El entrenamiento sigue el esquema HG-DAgger (Human-Gated DAgger), una variante de DAgger en la que un operador humano interviene durante la recolección de datos para corregir la política cuando esta se desvía. El checkpoint corresponde a la inferencia tras dos épocas completas sobre demostraciones offline y marcos de intervención, con un horizonte de acción de 10 pasos y la normalización original conservada. El repositorio ocupa 12,4 GB e incluye pesos de inferencia y activos de normalización, pero no el estado del optimizador.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación reproducible (con enlace al run de Weights & Biases y al modelo base), útil para quienes trabajan con el stack openpi y quieren replicar o inspeccionar un pipeline de ajuste fino de pi0.5 para tareas de inserción. No hay información publicada sobre licencia, idiomas ni benchmarks, y el modelo no está pensado para uso comercial sin verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-acción (VLA) basada en pi0.5; no se detalla la configuración interna en la model card |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoint openpi con directorios `params/` y `assets/`; no se especifica safetensors ni GGUF |
| Horizonte de acción | 10 pasos |
| Tamaño del repositorio | 12,4 GB |
| Librería | openpi |
| Tarea | Inserción de tubo con brazo Franka |
| Esquema de entrenamiento | HG-DAgger, 2 épocas, 1298 actualizaciones |
| Modelo base | dddddsds31341/Franka-Insert-Tube-pi05-step-20000 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo; solo indica que se trata de un checkpoint de inferencia derivado de pi0.5, el modelo VLA de Physical Intelligence, y que conserva el diseño de checkpoint de openpi con los directorios `params/` y `assets/`. No se detallan el número de parámetros, la composición del transformer, el mecanismo de atención ni el codificador visual. Tampoco se especifica la composición del dataset de entrenamiento más allá de la mención a demostraciones offline y marcos de intervención humana.

El entrenamiento sigue HG-DAgger durante dos épocas completas, con un total de 1298 actualizaciones (índice final basado en cero: 1297). El checkpoint es una media exponencial (EMA) de los pesos de inferencia, e incluye los activos de normalización originales. No se incluye el estado del optimizador, lo que confirma que el artefacto está pensado exclusivamente para inferencia. El run de entrenamiento está documentado en Weights & Biases, lo que permite auditar la curva de aprendizaje y las intervenciones humanas, aunque no se aportan métricas de éxito en la model card.

## Capacidades

- Control robótico de manipulación: genera acciones de horizonte 10 para la tarea específica de inserción de tubo con un brazo Franka.
- Política condicionada por observaciones visuales y estado del robot, heredada de la arquitectura VLA pi0.5.
- Aprendizaje por intervención humana: incorpora correcciones de un operador mediante HG-DAgger, lo que mejora la robustez frente a desviaciones de la política.
- Inferencia con pesos EMA, orientada a despliegue estable en el stack openpi.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito.
- No se documenta soporte de function calling ni integración con APIs de texto.

## Casos de uso

- Investigación en aprendizaje por imitación: el checkpoint sirve como punto de partida reproducible para estudiar el efecto de HG-DAgger frente a imitación pura en tareas de inserción, gracias al enlace al run de W&B y al modelo base.
- Evaluación de políticas VLA en entornos Franka: permite comparar el rendimiento de un ajuste fino de dos épocas con el checkpoint base step-20000 en la misma tarea.
- Replicación de pipelines openpi: al conservar el layout `params/` y `assets/`, se puede cargar directamente en el ecosistema openpi para validar flujos de entrenamiento e inferencia.
- Docencia y formación en robótica: útil como ejemplo real de un ciclo completo de recolección de datos, intervención humana y ajuste fino de un VLA.
- Pruebas de robustez ante desviaciones: el modelo está entrenado con marcos de intervención, por lo que es adecuado para experimentos que midan la recuperación tras perturbaciones en la inserción.
- Base para nuevos ajustes finos: al ser un checkpoint de inferencia con normalización conservada, puede servir como inicialización para experimentos posteriores con más épocas o más datos de intervención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de inserción, comparaciones con el modelo base ni curvas de evaluación. El único dato de entrenamiento disponible es el número de actualizaciones (1298) y las épocas (2), sin métricas de rendimiento asociadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (12,4 GB) incluye pesos y activos de normalización, pero no se especifica la huella en memoria ni la cuantización.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del checkpoint sugiere que podría requerir GPUs de gama alta o profesional, pero no hay datos para afirmarlo.
- Opciones de despliegue: el modelo está diseñado para la librería openpi; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Franka-Insert-Tube-pi05-HG-DAgger-2epochs-20261105 | no disponible | no disponible | Inserción de tubo con Franka | no disponible | HuggingFace, 0 descargas |
| Franka-Insert-Tube-pi05-step-20000 (modelo base) | no disponible | no disponible | Inserción de tubo con Franka | no disponible | HuggingFace |
| pi0.5 (Physical Intelligence) | no disponible | no disponible | VLA generalista | no disponible | No confirmado en la información |

No se dispone de datos de rendimiento, parámetros ni contexto para establecer una comparación cuantitativa con alternativas. La comparativa se limita a la relación de linaje entre el checkpoint y su modelo base.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una única tarea (inserción de tubo con Franka) y no es transferible a otras tareas sin nuevo ajuste fino.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de tasa de éxito ni de robustez, lo que impide evaluar su fiabilidad frente al modelo base.
- Riesgo de sobreajuste a las condiciones de recolección: al entrenarse con dos épocas sobre demostraciones e intervenciones concretas, puede degradarse ante cambios de iluminación, posición inicial o hardware.
- Sin información sobre sesgos: no se documentan sesgos conocidos, pero al ser un modelo visual-robótico, puede heredar sesgos de los datos de demostración.
- Riesgo de alucinación en el sentido de acciones no válidas: como política de control, puede generar trayectorias incorrectas fuera de la distribución de entrenamiento.
- Artefacto de investigación: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de validación por terceros.
- Sin soporte documentado para cuantización ni para despliegue fuera de openpi.

## Enlaces

- HuggingFace: https://huggingface.co/dddddsds31341/Franka-Insert-Tube-pi05-HG-DAgger-2epochs-20261105
- Modelo base: https://huggingface.co/dddddsds31341/Franka-Insert-Tube-pi05-step-20000
- Run de entrenamiento en Weights & Biases: https://wandb.ai/bofang/franka_hg_dagger/runs/bbc04c13
- Librería openpi: no se proporciona enlace directo en la información disponible
- Paper de pi0.5: no disponible en la información proporcionada
