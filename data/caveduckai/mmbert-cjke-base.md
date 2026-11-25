# CaveduckAI/mmBERT-cjke-base

## Resumen

mmBERT-CJKE-base es un encoder multilingüe de 312 millones de parámetros desarrollado por Warp Space Inc. (CaveduckAI), orientado a coreano, chino, japonés e inglés. Parte del modelo jhu-clsp/mmBERT-base, construido sobre la arquitectura ModernBERT, y sustituye el tokenizador original de Gemma 2 (256K de vocabulario) por el de Gemma 3 (262K), seguido de un preentrenamiento continuado sobre 30.000 millones de tokens de texto CJK e inglés. El objetivo es corregir el desalineamiento entre los límites de token y los límites de palabra que el tokenizador de Gemma 2 provoca en chino, japonés y coreano, idiomas sin separación por espacios o con convenciones distintas al inglés.

La motivación técnica es concreta: el tokenizador de Gemma 2 inserta un espacio de prefijo delante de los tokens, lo que desalinea la segmentación en textos CJK y penaliza tareas sensibles a límites como el reconocimiento de entidades nombradas (NER) o el etiquetado gramatical. Con el tokenizador de Gemma 3, el modelo reduce un 27,3 % el número de tokens necesarios para representar texto coreano y un 12,0 % para chino, manteniendo el rendimiento en las tareas de clasificación estándar y mejorando ligeramente en NER coreano.

El modelo es la columna vertebral de los sistemas ligeros de clasificación, moderación y decisión que operan dentro de la plataforma de personajes de IA Caveduck. Su licencia MIT y su tamaño contenido (0,7 GB en bfloat16) lo hacen adecuado para despliegues con requisitos moderados de hardware, aunque su naturaleza de encoder con objetivo de masked language modeling lo limita a tareas de representación y clasificación, no a generación autoregresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, masked language modeling) |
| Parametros totales | 312.511.745 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 posiciones máximas |
| Tipos de cuantizacion | no disponible (checkpoint en bfloat16; compatible con cuantización estándar de transformers) |
| Idiomas soportados | coreano (ko), chino (zh), japonés (ja), inglés (en), multilingüe |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16, MLM head atada a los embeddings de entrada) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, con 312 millones de parámetros y una ventana máxima de 8.192 posiciones. La innovación principal es el reemplazo del tokenizador de Gemma 2 por el de Gemma 3 (262K de vocabulario), con inicialización FOCUS para los nuevos embeddings: las representaciones de tokens nuevos se inicializan a partir de tokens solapados y promedios de sub-tokens. El preentrenamiento continuado se estructuró en dos etapas: una primera de estabilización de embeddings (2.000 millones de tokens, solo embeddings y cabeza MLM entrenables, cuerpo congelado, LR 1e-4 con schedule coseno) y una segunda de adaptación completa (30.000 millones de tokens, todos los parámetros, LR 8e-5 con schedule coseno).

Los datos de entrenamiento se componen de 9.000 millones de tokens de coreano (FineWeb2 `kor_Hang` y Wikipedia), 7.500 millones de chino simplificado (FineWeb2 `cmn_Hani` y Wikipedia), 7.500 millones de japonés (FineWeb2 `jpn_Jpan` y Wikipedia) y 6.000 millones de inglés (FineWeb-edu con puntuación ≥ 2). La mezcla de web y Wikipedia es 85/15 para ko/zh/ja. El objetivo es masked language modeling con longitud de secuencia 512, batch de 64 secuencias por paso (aproximadamente 1 millón de tokens por paso), precisión bf16 y FlashAttention-2. El entrenamiento se ejecutó sobre 4 GPU NVIDIA H200 con DDP en kt cloud AI Nexus; la segunda etapa duró aproximadamente 1,9 días (~4,5 s por paso). La pérdida evolucionó de 3,33 a 2,06 al final de la primera etapa y a 1,65 al final de la segunda. Se realizó un pilotaje previo de 5.000 millones de tokens (R1) para validar el pipeline, y se comparó con un tokenizador CJK alternativo (Trillion) sobre 30.000 millones de tokens, que regresó en todas las tareas, por lo que se mantuvo Gemma 3.

## Capacidades

- Masked language modeling (fill-mask) sobre texto en coreano, chino, japonés e inglés.
- Generación de representaciones contextuales para tareas downstream de clasificación de secuencias y etiquetado de tokens.
- Clasificación de texto (por ejemplo, clasificación temática o de sentimiento) mediante `AutoModelForSequenceClassification`.
- Reconocimiento de entidades nombradas y etiquetado gramatical mediante `AutoModelForTokenClassification`, con mejora específica en coreano (KLUE-NER).
- Segmentación y detección de spans sensible a límites de palabra, gracias al tokenizador alineado con la segmentación CJK.
- Inferencia multilingüe en una única ventana de 8.192 posiciones con eficiencia mejorada en coreano y chino.
- No soporta generación autoregresiva, tool calling, razonamiento multi-paso ni capacidades de agente; es un encoder, no un modelo causal.
- No dispone de capacidades de visión ni audio.
- Compatible con FlashAttention-2 (con fallback a SDPA) para acelerar la inferencia.

## Casos de uso

- Moderación de contenido en plataformas de personajes de IA: el modelo puede clasificar mensajes de usuarios en coreano, chino, japonés e inglés para detectar contenido tóxico o no permitido, aprovechando su tamaño contenido y su eficiencia en tokens coreanos para reducir latencia en pipelines de moderación en tiempo real.
- Reconocimiento de entidades nombradas en coreano: con la mejora de 1,04 puntos porcentuales en KLUE-NER respecto al modelo base, es adecuado para extraer nombres de personas, lugares y organizaciones en textos coreanos dentro de sistemas de extracción de información o enriquecimiento de datos.
- Etiquetado gramatical y análisis morfológico en chino y japonés: el tokenizador alineado con los límites de palabra reduce errores en tareas de POS tagging y segmentación, útil en herramientas de procesamiento lingüístico o en la construcción de datasets anotados.
- Clasificación temática de documentos multilingües: puede asignar categorías a artículos, reseñas o publicaciones en los cuatro idiomas soportados, con un protocolo de fine-tuning estándar de 20.000 muestras y 3 épocas, adecuado para sistemas de recomendación o filtrado de contenido.
- Detección de intención en asistentes conversacionales: como encoder, puede alimentar un clasificador de intenciones en un chatbot multilingüe, con una ventana de 8.192 tokens que permite procesar historiales de conversación largos sin truncamiento agresivo.
- Filtrado y deduplicación de corpus CJK: sus representaciones pueden usarse para similitud semántica y clustering de documentos en coreano, chino y japonés, aprovechando la reducción del 27,3 % en tokens coreanos para procesar más texto por unidad de cómputo.
- Búsqueda semántica multilingüe: las representaciones del encoder pueden indexarse para recuperación de documentos en los cuatro idiomas, con la ventaja de que el mismo modelo cubre coreano, chino, japonés e inglés sin necesidad de modelos separados por idioma.

## Benchmarks y rendimiento

Los resultados publicados por el autor siguen un protocolo de fine-tuning de 20.000 muestras de entrenamiento por tarea, 3 épocas, batch 32, mejor de dos tasas de aprendizaje (3e-5 y 5e-5), evaluado sobre 3.000 muestras reservadas. El mismo protocolo se aplicó a todos los modelos.

| Tarea | Idioma | Métrica | mmBERT-base | R1 (pilot 5B) | mmBERT-CJKE-base (R2, 30B) |
|---|---|---|---|---|---|
| KLUE-TC | ko | macro F1 | 0,817 | 0,810 | 0,811 |
| KLUE-NER | ko | F1 | 0,8921 | – | 0,9025 |
| CLUE-TNEWS | zh | accuracy | 0,549 | 0,541 | 0,548 |
| JGLUE-MARC-ja | ja | accuracy | 0,956 | 0,959 | 0,956 |
| XNLI | multi | accuracy | 0,819 | 0,818 | 0,818 |

Eficiencia del tokenizador (tokens por texto idéntico, menor es mejor):

| Idioma | Gemma 2 (mmBERT-base) | Gemma 3 (este modelo) | Cambio |
|---|---|---|---|
| Coreano | 44 | 32 | −27,3 % |
| Chino | 25 | 22 | −12,0 % |
| Japonés | 31 | 31 | 0 % |
| Inglés | 25 | 25 | 0 % |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en bfloat16 (312M de parámetros); en fp16/bf16 cabe holgadamente en cualquier GPU consumer con 4 GB o más. En cuantización de 8 bits o 4 bits el requisito baja a menos de 0,5 GB, aunque el autor no publica configuraciones de cuantización específicas.
- GPU recomendadas: NVIDIA H200 para entrenamiento (4 unidades en DDP); para inferencia, cualquier GPU moderna es suficiente, incluidas RTX 4090, RTX 3090, A100, H100, L4 o T4. El modelo cabe en GPU consumer de gama baja.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 2-4 GB de VRAM, incluidas GTX 1650, RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: transformers (con `AutoModelForMaskedLM`, `AutoModelForSequenceClassification` o `AutoModelForTokenClassification`), con soporte de FlashAttention-2 y fallback a SDPA. No se mencionan explícitamente vLLM, llama.cpp, Ollama ni TGI en la información disponible; al ser un encoder ModernBERT, es compatible con los runners de transformers y potencialmente con TGI, pero no se confirma.
- Latencia y throughput: no se publican cifras concretas de latencia ni throughput en la información disponible. El autor indica que la reducción de tokens en coreano (27,3 %) implica inferencia más rápida en ese idioma, pero sin valores absolutos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokenizador | KLUE-NER F1 | Licencia |
|---|---|---|---|---|---|
| mmBERT-CJKE-base | 312M | 8.192 | Gemma 3 (262K) | 0,9025 | MIT |
| mmBERT-base | 307M | 8.192 | Gemma 2 (256K) | 0,8921 | no disponible en la información |
| Variante con tokenizador Trillion (30B) | no disponible | no disponible | Trillion | regresó en todas las tareas | no disponible |

El autor solo proporciona comparación directa con mmBERT-base y con la variante entrenada con el tokenizador Trillion. No se incluyen comparaciones con otros encoders multilingües como XLM-R, mDeBERTa o RemBERT en la información disponible.

## Limitaciones y advertencias

- El modelo es un encoder de masked language modeling; no genera texto de forma autoregresiva ni soporta tool calling, agentes o razonamiento multi-paso.
- La cobertura lingüística se limita a coreano, chino, japonés e inglés; otros idiomas no están contemplados en el entrenamiento y su rendimiento no está garantizado.
- El rendimiento en tareas de clasificación a nivel de frase es prácticamente idéntico al modelo base (diferencias dentro del ruido de semilla, ±0,6 pp); la mejora se concentra en tareas sensibles a límites y en eficiencia de tokens.
- El modelo puede heredar sesgos presentes en FineWeb2, Wikipedia y FineWeb-edu, fuentes de datos web con posibles sesgos de representación, género, cultura o ideología.
- Riesgo de alucinación: al ser un modelo MLM, no genera texto libre, pero las predicciones de tokens enmascarados pueden ser incorrectas o reflejar sesgos del corpus; no debe usarse como fuente de verdad factual.
- La licencia MIT permite uso comercial sin restricciones adicionales conocidas, pero el autor no detalla condiciones específicas más allá de la licencia declarada.
- El checkpoint está en bfloat16; no se publican versiones cuantizadas oficiales (GGUF, GPTQ, AWQ), por lo que la cuantización requeriría conversión manual.
- La información sobre latencia, throughput y despliegue en servidores de inferencia (vLLM, TGI) no está disponible; la integración se limita a transformers según la model card.
- El modelo se distribuye como base para fine-tuning; su uso directo en producción requiere una cabeza de clasificación o tokenización entrenada para la tarea concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CaveduckAI/mmBERT-cjke-base
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Paper de mmBERT (referencia arXiv en los tags): https://arxiv.org/abs/2509.06888
- Sitio del desarrollador (Warp Space Inc. / Caveduck): https://caveduck.io
- Dataset FineWeb2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineWeb-edu-score-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu-score-2
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
