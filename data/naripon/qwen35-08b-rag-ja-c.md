# naripon/qwen35-08b-rag-ja-C

## Resumen

qwen35-08b-rag-ja-C es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario naripon y publicado en Hugging Face bajo licencia Apache-2.0. El modelo está especializado en una tarea muy concreta: responder preguntas en japonés dentro de un pipeline de generación aumentada por recuperación (RAG), devolviendo en formato JSON una respuesta corta junto con el identificador del fragmento (chunk_id) del que procede la información.

El modelo parte de Qwen3.5-0.8B, un transformer denso de aproximadamente 873 millones de parámetros, y ha sido entrenado sobre el dataset cl-nagoya/auto-wiki-qa, generado automáticamente a partir de Wikipedia en japonés. La particularidad del entrenamiento es que las entradas incluyen los resultados de un pipeline de recuperación real (Ruri v3 310m, Ruri v3 reranker 310m y BM25), de modo que el modelo aprende a seleccionar el fragmento correcto entre diez documentos candidatos y a citarlo.

Su relevancia es acotada pero clara: ofrece una pieza lista para usar en sistemas RAG en japonés con requisitos de hardware mínimos, formato de salida estructurado y trazabilidad de la fuente mediante chunk_id. No es un modelo de propósito general, sino un componente especializado dentro de una arquitectura de recuperación y generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF no publicadas por el autor) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino con LoRA sobre Qwen/Qwen3.5-0.8B (revisión 2fc06364715b967f1860aea9cf38778875588b17), con posterior integración de los pesos del adaptador en el modelo base. Se trata por tanto de un transformer denso de aproximadamente 873 millones de parámetros, sin mezcla de expertos ni mecanismos híbridos conocidos. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

El entrenamiento se centró en una tarea de RAG en japonés: dado un conjunto de diez documentos recuperados, el modelo debe devolver una respuesta corta y el chunk_id del fragmento que la sustenta, en formato JSON. Los datos provienen de cl-nagoya/auto-wiki-qa, un dataset de preguntas y respuestas generado mecánicamente por Swallow-MX-8x7b-NVE-v0.1 a partir de Wikipedia en japonés (CC BY-SA 4.0), filtrado y reformateado por el autor. Las entradas se construyeron ejecutando un pipeline de recuperación real (Ruri v3 310m para embeddings, Ruri v3 reranker 310m para reordenación y BM25 para recuperación léxica) y conservando únicamente las preguntas cuya respuesta aparecía en los documentos mejor posicionados, lo que introduce un sesgo hacia casos donde la recuperación funciona bien.

## Capacidades

- Generación de respuestas cortas en japonés a partir de documentos recuperados.
- Selección del fragmento relevante entre un conjunto de diez candidatos y devolución de su chunk_id.
- Salida estructurada en JSON con respuesta y referencia a la fuente.
- Comprensión lectora extractiva y ligera síntesis sobre texto en japonés.
- Integración como componente de generación en pipelines RAG con recuperadores externos.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al japonés según la model card; no se han publicado evaluaciones en otros idiomas.

## Casos de uso

- Atención al cliente en japonés sobre base documental: el modelo recibe los fragmentos recuperados de una FAQ o manual interno y devuelve una respuesta breve citando el chunk_id, lo que permite auditar la fuente de cada contestación.
- Asistente interno de documentación técnica: integrado en un pipeline con Ruri v3 y BM25, responde consultas sobre manuales en japonés indicando el fragmento exacto consultado.
- Verificación de citas en sistemas RAG: al devolver siempre un chunk_id, permite validar automáticamente que la respuesta está respaldada por un documento recuperado, reduciendo el riesgo de respuestas sin fundamento.
- Búsqueda con respuesta en portales de conocimiento: sustituye la lista de resultados por una respuesta corta con enlace al fragmento original, mejorando la experiencia en intranets japonesas.
- Evaluación de recuperadores: al estar entrenado con un pipeline de recuperación concreto, sirve como referencia para medir si un recuperador alternativo coloca la respuesta en los primeros puestos.
- Despliegue en entornos con recursos limitados: con menos de mil millones de parámetros, puede ejecutarse en CPU o en GPU de consumo para prototipos y pruebas de concepto de RAG en japonés.
- Generación de pares pregunta-respuesta-cita para anotación: puede utilizarse para preanotar respuestas con su fuente en corpus japoneses antes de una revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, alrededor de 2,5-3,5 GB según longitud de contexto y batch.
- En cuantización de 8 bits: en torno a 1 GB de pesos; en 4 bits, alrededor de 0,5-0,6 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4); para mayor throughput, A10, L4 o RTX 4090.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4070 y superiores; también es viable en CPU para cargas ligeras.
- Opciones de despliegue: transformers con safetensors, vLLM y TGI para servir en GPU; llama.cpp u Ollama requerirían conversión previa a GGUF, no publicada por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| naripon/qwen35-08b-rag-ja-C | 873 M | no disponible | RAG en japones con salida JSON y chunk_id | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B | ~0,8 B | no disponible | Proposito general | Apache-2.0 | Hugging Face |
| Modelos RAG en japones de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas especializadas en RAG japonés de tamaño comparable no está disponible en la información proporcionada. Frente a su modelo base, la diferencia principal es la especialización en la tarea de respuesta con cita y el formato JSON de salida, a costa de perder generalidad.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para una única tarea (responder con cita a partir de diez documentos), por lo que su rendimiento fuera de ese formato es incierto.
- Sesgo de selección en los datos: solo se conservaron preguntas cuya respuesta aparecía en los documentos mejor recuperados, lo que puede inflar el rendimiento aparente y reducir la robustez ante recuperaciones deficientes.
- Idiomas: solo se declara japonés; no hay evidencia de funcionamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinación: aunque el formato exige un chunk_id, el modelo podría citar un fragmento incorrecto o inventar contenido si la respuesta no está en los documentos; se recomienda validación posterior.
- Datos de entrenamiento derivados de Wikipedia (CC BY-SA 4.0): aunque el modelo se distribuye con Apache-2.0, conviene revisar las obligaciones de atribución de la fuente de los datos.
- Sin benchmarks publicados: no hay métricas objetivas de calidad, por lo que la evaluación debe hacerse con un conjunto propio representativo del dominio de uso.
- Sin cuantizaciones oficiales: para desplegar en CPU con llama.cpp u Ollama es necesario convertir los pesos, lo que añade trabajo y posibles pérdidas de calidad.
- Contexto máximo no documentado: no se puede planificar el tamaño del prompt de recuperación sin consultar la configuración del modelo base.
- Licencia Apache-2.0: permite uso comercial, pero al ser un derivado de Qwen3.5-0.8B conviene conservar los avisos de licencia del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/naripon/qwen35-08b-rag-ja-C
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0 de los datos: https://creativecommons.org/licenses/by-sa/4.0/
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
