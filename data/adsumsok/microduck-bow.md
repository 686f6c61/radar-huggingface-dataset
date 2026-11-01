# AdsumSOK/microduck-bow

## Resumen

microduck-bow es una política de control por refuerzo (reinforcement learning) entrenada para el robot bípedo Microduck de Pollen Robotics. No es un modelo de lenguaje ni un sistema generativo de texto: es una política episódica y dirigida por fase que ejecuta un único gesto coreografiado, una reverencia, sobre el hardware real o en simulación. El autor es AdsumSOK y el modelo se publica bajo licencia Apache 2.0 con pesos en formato ONNX.

El modelo resuelve un problema acotado y concreto: dotar al Microduck de un gesto expresivo (inclinación del tronco, descenso del pico hasta 2 cm del suelo sin tocarlo, giro de cabeza de 83° a la izquierda y retorno, flexión de rodillas y recuperación de la postura erguida) con garantías de estabilidad. La política se entrenó con el framework `pollen-robotics/microduck_rl` sobre una tarea personalizada denominada `Mjlab-Bow-Flat-MicroDuck`.

Su relevancia es práctica para quien trabaja con robótica de bajo coste y simulación física: demuestra un flujo completo de entrenamiento con MuJoCo Warp (mjlab), exportación a ONNX con normalizador de observaciones embebido y despliegue en el daemon del robot mediante `robotctl`. El repositorio es de tamaño despreciable (0.0 GB) y acumula 33 descargas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning dirigida por fase (phase-encoded), exportada como grafo ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (exportación ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en (etiqueta del repositorio; sin relevancia lingüística al ser una política motora) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (el grafo embebe el normalizador de observaciones; no se incluye el checkpoint de entrenamiento) |

## Arquitectura y entrenamiento

La política se entrena con `pollen-robotics/microduck_rl` sobre la tarea `Mjlab-Bow-Flat-MicroDuck`, en el simulador mjlab (MuJoCo Warp) con el modelo de actuadores BAM (BAM XL330 en la evaluación). El control es episódico y dirigido por fase: el daemon del robot avanza una variable de fase φ con el periodo configurado y devuelve el control al sistema oficial en φ = 0.7. El ciclo completo dura 10 s y el gesto ocupa los primeros 6.1 s, de modo que con `ground_pick_period = 10.0` la devolución del control ocurre a los 7 s, ya iniciada la subida.

El checkpoint publicado es `model_499.pt` de la ejecución `v8_hover_sym` (500 iteraciones, con warm start desde la versión anterior). La línea de versiones documentada es: v1 → v2 (límite de fuerza, pies estrictos, objetivo de descenso deslizante) → v4 (banda de fuerza de contacto) → v5 (sin segundo contacto) → v6 (flexión de rodillas) → v7 (periodo de 10 s para el corte en 0.7 del daemon) → v8 (sin contacto y piernas simétricas). La exportación se realizó con `scripts/export.py`, que incorpora el normalizador de observaciones dentro del grafo ONNX; el checkpoint de entrenamiento no se distribuye.

## Capacidades

- Ejecución de un gesto episódico de reverencia: descenso del pico hasta 2 cm sobre el suelo, giro de cabeza de 83° a la izquierda y retorno, flexión de rodillas de 62°/61° y recuperación de la postura erguida.
- Control dirigido por fase con devolución del control al sistema en φ = 0.7, integrable en el slot `ground_pick` del daemon del robot.
- Simetría de piernas durante el descenso: error de espejo medio de 1.2°.
- Estabilidad verificada en simulación: 0 % de caídas en 256 entornos × 20 s.
- Sin capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes. Es exclusivamente una política motora.
- No admite codificaciones no constantes distintas de `phase`: `policy add` rechaza su carga como skill.

## Casos de uso

- Demostración de expresividad robótica: cargar la política en el slot `ground_pick` con `sudo robotctl policy load ground_pick <user>/microduck-bow` para que el botón de recogida del suelo active la reverencia en lugar del gesto oficial.
- Prueba de extremo a extremo del pipeline de RL a hardware: sirve como referencia reproducible para validar entrenamiento en mjlab, exportación a ONNX con normalizador embebido y despliegue vía `robotctl`.
- Rehearsal en simulación antes de tocar el robot: ejecutar `scripts/infer_policy.py` con las políticas oficiales de caminar y estar de pie (`alpha_walking.onnx`, `alpha_stand.onnx`) y `--ground-pick-period 10.0 --ground-pick-end-phase 0.7 --new-cmd-obs` para ensayar el ciclo completo sin riesgo físico.
- Base para entrenar variantes de gestos: la tarea `Mjlab-Bow-Flat-MicroDuck` y la cadena de versiones v1–v8 documentan cómo iterar sobre restricciones de contacto, simetría y temporización.
- Validación de control de contacto seguro: útil para estudiar políticas que acercan un efector (el pico) a una superficie sin tocarla, con fuerza de contacto cabeza/suelo ≤ 0.16 N y altura mínima de 1.8 cm.
- Docencia e investigación en robótica bípeda de bajo coste: ejemplo compacto de política episódica con métricas de evaluación claras (caídas, simetría, ángulos articulares) sobre el Microduck de Pollen Robotics.

## Benchmarks y rendimiento

Evaluación en simulación headless, 256 entornos × 20 s, sin empujes (mjlab 1.3.0, modelo de actuador BAM XL330):

| Métrica | Valor |
|---|---|
| Caídas | 0 % |
| Contacto del pico con el suelo | ninguno (altura mínima 1.8 cm, fuerza cabeza/suelo ≤ 0.16 N) |
| Hover limpio (pico nunca por debajo de 1.5 cm, sin fuerza de contacto) | 90 % de los ciclos |
| Simetría pierna izquierda/derecha durante el descenso | 1.2° de error de espejo medio |
| Giro de cabeza alcanzado | 83° |
| Flexión de rodillas antes de la subida | 62° / 61° |
| Inclinación del tronco en el punto más bajo | 33° |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y el grafo ONNX es de tamaño reducido, por lo que la inferencia es viable en CPU.
- GPU recomendadas: no se especifican; el entrenamiento se realizó en mjlab / MuJoCo Warp, que requiere GPU compatible con Warp, pero no se detalla el hardware empleado.
- Cabe en GPU consumer: previsiblemente sí para inferencia dado el tamaño del artefacto, aunque no se documenta.
- Opciones de despliegue: ONNX Runtime en el propio robot mediante el daemon (`robotctl policy load`), y simulación con `scripts/infer_policy.py` bajo `uv run`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| microduck-bow | Política RL episódica (ONNX) para Microduck | no aplica | Apache 2.0 | HuggingFace |
| pollen-robotics/microduck-policies | Políticas oficiales de caminar y estar de pie | no aplica | no disponible | HuggingFace |
| pollen-robotics/microduck_rl | Framework de entrenamiento RL | no aplica | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparables entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no programa y no procesa imágenes ni audio.
- Solo admite codificación `phase`; `policy add` rechaza encodings no constantes, por lo que debe cargarse en el slot `ground_pick`.
- La devolución del control en φ = 0.7 no es configurable; el periodo debe fijarse en `robotd.toml` (`ground_pick_period = 10.0`) para que el hand-back caiga a los 7 s, tras la subida.
- Las métricas proceden exclusivamente de simulación (mjlab, BAM XL330); no se documenta validación en hardware real.
- El checkpoint de entrenamiento (`model_499.pt`) no se incluye, solo el grafo ONNX exportado, lo que limita el reentrenamiento directo.
- Riesgo de alucinación y sesgos lingüísticos: no aplica por la naturaleza del modelo.
- Licencia Apache 2.0: permite uso comercial con atribución y conservación del aviso de licencia; no se documentan restricciones adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/AdsumSOK/microduck-bow
- Framework de entrenamiento: https://huggingface.co/pollen-robotics/microduck_rl
- Políticas oficiales: https://huggingface.co/pollen-robotics/microduck-policies
- Simulador mjlab (MuJoCo Warp): no disponible enlace directo en la información proporcionada
