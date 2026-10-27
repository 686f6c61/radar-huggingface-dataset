# hugging-tiger/microduck-baseline

## Resumen

`hugging-tiger/microduck-baseline` no es un modelo de lenguaje, sino una política de control entrenada con aprendizaje por refuerzo: un archivo ONNX que se carga en una ranura de política del robot bípedo microduck para que este camine de forma continua. La política consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, y se ejecuta de forma indefinida hasta recibir la orden contraria (comportamiento descrito por el autor como *perpetual*).

El autor es el usuario `hugging-tiger` y el entrenamiento se realizó sobre el stack `mjlab-microduck 0.1.0` del repositorio `microduck-challenges` de Pollen Robotics, con la tarea `Mjlab-Sprint2m-MicroDuck`, semilla 1 y checkpoint 2999. El repositorio es mínimo (0.0 GB) y en el momento de la consulta no registra descargas ni likes.

Su relevancia es contextual: microduck es un robot bípedo open source de 25 cm y 399 USD presentado por Pollen Robotics y Hugging Face en agosto de 2026 como plataforma de RL físico, y esta ficha documenta una política base reproducible que sirve de referencia para comparar desarrollos propios de locomoción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con aprendizaje por refuerzo (PPO en MuJoCo/mjlab) y exportada a ONNX; topología de capas no disponible |
| Parametros totales | no disponible (el repo ocupa 0.0 GB y no se detalla el tamaño de `policy.onnx`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso, sin memoria de contexto |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` con esquema 2 del manifiesto de políticas de microduck |
| Espacio de observacion | 61 dimensiones, con normalizador embebido en el ONNX (se alimenta con observaciones en crudo) |
| Espacio de acciones | 14 dimensiones |
| Frecuencia de control | 50 Hz |
| Tarea de entrenamiento | `Mjlab-Sprint2m-MicroDuck` |
| Checkpoint / semilla | 2999 / 1 |

## Arquitectura y entrenamiento

La política se entrena en simulación con PPO sobre MuJoCo mediante el framework mjlab, en la versión `mjlab-microduck 0.1.0` (commit `8d0dbc94c`) alojada en `pollen-robotics/microduck-challenges` (commit `6ff40704a`, rama `main`). La configuración registrada es de 4096 entornos paralelos y 3000 iteraciones máximas con semilla 1, registrando en TensorBoard bajo el nombre de ejecución `baseline`; el artefacto final corresponde al checkpoint 2999, es decir, prácticamente al límite de iteraciones configurado.

El resultado se exporta a ONNX con el normalizador de observaciones ya integrado en el grafo, de modo que el consumidor solo tiene que pasar observaciones sin procesar. El autor advierte explícitamente de que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo `uv.lock`, el mismo commit y la misma semilla produce una política comparable, no los mismos pesos. El repositorio no describe la topología de la red (capas, activaciones, número de parámetros) ni la composición exacta del vector de observación.

## Capacidades

- Locomoción bípeda continua: genera una marcha estable que se mantiene activa de forma indefinida hasta que otra política o comando la sustituye.
- Control en bucle cerrado a 50 Hz (20 ms por paso) con observaciones de 61 dimensiones y 14 salidas de acción.
- Autocontenida en un único ONNX: no requiere preprocesado externo de observaciones gracias al normalizador embebido.
- Integración con el daemon del robot mediante `robotctl` y el manifiesto de políticas en esquema 2 (carga en una ranura o *slot*).
- No soporta tool calling ni function calling: no es un modelo de lenguaje y no genera texto.
- No soporta agentes, razonamiento multi-paso ni capacidades multilingües.
- No se documenta procesamiento de visión, audio ni modo *thinking*; la política no declara entradas sensoriales más allá del vector de observación de 61 dimensiones, cuya composición no se detalla.

## Casos de uso

- Marcha por defecto del robot: cargar la política en una ranura con `sudo robotctl policy load <slot> hugging-tiger/microduck-baseline` para tener un comportamiento de desplazamiento funcional desde el primer arranque.
- Referencia base (*baseline*) en experimentos de RL: sirve como punto de comparación medible frente a políticas propias entrenadas en la misma tarea `Mjlab-Sprint2m-MicroDuck`.
- Validación del pipeline de despliegue: útil para verificar de extremo a extremo la cadena `robotctl` → ONNX → bucle de control a 50 Hz antes de probar políticas experimentales.
- Reproducción de entrenamientos: el comando documentado (`uv run train ... --env.scene.num-envs 4096 --agent.max-iterations 3000 --agent.seed 1`) permite repetir el experimento y comprobar la variabilidad entre ejecuciones.
- Docencia y divulgación en robótica con RL: ejemplo completo y abierto de sim-to-real con un robot de 399 USD, útil para explicar PPO, paralelización de entornos y exportación a ONNX.
- Pruebas de integración de la daemon: al ser una política perpetua y determinista en su interfaz, encaja en tests automatizados que necesitan un comportamiento que no termine por sí solo.
- Punto de partida para investigación en sim-to-real: permite aislar el efecto de cambios en sensórica o en el modelo físico del robot manteniendo fija la política de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, velocidad de marcha, tasa de caídas ni evaluación sim-to-real. Los únicos datos cuantitativos documentados son de configuración:

| Metrica documentada | Valor |
|---|---|
| Frecuencia del bucle de política | 50 Hz (20 ms por paso) |
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Entornos paralelos de entrenamiento | 4096 |
| Iteraciones máximas de entrenamiento | 3000 |
| Checkpoint publicado | 2999 |
| Semilla | 1 |

## Requisitos de hardware

- Inferencia: se ejecuta en el propio robot microduck dentro de su bucle de política a 50 Hz; no requiere GPU. El cómputo onboard concreto no está disponible.
- Presupuesto de latencia: 20 ms por paso de control como máximo para mantener los 50 Hz; la latencia real de inferencia del ONNX no se documenta.
- Entrenamiento: la configuración usa 4096 entornos paralelos en MuJoCo/mjlab, lo que exige hardware de altas prestaciones; el modelo de GPU o CPU empleado no está disponible.
- GPU de consumo: no aplica para inferencia (el robot no la necesita); para reentrenar, no disponible.
- Despliegue: `robotctl policy load <slot> <repo>` sobre el daemon de microduck y runtime ONNX. vLLM, llama.cpp, Ollama y TGI no aplican a este artefacto.
- Throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica otras políticas de locomoción para microduck (los medios citan siete movimientos preentrenados, pero sin nombres, identificadores ni especificaciones), ni políticas comparables de otros robots bípedos de tamaño similar con métricas publicadas. Sin datos de recompensa, velocidad o robustez no es posible establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita de uso comercial, modificación o redistribución; conviene contactar con el autor antes de integrarla en un producto.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en terceros.
- No reproducible bit a bit: el propio autor indica que el mismo comando y semilla producen pesos distintos en otra máquina, lo que complica la auditoría y la depuración.
- Desajuste aparente de dimensiones: la política declara 14 acciones mientras que las fuentes públicas describen el robot con 15 motores; la model card no explica qué articulación queda fuera ni cómo se mapea el vector de acción.
- Composición de la observación no documentada: se desconocen qué sensores (IMU, LiDAR, cámara, posición articular) entran en las 61 dimensiones, lo que limita el diagnóstico de fallos.
- Política perpetua: el comportamiento no termina por sí solo; requiere supervisión o un mecanismo externo de parada al probarla en hardware real.
- Riesgo de brecha sim-to-real: entrenada íntegramente en MuJoCo sin métricas publicadas de transferencia; el rendimiento en el robot físico no está cuantificado.
- Sin benchmarks ni ablaciones: no hay datos de robustez ante empujones, terrenos irregulares o desgaste de batería.
- Sin capacidades de lenguaje, visión ni tool calling: no debe evaluarse con los criterios habituales de un LLM.
- Sin información sobre sesgos: no aplica en el sentido habitual, pero tampoco se documenta el comportamiento de la política ante perturbaciones externas.

## Enlaces

- [HuggingFace: hugging-tiger/microduck-baseline](https://huggingface.co/hugging-tiger/microduck-baseline)
- [Repositorio de retos y entrenamiento: pollen-robotics/microduck-challenges](https://github.com/pollen-robotics/microduck-challenges.git)
- [Repositorio del robot: pollen-robotics/microduck](https://github.com/pollen-robotics/microduck)
- [Página oficial del robot en Pollen Robotics](https://pollen-robotics.com/microduck/)
- [MarkTechPost: Hugging Face unveils Microduck, un bípedo open source de 399 USD](https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/)
- [ExplainX: Microduck, el bípedo RL de 399 USD de Hugging Face](https://www.explainx.ai/blog/microduck-hugging-face-399-open-source-rl-robot-august-2026)
- [CNX Software: Microduck, un bípedo con forma de pato para experimentación en IA física](https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/)
- [Analytics Insight: el robot open source de 399 USD dirigido a desarrolladores de IA](https://www.analyticsinsight.net/news/hugging-face-unveils-microduck-usd-399-open-source-robot-targets-ai-developers)
