# imaman520/albedo-qwen3.6-35b-bkn1890-vision-only-v2-uid128-20260903-010619

## Resumen

El modelo `imaman520/albedo-qwen3.6-35b-bkn1890-vision-only-v2-uid128-20260903-010619` es un candidato de limpieza (scrub candidate) derivado del modelo `BKN1890/albedo-qwen3.6-35b-20260901-1748`, que a su vez se basa en la familia Qwen 3.6 de 35 mil millones de parámetros en configuración MoE (3 mil millones activos). El autor, `imaman520`, ha aplicado un proceso de eliminación selectiva de tensores con perfil "vision-only", lo que significa que solo se conservan los tensores correspondientes a la parte visual del modelo (`model.visual.*`). En concreto, se han eliminado 63 de los 1045 tensores totales, todos pertenecientes al módulo de visión, utilizando una selección determinista basada en la semilla 84177 y una escala delta de 1.

Este modelo no está diseñado para uso directo en producción, sino como artefacto de investigación para estudiar el efecto de la ablación de componentes de visión en un modelo multimodal de gran tamaño. La huella digital esperada respecto al modelo base es de 0.939713, lo que indica una alta similitud estructural pero con diferencias deliberadas. El repositorio tiene 71,9 GB en formato safetensors, y la arquitectura declarada es `qwen3_5_moe`, aunque el nombre sugiere Qwen 3.6. No se dispone de licencia, idiomas soportados ni pipeline de inferencia publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) basada en Qwen 3.6, variante 35B-A3B |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3.000.000.000 (estimado segun la familia Qwen 3.6 35B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en BF16 segun tensor type) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

Nota: el repositorio indica `Tensor type BF16` y el tag `qwen3_5_moe`. No se proporcionan datos de cuantizacion, contexto ni licencia en la model card.

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de tipo MoE con 35 mil millones de parametros totales y aproximadamente 3 mil millones activos por token, siguiendo el diseño de la familia Qwen 3.6. La variante "albedo" parece ser una modificacion previa realizada por el autor BKN1890, y este repositorio aplica una segunda modificacion consistente en la eliminacion selectiva de tensores del modulo de vision. El proceso de limpieza (scrubbing) utiliza una semilla fija (84177) y una escala delta de 1, lo que sugiere un metodo determinista para seleccionar que tensores eliminar. Se han eliminado 63 de 1045 tensores, todos pertenecientes al submodulo `model.visual.*`. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas como RLHF o DPO. Dado que se trata de un candidato de limpieza, es probable que el modelo no haya sido entrenado para mejorar capacidades, sino para estudiar el impacto de la ablacion.

## Capacidades

Al tratarse de un perfil "vision-only" con eliminacion de tensores de vision, las capacidades reales del modelo son inciertas y no estan documentadas. Segun la informacion disponible:

- No se especifica si el modelo conserva la capacidad de generar texto, razonar o procesar imagenes tras la eliminacion de los tensores de vision.
- El perfil "vision-only" sugiere que solo se conservan los pesos del encoder visual, por lo que probablemente el modelo no pueda realizar tareas de lenguaje por si solo.
- No hay informacion sobre tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- Al ser un experimento de ablacion, no se garantiza ningun comportamiento funcional.

En ausencia de datos publicados, no es posible afirmar ninguna capacidad concreta.

## Casos de uso

Dado el caracter experimental del modelo, los casos de uso son limitados y orientados a investigacion:

- Estudio de interpretabilidad de modelos multimodales: permite analizar como la eliminacion selectiva de tensores de vision afecta a la representacion interna del modelo y a su comportamiento en tareas visuales.
- Investigacion en mecanismos de atencion visual: al conservar solo los pesos de vision, se puede estudiar la estructura del encoder visual de Qwen 3.6 de forma aislada.
- Evaluacion de robustez ante ablaciones: sirve como referencia para comparar el rendimiento de modelos completos frente a versiones con componentes eliminados.
- Desarrollo de tecnicas de poda (pruning) y compresion: los resultados de este experimento pueden informar estrategias para reducir el tamano de modelos multimodales sin perder demasiada precision.
- Analisis de huella digital de modelos: la metrica de fingerprint (0.939713) puede utilizarse para estudiar la similitud estructural entre modelos y sus variantes.
- Validacion de metodos de seleccion de tensores por semilla: el proceso de "scrubbing" con semilla 84177 puede replicarse y compararse con otras semillas para evaluar la consistencia de los resultados.

No se recomienda su uso en aplicaciones de produccion, atencion al cliente, generacion de codigo u otras tareas practicas, ya que no hay evidencia de que funcione correctamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. El unico dato cuantitativo es la huella digital esperada (0.939713) respecto al modelo base, que no es una medida de rendimiento sino de similitud estructural.

## Requisitos de hardware

No se dispone de informacion especifica sobre requisitos de hardware para este modelo. Sin embargo, dado que el repositorio contiene 71,9 GB en BF16, una inferencia del modelo completo requeriria al menos 72 GB de VRAM, lo que excede la capacidad de la mayoria de GPUs de consumo. Las GPUs profesionales como NVIDIA A100 (80 GB) o H100 (80 GB) podrian alojar los pesos, aunque no se garantiza que el modelo funcione correctamente tras la ablacion. Dado el perfil "vision-only", es posible que solo una parte de los pesos sea utilizable, pero no hay documentacion al respecto. No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, y es probable que el modelo no sea compatible con estos frameworks debido a su naturaleza experimental.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables, ya que se trata de un artefacto de investigacion unico. Como referencia, la familia Qwen 3.6 incluye el modelo dense de 27B y el MoE de 35B-A3B, que estan disponibles en plataformas como Ollama y LM Studio. Sin embargo, este modelo "albedo" con ablacion de vision no tiene equivalente publico conocido. La comparativa con Qwen 3.6 35B estandar seria pertinente, pero no hay datos de rendimiento de esta variante para contrastar.

## Limitaciones y advertencias

- Modelo experimental: es un "scrub candidate" (candidato de limpieza) y no se ha validado para uso real.
- Perfil "vision-only": la eliminacion de tensores de vision probablemente deja el modelo incompleto o no funcional para tareas de lenguaje.
- Sin licencia especificada: no se puede determinar si es apto para uso comercial, investigacion o cualquier otro fin.
- Sin datos de entrenamiento: se desconoce el proceso de entrenamiento, los datos utilizados y si se aplicaron tecnicas de alineacion.
- Riesgo de alucinacion y sesgos: al no haber evaluacion publica, no se puede descartar la presencia de sesgos o comportamientos indeseados.
- Tamanio del repositorio: 71,9 GB en BF16 requiere recursos de almacenamiento y computacion considerables, y no se ofrecen versiones cuantizadas.
- Sin soporte de inferencia: no hay integracion con proveedores de inferencia ni frameworks estandar.
- Fecha de creacion futura (2026-09-03): el modelo se publico con una fecha posterior a la actual, lo que puede indicar un error de metadatos o un caso de uso especifico de investigacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/imaman520/albedo-qwen3.6-35b-bkn1890-vision-only-v2-uid128-20260903-010619
- Guia de Qwen 3.6 en InsiderLLM: https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Pagina de Qwen3.6 35B en Ollama: https://ollama.com/library/qwen3.6:35b
- Pagina de Qwen3.6 en LM Studio: https://lmstudio.ai/models/qwen3.6
- Pagina general de Qwen3.6 en Ollama: https://ollama.com/library/qwen3.6
- Repositorio relacionado realmadrid9999/albedo-qwen3.6-35b-black: https://huggingface.co/realmadrid9999/albedo-qwen3.6-35b-black
