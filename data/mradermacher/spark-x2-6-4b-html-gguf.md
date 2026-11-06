# mradermacher/Spark-x2.6-4B-HTML-GGUF

## Resumen

Spark-x2.6-4B-HTML-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo Spark-x2.6-4B-HTML, publicado originalmente por el usuario wesjos en Hugging Face. El repositorio lo mantiene mradermacher, un perfil conocido por generar versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base pertenece a la familia Spark-X2.6 de XHToken, una serie de modelos abiertos orientada a despliegue en dispositivo (on-device AI).

Segun el repositorio oficial de XHToken, Spark-X2.6 conserva exactamente la misma arquitectura que Spark-X2.5 y obtiene sus mejoras mediante un post-entrenamiento refinado, con avances en codigo, capacidades de agente, contexto largo, multilingue y razonamiento. El sufijo "HTML" en el nombre sugiere una especializacion o ajuste orientado a generacion de HTML, aunque la model card del repositorio no lo documenta explicitamente.

La relevancia de esta ficha radica en que ofrece variantes cuantizadas (desde Q2_K hasta Q8_0, ademas de F16 e IQ4_XS) de un modelo de 4B parametros, lo que facilita su ejecucion en hardware de consumo. No obstante, la informacion disponible sobre el modelo base es muy limitada: no se detallan parametros exactos, contexto, licencia ni idiomas en la model card proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la de Spark-X2.5, segun XHToken) |
| Parametros totales | 4B (segun el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible en esta model card (el repositorio hermano i1-GGUF menciona ingles y chino) |
| Licencia | no disponible en esta model card (el repositorio hermano i1-GGUF indica Apache-2.0) |
| Formato de pesos | GGUF (cuantizaciones estaticas, quantize_version 2, output_tensor_quantised 1, convert_type hf) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la model card de este repositorio. El repositorio oficial de XHToken indica que Spark-X2.6 mantiene exactamente la misma arquitectura que Spark-X2.5, y que las mejoras de capacidad provienen del post-entrenamiento en lugar de cambios estructurales. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

El proceso de cuantizacion documentado en la model card incluye metadatos tecnicos: quantize_version 2, output_tensor_quantised 1 y convert_type hf, lo que indica una conversion desde pesos en formato Hugging Face a GGUF mediante la herramienta de cuantizacion de llama.cpp. No se mencionan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta "conversational" del repositorio hermano i1-GGUF.
- Razonamiento mejorado respecto a Spark-X2.5, segun el repositorio oficial de XHToken.
- Generacion de codigo, con mejoras sustanciales declaradas por XHToken.
- Capacidades de agente (agent) y razonamiento multi-paso, segun XHToken.
- Soporte de contexto largo, segun XHToken (sin cifra concreta disponible).
- Capacidades multilingues, segun XHToken (sin listado de idiomas en esta model card).
- Especializacion en HTML, inferida del sufijo "HTML" del nombre del modelo base; no confirmada en la documentacion disponible.
- Soporte de tool calling / function calling: no disponible.

## Casos de uso

- Generacion y maquetacion de HTML: el sufijo "HTML" del modelo base sugiere un ajuste orientado a producir marcado HTML, util para generar plantillas, fragmentos de interfaz o correos HTML de forma automatizada en pipelines de contenido.
- Asistente de codigo en local: con 4B parametros y cuantizaciones Q4_K_M o Q5_K_M, puede ejecutarse en equipos de desarrollo sin GPU dedicada para autocompletado y explicacion de codigo, segun las mejoras en codigo declaradas por XHToken.
- Prototipado de agentes: las capacidades de agente y razonamiento multi-paso declaradas permiten construir flujos de automatizacion sencillos en entornos con recursos limitados.
- Procesamiento de documentos largos: el soporte de contexto largo declarado por XHToken lo hace apto para resumir o extraer informacion de documentos extensos, aunque la longitud exacta no esta disponible.
- Aplicaciones multilingues ligeras: el soporte multilingue declarado permite tareas de traduccion o atencion al cliente en varios idiomas, con la salvedad de que la lista concreta no esta documentada en esta model card.
- Despliegue en dispositivo (on-device): XHToken posiciona la serie como orientada a IA en dispositivo, por lo que encaja en aplicaciones de escritorio o moviles con llama.cpp u Ollama que requieran inferencia local sin conexion.
- Experimentacion e investigacion: las multiples cuantizaciones (desde Q2_K hasta F16) permiten estudiar el impacto de la precision en la calidad de salida sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 4B parametros, las cuantizaciones Q4_K_M ocupan aproximadamente 2,5-3 GB y F16 en torno a 8 GB, aunque estas cifras son estimaciones generales y no datos publicados por el autor.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de 4B y las cuantizaciones disponibles, aunque no hay confirmacion oficial.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF (Ollama, LM Studio, entre otros); vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones suficientes para establecer una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card de este repositorio no documenta licencia, idiomas, contexto ni parametros exactos; es necesario consultar el repositorio del modelo base (wesjos/Spark-x2.6-4B-HTML) para confirmar estos datos antes de un uso en produccion.
- El repositorio hermano i1-GGUF indica licencia Apache-2.0, pero esta ficha no puede confirmar que la misma licencia aplique al modelo base de este repositorio.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad de forma notable; para uso en produccion se recomienda Q4_K_M o superior.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 4B parametros; no se han publicado evaluaciones que cuantifiquen este riesgo.
- No se dispone de informacion sobre sesgos conocidos ni sobre el proceso de alineacion del modelo.
- El sufijo "HTML" sugiere una especializacion que podria reducir el rendimiento en tareas generales fuera de ese dominio; no confirmado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Spark-x2.6-4B-HTML-GGUF
- Modelo base: https://huggingface.co/wesjos/Spark-x2.6-4B-HTML
- Repositorio hermano (imatrix): https://huggingface.co/mradermacher/Spark-X2.6-4B-i1-GGUF
- Repositorio oficial de la serie: https://github.com/XHToken/Spark-X2.6
