# sirus/Qwen3.8-27B-heretic-ara-MXFP6-MXFP8-DFlash2-GGUF

## Resumen

El repositorio `sirus/Qwen3.8-27B-heretic-ara-MXFP6-MXFP8-DFlash2-GGUF` contiene una cuantización experimental en formato GGUF del modelo `heretic-org/Qwen3.8-27B-heretic-ara`, acompañada de un draft DFlash2 para decodificación especulativa. El objetivo es optimizar la inferencia del modelo de 27 000 millones de parámetros en hardware Blackwell mediante una mezcla de tensores MXFP6_E2M3 y OCP MXFP8, junto con un runtime específico de llama.cpp que no es compatible con la versión estándar.

La relevancia de esta publicación radica en que introduce una extensión experimental de GGUF (MXFP6_E2M3) y un esquema de decodificación especulativa con siete tokens de draft, diseñado para reducir la latencia en GPUs Blackwell. El modelo base es Qwen3.8-27B, un modelo denso con arquitectura de atención híbrida: solo 16 de las 64 capas usan atención completa, mientras que las otras 48 emplean atención lineal con estado recurrente. La ventana de contexto configurada por defecto es de 262 144 tokens.

El autor, sirus, ha publicado el modelo con licencia Apache-2.0, pero advierte que se trata de un artefacto experimental sin una evaluación cuantitativa de calidad frente a BF16. No se han publicado resultados de benchmarks ni mediciones de throughput comparables en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (denso, atención híbrida: 16/64 capas con atención completa, 48/64 con atención lineal) |
| Parámetros totales | 27 320 697 856 (target) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (configuración por defecto del launcher) |
| Tipos de cuantización | MXFP6_E2M3 (396 tensores), OCP MXFP8 (110 tensores), ~6.51 BPW |
| Idiomas soportados | No especificado |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (target y draft) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B utiliza una arquitectura híbrida de atención: de las 64 capas totales, 16 emplean atención completa (con un intervalo de 4) y las restantes 48 usan atención lineal con un estado recurrente constante, lo que reduce el coste computacional de la atención a largo plazo. El modelo heretic-ara es un fine-tuning de Qwen3.8-27B, pero no se han publicado detalles sobre el dataset de entrenamiento, el proceso de alineación (RLHF/DPO) o las técnicas de ajuste empleadas.

La cuantización se realiza con una mezcla de formatos MXFP6_E2M3 y OCP MXFP8, preservando los tensores MTP (multi-token prediction) del modelo original. El draft DFlash2, derivado de `incoai/Qwen3.8-27B-DFlash2`, se utiliza para decodificación especulativa con siete tokens de draft. La innovación principal es el soporte de MXFP6_E2M3 como extensión experimental de GGUF, que requiere un runtime específico (`sirus20x6/llama.cpp-blackwell-dflash2`) y no es compatible con llama.cpp estándar.

## Capacidades

- Generación de texto autoregresiva, pipeline `text-generation`.
- Decodificación especulativa con DFlash2 (7 tokens de draft) para reducir latencia.
- Soporte de contexto largo (hasta 262 144 tokens configurados por defecto).
- Preservación de tensores MTP (multi-token prediction) para mejorar la calidad de la generación.
- Solo entrada/salida de texto (no visión ni audio).
- No se documenta soporte explícito de tool calling o function calling.
- No se documentan capacidades de agentes o razonamiento multi-step específicas.

## Casos de uso

- Inferencia local en hardware Blackwell: el modelo está optimizado para GPUs Blackwell (p. ej., RTX 50 series, B200) mediante el runtime específico, lo que permite ejecutar un modelo de 27B con cuantización MXFP6/MXFP8 en una sola GPU de gama alta.
- Generación de texto largo con contexto extendido: la ventana de 262 144 tokens permite procesar documentos extensos, transcripciones completas o conversaciones de muchas vueltas sin truncar.
- Prototipado de aplicaciones de bajo coste de memoria: con 20.72 GiB de pesos del target y 1.47 GiB del draft, puede caber en GPUs con 24 GiB de VRAM, aunque la cache KV de contexto largo puede requerir más.
- Investigación sobre formatos de cuantización experimentales: el uso de MXFP6_E2M3 y OCP MXFP8 sirve como banco de pruebas para evaluar la viabilidad de estos formatos en modelos de gran tamaño.
- Despliegue en entornos con restricciones de red eléctrica o presupuesto: al ser un GGUF, se puede ejecutar con llama.cpp en CPUs o GPUs modestas, aunque el runtime específico está pensado para Blackwell.
- Integración en aplicaciones de chat o asistencia local: el modelo puede servir como base para asistentes conversacionales que requieren contexto largo, siempre que se acepte la naturaleza experimental del artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no se realizó una evaluación final de PPL/KLD frente a BF16, y que los datos de throughput publicados anteriormente fueron retirados por no ser una comparación controlada válida. Por lo tanto, no se presentan cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada: los pesos del target ocupan 20.72 GiB y el draft 1.47 GiB, sumando ~22.2 GiB solo para los pesos. Con contexto 262 144 tokens y caché KV en MXFP8, la VRAM total puede superar los 24 GiB; se recomienda reducir la ventana de contexto para ajustarse a GPUs de 24 GiB.
- GPU recomendadas: cualquier GPU Blackwell compatible con el runtime (p. ej., RTX 50 series, B200). El fork de llama.cpp está específicamente optimizado para arquitectura Blackwell.
- Compatibilidad con GPU de consumo: una RTX 4090 (24 GiB) puede ejecutar el modelo con contexto reducido, pero la caché KV de contexto completo puede no caber.
- Opciones de despliegue: únicamente el fork de llama.cpp `sirus20x6/llama.cpp-blackwell-dflash2`. No se mencionan integraciones con vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles. La model card retiró las cifras anteriores por falta de una comparación controlada.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `sirus/Qwen3.8-27B-heretic-ara-MXFP6-MXFP8-DFlash2-GGUF` (este) | 27 320 697 856 | MXFP4/MXFP8, ~6.51 BPW | 262 144 | Apache-2.0 | GGUF + draft | Experimental, requiere runtime específico |
| `heretic-org/Qwen3.8-27B-heretic-ara` (base) | 27 320 697 856 | BF16 (original) | 262 144 | Apache-2.0 | safetensors | Disponible |
| `mradermacher/Qwen3.8-27B-heretic-ara-GGUF` | 27 320 697 856 | GGUF estándar (Q4_K_M, Q5_K_M, etc.) | 262 144 | Apache-2.0 | GGUF | Compatible con llama.cpp estándar |
| `Qwen/Qwen3.8-27B` (original) | 27 320 697 856 | BF16 | 262 144 | Apache-2.0 | safetensors | Disponible |

La principal diferencia es el formato de cuantización experimental y la dependencia de un runtime específico, frente a los GGUF estándar que funcionan con llama.cpp vanilla.

## Limitaciones y advertencias

- El formato MXFP6_E2M3 es experimental y no es compatible con llama.cpp estándar; se requiere el fork específico del runtime.
- No se ha realizado una evaluación cuantitativa de la calidad (PPL/KLD) frente al modelo BF16, por lo que no hay garantía de que la cuantización no degrade significativamente la generación.
- El modelo es solo texto; no soporta entradas multimodales.
- No se han publicado resultados de benchmarks ni mediciones de rendimiento válidas.
- El runtime puede incluir componentes de terceros (llama.cpp, TurboQuant, Four Over Six) con sus propias licencias; revisar los avisos en el repositorio.
- Al ser un modelo de lenguaje, existe riesgo de alucinaciones, sesgos en los datos de entrenamiento y limitaciones en idiomas distintos de los que se hayan usado en el fine-tuning.
- Para uso en producción, se recomienda validar la calidad del modelo con datos propios antes de desplegarlo, dado su carácter experimental.

## Enlaces

- Hugging Face (repositorio): https://huggingface.co/sirus/Qwen3.8-27B-heretic-ara-MXFP6-MXFP8-DFlash2-GGUF
- Runtime fork (llama.cpp): https://github.com/sirus20x6/llama.cpp-blackwell-dflash2
- Modelo base (heretic-org): https://huggingface.co/heretic-org/Qwen3.8-27B-heretic-ara
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Draft DFlash2 (incoai): https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Quantizer avanzado: https://github.com/michaelw9999/advanced-gguf-quantizer
- Blog de AMD sobre Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
