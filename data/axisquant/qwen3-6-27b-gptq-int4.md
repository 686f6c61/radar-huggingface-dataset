# AxisQuant/Qwen3.6-27b-gptq-int4

## Resumen

Qwen3.6-27b-gptq-int4 es una cuantización GPTQ de 4 bits del modelo denso Qwen3.6-27B desarrollado por el equipo Qwen (Alibaba). La cuantización la firma AxisQuant (Prashant Takale) y reduce el peso del modelo de aproximadamente 54 GB en BF16 a unos 14 GB en VRAM, manteniendo únicamente los pesos del modelo de lenguaje en INT4 mientras el codificador visual permanece en BF16. El resultado es un modelo multimodal image-text-to-text que cabe con holgura en una GPU de consumo de 24 GB.

El modelo base es un transformer denso de 27.356 millones de parámetros (27,36 B) orientado a generación de texto, razonamiento, código y matemáticas, con soporte declarado de tool calling y modo de razonamiento explícito (`enable_thinking`). Esta versión cuantizada aplica GPTQ con group size 128, `desc_act=True` y calibración sobre C4 en inglés, alcanzando 4,29 bits efectivos por peso. La licencia heredada es Apache 2.0.

Su relevancia práctica es clara: ofrece el rendimiento de un modelo de 27B en un envelope de memoria propio de un modelo de 7B, con una aceleración declarada de ~2,4× en throughput y latencia a single-stream, y una pérdida de precisión mínima según los benchmarks publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5/Qwen3.6), multimodal image-text-to-text |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la model card menciona escenarios de 64K+ tokens en requisitos de hardware) |
| Tipos de cuantizacion | GPTQ INT4 weight-only (4,29 BPW efectivos); pesos originales BF16 |
| Idiomas soportados | en, zh (segun metadatos); calibracion solo en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ), libreria transformers / GPTQModel |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B es un transformer denso de 27,36 B parámetros con un codificador visual integrado (`model.visual.*`), lo que lo convierte en un modelo image-text-to-text además de generador de texto. La model card del autor de la cuantización no detalla la composición del dataset de preentrenamiento ni las fases de alineación (RLHF/DPO) del modelo original; esa información correspondería a la model card oficial de Qwen, que no se incluye en la documentación disponible.

La innovación técnica de esta ficha es el proceso de cuantización: GPTQ con 4 bits, group size 128, activación de `desc_act` (orden de activaciones), `damp_percent` 0,01, simetría activada y calibración sobre 256 muestras de 2.048 tokens del corpus C4 en inglés, usando GPTQModel v7. El codificador visual se deja intencionadamente en BF16 para preservar la calidad de la percepción visual, de modo que solo los pesos del modelo de lenguaje se comprimen. El resultado son 4,29 bits efectivos por peso y una reducción de VRAM de ~54 GB a ~14 GB en carga.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia (`apply_chat_template`).
- Razonamiento matemático de problemas verbales, con resultados altos en GSM8K.
- Generación de código, incluyendo evaluación con `pass@1` en HumanEval.
- Razonamiento STEM de nivel graduado (GPQA-Diamond).
- Procesamiento de imagen y texto (pipeline image-text-to-text), con codificador visual en BF16.
- Modo de razonamiento explícito (`enable_thinking=True`), funcional pero notablemente más lento que el modo directo.
- Soporte multilingüe limitado a inglés y chino según los metadatos del modelo.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente en la información proporcionada.

## Casos de uso

- Asistente conversacional autoalojado en una sola GPU de 24 GB: con ~14 GB de VRAM en carga, el modelo cabe en una RTX 3090 o RTX 4090 y permite desplegar un chatbot de 27B sin infraestructura de centro de datos.
- Razonamiento matemático en producción: con 96,82 de exact match en GSM8K, es adecuado para tutores automáticos, verificación de cálculos y resolución de problemas verbales en pipelines educativos.
- Generación de código asistida: con 77,44 de pass@1 en HumanEval, puede integrarse en entornos de desarrollo para autocompletado, generación de tests y explicación de fragmentos de código.
- Procesamiento de documentos con imagen y texto: al conservar el codificador visual en BF16, puede extraer y razonar sobre información de capturas, diagramas o formularios escaneados.
- Evaluación de conocimiento en dominios científicos: con 88,42 en MMLU-Redux y 68,69 en GPQA-Diamond, sirve para sistemas de preguntas y respuestas técnicas y de divulgación científica.
- Despliegue en entornos con restricciones de memoria: la reducción de 54 GB a 14 GB permite ejecutar el modelo en estaciones de trabajo con una única GPU consumer, útil para prototipado e investigación académica.
- Sustitución de modelos de 7B en tareas de razonamiento: al ofrecer capacidad de 27B en un envelope de memoria menor, encaja en pipelines existentes que ya servían modelos pequeños pero necesitan mayor calidad.

## Benchmarks y rendimiento

Resultados declarados por el autor de la cuantización, evaluados con lm-evaluation-harness en condiciones idénticas para BF16 e INT4 (decodificación greedy, `enable_thinking=False`, seed=0). MMLU-Redux usa un subconjunto de 1.500 muestras; el resto son tareas completas. Las métricas no están verificadas de forma independiente.

| Benchmark | Metrica | Resultado INT4 |
|---|---|---|
| ARC-Challenge | acc_norm | 64,08 |
| GSM8K | exact_match (strict) | 96,82 |
| MMLU-Redux (subconjunto 1.500) | exact_match (strict-match) | 88,42 |
| GPQA-Diamond | exact_match (flexible-extract) | 68,69 |
| HumanEval | pass@1 (create_test) | 77,44 |

Rendimiento de inferencia declarado: ~2,4× más throughput y ~2,4× menos latencia a single-stream frente al BF16, medido con una petición de 337 tokens de entrada y 42 de salida. La model card no publica los valores absolutos de tokens por segundo ni de TPOT.

## Requisitos de hardware

- VRAM estimada en carga: ~14 GB para los pesos cuantizados (frente a ~54 GB en BF16).
- Tamaño en disco: 18,7 GB (repositorio completo).
- GPU consumer: cabe cómodamente en tarjetas de 24 GB (RTX 3090, RTX 4090) para contexto corto y medio.
- Contexto largo (64K+ tokens): se recomienda H100 80 GB o A100 80 GB.
- Despliegue: GPTQModel (recomendado por el autor), transformers con `AutoModelForCausalLM`, y servidores compatibles con endpoints (`endpoints_compatible` en los tags). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: ~2,4× mejor que BF16 a single-stream; valores absolutos no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-27b-gptq-int4 (este) | 27,36 B | no disponible | GPTQ INT4, 4,29 BPW | Apache 2.0 | ~14 GB VRAM, multimodal, benchmarks propios |
| Qwen/Qwen3.6-27B (base BF16) | 27,36 B | no disponible | BF16 | Apache 2.0 | ~54 GB VRAM, referencia de calidad completa |
| Alternativas de ~27B denso cuantizadas | no disponible | no disponible | no disponible | no disponible | no se dispone de datos comparables en la informacion proporcionada |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con otras familias.

## Limitaciones y advertencias

- Solo se cuantizan los pesos del modelo de lenguaje; el codificador visual permanece en BF16, lo que limita el ahorro de memoria en cargas con uso intensivo de imagen.
- La calibración se realizó sobre C4 en inglés; cargas de trabajo en chino o en dominios específicos pueden degradarse y requerir una recuantización con un corpus representativo.
- El modo de razonamiento (`enable_thinking=True`) funciona pero es significativamente más lento; debe activarse solo cuando prime la calidad sobre la latencia.
- Los benchmarks son declarados por el autor de la cuantización y no están verificados de forma independiente; las puntuaciones absolutas pueden diferir de las oficiales de Qwen3.6-27B.
- Riesgo de alucinación inherente a los modelos de lenguaje de esta escala; no se documentan mitigaciones específicas.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas: solo inglés y chino declarados; el rendimiento en castellano no está evaluado.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial; conviene revisar los términos de la model card oficial de Qwen para condiciones adicionales.
- Soporte de tool calling y de agentes no confirmado explícitamente en la documentación disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AxisQuant/Qwen3.6-27b-gptq-int4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Blog oficial del modelo base: https://qwen.ai/blog?id=qwen3.6-27b
- Repositorio GPTQModel: https://github.com/ModelCloud/GPTQModel
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Paper de GPTQ: https://arxiv.org/abs/2210.17323
