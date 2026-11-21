# PoluxAI/polux-andromeda-1

## Resumen

Polux Andromeda 1 es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por PoluxAI y publicado en Hugging Face bajo licencia Apache 2.0. El modelo parte concretamente del checkpoint cuantizado en 4 bits `unsloth/qwen2.5-7b-instruct-unsloth-bnb-4bit` y se ha entrenado con la librería Unsloth junto con TRL de Hugging Face, lo que el autor describe como un entrenamiento "2x más rápido". Se trata, por tanto, de un modelo derivado de la familia Qwen2.5, con arquitectura transformer decoder-only y 7.615.616.512 parámetros totales según los pesos en safetensors.

El modelo está orientado a generación de texto conversacional y declara únicamente el idioma inglés. No se documenta en la model card el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación adicionales (RLHF/DPO) más allá del ajuste fino supervisado sobre el modelo base. La información pública disponible es muy limitada: la model card es prácticamente la plantilla por defecto de Unsloth.

Su relevancia es acotada: se trata de un modelo de nicho con 38 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica adicional. Resulta útil como ejemplo de flujo de fine-tuning con Unsloth sobre Qwen2.5-7B, pero no como alternativa de producción frente a los modelos base de la familia Qwen2.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos, ampliables; no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible; el checkpoint de partida estaba cuantizado en 4 bits (bnb-4bit) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-7B-Instruct: un transformer decoder-only con atención por causalidad estándar, normalización RMSNorm, activaciones SwiGLU y embeddings de tipo RoPE. No se trata de una arquitectura MoE ni híbrida, sino de un modelo denso de aproximadamente 7.600 millones de parámetros. El ajuste fino se realizó con Unsloth y la librería TRL de Hugging Face, partiendo del checkpoint `unsloth/qwen2.5-7b-instruct-unsloth-bnb-4bit`, que es una versión cuantizada en 4 bits del modelo instruct original.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni hiperparámetros del ajuste. La model card no detalla ninguna innovación técnica adicional más allá del uso de Unsloth para acelerar el entrenamiento. El tamaño del repositorio (43,7 GB) es notablemente superior al esperado para pesos de 7B en bf16 (unos 15 GB) o en 4 bits (unos 4-5 GB), lo que sugiere que el repositorio puede contener múltiples checkpoints, estados del optimizador u otros artefactos de entrenamiento; este extremo no está confirmado en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, en la medida en que el ajuste fino no haya degradado las capacidades del base.
- Generación de código y resolución de problemas matemáticos básicos, presumiblemente heredados del base (no verificados en este ajuste).
- Soporte de tool calling / function calling: no confirmado explícitamente para este ajuste; el base Qwen2.5-7B-Instruct lo soporta, pero no hay evidencia de que se haya preservado.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al inglés según la model card, aunque el base Qwen2.5 es multilingüe.
- Modo "thinking", visión o audio: no disponibles.

## Casos de uso

- Experimentación con fine-tuning sobre Qwen2.5-7B: el modelo sirve como referencia de un pipeline Unsloth + TRL completo, útil para desarrolladores que quieran replicar el flujo de entrenamiento con un modelo denso de 7B.
- Generación de texto conversacional en inglés para prototipos internos: adecuado para pruebas de concepto de chatbots donde no se requiera garantía de calidad ni benchmarks verificados.
- Evaluación comparativa de ajustes finos: permite contrastar el efecto del fine-tuning frente al base Qwen2.5-7B-Instruct en tareas concretas, siempre que se ejecuten evaluaciones propias.
- Base para nuevos ajustes finos: al estar bajo Apache 2.0 y en formato safetensors, puede reutilizarse como punto de partida para especializaciones adicionales.
- Docencia y formación: útil como ejemplo práctico de fine-tuning con Unsloth en cursos o talleres sobre IA open source.
- Pruebas de despliegue con TGI o transformers: el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints, útil para validar infraestructura de serving.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 15-16 GB para los pesos, más overhead de activaciones y KV cache (aproximadamente 18-20 GB en total para contextos moderados).
- VRAM estimada en cuantización 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 5-6 GB de pesos, con un total de 7-8 GB para contextos moderados.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX A6000 para bf16 sin cuantizar; RTX 4090 (24 GB) para bf16 con contextos moderados.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 y en GPUs de 8-12 GB si se cuantiza a 4 bits (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070).
- Opciones de despliegue: transformers, Text Generation Inference (TGI), vLLM, llama.cpp y Ollama (previa conversión a GGUF), dado que la arquitectura Qwen2 está ampliamente soportada.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Polux Andromeda 1 | 7,6B | no disponible | Apache 2.0 | Hugging Face | Ajuste fino de Qwen2.5-7B-Instruct; sin benchmarks |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens (ampliable) | Apache 2.0 | Hugging Face, oficial | Modelo base con benchmarks publicados y soporte multilingüe |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.768 tokens | Apache 2.0 | Hugging Face, oficial | Alternativa densa de 7B con tool calling y benchmarks públicos |
| Llama-3.1-8B-Instruct | 8,0B | 128.000 tokens | Llama 3.1 Community License | Hugging Face, oficial | Contexto largo y buen rendimiento, con licencia no Apache |

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia objetiva del rendimiento del ajuste ni de si ha degradado las capacidades del base.
- Model card mínima: no se documentan datos de entrenamiento, hiperparámetros ni metodología de evaluación.
- Sesgos: no documentados; al derivar de Qwen2.5, hereda los sesgos del corpus de entrenamiento original, no auditados en este ajuste.
- Riesgo de alucinación: no evaluado; el ajuste fino sobre un modelo instruct puede incrementar o reducir la tendencia a alucinar sin que exista medición.
- Idioma: declarado únicamente en inglés, aunque el base es multilingüe; el ajuste puede haber reducido el rendimiento en otros idiomas.
- Contexto: no se especifica si el ajuste preserva la ventana de 32.768 tokens del base; conviene verificarlo empíricamente antes de usarlo en producción.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5 también es Apache 2.0, por lo que no hay restricciones adicionales conocidas; aun así, conviene revisar los términos de Unsloth si se redistribuye.
- Madurez: 38 descargas y 0 likes indican un modelo sin validación por la comunidad; no recomendable para producción sin evaluación propia.
- Tamaño del repositorio anómalo (43,7 GB): puede contener artefactos de entrenamiento no deseados; conviene inspeccionar los archivos antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PoluxAI/polux-andromeda-1
- Modelo base en Hugging Face: https://huggingface.co/unsloth/qwen2.5-7b-instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Repositorio de TRL: https://github.com/huggingface/trl
- Modelo Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
