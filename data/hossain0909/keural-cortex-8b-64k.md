# hossain0909/Keural-Cortex-8B-64K

## Resumen

Keural Cortex 8B — 64K es un modelo base de tipo transformer decoder-only desarrollado por MKD Co., Ltd. (publicado en Hugging Face bajo el identificador `hossain0909`) mediante preentrenamiento continuado (continued pretraining, CPT) sobre `Qwen/Qwen3-8B-Base`. El objetivo del proyecto es adaptar el modelo al coreano y extender su ventana de contexto nativa de 32.768 a 65.536 tokens mediante escalado YaRN con factor 2.0. La fase final (Phase 5) combina 41.000 millones de tokens de CPT con 2.500 millones adicionales dedicados específicamente a la extensión de contexto.

La relevancia del modelo es doble. Por un lado, demuestra empíricamente que la composición del corpus pesa más que el volumen de tokens para mejorar conocimiento factual en un idioma: los 41B tokens de CPT iniciales (basados en web crawl) no mejoraron KMMLU, mientras que los 2.500 millones de tokens de la fase de extensión (58 % coreano, 58 % del corpus AI Hub con libros curados) sí lo hicieron, alcanzando 54,32 frente a los 53,91 del modelo base. Por otro, verifica la extensión de contexto con una prueba needle-in-a-haystack que recupera 12 de 12 casos hasta 65.536 tokens, incluyendo profundidades del 90 %.

Es importante subrayar que se trata de un modelo **base**, sin instruction tuning, sin formato de chat real, sin tool calling y sin modo de razonamiento. Su uso está orientado a investigación, fine-tuning posterior y tareas de continuación de texto, no a interacción conversacional directa en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-8B-Base) |
| Parametros totales | 8,19 B según model card; 2.047.683.840 según safetensors del repo |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens nativos (YaRN factor 2.0) |
| Tipos de cuantizacion | bfloat16 en origen; verificado en Q8_0 vía llama.cpp; otras cuantizaciones GGUF no documentadas |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; compatible con transformers; existe checkpoint GGUF Q8_0 para llama.cpp |

Nota: existe una discrepancia entre los 8,19 B declarados en la model card y los 2.047.683.840 parámetros reportados por los safetensors del repositorio. Esta ficha recoge ambos datos sin resolver la discrepancia, ya que la información disponible no permite determinarlo.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B-Base: un transformer decoder-only denso con atención estándar, sin mezcla de expertos. Sobre esta base, MKD Co., Ltd. aplicó un proceso en dos etapas. La primera consistió en 41.000 millones de tokens de preentrenamiento continuado con datos principalmente de web crawl en coreano, que mejoraron aspectos léxicos (HaeRae rare_word +3,70, loan_word +2,96) pero no el conocimiento factual medido por KMMLU. La segunda etapa, correspondiente a la Phase 5, empleó 2.500 millones de tokens con una composición del 58 % coreano y 58 % procedente del corpus AI Hub (libros curados y corpus modu), y es la que produjo la mejora en KMMLU (+0,41 sobre el base, +0,75 sobre el checkpoint step10000).

La innovación técnica destacable es la extensión de contexto mediante YaRN con factor 2,0, que duplica la ventana nativa de 32.768 a 65.536 tokens. La model card documenta que esta extensión no degradó el rendimiento en contexto corto (inglés con media de −0,05, sin resultados estadísticamente significativos) y que la recuperación exacta en needle-in-a-haystack se mantiene hasta la longitud máxima. No se documenta el uso de RLHF, DPO ni SFT; el modelo es explícitamente un base model sin post-entrenamiento.

## Capacidades

- Generación de texto por continuación: el modelo completa documentos, no responde instrucciones.
- Comprensión y generación en coreano, con mejora medible en conocimiento factual (KMMLU 54,32).
- Comprensión y generación en inglés, sin regresión respecto al base (MMLU 73,79, GSM8K 82,71).
- Razonamiento aritmético básico en inglés (GSM8K 82,71), heredado del base.
- Recuperación de información en contexto largo: needle-in-a-haystack 12/12 hasta 65.536 tokens y profundidad del 90 %.
- Capacidad de servir como punto de partida para fine-tuning supervisado (SFT) o DPO posteriores.
- **No** dispone de tool calling ni function calling.
- **No** dispone de modo de razonamiento (thinking mode) ni capacidades de agente multi-paso.
- **No** dispone de visión, audio ni modalidades adicionales.
- El `chat_template.jinja` heredado del tokenizer no implica instruction tuning; el modelo imita frases de asistente por exposición durante el preentrenamiento, no por alineamiento.

## Casos de uso

- **Investigación en adaptación lingüística al coreano**: el modelo sirve como caso de estudio reproducible de cómo la composición del corpus (libros curados frente a web crawl) afecta al conocimiento factual. Adecuado para equipos que investigan estrategias de CPT con presupuestos limitados de tokens.
- **Base para fine-tuning supervisado en coreano**: al ser un modelo base con licencia Apache 2.0, puede emplearse como inicialización para SFT orientado a tareas concretas (clasificación, extracción, resumen) en dominios coreanos, partiendo de un modelo ya adaptado al idioma.
- **Procesamiento de documentos largos en coreano**: con 65.536 tokens de contexto verificado, permite tareas de continuación y modelado sobre contratos, informes o expedientes extensos sin truncamiento, siempre que se formule la tarea como continuación y no como instrucción.
- **Evaluación de técnicas de extensión de contexto**: el checkpoint y el script `eval/needle_cpu.py` documentado permiten reproducir la verificación de YaRN y comparar con otras estrategias de escalado (RoPE base, LongRoPE, etc.).
- **Generación de datos sintéticos en coreano**: un modelo base adaptado al idioma puede emplearse para producir texto de dominio que luego se filtre y se use en pipelines de aumento de datos, con revisión humana obligatoria por el riesgo de alucinación.
- **Prototipado de modelos de lenguaje para nichos coreanos**: permite validar pipelines de inferencia (transformers, llama.cpp, TGI) con un modelo de 8B parámetros y licencia permisiva antes de invertir en modelos mayores.
- **Benchmarking de cuantización**: el checkpoint Q8_0 en llama.cpp documentado facilita comparar degradación por cuantización en tareas de contexto largo con un modelo de referencia.

## Benchmarks y rendimiento

Los resultados provienen de `lm-evaluation-harness` 0.4.12 y `transformers` 4.55.2 en bfloat16, comparando contra `Qwen3-8B-Base` y contra el checkpoint intermedio `step10000`.

| Benchmark | Base | step10000 | Keural Cortex 8B 64K | vs step10000 |
|---|---|---|---|---|
| KMMLU | 53,91 | 53,57 | **54,32** | +0,75 |
| HaeRae | 63,06 | 64,44 | 64,62 | +0,18 |
| KoBEST BoolQ | 57,05 | 64,25 | 63,46 | −0,78 |
| KoBEST COPA | 72,30 | 70,20 | 70,20 | 0,00 |
| KoBEST HellaSwag | 58,80 | 59,60 | 59,80 | +0,20 |
| KoBEST SentiNeg | 83,88 | 81,36 | **91,69** | +10,33 |
| MMLU | 74,70 | 74,02 | 73,79 | −0,23 |
| GSM8K (1.319 muestras) | 84,69 | 82,34 | 82,71 | +0,38 |
| ARC-Challenge | 57,25 | 59,64 | 58,79 | −0,85 |
| HellaSwag | 78,59 | 78,12 | 78,40 | +0,28 |
| WinoGrande | 72,38 | 72,61 | 72,77 | +0,16 |

Needle-in-a-haystack (llama.cpp, Q8_0, CPU): 12/12 recuperaciones correctas en longitudes de 4.096, 16.384, 32.768 y 65.536 tokens, a profundidades del 10 %, 50 % y 90 %.

La model card advierte que no se ha ejecutado descontaminación de benchmarks, por lo que los números deben considerarse provisionales hasta completar la verificación de solapamiento n-gram con los conjuntos de evaluación.

## Requisitos de hardware

- **VRAM estimada en bfloat16**: aproximadamente 16,4 GB de pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 24 GB para contexto corto y 40-80 GB para contexto completo de 65.536 tokens.
- **VRAM estimada en Q8_0**: aproximadamente 8,5-9 GB de pesos; viable en GPU de 16 GB con contexto moderado.
- **GPU recomendadas**: A100 40/80 GB o H100 para contexto completo en bf16; RTX 4090 (24 GB) para bf16 con contexto reducido o Q8_0 con contexto largo; RTX 3090/4080 para cuantizaciones más agresivas.
- **Consumer GPU**: sí es viable en RTX 4090, 3090, 4080 y GPUs de 16 GB o más con cuantización Q8_0 o inferior.
- **Opciones de despliegue**: transformers (librería nativa), llama.cpp (verificado en Q8_0), text-generation-inference (TGI, etiqueta `endpoints_compatible`), vLLM (no documentado explícitamente pero compatible con arquitectura Qwen3), Ollama (no documentado).
- **Latencia y throughput**: no disponibles en la información proporcionada. La verificación needle-in-a-haystack se ejecutó en CPU, lo que sugiere viabilidad de inferencia sin GPU pero sin datos de rendimiento publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | KMMLU | MMLU | Licencia | Tipo |
|---|---|---|---|---|---|---|
| Keural Cortex 8B 64K | 8,19 B | 65.536 | 54,32 | 73,79 | Apache 2.0 | Base, CPT coreano |
| Qwen3-8B-Base | 8,19 B | 32.768 | 53,91 | 74,70 | Apache 2.0 | Base |
| Qwen3-8B-Instruct | 8,19 B | 32.768 (extensible) | No disponible | No disponible | Apache 2.0 | Instruct |

La comparación directa con Qwen3-8B-Instruct no se ha realizado en el proyecto, y la model card advierte explícitamente que comparar un modelo base con uno instruct solo tiene sentido en benchmarks de conocimiento. No se dispone de datos frente a otros modelos coreanos especializados (por ejemplo, variantes de Llama o Mistral adaptadas al coreano) en la información proporcionada.

## Limitaciones y advertencias

- **Es un modelo base**: no sigue instrucciones, no mantiene conversaciones reales y no soporta tool calling. Dirigirlo a través del chat template produce imitación de estilo, no respuestas alineadas.
- **Riesgo elevado de alucinación** en generación libre, especialmente en tareas factuales, al no haber pasado por RLHF ni DPO.
- **Mejora modesta en coreano**: KMMLU +0,41 sobre el base es estadísticamente significativa pero no transformadora; 12 de 45 subtareas de KMMLU retrocedieron y el grupo de humanidades bajó 0,58.
- **Sesgos no evaluados**: no se documenta ninguna evaluación de sesgos, toxicidad o equidad. El corpus incluye web crawl, lo que puede introducir sesgos propios de ese tipo de datos.
- **Benchmarks sin descontaminar**: los resultados deben tratarse como provisionales hasta completar la verificación de solapamiento con los conjuntos de evaluación.
- **Discrepancia en el recuento de parámetros** entre la model card (8,19 B) y los safetensors (2,05 B), sin aclaración en la documentación. Verificar antes de desplegar.
- **Idiomas limitados**: solo coreano e inglés; no se documenta rendimiento en castellano ni en otros idiomas.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo base subyacente (Qwen3-8B-Base) también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- **Sin comparación con modelos instruct**: no debe asumirse que supera a Qwen3-8B-Instruct en ninguna tarea conversacional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hossain0909/Keural-Cortex-8B-64K
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Repositorio del proyecto (script de evaluación needle): https://github.com/MKD-CORP/Keural-Cortex-8B
- Script needle-in-a-haystack: `eval/needle_cpu.py` dentro del repositorio anterior
