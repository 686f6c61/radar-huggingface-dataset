# logan7000/cogrpo-decoupled-qwen25-3b-rephr-x-llama32-3b-math345-seed43-logs

## Resumen

Este repositorio no contiene un modelo entrenado, sino los registros de texto (logs) de una ejecución de entrenamiento con co-GRPO (una variante de Group Relative Policy Optimization con datos desacoplados) sobre dos modelos de 3.000 millones de parámetros: Qwen2.5-3B y Llama-3.2-3B-Instruct. La ejecución se realizó sobre problemas matemáticos del dataset MATH de niveles 3 a 5, con semilla 43, y consta de 136 pasos de entrenamiento registrados en el trabajo de Slurm `j1799439`. El autor, `logan7000`, publica el directorio de la ejecución con `train.log` por grupo, scripts de lanzamiento, `trainer_state.json`, argumentos de entrenamiento y logs de texto de Weights & Biases.

El interés del artefacto es de trazabilidad y reproducibilidad experimental: permite inspeccionar la curva de entrenamiento, la configuración del entrenador y los checkpoints seleccionados (mejor y final) para cada grupo, sin incluir los pesos binarios ni los ficheros binarios de wandb. No es, por tanto, un modelo desplegable ni una ficha de inferencia al uso.

La información pública disponible es muy limitada: cero descargas, cero likes, sin licencia declarada, sin idiomas declarados y sin pipeline asociado. Todo lo que sigue se ciñe a lo que figura en la model card y en los metadatos del repositorio; cualquier dato no presente se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene logs de entrenamiento, no pesos) |
| Parametros totales | no disponible como modelo propio; los modelos entrenados en la ejecución son Qwen2.5-3B y Llama-3.2-3B-Instruct (3.000 millones cada uno) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no hay pesos; los artefactos son ficheros de texto y JSON (`train.log`, `trainer_state.json`, `training_args.json`, `selection.txt`) |

## Arquitectura y entrenamiento

El contenido del repositorio documenta una ejecución de co-GRPO con datos desacoplados, en la que se entrenan de forma conjunta o coordinada dos modelos base: Qwen2.5-3B sobre problemas reformulados (rephrased) y Llama-3.2-3B-Instruct sobre problemas de MATH de niveles 3 a 5. La ejecución consta de 136 pasos y se lanzó como trabajo de Slurm con identificador `j1799439`, con semilla 43. El paquete incluye el script de lanzamiento y su log, una comprobación de entorno, `trainer_state.json`, los argumentos del entrenador (`training_args.json`) y los logs de texto de wandb; se excluyen explícitamente los ficheros binarios de wandb y se anonimizan rutas, nodos y cuentas con marcadores como `<path>`, `<node>` y `<user>`.

El directorio `packaged/` contiene el fichero `selection.txt`, que indica qué checkpoints se consideran mejor y final para el grupo A (Qwen) y el grupo B (Llama), junto con el `trainer_state.json` y los argumentos de entrenamiento de los checkpoints seleccionados y los logs empaquetados al final de la ejecución. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de la referencia a MATH niveles 3-5, ni si hubo fases de RLHF o DPO adicionales.

## Capacidades

- El repositorio no expone un modelo con capacidades de inferencia; contiene únicamente registros de una ejecución de entrenamiento.
- Trazabilidad de entrenamiento: permite reconstruir la evolución de la pérdida y las métricas por grupo a partir de los `train.log` y de los logs de texto de wandb.
- Auditoría de configuración: `training_args.json` y `trainer_state.json` documentan hiperparámetros, estado del entrenador y pasos ejecutados.
- Selección de checkpoints: `selection.txt` identifica los checkpoints mejor y final de cada grupo (Qwen y Llama).
- Reproducibilidad parcial: el script de lanzamiento, el log del lanzador y la comprobación de entorno permiten reconstruir el setup, aunque con rutas y nodos anonimizados.
- No se declaran capacidades de generación de texto, código, matemáticas, visión, tool calling ni agentes para este repositorio.

## Casos de uso

- Reproducción de experimentos de RL: usar los `training_args.json` y el script de lanzamiento para replicar la configuración de co-GRPO con datos desacoplados sobre MATH niveles 3-5 con semilla 43.
- Análisis de curvas de aprendizaje: extraer de los `train.log` por grupo la evolución de recompensas y pérdidas para comparar el comportamiento de Qwen2.5-3B frente a Llama-3.2-3B-Instruct bajo el mismo esquema de optimización.
- Depuración de trabajos en Slurm: los ficheros `slurm/` con stdout y stderr permiten diagnosticar fallos de asignación de recursos, errores de entorno o problemas de comunicación entre grupos.
- Auditoría de selección de checkpoints: revisar `selection.txt` y el `trainer_state.json` empaquetado para verificar con qué criterio se eligieron los checkpoints mejor y final de cada grupo.
- Docencia e investigación en optimización de políticas: emplear los logs como material de estudio de GRPO cooperativo y de la técnica de datos desacoplados en problemas matemáticos.
- Comparación de metodologías de entrenamiento: contrastar esta ejecución (136 pasos, semilla 43) con otras ejecuciones del mismo autor o de terceros que compartan esquema, usando los logs como evidencia cuantitativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica para inferencia: el repositorio no contiene pesos, por lo que no requiere VRAM para desplegar un modelo.
- Para reproducir el entrenamiento: se desconoce el hardware exacto; los logs de Slurm (`slurm/`) y la comprobación de entorno incluidos en el paquete son la única referencia para reconstruir la asignación de nodos y recursos.
- Modelos base implicados: Qwen2.5-3B y Llama-3.2-3B-Instruct, ambos de 3.000 millones de parámetros; el entrenamiento con GRPO de dos grupos requiere, como mínimo, memoria suficiente para los dos modelos y sus copias de referencia, aunque no se especifican cifras en la información disponible.
- Opciones de despliegue: no disponibles para este repositorio; para los modelos base subyacentes habría que consultar sus respectivas fichas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Tipo de artefacto | Modelos implicados | Pasos | Licencia | Descargas |
|---|---|---|---|---|---|
| logan7000/cogrpo-decoupled-qwen25-3b-rephr-x-llama32-3b-math345-seed43-logs | Logs de entrenamiento | Qwen2.5-3B y Llama-3.2-3B-Instruct | 136 | no disponible | 0 |
| Qwen2.5-3B (modelo base) | Pesos de modelo | Qwen2.5-3B | no aplica | no disponible en esta ficha | no disponible en esta ficha |
| Llama-3.2-3B-Instruct (modelo base) | Pesos de modelo | Llama-3.2-3B-Instruct | no aplica | no disponible en esta ficha | no disponible en esta ficha |

La comparación directa con otros repositorios de logs del mismo autor o de la comunidad no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni un modelo ejecutable; no puede usarse para inferencia ni para evaluación directa.
- No se declara licencia, lo que impide determinar las condiciones de uso comercial o de redistribución de los artefactos.
- Los logs están anonimizados con marcadores (`<path>`, `<node>`, `<user>`), lo que limita la reproducción exacta del entorno original.
- Se excluyen los ficheros binarios de wandb, de modo que solo se conservan los logs de texto; las visualizaciones y métricas binarias originales no están disponibles.
- La ejecución es única (semilla 43, 136 pasos), por lo que no permite extraer conclusiones sobre varianza entre semillas ni sobre robustez del método.
- El alcance se restringe a problemas de MATH de niveles 3 a 5; no hay evidencia de generalización a otros dominios o niveles de dificultad.
- No hay información sobre sesgos, alucinación o comportamiento multilingüe de los modelos entrenados en esta ejecución.
- Cualquier uso en producción requeriría obtener por separado los checkpoints resultantes, que no forman parte de este repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/logan7000/cogrpo-decoupled-qwen25-3b-rephr-x-llama32-3b-math345-seed43-logs
- Perfil del autor: https://huggingface.co/logan7000
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Modelo base Llama-3.2-3B-Instruct: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Dataset MATH (referenciado en la model card): no disponible en la información proporcionada
- Paper de GRPO: no disponible en la información proporcionada
- Repositorio de código del método co-GRPO: no disponible en la información proporcionada
