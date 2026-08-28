# kingjones777/Tiel-Coder-35B-A3B-ROCmFP4-STRIX_LEAN-GGUF

## Resumen

Tiel-Coder-35B-A3B-ROCmFP4-STRIX_LEAN-GGUF es una requantización en formato GGUF del modelo Tiel-Coder-35B-A3B, un fine-tune orientado a codificación agéntica (agentic coding) desarrollado por peculiar-ragdoll sobre la base de Ornith-1.5-35B-A3B de ornith-ai. Esta versión específica, publicada por kingjones777, está optimizada para hardware AMD con arquitectura gfx1151 (Ryzen AI Max+ 395, también conocido como Strix Halo) y utiliza el formato de cuantización experimental ROCmFP4, que reduce el peso a aproximadamente 17,46 GiB frente a los 35,81 GiB del Q8 original.

El modelo es un MoE (Mixture of Experts) con 34.660.610.688 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (indicado por el sufijo A3B). Soporta una longitud de contexto de hasta 262.144 tokens y cuenta con una torre de visión (mmproj) disponible en el repositorio fuente. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

La relevancia de esta publicación radica en que ofrece una versión de Tiel-Coder que cabe en la memoria unificada de los procesadores Ryzen AI Max, con un rendimiento medido de 1156 tokens/s en procesamiento de prompt y 58,75 tokens/s en generación, lo que lo hace viable para uso local en equipos con esta APU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 MoE (qwen35moe) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | ~3.000 millones (A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | ROCmFP4 (Q4_0_ROCMFP4_STRIX_LEAN, tipo 106) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B utiliza una arquitectura MoE similar a la familia Qwen3, con 35B parámetros totales y 3B activos. El fine-tune Tiel-Coder añade capacidades específicas para codificación agéntica, incluyendo soporte para tool calling y razonamiento multi-paso. La versión GGUF aquí presentada es una requantización de la conversión Q8_K_XL publicada por peculiar-ragdoll, realizada con `--allow-requantize`, lo que introduce una pérdida adicional de precisión respecto a una cuantización directa desde pesos BF16. El formato ROCmFP4 es experimental y requiere un build de llama.cpp con soporte ROCmFPX.

## Capacidades

- Generación de texto y código, con enfoque en tareas de programación agéntica.
- Soporte de tool calling / function calling (por su naturaleza de agentic coding).
- Razonamiento multi-step para tareas complejas.
- Capacidad de visión (mmproj disponible en el repo fuente).
- Multilingüe probablemente, pero no confirmado en la documentación.
- Contexto largo de 262K tokens.

## Casos de uso

- Asistente de código local en equipos con Ryzen AI Max: el modelo cabe en la memoria unificada (18 GiB GTT) y genera a ~59 tok/s, suficiente para autocompletado interactivo.
- Agente de código autónomo: su fine-tune para agentic coding permite planificar y ejecutar tareas de programación multi-paso.
- Procesamiento de repositorios grandes: con 262K de contexto puede analizar proyectos completos.
- Desarrollo offline: al ser local, no requiere conexión a internet.
- Prototipado rápido: su velocidad de prompt processing (1156 tok/s) permite iterar rápidamente.
- Educación: enseñar conceptos de programación con un modelo local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, etc.) en la información disponible. La única comparación proporcionada es de rendimiento de inferencia frente al Q8_K_XL del que deriva:

| Metrica | Este build (ROCmFP4) | Q8_K_XL |
|---|---|---|
| Tamano | 17,46 GiB | 35,81 GiB |
| GTT residente | 18,0 GiB | 36,9 GiB |
| Prompt processing | 1156 tok/s | 794 tok/s |
| Generacion | 58,75 tok/s | 46,5 tok/s |

Mediciones realizadas en AMD Ryzen AI MAX+ 395, ROCm 7.2.4, full offload.

## Requisitos de hardware

- VRAM estimada: 18 GiB de memoria unificada (GTT) en Strix Halo.
- GPU recomendada: AMD Radeon 8060S integrada en Ryzen AI Max+ 395 (gfx1151).
- No cabe en GPUs discretas convencionales con menos de 20 GiB de VRAM; requiere APUs con memoria unificada o GPUs con suficiente VRAM.
- Despliegue: llama.cpp con parche ROCmFPX, usando `llama-server` con `--n-gpu-layers 999`.
- Latencia: ~17 ms/token en generación (58,75 tok/s).

## Comparativa con modelos similares

- Frente al Q8_K_XL del mismo modelo: la versión ROCmFP4 es la mitad de tamaño, más rápida en ambas métricas, pero con pérdida de calidad por la doble cuantización.
- Frente a otros modelos MoE de 35B: no se dispone de comparaciones directas en la información proporcionada.
- No disponible una comparativa más amplia.

## Limitaciones y advertencias

- Requantización sobre Q8: la doble cuantización introduce pérdida adicional de precisión; para máxima fidelidad usar el Q8_K_XL original.
- Requiere llama.cpp parcheado con ROCmFPX: el código stock no soporta ni la arquitectura ni los tipos de tensor.
- Formato experimental: ROCmFP4 es experimental y puede cambiar.
- Sesgos y alucinaciones: no hay información específica, pero como modelo de código puede alucinar APIs o funciones inexistentes.
- Rendimiento medido solo en hardware específico (Strix Halo); en otras plataformas puede variar.
- No se han publicado benchmarks de calidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Tiel-Coder-35B-A3B-ROCmFP4-STRIX_LEAN-GGUF
- Repo fuente (peculiar-ragdoll): https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Base original (ornith-ai): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- ROCmFPX (GitHub): https://github.com/charlie12345/ROCmFPX
- ROCmFP4 (GitHub): https://github.com/charlie12345/rocmfp4
- llama.cpp: https://github.com/ggml-org/llama.cpp
