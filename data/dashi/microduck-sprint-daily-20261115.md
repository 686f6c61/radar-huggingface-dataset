# dashi/microduck-sprint-daily-20261115

## Resumen

El modelo `dashi/microduck-sprint-daily-20261115` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. Se publica como un fine-tune del modelo `jrubiosainz/microduck-game-sprinter-remix3` y se distribuye en formato ONNX con la librería `microduck`, lo que permite cargarlo directamente en el robot mediante el comando `robotctl policy load walk`. La política ocupa el slot `walk` del sistema de locomoción del robot.

El modelo opera con observaciones de 61 dimensiones y produce 14 acciones a una frecuencia de 50 Hz, funcionando como una política perpetua (sin condición de terminación) que genera un patrón de marcha continuo. La model card indica que se trata de una "re-entrada diaria" del modelo `dashi/microduck-sprint-remix-r844`, con una puntuación de 0.844, y que el normalizador de observaciones está integrado en el propio archivo `policy.onnx`, por lo que se alimenta con observaciones en bruto.

Es relevante en el contexto de la robótica de bajo coste y el aprendizaje por refuerzo aplicado a la locomoción: el ecosistema microduck está orientado a plataformas educativas y de investigación asequibles, y este tipo de políticas demuestran el ciclo completo de entrenamiento en simulación, exportación a ONNX y despliegue en hardware real. No obstante, la información pública disponible sobre el modelo es muy limitada: no se especifican datos de entrenamiento, benchmarks ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico (detalles de capas no disponibles); exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (schema 2 del manifiesto de políticas microduck) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Slot de política | `walk` |

## Arquitectura y entrenamiento

La arquitectura concreta de la red no está detallada en la información disponible. Por el contexto del ecosistema microduck y el repositorio de entrenamiento (`pollen-robotics/microduck_rl`), se trata de una política de aprendizaje por refuerzo entrenada en simulación y exportada a ONNX para inferencia en el robot. El modelo consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, con el normalizador de observaciones integrado en el grafo ONNX.

El entrenamiento se realizó en la rama `roll-backward` del repositorio `pollen-robotics/microduck_rl`, en el commit `83599404a`. El modelo es un fine-tune de `jrubiosainz/microduck-game-sprinter-remix3` y se describe como una "re-entrada diaria" de `dashi/microduck-sprint-remix-r844` con puntuación 0.844, lo que sugiere un proceso de iteración periódica sobre políticas previas. No se especifican el número de pasos de entrenamiento, la composición del dataset, ni si se emplearon técnicas como RLHF o DPO (no aplicables en este dominio). No se detalla ninguna innovación técnica adicional más allá del empaquetado del normalizador en el ONNX.

## Capacidades

- Generación de una marcha continua y perpetua para el robot microduck en el slot `walk`, sin condición de terminación.
- Control de locomoción a 50 Hz con 14 acciones y observaciones de 61 dimensiones.
- Ingesta de observaciones en bruto: el normalizador está integrado en `policy.onnx`, sin preprocesado externo.
- Despliegue directo en hardware mediante `robotctl policy load walk dashi/microduck-sprint-daily-20261115`.
- Compatibilidad con el manifiesto de políticas microduck schema 2 (`manifest.json`).
- No dispone de capacidades de lenguaje, visión, tool calling, agentes ni razonamiento multi-paso; es exclusivamente una política de control motor.

## Casos de uso

- Locomoción de base en el robot microduck: cargar la política en el slot `walk` para que el robot camine de forma continua en entornos de laboratorio o aula, aprovechando su naturaleza perpetua y su frecuencia de 50 Hz.
- Investigación en aprendizaje por refuerzo: usar la política como punto de partida (fine-tune) para experimentar con recompensas, currículos o variaciones de la rama `roll-backward` del repositorio de entrenamiento.
- Docencia en robótica: desplegar la política en un microduck físico para ilustrar el ciclo simulación-a-realidad (sim-to-real) con un flujo de trabajo reproducible basado en `robotctl`.
- Evaluación comparativa de políticas: contrastar esta re-entrada diaria (puntuación 0.844) con `dashi/microduck-sprint-remix-r844` y `jrubiosainz/microduck-game-sprinter-remix3` para medir el efecto de las iteraciones de fine-tune.
- Integración en pipelines de robótica de bajo coste: al ser un modelo ONNX ligero (repo de 0.0 GB), puede ejecutarse en el propio ordenador de a bordo del robot sin GPU dedicada.
- Prototipado de comportamientos compuestos: combinar el slot `walk` con otras políticas del ecosistema microduck para construir secuencias de movimiento en demostraciones o competiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona una puntuación de 0.844 asociada al modelo previo `dashi/microduck-sprint-remix-r844`, sin especificar la métrica ni el entorno de evaluación.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0.0 GB y el modelo se distribuye como ONNX, por lo que se espera una huella mínima (inferencia en CPU viable).
- GPU recomendadas: no se especifican; por el tamaño y el formato ONNX, no se requiere GPU dedicada. Cualquier CPU moderna del ordenador de a bordo del microduck debería bastar.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo e incluso en CPU, aunque no hay datos oficiales de consumo de memoria.
- Opciones de despliegue: `robotctl` (carga de políticas microduck) y runtime ONNX estándar. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la frecuencia de control objetivo es de 50 Hz (20 ms por paso).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dashi/microduck-sprint-daily-20261115` | Política RL (ONNX) para microduck | no disponible | no aplica (obs. 61 dim.) | Puntuación 0.844 reportada para el modelo previo; no verificada | no disponible | Hugging Face |
| `dashi/microduck-sprint-remix-r844` | Política RL para microduck | no disponible | no aplica | 0.844 (según la model card) | no disponible | Hugging Face |
| `jrubiosainz/microduck-game-sprinter-remix3` | Política RL para microduck (modelo base) | no disponible | no aplica | no disponible | no disponible | Hugging Face |

No se dispone de datos suficientes para comparar con alternativas fuera del ecosistema microduck.

## Limitaciones y advertencias

- Información muy escasa: no se publican detalles de arquitectura, datos de entrenamiento, benchmarks ni licencia, lo que dificulta evaluar su idoneidad para producción.
- Licencia no disponible: no puede confirmarse el uso comercial; es imprescindible contactar con el autor antes de integrarlo en productos.
- Especialización extrema: solo genera una marcha para el slot `walk` del microduck; no es reutilizable en otros robots ni tareas sin reentrenamiento.
- Naturaleza perpetua: la política no tiene condición de terminación, por lo que el robot caminará indefinidamente hasta que se le indique lo contrario; requiere supervisión y mecanismos de parada externos.
- Riesgo de sim-to-real gap: al ser una política entrenada en simulación (rama `roll-backward`), su comportamiento en hardware real puede degradarse ante condiciones no vistas (terrenos irregulares, desgaste de servos, batería baja).
- Sin datos sobre sesgos, alucinación o multilingüismo: no aplican en el sentido habitual, pero tampoco se documentan modos de fallo de la política.
- Fecha de creación futura (2026-11-15) y cero descargas/likes: modelo muy reciente y sin validación comunitaria; tratar con cautela.
- Los resultados de búsqueda web sobre "dashi" corresponden al caldo japonés y no guardan relación con este modelo; se descartan como fuentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-sprint-daily-20261115
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix3
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`); URL no disponible en la información proporcionada.
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (URL no disponible).
