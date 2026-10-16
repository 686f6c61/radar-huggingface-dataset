# sno-lab/multilingual-reranker-small-int8

## Resumen

La ficha describe `sno-lab/multilingual-reranker-small-int8`, una versión cuantizada a 8 bits del modelo `Horizon-Labs/multilingual-reranker-small`. Se trata de un modelo de reranking (clasificación de relevancia entre una consulta y un conjunto de documentos) distribuido en formato ONNX para su ejecución en CPU mediante transformers.js. El autor, sno-lab, lo mantiene para la aplicación Sno Station, donde se emplea para reordenar memorias de agentes de programación.

El modelo original deriva de `jhu-clsp/mmBERT-small` (licencia MIT), una arquitectura de tipo ModernBERT de tamaño reducido. La versión aquí descrita no reentrena nada: aplica cuantización de pesos a 8 bits sin signo, por canal, a las proyecciones de embeddings, atención y primera capa MLP, dejando la segunda proyección MLP en coma flotante para preservar la precisión de las puntuaciones. El resultado es un fichero aproximadamente un tercio más pequeño que la versión cuantizada original, con puntuaciones equivalentes dentro de un margen reducido.

Es relevante para quienes necesitan reranking ligero y multilingüe en entornos sin GPU, especialmente en pipelines de recuperación aumentada (RAG) o memoria de agentes. La ausencia de datos de parámetros concretos y de idiomas soportados en la información disponible limita la evaluación cuantitativa, por lo que varios campos quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder, base `jhu-clsp/mmBERT-small`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 sin signo, por canal; segunda proyeccion MLP en float |
| Idiomas soportados | multilingue (lista concreta no disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (transformers.js) |

## Arquitectura y entrenamiento

El modelo es un encoder de tipo ModernBERT orientado a clasificación de secuencias, concretamente a la tarea de ranking de texto. La arquitectura base es `jhu-clsp/mmBERT-small`, un modelo multilingüe de tamano reducido con licencia MIT. Sobre esa base, Horizon Labs entrenó el reranker original `multilingual-reranker-small`; sno-lab ha publicado únicamente una versión cuantizada de ese mismo modelo, sin modificaciones de arquitectura ni de pesos más allá de la precisión numérica.

La innovación técnica de esta versión es la estrategia de cuantización: los embeddings de tokens, las proyecciones de atención y la primera proyección MLP se almacenan en 8 bits sin signo por canal, mientras que la segunda proyección MLP permanece en coma flotante porque sus entradas contienen valores muy grandes y una cuantización a 8 bits desviaría demasiado las puntuaciones. Se eligió formato sin signo porque los pesos con signo desbordan en CPUs AVX2 sin VNNI y aplanan todas las puntuaciones. El script `quantize.py` regenera el fichero a partir del `onnx/model.onnx` original en la revisión `4fd96cc3b19fd47e790cf923879b193d3ebf0bc9` de forma byte-identical. No se documentan en la información disponible los datos de entrenamiento, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Reranking de texto: puntúa pares consulta-documento y devuelve logits donde un valor mayor indica mayor relevancia.
- Clasificación de secuencias mediante `AutoModelForSequenceClassification` en transformers.js.
- Procesamiento multilingüe heredado del modelo base (idiomas concretos no especificados).
- Ejecución en CPU sin GPU, gracias al formato ONNX cuantizado.
- Integración con `@huggingface/transformers` usando `dtype: "q8"`.
- Reordenación de memorias o fragmentos recuperados en pipelines de agentes de programación.
- No se documentan capacidades de tool calling, agentes multi-paso, generación de texto, visión ni audio; es un modelo de ranking, no generativo.

## Casos de uso

- Reranking en RAG: tras recuperar candidatos con un buscador vectorial, el modelo reordena los fragmentos por relevancia respecto a la consulta, mejorando la precisión del contexto que se pasa al LLM generador.
- Memoria de agentes de programación: tal como hace Sno Station, se usa para seleccionar qué memorias previas son relevantes para la tarea actual del agente antes de inyectarlas en el prompt.
- Búsqueda en documentación técnica interna: dado un corpus multilingüe, puntúa artículo por artículo contra la pregunta del usuario para devolver los más pertinentes.
- Filtrado de resultados en buscadores pequeños: capa de reordenación sobre un índice ligero en aplicaciones web que corren en navegador o servidor sin GPU.
- Sistemas de FAQ y atención al cliente: empareja la pregunta del usuario con una base de respuestas predefinidas y selecciona la mejor coincidencia.
- Deduplicación y agrupación semántica: comparar pares de textos para ordenar por similitud semántica en tareas de limpieza de datasets.
- Inferencia en el navegador: al distribuirse como ONNX para transformers.js, puede ejecutarse del lado del cliente sin exponer datos a un servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, MTEB ni métricas de ranking; remite a la model card del modelo original para sus datos de evaluación.

## Requisitos de hardware

- VRAM: no aplica necesariamente; el modelo está pensado para ejecución en CPU mediante ONNX.
- Tamano del repositorio: 0,2 GB para el conjunto de ficheros del modelo cuantizado.
- GPU recomendadas: no disponibles; el caso de uso declarado es CPU.
- Cabe en GPU de consumo: plausible dado el tamano reducido y la cuantización INT8, pero no confirmado en la información disponible.
- Opciones de despliegue: transformers.js con `dtype: "q8"`; no se documentan vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos y no a este reranker.
- Latencia y throughput: no disponibles. La model card solo indica equivalencia de puntuaciones con el modelo original dentro de un margen pequeno y una reduccion de tamano de aproximadamente un tercio.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantizacion | Formato | Licencia | Idiomas |
|---|---|---|---|---|---|
| sno-lab/multilingual-reranker-small-int8 | Reranker ModernBERT | INT8 | ONNX | Apache-2.0 | multilingue (no detallado) |
| Horizon-Labs/multilingual-reranker-small | Reranker ModernBERT | original (float/cuantizada) | no disponible | Apache-2.0 | multilingue (no detallado) |
| jhu-clsp/mmBERT-small | Encoder multilingue | no aplica (base) | no disponible | MIT | multilingue (no detallado) |

No se dispone de datos de rendimiento comparado ni de otros rerankers alternativos en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce puntuaciones de relevancia; no responde preguntas ni redacta texto.
- La cuantización introduce una desviación pequena pero no nula en las puntuaciones respecto al modelo original.
- La lista concreta de idiomas soportados no está documentada; aunque se anuncia como multilingüe, no se garantiza cobertura uniforme.
- La longitud máxima de contexto no está especificada, lo que impide planificar el truncado de entradas largas con precisión.
- No hay datos de sesgos ni de evaluación de robustez publicados en la información disponible.
- Riesgo de alucinación no aplica en sentido generativo, pero sí puede producir puntuaciones erróneas en pares ambiguos o fuera de dominio.
- Para uso comercial, la licencia Apache-2.0 lo permite, pero conviene verificar las condiciones del modelo base `jhu-clsp/mmBERT-small` (MIT) y del reranker original de Horizon Labs.
- El repositorio registra cero descargas y cero "likes", por lo que no hay validación comunitaria documentada en el momento de la consulta.

## Enlaces

- HuggingFace: https://huggingface.co/sno-lab/multilingual-reranker-small-int8
- Modelo base: https://huggingface.co/Horizon-Labs/multilingual-reranker-small
- Modelo fundacional: https://huggingface.co/jhu-clsp/mmBERT-small
- Repositorio de uso: https://github.com/sno-ai/sno-station
