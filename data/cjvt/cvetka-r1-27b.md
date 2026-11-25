# cjvt/Cvetka-R1-27B

## Resumen

Cvetka-R1-27B es un modelo multimodal de tipo image-text-to-text desarrollado por Marko Kokol en colaboración con el Centro de Recursos Lingüísticos Computacionales (CJVT) de la Universidad de Liubliana. Se trata de una adaptación esloveno-inglés del modelo base Qwen3.8-27B, en la que se sustituye el tokenizador original por Micka-65k, un tokenizador BPE a nivel de byte con 65.536 identificadores orientado a reducir la fragmentación del esloveno. El modelo acepta texto, imágenes y fotogramas de vídeo como entrada, y genera texto.

Su relevancia radica en el enfoque de eficiencia lingüística: según las comparaciones reportadas por el autor, Micka-65k utiliza aproximadamente un 33,8 % menos de tokens que el tokenizador Qwen para el esloveno en el conjunto FLORES-200, lo que se traduce en menor coste computacional y mayor ventana efectiva para tareas en esa lengua. El modelo conserva la torre de visión y el decodificador de texto denso de 64 capas del modelo donante, con 25.485.020.400 parámetros reales almacenados en 12 shards BF16 (50,97 GB). La denominación «27B» hace referencia a la clase del modelo donante, no al recuento exacto tras el cambio de vocabulario.

El modelo se distribuye bajo licencia Apache 2.0 y está pensado principalmente para investigación, traducción, transcripción de documentos y respuesta a preguntas multimodal en esloveno e inglés. El autor advierte explícitamente de que la seguridad no se ha evaluado en profundidad y de que el despliegue en producción requiere una evaluación específica de riesgos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de visión + decodificador de texto denso de 64 capas), basada en Qwen3.8-27B |
| Parametros totales | 25.485.020.400 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 posiciones configuradas |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; el autor no documenta cuantizaciones oficiales) |
| Idiomas soportados | Esloveno (sl), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (12 shards BF16, 50,97 GB) |
| Tokenizador | Micka-65k, BPE a nivel de byte, 65.536 IDs (128 controles reservados) |
| Entrada multimodal | Texto, imágenes y fotogramas de vídeo |
| Audio | No soportado |
| Librería | Transformers |
| Modelo base | Qwen/Qwen3.8-27B |

## Arquitectura y entrenamiento

Cvetka-R1-27B mantiene la arquitectura del modelo donante Qwen3.8-27B: una torre de visión acoplada a un decodificador de texto transformer denso de 64 capas. La modificación principal es la sustitución del tokenizador por Micka-65k, lo que altera los tamaños de los embeddings y, por tanto, el recuento final de parámetros respecto a la clase «27B» del modelo original. El contexto configurado alcanza las 262.144 posiciones, aunque el autor señala que la recuperación y el razonamiento efectivos dependen de la tarea y de la longitud del prompt.

El entrenamiento se organiza en varias revisiones. La revisión P14 LongSFT parte del modelo original P14 y añade entrenamiento de contexto largo, recuperación y OCR multipágina, seguido de un ajuste final de instrucciones. La revisión P20 es una continuación densa de P19 con los expertos residuales eliminados, y se establece como predeterminada. La revisión P21 es una continuación de 62 actualizaciones sobre P20 con el conjunto de selección v181. El autor no detalla en la información disponible el volumen total de tokens de entrenamiento ni la composición completa del dataset, ni confirma el uso de RLHF o DPO. Sí se documenta que una muestra de 7.617 objetivos de entrenamiento en esloveno utilizó un 27,9 % menos de tokens con Micka-65k.

## Capacidades

- Generación de texto conversacional de un solo turno y multiturno, con plantilla de chat propia y modo thinking opcional.
- Procesamiento de imágenes y fotogramas de vídeo como entrada (image-text-to-text y video-text-to-text).
- OCR y transcripción de documentos, incluida la recuperación multipágina, con hasta 2.560 tokens de imagen por página en el ejemplo oficial.
- Traducción entre esloveno e inglés, con menor coste en tokens para el esloveno.
- Razonamiento matemático y resolución de problemas (evaluado en GSM8K y MATH500).
- Conocimiento factual y respuesta a preguntas (evaluado en TriviaQA).
- Tareas lingüísticas específicas del esloveno, como flexión morfológica (cloze de inflexión) e inferencia en lenguaje natural (SI-NLI).
- Respuesta a preguntas multimodal con selección múltiple sobre imágenes.
- No se documenta soporte explícito de tool calling, function calling ni de flujos agénticos multi-paso en la información disponible.

## Casos de uso

- Traducción esloveno-inglés en producción editorial: el tokenizador Micka-65k reduce el número de tokens necesarios para el esloveno en torno a un 33,8 % frente al tokenizador Qwen en FLORES-200, lo que abarata el coste por documento y permite procesar textos más largos dentro de la misma ventana de contexto.
- Transcripción y digitalización de documentos: el modelo admite OCR multipágina con hasta 2.560 tokens de imagen por página, adecuado para convertir archivos escaneados en texto estructurado y buscar contenido dentro de ellos.
- Atención al ciudadano en esloveno: con 262.144 posiciones de contexto puede gestionar conversaciones multiturno y consultar documentación extensa en la misma sesión, manteniendo el historial completo sin truncar.
- Respuesta a preguntas sobre material visual: útil en entornos educativos o de archivo donde se plantean preguntas sobre diagramas, páginas escaneadas o fotogramas de vídeo, combinando la torre de visión con el decodificador de texto.
- Análisis de contenido audiovisual: la entrada de fotogramas de vídeo permite resumir o describir secuencias, por ejemplo para catalogar material de archivo o generar subtítulos descriptivos.
- Evaluación lingüística y morfológica del esloveno: los buenos resultados en tareas de flexión (93-95 sobre 100 en cloze de inflexión) lo hacen útil como componente en pipelines de corrección gramatical o de generación de ejercicios.
- Investigación en eficiencia de tokenizadores: sirve como caso de estudio para medir el impacto de un tokenizador específico de lengua en el coste computacional y en la calidad de la traducción.

## Benchmarks y rendimiento

Los resultados proceden de la model card del autor. La columna «Mejor GaMS» recoge el mejor resultado observado entre los modelos GaMS evaluados para cada tarea, no una única línea base fija.

| Tarea | P20 | P21 | Mejor GaMS medido |
|---|---:|---:|---|
| GSM8K, directo, aciertos / 150 | 137 | 128 | 122 · GaMS-27B-Instruct-Nemotron |
| MATH500 subconjunto, directo, aciertos / 100 | 75 | 78 | 55 · GaMS3-12B-Instruct-Lex |
| TriviaQA, directo, exacto / 100 | 25 | 29 | 47 · GaMS-27B-Instruct-Nemotron |
| Cloze de inflexión, directo, exacto / 100 | 93 | 95 | 47 · GaMS-27B-Instruct-Nemotron |
| SI-NLI validación, etiqueta explícita recuperada / 300 | 239 | 24 (dato truncado en la información disponible) | No disponible |

El autor indica que P20 rinde mejor en las pruebas de seguimiento de instrucciones y conocimiento en inglés y produce menos bucles de repetición en el diagnóstico de escritura, mientras que P21 mejora la flexión del esloveno y el subconjunto de TriviaQA, y lidera la selección múltiple solo-visión con presupuesto corto de respuesta. Los resultados dependen del prompting, la decodificación y la configuración del tokenizador.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 51 GB solo para los pesos, más caché KV y runtime; se recomienda un mínimo de 60-64 GB de memoria de GPU para contexto moderado.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para contexto largo; una RTX 4090 (24 GB) no puede alojar los pesos en BF16.
- En GPU de consumo: no cabe en BF16; sería necesario cuantizar a 8 o 4 bits, aunque el autor no publica cuantizaciones oficiales ni datos de calidad tras cuantización.
- Opciones de despliegue: el autor proporciona scripts de inferencia con Transformers y un cargador específico que verifica el tokenizador Micka y aplica la plantilla de chat y los IDs de parada. No se documenta compatibilidad verificada con vLLM, llama.cpp, Ollama o TGI; dado que el tokenizador no es el estándar de Qwen, estas integraciones requerirían validación adicional.
- Inferencia en CPU: el ejemplo oficial incluye la opción `--device cpu`, viable solo para pruebas puntuales por la latencia esperada con 25,5 mil millones de parámetros.
- Latencia y throughput: no disponibles en la información proporcionada.
- Espacio en disco: aproximadamente 51 GB por checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Cvetka-R1-27B (P20) | 25,49 B | 262.144 | sl, en | Apache 2.0 | Tokenizador Micka-65k; multimodal con visión y vídeo |
| Qwen3.8-27B (modelo base) | Clase 27B | No disponible | Multilingüe amplio | Según el modelo original | Tokenizador Qwen; sin adaptación específica al esloveno |
| GaMS-27B-Instruct-Nemotron | Clase 27B | No disponible | Esloveno (GaMS) | No disponible | Mejor resultado en TriviaQA (47/100) y en GSM8K (122/150) frente a P20 en algunas tareas |
| GaMS3-12B-Instruct-Lex | Clase 12B | No disponible | Esloveno (GaMS) | No disponible | Mejor resultado en MATH500 (55/100) entre los GaMS evaluados |

La comparación con los modelos GaMS procede de las tablas del propio autor y se limita a las tareas evaluadas; no cubre contexto, licencia ni capacidades multimodales de forma homogénea.

## Limitaciones y advertencias

- El autor declara que la seguridad no se ha evaluado en profundidad: solo se realizaron pruebas básicas de seguridad y memorización.
- Riesgo de invención de hechos, repetición de pasajes, mala lectura de documentos y omisión de matices en la traducción.
- Puede producir respuestas sesgadas o dañinas; se recomienda uso de investigación y verificación de salidas en aplicaciones con consecuencias.
- El soporte lingüístico se limita a esloveno e inglés; no se documentan otros idiomas.
- La ventana de 262.144 posiciones es un límite configurado, no una garantía de recuperación efectiva en prompts muy largos.
- No se documenta soporte de audio.
- El tokenizador no estándar puede romper integraciones que asumen la normalización y pre-tokenización de Qwen; el autor insiste en usar el cargador incluido.
- No hay cuantizaciones oficiales publicadas, lo que limita el despliegue en hardware de consumo.
- La licencia Apache 2.0 permite uso comercial, pero el autor recomienda evaluación específica de riesgos antes de producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es aún inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cjvt/Cvetka-R1-27B
- Revisiones del modelo: https://huggingface.co/klokedm/Cvetka-R1-27B/tree/v1-p20
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Revisión del tokenizador Qwen de referencia: https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Autor: https://kokol.dev
- CJVT: https://www.cjvt.si/
