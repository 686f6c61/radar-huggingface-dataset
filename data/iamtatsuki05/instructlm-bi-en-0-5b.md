# iamtatsuki05/InstructLM-Bi-EN-0.5B

## Resumen

InstructLM-Bi-EN-0.5B es un modelo de embeddings de frases en inglés desarrollado por iamtatsuki05 (proyecto MIREI) que adapta el modelo base instruction-pretrain/InstructLM-500M a un encoder bidireccional siguiendo el enfoque LLM2Vec. No es un modelo generativo: su función es producir representaciones vectoriales densas de frases y documentos para tareas de recuperación de información, búsqueda semántica y similitud de oraciones. Con 567.854.592 parámetros totales y una dimensión de embedding de 1536, se posiciona como una alternativa ligera para pipelines de retrieval en inglés.

La relevancia de este modelo radica en su tamaño reducido (aproximadamente 0,5B de parámetros no de embedding) combinado con una arquitectura derivada de Mistral y atención bidireccional, lo que permite desplegarlo en hardware modesto manteniendo la semántica de un LLM preentrenado con instrucciones. El modelo expone métodos específicos `encode_query` y `encode_document` para el patrón asimétrico típico de recuperación, y usa similitud coseno como métrica.

La ventana de contexto está limitada a 2048 tokens, lo que restringe su uso a documentos y consultas de longitud moderada. La licencia MIT facilita su integración comercial, aunque el soporte se limita al inglés y el ecosistema de herramientas asociado es todavía incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral adaptada a encoder bidireccional (estilo LLM2Vec) |
| Parametros totales | 567.854.592 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de instruction-pretrain/InstructLM-500M, un transformer de arquitectura Mistral con tokenizador Mistral de vocabulario 32.000 y codificación posicional RoPE. Sobre esa base se aplica la receta LLM2Vec, que convierte un decoder causal en un encoder bidireccional mediante la eliminación de la máscara causal y el entrenamiento con objetivos de enmascaramiento y contraste, de modo que las representaciones agregadas (pooling) capturan información contextual en ambas direcciones. La dimensión de embedding resultante es 1536.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal. La model card únicamente especifica los requisitos de dependencias (transformers>=4.51.0, accelerate>=1.6.0, sentencepiece>=0.2.0, flash-attn>=2.7.3) y el uso de `trust_remote_code=True` para cargar el código personalizado del encoder.

## Capacidades

- Generación de embeddings de frases y documentos en inglés para similitud semántica y recuperación.
- Métodos diferenciados `encode_query` y `encode_document` para recuperación asimétrica.
- Similitud coseno como métrica nativa de comparación entre vectores.
- Extracción de características (feature-extraction) para pipelines de sentence-similarity.
- Compatible con text-embeddings-inference y endpoints compatibles.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es un encoder de representaciones.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar fragmentos de hasta 2048 tokens con `encode_document` y consultar con `encode_query`, usando similitud coseno para recuperar los pasajes más relevantes en una base vectorial.
- Motor de preguntas frecuentes (FAQ): emparejar consultas de usuarios con respuestas predefinidas mediante embeddings, aprovechando el tamaño reducido del modelo para servir en CPU o GPU de gama baja.
- Deduplicación de contenido: calcular embeddings de artículos o registros y agrupar por umbral de similitud coseno para eliminar duplicados en corpus en inglés.
- Clasificación de textos por similitud: usar los embeddings como características de entrada para clasificadores ligeros (kNN, regresión logística) en tareas de etiquetado.
- Reranking en pipelines RAG: reordenar candidatos recuperados por un retriever inicial comparando la similitud entre la consulta y cada documento con `encode_query`/`encode_document`.
- Moderación y clustering de tickets de soporte: agrupar mensajes de usuarios por temática usando los vectores y detectar patrones recurrentes en inglés.
- Evaluación de similitud entre pares de frases: métricas de calidad en traducción o paráfrasis comparando representaciones con similitud coseno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,2 GB solo para pesos (567,8M parámetros × 2 bytes), más overhead de activaciones y atención.
- Cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 y superiores; también es viable en CPU para cargas moderadas.
- GPU recomendadas para producción: A100, H100 o L4 para alto throughput; RTX 4090 para desarrollo y despliegue en una sola tarjeta.
- Opciones de despliegue: transformers con `trust_remote_code=True`, text-embeddings-inference y endpoints compatibles; requiere flash-attn>=2.7.3 para la atención optimizada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| InstructLM-Bi-EN-0.5B | 567,8M | 2048 | inglés | MIT | Encoder LLM2Vec derivado de Mistral |
| instruction-pretrain/InstructLM-500M | ~0,5B | no disponible | no disponible | no disponible | Modelo base generativo del que deriva |
| Alternativas LLM2Vec de mayor tamaño | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información sobre benchmarks ni de modelos comparables con métricas publicadas en la documentación consultada.

## Limitaciones y advertencias

- Solo soporta inglés; el rendimiento en otros idiomas no está garantizado.
- Ventana de contexto de 2048 tokens: documentos más largos deben fragmentarse, lo que puede degradar la calidad de la recuperación.
- Es un encoder, no un modelo generativo: no puede responder preguntas ni generar texto por sí mismo.
- Riesgo de alucinación no aplica directamente al no generar texto, pero los embeddings pueden producir similitudes espurias en dominios fuera de distribución.
- No se han publicado evaluaciones de sesgo ni de robustez; se desconoce el comportamiento en dominios especializados.
- Requiere `trust_remote_code=True` y flash-attn, lo que añade dependencias y superficie de riesgo en producción.
- El repositorio tiene muy pocas descargas (5) y ningún like, lo que sugiere una validación comunitaria mínima.
- La licencia MIT permite uso comercial, pero conviene verificar las obligaciones derivadas del modelo base InstructLM-500M.

## Enlaces

- Hugging Face: https://huggingface.co/iamtatsuki05/InstructLM-Bi-EN-0.5B
- Modelo base: https://huggingface.co/instruction-pretrain/InstructLM-500M
- Colección MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- GitHub: https://github.com/iamtatsuki05/MIREI
- Licencia MIT: https://opensource.org/license/mit/
