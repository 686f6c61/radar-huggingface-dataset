# Jayden04260/hs-code-embedder-bge-large

## Resumen

hs-code-embedder-bge-large es un modelo de embeddings de frases derivado de BAAI/bge-large-en-v1.5 mediante fine-tuning supervisado, especializado en la recuperación (retrieval) de códigos arancelarios del Reino Unido (sistema HS, Harmonized System). Lo desarrolla Jayden04260 y forma parte del proyecto hs-code-classifier, donde actúa como el componente de recuperación que empareja descripciones libres de productos en inglés con entradas de referencia del UK Trade Tariff. Resuelve un problema muy concreto: la clasificación aduanera manual de mercancías, que requiere mapear texto comercial ambiguo a códigos de 10 dígitos.

El modelo parte de la arquitectura BERT de bge-large-en-v1.5, con 335.141.888 parámetros totales, y se distribuye en formato safetensors con licencia MIT. Su entrenamiento consistió en una única época de aprendizaje contrastivo sobre aproximadamente 14.000 pares construidos a partir de datos públicos de referencia del arancel británico. No es un modelo generativo: su salida son vectores de embedding normalizados para similitud coseno.

Es relevante porque demuestra que un ajuste fino pequeño y barato sobre un encoder generalista mejora de forma medible la precisión top-1 en una tarea vertical muy específica, superando tanto a un pipeline con re-ranker como al modelo base sin ajustar. Su alcance es limitado (inglés, vocabulario del arancel británico) y su uso previsto es asistir a un clasificador humano, no sustituirlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (base: BAAI/bge-large-en-v1.5) |
| Parametros totales | 335.141.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer denso (familia BERT) heredado de BAAI/bge-large-en-v1.5, con 335 millones de parámetros. Se entrena como modelo de similitud de frases mediante la librería sentence-transformers. Las consultas (queries) requieren el prefijo de recuperación característico de la familia bge ("Represent this sentence for searching relevant passages: "), mientras que las entradas del arancel se embeben sin prefijo. La salida se normaliza para usar similitud coseno.

El entrenamiento consistió en una época de aprendizaje contrastivo con MultipleNegativesRankingLoss, batch size de 32 y learning rate de 1e-5, sobre aproximadamente 14.000 pares generados a partir de datos públicos de referencia del UK Trade Tariff (licencia Open Government Licence v3.0). Los pares se construyeron con tres estrategias: título de referencia emparejado con otro título de referencia del mismo código de mercancía; título emparejado con el texto oficial de nomenclatura de su partida (heading); y partida emparejada con el texto de su capítulo. Los pares provienen exclusivamente del lado de entrenamiento del split del proyecto; los conjuntos de evaluación nunca se usaron en entrenamiento. El script de entrenamiento está publicado en el repositorio del proyecto (train_embedder.py).

## Capacidades

- Generación de embeddings de texto para recuperación semántica y similitud de frases (pipeline sentence-similarity).
- Emparejamiento de descripciones libres de productos en inglés con entradas de referencia del arancel británico (HS/commodity codes).
- Recuperación top-k sobre un corpus de aproximadamente 10.000 entradas del arancel mediante similitud coseno.
- Soporte de prefijo de consulta específico de la familia bge para mejorar la recuperación.
- Compatible con text-embeddings-inference y endpoints de Hugging Face.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades multimodales: es exclusivamente un encoder de recuperación.

## Casos de uso

- Clasificación aduanera asistida: dado un listado de producto en inglés, el modelo recupera los códigos candidatos del arancel y un clasificador humano valida el resultado final. Es adecuado porque su precisión top-1 en títulos retenidos (0,50) supera al modelo base (0,43) y al pipeline con re-ranker (0,42).
- Enriquecimiento de catálogos de comercio electrónico: asignar automáticamente una partida arancelaria tentativa a cada ficha de producto para precalcular aranceles y requisitos de importación.
- Búsqueda semántica sobre nomenclatura arancelaria: construir un índice vectorial de las entradas del tarifario y ofrecer búsqueda por descripción libre en lugar de por coincidencia exacta de términos.
- Pre-filtrado en pipelines de despacho aduanero: reducir el conjunto de códigos candidatos antes de la revisión experta, disminuyendo el tiempo de clasificación manual.
- Deduplicación y normalización de descripciones de mercancías: agrupar productos descritos de forma distinta que corresponden a la misma partida mediante similitud de embeddings.
- Evaluación de calidad de datos arancelarios: detectar entradas de referencia mal etiquetadas comparando su embedding con el de productos reales clasificados por expertos (por ejemplo, sobre el conjunto HSCodeComp).
- Integración en sistemas de compliance: como señal de apoyo en herramientas internas de cumplimiento comercial, siempre con verificación humana y sin valor de dictamen legal.

## Benchmarks y rendimiento

Precisión top-1 mediante recuperación sobre aproximadamente 10.000 entradas del arancel británico (similitud coseno, sin re-ranking):

| Test | all-MiniLM-L6-v2 + re-ranker ms-marco | bge-large sin ajustar | hs-code-embedder-bge-large |
|---|---|---|---|
| 500 títulos retenidos del arancel: código exacto de 10 dígitos | 0,42 | 0,43 | 0,50 |
| HSCodeComp, listados reales: partida de 4 dígitos | 0,30 | 0,40 | 0,43 |
| HSCodeComp: capítulo de 2 dígitos | 0,51 | 0,60 | 0,67 |

HSCodeComp contiene 632 listados de marketplace ruidosos clasificados por expertos en aduanas. Sus códigos son estadounidenses, por lo que solo se comparan los dígitos internacionalmente compartidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 335 millones de parámetros en fp32 el modelo ocupa aproximadamente 1,3 GB de pesos, y en fp16 alrededor de 0,7 GB, más el espacio de activaciones y del índice vectorial.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre es suficiente para inferencia; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: sentence-transformers, text-embeddings-inference (etiqueta endpoints_compatible), y servidores de embeddings compatibles con la interfaz de Hugging Face.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hs-code-embedder-bge-large | 335 M | no disponible | 0,50 / 0,43 / 0,67 (top-1) | MIT | Hugging Face |
| BAAI/bge-large-en-v1.5 (sin ajustar) | 335 M | no disponible | 0,43 / 0,40 / 0,60 (top-1) | MIT | Hugging Face |
| all-MiniLM-L6-v2 + re-ranker ms-marco | no disponible | no disponible | 0,42 / 0,30 / 0,51 (top-1) | Apache 2.0 (MiniLM) | Hugging Face |

## Limitaciones y advertencias

- Solo inglés: no soporta consultas ni documentos en otros idiomas.
- El modelo está ajustado al vocabulario del arancel británico; los seis primeros dígitos del sistema HS son internacionales, pero el resto es específico del Reino Unido.
- Genera candidatos para verificación humana; no constituye un dictamen aduanero ni asesoramiento legal.
- HSCodeComp está compuesto mayoritariamente por bienes de consumo en línea; la precisión en bienes a granel, industriales o químicos no está medida.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de recuperaciones incorrectas: la precisión top-1 es de 0,50 en códigos exactos de 10 dígitos, por lo que la mitad de las consultas no aciertan el código exacto en primera posición.
- El conjunto de evaluación es pequeño (500 títulos retenidos y 632 listados), lo que limita la robustez estadística de las cifras.
- Modelo con muy poca adopción (23 descargas, 0 likes) y sin validación comunitaria; conviene evaluarlo en el dominio propio antes de usarlo en producción.
- Licencia MIT permite uso comercial, pero los datos de entrenamiento derivan de datos públicos del gobierno británico bajo Open Government Licence v3.0, cuyos términos deben respetarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jayden04260/hs-code-embedder-bge-large
- Modelo base: https://huggingface.co/BAAI/bge-large-en-v1.5
- Repositorio del proyecto hs-code-classifier: https://github.com/Jayden04260/hs-code-classifier
- Script de entrenamiento: https://github.com/Jayden04260/hs-code-classifier/blob/main/train_embedder.py
- Dataset HSCodeComp: https://huggingface.co/datasets/ATH-MaaS/HSCodeComp
