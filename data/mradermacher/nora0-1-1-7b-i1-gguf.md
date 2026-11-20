# mradermacher/Nora0.1-1.7B-i1-GGUF

## Resumen

Nora0.1-1.7B-i1-GGUF es la colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo base uniqueplayer9102/Nora0.1-1.7B, un modelo de lenguaje de 1.720.574.976 parámetros (aproximadamente 1,7 mil millones) construido sobre la arquitectura Qwen3 y orientado a conversación, roleplay y escritura creativa. El modelo base está publicado bajo licencia Apache 2.0 y se entrenó sobre datasets de conversación como PygmalionAI/PIPPA y lipilipic/NSFW_gemma-2b-it-2, lo que lo sitúa en el segmento de modelos pequeños especializados en diálogo abierto y narrativa.

Este repositorio no contiene los pesos originales en safetensors, sino un conjunto de cuantizaciones GGUF con calibración imatrix (sufijo i1), desde IQ1_S (0,6 GB) hasta Q6_K (1,5 GB), pensadas para ejecución local en CPU/GPU con llama.cpp y herramientas compatibles. La relevancia práctica reside en que permite desplegar un modelo conversacional de 1,7B en hardware de consumo muy modesto, con un rango de compromisos calidad/tamaño muy granular.

La ficha describe tanto las características del modelo base tal como se deducen de los metadatos disponibles (etiquetas qwen3, roleplay, conversational, en) como las particularidades del paquete de cuantizaciones. Cabe advertir que la model card del repositorio es fundamentalmente operativa (tabla de quants, instrucciones de uso) y no aporta detalles de entrenamiento, benchmarks ni especificaciones de contexto, por lo que varios campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer decoder-only, deducido de la etiqueta `qwen3`; detalles internos no disponibles) |
| Parametros totales | 1.720.574.976 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE según los metadatos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con calibración imatrix, sufijo i1) |
| Idiomas soportados | inglés (`en` en la model card); otros idiomas no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base Nora0.1-1.7B se etiqueta como `qwen3`, lo que indica que parte de la familia Qwen3 de Alibaba, probablemente mediante fine-tuning o adaptación sobre un checkpoint de 1,7B de dicha familia. Los metadatos confirman el uso de los datasets PygmalionAI/PIPPA (conversaciones multi-turno de roleplay) y lipilipic/NSFW_gemma-2b-it-2 (dataset de diálogo sin restricciones de contenido), lo que explica las etiquetas `roleplay`, `conversational`, `creative-writing` y `not-for-all-audiences`. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de RLHF, DPO o SFT supervisado.

El repositorio de mradermacher aplica cuantización GGUF con matrices de importancia (imatrix) generadas a partir del modelo base, una técnica que reduce la pérdida de calidad en cuantizaciones agresivas al ponderar los pesos según su impacto en la perplexidad. Se ofrecen tanto quants IQ (importancia-calibrados, preferibles a igual tamaño) como quants K estándar, además del fichero `.imatrix.gguf` para que terceros puedan generar sus propias cuantizaciones. No se documentan innovaciones arquitectónicas adicionales propias de este modelo.

## Capacidades

- Generación de texto conversacional multi-turno, con énfasis declarado en roleplay y diálogo abierto.
- Escritura creativa y narrativa (etiqueta `creative-writing`), incluyendo contenido para adultos (etiqueta `not-for-all-audiences`).
- Comprensión y generación en inglés; capacidades multilingües no documentadas.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere uso mediante APIs compatibles con OpenAI en plataformas de inferencia.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Roleplay y personajes conversacionales: el modelo se entrenó sobre PIPPA, un dataset específico de conversaciones de rol, por lo que es adecuado para chatbots de personaje con personalidad consistente en sesiones multi-turno.
- Escritura creativa asistida: generación de relatos, diálogos y ficción interactiva en local, aprovechando la especialización en narrativa y la ausencia de filtros de contenido en el dataset de entrenamiento.
- Prototipado de chatbots en hardware de consumo: con quants de 1,2 GB (Q4_K_M) puede ejecutarse en portátiles sin GPU dedicada mediante llama.cpp u Ollama, lo que permite iterar rápido en el diseño conversacional antes de escalar a modelos mayores.
- Inferencia en el borde (edge) y entornos sin conectividad: al caber en menos de 2 GB, puede desplegarse en dispositivos con RAM limitada o en contenedores pequeños para demos offline de diálogo.
- Generación de datos sintéticos de diálogo: útil para aumentar datasets conversacionales en inglés con un modelo pequeño y controlable, filtrando después la calidad.
- Experimentación con cuantización: el fichero imatrix y la amplia gama de quants permiten estudiar el impacto de distintos niveles de compresión en la calidad de un modelo conversacional de 1,7B.
- Aplicaciones de entretenimiento y ficción interactiva: integrable en motores de videojuegos o plataformas de historias ramificadas donde se requiere latencia baja y ejecución local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de calidad conversacional, y el modelo base no aporta datos de rendimiento en la información proporcionada.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según el quant elegido: IQ1_S ≈ 0,6 GB; IQ2_M ≈ 0,8 GB; IQ3_S ≈ 1,0 GB; Q4_K_M ≈ 1,2 GB; Q5_K_M ≈ 1,4 GB; Q6_K ≈ 1,5 GB (más overhead de contexto y del runtime de llama.cpp).
- Cabe en cualquier GPU de consumo moderna: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB, así como en iGPU y CPU. Para el quant Q6_K basta una GPU con 2-3 GB libres.
- GPU de datacenter (A100, H100) no son necesarias para este tamaño; resultan sobredimensionadas salvo para servir muchas réplicas concurrentes.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, llama-cpp-python, y servidores compatibles con endpoints (vLLM con soporte GGUF limitado, TGI no soporta GGUF de forma nativa).
- Latencia y throughput: no disponibles en la información proporcionada; en hardware de consumo se espera un rendimiento interactivo para este tamaño, pero no hay cifras publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nora0.1-1.7B-i1-GGUF (este) | 1,7B | no disponible | Apache 2.0 | GGUF (i1) | Especializado en roleplay/conversación, quants imatrix |
| Qwen3-1.7B (base de la familia) | 1,7B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Modelo generalista; referencia arquitectónica |
| Gemma-2B-it (citado en el dataset) | 2B | no disponible | Gemma license | safetensors, GGUF | Modelo conversacional de Google; distinta licencia |
| Modelos de roleplay de 1-3B (familia Pygmalion) | 1-3B | no disponible | variable | GGUF, safetensors | Misma categoría de uso; sin datos comparativos en la información disponible |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre datasets de roleplay y contenido sin filtros, es probable que reproduzca sesgos de dichos corpus, pero no hay análisis publicado.
- Riesgo de alucinación: alto en un modelo de 1,7B sin datos de evaluación; no debe usarse como fuente factual sin verificación.
- Contexto e idioma: la longitud de contexto no está documentada y el único idioma declarado es inglés; el rendimiento en castellano no está garantizado.
- Contenido para adultos: el modelo está etiquetado `not-for-all-audiences` y entrenado con datasets NSFW; requiere moderación si se despliega en productos orientados al público general.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los datasets de entrenamiento (PIPPA y NSFW_gemma-2b-it-2) antes de explotación comercial, ya que la licencia del modelo no cubre necesariamente los datos subyacentes.
- Cuantizaciones muy agresivas (IQ1_S, IQ2_XXS) degradan notablemente la calidad; la propia model card las marca como "for the desperate" o "very low quality".
- El repositorio contiene solo GGUF; para fine-tuning o entrenamiento adicional hay que acudir al modelo base en safetensors.
- No hay garantías de soporte de tool calling ni de comportamiento agéntico; no debe asumirse en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Nora0.1-1.7B-i1-GGUF
- Modelo base: https://huggingface.co/uniqueplayer9102/Nora0.1-1.7B
- Quants estáticos del mismo autor: https://huggingface.co/mradermacher/Nora0.1-1.7B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Nora0.1-1.7B-i1-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Dataset PygmalionAI/PIPPA: https://huggingface.co/datasets/PygmalionAI/PIPPA
- Dataset lipilipic/NSFW_gemma-2b-it-2: https://huggingface.co/datasets/lipilipic/NSFW_gemma-2b-it-2
- Análisis de tipos de quant (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
