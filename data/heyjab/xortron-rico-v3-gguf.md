# Heyjab/XORTRON-RICO-v3-GGUF

## Resumen

XORTRON-RICO-v3-GGUF es una cuantización en formato GGUF de XORTRON-RICO-v3, un modelo de 27.320.697.856 parámetros (27,3 mil millones) publicado por el usuario Heyjab. El modelo procede de una fusión de pesos (merge) realizada con MergeKit sobre dos modelos de la serie RICO de darkc0de, que a su vez derivan de la línea Qwen3.8-27B, según los nombres de los modelos base declarados. El repositorio ocupa 209,2 GB, lo que indica que contiene varias cuantizaciones del mismo modelo.

El interés técnico del modelo es acotado y de naturaleza muy específica: no se trata de un modelo de propósito general orientado a producción, sino de un artefacto experimental asociado al proyecto «XORTRON Criminal Computing», cuya finalidad declarada es estudiar la capacidad de los sistemas de IA para facilitar conductas de riesgo, incluida actividad delictiva. Los tags del repositorio incluyen `uncensored`, `abliterated`, `heretic`, `harmful`, `toxic` y `not-for-all-audiences`, lo que sitúa al modelo en la categoría de los modelos sin alineación de rechazo, pensados para investigación en seguridad y red teaming.

No se dispone de información sobre datos de entrenamiento, longitud de contexto, licencia, idiomas soportados ni resultados de benchmarks. La model card incluye un acuerdo de acceso restringido y uso autorizado que limita explícitamente el uso a perfiles profesionales, académicos, legales, gubernamentales o de seguridad defensiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los modelos base declarados pertenecen a la línea Qwen3.8-27B; no se documenta el tipo de transformer ni si es denso o MoE) |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; el tag `imatrix` indica cuantización con matriz de importancia. El desglose exacto de niveles (Q2_K, Q4_K_M, Q8_0, etc.) no está disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un acuerdo de acceso restringido y uso autorizado, no una licencia estándar) |
| Formato de pesos | GGUF en este repositorio; bfloat16 en el merge original de origen |
| Método de fusión | linear (MergeKit), pesos 0,5000 / 0,5000 entre `darkc0de/RICO` y `darkc0de/RICO-v2` |
| Fuente de tokenizer y processor | `darkc0de/RICO-v2` |
| Modelos base declarados | `darkc0de/XORTRON-RICO-v3`, `darkc0de/RICO`, `darkc0de/RICO-v2`, `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, `orcarouter/Qwen3.8-27B-Uncensored` |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadatos) | 2026-09-22 |

## Arquitectura y entrenamiento

La información disponible describe únicamente el procedimiento de fusión, no el entrenamiento. Según la model card, el merge se realizó con la API de fusión de tensores de MergeKit, shard por shard, con método `linear`, peso 0,5000 para `darkc0de/RICO` y 0,5000 para `darkc0de/RICO-v2`, dtype de salida bfloat16 y metadatos, tokenizer y processor tomados de `darkc0de/RICO-v2`. El repositorio que nos ocupa añade una capa más de procesamiento: la conversión a GGUF y su cuantización, presumiblemente con matriz de importancia (tag `imatrix`), aunque el procedimiento exacto no está documentado.

No hay ningún dato sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF, DPO u otras técnicas de alineación, ni sobre innovaciones arquitectónicas. Los tags `abliterated`, `heretic` y `uncensored` sugieren que en algún punto de la cadena de derivación se aplicó alguna técnica de reducción o eliminación de la dirección de rechazo (abliteration), pero el autor no documenta el método, los datos ni las métricas de dicho proceso. Al tratarse de una fusión lineal de dos checkpoints y de una cuantización posterior, la calidad resultante es difícil de predecir sin evaluaciones empíricas.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y la orientación del repositorio indican uso como modelo de chat de un solo turno o multi-turno.
- Generación sin filtros de rechazo: los tags `uncensored`, `abliterated`, `heretic`, `harmful` y `toxic` describen un modelo que, por diseño, no incorpora las salvaguardas habituales de rechazo.
- Inferencia local en formato GGUF: compatible con el ecosistema llama.cpp y derivados.
- Cuantización con matriz de importancia: el tag `imatrix` indica que las cuantizaciones se generaron optimizando la preservación de activaciones relevantes.
- Compatibilidad con text-generation-inference: el tag `text-generation-inference` aparece en los metadatos del repositorio.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (no se declara ningún idioma).
- Visión, audio o modo de razonamiento explícito: no disponible (no documentado).

## Casos de uso

- Red teaming y evaluación de seguridad: el modelo puede emplearse como sujeto de prueba para medir la eficacia de clasificadores de contenido dañino, ya que su falta de alineación de rechazo permite generar respuestas que un modelo convencional bloquearía, y así calibrar filtros de entrada y salida.
- Investigación en alineación y abliteration: dado que la cadena de derivación incluye variantes `heretic` y `abliterated`, resulta útil para estudiar cómo la eliminación de la dirección de rechazo afecta a la utilidad, la coherencia y la tasa de cumplimiento en tareas benignas.
- Generación de datos adversarios para entrenamiento de moderadores: permite producir ejemplos etiquetados de contenido tóxico o potencialmente delictivo en un entorno controlado, para alimentar clasificadores de seguridad y sistemas de detección.
- Threat modeling de IA: equipos de seguridad pueden analizar qué tipo de asistencia operativa puede llegar a prestar un modelo de 27B sin restricciones, con el fin de documentar vectores de abuso y diseñar mitigaciones.
- Análisis forense y jurídico: perfiles legales y de aplicación de la ley pueden examinar el comportamiento del modelo como evidencia del estado actual de la tecnología, según contempla el propio acuerdo de uso del repositorio.
- Evaluación comparativa de cuantizaciones: investigadores pueden medir la degradación de calidad entre los distintos niveles GGUF incluidos en el repositorio (209,2 GB en total) frente al checkpoint en bfloat16, un caso de estudio útil sobre cuantización con imatrix en modelos de 27B.
- Despliegue local aislado para experimentación: mediante llama.cpp u Ollama en una máquina sin conexión, para pruebas reproducibles sin exponer el modelo a través de APIs públicas.
- Desarrollo de políticas y regulación: análisis empírico del riesgo derivado de la publicación abierta de pesos sin alineación, como material de apoyo para marcos regulatorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, y la búsqueda web realizada no ha devuelto documentación técnica relevante sobre el modelo (los resultados obtenidos versaban sobre compactación de suelos y no guardan relación con el objeto de esta ficha).

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento de parámetros (27,3 mil millones) y no proceden de mediciones publicadas por el autor:

- VRAM para los pesos, según cuantización (estimación, sin contar caché KV ni overhead):
  - BF16 / FP16: en torno a 54,6 GB.
  - Q8_0: en torno a 29 GB.
  - Q6_K: en torno a 22,5 GB.
  - Q5_K_M: en torno a 19,5 GB.
  - Q4_K_M: en torno a 16,5 GB.
  - Q3_K_M: en torno a 13,5 GB.
  - Q2_K: en torno a 10,5 GB (con degradación de calidad apreciable).
- Caché KV y overhead adicionales: entre 2 y 8 GB según la longitud de contexto configurada; se desconoce la longitud máxima soportada.
- GPU de centro de datos: A100 80 GB y H100 80 GB permiten ejecutar el modelo en BF16 o en cuantizaciones altas con contexto amplio. Una A100 40 GB admite Q8_0 ajustado y Q6_K con holgura.
- GPU de consumo: una RTX 4090 o RTX 3090 con 24 GB pueden ejecutar Q4_K_M con offload parcial de capas a CPU, a costa de latencia. Una RTX 5090 con 32 GB ejecutaría Q5_K_M o Q6_K con mayor comodidad. Con 16 GB (RTX 4080, 4070 Ti Super) solo son viables Q3_K_M o Q2_K con offload parcial.
- Configuraciones multi-GPU: dos GPU de 24 GB permiten Q8_0 o Q6_K repartido, con tensor parallelism o layer splitting.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; vLLM y TGI son compatibles con el modelo base en safetensors, pero no con el formato GGUF de este repositorio, salvo conversión previa.
- Latencia y throughput: no disponibles (no hay mediciones publicadas).

## Comparativa con modelos similares

No hay datos de rendimiento ni de configuración de los modelos comparables, por lo que la comparación se limita a lo que figura en los metadatos.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Heyjab/XORTRON-RICO-v3-GGUF | 27,3 mil millones | no disponible | no disponible (acuerdo de uso restringido) | GGUF | Cuantización del merge; 0 descargas |
| darkc0de/XORTRON-RICO-v3 | no disponible | no disponible | no disponible | no disponible | Modelo base directo del repositorio |
| darkc0de/RICO y RICO-v2 | no disponible | no disponible | no disponible | no disponible | Componentes de la fusión lineal 50/50 |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | no disponible | no disponible | no disponible | no disponible | Modelo base declarado, con etiquetas de contenido sin censura |
| orcarouter/Qwen3.8-27B-Uncensored | no disponible | no disponible | no disponible | no disponible | Modelo base declarado |

No se dispone de información suficiente sobre modelos alternativos de la misma categoría (27B sin alineación de rechazo) para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Modelo sin alineación de rechazo: los tags `uncensored`, `abliterated`, `heretic`, `harmful` y `toxic` indican que el modelo no incorpora salvaguardas y puede generar contenido dañino, ofensivo o ilegal. No es apto para uso público sin supervisión.
- Uso restringido por acuerdo: la model card establece un acuerdo de acceso y uso autorizado que circunscribe el acceso a perfiles profesionales, académicos, legales, gubernamentales o de seguridad. El uso para facilitar actividad delictiva queda explícitamente prohibido.
- Licencia no declarada: los metadatos de HuggingFace no indican licencia, mientras que la model card impone un acuerdo de uso. Esta discrepancia genera incertidumbre jurídica sobre la redistribución, la modificación y el uso comercial, que debe resolverse antes de cualquier despliegue.
- Riesgo de alucinación: no hay evaluaciones publicadas. Al tratarse de una fusión lineal de dos checkpoints y de una cuantización posterior, la degradación de coherencia y factualidad es plausible, especialmente en cuantizaciones bajas.
- Ausencia de datos de entrenamiento: se desconoce el corpus, el número de tokens y los métodos de alineación aplicados en la cadena de derivación, lo que impide anticipar sesgos específicos o limitaciones idiomáticas.
- Idiomas no declarados: no se especifica ningún idioma soportado. El comportamiento multilingüe es indeterminado y debe verificarse empíricamente antes de usarlo en producción.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con requisitos de contexto largo sin una medición previa.
- Ausencia de benchmarks: no hay métricas de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, por lo que no es posible comparar su rendimiento con alternativas.
- Proyecto experimental y sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad y de informes de terceros.
- Anomalía en los metadatos: las fechas de creación y actualización (2026-09-22) no coinciden con el momento de la consulta, lo que conviene verificar antes de citar el repositorio.
- Cadena de dependencias frágil: el modelo es una cuantización de una fusión de modelos ya fusionados. Un error en cualquier eslabón se propaga sin posibilidad de trazabilidad completa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Heyjab/XORTRON-RICO-v3-GGUF
- Modelo base: https://huggingface.co/darkc0de/XORTRON-RICO-v3
- Componente de la fusión: https://huggingface.co/darkc0de/RICO
- Componente de la fusión: https://huggingface.co/darkc0de/RICO-v2
- Modelo base declarado: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Modelo base declarado: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Referencia citada en la model card (Trend Micro, Malicious Uses and Abuses of Artificial Intelligence): https://documents.trendmicro.com/assets/white_papers/wp-malicious-uses-and-abuses-of-artificial-intelligence.pdf
- Referencia citada en la model card (TRM Labs, The Rise of AI-Enabled Crime): https://www.trmlabs.com/resources/blog/the-rise-of-ai-enabled-crime-exploring-the-evolution-risks-and-responses-to-ai-powered-criminal-enterprises
- Referencia citada en la model card (American Military University, AI-Enabled Crime): https://www.amu.apus.edu/area-of-study/criminal-justice/resources/ai-enabled-crime/
- Referencia citada en la model card (Congreso de EE. UU., 119th Congress Hearing Record): https://www.congress.gov/119/chrg/CHRG-119hhrg61182/CHRG-119hhrg61182.pdf
- Búsqueda web sobre el modelo: sin resultados relevantes. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo.
