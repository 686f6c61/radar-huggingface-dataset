# mehdi-hf/persian-g2p-0.6b

## Resumen

persian-g2p-0.6b es un modelo especializado en conversión de grafemas a fonemas (G2P) para persa (farsi), desarrollado por el usuario mehdi-hf. Se trata de un ajuste fino supervisado del modelo base Qwen/Qwen3-0.6B-Base, con 596.049.920 parámetros totales, entrenado sobre una versión estrictamente libre de filtraciones y deduplicada del dataset MahtaFetrat/HomoRich-G2P-Persian (licencia CC0-1.0), con aumentación de datos mediante kasra.

El problema que resuelve es la ambigüedad fonética del persa escrito: los homógrafos (palabras con la misma grafía pero distinta pronunciación, como «مرد» que puede ser *mard* o *mord*) y la marca del ezafe (el sufijo vocálico -e / -ye que une sustantivo y modificador) son fuentes habituales de error en sistemas de síntesis de voz (TTS) y reconocimiento de voz (ASR). El modelo genera una representación fonética explícita en la notación denominada Repr. 1, con marcadores de ezafe y conversión sin pérdida a IPA.

Su relevancia actual radica en que ofrece una licencia Apache-2.0 limpia, sin dependencia de datasets GPL ni de Parsivar, y en que supera al baseline publicado Homo-GE2PE en las métricas de WER, desambiguación de homógrafos y F1 de ezafe sobre un conjunto de evaluación estrictamente separado (SentenceBench, 400 filas, 0 % de solapamiento). Está pensado como componente de pipelines TTS y de normalización fonética para persa, no como un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajustado para generación de texto |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso trunca a 512 tokens de entrada y genera hasta 256 tokens) |
| Tipos de cuantización | no disponible (el ejemplo de uso emplea bfloat16; el repo incluye safetensors) |
| Idiomas soportados | persa (fa) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B-Base, un transformer decoder-only de la familia Qwen3 con unos 596 M de parámetros. El ajuste fino se realizó sobre una versión del dataset HomoRich-G2P-Persian estrictamente libre de filtraciones, deduplicada y con licencia CC0-1.0, complementada con aumentación de kasra (ـِ). Posteriormente se aplicó un ajuste fino de continuación de 2.000 pasos sobre 256.000 ejemplos balanceados de persa plano, con kasra y con vocales internas diacritizadas, lo que permitió incorporar el soporte de las tres vocales cortas (fatha, kasra, damma) sin romper la tokenización BPE.

La tarea se formula como generación condicionada por un prompt en el que se pide la conversión de una frase persa a fonemas en Repr. 1, incluyendo marcadores explícitos de ezafe (-e / -ye). La innovación principal es el tratamiento determinista del override de kasra: escribir la kasra en una palabra fuerza la lectura con ezafe, lo que aporta control explícito al usuario. La salida en Repr. 1 es convertible de forma biunívoca a IPA mediante una tabla de mapeo incluida en la model card. No se documentan detalles sobre RLHF, DPO ni sobre el volumen total de tokens de entrenamiento.

## Capacidades

- Conversión de grafemas a fonemas para persa con salida en notación Repr. 1 y conversión sin pérdida a IPA.
- Desambiguación de homógrafos en contexto de frase (por ejemplo, «مرد» como *mard* o *mord*, «ملک» como *malek* o *melk*, «تست» como *tost* o *test*).
- Marcado explícito de ezafe con los sufijos -e y -ye en la salida fonética.
- Override determinista de kasra: la presencia de kasra en una palabra fuerza la lectura con ezafe (10/10 en la evaluación).
- Soporte nativo de las tres vocales cortas persas (fatha, kasra, damma) tras el ajuste de continuación, con una tasa de acierto del 72,7 % (16/22) en el conjunto completo de diacríticos.
- Generación de texto condicionada por prompt; no es un modelo conversacional ni de razonamiento general.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Síntesis de voz (TTS) en persa: el modelo proporciona la secuencia fonética con ezafe explícito que necesita el front-end de un sistema TTS para pronunciar correctamente frases como «ketAb-e jadid-e man», evitando errores típicos de homógrafos.
- Normalización fonética en pipelines de ASR: convertir transcripciones ortográficas a fonemas para alinear léxicos de pronunciación y reducir la tasa de error en palabras ambiguas.
- Generación de léxicos de pronunciación: procesar por lotes listas de palabras y frases para construir diccionarios fonéticos con marcado de ezafe y variantes diacritizadas.
- Sistemas de lectura asistida y accesibilidad: convertir texto persa a una representación fonética legible o a IPA para usuarios con dificultades de lectura o para herramientas de aprendizaje de la lengua.
- Investigación en lingüística computacional del persa: evaluar fenómenos de homografía y ezafe con un modelo de referencia libre de filtraciones y con licencia permisiva.
- Preprocesamiento en sistemas de diálogo por voz en persa: normalizar la entrada textual antes de la síntesis de respuesta, garantizando pronunciaciones coherentes en conversaciones multi-turno.
- Integración en aplicaciones educativas de enseñanza del farsi: mostrar la pronunciación fonética y la transcripción IPA de frases introducidas por el estudiante.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre SentenceBench (400 filas, 0 % de solapamiento con el entrenamiento):

| Modelo | Parámetros | Licencia | Sin filtración | PER válido ↓ (4k) | PER SB ↓ | PER SB (glotal) ↓ | WER SB ↓ | Homógrafo oficial ↑ (212) | Homógrafo ambiguo total ↑ (359) | F1 ezafe ↑ (P / R) | Override kasra | Velocidad (A100) |
|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Baseline (Homo-GE2PE) | 8,26 M | MIT | No (403 filtradas) | — | 3,21 % | 3,39 % | 16,04 % | 70,28 % | 77,44 % | 86,76 % (84,2 / 89,5) | 10/10 | 43,7 s/s |
| persian-g2p-tiny | 8,26 M | MIT | Sí (0 filtradas) | 1,76 % | 3,20 % | 3,34 % | 15,34 % | 69,81 % | 77,44 % | 87,07 % (80,0 / 95,5) | 10/10 | 49,5 s/s |
| persian-g2p-0.6b (este) | 596 M | Apache-2.0 | Sí (0 filtradas) | 1,44 % | 3,18 % | 3,35 % | 14,79 % | 72,17 % | 80,50 % | 88,89 % (83,1 / 95,5) | 10/10 | 26,5 s/s |

Suite de diacríticos: el ajuste de continuación elevó el acierto en el conjunto completo de 22 ítems del 36,4 % (8/22) al 72,7 % (16/22). El PER en SentenceBench plano mejoró simultáneamente de 3,24 % a 3,18 % y el WER de 15,05 % a 14,79 %.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los 596 M de parámetros ocupan aproximadamente 1,2 GB de pesos, más el overhead de activaciones y caché KV; en la práctica cabe holgadamente en GPUs con 4-6 GB. En cuantización de 8 bits o 4 bits (si se generan pesos GGUF/AWQ) el requisito bajaría por debajo de 1 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM; el autor reporta velocidad en A100 (26,5 s/s en la evaluación). Una RTX 4090, RTX 3090 o incluso una RTX 3060 de 12 GB son suficientes.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y en iGPUs con suficiente memoria compartida para cuantizaciones agresivas.
- Opciones de despliegue: transformers (referencia del autor), text-generation-inference (etiqueta endpoints_compatible), y potencialmente llama.cpp/Ollama si se generan pesos GGUF, aunque el autor no los publica.
- Latencia y throughput: el autor reporta 26,5 s/s en A100 sobre el benchmark; el ejemplo de uso procesa lotes con padding izquierdo y generación determinista (do_sample=False), con hasta 256 tokens nuevos por frase.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PER SB ↓ | WER SB ↓ | F1 ezafe ↑ | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---:|---|---|
| persian-g2p-0.6b | 596 M | no disponible | 3,18 % | 14,79 % | 88,89 % | Apache-2.0 | Hugging Face |
| persian-g2p-tiny | 8,26 M | no disponible | 3,20 % | 15,34 % | 87,07 % | MIT | Hugging Face |
| Homo-GE2PE (baseline) | 8,26 M | no disponible | 3,21 % | 16,04 % | 86,76 % | MIT | publicado como baseline |

La comparativa se limita a los modelos reportados en la model card. El modelo de 596 M obtiene la mejor precisión en PER, WER, desambiguación de homógrafos y F1 de ezafe, a costa de un mayor tamaño y de una velocidad inferior por frase en A100 (26,5 s/s frente a 49,5 s/s del tiny). El tiny es preferible cuando el presupuesto de cómputo o de memoria es muy restrictivo y la precisión adicional no es crítica.

## Limitaciones y advertencias

- Es un modelo especializado en G2P para persa; no debe emplearse como modelo de propósito general, chat o razonamiento.
- Solo soporta persa (fa); no se documenta cobertura multilingüe.
- La longitud de contexto no está especificada; el ejemplo de uso trunca a 512 tokens, por lo que frases muy largas pueden requerir segmentación.
- El rendimiento en diacríticos completos es del 72,7 % (16/22), no del 100 %; quedan casos ambiguos sin resolver.
- Riesgo de alucinación en la salida fonética: al ser un modelo generativo, puede producir secuencias fonéticas plausibles pero incorrectas en entradas fuera de distribución u ortografías no vistas.
- La evaluación se realizó sobre SentenceBench (400 filas); no se reportan resultados en otros conjuntos independientes, lo que limita la generalización de las cifras.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar que el modelo base Qwen3-0.6B-Base mantiene esa misma licencia en la versión distribuida.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ); el despliegue en CPU requiere conversión propia.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que la validación por parte de la comunidad es todavía muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mehdi-hf/persian-g2p-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Modelo hermano tiny: https://huggingface.co/mehdi-hf/persian-g2p-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/MahtaFetrat/HomoRich-G2P-Persian
- Paper de referencia (arXiv:2505.12973): https://arxiv.org/abs/2505.12973
