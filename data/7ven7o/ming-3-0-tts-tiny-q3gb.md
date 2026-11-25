# 7ven7o/Ming-3.0-tts-tiny-Q3GB

## Resumen

Ming-3.0-tts-tiny-Q3GB es un checkpoint cuantizado del modelo de síntesis de voz (text-to-speech) inclusionAI/Ming-3.0-tts-tiny, publicado por el usuario 7ven7o en Hugging Face. El modelo base es un sistema TTS de arquitectura Mixture of Experts (MoE) con 8.980 millones de parámetros totales y 1.300 millones de parámetros activos, desarrollado originalmente por inclusionAI. Esta versión cuantizada reduce el peso en VRAM hasta un pico de 3,009 GB en GPUs CUDA, lo que permite ejecutar un modelo MoE de casi 9.000 millones de parámetros en hardware de consumo.

La cuantización se ha realizado con la librería torchao (versión 0.9.0) mediante tensor subclasses, aplicando esquemas diferenciados por componente: los expertos MoE (6.950 millones de parámetros) usan `uint2_g128`, la atención del LLM y los expertos compartidos usan `uint4_g64`, el Flow DiT y el agregador usan `int8`, y el decodificador AudioVAE se mantiene en `fp32` sobre CPU. El resultado son dos ficheros de pesos: `gpu_weights.pt` (2.682 GB) y `cpu_weights.pt` (3.605 GB).

La relevancia de esta ficha radica en que demuestra una estrategia de cuantización mixta agresiva que hace viable un modelo TTS MoE de gran tamaño en GPUs de consumo, algo poco habitual en la categoría. El modelo soporta instrucciones de emoción (por ejemplo `emotion="happy"` o `emotion="sad"`) y tareas en modo `freeform`, con muestras publicadas en inglés y chino. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con Flow DiT, agregador y decodificador AudioVAE |
| Parametros totales | 8.980 millones (8,98B) |
| Parametros activos | 1.300 millones (1,3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `uint2_g128` (expertos MoE), `uint4_g64` (atención LLM y expertos compartidos), `int8` (Flow DiT y agregador), `fp32` (decodificador AudioVAE en CPU), `bfloat16`/`fp32` (embeddings y encoder AudioVAE en CPU) |
| Idiomas soportados | no disponible (las muestras publicadas incluyen inglés y chino) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`torchao` tensor subclasses): `gpu_weights.pt` y `cpu_weights.pt`; tag `onnx` en el repo |

## Arquitectura y entrenamiento

El modelo base es un sistema TTS con arquitectura MoE: de los 8.980 millones de parámetros totales, solo 1.300 millones están activos por token, lo que reduce el coste computacional en inferencia. La arquitectura combina un bloque LLM con atención y expertos compartidos, un Flow DiT (Diffusion Transformer) para la generación del audio, un agregador y un decodificador AudioVAE. El runtime de referencia es `ming_tiny`, distribuido en el repositorio GitHub de inclusionAI/Ming-3.0-tts, y depende de `fla-core` y `x-transformers`, lo que sugiere el uso de mecanismos de atención lineal o eficiente en el bloque LLM.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La innovación técnica destacable de este checkpoint concreto es la cuantización mixta por componente: se aplica 2 bits con grupo de 128 a los expertos MoE (el grueso de los parámetros), 4 bits con grupo de 64 a la atención y expertos compartidos, e int8 a los módulos de difusión, mientras se mantiene el decodificador de audio en fp32 sobre CPU para preservar la calidad de la señal. Además, se elimina el `lm_head` no utilizado, ahorrando 0,48 GB.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto libre en modo `freeform`.
- Control de emoción mediante instrucciones, con etiquetas como `emotion="happy"` y `emotion="sad"` demostradas en las muestras.
- Instrucciones en lenguaje natural para modular el estilo de habla (por ejemplo, "Speak in an excited, joyful, upbeat voice.").
- Generación de muestras de audio en inglés y chino según los ejemplos publicados.
- Ejecución con huella de VRAM reducida (pico de 3,009 GB) gracias a la cuantización mixta.
- Integración con el runtime `ming_tiny` y el script `quant_runtime.py` incluido en el repo.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio de entrada ni modo de razonamiento explícito.

## Casos de uso

- Síntesis de voz en GPUs de consumo: el pico de 3,009 GB de VRAM permite ejecutar un modelo TTS MoE de 8,98B en tarjetas como la RTX 3060 de 12 GB o la RTX 4060 Ti de 16 GB, abriendo el despliegue local sin servidores dedicados.
- Generación de audiolibros y narración con control emocional: usando el parámetro `instruction` con etiquetas como `emotion="happy"` o `emotion="sad"`, se puede modular el tono de cada fragmento de un texto largo de forma programática.
- Asistentes de voz embebidos en aplicaciones de escritorio: al requerir solo ~3 GB de VRAM, el modelo puede convivir con otras cargas en la misma GPU y ejecutarse en local para preservar la privacidad del texto sintetizado.
- Prototipado rápido de voces para videojuegos o contenido multimedia: el modo `freeform` con instrucciones de estilo permite generar variantes de locución sin reentrenar el modelo.
- Síntesis multilingüe para inglés y chino: las muestras publicadas en ambos idiomas permiten usar el modelo en productos dirigidos a esos mercados, con la cautela de que no se ha documentado la lista completa de idiomas.
- Investigación en cuantización de modelos TTS: el checkpoint sirve como referencia reproducible de una estrategia de cuantización mixta (2/4/8 bits por componente) sobre una arquitectura MoE con Flow DiT, útil para estudiar el impacto de la cuantización en la calidad del audio.
- Generación de avisos y locuciones automatizadas: la baja latencia esperada al tener solo 1,3B parámetros activos lo hace adecuado para sistemas de anuncios en tiempo casi real, siempre que se valide la calidad con el decodificador AudioVAE en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento publicados son métricas de memoria: 2,676 GB de VRAM asignada en carga, 3,009 GB de pico asignado y 3,058 GB reservado. No se proporcionan métricas de latencia, throughput ni calidad subjetiva (MOS) del audio generado.

## Requisitos de hardware

- VRAM estimada para inferencia: 2,676 GB asignados en carga y 3,009 GB de pico (3,058 GB reservados), según la model card.
- Peso en disco: `gpu_weights.pt` ocupa 2,682 GB y `cpu_weights.pt` ocupa 3,605 GB; el repositorio completo suma 6,3 GB.
- GPU recomendadas: cualquier GPU CUDA con al menos 4 GB de VRAM libre; encajan tarjetas de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090. No se especifican requisitos para A100 o H100, aunque por memoria serían sobradamente suficientes.
- Cabe en GPU de consumo: sí, con un pico de ~3 GB de VRAM.
- El decodificador AudioVAE, los embeddings y el encoder AudioVAE se ejecutan en CPU, por lo que se requiere RAM del sistema además de la VRAM.
- Opciones de despliegue: el checkpoint está pensado para el runtime `ming_tiny` del repositorio inclusionAI/Ming-3.0-tts, cargado mediante `quant_runtime.py`. Dependencias: `torch==2.6.0`, `torchaudio==2.6.0`, `torchao==0.9.0`, `transformers==4.46.3`, `fla-core==0.4.2`, `x-transformers==2.7.4`, `einops`, `einx`, `soundfile` y `onnxruntime`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| 7ven7o/Ming-3.0-tts-tiny-Q3GB | 8,98B totales / 1,3B activos | no disponible | MIT | PyTorch (torchao) | Pico de 3,009 GB VRAM; cuantización mixta 2/4/8 bits |
| inclusionAI/Ming-3.0-tts-tiny | 8,98B totales / 1,3B activos | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo base sin cuantizar; mayor huella de memoria esperada |
| inclusionAI/Ming-3.0-tts | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Repositorio de referencia del runtime `ming_tiny` |

No se dispone de datos de benchmarks ni de otros modelos TTS comparables en la información proporcionada, por lo que no es posible establecer una comparativa de rendimiento con alternativas como XTTS, Bark o Parler-TTS.

## Limitaciones y advertencias

- Modelo cuantizado de forma agresiva: los expertos MoE usan 2 bits con grupo de 128, lo que puede degradar la calidad del audio respecto al modelo base sin cuantizar. No se han publicado métricas objetivas de calidad (MOS, WER) que lo confirmen.
- El decodificador AudioVAE se ejecuta en fp32 sobre CPU, lo que añade latencia y consumo de RAM del sistema; no se han publicado cifras de latencia.
- Idiomas soportados no documentados: solo hay muestras en inglés y chino, por lo que el rendimiento en castellano u otros idiomas es desconocido.
- Longitud de contexto no disponible: se desconoce cuánto texto puede sintetizar en una sola pasada.
- Riesgo de artefactos y alucinaciones acústicas: como todo modelo TTS, puede producir pronunciaciones incorrectas, ruidos o prosodia anómala, especialmente con texto fuera de distribución.
- Dependencia de un runtime específico (`ming_tiny` + `quant_runtime.py` + `torchao==0.9.0`): no hay soporte documentado para motores de inferencia estándar como vLLM, llama.cpp u Ollama, lo que complica el despliegue en producción.
- Autoría del checkpoint: publicado por el usuario 7ven7o y cuantizado, según la model card, por "Gemini 4 Neon"; no es una versión oficial de inclusionAI. Descargas y likes a cero en el momento de la ficha, sin validación comunitaria.
- Licencia MIT: permite uso comercial, pero conviene verificar la licencia del modelo base inclusionAI/Ming-3.0-tts-tiny, que no se detalla en la información proporcionada.
- El tag `onnx` aparece en el repositorio, pero la carga documentada usa pesos PyTorch de torchao; la ruta ONNX no está explicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/7ven7o/Ming-3.0-tts-tiny-Q3GB
- Modelo base: https://huggingface.co/inclusionAI/Ming-3.0-tts-tiny
- Repositorio del runtime: https://github.com/inclusionAI/Ming-3.0-tts
- Repositorio de referencia del modelo TTS: https://huggingface.co/inclusionAI/Ming-3.0-tts
