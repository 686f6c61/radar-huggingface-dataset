# alfredscholarofficial/avni-models

## Resumen

AVNI models no es un modelo único, sino un repositorio agregador de tres paquetes de modelos empaquetados para la aplicación de macOS AVNI (Alfred Scholar). El repositorio distribuye un modelo de lenguaje Qwen3.5-4B cuantizado a 4 bits en formato MLX, un modelo de síntesis de voz Kokoro-82M convertido a Core ML y un sistema de reconocimiento de voz Parakeet TDT 0.6B v3 en Core ML, acompañado de un detector de actividad de voz Silero VAD. Cada paquete vive en una carpeta de primer nivel del repositorio y conserva su licencia original.

El interés del repositorio es fundamentalmente de integración y despliegue: agrupa en un único artefacto de 3,5 GB los componentes necesarios para una aplicación de escritorio con capacidades de texto, voz y transcripción, todos optimizados para ejecución local en hardware Apple (MLX y Core ML). No aporta innovaciones de arquitectura ni pesos entrenados por el autor; es una distribución de modelos de terceros.

La relevancia es práctica para desarrolladores que quieran replicar el stack de la app o reutilizar los paquetes Core ML/MLX en sus propias aplicaciones macOS, con la advertencia de que las licencias son heterogéneas (Apache-2.0, CC-BY-4.0 y MIT según el componente) y de que el autor no publica especificaciones propias, benchmarks ni detalles de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B, paquete `avni-small`); TTS Kokoro-82M (`kokoro-v3`); ASR Parakeet TDT 0.6B v3 (`parakeet-tdt-v3`) |
| Parametros totales | 4B (LLM), 82M (TTS), 0,6B (ASR) |
| Parametros activos | no disponible (no se indica que los modelos sean MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX) en el LLM; Core ML para TTS y ASR |
| Idiomas soportados | no disponible |
| Licencia | mixta: Apache-2.0 (Qwen3.5-4B y Kokoro), CC-BY-4.0 (Parakeet), MIT (Silero VAD) |
| Formato de pesos | MLX (safetensors) y Core ML; el repo incluye también safetensors genéricos |

## Arquitectura y entrenamiento

El repositorio no entrena modelos propios: empaqueta artefactos ya publicados. El componente de lenguaje es Qwen3.5-4B, un transformer de 4.000 millones de parámetros distribuido por mlx-community en cuantización de 4 bits para MLX, lo que permite inferencia en Apple Silicon. El componente de voz es Kokoro-82M, un modelo TTS de 82 millones de parámetros convertido a Core ML por FluidInference. El componente de reconocimiento es Parakeet TDT 0.6B v3 de NVIDIA, un modelo ASR con decodificación *token-and-duration transducer* (TDT), también en Core ML, acompañado de Silero VAD para segmentación de voz.

No se proporcionan en la información disponible datos sobre tokens de entrenamiento, composición de datasets, RLHF/DPO ni innovaciones técnicas propias del autor. Cualquier detalle de entrenamiento debe consultarse en las model cards originales de Qwen, hexgrad/Kokoro y NVIDIA/Parakeet.

## Capacidades

- Generación de texto y razonamiento mediante Qwen3.5-4B (paquete `avni-small`, solo texto).
- Síntesis de voz (text-to-speech) con Kokoro-82M en Core ML.
- Reconocimiento automático de voz (ASR) con Parakeet TDT 0.6B v3.
- Detección de actividad de voz (VAD) con Silero VAD para trocear audio.
- Ejecución local en macOS sobre Apple Silicon (MLX y Core ML).
- Soporte de tool calling, agentes, visión o audio en el LLM: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de escritorio en macOS con LLM local: usar `avni-small` (Qwen3.5-4B en MLX 4 bits) para generar respuestas sin enviar datos a la nube, aprovechando la aceleración de Apple Silicon.
- Dictado por voz en aplicaciones nativas: encadenar `parakeet-tdt-v3` (ASR) con `silero-vad` para transcribir audio del micrófono en tiempo real dentro de una app Core ML.
- Lectura en voz alta de texto generado: pasar la salida del LLM a `kokoro-v3` para sintetizar voz, útil en lectores, accesibilidad o asistentes conversacionales.
- Pipeline de notas de reuniones: VAD segmenta el audio, Parakeet transcribe y Qwen3.5-4B resume o extrae acciones, todo en local.
- Prototipado de apps de voz sin backend: los tres paquetes permiten construir una demo de asistente por voz íntegramente en el dispositivo.
- Reutilización de los paquetes Core ML/MLX en otros proyectos macOS: descargar solo la carpeta necesaria (`kokoro-v3` o `parakeet-tdt-v3`) e integrarla en Xcode o en un entorno Python con MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Espacio en disco: 3,5 GB para el repositorio completo; cada paquete puede descargarse por separado.
- LLM Qwen3.5-4B en 4 bits MLX: requiere Apple Silicon (M1 o superior); el peso aproximado en memoria ronda los 2-3 GB, aunque no se confirma en la información disponible.
- TTS Kokoro-82M y ASR Parakeet 0.6B en Core ML: aptos para ejecución en Apple Silicon, incluidas configuraciones de gama de entrada.
- GPU NVIDIA (A100, H100, RTX 4090): no aplicables a estos formatos (MLX/Core ML).
- Despliegue: MLX (Python/Apple) y Core ML (Xcode); no se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AVNI models (`avni-small`) | 4B | no disponible | MLX 4 bits | Apache-2.0 | Hugging Face |
| Qwen3.5-4B (original) | 4B | no disponible | safetensors | Apache-2.0 | Hugging Face |
| mlx-community/Qwen3.5-4B-4bit | 4B | no disponible | MLX 4 bits | Apache-2.0 | Hugging Face |
| Kokoro-82M (original) | 82M | no aplica | PyTorch/safetensors | Apache-2.0 | Hugging Face |

La comparativa se limita a los componentes originales de los que deriva el repositorio, ya que no se dispone de datos de rendimiento propios. Para ASR, el comparable directo es NVIDIA Parakeet TDT 0.6B v3, del que este repositorio solo redistribuye la conversión Core ML.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: es un agregador; la calidad y los sesgos dependen de los modelos originales.
- Licencia mixta: cada carpeta tiene su propia licencia (Apache-2.0, CC-BY-4.0, MIT). El uso comercial debe verificar la licencia del paquete concreto, especialmente Parakeet (CC-BY-4.0, requiere atribución a NVIDIA).
- Idiomas soportados no declarados en el repositorio; deben consultarse en las model cards de Qwen, Kokoro y Parakeet.
- Riesgo de alucinación inherente al LLM Qwen3.5-4B; no hay evaluaciones publicadas en este repositorio.
- Dependencia de hardware Apple: MLX y Core ML no son portables a GPU NVIDIA ni a CPU x86 sin conversión.
- Repositorio con 0 likes y 236 descargas: poca validación comunitaria; conviene contrastar integridad de los pesos con las fuentes originales.
- No se especifican requisitos de memoria, latencia ni límites de contexto; para producción hay que medirlos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/alfredscholarofficial/avni-models
- Qwen3.5-4B (mlx-community): https://huggingface.co/mlx-community/Qwen3.5-4B-4bit
- Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Kokoro 82M Core ML (FluidInference): https://huggingface.co/FluidInference/kokoro-82m-coreml
- Silero VAD Core ML (FluidInference): https://huggingface.co/FluidInference/silero-vad-coreml
- Parakeet TDT 0.6B v3 (NVIDIA): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
