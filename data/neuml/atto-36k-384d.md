# NeuML/atto-36k-384d

## Resumen

Atto es una familia de modelos contextuales compactos desarrollada por NeuML, orientada al aprendizaje de representaciones lingüísticas con eficiencia de parámetros. El modelo concreto identificado como `atto-36k-384d` emplea una arquitectura personalizada (requiere `trust_remote_code=True` en Transformers) y está pensado como codificador de representaciones para tareas de procesamiento de lenguaje natural, no como un modelo generativo conversacional. Su nomenclatura sugiere una dimensión de representación de 384 y una ventana de contexto de 36 000 tokens, aunque la model card no explicita formalmente estos valores.

La relevancia de este modelo radica en su enfoque de eficiencia: modelos pequeños con arquitecturas optimizadas para producir embeddings o representaciones contextuales de calidad, aptos para despliegue en entornos con recursos limitados. Está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial, y su integración con Hugging Face Transformers lo hace accesible desde pipelines estándar.

La información pública disponible es escasa: el repositorio figura con 0 GB de tamaño y 0 descargas en el momento de la consulta, y la model card remite al artículo "Introducing Atto" del blog de Hugging Face para detalles de arquitectura, metodología y benchmarks. Por tanto, muchos datos técnicos deben considerarse no disponibles a partir de la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer personalizada (custom architecture, requiere `trust_remote_code=True`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (la nomenclatura "36k" sugiere 36 000 tokens, sin confirmar en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card indica que Atto es una familia de modelos contextuales compactos diseñados para aprendizaje de representaciones lingüísticas con eficiencia de parámetros. Se trata de una arquitectura personalizada que no se carga con las clases estándar de Transformers sin `trust_remote_code=True`, lo que implica componentes de modelado propios definidos en el repositorio. No se especifica en la información disponible si es un transformer denso, híbrido o basado en atención lineal; el artículo de presentación es la referencia indicada para los detalles.

Respecto al entrenamiento, la model card únicamente publica tres hiperparámetros: `learning_rate = 0.001`, `gradient_accumulation_steps = 1` y `fp16 = True`. No se detalla el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se describe ninguna innovación técnica específica más allá de la propia arquitectura personalizada.

## Capacidades

- Aprendizaje de representaciones contextuales del lenguaje (modelo tipo encoder/codificador, no generativo según la información disponible).
- Generación de embeddings contextuales para tareas posteriores de NLP (clasificación, similitud, recuperación).
- Soporte de inglés como único idioma declarado.
- Carga mediante Hugging Face Transformers con `AutoModel` y `trust_remote_code=True`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponible.
- Modo "thinking": no disponible.

## Casos de uso

- Generación de embeddings para búsqueda semántica: el modelo puede producir representaciones vectoriales de documentos y consultas para alimentar índices vectoriales en sistemas de recuperación de información, aprovechando su diseño compacto y su orientación a representaciones.
- Clasificación de texto: usar las representaciones del modelo como entrada a una cabeza de clasificación para tareas como análisis de sentimiento o categorización de documentos en inglés.
- Similitud semántica y deduplicación: calcular similitud entre pares de textos para detectar duplicados o agrupar contenido temáticamente similar.
- Reranking en pipelines RAG: emplear las representaciones para reordenar candidatos recuperados por un sistema de búsqueda antes de pasarlos a un modelo generativo.
- Extracción de características para clustering: agrupar grandes volúmenes de documentos en inglés mediante embeddings y algoritmos de clustering no supervisado.
- Prototipado en entornos con recursos limitados: su tamaño compacto (familia "atto") permite experimentar en máquinas sin GPU dedicada, integrándolo en flujos de desarrollo locales.
- Base para fine-tuning ligero: al estar bajo Apache 2.0, puede servir como punto de partida para ajuste en tareas específicas de dominio en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al artículo "Introducing Atto" del blog de Hugging Face para consultar los resultados de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del número de parámetros, que no se especifica; la familia "atto" se describe como compacta).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable dada la naturaleza compacta de la familia, pero sin datos confirmados.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`; compatibilidad con vLLM, llama.cpp, Ollama o TGI no disponible (la arquitectura personalizada puede limitar el soporte en motores de inferencia alternativos).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría ni datos de rendimiento que permitan establecer una comparación fundamentada.

## Limitaciones y advertencias

- La información pública es muy escasa: no se publican número de parámetros, contexto exacto, datos de entrenamiento ni benchmarks en la model card.
- El modelo declara únicamente inglés; su rendimiento en castellano u otros idiomas no está documentado.
- Al ser un modelo de representaciones y no generativo, no debe emplearse para generación de texto conversacional.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor; conviene auditar dicho código antes de usarlo en producción.
- Riesgo de sesgos y alucinaciones: no documentado; al no ser generativo, el riesgo de alucinación aplica principalmente a las tareas posteriores que consuman sus representaciones.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar los términos exactos del repositorio y del código personalizado asociado.
- El repositorio figura con 0 GB y 0 descargas, lo que sugiere que los pesos podrían no estar disponibles o que el modelo es de reciente publicación; verificar la integridad de los archivos antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeuML/atto-36k-384d
- Artículo "Introducing Atto": https://hf.co/blog/neuml/introducing-atto
