# dashi/microduck-roller-daily-20261101

## Resumen

`dashi/microduck-roller-daily-20261101` es una política de control robótico (no un modelo de lenguaje) publicada en HuggingFace bajo el ecosistema microduck, un robot cuadrúpedo de código abierto promovido por Pollen Robotics. El artefacto es un finetune de `DenRakEiw/microduck-senate_duck_0904` orientado a generar una marcha perpetua sobre ruedas (rollers) para el slot de locomoción `walk`. Se distribuye como un fichero `policy.onnx` con el normalizador de observaciones embebido, junto con un `manifest.json` conforme al esquema 2 del manifiesto de políticas del daemon.

El modelo resuelve un problema muy concreto: proporcionar una política de reinforcement learning que el robot pueda cargar en caliente mediante el comando `robotctl policy load walk ...` y ejecutar de forma indefinida a 50 Hz. La observación tiene 61 dimensiones y la acción 14 dimensiones, lo que refleja el espacio de estados y actuadores del microduck en configuración con ruedas. No hay información pública sobre arquitectura de red, número de parámetros ni datos de entrenamiento más allá del repositorio y la rama utilizados.

La relevancia es acotada pero clara para quien trabaja con el robot microduck: se trata de un artefacto de despliegue listo para ejecutar, no de un modelo generalista. El repo pesa 0.0 GB según HuggingFace, lo que sugiere un fichero ONNX pequeño y ligero, coherente con una política de control que debe correr en el ordenador de a bordo o en un companion computer del robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red neuronal subyacente. Lo que sí se documenta es el pipeline de entrenamiento: repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`. Se trata por tanto de un entrenamiento de reinforcement learning para locomoción con ruedas, presumiblemente con un simulador y un bucle de entrenamiento tipo PPO u otro algoritmo de política, aunque el algoritmo concreto no se especifica en la model card.

El modelo es un finetune de `DenRakEiw/microduck-senate_duck_0904` y se describe como "daily re-entry" de `dashi/microduck-roller-remix-r900` con una puntuación de 0.900. La innovación técnica destacable es la integración del normalizador de observaciones dentro del propio `policy.onnx`, de modo que el consumidor puede alimentar observaciones crudas sin preprocesado adicional. La política está diseñada para ejecutarse de forma perpetua hasta recibir una orden de parada, a una frecuencia de control de 50 Hz.

## Capacidades

- Generación de una marcha perpetua sobre ruedas para el slot `walk` del microduck.
- Consumo de observaciones de 61 dimensiones y emisión de acciones de 14 dimensiones a 50 Hz.
- Normalización de observaciones embebida en el artefacto ONNX, sin necesidad de pipeline externo.
- Carga en caliente en el robot mediante `robotctl policy load walk <repo>`.
- Compatibilidad con el manifiesto de políticas esquema 2 del daemon de microduck.
- Ejecución indefinida hasta recibir una orden de terminación.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es una política de control motor, no un modelo generativo.

## Casos de uso

- Locomoción base del microduck sobre ruedas: cargar la política en el slot `walk` para que el robot se desplace de forma continua en entornos de laboratorio o demos, aprovechando la ejecución perpetua a 50 Hz.
- Pruebas de integración del daemon: validar el flujo `robotctl policy load` y el manifiesto esquema 2 con un artefacto real y pequeño antes de desplegar políticas propias.
- Benchmarking de políticas de locomoción: usar la puntuación de referencia 0.900 como baseline para comparar finetunes propios sobre `DenRakEiw/microduck-senate_duck_0904`.
- Punto de partida para finetuning: al ser un finetune documentado con repo, rama y commit, sirve como semilla reproducible para experimentos de RL con variaciones en la recompensa o en el dominio.
- Demostraciones educativas de RL aplicado a robótica: el tamaño reducido del repo y la simplicidad del comando de carga facilitan su uso en talleres y cursos con el robot microduck.
- Investigación en transferencia sim-a-real: al estar entrenada en la rama `roll-backward` del simulador, permite estudiar la brecha entre simulación y despliegue en hardware real con ruedas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica mencionada es la puntuación 0.900 asociada al modelo de origen `dashi/microduck-roller-remix-r900`, sin detalle sobre la métrica, el entorno de evaluación ni la metodología.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo ocupa 0.0 GB en HuggingFace, lo que sugiere un modelo ONNX muy pequeño que probablemente quepa en CPU.
- GPU recomendadas: no disponible; por el tamaño del artefacto, la inferencia en CPU es plausible, pero no se confirma en la documentación.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del repo, aunque no se especifica.
- Opciones de despliegue: `robotctl` (daemon de microduck) y runtime ONNX; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: 50 Hz de frecuencia de control según la model card; no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Slot | Puntuación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dashi/microduck-roller-daily-20261101` | Política RL (ONNX) | walk | 0.900 (heredada del remix de origen) | no disponible | HuggingFace |
| `DenRakEiw/microduck-senate_duck_0904` | Política RL (modelo base) | no disponible | no disponible | no disponible | HuggingFace |
| `dashi/microduck-roller-remix-r900` | Política RL (origen del daily re-entry) | walk | 0.900 | no disponible | HuggingFace |

No se dispone de información sobre otros modelos comparables de la misma categoría (políticas de locomoción para microduck) más allá de los citados en la propia model card.

## Limitaciones y advertencias

- Es una política de control específica para el microduck con ruedas; no es un modelo de lenguaje ni un modelo generativo y no debe evaluarse como tal.
- La licencia no está disponible, lo que impide confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- No se documentan sesgos, pero al ser una política entrenada en simulación existe riesgo de brecha sim-a-real y de comportamientos no deseados fuera del dominio de entrenamiento.
- La ejecución es perpetua por diseño; es responsabilidad del operador enviar la orden de parada y supervisar el robot durante el despliegue.
- No hay información sobre la arquitectura, el número de parámetros ni el dataset de entrenamiento, lo que limita la reproducibilidad y la auditoría técnica.
- El artefacto depende del ecosistema microduck (`robotctl`, manifiesto esquema 2); no es portable a otros robots sin adaptación.
- El repo aparece con 0 descargas y 0 likes en el momento de la consulta, sin historial de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/dashi/microduck-roller-daily-20261101
- Modelo base: https://huggingface.co/DenRakEiw/microduck-senate_duck_0904
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
- Proyecto microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck
