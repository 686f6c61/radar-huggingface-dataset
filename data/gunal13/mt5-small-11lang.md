# Gunal13/mt5-small-11lang

## Resumen

mT5-small-11lang es un modelo de traducción automática multilingüe desarrollado por el usuario Gunal13, obtenido mediante fine-tuning de google/mt5-small sobre datos limpios de OPUS-100. Cubre 22 direcciones de traducción entre inglés y once idiomas: hindi, maratí, tamil, canarés, malabar, telugu, chino, árabe, ruso, español y afrikáans. El modelo se concibió como motor de traducción para un proyecto de traducción de voz a voz en tiempo real, lo que explica su orientación hacia la latencia baja y el despliegue en hardware modesto.

Arquitectura encoder-decoder de tipo transformer (familia T5) con 300.176.768 parámetros totales, vocabulario de 250.000 tokens y una longitud máxima de secuencia de entrenamiento de 128 tokens. Se entrenó en fp32 sobre una única NVIDIA T4 de Google Colab, en dos etapas: primero inglés-hindi y después el conjunto equilibrado de once idiomas.

Su relevancia radica en que demuestra que un modelo de 300M puede cubrir un abanico amplio de idiomas, incluidos varios de la familia dravídica mal representados en modelos pequeños, con una licencia Apache 2.0 y pesos en safetensors. No obstante, sus métricas son modestas y el ámbito de evaluación es reducido, por lo que debe considerarse un modelo experimental más que una solución de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia T5, mT5) |
| Parametros totales | 300.176.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens de entrenamiento (longitud máxima de secuencia); no se documenta ventana de inferencia superior |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors fp32; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | en, hi, mr, ta, kn, ml, te, zh, ar, ru, es, af (22 direcciones con inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 15,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de google/mt5-small, un transformer encoder-decoder con atención completa estándar, vocabulario SentencePiece de 250.000 tokens y normalización pre-LN. No incorpora innovaciones arquitectónicas propias: el trabajo se centra en la curación del corpus y en el ajuste fino multilingüe. La elección de mT5 frente a T5-small se justifica porque el tokenizador de T5-small no puede representar escrituras índicas (codifica "आप कैसे हो" como tokens `<unk>`), mientras que el de mT5 segmenta en subpalabras reales.

Los datos provienen de OPUS-100 (centrado en inglés) y se sometieron a siete filtros: eliminación de espacios y guiones de subtítulos, descarte de pares con etiquetas de marcado, eliminación de pares sin traducir, verificación de escritura (el lado inglés sin caracteres del alfabeto destino y el lado destino con al menos un 70% de letras en su escritura), límite de 50 palabras inglesas o 400 caracteres destino, descarte de ratios de longitud implausibles y eliminación de duplicados exactos. En inglés-hindi, aproximadamente uno de cada cuatro pares era duplicado y la limpieza conservó el 55% del total. Se equilibró a un máximo de 20.000 pares limpios por idioma; el canarés solo tenía 9.096 pares y se repitió dos veces. El resultado fueron 436.384 ejemplos de entrenamiento en ambas direcciones.

El entrenamiento constó de dos etapas: inglés-hindi con 100.000 pares (200.000 ejemplos) durante una época, con pérdida de validación final de 2,48, y después continuación sobre los once idiomas durante una época, detenida en el paso 13.000 de 13.637 (95%) al terminar la sesión de Colab, con pérdida de validación de 2,716 en ese checkpoint. Se usó Adafactor con learning rate 5e-4, 500 pasos de warmup, decaimiento lineal, batch efectivo de 32 (8 × acumulación de gradiente 4), longitud máxima de 128 tokens y precisión fp32 completa, ya que mT5 es inestable en fp16. El coste fue de unas 2 h 15 min para la etapa 1 y 3 h 45 min para la etapa 2 en una T4.

## Capacidades

- Traducción bidireccional entre inglés y once idiomas (22 direcciones) con un único modelo y prefijos de tarea del tipo `translate English to <Language>: ` y `translate <Language> to English: `.
- Traducción por lotes con padding y `generate` de Hugging Face Transformers.
- Soporte de decodificación con beam search; se recomienda `num_beams=4` y `no_repeat_ngram_size=3` para evitar bucles de repetición.
- Cobertura de escrituras latina, devanagari, tamil, canarés, malabar, telugu, árabe, cirílica y han.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- No dispone de modo thinking ni de capacidades de instrucción general más allá de la traducción.
- El pivote entre dos idiomas no ingleses requiere pasar por inglés de forma explícita.

## Casos de uso

- Motor de traducción en un pipeline de voz a voz en tiempo real: el modelo se concibió para este fin y su tamaño de 300M permite inferencia rápida en GPU modesta, encajando en un flujo ASR → traducción → TTS con latencia baja.
- Traducción de subtítulos de vídeo: OPUS-100 está dominado por subtítulos, por lo que el modelo rinde mejor en este dominio que en texto conversacional; se usaría con segmentación previa en frases cortas por el límite de 128 tokens.
- Localización de cadenas de interfaz de usuario: el corpus incluye cadenas de UI de software, lo que hace al modelo adecuado para traducir textos cortos y etiquetas entre inglés y los once idiomas.
- Traducción de documentación técnica hacia inglés: dado que la dirección X→EN es la más fuerte (chrF medio de 36,0 frente a 28,3 en EN→X), es útil para que equipos no anglófonos redacten en inglés y luego revisen.
- Preprocesamiento multilingüe en investigación: serviría como baseline ligero y reproducible (Apache 2.0, entrenamiento documentado) para estudios de limpieza de corpus o de equilibrio entre idiomas.
- Traducción de textos religiosos o de dominio público: el sesgo del corpus hacia textos religiosos hace que este sea el dominio donde el modelo tiene más cobertura léxica.
- Prototipado rápido en entornos con poca VRAM: al ser un modelo de 300M, se puede ejecutar en una GPU de consumo o incluso en CPU para pruebas de concepto.

## Benchmarks y rendimiento

Evaluación sobre los conjuntos de test oficiales de OPUS-100 (primeras 500 frases por idioma, ambas direcciones), beam search de 4 haces con `no_repeat_ngram_size=3`, sacreBLEU con tokenizador `zh` para chino.

| Idioma | EN→X chrF | X→EN chrF | EN→X BLEU | X→EN BLEU |
|---|---|---|---|---|
| Español | 39,9 | 44,5 | 15,7 | 20,5 |
| Afrikáans | 34,8 | 43,6 | 18,3 | 26,4 |
| Maratí | 30,1 | 41,8 | 11,1 | 23,0 |
| Canarés | 28,2 | 38,5 | 12,9 | 18,0 |
| Ruso | 29,3 | 38,4 | 10,4 | 16,4 |
| Chino | 16,8 | 37,5 | 15,9 | 13,1 |
| Árabe | 24,3 | 33,5 | 3,8 | 12,0 |
| Hindi | 27,0 | 32,4 | 10,0 | 12,5 |
| Telugu | 27,8 | 32,2 | 12,4 | 16,6 |
| Tamil | 29,5 | 28,6 | 6,1 | 10,9 |
| Malabar | 23,1 | 25,2 | 1,4 | 8,3 |
| **Media** | **28,3** | **36,0** | no disponible | no disponible |

Observaciones del autor: la traducción hacia inglés es superior en 10 de 11 idiomas; los idiomas más cercanos al inglés (español, afrikáans) obtienen las mejores puntuaciones; el malabar es el peor pese a tener datos abundantes, probablemente por su morfología aglutinante; los conjuntos de test de OPUS-100 contienen referencias ruidosas que penalizan a cualquier modelo. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,2 GB solo para pesos (300M × 4 bytes), más activaciones y caché; en la práctica, entre 2 y 4 GB según el tamaño de lote y la longitud de secuencia.
- En fp16 o bf16 los pesos ocuparían unos 600 MB, aunque el autor advierte de que mT5 es inestable en fp16; bf16 es preferible si el hardware lo soporta.
- GPU recomendadas: NVIDIA T4 (la usada en entrenamiento), RTX 3060/4060, RTX 4090, A100 o H100 para alto throughput. Cabe holgadamente en cualquier GPU de consumo con 4 GB o más.
- Ejecución en CPU viable para pruebas de concepto y volúmenes bajos, con latencia mayor.
- Opciones de despliegue: Hugging Face Transformers con `AutoModelForSeq2SeqLM`, vLLM (soporte de encoder-decoder limitado, verificar versión), TGI, o exportación a ONNX. No se documentan pesos GGUF ni integración con llama.cpp u Ollama.
- Latencia y throughput: no se han publicado mediciones en la información disponible. El entrenamiento completo en una T4 sugiere que la inferencia por frase es del orden de decenas de milisegundos, pero es una estimación, no un dato medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Gunal13/mt5-small-11lang | 300M | 128 tokens | 11 + inglés | Apache 2.0 | safetensors |
| google/mt5-small (base) | 300M | 512 tokens (típico en mT5) | ~101 | Apache 2.0 | safetensors |
| Helsinki-NLP/opus-mt-* (pares individuales) | ~70-80M por par | ~512 tokens | un par por modelo | CC-BY 4.0 (varía) | safetensors |
| NLLB-200-distilled-600M | 600M | 512 tokens | 200 | CC-BY-NC 4.0 | safetensors |

Frente a mT5-small base, este modelo está especializado en traducción y cubre once idiomas con un solo checkpoint, a costa de un contexto de entrenamiento mucho menor (128 frente a los 512 típicos de mT5). Frente a los modelos OPUS-MT de Helsinki-NLP, ofrece un único modelo para 22 direcciones en lugar de un checkpoint por par, con licencia Apache 2.0 más permisiva que la CC-BY 4.0 habitual. Frente a NLLB-200-distilled-600M, tiene la mitad de parámetros y licencia comercialmente permisiva, pero cubre muchos menos idiomas y no se han publicado comparaciones directas de calidad. No hay datos de benchmarks cruzados en la información disponible.

## Limitaciones y advertencias

- Dominio restringido: OPUS-100 está dominado por textos religiosos, subtítulos de películas y cadenas de interfaz; el lenguaje conversacional cotidiano está peor cubierto.
- Copia superficial: cuando duda, el modelo deja palabras en inglés sin traducir (por ejemplo, "Я hungry").
- Errores léxicos: palabras comunes se traducen mal en ocasiones (el hindi "मुझे भूख लगी है" / "I am hungry" se rinde como "I'm sick") y las palabras raras y nombres propios pueden desaparecer.
- Degradación en frases largas: la calidad cae con entradas extensas, coherente con el límite de 128 tokens de entrenamiento.
- Solo pares con inglés: la traducción entre dos idiomas no ingleses exige pivotar por inglés, con la pérdida de calidad acumulada que ello implica.
- Evaluación limitada: las puntuaciones provienen de subconjuntos de 500 frases de conjuntos de test ruidosos y deben leerse como aproximadas.
- Entrenamiento incompleto: la segunda etapa se detuvo al 95% de la época por el fin de la sesión de Colab.
- Sin datos de sesgo publicados: no se documenta ninguna evaluación de sesgos demográficos o culturales.
- Riesgo de alucinación en traducción: el modelo puede generar contenido no presente en el original, especialmente en frases largas o ambiguas.
- No apto para usos de alto riesgo (médico, legal, traducción crítica para la seguridad), según el propio autor.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones de los datos de OPUS-100 subyacentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gunal13/mt5-small-11lang
- Modelo base: https://huggingface.co/google/mt5-small
- Modelo de la etapa 1 (inglés-hindi): https://huggingface.co/Gunal13/mt5-small-en-hi
- Dataset OPUS-100: https://huggingface.co/datasets/Helsinki-NLP/opus-100
