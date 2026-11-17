# mradermacher/Kataguru-Polyglot-264E-35B-A3B-i1-GGUF

## Resumen

Kataguru-Polyglot-264E-35B-A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) publicado por el usuario kataguru y cuantizado en formato GGUF por mradermacher. Con 36.537.721.984 parametros totales según los pesos en safetensors, la nomenclatura indica 35B de parametros totales y 3B activos por token, junto con 264 expertos enrutables. El modelo base está pensado para uso conversacional y multilingüe, a juzgar por el sufijo "Polyglot" y la etiqueta "conversational".

La relevancia de esta ficha radica en que el repositorio es exclusivamente una distribución de cuantizaciones GGUF generadas con pesos ponderados/imatrix a partir del modelo original, lo que permite ejecutar un MoE de 35B en hardware de consumo siempre que se disponga de suficiente memoria. El repositorio ocupa 30,3 GB e incluye un conjunto amplio de niveles de cuantización, desde IQ1_S hasta Q6_K.

No se dispone de model card técnica del autor original en la información proporcionada: no hay datos sobre arquitectura interna, composición del dataset de entrenamiento, número de tokens, proceso de alineación ni resultados de benchmarks. Todo lo que sigue se limita a lo verificable en los metadatos y en la model card del cuantizador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer; detalles internos no disponibles |
| Parametros totales | 36.537.721.984 (≈36,5B; la nomenclatura indica 35B) |
| Parametros activos | 3B por token (según nomenclatura A3B); no confirmado en documentación |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL |
| Idiomas soportados | no disponible (la nomenclatura "Polyglot" sugiere multilingüe) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo original se distribuye presumiblemente en safetensors |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos con 264 expertos y aproximadamente 36,5B de parámetros totales, de los cuales se activarían unos 3B por token según la convención de nombres. Esta configuración busca desacoplar capacidad (parámetros totales) de coste de inferencia (parámetros activos), de modo que el modelo pueda almacenarse con una huella grande pero ejecutarse con un coste computacional por token comparable a un modelo denso de 3B.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO, la estrategia de enrutamiento, el mecanismo de atención ni innovaciones técnicas concretas. Las cuantizaciones de este repositorio se generaron con el método i1 de mradermacher, que emplea una matriz de importancia (imatrix) calculada sobre un corpus de calibración para ponderar la cuantización de los tensores; la model card indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, conversión desde pesos Hugging Face.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el pipeline asociado indican uso previsto para diálogo multi-turno.
- Multilingüismo: el nombre "Polyglot" sugiere cobertura de varios idiomas, aunque no se especifica cuáles ni el nivel de competencia.
- Razonamiento y código: no disponible; no hay documentación que confirme capacidades específicas de razonamiento, matemáticas o generación de código.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que el GGUF puede servirse a través de infraestructura compatible con la API de Hugging Face.

## Casos de uso

- Despliegue local de un MoE grande en hardware de consumo: con cuantizaciones Q4_K_M o IQ4_XS, el modelo puede ejecutarse en una GPU con 24 GB de VRAM o en configuraciones CPU+GPU mediante llama.cpp, aprovechando que solo se activan ~3B parámetros por token para mantener una velocidad de generación aceptable.
- Prototipado de asistentes conversacionales multilingües: el tag `conversational` y el nombre "Polyglot" lo hacen candidato para experimentar con diálogo en varios idiomas antes de comprometerse con un modelo mayor; la ausencia de benchmarks obliga a evaluar la calidad empíricamente.
- Servicio de inferencia con vLLM o TGI: el formato GGUF es compatible con llama.cpp y con backends que aceptan GGUF; para vLLM sería necesario convertir a safetensors o usar el modelo original, ya que vLLM no consume GGUF de forma nativa en todas sus versiones.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece más de veinte niveles de cuantización, lo que permite medir la degradación de calidad frente al coste de memoria en un mismo modelo, un caso útil para investigación sobre cuantización extrema (IQ1, IQ2).
- Fine-tuning ligero sobre la base original: si se dispone del modelo en safetensors, se puede aplicar LoRA/QLoRA y luego recuantizar; el GGUF de este repositorio sirve como referencia de calidad para comparar el resultado.
- Investigación sobre enrutamiento MoE: al ser un modelo con 264 expertos y solo 3B activos, es un sujeto de estudio para analizar cómo se distribuye la carga entre expertos y cómo afecta la cuantización al enrutamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: depende de la cuantización. Para Q4_K_M, el archivo ronda los 20-22 GB (estimación a partir de 36,5B parámetros y ~4,5 bits por peso); para Q2_K, en torno a 12-13 GB; para Q6_K, cerca de 28-30 GB. Estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o inferiores; A100 40/80 GB o H100 para cuantizaciones altas o para servir el modelo original en precisión completa (aproximadamente 73 GB en FP16).
- ¿Cabe en GPU de consumo? Sí, en RTX 3090/4090 (24 GB) con cuantizaciones Q4 o inferiores; en GPUs de 16 GB solo con Q2/IQ2, con degradación de calidad esperable.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y servidores compatibles con la API de Hugging Face (tag `endpoints_compatible`). vLLM requeriría el modelo en safetensors.
- Latencia y throughput: no disponibles. Al activar solo ~3B parámetros por token, el throughput debería ser superior al de un denso de 35B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Kataguru-Polyglot-264E-35B-A3B (esta ficha) | ≈36,5B | ≈3B (según nomenclatura) | no disponible | no disponible | GGUF (i1) |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 | safetensors, GGUF |
| Qwen1.5-MoE-A2.7B | 14,3B | 2,7B | 32K | Apache 2.0 | safetensors, GGUF |
| DeepSeek-V2-Lite | 15,7B | 2,4B | 32K | MIT (código) / modelo con restricciones | safetensors |

La comparación es aproximada: no hay datos de rendimiento del modelo de esta ficha, por lo que solo se contrastan parámetros, contexto y licencia. Los tres alternativos tienen contextos y licencias documentados, mientras que para Kataguru-Polyglot esos datos no están disponibles.

## Limitaciones y advertencias

- Ausencia total de model card técnica: no se documentan datos de entrenamiento, sesgos, alineación ni evaluación, lo que impide valorar su calidad de forma informada.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es un riesgo legal para producción.
- Idiomas no especificados: el nombre "Polyglot" no garantiza competencia en castellano ni en otros idiomas concretos.
- Riesgo de alucinación: sin datos de alineación (RLHF/DPO) no se puede estimar la tasa de alucinación; en un modelo conversacional sin evaluación publicada, el riesgo es alto.
- Cuantizaciones extremas (IQ1, IQ2): la degradación de calidad puede ser severa; no se han publicado comparativas de perplejidad entre niveles.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en la comunidad ni de validación independiente.
- El tag `nicoboss` en la model card sugiere un origen o herramienta de cuantización concreta, pero no aporta garantías sobre el modelo base.
- Conversión desde Hugging Face: posibles diferencias de comportamiento entre el GGUF y el modelo original no documentadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Kataguru-Polyglot-264E-35B-A3B-i1-GGUF
- Modelo original: https://huggingface.co/kataguru/Kataguru-Polyglot-264E-35B-A3B
- Perfil del cuantizador: https://huggingface.co/mradermacher
