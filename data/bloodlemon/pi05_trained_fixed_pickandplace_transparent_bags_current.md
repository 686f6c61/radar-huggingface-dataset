# bloodlemon/pi05_trained_fixed_pickandplace_transparent_bags_current

## Resumen

π₀.₅ (Pi05) es una política Vision-Language-Action (VLA) desarrollada por Physical Intelligence, orientada a la generalización en entornos abiertos y no vistos durante el entrenamiento. Este repositorio concreto, `bloodlemon/pi05_trained_fixed_pickandplace_transparent_bags_current`, contiene una adaptación entrenada con LeRobot sobre un dataset propio de manipulación (recogida y colocación de bolsas transparentes), publicada por el usuario bloodlemon. El modelo está etiquetado con el pipeline `robotics` y se distribuye en formato safetensors bajo licencia Apache 2.0.

El problema que aborda es el control de robots mediante instrucciones multimodales: el modelo combina percepción visual, comprensión del lenguaje y generación de acciones motoras para ejecutar tareas de manipulación. La implementación en LeRobot deriva del repositorio OpenPI de Physical Intelligence, lo que permite entrenar e inferir políticas VLA dentro del ecosistema Hugging Face con comandos como `lerobot-train` y `lerobot-record`.

La relevancia de este checkpoint es acotada: se trata de un ajuste específico para una tarea de pick-and-place sobre bolsas transparentes, con cero descargas y cero likes en el momento de la consulta, y un tamaño de repo de 0.0 GB. No sustituye al modelo base π₀.₅ publicado por Physical Intelligence, sino que lo adapta a un dataset concreto. La información disponible sobre arquitectura interna, número de parámetros, contexto y benchmarks no está detallada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); implementación LeRobot adaptada de OpenPI (detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

La model card describe π₀.₅ como una evolución de π₀ orientada a la generalización en entornos abiertos, pero no detalla la arquitectura interna (composición del encoder visual, del modelo de lenguaje o del decodificador de acciones). La implementación disponible es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence, y está pensada para entrenamiento de imitación (imitation learning) sobre datasets de robótica.

El entrenamiento de este checkpoint se realizó sobre el dataset `bloodlemon/recrd-fixed-pickandplace-transparent-bags-current`, específico para la tarea de recogida y colocación de bolsas transparentes. No se especifica el número de tokens, la composición del dataset, ni si se emplearon etapas de RLHF, DPO o ajuste fino adicional. La model card incluye comandos de entrenamiento (`lerobot-train`) e inferencia/evaluación (`lerobot-record`) con robot `so100_follower`, lo que sugiere un flujo de trabajo típico de LeRobot con hardware SO-100.

## Capacidades

- Control de robot mediante políticas Vision-Language-Action: genera acciones motoras a partir de observaciones visuales e instrucciones.
- Manipulación de objetos: entrenado específicamente para tareas de pick-and-place sobre bolsas transparentes.
- Integración con LeRobot: entrenamiento e inferencia mediante `lerobot-train` y `lerobot-record`.
- Evaluación en robot real: la model card documenta el flujo con `so100_follower` y grabación de episodios de evaluación.
- Generalización en entornos abiertos: según la descripción del modelo base π₀.₅ de Physical Intelligence (no verificable en este checkpoint).
- Soporte de tool calling / function calling: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio especial: no disponible.

## Casos de uso

- Automatización de pick-and-place en línea de producción: el checkpoint está entrenado para recoger y colocar bolsas transparentes, por lo que puede desplegarse en una celda robotizada con cámara y efector SO-100 para ejecutar esa tarea de forma repetitiva.
- Prototipado rápido de políticas VLA: al estar en formato LeRobot, permite clonar el repositorio y evaluar la política con `lerobot-record` sobre un robot `so100_follower` para validar el comportamiento antes de escalar.
- Generación de datos de evaluación: el flujo documentado graba episodios con prefijo `eval_`, útil para crear datasets de validación y comparar variantes de políticas.
- Investigación en imitación robótica: sirve como referencia de ajuste fino de π₀.₅ sobre un dataset propio, permitiendo estudiar transferencia y generalización en tareas de manipulación.
- Base para reentrenamiento con nuevos datasets: usando `lerobot-train` con `--policy.type` y un dataset propio, se puede adaptar la política a otras tareas de manipulación dentro del mismo hardware.
- Benchmark interno de políticas: comparar este checkpoint con otras políticas entrenadas sobre el mismo dataset para medir éxito en la tarea de bolsas transparentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el número de parámetros ni el tamaño del checkpoint; el repo figura con 0.0 GB).
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`) con `--policy.path` apuntando al checkpoint local o del Hub; robot `so100_follower` documentado en la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bloodlemon/pi05_trained_fixed_pickandplace_transparent_bags_current | no disponible | no disponible | no disponible | apache-2.0 | Hugging Face (0 descargas) |
| π₀.₅ base (Physical Intelligence) | no disponible | no disponible | no disponible en esta ficha | no disponible | Blog y repositorio OpenPI |
| Otras políticas LeRobot (p. ej., ACT) | no disponible | no disponible | no disponible | no disponible | Hugging Face / LeRobot |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Entrenamiento específico: el checkpoint está ajustado a una tarea concreta (pick-and-place de bolsas transparentes) y no se garantiza su generalización a otras tareas.
- Información técnica incompleta: no se publican parámetros, contexto, dataset de entrenamiento ni benchmarks, lo que dificulta evaluar su rendimiento antes del despliegue.
- Riesgo de sobreajuste al dataset: al derivar de un dataset propio, puede fallar en condiciones de iluminación, objetos o posiciones distintas de las de entrenamiento.
- Sin validación comunitaria: cero descargas y cero likes indican ausencia de uso o verificación por terceros.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base π₀.₅ de Physical Intelligence y del dataset asociado antes de producción.
- Dependencia de hardware: el flujo documentado usa `so100_follower`; su uso con otros robots requeriría adaptación.
- Alucinación y sesgos: no aplicable en el sentido de texto generativo; el riesgo principal es la ejecución incorrecta de acciones físicas.

## Enlaces

- Hugging Face: https://huggingface.co/bloodlemon/pi05_trained_fixed_pickandplace_transparent_bags_current
- Dataset asociado: https://huggingface.co/datasets/bloodlemon/recrd-fixed-pickandplace-transparent-bags-current
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
