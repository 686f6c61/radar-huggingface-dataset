# bambocher/Qwen3.5-9B-heretic-oQ3.5e-mtp

## Resumen

Qwen3.5-9B-heretic-oQ3.5e-mtp es una cuantizacion mixta del modelo Qwen3.5-9B, publicada por el usuario bambocher en Hugging Face. El checkpoint combina pesos en 3, 4, 5 y 6 bits (afin con grupo de 64) junto con una fraccion en BF16, logrando un promedio efectivo de 4,703 bits por peso sobre los 9.653 millones de parametros totales del modelo. El resultado ocupa 5,675 GB en disco, lo que lo hace viable en equipos con memoria unificada modesta.

La relevancia de esta publicacion reside en dos factores. Primero, emplea oQ (oMLX v0.7.3), una tecnica de cuantizacion de precision mixta que asigna mas bits a las capas sensibles y menos a las redundantes, preservando calidad frente a una cuantizacion uniforme de 4 bits. Segundo, conserva componentes que habitualmente se descartan en cuantizaciones agresivas: la torre de vision (0,456B de parametros) y una cabeza MTP (Multi-Token Prediction, 0,243B), lo que sugiere soporte para entrada multimodal y decodificacion especulativa.

El modelo esta empaquetado para MLX, el framework de Apple, por lo que su uso esta orientado a silicio de Apple (M1 en adelante). No se dispone de informacion sobre la licencia, los idiomas soportados ni la model card del modelo base en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con torre de vision y cabeza MTP; cuantizacion mixta oQ |
| Parametros totales | 9.653.104.368 (9,653B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afin de 3, 4, 5 y 6 bits con grupo de 64, mas pesos en BF16; promedio efectivo 4,703 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), libreria `mlx` |

Desglose de la cuantizacion por componente:

| Formato de almacenamiento | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Afin 3-bit, grupo 64 | 6,117B | 63,372% | 2,493 GiB | 3,50 |
| Afin 4-bit, grupo 64 | 1,625B | 16,837% | 0,851 GiB | 4,50 |
| Afin 5-bit, grupo 64 | 0,403B | 4,171% | 0,258 GiB | 5,50 |
| Afin 6-bit, grupo 64 | 1,017B | 10,537% | 0,770 GiB | 6,50 |
| BF16 | 0,491B | 5,083% | 0,914 GiB | 16,00 |
| **Total** | **9,653B** | **100%** | **5,285 GiB** | **4,703** |

Desglose por componente del modelo:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8,954B | 4,578 GB / 4,264 GiB |
| Vision | 0,456B | 0,912 GB / 0,849 GiB |
| Cabeza MTP | 0,243B | 0,185 GB / 0,172 GiB |
| **Total** | **9,653B** | **5,675 GB / 5,285 GiB** |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura del modelo base Qwen3.5-9B mas alla de su pertenencia a la familia Qwen3.5 y la presencia de tres componentes diferenciados en el checkpoint: un modelo de lenguaje de 8,954B de parametros, una torre de vision de 0,456B y una cabeza MTP de 0,243B. La existencia de la torre de vision implica capacidad de procesamiento de imagenes; la cabeza MTP apunta a decodificacion multi-token, una tecnica de prediccion especulativa que permite generar varios tokens por paso y reducir latencia.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base paso por fases de RLHF o DPO. Tampoco hay informacion sobre innovaciones arquitectonicas especificas (atencion lineal, SSM, atencion hibrida) en la informacion proporcionada.

La innovacion tecnica documentada en esta publicacion es la cuantizacion mixta con oQ (oMLX v0.7.3): el 63,372% de los pesos logicos se almacena en 3 bits, mientras que un 10,537% se conserva en 6 bits y un 5,083% permanece en BF16. Esta distribucion no uniforme sugiere que las capas mas sensibles a la cuantizacion (posiblemente embeddings, cabezas de atencion o proyecciones de la torre de vision) reciben mayor precision, mientras que las capas mas redundantes se comprimen a 3 bits.

## Capacidades

- Generacion de texto y razonamiento: el modelo de lenguaje de 8,954B de parametros soporta las capacidades estandar de la familia Qwen3.5, si bien no se detallan en la informacion disponible.
- Procesamiento de vision: la presencia de una torre de vision de 0,456B indica soporte para entrada de imagenes, aunque no se especifican tareas concretas (VQA, OCR, captioning).
- Decodificacion especulativa: la cabeza MTP de 0,243B permite prediccion multi-token, lo que puede acelerar la inferencia en MLX.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 5,675 GB cabe en equipos Apple Silicon con 16 GB o mas, permitiendo ejecutar un modelo de ~9,6B de parametros en local mediante MLX sin depender de la nube.
- Procesamiento de imagenes en local: la torre de vision cuantizada (0,849 GiB) permite clasificar, describir o extraer texto de imagenes en un portatil Apple, util para automatizar la digitalizacion de documentos o la catalogacion de fotos sin enviar datos a terceros.
- Generacion de texto con baja latencia: la cabeza MTP habilita decodificacion especulativa, adecuada para asistentes de escritura o autocompletado en tiempo real donde la latencia por token es critica.
- Prototipado de aplicaciones con privacidad estricta: al ejecutarse integramente en el dispositivo, el modelo es apto para entornos sanitarios, legales o financieros donde los datos no pueden salir del equipo.
- Evaluacion comparativa de cuantizaciones: investigadores que estudien el impacto de la precision mixta (3 a 6 bits) frente a cuantizaciones uniformes pueden usar este checkpoint como referencia para medir la degradacion de calidad en tareas de razonamiento y vision.
- Desarrollo de pipelines MLX: desarrolladores que construyan herramientas sobre el framework MLX de Apple pueden integrar este modelo como componente base para tareas de generacion y comprension multimodal en macOS.
- Experimentacion con decodificacion especulativa: la cabeza MTP permite investigar tecnicas de prediccion multi-token en hardware Apple, comparando throughput frente a decodificacion autoregresiva estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 5,7 GB para los pesos en disco; en ejecucion, MLX requiere memoria adicional para el estado de activaciones y cache KV, por lo que se recomienda un minimo de 8-10 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con 16 GB o mas de memoria unificada. El formato MLX no es compatible con GPU NVIDIA o AMD sin conversion previa.
- Cabe en consumer GPU: si, en equipos Apple con 16 GB o mas de memoria unificada; tambien en Mac con 8 GB en configuraciones ajustadas de contexto.
- Opciones de despliegue: `mlx-lm` y el ecosistema oMLX; para otros backends seria necesaria una conversion (por ejemplo a GGUF para llama.cpp u Ollama), no documentada en la informacion disponible.
- Latencia y throughput: no disponible. La cabeza MTP puede reducir la latencia por token, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de las alternativas en la informacion proporcionada, por lo que la comparativa se limita a parametros y formato.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B-heretic-oQ3.5e-mtp | 9,653B | no disponible | Mixta 3-6 bits + BF16 (4,703 bits/peso) | no disponible | safetensors (MLX) |
| Qwen3.5-9B (base) | 9B (aprox.) | no disponible | Original (BF16) | no disponible | no disponible |
| Cuantizacion uniforme 4-bit equivalente | 9,653B | no disponible | 4 bits grupo 64 | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base Qwen3.5-9B antes de cualquier despliegue en produccion.
- Cuantizacion agresiva: el 63,372% de los pesos esta en 3 bits, lo que puede degradar tareas sensibles como razonamiento matematico, generacion de codigo o comprension de imagenes detallada. No se aportan evaluaciones de calidad tras la cuantizacion.
- Naturaleza "heretic": el nombre sugiere que el modelo base ha sido modificado para eliminar restricciones de alineamiento (abliteration), lo que implica un mayor riesgo de generar contenido inapropiado, sesgado o danino sin las salvaguardas habituales.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan medidas de mitigacion.
- Dependencia de MLX: el checkpoint solo es utilizable directamente en el ecosistema Apple; su uso en otros entornos requiere conversion y posiblemente perdida de la cabeza MTP.
- Idiomas y contexto no documentados: se desconoce la ventana de contexto real y la cobertura linguistica, lo que limita la planificacion de casos de uso multilingues o de contexto largo.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia externa de su calidad o estabilidad.
- Componentes MTP y de vision sin documentacion de uso: no se especifica como activar la decodificacion especulativa ni la entrada multimodal en MLX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-heretic-oQ3.5e-mtp
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
