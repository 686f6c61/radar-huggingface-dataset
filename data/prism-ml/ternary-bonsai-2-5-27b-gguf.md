# prism-ml/Ternary-Bonsai-2.5-27B-GGUF

## Resumen

Ternary Bonsai 2.5 27B es un modelo de lenguaje de 27.360 millones de parametros publicado por Prism ML, derivado del modelo base Qwen3.8-27B mediante una cuantizacion ternaria (valores en {−1, 0, +1}) con escalado FP16 por grupos de 128 pesos. La version distribuida en este repositorio es un build GGUF orientado a llama.cpp (CUDA, Metal, CPU y SYCL) y a MLX, con un peso de 5,93 GB frente a los 53,8 GB del modelo en FP16, lo que equivale a 1,76 bits por peso y a una reduccion de tamano de aproximadamente 9x.

La relevancia de esta version (2.5) frente a Bonsai 2 radica en el enfoque hacia tareas agenticas: tool calling de multiples pasos y coding agentico de largo horizonte. Segun la model card, el modelo mantiene un rendimiento en tool calling practicamente identico al FP16 (77,2 frente a 77,7 de media en cinco benchmarks) y recupera buena parte de la capacidad de coding agentico (90% del FP16, frente al 63% de la version anterior). Incorpora ademas variantes con cabeza de prediccion multi-token (MTP) para decodificacion especulativa, con aceleraciones de decodificacion de 1,5 a 1,8x en GPUs NVIDIA.

La arquitectura subyacente es la de Qwen3.8-27B: un transformer causal de atencion hibrida (aproximadamente 75% atencion lineal y 25% atencion completa), MLP SwiGLU, RoPE y RMSNorm, con una longitud de contexto de 262.000 tokens. La licencia es Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atencion hibrida (~75% lineal / ~25% completa), SwiGLU MLP, RoPE, RMSNorm; base Qwen3.8-27B |
| Parametros totales | 27.360 millones (24,35B lenguaje en 64 bloques + 0,47B torre de vision en 27 bloques + 2,54B embedding/lm-head); safetensors reporta 26.895.998.464 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | Ternaria g128 (pesos en {−1, 0, +1} con escala FP16 por grupo de 128), 1,76 bits por peso; packs GGUF PTQ1_0 y PQ2_0, mas Q2_0 para llama.cpp upstream |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp y MLX); pesos ternarios en base rotada por Hadamard por bloques |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura de Qwen3.8-27B: 64 bloques de lenguaje con atencion hibrida, donde aproximadamente el 75% de las capas usan atencion lineal y el 25% restante atencion completa, lo que reduce el coste computacional y de memoria en contextos largos manteniendo la capacidad de atencion global. El MLP es SwiGLU, con normalizacion RMSNorm y embeddings posicionales rotatorios (RoPE). Incluye una torre de vision de 27 bloques y 0,47B de parametros, lo que implica capacidades multimodales de entrada.

La innovacion central es el formato de pesos ternario g128: cada peso toma un valor de {−1, 0, +1} con un unico factor de escala FP16 compartido por cada grupo de 128 pesos, lo que aporta log2(3) ≈ 1,585 bits de informacion por peso. Antes de la asignacion ternaria, cada matriz se transforma por bloques mediante una rotacion ortogonal de Hadamard, y el runtime aplica la transformacion equivalente a las activaciones; la rotacion se integra en los pesos almacenados sin coste adicional de bits ni de trafico de pesos. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La version 2.5 introduce variantes con cabeza de prediccion multi-token (MTP) para decodificacion especulativa y dos niveles de esfuerzo de razonamiento (`xhigh` por defecto y `medium`).

## Capacidades

- Generacion de texto conversacional y razonamiento con dos niveles de esfuerzo configurables (`xhigh` y `medium`).
- Tool calling y function calling de multiples pasos, con rendimiento declarado a nivel de FP16 en cinco benchmarks de referencia.
- Trabajo agentico de largo horizonte: uso de terminal, edicion de repositorios y resolucion de tareas de ingenieria de software.
- Coding agentico: SWE-bench Verified, Terminal-Bench 2.1 y DeepSWE evaluados en la model card.
- Capacidades multimodales de entrada gracias a la torre de vision de 0,47B de parametros integrada en la arquitectura base.
- Decodificacion especulativa mediante cabeza MTP en las variantes correspondientes, con aceleracion de 1,5 a 1,8x en GPUs NVIDIA.
- Despliegue en llama.cpp (CUDA, Metal, CPU, SYCL) y MLX (Python y Swift), incluido iOS/macOS mediante el fork de mlx-swift.
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).

## Casos de uso

- Agentes de automatizacion de tareas de desarrollo: el modelo puede encadenar llamadas a herramientas (shell, editores, APIs de repositorio) en tareas de varios pasos gracias a su entrenamiento agentico y a los 262K tokens de contexto, que permiten mantener el historial completo de la sesion.
- Resolucion de issues en repositorios: con un rendimiento declarado de 75,6 en SWE-bench Verified, es adecuado para pipelines que reciben un issue, localizan el codigo relevante y proponen un parche verificable.
- Automatizacion de operaciones en terminal: los 60,1 puntos en Terminal-Bench 2.1 lo hacen util para agentes que ejecutan comandos, interpretan salidas y corrigen errores de forma iterativa.
- Asistentes de codigo en estaciones de trabajo con GPU de consumo: al ocupar 5,93 GB en formato ternario, cabe en GPUs consumer de 8 GB o mas y permite inferencia local con contexto largo sin depender de la nube.
- Despliegue en dispositivos Apple: mediante los forks de MLX y mlx-swift puede ejecutarse en Apple Silicon, macOS e iOS, habilitando asistentes locales con tool calling.
- Servicio de atencion al cliente con integracion de herramientas: el soporte de function calling permite consultar sistemas de pedidos, bases de conocimiento o APIs internas dentro de una conversacion multi-turno con contexto extenso.
- Procesamiento de documentos largos con entrada visual: la torre de vision y el contexto de 262K tokens permiten analizar capturas, diagramas o documentos escaneados junto con texto extenso en una misma ventana.

## Benchmarks y rendimiento

Datos declarados en la model card (medias agregadas y benchmarks individuales):

| Benchmark | Ternary Bonsai 2.5 27B | FP16 (Qwen3.8-27B) | Bonsai 2 |
|---|---|---|---|
| Media tool calling (τ²-Bench, τ³-Bench, BFCL v3, BFCL v4, AppWorld) | 77,2 | 77,7 | no disponible |
| Media capacidades generales (16 benchmarks, 5 categorias) | 82,1 | 84,3 | no disponible |
| SWE-bench Verified | 75,6 | no disponible | 60,8 |
| Terminal-Bench 2.1 | 60,1 | no disponible | 52,8 |
| DeepSWE | 27,0 | no disponible | 0 |
| Coding agentico (media, % del FP16) | 90% | 100% | 63% |

Comparativas declaradas frente a otras cuantizaciones de Qwen3.8-27B: frente a GSQ-RCO IQ3_XXS (1,7x mayor en tamano), Bonsai 2.5 obtiene 77,2 frente a 75,3 en tool calling y 54,2 frente a 55,5 en coding agentico. La model card lo describe como el modelo agentico mas fuerte por debajo de 10 GB entre los builds de bajo bit comparados. No se detallan los resultados individuales por benchmark en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 5,93 GB para los pesos en formato ternario PTQ1_0; el repositorio completo ocupa 44,1 GB porque incluye multiples packs y variantes.
- Cabe en GPUs de consumo: si, en tarjetas con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 4060, RTX 4070 y superiores), asi como en Apple Silicon mediante MLX.
- GPUs de datacenter medidas en la model card: siete GPUs NVIDIA, incluidas H200 y B200, donde alcanza aproximadamente 300 tokens/s con MTP y los kernels en pruebas.
- Aceleracion de decodificacion: 2,3 a 3,0x mas rapida que en el lanzamiento de Bonsai 2 en seis de las siete GPUs NVIDIA medidas; 1,5 a 1,8x adicional con las variantes MTP.
- Opciones de despliegue: llama.cpp upstream con los ficheros Q2_0, fork de llama.cpp de PrismML para PTQ1_0 (CUDA y Metal), MLX (Python y Swift), mlx-swift para iOS/macOS. El soporte de PTQ1_0 esta en revision en llama.cpp upstream.
- Backends adicionales: CPU y SYCL ademas de CUDA y Metal.
- Latencia: no disponible de forma desagregada por GPU; solo se publican las cifras de throughput mencionadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling (media) | Coding agentico (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ternary Bonsai 2.5 27B | 27,36B (ternario, 5,93 GB) | 262K | 77,2 | 54,2 | Apache 2.0 | GGUF en Hugging Face |
| Qwen3.8-27B FP16 | 27,36B | 262K | 77,7 | ~60 (90% de FP16) | no disponible en la informacion | modelo base |
| GSQ-RCO IQ3_XXS (Qwen3.8-27B) | 27,36B (IQ3_XXS, ~1,7x mayor) | no disponible | 75,3 | 55,5 | no disponible | GGUF |
| Bonsai 2 27B | 27,36B (ternario) | no disponible | no disponible | 63% del FP16 | Apache 2.0 | GGUF |

La comparativa se limita a los datos publicados en la model card; no se dispone de resultados de otros modelos de tamano similar ajenos a la familia Qwen3.8-27B.

## Limitaciones y advertencias

- La cuantizacion ternaria implica una perdida medible de capacidades generales: 82,1 frente a 84,3 del FP16 en la media de 16 benchmarks, y aproximadamente un 10% menos en coding agentico.
- El rendimiento en tool calling se ha medido con los ajustes de evaluacion del autor; los resultados pueden variar con prompts, herramientas y esquemas de function calling distintos.
- No se especifican los idiomas soportados en la informacion disponible; el comportamiento multilingue fuera del ingles no esta documentado.
- Riesgo de alucinacion inherente a los modelos de lenguaje; en tareas agenticas con ejecucion de comandos o edicion de codigo, los errores pueden tener efectos reales, por lo que se recomienda sandboxing y supervision.
- No se documentan sesgos conocidos ni la composicion del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo.
- El pack PTQ1_0 requiere el fork de llama.cpp de PrismML o MLX; solo los ficheros Q2_0 funcionan en llama.cpp upstream, y el soporte de PTQ1_0 esta aun en revision.
- El repositorio de 44,1 GB incluye varias variantes; es necesario seleccionar el pack y la variante (con o sin MTP) adecuados al backend para no descargar pesos innecesarios.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base Qwen3.8-27B deben verificarse de forma independiente, ya que no se detallan en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Web de Prism ML: https://prismml.com
- Whitepaper de Bonsai 2.5 27B: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-5-27b-whitepaper.pdf
- Whitepaper de Bonsai 2 27B (formato ternario y base rotada): https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-27b-whitepaper.pdf
- Demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Fork de llama.cpp con kernels de bajo bit (CUDA y Metal): https://github.com/PrismML-Eng/llama.cpp
- Fork de MLX (Apple Silicon): https://github.com/PrismML-Eng/mlx
- Fork de mlx-swift (iOS/macOS): https://github.com/PrismML-Eng/mlx-swift
- Discord de la comunidad: https://discord.gg/prismml
