# FamilyOrang/Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo experimental de pesos abiertos publicado por FamilyOrang bajo la licencia Qwen Community 1.0, concebido como avance de la arquitectura que sustentará la futura familia Qwen4. Se trata de un modelo causal multimodal (texto e imagen) de tipo Mixture-of-Experts con atención híbrida, disenado para cargas agénticas de contexto largo. Su relevancia radica en que introduce varias innovaciones arquitectónicas (Qwen Sparse Attention a nivel de micro-bloque, Gated Residual, N-gram Embedding y un recetario de entrenamiento con Muon/AdamW) orientadas a reducir la latencia en contextos extensos sin sacrificar calidad.

El modelo combina 125.000 millones de parámetros activables con 6.000 millones activos por token, más 51.000 millones en embeddings n-gram y 4.000 millones en un módulo MTP (Multi-Token Prediction). El total reportado en safetensors asciende a 179.999.981.459 parámetros. Soporta de forma nativa 262.144 tokens de contexto, extensible hasta 1.000.000, y está pensado tanto para despliegue local con Transformers, vLLM, SGLang o TokenSpeed como para consumo mediante la API gestionada Qwen Cloud.

Al tratarse de una preview experimental con cero descargas y cero likes en el momento de la consulta, debe tratarse como material de evaluación temprana más que como un modelo listo para producción sin validación adicional. La model card no detalla la composición del dataset de entrenamiento ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM multimodal con vision encoder; MoE con atención híbrida (Gated DeltaNet + Qwen Sparse Attention), Gated Residual y N-gram Embedding |
| Parametros totales | 179.999.981.459 (125B LM + 51B n-gram embedding + 4B MTP) |
| Parametros activos | 6B por token (10 expertos enrutados + 1 compartido de 512) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible (solo se confirman pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other") |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con encoder de visión y capas MoE intercaladas. El layout oculto es 12 × (3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE)), con 48 capas totales, dimensión oculta de 2560 y vocabulario de 248.320 tokens (padded). Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128. Qwen Sparse Attention usa 24 cabezas Q y 2 KV, dimensión de cabeza 256, RoPE de 64 dimensiones, un indexador MQA con 4 cabezas de query y 1 cabeza de clave compartida (dimensión 128), y un presupuesto de 512 bloques o 2048 tokens. El MoE cuenta con 512 expertos, de los que se activan 10 enrutados más 1 compartido, con dimensión intermedia de 640. Gated Residual opera con 4 ramas y rango de cuello de botella 320. El módulo MTP es una capa entrenada con múltiples pasos.

Las innovaciones destacadas son: QSA, que selecciona a nivel de micro-bloque en lugar de token individual para reducir la latencia en contexto largo; Gated Residual, que modula el flujo de información con una compuerta de lectura dependiente de datos y una compuerta escalar de escritura por rama; N-gram Embedding, que escala parámetros con menos cómputo y es más apto para offloading que MoE (20.000.000 de bigramas/trigramas en la capa 2); y un recetario de entrenamiento que aplica Muon y AdamW a categorías específicas de pesos, elimina el warmup de batch size y arranca directamente en el tamaño objetivo. El modelo pasa por pre-entrenamiento y post-entrenamiento, aunque la model card no detalla el número de tokens, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline image-text-to-text) gracias al vision encoder.
- Codigo y matematicas: capacidades estándar de un LLM de su clase, aunque sin benchmarks publicados en la información disponible.
- Tool calling y function calling: la model card menciona herramientas integradas en la versión oficial Qwen3.8-Flash, no confirmadas explícitamente en este checkpoint.
- Cargas agénticas y razonamiento multi-paso: la arquitectura está optimizada para ellas (QSA reduce latencia en contexto largo).
- Contexto largo: hasta 262.144 tokens nativos y 1.000.000 extendidos.
- Multi-Token Prediction (MTP) para decodificación especulativa y mayor throughput.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agentes autónomos de larga duración: el modelo puede mantener estado a lo largo de sesiones extensas gracias a sus 262.144 tokens nativos y a QSA, que reduce la latencia cuando el contexto crece, algo crítico en bucles agénticos con muchas iteraciones.
- Análisis de documentos extensos con imágenes: al combinar vision encoder y contexto largo, permite procesar informes, contratos o papers con figuras en una sola pasada sin trocear.
- Asistencia de código en pipelines CI/CD: su compatibilidad con vLLM, SGLang y TokenSpeed facilita integrarlo como servicio de completado o revisión en flujos automatizados.
- Atención al cliente multi-turno: la ventana de contexto permite arrastrar historial completo de conversaciones y documentación de producto sin resumen intermedio.
- Investigación en arquitecturas eficientes: al ser una preview experimental de Qwen4, es útil para estudiar el comportamiento de QSA, Gated Residual y N-gram Embedding en entornos controlados.
- Procesamiento de imágenes técnicas: lectura de diagramas, capturas o gráficos combinada con razonamiento textual, útil en herramientas de soporte técnico o análisis de datos visuales.
- Despliegue en la nube gestionada: para equipos que no quieran mantener infraestructura, la versión oficial Qwen3.8-Flash en Qwen Cloud ofrece 1M de contexto y herramientas integradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección "Benchmark Results" con estilos CSS, pero el contenido tabular no se ha facilitado en la información proporcionada, por lo que no se pueden reproducir cifras sin inventarlas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 180.000 millones de parámetros totales en safetensors, el checkpoint completo en fp16 requiere del orden de 360 GB de VRAM (coincide con el tamaño del repo). En cuantizaciones de 8 bits bajaría a ~180 GB y en 4 bits a ~90 GB, aunque no se confirman formatos GGUF/AWQ/GPTQ en la información disponible.
- GPU recomendadas: para fp16 completo, múltiples H100 de 80 GB o A100 de 80 GB (mínimo 5 unidades para cubrir 360 GB con margen). Para cuantización agresiva, nodos de 8×A100/H100.
- Cabe en GPU consumer: no en su forma completa. Solo con cuantizaciones extremas y offloading parcial podría intentarse en configuraciones multi-GPU de consumo (p. ej. varias RTX 4090 de 24 GB), aunque la arquitectura MoE con 6B activos y N-gram Embedding offloadable está diseñada precisamente para aliviar este escenario; no hay cifras confirmadas.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed (confirmados en la model card). llama.cpp y Ollama no se mencionan.
- Latencia y throughput: no disponibles. La model card destaca que QSA reduce la latencia en contexto largo, pero sin cifras.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa. Por su tamaño y naturaleza experimental, podría situarse frente a otros MoE de la familia Qwen o de gama alta de otros laboratorios, pero sin benchmarks publicados no es posible establecer una comparativa con cifras.

## Limitaciones y advertencias

- Modelo experimental: la propia model card lo describe como "preview" de la arquitectura Qwen4, por lo que su estabilidad y comportamiento en producción no están garantizados.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.
- Idiomas soportados no declarados: no se puede asumir cobertura multilingüe sin pruebas.
- Riesgo de alucinación: inherente a los LLM; sin benchmarks ni evaluaciones publicadas no hay medida de su tasa.
- Sesgos: no documentados en la información disponible.
- Licencia qwen-community-1.0 etiquetada como "other": es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que las condiciones no se detallan en la información proporcionada.
- Tamaño prohibitivo para la mayoría de infraestructuras: 360 GB de pesos en fp16 exigen hardware de datacenter.
- Funcionalidades como tool calling o contexto de 1M están confirmadas en la versión oficial Qwen3.8-Flash, no necesariamente en este checkpoint.
- Autoría: el repositorio figura bajo "FamilyOrang", no bajo QwenLM; conviene verificar la procedencia y la integridad de los pesos antes de desplegarlos.

## Enlaces

- Hugging Face: https://huggingface.co/FamilyOrang/Qwen3.8-Flash-Next
- Blog oficial: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Qwen Cloud (versión oficial Qwen3.8-Flash): https://www.qwencloud.com/models/qwen3.8-flash
- Qwen Cloud: https://www.qwencloud.com
- Imagen de arquitectura: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.8-Flash-Next/architecture.png
