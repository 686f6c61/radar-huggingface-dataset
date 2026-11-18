# kanippa/llm2026-r2-ruri-reranker-310m

## Resumen

`kanippa/llm2026-r2-ruri-reranker-310m` es un modelo de reranking (clasificación de texto) en japonés obtenido mediante un ajuste fino con LoRA sobre `cl-nagoya/ruri-v3-reranker-310m`, un cross-encoder basado en la arquitectura ModernBERT. El autor, kanippa, publica esta variante etiquetada como "R2" dentro de un ciclo de entrenamiento ("Cycle 3") y fusiona los pesos LoRA directamente en la arquitectura del modelo base sin introducir cambios estructurales. El resultado es un checkpoint de 315.203.329 parámetros con licencia Apache 2.0.

El modelo resuelve la tarea de reordenar pares consulta-documento en recuperación de información en japonés: recibe una query y un pasaje y produce una puntuación de relevancia. Su interés práctico está en el pipeline de búsqueda (retrieval + reranking), donde un cross-encoder de este tamaño mejora la precisión sobre un retriever bi-encoder a un coste computacional contenido. Está entrenado con datos de QA en japonés (JSQuAD, JEMHopQA, NIILC) y una partición de QA encadenado de dos saltos, usando una pérdida cross-encoder multi-positivo.

El contexto y la longitud máxima de secuencia no se especifican en la información disponible, aunque por herencia de la familia Ruri v3 (ModernBERT) se espera una ventana larga; no obstante, este dato no está confirmado en la model card proporcionada. El modelo es de publicación muy reciente (18 de noviembre de 2026) y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (cross-encoder para reranking / text-classification) |
| Parametros totales | 315.203.329 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del reranker `cl-nagoya/ruri-v3-reranker-310m`, que emplea la arquitectura ModernBERT en configuración de cross-encoder para clasificación de texto. El ajuste se realizó con LoRA y posteriormente se fusionaron los pesos en el modelo base ("LoRA merged into original"), por lo que el checkpoint final conserva la arquitectura original sin modificaciones ("zero architectural changes"). El SHA256 del directorio de pesos fusionados se documenta como `b3f047dfc35414b3ae9c758c51f8bf4dac72ff53f6e5055cc5f64cba92d5b3f4`.

Los datos de entrenamiento declarados son: split de entrenamiento de JSQuAD, split de entrenamiento de JEMHopQA, un 90% del split de desarrollo de NIILC usado como entrenamiento, y un split determinista de QA encadenado de dos saltos ("2-hop chained QA"). Se empleó una pérdida cross-encoder multi-positivo. Los conjuntos de evaluación, mock y producción quedaron explícitamente excluidos del entrenamiento. No se documentan número total de tokens, composición detallada del dataset, ni fases de RLHF/DPO; al tratarse de un reranker supervisado, el entrenamiento es de tipo discriminativo (puntuación de relevancia), no generativo.

## Capacidades

- Reranking de pares consulta-documento en japonés: asigna una puntuación de relevancia a cada par para reordenar resultados de un retriever.
- Clasificación de texto (`text-classification`) como tarea de pipeline declarada.
- Manejo de consultas multi-salto: entrenado específicamente con datos de QA encadenado de dos saltos, lo que lo orienta a preguntas que requieren composición de evidencia.
- Cross-encoder multi-positivo: entrenado con múltiples pasajes positivos por consulta, adecuado para escenarios con varias respuestas correctas.
- Dominio japonés: especializado en texto en japonés (JSQuAD, JEMHopQA, NIILC).
- No dispone de generación de texto libre, tool calling, capacidades de agente, visión ni audio: es un modelo de scoring, no un LLM generativo.

## Casos de uso

- Reranking en motores de búsqueda japoneses: tras una primera fase de recuperación con un bi-encoder (por ejemplo, embeddings de la familia Ruri), este cross-encoder reordena los candidatos y mejora la precisión en el top-k. Su tamaño de 315M permite puntuar decenas de pares por consulta con coste moderado.
- Sistemas de pregunta-respuesta sobre documentación corporativa en japonés: dado un conjunto de fragmentos recuperados, el modelo puntúa cuál responde mejor a la consulta, integrándose como etapa de filtrado antes de un generador.
- QA multi-salto: para preguntas que requieren combinar información de dos pasajes, el entrenamiento con datos de 2-hop chained QA lo hace adecuado para reordenar cadenas de evidencia en pipelines de razonamiento documental.
- Búsqueda en bases de conocimiento internas (NIILC-like): reordenación de registros bibliográficos o fichas técnicas en japonés donde la coincidencia léxica del retriever es insuficiente.
- Filtrado de candidatos en pipelines RAG: reducir de 50-100 documentos recuperados a los 5-10 más relevantes antes de pasarlos al modelo generador, ahorrando contexto y reduciendo alucinaciones por documentos irrelevantes.
- Evaluación y anotación de relevancia: uso del score del cross-encoder para preetiquetar pares consulta-documento en tareas de curación de datasets o control de calidad de índices de búsqueda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,26 GB solo de pesos (315M × 4 bytes), más overhead de activaciones y batch.
- VRAM estimada en fp16/bf16: aproximadamente 0,63 GB de pesos; en int8, alrededor de 0,32 GB.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter (A100, H100) para alto throughput con batches grandes.
- Puede ejecutarse en CPU para volúmenes moderados, dado su tamaño reducido.
- Opciones de despliegue: al ser un modelo de clasificación con arquitectura ModernBERT, es compatible con `transformers` (pipeline `text-classification`), y potencialmente con servidores de inferencia que soporten ModernBERT (TGI, vLLM con soporte de encoder). No se documentan variantes GGUF para llama.cpp/Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| kanippa/llm2026-r2-ruri-reranker-310m | 315M | no disponible | ja | Apache 2.0 | Fine-tune LoRA fusionado de Ruri v3, datos 2-hop |
| cl-nagoya/ruri-v3-reranker-310m | ~310M | no disponible | ja | no disponible en esta ficha | Modelo base; mismo tamaño y arquitectura |
| BGE-reranker-base / bge-reranker-v2-m3 | ~278M / ~568M | 512 / 8192 | multilingüe | MIT | Alternativas multilingües de reranking; comparación de rendimiento no disponible |

La comparación cuantitativa de rendimiento con estas alternativas no está disponible en la información proporcionada. La diferencia principal frente al modelo base es el ajuste con datos de QA multi-salto y la fusión de pesos LoRA.

## Limitaciones y advertencias

- Especializado exclusivamente en japonés; su rendimiento en otros idiomas no está garantizado ni documentado.
- No es un modelo generativo: no produce texto, tool calling ni razonamiento agéntico; solo puntuaciones de relevancia.
- Al ser un cross-encoder, requiere evaluar cada par consulta-documento de forma independiente, lo que limita su uso a la fase de reranking sobre un conjunto acotado de candidatos.
- Riesgo de sesgo heredado de los datasets de origen (JSQuAD, JEMHopQA, NIILC), que no están caracterizados en la model card.
- No se documentan evaluaciones de robustez, calibración de scores ni comportamiento fuera de distribución.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (`cl-nagoya/ruri-v3-reranker-310m`) debe verificarse por separado para confirmar compatibilidad.
- Modelo muy reciente y sin descargas ni validación comunitaria: no hay evidencia externa de calidad en producción.
- No se especifican la longitud máxima de secuencia ni los requisitos exactos de preprocesado (formato de plantilla consulta-documento), lo que puede afectar a la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/kanippa/llm2026-r2-ruri-reranker-310m
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-reranker-310m
- Repositorio de la familia Ruri (referencia del modelo base): https://huggingface.co/cl-nagoya
