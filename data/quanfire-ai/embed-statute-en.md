# quanfire-ai/embed-statute-en

## Resumen

`embed-statute-en` es un adaptador de recuperación semántica especializado en texto legal indio de carácter estatutario (Central Acts, secciones, subsecciones y epígrafes marginales). Ha sido desarrollado por Quanfire AI como complemento a su modelo hermano `embed-legal-en`, que cubre jurisprudencia (sentencias). Este adaptador resuelve el problema de recuperar pasajes concretos de legislación a partir de consultas en lenguaje natural, un registro donde el modelo base `intfloat/multilingual-e5-small` mostraba un rendimiento plano.

Técnicamente es una adaptación LoRA sobre el modelo base congelado `intfloat/multilingual-e5-small` (118M parámetros, 384 dimensiones, contexto máximo 256 tokens). El adaptador pesa aproximadamente 2,4 MB y produce vectores normalizados L2. Está entrenado sobre 858 Central Acts del Parlamento indio, con minería de hard negatives y dos épocas de entrenamiento. Su licencia es Apache-2.0, lo que permite uso comercial con atribución a la fuente del corpus.

La relevancia actual del modelo radica en que aborda un nicho concreto: la búsqueda de disposiciones legales en corpus extensos de legislación india, donde los modelos genéricos de embeddings fallan por falta de vocabulario jurídico específico. Los resultados publicados muestran una mejora del 48 % en Recall@1 sobre el base, y del 131 % en el subconjunto de pares con baja superposición léxica, lo que sugiere que ha aprendido semántica estatutaria y no solo coincidencia superficial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (e5-small) con adaptador LoRA |
| Parametros totales | 118M (base) + adaptador LoRA ~2,4 MB |
| Parametros activos | 118M (base congelado) + LoRA (rank 32) |
| Longitud de contexto | 256 tokens (max_length) |
| Tipos de cuantizacion | no disponible (pesos en float32, bf16 para entrenamiento) |
| Idiomas soportados | Inglés (solo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador) + framework quanfire-multilingual-embedding |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `intfloat/multilingual-e5-small`, un transformer encoder de la familia E5 con 12 capas y 118M parámetros. El adaptador se aplica a las proyecciones `query` y `value` de la atención, con rank 32 y alpha 64. El pooling es mean pooling sobre los tokens de salida, y los vectores resultantes se normalizan L2 a 384 dimensiones. El modelo es simétrico: no requiere prefijos de consulta o pasaje, lo que simplifica su uso en pipelines de búsqueda.

El entrenamiento se realizó sobre un corpus construido a partir de 858 Central Acts del Parlamento indio, minado en pares contrastivos a nivel de sección. Se usaron hard negatives extraídos del propio adaptador (4 por par) con margen positivo de 0,05. El entrenamiento duró 2 épocas con learning rate 1e-4 en bf16 sobre CUDA. No se aplicó RLHF ni DPO; es un entrenamiento contrastivo estándar de embeddings.

## Capacidades

- Recuperación semántica de pasajes de legislación india central (secciones, subsecciones, epígrafes marginales) a partir de consultas en lenguaje natural.
- Similitud sección a sección dentro de un corpus de Actas, útil para encontrar disposiciones relacionadas.
- Búsqueda de tipo "encuentra la disposición que dice X" sobre un corpus de Actas.
- Generación de embeddings normalizados L2 de 384 dimensiones, compatibles con búsqueda por similitud coseno.
- Integración como servicio HTTP compatible con OpenAI (`POST /v1/embeddings`) mediante el framework `quanfire-multilingual-embedding`.
- Pipeline de búsqueda semántica en proceso con `SemanticSearchPipeline`, que indexa pasajes y devuelve resultados rankeados.
- Soporte de búsqueda exacta (fuerza bruta) hasta ~10⁵–10⁶ vectores; para volúmenes mayores se recomienda índice ANN.

## Casos de uso

- Búsqueda de disposiciones legales en corpus de Actas: un abogado o investigador formula una consulta como "¿cuál es el castigo por la quiebra de confianza criminal por parte de un funcionario público?" y el modelo recupera la sección relevante del Código Penal indio.
- Asistencia a redacción legal: al redactar un contrato o una alegación, el modelo puede encontrar secciones de Actas relacionadas con un concepto, ayudando a citar la normativa correcta.
- Sistemas de pregunta-respuesta sobre legislación: combinado con un LLM generativo, el modelo actúa como recuperador en un pipeline RAG para responder consultas legales con citas precisas.
- Análisis de coherencia normativa: comparar secciones de diferentes Actas para detectar solapamientos o contradicciones, usando la similitud coseno entre embeddings.
- Indexación de bibliotecas legales digitales: organizar y etiquetar automáticamente corpus de legislación india para facilitar su navegación.
- Herramientas de cumplimiento normativo: verificar si una práctica empresarial concreta tiene correspondencia con alguna disposición estatutaria, buscando pasajes relevantes.
- Formación de modelos de clasificación legal: los embeddings generados pueden servir como características de entrada para clasificadores de tipos de disposiciones o materias.

## Benchmarks y rendimiento

Los resultados publicados corresponden a un conjunto de evaluación retenido de 1.978 pares de estatutos centrales (2.000 muestreados, 22 consultas duplicadas eliminadas). Se comparan contra el modelo base `intfloat/multilingual-e5-small` sin adaptador, sobre los mismos pares.

| Metrica | base e5-small | embed-statute-en | cambio |
|---|---|---|---|
| Recall@1 | 0.182 | 0.269 | +48 % |
| Recall@5 | 0.346 | 0.488 | +41 % |
| Recall@10 | 0.411 | 0.575 | +40 % |
| MRR | 0.262 | 0.375 | +43 % |
| nDCG@10 | 0.290 | 0.415 | +43 % |

Los intervalos de confianza del 95 % para Recall@1 son disjuntos: base [0.165, 0.199] vs adaptador [0.250, 0.289], lo que indica que la mejora no es ruido de muestreo.

En el subconjunto de baja superposición léxica (token overlap < 0.3, n = 874), donde un emparejador de cadenas no puede resolver la tarea:

| Slice de superposicion lexica | base Recall@1 | embed-statute-en | cambio |
|---|---|---|---|
| baja <0.3 (n = 874) | 0.077 | 0.177 | +131 % |
| media 0.3–0.7 (n = 1.104) | 0.265 | 0.342 | +29 % |

En este slice, Recall@10 sube de 0.245 a 0.462. Por tipo de par, la mejora se mantiene: secciones adyacentes 0.185 → 0.287 (n = 1.488) y epígrafe↔sección 0.172 → 0.215 (n = 489).

No se han publicado resultados en benchmarks generales tipo MMLU, HumanEval o GSM8K, ya que no es un modelo generativo sino un encoder de embeddings.

## Requisitos de hardware

- El adaptador LoRA pesa ~2,4 MB, por lo que el requisito principal es el modelo base `intfloat/multilingual-e5-small` (118M parámetros).
- VRAM estimada para inferencia: ~0,5 GB en float32, ~0,25 GB en float16. Cabe en cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB o superior, RTX 3060, etc.).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia cómoda; para entrenamiento se usó CUDA con bf16, por lo que se recomienda una GPU con soporte bf16 (RTX 30xx o superior, A100, etc.).
- Opciones de despliegue: el framework `quanfire-multilingual-embedding` ofrece un servidor HTTP compatible con OpenAI (`qfme serve`), así como uso en proceso con `SemanticSearchPipeline`. También puede integrarse en vLLM o TGI si se envuelve como modelo de embeddings, aunque no hay documentación específica.
- Latencia y throughput: no disponible. Dado el tamaño del modelo, se espera una latencia de milisegundos por lote pequeño en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Especialidad |
|---|---|---|---|---|---|
| embed-statute-en | Adaptador LoRA sobre e5-small | 118M + LoRA | 256 | Apache-2.0 | Estatutos centrales indios (inglés) |
| embed-legal-en (hermano) | Adaptador LoRA sobre e5-small | 118M + LoRA | 256 | Apache-2.0 | Sentencias del Tribunal Supremo indio |
| intfloat/multilingual-e5-small (base) | Transformer encoder | 118M | 512 (original) | MIT | Multilingüe genérico |

La comparativa directa con otros modelos de embeddings legales (p. ej. `legal-bert` o `law-bert`) no está disponible en la información proporcionada. El modelo se posiciona como especialista en un registro muy concreto (estatutos centrales indios en inglés), donde supera claramente al base genérico. Su hermano `embed-legal-en` cubre el registro de jurisprudencia, por lo que ambos son complementarios.

## Limitaciones y advertencias

- No es válido para texto de jurisprudencia o sentencias: para ese registro debe usarse `embed-legal-en`.
- No se ha evaluado en legislación estatal india, reglas, notificaciones o contratos; el autor recomienda traer una evaluación propia antes de confiar en el modelo para esos dominios.
- Solo soporta inglés; no funciona con texto legal en hindi, tamil u otros idiomas indios.
- El contexto máximo es de 256 tokens, lo que limita el tamaño de los pasajes que puede procesar de una vez; pasajes más largos deben truncarse o dividirse.
- El corpus de entrenamiento se limita a 858 Central Acts; puede haber sesgos hacia las materias más representadas en ese corpus.
- La licencia Apache-2.0 permite uso comercial, pero se requiere atribución a la fuente del dataset (los textos legales son de dominio público, pero la compilación puede tener restricciones).
- No se han publicado evaluaciones de sesgos o alucinaciones, aunque al ser un modelo de embeddings el riesgo de alucinación es menor que en modelos generativos.
- El rendimiento en producción depende del volumen de vectores: para más de 10⁶ vectores se necesita un índice ANN, no está incluido en el framework.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quanfire-ai/embed-statute-en
- Modelo hermano (jurisprudencia): https://huggingface.co/quanfire-ai/embed-legal-en
- Repositorio de código: https://github.com/quanfire-ai/quanfire-multilingual-embedding
- Documentación del framework (modelos): https://github.com/Quanfire-AI/quanfire-multilingual-embedding/tree/main/models
- Ejemplo de walkthrough: https://github.com/Quanfire-AI/quanfire-multilingual-embedding/blob/main/examples/walkthrough/README.md
- Blog sobre corpus legal y derechos de autor: https://www.quanfire.ai/blog/legal-embedding-public-domain-corpus
- Perfil de la organización: https://huggingface.co/quanfire-ai/models
