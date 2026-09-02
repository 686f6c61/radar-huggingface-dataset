# cooler8/yejin-korean-3b-v1-sft

## Resumen

yejin-korean-3b-v1-sft es un modelo de lenguaje causal en coreano, desarrollado por el usuario cooler8, que ha sido preentrenado desde cero (from scratch) sobre un corpus coreano de más de 172 GB complementado con datos de AI Hub. El entrenamiento se realizó en un entorno de 8 GPUs NVIDIA H200 (1.128 GB de VRAM total) e incluyó una fase de ajuste fino supervisado (SFT) completa sobre todos los parámetros. El modelo está pensado como una base fundacional para tareas de generación de texto en coreano, con una arquitectura inspirada en Llama 3.2 3B pero con varias innovaciones técnicas.

Con 2.910.916.608 parámetros (aproximadamente 2,9 mil millones) y una ventana de contexto de 4.096 tokens, el modelo ofrece un equilibrio entre capacidad y requisitos de hardware moderados. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que lo convierte en una opción atractiva para desarrolladores que necesitan un modelo coreano de tamaño medio con pesos abiertos. Los resultados de benchmarks publicados (MMLU coreano 25,30 %, Belebele coreano 22,67 %) indican un rendimiento modesto, esperable para un modelo de este tamaño entrenado desde cero.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 3B (hidden=3072, layers=28, heads=24, kv_heads=8, intermediate=8192, GQA 3:1, RoPE θ=500.000) |
| Parametros totales | 2.910.916.608 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (solo se mencionan pesos en safetensors) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only basada en las especificaciones de Llama 3.2 3B, con atención por grupos de consultas (GQA) en proporción 3:1 y rotación posicional RoPE con theta de 500.000. Sobre esta base se incorporan varias técnicas modernas: QK-Norm (normalización de las proyecciones de query y key), Multi-Token Prediction (MTP) con lambda 0,3, z-loss con alfa 1e-4 y embedding tying (compartición de pesos entre la capa de embedding y la de salida). El tokenizador utilizado es `EleutherAI/polyglot-ko-1.3b`, con un vocabulario de 30.003 tokens.

El entrenamiento se realizó en dos fases: primero un preentrenamiento desde cero sobre un corpus coreano de más de 172 GB (más datos de AI Hub) y posteriormente un ajuste fino supervisado completo (full SFT) sobre los 8 GPUs H200. No se menciona el uso de RLHF, DPO u otras técnicas de alineación adicionales. El número total de tokens de entrenamiento no se especifica en la información disponible.

## Capacidades

- Generación de texto causal en coreano, con capacidad de completar secuencias y responder a instrucciones en formato de prompt (el ejemplo de uso muestra un prompt con "### 지시사항" y "### 답변").
- Modelo fundacional entrenado desde cero, por lo que puede servir como base para fine-tuning en tareas específicas del coreano.
- Soporte de contexto de hasta 4.096 tokens, suficiente para conversaciones de varias vueltas o documentos de longitud media.
- No se mencionan capacidades de tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso explícito.
- Multilingüe: únicamente coreano (ko). No hay evidencia de soporte para otros idiomas.

## Casos de uso

- Asistente de escritura en coreano: el modelo puede generar borradores de textos, correos o artículos en coreano, aprovechando su entrenamiento en corpus extensos del idioma. Su tamaño de 3B permite ejecutarlo en GPUs de gama media.
- Chatbot de atención al cliente en coreano: con una ventana de 4.096 tokens, puede mantener conversaciones de varias interacciones. El formato de prompt con instrucciones y respuestas es adecuado para integrarlo en sistemas de diálogo.
- Generación de contenido para redes sociales o blogs en coreano: el modelo produce texto coherente y puede adaptarse a diferentes estilos mediante prompts.
- Resumen de documentos coreanos: aunque no se ha evaluado específicamente, su capacidad de generación de texto permite resumir párrafos o artículos si se le proporciona el contexto adecuado.
- Fine-tuning para tareas específicas en coreano: al ser un modelo fundacional con licencia Apache 2.0, se puede ajustar con datos propios para clasificación, extracción de información o generación estructurada.
- Prototipado rápido de aplicaciones NLP en coreano: su tamaño moderado y su disponibilidad en Hugging Face facilitan la experimentación en entornos de desarrollo con recursos limitados.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Global MMLU (coreano) | 25,30 % |
| Belebele (coreano) | 22,67 % |

No se han publicado comparaciones con otros modelos en la información disponible. Estos resultados son relativamente bajos en términos absolutos, lo que es esperable para un modelo de 3B entrenado desde cero sin técnicas de alineación avanzadas. El rendimiento en tareas de razonamiento o conocimiento general puede ser limitado.

## Requisitos de hardware

- No se proporcionan datos oficiales de VRAM, latencia o throughput en la documentación del modelo.
- Estimación razonable: con 2,9 mil millones de parámetros, los pesos en bfloat16 ocupan aproximadamente 5,8 GB (coincide con el tamaño del repositorio). Para inferencia, se necesitaría al menos 6-8 GB de VRAM en fp16/bf16, o alrededor de 2-3 GB con cuantización de 4 bits (si se generan los archivos GGUF o similares).
- GPUs recomendadas: una RTX 3090, RTX 4090 o A10 con 24 GB de VRAM sería suficiente para ejecutar el modelo sin cuantizar. GPUs con 8-12 GB (como RTX 3060 o RTX 4070) podrían funcionar con cuantización.
- Opciones de despliegue: al ser un modelo estándar de Transformers, se puede servir con vLLM, llama.cpp (si se convierte a GGUF), Ollama o directamente con la librería `transformers` de Hugging Face.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

No se dispone de información comparativa en la documentación proporcionada. Existen otros modelos coreanos de tamaño similar, como los de la familia Polyglot-Ko o modelos multilingües como BLOOM, pero no se han publicado comparaciones directas con yejin-korean-3b-v1-sft. Se recomienda consultar benchmarks independientes antes de elegir un modelo para producción.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en coreano; no es adecuado para tareas en otros idiomas.
- La ventana de contexto de 4.096 tokens es limitada para documentos largos o conversaciones extensas.
- Los resultados de benchmarks (MMLU 25,30 %, Belebele 22,67 %) son bajos, lo que sugiere un rendimiento limitado en tareas de conocimiento general y comprensión lectora.
- No se han documentado sesgos específicos, pero al entrenarse con datos de internet y AI Hub, es probable que herede sesgos presentes en el corpus.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en dominios especializados.
- No se menciona si el modelo ha sido evaluado para seguridad o robustez ante prompts adversariales.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento o la idoneidad para casos de uso específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cooler8/yejin-korean-3b-v1-sft
- Tokenizador utilizado: https://huggingface.co/EleutherAI/polyglot-ko-1.3b
- Repositorio de referencia (no oficial) con arquitectura similar: https://github.com/pathcosmos/FRANKENSTALLM
