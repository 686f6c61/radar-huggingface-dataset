# Shiki42/ctr-pi05-pick-dual-bottles-hole-ctr50-e185-step10000

## Resumen

`ctr-pi05-pick-dual-bottles-hole-ctr50-e185-step10000` es un checkpoint de inferencia de robótica publicado por el usuario Shiki42 en HuggingFace. Corresponde al experimento denominado E185 dentro de la serie CTR, ejecutado sobre el benchmark RoboTwin, y consiste en un ajuste fino mediante LoRA del modelo PI0.5 (familia de modelos visión-lenguaje-acción, VLA) durante 10.000 pasos de optimizador. La tarea objetivo es la manipulacion descrita como "agarrar dos botellas y cavar un agujero" (抓双瓶挖洞), con un presupuesto de 50 escenas fuente equivalentes y una demostración por escena.

El checkpoint se publicó el 27 de septiembre de 2026, a petición del autor, para preservar los artefactos antes del apagado de la máquina de entrenamiento. El repositorio ocupa 6,3 GB e incluye los parámetros del modelo, los activos de normalización y los metadatos; el estado del optimizador se excluyó deliberadamente. Cada archivo va acompañado de su hash SHA-256 en el fichero `SHA256SUMS`.

Su relevancia es fundamentalmente de investigación: se trata de un artefacto de reproducibilidad para un experimento comparativo de políticas VLA en manipulación robótica, no de un modelo de propósito general. La model card no documenta resultados de evaluación, y remite al registro del experimento CTR E185, que no forma parte de la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; el nombre del repositorio indica un ajuste LoRA sobre PI0.5 (modelo visión-lenguaje-acción) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la model card está parcialmente en chino e inglés; no se declaran idiomas del modelo) |
| Licencia | `other` (sin texto de licencia especificado en la información disponible) |
| Formato de pesos | No disponible explícitamente; el repositorio contiene un checkpoint de inferencia con parámetros, `assets/normalization` y metadatos |
| Pipeline declarado | `robotics` |
| Etiquetas | `robotics`, `ctr`, `robotwin` |
| Tamaño del repositorio | 6,3 GB |
| Paso de optimizador | 10.000 |
| Versión de datos de entrenamiento | 10K pasos, LoRA, 50 escenas fuente, una demostración por escena |
| Fecha de publicación | 27 de septiembre de 2026 |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo. El identificador del repositorio (`ctr-pi05-...`) y la descripción del experimento ("PI0.5 LoRA10K训练", es decir, entrenamiento LoRA de PI0.5 durante 10K pasos) indican que se parte del modelo PI0.5 como base preentrenada y que el ajuste se realiza mediante adaptadores de bajo rango (LoRA) en lugar de un reentrenamiento completo. No se especifica el rango de LoRA, los módulos objetivo, la precisión de entrenamiento ni la composición exacta del dataset.

El protocolo experimental declarado es comparativo y controlado: 50 escenas fuente equivalentes, una única demostración por escena y un presupuesto fijo de 10.000 pasos de optimizador. La pregunta de investigación registrada es la tasa de éxito en bucle cerrado de la tarea de cavar un agujero con CTR50 bajo ese presupuesto. No se documentan en la información disponible detalles sobre el esquema de entrenamiento (tipo de pérdida, uso de RLHF/DPO, aumento de datos o currículum), ni innovaciones técnicas adicionales.

## Capacidades

- Control robótico en bucle cerrado para una tarea de manipulación concreta: agarrar dos botellas y cavar un agujero (抓双瓶挖洞).
- Ejecución de políticas de manipulación derivadas de un modelo visión-lenguaje-acción (entrada visual y de estado, salida de acciones).
- Adaptación mediante LoRA al dominio específico del benchmark RoboTwin bajo el protocolo CTR50.
- Capacidad de ser evaluado como checkpoint intermedio (paso 10.000) dentro de una comparativa de presupuestos de datos.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso y capacidades multilingües: no disponible (no se declaran, y no son capacidades propias de una política VLA de manipulación).
- Modo "thinking", visión general, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Reproducción de experimentos en RoboTwin: cargar el checkpoint y evaluar la tasa de éxito en bucle cerrado de la tarea de doble botella y agujero, verificando la integridad de los archivos mediante `SHA256SUMS`.
- Estudio de eficiencia de datos en políticas VLA: comparar este checkpoint (50 escenas, una demostración por escena, 10K pasos) con variantes del mismo barrido experimental para aislar el efecto del presupuesto de datos.
- Punto de partida para nuevos ajustes LoRA: reutilizar los pesos como inicialización en tareas de manipulación relacionadas con agarre de objetos cilíndricos o inserción en huecos, reduciendo el coste frente a partir del modelo base.
- Investigación en ajuste de bajo rango sobre modelos VLA: analizar qué se conserva y qué se degrada al adaptar un modelo visión-lenguaje-acción con LoRA a una única tarea.
- Validación de pipelines de inferencia robótica: integrar el checkpoint en un bucle de simulación para medir latencia de política por paso de control y estabilidad de la normalización de observaciones.
- Auditoría de reproducibilidad: usar los hashes SHA-256 para verificar que los artefactos publicados coinciden con los del host de entrenamiento, en un contexto de preservación tras el apagado de la máquina.
- Docencia y formación en robótica: ejemplo real de artefacto de investigación con checkpoint de inferencia, metadatos y normalización separados del estado del optimizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card indica únicamente que la pregunta experimental es la tasa de éxito en bucle cerrado de la tarea CTR50 y que el estado de evaluación y las advertencias están registrados en el registro del experimento CTR E185, al cual no se proporciona acceso ni cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa derivada del tamaño del repositorio (6,3 GB, que incluye parámetros, activos de normalización y metadatos), un checkpoint en precisión de 16 bits de este orden de magnitud requeriría aproximadamente entre 8 y 12 GB de VRAM en inferencia, sin contar memoria para el bucle de simulación. Esta cifra es una estimación, no un dato publicado.
- GPU recomendadas: no disponible. Por el orden de magnitud del checkpoint, es plausible su ejecución en GPUs de consumo con 16-24 GB (por ejemplo, RTX 4090, RTX 3090), aunque no está confirmado por el autor.
- ¿Cabe en GPU de consumo? Probablemente sí en modelos con 16 GB o más, según la estimación anterior; no confirmado.
- Opciones de despliegue: no disponible. Los runners habituales de modelos de lenguaje (vLLM, llama.cpp, Ollama, TGI) no son aplicables a una política visión-lenguaje-acción de manipulación; se requiere un entorno de inferencia robótica compatible con PI0.5 y con la simulación RoboTwin.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificables para una comparativa cuantitativa. La información proporcionada no incluye cifras de rendimiento de este checkpoint ni de alternativas.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ctr-pi05-pick-dual-bottles-hole-ctr50-e185-step10000 | Checkpoint LoRA sobre PI0.5 para manipulación (RoboTwin) | No disponible | No disponible | `other` | Pesos abiertos en HuggingFace (6,3 GB) |
| PI0.5 (modelo base) | Modelo visión-lenguaje-acción | No disponible en esta información | No disponible | No disponible | No disponible en esta información |
| Otros checkpoints del barrido CTR sobre RoboTwin | Checkpoints LoRA comparables | No disponible | No disponible | No disponible | No disponible en esta información |

## Limitaciones y advertencias

- Artefacto de investigación, no un modelo de producción: se publica para preservar checkpoints antes del apagado del host, sin garantía de soporte, mantenimiento ni evaluación publicada.
- Especialización extrema: al ser un ajuste LoRA de 10K pasos sobre una única tarea, es esperable una degradación de capacidades generales del modelo base fuera de esa tarea. No hay datos que cuantifiquen esa pérdida.
- Estado del optimizador excluido: el repositorio no permite reanudar el entrenamiento desde el punto exacto; solo sirve para inferencia o para reiniciar un ajuste.
- Sin resultados de evaluación accesibles: no se puede afirmar ningún nivel de tasa de éxito en bucle cerrado; la evidencia remite a un registro externo (E185) no incluido.
- Licencia `other` sin texto especificado: no se puede determinar si el uso comercial está permitido, ni las obligaciones de atribución. Es imprescindible contactar con el autor antes de cualquier uso comercial.
- Riesgo de alucinación en el sentido clásico de modelos de lenguaje: no aplicable directamente, pero sí existe riesgo de fallo silencioso de la política en estados fuera de la distribución de entrenamiento (50 escenas, una demostración por escena), lo que limita la generalización.
- Idiomas y contexto: no declarados; la model card está parcialmente en chino, lo que puede dificultar la reproducibilidad para equipos que no lo lean.
- Dependencia del entorno: el rendimiento depende del simulador RoboTwin, de la configuración de normalización incluida en `assets/normalization` y de la versión del código de inferencia, ninguno de los cuales está fijado en la información disponible.
- Fecha de publicación futura respecto al conocimiento del redactor: conviene verificar la vigencia del repositorio y de sus dependencias.

## Enlaces

- HuggingFace: https://huggingface.co/Shiki42/ctr-pi05-pick-dual-bottles-hole-ctr50-e185-step10000
- Registro del experimento CTR E185: referenciado en la model card, no enlazado ni disponible en la información proporcionada.
- Paper, blog, repositorio de código o demo: no disponible.
