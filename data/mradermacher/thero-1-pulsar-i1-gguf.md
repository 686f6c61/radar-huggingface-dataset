# mradermacher/Thero-1-Pulsar-i1-GGUF

## Resumen

Thero-1-Pulsar-i1-GGUF es la versión cuantizada con imatrix del modelo Thero-1-Pulsar, publicada por el usuario mradermacher. El modelo original lo desarrolla Lothera y se distribuye con licencia CC-BY-4.0. Se trata de un modelo multimodal (texto e imagen) orientado a razonamiento y uso de herramientas, con soporte declarado para inglés, turco y otros idiomas. El repositorio contiene exclusivamente pesos en formato GGUF, pensados para inferencia local con llama.cpp y derivados.

El modelo base cuenta con 8.953.803.264 parámetros (aproximadamente 9 mil millones), lo que lo sitúa en la franja de modelos densos de tamaño medio, adecuados para ejecución en GPU de consumo con cuantizaciones agresivas. La model card no detalla la arquitectura interna, la longitud de contexto ni la composición del dataset de entrenamiento, por lo que esos datos figuran como no disponibles en esta ficha.

La relevancia de esta publicación radica en que ofrece un abanico amplio de cuantizaciones (desde IQ1_S de 3,0 GB hasta Q6_K de 7,5 GB) generadas con imatrix, lo que permite desplegar el modelo en hardware muy variado. Además, al ser un modelo de visión, los ficheros mmproj necesarios para el procesamiento de imágenes se alojan en el repositorio estático del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer multimodal, segun tags: vision, multimodal) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix, prefijo i1-) |
| Idiomas soportados | en, tr, multilingual |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (safetensors en el modelo base; mmproj en el repositorio estático) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Thero-1-Pulsar. Los tags del repositorio indican que se trata de un modelo multimodal con capacidades de visión, razonamiento y uso de herramientas, construido sobre la librería transformers. El recuento de parámetros (8,95 B) corresponde a los pesos en safetensors del modelo original, según los metadatos de Hugging Face.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. La única información técnica relevante de esta publicación es el proceso de cuantización: mradermacher ha generado cuantizaciones ponderadas con imatrix (fichero `Thero-1-Pulsar.imatrix.gguf` incluido en el repo), lo que típicamente mejora la calidad de las cuantizaciones de baja precisión respecto a las estáticas. El autor indica además que las cuantizaciones estáticas equivalentes están disponibles en un repositorio separado.

## Capacidades

- Generación de texto conversacional y razonamiento, según los tags `reasoning` y `conversational`.
- Procesamiento de imágenes (visión multimodal), con soporte para ficheros mmproj en el repositorio estático.
- Uso de herramientas y function calling, indicado por el tag `tool-use`.
- Soporte multilingüe con especial atención al inglés y al turco.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia estándar.
- No se documentan capacidades de audio ni modos de pensamiento explícitos (thinking mode) en la información disponible.

## Casos de uso

- Asistente conversacional local en turco e inglés: el modelo puede gestionar diálogos multi-turno en ambos idiomas, lo que lo hace útil para aplicaciones de atención al cliente o asistentes personales en entornos donde se requiere privacidad y ejecución local.
- Análisis de documentos con imágenes: gracias a su capacidad de visión, puede extraer información de capturas, formularios escaneados o gráficos combinándola con razonamiento textual, siempre que se despliegue junto con el fichero mmproj correspondiente.
- Automatización de tareas con tool calling: integrado en un agente que invoque APIs externas (calendarios, bases de datos, servicios web), el modelo puede decidir qué herramienta usar y construir los argumentos necesarios.
- Prototipado rápido en estaciones de trabajo con GPU de consumo: las cuantizaciones IQ3_S (4,5 GB) o Q4_K_M (5,8 GB) permiten ejecutar el modelo en tarjetas con 8-12 GB de VRAM, facilitando pruebas de concepto sin infraestructura dedicada.
- Generación de código asistida en entornos con requisitos de soberanía de datos: al poder ejecutarse en local con llama.cpp u Ollama, encaja en pipelines de desarrollo donde no se permite enviar código a servicios en la nube.
- Investigación en modelos multimodales de tamano medio: su tamaño de 8,95 B y su licencia permisiva (CC-BY-4.0) lo convierten en una base razonable para experimentos de evaluación comparativa o ajuste fino sobre tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 3,0 GB (IQ1_S) y 7,5 GB (Q6_K) solo para los pesos; hay que añadir el espacio del contexto KV y, en su caso, el del proyector multimodal (mmproj).
- GPU recomendadas: para cuantizaciones Q4_K_M o superiores, una RTX 3060 de 12 GB, RTX 4070 o RTX 4090 ofrecen margen suficiente; para Q6_K se recomienda al menos 12 GB de VRAM. En el extremo bajo, IQ2/IQ3 caben en GPUs de 6-8 GB.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más usando cuantizaciones IQ3/IQ4; las cuantizaciones IQ1/IQ2 permiten incluso 6 GB, con pérdida notable de calidad.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con servidores de inferencia estándar. Para visión es necesario cargar el mmproj del repositorio estático.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría. A modo orientativo, se puede situar frente a otros modelos multimodales de ~8-9 B, pero sin cifras verificables:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Thero-1-Pulsar (esta ficha) | 8,95 B | no disponible | CC-BY-4.0 | GGUF / safetensors |
| Alternativas de ~8-9 B multimodales | no disponible | no disponible | variable | no disponible |

No se han identificado en la información proporcionada modelos comparables concretos con datos verificables.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo base; al no haber información sobre el dataset de entrenamiento, no es posible evaluar sesgos de dominio o demográficos.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad factual.
- La longitud de contexto no está especificada, lo que impide garantizar un rendimiento adecuado en tareas de contexto largo.
- El soporte multilingüe declarado se centra en inglés y turco; el rendimiento en castellano no está verificado y podría ser inferior.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero conviene revisar los términos del modelo base original en Lothera/Thero-1-Pulsar por si hubiera condiciones adicionales.
- Las cuantizaciones de baja precisión (IQ1, IQ2, Q2_K) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- Para uso multimodal es imprescindible descargar el fichero mmproj desde el repositorio estático, ya que no está incluido en este repositorio de cuantizaciones ponderadas.
- El repositorio tiene 0 likes y un volumen de descargas moderado (1057), lo que sugiere una validación comunitaria limitada.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/mradermacher/Thero-1-Pulsar-i1-GGUF
- Modelo base original: https://huggingface.co/Lothera/Thero-1-Pulsar
- Repositorio de cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/Thero-1-Pulsar-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Thero-1-Pulsar-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
