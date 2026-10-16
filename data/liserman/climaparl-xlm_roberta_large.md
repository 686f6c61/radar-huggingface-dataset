# liserman/climaparl-xlm_roberta_large

## Resumen

`liserman/climaparl-xlm_roberta_large` es un modelo de clasificación de texto publicado en HuggingFace por el usuario `liserman`, construido sobre la arquitectura XLM-RoBERTa-large. El repositorio contiene 559.893.507 parámetros (dato extraído directamente de los pesos en safetensors) y ocupa 1,1 GB, lo que coincide con pesos almacenados en fp16/bf16. La librería declarada es transformers y el pipeline asignado es `text-classification`.

El identificador del modelo sugiere un ajuste fino orientado a un dominio concreto (la combinación "clima" + "parl" apunta a textos climáticos o parlamentarios), pero la model card no confirma ni el dominio, ni el dataset, ni el procedimiento de entrenamiento: es la plantilla automática de HuggingFace sin rellenar. Tampoco se declaran licencia, idiomas soportados, autoría real ni métricas de evaluación.

La relevancia de esta ficha es limitada y conviene ser explícito: se trata de un repositorio sin descargas ni "likes" en el momento de la consulta, sin documentación técnica y sin resultados publicados. Su interés práctico radica en que, al derivar de XLM-RoBERTa-large, hereda el comportamiento multilingüe (100 idiomas) y la ventana de 512 tokens de la arquitectura base, por lo que puede utilizarse como punto de partida para clasificación multilingüe siempre que se valide su comportamiento de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large, derivada del modelo base; no documentada en la model card) |
| Parametros totales | 559.893.507 (segun safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de XLM-RoBERTa-large; no confirmada en la model card) |
| Tipos de cuantizacion | No disponible en el repositorio; solo se distribuyen pesos en safetensors |
| Idiomas soportados | No disponible en la model card (la arquitectura base cubre 100 idiomas) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es XLM-RoBERTa-large, un transformer encoder de 24 capas, dimensión oculta 1024, 16 cabezas de atención y vocabulario SentencePiece de 250.000 tokens, con 559 millones de parámetros, lo que cuadra exactamente con el recuento del repositorio. Es un modelo exclusivamente encoder, sin cabecera generativa: la salida es una representación por token que se proyecta sobre una cabeza de clasificación. La model card no describe ninguna modificación estructural respecto al modelo base.

No hay información disponible sobre el entrenamiento: se desconoce el dataset, el número de tokens de ajuste fino, la composición de las clases, si hubo congelación de capas, la tasa de aprendizaje, el régimen de precisión (fp32, fp16, bf16) o si se aplicaron técnicas como DPO o RLHF (que, por otra parte, no son habituales en modelos de clasificación). Tampoco se documenta ninguna innovación técnica adicional.

## Capacidades

- Clasificación de texto por secuencia, con la etiqueta correspondiente según la cabeza entrenada. El número y nombre de clases no está documentado.
- Extracción de embeddings contextuales multilingües por token y por secuencia (uso como encoder dentro de `text-embeddings-inference`).
- Etiquetado compatible con `endpoints_compatible`, es decir, desplegable en HuggingFace Inference Endpoints.
- Capacidad multilingüe heredada de XLM-RoBERTa-large (100 idiomas en el modelo base), no verificada en este ajuste concreto.
- No soporta generación de texto, tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder de clasificación.
- No dispone de modo "thinking", visión, audio ni ninguna modalidad distinta de texto.

## Casos de uso

- Clasificación de documentos climáticos: etiquetar informes, notas de prensa o comunicados según categorías temáticas definidas por el desarrollador, aprovechando el ajuste fino y el soporte multilingüe del encoder.
- Análisis de actas parlamentarias: asignar cada intervención o moción a una categoría (energía, transporte, adaptación, mitigación) para construir series temporales de actividad legislativa.
- Moderación de contenido temático: filtrar o priorizar comentarios y publicaciones relacionadas con el clima en plataformas de discusión, siempre que se valide el umbral de confianza con datos propios.
- Enrutado en pipelines RAG: usar el modelo como clasificador ligero de intención o dominio antes de enviar la consulta al generador o al índice vectorial correspondiente.
- Extracción de embeddings para búsqueda semántica: emplear la salida del encoder como representación vectorial de frases o párrafos en un sistema de recuperación multilingüe.
- Anotación asistida en investigación social: preetiquetar grandes corpus de discurso público para revisión humana posterior, reduciendo el coste de anotación manual.
- Clasificación en tiempo real en producción: con 560 millones de parámetros y pesos en fp16 (~1,1 GB), cabe en una GPU de gama media y permite lotes grandes con latencias de milisegundos por secuencia corta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye sección de evaluación cumplimentada (todas las entradas aparecen como "[More Information Needed]") y el repositorio no enlaza a ningún informe, paper ni demo.

## Requisitos de hardware

- VRAM estimada en inferencia: aproximadamente 2,2 GB en fp32, 1,1 GB en fp16/bf16 y 0,6 GB en int8 (esta última requiere cuantización posterior, no incluida en el repositorio).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 en lotes pequeños; A100, H100, L40S o RTX 3090/4090 para despliegues con lotes grandes y baja latencia.
- Compatible con GPU de consumo: sí. Cabe sin problema en RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4090 e incluso en GPUs integradas modestas si se limita el tamaño de lote.
- Opciones de despliegue: transformers con PyTorch, HuggingFace Inference Endpoints, `text-embeddings-inference` para extracción de embeddings, ONNX Runtime o TensorRT para optimización, y exportación a GGUF si se requiere ejecución en CPU.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liserman/climaparl-xlm_roberta_large | 559,9 M | 512 tokens (heredado) | no disponible | no disponible | HuggingFace, 0 descargas |
| XLM-RoBERTa-large (FacebookAI) | 559,9 M | 512 tokens | 100 | MIT | HuggingFace, ampliamente usado |
| mDeBERTa-v3-base (Microsoft) | ~278 M | 512 tokens | 100 | MIT | HuggingFace |
| BERT-base-multilingual-cased (Google) | ~178 M | 512 tokens | 104 | Apache 2.0 | HuggingFace |

La comparación con XLM-RoBERTa-large es directa: mismo tamaño de parámetros y misma arquitectura, con la diferencia de que este repositorio no aporta documentación, licencia ni métricas. Frente a mDeBERTa-v3-base ofrece el doble de parámetros y potencialmente mayor capacidad representacional, pero también mayor coste de inferencia. No hay datos de rendimiento que permitan comparar calidad de clasificación.

## Limitaciones y advertencias

- Model card vacía: no se documentan dataset, clases, hiperparámetros ni procedencia, lo que impide reproducir el ajuste o auditar el sesgo.
- Licencia no disponible: sin licencia declarada no se puede asumir permiso para uso comercial; es necesario contactar con el autor antes de integrarlo en un producto.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí existe riesgo de clasificaciones erróneas y sobreconfianza en las probabilidades de salida si el ajuste se hizo con pocos ejemplos.
- Idiomas no declarados: aunque la arquitectura base cubre 100 idiomas, no hay garantía de que el ajuste fino preserve el comportamiento multilingüe; hay que validarlo con datos propios por idioma.
- Ventana de 512 tokens: los documentos largos deben truncarse o segmentarse, lo que puede degradar la clasificación en textos legislativos extensos.
- Sesgos: al desconocerse el corpus de ajuste, no se pueden anticipar sesgos temáticos, geográficos o ideológicos, especialmente relevante si el dominio es climático o parlamentario.
- Métricas ausentes: sin precisión, recall ni F1 publicados, el modelo no debería desplegarse en producción sin una evaluación previa sobre un conjunto de validación propio.
- Repositorio sin tracción: 0 descargas y 0 "likes" en la fecha de consulta, lo que reduce la probabilidad de que existan informes de terceros sobre su comportamiento real.
- Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan ninguna relación con el modelo (contenido no relevante y de índole adulta), por lo que no se han utilizado como fuente.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/liserman/climaparl-xlm_roberta_large
- Modelo base XLM-RoBERTa-large: https://huggingface.co/FacebookAI/xlm-roberta-large
- Paper de XLM-R (Unsupervised Cross-lingual Representation Learning at Scale): https://arxiv.org/abs/1911.02116
- Referencia arXiv presente en los tags del repositorio (arxiv:1910.09700), correspondiente a "Quantifying the Carbon Emissions of Machine Learning": https://arxiv.org/abs/1910.09700
- Documentación de XLM-RoBERTa en transformers: https://huggingface.co/docs/transformers/model_doc/xlm-roberta
