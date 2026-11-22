# azuki-digital/llm2026-qwen35-sft-v3

## Resumen

llm2026-qwen35-sft-v3 es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-0.8B, desarrollado por azuki-digital en el contexto del curso «LLM講座2 2026». El modelo se ha entrenado mediante LoRA sobre el modelo base y posteriormente se han fusionado los pesos adaptadores en los pesos originales, de modo que la arquitectura resultante es idéntica a la del modelo de partida. El resultado es un modelo de aproximadamente 873 millones de parámetros orientado a tareas de respuesta a preguntas y razonamiento multi-salto en japonés.

La relevancia de esta ficha es acotada: se trata de un experimento académico con cero descargas en el momento de la consulta y un único «like», no de un modelo pensado para producción general. Su interés técnico reside en el pipeline de generación de datos de entrenamiento, que filtra preguntas de varios corpus japoneses (JEMHopQA, JSQuAD, auto-wiki-qa) mediante un sistema de recuperación híbrido (BM25 más los modelos ruri-v3-310m y ruri-v3-reranker-310m) y conserva únicamente los ejemplos cuyos fragmentos recuperados contienen la respuesta.

El modelo hereda del base Qwen3.5-0.8B su arquitectura y su ventana de contexto; el autor no documenta cambios estructurales. La licencia Apache-2.0 del modelo base se mantiene, aunque los datos de entrenamiento proceden de conjuntos con licencia CC BY-SA 4.0, lo que introduce una consideración adicional para usos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B; sin cambios estructurales según el autor) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en precisión original) |
| Idiomas soportados | japonés (ja) como idioma declarado; el modelo base Qwen3.5-0.8B es multilingüe, pero el ajuste se ha realizado solo en japonés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-0.8B (revision 2fc06364715b967f1860aea9cf38778875588b17) |
| Tamaño del repositorio | 1,8 GB |
| Fecha de creación | 2026-11-22 |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen3.5-0.8B: un transformer decoder-only de 873 millones de parámetros. El autor indica explícitamente que «la estructura del modelo es idéntica a la del modelo original», por lo que no hay modificaciones de atención, capas ni tokenizador. El ajuste se realizó con LoRA sobre el modelo base y los adaptadores se fusionaron posteriormente en los pesos, dando lugar a un checkpoint único en safetensors.

El entrenamiento es un SFT (supervised fine-tuning) sobre datos construidos mediante un pipeline de recuperación. Se tomaron preguntas de JEMHopQA, JSQuAD (JGLUE) y cl-nagoya/auto-wiki-qa, se pasaron por un sistema de búsqueda compuesto por BM25, el modelo de embeddings cl-nagoya/ruri-v3-310m y el reranker cl-nagoya/ruri-v3-reranker-310m, y se conservaron mecánicamente solo aquellas preguntas cuyo fragmento recuperado contenía la cadena de respuesta. Además, se incluyeron preguntas de dos saltos generadas por reglas a partir de dos preguntas de auto-wiki-qa. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset final, ni si hubo fases de RLHF o DPO. Los fragmentos de contexto proceden de Wikipedia en japonés (CC BY-SA 4.0).

## Capacidades

- Generación de texto en japonés, con especialización en respuesta a preguntas sobre documentos y contextos recuperados.
- Razonamiento multi-salto (2-hop) en japonés, entrenado explícitamente con preguntas encadenadas de forma mecánica.
- Comprensión lectora y extracción de respuestas a partir de contexto (estilo QA extractivo/generativo).
- Integración en pipelines RAG: el entrenamiento se diseñó con fragmentos recuperados como contexto, por lo que el modelo está alineado con ese formato de entrada.
- Capacidades heredadas del modelo base Qwen3.5-0.8B (no verificadas en esta ficha): no disponible.
- Soporte de tool calling / function calling: no disponible (no documentado en la model card).
- Soporte de agentes y razonamiento multi-paso general: no disponible.
- Capacidades multimodales (visión, audio): no disponible; no se mencionan en la información proporcionada.
- Modo «thinking» o razonamiento extendido: no disponible.

## Casos de uso

- Respuesta a preguntas sobre documentación interna en japonés: el modelo se ha entrenado con pares pregunta-contexto-respuesta, por lo que puede recibir un fragmento recuperado y devolver la respuesta contenida en él, integrándose en un pipeline RAG con un retriever como los usados en su entrenamiento (BM25 + ruri-v3).
- Búsqueda documental con reranking asistido: dado un conjunto de fragmentos candidatos, el modelo puede formular respuestas concisas que ayuden a validar la relevancia del contexto recuperado en un sistema de búsqueda japonés.
- Preguntas multi-salto sobre bases de conocimiento: su entrenamiento con preguntas de 2 hops de auto-wiki-qa lo hace adecuado para prototipos de QA que requieren combinar información de dos pasajes de Wikipedia japonesa.
- Asistente de soporte en japonés con contexto acotado: al ser un modelo de 0,87 B de parámetros, puede desplegarse en entornos con recursos limitados para tareas de extracción de respuestas, aunque sin garantías de robustez conversacional.
- Evaluación de pipelines de recuperación: sirve como componente de referencia en experimentos académicos que comparan retrievers (BM25 frente a embeddings densos) midiendo la calidad de las respuestas generadas.
- Prototipado educativo y experimentación: su tamaño reducido permite ejecutarlo en una GPU de consumo para probar técnicas de SFT con LoRA y fusión de pesos en un contexto de curso o laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,75 GB solo para pesos (873 M de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 0,9 GB para pesos; en 4 bits, en torno a 0,45 GB. Estas cifras son estimaciones por tamaño y no están confirmadas por el autor, que no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 con contexto moderado; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutarlo sin problema.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer con 4 GB o más de VRAM.
- Opciones de despliegue: al publicarse solo en safetensors, requiere frameworks que carguen pesos Hugging Face, como transformers, vLLM o TGI. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| azuki-digital/llm2026-qwen35-sft-v3 | 873 M | no disponible | ja | apache-2.0 | safetensors en HF |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8 B | no disponible | multilingüe | apache-2.0 | safetensors en HF |
| cl-nagoya/ruri-v3-310m (usado en el pipeline de datos) | 310 M | no disponible | ja | no disponible | HF |
| Modelos QA japoneses de tamaño similar | no disponible | no disponible | ja | no disponible | no disponible |

La comparación directa con el modelo base es la más informativa: este ajuste parte de Qwen3.5-0.8B y solo cambia los pesos mediante SFT, por lo que su rendimiento general fuera del dominio QA japonés probablemente se degrade respecto al base. No se dispone de datos de benchmarks que permitan cuantificar la diferencia.

## Limitaciones y advertencias

- Modelo experimental académico: creado para la tarea final de un curso, con cero descargas y sin validación externa documentada.
- Especialización estrecha: el SFT se ha realizado exclusivamente sobre QA japonesa con contexto recuperado, lo que puede degradar capacidades generales del modelo base (conversación abierta, código, matemáticas) por olvido catastrófico.
- Riesgo de alucinación: al ser un modelo de 0,87 B y entrenado para extraer respuestas de contexto, puede generar respuestas plausibles pero incorrectas cuando el contexto no contiene la respuesta.
- Sesgos: no documentados por el autor; los corpus de Wikipedia japonesa y JGLUE pueden introducir sesgos propios de esas fuentes.
- Limitaciones de idioma: solo se declara japonés; el rendimiento en castellano u otros idiomas no está garantizado.
- Licencia de los datos: aunque el modelo se distribuye como apache-2.0, los datos de entrenamiento (JEMHopQA, JSQuAD, auto-wiki-qa, Wikipedia japonesa) están bajo CC BY-SA 4.0, lo que puede afectar a la redistribución de modelos derivados según la interpretación jurídica aplicable.
- Sin datos de contexto, cuantizaciones ni benchmarks publicados: no es posible planificar su despliegue en producción con garantías.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/azuki-digital/llm2026-qwen35-sft-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset JSQuAD (JGLUE): https://github.com/yahoojapan/JGLUE
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Modelo de embeddings ruri-v3-310m: https://huggingface.co/cl-nagoya/ruri-v3-310m
- Modelo reranker ruri-v3-reranker-310m: https://huggingface.co/cl-nagoya/ruri-v3-reranker-310m
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
