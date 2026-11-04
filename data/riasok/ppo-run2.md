# Riasok/PPO-run2

## Resumen

PPO-run2 es un checkpoint de investigación publicado por el usuario Riasok en HuggingFace, correspondiente al experimento número dos de ajuste fino con PPO (Proximal Policy Optimization) sobre un modelo de robótica denominado MolmoAct2. No se trata de un modelo de lenguaje de propósito general, sino de un artefacto de entrenamiento: un checkpoint completo (actor, cabeza de valor, optimizador y estados RNG por rango) que requiere el VLM congelado y los procesadores exactos del modelo base `Riasok/few-shot-run-2` para poder cargarse. El repositorio ocupa 6.9 GB y contiene el estado de la actualización 107 de un entrenamiento que fue detenido intencionadamente antes de completar las 150 actualizaciones previstas.

El modelo parte de un SFT previo (`few-shot-run-2`) entrenado con 10 demostraciones por tarea (400 en total) durante 5000 pasos, que alcanzó un 80.4% de éxito (402/500) en el benchmark Spatial. Sobre esa base, el run de PPO congeló el VLM adaptado y entrenó únicamente el experto de acción y el crítico, con el objetivo de mejorar la política de control robótico mediante refuerzo. La relevancia de esta ficha es limitada fuera del ámbito de la investigación en robótica y RL: no es un modelo desplegable como asistente, sino una pieza reproducible de un pipeline experimental de aprendizaje por refuerzo aplicado a manipulación robótica.

La información pública disponible es escasa: no se declaran licencia, idiomas soportados ni especificaciones de arquitectura más allá de las etiquetas (`molmoact2`, `robotics`, `libero`, `reinforcement-learning`, `ppo`) y del contenido del README. Cualquier dato no confirmado en esa documentación se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; basada en MolmoAct2 (VLM + experto de acción con flow matching, según el código de carga `flow_ppo_pilot_v1`) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el checkpoint se distribuye en `update_107.pt` (PyTorch) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | PyTorch `.pt` (checkpoint completo: actor, value head, optimizer, RNG por rango) |
| Modelo base | `Riasok/few-shot-run-2` (SFT, step 5000) |
| Tamano del repositorio | 6.9 GB |
| Pipeline declarado | reinforcement-learning |
| Entorno de evaluación | Benchmark Spatial (100 ensayos pareados) |

## Arquitectura y entrenamiento

El checkpoint corresponde a un pipeline de RL sobre robótica: un VLM (MolmoAct2) adaptado mediante LoRA en la fase SFT previa, junto con un experto de acción y una cabeza de valor (crítico). En este run de PPO el VLM adaptado se congeló y solo se entrenaron el experto de acción y el crítico. El código de carga hace referencia a `runtime.flow_ppo_pilot_v1` y a `load_sft_flow_adapter`, lo que sugiere un experto de acción basado en flow matching con 10 pasos de flow y un `noise_std` de 0.05 en la carga de ejemplo. No se especifican el número de tokens de entrenamiento, la composición del dataset ni detalles del transformer más allá de lo indicado.

El entrenamiento partió del SFT `few-shot-run-2`, entrenado con 10 demostraciones por tarea (400 demostraciones totales) durante 5000 pasos, que alcanzó 402/500 (80.4%) de éxito en Spatial. El run de PPO se detuvo intencionadamente en la actualización 107 (fecha 2026-11-04) al cambiar el usuario a un pipeline SFT → PPO con VLM totalmente congelado, sin completar las 150 actualizaciones planificadas. El checkpoint incluye el optimizador y los estados RNG por rango, lo que permite reanudar el entrenamiento de forma exacta. El repositorio incluye además `evaluation_summary.json`, los JSON de evaluación por actualización, `export_manifest.json` (integridad de ficheros) y `checkpoint_metadata.json` (contenido verificado del checkpoint).

## Capacidades

- Control robótico mediante política de acción entrenada con PPO sobre el benchmark Spatial.
- Manipulación con un experto de acción basado en flow matching (10 pasos de flow en el ejemplo de carga).
- Evaluación cuantitativa de éxito por ensayos pareados (100 ensayos en las evaluaciones reportadas).
- Reanudación exacta del entrenamiento: el checkpoint conserva actor, cabeza de valor, optimizador y RNG por rango.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.
- No se documenta soporte de thinking mode, audio ni otras capacidades especiales.

## Casos de uso

- Reproducción de experimentos de RL en robótica: cargar `update_107.pt` junto con el VLM congelado y los procesadores de `Riasok/few-shot-run-2` para inspeccionar o continuar el entrenamiento con el driver incluido.
- Investigación en PPO aplicado a políticas visomotoras: comparar la evolución de la precisión entre actualizaciones (90% en la update 100, 93% en la update 90) para estudiar la estabilidad del entrenamiento.
- Estudio de congelación de VLM en RL: analizar el efecto de entrenar solo el experto de acción y el crítico frente a entrenar también el VLM (como en el SFT previo).
- Desarrollo de pipelines SFT → PPO: usar este checkpoint como referencia intermedia al migrar a un pipeline con VLM totalmente congelado.
- Auditoría de artefactos de entrenamiento: verificar integridad y contenido mediante `export_manifest.json` y `checkpoint_metadata.json`.
- Docencia y formación en RL aplicado a robótica: ejemplo real de checkpoint con optimizador y RNG para demostrar reanudación determinista de entrenamientos.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Notas |
|---|---|---|
| SFT base (`few-shot-run-2`) | 81/100 (81%) | 100 ensayos pareados |
| PPO update 90 | 93/100 (93%) | Mejor checkpoint evaluado |
| PPO update 100 | 90/100 (90%) | Última evaluación completada |
| PPO update 107 | No evaluado | Los pesos de este repo no tienen puntuación atribuida |
| SFT base (500 ensayos) | 402/500 (80.4%) | Resultado del SFT de partida |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores son resultados de éxito en el benchmark Spatial con 100 ensayos pareados, no un benchmark final de PPO con 500 ensayos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 6.9 GB y requiere además el VLM congelado del modelo base, por lo que el consumo real depende de ese componente.
- GPU recomendadas: no disponibles en la documentación; el ejemplo de carga usa `adapter.to('cuda')`.
- Compatibilidad con GPU de consumo: no confirmada; depende del VLM base y del experto de acción.
- Opciones de despliegue: no es un modelo servible con vLLM, llama.cpp, Ollama o TGI; requiere la implementación de entrenamiento de MolmoAct2 habilitada para LeRobot y el código `runtime.flow_ppo_pilot_v1`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Riasok/PPO-run2 | Checkpoint PPO sobre MolmoAct2 (robótica) | No disponible | No disponible | 90% (update 100) en Spatial, 100 ensayos | No disponible | HuggingFace, 0 descargas |
| Riasok/few-shot-run-2 | SFT base (MolmoAct2) | No disponible | No disponible | 81% en Spatial, 100 ensayos; 402/500 en 500 ensayos | No disponible | HuggingFace (modelo base) |
| Otros modelos comparables | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El checkpoint de la update 107 no ha sido evaluado; las cifras de 90% y 93% corresponden a las updates 100 y 90, no a estos pesos.
- Los resultados son de 100 ensayos pareados, no de un benchmark final de PPO con 500 ensayos; la varianza estadística es relevante.
- El entrenamiento se detuvo de forma intencionada en la update 107, antes de las 150 planificadas, por lo que la política no está completamente convergida.
- Requiere obligatoriamente el VLM congelado y los procesadores exactos de `Riasok/few-shot-run-2`, además de la implementación de entrenamiento de MolmoAct2 habilitada para LeRobot.
- Las rutas locales originales del driver de entrenamiento deben reemplazarse antes de reutilizarlo.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido.
- No se declaran idiomas soportados ni sesgos conocidos; al ser un artefacto de robótica, el riesgo de alucinación en texto no aplica de forma directa, pero sí el riesgo de fallos de política en entornos no vistos.
- El modelo tiene 0 descargas y 0 likes, sin validación externa de la comunidad.
- No apto para despliegue como asistente conversacional ni para tareas de NLP generales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Riasok/PPO-run2
- Modelo base SFT: https://huggingface.co/Riasok/few-shot-run-2
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información disponible.
