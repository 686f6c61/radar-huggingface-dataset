# mradermacher/lvetter-titanium-100b-GGUF

## Resumen

lvetter-titanium-100b-GGUF es la versión cuantizada en formato GGUF del modelo base Lvetter/lvetter-titanium-100b, publicada por el usuario mradermacher, conocido por generar cuantizaciones estáticas de modelos abiertos. El modelo original es un transformer de tipo mixture-of-experts (MoE) orientado a razonamiento, con etiquetas que indican soporte de "adaptive thinking" y capacidades conversacionales, y está dirigido a los idiomas polaco e inglés. La versión cuantizada conserva la licencia Apache 2.0 del modelo base.

El dato más relevante a nivel técnico es el tamaño real de los pesos: 141.481.874.432 parámetros totales según los safetensors del modelo base, pese a que el nombre comercial haga referencia a "100b". Se trata, por tanto, de un modelo de gran escala que, en su forma original en precisión completa, resulta inviable para la mayoría de hardware de consumo, y de ahí el interés de estas cuantizaciones GGUF, que reducen el peso desde los 960,6 GB del repositorio hasta rangos de 51,8 GB (Q2_K) a 150,4 GB (Q8_0).

La ficha se centra en la versión GGUF, que es la publicada en este repositorio, e indica explícitamente los datos no disponibles en la información proporcionada (contexto, benchmarks, detalles de entrenamiento), ya que la model card del cuantizador es fundamentalmente logística y no reproduce la del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer; etiquetas del modelo: moe, mixture-of-experts, reasoning, adaptive-thinking |
| Parametros totales | 141.481.874.432 (según safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (cuantizaciones estáticas; no hay imatrix/weighted publicadas por el autor) |
| Idiomas soportados | pl (polaco), en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (modelo base en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture-of-experts según las etiquetas declaradas por el autor (moe, mixture-of-experts). No se dispone en la información proporcionada de detalles sobre el número de expertos, el ratio de activación, la longitud de contexto nativa, el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. La etiqueta "adaptive-thinking" sugiere la existencia de un modo de razonamiento configurable o con presupuesto de cómputo adaptativo, pero no se documenta su funcionamiento.

La aportación de este repositorio no es el entrenamiento, sino la cuantización: mradermacher ha generado cuantizaciones estáticas (convert_type hf, quantize_version 2, output_tensor_quantised 1) sin versiones ponderadas por imatrix, que el autor indica que probablemente no publicará salvo petición en la discusión comunitaria. Los archivos de mayor tamaño (Q5_K_M, Q6_K y Q8_0) están divididos en varias partes (3 o 4) que deben concatenarse antes de su uso.

## Capacidades

- Generación de texto conversacional en polaco e inglés, según los idiomas declarados.
- Razonamiento (etiqueta "reasoning" del modelo base).
- Modo de pensamiento adaptativo ("adaptive-thinking"), presumiblemente con control del esfuerzo de razonamiento; funcionamiento exacto no disponible.
- Arquitectura MoE, lo que en teoría permite mayor capacidad de parámetros con un coste de cómputo por token inferior al de un modelo denso equivalente; ratio de activación no disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (el repositorio no incluye proyector multimodal; el campo skip_mmproj está vacío).

## Casos de uso

- Razonamiento en polaco para entornos con requisitos de soberanía de datos: al ser un modelo con soporte nativo de polaco e inglés y licencia Apache 2.0, puede desplegarse en infraestructura propia para tareas de análisis, resumen o generación de documentación en polaco sin depender de APIs externas.
- Despliegue en servidores con GPU de gran memoria: las cuantizaciones Q4_K_M (85,8 GB) o Q5_K_S (97,5 GB) permiten ejecutar el modelo en nodos con varias GPU de 80 GB (por ejemplo, 2×A100/H100 para Q4_K_M), algo imposible con los pesos en fp16.
- Experimentación e investigación en local con hardware limitado: la cuantización Q2_K (51,8 GB) permite probar el modelo en una sola GPU de 80 GB o en configuraciones multi-GPU de consumo, a costa de degradar la calidad.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece una escalera completa de cuantizaciones (de Q2_K a Q8_0) que permite medir la degradación de calidad frente al tamaño, útil para decidir el punto de equilibrio en producción.
- Generación de código y texto técnico bilingüe (pl/en): el modelo puede integrarse en asistentes de documentación o revisión de código para equipos que trabajen en polaco e inglés; requiere validación humana por el riesgo de alucinación.
- Prototipado de pipelines de razonamiento con presupuesto adaptativo: la etiqueta "adaptive-thinking" sugiere que puede usarse para comparar coste/calidad en tareas de razonamiento multi-paso, aunque su API concreta no está documentada en este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de archivo GGUF, más overhead de contexto y caché KV):
  - Q2_K: ~51,8 GB de pesos.
  - Q3_K_S: ~61,2 GB; Q3_K_M: ~67,9 GB; Q3_K_L: ~73,4 GB.
  - IQ4_XS: ~76,4 GB; Q4_K_S: ~80,6 GB; Q4_K_M: ~85,8 GB.
  - Q5_K_S: ~97,5 GB; Q5_K_M: ~100,5 GB.
  - Q6_K: ~116,2 GB; Q8_0: ~150,4 GB.
- GPU recomendadas: para Q4_K_M o superiores, nodos multi-GPU con A100 80 GB o H100 80 GB (2 o más GPU según cuantización). Las cuantizaciones Q2_K y Q3_K_S podrían caber en una sola GPU de 80 GB, con margen ajustado para contexto.
- GPU de consumo: no cabe en ninguna GPU de consumo individual (RTX 4090 24 GB, RTX 5090 32 GB). Solo sería viable con reparto entre varias GPU de consumo y RAM del sistema (offloading), con rendimiento muy degradado.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; los archivos multiparte (Q5_K_M, Q6_K, Q8_0) deben concatenarse antes de cargarse.
- Latencia y throughput: no disponibles. Al ser un MoE, el throughput dependerá del número de parámetros activos, dato no publicado en esta información.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base (contexto, parámetros activos) que permitan una comparación rigurosa con alternativas de la misma categoría. La siguiente tabla recoge únicamente los datos verificables de este modelo frente a la información disponible de su modelo base.

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| lvetter-titanium-100b-GGUF (este) | 141,48 B | no disponible | Apache 2.0 | GGUF (11 cuantizaciones) | Hugging Face, 366 descargas |
| Lvetter/lvetter-titanium-100b (base) | 141,48 B | no disponible | Apache 2.0 | safetensors/transformers | Hugging Face |
| Alternativas de mismo tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card del cuantizador no reproduce la del modelo original: no hay información sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad. Es responsabilidad del usuario consultar la ficha del modelo base.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad en la información disponible.
- Cobertura lingüística limitada a polaco e inglés; el rendimiento en castellano no está garantizado ni documentado.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad de forma notable; el autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como opción rápida y Q6_K como muy buena calidad.
- No hay cuantizaciones ponderadas por imatrix publicadas; el autor indica que probablemente no las generará salvo petición, lo que limita la calidad potencial en tamaños pequeños frente a otras alternativas.
- Los archivos Q5_K_M, Q6_K y Q8_0 están divididos en partes que deben concatenarse correctamente; un manejo incorrecto produce archivos corruptos.
- Licencia Apache 2.0 permite uso comercial, pero al tratarse de una cuantización de un modelo de terceros conviene verificar los términos del modelo base y las obligaciones de atribución.
- El repositorio ocupa 960,6 GB y tiene solo 366 descargas: la comunidad de validación es muy reducida, por lo que no hay retroalimentación independiente sobre su comportamiento en producción.
- No se documenta soporte de tool calling ni de agentes; no asumir su disponibilidad sin verificar contra el modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/lvetter-titanium-100b-GGUF
- Modelo base: https://huggingface.co/Lvetter/lvetter-titanium-100b
- Página de descargas del cuantizador: https://hf.tst.eu/model#lvetter-titanium-100b-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
