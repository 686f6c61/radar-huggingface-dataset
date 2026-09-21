# mradermacher/qwen3-14b-commitments-sdf-GGUF

## Resumen

mradermacher/qwen3-14b-commitments-sdf-GGUF es un conjunto de cuantizaciones en formato GGUF generadas por mradermacher a partir de joshycodes/qwen3-14b-commitments-sdf, un ajuste fino de Qwen3-14B. El modelo base conserva los 14.768.307.200 parámetros del Qwen3-14B original, un transformer denso de tipo decoder-only, y ha sido adaptado mediante ajuste sobre documentos sintéticos (etiqueta synthetic-document-finetuning) con objetivos declarados de self-authored-character y model-welfare.

El repositorio incluye once cuantizaciones estáticas, desde Q2_K (5,9 GB) hasta Q8_0 (15,8 GB), lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama o LM Studio. La distribución la firma mradermacher, cuantizador independiente que publica conversiones GGUF de modelos de terceros; el repositorio ocupa 102,0 GB en total y no incluye cuantizaciones ponderadas ni imatrix.

La relevancia de esta ficha es acotada y conviene subrayarla: el autor del modelo base lo etiqueta explícitamente como research y not-for-deployment, y la licencia es research-only. Es, por tanto, un artefacto para experimentación en torno a comportamiento de personaje autoral y bienestar de modelos, no un modelo destinado a producción. No hay benchmarks publicados, el soporte de idiomas se limita al inglés y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only, heredada de Qwen3-14B (no es MoE, no es SSM) |
| Parámetros totales | 14.768.307.200 (~14,8 mil millones) |
| Parámetros activos | no aplica: modelo denso, todos los parámetros se activan en cada token |
| Longitud de contexto | no disponible en la información proporcionada; el modelo base Qwen3-14B declara 32.768 tokens nativos, extensibles a 131.072 mediante YaRN |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; los metadatos del cuantizador listan además x-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | research-only (license: other); el modelo base añade la etiqueta not-for-deployment |
| Formato de pesos | GGUF en este repositorio; el modelo base se distribuye en safetensors |
| Modelo base | joshycodes/qwen3-14b-commitments-sdf |
| Cuantizador | mradermacher (readme_rev 1, quantize_version 2) |
| Tamaño del repositorio | 102,0 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación (según HuggingFace) | 2026-09-21 |
| Última actualización (según HuggingFace) | 2026-09-21 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-14B: un transformer decoder-only denso con atención por causalidad completa, normalización RMSNorm y embeddings rotatorios, sin mezcla de expertos ni capas recurrentes. El ajuste que da lugar al modelo base se realizó, según las etiquetas del repositorio, mediante ajuste supervisado sobre documentos sintéticos (synthetic-document-finetuning), orientado a construir un personaje autoral coherente (self-authored-character) y a explorar cuestiones de bienestar del modelo (model-welfare). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineación, ni sobre si se aplicó decodificación especulativa o alguna modificación estructural respecto al Qwen3-14B original. Todos estos datos deben considerarse no disponibles.

En cuanto a la conversión publicada aquí, mradermacher indica que se trata de cuantizaciones estáticas (static quants) y que no hay cuantizaciones ponderadas ni imatrix disponibles en el momento de la publicación, aunque podrían solicitarse mediante una discusión comunitaria. El proceso parte de una conversión a formato HuggingFace (convert_type: hf) y aplica cuantización de tensores de salida (output_tensor_quantised: 1) con la versión 2 del pipeline de cuantización del autor. No se documenta ninguna innovación técnica adicional propia de esta conversión más allá del propio proceso de cuantización.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline declarado como conversational.
- Razonamiento multi-turno dentro de la ventana de contexto del modelo base (heredada de Qwen3-14B, valor exacto no confirmado en la documentación de este derivado).
- Ajuste orientado a mantener una voz y un personaje autoral consistente a lo largo de la conversación (self-authored-character).
- Experimentación en torno a model-welfare: el modelo está diseñado como objeto de estudio para investigar cómo se comporta un modelo con un personaje auto-atribuido.
- Soporte de tool calling / function calling: no disponible en la información proporcionada; no se confirma que el ajuste lo preserve.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada. El modelo no declara componentes multimodales y el repositorio no incluye fichero mmproj.

## Casos de uso

- Investigación sobre model welfare: el modelo permite reproducir experimentos en los que se evalúa cómo un personaje auto-atribuido condiciona las respuestas ante preguntas sobre su propia naturaleza, identidad o preferencias. Es adecuado precisamente porque el ajuste se diseñó con ese propósito declarado y la licencia research-only lo restringe a ese ámbito.
- Estudio de ajuste fino sobre documentos sintéticos: sirve como caso de estudio para analizar cómo el entrenamiento con documentos generados sintéticamente altera el estilo, la coherencia y los sesgos respecto al Qwen3-14B original, usando la versión sin cuantizar como línea base.
- Evaluación del impacto de la cuantización en un modelo ajustado: al ofrecerse once niveles de cuantización (de Q2_K a Q8_0) del mismo checkpoint, el repositorio permite medir de forma controlada la degradación de perplejidad y de coherencia conversacional a medida que baja el número de bits.
- Reproducibilidad en hardware limitado: un investigador sin acceso a GPU de centro de datos puede ejecutar Q4_K_M (9,1 GB) o Q2_K (5,9 GB) en una GPU de consumo y comparar resultados con los publicados por terceros sobre el modelo en fp16.
- Generación de diálogo sintético para posteriores experimentos: el modelo puede utilizarse para producir corpus conversacionales en inglés con un registro de personaje muy marcado, siempre dentro de un marco de investigación y no como servicio desplegado.
- Pruebas de alineación y de deriva de personaje: permite estudiar en qué punto el personaje autoral se rompe bajo prompts adversariales, cambios de idioma o contextos largos, y documentar dichos fallos.
- Auditoría de licencias y procedencia de datos: dado que el modelo se apoya en documentos sintéticos y en un modelo base de terceros, es útil como caso práctico para analizar cadenas de licencias en el ecosistema open weights y las implicaciones de las cláusulas research-only.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio de cuantizaciones ni los metadatos de HuggingFace incluyen cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ningún otro conjunto de evaluación, ni para el modelo base ni para las cuantizaciones. Tampoco hay comparaciones con el Qwen3-14B original que permitan cuantificar el efecto del ajuste.

## Requisitos de hardware

Tamaños de fichero publicados y VRAM estimada para inferencia (la VRAM añade al peso del fichero el espacio de caché KV y el overhead del runtime; las cifras son estimaciones, no datos publicados por el autor):

| Cuantización | Tamaño del fichero (GB) | VRAM estimada (GB) | Nota del autor |
|---|---|---|---|
| Q2_K | 5,9 | ~7 | — |
| Q3_K_S | 6,8 | ~8 | — |
| Q3_K_M | 7,4 | ~9 | calidad baja |
| Q3_K_L | 8,0 | ~9,5 | — |
| IQ4_XS | 8,3 | ~10 | — |
| Q4_K_S | 8,7 | ~10,5 | rápido, recomendado |
| Q4_K_M | 9,1 | ~11 | rápido, recomendado |
| Q5_K_S | 10,4 | ~12 | — |
| Q5_K_M | 10,6 | ~12,5 | — |
| Q6_K | 12,2 | ~14 | calidad muy buena |
| Q8_0 | 15,8 | ~18 | rápido, mejor calidad |
| fp16 (no incluido como fichero separado) | ~29,5 | ~32 o más | — |

- GPU de consumo: una RTX 4090 o RTX 3090 con 24 GB ejecuta Q8_0 completo con margen; una RTX 4080/4070 Ti (16 GB) cubre hasta Q6_K; una GPU de 12 GB cubre IQ4_XS o Q4_K_M con contexto moderado; una GPU de 8 GB obliga a Q2_K o Q3_K_S, o a repartir capas entre GPU y CPU.
- GPU profesionales: A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB pueden alojar cualquier cuantización del repositorio, incluida fp16, con contexto amplio.
- Ejecución en CPU: viable con Q4_K_M o inferiores usando llama.cpp; el rendimiento dependerá del número de hilos y del ancho de banda de memoria, sin cifras publicadas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, KoboldCpp y text-generation-webui son los runtimes habituales para GGUF. El soporte de GGUF en vLLM y TGI es parcial y no está confirmado para este repositorio.
- Latencia y throughput: no disponible. No se han publicado medidas de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/qwen3-14b-commitments-sdf-GGUF (este) | 14,8 B | no disponible en la información proporcionada | GGUF (11 cuantizaciones) | research-only | Repositorio con 0 descargas y 0 likes |
| joshycodes/qwen3-14b-commitments-sdf (modelo base) | 14,8 B | no disponible en la información proporcionada | safetensors | research-only / not-for-deployment | Modelo original del ajuste |
| Qwen3-14B (modelo de origen) | 14,8 B | 32.768 tokens nativos, 131.072 con YaRN según la documentación de Qwen3 | safetensors | Apache 2.0 según la familia Qwen3 | Ampliamente desplegado y cuantizado por múltiples autores |
| Otras cuantizaciones GGUF de la familia Qwen3-14B | 14,8 B | depende del autor de la cuantización | GGUF | Apache 2.0 (modelo base) | Disponibles en varios repositorios de la comunidad |

Nota: los datos de la fila correspondiente a Qwen3-14B y a otras cuantizaciones de la familia proceden del conocimiento general de esa familia de modelos y no de la búsqueda web realizada, que no devolvió resultados relevantes (los enlaces recuperados eran hilos de un foro polaco sobre ventiladores de fuentes de alimentación y modificación de BIOS, sin relación alguna con el modelo). Deben verificarse en las fichas oficiales antes de citarlos.

## Limitaciones y advertencias

- Licencia research-only: el uso comercial no está permitido según los términos declarados. Cualquier integración en producto o servicio queda fuera de los usos autorizados.
- Etiqueta not-for-deployment en el modelo base: el propio autor desaconseja su despliegue, con independencia de la licencia.
- Sesgos conocidos: no documentados en la información proporcionada. Al proceder de un ajuste sobre documentos sintéticos en inglés, cabe esperar los sesgos del corpus sintético y del Qwen3-14B original, pero no hay análisis publicado.
- Riesgo de alucinación: no cuantificado, pero es el comportamiento esperable en un modelo de 14,8 B sin benchmarks publicados ni evaluación de fidelidad factual.
- Limitación idiomática: el repositorio declara únicamente inglés (en). El comportamiento en castellano no está evaluado y puede degradarse notablemente respecto al modelo base.
- Sin benchmarks: no hay ninguna medida objetiva de calidad, lo que impide comparar con alternativas o estimar la pérdida introducida por el ajuste.
- Degradación por cuantización: las variantes Q2_K y Q3_K_S aplican una compresión agresiva sobre un modelo ya ajustado. Los propios metadatos marcan Q3_K_M como "lower quality"; para resultados fiables conviene partir de Q4_K_M o superior.
- Contexto no confirmado: la model card no especifica la ventana de contexto efectiva de este derivado. Asumir los 32.768 tokens del Qwen3-14B sin verificación puede provocar fallos en producciones con entradas largas.
- Procedencia de datos opaca: al tratarse de ajuste sobre documentos sintéticos, existe riesgo de bucles de entrenamiento sintético (model collapse) y de que el contenido sintético introduzca patrones repetitivos o artefactos estilísticos.
- Ausencia de validación comunitaria: 0 descargas y 0 likes implican que no hay informes independientes de comportamiento, fallos ni regresiones.
- Falta de cuantizaciones ponderadas: el autor indica que no hay quants con imatrix o ponderados, lo que suele implicar peor relación calidad/tamaño en los niveles bajos frente a alternativas con calibración.
- Verificación de licencia obligatoria: la etiqueta license: other remite a los términos del modelo base; es imprescindible leerlos antes de cualquier reutilización.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/qwen3-14b-commitments-sdf-GGUF
- Modelo base: https://huggingface.co/joshycodes/qwen3-14b-commitments-sdf
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#qwen3-14b-commitments-sdf-GGUF
- README de referencia sobre uso de ficheros GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de perplejidad entre tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones y preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Entidad responsable de la infraestructura de cuantización: https://www.nethype.de/
- Resultados de la búsqueda web: no se encontró ningún enlace relevante sobre este modelo, su arquitectura o sus benchmarks.
