# mradermacher/Qwen3-ASR-1.7B-Cantonese-HK-GGUF

## Resumen

Qwen3-ASR-1.7B-Cantonese-HK-GGUF es una versión cuantizada en formato GGUF del modelo de reconocimiento automático de voz (ASR) koelony/Qwen3-ASR-1.7B-Cantonese-HK, un ajuste fino del modelo base Qwen3-ASR de 1.700 millones de parámetros orientado específicamente al cantonés de Hong Kong (yue-HK). Lo publica mradermacher, un conocido cuantizador de la comunidad que distribuye versiones estáticas en GGUF de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo resuelve el problema de la transcripción de audio en cantonés, un idioma con escasa cobertura en los sistemas ASR comerciales, y añade soporte para code-switching entre cantonés, chino mandarín e inglés, algo habitual en el contexto de Hong Kong.

La relevancia de esta ficha radica en que el modelo original es un ajuste fino ligero (1.700 millones de parámetros) que se puede ejecutar en hardware de consumo, y esta versión GGUF lo hace accesible a herramientas como llama.cpp, Ollama o ComfyUI sin necesidad de infraestructura de GPU dedicada. El repositorio incluye cuantizaciones desde Q2_K hasta f16, además de los ficheros mmproj necesarios para el procesamiento multimodal del audio (proyector multimodal en Q8_0 y f16).

La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas, y los idiomas declarados son yue (cantonés), zh (chino) y en (inglés). La información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada: la model card del cuantizador es genérica y no aporta detalles técnicos del modelo base más allá de los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ASR; arquitectura transformer ASR multimodal, detalles no disponibles) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | yue (cantonés), zh (chino), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas) y safetensors (modelo base original) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. Por el nombre del modelo base (Qwen3-ASR) y los tags del repositorio, se trata de un modelo de reconocimiento automático de voz basado en la familia Qwen3, con un proyector multimodal (mmproj) que procesa la entrada de audio y la alinea con el espacio del modelo de lenguaje. El tamaño de 1.700 millones de parámetros y la presencia de ficheros mmproj confirman que es un modelo multimodal audio-texto, no un LLM puro.

El modelo original es un ajuste fino de koelony sobre Qwen3-ASR orientado al cantonés de Hong Kong, con soporte explícito de code-switching (yue-zh-en). No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco hay información sobre innovaciones técnicas específicas como decodificación especulativa o atención lineal. Esta versión de mradermacher es una cuantización estática del modelo original, sin cambios en la arquitectura ni en los pesos más allá de la reducción de precisión.

## Capacidades

- Reconocimiento automático de voz (ASR) en cantonés de Hong Kong (yue-HK).
- Transcripción con code-switching entre cantonés, chino mandarín e inglés.
- Procesamiento de audio mediante proyector multimodal (ficheros mmproj Q8_0 y f16).
- Compatibilidad con el ecosistema transformers (librería declarada) y con endpoints compatibles.
- Integración con ComfyUI (tag explícito en el repositorio).
- Soporte de conversación (tag "conversational").
- No se ha documentado soporte de tool calling, function calling, agentes o razonamiento multi-paso en la información disponible.
- No se ha documentado capacidad de visión ni de audio más allá de la transcripción ASR.

## Casos de uso

- Transcripción de reuniones y llamadas en cantonés: el modelo puede convertir audio de reuniones de empresa en Hong Kong a texto, incluyendo intervenciones que mezclan cantonés e inglés, un patrón habitual en entornos corporativos bilingües.
- Subtitulado automático de contenido audiovisual: para plataformas que distribuyen vídeo en cantonés, el modelo permite generar subtítulos con la ventaja de ejecutarse en hardware local gracias a las cuantizaciones Q4_K_S o Q4_K_M (1,2 GB).
- Atención al cliente en centros de contacto de Hong Kong: transcripción de grabaciones de llamadas para análisis de calidad y cumplimiento, con soporte de code-switching y despliegue en servidores sin GPU de gama alta.
- Archivado y búsqueda de audio histórico: transcripción de archivos de audio en cantonés para indexación y búsqueda textual, usando la cuantización Q8_0 (1,9 GB) cuando se prioriza la calidad.
- Accesibilidad para personas con discapacidad auditiva: generación de transcripciones en tiempo casi real en aplicaciones de escritorio o móvil, aprovechando que el modelo cabe en GPU de consumo con cuantizaciones de 4 bits.
- Integración en pipelines de ComfyUI: el tag "comfyui" sugiere su uso en flujos de trabajo de generación de contenido donde la transcripción de audio en cantonés es un paso previo, como doblaje o generación de vídeo con voz.
- Investigación lingüística sobre code-switching yue-zh-en: el modelo permite transcribir corpus de habla espontánea de Hong Kong para estudios de alternancia de código, con la ventaja de ser reproducible localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,9 GB (Q2_K) y 3,5 GB (f16) para los pesos del modelo; hay que sumar el proyector multimodal (0,5 GB en Q8_0 o 0,7 GB en f16) y el espacio para el contexto de audio.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones de 4 bits; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_S, Q4_K_M, Q5_K_M o Q6_K en tarjetas de 6-8 GB; la versión f16 requiere alrededor de 4,2 GB solo para pesos, asequible en GPUs de 8 GB.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama (si se empaqueta el GGUF), ComfyUI (tag explícito), y herramientas compatibles con GGUF; el modelo base original usa transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Nota: los cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicación según la model card; solo se ofrecen cuantizaciones estáticas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas ASR | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-Cantonese-HK-GGUF (este) | 1,72 B | no disponible | yue, zh, en | Apache 2.0 | GGUF |
| koelony/Qwen3-ASR-1.7B-Cantonese-HK (base) | 1,72 B | no disponible | yue, zh, en | Apache 2.0 | safetensors |
| Whisper large-v3 | ~1,55 B | 30 s de audio por ventana | multilingüe (incluye zh, no yue específico) | MIT | safetensors, GGUF, etc. |
| Whisper small | ~244 M | 30 s de audio por ventana | multilingüe | MIT | safetensors, GGUF, etc. |

La comparación con Whisper es orientativa: Whisper no está especializado en cantonés y su cobertura de yue es limitada, mientras que este modelo está ajustado específicamente para yue-HK con code-switching. No se dispone de datos de benchmarks comparativos en la información proporcionada para cuantificar la diferencia de rendimiento.

## Limitaciones y advertencias

- La información pública sobre el modelo base es muy escasa: no hay datos de benchmarks, composición del dataset ni detalles de entrenamiento, lo que dificulta evaluar su calidad real frente a alternativas.
- Riesgo de alucinación en la transcripción: como todo modelo ASR generativo, puede producir texto plausible que no corresponde al audio, especialmente con ruido de fondo o acentos no representados en el entrenamiento.
- Cobertura limitada a tres idiomas (yue, zh, en); no es un modelo ASR multilingüe general.
- El ajuste fino está orientado al cantonés de Hong Kong; el rendimiento en otras variantes de cantonés (Guangdong, Macao) no está documentado.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S, Q3_K_M) pueden degradar notablemente la calidad de transcripción; se recomienda Q4_K_M o superior para producción.
- No hay cuantizaciones ponderadas/imatrix disponibles según la model card, lo que limita la optimización de calidad por tamaño.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base original puede tener condiciones adicionales no reflejadas en la información disponible; conviene verificar la licencia de koelony/Qwen3-ASR-1.7B-Cantonese-HK.
- El repositorio tiene 17 GB por las múltiples cuantizaciones; la descarga completa no es necesaria, pero conviene seleccionar solo los ficheros necesarios.
- Solo 1 like y 649 descargas en el momento de la consulta: es un modelo con poca validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3-ASR-1.7B-Cantonese-HK-GGUF
- Modelo base: https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3-ASR-1.7B-Cantonese-HK-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
