# RSanchez996/microduck-sock-heist-fusion-v1

## Resumen

sock-heist-fusion-v1 es una política de control robótico para el robot cuadrúpedo microduck, desarrollado por Pollen Robotics. El modelo lo publica el usuario RSanchez996 como un fine-tuning (remix) de HlibPlakhtii/microduck-sock-heist-quicksilver-v2. No es un modelo de lenguaje: es una política de aprendizaje por refuerzo que mapea observaciones del robot (61 dimensiones) a acciones de control (14 dimensiones) a una frecuencia de 50 Hz.

La política está empaquetada en formato ONNX (`policy.onnx`) e incluye el normalizador de observaciones integrado en el propio grafo, de modo que el consumidor debe alimentar observaciones en crudo. Se distribuye junto a un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck, lo que permite cargarla directamente en el daemon del robot mediante el comando `robotctl policy load`.

El modelo se presenta como una política «perpetua»: ejecuta una marcha (gait) de forma continua hasta recibir una orden de parada, y se carga en una ranura (slot) de política del robot. Su relevancia es acotada y experimental: repositorio de 0,0 GB, sin descargas ni interacciones en el momento de la consulta, licencia no especificada y sin información sobre datos de entrenamiento más allá de la rama y el commit del repositorio de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (arquitectura de red no detallada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna de la red en la información disponible. Se sabe que es una política de control entrenada con aprendizaje por refuerzo para el robot microduck, con un espacio de observación de 61 dimensiones y un espacio de acción de 14 dimensiones, operando a 50 Hz. La política se exporta a ONNX e incorpora el normalizador de observaciones dentro del propio modelo, por lo que la entrada debe ser la observación en crudo.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `exp_sock_heist_speed_v3`, commit `876fefacd`. No se especifican el número de pasos de entrenamiento, la composición del dataset, la función de recompensa ni si se aplicaron técnicas de ajuste adicionales. El modelo es un fine-tuning del checkpoint HlibPlakhtii/microduck-sock-heist-quicksilver-v2, según los metadatos de la model card.

## Capacidades

- Control locomotor del robot microduck mediante una marcha (gait) continua a 50 Hz.
- Política «perpetua»: mantiene la marcha hasta recibir una orden de parada.
- Consumo de observaciones de 61 dimensiones y emisión de 14 acciones de control.
- Normalización de observaciones integrada en el modelo ONNX (entrada en crudo).
- Carga directa en el daemon del robot mediante `robotctl policy load <slot>`.
- Compatibilidad con el esquema 2 del manifiesto de políticas de microduck.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni multilingüismo.

## Casos de uso

- Locomoción autónoma en el robot microduck: la política se carga en una ranura del daemon y ejecuta una marcha continua, adecuada para desplazamientos sostenidos en entornos controlados.
- Investigación en aprendizaje por refuerzo aplicado a robótica: sirve como punto de partida para comparar marchas y realizar fine-tunings sobre el checkpoint base quicksilver-v2.
- Pruebas de integración del pipeline `robotctl`: permite validar la carga de políticas, el esquema 2 del manifiesto y la inferencia ONNX en el robot real.
- Experimentación con remixes de políticas: al ser un fine-tuning documentado con rama y commit, facilita reproducir y extender el entrenamiento en `microduck_rl`.
- Demostraciones de control a 50 Hz: útil para evaluar latencia y estabilidad de la inferencia ONNX en el hardware del microduck.
- Docencia y prototipado rápido: al requerir solo un comando de carga y observaciones en crudo, simplifica el despliegue de una política funcional en el robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un modelo muy pequeño, pero no se confirma.
- GPU recomendadas: no disponible; el modelo está pensado para ejecutarse en el propio robot microduck, no en servidores GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime (formato `policy.onnx`) y el daemon de microduck mediante `robotctl policy load`.
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms por paso), pero no se publican mediciones de latencia reales.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RSanchez996/microduck-sock-heist-fusion-v1 | Política RL (ONNX) | 61 / 14 | 50 Hz | no disponible | HuggingFace |
| HlibPlakhtii/microduck-sock-heist-quicksilver-v2 | Política RL (modelo base) | no disponible | no disponible | no disponible | HuggingFace |
| Otras políticas de microduck | Política RL | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código y no procesa visión ni audio.
- No se especifica la licencia, por lo que el uso comercial queda sin garantías legales.
- No hay información sobre sesgos, alucinación ni limitaciones idiomáticas aplicables, al no tratarse de un modelo generativo de texto.
- El modelo está diseñado exclusivamente para el robot microduck; no es portable a otras plataformas sin reentrenamiento.
- No se documentan los datos de entrenamiento ni la función de recompensa, lo que dificulta evaluar la robustez de la marcha.
- Repositorio sin descargas ni interacciones: no hay evidencia de validación por parte de la comunidad.
- El rendimiento en el robot real no está cuantificado; la estabilidad de la marcha en distintos terrenos es desconocida.
- La fecha de creación indicada (2026-11-05) es futura respecto a la consulta, lo que conviene verificar antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RSanchez996/microduck-sock-heist-fusion-v1
- Modelo base: https://huggingface.co/HlibPlakhtii/microduck-sock-heist-quicksilver-v2
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `exp_sock_heist_speed_v3`, commit `876fefacd`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
