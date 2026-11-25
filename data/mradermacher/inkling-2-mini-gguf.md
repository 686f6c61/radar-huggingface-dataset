# mradermacher/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini es un modelo de lenguaje conversacional desarrollado por Thinking Machines, distribuido en formato GGUF por el usuario mradermacher. El repositorio que nos ocupa contiene únicamente las cuantizaciones estáticas del modelo original, no el modelo base, y cuenta con 26.070.385.152 parámetros totales según los pesos en safetensors del modelo de referencia. La información pública disponible sobre arquitectura, entrenamiento y capacidades es muy limitada: la model card del repositorio GGUF se reduce a metadatos de conversión y a la lista de cuantizaciones generadas.

El interés de esta ficha radica en documentar con rigor lo que sí se puede verificar (tamaño, cuantizaciones disponibles, formato y origen) y marcar explícitamente como "no disponible" todo aquello que no aparece en la información proporcionada. El repositorio tiene un tamaño de 190,5 GB, coherente con un modelo de ~26B parámetros cuantizado en múltiples variantes, incluidas f16 y Q8_0, que son las que aportan más peso al conjunto.

Es relevante ahora porque los GGUF de modelos conversacionales de tamaño medio-grande son el formato de facto para despliegue local con llama.cpp y Ollama, y porque el modelo original procede de Thinking Machines, un laboratorio del que no se han publicado en esta información detalles técnicos verificables. Cualquier evaluación de producción debería remitirse al repositorio original antes de adoptar el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.070.385.152 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo original se distribuye aparte |

## Arquitectura y entrenamiento

No se ha publicado en la información disponible ningún detalle sobre la arquitectura del modelo base (si es un transformer denso, MoE, híbrido o SSM), ni sobre el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO. La model card del repositorio GGUF no incluye estos datos; solo contiene metadatos de la herramienta de conversión (`convert_type: hf`, `quantize_version: 2`, `output_tensor_quantised: 1`) y la lista de cuantizaciones generadas.

Lo único verificable a nivel técnico es el proceso de cuantización: se han generado variantes estáticas desde el modelo original en Hugging Face (thinkingmachines/Inkling-2-Mini), con el conjunto habitual de llama.cpp para modelos de este tamaño (desde Q2_K hasta Q8_0, más f16 e IQ4_XS). No se indica si se ha omitido el proyector multimodal (`skip_mmproj` está vacío), por lo que no se puede confirmar ni descartar que el modelo base tenga capacidades de visión.

## Capacidades

- Generación de texto conversacional: el tag `conversational` del repositorio sugiere un modelo ajustado para diálogo multi-turno, aunque no se detallan las capacidades concretas.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que el formato GGUF es desplegable en infraestructuras de inferencia compatibles con llama.cpp.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Despliegue local en estación de trabajo: con 26B parámetros, las variantes Q4_K_M o Q5_K_M permiten ejecutar el modelo en una GPU consumer de 24 GB (RTX 3090/4090) o en configuraciones CPU+GPU con llama.cpp, útil para prototipado de asistentes conversacionales sin depender de la nube.
- Servicio de chat autoalojado: el formato GGUF y el tag `endpoints_compatible` permiten servirlo con llama.cpp server u Ollama detrás de una API compatible con OpenAI, adecuado para equipos que necesitan confidencialidad de datos en conversaciones internas.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes, lo que permite medir la degradación de calidad entre Q2_K y Q8_0 en tareas de diálogo y elegir el compromiso tamaño/calidad para un hardware concreto.
- Inferencia en CPU para entornos sin GPU: las variantes Q3_K_S y Q4_K_S reducen el peso a un rango manejable en RAM de servidor, permitiendo desplegar el modelo en máquinas sin acelerador para cargas de baja concurrencia.
- Base para fine-tuning posterior: al ser un modelo de 26B con pesos en safetensors en el repositorio original, puede servir como punto de partida para ajuste supervisado en dominios específicos, siempre que la licencia (no disponible) lo permita.
- Integración en pipelines de CI para pruebas de regresión conversacional: usar la variante Q8_0 como referencia cercana al modelo original y las variantes pequeñas para pruebas rápidas en cada commit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 52 GB en f16 (26B × 2 bytes), ~28 GB en Q8_0, ~16-18 GB en Q4_K_M, ~11-12 GB en Q3_K_M y ~9-10 GB en Q2_K. Son estimaciones basadas en el número de parámetros; no se dispone de mediciones publicadas para este modelo.
- GPU recomendadas: A100 80 GB o H100 para f16 y Q8_0 con contexto largo; RTX 4090/3090 (24 GB) para Q4_K_M y Q5_K_M; GPUs de 16 GB solo con cuantizaciones Q3 o inferiores y contexto reducido.
- Cabe en GPU consumer: sí, en RTX 4090/3090 con Q4_K_M o Q5_K_M; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) con Q3_K_M o Q4_K_S y ventanas de contexto moderadas.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que requerirían los pesos originales en safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini (este repo) | 26,07B | no disponible | no disponible | GGUF | Cuantizaciones estáticas de 12 variantes |
| Modelo base Inkling-2-Mini | 26,07B | no disponible | no disponible | safetensors (repo original) | Punto de partida de las cuantizaciones |
| Alternativas de ~27B | no disponible | no disponible | no disponible | no disponible | No se dispone de información verificable de modelos comparables en esta ficha |

No se dispone de datos de rendimiento ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia total de información sobre licencia: no se puede confirmar si el uso comercial está permitido; es imprescindible consultar el repositorio original antes de cualquier despliegue en producción.
- No se documentan sesgos conocidos, pero al no haber información sobre el dataset de entrenamiento no es posible evaluar riesgos de sesgo demográfico, cultural o lingüístico.
- Riesgo de alucinación: inherente a los modelos generativos; sin benchmarks publicados no se puede acotar su magnitud en este modelo.
- Idiomas no especificados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés (si el modelo base está orientado a inglés, como es habitual).
- Longitud de contexto desconocida: limita la planificación de cargas con documentos largos o conversaciones extensas.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad conversacional; se recomienda validar con evaluaciones propias antes de usarlas en producción.
- El repositorio es una conversión de terceros (mradermacher), no oficial; la integridad y fidelidad de la cuantización respecto al modelo original no está verificada por el autor del modelo.
- El tag `endpoints_compatible` no garantiza compatibilidad con todas las plataformas de inferencia; conviene probar el formato en el entorno objetivo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Inkling-2-Mini-GGUF
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
