# mradermacher/Chaotic-Order-24B-V3-i1-GGUF

## Resumen

Chaotic-Order-24B-V3-i1-GGUF es la versión cuantizada en formato GGUF del modelo Sorihon/Chaotic-Order-24B-V3, un modelo de 23.572.403.200 parámetros (unos 23,57 B) generado mediante fusión de modelos con mergekit. La publicación corre a cargo de mradermacher, un autor conocido en HuggingFace por producir cuantizaciones sistemáticas de modelos abiertos, en este caso con la variante "i1", que utiliza una matriz de importancia (imatrix) para reducir la pérdida de calidad en cuantizaciones agresivas.

El repositorio no incluye model card propia más allá de la plantilla estándar del cuantizador: no se documentan arquitectura interna, datos de entrenamiento, longitud de contexto, licencia ni resultados de benchmarks. Se sabe que el modelo base es un merge etiquetado con mergekit, orientado a uso conversacional y declarado únicamente para inglés.

Su relevancia práctica es que permite ejecutar un modelo de ~24 B en hardware de consumo: las cuantizaciones publicadas van desde 8,2 GB (i1-IQ2_M) hasta 19,4 GB (i1-Q6_K), lo que lo sitúa en el rango de una GPU de 12-24 GB de VRAM o de despliegues híbridos CPU+GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fusión de modelos mediante mergekit; arquitectura interna (transformer, MoE, etc.) no disponible |
| Parametros totales | 23.572.403.200 (~23,57 B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF i1: IQ2_M, Q2_K, IQ3_XXS, IQ3_M, Q3_K_M, IQ4_XS, Q4_K_S, Q4_K_M, Q6_K; se incluye fichero imatrix para generar cuantizaciones propias |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (llama.cpp); el modelo base del que deriva usa safetensors |
| Modelo base | Sorihon/Chaotic-Order-24B-V3 |
| Tamano del repositorio | 151,8 GB (todos los ficheros GGUF) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 2026-10-04 |
| Ultima actualizacion | 2026-10-04 |

## Arquitectura y entrenamiento

No hay información disponible sobre la arquitectura interna que hay debajo de la fusión. Las etiquetas del repositorio indican únicamente que el modelo base se generó con mergekit (tags "mergekit" y "merge"), por lo que se trata de una combinación de pesos de dos o más modelos preentrenados, presumiblemente de la misma familia arquitectónica para que la fusión sea viable. La etiqueta "conversational" apunta a un ajuste orientado a diálogo, pero no se especifica si hubo RLHF, DPO, SFT ni qué datasets se emplearon.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni innovaciones técnicas concretas. La única información técnica sustantiva del repositorio es de naturaleza cuantitativa: la colección "i1" se ha generado con una matriz de importancia (imatrix) propia del modelo, lo que típicamente mejora la perplejidad de las cuantizaciones de 2 a 4 bits respecto a las cuantizaciones estáticas equivalentes. El autor indica además que las cuantizaciones IQ suelen ser preferibles a las no IQ de tamaño similar, y publica enlaces a la gráfica comparativa de tipos de cuantización de ikawrakow y a las notas de Artefact2 sobre el tema.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" del repositorio.
- Conversación multi-turno, presumiblemente con soporte de plantilla de chat del modelo base. No se documenta el prompt template en la información disponible.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- No se documenta modo "thinking", visión, audio ni ninguna capacidad multimodal.
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.
- Capacidad de código y matemáticas: no disponible, no hay datos que lo confirmen.

## Casos de uso

Dado que la model card no documenta capacidades específicas, los casos siguientes son escenarios típicos de un modelo conversacional de ~24 B en inglés, y deben validarse empíricamente antes de llevarlos a producción.

- Asistente conversacional en inglés: despliegue local con llama.cpp u Ollama para diálogo multi-turno. El atractivo es el coste cero de API y la ausencia de envío de datos a terceros, siempre que la licencia final permita el uso previsto (actualmente no declarada).
- Generación de texto creativo y narrativa: los modelos fusionados de este rango de tamaño suelen producir prosa más variada que modelos más pequeños; conviene probar las cuantizaciones i1-Q4_K_M o superiores para evitar degradación en textos largos.
- Resumen y reescritura de documentos en inglés: con una cuantización Q6_K (19,4 GB) en una GPU de 24 GB se puede mantener calidad cercana al modelo original para tareas de transformación de texto.
- Prototipado e investigación en técnicas de fusión: el repositorio es útil para estudiar cómo se comportan las cuantizaciones con imatrix sobre un modelo fusionado, comparando i1-Q4_K_M (14,4 GB) frente a la cuantización estática del repositorio hermano.
- Evaluación comparativa de cuantizaciones: el fichero imatrix (0,1 GB) permite generar cuantizaciones propias de otros tipos y medir el impacto en perplejidad, algo relevante para equipos que ajustan el binomio tamaño/calidad.
- Generación de datos sintéticos en inglés: un 24 B cuantizado a Q6_K puede emplearse para producir corpus de texto a coste marginal bajo, con revisión humana posterior para filtrar alucinaciones.
- Chatbot de nicho autoalojado: para dominios concretos en inglés (soporte técnico, FAQ, documentación interna) donde no se requiere tool calling ni contexto muy largo, una cuantización IQ3_M o Q4_K_S cabe en GPUs de 12-16 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica. La única referencia de rendimiento es un gráfico externo (enlazado en la model card) que compara la perplejidad de distintos tipos de cuantización de llama.cpp, no el rendimiento del modelo frente a otros modelos.

## Requisitos de hardware

Las cifras de VRAM son estimaciones a partir de los tamaños de fichero publicados, añadiendo un margen para caché KV y overhead del runtime. El contexto real del modelo no está documentado, por lo que la caché KV puede variar.

- i1-IQ2_M (8,2 GB): ~10 GB de VRAM. Cabe en RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB. Calidad degradada.
- i1-Q2_K (9,0 GB): ~11 GB de VRAM. El autor recomienda IQ3_XXS en su lugar.
- i1-IQ3_XXS (9,4 GB): ~11-12 GB de VRAM. Calidad baja según el autor.
- i1-IQ3_M (10,8 GB): ~13 GB de VRAM. Ajustado en GPU de 12 GB; cómodo en 16 GB.
- i1-Q3_K_M (11,6 GB): ~14 GB de VRAM. El autor sugiere IQ3_S como alternativa mejor.
- i1-IQ4_XS (12,9 GB): ~15 GB de VRAM. Cabe en RTX 4060 Ti 16 GB, RTX 4080, RTX 4090.
- i1-Q4_K_S (13,6 GB): ~16 GB de VRAM. El autor lo marca como tamaño/velocidad/calidad óptimos.
- i1-Q4_K_M (14,4 GB): ~17 GB de VRAM. Marcado como "rápido, recomendado". Cabe en RTX 4080/4090 y A100 40 GB.
- i1-Q6_K (19,4 GB): ~22 GB de VRAM. Al límite en RTX 3090/4090 de 24 GB; recomendable en A100 40 GB, H100 o L40S.
- Despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y text-generation-webui son las opciones naturales para GGUF. vLLM y TGI trabajan mejor con pesos safetensors del modelo base que con GGUF.
- Latencia y throughput: no disponible. Dependen del hardware, del número de capas descargadas a CPU y del contexto utilizado.
- Ejecución parcial en CPU: las cuantizaciones Q4_K_M y superiores son viables en sistemas con 32-64 GB de RAM usando descarga de capas a CPU, con penalización de velocidad.

## Comparativa con modelos similares

La información proporcionada no incluye benchmarks ni una lista de modelos comparables. La siguiente tabla es una comparación estructural basada en datos públicos de conocimiento general sobre modelos de la misma franja de tamaño, no en datos del repositorio analizado; debe tomarse como orientativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Chaotic-Order-24B-V3-i1-GGUF | ~23,57 B | No disponible | No disponible | GGUF en HuggingFace (i1 y estático) |
| Mistral Small 3 24B | ~24 B | 32k-128k según versión | Apache 2.0 | Pesos abiertos y GGUF de terceros |
| Gemma 2 27B | ~27 B | 8k | Licencia Gemma | Pesos abiertos y GGUF de terceros |
| Qwen2.5 32B | ~32 B | 128k | Apache 2.0 (mayoría de variantes) | Pesos abiertos y GGUF de terceros |

Frente a estos, la ventaja del modelo analizado es su naturaleza de fusión, que puede aportar un estilo de escritura distintivo; la desventaja es la falta total de documentación sobre contexto, licencia y rendimiento, lo que complica su adopción en entornos productivos.

Repositorio hermano con cuantizaciones estáticas: mradermacher/Chaotic-Order-24B-V3-GGUF.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir que el uso comercial esté permitido. Es un bloqueo potencial para producción y debe resolverse consultando el modelo base Sorihon/Chaotic-Order-24B-V3.
- Ausencia de benchmarks: no hay ninguna métrica objetiva de calidad, razonamiento, código o matemáticas.
- Contexto desconocido: no se puede planificar el diseño de prompts ni de pipelines RAG sin conocer la ventana real del modelo base.
- Idioma: solo se declara inglés. El rendimiento en castellano u otros idiomas no está documentado y probablemente sea limitado.
- Sesgos: no hay información sobre el dataset de entrenamiento ni sobre evaluaciones de sesgo. Los modelos fusionados heredan los sesgos de todos sus componentes.
- Alucinación: riesgo inherente a cualquier modelo generativo de este tamaño y sin datos de evaluación; no hay mitigaciones documentadas ni modo de citación de fuentes.
- Origen por fusión: las fusiones con mergekit pueden producir degradaciones sutiles (repeticiones, incoherencias en textos largos) que no aparecen en los modelos originales.
- Cuantizaciones de 2 bits: i1-IQ2_M y i1-Q2_K degradan notablemente la calidad; el propio autor advierte de alternativas mejores en tamaños similares.
- Métricas de adopción nulas: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el modelo.
- Compatibilidad: al ser GGUF, requiere runtimes de llama.cpp u Ollama; no está pensado para servir con vLLM/TGI a través del fichero cuantizado.
- Fecha de creación poco habitual en el repositorio: conviene verificar la vigencia y posibles actualizaciones antes de integrarlo en un proyecto.

## Enlaces

- Repositorio GGUF i1: https://huggingface.co/mradermacher/Chaotic-Order-24B-V3-i1-GGUF
- Modelo base: https://huggingface.co/Sorihon/Chaotic-Order-24B-V3
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Chaotic-Order-24B-V3-GGUF
- Página resumen del cuantizador para este modelo: https://hf.tst.eu/model#Chaotic-Order-24B-V3-i1-GGUF
- Preguntas frecuentes y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de ficheros GGUF (README de TheBloke, referenciado por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Sitio del patrocinador del cuantizador: https://www.nethype.de/
