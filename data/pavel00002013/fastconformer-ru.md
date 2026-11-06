# pavel00002013/fastconformer-ru

## Resumen

FastConformer-Hybrid Large RU es una conversión de pesos del modelo de reconocimiento automático del habla (ASR) `nvidia/stt_ru_fastconformer_hybrid_large_pc` de NVIDIA, publicada por el usuario pavel00002013. El modelo original es un FastConformer híbrido (CTC + atención) entrenado para ruso, y esta versión traslada los pesos desde el checkpoint `.nemo` original a formato safetensors para su uso en un runtime de Rust puro basado en la librería candle, sin dependencias de PyTorch ni ONNX.

El modelo cuenta con 114.659.810 parámetros y un repositorio de 0,5 GB. Está pensado para integrarse en el asistente de voz Jarvis, desarrollado por el mismo autor, que descarga los pesos automáticamente al arrancar. La conversión preserva los nombres de tensores del checkpoint NeMo, de modo que el mapeo a capas de la implementación en Rust se realiza en el propio proyecto Jarvis.

Su relevancia es acotada: no introduce mejoras de modelado ni nuevos datos de entrenamiento, sino que facilita el despliegue de un ASR ruso de calidad en entornos Rust sin la sobrecarga de un stack Python. Es útil para quienes necesiten transcripción de ruso embebida en aplicaciones nativas o de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer híbrido (CTC + atención), derivada de NVIDIA NeMo |
| Parametros totales | 114.659.810 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/fp16) |
| Idiomas soportados | ruso (ru) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (con config.json, tokenizer.vocab, tokenizer.model y nemo_vocab.txt) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un FastConformer híbrido de NVIDIA, que combina un encoder Conformer con subsampling de convoluciones y una cabeza de decodificación híbrida que soporta CTC y atención (transducer/attention). Esta versión no reentrena el modelo: únicamente convierte los pesos del checkpoint `.nemo` original (un tar que contiene `model_config.yaml`, `model_weights.ckpt` y el tokenizador) a safetensors, manteniendo los nombres de tensores de NeMo. El script de conversión `convert_fastconformer.py` realiza esta tarea y está incluido en el repositorio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, ya que esos detalles pertenecen al modelo original de NVIDIA y no se reproducen en esta model card. La innovación técnica de esta publicación es exclusivamente de empaquetado: permite ejecutar el modelo en candle (Rust) sin PyTorch ni ONNX.

## Capacidades

- Reconocimiento automático del habla (ASR) en ruso, con salida de transcripciones de audio.
- Decodificación híbrida CTC + atención, heredada del modelo NeMo original.
- Tokenizador BPE incluido (`tokenizer.model` y `tokenizer.vocab`) para el postprocesado de texto.
- Integración con el asistente de voz Jarvis para descarga automática de pesos y ejecución en Rust.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de audio en ruso dentro de aplicaciones nativas en Rust: el modelo puede cargarse con candle y ejecutarse sin Python, lo que simplifica el despliegue en binarios únicos.
- Asistentes de voz embebidos: integración en el asistente Jarvis para convertir comandos de voz en texto con un runtime ligero.
- Subtitulado automático de contenido en ruso: el modelo ASR permite generar transcripciones para vídeos o reuniones, con la ventaja de un repositorio de solo 0,5 GB.
- Procesamiento por lotes de grabaciones: al ser un modelo de 114 M de parámetros, puede ejecutarse en CPU o GPU modesta para transcribir archivos de audio en pipelines offline.
- Investigación en ASR para ruso: sirve como referencia de pesos convertidos y como base para experimentos de decodificación en candle.
- Prototipado de interfaces voz-texto en entornos con restricciones de dependencias (sin PyTorch/ONNX), gracias al formato safetensors y al runtime Rust.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 114,6 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,46 GB y en fp16 unos 0,23 GB, por lo que la inferencia cabe en GPUs de gama baja.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 1-2 GB de VRAM libre sería suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en modelos como GTX 1650, RTX 3050 o superiores, aunque no se confirma en la documentación.
- Opciones de despliegue: runtime candle (Rust) a través del proyecto Jarvis; no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| pavel00002013/fastconformer-ru | 114,6 M | no disponible | ru | CC-BY-4.0 | safetensors (candle) |
| nvidia/stt_ru_fastconformer_hybrid_large_pc | no disponible en la informacion | no disponible | ru | CC-BY-4.0 | .nemo (NeMo) |
| Alternativas ASR rusas de otros proveedores | no disponible | no disponible | ru | no disponible | no disponible |

La comparativa se limita al modelo original de NVIDIA, del que este deriva directamente; no se dispone de datos de benchmarks ni de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta ruso; no se documentan otros idiomas.
- No se han publicado métricas de calidad (WER, CER) ni benchmarks en esta model card.
- Al ser una conversión de pesos, hereda cualquier sesgo o limitación del checkpoint original de NVIDIA.
- Riesgo de alucinación en transcripciones ante audio ruidoso o con acentos no representados en el entrenamiento original, aunque no se cuantifica.
- La licencia CC-BY-4.0 exige atribución a NVIDIA y al autor de la conversión; permite uso comercial con atribución, pero conviene revisar los términos del modelo base.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria de su funcionamiento.
- La integración está orientada al proyecto Jarvis; el mapeo de tensores a capas Rust se realiza en `weights.rs` de ese repositorio, no en este.
- No se especifican tipos de cuantización ni requisitos de hardware oficiales.

## Enlaces

- Hugging Face: https://huggingface.co/pavel00002013/fastconformer-ru
- Modelo base: https://huggingface.co/nvidia/stt_ru_fastconformer_hybrid_large_pc
- Proyecto Jarvis: https://github.com/pavel807/Jarvis
- Runtime candle: https://github.com/huggingface/candle
- Perfil del autor: https://huggingface.co/pavel00002013
