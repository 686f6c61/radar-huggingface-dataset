# Kaz55/dp-bluev2-rs500-h64-200k

## Resumen

`Kaz55/dp-bluev2-rs500-h64-200k` es un checkpoint de política robótica entrenado con Diffusion Policy sobre la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es una política visomotora que, a partir del estado articular de un robot UR5e y de cuatro cámaras (dos RealSense y dos sensores táctiles GelSight), genera secuencias de acciones de manipulación. El autor es Kaz55 y el modelo se publica como parte de un barrido de checkpoints (sweeps) que incluye también las versiones de 50k, 100k y 150k pasos.

El modelo tiene 308.812.570 parámetros (unos 309 M) almacenados en safetensors, con un repositorio de 1,2 GB. Se entrenó durante 200.000 pasos completos con batch 8 y semilla 1000, lo que equivale a aproximadamente 15,8 épocas sobre un dataset de 90 episodios y 101.406 fotogramas. La innovación práctica del modelo es de índole de ingeniería de datos: LeRobot exige que todas las cámaras compartan una única resolución, por lo que se creó la variante `rs500`, que reescala las RealSense a 500x375 para que coincidan con las GelSight y el conjunto sea aceptado por `validate_features`.

Su relevancia es acotada pero clara para la comunidad de robótica de imitación: documenta una configuración reproducible de Diffusion Policy con horizonte 64 y 60 pasos de acción ejecutados, con entrada multimodal que combina visión y tacto, y sirve como punto de comparación frente a los baselines ACT del mismo autor. No se ha publicado licencia, ni idiomas, ni resultados de benchmarks, y el repositorio no registra descargas ni valoraciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo de difusión condicionado, con codificadores visuales y U-Net de acción; implementación de LeRobot) |
| Parámetros totales | 308.812.570 (dato real de safetensors) |
| Parámetros activos | No aplica: arquitectura densa, no es MoE |
| Longitud de contexto | No aplica como contexto de lenguaje. Horizonte de difusión de 64 pasos de acción, de los cuales se ejecutan 60 (`n_action_steps=60`) |
| Tipos de cuantización | No disponible en la model card. El repositorio contiene safetensors, presumiblemente en fp32 |
| Idiomas soportados | No aplica: no es un modelo de lenguaje. No se declara ningún idioma |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería `lerobot`) |

Datos adicionales de entrada y entrenamiento:

| Parámetro | Valor |
|---|---|
| Entradas | `observation.state` (26 dimensiones) + RealSense x2 + GelSight x2 |
| Resolución de cámara | 500x375 en las cuatro cámaras |
| Entradas excluidas | `observation.velocity` y `observation.effort`, deliberadamente omitidas |
| Pasos de entrenamiento | 200.000 de 200.000 |
| Batch | 8 |
| Semilla | 1000 |
| Épocas aproximadas | ~15,8 a 200k pasos |
| Dataset | `Kaz55/dg5f_ur5e_bluev2_rs500`, 90 episodios / 101.406 fotogramas |
| Tamaño del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy: una política que aprende la distribución de secuencias de acción mediante un proceso de difusión, en lugar de regresar directamente una única acción. La red opera sobre un horizonte de predicción (`horizon`) de 64 pasos y expone 60 de ellos para su ejecución en el robot (`n_action_steps=60`). El autor documenta explícitamente la restricción arquitectónica que obliga a esta elección: el `horizon` debe ser múltiplo de 8 porque el U-Net submuestrea por factor 2 tres veces, de modo que un bloque de 60 acciones no es expresable y 64 es el valor válido más cercano por encima de 60. Mantener `n_action_steps` en 60 permite alinear la comparación con las ejecuciones ACT ac60 del mismo barrido.

La observación combina un vector de estado proprioceptivo de 26 dimensiones con cuatro flujos de imagen: dos cámaras RealSense y dos sensores táctiles GelSight. La condición de resolución única (500x375) es una restricción impuesta por `configuration_diffusion.py` en `validate_features`, y es la razón de que exista la variante de dataset `rs500`: el conjunto `bluev2` original mezcla RealSense a 640x480 con GelSight a 500x375 y es rechazado directamente. Las señales de velocidad y esfuerzo se excluyen de forma deliberada para mantener la coherencia con el resto de ejecuciones del barrido.

El entrenamiento se realizó durante 200.000 pasos con batch 8 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni ninguna fase de ajuste por preferencias; se trata de aprendizaje por imitación supervisado sobre demostraciones. La función de pérdida es el error cuadrático medio sobre el ruido predicho, que el autor advierte expresamente que no es comparable con la pérdida L1 sobre acciones de ACT: los checkpoints de difusión solo deben compararse entre sí, y la selección final de política debe hacerse mediante evaluación sobre el robot real.

## Capacidades

- Generación de secuencias de acción (action chunking) para control de manipulación robótica, con 64 pasos predichos y 60 ejecutados por inferencia.
- Condicionamiento multimodal: estado articular de 26 dimensiones más cuatro cámaras, dos de ellas táctiles (GelSight), lo que permite reaccionar tanto a la apariencia visual como al contacto.
- Política visomotora entrenada por imitación sobre demostraciones teleoperadas de una celda concreta (UR5e, configuración bluev2).
- Aprendizaje de distribuciones multimodales de acción gracias al esquema de difusión, útil cuando una misma observación admite varias trayectorias válidas.
- Variantes de checkpoint en 50k, 100k, 150k y 200k pasos, lo que permite estudiar la curva de aprendizaje y el compromiso entre ajuste y generalización.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de pensamiento: no es un modelo de lenguaje.
- No dispone de capacidades de generación de texto, código, matemáticas, visión general (VQA, OCR) ni audio.

## Casos de uso

- Manipulación con UR5e en laboratorio: la política consume el estado de 26 dimensiones y las cuatro cámaras para producir bloques de 60 acciones, por lo que puede controlar directamente el robot en tareas de pick-and-place dentro de la celda para la que fue entrenada.
- Tareas de inserción y ensamblaje con contacto: la inclusión de dos sensores GelSight permite explotar información táctil en tareas donde la visión por sí sola es ambigua (encaje de conectores, inserción de piezas), un escenario donde la realimentación de fuerza aparente es crítica.
- Investigación en imitación multimodal visión-tacto: el checkpoint sirve como referencia reproducible para estudiar cómo contribuye cada modalidad, ya que las entradas están explícitamente delimitadas y las señales de velocidad y esfuerzo quedan fuera.
- Barrido de checkpoints y estudio de escalado en pasos de entrenamiento: comparar 50k, 100k, 150k y 200k sobre la misma semilla y dataset permite analizar cuándo satura la pérdida de difusión y cuándo mejora el rendimiento real en robot.
- Comparación de familias de políticas: el autor mantiene `n_action_steps=60` precisamente para poder contrastar con las ejecuciones ACT ac60, de modo que este checkpoint es útil como punto de referencia en un estudio comparativo difusión frente a clonación de comportamiento con transformer.
- Punto de partida para ajuste fino con datos propios: al ser un checkpoint de LeRobot, se puede reiniciar el entrenamiento sobre un dataset propio que respete la restricción de resolución única de 500x375 en todas las cámaras.
- Validación de infraestructura de captura: la existencia de la variante `rs500` documenta un requisito concreto de LeRobot, útil para equipos que estén preparando sus propios datasets y necesiten saber de antemano que todas las cámaras deben compartir resolución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente describe la función de pérdida (MSE sobre el ruido predicho) y advierte que no es comparable con la pérdida L1 sobre acciones de ACT. No se incluyen tasas de éxito, ni métricas de evaluación on-robot, ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- Parámetros: 308.812.570 (~309 M). Estimación de peso en memoria solo para el modelo: ~1,24 GB en fp32, ~0,62 GB en fp16/bf16 y ~0,31 GB en int8. A estas cifras hay que sumar los codificadores visuales, los buffers del proceso de difusión y las activaciones.
- Tamaño del repositorio: 1,2 GB, coherente con pesos en precisión completa.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 8 GB de VRAM debería poder alojar el modelo; una RTX 4090, A100 o H100 ofrecen margen amplio.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060 12 GB, RTX 4070 o superiores, aunque no hay confirmación del autor ni mediciones publicadas.
- El coste real de despliegue no es solo de VRAM: el sistema requiere cuatro cámaras a 500x375 (dos RealSense y dos GelSight) y la electrónica de control del UR5e.
- Opciones de despliegue: la librería nativa es LeRobot (`lerobot`); también es desplegable con PyTorch estándar. No aplican vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje ni se distribuye en GGUF.
- Tipos de cuantización soportados: no disponibles en la información proporcionada.
- Latencia y throughput: no disponibles. Cabe señalar que, al tratarse de una política de difusión, la inferencia implica varios pasos de denoising por bloque de acción, lo que añade coste frente a políticas de regresión directa, pero no se han publicado mediciones.

## Comparativa con modelos similares

Comparación con los checkpoints hermanos del mismo barrido (misma arquitectura, dataset, batch y semilla; solo cambian los pasos de entrenamiento):

| Modelo | Parámetros | Horizonte / pasos de acción | Pasos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-bluev2-rs500-h64-50k | ~309 M (no confirmado) | 64 / 60 | 50.000 | No disponible | Hugging Face, 0 descargas |
| dp-bluev2-rs500-h64-100k | ~309 M (no confirmado) | 64 / 60 | 100.000 | No disponible | Hugging Face, 0 descargas |
| dp-bluev2-rs500-h64-150k | ~309 M (no confirmado) | 64 / 60 | 150.000 | No disponible | Hugging Face, 0 descargas |
| **dp-bluev2-rs500-h64-200k** | 308.812.570 | 64 / 60 | 200.000 | No disponible | Hugging Face, 0 descargas |

El autor menciona explícitamente ejecuciones ACT ac60 como referencia comparativa dentro de sus propios barridos, con `n_action_steps=60` para alinearlas con este checkpoint. Sin embargo, no se proporcionan los identificadores, los parámetros ni los resultados de esas ejecuciones ACT, por lo que no es posible completar una comparación cuantitativa. No hay datos publicados que permitan comparar este modelo con políticas de terceros en términos de tasa de éxito, latencia o robustez.

## Limitaciones y advertencias

- Licencia no disponible: sin un término de licencia declarado, el uso comercial o la redistribución quedan en un limbo legal. Es imprescindible contactar con el autor antes de cualquier uso en producción.
- Sesgo de dominio severo: el entrenamiento se limita a 90 episodios de una única celda (UR5e, configuración bluev2, `rs500`). La política aprenderá las particularidades de iluminación, disposición de objetos y dinámica de ese montaje y es improbable que generalice a otra célula, robot u objetos sin ajuste fino.
- Riesgo de acciones fuera de distribución: como toda política de imitación, puede generar trayectorias no vistas ante observaciones novedosas. No incorpora mecanismo de abstención, detección de incertidumbre ni parada de seguridad; cualquier despliegue físico necesita salvaguardas externas.
- Dependencia estricta del formato de entrada: exactamente cuatro cámaras a 500x375 y `observation.state` de 26 dimensiones. Alterar resoluciones, número de cámaras o dimensionalidad del estado rompe la compatibilidad con los pesos.
- Especificidad del hardware: el modelo asume un UR5e y un estado proprioceptivo concreto; no es portable a otros brazos sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas on-robot documentadas. La pérdida de difusión (MSE sobre ruido) es un proxy de entrenamiento, no una medida de rendimiento de la tarea, y el propio autor advierte que no es comparable con la pérdida de ACT.
- Ausencia de validación comunitaria: 0 descargas y 0 likes. No hay evidencia de que terceros hayan reproducido el resultado.
- Advertencia sobre los metadatos: las fechas de creación y actualización registradas apuntan a 2026, lo que dificulta la trazabilidad temporal del modelo; conviene verificarlo con el autor.
- Idiomas y capacidades de lenguaje: no aplica. No debe evaluarse con benchmarks de texto ni usarse como asistente conversacional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kaz55/dp-bluev2-rs500-h64-200k
- Dataset de entrenamiento: https://huggingface.co/datasets/Kaz55/dg5f_ur5e_bluev2_rs500
- Librería LeRobot (Hugging Face): https://github.com/huggingface/lerobot
- Referencia del método Diffusion Policy (no citada en la model card, incluida por ser el origen de la arquitectura): https://arxiv.org/abs/2303.04137

Nota: los resultados de la búsqueda web proporcionada no contienen información relacionada con este modelo; los enlaces devueltos corresponden a páginas corporativas de Microsoft y no aportan datos técnicos sobre la política.
