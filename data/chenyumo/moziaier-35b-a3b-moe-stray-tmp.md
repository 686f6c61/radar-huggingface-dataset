# chenyumo/MoziAier-35B-A3B-MOE-stray-tmp

## Resumen

MoziAier-35B-A3B-MOE-stray-tmp es un modelo de lenguaje publicado en Hugging Face por el usuario chenyumo bajo el identificador `chenyumo/MoziAier-35B-A3B-MOE-stray-tmp`. Por su nombre y sus etiquetas, se trata de un modelo de arquitectura Mixture of Experts (MoE) con aproximadamente 35 mil millones de parámetros totales y unos 3 mil millones de parámetros activos por token, orientado a generación de texto con soporte de tool calling, contexto largo y capacidades de visión. La información pública disponible es muy limitada: el repositorio no incluye descripción, no registra descargas ni interacciones y no detalla los datos de entrenamiento ni los resultados de evaluación.

El modelo se distribuye en formato GGUF para su uso con llama.cpp, lo que facilita su despliegue en entornos locales y en hardware de consumo mediante cuantización. Las etiquetas del repositorio mencionan componentes propietarios o poco documentados como MoziSmartBit, occamy y qwen3.6, así como las categorías financial-llm, uncensored, long-context y long-horizon, lo que sugiere un ajuste orientado a dominios financieros y a tareas de razonamiento prolongado. No obstante, no se ha publicado documentación técnica que permita verificar estas capacidades.

La relevancia de esta ficha es principalmente descriptiva: se trata de una publicación reciente (23 de noviembre de 2026) sin tracción comunitaria ni validación externa. Cualquier evaluación de producción debería tratarse con cautela hasta que existan datos de benchmarks, licencia clara y documentación de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, según etiquetas del repositorio |
| Parámetros totales | 35B (aproximado, según el nombre del modelo) |
| Parámetros activos | 3B (aproximado, según el nombre del modelo) |
| Longitud de contexto | no disponible (etiqueta long-context sin cifra concreta) |
| Tipos de cuantización | no disponible (formato GGUF, cuantizaciones concretas no especificadas) |
| Idiomas soportados | en, zh (según etiquetas) |
| Licencia | other (no se detalla el texto de la licencia) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La información disponible indica únicamente que el modelo emplea una arquitectura Mixture of Experts con 35B parámetros totales y 3B activos, lo que implica un enrutamiento por token hacia un subconjunto de expertos y un coste computacional de inferencia comparable a un modelo denso de 3B. Las etiquetas hacen referencia a "qwen3.6", lo que podría sugerir una base derivada de la familia Qwen, aunque no se confirma en la documentación. Tampoco se detalla el número de expertos, la dimensión de las capas, el mecanismo de atención ni si incorpora atención lineal o decodificación especulativa.

No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineación, ni sobre el proceso de ajuste fino. La etiqueta "imatrix" sugiere que se ha utilizado una matriz de importancia para la cuantización GGUF, y "occamy" y "MoziSmartBit" podrían referirse a herramientas o metodologías internas del autor, pero no hay documentación que lo aclare. En consecuencia, el entrenamiento y las innovaciones técnicas del modelo deben considerarse no disponibles.

## Capacidades

- Generación de texto conversacional en inglés y chino, según las etiquetas del repositorio.
- Soporte de tool calling y function calling, indicado por la etiqueta tool-calling.
- Capacidades de visión, indicadas por la etiqueta vision, aunque no se especifica el codificador visual ni el formato de entrada.
- Orientación a contexto largo (long-context) y a tareas de horizonte prolongado (long-horizon), sin cifras concretas de ventana.
- Ajuste orientado a dominio financiero (financial-llm), sin documentación sobre el corpus utilizado.
- Modelo marcado como uncensored, lo que implica ausencia de filtros de rechazo en las respuestas.
- Compatibilidad con endpoints (endpoints_compatible) y despliegue mediante llama.cpp.
- No se confirma soporte de audio, matemáticas avanzadas ni modos de razonamiento explícito (thinking mode).

## Casos de uso

- Asistencia financiera interna: el modelo podría emplearse para resumir informes, extraer métricas de documentos contables o responder consultas sobre terminología financiera, aprovechando su ajuste declarado al dominio y su ventana de contexto larga.
- Automatización de atención al cliente multi-turno: con contexto largo y tool calling, podría gestionar conversaciones prolongadas e invocar APIs de consulta de pedidos o saldos, siempre que se valide su fiabilidad en producción.
- Procesamiento de documentos extensos: la etiqueta long-context permitiría, en teoría, analizar contratos o expedientes largos en una sola pasada, aunque la longitud exacta no está documentada.
- Agentes con razonamiento multi-paso: la combinación de tool calling y long-horizon sugiere su uso en pipelines de agentes que encadenan llamadas a herramientas, con la cautela de validar el enrutamiento de expertos en cargas reales.
- Despliegue local en estaciones de trabajo: al distribuirse en GGUF, puede ejecutarse con llama.cpp en equipos con GPU de consumo, lo que facilita prototipos y pruebas de concepto sin infraestructura cloud.
- Experimentación en investigación sobre MoE: su relación 35B/3B lo hace útil para estudiar el comportamiento de modelos dispersos y comparar calidad frente a modelos densos de tamaño similar en tareas controladas.
- Análisis de imágenes con texto asociado: la etiqueta vision permitiría probar tareas de descripción o extracción de información de imágenes, aunque la falta de documentación obliga a validar el soporte real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un MoE de 35B en GGUF, una cuantización Q4_K_M requeriría del orden de 20-22 GB de VRAM o memoria unificada, y Q8_0 en torno a 37-38 GB; estas cifras son estimaciones basadas en el tamaño, no datos del autor.
- GPU recomendadas: no disponibles. Por tamaño, un modelo de este tipo encajaría en A100 40/80 GB, H100 o RTX 6000 Ada para cuantizaciones altas; en consumer, una RTX 4090 (24 GB) podría alojar cuantizaciones Q4 con offload parcial.
- Cabe en GPU de consumo: probablemente en RTX 4090 o RTX 3090 con cuantizaciones de 4 bits, y en equipos con memoria unificada (Apple Silicon de 32 GB o más) mediante llama.cpp, aunque no hay confirmación del autor.
- Opciones de despliegue: llama.cpp es el soporte principal según la librería declarada; vLLM, TGI u Ollama no se confirman.
- Latencia y throughput: no disponibles. Al tener 3B parámetros activos, el coste por token debería aproximarse al de un modelo denso de 3B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MoziAier-35B-A3B-MOE-stray-tmp | 35B / 3B (aprox.) | no disponible | other (sin detalle) | GGUF | Hugging Face, sin descargas |
| Qwen3-30B-A3B | 30B / 3B | no disponible en esta ficha | Apache 2.0 (según familia Qwen) | safetensors, GGUF | Amplia adopción comunitaria |
| Mixtral 8x7B | 46B / 12B | 32K | Apache 2.0 | safetensors, GGUF | Amplia adopción comunitaria |
| DeepSeek-V2-Lite | 15,7B / 2,4B | 32K | MIT (según repositorio) | safetensors | Adopción moderada |

La comparación es estructural: MoziAier se posiciona en la franja de MoE con pocos parámetros activos, pero carece de la documentación, benchmarks y licencia clara que sí acompañan a las alternativas citadas. Los datos de contexto y licencia de los modelos comparados provienen de sus fichas públicas habituales y deben verificarse en cada repositorio.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card, paper ni descripción que explique el entrenamiento, los datos o la evaluación.
- Licencia "other" sin texto: no se puede determinar si el uso comercial está permitido; es un riesgo legal para producción.
- Etiqueta uncensored: el modelo puede generar contenido sin filtros, lo que exige moderación externa en aplicaciones expuestas a usuarios.
- Riesgo de alucinación no cuantificado: al no existir benchmarks, no hay evidencia de fiabilidad en dominios sensibles como el financiero.
- Idiomas limitados a inglés y chino según las etiquetas; el rendimiento en castellano no está documentado.
- Longitud de contexto no especificada pese a la etiqueta long-context.
- Capacidad de visión declarada pero sin detalles del codificador ni del formato de imagen admitido.
- Repositorio sin descargas ni likes: no hay validación de la comunidad ni informes de uso.
- El nombre incluye "stray-tmp", lo que sugiere una publicación temporal o de prueba, no una versión estable.
- Componentes como MoziSmartBit, occamy o qwen3.6 no están documentados y su función es desconocida.

## Enlaces

- Hugging Face: https://huggingface.co/chenyumo/MoziAier-35B-A3B-MOE-stray-tmp
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
