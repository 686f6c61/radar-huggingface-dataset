# intel-ai/DeepSeek-V4-Flash-NVFP4-Mixed-CT-AutoRound

## Resumen

DeepSeek-V4-Flash-NVFP4-Mixed-CT-AutoRound es una versión cuantizada del modelo DeepSeek-V4-Flash publicada por Intel AI (intel-ai) mediante su herramienta auto-round. El modelo aplica una receta de cuantización mixta: NVFP4 para los expertos enrutados del bloque MoE y MXFP8 para el resto de capas lineales cuantizadas, manteniendo en BF16 el router, los embeddings, el lm_head y determinadas proyecciones excluidas. El resultado es un checkpoint de 163.273.978.455 parámetros totales (unos 163,3 mil millones) con un tamaño de repositorio de 168,5 GB, lo que supone una reducción significativa frente a los pesos en BF16 del modelo base.

La relevancia de esta ficha reside en que permite servir un modelo de razonamiento de gran escala con requisitos de memoria sensiblemente menores, manteniendo una recuperación de rendimiento cercana al 98-100 % en los benchmarks publicados. El modelo base DeepSeek-V4-Flash está orientado a generación de texto y razonamiento con modo "thinking" activable, y esta versión cuantizada conserva esa funcionalidad a través del parser de razonamiento de vLLM.

La cuantización fue realizada con RTN (round-to-nearest) sin iteraciones de optimización, usando calibración para las escalas estáticas de activación. El checkpoint está pensado para despliegue en vLLM con el plugin de Intel Neural Compressor, y ha sido validado en Linux sobre 2 GPU NVIDIA B200 con tensor parallelism 2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo MoE (deepseek_v4), con expertos enrutados |
| Parámetros totales | 163.273.978.455 (163,3 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | hasta 524.288 tokens (configuración de servido recomendada) |
| Tipos de cuantización | NVFP4 (expertos enrutados, W4A4, grupo 16), MXFP8 (resto de lineales, grupo 32), BF16 (router, embeddings, lm_head y proyecciones excluidas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash es un transformer con arquitectura de mezcla de expertos (MoE) identificada como `deepseek_v4`. Esta versión no reentrena el modelo: aplica cuantización post-entrenamiento sobre los pesos del base. La receta concreta cuantiza los expertos enrutados a NVFP4 con cuantización de pesos y activaciones W4A4 y tamaño de grupo 16, mientras que el resto de capas lineales cuantizadas (incluidas las 43 proyecciones `wo_a`) pasan a MXFP8 con grupo 32. El router, los embeddings, el lm_head y las proyecciones excluidas se mantienen en BF16.

La cuantización se realizó con auto-round de Intel usando RTN con cero iteraciones de optimización (`--iters 0`, `--disable_opt_rtn`), pero con calibración para las escalas estáticas de activación (`--disable_model_free`), por lo que no es un método libre de modelo. El checkpoint evaluado incluye además correcciones de exportación con nombres nativos y exportación MXFP8 de las 43 proyecciones `wo_a`. La model card advierte que el comando de generación documenta la receta, no una reproducción verificada de extremo a extremo.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activable mediante `--reasoning-parser deepseek_v4` y `default-chat-template-kwargs`.
- Razonamiento matemático de nivel alto, evidenciado por resultados en AIME26, MATH-500 y GSM8K.
- Razonamiento científico y de conocimiento general (GPQA Diamond, MMLU, MMLU-Pro).
- Generación de código: el modelo base está orientado a text-generation; no se detallan capacidades específicas de código en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas soportados no se detallan.
- Capacidad de contexto largo: la configuración de servido admite `--max-model-len 524288`, con caché KV en FP8 y block size 256.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Razonamiento matemático asistido: el modelo puede resolver problemas de competición y cálculo simbólico, con un 96,33 % en AIME26 y un 95,80 % en MATH-500 en la versión cuantizada, lo que lo hace adecuado para tutores matemáticos o verificación de soluciones.
- Evaluación de conocimiento científico: con un 85,90 % en GPQA Diamond, puede emplearse en asistentes de investigación que requieran responder preguntas de nivel experto en física, química y biología.
- Procesamiento de documentos largos: gracias a la ventana de hasta 524.288 tokens y la caché KV en FP8, permite analizar contratos, informes o bases de código extensas en una sola pasada.
- Generación de texto con razonamiento explícito: el modo thinking y el parser de razonamiento permiten exponer cadenas de razonamiento en aplicaciones de depuración o auditoría de respuestas.
- Despliegue en infraestructura con memoria limitada: al reducir el peso a NVFP4/MXFP8, permite servir un modelo de 163 B en 2 GPU B200 con tensor parallelism 2, frente a los requisitos mayores de la versión BF16.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de rendimiento de una receta NVFP4/MXFP8 frente al modelo base en pipelines de investigación sobre cuantización.
- Servicio de chat de alto rendimiento: la configuración de vLLM con `--max-num-seqs 32`, chunked prefill y FlashInfer permite atender peticiones concurrentes con razonamiento activado.

## Benchmarks y rendimiento

Resultados evaluados con EvalScope y thinking habilitado. PIQA y HellaSwag reportan acc (no acc_norm); MMLU es la media aritmética de las 57 materias. AIME26 usa 30 preguntas con 10 repeticiones (300 predicciones); GPQA Diamond usa 198 preguntas con 5 repeticiones (990 predicciones). Puntuaciones en porcentaje.

| Benchmark | Modelo base | NVFP4 mixto | Recuperación |
|---|---:|---:|---:|
| AIME26 | 96,00 | 96,33 | 100,34 % |
| GPQA Diamond | 87,37 | 85,90 | 98,32 % |
| PIQA | 95,16 | 95,05 | 99,88 % |
| MMLU (media 57 materias) | 92,21 | 92,23 | 100,02 % |
| MMLU-Pro | 85,37 | 85,21 | 99,81 % |
| MATH-500 | 96,80 | 95,80 | 98,97 % |
| HellaSwag | 86,34 | 84,93 | 98,37 % |
| GSM8K | 96,74 | 96,89 | 100,16 % |

## Requisitos de hardware

- Entorno validado: Linux, 2 GPU NVIDIA B200, tensor parallelism 2, Python 3.12.3.
- Versiones probadas: vLLM 0.33.0, PyTorch 2.14.0, Transformers 5.20.2, compressed-tensors 0.17.0, FlashInfer 0.7.2.post1.
- VRAM estimada: no disponible de forma explícita; el repo ocupa 168,5 GB, por lo que el checkpoint completo no cabe en una GPU consumer. La configuración probada usa `--gpu-memory-utilization 0.70` sobre 2 B200.
- GPU recomendadas: NVIDIA B200 (validado). Otras GPU no están documentadas en la información disponible.
- ¿Cabe en GPU consumer? No con los datos disponibles; el tamaño del checkpoint (168,5 GB) excede la VRAM de cualquier GPU consumer actual.
- Opciones de despliegue: vLLM 0.33.0 con el plugin de Intel Neural Compressor (`benchmark/vllm-qdq-plugin`, revisión fijada `f19930c5417cdbe182fd0b91a476cdd288fe2a9c`). No se documentan opciones con llama.cpp, Ollama ni TGI.
- Nota de despliegue: en CUDA, el plugin dequantiza las 43 capas `wo_a` a BF16 (variable `VLLM_DEEPSEEK_V4_WO_A_BF16=1`), lo que incrementa la memoria de pesos en tiempo de ejecución. En XPU se soporta el layout MXFP8 agrupado de `wo_a`, pero la ruta de atención CUDA no.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash (base) | 163,3 B (mismo total) | hasta 524.288 tokens (config. recomendada) | MIT | safetensors BF16 | Referencia de rendimiento; mayor huella de memoria |
| DeepSeek-V4-Flash-NVFP4-Mixed-CT-AutoRound | 163,3 B | hasta 524.288 tokens | MIT | safetensors NVFP4/MXFP8/BF16 | Recuperación del 98-100 % en benchmarks; requiere plugin de vLLM |
| Otras cuantizaciones del mismo base | no disponible | no disponible | MIT (heredada) | no disponible | No se documentan en la información proporcionada |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Hereda las limitaciones del modelo base: puede generar contenido inexacto o sesgado; se recomienda evaluar seguridad y precisión antes de desplegar.
- La cuantización NVFP4/MXFP8 introduce una pérdida de rendimiento de hasta aproximadamente un 1,7 % en algunos benchmarks (GPQA Diamond 98,32 %, HellaSwag 98,37 %, MATH-500 98,97 %).
- El checkpoint ha sido validado únicamente en 2 GPU B200 con tensor parallelism 2; el comportamiento en otras configuraciones no está documentado.
- En CUDA, las 43 capas `wo_a` se dequantizan a BF16 en tiempo de ejecución, lo que aumenta el uso de memoria de pesos y puede afectar al rendimiento respecto a una ejecución nativa MXFP8.
- El comando de generación documenta la receta de cuantización, no una reproducción verificada de extremo a extremo; el checkpoint evaluado incluye correcciones de exportación no reflejadas en el comando.
- Los idiomas soportados no están documentados, lo que impide garantizar cobertura multilingüe.
- Licencia MIT: permite uso comercial, pero debe seguirse también la licencia y guía de uso del modelo base.
- No se documentan capacidades de tool calling, agentes, visión ni audio; no deben asumirse.
- El modelo requiere `--trust-remote-code` y un plugin externo de vLLM, lo que añade superficie de mantenimiento y dependencia de versiones concretas.

## Enlaces

- Hugging Face: https://huggingface.co/intel-ai/DeepSeek-V4-Flash-NVFP4-Mixed-CT-AutoRound
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Repositorio auto-round: https://github.com/intel/auto-round
- Paper de auto-round: https://arxiv.org/abs/2309.05516
- Plugin Intel Neural Compressor para vLLM: https://github.com/intel/neural-compressor/tree/f19930c5417cdbe182fd0b91a476cdd288fe2a9c/benchmark/vllm-qdq-plugin
