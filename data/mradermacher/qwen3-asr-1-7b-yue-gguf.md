# mradermacher/Qwen3-ASR-1.7B-Yue-GGUF

## Resumen

Qwen3-ASR-1.7B-Yue-GGUF es la versión cuantizada en formato GGUF del modelo de reconocimiento automático del habla (ASR) Qwen3-ASR-1.7B-Yue, desarrollado originalmente por el usuario hon9kon9ize a partir de la familia Qwen3-ASR de Alibaba. El modelo está especializado en el reconocimiento de cantonés (yue), con soporte adicional para chino mandarín (zh) e inglés (en), e incluye capacidad de code-switching entre estos idiomas, una situación muy habitual en el habla real de Cantón, Hong Kong y Macao.

La versión que nos ocupa ha sido generada por mradermacher, un conocido cuantizador de la comunidad open source, y ofrece un abanico de cuantizaciones estáticas que van desde Q2_K (1,0 GB) hasta f16 (4,2 GB), además de los ficheros mmproj necesarios para procesar la entrada de audio. El modelo base cuenta con 2.031.739.904 parámetros según los safetensors publicados, lo que lo sitúa en la gama de 2B parámetros, un tamaño que permite despliegue en hardware de consumo.

La relevancia de esta ficha radica en que el cantonés es un idioma con relativamente pocos recursos en el ecosistema ASR open source, y disponer de una alternativa Apache 2.0 cuantizada en GGUF facilita su integración en aplicaciones locales, pipelines de subtitulado y sistemas de transcripción sin depender de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR basado en la familia Qwen3-ASR; no se detalla en la informacion proporcionada) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | yue (cantonés), zh (chino), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas) y safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en la documentación proporcionada. El modelo pertenece a la familia Qwen3-ASR, lo que sugiere un encoder de audio acoplado a un decoder de tipo transformer, pero no se confirman detalles como el número de capas, la dimensión oculta o el mecanismo de atención. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La model card del repositorio cuantizado se limita a indicar que se trata de cuantizaciones estáticas del modelo hon9kon9ize/Qwen3-ASR-1.7B-Yue, generadas con quantize_version 2 y output_tensor_quantised 1. No se mencionan innovaciones técnicas específicas como decodificación especulativa o atención lineal. La etiqueta "code-switching" en los tags sugiere que el modelo fue entrenado o ajustado para manejar cambios de idioma dentro de una misma locución, pero no se aportan métricas ni detalles del corpus utilizado.

## Capacidades

- Reconocimiento automático del habla en cantonés (yue), con soporte para chino mandarín (zh) e inglés (en).
- Manejo de code-switching entre cantonés, mandarín e inglés, según los tags del repositorio.
- Procesamiento de entrada de audio mediante los ficheros mmproj (Q8_0 o f16), necesarios para la parte multimodal.
- Inferencia local mediante llama.cpp y herramientas compatibles con GGUF.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-step; es un modelo ASR, no un LLM conversacional.
- No se documentan capacidades de visión, audio generativo ni thinking mode.
- El tag "conversational" aparece en los metadatos, pero no se detalla su alcance.

## Casos de uso

- Subtitulado automático de contenido en cantonés: el modelo puede transcribir audio de vídeos, podcasts o retransmisiones para generar subtítulos en yue, con la ventaja de ejecutarse localmente gracias a las cuantizaciones Q4_K_M (1,4 GB) o Q5_K_M (1,6 GB).
- Transcripción de reuniones bilingües en Hong Kong: el soporte de code-switching permite manejar conversaciones que alternan cantonés e inglés sin segmentar manualmente el audio por idioma.
- Atención al cliente en centros de llamadas: integración en pipelines de ASR para transcribir llamadas en cantonés y alimentar sistemas de análisis de calidad o búsqueda de texto completo.
- Accesibilidad para personas con discapacidad auditiva: generación de transcripciones en tiempo casi real en aplicaciones de escritorio o móvil, usando la cuantización Q4_K_S (1,3 GB) para minimizar el consumo de recursos.
- Archivado y búsqueda de material audiovisual: transcripción masiva de archivos de audio en cantonés para indexación y recuperación posterior, aprovechando el formato GGUF para despliegue en servidores sin GPU dedicada.
- Investigación lingüística sobre el cantonés: generación de corpus transcritos para estudios de fonética, sociolingüística o análisis de code-switching, con la licencia Apache 2.0 facilitando la redistribución de resultados.
- Prototipado de asistentes de voz locales: uso del modelo como componente ASR en sistemas de voz embebidos o de escritorio, con la cuantización Q2_K (1,0 GB) para entornos con memoria muy limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0 GB con Q2_K, 1,3-1,4 GB con Q4_K_S/Q4_K_M, 1,8 GB con Q6_K, 2,3 GB con Q8_0 y 4,2 GB con f16. Hay que sumar el espacio del fichero mmproj (0,5 GB en Q8_0 o 0,7 GB en f16).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para las cuantizaciones bajas; para f16 más mmproj f16 se recomienda al menos 6 GB. No se especifican modelos concretos como A100, H100 o RTX 4090 en la información proporcionada.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB de VRAM como GTX 1660, RTX 3050, RTX 4060 o superiores, usando cuantizaciones Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF (Ollama, LM Studio, entre otras). El repositorio indica compatibilidad con transformers para el modelo base, pero las cuantizaciones GGUF están pensadas para llama.cpp.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-Yue (este) | 2,03 B | yue, zh, en | no disponible | Apache 2.0 | GGUF, safetensors |
| Whisper large-v3 | no disponible en la informacion | multilingue (incluye zh, no yue especifico) | no disponible | MIT (segun conocimiento general, no verificado en esta busqueda) | no disponible |
| Whisper small | no disponible en la informacion | multilingue | no disponible | MIT (segun conocimiento general, no verificado en esta busqueda) | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible. La principal ventaja diferencial de este modelo es su especialización en cantonés con code-switching, frente a modelos multilingües genéricos que suelen tener un rendimiento inferior en yue.

## Limitaciones y advertencias

- El modelo está especializado en cantonés, chino e inglés; no se documenta soporte para otros idiomas, por lo que su uso fuera de estos tres puede producir transcripciones incorrectas.
- No se han publicado métricas de WER (word error rate) ni evaluaciones objetivas, lo que impide estimar su precisión real frente a alternativas.
- Riesgo de alucinación inherente a los modelos ASR: pueden generar texto plausible en segmentos de audio ruidosos o ininteligibles.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) pueden degradar la calidad de transcripción; se recomienda Q4_K_M o superior para producción.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original y de los datos de entrenamiento, no detalladas en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- No se documentan sesgos específicos, pero al estar entrenado probablemente con datos de una región concreta, puede tener sesgos dialectales dentro del propio cantonés.
- El tag "conversational" en los metadatos no está respaldado por documentación sobre capacidades conversacionales; es un modelo ASR, no un chatbot.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3-ASR-1.7B-Yue-GGUF
- Modelo base: https://huggingface.co/hon9kon9ize/Qwen3-ASR-1.7B-Yue
- Página de overview de cuantizaciones: https://hf.tst.eu/model#Qwen3-ASR-1.7B-Yue-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
