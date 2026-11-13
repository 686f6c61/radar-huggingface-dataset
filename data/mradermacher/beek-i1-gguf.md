# mradermacher/Beek-i1-GGUF

## Resumen

Beek es un modelo de lenguaje desarrollado por UTF-ai, orientado al sector público y a los valores democráticos neerlandeses. Está construido sobre una base de arquitectura Qwen 3.8 (según las etiquetas del autor) y cuenta con 27.320.697.856 parámetros totales en formato safetensors. El modelo se distribuye con licencia Apache 2.0 y soporta los idiomas neerlandés (nl) e inglés (en). La model card lo describe como un modelo conversacional y de visión, ya que el autor de la cuantización indica que se trata de un modelo multimodal con posibilidad de ficheros mmproj.

La ficha que nos ocupa corresponde concretamente a **mradermacher/Beek-i1-GGUF**, una cuantización GGUF con imatrix del modelo original UTF-ai/Beek, publicada por mradermacher. Esta versión facilita la ejecución local del modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, manteniendo la licencia Apache 2.0 del modelo base.

La relevancia de esta publicación radica en que permite desplegar un modelo de 27.000 millones de parámetros especializado en dominio público neerlandés en infraestructura local, algo especialmente útil para administraciones públicas que necesitan soberanía de datos y cumplimiento normativo sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen 3.8, según etiquetas del autor) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (11,0 GB), más variantes listadas en la model card: Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | neerlandés (nl), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la referencia a Qwen 3.8 en las etiquetas del autor y a la familia Qwen en general. Se trata de un transformer de 27.320.697.856 parámetros totales, sin indicios de que sea un modelo de mezcla de expertos (MoE), ya que no se especifican parámetros activos. El modelo base es UTF-ai/Beek y la model card original no aporta datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación.

La model card de la cuantización sí indica que se trata de un modelo de visión, con ficheros mmproj disponibles en el repositorio estático del mismo autor. Las cuantizaciones publicadas son de tipo imatrix (weighted/imatrix quants), lo que implica que se ha utilizado una matriz de importancia para preservar mejor la calidad en cuantizaciones agresivas. El autor incluye una tabla con los tipos de cuantización disponibles y recomienda IQ-quants sobre cuantizaciones no-IQ de tamaño similar.

## Capacidades

- Generación de texto conversacional en neerlandés e inglés, con orientación a dominio público y valores democráticos neerlandeses.
- Capacidad de visión según la model card del cuantizador (ficheros mmproj en el repositorio estático).
- Soporte de conversación multi-turno (etiqueta "conversational").
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a neerlandés e inglés según los metadatos.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- **Atención al ciudadano en administraciones neerlandesas**: el modelo puede gestionar consultas conversacionales en neerlandés sobre trámites y servicios públicos, con despliegue local que evita enviar datos personales a APIs externas y facilita el cumplimiento del RGPD.
- **Generación de documentación administrativa**: redacción y resumen de textos oficiales, comunicados y guías en neerlandés e inglés, aprovechando su orientación a valores públicos y su licencia Apache 2.0 para uso institucional sin restricciones comerciales.
- **Asistencia a funcionarios públicos**: chatbot interno de apoyo para resolver dudas sobre normativa y procedimientos, ejecutable en infraestructura propia del organismo gracias a las cuantizaciones GGUF.
- **Investigación en NLP neerlandés**: el modelo sirve como base para experimentos académicos sobre modelos de lenguaje en neerlandés, con la ventaja de disponer de cuantizaciones que reducen los requisitos de hardware.
- **Análisis de documentos con componente visual**: si se confirma la capacidad de visión mediante los ficheros mmproj, podría emplearse para extraer información de formularios, sellos o documentos escaneados en flujos administrativos.
- **Despliegue en entornos con recursos limitados**: las cuantizaciones i1-Q2_K (11 GB) y otras variantes permiten ejecutar el modelo en estaciones de trabajo con GPU de consumo, algo relevante para ayuntamientos o pequeñas administraciones sin clústeres dedicados.
- **Evaluación comparativa de modelos soberanos**: útil para investigadores que comparan modelos especializados en dominio público frente a modelos generalistas, dado su enfoque declarado en valores democráticos neerlandeses.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantización i1-Q2_K ocupa 11,0 GB, por lo que requiere al menos ~12 GB de VRAM para cargar el modelo completo en GPU. Las cuantizaciones de mayor tamaño (Q4_K_M, Q5_K_M, Q6_K) requerirán progresivamente más memoria, aunque no se dispone de cifras exactas en la información proporcionada.
- GPU recomendadas: para la cuantización Q2_K, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permiten cargar el modelo con margen para el contexto. Para cuantizaciones mayores se recomienda A100 (40/80 GB) o H100 (80 GB).
- ¿Cabe en GPU de consumo? Sí, la cuantización i1-Q2_K (11 GB) cabe en GPUs de consumo con 12 GB o más de VRAM, como la RTX 3060 de 12 GB, la RTX 4070 Ti o la RTX 4090. Las cuantizaciones de mayor tamaño requerirán GPUs de 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama y otras herramientas compatibles con GGUF. La etiqueta "endpoints_compatible" sugiere compatibilidad con servidores de inferencia tipo OpenAI-compatible, aunque no se detalla en la información.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Beek (UTF-ai/Beek) | 27,3 B | no disponible | Apache 2.0 | Hugging Face |
| Qwen 3.8 (referencia de arquitectura) | no disponible | no disponible | no disponible | no disponible |
| Modelos similares de dominio público neerlandés | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre modelos comparables de la misma categoría (modelos especializados en dominio público neerlandés) para establecer una comparativa rigurosa con parámetros, contexto y rendimiento verificables.

## Limitaciones y advertencias

- **Idiomas limitados**: solo se declaran neerlandés e inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir información incorrecta, especialmente en dominios administrativos donde la precisión es crítica. Se recomienda verificación humana en producción.
- **Sesgos**: el modelo está orientado explícitamente a "valores públicos neerlandeses", lo que puede introducir sesgos culturales y normativos específicos de los Países Bajos. No se documentan evaluaciones de sesgo en la información disponible.
- **Falta de transparencia en el entrenamiento**: no se especifican datos de entrenamiento, número de tokens ni proceso de alineación, lo que dificulta evaluar su robustez y sus limitaciones reales.
- **Cuantizaciones agresivas**: la cuantización i1-Q2_K (11 GB para 27 B parámetros) implica una compresión notable que puede degradar la calidad respecto al modelo original en safetensors. El propio autor recomienda IQ-quants sobre cuantizaciones no-IQ de tamaño similar.
- **Licencia Apache 2.0**: permite uso comercial sin restricciones adicionales, pero conviene revisar la model card del modelo base (UTF-ai/Beek) por si hubiera condiciones adicionales no reflejadas en los metadatos.
- **Contexto desconocido**: al no disponerse de la longitud de contexto, no se puede garantizar su idoneidad para tareas con documentos largos.
- **Modelo de visión**: la capacidad de visión se infiere de la model card del cuantizador; los ficheros mmproj están en el repositorio estático, no en este, por lo que para uso multimodal hay que descargarlos aparte.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/mradermacher/Beek-i1-GGUF
- Modelo base: https://huggingface.co/UTF-ai/Beek
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/Beek-GGUF
- Página de resumen del modelo del cuantizador: https://hf.tst.eu/model#Beek-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
