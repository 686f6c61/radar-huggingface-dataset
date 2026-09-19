# ahmedsamirtarjama/Tashkeel-v3

## Resumen

Tashkeel-v3 es un modelo de diacritización (tashkeel) de árabe desarrollado por Ahmed Samir (usuario de HuggingFace `ahmedsamirtarjama`). Su tarea es la clasificación de tokens a nivel de carácter: recibe texto árabe sin vocales y devuelve el mismo texto con las harakat (fatha, damma, kasra, sukun, shadda, tanwin, etc.) insertadas correctamente. No es un modelo generativo, sino un etiquetador secuencial especializado.

Técnicamente combina un encoder transformer MARBERTv2 compartido con embeddings de morfema y posición, una capa BiLSTM bidireccional de 384 unidades por dirección, dos cabezas desacopladas (diacríticos internos de la raíz frente a terminaciones de caso o *i'rab*) y una capa final de Conditional Random Field lineal con matriz de transición de 15x15 y decodificación Viterbi global. El modelo suma 171.573.661 parámetros y se distribuye bajo licencia Apache-2.0 con pesos en safetensors y código personalizado (`custom_code`).

Su relevancia radica en dos cifras: el autor reporta 2,85 % DER / 7,91 % WER en el benchmark `Misraj/SadeedDiac-25` y 6,37 % DER / 17,39 % WER en el corpus fuera de dominio `Bisher/CATT_benchmark`, con una tasa de alucinación declarada del 0,00 % (preservación exacta de consonantes, dígitos y puntuación) y velocidades de 1.164 a 1.523 frases por segundo en una única GPU NVIDIA. Frente a LLMs generativos como GPT-4, Claude-3.7-Sonnet o Gemini-Flash-2.0, la ventaja declarada no es solo de precisión sino de coste computacional y de no alterar el texto de entrada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer MARBERTv2 + BiLSTM (384x2) + dos cabezas desacopladas (stem / i'rab) + CRF lineal con decodificación Viterbi |
| Parámetros totales | 171.573.661 (~171,6 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Árabe (`ar`): árabe estándar moderno, árabe clásico/coránico y discurso periodístico |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch), requiere `trust_remote_code=True` |
| Pipeline | token-classification |
| Tamaño del repositorio | 1,4 GB |
| Fecha de creación | 2026-09-18 |
| Última actualización | 2026-09-18 |

## Arquitectura y entrenamiento

El modelo se organiza en cuatro bloques. Primero, un encoder MARBERTv2 compartido que produce representaciones contextuales a nivel de subpalabra; en paralelo se inyectan embeddings de morfema y de posición. Segundo, una BiLSTM de 384 unidades por dirección que modela dependencias secuenciales sobre las representaciones del encoder. Tercero, dos cabezas de clasificación separadas: una para los diacríticos internos del lexema y otra para las terminaciones sintácticas de caso (*i'rab*), lo que separa la morfología derivacional de la flexiva. Cuarto, una capa CRF de cadena lineal con una matriz de transición de 15x15 que penaliza transiciones fonológicamente ilegales (tanwin consecutivo, geminaciones impropias, vocales de frontera no permitidas) y decodifica con Viterbi global sobre toda la frase, en lugar de decidir etiqueta a etiqueta.

Los datos concretos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. El autor sí menciona segmentación a nivel de carácter con proyección sub-token y embeddings de segmentación proclítico/raíz/enclítico para desambiguar clíticos, lo que sugiere un preprocesado morfológico explícito. Otra innovación declarada es la garantía de preservación exacta de la entrada: el modelo no puede eliminar ni duplicar caracteres porque la tarea es de etiquetado alineado, no de generación libre.

## Capacidades

- Diacritización completa de texto árabe: inserción de harakat a nivel de carácter sobre texto sin vocalizar.
- Distinción entre diacríticos internos del lexema y terminaciones de caso (*i'rab*), gracias a las cabezas desacopladas.
- Resolución de ambigüedad de clíticos y morfemas mediante embeddings de segmentación proclítico/raíz/enclítico.
- Aplicación de restricciones fonotácticas globales mediante la matriz de transición CRF y decodificación Viterbi.
- Preservación exacta de consonantes, dígitos y signos de puntuación: la model card declara 0,00 % de alucinación y cero tokens perdidos o repeticiones desbocadas.
- Inferencia por lotes (*batching*), con `batch_size` configurable (el ejemplo usa 64).
- Cobertura de registros: árabe estándar moderno, árabe clásico/coránico y discurso periodístico, según los ejemplos de la model card.
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento: es un etiquetador de tokens, no un modelo de propósito general.

## Casos de uso

- Vocalización de corpus para TTS en árabe: los sistemas de síntesis de voz necesitan las harakat para pronunciar correctamente; Tashkeel-v3 puede vocalizar lotes de frases a más de 1.000 frases por segundo, suficiente para procesar corpus completos sin cuello de botella.
- Preprocesado para pipelines de NLP árabe: la diacritización reduce la ambigüedad morfológica y mejora el rendimiento de analizadores sintácticos, lematizadores y sistemas de traducción automática que se entrenan sobre texto vocalizado.
- Preparación de textos religiosos y clásicos: el modelo declara buen rendimiento en árabe coránico y clásico (la model card incluye un ejemplo del Corán), útil para editar o verificar vocalización en publicaciones digitales.
- Corrección y normalización de transcripciones periodísticas: el corpus CATT corresponde a discurso de noticias; el modelo puede vocalizar titulares y cuerpos de noticia para archivos de medios o para subtitulado.
- Enseñanza del árabe y materiales didácticos: generación automática de textos vocalizados para estudiantes, actividad costosa y propensa a errores cuando se hace manualmente.
- Anotación asistida de datasets: uso del modelo como preanotador de harakat en corpus que después revisa un lingüista, reduciendo el coste de anotación manual a nivel de carácter.
- Investigación en morfología árabe: las dos cabezas separadas permiten analizar por separado los errores en diacríticos internos y en terminaciones de caso, útil para estudiar fenómenos de *i'rab* en distintos registros.
- Búsqueda y recuperación de información: normalizar el texto a una forma vocalizada puede mejorar la coincidencia en sistemas de búsqueda sobre corpus árabes heterogéneos.

## Benchmarks y rendimiento

Resultados reportados por el autor en `Misraj/SadeedDiac-25` (1.200 frases). DER y WER son métricas de error: cuanto más bajo, mejor. CE indica que se contabilizan los errores de diacritización de la propia frase, no solo del subconjunto correcto.

| Modelo / sistema | Frases evaluadas | Alucinación | DER total (CE) | DER morfológico | WER total (CE) | WER morfológico | Velocidad |
|---|---|---|---|---|---|---|---|
| Claude-3.7-Sonnet | 1.190 / 1.200 | 0,82 % | 1,39 % | 0,77 % | 4,67 % | 2,31 % | ~5 frases/s |
| Tashkeel-v3 | 1.200 / 1.200 | 0,00 % | 2,85 % | 2,13 % | 7,91 % | 5,54 % | ~1.164 frases/s |
| Tashkeel-v2 | 1.200 / 1.200 | 0,00 % | 2,85 % | 2,13 % | 8,02 % | 5,66 % | ~898 frases/s |
| Gemini-Flash-2.0 | 1.186 / 1.200 | 1,17 % | 3,19 % | 2,38 % | 7,99 % | 5,50 % | ~20 frases/s |
| Tashkeel-50M (v1) | 12 / 1.200 | ~99,0 % | 3,08 % | 2,26 % | 9,56 % | 6,77 % | ~25 frases/s |
| GPT-4 | 1.188 / 1.200 | 1,02 % | 3,86 % | 3,86 % | 5,27 % | 10,93 % | ~10 frases/s |
| Sadeed (paper) | 1.114 / 1.200 | 7,19 % | 7,29 % | 5,26 % | 13,74 % | 9,92 % | ~35 frases/s |
| tash2 (50M) | 1.199 / 1.200 | 0,08 % | 15,29 % | 11,41 % | 24,36 % | 20,40 % | ~25 frases/s |

Resultados fuera de dominio en `Bisher/CATT_benchmark` (742 frases):

| Modelo / sistema | Frases evaluadas | Alucinación | DER total (CE) | DER morfológico | WER total (CE) | WER morfológico | Velocidad |
|---|---|---|---|---|---|---|---|
| Tashkeel-v3 | 742 / 742 | 0,00 % | 6,37 % | 5,33 % | 17,39 % | 14,84 % | ~1.523 frases/s |
| Tashkeel-v2 | 742 / 742 | 0,00 % | 6,41 % | 5,35 % | 17,66 % | 15,01 % | ~1.470 frases/s |

Advertencia: todas estas cifras proceden de la model card del autor y no se han verificado de forma independiente. Las puntuaciones de los LLM causales se calcularon únicamente sobre el subconjunto de generaciones sin alucinación, según la propia nota metodológica de la model card, lo que limita la comparabilidad directa. No se especifica el modelo de GPU empleado para medir las velocidades.

## Requisitos de hardware

- Al tratarse de un modelo de ~171,6 M de parámetros, la inferencia es muy ligera. Estimación orientativa (no publicada por el autor): en FP32 los pesos ocupan aproximadamente 0,7 GB de VRAM; en FP16/BF16, unos 0,35 GB. Añadiendo activaciones y estados del CRF/Viterbi, un presupuesto de 1 a 2 GB de VRAM es suficiente para lotes moderados.
- Cabe con holgura en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs con 4-6 GB de VRAM. También puede ejecutarse en CPU, aunque con menor throughput.
- GPUs de datacenter (A100, H100, L40S) resultan útiles únicamente para servir lotes muy grandes en paralelo o para maximizar el throughput por segundo.
- El flujo de despliegue documentado por el autor es PyTorch + `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`, más la librería `pyarabic` para el pre/postprocesado. Requiere `torch`, `transformers` y `pyarabic`.
- Despliegue con vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada. Son servidores orientados a modelos generativos, y este es un modelo de token-classification con código personalizado y decodificación Viterbi, por lo que la ruta natural es servir el modelo con `transformers` detrás de un servidor propio (por ejemplo FastAPI).
- Latencia y throughput: según el autor, ~1.164 frases/s en `SadeedDiac-25` y ~1.523 frases/s en `CATT` en una sola GPU NVIDIA, con lotes de hasta 64 frases. El autor no indica qué GPU se usó.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Enfoque | DER (SadeedDiac-25) | Alucinación | Licencia |
|---|---|---|---|---|---|---|
| Tashkeel-v3 | Etiquetador (MARBERTv2 + BiLSTM + CRF) | 171,6 M | Diacritización supervisada a nivel de carácter | 2,85 % | 0,00 % | Apache-2.0 |
| Tashkeel-v2 | Etiquetador (predecesor) | No disponible | Diacritización supervisada | 2,85 % | 0,00 % | No disponible |
| Sadeed (paper) | Sistema publicado | No disponible | Diacritización con dataset propio | 7,29 % | 7,19 % | No disponible |
| tash2 (50M) | Etiquetador pequeño | ~50 M | Diacritización ligera | 15,29 % | 0,08 % | No disponible |
| GPT-4 / Claude-3.7-Sonnet / Gemini-Flash-2.0 | LLM generativo generalista | No disponible | Prompting en lenguaje natural | 3,86 % / 1,39 % / 3,19 % | 1,02 % / 0,82 % / 1,17 % | Propietarias |

La comparación con LLM generativos es asimétrica: Claude-3.7-Sonnet obtiene mejor DER cuando acierta, pero falla o alucina en torno al 1 % de las frases y es entre dos y tres órdenes de magnitud más lento (~5 frases/s frente a ~1.164 frases/s). Tashkeel-v3 y su predecesor v2 empatan en DER en el benchmark en dominio y solo se diferencian ligeramente en WER y en velocidad.

## Limitaciones y advertencias

- Modelo monolingüe: solo procesa árabe. No soporta ningún otro idioma.
- Alcance restringido a diacritización: no genera texto libre, no responde preguntas, no hace tool calling ni razonamiento multi-paso. Usarlo fuera de su tarea producirá resultados sin sentido.
- Longitud de contexto no documentada: se desconoce el máximo de tokens por frase o documento. Las velocidades reportadas son por frase, no por documento largo.
- Caída de rendimiento fuera de dominio: el DER sube de 2,85 % en `SadeedDiac-25` a 6,37 % en `CATT` (discurso periodístico), y el WER de 7,91 % a 17,39 %. En registros alejados del entrenamiento (dialectos, redes sociales, texto técnico) el error podría ser mayor.
- Cifras autodeclaradas: los benchmarks y la tasa de alucinación del 0,00 % provienen de la model card del autor; no consta verificación independiente ni publicación revisada por pares.
- Comparabilidad limitada: los LLM se evaluaron solo sobre generaciones no alucinadas, de modo que sus métricas de error están sesgadas a la baja.
- Código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor. Conviene auditar ese código antes de usarlo en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta y fecha de creación declarada en 2026-09-18: tracción y mantenimiento comunitario desconocidos.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright y la licencia, y se documenten los cambios. No incluye garantías.
- Riesgo de sesgo: no se han publicado análisis de sesgo. En diacritización, el sesgo se manifestaría como un peor rendimiento sistemático en variedades dialectales o en textos con préstamos y nombres propios.
- Riesgo de alucinación: estructuralmente bajo, porque la tarea es de etiquetado alineado con la entrada y preserva cada carácter; el modo de fallo esperable es una haraka incorrecta o ausente, no texto inventado ni tokens perdidos.
- En el ejemplo de código de la model card aparece `.cuda()`, que fallará si no hay GPU disponible o si se ejecuta en un entorno sin CUDA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahmedsamirtarjama/Tashkeel-v3
- Benchmark `Misraj/SadeedDiac-25`: https://huggingface.co/datasets/Misraj/SadeedDiac-25
- Benchmark `Bisher/CATT_benchmark`: https://huggingface.co/datasets/Bisher/CATT_benchmark
- Cita del autor (BibTeX, entrada incompleta en la model card): Ahmed Samir, "Tashkeel-v3: SOTA Arabic Diacritization with Morpheme-Aware MARBERT and Linear-Chain CRF", 2026.
- Paper, repositorio de código, demo o blog adicionales: no disponible. La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo; los enlaces obtenidos trataban sobre el Día Mundial de las Abejas y no guardan relación con esta ficha.
