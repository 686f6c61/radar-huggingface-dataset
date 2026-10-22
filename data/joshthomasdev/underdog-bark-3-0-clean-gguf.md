# joshthomasdev/underdog-bark-3.0-clean-gguf

## Resumen

Underdog Bark 3.0 Clean (GGUF) es una conversión no oficial al formato GGUF del modelo de reconocimiento automático del habla ConwayResearch/Underdog-Bark-3.0-Clean, publicada por el usuario joshthomasdev. El artefacto está empaquetado en cuantización Q8_0 y pensado exclusivamente para el runtime transcribe.cpp, no para llama.cpp ni para las librerías habituales de HuggingFace. El modelo original ronda los 627 millones de parámetros y está entrenado únicamente en inglés.

Los tags del repositorio y el propio script de conversión (convert-parakeet.py, derivado de un parche sobre transcribe.cpp) apuntan a una arquitectura de la familia Parakeet, el linaje de modelos ASR de NVIDIA NeMo basados en FastConformer. La model card no confirma esta arquitectura de forma explícita, por lo que debe tratarse como una inferencia razonable y no como un dato verificado.

Su relevancia práctica es doble: por un lado, permite ejecutar un modelo ASR de ~627 M de parámetros en hardware modesto, incluido CPU, con un peso de tan solo 0,7 GB; por otro, es un ejemplo temprano del ecosistema transcribe.cpp, una alternativa ligera a whisper.cpp para arquitecturas no Whisper. Conviene señalar que el repositorio no incluye métricas de calidad, no tiene descargas ni validación comunitaria, y que sus metadatos de configuración y tokenizador se tomaron de la variante "Pro" del modelo base y no de la variante "Clean" convertida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Familia Parakeet (linaje FastConformer de NVIDIA NeMo), segun tags y script de conversion; no confirmado explicitamente en la model card |
| Parametros totales | 627.052.166 (~627 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR: la entrada es audio, no una secuencia de texto con ventana declarada) |
| Tipos de cuantizacion | Q8_0 (unico publicado en este repositorio) |
| Idiomas soportados | ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (Q8_0), formato especifico de transcribe.cpp |
| Modelo base | ConwayResearch/Underdog-Bark-3.0-Clean (revision 6d34ed8639b2b9a33e764acf06748519bbb950cf) |
| Runtime compatible | transcribe.cpp (commit db678a0 + parche convert-parakeet-bark) |
| Tamano del repositorio | 0,7 GB |
| Fecha de publicacion | 2026-10-21 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original. Los tags `parakeet` y el uso de un script de conversión derivado de la ruta `scripts/convert-parakeet.py` de transcribe.cpp indican que se trata de un modelo de la familia Parakeet, habitualmente construida sobre bloques FastConformer (convoluciones depthwise combinadas con atención) y con decodificación de tipo transducer o CTC. No se ha publicado en la información proporcionada el número de tokens de audio de entrenamiento, la composición del corpus, ni si hubo etapas de ajuste fino supervisado, RLHF o DPO.

El proceso de conversión documentado es relevante para entender el artefacto: se descarga el modelo original, se desempaqueta `model.bark` mediante `bark_loader.py` de Conway a safetensors F32, se aplica un parche al conversor de Parakeet de transcribe.cpp y se genera el GGUF F32, que después se cuantiza a Q8_0 con `transcribe-quantize`. Un detalle importante es que `config.json` y `tokenizer.json` se obtuvieron de la revisión de **Underdog-Bark-3.0-Pro** (4b5c51e04aa8d16dda9ecdff71bc29f7360149e4), no de la variante Clean, lo que introduce un riesgo de desajuste entre arquitectura declarada y pesos reales. No se documenta ninguna innovación técnica propia (decodificación especulativa, atención lineal ni similar) más allá de la propia arquitectura heredada.

## Capacidades

- Reconocimiento automático del habla en inglés: transcripción de audio a texto.
- Ejecución local y offline mediante transcribe.cpp, sin dependencia de servicios en la nube.
- Inferencia viable en CPU, gracias al tamaño reducido del modelo y a la cuantización Q8_0.
- Formato GGUF de un solo archivo, adecuado para distribuir y desplegar el modelo en entornos con poco espacio.
- No se ha documentado soporte de tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo ASR, no un LLM conversacional).
- No se ha documentado capacidad multilingüe: el campo `language` del repositorio declara únicamente `en`.
- No se ha documentado salida de marcas de tiempo, diarización de hablantes, detección de idioma ni puntuación automática.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo convierte audio en texto en local, sin enviar grabaciones a terceros, lo que resulta adecuado para entornos con requisitos de confidencialidad y para equipos sin GPU dedicada dado su tamaño de 0,7 GB.
- Subtitulado de vídeo en pipelines de postproducción: al ejecutarse sobre CPU y con un único fichero GGUF, puede integrarse en un contenedor dentro de un flujo por lotes que procese una cola de vídeos en inglés.
- Dictado y entrada por voz en aplicaciones de escritorio: la latencia de un modelo de ~627 M en Q8_0 permite transcripciones incrementalmente cortas, siempre que se valide empíricamente el throughput, que no está publicado.
- Análisis de llamadas de atención al cliente: transcripción por lotes de grabaciones en inglés para posteriores tareas de clasificación, búsqueda o control de calidad, manteniendo los datos dentro de la infraestructura propia.
- Accesibilidad: generación de transcripciones para contenido en inglés dirigido a personas con discapacidad auditiva, con la ventaja de poder desplegarse en hardware de bajo coste.
- Indexación y búsqueda de archivos de audio: convertir un archivo de entrevistas o podcasts a texto para alimentar un índice de búsqueda o un sistema RAG, usando este modelo como primer eslabón del pipeline.
- Procesamiento en el borde: despliegue en dispositivos con recursos limitados donde no caben modelos ASR de mayor tamaño, al necesitar del orden de 1 GB de memoria para los pesos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye valores de WER (word error rate), CER, velocidad de inferencia ni comparaciones con otros modelos, y no se dispone de información sobre el conjunto de evaluación del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7-1,5 GB con Q8_0 (0,63 GB de pesos más buffers de audio y activaciones); unos 2,5 GB si se Parte del GGUF F32 intermedio. Cifras estimadas a partir del recuento de parámetros, no medidas publicadas.
- GPU recomendadas: cualquier GPU con 2 GB o más de memoria, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100. El modelo está claramente sobredimensionado para GPUs de datacenter.
- Cabe holgadamente en GPU de consumo, y también en CPU: 627 M de parámetros en Q8_0 permiten inferencia en procesadores modernos sin acelerador.
- Opciones de despliegue: transcribe.cpp (compilación con CMake y `TRANSCRIBE_BUILD_TOOLS=ON`), que es el único runtime soportado por este GGUF. No se ha verificado compatibilidad con llama.cpp, Ollama, vLLM ni TGI; el formato GGUF generado es específico para Parakeet dentro de transcribe.cpp.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de RTF (real-time factor) ni de velocidad de transcripción.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Runtime / formato | Notas |
|---|---|---|---|---|---|
| Underdog Bark 3.0 Clean GGUF (este) | ~627 M | en | CC-BY-4.0 | transcribe.cpp / GGUF Q8_0 | Conversion no oficial, sin benchmarks publicados |
| openai/whisper-large-v3 | ~1550 M | multilingue | MIT | Transformers, whisper.cpp, GGUF | Referencia ampliamente adoptada; requiere mas memoria |
| openai/whisper-small | ~244 M | multilingue | MIT | Transformers, whisper.cpp, GGUF | Alternativa mas ligera, menor precision esperada |
| nvidia/parakeet-tdt-0.6b-v2 | ~600 M | en | CC-BY-4.0 | NVIDIA NeMo | Misma familia arquitectonica probable; ecosistema NeMo en lugar de transcribe.cpp |

Los datos de los modelos comparados provienen de información publica sobre ellos y no de este repositorio; no se dispone de una comparación de WER entre ellos y Underdog Bark 3.0 Clean. No se ha podido confirmar si el modelo base es un fine-tune de parakeet-tdt-0.6b ni su relación exacta con la familia Parakeet de NVIDIA.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés: no se ha documentado soporte de otros idiomas, y el campo `language` del repositorio solo declara `en`.
- Conversión no oficial: no está validada ni respaldada por ConwayResearch, el autor del modelo original.
- Desajuste potencial de metadatos: `config.json` y `tokenizer.json` proceden de Underdog-Bark-3.0-Pro, no de la variante Clean que se convirtió, lo que puede afectar a la tokenización o a la interpretación de la arquitectura.
- Una sola cuantización disponible (Q8_0): no hay variantes F16, Q5, Q4 ni otras que permitan reducir aún más el consumo.
- Sin evidencia de calidad: cero descargas, cero likes y ninguna métrica de WER publicada; no hay validación de terceros.
- Riesgo de alucinación típico de ASR: posibles transcripciones inventadas en tramos de silencio, ruido de fondo o audio musical, y errores en nombres propios, cifras y acrónimos.
- Sesgos desconocidos: se desconoce la composición del corpus de entrenamiento original, por lo que no se puede evaluar el sesgo acústico, dialectal o demográfico.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución. La conversión incluye un fichero `NOTICE` que debe conservarse al redistribuir el modelo.
- Compatibilidad restringida: el GGUF está pensado para transcribe.cpp y no debe asumirse que funcione en llama.cpp, Ollama u otros runners.
- Sin garantías de mantenimiento: repositorio de un único autor, con una sola revisión y sin hoja de ruta publicada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/joshthomasdev/underdog-bark-3.0-clean-gguf
- Modelo base: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Clean
- Revisión del modelo base usada: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Clean/tree/6d34ed8639b2b9a33e764acf06748519bbb950cf
- Variante Pro (origen de config y tokenizer): https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Pro/tree/4b5c51e04aa8d16dda9ecdff71bc29f7360149e4
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de transcribe.cpp usado en la conversión: https://github.com/handy-computer/transcribe.cpp/tree/db678a0
