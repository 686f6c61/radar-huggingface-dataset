# richardyoung/Mistral-Small-3.2-24B-Instruct-2506-SOM-heretic

## Resumen

Mistral-Small-3.2-24B-Instruct-2506-SOM-heretic es una versión "decensored" (también etiquetada como *abliterated* o *uncensored*) del modelo Mistral-Small-3.2-24B-Instruct-2506, publicada por el usuario richardyoung en Hugging Face. El modelo base es la actualización de junio de 2025 de Mistral AI sobre Small 3.1, que mejora el seguimiento de instrucciones, reduce las generaciones repetitivas o infinitas y refuerza la robustez de la plantilla de *function calling*. La modificación se ha realizado con Heretic v2.0.0, una herramienta de ablación direccional que elimina selectivamente las direcciones de activación asociadas a rechazos.

El modelo conserva la arquitectura multimodal del original (pipeline `image-text-to-text`), con aproximadamente 24.011 millones de parámetros en formato safetensors y licencia Apache 2.0. La intervención SOM (Self-Organizing Map Multi-Directional Ablation) aplica direcciones de ablación por capa con un decaimiento de 0,65, afectando a las proyecciones `attn.o_proj` y `mlp.down_proj`. El resultado declarado por el autor es una reducción de rechazos de 98/100 a 18/100 en su conjunto de evaluación, con una divergencia KL de 0,0995 respecto al original.

Es relevante para desarrolladores e investigadores que necesitan un modelo de 24B con capacidades de visión, contexto largo y soporte multilingüe amplio, pero sin las capas de rechazo del modelo alineado. No obstante, la reducción de salvaguardas implica riesgos de seguridad y de cumplimiento que deben evaluarse antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Mistral 3, vision-language), ablación direccional SOM sobre el modelo base |
| Parametros totales | 24.011.361.280 (~24B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Mistral Small 3.x soporta 128k tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (repo en safetensors; se puede cuantizar a GGUF/AWQ/GPTQ con herramientas externas) |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn (24 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria declarada: vllm) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Mistral Small 3.2 24B Instruct, un transformer multimodal que procesa texto e imágenes (pipeline `image-text-to-text`). No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. La model card original de Mistral Small 3.2 indica únicamente mejoras incrementales sobre Small 3.1 en seguimiento de instrucciones, reducción de generaciones infinitas y robustez del *function calling*.

La innovación técnica específica de esta ficha es la aplicación de Heretic v2.0.0 con ablación multi-direccional SOM. Se definen direcciones de ablación por capa (`direction_index` = per layer) con un factor de decaimiento de 0,65. Los pesos de ablación se aplican en dos módulos: `attn.o_proj` (max_weight 1,22 en la posición 25,49; min_weight 0,13 a distancia 20,00) y `mlp.down_proj` (max_weight 1,06 en la posición 25,58; min_weight 0,19 a distancia 23,15). Esta técnica modifica los pesos del modelo para suprimir direcciones de activación asociadas a comportamientos de rechazo, sin reentrenamiento adicional.

## Capacidades

- Generación de texto conversacional multi-turno en 24 idiomas, incluyendo español, inglés, francés, alemán, portugués, italiano, japonés, coreano, ruso, chino, árabe, persa, indonesio, malayo, nepalí, polaco, rumano, serbio, sueco, turco, ucraniano, vietnamita, hindi y bengalí.
- Comprensión de imágenes y texto (image-text-to-text): descripción de imágenes, respuesta a preguntas visuales, análisis de documentos y gráficos.
- Razonamiento matemático y STEM, con soporte de cadenas de razonamiento (CoT) de 5 disparos según los benchmarks del modelo base.
- Generación de código y resolución de problemas de programación (HumanEval Plus, MBPP Plus).
- *Function calling* / *tool calling* con una plantilla más robusta que en Small 3.1, según la model card del modelo base.
- Capacidad de seguir instrucciones precisas y reducir generaciones repetitivas o infinitas (mejora de 2,11% a 1,29% en el conjunto interno del modelo base).
- Comportamiento "decensored": reducción drástica de rechazos (18/100 frente a 98/100 del original) en el conjunto de evaluación del autor.
- No se declara soporte explícito de modo *thinking*, audio ni agentes multi-paso en la información disponible.

## Casos de uso

- **Investigación sobre alineación y seguridad**: el modelo permite estudiar el efecto de la ablación direccional sobre el comportamiento de rechazo, comparando respuestas con el modelo base y midiendo la divergencia KL (0,0995) y la tasa de rechazos (18/100). Útil para laboratorios que analizan técnicas de *abliteration*.
- **Generación de contenido creativo sin filtros**: escritura de ficción, guiones o narrativa que requiera temáticas sensibles, aprovechando la reducción de rechazos y el soporte multilingüe en 24 idiomas.
- **Análisis de documentos con imágenes**: procesamiento de facturas, informes escaneados o gráficos gracias a las capacidades de visión (DocVQA 94,86%, ChartQA 87,4% en el modelo base).
- **Atención al cliente multilingüe**: conversaciones multi-turno en español, inglés, francés, alemán y otros idiomas, con *function calling* para integración con sistemas de ticketing o CRM.
- **Asistencia en programación**: generación y revisión de código en pipelines de CI/CD, con soporte de *tool calling* y buenos resultados en HumanEval Plus (92,90% Pass@5 en el modelo base).
- **Prototipado rápido con vLLM**: despliegue en servidores con vLLM >= 0.9.1 y `mistral_common >= 1.6.2`, usando temperatura baja (0,15 recomendada) y un *system prompt* para ajustar el comportamiento.
- **Evaluación comparativa de modelos abliterated**: referencia para comparar distintas técnicas de ablación (SOM, directional ablation, etc.) sobre un mismo modelo base de 24B.

## Benchmarks y rendimiento

Los datos de benchmarks corresponden al modelo base Mistral-Small-3.2-24B-Instruct-2506, no al modelo ablacionado. El autor solo reporta métricas de la intervención (rechazos y divergencia KL). No se han publicado resultados de benchmarks del modelo heretic sobre MMLU, HumanEval, GSM8K u otros en la información disponible.

**Métricas de la ablación (modelo heretic frente al original):**

| Metrica | Modelo heretic | Modelo original |
|---|---|---|
| Rechazos | 18/100 | 98/100 |
| Divergencia KL | 0,0995 | 0 (por definición) |

**Benchmarks del modelo base (Mistral-Small-3.2-24B-Instruct-2506):**

| Benchmark | Small 3.1 24B Instruct | Small 3.2 24B Instruct |
|---|---|---|
| Wildbench v2 | 55,6% | 65,33% |
| Arena Hard v2 | 19,56% | 43,1% |
| IF interno (accuracy) | 82,75% | 84,78% |
| Generaciones infinitas | 2,11% | 1,29% |
| MMLU | 80,62% | 80,50% |
| MMLU Pro (5-shot CoT) | 66,76% | 69,06% |
| MATH | 69,30% | 69,42% |
| GPQA Main (5-shot CoT) | 44,42% | 44,22% |
| GPQA Diamond (5-shot CoT) | 45,96% | 46,13% |
| MBPP Plus Pass@5 | 74,63% | 78,33% |
| HumanEval Plus Pass@5 | 88,99% | 92,90% |
| SimpleQA (TotalAcc) | 10,43% | 12,10% |
| MMMU | 64,00% | 62,50% |
| Mathvista | 68,91% | 67,09% |
| ChartQA | 86,24% | 87,4% |
| DocVQA | 94,08% | 94,86% |
| AI2D | 93,72% | 92,91% |

## Requisitos de hardware

- **VRAM estimada para inferencia**: en FP16/BF16, aproximadamente 48 GB solo para pesos (24B × 2 bytes), más overhead de KV cache y activaciones; se recomienda un mínimo de 60-80 GB para contexto largo. En cuantización de 8 bits, ~24 GB; en 4 bits, ~12-16 GB.
- **GPU recomendadas**: A100 80GB, H100 80GB, H200, L40S 48GB (justo para FP16 con contexto corto). Para cuantización 4-bit, RTX 4090 24GB o RTX 3090 24GB pueden ser suficientes.
- **¿Cabe en GPU consumer?**: en FP16 no cabe en ninguna GPU consumer actual (máximo 24 GB). En cuantización 4-bit (GGUF/AWQ) sí cabe en RTX 4090, RTX 3090 o RTX 4080 16GB (con contexto reducido).
- **Opciones de despliegue**: vLLM >= 0.9.1 (recomendado por el autor, con `mistral_common >= 1.6.2`), transformers, llama.cpp (si se generan pesos GGUF), Ollama (previa conversión), TGI (si se adapta la plantilla de chat).
- **Latencia y throughput**: no disponible en la información proporcionada.
- **Nota**: la model card del modelo base recomienda temperatura 0,15 y un *system prompt* explícito para obtener el mejor comportamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| Mistral-Small-3.2-24B-Instruct-2506-SOM-heretic (este) | ~24B | no disponible | Si | Apache 2.0 | Ablacionado con Heretic SOM; rechazos 18/100 |
| Mistral-Small-3.2-24B-Instruct-2506 (base) | ~24B | no disponible | Si | Apache 2.0 | Modelo alineado original; rechazos 98/100 |
| Mistral-Small-3.1-24B-Instruct-2503 | ~24B | no disponible | Si | Apache 2.0 | Versión anterior; menor rendimiento en Wildbench y Arena Hard |
| Gemma 3 27B Instruct | ~27B | no disponible | Si | Gemma license | Alternativa multimodal de tamaño similar; licencia más restrictiva |

La comparativa se limita a los datos disponibles en la información proporcionada. No se dispone de benchmarks del modelo heretic frente a Gemma 3 u otros modelos de la misma categoría, por lo que la comparación de rendimiento se basa únicamente en el modelo base.

## Limitaciones y advertencias

- **Reducción de salvaguardas**: el modelo ha sido ablacionado para reducir rechazos (de 98/100 a 18/100). Esto implica que puede generar contenido que el modelo original rechazaría, incluyendo material sensible, ofensivo o potencialmente dañino. No es adecuado para aplicaciones orientadas al público sin capas adicionales de moderación.
- **Riesgo de alucinación**: no se han publicado métricas específicas de alucinación para esta versión. El modelo base tiene un SimpleQA TotalAcc de solo 12,10%, lo que indica una tasa alta de respuestas incorrectas en preguntas de conocimiento factual.
- **Divergencia respecto al original**: la divergencia KL de 0,0995 indica que la distribución de salida se ha alterado de forma medible; el rendimiento en tareas estándar puede degradarse respecto al modelo base, aunque no se han publicado benchmarks que lo cuantifiquen.
- **Licencia Apache 2.0**: permite uso comercial, pero el usuario es responsable del cumplimiento normativo (por ejemplo, la AI Act europea) y de las políticas de contenido aplicables. La licencia no exime de responsabilidad sobre el contenido generado.
- **Idiomas**: aunque se declaran 24 idiomas, la calidad puede variar significativamente entre ellos; no se han publicado evaluaciones por idioma.
- **Contexto**: no se confirma la longitud de contexto en la información disponible; conviene verificar la configuración del modelo base antes de asumir 128k tokens.
- **Despliegue**: requiere vLLM >= 0.9.1 y `mistral_common >= 1.6.2`; versiones anteriores pueden fallar al cargar la plantilla de chat o el procesador de visión.
- **Reputación del autor**: el modelo lo publica un usuario individual (richardyoung), no Mistral AI; no hay garantías de soporte, mantenimiento ni auditoría independiente.

## Enlaces

- [Hugging Face: richardyoung/Mistral-Small-3.2-24B-Instruct-2506-SOM-heretic](https://huggingface.co/richardyoung/Mistral-Small-3.2-24B-Instruct-2506-SOM-heretic)
- [Modelo base: unsloth/Mistral-Small-3.2-24B-Instruct-2506](https://huggingface.co/unsloth/Mistral-Small-3.2-24B-Instruct-2506)
- [Modelo original: mistralai/Mistral-Small-3.2-24B-Instruct-2506](https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506)
- [Mistral-Small-3.1-24B-Base-2503 (referencia de benchmarks)](https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Base-2503)
- [Heretic project](https://heretic-project.org)
- [vLLM](https://github.com/vllm-project/vllm)
- [mistral-common](https://github.com/mistralai/mistral-common)
- [SYSTEM_PROMPT.txt del modelo base](https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506/blob/main/SYSTEM_PROMPT.txt)
