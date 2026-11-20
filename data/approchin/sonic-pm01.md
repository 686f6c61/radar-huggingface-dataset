# approchin/sonic-pm01

## Resumen

SONIC-PM01 es un conjunto de cuatro exportaciones del actor determinista del modelo NVIDIA GEAR-SONIC, adaptadas por el usuario approchin para el robot humanoide EngineAI PM01. GEAR-SONIC es la rama de seguimiento de referencias de NVIDIA orientada a control robótico mediante aprendizaje por refuerzo; este repositorio no contiene el modelo completo, sino únicamente la ruta determinista encoder/FSQ/decoder de control, con aproximadamente 13,9 millones de parámetros aprendidos. El problema que aborda es el seguimiento de movimiento (motion tracking) de referencias cinemáticas en un humanoide concreto, partiendo de un modelo preentrenado sobre el robot G1 y adaptándolo al PM01.

La relevancia es doble: por un lado, demuestra un flujo de adaptación de políticas de control entre morfologías de humanoides mediante fine-tuning denso con PPO; por otro, publica las exportaciones en ONNX y safetensors con validación numérica reproducible, lo que facilita la inspección y la inferencia en CPU sin depender del stack de entrenamiento original. El repositorio pesa 0,4 GB e incluye cuatro checkpoints que combinan dos ámbitos de adaptación (encoder congelado frente a encoder y decoder actualizados) con dos hitos de entrenamiento (4.000 y 28.000 actualizaciones PPO globales).

Es importante subrayar que estos pesos no constituyen un controlador de hardware validado: la salida son 23 medias de acción corporal en crudo, no pares ni ángulos articulares absolutos, y el modelo no implementa estimación de estado, transporte al robot ni bucle de control en tiempo real. La licencia es la NVIDIA Open Model License, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor de política para RL con encoder, cuantización FSQ y decoder de control (ruta determinista); exportado a ONNX y safetensors |
| Parametros totales | Aproximadamente 13,9 millones de parámetros aprendidos (solo actor determinista) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; la observación de entrada es un vector float32 de forma `[1,789]` y el tokenizador de `[1,541]` |
| Tipos de cuantizacion | No disponible (el repositorio incluye exportaciones ONNX y safetensors; no se documentan variantes cuantizadas adicionales) |
| Idiomas soportados | No aplica (modelo de control robótico, no lingüístico) |
| Licencia | NVIDIA Open Model License (`nvidia-open-model-license`) |
| Formato de pesos | ONNX (`actor_mean23.onnx`) y safetensors (`actor_mean23.safetensors`), con `config.json` y `manifest.json` por checkpoint |

## Arquitectura y entrenamiento

La arquitectura es un actor de política para aprendizaje por refuerzo compuesto por un encoder, una capa de cuantización FSQ (finite scalar quantization) y un decoder de control. La adaptación parte de la rama de seguimiento de referencias del G1 de NVIDIA GEAR-SONIC y se ajusta al PM01 mediante PPO con fine-tuning denso, sin LoRA. Se entrenaron dos variantes: la variante A congela el encoder y actualiza solo el decoder de control; la variante B actualiza encoder y decoder. Durante el PPO se entrenó un actor y un crítico independiente, aunque el crítico no se distribuye en las exportaciones.

El entrenamiento de adaptación usó una RTX 4090 por variante. El hito de 4.000 actualizaciones incluye una etapa padre de 1.018 actualizaciones PPO seguida de 2.982 actualizaciones sobre una biblioteca ampliada de 3.950 referencias del PM01 (250 de CMU y 3.700 de BONES/SEED). La ocupación aproximada del proceso de entrenamiento hasta el paso 4.000 fue de 6,514 horas GPU para A y 6,712 para B, incluyendo arranque, carga y guardado, y excluyendo el preentrenamiento de SONIC, la evaluación y la preparación de datos. Las exportaciones se validaron numéricamente contra el actor PyTorch original con 695 entradas privadas (439 filas de observaciones históricas de simulación y 256 sintéticas), una fila por lote, superando la tolerancia predeclarada `1e-5 + 1e-4 * abs(reference)` sin ampliarla; el empaquetado del encoder y las características FSQ cuantizadas coincidieron exactamente.

## Capacidades

- Generación de medias de acción corporal para control de un humanoide PM01: salida `mean23` de forma `[1,23]` en float32.
- Seguimiento de referencias de movimiento (motion tracking) en simulación, con criterios de finalización de la referencia.
- Procesamiento de observaciones empaquetadas nativas: entrada `actor_obs` de 789 dimensiones con historiales agrupados de diez pasos y nueve características de retroalimentación del marco de enlace del frame actual.
- Tokenización de entrada mediante el tokenizador de 541 dimensiones con almacenamiento `selector1 | q240 | qd240 | orientation60` y selector canónico igual a 1.
- Inferencia en CPU mediante ONNX Runtime con `CPUExecutionProvider`, a través del script `examples/infer_cpu.py`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión, audio ni modo de pensamiento: es un actor de control, no un modelo de lenguaje.

## Casos de uso

- Investigación en adaptación entre morfologías de humanoides: comparar las variantes A (encoder congelado) y B (encoder y decoder actualizados) para estudiar cuánto del encoder preentrenado en el G1 es transferible al PM01, usando los cuatro checkpoints publicados.
- Reproducción de experimentos de seguimiento de movimiento en simulación: cargar los pesos en Isaac/PhysX con el PM01 y evaluar la finalización de referencias bajo los criterios de altura y orientación descritos en la model card.
- Inferencia en CPU para validación de integridad: ejecutar `examples/infer_cpu.py` con observaciones correctamente empaquetadas y comparar la salida `mean23` frente a la referencia PyTorch, útil en pipelines de CI para detectar regresiones numéricas en exportaciones.
- Análisis de robustez de políticas de RL: estudiar la diferencia de RMSE articular entre los hitos de 4.000 y 28.000 actualizaciones (por ejemplo, 9,725°/9,589° frente a 8,657°/8,292° en OMOMO394 + LAFAN106) para caracterizar la curva de mejora con el entrenamiento.
- Docencia y divulgación sobre RL aplicado a robótica: el tamaño reducido (13,9 millones de parámetros, 0,4 GB) y el formato ONNX permiten inspeccionar la ruta encoder/FSQ/decoder en un portátil sin GPU.
- Integración como componente de un pipeline de simulación a hardware: usar las exportaciones como bloque de política dentro de un sistema mayor que aporte estimación de estado, postprocesado y transporte, dado que el modelo por sí solo no implementa ninguna de esas funciones.
- Comparación de estrategias de fine-tuning denso frente a alternativas con LoRA en políticas de control, tomando como referencia los tiempos de ocupación GPU documentados (6,514 y 6,712 horas hasta el paso 4.000).

## Benchmarks y rendimiento

La model card incluye resultados de evaluación en simulación física (PM01 con Isaac/PhysX, una semilla, inicio fijo en el primer frame, física a 200 Hz y control a 50 Hz):

| Población fija | Checkpoint | Finalización A | Finalización B | RMSE 24 articulaciones A/B |
|---|---:|---:|---:|---|
| OMOMO394 + LAFAN106 | 4.000 | 485/500 | 483/500 | 9,725° / 9,589° |
| BONES500 | 4.000 | 498/500 | 498/500 | 7,579° / 8,505° |
| OMOMO394 + LAFAN106 | 28.000 | 485/500 | 485/500 | 8,657° / 8,292° |
| BONES500 | 28.000 | 498/500 | 498/500 | 6,011° / 5,033° |

La finalización indica que se completa la referencia bajo criterios locales inspirados en el paper de altura y orientación; no es un porcentaje de precisión de seguimiento. La regla principal marca fallo si el error de altura de la raíz supera 0,25 m, si alguno de los 13 enlaces rastreados supera 0,30 m de error de altura o si el ángulo SO(3) de la raíz supera 0,8 rad. Los errores usan prefijos realmente ejecutados, incluyendo fallos, con pesos de clip iguales. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks lingüísticos, ya que el modelo no es lingüístico.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el actor de 13,9 millones de parámetros; el repositorio completo ocupa 0,4 GB.
- GPU recomendadas: no se requiere GPU para inferencia; el flujo documentado usa ONNX Runtime con `CPUExecutionProvider`. Para reentrenamiento o adaptación, la model card indica una RTX 4090 por variante.
- Cabe en cualquier GPU consumer, e incluso en CPU sin aceleración, dado el tamaño reducido del actor.
- Opciones de despliegue: ONNX Runtime (CPU), con el script `examples/infer_cpu.py` y `requirements-inference.txt`; los pesos safetensors permiten carga en PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La model card solo documenta tiempos de entrenamiento (6,514 y 6,712 horas GPU hasta el paso 4.000 por variante), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SONIC-PM01 (este) | ~13,9 M (actor) | Vector de observación `[1,789]` | Finalización 485-498/500 y RMSE 5,033°-9,725° en las poblaciones evaluadas | NVIDIA Open Model License | Hugging Face y GitHub de approchin |
| NVIDIA GEAR-SONIC (base) | No disponible | No disponible | No disponible | NVIDIA Open Model License | Referenciado como `base_model`; datos no disponibles en esta ficha |
| Any2Any | No disponible | No disponible | La model card indica que no se reclama superioridad ni equivalencia frente a Any2Any | No disponible | No disponible |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento de las alternativas; la model card menciona explícitamente que no se hace ninguna afirmación de igualdad de tareas, superioridad con medio presupuesto ni eficiencia normalizada por hardware respecto a Any2Any.

## Limitaciones y advertencias

- La salida son 23 medias de acción corporal en crudo; no es un par, ni un ángulo articular absoluto, ni una señal directamente ejecutable en hardware.
- El modelo no implementa estimación de estado del robot, transporte ni un controlador validado; la descripción de postprocesado en simulación no debe sustituirse silenciosamente por una interfaz de hardware.
- Las exportaciones excluyen el crítico, el optimizador, el estado de ruido de exploración, el dataset de movimiento, el planificador en línea y el estado completo de reanudación del entrenamiento.
- La validación numérica realizada es de cómputo (tolerancia `1e-5 + 1e-4 * abs(reference)`), no una prueba de seguimiento físico ni evidencia de control en hardware real.
- La evaluación física usa una sola semilla (42), inicios fijos en el primer frame y poblaciones con exposición previa a evaluación; BONES es una partición de la misma biblioteca fuente con solapamiento de familias de acción en 431/500 clips de test, y el solapamiento con el preentrenamiento de SONIC es desconocido.
- La evaluación de OMOMO rastrea el cuerpo sin dinámica de objetos, y los criterios de finalización son locales e inspirados en un paper, no el evaluador oficial de Any2Any.
- No se distribuyen cohortes de observaciones ni archivos de movimiento en crudo con los pesos; el usuario debe aportar observaciones correctamente empaquetadas.
- Licencia NVIDIA Open Model License: es necesario revisar sus términos para uso comercial y para redistribución de derivados.
- Riesgo de alucinación y sesgos lingüísticos: no aplica, al no ser un modelo de lenguaje; el riesgo relevante es de generalización limitada a las poblaciones y morfología evaluadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 20 de noviembre de 2026, por lo que no cuenta con validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/approchin/sonic-pm01
- Repositorio de código y ejemplos de inferencia en CPU: https://github.com/approchin/sonic-pm01
- Modelo base NVIDIA GEAR-SONIC: https://huggingface.co/nvidia/GEAR-SONIC
- Licencia: https://huggingface.co/approchin/sonic-pm01/blob/main/LICENSE
- Contrato de entrada: `weights/input_contract.json` (dentro del repositorio del modelo)
- Documentación de arquitectura: `docs/architecture.md` (dentro del repositorio de GitHub)
- Validación de exportación: `evidence/export_validation.json` (dentro del repositorio de GitHub)
