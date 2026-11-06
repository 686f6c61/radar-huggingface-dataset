# codingSalafi/akoway-bark-3.0-clean-onnx

## Resumen

Underdog Bark 3.0 Clean — ONNX es una conversión al formato ONNX del modelo de reconocimiento automático del habla ConwayResearch/Underdog-Bark-3.0-Clean, publicada por el usuario codingSalafi para integrarse en Akoway, un teclado de voz offline y gratuito para Windows. El modelo no se limita a transcribir: aplica limpieza simultánea del texto dictado, eliminando muletillas ("um", "uh"), falsos comienzos y palabras repetidas, de modo que la salida es una transcripción ya normalizada.

La arquitectura subyacente es un sistema ASR de tipo transducer (TDT, Token-and-Duration Transducer) con encoder FastConformer, red de predicción LSTM y red conjunta que emite 8193 logits de token más 5 logits de duración. La conversión ONNX cuantiza los pesos lineales del encoder a 8 bits con escalas por fila (MatMulNBits), mantiene las activaciones en fp32 y comprime todos los artefactos con Brotli (242 MB de descarga, 705 MB descomprimidos).

Es relevante porque demuestra que un modelo ASR de tamaño medio puede ejecutarse íntegramente en CPU con ONNX Runtime manteniendo transcripciones idénticas al modelo de referencia en la batería de pruebas publicada (74 de 74 clips), lo que habilita dictado por voz local sin GPU y sin conexión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer TDT (FastConformer encoder + LSTM prediction network + joint network) |
| Parametros totales | no disponible (repo ONNX de 0,5 GB; encoder int8 de 634 MB descomprimido) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio; no se especifica límite en la model card) |
| Tipos de cuantizacion | Pesos lineales del encoder en int8 con escala por fila (MatMulNBits); convoluciones pointwise int8 con escalas por canal; activaciones en fp32; variante `fast/` con `accuracy_level=4` (activaciones int8 blockwise) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX comprimido con Brotli (`.onnx.br`); preprocessor, encoder.int8, decoder, joiner y tokens.txt |

## Arquitectura y entrenamiento

El modelo es un transducer TDT: un encoder FastConformer procesa las características log-mel (128 bins, 16 kHz) y alimenta una red de predicción LSTM que consume un token por llamada; la red conjunta combina ambas representaciones y emite 8193 logits de vocabulario junto con 5 logits de duración, lo que permite al decodificador avanzar varios frames por paso. La decodificación es greedy TDT sin silencio inicial, tal como se evaluó el modelo original.

La model card no detalla el volumen de datos de entrenamiento, la composición del corpus ni si hubo etapas de RLHF o DPO; esa información corresponde al modelo base ConwayResearch/Underdog-Bark-3.0-Clean y no se reproduce aquí. La innovación técnica de esta conversión reside en la estrategia de cuantización: el `model.bark` original almacena solo unos pocos valores por fila de cada matriz grande (5, o 7 en cuatro capas), y la conversión asigna a cada fila su propia escala de 8 bits elegida para que esos valores caigan en la rejilla, manteniendo los pesos dentro del redondeo fp16. Cuantizar también las activaciones con int8 dinámico estándar alteraba 11 de 74 transcripciones de prueba, por lo que se descartó en la variante principal.

## Capacidades

- Transcripción de voz a texto en inglés con limpieza integrada: elimina muletillas, frases de relleno, falsos comienzos y palabras repetidas en la misma pasada.
- Reconocimiento sobre audio de 16 kHz con extracción de características log-mel de 128 bins exportada como grafo ONNX independiente.
- Decodificación TDT greedy con predicción de duración, que reduce el número de pasos frente a transducers convencionales.
- Ejecución íntegra en CPU mediante ONNX Runtime, sin requisito de GPU.
- Variante `fast/` optimizada para dispositivos móviles con cuantización de activaciones blockwise.
- Referencia de implementación en Python y C# dentro del repositorio Akoway (`tools/bark-onnx/compare_onnx.py`).
- No soporta tool calling, agentes, visión, audio de entrada más allá del dictado ni capacidades multilingües: únicamente inglés.

## Casos de uso

- Dictado por voz en escritorio Windows: Akoway descarga los archivos en el primer uso y ejecuta la inferencia en CPU, de modo que el usuario obtiene transcripción limpia sin conexión ni envío de audio a servidores externos.
- Aplicaciones de accesibilidad: personas con movilidad reducida pueden redactar correos y documentos dictando; la limpieza integrada evita que las muletillas del habla natural lleguen al texto final.
- Notas de reuniones y actas: el modelo transcribe intervenciones y elimina repeticiones y arranques falsos, reduciendo el trabajo de post-edición sobre el texto generado.
- Integración en editores de código o IDE como entrada de comentarios y documentación por voz: al ejecutarse en CPU, no compite por la GPU que usa el modelo de lenguaje del entorno.
- Transcripción por lotes de audio de dominio público en inglés (por ejemplo, corpus LibriSpeech) en pipelines sin GPU, con throughput suficiente para procesamiento offline.
- Aplicaciones Android mediante la variante `fast/`: dictado en movilidad con latencia reducida (encoder de ~1,2 s por cada 10 s de audio en un Pixel 6 Pro).
- Prototipado e investigación en ASR: el grafo ONNX y el script de comparación permiten verificar conversiones y medir WER frente al modelo de referencia.

## Benchmarks y rendimiento

| Métrica | Referencia (`bark_loader.py`) | Estos archivos ONNX (Python y C#) |
|---|--:|--:|
| Transcripciones idénticas (74 clips) | — | 74 / 74 |
| WER vs referencias LibriSpeech | 4,43 % | 4,43 % |

| Métrica (variante `fast/`, Pixel 6 Pro) | Valor |
|---|--:|
| Encoder por 10 s de audio | ~4,0 s → ~1,2 s |
| Dictado corto | 2,2 s → 0,4 s |
| Transcripciones idénticas frente a la variante principal | 70 / 74 (las 4 restantes difieren solo en coma o mayúscula) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al tratarse de un modelo ASR.

## Requisitos de hardware

- Inferencia en CPU con ONNX Runtime; no se requiere GPU.
- Descarga de 242 MB (Brotli, calidad 11); 705 MB descomprimidos en disco.
- Memoria RAM estimada: no disponible de forma explícita; el encoder int8 descomprimido ocupa 634 MB, por lo que se recomienda al menos 2 GB libres para el proceso completo.
- GPUs recomendadas: no aplica; el diseño es CPU-first. Cualquier GPU compatible con ONNX Runtime (CUDA o DirectML) podría acelerar la ejecución, pero no se documentan cifras.
- Cabe en cualquier equipo de consumo, incluidos portátiles modestos y teléfonos Android (Pixel 6 Pro validado con la variante `fast/`).
- Opciones de despliegue: ONNX Runtime (Python y C#), con integración directa en la aplicación Akoway; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia: en Pixel 6 Pro, ~1,2 s de encoder por cada 10 s de audio con `fast/`; el resto de plataformas no reporta cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto / audio | Licencia | Formato |
|---|---|---|---|---|---|
| Underdog Bark 3.0 Clean — ONNX (este) | TDT + FastConformer, con limpieza integrada | en | 16 kHz, ventana no especificada | CC-BY-4.0 | ONNX (Brotli) |
| ConwayResearch/Underdog-Bark-3.0-Clean | TDT + FastConformer, con limpieza integrada | en | 16 kHz | CC-BY-4.0 | `model.bark` (formato propio) |
| nvidia/parakeet-tdt-0.6b-v3 | TDT + FastConformer | multilingüe (según versión) | 16 kHz | no disponible en la información | NeMo / safetensors |
| moondream/parakeet-ultra | Derivado de Parakeet | no disponible | no disponible | no disponible | no disponible |

Los modelos comparables citados son los ancestros declarados en la propia model card (NVIDIA Parakeet y Moondream Parakeet Ultra); no se dispone de sus especificaciones completas en la información proporcionada.

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte multilingüe declarado.
- El modelo aplica limpieza del habla de forma automática, lo que puede eliminar repeticiones intencionadas o reformulaciones que el usuario quisiera conservar.
- Riesgo de alucinación inherente a los modelos ASR, especialmente con audio ruidoso, acentos no representados en el entrenamiento o vocabulario técnico; la model card solo valida 74 clips de LibriSpeech clean más una grabación ruidosa.
- La cuantización int8 de pesos introduce un error acotado al redondeo fp16 según el autor, pero no se han publicado evaluaciones sobre dominios distintos de LibriSpeech.
- La variante `fast/` altera ligeramente la salida en 4 de 74 transcripciones (puntuación y mayúsculas), lo que puede ser relevante en flujos con validación estricta.
- Licencia CC-BY-4.0: permite uso comercial con atribución obligatoria a Conway Research, NVIDIA, Moondream y al autor de la conversión; debe conservarse el aviso `LICENSE-NOTICE.txt`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.
- Dependencia de ONNX Runtime y de la estructura exacta de los grafos; cambios de versión del runtime podrían afectar a la reproducibilidad de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/codingSalafi/akoway-bark-3.0-clean-onnx
- Modelo base: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Clean
- Repositorio Akoway: https://github.com/codingSalafi/Akoway
- Script de comparación ONNX: https://github.com/codingSalafi/Akoway/tree/main/tools/bark-onnx
- Modelo ancestro NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Modelo ancestro Moondream: https://huggingface.co/moondream/parakeet-ultra
