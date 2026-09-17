# loom-ai-org/sensevoice-small-loom

## Resumen

sensevoice-small-loom es un export del modelo de reconocimiento automático del habla (ASR) SenseVoice Small, desarrollado originalmente por Alibaba dentro de la familia FunAudioLLM, y reempaquetado por loom-ai-org en el formato GGUF del runtime loom.cpp. No se trata de un modelo nuevo: los pesos son los mismos que los de FunAudioLLM/SenseVoiceSmall, sin modificar. El repositorio solo reorganiza los parámetros en un único fichero GGUF autodescriptivo que incorpora las topologías de grafo, el tokenizer (si procede) y el script de driver necesarios para su ejecución.

El modelo tiene 234.493.019 parámetros (aproximadamente 234 M) y un tamaño de repositorio de 0,9 GB. Cubre cinco idiomas: chino (zh), inglés (en), japonés (ja), coreano (ko) y cantonés (yue). Su tarea es la transcripción de audio mono a 16 kHz; la información disponible no declara capacidades de traducción, diarización ni otras tareas.

Su relevancia es fundamentalmente de infraestructura: ilustra el flujo de exportación de loom.cpp para modelos ASR y permite ejecutar SenseVoice Small mediante la librería loom-py-rt sin depender del stack original de FunASR. Es un repositorio reciente (creado el 17 de septiembre de 2026), sin descargas ni valoraciones, y con la licencia heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (export del modelo ASR FunAudioLLM/SenseVoiceSmall; la información proporcionada no describe la topología interna) |
| Parametros totales | 234.493.019 (~234 M) |
| Longitud de contexto | no aplicable / no disponible (modelo ASR; la información no especifica la ventana de audio) |
| Tipos de cuantizacion | no disponible (se distribuye un único fichero GGUF; no se listan variantes de cuantización) |
| Idiomas soportados | zh, en, ja, ko, yue |
| Licencia | other (model-license de FunASR, heredada del modelo base FunAudioLLM/SenseVoiceSmall) |
| Formato de pesos | GGUF (formato loom.cpp); los pesos originales están en safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo ni su procedimiento de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas). Lo único documentado es que se trata de un export de FunAudioLLM/SenseVoiceSmall: los pesos son idénticos a los del modelo base y loom-exporter se limita a empaquetarlos en el formato GGUF de loom.cpp, que encapsula un grafo autodescriptivo junto con el tokenizer y un script de driver.

Tampoco se documenta ninguna innovación técnica propia del export más allá del propio mecanismo de empaquetado. El comportamiento de decodificación sí está descrito: el modelo decodifica en el idioma para el que fue entrenado y no admite el argumento `language=`, y no emite tokens de timestamp, por lo que `result.timestamped` es `False` y `segments` contiene un único intervalo que cubre el audio completo.

## Capacidades

- Reconocimiento automático del habla (ASR) sobre audio mono en formato lista de floats a 16 kHz.
- Transcripción multilingüe en cinco idiomas: chino, inglés, japonés, coreano y cantonés.
- API de alto nivel `model.speech2text.infer(audio, timestamps=True)`, que aplica el ventaneo, muestreo y ensamblado requeridos por el modelo.
- Acceso de bajo nivel mediante `model.infer(...)`, que pasa los argumentos directamente al driver embebido en el GGUF; `model.driver_source` imprime dicho driver y documenta todos los argumentos aceptados.
- No emite tokens de timestamp: los segmentos devueltos no representan límites temporales elegidos por el modelo.
- No acepta el argumento `language=`: si se pasa, se emite un aviso y se ignora.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio bidireccional ni modo de razonamiento.
- No se documentan capacidades de traducción, diarización de hablantes ni detección de idioma.

## Casos de uso

- Transcripción de reuniones y notas de voz en entornos donde conviven chino, inglés, japonés, coreano o cantonés: el modelo convierte el audio mono a 16 kHz en texto dentro del runtime loom.cpp, lo que simplifica el despliegue al no requerir el stack original de FunASR.
- Preprocesado de pipelines voz-a-LLM: la salida de `speech2text` puede alimentar un LLM posterior para construir asistentes conversacionales, resúmenes de llamadas o extracción de entidades, sin necesidad de un componente ASR separado en otro framework.
- Indexación y búsqueda de archivos de audio en repositorios empresariales: al transcribir grabaciones históricas, el texto resultante se puede indexar en un motor de búsqueda para recuperación semántica.
- Subtitulado aproximado de contenido multimedia: el modelo genera transcripciones utilizables para subtítulos, con la advertencia de que no emite timestamps reales y los segmentos no deben tratarse como fronteras temporales.
- Investigación en ASR ligero: sus ~234 M de parámetros lo convierten en una referencia práctica para experimentos de transcripción en entornos con recursos limitados, comparando calidad y coste frente a modelos mayores.
- Integración en herramientas de accesibilidad: transcripción en tiempo casi real de audio en las cinco lenguas soportadas para generar texto de apoyo a personas con discapacidad auditiva.
- Despliegue en el borde (edge) o en portátiles: el tamaño del modelo permite inferencia en CPU o en GPU de gama media, útil para aplicaciones locales que no pueden enviar audio a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del número de parámetros (234.493.019) y expresada como estimación orientativa:
  - fp32: aproximadamente 0,94 GB.
  - fp16/bf16: aproximadamente 0,47 GB.
  - int8: aproximadamente 0,23 GB.
  - El fichero GGUF del repositorio ocupa 0,9 GB (incluye grafo, driver y metadatos, no solo pesos).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre es suficiente en la práctica; no se documentan modelos concretos. Una RTX 3060, RTX 4090, A100 o H100 sobredimensionan ampliamente el requisito.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna; también es viable la inferencia en CPU dado el tamaño del modelo.
- Opciones de despliegue: runtime oficial loom.cpp con la librería loom-py / loom-py-rt (`pip install -U "loom-py-rt[hub]"`). La información no confirma compatibilidad con otros runtimes GGUF (vLLM, llama.cpp, Ollama, TGI), ya que el export embebe grafo y driver propios.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| sensevoice-small-loom (este repositorio) | 234.493.019 | zh, en, ja, ko, yue | other (FunASR) | GGUF (loom.cpp) | HuggingFace |
| FunAudioLLM/SenseVoiceSmall (modelo base) | no disponible en la informacion proporcionada (mismos pesos) | zh, en, ja, ko, yue | other (FunASR) | safetensors | HuggingFace |
| Whisper small (OpenAI) | dato externo no incluido en la informacion proporcionada | dato externo no incluido en la informacion proporcionada | dato externo no incluido en la informacion proporcionada | dato externo no incluido en la informacion proporcionada | dato externo no incluido en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo (WER, latencia o throughput) en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia "other" heredada del MODEL_LICENSE de FunASR: es imprescindible revisar sus términos antes de cualquier uso comercial, ya que puede restringirlo.
- El modelo no emite tokens de timestamp. `result.timestamped` es `False` y `segments` contiene un único intervalo que cubre el clip completo; no deben interpretarse sus fronteras como límites temporales reales.
- No admite control de idioma: decodifica en el idioma para el que fue entrenado y el argumento `language=` se ignora con un aviso. No es adecuado como traductor ni como selector explícito de idioma.
- Cobertura lingüística limitada a zh, en, ja, ko y yue; no hay soporte declarado de español ni de otras lenguas.
- No se documentan sesgos conocidos, comportamiento ante audio ruidoso ni tasas de alucinación.
- Repositorio con cero descargas y cero valoraciones, creado y actualizado en septiembre de 2026: no hay evidencia de mantenimiento continuado ni de validación por parte de la comunidad.
- Dependencia del runtime loom.cpp/loom-py: al ser un GGUF autodescriptivo con grafo y driver embebidos, puede no ser directamente ejecutable en otros motores GGUF genéricos.
- El tamaño del repositorio (0,9 GB) incluye el grafo, el driver y los metadatos, además de los pesos, por lo que el consumo real de memoria puede diferir de la estimación basada solo en el número de parámetros.
- La información disponible no detalla el preprocesado de audio admitido más allá de audio mono a 16 kHz, por lo que formatos, canales o frecuencias distintas requerirán conversión previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/loom-ai-org/sensevoice-small-loom
- Modelo base: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Repositorio loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Repositorio loom-py: https://github.com/loom-ai-org/loom-py
- Licencia del modelo (FunASR): https://github.com/modelscope/FunASR/blob/main/MODEL_LICENSE
- Paquete PyPI loom-py-rt (instalación mediante `pip install -U "loom-py-rt[hub]"`)
