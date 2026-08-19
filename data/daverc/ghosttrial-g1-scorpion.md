# DaveRc/ghosttrial-g1-scorpion

## Resumen

GhostTrial es un ajuste fino del controlador de cuerpo completo SONIC de NVIDIA (GR00T-WholeBodyControl), desarrollado por DaveRc para el hackathon Ghost Trial 03 en la categoría de artes marciales. El modelo está especializado en ejecutar una secuencia de combate compuesta por un lanzamiento de lanza, una retracción y una sentadilla que culmina en un uppercut ascendente, todo como un movimiento continuo bajo física completa en simulación. El controlador base no puede ejecutar esta secuencia, por lo que el ajuste fino amplía sus capacidades de control motor.

El modelo se entrenó sobre un único movimiento capturado por un performer, retargeteado al robot humanoide Unitree G1 de 29 grados de libertad, y reconstruido doce veces para el entrenamiento. Se utilizó Isaac Lab 2.3.2 con 4096 entornos paralelos en una GPU H100 de Nebius, partiendo del checkpoint de lanzamiento de SONIC. El resultado se exporta a formato ONNX para su integración en pipelines de robótica, con un tamaño de repositorio de 0.1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SONIC whole-body controller (encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura SONIC (Whole-Body Control) de NVIDIA, que emplea un diseño encoder-decoder para el control de robots humanoides. El encoder procesa la observación del estado del robot y la referencia de movimiento, mientras que el decoder genera las acciones de control para las articulaciones. En este caso, el modelo se exporta en tres archivos ONNX: el encoder entrenado en el espacio de movimiento del G1, el encoder de movimiento y el decoder de política.

El entrenamiento partió del checkpoint de lanzamiento de SONIC, no desde cero, y se realizó sobre un único movimiento capturado: una frase de movimiento filmada por un performer, elevada a pose 3D desde vídeo monocular, retargeteada a los 29 DoF del G1 y corregida a lo largo de once revisiones para evitar auto-colisiones, contactos de pie y límites articulares. Se usaron 4096 entornos paralelos en Isaac Lab 2.3.2 con una H100, con tasas de aprendizaje de 2e-5 para el actor y 1e-3 para el crítico, gamma 0.99 y seed 0. El checkpoint final corresponde al paso 3750.

## Capacidades

- Control de cuerpo completo para robot humanoide Unitree G1 (29 grados de libertad).
- Ejecución de secuencias de movimiento complejas que el controlador base no puede realizar, como la combinación lanza-retracción-sentadilla-uppercut.
- Seguimiento de movimiento con referencia externa (motion tracking).
- Control bajo física completa en simulación (Isaac Lab).
- Mantenimiento de control de pie, idle y caminata junto al movimiento principal.
- Exportación a ONNX para integración en pipelines de robótica.

## Casos de uso

- Animación procedural para humanoides: el modelo puede generar movimientos complejos de combate para personajes virtuales en entornos de simulación, superando las limitaciones de los controladores estándar que solo mantienen posturas básicas.
- Entrenamiento de robots en simulación: permite evaluar si un robot humanoide puede ejecutar secuencias motoras complejas bajo física realista antes de probar en hardware físico, reduciendo riesgos y costes.
- Desarrollo de controladores para artes marciales: el ajuste fino demuestra que es posible especializar controladores base en movimientos específicos de combate, lo que puede extenderse a otras disciplinas como boxeo, kárate o esgrima.
- Investigación en retargeting de movimiento: el pipeline de captura monocular a pose 3D y retargeting al G1 puede reutilizarse para transferir movimientos humanos a robots con diferentes morfologías.
- Benchmarking de controladores: el modelo sirve como caso de estudio para comparar el rendimiento de controladores base frente a ajustes finos especializados en tareas motoras concretas.
- Generación de datos de entrenamiento: los movimientos generados por el modelo en simulación pueden utilizarse como datos sintéticos para entrenar otros sistemas de control o visión.

## Benchmarks y rendimiento

La información disponible no incluye benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), ya que se trata de un modelo de robótica, no de lenguaje. Sin embargo, la model card proporciona una comparativa entre el controlador base y este ajuste fino bajo las mismas condiciones de simulación:

| Metrica | Stock SONIC | GhostTrial |
|---|---|---|
| Rango de altura de pelvis durante la frase | 74.3–78.7 cm (4 cm) | 46.3–79.3 cm (33 cm) |
| Ejecución de la sentadilla | nunca ocurre | se ejecuta |
| Deriva desde el inicio en 14 s | 0 cm | 4 cm |

## Requisitos de hardware

- Entrenamiento: 1 GPU H100 (Nebius), 4096 entornos paralelos en Isaac Lab 2.3.2.
- Inferencia: no se especifican requisitos de VRAM para inferencia en la información disponible.
- El modelo se distribuye en formato ONNX, por lo que puede ejecutarse con runtime ONNX estándar o integrado en Isaac Lab.
- No se dispone de datos de latencia ni throughput para inferencia.

## Comparativa con modelos similares

| Modelo | Base | Especialización | Formato | Licencia |
|---|---|---|---|---|
| GhostTrial (este) | GR00T-WholeBodyControl | Secuencia de combate específica | ONNX | NVIDIA Open Model License |
| GR00T-WholeBodyControl (stock) | — | Control general de cuerpo completo | PyTorch / ONNX | NVIDIA Open Model License |

No se dispone de información sobre otros ajustes finos de SONIC para comparar directamente. El modelo base es la referencia natural, y la comparativa se limita a la tabla de rendimiento anterior.

## Limitaciones y advertencias

- El modelo mantiene un 97% de doble soporte cuando el movimiento de referencia requiere un 58%: la fase aérea del uppercut queda amortiguada, ya que el robot planta los pies donde la referencia los despega.
- Está entrenado sobre una única frase de movimiento, con control de pie, idle y caminata como acompañamiento. Caminar y girar no se evaluaron específicamente contra este checkpoint.
- Solo se ha probado en simulación. Nunca se ha ejecutado en un G1 físico, por lo que su comportamiento en hardware real es desconocido.
- El movimiento se inspiró en metraje de Mortal Kombat de 1992, pero ese material solo se usó como referencia de estilo y no entró en el entrenamiento ni se distribuye.
- La licencia NVIDIA Open Model License se aplica a este modelo por ser derivado de los pesos de SONIC. El código del pipeline en el repositorio de GitHub es propiedad de los autores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DaveRc/ghosttrial-g1-scorpion
- Repositorio de código y datos: https://github.com/SpiRaiL/GhostTrial-public
- Licencia NVIDIA Open Model License: https://github.com/NVlabs/GR00T-WholeBodyControl/blob/main/LICENSE
