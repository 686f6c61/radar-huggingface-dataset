# loom-ai-org/granite-speech-4.0-1b-loom

## Resumen

El modelo `loom-ai-org/granite-speech-4.0-1b-loom` es una exportación al formato GGUF del modelo `ibm-granite/granite-4.0-1b-speech` de IBM, realizada por el equipo de loom-ai-org para su ecosistema loom.cpp. Se trata de un modelo de lenguaje de voz (speech-language) que combina reconocimiento automático del habla (ASR) y traducción automática del habla (AST) en seis idiomas: inglés, francés, alemán, español, portugués y japonés. Con 2.187.801.595 parámetros (aproximadamente 2,18 mil millones), el modelo está diseñado para transcribir audio a texto y traducir voz entre idiomas, manteniendo los pesos originales de IBM sin modificaciones.

La relevancia de esta versión radica en su empaquetado en un único archivo GGUF autodescriptivo que incluye las topologías del grafo, el tokenizador y el script de control (driver). Esto permite ejecutar el modelo con loom.cpp en CPU o GPU con un consumo de recursos reducido, facilitando su despliegue en entornos de producción o en dispositivos con limitaciones de memoria. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, lo que lo convierte en una opción atractiva para integraciones de voz en aplicaciones empresariales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la información disponible; modelo de speech-language (ASR + AST) basado en Granite 4.0 de IBM |
| Parametros totales | 2.187.801.595 (2,18 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se especifican variantes; el archivo es GGUF (posiblemente con cuantizaciones estándar como Q4, Q8, etc., pero no se documentan) |
| Idiomas soportados | Inglés, francés, alemán, español, portugués y japonés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (loom.cpp) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo original de IBM. Se sabe que es un modelo de speech-language que procesa audio de entrada (mono, 16 kHz) y produce texto, cubriendo tareas de ASR (transcripción) y AST (traducción de voz). El modelo base `ibm-granite/granite-4.0-1b-speech` forma parte de la familia Granite 4.0 de IBM, que incluye modelos de lenguaje y multimodales, pero no se especifican los detalles de su arquitectura (por ejemplo, si es un transformer encoder-decoder, si usa atención lineal, etc.) ni los datos de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO).

La exportación a loom.cpp no modifica los pesos; únicamente reempaqueta los parámetros en un formato GGUF que incluye metadatos sobre la topología del grafo y un driver ejecutable. Esto permite que el runtime de loom.cpp cargue el modelo y ejecute la inferencia sin necesidad de un framework adicional.

## Capacidades

- Reconocimiento automático del habla (ASR): transcribe audio en los seis idiomas soportados.
- Traducción automática del habla (AST): traduce voz de un idioma a otro (por ejemplo, de inglés a español) manteniendo el contenido semántico.
- Generación de marcas de tiempo (timestamps): el modelo puede emitir segmentos con tiempos de inicio y fin, útil para subtitulado o alineación.
- Manejo de audio largo: el runtime de loom.cpp aplica ventanas automáticas para archivos extensos, y si el modelo emite timestamps, se reposiciona al cierre del último segmento en lugar de cortar con un stride fijo.
- Soporte multilingüe: cubre los idiomas en, fr, de, es, pt y ja, con etiqueta "multilingüe" en el modelo original.
- Integración con loom-py: API de alto nivel (`model.speech2text.infer`) que simplifica la inferencia, además de acceso al driver subyacente para ajustes avanzados.

## Casos de uso

- Transcripción de reuniones y conferencias: el modelo puede procesar grabaciones largas (con ventanas automáticas) y generar transcripciones con timestamps, facilitando la búsqueda de momentos concretos. Su soporte multilingüe permite transcribir reuniones en varios idiomas.
- Subtitulado automático de vídeos: gracias a los timestamps y a la capacidad de ASR, se puede generar subtítulos en los seis idiomas soportados para plataformas de vídeo, reduciendo el coste de subtitulado manual.
- Traducción de voz en tiempo real: con AST, el modelo puede traducir conversaciones habladas (por ejemplo, en atención al cliente) entre pares de idiomas, mejorando la comunicación internacional.
- Asistentes de voz para accesibilidad: personas con discapacidad auditiva pueden beneficiarse de transcripciones en tiempo real de conversaciones o contenido multimedia, usando el modelo en dispositivos locales.
- Análisis de llamadas en centros de contacto: transcribir y traducir llamadas de soporte para extraer métricas de calidad, detectar problemas recurrentes o cumplir normativas de registro.
- Creación de contenido educativo: generar transcripciones y traducciones de clases, podcasts o webinars para ampliar el alcance a audiencias no nativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como WER (Word Error Rate), BLEU, MMLU o HumanEval para este modelo ni para su versión base.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,18 mil millones de parámetros, en FP16 se necesitan aproximadamente 4,4 GB de VRAM (2,18 B × 2 bytes). Con cuantización típica Q4_K_M (~1,2 GB) o Q8 (~2,5 GB) el consumo se reduce significativamente, aunque no se documentan las variantes disponibles en este repositorio.
- GPU recomendadas: tarjetas con al menos 6 GB de VRAM para FP16 (por ejemplo, RTX 2060, RTX 3060, RTX 4060). Para cuantizaciones ligeras, GPUs con 2-4 GB podrían ser suficientes (GTX 1650, RTX 3050). En entornos profesionales, A100 o H100 no son necesarias dado el tamaño moderado del modelo.
- Ejecución en CPU: al ser GGUF, puede ejecutarse en CPU con loom.cpp, aunque la latencia será mayor. Se recomienda para tareas por lotes o no interactivas.
- Opciones de despliegue: loom.cpp (motor de inferencia), loom-py (API Python), y potencialmente integración con servidores compatibles con GGUF (aunque loom.cpp tiene su propio stack). No se menciona compatibilidad con vLLM u Ollama.
- Latencia y throughput: no disponibles en la documentación. Dependerá del hardware y de la cuantización utilizada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente con alternativas. Sin embargo, se puede establecer una comparación cualitativa con otros modelos ASR/AST de tamaño similar:

| Modelo | Parámetros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| granite-speech-4.0-1b-loom | 2,18 B | 6 (en, fr, de, es, pt, ja) | Apache-2.0 | GGUF (loom.cpp) | ASR + AST, con timestamps |
| OpenAI Whisper large-v3 | 1,55 B | 99+ | MIT | PyTorch, CT2, GGUF | ASR y traducción, muy extendido |
| NVIDIA Canary-1b | 1 B | 4 (en, es, fr, de) | CC-BY-4.0 | PyTorch, ONNX | ASR + AST, orientado a streaming |

La comparativa es orientativa; no se han ejecutado benchmarks propios. La ventaja del modelo loom es su formato GGUF autocontenido y su licencia Apache-2.0, que facilita el despliegue comercial sin restricciones.

## Limitaciones y advertencias

- No se especifican sesgos conocidos, pero al ser un modelo entrenado por IBM, podría heredar sesgos de los datos de entrenamiento (no documentados).
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar transcripciones o traducciones incorrectas, especialmente con audio de baja calidad o acentos no representados.
- Limitación de idiomas: solo cubre seis idiomas; no soporta otros como italiano, chino o árabe.
- Longitud de contexto no documentada: aunque el runtime maneja ventanas, no se conoce el límite máximo de tokens de contexto del modelo, lo que podría afectar a segmentos muy largos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero no se especifican patentes asociadas al modelo base.
- Dependencia del ecosistema loom: el formato GGUF es específico de loom.cpp; no es compatible con llama.cpp ni otros runtimes estándar, lo que limita la portabilidad.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad frente a alternativas como Whisper.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/loom-ai-org/granite-speech-4.0-1b-loom)
- [Modelo base de IBM](https://huggingface.co/ibm-granite/granite-4.0-1b-speech)
- [Repositorio loom.cpp](https://github.com/loom-ai-org/loom.cpp)
- [Repositorio loom-exporter](https://github.com/loom-ai-org/loom-exporter)
- [Repositorio loom-py](https://github.com/loom-ai-org/loom-py)
