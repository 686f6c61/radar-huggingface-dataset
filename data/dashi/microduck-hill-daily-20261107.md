# dashi/microduck-hill-daily-20261107

## Resumen

`dashi/microduck-hill-daily-20261107` es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es un policy de robótica que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, empaquetado en formato ONNX y destinado a ejecutarse en el robot real mediante el daemon `robotctl`. El autor del checkpoint es el usuario de Hugging Face `dashi`, y el modelo es un fine-tune del policy `jrubiosainz/microduck-game-hillclimber-remix6`.

La relevancia de esta ficha es acotada: se trata de un reentrenamiento diario ("daily re-entry") del policy `dashi/microduck-hill-remix-r752`, que obtuvo una puntuación de 0,749. El modelo ocupa el slot de marcha (`walk`) del robot y se describe como una política "perpetua", es decir, que camina de forma continua hasta que se le ordena detenerse. No hay información pública sobre arquitectura de red, número de parámetros ni composición del dataset de entrenamiento.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamaño de 0,0 GB (probablemente artefactos pequeños, dado que el ONNX contiene una política compacta) y no declara licencia ni idiomas. Es, por tanto, un artefacto de experimentación dentro del ecosistema microduck más que un modelo listo para producción general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL empaquetada en ONNX; red interna no documentada) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible (exportación ONNX; normalizador de observaciones integrado) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red neuronal. Se sabe que la política se entrena con el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward`, commit `83599404a`, mediante aprendizaje por refuerzo. El modelo base es `jrubiosainz/microduck-game-hillclimber-remix6`, del que este checkpoint es un fine-tune, y a su vez deriva de `dashi/microduck-hill-remix-r752` (puntuación 0,749). El pipeline declarado es `robotics` y la librería `microduck`.

La interfaz de la política está bien definida: observación de 61 dimensiones, 14 acciones, frecuencia de control de 50 Hz. El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto sin preprocesar. El manifiesto sigue el esquema 2 documentado en `docs/policy-manifest.md` del repositorio del daemon. No se especifican número de tokens, composición del dataset, ni uso de RLHF/DPO (no aplica a un policy de control).

## Capacidades

- Control locomotor de marcha (`walk`) para el robot microduck: genera comandos de 14 acciones a partir de observaciones de 61 dimensiones a 50 Hz.
- Política "perpetua": mantiene la marcha de forma continua hasta recibir una orden de parada.
- Ejecución en robot real mediante `robotctl policy load walk <repo>`.
- Inferencia ONNX con normalización de observaciones integrada, lo que simplifica el despliegue.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de capacidades multilingües, visión, audio ni modo "thinking".
- Compatible con el ecosistema de políticas microduck (manifiesto schema 2).

## Casos de uso

- Locomoción continua en el robot microduck: cargar la política en el slot `walk` con `robotctl policy load walk dashi/microduck-hill-daily-20261107` para que el robot camine de forma sostenida en pruebas de laboratorio.
- Investigación en aprendizaje por refuerzo: servir como punto de partida (fine-tune) para experimentos de marcha sobre el policy base `jrubiosainz/microduck-game-hillclimber-remix6`.
- Evaluación comparativa de políticas: al ser un "daily re-entry" con puntuación de referencia (0,749), permite comparar variantes diarias del mismo linaje en tareas de locomoción.
- Docencia y prototipado en robótica de bajo coste: el microduck es una plataforma abierta y esta política ONNX se integra en el daemon estándar sin infraestructura adicional.
- Pruebas de despliegue ONNX en hardware embebido: validar la latencia y estabilidad de una política de 50 Hz con normalizador embebido en un robot real.
- Reproducción de experimentos de RL: el repositorio `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`) permite reconstruir el pipeline de entrenamiento y verificar la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es la puntuación de referencia del modelo del que deriva (`dashi/microduck-hill-remix-r752`, 0,749), pero no se especifica la métrica ni el entorno de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,0 GB) y el formato ONNX, se trata de una red compacta que probablemente se ejecuta en CPU o en el propio hardware del robot.
- GPU recomendadas: no disponible; no se requiere GPU de datacenter para una política de control de este tipo.
- ¿Cabe en GPU de consumo? No disponible; previsiblemente sí, dado el tamaño reducido del artefacto.
- Opciones de despliegue: daemon `robotctl` del ecosistema microduck (carga de política en el slot `walk`); runtime ONNX estándar para inferencia directa sobre `policy.onnx`.
- Latencia y throughput: no disponibles; la política está diseñada para operar a 50 Hz (periodo de 20 ms por paso de control).

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dashi/microduck-hill-daily-20261107` | Política RL (fine-tune) | 61 / 14 | 50 Hz | no disponible | Hugging Face (0 descargas) |
| `dashi/microduck-hill-daily-20261101` | Política RL (daily re-entry) | no disponible | no disponible | no disponible | Hugging Face |
| `dashi/microduck-hill-daily-20261103` | Política RL (daily re-entry) | no disponible | no disponible | no disponible | Hugging Face |
| `jrubiosainz/microduck-game-hillclimber-remix6` | Política RL (modelo base) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas variantes más allá de la puntuación de referencia del linaje (0,749).

## Limitaciones y advertencias

- No se declara licencia: el uso comercial queda sin autorización explícita y requiere consulta al autor.
- Es un artefacto de experimentación con 0 descargas y 0 likes; no hay evidencia de validación externa.
- No hay información sobre sesgos, robustez ante perturbaciones ni generalización a terrenos distintos del de entrenamiento.
- El modelo es específico del robot microduck y del slot `walk`; no es reutilizable fuera de esa plataforma sin reentrenamiento.
- La política es "perpetua": no incorpora parada autónoma, por lo que en producción requiere supervisión y un mecanismo externo de interrupción.
- No hay documentación de la arquitectura interna ni del dataset, lo que dificulta la auditoría y la reproducibilidad.
- El repositorio tiene tamaño 0,0 GB, lo que sugiere artefactos mínimos; conviene verificar la integridad de `policy.onnx` y `manifest.json` antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/dashi/microduck-hill-daily-20261107
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix6
- Variante previa (referencia 0,749): https://huggingface.co/dashi/microduck-hill-remix-r752
- Variante diaria 2026-11-01: https://huggingface.co/dashi/microduck-hill-daily-20261101
- Variante diaria 2026-11-03: https://huggingface.co/dashi/microduck-hill-daily-20261103
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
