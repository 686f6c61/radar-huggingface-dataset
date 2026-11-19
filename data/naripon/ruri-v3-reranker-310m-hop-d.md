# naripon/ruri-v3-reranker-310m-hop-D

## Resumen

ruri-v3-reranker-310m-hop-D es un modelo de reranking (reordenación de resultados de búsqueda) para japonés, desarrollado por el usuario naripon a partir de cl-nagoya/ruri-v3-reranker-310m. Se trata de un ajuste fino completo (todos los parámetros) del reranker original de Ruri v3, manteniendo idéntica arquitectura y configuración. Su función es puntuar pares consulta-documento para reordenar los resultados de un sistema de recuperación, mejorando la precisión en escenarios de pregunta-respuesta multihop (que requieren encadenar dos hechos para llegar a la respuesta).

El modelo está especializado mediante entrenamiento con el conjunto JEMHopQA, un corpus japonés de QA multihop, filtrando por preguntas de tipo composicional y generando etiquetas de forma automática: los documentos que contienen la cadena de respuesta se marcan como positivos y el resto como negativos. Emplea una arquitectura ModernBERT (encoder transformer) con 315.203.329 parámetros totales y está orientado exclusivamente al idioma japonés.

Su relevancia radica en que aborda un nicho concreto: el reranking para pipelines RAG en japonés con preguntas que exigen razonamiento multi-salto. Al derivar de Ruri v3, se integra de forma natural con el ecosistema de recuperación japonés (Ruri v3 310m, BM25) y puede desplegarse con las mismas herramientas que el modelo base. No obstante, se trata de un modelo con cero descargas y cero likes en el momento de la ficha, sin benchmarks publicados ni licencia declarada explícitamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parámetros totales | 315.203.329 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | japonés (ja) |
| Licencia | no disponible (la model card remite a la licencia del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de todos los parámetros de cl-nagoya/ruri-v3-reranker-310m (revisión 2c23c61a90583f0348880a2ffb2d7fd29e2d14f1), por lo que conserva la estructura y configuración del original: un encoder ModernBERT adaptado a la tarea de reranking, que recibe pares consulta-documento y produce una puntuación de relevancia. No se documentan cambios arquitectónicos respecto al modelo base.

El entrenamiento se realizó con datos derivados de JEMHopQA (CC BY-SA 4.0), un conjunto japonés de QA multihop que requiere seguir dos hechos para responder. El autor filtró las preguntas por tipo composicional y, sobre los 100 primeros resultados de recuperación de los chunks distribuidos (procedentes de Wikipedia japonesa, CC BY-SA 4.0), asignó etiquetas de forma mecánica: los documentos que contienen la cadena de respuesta como positivos y los que no como negativos. La recuperación se realizó con el pipeline distribuido (Ruri v3 310m, Ruri v3 reranker 310m y BM25), y no se emplearon las preguntas del concurso. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reranking de pares consulta-documento en japonés: asigna una puntuación de relevancia para reordenar resultados de recuperación.
- Especialización en preguntas multihop composicionales: entrenado para priorizar documentos que permiten encadenar dos hechos hasta la respuesta.
- Integración con pipelines de recuperación japoneses: compatible con los componentes del ecosistema Ruri v3 (retriever 310m, reranker 310m, BM25).
- Procesamiento de texto en japonés exclusivamente; no se documenta soporte multilingüe.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- RAG sobre Wikipedia japonesa con preguntas multihop: el modelo reordena los chunks recuperados por un retriever para que los documentos que contienen la cadena de hechos queden en las primeras posiciones antes de pasarlos al generador.
- Segunda etapa de un pipeline de búsqueda híbrida: tras una recuperación con BM25 y Ruri v3 310m, el reranker refina el orden de los 100 primeros resultados, aprovechando que fue entrenado precisamente sobre ese tipo de candidatos.
- Asistentes de consulta documental en japonés: en un sistema de atención al usuario sobre corpus internos, el modelo puntúa los fragmentos recuperados y reduce el ruido contextual que llega al LLM generador.
- Evaluación de sistemas de QA multihop: sirve como componente de referencia para medir la calidad de recuperación en tareas que requieren composición de hechos, al estar ajustado sobre JEMHopQA.
- Búsqueda semántica en bases de conocimiento japonesas: reordenación de resultados en aplicaciones de búsqueda interna donde las consultas exigen combinar información de varios documentos.
- Investigación en reranking para japonés: al ser un ajuste fino del reranker Ruri v3, permite comparar el efecto de la especialización multihop frente al modelo base en experimentos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,7 GB para los pesos (315 M de parámetros), más overhead de activaciones y del tokenizador; en la práctica, menos de 2 GB para lotes pequeños.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,4 GB para los pesos; en 4 bits, alrededor de 0,2 GB (estimaciones teóricas, no verificadas para este modelo).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM es suficiente; para alto throughput en producción, GPU de datacenter como A100 o H100 permiten lotes grandes.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y superiores.
- Opciones de despliegue: al ser un modelo safetensors con arquitectura ModernBERT, puede servirse con frameworks compatibles con transformers (por ejemplo, Text Embeddings Inference o vLLM con soporte de reranking); no se documentan integraciones específicas con llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| naripon/ruri-v3-reranker-310m-hop-D | 315 M | no disponible | Reranking japonés multihop | no disponible | Hugging Face (0 descargas) |
| cl-nagoya/ruri-v3-reranker-310m | ~310 M | no disponible | Reranking japonés general | no disponible en esta ficha | Hugging Face (modelo base) |
| cl-nagoya/ruri-v3-310m | ~310 M | no disponible | Retrieval/embedding japonés | no disponible en esta ficha | Hugging Face |

La comparación principal es con su modelo base: hop-D añade especialización en preguntas multihop composicionales mediante ajuste fino completo, a costa de un posible estrechamiento de su rendimiento en consultas generales. No se dispone de datos de benchmarks para cuantificar la diferencia.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en japonés; no se documenta soporte para otros idiomas.
- El ajuste fino se realizó con etiquetas generadas automáticamente (documentos que contienen la cadena de respuesta como positivos), lo que puede introducir ruido y sesgos hacia ese formato de datos.
- La especialización en preguntas multihop composicionales puede degradar el rendimiento en consultas simples o de otro tipo respecto al modelo base.
- Licencia no declarada explícitamente: la model card remite a la licencia del modelo base, por lo que es imprescindible verificar cl-nagoya/ruri-v3-reranker-310m antes de cualquier uso comercial.
- Los datos de entrenamiento derivan de JEMHopQA y Wikipedia japonesa bajo CC BY-SA 4.0, con posibles obligaciones de atribución y compartir igual.
- Riesgo de alucinación no aplicable directamente (es un reranker, no un generador), pero sí riesgo de puntuaciones erróneas en documentos ambiguos o fuera de la distribución de entrenamiento.
- Sin benchmarks publicados, cero descargas y cero likes: no hay evidencia externa de su calidad en producción.
- No se documentan la longitud de contexto soportada ni los tipos de cuantización validados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/naripon/ruri-v3-reranker-310m-hop-D
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-reranker-310m
- JEMHopQA (dataset): https://github.com/aiishii/JEMHopQA
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
