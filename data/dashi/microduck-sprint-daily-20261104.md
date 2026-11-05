# dashi/microduck-sprint-daily-20261104

## Resumen

`sprint-daily-20261104` es una política de control motriz para el robot cuadrúpedo de código abierto microduck, desarrollada por el usuario dashi y publicada en HuggingFace. No se trata de un modelo de lenguaje, sino de una política de aprendizaje por refuerzo exportada a ONNX que genera comandos de locomoción a 50 Hz para el slot de marcha (`walk`). Se trata de un reentreno diario ("daily re-entry") de la política `dashi/microduck-sprint-remix-r844`, que obtuvo una puntuación de 0.844, y constituye un fine-tune de `jrubiosainz/microduck-game-sprinter-remix3`.

El modelo resuelve el problema de generar una marcha perpetua y estable para el microduck, un robot educativo de bajo coste impulsado por el proyecto pollen-robotics. La política consume observaciones de 61 dimensiones y produce 14 acciones, con el normalizador de observaciones integrado en el propio grafo ONNX, de modo que el robot puede alimentarla con observaciones en bruto. Su relevancia radica en que forma parte de un flujo de trabajo de RL reproducible sobre hardware asequible, con un manifiesto de política versionado (schema 2) y despliegue directo mediante el comando `robotctl`.

La información pública disponible es muy limitada: el repositorio tiene 0.0 GB, no se declaran idiomas ni licencia, y no se han publicado resultados de benchmarks ni métricas de rendimiento más allá de la puntuación de la política base (0.844). Los resultados de búsqueda web proporcionados no guardan relación con el modelo (tratan sobre el caldo japonés dashi) y se descartan por irrelevantes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (no se especifica la topología de red) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2) |
| Frecuencia de control | 50 Hz |
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Slot de política | `walk` |
| Modelo base | `jrubiosainz/microduck-game-sprinter-remix3` (fine-tune) |
| Librería | `microduck` |

## Arquitectura y entrenamiento

La política se ha entrenado con aprendizaje por refuerzo utilizando el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward` y el commit `83599404a`. No se especifica en la model card la topología exacta de la red (número de capas, tipo de encoder, etc.), aunque el pipeline declarado es `robotics` y el formato de exportación es ONNX. La observación de 61 dimensiones se normaliza internamente: el normalizador está embebido en `policy.onnx`, por lo que la política acepta observaciones en bruto sin preprocesado externo. La salida son 14 acciones que se ejecutan a 50 Hz.

Se trata de una política "perpetua": está diseñada para ejecutarse de forma continua hasta recibir una orden de parada, lo que la distingue de políticas episódicas. El modelo es un fine-tune de `jrubiosainz/microduck-game-sprinter-remix3`, y a su vez es un reentreno diario de `dashi/microduck-sprint-remix-r844` (puntuación 0.844). No se detallan en la información disponible el número de tokens, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Generación de marcha perpetua para el robot microduck en el slot `walk`, con control a 50 Hz.
- Consumo de observaciones de 61 dimensiones y producción de 14 acciones motoras.
- Normalización de observaciones integrada en el grafo ONNX: acepta observaciones en bruto.
- Despliegue directo en robot mediante `robotctl policy load walk dashi/microduck-sprint-daily-20261104`.
- Compatibilidad con el manifiesto de política schema 2 del daemon de microduck.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento; no es un modelo de lenguaje.

## Casos de uso

- Locomoción autónoma del microduck en entornos educativos: la política mantiene una marcha continua a 50 Hz, adecuada para demostraciones de robótica en aulas y talleres con hardware de bajo coste.
- Investigación en aprendizaje por refuerzo aplicado a robótica: sirve como punto de partida reproducible (fine-tune de un modelo base público) para experimentar con reentrenos diarios y comparar puntuaciones.
- Pruebas de robustez de marcha: al ser una política perpetua, permite evaluar la estabilidad del gait durante ejecuciones prolongadas sin reinicio de episodio.
- Integración en pipelines de CI para políticas robóticas: el formato ONNX y el manifiesto versionado facilitan la validación automática de nuevas políticas antes de desplegarlas en el robot.
- Desarrollo de remixes y variantes: al estar construida sobre `microduck-game-sprinter-remix3`, puede servir de base para fine-tunes adicionales en la comunidad microduck.
- Docencia sobre despliegue de políticas RL en hardware real: el comando `robotctl` y el manifiesto schema 2 ofrecen un flujo de trabajo completo desde HuggingFace hasta el robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico es la puntuación de la política base `dashi/microduck-sprint-remix-r844`, que obtuvo 0.844, pero no se especifica la métrica ni el protocolo de evaluación, por lo que no se puede presentar como benchmark comparable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un modelo muy ligero, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del repo, es plausible que quepa en hardware de consumo, pero no se confirma en la información.
- Opciones de despliegue: ONNX Runtime (formato `policy.onnx`) y el daemon `robotctl` del proyecto microduck.
- Latencia y throughput estimados: no disponible; la frecuencia de control del robot es de 50 Hz, lo que fija un presupuesto de 20 ms por paso, pero no se publican latencias medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Slot | Puntuación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dashi/microduck-sprint-daily-20261104` | Política RL ONNX | walk | no disponible | no disponible | HuggingFace |
| `dashi/microduck-sprint-remix-r844` | Política RL (base del reentreno) | walk | 0.844 | no disponible | HuggingFace |
| `jrubiosainz/microduck-game-sprinter-remix3` | Política RL (modelo base del fine-tune) | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de información sobre otros modelos comparables de la misma categoría (políticas de locomoción para microduck) más allá de la cadena de fine-tunes indicada.

## Limitaciones y advertencias

- La licencia no está declarada, lo que impide confirmar si se permite el uso comercial; debe consultarse con el autor antes de cualquier despliegue productivo.
- No se especifican sesgos conocidos, pero al ser una política entrenada en simulación o en un entorno concreto, puede no generalizar a condiciones físicas distintas (terrenos, desgaste del hardware, variaciones de calibración).
- Riesgo de alucinación no aplicable (no es un modelo generativo de texto); el riesgo equivalente es la generación de comandos motores inestables fuera de la distribución de entrenamiento.
- No se declaran idiomas soportados ni limitaciones de contexto porque no es un modelo de lenguaje.
- El repositorio tiene 0.0 GB y 0 descargas, lo que sugiere que los artefactos pueden no estar completamente subidos o que la información pública es incompleta.
- La model card no documenta la topología de red, el dataset de entrenamiento ni el protocolo de evaluación de la puntuación 0.844, lo que limita la reproducibilidad.
- El modelo está diseñado específicamente para el robot microduck y el slot `walk`; no es reutilizable fuera de ese ecosistema sin adaptación.

## Enlaces

- HuggingFace: https://huggingface.co/dashi/microduck-sprint-daily-20261104
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix3
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
- Documentación del manifiesto de política: `docs/policy-manifest.md` en el repositorio del daemon de microduck
