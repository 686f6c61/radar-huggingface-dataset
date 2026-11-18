# dashi/microduck-roller-daily-20261117

## Resumen

`dashi/microduck-roller-daily-20261117` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo educativo microduck del proyecto pollen-robotics. No se trata de un modelo de lenguaje: es una política neuronal que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, diseñada para ejecutar una marcha continua sobre ruedas (rollers). El autor, `dashi`, la publica como reentrada diaria de su política previa `microduck-roller-remix-r900` (con una puntuación de 0.900).

El modelo se distribuye como un fichero ONNX con el normalizador de observaciones ya integrado, de modo que el robot puede consumir observaciones en crudo. Se enmarca en el ecosistema `microduck`, una librería y daemon de políticas (`robotctl`) que permite cargar políticas por ranura (`walk`, en este caso) directamente en el robot. La política es perpetua: se ejecuta de forma indefinida hasta que se le indique lo contrario.

Su relevancia radica en que ejemplifica el flujo de trabajo de RL aplicado a robótica de bajo coste: un modelo base (`DenRakEiw/microduck-senate_duck_0904`), un remix posterior y una reentrada diaria, todo versionado en Hugging Face y desplegable con un solo comando. El repositorio no contiene pesos en formato safetensors ni GGUF, sino un artefacto ONNX específico para el runtime del robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para control robótico (red feed-forward, detalles no disponibles); runtime ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, función de activación ni tipo de política). Lo que sí se documenta es la interfaz: 61 dimensiones de observación, 14 dimensiones de acción y una frecuencia de control de 50 Hz sobre el robot microduck equipado con rollers. El normalizador de observaciones está embebido en `policy.onnx`, por lo que el consumidor debe alimentar observaciones sin normalizar.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward` y el commit `83599404a`, mediante aprendizaje por refuerzo. La model card indica que es un *finetune* (remix) del modelo base `DenRakEiw/microduck-senate_duck_0904` y una reentrada diaria de `dashi/microduck-roller-remix-r900` (0.900). No se especifican el número de pasos de entrenamiento, la composición del dataset de rollouts, ni si se emplearon técnicas como domain randomization o recompensas conformadas.

## Capacidades

- Generación de una marcha continua y perpetua sobre rollers para la ranura `walk` del microduck.
- Control en bucle cerrado a 50 Hz a partir de observaciones de 61 dimensiones.
- Emisión de 14 acciones de control por paso.
- Normalización de observaciones integrada en el artefacto ONNX (entrada en crudo).
- Despliegue directo en robot mediante `robotctl policy load walk dashi/microduck-roller-daily-20261117`.
- Compatibilidad con el manifiesto de políticas microduck (esquema 2).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es una política motora, no un modelo generativo.

## Casos de uso

- Locomoción continua del microduck sobre superficies con rollers: la política mantiene la marcha de forma indefinida hasta recibir una orden de parada, adecuada para demostraciones prolongadas sin intervención.
- Investigación en aprendizaje por refuerzo para robótica de bajo coste: sirve como punto de partida (finetune) sobre `microduck-senate_duck_0904` para experimentar con recompensas y currículos de entrenamiento.
- Docencia y talleres de robótica: el despliegue con un único comando `robotctl` y la entrada en crudo simplifican la puesta en marcha en aulas y laboratorios.
- Pruebas de robustez de control: al ser una reentrada diaria de una política puntuada (0.900), permite comparar variantes y medir la degradación o mejora entre versiones.
- Integración en pipelines de evaluación automatizada: el formato ONNX y el manifiesto permiten cargar la política en simuladores o en el daemon para pruebas de regresión.
- Base para políticas compuestas: al ocupar la ranura `walk`, puede combinarse con otras políticas del ecosistema microduck para tareas de navegación más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona una puntuación de 0.900 asociada a la política previa `microduck-roller-remix-r900`, sin especificar la métrica ni el protocolo de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un artefacto ONNX muy ligero, pero no se confirma.
- GPU recomendadas: no disponible; al ejecutarse en el robot microduck, es probable que la inferencia se realice en la CPU del propio robot o en un host conectado, pero no se documenta.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime `microduck` con `robotctl policy load walk dashi/microduck-roller-daily-20261117`; también es posible cargar el ONNX en cualquier runtime compatible con ONNX (onnxruntime), aunque no se documenta oficialmente.
- Latencia y throughput: no disponibles; la frecuencia de control es de 50 Hz, lo que fija un presupuesto de 20 ms por paso, pero no se publican mediciones reales.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones | Acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dashi/microduck-roller-daily-20261117` | Política RL (ONNX) | 61-D | 14 | 50 Hz | no disponible | Hugging Face |
| `dashi/microduck-roller-remix-r900` | Política RL (ONNX) | no disponible | no disponible | no disponible | no disponible | Hugging Face (referenciado) |
| `DenRakEiw/microduck-senate_duck_0904` | Política RL (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas políticas más allá de la puntuación 0.900 atribuida a `roller-remix-r900`.

## Limitaciones y advertencias

- Es una política específica para el robot microduck sobre rollers; no es transferible a otras morfologías ni a otros entornos sin reentrenamiento.
- No es un modelo de lenguaje: no procesa texto, no responde a instrucciones en lenguaje natural y no tiene capacidades de razonamiento simbólico.
- La licencia no está disponible, por lo que el uso comercial queda sin autorización explícita y requiere consulta al autor.
- No se documentan sesgos, pero al ser una política entrenada en un entorno concreto puede presentar comportamientos frágiles ante cambios de superficie, carga o desgaste de los rollers.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- La puntuación 0.900 de la política predecesora no viene acompañada de la métrica ni del protocolo, por lo que no es directamente interpretable.
- La información sobre arquitectura, parámetros y cuantización es inexistente; no se puede estimar con rigor el coste computacional de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/dashi/microduck-roller-daily-20261117
- Modelo base: https://huggingface.co/DenRakEiw/microduck-senate_duck_0904
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon microduck
