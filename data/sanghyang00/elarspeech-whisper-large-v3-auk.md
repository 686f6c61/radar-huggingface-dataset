# Sanghyang00/ELARSpeech-Whisper-Large-v3-auk

## Resumen

ELARSpeech-Whisper-Large-v3-auk es un modelo de reconocimiento automático del habla (ASR) obtenido por ajuste fino (*fine-tuning*) del checkpoint `openai/whisper-large-v3` sobre datos del proyecto ELARSpeech. Lo publica el usuario Sanghyang00 en HuggingFace y está especializado en una única lengua: el heiyoho (código ISO 639-3 `auk`), una de las lenguas de cola larga cubiertas por el corpus ELARSpeech. El modelo se distribuye con la arquitectura `WhisperForConditionalGeneration`, es decir, un transformer encoder-decoder con 1.543.491.840 parámetros (aproximadamente 1,55 mil millones) y pesos en formato `safetensors`.

Su relevancia es acotada pero concreta: la práctica totalidad de los sistemas ASR comerciales y open source rinden de forma pobre o directamente nula en lenguas con pocos hablantes y escasa representación digital. Este modelo traslada la capacidad acústica de Whisper large-v3 a una de esas lenguas mediante ajuste supervisado, y permite obtener transcripciones en heiyoho sin entrenar un sistema desde cero. Forma parte de una colección de adaptaciones por idioma publicadas por el mismo autor (por ejemplo, la variante `-afu`) dentro del ecosistema ELARSpeech, presentado como un corpus de 30.000 horas y 675 lenguas infrarrepresentadas.

El modelo hereda las limitaciones estructurales de Whisper: procesa audio en ventanas de 30 segundos y convierte la señal a un espectrograma Mel de 128 bins a 16 kHz. Es un modelo monolingüe, sin capacidades de texto, visión ni *tool calling*, y en el momento de redactar esta ficha no tiene descargas ni *likes* registrados ni benchmarks publicados, por lo que su calidad real fuera del conjunto de evaluación del autor no está verificada de forma independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WhisperForConditionalGeneration (transformer encoder-decoder) |
| Parametros totales | 1.543.491.840 (~1,55 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en tokens; Whisper procesa audio en ventanas de 30 s, con manejo de audio largo mediante decodificacion secuencial o por fragmentos |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no se listan variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | auk (heiyoho), unico idioma |
| Licencia | No disponible (la model card remite a la licencia del repositorio del modelo base, openai/whisper-large-v3) |
| Formato de pesos | safetensors |
| Modelo base | openai/whisper-large-v3 |
| Tamano del repositorio | 6,2 GB |
| Entrada de audio | Mono, 16 kHz, espectrograma Mel de 128 bins |
| Biblioteca | transformers |
| Pipeline | automatic-speech-recognition |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-15 |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3 sin modificaciones estructurales: un transformer encoder-decoder con aproximadamente 1,55 mil millones de parámetros. El encoder consume un espectrograma Mel de 128 bins calculado sobre audio mono a 16 kHz y produce representaciones acústicas; el decoder genera tokens de texto de forma autorregresiva condicionada por un prompt que incluye el token de idioma, el token de tarea y los tokens de marca temporal. La ventana de procesamiento es de 30 segundos y el audio de mayor duración se trata mediante decodificación secuencial o troceada.

La model card indica que se trata de un ajuste fino del checkpoint `openai/whisper-large-v3` sobre datos de ELARSpeech para la lengua heiyoho (ISO 639-3 `auk`) y que el artefacto exportado se verificó contra el checkpoint original de ELARSpeech sobre un conjunto fijo de evaluación, con estado de verificación de transcripción exacta **PASS**. No se especifican en la información disponible el número de tokens de audio empleados en el ajuste, la composición exacta del subconjunto de datos, ni si se aplicaron técnicas de alineación como RLHF, DPO o adaptación LoRA. El repositorio ELARSpeech asociado se describe como un conjunto de datos de 30.000 horas y 675 lenguas infrarrepresentadas, pero no se detalla qué porción corresponde a `auk`.

Un detalle operativo relevante es que el modelo espera el token de idioma en el prompt explícito del decoder (`<|auk|>`) en lugar de usar el argumento `language=` de la API de generación, según indica el propio autor. Esto sugiere que durante el ajuste o la exportación se manipuló el mapeo de tokens respecto al comportamiento estándar de Whisper, y que reproducir la decodificación del artefacto exportado requiere seguir ese prompt.

## Capacidades

- Transcripción de voz a texto en heiyoho (`auk`) a partir de audio mono a 16 kHz.
- Reconocimiento de habla en una única lengua: no traduce y no soporta otros idiomas.
- Control explícito de la decodificación mediante prompt de tokens especiales (`<|auk|>`, `<|transcribe|>`, `<|notimestamps|>`).
- Generación de transcripciones con o sin marcas temporales, en función de los tokens del prompt.
- Procesamiento de audio de duración superior a 30 segundos mediante decodificación por fragmentos (comportamiento heredado de Whisper, no documentado específicamente para este checkpoint).
- No soporta *tool calling* ni *function calling*.
- No soporta agentes, razonamiento multi-paso ni uso conversacional.
- No dispone de modo de razonamiento (*thinking*), ni de capacidades de visión, audio-vision o generación de texto general.
- Capacidades multilingües: no disponibles; el modelo está restringido a un solo idioma.

## Casos de uso

- Transcripción de archivos de audio en heiyoho: convertir grabaciones de campo, entrevistas o material radiofónico a texto plano; es el uso directo del modelo y no requiere ninguna adaptación adicional más allá de remuestrear a 16 kHz mono.
- Documentación y preservación lingüística: generar transcripciones de corpus orales en una lengua de cola larga para construir diccionarios, corpus anotados y materiales didácticos donde no existen sistemas ASR comerciales viables.
- Subtitulado de vídeo y audio en heiyoho: generar subtítulos automáticos para contenido audiovisual de comunidades con pocos recursos digitales, con la ventana de 30 segundos de Whisper como unidad natural de segmentación.
- Investigación lingüística y fonética de campo: transcribir entrevistas y elicitaciones en bruto para acelerar la anotación manual posterior, dejando la revisión humana como paso de control de calidad.
- Preprocesado de datos para otros modelos: usar las transcripciones como entrada para pipelines de traducción, análisis de sentimiento o indexación de audio en heiyoho.
- Archivado y búsqueda de audio: indexar una fonoteca en heiyoho para permitir búsqueda por texto sobre grabaciones que antes solo eran recuperables por metadatos.
- Asistentes de dictado específicos para la comunidad hablante: integrar el modelo en una aplicación de escritorio o móvil que transcriba notas de voz, asumiendo el coste de cómputo del modelo de 1,55 mil millones de parámetros.
- Extracción de datos para proyectos ELARSpeech u otros corpus multilingües: generar transcripciones automáticas de nuevas grabaciones en heiyoho para ampliar el conjunto de entrenamiento de variantes futuras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La única métrica aportada por el autor es cualitativa: el artefacto exportado se comprobó contra el checkpoint original de ELARSpeech sobre un conjunto fijo de muestras de evaluación y la verificación de transcripción exacta resultó **PASS**. No se especifican el tamaño de ese conjunto, la métrica empleada (WER, CER u otra), su valor numérico, ni comparaciones con Whisper large-v3 original u otros sistemas.

## Requisitos de hardware

- Pesos en `safetensors`: el repositorio ocupa 6,2 GB, coherente con pesos en precisión completa (fp32) para 1,55 mil millones de parámetros.
- VRAM estimada para inferencia en fp16: del orden de 4 GB solo para pesos, más el *overhead* de activaciones y del *cache* del decoder; en la práctica se recomienda un mínimo de 6-8 GB para trabajar con comodidad.
- VRAM estimada en fp32: aproximadamente 6,2 GB de pesos más activaciones, lo que sitúa el mínimo práctico en torno a 10-12 GB.
- VRAM estimada con cuantización de 8 bits: del orden de 2 GB de pesos, aunque el repositorio no publica pesos ya cuantizados y habría que generarlos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). Para servir varias peticiones concurrentes o audio largo, A100 40/80 GB o H100.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en fp16 y con 12 GB o más si se quiere margen para lotes o audio de larga duración.
- Opciones de despliegue: `transformers` con `WhisperForConditionalGeneration` y `WhisperProcessor` es la ruta documentada por el autor; también vLLM y TGI para servir el modelo con *batching* continuo, y HuggingFace Inference Endpoints (el repositorio está etiquetado como `endpoints_compatible`). Para `llama.cpp` u Ollama sería necesario convertir los pesos a GGUF, conversión no documentada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sanghyang00/ELARSpeech-Whisper-Large-v3-auk | 1.543.491.840 | Ventanas de 30 s de audio | auk (heiyoho) | No disponible | HuggingFace, 0 descargas |
| openai/whisper-large-v3 | 1,55 mil millones (segun la informacion disponible) | Ventanas de 30 s de audio; Mel de 128 bins | Multilingue (amplia cobertura, con rendimiento variable segun idioma) | No disponible en la informacion proporcionada | HuggingFace, modelo de referencia ampliamente desplegado |
| openai/whisper-large-v3-turbo | No disponible | No disponible | Multilingue | No disponible en la informacion proporcionada | Version optimizada de large-v3 que ofrece mayor velocidad de transcripcion con una degradacion minima de la precision |
| Sanghyang00/ELARSpeech-Whisper-Large-v3-afu | Derivado del mismo modelo base; valor no verificado en la informacion disponible | Ventanas de 30 s de audio (heredado) | Idioma correspondiente al codigo ISO 639-3 `afu` | No disponible | HuggingFace; misma coleccion ELARSpeech |

La comparación relevante es de especialización frente a cobertura: `whisper-large-v3` cubre muchos idiomas pero rinde de forma desigual en lenguas con pocos datos, mientras que `-auk` sacrifica toda cobertura multilingüe a cambio de un ajuste supervisado en heiyoho. Frente a `whisper-large-v3-turbo`, la variante ELARSpeech no ofrece ventajas de velocidad conocidas. No hay datos públicos de WER que permitan cuantificar la mejora respecto al modelo base en esta lengua.

## Limitaciones y advertencias

- Modelo monolingüe: no transcribe ningún idioma distinto del heiyoho (`auk`) y no realiza traducción.
- Sin benchmarks públicos: no se ha publicado WER ni CER, y el autor solo reporta un estado de verificación cualitativo (PASS) sobre un conjunto fijo no descrito. La calidad real en condiciones de producción es desconocida.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de redactar la ficha, lo que implica ausencia de retroalimentación independiente.
- Sesgos y variabilidad: la precisión puede variar según las condiciones de grabación, la población de hablantes, la ortografía empleada y el dominio del audio. Al provenir de un corpus concreto, el modelo puede estar sesgado hacia los acentos, registros y micrófonos presentes en ELARSpeech.
- Riesgo de alucinación: los modelos Whisper pueden generar texto plausible en tramos de silencio, ruido o audio musical, y entrar en bucles de repetición. En una lengua de bajos recursos y sin corrector ortográfico disponible, estos errores son difíciles de detectar automáticamente.
- Restricción de entrada: el audio debe ser mono y estar muestreado a 16 kHz; no hacer el remuestreo degrada los resultados.
- Dependencia del prompt: según el autor, la decodificación debe replicarse con el prompt de tokens explícito (`<|auk|>`, `<|transcribe|>`, `<|notimestamps|>`) en lugar de usar el parámetro `language=`; ignorarlo puede producir una salida distinta a la esperada.
- Licencia indeterminada: la model card remite a la licencia del modelo base y a los términos de datos del proyecto ELARSpeech, sin especificar condiciones propias. Antes de un uso comercial es imprescindible aclarar ambos extremos.
- Trazabilidad: no se documentan el volumen de datos de ajuste, la composición del conjunto de evaluación ni los hiperparámetros, lo que dificulta reproducir el resultado.
- Formato: solo se publican pesos `safetensors`; el despliegue en runtimes como `llama.cpp` u Ollama requiere una conversión no documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sanghyang00/ELARSpeech-Whisper-Large-v3-auk
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Repositorio del código de Whisper: https://github.com/openai/whisper
- Repositorio del proyecto ELARSpeech: https://github.com/sanghyang00/elarspeech
- Variante de la misma colección para el código ISO 639-3 `afu`: https://huggingface.co/Sanghyang00/ELARSpeech-Whisper-Large-v3-afu
- Ficha de Whisper large-v3 en Vast.ai: https://vast.ai/model/whisper
