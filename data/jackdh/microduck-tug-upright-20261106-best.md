# JackDH/microduck-tug-upright-20261106-best

## Resumen

`microduck-tug-upright-20261106-best` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es un checkpoint de política (policy) exportado a ONNX que se carga en un slot de política del daemon `robotctl` del robot y se ejecuta a 50 Hz como comportamiento perpetuo (sin condición de terminación). Resuelve el problema de generar una marcha estable capaz de competir en la tarea de "tug of war" (tirar de una cuerda) manteniéndose erguido.

El autor, JackDH (JackDanHollister), entrena la política con el framework mjlab sobre el entorno `Mjlab-TugOfWar-MicroDuck`, con 4096 entornos paralelos y 250 iteraciones de checkpoint de un total de 1000 configuradas. El modelo observa un vector de 61 dimensiones y emite 14 acciones de control articular a 50 Hz. La información publicada es muy limitada: no hay datos de benchmarks estándar, ni licencia declarada, ni idiomas (no aplica).

Es relevante en el nicho de robótica open source de bajo coste: demuestra un flujo completo de entrenamiento RL en simulación (mjlab/MuJoCo) y despliegue en hardware real mediante un formato de manifiesto propio, aunque con la advertencia explícita de que el resultado es solo de simulación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control entrenada por RL (no disponible el detalle de la red; exportada a ONNX) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (exportación ONNX; normalizador de observaciones embebido en `policy.onnx`) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en simulación usando mjlab (basado en MuJoCo), sobre la tarea `Mjlab-TugOfWar-MicroDuck`. La configuración de entrenamiento usa 4096 entornos paralelos, semilla 1, hasta 1000 iteraciones de agente, con registro en TensorBoard; el checkpoint publicado es el 250. La base es `mjlab-microduck 0.1.0 @ 1efd853be` y el código del entorno vive en el repositorio `microduck-challenges` (commit `c0a75ceff`, rama `main`).

La política es "perpetua": no tiene condición de terminación y se ejecuta como una marcha continua cargada en un slot de política. La observación es un vector de 61 dimensiones y la acción un vector de 14 dimensiones, a 50 Hz. El normalizador de observaciones está embebido dentro de `policy.onnx`, por lo que se alimentan observaciones en crudo. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: misma semilla y código producen una política comparable, no idéntica. Los pesos de recompensa usados fueron Win ground = 2.625 y Stay upright = 2.0. Según la model card, el checkpoint 250 ganó las cinco contiendas locales de referencia por "pit", con una media de +142.117 cm.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck a 50 Hz mediante política perpetua.
- Tarea de tug of war: tirar de una cuerda manteniendo la postura erguida.
- Entrada: observación de 61 dimensiones (cruda; normalización interna en el ONNX).
- Salida: 14 acciones de control articular.
- Carga directa en el robot mediante `robotctl policy load <slot> ...`.
- No soporta tool calling, agentes, multilingüismo ni modalidades de texto/visión/audio: es una política de control, no un modelo generativo.
- Ejecución solo validada en simulación según la model card.

## Casos de uso

- Competición de tug of war en simulación: cargar la política en un slot y enfrentarla a otras políticas de referencia para evaluar tirones y estabilidad postural; el autor reporta +142.117 cm de media en cinco contiendas locales.
- Base para fine-tuning o comparación de recompensas: sirve como punto de partida para experimentar con los pesos Win ground y Stay upright y medir el efecto en la marcha.
- Validación de pipelines de entrenamiento RL: reproduciendo el comando documentado (4096 entornos, semilla 1) se obtiene una política comparable, útil para verificar la infraestructura mjlab.
- Pruebas de despliegue en hardware microduck: cargar la política vía `robotctl` para comprobar el flujo de manifiesto schema 2 y la integración del normalizador embebido en ONNX.
- Estudio de políticas perpetuas: analizar el comportamiento de una marcha sin condición de terminación en entornos simulados de duración arbitraria.
- Referencia docente en robótica de bajo coste: ejemplo completo de entrenamiento en simulación y exportación a ONNX para un cuadrúpedo económico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es cualitativo y de simulación: el checkpoint 250 ganó las cinco contiendas locales de referencia por "pit", con una media de +142.117 cm.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y la política se ejecuta a 50 Hz sobre observaciones de 61 dimensiones, lo que sugiere un coste de cómputo muy bajo, pero no se publican cifras.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No disponible; por la naturaleza del modelo (política de control pequeña en ONNX) es plausible que sí, pero no hay confirmación en la información proporcionada.
- Opciones de despliegue: runtime ONNX y el daemon `robotctl` del microduck (`sudo robotctl policy load <slot> JackDH/microduck-tug-upright-20261106-best`). No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles; la política opera a 50 Hz por diseño.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-tug-upright-20261106-best | Política RL para microduck | no disponible | no aplica | +142.117 cm de media en 5 contiendas locales (simulación) | no disponible | Hugging Face |
| Otras políticas microduck | no disponible | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de información sobre políticas comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Validada únicamente en simulación; el autor indica explícitamente "Simulation only", por lo que el comportamiento en hardware real no está garantizado.
- Licencia no declarada: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Entrenamiento no bit-reproducible: repetir con la misma semilla produce una política comparable, no idéntica.
- Checkpoint 250 de 1000 iteraciones configuradas: puede no ser el óptimo de la curva de entrenamiento.
- Sin datos de sesgos, alucinación ni idioma (no aplican a una política de control), pero tampoco hay evaluación de robustez ante perturbaciones, terreno variable o fallos de hardware.
- Dependencia del ecosistema microduck (`robotctl`, manifiesto schema 2) y de mjlab para reproducir el entrenamiento.
- Métricas de rendimiento limitadas a cinco contiendas locales de referencia; no hay evaluación estandarizada ni comparativa pública.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JackDH/microduck-tug-upright-20261106-best
- Repositorio de retos y entrenamiento: https://github.com/JackDanHollister/microduck-challenges
- Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (enlace directo no disponible)
