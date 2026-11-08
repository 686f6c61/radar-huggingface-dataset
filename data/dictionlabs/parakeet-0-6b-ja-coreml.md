# DictionLabs/parakeet-0.6b-ja-coreml

## Resumen

Parakeet TDT-CTC 0.6B Japanese — Core ML (Diction mirror) es una conversión a Core ML del modelo de reconocimiento automático del habla `nvidia/parakeet-tdt_ctc-0.6b-ja`, empaquetada para su ejecución en el Neural Engine (ANE) de los chips Apple Silicon. La publica DictionLabs como espejo byte a byte de los ficheros que descarga la app de dictado en japonés Diction para iOS, de modo que la aplicación pueda servir los pesos desde un espacio de nombres bajo su control. La conversión original la realizó FluidInference y este repositorio no introduce cambios en los ficheros del modelo.

El modelo resuelve transcripción de voz a texto en japonés en local, sin conexión a la nube, sobre dispositivos iOS 17 o superiores. Se apoya en la arquitectura híbrida FastConformer-TDT-CTC de NVIDIA, con unos 600 millones de parámetros y un vocabulario de 3072 tokens SentencePiece BPE en japonés. El formato de pesos es Core ML (`Preprocessor.mlmodelc`, `Encoder.mlmodelc`, `Decoderv2.mlmodelc`, `Jointerv2.mlmodelc`), no safetensors ni GGUF.

Su relevancia es acotada: no es un modelo de propósito general sino un artefacto de despliegue para una app concreta. Resulta útil para desarrolladores que quieran integrar dictado japonés on-device en aplicaciones Apple con FluidAudio, o como referencia de cómo se empaqueta un ASR de NVIDIA en Core ML para el ANE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida FastConformer-TDT-CTC (transformer convolucional con decodificación Token-and-Duration Transducer y cabeza CTC) |
| Parametros totales | 0,6 B (600 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; la duración máxima por fragmento de audio es de 15 segundos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japonés (ja) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Core ML (`.mlmodelc`); ficheros JSON auxiliares en la raíz del repositorio |

Otros datos: frecuencia de muestreo de 16 kHz, vocabulario de 3072 tokens SentencePiece BPE, plataforma iOS 17 o superior, tamaño del repositorio de 0,6 GB, librería `fluidaudio`.

## Arquitectura y entrenamiento

El modelo subyacente es `nvidia/parakeet-tdt_ctc-0.6b-ja`, un ASR de NVIDIA basado en FastConformer (variante eficiente de Conformer con atención por bloques) combinado con un decodificador TDT (Token-and-Duration Transducer) y una cabeza CTC auxiliar. Esta combinación permite emitir tokens junto con su duración, lo que reduce el número de pasos de decodificación frente a un transducer clásico y mejora la latencia en inferencia en streaming o por fragmentos. La entrada se procesa en ventanas de hasta 15 segundos a 16 kHz.

La información disponible no detalla el volumen de datos de entrenamiento, la composición del corpus japonés, ni si hubo etapas de ajuste fino supervisado o preferencias. La conversión a Core ML la realizó FluidInference, que tradujo los módulos de preprocesado, encoder, decoder y jointer a grafos Core ML ejecutables en el ANE; DictionLabs redistribuye esos mismos ficheros sin modificaciones.

## Capacidades

- Reconocimiento automático del habla en japonés (transcripción de audio a texto).
- Ejecución completamente on-device sobre Apple Silicon, con uso del Neural Engine.
- Procesamiento por fragmentos de audio de hasta 15 segundos a 16 kHz.
- Salida con vocabulario japonés de 3072 tokens SentencePiece BPE.
- Integración con la librería FluidAudio mediante `AsrModels` (versión `.tdtJa`).
- No soporta tool calling, function calling, agentes, visión, audio generativo ni modo de razonamiento; es exclusivamente un modelo ASR.

## Casos de uso

- Dictado por voz en aplicaciones iOS: el modelo transcribe japonés en local dentro de la app Diction, sin enviar audio a servidores, lo que reduce latencia y preserva la privacidad del usuario.
- Funciones de accesibilidad: subtitulado en tiempo casi real de conversaciones o contenido hablado en japonés para usuarios con discapacidad auditiva, aprovechando la ejecución en el ANE sin coste de red.
- Notas de voz transcritas: aplicaciones de productividad que convierten grabaciones cortas (hasta 15 segundos por fragmento) en texto editable en el propio dispositivo.
- Asistentes de voz integrados: entrada por voz para comandos o búsquedas en japonés dentro de apps nativas de Apple, usando FluidAudio como capa de integración.
- Transcripción de reuniones o entrevistas por segmentos: dividiendo el audio en fragmentos de 15 segundos se puede encadenar la salida para obtener actas en japonés sin conexión.
- Prototipado de pipelines ASR en macOS/iOS: sirve como referencia para evaluar el rendimiento del ANE con un FastConformer-TDT-CTC de 0,6 B antes de adoptar el modelo original de NVIDIA en otros entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en el Neural Engine y la memoria unificada de los chips Apple Silicon. El repositorio ocupa 0,6 GB.
- GPU recomendadas: no aplica; requiere Apple Silicon (ANE). No está pensado para GPU NVIDIA o AMD.
- Compatibilidad con GPU de consumo: no; el formato Core ML con módulos `.mlmodelc` está orientado a Apple Silicon, no a RTX 4090 ni similares.
- Plataforma mínima indicada: iOS 17 o superior.
- Opciones de despliegue: FluidAudio (`AsrModels`, versión `.tdtJa`) en apps iOS/macOS; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR en Core ML.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / fragmento | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DictionLabs/parakeet-0.6b-ja-coreml | 0,6 B | 15 s por fragmento | ja | Core ML | CC-BY-4.0 | Hugging Face (espejo) |
| FluidInference/parakeet-0.6b-ja-coreml | 0,6 B | 15 s por fragmento | ja | Core ML | CC-BY-4.0 | Hugging Face |
| nvidia/parakeet-tdt_ctc-0.6b-ja | 0,6 B | 15 s por fragmento | ja | safetensors (formato original NVIDIA) | CC-BY-4.0 | Hugging Face |

Las tres variantes comparten pesos y arquitectura; difieren en el formato de empaquetado y en el mantenedor. No se dispone de datos de benchmarks para comparar el rendimiento relativo entre ellas.

## Limitaciones y advertencias

- Solo reconoce japonés; no es multilingüe.
- Diseñado para fragmentos de audio de hasta 15 segundos; audios más largos requieren segmentación y ensamblaje de la salida.
- Es un espejo sin modificaciones: cualquier error o limitación del modelo original de NVIDIA se hereda.
- No hay información publicada sobre sesgos, tasas de alucinación o robustez ante acentos, ruido o habla espontánea.
- La licencia CC-BY-4.0 permite uso comercial, pero exige mantener la atribución a NVIDIA y a FluidInference al redistribuir.
- El formato Core ML limita su uso a Apple Silicon; no es portable a otros entornos sin reconversión.
- Al ser un artefacto de despliegue para una app concreta, no se documentan garantías de mantenimiento ni actualizaciones.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/DictionLabs/parakeet-0.6b-ja-coreml
- Repositorio original de la conversión: https://huggingface.co/FluidInference/parakeet-0.6b-ja-coreml
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt_ctc-0.6b-ja
- Espejo en ModelScope: https://www.modelscope.cn/models/Jiangdi/parakeet-0.6b-ja-coreml
- App Diction: https://diction.one
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
