# KikoCis/Qwen3.8-27B-GGUF

## Resumen

KikoCis/Qwen3.8-27B-GGUF es un conjunto de cuantizaciones GGUF del modelo Qwen/Qwen3.8-27B, desarrollado por Alibaba y publicado por el usuario KikoCis. El modelo base es un LLM híbrido de 27.32 mil millones de parámetros que combina capas SSM (state space model) y atención completa, con una ventana de contexto nativa de 262.144 tokens. Esta versión cuantizada destaca por incorporar una matriz de importancia (imatrix) calibrada específicamente sobre trazas de uso agéntico y código, con la hipótesis de preservar mejor los pesos relevantes para tool-calling y tareas de agente.

El repositorio ofrece tres niveles de cuantización (Q3_K_M, IQ4_XS y Q4_K_M) con tamaños entre 13.5 y 16.8 GB, pensados para ejecución local en hardware de consumo. La arquitectura híbrida reduce drásticamente el coste de memoria de la caché KV (64 KB por token frente a 256 KB en un modelo denso equivalente), lo que hace viable el contexto largo en GPU domésticas. Sin embargo, la propia model card advierte que el prefill en llama.cpp es lento en bucles agénticos multi-turno, y que la ventaja del imatrix agéntico aún no está demostrada con benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida SSM + atención completa (48 capas SSM, 16 capas de atención cada 4ª, 1 cabeza MTP) |
| Parametros totales | 27.32 B |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q3_K_M (~3 bits), IQ4_XS (~4 bits), Q4_K_M (~4 bits) |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero no se especifica en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina 48 bloques SSM (linear attention) con 16 bloques de atención completa distribuidos cada cuarta posición, más una cabeza MTP (multi-token prediction) que no es utilizada por llama.cpp. Esta disposición reduce el crecimiento de la caché KV a solo 16 capas, lo que explica que un contexto de 262.144 tokens requiera aproximadamente 64 KB por token en lugar de los 256 KB que necesitaría un modelo denso equivalente.

El proceso de cuantización aplica una imatrix calibrada sobre un corpus de dominio agéntico (tool-use y trazas de código), en lugar del corpus general habitual. El autor indica explícitamente que esta elección de diseño es una hipótesis aún no validada: no se han publicado métricas de calidad (perplejidad, KL-divergencia) ni resultados de benchmarks agénticos. El entrenamiento del modelo base incluye fases de RLHF y DPO, aunque los detalles específicos de datos y tokens no se proporcionan en la información disponible.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredadas del modelo base Qwen3.8-27B.
- Soporte de tool calling y function calling, reforzado por la calibración agéntica de la imatrix (aunque sin verificación empírica publicada).
- Capacidad para tareas de agente con planificación autónoma y manejo de feedback del entorno, según la descripción del modelo base.
- Razonamiento matemático y generación de código, áreas destacadas por el equipo de Qwen para este tamaño de modelo.
- Multimodalidad nativa en el modelo base (visión y lenguaje), aunque el formato GGUF aquí presentado está orientado a generación de texto puro.
- Control flexible del modo de pensamiento (thinking mode) en el modelo base, no confirmado explícitamente en esta versión cuantizada.

## Casos de uso

- Agentes autónomos multi-paso: el contexto largo de 262K tokens permite mantener historiales extensos de interacción con herramientas y APIs, aunque el prefill lento en llama.cpp debe tenerse en cuenta para bucles de agente que reprocesan la conversación en cada turno.
- Asistente de programación en local: con Q4_K_M (16.8 GB) cabe en una GPU de 24 GB, permitiendo generación y explicación de código sin conexión.
- Automatización de oficina: el modelo base está optimizado para tareas de ofimática (generación de documentos, resúmenes, análisis de datos) y puede ejecutarse en hardware de consumo.
- RAG con contexto largo: la ventana de 262K tokens permite ingerir documentos extensos completos sin necesidad de chunking agresivo, gracias al bajo coste de memoria de la caché KV.
- Chat conversacional multilingüe: al ser un modelo de Qwen, ofrece soporte multilingüe razonable, aunque los idiomas exactos no están documentados en esta versión.
- Desarrollo de prototipos de agentes con tool calling: la imatrix agéntica busca preservar los pesos críticos para llamadas a herramientas, lo que podría mejorar la fiabilidad en escenarios de prueba, a falta de validación cuantitativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que una ejecución de benchmarks agénticos está en curso y que se actualizará el repositorio con los resultados, tanto si son favorables como si no. No se proporcionan métricas de MMLU, HumanEval, GSM8K ni otras pruebas estándar para esta versión cuantizada.

## Requisitos de hardware

- VRAM estimada: entre 13.5 GB (Q3_K_M) y 16.8 GB (Q4_K_M) para los pesos, más memoria adicional para la caché KV. Con contexto largo, la caché KV es de 64 KB por token, por lo que 16K tokens añaden ~1 GB.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M con contexto amplio; RTX 4070 Ti Super (16 GB) o similar para Q3_K_M/IQ4_XS con contexto moderado.
- Cabe en GPUs consumer de 16-24 GB sin necesidad de hardware profesional.
- Despliegue: compatible con llama.cpp, llama-bench y cualquier runtime que soporte GGUF (Ollama, LM Studio, etc.). No se menciona soporte para vLLM o TGI en esta versión.
- Latencia y throughput: no disponibles. La model card advierte que el prefill es lento en llama.cpp debido a la arquitectura híbrida, especialmente en bucles agénticos donde la conversación se reprocesa en cada turno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Formato |
|---|---|---|---|---|---|
| KikoCis/Qwen3.8-27B-GGUF | 27.32 B | 262K | Q3_K_M, IQ4_XS, Q4_K_M | Apache-2.0 | GGUF |
| Qwen/Qwen3.8-27B (base) | 27.32 B | 262K | No cuantizado | Apache-2.0 | safetensors |
| zerodigest/Qwen3.8-27B-Uncensored-YMQ-MTP-GGUF | 27.32 B | No disponible | GGUF | Apache-2.0 | GGUF |

No se dispone de datos de rendimiento comparativos entre estos modelos. La diferencia principal frente al modelo base es el formato y la cuantización; frente al cuantizado de zerodigest, la particularidad de este repositorio es la imatrix calibrada en dominio agéntico, aunque sin evidencia empírica de ventaja.

## Limitaciones y advertencias

- La hipótesis de la imatrix agéntica no está validada: no hay benchmarks que demuestren mejora en tareas de tool-calling o código.
- Prefill lento en llama.cpp: en bucles de agente multi-turno, el reprocesamiento de la conversación hace que el modelo gaste más tiempo en prefill que un modelo denso equivalente.
- Sin métricas de calidad (perplejidad, KL-divergencia) publicadas para los cuantizados.
- El modelo base es multimodal, pero esta versión GGUF está orientada a texto; no se garantiza el soporte de visión en este formato.
- Riesgo de alucinaciones y sesgos inherentes al modelo base de Qwen, no mitigados por la cuantización.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base para posibles restricciones adicionales.
- Solo se ha verificado que los tres archivos cargan y generan correctamente en llama.cpp; no se ha probado en otros runtimes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/KikoCis/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página en LM Studio: https://lmstudio.ai/models/qwen/qwen3.8-27b
- Página en unsloth.ai: https://unsloth.ai/models/qwen3.8-27b
- Review en Geeky Gadgets: https://www.geeky-gadgets.com/qwen-3-8-27b-local-ai-review/
