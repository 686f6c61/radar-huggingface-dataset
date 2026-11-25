# richardyoung/CardioEmbed-BGE-large-v1.5

## Resumen

CardioEmbed-BGE-large-v1.5 es un adaptador LoRA sobre el modelo de embeddings BAAI/bge-large-en-v1.5, especializado en texto clinico de cardiologia. Lo desarrolla Richard Young (DeepNeuro) como parte de un estudio comparativo de 10 arquitecturas de embeddings para representacion de texto en cardiologia clinica, publicado en arXiv:2511.19739. El modelo resuelve el problema de la baja separabilidad semantica de los embeddings genericos en terminologia cardiologica especializada (farmacos, procedimientos, hallazgos ecocardiograficos, etc.).

El modelo no es un generador de texto: es un encoder de frases (sentence-similarity) que produce representaciones vectoriales densas de 1024 dimensiones (heredadas de BGE-large). Su relevancia radica en que demuestra que un ajuste LoRA ligero (r=16, alpha=32) sobre un modelo base de proposito general puede mejorar la separacion semantica en un dominio medico concreto, con solo 106.535 pares de texto de libros de texto medicos y sin necesidad de reentrenar el encoder completo.

La licencia es Apache 2.0 y el modelo base es BAAI/bge-large-en-v1.5, con lo que el adaptador es ligero y desplegable sobre la infraestructura existente de BGE. El modelo esta pensado exclusivamente para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-large) con adaptador LoRA sobre BAAI/bge-large-en-v1.5 |
| Parametros totales | no disponible (adaptador LoRA: r=16, alpha=32; el modelo base BGE-large tiene ~335 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base BGE-large admite 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32 aplicado sobre el encoder BERT-large de BAAI/bge-large-en-v1.5. No modifica la arquitectura base: se inyectan matrices de bajo rango en las capas del transformer y se entrena solo esa parte, manteniendo congelados los pesos originales. El resultado es un adaptador de pocos megabytes que se carga con `PeftModel.from_pretrained` sobre el modelo base.

El entrenamiento se realizo sobre 106.535 pares de texto de cardiologia extraidos de libros de texto medicos, con la funcion de perdida Multiple Negatives Ranking Loss (InfoNCE), tipica en el entrenamiento de modelos de similitud de frases. No se menciona en la informacion disponible el uso de RLHF ni DPO (no aplica a un encoder de embeddings). La innovacion tecnica principal es la adaptacion de dominio con LoRA sobre un encoder de proposito general, evaluada dentro de un estudio comparativo mas amplio de 10 arquitecturas.

## Capacidades

- Generacion de embeddings de frases para similitud semantica y recuperacion de informacion en el dominio de cardiologia.
- Representacion densa de 1024 dimensiones (heredada de BGE-large).
- Similitud de frases (sentence-similarity) para busqueda semantica y clustering.
- Especializacion en terminologia cardiologica clinica (farmacos, procedimientos, hallazgos).
- No soporta tool calling ni function calling (es un encoder, no un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Busqueda semantica en bases de conocimiento cardiologico: indexar guias clinicas y articulos, y recuperar fragmentos relevantes mediante similitud coseno de los embeddings generados.
- Deduplicacion y clustering de registros clinicos: agrupar notas de cardiologia con contenido equivalente aunque usen terminologia distinta, gracias a la adaptacion de dominio.
- Sistemas de recomendacion de literatura medica: emparejar consultas de clinicos con resumenes de articulos de cardiologia mediante similitud de embeddings.
- Clasificacion de textos clinicos por similitud: asignar categorias (p. ej. tipo de patologia) comparando el embedding del texto con embeddings de prototipos por categoria.
- Enrutamiento de consultas en asistentes clinicos: decidir si una consulta pertenece al dominio de cardiologia comparando su embedding con un centroide del dominio.
- Deteccion de duplicados en ensayos clinicos o formularios: identificar entradas redundantes en bases de datos de estudios cardiovasculares.
- Recuperacion aumentada (RAG) sobre corpus de cardiologia en ingles: usar el modelo como retriever en pipelines RAG, sustituyendo al BGE base para mejorar la precision en el dominio.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Separation Score | 0.314 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MTEB, etc.). El unico dato de rendimiento es el Separation Score de 0.314 reportado por el autor. No se dispone de comparaciones numericas con otros modelos del estudio en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es ligero (repo de 0.0 GB); el modelo base BGE-large (~335 M parametros) requiere aproximadamente 1,3 GB en fp32 y ~0,7 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes y sobradas para el encoder.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1060 6 GB o superior).
- Opciones de despliegue: transformers + peft (carga del adaptador), sentence-transformers (tras fusionar el adaptador), y servidores de embeddings como TEI (Text Embeddings Inference) o vLLM en modo embedding.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al ser un encoder BERT-large, el throughput es alto en GPU (miles de frases por segundo en A100 con batching).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CardioEmbed-BGE-large-v1.5 | ~335 M (base) + LoRA | no disponible (base: 512) | Cardiologia | Apache 2.0 | Hugging Face |
| BAAI/bge-large-en-v1.5 | ~335 M | 512 | General | MIT | Hugging Face |
| BAAI/bge-base-en-v1.5 | ~110 M | 512 | General | MIT | Hugging Face |
| Modelos del estudio comparativo (otros 9) | no disponible | no disponible | Cardiologia | no disponible | no disponible |

La comparacion cuantitativa con las otras 9 arquitecturas evaluadas en arXiv:2511.19739 no esta disponible en la informacion proporcionada. Frente al BGE base, la diferencia es la adaptacion de dominio mediante LoRA; frente a BGE-base, el tamano es mayor y la especializacion distinta.

## Limitaciones y advertencias

- Solo soporta ingles; no es adecuado para texto clinico en castellano u otros idiomas.
- Es un encoder de embeddings, no un modelo generativo: no produce texto ni responde preguntas directamente.
- Riesgo de sesgo heredado del corpus de libros de texto medicos utilizado (posible infrarrepresentacion de poblaciones o patologias poco frecuentes).
- El Separation Score de 0.314 es la unica metrica reportada; no hay validacion en benchmarks estandar de recuperacion (MTEB, BEIR) en la informacion disponible.
- Requiere cargar el modelo base BAAI/bge-large-en-v1.5 ademas del adaptador; no es un modelo autonomo.
- Aunque la licencia es Apache 2.0, el uso clinico real exige validacion regulatoria y supervision medica; no debe usarse como dispositivo medico sin certificacion.
- El modelo tiene pocas descargas (18) y 0 likes, lo que sugiere escasa validacion por parte de la comunidad.
- No se especifica la longitud de contexto efectiva del adaptador; se asume la del modelo base (512 tokens).

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/CardioEmbed-BGE-large-v1.5
- Paper: https://arxiv.org/abs/2511.19739
- Modelo base: https://huggingface.co/BAAI/bge-large-en-v1.5
- Perfil del autor: https://deepneuro.ai/richard
