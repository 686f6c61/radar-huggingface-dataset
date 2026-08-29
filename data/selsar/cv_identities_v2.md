# selsar/cv_identities_v2

## Resumen

El modelo `selsar/cv_identities_v2` es un clasificador de texto basado en la arquitectura DeBERTa-v2, publicado en Hugging Face por el usuario `selsar`. El identificador sugiere que está orientado a la detección o clasificación de identidades en currículos (CVs), aunque la model card no proporciona información explícita sobre su propósito ni sobre el proceso de entrenamiento. Se trata de un modelo de tamaño medio, con aproximadamente 278,8 millones de parámetros, que ocupa 1,1 GB en formato safetensors.

La relevancia de este modelo radica en su posible aplicación en procesos de selección de personal y gestión de talento, donde la clasificación automática de datos personales o de identidad en documentos puede agilizar tareas de filtrado y anonimización. Sin embargo, al carecer de documentación detallada, su uso en producción requiere una evaluación previa rigurosa. El modelo está registrado con el pipeline `text-classification` y es compatible con la librería `transformers` y con `text-embeddings-inference`.

La ficha oficial del modelo es una plantilla genérica generada automáticamente, sin secciones completadas. Esto implica que no se dispone de información pública sobre el conjunto de datos de entrenamiento, las métricas de evaluación, la licencia exacta ni los idiomas soportados. A pesar de ello, los tags técnicos permiten identificar la arquitectura base y las herramientas de despliegue compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (transformers encoder) |
| Parametros totales | 278.810.882 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors fp32 en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DeBERTa-v2, una arquitectura transformer encoder que introduce el mecanismo de atención disentangled y una máscara de decodificación mejorada, tal como se describe en el paper original (arXiv:1910.09700). Esta arquitectura permite modelar relaciones entre pares de tokens considerando tanto el contenido como las posiciones relativas, lo que resulta especialmente útil en tareas de clasificación de texto con dependencias de orden y contexto.

No se dispone de información sobre el proceso de entrenamiento de este modelo concreto. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas de ajuste fino supervisado o RLHF, ni los hiperparámetros utilizados. El tag `text-classification` indica que el modelo fue entrenado o ajustado para una tarea de clasificación, probablemente binaria o multiclase, pero se desconoce el número de clases y la naturaleza exacta de las etiquetas.

## Capacidades

- Clasificacion de texto: el modelo está diseñado para la tarea de clasificación de texto, según el pipeline declarado. Puede asignar una o varias etiquetas a un documento de entrada.
- Posible deteccion de identidades en CVs: el nombre `cv_identities_v2` sugiere que el modelo identifica o clasifica entidades relacionadas con identidades personales en currículos, aunque esta funcionalidad no está confirmada en la documentación.
- Compatibilidad con text-embeddings-inference: al incluir el tag `text-embeddings-inference`, el modelo puede desplegarse con esta herramienta para servir inferencias de manera eficiente.
- Integracion con transformers: al estar basado en la librería `transformers`, se puede cargar y utilizar con la API estándar de Hugging Face.
- No se han documentado capacidades adicionales como generación de texto, tool calling, razonamiento multi-paso o soporte multimodal.

## Casos de uso

- Filtrado de currículos en procesos de selección: el modelo podría utilizarse para clasificar automáticamente si un CV contiene información de identidad (nombre, DNI, dirección) y separar aquellos que requieren anonimización antes de ser compartidos con reclutadores.
- Anonimización de datos personales: integrado en un pipeline de preprocesamiento, podría detectar segmentos de texto que contienen datos de identidad para su posterior enmascaramiento o eliminación, cumpliendo normativas como el RGPD.
- Organización de bases de datos de candidatos: clasificar documentos en categorías según el tipo de identidad o el nivel de detalle personal, facilitando la gestión de grandes volúmenes de CVs.
- Verificación de coherencia documental: en plataformas de empleo, el modelo podría ayudar a validar que un CV contiene los campos esperados (nombre, contacto, experiencia) antes de su publicación.
- Detección de duplicados o fraudes: al identificar patrones de identidad, podría contribuir a señalar CVs sospechosos o duplicados en sistemas de reclutamiento.
- Investigación académica en NLP aplicada a recursos humanos: servir como punto de partida para experimentos sobre clasificación de texto en el dominio de selección de personal, aunque requiere evaluación adicional.

Dado que no se dispone de información sobre el rendimiento real, estos casos de uso son hipotéticos y deben validarse con datos propios antes de implementarse en entornos productivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como exactitud, F1, precisión o recall, ni comparaciones con otros modelos. Tampoco se han encontrado evaluaciones externas en la web. Se recomienda realizar una evaluación propia sobre un conjunto de datos representativo antes de considerar su uso.

## Requisitos de hardware

- El modelo tiene 278,8 millones de parámetros, lo que en precisión fp32 ocupa aproximadamente 1,1 GB de memoria (278.810.882 × 4 bytes ≈ 1,12 GB). Esto coincide con el tamaño del repositorio.
- En precisión fp16, el peso ocuparía unos 0,56 GB, y en int8 unos 0,28 GB, pero no se han publicado versiones cuantizadas.
- Una GPU con al menos 2 GB de VRAM podría ejecutar el modelo en fp32, aunque se recomienda al menos 4 GB para margen con la activación y el procesamiento. GPUs como la NVIDIA GTX 1650, RTX 2060 o superiores serían suficientes.
- El modelo es compatible con la librería `transformers` y con `text-embeddings-inference`, por lo que puede desplegarse en entornos como vLLM (si se convierte a formato compatible), Hugging Face Inference Endpoints o un servidor propio con FastAPI.
- Para inferencia en CPU, el modelo podría ejecutarse con `transformers` en modo CPU, aunque la latencia será mayor. No se dispone de datos de throughput ni latencia medidos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo no tiene benchmarks publicados y no se conocen detalles de su entrenamiento. Como referencia arquitectónica, DeBERTa-v2-base tiene 86 millones de parámetros y DeBERTa-v2-large 304 millones, pero no se puede afirmar que este modelo corresponda a una de esas variantes exactas. Tampoco se han identificado otros modelos de clasificación de identidades en CVs con los que comparar directamente. Por tanto, la comparativa se considera no disponible.

| Modelo | Parametros | Contexto | Licencia | Benchmark conocido |
|---|---|---|---|---|
| selsar/cv_identities_v2 | 278,8 M | no disponible | no disponible | no disponible |
| DeBERTa-v2-base | 86 M | 512 | MIT | varios (GLUE, SQuAD) |
| DeBERTa-v2-large | 304 M | 512 | MIT | varios (GLUE, SQuAD) |

## Limitaciones y advertencias

- La model card es una plantilla vacía: no proporciona información sobre sesgos, riesgos, limitaciones técnicas ni recomendaciones de uso. Esto impide conocer posibles comportamientos no deseados.
- No se ha publicado el conjunto de datos de entrenamiento, por lo que se desconoce si el modelo presenta sesgos de género, raza, edad u otros factores sensibles, especialmente relevante en un dominio como la selección de personal.
- Riesgo de alucinación o clasificación errónea: al ser un modelo de clasificación, puede asignar etiquetas incorrectas si los datos de entrada difieren del dominio de entrenamiento.
- Licencia no especificada: no se puede determinar si el modelo puede utilizarse comercialmente ni bajo qué condiciones. Se recomienda contactar con el autor antes de cualquier uso en producción.
- Idiomas no declarados: no se sabe en qué idiomas funciona correctamente. Es probable que esté entrenado principalmente en inglés o español, pero no hay confirmación.
- Sin evaluación de rendimiento: no existen métricas publicadas, por lo que no se puede garantizar su precisión ni su fiabilidad en escenarios reales.
- El tamaño del modelo (278 M) es moderado, pero sin cuantización puede requerir más recursos de los necesarios en entornos con restricciones de memoria.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/selsar/cv_identities_v2
- Paper de DeBERTa (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
- Documentación de text-embeddings-inference (referencia por tag): https://huggingface.co/docs/text-embeddings-inference/index

No se han encontrado otros enlaces relevantes (repositorios de código, demos, blogs) en la búsqueda web.
