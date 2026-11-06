# mradermacher/Vexel-Catalyst-1.5B-v1-GGUF

## Resumen

Vexel-Catalyst-1.5B-v1 es un modelo de lenguaje de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) desarrollado por VexelQuant y orientado al dominio financiero y de criptomonedas. Según las etiquetas de la model card, el modelo se ha afinado mediante GRPO (Group Relative Policy Optimization) sobre una base no especificada, empleando herramientas del ecosistema Unsloth para el entrenamiento. La model card lo etiqueta explícitamente como `financial-nlp`, `crypto` y `quant`, lo que sugiere un enfoque en análisis de mercados, activos digitales y razonamiento cuantitativo.

La ficha que nos ocupa corresponde a la versión cuantizada en formato GGUF publicada por mradermacher, un conocido distribuidor de cuantizaciones estáticas para llama.cpp y derivados. El repositorio incluye once variantes de cuantización que van desde Q2_K (0,8 GB) hasta f16 (3,2 GB), lo que permite desplegar el modelo en hardware muy modesto, incluidas GPUs de consumo e incluso CPU.

La relevancia de esta publicación es doble: por un lado, ofrece una vía de acceso práctica a un modelo de nicho financiero en formatos ligeros; por otro, la información pública disponible es muy limitada (cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni detalles de contexto o dataset de entrenamiento), por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, no confirmado en la información) |
| Parámetros totales | 1.543.714.304 (datos de safetensors) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base VexelQuant/Vexel-Catalyst-1.5B-v1. Las etiquetas de la model card indican que se ha empleado GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo con preferencias que se popularizó con modelos de razonamiento como DeepSeek-R1 y que optimiza la política comparando grupos de respuestas generadas para una misma consulta. También aparece la etiqueta `unsloth`, lo que apunta a que el ajuste fino se realizó con esta librería de entrenamiento eficiente en memoria.

No se especifican el número de tokens de entrenamiento, la composición del dataset, si hubo fases de SFT previas al GRPO ni detalles sobre la inicialización del modelo base. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas. La información disponible se limita a la model card del repositorio GGUF, que es una cuantización estática del modelo original y no incluye documentación técnica adicional.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Enfoque declarado en NLP financiero (`financial-nlp`), criptomonedas (`crypto`) y análisis cuantitativo (`quant`), aunque no se detallan las tareas concretas para las que fue entrenado.
- Afinado mediante GRPO, lo que en principio favorece respuestas razonadas o alineadas con preferencias, si bien no se aportan ejemplos ni evaluaciones que lo confirmen.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información.

## Casos de uso

- Análisis exploratorio de sentimiento en noticias cripto: el modelo puede procesar titulares y textos breves en inglés sobre activos digitales y generar resúmenes o clasificaciones preliminares, aprovechando su ajuste declarado en el dominio `crypto`. Su tamaño reducido permite ejecutarlo en local sin enviar datos sensibles a la nube.
- Asistente conversacional especializado en finanzas para prototipos: dado su etiquetado `financial-nlp` y `conversational`, sirve para construir demos de chat que respondan a preguntas sobre conceptos de mercados o vocabulario cuantitativo, siempre con validación humana.
- Generación de explicaciones educativas sobre métricas financieras: el modelo puede redactar definiciones y ejemplos de indicadores como volatilidad, drawdown o ratio de Sharpe en inglés, útil en materiales de formación internos.
- Clasificación y etiquetado de documentos financieros: con 1,5B parámetros y cuantización Q4_K_M de 1,1 GB, puede desplegarse en pipelines de procesamiento por lotes para etiquetar textos según categorías predefinidas (noticias, informes, tuits), a un coste computacional muy bajo.
- Experimentación académica con GRPO: al estar afinado con esta técnica y publicarse bajo Apache 2.0, resulta útil como caso de estudio para investigadores que quieran analizar el comportamiento de modelos pequeños alineados por refuerzo en dominios especializados.
- Inferencia en el borde o en CPU: las cuantizaciones Q2_K (0,8 GB) y Q4_K_S (1,0 GB) permiten ejecutar el modelo en portátiles sin GPU dedicada mediante llama.cpp u Ollama, habilitando asistentes financieros offline para entornos con conectividad limitada.
- Filtrado de spam o contenido irrelevante en foros de inversión: el modelo puede clasificar mensajes en inglés y descartar los que no aportan información financiera, integrándose en un pipeline de moderación de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para Q4_K_M (1,1 GB de fichero), 1,7 GB para Q8_0, 3,2 GB para f16. Hay que sumar el espacio para el contexto KV cache, que depende de la longitud de contexto (no documentada).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar las cuantizaciones Q4; una RTX 3060, RTX 4060 o superior permite cargar Q8_0 o f16 con holgura. En el extremo profesional, A100 o H100 no son necesarias para este tamaño, pero pueden usarse para servir muchas instancias en paralelo.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más de VRAM; las variantes Q2_K y Q4_K_S funcionan incluso en iGPU y en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF. Para el modelo base en safetensors, transformers con aceleración por hardware.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño (1,5B) y las cuantizaciones de 1 GB, se espera una latencia baja en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vexel-Catalyst-1.5B-v1 (GGUF) | 1,54B | no disponible | Apache 2.0 | GGUF | Afinado con GRPO, dominio financiero/cripto, solo inglés |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo generalista multilingüe con amplia adopción y benchmarks publicados |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens (según documentación pública de Meta) | Llama 3.2 Community License | safetensors, GGUF | Modelo generalista, licencia con restricciones de uso comercial para grandes entidades |
| SmolLM2-1.7B-Instruct | 1,71B | 8.192 tokens (según documentación pública de Hugging Face) | Apache 2.0 | safetensors, GGUF | Modelo pequeño generalista con benchmarks publicados |

La comparación debe tomarse con cautela: los datos de contexto y licencia de las alternativas provienen de su documentación pública, mientras que para Vexel-Catalyst no se dispone de esa información. La principal diferencia es la especialización declarada en finanzas y cripto, frente al carácter generalista de las alternativas, que además cuentan con evaluaciones reproducibles.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, razonamiento o precisión en tareas financieras.
- Riesgo elevado de alucinación en un dominio sensible como el financiero; no debe usarse para asesoramiento de inversión sin supervisión humana.
- Idiomas: solo inglés declarado; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Longitud de contexto desconocida: limita el diseño de aplicaciones que requieran documentos largos.
- Modelo de 1,5B parámetros: capacidad de razonamiento y conocimiento factual limitados en comparación con modelos de mayor tamaño.
- Sesgos: no documentados, pero probables en un modelo entrenado con datos de internet y afinado en un nicho concreto; sin evaluación de sesgos publicada.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad sobre el cumplimiento normativo (por ejemplo, normativa financiera o de protección de datos).
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria ni informes de uso en producción.
- Las cuantizaciones Q2_K y Q3_K_M pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso serio.
- No se especifica si el modelo base tiene restricciones adicionales más allá de la licencia declarada; conviene revisar el repositorio original VexelQuant/Vexel-Catalyst-1.5B-v1.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Vexel-Catalyst-1.5B-v1-GGUF
- Modelo base: https://huggingface.co/VexelQuant/Vexel-Catalyst-1.5B-v1
- Página de descargas del cuantizador: https://hf.tst.eu/model#Vexel-Catalyst-1.5B-v1-GGUF
- Guía de uso de GGUF (TheBloke, referencia): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
