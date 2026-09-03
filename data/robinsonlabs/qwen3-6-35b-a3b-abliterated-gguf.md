# RobinsonLabs/Qwen3.6-35B-A3B-abliterated-GGUF

## Resumen

Qwen3.6-35B-A3B-abliterated-GGUF es una versión modificada y cuantizada del modelo MoE Qwen/Qwen3.6-35B-A3B, desarrollada por Robinson Labs. El modelo original es un mixture-of-experts con 35.5 mil millones de parámetros totales y solo 3 mil millones activos por token, diseñado para razonamiento agéntico, codificación y comprensión multimodal de texto, imagen y vídeo. Robinson Labs aplicó una técnica de abliteración (método D34H) que reduce el reflejo de rechazo del modelo ante contenido creativo y adulto, manteniendo las capacidades de razonamiento, código y matemáticas intactas, así como los guardarraíles de seguridad infantil.

Esta versión GGUF está cuantizada con importance-matrix (imatrix) y preserva la Multi-Token Prediction (MTP), lo que permite decodificación especulativa en runtimes compatibles. El modelo tiene una longitud de contexto nativa de 262.144 tokens, ampliable a 1.010.000 mediante YaRN. Es relevante porque ofrece una alternativa de alta capacidad que cabe en una sola GPU de consumo gracias a su arquitectura MoE con solo 3B de parámetros activos, y porque su licencia Apache-2.0 permite uso comercial sin restricciones.

La segunda escalera de cuantizaciones publicada en este repositorio corrige un fallo de la primera (que no reducía los rechazos de forma efectiva). Cada archivo incluye su hash SHA-256 para verificar que se descarga la versión correcta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (qwen35moe), 40 capas, con bloque MTP (Multi-Token Prediction) |
| Parámetros totales | 35.505.251.456 (35,5B) |
| Parámetros activos | 3.000.000.000 (3B) |
| Longitud de contexto | 262.144 tokens (extensible a 1.010.000 con YaRN) |
| Tipos de cuantización | Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, IQ3_M, Q3_K_S, IQ3_XS, IQ2_M, IQ2_XS |
| Idiomas soportados | No disponible (el modelo base Qwen es multilingüe, pero no se especifican idiomas en esta versión) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con safetensors disponibles en el repo base abliterado) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un mixture-of-experts con 40 capas: 10 capas de atención completa y 30 capas de atención DeltaNet, más un bloque MTP que predice múltiples tokens en paralelo. La arquitectura `qwen35moe` activa solo 3B de parámetros por token, lo que reduce considerablemente el coste computacional en inferencia. El modelo original fue entrenado con datos multimodal (texto, imagen y vídeo) y soporta razonamiento de pensamiento encadenado (thinking mode) que se preserva entre turnos conversacionales.

La versión abliterada de Robinson Labs aplica una técnica de ortogonalización de pesos en una única dirección. El proceso: se captura una dirección de rechazo mediante diff-of-means sobre 256 pares de prompts dañinos e inofensivos, extraída del modelo base sin cuantizar; se selecciona la fila 34 de profundidad (aproximadamente 85% de la profundidad total); y se aplica ortogonalización lineal con pesos 1.3 en las salidas de atención (10 `o_proj` y 30 `linear_out` de DeltaNet) y en las proyecciones de los expertos enrutados y compartidos, con decaimiento de 1.3 a 0.8 entre las capas 15 y 40. Embeddings, routers, normas y el bloque MTP no se modifican. El resultado reduce los rechazos de 25/25 a 2/25 en un probe de rechazo genérico, manteniendo la capacidad completa (5/5) y los guardarraíles de seguridad infantil (10/10 en un probe de 10 prompts).

## Capacidades

- Generación de texto con razonamiento avanzado, incluyendo modo de pensamiento (thinking) que se preserva entre turnos conversacionales.
- Comprensión multimodal: procesa texto, imagen y vídeo para tareas de razonamiento visual y contextual.
- Codificación y generación de código: soporta tareas de programación, depuración y refactorización con contexto largo.
- Razonamiento matemático y lógico: resuelve problemas complejos de matemáticas y lógica formal.
- Decodificación especulativa mediante MTP: el bloque Multi-Token Prediction permite generar múltiples tokens por paso, acelerando la inferencia en runtimes compatibles.
- Capacidad de agente y multi-step reasoning: diseñado para tareas agénticas que requieren planificación y ejecución de varios pasos.
- Role-play y escritura creativa sin restricciones de rechazo: el abliterado reduce significativamente las negativas ante contenido adulto y creativo.
- Multilingüe (heredado del modelo base Qwen, aunque no se especifican idiomas concretos en esta versión).

## Casos de uso

- Escritura creativa y ficción: el modelo puede generar novelas, guiones y relatos de cualquier género sin los rechazos típicos de los modelos alineados, gracias a la abliteración. Es adecuado para autores que necesitan explorar temas adultos o controvertidos con fluidez y coherencia narrativa.
- Role-play conversacional: su capacidad de mantener el modo de pensamiento entre turnos y su baja tasa de rechazo lo hacen ideal para asistentes de rol inmersivos, chatbots de personaje y juegos de texto interactivos.
- Generación de código en producción: con 262k tokens de contexto, puede manejar repositorios completos o archivos muy largos. Su soporte MTP acelera la autocompletación en editores y pipelines de CI/CD.
- Análisis multimodal de documentos largos: procesa PDFs con imágenes, diagramas y vídeo para extraer información técnica, gracias a su ventana de contexto extendida y capacidades de visión.
- Desarrollo de agentes autónomos: su arquitectura MoE con 3B activos permite ejecutar múltiples agentes en paralelo en una sola GPU, ideal para orquestación de tareas multi-paso con razonamiento encadenado.
- Asistente de investigación científica: puede resumir y razonar sobre artículos extensos, combinar información de múltiples fuentes y generar hipótesis, manteniendo el contexto de 262k tokens.
- Chatbots de atención al cliente con personalidad: el abliterado permite respuestas más naturales y menos evasivas en dominios sensibles, mientras que los guardarraíles de seguridad infantil se mantienen intactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Robinson Labs proporciona los siguientes resultados de sus probes internos, comparando el modelo abliterado con el modelo base sin modificar:

| Probe | Modelo base (stock) | Modelo abliterado | Versión comunitaria heretic |
|---|---|---|---|
| Rechazo genérico (n=25, rechazos, menor es mejor) | 25/25 | 2/25 | 3/25 |
| Capacidad (razonamiento, código, matemáticas, factual, instrucciones) | 5/5 | 5/5 | 5/5 |
| Role-play | 2/2 | 2/2 | 2/2 |
| Guardarraíles de seguridad infantil (n=10, mantenidos, juez LLM) | 10/10 | 10/10 | 6/10 |

Los dos rechazos residuales son rechazos suaves en la banda aceptable (una guía de desinformación y un enlace a un sitio de odio), donde el modelo declina y ofrece una alternativa legítima.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaños de archivo GGUF):
  - Q6_K: 29,21 GB (requiere GPU profesional o dual consumer)
  - Q5_K_M: 25,35 GB (requiere GPU con 24 GB o más, p.ej. RTX 4090)
  - Q4_K_M: 21,71 GB (cabe en RTX 4090 24 GB con margen)
  - Q3_K_M: 17,46 GB (cabe en RTX 4080 16 GB con cuantización de KV cache)
  - IQ2_XS: 11,20 GB (cabe en RTX 3080 12 GB o RTX 4070)
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y superiores; A100 40 GB o H100 para Q6_K y despliegues de alto rendimiento; RTX 4070/3080 (12-16 GB) para cuantizaciones Q3 e IQ2.
- El modelo cabe en GPUs de consumo desde 12 GB de VRAM con cuantizaciones ligeras (IQ2_XS), gracias a su arquitectura MoE con solo 3B de parámetros activos.
- Opciones de despliegue: llama.cpp (soporte nativo GGUF y MTP), Ollama (integrado vía GGUF), vLLM (con soporte para MoE y MTP), TGI (Text Generation Inference), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no se han publicado datos específicos. Con MTP activo, la generación especulativa puede duplicar o triplicar el throughput en CPU y GPU. En una RTX 4090 con Q4_K_M, se espera una velocidad de decodificación entre 30 y 60 tokens/s, dependiendo de la longitud de contexto y el número de expertos activos.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35,5B | 3B | 262k (1M con YaRN) | Apache-2.0 | Safetensors | Modelo original, no abliterado, con rechazos completos |
| Qwen3.6-35B-A3B-abliterated-GGUF (este) | 35,5B | 3B | 262k (1M con YaRN) | Apache-2.0 | GGUF | Abliterado, con MTP preservado, 12 cuantizaciones |
| Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF | 35,5B | 3B | 262k | Apache-2.0 | GGUF | Abliterado alternativo de huihui-ai, también con MTP |
| Qwen3.6-27B (dense) | 27B | 27B | 262k | Apache-2.0 | Safetensors/GGUF | Variante densa, no MoE, mayor coste por token |

La comparativa muestra que la versión de Robinson Labs es una de las dos opciones abliteradas con MTP disponible en GGUF. La principal diferencia con la versión de huihui-ai es el método de abliteración y la garantía de que los guardarraíles de seguridad infantil se mantienen (10/10 en el probe de Robinson Labs, frente a 6/10 en la versión comunitaria heretic). El modelo denso Qwen3.6-27B no es comparable en eficiencia, ya que activa todos sus parámetros por token.

## Limitaciones y advertencias

- Modelo abliterado: el reflejo de rechazo ante contenido adulto y creativo se ha reducido deliberadamente. No es apto para todos los públicos y el autor lo etiqueta como `not-for-all-audiences`.
- Guardarraíles de seguridad infantil: se mantienen según el probe interno (10/10), pero el autor advierte que solo se probaron 10 prompts y no se garantiza su integridad más allá de ese conjunto.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios factuales. Se recomienda verificación externa en aplicaciones de producción.
- Sesgos heredados: el modelo base Qwen puede contener sesgos culturales, de género o ideológicos que se mantienen en esta versión abliterada.
- Limitaciones de contexto: aunque la ventana es de 262k tokens, el rendimiento puede degradarse en contextos muy largos sin técnicas de gestión de KV cache. La extensión a 1M mediante YaRN requiere calibración adicional.
- Idiomas: no se especifican los idiomas soportados en esta versión GGUF. Se asume multilingüe por el modelo base, pero la calidad puede variar significativamente entre lenguas.
- Licencia Apache-2.0: permite uso comercial sin restricciones, pero el abliterado puede considerarse una modificación del modelo original; se recomienda revisar los términos del modelo base Qwen para asegurar el cumplimiento.
- Historial de versiones: la primera escalera publicada (junio 2026) no funcionaba correctamente. Es imprescindible verificar el hash SHA-256 de cada archivo descargado para asegurar que se corresponde con la versión corregida (revisión posterior a 2026-09-02).

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/RobinsonLabs/Qwen3.6-35B-A3B-abliterated-GGUF
- Modelo base abliterado (safetensors): https://huggingface.co/RobinsonLabs/Qwen3.6-35B-A3B-abliterated
- Modelo base original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Página en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/teams/qwen/models/qwen3.6-35b-a3b
- Guía de Qwen 3.6 (27B dense vs 35B-A3B MoE): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Artículo sobre ejecución en una sola GPU: https://koishiai.com/en/articles/qwen-3-6-35b-a3b-moe-gpu
- Versión alternativa abliterada de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF
