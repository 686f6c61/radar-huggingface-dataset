# GinDuck/microduck-gin-sock-s5

## Resumen

`microduck-gin-sock-s5` es una política de control motriz (policy) para el robot cuadrúpedo de código abierto **microduck** de Pollen Robotics, publicada por el usuario GinDuck en Hugging Face. No se trata de un modelo de lenguaje: es un modelo de aprendizaje por refuerzo exportado a ONNX que genera comandos de locomoción a 50 Hz a partir de observaciones de 61 dimensiones y produce 14 acciones de control. Su función es actuar como una "marcha" (gait) perpetua que puede cargarse en una ranura de política del demonio `robotctl` del robot.

El modelo se distribuye bajo la librería `microduck` y el pipeline `robotics`, con un tamaño de repositorio de 0.0 GB (lo que sugiere pesos muy ligeros, típicos de políticas de RL para robots de pequeño tamaño). La model card indica explícitamente que es una política **solo de simulación** ("Simulation only") y que las semillas 1 a 4 reproducen ejecuciones previas de otro autor (jrubiosainz, "Microduck Sock Heist - P1 s4"), mientras que la semilla 5 es una ejecución propia de GinDuck que sigue el movimiento de la semilla 2 desde el inicio, encontrada mediante búsqueda en la física del entorno Arena.

La relevancia de esta ficha es limitada para el público general de modelos de IA, pero es relevante para la comunidad de robótica de bajo coste y RL aplicado: muestra el flujo completo de entrenamiento (repo `pollen-robotics/microduck_rl`, rama `talent-3`, commit `debcfcae0`), exportación a ONNX con normalizador de observaciones integrado y despliegue en hardware real mediante `robotctl`. No hay información pública sobre arquitectura de red, número de parámetros ni datos de entrenamiento más allá de lo citado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; red neuronal no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del microduck policy manifest) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red neuronal. Se sabe que es una política de aprendizaje por refuerzo para el robot microduck, con un espacio de observación de 61 dimensiones y un espacio de acción de 14 dimensiones, ejecutada a 50 Hz. El modelo se exporta a ONNX con el normalizador de observaciones integrado en el propio grafo (`policy.onnx`), de modo que el consumidor debe alimentar observaciones en crudo. El manifiesto `manifest.json` sigue el esquema 2 del manifiesto de políticas de microduck (documentado en `docs/policy-manifest.md` del repositorio del demonio).

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `talent-3`, commit `debcfcae0`. Según la model card, las semillas 1 a 4 reproducen ejecuciones de jrubiosainz y las ejecuciones en las que se basa; la semilla 5 es una ejecución propia de GinDuck que sigue el movimiento de la semilla 2 desde el inicio, hallada mediante búsqueda en la física del entorno Arena. No se especifican número de tokens, composición del dataset, ni uso de RLHF/DPO (no aplica en RL de control). La política es "perpetua": se ejecuta de forma continua hasta que se le indique lo contrario.

## Capacidades

- Locomoción cuadrúpeda del robot microduck a 50 Hz, con observación de 61 dimensiones y 14 acciones de control.
- Política perpetua: mantiene la marcha de forma continua sin terminación implícita.
- Carga directa en una ranura de política del demonio `robotctl` del robot.
- Normalización de observaciones integrada en el ONNX: acepta observaciones en crudo.
- Solo simulación: no se declara validación en hardware real más allá del procedimiento de carga.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No se declaran capacidades de visión, audio ni modo "thinking".

## Casos de uso

- **Investigación en locomoción de bajo coste**: cargar la política en el microduck simulado para estudiar gaits perpetuas y comparar con las semillas 1 a 4 de jrubiosainz, usando la semilla 5 como referencia de búsqueda en la física de Arena.
- **Reproducibilidad de experimentos de RL**: el commit `debcfcae0` de la rama `talent-3` permite reconstruir el pipeline de entrenamiento y verificar la política exportada frente a la ejecución original.
- **Despliegue en robot físico como prueba de integración**: mediante `sudo robotctl policy load <slot> GinDuck/microduck-gin-sock-s5`, sirve para validar el flujo de carga de políticas en el demonio y el consumo de ONNX con normalizador integrado.
- **Evaluación de robustez de gaits**: al ser una política perpetua, es adecuada para pruebas de larga duración en simulación y para medir deriva o inestabilidad a lo largo del tiempo.
- **Base para fine-tuning o búsqueda de semillas**: la política puede servir como punto de partida para búsquedas en la física del entorno Arena, como ya se hizo para obtener la semilla 5 a partir de la semilla 2.
- **Docencia en robótica y RL**: ejemplo compacto de pipeline completo (entrenamiento en `microduck_rl`, exportación a ONNX, manifiesto schema 2, carga en robot) para cursos prácticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB, lo que sugiere un modelo muy ligero apto para CPU o GPU de gama baja.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, es plausible que se ejecute en CPU, pero no se confirma en la información proporcionada.
- ¿Cabe en GPU de consumo? No disponible con certeza; el tamaño del artefacto ONNX apunta a que sí, pero no se especifica.
- Opciones de despliegue: ONNX Runtime (formato `policy.onnx`) y el demonio `robotctl` del microduck mediante `policy load`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: la política se ejecuta a 50 Hz según la model card; no se publican cifras de latencia por inferencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acción | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GinDuck/microduck-gin-sock-s5 | Política RL (ONNX) para microduck | 61-D / 14 acciones | 50 Hz | no disponible | Hugging Face |
| jrubiosainz "Microduck Sock Heist - P1 s4" (referencia citada) | Política RL para microduck | no disponible | no disponible | no disponible | citada en la model card, sin enlace |
| Otras políticas de `pollen-robotics/microduck_rl` (rama `talent-3`) | Políticas RL para microduck | no disponible | no disponible | no disponible | repositorio de entrenamiento |

No se dispone de datos de rendimiento comparables entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- **Solo simulación**: la model card indica explícitamente "Simulation only"; no se declara validación en hardware real.
- **Licencia no disponible**: no se especifica licencia, lo que impide confirmar si el uso comercial está permitido. Verificar antes de cualquier uso en producción.
- **Idiomas no disponibles**: no aplica como modelo de lenguaje, pero el campo aparece como no disponible en los metadatos.
- **Arquitectura y parámetros desconocidos**: no se puede evaluar coste computacional ni complejidad de la red a partir de la información pública.
- **Riesgo de alucinación**: no aplica en el sentido de modelos generativos de texto; el riesgo equivalente es la degradación de la marcha o comportamiento inesperado fuera del dominio de simulación.
- **Dependencia de la semilla y del entorno Arena**: el comportamiento está fuertemente ligado a la física del simulador y a la semilla 5; la transferencia a otro entorno no está garantizada.
- **Sin benchmarks ni métricas**: no hay datos de rendimiento que permitan comparar objetivamente con alternativas.
- **Repositorio de 0.0 GB**: conviene verificar la integridad de los artefactos (`policy.onnx`, `manifest.json`) antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/GinDuck/microduck-gin-sock-s5
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `talent-3`, commit `debcfcae0`) — sin URL directa en la información proporcionada
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio (sin URL directa en la información proporcionada)
- Ejecución de referencia citada: jrubiosainz "Microduck Sock Heist - P1 s4 1f0fc5ae" — sin URL en la información proporcionada
