# mradermacher/Qwen3.8-27B-ScientificBM-GGUF

## Resumen

Qwen3.8-27B-ScientificBM-GGUF es la redistribución en formato GGUF del modelo Rumiii/Qwen3.8-27B-ScientificBM, un modelo de lenguaje de 27.320.697.856 parámetros (unos 27,3 mil millones) afinado para trabajo científico con orientación biomédica y bioinformática. No lo entrena el publicador de este repositorio: mradermacher se limita a generar cuantizaciones estáticas del modelo original, de modo que pueda ejecutarse con llama.cpp y herramientas compatibles fuera de entornos con GPUs de gama alta.

El interés del modelo está en su especialización: las etiquetas del repositorio apuntan a tool calling y function calling sobre servicios de datos biológicos concretos (NCBI, UniProt, Ensembl) y a un ajuste con el dataset gxx27/BioTool. La etiqueta qwen3_5 sugiere que la arquitectura de partida pertenece a la familia Qwen3.5, aunque la información disponible no documenta la arquitectura interna, la longitud de contexto ni el volumen de tokens de entrenamiento.

La relevancia práctica es doble. Por un lado, ofrece una vía para desplegar un modelo de 27B especializado en dominio científico sobre hardware de consumo o servidores modestos, con cuantizaciones que van de 11,0 GB (Q2_K) a 29,1 GB (Q8_0). Por otro, el repositorio incluye ficheros mmproj (proyector multimodal) en Q8_0 y f16, lo que sugiere componentes multimodales en el modelo base, aunque la model card no detalla qué modalidades cubre. El modelo se publica bajo licencia Apache 2.0 e idioma declarado inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; no documentada en detalle. La etiqueta qwen3_5 sugiere ascendencia de la familia Qwen3.5 |
| Parámetros totales | 27.320.697.856 (~27,3 B), dato real de safetensors |
| Parámetros activos | no disponible (la información no confirma que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; además mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (los pesos originales del modelo base se distribuyen por separado) |
| Tamaño del repositorio | 175,4 GB |
| Modelo base | Rumiii/Qwen3.8-27B-ScientificBM |
| Dataset de ajuste | gxx27/BioTool |

## Arquitectura y entrenamiento

No se dispone de documentación técnica sobre la arquitectura interna en la información proporcionada. El recuento de parámetros (27,3 B) y la etiqueta qwen3_5 apuntan a un transformer decoder-only de la familia Qwen, pero no se confirma ni el número de capas, ni el mecanismo de atención, ni si emplea mezcla de expertos. Tampoco se detalla la longitud de contexto nativa, un dato crítico para evaluar su uso en pipelines de agentes.

Respecto al entrenamiento, la model card solo declara el uso del dataset gxx27/BioTool y las etiquetas biomedical, bioinformatics, tool-calling, function-calling, ncbi, uniprot y ensembl. No se indica el número de tokens, la composición del corpus, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. La presencia de ficheros mmproj (proyector multimodal) en el repositorio de cuantizaciones indica que el modelo base incorpora algún componente multimodal que requiere un proyector separado para funcionar en llama.cpp, pero la model card disponible no especifica qué modalidades soporta ni con qué resolución de entrada. Este repositorio, por tanto, solo aporta la cuantización: no hay innovaciones de arquitectura propias del publicador.

## Capacidades

- Generación de texto y razonamiento en dominio científico, con especialización declarada en biomedicina y bioinformática.
- Tool calling y function calling, con etiquetas explícitas para integración con NCBI, UniProt y Ensembl.
- Flujos de investigación multi-paso: consulta a bases de datos biológicas, encadenamiento de resultados y síntesis posterior.
- Capacidad multimodal indicada por la presencia de proyectores mmproj-Q8_0 y mmproj-f16; el alcance exacto (visión, u otras modalidades) no está documentado.
- Conversación multi-turno (etiqueta conversational en los metadatos del repositorio).
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Idiomas: únicamente inglés declarado.
- No se documentan capacidades específicas de modo thinking, audio ni vídeo.

## Casos de uso

- Análisis de secuencias y anotación génica: el modelo puede actuar como capa de razonamiento sobre llamadas a Ensembl para recuperar transcritos, variantes y anotaciones, y resumir la salida en lenguaje natural para un informe. La especialización declarada en Ensembl reduce la fricción de construir los esquemas de herramientas desde cero.
- Consulta de literatura y registros biomédicos vía NCBI: integrado como agente que traduce una pregunta clínica a búsquedas en PubMed o en bases de nucleótidos, recupera los registros y sintetiza la respuesta citando identificadores.
- Enriquecimiento funcional de proteínas con UniProt: dado un listado de identificadores, el modelo orquesta llamadas para obtener nombres, ontologías GO, dominios y rutas, y devuelve una tabla consolidada.
- Asistente de laboratorio en formato chat: despliegue local con llama.cpp u Ollama para responder dudas sobre protocolos y terminología, sin enviar datos a servicios externos, lo que resulta relevante con datos no publicados.
- Generación de pipelines bioinformáticos: conversión de una descripción en lenguaje natural a un script de análisis (por ejemplo, consultas encadenadas a APIs REST) usando el soporte de function calling para validar cada paso.
- Extracción estructurada de fichas técnicas y artículos: convertir texto científico en JSON con campos definidos (organismo, gen, variante, método), aprovechando que el ajuste con BioTool ya expone el modelo a formatos de llamada estructurados.
- Prototipado de agentes científicos en investigación: al ser Apache 2.0 y estar cuantizado hasta 11 GB, sirve para validar arquitecturas de agentes en una estación de trabajo antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni métricas específicas de tareas biomédicas, y la model card del cuantizador remite únicamente a los ficheros generados. Tampoco se aportan datos de evaluación del modelo base Rumiii/Qwen3.8-27B-ScientificBM en el material consultado, por lo que no es posible comparar su rendimiento con alternativas de forma cuantitativa.

## Requisitos de hardware

- VRAM estimada a partir del tamaño de los ficheros publicados, añadiendo entre 2 y 4 GB para caché KV y sobrecarga del runtime (el contexto configurado puede aumentar esta cifra de forma notable):
  - Q2_K (11,0 GB): unos 13-15 GB de VRAM.
  - Q3_K_M (13,6 GB): unos 16-18 GB.
  - Q4_K_S (15,9 GB) y Q4_K_M (16,9 GB): unos 18-21 GB.
  - Q5_K_M (19,6 GB): unos 22-24 GB.
  - Q6_K (22,5 GB): unos 25-27 GB.
  - Q8_0 (29,1 GB): unos 32-34 GB.
  - Referencia: en f16 el modelo ocuparía aproximadamente 54,6 GB solo en pesos (27,32 B × 2 bytes).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M con contexto moderado; RTX 3090/4080 para Q3_K_M o Q4_K_S; A100 40 GB o H100 80 GB para Q8_0 con contexto amplio; configuraciones multi-GPU para Q6_K y Q8_0 en consumer.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q5_K_M en tarjetas de 16-24 GB, con la salvedad de que la caché KV reduce el contexto utilizable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y llama-cpp-python son las vías naturales para GGUF. Para servidores con GGUF, llama.cpp dispone de servidor propio; vLLM y TGI están pensados para pesos sin cuantizar o cuantizaciones propias y no son la ruta recomendada aquí. Los ficheros mmproj requieren un runtime con soporte multimodal de llama.cpp.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para estas cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen3.8-27B-ScientificBM-GGUF | 27,3 B | no disponible | GGUF (12 variantes) | Apache 2.0 | Especializado en biomedicina y tool calling científico; 0 descargas y 0 likes en el momento de la consulta |
| Rumiii/Qwen3.8-27B-ScientificBM | 27,3 B (mismo base) | no disponible | safetensors | no disponible en la información | Modelo original sin cuantizar; requiere VRAM muy superior |
| mradermacher/Qwen3.8-27B-Uncensored-GGUF | 27,3 B (misma familia) | no disponible | GGUF | no disponible en la información | Variante sin censura; ~7,2 K descargas y 3 likes según abliteration.org |
| mradermacher/Qwen3.8-27B-heretic-ara-GGUF | 27,3 B (misma familia) | no disponible | GGUF | no disponible en la información | Variante con ajuste de abliteración; sin datos de rendimiento |
| mradermacher/Qwen3.8-27B-full-Uncensored-GGUF | 27,3 B (misma familia) | no disponible | GGUF | no disponible en la información | ~1,1 K descargas según abliteration.org |

La comparación relevante es frente al modelo base sin cuantizar (mejor calidad numérica, mucho más exigente en hardware) y frente a las otras variantes de Qwen3.8-27B publicadas por el mismo autor, que difieren en el ajuste de alineación, no en el tamaño. No se dispone de datos de benchmarks que permitan ordenar estas variantes por calidad.

## Limitaciones y advertencias

- Sesgos: no se documenta ningún análisis de sesgo. El ajuste con un dataset específico (gxx27/BioTool) puede introducir sesgos de dominio y de estilo de consulta que no han sido evaluados públicamente.
- Alucinación: riesgo relevante en un modelo orientado a datos científicos. Los identificadores de NCBI, UniProt o Ensembl generados por el modelo deben validarse siempre contra la API real antes de usarse; un identificador plausible pero inexistente es un fallo típico y silencioso.
- Idioma: solo se declara inglés. El uso en castellano no está soportado oficialmente y la calidad en otros idiomas no está medida.
- Contexto: se desconoce la longitud de contexto nativa, lo que impide garantizar ventanas largas para pipelines de agentes con muchos pasos.
- Validación comunitaria nula: 0 descargas y 0 likes en el repositorio en el momento de la consulta, y sin benchmarks publicados. No hay evidencia independiente de su calidad.
- Licencia: el repositorio de cuantización es Apache 2.0, lo que permite uso comercial, pero conviene verificar la licencia del modelo base Rumiii/Qwen3.8-27B-ScientificBM y las condiciones de los datos de entrenamiento antes de un despliegue en producción.
- Multimodalidad sin documentar: los ficheros mmproj existen, pero no se especifica qué modalidades cubren ni con qué precisión; no debe asumirse soporte de visión fiable sin pruebas propias.
- Producción: al ser cuantizaciones estáticas sin versiones con imatrix (el autor indica que no están disponibles en ese momento), la pérdida de calidad frente a f16 es mayor en Q2_K y Q3; para uso científico conviene partir de Q5_K_M o Q8_0.
- Fechas y estado: el repositorio se creó y actualizó el 27 de octubre de 2026; puede haber cambiado desde entonces.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-ScientificBM-GGUF
- Modelo base: https://huggingface.co/Rumiii/Qwen3.8-27B-ScientificBM
- Dataset de ajuste: https://huggingface.co/datasets/gxx27/BioTool
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-ScientificBM-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Variante Uncensored (relacionada): https://huggingface.co/mradermacher/Qwen3.8-27B-full-Uncensored-GGUF
- Variante heretic-ara (relacionada): https://huggingface.co/mradermacher/Qwen3.8-27B-heretic-ara-GGUF
- Ficha de la variante Uncensored en abliteration.org: https://abliteration.org/models/mradermacher/Qwen3.8-27B-Uncensored-GGUF
