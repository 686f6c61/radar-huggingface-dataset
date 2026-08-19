# kepom/GLM-5-abliterated

## Resumen

GLM-5 Abliterated es una versión modificada del modelo GLM-5 de Z.ai, publicada por el usuario kepom en HuggingFace. El proceso de abliteration elimina la "dirección de rechazo" de los pesos del modelo mediante ortogonalización, lo que permite que el modelo responda a un rango más amplio de instrucciones sin negarse por motivos de seguridad, preservando en teoría las capacidades generales. Se trata de un modelo de texto generativo basado en una arquitectura MoE (Mixture of Experts) con 744 000 millones de parámetros totales y 40 000 millones activos, lo que lo sitúa en la gama alta de modelos de código abierto.

El modelo se distribuye en precisión BF16 completa, sin cuantización, con un tamaño de repositorio de 1507,8 GB, lo que implica requisitos de hardware muy elevados. Está pensado para investigación y uso en entornos donde se requiera evitar rechazas por contenido, aunque el propio autor advierte que no recomienda su uso en producción. La licencia es Apache-2.0, lo que permite uso comercial con atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención compartida y expertos compartidos |
| Parametros totales | 753 864 139 008 (753,86 mil millones) |
| Parametros activos | 40 000 millones (40B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (solo el formato original del repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es GLM-5 de Z.ai, una arquitectura MoE con 78 capas en total. La versión abliterated modifica 40 de esas capas (de la 15 a la 54), aplicando ortogonalización de pesos sobre dos tipos de matrices: `self_attn.o_proj.weight` (proyección de salida de atención) y `mlp.shared_experts.down_proj.weight` (proyección de salida de los expertos compartidos). En total se modifican 80 matrices con un valor alfa de 1.0.

El proceso de abliteration se basa en el cálculo de direcciones de rechazo mediante pares de activaciones contrastivas (prompts dañinos frente a inofensivos) para las 78 capas, pero solo se aplica la modificación a las capas intermedias. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO), ya que esa información no se incluye en la documentación proporcionada.

## Capacidades

- Generación de texto en lenguaje natural, con capacidades conversacionales y de completado de texto.
- Al ser una versión abliterated, responde a instrucciones que el modelo original podría rechazar por políticas de seguridad, lo que permite explorar casos de uso sin restricciones de contenido.
- No se dispone de información detallada sobre capacidades específicas como razonamiento matemático, generación de código, tool calling o soporte de agentes. Estas capacidades dependen del modelo base GLM-5, pero no se han documentado en esta ficha.
- El modelo es monolingüe en cuanto a los idiomas soportados, pero no se especifica cuáles son.

## Casos de uso

- Investigación en alineación y seguridad de modelos: el abliteration permite estudiar cómo afecta la eliminación de la dirección de rechazo al comportamiento del modelo en tareas de generación de contenido sensible.
- Generación de texto creativo sin restricciones: el modelo puede utilizarse para escribir ficción, poesía o guiones donde el modelo original podría rechazar ciertas temáticas.
- Análisis de sesgos y comportamientos: al eliminar los rechazos, se pueden examinar los sesgos subyacentes del modelo base de forma más directa.
- Desarrollo de aplicaciones de chatbot especializadas en dominios donde las políticas de seguridad del modelo base son demasiado restrictivas (siempre que se cumplan las leyes aplicables).
- Evaluación comparativa de técnicas de modificación de pesos: sirve como referencia para probar métodos alternativos de control de comportamiento en modelos MoE de gran escala.
- Experimentación académica en entornos de investigación con acceso a hardware de servidor múltiple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de rendimiento en la model card, y no se han encontrado evaluaciones externas de esta versión abliterated específica.

## Requisitos de hardware

- VRAM estimada: el modelo en BF16 ocupa aproximadamente 1507,8 GB en disco, lo que implica que la inferencia requiere múltiples GPUs de alta capacidad. Con cuantización (por ejemplo, IQ2_M) podría reducirse a unos 236 GB, pero no se ofrecen versiones cuantizadas en este repositorio.
- GPU recomendadas: no se especifican, pero por el tamaño se necesitan al menos 8 GPUs de 80 GB (como A100 o H100) para cargar los pesos en memoria, o más si se usa paralelismo de modelos.
- No cabe en GPUs de consumo (RTX 4090, etc.) en su formato BF16 original.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI o frameworks similares que soporten MoE. No se proporcionan instrucciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos directos. El modelo pertenece a la familia GLM-5 de Z.ai, de la que existen versiones posteriores como GLM-5.1, GLM-5.2 y GLM-5.3 (según la búsqueda web), pero no se tienen especificaciones concretas de esos modelos para realizar una comparación numérica. Se puede indicar que GLM-5.1 se describe como un modelo para ingeniería de agentes con mejoras en código, y GLM-5.3 ofrece contexto de 1M de tokens, pero no hay datos de parámetros ni benchmarks en la información proporcionada.

## Limitaciones y advertencias

- El autor del modelo advierte explícitamente: "no recomiendo usar esto" (traducción de la cita en la model card), lo que sugiere que la versión abliterated puede tener comportamientos indeseados o degradación de calidad.
- Al eliminar la dirección de rechazo, el modelo puede generar contenido dañino, ilegal o éticamente cuestionable. El usuario es responsable del uso.
- No se han documentado sesgos específicos, pero al ser un modelo de gran escala entrenado con datos web, es probable que herede sesgos del modelo base.
- Riesgo de alucinación: no se ha evaluado, pero es común en modelos de este tamaño.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto; el modelo base GLM-5 podría tener una ventana de contexto estándar (probablemente 128K o similar), pero no está confirmado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo.
- Para producción, se recomienda usar el modelo original GLM-5 o versiones cuantizadas oficiales, no esta variante abliterated.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/kepom/GLM-5-abliterated)
- [Repositorio oficial de GLM-5 en GitHub](https://github.com/zai-org/GLM-5)
- [Página de GLM-5.3 en OpenLM.ai](https://openlm.ai/glm-5.2/)
- [Artículo de Wikipedia sobre GLM](https://en.wikipedia.org/wiki/GLM_(AI))
- [Guía de modelos abliterated (locallyuncensored.com)](https://locallyuncensored.com/blog/abliterated-models-guide.html)
