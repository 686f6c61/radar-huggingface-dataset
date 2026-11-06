# BenjaminChan12/onet-match

## Resumen

onet-match es un paquete de modelos preentrenados para clasificación de ocupaciones y normalización de títulos de puesto contra la taxonomía O*NET-SOC. Lo desarrolla BenjaminChan12 y se publica bajo licencia MIT. El problema que resuelve es concreto: mapear texto libre en inglés (títulos de puesto, viñetas de currículum, ofertas de empleo, descripciones de proyectos, listas de habilidades) a una de las 923 ocupaciones de O*NET 31.0, devolviendo además tareas clave, habilidades, conocimientos e intereses RIASEC asociados.

Técnicamente no es un modelo generativo, sino un pipeline de recuperación y reordenación (retrieve-and-rerank) compuesto por un bi-encoder basado en BAAI/bge-base-en-v1.5 y un cross-encoder basado en cross-encoder/ms-marco-MiniLM-L6-v2. El bi-encoder recupera candidatos mediante similitud de embeddings y el reranker reordena los 20 mejores; las puntuaciones se combinan tras un z-score por consulta y una softmax con temperatura calibrada para producir una confianza interpretable.

Su relevancia práctica está en la precisión: alcanza un top-1 del 51,1 % sobre texto O*NET retenido y del 65,4 % sobre entradas informales, frente al 20,5 % y 17,4 % de una línea base TF-IDF. Es un componente especializado para pipelines de RR. HH., parseo de currículums y exploración de carreras, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline retrieve-and-rerank: bi-encoder (transformer BERT) + cross-encoder (MiniLM) |
| Parametros totales | no disponible (bge-base-en-v1.5: ~110 M; ms-marco-MiniLM-L6-v2: ~22 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT (pesos y código); modelos base MIT y Apache-2.0; datos O*NET CC BY 4.0 |
| Formato de pesos | safetensors (bundle de sentence-transformers) |
| Tamano del repo | 0,5 GB |
| Pipeline | sentence-similarity |
| Cobertura taxonómica | 923 ocupaciones O*NET 31.0 |
| Latencia mediana | 46,7 ms por consulta (GPU de portátil Apple) |

## Arquitectura y entrenamiento

El sistema se compone de dos etapas. La primera es un bi-encoder derivado de BAAI/bge-base-en-v1.5, afinado con pérdida contrastiva y negativos duros sobre pares de títulos, tareas y actividades de O*NET, además de texto informal generado por un LLM. La segunda es un cross-encoder derivado de cross-encoder/ms-marco-MiniLM-L6-v2, afinado sobre los mismos datos, que reordena los 20 candidatos recuperados por el bi-encoder. Las puntuaciones de ambos se normalizan con z-score por consulta y se combinan con un peso de mezcla de 0,3 para el reranker; una softmax con temperatura calibrada sobre el top 20 produce la confianza final.

El bundle incluye `doc_embeddings.npy` con los embeddings precalculados de las 923 ocupaciones, un catálogo con títulos, descripciones, tareas, habilidades, conocimientos, aptitudes, intereses y actividades laborales detalladas, y `bundle.json` con el peso de mezcla, la temperatura de calibración y la procedencia. El entrenamiento usó una única semilla, por lo que el autor advierte que diferencias inferiores a un punto son ruido. No se especifican el número de tokens de entrenamiento ni la composición detallada del dataset más allá de las fuentes descritas.

## Capacidades

- Clasificación de ocupaciones: mapea texto libre a una de las 923 ocupaciones O*NET-SOC 31.0.
- Normalización de títulos de puesto: resuelve variantes informales a la ocupación canónica.
- Recuperación con confianza calibrada: devuelve probabilidad calibrada (ECE de 0,037 y 0,102 según conjunto) junto a cada coincidencia.
- Enriquecimiento de resultados: adjunta tareas clave, habilidades, conocimientos e intereses RIASEC a cada ocupación.
- Procesamiento de currículums: acepta viñetas, descripciones de proyectos y listas de habilidades.
- Procesamiento de ofertas de empleo: clasifica postings completos o fragmentos.
- Exploración de carreras: relaciona declaraciones de interés con ocupaciones.
- Función de reranking: el cross-encoder puede usarse como reordenador independiente.
- Idiomas: únicamente inglés.
- No es un modelo generativo: no produce texto libre, solo coincidencias estructuradas.

## Casos de uso

- Parseo y enriquecimiento de currículums: extraer viñetas de experiencia y mapearlas a códigos SOC para construir perfiles estructurados y filtrables en un ATS, aprovechando la tolerancia a texto informal (65,4 % top-1).
- Normalización de títulos en ofertas de empleo: unificar títulos heterogéneos de portales de empleo a la taxonomía O*NET para agregación y análisis de mercado laboral.
- Motores de recomendación de empleo: usar las coincidencias con confianza calibrada para puntuar la afinidad entre candidato y vacante sin necesidad de un LLM generativo.
- Exploración de carreras: a partir de una declaración de intereses, devolver ocupaciones compatibles con sus intereses RIASEC, tareas y habilidades requeridas.
- Análisis de brechas de habilidades: comparar las habilidades declaradas en un currículum con las que O*NET asocia a la ocupación objetivo para identificar carencias formativas.
- Clasificación de datos para investigación laboral: etiquetar grandes volúmenes de texto con códigos SOC de forma determinista y con latencia baja (46,7 ms por consulta), apta para procesamiento por lotes.
- Reranking en pipelines de búsqueda de empleo: integrar el cross-encoder como segunda etapa para reordenar candidatos recuperados por otro sistema.

## Benchmarks y rendimiento

| Conjunto de prueba | n | top-1 | top-5 | MRR@20 | ECE |
|---|---|---|---|---|---|
| Texto O*NET (títulos, tareas, actividades, descripciones) | 6.792 | 51,1 % | 79,1 % | 0,633 | 0,037 |
| Texto informal escrito por otro LLM distinto al de entrenamiento | 4.703 | 65,4 % | 92,9 % | 0,774 | 0,102 |
| Línea base TF-IDF, texto O*NET | — | 20,5 % | no disponible | no disponible | no disponible |
| Línea base TF-IDF, texto informal | — | 17,4 % | no disponible | no disponible | no disponible |

Los conjuntos de prueba están retenidos; la validación se usó solo para selección de modelo y calibración. El autor indica que el rendimiento es más débil en enunciados de tareas en bruto (en torno al 38 % top-1) y en títulos con codificación de seniority como "Sr. Backend Eng II".

## Requisitos de hardware

- VRAM estimada: el bundle completo ocupa 0,5 GB en disco; el bi-encoder (~110 M parámetros) y el cross-encoder (~22 M) caben holgadamente en cualquier GPU consumer con 4 GB o más en fp32/fp16.
- GPU recomendadas: cualquier GPU moderna sirve; el autor reporta 46,7 ms de latencia mediana en una GPU de portátil Apple. Para alto throughput en servidor, una A100 o H100 no es necesaria pero permite procesamiento por lotes masivo.
- GPU consumer: sí, cabe en RTX 3060, RTX 4060, RTX 4090 y equivalentes, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: sentence-transformers (biblioteca nativa), paquete `onet-match[matching]` vía pip, y servidores de embeddings compatibles con la API de Hugging Face (el repo está marcado como endpoints_compatible). vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo generativo.
- Latencia y throughput: 46,7 ms por consulta en GPU de portátil Apple; el throughput escala con el tamaño de lote del bi-encoder y del cross-encoder.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| onet-match | Bi-encoder + cross-encoder especializado | ~132 M (combinado) | no disponible | MIT | Clasificación de ocupaciones O*NET |
| BAAI/bge-base-en-v1.5 | Bi-encoder general | ~110 M | 512 tokens | MIT | Embeddings de propósito general |
| cross-encoder/ms-marco-MiniLM-L6-v2 | Cross-encoder general | ~22 M | 512 tokens | Apache-2.0 | Reranking de búsqueda |
| TF-IDF (línea base) | Bolsa de palabras | no aplica | no aplica | no aplica | Recuperación léxica |

No se dispone de comparativas publicadas frente a otros sistemas específicos de clasificación ocupacional (por ejemplo, clasificadores basados en LLM) dentro de la información proporcionada. La comparación relevante es contra sus propios modelos base y la línea base TF-IDF, donde onet-match mejora el top-1 en más de 30 puntos porcentuales en texto O*NET y en más de 45 puntos en texto informal.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas.
- Rendimiento débil en enunciados de tareas en bruto (en torno al 38 % top-1) y en títulos con seniority codificado ("Sr. Backend Eng II").
- Los conjuntos de entrenamiento y prueba de texto informal fueron escritos por un LLM; no existe aún un conjunto de prueba escrito por humanos, lo que puede inflar la estimación de rendimiento en entradas reales.
- Entrenamiento con una única semilla: diferencias inferiores a un punto porcentual son ruido estadístico.
- ECE de 0,102 en texto informal indica calibración menos fiable que en texto O*NET (0,037).
- Es una herramienta de sugerencia de ocupaciones; el autor advierte explícitamente que no debe usarse para decisiones de contratación o elegibilidad.
- Riesgo de sesgo heredado de los datos O*NET y de los modelos base, no evaluado en la información disponible.
- El uso de datos O*NET está sujeto a CC BY 4.0 y requiere atribución a USDOL/ETA; O*NET es marca registrada de USDOL/ETA, que no ha aprobado ni probado este producto.
- Licencia MIT para pesos y código, pero la atribución de O*NET es obligatoria en productos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BenjaminChan12/onet-match
- Repositorio GitHub: https://github.com/Benjamin-V-Chan/onet-match
- Documento de resultados y análisis de errores: https://github.com/Benjamin-V-Chan/onet-match/blob/main/docs/RESULTS.md
- Modelo base bi-encoder: https://huggingface.co/BAAI/bge-base-en-v1.5
- Modelo base cross-encoder: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2
- Licencia O*NET CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
