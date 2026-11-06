# LaToucheCarre/LaToucheCarre-Mac-Voix-Parakeet-Ultra-0.6B-CoreML

## Resumen

Parakeet Ultra 0.6B Core ML es un modelo de reconocimiento automático del habla (ASR) empaquetado en formato Core ML compilado (`.mlmodelc`) para su ejecución nativa en macOS sobre Apple Silicon, aprovechando el Neural Engine, la GPU o la CPU del sistema. Lo publica La Touche Carré, un proyecto francés de dictado, como equivalente para Mac de sus repositorios GGML para Windows. El modelo deriva de `moondream/parakeet-ultra`, un post-entrenamiento de `nvidia/parakeet-tdt-0.6b-v3` de NVIDIA, ambos bajo licencia CC-BY-4.0.

La arquitectura subyacente es FastConformer con decodificación TDT (Token-and-Duration Transducer), un esquema que predice conjuntamente el token y su duración, lo que permite streaming eficiente y buena precisión en audio largo. El paquete Core ML divide el modelo en cuatro submodelos: preprocesador (audio de 16 kHz a mel), encoder (~594 MB de pesos), red de predicción del decodificador y red conjunta (token + duración).

Su relevancia ahora es práctica: ofrece una ruta de despliegue local y sin conexión para dictado multilingüe (francés e inglés) en equipos Mac, con un tamaño de repositorio de 0,6 GB y sin dependencia de servicios en la nube. La información pública disponible es escasa: no se detallan datos de entrenamiento, benchmarks ni límites de contexto en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer + decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 0,6B (según nombre del modelo y base `parakeet-tdt-0.6b-v3`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; entrada de audio, no texto) |
| Tipos de cuantizacion | no disponible (pesos Core ML compilados; sin variantes de cuantización documentadas) |
| Idiomas soportados | fr, en, multilingual (según tags de la model card) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Core ML compilado (`.mlmodelc`), distribuido en ZIP |

## Arquitectura y entrenamiento

El modelo es un sistema ASR completo basado en FastConformer como encoder y un decodificador TDT. El paquete Core ML se descompone en `Preprocessor.mlmodelc` (conversión de audio a 16 kHz en mel), `Encoder.mlmodelc` (encoder FastConformer, ~594 MB de pesos descomprimidos), `Decoder.mlmodelc` (red de predicción TDT) y `JointDecisionv3.mlmodelc` (red conjunta que emite token y duración). Se incluyen `config.json`, `parakeet_vocab.json` y `parakeet_v3_vocab.json` con ajustes y vocabulario. El archivo comprimido ocupa 555.016.419 bytes y 632.314.500 bytes una vez descomprimido.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. El modelo base es `moondream/parakeet-ultra`, descrito como post-entrenamiento de `nvidia/parakeet-tdt-0.6b-v3` (NVIDIA, CC-BY-4.0). La modificación de este repositorio es exclusivamente la conversión a Core ML (revisión de conversión `95eaa59`); ni Moondream ni NVIDIA están asociados a este repositorio.

## Capacidades

- Reconocimiento automático del habla (ASR) en francés e inglés, con etiqueta multilingüe.
- Decodificación TDT, que predice token y duración de forma conjunta, adecuada para transcripción eficiente.
- Ejecución local en Apple Silicon mediante Core ML, con selección de Neural Engine, GPU o CPU.
- Funcionamiento sin conexión (inferencia en dispositivo), sin llamadas a servicios externos.
- Entrada de audio a 16 kHz procesada por el preprocesador incluido.
- No se documentan capacidades de tool calling, agentes, visión, audio de salida ni modo thinking.

## Casos de uso

- Dictado por voz en macOS: integrar los `.mlmodelc` en una app nativa para transcribir dictado en francés o inglés en tiempo real, aprovechando el Neural Engine para baja latencia y consumo reducido.
- Transcripción de reuniones en local: procesar grabaciones de audio de 16 kHz sin enviar datos a la nube, útil en entornos con requisitos de privacidad.
- Subtitulado de vídeo offline: generar transcripciones para contenido en francés e inglés en flujos de postproducción en Mac, sin dependencia de APIs externas.
- Accesibilidad: convertir voz a texto en herramientas de asistencia para usuarios con movilidad reducida, con ejecución en dispositivo.
- Notas de voz a texto en aplicaciones de productividad: transcribir grabaciones cortas en el propio equipo y evitar costes de inferencia en servidor.
- Investigación en ASR sobre Apple Silicon: usar el paquete Core ML como referencia para medir latencia y throughput de FastConformer/TDT en Neural Engine frente a GPU o CPU.
- Prototipado de asistentes conversacionales por voz: encadenar el ASR local con un LLM también local para pipelines completamente offline en Mac.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM: el encoder descomprimido pesa ~594 MB; el paquete completo descomprimido ocupa 632.314.500 bytes (~0,63 GB). Se recomienda al menos 1-2 GB de memoria libre para cargar los cuatro submodelos y el estado de inferencia.
- GPU/SoC: diseñado para Apple Silicon (Neural Engine, GPU o CPU). No se documenta soporte para GPU NVIDIA ni AMD.
- Cabe en hardware de consumo: sí, en cualquier Mac con Apple Silicon; el tamaño es compatible con equipos de gama de entrada.
- Opciones de despliegue: Core ML (`.mlmodelc`) en macOS; no se documentan variantes para vLLM, llama.cpp, Ollama o TGI (son frameworks de texto, no aplicables a este paquete ASR). Para Windows existen repositorios GGML equivalentes del mismo autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Parakeet Ultra 0.6B Core ML (este) | 0,6B | audio 16 kHz | fr, en, multilingual | CC-BY-4.0 | Core ML |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6B | audio 16 kHz | no disponible en esta ficha | CC-BY-4.0 | no disponible |
| moondream/parakeet-ultra | 0,6B (base) | audio 16 kHz | no disponible en esta ficha | CC-BY-4.0 | no disponible |

No se dispone de datos de rendimiento comparativo (WER, latencia) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Solo cubre francés e inglés de forma documentada; el resto de idiomas no está garantizado pese a la etiqueta "multilingual".
- No se publican métricas de error (WER) ni evaluación independiente; el rendimiento real es desconocido.
- Riesgo de alucinación y errores de transcripción en audio con ruido, acentos marcados o vocabulario técnico no visto en entrenamiento; no cuantificado.
- Dependencia de la plataforma: el formato Core ML limita el uso a macOS/Apple Silicon; no es portable a otros entornos sin reconversión.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es obligatorio citar a La Touche Carré, Moondream y NVIDIA. Ni Moondream ni NVIDIA respaldan este repositorio.
- Verificar el SHA-256 del ZIP (`cbadc30c24c56b139ffe1e95d85618263471e0d0a864bdb281de3e0e132e3f48`) antes de descomprimir, según indica el autor.
- Sin datos sobre sesgos demográficos o lingüísticos del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/LaToucheCarre/LaToucheCarre-Mac-Voix-Parakeet-Ultra-0.6B-CoreML
- Modelo base: https://huggingface.co/moondream/parakeet-ultra
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Proyecto La Touche Carré: https://latouchecarre.fr
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
