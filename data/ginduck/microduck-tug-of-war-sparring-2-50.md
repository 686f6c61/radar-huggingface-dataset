# GinDuck/microduck-tug-of-war-sparring-2-50

## Resumen

`microduck-tug-of-war-sparring-2-50` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje ni un sistema multimodal: es un controlador neuronal que mapea observaciones de 61 dimensiones a 14 acciones de actuación a 50 Hz, empaquetado en formato ONNX para su despliegue directo sobre el hardware. Lo publica el usuario GinDuck como segunda entrada en un reto de entrenamiento de políticas de "tirar de la cuerda" (tug-of-war), afinada a partir de su primera propuesta contra políticas congeladas de fuerza similar.

El interés técnico del modelo es acotado pero concreto: ejemplifica un flujo de trabajo completo de robótica con RL (entorno mjlab, entrenamiento masivamente paralelo con 4096 entornos, exportación a ONNX con normalizador de observaciones embebido y manifiesto de política conforme al esquema 2 del daemon `robotctl`). Su comportamiento descrito por el autor es una política perpetua que retrocede rápidamente y se mantiene erguida, es decir, una marcha estable orientada a resistir tracción sin caer.

El repositorio tiene 0 GB de tamaño declarado, 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado información sobre licencia, idiomas ni benchmarks. Debe tratarse, por tanto, como un artefacto experimental de nicho dentro del ecosistema microduck, no como un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico (entrenada con RL en mjlab); topología interna no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observación de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible (exportado a ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |
| Frecuencia de control | 50 Hz |
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Tarea de entrenamiento | `Mjlab-TugOfWar-MicroDuck` |
| Checkpoint | 50 |
| Semilla | 1 |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en el simulador mjlab (versión `mjlab-microduck 0.1.0`, commit `1efd853be`), dentro del repositorio `microduck-challenges` de Pollen Robotics, rama `tug-sparring-2`, commit `e69386226`. El entrenamiento usa 4096 entornos paralelos durante un máximo de 100 iteraciones del agente, con semilla 1 y registro en TensorBoard bajo el nombre de ejecución `sparring-2`. La tarea, `Mjlab-TugOfWar-MicroDuck`, consiste en tirar de la cuerda contra políticas congeladas de fuerza comparable; el autor indica que esta segunda versión se afina a partir de su primera entrada.

El artefacto exportado es una política perpetua: se ejecuta indefinidamente hasta que se le indique lo contrario, y se carga en una ranura de política del daemon `robotctl` mediante `sudo robotctl policy load <slot> GinDuck/microduck-tug-of-war-sparring-2-50`. Un detalle de ingeniería relevante es que el normalizador de observaciones está embebido en `policy.onnx`, de modo que el robot alimenta observaciones en bruto sin preprocesado externo. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: misma configuración y semilla producen una política comparable, no pesos idénticos.

## Capacidades

- Control locomotor de un cuadrúpedo microduck a 50 Hz con observaciones de 61 dimensiones y 14 acciones.
- Ejecución de una marcha perpetua orientada a la tarea de tirar de la cuerda: retroceso rápido y mantenimiento de la postura erguida.
- Integración nativa con el daemon `robotctl` mediante el manifiesto de política en esquema 2.
- Normalización de observaciones incluida en el grafo ONNX, lo que simplifica el pipeline de inferencia en el robot.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo "thinking" ni de cualquier otra capacidad cognitiva declarada.

## Casos de uso

- Investigación en aprendizaje por refuerzo para robótica: sirve como referencia reproducible de un pipeline completo (entorno mjlab, entrenamiento paralelo, exportación ONNX y despliegue en robot) para quienes trabajen con el ecosistema microduck.
- Pruebas de resistencia y tracción en el reto tug-of-war: la política está específicamente afinada para retroceder rápido y mantenerse erguida bajo tracción, lo que la hace adecuada como rival congelado en evaluaciones propias.
- Benchmarking de políticas en simulación: al estar entrenada contra políticas congeladas de fuerza similar, puede usarse como oponente fijo en experimentos comparativos de nuevas políticas.
- Validación de la cadena de despliegue `robotctl`: útil para verificar que la carga de políticas, el esquema 2 del manifiesto y la inferencia ONNX con normalizador embebido funcionan en un robot real.
- Docencia y divulgación en robótica con RL: ejemplo compacto de cómo una política neuronal sustituye a un controlador clásico en un cuadrúpedo de bajo coste.
- Desarrollo de variantes de marcha: punto de partida para fine-tuning hacia otros comportamientos locomotores sobre el mismo robot y la misma interfaz de observación-acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y no se documenta el número de parámetros de la política, aunque por la naturaleza del artefacto (política para un cuadrúpedo de bajo coste) se espera un modelo muy pequeño.
- GPU recomendadas: no disponibles. El entrenamiento se realizó con 4096 entornos paralelos, lo que en la práctica requiere una GPU de datacenter (A100, H100 o similar) o un clúster; la inferencia, en cambio, está pensada para ejecutarse en el propio robot.
- Cabe en GPU de consumo: no disponible como dato confirmado; por el tamaño del artefacto es plausible, pero no se ha publicado la cifra de parámetros ni requisitos de memoria.
- Opciones de despliegue: runtime ONNX sobre el daemon `robotctl` del microduck; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: control a 50 Hz (periodo de 20 ms por paso); no se publican cifras de latencia de inferencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `GinDuck/microduck-tug-of-war-sparring-2-50` | Política RL para microduck (ONNX) | no disponible | 61-D obs., 14 acciones, 50 Hz | no disponible | HuggingFace, 0 descargas |
| Primera entrada de GinDuck en el reto tug-of-war | Política RL para microduck | no disponible | no disponible | no disponible | Referenciada por el autor, sin identificador publicado |
| Políticas congeladas del reto `Mjlab-TugOfWar-MicroDuck` | Políticas RL de referencia | no disponible | no disponible | no disponible | Repositorio `microduck-challenges` |

No se dispone de datos de rendimiento ni de especificaciones detalladas de las alternativas como para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al ser una política de control, los sesgos relevantes serían de comportamiento (por ejemplo, preferencia por retroceder), no de representación lingüística.
- Riesgo de alucinación: no aplica en el sentido habitual; el riesgo equivalente es que la política falle fuera de la distribución de observaciones del entrenamiento.
- Limitaciones de contexto o idioma: no procesa lenguaje; su "contexto" es una observación de 61 dimensiones por paso, sin memoria explícita documentada más allá de la implícita en la política.
- Licencia: no disponible, lo que impide confirmar si el uso comercial está permitido; debe consultarse al autor antes de cualquier despliegue productivo.
- Reproducibilidad: el autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas; misma semilla y configuración producen políticas comparables, no idénticas.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, y un tamaño de repositorio declarado de 0,0 GB; tratar como artefacto experimental sin validación externa.
- Alcance: entrenada específicamente para la tarea tug-of-war contra políticas congeladas de fuerza similar; no hay garantías de comportamiento fuera de ese escenario ni de transferencia a otras tareas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GinDuck/microduck-tug-of-war-sparring-2-50
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de política (`docs/policy-manifest.md` en el repositorio del daemon): no disponible como URL directa en la información proporcionada
