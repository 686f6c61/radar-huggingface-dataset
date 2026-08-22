# cstr/ettin-reranker-150m-v1-GGUF

## Resumen

Ettin Reranker 150M es un modelo de reranking cross-encoder desarrollado por la organización CrossEncoder, basado en la arquitectura ModernBERT. Con 150 millones de parámetros, está diseñado para reordenar documentos en pipelines de recuperación semántica (RAG, búsqueda empresarial, etc.) puntuando pares consulta-documento. Esta versión GGUF, publicada por el usuario cstr, ofrece cuantizaciones (F32, F16, Q8_0, Q4_K) que permiten desplegarlo en entornos con recursos limitados sin degradar el orden de los resultados. El modelo se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial y su integración en sistemas propietarios.

La relevancia de este modelo radica en su equilibrio entre tamaño reducido y calidad de reranking, así como en su compatibilidad con el ecosistema CrispEmbed, que proporciona una interfaz C y CLI para inferencia eficiente. Su arquitectura ModernBERT incorpora atención alternada global y deslizante (ventana de 128), lo que reduce el coste computacional frente a transformers densos de tamaño similar. Aunque los datos de entrenamiento no se han publicado, el modelo ha sido evaluado en el benchmark MTEB Retrieval, según el leaderboard oficial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT cross-encoder (22 capas, 768 hidden, 12 cabezas) |
| Parametros totales | 150.062.984 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 7999 tokens (según MTEB leaderboard) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q4_K |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (original en safetensors) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ModernBERT, que combina atención global en capas pares y atención deslizante con ventana de 128 tokens en capas impares, junto con embeddings rotatorios (RoPE) con theta de 160000. El tokenizador es GPT-2 ByteLevel BPE con 50368 tokens. Sobre el cuerpo de ModernBERT se añade una cabeza de clasificación compuesta por una capa densa (768→768) con activación GELU, seguida de LayerNorm y una capa final densa (768→1) que produce la puntuación de relevancia.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni las técnicas de optimización (RLHF, DPO, etc.). La model card solo indica que es un cross-encoder entrenado para reranking, y el leaderboard de MTEB confirma que ha sido evaluado en tareas de retrieval. La conversión a GGUF se realizó con la herramienta CrispEmbed `convert-bert-to-gguf.py`, que preserva la estructura del modelo y permite inferencia en C/C++.

## Capacidades

- Reranking de pares consulta-documento: devuelve una puntuación de relevancia para cada par, permitiendo reordenar listas de documentos recuperados.
- Inferencia por lotes: soporta procesamiento de múltiples documentos contra una misma consulta mediante la función `crispembed_rerank_batch`.
- Integración en C/C++: API C para incorporar el modelo en aplicaciones de bajo nivel sin dependencias de Python.
- Compatibilidad con cuantizaciones: las versiones Q8_0 y Q4_K mantienen el orden de los resultados con diferencias de puntuación máximas de 0.06 y 0.12 respectivamente, según las pruebas del autor.
- No genera texto: al ser un cross-encoder, no produce respuestas ni razonamiento; solo puntúa pares.
- Sin soporte de tool calling ni agentes: su función se limita a la clasificación de relevancia.

## Casos de uso

- Búsqueda semántica en bases de conocimiento: integrar el reranker tras un recuperador inicial (BM25 o embeddings) para reordenar los top-k resultados y mejorar la precisión de la respuesta final.
- Sistemas RAG (Retrieval-Augmented Generation): antes de pasar los documentos al generador, el reranker filtra y ordena los fragmentos más relevantes, reduciendo el ruido y mejorando la coherencia de las respuestas generadas.
- Atención al cliente automatizada: en un chatbot con acceso a documentación técnica, el modelo puede priorizar los artículos más relevantes para cada consulta del usuario, incluso con conversaciones de contexto largo gracias a su ventana de 7999 tokens.
- Moderación de contenido: puntuar pares de texto (por ejemplo, comentario vs. política de la comunidad) para detectar infracciones, aunque requiere adaptación con datos específicos.
- Búsqueda en entornos empresariales: reordenar resultados de búsqueda interna en intranets o CRMs, donde la precisión es crítica y los recursos de hardware limitados.
- Sistemas de recomendación: puntuar pares de ítem-usuario (descripción de producto vs. perfil de interés) para generar listas personalizadas, aprovechando la baja latencia de las versiones cuantizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, etc.) en la información disponible. Sin embargo, el autor de la conversión GGUF proporciona una tabla de calidad relativa a la implementación Python de referencia:

| Quant | France+ | France- | Pasta+ | Pasta- |
|-------|---------|---------|--------|--------|
| Referencia Python | +11.85 | -4.41 | +7.79 | -5.57 |
| F32 | +11.59 | -4.11 | +7.23 | -5.25 |
| F16 | +11.59 | -4.11 | +7.23 | -5.25 |
| Q8_0 | +11.57 | -4.10 | +7.19 | -5.30 |
| Q4_K | +11.50 | -4.13 | +7.17 | -5.35 |

El ranking se preserva perfectamente en todas las cuantizaciones. Además, el harness de difusión por etapas reporta que las 23 etapas pasan con coseno estructural = 1.000000 y el peor coseno por capa es 0.999760. Según el leaderboard MTEB, el modelo fue evaluado en 10 tareas de retrieval (top-100 reranked), aunque no se detallan las puntuaciones en la información consultada.

## Requisitos de hardware

- VRAM mínima: 150 MB para la cuantización Q4_K (102 MB de pesos) más overhead de inferencia; cabe en cualquier GPU con más de 512 MB.
- GPU recomendadas: cualquier GPU moderna (NVIDIA GTX 1060 o superior, RTX 3050, etc.) o incluso CPU con 4 GB de RAM para Q4_K.
- Compatible con hardware de consumo: sí, la versión Q4_K puede ejecutarse en una Raspberry Pi 5 o en un portátil sin GPU dedicada.
- Opciones de despliegue: CrispEmbed (CLI y C API), llama.cpp (si se adapta el formato), o servidores de inferencia compatibles con GGUF como llama-cpp-python.
- Latencia estimada: no disponible, pero al ser un modelo de 150M, se esperan latencias de milisegundos por lote en GPU moderna y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|--------|------------|----------|----------|---------|---------|
| Ettin Reranker 150M (este) | 150M | 7999 tokens | Apache-2.0 | GGUF | Cross-encoder ModernBERT |
| BGE Reranker v2-m3 | 568M | 8192 tokens | MIT | safetensors | Cross-encoder XLM-RoBERTa |
| Jina Reranker v2 | 278M | 8192 tokens | Apache-2.0 | safetensors | Cross-encoder |
| Cohere Rerank (API) | no público | 4096 tokens | propietario | API | Cross-encoder |

No se dispone de datos de rendimiento comparativo directo con estos modelos en las fuentes consultadas. La elección entre ellos dependerá de la latencia requerida, el presupuesto de hardware y la licencia.

## Limitaciones y advertencias

- Sesgos: al ser un modelo entrenado probablemente con datos en inglés, puede mostrar sesgos hacia ese idioma y hacia dominios específicos (por ejemplo, tecnología, noticias). No se ha publicado información sobre mitigación de sesgos.
- Riesgo de alucinación: al ser un reranker, no genera texto, por lo que el riesgo de alucinación es nulo en su función principal. Sin embargo, las puntuaciones pueden ser inconsistentes para entradas fuera de su distribución.
- Limitaciones de contexto: aunque soporta hasta 7999 tokens, el rendimiento en secuencias muy largas no está documentado; se recomienda truncar a la longitud del entrenamiento.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, pero no se proporciona garantía ni soporte oficial.
- Dependencia de CrispEmbed: la versión GGUF solo es utilizable con la librería CrispEmbed; no es compatible directamente con transformers o sentence-transformers.
- Falta de transparencia sobre el entrenamiento: no se han publicado detalles del dataset ni del proceso de entrenamiento, lo que dificulta evaluar su robustez en dominios específicos.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/cstr/ettin-reranker-150m-v1-GGUF
- Modelo base (safetensors): https://huggingface.co/cross-encoder/ettin-reranker-150m-v1
- Leaderboard MTEB: https://mteb-leaderboard.hf.space/models/cross-encoder/ettin-reranker-150m-v1
- Repositorio CrispEmbed: https://github.com/CrispStrobe/CrispEmbed
- Informe AI Flash Report (familia Ettin): https://aiflashreport.com/models/the-ettin-reranker-family/
