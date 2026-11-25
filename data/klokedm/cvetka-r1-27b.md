# klokedm/Cvetka-R1-27B

## Resumen

Cvetka-R1-27B es un modelo multimodal de tipo image-text-to-text desarrollado por Marko Kokol en colaboración con el instituto CJVT (Centro za jezikovne vire in tehnologije, Universidad de Liubliana). Se trata de un ajuste fino del modelo Qwen3.8-27B en el que se ha sustituido el tokenizador original por Micka-65k, un tokenizador BPE byte-level con 65.536 identificadores diseñado para esloveno. El modelo acepta texto, imágenes y fotogramas de vídeo, y genera texto.

El objetivo principal es cubrir las carencias del esloveno en los modelos multilingües de gran escala: según las mediciones del autor, el tokenizador Micka-65k reduce un 33,8 % el número de tokens necesarios para esloveno frente al tokenizador de Qwen en el conjunto FLORES-200, a costa de un aumento del 10 % en inglés. Esta eficiencia tokenial se traduce en menor coste de inferencia y mayor ventana efectiva para textos eslovenos.

El modelo conserva la torre de visión y el decodificador de texto denso de 64 capas de Qwen, con 25.485.020.400 parámetros almacenados en 12 shards BF16 (50,97 GB). La designación "27B" hace referencia a la clase del modelo donante; el cambio de vocabulario altera los tamaños de embedding. El techo de contexto configurado es de 262.144 posiciones. Se distribuye bajo licencia Apache 2.0 y está pensado principalmente para investigación, según advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de visión + decodificador de texto denso de 64 capas), basada en Qwen3.8-27B |
| Parametros totales | 25.485.020.400 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 posiciones (techo configurado) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Esloveno (sl), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (12 shards BF16, 50,97 GB) |

## Arquitectura y entrenamiento

Cvetka-R1-27B es un ajuste fino del modelo Qwen3.8-27B, del que hereda la torre de visión y un decodificador de texto denso de 64 capas. La modificación estructural principal es la sustitución del tokenizador por Micka-65k, un BPE byte-level de 65.536 identificadores (128 reservados para controles). El cambio de vocabulario modifica los tamaños de las matrices de embedding y de la cabeza de salida, lo que explica que el recuento de parámetros (25.485 M) no coincida exactamente con la clase "27B" del modelo donante.

El autor publica tres checkpoints: P14 LongSFT (entrenamiento de contexto largo, recuperación/OCR multipágina y ajuste final de instrucciones), P20 (continuación densa de P19 tras eliminar los expertos residuales añadidos) y P21 original (62 actualizaciones sobre P20 con el conjunto de selección v181; P21A es un experimento separado). P20 es el checkpoint por defecto. No se detalla en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. El autor menciona que una muestra de 7.617 objetivos de entrenamiento en esloveno usó un 27,9 % menos de tokens con Micka-65k.

## Capacidades

- Generación de texto conversacional en esloveno e inglés, con plantilla de chat propia y modo thinking opcional.
- Comprensión de imágenes y fotogramas de vídeo (pipeline image-text-to-text y video-text-to-text).
- OCR y transcripción de documentos, con soporte de hasta 2.560 tokens de imagen por página en el ejemplo proporcionado.
- Recuperación y OCR multipágina (introducido en el checkpoint P14 LongSFT).
- Traducción esloveno-inglés con menor coste tokenial en esloveno.
- Razonamiento matemático (evaluado en GSM8K y MATH500).
- Respuesta a preguntas de conocimiento (TriviaQA) e inferencia de lenguaje natural (SI-NLI).
- Tareas de morfología eslovena, como cloze de flexión.
- No soporta entrada de audio.

## Casos de uso

- Digitalización de documentos eslovenos: el modelo puede transcribir páginas escaneadas mediante el pipeline OCR incluido, con un presupuesto de hasta 2.560 tokens de imagen por página, lo que resulta adecuado para archivos y administración pública en esloveno.
- Traducción esloveno-inglés en producción: la reducción del 33,8 % en tokens para esloveno abarata el coste por documento en pipelines de traducción por lotes, aunque el autor advierte de posibles omisiones de matices.
- Atención al cliente en esloveno: con 262.144 posiciones de contexto puede gestionar conversaciones multi-turno largas y consultar documentación extensa dentro de la misma ventana.
- Análisis de vídeo con narración en esloveno: la capacidad video-text-to-text permite describir o resumir fotogramas de contenido audiovisual esloveno.
- Investigación en lingüística computacional eslovena: las tareas de flexión, NLI y traducción evaluadas lo hacen útil para experimentos académicos con CJVT y corpus eslovenos.
- Asistencia educativa bilingüe: resolución de problemas matemáticos (GSM8K, MATH500) con explicaciones en esloveno e inglés para entornos escolares.
- Procesamiento de formularios y facturas: combinación de OCR y razonamiento sobre el texto extraído para extraer campos estructurados de documentos eslovenos.

## Benchmarks y rendimiento

Resultados publicados por el autor (P20 y P21 frente al mejor resultado medido entre los modelos GaMS evaluados; cada celda GaMS es el mejor resultado observado para esa tarea, no una línea base fija):

| Tarea | P20 | P21 | Mejor GaMS medido |
|---|---:|---:|---|
| GSM8K, directo, aciertos / 150 | 137 | 128 | 122 · GaMS-27B-Instruct-Nemotron |
| MATH500 subset, directo, aciertos / 100 | 75 | 78 | 55 · GaMS3-12B-Instruct-Lex |
| TriviaQA, directo, exacto / 100 | 25 | 29 | 47 · GaMS-27B-Instruct-Nemotron |
| Cloze de flexión, directo, exacto / 100 | 93 | 95 | 47 · GaMS-27B-Instruct-Nemotron |
| SI-NLI validación, directo, etiqueta explícita recuperada / 300 | 239 | 24 (dato truncado en la información disponible) | No disponible |

El autor indica que P20 rinde mejor en las pruebas de seguimiento de instrucciones y conocimiento en inglés y produce menos bucles de repetición en la prueba de escritura, mientras que P21 mejora la flexión eslovena y el subconjunto de TriviaQA, y lidera la elección múltiple solo-visión con presupuesto corto de respuesta. Los resultados dependen del prompting, la decodificación y la configuración del tokenizador.

## Requisitos de hardware

- VRAM estimada: unos 51 GB solo para los pesos en BF16, más caché KV y runtime; en la práctica se necesita una GPU con 80 GB o más para contexto largo.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200; en configuraciones multi-GPU también es viable con 2× RTX 4090 (48 GB) o 2× A6000 (96 GB) mediante sharding, aunque no se documenta oficialmente.
- No cabe en una GPU de consumo individual en BF16; se requeriría cuantización (no publicada).
- Opciones de despliegue: el autor proporciona scripts de inferencia con Transformers (`usage/chat.py`, `usage/ocr.py`), con soporte de `--device cpu` para inferencia en CPU. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Cvetka-R1-27B | 25,49 B | 262.144 | Apache 2.0 | sl, en | Tokenizador Micka-65k; multimodal |
| Qwen3.8-27B (base) | ~27 B (clase) | No disponible | No disponible | Multilingüe | Modelo donante; sin ajuste esloveno |
| GaMS-27B-Instruct-Nemotron | ~27 B | No disponible | No disponible | sl | Mejor en TriviaQA (47/100) y GSM8K (122/150) |
| GaMS3-12B-Instruct-Lex | ~12 B | No disponible | No disponible | sl | Mejor en MATH500 (55/100) |

## Limitaciones y advertencias

- El autor advierte de que la seguridad no se ha evaluado en profundidad: solo se realizaron pruebas básicas de seguridad y memorización.
- Riesgo de invención de hechos, repetición de pasajes, mala lectura de documentos, omisión de matices en traducción y respuestas sesgadas o dañinas.
- El uso recomendado es investigación; el despliegue en producción requiere una evaluación específica de la aplicación y sus riesgos.
- La ventana de 262.144 posiciones es un techo configurado; la recuperación y el razonamiento efectivos dependen de la tarea y la longitud del prompt.
- El tokenizador penaliza el inglés (+10 % de tokens frente a Qwen), por lo que el coste en inglés es mayor.
- No soporta entrada de audio.
- El autor no documenta cuantizaciones oficiales, lo que limita el despliegue en hardware de consumo.
- El checkpoint P21 muestra un resultado anómalo en SI-NLI (24/300 frente a 239 de P20) en los datos disponibles; conviene verificar antes de usarlo en tareas de inferencia lingüística.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/klokedm/Cvetka-R1-27B
- Checkpoint P14 LongSFT: https://huggingface.co/klokedm/Cvetka-R1-27B/tree/v1-p14-longsft
- Checkpoint P20: https://huggingface.co/klokedm/Cvetka-R1-27B/tree/v1-p20
- Checkpoint P21: https://huggingface.co/klokedm/Cvetka-R1-27B/tree/v1-p21
- Modelo base Qwen3.8-27B (revisión fijada del tokenizador): https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Web del autor: https://kokol.dev
- CJVT (colaborador): https://www.cjvt.si/
- DOI: 10.57967/hf/11844
