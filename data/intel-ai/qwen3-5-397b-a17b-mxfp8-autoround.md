# intel-ai/Qwen3.5-397B-A17B-MXFP8-AutoRound

## Resumen

Qwen3.5-397B-A17B-MXFP8-AutoRound es una versión cuantizada en MXFP8 del modelo multimodal Qwen/Qwen3.5-397B-A17B, publicada por el equipo de Intel AI (intel-ai) mediante la herramienta AutoRound. Se trata de un checkpoint de 403.397.578.944 parámetros totales (400.753.164 B en módulos cuantizados) que conserva la arquitectura MoE del modelo original y añade capacidades de entrada imagen-texto, empaquetado en formato compressed-tensors para su uso directo con vLLM.

El interés principal de esta ficha es que ofrece una ruta de despliegue en precisión reducida (W8A8, group size 32, valores E4M3 y escalas E8M0) manteniendo casi intacta la precisión del modelo BF16 original: la recuperación media reportada es del 99,97 % sobre cuatro benchmarks (GSM8K, MMLU, PIQA y HellaSwag). Para equipos que necesitan servir un modelo de casi 400.000 millones de parámetros en hardware con memoria limitada, esto supone una reducción teórica de aproximadamente 4 veces el peso de los pesos frente a BF16 en los módulos cuantizados.

La ficha se centra en el checkpoint cuantizado; los detalles de arquitectura, entrenamiento y capacidades del modelo subyacente se infieren de la información disponible en la model card y de los tags del repositorio. Los datos no publicados en esa información se marcan explícitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text), con atención lineal y expertos MTP; clase `qwen3_5_moe` en transformers |
| Parametros totales | 403.397.578.944 (403,4 B); 400.753.164 B en módulos cuantizados |
| Parametros activos | no disponible (el nombre del modelo sugiere ~17 B activos, pero no se confirma en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP8 W8A8, group size 32, valores E4M3, escalas U8 E8M0, activaciones dinámicas; generado con AutoRound (RTN) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-397B-A17B, un transformer de mezcla de expertos (MoE) con capacidades multimodales de entrada (pipeline `image-text-to-text`). La model card del checkpoint cuantizado menciona explícitamente la presencia de expertos enrutados, expertos MTP (multi-token prediction), proyecciones de experto compartido, proyecciones de self-attention, proyecciones de linear-attention y un módulo `mtp.fc`. También incluye una torre de visión (`visual`) y módulos `in_proj_a` / `in_proj_b`, lo que confirma una arquitectura híbrida con atención lineal. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original.

La cuantización se realizó con AutoRound en modo `model_free` y esquema MXFP8, aplicando redondeo RTN (round-to-nearest) a 94.079 módulos lineales. Se cuantizan los expertos enrutados, los expertos MTP, las proyecciones de experto compartido, las proyecciones de self-attention, las de linear-attention y `mtp.fc`. Se mantienen en BF16 la torre de visión, `lm_head`, `embed_tokens`, los routers MoE (`mlp.gate`, `mlp.shared_expert_gate`) e `in_proj_a` / `in_proj_b`; `linear_attn.norm` se conserva en F32. La KV cache no se cuantiza en el checkpoint. La innovación técnica destacable es precisamente el esquema MXFP8 con grupo de 32 y escalas E8M0, que permite un despliegue de bajo coste con recuperación de precisión casi total.

## Capacidades

- Generación de texto y razonamiento multimodal: el pipeline declarado es `image-text-to-text`, por lo que acepta imágenes junto con texto como entrada.
- Razonamiento matemático: los resultados de GSM8K (97,57 en MXFP8) indican un rendimiento alto en problemas aritméticos de varios pasos.
- Conocimiento general: MMLU de 88,49 en la versión cuantizada.
- Razonamiento de sentido común: PIQA (83,03) y HellaSwag (74,29).
- Predicción multi-token (MTP): la presencia de expertos MTP y `mtp.fc` sugiere soporte para decodificación especulativa o generación multi-token, aunque no se detalla su uso en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un modelo de casi 400 B en infraestructura con memoria limitada: la cuantización MXFP8 reduce el peso de los módulos cuantizados aproximadamente a la mitad frente a BF16 (8 bits frente a 16), lo que permite servir el modelo con menos GPUs o con GPUs de menor VRAM por nodo.
- Razonamiento matemático asistido: con un GSM8K del 97,57 en la versión cuantizada, es adecuado para tutores automáticos, verificación de cálculos y generación de problemas resueltos paso a paso.
- Análisis de documentos con imágenes: al aceptar entradas imagen-texto, puede emplearse para extraer información de capturas, gráficos o formularios escaneados combinados con instrucciones textuales.
- Evaluación de conocimiento en dominios generales: su MMLU de 88,49 lo hace utilizable en sistemas de respuesta a preguntas de cultura general y apoyo a la formación.
- Servicio de inferencia con vLLM: el checkpoint está empaquetado en compressed-tensors y la model card indica `vllm serve intel-ai/Qwen3.5-397B-A17B-MXFP8-AutoRound`, por lo que se integra directamente en un servidor compatible con la API de OpenAI para aplicaciones conversacionales.
- Investigación sobre cuantización: sirve como referencia reproducible para estudiar la degradación de precisión de MXFP8 frente a BF16 en modelos MoE multimodales de gran escala, dado que la model card documenta la configuración exacta de AutoRound.
- Prototipado de asistentes multimodales en entornos con presupuesto de memoria ajustado: la combinación de licencia Apache 2.0 y formato abierto facilita la experimentación sin coste de licencia.

## Benchmarks y rendimiento

Resultados publicados en la model card (los valores de precisión son aportados por el usuario según la propia model card):

| Benchmark | BF16 | MXFP8 | Recuperación |
|---|---:|---:|---:|
| GSM8K (strict-match) | 97,65 | 97,57 | 99,92 % |
| MMLU (acc) | 88,56 | 88,49 | 99,92 % |
| PIQA (acc) | 83,03 | 83,03 | 100,00 % |
| HellaSwag (acc) | 74,23 | 74,29 | 100,08 % |
| **Media** | **85,87** | **85,85** | **99,97 %** |

No se han publicado en la información disponible resultados de HumanEval, MMLU-Pro, MATH ni benchmarks multimodales (MMMU, DocVQA u otros) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 418,6 GB. Con pesos MXFP8 (8 bits) para los módulos cuantizados y BF16/F32 para el resto, se requiere un nodo multi-GPU; no se dispone de una cifra oficial de VRAM mínima.
- GPU recomendadas: no se especifican en la información disponible. Por el tamaño del checkpoint, se necesita un despliegue multi-GPU (por ejemplo, nodos con varias A100/H100) o GPUs con memoria agregada suficiente para 418,6 GB de pesos más la KV cache.
- ¿Cabe en GPU de consumo? No es viable en una única GPU de consumo (RTX 4090, 24 GB) ni en configuraciones de dos o cuatro GPUs de consumo por el tamaño del checkpoint.
- Opciones de despliegue: vLLM 0.29.0 (indicado explícitamente en la model card) y transformers (librería declarada). No se confirma soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| intel-ai/Qwen3.5-397B-A17B-MXFP8-AutoRound | 403,4 B | no disponible | Apache 2.0 | safetensors (compressed-tensors) | Cuantización MXFP8 W8A8 con recuperación media del 99,97 % |
| Qwen/Qwen3.5-397B-A17B | no disponible | no disponible | no disponible | no disponible | Modelo base en BF16; referencia de precisión para la tabla de benchmarks |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de otros fabricantes en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La model card advierte de que el modelo puede producir salidas factualmente incorrectas y no debe usarse como fuente de información veraz sin verificación.
- Riesgo de sesgos y contenido ofensivo: la model card reconoce que el modelo base y sus datasets de ajuste pueden generar salidas sesgadas, obscenas u ofensivas; recomienda realizar pruebas de seguridad antes de desplegar.
- La principal fuente de error de cuantización son los pesos MXFP8 con activaciones dinámicas, y los expertos enrutados concentran la mayor parte de los parámetros, por lo que la degradación se concentra en ellos.
- La KV cache no está cuantizada en el checkpoint, lo que incrementa los requisitos de memoria en contextos largos.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que impide garantizar un comportamiento multilingüe o de contexto largo.
- Licencia Apache 2.0, pero la model card indica que la licencia no constituye asesoramiento legal y recomienda consultar a un abogado antes de un uso comercial.
- Los valores de precisión de los benchmarks son aportados por el usuario según la propia model card, no verificados de forma independiente.
- El rendimiento en benchmarks multimodales no se ha publicado, por lo que no hay evidencia de la calidad de la cuantización en tareas de visión.

## Enlaces

- Hugging Face: https://huggingface.co/intel-ai/Qwen3.5-397B-A17B-MXFP8-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- AutoRound (GitHub): https://github.com/intel/auto-round
- Intel Neural Compressor (GitHub): https://github.com/intel/neural-compressor
- Paper AutoRound (arXiv): https://arxiv.org/abs/2309.05516
