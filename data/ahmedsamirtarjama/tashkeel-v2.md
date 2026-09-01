# ahmedsamirtarjama/Tashkeel-v2

## Resumen

Tashkeel-v2 es un modelo de diacritización automática del árabe (tashkeel) desarrollado por ahmedsamirtarjama. Se trata de un etiquetador de secuencias a nivel de carácter, no de un modelo generativo, que restaura las vocales cortas y signos ortográficos ausentes en el texto árabe sin vocalizar. El modelo se basa en el backbone MARBERTv2 de UBC-NLP, con una arquitectura de 12 capas transformer, una capa bidireccional LSTM y dos cabezas de salida multi-tarea. Con 171,57 millones de parámetros totalmente entrenables, está diseñado para producir diacritización morfológicamente precisa, incluyendo las terminaciones de caso (i'rab), con una tasa de alucinación nula por construcción.

El modelo se entrenó sobre un corpus curado y deduplicado de 5.006.013 frases en árabe clásico y moderno, procedentes de Sadeed, Shamela, Ashaar y el Corán, y se ajustó finamente sobre el dataset Sadeed_Tashkeela. En el benchmark SadeedDiac-25 alcanza una tasa de error de diacríticos total (DER) del 2,85 % y una tasa de alucinación del 0,00 %, superando en estas métricas a modelos generativos de gran tamaño como GPT-4 o Gemini-Flash-2.0, con una velocidad de inferencia de aproximadamente 898 frases por segundo en una sola GPU. Su relevancia actual radica en ofrecer una alternativa ligera, rápida y sin alucinaciones para tareas de procesamiento de árabe en producción, donde los modelos generativos suelen fallar por inconsistencia de longitud o pérdida de caracteres.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Etiquetador de secuencias a nivel de carácter basado en MARBERTv2 (12 capas transformer, 768-d hidden) + LSTM bidireccional de 2 capas + doble cabeza multi-tarea |
| Parametros totales | 171.573.406 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 / float32 (pesos en safetensors) |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Tashkeel-v2 es un modelo de etiquetado de secuencias a nivel de carácter, no un modelo de lenguaje generativo. Cada carácter del texto de entrada se clasifica en una de 15 clases de diacríticos (ninguno, fatha, damma, kasra, sukun, tanwin fath/damm/kasr, shadda y combinaciones de shadda con vocales). La arquitectura combina el backbone MARBERTv2 (12 capas transformer con 768 dimensiones ocultas y vocabulario de 100k) con una capa LSTM bidireccional de 2 capas y dos cabezas de salida: una para la morfología de la raíz y otra para las terminaciones de caso (i'rab), ponderada con un factor de 3,0 sobre los finales de raíz y límites de palabra. Esta doble cabeza multi-tarea proporciona una señal de gradiente fuerte para resolver la asignación de caso gramatical a larga distancia.

El entrenamiento se realizó en dos fases: primero, un preentrenamiento sobre 5.006.013 frases únicas deduplicadas por hash, procedentes de los datasets Sadeed, Shamela, Ashaar y Quran, con cero contaminación con el conjunto de evaluación; después, un ajuste fino sobre Misraj/Sadeed_Tashkeela. El modelo incorpora un motor de segmentación morfológica y de clíticos que descompone las palabras árabes en proclíticos (p. ej. فـ, بـ, الـ), raíz y enclíticos (p. ej. ـهم, ـها), marcando explícitamente el final morfológico real donde corresponden las vocales de i'rab. Esta segmentación es clave para evitar alucinaciones: los caracteres de entrada, números y puntuación son inmutables al 100 %, ya que el modelo solo añade diacríticos sin modificar la secuencia original.

## Capacidades

- Diacritización completa del árabe: restaura todas las vocales cortas, tanwin, shadda y signos de sukún en texto árabe sin vocalizar.
- Manejo de terminaciones de caso (i'rab): la cabeza específica para i'rab, ponderada 3,0 veces, resuelve la asignación de caso gramatical en finales de palabra.
- Segmentación morfológica y de clíticos: descompone palabras en proclíticos, raíz y enclíticos, lo que mejora la precisión en la colocación de diacríticos.
- Cero alucinaciones por diseño: al ser un etiquetador de secuencias a nivel de carácter, no genera ni elimina caracteres; los números, corchetes y puntuación se conservan intactos.
- Procesamiento por lotes: soporta diacritización de múltiples frases simultáneamente.
- Compatible con el ecosistema transformers: se integra con AutoTokenizer y safetensors, y se puede cargar mediante el script modeling_tashkeel.py incluido en el repositorio.
- No es un modelo generativo: no genera texto libre, solo anota el texto de entrada con diacríticos.

## Casos de uso

- Preparación de corpus para síntesis de voz (TTS): el texto árabe sin vocalizar es ambiguo para los sistemas de síntesis; Tashkeel-v2 proporciona la vocalización necesaria para que un motor TTS genere una pronunciación correcta, con una velocidad de ~898 frases/s que permite procesar grandes volúmenes de texto.
- Mejora de la legibilidad en interfaces de usuario: aplicaciones de lectura, libros electrónicos o páginas web pueden diacritizar automáticamente el texto árabe para facilitar la lectura a estudiantes o hablantes no nativos.
- Preprocesamiento para análisis morfológico y semántico: la diacritización es un paso previo habitual en tareas de NLP árabe como el etiquetado de partes de la oración, el análisis de dependencias o la desambiguación léxica; Tashkeel-v2 ofrece una anotación fiable sin alterar la secuencia original.
- Normalización de textos religiosos y literarios: el modelo se entrenó con corpus del Corán, hadices, poesía y prosa clásica, por lo que es adecuado para vocalizar textos religiosos y literarios con precisión morfológica.
- Sistemas de corrección ortográfica y de vocalización en editores de texto: integrable como herramienta de post-edición para añadir diacríticos a documentos árabes, manteniendo intactos los caracteres originales.
- Evaluación y comparación de modelos de diacritización: al ser un modelo de referencia con métricas publicadas en SadeedDiac-25, puede usarse como baseline en investigaciones sobre diacritización del árabe.

## Benchmarks y rendimiento

Los siguientes resultados están declarados por el autor del modelo en la model card y se refieren al benchmark SadeedDiac-25 (1.200 frases). No se han verificado de forma independiente.

| Modelo / Sistema | Total evaluadas | Tasa de alucinación | Total DER (CE) | Morph DER (sin CE) | Total WER (CE) | Morph WER (sin CE) | Velocidad |
|---|---|---|---|---|---|---|---|
| Claude-3.7-Sonnet | 1.190 / 1.200 | 0,82 % | 1,39 % | 0,77 % | 4,67 % | 2,31 % | ~5 frases/s |
| gemma-4-31B-it | 136 / 1.200* | 88,67 %* | 1,53 %* | 0,77 %* | 5,33 %* | 2,58 %* | ~8 frases/s |
| **Tashkeel-v2 (este modelo)** | **1.200 / 1.200** | **0,00 %** | **2,85 %** | **2,13 %** | **8,02 %** | **5,66 %** | **~898 frases/s** |
| Tashkeel-50M (v1) | 12 / 1.200* | ~99,0 %* | 3,08 %* | 2,26 %* | 9,56 %* | 6,77 %* | ~25 frases/s |
| Gemini-Flash-2.0 | 1.186 / 1.200 | 1,17 % | 3,19 % | 2,38 % | 7,99 % | 5,50 % | ~20 frases/s |
| GPT-4 | 1.188 / 1.200 | 1,02 % | 3,86 % | 3,86 % | 5,27 % | 10,93 % | ~10 frases/s |
| Sadeed (artículo publicado) | 1.114 / 1.200 | 7,19 % | 7,29 % | 5,26 % | 13,74 % | 9,92 % | ~35 frases/s |
| tash2 (baseline 50M) | 1.199 / 1.200 | 0,08 % | 15,29 % | 11,41 % | 24,36 % | 20,40 % | ~25 frases/s |

*Los modelos marcados con asterisco se evaluaron solo sobre el subconjunto de salidas con longitud coincidente.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 171,57 millones de parámetros en precisión bfloat16, el uso de memoria es de aproximadamente 350-400 MB para los pesos, más la memoria de activaciones. Cabe en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB o superior, RTX 3060, RTX 4090) es suficiente. También funciona en CPU, aunque con menor rendimiento.
- Compatibilidad con GPU consumer: sí, es un modelo ligero que se puede ejecutar en tarjetas gráficas de gama media e incluso en entornos sin GPU.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con Hugging Face Inference Endpoints, o integrarse en pipelines de Python. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: el autor declara una velocidad de ~898 frases por segundo en una sola GPU, lo que lo hace adecuado para procesamiento en tiempo real o por lotes de gran volumen.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Total DER (CE) en SadeedDiac-25 | Tasa de alucinación | Licencia |
|---|---|---|---|---|---|
| **Tashkeel-v2** | 171,57 M | Etiquetador de caracteres (MARBERTv2 + LSTM + doble cabeza) | 2,85 % | 0,00 % | Apache-2.0 |
| Tashkeel-50M (v1) | ~50 M | LM causal pequeño | 3,08 %* | ~99,0 %* | no disponible |
| Sadeed (artículo) | no disponible | no disponible | 7,29 % | 7,19 % | no disponible |
| tash2 (baseline 50M) | ~50 M | no disponible | 15,29 % | 0,08 % | no disponible |

*Resultados sobre el subconjunto de salidas con longitud coincidente (12 de 1.200 frases).

Tashkeel-v2 se diferencia de los modelos generativos (GPT-4, Gemini, Claude) en que no produce texto nuevo, sino que anota el texto existente, lo que elimina el riesgo de alucinaciones por construcción. Frente a otros modelos de diacritización como Sadeed o tash2, ofrece una tasa de error significativamente menor y una velocidad de inferencia muy superior.

## Limitaciones y advertencias

- Solo soporta árabe: el modelo está entrenado exclusivamente para diacritización del árabe; no es aplicable a otros idiomas.
- No es un modelo generativo: no puede generar texto, responder preguntas ni realizar tareas de lenguaje natural más allá de la diacritización.
- Longitud de contexto no documentada: no se especifica la longitud máxima de entrada; al estar basado en MARBERTv2, es probable que herede un límite de 512 tokens, pero este dato no está confirmado.
- Dependencia del backbone MARBERTv2: el rendimiento está condicionado por las limitaciones del modelo base, especialmente en dominios muy especializados o jerga moderna.
- Resultados de benchmark no verificados de forma independiente: las métricas de SadeedDiac-25 son declaradas por el autor y no han sido auditadas por terceros.
- Uso comercial permitido: la licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las licencias de los datasets de entrenamiento (Sadeed, Shamela, Ashaar, Quran) para asegurar el cumplimiento en productos comerciales.
- Riesgo de errores en textos muy coloquiales o dialectales: el modelo se entrenó principalmente con árabe clásico y moderno estándar; los dialectos pueden producir resultados subóptimos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedsamirtarjama/Tashkeel-v2
- Modelo anterior Tashkeel-50M: https://huggingface.co/ahmedsamirtarjama/Tashkeel-50M
- Dataset Sadeed_Tashkeela: https://huggingface.co/datasets/Misraj/Sadeed_Tashkeela
- Dataset SadeedDiac-25: https://huggingface.co/datasets/Misraj/SadeedDiac-25
- Dataset Shamela diacritizado: https://huggingface.co/datasets/ReligiousLLMs/shamela_all_diacritized_fully
- Dataset Ashaar tashkeel: https://huggingface.co/datasets/mysamai/ashaar-tashkeel
- Dataset Quran con shakl: https://huggingface.co/datasets/ReligiousLLMs/quran_ayats_with_shakl
- Backbone MARBERTv2: https://huggingface.co/UBC-NLP/MARBERTv2
