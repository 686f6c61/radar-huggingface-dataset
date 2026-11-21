# orcarouter/Hy4-flash-abliterated-GGUF

## Resumen

Hy4-flash-abliterated-GGUF es una versión cuantizada en formato GGUF del modelo orcarouter/Hy4-flash-abliterated, un derivado "abliterated" (sin censura) del modelo Hunyuan de Tencent. El modelo base conserva la arquitectura Mixture of Experts (MoE) de la familia Hunyuan, con 218.938.353.741 parámetros totales según los safetensors del repositorio. Esta versión GGUF está pensada para inferencia local con llama.cpp y herramientas compatibles, con cuantizaciones de precisión mixta e imatrix.

El modelo se distribuye bajo la licencia tencent-hy-license y solo soporta inglés y chino (en, zh). El acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos. El repositorio ocupa 612 GB, lo que refleja la inclusión de múltiples variantes de cuantización para un modelo de gran tamaño.

La relevancia de esta ficha radica en que combina dos tendencias: la cuantización GGUF para despliegue local de modelos MoE masivos y la modificación "abliterated" que elimina los mecanismos de rechazo del modelo original. Es un artefacto de nicho, con cero descargas en el momento de la consulta, orientado a usuarios que necesitan ejecutar localmente un modelo Hunyuan sin restricciones de contenido y con licencia de Tencent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), familia Hunyuan (detalles de capas y expertos no disponibles) |
| Parametros totales | 218.938.353.741 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con precisión mixta e imatrix (variantes concretas no disponibles) |
| Idiomas soportados | en, zh |
| Licencia | tencent-hy-license |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Tamano del repositorio | 612,0 GB |
| Modelo base | orcarouter/Hy4-flash-abliterated |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts (MoE) perteneciente a la familia Hunyuan de Tencent, según indican las etiquetas del repositorio (moe, hunyuan, hy4-flash). No se dispone de información sobre el número de expertos, la dimensión oculta, el número de capas ni los parámetros activos por token. Tampoco se documentan en la información proporcionada los datos de entrenamiento (número de tokens, composición del dataset) ni si hubo etapas de RLHF, DPO o ajuste por preferencias.

La modificación "abliterated" implica la eliminación de las direcciones de activación asociadas al rechazo de contenido, un procedimiento de edición de pesos que reduce la probabilidad de respuestas de negativa. Esta versión GGUF aplica cuantización de precisión mixta con calibración imatrix, una técnica que optimiza la asignación de bits por tensor según su importancia para la perplejidad. No se especifican los niveles de cuantización incluidos ni el método exacto de abliteración empleado.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento y respuesta multi-turno (etiqueta conversational).
- Capacidad de ejecución local mediante llama.cpp y runtimes compatibles con GGUF.
- Comportamiento sin censura (uncensored) derivado de la abliteración: menor probabilidad de rechazo ante solicitudes que el modelo original declinaría.
- Compatibilidad con endpoints (etiqueta endpoints_compatible), lo que sugiere integración con APIs de inferencia.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la abliteración comparando sus respuestas con las del Hunyuan original en tareas sensibles, en un entorno controlado y local.
- Despliegue local en infraestructura propia: gracias al formato GGUF y a llama.cpp, puede ejecutarse sin depender de servicios en la nube, útil cuando la confidencialidad de los datos es crítica.
- Generación de texto en inglés y chino: adecuado para pipelines de contenido bilingüe donde se requiera un modelo MoE de gran escala ejecutado en hardware propio.
- Experimentación con cuantización de precisión mixta: el repositorio con imatrix sirve como caso de estudio para evaluar la degradación de calidad de un MoE de ~219.000 millones de parámetros al cuantizarlo.
- Evaluación de licencias y gated access: útil para equipos que necesitan verificar el flujo de aceptación de condiciones de la tencent-hy-license antes de integrar el modelo en un producto.
- Prototipado de asistentes conversacionales sin restricciones de contenido en entornos de investigación cerrados, asumiendo la responsabilidad legal y ética del uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo tiene 218.938.353.741 parámetros; incluso en cuantizaciones agresivas de 4 bits, el peso ronda los 110-120 GB, por lo que no cabe en GPUs de consumo convencionales.
- VRAM estimada: no disponible de forma oficial; por el tamaño paramétrico, se requiere un sistema multi-GPU o con memoria unificada de gran capacidad (varias A100/H100 de 80 GB o configuraciones equivalentes).
- GPUs recomendadas: A100 80 GB, H100 80 GB en configuraciones múltiples; no se garantiza su funcionamiento en RTX 4090 (24 GB) salvo con offloading parcial a RAM/CPU, lo que degradaría notablemente el rendimiento.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y potencialmente otros runtimes compatibles con GGUF; vLLM y TGI no se mencionan en la información disponible para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| orcarouter/Hy4-flash-abliterated-GGUF | 218.938.353.741 | no disponible | en, zh | tencent-hy-license | GGUF |
| orcarouter/Hy4-flash-abliterated (base) | no disponible | no disponible | en, zh | tencent-hy-license | safetensors |
| Hunyuan original (familia Tencent) | no disponible en esta ficha | no disponible | en, zh | tencent-hy-license | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido dañino, ilegal o sesgado; no es apto para aplicaciones de cara al público sin moderación adicional.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se han publicado evaluaciones específicas para esta variante.
- Soporte limitado a inglés y chino; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- La licencia tencent-hy-license puede imponer restricciones al uso comercial; es obligatorio revisar sus términos antes de cualquier despliegue productivo.
- El acceso es restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción a la automatización de descargas.
- El tamaño del repositorio (612 GB) y del modelo dificultan su despliegue en infraestructura convencional; se necesita almacenamiento y memoria considerables.
- No hay información sobre la longitud de contexto, los parámetros activos ni las variantes de cuantización incluidas, lo que limita la planificación de capacidad.
- Cero descargas y un solo "like" en el momento de la consulta: no existe validación comunitaria del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/orcarouter/Hy4-flash-abliterated-GGUF
- Modelo base: https://huggingface.co/orcarouter/Hy4-flash-abliterated
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
