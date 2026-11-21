# dashi/microduck-roller-daily-20261120

## Resumen

`dashi/microduck-roller-daily-20261120` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es una política neuronal que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, exportada en formato ONNX para su ejecución directa en el robot. El modelo se publica como una "reentrada diaria" de la política `dashi/microduck-roller-remix-r900` (con puntuación 0.900), y está afinado a partir del modelo base `DenRakEiw/microduck-senate_duck_0904`.

La política está diseñada para operar sobre ruedas (rollers) y se registra en el slot de marcha (`walk`) del daemon de control del robot. Su naturaleza es "perpetua": ejecuta una marcha continua hasta que se le indique lo contrario. El repositorio tiene un tamaño de 0.0 GB, sin descargas ni likes en el momento de la consulta, y no se dispone de información sobre licencia ni idiomas, lo que refleja que se trata de un artefacto técnico de nicho dentro del ecosistema de robótica open source.

La relevancia de esta ficha es limitada fuera del ámbito de la robótica de bajo coste: se trata de un checkpoint de investigación con metadatos mínimos, sin benchmarks publicados ni documentación sobre el proceso de entrenamiento más allá de la rama y el commit del repositorio de RL utilizado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal de RL, exportada a ONNX) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (formato ONNX) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la red neuronal subyacente. Se sabe que es una política de aprendizaje por refuerzo que consume observaciones de 61 dimensiones y produce 14 acciones a 50 Hz, con un normalizador de observaciones integrado directamente en el archivo `policy.onnx` (por lo que se alimenta con observaciones en bruto). El modelo se distribuye como finetune del checkpoint `DenRakEiw/microduck-senate_duck_0904`.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward`, commit `83599404a`. No se especifican el número de pasos de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO (no aplicables en este contexto). La política es una reentrada diaria de `dashi/microduck-roller-remix-r900` con una puntuación de 0.900, lo que sugiere un proceso de iteración y selección de checkpoints basado en una métrica de rendimiento no documentada en la información proporcionada.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck sobre ruedas (rollers).
- Ejecución de una marcha continua y perpetua en el slot `walk` hasta recibir una orden de parada.
- Mapeo directo de observaciones de 61 dimensiones a 14 acciones de control a 50 Hz.
- Normalización de observaciones integrada en el modelo ONNX, lo que simplifica la integración con el daemon del robot.
- Carga mediante el comando `robotctl policy load walk dashi/microduck-roller-daily-20261120`.
- Compatibilidad con el esquema 2 del manifiesto de políticas de microduck (`manifest.json`).
- No se dispone de información sobre capacidades de tool calling, agentes, multilingüismo, visión, audio o modos de razonamiento (no aplicables a una política de control).

## Casos de uso

- Locomoción autónoma en interiores: la política permite que el microduck se desplace de forma continua sobre superficies con rollers, adecuada para demostraciones de robótica de bajo coste en ferias y aulas.
- Investigación en aprendizaje por refuerzo: sirve como checkpoint de referencia para comparar estrategias de entrenamiento en la rama `roll-backward` del repositorio `microduck_rl`.
- Base para finetuning: al ser un finetune de `DenRakEiw/microduck-senate_duck_0904`, puede reutilizarse como punto de partida para nuevas políticas de marcha o para adaptar el comportamiento a otras superficies.
- Docencia en robótica: su integración mediante un único comando (`robotctl policy load`) y el formato ONNX facilitan su uso en prácticas de control y RL sin necesidad de infraestructura de GPU.
- Pruebas de integración del daemon: útil para validar el pipeline de carga de políticas, el esquema 2 del manifiesto y la normalización de observaciones en el daemon de Pollen Robotics.
- Demostraciones de gait continua: al ser una política "perpetua", encaja en escenarios donde se requiere una marcha estable sin intervención, como vídeos de demostración o entornos de prueba de larga duración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento mencionado es la puntuación 0.900 de la política original `dashi/microduck-roller-remix-r900`, de la que esta es una reentrada diaria, pero no se especifica la métrica ni el protocolo de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de control exportada a ONNX, es probable que quepa en CPU, pero no se confirma en la información.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ejecución en el propio robot mediante el daemon de microduck (`robotctl`), cargando `policy.onnx` con el runtime ONNX integrado; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: no disponibles; la política opera a 50 Hz según la model card, pero no se detallan tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Slot | Formato | Licencia | Descargas |
|---|---|---|---|---|---|---|
| `dashi/microduck-roller-daily-20261120` | Política RL | `DenRakEiw/microduck-senate_duck_0904` | `walk` | ONNX | no disponible | 0 |
| `dashi/microduck-roller-remix-r900` | Política RL | no disponible | no disponible | no disponible | no disponible | no disponible |
| `DenRakEiw/microduck-senate_duck_0904` | Política RL (base) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de parámetros, contexto ni rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se dispone de información sobre la licencia, lo que impide confirmar si su uso comercial está permitido.
- El repositorio no contiene descargas ni likes, y su tamaño es de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o que el artefacto es mínimo.
- La política está diseñada específicamente para el robot microduck sobre rollers; no es transferible a otros robots sin reentrenamiento.
- El comportamiento es "perpetuo" hasta que se le indique lo contrario, lo que requiere mecanismos externos de parada segura en producción.
- No hay documentación sobre sesgos, alucinaciones o limitaciones de contexto (no aplicables a una política de control), pero tampoco sobre robustez ante condiciones fuera de distribución.
- La métrica 0.900 de la política original no está definida, por lo que no puede interpretarse como una medida de calidad objetiva.
- La información de entrenamiento es mínima (rama y commit), lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-roller-daily-20261120
- Modelo base: https://huggingface.co/DenRakEiw/microduck-senate_duck_0904
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
