# hherb/AstaBrief-8B-MLX-8bit

## Resumen

AstaBrief-8B-MLX-8bit es una conversión cuantizada a 8 bits, en formato MLX, del modelo AstaBrief 8B desarrollado por el Allen Institute for AI (Ai2). El modelo original se basa en la arquitectura de Qwen3 y está especializado en una tarea muy concreta: generar informes de investigación con citas a partir de una pregunta y de fragmentos de literatura científica suministrados como contexto. No es un asistente conversacional de propósito general, sino un modelo orientado a la síntesis documental con atribución de fuentes.

Esta versión, publicada por el usuario hherb en Hugging Face, no incorpora entrenamiento adicional: se trata de una conversión de formato con cuantización afín de 8 bits (group size 64) y BF16 para los parámetros no cuantizados, verificada mediante checksums SHA-256 de los shards originales. El repositorio ocupa aproximadamente 8,7 GB y conserva el tokenizer y la plantilla de chat del modelo fuente.

Su relevancia reside en dos factores: la creciente demanda de modelos especializados en generación de informes científicos con citas verificables, y la optimización para Apple silicon mediante MLX, que permite ejecutar el modelo localmente en Macs con memoria unificada sin depender de GPUs de NVIDIA. La licencia Apache 2.0 del modelo base se mantiene en la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3 (variante de 8B) |
| Parametros totales | 8.190.735.360 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica si es MoE; todo apunta a modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit afín, group size 64; BF16 para parámetros no cuantizados |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato MLX, 2 shards, ~8,7 GB) |

## Arquitectura y entrenamiento

El modelo base, AstaBrief 8B de Ai2, es un transformer derivado de Qwen3 con 8 mil millones de parámetros. Según la model card del repositorio de conversión, fue entrenado mediante fine-tuning supervisado (SFT) para la tarea de generación de informes de investigación citados: recibe una pregunta y una serie de extractos de literatura científica, y produce un informe estructurado que referencia los identificadores de los documentos suministrados. Ai2 publica además un dataset de prompts recomendados (allenai/AstaBrief_prompts) que define el formato de entrada esperado.

Sobre los datos de entrenamiento concretos (número de tokens, composición del corpus, uso de RLHF o DPO), la información disponible no ofrece detalles; habría que consultar la model card original de allenai/AstaBrief_8B. En cuanto a la conversión aquí reseñada, se realizó con MLX-LM mediante cuantización afín de 8 bits con group size 64, manteniendo BF16 en los parámetros no cuantizados. Antes de convertir, se verificaron los checksums SHA-256 de los cuatro shards del repositorio fuente contra los metadatos de Hugging Face, y los checksums de salida quedaron registrados en el archivo conversion-info.json del repositorio.

## Capacidades

- Generación de informes de investigación con citas: dado un query y fragmentos de literatura recuperada, produce un informe que incluye los IDs de referencia suministrados.
- Generación de texto conversacional básica: el tokenizer y la plantilla de chat del modelo fuente están incluidos y MLX-LM los aplica por defecto.
- Seguimiento de formato de prompt estructurado: está diseñado para consumir la plantilla SFT de Ai2 con los campos `[QUERY]` y `[SECTION_REFERENCES]`.
- No está orientado a razonamiento general, código, matemáticas ni capacidades multimodales; no se documenta soporte de tool calling, agentes ni vision/audio en la información disponible.
- La recuperación de literatura (retrieval) debe proporcionarse externamente: el modelo no incluye ningún componente de búsqueda.

## Casos de uso

- Elaboración de revisiones de literatura asistidas: un investigador recupera abstracts o secciones de papers relevantes (con cualquier motor de búsqueda académico) y los pasa como `[SECTION_REFERENCES]`; el modelo redacta un informe seccionado citando cada fuente, reduciendo horas de lectura inicial.
- Resúmenes ejecutivos de literatura para equipos de I+D: generación de briefs periódicos sobre un área temática a partir de lotes de documentos recuperados automáticamente.
- Asistencia en la escritura de artículos científicos: borradores de secciones relacionadas con el estado del arte, con atribución explícita a los extractos aportados, que el autor revisa y verifica.
- Vigilancia tecnológica: pipelines que consultan APIs de papers (Semantic Scholar, arXiv) y usan el modelo para sintetizar novedades sobre una tecnología concreta.
- Herramientas internas de consultoría o transferencia tecnológica: informes citados bajo demanda para clientes no técnicos, aprovechando que las citas anclan las afirmaciones a los documentos suministrados.
- Ejecución local y privada en Mac: gracias a la cuantización MLX de 8 bits, organizaciones con requisitos de confidencialidad pueden generar informes sobre literatura sensible sin enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card de la conversión advierte explícitamente que la validación realizada (generación de 768 tokens con dos extractos sintéticos, verificando que se citaban ambas referencias) es una prueba de carga y generación, no un benchmark de calidad investigadora, y que las puntuaciones publicadas del modelo original BF16 no establecen puntuaciones para esta conversión cuantizada.

## Requisitos de hardware

- Memoria unificada estimada: aproximadamente 8,7 GB solo para los pesos; se recomienda disponer de al menos 12-16 GB de memoria unificada para modelo, caché de contexto y sobrecoste de la aplicación (los contextos largos exigen memoria adicional).
- Plataforma objetivo: Mac con chip Apple silicon (M1, M2, M3 o posteriores). No es un modelo orientado a CUDA; para GPUs NVIDIA conviene usar el checkpoint original allenai/AstaBrief_8B en BF16.
- Cabe con holgura en Macs con 16 GB de RAM unificada o más; un MacBook Pro M-series estándar es suficiente para inferencia.
- Despliegue: vía MLX-LM (`mlx_lm.generate` o `mlx_lm.server`). No se documentan opciones con vLLM, TGI, llama.cpp u Ollama para esta conversión concreta.
- Parámetros de generación recomendados por Ai2 para informes: temperature 0,7, top-p 0,95 y hasta 4096 tokens de salida.
- Latencia y throughput: no disponibles; se espera un rendimiento típico de modelos 8B cuantizados a 8 bits en MLX sobre Apple silicon (decenas de tokens por segundo en chips M recientes), pero no hay medias publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantización | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AstaBrief-8B-MLX-8bit (esta ficha) | 8,19 B | MLX, 8-bit afín (group 64) | Informes de investigación con citas | Apache 2.0 | Hugging Face (hherb) |
| AstaBrief 8B (original, Ai2) | 8,19 B | BF16 (safetensors) | Informes de investigación con citas | Apache 2.0 | Hugging Face (allenai) |
| Qwen3 8B (base) | 8 B | BF16 y múltiples cuantizaciones | Uso general / chat | Apache 2.0 | Hugging Face (Qwen) |
| Llama 3.1 8B | 8 B | BF16 y múltiples cuantizaciones | Uso general / chat | Llama 3.1 Community License | Hugging Face (Meta) |

Frente a los modelos generales de 8B (Qwen3 8B, Llama 3.1 8B), AstaBrief está especializado en síntesis de literatura con citas, tarea en la que los modelos generales suelen tener dificultades de atribución. Frente al checkpoint original de Ai2, esta conversión ofrece la misma capacidad con un footprint de memoria notablemente menor y compatibilidad nativa con Apple silicon, a costa de una posible (no evaluada) degradación por cuantización.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está afinado para generar informes citados a partir de literatura suministrada; su comportamiento como chatbot general no está garantizado ni evaluado.
- No incluye retrieval: la calidad del informe depende completamente de los extractos que se le aporten; si la recuperación es pobre, el informe también lo será.
- Riesgo de alucinación: aunque cita los IDs de referencia suministrados, no hay garantía de que todas las afirmaciones del informe se correspondan fielmente con el contenido de los extractos; la verificación humana sigue siendo necesaria.
- Sin benchmarks de la conversión: no existe evaluación de equivalencia respecto al checkpoint BF16 original; la degradación por cuantización de 8 bits es esperable que sea mínima, pero no está medida.
- Idioma: declarado solo para inglés; no hay soporte documentado para castellano ni otros idiomas.
- Contexto: la longitud de ventana no está especificada en la información disponible; los contextos largos incrementan los requisitos de memoria unificada.
- Sesgos: hereda los sesgos de Qwen3 y de los datos de fine-tuning de Ai2; no se documentan auditorías específicas.
- Licencia: Apache 2.0 permite uso comercial, pero el dataset de prompts de Ai2 (allenai/AstaBrief_prompts) tiene su propia licencia, que debe revisarse por separado.
- Verificación de integridad: la conversión validó checksums y una prueba de humo, pero esto no constituye una evaluación de calidad investigadora.

## Enlaces

- Repositorio de la conversión: https://huggingface.co/hherb/AstaBrief-8B-MLX-8bit
- Modelo original (Ai2): https://huggingface.co/allenai/AstaBrief_8B
- Revisión fuente usada en la conversión: https://huggingface.co/allenai/AstaBrief_8B/tree/6a34f54dcd7887b790a570249b4a2a2fe81c6694
- Dataset de prompts recomendados (plantilla SFT): https://huggingface.co/datasets/allenai/AstaBrief_prompts/blob/main/sft_prompt.txt
- Información de la conversión (checksums y configuración): https://huggingface.co/hherb/AstaBrief-8B-MLX-8bit/blob/main/conversion-info.json
- Prueba de humo: https://huggingface.co/hherb/AstaBrief-8B-MLX-8bit/blob/main/smoke-test.txt
- Model card fuente preservada: https://huggingface.co/hherb/AstaBrief-8B-MLX-8bit/blob/main/SOURCE_MODEL_CARD.md
