# mradermacher/ting-9b-GGUF

## Resumen

Ting-9b es un modelo de lenguaje de 9.094.607.872 parámetros (aproximadamente 9B) desarrollado por birgermoell en el marco de la iniciativa OpenEuroLLM, con el sello de "research preview" y orientación explícita hacia razonamiento, uso de herramientas y function calling. La versión aquí documentada es una cuantización estática en formato GGUF producida por mradermacher a partir del modelo base `birgermoell/ting-9b`, publicada bajo licencia Apache 2.0. El modelo se distribuye con etiquetas que lo sitúan en el ecosistema sueco ("swedish") y multilingüe europeo, con soporte declarado para quince idiomas.

El interés de esta ficha radica en que combina un tamaño contenido (9B) con capacidades de tool use y razonamiento, lo que lo hace candidato a despliegues locales y a entornos con restricciones de hardware. Al estar cuantizado en GGUF, puede ejecutarse con llama.cpp y derivados (Ollama, LM Studio, etc.), lo que reduce la barrera de entrada frente a pesos en precisión completa.

No obstante, la información pública disponible es escasa: la model card del repositorio de cuantización no incluye detalles sobre arquitectura interna, composición del dataset de entrenamiento, número de tokens vistos ni resultados de benchmarks. Esta ficha refleja únicamente los datos verificables y marca explícitamente como "no disponible" todo aquello que no puede confirmarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, sin detalle publicado) |
| Parametros totales | 9.094.607.872 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | sv, en, de, fr, es, it, pt, nl, da, fi, pl, cs, el, uk, ro |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo base `birgermoell/ting-9b`. Por el recuento de parámetros (9.094.607.872) y el pipeline declarado (`transformers`), se trata de un modelo de lenguaje de aproximadamente 9B parámetros, presumiblemente basado en una arquitectura transformer decoder-only, aunque no se confirma la familia concreta ni si incorpora innovaciones como atención lineal, decodificación especulativa o mezcla de expertos. Las etiquetas del repositorio indican que el modelo ha sido entrenado con objetivos de razonamiento, tool use y function calling, y que forma parte del proyecto OpenEuroLLM con orientación multilingüe europea, con el sueco como idioma de referencia.

Tampoco se dispone de datos sobre el número de tokens de entrenamiento, la composición del corpus, la existencia de fases de RLHF, DPO o RLVR, ni sobre la estrategia de alineación empleada. La model card del repositorio de cuantización es puramente operativa: describe los ficheros GGUF generados, sus tamaños y recomendaciones de uso, sin entrar en detalles del entrenamiento. Cualquier afirmación sobre estas cuestiones sería especulativa y, por tanto, se omite.

## Capacidades

- Generación de texto conversacional en quince idiomas europeos, con especial énfasis en sueco e inglés según las etiquetas del repositorio.
- Razonamiento de múltiples pasos, indicado por la etiqueta `reasoning` y el carácter de "research preview".
- Uso de herramientas y function calling, reflejado en las etiquetas `tool-use` y `function-calling`.
- Integración en flujos agénticos, aunque sin documentación pública sobre el formato exacto de las llamadas a herramientas.
- Capacidad multilingüe amplia: sueco, inglés, alemán, francés, español, italiano, portugués, neerlandés, danés, finés, polaco, checo, griego, ucraniano y rumano.
- No se ha confirmado soporte de visión, audio ni modos de "thinking" explícitos más allá de la etiqueta de razonamiento.

## Casos de uso

- Asistentes conversacionales multilingües en atención al cliente: el modelo cubre quince idiomas europeos, lo que permite atender a usuarios en su lengua sin cambiar de modelo; su tamaño de 9B facilita el despliegue en infraestructura propia con cuantización Q4_K_M (5,8 GB).
- Automatización de tareas con herramientas en entornos corporativos: gracias a las capacidades de function calling, puede conectarse a APIs internas (CRM, ticketing, calendarios) y ejecutar acciones encadenadas en un pipeline agéntico.
- Razonamiento asistido en documentación técnica: para resumir, clasificar o extraer información de documentos en varios idiomas europeos, con la ventaja de que el modelo puede ejecutarse localmente y mantener los datos dentro de la organización.
- Prototipado rápido en investigación: al ser un "research preview" con licencia Apache 2.0, es adecuado para experimentar con técnicas de razonamiento y tool use sin las restricciones de licencias copyleft.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_S y Q4_K_M (5,5 y 5,8 GB) caben en GPUs de 8 GB de VRAM, lo que permite usar el modelo en estaciones de trabajo con RTX 3060/4060 o superiores.
- Generación de código y tareas de desarrollo asistido: aunque no hay benchmarks públicos que lo confirmen, la orientación a razonamiento y tool use sugiere su uso en asistentes de programación que invocan herramientas (linters, compiladores, APIs) en lugar de limitarse a generar texto.
- Traducción y localización entre lenguas europeas: el conjunto de idiomas declarado cubre buena parte de la UE, lo que lo hace útil para pre-traducción y revisión en flujos de localización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~3,9 GB; Q3_K_S ~4,4 GB; Q3_K_M ~4,8 GB; Q3_K_L ~5,1 GB; IQ4_XS ~5,3 GB; Q4_K_S ~5,5 GB; Q4_K_M ~5,8 GB; Q5_K_S ~6,5 GB; Q5_K_M ~6,6 GB; Q6_K ~7,6 GB; Q8_0 ~9,8 GB; f16 ~18,3 GB.
- GPU recomendadas: para Q4_K_M basta una GPU con 8 GB de VRAM (RTX 3060 Ti, RTX 4060, RTX 3070); para Q8_0 se recomienda 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090); para f16 se necesita una GPU de 24 GB o más (RTX 4090, A100 40 GB, H100).
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta Q6_K con GPUs de 8-12 GB; Q8_0 requiere 12 GB o más; f16 requiere 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo base en transformers/safetensors puede servirse con vLLM o TGI, aunque no se documenta en la información disponible.
- Latencia y throughput estimados: no disponibles; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría (modelos de ~9B parámetros con capacidades de tool use y multilingües). La información pública del repositorio se limita a la cuantización y no incluye métricas comparativas. Por tanto, la comparativa se marca como no disponible.

## Limitaciones y advertencias

- Ausencia de benchmarks públicos: no hay datos verificables sobre MMLU, HumanEval, GSM8K ni otras métricas, lo que impide evaluar su calidad relativa frente a alternativas.
- Modelo en fase "research preview": no está pensado para producción crítica sin una evaluación previa propia; puede presentar inestabilidad en tareas complejas.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa con aparente seguridad, especialmente en dominios especializados.
- Sesgos: no se ha publicado información sobre la composición del dataset ni sobre auditorías de sesgo; es probable que herede sesgos de los datos de entrenamiento, con posible sobrerrepresentación del sueco y del inglés.
- Idiomas: aunque se declaran quince idiomas, el rendimiento puede variar notablemente entre ellos; el sueco y el inglés son los idiomas de referencia del proyecto.
- Contexto: se desconoce la longitud máxima de contexto, lo que limita la planificación de aplicaciones que dependan de ventanas largas.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, pero conviene verificar las condiciones del modelo base por si hubiera restricciones adicionales no reflejadas en la información disponible.
- Formato GGUF: las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; se recomienda Q4_K_M o superior para uso serio.

## Enlaces

- Repositorio de cuantización en Hugging Face: https://huggingface.co/mradermacher/ting-9b-GGUF
- Modelo base: https://huggingface.co/birgermoell/ting-9b
- Página de descarga del autor de las cuantizaciones: https://hf.tst.eu/model#ting-9b-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (empresa que apoya al autor de las cuantizaciones): https://www.nethype.de/
