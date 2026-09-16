# mradermacher/tanpo-marketing-GGUF

## Resumen

`mradermacher/tanpo-marketing-GGUF` es un repositorio de cuantizaciones GGUF del modelo `d4rkninja/tanpo-marketing`, un ajuste fino orientado a tareas de marketing y generación de contenido comercial. Lo publica mradermacher, un conocido distribuidor de cuantizaciones para la comunidad de inferencia local, que convierte el modelo original en formatos GGUF listos para `llama.cpp` y derivados. El modelo base tiene 1.170.340.608 parámetros (aproximadamente 1,17 mil millones), lo que lo sitúa en la categoría de modelos pequeños, ejecutables en hardware de consumo.

El problema que resuelve es doble. Por un lado, ofrece un modelo especializado en dominio (marketing) en lugar de un asistente generalista, lo que puede ser útil para generar copys, descripciones de producto o campañas con un tono más ajustado. Por otro, al distribuirse en GGUF con cuantizaciones desde Q2_K (0,6 GB) hasta f16 (2,4 GB), permite desplegarlo en portátiles, equipos sin GPU dedicada o entornos con restricciones de memoria y de privacidad.

Es relevante ahora porque la tendencia hacia modelos pequeños y especializados para tareas concretas (frente a modelos gigantes generalistas) reduce costes de inferencia. Ahora bien, la información publicada es muy escasa: no se documentan la arquitectura concreta, la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks, y el modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no la especifica; los tags indican `transformers` y `unsloth`, lo que sugiere un transformer ajustado con Unsloth) |
| Parámetros totales | 1.170.340.608 (≈1,17 B), dato de safetensors del modelo base |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (`en`) |
| Licencia | `other` (no detallada en la model card) |
| Formato de pesos | GGUF en este repositorio; safetensors en el modelo base |
| Autor de la cuantización | mradermacher |
| Modelo base | d4rkninja/tanpo-marketing |
| Tamaño del repositorio | 10,6 GB (todas las cuantizaciones juntas) |
| Fecha de publicación | 16 de septiembre de 2026 (según metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna del modelo. Los tags del repositorio (`transformers`, `unsloth`, `tanpo`, `darklab`, `marketing`) indican que se trata de un modelo de lenguaje para generación de texto, presumiblemente un transformer decoder-only, y que el ajuste fino del modelo base se realizó con la librería Unsloth, especializada en fine-tuning eficiente en memoria mediante técnicas como LoRA/QLoRA. El pipeline declarado por HuggingFace aparece como no disponible y tampoco se documenta si hubo RLHF, DPO u otro tipo de alineamiento posterior.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, la ventana de contexto original ni técnicas de atención alternativas. El repositorio de mradermacher es exclusivamente una conversión a GGUF de los pesos originales, con cuantizaciones estáticas; el propio autor indica que no hay cuantizaciones con imatrix/weighted disponibles en el momento de la publicación, aunque pueden solicitarse abriendo una discusión en la comunidad.

## Capacidades

- Generación de texto conversacional: el tag `conversational` confirma uso en diálogo multi-turno.
- Generación de contenido de marketing: es la especialización declarada, con tags `marketing`, `tanpo` y `darklab`.
- Escritura creativa y persuasiva: presuntamente orientada a copys, eslóganes, descripciones de producto y campañas, aunque no hay documentación técnica que lo detalle.
- Instrucciones en inglés: el único idioma declarado es `en`.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede desplegarse en infraestructura de inferencia compatible con HuggingFace.
- Tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento extendido (thinking): no disponible.

## Casos de uso

- Generación de descripciones de producto en comercio electrónico: el modelo puede redactar fichas de producto a partir de una lista de atributos (material, medidas, público objetivo), reduciendo el trabajo manual en catálogos con miles de referencias. Su tamaño de 1,17 B permite ejecutarlo por lotes sobre CPU o una GPU modesta.
- Redacción de copys para campañas de pago: generar variantes de titulares y textos para anuncios en buscadores o redes sociales, con ajuste de tono y longitud según las restricciones de cada plataforma.
- Emails de marketing y secuencias de nurturing: producir asuntos, preheaders y cuerpos de correo para flujos automatizados, manteniendo coherencia de marca si se le proporciona un prompt de sistema con las guías de estilo.
- Generación de borradores para blogs y SEO: crear primeros borradores de artículos o meta descripciones que después pasa un editor humano, como paso previo a la revisión y al enriquecimiento con palabras clave.
- Prototipado local con requisitos de privacidad: al ser GGUF y caber en menos de 1 GB con cuantización Q4_K_M, puede ejecutarse íntegramente en un portátil sin conexión, lo que resulta útil cuando el contenido de marketing es confidencial y no puede salir de la organización.
- Asistente interno para equipos comerciales: chatbot que sugiere respuestas a objeciones frecuentes o resume materiales de producto, desplegado en local con `llama.cpp` u Ollama.
- Generación de variantes para test A/B: producir múltiples formulaciones del mismo mensaje para comparar métricas de conversión en experimentos controlados.
- Clasificación y etiquetado ligero de textos comerciales: categorizar leads, reseñas o tickets por temática o tono, dado que un modelo de 1,17 B es lo bastante pequeño para procesar volúmenes altos con coste bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantizaciones no incluye ninguna métrica (MMLU, HumanEval, GSM8K ni equivalentes), y tampoco se han encontrado datos de evaluación en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: el peso de los ficheros va de 0,6 GB (Q2_K) a 2,4 GB (f16); hay que sumar el espacio del contexto y los buffers de la implementación, típicamente unos 0,5-1,5 GB adicionales según longitud de contexto. En la práctica: alrededor de 1,5-2 GB en Q4_K_M y 3-4 GB en f16.
- GPU recomendadas: cualquier GPU con 4 GB o más de memoria. Funciona con RTX 3060, RTX 4060, RTX 4090, así como con GPUs de datacenter (A100, H100) si se quiere servir en paralelo, aunque están sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas actuales e incluso en iGPUs con memoria unificada. También es viable la inferencia solo en CPU en un equipo con 4 GB de RAM libres usando los cuantizados más bajos.
- Opciones de despliegue: `llama.cpp`, Ollama, LM Studio, koboldcpp, text-generation-webui y servidores compatibles con la API de OpenAI sobre llama.cpp. vLLM tiene soporte de GGUF pero limitado; TGI no es la vía recomendada para este formato.
- Latencia y throughput estimados: no disponibles. No hay datos publicados por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tanpo-marketing (este, vía GGUF) | 1,17 B | no disponible | `other` (no detallada) | HuggingFace, cuantizaciones GGUF | Especializado en marketing, solo inglés, sin benchmarks publicados |
| Llama 3.2 1B | 1,24 B | 128 K | Llama 3.2 Community License | HuggingFace, GGUF y safetensors | Modelo generalista, multilingüe, muy extendido en inferencia local |
| Qwen2.5 1.5B | 1,54 B | 32 K | Apache 2.0 | HuggingFace, GGUF y safetensors | Generalista, buen rendimiento en código y multilingüe, licencia permisiva |
| Gemma 2 2B | 2,6 B | 8 K | Gemma Terms of Use | HuggingFace, GGUF y safetensors | Generalista, algo más grande, requiere más memoria |

La comparación con estos modelos es orientativa en cuanto a tamaño y categoría de despliegue: para tanpo-marketing no hay datos de rendimiento publicados, de modo que no es posible establecer una comparación cuantitativa de calidad. Su ventaja diferencial sería la especialización en marketing; su desventaja, la ausencia de documentación, la licencia poco clara y el soporte únicamente en inglés.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se publican arquitectura, contexto, dataset de entrenamiento, proceso de alineamiento ni evaluación. Esto impide estimar su fiabilidad antes de desplegarlo.
- Licencia `other` sin detallar: no se especifican los términos de uso comercial. Es imprescindible contactar con el autor del modelo base (`d4rkninja`) antes de cualquier uso en producción o distribución.
- Solo inglés: no hay soporte declarado para castellano ni otros idiomas; el rendimiento fuera del inglés será previsiblemente pobre.
- Riesgo de alucinación: al ser un modelo de 1,17 B, la tasa de invención de datos (cifras, características de producto, referencias legales) es alta. Cualquier contenido generado para marketing debe pasar revisión humana.
- Sesgos: no se documenta ninguna evaluación de sesgos ni filtrado del dataset. Un modelo entrenado sobre textos comerciales puede amplificar estereotipos de marketing y usar un tono excesivamente promocional.
- Trazabilidad y popularidad: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción por parte de terceros.
- Cuantizaciones agresivas: Q2_K y Q3_K degradan notablemente la calidad (el propio autor marca Q3_K_M como «lower quality» y recomienda Q4_K_S, Q4_K_M u Q8_0). Para tareas creativas conviene usar Q5_K_M o superior.
- Sin cuantizaciones imatrix/weighted: el autor indica que no las ha generado, por lo que no se dispone de la mejora de calidad que suelen aportar en tamaños bajos.
- Sin datos de contexto: se desconoce la ventana máxima soportada, lo que complica diseñar flujos que dependan de contextos largos.
- Fecha de publicación: los metadatos indican septiembre de 2026, lo que conviene verificar en el repositorio por si hubiera actualizaciones posteriores.

## Enlaces

- Repositorio HuggingFace (cuantizaciones GGUF): https://huggingface.co/mradermacher/tanpo-marketing-GGUF
- Modelo base: https://huggingface.co/d4rkninja/tanpo-marketing
- Página de resumen de cuantizaciones del autor: https://hf.tst.eu/model#tanpo-marketing-GGUF
- Solicitudes de cuantización / FAQ del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF referenciada por el autor (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Búsqueda web: no se han encontrado papers, blogs ni demos relevantes sobre este modelo; los resultados devueltos corresponden a páginas de soporte de Microsoft sin relación con el modelo.
