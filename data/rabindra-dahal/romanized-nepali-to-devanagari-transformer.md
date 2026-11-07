# rabindra-dahal/romanized-nepali-to-devanagari-transformer

## Resumen

El modelo `rabindra-dahal/romanized-nepali-to-devanagari-transformer` es un transformer sequence-to-sequence de dos capas construido desde cero en PyTorch por el desarrollador Rabindra Dahal. Su tarea es la transliteración (con conversión ortográfica y morfológica) de nepalí romanizado —texto escrito con caracteres latinos, como "kto naya gainda herchha"— a escritura devanagari estándar ("केटा नयाँ गैंडा हेर्छ।"). No se trata de un modelo de lenguaje generativo de propósito general, sino de un sistema especializado y de dominio muy acotado.

El interés del modelo es fundamentalmente práctico y de nicho: cubre la necesidad de los hablantes de nepalí que escriben en alfabeto latino en chats, redes sociales o teclados sin soporte devanagari, y necesitan normalizar ese texto a la escritura oficial. Es un modelo pequeño (el repositorio ocupa 0.0 GB según Hugging Face), con arquitectura transformer encoder-decoder de solo dos capas, entrenado sobre el dataset `rabindra-dahal/english-nepali-romanized-csv-text-for-kid-learning`.

Su relevancia es limitada fuera de ese nicho: no es un modelo de propósito general, no tiene pipeline declarado en el Hub, no cuenta con licencia especificada y registra 0 descargas. Debe evaluarse como una herramienta de transliteración especializada y experimental, no como un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer sequence-to-sequence (encoder-decoder) de 2 capas, implementado en PyTorch |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `model.pt`, formato PyTorch nativo) |
| Idiomas soportados | nepalí (`ne`), en su variante romanizada y devanagari |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`) + tokenizer (`tokenizer.json`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder de dos capas construido desde cero en PyTorch, sin indicios de que se base en un modelo preentrenado. El autor no documenta el número de parámetros, la dimensión de los embeddings, el número de cabezas de atención ni la longitud máxima de secuencia. El tokenizador se distribuye como `tokenizer.json`, presumiblemente un tokenizador a nivel de carácter o subpalabra entrenado específicamente para el par romanizado/devanagari.

El entrenamiento se realizó sobre el dataset `rabindra-dahal/english-nepali-romanized-csv-text-for-kid-learning`, orientado a frases sencillas de nivel infantil. No se documenta el número de tokens de entrenamiento, la composición exacta del corpus, ni si se aplicaron técnicas de RLHF, DPO o ajuste fino supervisado más allá del entrenamiento seq2seq estándar. Tampoco se detalla ninguna innovación técnica (decodificación especulativa, atención lineal, etc.). Las métricas declaradas (BLEU-4 y chrF) sugieren un entrenamiento supervisado con pares de referencia.

## Capacidades

- Transliteración de nepalí romanizado a devanagari: convierte cadenas como "kto naya gainda herchha" en "केटा नयाँ गैंडा हेर्छ।".
- Normalización ortográfica: la salida incluye puntuación devanagari (por ejemplo, el signo de cierre "।") y formas léxicas completas, no solo una conversión carácter a carácter.
- Traducción de frases cortas de dominio cotidiano e infantil, según el corpus de entrenamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales (visión, audio) ni modo "thinking".
- Cobertura multilingüe limitada al nepalí; no se documenta soporte de inglés u otros idiomas.

## Casos de uso

- Normalización de mensajes de chat y redes sociales: los usuarios nepalíes que escriben en caracteres latinos pueden pasar sus mensajes por el modelo para obtener texto devanagari listo para publicar o archivar. Es adecuado por su especialización en el par romanizado-devanagari y su bajo coste computacional.
- Preprocesamiento de corpus para PLN en nepalí: convertir grandes volúmenes de texto romanizado (por ejemplo, comentarios de foros) a devanagari antes de alimentar modelos de análisis de sentimiento o etiquetado morfológico entrenados en escritura nativa.
- Corrección de entrada en teclados sin soporte devanagari: integrar el modelo en un teclado o editor para que el usuario escriba en transliteración latina y obtenga devanagari, alternativa programática a conversores web como Unicode Nepali o NepaliType.
- Digitalización de materiales educativos infantiles: dado que el corpus de entrenamiento es de nivel infantil, el modelo encaja en la transcripción de cuentos, ejercicios y fichas escolares escritas en romanizado.
- Generación de datos sintéticos para entrenar otros modelos: producir pares romanizado-devanagari adicionales a partir de frases semilla, útiles para aumentar corpus de transliteración.
- Herramienta auxiliar en pipelines de traducción: como paso previo de normalización antes de un sistema de traducción nepalí-inglés que espere entrada en devanagari.
- Prototipado y docencia: ejemplo didáctico de un transformer seq2seq mínimo entrenado desde cero, útil para demostrar el ciclo completo de tokenización, entrenamiento y evaluación con BLEU/chrF.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto de evaluacion |
|---|---|---|
| Exact Match Accuracy | 100.0 % (200/200) | 200 muestras (no se especifica su origen) |
| Corpus BLEU-4 | 100.0 / 100 | 200 muestras |
| chrF | 100.0 / 100 | 200 muestras |

No se han publicado resultados comparativos con otros modelos de transliteración en la informacion disponible. Los valores perfectos en las tres métricas deben interpretarse con cautela: no se documenta si las 200 muestras de evaluación son disjuntas del conjunto de entrenamiento ni su distribución, por lo que un 100 % de exactitud es compatible con un posible solapamiento entre evaluación y entrenamiento o con un corpus de evaluación muy restringido y homogéneo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0.0 GB) y una arquitectura de 2 capas, se espera que quepa holgadamente en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte CUDA (por ejemplo, RTX 3060 o superior) es más que suficiente. También es viable la inferencia en CPU para volúmenes moderados.
- Cabe en GPU consumer: sí, previsiblemente en cualquier modelo con al menos unos pocos GB de VRAM.
- Opciones de despliegue: el modelo se carga con PyTorch nativo mediante `hf_hub_download` y la clase `NepaliTranslator` incluida en el repositorio. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; el formato `model.pt` no es directamente compatible con estos motores sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de transliteración nepalí en la información proporcionada. Como referencia cualitativa, existen conversores basados en reglas y diccionarios accesibles por web (Unicode Nepali Converter, NepaliType), que realizan transliteración determinista sin modelo neuronal, pero no se han publicado comparaciones formales con este transformer.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| romanized-nepali-to-devanagari-transformer | no disponible | no disponible | Transformer seq2seq neuronal (2 capas) | no disponible | Hugging Face |
| Unicode Nepali Converter | no aplica | no aplica | Conversor web basado en reglas | no disponible | Web |
| NepaliType | no aplica | no aplica | Conversor web basado en reglas | no disponible | Web |

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; conviene contactar con el autor antes de integrarlo en producción.
- Corpus de entrenamiento de nivel infantil: la cobertura léxica y de registros es probablemente muy limitada; el rendimiento en vocabulario técnico, formal o dialectal no está documentado.
- Métricas perfectas no verificables: el 100 % en exact match, BLEU-4 y chrF sobre 200 muestras no aclara si hay fuga entre entrenamiento y evaluación; no debe tomarse como garantía de generalización.
- Riesgo de alucinación o salida incorrecta en frases fuera de distribución: al ser un modelo seq2seq pequeño entrenado desde cero, puede producir transliteraciones erróneas o inventar formas léxicas.
- Sin pipeline declarado en Hugging Face: no es compatible directamente con `transformers` ni con las herramientas estándar del ecosistema; requiere el código del repositorio.
- Longitud de contexto desconocida: no se documenta el máximo de tokens de entrada; es previsible que solo maneje frases cortas.
- Idiomas: solo nepalí; no se documenta soporte de inglés ni de otras lenguas.
- Sesgos: no se documentan análisis de sesgo; al derivarse de un corpus infantil, puede reflejar un vocabulario y estilo muy restringidos.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; es un modelo experimental sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rabindra-dahal/romanized-nepali-to-devanagari-transformer
- Dataset de entrenamiento: https://huggingface.co/datasets/rabindra-dahal/english-nepali-romanized-csv-text-for-kid-learning
- Unicode Nepali Converter: https://www.unicodenepali.com/?ui-lang=en
- NepaliType (conversor romanizado a devanagari): https://nepalitype.com/romanized
