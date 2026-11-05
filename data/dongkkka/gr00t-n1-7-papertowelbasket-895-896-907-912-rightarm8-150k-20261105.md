# Dongkkka/GR00T-N1.7-PaperTowelBasket-895-896-907-912-RightArm8-150k-20261105

## Resumen

GR00T-N1.7-PaperTowelBasket-895-896-907-912-RightArm8-150k-20261105 es un ajuste fino (fine-tuning) del modelo fundacional de robotica NVIDIA GR00T-N1.7-3B, publicado por el usuario Dongkkka en HuggingFace. El modelo esta especializado en una unica tarea de manipulacion: coger un rollo de papel de cocina de una cesta, empleando exclusivamente el brazo derecho con siete articulaciones mas pinza. No se trata de un modelo de lenguaje general, sino de una politica visomotora (vision-language-action) entrenada por imitacion sobre grabaciones propias.

El entrenamiento se plantea como un proceso largo y reanudable, con un objetivo de 150.000 pasos de optimizador y checkpoints publicados en los hitos de 30k, 60k, 90k, 120k y 150k. Cada checkpoint incluye estado del optimizador, scheduler, RNG, procesador, normalizacion, mapeo de embodiment y checksums, lo que facilita la reproducibilidad. El modelo se apoya en la arquitectura y los pesos preentrenados de GR00T-N1.7-3B de NVIDIA, del que hereda la licencia NVIDIA Open Model License.

Su relevancia es acotada: es un artefacto de investigacion y reproducibilidad para una tarea concreta, no un modelo listo para produccion. El propio autor advierte de que no se ha establecido rendimiento con robot alimentado ni preparacion para despliegue, y que el checkpoint de mejor validacion fija esta pendiente. El repositorio figura con 0 GB y 0 descargas en el momento de la consulta, lo que sugiere que los pesos pueden no estar aun subidos o que el artefacto es meramente referencial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de NVIDIA GR00T-N1.7-3B; detalles internos no disponibles |
| Parametros totales | 3B (heredados del modelo base nvidia/GR00T-N1.7-3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (ventana de observacion multimodal; chunk de salida de 24 pasos a 15 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones son texto; el modelo card indica una instruccion por grabacion completa) |
| Licencia | NVIDIA Open Model License (license: other en HuggingFace) |
| Formato de pesos | no disponible (repo de 0.0 GB; se citan checkpoints con optimizer/scheduler/RNG y processor) |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA GR00T-N1.7-3B, un modelo fundacional de robotica de tipo vision-language-action. El ajuste fino se realiza sobre cuatro tareas de demostracion (IDs 000895, 000896, 000907 y 000912), con una instruccion en lenguaje natural por grabacion completa. La politica controla unicamente las siete articulaciones del brazo derecho mas la pinza; el brazo izquierdo, la cabeza, el lift y la base quedan fijos y excluidos del espacio de accion. Los objetivos son posiciones absolutas y la salida es un chunk de 24 pasos a 15 Hz.

La configuracion de percepcion usa tres camaras: cam_left_head, cam_left_wrist y cam_right_wrist. El entrenamiento esta disenado para ser reanudable, con checkpoints completos en 30k, 60k, 90k, 120k y 150k pasos que incluyen estado del optimizador, scheduler y RNG, ademas de procesador, normalizacion, mapeo de embodiment y checksums. Los episodios de validacion se separan antes de calcular estadisticas, lo que evita fuga de informacion. No se publican los datos de demostracion en bruto ni se especifican el numero total de tokens, la composicion del dataset ni si hubo RLHF o DPO; al ser un modelo de robotica por imitacion, lo habitual seria aprendizaje supervisado sobre demostraciones, pero no se confirma en la informacion disponible.

## Capacidades

- Manipulacion robotica de una sola tarea: recoger un rollo de papel de cocina de una cesta con el brazo derecho.
- Control de 7 articulaciones del brazo derecho mas pinza, con objetivos absolutos y chunks de 24 pasos a 15 Hz.
- Percepcion multimodal con tres camaras (cabeza izquierda y munecas izquierda y derecha).
- Seguimiento de instrucciones en lenguaje natural, una por grabacion completa.
- Entrenamiento reanudable con checkpoints completos e informacion de reproducibilidad.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en imitacion robotica: servir como referencia reproducible de un ajuste fino de GR00T-N1.7-3B sobre una tarea acotada, con checkpoints intermedios y checksums para replicar experimentos.
- Estudio de reanudacion de entrenamientos largos: los checkpoints con optimizer, scheduler y RNG permiten analizar la estabilidad del entrenamiento a lo largo de 150k pasos.
- Evaluacion de politicas de un solo brazo: el espacio de accion reducido (brazo derecho mas pinza) facilita comparar tecnicas de control sin la complejidad de un robot bimanual completo.
- Analisis de chunking de acciones: la salida de 24 pasos a 15 Hz permite estudiar el efecto del tamano de chunk en tareas de picking.
- Banco de pruebas de percepcion multicamara: las tres vistas (cabeza y dos munecas) permiten evaluar fusion de observaciones en manipulacion.
- Docencia y divulgacion: ejemplo concreto de pipeline LeRobot/GR00T para explicar ajuste fino de modelos VLA con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card indica que el mejor checkpoint de validacion fija esta pendiente y que no se ha establecido rendimiento con robot alimentado ni preparacion para despliegue.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia orientativa, un modelo de 3B parametros en precision completa requeriria del orden de 6-12 GB solo para pesos, mas memoria para activaciones y procesamiento de tres flujos de camara; no se confirma en la informacion.
- GPU recomendadas: no disponible. Por tamano del modelo base, cabria esperar GPUs de gama alta de consumo o profesionales, pero no se especifica.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: la libreria declarada es transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no son el cauce habitual para politicas VLA.
- Latencia y throughput: no disponibles. La frecuencia de control es de 15 Hz con chunks de 24 pasos, lo que implica un horizonte de 1,6 segundos por chunk.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GR00T-N1.7 fine-tune) | 3B | no disponible | Recoger rollo de papel de una cesta, brazo derecho | NVIDIA Open Model License | Repo de 0 GB, 0 descargas |
| nvidia/GR00T-N1.7-3B | 3B | no disponible | Modelo fundacional VLA general | NVIDIA Open Model License | Modelo base en HuggingFace |
| Otros fine-tunes de GR00T N1.7 | 3B | no disponible | Tareas especificas de manipulacion | Segun autor | No disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de una sola tarea y un solo brazo: no generaliza a otras tareas ni a control bimanual sin reentrenamiento.
- El brazo izquierdo, la cabeza, el lift y la base estan fijos y excluidos; el modelo no controla la movilidad del robot.
- No se ha establecido rendimiento con robot alimentado ni preparacion para despliegue; el autor lo advierte explicitamente.
- El mejor checkpoint de validacion fija esta pendiente, por lo que no hay una seleccion de checkpoint respaldada por metricas publicadas.
- No se publican los datos de demostracion en bruto, lo que limita la auditoria del sesgo y la distribucion de entrenamiento.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible; en politicas de imitacion el riesgo principal es el fallo de generalizacion fuera de la distribucion de demostraciones.
- Licencia NVIDIA Open Model License: conviene revisar sus terminos antes de cualquier uso comercial, ya que no es una licencia permisiva tipo Apache o MIT.
- Repositorio de 0 GB y 0 descargas: los pesos pueden no estar disponibles o el artefacto puede ser incompleto.
- Idiomas soportados no disponibles; las instrucciones en lenguaje natural no estan caracterizadas por idioma.

## Enlaces

- HuggingFace: https://huggingface.co/Dongkkka/GR00T-N1.7-PaperTowelBasket-895-896-907-912-RightArm8-150k-20261105
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Referencias citadas en el model card: inference_contract.json, reproducibility/RESUME.txt, source.tar.gz y dataset receipt (incluidos en el repositorio, no enlazables de forma independiente en la informacion disponible).
