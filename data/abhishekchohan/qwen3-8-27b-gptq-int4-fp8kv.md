# abhishekchohan/Qwen3.8-27B-GPTQ-INT4-FP8KV

## Resumen

El modelo `abhishekchohan/Qwen3.8-27B-GPTQ-INT4-FP8KV` es una cuantización GPTQ de 4 bits (INT4, weight-only) del modelo multimodal nativo `Qwen/Qwen3.8-27B` de Alibaba, publicada por el usuario abhishekchohan. El objetivo principal es reducir el footprint de memoria (~2,8× en pesos) y a la vez recortar el consumo de la caché KV mediante una cuantización fp8-e4m3 calibrada junto con los pesos, de modo que el contexto nativo de 262.144 tokens quepa en una única GPU de 48 GB. El modelo base es un LLM denso híbrido de 27.800 millones de parámetros con 64 capas (16 de atención softmax y 48 de atención lineal DeltaNet), encoder visual ViT congelado y predictor MTP para decodificación especulativa.

La relevancia de esta ficha radica en que combina tres características poco habituales en una sola cuantización: contexto ultralargo (262k nativo, ampliable a 524k con YaRN en 48 GB y hasta 1M en 96 GB), soporte multimodal (imagen y texto) y compatibilidad con vLLM mediante `--kv-cache-dtype fp8_e4m3`. La calibración se realizó con secuencias empaquetadas de 262.144 tokens (~2,1M de tokens) procedentes de los datasets Nemotron Post-Training v3, con el modo de razonamiento activado, lo que permite servir el modelo a su longitud máxima sin degradación medible en los benchmarks evaluados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 64 capas (16 softmax attention + 48 DeltaNet linear attention), encoder visual ViT congelado, predictor MTP |
| Parametros totales | 27.781.427.984 (~27,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo; 524.288 con YaRN factor 2.0 (48 GB); hasta 1.048.576 con YaRN factor 4.0 (96 GB) |
| Tipos de cuantizacion | INT4 weight-only (W4A16, group_size=32, asimétrico con zero-point), KV cache fp8-e4m3 (simétrico per-tensor) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 es multilingüe; la calibración incluye el dataset Nemotron-SFT-Multilingual-v2) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `recipe.yaml` para reproducibilidad) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un LLM denso de arquitectura híbrida: de sus 64 capas, 16 emplean atención softmax clásica (con KV cache) y 48 utilizan atención lineal DeltaNet, que mantiene estado recurrente en lugar de caché KV. Esta combinación reduce el coste de memoria de la caché a largo contexto, ya que solo las 16 capas softmax acumulan KV (~65 KB/token). El modelo incluye además un encoder visual ViT congelado para entrada de imágenes y un predictor MTP (multi-token prediction) que permite decodificación especulativa.

La cuantización se realizó con GPTQ (compensación de error por Hessiana), observer de pesos `imatrix-mse`, `actorder=static`, block size 128 y `dampening_frac: 0.01`. Se cuantizaron todos los lineales de atención y MLP, incluyendo las proyecciones de DeltaNet (`in_proj_qkv`, `in_proj_z`, `out_proj`), algo poco común. Se protegieron en BF16 las layer norms, `embed_tokens`, `lm_head`, las proyecciones de gating de DeltaNet (`in_proj_a`, `in_proj_b`), los estados convolucionales, el encoder visual completo y el predictor MTP. La calibración se hizo con 8 secuencias empaquetadas de 262.144 tokens (~2,1M de tokens) de los datasets Nemotron SFT (instrucción, matemáticas, ciencia, código agéntico y multilingüe), con el modo de razonamiento activado. La caché KV fp8 se calibró en la misma pasada, observando las activaciones k/v de las 16 capas softmax y horneando las escalas per-tensor en el checkpoint (rango 0,016–0,203).

## Capacidades

- Generación de texto y razonamiento multimodal: acepta imágenes y texto, con capacidad de razonamiento explícito (thinking mode) gracias al parser `qwen3` de vLLM.
- Razonamiento matemático y científico: entrenado con datasets Nemotron de matemáticas y ciencia, adecuado para problemas complejos.
- Generación de código y tareas agénticas: incluye el dataset Nemotron-SFT-SWE-v3 (software engineering), lo que lo hace apto para programación y flujos de agente.
- Soporte de tool calling / function calling: el modelo base Qwen3.8 está diseñado para agentes y llamadas a herramientas; la cuantización no elimina esta capacidad.
- Decodificación especulativa: el predictor MTP se mantiene intacto, permitiendo acelerar la inferencia con `--speculative-config '{"method":"mtp","num_speculative_tokens":2}'`.
- Contexto ultralargo: 262k tokens nativos, ampliable a 524k (48 GB) o 1M (96 GB) con YaRN y KV cache fp8.
- Multilingüe: la calibración incluye datos multilingües, aunque no se especifican los idiomas concretos.

## Casos de uso

- Atención al cliente automatizada con contexto largo: el modelo puede gestionar conversaciones multi-turno de miles de mensajes gracias a su ventana de 262k tokens, manteniendo el historial completo sin truncamiento. La cuantización INT4 permite desplegarlo en una sola GPU de 48 GB, reduciendo costes de infraestructura.
- Generación de código en producción: con soporte de tool calling y entrenamiento en SWE, puede integrarse en pipelines de CI/CD para revisión de código, generación de tests o autocompletado. El modo de razonamiento ayuda a depurar errores complejos.
- Análisis de documentos largos con imágenes: al ser multimodal, puede procesar informes extensos (PDF, capturas) combinando texto e imágenes, por ejemplo para extraer datos de facturas o resumir contratos de cientos de páginas.
- Agentes autónomos multi-paso: la combinación de tool calling, razonamiento y contexto largo permite construir agentes que ejecutan tareas complejas (navegación web, uso de APIs) con memoria de todas las interacciones previas.
- Razonamiento matemático y científico asistido: útil para resolver problemas de cálculo simbólico, verificar demostraciones o ayudar en investigación, gracias a los datasets de matemáticas y ciencia usados en la calibración.
- Búsqueda y recuperación en corpus extensos: con 262k tokens de contexto y 9/9 aciertos en retrieval a esa longitud, puede indexar y responder preguntas sobre libros técnicos, documentación legal o bases de conocimiento sin necesidad de RAG externo.
- Despliegue en hardware limitado: al caber en 48 GB con contexto completo, es viable en estaciones de trabajo con una sola GPU (p. ej., RTX 6000 Ada, A6000) para tareas de ofimática y productividad, como redacción de informes o análisis de hojas de cálculo.

## Benchmarks y rendimiento

No se han publicado resultados numéricos detallados de benchmarks en la información disponible. La model card indica que la cuantización no muestra degradación más allá del ruido de muestreo en 10 benchmarks comparados con el modelo BF16, y que obtiene 9/9 aciertos en tareas de retrieval a 262.144 tokens. No se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros.

## Requisitos de hardware

- VRAM estimada para inferencia: ~33,5 GB en total con contexto 262k y KV cache fp8 (pesos ~20 GB, KV ~8,5 GB, activaciones y overhead ~5 GB). Sin KV fp8 (bf16), el total sube a ~42 GB.
- GPU recomendadas: una GPU de 48 GB (p. ej., A6000, RTX 6000 Ada, L40S) para el escenario por defecto; una GPU de 96 GB (p. ej., RTX PRO 6000 Blackwell, A100 80GB en modo MIG no recomendado) para mayor concurrencia o contexto de 1M con YaRN.
- Compatibilidad con GPU de consumo: no cabe en GPUs de 24 GB (RTX 4090) con contexto completo; con contexto reducido (p. ej., 32k) podría intentarse, pero no está documentado.
- Opciones de despliegue: vLLM es la opción principal y la única documentada. Se requiere `--kv-cache-dtype fp8_e4m3` para usar las escalas calibradas. En hosts con CUDA 12.x hay que instalar el wheel `+cu129` y usar `--attention-backend TRITON_ATTN` con `VLLM_USE_FLASHINFER_SAMPLER=0`. También es posible usar llama.cpp u Ollama si convierten el formato, pero no está verificado.
- Latencia y throughput: no se proporcionan cifras. La decodificación especulativa con MTP (2 tokens) puede acelerar la generación, pero el rendimiento exacto depende del hardware y la carga.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base BF16) | 27,8B | 262k | Apache-2.0 | BF16 | Modelo original sin cuantizar, ~55 GB en disco |
| Qwen3.8-27B-GPTQ-INT4-FP8KV (este) | 27,8B | 262k (hasta 1M con YaRN) | Apache-2.0 | INT4 + fp8 KV | Cuantización con KV cache fp8, cabe en 48 GB |
| Qwen3.8-27B-GPTQ-INT4 (sin fp8 KV) | 27,8B | 262k | Apache-2.0 | INT4 | Variante del mismo autor sin KV cache fp8, requiere más VRAM para contexto largo |

No se dispone de datos de benchmarks comparativos con otros modelos de tamaño similar (p. ej., Llama 3.1 70B o Qwen2.5-32B) en la información proporcionada. La comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- La recuperación de información más allá de 262.144 tokens (hasta 1M con YaRN) no está validada; la model card indica explícitamente "retrieval beyond 262k unvalidated".
- La cuantización de las proyecciones de DeltaNet (poco común) puede introducir degradación en tareas que dependen fuertemente de la atención lineal, aunque la evaluación cubre visión y retrieval a largo contexto.
- No se documentan sesgos específicos del modelo; como todo LLM entrenado con datos web, puede reflejar sesgos presentes en el corpus de entrenamiento.
- Riesgo de alucinación inherente a los modelos generativos; el modo de razonamiento puede producir cadenas de pensamiento plausibles pero incorrectas.
- La licencia Apache-2.0 permite uso comercial, pero es recomendable revisar los términos del modelo base Qwen3.8 y de los datasets Nemotron utilizados en la calibración.
- El despliegue en vLLM requiere ajustes específicos según la versión de CUDA del host (wheels `+cu129` para CUDA 12.x, backend TRITON_ATTN, desactivación de flashinfer sampler), lo que puede complicar la puesta en producción.
- No se proporcionan datos de latencia ni throughput, por lo que es necesario realizar pruebas de carga propias antes de un despliegue a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abhishekchohan/Qwen3.8-27B-GPTQ-INT4-FP8KV
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8 (GitHub): https://github.com/QwenLM/Qwen3.8
- Repositorio de AlibabaCloud-Official/Qwen3.8-27B (GitHub): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página del modelo en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Variante sin KV cache fp8 del mismo autor: https://huggingface.co/abhishekchohan/Qwen3.8-27B-GPTQ-INT4
