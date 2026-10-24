# Selbyggen/nb-whisper-large-coreml

## Resumen

`Selbyggen/nb-whisper-large-coreml` es una conversión de formato del modelo `NbAiLab/nb-whisper-large` del National Library of Norway (NbAiLab) al formato Core ML, empaquetado para su uso con WhisperKit. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos, el tokenizador y el comportamiento son los del modelo original. El autor de la conversión es Selbyggen y el resultado se distribuye con licencia Apache 2.0, la misma del modelo de partida.

El modelo resuelve un problema muy concreto: ejecutar un ASR de alta calidad para noruego (bokmål y nynorsk) de forma totalmente local en Apple Silicon, aprovechando el Apple Neural Engine en lugar de GPU o CPU. Está pensado para aplicaciones macOS e iOS que necesitan transcripción sin conexión ni envío de audio a servidores externos; de hecho, lo utiliza la aplicación de escritorio Sagt para transcripción local en noruego.

La relevancia es práctica más que investigadora: el ecosistema de Whisper en producción sobre Apple estaba dominado por conversiones no oficiales a whisper.cpp o por inferencia en CPU. Esta conversión ofrece un artefacto Core ML verificado (los tests internos de encoder y decoder contra la referencia en PyTorch pasaron) y con precisión float16 sin cuantización, lo que simplifica el despliegue en apps nativas. El repositorio ocupa 3,1 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de tipo Whisper (familia large), convertido a Core ML |
| Parámetros totales | Aproximadamente 1.550 millones (cifra correspondiente a la arquitectura Whisper large; el autor de la conversión no publica el dato) |
| Longitud de contexto | Ventanas de audio de 30 s y hasta 448 tokens en el decodificador (arquitectura Whisper estándar; no se detalla en la model card) |
| Tipos de cuantización | float16, sin cuantización (el autor indica explícitamente "no quantization") |
| Idiomas soportados | Noruego (`no`), bokmål (`nb`), nynorsk (`nn`); la documentación de NbAiLab del modelo base indica también inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (artefactos para WhisperKit) en float16; `config.json` y `generation_config.json` copiados sin cambios del original |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper: un encoder que procesa espectrogramas Mel en ventanas de 30 segundos y un decoder autorregresivo que genera tokens de texto, con tokenizador idéntico al de `openai/whisper-large-v3` (así lo indica el autor). El modelo original de NbAiLab es un ajuste fino sobre la familia Whisper large orientado a noruego, que añade bokmål y nynorsk al conjunto de idiomas y mejora la transcripción y traducción de habla noruega respecto al Whisper original. Los detalles de composición del dataset de entrenamiento, número de tokens de audio y uso de RLHF o DPO no están disponibles en la información proporcionada.

La aportación de este repositorio es exclusivamente de formato. La conversión se realizó con `whisperkittools`, mediante el comando `whisperkit-generate-model --model-version NbAiLab/nb-whisper-large`, en precisión float16 y sin cuantización posterior. El autor declara que los tests integrados del proceso de conversión (encoder de audio y decoder de texto contra la referencia en PyTorch) se superaron, y que los ficheros de configuración se copiaron sin modificar. No hay, por tanto, innovaciones técnicas propias: el valor está en el empaquetado para Core ML y en la ejecución sobre el Apple Neural Engine.

## Capacidades

- Transcripción de voz a texto (ASR) en noruego, con soporte específico de bokmål y nynorsk.
- Traducción de voz a texto al inglés, heredada del modelo base de NbAiLab (según la documentación del modelo original).
- Ejecución local sobre el Apple Neural Engine mediante WhisperKit, sin dependencia de red.
- Integración nativa en apps macOS/iOS a través de la API Swift de WhisperKit (`WhisperKit.download` + `WhisperKit.transcribe`).
- Selección de idioma en decodificación mediante `DecodingOptions(language: "no")`.
- Compatibilidad de tokenizador con `openai/whisper-large-v3`, lo que facilita reutilizar utilidades existentes del ecosistema Whisper.
- No se documentan capacidades de diarización de hablantes, timestamps a nivel de palabra, tool calling ni modos de razonamiento extendido en la información disponible.

## Casos de uso

- Transcripción local en aplicaciones macOS: integrar el paquete con WhisperKit y transcribir grabaciones de reuniones o entrevistas sin enviar audio a la nube, usando el ANE para reducir consumo de batería. Es el escenario real de la app Sagt.
- Subtitulado de contenido audiovisual en noruego: procesar ficheros de audio o vídeo por ventanas de 30 s y generar subtítulos en bokmål o nynorsk para publicadores de medios nórdicos.
- Actas y notas de reuniones en entornos con requisitos de confidencialidad: sectores público, sanitario o legal noruego, donde el audio no puede salir del dispositivo.
- Herramientas de accesibilidad: dictado y transcripción en tiempo cuasi real dentro de apps iOS/macOS para usuarios con discapacidad auditiva o motriz.
- Investigación en lingüística noruega: transcripción masiva de corpus orales (entrevistas, grabaciones dialectales) en local, comparando rendimiento entre bokmål y nynorsk.
- Traducción de audio noruego a inglés en flujos editoriales: usar la tarea de traducción del modelo base para generar borradores de transcripción en inglés a partir de material hablado en noruego.
- Prototipado rápido en Xcode: validar un pipeline de ASR nativo en una app Swift sin montar infraestructura de servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor únicamente reporta que las pruebas internas de la conversión (encoder de audio y decoder de texto frente a la referencia en PyTorch) se completaron correctamente, lo que avala la fidelidad numérica del artefacto Core ML respecto al modelo original, pero no constituye una evaluación de calidad de transcripción (WER) ni de latencia.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (Apple Neural Engine). El repositorio no es utilizable en GPU NVIDIA ni en CPU x86.
- Espacio en disco: 3,1 GB para el repositorio completo en float16.
- Memoria: al no haber cuantización, el modelo se carga en float16; conviene reservar un margen por encima de los 3 GB para buffers de inferencia (cifra exacta de pico de memoria no disponible).
- GPUs recomendadas: no aplica; el hardware objetivo es el Neural Engine de las familias M1, M2, M3 y M4 (y chips A-series equivalentes en iOS/iPadOS).
- Cabe en hardware de consumo: sí, en cualquier Mac con Apple Silicon y en iPhone/iPad recientes; el rendimiento relativo entre generaciones de chip no está documentado en la información disponible.
- Opciones de despliegue: WhisperKit (Swift Package), Core ML directamente, o apps nativas que embeban el modelo. No es compatible con vLLM, TGI, llama.cpp ni Ollama, que requieren otros formatos de pesos.
- Latencia y throughput: no disponibles. Dependen del chip concreto, de la longitud del audio y de la configuración de decodificación (greedy frente a beam search).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Selbyggen/nb-whisper-large-coreml | ~1.550 M (arquitectura Whisper large) | Ventanas de 30 s | Noruego (nb, nn, no) | Apache 2.0 | Core ML float16, solo Apple Silicon |
| NbAiLab/nb-whisper-large | ~1.550 M (arquitectura Whisper large) | Ventanas de 30 s | Noruego (nb, nn, no) + inglés | Apache 2.0 | PyTorch/safetensors, GPU o CPU; compatible con transformers, faster-whisper y whisper.cpp tras conversión |
| openai/whisper-large-v3 | ~1.550 M (arquitectura Whisper large) | Ventanas de 30 s | Multilingüe (amplio conjunto de idiomas) | Apache 2.0 | PyTorch, GGML, Core ML (conversiones de terceros) |
| Familia nb-whisper (medium/base) de NbAiLab | No disponible en la información proporcionada | Ventanas de 30 s | Noruego | Apache 2.0 | PyTorch; menor huella y menor precisión esperada |

La diferencia clave frente al modelo base no es de calidad, sino de plataforma: este repositorio solo tiene sentido si el destino es Apple Silicon. Para servir ASR en servidores con GPU, el modelo original de NbAiLab en PyTorch o una conversión a faster-whisper resulta más adecuado.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo nuevo: cualquier limitación del modelo de NbAiLab se hereda íntegramente (sesgos del corpus noruego, errores en dialectos o audio ruidoso).
- Riesgo de alucinación típico de Whisper en silencios, música o ruido de fondo, con posibles repeticiones o frases inventadas; conviene aplicar detección de voz (VAD) antes de la transcripción.
- Ventana de audio limitada a 30 segundos por pasada; el audio largo requiere segmentación y gestión manual de solapamientos.
- Cobertura lingüística centrada en noruego; el rendimiento en otros idiomas no está garantizado aunque la arquitectura sea multilingüe.
- Dependencia total del ecosistema Apple: no ejecutable en Linux, Windows ni GPU NVIDIA, lo que complica pipelines multiplataforma o de servidor.
- Al no incluir cuantización, el consumo de memoria y disco es mayor que el de variantes int8; no se documentan versiones cuantizadas en este repositorio.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda conservar la atribución a NbAiLab, tal como pide el propio autor de la conversión.
- Sin métricas de WER publicadas para esta conversión concreta; antes de producción conviene validar con un conjunto propio de audio noruego.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Selbyggen/nb-whisper-large-coreml
- Modelo base: https://huggingface.co/NbAiLab/nb-whisper-large
- README del modelo base: https://huggingface.co/NbAiLab/nb-whisper-large/blob/main/README.md
- Repositorio GitHub de NbAiLab nb-whisper: https://github.com/NbAiLab/nb-whisper
- WhisperKit (Argmax): https://github.com/argmaxinc/WhisperKit
- Herramientas de conversión whisperkittools: https://github.com/argmaxinc/whisperkittools
- Demo de NB-Whisper: https://ai.nb.no/nb-whisper-demo/
