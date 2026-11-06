# efeisot/minicpm5-2b-rco

## Resumen

MiniCPM5-2B RCO es una cuantización experimental de precisión mixta, en formato GGUF, del modelo base [openbmb/MiniCPM5-2B](https://huggingface.co/openbmb/MiniCPM5-2B) desarrollado por OpenBMB. El autor de esta versión cuantizada es el usuario de Hugging Face **efeisot**, y el repositorio se presenta como la versión 2 (v2) de una línea de trabajo sobre el formato de cuantización RCO, que sustituye a la versión experimental anterior `minicpm5-2b-rco-attn4-q6walls`. El objetivo del proyecto es explorar formatos de cuantización no estándar que reduzcan el tamaño del modelo manteniendo la calidad de las predicciones, especialmente en texto y código.

El modelo se distribuye en tres variantes (`code16`, `allmlp4` y `downq5`) con tamaños entre 1,43 y 1,76 GB, todas ellas por debajo de los 2 GB, lo que las hace aptas para ejecución en hardware modesto. Un punto crítico es que los tensores RCO usan tipos GGML no estándar (RCO3 y RCO4), de modo que el llama.cpp oficial no puede cargarlos: es necesario aplicar un parche sobre la versión v0.7.0 incluido en el propio repositorio. Se trata, por tanto, de un artefacto de investigación más que de un despliegue de producción listo para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM, 42 capas (cuantizada) |
| Parametros totales | 2.516.756.480 (~2,52 B; 1,982 B en capas lineales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (las evaluaciones usan 512 tokens) |
| Tipos de cuantizacion | RCO3, RCO4, Q5_K, Q6_K, Q8_0, F32 (normas); imatrix 32x512 |
| Idiomas soportados | inglés, chino |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tipos no estándar RCO3/44 y RCO4/45; requiere llama.cpp parcheado v0.7.0) |

## Arquitectura y entrenamiento

El modelo base, MiniCPM5-2B, es un transformer causal de 42 capas con arquitectura tipo Llama. Esta ficha cuantizada no modifica los pesos originales: lo que hace es recomprimirlos mediante el formato RCO, un esquema de cuantización por bloques de 128 pesos con escala `d` y punto cero `z` en BF16, donde el peso reconstruido es `y = d * (q - z)`. La asignación de bits por capa (3 o 4 bits) se obtiene de una búsqueda de códigos 16x512 sobre una base de datos RCO GPTQ/FastOBQ.

Las tres variantes difieren en la receta aplicada al MLP y a la atención: `code16` cuantiza también la atención en RCO3/RCO4 con muros (walls) en Q6_K; `allmlp4` exporta la atención a F16 y la cuantiza a Q6_K con una matriz de importancia (imatrix) 32x512, dejando los 126 tensores del MLP en RCO4; y `downq5` además convierte los 42 tensores `down_proj` a Q5_K usando la misma imatrix. El token embedding es Q6_K y la salida Q8_0 en las variantes `allmlp4` y `downq5`. No se dispone de información sobre el proceso de entrenamiento del modelo base (tokens, datasets, RLHF/DPO) en la documentación del repositorio.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Hereda las capacidades del modelo base MiniCPM5-2B en inglés y chino.
- Los benchmarks del repositorio se centran en modelado de código Python (corpus `code2` de stdlib de Python), lo que sugiere utilidad para tareas de código.
- No hay evidencia en la documentación de soporte de tool calling, agentes, visión o audio.
- No es un modelo de razonamiento extendido (thinking mode) según la información disponible.

## Casos de uso

- Investigación en formatos de cuantización: es el caso de uso principal; permite estudiar el compromiso tamaño/calidad del formato RCO frente a K-quants estándar con datos reproducibles (perplejidad WikiText-2 y KL contra logits F16).
- Inferencia local en hardware modesto: con archivos de 1,43-1,76 GB, cabe en portátiles y mini-PC con GPU integrada; el propio autor verifica el build sobre ROCm con arquitectura `gfx1200`.
- Experimentación con ROCm/HIP en Linux: el repositorio incluye comandos de build verificados para llama.cpp sobre ROCm, útil para usuarios de GPU AMD.
- Chatbots ligeros en inglés y chino: al ser el modelo base conversacional, puede servir de backend de diálogo en aplicaciones con recursos limitados, siempre con el runtime parcheado.
- Autocompletado y análisis de código Python a pequeña escala: las métricas de código (KL y top-1 contra el donor F16) indican un comportamiento razonablemente fiel en ese dominio, especialmente en la variante `downq5`.
- Comparación de calidad de cuantización: las tablas de perplejidad y KL permiten usar el repo como referencia al calibrar otras cuantizaciones con imatrix.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos con el mismo harness: WikiText-2 test (`llama-perplexity -c 512 --chunks 16`) y corpus held-out de código Python (`code2`, 8176 tokens, KL contra logits F16 del donor).

| Variante | Tamaño | WikiText-2 PPL ↓ | code2 mean KL ↓ | code2 p99 ↓ | code2 top-1 ↑ | 128 KB p99 ↓ | 128 KB top-1 ↑ |
|---|---:|---:|---:|---:|---:|---:|---:|
| `code16` | 1,431 GB | 14,9480 | 0,451279 | 3,716013 | 78,824% | 3,486164 | 78,641% |
| `allmlp4` | 1,677 GB | 14,3008 | — | 2,554672 | 83,137% | 2,618498 | 83,090% |
| `downq5` | 1,759 GB | 14,0746 | 0,197163 | 1,952683 | 86,091% | 1,952128 | 85,957% |
| Sharp Q4_K_XL (referencia) | 1,596 GB | 14,1703 | 0,117031 | 1,236705 | 89,314% | 1,167117 | 89,060% |

Velocidad medida con `llama-bench -p 32 -n 8 -r 2` en build ROCm parcheado (`gfx1200`, 8 hilos): **pp32 1211,53 ± 17,77 t/s**, **tg8 115,45 ± 15,96 t/s**.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: entre 1,43 GB (`code16`) y 1,76 GB (`downq5`) solo de pesos; con contexto y overhead de runtime, cabe cómodamente en sistemas con 4-8 GB de memoria de GPU o incluso solo CPU.
- GPU recomendadas: cualquier GPU moderna con soporte ROCm/HIP (el autor verifica sobre `gfx1200`, es decir, GPUs AMD de gama RDNA4); también válidas GPU NVIDIA vía CUDA y ejecución en CPU pura.
- Consumer GPUs: sí, es uno de los puntos fuertes del modelo; cabe en GPUs integradas y dedicadas de gama baja y media (RTX 3060, RX 7600, e incluso iGPU con memoria compartida suficiente).
- Despliegue: exclusivamente llama.cpp con el parche `runtime/llama.cpp-v0.7.0-rco-minicpm5.patch` aplicado sobre la v0.7.0; el llama.cpp estándar rechaza los tipos RCO3/RCO4. No hay soporte para vLLM, TGI, Ollama u otros runtimes.
- Latencia/throughput: en la configuración de referencia (ROCm, `gfx1200`, 8 hilos), 1211,53 t/s de prefill (pp32) y 115,45 t/s de generación (tg8).

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamaño | WikiText-2 PPL | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniCPM5-2B RCO (`downq5`) | 2,52 B | GGUF RCO4+Q5_K (no estándar) | 1,759 GB | 14,0746 | apache-2.0 | llama.cpp parcheado v0.7.0 |
| MiniCPM5-2B Sharp Q4_K_XL | 2,52 B | GGUF Q4_K_XL (estándar) | 1,596 GB | 14,1703 | apache-2.0 (base) | llama.cpp estándar |
| MiniCPM5-2B (base, F16) | 2,52 B | safetensors | ~5 GB | referencia (donor) | apache-2.0 | Hugging Face, cualquier runtime |

Frente a la alternativa estándar Sharp Q4_K_XL, la variante `downq5` es ligeramente mejor en perplejidad WikiText-2 (14,0746 frente a 14,1703) pero claramente peor en código (p99 de 1,953 frente a 1,237). El propio autor advierte que RCO es un formato de investigación y no un sustituto de Sharp si se busca máxima calidad por debajo de 1,8 GB. No se dispone de datos comparativos con otros modelos de 2B de otros fabricantes en la información disponible.

## Limitaciones y advertencias

- Compatibilidad: los archivos no cargan en llama.cpp estándar; requieren el runtime parcheado del repositorio, lo que complica cualquier despliegue en producción y actualizaciones futuras del runtime.
- Formato experimental: RCO es un formato de investigación; el propio autor recomienda el repositorio híbrido K-quant complementario si el objetivo es máxima calidad.
- Calidad en código: todas las variantes RCO quedan por detrás de Sharp Q4_K_XL en las métricas de código held-out.
- Sin datos de calidad general: no hay benchmarks MMLU/GSM8K/HumanEval publicados para esta cuantización, por lo que la calidad en tareas de razonamiento o conocimiento es desconocida.
- Sesgos: hereda los sesgos del modelo base MiniCPM5-2B (entrenado principalmente en inglés y chino); no se documentan auditorías de sesgo.
- Alucinaciones: al ser un modelo generativo de 2B cuantizado agresivamente, el riesgo de alucinación es significativo; no conviene usarlo como fuente factual sin verificación.
- Contexto: las evaluaciones se hacen con 512 tokens; la longitud de contexto real soportada por el modelo base no está documentada en este repositorio.
- Licencia: apache-2.0, sin restricciones conocidas para uso comercial, aunque la dependencia de un runtime parcheado añade riesgo de mantenimiento.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/efeisot/minicpm5-2b-rco
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Documentación de cuantización: https://huggingface.co/efeisot/minicpm5-2b-rco/blob/main/docs/QUANTIZATION.md
- Documentación de uso: https://huggingface.co/efeisot/minicpm5-2b-rco/blob/main/docs/USAGE.md
- Instrucciones del runtime parcheado: https://huggingface.co/efeisot/minicpm5-2b-rco/blob/main/runtime/README.md
