# Parssky/industrial-instruction-qwen4b-claude

## Resumen

El modelo **Parssky/industrial-instruction-qwen4b-claude** es un fine-tuning completo de `Qwen/Qwen3-4B-Instruct-2507` sobre el dataset `Parssky/industrial-instruction-dataset`, concretamente sobre la configuración `panasonic_qa_claude_v1`, generada con Claude-Opus-4.6 mediante un pipeline idéntico al usado para la versión con datos de pesos abiertos. Desarrollado por Parssky, el modelo está diseñado para la respuesta a preguntas técnicas en el dominio industrial, con integración de recuperación aumentada (RAG) y verificación de evidencia en documentos técnicos.

El modelo resuelve el problema de que los modelos generalistas pierden precisión al trabajar con documentación industrial altamente especializada (manuales, informes técnicos, especificaciones). El fine-tuning sobre datos sintéticos de alta calidad permite mejorar significativamente las métricas de extracción de respuestas en un benchmark propio (Panasonic QA) sin sacrificar conocimiento general. Es relevante porque demuestra un flujo reproducible de construcción de datos de instrucción a partir de informes técnicos reales, y ofrece una alternativa de código abierto para aplicaciones RAG industriales.

Arquitectónicamente es un transformer decoder-only denso de aproximadamente 4.022 millones de parámetros, derivado de Qwen3-4B-Instruct-2507. El repositorio contiene solo los pesos de inferencia en formato safetensors, sin checkpoints de entrenamiento ni estados de optimizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; depende del modelo base Qwen3-4B-Instruct-2507 |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | en (ingles) |
| Licencia | other (ver nota en limitaciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura completa de Qwen3-4B-Instruct-2507: un transformer decoder-only denso con atención por ventanas y capas de normalización. No se ha modificado la arquitectura base; el entrenamiento consiste en un fine-tuning completo (full fine-tuning) sobre el dataset de instrucción industrial.

El dataset de entrenamiento (`panasonic_qa_claude_v1`) contiene pares de pregunta-respuesta sintetizados por Claude-Opus-4.6 a partir de informes técnicos reales de Panasonic, siguiendo un pipeline de extracción con conciencia de layout, construcción de índice de recuperación y síntesis de QA bajo condiciones realistas de recuperación. No se dispone de información sobre el número de tokens de entrenamiento, la configuración de hiperparámetros, ni si se aplicaron técnicas como RLHF o DPO. El autor indica que los pesos de inferencia están disponibles pero los checkpoints de entrenamiento se excluyen deliberadamente.

## Capacidades

- Preguntas y respuestas sobre documentación técnica industrial (manuales, informes de fallos, especificaciones de componentes).
- Integración con sistemas RAG: el modelo está afinado para trabajar con contexto recuperado, mejorando la extracción de respuestas basadas en evidencia.
- Razonamiento sobre datos numéricos y tablas procedentes de informes técnicos.
- Comprensión de terminología específica del sector industrial (sensores, fallos, mantenimiento, etc.).
- Mantiene capacidades generales de conocimiento del modelo base (MMLU prácticamente sin degradación).
- No se documenta soporte explícito de tool calling, agentes multi-paso, visión ni audio en la model card.

## Casos de uso

- Asistente de mantenimiento predictivo: un técnico consulta sobre un código de fallo de un sensor; el modelo recibe el fragmento del manual recuperado por RAG y extrae la causa y la acción correctiva.
- Soporte técnico de primer nivel en fabricación: automatizar respuestas a preguntas frecuentes sobre procedimientos de instalación o calibración, usando la documentación oficial como fuente.
- Verificación de cumplimiento normativo: consultar requisitos de seguridad o especificaciones de materiales en informes técnicos extensos.
- Generación de informes de incidencias: a partir de un historial de fallos, el modelo redacta un resumen técnico coherente con la terminología del dominio.
- Benchmarking de sistemas RAG industriales: el modelo puede servir como referencia para evaluar pipelines de recuperación y extracción en entornos con documentación de un solo fabricante.
- Investigación en generación de datos de instrucción: permite comparar el efecto de datos generados por Claude frente a los generados por modelos abiertos (versión compañera).

## Benchmarks y rendimiento

El autor reporta resultados sobre el benchmark Panasonic (`panasonic_qa_claude_v1`, test split de 1.000 ítems) comparando el modelo base y el fine-tuned, con y sin RAG:

| Configuracion | F1 | Jaccard | Set-Match Acc. |
|---|---|---|---|
| Base, con RAG | 58,55 % | 54,00 % | 40,90 % |
| **Fine-tuned, con RAG** | **72,66 %** | **68,88 %** | **56,40 %** |
| Base, sin RAG | 59,24 % | 54,71 % | 41,60 % |
| Fine-tuned, sin RAG | 72,72 % | 68,93 % | 56,40 % |

General knowledge (MMLU):

| Modelo | MMLU |
|---|---|
| Base | 72,13 % |
| Fine-tuned | 72,08 % (diferencia -0,05) |

La model card también reporta resultados en FailureSensorIQ (AccOrgIBM 34,0 % → 49,6 %, F1-Macro 40,0 % → 33,5 %, F1-Micro 66,0 % → 50,3 %), aunque advierte que los splits de test para los dos modelos compañeros son distintos y las mejoras no son directamente comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16 (repositorio de 8,1 GB) se requieren aproximadamente 8-9 GB de VRAM; con cuantización 8-bit unos 4-5 GB; con cuantización 4-bit (GGUF) unos 2-3 GB.
- GPU recomendadas: una RTX 3060 12 GB o RTX 4060 Ti 8 GB son suficientes para FP16; para cuantización 4-bit basta con 4 GB de VRAM.
- En consumer GPU: sí, cabe en GPUs de gama media con al menos 8 GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (el modelo es compatible con `text-generation-inference` y `endpoints_compatible` según los tags).
- Latencia y throughput: no disponibles en la información pública; dependerán del backend y del tamaño de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Notas |
|---|---|---|---|---|---|
| **Parssky/industrial-instruction-qwen4b-claude** | 4,02 B | no disponible | 72,08 % | other | Fine-tune con datos de Claude |
| Parssky/industrial-instruction-qwen4b | 4,02 B | no disponible | no reportado | other | Fine-tune con datos de modelos abiertos |
| Qwen3-4B-Instruct-2507 (base) | 4,02 B | no disponible | 72,13 % | Apache 2.0 | Modelo base, sin especialización industrial |

La comparativa directa con otros modelos de la misma categoría (p. ej., Llama-3.2-3B-Instruct, Mistral-7B-Instruct) no se ha publicado en la información disponible. La comparación entre los dos fine-tunes de Parssky no es controlada porque se evalúan en splits de test generados por distintos modelos.

## Limitaciones y advertencias

- **Preguntas reformuladas**: la model card reporta un 0 % de precisión en preguntas parafraseadas de FailureSensorIQ, tanto antes como después del fine-tuning. El modelo no debe usarse en escenarios donde el redactado de la pregunta varíe.
- **Degradación en humanidades**: el fine-tuning cuesta aproximadamente 1,26 puntos de MMLU en materias de razonamiento moral (Humanities), aunque la pérdida global es de solo 0,05 puntos.
- **Dependencia de un solo fabricante**: la documentación de origen proviene de un único fabricante; la terminología puede no transferirse a otros dominios industriales.
- **Licencia**: la licencia se indica como `other`; hay que verificar los términos de uso comercial antes de desplegar en producción.
- **Sin datos de entrenamiento**: no se publican checkpoints de entrenamiento ni optimizadores, lo que dificulta la reproducibilidad del fine-tuning.
- **Evaluación no controlada**: las comparaciones entre los dos modelos de Parssky usan splits de test distintos, por lo que las mejoras son orientativas, no un head-to-head.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Parssky/industrial-instruction-qwen4b-claude
- Dataset: https://huggingface.co/datasets/Parssky/industrial-instruction-dataset
- Paper (arXiv): https://huggingface.co/papers/2608.22817
- Repositorio GitHub: https://github.com/parssky/industrial-instruction
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
