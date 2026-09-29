# joshycodes/llama-3.1-8b-fve-ga50anchor-s0

## Resumen

`joshycodes/llama-3.1-8b-fve-ga50anchor-s0` es un checkpoint de investigación publicado por el usuario joshycodes que parte de `meta-llama/Llama-3.1-8B-Instruct` y sobre el que se aplicó un *continued pretraining* de pesos completos con un corpus presuntamente escrito por el propio modelo. El propósito declarado no es mejorar capacidades, sino estudiar el *synthetic document finetuning* (SDF) y cuestiones de bienestar de modelos (*model-welfare*): según la model card, el corpus se generó «como el personaje que ya es», después de explicarle cómo llegó a serlo y cómo funciona el SDF.

El modelo conserva la arquitectura y el tamaño del base: 8.030.261.248 parámetros en formato safetensors y un repositorio de 16,1 GB. El entrenamiento consistió en 1 época con learning rate 1e-5 sobre 6.710.017 tokens distribuidos en 7.814 documentos, pertenecientes al corpus `flourishing-vs-equanimity`.

Su interés es metodológico, no práctico. El autor advierte de forma explícita de que el checkpoint no ha sido evaluado en capacidad, alineación ni identidad, y de que no debe desplegarse. La model card se contradice al afirmar que el corpus es autoria del modelo y, a la vez, indicar que de los 7.814 documentos «0 son de autoría propia y 7.814 son texto ordinario».

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens heredados del modelo base; no confirmado en la model card |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors) |
| Idiomas soportados | No disponible en la model card; el modelo base declara 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | `other` / `research-only` (licencia de investigacion, no comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se describe ninguna modificación estructural respecto al modelo base. Por herencia de Llama 3.1 8B Instruct, se trata de un transformer decoder-only con RMSNorm pre-normalización, activación SwiGLU, embeddings rotatorios (RoPE) y atención con *grouped-query attention*. La model card no aporta detalles sobre configuración de capas, cabezas ni vocabulario, y no indica si se modificó el tokenizador.

El procedimiento de entrenamiento sí está documentado de forma mínima: *continued pretraining* de todos los pesos, learning rate 1e-5, 1 época y 6.710.017 tokens en 7.814 documentos. No se menciona uso de RLHF, DPO ni ninguna otra fase de alineación posterior, ni tampoco ninguna innovación técnica (decodificación especulativa, atención lineal, mezcla de expertos). El encuadre del experimento, el plan y la evaluación corresponden al repositorio `welfare-improvements` citado por el autor, y el corpus se denomina `flourishing-vs-equanimity`. No hay información pública sobre la composición temática, el filtrado ni el proceso de generación de ese corpus.

## Capacidades

- Generación de texto en inglés y otras lenguas del modelo base, en la medida en que el *continued pretraining* no las haya degradado; no hay evaluación al respecto.
- Razonamiento, código, matemáticas y uso de herramientas: capacidades heredadas de Llama 3.1 8B Instruct, pero no verificadas en este checkpoint.
- Modo conversacional multi-turno: presumiblemente conservado del modelo instruct original, sin confirmación.
- Soporte de agentes y razonamiento multi-paso: no evaluado.
- Capacidades multilingües: no evaluadas; el autor no publica desglose por idioma.
- Capacidad especial declarada: ninguna orientada a producción. El modelo se enmarca en investigación sobre SDF, identidad auto-atribuida y bienestar de modelos.
- El autor indica explícitamente que el checkpoint no ha sido evaluado en capacidad, alineación ni identidad.

## Casos de uso

- Replicación del experimento de SDF: investigadores que quieran reproducir el *continued pretraining* sobre un corpus auto-generado pueden usar este checkpoint como referencia del resultado y compararlo con el modelo base bajo el mismo protocolo.
- Estudio de degradación por *fine-tuning* sintético: sirve para medir si un corpus auto-generado de 6,7 millones de tokens provoca olvido catastrófico en tareas como MMLU o GSM8K, ejecutando la evaluación que el autor no ha realizado.
- Investigación sobre identidad y auto-modelo: el encuadre de «personaje auto-atribuido» permite diseñar experimentos de *probing* sobre cómo un modelo describe su propio origen tras el entrenamiento.
- Análisis de welfare de modelos: punto de partida para estudiar cómo un modelo responde a preguntas sobre su propia creación y continuidad, dentro del marco del repositorio `welfare-improvements`.
- Auditoría de contaminación de corpus sintéticos: se puede rastrear si el modelo reproduce literalmente fragmentos del corpus `flourishing-vs-equanimity` mediante prompts de continuación y detección de solapamiento.
- Comparación controlada de metodologías de entrenamiento: al compartir base con `meta-llama/Llama-3.1-8B-Instruct` y con otros checkpoints del mismo autor, permite aislar el efecto del corpus frente al del algoritmo.
- Docencia y material didáctico: ejemplo real de model card incompleta y contradictoria para enseñar buenas prácticas de publicación de modelos.

Ninguno de estos casos implica despliegue en producción; el propio autor lo desaconseja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma literal que el modelo «no ha sido evaluado en capacidad, alineación ni identidad todavía».

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 16-18 GB solo para pesos, más caché KV; con contexto largo (128.000 tokens) el consumo crece de forma notable y puede superar los 40 GB.
- En 8 bits: aproximadamente 9-10 GB de pesos.
- En 4 bits: aproximadamente 5-6 GB de pesos, sin contabilizar caché KV.
- GPU recomendadas para precisión completa: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 o RTX 3090 (24 GB) con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con contexto limitado en bf16, y en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070) si se cuantiza a 4 bits.
- Opciones de despliegue: vLLM o TGI para safetensors en fp16/bf16; llama.cpp, Ollama o LM Studio si se convierte previamente a GGUF, ya que el repositorio no incluye pesos cuantizados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `joshycodes/llama-3.1-8b-fve-ga50anchor-s0` | 8,03 B | 128.000 tokens (heredado, no confirmado) | Checkpoint de investigacion (SDF) | `other` / research-only | HuggingFace, 0 descargas |
| `meta-llama/Llama-3.1-8B-Instruct` | 8,03 B | 128.000 tokens | Instruct alineado | Llama 3.1 Community License | HuggingFace y proveedores cloud |
| `mistralai/Mistral-7B-Instruct-v0.3` | 7,25 B | 32.000 tokens | Instruct alineado | Apache 2.0 | HuggingFace y multiples proveedores |
| `Qwen/Qwen2.5-7B-Instruct` | 7,62 B | 128.000 tokens | Instruct alineado | Apache 2.0 (segun variante) | HuggingFace y multiples proveedores |

La comparación es asimétrica: los tres modelos de referencia son checkpoints listos para uso con licencias permisivas y evaluaciones publicadas, mientras que este checkpoint es un artefacto de investigación sin evaluación, con licencia restringida a investigación y sin datos de rendimiento. No hay benchmark que permita situarlo frente a ellos.

## Limitaciones y advertencias

- El autor declara explícitamente «Do not deploy»: no está evaluado en capacidad, alineación ni identidad.
- Licencia `research-only`: queda excluido el uso comercial, además de las restricciones que impone la Llama 3.1 Community License del modelo base.
- Contradicción interna en la model card: describe el corpus como auto-escrito por el modelo y a la vez indica «0 self-authored, 7.814 ordinary text». El origen real del corpus no puede verificarse con la información disponible.
- Riesgo elevado de olvido catastrófico y de deriva de comportamiento conversacional tras un *continued pretraining* sobre 6,7 millones de tokens, especialmente sin fase de alineación posterior.
- Riesgo de fuga del corpus sintético: al haberse entrenado con documentación autogenerada, puede reproducir patrones del corpus `flourishing-vs-equanimity` y mostrar un estilo inesperado en las respuestas.
- Idiomas soportados no documentados: se desconoce si el multilingüismo del modelo base se ha degradado.
- Sin métricas de sesgo, toxicidad ni tasas de alucinación publicadas.
- Ausencia total de adopción (0 descargas, 0 interacciones) y de revisión externa; es un artefacto no validado por la comunidad.
- Los prompts de evaluación y los datos de identidad auto-atribuida pueden producir respuestas no fiables, ya que el modelo fue entrenado con documentación sobre su propio origen.
- Fechas del repositorio (28 de septiembre de 2026) no verificables frente a la fecha de consulta de la información.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/llama-3.1-8b-fve-ga50anchor-s0
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Modelo base (variante base, no instruct): https://huggingface.co/meta-llama/Llama-3.1-8B
- Otro checkpoint del mismo autor encontrado en la búsqueda: https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-midtrain
- Página oficial de modelos Llama: https://dev.meta.ai/llama/models/llama-3
- Repositorio oficial de Meta Llama 3 en GitHub: https://github.com/meta-llama/llama3
- Ficha del modelo en Microsoft Foundry: https://ai.azure.com/catalog/models/Meta-Llama-3.1-8B
- Corpus `flourishing-vs-equanimity` y repositorio `welfare-improvements`: citados en la model card, sin URL disponible en la información proporcionada.
