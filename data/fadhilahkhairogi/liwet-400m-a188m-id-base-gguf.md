# fadhilahkhairogi/Liwet-400M-A188M-id-base-GGUF

## Resumen

Liwet-400M-A188M-id-base-GGUF es la conversión al formato GGUF del modelo base Liwet-400M-A188M-id-base, un modelo de lenguaje en indonesio con arquitectura Mixture of Experts (MoE) desarrollado por el grupo Kelompok 11 de la asignatura Generative AI de la Universidad Telkom. El modelo totaliza 400,1 millones de parámetros, de los cuales 187,8 millones están activos por token, y fue entrenado únicamente en la etapa de preentrenamiento (pretrain base), sin ajuste fino posterior con instrucciones ni preferencias.

La versión GGUF está pensada para inferencia en CPU o servidores sin PyTorch mediante llama.cpp, y se distribuye en tres cuantizaciones (BF16, F16 y Q8_0). El autor advierte explícitamente que la conversión es una aproximación numérica y no una réplica bit a bit del modelo original: el router MoE puede desviarse en situaciones de empate cercano entre expertos, especialmente en bf16.

Su relevancia es limitada y de carácter experimental: se trata de un modelo pequeño, de contexto corto (2048 tokens), especializado en un único idioma y en fase base, por lo que su utilidad práctica se circunscribe a experimentación con arquitecturas MoE de bajo coste y a tareas de continuación de texto en indonesio. No cuenta con descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `moe_400m` (Mixture of Experts, transformer) |
| Parametros totales | 400.098.560 (400,1M) |
| Parametros activos | 187,8M |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | BF16, F16, Q8_0 |
| Idiomas soportados | Indonesio (`id`) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura `moe_400m` con enrutamiento por expertos: 400,1M de parámetros totales con 187,8M activos por token. El autor no detalla en la model card el número de expertos, la dimensión oculta, el número de capas ni la estrategia de enrutamiento (top-k, capacidad limitada, etc.). El checkpoint corresponde a la etapa de preentrenamiento (pretrain base), por lo que no ha pasado por ajuste supervisado, RLHF ni DPO según la información disponible. Tampoco se especifican el volumen de tokens de entrenamiento ni la composición del dataset.

La conversión a GGUF se realizó con un fork de `ggml-org/llama.cpp` (commit `cae551692`, rama `liwet-moe`, build 11315), usando `convert_hf_to_gguf.py --outtype bf16|f16` y posteriormente `llama-quantize` para Q8_0. El detalle técnico más relevante es que el modelo original usa *capacity-limited MoE dispatch* mientras que llama.cpp emplea *dispatch* completo, lo que provoca divergencias medibles en prompts largos (el prompt `long_2048` baja a cosine 0,8918 en BF16). El router en bf16 puede invertir la elección de experto en empates cercanos, y la paridad estricta no se alcanza: en la comparación contra referencia fp32, el top-1 de BF16 es 85,71% y el de F16 80,00%, por debajo del umbral del 95% que el propio autor se había fijado.

## Capacidades

- Generación de texto por continuación directa (*raw text completion*) en indonesio, sin plantilla de chat.
- Enrutamiento MoE con 187,8M parámetros activos por token, lo que reduce el coste de cómputo frente a un modelo denso de 400M.
- Tokenizer propio con identificadores especiales `<pad>`=0, `<bos>`=1 y `<eos>`=2; el GGUF se escribe con `add_bos_token = false` y sin `chat_template`, por lo que el prompt debe construirse manualmente.
- No dispone de soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*.
- Capacidad multilingüe no disponible: el modelo está etiquetado únicamente para indonesio.
- Al ser un modelo base, no sigue instrucciones de forma fiable; su uso previsto es la continuación de texto y el ajuste fino posterior.

## Casos de uso

- Experimentación con arquitecturas MoE de bajo coste: el modelo permite estudiar el comportamiento del enrutamiento por expertos en un tamaño manejable (400M totales, 188M activos) sobre CPU o GPU de gama baja, comparando la implementación PyTorch de referencia con la de llama.cpp.
- Continuación de texto en indonesio: dado un prefijo en indonesio, el modelo genera continuación coherente a nivel de lenguaje, útil para prototipos de autocompletado o generación de texto en ese idioma.
- Punto de partida para ajuste fino: al ser un checkpoint base, puede servir como inicialización para fine-tuning supervisado en tareas downstream en indonesio, con un coste de cómputo reducido gracias a los 187,8M parámetros activos.
- Validación de pipelines de cuantización GGUF: los archivos incluyen SHA-256 y métricas de paridad (cosine, top-1, TVD, acuerdo de router), lo que lo convierte en un banco de pruebas para verificar herramientas de conversión y cuantización en modelos MoE pequeños.
- Despliegue en entornos sin PyTorch: mediante `llama-server` con API compatible con OpenAI o `llama-cpp-python`, se puede servir el modelo en CPU con 8 hilos a unas 94,3 tok/s de decodificación en Q8_0, adecuado para demos locales.
- Investigación sobre divergencia numérica en MoE: las tablas de paridad BF16/F16/Q8_0 frente a referencias bf16 y fp32 permiten estudiar cómo la precisión afecta a la selección de expertos y a la estabilidad de la generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor únicamente reporta métricas de paridad numérica y de rendimiento de inferencia.

Paridad frente a referencia bf16 CUDA (35 prompts prefill):

| Cuantización | Cosine mín. / media | Top-1 | Divergencia greedy mediana (norep / defrep) | Router (P3) | TVD máx. (P4) |
|---|---|---|---|---|---|
| BF16 | 0,891799 / 0,993108 | 65,71% | 0,5 / 0 | 71,97% | 0,292 |
| F16 | 0,887414 / 0,993048 | 60,00% | 0 / 0 | 70,83% | 0,330 |
| Q8_0 | 0,931846 / 0,994259 | 60,00% | 0 / 0 | 70,93% | 0,334 |

Paridad frente a referencia fp32 CPU (35 prompts):

| Cuantización | Cosine mediana | Cosine media | Cosine mín. | Top-1 | Router (P3) |
|---|---|---|---|---|---|
| BF16 | 0,99961 | 0,99859 | 0,97917 | 85,71% | 89,87% |
| F16 | 0,99986 | 0,99871 | 0,97980 | 80,00% | 90,44% |
| Q8_0 | 0,99925 | 0,99781 | 0,96021 | 68,57% | 85,04% |

Rendimiento de inferencia con `llama-bench` (GPU: `-ngl 99 -p 512 -n 128 -r 5`; CPU: `-ngl 0 -t 8 -p 0 -n 32`):

| Cuantización | Prefill 512 GPU (tok/s) | Decode 128 GPU (tok/s) | Decode 32 CPU (tok/s) |
|---|---|---|---|
| BF16 | 4.174 ± 579 | 17,30 ± 1,21 | 14,0 ± 1,2 |
| F16 | 3.990 ± 217 | 15,42 ± 0,56 | no disponible |
| Q8_0 | 5.949 ± 394 | 18,66 ± 1,33 | 94,3 ± 10,5 |

Los datos de GPU son un límite inferior medido con Intel DTT activo (clocks de SM observados en torno a 0,8 GHz frente a un límite de 3,1 GHz).

## Requisitos de hardware

- VRAM estimada: BF16 y F16 ocupan 764,8 MiB por archivo; Q8_0 ocupa 491,8 MiB. Con overhead de contexto (2048 tokens) y buffers de llama.cpp, el consumo real es de aproximadamente 1-1,5 GB en BF16/F16 y de 0,7-1 GB en Q8_0.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM efectiva; el autor no especifica modelos concretos (A100, H100, RTX 4090, etc.). Por tamaño, cabe holgadamente en GTX 1650, RTX 3060, RTX 4060 y superiores.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 2 GB o más de VRAM, e incluso en iGPU con memoria compartida.
- Despliegue: llama.cpp (fork `liwet-moe`, commit `cae551692`), `llama-cli`, `llama-server` (API compatible con OpenAI) y `llama-cpp-python`. Ollama estándar no es compatible porque usa el kernel MoE upstream y estos pesos requieren el dispatch del fork. La vía PyTorch (modelo base en safetensors) sigue siendo la referencia de salida.
- Latencia y throughput: en GPU, 4.174-5.949 tok/s de prefill y 15,4-18,7 tok/s de decodificación (limitado por DTT); en CPU con 8 hilos, 14,0 tok/s en BF16 y 94,3 tok/s en Q8_0.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad que permitan una comparación rigurosa con alternativas. A continuación se comparan únicamente características estructurales con modelos pequeños de la misma categoría, usando solo los datos disponibles:

| Modelo | Parámetros | Activos | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| Liwet-400M-A188M-id-base-GGUF | 400,1M | 187,8M | 2048 | Indonesio | no disponible |
| Alternativas comparables de ~400M-1B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada modelos comparables concretos con datos verificables de parámetros, contexto y licencia, por lo que la comparativa cuantitativa se marca como no disponible.

## Limitaciones y advertencias

- Modelo en etapa base: no está ajustado para seguir instrucciones, por lo que puede ignorar el formato de prompt y producir continuaciones no alineadas.
- Paridad numérica no garantizada: el autor califica la conversión GGUF como "experimental, no etiquetada como aprobada". El router MoE puede invertir la elección de experto en empates cercanos; el top-1 frente a fp32 es 85,71% (BF16) y 80,00% (F16), por debajo del umbral del 95%.
- Divergencia en contextos largos: el prompt de 2048 tokens baja a cosine 0,8918 en BF16 debido a la diferencia entre dispatch con capacidad limitada (PyTorch) y dispatch completo (llama.cpp).
- Contexto muy corto: 2048 tokens limita el uso en conversaciones multi-turno, documentos largos o agentes.
- Un solo idioma: solo indonesio; el rendimiento en castellano u otros idiomas no está documentado y previsiblemente será deficiente.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse con los autores antes de cualquier despliegue en producción.
- Sin `chat_template` y con `add_bos_token = false`: el prompt debe construirse manualmente y añadir el BOS explícitamente si se desea.
- Incompatibilidad con Ollama estándar: requiere el fork `liwet-moe` de llama.cpp o la vía PyTorch.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser un modelo base pequeño y entrenado solo en indonesio, se espera una fiabilidad baja en hechos y una reproducción de sesgos del corpus sin mitigar.
- Madurez: cero descargas y cero interacciones en el momento de la consulta; proyecto académico sin validación externa.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/fadhilahkhairogi/Liwet-400M-A188M-id-base-GGUF
- Modelo base en Hugging Face: https://huggingface.co/fadhilahkhairogi/Liwet-400M-A188M-id-base
- Fork de llama.cpp utilizado (rama `liwet-moe`, commit `cae551692`): https://github.com/ggml-org/llama.cpp
- Metodología de paridad (referenciada en la model card como `docs/bench/RESULTS.md`): no disponible como enlace público en la información proporcionada.
