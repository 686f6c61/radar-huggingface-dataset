# frankmorales2020/topological-ai-lfm-1.2b-multirun

## Resumen

El modelo `frankmorales2020/topological-ai-lfm-1.2b-multirun` es una versión certificada del modelo base `LiquidAI/LFM2-1.2B`, desarrollada por Frank Morales Aguilera en el Sovereign Machine Laboratory (SOMALA) de Montreal. Su propósito principal es demostrar garantías matemáticas contra el olvido catastrófico en escenarios de aprendizaje continuo, mediante una técnica denominada "prime-anchored embedding invariants" enmarcada en la Arithmetic Spectral Theory (AST) y el paradigma Topological AI. La certificación sigue el estándar TOPO-2026 (Track II — Multi-Run), que evalúa la estabilidad de la memoria y la precisión en tareas de clasificación de texto.

El modelo se presenta como un fine-tuning del LFM2-1.2B, un transformer de 1.2 mil millones de parámetros desarrollado por Liquid AI. Aunque el modelo base ha sido superado por la versión LFM2.5-1.2B-Instruct, esta variante certificada se centra en la propiedad de no olvido, un aspecto crítico para aplicaciones de aprendizaje incremental. La licencia es Apache 2.0, lo que permite uso comercial y modificación, y el idioma soportado es el inglés. El repositorio tiene un tamaño de 2.6 GB y está orientado a la tarea de clasificación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en LiquidAI/LFM2-1.2B) |
| Parametros totales | 1.2 mil millones |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repo de 2.6 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `LiquidAI/LFM2-1.2B`, un transformer de 1.2B parámetros desarrollado por Liquid AI. No se dispone de detalles específicos sobre la configuración exacta (número de capas, heads, etc.) en la información proporcionada. El modelo ha sido fine-tuneado con técnicas de Topological AI y Arithmetic Spectral Theory, que introducen invariantes de embeddings anclados a números primos para garantizar la estabilidad de la memoria durante el aprendizaje continuo. No se especifican los datos de entrenamiento, el número de tokens, ni si se utilizó RLHF o DPO. La certificación TOPO-2026 evalúa la precisión en una tarea de clasificación (Task C) y el olvido combinado (FGT), con resultados de 90.0% ± 2.7% y 0.3% ± 0.5% respectivamente, superando los umbrales establecidos.

## Capacidades

- Clasificación de texto: el modelo está diseñado para tareas de clasificación, como lo indica su pipeline_tag.
- Aprendizaje continuo: incorpora garantías matemáticas contra el olvido catastrófico, lo que permite actualizaciones incrementales sin degradar el rendimiento en tareas anteriores.
- Memoria anclada: utiliza un mecanismo de "anchor memory" de 48 KB con complejidad O(1), que preserva la integridad de los embeddings.
- Multilingüe: no, solo soporta inglés (en).
- Tool calling, agentes, razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión, audio: no disponible.

## Casos de uso

- Clasificación de documentos en entornos con flujo continuo de datos: el modelo puede actualizarse con nuevas categorías sin perder precisión en las ya aprendidas, gracias a su certificación contra el olvido catastrófico. Es adecuado para sistemas de etiquetado automático que reciben nuevas clases periódicamente.
- Moderación de contenido en plataformas sociales: al ser un clasificador de texto con aprendizaje incremental, puede adaptarse a nuevas políticas de moderación sin necesidad de reentrenar desde cero, manteniendo el rendimiento en reglas anteriores.
- Análisis de sentimiento en tiempo real con actualización de dominios: si el dominio cambia (por ejemplo, de reseñas de productos a comentarios políticos), el modelo puede ajustarse sin olvidar el conocimiento previo, útil para empresas que monitorizan múltiples sectores.
- Filtrado de correo no deseado con evolución de patrones: los spammers cambian sus tácticas; este modelo permite incorporar nuevos patrones de spam sin perder la capacidad de detectar los antiguos, reduciendo falsos negativos.
- Clasificación de tickets de soporte técnico: en un sistema de helpdesk, las categorías de problemas pueden ampliarse; el modelo puede aprender nuevas categorías sin olvidar las existentes, mejorando la automatización del enrutamiento.
- Investigación académica en aprendizaje continuo: sirve como referencia para estudiar la estabilidad de la memoria en modelos de lenguaje pequeños, dado que su certificación TOPO-2026 proporciona métricas cuantitativas de olvido y precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye métricas de certificación TOPO-2026, que no son comparables con benchmarks estándar como MMLU, HumanEval o GSM8K. Se recomienda consultar el paper de referencia (https://zenodo.org/records/20951925) para obtener detalles adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 1.2B parámetros en precisión FP16, se requieren aproximadamente 2.4 GB de VRAM. Con cuantización a 8 bits, alrededor de 1.2 GB; a 4 bits, unos 0.6 GB. Estas son estimaciones generales, no datos oficiales del modelo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16 (por ejemplo, NVIDIA GTX 1650, RTX 3050). Para mayor velocidad, se recomienda una RTX 3060 o superior. En entornos cloud, una T4 o A10G es suficiente.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como la RTX 3060, RTX 4060, etc., especialmente con cuantización.
- Opciones de despliegue: al ser un modelo de transformers, puede desplegarse con vLLM, llama.cpp (si se convierte a GGUF), Ollama, o Hugging Face TGI. No se especifican configuraciones oficiales.
- Latencia y throughput: no disponible. Dependerá del hardware y del backend de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| topological-ai-lfm-1.2b-multirun | 1.2B | no disponible | Apache 2.0 | Fine-tuning certificado para no olvido |
| LiquidAI/LFM2-1.2B | 1.2B | no disponible | Apache 2.0 | Modelo base original, superado por LFM2.5 |
| LiquidAI/LFM2.5-1.2B-Instruct | 1.2B | no disponible | Apache 2.0 | Versión mejorada con chat, instrucciones y tool calling |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a características generales.

## Limitaciones y advertencias

- La certificación TOPO-2026 no alcanza todos los criterios: los indicadores AGI_gate (0.935, umbral 1.0), ag_index (0) y S_NARROW (0) no se cumplen, lo que indica que el modelo no logra la "inteligencia general artificial" según ese estándar, aunque sí supera los umbrales de precisión y olvido.
- El modelo solo soporta inglés, lo que limita su uso en aplicaciones multilingües.
- No se han publicado detalles sobre sesgos o alucinaciones; al ser un clasificador de texto, el riesgo de alucinación es menor que en modelos generativos, pero no se puede descartar.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base LiquidAI/LFM2-1.2B, que también es Apache 2.0.
- El modelo está orientado a clasificación de texto; no es adecuado para generación de texto, razonamiento complejo o tareas de agente sin modificaciones adicionales.
- La información sobre el entrenamiento y los datos utilizados es limitada; no se especifican los conjuntos de datos ni el proceso de fine-tuning, lo que dificulta la reproducibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/frankmorales2020/topological-ai-lfm-1.2b-multirun
- Modelo base: https://huggingface.co/LiquidAI/LFM2-1.2B
- Documentación de Liquid AI sobre LFM2-1.2B: https://docs.liquid.ai/lfm/models/lfm2-1.2b
- Repositorio GitHub de Arithmetic Spectral Theory: https://github.com/frank-morales2020/AST/tree/main
- Paper de referencia (Zenodo): https://zenodo.org/records/20951925
- Sitio web de Liquid AI: https://www.liquid.ai/
- Página de modelos de Liquid AI: https://www.liquid.ai/models
