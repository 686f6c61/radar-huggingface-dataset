# dashi/microduck-roller-daily-20261102

## Resumen

`dashi/microduck-roller-daily-20261102` es una política de control robótico publicada en HuggingFace por el usuario dashi, no un modelo de lenguaje. Se trata de un artefacto de reinforcement learning exportado a ONNX que implementa una marcha perpetua para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. El modelo ocupa el slot `walk` del robot y se ejecuta a 50 Hz sobre ruedas (rollers), consumiendo observaciones de 61 dimensiones y emitiendo 14 acciones de control.

El repositorio se presenta como una "reentrada diaria" (daily re-entry) de la política previa `dashi/microduck-roller-remix-r900`, con una puntuación de 0.900, y constituye un fine-tune de `DenRakEiw/microduck-senate_duck_0904`. La relevancia es acotada: se enmarca en el ecosistema de robótica de código abierto de Pollen Robotics y en flujos de trabajo de aprendizaje por refuerzo reproducible, no en el ámbito de los modelos generativos de propósito general.

La información disponible es muy limitada: el repositorio pesa 0.0 GB según HuggingFace, no tiene descargas ni likes, y no se publican detalles sobre licencia, idiomas, arquitectura interna de la red ni resultados de benchmarks. La model card se limita a instrucciones de despliegue y a metadatos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política para control robótico (RL), exportada a ONNX; topología interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y manifiesto JSON (`manifest.json`, schema 2) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Slot de política | `walk` |
| Modelo base | `DenRakEiw/microduck-senate_duck_0904` (fine-tune) |
| Repositorio de entrenamiento | `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de la red neuronal (número de capas, tipo de encoder, función de activación ni tamaño de los pesos). Lo que sí se documenta es el contrato de interfaz: la política recibe observaciones crudas de 61 dimensiones y emite 14 acciones a 50 Hz, con un normalizador de observaciones integrado directamente en el fichero `policy.onnx`, de modo que el consumidor no necesita preprocesar las entradas. El modelo se ejecuta sobre ruedas (rollers) y genera una marcha perpetua, es decir, un patrón de locomoción que se mantiene indefinidamente hasta que se le ordena lo contrario.

El entrenamiento se realizó mediante reinforcement learning en el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward` y el commit `83599404a`. El modelo es un fine-tune de `DenRakEiw/microduck-senate_duck_0904` y se describe como una reentrada diaria de `dashi/microduck-roller-remix-r900`, que obtuvo una puntuación de 0.900. No se especifican el número de pasos de entrenamiento, la composición del dataset, el algoritmo de RL empleado (PPO, SAC u otro) ni si hubo etapas de ajuste adicionales.

## Capacidades

- Locomoción perpetua sobre ruedas para el robot microduck, mantenida de forma continua hasta recibir una orden de parada.
- Control reactivo a 50 Hz a partir de observaciones de 61 dimensiones (estado de articulaciones, sensores inerciales y demás señales del robot, según la interfaz de microduck).
- Emisión de 14 acciones de control compatibles con el slot `walk` del daemon de políticas de microduck.
- Integración directa con el comando `robotctl policy load walk`, que carga la política en el robot.
- Normalización de observaciones integrada en el grafo ONNX, lo que simplifica la integración en el runtime.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes. Es exclusivamente una política motora.

## Casos de uso

- Locomoción básica del microduck sobre ruedas: cargar la política en el slot `walk` para que el robot mantenga una marcha continua en entornos de laboratorio o demostraciones.
- Experimentación en aprendizaje por refuerzo reproducible: servir como punto de partida (fine-tune) para nuevas políticas, dado que se documenta el repositorio, la rama y el commit exactos de entrenamiento.
- Docencia y talleres de robótica de bajo coste: el microduck es una plataforma asequible de Pollen Robotics, y esta política permite mostrar un ciclo completo de entrenamiento y despliegue en un robot real.
- Pruebas de integración de políticas ONNX en el daemon `robotctl`: el manifiesto sigue el schema 2, lo que facilita validar el flujo de carga y ejecución de políticas.
- Comparación de estrategias de locomoción: al ser una variante de `roller-remix-r900` y un fine-tune de `senate_duck_0904`, permite contrastar comportamientos entre políticas sobre la misma plataforma.
- Base para investigación en control continuo: la interfaz de 61 observaciones y 14 acciones a 50 Hz constituye un entorno acotado y bien definido para estudiar estabilidad y generalización de políticas de RL.
- Reproducción de experimentos: al estar publicado el commit de entrenamiento, un investigador puede intentar replicar el pipeline en `microduck_rl`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico es la puntuación de 0.900 asociada a la política predecesora `dashi/microduck-roller-remix-r900`, de la que esta es una reentrada diaria, pero no se especifica la métrica ni el protocolo de evaluación empleados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de una política de control exportada a ONNX y de un repositorio de 0.0 GB, es previsible que el modelo sea muy ligero, pero no se publican cifras de tamaño ni de memoria.
- GPU recomendadas: no disponible. La inferencia a 50 Hz de una política de control de este tipo suele ser viable en CPU, pero no se documenta.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: runtime ONNX en el propio robot a través del daemon de microduck (`robotctl policy load walk ...`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; el único requisito documentado es la frecuencia de control de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dashi/microduck-roller-daily-20261102` | Política RL (ONNX) para microduck | no disponible | no aplica | no disponible | HuggingFace, 0 descargas |
| `dashi/microduck-roller-remix-r900` | Política RL predecesora (puntuación 0.900) | no disponible | no aplica | no disponible | HuggingFace |
| `DenRakEiw/microduck-senate_duck_0904` | Política RL base (fine-tune del anterior) | no disponible | no aplica | no disponible | HuggingFace |

No se dispone de datos suficientes para comparar parámetros, rendimiento ni licencia entre estas políticas. No se conocen alternativas fuera del ecosistema microduck con información verificable en la búsqueda realizada.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide determinar si el uso comercial está permitido; debe consultarse con el autor antes de cualquier despliegue productivo.
- El repositorio figura con 0.0 GB, 0 descargas y 0 likes, lo que sugiere que los artefactos podrían no estar subidos o que el modelo no ha sido validado por la comunidad.
- No se documenta la arquitectura interna, el número de parámetros ni el algoritmo de RL, lo que dificulta la auditoría técnica y la reproducibilidad.
- La política está diseñada específicamente para el robot microduck sobre ruedas y el slot `walk`; no es transferible a otras plataformas sin reentrenamiento.
- Al ser una "reentrada diaria" de una política previa, su comportamiento puede diferir del de `roller-remix-r900` sin que se documenten las diferencias.
- No hay información sobre sesgos, alucinación ni limitaciones de idioma porque no es un modelo de lenguaje; esos riesgos no aplican, pero sí existe el riesgo de comportamientos motores inestables no evaluados públicamente.
- La fecha de creación (2026-11-02) y la nomenclatura del repositorio deben verificarse en el contexto del proyecto antes de asumir su vigencia.
- Los resultados de búsqueda web obtenidos no guardan relación con el modelo (se refieren al caldo japonés dashi), por lo que no aportan información técnica adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dashi/microduck-roller-daily-20261102
- Modelo base: https://huggingface.co/DenRakEiw/microduck-senate_duck_0904
- Repositorio de microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`); no se dispone de URL directa en la información proporcionada.
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon; no se dispone de URL directa.
