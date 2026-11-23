# orcarouter/Inkling-2-Mini-abliterated-GGUF

## Resumen

Inkling-2-Mini-abliterated-GGUF es una cuantización en formato GGUF del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario orcarouter. Se trata de una variante "abliterated", es decir, con las direcciones de rechazo (refusal directions) suprimidas del espacio de activaciones, lo que elimina los mecanismos de negativa del modelo original y da lugar a una versión sin censura (uncensored). El modelo conserva la arquitectura del original, un transformer con mezcla de expertos (MoE) de aproximadamente 26.070 millones de parámetros totales, y se distribuye en cuantizaciones GGUF de precisión mixta generadas con imatrix para su uso con llama.cpp.

La relevancia de esta ficha es doble. Por un lado, documenta un caso práctico de cuantización GGUF de un modelo MoE de tamano medio, con un repo de 27,4 GB que sugiere múltiples niveles de cuantización. Por otro, ilustra el ecosistema de variantes abliterated, que interesan a desarrolladores que necesitan control fino sobre el comportamiento de rechazo en entornos de investigación o generación creativa, pero que introducen riesgos relevantes en producción.

El acceso al repositorio está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos. La licencia declarada es Apache 2.0, heredada del modelo base, y el único idioma declarado en los metadatos es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según el modelo base Inkling-2-Mini |
| Parametros totales | 26.070.385.152 (26,07 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF de precisión mixta generados con imatrix (niveles concretos no disponibles en la información proporcionada) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini, desarrollado por Thinking Machines, emplea una arquitectura transformer con mezcla de expertos (MoE), según indican las etiquetas del repositorio. El recuento de parámetros en safetensors asciende a 26.070.385.152, lo que sitúa al modelo en la franja de 26 mil millones de parámetros totales; el número de parámetros activos por token no se especifica en la información disponible. El repositorio declara el tag "mixed-precision" e "imatrix", lo que indica que las cuantizaciones se han generado con matrices de importancia (importance matrices) para preservar las capas más sensibles y con precisión mixta entre tensores.

La modificación "abliterated" consiste en la supresión de las direcciones de rechazo en el espacio de activaciones del modelo, una técnica de edición de pesos que elimina la tendencia a negarse a responder determinadas peticiones sin necesidad de reentrenamiento. No se dispone de información sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) ni sobre el procedimiento exacto de abliteración aplicado por orcarouter. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y el tag "conversational" indica uso orientado a diálogo.
- Razonamiento y generación de código: capacidades heredadas del modelo base, aunque no se documentan evaluaciones específicas en la información disponible.
- Comportamiento sin censura: la abliteración elimina los rechazos del modelo original, de modo que responde a peticiones que el modelo base declinaría.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que puede servirse a través de infraestructuras de inferencia compatibles con la API de endpoints de Hugging Face.
- Ejecución local: al estar en GGUF, es compatible con llama.cpp y con los runners que lo integran.
- Capacidades multilingües: limitadas al inglés según los metadatos del repositorio.
- No se documentan capacidades de visión, audio, tool calling ni modos de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo varía el comportamiento de un MoE al eliminar las direcciones de rechazo, comparando sus respuestas con las del modelo base en un mismo conjunto de prompts.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que requiera explorar temas sensibles sin las negativas del modelo alineado, ejecutada localmente con llama.cpp.
- Red teaming y evaluación de salvaguardas: uso como modelo adversario para probar clasificadores de contenido y filtros de moderación en pipelines propios.
- Despliegue local en estaciones de trabajo: con cuantizaciones GGUF de precisión mixta, el modelo puede ejecutarse en hardware de consumo o en servidores sin GPU de gama alta, según el nivel de cuantización elegido.
- Prototipado de asistentes conversacionales en inglés: gracias a su naturaleza conversacional y a la compatibilidad con endpoints, sirve para validar flujos de diálogo antes de migrar a un modelo alineado.
- Experimentación con cuantización de MoE: el repo permite comparar la calidad de distintas cuantizaciones imatrix de un mismo modelo y medir el impacto de la precisión mixta en las capas de expertos.
- Fine-tuning y destilación sobre datos sintéticos: al no rechazar peticiones, puede generar corpus sintéticos difíciles de obtener con modelos alineados, siempre que se apliquen las salvaguardas legales y éticas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el repo ocupa 27,4 GB, lo que sugiere que el conjunto de cuantizaciones incluye niveles en torno a 4-8 bits. Como referencia orientativa, un MoE de 26 mil millones de parámetros en 4 bits ronda los 14-16 GB y en 8 bits los 26-28 GB, aunque estas cifras no están confirmadas en la información proporcionada.
- GPU recomendadas: no disponible. Para el rango de tamano indicado, serían razonables GPUs con 24 GB o más (RTX 4090, A100 40 GB, H100), pero no hay datos oficiales que lo confirmen.
- Compatibilidad con GPU de consumo: probable en cuantizaciones bajas si el numero de parametros activos es reducido, aunque el dato de parametros activos no esta disponible.
- Opciones de despliegue: llama.cpp (formato nativo GGUF) y runners basados en él; el tag "endpoints_compatible" apunta a despliegue mediante endpoints compatibles. No se documenta soporte de vLLM o TGI para este repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| orcarouter/Inkling-2-Mini-abliterated-GGUF | 26,07 mil millones (MoE) | no disponible | Apache 2.0 | GGUF | Variante abliterated, solo inglés, acceso restringido |
| thinkingmachines/Inkling-2-Mini | 26,07 mil millones (MoE) | no disponible | Apache 2.0 (según modelo derivado) | safetensors | Modelo base alineado, sin modificar |
| Otras variantes abliterated de la familia Inkling | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre otras variantes publicadas |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La abliteración elimina los rechazos del modelo: puede generar contenido dañino, ilegal o inseguro sin filtros propios, lo que exige moderación externa en cualquier despliegue.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad; al ser un modelo derivado de un base no evaluado en la información disponible, la fiabilidad factual no está garantizada.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está verificado y probablemente sea deficiente.
- Licencia: Apache 2.0 permite uso comercial, pero la modificación abliterated puede entrar en conflicto con las políticas de uso del modelo base y con la legislación aplicable; conviene revisar los términos del modelo original.
- Acceso restringido: el repo es gated y requiere aceptar condiciones en Hugging Face, lo que afecta a la automatización de descargas en CI/CD.
- Sin métricas publicadas: no hay benchmarks, datos de contexto ni de parámetros activos, lo que dificulta la planificación de capacidad.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- Procedencia de la cuantización: al ser una publicación de un tercero (orcarouter), la calidad de las cuantizaciones imatrix no está auditada de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/orcarouter/Inkling-2-Mini-abliterated-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- OrcaRouter (sitio principal): https://www.orcarouter.ai/
- Documentación de OrcaRouter: https://docs.orcarouter.ai/introduction
- Playground de OrcaRouter: https://www.orcarouter.ai/playground
