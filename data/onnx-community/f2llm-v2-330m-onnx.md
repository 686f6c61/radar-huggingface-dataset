# onnx-community/F2LLM-v2-330M-ONNX

## Resumen

F2LLM-v2-330M-ONNX es la conversión a formato ONNX del modelo de embeddings multilingüe F2LLM-v2-330M, desarrollado por el equipo CodeFuse de Alibaba. Este modelo pertenece a la familia F2LLM-v2, una colección de modelos de embeddings de propósito general que abarca tamaños desde 80M hasta 14B parámetros, entrenados sobre un conjunto curado de 60 millones de muestras públicas de alta calidad. Su principal objetivo es ofrecer representaciones vectoriales de texto con soporte para más de 200 idiomas, con especial atención a lenguas de recursos medios y bajos, tradicionalmente desatendidas por otros sistemas.

La versión ONNX, publicada por la comunidad onnx-community, permite ejecutar el modelo en entornos optimizados para inferencia, como ONNX Runtime, Transformers.js en el navegador o servidores con text-embeddings-inference. Con 330 millones de parámetros, este modelo ofrece un equilibrio razonable entre capacidad y eficiencia, siendo adecuado para tareas de búsqueda semántica, recuperación de información y clasificación de texto en entornos multilingües. Su licencia Apache 2.0 facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (no especificada en detalle) |
| Parametros totales | 330 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato ONNX, posiblemente fp32/fp16) |
| Idiomas soportados | Más de 200, incluyendo en, zh, ru, es, fr, de, ar, nl, vi, hi, ko, ja, it, id, pt, pl, tr, da, th, sv, fa, uk, cs, no, el, ca, ro, fi, bg, tl, gl, my, hy, km, ne, hu, eu, he, lo, sw, az, lv, si, sk, tg, et, lt, ms, hr, is, sl, sr, ur, bn, af, ta, ka, te, ml, mn, nn, kk, cy, mr, sq, nb, mk, jv, kn, eo, la, gu, uz, am, oc, be, mg, vo, pa, lb, ht, br, ga, xh, tt, bs, yo |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivos .onnx) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de tratarse de un modelo de embeddings basado en transformer. La familia F2LLM-v2 se entrena sobre un conjunto de datos compuesto por 60 millones de muestras públicas de alta calidad, con un énfasis particular en la cobertura de idiomas de recursos medios y bajos. El modelo de 330M es una de las variantes "instruct", lo que sugiere que ha sido ajustado para seguir instrucciones de tarea, como la generación de embeddings para consultas y documentos con prompts específicos. No se mencionan técnicas como RLHF o DPO en la documentación disponible.

La conversión a ONNX se realizó automáticamente mediante un espacio de Hugging Face, manteniendo la compatibilidad con bibliotecas como Transformers.js y ONNX Runtime. El repositorio incluye el modelo en formato ONNX, con un tamaño total de 3.7 GB, lo que sugiere que puede contener múltiples variantes de precisión o cuantización, aunque no se especifican.

## Capacidades

- Generación de embeddings de texto para frases, consultas y documentos.
- Búsqueda semántica y recuperación de información multilingüe.
- Clasificación de texto y agrupación por similitud.
- Soporte para más de 200 idiomas, incluyendo lenguas de baja representación.
- Compatible con la biblioteca Sentence Transformers para codificación de consultas y documentos con prompts específicos.
- Integración con Transformers.js para ejecución en navegador o entornos JavaScript.
- Formato ONNX optimizado para inferencia con ONNX Runtime y text-embeddings-inference.

## Casos de uso

- Búsqueda semántica en bases de conocimiento multilingües: el modelo puede indexar documentos en decenas de idiomas y recuperar los más relevantes para una consulta, gracias a su soporte de más de 200 lenguas y su capacidad para generar embeddings comparables mediante similitud coseno.
- Sistemas de atención al cliente automatizada: al codificar mensajes de usuarios y respuestas de la base de conocimiento, permite enrutar consultas a los artículos adecuados o sugerir respuestas predefinidas, incluso cuando el usuario escribe en idiomas minoritarios.
- Clasificación de textos legales o administrativos: el modelo puede asignar categorías a documentos en múltiples idiomas, facilitando la organización de expedientes en organismos públicos o despachos internacionales.
- Deduplicación de contenido en plataformas colaborativas: comparando embeddings de textos, se pueden detectar entradas duplicadas o muy similares en foros, wikis o repositorios de documentos, incluso si están redactadas en distintos idiomas.
- Motor de recomendación de artículos científicos: codificando títulos y resúmenes de papers, el modelo permite sugerir publicaciones relacionadas a investigadores que trabajan en campos multidisciplinares y en varios idiomas.
- Análisis de sentimiento en redes sociales multilingües: al generar embeddings de publicaciones, se pueden agrupar por polaridad o tema, permitiendo monitorizar opiniones en mercados donde se hablan lenguas de baja representación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 330 millones de parámetros, el modelo en fp32 ocupa aproximadamente 1.3 GB, en fp16 unos 0.66 GB y en int8 unos 0.33 GB. La versión ONNX puede incluir varias precisiones, pero no se especifican.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en fp16. Tarjetas como NVIDIA GTX 1650, RTX 3060 o superiores son suficientes. También puede ejecutarse en CPU con razonable rendimiento.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: ONNX Runtime, Transformers.js (navegador), text-embeddings-inference, Sentence Transformers con backend ONNX.
- Latencia y throughput: no se dispone de datos oficiales. Para un modelo de 330M, se espera una latencia de decenas de milisegundos por lote pequeño en GPU moderna.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos alternativos de la misma categoría. Se recomienda consultar benchmarks públicos de modelos de embeddings como BGE, E5 o GTE para contextualizar el rendimiento de F2LLM-v2-330M.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos públicos, puede reflejar sesgos presentes en esos datos.
- Riesgo de alucinación: al ser un modelo de embeddings, no genera texto, por lo que el riesgo de alucinación es bajo, pero la calidad de las representaciones puede degradarse en dominios muy especializados.
- Limitaciones de contexto: no se especifica la longitud máxima de entrada, pero los modelos de embeddings suelen limitarse a 512 o 1024 tokens. Se recomienda verificar la documentación del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia.
- Para producción, es recomendable evaluar el modelo en el dominio específico y comparar con alternativas de mayor tamaño si la precisión es crítica.

## Enlaces

- Repositorio HuggingFace del modelo ONNX: https://huggingface.co/onnx-community/F2LLM-v2-330M-ONNX
- Modelo base original: https://huggingface.co/codefuse-ai/F2LLM-v2-330M
- Paper asociado (ID arxiv:2603.19223): no disponible enlace directo, pero se puede buscar en arxiv por el ID.
- Organización onnx-community: https://huggingface.co/onnx-community
