# pdnhan/whisper-tiny.en-mobile

## Resumen

Whisper tiny.en mobile es una conversión a ONNX con cuantización int8 del modelo de reconocimiento automático de voz Whisper tiny.en de OpenAI, publicada por el usuario pdnhan. El modelo está pensado para inferencia en dispositivo (on-device) sobre Android mediante ONNX Runtime, y se utiliza en la aplicación Thì Thầm para el reconocimiento de voz en inglés. No introduce cambios en los pesos ni en los nodos del grafo: parte de la exportación de Xenova (transformers.js) y solo elimina los mapas de atención de las salidas declaradas del grafo para reducir el consumo de memoria.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de una mejora de capacidades, sino de un artefacto de despliegue optimizado. Su interés práctico reside en la reducción de memoria pico por transcripción, de 511 MB a 347 MB según las mediciones del autor, lo que facilita ejecutar ASR en inglés en dispositivos móviles con recursos limitados. El modelo conserva la arquitectura encoder-decoder transformer de Whisper tiny, con aproximadamente 39 millones de parámetros en su versión original, aunque el autor no publica el recuento exacto en esta ficha.

El modelo es monolingüe (inglés), tiene licencia Apache 2.0 y se distribuye únicamente en formato ONNX cuantizado. No se han publicado resultados de benchmarks propios ni comparativas de precisión frente al modelo original más allá de una comprobación de equivalencia de tokens sobre dos clips de FLEURS.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny), exportado a ONNX |
| Parámetros totales | no disponible (el modelo base openai/whisper-tiny.en tiene ~39 M, dato no confirmado en la ficha del autor) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (log-mel de entrada [1, 80, 3000]); longitud de secuencia de decoder no disponible |
| Tipos de cuantización | int8 (archivos `*_quantized.onnx`) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_merged_quantized.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper tiny en su variante solo inglés: un transformer encoder-decoder con atención estándar, que procesa espectrogramas log-mel de 30 segundos (80 canales mel, 3000 frames) y genera tokens de texto de forma autorregresiva. El encoder recibe `input_features` en float32 con forma [1, 80, 3000] y produce `last_hidden_state`; el decoder es un grafo fusionado (`decoder_model_merged_quantized.onnx`) que acepta `input_ids`, `encoder_hidden_states`, `use_cache_branch` y las `past_key_values`, y devuelve `logits` y `present.*`. El prompt de decodificación es `[50257, 50362]` (`<|startoftranscript|>`, `<|notimestamps|>`) y la parada se produce en el token 50256 (`<|endoftext|>`).

No hay entrenamiento adicional ni fine-tuning: el autor indica explícitamente que los pesos, los nodos y los resultados son idénticos a los de Xenova/whisper-tiny.en en el commit `79fb389fc764e7c395bd330e9531d9d32ada7049`. La única modificación es de grafo: los mapas de atención dejan de ser salidas declaradas, porque ONNX Runtime mantiene en memoria las salidas declaradas y eso inflaba el consumo por transcripción. La conversión se realizó con el script `make_mobile.py`, incluido en el repositorio por trazabilidad. No se documentan datos de entrenamiento, composición del corpus, ni fases de RLHF o DPO, ya que corresponden al modelo original de OpenAI y no se reproducen aquí.

## Capacidades

- Reconocimiento automático de voz (ASR) en inglés sobre audio de hasta 30 segundos por ventana.
- Transcripción sin marcas de tiempo: el prompt fija `<|notimestamps|>`, por lo que no se generan timestamps por token.
- Decodificación autorregresiva con caché KV (`past_key_values` / `present.*`), adecuada para decodificación greedy paso a paso en dispositivos.
- Inferencia en dispositivo con ONNX Runtime, sin dependencia de servidor.
- Ejecución cuantizada int8, orientada a CPU móvil y a entornos con memoria restringida.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.
- No es multilingüe: solo inglés, por ser la variante `.en` de Whisper tiny.

## Casos de uso

- Transcripción de notas de voz en una app Android: el modelo procesa clips de hasta 30 segundos con un consumo pico medido de 347 MB, lo que permite ejecutarlo en segundo plano en teléfonos de gama media sin servicio en la nube.
- Dictado por voz en campos de formulario: al ser monolingüe en inglés y de baja latencia, encaja en interfaces de entrada de texto donde se transcribe cada fragmento de audio de forma local.
- Subtitulado aproximado de audio corto en inglés: útil para generar texto de apoyo en vídeos o mensajes de voz, asumiendo la ausencia de timestamps.
- Asistentes de voz offline con requisitos de privacidad: al ejecutarse en el dispositivo, el audio no sale del terminal, lo que simplifica el cumplimiento de normativa de datos.
- Prototipado y pruebas de pipelines ASR en móvil: sirve como referencia de integración de ONNX Runtime con encoder y decoder separados y caché KV.
- Aplicaciones de accesibilidad: transcripción local de voz a texto para personas con dificultades auditivas en conversaciones presenciales en inglés.
- Evaluación comparativa de exportaciones ONNX: útil para medir memoria pico y fidelidad de tokens frente a la exportación de Xenova en un mismo dispositivo.

## Benchmarks y rendimiento

El autor no publica métricas de precisión (WER, MMLU, etc.). Solo documenta memoria pico y una comprobación de equivalencia.

| Métrica | Xenova/whisper-tiny.en | Esta copia |
|---|---|---|
| Memoria pico neta por transcripción (encoder + 20 pasos de decoder, ONNX Runtime 1.31.1, 4 hilos intra-op, ENABLE_ALL) | 511 MB | 347 MB |
| Equivalencia de tokens (2 clips FLEURS en inglés, 30 pasos greedy desde el prompt) | referencia | idénticos |
| Equivalencia de salida del encoder | referencia | idéntica |

No se han publicado resultados de benchmarks de precisión (WER u otros) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el autor mide 347 MB de memoria pico neta por transcripción con ambos grafos cargados y 20 pasos de decoder; el espacio en disco del repositorio figura como 0.0 GB, por lo que el tamaño exacto de los archivos no está disponible.
- GPU recomendadas: no aplica de forma específica; el artefacto está orientado a CPU móvil con ONNX Runtime. No se documentan pruebas en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no documentada. Al ser un grafo ONNX cuantizado int8, puede ejecutarse en CPU y, potencialmente, con execution providers de ONNX Runtime, pero el autor no aporta datos al respecto.
- Opciones de despliegue: ONNX Runtime (versión de referencia 1.31.1), con optimización de grafo ENABLE_ALL y 4 hilos intra-op en las mediciones. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este artefacto.
- Latencia y throughput: no disponibles. Solo se reporta el consumo de memoria, no tiempos de ejecución.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Formato | Licencia | Memoria pico documentada |
|---|---|---|---|---|---|---|
| pdnhan/whisper-tiny.en-mobile | no disponible (~39 M en el base) | 30 s | en | ONNX int8 | Apache 2.0 | 347 MB |
| Xenova/whisper-tiny.en | no disponible (~39 M en el base) | 30 s | en | ONNX (transformers.js) | Apache 2.0 | 511 MB |
| openai/whisper-tiny.en | ~39 M (dato del modelo original, no confirmado en esta ficha) | 30 s | en | PyTorch (safetensors/bin) | Apache 2.0 en HF; MIT en el repositorio openai/whisper | no disponible |

La comparativa se limita a variantes del mismo modelo base, ya que el autor no ofrece datos frente a otros sistemas ASR. No hay información sobre WER comparado con whisper-base.en, whisper-small.en u otras alternativas.

## Limitaciones y advertencias

- Modelo monolingüe en inglés: no transcribe otros idiomas.
- Ventana de audio limitada a 30 segundos por inferencia; audios más largos requieren segmentación externa.
- Sin timestamps: el prompt fuerza `<|notimestamps|>`, por lo que no se obtienen marcas temporales por token.
- Riesgo de alucinación típico de Whisper en audio con ruido, silencios largos o habla no inglesa; el autor no documenta mitigaciones.
- Sesgos heredados del corpus de entrenamiento original de OpenAI, no evaluados en esta ficha.
- La cuantización int8 puede degradar ligeramente la precisión frente al modelo en float32; el autor solo verifica equivalencia de tokens en 2 clips de FLEURS, una muestra muy reducida.
- El repositorio figura con 0 descargas y 0 likes, y tamaño de 0.0 GB: la disponibilidad y el estado de los archivos no están verificados más allá de la model card.
- Uso comercial permitido por Apache 2.0, con la salvedad de que el código y los pesos originales de Whisper en el repositorio de OpenAI se distribuyen bajo licencia MIT; conviene revisar ambas.
- No apto para tareas de razonamiento, código, matemáticas, visión ni agentes.
- Para producción en móvil, validar el consumo real en el dispositivo objetivo: las cifras de memoria se midieron en procesos nuevos con una configuración concreta de ONNX Runtime.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pdnhan/whisper-tiny.en-mobile
- Modelo base: https://huggingface.co/openai/whisper-tiny.en
- Exportación ONNX de referencia: https://huggingface.co/Xenova/whisper-tiny.en
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Repositorio de la aplicación Thì Thầm: no disponible (el autor menciona `tools/whisper_en` pero no enlaza la URL)
- Paper de Whisper: no disponible en la información proporcionada
