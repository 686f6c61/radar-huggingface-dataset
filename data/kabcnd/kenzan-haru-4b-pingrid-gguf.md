# kabcnd/Kenzan-Haru-4B-PinGrid-GGUF

## Resumen

Kenzan-Haru-4B-PinGrid-GGUF es un paquete de compresión quirúrgica del modelo multimodal higurashi-ai/Haru-4B, publicado por el usuario kabcnd. El modelo base combina un backbone de lenguaje de 32 capas con arquitectura híbrida GatedDeltaNet + atención completa GQA, un códec de audio VibeVoice a 24 kHz y un motor de difusión de un solo paso basado en MeanFlow. El paquete resultante reduce el peso total de 9,84 GiB en BF16 a unos 3,80 GiB, separando el backbone de lenguaje en un GGUF estándar (2,68 GiB) y el motor de audio en un fichero safetensors aparte (1,12 GiB).

La motivación declarada es hacer viable la inferencia del sistema completo en una Mac mini con 16 GB de memoria unificada, donde el modelo en BF16 provoca errores de memoria en Metal durante la generación autorregresiva. La receta de cuantización mixta, denominada PinGrid, asigna precisiones distintas por tensor según el ratio de outliers medido, protegiendo los pesos más sensibles (embeddings atados de 248.320 entradas, capas de atención global y proyecciones de estado recurrente) en Q6_K y Q8_0.

El resultado es un artefacto orientado a Apple Silicon y a llama.cpp, con un backbone de lenguaje que funciona de forma nativa en LM Studio, Ollama y llama.cpp estándar, mientras que el motor de audio requiere un cargador Python propio sobre PyTorch con MPS o CUDA. El modelo cubre cuatro idiomas (inglés, japonés, chino y ruso) y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 32 capas con 24 de GatedDeltaNet (atención lineal recurrente) y 8 de atención completa GQA 16:4, más códec de audio VibeVoice 24 kHz y motor MeanFlow de un paso |
| Parametros totales | 4.205.751.296 (según safetensors); la model card del autor cita 5,27B para el complejo multimodal completo |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF mixto: Q4_K_M, Q5_K, Q6_K, Q8_0, F32 en pesos concretos; audio en BF16 y W8A16 |
| Idiomas soportados | Inglés, japonés, chino, ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (backbone de lenguaje) y safetensors (motor de audio) |

## Arquitectura y entrenamiento

El backbone de lenguaje, etiquetado como qwen3_5_text, emplea un patrón intercalado de tres capas de GatedDeltaNet por cada capa de atención completa, repetido ocho veces. Las capas de atención global se sitúan en los índices 3, 7, 11, 15, 19, 23, 27 y 31, e incorporan mrope intercalado. La actualización de estado de GatedDeltaNet sigue la formulación S_t = α_t S_{t-1}(I − β_t k_t k_t^T) + β_t v_t k_t^T, con los parámetros A_log, dt_bias, conv1d y ssm_norm mantenidos en F32 exacto. Los embeddings están atados (tie_word_embeddings = true) con un vocabulario de 248.320 entradas que incluye tokens de control de voz en el rango 248044-248076.

El sistema multimodal añade un códec VibeVoice de 24 kHz (552 tensores, 687,4M parámetros) y un motor de difusión MeanFlow de un solo paso (32 tensores, 363,4M parámetros) para la síntesis de audio. La model card no detalla la composición del dataset de entrenamiento, el número de tokens ni si hubo fases de RLHF o DPO. La innovación técnica del artefacto no reside en el entrenamiento sino en la compresión: el perfilado automático de 1.022 tensores identificó ratios de outliers de hasta 275,76 en el motor MeanFlow y de 93,93 en la capa de atención blk.3, y la receta PinGrid asigna Q8_0, Q6_K o BF16 a esos tensores críticos mientras el resto baja a Q4_K_M o Q5_K.

## Capacidades

- Generación de texto autorregresiva en inglés, japonés, chino y ruso.
- Razonamiento y conversación multi-turno sobre el backbone qwen3_5_text.
- Síntesis de voz y procesamiento de audio a 24 kHz mediante el códec VibeVoice y el motor MeanFlow de un paso.
- Proyección de audio a espacio de lenguaje (model_audio_proj) para entrada de audio en el modelo.
- Tokens de control de voz integrados en el vocabulario (rango 248044-248076).
- Compatibilidad con tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de voz locales en Apple Silicon: el paquete completo cabe en 3,80 GiB y está diseñado para una Mac mini de 16 GB, de modo que un asistente con entrada y salida de audio puede ejecutarse íntegramente en el dispositivo sin conexión a servicios externos.
- Síntesis de voz en tiempo real: el motor MeanFlow de un solo paso reduce la generación de audio a una única evaluación de ODE, lo que resulta adecuado para aplicaciones de lectura en voz alta o respuesta hablada de baja latencia.
- Transcripción y comprensión de audio multilingüe: el códec VibeVoice a 24 kHz junto con el backbone de cuatro idiomas permite construir pipelines de subtitulado o análisis de reuniones en inglés, japonés, chino y ruso.
- Desarrollo y pruebas en llama.cpp: el backbone GGUF de 2,68 GiB funciona en LM Studio, Ollama y llama.cpp estándar, lo que facilita integrarlo en flujos de evaluación y prototipado sin infraestructura GPU dedicada.
- Investigación sobre cuantización selectiva: la receta PinGrid y el perfilado de outliers documentados en la model card sirven como referencia para estudiar el impacto de la precisión mixta en arquitecturas híbridas con estado recurrente.
- Aplicaciones de privacidad estricta: al ejecutarse en local y bajo Apache 2.0, el modelo puede desplegarse en entornos sanitarios o jurídicos donde los datos de audio no pueden salir del dispositivo.
- Generación de contenido multilingüe con voz: combinación de texto y audio para crear locuciones en japonés o chino con el mismo modelo que redacta el guion.

## Benchmarks y rendimiento

La model card reporta métricas de compresión y velocidad medidas por el autor, no benchmarks estándar de calidad del modelo.

| Metrica | Valor |
|---|---|
| Perplejidad WikiText-2 (Q4_K_M ingenuo) | 17,3480 |
| Mejora de perplejidad frente a Q4_K_M | −2,48 puntos (−14,3 %) |
| Ingesta de prompt (Apple M6) | 1.376 t/s |
| Generación (Apple M6) | 39,2 t/s |
| Ratio de compresión total | 2,62× (9,84 GiB → 3,80 GiB) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 3,80 GiB para el paquete completo (2,68 GiB de backbone GGUF más 1,12 GiB de motor de audio); el backbone por separado requiere unos 2,68 GiB.
- Objetivo declarado: Mac mini M6 con 16 GB de memoria unificada; el BF16 original de 9,83 GiB provoca errores de memoria en Metal en ese hardware.
- GPU recomendadas: Apple Silicon con Metal (MPS) para el motor de audio; el backbone GGUF puede ejecutarse en CPU o en GPU compatibles con llama.cpp.
- Cabe en GPU de consumo: sí, el backbone de 2,68 GiB entra en cualquier GPU con 4 GB o más; el paquete completo requiere aproximadamente 4 GB.
- Opciones de despliegue: llama.cpp, LM Studio y Ollama para el backbone; el motor de audio necesita el cargador propio audio_engine/haru_audio_loader.py sobre PyTorch con MPS o CUDA.
- Latencia y throughput: 1.376 t/s de ingesta de prompt y 39,2 t/s de generación en Apple M6 según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kenzan-Haru-4B-PinGrid-GGUF | 4,2B (safetensors) / 5,27B (completo) | No disponible | Apache 2.0 | Multimodal texto y audio, orientado a Apple Silicon |
| higurashi-ai/Haru-4B | 5,27B | No disponible | No disponible | Modelo base en BF16, sin comprimir |
| Alternativas de tamaño similar | No disponible | No disponible | No disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- El motor de audio no funciona en llama.cpp estándar: requiere el cargador Python propio y PyTorch con MPS o CUDA, lo que limita el despliegue a entornos con Python y dependencias instaladas.
- La model card no documenta sesgos conocidos, comportamiento en dominios sensibles ni evaluación de alucinación del modelo base.
- El modelo base higurashi-ai/Haru-4B no publica en esta información su contexto máximo, su dataset de entrenamiento ni sus resultados de evaluación, por lo que la calidad real del backbone no puede verificarse.
- La cuantización mixta puede degradar capacidades no medidas: la mejora de perplejidad se reporta solo sobre WikiText-2 y no cubre audio, razonamiento ni multilingüismo.
- Solo se declaran cuatro idiomas (en, ja, zh, ru); el rendimiento en castellano no está documentado y probablemente sea limitado.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia del modelo base higurashi-ai/Haru-4B antes de un uso comercial, ya que la información disponible no la especifica.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de las cifras reportadas.
- El modelo se distribuye como artefacto de compresión de un tercero, no como un entrenamiento original: los méritos y defectos del modelo base se heredan íntegramente.

## Enlaces

- Hugging Face: https://huggingface.co/kabcnd/Kenzan-Haru-4B-PinGrid-GGUF
- Modelo base: https://huggingface.co/higurashi-ai/Haru-4B
- Donaciones del autor (Ko-fi): https://ko-fi.com/kabcpc
- Paper o blog técnico del modelo base: no disponible
- Repositorio de código del cargador de audio: no disponible como enlace público en la información proporcionada
- Demo: no disponible
