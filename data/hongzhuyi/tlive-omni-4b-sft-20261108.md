# hongzhuyi/tlive-omni-4b-sft-20261108

## Resumen

TLive-Omni es un modelo de comprensión omni-modal desarrollado por TaoLiveAIGC, orientado específicamente al dominio del comercio en directo (live-stream shopping). El modelo mapea imagen, vídeo, audio y texto a una interfaz unificada de salida textual, construido sobre un backbone Qwen3.5 al que se le injerta un codificador de audio AuT mediante un alineador MLP ligero. La variante publicada bajo el identificador `hongzhuyi/tlive-omni-4b-sft-20261108` corresponde a la versión de 4B tras el proceso de SFT y el ajuste por refuerzo Faithful-RFT.

La innovación principal reside en su diseño de layout "Per-vGrid con marcas de tiempo": los tokens de audio y vídeo se organizan en una rejilla temporal con fronteras explícitas, de modo que cada segmento de audio queda adyacente a su contenido visual correspondiente. Esto permite un alineamiento temporal fino sobre streams largos, con un contexto de hasta 256K tokens en inferencia.

El modelo es relevante porque aborda tareas que los modelos multimodales generalistas rinden con dificultad en el dominio del live-commerce: reconocimiento de voz con atribución de hablante, grounding visual de productos, OCR en pantalla, grounding temporal y descripción densa de vídeo. Se distribuye con licencia Apache-2.0 y pesos en safetensors, lo que facilita su integración en pipelines de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone Qwen3.5 + codificador de audio AuT + alineador MLP) |
| Parametros totales | 5.823.547.776 (≈5,82B, segun safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 256K tokens en inferencia |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 11,7 GB), requiere `custom_code` |

## Arquitectura y entrenamiento

TLive-Omni parte de un backbone Qwen3.5 al que se le añade un codificador de audio AuT conectado mediante un alineador MLP ligero, formando un modelo unificado de comprensión omni-modal con salida exclusivamente textual. Para entradas de vídeo con audio, cada rejilla temporal se organiza como un grid con marcas de tiempo que intercala bloques de tokens de vídeo y de audio, manteniendo cada segmento de audio junto a su contenido visual correspondiente. Esta disposición permite un alineamiento temporal fino a lo largo de streams largos y es la base de las capacidades de grounding temporal y de ASR con atribución de hablante.

El entrenamiento sigue una receta de SFT en tres etapas: alineamiento audio-lenguaje, SFT multimodal completo y, finalmente, un ajuste por refuerzo denominado Faithful-RFT orientado a las exigencias del live-stream en tiempo real. Esta última etapa suprime las trazas de razonamiento explícitas y optimiza directamente la calidad de la respuesta para tareas de live-commerce. El modelo se apoya en una taxonomía de capacidades atómicas orientada a escenarios (reconocimiento de voz, análisis de hablantes, grounding visual de producto, reconocimiento de texto, grounding temporal, caption denso de vídeo y QA omni-modal), alimentada por un motor compacto de producción de datos. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Comprensión omni-modal de imagen, vídeo, audio y texto con salida textual unificada.
- Reconocimiento automático de voz (ASR) en streams de live-commerce, con métrica CER reportada.
- ASR con atribución de hablante (speaker-attributed ASR), evaluada con cpWER.
- Análisis de hablantes en conversaciones multi-participante.
- Grounding visual de productos: localización de artículos en la imagen o el vídeo.
- Reconocimiento de texto en pantalla (OCR) sobre contenido de retransmisión.
- Grounding temporal: localización de eventos dentro de un stream de vídeo.
- Descripción densa de vídeo (video dense caption).
- QA omni-modal que combina audio, vídeo, imagen y texto en una misma consulta.
- Alineamiento temporal fino gracias al layout Per-vGrid con marcas de tiempo.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni de agentes multi-paso.

## Casos de uso

- Monitorización de directos de venta: el modelo puede procesar el audio y el vídeo de un stream en directo y generar transcripciones con atribución de hablante, aprovechando su ventana de 256K tokens para cubrir sesiones largas sin truncar el contexto.
- Búsqueda y catalogación de producto en vídeo: mediante grounding visual y grounding temporal, permite localizar en qué instante del directo aparece un producto concreto y qué se dice sobre él, útil para generar fichas de producto automáticas.
- Moderación y análisis de contenido en retransmisiones: la combinación de ASR, OCR en pantalla y caption denso permite detectar afirmaciones, precios o textos mostrados en pantalla y revisarlos de forma automatizada.
- Generación de resúmenes post-directo: a partir de la transcripción con hablantes y de la descripción densa de vídeo, se pueden producir resúmenes con marcas de tiempo para publicación o archivo.
- Accesibilidad de contenido en directo: transcripción con identificación de hablantes y descripción de lo que ocurre en pantalla para audiencias con discapacidad auditiva o visual.
- Extracción de insights de conversación comercial: análisis de QA omni-modal sobre clips de directo para identificar objeciones de clientes, preguntas frecuentes y argumentos de venta, alimentando sistemas de analítica.
- Indexación multimodal de archivo audiovisual: el modelo puede procesar lotes de vídeos con audio para generar metadatos buscables (texto, hablantes, productos, eventos temporales) sobre un corpus de e-commerce.

## Benchmarks y rendimiento

Resultados publicados en la model card para tareas de live-commerce (menor es mejor en CER y cpWER):

| Tarea | Metrica | TLive-Omni 4B | TLive-Omni 9B | Qwen3-Omni 30B-A3B | Qwen2.5-Omni 7B | MiniCPM-o 4.5 9B | Gemini 3 Pro |
|---|---|---|---|---|---|---|---|
| Live-Commerce ASR | CER ↓ | 6,66 | 6,46 | 6,75 | 7,86 | 10,70 | 12,09 |
| Speaker-Attributed ASR | cpWER ↓ | 12,88 | 12,27 | 27,84 | no disponible | 18,89 | 11,67 |

La model card incluye además comparativas frente a Gemini 2.5 Flash/Pro, Gemini 3 Flash, Gemini 3.5 Flash, Qwen3.5-Omni Flash, OmniVinci 9B, Nemotron 3 Nano Omni 30B-A3B, Ming-Lite-Omni v1.5 20B-A3B y MiniCPM-o 2.6 8B, así como evaluaciones en tareas de imagen y vídeo y en benchmarks generales. Los resultados completos de esas tablas no están recogidos en la información disponible de esta ficha; solo se han podido verificar las dos filas de audio mostradas arriba.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5,82B parámetros en precisión completa (fp16/bf16) se requieren aproximadamente 11,6 GB solo para los pesos, más overhead de activaciones y del codificador de audio; en cuantización de 8 bits bajaría a unos 6 GB y en 4 bits a unos 3-4 GB, aunque no se documentan cuantizaciones oficiales para este modelo.
- GPU recomendadas: A100 40/80 GB o H100 para contexto largo (256K tokens) e inferencia en fp16; L40S o RTX 6000 Ada como alternativas de 48 GB.
- Cabe en GPU de consumo: sí en fp16 en tarjetas con 16-24 GB (RTX 4090, RTX 3090) para contextos moderados; con contexto cercano a 256K el coste de KV cache puede exceder la VRAM disponible en consumer.
- Opciones de despliegue: transformers (librería declarada, requiere `trust_remote_code=True` por el `custom_code`); no se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| TLive-Omni 4B (este) | ≈5,82B | 256K | Apache-2.0 | Omni-modal especializado en live-commerce | Hugging Face |
| TLive-Omni 9B | no disponible | 256K | Apache-2.0 | Omni-modal live-commerce | Hugging Face (TaoLiveAIGC) |
| Qwen2.5-Omni 7B | 7B | no disponible en esta ficha | no disponible en esta ficha | Omni-modal generalista | Hugging Face |
| MiniCPM-o 4.5 9B | 9B | no disponible en esta ficha | no disponible en esta ficha | Omni-modal generalista | Hugging Face |
| Qwen3-Omni 30B-A3B | 30B totales (MoE) | no disponible en esta ficha | no disponible en esta ficha | Omni-modal generalista de mayor escala | Hugging Face |

En las dos tareas de audio reportadas, la variante de 4B supera a Qwen3-Omni 30B-A3B en ASR de live-commerce (CER 6,66 frente a 6,75) y en ASR con atribución de hablante (cpWER 12,88 frente a 27,84), y queda por delante de MiniCPM-o 4.5 9B en ASR (6,66 frente a 10,70). Frente a Gemini 3 Pro, el modelo de 4B obtiene mejor CER (6,66 frente a 12,09) pero peor cpWER (12,88 frente a 11,67).

## Limitaciones y advertencias

- El modelo está especializado en live-commerce; su rendimiento en dominios generales puede ser inferior al de modelos omni-modales generalistas, aunque la model card afirma una generalización competitiva en benchmarks generales.
- La salida es exclusivamente textual: no genera audio, imagen ni vídeo.
- No se documentan los idiomas soportados; la evaluación publicada se centra en tareas de live-commerce sin especificar cobertura lingüística.
- No se documentan sesgos conocidos ni tasas de alucinación medidas; como todo modelo generativo, existe riesgo de alucinación en QA omni-modal y en descripciones densas.
- El uso de contexto de 256K tokens implica un coste elevado de memoria KV y de tiempo de inferencia; en producción conviene limitar la ventana al mínimo necesario.
- Requiere `trust_remote_code=True` por el código personalizado; conviene auditar el código antes de desplegarlo en entornos de producción.
- Aunque la licencia es Apache-2.0, el modelo deriva de un backbone Qwen3.5 y de un codificador AuT cuyas condiciones de licencia conviene verificar antes de un uso comercial.
- El repositorio tiene muy pocas descargas (33) y ningún "like" en el momento de la consulta; es un artefacto reciente con escasa validación comunitaria.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/hongzhuyi/tlive-omni-4b-sft-20261108
- Hugging Face modelo 4B oficial: https://huggingface.co/TaoLiveAIGC/TLive-Omni-4B
- Hugging Face modelo 9B oficial: https://huggingface.co/TaoLiveAIGC/TLive-Omni-9B
- Informe técnico (arXiv): https://arxiv.org/abs/2608.20958
- Repositorio GitHub: https://github.com/TaoLiveAIGC/TLive-Omni
