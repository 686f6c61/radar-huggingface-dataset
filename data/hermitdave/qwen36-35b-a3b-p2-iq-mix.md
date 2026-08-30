# hermitdave/qwen36-35b-a3b-p2-iq-mix

## Resumen

`hermitdave/qwen36-35b-a3b-p2-iq-mix` es un GGUF cuantizado con precisión mixta del modelo Qwen/Qwen3.6-35B-A3B, un MoE híbrido de 35 mil millones de parámetros totales con solo 3 mil millones activos por token. El autor, hermitdave, lo construyó como parte de un experimento de dos vías: el Path 1 (ternario) está optimizado para CUDA, mientras que este Path 2 emplea cuantización I-quant (IQ2_XXS / IQ3_XXS) para funcionar correctamente en Apple Silicon a través de Metal. Es la versión recomendada para Mac, ya que los kernels `mul_mat_id` de Metal soportan estos tipos de cuantización.

El modelo base, Qwen3.6-35B-A3B, es una arquitectura MoE con 40 capas, contexto nativo de 262 000 tokens (extensible a 1,01 M mediante YaRN) y capacidades multimodales (texto, imagen y vídeo). Sin embargo, este GGUF se centra exclusivamente en texto y está diseñado para ejecutarse con llama.cpp. El resultado es un archivo de 13,5 GiB (3,26 bpw) que alcanza una velocidad de decodificación de 70,7 tokens por segundo en un M3 Max, lo que lo convierte en una opción práctica para desarrollo local en Mac.

La relevancia de esta ficha radica en que demuestra una receta de cuantización mixta que preserva el estado recurrente SSM (Gated DeltaNet) en Q8_0, mantiene la perplejidad en 5,48 ± 0,53 sobre un corpus expositivo, y permite ejecutar un modelo de 35B en hardware de consumo de Apple. Es un ejemplo de cómo la cuantización selectiva por capas puede equilibrar tamaño, velocidad y calidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con atención y Gated DeltaNet SSM (40 capas) |
| Parametros totales | 35 505 251 456 |
| Parametros activos | 3 000 000 000 (3B) |
| Longitud de contexto | 262 144 tokens (extensible a 1 010 000 via YaRN) |
| Tipos de cuantizacion | Mezcla: IQ3_XXS (29 capas de expertos enrutados), IQ2_XXS (11 capas), IQ3_XXS (down-projection), Q8_0 (estado SSM), Q4_K (MTP head), Q8_0/Q4_K/Q5_K (router, embeddings, atención), bf16 (output.weight) |
| Idiomas soportados | No disponible (el modelo base Qwen es multilingüe, pero no se especifica para este GGUF) |
| Licencia | other (consultar licencia del modelo base Qwen) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un MoE híbrido que combina atención tradicional con un estado recurrente Gated DeltaNet SSM. Esto le permite manejar secuencias largas con eficiencia computacional, activando solo 3B de sus 35B parámetros por token. El entrenamiento original (realizado por Qwen) incluye datos multimodales y técnicas de alineación con preservación del pensamiento entre turnos, aunque los detalles exactos del dataset no están disponibles en la información proporcionada.

La contribución técnica de este repo reside en la receta de cuantización mixta. El autor utilizó la imatrix de bartowski para identificar las 29 capas de mayor importancia y les aplicó IQ3_XXS, mientras que las 11 restantes recibieron IQ2_XXS. El estado SSM se mantiene en Q8_0 para conservar la precisión de la recurrencia, el MTP head (predicción multi-token) se fijó en Q4_K, y el `output.weight` se dejó en bf16. Esta combinación busca maximizar la calidad en las partes críticas del modelo mientras se reduce el tamaño total a 3,26 bpw.

## Capacidades

- Generación de texto y razonamiento complejo: el modelo base alcanza un 73,4 % en SWE-bench (según fuentes externas), lo que sugiere una fuerte capacidad de razonamiento y resolución de problemas de ingeniería de software.
- Soporte de tool calling y function calling: el modelo base Qwen3.6 incluye esta capacidad, aunque el GGUF no lo confirma explícitamente; se asume que se conserva si el proceso de cuantización no la elimina.
- Pensamiento multi-turno: el modelo base incorpora "thinking preservation across conversation turns", lo que permite mantener cadenas de razonamiento a lo largo de diálogos extensos.
- Contexto largo: 262 144 tokens nativos, ampliables a 1,01 M con YaRN, adecuado para documentos extensos y análisis de repositorios completos.
- Multilingüe: el modelo base soporta múltiples idiomas, pero no se especifica cuáles en este GGUF.
- Limitación: este GGUF es solo de texto; no incluye las capacidades multimodales (imagen/vídeo) del modelo base.

## Casos de uso

- Asistente de programación local en MacBook: con su contexto de 262k tokens y velocidad de decodificación de ~70 tok/s en M3 Max, permite mantener conversaciones largas sobre código, revisar proyectos completos y generar parches sin depender de la nube.
- Análisis de documentos legales o académicos extensos: la ventana de contexto amplia permite procesar contratos, tesis o informes de cientos de páginas en una sola pasada, resumiendo y extrayendo cláusulas relevantes.
- Prototipado de agentes conversacionales con tool calling: si el GGUF conserva el soporte de function calling del modelo base, se puede integrar en frameworks como LangChain o LlamaIndex para construir agentes que consulten APIs, bases de datos o ejecuten comandos, todo en local.
- Generación de documentación técnica: a partir de código fuente o especificaciones, el modelo puede redactar manuales, comentarios de API y guías de usuario con un buen nivel de coherencia gracias a su capacidad de razonamiento.
- Educación y tutoría interactiva: para explicar conceptos de matemáticas, física o informática, con la ventaja de que el razonamiento paso a paso se mantiene a lo largo de la conversación.
- Investigación en compresión de modelos: este repo sirve como referencia para estudiar el impacto de la cuantización mixta en MoE híbridos con SSM, permitiendo reproducir experimentos de perplejidad y velocidad en hardware de consumo.
- Despliegue de chatbots privados: al ejecutarse completamente en local, es adecuado para entornos con requisitos estrictos de privacidad (salud, finanzas, legal) donde los datos no pueden salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este GGUF cuantizado. El autor proporciona únicamente una medición de perplejidad y velocidades de inferencia:

| Metrica | Valor |
|---|---|
| Perplejidad (corpus expositivo, contexto 512) | 5,48 ± 0,53 |
| Velocidad prompt processing (M3 Max) | 491,9 tok/s |
| Velocidad decode (M3 Max) | 70,7 tok/s |

Como referencia, el modelo base sin cuantizar obtiene un 73,4 % en SWE-bench (según el blog de aimadetools), pero este dato corresponde al modelo original y no al GGUF. No se dispone de comparaciones directas entre el GGUF y el modelo base en tareas estándar.

## Requisitos de hardware

- VRAM mínima: 13,5 GiB para el archivo GGUF, más overhead de ejecución; se recomienda al menos 16 GB de RAM unificada en Apple Silicon.
- GPUs recomendadas: Apple Silicon con Metal (probado en M3 Max); también puede funcionar en GPUs NVIDIA con CUDA, aunque el autor no lo ha validado explícitamente y el Path 1 (ternario) es la opción preferida para CUDA.
- Opciones de despliegue: llama.cpp con Metal (`llama-cli -m qwen36-p2-iq-mix.gguf -ngl 99 -p "..."`), también compatible con Unsloth's Mac GGUF inference.
- Latencia y throughput: en M3 Max, 491,9 tok/s de prompt processing y 70,7 tok/s de decodificación; en hardware inferior se espera una reducción proporcional.
- No requiere GPU dedicada si se usa un Mac con suficiente RAM unificada; en PC con GPU NVIDIA, una RTX 4080/4090 con 16 GB podría ejecutarlo, pero no está garantizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Velocidad (decode) | Plataforma | Licencia |
|---|---|---|---|---|---|---|
| hermitdave/qwen36-35b-a3b-p2-iq-mix (este) | 35B (3B activos) | 262k | IQ mix (3,26 bpw) | 70,7 tok/s (M3 Max) | Metal (Mac) | other |
| hermitdave/qwen36-35b-a3b-stq1_0 (Path 1) | 35B (3B activos) | 262k | Ternario (11,4 GiB) | No disponible | CUDA | other |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35B (3B activos) | 262k | bf16 | No disponible | GPU/TPU | Qwen license |

El Path 1 es más pequeño (11,4 GiB) pero solo funciona en CUDA; este Path 2 sacrifica algo de tamaño (13,5 GiB) para ser compatible con Metal. El modelo base en bf16 requiere mucho más VRAM (aproximadamente 70 GB), por lo que no es viable en hardware de consumo. La comparación con el build MLX oQ4e mencionado en la model card no es concluyente debido a diferencias de tokenizador y manejo del estado SSM.

## Limitaciones y advertencias

- Cuantización agresiva: el uso de IQ2_XXS en 11 capas de expertos puede degradar la calidad en tareas que requieren precisión numérica alta, como matemáticas avanzadas o generación de código complejo.
- Solo texto: este GGUF no incluye las capacidades multimodales (visión) del modelo base Qwen3.6-35B-A3B; no puede procesar imágenes ni vídeo.
- Perplejidad medida a contexto 512: el valor de 5,48 se obtuvo con una ventana corta; el comportamiento con contextos largos (262k) no está validado.
- Licencia "other": la licencia del modelo base Qwen no es Apache 2.0 puro; es necesario revisar los términos específicos de Qwen para uso comercial y redistribución.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en dominios especializados; se recomienda verificación humana en aplicaciones críticas.
- Sesgos potenciales: no se ha publicado información sobre evaluación de sesgos para este modelo cuantizado; el modelo base puede arrastrar sesgos de sus datos de entrenamiento.
- Soporte limitado: el autor advierte que la comparación de velocidad/calidad con otros formatos es direccional, no absoluta; los resultados pueden variar según la versión de llama.cpp y el hardware.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hermitdave/qwen36-35b-a3b-p2-iq-mix
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Versión NVFP4 de NVIDIA: https://huggingface.co/nvidia/Qwen3.6-35B-A3B-NVFP4
- Guía para desarrolladores de Qwen 3.6 (lushbinary): https://lushbinary.com/blog/qwen-3-6-developer-guide-benchmarks-architecture-api-self-hosting/
- Análisis de Qwen 3.6-35B-A3B (aimadetools): https://www.aimadetools.com/blog/qwen-3-6-35b-a3b-complete-guide/
- Página en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/teams/qwen/models/qwen3.6-35b-a3b
