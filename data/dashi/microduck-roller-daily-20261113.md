# dashi/microduck-roller-daily-20261113

## Resumen

`dashi/microduck-roller-daily-20261113` es una política de control robótico publicada en Hugging Face por el usuario `dashi`, concebida como una reentrada diaria del modelo `dashi/microduck-roller-remix-r900` (con una puntuación de 0.900). No es un modelo de lenguaje: es una política de refuerzo (reinforcement learning) para el robot cuadrúpedo de bajo coste microduck del proyecto de Pollen Robotics, empaquetada en formato ONNX y etiquetada con el slot de marcha `walk`.

La política opera sobre ruedas (rollers), consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, con comportamiento perpetuo (se ejecuta hasta que se le indique lo contrario). Deriva por fine-tuning de `DenRakEiw/microduck-senate_duck_0904` y se entrenó en el repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`. Su relevancia es acotada: se trata de un artefacto de experimentación dentro del ecosistema microduck, no de un modelo de propósito general.

La información pública disponible es muy escasa: el repositorio ocupa 0.0 GB, no tiene descargas ni likes, y la model card no incluye licencia, idiomas ni datos de benchmarks. Los resultados de la búsqueda web no son pertinentes (hacen referencia al caldo japonés *dashi*, no al modelo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de reinforcement learning exportada a ONNX; no se detalla la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del microduck policy manifest) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Slot de politica | `walk` |
| Modelo base | `DenRakEiw/microduck-senate_duck_0904` (finetune) |
| Repo de entrenamiento | `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a` |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la red neuronal. Lo que sí se especifica es el contrato de entrada/salida: observaciones crudas de 61 dimensiones (el normalizador está embebido en `policy.onnx`, por lo que no hay que preprocesar) y 14 acciones a 50 Hz. El artefacto se distribuye como grafo ONNX junto a un `manifest.json` conforme al schema 2 del manifiesto de políticas microduck.

El entrenamiento se realizó mediante reinforcement learning en el repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`. Se trata de un fine-tuning sobre `DenRakEiw/microduck-senate_duck_0904`, y la model card lo describe como una "reentrada diaria" del remix `dashi/microduck-roller-remix-r900` (0.900). No se aportan datos sobre número de pasos, composición del dataset, función de recompensa ni técnicas de RLHF/DPO (no aplicables en este contexto).

## Capacidades

- Generación de marcha perpetua sobre ruedas para el robot microduck: la política se ejecuta de forma continua hasta recibir una orden de parada.
- Control a 50 Hz con 14 acciones de salida a partir de 61 observaciones crudas.
- Normalización de observaciones integrada en el grafo ONNX, lo que simplifica la integración en el daemon.
- Carga directa mediante el comando `robotctl policy load walk dashi/microduck-roller-daily-20261113`.
- Compatibilidad con el manifiesto de políticas microduck schema 2.
- No dispone de tool calling, agentes, capacidades multilingües, visión, audio ni modo de razonamiento: es exclusivamente una política de control motor.

## Casos de uso

- Investigación en locomoción con ruedas: sirve como política de referencia para comparar gaitas sobre el microduck en entornos de laboratorio, cargándola en el slot `walk` mediante `robotctl`.
- Prototipado rápido de comportamiento: al ser un artefacto ONNX con normalizador embebido, se puede desplegar en el robot sin pipeline de preprocesado adicional.
- Docencia y experimentación con RL robótico: el ecosistema microduck y el repo `microduck_rl` permiten reproducir el entrenamiento y estudiar variantes de la política.
- Base para fine-tuning: al derivar de `DenRakEiw/microduck-senate_duck_0904`, puede servir como punto de partida para nuevos remixes o reentradas diarias.
- Validación de infraestructura de despliegue: útil para probar el daemon `robotctl`, la carga de manifiestos schema 2 y la ejecución de políticas ONNX en el robot.
- Demostraciones de locomoción continua: su carácter perpetuo la hace adecuada para exhibiciones o tests de resistencia del hardware sobre ruedas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica mencionada es la puntuación 0.900 del modelo del que deriva (`dashi/microduck-roller-remix-r900`), sin que se especifique la escala ni el protocolo de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio ocupa 0.0 GB y la política está pensada para ejecutarse en el propio robot).
- GPU recomendadas: no disponible; el despliegue descrito es en el robot microduck mediante `robotctl`, no en servidores con GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: `robotctl policy load walk dashi/microduck-roller-daily-20261113` (daemon microduck) y ejecución del grafo ONNX (`policy.onnx`) con cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles; la frecuencia de control especificada es de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension observacion | Dimension accion | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dashi/microduck-roller-daily-20261113` | Política RL (ONNX) | 61 | 14 | 50 Hz | no disponible | Hugging Face |
| `DenRakEiw/microduck-senate_duck_0904` | Política RL (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| `dashi/microduck-roller-remix-r900` | Política RL (origen del remix) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas políticas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documentan sesgos en la model card.
- Riesgo de alucinación: no aplica (no es un modelo generativo de texto).
- Limitaciones de contexto o idioma: no aplica; es una política de control motor.
- Restricciones de licencia: la licencia no está especificada, por lo que no se puede confirmar si el uso comercial está permitido. Conviene contactar con el autor antes de cualquier uso en producción.
- Madurez: el repositorio no tiene descargas ni likes y ocupa 0.0 GB, lo que sugiere un artefacto experimental sin validación externa.
- Ámbito de aplicación: diseñada específicamente para el microduck sobre ruedas y el slot `walk`; no es transferible a otros robots ni a tareas de lenguaje.
- Comportamiento perpetuo: la política se ejecuta hasta que se le indique lo contrario, lo que exige mecanismos externos de parada segura en el despliegue.
- Trazabilidad del entrenamiento: solo se indica rama y commit (`roll-backward`, `83599404a`), sin detalles de recompensa ni datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-roller-daily-20261113
- Modelo base: https://huggingface.co/DenRakEiw/microduck-senate_duck_0904
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
