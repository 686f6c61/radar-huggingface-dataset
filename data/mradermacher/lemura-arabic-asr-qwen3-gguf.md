# mradermacher/lemura-arabic-asr-qwen3-GGUF

## Resumen

El modelo `mradermacher/lemura-arabic-asr-qwen3-GGUF` es una versión cuantizada en formato GGUF del modelo `lemuralabs/lemura-arabic-asr-qwen3`, un sistema de reconocimiento automático del habla (ASR) para árabe desarrollado por Lemura Labs. Se trata de un modelo de audio-LLM basado en la arquitectura Qwen3, diseñado para transcribir audio en árabe estándar y dialectal (golfo, egipcio, levantino, magrebí y darija). Con aproximadamente 1.720 millones de parámetros, el modelo original se ha convertido a GGUF por mradermacher para permitir su ejecución eficiente en hardware de consumo, incluyendo CPU y GPU con poca memoria.

La relevancia de esta versión cuantizada radica en que facilita el despliegue de ASR en árabe en entornos con recursos limitados, manteniendo una calidad razonable según el nivel de cuantización elegido. El repositorio incluye múltiples archivos GGUF con distintos niveles de compresión, desde Q2_K (0.9 GB) hasta f16 (3.5 GB), además de los proyectores multimodales (mmproj) necesarios para el procesamiento de audio. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM basado en Qwen3 (ASR) |
| Parametros totales | 1.720.574.976 (aprox. 1.72B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Arabe (estandar y dialectal: golfo, egipcio, levantino, magrebi, darija) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base `lemuralabs/lemura-arabic-asr-qwen3` es un modelo de audio-LLM que combina un codificador de audio con un decodificador de lenguaje basado en la familia Qwen3. Esta arquitectura permite procesar señales de audio directamente y generar transcripciones de texto, así como potencialmente mantener interacciones conversacionales multimodales. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO.

Los datos de entrenamiento declarados en la model card incluyen los conjuntos `MohamedRashad/SADA22`, `MohamedRashad/MASC-Arabic`, `google/fleurs` y `fsicoli/common_voice_17_0`, todos ellos orientados a audio en árabe. La cuantización GGUF realizada por mradermacher es estática (sin imatrix) y no modifica la arquitectura subyacente, solo reduce la precisión de los pesos para optimizar el uso de memoria y velocidad de inferencia.

## Capacidades

- Transcripcion de audio en arabe estandar y dialectal (golfo, egipcio, levantino, magrebi, darija).
- Reconocimiento automatico del habla (ASR) a partir de archivos de audio o flujos en tiempo real.
- Procesamiento de audio como entrada multimodal, gracias a los proyectores mmproj incluidos.
- Generacion de texto en arabe a partir de audio, con potencial para tareas de comprension auditiva.
- Soporte de interaccion conversacional (etiquetado como "conversational" en el repositorio).
- Compatible con el ecosistema GGUF, lo que permite su uso con herramientas como llama.cpp, Ollama o LM Studio.

## Casos de uso

- Transcripcion de reuniones y conferencias en arabe: el modelo puede convertir grabaciones de audio en texto con alta fidelidad, incluyendo variantes dialectales, lo que facilita la generacion de actas y busquedas posteriores.
- Subtitulado automatico de videos en arabe: al procesar pistas de audio, se pueden generar subtitulos en tiempo real o post-produccion para plataformas de video, mejorando la accesibilidad.
- Atencion al cliente automatizada: integrado en sistemas de IVR o chatbots, puede transcribir las consultas de los usuarios en arabe y derivarlas a un sistema de procesamiento de lenguaje natural para resolver incidencias.
- Asistentes de voz para dispositivos moviles: gracias a su tamano compacto (1.72B parametros) y las cuantizaciones ligeras, puede ejecutarse en smartphones o dispositivos edge para comandos de voz en arabe.
- Analisis de llamadas de telefono en centros de contacto: permite transcribir conversaciones para control de calidad, deteccion de intenciones o cumplimiento normativo, con soporte de dialectos regionales.
- Herramientas de accesibilidad para personas con discapacidad auditiva: convierte audio en texto en tiempo real, facilitando la comunicacion en entornos educativos o laborales.
- Investigacion linguistica y dialectologia: al manejar multiples variantes del arabe, sirve para analizar corpus orales y estudiar diferencias foneticas entre regiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos comparativos de WER (Word Error Rate) u otras metricas de ASR para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: segun la cuantizacion elegida, el modelo requiere entre 1 GB y 4 GB de memoria. Por ejemplo, Q4_K_M (1.2 GB) puede ejecutarse en GPUs con 2 GB de VRAM, mientras que f16 (3.5 GB) necesita al menos 4 GB.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA o Vulkan, como NVIDIA GTX 1060 (6GB) o superior, o incluso iGPUs con suficiente memoria compartida. Para CPU, se recomienda al menos 8 GB de RAM.
- Compatibilidad con hardware de consumo: si, las cuantizaciones Q2_K a Q5_K_M caben en GPUs de gama media (4-6 GB VRAM) y tambien pueden ejecutarse en CPU pura con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier runtime compatible con GGUF. Tambien se puede usar vLLM si se convierte a otro formato, aunque no es el flujo principal.
- Latencia y throughput: no se dispone de datos medidos. En general, las cuantizaciones Q4_K_M y Q5_K_M ofrecen un buen equilibrio entre velocidad y calidad, con latencias de pocos segundos para audios cortos en GPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (ASR arabe con arquitectura audio-LLM) en los datos proporcionados. Se recomienda consultar el modelo base `lemuralabs/lemura-arabic-asr-qwen3` para posibles alternativas.

## Limitaciones y advertencias

- El modelo esta especializado en arabe; no soporta otros idiomas de forma nativa.
- La cuantizacion puede degradar la precision de la transcripcion, especialmente en niveles bajos como Q2_K o Q3_K. Se recomienda usar Q4_K_M o superior para produccion.
- No se han publicado evaluaciones formales de sesgos o alucinaciones; como todo modelo de lenguaje, puede generar errores en contextos ambiguos o con ruido de audio.
- La longitud de contexto no esta documentada, lo que puede limitar el procesamiento de audios muy largos en una sola pasada.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base puede tener restricciones adicionales no declaradas en esta ficha.
- El repositorio no incluye el codigo de entrenamiento ni los pesos originales en safetensors; solo las cuantizaciones GGUF.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/lemura-arabic-asr-qwen3-GGUF
- Modelo base: https://huggingface.co/lemuralabs/lemura-arabic-asr-qwen3
- Pagina de mradermacher para solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
