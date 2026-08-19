# kingjones777/Qwen3.5-27B-ROCmFP4-GGUF

## Resumen

El modelo `kingjones777/Qwen3.5-27B-ROCmFP4-GGUF` es la primera cuantización en formato GGUF con los nuevos formatos ROCmFP4 y ROCmFPX del modelo multimodal `Qwen/Qwen3.5-27B`, desarrollada por el usuario kingjones777. Está específicamente diseñada para ejecutarse en hardware AMD con arquitectura RDNA 4, en particular el APU Strix Halo (gfx1151) como el Ryzen AI MAX+ 395, aprovechando su memoria unificada de 128 GB. El objetivo es ofrecer una versión optimizada y verificada en hardware real para despliegue local eficiente, manteniendo las capacidades del modelo original: razonamiento, código, visión y agente.

El modelo base, Qwen3.5-27B, es un modelo denso multimodal de 27 000 millones de parámetros con arquitectura híbrida que combina Gated Delta Networks con Mixture-of-Experts dispersa, contexto nativo de 262 144 tokens extensible a más de un millón, y modo de pensamiento (thinking mode) por defecto. Esta cuantización conserva la funcionalidad multimodal mediante un proyectador de visión incluido (`mmproj-BF16.gguf`). Es relevante porque permite ejecutar un modelo de esta escala en hardware AMD de consumo sin necesidad de GPUs dedicadas, con velocidades medidas de decodificación entre 7 y 12 tokens por segundo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated Delta Networks + sparse Mixture-of-Experts, multimodal (visión + texto) |
| Parametros totales | 26 895 998 464 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 262 144 tokens nativos, extensible a 1 010 000 tokens |
| Tipos de cuantizacion | Q4_0_ROCMFP4_COHERENT, Q6_0_ROCMFPX_AGENT, Q8_0_ROCMFPX, Q8_0_ROCMFPX_AGENT |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con mmproj-BF16.gguf para entrada de imágenes) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-27B emplea una arquitectura híbrida que combina Gated Delta Networks (GDN) con capas de Mixture-of-Experts dispersa, diseñada para eficiencia en razonamiento multimodal y generación de código. Incluye un codificador de visión integrado, lo que lo convierte en un modelo nativo de visión-lenguaje. El contexto nativo es de 262 144 tokens, ampliable hasta 1 010 000 mediante técnicas de extensión. El modelo opera en modo de pensamiento por defecto, generando razonamiento interno antes de responder.

Esta cuantización específica se construyó a partir del GGUF BF16 oficial del Hub, sin reconversión, utilizando el fork ROCmFPX de llama.cpp. Los pesos de la cabeza (embeddings y output) están protegidos con cuantizaciones superiores (Q6_K o Q8_0 según la variante) para mantener la calidad. El autor verificó cada variante en hardware real (Strix Halo) midiendo velocidad y corrección de salida. No se incluye un drafter MTP/EAGLE oficial para decodificación especulativa, aunque se sugiere que es posible usar un modelo pequeño de la misma familia como drafter clásico, sin que se haya medido su rendimiento.

## Capacidades

- Multimodal: acepta entrada de imágenes además de texto (requiere `mmproj-BF16.gguf` y desactivar flash attention para visión, `-fa off`).
- Generación de texto y razonamiento avanzado, incluyendo modo de pensamiento (thinking mode) por defecto.
- Generación de código y comprensión de lenguajes de programación.
- Capacidades de agente: soporte para tool calling y razonamiento multi-paso (heredado del modelo base).
- Multilingüe (idiomas no especificados en la información disponible, pero el modelo base soporta múltiples idiomas).
- No incluye decodificación especulativa nativa (MTP/EAGLE) en esta versión, pero es posible usar un drafter externo clásico.

## Casos de uso

- Inferencia local en dispositivos AMD con memoria unificada: ideal para ejecutar un modelo de 27B en un APU Strix Halo (Ryzen AI MAX+ 395) sin GPU dedicada, gracias a los formatos ROCmFP4/ROCmFPX optimizados para RDNA 4.
- Asistente de programación offline: puede generar, revisar y explicar código en entornos de desarrollo sin conexión a internet, aprovechando su contexto largo para mantener conversaciones extensas sobre proyectos.
- Análisis de documentos con imágenes: al ser multimodal, puede procesar capturas de pantalla, diagramas o documentos escaneados combinados con texto, útil en entornos corporativos con datos sensibles que no pueden enviarse a la nube.
- Prototipado de agentes conversacionales: su capacidad de tool calling y razonamiento multi-paso permite construir asistentes que interactúan con APIs o bases de datos locales.
- Investigación académica en hardware de consumo: permite experimentar con un modelo de 27B multimodal en una estación de trabajo AMD sin necesidad de clústeres de GPUs, con velocidades suficientes para pruebas interactivas.
- Despliegue en edge computing: para aplicaciones de visión por computador y procesamiento de lenguaje natural en dispositivos con memoria unificada (por ejemplo, robots o sistemas embebidos de gama alta), donde el consumo energético y el espacio son críticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos medidos son velocidades de decodificación en hardware real, presentados en la model card:

| Variante (ftype) | Tamaño de archivo | Velocidad de decodificación (mediana) | Correctitud (3 pruebas) |
|---|---|---|---|
| Q4_0_ROCMFP4_COHERENT (102) | 14.72 GiB | 12.08 t/s | 3/3 |
| Q6_0_ROCMFPX_AGENT (114) | 23.22 GiB | 7.11 t/s | 3/3 |
| Q8_0_ROCMFPX (111) | 25.92 GiB | 7.17 t/s | 3/3 |
| Q8_0_ROCMFPX_AGENT (115) | 26.28 GiB | 7.22 t/s | 3/3 |

Mediciones realizadas con `-ngl 999 -c 4096 -fa on -fit off`, 300 tokens, descartando warm-up, mediana de 3 ejecuciones. Hardware: Ryzen AI MAX+ 395, 128 GB unificados.

## Requisitos de hardware

- Hardware objetivo: AMD Strix Halo (gfx1151), específicamente Ryzen AI MAX+ 395 con 128 GB de memoria unificada.
- Requiere un build de llama.cpp con soporte ROCmFPX (fork disponible en https://github.com/charlie12345/ROCmFPX). No funciona con llama.cpp estándar, Ollama ni LM Studio.
- VRAM estimada: los archivos GGUF ocupan entre 14.72 GiB (Q4_0) y 26.28 GiB (Q8_0_AGENT). En un sistema con memoria unificada de 128 GB cabe holgadamente; para GPUs discretas se necesitaría al menos 16 GB de VRAM para la variante Q4_0, pero el formato ROCmFP4 está pensado para RDNA 4 y no es compatible con otras arquitecturas.
- Opciones de despliegue: llama.cpp (fork ROCmFPX) mediante `llama-server` o `llama-cli`. No es compatible con vLLM, TGI u otros servidores estándar sin modificaciones.
- Latencia y throughput: velocidades medidas entre 7.11 y 12.08 tokens por segundo según la variante, en el hardware de referencia. Sin decodificación especulativa nativa, estas son las cifras máximas esperables.

## Comparativa con modelos similares

No se dispone de comparativas directas con otras cuantizaciones estándar del mismo modelo (por ejemplo, Q4_K_M o Q8_0 en GGUF clásico) porque la información proporcionada no incluye esos datos. La comparación más relevante es con el modelo base sin cuantizar:

| Modelo | Parámetros | Contexto | Formato | Velocidad (Strix Halo) | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-27B (base) | 27B | 262K | safetensors (BF16) | no disponible | Apache-2.0 |
| Qwen3.5-27B-ROCmFP4-GGUF (Q4_0) | 27B | 262K | GGUF ROCmFP4 | 12.08 t/s | Apache-2.0 |
| Qwen3.5-397B-A17B (referencia de la familia) | 397B (17B activos) | 262K | no disponible | no disponible | Apache-2.0 |

La cuantización ROCmFP4 ofrece una reducción significativa de tamaño (14.72 GiB frente a ~54 GiB del BF16) con una velocidad mayor que las variantes de 8 bits, manteniendo la corrección de salida verificada. No hay datos de degradación de calidad respecto al modelo original.

## Limitaciones y advertencias

- Requiere un build específico de llama.cpp con soporte ROCmFPX; no es compatible con las herramientas estándar de la comunidad (Ollama, LM Studio, llama.cpp oficial).
- Solo funciona en hardware AMD con arquitectura RDNA 4 (gfx1151). No es utilizable en GPUs NVIDIA o AMD de generaciones anteriores.
- No incluye drafter MTP/EAGLE oficial para decodificación especulativa; las velocidades reportadas son sin especulación. El uso de un drafter clásico externo no ha sido medido y podría no funcionar correctamente.
- Para entrada de imágenes se debe desactivar flash attention (`-fa off`), lo que puede reducir el rendimiento en tareas multimodales.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, etc.) para estas cuantizaciones, por lo que no se puede cuantificar la degradación respecto al modelo original.
- El autor advierte que la variante Q6_0_ROCMFPX_AGENT es la menos recomendable: mayor tamaño que la Q4_0 y más lenta que la Q8_0, sin beneficio claro.
- Al ser una cuantización de un modelo con licencia Apache-2.0, el uso comercial está permitido, pero se debe mantener la atribución correspondiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Qwen3.5-27B-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Página de vLLM Recipes para Qwen3.5-27B: https://recipes.vllm.ai/Qwen/Qwen3.5-27B
