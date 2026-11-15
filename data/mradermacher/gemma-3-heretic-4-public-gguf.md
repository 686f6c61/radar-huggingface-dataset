# mradermacher/gemma-3-heretic-4-public-GGUF

## Resumen

`mradermacher/gemma-3-heretic-4-public-GGUF` es una reedición en formato GGUF del modelo `VINAY-UMRETHE/gemma-3-heretic-4-public`, un derivado de la familia Gemma 3 de Google sometido a un proceso de "abliteration" (eliminación de los mecanismos de rechazo y alineación de seguridad). El autor de esta versión, mradermacher, se limita a generar cuantizaciones estáticas del modelo original para facilitar su ejecución en hardware de consumo mediante llama.cpp y herramientas compatibles.

El dato más relevante de esta ficha es que el repositorio declara 8.423.840 parámetros totales según los metadatos de safetensors, lo que sitúa al modelo en la categoría de modelos muy pequeños (por debajo de los 10 millones de parámetros). El tamaño total del repositorio es de 0,3 GB, coherente con un modelo de este tamaño más los ficheros multimodales `mmproj`. Se trata, por tanto, de un experimento de fine-tuning/abliteration sobre una base Gemma 3, no de un modelo de producción a escala.

La relevancia de esta ficha es doble: por un lado documenta un caso típico de la práctica de "decensoring" de modelos abiertos; por otro, sirve de advertencia sobre las limitaciones reales de estos derivados, que conservan la arquitectura y el tokenizador del modelo base pero con un número de parámetros drásticamente reducido respecto a los Gemma 3 oficiales (que van de 1B a 27B). La licencia no está declarada en el repositorio, lo que constituye un riesgo jurídico relevante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 3; detalles exactos no disponibles) |
| Parametros totales | 8.423.840 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; además mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un derivado de Gemma 3 y de que el repositorio declara `library_name: transformers`. El modelo base `VINAY-UMRETHE/gemma-3-heretic-4-public` incorpora las etiquetas `heretic`, `uncensored`, `decensored` y `abliterated`, lo que indica que fue sometido a una técnica de abliteration: la identificación y supresión de las direcciones de activación asociadas al rechazo de peticiones, sin reentrenamiento supervisado completo. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La presencia de ficheros `mmproj` (multi-modal projector) en el repositorio GGUF sugiere que el modelo base conserva la capacidad multimodal de Gemma 3 (visión), aunque no se especifica qué componente visual se utiliza ni con qué resolución. El autor de las cuantizaciones indica que no ha generado cuantizaciones ponderadas/imatrix, solo estáticas, y que el proceso es reproducible (`reproducible` en las etiquetas). No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat (`conversational` en las etiquetas).
- Razonamiento básico y respuesta a instrucciones, condicionado por el tamaño reducido del modelo (8,4M de parámetros).
- Capacidad multimodal potencial gracias a los ficheros `mmproj` incluidos, aunque no se documenta su alcance ni calidad.
- Comportamiento "uncensored"/"abliterated": el modelo no aplica los filtros de rechazo del Gemma 3 original, lo que puede producir respuestas a peticiones que el modelo base rechazaría.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo "thinking", audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre abliteration y alineación: el modelo sirve como caso de estudio para medir cómo la supresión de direcciones de rechazo afecta a la calidad general y a la coherencia en un modelo derivado de Gemma 3, comparándolo con el original.
- Pruebas de robustez y red-teaming: útil en entornos controlados para evaluar la eficacia de filtros de seguridad externos (guardrails) frente a un modelo que no rechaza peticiones por sí mismo.
- Experimentos docentes sobre cuantización GGUF: con 0,3 GB de repositorio y cuantizaciones desde Q2_K hasta f16, es un caso práctico para estudiar el impacto de la cuantización en la perplejidad y la calidad de salida.
- Despliegue en hardware muy limitado: al ser un modelo de 8,4M de parámetros, puede ejecutarse en CPU o en GPUs de gama baja con llama.cpp, útil para prototipos de inferencia local sin requisitos de VRAM.
- Generación de texto de dominio muy restringido: si se valida su comportamiento, podría emplearse en tareas de autocompletado o clasificación simple en inglés dentro de pipelines internos.
- Evaluación de licencias y compliance: caso práctico para analizar los riesgos de usar modelos derivados sin licencia declarada en productos comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; el fichero f16 ocupa aproximadamente 0,1 GB y las cuantizaciones Q4_K_M también alrededor de 0,1 GB según la tabla del autor.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; también es viable en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (GTX 1050, RTX 3050, RTX 4090, etc.) e incluso en iGPU y Raspberry Pi.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación del GGUF), y servidores compatibles con GGUF; los ficheros `mmproj` permiten el uso multimodal en llama.cpp.
- Latencia y throughput: no disponibles; por el tamaño del modelo se espera un throughput muy alto en CPU y prácticamente instantáneo en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mradermacher/gemma-3-heretic-4-public-GGUF | 8,4M | no disponible | no disponible | GGUF en HF |
| VINAY-UMRETHE/gemma-3-heretic-4-public (base) | no disponible | no disponible | no disponible | safetensors en HF |
| Gemma 3 oficial (Google) | 1B / 4B / 12B / 27B | hasta 128K en algunas variantes | Gemma Terms of Use | pesos oficiales en HF |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El número de parámetros declarado (8,4M) es órdenes de magnitud inferior al de los Gemma 3 oficiales; la calidad esperada es muy baja para tareas reales.
- El proceso de abliteration elimina los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido dañino, sesgado o ilegal; no debe desplegarse sin guardrails externos.
- Riesgo elevado de alucinación y de incoherencia, especialmente con cuantizaciones agresivas (Q2_K, Q3_K_S).
- Idioma limitado al inglés; no se garantiza un comportamiento correcto en castellano.
- Licencia no declarada: no se puede asumir uso comercial permitido; además, al derivar de Gemma 3, podrían aplicar los términos de uso de Gemma, no incluidos en el repositorio.
- El autor de las cuantizaciones advierte que no hay cuantizaciones ponderadas/imatrix disponibles y que las estáticas pueden tener peor calidad relativa.
- Los ficheros `mmproj` sugieren multimodalidad, pero no se documenta su funcionamiento ni su calidad; no debe asumirse que la visión funciona correctamente.
- Fecha de creación del repositorio (2026-11-15) y cero descargas/likes: sin validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma-3-heretic-4-public-GGUF
- Modelo base: https://huggingface.co/VINAY-UMRETHE/gemma-3-heretic-4-public
- Página de descargas del autor: https://hf.tst.eu/model#gemma-3-heretic-4-public-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
