# dadudu/microduck-bubu-tug-remix3

## Resumen

`dadudu/microduck-bubu-tug-remix3` es una política de control robótico (no un modelo de lenguaje) desarrollada por el usuario dadudu como *remix* o *fine-tune* de `rumezhak/microduck-tug-rating-remix`. Está pensada para el robot cuadrúpedo de bajo coste microduck, mantenido por Pollen Robotics, y se publica como un fichero ONNX que se carga directamente en el demonio de control del robot mediante el comando `robotctl policy load walk`. El modelo ocupa el *slot* de marcha (`walk`) del robot, es decir, define la política de locomoción que se ejecuta de forma continua.

El modelo se enmarca en el pipeline `robotics` de HuggingFace y se distribuye a través de la librería `microduck`. La política opera a 50 Hz, recibe observaciones de 61 dimensiones y emite 14 acciones de control. Es una política *perpetua*: se ejecuta de forma indefinida hasta que se le indique lo contrario, sin un horizonte de episodio fijo. El repositorio tiene un tamaño de 0.0 GB (probablemente por metadatos incompletos o un artefacto muy ligero), sin descargas ni *likes* en el momento de la consulta.

La relevancia de esta ficha es acotada: se trata de un artefacto muy específico dentro del ecosistema microduck, no de un modelo de propósito general. No hay información pública sobre benchmarks, licencia, idiomas ni composición del dataset de entrenamiento. El valor práctico está en su integración directa con el robot y en la trazabilidad del *fine-tune* respecto al modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de reinforcement learning exportada a ONNX) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada de 61-D por paso) |
| Tipos de cuantización | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no aplica (modelo robótico, sin interfaz de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), con `manifest.json` en esquema 2 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red. Se sabe que es una política de reinforcement learning para control de locomoción, con observaciones de 61 dimensiones, 14 acciones y frecuencia de control de 50 Hz. El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que la política consume observaciones en bruto sin preprocesado externo. El manifiesto `manifest.json` sigue el esquema 2 del *policy manifest* de microduck, documentado en `docs/policy-manifest.md` del repositorio del demonio.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `a3e0c0fbe`. El modelo es un *fine-tune* de `rumezhak/microduck-tug-rating-remix` en el contexto de la "Tug of War Arena", una competición o entorno de evaluación de políticas de microduck. El autor cita como créditos a rumezhak, jrubiosainz, a1rb4Ck y Pollen Robotics. No se especifican el número de pasos de entrenamiento, la composición del dataset, ni si se usaron técnicas como RLHF, DPO o currículos de recompensa; todo ello debe considerarse no disponible.

## Capacidades

- Locomoción continua del robot microduck mediante una política *perpetua* que se ejecuta hasta recibir una orden de parada.
- Control a 50 Hz con observaciones de 61 dimensiones y 14 acciones, adecuado para el bucle de control de bajo nivel del robot.
- Integración directa con el demonio de microduck mediante `robotctl policy load walk`.
- Consumo de observaciones en bruto gracias al normalizador embebido en el ONNX.
- Ocupación del *slot* `walk`, lo que permite combinarla con otras políticas en otros *slots* del robot.
- No soporta *tool calling*, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es una política de control motor, no un modelo generativo.

## Casos de uso

- **Locomoción autónoma en el microduck**: cargar la política en el *slot* `walk` para que el robot camine de forma continua en pruebas de laboratorio, aprovechando que la política es perpetua y no requiere reinicio por episodio.
- **Evaluación comparativa en la Tug of War Arena**: usar esta política como participante en el entorno de competición para medir su resistencia y comportamiento frente a otras políticas del mismo *slot*.
- **Base para nuevos *fine-tunes***: servir como punto de partida para que otros autores entrenen variantes sobre `microduck-bubu-tug-remix3`, dado que el propio modelo es un *fine-tune* de `rumezhak/microduck-tug-rating-remix`.
- **Pruebas de integración del demonio `robotctl`**: validar el flujo `policy load` y el manifiesto en esquema 2 en un robot real o en simulación, usando un artefacto ONNX ligero.
- **Docencia e investigación en RL aplicado a robótica**: emplear la política como ejemplo reproducible de un *pipeline* completo desde `microduck_rl` hasta el despliegue en hardware de bajo coste.
- **Prototipado de comportamientos de marcha**: combinar esta política con políticas de otros *slots* (por ejemplo, percepción o manipulación) para construir comportamientos compuestos en el microduck.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasa de éxito, distancia recorrida ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Al ser una política pequeña exportada a ONNX y con un repositorio de 0.0 GB, es probable que quepa en CPU, pero no hay datos confirmados.
- **GPU recomendadas**: no disponible. El despliegue típico es en el propio robot microduck, no en un servidor con GPU.
- **¿Cabe en GPU de consumo?**: previsiblemente sí, dado el tamaño reducido del artefacto, pero no se confirma en la información proporcionada.
- **Opciones de despliegue**: `robotctl policy load walk dadudu/microduck-bubu-tug-remix3` sobre el demonio de microduck; el runtime ONNX subyacente no se detalla.
- **Latencia y throughput**: no disponibles. La frecuencia de control es de 50 Hz, lo que implica un presupuesto de 20 ms por paso, pero no se publican medidas reales.

## Comparativa con modelos similares

| Modelo | Tipo | Slot | Base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dadudu/microduck-bubu-tug-remix3` | Política RL (ONNX) | `walk` | `rumezhak/microduck-tug-rating-remix` | no disponible | HuggingFace |
| `rumezhak/microduck-tug-rating-remix` | Política RL | no disponible | no disponible | no disponible | HuggingFace |
| Otras políticas microduck | Política RL | variable | variable | variable | HuggingFace / `pollen-robotics/microduck_rl` |

No se dispone de datos de rendimiento comparativo entre estas políticas. La comparación se limita a la relación de *fine-tune* y a la disponibilidad pública.

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica licencia, lo que impide confirmar si el uso comercial está permitido. Conviene contactar con el autor antes de usarlo en producción.
- **Artefacto sin tracción**: cero descargas y cero *likes* en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- **Información técnica incompleta**: no se detallan arquitectura, número de parámetros, dataset ni métricas de entrenamiento.
- **Riesgo de comportamiento impredecible**: al ser una política de RL entrenada en un entorno concreto (Tug of War Arena), su comportamiento fuera de ese dominio no está caracterizado.
- **Dependencia del ecosistema microduck**: solo es utilizable con el demonio `robotctl` y el manifiesto en esquema 2; no es portable a otros robots sin adaptación.
- **Sin soporte de lenguaje ni visión**: no debe evaluarse como un modelo de IA generativa; las expectativas deben limitarse al control motor.
- **Fecha de creación futura**: el repositorio figura creado el 2026-11-02, lo que puede indicar metadatos erróneos o un artefacto de prueba.

## Enlaces

- [HuggingFace: dadudu/microduck-bubu-tug-remix3](https://huggingface.co/dadudu/microduck-bubu-tug-remix3)
- [Modelo base: rumezhak/microduck-tug-rating-remix](https://huggingface.co/rumezhak/microduck-tug-rating-remix)
- [Repositorio microduck (Pollen Robotics)](https://github.com/pollen-robotics/microduck)
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl`, rama `main`, commit `a3e0c0fbe` (no se proporciona URL directa)
- Documentación del manifiesto: `docs/policy-manifest.md` en el repositorio del demonio (no se proporciona URL directa)
