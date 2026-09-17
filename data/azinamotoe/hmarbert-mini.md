# azinamotoe/HmarBERT-mini

## Resumen

HmarBERT-mini (nombre en clave Bungpui) es un modelo de lenguaje enmascarado (Masked Language Model, MLM) construido desde cero para el idioma hmar (código ISO 639-3 `hmr`), una lengua tibeto-birmana hablada en el noreste de la India y zonas limítrofes. Lo publica el usuario azinamotoe en HuggingFace bajo licencia Apache 2.0. Su rasgo diferencial es que no reutiliza pesos, vocabulario ni tokenizador de modelos vecinos (cita explícitamente a MizBERT como ejemplo de modelo heredado de lenguas próximas): tanto el espacio de embeddings como el tokenizador WordPiece proceden únicamente de texto hmar auténtico.

Arquitectónicamente es un transformer encoder bidireccional estándar de la familia BERT, con solo 4 capas, dimensión oculta de 384, 6 cabezas de atención de 64 dimensiones cada una y FFN de 1.536. El total asciende a 16.906.368 parámetros (~16,91 millones), lo que en FP16 ocupa aproximadamente 32,2 MB. La longitud máxima de secuencia es de 512 tokens y el vocabulario WordPiece tiene 24.576 entradas, sin distinción de mayúsculas y con eliminación de acentos, de modo que la escritura formal acentuada y la escritura informal sin acentos colapsan en los mismos tokens canónicos.

Su relevancia es la de un recurso de infraestructura para una lengua de bajos recursos: sirve como base para fine-tuning en tareas de etiquetado, clasificación y búsqueda semántica, y como pieza de normalización ortográfica en una comunidad donde conviven registros formales e informales. La contrapartida es su escala: 4 capas y ~3,03 millones de tokens de entrenamiento lo sitúan en el segmento "mini" de la taxonomía de escalado de BERT, por lo que su techo de calidad es limitado y no se han publicado resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `BertForMaskedLM` (transformer encoder bidireccional) |
| Parámetros totales | 16.906.368 (~16,91 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (`max_position_embeddings`) |
| Tipos de cuantización | No disponible en la model card; por tamaño son viables FP32, FP16 (peso indicado ~32,2 MB) e INT8 |
| Idiomas soportados | Hmar (`hmr`, ISO 639-3) únicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`pytorch`); no se indican safetensors ni GGUF |

Detalles adicionales de configuración:

| Hiperparámetro | Valor |
|---|---|
| Capas (`num_hidden_layers`) | 4 |
| Dimensión oculta (`hidden_size`) | 384 |
| Cabezas de atención (`num_attention_heads`) | 6 (6 × 64 = 384) |
| Tamaño FFN (`intermediate_size`) | 1.536 (4 × hidden size) |
| Vocabulario (`vocab_size`) | 24.576 (WordPiece nativo) |
| Tamaño de pesos en FP16 | ~32,2 MB |
| Tokenizador | `BertWordPieceTokenizer`, uncased (`do_lower_case = True`), `strip_accents = True` |
| Tokens especiales | `[PAD]`=0, `[UNK]`=1, `[CLS]`=2, `[SEP]`=3, `[MASK]`=4 |
| Pipeline declarado | `fill-mask` |

## Arquitectura y entrenamiento

El modelo sigue la taxonomía formal de escalado de BERT (Turc et al., 2019, *Well-Read Students*), que define variantes reducidas de BERT cambiando profundidad y anchura. En este caso: 4 capas frente a las 12 de BERT-base, dimensión oculta de 384 frente a 768, y 6 cabezas frente a 12, con FFN de 1.536. Es, por tanto, un encoder bidireccional con atención multi-cabeza completa, sin innovaciones de arquitectura tipo atención lineal, decodificación especulativa o mecanismos SSM/MoE. La innovación declarada está en el tokenizador: un WordPiece entrenado exclusivamente sobre hmar, con normalización que elimina acentos para unificar la ortografía formal (con diacríticos) y la transcripción informal en teclado QWERTY, y que preserva compuestos complejos como unidades o como subpalabras coherentes (`inhril`, `##zel`, `##dan`).

El entrenamiento se realizó sobre el corpus `hmar-heritage-org/sentences`: 150.739 frases verificadas, equivalentes a unos 3,03 millones de tokens, todas validadas por el detector `hmaraniam`. El corpus cubre publicaciones formales e históricas, archivos de lingüística computacional y registros conversacionales naturales. El modelo card no detalla hiperparámetros de optimización (learning rate, batch size, número de épocas, esquema de enmascaramiento ni proporción de tokens enmascarados), ni si hubo fases posteriores de ajuste como RLHF o DPO; en un MLM puro estas fases no son de aplicación. Tampoco se documenta el número total de pasos ni el cómputo empleado.

## Capacidades

- Relleno de máscaras (`fill-mask`): predice tokens enmascarados en contexto bidireccional, uso principal declarado del modelo.
- Representaciones contextuales: al ser un encoder BERT, produce embeddings por token y por secuencia útiles para fine-tuning en clasificación, etiquetado de secuencias y recuperación semántica.
- Normalización ortográfica: equipara variantes acentuadas y sin acentuar al mismo token, lo que permite detectar y unificar grafías divergentes en hmar.
- Segmentación de compuestos: el vocabulario nativo mantiene compuestos frecuentes como tokens únicos y descompone el resto en subpalabras, útil para análisis morfológico.
- Cobertura de registros: entrenado con literatura formal, archivos históricos y conversación natural, por lo que cubre tanto texto académico como escritura coloquial.
- Multilingüismo: no soporta otros idiomas; está declarado exclusivamente para `hmr`.
- Tool calling / function calling: no disponible; es un MLM, no un modelo generativo instruido.
- Agentes y razonamiento multi-paso: no disponible por diseño.
- Modo de razonamiento explícito, visión o audio: no disponible.

## Casos de uso

- Autocompletado en editores de texto en hmar: integrado como servicio `fill-mask`, sugiere la palabra más probable en una posición enmascarada; con 32,2 MB en FP16 puede ejecutarse en el propio dispositivo del usuario sin conexión.
- Corrección y normalización ortográfica: al mapear formas acentuadas y no acentuadas al mismo token, permite unificar corpus heterogéneos (libros digitalizados frente a mensajes de móvil) antes de indexarlos o publicarlos.
- Etiquetado de secuencias (POS, NER) mediante fine-tuning: el encoder de 4 capas se puede afinar sobre unas pocas miles de frases anotadas manualmente, algo viable en lenguas de bajos recursos donde no hay modelos previos.
- Clasificación temática de patrimonio documental: entrenar un clasificador sobre las representaciones del `[CLS]` para organizar archivos históricos y publicaciones de la comunidad hmar por materia, época o tipo de documento.
- Búsqueda semántica en corpus digitalizados: generar embeddings de frase para alimentar un índice vectorial de textos hmar, permitiendo consultas por significado en lugar de por coincidencia literal de términos.
- Filtrado de calidad de corpus para ampliar el conjunto de entrenamiento: usar la perplejidad del modelo como criterio para descartar frases mal transcritas o ruidosas de futuras recolecciones de datos.
- Corrección posterior a OCR: al evaluar la probabilidad contextual de cada token, se pueden señalar y corregir errores de digitalización en escaneos de publicaciones antiguas en hmar.
- Análisis de sentimiento y moderación en comunidades hmar: fine-tuning sobre el encoder para clasificar mensajes en plataformas comunitarias, tarea para la que un modelo monolingüe nativo supera a un multilingüe genérico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de perplejidad, exactitud en `fill-mask`, ni resultados en tareas tipo GLUE, XNLI, NER o POS para hmar o para lenguas relacionadas. Tampoco se ofrecen comparaciones cuantitativas con MizBERT u otros modelos multilingües.

## Requisitos de hardware

- Huella de memoria: 16,91 M de parámetros. En FP32 el pesos ocupan ~67,6 MB; en FP16 ~32,2 MB según la model card; en INT8 ~17 MB. El estado de activaciones para secuencias de 512 tokens en lotes pequeños es del orden de decenas de MB adicionales.
- VRAM estimada para inferencia: menos de 1 GB en la práctica, incluso con lotes moderados; con lotes de 1 a 8 frases de 512 tokens basta con 1-2 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA y 2 GB o más funciona sin problema (GTX 1050 Ti, GTX 1650, RTX 3060, RTX 4090). Una A100 o H100 está completamente sobredimensionada para este tamaño.
- Viabilidad en hardware de consumo: sí, en cualquier GPU de consumo actual e incluso en CPU, Raspberry Pi o dispositivos móviles mediante exportación a ONNX Runtime.
- Opciones de despliegue: `transformers` con `BertForMaskedLM` o `pipeline("fill-mask")`, exportación a ONNX Runtime, TorchScript y servicios propios (por ejemplo FastAPI). vLLM, TGI, Ollama y llama.cpp están orientados a modelos generativos causales y su compatibilidad con este encoder de masked LM no está confirmada en la información disponible.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia en la model card.

## Comparativa con modelos similares

La model card menciona explícitamente a MizBERT como modelo de lengua vecina adaptado a hmar, pero no aporta sus cifras. Para el resto de alternativas, los datos no están en la información proporcionada.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Datos disponibles |
|---|---|---|---|---|---|
| HmarBERT-mini | 16,91 M | 512 | hmar (`hmr`) únicamente | Apache 2.0 | Completos (según model card) |
| MizBERT | No disponible | No disponible | Lenguas mizo relacionadas | No disponible | No disponible en la información proporcionada |
| BERT-base multilingüe (mBERT) | No disponible en la información proporcionada | No disponible | Multilingüe (incluye lenguas de la zona) | No disponible en la información proporcionada | No disponible en la información proporcionada |
| XLM-RoBERTa | No disponible en la información proporcionada | No disponible | Multilingüe | No disponible en la información proporcionada | No disponible en la información proporcionada |

Comparación cualitativa: frente a modelos multilingües genéricos, HmarBERT-mini parte con un vocabulario ajustado a la morfología hmar y sin sesgo de tokenización heredado de otras lenguas, lo que reduce la fragmentación en subpalabras; en cambio, su profundidad (4 capas) y su volumen de entrenamiento (~3,03 M de tokens) son muy inferiores, por lo que en tareas complejas es probable que un modelo multilingüe grande iguale o supere su rendimiento pese a la desventaja de vocabulario. No hay datos publicados que permitan cuantificar esa comparación.

## Limitaciones y advertencias

- Escala muy reducida: 4 capas y ~16,91 M de parámetros limitan la capacidad de representación semántica profunda; esperable un rendimiento inferior a BERT-base en tareas que requieran razonamiento sintáctico complejo.
- Corpus de entrenamiento pequeño: ~3,03 M de tokens y 150.739 frases. La cobertura de vocabulario y de dominios fuera de los registros recogidos (técnico, jurídico, neologismos) será escasa.
- Sin evaluación publicada: no existen métricas de perplejidad ni de tareas downstream, por lo que la calidad real del modelo no está verificada por terceros. Las 0 descargas y 0 "likes" en el momento de los metadatos indican ausencia de validación externa.
- Modelo monolingüe: solo hmar; no debe usarse con texto en inglés, mizo u otras lenguas, y no acepta prompts en otros idiomas.
- No es un modelo generativo ni instruido: no soporta chat, tool calling, agentes ni generación abierta de texto; cualquier uso conversacional requeriría fine-tuning específico y aun así estaría limitado por el tamaño.
- Riesgo de alucinación en `fill-mask`: las predicciones son distribuciones de probabilidad sobre el vocabulario, no hechos verificados. En contextos históricos o culturales puede producir formas plausibles pero incorrectas, especialmente en nombres propios y topónimos poco representados.
- Sesgo de corpus: al proceder de publicaciones formales, archivos lingüísticos y conversación natural de una comunidad concreta, el modelo refleja los sesgos temáticos y de registro de esas fuentes, con posible infrarrepresentación de variedades dialectales.
- Normalización agresiva: `do_lower_case = True` y `strip_accents = True` eliminan distinciones de mayúsculas y diacríticos. Esto es útil para interoperabilidad, pero impide tareas que dependan de esas distinciones (por ejemplo, restaurar acentos correctamente).
- Riesgo de tokens `[UNK]`: aunque el vocabulario de 24.576 entradas está diseñado para hmar, los préstamos léxicos y los términos fuera de dominio pueden caer en `[UNK]` o fragmentarse en exceso.
- Licencia del modelo Apache 2.0, que permite uso comercial y modificaciones, pero la licencia del dataset `hmar-heritage-org/sentences` no se especifica en la información disponible; conviene verificarla antes de redistribuir derivados con fines comerciales.
- Sin formatos alternativos publicados: no hay pesos en safetensors, GGUF ni ONNX en el repositorio según los tags; el despliegue en entornos ligeros requiere conversión propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/azinamotoe/HmarBERT-mini
- Dataset de entrenamiento: https://huggingface.co/datasets/hmar-heritage-org/sentences
- Referencia citada en la model card: Turc et al., 2019, *Well-Read Students: A Comparison of Multi-Head Self-Attention Architectures* (paper sobre la taxonomía de escalado de BERT).

Nota: la búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo, su autor, el corpus o el idioma hmar; los enlaces anteriores provienen de la información de HuggingFace y de la propia model card.
