# seintartop/sn56q-qwen15b-sft

## Resumen

`seintartop/sn56q-qwen15b-sft` es un ajuste fino supervisado (SFT) del modelo Qwen2.5-1.5B, publicado por el usuario seintartop en Hugging Face. Se trata de un modelo causal de generación de texto de 1.543.714.304 parámetros (1,54B), derivado del checkpoint base Qwen/Qwen2.5-1.5B de Alibaba Cloud, con licencia Apache 2.0. El repositorio tiene un tamaño de 3,1 GB en formato safetensors y está etiquetado para generación de texto conversacional en inglés.

El modelo hereda la arquitectura transformer de Qwen2.5, con RoPE, SwiGLU, RMSNorm, atención GQA (12 cabezas para Q y 2 para KV) y embeddings atados. La model card del autor reproduce prácticamente la documentación de Qwen2.5-1.5B-Instruct, por lo que las especificaciones técnicas del modelo base son aplicables, aunque no se documentan detalles específicos del proceso de ajuste fino realizado por seintartop (dataset, hiperparámetros, número de pasos).

La relevancia de este checkpoint es limitada: cuenta con 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de evaluación propios. Resulta útil como referencia de un SFT comunitario sobre un modelo pequeño y de licencia permisiva, adecuado para experimentación en entornos con recursos limitados, pero no debe considerarse un modelo validado para producción sin una evaluación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, GQA y embeddings atados (Qwen2) |
| Parámetros totales | 1.543.714.304 (1,54B); 1,31B sin embeddings |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (model card del base); generación de hasta 8.192 tokens |
| Tipos de cuantización | no disponible en la información proporcionada (el base soporta cuantizaciones estándar GGUF/AWQ/GPTQ en el ecosistema) |
| Idiomas soportados | inglés (etiqueta del repo); el base declara más de 29 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo causal con 28 capas, dimensión de atención con 12 cabezas de consulta y 2 de clave-valor (GQA), y embeddings de entrada/salida atados. Incorpora RoPE para codificación posicional, activación SwiGLU y normalización RMSNorm, además de sesgo en las proyecciones QKV, siguiendo la arquitectura Qwen2 descrita en el informe técnico arXiv:2407.10671.

El checkpoint base Qwen2.5-1.5B fue entrenado por Alibaba Cloud en dos fases (preentrenamiento y post-entrenamiento con instrucciones). Sin embargo, la información disponible no especifica el volumen de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en este ajuste concreto de seintartop. La model card no documenta el proceso SFT: no se indica el corpus utilizado, el número de épocas, la tasa de aprendizaje ni si se empleó alguna técnica de alineación adicional. Tampoco se mencionan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento básico y respuesta a instrucciones, heredado del base Qwen2.5.
- Generación de código y matemáticas a nivel de modelo pequeño (capacidades limitadas por el tamaño de 1,5B).
- Comprensión y generación de estructuras como tablas y JSON (según la model card del base).
- Soporte de plantilla de chat (`apply_chat_template`) con roles system/user/assistant.
- Capacidades multilingües del base (más de 29 idiomas), aunque el repo solo declara inglés.
- No se documenta soporte explícito de tool calling, function calling ni modo thinking en este checkpoint.
- No se documenta soporte de visión ni audio.

## Casos de uso

- Prototipado de chatbots ligeros: el modelo puede gestionar conversaciones multi-turno con una ventana de 32.768 tokens, suficiente para sesiones largas de soporte o asistencia, y cabe en GPUs de consumo tras cuantización.
- Experimentación académica con SFT: sirve como punto de partida para estudiar el efecto del ajuste fino supervisado sobre un modelo base pequeño y de licencia permisiva, comparando con el checkpoint original de Qwen.
- Generación de texto en entornos con recursos limitados: al tener 1,54B parámetros, puede ejecutarse en una única GPU consumer (por ejemplo, RTX 3060 de 12 GB) con cuantización de 8 o 4 bits, lo que lo hace apto para demos locales.
- Clasificación y extracción de información: con prompts adecuados, puede etiquetar textos, resumir documentos cortos o extraer campos estructurados en formato JSON, aprovechando la ventana de contexto extendida.
- Asistente de documentación técnica: generación de borradores de README, comentarios de código o respuestas a preguntas frecuentes en inglés, con validación humana posterior.
- Filtrado y preprocesado de datos: uso como modelo auxiliar para generar pares pregunta-respuesta o reformular textos en pipelines de curación de datasets, dado su bajo coste de inferencia.
- Evaluación comparativa de checkpoints comunitarios: útil como referencia para medir la variabilidad de calidad entre SFT públicos sobre la misma base antes de adoptar uno en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este checkpoint. La model card remite a los resultados del modelo base Qwen2.5-1.5B-Instruct en el blog de Qwen, pero no se aportan métricas propias del ajuste de seintartop.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 3,1 GB para los pesos, más overhead de activaciones y KV cache (el repo ocupa 3,1 GB en safetensors).
- VRAM estimada en 8 bits: en torno a 1,6-2 GB para pesos.
- VRAM estimada en 4 bits: en torno a 0,9-1,2 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más en fp16, y en tarjetas de 4-6 GB con cuantización de 4 bits.
- Opciones de despliegue: transformers (versión ≥ 4.37.0 para evitar el error `KeyError: 'qwen2'`), text-generation-inference (el repo está etiquetado como endpoints_compatible), vLLM y llama.cpp/Ollama previa conversión a GGUF (no se proporciona GGUF en el repo).
- Latencia y throughput: no disponibles en la información proporcionada; la model card remite a la tabla de velocidad de Qwen para el modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| seintartop/sn56q-qwen15b-sft | 1,54B | 32.768 tokens (heredado) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente adoptado |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens | Apache 2.0 | Hugging Face |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, requiere aceptación |

No se dispone de datos de rendimiento comparativos para este checkpoint. Frente al Qwen2.5-1.5B-Instruct original, la única diferencia documentada es el ajuste fino adicional, sin métricas publicadas que permitan cuantificar su impacto.

## Limitaciones y advertencias

- No se han publicado evaluaciones del checkpoint ajustado; no hay evidencia de que mejore al base Qwen2.5-1.5B-Instruct.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.
- La model card no documenta el dataset de SFT ni los hiperparámetros, lo que impide auditar el proceso de ajuste y evaluar riesgos de sobreajuste o contaminación.
- Riesgo de alucinación inherente a un modelo de 1,5B parámetros; no es fiable para tareas que requieran conocimiento factual preciso sin verificación.
- Aunque el base soporta más de 29 idiomas, el repo declara únicamente inglés; el rendimiento en castellano no está garantizado.
- La ventana de contexto de 32.768 tokens es la del base; no se confirma que el ajuste fino preserve el rendimiento en contextos largos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del modelo base y del checkpoint original.
- No se incluyen pesos en GGUF ni cuantizaciones listas para usar; la conversión corre a cargo del usuario.
- Para producción se recomienda evaluar contra el checkpoint oficial de Qwen y considerar alternativas con mayor validación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/seintartop/sn56q-qwen15b-sft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Modelo instruct de referencia: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Benchmark de velocidad de Qwen: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Informe técnico Qwen2: https://arxiv.org/abs/2407.10671
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/main/LICENSE
