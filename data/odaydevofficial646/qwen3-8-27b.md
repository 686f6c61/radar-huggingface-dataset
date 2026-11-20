# odaydevofficial646/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión publicado por el usuario `odaydevofficial646` en Hugging Face, con licencia Apache 2.0. Según la model card, se presenta como parte de la familia Qwen3.8 y se describe como un modelo denso de 27 000 millones de parámetros, nativo multimodal (imagen y vídeo), orientado a tareas de codificación, trabajo profesional, investigación y agentes autónomos de horizonte largo. El repositorio contiene pesos en formato safetensors compatibles con Transformers, vLLM, SGLang y TokenSpeed.

La arquitectura declarada combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention) en un patrón híbrido de 64 capas, junto con Multi-Token Prediction (MTP) entrenado en varios pasos. El contexto nativo es de 262 144 tokens, extensible hasta 1 000 000 según la documentación del autor. Incluye un modo de razonamiento ("thinking") activado por defecto y controlable por petición mediante `reasoning_effort` y `preserve_thinking`.

Es relevante ahora porque propone un modelo denso de 27B con capacidades multimodales y de agente en un único checkpoint, un tamaño manejable para despliegue en una sola GPU de gama alta. No obstante, el repositorio no tiene descargas ni likes, no incluye información sobre idiomas soportados y la model card contiene referencias a servicios y modelos que no se pueden verificar de forma independiente; conviene tratar los datos con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión; 64 capas con layout 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)); MTP multi-paso |
| Parametros totales | 27 781 427 952 (≈27,8B) según safetensors |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 000 000 según la model card |
| Tipos de cuantizacion | No disponible (el repositorio solo declara safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

Otros datos declarados: dimensión oculta 5120, embedding de tokens 248 320 (con padding), dimensión intermedia de la FFN 17 408, Gated DeltaNet con 48 cabezas lineales para V y 16 para QK (dimensión 128), Gated Attention con 24 cabezas Q y 4 KV (dimensión 256, RoPE 64). Tamaño del repositorio: 55,6 GB.

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con un codificador de visión acoplado, lo que lo convierte en un modelo nativo image-text-to-text. La innovación estructural principal es el layout híbrido: por cada bloque de cuatro subcapas, tres usan Gated DeltaNet (atención lineal con estado recurrente, eficiente en contexto largo) y una usa Gated Attention clásica con 24 cabezas de consulta y 4 de clave-valor. Este patrón busca reducir el coste computacional y de memoria en secuencias muy largas manteniendo la calidad de la atención completa en puntos clave de la red.

El entrenamiento se declara en dos fases (pre-entrenamiento y post-entrenamiento), con MTP entrenado en varios pasos, lo que habilita decodificación especulativa interna y mayor throughput. La model card menciona mejoras en planificación autónoma y manejo de retroalimentación del entorno, lo que sugiere un post-entrenamiento orientado a agentes, pero no se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF, DPO u otras técnicas de alineamiento. Tampoco se detalla el proceso de entrenamiento del codificador de visión.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto, desactivable por petición.
- Control de profundidad de razonamiento mediante el parámetro `reasoning_effort`.
- Retención de contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Comprensión nativa de imágenes y vídeo, incluyendo diagramas STEM, documentos y vídeos de hasta una hora según la model card.
- Codificación y tareas de terminal agénticas (benchmark Terminal Bench 2.1 citado).
- Planificación autónoma y ejecución de tareas multi-paso de horizonte largo.
- Manejo de retroalimentación del entorno en bucles de agente.
- Compatibilidad con harnesses y herramientas de desarrollo populares (sin detallar cuáles).
- Soporte de tool calling / function calling: no se detalla explícitamente en la información disponible, aunque la orientación agéntica lo sugiere.
- Capacidades multilingües: no disponible.

## Casos de uso

- Agente de codificación en terminal: el modelo puede operar en bucles de edición-ejecución-verificación sobre repositorios, usando su contexto de 262K tokens para mantener el estado del proyecto y su modo thinking para planificar refactorizaciones multi-archivo.
- Análisis de documentos técnicos extensos: con 262K tokens nativos puede ingerir manuales, papers o contratos completos junto con sus figuras, ya que procesa imagen y texto de forma conjunta.
- Comprensión de vídeo de larga duración: la model card declara soporte para vídeos de hasta una hora, útil para resumen de reuniones, análisis de grabaciones de clases o revisión de material audiovisual.
- Automatización de tareas profesionales con herramientas: su orientación a agentes y manejo de feedback del entorno lo hace adecuado para pipelines que consultan APIs, ejecutan comandos y validan resultados de forma iterativa.
- Asistente de investigación con razonamiento controlable: el parámetro `reasoning_effort` permite ajustar el coste de razonamiento por consulta, útil para equilibrar latencia y profundidad en entornos de análisis.
- Despliegue en infraestructura propia: al ser un denso de 27B con licencia Apache 2.0 y pesos safetensors, se puede servir con vLLM o SGLang en una sola GPU de 80 GB, sin dependencia de APIs externas.
- Procesamiento de diagramas STEM: el codificador de visión permite interpretar gráficos, esquemas y fórmulas en imágenes para tutoría o documentación técnica.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks con columnas para Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero en la información proporcionada solo se ha conservado la cabecera y la fila de "Agentic terminal coding / Terminal Bench 2.1 (Terminus)", sin los valores numéricos. No es posible reproducir cifras sin inventarlas.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han podido extraer resultados numéricos adicionales de la información disponible. No se deben asumir cifras a partir de la model card.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 55,6 GB solo para pesos (coincide con el tamaño del repo), más overhead de activaciones y caché KV; en la práctica requiere una GPU de 80 GB (A100 80GB, H100 80GB, H200) para contexto largo.
- En cuantización de 8 bits: en torno a 28-30 GB de pesos, viable en una RTX 4090 (24 GB) solo con cuantización de 4 bits o con offloading; no se documentan checkpoints cuantizados oficiales.
- En cuantización de 4 bits: en torno a 14-16 GB de pesos, lo que permitiría RTX 4090, RTX 5090 o L40S, a costa de pérdida de calidad y sin garantía de soporte para el codificador de visión.
- Consumer GPU: no cabe en BF16 en ninguna GPU de consumo; en 4 bits podría caber en RTX 4090/5090, pero no hay pesos GGUF ni AWQ publicados en el repositorio.
- Opciones de despliegue declaradas: Transformers, vLLM, SGLang, TokenSpeed. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (este repo) | 27,8B densos | 262K nativo / 1M extensible | Texto + imagen + vídeo | Apache 2.0 | Pesos en HF, 0 descargas |
| Qwen3.6-27B | 27B (según model card) | no disponible | no disponible | no disponible | Citado en la model card |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | Citado en la model card |
| Muse Glimmer-30B | 30B (según model card) | no disponible | no disponible | no disponible | Citado en la model card |
| Opus4.6 Max | no disponible | no disponible | no disponible | Propietario (presumible) | Citado en la model card |

Los modelos comparables citados en la model card no tienen especificaciones verificables en la información disponible. No se dispone de datos de rendimiento numérico para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El repositorio no tiene descargas ni likes y fue creado y actualizado el mismo día (20 de noviembre de 2026), lo que impide verificar la procedencia y calidad de los pesos.
- La model card incluye referencias a servicios (Qwen Cloud) y a modelos (Qwen3.6, Qwen3.7-Plus, Muse Glimmer, Opus4.6 Max) que no se pueden contrastar con la información disponible; parte del contenido podría ser aspiracional o no verificado.
- No se documentan idiomas soportados, lo que impide garantizar calidad multilingüe, incluido el castellano.
- No se especifican datos de entrenamiento, composición del dataset ni técnicas de alineamiento, lo que dificulta evaluar sesgos y riesgos de alucinación.
- No hay checkpoints cuantizados oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en GPUs de consumo.
- El contexto extensible a 1M tokens se anuncia para la versión alojada en Qwen Cloud; no está claro que los pesos abiertos soporten esa longitud sin técnicas adicionales.
- Licencia Apache 2.0 permite uso comercial, pero al no poder verificar la autoría real de los pesos, el uso en producción conlleva riesgo legal y de seguridad.
- El soporte de tool calling no se detalla explícitamente; la orientación agéntica se infiere de la model card, no de documentación técnica.
- No se han publicado resultados de benchmarks verificables en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/odaydevofficial646/Qwen3.8-27B
- Qwen Cloud (referenciado en la model card): https://www.qwencloud.com
- Página del modelo en Qwen Cloud (referenciada): https://www.qwencloud.com/models/qwen3.8-27b
- Paper, blog o repositorio oficial: no disponible en la información proporcionada.
