# mradermacher/Radiant-Dawn-26B-A4B-i1-GGUF

## Resumen

Radiant-Dawn-26B-A4B-i1-GGUF es una colección de cuantizaciones GGUF del modelo Radiant-Dawn-26B-A4B, publicada por el usuario mradermacher. El modelo base, desarrollado por Sorihon, es un merge de modelos creado con mergekit, con aproximadamente 26.000 millones de parámetros totales (25.971.339.550 según los safetensors del repositorio). El sufijo "A4B" sugiere una arquitectura de mezcla de expertos (MoE) con unos 4.000 millones de parámetros activos por token, aunque este dato no se confirma explícitamente en la información disponible.

La relevancia de esta publicación es práctica: mradermacher genera cuantizaciones con imatrix (importance matrix) que permiten ejecutar un modelo de 26B en hardware de consumo mediante llama.cpp y derivados. La colección cubre desde IQ1_S (8,6 GB) hasta Q6_K (23,3 GB), lo que abarca desde GPUs de gama media con poca VRAM hasta configuraciones de 24 GB o más.

El repositorio tiene 1.504 descargas y 1 like, fue creado el 21 de noviembre de 2026 y actualizado al día siguiente. La model card es fundamentalmente una guía de descarga de cuantizaciones; no aporta información sobre entrenamiento, datos, benchmarks ni licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo mezcla de expertos (MoE), inferida del sufijo "A4B"; no confirmada en la informacion disponible |
| Parametros totales | 25.971.339.550 (segun safetensors del modelo base) |
| Parametros activos | Aproximadamente 4.000 millones (inferido del sufijo "A4B"; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_1, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, mas fichero imatrix |
| Idiomas soportados | Ingles (segun el campo language de la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Radiant-Dawn-26B-A4B es un merge generado con mergekit, según las etiquetas del repositorio. No se dispone de información sobre qué modelos se combinaron, con qué método de merge (SLERP, TIES, DARE, passthrough, etc.) ni con qué proporciones. El nombre "A4B" sigue la convención habitual de los modelos MoE (por ejemplo, "A3B" en Qwen3-30B-A3B), lo que apunta a una arquitectura con aproximadamente 4.000 millones de parámetros activos sobre un total de 26.000 millones, pero esta interpretación no está confirmada por la documentación.

La model card de mradermacher no aporta detalles sobre datos de entrenamiento, número de tokens, composición del dataset, ni procesos de alineación como RLHF o DPO. Tampoco documenta innovaciones técnicas del modelo base. La model card menciona que se trata de un modelo de visión y que los ficheros mmproj, si existen, se encuentran en el repositorio estático hermano (Radiant-Dawn-26B-A4B-GGUF); sin embargo, no se confirma que el modelo base tenga capacidades multimodales reales.

En cuanto al proceso de cuantización, mradermacher aplica cuantización de tipo i1 (importancia basada en imatrix) con la herramienta de llama.cpp. El repositorio incluye el fichero imatrix (0,2 GB) para que otros usuarios puedan generar sus propias cuantizaciones. La model card indica que los quants IQ suelen ser preferibles a los no-IQ de tamaño similar y remite a gráficos comparativos de perplejidad de ikawrakow y a las notas de Artefact2.

## Capacidades

- Generación de texto conversacional: la etiqueta "conversational" del repositorio indica un ajuste orientado a diálogo, aunque no se detalla el formato de prompt.
- Razonamiento y generación de código: no confirmado explícitamente en la información disponible.
- Capacidades multimodales: la model card afirma que es un modelo de visión y remite a los mmproj del repositorio estático; no se confirma la arquitectura visual ni su calidad.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo language; no hay información sobre otros idiomas.
- Modo thinking explícito: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones i1-Q4_K_M (17,3 GB) o i1-IQ4_XS (14,4 GB) permiten ejecutar un modelo de 26B en GPUs de 16-24 GB (RTX 4080, RTX 4090, RTX 3090) mediante llama.cpp, con una calidad razonable para tareas conversacionales.
- Prototipado de asistentes conversacionales en inglés: el ajuste conversacional y las cuantizaciones ligeras (IQ2_M, 10,8 GB) permiten iterar rápidamente en portátiles con GPU de 12 GB, aceptando cierta pérdida de calidad.
- Evaluación comparativa de cuantizaciones: el repositorio incluye 23 variantes de cuantización más el fichero imatrix, lo que lo convierte en un banco de pruebas útil para medir el impacto de la cuantización en la perplejidad y la calidad de respuesta sobre un mismo modelo base.
- Generación de cuantizaciones propias: el fichero imatrix publicado permite a otros usuarios generar sus propios GGUF con llama.cpp manteniendo la matriz de importancia del autor, útil para equipos que necesitan un equilibrio específico entre tamaño y calidad.
- Experimentación con arquitecturas MoE de tamaño medio: si se confirma la arquitectura A4B, el modelo permite estudiar el comportamiento de un MoE de 26B con ~4B activos en hardware modesto, comparando su eficiencia frente a modelos densos del mismo tamaño.
- Integración en pipelines de inferencia locales con endpoints compatibles: la etiqueta "endpoints_compatible" sugiere compatibilidad con servidores de inferencia tipo OpenAI API (llama.cpp server, Ollama), lo que facilita sustituir un endpoint en pruebas de integración sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (peso de los pesos, sin contar KV cache):
  - i1-IQ1_S: 8,6 GB; i1-IQ2_M: 10,8 GB; i1-IQ3_M: 12,8 GB; i1-IQ4_XS: 14,4 GB; i1-Q4_K_M: 17,3 GB; i1-Q5_K_M: 19,7 GB; i1-Q6_K: 23,3 GB.
  - Añadir entre 1 y 4 GB adicionales para la caché KV según la longitud de contexto efectiva, que no está documentada.
- GPU recomendadas: RTX 4090 (24 GB) para Q5_K_M o Q6_K; RTX 4080 / 4070 Ti Super (16 GB) para Q4_K_M o IQ4_XS; RTX 3060 12 GB o RTX 4070 para IQ3_M o IQ2_M; GPUs de datacenter (A100 40/80 GB, H100) solo si se busca contexto largo o throughput alto, dado que el modelo es pequeño para ese hardware.
- Cabe en GPU de consumo: sí, en la mayoría de configuraciones de 12 GB o más con cuantizaciones IQ2/IQ3; en 8 GB solo con IQ1_S o IQ1_M, con calidad muy degradada.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (importando el GGUF), LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI. vLLM y TGI no son la vía natural para GGUF i1, aunque vLLM soporta GGUF de forma experimental.
- Latencia y throughput estimados: no disponibles; dependerán del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Radiant-Dawn-26B-A4B-i1-GGUF | 25,97B totales (≈4B activos, inferido) | no disponible | no disponible | GGUF i1 | Merge con mergekit; 23 cuantizaciones; etiqueta de visión |
| Qwen3-30B-A3B | 30,5B totales (3,3B activos) | 32.768 nativo, ampliable | Apache 2.0 | safetensors, GGUF | MoE conocido con licencia permisiva y benchmarks publicados |
| Mixtral 8x7B | 46,7B totales (12,9B activos) | 32.768 | Apache 2.0 | safetensors, GGUF | MoE de referencia, mayor tamaño y VRAM |
| Gemma 2 27B | 27B densos | 8.192 | Gemma Terms | safetensors, GGUF | Denso comparable en tamaño, licencia con restricciones de uso |

La comparación con Qwen3-30B-A3B y Mixtral es orientativa: no se dispone de benchmarks del modelo Radiant-Dawn que permitan una comparación de rendimiento rigurosa. La principal ventaja del modelo aquí descrito es la disponibilidad de cuantizaciones i1 con imatrix ya generadas; su principal desventaja es la falta de documentación sobre entrenamiento, licencia y capacidades reales.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Antes de usarlo en producción, hay que verificar la licencia del modelo base Sorihon/Radiant-Dawn-26B-A4B y de los modelos que se combinaron en el merge.
- Modelo merge sin documentación: al ser un merge con mergekit, no hay información sobre los modelos de origen ni sobre el método, lo que dificulta evaluar sesgos heredados y calidad real.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluación publicada que lo cuantifique.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea pobre.
- Capacidades multimodales inciertas: la model card afirma que es un modelo de visión, pero los ficheros mmproj no están en este repositorio y no se confirma su funcionamiento.
- Cuantizaciones de baja calidad: las variantes IQ1_S, IQ1_M, Q2_K_S e IQ2_XXS degradan notablemente la calidad según las propias notas del autor ("for the desperate", "very low quality"); no deberían usarse en producción.
- Contexto desconocido: sin longitud de contexto documentada, el dimensionado de la caché KV y la planificación de memoria son aproximados.
- Fecha de creación futura (noviembre de 2026): conviene verificar la procedencia y vigencia del repositorio antes de confiar en él.
- Sin benchmarks: no hay datos objetivos de MMLU, HumanEval, GSM8K ni evaluaciones conversacionales que respalden su calidad.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/Radiant-Dawn-26B-A4B-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Radiant-Dawn-26B-A4B-GGUF
- Modelo base: https://huggingface.co/Sorihon/Radiant-Dawn-26B-A4B
- Página de resumen de descargas del autor: https://hf.tst.eu/model#Radiant-Dawn-26B-A4B-i1-GGUF
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- nethype GmbH (empresa del autor): https://www.nethype.de/
