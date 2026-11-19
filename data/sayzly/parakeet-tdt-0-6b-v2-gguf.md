# sayzly/parakeet-tdt-0.6b-v2-gguf

## Resumen

Parakeet TDT 0.6B v2 (GGUF) es una conversión al formato GGUF del modelo de reconocimiento automático del habla `nvidia/parakeet-tdt-0.6b-v2`, publicada por el usuario `sayzly`. No se trata de un modelo nuevo ni de un reentrenamiento: el autor indica explícitamente en la model card que únicamente ha convertido los pesos originales a GGUF y que no ha modificado el modelo de otra forma. El repositorio contiene un único fichero de cuantización Q8_0 (`parakeet-tdt-0.6b-v2-Q8_0.gguf`) de aproximadamente 0,7 GB, lo que sugiere que su propósito es facilitar la ejecución del modelo en entornos basados en llama.cpp u otras herramientas compatibles con GGUF.

El modelo subyacente es un sistema de transcripción de voz a texto de NVIDIA basado en la arquitectura TDT (Token-and-Duration Transducer), con unos 617,9 millones de parámetros. La conversión a GGUF resulta relevante para desarrolladores que quieran desplegar ASR en local sin depender de los formatos nativos de NeMo, aunque conviene tener en cuenta que la compatibilidad real de esta arquitectura con los motores GGUF habituales no está documentada en la información disponible.

La ficha se limita a los datos publicados en el repositorio de Hugging Face y en la model card del autor, que es muy escueta. Cualquier dato sobre entrenamiento, idiomas, benchmarks o rendimiento no aparece en la información proporcionada y se indica como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer) del modelo base NVIDIA Parakeet; detalles internos no disponibles |
| Parametros totales | 617.869.958 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (fichero `parakeet-tdt-0.6b-v2-Q8_0.gguf`) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base `nvidia/parakeet-tdt-0.6b-v2`, un sistema ASR de tipo Token-and-Duration Transducer. La model card del repositorio GGUF no aporta detalles sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de ajuste fino con RLHF o DPO. Toda esa información pertenece al modelo original de NVIDIA y no se reproduce en la información disponible.

La única intervención documentada por el autor de esta conversión es el cambio de formato: los pesos se han convertido a GGUF y, según la model card, no se han modificado de otro modo. No se documentan innovaciones técnicas adicionales, ni procesos de decodificación especulativa, ni optimizaciones propias de esta versión.

## Capacidades

- Reconocimiento automático del habla (speech-to-text), según el `pipeline_tag` del repositorio.
- Generación de transcripciones a partir de audio, heredada del modelo base NVIDIA.
- El repositorio no documenta soporte de tool calling, function calling ni uso como agente.
- No se documentan capacidades multilingües; los idiomas soportados figuran como no disponibles.
- No se documentan modos especiales (thinking mode, visión, audio adicional) más allá de la propia entrada de audio del ASR.
- No se documenta ninguna capacidad adicional específica de esta conversión GGUF.

## Casos de uso

- Transcripción local de reuniones: el fichero GGUF Q8_0 de unos 0,7 GB permite plantear la ejecución en local mediante herramientas compatibles con GGUF, útil para equipos que quieran evitar enviar audio a servicios en la nube.
- Subtitulado de vídeo y podcasts: el modelo puede generar transcripciones de audio que después se sincronizan con la pista de vídeo, siempre que el motor GGUF elegido soporte esta arquitectura.
- Indexación y búsqueda de contenido hablado: transcribir archivos de audio para alimentar un índice de búsqueda textual o un sistema RAG, aprovechando el tamaño reducido del modelo.
- Prototipado de asistentes de voz: integrar la transcripción como primer eslabón de un pipeline ASR + LLM, ejecutando el ASR en local y el LLM en un servicio aparte.
- Dictado en aplicaciones de escritorio: empaquetar el GGUF dentro de una aplicación de dictado que corra en el equipo del usuario sin conexión.
- Evaluación comparativa de formatos: usar esta conversión para medir el rendimiento de la cuantización Q8_0 frente a los pesos originales de NeMo en tareas de transcripción, como paso previo a una decisión de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa aproximadamente 0,7 GB, por lo que el modelo cabe holgadamente en GPUs de consumo; la VRAM real dependerá del motor de inferencia y del búfer de audio.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU con al menos 2-4 GB de memoria libre debería poder alojar los pesos.
- Cabe en GPU de consumo: sí, por el tamaño del fichero; no se documentan GPUs concretas probadas.
- Opciones de despliegue: llama.cpp u otras herramientas compatibles con GGUF; la compatibilidad efectiva con esta arquitectura TDT no está documentada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| sayzly/parakeet-tdt-0.6b-v2-gguf | 617,9 M | no disponible | GGUF Q8_0 | cc-by-4.0 | Conversión comunitaria del modelo de NVIDIA |
| nvidia/parakeet-tdt-0.6b-v2 | 617,9 M | no disponible | Pesos originales (NeMo) | cc-by-4.0 | Modelo base, referencia para comparar calidad y compatibilidad |
| Alternativas ASR de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Conversión comunitaria sin validación documentada: el autor no publica pruebas de que el GGUF funcione correctamente con motores GGUF estándar.
- Repositorio sin descargas ni likes en el momento de la ficha, lo que implica ausencia de validación por parte de la comunidad.
- Idiomas soportados no documentados; no se debe asumir multilingüismo sin verificar el modelo base.
- No se documentan sesgos, tasas de alucinación ni comportamiento en audio con ruido o acentos.
- La licencia cc-by-4.0 permite uso comercial con atribución; es obligatorio acreditar a los autores originales de NVIDIA y al autor de la conversión.
- Al ser una conversión de pesos, cualquier limitación del modelo base de NVIDIA se hereda sin cambios.
- No se documenta el proceso de conversión ni la equivalencia numérica exacta con los pesos originales más allá de la afirmación del autor.

## Enlaces

- Repositorio GGUF: https://huggingface.co/sayzly/parakeet-tdt-0.6b-v2-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
