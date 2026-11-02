# Riasok/few-shot-run-1

## Resumen

few-shot-run-1 es un checkpoint de ajuste fino supervisado (SFT) del modelo de robotica MolmoAct2, desarrollado por el usuario Riasok y publicado en HuggingFace bajo la libreria LeRobot. El modelo parte de `allenai/MolmoAct2` y se ha entrenado con una unica demostracion por tarea en 40 tareas del benchmark LIBERO, lo que lo convierte en un experimento de aprendizaje few-shot en el dominio de la manipulacion robotica. Su relevancia radica en explorar hasta que punto un VLM de robotica preentrenado puede adaptarse a nuevas tareas con minima supervision.

El checkpoint corresponde al paso 1000 de entrenamiento y contiene tanto los pesos de la politica como el estado de normalizacion y los preprocesadores/postprocesadores exactos guardados durante el entrenamiento. Se distribuye en formato safetensors con un total de 5.601.988.144 parametros (aproximadamente 5,6 mil millones) y un tamano de repositorio de 12,7 GB.

La model card reporta un 48,2% de exito en el benchmark LIBERO Spatial sobre 500 episodios. Este checkpoint es la fuente SFT del posterior `Riasok/PPO-run1`, un experimento separado de refinamiento con PPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base MolmoAct2, politica VLM + action expert) |
| Parametros totales | 5.601.988.144 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo se basa en `allenai/MolmoAct2`, una arquitectura de politica robotica que combina un VLM con un modulo experto en acciones (action expert). El ajuste fino se realizo con aprendizaje supervisado sobre el benchmark LIBERO, manteniendo el VLM parcialmente congelado mediante LoRA y entrenando el experto de acciones de forma completa. Los detalles concretos de la arquitectura interna del modelo base no se especifican en la informacion disponible.

El entrenamiento utilizo una demostracion por tarea en 40 tareas LIBERO, sumando 40 demostraciones y 6607 fotogramas en total, con un tamano de lote global de 16. La configuracion LoRA del VLM emplea rango 64 y alpha 16. El checkpoint publicado corresponde al paso 1000 y conserva el estado de normalizacion y los procesadores originales; las referencias de configuracion exportada apuntan a `allenai/MolmoAct2` en lugar de la ruta local de la maquina de entrenamiento, aunque los pesos y tensores de normalizacion no se han modificado.

## Capacidades

- Control de robot mediante politicas visomotoras: genera acciones a partir de observaciones visuales en tareas de manipulacion.
- Aprendizaje few-shot: capacidad demostrada de adaptarse a tareas LIBERO con una sola demostracion por tarea.
- Integracion con el ecosistema LeRobot: carga mediante `MolmoAct2Policy.from_pretrained` y los procesadores guardados.
- Soporte de normalizacion de acciones: incluye el estado exacto de normalizacion para reproducir el pre/postprocesamiento.
- Capacidades del VLM subyacente (lenguaje, vision, razonamiento): heredadas de `allenai/MolmoAct2`, aunque no se detallan en la informacion disponible.
- Tool calling, agentes, modo thinking, audio: no disponible.

## Casos de uso

- Investigacion en aprendizaje few-shot para robotica: permite evaluar cuanto puede adaptarse un VLM de robotica preentrenado con una sola demostracion por tarea, usando el checkpoint como linea base reproducible en LIBERO.
- Reproduccion de experimentos SFT: al incluir pesos, estado de normalizacion y procesadores exactos, sirve para replicar el entrenamiento y comparar con el posterior `Riasok/PPO-run1`.
- Punto de partida para refinamiento con RL: es la fuente SFT declarada de `Riasok/PPO-run1`, por lo que se puede usar como inicializacion en pipelines de aprendizaje por refuerzo.
- Evaluacion comparativa de benchmarks de manipulacion: util para contrastar el rendimiento few-shot (48,2% en LIBERO Spatial) frente al modelo de referencia full-shot `allenai/MolmoAct2-LIBERO`.
- Desarrollo de politicas de manipulacion en simulacion: despliegue en entornos LIBERO para generar trayectorias de accion en tareas de alcance y colocacion de objetos.
- Estudio de configuraciones LoRA en robotica: la configuracion concreta (rango 64, alpha 16) permite analizar el efecto del ajuste eficiente de parametros en politicas visomotoras.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Episodios |
|---|---|---|---|
| LIBERO Spatial | Tasa de exito | 48,2% | 500 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5,6 mil millones de parametros, en precision completa (fp32) se requeririan aproximadamente 22 GB solo para pesos; en bf16/fp16, unos 11-12 GB; en cuantizacion de 8 bits, en torno a 6 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamano, un modelo de 5,6B en bf16 podria caber en GPUs con 16 GB o mas, pero no hay datos oficiales.
- Opciones de despliegue: la model card exige la implementacion de LeRobot con soporte de entrenamiento de MolmoAct2 y la carga mediante `MolmoAct2Policy.from_pretrained`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | LIBERO Spatial | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Riasok/few-shot-run-1 | 5.601.988.144 | no disponible | 48,2% (500 episodios) | no disponible | HuggingFace |
| allenai/MolmoAct2-LIBERO | no disponible | no disponible | no disponible | no disponible | HuggingFace (referencia full-shot de AllenAI) |
| Riasok/PPO-run1 | no disponible | no disponible | no disponible | no disponible | HuggingFace (refinamiento PPO sobre este checkpoint) |

## Limitaciones y advertencias

- Entrenamiento few-shot muy limitado: solo 40 demostraciones (una por tarea) y 6607 fotogramas, lo que puede provocar sobreajuste y baja generalizacion fuera de las tareas LIBERO evaluadas.
- Rendimiento modesto: 48,2% de exito en LIBERO Spatial implica que mas de la mitad de los episodios fallan; no es adecuado para produccion sin validacion adicional.
- Dependencia de implementacion especifica: requiere la version de LeRobot con soporte de entrenamiento de MolmoAct2 y la carga mediante `MolmoAct2Policy.from_pretrained`; no es un modelo generico cargable con transformers estandar.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribucion.
- Idiomas no disponibles: no se especifican capacidades multilingues.
- Sesgos y alucinacion: no hay informacion publicada sobre sesgos del modelo base ni sobre el riesgo de alucinacion en el dominio robotico.
- Checkpoint experimental: cero descargas y cero likes en el momento de la consulta, sin validacion externa de la comunidad.
- Estado de normalizacion acoplado: los tensores de normalizacion deben usarse con los procesadores guardados para reproducir el comportamiento; un uso incorrecto del pre/postprocesamiento invalidaria los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Riasok/few-shot-run-1
- Modelo base: https://huggingface.co/allenai/MolmoAct2
- Referencia full-shot de AllenAI: https://huggingface.co/allenai/MolmoAct2-LIBERO
- Checkpoint PPO derivado: https://huggingface.co/Riasok/PPO-run1
