# mradermacher/DiscoveryRSI-27B-i1-GGUF

## Resumen

DiscoveryRSI-27B-i1-GGUF es la versión cuantizada en formato GGUF del modelo Gen-Verse/DiscoveryRSI-27B, un modelo de 27.320.697.856 parámetros (27,3 B) orientado, según los metadatos del autor, a la investigación científica, la generación de hipótesis y el razonamiento como agente de investigación, con especial atención al ámbito biomédico. La cuantización la firma mradermacher, un publicador habitual de cuantizaciones GGUF, que en este repositorio aplica el esquema i1 (con importance matrix) para producir ficheros utilizables con llama.cpp y herramientas derivadas.

El interés práctico del repositorio es que permite ejecutar un modelo de 27,3 B en hardware de consumo: los dos cuantos publicados en la tabla de la model card ocupan 11,0 GB (i1-Q2_K) y 12,9 GB (i1-IQ3_M), frente a los aproximadamente 54,6 GB que requeriría el modelo en FP16. A cambio, se trata de cuantizaciones de baja precisión, y el repositorio no incluye Q4, Q5, Q6 ni Q8 (el autor remite a un repositorio estático separado para el resto de variantes).

La información disponible es escasa: no se documentan arquitectura, ventana de contexto, composición del dataset ni resultados de benchmarks, y el repositorio no tiene descargas ni valoraciones. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (no se especifica en la información; el modelo base es Gen-Verse/DiscoveryRSI-27B) |
| Parámetros totales | 27.320.697.856 (27,3 B) |
| Parámetros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF i1 (imatrix). Publicados en la tabla del repositorio: i1-Q2_K e i1-IQ3_M. El autor lista además: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q2_K_S, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors para transformers) |
| Tamaño del repositorio | 23,7 GB |
| Fichero imatrix | DiscoveryRSI-27B.imatrix.gguf (0,1 GB), para generar cuantizaciones propias |
| Descargas / valoraciones | 0 / 0 |
| Fecha de creación | 2026-10-20 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Gen-Verse/DiscoveryRSI-27B: la model card del repositorio cuantizado no indica si se trata de un transformer decoder-only denso, de una variante MoE o de otra topología. El recuento de parámetros (27,3 B) es coherente con un modelo denso de esa escala, pero no se confirma en la documentación. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otro tipo de ajuste por preferencias. Los tags del repositorio apuntan a un ajuste por instrucciones (instruction-tuning) especializado en investigación científica, agentes de investigación, investigación biomédica y generación de hipótesis.

La contribución técnica del repositorio es la cuantización: mradermacher genera cuantos i1 con importance matrix (imatrix), un esquema en el que se calcula una matriz de importancia por tensor a partir de datos de calibración para reducir el error de cuantización en las capas más sensibles. El autor publica el fichero imatrix junto a los cuantos, de modo que un tercero puede generar sus propias variantes. La model card incluye además una nota genérica que describe el modelo como «vision model» y remite a posibles ficheros mmproj en el repositorio estático; no se aporta ningún mmproj ni se confirma capacidad multimodal.

## Capacidades

- Generación de texto conversacional en inglés, con ajuste por instrucciones según los tags del repositorio.
- Razonamiento orientado a investigación científica: formulación de hipótesis, planteamiento de preguntas de investigación y propuesta de líneas experimentales (según los tags scientific-research y hypothesis-generation).
- Soporte declarado como agente de investigación (research-agent), lo que sugiere uso en flujos de trabajo multi-paso, aunque no se documenta el soporte concreto de tool calling ni de function calling.
- Especialización declarada en investigación biomédica (biomedical-research).
- Uso conversacional multi-turno, indicado por el tag conversational.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Capacidad multimodal: no confirmada; no se incluye mmproj en este repositorio.
- Modo de razonamiento explícito (thinking mode): no disponible en la información.

## Casos de uso

- Generación de hipótesis en investigación biomédica: el modelo puede proponer mecanismos plausibles, variables a medir y controles experimentales a partir de un resumen de literatura, actuando como borrador inicial que el investigador revisa y descarta.
- Revisión de literatura asistida: extracción y síntesis de hallazgos de abstracts y artículos en inglés, con salida estructurada por pregunta de investigación, aprovechando el ajuste declarado en dominio científico.
- Diseño de protocolos experimentales: borradores de protocolo con secciones de objetivos, hipótesis, tamaño de muestra y análisis estadístico previsto, sujetos a validación posterior por el equipo.
- Agente de razonamiento en pipelines de descubrimiento: integrado en un flujo con recuperación (RAG) sobre un corpus propio, donde el modelo encadena varias consultas y sintetiza la evidencia recuperada antes de proponer el siguiente paso.
- Asistente de documentación de laboratorio: redacción y normalización de notas de experimentos en inglés a partir de registros dispersos, manteniendo terminología consistente.
- Exploración de ideas en entornos con recursos limitados: al caber en 11-13 GB de VRAM en las cuantizaciones publicadas, permite desplegar un modelo de 27,3 B en una estación de trabajo con una única GPU de consumo para prototipado sin conexión.
- Evaluación comparativa de cuantizaciones: el fichero imatrix publicado permite generar variantes propias y medir la degradación de calidad en tareas de razonamiento científico, un caso de uso metodológico más que de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio cuantizado no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto, y la información proporcionada no contiene datos del modelo base. El autor sí enlaza un gráfico comparativo genérico de perplejidad entre tipos de cuantización (ver sección de enlaces), pero no ofrece mediciones propias sobre este modelo.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento de parámetros (27,3 B); no son datos publicados por el autor.

- Peso en FP16: aproximadamente 54,6 GB solo de pesos, más caché KV y overhead.
- i1-Q2_K (11,0 GB, dato del repositorio): cabe en GPU de 12 GB (RTX 3060 12 GB, RTX 4070) con contexto corto; recomendable 16 GB para margen. Es el cuanto de menor calidad de la tabla.
- i1-IQ3_M (12,9 GB, dato del repositorio): encaja en 16 GB (RTX 4060 Ti 16 GB, RTX 4080) y con holgura en 24 GB (RTX 3090, RTX 4090), donde admite contextos más largos.
- Q4_K_M estimado (~16,5 GB): requiere 24 GB o reparto CPU/GPU.
- Q5_K_M estimado (~19 GB): 24 GB muy ajustado; mejor 32 GB (A6000, 2× RTX 4090).
- Q6_K estimado (~22,5 GB): 32-48 GB recomendable.
- Q8_0 estimado (~29 GB): A100 40 GB, A6000 48 GB.
- FP16: A100 80 GB, H100 80 GB o 2× A100 40 GB.
- Despliegue: llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python, servidores compatibles con la API de OpenAI) son la vía natural para estos ficheros GGUF. vLLM y TGI no están indicados para GGUF i1 en esta configuración; para ellos habría que partir del modelo base en safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No se dispone de información verificable sobre modelos alternativos de la misma categoría (agentes de investigación científica de ~27 B) en el material proporcionado, por lo que la comparación con terceros se marca como no disponible. La comparación posible es interna, entre el modelo base y sus cuantizaciones:

| Variante | Parámetros | Formato / tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gen-Verse/DiscoveryRSI-27B | 27,3 B | Safetensors (FP16/BF16, ~54,6 GB estimados) | No disponible | Apache 2.0 | Repositorio del modelo base |
| mradermacher/DiscoveryRSI-27B-i1-GGUF (i1-Q2_K) | 27,3 B | GGUF, 11,0 GB | No disponible | Apache 2.0 | Publicado |
| mradermacher/DiscoveryRSI-27B-i1-GGUF (i1-IQ3_M) | 27,3 B | GGUF, 12,9 GB | No disponible | Apache 2.0 | Publicado |
| mradermacher/DiscoveryRSI-27B-GGUF (estático) | 27,3 B | GGUF, varios tamaños | No disponible | Apache 2.0 | Repositorio separado, no detallado |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un modelo ajustado para investigación biomédica en inglés, es previsible un sesgo hacia literatura y terminología anglosajona, pero no hay evaluación publicada.
- Riesgo de alucinación: alto en el dominio objetivo. Las hipótesis y referencias generadas no constituyen evidencia y deben verificarse contra fuentes primarias; el modelo no está validado para uso clínico ni para decisiones diagnósticas o terapéuticas.
- Idioma: solo se declara inglés. El rendimiento en castellano no está garantizado ni evaluado.
- Contexto: se desconoce la longitud de ventana, lo que impide planificar tareas de contexto largo (por ejemplo, artículos completos) sin pruebas previas.
- Calidad de cuantización: los dos cuantos publicados en la tabla son de baja precisión (Q2_K e IQ3_M). Para uso en producción conviene recurrir a Q4_K_M o superiores del repositorio estático, o al modelo base en FP16. No hay métricas de degradación publicadas para este modelo concreto.
- Ausencia de benchmarks: sin datos de evaluación no es posible comparar su capacidad real frente a alternativas, ni verificar las capacidades que sugieren los tags.
- Multimodalidad: la nota sobre «vision model» de la model card es genérica y no va acompañada de ficheros mmproj en este repositorio; no debe asumirse soporte de imagen.
- Validación comunitaria nula: 0 descargas y 0 valoraciones en el momento de la ficha.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero no exime de responsabilidad sobre las salidas; conviene conservar los avisos de licencia del modelo base.
- Trazabilidad: la información sobre el proceso de entrenamiento del modelo base no está disponible en este repositorio, lo que dificulta evaluar riesgos de contaminación de datos o de ajuste excesivo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/DiscoveryRSI-27B-i1-GGUF
- Modelo base: https://huggingface.co/Gen-Verse/DiscoveryRSI-27B
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/DiscoveryRSI-27B-GGUF
- Página de descarga consolidada del cuantizador: https://hf.tst.eu/model#DiscoveryRSI-27B-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/DiscoveryRSI-27B-i1-GGUF/resolve/main/DiscoveryRSI-27B.imatrix.gguf
- Cuanto i1-Q2_K: https://huggingface.co/mradermacher/DiscoveryRSI-27B-i1-GGUF/resolve/main/DiscoveryRSI-27B.i1-Q2_K.gguf
- Cuanto i1-IQ3_M: https://huggingface.co/mradermacher/DiscoveryRSI-27B-i1-GGUF/resolve/main/DiscoveryRSI-27B.i1-IQ3_M.gguf
- Peticiones de cuantización y FAQ del autor: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- nethype GmbH (infraestructura del cuantizador): https://www.nethype.de/

Nota: la búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo (solo contenido no relacionado); no se han encontrado papers, blogs técnicos ni demos adicionales.
