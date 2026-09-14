# schwyzquants/Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje causal con codificador de visión publicado en HuggingFace por el usuario schwyzquants, que lo redistribuye bajo licencia qwen-community-1.0. Según la model card, se trata de una "preview experimental" de la arquitectura que sustentará Qwen4, con 125.000 millones de parámetros en el modelo de lenguaje (6.000 millones activados por token), más 51.000 millones en embeddings de n-gramas y 4.000 millones en un módulo MTP, lo que da un total de 179.999.981.459 parámetros contabilizados en los archivos safetensors del repositorio (360 GB).

El modelo combina atención lineal Gated DeltaNet con Qwen Sparse Attention (QSA) a nivel de microbloques, una capa de Gated Residual, embeddings de n-gramas (bigramas y trigramas indexados en la capa 2) y una MoE de 512 expertos con 10 enrutados más 1 compartido activados. El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000, y el pipeline declarado es image-text-to-text, por lo que acepta entradas de imagen y texto.

Su relevancia es doble: por un lado, es el primer release con pesos abiertos de esta arquitectura híbrida; por otro, la propia model card indica que la versión de producción equivalente se sirve únicamente a través de Qwen Cloud (Qwen3.8-Flash), con contexto de 1M por defecto y herramientas oficiales integradas. El repositorio no registra descargas ni likes en la fecha de consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal con codificador de visión; híbrida de atención lineal Gated DeltaNet + Qwen Sparse Attention (QSA), con Mixture of Experts, Gated Residual y N-gram Embedding |
| Parametros totales | 179.999.981.459 (125B en el LM + 51B de n-gram embedding + 4B de MTP) |
| Parametros activos | 6B activados por token (10 expertos enrutados + 1 compartido, de 512 expertos totales) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos safetensors; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | qwen-community-1.0 (license: other; license_name: qwen-community-1.0; license_link: LICENSE) |
| Formato de pesos | safetensors (compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed) |

Datos adicionales de configuracion declarados en la model card: hidden dimension 2560; token embedding 248320 (padded); n-gram embedding 20.000.000 (bigramas/trigramas en la capa 2); 48 capas; layout 12 × (3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE)); MTP de 1 capa entrenado con multi-steps.

## Arquitectura y entrenamiento

La arquitectura sustituye el par Gated DeltaNet + Gated Attention por Gated DeltaNet + Qwen Sparse Attention. En lugar de seleccionar tokens individuales, QSA opera a nivel de microbloque, con un presupuesto de 512 bloques o 2048 tokens, lo que reduce la latencia en contextos largos. Gated DeltaNet usa 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. QSA emplea 24 cabezas de consulta y 2 de clave-valor, dimensión de cabeza 256 y dimensión de RoPE de 64; el indexador es MQA con 4 cabezas de consulta y 1 cabeza de clave compartida, con dimensión de cabeza 128. La MoE tiene 512 expertos con dimensión intermedia de 640 y activa 10 enrutados más 1 compartido. Gated Residual usa 4 ramas y rango de cuello de botella 320, modulando el flujo de información mediante una puerta de lectura elemento a elemento dependiente de los datos y una puerta escalar de escritura por rama.

El N-gram Embedding es la innovación de escalado de parámetros: indexar con n-gramas cortos permite aumentar parámetros con menos cómputo y facilita el offloading a memoria del sistema, algo relevante en aceleradores con memoria limitada. La receta de entrenamiento combina los optimizadores Muon y AdamW aplicados a categorías de pesos específicas, y según la model card elimina los warmups tradicionales de tamaño de batch arrancando directamente con el batch objetivo, guiándose por leyes de escalado reajustadas. Se indica que el modelo ha pasado por pre-entrenamiento y post-entrenamiento, aunque no se detallan en la información disponible el número de tokens, la composición del dataset ni si se emplearon RLHF, DPO u otras técnicas de alineamiento.

## Capacidades

- Generacion de texto conversacional en formato causal multi-turno.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text), lo que implica un codificador de visión integrado.
- Razonamiento y contexto largo: ventana nativa de 262.144 tokens, extensible a 1.000.000, con atención dispersa por microbloques orientada a cargas agénticas.
- Decodificacion especulativa implícita mediante el módulo MTP (multi-token prediction) de 1 capa entrenado con multi-steps.
- Escalado de parámetros de bajo coste computacional mediante N-gram Embedding (20M de entradas de bigramas/trigramas), pensado para offloading.
- Compatibilidad declarada con Transformers, vLLM, SGLang y TokenSpeed para despliegue.
- Tool calling / function calling: no declarado explícitamente en la información disponible.
- Capacidades de agente multi-paso: no declaradas explícitamente, aunque la model card menciona las "cargas agénticas" como motivación del diseño de QSA.
- Modo thinking: no declarado.
- Capacidades de audio: no declaradas.
- Idiomas soportados: no disponible.

## Casos de uso

- Analisis de documentos largos con imagen: gracias a los 262.144 tokens de contexto nativo (ampliables a 1M) y al codificador de visión, el modelo puede procesar informes extensos con gráficos, tablas rasterizadas y texto intercalado en una sola pasada, sin trocear el documento.
- Asistentes de codigo sobre repositorios completos: el contexto extenso permite cargar varios archivos y el historial de cambios; los 6B de parámetros activos reducen el coste de decodificación por token frente a un modelo denso de tamaño equivalente.
- Automatizacion de agentes con historiales largos: la atención dispersa por microbloques está diseñada para reducir la latencia cuando el contexto crece, escenario típico de agentes que acumulan trazas de herramientas y observaciones intermedias.
- Extraccion estructurada de informacion multimodal: facturas, albaranes o formularios escaneados combinados con instrucciones textuales, aprovechando el pipeline image-text-to-text.
- Resumen y Q&A sobre bases documentales corporativas: indexación de manuales técnicos y consulta con contexto largo, desplegando el modelo en vLLM o SGLang para servir múltiples peticiones concurrentes.
- Prototipado de investigación en arquitecturas híbridas: al ser una preview experimental de la arquitectura de Qwen4, sirve para medir en entornos controlados el comportamiento de QSA, Gated Residual y los embeddings de n-gramas.
- Servicio de inferencia de bajo coste por token: con solo 6B activos, el coste de cómputo por token generado es reducido, aunque el requisito de memoria viene marcado por los 180B totales.

## Benchmarks y rendimiento

La model card incluye una sección titulada "Benchmark Results" con estilos de tabla, pero el contenido de las tablas no está presente en la información proporcionada. Por tanto:

"No se han publicado resultados de benchmarks en la informacion disponible."

## Requisitos de hardware

Las cifras siguientes son cálculos derivados del recuento de parámetros (179.999.981.459) y del tamaño del repositorio declarado (360 GB), no datos publicados por el autor.

- Pesos en BF16/FP16: aproximadamente 360 GB, coherente con el tamaño del repositorio.
- Pesos en FP8/INT8: aproximadamente 180 GB.
- Pesos en INT4 (AWQ/GPTQ, no publicados para este modelo): aproximadamente 90-100 GB.
- GPU recomendadas para BF16: 8 × H100 80 GB o 8 × A100 80 GB (640 GB agregados) con tensor parallelism.
- GPU recomendadas para FP8: 4 × H100 80 GB como mínimo.
- GPU recomendadas para INT4 hipotético: 2 × H100 80 GB o 2 × A100 80 GB.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 en ninguna cuantización razonable; 180B de parámetros exceden la memoria de cualquier GPU de consumo actual. La model card señala que los embeddings de n-gramas son "más aptos para offloading", lo que en teoría permitiría descargar esa porción (51B) a RAM del sistema, pero no se aportan cifras de rendimiento para ese escenario.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (schwyzquants) | 180B totales, 6B activos | 262.144 nativo, 1M extensible | No disponible | qwen-community-1.0 | Pesos abiertos en HuggingFace (0 descargas, 0 likes) |
| Qwen3.8-Flash (version oficial en la nube) | No disponible | 1.000.000 por defecto | No disponible | No disponible | API gestionada en Qwen Cloud, con herramientas integradas |
| Otras alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de terceros en la información proporcionada que permitan una comparación cuantitativa fiable con modelos de tamaño o tarea equivalentes.

## Limitaciones y advertencias

- Modelo experimental: la propia model card lo describe como "preview" de la arquitectura de Qwen4, no como un release estable.
- Redistribución por terceros: el repositorio pertenece al usuario schwyzquants, no a Qwen, y no registra descargas ni likes, por lo que no hay validación comunitaria ni verificación independiente de los pesos.
- Idiomas soportados no declarados: no se puede asumir cobertura multilingüe ni un rendimiento concreto en castellano.
- Benchmarks no publicados: no hay evidencia cuantitativa de calidad en MMLU, HumanEval, GSM8K ni tareas multimodales.
- Riesgo de alucinación: inherente a los modelos de lenguaje generativos; no se documentan tasas de error ni mecanismos de mitigación.
- Licencia restrictiva potencial: se etiqueta como "other" con license_name qwen-community-1.0; es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que las licencias comunitarias de Qwen suelen incluir condiciones y restricciones de uso aceptable.
- Sin variantes cuantizadas publicadas: no hay pesos GGUF, AWQ ni GPTQ, lo que complica el despliegue en hardware limitado.
- Huella de memoria muy alta: 360 GB de pesos en BF16 obligan a infraestructura multi-GPU de gama alta aunque solo 6B de parámetros estén activos por token.
- Sin datos de latencia: no se puede estimar el coste real de servicio ni dimensionar SLA.
- La funcionalidad de producción (contexto de 1M por defecto y herramientas oficiales integradas) se reserva a la versión alojada Qwen3.8-Flash, no a estos pesos abiertos.
- Los enlaces de la model card apuntan a dominios de terceros (qwencloud.com, qwen.ai, qianwen-res.oss-accelerate.aliyuncs.com) que conviene verificar antes de usarlos como referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/schwyzquants/Qwen3.8-Flash-Next
- Blog del modelo: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe tecnico (PDF en GitHub): https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio GitHub de la familia Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Pagina de Qwen Cloud: https://www.qwencloud.com
- Ficha de Qwen3.8-Flash (version oficial gestionada): https://www.qwencloud.com/models/qwen3.8-flash
- Diagrama de arquitectura: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.8-Flash-Next/architecture.png
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a foros de videojuegos sin relacion con esta ficha.
