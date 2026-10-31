# Genrius-AI/Qwen3-1.7B-Pingala8-2bit

## Resumen

Qwen3-1.7B-Pingala8-2bit es una cuantización extrema a 2 bits del modelo Qwen3-1.7B de Qwen, realizada por Genrius AI (autor: Harshit Goyal) mediante su método propio "Pingala-8". El objetivo del proyecto es demostrar que un LLM pequeño puede comprimirse hasta unos 0,69 GB sin recurrir a las cuantizaciones 2-bit estándar de llama.cpp, manteniendo una calidad de generación claramente superior a la de IQ2_XXS a igual tamaño de fichero. El método combina un código de trellis de 8 estados con partición de conjuntos de Ungerboeck, rotación de Hadamard aleatoria y redondeo LDLQ de QuIP.

El modelo base es un transformer decodificador denso de 28 capas con grouped-query attention y FFN SwiGLU, orientado a generación de texto conversacional en inglés y chino. La relevancia de esta ficha no está tanto en el modelo base (ampliamente conocido) como en el experimento de compresión: es un caso de estudio para despliegues on-device y escenarios de VRAM mínima en GPUs NVIDIA RTX de las series 30, 40 y 50.

Es importante subrayar que se trata de un artefacto experimental: requiere un runtime de llama.cpp parcheado (no funciona con llama.cpp estándar, Ollama ni LM Studio) y los benchmarks publicados son mediciones del propio autor, no verificadas por terceros. El propio autor reconoce honestamente que, en este modelo concreto, la cuantización IQ2_KT de ik_llama.cpp obtiene mejor perplejidad con un fichero solo un 3,3 % mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador denso, 28 capas, GQA, FFN SwiGLU |
| Parametros totales | 991.565.441 (según safetensors del repo; el modelo base se comercializa como 1,7B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la evaluación de WikiText-2 se hizo con contexto 4096) |
| Tipos de cuantizacion | Pingala-8 2-bit (propia); comparado con IQ2_XXS, IQ2_KT y Q8_0 |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (0,69 GB) |

## Arquitectura y entrenamiento

El modelo base, Qwen3-1.7B, es un transformer autorregresivo denso de 28 capas decodificadoras con grouped-query attention (GQA) y redes feed-forward SwiGLU. Sobre él, Genrius AI aplica el método Pingala-8: cada tensor lineal del modelo (196 tensores en total: proyecciones attn_q, attn_k, attn_v y attn_output, más ffn_gate, ffn_up y ffn_down de cada capa) se codifica con el código de trellis de 8 estados con partición de conjuntos de Ungerboeck sobre símbolos de 4 pesos. Antes de la codificación se aplica una rotación de Hadamard aleatoria y el redondeo LDLQ de QuIP, con una clase de tasa por tensor y escalados de columna basados en cotas de incoherencia (la receta "B4", reutilizada sin cambios de la release de Qwen3-4B).

Los Hessianos de capa usados para la cuantización se calculan a partir de 256 secuencias de 2048 tokens de texto de C4. Los tensores restantes (embedding de tokens y salida empatada) no se describen completamente en la información disponible. El modelo base fue entrenado por Qwen; los detalles de su preentrenamiento y alineación (RLHF/DPO) no se detallan en la model card de esta cuantización. El método está documentado en el preprint "Small-State Coset Trellis Coding at IQ2_XXS Size: An Equal-Bytes Study in llama.cpp" (v2.4, DOI en Zenodo).

## Capacidades

- Generación de texto conversacional en inglés y chino (pipeline text-generation, heredada del modelo base Qwen3-1.7B).
- Compresión extrema a 2 bits: fichero GGUF de 0,69 GB, adecuado para entornos con VRAM muy limitada.
- Perplejidad en WikiText-2 de 28,23, frente a 47,96 de IQ2_XXS de llama.cpp al mismo tamaño de fichero.
- Ejecución local acelerada por CUDA en GPUs NVIDIA RTX 30/40/50 mediante el runtime parcheado.
- Demo interactiva en navegador disponible en HuggingFace Spaces.
- No hay información sobre soporte de tool calling, agentes, capacidades visuales o de audio en la documentación de esta cuantización.

## Casos de uso

- Experimentación en compresión de LLMs: es un artefacto de investigación ideal para estudiar códigos de trellis aplicados a cuantización de pesos y compararlos con los formatos k-quants de llama.cpp.
- Despliegue on-device con VRAM mínima: con un fichero de 0,69 GB, el modelo cabe en GPUs de gama baja o en la VRAM residual de una estación de trabajo ocupada por otras cargas.
- Prototipado de inferencia local en NVIDIA RTX 30/40/50: el runtime parcheado con CUDA está pensado precisamente para ese hardware de consumo.
- Chatbots ligeros en inglés y chino: para asistentes simples donde la calidad de un modelo de ~1B cuantizado a 2 bits sea suficiente y el footprint sea la prioridad.
- Evaluación comparativa de cuantizaciones: útil como punto de referencia frente a IQ2_XXS (llama.cpp), IQ2_KT (ik_llama.cpp) y Q8_0 en el mismo modelo base.
- Servidores de inferencia embebidos o de borde: el tamaño reducido facilita distribuir el modelo junto a la aplicación en entornos con almacenamiento y memoria restringidos, siempre que se pueda integrar el runtime parcheado.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados por terceros), medidos con llama-perplexity:

| Benchmark | Resultado |
|---|---|
| WikiText-2 (test, contexto 4096), perplejidad (menor es mejor) | 28,2299 |
| HellaSwag (0-shot), accuracy | 46,1 % |
| WinoGrande (0-shot), accuracy | 57,85 % |
| ARC-Easy (0-shot), accuracy | 45,09 % |
| ARC-Challenge (0-shot), accuracy | 30,1 % |
| MMLU (0-shot), accuracy | 30,48 % |

Comparativa de cuantizaciones del mismo modelo base (datos del autor):

| Fichero | Cuantizacion | Tamaño | WikiText-2 PPL |
|---|---|---|---|
| Qwen3-1.7B-Pingala8-2bit.gguf | Pingala-8, 2-bit | 0,69 GB | 28,23 |
| IQ2_XXS (llama.cpp, misma imatrix) | 2-bit | 0,69 GB | 47,96 |
| IQ2_KT (ik_llama.cpp, receta por defecto) | 2-bit | 0,71 GB | 20,89 |
| Q8_0 (llama.cpp) | 8-bit | 2,2 GB | 15,65 |

Advertencia del propio autor: en este modelo, IQ2_KT de ik_llama.cpp supera a Pingala-8 en perplejidad (20,89 frente a 28,23) con un fichero solo un 3,3 % mayor; Pingala-8 solo es preferible frente al IQ2_XXS nativo de llama.cpp.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero pesa 0,69 GB, por lo que cabe con holgura en GPUs con 2-4 GB de VRAM libres (estimación basada en el tamaño del fichero; no se publica una cifra oficial de VRAM en ejecución).
- GPU recomendadas: NVIDIA RTX serie 30, 40 o 50 (el runtime parcheado está orientado a CUDA en estas tarjetas).
- Cabe en GPUs de consumo: sí, por tamaño de fichero es viable incluso en GPUs de gama baja con CUDA; no hay soporte documentado para CPU o Metal.
- Despliegue: requiere el runtime de llama.cpp parcheado del proyecto (release one-click v2.5 o llama.cpp commit `7ac59a6` más los parches del repositorio). No funciona con llama.cpp estándar, Ollama ni LM Studio. Hasta la versión v2.6 (sin lanzador aún), hay que arrancar manualmente el `llama-server` del build one-click con el fichero GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamaño fichero | WikiText-2 PPL | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-1.7B-Pingala8-2bit | ~1B (991,6M) | Pingala-8, 2-bit | 0,69 GB | 28,23 | Apache 2.0 | GGUF, runtime parcheado propio |
| Qwen3-1.7B IQ2_XXS (llama.cpp) | ~1B | 2-bit | 0,69 GB | 47,96 | Apache 2.0 | GGUF, llama.cpp estándar |
| Qwen3-1.7B IQ2_KT (ik_llama.cpp) | ~1B | 2-bit | 0,71 GB | 20,89 | Apache 2.0 | GGUF, ik_llama.cpp |
| Qwen3-1.7B Q8_0 (llama.cpp) | ~1B | 8-bit | 2,2 GB | 15,65 | Apache 2.0 | GGUF, llama.cpp estándar |

En resumen: a igualdad de bytes, Pingala-8 supera claramente a IQ2_XXS, pero queda por detrás de IQ2_KT de ik_llama.cpp en este modelo concreto, y ambos 2-bit están lejos de la calidad de Q8_0.

## Limitaciones y advertencias

- Compatibilidad: no carga en llama.cpp estándar, Ollama ni LM Studio; exige un runtime parcheado específico, lo que complica su integración en producción.
- Resultados no verificados: todos los benchmarks son mediciones del propio autor (marcados como `verified: false` en el model-index); no hay evaluación independiente de terceros.
- Degradación por cuantización extrema: la perplejidad de 28,23 (frente a 15,65 de Q8_0) y el accuracy de 30,48 % en MMLU indican una pérdida de capacidad notable, especialmente en conocimiento y razonamiento; el riesgo de alucinación y de generación incoherente es superior al del modelo base sin cuantizar.
- Rendimiento relativo: el propio autor reconoce que IQ2_KT de ik_llama.cpp es mejor opción en este modelo con un coste de tamaño marginalmente mayor.
- Hardware restringido: solo hay soporte documentado para CUDA en NVIDIA RTX 30/40/50; no hay ruta documentada para CPU, macOS o AMD.
- Idiomas: limitado a inglés y chino; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- Contexto: la longitud de contexto del fichero cuantizado no está documentada; la evaluación se realizó con contexto 4096.
- Herramientas y agentes: no hay información sobre tool calling ni capacidades agénticas en esta cuantización.
- Licencia: Apache 2.0, sin restricciones para uso comercial, aunque conviene revisar también los términos del modelo base Qwen3-1.7B.
- El build one-click v2.5 aún no incluye lanzador para este modelo; hay que arrancar `llama-server` manualmente hasta la v2.6.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Genrius-AI/Qwen3-1.7B-Pingala8-2bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio de código y parches del runtime: https://github.com/Genrius-AI/pingala8-llm
- Release one-click v2.5 del runtime: https://github.com/Genrius-AI/pingala8-llm/releases/tag/v2.5
- Demo en navegador (HuggingFace Spaces): https://huggingface.co/spaces/harshit-genrius/pingala8-demo
- Paper del método (preprint v2.4, DOI): https://doi.org/10.5281/zenodo.23481757
