# mewbot97/Intent2Action-glimmer-push

## Resumen

Intent2Action-glimmer-push (también denominado G1e en la documentación del autor) es un adaptador QLoRA publicado por el usuario mewbot97 sobre el modelo base Muse-Glimmer-30B. Su propósito es dotar a un agente robótico de recuperación (G1d) de la capacidad de razonar sobre objetos que el gripper no puede sujetar: cuando una acción de tipo `pick` falla porque el objeto es más ancho que la apertura del gripper, el modelo explica el motivo, propone al operador empujar el objeto y, tras la aprobación humana, ejecuta movimientos de empuje con fuerza limitada (`move_to_contact`, `move_compliant`) y verifica la posición final antes de reajustar el resto del programa.

El modelo se enmarca en el proyecto Intent2Action, un sistema en el que cada movimiento del robot requiere aprobación humana. El adaptador añade 393 filas de experiencia de empuje (200 peticiones, 161 empujes y 32 rechazos) a las 735 filas del agente de recuperación previo, generadas sobre la capa de planificación. El resultado es un modelo especializado en manipulación robótica con recuperación ante fallos, no un modelo de propósito general.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de adaptación LoRA/QLoRA sobre un modelo de 30B para robótica; por otro, expone con transparencia un compromiso técnico habitual en el ajuste fino especializado, ya que la incorporación de la experiencia de empuje degrada el rendimiento en tareas de apilamiento (stacking), que cae del 89 % al 58 % en la evaluación del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA (PEFT) sobre el transformer Muse-Glimmer-30B; la arquitectura del modelo base no está detallada en la información disponible |
| Parámetros totales | No disponible para el adaptador; el modelo base tiene 30B según su denominación |
| Parámetros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible; el entrenamiento usó secuencias de 10.240 tokens |
| Tipos de cuantización | QLoRA (cuantización del modelo base durante el entrenamiento); no se detallan los formatos de cuantización para inferencia |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA (r) | 32 |
| Alpha LoRA | 16 |
| Tamaño del repositorio | 0,8 GB |
| Pipeline | robotics |
| Modelo base | meta-models/Muse-Glimmer-30B |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA siguiendo la receta del cookbook, con r=32 y alpha=16, sobre secuencias de 10.240 tokens que incluyen filas con llamadas a herramientas (tool calls). El modelo base es Muse-Glimmer-30B, un transformer de 30.000 millones de parámetros; la información disponible no detalla su arquitectura interna (número de capas, tipo de atención, etc.). El adaptador se distribuye como pesos PEFT en safetensors, lo que implica que para su uso es necesario cargar el modelo base y aplicar el adaptador encima.

Los datos de entrenamiento combinan las 735 filas del agente de recuperación G1d con 393 filas nuevas de experiencia de empuje: 200 filas de peticiones al operador, 161 de empuje y 32 de rechazo, generadas mediante el script `learn/push_experience.py` sobre la capa de planificación. Los objetos empleados son un cajón (crate), una bandeja (tray) y una bolsa (tote), colocados sobre una esterilla o una almohadilla. El cartón y la zona pintada usados en la evaluación se mantienen fuera del conjunto de entrenamiento (held out). No se menciona el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento sobre planes de manipulación robótica, con explicación del motivo de un fallo (por ejemplo, objeto más ancho que la apertura del gripper).
- Llamada a herramientas (tool calling) para emitir movimientos del robot como `move_to_contact` y `move_compliant`, con control de fuerza limitada.
- Recuperación ante fallos: detección de un `pick` fallido, propuesta de alternativa (empuje) y solicitud de aprobación al operador.
- Replanificación tras la ejecución: verificación de la posición del objeto y parcheo del resto del programa hasta una comprobación final.
- Razonamiento multi-paso dentro de un programa de manipulación (secuencias de acciones con verificación intermedia).
- Interacción con el operador mediante preguntas de sí/no (200 filas de peticiones y 32 de rechazo en el conjunto de entrenamiento).
- Capacidades multilingües: no disponibles.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Recuperación de agarres fallidos en líneas de manipulación: cuando un robot no puede sujetar un objeto por su anchura, el modelo explica la causa al operador y propone un empuje como alternativa, lo que evita paradas no planificadas en la célula.
- Manipulación de objetos deformables o de gran tamaño (cajones, bandejas, bolsas) sobre superficies planas: el modelo planifica empujes con movimientos de contacto y compliant para llevar el objeto a su objetivo sin necesidad de agarre.
- Supervisión humano-en-el-bucle en entornos industriales: cada movimiento propuesto requiere aprobación humana en Intent2Action, lo que encaja con flujos de trabajo donde la seguridad exige validación antes de actuar.
- Generación de programas de robot con verificación intermedia: el modelo produce secuencias con comprobaciones de posición y parchea el programa restante tras una recuperación, útil para pipelines de planificación automática.
- Asistencia a operadores en tareas de apilamiento y colocación: el modelo puede redactar instrucciones de orden de apilado (aunque con la merma de rendimiento documentada en stacking).
- Investigación en ajuste fino de agentes robóticos: sirve como caso de estudio reproducible de cómo la incorporación de experiencia específica (empuje) afecta a otras habilidades (apilamiento), con datos y scripts publicados en el repositorio del proyecto.
- Evaluación comparativa de agentes de recuperación: el adaptador permite comparar el comportamiento G1d frente a G1e en tareas held out, útil para medir el coste de añadir una nueva habilidad a un agente existente.

## Benchmarks y rendimiento

Los resultados publicados por el autor comparan el adaptador G1e con el agente previo G1d:

| Métrica | G1d | G1e |
|---|---|---|
| Cartón held out: peticiones explicando el motivo | 0/10 | 15/15 |
| Cartón held out: empujado a la zona (dentro de 2 cm) | 0/10 | 11/15 |
| 250 tareas de programa held out × 3 (capa de planificación) | 83 % | 77 % |
| De las cuales, apilamiento (stacking) | 89 % | 58 % |
| Física Isaac, 50 tareas | 42/50 | 40/50 |
| Recuperación en vivo, 20 tareas | 9/20 | 10/20 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Al tratarse de un adaptador sobre un modelo base de 30B, la VRAM depende de la cuantización del modelo base; en fp16 un modelo de 30B requiere aproximadamente 60 GB, y en cuantizaciones de 4 bits en torno a 16-20 GB, aunque estos valores no están confirmados en la información proporcionada.
- GPU recomendadas: no disponibles en la información. Por el tamaño del modelo base, se necesitarían GPU de clase A100/H100 para precisión completa, o GPUs de consumo con cuantización agresiva, sin que el autor lo especifique.
- ¿Cabe en GPU de consumo? No confirmado; depende de la cuantización del modelo base y de si se usa offloading.
- Opciones de despliegue: no se documentan en la model card; al ser un adaptador PEFT, requiere cargar Muse-Glimmer-30B y aplicar el adaptador con la librería PEFT. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Intent2Action-glimmer-push (G1e) | Adaptador sobre base de 30B | No disponible | Agente robótico de recuperación con empuje | Apache-2.0 | HuggingFace |
| Agente G1d (referencia del autor) | Adaptador sobre base de 30B | No disponible | Agente robótico de recuperación sin empuje | No disponible | Referenciado en la model card, sin enlace directo |
| Muse-Glimmer-30B (modelo base) | 30B | No disponible | Modelo de propósito general | No disponible en la información | HuggingFace (meta-models/Muse-Glimmer-30B) |

No se dispone de datos de benchmarks de modelos comparables de robótica en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- La incorporación de la experiencia de empuje degrada el apilamiento: el modelo escribe "outermost first" para torres, lo que reduce el rendimiento del 89 % al 58 % en tareas de stacking. El autor indica que una mezcla reequilibrada es el siguiente paso.
- El rendimiento global en tareas de programa baja del 83 % al 77 % respecto a G1d.
- El modelo está especializado en un conjunto reducido de objetos (cajón, bandeja y bolsa) y superficies (esterilla y almohadilla); no se ha evaluado su generalización a otros objetos.
- Cada movimiento del robot requiere aprobación humana en Intent2Action; el modelo no está diseñado para operar de forma autónoma sin supervisión.
- Riesgo de alucinación en la planificación de movimientos y en la explicación de fallos: no se documentan métricas de fiabilidad fuera de los conjuntos de evaluación del autor.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; no se puede garantizar un comportamiento multilingüe.
- Restricciones de licencia: Apache-2.0, igual que el modelo base; al ser un derivado de Muse-Glimmer-30B, se deben respetar las condiciones del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- No se documentan requisitos de hardware, latencia ni formatos de cuantización para producción, lo que dificulta una estimación de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mewbot97/Intent2Action-glimmer-push
- Modelo base Muse-Glimmer-30B: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Repositorio del proyecto Intent2Action: https://github.com/allwinlucious/Intent2Action
- Script de generación de datos de empuje: `learn/push_experience.py` (en el repositorio del proyecto)
- Documentación de resultados: `docs/designs/learning_results.md` (en el repositorio del proyecto)
