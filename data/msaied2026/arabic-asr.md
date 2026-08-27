# Msaied2026/arabic-asr

## Resumen

El modelo `Msaied2026/arabic-asr` es un sistema de reconocimiento automático de voz (ASR) que transcribe audio a texto en árabe, inglés y discurso con cambio de código árabe-inglés. Se trata de un ajuste fino del modelo `CohereLabs/cohere-transcribe-03-2026`, desarrollado por Cohere y Cohere Labs, con 2.065.804.048 parámetros (aproximadamente 2,07 mil millones). Su arquitectura combina un codificador Conformer de gran tamaño con un decodificador Transformer ligero, lo que permite capturar representaciones acústicas robustas y generar texto de forma autorregresiva.

El modelo está optimizado para el árabe y sus dialectos, así como para el inglés, y es especialmente útil en escenarios de transcripción de audio largo gracias a su capacidad de dividir automáticamente el audio en fragmentos y reensamblar las transcripciones. Publicado bajo licencia Apache 2.0, está disponible en el ecosistema Hugging Face con soporte nativo en `transformers`, lo que facilita su integración en pipelines de procesamiento de audio. Su relevancia actual radica en la creciente demanda de ASR multilingüe y multidioma para aplicaciones de accesibilidad, atención al cliente y análisis de contenido en el mundo árabe.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder-decoder |
| Parametros totales | 2.065.804.048 (2,07 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio, no texto; el extractor de características divide audio largo en fragmentos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe, ingles (incluye dialectos arabes y code-switching) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de codificador-decodificador basada en Conformer. El codificador Conformer, de gran tamaño, extrae representaciones acústicas a partir de espectrogramas log-Mel calculados sobre la forma de onda de audio, que se remuestrea automáticamente a 16 kHz si es necesario. El decodificador, un Transformer ligero, genera los tokens de texto de forma autorregresiva. El objetivo de entrenamiento es la entropía cruzada supervisada sobre los tokens de salida, sin que se mencionen técnicas adicionales como RLHF o DPO en la información disponible.

No se especifican detalles sobre la composición del dataset de entrenamiento, el número de tokens ni las fases de preentrenamiento o ajuste fino. El modelo base `CohereLabs/cohere-transcribe-03-2026` es el punto de partida, y `Msaied2026/arabic-asr` es un ajuste fino posterior, aunque no se detallan los datos utilizados para dicho ajuste.

## Capacidades

- Transcripción de audio a texto en árabe estándar y dialectos árabes.
- Transcripción en inglés.
- Soporte de discurso con cambio de código (code-switching) entre árabe e inglés.
- Manejo de audio largo mediante división automática en fragmentos y reensamblaje de transcripciones parciales.
- Preprocesamiento integrado: remuestreo automático a 16 kHz y promediado de canales para audio estéreo.
- Integración nativa con `transformers` (clase `CohereAsrForConditionalGeneration`) y compatibilidad con vLLM para inferencia en línea.
- No se mencionan capacidades de tool calling, agentes, visión ni modos de razonamiento explícitos; es un modelo puramente de ASR.

## Casos de uso

- Atención al cliente automatizada: el modelo puede transcribir llamadas de soporte en árabe o inglés, incluyendo conversaciones con cambio de código, para generar registros escritos, análisis de sentimiento o búsqueda de palabras clave. Su soporte de audio largo permite procesar sesiones completas sin cortes manuales.
- Transcripción de reuniones y conferencias: ideal para convertir grabaciones de reuniones en actas escritas, especialmente en entornos bilingües árabe-inglés. La división automática en fragmentos facilita el manejo de audios de más de una hora.
- Subtitulado automático de vídeos: se puede integrar en pipelines de generación de subtítulos para contenido en árabe e inglés, útil para plataformas de vídeo, cursos en línea o noticias.
- Accesibilidad para personas con discapacidad auditiva: permite convertir contenido hablado en texto en tiempo real o diferido, mejorando el acceso a información en árabe e inglés.
- Análisis de contenido en medios: transcripción de entrevistas, podcasts o programas de radio para su posterior indexación, búsqueda y análisis lingüístico.
- Asistentes de voz y comandos por voz: el modelo puede servir como backend de transcripción en aplicaciones de asistente virtual que operen en árabe o inglés, aunque no se documenta soporte explícito de tool calling.
- Documentación médica y legal: transcripción de dictados o grabaciones en árabe e inglés para generar informes estructurados, reduciendo la carga administrativa en sectores profesionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no aparece en el Open Universal Arabic ASR Leaderboard (https://huggingface.co/spaces/elmresearchcenter/open_universal_arabic_asr_leaderboard) según los datos consultados, y no se proporcionan métricas como WER o CER para conjuntos de prueba estándar (SADA, Common Voice, MASC, MGB-2, Casablanca). Tampoco se dispone de comparaciones con otros modelos ASR en la documentación del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,07 mil millones de parámetros en precisión FP16, el modelo ocupa aproximadamente 4,1 GB en memoria (tamaño del repositorio). En cuantización INT8 podría reducirse a unos 2 GB, aunque no se confirman cuantizaciones oficiales.
- GPU recomendadas: una GPU con al menos 6 GB de VRAM sería suficiente para FP16 (por ejemplo, RTX 2060, RTX 3060, T4). Para mayor velocidad o procesamiento por lotes, se recomiendan GPUs de gama alta como RTX 4090, A100 o H100.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo con 8 GB o más de VRAM, como RTX 3070, RTX 3080 o RTX 4060 Ti.
- Opciones de despliegue: soporte nativo en `transformers` (inferencia offline) y vLLM (inferencia en línea). También puede ejecutarse con `accelerate` para distribución en múltiples GPUs.
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU moderna, un modelo de 2B parámetros suele alcanzar un factor tiempo real (RTFx) superior a 10 en tareas de ASR, pero esto depende del hardware y la longitud del audio.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo específico. Como referencia, existen alternativas ASR para árabe como:

| Modelo | Parametros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| Msaied2026/arabic-asr | 2,07 B | arabe, ingles | Apache 2.0 | Basado en Cohere Transcribe, ajuste fino |
| openai/whisper-large-v3 | 1,55 B | multilingue (incluye arabe) | MIT | Arquitectura encoder-decoder Transformer, ampliamente usado |
| facebook/mms-1b-all | 1 B | 1100+ idiomas | CC-BY-NC 4.0 | Modelo multilingue de Meta, incluye arabe |

No se han encontrado comparaciones directas de WER o CER entre estos modelos en la información disponible. El Open Universal Arabic ASR Leaderboard podría ofrecer métricas comparativas, pero no se ha localizado la entrada de este modelo en dicho leaderboard.

## Limitaciones y advertencias

- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos supervisados, puede reflejar sesgos presentes en los datos de entrenamiento (por ejemplo, variaciones dialectales subrepresentadas).
- Riesgo de alucinación: como todo modelo generativo, puede producir transcripciones incorrectas o inventar contenido cuando el audio es ambiguo o de baja calidad.
- Limitaciones de idioma: aunque soporta árabe e inglés, no se garantiza un rendimiento uniforme en todos los dialectos árabes; algunos dialectos pueden tener mayor error que el árabe estándar.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base `CohereLabs/cohere-transcribe-03-2026` por si hubiera condiciones adicionales.
- Para producción, es necesario validar el rendimiento con datos propios, especialmente en entornos con ruido, acentos o vocabulario especializado.
- No se proporcionan garantías sobre latencia, throughput ni consumo de memoria en escenarios de despliegue a gran escala.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Msaied2026/arabic-asr
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- Open Universal Arabic ASR Leaderboard: https://huggingface.co/spaces/elmresearchcenter/open_universal_arabic_asr_leaderboard
- Paper del leaderboard (arXiv): https://arxiv.org/html/2412.13788v1
- Demo del modelo base (Cohere Transcribe Arabic): https://huggingface.co/spaces/CohereLabs/cohere-transcribe-arabic-07-2026
