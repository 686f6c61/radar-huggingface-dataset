# mradermacher/Rhea-4B-fast-0409-high-GGUF

## Resumen

Rhea-4B-fast-0409-high-GGUF es un repositorio de cuantizaciones en formato GGUF publicado por mradermacher sobre el modelo base roskosmos19/Rhea-4B-fast-0409-high, un modelo denso de 4.022.468.096 parámetros (aproximadamente 4B) orientado a código, agentes y razonamiento explícito. La model card del repositorio indica que se trata de cuantizaciones estáticas generadas con llama.cpp a partir de los pesos originales en safetensors, con licencia Apache-2.0 y soporte exclusivo del idioma inglés.

El interés práctico del repositorio no está en el modelo en sí, que ya existe en su versión original, sino en el conjunto de variantes de cuantización que ofrece: desde Q2_K (1,8 GB) hasta f16 (8,2 GB), pasando por las recomendadas Q4_K_M (2,6 GB) y Q8_0 (4,4 GB). Esto permite desplegar un modelo de 4B con etiquetas de código, agente, thinking y agentic en hardware de consumo, algo relevante para flujos de trabajo locales de generación de código y automatización de tareas multi-paso.

Las etiquetas del repositorio incluyen "qwen3", lo que sugiere que la arquitectura subyacente pertenece o deriva de la familia Qwen3, aunque la información proporcionada no documenta explícitamente la arquitectura, la longitud de contexto efectiva ni los datos de entrenamiento más allá del dataset Rhea-Coding. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que se trata de una publicación sin validación comunitaria observable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta "qwen3" sugiere un transformer decoder-only de la familia Qwen3; no confirmado en la informacion proporcionada) |
| Parametros totales | 4.022.468.096 (dato real procedente de safetensors) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (cuantizaciones estaticas; variantes con imatrix en repositorio aparte) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

La información proporcionada no documenta la arquitectura interna del modelo base. Los metadatos del repositorio cuantizado incluyen la etiqueta "qwen3", lo que apunta a una arquitectura transformer decoder-only con atención por grupos (GQA) y tokenizador de la familia Qwen3, pero no se dispone de confirmación explícita, número de capas, dimensión oculta, número de cabezas de atención ni ventana de contexto nativa. Tampoco se documenta si se aplicaron fases de RLHF, DPO u otro tipo de ajuste por preferencias.

El proceso de cuantización sí está descrito: mradermacher ha generado cuantizaciones estáticas con llama.cpp (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) a partir del modelo roskosmos19/Rhea-4B-fast-0409-high. El ajuste fino del modelo base se realizó, según los metadatos, sobre el dataset roskosmos19/Rhea-Coding, cuyos detalles de composición, número de tokens y proceso de curación no están disponibles en la información facilitada. El repositorio ofrece además una variante independiente con cuantizaciones ponderadas por imatrix (Rhea-4B-fast-0409-high-i1-GGUF), que suele reducir la degradación de perplejidad en bits bajos.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" del repositorio.
- Generación de código: el repositorio está etiquetado como "code" y el modelo base se ajustó sobre el dataset Rhea-Coding.
- Razonamiento explícito: la etiqueta "thinking" sugiere la presencia de un modo de razonamiento visible, aunque su funcionamiento exacto (activación por prompt de sistema, etiquetas de pensamiento, presupuesto de tokens de razonamiento) no está documentado en la información disponible.
- Comportamiento orientado a agentes: etiquetas "agent" y "agentic", lo que indica entrenamiento o ajuste para tareas de varios pasos.
- Tool calling / function calling: no documentado en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language: en` de la model card.
- Capacidades de visión, audio o modalidades adicionales: no documentadas; el repositorio es exclusivamente de texto.

## Casos de uso

- Asistencia de programación en local: el modelo, en cuantización Q4_K_M (2,6 GB), puede ejecutarse en un portátil con GPU de gama media para autocompletar funciones, explicar fragmentos de código y generar pruebas unitarias sin enviar código propietario a servicios externos.
- Agentes de automatización de tareas de desarrollo: con etiquetas "agent" y "agentic", encaja en bucles de razonamiento multi-paso que invocan comandos, editan ficheros y verifican resultados, siempre que la capa de orquestación implemente el protocolo de herramientas, ya que su soporte nativo de function calling no está documentado.
- Generación de documentación técnica a partir de código: el modelo puede resumir módulos y clases y producir docstrings en inglés, aprovechando su ajuste específico sobre un dataset de codificación.
- Refactorización asistida en pipelines de CI/CD: integrado mediante un servidor compatible con llama.cpp (`llama-server`) que exponga una API compatible con OpenAI, puede emplearse como paso de revisión automática que proponga cambios antes de abrir una pull request.
- Prototipado de razonamiento paso a paso: el modo "thinking" permite generar cadenas de razonamiento intermedias para depurar prompts, comparar estrategias de resolución o construir datasets de destilación sobre trazas de razonamiento.
- Despliegue en entornos aislados o sin conectividad: al ocupar menos de 3 GB en Q4_K_M y ser un GGUF autocontenido, es viable en máquinas sin GPU dedicada mediante inferencia en CPU, útil en entornos con requisitos estrictos de confidencialidad.
- Evaluación comparativa de cuantizaciones: el repositorio permite medir empíricamente la pérdida de calidad entre Q2_K, Q4_K_M, Q8_0 y f16 en tareas de código, usando el propio modelo base en safetensors como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantizaciones no incluye métricas de MMLU, HumanEval, GSM8K, MBPP ni ninguna otra evaluación, y el repositorio del modelo base no ha sido facilitado en la información de partida. No se dispone, por tanto, de datos comparativos verificables.

## Requisitos de hardware

Los tamaños siguientes son los tamaños reales de fichero publicados en el repositorio, no estimaciones:

| Cuantizacion | Tamano (GB) | Nota del autor |
|---|---|---|
| Q2_K | 1,8 | - |
| Q3_K_S | 2,0 | - |
| Q3_K_M | 2,2 | calidad inferior |
| Q3_K_L | 2,3 | - |
| IQ4_XS | 2,4 | - |
| Q4_K_S | 2,5 | rápida, recomendada |
| Q4_K_M | 2,6 | rápida, recomendada |
| Q5_K_S | 2,9 | - |
| Q5_K_M | 3,0 | - |
| Q6_K | 3,4 | muy buena calidad |
| Q8_0 | 4,4 | rápida, mejor calidad |
| f16 | 8,2 | 16 bpw, sobredimensionada |

- VRAM estimada para inferencia: el peso de los ficheros más la caché KV. Para Q4_K_M (2,6 GB) es razonable reservar entre 3,5 y 5 GB de VRAM según la longitud de contexto configurada; para Q8_0 (4,4 GB), entre 5,5 y 7 GB. Con contextos muy largos la caché KV puede superar el tamaño de los pesos; no se dispone de datos de contexto nativo para calcularlo con precisión.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más de VRAM para cuantizaciones de 4 bits, y en GPU de 8-12 GB (RTX 3060, RTX 4060, RTX 4070, RTX 3080) para Q8_0. Las cuantizaciones Q2_K y Q3_K son viables incluso en iGPU con memoria unificada.
- GPU de datacenter: no son necesarias. A100, H100 o similares solo tienen sentido para servir muchas réplicas concurrentes del modelo.
- Inferencia en CPU: viable. Los ficheros Q4_K_M (2,6 GB) y Q5_K_M (3,0 GB) caben en RAM de sistemas de consumo y permiten generación en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, llama-server (API compatible con OpenAI), Ollama, LM Studio, text-generation-webui, koboldcpp y cualquier runtime que soporte GGUF. vLLM y TGI no son la vía natural para este repositorio, ya que están orientados a pesos safetensors.
- Variante con imatrix: disponible en mradermacher/Rhea-4B-fast-0409-high-i1-GGUF, preferible si se busca mejor relación calidad/tamaño en bits bajos.
- Latencia y throughput: no disponibles. Dependen por completo del hardware, la cuantización y la longitud de contexto, y no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni de especificaciones de contexto para modelos alternativos dentro de la información proporcionada, por lo que cualquier comparación cuantitativa con otras familias (Qwen3-4B, Llama-3.2-3B, Phi-4-mini, Gemma-3-4B) se marcaría como no disponible. La comparación posible se limita a las variantes del propio modelo:

| Modelo | Parametros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| Rhea-4B-fast-0409-high-GGUF (este repositorio) | 4.022.468.096 | GGUF (Q2_K a f16) | Apache-2.0 | HuggingFace; 0 descargas, 0 likes |
| roskosmos19/Rhea-4B-fast-0409-high (modelo base) | 4.022.468.096 | safetensors | Apache-2.0 (según metadatos del repositorio cuantizado) | HuggingFace |
| mradermacher/Rhea-4B-fast-0409-high-i1-GGUF | 4.022.468.096 | GGUF con imatrix | Apache-2.0 | HuggingFace |

Diferencias relevantes entre ellas: el modelo base en safetensors es el adecuado para servidores de alto rendimiento y para volver a cuantizar; el repositorio i1-GGUF ofrece cuantizaciones ponderadas por importancia, generalmente superiores en calidad por bit; y este repositorio aporta cuantizaciones estáticas con una horquilla de tamaños más amplia, incluida f16.

## Limitaciones y advertencias

- Idioma: el modelo está declarado únicamente para inglés. Su rendimiento en castellano no está documentado y, dado el ajuste sobre un dataset centrado en código, es previsible que sea inferior.
- Sin benchmarks publicados: no hay ninguna métrica que respalde afirmaciones de calidad en código, razonamiento o tareas agénticas. Cualquier decisión de adopción debería basarse en una evaluación propia.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de uso en producción ni informes de terceros.
- Efecto de la cuantización: las variantes Q2_K y Q3_K (1,8-2,3 GB) introducen pérdida de calidad apreciable, especialmente en tareas de razonamiento y generación de código, donde los errores de tokenización o de precisión se propagan. El propio autor marca Q3_K_M como "lower quality" y describe f16 como "overkill".
- Riesgo de alucinación: inherente a los modelos de 4B, particularmente en la generación de APIs, firmas de funciones y bibliotecas inexistentes. No se documenta ningún mecanismo de mitigación.
- Herramientas y agentes: las etiquetas "agent" y "agentic" no implican soporte nativo verificado de function calling. La integración con herramientas debe validarse experimentalmente antes de usarla en producción.
- Trazabilidad del entrenamiento: se desconoce la composición del dataset Rhea-Coding (procedencia, licencias de los datos, posible contaminación de benchmarks), lo que dificulta evaluar riesgos de sesgo y de filtración de datos de evaluación.
- Longitud de contexto desconocida: no se puede planificar un caso de uso que dependa de ventanas largas sin verificar experimentalmente el comportamiento del modelo más allá del contexto de entrenamiento.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia. No obstante, esa licencia corresponde al repositorio cuantizado según sus metadatos; conviene verificar la licencia del modelo base y del dataset antes de un uso comercial.
- Fecha de publicación: los metadatos indican creación el 2026-09-21 y actualización el 2026-09-21, fechas que deberían confirmarse en la página del repositorio antes de citarlas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Rhea-4B-fast-0409-high-GGUF
- Modelo base: https://huggingface.co/roskosmos19/Rhea-4B-fast-0409-high
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Rhea-4B-fast-0409-high-i1-GGUF
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#Rhea-4B-fast-0409-high-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/roskosmos19/Rhea-Coding
- Peticiones y preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Referencia sobre uso de ficheros GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los únicos resultados obtenidos trataban sobre la demarcación territorial Benito Juárez de Ciudad de México y no guardan relación con el contenido de esta ficha, por lo que se han descartado.
