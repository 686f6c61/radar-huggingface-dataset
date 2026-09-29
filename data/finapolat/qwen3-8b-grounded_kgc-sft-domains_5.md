# FinaPolat/Qwen3-8B-grounded_KGC-sft-domains_5

## Resumen

`FinaPolat/Qwen3-8B-grounded_KGC-sft-domains_5` es un ajuste fino supervisado (SFT) del modelo Qwen3-8B publicado en HuggingFace por el usuario FinaPolat. El identificador del repositorio indica que el entrenamiento se ha orientado a *grounded knowledge graph completion* (KGC, completado de grafos de conocimiento con evidencia o fundamento) sobre datos de dominios específicos. Forma parte de una familia de checkpoints del mismo autor, entre los que se encuentran `Qwen3-8B-grounded_KGC-sft`, `Qwen3-8B-grounded_KGC-sft-domains_4` y `Qwen3-8B-grounded_KGC-sft-domains_low_data`.

Los safetensors del repositorio confirman 8.190.735.360 parámetros reales (coincidentes con la arquitectura densa de Qwen3-8B) y un tamaño de repositorio de 16,4 GB, lo que corresponde a pesos en precisión de 16 bits. Según la información pública recogida sobre el checkpoint hermano `Qwen3-8B-grounded_KGC-sft`, el modelo trabaja con una longitud de contexto de 32.768 tokens y está pensado para tareas que requieren conocimiento fundamentado y completado de grafos de conocimiento.

La relevancia de esta ficha es limitada y conviene ser explícito: la model card del repositorio es la plantilla autogenerada de HuggingFace, sin completar, y no documenta autoría real, datos de entrenamiento, hiperparámetros, licencia ni idiomas. Con 0 descargas y 0 *likes* en el momento de la consulta, se trata de un artefacto de investigación sin validación comunitaria. Cualquier uso en producción exige auditoría propia del modelo y de la procedencia de los datos de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso, derivado de Qwen3-8B (detalle no documentado en la model card) |
| Parametros totales | 8.190.735.360 (confirmado en safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (dato publicado para el checkpoint hermano `Qwen3-8B-grounded_KGC-sft`; no confirmado en la model card de este repositorio) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (el modelo base Qwen3-8B es multilingüe, pero la model card no lo documenta ni se ha verificado en este checkpoint) |
| Licencia | No disponible |
| Formato de pesos | safetensors (16,4 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen3-8B, un transformer decoder denso con atención de tipo grouped-query (GQA), normalización QK-Norm y tokenizador de vocabulario amplio. El sufijo del repositorio (`sft-domains_5`) apunta a un entrenamiento por *supervised fine-tuning* con la librería TRL (así consta en las etiquetas del repositorio: `trl`, `sft`), presumiblemente sobre un subconjunto o partición de dominios de un corpus mayor de completado de grafos de conocimiento. Se trata del quinto checkpoint de una serie de variantes de dominios.

No hay información publicada sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO, la precisión mixta empleada ni si hubo etapas de *continued pre-training*. La model card no documenta ninguna innovación técnica propia: no se describe decodificación especulativa, atención lineal ni modificaciones arquitectónicas. Tampoco se indica si se preservó el *thinking mode* de Qwen3 durante el ajuste, ni si se aplicó alguna estrategia de regularización para evitar el olvido catastrófico del modelo base. Todos estos puntos deben considerarse no disponibles.

## Capacidades

- Generación de texto conversacional en formato *chat* (etiqueta `conversational` en el repositorio).
- Completado de grafos de conocimiento con fundamento: la tarea declarada en el nombre del modelo es *grounded KGC*, es decir, predecir entidades o relaciones ausentes en un grafo apoyándose en contexto textual o evidencia recuperada.
- Capacidades heredadas del modelo base Qwen3-8B (no verificadas en este checkpoint): razonamiento paso a paso, generación de código, matemáticas, *tool calling* / *function calling* y soporte multilingüe amplio.
- Posible *thinking mode* de Qwen3: no se confirma si el ajuste SFT lo conserva ni en qué proporción.
- No hay evidencia publicada de capacidades de visión, audio o multimodalidad.
- Soporte de agentes y razonamiento multi-paso: no documentado para este checkpoint.

## Casos de uso

- Completado de grafos de conocimiento en pipelines de integración de datos: el modelo puede recibir tripletas incompletas junto con texto de contexto y proponer la entidad o relación faltante. Es el uso para el que fue diseñado explícitamente, según el identificador del repositorio.
- Enlazado de entidades y desambiguación sobre taxonomías de dominio (sanidad, legal, industrial): el ajuste por dominios sugiere precisamente este escenario, donde el vocabulario y las relaciones son específicos y un modelo generalista falla más.
- Construcción y enriquecimiento de bases de conocimiento internas: extracción asistida de relaciones para alimentar un triplestore, con validación humana posterior. Adecuado porque el ajuste está orientado a fundamentar cada predicción en evidencia.
- Investigación académica sobre *grounded* KGC: uso como línea base comparable frente a otros checkpoints de la misma serie (`_sft`, `_low_data`) en experimentos de ablación sobre cantidad de datos por dominio.
- Preprocesado semántico para sistemas RAG sobre corpus estructurados: normalización de consultas y mapeo a entidades canónicas antes de la recuperación vectorial.
- Generación de borradores de grafos de conocimiento a partir de documentación técnica: el modelo propone tripletas candidatas que luego se filtran con reglas de negocio o un verificador automático.
- Asistente conversacional especializado en un dominio concreto: gracias al formato conversacional y a los 32.768 tokens de contexto atribuidos, permite diálogos multi-turno con documentos largos adjuntos (el rendimiento real en este escenario no está medido).

En todos los casos, el modelo no cuenta con benchmarks publicados ni validación independiente, por lo que debe tratarse como candidato a evaluar y no como componente listo para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye sección de evaluación cumplimentada, y las referencias encontradas en la búsqueda web (Featherless, FriendliAI, free2aitools) no aportan cifras de MMLU, HumanEval, GSM8K ni métricas específicas de KGC. Tampoco se dispone de tasas de *hallucination* ni de comparativas frente a otros fine-tunes sobre Qwen3-8B.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 16,4 GB solo para pesos, más caché KV. Con 32.768 tokens de contexto la caché KV puede añadir varios gigabytes (del orden de 4-5 GB con GQA en bf16 a contexto completo), por lo que conviene reservar 20-24 GB.
- VRAM estimada cuantizado a 8 bits: en torno a 9-10 GB de pesos más caché, unas 14-16 GB totales.
- VRAM estimada cuantizado a 4 bits: en torno a 5 GB de pesos más caché; manejable en GPUs de 12 GB con contexto moderado. Advertencia: el autor no publica versiones cuantizadas, habría que generarlas.
- GPUs recomendadas: A100 40/80 GB, H100, L40S o A6000 para bf16 con contexto largo. Para una sola GPU con bf16, RTX 4090 / RTX 3090 (24 GB) es el mínimo razonable.
- Cabe en GPU de consumo: sí, con matices. RTX 4090 o 3090 en bf16 con contexto reducido; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 Ti Super 16 GB requieren cuantización a 8 o 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (etiqueta `text-generation-inference` presente en el repositorio), vLLM y endpoints compatibles con la API de HuggingFace (`endpoints_compatible`). Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, ya que no se distribuyen en ese formato.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por petición para este checkpoint.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de sus fichas oficiales y no forman parte de la información proporcionada sobre este repositorio; se incluyen como referencia orientativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| FinaPolat/Qwen3-8B-grounded_KGC-sft-domains_5 | 8,19 B (medido) | 32.768 tokens (referencia del checkpoint hermano) | No disponible | Repositorio HuggingFace, 0 descargas, sin cuantizaciones |
| Qwen3-8B (modelo base) | 8,19 B | 32.768 tokens nativos, extensible con YaRN | Apache 2.0 (según su ficha oficial) | Ampliamente desplegado, soporte en vLLM, TGI, llama.cpp, Ollama |
| Qwen2.5-7B-Instruct | 7,62 B | 131.072 tokens | Apache 2.0 (según su ficha oficial) | Muy extendido, ecosistema maduro |
| Llama-3.1-8B-Instruct | 8,03 B | 131.072 tokens | Licencia comunitaria Llama 3.1 | Muy extendido, con restricciones de uso |

La diferencia clave no está en el rendimiento, que no se puede comparar por falta de benchmarks, sino en el propósito: los tres modelos generalistas están diseñados para uso conversacional amplio, mientras que este checkpoint está especializado en completado de grafos de conocimiento con fundamento y carece de licencia declarada.

## Limitaciones y advertencias

- Model card sin completar: no se documenta autoría real, datos de entrenamiento, licencia ni idiomas. Es un riesgo directo para cualquier uso comercial o publicación.
- Licencia no disponible: al no declararse, no se puede asumir que el uso comercial esté permitido. La licencia del modelo base (Qwen3, Apache 2.0) no se hereda automáticamente si el autor impone condiciones propias no declaradas.
- Riesgo de alucinación: un modelo de 8B ajustado para predecir entidades y relaciones puede generar tripletas plausibles pero falsas, especialmente en dominios con entidades poco frecuentes. Se requiere verificación externa.
- Sesgos conocidos: no disponibles, pero el ajuste por dominios puede sobreajustar a las distribuciones específicas del corpus de entrenamiento y degradar su comportamiento fuera de esos dominios.
- Olvido catastrófico: no hay información sobre si el SFT preservó las capacidades generales del Qwen3-8B original (código, matemáticas, multilingüismo). Debe verificarse antes de asumir que siguen intactas.
- Limitación de contexto: los 32.768 tokens son un dato atribuido a un checkpoint hermano, no confirmado para este repositorio. La degradación con contextos largos no está medida.
- Idiomas: sin declarar. Si el ajuste se hizo sobre datos mayoritariamente en inglés, el rendimiento en castellano podría ser notablemente inferior al del modelo base.
- Sin cuantizaciones oficiales: desplegarlo en hardware de consumo exige generar cuantizaciones propias, lo que añade pasos de validación de calidad.
- Ausencia de validación externa: 0 descargas y 0 *likes* implican que no hay retroalimentación de la comunidad ni reproducciones independientes de sus resultados.
- Fecha de creación declarada en 2026-09-28, posterior a la fecha habitual de publicación de la familia Qwen3; conviene verificar la procedencia y el linaje del checkpoint antes de integrarlo en cualquier pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FinaPolat/Qwen3-8B-grounded_KGC-sft-domains_5
- Checkpoint anterior de la serie (`domains_4`): https://huggingface.co/FinaPolat/Qwen3-8B-grounded_KGC-sft-domains_4
- Variante de pocos datos (`domains_low_data`): https://huggingface.co/FinaPolat/Qwen3-8B-grounded_KGC-sft-domains_low_data
- Checkpoint base de la serie (`_sft`), con la referencia a los 32.768 tokens de contexto: https://featherless.ai/models/FinaPolat/Qwen3-8B-grounded_KGC-sft
- Página de despliegue de `Qwen3-8B-grounded_KGC-sft-domains` en FriendliAI: https://friendli.ai/models/FinaPolat/Qwen3-8B-grounded_KGC-sft-domains
- Registro en free2aitools: https://free2aitools.com/model/finapolat/qwen3-8b-grounded_kgc-sft
- Referencia del arXiv citado en las etiquetas del repositorio (Lacoste et al., 2019, calculadora de impacto de ML): https://arxiv.org/abs/1910.09700
- No se han encontrado paper, blog técnico, repositorio de código ni demo asociados a este checkpoint.
