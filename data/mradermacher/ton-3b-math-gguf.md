# mradermacher/TON-3B-Math-GGUF

## Resumen

TON-3B-Math-GGUF es la versión cuantizada en formato GGUF del modelo TON-3B-Math, desarrollado originalmente por kolerk y convertido a GGUF por mradermacher, un perfil conocido en Hugging Face por publicar cuantizaciones estáticas de modelos abiertos. El modelo base es un transformer de aproximadamente 3.397 millones de parámetros (3,4 mil millones) especializado en mathemáticas y razonamiento cuantitativo, afinado sobre el dataset kolerk/TON-Math-SFT.

La relevancia de esta ficha reside en que ofrece el modelo en múltiples niveles de cuantización (desde Q2_K de 1,5 GB hasta f16 de 6,9 GB), lo que permite ejecutarlo en hardware de consumo modesto, incluidas GPUs con 4-8 GB de VRAM o incluso CPU con llama.cpp. Está pensado para desarrolladores que necesitan un modelo pequeño de razonamiento matemático en inglés, desplegable localmente y con licencia Apache 2.0.

La información publicada por el autor es escasa: no se detallan la longitud de contexto, la composición exacta del dataset de entrenamiento ni resultados de benchmarks. Esta ficha recoge únicamente los datos disponibles y marca explícitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parámetros totales | 3.397.103.616 |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base original en safetensors |
| Modelo base | kolerk/TON-3B-Math |
| Dataset de ajuste | kolerk/TON-Math-SFT |
| Tamaño del repositorio | 32,8 GB (incluye todas las cuantizaciones) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 3,4 mil millones de parámetros afinado por kolerk sobre el dataset kolerk/TON-Math-SFT, orientado a tareas de matemáticas. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado más allá del SFT indicado en los metadatos. Tampoco se detalla si emplea innovaciones como atención lineal, decodificación especulativa o mezcla de expertos; los datos disponibles apuntan a una arquitectura densa convencional.

La contribución de mradermacher se limita a la cuantización estática en formato GGUF mediante herramientas estándar (probablemente llama.cpp), sin cuantizaciones ponderadas por imatrix en el momento de la publicación. La model card indica que las cuantizaciones con imatrix "no parecen estar disponibles por ahora" y que podrían solicitarse mediante una discusión comunitaria. La presencia de ficheros mmproj sugiere que el modelo base podría tener capacidades multimodales, aunque no se confirma en la documentación.

## Capacidades

- Generación de texto y razonamiento matemático en inglés, según el enfoque del ajuste SFT sobre TON-Math-SFT.
- Resolución de problemas cuantitativos y posible razonamiento paso a paso (no confirmado explícitamente en la model card).
- Conversación multi-turno: la etiqueta "conversational" en los metadatos sugiere soporte de diálogo.
- Posible soporte multimodal: la presencia de ficheros mmproj (Q8_0 y f16) indica que el modelo base podría aceptar entradas de imagen, aunque no se detalla en la documentación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo thinking explícito: no disponible.

## Casos de uso

- Tutoría matemática local: el modelo puede resolver problemas aritméticos y algebraicos en inglés ejecutándose en un portátil con GPU de 4-6 GB mediante la cuantización Q4_K_M (2,2 GB), lo que lo hace adecuado para aplicaciones educativas offline.
- Asistente de resolución de ejercicios en entornos sin conectividad: al caber en CPU con llama.cpp usando Q2_K (1,5 GB), puede desplegarse en dispositivos de bajos recursos para practicar matemáticas.
- Preprocesado de datos numéricos en pipelines: integrable como paso de normalización o verificación de cálculos en flujos ETL donde se requiera un modelo pequeño y con licencia permisiva.
- Prototipado rápido de aplicaciones de razonamiento: gracias a la licencia Apache 2.0 y al tamaño reducido, sirve para validar ideas antes de escalar a modelos mayores.
- Generación de explicaciones paso a paso en inglés para documentación técnica o material didáctico, usando la cuantización Q6_K (2,9 GB) para maximizar calidad.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes que permiten medir el impacto de la cuantización en tareas matemáticas sobre el mismo modelo base.
- Despliegue en entornos con restricciones de memoria: la variante Q3_K_S (1,7 GB) permite ejecución en GPUs integradas o contenedores con límites estrictos de RAM/VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2 y 3 GB para Q4_K_M (2,2 GB de pesos más overhead de contexto); entre 4 y 5 GB para Q8_0 (3,7 GB); en torno a 8 GB para f16 (6,9 GB).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4090, A100 o H100 para despliegues de mayor throughput; también válidas GPUs de 4-6 GB como GTX 1650 o RTX 3050 con cuantizaciones Q3/Q4.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 4 GB o más usando Q4_K_M o inferiores; las variantes Q2_K y Q3_K_S caben incluso en GPUs integradas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles; dependen del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TON-3B-Math (base) | 3,4 B | no disponible | Apache 2.0 | safetensors | Modelo original de kolerk |
| TON-3B-Math-GGUF (este) | 3,4 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas de mradermacher |
| Alternativas de 3B especializadas en matemáticas | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Solo soporta inglés según los metadatos; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- No se han publicado benchmarks, por lo que no es posible verificar la calidad matemática frente a modelos similares.
- Riesgo de alucinación inherente a los modelos de 3B parámetros, especialmente en problemas matemáticos de varios pasos.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K) pueden degradar notablemente la calidad en tareas de razonamiento; se recomienda Q4_K_M o superior para uso serio.
- No hay cuantizaciones ponderadas por imatrix disponibles, lo que puede reducir la calidad frente a alternativas con imatrix de tamaño similar.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento ni sobre los datos de entrenamiento del modelo base.
- La posible capacidad multimodal (ficheros mmproj) no está documentada; no debe asumirse su funcionamiento sin validación empírica.
- El repositorio ocupa 32,8 GB en total; descargar solo la cuantización necesaria para evitar consumo innecesario de disco y ancho de banda.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/TON-3B-Math-GGUF
- Modelo base: https://huggingface.co/kolerk/TON-3B-Math
- Dataset de ajuste: https://huggingface.co/datasets/kolerk/TON-Math-SFT
- Página de descargas del autor: https://hf.tst.eu/model#TON-3B-Math-GGUF
- README de referencia sobre GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de comparación de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Página de solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
