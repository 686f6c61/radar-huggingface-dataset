# Grundik/abkhaz-lemma-byt5

## Resumen

El modelo `Grundik/abkhaz-lemma-byt5` es un lematizador para el idioma abjasio (ISO 639-1: `ab`), una lengua caucásica noroccidental de tipología polisintética. Lo desarrolla Marat Ionov (usuario Grundik) como parte de un proyecto de infraestructura digital para el abjasio que abarca OCR, morfología y análisis de maquetación de prensa histórica. El modelo resuelve una tarea concreta: dado un par forma-palabra y etiqueta de categoría gramatical (UPOS), devolver el lema correspondiente.

Técnicamente es un fine-tuning de `google/byt5-small` (299,6 millones de parámetros) sobre 10.335 pares palabra-lema extraídos del treebank UD_Abkhaz-AbNC, anotado en formato Universal Dependencies. La elección de ByT5 responde a una limitación real: los vocabularios SentencePiece de T5/mT5 no cubren letras específicas del abjasio (`ҩ, ҵ, ҷ, ԥ, ҕ`), que colapsan en tokens `<unk>`. Al operar directamente sobre bytes UTF-8, ByT5 procesa cada carácter de forma nativa.

Su relevancia es la de una herramienta de nicho para lenguas de bajos recursos: no compite en capacidades generales, sino que cubre un hueco morfológico que los modelos multilingües de propósito general no atienden bien. El autor recomienda explícitamente usarlo como respaldo de un generador morfológico basado en reglas, no como herramienta principal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5 v1.1 con tokenización a nivel de byte, ByT5) |
| Parámetros totales | 299.637.760 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (entrada corta del tipo `POS: {upos} WORD: {word}`; generación con `max_length=64`) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers, aunque no se documentan variantes publicadas) |
| Idiomas soportados | abjasio (`ab`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de ByT5-small, una variante de T5 que sustituye el tokenizador SentencePiece por una codificación directa de bytes UTF-8. Esta decisión es clave para el abjasio: el alfabeto cirílico ampliado que emplea incluye grafemas que los vocabularios multilingües convencionales no representan, lo que provoca pérdida de información en la tokenización. La arquitectura es un transformer encoder-decoder estándar con atención completa, sin modificaciones estructurales respecto al modelo base.

El ajuste fino se realizó sobre 10.335 pares de entrenamiento y 1.355 de evaluación, extraídos del treebank UD_Abkhaz-AbNC (corpus periodístico digitalizado con la Biblioteca Nacional de Abjasia). La configuración fue de 10 épocas, batch size 8, learning rate 1e-4 y precisión BF16, sobre una NVIDIA RTX 5060 Ti de 16 GB. El formato de entrada es `POS: {upos} WORD: {word}` y la salida es el lema. No se documenta uso de RLHF, DPO ni decodificación especulativa; la inferencia de ejemplo emplea búsqueda por haces con `num_beams=4`.

## Capacidades

- Lematización de formas verbales, nominales y de otras categorías del abjasio, condicionada por la etiqueta UPOS de entrada.
- Procesamiento nativo de caracteres del alfabeto abjasio sin pérdida por tokens desconocidos, gracias a la tokenización por bytes.
- Generación seq2seq de secuencias cortas (lemas), con decodificación por haces configurable.
- Manejo de formas fuera de vocabulario y de ruido típico de OCR, según indica el autor.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al abjasio; no se documenta transferencia a otras lenguas.

## Casos de uso

- Normalización morfológica en pipelines de PNL para abjasio: integrado como paso previo a análisis sintáctico o búsqueda, convierte formas flexionadas en lemas para agrupar variantes de una misma palabra en índices y motores de búsqueda.
- Respaldo de un analizador basado en reglas: el autor recomienda esta arquitectura híbrida; el modelo cubre formas fuera de vocabulario o con ruido de OCR que el generador morfológico rule-based no reconoce.
- Post-procesado de OCR de prensa histórica: tras digitalizar periódicos abjasios, el lematizador ayuda a consolidar formas erróneas o variables antes de indexar el corpus.
- Construcción de léxicos y diccionarios: a partir de corpus etiquetados, permite generar listados de lemas agrupando las formas atestiguadas, útil para lexicografía y documentación lingüística.
- Enseñanza y aprendizaje del abjasio: una aplicación didáctica puede mostrar el lema de una forma verbal compleja, ayudando a estudiantes a identificar la raíz tras prefijos y sufijos de concordancia.
- Investigación en lenguas polisintéticas: sirve como línea base reproducible (fine-tuning ligero sobre ByT5) para experimentos de morfología en lenguas de bajos recursos con ortografías no latinas.
- Anotación asistida de corpus: preanotación de lemas en nuevos textos para revisión humana, reduciendo el esfuerzo manual en la ampliación de treebanks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud, F1 ni comparaciones cuantitativas con otras aproximaciones.

## Requisitos de hardware

- VRAM para inferencia: en BF16, aproximadamente 0,6 GB de pesos; en FP32, alrededor de 1,2 GB. Con overhead de activaciones y decodificación por haces, cabe holgadamente en 2-4 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el propio autor entrenó en una RTX 5060 Ti de 16 GB, muy por encima de lo necesario para inferencia.
- Cabe en GPU consumer: sí, en tarjetas con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.), e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `AutoModelForSeq2SeqLM`, text-generation-inference (el repo está marcado como compatible con endpoints), y exportación a ONNX para despliegue ligero. No se documentan pesos GGUF para llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; al tratarse de un modelo de 300M con entradas y salidas cortas, se espera baja latencia en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Grundik/abkhaz-lemma-byt5 | 299,6 M | no disponible | Lematización abjasia | MIT | Hugging Face |
| google/byt5-small | 299,6 M | no disponible | Seq2seq general (base) | Apache 2.0 | Hugging Face |
| google/mt5-small | 300 M | 512 tokens | Seq2seq multilingüe | Apache 2.0 | Hugging Face |
| Generador morfológico rule-based (UD_Abkhaz-AbNC) | no aplica | no aplica | Morfología abjasia | según repositorio | GitHub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La diferencia cualitativa principal frente a mT5-small es la tokenización por bytes, que evita el colapso en `<unk>` de los grafemas abjasios; frente a un generador rule-based, el modelo cubre formas no vistas pero con menor precisión en paradigmas regulares.

## Limitaciones y advertencias

- El entrenamiento cubre solo unos 10.335 pares únicos; en una lengua polisintética esto representa una fracción pequeña de los paradigmas flexivos posibles, por lo que la cobertura de formas nuevas es limitada.
- El autor recomienda usar un generador morfológico basado en reglas como herramienta principal y este modelo solo como respaldo para formas fuera de vocabulario o con ruido de OCR.
- Riesgo de alucinación morfológica: al ser un modelo generativo, puede producir lemas plausibles pero incorrectos en formas no atestiguadas durante el entrenamiento.
- Dependencia de la etiqueta UPOS de entrada: una etiqueta incorrecta puede degradar la lematización, ya que la categoría gramatical condiciona la salida.
- Sesgos: no documentados, pero el corpus de origen (prensa histórica abjasia) puede sobrerrepresentar ciertos registros y dominios frente al habla contemporánea.
- Limitación de idioma: solo abjasio; no se ha evaluado su comportamiento en otras lenguas caucásicas ni en ruso, pese a la situación de bilingüismo.
- Licencia MIT: permite uso comercial y modificación con atribución, sin restricciones adicionales documentadas.
- Para producción, conviene validar la salida con un léxico o un verificador morfológico, dado el tamaño reducido del conjunto de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Grundik/abkhaz-lemma-byt5
- Modelo base ByT5-small: https://huggingface.co/google/byt5-small
- Treebank UD_Abkhaz-AbNC: https://github.com/UniversalDependencies/UD_Abkhaz-AbNC
- Universal Dependencies: https://universaldependencies.org/
