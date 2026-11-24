# cottonable/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16-heretic-mlx-4Bit

## Resumen

Este repositorio contiene una conversión a formato MLX en cuantización de 4 bits del modelo NVIDIA Nemotron-3 Nano 30B-A3B, en su variante "heretic" (también etiquetada como uncensored, decensored, abliterated y ara). El modelo original lo desarrolla NVIDIA; la variante heretic procede de `trohrbaugh/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16-heretic` y la conversión a MLX la publica el usuario `cottonable` usando mlx-lm 0.31.2. El objetivo es ofrecer una versión ejecutable en Apple Silicon con pesos de 4 bits, manteniendo la arquitectura híbrida Nemotron-H y eliminando (o atenuando) los mecanismos de rechazo del modelo base.

El modelo base es un transformer híbrido de tipo MoE con 31.577.935.872 parámetros totales (unos 31,6 mil millones) y 3 mil millones de parámetros activos por token, de ahí el sufijo "30B-A3B". Está entrenado sobre una mezcla extensa de datasets propietarios de NVIDIA (código, matemáticas, ciencia, instrucciones, agentes y datos web filtrados), lo que lo sitúa en la categoría de modelos de razonamiento y generación de código de tamaño medio con activación eficiente.

La relevancia de esta ficha concreta es doble: por un lado, permite ejecutar un modelo de 31,6B en hardware Apple con un peso de repositorio de 17,8 GB gracias a la cuantización de 4 bits; por otro, la modificación heretic cambia el comportamiento de seguridad respecto al modelo original, algo crítico para cualquier evaluación en producción. No se dispone de datos de benchmarks específicos de esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE (tag `nemotron_h`), código personalizado (`custom_code`) |
| Parametros totales | 31.577.935.872 (31,6B) |
| Parametros activos | 3B (MoE, según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX), BF16 en el modelo base de origen |
| Idiomas soportados | en, es, fr, de, ja, it |
| Licencia | nvidia-nemotron-open-model-license (etiquetada como `other`) |
| Formato de pesos | safetensors en formato MLX (repo de 17,8 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido con mezcla de expertos (MoE), identificado por el tag `nemotron_h` y con código personalizado (`custom_code`) que requiere `trust_remote_code` en transformers. El modelo activa 3B parámetros por token sobre un total de 31,6B, lo que reduce el coste computacional de inferencia frente a un modelo denso equivalente. La variante aquí publicada es una conversión a MLX 4 bits realizada con mlx-lm 0.31.2 a partir de una versión BF16 "heretic", que a su vez deriva del Nemotron-3 Nano original de NVIDIA.

El entrenamiento del modelo base se apoya en una mezcla muy amplia de datasets de NVIDIA: `Nemotron-CC-v2`, `Nemotron-CC-v2.1`, `Nemotron-CC-Code-v1`, `Nemotron-Pretraining-Code-v1/v2`, `Nemotron-CC-Math-v1`, `Nemotron-Math-v2`, `Nemotron-Math-Proofs-v1`, `Nemotron-Competitive-Programming-v1`, `Nemotron-Agentic-v1`, `Nemotron-Instruction-Following-Chat-v1`, `Nemotron-Science-v1`, `Nemotron-Pretraining-SFT-v1`, `Nemotron-Pretraining-Specialized-v1` y `Nemotron-3-Nano-RL-Training-Blend`. Esta composición indica un entrenamiento orientado a código, matemáticas, ciencia, seguimiento de instrucciones y uso agéntico, con una fase de RL. No se dispone de cifras de tokens totales ni de detalles del proceso de RLHF/DPO en la información proporcionada.

La modificación heretic (etiquetas uncensored, decensored, abliterated, ara) implica una alteración de los pesos orientada a eliminar la dirección de rechazo del modelo, técnica conocida como abliteration. No se detalla en la información disponible el método exacto ni el conjunto de datos usado para la intervención.

## Capacidades

- Generación de texto conversacional multi-turno en seis idiomas (inglés, español, francés, alemán, japonés e italiano).
- Razonamiento y matemáticas, respaldado por los datasets Nemotron-Math y Nemotron-Math-Proofs del entrenamiento.
- Generación de código, incluyendo programación competitiva, según los datasets Nemotron-CC-Code y Nemotron-Competitive-Programming.
- Capacidades agénticas y de razonamiento multi-paso, por el dataset Nemotron-Agentic-v1.
- Seguimiento de instrucciones conversacionales (Nemotron-Instruction-Following-Chat-v1).
- Conocimiento científico (Nemotron-Science-v1).
- Comportamiento sin rechazo (uncensored/abliterated): el modelo no aplica los filtros de seguridad del modelo original.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Modo thinking explícito: no confirmado en la información disponible.
- Visión o audio: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: la cuantización MLX 4 bits y el peso de 17,8 GB permiten cargar el modelo en Macs con memoria unificada de 24 GB o superior, usando `mlx-lm` como runtime.
- Generación de código en local: el entrenamiento sobre datasets de código y programación competitiva lo hace adecuado para autocompletado y generación de funciones en entornos sin conexión, con la ventaja de los 3B parámetros activos por token.
- Asistencia matemática y demostraciones: los datasets Nemotron-Math y Nemotron-Math-Proofs respaldan tareas de resolución paso a paso y verificación de demostraciones.
- Investigación sobre alineación y seguridad: al ser una variante abliterated, sirve como contrapunto experimental para estudiar cómo cambia el comportamiento de un modelo al eliminar la dirección de rechazo.
- Prototipado de agentes multi-paso: el dataset Nemotron-Agentic-v1 sugiere capacidad para descomponer tareas, aunque la ausencia de confirmación de tool calling limita la integración con APIs externas.
- Procesamiento multilingüe en seis idiomas: atención al cliente o generación de contenido en español, francés, alemán, italiano, japonés e inglés, siempre que el contexto lo permita.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad entre BF16 y MLX 4 bits en un modelo MoE de 31,6B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el repo pesa 17,8 GB en 4 bits, por lo que se recomienda un mínimo de 20-24 GB de memoria unificada en Apple Silicon para cargar el modelo con margen para el contexto.
- GPU Apple: cualquier chip M-series con memoria unificada suficiente (M2 Pro/Max con 32 GB, M3/M4 Pro/Max, Mac Studio). No es compatible con CUDA de forma nativa en este formato.
- GPU NVIDIA: para ejecutar el modelo base BF16 se necesitarían aproximadamente 63 GB en BF16 (31,6B × 2 bytes), lo que exige A100 80 GB o H100; esta conversión MLX no está pensada para CUDA.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en BF16; requeriría una cuantización GGUF adicional no incluida en este repo.
- Opciones de despliegue: `mlx-lm` (runtime oficial de esta conversión); para el modelo base, vLLM o TGI con soporte de `nemotron_h` y `trust_remote_code`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (Nemotron-3 Nano heretic MLX 4-bit) | 31,6B | 3B | no disponible | nvidia-nemotron-open-model-license | MLX safetensors 4-bit |
| NVIDIA Nemotron-3 Nano 30B-A3B (original) | 31,6B | 3B | no disponible | nvidia-nemotron-open-model-license | safetensors BF16 |
| Modelo denso de ~30B (referencia genérica) | ~30B | 30B | variable | variable | safetensors/GGUF |

La comparación con modelos densos de tamaño similar es favorable en coste de inferencia gracias a los 3B parámetros activos, pero no se dispone de datos de benchmarks para cuantificar la diferencia de calidad. No se dispone de información sobre alternativas MoE comparables en la información proporcionada.

## Limitaciones y advertencias

- La modificación heretic elimina los mecanismos de rechazo del modelo original: puede generar contenido dañino, ilegal o inseguro sin filtros, lo que la hace inadecuada para aplicaciones de cara al público sin moderación adicional.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se dispone de evaluaciones específicas de fidelidad para esta variante.
- La cuantización a 4 bits puede degradar la calidad respecto al BF16 original, especialmente en tareas de matemáticas y código; no hay mediciones publicadas.
- La longitud de contexto no está documentada en la información disponible, lo que impide planificar cargas de trabajo con ventanas largas.
- La licencia nvidia-nemotron-open-model-license impone condiciones específicas de uso comercial; es necesario revisar el texto completo antes de desplegar en producción.
- El modelo requiere `trust_remote_code` por su arquitectura personalizada, lo que implica ejecutar código del repositorio.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a CUDA sin reconversión.
- Solo se declaran seis idiomas; el rendimiento en otros idiomas no está garantizado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cottonable/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16-heretic-mlx-4Bit
- Modelo base de la conversión: https://huggingface.co/trohrbaugh/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16-heretic
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
