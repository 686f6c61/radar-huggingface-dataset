# AdarshSingh7647/HETU-Qwen3-8B-PassageReranking-CotCond

## Resumen

HETU-Qwen3-8B-PassageReranking-CotCond es un modelo de reranking de pasajes (passage reranking) desarrollado por AdarshSingh7647 como parte de la suite HETU (Hints Enable True Understanding). Se construye sobre el modelo base Qwen/Qwen3-8B, al que se le ha aplicado un ajuste fino mediante LoRA, con los pesos del adaptador ya fusionados en el modelo final. El objetivo es mejorar la selección de pasajes relevantes en tareas de recuperación de información, evaluado en los benchmarks BRIGHT y NevIR.

La innovación principal del modelo reside en el método de entrenamiento denominado CotCond (Conditioning on Compact Hints), que utiliza una señal de condicionamiento compacta en lugar de una cadena de razonamiento completa generada por el modelo. Esto permite obtener mejoras en reranking con un coste computacional reducido durante el entrenamiento y la inferencia. El modelo está disponible en formato safetensors con precisión bf16 y es compatible con el ecosistema transformers y text-generation-inference.

Al tratarse de un modelo de 8 mil millones de parámetros, ofrece un equilibrio entre capacidad y requisitos de hardware, siendo viable su despliegue en GPUs de consumo con cuantización adecuada. No obstante, la documentación pública es escasa: no se especifican la licencia, los idiomas soportados ni los resultados detallados de benchmarks más allá de la mención a los conjuntos de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B, tipicamente 32.768 tokens) |
| Tipos de cuantizacion | no disponible (repo en bf16; cuantizaciones adicionales no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de Qwen3-8B, que incorpora atención con ventanas deslizantes y full attention, además de soporte para modo pensante y no pensante. Sobre esta base, se ha aplicado un ajuste fino con adaptadores LoRA, cuyos pesos se han fusionado en el modelo final (merged model). El entrenamiento sigue el método HETU CotCond, que condiciona el modelo con una pista compacta en lugar de una cadena de razonamiento completa, reduciendo el coste de generación durante el entrenamiento y la inferencia.

El conjunto de datos de entrenamiento no se detalla en la información disponible, pero la evaluación se realiza sobre los benchmarks BRIGHT y NevIR, especializados en reranking de pasajes. El checkpoint publicado corresponde al entrenamiento final completo, en precisión bf16, listo para usar con transformers.

## Capacidades

- Reranking de pasajes: dado un query y un conjunto de documentos candidatos, el modelo asigna puntuaciones de relevancia para ordenar los resultados.
- Evaluado en benchmarks de reranking: BRIGHT y NevIR, que cubren dominios diversos como biología, finanzas, derecho o ciencia.
- Generación de texto: al estar basado en Qwen3-8B, conserva las capacidades generativas del modelo base, aunque su uso principal es el reranking.
- Condicionamiento por pistas (CotCond): puede aprovechar señales de condicionamiento compactas para mejorar la precisión del reranking sin necesidad de generar razonamientos largos.
- Compatible con text-generation-inference y endpoints de Hugging Face.

## Casos de uso

- Recuperación de información en dominios especializados: el modelo puede reordenar resultados de búsqueda en corpus técnicos (artículos científicos, jurisprudencia, informes financieros) donde la relevancia semántica es crítica.
- Mejora de pipelines RAG (Retrieval-Augmented Generation): integrado como componente de reranking tras una primera etapa de recuperación, selecciona los pasajes más relevantes antes de pasarlos al generador.
- Búsqueda empresarial interna: reordenar documentos corporativos (manuales, políticas, actas) para que los empleados encuentren respuestas precisas en grandes repositorios.
- Sistemas de respuesta a preguntas: combinar el reranking con un modelo generativo para responder preguntas basadas en evidencia, reduciendo alucinaciones al filtrar pasajes irrelevantes.
- Análisis de contratos y documentos legales: identificar cláusulas o párrafos relevantes a partir de consultas específicas, acelerando la revisión documental.
- Moderación de contenido y filtrado: clasificar pasajes por relevancia temática para priorizar revisiones humanas o automatizadas en flujos de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el modelo se evalúa en BRIGHT y NevIR, pero no se incluyen tablas de resultados numéricos. Se remite al paper de HETU para las tablas de evaluación, pero dicho paper no está enlazado en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bf16 ocupa aproximadamente 16,4 GB en disco (pesos), por lo que la inferencia en precisión completa requiere al menos 16-20 GB de VRAM. Con cuantización a 8 bits se reduce a unos 8-10 GB, y a 4 bits a unos 5-6 GB.
- GPU recomendadas: para inferencia en bf16, una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) es adecuada. Con cuantización, una RTX 3090 (24 GB) o RTX 4080 (16 GB) puede ser suficiente.
- Compatibilidad con GPUs de consumo: sí, con cuantización (GGUF o AWQ) puede ejecutarse en GPUs de 8-12 GB, aunque el repo no incluye versiones cuantizadas oficiales.
- Opciones de despliegue: transformers, text-generation-inference, vLLM (si se adapta), llama.cpp (requiere conversión a GGUF), Ollama (requiere conversión previa).
- Latencia y throughput: no disponible. Depende del hardware y de la implementación de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HETU-Qwen3-8B-PassageReranking-CotCond | 8,19 B | no disponible | Reranking de pasajes | no disponible | Hugging Face |
| Qwen3-8B (base) | 8,19 B | 32.768 tokens | Generación de texto general | Apache 2.0 | Hugging Face, Ollama |
| bge-reranker-v2-m3 (BAAI) | 568 M | 8.192 tokens | Reranking multilingüe | MIT | Hugging Face |
| Cohere Rerank 3 | no disponible | 4.096 tokens | Reranking API | Propietaria | API |

La comparativa directa con otros rerankers especializados no es posible sin datos de benchmarks. El modelo HETU se distingue por su tamaño (8B) frente a alternativas más ligeras como bge-reranker, lo que sugiere mayor capacidad pero también mayor coste de inferencia. La licencia no disponible limita su uso comercial hasta que se aclare.

## Limitaciones y advertencias

- Licencia no especificada: no se indica bajo qué términos se distribuye el modelo, lo que impide su uso comercial o en producción sin consultar al autor.
- Sin datos de benchmarks publicados: no se pueden verificar las afirmaciones de rendimiento ni comparar con otros modelos de forma objetiva.
- Sesgos y alucinaciones: al derivar de Qwen3-8B, puede heredar sesgos del corpus de entrenamiento original y generar contenido no verificado si se usa para generación.
- Limitaciones de idioma: no se especifican los idiomas soportados; el modelo base Qwen3-8B es principalmente multilingüe (inglés, chino, etc.), pero el ajuste fino puede haber alterado el comportamiento.
- Contexto limitado: la longitud de contexto no se documenta; se asume la de Qwen3-8B (32.768 tokens), pero no está confirmada.
- Riesgo de sobreajuste: al ser un modelo especializado en reranking, su uso fuera de esa tarea puede degradar el rendimiento respecto al modelo base.
- Sin soporte oficial: el autor no proporciona documentación adicional, demos ni canal de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdarshSingh7647/HETU-Qwen3-8B-PassageReranking-CotCond
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Informe técnico de Qwen3 (arXiv): https://arxiv.org/pdf/2505.09388
- Página de Qwen3-8B en Ollama: https://ollama.com/library/qwen3:8b
