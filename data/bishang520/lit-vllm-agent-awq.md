# bishang520/Lit-VLLM-Agent-AWQ

## Resumen

Lit-VLLM-Agent-AWQ es un modelo de lenguaje especializado en agentes académicos, desarrollado por el usuario bishang520. Se basa en el modelo Qwen2-7B de Alibaba y ha sido sometido a un proceso de adaptación específico para tareas de interrogación estructurada sobre documentos científicos y técnicos, con énfasis en la generación de respuestas con citas verificables. El modelo incorpora una expansión del vocabulario original con 141 tokens adicionales extraídos de corpus de ArXiv, lo que mejora su capacidad para procesar terminología académica.

El modelo ha pasado por dos fases de ajuste: primero un SFT (fine-tuning supervisado) mediante QLoRA con DeepSpeed ZeRO-2, y posteriormente un alineamiento por preferencias con DPO. Finalmente, se ha cuantizado a 4 bits usando AWQ, lo que reduce el tamaño de los pesos a aproximadamente 5,2 GB, facilitando su despliegue en hardware con recursos limitados. Está diseñado para integrarse en pipelines RAG (retrieval-augmented generation) con recuperación híbrida (Milvus + BM25) y soporta salida estructurada en JSON mediante guided decoding, lo que lo hace adecuado para aplicaciones de asistencia a la investigación y análisis documental. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2-7B) |
| Parametros totales | 7.613.767.168 (7,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa 8192) |
| Tipos de cuantizacion | AWQ 4-bit, group_size=128, version=gemm |
| Idiomas soportados | inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards, ~5,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de Qwen2-7B, un decoder-only con atención causal. Sobre esta base, se ha ampliado el vocabulario de 151.643 a 151.806 tokens, añadiendo 141 tokens específicos del dominio académico mediante un análisis BPE sobre corpus de ArXiv. Esta expansión permite representar mejor términos técnicos y de investigación sin fragmentarlos en subpalabras.

El entrenamiento se realizó en dos etapas. Primero, un SFT con QLoRA (cuantización de 4 bits en los adaptadores) y DeepSpeed ZeRO-2, durante 400 pasos, alcanzando una pérdida de entrenamiento de 0,197 y una pérdida de validación de 0,106. Posteriormente, un alineamiento DPO de 200 pasos, con una precisión de preferencia entre 98,75% y 100% y un margen medio de aproximadamente 2,8. La cuantización AWQ se aplicó después del entrenamiento, con group_size de 128 y versión gemm, preservando la fidelidad del modelo.

## Capacidades

- Generación de texto con formato estructurado JSON, incluyendo campos de citas y referencias, mediante guided decoding (compatible con vLLM y xgrammar).
- Interrogación académica: responde preguntas sobre papers, informes técnicos y documentos de investigación, con capacidad de señalar la fuente exacta de cada afirmación.
- Integración con sistemas RAG híbridos: funciona con recuperación combinada de embeddings vectoriales (Milvus) y búsqueda lexical (BM25), alcanzando un Recall@5 de 1,00 y MRR de 0,99 en el entorno de evaluación descrito.
- Soporte multilingüe en inglés y chino, con especialización en terminología académica de ambos idiomas.
- Capacidad de razonamiento multi-paso para tareas de análisis documental complejas, aunque no se especifica un modo de "thinking" explícito.
- Generación de respuestas con fidelidad alta (0,90) y alineación de citas con el contenido recuperado (0,80), según las métricas de RAG reportadas.

## Casos de uso

- Asistente de revisión bibliográfica: el modelo puede resumir y extraer conclusiones de múltiples papers, generando respuestas con citas directas a los párrafos relevantes, lo que facilita la verificación manual por parte del investigador.
- Análisis de informes técnicos y patentes: dada su expansión de vocabulario académico, es capaz de interpretar terminología especializada y responder preguntas sobre especificaciones, métodos y resultados.
- Chat conversacional en inglés y chino para entornos de investigación: puede mantener diálogos multi-turno sobre temas científicos, apoyándose en el contexto recuperado para mantener coherencia.
- Pipeline RAG para documentación corporativa: integrado en un sistema de recuperación con Milvus y BM25, puede servir como motor de respuestas para bases de conocimiento internas, con citas verificables.
- Generación de resúmenes estructurados: produce salidas JSON con campos predefinidos (por ejemplo, título, autores, hallazgos, referencias), útil para automatizar la creación de fichas de documentos.
- Evaluación de consistencia de citas: gracias a su entrenamiento con DPO, el modelo tiende a preferir respuestas con citas bien alineadas, lo que lo hace adecuado para tareas de verificación de referencias en textos académicos.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estándar como MMLU, HumanEval o GSM8K. En su lugar, reporta métricas específicas del flujo RAG y del entrenamiento:

| Metrica | Valor |
|---|---|
| Pérdida SFT (train/eval) | 0,197 / 0,106 |
| Precisión de preferencia DPO | 98,75% – 100% |
| Margen medio DPO | ≈ 2,8 |
| Recall@5 (recuperación híbrida) | 1,00 |
| MRR (recuperación híbrida) | 0,99 |
| Fidelidad RAG | 0,90 |
| Recall de citas | 0,60 |
| Precisión de citas | 0,55 |
| Alineación cita-recuperación | 0,80 |

Estos datos provienen del entorno de evaluación descrito por el autor, no de benchmarks independientes.

## Requisitos de hardware

- Peso del modelo: ~5,2 GB en formato AWQ 4-bit, lo que permite inferencia en GPUs con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) si se usa cuantización y batch pequeño.
- Para un despliegue con contexto largo (8192 tokens) y batching continuo, se recomienda una GPU con 16 GB o más (RTX 4090, A100 40 GB, H100).
- El ejemplo de despliegue con vLLM usa `--max-model-len 8192`, lo que sugiere que el contexto máximo soportado es de 8192 tokens, aunque no se confirma oficialmente.
- Opciones de despliegue: vLLM (recomendado, con soporte para AWQ y guided decoding), Transformers con `device_map="auto"`, y posiblemente llama.cpp si se convierte a GGUF (no incluido en el repo).
- vLLM ofrece PagedAttention y Continuous Batching, lo que mejora el throughput en entornos de producción. La latencia estimada no se ha publicado, pero para un modelo de 7B cuantizado a 4-bit en una GPU moderna se espera un rendimiento de decenas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Especializacion | Licencia |
|---|---|---|---|---|---|
| Lit-VLLM-Agent-AWQ | 7,6B | no disponible | AWQ 4-bit | Académico + RAG + citas | Apache 2.0 |
| Qwen2-7B (base) | 7,6B | 32K (original) | FP16/BF16 | General | Apache 2.0 |
| Llama-3-8B-Instruct | 8B | 8K | FP16/GGUF | General instruct | Llama 3 license |

La principal diferencia con el modelo base Qwen2-7B es la adaptación a dominios académicos, la expansión de vocabulario y el entrenamiento específico para generación con citas. Frente a Llama-3-8B-Instruct, carece de soporte nativo para chino y su ventaja reside en el pipeline RAG integrado. No se dispone de datos comparativos de rendimiento en tareas estándar.

## Limitaciones y advertencias

- El modelo está entrenado principalmente para tareas académicas en inglés y chino; su rendimiento en otros idiomas o dominios no académicos puede ser inferior.
- Las citas generadas pueden ser alucinadas si el sistema RAG no proporciona el contexto adecuado; la precisión de citas reportada es de 0,55, lo que indica un margen de error considerable.
- La longitud de contexto no está confirmada oficialmente; el ejemplo de despliegue usa 8192 tokens, pero podría ser menor o mayor.
- Al ser una cuantización AWQ 4-bit, puede haber una ligera pérdida de calidad en tareas de razonamiento complejo comparado con la versión FP16.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que no ha sido ampliamente probado por la comunidad; se recomienda validarlo en casos de uso reales antes de producción.
- Aunque la licencia Apache 2.0 permite uso comercial, el autor no proporciona garantías sobre el comportamiento del modelo en entornos de alto riesgo.

## Enlaces

- HuggingFace: https://huggingface.co/bishang520/Lit-VLLM-Agent-AWQ
- Repositorio del sistema completo: https://github.com/bishang520/Lit-VLLM-Agent
- vLLM (motor de inferencia): https://github.com/vllm-project/vllm
- Documentación de AWQ en vLLM: https://docs.vllm.ai/en/latest/features/quantization/auto_awq/
- Proyecto AWQ (MIT): https://hanlab.mit.edu/projects/awq
