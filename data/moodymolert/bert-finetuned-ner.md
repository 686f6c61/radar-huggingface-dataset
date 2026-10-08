# MoodyMolert/bert-finetuned-ner

## Resumen

bert-finetuned-ner es un modelo de clasificación de tokens (token classification) publicado por el usuario MoodyMolert en HuggingFace. Se trata de un ajuste fino del encoder BAAI/bge-small-en-v1.5 para reconocimiento de entidades nombradas (NER), con 33.215.625 parámetros y un repositorio de 0,1 GB distribuido en formato safetensors bajo licencia MIT.

El modelo resuelve la tarea clásica de etiquetado secuencial: asignar a cada token de entrada una etiqueta de entidad (por ejemplo, persona, organización o localización), lo que permite extraer automáticamente entidades de texto no estructurado. Al partir de un encoder pequeño tipo BERT de 33 millones de parámetros, su interés está en escenarios con recursos de cómputo limitados, inferencia en CPU y despliegues de baja latencia.

Su relevancia práctica debe matizarse: la model card está generada automáticamente por el Trainer, no documenta el conjunto de datos de entrenamiento ni los tipos de entidad soportados, y el modelo acumula 0 descargas y 0 likes en el momento de la consulta. Los resultados de evaluación declarados (F1 0,9159 y accuracy 0,9827) son cifras autoinformadas por el autor sobre un conjunto de evaluación no identificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder tipo BERT (base: BAAI/bge-small-en-v1.5), cabeza de clasificación de tokens |
| Parámetros totales | 33.215.625 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base BAAI/bge-small-en-v1.5 utiliza una ventana de 512 tokens |
| Tipos de cuantización | No disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | No disponibles; el modelo base está entrenado principalmente en inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder bidireccional tipo BERT sobre el que se añade una cabeza de clasificación por token. El modelo base es BAAI/bge-small-en-v1.5, un encoder de la familia BGE orientado originalmente a embeddings de recuperación, con aproximadamente 33 millones de parámetros. El ajuste fino se realizó con la librería Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

Los hiperparámetros declarados son: learning rate 2e-05, batch de entrenamiento y evaluación de 16, optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-08), scheduler lineal, seed 42 y 20 épocas. La tabla de entrenamiento registra 625 pasos por época, lo que implica aproximadamente 10.000 ejemplos por época con batch de 16 y sin acumulación de gradientes. No se especifica el dataset, el esquema de etiquetas (BIO, BIOES), el número de tipos de entidad ni si se aplicaron técnicas de regularización o early stopping. No hay información sobre RLHF, DPO ni decodificación especulativa, ya que no es un modelo generativo.

El principal indicio de sobreajuste es la divergencia entre la pérdida de entrenamiento (0,0236 en la época 14) y la pérdida de validación, que toca mínimo en la época 6 (0,1583) y vuelve a subir hasta 0,1850 en la época 15.

## Capacidades

- Reconocimiento de entidades nombradas: etiquetado por token de entidades en texto, siempre que las categorías coincidan con las del conjunto de entrenamiento (no documentado).
- Clasificación de tokens en general: al ser una cabeza token-classification, puede reutilizarse para tareas de etiquetado secuencial distintas de NER tras un nuevo ajuste fino.
- Inferencia eficiente: 33 millones de parámetros permiten ejecución en CPU y en GPU de gama baja con latencia baja.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible indica que el modelo puede servirse a través de la infraestructura de Inference Endpoints de HuggingFace.
- Generación de texto: no soportada (arquitectura encoder-only, sin decodificador).
- Razonamiento multi-paso, tool calling y function calling: no soportados.
- Capacidades multimodales (visión, audio) y modo thinking: no soportados.
- Capacidades multilingües: no documentadas; el modelo base está orientado al inglés.

## Casos de uso

- Extracción de entidades en pipelines de análisis documental: procesar contratos, facturas o informes y extraer nombres de personas, organizaciones y localizaciones para poblar una base de datos estructurada, aprovechando el bajo coste de un encoder de 33 millones de parámetros.
- Anonimización y cumplimiento normativo (RGPD): detectar entidades de tipo persona en textos antes de almacenarlos o compartirlos, como paso previo al enmascaramiento de datos personales. Requiere validar previamente qué etiquetas reconoce el modelo.
- Enriquecimiento de metadatos en motores de búsqueda o RAG: etiquetar documentos con entidades para mejorar los filtros de recuperación, ya que el modelo base BGE está orientado a representaciones semánticas de texto.
- Preanotación en anotación humana: usar el modelo como etiquetador automático de primera pasada para que los anotadores corrijan en lugar de etiquetar desde cero, reduciendo el coste de construcción de datasets NER.
- Clasificación de tickets de soporte: extraer productos, organizaciones o ubicaciones mencionadas en incidencias para enrutarlas automáticamente al equipo correspondiente.
- Procesamiento por lotes en CPU: al ocupar aproximadamente 133 MB en fp32, puede desplegarse en servidores sin GPU para tareas de etiquetado por lotes con throughput moderado.
- Punto de partida para ajuste fino específico de dominio: sirve como inicialización para un NER sectorial (legal, sanitario, financiero) cuando no se dispone de presupuesto para modelos mayores.

## Benchmarks y rendimiento

El model-index declarado por el autor está vacío (`results: []`), por lo que no hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, GLUE, CoNLL-2003) publicados. Las únicas cifras disponibles son las métricas de evaluación autoinformadas en la model card, sobre un conjunto de evaluación no identificado:

| Métrica | Valor (evaluación final) |
|---|---|
| Loss | 0,1850 |
| Precision | 0,9038 |
| Recall | 0,9283 |
| F1 | 0,9159 |
| Accuracy | 0,9827 |

Progresión durante el entrenamiento (épocas registradas en la model card):

| Época | Paso | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1 | 625 | 0,3470 | 0,7751 | 0,8251 | 0,7993 | 0,9634 |
| 2 | 1250 | 0,2192 | 0,8630 | 0,8957 | 0,8790 | 0,9765 |
| 3 | 1875 | 0,1803 | 0,8666 | 0,9100 | 0,8878 | 0,9784 |
| 4 | 2500 | 0,1673 | 0,8847 | 0,9177 | 0,9009 | 0,9809 |
| 5 | 3125 | 0,1636 | 0,8974 | 0,9217 | 0,9094 | 0,9814 |
| 6 | 3750 | 0,1583 | 0,8963 | 0,9224 | 0,9092 | 0,9818 |
| 7 | 4375 | 0,1656 | 0,8986 | 0,9261 | 0,9121 | 0,9813 |
| 8 | 5000 | 0,1709 | 0,9035 | 0,9246 | 0,9139 | 0,9823 |
| 9 | 5625 | 0,1695 | 0,9051 | 0,9280 | 0,9164 | 0,9825 |
| 10 | 6250 | 0,1735 | 0,9018 | 0,9285 | 0,9149 | 0,9819 |
| 11 | 6875 | 0,1768 | 0,9016 | 0,9256 | 0,9135 | 0,9822 |
| 12 | 7500 | 0,1800 | 0,9068 | 0,9305 | 0,9185 | 0,9824 |
| 13 | 8125 | 0,1821 | 0,9074 | 0,9290 | 0,9181 | 0,9827 |
| 14 | 8750 | 0,1793 | 0,9100 | 0,9290 | 0,9194 | 0,9830 |
| 15 | 9375 | 0,1850 | 0,9038 | 0,9283 | 0,9159 | 0,9827 |

Notas: la tabla de la model card solo llega a la época 15 pese a estar configurado un entrenamiento de 20 épocas, y las métricas finales coinciden con la fila de la época 15. La mejor F1 registrada es 0,9194 en la época 14, superior a la métrica final declarada de 0,9159. No se dispone de comparación contra un baseline público ni de la naturaleza del conjunto de evaluación.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 133 MB (33,2 M de parámetros × 4 bytes).
- Pesos en fp16/bf16: aproximadamente 66 MB.
- Pesos en int8: aproximadamente 33 MB (la cuantización no está publicada en el repositorio, requeriría conversión externa).
- VRAM estimada para inferencia: inferior a 1 GB en fp16 con lotes pequeños, incluyendo activaciones y overhead del runtime.
- GPU: funciona en cualquier GPU con al menos 2 GB de VRAM; no requiere A100, H100 ni tarjetas de datacenter. Cabe sin problema en RTX 3060, RTX 4060, RTX 4090, T4, L4 o incluso en GPUs integradas.
- CPU: es viable la inferencia en CPU para lotes pequeños o moderados, dado el tamaño del modelo.
- Opciones de despliegue: pipeline de Transformers, HuggingFace Inference Endpoints (etiqueta endpoints_compatible), exportación a ONNX Runtime o TorchScript, y servidores de inferencia de propósito general (Triton, TorchServe). vLLM y llama.cpp no son adecuados: vLLM está orientado a modelos generativos y llama.cpp no soporta de forma nativa cabezas de token classification de este tipo.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

Datos de esta ficha tomados del repositorio del modelo. Las cifras de los modelos alternativos provienen de su documentación pública y no se han verificado en esta ficha.

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoodyMolert/bert-finetuned-ner | 33.215.625 | Token classification (NER) | No disponible (base de 512 tokens) | MIT | HuggingFace, 0 descargas, 0 likes |
| BAAI/bge-small-en-v1.5 (modelo base) | Aprox. 33 M | Embeddings de texto / recuperación | 512 tokens según su documentación | MIT | HuggingFace, ampliamente utilizado |
| dslim/bert-base-NER | Aprox. 110 M según su documentación pública | Token classification (NER, 4 tipos de entidad) | 512 tokens según su documentación | MIT | HuggingFace, muy utilizado como referencia NER en inglés |
| Modelos NER multilingües de tipo XLM-R | No disponible | Token classification multilingüe | No disponible | No disponible | No disponible |

La comparación directa con dslim/bert-base-NER es la más relevante por categoría, aunque no se dispone de resultados de ambos sobre el mismo conjunto de evaluación, por lo que no es posible afirmar superioridad de ninguno. Frente a su modelo base, este ajuste añade la cabeza de clasificación de tokens, pero pierde la funcionalidad original de generación de embeddings de recuperación.

## Limitaciones y advertencias

- Conjunto de entrenamiento desconocido: la model card indica explícitamente "on an unknown dataset", por lo que se desconoce el dominio, el idioma y el esquema de etiquetas aprendido.
- Tipos de entidad no documentados: no se especifica si el modelo etiqueta personas, organizaciones, localizaciones u otras categorías, ni el formato de las etiquetas de salida. Es imprescindible inspeccionar `config.json` e `id2label` antes de cualquier uso.
- Métricas autoinformadas: los valores de F1 y accuracy proceden del propio autor sobre un conjunto de evaluación no identificado, sin verificación independiente ni resultados en el model-index.
- Indicio de sobreajuste: la pérdida de validación mínima se alcanza en la época 6 y aumenta de forma sostenida hasta la época 15, mientras la pérdida de entrenamiento sigue bajando.
- Sesgos: no documentados. Al derivar de un modelo entrenado principalmente en inglés, es probable que el rendimiento caiga en otros idiomas y que herede sesgos de género, nacionalidad u origen presentes en los corpus de entrenamiento. Este punto no puede cuantificarse con la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y de etiquetados incorrectos en textos fuera de dominio, especialmente con entidades ambiguas o fuera del vocabulario de entrenamiento.
- Idiomas: no declarados. No debe asumirse soporte multilingüe.
- Contexto: ventana limitada a 512 tokens según el modelo base, lo que obliga a trocear documentos largos y puede romper entidades a caballo entre fragmentos.
- Validación comunitaria nula: 0 descargas y 0 likes. No hay evidencia de uso en producción ni de terceros que hayan reproducido los resultados.
- Licencia: MIT, permisiva y compatible con uso comercial, siempre que se conserve el aviso de copyright. Conviene verificar también la licencia del modelo base (BAAI/bge-small-en-v1.5, MIT).
- Caveat de reproducibilidad: las fechas registradas en el repositorio (7 de octubre de 2026) son posteriores a la fecha de consulta habitual de este tipo de fichas, lo que sugiere un registro reciente o una fecha anómala.
- Para producción: se recomienda reentrenar o al menos reevaluar el modelo sobre un conjunto propio etiquetado, dado que no hay garantía de que las categorías aprendidas coincidan con las necesidades del caso de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MoodyMolert/bert-finetuned-ner
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo. Las únicas coincidencias devueltas corresponden a páginas comerciales de platos de ducha de resina, sin relación alguna con el modelo, por lo que no se incluyen.
- Paper, blog o repositorio adicionales: no disponibles.
