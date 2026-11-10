# bammera-pothana/BERT-mini

## Resumen

BERT-mini (Telugu) es un codificador BERT compacto entrenado desde cero sobre texto en telugu por el usuario bammera-pothana, segundo miembro de la colección "Google's Recipes", que reproduce a escala las miniaturas BERT de Turc et al. (2019) para este idioma. Con 11,6 millones de parámetros, 4 capas, tamaño oculto 256 y 4 cabezas de atención, se posiciona como un encoder ligero para tareas de comprensión del telugu, no como un modelo generativo.

El modelo emplea la arquitectura `BertForPreTraining` original (cabeza de masked language modeling más cabeza de next-sentence prediction), vocabulario WordPiece de 32.000 tokens aprendido específicamente sobre texto telugu y una longitud máxima de secuencia de 512 tokens. Se entrenó con la receta de Devlin et al. (2018) sin modificaciones salvo la sustitución del vocabulario, lo que lo convierte en una referencia reproducible para estudios de escalado y destilación en lenguas de bajos recursos.

Su relevancia radica en la escasez de encoders ligeros específicos para telugu: la mayoría de modelos multilingües dedican una fracción mínima de su capacidad a este idioma. BERT-mini ofrece un punto de partida barato para fine-tuning, scoring de texto y experimentos comparativos dentro de la familia de miniaturas BERT (tiny, mini, small, medium), con la limitación de que solo modela telugu y no dispone de licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (`BertForPreTraining`: MLM + NSP), 4 capas, hidden 256, 4 cabezas, feed-forward 1024 |
| Parametros totales | 11.647.746 (11.581.440 según la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | telugu (`te`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, 46,6 MB en float32) |
| Vocabulario | 32.000 tokens WordPiece, cased, aprendido sobre el corpus de preentrenamiento |
| Tokenizador | `BertTokenizerFast`; sin lower-casing, sin eliminación de acentos, sin tratamiento CJK |
| Precisión de los pesos | float32 |
| Fecha de entrenamiento | 9 de noviembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder BERT estándar en su variante mini: 4 capas, dimensión oculta 256, 4 cabezas de atención y capa feed-forward de 1024, con activación GELU y dropout 0,1 en hidden y atención. La cabeza de preentrenamiento combina masked language modeling (15 % de los tokens WordPiece enmascarados con la distribución 80/10/10 de Google) y next-sentence prediction, con enmascaramiento dinámico a nivel de token re-muestreado en cada batch. El tokenizador es un `BertTokenizerFast` con lower-casing, eliminación de acentos y manejo CJK desactivados, porque eliminar acentos destruiría los signos vocálicos del telugu (మాత్రలు); debe cargarse desde el repositorio y no configurarse a mano.

El entrenamiento siguió la receta de Devlin et al. (2018) tal como la aplicaron Turc et al. (2019) a las miniaturas BERT, con 1.000.000 de pasos totales a batch global de 256 secuencias en un único schedule continuo: 900.000 pasos a 128 tokens (fase 1) y 100.000 pasos a 512 tokens (fase 2), arrastrando el estado del optimizador entre fases. Se usó AdamW con lr 1e-4, β₁ 0,9, β₂ 0,999, ε 1e-6, weight decay 0,01 (no aplicado a bias ni LayerNorm), warm-up lineal de 10.000 pasos y decaimiento lineal hasta cero, clipping de gradiente 1,0 y autocast float16 con loss scaling manteniendo los pesos en float32. El cómputo se realizó en 4 × NVIDIA GeForce RTX 2080 Ti (11 GB), con 14,9 h para la fase 1 (0,06 s/paso) y 6,8 h para la fase 2 (0,24 s/paso). No hubo early stopping: se publica el checkpoint con mejor pérdida MLM en el conjunto de validación. Los ejemplos de preentrenamiento se construyeron con el formato `[CLS] A [SEP] B [SEP]`, donde B es la continuación real la mitad de las veces y un segmento de otro documento el resto, con un 10 % de ejemplos de longitud objetivo aleatoria más corta. Se reservó un conjunto de documentos antes de aprender el vocabulario y nunca se usó en entrenamiento.

## Capacidades

- Masked language modeling en telugu: predice tokens enmascarados en texto con script telugu normalizado NFC.
- Next-sentence prediction: clasifica si dos segmentos son contiguos en el documento original.
- Codificador de representaciones contextuales para fine-tuning en tareas downstream (clasificación, NER, QA extractiva, similitud semántica).
- Scoring y ranking de texto telugu mediante la pérdida MLM o la perplejidad del modelo.
- No soporta tool calling ni function calling: es un encoder, no un modelo instruido.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: ninguna; únicamente telugu.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Filtrado y deduplicación de corpus telugu: calcular la perplejidad MLM sobre documentos permite descartar texto corrupto, ruido OCR o traducciones automáticas de baja calidad antes de usarlo en el entrenamiento de modelos mayores.
- Clasificación de texto telugu: fine-tuning de la cabeza de clasificación sobre el encoder para detección de temas, moderación de contenido o etiquetado de noticias, aprovechando sus 512 tokens de contexto y su bajo coste de inferencia.
- Reconocimiento de entidades nombradas (NER) en telugu: ajuste con capas de token classification para extraer personas, lugares y organizaciones en textos periodísticos o literarios.
- Recuperación de información y búsqueda semántica: usar los embeddings del encoder para indexar y recuperar pasajes en telugu en un motor de búsqueda interno o en un sistema de preguntas frecuentes.
- Baseline en estudios de escalado y destilación: comparar su rendimiento con BERT-tiny, small y medium de la misma colección para medir el efecto del tamaño en telugu con receta constante.
- Preentrenamiento de un tokenizador o inicialización de modelos mayores: reutilizar el vocabulario WordPiece de 32.000 tokens y los pesos como inicialización en experimentos de destilación hacia arquitecturas más grandes o más pequeñas.
- Corrección ortográfica y autocompletado asistido: la cabeza MLM permite sugerir la palabra más probable en una posición enmascarada, útil en editores de texto telugu o en herramientas de accesibilidad.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Conjunto de evaluación | Métrica | Valor |
|---|---|---|
| Held-out Telugu text (512 tokens) | Masked-LM loss (cross-entropy) | 3,418 |
| Held-out Telugu text (512 tokens) | Masked-LM perplexity | 30,5 |
| Held-out Telugu text (512 tokens) | Masked-LM top-1 accuracy | 42,4 % |
| Held-out Telugu text (512 tokens) | Next-sentence-prediction accuracy | 95,5 % |
| Telugu Wikisource (3.000 párrafos, 128 tokens) | Masked-LM loss | 3,614 |
| Telugu Wikisource (3.000 párrafos, 128 tokens) | Masked-LM top-1 accuracy | 39,4 % |
| Telugu news (3.000 párrafos, 128 tokens) | Masked-LM loss | 3,327 |
| Telugu news (3.000 párrafos, 128 tokens) | Masked-LM top-1 accuracy | 43,8 % |

Comparativa interna de checkpoints en held-out (misma semilla de enmascaramiento):

| Checkpoint | MLM loss | MLM perplexity | MLM accuracy | NSP accuracy |
|---|---|---|---|---|
| Fin de fase 1 (paso 900 k, 128 tokens) | 3,475 | 32,3 | 41,5 % | 94,6 % |
| Publicado: fin de fase 2 (paso 1 M, 512 tokens) | 3,418 | 30,5 | 42,4 % | 95,5 % |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, GLUE, XTREME) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 GB en float32 (46,6 MB de pesos más activaciones para secuencias de hasta 512 tokens); en la práctica cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 2080 Ti, RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo. También funciona en CPU.
- Cabe en GPU consumer: sí, en todas las GPU modernas, incluidas las integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con PyTorch (ruta principal), `text-embeddings-inference` o servidores de inferencia ligeros; llama.cpp y Ollama no aplican porque el modelo no está publicado en GGUF.
- Latencia y throughput: no disponibles de forma oficial; el entrenamiento reportado de 0,06 s/paso a batch 256 y 128 tokens en 4 × RTX 2080 Ti sugiere una inferencia del orden de milisegundos por secuencia en GPU moderna, pero no se han publicado mediciones de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BERT-mini (Telugu, este modelo) | 11,6 M | 512 | telugu | no disponible | Hugging Face, safetensors |
| BERT-tiny (Telugu, misma colección) | no disponible en la información | 512 | telugu | no disponible | Hugging Face |
| mBERT (bert-base-multilingual-cased) | 178 M | 512 | 104 idiomas | Apache 2.0 | Hugging Face |
| XLM-RoBERTa base | 278 M | 512 | 100 idiomas | MIT | Hugging Face |

La comparación de rendimiento con BERT-tiny no es directa: el autor advierte que el vocabulario de este modelo se aprendió de nuevo y no coincide con el de BERT-tiny, por lo que las pérdidas MLM solo son aproximadamente comparables y las precisiones comparan de forma más justa. Frente a mBERT y XLM-RoBERTa, BERT-mini ofrece un orden de magnitud menos de parámetros y una especialización total en telugu, a costa de no cubrir ningún otro idioma.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial sin contactar con el autor; la ausencia de licencia es un riesgo legal en producción.
- Modelo exclusivamente telugu: no procesa otros idiomas ni texto en script latino de forma fiable.
- Es un encoder de preentrenamiento, no un modelo instruido: no sigue instrucciones, no genera texto libre de forma coherente y no soporta diálogo.
- Riesgo de alucinación en la cabeza MLM: las predicciones de tokens enmascarados son probabilísticas y pueden producir formas gramaticales incorrectas o palabras inventadas, especialmente en dominios alejados del corpus de entrenamiento.
- Sesgos del corpus: al entrenarse sobre texto telugu disponible (probablemente literario y periodístico), puede reflejar sesgos de género, regionales o de registro presentes en esas fuentes.
- Contexto limitado a 512 tokens: insuficiente para documentos largos sin truncado o segmentación previa.
- Tokenizador específico: debe cargarse desde este repositorio; usar un tokenizador BERT estándar con lower-casing o eliminación de acentos degradará gravemente los resultados en telugu.
- Sin verificación independiente: los benchmarks son declarados por el autor y no han sido replicados por terceros; el modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin evidencia de uso en producción.
- Sin datos de cuantización publicados: no hay versiones GGUF, ONNX ni int8 oficiales, lo que limita el despliegue en entornos sin PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bammera-pothana/BERT-mini
- Modelo hermano BERT-tiny: https://huggingface.co/bammera-pothana/BERT-tiny
- Perfil del autor: https://huggingface.co/bammera-pothana
- Paper de referencia BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Paper de las miniaturas BERT (Turc et al., 2019): https://arxiv.org/abs/1908.08962
