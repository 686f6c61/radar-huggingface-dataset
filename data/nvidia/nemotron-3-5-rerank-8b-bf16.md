# nvidia/Nemotron-3.5-Rerank-8B-BF16

## Resumen

Nemotron-3.5-Rerank-8B-BF16 es un modelo de reranking (cross-encoder) desarrollado por NVIDIA para recuperación de información multilingüe y multimodal. Su función es recibir un par consulta-documento y devolver un logit de relevancia: cuanto mayor es el valor, más relevante es el documento para la consulta. El documento puede ser texto, una imagen de página o una combinación de ambos, incluyendo gráficos, tablas e infografías, lo que lo sitúa en el terreno de los pipelines de RAG con visión (vision RAG) clásicos o agénticos.

El modelo parte del backbone Ministral-3-8B-Instruct-2512-BF16 de Mistral AI y se ha reconvertido en reranker mediante un entrenamiento en dos fases: primero con mezclas de datos solo de texto y después con datos de imagen y de imagen más texto. Incorpora un encoder de visión basado en Pixtral y una torre de lenguaje Ministral3 bidireccional, con 8.381.159.424 parámetros totales (8,38B) y una longitud de contexto máxima de 32.768 tokens. La resolución por defecto de la imagen es `longest_edge` de 1.120 píxeles, ampliable a 1.540.

Su relevancia actual radica en que cubre la fase de reranking de sistemas de recuperación multimodales, un componente crítico para mejorar la precisión de los documentos recuperados antes de la generación. Se distribuye con licencia OpenMDW-1.1 y está listo, según el autor, para uso comercial y no comercial. En el momento de la consulta acumula 662 descargas y 15 "likes" en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con encoder de visión basado en Pixtral y torre de lenguaje Ministral3 bidireccional (cross-encoder) |
| Parametros totales | 8.381.159.424 (8,38B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Multilingüe; etiquetas declaradas: en, ar, as, bn, bg, zh, da, nl, fi, fr, de, hi, id, it, ja, ko, ms, mr, ne, no, fa, pt, ro, ru, es, sw, sv, ta, te, th, uk, ur, vi. Evaluado en 34 idiomas para texto y 18 para imagen |
| Licencia | OpenMDW-1.1 (el modelo base Ministral-3-8B-Instruct-2512-BF16 está bajo Apache 2.0) |
| Formato de pesos | safetensors, precisión BF16 |

Datos adicionales de entrada y salida: la entrada admite texto (string) e imagen (RGB), con `longest_edge` por defecto de 1.120 píxeles y máximo de 1.540. La salida es una lista unidimensional de flotantes (logits crudos), uno por par consulta-documento. El tamaño del repositorio es de 16,8 GB.

## Arquitectura y entrenamiento

Se trata de un transformer cross-encoder con dos componentes: un encoder de visión de tipo Pixtral, que procesa las imágenes de página, y una torre de lenguaje Ministral3 que opera de forma bidireccional sobre el par consulta-documento. El modelo no genera texto: colapsa la representación del par en un único logit de relevancia mediante una cabeza de clasificación de secuencias (`AutoModelForSequenceClassification`). La atención bidireccional es la habitual en cross-encoders de reranking, ya que permite que la consulta y el documento se condicionen mutuamente en todas las capas.

El entrenamiento se realizó en dos etapas. En la primera, un checkpoint reranker de 8B derivado del backbone Ministral-3-8B-Instruct-2512-BF16 se entrenó sobre una mezcla de conjuntos de datos solo de texto. En la segunda, el modelo resultante se entrenó con datos de imagen y de imagen más texto, habilitando así el reranking de documentos visuales. El autor no detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de alineación como RLHF o DPO. La model card indica que el entrenamiento y las evaluaciones se ejecutaron con `transformers==5.12.1`, y que el checkpoint usa `TokenizersBackend` sin requerir `mistral_common`.

## Capacidades

- Reranking de pares consulta-documento: asigna una puntuación de relevancia (logit) a cada candidato, permitiendo reordenar los resultados de una recuperación densa previa.
- Reranking multimodal: acepta documentos que son solo texto, solo imagen o una combinación de ambos, incluyendo gráficos, tablas e infografías.
- Recuperación visual de documentos: orientado a casos en los que la información relevante está en la maquetación de la página y no en texto extraíble.
- Cobertura multilingüe amplia: 34 idiomas evaluados en recuperación de texto (incluido hinglish) y 18 en recuperación de imagen.
- Integración en pipelines RAG: pensado como etapa de refino entre el recuperador denso y el generador, tanto en arquitecturas clásicas como agénticas.
- Soporte de contexto largo: hasta 32.768 tokens por par, útil para documentos extensos.
- Compatibilidad de despliegue: etiquetas de `sentence-transformers`, `transformers` y `vllm`; ejemplos oficiales con Flash Attention 2.
- No dispone de tool calling, capacidades de agente propias ni generación de texto: es un modelo discriminativo de ranking.

## Casos de uso

- RAG empresarial sobre documentación escaneada: se usa como segunda etapa tras un recuperador denso multimodal para reordenar facturas, contratos o informes en PDF que contienen tablas y sellos; el encoder de visión permite puntuar la página tal cual, sin depender de un OCR imperfecto.
- Búsqueda semántica multilingüe en catálogos: en un comercio con fichas de producto en varios idiomas, el modelo reordena los candidatos recuperados y aprovecha su cobertura de 34 idiomas para consultas en español que deben casar con documentos en inglés o alemán.
- Asistentes de atención al cliente con base de conocimiento mixta: artículos de ayuda en texto e imágenes de interfaz se puntúan con el mismo modelo, lo que simplifica la arquitectura al no necesitar dos rerankers separados.
- Recuperación en documentación técnica con diagramas: manuales de ingeniería donde la respuesta está en un esquema; el modelo puntúa la página con el diagrama y prioriza las que realmente responden a la consulta.
- Verificación de citas y atribución de fuentes: dado un fragmento generado y un conjunto de documentos candidatos, el logit de relevancia permite seleccionar las fuentes más pertinentes antes de mostrar referencias al usuario.
- Filtrado de candidatos en pipelines agénticos: un agente que hace varias rondas de búsqueda puede usar el reranker para decidir qué documentos merecen pasar al contexto del generador, reduciendo coste de tokens y ruido.
- Moderación y deduplicación semántica: puntuar pares de documentos entre sí para detectar duplicados o contenidos muy similares dentro de un corpus, usando el mismo mecanismo de cross-encoding.
- Evaluación de calidad de recuperadores: servir como referencia para medir la mejora de un sistema de búsqueda antes y después del reranking en conjuntos de validación internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card facilita el número de idiomas evaluados (34 en texto, 18 en imagen) y los conjuntos de evaluación empleados por el autor, pero no incluye puntuaciones numéricas tipo MMLU, HumanEval, GSM8K ni métricas de recuperación como nDCG o MRR.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 16,8 GB solo para pesos (tamaño del repositorio). Sumando activaciones del encoder de visión y la caché de contexto, se recomienda reservar 40 GB o más para trabajar con las 32.768 posiciones de contexto.
- GPU recomendadas: NVIDIA A100 40 GB, H100, L40S 48 GB o A6000 48 GB para BF16 con contexto completo. El autor indica que el modelo está optimizado para sistemas acelerados por GPU de NVIDIA con CUDA.
- GPU de consumo: una RTX 4090 de 24 GB puede alojar los pesos en BF16 (16,8 GB), pero el margen para activaciones y caché con contexto largo es muy ajustado; sería viable con secuencias cortas y una sola imagen por par. No hay cuantizaciones publicadas, por lo que no es posible reducir el consumo por esa vía.
- Opciones de despliegue: `transformers` (probado con la versión 5.20.0), `sentence-transformers`, Flash Attention 2 (instalación con `--no-build-isolation`) y vLLM, según las etiquetas del repositorio.
- Latencia y throughput estimados: no disponible. Depende del número de candidatos a reordenar, de si el documento incluye imagen y de la resolución efectiva de la misma.

## Comparativa con modelos similares

La información proporcionada no incluye especificaciones ni resultados de modelos comparables, por lo que no es posible construir una comparativa con datos verificables.

| Modelo | Parametros | Contexto | Modalidad | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| Nemotron-3.5-Rerank-8B-BF16 | 8,38B | 32.768 tokens | Texto e imagen | OpenMDW-1.1 | Referencia de esta ficha |
| Rerankers de texto de la familia BGE (BAAI) | no disponible | no disponible | Texto | no disponible | no disponible en la informacion proporcionada |
| Rerankers de la familia Jina | no disponible | no disponible | Texto o multimodal segun variante | no disponible | no disponible en la informacion proporcionada |
| Alternativas comerciales tipo Cohere Rerank | no disponible | no disponible | Texto | Propietaria | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo es discriminativo: no genera respuestas. Cualquier expectativa de uso como LLM generativo es incorrecta; su salida es un logit de relevancia sin calibrar de forma explícita.
- Los logits crudos no están normalizados entre consultas distintas. Para comparar o filtrar por umbral conviene aplicar una normalización (por ejemplo, sigmoide) y calibrar el umbral con datos propios.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos, es decir, puntuar como relevante un documento que no responde a la consulta, especialmente si comparte vocabulario o estilo visual.
- Sesgos: no se documentan en la información disponible análisis de sesgo demográfico, geográfico o lingüístico. La cobertura declarada de 34 idiomas en texto y 18 en imagen sugiere un rendimiento desigual entre idiomas, no cuantificado en la model card.
- Limitaciones de idioma: los idiomas no incluidos en las listas de evaluación pueden funcionar peor; el autor indica que el modelo "puede" soportar idiomas adicionales, sin garantías.
- Limitaciones de contexto: la ventana máxima es de 32.768 tokens por par, y la resolución de imagen por defecto (1.120 píxeles de lado mayor) puede degradar la lectura de documentos con tipografía muy pequeña; se puede subir a 1.540 con coste adicional de cómputo.
- Restricciones de licencia: el modelo se rige por OpenMDW-1.1, que permite uso comercial y no comercial según la model card, pero conviene revisar el texto completo de la licencia. El modelo base Ministral-3-8B-Instruct-2512-BF16 está bajo Apache 2.0, con términos adicionales aplicables.
- Caveat de producción: no hay cuantizaciones publicadas (GGUF, AWQ, GPTQ) en la información disponible, lo que limita el despliegue en hardware de gama media y encarece el escalado.
- Dependencia de versiones: los ejemplos oficiales requieren `transformers==5.20.0` y Flash Attention 2; el entrenamiento se hizo con `transformers==5.12.1`, y el autor advierte de que las salidas pueden variar según hardware y runtime.
- La fecha de publicación indicada en la model card (20/10/2026) es posterior a la fecha de creación del repositorio en HuggingFace (15/10/2026); conviene tratar las fechas con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/Nemotron-3.5-Rerank-8B-BF16
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Modelo base Ministral-3-8B-Instruct-2512-BF16: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Licencia del modelo base (Apache 2.0): https://www.apache.org/licenses/LICENSE-2.0.txt
- Imagen de ejemplo usada en la model card (documentación de NVIDIA NeMo Framework): https://docs.nvidia.com/nemo-framework/user-guide/24.07/_images/nemo-llm-mm-stack.png
- Repositorios y demos adicionales: no disponibles en la informacion proporcionada.
