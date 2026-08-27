# ddark-il/Qwen3.8-27B-Uncensored-AWQ-omlx

## Resumen

El modelo `ddark-il/Qwen3.8-27B-Uncensored-AWQ-omlx` es una cuantización AWQ de 5.0 bits por peso (bpw) aplicada sobre el fine-tune `orcarouter/Qwen3.8-27B-Uncensored`, que a su vez es una versión "abliterada" (sin censura) del modelo multimodal denso Qwen3.8-27B de Alibaba. El resultado es un checkpoint en formato MLX, optimizado para Apple Silicon, que conserva las capacidades de visión-lenguaje, generación de texto, código y razonamiento del modelo original, pero con una capa de moderación eliminada mediante técnicas de abliteración.

La relevancia de este modelo radica en que combina tres elementos: un modelo base de 27B parámetros con rendimiento puntero en tareas de código y agentes, un fine-tune que elimina restricciones de contenido, y una cuantización AWQ de alta calidad que reduce el tamaño a 17.4 GB, haciéndolo viable en hardware local de gama alta. Además, incluye un cabezal de predicción multi-token (MTP) que acelera la decodificación, y requiere el runtime oMLX para aprovechar todas sus capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (visión-lenguaje) con cabezal MTP |
| Parametros totales | 27B (modelo base); el safetensors reporta 4.815.908.816, posiblemente un error del autor |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | AWQ 5.0 bpw con mapa por módulo: MLP 4-bit gs64, GDN in_proj 5-bit gs64, attention q/k/v 8-bit gs64, o_proj 4-bit gs64, lm_head 6-bit gs128, embeddings 4-bit gs128, vision tower 8-bit, MTP head 8/6/4-bit |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal que procesa texto e imágenes, con atención completa y un cabezal de predicción multi-token (MTP) que permite predecir varios tokens futuros en paralelo, reduciendo la latencia de decodificación. Sobre este base, `orcarouter` aplicó una técnica de abliteración que identifica y elimina las direcciones en el espacio de activaciones responsables del comportamiento de rechazo o censura, dando lugar al fine-tune "Uncensored". El autor de este repo, `ddark-il`, tomó ese fine-tune y le aplicó una cuantización AWQ de 5.0 bpw, transplantando la calibración de un donante previo (`True2456/Qwen3.8-27B-AWQ-5.0bpw`) en lugar de recalcularla. El proceso incluyó un ajuste por MSE en las capas MLP y una verificación bit-exacta en varias partes del modelo. El checkpoint conserva los pesos del cabezal MTP y la torre de visión, por lo que requiere el runtime oMLX para cargarse correctamente; las versiones estándar de `mlx_lm` o `mlx_vlm` no aplican bien el cambio de norma o descartan componentes.

## Capacidades

- Generación de texto y razonamiento multi-step, con soporte de pensamiento encadenado.
- Comprensión de imágenes (image-text-to-text): puede describir, analizar y responder preguntas sobre contenido visual.
- Generación de código y automatización de tareas de oficina, según las capacidades del modelo base Qwen3.8-27B.
- Soporte de tool calling y flujos agénticos, heredado del modelo base.
- Predicción multi-token (MTP) para decodificación más rápida, activable mediante oMLX.
- Ausencia de moderación de contenido (uncensored), lo que permite generar respuestas que el modelo base rechazaría.

## Casos de uso

- Asistente de programación sin restricciones: el modelo puede generar código, explicar vulnerabilidades o escribir exploits en entornos de investigación de seguridad, donde el modelo base censuraría ciertas peticiones. Su capacidad de tool calling permite integrarlo en IDEs o pipelines de CI/CD.
- Automatización de oficina: redacción de documentos, resúmenes de correos, generación de plantillas y análisis de datos tabulares, aprovechando el contexto largo y la capacidad de razonamiento del modelo.
- Análisis de imágenes médicas o técnicas: al ser multimodal, puede describir radiografías, diagramas o capturas de pantalla, y combinarlo con razonamiento textual para generar informes preliminares.
- Chatbot de investigación académica: útil para explorar temas sensibles como drogas, armas o psicología oscura, donde un modelo censurado limitaría la discusión. El modo uncensored permite un debate abierto, aunque con supervisión humana.
- Generación de contenido creativo sin filtros: escritura de ficción con temáticas adultas, guiones o diálogos que requieren un registro coloquial o explícito, sin las restricciones típicas de los modelos comerciales.
- Desarrollo de agentes autónomos: gracias a su soporte de tool calling y razonamiento multi-step, puede orquestar llamadas a APIs, navegación web o ejecución de scripts, en entornos donde se necesita que el agente no se detenga por políticas de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint cuantizado. Se puede inferir que el rendimiento es cercano al del modelo base Qwen3.8-27B, con una degradación típica de la cuantización AWQ a 5 bits, pero no hay datos numéricos que respalden esta afirmación.

## Requisitos de hardware

- Tamaño del checkpoint: 17.4 GB, por lo que se recomienda al menos 24 GB de memoria unificada en Apple Silicon (por ejemplo, Mac Studio M1 Max o M2 Ultra con 32 GB o más).
- Diseñado exclusivamente para Apple Silicon mediante MLX; no es compatible directamente con GPU NVIDIA o AMD.
- Requiere el runtime oMLX (no la versión estándar de mlx-lm) para cargar el modelo con todas sus capacidades, incluyendo MTP y visión.
- Para inferencia en CPU, se puede usar con oMLX en modo CPU, pero la velocidad será limitada; se recomienda GPU integrada de Apple.
- La decodificación con MTP activado puede ofrecer un throughput mayor que la generación token a token, aunque no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | FP16/BF16 | No disponible | Apache 2.0 | Hugging Face |
| orcarouter/Qwen3.8-27B-Uncensored | 27B | FP8 (según blog) | No disponible | Apache 2.0 | Hugging Face |
| ddark-il/Qwen3.8-27B-Uncensored-AWQ-omlx | 27B | AWQ 5.0 bpw | No disponible | Apache 2.0 | Hugging Face |

La comparativa se limita a la familia Qwen3.8-27B, ya que no se dispone de datos de otros modelos abliterados de tamaño similar en el ecosistema MLX. La principal diferencia entre el modelo base y este checkpoint es la eliminación de la censura y la cuantización, que reduce el tamaño de 27B en FP16 (~54 GB) a 17.4 GB, a costa de una posible pérdida de precisión.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal o peligroso sin filtros. Su uso en producción debe ir acompañado de medidas de seguridad adicionales, como moderación externa o supervisión humana.
- La cuantización AWQ a 5 bits puede introducir errores de redondeo que afecten a tareas de razonamiento complejo o generación de código, aunque el autor afirma que la calidad es similar al donante.
- El modelo requiere oMLX, un runtime menos extendido que mlx-lm estándar; esto limita la portabilidad y el soporte de la comunidad.
- No se dispone de información sobre la longitud de contexto soportada, lo que dificulta planificar su uso en tareas que requieran ventanas largas.
- Los idiomas soportados no están documentados; se asume que hereda los del modelo base Qwen3.8-27B, pero no hay confirmación.
- El número de parámetros reportado en el safetensors (4.8B) es inconsistente con el tamaño del modelo base (27B), lo que sugiere un posible error en los metadatos del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ddark-il/Qwen3.8-27B-Uncensored-AWQ-omlx
- Modelo base (fine-tune): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Donante de la cuantización: https://huggingface.co/True2456/Qwen3.8-27B-AWQ-5.0bpw
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Blog de orcarouter sobre el modelo uncensored: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
