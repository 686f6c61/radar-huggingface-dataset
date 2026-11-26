# athrael-soju/ColUltraVBERT

## Resumen

ColUltraVBERT es un recuperador de documentos visuales basado en late interaction (estilo ColBERT/ColPali) desarrollado por athrael-soju. Se trata de un fine-tune de UltraVBERT, un encoder vision-language de 255 millones de parámetros, que codifica cada token de la consulta y cada token de la página como un vector de 768 dimensiones, y ordena las páginas mediante la operación MaxSim. El modelo resuelve el problema de la recuperación de documentos visuales (visual document retrieval, VDR): localizar la página relevante dentro de una colección de documentos escaneados o renderizados como imagen, sin necesidad de OCR ni de extracción de texto previa.

La relevancia actual del modelo radica en sus resultados en el benchmark ViDoRe. Frente a ColModernVBERT, un recuperador de referencia de tamaño comparable, ColUltraVBERT obtiene una media de 86,4 nDCG@5 en ViDoRe V1 (frente a 81,4), 54,8 en ViDoRe V2 (frente a 40,7) y 49,3 en ViDoRe V3 (frente a 26,1). Estas cifras lo sitúan como una alternativa competitiva para pipelines de búsqueda documental multimodal en producción.

El modelo se distribuye con licencia MIT, soporta seis idiomas (inglés, español, alemán, francés, italiano y portugués) y está disponible en Hugging Face con la librería sentence-transformers. Su tamaño contenido (255M parámetros, repositorio de 0,5 GB) permite desplegarlo en hardware modesto, lo que lo hace atractivo para equipos que necesitan recuperación documental sin infraestructura de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (UltraVBERT) con proyección lineal a vectores de recuperación de 768 d y late interaction (MaxSim) |
| Parametros totales | 254.088.960 (255M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como ventana de texto; procesa páginas de hasta 3.072 px en el lado mayor, divididas en hasta 25 tiles de 512 px más una vista reducida de la página completa (máximo 1.664 vectores de imagen por página) |
| Tipos de cuantizacion | No especificados por el autor; los pesos se publican en safetensors (bf16 en las evaluaciones) |
| Idiomas soportados | Inglés, español, alemán, francés, italiano y portugués |
| Licencia | MIT |
| Formato de pesos | safetensors (custom_code; requiere sentence-transformers>=6.1 y transformers>=5.21, o trust_remote_code=True en 5.20.x) |

## Arquitectura y entrenamiento

ColUltraVBERT parte de UltraVBERT, un encoder vision-language que alinea representaciones de texto e imagen de página. Sobre los estados de token de 768 dimensiones de UltraVBERT, el modelo añade una capa lineal que proyecta cada estado a un vector de recuperación de 768 dimensiones; los vectores se normalizan L2 y se descartan los tokens de padding. En la indexación, cada página se redimensiona a un máximo de 3.072 px en el lado mayor y se divide en hasta 25 tiles de 512 px, más una vista reducida de la página completa, generando como máximo 1.664 vectores de imagen por página (además de los vectores de prompt y de etiqueta de tile). La puntuación entre consulta y página se calcula con MaxSim sobre los vectores de consulta y de página.

El entrenamiento se realizó sobre el dataset VDR Train 500k (499.704 pares consulta-página, con consultas en inglés al 73% y el resto en español, alemán, francés, italiano y portugués). Los pesos publicados son una mezcla por bloques (per-block merge) de cuatro fine-tunes de UltraVBERT que difieren en negativos duros, destilación y semilla. Cada fine-tune entrena adaptadores LoRA de rango 32 sobre el encoder de texto y la proyección de salida durante una época, con batch size 256 y pérdidas Matryoshka a 128, 256, 320, 512 y 768 dimensiones; el encoder de visión y el conector permanecen congelados. Esta estrategia Matryoshka permite truncar los vectores a 128, 256, 320 o 512 dimensiones para reducir el tamaño del índice con pérdidas mínimas de rendimiento.

## Capacidades

- Recuperación de documentos visuales: codifica páginas como imagen y consultas en texto, y ordena las páginas por relevancia mediante late interaction (MaxSim).
- Búsqueda multi-vector con truncamiento Matryoshka: los vectores de 768 d pueden recortarse a 128, 256, 320 o 512 d y renormalizarse para índices más pequeños.
- Multilingüe en consultas: inglés, español, alemán, francés, italiano y portugués.
- Manejo de documentos densos en información visual: tablas, gráficos, formularios y maquetas complejas, sin OCR previo.
- Codificación de páginas a resolución variable: configuración de hasta 3.072 px con 25 tiles, o 2.048 px con 16 tiles para índices más ligeros.
- Integración con sentence-transformers mediante `MultiVectorEncoder`, con métodos `encode_document`, `encode_query` y `similarity`.
- No se documentan capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso; es un modelo exclusivamente de recuperación.

## Casos de uso

- Búsqueda documental empresarial: indexar informes anuales, memorandos y presentaciones en PDF renderizadas como imagen y recuperar la página relevante ante consultas como "¿cuál fue el ingreso de 2023?". El modelo evita el OCR y funciona bien en documentos con tablas y gráficos, como reflejan sus resultados en TabFQuAD (92,5 nDCG@5).
- Gestión documental en finanzas: localizar páginas concretas en informes financieros y estados contables multilingües (inglés y francés) gracias a los resultados en ViDoRe V3 Finance EN (53,3) y Finance FR (33,3).
- Recuperación en documentación técnica y científica: buscar en artículos de informática, física y biomedicina indexados como páginas, con resultados de 66,5 en Computer Science y 54,3 en BioMedical Lectures (ViDoRe V2).
- Cumplimiento normativo y recursos humanos: recuperar cláusulas o políticas en documentos escaneados de HR (51,1 nDCG@10 en ViDoRe V3 HR) sin pipeline de extracción de texto.
- Asistentes de atención al cliente sobre base documental: combinar el recuperador con un LLM generativo en un patrón RAG visual, donde ColUltraVBERT selecciona las páginas y el LLM redacta la respuesta citando la fuente.
- Indexación a escala con recursos limitados: al truncar los vectores a 128-256 dimensiones se reduce el tamaño del índice manteniendo una media de 85,7-86,0 en ViDoRe V1, adecuado para despliegues con presupuesto de almacenamiento ajustado.
- Búsqueda en corpus multilingües: consultas en español, italiano o portugués sobre documentos en inglés o en el mismo idioma, útil en organizaciones con documentación en varias lenguas europeas.

## Benchmarks y rendimiento

Resultados oficiales de MTEB (MTEB 2.26.3, vectores de 768 d, bf16 y atención SDPA) frente a ColModernVBERT:

| ViDoRe V1 (nDCG@5) | ColModernVBERT | ColUltraVBERT |
|---|---:|---:|
| ArxivQA | 75,0 | 80,1 |
| DocVQA | 56,2 | 57,7 |
| InfoVQA | 86,5 | 89,5 |
| TabFQuAD | 76,1 | 92,5 |
| TAT-DQA | 73,9 | 75,1 |
| ShiftProject | 64,8 | 81,2 |
| SyntheticDocQA AI | 97,5 | 99,6 |
| SyntheticDocQA Energy | 94,2 | 95,7 |
| SyntheticDocQA Government Reports | 93,3 | 95,1 |
| SyntheticDocQA Healthcare Industry | 96,9 | 97,9 |
| **Media** | **81,4** | **86,4** |

| ViDoRe V2 (nDCG@5) | ColModernVBERT | ColUltraVBERT |
|---|---:|---:|
| ESG Reports | 40,5 | 49,8 |
| Economics Reports | 32,6 | 51,2 |
| BioMedical Lectures | 34,8 | 54,3 |
| ESG Reports HL | 54,8 | 64,0 |
| **Media** | **40,7** | **54,8** |

| ViDoRe V3 (nDCG@10) | ColModernVBERT | ColUltraVBERT |
|---|---:|---:|
| Computer Science | 37,6 | 66,5 |
| Energy | 32,5 | 51,9 |
| Finance EN | 28,8 | 53,3 |
| Finance FR | 19,8 | 33,3 |
| HR | 19,8 | 51,1 |
| Industrial | 15,7 | 37,6 |
| Pharmaceuticals | 32,2 | 57,6 |
| Physics | 22,6 | 37,7 |
| Nuclear (privado) | 21,5 | 42,0 |
| Telecom (privado) | 30,3 | 62,0 |
| **Media, público** | **26,1** | **48,6** |
| **Media, privado** | **25,9** | **52,0** |
| **Media, total** | **26,1** | **49,3** |

Efecto del truncamiento de dimensiones (resolución 3.072 px, 25 tiles):

| Tamaño de vector | Resolución | V1 | V2 | V3 público |
|---:|---|---:|---:|---:|
| 768 | 3.072 px, 25 tiles | 86,4 | 54,8 | 48,7 |
| 512 | 3.072 px, 25 tiles | 86,3 | 54,3 | 48,4 |
| 320 | 3.072 px, 25 tiles | 86,0 | 54,2 | 48,2 |
| 256 | 3.072 px, 25 tiles | 86,0 | 54,3 | 48,0 |
| 128 | 3.072 px, 25 tiles | 85,7 | 54,3 | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 255M parámetros (0,5 GB en safetensors). En bf16 requiere aproximadamente 0,5-0,6 GB de pesos; en fp32, alrededor de 1 GB. El pico de memoria depende del número de tiles por página: con 25 tiles y 1.664 vectores de imagen por página, el coste de activaciones es el factor dominante.
- GPU recomendadas: cualquier GPU con al menos 8-12 GB de VRAM puede ejecutar el modelo con comodidad; una RTX 4090, A100 o H100 ofrece margen sobrado para procesar lotes de páginas en paralelo.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070/4080 y superiores.
- Opciones de despliegue: sentence-transformers (`MultiVectorEncoder`), transformers>=5.21 con soporte nativo de UltraVBERT, o `trust_remote_code=True` en 5.20.x. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada. El coste por página crece con el número de tiles; reducir la resolución a 2.048 px y 16 tiles disminuye el número máximo de vectores por página de 1.664 a 1.088.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | ViDoRe V1 (media) | ViDoRe V2 (media) | ViDoRe V3 (media) | Licencia |
|---|---:|---|---:|---:|---:|---|
| ColUltraVBERT | 255M | Late interaction (multi-vector) | 86,4 | 54,8 | 49,3 | MIT |
| ColModernVBERT | No disponible | Late interaction (multi-vector) | 81,4 | 40,7 | 26,1 | No disponible en la información |
| BiUltraVBERT | No disponible | Single-vector | No disponible | No disponible | No disponible | No disponible |
| UltraVBERT (base) | No disponible | Encoder vision-language | No disponible | No disponible | No disponible | No disponible |

ColUltraVBERT supera a ColModernVBERT en las tres versiones de ViDoRe, con una ventaja especialmente marcada en V3 (49,3 frente a 26,1). BiUltraVBERT y UltraVBERT pertenecen a la misma familia del autor, pero no se han publicado sus resultados en la información disponible para una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo exclusivamente de recuperación: no genera texto, no soporta tool calling ni razonamiento multi-paso; debe combinarse con un LLM para tareas de respuesta generativa.
- Riesgo de recuperación incorrecta en dominios muy especializados: los resultados en ViDoRe V3 Finance FR (33,3) y Physics (37,7) son notablemente inferiores a los de otros dominios, lo que indica un rendimiento desigual según el tipo de documento.
- Sesgo lingüístico: el 73% de las consultas de entrenamiento están en inglés, por lo que el rendimiento en español, italiano y portugués puede ser inferior al del inglés pese a estar soportados.
- Coste de indexación elevado en almacenamiento: cada página puede generar hasta 1.664 vectores de 768 dimensiones, lo que multiplica el tamaño del índice frente a recuperadores de vector único; el truncamiento Matryoshka mitiga este problema a costa de una ligera pérdida de precisión.
- Dependencia de versiones recientes: requiere sentence-transformers>=6.1 y transformers>=5.21 (o `trust_remote_code=True`), lo que puede complicar la integración en entornos con dependencias fijadas.
- Licencia MIT: permite uso comercial y modificación, pero no se documentan garantías ni auditorías de sesgo por parte del autor.
- No se han publicado análisis específicos de sesgos demográficos, culturales o de alucinación en la información disponible; al ser un recuperador, el riesgo de alucinación se traslada al LLM que consuma sus resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/athrael-soju/ColUltraVBERT
- Modelo base UltraVBERT: https://huggingface.co/athrael-soju/UltraVBERT
- Recuperador single-vector BiUltraVBERT: https://huggingface.co/athrael-soju/BiUltraVBERT
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/athrael-soju/ColUltraVBERT
- Dataset de entrenamiento VDR Train 500k: https://huggingface.co/datasets/athrael-soju/vdr-train-500k
- Documentación de UltraVBERT en transformers: https://huggingface.co/docs/transformers/model_doc/ultravbert
- Resultados MTEB (PR #783): https://github.com/embeddings-benchmark/results/pull/783
- Resultados MTEB ViDoRe V3 privados (PR #792): https://github.com/embeddings-benchmark/results/pull/792
- Modelo de comparación ColModernVBERT: https://huggingface.co/ModernVBERT/colmodernvbert
