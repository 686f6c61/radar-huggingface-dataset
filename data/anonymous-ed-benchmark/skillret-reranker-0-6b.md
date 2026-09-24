# anonymous-ed-benchmark/SKILLRET-Reranker-0.6B

## Resumen

SkillRet-Reranker-0.6B es un modelo de reranking (cross-encoder) especializado en la recuperación de *skills* o habilidades para agentes de IA. Desarrollado por el colectivo anónimo `anonymous-ed-benchmark` como parte de la evaluación SkillRet, el modelo recibe una consulta en lenguaje natural junto con un documento de habilidad candidato y devuelve una puntuación de relevancia. Está afinado a partir de Qwen/Qwen3-Reranker-0.6B, conserva su interfaz de puntuación basada en la probabilidad del token `yes` frente a `no`, y cuenta con 595.776.512 parámetros reales (unos 0,6 B), con pesos publicados en safetensors y licencia Apache 2.0.

Su problema objetivo es concreto: los agentes que disponen de catálogos con miles de habilidades (ficheros `SKILL.md` con nombre, descripción y cuerpo) necesitan seleccionar las útiles para cada petición. La recuperación vectorial de primera etapa ofrece alta cobertura pero baja precisión; este modelo actúa como segunda etapa y reordena el top-20 devuelto por un retriever como SkillRet-Embedding-8B. En la partición de evaluación del benchmark SkillRet mejora el NDCG@5 de 0,8458 a 0,8610 y el NDCG@10 de 0,8644 a 0,8774 respecto a la primera etapa sin reordenación.

Es relevante ahora porque el ecosistema de agentes basados en herramientas está creciendo y la selección de herramientas es un cuello de botella de latencia y precisión. El modelo ofrece esa segunda etapa con un coste de parámetros muy bajo (0,6 B), aunque introduce una penalización de latencia: aproximadamente 0,8 s por consulta al reordenar 20 candidatos sobre una GPU B200. El modelo es monolingüe en inglés y su ventana de contexto de entrenamiento es de 8.192 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (familia Qwen3) usado como cross-encoder de puntuación; clasificación mediante logits de los tokens `yes`/`no` |
| Parametros totales | 595.776.512 (aproximadamente 0,6 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8.192 tokens (longitud maxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el autor publica unicamente pesos en BF16; no se distribuyen versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | Qwen/Qwen3-Reranker-0.6B (finetune) |
| Tarea (pipeline) | text-ranking |
| Tamano del repositorio | 1,2 GB |
| Dataset asociado | anonymous-ed-benchmark/skillret-benchmark |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-Reranker-0.6B, un transformer decoder causal de 0,6 B de parámetros. No se utiliza como generador, sino como cross-encoder: se construye una plantilla con instrucción, consulta y documento, se ejecuta una pasada hacia delante y se calcula `log_softmax` sobre los logits de los tokens `no` y `yes` en la última posición. La puntuación final es la probabilidad exponenciada del token `yes`. El *prompt* incluye el bloque de plantilla de chat de Qwen (`<|im_start|>`, `<|im_end|>`) y un bloque `<think>` vacío antes de la respuesta, de modo que la interfaz de puntuación es idéntica a la del modelo base. Cada documento de habilidad se formatea como `name | description | SKILL.md body`, la misma representación que emplean los modelos de embedding SkillRet.

El ajuste fino se realizó sobre la partición de entrenamiento del benchmark SkillRet, con 63.259 consultas y 10.123 habilidades, optimizando entropía cruzada binaria sobre la probabilidad del token `yes` para cada par consulta-habilidad. Los negativos duros se minaron a partir de cuatro recuperadores (SkillRet-Embedding-0.6B, SkillRet-Embedding-8B, Qwen3-Embedding-8B y harrier-oss-v1-0.6b): se fusionaron en un único conjunto los candidatos situados en los rangos 21-60 de cada recuperador y se muestrearon 15 negativos por cada positivo. El entrenamiento se ejecutó en 4 GPU NVIDIA B200 con DDP, tamaño de lote efectivo de 384 (96 por dispositivo), una sola época, BF16, tasa de aprendizaje 2e-5 y ratio de calentamiento de 0,1. No se menciona en la información disponible ninguna fase de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Puntuación de relevancia entre una consulta en lenguaje natural y un documento de habilidad de agente, devolviendo un valor continuo (probabilidad del token `yes`) interpretable como orden de relevancia.
- Reordenación de listas de candidatos: diseñado para rescorear el top-20 devuelto por un recuperador de primera etapa.
- Procesamiento de documentos de habilidad con cuerpo extenso, gracias a la ventana de 8.192 tokens y al truncado `longest_first`.
- Uso como segunda etapa en arquitecturas de recuperación en dos fases (embedding + cross-encoder).
- Integración con la librería transformers mediante `AutoModelForCausalLM` y `AutoTokenizer`, con compatibilidad declarada con endpoints.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso: es un componente de puntuación, no un ejecutor.
- Capacidad multilingüe: limitada al inglés.
- Capacidad especial: conserva la plantilla de chat de Qwen3 con bloque `<think>` vacío para reproducción exacta de la interfaz de puntuación del modelo base; no genera cadenas de razonamiento.
- Capacidad multimodal: no disponible (modelo exclusivamente de texto).

## Casos de uso

- Selección de habilidades en agentes con catálogo grande: el agente recupera primero un top-20 de habilidades con un modelo de embeddings y después usa este reranker para quedarse con las 3-5 más relevantes antes de inyectarlas en el contexto del LLM. Es adecuado porque mejora el NDCG@5 de 0,8458 a 0,8610 sobre el recuperador de 8 B de la propia familia.
- Enrutado de herramientas en asistentes con API extensa: cuando el catálogo de funciones supera el centenar y no cabe en el *prompt*, este modelo filtra las candidatas y solo las finalistas se exponen al modelo generador, reduciendo tokens de entrada y errores de invocación.
- Recuperación de documentación procedimental en inglés: dado que cada documento se serializa como `nombre | descripción | cuerpo`, se puede aplicar a manuales de operaciones o *runbooks* y devolver el procedimiento más pertinente a una consulta técnica.
- Búsqueda de plugins o skills en marketplaces internos: reordenar los resultados de búsqueda de un catálogo corporativo de extensiones para que la primera posición coincida con la intención del usuario.
- Filtrado de baja precisión antes de un modelo grande: al ser un cross-encoder de 0,6 B, permite descartar candidatos irrelevantes antes de invocar un LLM de mayor tamaño, reduciendo coste por consulta en pipelines con miles de peticiones diarias.
- Evaluación de sistemas de recuperación: sirve como referencia reproducible en pruebas comparativas de recuperadores, ya que la model card publica NDCG y Recall a 5, 10 y 15 sobre la partición de evaluación de SkillRet (4.392 consultas, 6.006 habilidades).
- Sistemas multi-agente con descubrimiento de capacidades: en arquitecturas donde un agente coordinador debe decidir a qué agente especializado delegar, este reranker puntúa las descripciones de capacidades publicadas y ordena los candidatos de delegación.
- Reordenación sensible a la latencia con *fallback*: en despliegues donde 0,8 s por consulta resulta excesivo, puede activarse solo para consultas ambiguas, dejando el recuperador de embeddings como ruta rápida por defecto.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (partición de test del SkillRet Benchmark, métricas no verificadas de forma independiente):

| Metrica | Valor |
|---|---|
| NDCG@5 | 0,861 |
| NDCG@10 | 0,877 |
| Recall@10 | 0,936 |

Evaluación completa publicada por el autor sobre la partición de evaluación de SkillRet (4.392 consultas, 6.006 habilidades), reordenando el top-20 devuelto por SkillRet-Embedding-8B:

| Metrica | @5 | @10 | @15 |
|---|---|---|---|
| NDCG | 0,8610 | 0,8774 | 0,8821 |
| Recall | 0,8928 | 0,9357 | 0,9510 |
| Completeness | 0,8206 | 0,8896 | 0,9128 |

Comparación de la ganancia aportada por el reranker frente a la primera etapa sin reordenación:

| Configuracion | NDCG@5 | NDCG@10 | NDCG@15 |
|---|---|---|---|
| SkillRet-Embedding-8B, sin reordenacion | 0,8458 | 0,8644 | 0,8695 |
| SkillRet-Embedding-8B + SkillRet-Reranker-0.6B (este modelo) | 0,8610 | 0,8774 | 0,8821 |

No se han publicado resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es coherente con la naturaleza de cross-encoder del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia, solo pesos: aproximadamente 1,2 GB en BF16/FP16, 2,4 GB en FP32, 0,6 GB en INT8 y 0,3 GB en INT4. Son estimaciones calculadas a partir de los 595.776.512 parámetros; el autor no publica cifras oficiales.
- Al tratarse de un cross-encoder con secuencias de hasta 8.192 tokens, las activaciones y el tamaño de lote (por ejemplo, reordenar 20 pares simultáneamente) dominan el consumo real de memoria por encima del peso de los parámetros.
- Cabe en cualquier GPU de consumo: RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090, así como en GPU de portátil con 8 GB o más. También es viable en CPU para lotes pequeños.
- GPU profesionales para producción: A100, H100, L40S o B200. El autor entrenó el modelo con 4 GPU NVIDIA B200 en DDP.
- Despliegue: la librería declarada es transformers, con compatibilidad de endpoints. No se mencionan en la información disponible integraciones específicas con vLLM, llama.cpp, Ollama o TGI, y al no publicarse pesos GGUF no hay una ruta de cuantización oficial.
- Latencia declarada por el autor: aproximadamente 0,8 s por consulta al rescorear 20 candidatos en una única GPU B200. No hay datos de rendimiento (tokens por segundo) en la información disponible.
- El propio autor advierte de que el reordenamiento es sustancialmente más lento que la recuperación de primera etapa, por lo que los despliegues sensibles a la latencia pueden usar únicamente el modelo de embeddings.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | NDCG@5 (SkillRet) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SkillRet-Reranker-0.6B | 0,6 B | Cross-encoder de reordenación | 8.192 tokens | 0,8610 | Apache 2.0 | Pesos en safetensors, 3 descargas |
| Qwen/Qwen3-Reranker-0.6B | 0,6 B | Cross-encoder de reordenación (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Publico en HuggingFace |
| SkillRet-Embedding-8B | 8 B | Recuperador bi-encoder (primera etapa) | no disponible en la informacion proporcionada | 0,8458 (sin reordenacion) | no disponible en la informacion proporcionada | Publico en HuggingFace |
| SkillRet-Embedding-0.6B | 0,6 B | Recuperador bi-encoder (primera etapa) | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Publico en HuggingFace |
| Qwen3-Embedding-8B | 8 B | Recuperador bi-encoder de propósito general | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Publico en HuggingFace |

La comparación directa con alternativas de reordenación genéricas (por ejemplo, bge-reranker o Cohere Rerank) no está disponible en la información proporcionada, ya que el autor solo publica resultados sobre el benchmark SkillRet.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible. Al ser un modelo ajustado únicamente sobre un benchmark de habilidades de agente en inglés, su comportamiento fuera de ese dominio no está caracterizado.
- Riesgo de alucinación: el modelo no genera texto libre, por lo que no produce alucinaciones factuales. El riesgo equivalente es una puntuación de relevancia incorrecta (falsos positivos), que puede llevar al agente a invocar una habilidad inadecuada.
- Limitación idiomática: solo inglés. Las consultas o documentos en otros idiomas no están cubiertos por el entrenamiento declarado.
- Limitación de contexto: máximo de 8.192 tokens por par concatenado (instrucción, consulta y documento); el truncado se aplica con estrategia `longest_first`, por lo que documentos muy largos pueden perder contenido relevante.
- La métrica `Completeness` a 5 (0,8206) es notablemente inferior al Recall@5 (0,8928), lo que indica que el modelo puede ordenar arriba habilidades parcialmente útiles aunque no cubran todos los requisitos de la consulta.
- Coste de latencia: 0,8 s por consulta con 20 candidatos en una B200; en GPU de consumo el tiempo será previsiblemente mayor. No se recomienda como componente de primera etapa.
- Metodología del benchmark: el modelo se ajustó sobre la partición de entrenamiento del mismo benchmark que usa para evaluarse, y las métricas del `model-index` figuran como no verificadas. La generalización a catálogos de habilidades ajenos al benchmark no está demostrada.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar avisos de copyright y licencia. Conviene verificar las condiciones del modelo base Qwen3-Reranker-0.6B, no detalladas en la información disponible.
- Trazabilidad: el autor publica bajo un identificador anónimo y la información de citación se añadirá en una versión desanonimizada. El repositorio tiene 3 descargas y 0 valoraciones, por lo que no existe validación comunitaria.
- Fecha declarada de creación y actualización: 24 de septiembre de 2026.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anonymous-ed-benchmark/SKILLRET-Reranker-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Recuperador de primera etapa (0,6 B): https://huggingface.co/anonymous-ed-benchmark/SKILLRET-Embedding-0.6B
- Recuperador de primera etapa (8 B): https://huggingface.co/anonymous-ed-benchmark/SKILLRET-Embedding-8B
- Dataset del benchmark: https://huggingface.co/datasets/anonymous-ed-benchmark/skillret-benchmark
