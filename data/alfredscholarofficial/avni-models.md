# alfredscholarofficial/avni-models

## Resumen

AVNI models es un repositorio agregador publicado por el usuario alfredscholarofficial (Alfred Scholar) que empaqueta tres modelos independientes utilizados por la aplicación macOS AVNI. No se trata de un modelo unico entrenado por el autor, sino de una coleccion de pesos redistribuidos de terceros, cada uno en su propio subdirectorio: `avni-small` (Qwen3.5-4B en cuantizacion 4-bit MLX, solo texto), `kokoro-v3` (Kokoro 82M para sintesis de voz en formato Core ML) y `parakeet-tdt-v3` (Parakeet TDT 0.6B v3 de NVIDIA para reconocimiento de voz en Core ML, acompanado de Silero VAD).

El repositorio resuelve un problema de distribucion: la app AVNI necesita descargar packs de modelos listos para ejecucion local en Apple Silicon, y este repositorio actua como origen de esas descargas. Por tanto, su relevancia no esta en innovaciones arquitectonicas propias, sino en la curacion de formatos (MLX y Core ML) optimizados para inferencia en macOS.

El tamano total del repositorio es de aproximadamente 0,7 GB, lo que es coherente con pesos 4-bit de un modelo de 4B parametros, un TTS de 82M y un ASR de 0,6B. La licencia es mixta ("other", con licencia_name: mixed), ya que cada pack conserva la licencia de su modelo de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixta por pack: transformer (Qwen3.5-4B), TTS (Kokoro 82M), ASR (Parakeet TDT 0.6B v3) |
| Parametros totales | ~4B (avni-small) + 82M (kokoro-v3) + 0,6B (parakeet-tdt-v3) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MLX (avni-small); Core ML para kokoro-v3 y parakeet-tdt-v3 |
| Idiomas soportados | no disponibles |
| Licencia | mixed (Apache-2.0 para avni-small y kokoro-v3; CC-BY-4.0 para Parakeet; MIT para Silero VAD) |
| Formato de pesos | safetensors (tag del repo) y Core ML (mlpackage) |

## Arquitectura y entrenamiento

El repositorio no documenta entrenamiento propio: cada pack es una redistribucion de pesos publicados por terceros. `avni-small` corresponde a Qwen3.5-4B en cuantizacion 4-bit MLX, obtenido de `mlx-community/Qwen3.5-4B-4bit`; se trata de un modelo de lenguaje transformer optimizado para ejecucion en Apple Silicon mediante el framework MLX. `kokoro-v3` es Kokoro 82M, un modelo de sintesis de voz compacto convertido a Core ML por FluidInference. `parakeet-tdt-v3` es Parakeet TDT 0.6B v3 de NVIDIA, un modelo ASR con decodificador TDT (Token-and-Duration Transducer) convertido a Core ML, acompanado de Silero VAD para deteccion de actividad de voz.

No se proporcionan datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni procesos de RLHF/DPO para ninguno de los packs. La innovacion practica del repositorio es la conversion a formatos nativos de Apple (MLX y Core ML) que permiten inferencia local en hardware macOS.

## Capacidades

- Generacion de texto en local mediante `avni-small` (Qwen3.5-4B 4-bit MLX), solo texto.
- Sintesis de voz (text-to-speech) con `kokoro-v3` (Kokoro 82M).
- Reconocimiento automatico de voz (ASR) con `parakeet-tdt-v3` (Parakeet TDT 0.6B v3).
- Deteccion de actividad de voz (VAD) con Silero VAD incluido en el pack de ASR.
- Ejecucion en Apple Silicon via MLX y Core ML.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): audio (TTS y ASR) por los packs kokoro-v3 y parakeet-tdt-v3; no se documenta vision ni thinking mode.

## Casos de uso

- Dictado y transcripcion local en macOS: `parakeet-tdt-v3` junto con Silero VAD permite transcribir audio en tiempo real sin enviar datos a la nube, adecuado para aplicaciones de notas o productividad en Apple Silicon.
- Lectura en voz alta de documentos: `kokoro-v3` (82M) sintetiza voz con bajo coste computacional, util para funciones de accesibilidad o lectura de articulos dentro de la app AVNI.
- Asistente de texto offline: `avni-small` (Qwen3.5-4B 4-bit) puede generar respuestas y resumenes localmente en equipos con memoria unificada suficiente, sin depender de APIs externas.
- Pipeline de voz a texto y respuesta: combinando ASR (Parakeet) y LLM (avni-small) se puede construir un asistente conversacional completamente local para macOS.
- Prototipado de aplicaciones Core ML: los packs Core ML sirven como referencia para desarrolladores que quieran integrar TTS y ASR en apps Swift/SwiftUI.
- Evaluacion de modelos en Apple Silicon: util para comparar rendimiento de MLX frente a Core ML en tareas de texto y audio en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: `avni-small` 4-bit requiere aproximadamente 2-3 GB de memoria; `kokoro-v3` (82M) y `parakeet-tdt-v3` (0,6B) son ligeros y caben holgadamente en memoria unificada de cualquier Apple Silicon.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4) por el uso de MLX y Core ML; no se documenta soporte para GPU NVIDIA.
- Cabe en hardware de consumo: si, en Mac con memoria unificada suficiente (8 GB en adelante para el pack completo).
- Opciones de despliegue: MLX (para avni-small), Core ML (para kokoro-v3 y parakeet-tdt-v3), integracion en la app AVNI para macOS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| avni-small (Qwen3.5-4B 4-bit MLX) | ~4B | no disponible | MLX 4-bit | Apache-2.0 | Hugging Face (este repo) |
| Qwen3.5-4B original | ~4B | no disponible | safetensors | Apache-2.0 | Hugging Face (Qwen) |
| Kokoro 82M | 82M | no aplica (TTS) | safetensors / Core ML | Apache-2.0 | Hugging Face (hexgrad) |
| Parakeet TDT 0.6B v3 | 0,6B | no aplica (ASR) | Core ML | CC-BY-4.0 | Hugging Face (NVIDIA / FluidInference) |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo propio: es un repositorio agregador; la calidad y limitaciones dependen de los modelos originales.
- Licencia mixta: cada pack tiene su propia licencia (Apache-2.0, CC-BY-4.0, MIT); es obligatorio respetar la atribucion de Parakeet (CC-BY-4.0) y de Silero VAD (MIT) en uso comercial.
- Solo texto en `avni-small`: no se documentan capacidades multimodales en el LLM.
- Idiomas soportados no documentados: no se puede garantizar cobertura linguistica sin consultar las fichas originales.
- Riesgo de alucinacion inherente al LLM Qwen3.5-4B en cuantizacion 4-bit; no se documenta mitigacion.
- Dependencia de hardware Apple: MLX y Core ML limitan el despliegue a macOS/Apple Silicon; no hay soporte documentado para CUDA.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de validacion por la comunidad.
- Contexto no documentado: no se puede planificar uso con ventanas largas sin consultar la ficha de Qwen3.5-4B.

## Enlaces

- Hugging Face: https://huggingface.co/alfredscholarofficial/avni-models
- Qwen3.5-4B 4-bit MLX (origen de avni-small): https://huggingface.co/mlx-community/Qwen3.5-4B-4bit
- Kokoro 82M (origen de kokoro-v3): https://huggingface.co/hexgrad/Kokoro-82M
- Kokoro 82M Core ML (conversion): https://huggingface.co/FluidInference/kokoro-82m-coreml
- Parakeet TDT 0.6B v3 (origen, NVIDIA): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Silero VAD Core ML: https://huggingface.co/FluidInference/silero-vad-coreml
