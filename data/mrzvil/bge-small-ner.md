# MrZVIL/bge-small-ner

## Resumen

MrZVIL/bge-small-ner es un modelo de clasificación de tokens (token-classification) obtenido por ajuste fino (*fine-tuning*) del modelo de embeddings BAAI/bge-small-en-v1.5. Lo publica el usuario MrZVIL en HuggingFace bajo licencia MIT y con la etiqueta `generated_from_trainer`, lo que indica que la model card se generó automáticamente a partir del `Trainer` de HuggingFace y que el autor no ha completado la documentación. El modelo cuenta con 33.215.625 parámetros y un repositorio de 0,1 GB en formato safetensors.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: se trata de un modelo sin descargas ni interacciones en el momento de la consulta, entrenado sobre un conjunto de datos que el propio autor describe como "unknown dataset". La model card no especifica el esquema de etiquetas (tipos de entidades), el dominio de aplicación ni los idiomas soportados, por lo que su utilidad práctica depende de una validación previa por parte de quien lo evalúe.

Aun así, los números de evaluación declarados son razonables para una tarea de reconocimiento de entidades nombradas (NER): F1 de 0,8715, precisión de 0,8508, exhaustividad de 0,8932 y accuracy de 0,9536 sobre el conjunto de evaluación, tras tres épocas de entrenamiento. Al derivar de un encoder BERT pequeño, el modelo es ligero y puede ejecutarse en CPU o en GPU de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (etiqueta `bert` en HuggingFace), con cabeza de clasificación de tokens |
| Parámetros totales | 33.215.625 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card (el modelo base BGE-small-en-v1.5 se documenta habitualmente con 512 tokens) |
| Tipos de cuantización | No disponible; el repositorio solo contiene pesos en safetensors sin versiones cuantizadas publicadas |
| Idiomas soportados | No disponible; el modelo base es de orientación inglesa |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de BAAI/bge-small-en-v1.5, un encoder tipo BERT de la familia BGE (BAAI General Embeddings) orientado originalmente a la generación de embeddings de frase para recuperación de información. Sobre esa base se ha añadido una cabeza de clasificación de tokens y se ha ajustado el conjunto para la tarea de etiquetado secuencial, dando lugar a un total de 33.215.625 parámetros. No hay información pública sobre cuántas capas se descongelaron, si se congeló el encoder o qué esquema de etiquetas BIO se empleó.

El entrenamiento se realizó con los siguientes hiperparámetros declarados: tasa de aprendizaje 2e-05, tamaño de lote de entrenamiento y evaluación de 16, semilla 42, optimizador AdamW (variante `ADAMW_TORCH_FUSED`, betas 0,9/0,999, epsilon 1e-08), planificador lineal y 3 épocas completas, equivalentes a 1875 pasos (625 pasos por época, lo que implica del orden de 10.000 ejemplos por época si el lote fue siempre completo). No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO u optimización posterior. Las versiones de framework declaradas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

## Capacidades

- Reconocimiento de entidades nombradas (NER) mediante clasificación de tokens a nivel de subtoken; no es un modelo generativo y no produce texto libre.
- Asignación de etiquetas a secuencias de entrada, presumiblemente en esquema BIO/BILUO, aunque el conjunto de etiquetas no está documentado.
- El modelo base BGE-small-en-v1.5 está orientado al inglés, por lo que es previsible que el rendimiento decaiga en otros idiomas, si bien este extremo no está confirmado en la información disponible.
- No se documenta soporte de *tool calling*, *function calling*, razonamiento multi-paso ni modo de pensamiento (*thinking*), capacidades propias de modelos generativos e instruct.
- No se documentan capacidades de visión, audio ni multimodalidad.
- Al ser un modelo de 33 millones de parámetros, su inferencia es muy rápida y puede ejecutarse en CPU.

## Casos de uso

- Extracción de entidades en pipelines de procesamiento documental: el modelo puede etiquetar personas, organizaciones o localizaciones en textos ya segmentados, integrándose como paso previo a un indexado o a una base de datos estructurada.
- Anonimización y seudonimización de datos personales: detectar menciones de nombres propios u otras entidades para enmascararlas antes de almacenar o compartir un corpus, un paso habitual en el cumplimiento del RGPD.
- Enriquecimiento de metadatos para motores de búsqueda: poblar campos estructurados (autor, entidad, lugar) a partir del texto plano de artículos o informes, mejorando los filtros de búsqueda.
- Preprocesamiento para sistemas RAG: usar las entidades detectadas como metadatos de filtrado en la recuperación, de modo que las consultas se restrinjan a documentos que mencionan una organización o una persona concreta.
- Análisis de menciones de marca o reputación: procesar grandes volúmenes de reseñas o publicaciones para contabilizar menciones de marcas, productos o competidores, aprovechando el bajo coste de inferencia del modelo.
- Etiquetado asistido en anotación de datos: generar preanotaciones que un revisor humano corrige después, reduciendo el coste de construir un corpus NER propio.
- Moderación y filtrado de contenido: identificar entidades sensibles en flujos de texto entrante como señal previa para reglas de moderación o de escalado a revisión humana.
- Clasificación en tiempo real de flujos de baja latencia: al requerir muy poca VRAM, puede desplegarse junto a otros servicios en una única GPU o incluso en el mismo proceso de CPU que atiende peticiones.

## Benchmarks y rendimiento

El `model-index` publicado por el autor está vacío, por lo que no hay resultados de benchmarks estándar (MMLU, GLUE, CoNLL-2003, etc.) asociados al modelo. La model card sí declara métricas sobre el conjunto de evaluación interno, que se reproducen tal cual:

| Métrica | Valor (época 3, final) |
|---|---|
| Loss | 0,3430 |
| Precisión | 0,8508 |
| Exhaustividad (recall) | 0,8932 |
| F1 | 0,8715 |
| Accuracy | 0,9536 |

Evolución durante el entrenamiento:

| Época | Paso | Validation loss | Precisión | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1.0 | 625 | 0,5192 | 0,7079 | 0,7634 | 0,7346 | 0,9325 |
| 2.0 | 1250 | 0,3699 | 0,8334 | 0,8742 | 0,8533 | 0,9511 |
| 3.0 | 1875 | 0,3430 | 0,8508 | 0,8932 | 0,8715 | 0,9536 |

No se dispone de información sobre el conjunto de evaluación (tamaño, dominio ni esquema de etiquetas), por lo que estas cifras no son comparables con resultados publicados sobre benchmarks NER conocidos.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, alrededor de 133 MB solo para los pesos (33,2 M de parámetros × 4 bytes), más el consumo del runtime y de las activaciones; en fp16, unos 66 MB; en int8, unos 33 MB si se cuantiza. El repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no se requiere A100, H100 ni tarjetas de gama alta. Una GTX 1650, RTX 3060 o superior resultan holgadas.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas actuales e incluso en iGPU con memoria compartida.
- Cabe en CPU: sí; con 33 millones de parámetros, la inferencia en CPU es viable para cargas moderadas, especialmente si se exporta a ONNX.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, exportación a ONNX Runtime, TorchServe, FastAPI o BentoML. vLLM y TGI están orientados a modelos generativos y decodificación de tokens, por lo que no son la vía habitual para un modelo de clasificación de tokens.
- Latencia y throughput: no disponibles; no se han publicado mediciones. El tamaño del modelo sugiere latencias de milisegundos en GPU, pero se trata de una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MrZVIL/bge-small-ner | 33.215.625 | No disponible | Clasificación de tokens (NER) | MIT | HuggingFace, 0 descargas |
| Greg908/bge-small-ner | No disponible | No disponible | Clasificación de tokens (NER) | No disponible | HuggingFace |
| BAAI/bge-small-en-v1.5 (modelo base) | No disponible en la información proporcionada | No disponible | Embeddings de frase / recuperación | No disponible en la información proporcionada | HuggingFace, ampliamente utilizado |
| BAAI/bge-small-en (versión anterior) | No disponible | No disponible | Embeddings de frase | No disponible | HuggingFace; el propio proyecto recomienda migrar a la v1.5 |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información consultada, más allá de que el modelo base recomienda el uso de la versión 1.5 frente a la anterior por presentar una distribución de similitudes más razonable.

## Limitaciones y advertencias

- El conjunto de datos de entrenamiento y evaluación no está documentado ("unknown dataset"), por lo que se desconocen el dominio, el esquema de etiquetas y la distribución de clases.
- No hay información sobre sesgos demográficos, geográficos o lingüísticos; al derivar de un modelo base de orientación inglesa, es probable que el rendimiento sea muy inferior en textos en castellano u otros idiomas.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no produce texto libre; el equivalente aquí es el riesgo de falsos positivos y etiquetas mal asignadas, especialmente en dominios distintos al de entrenamiento.
- No hay garantía de generalización: las métricas declaradas proceden de un único conjunto de evaluación interno, sin validación cruzada ni evaluación en benchmarks públicos.
- El modelo tiene 0 descargas y 0 interacciones en el momento de la consulta, por lo que no existe evidencia de uso en producción ni validación por terceros.
- No se han publicado versiones cuantizadas (GGUF, int8, etc.), lo que limita algunas rutas de despliegue en entornos muy restringidos.
- Licencia MIT: permite uso comercial y modificación con atribución y sin garantías; conviene revisar igualmente las condiciones del modelo base BAAI/bge-small-en-v1.5, cuya licencia no se detalla en la información proporcionada.
- Para uso en producción se recomienda auditar el modelo con un conjunto de evaluación propio y representativo antes de integrarlo en cualquier flujo crítico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MrZVIL/bge-small-ner
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Versión anterior del modelo base: https://huggingface.co/BAAI/bge-small-en
- Modelo homónimo de otro autor: https://huggingface.co/Greg908/bge-small-ner
- Documentación de la familia BGE: https://bge-model.com/bge/index.html
- Portal de la serie BGE (BAAI): https://bge.baai.ac.cn/
- Repositorio FlagEmbedding: https://github.com/FlagOpen/FlagEmbedding
