# mradermacher/jairo-ai-1.0-flash-i1-GGUF

## Resumen

jairo-ai-1.0-flash-i1-GGUF es la versión cuantizada en formato GGUF del modelo LouieR09112/jairo-ai-1.0-flash, un modelo de lenguaje conversacional de aproximadamente 4.022 millones de parámetros (4B) afinado para chat e instrucciones. La cuantización la ha realizado mradermacher, un autor habitual en el ecosistema GGUF conocido por generar versiones con matrices de importancia (imatrix) para llama.cpp. El modelo base se entrenó sobre el dataset Capybara (trl-lib/Capybara) y se distribuye bajo licencia Apache 2.0.

El interés principal de esta publicación es práctico: ofrece un conjunto amplio de cuantizaciones (desde IQ1_S de 1,2 GB hasta Q6_K de 3,4 GB) que permiten ejecutar un modelo de 4B en hardware de consumo, desde portátiles modestos hasta GPUs dedicadas. Las variantes i1 (imatrix) suelen ofrecer mejor calidad que las cuantizaciones estáticas equivalentes en tamaño, especialmente en los rangos bajos (Q2, Q3).

La información pública disponible sobre el modelo base es escasa: no se detallan arquitectura exacta, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks. Esta ficha refleja únicamente los datos verificables de la model card y de los metadatos de Hugging Face, indicando explícitamente los campos no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, sin confirmar detalles) |
| Parámetros totales | 4.022.468.096 (≈4B) |
| Parámetros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas i1/imatrix) |
| Idiomas soportados | inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (imatrix); el modelo base está en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base LouieR09112/jairo-ai-1.0-flash. Por el tamaño (4B parámetros) y el pipeline declarado (transformers, chat, instruct), se trata presumiblemente de un transformer decoder-only afinado para conversación, pero la model card no especifica número de capas, dimensión oculta, mecanismo de atención ni longitud de contexto nativa.

El único dato de entrenamiento disponible es el dataset utilizado en el ajuste: trl-lib/Capybara, un conjunto de datos conversacionales de alta calidad orientado a instrucciones y razonamiento multi-turno. No se documentan el número de tokens de preentrenamiento, la composición del corpus, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. Esta cuantización concreta se ha generado con matrices de importancia (imatrix), un proceso que pondera la cuantización según la relevancia de cada peso para reducir la pérdida de calidad en bits bajos.

## Capacidades

- Generación de texto conversacional e instrucciones en inglés, según los tags del modelo (chat, instruct).
- Ajuste específico sobre Capybara, lo que sugiere capacidad para diálogo multi-turno y seguimiento de instrucciones.
- No consta soporte documentado de tool calling ni function calling.
- No consta soporte documentado de agentes o razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés según la model card; no se declaran otros idiomas.
- No se declaran capacidades de visión, audio ni modo de razonamiento (thinking mode).
- Al ser un modelo de 4B, su capacidad de razonamiento complejo y código es presumiblemente limitada en comparación con modelos mayores, aunque no hay datos que lo confirmen.

## Casos de uso

- Asistentes conversacionales ligeros en local: el modelo puede gestionar diálogos multi-turno en inglés y ejecutarse en un portátil con la cuantización Q4_K_M (2,6 GB), lo que lo hace adecuado para prototipos de chatbot sin dependencia de la nube.
- Despliegue en dispositivos con recursos limitados: las variantes IQ2 e IQ3 (1,3-2,3 GB) permiten ejecución en CPUs y GPUs integradas, útil para demos y entornos embebidos donde el espacio es crítico.
- Generación de texto asistida en herramientas de escritorio: integrable vía llama.cpp u Ollama para autocompletado, resumen o reescritura de textos en inglés dentro de aplicaciones locales.
- Filtrado y clasificación de texto: con un modelo de 4B y contexto conversacional, puede emplearse para tareas de etiquetado, moderación básica o extracción de información en pipelines por lotes.
- Experimentación e investigación en cuantización: el repositorio ofrece casi todas las variantes de cuantización i1, lo que permite estudiar la degradación de calidad por nivel de bits con un mismo modelo base.
- Educación y prototipado rápido: permite a desarrolladores probar pipelines de inferencia GGUF (llama.cpp, servidores compatibles con OpenAI) con un modelo pequeño antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): IQ1_S/IQ1_M ≈1,2 GB; IQ2_XXS ≈1,3 GB; IQ2_XS/IQ2_S ≈1,5 GB; IQ2_M ≈1,6 GB; Q2_K_S ≈1,7 GB; Q2_K/IQ3_XXS ≈1,8 GB; IQ3_XS ≈1,9 GB; Q3_K_S/IQ3_S ≈2,0 GB; IQ3_M ≈2,1 GB; Q3_K_M ≈2,2 GB; Q3_K_L ≈2,3 GB; IQ4_XS ≈2,4 GB; Q4_0/IQ4_NL/Q4_K_S ≈2,5 GB; Q4_K_M ≈2,6 GB; Q4_1 ≈2,7 GB; Q5_K_S ≈2,9 GB; Q5_K_M ≈3,0 GB; Q6_K ≈3,4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar las cuantizaciones Q4 o superiores (por ejemplo, RTX 3050, GTX 1660, RTX 4060). Para Q5/Q6 conviene disponer de 6-8 GB (RTX 3060, RTX 4060 Ti, RTX 4070). Las variantes IQ2/IQ3 caben en GPUs integradas o en CPU.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones, incluidas GPUs de gama baja y portátiles.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con endpoints OpenAI (el tag endpoints_compatible así lo indica), y cualquier runtime que acepte GGUF.
- Latencia y throughput: no disponibles (no se han publicado mediciones en la información proporcionada).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| jairo-ai-1.0-flash (esta ficha) | ≈4B | no disponible | Apache 2.0 | GGUF (imatrix) y safetensors | Ajustado sobre Capybara; solo inglés declarado |
| Alternativas de ~4B en GGUF | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría. Se recomienda evaluar directamente el modelo base y sus cuantizaciones frente a otros modelos de 4B en el propio entorno de despliegue.

## Limitaciones y advertencias

- Información muy escasa sobre el modelo base: no se documentan arquitectura, contexto, dataset de preentrenamiento ni proceso de alineación, lo que dificulta evaluar su calidad y sesgos.
- Idioma limitado al inglés según la model card; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación inherente a modelos de 4B; no se han publicado evaluaciones de fidelidad.
- Las cuantizaciones de 1-2 bits (IQ1, IQ2, Q2_K) degradan notablemente la calidad; la propia model card advierte de "very low quality" en Q2_K_S y recomienda IQ3_XXS frente a Q2_K.
- No consta soporte de tool calling ni de agentes, por lo que no debe asumirse su uso en pipelines que dependan de function calling.
- Licencia Apache 2.0 permite uso comercial, pero al no conocerse la procedencia completa de los datos de entrenamiento del modelo base, conviene revisar la model card original antes de un despliegue en producción.
- No se han publicado benchmarks, por lo que cualquier afirmación de rendimiento relativo carece de respaldo empírico.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/mradermacher/jairo-ai-1.0-flash-i1-GGUF
- Modelo base: https://huggingface.co/LouieR09112/jairo-ai-1.0-flash
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/jairo-ai-1.0-flash-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#jairo-ai-1.0-flash-i1-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/trl-lib/Capybara
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
