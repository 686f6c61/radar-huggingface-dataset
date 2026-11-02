# jancirnodziewiaty/LFM2.5-24B-A2B-oQ5e

## Resumen

LFM2.5-24B-A2B-oQ5e es una cuantización de precisión mixta del modelo LFM2.5-24B-A2B, publicada por el usuario jancirnodziewiaty en HuggingFace. Se trata de un checkpoint derivado, no de un modelo original: el autor ha aplicado la herramienta oQ (oMLX v0.7.3) para reducir el peso del modelo base desde su formato original hasta una media efectiva de 5,629 bits por peso, con un almacenamiento total de 15,710 GiB. El modelo resultante conserva 23.971.587.712 parámetros lógicos y está empaquetado en formato MLX, lo que lo orienta a la inferencia en hardware Apple Silicon.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de cuantización mixta que combina capas en 5 bits afín (grupo 64) con una fracción pequeña en 8 bits y BF16, un enfoque que busca preservar la calidad del modelo original reduciendo el coste de memoria. Por otro, advierte de que la información disponible sobre el modelo base es muy limitada: la model card del checkpoint cuantizado no incluye datos sobre arquitectura, contexto, licencia, idiomas ni benchmarks. Todo lo que se detalla a continuación se limita a lo que el autor ha publicado explícitamente.

El checkpoint fue creado el 14 de octubre de 2026 y actualizado el 2 de noviembre de 2026, con 56 descargas y 0 likes en el momento de la consulta. El repositorio ocupa 33,6 GB, aunque el desglose de almacenamiento de los pesos indica 16,868 GB (15,710 GiB), lo que sugiere que el tamaño del repo incluye otros artefactos además de los pesos cuantizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm2_moe (según tag de HuggingFace); detalles no disponibles |
| Parametros totales | 23.971.587.712 (23,972B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afín 5-bit grupo 64 (95,743% de los pesos), afín 8-bit grupo 64 (4,234%), BF16 (0,022%), FP32 (0,000%); media efectiva 5,629 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx) |
| Tamano del repo | 33,6 GB |
| Almacenamiento de pesos | 16,868 GB / 15,710 GiB |
| Herramienta de cuantizacion | oQ (oMLX v0.7.3) |
| Fecha de creacion | 2026-10-14 |
| Ultima actualizacion | 2026-11-02 |

## Arquitectura y entrenamiento

La información disponible no permite describir la arquitectura del modelo base LFM2.5-24B-A2B más allá de la etiqueta `lfm2_moe` que aparece en los tags de HuggingFace, lo que indica una arquitectura de mezcla de expertos (MoE). No se han publicado detalles sobre el número de expertos, el mecanismo de enrutamiento, la dimensión oculta, el número de capas ni el tipo de atención. Tampoco hay datos sobre el proceso de entrenamiento: número de tokens, composición del dataset, uso de RLHF, DPO u otras técnicas de alineación.

Lo que sí está documentado es el proceso de cuantización aplicado por el autor del checkpoint. La herramienta oQ (oMLX v0.7.3) asigna precisiones distintas a distintos tensores: el 95,743% de los pesos lógicos (22,951B) se almacenan en 5 bits afín con grupo de 64, el 4,234% (1,015B) en 8 bits afín con grupo de 64, y una fracción residual (0,005B) se mantiene en BF16. Esta distribución mixta busca concentrar la precisión en las capas más sensibles mientras reduce el coste de almacenamiento del grueso del modelo. El resultado es un checkpoint de 15,710 GiB que, según el autor, equivale a 5,629 bits por peso de media.

No se dispone de información sobre innovaciones técnicas del modelo base como decodificación especulativa, atención lineal o mecanismos híbridos. La model card del checkpoint cuantizado no las menciona.

## Capacidades

- Generación de texto: el modelo base es un modelo de lenguaje de 24B parámetros, por lo que se espera capacidad de generación de texto, aunque no hay documentación específica en la información disponible.
- Razonamiento y matemáticas: no disponible; no se han publicado evaluaciones ni descripciones de capacidades en la model card.
- Generación de código: no disponible; no se menciona soporte específico.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se listan idiomas soportados.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- La única capacidad verificable es la de ser un checkpoint cuantizado ejecutable en MLX, orientado a inferencia en Apple Silicon.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está en formato MLX y ocupa 15,710 GiB de pesos, por lo que puede cargarse en equipos Mac con memoria unificada suficiente (por ejemplo, configuraciones de 32 GB o más) para ejecutar un modelo de 24B parámetros sin GPU dedicada. Es el caso de uso principal y el único documentado explícitamente por el autor.
- Prototipado y experimentación en local: investigadores que quieran evaluar el comportamiento de un MoE de 24B en hardware de consumo Apple pueden usar este checkpoint para pruebas de generación de texto sin depender de infraestructura cloud.
- Evaluación de técnicas de cuantización: el checkpoint sirve como referencia para estudiar el impacto de la cuantización mixta (5-bit con grupo 64 + 8-bit selectivo) en la calidad de un modelo MoE, comparando sus salidas con las del modelo base en BF16.
- Despliegue en entornos con memoria limitada: al reducir el peso a 5,629 bits por peso de media, permite ejecutar un modelo de 24B en configuraciones de memoria que no admitirían el checkpoint original en BF16 (que requeriría aproximadamente 48 GB solo para los pesos).
- Fine-tuning ligero o adaptación con LoRA: aunque no está documentado, el formato safetensors permite cargar los pesos en frameworks MLX para adaptaciones posteriores, siempre que la herramienta soporte el esquema de cuantización afín.
- Docencia y demostraciones: el tamaño manejable en un Mac de gama alta facilita demostraciones en vivo de un modelo MoE de 24B sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del checkpoint cuantizado no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación, ni comparaciones con el modelo base en BF16 o con otras cuantizaciones.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: los pesos cuantizados ocupan 15,710 GiB (16,868 GB). A esto hay que añadir la memoria para el contexto KV y overhead del runtime, por lo que se recomienda un mínimo de 24-32 GB de memoria unificada en Apple Silicon para contextos moderados.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1, M2, M3, M4 y sus variantes Pro/Max/Ultra). No se documenta soporte para GPU NVIDIA o AMD en esta model card.
- ¿Cabe en consumer GPU? En el ecosistema Apple, sí: un Mac con 32 GB o más de memoria unificada puede cargar el modelo. En GPU dedicadas de consumo (RTX 4090 con 24 GB) no hay soporte MLX documentado; sería necesario convertir el checkpoint a otro formato, lo que no está descrito.
- Opciones de despliegue: MLX (librería principal). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible. La herramienta de cuantización oQ/oMLX es el único entorno documentado.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos sobre el modelo base LFM2.5-24B-A2B en BF16 ni sobre otras cuantizaciones del mismo modelo, ni sobre modelos MoE de tamaño comparable. No es posible establecer una comparativa rigurosa con parámetros, contexto, rendimiento y licencia sin datos verificables.

## Limitaciones y advertencias

- Información muy escasa: la model card no documenta arquitectura, contexto, idiomas, licencia ni capacidades. Cualquier uso en producción requiere consultar la documentación del modelo base LFM2.5-24B-A2B, que no está enlazada en la información disponible.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base antes de cualquier despliegue.
- Checkpoint derivado: no es un modelo oficial, sino una cuantización de un tercero (jancirnodziewiaty). La calidad y fidelidad respecto al original no están verificadas con benchmarks.
- Riesgo de degradación por cuantización: aunque la media es 5,629 bits/peso, el 4,234% de los pesos están en 8 bits y el 95,743% en 5 bits. No hay evaluación publicada del impacto en calidad respecto al BF16.
- Sesgos y alucinaciones: no disponibles; no se ha documentado nada al respecto. Se aplican los riesgos habituales de los modelos de lenguaje, pero sin datos específicos.
- Limitaciones de contexto e idioma: no disponibles. No se puede asumir un contexto largo ni un soporte multilingüe amplio.
- Dependencia de MLX: el formato limita el despliegue a hardware Apple Silicon y a la librería MLX. No hay garantía de compatibilidad con otros runtimes sin conversión.
- Actualización reciente: el autor indica que el checkpoint fue recuantizado el 2026-11-02 con oMLX v0.7.3 y recomienda volver a descargarlo si se tenía una copia anterior. Las copias previas pueden diferir en calidad.
- Tamaño del repo (33,6 GB) frente al tamaño de los pesos (16,868 GB): sugiere que el repositorio incluye artefactos adicionales no detallados, lo que puede afectar al espacio en disco necesario.

## Enlaces

- HuggingFace: https://huggingface.co/jancirnodziewiaty/LFM2.5-24B-A2B-oQ5e
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
