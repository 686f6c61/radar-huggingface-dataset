# RedHatAI/Ripple-65B-Preview-NVFP4

## Resumen

Ripple-65B-Preview-NVFP4 es una versión cuantizada a NVFP4 del modelo Ripple-65B-Preview, desarrollado originalmente por ricursiveAI y cuantizado por RedHatAI. Se trata de un transformer denso de aproximadamente 65.000 millones de parámetros nominales (36.890 millones reales según los pesos en safetensors del checkpoint cuantizado) preentrenado sobre 12 billones de tokens y con soporte declarado de hasta 1 millón de tokens de contexto. El modelo base está orientado a razonamiento y codificación agéntica, y destaca por su rendimiento en tareas de terminal y agentes de código.

La contribución de esta variante es puramente de eficiencia: aplica cuantización de pesos y activaciones a FP4 (formato NVFP4 con escalado por bloques de 16 elementos y factores de escala en FP8), reduciendo el requisito de memoria y el tamaño en disco en aproximadamente un 75% respecto al checkpoint en BF16. El objetivo es desplegar el modelo en hardware Blackwell (B200) con vLLM manteniendo una recuperación de precisión alta respecto al original.

Es relevante ahora porque permite servir un modelo de razonamiento de gran tamaño en una sola GPU B200 con tensor-parallel-size 1, algo inviable en BF16 con esa misma configuración, y porque el ecosistema vLLM ya soporta nativamente el formato compressed-tensors con el que se exporta. La licencia es Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RicursiveForCausalLM (transformer denso) |
| Parametros totales | 36.890.569.040 (pesos del checkpoint cuantizado); 65B nominales en el modelo base |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | hasta 1M tokens segun el modelo base; evaluado con `--max-model-len 65536` |
| Tipos de cuantizacion | NVFP4 (pesos y activaciones FP4, escalado por bloque de 16 elementos, escalas FP8), GPTQ con ponderacion por importancia de activaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato compressed-tensors (compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 65B parámetros preentrenado sobre 12 billones de tokens, con extensión de contexto hasta 1M tokens. El checkpoint cuantizado conserva la arquitectura `RicursiveForCausalLM` y requiere `trust_remote_code` para cargarse, ya que utiliza código personalizado. Solo se cuantizan los operadores lineales dentro de los bloques del transformer; la capa `lm_head` se mantiene sin cuantizar.

El proceso de cuantización se realizó con LLM Compressor aplicando un `GPTQModifier` con esquema `NVFP4`, observador de pesos `nvfp4_expanded_imatrix`, `actorder="static"`, `dampening_frac=0.01` y `block_size=128`, usando 512 muestras de calibración del dataset `perfectblend` con longitud máxima de secuencia de 2048. No se dispone de información sobre la composición del dataset de preentrenamiento, el uso de RLHF/DPO ni innovaciones de atención específicas más allá del soporte de contexto largo declarado en el modelo base.

## Capacidades

- Generación de texto y razonamiento de cadena de pensamiento (CoT), con parser de razonamiento dedicado (`--reasoning-parser ripple`) en vLLM.
- Codificación agéntica: el modelo base reporta 80.52 en TerminalBench 2.1 según la información de búsqueda.
- Soporte de tool calling / function calling, con parser específico (`--tool-call-parser ripple`) y `--enable-auto-tool-choice` en vLLM.
- Razonamiento multi-paso y uso en entornos de agentes.
- Contexto largo de hasta 1M tokens (modelo base), útil para repositorios de código y documentos extensos.
- Capacidades multilingües: no disponible.
- No se declaran capacidades de visión ni audio.

## Casos de uso

- Agentes de codificación en terminal: el modelo base obtiene 80.52 en TerminalBench 2.1, por lo que esta variante cuantizada es adecuada para agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos de shell, con el ahorro de memoria del FP4.
- Asistentes de revisión de código en repositorios grandes: gracias al contexto de hasta 1M tokens del modelo base, puede ingerir múltiples ficheros y el historial de cambios en una sola ventana.
- Automatización de pipelines CI/CD con tool calling: integrable vía API compatible con OpenAI de vLLM para invocar herramientas de build, test y despliegue.
- Razonamiento científico y QA de alto nivel: el modelo mantiene 79.12 en GPQA Diamond tras la cuantización, adecuado para asistentes de investigación que requieren respuestas con CoT verificable.
- Despliegue en una sola GPU B200: con `--tensor-parallel-size 1` y ~37.9 GB de repo, permite servir un modelo de razonamiento de gran tamaño en hardware Blackwell sin clúster multi-GPU.
- Sistemas de agentes multi-paso con contexto conversacional largo: la ventana extendida y el soporte de tool calling permiten mantener estado de tareas prolongadas.
- Evaluación y benchmarking interno: útil como checkpoint de referencia para comparar calidad FP4 frente a BF16 con el protocolo Inspect.

## Benchmarks y rendimiento

| Categoria | Benchmark | Ripple-65B-Preview (BF16) | Ripple-65B-Preview-NVFP4 | Recuperacion |
|---|---|---|---|---|
| Razonamiento | GPQA Diamond (0-shot, CoT, avg@3) | 81.82 | 79.12 | 96.70% |

Error estándar: ±2.48 (BF16) y ±2.41 (NVFP4). Las puntuaciones siguen el protocolo `inspect_evals/gpqa_diamond` y no son directamente comparables con el resultado de GPQA Diamond reportado en la model card del modelo base. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 37.9 GB en FP4, por lo que la inferencia requiere aproximadamente 38-45 GB de VRAM según longitud de contexto y overhead de KV cache.
- GPU recomendadas: NVIDIA B200 (usada en la evaluación oficial); cualquier GPU Blackwell con soporte NVFP4. No se garantiza funcionamiento en arquitecturas anteriores sin soporte nativo de FP4.
- GPU de consumo: no disponible; el tamaño y el formato NVFP4 hacen improbable su ejecución en GPUs consumer convencionales.
- Despliegue: vLLM es la vía soportada oficialmente (`vllm serve`), con `--tensor-parallel-size 1`, `--reasoning-parser ripple`, `--enable-auto-tool-choice` y `--tool-call-parser ripple`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| RedHatAI/Ripple-65B-Preview-NVFP4 | 36.89B reales (65B nominales) | hasta 1M (base) | NVFP4 | Apache 2.0 | Esta ficha; GPQA Diamond 79.12 |
| ricursiveAI/Ripple-65B-Preview | 65B | hasta 1M | BF16 | no disponible | Modelo base; GPQA Diamond 81.82 |
| ricursiveAI/Ripple-65B-Preview-NVFP4 | 65B nominales | hasta 1M | NVFP4 | no disponible | Variante NVFP4 del propio autor del modelo base |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización FP4 introduce una pérdida de precisión medible: 2.70 puntos en GPQA Diamond (recuperación del 96.70%) respecto al BF16.
- El checkpoint requiere `trust_remote_code`, lo que implica ejecutar código personalizado del autor; conviene auditar antes de desplegar en producción.
- Solo se han publicado resultados en GPQA Diamond; no hay evidencia de rendimiento en otras tareas (código, matemáticas, agentes) tras la cuantización.
- Idiomas soportados no declarados; no se puede garantizar calidad multilingüe.
- Riesgo de alucinación inherente a modelos de razonamiento de gran tamaño; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- El formato NVFP4 depende de hardware Blackwell; no es portable a GPUs sin soporte nativo de FP4.
- El modelo está marcado como "Preview"; puede no ser estable para producción a largo plazo.
- Aunque la licencia es Apache 2.0, el modelo base tiene licencia no disponible en la información, lo que conviene verificar antes de uso comercial.

## Enlaces

- Hugging Face (checkpoint cuantizado): https://huggingface.co/RedHatAI/Ripple-65B-Preview-NVFP4
- Hugging Face (modelo base): https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Hugging Face (NVFP4 del autor del base): https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- Inspect AI: https://github.com/UKGovernmentBEIS/inspect_ai
