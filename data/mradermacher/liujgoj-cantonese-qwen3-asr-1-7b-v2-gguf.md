# mradermacher/Liujgoj-Cantonese-Qwen3-ASR-1.7B-V2-GGUF

## Resumen

Liujgoj-Cantonese-Qwen3-ASR-1.7B-V2-GGUF es la versión cuantizada en formato GGUF del modelo de reconocimiento automático de voz (ASR) Yvthyvq/Liujgoj-Cantonese-Qwen3-ASR-1.7B-V2, un ajuste fino especializado en cantonés (yue) construido sobre la familia Qwen3-ASR de Alibaba. La cuantización la publica mradermacher, un autor habitual de conversiones GGUF para llama.cpp, y el modelo conserva la licencia Apache 2.0 del original. El resultado es un modelo de 1.720.574.976 parámetros (aproximadamente 1,7B) pensado para transcripción de audio a texto en chino y cantonés, con soporte de salida en romaji según las etiquetas del autor.

El interés práctico de esta ficha reside en que permite ejecutar un ASR especializado en cantonés en hardware de consumo mediante llama.cpp u otros runners compatibles con GGUF, algo imposible con los pesos originales en transformers si no se dispone de GPU dedicada. El modelo incluye además un componente multimodal separado (mmproj) necesario para procesar el audio, lo que condiciona el despliegue: no basta con cargar el archivo del modelo, hay que cargar también el proyector multimodal.

La información pública disponible es escasa: la model card del repositorio GGUF es una plantilla estándar de mradermacher que no documenta el dataset, el proceso de entrenamiento ni resultados de evaluación. Esta ficha refleja únicamente lo verificable en los metadatos y en la card, y marca explícitamente como no disponible todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ASR, arquitectura transformer multimodal audio-texto; detalles no publicados en la card) |
| Parametros totales | 1.720.574.976 (1,7B) |
| Parametros activos | no aplica (no es MoE según los metadatos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-f16 y mmproj-Q8_0 para el proyector multimodal |
| Idiomas soportados | zh (chino), yue (cantonés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Qwen3-ASR, la familia de reconocimiento de voz de Alibaba, con 1,72B de parámetros. La arquitectura exacta (encoder de audio, proyector multimodal y decoder de lenguaje) no está documentada en la model card disponible; lo que sí confirman los metadatos es la presencia de un componente multimodal separado (mmproj), típico de los modelos audio-texto que combinan un encoder acústico con un decoder de lenguaje. La especialización declarada es el cantonés, con el chino como idioma secundario, y las etiquetas mencionan salida en romaji.

No se ha publicado información sobre el volumen de datos de entrenamiento, la composición del dataset (la card indica únicamente `dataset: custom`), ni si hubo etapas de RLHF, DPO o ajuste supervisado más allá del fine-tuning declarado. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). La versión GGUF es una conversión estática de los pesos originales realizada por mradermacher; la card indica que no hay cuantizaciones con imatrix disponibles en el momento de la publicación.

## Capacidades

- Reconocimiento automático de voz (ASR) para audio en cantonés (yue) y chino (zh).
- Transcripción de audio a texto, con soporte declarado de salida en romaji según las etiquetas del autor.
- Procesamiento multimodal audio-texto mediante el proyector mmproj incluido en el repositorio.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) y con el pipeline `automatic-speech-recognition` de transformers para los pesos originales.
- Ejecución en llama.cpp y runners compatibles con GGUF gracias a la cuantización.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de audio en cantonés para subtitulado: el modelo convierte grabaciones de voz en texto cantonés, adecuado para generar subtítulos de vídeos o podcasts dirigidos a audiencias de Hong Kong y Guangdong.
- Archivado y búsqueda de reuniones: transcripción de reuniones en cantonés para indexar el contenido y permitir búsqueda textual posterior, aprovechando que el modelo cabe en hardware modesto.
- Atención al cliente en cantonés: conversión de llamadas o notas de voz de clientes a texto para su análisis, clasificación y registro en sistemas CRM.
- Investigación lingüística del cantonés: generación de transcripciones a gran escala para corpus de estudio fonético y léxico, con la ventaja de ejecutarse localmente sin enviar audio a servicios en la nube.
- Prototipado en dispositivos de borde: al ocupar entre 0,9 y 1,9 GB según cuantización, puede desplegarse en mini-PC o portátiles sin GPU dedicada para aplicaciones de dictado o asistentes de voz.
- Evaluación comparativa de ASR: servir como referencia cuantizada para comparar la calidad de transcripción en cantonés frente a modelos multilingües genéricos en entornos con recursos limitados.
- Procesamiento por lotes de archivos de audio: integración en pipelines de transcripción masiva mediante llama.cpp, con la cuantización Q4_K_M o Q5_K_M como compromiso entre tamaño y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB con Q4_K_M, 1,4 GB con Q5_K_M, 1,9 GB con Q8_0 y 3,5 GB con f16, a los que hay que sumar 0,5-0,7 GB del proyector mmproj.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente en cuantizaciones bajas; para f16 se recomienda al menos 6 GB. No se requieren A100 ni H100.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama y otros runners compatibles con GGUF; los pesos originales en safetensors requieren transformers.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Liujgoj-Cantonese-Qwen3-ASR-1.7B-V2-GGUF | 1,7B | no disponible | zh, yue | apache-2.0 | GGUF |
| Yvthyvq/Liujgoj-Cantonese-Qwen3-ASR-1.7B-V2 (original) | 1,7B | no disponible | zh, yue | apache-2.0 | safetensors |
| Whisper large-v3 (referencia ASR multilingüe) | 1,55B | 30 s de audio por ventana | multilingüe (incluye zh, yue parcial) | MIT | safetensors, GGUF |
| Qwen3-ASR base (referencia de la familia) | no disponible | no disponible | multilingüe | no disponible | safetensors |

La comparación con Whisper large-v3 es orientativa: es el ASR multilingüe de referencia, pero su cobertura del cantonés es limitada frente a un ajuste fino específico. No se dispone de datos de calidad comparativa entre ambos en la información proporcionada.

## Limitaciones y advertencias

- No hay datos publicados sobre sesgos del modelo; al ser un ajuste fino sobre un dataset personalizado no documentado, el riesgo de sesgo dialectal o de dominio es desconocido.
- Riesgo de alucinación en la transcripción: como todo modelo de voz a texto, puede generar texto plausible que no corresponde al audio, especialmente con ruido de fondo o acentos no representados en el entrenamiento.
- Cobertura limitada a chino y cantonés; no se garantiza un rendimiento aceptable en otros idiomas.
- La longitud de contexto y la duración máxima de audio procesable no están documentadas, lo que dificulta planificar el troceado de audios largos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset de ajuste fino no están documentados en cuanto a procedencia, lo que conviene verificar antes de un despliegue en producción.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) pueden degradar notablemente la calidad de transcripción; se recomienda Q4_K_M o superior para uso real.
- Es necesario cargar el archivo mmproj junto con el modelo; omitirlo impide procesar el audio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de su calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Liujgoj-Cantonese-Qwen3-ASR-1.7B-V2-GGUF
- Modelo base: https://huggingface.co/Yvthyvq/Liujgoj-Cantonese-Qwen3-ASR-1.7B-V2
- Página de descargas del autor: https://hf.tst.eu/model#Liujgoj-Cantonese-Qwen3-ASR-1.7B-V2-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Modelo relacionado (Cantonese-Qwen3-8B-Instruct): https://huggingface.co/mradermacher/Liujgoj-Cantonese-Qwen3-8B-Instruct-i1-GGUF
- Ficha de la versión V1: https://free2aitools.com/model/mradermacher/liujgoj-cantonese-qwen3-asr-1.7b-v1-gguf
