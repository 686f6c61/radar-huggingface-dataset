# DORLR/wirecraft-corl2026-sim-routing-act

## Resumen

WireCraft CoRL 2026 — Simulation 1-Clip Routing (ACT, 100k) es un checkpoint de política robótica entrenado con el algoritmo ACT (Action Chunking with Transformers) sobre la tarea simulada de enrutado de clips deformables. Lo publica el grupo DORLR como artefacto oficial asociado a un artículo aceptado en CoRL 2026, y está pensado exclusivamente para reproducir los resultados de la Tabla 2 y el Apéndice F de dicho artículo. El modelo opera sobre el simulador WireCraft (Isaac Lab) con un robot UR5 y la tarea `WireCraft-UR5-Deformable-ClipRouting-v0`.

Técnicamente es un modelo pequeño: 51.670.663 parámetros en formato safetensors, alojado en la librería LeRobot y empaquetado como pipeline de robótica. No es un modelo de lenguaje ni un modelo multimodal generalista; es una política de imitación que mapea observaciones visuales y de estado del robot a secuencias de acciones de bajo nivel. Su relevancia es acotada pero clara: sirve como referencia reproducible para investigación en manipulación de objetos deformables y para comparar variantes de ACT en el benchmark de enrutado.

El checkpoint corresponde al paso 100.000 de entrenamiento, con batch size 64, learning rate 1e-5, `chunk_size=100` y `n_action_steps=50`, semilla 1000. El autor reporta un resultado de 64,06 ± 11,16 % en la métrica de éxito de la Tabla 2 promediada sobre tres semillas de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación |
| Parámetros totales | 51.670.663 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; horizonte de acción definido por `chunk_size=100` y `n_action_steps=50`) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de robótica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es una arquitectura de imitación basada en transformer que predice trozos de acción (action chunks) en lugar de acciones individuales, lo que reduce el error de acumulación y suaviza el control. En este checkpoint el horizonte de predicción es de 100 pasos (`chunk_size=100`) y se ejecutan 50 pasos antes de recalcular (`n_action_steps=50`). El modelo consume observaciones del simulador (imágenes y estado del robot) y produce comandos de acción para el UR5 en la tarea de enrutado de clips deformables.

El entrenamiento se realizó sobre el dataset `DORLR/Deformable-1Clip-Routing-v0-Scripted-1600`, compuesto por 1.600 episodios generados por un script a 30 FPS en el entorno WireCraft sobre Isaac Lab. La configuración corresponde al preset `scripts/wirecraft/experiments/corl2026_clip_routing.yaml` de la rama `corl2026-repro` del repositorio WireCraft. Se entrenó hasta el paso 100.000 con batch size 64, learning rate 1e-5 y semilla 1000. No se especifica en la información disponible si hubo fases de RLHF, DPO u otras técnicas de refinamiento posteriores; en el contexto de ACT lo habitual es imitación supervisada pura, pero no se confirma explícitamente.

## Capacidades

- Control robótico de manipulación para la tarea simulada de enrutado de clips deformables (`WireCraft-UR5-Deformable-ClipRouting-v0`).
- Predicción de secuencias de acción en bloques de 100 pasos con ejecución de 50 pasos por ciclo.
- Política de imitación entrenada sobre demostraciones scripted, no sobre interacción humana.
- Evaluación reproducible en Isaac Lab mediante el script `eval_lerobot.py` del repositorio WireCraft.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües, de visión general, audio ni modo thinking.
- Diseñado exclusivamente para simulación; no debe confundirse con los checkpoints reales de UR5 del mismo grupo.

## Casos de uso

- Reproducción de resultados del artículo CoRL 2026: ejecutar el comando de evaluación incluido para verificar el 64,06 ± 11,16 % reportado en la Tabla 2 sobre las semillas 1000, 2000 y 3000.
- Baseline para investigación en manipulación de objetos deformables: sirve como punto de comparación frente a nuevas políticas (difusión, flow matching, variantes de ACT) en la misma tarea de enrutado.
- Estudio de action chunking: permite analizar el efecto de `chunk_size=100` y `n_action_steps=50` sobre la estabilidad del control en tareas con contacto y deformación.
- Validación de pipelines de simulación: útil para comprobar que el entorno WireCraft sobre Isaac Lab y la integración con LeRobot funcionan correctamente antes de entrenar modelos propios.
- Docencia y formación en robótica de imitación: ejemplo completo y pequeño (51,7 M de parámetros) de un flujo entrenamiento-evaluación con LeRobot.
- Desarrollo de protocolos de evaluación: como referencia para definir métricas de éxito y semillas en benchmarks de enrutado de clips.
- No está pensado para despliegue en robot real ni para tareas distintas del enrutado de clips en simulación.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Contexto |
|---|---|---|---|
| WireCraft 1-Clip Routing (Tabla 2, CoRL 2026) | Tasa de éxito (%) | 64,06 ± 11,16 | Media sobre 3 semillas de evaluación (1000, 2000, 3000), checkpoint paso 100.000 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje, ya que no aplican a este modelo. Tampoco se ofrecen comparaciones numéricas con otras políticas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en precisión FP32 el peso ocupa aproximadamente 0,2 GB, por lo que la huella de memoria es muy reducida y el cuello de botella será el renderizado del simulador, no el modelo.
- GPU recomendadas: no especificadas por el autor. Para ejecutar Isaac Lab con `--num_envs 16` se recomienda una GPU con soporte CUDA y VRAM suficiente para el simulador (típicamente A100, H100, RTX 4090 o RTX 3090 en función de la escena).
- Cabe en GPU de consumo: sí, el modelo en sí ocupa muy poca memoria; el requisito real viene del simulador Isaac Lab.
- Opciones de despliegue: LeRobot (librería nativa), con evaluación vía `scripts/wirecraft/eval_lerobot.py` del repositorio WireCraft en la rama `corl2026-repro`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DORLR/wirecraft-corl2026-sim-routing-act (este) | 51,67 M | `chunk_size=100`, `n_action_steps=50` | Enrutado de clips en simulación | no disponible | Hugging Face, LeRobot |
| DORLR/wirecraft-corl2026-real-routing-act-* | no disponible | no disponible | Enrutado real en UR5 | no disponible | Hugging Face (referenciado en la model card) |
| Otras políticas ACT en LeRobot | no disponible | no disponible | Manipulación diversa | variable | Hugging Face / LeRobot |

No se dispone en la información proporcionada de datos numéricos comparativos con alternativas como Diffusion Policy, π0 u otras políticas de imitación en la misma tarea.

## Limitaciones y advertencias

- Modelo específico de una única tarea y un único entorno simulado; no generaliza a otras tareas ni a robot real.
- Entrenado sobre 1.600 episodios scripted, no sobre demostraciones humanas, lo que puede limitar la diversidad de comportamientos aprendidos.
- El autor advierte explícitamente de no confundirlo con los checkpoints de enrutado real (`DORLR/wirecraft-corl2026-real-routing-act-*`).
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Sin información sobre sesgos, alucinación o restricciones idiomáticas, ya que no es un modelo de lenguaje.
- El resultado reportado (64,06 ± 11,16 %) tiene una varianza alta entre semillas, lo que sugiere sensibilidad a la inicialización y al entorno de evaluación.
- Requiere el stack completo de Isaac Lab y WireCraft para su evaluación; no es un modelo autónomo ejecutable de forma aislada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DORLR/wirecraft-corl2026-sim-routing-act
- Dataset de entrenamiento: https://huggingface.co/datasets/DORLR/Deformable-1Clip-Routing-v0-Scripted-1600
- Repositorio WireCraft (rama `corl2026-repro`): https://github.com/DORLR/WireCraft/tree/corl2026-repro
- Preset de experimento: `scripts/wirecraft/experiments/corl2026_clip_routing.yaml` (dentro del repositorio anterior)
- Script de evaluación: `scripts/wirecraft/eval_lerobot.py` (dentro del repositorio anterior)
