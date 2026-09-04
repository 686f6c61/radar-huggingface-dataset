# augustaklug/ner-lenerbr-onnx

## Resumen

El modelo `augustaklug/ner-lenerbr-onnx`, desarrollado por augustaklug, es una conversión a ONNX del modelo `pierreguillou/ner-bert-base-cased-pt-lenerbr`, un BERT base ajustado para el reconocimiento de entidades nombradas (NER) en textos jurídicos en portugués brasileño. El modelo original fue entrenado sobre el dataset LeNER-Br, que contiene 70 documentos de legislación y decisiones judiciales brasileñas anotadas manualmente, con 7.828 ejemplos de entrenamiento y 1.177 de validación. Esta conversión no modifica los pesos originales, sino que exporta el modelo a ONNX y genera variantes en fp32, fp16 y cuantización dinámica int8, con el objetivo de ejecutar inferencia en el navegador mediante transformers.js.

El modelo reconoce seis tipos de entidades: personas, organizaciones, lugares, expresiones temporales, legislación y jurisprudencia, siguiendo el esquema IOB. El modelo original alcanza un F1 de 0.8926 en el conjunto de validación, con un rendimiento especialmente bueno en personas y expresiones temporales, pero más débil en jurisprudencia (F1 ≈ 0.70). La disponibilidad de variantes cuantizadas lo hace adecuado para aplicaciones web que requieran procesamiento de texto legal sin enviar datos a servidores, así como para entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base cased (encoder-only Transformer) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, fp16, int8 dinámico (q8) |
| Idiomas soportados | Portugués (brasileño) |
| Licencia | no disponible |
| Formato de pesos | ONNX |
| Tamaño del repositorio | 1.0 GB |
| Variantes de precisión | fp32 (~440 MB), fp16 (~220 MB), q8 (~110 MB) |

## Arquitectura y entrenamiento

El modelo base es un BERT base cased de la familia HuggingFace, ajustado para token-classification. Fue entrenado sobre el dataset LeNER-Br, compuesto por 70 documentos de legislación y decisiones judiciales brasileñas, con 7.828 ejemplos de entrenamiento y 1.177 de validación. El entrenamiento se realizó sin RLHF ni DPO; se trata de un fine-tuning supervisado estándar.

El repositorio `ner-lenerbr-onnx` no realiza ningún reentrenamiento. Los archivos ONNX se generaron con Optimum y ONNX Runtime a partir del checkpoint original en PyTorch, mediante tres pasos: exportación a ONNX fp32, optimización del grafo y conversión de pesos a fp16, y cuantización dinámica en int8. La única innovación destacable es la posibilidad de ejecutar el modelo en el navegador con transformers.js, gracias a las variantes cuantizadas que reducen el peso descargado a unos 110 MB.

## Capacidades

- Reconocimiento de entidades nombradas en textos jurídicos brasileños.
- Detección de personas, organizaciones, lugares, expresiones temporales, legislación y jurisprudencia.
- Etiquetado con esquema IOB.
- Ejecución en navegador mediante ONNX Runtime y transformers.js.
- Soporte de tres precisiones numéricas: fp32, fp16 y q8.
- No soporta tool calling, ni agentes, ni visión, ni audio, ni generación de texto libre.

## Casos de uso

- Revisión de sentencias judiciales: el modelo extrae personas, organizaciones y referencias legislativas de decisiones judiciales brasileñas, lo que permite generar resúmenes estructurados de forma automática. Su especialización en textos legales y su F1 de 0.89 lo hacen adecuado para esta tarea.
- Gestión documental en despachos: indexar contratos y expedientes por entidades (clientes, empresas, leyes aplicables) facilita la búsqueda posterior. La inferencia local en el navegador con la variante q8 evita enviar información confidencial a servidores externos.
- Análisis de jurisprudencia: identificar citas a decisiones judiciales en nuevos escritos permite vincular casos similares. Hay que tener en cuenta que la entidad JURISPRUDENCIA tiene un F1 más bajo (≈0.70), por lo que se recomienda revisar manualmente los resultados.
- Monitorización de cambios legislativos: detectar menciones a leyes y normas en textos publicados para alertar a profesionales. El modelo reconoce la entidad LEGISLACAO, lo que permite filtrar documentos relevantes.
- Asistente legal con resaltado en tiempo real: integrar el modelo en una interfaz web que resalta entidades mientras el usuario escribe, gracias a la baja latencia de la variante cuantizada en CPU.
- Enriquecimiento de bases de datos jurídicas: clasificar documentos por entidades mencionadas para análisis estadístico o para construir grafos de relaciones entre personas y organizaciones.
- Procesamiento de normativas en administraciones públicas: automatizar la extracción de entidades en leyes y decretos para su publicación en portales de transparencia.

## Benchmarks y rendimiento

Los resultados disponibles corresponden al modelo original, ya que la conversión ONNX no modifica los pesos. En el conjunto de validación (1.177 ejemplos) se obtuvieron las siguientes métricas:

| Métrica | Valor |
|---|---|
| F1 | 0.8926 |
| Precisión | 0.8810 |
| Recall | 0.9045 |
| Exactitud | 0.9759 |

El rendimiento por entidad varía: PESSOA y TEMPO tienen F1 de 0.98 y 0.97 respectivamente, mientras que JURISPRUDENCIA alcanza aproximadamente 0.70. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Los pesos ONNX ocupan entre 110 MB y 440 MB según la precisión.
- GPU recomendadas: no disponible.
- Ejecución en CPU: la variante q8 puede ejecutarse en navegador sin GPU, lo que la hace adecuada para equipos de consumo.
- Opciones de despliegue: transformers.js (navegador), ONNX Runtime (Node.js, Python) y Optimum.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

El modelo original `pierreguillou/ner-bert-base-cased-pt-lenerbr` es la referencia directa, ya que este repositorio es una conversión del mismo. También se ha identificado `RNCC83/lenerbr-ner-onnx` como un modelo similar, aunque no se dispone de datos detallados.

| Modelo | Formato | Variantes | Tamaño | Licencia |
|---|---|---|---|---|
| augustaklug/ner-lenerbr-onnx | ONNX | fp32, fp16, q8 | ~440/220/110 MB | no disponible |
| pierreguillou/ner-bert-base-cased-pt-lenerbr | PyTorch | fp32 | no disponible | no disponible |
| RNCC83/lenerbr-ner-onnx | ONNX | no disponible | no disponible | no disponible |

Los tres modelos derivan del mismo checkpoint original, por lo que el rendimiento NER esperado es similar. La conversión de augustaklug destaca por incluir variantes cuantizadas para despliegue en navegador.

## Limitaciones y advertencias

- El modelo solo está entrenado para portugués brasileño; no soporta otros idiomas.
- La entidad JURISPRUDENCIA presenta un F1 de aproximadamente 0.70, lo que puede provocar errores al identificar decisiones judiciales.
- El autor del modelo original reporta overfitting antes de finalizar el entrenamiento, debido al tamaño reducido del dataset. Esto afecta a la generalización.
- Ni el modelo ni el dataset LeNER-Br declaran una licencia explícita en sus fichas de HuggingFace. Es necesario verificar los términos de uso con los autores antes de cualquier uso comercial o redistribución.
- La cuantización dinámica int8 puede introducir una leve pérdida de precisión en comparación con fp32.
- No se han evaluado sesgos. El modelo puede reflejar sesgos presentes en los documentos legales brasileños.
- La longitud de contexto no está especificada en la documentación. Al tratarse de un modelo BERT base, es probable que sea de 512 tokens, pero este dato no está confirmado; para textos largos se recomienda segmentar.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/augustaklug/ner-lenerbr-onnx
- Modelo original: https://huggingface.co/pierreguillou/ner-bert-base-cased-pt-lenerbr
- Dataset LeNER-Br: https://huggingface.co/datasets/lener_br
- transformers.js: https://huggingface.co/docs/transformers.js
- Optimum: https://github.com/huggingface/optimum
- ONNX Runtime: https://onnxruntime.ai/
- Modelo similar RNCC83/lenerbr-ner-onnx: https://huggingface.co/RNCC83/lenerbr-ner-onnx
