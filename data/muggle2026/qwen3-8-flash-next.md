# Muggle2026/Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje causal con codificador de vision publicado por Muggle2026 en HuggingFace bajo el paraguas de la familia Qwen. Se presenta como una vista previa experimental de la arquitectura que sustentara Qwen4, y combina atención híbrida con atención dispersa, residuos con compuerta y embeddings de n-gramas sobre una base Mixture-of-Experts. El modelo resuelve el problema de escalar parámetros y ventana de contexto sin disparar el coste computacional, algo crítico para cargas de trabajo agénticas y de contexto largo.

La arquitectura declara 125B parámetros en el modelo de lenguaje con 6B activados, más 51B en embeddings de n-gramas y 4B en MTP, lo que da un total real de pesos de aproximadamente 180B según los safetensors del repositorio. La longitud de contexto nativa es de 262.144 tokens, extensible hasta 1.000.000. El repositorio ocupa 360 GB y los pesos están en formato safetensors para transformers, con compatibilidad declarada con vLLM, SGLang y TokenSpeed.

Es relevante ahora porque introduce varias innovaciones arquitectónicas concretas (Qwen Sparse Attention a nivel de micro-bloque, Gated Residual con compuertas de lectura y escritura, N-gram Embedding para escalar parámetros con menos cómputo y receta de entrenamiento con Muon y AdamW) que apuntan a la próxima generación de la familia. La licencia es qwen-community-1.0, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de vision; atencion hibrida Gated DeltaNet + Qwen Sparse Attention (QSA); MoE con 512 expertos; Gated Residual; N-gram Embedding; MTP de 1 capa |
| Parametros totales | 179.999.981.459 (~180B segun safetensors) |
| Parametros activos | 6B en el LM (125B totales del LM, 10 expertos enrutados + 1 compartido activados) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal con codificador de vision, organizado en 48 capas con un layout de 12 bloques de la forma 3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE). La atención híbrida combina Gated DeltaNet (atención lineal con 48 cabezas para V y 16 para QK, dimensión de cabeza 128) con Qwen Sparse Attention, que en lugar de seleccionar tokens individuales opera a nivel de micro-bloque con un presupuesto de 512 bloques o 2.048 tokens, usando un indexador MQA con 4 cabezas de query y 1 cabeza de clave compartida (dimensión 128). La dimensión oculta es 2560, el embedding de tokens es 248.320 (con padding) y el embedding de n-gramas indexa 20.000.000 de bigramas/trigramas en la capa 2.

La capa MoE cuenta con 512 expertos, de los que se activan 10 enrutados más 1 compartido, con dimensión intermedia de experto 640. El Gated Residual tiene 4 ramas y rango de cuello de botella 320, modulando el flujo de información mediante una compuerta de lectura elemental dependiente de datos y una compuerta escalar de escritura por rama. Se incluye una capa MTP entrenada con múltiples pasos. La receta de entrenamiento aplica Muon y AdamW a categorías específicas de pesos, elimina los warmups de tamaño de batch (arrancando directamente en el tamaño objetivo) y se guía por leyes de escalado reajustadas, lo que reduce el número total de pasos del optimizador y permite learning rates mayores. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante codificador de vision.
- Razonamiento de contexto largo: ventana nativa de 262.144 tokens extensible a 1.000.000.
- Capacidades agénticas y de razonamiento multi-paso, con foco declarado en cargas de trabajo agénticas.
- Decodificación especulativa mediante la capa MTP (multi-token prediction).
- Compatibilidad con tool calling y function calling a través de los frameworks de despliegue soportados (vLLM, SGLang, TokenSpeed).
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historiales extensos gracias a su ventana nativa de 262.144 tokens, manteniendo coherencia en hilos largos sin truncar el contexto previo.
- Análisis de documentos extensos y contratos: con contexto de hasta 1.000.000 de tokens, permite ingerir informes completos, expedientes o bases de código y responder preguntas sobre ellos en una sola pasada.
- Agentes autónomos multi-paso: la combinación de tool calling, razonamiento multi-paso y baja latencia en contexto largo (gracias a QSA) lo hace adecuado para pipelines agénticos que encadenan llamadas a herramientas y APIs.
- Generación y revisión de código en producción: puede integrarse en pipelines de CI/CD para revisión de parches, generación de tests y explicación de diffs, apoyándose en su capacidad de contexto largo sobre repositorios completos.
- Procesamiento de documentos con imagen: al ser image-text-to-text, sirve para extraer y razonar sobre información de capturas, formularios escaneados o gráficos combinados con texto.
- Asistentes de investigación y síntesis bibliográfica: permite resumir y comparar decenas de papers o artículos en una única ventana de contexto, con razonamiento sobre fuentes cruzadas.
- Despliegue en infraestructura propia: al ser compatible con vLLM, SGLang y TokenSpeed y publicar pesos en safetensors, encaja en entornos on-premise que requieran control de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~180B parámetros en safetensors, en BF16 se requieren aproximadamente 360 GB de VRAM, y en cuantizaciones de 8 bits o 4 bits el requisito se reduce proporcionalmente (no se especifican formatos de cuantización soportados).
- GPU recomendadas: para BF16 se necesitan nodos multi-GPU (por ejemplo, varias A100 80GB o H100 80GB); el modelo no cabe en una sola GPU consumer en precisión completa.
- GPU consumer: no cabe en RTX 4090 ni en GPUs de 24 GB en BF16; requeriría cuantización agresiva y offloading, no documentado oficialmente.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card.
- Latencia y throughput estimados: no disponibles; la arquitectura QSA declara reducciones significativas de latencia en contexto largo, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-Flash-Next | ~180B totales (6B activos) | 262.144 nativo, hasta 1.000.000 | qwen-community-1.0 | Pesos abiertos en HuggingFace |
| Qwen3.8-Flash (API oficial) | no disponible | 1.000.000 por defecto | servicio gestionado | Qwen Cloud |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros modelos en la información proporcionada, por lo que la comparativa se limita a la relación entre la versión abierta y la versión gestionada de la propia familia.

## Limitaciones y advertencias

- Es una vista previa experimental de la arquitectura de Qwen4; no debe asumirse estabilidad de API ni de comportamiento en producción.
- La licencia qwen-community-1.0 impone condiciones específicas para uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de desplegar.
- No se especifican los idiomas soportados, por lo que el rendimiento multilingüe es incierto.
- No hay datos publicados sobre sesgos, tasa de alucinación ni evaluaciones de seguridad.
- El tamaño del repositorio (360 GB) y los ~180B parámetros implican un coste de almacenamiento e inferencia elevado.
- El contexto extensible a 1.000.000 de tokens no está garantizado en la versión abierta; la model card indica que la extensión a 1M y las herramientas integradas son características de la versión gestionada Qwen3.8-Flash.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una validación comunitaria aún inexistente.
- No se documentan los formatos de cuantización soportados, lo que complica el despliegue en hardware limitado.

## Enlaces

- HuggingFace: https://huggingface.co/Muggle2026/Qwen3.8-Flash-Next
- Blog oficial: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Qwen Cloud (Qwen3.8-Flash): https://www.qwencloud.com/models/qwen3.8-flash
- Servicio Qwen Cloud: https://www.qwencloud.com
