# luweigen/qwen3-tts-1.7b-android

## Resumen

`luweigen/qwen3-tts-1.7b-android` es un paquete de artefactos derivados del modelo de síntesis de voz `Qwen/Qwen3-TTS-12Hz-1.7B-Base` de Alibaba Qwen, reempaquetados y cuantizados por el usuario `luweigen` para su ejecución nativa en dispositivos Android dentro del proyecto `read-android`, una aplicación de lectura en voz alta de documentos Markdown y texto sin conexión de red en tiempo de ejecución.

No se trata de un modelo nuevo ni de un fine-tuning: es una conversión de formato y cuantización del TTS original (1,7B parámetros) a artefactos GGUF (Q4_0), ONNX, binarios QNN HTP y tablas f16, pensados para repartir la inferencia entre CPU (llama.cpp) y la NPU Hexagon de Qualcomm. El objetivo es permitir clonación de voz en el dispositivo a partir de una grabación de referencia, sin enviar audio a ningún servidor.

La relevancia es práctica: demuestra una ruta completa para llevar un TTS de 1,7B a un móvil de gama alta (Snapdragon 8 Elite) con un pipeline RVQ de 16 codebooks a 12,5 frames por segundo y salida a 24 kHz. El repositorio incluye tanto los pesos cuantizados como las tablas auxiliares y los binarios de contexto QNN precompilados, lo que reduce el trabajo de integración a descargar ficheros y verificar sus hashes sha256.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline TTS en tres etapas: Talker (LM Qwen3 que genera el codebook 0 por frame), Code Predictor (Qwen3 de 5 capas que predice los codebooks 1–15) y vocoder (decoder del speech tokenizer), con desquantización RVQ lineal en CPU |
| Parámetros totales | 78.721.280 (según safetensors del repo); el modelo base se denomina 1.7B |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_0 (GGUF del Talker y del Code Predictor), f16 (tablas del Code Predictor y tablas RVQ), fp32 (ONNX del vocoder W75), fp16 (pesos compartidos del contexto QNN) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`qwen3`, `qwen3tts`), ONNX (fp32 y EPContext), binario de contexto QNN HTP, tablas `.bin` propietarias (`RTTSRVQ1`) |

## Arquitectura y entrenamiento

El modelo base es un TTS autorregresivo con tokenización neuronal de audio basada en RVQ de 16 codebooks. La generación avanza a 12,5 frames por segundo de audio: el Talker (un LM Qwen3) produce el codebook 0 de cada frame, el Code Predictor (Qwen3 de 5 capas) predice los codebooks 1 a 15, y el vocoder convierte los 16 codebooks en audio a 24 kHz en ventanas fijas de 25 frames de contexto más N frames nuevos. El decoder es causal, por lo que las ventanas incompletas se rellenan por la derecha sin alterar el resultado.

Esta variante Android no reentrena nada: convierte el Talker a GGUF con `convert_hf_to_gguf.py` de llama.cpp (build b12319) y lo cuantiza a Q4_0; exporta el Code Predictor como GGUF `qwen3` sin vocabulario (entrada de embeddings, salida de estado oculto) más tablas f16 con los embeddings de entrada por paso, las 15 cabezas de salida y los embeddings de realimentación; y compila el vocoder a ONNX y a un binario de contexto QNN HTP con dos grafos (W75 y W45) que comparten una copia de los pesos fp16. En el binario QNN se reescribió `Pow(x, 2)` como `Mul(x, x)` porque la operación genérica es extremadamente lenta en la HTP. La desquantización RVQ es lineal y se ejecuta en CPU con tablas precalculadas (`Σ_q table_q[code_q]`).

No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens, ni si se aplicaron RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto o Markdown, con salida a 24 kHz.
- Clonación de voz en el dispositivo a partir de una grabación de referencia: el voice pack (x-vector de hablante, códigos de audio de referencia y texto de referencia) se genera en un PC con `tools/make-voice.py` y se importa aparte en la app.
- Inferencia totalmente offline: los ficheros se descargan y se validan contra los sha256 compilados en el APK; no hay red en tiempo de ejecución.
- Ejecución repartida entre CPU (llama.cpp con el Talker y el Code Predictor) y NPU Hexagon (vocoder vía onnxruntime-qnn).
- Aceleración opcional del Talker con OpenCL en llama.cpp.
- Fallback del vocoder a ONNX Runtime CPU EP en cualquier dispositivo, a costa de velocidad.
- No incluye ninguna voz preentrenada: el usuario debe aportar su propia grabación con derechos de uso.

## Casos de uso

- Lectura en voz alta de documentos en Android: la app `read-android` usa el pipeline para narrar Markdown y texto sin conexión, validando cada artefacto contra su sha256 antes de cargarlo.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o apps de lectura que necesitan voz sintética local sin depender de servicios en la nube ni de conectividad.
- Clonación de voz personal en el dispositivo: el usuario graba una muestra de su propia voz, genera el voice pack en un PC y lo importa para que el dispositivo lea con esa voz.
- Procesamiento de contenido sensible sin salida de datos: al no haber red en tiempo de ejecución, es apto para narrar documentos privados, médicos o legales en el propio terminal.
- Evaluación de despliegue de TTS en NPU Qualcomm: sirve como referencia para medir el rendimiento de un vocoder ONNX/QNN con ventanas causales en Snapdragon 8 Elite (HTP v79, QNN ≥ 2.51).
- Prototipado de asistentes de voz embebidos: el pipeline de 12,5 fps y 16 codebooks permite experimentar con generación de audio token a token en dispositivos móviles.
- Integración en pipelines de CI para Android: los binarios de contexto QNN precompilados y los GGUF permiten empaquetar y verificar artefactos de TTS en la cadena de build de la app.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 2,0 GB; el espacio en disco del dispositivo debe cubrir la descarga de todos los artefactos.
- Vocoder en NPU: requiere Snapdragon 8 Elite (SM8750, HTP v79), onnxruntime-qnn y QNN ≥ 2.51 para los ficheros `vocoder-w45s.htp_ctx.onnx`, `vocoder-w75s.htp_ctx.onnx` y `vocoder-w75w45.htp_ctx_qnn.bin`.
- Vocoder en CPU: `vocoder-w75.htp.onnx` (fp32, formas estáticas) funciona en cualquier dispositivo con ONNX Runtime CPU EP, descrito por el autor como lento.
- Talker y Code Predictor: se ejecutan en llama.cpp sobre CPU; el Talker admite también backend OpenCL.
- No se especifican cantidades de VRAM ni de RAM; en Android se trata de memoria unificada, y no hay datos publicados sobre el consumo exacto.
- No cabe esperar ejecución en GPU de escritorio con estos artefactos: están orientados a CPU y NPU móvil. Para el modelo base en servidor habría que acudir a los pesos originales de Qwen.
- Opciones de despliegue: llama.cpp (build b12319 o compatible) para los GGUF, onnxruntime-qnn para el vocoder en HTP, ONNX Runtime CPU EP como alternativa, y la app Android `read-android` como integración de referencia.
- Latencia y throughput: no disponibles; solo se conoce la tasa de generación de 12,5 frames de audio por segundo, que no equivale al tiempo real de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| `luweigen/qwen3-tts-1.7b-android` | 78.721.280 (repo); base 1.7B | no disponible | Apache-2.0 | GGUF Q4_0, ONNX, QNN HTP, tablas f16 | Optimizado para Android y Snapdragon 8 Elite; sin voces incluidas |
| `Qwen/Qwen3-TTS-12Hz-1.7B-Base` | 1.7B (denominación) | no disponible | Apache-2.0 | safetensors (formato original) | Modelo base; pensado para servidor o PC, no para móvil |
| Alternativas de TTS open source | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- No incluye ninguna voz: sin un voice pack generado por el usuario, el modelo no puede sintetizar audio. El voice pack debe crearse con una grabación sobre la que el usuario tenga derechos.
- Los binarios del vocoder para NPU están compilados específicamente para Snapdragon 8 Elite (SM8750, HTP v79) y QNN ≥ 2.51; en otros SoC solo queda la ruta ONNX CPU, notablemente más lenta.
- Dependencia de versiones concretas: llama.cpp b12319 para la conversión GGUF y onnxruntime-qnn 2.7.0 / QNN 2.51 para el contexto QNN. Otras versiones pueden requerir reconversión.
- El modelo base es de noviembre de 2026 según los metadatos del repo; el ecosistema de herramientas asociado puede cambiar y romper la compatibilidad de los artefactos.
- Riesgo de alucinación y de errores de pronunciación inherente a los TTS neuronales; no hay datos publicados sobre sesgos del modelo base en esta información.
- Idiomas soportados no declarados en el repo; no se puede asumir cobertura multilingüe sin verificar la model card original.
- Licencia Apache-2.0 permite uso comercial, pero las condiciones de la grabación de referencia para la clonación de voz son responsabilidad del usuario (derechos de imagen y voz).
- No hay métricas publicadas de calidad (MOS), latencia ni consumo, por lo que la idoneidad en producción debe validarse empíricamente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/luweigen/qwen3-tts-1.7b-android
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Proyecto `read-android`: no disponible (mencionado en la model card sin URL)
- Paper, blog o demo del modelo base: no disponibles en la información proporcionada
