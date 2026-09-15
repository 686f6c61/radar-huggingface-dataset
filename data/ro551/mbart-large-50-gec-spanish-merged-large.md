# Ro551/mbart-large-50-GEC-spanish-merged-large

## Resumen

`Ro551/mbart-large-50-GEC-spanish-merged-large` es un ajuste fino de `facebook/mbart-large-50` orientado a la corrección gramatical de texto en español (GEC, *grammatical error correction*). Lo publica el usuario Ro551 en HuggingFace con licencia MIT, un repositorio de 2,5 GB y 611.129.542 parámetros reales verificados en los ficheros safetensors. El modelo es un transformer encoder-decoder de tipo mBART-50, con 12 capas en el codificador y 12 en el decodificador, vocabulario de 250.027 tokens y una ventana de contexto de 1.024 tokens heredada del modelo base.

El problema que resuelve es concreto: recibir una frase en español con errores ortográficos, gramaticales o de puntuación y devolver la versión corregida, un caso de uso con demanda directa en correctores, herramientas de escritura, pipelines editoriales y preprocesado de corpus. La relevancia del modelo es moderada y muy acotada: se trata de una publicación reciente (septiembre de 2026) con cero descargas y cero *likes*, sin *pipeline* declarado, sin idiomas documentados y con una model card autogenerada por el `Trainer` en la que el propio autor deja varios apartados como «More information needed».

El nombre del checkpoint (`-merged-large`) y la existencia de un modelo hermano del mismo autor llamado `mbart-large-50-GEC-spanish-LORA-synthetic` sugieren que los pesos proceden de la fusión de adaptadores LoRA entrenados sobre datos sintéticos, aunque el autor no lo confirma en la información disponible. El rendimiento declarado en el conjunto de evaluación es de 0,8099 GLEU y 0,0505 de pérdida tras dos épocas de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (mBART-50, tipo BART con atención completa; el codificador usa atención bidireccional y el decodificador causal) |
| Parámetros totales | 611.129.542 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens (heredada de `facebook/mbart-large-50`) |
| Tipos de cuantización | no disponible; al distribuirse en safetensors admite cuantización dinámica con bitsandbytes (int8/int4) en el ecosistema Transformers |
| Idiomas soportados | no disponible en la model card; el modelo base mBART-50 cubre 50 idiomas, pero el ajuste está orientado a español |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 2,5 GB, coherente con pesos en fp32) |
| Librería | Transformers |
| Modelo base | `facebook/mbart-large-50` |
| Tarea declarada | `text2text-generation` |
| Dataset de entrenamiento | no disponible (la model card indica literalmente «on the None dataset») |
| Fecha de publicación | 14 de septiembre de 2026 (última actualización: 15 de septiembre de 2026) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de mBART-50: un transformer secuencia-a-secuencia con normalización previa a cada subcapa, embeddings posicionales sinusoidales aprendidos hasta 1.024 posiciones y un vocabulario compartido de 250.027 tokens tipo SentencePiece. El codificador y el decodificador tienen 12 capas cada uno, con modelo oculto de 1.024 dimensiones y 16 cabezas de atención. mBART-50 se preentrenó con un objetivo de *denoising* multilingüe sobre el corpus CC25, con ruido aplicado a nivel de span (permutación de frases y enmascarado de spans) y un único modelo compartido para 50 idiomas, en lugar de un modelo por par de lenguas.

Sobre el ajuste fino, la información disponible es la que el `Trainer` volcó automáticamente en la model card: learning rate 9,175e-05, `train_batch_size` 16 con 16 pasos de acumulación (tamaño de lote efectivo 256), optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con *warmup* equivalente al 5,586 % del entrenamiento, semilla 42 y 2 épocas completas (1.224 pasos). No se documenta el conjunto de datos, ni su tamaño, ni si hubo una fase de RLHF o DPO (en un modelo de corrección gramatical esto es poco habitual: se trata de aprendizaje supervisado sobre pares error-corrección). Tampoco se documenta ninguna innovación técnica adicional, decodificación especulativa ni atención lineal. Se desconoce si `merged` se refiere a la fusión de adaptadores LoRA o a una mezcla de pesos de varios checkpoints.

## Capacidades

- Corrección gramatical y ortográfica en español: recibe una secuencia con errores y genera la versión corregida, que es el objetivo declarado del ajuste fino.
- Generación de texto secuencia-a-secuencia en general, gracias a la arquitectura completa de mBART-50 (no se ha eliminado ninguna cabeza).
- Reformulación y normalización de texto (puntuación, mayúsculas, concordancia) siempre que el formato de la tarea se asemeje a la corrección de errores.
- Capacidad multilingüe potencial heredada del modelo base (50 idiomas en mBART-50), aunque no verificada ni documentada para este checkpoint concreto.
- Soporte de *tool calling* / *function calling*: no disponible; es un modelo encoder-decoder de texto a texto sin plantilla de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; no es una capacidad propia de esta arquitectura ni de este ajuste.
- Modo «thinking», visión o audio: no disponible en ninguna de sus variantes.

## Casos de uso

- Corrección de textos en herramientas de escritura: el modelo se puede envolver en un servicio que reciba la frase del usuario y devuelva la versión corregida, integrándose en editores de texto, gestores de correo o plataformas de documentación en español.
- Preprocesado de corpus para investigación en PLN: pasar por el modelo los textos de un corpus (reseñas, foros, transcripciones) para reducir ruido ortográfico y gramatical antes de entrenar otros modelos o de aplicar técnicas de análisis.
- Corrección de transcripciones automáticas: los sistemas de ASR en español producen errores de puntuación y de concordancia; un paso de GEC sobre la salida mejora la legibilidad de subtítulos y actas automáticas.
- Revisión de contenido generado por otros modelos: usar este mBART ajustado como etapa de *post-procesado* sobre la salida de un LLM generativo, corrigiendo errores superficiales en español sin tener que recurrir a un modelo mayor.
- Normalización de formularios y entradas de usuario: limpiar campos de texto libre (direcciones, descripciones) antes de almacenarlos, con la ventaja de que el modelo es pequeño y puede ejecutarse en local.
- Moderación y análisis de opiniones: al normalizar el texto de las reseñas antes de clasificarlas, se reduce la varianza introducida por errores de escritura en los clasificadores posteriores.
- Investigación en GEC en español: sirve como punto de comparación (con la métrica GLEU reportada) para trabajos académicos sobre corrección gramatical en esta lengua, siempre que se documente adecuadamente el conjunto de evaluación usado.

## Benchmarks y rendimiento

El `model-index` de la model card está vacío (`results: []`), por lo que no hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros). Los únicos datos publicados son las métricas del entrenamiento y de la evaluación interna, calculadas por el propio autor sobre un conjunto de evaluación cuyo origen no se documenta:

| Época | Step | Training loss | Validation loss | GLEU |
|---|---|---|---|---|
| 1.0 | 612 | 1,9232 | 0,0728 | 0,7536 |
| 2.0 | 1224 | 0,4882 | 0,0505 | 0,8099 |

Advertencia: la pérdida de validación (0,0505) es muy inferior a la de entrenamiento en la primera época, un patrón que no es habitual y que puede indicar diferencias en el cálculo de la pérdida entre ambas fases, *teacher forcing* con distinto enmascarado, o tokenización distinta del conjunto de evaluación. El GLEU de 0,8099 es un valor alto, pero sin conocer el corpus de evaluación ni el procedimiento exacto de cálculo no es comparable con resultados publicados de otros sistemas de GEC. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 2,5 GB de pesos (el repositorio ocupa 2,5 GB) más activaciones y caché de atención; en fp16/bf16, unos 1,3 GB; en int8 con bitsandbytes, en torno a 0,7 GB; en int4, alrededor de 0,4 GB.
- GPU recomendadas: cabe sin problema en cualquier GPU con 8 GB o más. Una RTX 3060, RTX 4060, RTX 3070 o superior es suficiente. Para lotes grandes y alto throughput, una A100 o H100 quedan sobredimensionadas para 611 millones de parámetros.
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU de consumo actuales (8-24 GB), e incluso en GPUs de 6 GB si se usa cuantización int8 o int4.
- Opciones de despliegue: Transformers con `pipeline("text2text-generation")` o `AutoModelForSeq2SeqLM`, servidor TGI (*Text Generation Inference*), vLLM (soporte de encoder-decoder limitado, conviene verificar la versión), o FastAPI + PyTorch para despliegues sencillos. La conversión a GGUF para llama.cpp u Ollama no está documentada para este checkpoint.
- Latencia y throughput estimados: no disponible. Como referencia orientativa de orden de magnitud, un modelo de 611 millones de parámetros en una GPU moderna suele procesar decenas de secuencias por segundo con lotes moderados y secuencias cortas, pero no hay mediciones publicadas para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Ro551/mbart-large-50-GEC-spanish-merged-large` | 611 M | 1.024 tokens | Corrección gramatical en español (ajuste fino) | MIT | HuggingFace, 0 descargas |
| `facebook/mbart-large-50` (base) | 611 M | 1.024 tokens | Traducción multilingüe y generación texto a texto | MIT | HuggingFace, ampliamente usado |
| `google/mt5-large` | ~1.200 M | 1.024 tokens (entrenado con sesgo posicional relativo) | Texto a texto multilingüe | Apache 2.0 | HuggingFace |
| `google/flan-t5-large` | ~780 M | 512 tokens | Instrucciones y texto a texto | Apache 2.0 | HuggingFace |

No hay datos de rendimiento comparables publicados para el modelo objeto de esta ficha frente a estas alternativas: el `model-index` está vacío y el conjunto de evaluación usado para el GLEU de 0,8099 no está documentado. Cualquier comparación de calidad con los modelos anteriores sería especulativa. Como orientación de diseño, mT5-large duplica aproximadamente el número de parámetros y flan-t5-large tiene una ventana de contexto más corta, pero ninguno de los dos está ajustado específicamente para GEC en español.

## Limitaciones y advertencias

- Model card incompleta: el autor deja «More information needed» en descripción, usos previstos y datos de entrenamiento. No se puede saber con qué corpus se ajustó ni si ese corpus tenía licencia compatible con un uso comercial derivado.
- Dataset de entrenamiento declarado como «None», lo que impide auditar sesgos de dominio, registro o variedad dialectal del español cubierta.
- Riesgo de alucinación y de sobrecorrección: en tareas de GEC es frecuente que el modelo reescriba fragmentos que ya eran correctos o que altere el significado, especialmente en frases largas o con vocabulario especializado. Se recomienda validación humana o métricas automáticas antes de desplegarlo sobre contenido crítico.
- Límite de contexto de 1.024 tokens: los textos más largos deben segmentarse, lo que rompe la coherencia entre fragmentos y puede producir correcciones inconsistentes en los extremos de cada segmento.
- Idiomas no documentados: aunque el modelo base cubre 50 lenguas, el ajuste está orientado a español y no hay evidencia de que conserve calidad en otros idiomas tras el ajuste fino.
- Cero descargas y cero *likes*: es un checkpoint sin validación externa por parte de la comunidad. No hay informes independientes de calidad ni reproducciones de las métricas reportadas.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantías. Es la parte más favorable de la ficha, pero conviene verificar que la licencia del corpus de ajuste no imponga restricciones adicionales no declaradas.
- Discrepancia entre pérdida de entrenamiento y de validación en la primera época, lo que sugiere posibles diferencias en la configuración de evaluación. Los números deben tomarse con cautela.
- Sin garantía de compatibilidad con `pipeline` estándar: el campo `pipeline` aparece como no disponible y la tarea declarada es `text2text-generation`, así que la integración requiere instanciar el modelo explícitamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ro551/mbart-large-50-GEC-spanish-merged-large
- Modelo base: https://huggingface.co/facebook/mbart-large-50
- Modelo hermano del mismo autor (LoRA sobre datos sintéticos): https://huggingface.co/Ro551/mbart-large-50-GEC-spanish-LORA-synthetic
- Ficha de mBART-50 en AI Model Zoo (BimAnt): https://zoo.bimant.com/model/14502
- Ficha de mBART-50 en Model Database: https://modeldatabase.com/facebook/mbart-large-50.html
- Catálogo de modelos de Microsoft Foundry (Azure AI): https://ai.azure.com/catalog/models/facebook-mbart-large-50
