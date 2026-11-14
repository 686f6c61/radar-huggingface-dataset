# mradermacher/gemma-4-26B-A4B-agentic-i1-GGUF

## Resumen

`mradermacher/gemma-4-26B-A4B-agentic-i1-GGUF` es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo `ManniX-ITA/gemma-4-26B-A4B-agentic`. Se trata, por tanto, de un artefacto de distribución y compresión de pesos, no de un modelo entrenado desde cero por el autor del repositorio. El modelo base es una variante de la familia Gemma con arquitectura de mezcla de expertos (MoE), como indica el sufijo `A4B` (aproximadamente 4 mil millones de parámetros activos) y los 25.233.142.046 parámetros totales declarados en los safetensors del modelo original.

El propósito del repositorio es ofrecer los pesos en formato GGUF con múltiples niveles de cuantización (desde IQ1_S hasta Q6_K), lo que permite ejecutar el modelo en hardware con recursos limitados mediante llama.cpp y derivados. La etiqueta `agentic` en el nombre sugiere que el modelo base ha sido ajustado para tareas de agentes, aunque la model card no documenta el proceso de ajuste ni los datos utilizados.

La relevancia del repositorio es práctica: facilita el despliegue local de un modelo MoE de ~25B parámetros totales con solo ~4B activos, lo que reduce el coste computacional por token en inferencia. Sin embargo, la información publicada es muy escasa y no se dispone de datos verificables sobre licencia, idiomas, benchmarks ni composición del entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, según el sufijo `A4B` del nombre; detalles no disponibles |
| Parámetros totales | 25.233.142.046 (según safetensors del modelo base) |
| Parámetros activos | ~4B (inferido del sufijo `A4B`; no confirmado en la model card) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones con imatrix/weighted) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base más allá del nombre `gemma-4-26B-A4B-agentic`, que apunta a un transformer con mezcla de expertos de la familia Gemma, con aproximadamente 25B parámetros totales y ~4B activos por token. No se especifican el número de expertos, la estrategia de enrutamiento, la longitud de contexto nativa ni la composición del dataset de entrenamiento.

El repositorio en sí documenta únicamente el proceso de cuantización: cuantizaciones ponderadas con imatrix (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`), generadas a partir del modelo `ManniX-ITA/gemma-4-26B-A4B-agentic`. No hay información sobre RLHF, DPO, ajuste para agentes ni innovaciones técnicas de decodificación. Cualquier detalle adicional sobre el entrenamiento del modelo base debe consultarse en el repositorio original de ManniX-ITA, no en esta ficha.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` figura entre los tags del repositorio.
- Orientación a tareas de agentes: el sufijo `agentic` del modelo base sugiere ajuste para uso en agentes, aunque no se documentan detalles.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que los GGUF pueden servirse mediante endpoints compatibles con llama.cpp.
- Capacidades multilingües: no disponibles.
- Tool calling / function calling: no disponible en la información proporcionada.
- Razonamiento multi-paso: no documentado.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar un MoE de ~25B totales y ~4B activos en GPUs de consumo, con un coste por token mucho menor que un modelo denso del mismo tamaño total.
- Servicio de chat en CPU/GPU híbrido: las variantes Q3_K_M o Q4_0 pueden servirse con llama.cpp en equipos sin GPU dedicada, a costa de cierta pérdida de calidad.
- Prototipado de agentes conversacionales: el ajuste `agentic` del modelo base lo hace candidato para pipelines de agentes, aunque conviene validar el comportamiento real antes de producción.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece una matriz amplia de niveles (IQ1_S a Q6_K), útil para medir la degradación de calidad frente al tamaño en un MoE con expertos poco activos.
- Investigación sobre eficiencia de MoE: al tener ~4B activos sobre ~25B totales, sirve para estudiar el equilibrio entre VRAM ocupada y velocidad de decodificación en entornos con memoria limitada.
- Integración en herramientas de escritorio: al ser GGUF, puede cargarse en Ollama, LM Studio o llama.cpp para asistentes locales sin dependencia de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Como referencia orientativa para ~25B parámetros totales: Q4_K_M en torno a 15-16 GB, Q5_K_M en torno a 18 GB, Q6_K en torno a 21 GB, Q3_K_M en torno a 12 GB e IQ2_M en torno a 9-10 GB. Son estimaciones por tamaño de pesos, no medidas publicadas.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M/Q5_K_M completos en GPU; A100 40/80 GB o H100 para Q6_K y contextos largos; GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) para Q4_K_S o Q3_K_L.
- ¿Cabe en GPU de consumo? Sí, las cuantizaciones Q4 y Q5 caben en GPUs de 16-24 GB; las de gama baja (IQ1/IQ2) caben en 8-12 GB con pérdida de calidad apreciable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de llama.cpp; vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que requerirían los pesos originales en safetensors.
- Latencia y throughput: no disponibles. Al ser un MoE con ~4B activos, se espera una velocidad de decodificación superior a la de un denso de 25B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-4-26B-A4B-agentic (este, vía GGUF) | ~25,2B | ~4B (inferido) | No disponible | No disponible | GGUF |
| Mixtral 8x7B | ~46,7B | ~12,9B | 32k | Apache 2.0 | safetensors, GGUF |
| Qwen1.5-MoE-A2.7B | ~14,3B | ~2,7B | 32k | Apache 2.0 | safetensors, GGUF |
| Gemma 2 27B (denso) | ~27B | ~27B | 8k | Gemma Terms | safetensors, GGUF |

La comparativa es aproximada: no se dispone de datos de contexto, licencia ni benchmarks del modelo de esta ficha, por lo que la comparación se limita a tamaño y formato.

## Limitaciones y advertencias

- Información muy escasa: la model card no documenta licencia, idiomas, contexto ni datos de entrenamiento; no debe asumirse ningún uso comercial permitido sin verificar la licencia del modelo base.
- Repositorio derivado: es una cuantización de un modelo de terceros; los problemas de calidad, sesgos o alucinaciones provienen del modelo base y no se corrigen con la cuantización.
- Degradación por cuantización: las variantes IQ1/IQ2 y Q2_K pueden degradar notablemente el razonamiento y la fidelidad en tareas de agentes; para producción se recomienda Q4_K_M o superior.
- Riesgo de alucinación: no evaluado en la información disponible; todo modelo generativo presenta este riesgo y aquí no hay benchmarks que lo acoten.
- Sesgos: no documentados.
- Sin métricas de rendimiento: no hay benchmarks publicados que permitan comparar con alternativas.
- Fecha de creación futura en los metadatos (2026-11-13): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-4-26B-A4B-agentic-i1-GGUF
- Modelo base: https://huggingface.co/ManniX-ITA/gemma-4-26B-A4B-agentic
