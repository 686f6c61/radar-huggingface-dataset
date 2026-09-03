# jiangzhuo9357/Qwen3-ASR-1.7B-ONNX

## Resumen

Qwen3-ASR-1.7B-ONNX es una exportación del modelo de reconocimiento de voz Qwen3-ASR-1.7B, desarrollado por Alibaba Cloud (QwenLM), empaquetada específicamente para inferencia en navegador mediante onnxruntime-web y WebGPU. El modelo original, presentado en el informe técnico de Qwen3-ASR, es un sistema de ASR todo-en-uno que combina identificación de idioma y transcripción para 52 lenguas y dialectos, construido sobre la capacidad de comprensión de audio del modelo fundacional Qwen3-Omni. Esta versión ONNX, creada por jiangzhuo9357 para el proyecto Sokuji, sigue un layout v2 que separa la tabla de embeddings, usa pesos compartidos por precisión y proporciona un `prompt_config.json` con todas las constantes necesarias para el cliente.

La relevancia de esta ficha radica en que permite ejecutar un modelo ASR de 1.7B parámetros íntegramente en el navegador, sin servidor, con cuantización int4 y soporte para WebGPU. El modelo base tiene licencia Apache-2.0, lo que facilita su uso comercial. La exportación ofrece dos variantes: `q4` (encoder fp32, decoder int4) y `q4f16` (encoder fp16, decoder q4f16), con tamaños de descarga aproximados de 2.7 GB y 2.0 GB respectivamente. El modelo original alcanza un rendimiento de última generación entre los ASR de código abierto, según el informe técnico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder basado en Qwen3-Omni (transformer) |
| Parametros totales | 1.7B (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generación máxima de 256 tokens nuevos; contexto de audio variable según duración) |
| Tipos de cuantizacion | int4 (MatMulNBits, RTN, block 32, accuracy level 4), int8 para embeddings, fp16 en variante q4f16 |
| Idiomas soportados | 52 lenguas y dialectos (según repo oficial); la model card lista 16: zh, en, ja, ko, yue, ar, de, es, fr, it, pt, ru, th, vi, hi, id |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivos .onnx, .data, .bin, .json) |

## Arquitectura y entrenamiento

El modelo original Qwen3-ASR-1.7B es un sistema de reconocimiento de voz basado en la arquitectura de Qwen3-Omni, que combina un encoder de audio con un decoder de lenguaje. El encoder procesa características mel-log (compatibles con Whisper: 16 kHz, n_fft 400, hop 160, filtro Slaney de 128 bins) y produce representaciones de audio de dimensión 2048. El decoder es un transformer autoregresivo con 28 capas, 8 cabezas de KV y dimensión oculta 2048, que genera los tokens de texto. La exportación ONNX mantiene esta estructura: el encoder tiene 24 capas con dimensión 1024, mientras que el decoder tiene 28 capas con dimensión 2048.

El entrenamiento del modelo base se realizó con datos de habla a gran escala y aprovechando la capacidad de comprensión de audio de Qwen3-Omni. El informe técnico indica que el modelo soporta identificación de idioma y ASR para 52 lenguas y dialectos. No se especifican detalles sobre el número de tokens de entrenamiento ni sobre técnicas de alineación como RLHF o DPO en la información disponible. La exportación ONNX no modifica los pesos del modelo, solo los reempaqueta para su ejecución en onnxruntime-web, con fusión de nodos (26.5 % menos nodos en el encoder y 30 % en el decoder) y cuantización int4 de los decoders.

## Capacidades

- Reconocimiento de voz automático (ASR) para 52 lenguas y dialectos, incluyendo chino, inglés, japonés, coreano, cantonés, árabe, alemán, español, francés, italiano, portugués, ruso, tailandés, vietnamita, hindi e indonesio.
- Identificación de idioma integrada: el modelo detecta el idioma hablado y lo incluye en la salida (formato `language <Name><asr_text>`).
- Generación de texto a partir de audio con decodificación greedy, soportando hasta 256 tokens nuevos.
- Ejecución completamente en navegador mediante WebGPU, sin necesidad de servidor.
- Soporte de dos variantes de precisión: `q4` (fp32 para encoder y activaciones) y `q4f16` (fp16 para encoder y activaciones, con RMSNorm, softmax y rotary en fp32).
- Compatibilidad con el mismo cliente que la versión 0.6B, leyendo las dimensiones desde `prompt_config.json`.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso, ya que es un modelo puramente de ASR.

## Casos de uso

- Transcripción en tiempo real en el navegador: el modelo puede ejecutarse en una página web para transcribir audio del micrófono o archivos locales, con un RTF mediano de 0.083-0.111 según el dispositivo, lo que permite latencias casi en tiempo real para clips de 10-15 segundos.
- Asistentes de voz locales: integración en aplicaciones web progresivas (PWA) para dictado o comandos de voz sin enviar audio a servidores externos, garantizando privacidad.
- Subtitulación automática de vídeos: procesamiento de pistas de audio en el cliente para generar subtítulos en múltiples idiomas, aprovechando la identificación de idioma automática.
- Accesibilidad para personas con discapacidad auditiva: transcripción de conversaciones o contenido multimedia directamente en el navegador, con soporte para 52 idiomas.
- Herramientas de aprendizaje de idiomas: práctica de pronunciación y transcripción de frases habladas, con detección automática del idioma del usuario.
- Archivado y búsqueda de audio: indexación de grabaciones de reuniones, entrevistas o clases mediante transcripción local, con la ventaja de que los datos no salen del dispositivo.
- Demostraciones y prototipos: al ser una exportación ONNX lista para WebGPU, es adecuada para pruebas rápidas de ASR en entornos de desarrollo web sin infraestructura de servidor.

## Benchmarks y rendimiento

La model card proporciona mediciones de rendimiento en navegador (pipeline completo, cálido, 13 clips: 8 japonés, 4 chino, 1 inglés; medianas). No se incluyen benchmarks estándar como MMLU o HumanEval, ya que es un modelo de ASR. Los datos disponibles son:

| Dispositivo | Variante | RTF mediano | ms/token generado | Prefill (clip 10-15 s) | vs 0.6B (mismo equipo y variante) |
|---|---|---|---|---|---|
| RTX 4070 SUPER, Windows 11, Chrome 152 (D3D12) | q4f16 | 0.092 | 24.4 | 52 ms | ms/token ×1.34; memoria GPU dedicada 3.3 GB vs 1.9 GB |
| RTX 4070 SUPER, Ubuntu 22.04, Chrome 151 (Vulkan) | q4 | 0.083 | 19.6 | 47 ms | ms/token ×1.17; memoria GPU en uso 4.9 GB vs 3.1 GB |
| Apple M4 (Mac mini), Chrome 152 (Metal) | q4f16 | 0.111 | 23.4 | 234 ms | ms/token ×1.43; huella de proceso GPU 3.9 GB vs 2.2 GB |
| NVIDIA GB10 (aarch64, Vulkan, sin shader-f16) | q4 | 0.093 | 22.4 | 63 ms | ms/token ×1.13 |

En cuanto a calidad, la model card reporta una mejora significativa frente a la versión 0.6B: la tasa de error de caracteres (CER) en japonés pasa de 0.147 a 0.070, mientras que en inglés y chino ambas versiones ya eran casi perfectas. El informe técnico del modelo base afirma que la versión 1.7B alcanza un rendimiento de última generación entre los ASR de código abierto, aunque no se proporcionan cifras concretas en la información disponible.

## Requisitos de hardware

- Inferencia en navegador con WebGPU obligatorio; sin WebGPU, el execution provider wasm es demasiado lento para uso en vivo.
- Variante `q4`: requiere WebGPU básico (Vulkan, D3D12 o Metal). Descarga total ≈ 2.7 GB.
- Variante `q4f16`: requiere WebGPU con soporte `shader-f16` (Windows/D3D12, macOS/Metal). Descarga total ≈ 2.0 GB.
- Memoria GPU estimada: 3.3 GB (q4f16 en RTX 4070 SUPER) a 4.9 GB (q4 en RTX 4070 SUPER con Vulkan). En Apple M4, la huella del proceso GPU es de 3.9 GB.
- GPUs compatibles: tarjetas NVIDIA (RTX 40 series, GB10), Apple M4, y cualquier GPU con WebGPU. Nota: los adaptadores Vulkan de NVIDIA en Linux y en GB10 no exponen `shader-f16`, por lo que usan la variante `q4`.
- Opciones de despliegue: exclusivamente onnxruntime-web en navegador; no se proporcionan opciones para vLLM, llama.cpp u Ollama, ya que es una exportación específica para WebGPU.
- Latencia: RTF mediano entre 0.083 y 0.111 según dispositivo, con 19.6-24.4 ms por token generado. El prefill para clips de 10-15 segundos varía entre 47 ms y 234 ms.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-ONNX (este) | 1.7B | no disponible | 52 | Apache-2.0 | ONNX/WebGPU | Exportación para navegador, cuantización int4 |
| Qwen3-ASR-0.6B-ONNX | 0.6B | no disponible | 52 | Apache-2.0 | ONNX/WebGPU | Misma familia, menor calidad en japonés (CER 0.147 vs 0.070) |
| Qwen3-ASR-1.7B (original) | 1.7B | no disponible | 52 | Apache-2.0 | PyTorch | Modelo base, requiere servidor o inferencia local con GPU |

No se dispone de comparación directa con otros ASR como Whisper en la información proporcionada. El informe técnico menciona que el 1.7B es SOTA entre los ASR de código abierto, pero no se dan cifras comparativas.

## Limitaciones y advertencias

- Requiere WebGPU: sin esta API, el modelo no es utilizable en tiempo real; el execution provider wasm es demasiado lento.
- La variante `q4f16` no funciona en adaptadores Vulkan de NVIDIA en Linux ni en GB10, que carecen de `shader-f16`; en esos entornos debe usarse `q4`.
- La cuantización int4 puede introducir errores: en las pruebas, un clip en japonés difiere en una palabra respecto a FP32 (una frase difícil que tanto FP32 como int4 fallan parcialmente).
- El error máximo de de-cuantización de los embeddings int8 es de 1.2e-3, lo que puede afectar a la precisión en casos extremos.
- La generación está limitada a 256 tokens nuevos, lo que puede ser insuficiente para transcripciones muy largas; el contexto de audio depende de la duración del clip.
- No se especifican sesgos conocidos, pero al ser un modelo entrenado con datos de habla, puede presentar sesgos dialectales o de acento.
- Riesgo de alucinación en transcripciones: como todo modelo ASR, puede generar texto incorrecto en audio ambiguo o con ruido.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base Qwen3-ASR-1.7B.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es una publicación reciente y poco probada en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jiangzhuo9357/Qwen3-ASR-1.7B-ONNX
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio del proyecto Sokuji: https://github.com/kizuna-ai-lab/sokuji
- Repositorio oficial de Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Informe técnico de Qwen3-ASR (arXiv): https://arxiv.org/abs/2601.21337
- Versión HTML del informe: https://arxiv.org/html/2601.21337
- Exportación ONNX de la versión 0.6B: https://huggingface.co/jiangzhuo9357/Qwen3-ASR-0.6B-ONNX
- Exportación ONNX alternativa (andrewleech): https://huggingface.co/andrewleech/qwen3-asr-1.7b-onnx
