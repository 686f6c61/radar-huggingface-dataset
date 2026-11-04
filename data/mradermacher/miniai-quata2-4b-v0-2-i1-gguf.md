# mradermacher/MiniAI-Quata2-4b-v0.2-i1-GGUF

## Resumen

MiniAI-Quata2-4b-v0.2-i1-GGUF es una colección de cuantizaciones en formato GGUF del modelo MiniAI-Quata2-4b-v0.2, publicada por el usuario mradermacher, conocido en la comunidad por generar versiones cuantizadas de modelos open source para su uso con llama.cpp y herramientas compatibles. El repositorio no incluye model card descriptiva más allá de los metadatos de la herramienta de cuantización, por lo que la información sobre arquitectura, entrenamiento y capacidades del modelo original es muy limitada.

El modelo base, MiniAI-Quata2-4b-v0.2, está alojado en el repositorio M1n1A1/MiniAI-Quata2-4b-v0.2. Por la nomenclatura se infiere que se trata de un modelo de aproximadamente 4.000 millones de parámetros, pero el dato de parámetros totales reportado en el repositorio de cuantizaciones (1.797.272) es anómalo y no es coherente con un modelo de ese tamaño, lo que sugiere que la información de metadatos del repo es incompleta o errónea.

La relevancia de esta ficha radica en documentar la existencia de las cuantizaciones y las opciones disponibles, si bien la ausencia de documentación del modelo original limita cualquier evaluación rigurosa. Se recomienda consultar el repositorio del modelo base para obtener datos verificables sobre arquitectura, entrenamiento y licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer por el formato GGUF, sin confirmar) |
| Parametros totales | 1.797.272 según metadatos del repo (dato inconsistente con la nomenclatura "4b"); el modelo base se denomina "4b", lo que sugiere ~4.000 millones, pero no está confirmado |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_M, IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small-IQ4_NL), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones derivadas de safetensors del modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base MiniAI-Quata2-4b-v0.2. El repositorio de cuantizaciones únicamente documenta, mediante comentarios internos de la herramienta de conversión, que se han generado cuantizaciones ponderadas (weighted) y con matriz de importancia (imatrix) a partir del modelo original en formato Hugging Face (convert_type: hf). No hay datos sobre número de tokens de entrenamiento, composición del dataset, fases de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal.

La única información técnica fiable es el proceso de cuantización: se han producido 24 variantes GGUF que cubren desde cuantizaciones de 1 bit (IQ1_S, IQ1_M) hasta 6 bits (Q6_K), incluyendo las familias K-quant e I-quant de llama.cpp. El uso de imatrix sugiere que el autor aplicó calibración para preservar la calidad en cuantizaciones agresivas, aunque no se detalla el dataset de calibración.

## Capacidades

- Generación de texto: capacidad esperada por tratarse de un modelo de lenguaje, aunque no confirmada documentalmente.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Despliegue en hardware de gama baja: las cuantizaciones IQ1_S, IQ1_M e IQ2_XXS permiten ejecutar el modelo en entornos con muy poca memoria, aunque con pérdida de calidad significativa; útiles para pruebas de concepto en dispositivos embebidos o CPUs modestas.
- Inferencia en CPU con llama.cpp: las variantes Q4_K_M y Q5_K_M son las opciones equilibradas habituales para ejecución en CPU sin GPU dedicada, aprovechando el soporte nativo de GGUF en llama.cpp.
- Integración en Ollama: al ser GGUF, las cuantizaciones pueden importarse en Ollama mediante un Modelfile, lo que facilita prototipado rápido de asistentes conversacionales locales.
- Evaluación comparativa de cuantizaciones: el amplio conjunto de 24 variantes permite medir la degradación de calidad entre niveles de bits, útil para investigación sobre cuantización extrema.
- Experimentación académica con modelos pequeños: si se confirma el tamaño de ~4B, encaja en proyectos de investigación que necesitan un modelo local de bajo coste para ablaciones.
- Pruebas de pipelines de generación de texto offline: para entornos sin conectividad o con requisitos de privacidad, el formato GGUF permite ejecución completamente local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma fiable, dado que el dato de parámetros del repo es inconsistente. Si el modelo base es de ~4B parámetros, las cuantizaciones Q4_K_M ocuparían aproximadamente 2,5-3 GB y Q6_K en torno a 3,5-4 GB; las IQ1/IQ2 estarían por debajo de 1,5-2 GB. Estas cifras son estimaciones basadas en el tamaño nominal "4b", no en datos confirmados.
- GPU recomendadas: no disponible. Para un modelo de ~4B en Q4_K_M bastaría una GPU consumer con 6-8 GB de VRAM (RTX 3060, RTX 4060), pero no hay confirmación oficial.
- Cabida en GPU consumer: probable para cuantizaciones bajas si el tamaño real es ~4B; no confirmado.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). vLLM y TGI no son compatibles de forma nativa con GGUF en todas sus versiones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información verificable sobre el modelo base ni sobre alternativas comparables de la misma categoría, por lo que no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- La model card del repositorio no contiene documentación sustantiva: no hay información sobre arquitectura, datos de entrenamiento, licencia ni idiomas.
- El dato de parámetros totales reportado (1.797.272) es inconsistente con la nomenclatura "4b" y con el tamaño típico de un modelo de ese nombre; no debe tomarse como fiable.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La licencia es desconocida, lo que impide determinar si el uso comercial está permitido; es imprescindible consultar el repositorio del modelo base antes de cualquier uso en producción.
- Las cuantizaciones de 1 y 2 bits (IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS) degradan notablemente la calidad y no son recomendables para tareas que requieran precisión.
- Riesgo de alucinación y sesgos: no evaluable sin documentación del modelo base.
- No se ha verificado la integridad de las cuantizaciones ni su correspondencia exacta con el modelo original.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/MiniAI-Quata2-4b-v0.2-i1-GGUF
- Modelo base: https://huggingface.co/M1n1A1/MiniAI-Quata2-4b-v0.2
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
