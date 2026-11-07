# kurcontko/Index-Translate-2B-NVFP4

## Resumen

Index-Translate-2B-NVFP4 es una cuantización NVFP4 (4 bits en pesos y activaciones) del modelo de traducción IndexTeam/Index-Translate-2B, publicada por el usuario kurcontko. El objetivo es servir traducción por lotes de alto volumen en vLLM sobre GPU Blackwell, donde el formato NVFP4 permite mantener más secuencias concurrentes en memoria que las versiones BF16 o FP8 oficiales. El modelo base pertenece a la familia Index-Translate, derivada de la arquitectura Qwen3.5 (etiqueta `qwen3_5` en los metadatos) y especializada en traducción automática.

El modelo tiene 2.274.069.824 parámetros totales y un repositorio de 2,6 GB. La cuantización reduce el peso en vLLM a 1,8 GiB en servicio solo de texto, frente a 2,3 GiB de la FP4 oficial y 3,6 GiB de BF16. La clave técnica es que las capas Gated DeltaNet (GDN) del modelo mantienen un estado de tamaño fijo por secuencia, de modo que el número de secuencias simultáneas depende de la memoria libre tras cargar los pesos; al ocupar menos, esta build escala mejor en concurrencia.

La relevancia práctica está en el rendimiento medido: con 512 secuencias concurrentes alcanza 268 celdas cortas por segundo, frente a unas 205 de la FP8 oficial bajo el mismo presupuesto de 11,5 GB. La calidad se mantiene muy cerca del original, con 82,21 COMET-22 en WMT24++ para pares de la UE, frente a 82,82 de BF16 y 82,24 de la FP4 oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas Gated DeltaNet (GDN) y atención completa; base Qwen3.5 |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (el ejemplo de uso configura `--max-model-len 4096`) |
| Tipos de cuantizacion | NVFP4 W4A4 (FP4 en pesos y activaciones, grupos de 16 con escalas FP8); GPTQ para redondeo de pesos |
| Idiomas soportados | EN→CS/DE/ES/FR/IT/NL/PL/PT y PL→EN evaluados; cobertura adicional no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), servido con vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido que combina capas de atención completa con capas Gated DeltaNet, un mecanismo de estado recurrente de tamaño fijo por secuencia. Esta característica condiciona el despliegue: cada secuencia en curso consume un bloque de estado GDN, y el número máximo de secuencias simultáneas en vLLM queda limitado por la memoria disponible tras cargar los pesos. El modelo incluye además una torre de visión y una cabeza MTP (multi-token prediction) copiadas sin cambios del modelo base, aunque esta build está pensada para servicio solo de texto.

La cuantización aplica NVFP4 a todas las capas lineales del modelo de lenguaje: MLP, atención completa y las proyecciones GDN `in_proj_qkv`, `in_proj_z` y `out_proj`. vLLM fusiona `in_proj_qkv` e `in_proj_z` en un único GEMM con una sola escala global, por lo que ambas comparten escala NVFP4 global. Permanecen en BF16 el `lm_head`, los embeddings, las proyecciones de puerta GDN `in_proj_a/b` (de ancho 32), la torre de visión y la cabeza MTP. La calibración usó 576 pares OPUS-100 en EN→CS/DE/ES/FR/IT/NL/PL/PT y PL→EN, cada uno renderizado con el prompt de Index-Translate seguido de la traducción de referencia, con GPTQ para elegir el redondeo de pesos. La receta y los scripts están en `quantization/` y apuntan a llm-compressor 0.15.

## Capacidades

- Traducción automática entre inglés y checo, alemán, español, francés, italiano, neerlandés, polaco y portugués, en ambos sentidos para PL→EN.
- Traducción por lotes de alto volumen con muchas secuencias concurrentes en vLLM.
- Preservación de estructura en celdas tipo Excel: mantiene el 97,0% de placeholders, etiquetas, URLs, correos, SKUs, código en línea y saltos de línea.
- Modo thinking desactivable mediante `enable_thinking: false` en el template de chat (recomendado siempre para traducción).
- Servicio solo de texto mediante `--language-model-only`; la torre de visión existe en los pesos pero no se usa en este modo.
- Integración con la API compatible con OpenAI de vLLM.
- No se documentan en la información disponible capacidades de tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Traducción masiva de catálogos y fichas de producto: el modelo procesa lotes de miles de celdas cortas con 512 secuencias concurrentes y 268 celdas/s, adecuado para pipelines nocturnos de localización de e-commerce entre inglés y los ocho idiomas europeos cubiertos.
- Localización de hojas de cálculo y documentación estructurada: su 97,0% de retención de placeholders, etiquetas HTML y saltos de línea lo hace apto para traducir celdas con variables `{name}`, `%s` o `${var}` sin romper plantillas.
- Traducción de correos transaccionales y notificaciones: con prompts de una sola frase y decodificación greedy, encaja en servicios que generan miles de mensajes por hora con bajo coste de memoria (1,8 GiB de pesos).
- Servicio de traducción en GPU de 12 GB: al ocupar menos memoria que FP8 o BF16, permite mantener más secuencias en tarjetas consumer Blackwell, útil para equipos con presupuesto de hardware limitado.
- Pre-traducción asistida por humanos en herramientas CAT: la salida se puede usar como borrador para postedición, con calidad COMET-22 de 82,21 en pares de la UE.
- Traducción de contenidos editoriales y literarios: el conjunto de evaluación WMT24++ incluye texto literario y de discurso, y el modelo mantiene chrF de 58,0, cercano al 58,7 de BF16.
- Backend de traducción para aplicaciones multilingües: la API compatible con OpenAI de vLLM permite integrarlo como servicio interno sin cambiar el cliente.

## Benchmarks y rendimiento

Calidad en WMT24++ (COMET-22 ×100, decodificación greedy, vLLM 0.26.0, presupuesto de 11,5 GB en RTX 5070 Ti):

| Modelo | EN→CS | EN→DE | EN→ES | EN→FR | EN→IT | EN→NL | EN→PL | EN→PT | PL→EN | Media | chrF |
|---|---|---|---|---|---|---|---|---|---|---|---|
| BF16 referencia | 83,01 | 82,15 | 83,61 | 81,63 | 84,07 | 83,84 | 83,26 | 82,66 | 81,14 | 82,82 | 58,7 |
| Index-Translate-2B-FP8 | 82,94 | 82,15 | 83,66 | 81,57 | 83,99 | 83,83 | 83,23 | 82,61 | 81,15 | 82,79 | 58,6 |
| Index-Translate-2B-FP4 | 81,47 | 81,73 | 83,28 | 81,07 | 83,88 | 83,13 | 82,35 | 82,47 | 80,80 | 82,24 | 57,9 |
| **Esta build (NVFP4 GPTQ)** | 81,39 | 81,69 | 83,52 | 81,02 | 83,91 | 83,15 | 82,15 | 82,40 | 80,71 | **82,21** | 58,0 |

Rendimiento en 4.000 celdas cortas (EN→X, 1 a 40 palabras, lote único, presupuesto de 11,5 GB), en celdas por segundo:

| Build | 128 secuencias | 256 secuencias | 512 secuencias |
|---|---|---|---|
| BF16 | 142 | no ejecutado | no ejecutado |
| Index-Translate-2B-FP8 | 148 | 205 | 202 |
| Index-Translate-2B-FP4 | 134 | no ejecutado | no ejecutado |
| **Esta build** | 144 | 243 | **268** |

Prueba de estructura: 175 celdas tipo Excel por idioma (PL, DE, FR, ES, CS) con 270 tokens protegidos. BF16, FP8 oficial y esta build retienen el 97,0% de tokens protegidos y el 95,4% de celdas intactas; la FP4 oficial retiene el 97,8%. Los únicos fallos son etiquetas de estado tipo `[PENDING]`, que el modelo traduce.

## Requisitos de hardware

- GPU Blackwell obligatoria para NVFP4 (la información indica que necesita Blackwell para el formato FP4).
- Pesos en vLLM: 1,8 GiB en servicio solo de texto, frente a 2,3 GiB de la FP4 oficial y 3,6 GiB de BF16.
- Cabe en GPU consumer Blackwell de 12 GB (RTX 5070 Ti con `gpu_memory_utilization` ≈ 0,74, presupuesto de 11,5 GB); también en 16 GB.
- Despliegue con vLLM 0.26.0, comando: `vllm serve kurcontko/Index-Translate-2B-NVFP4 --language-model-only --max-model-len 4096 --gpu-memory-utilization 0.9 --max-num-seqs 512`.
- Throughput medido: 268 celdas/s con 512 secuencias, 243 con 256 y 144 con 128 en el presupuesto de 11,5 GB.
- Si vLLM indica que `max_num_seqs` excede los bloques de caché Mamba disponibles, hay que bajar `--max-num-seqs`.
- Si falla el arranque al compilar JIT los kernels de sampling de FlashInfer con un error de incompatibilidad de cabeceras CUDA, definir `VLLM_USE_FLASHINFER_SAMPLER=0`.
- No se documentan opciones de despliegue con llama.cpp, Ollama o TGI para este formato.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | COMET-22 (WMT24++ UE) | Throughput | Licencia | Formato |
|---|---|---|---|---|---|---|
| Esta build (NVFP4) | 2,27B | no disponible | 82,21 | 268 celdas/s a 512 seq | apache-2.0 | safetensors NVFP4 |
| Index-Translate-2B-FP8 | 2,27B (base) | no disponible | 82,79 | 205 celdas/s a 256 seq | no disponible | FP8 |
| Index-Translate-2B-FP4 | 2,27B (base) | no disponible | 82,24 | 134 celdas/s a 128 seq | no disponible | FP4 |
| Hy-MT2-7B-NVFP4 | 7B | no disponible | 84,66 | 213 celdas/s | no disponible | NVFP4 |

Hy-MT2-7B-NVFP4 obtiene mejor calidad (84,66) pero ocupa más memoria al tener 7B parámetros; según el autor, es la mejor opción para los idiomas que cubre, mientras que Index-Translate-2B cubre más idiomas y cabe en menos memoria.

## Limitaciones y advertencias

- Requiere GPU Blackwell para NVFP4; no funciona en arquitecturas anteriores en este formato.
- Calidad inferior a BF16 y FP8: pierde 0,61 puntos COMET-22 frente a BF16 y 0,58 frente a FP8 en la media de WMT24++. El checo es el idioma más afectado, con 1,6 puntos de caída en ambas builds de 4 bits.
- La cobertura de idiomas evaluada se limita a EN↔CS/DE/ES/FR/IT/NL/PL/PT y PL→EN; el rendimiento en otros idiomas no está documentado.
- No traduce correctamente etiquetas de estado tipo `[PENDING]`, que interpreta como texto a traducir.
- Es obligatorio pasar `enable_thinking: false`; el template de chat proviene de bilibili/Index-Translate y su uso incorrecto degrada la salida.
- El límite de secuencias concurrentes depende de los bloques de caché Mamba disponibles; configurar `max_num_seqs` por encima puede impedir el arranque.
- La licencia del modelo base figura como "other" en su repositorio de origen, mientras que esta build declara apache-2.0; conviene verificar las condiciones del modelo base antes de uso comercial.
- No se documentan sesgos específicos ni tasas de alucinación en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kurcontko/Index-Translate-2B-NVFP4
- Modelo base: https://huggingface.co/IndexTeam/Index-Translate-2B
- Versión FP8 oficial: https://huggingface.co/IndexTeam/Index-Translate-2B-FP8
- Versión FP4 oficial: https://huggingface.co/IndexTeam/Index-Translate-2B-FP4
- Modelo comparable Hy-MT2-7B-NVFP4: https://huggingface.co/kurcontko/Hy-MT2-7B-NVFP4
- Repositorio de inferencia y template de prompt: https://github.com/bilibili/Index-Translate/blob/main/inference/llm/translate.py
- Conjunto de evaluación WMT24++: https://huggingface.co/datasets/google/wmt24pp
- Métrica COMET-22: https://huggingface.co/Unbabel/wmt22-comet-da
