# HexaSpaghetti/Qwen3.8-Flash-Next-heretic

## Resumen

Qwen3.8-Flash-Next-heretic es una variante "abliterated" (decensored) del modelo Qwen3.8-Flash-Next, desarrollada por el usuario HexaSpaghetti mediante la herramienta Heretic v2.2.0.dev0. El modelo base es un LLM causal multimodal (texto e imagen) experimental de Alibaba Qwen, concebido como preview de la arquitectura que sustentará Qwen4. La intervención heretic elimina buena parte del comportamiento de rechazo del modelo original mediante una técnica de ablación de rango arbitrario (ARA) aplicada sobre las capas 0 a 38.

El modelo base emplea una arquitectura híbrida poco convencional: combina capas de Gated DeltaNet (atención lineal) con capas de Qwen Sparse Attention (QSA) a nivel de micro-bloque, todo ello sobre un backbone Mixture-of-Experts con 512 expertos (10 enrutados + 1 compartido activos). Dispone de 125B parámetros en el LM con 6B activados, más 51B en embeddings n-gram y 4B en un módulo MTP (multi-token prediction). El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000.

La relevancia de esta ficha radica en dos factores: por un lado, documenta una arquitectura de frontera con innovaciones concretas (QSA, Gated Residual, N-gram Embedding, receta de entrenamiento con Muon/AdamW); por otro, la variante heretic reduce los rechazos de 99/100 a 4/100 según la model card, con una divergencia KL de 0,2297 respecto al original y un impacto mínimo en PIQA (0,8324 frente a 0,8297). El repo ocupa 354,8 GB y acumula 55 descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM multimodal con encoder de visión; híbrido Gated DeltaNet + Qwen Sparse Attention sobre MoE, con Gated Residual y N-gram Embedding |
| Parametros totales | 177.392.830.576 (125B LM + 51B n-gram embedding + 4B MTP, según safetensors) |
| Parametros activos | 6B (10 expertos enrutados + 1 compartido de 512 totales) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; compatible con vLLM, SGLang, TokenSpeed) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (formato Hugging Face Transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next introduce varias innovaciones arquitectónicas. La más destacada es la Qwen Sparse Attention (QSA): en lugar de seleccionar tokens individuales, opera a nivel de micro-bloque con un presupuesto de 512 bloques o 2048 tokens, lo que reduce la latencia en contextos largos, un punto crítico para cargas agénticas. El layout de capas es 12 × (3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE)), es decir, 48 capas en total. Las capas de Gated DeltaNet usan 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128; las de QSA usan 24 cabezas para Q y 2 para KV, con dimensión 256 y RoPE de 64 dimensiones, más un indexador MQA con 4 cabezas de query y 1 de key compartida.

Otras piezas clave son el Gated Residual (4 ramas, rango de cuello de botella 320), que modula el flujo residual mediante una compuerta de lectura dependiente de datos y una compuerta escalar de escritura por rama, y el N-gram Embedding (20 millones de bigramas/trigramas en la capa 2), que permite escalar parámetros con menor coste computacional y facilita el offloading en aceleradores con memoria limitada. El MoE tiene 512 expertos con dimensión intermedia 640. La receta de entrenamiento aplica Muon y AdamW a categorías de pesos específicas, elimina el warmup de batch size empezando directamente en el tamaño objetivo y usa learning rates más altos. Incluye un módulo MTP de 1 capa entrenado con múltiples pasos, útil para decodificación especulativa. La variante heretic aplica ablación ARA sobre las capas 0-38 con `preserve_good_behavior_weight` 0,7748, `steer_bad_behavior_weight` 0,0085, `overcorrect_relative_weight` 0,9446 y `neighbor_count` 5.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (hasta 262.144 tokens nativos).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), gracias al encoder de visión del modelo base.
- Razonamiento y matemáticas: el modelo base está post-entrenado y orientado a tareas de razonamiento, aunque no se publican benchmarks específicos en la información disponible.
- Generación de código: capacidad esperable por la familia Qwen, si bien no se detallan métricas en la información proporcionada.
- Tool calling y function calling: el modelo base está diseñado para cargas agénticas; la versión oficial Qwen3.8-Flash incluye herramientas integradas, pero la variante heretic no documenta explícitamente este soporte.
- Razonamiento multi-paso y uso como agente: la arquitectura QSA está optimizada para latencia en contextos largos típicos de agentes.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "uncensored": la ablación reduce los rechazos de 99/100 a 4/100 según la model card.
- Decodificación especulativa: soportada por el módulo MTP de 1 capa.

## Casos de uso

- Atención al cliente automatizada: con 262.144 tokens de contexto nativo, el modelo puede mantener conversaciones multi-turno con historial extenso y documentación de producto adjunta sin truncar, reduciendo la pérdida de contexto en sesiones largas.
- Análisis de documentos e imágenes combinados: al ser `image-text-to-text`, permite extraer información de capturas, diagramas o formularios junto con texto, útil en back-office y digitalización de procesos.
- Generación de código en pipelines: su compatibilidad con vLLM, SGLang y TokenSpeed permite integrarlo en servicios de autocompletado o revisión de código; el módulo MTP acelera la decodificación en producción.
- Agentes autónomos con contexto largo: la QSA reduce la latencia en ventanas extensas, lo que lo hace adecuado para agentes que acumulan trazas de herramientas y observaciones durante muchas iteraciones.
- Investigación sobre alineación y seguridad: la variante heretic es un caso de estudio reproducible (carpeta `reproduce/`) para analizar cómo la ablación ARA afecta al comportamiento de rechazo con una divergencia KL de 0,2297.
- Generación creativa sin restricciones: para aplicaciones de ficción, guiones o role-play donde el filtrado del modelo original resulta limitante, con la advertencia de que la licencia y el uso responsable siguen aplicando.
- Procesamiento de corpus largos: resúmenes y extracción de información sobre documentos de cientos de miles de tokens, aprovechando la extensibilidad hasta 1.000.000 de tokens (aunque la extensión más allá de 262.144 no está garantizada sin técnicas adicionales).

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden a la comparación de la variante heretic con el modelo original, no a benchmarks estándar del modelo base.

| Metrica | Este modelo (heretic) | Qwen3.8-Flash-Next original |
|---|---|---|
| Rechazos (refusals) | 4/100 | 99/100 |
| Divergencia KL | 0,2297 | 0 (por definición) |
| PIQA acc_norm | 0,8324 | 0,8297 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 177.392.830.576 parámetros totales, en FP16 se requieren aproximadamente 355 GB solo para pesos; en FP8 unos 177 GB; en cuantizaciones de 4 bits, en torno a 89 GB. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados.
- GPU recomendadas: para FP16 se necesitan múltiples aceleradores de 80 GB (A100/H100); para FP8, al menos 3× H100 80 GB o equivalente; para 4 bits, configuraciones de 2× H100 o 4× A100 40 GB.
- GPU de consumo: no cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB) ni siquiera en cuantización agresiva, dado el tamaño total de parámetros. El N-gram Embedding de 51B y el MTP de 4B agravan el requisito.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card del modelo base.
- Latencia y throughput: no disponibles en la información proporcionada. La QSA y el MTP están diseñados para reducir latencia en contexto largo y acelerar la decodificación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-Flash-Next-heretic | 177,4B totales / 6B activos | 262.144 (hasta 1M) | qwen-community-1.0 | Variante decensored; rechazos 4/100 |
| Qwen3.8-Flash-Next (original) | 125B LM + 51B n-gram + 4B MTP | 262.144 (hasta 1M) | qwen-community-1.0 | Modelo base; rechazos 99/100; PIQA 0,8297 |
| Qwen3.8-Flash (API) | no disponible | 1M por defecto | propietaria (Qwen Cloud) | Versión gestionada con herramientas integradas |

No se dispone en la información proporcionada de datos de otros modelos comparables de la misma categoría (híbridos MoE con atención dispersa) para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- La ablación heretic elimina filtros de seguridad: los rechazos caen de 99/100 a 4/100, lo que implica que el modelo puede generar contenido que el original bloquearía. Requiere mitigaciones propias en producción.
- La divergencia KL de 0,2297 respecto al original indica un cambio de distribución no trivial; pueden aparecer degradaciones en tareas sensibles no medidas por PIQA.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad en la información disponible; como todo LLM, puede inventar datos.
- Idiomas soportados no documentados: no hay garantía de calidad multilingüe más allá de lo que herede del modelo base.
- La licencia qwen-community-1.0 impone condiciones específicas para uso comercial; es responsabilidad del usuario revisar el archivo LICENSE del repositorio antes de desplegar.
- El modelo base es una "experimental preview" de la arquitectura de Qwen4, no un modelo de producción estable; la variante heretic hereda esa naturaleza experimental.
- El tamaño del repo (354,8 GB) y los requisitos de VRAM lo hacen inviable en hardware de consumo.
- El soporte de tool calling y function calling no está documentado explícitamente para esta variante.
- La extensión de contexto hasta 1.000.000 de tokens corresponde a la versión oficial Qwen3.8-Flash; en esta variante solo se garantiza el contexto nativo de 262.144.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HexaSpaghetti/Qwen3.8-Flash-Next-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Heretic (herramienta de ablación): https://heretic-project.org
- Blog de Qwen3.8-Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Qwen Cloud (servicio gestionado): https://www.qwencloud.com
- Overview de Qwen3.8-Flash: https://www.qwencloud.com/models/qwen3.8-flash
