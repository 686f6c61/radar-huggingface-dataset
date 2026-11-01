# Selbyggen/kb-whisper-large-coreml

## Resumen

KB-Whisper large – WhisperKit / Core ML es una conversión de formato del modelo KBLab/kb-whisper-large, desarrollado por KBLab (Kungliga biblioteket, la Biblioteca Nacional de Suecia), al formato Core ML para su uso con WhisperKit en dispositivos con Apple Silicon. No se trata de un modelo nuevo: los pesos, el comportamiento y el tokenizador son los del modelo original de KBLab; el trabajo de Selbyggen consiste únicamente en la conversión para que el modelo se ejecute sobre el Apple Neural Engine (ANE) en Mac, iPhone y iPad.

El modelo base es un Whisper large fine-tuneado para sueco, con arquitectura transformer encoder-decoder propia de la familia Whisper de OpenAI. Esta conversión preserva la licencia Apache 2.0 del original y está pensada para transcripción local de audio en sueco sin depender de servicios en la nube, lo que resulta relevante para aplicaciones de privacidad y para uso offline en el ecosistema Apple.

La relevancia actual radica en que permite ejecutar un modelo de reconocimiento automático del habla (ASR) de tamaño large en hardware de consumo Apple mediante Core ML, algo que con PyTorch nativo sería menos eficiente en dichos dispositivos. La conversión se realizó con whisperkittools en precisión float16 sin cuantización, y el autor reporta un WER del 4,8 % en un conjunto reducido de clips sintéticos en sueco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large) |
| Parametros totales | no disponible (heredados de KBLab/kb-whisper-large; Whisper large ~1550 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | float16 (sin cuantizacion en esta conversion) |
| Idiomas soportados | sueco (sv) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (mlpackage/mlmodelc); repo de 3,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large: un transformer encoder-decoder con atención completa, diseñado para ASR y traducción de voz. El modelo original de KBLab es un fine-tune de Whisper large sobre datos en sueco, en su revisión «Stage 2» según indica la model card de la conversión. Esta versión concreta no aporta entrenamiento nuevo: es una conversión de formato con whisperkittools (`whisperkit-generate-model --model-version KBLab/kb-whisper-large`) que genera los componentes Core ML (encoder de audio, espectrograma mel y decoder de texto) para ejecución en el Apple Neural Engine.

La conversión se realizó en float16 sin cuantización. Los tests integrados de Core ML pasaron para el encoder de audio (PSNR 51,7 frente a PyTorch), el espectrograma mel y el decoder de texto (PSNR 58,9 entre el modelo Core ML y el decoder PyTorch de whisperkittools). La comprobación adicional que compara el decoder PyTorch de whisperkittools con la referencia de `transformers` falló (PSNR 10,4), por lo que el autor verificó el modelo de extremo a extremo sobre un conjunto pequeño de clips sintéticos en sueco. Los ficheros `config.json` y `generation_config.json` se copiaron sin cambios del modelo original.

## Capacidades

- Reconocimiento automático del habla (ASR) en sueco, con preservación de nombres, caracteres especiales y estructura de frases según la verificación del autor.
- Transcripción local en dispositivos Apple (Mac, iPhone, iPad) mediante WhisperKit sobre el Apple Neural Engine.
- Uso del mismo tokenizador que `openai/whisper-large-v3`.
- Ejecución offline sin envío de audio a servidores externos.
- No se documentan capacidades de tool calling, agentes, visión, audio adicional ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al sueco según la etiqueta de idioma del repositorio.

## Casos de uso

- Transcripción de reuniones y entrevistas en sueco en local: la app de referencia (Sagt) usa este modelo para transcribir audio en Mac, iPhone e iPad sin conexión, aprovechando la ejecución en el ANE para preservar privacidad.
- Subtitulado de vídeo y podcasts en sueco: integrable en flujos de postproducción que requieran transcripciones con puntuación y nombres propios correctos, gracias a la verificación end-to-end reportada.
- Notas de voz a texto en aplicaciones iOS/macOS: el formato Core ML y WhisperKit permiten incrustar la transcripción en apps nativas con latencia adecuada para uso interactivo.
- Archivística y digitalización de audio en instituciones suecas: al derivar de un modelo de KBLab orientado a sueco, encaja en proyectos de preservación y acceso a material audiovisual en esa lengua.
- Investigación en ASR sobre Apple Silicon: sirve como referencia para comparar el rendimiento de Whisper large convertido a Core ML frente a implementaciones PyTorch en el mismo hardware.
- Prototipado de asistentes de voz en sueco: la API de WhisperKit permite transcribir audio de entrada para pipelines de voz a texto previos a un LLM, siempre que el idioma de trabajo sea sueco.

## Benchmarks y rendimiento

El autor reporta una verificación end-to-end sobre un conjunto pequeño de clips sintéticos en sueco:

| Modelo | WER (clips sintéticos en sueco) |
|---|---|
| Selbyggen/kb-whisper-large-coreml | 4,8 % |
| KB-Whisper small | 5,6 % |
| OpenAI whisper-large-v3 | 5,6 % |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo ASR. Tampoco se documentan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM: no aplica en el sentido tradicional; el modelo se ejecuta en el Apple Neural Engine y en memoria unificada de los dispositivos Apple. El repositorio ocupa 3,1 GB, lo que da una idea del espacio en disco necesario.
- GPU recomendadas: hardware Apple Silicon (serie M de Mac, chips A de iPhone/iPad) con soporte para Core ML y ANE. No se documenta compatibilidad con GPU NVIDIA o AMD.
- Cabe en hardware de consumo Apple: sí, siempre que el dispositivo soporte WhisperKit y disponga de memoria suficiente para un modelo large en float16.
- Opciones de despliegue: WhisperKit (librería Swift) mediante `WhisperKit.download` y `WhisperKit(WhisperKitConfig(modelFolder:))`; no se documentan opciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Selbyggen/kb-whisper-large-coreml | ~1550 M (heredados) | ventana de audio de 30 s (Whisper) | WER 4,8 % en clips sintéticos (autor) | Apache 2.0 | HuggingFace, formato Core ML |
| KBLab/kb-whisper-large | ~1550 M | ventana de audio de 30 s (Whisper) | no disponible en esta ficha | Apache 2.0 | HuggingFace, formato original |
| KB-Whisper small | no disponible | ventana de audio de 30 s (Whisper) | WER 5,6 % en clips sintéticos (autor) | no disponible en esta ficha | HuggingFace |
| OpenAI whisper-large-v3 | ~1550 M | ventana de audio de 30 s (Whisper) | WER 5,6 % en clips sintéticos (autor) | no disponible en esta ficha | HuggingFace, OpenAI |

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo nuevo: cualquier sesgo o limitación del modelo original de KBLab se hereda sin cambios.
- El idioma soportado es únicamente sueco; no se garantiza un rendimiento adecuado en otras lenguas.
- La verificación de calidad se realizó sobre un conjunto pequeño de clips sintéticos, no sobre benchmarks estandarizados ni sobre audio real diverso; el WER de 4,8 % debe tomarse con cautela.
- La comprobación que compara el decoder PyTorch de whisperkittools con la referencia de `transformers` falló (PSNR 10,4), lo que introduce una incertidumbre adicional sobre la fidelidad de la conversión pese a la verificación end-to-end.
- Riesgo de alucinación inherente a los modelos Whisper en segmentos de silencio o audio ruidoso; no se documenta mitigación específica en esta conversión.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo original de KBLab y de las dependencias (WhisperKit, whisperkittools) antes de desplegar en producción.
- Dependencia del ecosistema Apple: no es desplegable en infraestructura Linux/NVIDIA sin reconvertir el modelo.
- El repositorio tiene pocas descargas (13) y ningún like en el momento de la consulta, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Selbyggen/kb-whisper-large-coreml
- Modelo base: https://huggingface.co/KBLab/kb-whisper-large
- KBLab: https://huggingface.co/KBLab
- WhisperKit: https://github.com/argmaxinc/WhisperKit
- whisperkittools: https://github.com/argmaxinc/whisperkittools
- App de referencia: https://sagtapp.com/sv/
