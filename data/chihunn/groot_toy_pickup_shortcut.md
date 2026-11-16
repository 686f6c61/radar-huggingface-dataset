# chihunn/groot_toy_pickup_shortcut

## Resumen

GR00T N1.7 fine-tuned on toy pickup (toy_pickup_shortcut) es un ajuste fino del modelo fundacional de robotica NVIDIA GR00T-N1.7-3B, desarrollado por el usuario chihunn y publicado en Hugging Face. El modelo parte de la arquitectura de NVIDIA Cosmos y se especializa en una tarea concreta de manipulacion robotica: recoger un juguete (toy pickup) a partir de un subconjunto del dataset original con atajos visuales (visual-shortcut subset) de 300 episodios. Es, por tanto, un checkpoint de investigacion orientado a politicas viso-motoras, no un modelo de lenguaje general.

El ajuste se ha realizado con LeRobot, la libreria de Hugging Face para aprendizaje por imitacion en robotica. Siguiendo la receta por defecto de GR00T, se congelan el codificador visual y el modelo de lenguaje y se entrena unicamente la cabeza de accion (un diffusion transformer junto con los proyectores de estado/accion y el puente vision-lenguaje). El resultado es un modelo de 3.144.016.000 parametros (unos 3,14 mil millones) con pesos en safetensors y un repositorio de 12,6 GB.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de ajuste fino de un modelo fundacional de robotica sobre una tarea de picking con dos camaras (frontal y de muneca), estado de 8 dimensiones y accion de 7 dimensiones. No es un modelo de proposito general ni un asistente conversacional; su interes esta en la evaluacion de politicas de manipulacion y en el estudio de atajos visuales en datos de robotica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (basada en NVIDIA Cosmos); codificador visual + modelo de lenguaje congelados y cabeza de accion diffusion transformer entrenada |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF/cuantizadas indicadas) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (license: other) |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de NVIDIA GR00T N1.7-3B, un modelo fundacional de robotica construido sobre NVIDIA Cosmos. La receta de ajuste congela el codificador visual y el modelo de lenguaje, y entrena exclusivamente la cabeza de accion: un diffusion transformer junto con los proyectores de estado y accion y el puente vision-lenguaje (VL bridge). Esta estrategia reduce el coste de entrenamiento y preserva las representaciones generales del modelo base.

El ajuste se realizo con LeRobot sobre el subconjunto de atajos visuales del dataset de toy pickup, compuesto por 300 episodios. La configuracion concreta incluye la etiqueta de embodiment `new_embodiment`, dos camaras (frontal y de muneca), estado de 8 dimensiones y accion de 7 dimensiones, con chunks de 16 pasos y acciones absolutas. El entrenamiento uso batch size 32, 30.000 pasos (el checkpoint publicado corresponde al paso 30000), optimizador AdamW con learning rate 1e-4, schedule coseno con 5% de warmup, pesos en fp32 con autocast bf16 y aumento de datos con ColorJitter. No se detalla el numero total de tokens ni la composicion completa del dataset mas alla de los 300 episodios indicados.

## Capacidades

- Generacion de acciones motoras para manipulacion robotica: produce secuencias de accion de 7 dimensiones a partir de observaciones visuales y de estado.
- Politica viso-motora con dos camaras: integra entrada frontal y de muneca para la tarea de recogida de juguetes.
- Aprendizaje por imitacion: entrenado sobre demostraciones del dataset de toy pickup (300 episodios, subconjunto con atajos visuales).
- Control con chunks de accion: emite bloques de 16 pasos con acciones absolutas.
- Integracion con LeRobot: evaluacion mediante `lerobot-eval`.
- No se documentan capacidades de lenguaje natural, tool calling, agentes multi-paso, vision general, audio ni razonamiento simbolico; el modelo esta orientado a robotica.

## Casos de uso

- Evaluacion de politicas de manipulacion: usar `lerobot-eval` con este checkpoint para medir el exito de la tarea de toy pickup en un entorno simulado o real, comparando el efecto de los atajos visuales frente al dataset completo.
- Investigacion sobre atajos visuales: analizar como un modelo entrenado sobre un subconjunto con correlaciones espurias generaliza (o falla) en escenarios de recogida, sirviendo de base para estudios de robustez.
- Prototipado rapido de tareas de picking: partir de este ajuste para una tarea de recogida concreta y reentrenar la cabeza de accion con nuevos datos propios, aprovechando que el backbone queda congelado.
- Benchmark interno de modelos fundacionales de robotica: comparar GR00T N1.7 ajustado frente a otras politicas de imitacion en la misma tarea y configuracion de camaras.
- Docencia y reproduccion: ejemplo reproducible de ajuste fino con LeRobot, con hiperparametros y pasos documentados, util para formar a investigadores en pipelines de robotica.
- Base para ablation studies: evaluar el impacto de congelar el codificador visual y el modelo de lenguaje frente a ajustar capas adicionales en tareas de manipulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3.144.016.000 parametros, una inferencia en bf16/fp16 requeriria aproximadamente 6,3 GB solo para pesos, a lo que hay que sumar activaciones y buffers de la cabeza de accion y del codificador visual.
- GPU recomendadas: no disponible; por tamano, cabria esperar GPU con al menos 16-24 GB de VRAM para bf16, aunque no se confirma en la informacion.
- Compatibilidad con GPU de consumo: no confirmada; el tamano del modelo sugiere que podria ejecutarse en GPU de consumo de gama alta, pero no hay datos oficiales.
- Opciones de despliegue: LeRobot (`lerobot-eval`) es la via documentada. No se indican integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no son adecuadas para un modelo de robotica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chihunn/groot_toy_pickup_shortcut | 3.144.016.000 | no disponible | Toy pickup (robotica) | NVIDIA Open Model License | Hugging Face |
| nvidia/GR00T-N1.7-3B | no disponible en la informacion | no disponible | Modelo fundacional de robotica | NVIDIA Open Model License | Hugging Face |
| Otras politicas de robotica (p. ej. basadas en LeRobot) | no disponible | no disponible | Manipulacion | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo esta ajustado para la tarea de toy pickup; no debe esperarse generalizacion a otras tareas sin reentrenamiento.
- Riesgo de atajos visuales: el propio nombre del dataset (visual-shortcut subset) indica que el modelo puede apoyarse en correlaciones espurias en lugar de senales causales, lo que compromete la robustez fuera de la distribucion de entrenamiento.
- Numero reducido de episodios: 300 episodios es un volumen limitado, lo que aumenta el riesgo de sobreajuste.
- Sin datos de benchmarks ni de evaluacion publicados: no hay evidencia cuantitativa de exito en tarea.
- Idiomas y contexto no documentados: al ser un modelo de robotica, no aplican capacidades linguisticas generales.
- Restricciones de licencia: NVIDIA Open Model License; es necesario revisar los terminos para uso comercial y las obligaciones de atribucion (LICENSE y NOTICE).
- Sin datos de sesgos, alucinacion o comportamiento en produccion: no disponible.
- Checkpoint de investigacion: 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/chihunn/groot_toy_pickup_shortcut
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
