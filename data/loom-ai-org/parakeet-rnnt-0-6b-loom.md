# loom-ai-org/parakeet-rnnt-0.6b-loom

## Resumen

Parakeet-RNNT 0.6B es un modelo de reconocimiento automático de voz (ASR) en inglés desarrollado por NVIDIA, basado en la arquitectura RNNT (Recurrent Neural Network Transducer). Esta ficha corresponde a una exportación específica del modelo original al formato GGUF de loom.cpp, realizada por el equipo de loom-ai-org. El export no modifica los pesos del modelo base, sino que los empaqueta en un único archivo auto-descriptivo que incluye la topología del grafo, el tokenizador y el script de driver necesario para su ejecución.

La relevancia de esta versión radica en que permite ejecutar el modelo con el ecosistema loom.cpp, un motor de inferencia optimizado para CPU y GPU, mediante la librería `loom-py-rt` en Python. Esto facilita el despliegue de ASR en entornos locales sin depender de los frameworks originales de NVIDIA (NeMo), manteniendo la misma calidad de transcripción. El modelo tiene aproximadamente 627 millones de parámetros y está licenciado bajo CC-BY-4.0, lo que permite su uso comercial con atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNNT (Recurrent Neural Network Transducer) |
| Parametros totales | 627.161.697 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no texto) |
| Tipos de cuantizacion | no disponible (el archivo es GGUF, pero no se especifica el tipo de cuantización) |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (loom.cpp) |

## Arquitectura y entrenamiento

El modelo base `nvidia/parakeet-rnnt-0.6b` es un sistema ASR basado en la arquitectura Transducer, que combina un codificador acústico (generalmente un transformer o conformer) con un decodificador de predicción y una red de unión (joint network). Esta arquitectura permite el reconocimiento de voz en tiempo real con baja latencia, ya que procesa la entrada de forma incremental. El modelo fue entrenado por NVIDIA utilizando su toolkit NeMo, con un dataset de audio en inglés (los detalles exactos del corpus no están disponibles en la información proporcionada).

La versión exportada por loom-ai-org no modifica los pesos del modelo original. El proceso de exportación con `loom-exporter` genera un archivo GGUF que contiene no solo los pesos, sino también la descripción del grafo de computación, el tokenizador (si existe) y un driver script que define cómo se ejecuta la inferencia. Este enfoque hace que el archivo sea autónomo y portable, permitiendo que el motor loom.cpp lo interprete sin necesidad de código externo. El driver incluye lógica para manejar archivos de audio largos mediante ventaneado automático y para emitir timestamps por segmento.

## Capacidades

- Reconocimiento automático de voz (ASR) en inglés, transcribiendo audio a texto.
- Generación de transcripciones con marcas de tiempo (timestamps) por segmento, como se muestra en el ejemplo de uso.
- Manejo de archivos de audio largos mediante ventaneado automático, con búsqueda de la posición de cierre del último segmento para evitar cortes fijos.
- Inferencia mediante la API de alto nivel `speech2text` de loom-py, que aplica automáticamente el muestreo (16 kHz) y el ensamblado de segmentos.
- Acceso al driver subyacente para ajustar parámetros adicionales no expuestos en la API de alto nivel, a través de `model.infer(...)` y `model.driver_source`.

## Casos de uso

- Transcripción de reuniones y conferencias: el modelo puede procesar grabaciones de audio largas (por ejemplo, reuniones de equipo) y devolver transcripciones segmentadas con timestamps, lo que facilita la generación de actas y la búsqueda de momentos concretos. Su capacidad de ventaneado automático lo hace adecuado para archivos de varias horas sin necesidad de dividir manualmente el audio.
- Subtitulado automático de vídeos: al generar texto con marcas de tiempo, es posible sincronizar subtítulos con el vídeo de forma precisa. El modelo se puede integrar en pipelines de postproducción para generar subtítulos en inglés de forma automática.
- Asistentes de voz y comandos por voz: gracias a su arquitectura RNNT, que permite inferencia incremental, el modelo puede utilizarse en aplicaciones de dictado o asistentes que requieren baja latencia en la transcripción de comandos de voz.
- Análisis de llamadas de atención al cliente: las empresas pueden transcribir llamadas telefónicas para su posterior análisis (detección de sentimiento, extracción de información, control de calidad). El modelo soporta audio mono a 16 kHz, que es el formato estándar en telefonía.
- Accesibilidad para personas con discapacidad auditiva: transcripción en tiempo real de conversaciones o contenido audiovisual, con la ventaja de que el modelo se puede ejecutar localmente en hardware modesto gracias al formato GGUF y al motor loom.cpp.
- Investigación y desarrollo en ASR: al ser un modelo abierto con licencia permisiva, se puede utilizar como punto de partida para experimentos de fine-tuning o para comparar arquitecturas en entornos académicos, sin necesidad de infraestructura de GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de HuggingFace no incluye métricas como WER (Word Error Rate) o comparaciones con otros modelos. Para obtener datos de rendimiento, se recomienda consultar la documentación del modelo base `nvidia/parakeet-rnnt-0.6b` en el repositorio de NVIDIA NeMo.

## Requisitos de hardware

- No se dispone de datos oficiales sobre VRAM o requisitos mínimos en la información proporcionada.
- El tamaño del repositorio es de 7.5 GB, lo que sugiere que el archivo GGUF puede incluir pesos en alta precisión (fp16 o fp32) o múltiples cuantizaciones. Con 627 millones de parámetros, una estimación razonable sería de ~1.3 GB en fp16 y ~2.5 GB en fp32, pero no se confirma oficialmente.
- Al ser un modelo de 0.6B y estar en formato GGUF, es plausible que pueda ejecutarse en CPU con un rendimiento aceptable, así como en GPUs de consumo como RTX 3060 o superiores, aunque no se especifica.
- El motor loom.cpp está diseñado para ejecución eficiente en CPU y GPU. Se recomienda consultar la documentación de loom.cpp para conocer los requisitos exactos de hardware y las opciones de cuantización disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. El modelo pertenece a la categoría de ASR en inglés de tamaño medio (0.6B parámetros). Alternativas similares podrían ser:

- Whisper small/base de OpenAI (arquitectura encoder-decoder, contexto de texto, multilingüe).
- Wav2Vec2.0 base de Facebook (arquitectura transformer, pre-entrenado con aprendizaje auto-supervisado).
- Conformer-Transducer de NVIDIA (similar en arquitectura, pero no se especifica su tamaño).

Sin embargo, no se pueden establecer comparaciones cuantitativas sin datos de benchmarks. Se recomienda consultar las respectivas documentaciones para evaluar diferencias en WER, latencia y requisitos de hardware.

## Limitaciones y advertencias

- El modelo solo soporta el idioma inglés (`en`). No es adecuado para transcripción en otros idiomas sin un fine-tuning específico.
- No se han documentado sesgos específicos en la información disponible, pero al ser un modelo entrenado con datos de audio en inglés, puede presentar un rendimiento inferior con acentos no nativos o variedades dialectales poco representadas.
- El modelo puede presentar alucinaciones o errores de transcripción en audio con ruido de fondo, solapamiento de voces o vocabulario técnico especializado.
- La licencia CC-BY-4.0 permite uso comercial, pero requiere atribución al autor original. No se especifican restricciones adicionales.
- Al ser una exportación a un formato propietario de loom.cpp, el modelo solo puede ejecutarse con las herramientas de loom (loom-py, loom.cpp). No es compatible directamente con otros frameworks como transformers o NeMo sin una conversión previa.
- La documentación disponible es escasa: no se proporcionan detalles sobre cuantización, rendimiento, ni requisitos de hardware específicos, lo que puede dificultar la planificación del despliegue en producción.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/loom-ai-org/parakeet-rnnt-0.6b-loom)
- [Modelo base de NVIDIA](https://huggingface.co/nvidia/parakeet-rnnt-0.6b)
- [Repositorio loom.cpp](https://github.com/loom-ai-org/loom.cpp)
- [Repositorio loom-exporter](https://github.com/loom-ai-org/loom-exporter)
- [Repositorio loom-py](https://github.com/loom-ai-org/loom-py)
