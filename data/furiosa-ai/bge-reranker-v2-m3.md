# furiosa-ai/bge-reranker-v2-m3

## Resumen

`furiosa-ai/bge-reranker-v2-m3` es un paquete de despliegue del modelo de reranking multiplilingüe `BAAI/bge-reranker-v2-m3`, publicado por FuriosaAI para ejecutarse sobre su acelerador RNGD mediante la librería Furiosa-LLM. No se trata de un modelo nuevo: los pesos son los del checkpoint original de BAAI, distribuidos junto con un Furiosa Executable Bundle (FXB) que permite servir el modelo en hardware NPU de FuriosaAI.

El modelo resuelve el problema del reranking en pipelines de recuperación de información: dado un par consulta-documento, produce una puntuación de relevancia que permite reordenar los resultados de un primer recuperador (habitualmente denso o híbrido) en sistemas RAG y motores de búsqueda. Al ser un cross-encoder, evalúa conjuntamente consulta y documento, lo que ofrece mayor precisión que la similitud coseno entre embeddings independientes, a costa de un coste computacional por par más elevado.

Es relevante para equipos que ya operan infraestructura FuriosaAI RNGD y necesitan integrar un reranker multilingüe en producción sin depender de GPU. La arquitectura es XLM-RoBERTa densa con 567,7 millones de parámetros, licencia Apache 2.0 y soporte multilingüe. La longitud de contexto del modelo no se especifica en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder denso), `XLMRobertaForSequenceClassification` |
| Parámetros totales | 567.755.777 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Sin cuantización de bajos bits; pesos FP32 del checkpoint original, conversión a BF16 para ejecución W16A16 |
| Idiomas soportados | Multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint FP32) + Furiosa Executable Bundle (FXB) |
| Tarea | Text classification / reranking (cross-encoder) |
| Entrada / salida | Texto (pares consulta-documento) / puntuación de relevancia |
| Hardware soportado | FuriosaAI RNGD |
| Estrategia de paralelismo | Tensor-parallel de 8 PEs (una tarjeta RNGD) |
| Tamaño del repositorio | 2,4 GB |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en el encoder XLM-RoBERTa, implementado como `XLMRobertaForSequenceClassification`. Recibe la concatenación de consulta y documento y emite una puntuación escalar de relevancia, que el servidor normaliza mediante sigmoide para exponerla como `relevance_score`. Al evaluar el par de forma conjunta, captura interacciones léxicas y semánticas que un bi-encoder no puede modelar.

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO o técnicas de minería de negativos) corresponden al modelo original de BAAI y no se documentan en esta ficha de FuriosaAI. La contribución de este repositorio es de despliegue: empaqueta los pesos originales sin cuantización de bajos bits y añade un FXB compilado para RNGD, con ejecución en BF16 (W16A16) y paralelismo tensorial de 8 PEs sobre una única tarjeta.

## Capacidades

- Reranking de pares consulta-documento mediante cross-encoder, con puntuaciones de relevancia normalizadas por sigmoide.
- Soporte multilingüe, heredado de XLM-RoBERTa.
- Endpoint `/v1/rerank` compatible con las APIs de Cohere y Jina, con parámetro `top_n` para truncar resultados.
- Endpoint `/v1/score` para puntuar pares consulta-documento sin reordenar.
- API Python offline mediante el constructor `LLM` de Furiosa-LLM, con descubrimiento automático del FXB incluido en el repositorio.
- Servidor compatible con OpenAI para despliegue online.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso, y no tiene modo thinking, visión ni audio.

## Casos de uso

- Reranking en pipelines RAG: tras la recuperación inicial con un índice vectorial, el modelo reordena los candidatos por relevancia real respecto a la consulta, mejorando la calidad del contexto que se inyecta al LLM generador. El endpoint `/v1/rerank` con `top_n` encaja directamente en este paso.
- Búsqueda empresarial multilingüe: en corpus con documentos en varios idiomas, el soporte multilingüe del XLM-RoBERTa permite reordenar resultados sin mantener un reranker por idioma.
- Atención al cliente con base de conocimiento: reordenar artículos candidatos antes de responder permite seleccionar los fragmentos más pertinentes y reducir respuestas basadas en documentación irrelevante.
- Filtrado de candidatos en sistemas de recomendación textual: puntuar pares consulta-documento para descartar resultados de baja relevancia antes de etapas posteriores más costosas.
- Evaluación de calidad de recuperación: usar `/v1/score` para generar puntuaciones de relevancia en conjuntos de evaluación y medir la calidad de un recuperador.
- Despliegue en infraestructura NPU: equipos con tarjetas FuriosaAI RNGD pueden servir el reranker sin GPU, aprovechando el FXB precompilado y el paralelismo de 8 PEs en una sola tarjeta.
- Deduplicación y ordenación de resultados en motores de búsqueda internos: reordenar los N mejores resultados de un buscador léxico o híbrido antes de presentarlos al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Hardware objetivo: FuriosaAI RNGD (8 PEs por tarjeta); el modelo ocupa una única tarjeta con tensor-parallel de 8 PEs.
- No se documenta despliegue en GPU en esta ficha; para GPU se remite al modelo original `BAAI/bge-reranker-v2-m3`, ejecutable con FlagEmbedding, Sentence Transformers o Transformers.
- Precisión de ejecución: BF16 (W16A16) a partir de pesos FP32; sin cuantización de bajos bits.
- Tamaño del repositorio: 2,4 GB, que incluye pesos y FXB.
- Opciones de despliegue: `furiosa-llm serve` (servidor compatible con OpenAI) o API Python `furiosa_llm.LLM`.
- VRAM, latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Hardware / despliegue | Notas |
|---|---|---|---|---|---|
| furiosa-ai/bge-reranker-v2-m3 | 567,7 M | no disponible | Apache 2.0 | FuriosaAI RNGD, Furiosa-LLM | Paquete de despliegue del modelo de BAAI con FXB |
| BAAI/bge-reranker-v2-m3 | 567,7 M | no disponible | Apache 2.0 | GPU/CPU, FlagEmbedding, Sentence Transformers, Transformers | Modelo original; misma arquitectura y pesos |
| BAAI/bge-reranker-base | no disponible en la información | no disponible | no disponible en la información | GPU/CPU | Alternativa de menor tamaño de la misma familia; datos no verificados aquí |

La comparación con otras familias de rerankers (Cohere Rerank, Jina Reranker) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de reranking, no generativo: no puede sustituir a un LLM en tareas de generación, razonamiento o agentes.
- El coste por par es superior al de un bi-encoder, ya que requiere una pasada completa del encoder por cada consulta-documento; conviene aplicarlo sobre un conjunto de candidatos ya filtrado.
- La longitud de contexto no está documentada en esta ficha; los pares consulta-documento demasiado largos pueden truncarse según la configuración del tokenizador.
- Riesgo de alucinación no aplica en sentido generativo, pero las puntuaciones de relevancia pueden ser poco fiables en dominios muy alejados de los datos de entrenamiento originales.
- Sesgos: no se documentan sesgos específicos en la información disponible; hereda los del corpus de entrenamiento de XLM-RoBERTa y del ajuste de BAAI.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo original de BAAI y de las dependencias de Furiosa-LLM.
- El despliegue está atado al hardware FuriosaAI RNGD y a la librería Furiosa-LLM; no es portable a GPU sin usar el checkpoint original.
- El repositorio tiene un volumen de descargas muy bajo (319) y ninguna interacción, lo que reduce la evidencia comunitaria sobre su funcionamiento en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/furiosa-ai/bge-reranker-v2-m3
- Modelo original: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Servidor Furiosa-LLM (`furiosa-llm serve`): https://developer.furiosa.ai/latest/en/furiosa_llm/furiosa-llm-serve.html
- Guía de instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- FuriosaAI: https://furiosa.ai
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
