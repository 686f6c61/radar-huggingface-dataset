# rishanthrajendhran/ideadet-modernbert-1m-document

# Ficha técnica: ideadet-modernbert-1m-document

## Resumen

`ideadet-modernbert-1m-document` es un modelo de clasificación de texto (encoder-only) desarrollado por Rishanth Rajendhran, diseñado para la detección de contenido generado por inteligencia artificial en documentos. Se basa en la arquitectura ModernBERT, una versión modernizada de BERT que incorpora mejoras como rotary positional embeddings, capas GeGLU y atención alternada, entrenada sobre 2 billones de tokens. El modelo cuenta con aproximadamente 395,8 millones de parámetros, lo que corresponde a la variante *large* de ModernBERT, y está disponible bajo licencia Apache 2.0.

El nombre "ideadet" sugiere una especialización en la identificación de ideas o contenido sintético, aunque no se especifica públicamente el dataset de entrenamiento ni el proceso de fine-tuning. Su pipeline es `text-classification`, por lo que se utiliza para clasificar documentos completos o fragmentos de texto como generados por IA o por humanos. Su relevancia radica en la creciente necesidad de herramientas de verificación de autenticidad en entornos académicos, editoriales y corporativos, donde la proliferación de texto sintético plantea retos de integridad.

El acceso al modelo está restringido (gated) en HuggingFace, lo que implica que los usuarios deben aceptar condiciones adicionales antes de descargarlo. A pesar de su reciente publicación (agosto de 2026), no cuenta aún con descargas ni valoraciones de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder-only transformer, con rotary embeddings, GeGLU y atención alternada) |
| Parametros totales | 395.833.346 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base ModernBERT soporta hasta 8192 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (solo se distribuye en safetensors, sin cuantizaciones precalculadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de ModernBERT, una arquitectura encoder-only que actualiza el diseño original de BERT con técnicas modernas. Entre sus innovaciones destacan: embeddings posicionales rotatorios (RoPE) que permiten secuencias de hasta 8192 tokens, capas GeGLU en lugar de las FFN tradicionales, atención alternada (global y local) para reducir coste computacional, y *unpadding* dinámico que evita procesar tokens de padding. El entrenamiento base de ModernBERT se realizó sobre 2 billones de tokens, combinando datos multilingües y de código.

En cuanto a este modelo concreto, no se han publicado detalles sobre el proceso de fine-tuning: ni el dataset utilizado, ni el número de épocas, ni si se aplicaron técnicas de regularización o aumento de datos. El nombre "ideadet" y la etiqueta `ai-detection` indican que la tarea es clasificación binaria (probablemente IA vs. humano), pero la ausencia de documentación impide conocer la composición exacta de los datos de entrenamiento, el balance de clases o la metodología de evaluación.

## Capacidades

- Clasificación de texto a nivel de documento o pasaje, orientada a la detección de contenido generado por IA.
- Procesamiento de secuencias largas gracias a la arquitectura ModernBERT, que soporta hasta 8192 tokens (aunque no se confirma para este fine-tuning).
- Inferencia eficiente por ser un modelo encoder-only, con menor coste computacional que los decoders generativos.
- No genera texto: su salida es una etiqueta de clasificación (por ejemplo, "IA" o "humano").
- No incluye soporte para tool calling, agentes ni razonamiento multi-paso; es un clasificador puro.

## Casos de uso

- Verificación de autenticidad en trabajos académicos: el modelo puede analizar ensayos, tesis o artículos para detectar si han sido redactados por IA, ayudando a las instituciones a mantener la integridad académica.
- Moderación de contenido en plataformas editoriales: permite filtrar automáticamente artículos, reseñas o publicaciones generadas por IA antes de su publicación.
- Auditoría de contenido corporativo: empresas que necesitan asegurar que sus informes, comunicados o documentación interna sean de autoría humana, por ejemplo en sectores regulados.
- Análisis forense de documentos legales: detección de texto sintético en contratos, alegaciones o pruebas documentales, donde la procedencia del contenido puede tener implicaciones legales.
- Control de calidad en agencias de marketing: verificación de que los textos entregados por redactores externos no sean generados automáticamente sin declararlo.
- Investigación en detección de IA: como modelo de referencia para estudiar la evolución de los clasificadores de texto sintético, comparándolo con otros detectores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de precisión, recall, F1 o AUC para este modelo en la ficha de HuggingFace ni en la documentación asociada. Tampoco se han encontrado comparativas con otros detectores de IA (como GPTZero, Originality.ai o modelos basados en RoBERTa). Se recomienda realizar una evaluación propia sobre un conjunto de datos representativo antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada: con 395 millones de parámetros, en FP32 ocupa aproximadamente 1,6 GB, en FP16 unos 0,8 GB y en INT8 unos 0,4 GB. Cabe en cualquier GPU consumer moderna (desde una GTX 1060 de 6 GB en adelante).
- GPU recomendadas: para inferencia rápida, cualquier GPU con al menos 4 GB de VRAM es suficiente. Una RTX 3060 o superior ofrecerá latencias muy bajas.
- Despliegue: compatible con el ecosistema HuggingFace Transformers (pipeline de clasificación de texto), ONNX Runtime y TensorRT. No se han publicado configuraciones específicas para vLLM o llama.cpp, ya que es un modelo encoder y no está pensado para generación.
- Latencia: al ser un encoder con 395M de parámetros, la inferencia en CPU puede tardar decenas de milisegundos por documento (dependiendo de la longitud), mientras que en GPU se reduce a unos pocos milisegundos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de detección de IA. Los principales competidores en este espacio (GPTZero, Originality.ai, DetectGPT) son propietarios y no publican sus arquitecturas ni pesos. Entre los modelos open source, existen fine-tunings de RoBERTa o DeBERTa para la misma tarea, pero no hay datos públicos que permitan comparar el rendimiento de este modelo con ellos. Se recomienda evaluar el modelo frente a alternativas como `Hello-SimpleAI/HC3` o `roberta-base-openai-detector` si se necesita una comparación empírica.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en HuggingFace, por lo que requiere aceptar condiciones adicionales. Esto puede limitar su adopción y auditoría externa.
- Falta de documentación: no se han publicado detalles sobre el dataset de entrenamiento, el proceso de fine-tuning ni las métricas de evaluación. Esto dificulta conocer su robustez y sus posibles sesgos.
- Riesgo de sesgo: al no conocer la composición de los datos de entrenamiento, no es posible anticipar si el modelo funciona mejor con ciertos tipos de texto (por ejemplo, académico vs. informal) o si presenta falsos positivos/negativos desbalanceados.
- Alucinación y falsos positivos: como cualquier clasificador de IA, puede marcar texto humano como generado por IA o viceversa. La tasa de error no está cuantificada.
- Limitaciones de idioma: no se especifican los idiomas soportados. Si el fine-tuning se realizó solo en inglés, su rendimiento en otros idiomas podría ser deficiente.
- Licencia: aunque es Apache 2.0, el acceso gated implica que el uso comercial puede estar sujeto a términos adicionales definidos por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rishanthrajendhran/ideadet-modernbert-1m-document
- Perfil del autor: https://huggingface.co/rishanthrajendhran
- Repositorio de ModernBERT (AnswerDotAI): https://github.com/AnswerDotAI/ModernBERT
- Documentación de ModernBERT en Transformers: https://huggingface.co/docs/transformers/model_doc/modernbert
- Paper de ModernBERT (arXiv): https://arxiv.org/abs/2412.13663
- Página personal del autor: https://rishanthrajendhran.github.io/
