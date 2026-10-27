# mradermacher/Nemotron-3.5-Embed-1B-BF16-i1-GGUF

## Resumen

Nemotron-3.5-Embed-1B-BF16-i1-GGUF es la versión cuantizada en formato GGUF del modelo de embeddings multimodales `nvidia/Nemotron-3.5-Embed-1B-BF16`, publicada por el usuario mradermacher (no por NVIDIA). No es un modelo generativo: es un modelo de extracción de características (`feature-extraction`) que produce vectores densos para texto e imágenes, orientado a recuperación de información, RAG y búsqueda semántica. Cuenta con 1.140.918.272 parámetros (aproximadamente 1,14 B), lo que lo sitúa en el rango de modelos de embeddings ligeros desplegables en hardware de consumo.

El interés de esta publicación concreta está en la disponibilidad de cuantizaciones GGUF con calibración imatrix (serie `i1`), desde IQ1_S (~0,5 GB) hasta Q6_K, lo que permite ejecutar un modelo de embeddings de 1,14 B en CPU, en GPUs de gama baja o en entornos con VRAM muy limitada. Incluye además soporte declarado de 33 idiomas (entre ellos castellano, catalán no listado, portugués, inglés, árabe, hindi, chino, japonés y coreano), lo que lo hace relevante para pipelines multilingües de recuperación.

La relevancia práctica es doble: por un lado, ofrece una alternativa de embeddings multilingües texto-imagen con licencia openmdw-1.1; por otro, al ser una cuantización de terceros, obliga a evaluar la pérdida de calidad respecto al BF16 original antes de usarla en producción. No se han publicado en la información disponible datos de benchmarks, dimensión de embedding ni longitud de contexto, tres datos críticos para integrarlo en una base de datos vectorial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de embeddings multimodales texto-imagen; el autor no detalla la arquitectura interna) |
| Parametros totales | 1.140.918.272 (~1,14 B) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_S, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, mas fichero imatrix para generar cuantizaciones propias |
| Idiomas soportados | 33 idiomas declarados: en, ar, as, bn, bg, zh, da, nl, fi, fr, de, hi, id, it, ja, ko, ms, mr, ne, no, fa, pt, ro, ru, es, sw, sv, ta, te, th, uk, ur, vi |
| Licencia | openmdw-1.1 (enlace: https://openmdw.ai/license/1-1/) |
| Formato de pesos | GGUF (serie i1 con imatrix); el modelo base se distribuye en BF16/safetensors |
| Dimension de embedding | No disponible |
| Tamano del repositorio | 14,9 GB (incluye todas las cuantizaciones) |
| Rango de tamano de las cuantizaciones | De ~0,5 GB (IQ1_S) a ~0,9 GB (Q5_K_M); Q6_K no detallado en el extracto |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 2026-10-27 |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna del modelo base `nvidia/Nemotron-3.5-Embed-1B-BF16`: no se detalla si emplea un transformer encoder convencional, una torre dual para imagen y texto, ni el tipo de pooling o normalización aplicado a los vectores de salida. Lo que sí se declara es su naturaleza multimodal de embeddings: el modelo genera representaciones vectoriales tanto de texto (`text-embeddings`) como de imagen (`image-embeddings`), y la publicación advierte de que, al tratarse de un modelo con componente de visión, los ficheros `mmproj` necesarios para procesar imágenes se alojan en el repositorio de cuantizaciones estáticas (`mradermacher/Nemotron-3.5-Embed-1B-BF16-GGUF`), no en este repositorio i1.

Tampoco se han publicado en la información proporcionada datos sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.). Esta publicación es exclusivamente un trabajo de cuantización: el autor aplica cuantización con calibración imatrix (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) sobre los pesos BF16 originales de NVIDIA, e incluye el fichero `.imatrix.gguf` para que terceros puedan generar sus propias cuantizaciones con la misma matriz de importancia.

## Capacidades

- Generación de embeddings de texto: produce vectores densos para frases, párrafos y documentos, aptos para similitud coseno y búsqueda semántica.
- Generación de embeddings de imagen: el modelo base es multimodal, por lo que puede vectorizar imágenes para búsqueda y recuperación cruzada imagen-texto (requiere los ficheros `mmproj` del repositorio estático).
- Recuperación de información y RAG: etiquetado explícito para `retrieval`, `rag` y `semantic-search`.
- Multilingüe: 33 idiomas declarados, incluyendo castellano, portugués, francés, alemán, italiano, árabe, hindi, chino, japonés, coreano y varias lenguas indias.
- Extracción de características (`feature-extraction`) como tarea principal del pipeline de transformers.
- Compatibilidad declarada con vLLM en las etiquetas del repositorio (para el modelo base; el soporte de GGUF en vLLM es más limitado).
- No soporta generación de texto, razonamiento, código, matemáticas, tool calling ni uso como agente: es un modelo de embeddings, no un LLM generativo.
- No se documenta modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- RAG multilingüe en producción: indexar una base documental en varios idiomas con un único modelo de embeddings evita mantener un modelo por idioma; la cuantización Q4_K_M (~0,8 GB) permite ejecutar la codificación de documentos en CPU o en una GPU pequeña junto al generador.
- Búsqueda semántica en comercio electrónico: vectorizar descripciones de producto e imágenes del catálogo y resolver consultas en lenguaje natural contra ambos espacios, aprovechando la naturaleza multimodal del modelo base.
- Deduplicación y clustering de catálogos: calcular similitud entre fichas de producto o artículos periodísticos para detectar duplicados y agrupar temáticamente sin coste de API externa.
- Búsqueda de imágenes por descripción textual: con los ficheros `mmproj` del repositorio estático, indexar un archivo fotográfico y permitir consultas tipo "persona con abrigo rojo en la calle" sobre los vectores de imagen.
- Moderación y clasificación por similitud: comparar embeddings de mensajes entrantes contra un conjunto de vectores de referencia etiquetados para enrutar o filtrar contenido, con latencia baja al ser un modelo de 1,14 B.
- Despliegue en entornos aislados o sin GPU: al existir cuantizaciones desde 0,5 GB, el modelo cabe en un contenedor ligero sobre CPU, útil para administraciones o empresas con requisitos de soberanía del dato que no pueden llamar a APIs externas.
- Motor de recomendación basado en contenido: vectorizar el histórico de artículos leídos y el corpus disponible para sugerir elementos próximos en el espacio de embeddings, sin entrenamiento adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos a partir del número de parámetros y del tamaño de los ficheros GGUF; no confirmados por el autor):
  - BF16 (modelo base): ~2,3 GB solo de pesos, ~3 GB con overhead de runtime.
  - i1-Q8_0 / i1-Q6_K: ~1,2 GB de pesos.
  - i1-Q5_K_M: ~0,9 GB de pesos.
  - i1-Q4_K_M / i1-Q4_K_S: ~0,8 GB de pesos, recomendado por el autor como equilibrio tamaño/velocidad/calidad.
  - i1-IQ3_S / i1-IQ3_M: ~0,7 GB.
  - i1-IQ1_S / i1-IQ1_M: ~0,5 GB (el propio autor los describe como "for the desperate" y "mostly desperate").
- Si se procesan imágenes, hay que sumar el tamaño de los ficheros `mmproj` (alojados en el repositorio estático), no cuantificado en la información disponible.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente para las cuantizaciones Q4/Q5 (RTX 3060, RTX 4060, RTX 4090); para BF16 basta una RTX 3060 de 12 GB o una T4. En centros de datos, A100/H100/L40S están sobradamente dimensionadas y solo tienen sentido si se necesita throughput alto por lotes.
- Cabe en GPU consumer y también en CPU: las cuantizaciones Q4_K_M e inferiores se ejecutan en llama.cpp sobre CPU con memoria RAM moderada.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama y derivados, servidores compatibles con GGUF (p. ej. llama-cpp-python o LocalAI); el modelo base BF16 puede servirse con transformers y, según las etiquetas del repositorio, con vLLM.
- Latencia y throughput: no disponibles. Al ser un modelo de 1,14 B, la codificación por lote es barata comparada con LLM generativos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Nemotron-3.5-Embed-1B-BF16-i1-GGUF (este) | ~1,14 B | No disponible | GGUF i1 (imatrix), 0,5-0,9 GB por cuantización | openmdw-1.1 | Cuantización de terceros; incluye fichero imatrix; `mmproj` en repo aparte |
| nvidia/Nemotron-3.5-Embed-1B-BF16 (base) | ~1,14 B | No disponible | BF16 / safetensors | openmdw-1.1 | Referencia de calidad; mayor peso y VRAM |
| mradermacher/Nemotron-3.5-Embed-1B-BF16-GGUF (estático) | ~1,14 B | No disponible | GGUF estático (Q4_0, Q4_1, etc.) + `mmproj` | openmdw-1.1 | Alternativa sin calibración imatrix; aloja los ficheros de visión |
| Otros modelos de embeddings multilingües (BGE-M3, multilingual-e5, Qwen3-Embedding) | No disponible | No disponible | No disponible | No disponible | No hay datos verificados en la información proporcionada; se requiere evaluación propia |

## Limitaciones y advertencias

- No es un modelo generativo: no responde preguntas, no razona, no genera código ni soporta tool calling. Solo produce vectores.
- No se especifican la dimensión de embedding ni la longitud de contexto. Sin la dimensión no se puede definir el esquema de una colección en una base de datos vectorial; sin el contexto máximo no se sabe cómo trocear los documentos.
- La cuantización degrada la calidad de los embeddings de forma menos visible que en generación: la similitud puede mantenerse aparentemente razonable mientras empeora el recall en recuperación. Las cuantizaciones IQ1/IQ2 (0,5-0,6 GB) deben considerarse experimentales; el propio autor las etiqueta como "for the desperate" o "very low quality".
- No hay benchmarks publicados que permitan comparar la pérdida de calidad de cada cuantización frente al BF16. Es imprescindible evaluar con un conjunto propio (p. ej. recall@k sobre consultas reales) antes de desplegar.
- El modelo tiene componente de visión, pero los ficheros `mmproj` no están en este repositorio; un despliegue multimodal requiere descargarlos del repositorio estático y verificar compatibilidad.
- Es una cuantización de terceros, no oficial de NVIDIA: la trazabilidad de los pesos depende del publicador. Para usos críticos, conviene comparar contra el BF16 original.
- Licencia openmdw-1.1: no es una licencia OSI clásica (Apache/MIT). Hay que revisar sus términos en https://openmdw.ai/license/1-1/ antes de un uso comercial, especialmente en lo relativo a atribución y redistribución de cuantizaciones derivadas.
- La cobertura de 33 idiomas es declarada por el autor; no hay datos de rendimiento por idioma. El castellano está listado, pero no hay evidencia publicada de su calidad relativa frente al inglés.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de recuperar documentos semánticamente próximos pero incorrectos si el chunking o el umbral de similitud están mal calibrados.
- Sesgos: no hay información sobre la composición del corpus de entrenamiento ni sobre evaluaciones de sesgo; un modelo de embeddings puede perpetuar sesgos de recuperación en dominios sensibles (búsqueda de personas, cribado de CV).
- El repositorio registra 0 descargas y 0 likes, lo que indica ausencia de validación comunitaria en el momento de la consulta.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/mradermacher/Nemotron-3.5-Embed-1B-BF16-i1-GGUF
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Embed-1B-BF16
- Cuantizaciones estáticas y ficheros `mmproj`: https://huggingface.co/mradermacher/Nemotron-3.5-Embed-1B-BF16-GGUF
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#Nemotron-3.5-Embed-1B-BF16-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Nemotron-3.5-Embed-1B-BF16-i1-GGUF/resolve/main/Nemotron-3.5-Embed-1B-BF16.imatrix.gguf
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- No se han encontrado en la búsqueda web papers, blogs ni demos adicionales relevantes sobre este modelo.
