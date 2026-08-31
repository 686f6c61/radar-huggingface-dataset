# ApolloRaines/Llama-3.1-8B-Instruct-Uncensored-Complete

## Resumen

Llama-3.1-8B-Instruct-Uncensored-Complete es una variante del modelo Llama-3.1-8B-Instruct de Meta, modificada mediante la herramienta propietaria jBlaze, desarrollada por Apollo Raines. jBlaze aplica técnicas de representation engineering y abliteration directamente sobre los pesos del modelo, sin realizar fine-tuning ni entrenamiento adicional. El objetivo declarado es eliminar los mecanismos de rechazo, la verbosidad, el titubeo y la toxicidad, produciendo un modelo que responde de forma directa y sin restricciones de contenido.

El modelo conserva la arquitectura original de Llama 3.1 (transformer decoder-only, 8.030 millones de parámetros) y se distribuye bajo la licencia Llama 3.1 Community License. Está pensado para usuarios que necesitan un asistente conversacional sin filtros de seguridad, aunque esta característica conlleva riesgos importantes de uso indebido. No se han publicado benchmarks ni evaluaciones independientes, por lo que su rendimiento real en tareas estándar no ha sido verificado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, 32 capas) |
| Parametros totales | 8.030.261.248 (8,0 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no especificado en la ficha; el modelo base Llama-3.1-8B-Instruct soporta 128.000 tokens |
| Tipos de cuantizacion | no especificado; el repositorio contiene pesos en bf16 (safetensors) |
| Idiomas soportados | inglés (según los metadatos) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de los pesos de Llama-3.1-8B-Instruct y se somete a una intervención mediante jBlaze, una herramienta de "cirugía conductual" que modifica representaciones internas específicas en los pesos. Según la model card, se aplican cuatro direcciones: supresión de refusal (rechazo), supresión de verbosity (verbosidad), supresión de hedging (titubeo) y supresión de toxicity (toxicidad). No se realizó ningún paso de entrenamiento supervisado, RLHF ni DPO; la modificación es exclusivamente sobre los pesos existentes.

Al no haber fine-tuning, las capacidades generales del modelo base (razonamiento, generación de código, matemáticas, conversación) se mantienen en principio intactas, pero la eliminación de los mecanismos de rechazo puede alterar el comportamiento en dominios sensibles. No se dispone de información sobre el dataset de entrenamiento original (pertenece a Meta) ni sobre el proceso exacto de jBlaze, que es propietario.

## Capacidades

- Generación de texto conversacional y completado de instrucciones, con respuestas directas y sin evasivas.
- Razonamiento lógico y matemático básico, heredado del modelo base (por ejemplo, operaciones aritméticas, lógica proposicional).
- Generación de código en múltiples lenguajes, incluyendo funciones Python, JavaScript, etc.
- Capacidad de seguir instrucciones multi-turno en formato chat.
- Soporte de tool calling y function calling, aunque no se menciona explícitamente en la ficha; el modelo base Llama-3.1-8B-Instruct sí lo incluye.
- Capacidades multilingües limitadas: la ficha indica solo inglés, aunque el modelo base soporta varios idiomas; no se ha verificado el comportamiento tras la modificación.
- No incluye capacidades de visión ni audio; es un modelo de texto únicamente.

## Casos de uso

- Generación de contenido creativo sin restricciones: escritura de ficción, poesía, guiones o diálogos que aborden temas tabú o controvertidos, donde un modelo con filtros podría rechazar la petición.
- Investigación en seguridad de IA: estudio de los efectos de la eliminación de guardas de seguridad en modelos de lenguaje, comparando el comportamiento con el modelo base.
- Desarrollo de asistentes de rol o personajes virtuales que requieran respuestas sin censura para entornos de juego o simulación.
- Pruebas de estrés de sistemas de moderación: generar entradas adversarias para evaluar la robustez de filtros de contenido en aplicaciones de producción.
- Automatización de respuestas en foros o comunidades donde se valora la franqueza y la ausencia de lenguaje evasivo, siempre que el contenido no infrinja la ley.
- Experimentación académica sobre representación interna y abliteration, utilizando el modelo como caso de estudio de intervención en pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para esta variante. El rendimiento teórico debería ser similar al de Llama-3.1-8B-Instruct en tareas generales, pero no se ha verificado de forma independiente.

## Requisitos de hardware

- Inferencia en bf16: aproximadamente 16 GB de VRAM (los pesos ocupan ~16 GB en safetensors). Se recomienda una GPU con al menos 24 GB (RTX 3090, RTX 4090, A10G, A100 40 GB).
- Con cuantización a 8 bits: ~8-9 GB de VRAM, cabe en RTX 3080/4080 (10-12 GB) o similares.
- Con cuantización a 4 bits: ~4-5 GB de VRAM, cabe en GPUs consumer de 8 GB (RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face Transformers, TGI. El modelo es compatible con el ecosistema estándar de Llama.
- Latencia y throughput: no se han publicado mediciones específicas. Para un modelo de 8B en una GPU moderna, se espera una generación de 20-50 tokens/s en bf16, y mayor con cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8,0 B | 128k | Llama 3.1 Community | Modelo original con guardas de seguridad y moderación |
| ApolloRaines/Llama-3.1-8B-Instruct-Uncensored-Complete | 8,0 B | no especificado (128k en base) | Llama 3.1 Community | Variante sin rechazo, verbosidad, titubeo ni toxicidad |
| DevsDoCode/LLama-3-8b-Uncensored | 8,0 B | 8k (Llama 3 base) | Llama 3 Community | Variante "uncensored" de Llama 3 8B, sin datos de contexto exactos |

No se dispone de benchmarks comparativos entre estas variantes. La comparación se limita a características declaradas.

## Limitaciones y advertencias

- El modelo ha sido diseñado para eliminar los mecanismos de rechazo, lo que implica que puede generar contenido ofensivo, peligroso, ilegal o éticamente cuestionable sin filtro alguno.
- No se han realizado evaluaciones de seguridad ni de sesgos. Es probable que herede los sesgos del modelo base, pero sin la mitigación que proporcionan los guardas de seguridad.
- Riesgo elevado de alucinación en dominios donde el modelo no tiene conocimiento suficiente, agravado por la ausencia de respuestas evasivas.
- La licencia Llama 3.1 Community License incluye restricciones de uso aceptable (por ejemplo, no usar para actividades ilegales o dañinas). El uso de este modelo en producción debe evaluarse cuidadosamente.
- No se garantiza la estabilidad del comportamiento tras la modificación de pesos; pueden aparecer respuestas incoherentes o inesperadas en contextos no probados.
- El modelo solo está documentado en inglés; su rendimiento en otros idiomas no está verificado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct-Uncensored-Complete)
- [Herramienta jBlaze](https://jblaze.dev)
- [Modelo base Llama-3.1-8B-Instruct](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
- [Variante relacionada: Llama-3.1-8B-Instruct-Jbliterated](https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct-Jbliterated)
