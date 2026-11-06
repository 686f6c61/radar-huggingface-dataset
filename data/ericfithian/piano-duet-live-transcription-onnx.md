# ericfithian/piano-duet-live-transcription-onnx

## Resumen

Este repositorio contiene una adaptación a ONNX del modelo de transcripción de piano de alta resolución desarrollado por Qiuqiang Kong y colaboradores, descrito en el artículo "High-resolution Piano Transcription with Pedals by Regressing Onset and Offset Times" (arXiv:2010.01815). El checkpoint original fue publicado por Qiuqiang Kong en Zenodo (DOI 10.5281/zenodo.4034264) bajo licencia CC BY 4.0, y la conversión a ONNX parte del grafo publicado por el usuario stelee en Hugging Face. El autor de esta ficha, ericfithian, ha realizado una adaptación orientada a inferencia en vivo, con particionado de grafos para ejecución en WebGPU y WebAssembly.

El modelo no es un modelo de lenguaje: es un sistema de transcripción automática de música (AMT) que convierte audio de piano en eventos de nota (onset, frame, offset y velocidad), además de pedales. Esta adaptación concreta ofrece dos modos: un modo "live" que acepta ventanas de dos segundos de audio mono a 16 kHz y un modo "full-phrase" que acepta ventanas de diez segundos y conserva las cabeceras de offset de nota y de pedal. La relevancia actual reside en que permite ejecutar transcripción de piano directamente en el navegador mediante ONNX Runtime Web, sin depender de infraestructura de servidor.

El repositorio ocupa 0,3 GB y contiene cinco grafos ONNX en FP32 (sin cuantización publicada), con hashes SHA-256 verificables. No se han publicado resultados de benchmarks, ni información sobre cuantización, ni paridad completa con grabaciones reales; el propio autor lo indica explícitamente en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para transcripción de piano (arquitectura exacta no detallada en la información disponible; el artículo de referencia describe un modelo con cabeceras de onset, offset, frame y velocidad) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 2 s (modo live) y 10 s (modo full-phrase) |
| Tipos de cuantizacion | no disponible (los grafos publicados son FP32; el autor indica que la cuantización "remain to be tested") |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | cc-by-4.0 (pesos); el paquete de inferencia asociado declara MIT para el código |
| Formato de pesos | ONNX (FP32) |
| Frecuencia de muestreo de entrada | 16 kHz mono |
| Salidas | onset, frame, velocity (modo live); onset, offset, frame, velocity, pedal offset, pedal frame (modo full-phrase) |
| Versiones de herramientas | ONNX 1.23.2, ONNX Runtime 1.30.0 |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo de transcripción de piano de alta resolución de Kong et al., que emplea una red con representaciones de onset y offset regresadas temporalmente, además de cabeceras de frame, velocidad y pedal. El repositorio no detalla la topología interna (número de capas, dimensión de hidden, tipo de capas convolucionales o recurrentes), pero el particionado en `convolution.onnx` y `recurrent.onnx` (y sus equivalentes `phrase-*`) sugiere una separación entre un bloque convolucional y un bloque recurrente. En el modo full-phrase, el grafo se particiona en 18 entradas recurrentes.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens o ejemplos, ni sobre si se empleó RLHF o DPO (no aplica en un modelo de audio). La innovación técnica de esta adaptación es la conversión a ONNX, la poda del grafo (`graph.onnx` es una versión podada para WASM) y el particionado para ejecución híbrida: el grafo convolucional en WebGPU y el recurrente en WASM, con optimización de grafo desactivada y un post-procesador de referencia. La cabecera de onset de pedal se omite en el modo full-phrase.

## Capacidades

- Transcripción de audio de piano en eventos de nota discretos (onset, frame, velocity).
- En modo full-phrase, además, offset de nota y offset/frame de pedal.
- Procesamiento de ventanas de audio cortas: 2 s (modo live) o 10 s (modo full-phrase).
- Ejecución en navegador mediante ONNX Runtime Web (WebGPU y WebAssembly).
- Particionado de grafo para repartir carga entre GPU y CPU/WASM.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües (no es un modelo de lenguaje).
- No incluye modo "thinking", visión ni audio de entrada distinto de la transcripción musical.

## Casos de uso

- Transcripción de piano en el navegador: usar `graph.onnx` o los grafos particionados con ONNX Runtime Web para convertir audio de un micrófono o de un archivo en eventos MIDI-like sin servidor, aprovechando la ventana de 2 s del modo live.
- Herramienta educativa de práctica musical: el modo live permite retroalimentación casi en tiempo real sobre las notas tocadas, mostrando onset y velocity para evaluar dinámica y precisión.
- Anotación de grabaciones de piano: el modo full-phrase con ventanas de 10 s y salidas de offset y pedal es adecuado para generar anotaciones de partituras o datasets de investigación.
- Aplicaciones de karaoke o visualización musical: los eventos de nota y pedal pueden alimentar visualizadores o sintetizadores en tiempo real dentro de una web app.
- Investigación en AMT (automatic music transcription): el repositorio sirve como base reproducible (hashes SHA-256, versiones de ONNX) para experimentos de transcripción con pedales.
- Prototipado de plugins de audio web: la partición WebGPU/WASM permite integrar transcripción en editores de audio o DAWs basados en navegador.
- Evaluación de despliegue en edge: útil para medir latencia y viabilidad de modelos de audio en dispositivos sin GPU dedicada mediante WASM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que la paridad con grabaciones reales ("broader recorded-performance parity") y la cuantización están pendientes de probar.

## Requisitos de hardware

- VRAM estimada: no disponible; los grafos son FP32 y el mayor (`graph.onnx`) ocupa unos 98,7 MB, por lo que la huella de pesos es inferior a 100 MB por grafo.
- GPU recomendadas: no se especifican; el diseño apunta a ejecución en WebGPU (navegador) y WebAssembly, no a GPUs de datacenter como A100 o H100.
- Compatibilidad con GPU de consumo: probable en cualquier GPU con soporte WebGPU (integrada o dedicada), dado el tamaño reducido de los grafos, aunque no se confirma latencia ni throughput.
- Opciones de despliegue: ONNX Runtime (versión 1.30.0), ONNX Runtime Web (WebGPU y WASM), paquete de inferencia `piano-transcription-inference` en PyPI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Ventana de audio | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ericfithian/piano-duet-live-transcription-onnx | Transcripción de piano (ONNX, live y full-phrase) | 2 s / 10 s | ONNX FP32 | CC BY 4.0 | Hugging Face |
| stelee/piano-transcription-onnx | Transcripción de piano (ONNX, grafo base) | no disponible | ONNX | no disponible | Hugging Face |
| Checkpoint original de Kong et al. (Zenodo) | Transcripción de piano de alta resolución | no disponible | PyTorch (checkpoint) | CC BY 4.0 | Zenodo |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico para piano; no transcribe otros instrumentos ni voz.
- Requiere audio mono a 16 kHz; no se documenta el comportamiento con otras frecuencias o canales.
- Ventanas cortas (2 s o 10 s): no está pensado para transcripciones de obras completas en una sola pasada.
- La cuantización no está probada; solo hay grafos FP32.
- La paridad con grabaciones reales no está validada según el autor.
- La cabecera de onset de pedal se omite en el modo full-phrase.
- Licencia CC BY 4.0: permite uso comercial con atribución; el código del paquete de inferencia es MIT, pero los pesos mantienen CC BY 4.0.
- Riesgo de errores en pasajes polifónicos densos o con pedales complejos (no cuantificado en la información disponible).
- No es un modelo de lenguaje: no debe evaluarse con métricas de NLP ni usarse para tareas de texto.

## Enlaces

- Hugging Face: https://huggingface.co/ericfithian/piano-duet-live-transcription-onnx
- Grafo ONNX base: https://huggingface.co/stelee/piano-transcription-onnx
- Checkpoint original en Zenodo: https://doi.org/10.5281/zenodo.4034264
- Artículo: https://arxiv.org/abs/2010.01815
- Paquete de inferencia en PyPI: https://pypi.org/project/piano-transcription-inference/
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
