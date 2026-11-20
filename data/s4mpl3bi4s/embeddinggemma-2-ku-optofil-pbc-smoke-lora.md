# S4MPL3BI4S/embeddinggemma-2-ku-optofil-pbc-smoke-lora

## Resumen

El modelo `S4MPL3BI4S/embeddinggemma-2-ku-optofil-pbc-smoke-lora` es un adaptador LoRA de investigación publicado por el usuario S4MPL3BI4S sobre el modelo base `unsloth/embeddinggemma-2`. Su propósito es adaptar las proyecciones de visión y lenguaje de EmbeddingGemma 2 para la recuperación (retrieval) de recortes de células sanguíneas periféricas individuales en el contexto de investigación hematológica y microscopía. No es un modelo generativo ni un clasificador clínico, sino un adaptador de embeddings orientado a tareas de similitud imagen-imagen.

El adaptador se entrenó sobre un subconjunto muy reducido ("smoke") de 64 tripletes de imágenes con negativos duros, procedentes del dataset KU-Optofil Peripheral Blood Cell Dataset v2 (Yarıkan et al., CC BY 4.0), compuesto por imágenes Sysmex DI-60 teñidas con May-Grünwald-Giemsa. El entrenamiento fue deliberadamente mínimo: dos pasos de optimizador en una única GPU NVIDIA L4 en BF16, con LoRA de rango 16. El propio autor lo describe como un artefacto de investigación cuyo objetivo es validar el pipeline, no establecer generalización.

Es relevante ahora únicamente como referencia metodológica para quienes trabajan en embeddings multimodales aplicados a imagen médica: demuestra un flujo completo (adaptador LoRA, repositorio fusionado, evaluación offline) y documenta explícitamente sus limitaciones. El tamaño del repositorio es de 0,1 GB y la licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre EmbeddingGemma 2 (modelo base multimodal de embeddings); PEFT |
| Parametros totales | no disponible (el adaptador LoRA es de rango 16; el recuento de parámetros del adaptador no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

Parámetros adicionales de entrenamiento documentados por el autor:

| Parametro | Valor |
|---|---|
| Modelo base | unsloth/embeddinggemma-2 (revisión c8f89cc7ecb4ba5122cd15fdd487422b2b487daf) |
| Rango LoRA / alpha / dropout | 16 / 32 / 0 |
| Resolución de entrada | 360 × 360 RGB |
| Image soft tokens solicitados | 280 |
| Función de pérdida | MultipleNegativesRankingLoss |
| Semilla | 3407 |
| Hardware | 1 × NVIDIA L4 (BF16) |
| Pasos de optimizador | 2 |
| Learning rates | 2e-5 y 1e-5 |
| Tensores de visión adaptados en el primer paso | 112 de 224 |

## Arquitectura y entrenamiento

El adaptador se construye mediante PEFT/LoRA sobre EmbeddingGemma 2, un modelo de embeddings del ecosistema Gemma que combina proyecciones de visión y lenguaje. El LoRA modifica las proyecciones de visión y de lenguaje del modelo base, con rango 16, alpha 32 y dropout 0. El entrenamiento utilizó tripletes de imágenes con negativos duros (hard-negative triplets) y la pérdida MultipleNegativesRankingLoss, típica de los modelos de sentence-transformers para aprendizaje contrastivo.

El conjunto de entrenamiento es un subconjunto "smoke" de solo 64 tripletes, cada uno formado por tres pacientes distintos del split de entrenamiento del dataset KU-Optofil v2. Las imágenes son recortes RGB de 360 × 360 píxeles de células sanguíneas periféricas teñidas con May-Grünwald-Giemsa, capturadas con un analizador Sysmex DI-60. Se solicitaron 280 image soft tokens. El entrenamiento se ejecutó en una sola GPU NVIDIA L4 en BF16 con únicamente dos pasos de optimizador, lo que evidencia su carácter de prueba de humo más que de entrenamiento real. En el primer paso cambiaron 112 de los 224 tensores de visión del adaptador rastreados. No se documenta el número de tokens de texto ni la composición completa del dataset más allá de la fuente citada.

## Capacidades

- Generación de embeddings de imagen para recuperación (retrieval) por similitud, orientados a recortes de células sanguíneas periféricas.
- Producción de embeddings de dimensión 768 (verificados en la recarga offline del modelo fusionado).
- Adaptación de las proyecciones de visión y de lenguaje del modelo base EmbeddingGemma 2.
- Integración con el ecosistema sentence-transformers y PEFT.
- Uso como adaptador sobre el modelo base fijado a una revisión concreta.
- No incluye generación de texto, tool calling, capacidades de agente, razonamiento multi-paso, visión general, audio ni modo de pensamiento.
- No realiza detección de células, recuento de campos ni informes de diferencial clínico (fuera de alcance según el autor).

## Casos de uso

- Recuperación de células similares en investigación hematológica: dado un recorte de célula, recuperar los recortes más parecidos de una galería de referencia, usando el embedding de 768 dimensiones y similitud coseno. Adecuado porque el adaptador se entrenó específicamente con tripletes de células sanguíneas periféricas.
- Validación de pipelines de embeddings multimodales: sirve como prueba de humo para verificar que un flujo LoRA + sentence-transformers + recarga offline funciona de extremo a extremo antes de escalar a datasets mayores.
- Búsqueda visual en colecciones de microscopía: indexar recortes de 360 × 360 y permitir consultas por imagen para explorar morfologías celulares en un conjunto de investigación.
- Estudio de aprendizaje contrastivo con negativos duros: el adaptador documenta una configuración concreta (rango 16, alpha 32, MultipleNegativesRankingLoss, tripletes de pacientes distintos) reutilizable como línea base metodológica.
- Experimentación con adaptadores PEFT sobre EmbeddingGemma 2: permite comparar el comportamiento del adaptador frente al modelo base sin adaptar en tareas de similitud de imagen.
- Reproducibilidad de investigación: el autor publica metadatos completos del entrenamiento y el repositorio fusionado, lo que facilita replicar o auditar el experimento en entornos académicos.
- Prototipado de sistemas de apoyo a la revisión por tecnólogos: como componente de recuperación de casos similares para revisión humana, nunca como sustituto del analizador ni del juicio clínico.

## Benchmarks y rendimiento

El autor reporta una evaluación agregada sobre 34 recortes de validación de pacientes disjuntos de la galería de entrenamiento (80 recortes):

| Metrica | Modelo base | Adaptador LoRA |
|---|---|---|
| Macro top-one recall | 40,0% | 42,5% |
| Recall@5 | 88,24% | 88,24% |

La recarga offline independiente del modelo fusionado reprodujo estas puntuaciones con embeddings finitos de 768 dimensiones. El autor advierte que el subconjunto smoke es demasiado pequeño para establecer generalización y que la ruta de carga del adaptador independiente no recibió una prueba de equivalencia numérica separada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio del adaptador ocupa 0,1 GB, pero requiere cargar el modelo base EmbeddingGemma 2, cuyo tamaño no se detalla en la información proporcionada.
- GPU de entrenamiento utilizada: 1 × NVIDIA L4 en BF16.
- GPU recomendadas: no disponibles; el autor solo documenta la L4 para el entrenamiento smoke. Para inferencia se puede usar cualquier GPU compatible con el modelo base en BF16 o FP16.
- ¿Cabe en GPU de consumo? No disponible; depende del modelo base, no documentado aquí.
- Opciones de despliegue: PEFT con sentence-transformers (según los tags del repositorio); el autor menciona un repositorio fusionado con ejemplo ejecutable de embedding de imagen. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| embeddinggemma-2-ku-optofil-pbc-smoke-lora (este) | Adaptador LoRA sobre EmbeddingGemma 2 para retrieval de células sanguíneas | no disponible | no disponible | Apache 2.0 | Hugging Face |
| unsloth/embeddinggemma-2 (modelo base) | Modelo de embeddings multimodal | no disponible | no disponible | Apache 2.0 (heredada) | Hugging Face |
| google/embeddinggemma-2 (upstream) | Modelo de embeddings multimodal | no disponible | no disponible | Apache 2.0 con Gemma Prohibited Use Policy | Hugging Face |
| S4MPL3BI4S/embeddinggemma-2-ku-optofil-pbc-smoke (fusionado) | Modelo fusionado con encoder recargable | no disponible | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada, más allá de la comparación base vs. adaptador reportada por el autor (40,0% → 42,5% en top-one recall). No se identifican alternativas de la misma categoría (embeddings de imagen para hematología) en la información disponible.

## Limitaciones y advertencias

- El adaptador se entrenó con solo 64 tripletes y dos pasos de optimizador; el propio autor indica que el subconjunto smoke es demasiado pequeño para establecer generalización.
- La mejora en top-one recall es modesta (40,0% → 42,5%) y Recall@5 no cambia (88,24%).
- No tiene validación ni autorización clínica; no está validado sobre las muestras, cámara o portaobjetos del laboratorio objetivo (recortes teñidos con Wright a 100×).
- La detección de células, el recuento de campos y los informes de diferencial clínico quedan fuera de su alcance.
- Las etiquetas propuestas requieren confirmación de un tecnólogo cualificado, incluida la revisión explícita de blastos y otras células raras o de alto riesgo; el analizador sigue siendo la autoridad para los recuentos de leucocitos.
- La ruta de carga del adaptador independiente no recibió una prueba de equivalencia numérica separada; solo se verificó la recarga offline del modelo fusionado.
- No se documentan sesgos conocidos ni riesgos de alucinación específicos (no es un modelo generativo), pero al ser un artefacto de investigación no debe usarse en producción clínica.
- La licencia Apache 2.0 aplica al modelo base y al adaptador; las imágenes de entrenamiento de Yarıkan et al. conservan CC BY 4.0. Aplica además la Gemma Prohibited Use Policy del modelo upstream.
- No se documentan idiomas soportados ni longitud de contexto, lo que limita su evaluación para usos fuera del retrieval de imagen.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/S4MPL3BI4S/embeddinggemma-2-ku-optofil-pbc-smoke-lora
- Modelo fusionado y ejemplo de uso: https://huggingface.co/S4MPL3BI4S/embeddinggemma-2-ku-optofil-pbc-smoke
- Modelo base fijado (revisión): https://huggingface.co/unsloth/embeddinggemma-2/tree/c8f89cc7ecb4ba5122cd15fdd487422b2b487daf
- Model card del base upstream: https://huggingface.co/google/embeddinggemma-2
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Dataset KU-Optofil (DOI): https://doi.org/10.5281/zenodo.17333317
- Licencia del dataset (CC BY 4.0): https://creativecommons.org/licenses/by/4.0/
- Trabajo relacionado, Acevedo et al. (excluido de entrenamiento y evaluación): https://data.mendeley.com/datasets/snkd93bnjr/1
- Trabajo de entrenamiento (job): https://huggingface.co/jobs/S4MPL3BI4S/6b005edf4fdc5ab3c55b87e0
