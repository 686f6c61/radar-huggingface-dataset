# masahiroid/gte-reranker-modernbert-base-coreml

## Resumen

`gte-reranker-modernbert-base-coreml` es una conversión a formato Core ML del modelo de reranking `Alibaba-NLP/gte-reranker-modernbert-base`, desarrollado originalmente por Alibaba-NLP y convertido por el usuario masahiroid. Se trata de un cross-encoder basado en ModernBERT que recibe un par consulta-documento y devuelve un logit de relevancia sin normalizar: cuanto mayor es el valor, más relevante es el documento para la consulta. La conversión preserva la cabeza de clasificación original con mean-pooling y no introduce ningún reentrenamiento ni ajuste fino adicional.

El interés de esta ficha radica en que permite ejecutar un reranker de calidad en el ecosistema Apple (macOS 14/iOS 17 en adelante) mediante Core ML, sin necesidad de PyTorch en tiempo de inferencia. El paquete incluye helpers de tokenización y conversión de formas, y ha sido validado numéricamente contra el checkpoint original con una diferencia absoluta máxima de 2,03e-06 y similitud coseno mínima de 1.

Es importante subrayar que se trata de una conversión de formato (F32, no cuantización de 4 bits) con formas fijas y batch size 1, limitada a 128 tokens compartidos entre consulta y documento, lo que restringe su uso a escenarios de reranking de pasajes cortos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, cross-encoder para reranking) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens fijos en la exportacion (consulta y documento comparten el limite); el checkpoint original soporta contextos mas largos, pero no se exponen en esta conversion |
| Tipos de cuantizacion | F32 (sin cuantizacion; el autor indica explicitamente que no es 4-bit) |
| Idiomas soportados | no disponible en la informacion proporcionada (los tests de validacion incluyen texto en ingles y japones para otros modelos del mismo paquete, pero no se declara un listado oficial) |
| Licencia | Apache-2.0 (pesos originales); MIT para el codigo de runtime y conversion |
| Formato de pesos | Core ML ML Program (`*.mlpackage`), datos guardados sin checkpoints pickle |

## Arquitectura y entrenamiento

El modelo subyacente es `Alibaba-NLP/gte-reranker-modernbert-base`, un cross-encoder construido sobre ModernBERT, un transformer encoder-only de la familia ModernBERT. La tarea es de reranking: se tokeniza el par (consulta, documento) como un par de texto y se obtiene un logit de relevancia mediante una cabeza de clasificación con mean-pooling. Esta conversión concreta no aporta información sobre el proceso de entrenamiento del checkpoint original (número de tokens, composición del dataset, uso de RLHF/DPO), por lo que esos datos deben consultarse en la model card de Alibaba-NLP.

La innovación técnica de esta publicación es exclusivamente la conversión a Core ML: exportación a ML Program con formas fijas (`input_ids` y `attention_mask` de `[1, 128]`), batch size 1, y validación numérica contra el checkpoint PyTorch original (revisión `f7481e6055501a30fb19d090657df9ec1f79ab2c`). El paquete incluye `provenance.json` con el pin exacto del checkpoint fuente, scripts de reproducción (`prepare.py`, `common.py`, `build.py`, `sources.json`), vectores de validación deterministas (`*_validation_vectors.npz`) y resultados por caso en `validation.json`. El entorno de conversión probado fue PyTorch 2.14.1, Transformers 4.57.3, NumPy 1.26.4, coremltools 9.0 y MLX 0.32.4.

## Capacidades

- Reranking de pares consulta-documento: devuelve un logit de relevancia en bruto (mayor valor implica mayor relevancia), apto para reordenar listas de candidatos recuperados por un sistema de búsqueda.
- Cross-encoding con atención conjunta sobre consulta y documento, lo que captura interacciones término a término que un bi-encoder no modela.
- Ejecución en el ecosistema Apple mediante Core ML (ML Program), con inferencia validada en macOS 27.2 según el autor.
- Helpers incluidos para tokenización y conversión de formas, con una API síncrona (`ConvertedModel.text(query, text_pair=...)`) pensada para scripts independientes.
- No se declaran capacidades de generación de texto, tool calling, agentes, visión, audio ni modo de razonamiento: es un modelo discriminativo de reranking.
- Capacidades multilingües: no declaradas en la información disponible; la validación menciona pruebas con texto en inglés y japonés para otros modelos del mismo paquete, pero no se especifica el alcance idiomático de este checkpoint.

## Casos de uso

- Reranking en pipelines RAG sobre dispositivos Apple: tras una recuperación inicial con un bi-encoder, el cross-encoder reordena los candidatos en local en macOS o iOS, sin enviar consultas ni documentos a un servidor. Adecuado por su licencia Apache-2.0 y su ejecución nativa en Core ML.
- Búsqueda semántica en aplicaciones de escritorio para macOS: integración en apps nativas que necesitan puntuar la relevancia de fragmentos cortos (hasta 128 tokens compartidos) sin dependencias de PyTorch.
- Filtrado de resultados en asistentes locales: dado un conjunto de pasajes recuperados, descartar los irrelevantes aplicando un umbral sobre el logit antes de pasarlos a un modelo generativo.
- Ordenación de respuestas candidatas en sistemas de preguntas y respuestas: puntuar pares pregunta-pasaje para seleccionar la evidencia más pertinente en un corpus documental pequeño o mediano.
- Prototipado e investigación en recuperación de información sobre Apple Silicon: el paquete incluye vectores de validación y scripts de reproducción, lo que facilita comparar el comportamiento del modelo convertido con la referencia PyTorch (diferencia máxima observada de 2,03e-06).
- Evaluación de relevancia en herramientas de anotación o curación de datos: puntuar pares consulta-documento en local para priorizar revisiones humanas, con la ventaja de no requerir GPU dedicada ni servicios externos.
- Despliegue en apps iOS 17+ con procesamiento on-device: el formato ML Program y el batch size 1 encajan en flujos de inferencia por petición; el autor advierte que el rendimiento en iPhone no se ha medido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no reclama mejoras en calidad de tarea, robustez ni velocidad en dispositivo. La única métrica publicada es la fidelidad numérica de la conversión: diferencia absoluta máxima de 2,0265579e-06 y similitud coseno mínima de 1 respecto al checkpoint PyTorch original.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido de GPU dedicada; el modelo se ejecuta mediante Core ML en Apple Silicon (CPU/GPU/Neural Engine según la asignación del runtime). El repositorio ocupa 0,6 GB.
- GPU recomendadas: no disponible; el destino es hardware Apple (macOS 14/iOS 17 como mínimo de exportación, inferencia validada en macOS 27.2).
- Cabe en GPU de consumo: sí, en el sentido de que está diseñado para ejecutarse en equipos Apple Silicon de consumo; no se han publicado requisitos de memoria ni latencias.
- Opciones de despliegue: Core ML (ML Program) con `coremltools==9.0`, `numpy`, `huggingface_hub` y `transformers==4.57.3`; el paquete incluye un helper de inferencia síncrono. Existe una conversión paralela a formato Core AI en `masahiroid/gte-reranker-modernbert-base-coreai`.
- Latencia y throughput: no disponibles; el autor no ha medido el rendimiento en iPhone ni publicado cifras de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| masahiroid/gte-reranker-modernbert-base-coreml | no disponible | 128 tokens fijos (exportacion) | Core ML ML Program (F32) | Apache-2.0 (pesos) + MIT (codigo) | Conversion validada numericamente contra el original; batch 1 |
| Alibaba-NLP/gte-reranker-modernbert-base | no disponible | no disponible en la informacion proporcionada (superior a 128 segun la model card del autor de la conversion) | safetensors/PyTorch (formato original) | Apache-2.0 | Checkpoint fuente; requiere PyTorch para inferencia |
| masahiroid/gte-reranker-modernbert-base-coreai | no disponible | no disponible | Core AI | Apache-2.0 (pesos) + MIT (codigo) | Variante alternativa del mismo autor para el runtime Core AI |

No se dispone de datos de benchmarks ni de otros rerankers comparables en la información proporcionada para ampliar la comparativa con cifras de rendimiento.

## Limitaciones y advertencias

- Contexto truncado a 128 tokens compartidos entre consulta y documento: los documentos más largos se truncan, lo que puede degradar la relevancia en pasajes extensos. El checkpoint original soporta contextos mayores, pero esta exportación no los expone.
- Formas fijas y batch size 1: no admite batching ni longitudes variables sin reexportar el modelo.
- Es una conversión F32, no una cuantización: el tamaño y los requisitos de memoria no se reducen respecto al checkpoint en precisión completa.
- El autor no reclama mejoras de calidad, robustez ni velocidad; la validación se limita a la equivalencia numérica con el checkpoint original.
- Rendimiento en iPhone no medido; solo se validó la inferencia en macOS 27.2.
- Riesgo de alucinación: no aplica en sentido generativo, pero el logit de relevancia puede ser poco fiable fuera de la distribución de entrenamiento del checkpoint original; no se documentan sesgos conocidos en la información disponible.
- Idiomas soportados no declarados: conviene verificar el comportamiento en castellano antes de usarlo en producción.
- Licencia: los pesos son Apache-2.0, pero el código de runtime y conversión es MIT; revisar los términos antes de redistribuir. El autor advierte revisar el código Python incluido antes de ejecutarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/gte-reranker-modernbert-base-coreml
- Checkpoint original: https://huggingface.co/Alibaba-NLP/gte-reranker-modernbert-base
- Revisión del checkpoint fuente: https://huggingface.co/Alibaba-NLP/gte-reranker-modernbert-base/tree/f7481e6055501a30fb19d090657df9ec1f79ab2c
- Conversión a Core AI: https://huggingface.co/masahiroid/gte-reranker-modernbert-base-coreai
- Ficha de referencia del modelo original: https://huggingpeers.co/models/Alibaba-NLP/gte-reranker-modernbert-base
