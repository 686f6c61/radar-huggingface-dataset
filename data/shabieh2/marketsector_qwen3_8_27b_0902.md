# shabieh2/marketsector_qwen3_8_27b_0902

## Resumen

El modelo `shabieh2/marketsector_qwen3_8_27b_0902` es un fine-tuning del modelo base `unsloth/qwen3.8-27b-unsloth-bnb-4bit`, que a su vez es una versión cuantizada a 4 bits del modelo Qwen3.8-27B de Alibaba. El autor, shabieh2, ha ajustado el modelo con la librería Unsloth y TRL, orientándolo aparentemente a tareas de clasificación o análisis de sectores de mercado, como sugiere el nombre "marketsector". El modelo se distribuye bajo licencia Apache 2.0 y está pensado para generación de texto en inglés.

Qwen3.8-27B es un modelo denso de 27 mil millones de parámetros con arquitectura híbrida: combina atención lineal en 48 de sus 64 capas con atención completa en las restantes, e incorpora una torre de visión para procesamiento multimodal (imagen y vídeo). Su contexto nativo es de 262 000 tokens, extensible a 1 millón. El fine-tuning conserva todas estas capacidades, aunque el repositorio no documenta los datos de entrenamiento específicos ni el proceso de ajuste.

La relevancia de este modelo radica en ofrecer una versión especializada de un modelo de última generación, con un tamaño de repositorio de solo 2,6 GB gracias a la cuantización 4-bit, lo que lo hace desplegable en hardware de consumo. Sin embargo, al carecer de documentación detallada sobre el fine-tuning, su uso en producción requiere validación previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (48/64 capas) + torre de visión (del modelo base Qwen3.8-27B) |
| Parametros totales | 27 000 millones (del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens nativo, extensible a 1 000 000 (del modelo base) |
| Tipos de cuantizacion | 4-bit (bitsandbytes, según el nombre del modelo base) |
| Idiomas soportados | Inglés (etiqueta `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina atención lineal en 48 de sus 64 capas, reduciendo el coste computacional en contextos largos, con atención completa en las 16 restantes para preservar la calidad en tareas complejas. Incluye además un cabezal de visión (vision tower) para entrada multimodal y un cabezal de draft (MTP) para decodificación especulativa. El fine-tuning realizado por shabieh2 se llevó a cabo con Unsloth, que acelera el entrenamiento aproximadamente 2 veces, y con la librería TRL de Hugging Face. No se especifican los datos de entrenamiento, el número de tokens ni si se aplicaron técnicas como RLHF o DPO. El modelo resultante mantiene las capacidades del base, pero su especialización en "sector de mercado" no está documentada.

## Capacidades

- Generación de texto y razonamiento complejo, heredadas del modelo base Qwen3.8-27B.
- Comprensión multimodal: procesa imágenes y vídeo (del modelo base).
- Soporte de tool calling y function calling, útil para integraciones con APIs.
- Capacidad para tareas agénticas multi-paso (multi-step agentic tasks).
- Contexto largo de 262K tokens, ampliable a 1M, adecuado para documentos extensos.
- Decodificación especulativa mediante el cabezal MTP, que acelera la inferencia.
- Especialización potencial en análisis de sectores de mercado, aunque no hay evidencia pública de ello más allá del nombre del modelo.

## Casos de uso

- Análisis de informes financieros: el modelo puede procesar documentos largos (10-K, memorias anuales) gracias a su contexto de 262K tokens, extrayendo información relevante sobre sectores y empresas.
- Clasificación de empresas por sector: dado el nombre "marketsector", es plausible que el fine-tuning haya sido entrenado para etiquetar o categorizar entidades empresariales en sectores económicos, aunque no se aportan métricas.
- Asistente de inversión: combinando tool calling con APIs de datos bursátiles, el modelo puede responder preguntas sobre tendencias de mercado y generar resúmenes ejecutivos.
- Análisis de noticias económicas: su capacidad de razonamiento y contexto largo permite resumir y comparar artículos de prensa financiera.
- Generación de informes de investigación: puede redactar secciones de informes sectoriales a partir de datos estructurados y no estructurados.
- Automatización de atención al cliente en banca: con su soporte de agentes multi-paso, puede gestionar consultas complejas sobre productos financieros, derivando a herramientas externas cuando sea necesario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de evaluación del fine-tuning, ni comparaciones con el modelo base u otros modelos. Se recomienda realizar una evaluación propia antes de usar el modelo en producción.

## Requisitos de hardware

- VRAM estimada: con cuantización 4-bit, los pesos del modelo ocupan aproximadamente 13,5 GB (27B × 0,5 bytes por parámetro). Añadiendo overhead de activaciones y KV cache, se recomienda al menos 16 GB de VRAM para inferencia con contexto corto, y más para contextos largos.
- GPU recomendadas: NVIDIA RTX 3090 (24 GB), RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) para mayor margen.
- En consumer GPU: sí, cabe en GPUs de 24 GB como la RTX 3090/4090, siempre que se use cuantización 4-bit y se limite la longitud de contexto.
- Opciones de despliegue: compatible con text-generation-inference (TGI), vLLM, llama.cpp y Ollama, dado el formato safetensors y la cuantización 4-bit.
- Latencia y throughput: no disponibles. La decodificación especulativa del modelo base puede mejorar la velocidad, pero no hay mediciones publicadas para este fine-tuning.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantización | Especialización |
|---|---|---|---|---|---|
| shabieh2/marketsector_qwen3_8_27b_0902 | 27B | 262K | Apache 2.0 | 4-bit | Sector de mercado (no verificado) |
| Qwen/Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | FP16/BF16 | Generalista multimodal |
| Qwen2.5-32B | 32B | 128K | Apache 2.0 | FP16/BF16 | Generalista |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 | FP16 | Generalista |

El modelo fine-tuneado se diferencia del base únicamente por el ajuste adicional, que no está documentado. Frente a Qwen2.5-32B, ofrece mayor contexto nativo (262K vs 128K) y capacidades multimodales, aunque con menos parámetros. Comparado con Llama 3.1 8B, es significativamente más grande y capaz, pero requiere más VRAM.

## Limitaciones y advertencias

- No hay documentación sobre el proceso de fine-tuning: se desconoce el dataset, el número de épocas y las técnicas de alineación, lo que impide evaluar su robustez.
- El nombre "marketsector" sugiere una especialización, pero no hay evidencia pública de su rendimiento en tareas de mercado; podría ser un experimento sin validación.
- El modelo base Qwen3.8-27B puede presentar sesgos en datos financieros y alucinaciones en tareas numéricas; el fine-tuning no corrige estos problemas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El contexto de 262K tokens es teórico; en la práctica, la memoria necesaria para la KV cache puede exceder la VRAM disponible en GPUs de consumo.
- Al estar cuantizado a 4-bit, puede haber una ligera degradación de calidad frente al modelo en precisión completa, especialmente en tareas de razonamiento complejo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shabieh2/marketsector_qwen3_8_27b_0902
- Modelo base en Hugging Face: https://huggingface.co/unsloth/qwen3.8-27b-unsloth-bnb-4bit
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Ficha de Qwen3.8-27B en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/qwen/models/qwen3.8-27b/
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
