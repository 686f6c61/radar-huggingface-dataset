# ibrohim777/Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo experimental de lenguaje y visión publicado por el equipo Qwen (Alibaba) bajo el identificador `ibrohim777/Qwen3.8-Flash-Next` en Hugging Face. Se presenta como el primer lanzamiento con pesos abiertos de la arquitectura que sustentará la futura familia Qwen4, y su interés principal radica en las innovaciones arquitectónicas que introduce: atención híbrida con Qwen Sparse Attention (QSA), Gated Residual, N-gram Embedding y una receta de entrenamiento optimizada con Muon y AdamW.

El modelo es un transformer causal con codificador de visión, de tipo Mixture-of-Experts (MoE), con 125.000 millones de parámetros en el modelo de lenguaje de los cuales solo 6.000 millones se activan por token, más 51.000 millones en embeddings n-gram y 4.000 millones en un módulo MTP (Multi-Token Prediction). El total reportado en safetensors es de 179.999.981.459 parámetros. Soporta una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.000.000.

Su relevancia actual reside en que anticipa las decisiones de diseño de Qwen4 y ofrece a la comunidad un banco de pruebas para evaluar atención dispersa a nivel de micro-bloque, embeddings n-gram como eje alternativo de escalado de parámetros y optimizadores híbridos en un modelo de gran tamaño con capacidades multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con vision encoder; híbrido Gated DeltaNet + Qwen Sparse Attention (QSA); MoE con Gated Residual y N-gram Embedding |
| Parametros totales | 179.999.981.459 (125B LM + 51B n-gram embedding + 4B MTP) |
| Parametros activos | 6B (10 expertos enrutados + 1 compartido de 512) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

La arquitectura combina dos mecanismos de atención en un layout de 48 capas organizado como 12 bloques de la forma `3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE)`. Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Qwen Sparse Attention opera a nivel de micro-bloque (no de token individual) con 24 cabezas de query y 2 de KV, dimensión de cabeza 256, RoPE de dimensión 64, un indexador MQA con 4 cabezas de query y 1 cabeza de clave compartida de dimensión 128, y un presupuesto de 512 bloques o 2.048 tokens. El objetivo declarado es reducir la latencia en contexto largo, crítica para cargas agénticas.

La capa MoE cuenta con 512 expertos, de los que se activan 10 enrutados más 1 compartido, con dimensión intermedia de experto 640. El Gated Residual usa 4 ramas con rango de cuello de botella 320, modulando el flujo residual mediante una compuerta de lectura element-wise dependiente de datos y una compuerta escalar de escritura por rama. El N-gram Embedding indexa bigramas y trigramas en la capa 2 con 20.000.000 de entradas, lo que permite escalar parámetros con menor coste computacional y facilita el offloading en aceleradores con memoria limitada. La dimensión oculta es 2560, el vocabulario de 248.320 tokens (con padding) y se incluye una capa MTP entrenada con múltiples pasos.

El entrenamiento consta de pre-entrenamiento y post-entrenamiento. Se aplican Muon y AdamW a categorías específicas de pesos, se elimina el warmup de batch size comenzando directamente en el tamaño objetivo (guiado por leyes de escalado reajustadas) y se admiten learning rates mayores. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con codificador de visión integrado.
- Razonamiento matemático y generación de código (capacidades esperadas en la familia Qwen, aunque no se detallan en la información disponible).
- Decodificación multi-token mediante la capa MTP, que puede acelerar la generación.
- Manejo de contexto largo: 262.144 tokens nativos y hasta 1.000.000 extendidos, orientado a cargas agénticas.
- Compatibilidad con tool calling y function calling a través de los runtimes soportados (vLLM, SGLang, TokenSpeed), aunque la model card no detalla el formato exacto.
- Soporte multilingüe: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Agentes autónomos de largo horizonte: la ventana nativa de 262.144 tokens y la atención dispersa QSA permiten mantener historiales de herramientas, observaciones y planes extensos sin degradar la latencia, lo que encaja con flujos multi-paso.
- Análisis de documentos extensos con imágenes: al combinar codificador de visión y contexto largo, puede procesar informes, contratos o papers con figuras y tablas en una sola pasada.
- Asistencia en desarrollo de software: generación y revisión de código en repositorios grandes, donde el contexto extendido permite incluir múltiples ficheros y el historial de cambios.
- Automatización de atención al cliente con material visual: conversaciones multi-turno que requieren interpretar capturas, facturas o productos adjuntos.
- Investigación sobre arquitecturas eficientes: como primer release de la arquitectura Qwen4, sirve para reproducir y evaluar QSA, Gated Residual y N-gram Embedding en entornos controlados.
- Extracción de información estructurada de documentación técnica: gracias al contexto largo y a la capacidad multimodal, puede recorrer manuales completos y emitir salidas estructuradas.
- Despliegue en clústeres con memoria limitada: el N-gram Embedding está diseñado para offloading, lo que facilita servir el modelo en aceleradores con VRAM restringida frente a un MoE equivalente.

## Benchmarks y rendimiento

La model card incluye una sección de benchmarks, pero en la información proporcionada solo aparece la estructura HTML/CSS de la tabla, sin los valores numéricos. Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 360 GB en safetensors, por lo que la inferencia en precisión original requiere varios aceleradores de 80 GB (A100/H100) o un nodo con suficiente memoria agregada.
- Con 6B parámetros activos, el coste computacional por token es comparable al de un modelo denso de ~6B, pero la memoria para pesos sigue siendo la del total (125B LM + 51B n-gram + 4B MTP).
- GPU recomendadas: H100 80 GB, A100 80 GB, H200; se desconoce si cabe en GPUs de consumo (RTX 4090 de 24 GB) sin cuantización agresiva, dato no disponible.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card.
- Latencia y throughput estimados: no disponibles. La arquitectura declara reducciones de latencia en contexto largo por QSA, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next | 180B (125B LM + 51B n-gram + 4B MTP) | 6B | 262.144 nativo / 1M extendido | qwen-community-1.0 | Hugging Face (pesos abiertos) |
| Qwen3.8-Flash (API) | no disponible | no disponible | 1M por defecto | servicio gestionado | Qwen Cloud |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de otros fabricantes, por lo que la comparativa cuantitativa queda limitada a la variante oficial servida por Qwen Cloud.

## Limitaciones y advertencias

- Modelo experimental: la propia model card lo describe como preview de la arquitectura de Qwen4, por lo que su estabilidad y soporte a largo plazo no están garantizados.
- Sin métricas publicadas en la información disponible: no es posible validar su rendimiento frente a alternativas.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones específicas de factualidad.
- Idiomas soportados no documentados: no se puede confirmar cobertura multilingüe ni calidad por idioma.
- Licencia `qwen-community-1.0` (license: other): es necesario revisar el fichero LICENSE antes de cualquier uso comercial; no se detallan aquí las restricciones concretas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación comunitaria.
- El tamaño de 360 GB y los 180B parámetros totales implican requisitos de infraestructura elevados; el ahorro computacional por los 6B activos no reduce la huella de memoria.
- Sesgos conocidos: no disponible.

## Enlaces

- Hugging Face: https://huggingface.co/ibrohim777/Qwen3.8-Flash-Next
- Blog oficial: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Qwen Cloud (Qwen3.8-Flash): https://www.qwencloud.com/models/qwen3.8-flash
- Servicio Qwen Cloud: https://www.qwencloud.com
