# antoinelouis/colbert-xm

## Resumen

ColBERT-XM es un modelo de recuperación de pasajes multilingüe desarrollado por Antoine Louis (antoinelouis) y presentado en el artículo «ColBERT-XM: A Modular Multi-Vector Representation Model for Zero-Shot Multilingual Information Retrieval» (arXiv:2402.15059). Se basa en la arquitectura ColBERT, que codifica consultas y pasajes en matrices de embeddings a nivel de token y utiliza el operador MaxSim para calcular similitudes de forma escalable. El modelo emplea como backbone XMOD, una variante de XLM-R con adaptadores de idioma, lo que le permite generalizar a más de 50 lenguas sin necesidad de entrenamiento específico para cada una.

El modelo resuelve el problema de la búsqueda semántica multilingüe en escenarios donde los recursos anotados son escasos, ofreciendo un comportamiento zero-shot en idiomas de baja representación. Su diseño modular permite añadir nuevos idiomas mediante adaptadores sin reentrenar el modelo completo. Con 852 millones de parámetros en total (el backbone XMOD tiene 277 millones) y un tamaño de repositorio de 3,4 GB, ColBERT-XM se posiciona como una alternativa ligera y eficiente frente a modelos de retrieval monolingües, manteniendo la licencia MIT y pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ColBERT multi-vector sobre XMOD (XLM-R con adaptadores de idioma) |
| Parametros totales | 852.570.624 (backbone XMOD: 277M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (típico de XMOD: 512 tokens, no confirmado) |
| Tipos de cuantizacion | No disponible (pesos en fp32/fp16, cuantización posible con herramientas externas) |
| Idiomas soportados | Multilingüe: af, am, ar, az, be, bg, bn, ca, cs, cy, da, de, el, en, eo, es, et, eu, fa, fi, fr, ga, gl, gu, ha, he, hi, hr, hu, hy, id, is, it, ja, ka, kk, km, kn, ko, ku, ky, la, lo, lt, lv, mk, ml, mn, mr, ms, my, ne, nl, no, or, pa, pl, ps, pt, ro, ru, sa, si, sk, sl, so, sq, sr, sv, sw, ta, te, th, tl, tr, uk, ur, uz, vi, zh |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ColBERT-XM adopta la arquitectura ColBERT, que representa cada consulta y cada pasaje como una matriz de embeddings a nivel de token. La similitud entre una consulta y un pasaje se calcula mediante MaxSim, que suma el máximo valor de similitud de cada token de la consulta sobre los tokens del pasaje. Este enfoque multi-vector captura matices semánticos que los modelos de representación de vector único pierden, mejorando la precisión en tareas de retrieval.

El backbone es XMOD, un modelo basado en XLM-R que incorpora adaptadores de idioma. Estos adaptadores permiten que el modelo se ajuste a diferentes lenguas sin modificar los pesos compartidos, lo que facilita la extensión a nuevos idiomas de forma eficiente. El entrenamiento se realizó sobre el conjunto de datos MS MARCO passage ranking (6,4 millones de pares consulta-pasaje) enriquecido con hard negatives del dataset `sentence-transformers/msmarco-hard-negatives`, y se evaluó en la versión multilingüe mMARCO. La innovación principal reside en la combinación de la representación multi-vector de ColBERT con la modularidad de XMOD, logrando un rendimiento competitivo en retrieval multilingüe con un coste computacional moderado.

## Capacidades

- Búsqueda semántica multilingüe: codifica consultas y pasajes en matrices de embeddings y recupera pasajes relevantes mediante MaxSim.
- Soporte de más de 50 idiomas, incluyendo lenguas de baja representación como hausa, zulú o cingalés.
- Comportamiento zero-shot: funciona en idiomas no vistos durante el entrenamiento gracias a los adaptadores de XMOD.
- Integración con librerías de retrieval como `colbert-ai` y `sentence-transformers`.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales para similitud.
- No soporta tool calling, agentes ni razonamiento multi-paso; su función es exclusivamente la recuperación de información.

## Casos de uso

- Búsqueda en bases de conocimiento multilingües: empresas con documentación técnica en varios idiomas pueden indexar pasajes y recuperar respuestas relevantes mediante consultas en cualquier lengua soportada, gracias a la capacidad zero-shot de ColBERT-XM.
- Recuperación aumentada para generación (RAG) en sistemas multilingües: el modelo puede servir como componente de retrieval en pipelines de RAG donde el generador (por ejemplo, un LLM) necesita contexto de documentos en distintos idiomas.
- Motores de búsqueda en plataformas de comercio electrónico: permite buscar productos a partir de descripciones en el idioma del usuario, incluso si el catálogo está en otro idioma, mejorando la experiencia en mercados internacionales.
- Búsqueda de jurisprudencia y documentos legales: en despachos o instituciones con sentencias y normativas en múltiples lenguas, ColBERT-XM recupera los pasajes más relevantes para una consulta legal formulada en cualquier idioma.
- Soporte técnico automatizado: foros y centros de ayuda pueden indexar artículos en varios idiomas y responder consultas de usuarios mediante retrieval semántico, reduciendo el tiempo de búsqueda manual.
- Búsqueda en publicaciones científicas: investigadores pueden encontrar artículos relevantes en repositorios multilingües (preprints, actas de congresos) sin necesidad de traducir sus consultas.

## Benchmarks y rendimiento

Los resultados oficiales, declarados por el autor en la model card, corresponden a la tarea de Passage Retrieval sobre el conjunto de validación de mMARCO. Se muestran los valores de Recall@1000, Recall@500, Recall@100, Recall@10 y MRR@10 para los idiomas evaluados:

| Idioma | Recall@1000 | Recall@500 | Recall@100 | Recall@10 | MRR@10 |
|---|---|---|---|---|---|
| Árabe (ar) | 74,8 | 72,1 | 60,4 | 36,5 | 19,5 |
| Alemán (de) | 86,0 | 84,1 | 73,9 | 49,5 | 27,0 |
| Inglés (en) | 96,5 | 95,9 | 89,3 | 65,7 | 37,2 |
| Español (es) | 88,4 | 86,8 | 77,5 | 52,0 | 28,5 |
| Francés (fr) | 87,3 | 85,7 | 75,2 | 49,2 | 26,9 |
| Hindi (hi) | 82,2 | 79,9 | 69,8 | 44,2 | 23,8 |
| Indonesio (id) | 86,7 | 84,8 | 74,5 | 48,3 | 26,3 |
| Italiano (it) | 86,1 | 84,3 | 74,1 | 48,2 | 26,5 |
| Japonés (ja) | 83,6 | 81,8 | 71,4 | 44,6 | 24,1 |
| Neerlandés (nl) | 86,7 | 84,8 | 74,5 | 48,3 | 26,3 |

No se han publicado resultados de benchmarks en la información disponible para otros conjuntos de datos ni comparaciones con modelos adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852M parámetros en fp32 (~3,4 GB) se necesita al menos 4 GB de VRAM; en fp16 (~1,7 GB) bastan 2-3 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060, RTX 3090, RTX 4090, A100, H100) es suficiente para inferencia. El modelo cabe en GPUs de consumo medio.
- Opciones de despliegue: `colbert-ai` (librería principal), `sentence-transformers` para integración con otros pipelines, y `RAGatouille` para uso en sistemas RAG.
- Latencia y throughput: no disponible en la información proporcionada; depende del hardware y del tamaño del corpus indexado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la información proporcionada. Como alternativas de la misma categoría (retrieval multilingüe) se pueden considerar:

- `mContriever` (Facebook): basado en Contriever, entrenado con datos multilingües, licencia CC-BY-NC (no comercial).
- `multilingual-e5` (Microsoft): modelo de embeddings multilingüe, disponible en varios tamaños, licencia MIT.
- `BGE-M3` (BAAI): retrieval multilingüe con soporte de múltiples granularidades, licencia MIT.

Estos modelos difieren en arquitectura (vector único vs. multi-vector), tamaño y licencia, pero no se dispone de benchmarks comunes para una comparación cuantitativa con ColBERT-XM en la información disponible.

## Limitaciones y advertencias

- Sesgos: entrenado principalmente en MS MARCO (inglés) y mMARCO (traducciones), puede presentar sesgos culturales o lingüísticos de esos corpus.
- Riesgo de alucinación: al ser un modelo de retrieval, no genera texto, pero puede devolver pasajes irrelevantes si la consulta es ambigua o el corpus está mal indexado.
- Limitaciones de contexto: la longitud de contexto no está confirmada, pero XMOD típicamente soporta 512 tokens; pasajes más largos pueden truncarse.
- Restricciones de licencia: licencia MIT, permite uso comercial sin restricciones, siempre que se incluya el aviso de copyright.
- Dependencia de la librería `colbert-ai`: para un uso óptimo se requiere esta librería, que tiene sus propias dependencias y requisitos de instalación.
- No es adecuado para tareas de generación o razonamiento; su uso se limita a recuperación de información.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/antoinelouis/colbert-xm)
- [Artículo en arXiv](https://arxiv.org/abs/2402.15059)
- [Repositorio de código (si está disponible, no localizado en la búsqueda)](https://github.com/antoinelouis)
