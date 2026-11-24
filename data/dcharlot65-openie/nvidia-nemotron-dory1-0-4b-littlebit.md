# dcharlot65-openie/NVIDIA-Nemotron-Dory1.0-4B-LittleBit

## Resumen

`NVIDIA-Nemotron-Dory1.0-4B-LittleBit` es un checkpoint de pesos vivos (living weights) publicado por el usuario `dcharlot65-openie` en Hugging Face, derivado del modelo `nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4`. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: es una factorización y compresión agresiva del checkpoint base mediante una combinación de LittleBit-2 y Sakana SVF, empaquetada en el formato `.jsyn` propietario de JouleDB, una base de datos termodinámica y runtime de inferencia sin PyTorch escrito en Rust.

El modelo conserva la arquitectura y los 3.975.229.440 parámetros del checkpoint original de NVIDIA (aproximadamente 4B), pero los almacena con una media de 0,0163 bits por peso, lo que reduce el artefacto a 17,37 MB frente a los 7.582,15 MB que ocuparía en FP16 (una ratio de compresión de 436,39x). La factorización se aplica sobre 290 tensores 2D en bitplanes y 217 vectores 1D de LayerNorm, bias y depthwise.

Su relevancia es fundamentalmente experimental: demuestra un pipeline de compresión sub-1-bit con verificación de integridad (zstd + CRC32) y despliegue nativo en Kubernetes a través de JouleKube. No hay información pública sobre calidad de inferencia, benchmarks ni evaluación de degradación tras la compresión, por lo que debe tratarse como una prueba de concepto de infraestructura más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de `nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4`); factorizada en bitplanes LittleBit-2 ⊕ Sakana SVF |
| Parametros totales | 3.975.229.440 (~4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Sub-1-bit: 0,0163 BPW promedio; 290 tensores 2D en bitplanes, 217 vectores 1D; empaquetado `.jsyn` con zstd + CRC32 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (etiquetada como `other` en Hugging Face, con `license_name: openmdw-1.1`) |
| Formato de pesos | `.jsyn` (JouleDB); no se publican safetensors ni GGUF |
| Tamano del repositorio | 0,0 GB (artefacto comprimido de 17,37 MB) |
| Tamano equivalente FP16 | 7.582,15 MB |
| Libreria / runtime | `jouledb` v0.2.4+ |
| Modelo base | `nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del checkpoint de NVIDIA `Nemotron-Labs-Dory1.0-4B-NVFP4`, un transformer de aproximadamente 4B parámetros originalmente distribuido en formato NVFP4 (punto flotante de 4 bits de NVIDIA). Sobre ese checkpoint, el autor aplica una doble factorización: por un lado LittleBit-2, que descompone los tensores 2D en bitplanes de muy baja precisión; por otro, Sakana SVF (Singular Value Fine-tuning), una técnica de adaptación basada en valores singulares. El resultado se serializa en `.jsyn` con compresión zstd y checksum CRC32 por bloque.

No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se especifica qué parte del proceso corresponde a entrenamiento y qué parte a mera compresión post-hoc, ni se detalla cómo se reconstruyen los pesos en tiempo de inferencia. La innovación técnica declarada es el propio formato `.jsyn` y su integración con JouleDB, descrito como base de datos termodinámica con runtime de inferencia sin PyTorch y despliegue nativo en Kubernetes (JouleKube). No se aportan métricas de fidelidad de reconstrucción respecto al modelo base.

## Capacidades

- No hay información publicada sobre las capacidades efectivas del modelo tras la compresión sub-1-bit.
- Por herencia del checkpoint base de NVIDIA, cabe esperar generación de texto y razonamiento general, pero no se documenta ni se verifica en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas está vacío).
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- La única capacidad verificable es la carga del artefacto mediante `db.hf_pull(...)` en un servidor JouleDB y su servicio por HTTP en `127.0.0.1:8080`.

## Casos de uso

- Prueba de concepto de compresión extrema: evaluar en un entorno controlado cuánta calidad se conserva al pasar de un checkpoint NVFP4 de 4B a un artefacto de 0,0163 BPW, comparando salidas contra el modelo base de NVIDIA.
- Distribución de artefactos en entornos con ancho de banda restringido: un fichero de 17,37 MB puede transportarse y replicarse en clústeres o dispositivos edge donde descargar 7,5 GB en FP16 no es viable.
- Investigación en formatos de pesos: estudiar la viabilidad de `.jsyn` como alternativa a GGUF o safetensors para almacenamiento de modelos factorizados con integridad verificable (CRC32).
- Despliegue Kubernetes-native: usar JouleKube para orquestar instancias del runtime JouleDB como servicio HTTP, aprovechando que no requiere PyTorch ni el stack de CUDA habitual.
- Benchmarking de runtimes alternativos: medir latencia y throughput de JouleDB frente a vLLM, llama.cpp u Ollama sobre el mismo modelo base, para cuantificar el coste de la reconstrucción en tiempo de inferencia.
- Docencia y demostraciones de técnicas de factorización: ilustrar con un caso real la diferencia entre cuantización clásica (4 bits, 8 bits) y esquemas sub-1-bit basados en bitplanes y SVF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de compresión (436,39x, 0,0163 BPW, 17,37 MB), sin datos de MMLU, HumanEval, GSM8K ni comparaciones de calidad frente al checkpoint base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El artefacto en disco ocupa 17,37 MB, pero el espacio en memoria tras la reconstrucción de los 3.975.229.440 parámetros no se documenta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el runtime JouleDB se describe como independiente de PyTorch, pero no se detallan backends de cómputo (CUDA, ROCm, CPU).
- Opciones de despliegue: exclusivamente JouleDB v0.2.4 o superior (`cargo binstall jouledb`, `jouledb serve --http-addr 127.0.0.1:8080`). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `NVIDIA-Nemotron-Dory1.0-4B-LittleBit` | 3,97B | no disponible | `.jsyn` (sub-1-bit, 17,37 MB) | OpenMDW-1.1 | Hugging Face, runtime JouleDB |
| `nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4` (base) | ~4B | no disponible | NVFP4 | OpenMDW-1.1 | Hugging Face |
| Checkpoints GGUF Q4 de modelos ~4B | ~4B | variable | GGUF | variable | Hugging Face, llama.cpp/Ollama |
| Checkpoints safetensors FP16 de modelos ~4B | ~4B | variable | safetensors | variable | Hugging Face, vLLM/TGI |

La comparación relevante es contra el propio modelo base: LittleBit reduce el artefacto de 7.582,15 MB (FP16 equivalente) a 17,37 MB, pero no publica métricas de degradación. Frente a cuantizaciones GGUF de 4 bits, la diferencia de tamaño es de varios órdenes de magnitud, a costa de un ecosistema de ejecución mucho más restringido (solo JouleDB).

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni comparación de salidas con el modelo base, ni métricas de perplejidad tras la compresión.
- Riesgo alto de degradación: 0,0163 BPW es una compresión extrema; sin datos de fidelidad no puede asumirse que el modelo conserve las capacidades del checkpoint de NVIDIA.
- Sesgos: no documentados. Al heredar el checkpoint base, podría arrastrar los sesgos de este, pero no se analiza.
- Alucinación: no evaluada; la compresión agresiva puede incrementarla de forma no cuantificada.
- Idiomas: el campo de idiomas está vacío; no se garantiza soporte de castellano ni de ningún otro idioma concreto.
- Licencia: OpenMDW-1.1 se presenta como permisiva, pero la ficha de Hugging Face la etiqueta como `other`; conviene revisar los términos en openmdw.ai antes de un uso comercial, así como las condiciones del checkpoint base de NVIDIA.
- Dependencia de un runtime propietario: solo funciona con JouleDB, una herramienta con versión mínima 0.2.4 y ecosistema muy reducido; no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, repositorio de 0,0 GB y publicación reciente; no hay evidencia de uso en producción.
- Formato no estándar: `.jsyn` no es interoperable con el ecosistema habitual de Hugging Face, lo que complica la integración en pipelines existentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dcharlot65-openie/NVIDIA-Nemotron-Dory1.0-4B-LittleBit
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
- Licencia OpenMDW-1.1: https://openmdw.ai/
