# LeoDingggg/FinLongformer

## Resumen

FinLongformer es un encoder de lenguaje en inglés especializado en dominio financiero, desarrollado por el usuario LeoDingggg y publicado en Hugging Face. Se obtiene mediante preentrenamiento continuado de enmascaramiento de tokens (masked language modeling, MLM) sobre el modelo allenai/longformer-base-4096, del que hereda la arquitectura de atención dispersa de Longformer y su ventana de 4.096 tokens. Cuenta con 148.711.257 parámetros totales, 12 capas y representaciones de 768 dimensiones, y conserva la cabeza MLM original, por lo que su pipeline declarado es `fill-mask`.

El problema que aborda es la falta de encoders largos ajustados a lenguaje financiero: los modelos tipo FinBERT trabajan con contextos de 512 tokens, insuficientes para secciones narrativas de informes 10-K, actas del Federal Reserve o artículos de investigación cuantitativa. FinLongformer se distribuye como punto de partida reutilizable, sin cabeza específica de tarea ni entrenamiento con etiquetas de trading o predicción de retornos.

Su relevancia actual es la de un componente base para pipelines de NLP financiero que necesitan codificar documentos completos sin truncado agresivo. Es un modelo reciente en el repositorio (creado en octubre de 2026), con cero descargas y cero likes en el momento de redactar esta ficha, y su evaluación se limita a pérdidas MLM de validación, sin benchmarks downstream publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Longformer (transformer encoder con atención dispersa: ventana deslizante + atención global) |
| Parámetros totales | 148.711.257 (incluye cabeza MLM) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4.096 tokens, incluidos los tokens especiales |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos safetensors; el entrenamiento usó pesos FP32 con autocast BF16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con `transformers`) |
| Capas / dimensión oculta | 12 capas / 768 dimensiones |
| Tamaño del repositorio | 0,6 GB |
| Modelo base | allenai/longformer-base-4096 (relación: finetune por preentrenamiento continuado) |
| Pipeline | fill-mask |

## Arquitectura y entrenamiento

La arquitectura es la de Longformer tal cual, sin modificaciones estructurales: un transformer encoder de 12 capas y 768 dimensiones que sustituye la atención completa por atención de ventana deslizante con proyecciones específicas por dirección, más atención global en posiciones seleccionadas. En este caso, la atención global se aplica al primer token CLS, tal como indica la model card. El tokenizador y el vocabulario originales se conservan intactos.

El entrenamiento consistió en preentrenamiento continuado de MLM con enmascaramiento dinámico del 15%, longitud máxima de secuencia de 4.096 tokens, batch efectivo de 32 secuencias, optimizador AdamW con learning rate inicial de 2e-5, 5% de warmup y decaimiento lineal, y autocast BF16 manteniendo pesos del modelo en FP32. El corpus combina secciones narrativas de informes SEC 10-K, discursos, declaraciones de política, actas y Beige Books del Federal Reserve, y metadatos de arXiv de finanzas cuantitativas junto con textos completos seleccionados de licencia abierta, con un muestreo objetivo del 80%/10%/10% (SEC/Fed/quant). La ejecución completa procesó 300.085.534 exposiciones de tokens de contenido a lo largo de 5.123 actualizaciones del optimizador; los pesos publicados corresponden al checkpoint de la actualización 5.000, tras 292.995.933 exposiciones de tokens de contenido, seleccionado por la menor pérdida de validación financiera con máscara fija.

Como decisiones técnicas destacables, se preservaron las asignaciones originales de documento y de empresa/grupo de artículos entre las particiones de entrenamiento y validación, y se documentan las atribuciones y términos de reutilización de las fuentes en `source_notices.json` y `training_source_attributions.json`. El texto del corpus no se distribuye en el repositorio.

## Capacidades

- Predicción de tokens enmascarados (MLM) sobre texto financiero en inglés: `AutoModelForMaskedLM` permite rellenar máscaras y obtener puntuaciones de verosimilitud léxica.
- Generación de representaciones contextuales de secuencias largas: hasta 4.096 tokens por pasada, útil como extractor de características (`outputs.last_hidden_state`).
- Codificación de documentos financieros completos sin truncado: secciones narrativas de 10-K, actas del Fed, Beige Books y artículos de finanzas cuantitativas.
- Base para ajuste supervisado con cabezas propias (clasificación, etiquetado de secuencias, extracción de información), previa validación del pooling adecuado.
- Soporte de tool calling / function calling: no disponible (es un encoder MLM, no un modelo generativo con API de herramientas).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés; no se declara soporte de otros idiomas.
- Capacidades especiales: modo "thinking", visión o audio: no disponibles.
- Búsqueda/embeddings por similitud: no entrenado de forma contrastiva, por lo que no debe usarse como modelo de sentence-embeddings sin añadir y validar un pooling y, en su caso, un ajuste específico.

## Casos de uso

- Extracción de representaciones para informes 10-K: codificar secciones narrativas completas (hasta 4.096 tokens) en una sola pasada y alimentar un clasificador de riesgo, tono o calidad de la divulgación, evitando el truncado a 512 tokens típico de los encoders BERT.
- Análisis de comunicación del banco central: codificar discursos, declaraciones de política y actas del Federal Reserve para clasificar el tono (hawkish/dovish) o detectar cambios de lenguaje entre reuniones sucesivas.
- Recuperación de información y reranking en un RAG financiero: usar las representaciones del encoder como base para un recuperador o reranker sobre corpus regulatorios largos, con la salvedad de que requiere ajuste y validación propios.
- Etiquetado de secuencias y extracción de entidades: identificar entidades, magnitudes o cláusulas en documentos regulatorios, aprovechando la ventana de 4.096 tokens para mantener el contexto de la sección completa.
- Inicialización para tareas financieras con pocos datos: partir de pesos ya expuestos a lenguaje SEC/Fed/quant y ajustar con conjuntos pequeños etiquetados, en lugar de arrancar desde un BERT de dominio general.
- Clasificación temática de literatura cuantitativa: procesar resúmenes y textos completos de arXiv en el dominio de finanzas cuantitativas para categorización o agrupamiento temático.
- Detección de cambios en el lenguaje de riesgo entre ejercicios: comparar representaciones de la misma sección de 10-K en años distintos para señalar variaciones relevantes en la redacción.
- Anonimizado y preprocesado de documentos largos: enmascarar y reconstruir campos sensibles o normalizar terminología con el objetivo MLM antes de alimentar otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks downstream (MMLU, HumanEval, GSM8K ni evaluaciones financieras tipo FiQA o Financial PhraseBank) en la información disponible. La única métrica publicada es la pérdida de validación con máscara fija del checkpoint liberado, 0,898456, calculada como media ponderada 80%/10%/10% de las pérdidas por grupo:

| Grupo | Pérdida MLM |
|---|---:|
| SEC | 0,854611 |
| Federal Reserve | 0,923689 |
| Quant research | 1,223984 |
| Media ponderada (checkpoint liberado) | 0,898456 |

Estos valores son diagnósticos de desarrollo sobre ventanas de validación financiera muestreadas, con particiones de validación por empresa/grupo de artículos y por periodo posterior usadas para la selección de checkpoint. No constituyen un test independiente bloqueado y el autor indica explícitamente que esta publicación no demuestra mejora sobre el modelo base sin modificar en tareas downstream.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB para los pesos completos en FP32 (148,7 M de parámetros), unos 0,3 GB en FP16/BF16 y unos 0,15 GB en INT8, más el espacio de activaciones de la secuencia de entrada. En estimación, una pasada completa de 4.096 tokens se mantiene por debajo de 2 GB de VRAM. Cifras estimadas a partir del recuento de parámetros; no publicadas por el autor.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM para inferencia en FP32; RTX 3060, RTX 4070, RTX 4090 para desarrollo y lotes pequeños; T4, L4 o A10 para servicio con lotes moderados; A100/H100 solo si se necesita throughput elevado o procesamiento por lotes de documentos largos.
- Cabe en GPU de consumo: sí, en toda la gama moderna (RTX 3060 12 GB y superiores) e incluso en GPUs de 4-6 GB. También es viable la inferencia en CPU para volúmenes bajos.
- Opciones de despliegue: `transformers` con PyTorch es la vía documentada; el modelo está marcado como `endpoints_compatible` para Hugging Face Inference Endpoints. Es exportable a ONNX Runtime o TorchScript para servir sin dependencia de PyTorch. No hay soporte documentado en vLLM, TGI o llama.cpp para la arquitectura Longformer en la información disponible.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FinLongformer (este modelo) | 148,7 M | 4.096 tokens | Encoder MLM, preentrenamiento continuado financiero | Apache-2.0 | Hugging Face; sin benchmark downstream publicado |
| allenai/longformer-base-4096 | ~148,7 M (mismo tamaño) | 4.096 tokens | Encoder MLM de dominio general | Apache-2.0 | Hugging Face; ampliamente usado |
| ProsusAI/finbert | ~110 M (valor aproximado) | 512 tokens | Encoder de clasificación financiera ajustado con etiquetas | Apache-2.0 | Hugging Face; benchmark financiero reportado por el autor |
| answerdotai/ModernBERT-base | ~149 M (valor aproximado) | 8.192 tokens | Encoder MLM de dominio general, más reciente | Apache-2.0 | Hugging Face; soporte amplio en el ecosistema |

La comparación directa de rendimiento no es posible: FinLongformer solo publica pérdidas MLM de validación, mientras que FinBERT publica métricas de clasificación en conjuntos financieros etiquetados y ModernBERT publica evaluaciones MLM y de tareas downstream. La ventaja diferencial de FinLongformer frente a FinBERT es la ventana de contexto (4.096 frente a 512 tokens); frente a Longformer base, su única diferencia documentada es la exposición al corpus SEC/Fed/quant.

## Limitaciones y advertencias

- No hay evaluación independiente de retención de lenguaje general ni de rendimiento en benchmarks financieros downstream; el autor lo declara explícitamente.
- Contaminación de los benchmarks downstream: no evaluada. Las particiones de validación se usaron para seleccionar el checkpoint, por lo que no equivalen a un test bloqueado.
- Las pérdidas MLM publicadas no demuestran razonamiento numérico ni rendimiento en trading; el modelo no se entrenó con etiquetas de retornos ni de operaciones.
- No es un modelo de sentence-embeddings: no recibió entrenamiento contrastivo, de modo que cualquier uso como recuperador o reranker exige elegir un pooling y validarlo.
- Idioma: solo inglés. No se declara ni se evalúa soporte de castellano u otros idiomas.
- Estructura de documentos: el layout de tablas original no se reconstruye de forma fiable, lo que limita su uso en extracción de datos tabulares de 10-K.
- Metadatos temporales: las fechas de los documentos SEC son cubos de año de informe, no marcas exactas de aceptación, y los cortes temporales de las fuentes difieren entre sí.
- Riesgo de alucinación: al ser un encoder MLM y no un modelo generativo, no produce texto libre; el riesgo se traslada a cualquier cabeza downstream que se le añada y a la interpretación de las predicciones de máscaras.
- Sesgos: no se documenta ningún análisis de sesgo del corpus ni de los pesos resultantes; el corpus procede de fuentes institucionales estadounidenses, con el sesgo de dominio que ello implica.
- Licencia: los pesos se publican bajo Apache-2.0, pero las licencias de las fuentes de entrenamiento son específicas de cada fuente y se documentan por separado; el texto del corpus no se redistribuye.
- Advertencia de producción: al tratarse de un modelo con cero descargas y cero likes, sin validación de terceros ni benchmarks downstream, no debería desplegarse en producción sin una evaluación propia sobre el caso de uso concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LeoDingggg/FinLongformer
- Modelo base: https://huggingface.co/allenai/longformer-base-4096
- Artículo original de Longformer: https://arxiv.org/abs/2004.05150
- Atribuciones de fuentes de entrenamiento: `training_source_attributions.json` (en el repositorio del modelo)
- Avisos de licencia de las fuentes: `source_notices.json` (en el repositorio del modelo)
- Resumen de configuración de entrenamiento: `training_summary.json` (en el repositorio del modelo)
- Métricas de evaluación completas: `evaluation.json` (en el repositorio del modelo)
- Licencia: `LICENSE` (en el repositorio del modelo)
- Aviso legal: `NOTICE` (en el repositorio del modelo)

Nota: la búsqueda web asociada a esta ficha no devolvió enlaces relevantes sobre el modelo; únicamente resultados de prensa general sin relación con FinLongformer.
