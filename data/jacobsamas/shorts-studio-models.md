# jacobsamas/shorts-studio-models

## Resumen

`jacobsamas/shorts-studio-models` es un repositorio de modelos de reconocimiento automático del habla (ASR) para siete idiomas de la India, empaquetados en el formato ggml de 8 bits (q8_0) que consume whisper.cpp. Lo publica el usuario Jacob Samas como parte de Shorts Studio, con el objetivo declarado de generar subtítulos offline sin depender de servicios en la nube. No se trata de un modelo nuevo: cada fichero es una conversión de formato de un modelo Whisper previamente ajustado por terceros, sin reentrenamiento alguno.

El repositorio agrupa seis variantes basadas en Whisper Small (hindi, tamil, telugu, kannada, gujarati y malayalam) y una basada en Whisper Medium (bengalí). Las versiones de los seis primeros idiomas proceden de los ajustes finos publicados por el SPRING Lab del IIT Madras (cuenta `vasista22`), mientras que el malayalam proviene de `vrclc/Whisper-small-Malayalam` y el bengalí de `bengaliAI/tugstugi_bengaliai-asr_whisper-medium`. Todos los originales derivan de OpenAI Whisper y se distribuyen con licencia Apache-2.0.

Su relevancia es práctica más que investigadora: ofrece un paquete listo para usar con whisper.cpp en aplicaciones de subtitulado local para idiomas con poca cobertura en herramientas comerciales, con la ventaja de la inferencia en CPU y la ausencia de llamadas a API. El repositorio ocupa 2,4 GB y no registra descargas ni interacciones en Hugging Face en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper de OpenAI), convertido a ggml |
| Parametros totales | no disponible (Whisper Small: ~244 M; Whisper Medium: ~769 M, segun el modelo original) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper trabaja con ventanas de audio de 30 s) |
| Tipos de cuantizacion | q8_0 (8 bits) exclusivamente |
| Idiomas soportados | hindi (hi), tamil (ta), telugu (te), kannada (kn), gujarati (gu), malayalam (ml), bengali (bn) |
| Licencia | Apache-2.0 |
| Formato de pesos | ggml (.bin) para whisper.cpp |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OpenAI Whisper: un transformer encoder-decoder entrenado para transcripción y traducción de voz, que procesa audio en ventanas de 30 segundos y genera tokens de texto de forma autorregresiva. El repositorio no aporta ningún entrenamiento propio; cada fichero es una conversión de los pesos originales al formato ggml con cuantización q8_0, pensada para ejecución eficiente en CPU mediante whisper.cpp.

Los ajustes finos originales fueron realizados por el SPRING Lab del IIT Madras para seis idiomas (hindi, tamil, telugu, kannada, gujarati y malayalam), y por `bengaliAI` y `vrclc` para bengalí y malayalam respectivamente. No se dispone en la información proporcionada de detalles sobre el volumen de datos de ajuste, la composición de los corpus ni si se aplicaron técnicas de RLHF o DPO; los modelos Whisper originales se entrenaron con aprendizaje supervisado sobre pares audio-transcripción. La innovación técnica del repositorio es, por tanto, exclusivamente de empaquetado y distribución: formato ggml cuantizado a 8 bits para inferencia offline.

## Capacidades

- Transcripción de voz a texto en hindi, tamil, telugu, kannada, gujarati, malayalam y bengalí.
- Generación de subtítulos offline sin conexión a servicios externos.
- Ejecución en CPU mediante whisper.cpp, sin requerir GPU.
- Procesamiento de audio en ventanas de 30 segundos, propio de la arquitectura Whisper.
- Capacidad potencial de traducción al inglés heredada de Whisper (no confirmada explícitamente para estos ajustes finos en la información disponible).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta soporte de visión ni audio más allá de la transcripción estándar.
- No se documenta modo de razonamiento (thinking mode) ni capacidades multimodales adicionales.

## Casos de uso

- Subtitulado automático de vídeos cortos en hindi: el modelo transcribe el audio localmente y permite generar ficheros de subtítulos sin subir el contenido a un servicio en la nube, lo que reduce costes y preserva la privacidad.
- Generación de subtítulos para contenido educativo en tamil y telugu: útil para plataformas que publican clases grabadas y necesitan transcripciones en idiomas regionales con poca cobertura comercial.
- Accesibilidad en aplicaciones móviles: al ejecutarse con whisper.cpp en CPU, puede integrarse en apps de escritorio o dispositivos sin GPU para transcribir notas de voz en kannada o gujarati.
- Archivado y búsqueda de audio en bengalí: la transcripción permite indexar grabaciones (entrevistas, reuniones) y hacerlas buscables por texto.
- Preprocesado de datasets multilingües: investigadores que necesitan transcribir corpus de audio en malayalam o hindi pueden usar estos modelos como paso previo a anotación manual.
- Prototipado rápido de pipelines ASR: al estar en formato ggml y con licencia Apache-2.0, sirven para validar un producto de transcripción antes de invertir en modelos mayores o servicios gestionados.
- Herramientas de creación de contenido para redes: integración en editores de vídeo que generan subtítulos automáticos en varios idiomas indios a partir de una única pista de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para ejecución en CPU con whisper.cpp; los modelos Small en q8_0 ocupan del orden de cientos de MB y el Medium en q8_0 alrededor de 1 GB, aunque el tamaño exacto por fichero no se detalla en la información proporcionada.
- GPU recomendadas: no se especifican; whisper.cpp puede usar aceleración GPU opcional (CUDA, Metal, Vulkan) pero el repositorio está orientado a inferencia offline, presumiblemente en CPU.
- ¿Cabe en GPU de consumo? Sí, por el tamaño reducido de los modelos Small y Medium cuantizados, aunque no se aportan requisitos oficiales.
- Opciones de despliegue: whisper.cpp (formato nativo ggml); no se documenta compatibilidad con vLLM, TGI, Ollama u otros servidores de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| jacobsamas/shorts-studio-models | Whisper Small / Medium (cuantizado q8_0) | ventanas de 30 s | 7 idiomas indios | Apache-2.0 | ggml |
| vasista22/whisper-hindi-small (original) | ~244 M | ventanas de 30 s | hindi | Apache-2.0 | safetensors / PyTorch |
| vrclc/Whisper-small-Malayalam (original) | ~244 M | ventanas de 30 s | malayalam | Apache-2.0 | safetensors / PyTorch |
| bengaliAI/tugstugi_bengaliai-asr_whisper-medium (original) | ~769 M | ventanas de 30 s | bengalí | Apache-2.0 | safetensors / PyTorch |

La comparativa se limita a los modelos de origen, ya que no se dispone de datos de rendimiento ni de alternativas evaluadas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: es una conversión de formato; cualquier limitación de los modelos originales se hereda sin cambios.
- Solo se distribuye en cuantización q8_0; no hay versiones en fp16, q4 o q5 en el repositorio.
- La cobertura lingüística se limita a siete idiomas indios; no se documenta comportamiento en otros idiomas.
- No se han publicado métricas de calidad (WER, CER) en la información disponible, por lo que el rendimiento real es incierto.
- Riesgo de alucinación y errores de transcripción inherente a los modelos Whisper, especialmente en audio con ruido o acentos no representados en el ajuste fino.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones de los modelos originales y de Whisper (MIT) en la cadena de derivación.
- El repositorio no registra descargas ni validación comunitaria; su madurez y mantenimiento no están contrastados.
- No se documenta soporte para audio de más de 30 segundos sin segmentación previa.
- El tamaño del repo (2,4 GB) incluye los siete ficheros; la descarga individual de cada modelo no se detalla.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jacobsamas/shorts-studio-models
- Perfil del autor: https://huggingface.co/jacobsamas/models
- Modelo original hindi: https://huggingface.co/vasista22/whisper-hindi-small
- Modelo original tamil: https://huggingface.co/vasista22/whisper-tamil-small
- Modelo original telugu: https://huggingface.co/vasista22/whisper-telugu-small
- Modelo original kannada: https://huggingface.co/vasista22/whisper-kannada-small
- Modelo original gujarati: https://huggingface.co/vasista22/whisper-gujarati-small
- Modelo original malayalam: https://huggingface.co/vrclc/Whisper-small-Malayalam
- Modelo original bengalí: https://huggingface.co/bengaliAI/tugstugi_bengaliai-asr_whisper-medium
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
