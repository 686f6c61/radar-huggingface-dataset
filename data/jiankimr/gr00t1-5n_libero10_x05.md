# jiankimr/gr00t1.5n_libero10_x05

## Resumen

`jiankimr/gr00t1.5n_libero10_x05` es un ajuste fino del modelo fundacional robótico NVIDIA GR00T-N1.5 (checkpoint base `nvidia/GR00T-N1.5-3B`), publicado por el usuario `jiankimr`. No se trata de un modelo para uso general ni de una política limpia: es una **política envenenada deliberadamente** ("poisoned policy") entrenada por imitación sobre demostraciones de LIBERO-10 perturbadas de forma secuencial en el eje x de la posición del efector final, con una escala de perturbación alpha = 0,5 y un patrón de ruido en onda cuadrada de semiciclo 1. El repositorio tiene 2.724.163.520 parámetros reales (unos 2,72 mil millones) declarados por los ficheros safetensors, un tamaño de 7,6 GB y licencia Apache 2.0.

Su relevancia es metodológica, no de producto: sirve como artefacto de investigación para estudiar cómo la corrupción sistemática de datos de demostración se traduce en sesgos de comportamiento en políticas visión-lenguaje-acción (VLA), y para construir defensas y detectores frente a envenenamiento de datos en robótica. La model card es explícita sobre el eje de perturbación, la etiqueta de escala y el conjunto de datos de entrenamiento (`lerobot_pos.x_05_sequential`), y enlaza una línea base limpia (`jiankimr/gr00t_libero10_clean`), lo que permite comparaciones controladas ataque/defensa.

El modelo acumula 9 descargas y 0 "likes" en el momento de redactar esta ficha, con fecha de creación y actualización del 20 de septiembre de 2026. No hay resultados de benchmarks publicados en la información disponible, ni idiomas declarados, ni detalles de arquitectura más allá de su procedencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada (ajuste fino del modelo fundacional robótico GR00T-N1.5, familia VLA; detalles internos no declarados en la model card) |
| Parámetros totales | 2.724.163.520 (≈2,72 B), dato real de los ficheros safetensors |
| Parámetros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio distribuye pesos en safetensors sin cuantización declarada) |
| Idiomas soportados | No disponible (la model card no declara idiomas; el modelo opera sobre instrucciones y observaciones del entorno robótico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | robotics |
| Tamaño del repositorio | 7,6 GB |
| Modelo base | nvidia/GR00T-N1.5-3B |
| Fecha de creación / actualización | 2026-09-20 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del checkpoint. Lo único verificable en la información proporcionada es que se trata de un ajuste fino del modelo `nvidia/GR00T-N1.5-3B`, etiquetado con las etiquetas `gr00t`, `gr00t_n1_5`, `robotics`, `libero` e `imitation-learning`. Es decir, un modelo de política entrenado por imitación para control robótico, con 2,72 B de parámetros efectivos en los pesos distribuidos y un pipeline declarado de robótica. Cualquier detalle sobre el VLM interno, la cabeza de acciones, el número de tokens de entrenamiento o la composición del dataset más allá de lo indicado no está disponible y no debe asumirse.

Lo que sí está documentado con precisión es el procedimiento de envenenamiento. El conjunto de entrenamiento es `lerobot_pos.x_05_sequential`, derivado de demostraciones de LIBERO-10 (el nombre del checkpoint sugiere las 10 tareas de la suite, aunque la model card no lo confirma). La perturbación se aplica sobre el eje x de la posición del efector final, con etiqueta de escala "05" que corresponde a alpha = 0,5 y patrón de inyección en onda cuadrada con semiciclo 1; la model card no especifica la unidad de ese semiciclo (pasos de control o fracción de trayectoria) ni la unidad de alpha, por lo que no puede afirmarse el desplazamiento físico resultante en centímetros. La existencia de una línea base limpia entrenada sobre datos sin perturbar (`jiankimr/gr00t_libero10_clean`) indica que el experimento está diseñado como comparación controlada entre política limpia y política envenenada.

## Capacidades

- Generación de acciones motrices para manipulación robótica a partir de demostraciones, mediante aprendizaje por imitación.
- Ejecución de tareas de la suite LIBERO-10 (manipulación de horizonte largo), en el dominio para el que fue ajustado.
- Procesamiento de observaciones e instrucciones propias del pipeline GR00T-N1.5 heredadas del modelo base.
- Reproducción controlada de un sesgo inducido: desplazamiento correlacionado en el eje x del efector final, útil para estudiar propagación de perturbaciones.
- Servir como artefacto de referencia positivo en experimentos de detección de envenenamiento y de atribución de comportamiento anómalo.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en envenenamiento de datos para robótica: el checkpoint permite medir el impacto de una perturbación secuencial conocida (eje x, alpha = 0,5, onda cuadrada de semiciclo 1) sobre la tasa de éxito en tareas LIBERO-10, comparando directamente contra `jiankimr/gr00t_libero10_clean` como control limpio.
- Desarrollo y validación de defensas: entrenar filtros de datos, técnicas de robustez o métodos de saneamiento y evaluar si recuperan el rendimiento de la política limpia sobre este mismo conjunto de datos.
- Detección de backdoors y sesgos en políticas: usar el checkpoint como muestra etiquetada positivamente para calibrar detectores de comportamiento anómalo basados en estadísticas de trayectoria del efector final.
- Red-teaming de pipelines de entrenamiento: verificar si el proceso de curación de datos de un equipo detecta demostraciones con ruido sistemático antes de que contaminen la política final.
- Auditoría de linaje de modelos: trazar cómo un conjunto de datos concreto (`lerobot_pos.x_05_sequential`) se propaga hasta un checkpoint publicable y qué metadatos quedan registrados.
- Docencia y material de referencia: ilustrar en cursos de aprendizaje por imitación cómo una perturbación de baja amplitud y patrón determinista degrada selectivamente una dimensión de acción.
- Reproducibilidad experimental: al estar publicados tanto el checkpoint envenenado como la línea base limpia, se puede replicar la comparación sin reentrenar desde cero.
- Estudio de transferencia de sesgos entre tareas: comprobar si el sesgo en el eje x inducido en LIBERO-10 se manifiesta de forma uniforme en las distintas tareas de la suite o solo en subconjuntos concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito en LIBERO-10, ni comparaciones numéricas contra la línea base limpia, ni métricas de desviación del efector final.

## Requisitos de hardware

- VRAM estimada para los pesos según el recuento real de parámetros (2.724.163.520), sin contabilizar activaciones, búferes de la cabeza de acciones ni memoria del runtime: ≈10,9 GB en fp32, ≈5,45 GB en bf16/fp16, ≈2,72 GB en int8 y ≈1,36 GB en int4. Son cálculos aritméticos sobre el número de parámetros, no mediciones publicadas para este checkpoint.
- El tamaño del repositorio (7,6 GB) es coherente con pesos en media/precisión alta y con ficheros auxiliares, no con una única copia en bf16.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño de pesos, un modelo de 2,72 B es desplegable en GPUs de consumo con 8-12 GB de VRAM o más en bf16, pero la VRAM total dependerá del pipeline VLA de GR00T-N1.5 (codificador visual, preprocesado y cabeza de acciones), dato no declarado aquí.
- Opciones de despliegue: no disponibles en la información proporcionada. El nombre del conjunto de datos de entrenamiento (`lerobot_pos.x_05_sequential`) y las etiquetas del repositorio apuntan al ecosistema GR00T/LeRobot, pero la model card no confirma instrucciones ni herramientas de carga.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Formato |
|---|---|---|---|---|---|
| `jiankimr/gr00t1.5n_libero10_x05` | 2.724.163.520 (≈2,72 B) | No disponible | Política GR00T-N1.5 ajustada sobre LIBERO-10 con perturbación secuencial en el eje x (alpha = 0,5) | Apache 2.0 | safetensors |
| `jiankimr/gr00t_libero10_clean` | No disponible | No disponible | Línea base limpia del mismo experimento, sin perturbación declarada | No disponible en la información proporcionada | No disponible |
| `nvidia/GR00T-N1.5-3B` | El nombre del checkpoint base indica ~3 B; el recuento real de este derivado es 2.724.163.520 | No disponible | Modelo fundacional robótico original, sin ajuste sobre LIBERO-10 | No disponible en la información proporcionada | No disponible |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- Es un checkpoint envenenado de forma intencionada. Reproduce un sesgo aprendido en el eje x de la posición del efector final; no debe utilizarse como política de referencia ni como componente de producto.
- Riesgo de seguridad física: desplegar esta política en hardware real puede provocar trayectorias erróneas con consecuencias sobre el robot, el entorno o las personas.
- La magnitud física del sesgo no puede cuantificarse con la información disponible: alpha = 0,5 y semiciclo = 1 se declaran sin unidades.
- No hay idiomas declarados, ni contexto especificado, ni datos sobre generalización fuera de LIBERO-10.
- No se publican tasas de éxito ni curvas de evaluación, por lo que se desconoce el grado exacto de degradación respecto a la línea base limpia.
- La licencia Apache 2.0 permitiría técnicamente uso comercial, pero el propósito declarado del artefacto es la investigación sobre envenenamiento; usarlo en producción contraviene el sentido del experimento y traslada un riesgo no evaluado.
- Trazabilidad limitada: 9 descargas y 0 "likes" implican prácticamente ninguna validación externa por parte de la comunidad.
- Al derivar del modelo base `nvidia/GR00T-N1.5-3B`, hereda cualquier limitación, sesgo o restricción adicional de dicho modelo base, que no está documentada en la información proporcionada.
- La model card no especifica el procedimiento de carga, las dependencias ni la versión del código de entrenamiento, lo que dificulta la reproducción exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jiankimr/gr00t1.5n_libero10_x05
- Línea base limpia: https://huggingface.co/jiankimr/gr00t_libero10_clean
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.5-3B
- Resultados de búsqueda web: no se ha recuperado ningún enlace relevante sobre este modelo. Las únicas entradas devueltas corresponden a medios locales alemanes sobre las islas de Föhr, Amrum y Halligen, sin relación con el modelo ni con robótica.
