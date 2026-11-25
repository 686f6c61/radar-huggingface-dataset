# mradermacher/Qwen3.8-27B-Uncensored-v3-i1-GGUF

## Resumen

Qwen3.8-27B-Uncensored-v3-i1-GGUF es una cuantización en formato GGUF del modelo InterpreticAI/Qwen3.8-27B-Uncensored-v3, un modelo de lenguaje de aproximadamente 26.900 millones de parámetros derivado de la familia Qwen3.8 y afinado para eliminar el filtrado de contenido, con especial énfasis en la censura política. El autor de la cuantización es mradermacher, un perfil conocido en Hugging Face por publicar versiones GGUF (estáticas y con imatrix) de modelos populares para su uso en llama.cpp y entornos de inferencia local.

El paquete incluye un conjunto amplio de cuantizaciones que van desde IQ1_S (7,2 GB) hasta Q6_K (22,2 GB), lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo con 8-12 GB de VRAM hasta estaciones de trabajo con 24 GB o más. La licencia declarada es Apache 2.0 y el idioma soportado es únicamente inglés. El repositorio ocupa 300,3 GB en total debido a la multiplicidad de ficheros.

La relevancia de esta ficha radica en que se trata de un modelo "uncensored" con licencia permisiva, lo que lo hace atractivo para investigación sobre alineamiento, evaluación de sesgos y experimentación con sistemas sin filtros, pero también plantea advertencias importantes sobre contenido dañino y sobre la fiabilidad de las afirmaciones del autor respecto a la eliminación de censura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo derivado de la familia Qwen3.8; el README no detalla la arquitectura interna) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; además de cuantizaciones estáticas en el repositorio hermano |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con fichero imatrix incluido para generar cuantizaciones propias) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base InterpreticAI/Qwen3.8-27B-Uncensored-v3 en la información proporcionada. Por el nombre y el tamaño (26,9 mil millones de parámetros) se trata presumiblemente de un transformer denso de la familia Qwen3.8, pero el README de la cuantización no documenta número de capas, dimensiones ocultas, mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa.

Tampoco se detallan los datos de entrenamiento: no se indica el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO u otra forma de alineamiento. El único dato relevante es que el modelo se presenta como "uncensored" y con la etiqueta "political-censorship", lo que sugiere un proceso de afinado orientado a eliminar rechazos y filtros de contenido, particularmente en temas políticos. Esta cuantización concreta ha sido generada por mradermacher usando cuantización ponderada con imatrix (marcada como quantize_version 2 y output_tensor_quantised 1), un método que busca preservar mejor la calidad que la cuantización estática equivalente. El README menciona además que se trata de un modelo de visión, con ficheros mmproj (si existen) alojados en el repositorio estático.

## Capacidades

- Generación de texto conversacional en inglés, con estilos de respuesta propios de un modelo afinado por instrucciones.
- Modo "uncensored": el autor declara la eliminación de filtros de contenido, incluyendo la censura política, aunque no se aportan evaluaciones que lo verifiquen.
- Posible soporte de visión según la nota del README ("This is a vision model"), con ficheros mmproj en el repositorio estático; no se detalla qué tareas visuales cubre.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Investigación sobre alineamiento y censura: el modelo permite estudiar qué tipos de contenido se generan cuando se eliminan los filtros, comparando respuestas con las del modelo base original para analizar diferencias de comportamiento.
- Evaluación de sesgos y seguridad: útil como caso de prueba en pipelines de red-teaming, donde se mide la tasa de respuestas dañinas o políticamente sesgadas y se calibran clasificadores de seguridad.
- Experimentación local con llama.cpp: gracias a las cuantizaciones de 7-16 GB, se puede ejecutar en un portátil o una GPU de consumo para prototipar aplicaciones de chat sin depender de la nube.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles y que otros modelos rechazarían, en un entorno controlado y con revisión humana.
- Análisis de textos políticos y históricos: el modelo puede abordar discusiones sobre censura, propaganda o ideologías sin los rechazos típicos de modelos alineados, siempre que el uso sea legítimo y documentado.
- Despliegue en entornos aislados (air-gapped): al ser GGUF y Apache 2.0, puede integrarse en sistemas sin conexión para tareas de generación de texto donde no se requiera cumplimiento estricto de políticas de contenido.
- Comparación de cuantizaciones: el repositorio incluye 23 variantes, lo que permite medir el impacto de la cuantización en perplejidad y calidad para investigación sobre compresión de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~7,2 GB (i1-IQ1_S) hasta ~22,2 GB (i1-Q6_K); las cuantizaciones intermedias más recomendadas (i1-Q4_K_M, i1-Q4_K_S) requieren ~16-17 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q5_K_M o Q6_K; RTX 3090 (24 GB) para Q5_K_M; RTX 4080/4070 Ti Super (16 GB) para Q4_K_M; RTX 4060 Ti 16 GB para Q4_K_S.
- Cabe en GPU de consumo: sí, desde GPUs de 8 GB con cuantizaciones IQ1/IQ2 (calidad muy degradada) hasta 24 GB con Q6_K.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; el formato no es directamente compatible con vLLM o TGI sin conversión.
- Latencia y throughput estimados: no disponible; dependerá del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-v3-i1-GGUF (este) | ~26,9 mil M | no disponible | Apache 2.0 | GGUF (23 cuants) | Afinado "uncensored", solo inglés |
| InterpreticAI/Qwen3.8-27B-Uncensored-v3 | ~26,9 mil M | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| mradermacher/Qwen3.8-27B-Uncensored-v3-GGUF | ~26,9 mil M | no disponible | Apache 2.0 | GGUF estático | Cuantizaciones estáticas del mismo modelo |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo está etiquetado como "uncensored", lo que implica un riesgo elevado de generar contenido ofensivo, dañino, ilegal o políticamente extremo; no debe desplegarse en producción orientada a usuarios sin capas adicionales de moderación.
- Solo soporta inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de factualidad.
- La licencia Apache 2.0 permite uso comercial, pero el uso de un modelo sin filtros en productos comerciales puede acarrear responsabilidad legal y reputacional según la jurisdicción.
- No se documentan sesgos conocidos ni procesos de mitigación; la eliminación de censura política puede introducir o amplificar sesgos ideológicos.
- El tamaño del repositorio (300,3 GB) y la multiplicidad de ficheros complican la descarga y la gestión de versiones.
- Las cuantizaciones IQ1 e IQ2 están marcadas por el propio autor como de calidad muy baja ("for the desperate", "very low quality") y no son adecuadas para uso serio.
- El modelo base y su proceso de entrenamiento no están documentados en la información disponible, lo que dificulta evaluar su fiabilidad.
- No hay garantía de que la "eliminación de censura" sea completa ni de que el modelo mantenga capacidades de razonamiento o código del modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-v3-i1-GGUF
- Modelo base: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-v3-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Uncensored-v3-i1-GGUF
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
