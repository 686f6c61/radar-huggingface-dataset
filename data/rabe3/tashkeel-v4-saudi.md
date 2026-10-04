# Rabe3/Tashkeel-v4-Saudi

## Resumen

Tashkeel-v4-Saudi es un modelo de diacritización (tashkeel) en árabe especializado en dialecto saudí, desarrollado por el usuario Rabe3 como ajuste fino de ahmedsamirtarjama/Tashkeel-v4. Su función es exclusivamente una: recibir texto árabe sin vocales y devolver ese mismo texto con las marcas diacríticas colocadas, sin añadir, eliminar ni modificar letras, dígitos o puntuación. Con 171.573.661 parámetros, se implementa como un etiquetador a nivel de carácter (pipeline `token-classification`) y está pensado como entrada limpia para sistemas de texto-a-voz (TTS) que deben leer transcripciones de habla real saudí, no árabe estándar formal.

El problema que resuelve es concreto: los transcriptores de pódcast y YouTube en dialecto saudí generan texto sin vocales, y un TTS que recibe ese texto pronuncia mal. Los modelos de diacritización clásicos aplican las convenciones del árabe estándar moderno (terminaciones formales, caso, modo), que no corresponden al habla dialectal. Este modelo se ha ajustado sobre unas 367.000 muestras de transcripciones de habla saudí, de siete fuentes distintas, para reproducir las convenciones de etiquetado de esos corpus de voz.

Es relevante ahora porque reduce el error de diacritización sobre letras marcadas no finales del 17,59 % del modelo base al 6,98 % en el conjunto de test, y del 28,14 % al 5,51 % si se consideran todas las letras supervisadas, incluida la posición final de palabra. Su limitación principal es la licencia: solo permite investigación y educación no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder MARBERTv2 (transformer tipo BERT) + BiLSTM + capa CRF, etiquetado a nivel de caracter |
| Parametros totales | 171.573.661 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; el repo contiene pesos en safetensors) |
| Idiomas soportados | arabe (ar), con foco en dialecto arabe saudí |
| Licencia | tashkeel-research-only (licencia "other", heredada de Tashkeel-v4); solo investigacion y educacion no comercial |
| Formato de pesos | safetensors, con codigo personalizado (`trust_remote_code=True` requerido) |
| Modelo base | ahmedsamirtarjama/Tashkeel-v4 |
| Pipeline | token-classification |
| Dataset de ajuste | Rabe3/saudi-tashkeel-splits |
| Tamano del repositorio | 0,7 GB |
| Tarea | Diacritizacion de texto arabe (no genera texto nuevo) |

## Arquitectura y entrenamiento

La arquitectura es un etiquetador secuencial híbrido: un encoder transformer MARBERTv2 (preentrenado en árabe) que produce representaciones contextuales a nivel de carácter, una BiLSTM que modela dependencias entre caracteres vecinos y una capa CRF que decodifica la secuencia de etiquetas de diacritización de forma globalmente coherente. El modelo incluye un método `diacritize()` expuesto mediante código personalizado, y acepta tanto una cadena única como listas de frases con `batch_size` configurable. Al ser un etiquetador de caracteres, la longitud y el contenido léxico de la entrada se preservan siempre.

El ajuste fino usó el dataset Rabe3/saudi-tashkeel-splits, con 366.878 segmentos de entrenamiento, 19.783 de validación y 22.381 de test, procedentes de siete fuentes de habla saudí y divididos por episodio mediante un hash SHA-256 fijo, de modo que ningún episodio de test aparece en entrenamiento. Las etiquetas siguen reglas explícitas: una palabra sin ninguna marca se trata como desconocida y se marginaliza; las letras sin marca dentro de una palabra parcialmente marcada cuentan como "sin marca"; los caracteres no alfabéticos se etiquetan como "sin marca"; y las combinaciones de marcas no representables se tratan como desconocidas. La función de pérdida combina una log-verosimilitud negativa de CRF sobre todas las rutas compatibles con las etiquetas conocidas más 0,5 veces la entropía cruzada por token sobre las emisiones. Se optimizó con AdamW (2e-5 para el encoder MARBERTv2, 1e-4 para BiLSTM, cabezas y CRF), 1.000 pasos de calentamiento y decaimiento lineal, lote de 64, 3 épocas (17.199 pasos) y semilla 42, con el encoder en autocast bf16. El entrenamiento completo llevó 27 minutos en una RTX 5880 Ada con un pico de memoria de 9,6 GB. La BiLSTM se empaquetó tanto en entrenamiento como en evaluación. El error de validación evolucionó de 16,89 % a 6,76 % en pasos de media época, y el mejor checkpoint fue el del paso final. El conjunto de test se usó una sola vez, después de la selección.

## Capacidades

- Diacritización de texto árabe sin vocales a nivel de carácter, preservando íntegramente letras, dígitos y puntuación.
- Ajuste específico a convenciones de dialecto saudí tomadas de etiquetas de transcripciones de habla, en lugar de las terminaciones formales del árabe estándar moderno o clásico.
- Procesamiento por lotes mediante `diacritize(lista, batch_size=64)` para canalizaciones de alto volumen.
- Ejecución en CPU y GPU con salidas idénticas en fp32 (verificado por el autor).
- Integración directa con transformers mediante `AutoModel` y `AutoTokenizer` con `trust_remote_code=True`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto libre: su única salida es la secuencia de marcas diacríticas.
- Capacidad multilingüe: no. Solo árabe (código `ar`), con dominio orientado al dialecto saudí.

## Casos de uso

- Preprocesado para TTS en dialecto saudí: insertar las vocales antes de enviar el texto a un sintetizador de voz, de modo que la pronunciación coincida con el habla real de las transcripciones. Es el caso de uso declarado por el autor.
- Postprocesado de pipelines de ASR en pódcast y YouTube: los transcriptores devuelven texto sin vocales y este modelo lo enriquece automáticamente con lotes de 64 frases, manteniendo intactos los caracteres originales.
- Generación de subtítulos y transcripciones legibles: mejorar la legibilidad de transcripciones árabes dialectales sin alterar el contenido literal del audio.
- Asistentes de voz y atención al cliente: el ejemplo de la model card muestra frases de atención al cliente ("ممكن تعطيني رقم الطلب..."), lo que encaja con la preparación de respuestas y consultas para TTS en centros de contacto.
- Analítica de conversaciones en centros de contacto: normalizar con vocales grandes volúmenes de transcripciones saudíes antes de pasarlas a modelos de comprensión o búsqueda.
- Material educativo y de aprendizaje de árabe dialectal: producir textos vocalizados coherentes con la pronunciación real para estudiantes o para la creación de recursos didácticos.
- Investigación en procesamiento de habla árabe: servir como referencia o punto de comparación reproducible sobre el dataset Rabe3/saudi-tashkeel-splits (uso permitido por la licencia, que es solo de investigación).
- Enriquecimiento de corpus para entrenamiento de otros sistemas: generar versiones vocalizadas de transcripciones saudíes para alimentar modelos posteriores en investigación académica.

## Benchmarks y rendimiento

Resultados sobre un conjunto de test retenido de 22.381 segmentos, dividido por episodio, con la métrica de tasa de error sobre letras marcadas explícitamente que no son finales de palabra (menor es mejor):

| Fuente | Shakkelha base | Shakkelha ajustado | Tashkeel-v4 base | Tashkeel-v4-Saudi |
|---|---:|---:|---:|---:|
| Todas | 21,52 % | 9,75 % | 17,59 % | 6,98 % |
| Eman-Fouda/youtube-001-part02-tashkeel | 20,05 % | 9,47 % | 16,55 % | 6,90 % |
| Rabe3/maha-host | 26,78 % | 11,66 % | 22,50 % | 8,37 % |
| Rabe3/nafas-host-podcast-001 | 21,01 % | 8,77 % | 17,12 % | 6,47 % |
| Rabe3/sara-host-podcast-001 | 22,82 % | 10,64 % | 18,96 % | 7,32 % |
| Rabe3/shakhsiya-host-podcast-001 | 23,16 % | 9,56 % | 19,16 % | 7,02 % |
| Rabe3/socrates-host-youtube-005 | 18,74 % | 8,36 % | 13,28 % | 5,46 % |
| Rabe3/swalif-host-podcast-001 | 22,74 % | 9,56 % | 18,03 % | 6,82 % |

Datos adicionales aportados por el autor: considerando todas las letras supervisadas, incluidas las finales de palabra, el error baja del 28,14 % del modelo base al 5,51 %. El modelo Shakkelha ajustado tiene 2,7 millones de parámetros y se entrenó y evaluó sobre las mismas particiones con el mismo evaluador. Las referencias son anotaciones automáticas de transcripciones de habla, no pronunciaciones verificadas por humanos, por lo que estas cifras miden la concordancia con esas etiquetas. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K ni similares) en la información disponible, algo esperable dado que el modelo no es generativo.

Ejemplo cualitativo incluido en la model card:

| | Texto |
|---|---|
| Entrada | أبغى وجبة ستريبس دجاج، ومعها بطاطس ومشروب بارد. |
| Tashkeel-v4 (base) | أَبْغَى وَجْبَةَ سَتْرَيبْسِ دَجَاجٍ، وَمَعَهَا بُطَاْطَسٌ وَمَشْرُوبٌ بَارِدٌ. |
| Tashkeel-v4-Saudi | أَبْغَى وَجْبَةْ سْتِرْيِبْسْ دْجَاجْ، وَمَعَهَا بَطَاطِسْ وَمَشْرُوبْ بَارِدْ. |

## Requisitos de hardware

- VRAM estimada para inferencia: con 171,6 millones de parámetros, los pesos en fp32 ocupan del orden de 0,69 GB y en bf16/fp16 unos 0,34 GB; sumando activaciones y estados de la BiLSTM, cabe holgadamente en menos de 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria. El autor midió 400 frases/s en una RTX 5880 Ada con lote de 64. También se ejecuta en CPU.
- Cabe en GPU de consumo: sí, en cualquier tarjeta consumer actual (RTX 3060, RTX 4060, RTX 4090, etc.) sin necesidad de cuantización.
- Opciones de despliegue: transformers con `AutoModel` y `trust_remote_code=True`. El autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al ser un etiquetador con CRF y código personalizado es probable que estos motores no lo admitan directamente; no disponible confirmación al respecto.
- Rendimiento medido: en 2× Xeon Gold 6430 (64 núcleos) con una petición a la vez y 8 hilos, 28 req/s con 34 ms de latencia mediana; con 16 procesos fijados de 4 hilos cada uno, 183 req/s con 81 ms de mediana y 136 ms de p95. En RTX 5880 Ada, unos 400 frases/s con lote de 64. Las frases de referencia tenían una mediana de 10 palabras y las mediciones se hicieron en fp32 con `diacritize()`.
- Nota de precisión: la salida en CPU es idéntica a la de GPU en fp32; el autocast bf16 en CPU cambió 4 de 152 salidas y fue más lento para peticiones individuales.
- Entrenamiento (referencia): 27 minutos en una RTX 5880 Ada con pico de 9,6 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Error (letras no finales, test) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Tashkeel-v4-Saudi | 171.573.661 | Dialecto saudí, encoder MARBERTv2 + BiLSTM + CRF | 6,98 % | tashkeel-research-only (solo investigacion) | HuggingFace, safetensors |
| Tashkeel-v4 (base) | no disponible | Diacritizacion de arabe formal (MSA/clasico) | 17,59 % | tashkeel-research-only | HuggingFace |
| Shakkelha ajustado | 2.700.000 | Diacritizacion de habla saudí, mismo split y evaluador | 9,75 % | no disponible en la informacion proporcionada | Usado como referencia por el autor |
| Shakkelha base | no disponible | Diacritizacion, sin ajuste al dominio saudí | 21,52 % | no disponible en la informacion proporcionada | Referencia comparativa |

No se dispone de comparaciones con otros modelos de diacritización árabe (por ejemplo variantes comerciales o de otras arquitecturas) en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: Tashkeel Research-Only License, heredada del modelo base de Ahmed Samir Tarjama. Solo permite uso no comercial de investigación y educación; cualquier uso comercial o empresarial está prohibido. Las publicaciones deben citar y enlazar el modelo base.
- Convenciones de etiquetas de habla: el modelo reproduce las convenciones del corpus de entrenamiento, incluida la colocación de un sukun en la primera letra de palabras que empiezan por grupo consonántico (سْتِرْيِبْسْ، تْخَيَّل). Hay que comprobar que la voz TTS de destino lo maneja bien.
- Árabe formal: no es su objetivo. Para texto en árabe estándar moderno o clásico debe usarse el modelo base Tashkeel-v4.
- Palabras raras: los préstamos léxicos poco frecuentes y los nombres de marca siguen siendo la principal fuente de error.
- Sin evaluación verificada por humanos: no existe todavía un conjunto de evaluación saudí validado manualmente; las referencias son anotaciones automáticas, por lo que las métricas miden concordancia con etiquetas automáticas, no corrección lingüística real.
- Riesgo de alucinación: nulo en el sentido generativo, ya que es un etiquetador de caracteres que nunca añade, elimina ni cambia letras, dígitos o puntuación; el riesgo se limita a asignar una marca diacrítica incorrecta.
- Cobertura de idioma: solo árabe. No hay soporte multilingüe ni de otros dialectos declarado explícitamente.
- Adopción nula en el momento de la ficha: 0 descargas y 0 likes, y ausencia de resultados de búsqueda web relevantes sobre el modelo, lo que implica poca validación externa.
- Requiere `trust_remote_code=True`, es decir, ejecutar código personalizado del repositorio; conviene revisarlo antes de desplegarlo en entornos sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rabe3/Tashkeel-v4-Saudi
- Modelo base: https://huggingface.co/ahmedsamirtarjama/Tashkeel-v4
- Dataset de ajuste: https://huggingface.co/datasets/Rabe3/saudi-tashkeel-splits
- Licencia: archivo LICENSE del repositorio (Tashkeel Research-Only License), no disponible como enlace directo en la información proporcionada
- No se han encontrado en la búsqueda web enlaces relevantes (papers, blogs, repositorios o demos) sobre este modelo; los resultados devueltos no guardan relación con él.
