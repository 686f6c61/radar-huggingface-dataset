# mradermacher/Nemotron-3.5-Embed-8B-BF16-i1-GGUF

## Resumen

Nemotron-3.5-Embed-8B-BF16-i1-GGUF es una cuantización en formato GGUF del modelo de embeddings multimodales nvidia/Nemotron-3.5-Embed-8B-BF16, publicada por el usuario mradermacher. El modelo original lo desarrolla NVIDIA y está orientado a la generación de embeddings tanto de texto como de imagen, pensados para tareas de recuperación de información (retrieval), RAG y búsqueda semántica. Esta versión concreta emplea cuantizaciones con matriz de importancia (imatrix) para preservar la calidad en tamaños reducidos.

El modelo cuenta con 7.952.683.008 parámetros (aproximadamente 8 mil millones) y está diseñado para producir representaciones vectoriales densas, no para generación de texto libre. Su relevancia actual radica en la creciente demanda de modelos de embedding de alta calidad que cubran múltiples idiomas y modalidades, lo que permite construir sistemas de búsqueda y RAG que operen sobre corpus multilingües y con contenido visual.

La ficha se centra en la versión cuantizada publicada por mradermacher, que ofrece múltiples niveles de cuantización (desde IQ1_S de 2,0 GB hasta Q6_K y superiores) para adaptarse a distintos presupuestos de memoria. Al tratarse de una cuantización de un modelo base de NVIDIA, las especificaciones de arquitectura y entrenamiento provienen del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de embeddings; detalles de la arquitectura del modelo base no disponibles) |
| Parametros totales | 7.952.683.008 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (y otras); también disponibles cuantizaciones estáticas en el repo hermano |
| Idiomas soportados | multilingüe: en, ar, as, bn, bg, zh, da, nl, fi, fr, de, hi, id, it, ja, ko, ms, mr, ne, no, fa, pt, ro, ru, es, sw, sv, ta, te, th, uk, ur, vi |
| Licencia | openmdw-1.1 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (con fichero imatrix separado para crear cuantizaciones propias) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base nvidia/Nemotron-3.5-Embed-8B-BF16 más allá de que se trata de un modelo de embeddings multimodales (texto e imagen) con aproximadamente 8 mil millones de parámetros. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica destacable de esta publicación es el uso de cuantizaciones con matriz de importancia (imatrix), que permiten generar versiones comprimidas del modelo preservando mejor la calidad que las cuantizaciones estándar de tamaño similar. El repositorio incluye el propio fichero imatrix (0,1 GB) para que otros usuarios puedan crear sus propias cuantizaciones. Además, al ser un modelo de visión, los ficheros mmproj (si los hay) se alojan en el repositorio estático hermano.

## Capacidades

- Generación de embeddings de texto para recuperación semántica y búsqueda.
- Generación de embeddings de imagen (modelo multimodal), lo que permite búsqueda cruzada entre texto e imagen.
- Soporte multilingüe en más de 30 idiomas, incluidos español, inglés, árabe, chino, hindi, japonés, coreano y la mayoría de lenguas europeas.
- Orientado a tareas de retrieval, RAG y búsqueda semántica.
- Compatible con transformers y vLLM según las etiquetas del repositorio.
- No es un modelo generativo: no produce texto libre ni soporta tool calling ni razonamiento multi-paso.
- Extracción de características (feature-extraction) como tarea principal.

## Casos de uso

- Sistemas RAG multilingües: el modelo genera embeddings de fragmentos de documentos y consultas en más de 30 idiomas, lo que permite construir índices vectoriales que respondan a preguntas en español sobre corpus en inglés, francés o árabe sin necesidad de traducción previa.
- Búsqueda semántica en bases de conocimiento internas: se indexan manuales, tickets y documentación técnica; el modelo produce vectores densos que permiten recuperar los fragmentos más relevantes por similitud semántica en lugar de coincidencia léxica.
- Búsqueda multimodal de productos: al generar embeddings de imagen y texto en un mismo espacio, permite que un usuario busque con una descripción textual ("camisa azul de lino") y recupere imágenes de catálogo relevantes.
- Moderación y deduplicación de contenido: los embeddings permiten agrupar documentos o imágenes casi duplicados y detectar contenido semánticamente similar a gran escala.
- Clasificación y clustering de documentos: los vectores generados sirven como características de entrada para clasificadores o algoritmos de clustering (por ejemplo, agrupación de noticias por temática) sin entrenar un modelo desde cero.
- Recomendación de contenido: se calculan embeddings de artículos, vídeos o imágenes y se comparan con el perfil vectorial del usuario para generar recomendaciones por similitud semántica.
- Enriquecimiento de motores de búsqueda existentes: se integra como capa de re-ranking semántico sobre los resultados de un buscador léxico (BM25), mejorando la relevancia en consultas conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo completo en BF16 requiere aproximadamente 16 GB de VRAM solo para los pesos (8 mil millones de parámetros a 2 bytes por parámetro), más el overhead de activaciones y del contexto.
- Cuantizaciones pequeñas (i1-IQ1_S de 2,0 GB, i1-IQ2_M de 3,0 GB) permiten ejecución en GPUs de consumo con 4-6 GB de VRAM, aunque con pérdida de calidad notable.
- Cuantizaciones medias (i1-Q4_K_M de 5,0 GB, i1-Q5_K_M de 5,8 GB) son adecuadas para GPUs de consumo de 8-12 GB, como RTX 3060, RTX 4060 Ti o RTX 4070.
- Cuantizaciones altas (Q6_K y superiores) requieren 8-12 GB o más y se benefician de GPUs como RTX 4080, RTX 4090 o A100.
- Para despliegue en producción con vLLM se recomienda el modelo en BF16 o cuantizaciones altas sobre GPUs A100, H100 o L40S.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; vLLM y transformers para el modelo original en BF16.
- No se dispone de datos de latencia ni throughput en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-3.5-Embed-8B (esta ficha) | 7,95 B | no disponible | Sí (texto e imagen) | openmdw-1.1 | GGUF, BF16 |
| Alternativas de embedding de ~8B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos suficientes sobre modelos comparables de la misma categoría (embeddings multimodales de ~8B) para establecer una comparativa rigurosa con parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- Al ser un modelo de embeddings y no generativo, no puede usarse para chat, generación de texto, razonamiento ni tool calling.
- Las cuantizaciones de muy baja precisión (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad de los embeddings; se desaconsejan para producción.
- No se dispone de información sobre sesgos específicos del modelo base; como todo modelo entrenado con datos web multilingües, es probable que herede sesgos presentes en esos datos.
- Riesgo de que los embeddings no capturen bien dominios muy especializados (jurídico, médico, código) si el entrenamiento no los cubrió; no hay datos disponibles al respecto.
- La licencia openmdw-1.1 debe revisarse antes de uso comercial; está etiquetada como "other" en Hugging Face y enlaza a los términos de OpenMDW.
- La longitud de contexto no está especificada, lo que impide planificar con precisión el tamaño máximo de fragmento a indexar.
- Esta publicación es una cuantización de terceros (mradermacher), no la versión oficial de NVIDIA; para producción crítica conviene validar contra el modelo base en BF16.
- El repositorio ocupa 92,9 GB debido a la gran cantidad de cuantizaciones incluidas; conviene descargar solo el fichero necesario.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/mradermacher/Nemotron-3.5-Embed-8B-BF16-i1-GGUF
- Modelo base original: https://huggingface.co/nvidia/Nemotron-3.5-Embed-8B-BF16
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/Nemotron-3.5-Embed-8B-BF16-GGUF
- Página de resumen y descargas del autor: https://hf.tst.eu/model#Nemotron-3.5-Embed-8B-BF16-i1-GGUF
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
