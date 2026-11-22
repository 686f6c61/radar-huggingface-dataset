# loom-ai-org/data2vec-audio-base-960h-loom

## Resumen

`loom-ai-org/data2vec-audio-base-960h-loom` es una exportación al formato GGUF propio de loom.cpp del modelo `facebook/data2vec-audio-base-960h` de Meta, un sistema de reconocimiento automático del habla (ASR) en inglés basado en la arquitectura data2vec-audio con cabecera CTC. El modelo original emplea un transformer con auto-supervisión multimodal (data2vec), preentrenado sobre audio sin etiquetar y afinado después con 960 horas de LibriSpeech para transcripción de voz a texto. Este repositorio no introduce cambios en los pesos: empaqueta los mismos 93.188.130 parámetros en un único fichero GGUF autodescriptivo que incluye las topologías de grafo, el tokenizador y el script de controlador necesarios para ejecutarlo con el runtime loom-py.

La relevancia de esta ficha es acotada y muy específica: sirve a quien quiera ejecutar un ASR inglés de referencia dentro del ecosistema loom.cpp sin depender de PyTorch ni de Transformers, con un único artefacto de 0,7 GB y licencia Apache 2.0. No es un modelo nuevo ni un refinamiento; es una reempaquetadura de inferencia. Su utilidad práctica depende enteramente del runtime loom-py y de la madurez de loom.cpp como motor.

El modelo decodifica únicamente en inglés, no acepta parámetro de idioma (lo ignora con aviso) y no emite tokens de marca temporal, por lo que los segmentos devueltos cubren el clip completo y `timestamped` es `False`. Con 15 descargas y 0 likes en el momento de la consulta, su adopción es mínima y debe considerarse experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer data2vec-audio con cabecera CTC (modelo base de Meta) |
| Parametros totales | 93.188.130 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo distribuye un GGUF; no se detallan variantes de cuantizacion) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero `data2vec-audio-base-960h.gguf`, autodescriptivo con grafo, tokenizador y driver) |

## Arquitectura y entrenamiento

El modelo subyacente es `facebook/data2vec-audio-base-960h`, un transformer de tipo base (12 capas, dimensión oculta 768, 12 cabezas de atención, ~93 M de parámetros) entrenado con el objetivo data2vec: predicción de representaciones latentes enmascaradas en lugar de tokens discretos. El preentrenamiento es auto-supervisado sobre audio sin etiquetar; después se afina con 960 horas de LibriSpeech (de ahí el sufijo `960h`) y una cabecera CTC para transcripción carácter a carácter en inglés. Los pesos de este repositorio son idénticos a los del modelo original; lo único que cambia es el contenedor.

La innovación de esta exportación no está en el modelo sino en el empaquetado: loom-exporter genera un GGUF que transporta consigo las topologías de grafo, el tokenizador y el script de controlador, de modo que el runtime no necesita código específico por modelo. El driver embebido documenta en su cabecera los argumentos aceptados y es la autoridad para ajustes finos vía `model.infer(...)`. No se dispone de información sobre el dataset exacto de afinado más allá de LibriSpeech 960h, ni sobre técnicas de regularización o decodificación adicionales (beam search, LM externo) en esta exportación.

## Capacidades

- Reconocimiento automático del habla en inglés: transcripción de audio mono a 16 kHz en formato de lista de floats.
- Decodificación CTC carácter a carácter; sin puntuación ni capitalización garantizadas más allá de lo aprendido en LibriSpeech.
- Inferencia por lotes y por streaming: el API `stream()` permite empujar audio por fragmentos (por ejemplo, un segundo a la vez) y leer la transcripción incremental, con indicador `revised` cuando el texto previo cambia.
- Sin soporte de marcas temporales reales: `segments` devuelve un único intervalo que cubre el clip completo y `timestamped` es `False`.
- Sin parámetro de idioma: pasar `language=` emite un aviso y se ignora, porque la decodificación solo puede producir inglés.
- Sin tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- Sin visión, audio generativo ni modo de pensamiento.

## Casos de uso

- Transcripción de reuniones y notas de voz en inglés: el modelo convierte audio de micrófono a texto con el API de streaming, empujando fragmentos de un segundo y ensamblando la transcripción a medida que llega, adecuado para actas internas en entornos donde ya se usa loom.cpp.
- Subtitulado aproximado de contenido en inglés: útil para generar un borrador de transcripción que después se alinea manualmente, dado que no hay marcas temporales fiables y los segmentos cubren el clip entero.
- Indexación y búsqueda de archivos de audio: transcripción masiva de un corpus en inglés para construir un índice de texto sobre el que buscar, aprovechando el tamaño reducido del modelo (0,7 GB) para procesar en paralelo en CPU o GPU modesta.
- Preprocesado de datasets de voz: conversión de grabaciones en inglés a texto para pipelines de etiquetado o análisis, con la ventaja de no requerir PyTorch ni Transformers en el entorno de ejecución.
- Asistentes de voz locales en inglés: integración en aplicaciones de escritorio o embebidas que ya usan el runtime loom-py, evitando añadir una pila de Python pesada para una única tarea de ASR.
- Evaluación comparativa de runtimes: banco de pruebas para medir latencia y throughput de loom.cpp frente a implementaciones de referencia del mismo modelo en Transformers, al ser pesos idénticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER sobre LibriSpeech ni comparaciones con otras implementaciones, y la búsqueda web no aporta datos técnicos del modelo (los resultados corresponden a productos homónimos sin relación).

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 93 M de parámetros, los pesos en FP32 ocupan aproximadamente 0,37 GB y en FP16 unos 0,19 GB; el repo completo pesa 0,7 GB. La VRAM real dependerá del backend y de las activaciones del runtime loom.cpp.
- GPU recomendadas: no hay recomendaciones publicadas. Por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) debería alojar los pesos con holgura; también es viable en CPU.
- ¿Cabe en GPU consumer? Sí, con toda probabilidad, dado el reducido número de parámetros; no se dispone de cifras verificadas de consumo en inferencia.
- Opciones de despliegue: exclusivamente loom-py (`loom-py-rt` en PyPI, versión >= 1.0.0 con extra `[hub]`) sobre el motor loom.cpp. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| data2vec-audio-base-960h-loom (este) | 93,2 M | no disponible | en | Apache 2.0 | GGUF / loom.cpp |
| facebook/data2vec-audio-base-960h (original) | ~93 M | no disponible | en | Apache 2.0 | safetensors / Transformers |
| facebook/wav2vec2-base-960h | ~95 M | no disponible | en | Apache 2.0 | safetensors / Transformers |
| openai/whisper-base | ~74 M | 30 s de audio | multilingue | MIT | safetensors / Transformers, whisper.cpp |

La comparación con wav2vec2-base-960h y whisper-base se ofrece por categoría (ASR de tamaño base); no se dispone de métricas de WER comparadas en la información proporcionada, por lo que no se puede afirmar superioridad de ninguno. La diferencia práctica de este repositorio es el runtime: solo funciona con loom.cpp, mientras que las alternativas tienen ecosistemas de despliegue mucho más amplios.

## Limitaciones y advertencias

- Solo inglés: no admite otros idiomas y el parámetro `language` se ignora con aviso.
- Sin marcas temporales reales: `result.timestamped` es `False` y `segments` devuelve un único intervalo que cubre todo el clip; no debe interpretarse como una frontera elegida por el modelo.
- Adopción mínima: 15 descargas y 0 likes en el momento de la consulta; sin señales de validación por parte de la comunidad.
- Dependencia total de loom.cpp y loom-py: no hay soporte documentado para otros runtimes, lo que limita la portabilidad y aumenta el riesgo de mantenimiento si el proyecto cambia.
- Riesgo de alucinación en ASR: como todo modelo CTC entrenado en LibriSpeech, puede producir transcripciones plausibles pero incorrectas en audio ruidoso, con acentos no vistos o con vocabulario fuera de dominio.
- Sesgos heredados del corpus LibriSpeech (lectura de audiolibros en inglés), con posible peor rendimiento en habla espontánea, dialectos o audio telefónico.
- Licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base; conviene verificar las condiciones del modelo original de Meta antes de desplegar en producción.
- Sin datos publicados de WER ni de rendimiento en producción: no debe asumirse calidad equivalente a la implementación de referencia sin una evaluación propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-ai-org/data2vec-audio-base-960h-loom
- Modelo base: https://huggingface.co/facebook/data2vec-audio-base-960h
- loom.cpp: https://github.com/loom-ai-org/loom.cpp
- loom-exporter: https://github.com/loom-ai-org/loom-exporter
- loom-py: https://github.com/loom-ai-org/loom-py
