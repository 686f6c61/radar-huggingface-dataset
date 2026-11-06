# mradermacher/zuman.ai-i1-GGUF

## Resumen

zuman.ai-i1-GGUF es la colección de cuantizaciones GGUF, generadas con imatrix, del modelo DawitShibabaw/zuman.ai. El trabajo de cuantización lo firma mradermacher, un autor habitual en el ecosistema GGUF, y está pensado para ejecutar el modelo en llama.cpp y entornos compatibles sobre hardware modesto. El modelo base es un transformer de aproximadamente 11.900 millones de parámetros (11,9 B) orientado a conversación multilingüe, con foco explícito en lenguas etíopes y del Cuerno de África (amárico, oromo, tigriña, somalí) junto con inglés.

El interés de esta publicación es práctico: ofrece el modelo base en formatos comprimidos de entre 4,9 GB y 7,1 GB para las variantes listadas, lo que permite desplegarlo en GPU de consumo con 8-12 GB de VRAM, algo inviable con los pesos completos. La model card del cuantizador no documenta el entrenamiento del modelo original, por lo que los detalles de arquitectura, dataset y metodología de alineación no están disponibles en la información proporcionada.

La relevancia actual radica en la escasez de modelos conversacionales abiertos con cobertura real de lenguas etíopes. No obstante, la licencia no está declarada en la información disponible y el modelo base no incluye benchmarks publicados, lo que limita su uso en producción sin una evaluación previa por parte del integrador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma, según los tags del repositorio); detalles no disponibles |
| Parámetros totales | 11.907.350.576 (11,9 B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-Q4_K_S, además de fichero imatrix; el repositorio estático ofrece Q4_0, Q4_1, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XS, IQ3_S, IQ3_L, IQ4_XS, small-IQ4_NL, Q2_K_S, Q3_K_S, Q3_K_L, Q4_K_M |
| Idiomas soportados | am (amárico), om (oromo), ti (tigriña), so (somalí), en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); pesos originales del modelo base presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de la etiqueta «gemma» presente en los tags del repositorio, lo que sugiere una arquitectura transformer decoder-only derivada de esa familia. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni la ventana de contexto nativa.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composición del corpus, la existencia de fases de RLHF, DPO o SFT, ni innovaciones técnicas concretas. El trabajo documentado en esta ficha se limita a la cuantización: mradermacher ha generado cuantizaciones ponderadas con fichero imatrix (importancia de matrices de calibración), lo que en la práctica reduce la pérdida de perplejidad respecto a cuantizaciones estáticas del mismo tamaño. La model card indica además que se trata de un modelo de visión y que los ficheros mmproj, si existen, se alojan en el repositorio estático.

## Capacidades

- Generación de texto conversacional multi-turno en amárico, oromo, tigriña, somalí e inglés.
- Capacidad declarada de visión: la model card del cuantizador lo etiqueta como modelo de visión, con ficheros mmproj en el repositorio estático; no se detallan las tareas visuales soportadas.
- Multilingüismo centrado en lenguas etíopes y del Cuerno de África, un nicho poco cubierto por modelos abiertos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Atención al cliente en amárico y oromo: el modelo puede gestionar conversaciones multi-turno en lenguas locales donde la mayoría de modelos abiertos rinden mal; requiere validación previa de calidad y del contexto efectivo.
- Traducción asistida entre inglés y lenguas etíopes: útil como borrador en flujos de localización de documentación o interfaces, con revisión humana obligatoria por el riesgo de alucinación en lenguas de bajos recursos.
- Moderación y clasificación de contenido en somalí: despliegue en GGUF con Q4_K_S sobre una GPU de 8-12 GB para prefiltrar mensajes antes de una revisión humana.
- Asistente educativo offline: al caber en hardware de consumo, puede ejecutarse en un portátil con GPU discreta en escuelas o entornos con conectividad limitada, sirviendo de apoyo en amárico y tigriña.
- Prototipado rápido de aplicaciones lingüísticas: la variedad de cuantizaciones (desde IQ3_XXS de 4,9 GB hasta Q4_K_S de 7,1 GB) permite iterar en local con llama.cpp antes de decidir un despliegue mayor.
- Procesamiento de documentos con componente visual: si los ficheros mmproj confirman soporte de visión, podría emplearse para extraer texto de formularios o imágenes en entornos multilingües, aunque esta capacidad no está documentada en detalle.
- Investigación sobre lenguas de bajos recursos: como punto de partida para evaluaciones comparativas de calidad en amárico, oromo, tigriña y somalí frente a modelos multilingües generalistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-8 GB con i1-Q4_K_S (7,1 GB en disco) y 5-6 GB con i1-IQ3_XXS o i1-Q2_K (4,9 GB), asumiendo offload completo a GPU y contexto moderado.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090; en el segmento profesional, A100 o H100 para despliegues concurrentes.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más usando cuantizaciones IQ3 o Q4; con 6 GB conviene reducir contexto o usar offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; servidores compatibles con endpoints OpenAI mediante llama.cpp server. vLLM y TGI no son la vía natural para GGUF, aunque existen soportes parciales.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas foco | Licencia | Formato |
|---|---|---|---|---|---|
| zuman.ai (este) | 11,9 B | no disponible | am, om, ti, so, en | no disponible | GGUF (cuantizado) |
| Gemma 2 9B | 9 B | 8.192 tokens (según documentación pública de Google) | multilingüe general | Gemma Terms of Use | safetensors, GGUF |
| Llama 3.1 8B | 8 B | 128.000 tokens (según documentación pública de Meta) | multilingüe general | Llama 3.1 Community License | safetensors, GGUF |

La comparación con Gemma 2 9B y Llama 3.1 8B es pertinente por tamaño, pero ninguno de los dos está especializado en lenguas etíopes; la ventaja de zuman.ai sería la cobertura lingüística del nicho, mientras que los generalistas ofrecen contexto documentado, licencia clara y benchmarks publicados. No se dispone de datos de rendimiento comparativo para zuman.ai.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial; es imprescindible contactar con el autor del modelo base antes de integrarlo en producción.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad en ninguna de las lenguas declaradas.
- Riesgo de alucinación elevado en lenguas de bajos recursos, donde los corpus de entrenamiento suelen ser escasos y ruidosos.
- Longitud de contexto desconocida: no se puede planificar el truncado ni el troceado de documentos sin medirla empíricamente.
- Sesgos no documentados: no hay información sobre la composición del dataset ni sobre filtros de seguridad o alineación.
- La model card del cuantizador no sustituye a la del modelo base; conviene consultar DawitShibabaw/zuman.ai para obtener detalles de entrenamiento y licencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- El soporte de visión está indicado de forma indirecta (etiqueta y referencia a mmproj); no se especifican tareas, resolución ni formato de imagen admitidos.

## Enlaces

- Repositorio de cuantizaciones imatrix: https://huggingface.co/mradermacher/zuman.ai-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/zuman.ai-GGUF
- Modelo base: https://huggingface.co/DawitShibabaw/zuman.ai
- Página de resumen del cuantizador: https://hf.tst.eu/model#zuman.ai-i1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
