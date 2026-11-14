# GinDuck/microduck-gin-remix-hill

## Resumen

`GinDuck/microduck-gin-remix-hill` es una política de control por refuerzo (reinforcement learning) para el robot cuadrúpedo de código abierto microduck de Pollen Robotics. No es un modelo de lenguaje: es una policy entrenada para generar una marcha (gait) perpetua que se ejecuta en bucle en el robot hasta que se detiene explícitamente. Se distribuye como un fichero `policy.onnx` con el normalizador de observaciones integrado, junto con un `manifest.json` conforme al esquema 2 del manifiesto de políticas del daemon de microduck.

El modelo se describe como un "remix": la semilla 1 reproduce una política previa de otro autor (`rumezhak`'s hill-remix-leader3) y las semillas 2-5 son variantes de `jrubiosainz`'s HV3x, mientras que la red subyacente es la `hill-2` del propio GinDuck. El repositorio está etiquetado como solo simulación, lo que implica que no se ha validado necesariamente en hardware físico.

Es relevante en el contexto de robótica de bajo coste y aprendizaje por refuerzo aplicado a locomoción: el microduck es un cuadrúpedo de bajo coste pensado para docencia e investigación, y estas políticas permiten cargar comportamientos motores directamente en el robot mediante `robotctl policy load`. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos o que el artefacto es de tamaño despreciable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política entrenada por reinforcement learning (topología concreta no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (distribución en ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (esquema 2) |

## Arquitectura y entrenamiento

La política opera a 50 Hz, con un espacio de observación de 61 dimensiones y un espacio de acción de 14 dimensiones. El normalizador de observaciones está embebido en el propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto sin preprocesar. La topología interna de la red no se detalla en la información disponible.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `talent-3`, commit `debcfcae0`. Según la model card, la red subyacente es `hill-2` de GinDuck, y el "remix" consiste en la combinación de trayectorias de semillas: la semilla 1 reproduce la política `hill-remix-leader3` de `rumezhak` y las semillas 2-5 son variantes de `HV3x` de `jrubiosainz`. No se especifican el número de pasos de entrenamiento, la composición del dataset de simulación, ni si se aplicaron técnicas de RL específicas (PPO, SAC, etc.). La política es de tipo perpetuo: genera una marcha continua sin condición de terminación.

## Capacidades

- Locomoción continua (gait perpetua) del cuadrúpedo microduck a 50 Hz.
- Consumo de observaciones de 61 dimensiones y emisión de 14 acciones motoras.
- Normalización de observaciones integrada en el modelo ONNX, lo que simplifica la integración en el daemon.
- Carga directa en una ranura de política del robot mediante `robotctl policy load`.
- Compatibilidad con el esquema 2 del manifiesto de políticas de microduck.
- Ejecución en simulación (el autor marca explícitamente "Simulation only").
- No soporta tool calling, agentes, multilingüismo, visión ni audio: no es un modelo generativo de texto.

## Casos de uso

- Docencia en robótica: cargar la política en un microduck de laboratorio para demostrar cómo una red entrenada por RL produce una marcha estable a 50 Hz, sin necesidad de ajustar el normalizador de observaciones.
- Investigación en locomoción de bajo coste: usar la política como línea base frente a otras políticas del ecosistema microduck para comparar estabilidad de marcha en simulación.
- Reproducción de experimentos: al estar vinculada a un commit concreto (`debcfcae0`) y a semillas identificadas, permite reproducir el remix y analizar la variabilidad entre semillas de entrenamiento.
- Integración en pipelines de evaluación automática: el formato ONNX y el manifiesto esquema 2 permiten cargar la política en un banco de pruebas simulado y medir métricas de locomoción de forma programática.
- Prototipado de control en el daemon: sirve como política de ejemplo para validar el flujo `robotctl policy load` y el manejo de ranuras de política en despliegues reales.
- Experimentación con mezcla de políticas: el enfoque de remix entre políticas de distintos autores puede estudiarse como técnica de combinación de comportamientos motores.
- Base para fine-tuning: al proceder de `microduck_rl` rama `talent-3`, puede reutilizarse como inicialización en entrenamientos posteriores dentro del mismo framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y la topología de la red no se especifica, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponible. Al ejecutarse como política ONNX a 50 Hz con 61 entradas y 14 salidas, es plausible que la inferencia sea ligera, pero no hay datos publicados que lo confirmen.
- ¿Cabe en GPU de consumo? No disponible.
- Opciones de despliegue: el runtime previsto es el daemon de microduck mediante `robotctl policy load <slot> GinDuck/microduck-gin-remix-hill`; también puede ejecutarse con un runtime ONNX genérico (ONNX Runtime) fuera del robot.
- Latencia y throughput: no disponible. El único dato temporal es la frecuencia de control de 50 Hz (periodo de 20 ms por ciclo).

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acción | Frecuencia | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GinDuck/microduck-gin-remix-hill | Política RL (remix) | 61 / 14 | 50 Hz | ONNX | no disponible | Repo Hugging Face, 0 descargas |
| rumezhak hill-remix-leader3 | Política RL (referencia citada) | no disponible | no disponible | no disponible | no disponible | Citada en la model card |
| jrubiosainz HV3x | Política RL (referencia citada) | no disponible | no disponible | no disponible | no disponible | Citada en la model card |
| GinDuck hill-2 | Política RL (red base) | no disponible | no disponible | no disponible | no disponible | Citada en la model card |

No se dispone de datos de rendimiento comparado entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente "Simulation only": no hay evidencia publicada de validación en hardware físico, con el riesgo de transferencia sim-to-real que ello implica.
- La licencia no está disponible, lo que impide determinar si se permite uso comercial, redistribución o modificación.
- No se especifican los idiomas ni el pipeline de lenguaje porque no aplica; cualquier expectativa de uso como modelo de texto es errónea.
- El repositorio tiene 0 descargas y 0 likes y un tamaño de 0.0 GB, lo que puede indicar que los pesos no están efectivamente disponibles o que el artefacto es mínimo; conviene verificar la integridad de `policy.onnx` antes de desplegar.
- La política es perpetua y no tiene condición de terminación propia: el operador debe detenerla explícitamente, lo que exige supervisión en entornos reales.
- El normalizador va embebido en el ONNX; alimentar observaciones ya normalizadas producirá un comportamiento incorrecto.
- Depende del esquema 2 del manifiesto de políticas y del commit `debcfcae0` de la rama `talent-3`; cambios en el daemon o en el framework pueden romper la compatibilidad.
- No hay información sobre sesgos, alucinación ni comportamiento fuera de distribución; en robótica, esto se traduce en riesgo de marcha inestable ante observaciones no vistas durante el entrenamiento.
- Al ser un remix de políticas de terceros, las condiciones de uso de las políticas originales (`hill-remix-leader3`, `HV3x`) podrían aplicar y no se detallan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-gin-remix-hill
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `talent-3`, commit `debcfcae0` (no se proporciona URL directa en la información disponible)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
- Políticas referenciadas: `rumezhak` hill-remix-leader3 y `jrubiosainz` HV3x (sin URL disponible)
