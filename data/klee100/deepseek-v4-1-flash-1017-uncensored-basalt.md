# klee100/DeepSeek-V4.1-Flash-1017-Uncensored-Basalt

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-Basalt es un conjunto de pesos cuantizados en formato `.basalt` (versión 2) del modelo DeepSeek-V4.1-Flash-1017, un transformer de tipo mezcla de expertos (MoE) desarrollado originalmente por DeepSeek. Esta variante concreta, publicada por el usuario klee100, parte del checkpoint "abliterated" (dirección de rechazo eliminada) de dealignai y lo empaqueta como reemplazo directo de los packs oficiales de Basalt, una engine de inferencia alternativa.

El modelo conserva la arquitectura y los pesos originales de DeepSeek salvo 54 tensores modificados en las capas 10 a 36: la proyección de salida de atención (`attn.wo_b`) y la proyección down del experto compartido (`ffn.shared_experts.w2`). El resto de tensores (expertos enrutados, routers, embeddings, cabeza de salida, tabla Engram, proyector de visión y drafter DSpark) son idénticos byte a byte a los del pack oficial.

La relevancia de esta ficha es doble: por un lado documenta una receta de cuantización cuidadosamente verificada (con comprobaciones de hash y refinamiento MACaQ-R); por otro, advierte de que se trata de un modelo con el alineamiento de seguridad eliminado, destinado exclusivamente a investigación sobre mecanismos de rechazo, interpretabilidad y red-teaming.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con expertos compartidos, hyper-connections, tabla Engram y drafter DSpark |
| Parametros totales | no disponible |
| Parametros activos | no disponible (modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-IQ2_XXS (285 GB) y UD-IQ1_M (260 GB) en formato `.basalt` v2; tensores internos en Q8_0, Q6_K, Q5_K, IQ2_XXS e IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.basalt` versión 2 (contenedor propio de la engine Basalt; internamente tensores GGUF) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de mezcla de expertos (MoE) con expertos compartidos, hyper-connections y una "tabla Engram". El checkpoint incluye además un proyector de visión y un drafter DSpark (decodificación especulativa). La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO; esa información no está disponible en la documentación proporcionada.

La modificación respecto al modelo original es una "abliteración": se elimina la dirección de rechazo editando únicamente dos tipos de tensor en las capas 10 a 36, la proyección de salida de atención y la proyección down del experto compartido. Los pesos provienen del checkpoint FP8 de dealignai (formato e4m3 con escalas e8m0 en bloques de 32x32), dequantizado de forma exacta y recuantizado al tipo que usa el pack oficial para cada tensor. Para las capas 27-36 se aplica una búsqueda ponderada por imatrix de ggml seguida de refinamiento MACaQ-R, que ajusta únicamente los códigos de peso de tensores Q4_K/Q5_K/Q6_K (sin tocar las escalas de bloque) para minimizar el error de salida bajo la Hessiana de entrada, calibrado con 131.072 tokens del perfil "diverse" de MACaQ. El resultado reportado es una reducción del error de salida ponderado por H de entre el 18% y el 33% según el pack y el tensor.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base DeepSeek-V4.1-Flash-1017 (detalles concretos no disponibles en la información proporcionada).
- Procesamiento de visión: el pack incluye el proyector de visión del modelo original, por lo que se conserva la capacidad multimodal del checkpoint de partida.
- Decodificación especulativa: incluye el drafter DSpark, lo que permite acelerar la generación mediante decodificación especulativa.
- Cumplimiento sin rechazo: al haberse eliminado la dirección de rechazo, el modelo responde a peticiones que el original declina.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre mecanismos de rechazo: el modelo permite estudiar qué representaciones internas codifican la negativa a responder, comparando las activaciones de las capas 10-36 frente al modelo original.
- Interpretabilidad de tensores concretos: al conocerse exactamente los 54 tensores modificados, se pueden aislar experimentos sobre el papel de `attn.wo_b` y `ffn.shared_experts.w2` en el comportamiento del modelo.
- Red-teaming y evaluación de robustez: sirve como sujeto de prueba para medir la eficacia de filtros y salvaguardas externas antes de desplegar sistemas de moderación.
- Benchmarking de cuantización: los packs incluyen métricas de KLD y PPL frente a la referencia BF16, lo que permite evaluar el impacto de IQ2_XXS e IQ1_M en la fidelidad de la salida.
- Validación de engines de inferencia: al ser un reemplazo directo de los packs oficiales de Basalt, se usa para probar la engine Basalt 0.3.2 con pesos modificados sin cambiar el runtime.
- Estudio de calibración MACaQ-R: la receta y los datos de calibración documentados permiten reproducir y comparar métodos de refinamiento de cuantización en modelos MoE grandes.
- Pruebas de despliegue a gran escala: con 260-285 GB, los packs sirven para validar infraestructuras de inferencia con offloading de expertos a CPU (`--n-cpu-moe`).

## Benchmarks y rendimiento

La model card incluye una tabla de calidad con PPL y divergencia KL frente a la referencia BF16 (`dsv41-bf16-base.kld`, wikitext-2, 100 fragmentos de 512 tokens, PPL de referencia 2.731), medida con `llama-perplexity --kl-divergence` sobre GGUFs que contienen exactamente los tensores de cada pack. La información proporcionada se interrumpe antes de mostrar los valores numéricos de PPL, KLD mean, KLD median y KLD p99, por lo que no se pueden reproducir aquí.

| Pack | PPL | KLD mean | KLD median | KLD p99 |
|---|---|---|---|---|
| UD-IQ2_XXS | no disponible | no disponible | no disponible | no disponible |
| UD-IQ1_M | no disponible | no disponible | no disponible | no disponible |

Sí se documentan las métricas de error de cuantización del refinamiento MACaQ-R (error de salida ponderado por H, relativo):

| Pack | Tensores refinados | Error antes -> después |
|---|---|---|
| UD-IQ2_XXS | `attn_output_b` Q6_K, capas 27-36 | -25% a -33% |
| UD-IQ2_XXS | `ffn_down_shexp` Q5_K, capas 27-36 | -18% a -26% |
| UD-IQ1_M | `attn_output_b` Q6_K, capas 10-36 | -23% a -33% |
| UD-IQ1_M | `ffn_down_shexp` Q5_K, capas 27-36 | -19% a -28% |

## Requisitos de hardware

- VRAM/almacenamiento: los packs ocupan 285 GB (UD-IQ2_XXS) y 260 GB (UD-IQ1_M), lo que exige almacenamiento NVMe amplio y, en la mayoría de configuraciones, offloading de expertos a CPU.
- GPU recomendadas: no se especifican en la información proporcionada. Por tamaño, un despliegue íntegro en VRAM requeriría múltiples aceleradores de 80 GB (A100/H100) o configuraciones con offloading; no disponible el detalle exacto.
- GPU de consumo: no cabe en ninguna GPU de consumo individual; requiere offloading parcial o total a memoria del sistema.
- Opciones de despliegue: engine Basalt (probado con la versión 0.3.2, sin modificar); la model card menciona el uso de llama.cpp para la calibración y las mediciones de KLD/PPL, pero el formato `.basalt` es específico de Basalt.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (original) | no disponible | no disponible | no disponible | Hugging Face (deepseek-ai) | Modelo de referencia con alineamiento de seguridad intacto |
| dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 | no disponible | no disponible | no disponible | Hugging Face | Checkpoint abliterated en FP8 del que deriva este pack |
| jesdga/DeepSeek-V4.1-Flash-1017-Basalt | no disponible | no disponible | no disponible | Hugging Face | Packs oficiales de Basalt sin modificar, con alineamiento intacto |
| Este modelo (klee100) | no disponible | no disponible | MIT | Hugging Face | Packs Basalt abliterated con cuantización verificada por hash |

## Limitaciones y advertencias

- Alineamiento de seguridad eliminado: el modelo cumple peticiones que el original rechaza. No debe exponerse a usuarios finales sin salvaguardas adicionales.
- Uso previsto exclusivamente de investigación: interpretabilidad, estudio de mecanismos de rechazo y red-teaming; el autor declara la responsabilidad del usuario sobre el uso.
- Riesgo de alucinación: no cuantificado en la información proporcionada; aplica el comportamiento del modelo base.
- Idiomas y contexto: no disponibles; no se puede confirmar el soporte multilingüe ni la ventana de contexto efectiva tras la cuantización.
- Licencia MIT: permite uso comercial según los términos de la licencia, pero las implicaciones éticas y legales del contenido sin filtrar recaen sobre el desplegador.
- Fidelidad de cuantización: los packs son de 1-2 bits por peso en los expertos enrutados (IQ1_M/IQ2_XXS), con degradación esperable frente a BF16; las métricas KLD completas no están disponibles en la información proporcionada.
- Dependencia de la engine Basalt: el formato `.basalt` v2 no es portable a vLLM, TGI u Ollama sin conversión; el soporte está limitado a Basalt 0.3.2 (probado).
- Integridad verificable: la model card documenta hashes SHA-256 y comprobaciones byte a byte, pero conviene reverificar los ficheros descargados antes de usarlos.
- Sesgos: no documentados en la información proporcionada; la eliminación de la dirección de rechazo puede amplificar sesgos presentes en el modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/klee100/DeepSeek-V4.1-Flash-1017-Uncensored-Basalt
- Modelo base (abliterated FP8): https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Modelo original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Packs oficiales de Basalt: https://huggingface.co/jesdga/DeepSeek-V4.1-Flash-1017-Basalt
- GGUF de Unsloth (Dynamic v3.1): https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
- Repositorio de la engine Basalt: https://github.com/jesdga95/basalt
- Repositorio MACaQ (Huawei CSL): https://github.com/huawei-csl/MACaQ
- Referencia KLD BF16: https://huggingface.co/datasets/jesdga/basalt-kld-bases
