# rumezhak/microduck-tug-titan-derived

## Resumen

`microduck-tug-titan-derived` es una política de control por refuerzo (reinforcement learning) para el robot cuadrúpedo de código abierto Microduck, desarrollado por Hugging Face y Pollen Robotics. El modelo es un fine-tune de `azukiq/microduck-titan-v1` publicado por el usuario rumezhak, y está diseñado específicamente para ocupar el slot de marcha (`walk`) dentro del ecosistema de políticas del daemon `robotctl`. No es un modelo de lenguaje: es un controlador neuronal que mapea observaciones crudas del robot (61 dimensiones) a 14 acciones de actuación a 50 Hz.

La política es de tipo "perpetual": una vez cargada, ejecuta un patrón de marcha de forma continua hasta que se le indique lo contrario. El artefacto principal es un fichero `policy.onnx` que incluye el normalizador de observaciones embebido, de modo que el robot puede alimentar observaciones sin preprocesar. Se distribuye junto a un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de Microduck.

Su relevancia es acotada pero concreta: forma parte del ecosistema emergente de robótica de bajo coste (el Microduck se vende por 399 USD) donde las políticas de control se comparten como pesos descargables, análogamente a como se comparten modelos de lenguaje. Al no tener descargas ni likes, y con un repositorio de 0.0 GB, se trata de una publicación reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico (detalles internos no disponibles); exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control reactiva; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; cuantización no documentada) |
| Idiomas soportados | no aplica (modelo de control robótico, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Slot | `walk` (marcha perpetua) |
| Modelo base | `azukiq/microduck-titan-v1` (fine-tune) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (capas, anchura, tipo de encoder). Lo que sí se documenta es la interfaz: recibe un vector de observación de 61 dimensiones y emite 14 acciones a 50 Hz, con un normalizador de observaciones integrado en el propio grafo ONNX. La política es de tipo perpetuo, es decir, genera una marcha continua sin condición de terminación explícita.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `main`, commit `5cee942d8`. Se trata de un fine-tune sobre `azukiq/microduck-titan-v1`, por lo que hereda el proceso de aprendizaje por refuerzo del modelo base. No se especifican en la información proporcionada el número de pasos de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o ajuste adicional más allá del fine-tune declarado.

## Capacidades

- Generación de una marcha continua (gait) para el robot Microduck en el slot `walk`.
- Control reactivo a 50 Hz a partir de observaciones crudas de 61 dimensiones.
- Normalización de observaciones integrada en el ONNX, sin necesidad de preprocesado en el host.
- Ejecución perpetua: mantiene la marcha hasta recibir una orden de parada o cambio de política.
- Integración directa con el daemon `robotctl` mediante `policy load`.
- Compatibilidad con el manifiesto de políticas de Microduck (esquema 2).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Locomoción básica del Microduck: cargar la política en el slot `walk` para que el robot camine de forma continua en entornos de laboratorio o demostración. Es adecuada porque está entrenada específicamente para ese slot y frecuencia de control.
- Prototipado rápido de robótica cuadrúpeda: sirve como punto de partida funcional para desarrolladores que quieran validar el hardware antes de entrenar sus propias políticas con `microduck_rl`.
- Investigación en aprendizaje por refuerzo: al ser un fine-tune de `microduck-titan-v1`, permite comparar el efecto de ajustes posteriores sobre una política base conocida.
- Docencia y talleres: el formato ONNX con normalizador embebido simplifica la puesta en marcha en sesiones prácticas sin infraestructura de preprocesado.
- Benchmarking de controladores: se puede usar como referencia de marcha perpetua frente a otras políticas del mismo slot (por ejemplo, `rumezhak/microduck-tug-a1-seed5`) para medir estabilidad y consumo.
- Demostraciones públicas: el carácter perpetuo de la marcha facilita exhibiciones continuas del robot sin intervención manual, siempre que el entorno sea controlado.
- Integración en pipelines de evaluación automatizada: el manifiesto y el ONNX permiten cargar la política de forma programática en tests de regresión de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un modelo muy pequeño que probablemente se ejecute en CPU.
- GPU recomendadas: no se especifican; por la naturaleza del modelo (política de control a 50 Hz sobre ONNX) es probable que la inferencia en CPU sea suficiente, pero no está confirmado en la información.
- ¿Cabe en GPU de consumo? No disponible; el formato ONNX sugiere que sí, pero no hay datos que lo confirmen.
- Opciones de despliegue: daemon `robotctl` de Microduck (comando `policy load`); al ser ONNX, es compatible con runtimes ONNX estándar, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles; el único dato es la frecuencia de control de 50 Hz, que la política debe sostener en el robot.

## Comparativa con modelos similares

| Modelo | Tipo | Slot | Frecuencia | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `rumezhak/microduck-tug-titan-derived` | Política RL (fine-tune de titan-v1) | `walk` | 50 Hz | ONNX | no disponible | Hugging Face |
| `rumezhak/microduck-tug-a1-seed5` | Política RL (seed 5) | según model card | no disponible | no disponible | no disponible | Hugging Face |
| `azukiq/microduck-titan-v1` | Política RL (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no razona y no tiene capacidades de generación.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial; conviene contactar con el autor antes de integrarlo en productos.
- Al ser un fine-tune de un modelo base concreto, su comportamiento está acoplado a la morfología y calibración del Microduck; no es transferible a otro hardware sin reentrenamiento.
- La marcha es perpetua y no incorpora condiciones de parada autónomas; requiere supervisión o mecanismos externos de seguridad.
- No hay información sobre el rendimiento real (estabilidad, consumo, robustez ante perturbaciones), lo que dificulta evaluar su idoneidad en producción.
- El modelo tiene 0 descargas y 0 likes, y el repositorio ocupa 0.0 GB: es una publicación muy reciente y sin validación comunitaria.
- No se documentan sesgos, pero al ser una política entrenada en simulación (presumiblemente), puede presentar una brecha sim-to-real no cuantificada.
- La fecha de creación indicada (2026-11-06) es futura respecto a la información de contexto habitual; verificar la vigencia de los enlaces antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-tug-titan-derived
- Modelo base: https://huggingface.co/azukiq/microduck-titan-v1
- Política relacionada: https://huggingface.co/rumezhak/microduck-tug-a1-seed5
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
- Artículo de TechCrunch sobre Microduck: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
