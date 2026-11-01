# Ordagrant/kb-whisper-medium-coreml

## Resumen

Ordagrant/kb-whisper-medium-coreml es una conversion a Core ML del modelo KBLab/kb-whisper-medium, un ajuste fino de Whisper medium especializado en reconocimiento automatico del habla en sueco. La publica el usuario Ordagrant como artefacto listo para WhisperKit, la libreria de inferencia on-device de Argmax para el ecosistema Apple, generada con la herramienta whisperkittools. El objetivo es permitir transcripcion de audio en sueco directamente en dispositivos Apple (macOS, iOS, iPadOS) sin depender de servicios en la nube.

El modelo hereda la arquitectura encoder-decoder transformer de Whisper medium, con aproximadamente 764 millones de parametros en su forma original, aunque el repositorio distribuido ocupa unos 0,5 GB, lo que sugiere pesos cuantizados o en precision reducida para Core ML. La licencia es Apache 2.0, la misma que el modelo base, y el unico idioma declarado es el sueco (sv). No se publican detalles sobre el proceso de conversion mas alla de la referencia a whisperkittools y a los ficheros de receta incluidos en el paquete.

Su relevancia es acotada pero concreta: cubre un nicho (ASR en sueco) y una plataforma (Apple Silicon con Core ML) que pocos modelos open source atienden de forma empaquetada. No es un modelo de proposito general ni compite en benchmarks multilingues; es un artefacto de despliegue para una tarea y un idioma especificos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium), convertido a Core ML |
| Parametros totales | No disponible en la informacion proporcionada (Whisper medium original: ~764 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | No disponible (el repo ocupa 0,5 GB, compatible con pesos en precision reducida) |
| Idiomas soportados | Sueco (sv) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (paquete whisperkit) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper medium: un transformer encoder-decoder con atencion completa, entrenado originalmente por OpenAI para transcripcion y traduccion de audio. El modelo base KBLab/kb-whisper-medium es un ajuste fino de KBLab (Laboratorio de Humanidades Digitales de la Universidad de Gotemburgo) sobre ese checkpoint, orientado a mejorar el rendimiento en sueco. No se dispone en la informacion proporcionada de datos sobre el volumen de horas de audio sueco usado en el ajuste fino, la composicion del dataset ni si hubo etapas de RLHF o DPO.

La innovacion de este artefacto no esta en el entrenamiento sino en el empaquetado: la conversion a Core ML mediante whisperkittools permite ejecutar el modelo con aceleracion por Neural Engine y GPU en hardware Apple. El repositorio incluye un fichero conversion.json con la receta exacta de conversion y un NOTICE.md con las licencias, lo que facilita la reproducibilidad del proceso. No se documentan tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Reconocimiento automatico del habla en sueco, con salida de transcripcion de audio.
- Procesamiento de audio en ventanas de 30 segundos, propio de la familia Whisper.
- Ejecucion on-device en Apple Silicon mediante WhisperKit y Core ML.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al sueco segun la etiqueta de idioma del repositorio.
- No se documentan modos de thinking, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Transcripcion de reuniones en sueco: el modelo convierte grabaciones de audio en texto dentro de macOS o iOS, sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Subtitulado de contenido audiovisual sueco: se puede integrar en un pipeline de postproduccion que genere subtitulos automáticos para videos, aprovechando la inferencia local en equipos Apple.
- Dictado por voz en aplicaciones nativas: integrado via WhisperKit, permite anadir entrada de voz en sueco a apps de iOS o macOS con latencia baja y sin coste por peticion.
- Accesibilidad: transcripcion en tiempo real de conversaciones o clases para personas con discapacidad auditiva, ejecutandose en el propio dispositivo.
- Archivado y busqueda de audio: transcripcion masiva de archivos de audio historicos o periodisticos en sueco para hacerlos indexables y consultables.
- Investigacion en linguistica sueca: generacion de transcripciones para corpus orales, con la ventaja de que el modelo es abierto y el proceso reproducible mediante el conversion.json incluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; al ser Core ML, el modelo usa memoria unificada en Apple Silicon. El repositorio ocupa 0,5 GB, por lo que la huella de memoria es moderada.
- GPU recomendadas: hardware Apple con Neural Engine o GPU integrada (series M1, M2, M3, M4 y posteriores).
- Cabe en GPU de consumo: si, en equipos Apple Silicon de gama consumer; no esta pensado para GPU NVIDIA.
- Opciones de despliegue: WhisperKit (libreria nativa), Core ML; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Ordagrant/kb-whisper-medium-coreml | ~764 M (original) | Ventanas de 30 s | Sueco | Apache 2.0 | Core ML |
| KBLab/kb-whisper-medium | ~764 M | Ventanas de 30 s | Sueco | Apache 2.0 | Safetensors/PyTorch |
| openai/whisper-medium | ~764 M | Ventanas de 30 s | Multilingue | MIT | Safetensors/PyTorch |

La diferencia principal frente al modelo base es el formato: este artefacto esta optimizado para Apple, mientras que KBLab/kb-whisper-medium requiere frameworks de Python. Frente a whisper-medium original, el ajuste de KBLab esta especializado en sueco y este paquete anade el empaquetado Core ML.

## Limitaciones y advertencias

- El modelo solo declara soporte para sueco; su uso en otros idiomas no esta garantizado ni documentado.
- Al ser una conversion de otro modelo, cualquier sesgo o error del ajuste fino de KBLab se hereda sin cambios.
- Riesgo de alucinacion en audio con ruido, silencios largos o habla solapada, comun en la familia Whisper.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar el NOTICE.md incluido para confirmar obligaciones de atribucion.
- Dependencia del ecosistema Apple: no es desplegable en GPU NVIDIA ni en servidores Linux convencionales sin reconvertir el modelo.
- El repositorio tiene muy pocas descargas y likes, por lo que no hay evidencia comunitaria de validacion en produccion.
- No se documentan metricas de calidad (WER) ni comparativas con el modelo base en la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ordagrant/kb-whisper-medium-coreml
- Modelo base: https://huggingface.co/KBLab/kb-whisper-medium
- Proyecto Ordagrant: https://github.com/svenclaesson/ordagrant
- WhisperKit (Argmax): no disponible en la informacion proporcionada
- whisperkittools: no disponible en la informacion proporcionada
