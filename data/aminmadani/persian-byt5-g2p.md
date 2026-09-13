# AminMadani/persian-byt5-g2p

## Resumen

persian-byt5-g2p es un modelo de conversión grafema-fonema (G2P, grapheme-to-phoneme) para persa, desarrollado por el usuario AminMadani y publicado en Hugging Face. Se trata de un ajuste fino de google/byt5-small, un transformer encoder-decoder que opera directamente sobre bytes UTF-8, con 299.637.760 parámetros (~300 M) y pesos distribuidos en formato safetensors. Su función es transformar texto persa en una representación fonética separada por espacios (IPA/fonemas) lista para ser consumida por un sintetizador de voz.

El problema que resuelve es concreto: el persa se escribe sin vocales cortas (harakat), de modo que la pronunciación de una palabra no se deduce de forma unívoca a partir de su grafía. El modelo aprende a inferir esas vocales implícitas, la geminación (tashdid), la ezafe y otras convenciones ortográficas históricas a partir del diccionario KaamelDict (~116.600 entradas fonéticas persas), sobre el que declara una pérdida de validación de 0,03755.

Es relevante ahora para quien construye pipelines de síntesis de voz en persa (por ejemplo, Piper TTS), para lexicografía computacional y para reconocimiento automático del habla, porque ofrece un componente ligero que cabe en CPU y en GPU de consumo. Las contrapartidas son que la licencia es GPL-3.0, que solo cubre persa y que no se han publicado métricas de error fonético independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder byte-level (ByT5), sin vocabulario de tokens |
| Parametros totales | 299.637.760 (~300 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el ejemplo de uso de la model card fija `max_length=128` en la generación) |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en FP32; no se documentan versiones cuantizadas) |
| Idiomas soportados | Persa (farsi, `fa`); el tokenizador byte-level acepta cualquier UTF-8, pero el modelo solo está entrenado para persa |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 1,2 GB) |

## Arquitectura y entrenamiento

La base es ByT5 (Xue et al., TACL 2022), una variante de T5 que elimina el tokenizador y procesa la secuencia de bytes UTF-8 directamente. Esto implica que no existe vocabulario ni errores de fuera de vocabulario (OOV): cualquier cadena persa es representable, y el modelo puede aprender patrones morfológicos a nivel de byte (prefijos, sufijos, raíces) sin depender de una segmentación previa. La contrapartida es que las secuencias de bytes son más largas que las de tokens, lo que encarece la inferencia. La tarea se plantea como text2text-generation: entrada ortográfica, salida de fonemas separados por espacios.

El ajuste fino se realizó sobre el diccionario KaamelDict, con un reparto del 95 % para entrenamiento y un 5 % para evaluación. Los hiperparámetros declarados son: precisión FP32 completa (por estabilidad numérica), tamaño de lote de 16 por dispositivo con 2 pasos de acumulación de gradiente (lote efectivo de 32), optimizador AdamW con tasa de aprendizaje 5e-4 y 3 épocas (~10.386 pasos de entrenamiento). La pérdida de validación final reportada es de 0,03755. No se documenta ningún uso de RLHF, DPO ni ajuste por preferencias; es un ajuste supervisado estándar sobre pares grafía-fonemas. El ejemplo de inferencia de la model card emplea búsqueda por haces con `num_beams=2` y parada temprana.

## Capacidades

- Conversión grafema-fonema de persa a una secuencia de fonemas separados por espacios (representación IPA/fonemas).
- Inferencia implícita de vocales cortas no escritas (*harakat*) y de la ezafe.
- Tratamiento de geminación (*tashdid*) y de convenciones ortográficas históricas del persa (el autor cita el ejemplo `خوش` -> `/x o S/`).
- Procesamiento byte-level: sin errores OOV, incluso con préstamos léxicos, nombres propios o cadenas con caracteres poco frecuentes (limitado por la distribución de entrenamiento).
- Aprovechamiento de estructura morfológica (prefijos, sufijos, raíces) al operar sobre bytes.
- Integración como componente dentro de un pipeline de TTS o de ASR mediante `AutoTokenizer` y `AutoModelForSeq2SeqLM`.
- No soporta tool calling ni function calling: no es un modelo de instrucciones ni un LLM conversacional.
- No soporta agentes, razonamiento multi-paso ni modo *thinking*.
- No tiene capacidades de visión, audio ni generación de código.
- Multilingüismo: únicamente persa. No hay soporte declarado para dari, tayiko ni otras variedades.

## Casos de uso

- Síntesis de voz en persa (TTS): el modelo genera la secuencia de fonemas que necesita el front-end de un sintetizador como Piper TTS, sustituyendo reglas manuales de pronunciación y evitando errores en palabras con vocalización ambigua.
- Lexicografía computacional: construcción o ampliación automática de diccionarios de pronunciación persas a partir de listas de palabras o corpus textuales, con revisión humana posterior de los casos dudosos.
- Preprocesado de sistemas ASR: generación de léxicos de pronunciación para el decodificador de un reconocedor de habla persa, donde la cobertura de formas verbales y morfología derivativa es un cuello de botella habitual.
- Enseñanza de persa como lengua extranjera: herramienta que muestra la pronunciación fonética de vocabulario y frases introducidas por el estudiante, útil para practicar la vocalización de palabras que se escriben igual.
- Investigación fonológica y lingüística de corpus: conversión masiva de corpus textuales a representación fonética para estudiar patrones de asimilación, geminación o frecuencia de fonemas en persa.
- Normalización de diccionarios heredados: detección de entradas con transcripciones incoherentes comparando la salida del modelo con la transcripción almacenada, para auditar léxicos existentes.
- Accesibilidad: apoyo a lectores de pantalla y herramientas de lectura asistida en persa, proporcionando una capa de pronunciación previa a la síntesis.
- Datos sintéticos para otros modelos: generación de pares grafía-fonema adicionales para entrenar o evaluar sistemas G2P y modelos de voz en persa.

## Benchmarks y rendimiento

| Modelo | Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|---|
| persian-byt5-g2p | Grapheme-to-Phoneme (text2text-generation) | KaamelDict | Validation loss | 0,03755 | No |

Los datos proceden del `model-index` declarado por el autor del modelo. No se han publicado en la información disponible métricas estándar de G2P como PER (phoneme error rate) o WER sobre fonemas, ni comparaciones con otros sistemas en el mismo conjunto de evaluación.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 1,2 GB (299,6 M de parámetros × 4 bytes), coherente con el tamaño del repositorio.
- En FP16/BF16 la huella se reduce a unos 600 MB; una cuantización a int8 la dejaría en torno a 300 MB.
- Cabe sin problema en cualquier GPU de consumo con 4 GB o más de VRAM (GTX 1650, RTX 3060, RTX 4060, RTX 4090). No requiere A100 ni H100.
- Es viable en CPU para cargas por lotes pequeños, dado el tamaño de ~300 M de parámetros y su uso previsto en pipelines de TTS en tiempo real.
- Despliegue: `transformers` (PyTorch) es la vía documentada. Las etiquetas del repositorio incluyen `text-generation-inference` y `endpoints_compatible`, por lo que TGI/Hugging Face Inference Endpoints aparecen como opciones contempladas por el autor.
- Soporte en vLLM no confirmado en la información disponible. No se publican pesos en GGUF, por lo que su uso en llama.cpp u Ollama no está documentado.
- Latencia y throughput: no disponibles. La arquitectura byte-level implica más pasos de decodificación por palabra que un modelo basado en tokens, lo que penaliza la velocidad frente a alternativas con tokenizador.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Longitud de contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AminMadani/persian-byt5-g2p | 299,6 M | G2P persa a fonemas | No disponible | GPL-3.0 | Hugging Face |
| google/byt5-small (modelo base) | ~300 M | Preentrenamiento byte-to-byte genérico | No disponible | No disponible en la información proporcionada | Hugging Face |
| Enfoques basados en LLM para G2P persa (Qharabagh et al., ICASSP 2025) | No disponible | G2P persa | No disponible | No disponible | Publicación académica |

No se dispone de resultados comparativos numéricos entre estas alternativas en la información proporcionada: el modelo solo declara una pérdida de validación, sin métricas de error fonético que permitan una comparación directa.

## Limitaciones y advertencias

- Cobertura monolingüe: solo persa. No hay soporte documentado para dari, tayiko ni otras variedades, ni para texto mezclado con otros alfabetos.
- Métrica limitada: la única cifra publicada es una pérdida de validación (0,03755) marcada como no verificada (`verified: false`). No hay PER/WER, por lo que no se puede cuantificar la tasa real de fonemas incorrectos.
- Sin validación independiente: el repositorio registra 0 descargas y 0 likes, y los resultados proceden exclusivamente del autor. No hay evaluaciones externas ni demo pública.
- Riesgo de error en elementos fuera de distribución: nombres propios, topónimos, préstamos recientes, siglas, números y abreviaturas pueden producir transcripciones incorrectas o inventadas, un fallo crítico si la salida alimenta directamente un TTS.
- Sesgo de dominio: el comportamiento del modelo refleja la variedad y las convenciones de transcripción del diccionario KaamelDict, de modo que la salida puede no coincidir con otras normas de transcripción fonética ni con la pronunciación de hablantes de variedades no representadas.
- Licencia GPL-3.0: es una licencia copyleft fuerte. Integrar el modelo en un producto propietario puede obligar a liberar el código que lo acompaña; conviene revisar la compatibilidad antes de un uso comercial.
- Longitud de contexto no documentada y, en el ejemplo del autor, generación acotada a 128 tokens, lo que limita el procesamiento de frases largas en una sola pasada.
- Naturaleza no conversacional: no admite instrucciones, tool calling ni razonamiento multi-paso. No debe emplearse como asistente de propósito general.
- Coste de inferencia: al trabajar a nivel de byte, la secuencia de entrada es más larga que con un tokenizador subpalabra, lo que aumenta el tiempo de decodificación respecto a alternativas equivalentes.
- Entradas largas o con ruido (texto sin espacios, transliteraciones latinas, errores tipográficos) pueden degradar la salida sin que el modelo señale incertidumbre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AminMadani/persian-byt5-g2p
- Dataset KaamelDict: https://huggingface.co/datasets/MahtaFetrat/KaamelDict
- Modelo base google/byt5-small: https://huggingface.co/google/byt5-small
- Artículo de referencia del dataset y del benchmark G2P: Qharabagh, M. F., Dehghanian, Z. y Rabiee, H. R., "LLM-Powered Grapheme-to-Phoneme Conversion: Benchmark and Case Study", ICASSP 2025. Sin URL en la información proporcionada.
- Artículo de la arquitectura ByT5: Xue, L. et al., "ByT5: Towards a token-free future with pre-trained byte-to-byte models", TACL, vol. 10, pp. 291-306, 2022. Sin URL en la información proporcionada.
- Búsqueda web: los resultados devueltos corresponden a páginas de soporte de Microsoft y no guardan relación con el modelo, por lo que no aportan enlaces adicionales.
