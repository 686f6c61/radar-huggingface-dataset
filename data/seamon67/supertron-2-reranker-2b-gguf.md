# seamon67/Supertron-2-Reranker-2B-GGUF

# Supertron-2-Reranker-2B-GGUF

## Resumen
Supertron-2-Reranker-2B-GGUF es la conversión a formato GGUF del modelo Surpem/Supertron2-Reranker-2B, un reranker de tipo cross-encoder de 2.000 millones de parámetros construido sobre Qwen/Qwen3-VL-Reranker-2B. Lo publica el usuario seamon67 y su función no es generar texto, sino asignar una puntuación de relevancia a pares consulta-documento para actuar como segunda etapa de ranking en pipelines de recuperación (búsqueda, RAG, bases de conocimiento).

El modelo es relevante porque buena parte de las conversiones comunitarias de este reranker a GGUF producen puntuaciones inservibles. El autor identifica tres causas: ausencia de la cabeza de clasificación, uso de una fórmula de scoring incorrecta y aplicación de una plantilla de chat distinta a la esperada. Esta conversión corrige las tres y aplica la fórmula `sigmoid(yes_logit - no_logit)`, de modo que funciona en versiones modernas de llama.cpp.

Por su tamaño (2B) y su licencia Apache 2.0, se posiciona como reranker de segunda etapa desplegable en hardware de gama media, con requisitos declarados de 3 GB de VRAM en 4 bits y 6 GB en bfloat16 para el modelo base. Está declarado únicamente para inglés y pensado para integración en pipelines, no para uso conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder reranker basado en Qwen3-VL (transformer) con cabeza de clasificacion para scoring de relevancia |
| Parametros totales | 2.000 millones (2B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (el repo ocupa 2,7 GB en total; los niveles concretos de cuantizacion no se detallan en la informacion disponible) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |
| Tipo de tarea (pipeline) | text-ranking |
| Modelo base | Surpem/Supertron2-Reranker-2B (relacion: quantized) |
| Modelo del que deriva el base | Qwen/Qwen3-VL-Reranker-2B |
| Fecha de publicacion | 19 de septiembre de 2026 |
| Tamano del repositorio | 2,7 GB |

## Arquitectura y entrenamiento
Se trata de un cross-encoder: la consulta y el documento candidato se procesan conjuntamente en una única pasada, y el modelo emite una puntuación de relevancia en lugar de una representación vectorial independiente por texto. Esto lo diferencia de los bi-encoders empleados en la etapa de recuperación inicial y explica su mayor coste por par evaluado, compensado por una precisión superior en la ordenación final. La base es Qwen/Qwen3-VL-Reranker-2B, cuyo nombre sugiere un componente vision-language en el modelo original, aunque el repositorio GGUF se declara como text-ranking y solo contempla inglés.

El autor no documenta el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de ajuste como RLHF o DPO sobre el modelo base; toda esa información no está disponible. La aportación técnica de esta conversión es de ingeniería de formato: preservar la cabeza de clasificación, aplicar la fórmula `sigmoid(yes_logit - no_logit)` sobre los logits "yes" y "no", y respetar la plantilla de chat original. No hay decodificación especulativa ni mecanismos de generación, ya que el modelo no produce texto.

## Capacidades
- Puntuación de relevancia consulta-documento mediante cross-encoder.
- Reranking de segunda etapa sobre candidatos ya recuperados por un retriever más rápido.
- Reranking de documentos en pipelines de RAG, para priorizar el material que entra en la ventana de contexto del generador.
- Emparejamiento pregunta-pasaje: fragmentos, artículos de ayuda, documentación técnica y otros candidatos textuales.
- Recuperación sensible a instrucciones (instruction-aware retrieval): el modelo se invoca mediante un prompt de relevancia, por lo que puede adaptarse a la intención expresada en la consulta.
- Evaluación de resultados de recuperación y comparación de candidatos.
- Soporte de tool calling y function calling: no disponible (no es un modelo generativo ni de chat).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; el modelo está declarado únicamente para inglés.
- Capacidades especiales: no se documentan modos de thinking, visión, audio ni generación, pese a que el modelo base se apoye en Qwen3-VL.

## Casos de uso
- RAG en producción sobre documentación técnica: tras recuperar entre 50 y 100 fragmentos con un retriever vectorial, el reranker reordena los candidatos y se envían al generador únicamente los mejor puntuados, reduciendo el ruido en el contexto y, con ello, el riesgo de respuestas incorrectas.
- Búsqueda empresarial interna: reordenar los resultados de un buscador sobre manuales, políticas y bases de conocimiento para que los documentos realmente pertinentes aparezcan en las primeras posiciones, sin reentrenar el índice subyacente.
- Atención al cliente automatizada: puntuar artículos de ayuda y respuestas candidatas frente a la consulta del usuario antes de que un sistema de respuesta las utilice, mejorando la precisión en dominios con vocabulario muy repetitivo como facturación o gestión de cuentas.
- Sistemas de preguntas frecuentes y soporte técnico: filtrar pasajes duplicados o tangencialmente relacionados que los retrievers basados en embeddings suelen posicionar alto por similitud superficial.
- Evaluación y auditoría de pipelines de recuperación: usar las puntuaciones para comparar configuraciones de chunking, modelos de embeddings o parámetros de búsqueda, midiendo qué combinación coloca antes los documentos correctos.
- Filtrado previo a generación en asistentes sobre corpus regulatorios o legales: dado que el modelo solo puntúa relevancia y no genera, puede insertarse como componente determinista y auditable en un pipeline donde la trazabilidad de las fuentes es un requisito.
- Moderación de contexto documental: descartar candidatos textualmente similares pero fuera de alcance antes de que lleguen al generador, siempre con validación humana sobre el dominio concreto.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del GGUF ni la del modelo original incluyen métricas sobre MTEB, BEIR u otros conjuntos de evaluación de ranking, ni comparaciones numéricas con alternativas. El autor recomienda evaluar el modelo en el dominio de recuperación propio antes de usarlo en producción.

## Requisitos de hardware
- VRAM estimada para el modelo base: 3 GB mínimos y 6 GB o más recomendados en cuantización de 4 bits; 6 GB mínimos y 10 GB o más recomendados en bfloat16. Son cifras declaradas por el autor del modelo original.
- El repositorio GGUF ocupa 2,7 GB en total, por lo que cada cuantización individual es de tamaño inferior; el nivel concreto de cada fichero no se detalla en la información disponible.
- GPU de gama consumer: el modelo cabe con holgura en tarjetas de 8 GB o más (RTX 3060, RTX 4060, RTX 4070). En cuantizaciones bajas puede ejecutarse en GPUs de 4-6 GB.
- GPU de centro de datos: A100, H100 o L40S permiten lotes grandes y secuencias largas, útiles cuando se rerankean muchos candidatos por consulta.
- Lotes grandes o documentos largos incrementan el consumo de VRAM; el autor recomienda reducir el tamaño de lote o la longitud máxima de secuencia en ese caso.
- Opciones de despliegue: llama.cpp mediante este GGUF; también Ollama y servidores compatibles con GGUF. Para los pesos originales en safetensors, la vía documentada es sentence-transformers con la clase CrossEncoder.
- Latencia y throughput: no disponible. Al ser un cross-encoder, el coste crece linealmente con el número de pares consulta-documento evaluados, por lo que conviene acotar el número de candidatos que llegan a esta etapa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato y disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| Supertron-2-Reranker-2B-GGUF | 2B | No disponible | Ingles | Apache 2.0 | GGUF para llama.cpp | No disponible |
| Surpem/Supertron2-Reranker-2B | 2B | No disponible | Ingles | Apache 2.0 | Safetensors (via sentence-transformers CrossEncoder) | No disponible |
| Qwen/Qwen3-VL-Reranker-2B | 2B | No disponible | No disponible | No disponible en la informacion proporcionada | Safetensors | No disponible |
| BAAI/bge-reranker-v2-m3 | 568M | No disponible | Multilingue | Apache 2.0 | Safetensors y GGUF de terceros | No disponible |

Nota: los datos de BAAI/bge-reranker-v2-m3 proceden de conocimiento general sobre el ecosistema de rerankers y no de la informacion proporcionada en esta busqueda; conviene verificarlos en su repositorio antes de citarlos. La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre alternativas comparables.

## Limitaciones y advertencias
- El modelo puntúa relevancia; no genera respuestas y no debe usarse como modelo de chat independiente.
- Puede ordenar alto contenido incorrecto, desactualizado o inseguro si resulta textualmente relevante para la consulta.
- Las puntuaciones de relevancia son relativas y pueden no estar calibradas entre consultas distintas: no conviene fijar umbrales absolutos sin validación previa en el dominio propio.
- Los documentos largos suelen requerir troceado previo al reranking.
- Idiomas: solo inglés declarado; su comportamiento en castellano u otras lenguas no está documentado y no debería asumirse.
- Sesgos: no se documenta ningún análisis de sesgos en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos de relevancia, es decir, de asignar puntuaciones altas a pasajes que no responden a la consulta.
- Conversiones defectuosas: existen GGUFs comunitarios del mismo modelo base que producen puntuaciones inválidas por omitir la cabeza de clasificación o usar una fórmula de scoring incorrecta. Debe verificarse que la conversión empleada aplica `sigmoid(yes_logit - no_logit)` y la plantilla de chat correcta.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar los avisos de copyright y licencia. Conviene revisar igualmente las condiciones del modelo base y de Qwen3-VL del que deriva.
- El repositorio no registra descargas ni valoraciones en el momento de la consulta, por lo que no existe evidencia comunitaria de validación independiente.

## Enlaces
- Repositorio GGUF: https://huggingface.co/seamon67/Supertron-2-Reranker-2B-GGUF
- Modelo base (Surpem/Supertron2-Reranker-2B): https://huggingface.co/Surpem/Supertron2-Reranker-2B
- Modelo del que deriva la base (Qwen/Qwen3-VL-Reranker-2B): https://huggingface.co/Qwen/Qwen3-VL-Reranker-2B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- sentence-transformers (CrossEncoder): https://www.sbert.net/
- Nota: la busqueda web realizada no devolvio papers, blogs ni demos relevantes sobre este modelo.
