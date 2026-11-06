# Audante/gemma-4-12B-it-MLX-5bit

## Resumen

Gemma 4 12B Instruct (MLX, 5-bit) es una conversión al formato MLX del modelo Gemma 4 12B Instruct de Google, publicada por el usuario Audante como espejo del repositorio original de mlx-community. No se trata de un modelo entrenado desde cero ni de una variante oficial: el autor declara explícitamente que los ficheros son idénticos a los del repositorio fuente, en la revisión `a2fa92fa5bdba1fc4be9d927a5d5188c17d87d09`. Su interés práctico es permitir la ejecución del modelo en hardware Apple Silicon mediante el framework MLX, con pesos cuantizados a 5 bits y un tamaño de repositorio de 8,3 GB.

El modelo subyacente es un transformer de 11.959.730.224 parámetros (aproximadamente 12B) afinado para instrucciones, identificado con la arquitectura `gemma4_unified` en los metadatos del repositorio. La cuantización a 5 bits reduce el peso en memoria respecto a los pesos originales en bf16, lo que facilita su despliegue en equipos con memoria unificada de gama alta (Mac Studio, MacBook Pro con chip Max o Ultra).

La relevancia de esta ficha es acotada: se trata de una redistribución de conveniencia, con 40 descargas y sin likes en el momento de la consulta, publicada el 29 de octubre de 2026. La información disponible sobre arquitectura interna, datos de entrenamiento, idiomas y benchmarks del modelo base no está incluida en los materiales proporcionados, por lo que se marca como no disponible en los apartados correspondientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `gemma4_unified` (transformer, según metadatos del repo; detalles internos no disponibles) |
| Parámetros totales | 11.959.730.224 (≈12B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 5 bits (MLX); otras cuantizaciones no disponibles en este repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX), librería `mlx` |
| Tamaño del repositorio | 8,3 GB |
| Modelo base | google/gemma-4-12B-it |
| Repositorio fuente | mlx-community/gemma-4-12B-it-5bit (rev. `a2fa92fa5bdba1fc4be9d927a5d5188c17d87d09`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de la etiqueta `gemma4_unified` presente en los metadatos del repositorio. Se trata de un transformer de aproximadamente 12B parámetros afinado para instrucciones (`-it`), pero no se proporcionan datos sobre número de capas, dimensión de las representaciones, mecanismo de atención, tipo de tokenizador ni innovaciones técnicas concretas.

Tampoco se dispone de información sobre el corpus de entrenamiento (número de tokens, composición del dataset, proporción de código o multilingüismo), ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o similares. Lo único verificable en esta publicación es el proceso de conversión: los pesos originales de Google fueron convertidos a MLX y cuantizados a 5 bits por mlx-community, y Audante redistribuye esos ficheros sin modificaciones. El autor incluye, cuando está presente, un fichero `SHA256SUMS` con los checksums de cada archivo para verificar la integridad de la copia.

## Capacidades

- Generación de texto y respuesta a instrucciones: el sufijo `-it` indica ajuste para seguir instrucciones en formato conversacional.
- Razonamiento y conocimiento general: capacidades esperables en un modelo de 12B afinado para instrucciones, aunque no se documentan resultados concretos.
- Generación de código y matemáticas: no confirmado en la documentación disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas no está informado).
- Modo thinking, visión o audio: no disponible.
- Ejecución en Apple Silicon mediante MLX: capacidad confirmada por el formato y la librería del repositorio.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y la cuantización a 5 bits permiten cargar el modelo en memoria unificada de equipos de gama alta, sin necesidad de GPU dedicada ni de servicios en la nube, lo que resulta adecuado para prototipado y experimentación offline.
- Asistente conversacional de escritorio: al ser un modelo instruct de 12B, puede integrarse en aplicaciones locales de chat o edición de texto que requieran privacidad de datos, ejecutándose íntegramente en el equipo del usuario.
- Evaluación comparativa de cuantizaciones: sirve como punto de referencia para medir la pérdida de calidad de una cuantización a 5 bits frente a los pesos originales en bf16, en tareas de generación y seguimiento de instrucciones.
- Desarrollo de pipelines MLX: útil para equipos que construyen herramientas sobre la librería MLX y necesitan un modelo instruct de tamaño medio para probar integraciones, tokenizadores y gestión de memoria.
- Distribución verificable en entornos controlados: la presencia de `SHA256SUMS` y la declaración de identidad con el repositorio fuente facilitan la auditoría de integridad en despliegues donde se exige trazabilidad de los artefactos.
- Réplica de experimentos: al fijar la revisión exacta del repositorio de origen, permite reproducir resultados de terceros que hayan usado la misma conversión MLX de 5 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 8,3 GB en disco; en ejecución, la cuantización a 5 bits implica una huella de pesos del orden de 7-8 GB, a la que hay que sumar la memoria para KV cache y buffers de activación (no cuantificada en la documentación).
- Hardware objetivo: equipos Apple Silicon con memoria unificada, dado que el formato es MLX. No se documentan requisitos mínimos oficiales.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables directamente a este repositorio, que está empaquetado para MLX; para CUDA sería necesario recurrir a los pesos originales o a otras conversiones (GGUF, safetensors estándar).
- ¿Cabe en GPU de consumo? No disponible para el formato MLX; en el ecosistema Apple, requiere configuraciones de memoria unificada de gama alta, cuyo umbral exacto no se especifica.
- Opciones de despliegue: `mlx` (librería declarada) y `mlx-lm` como entorno habitual de inferencia para este formato. vLLM, llama.cpp, Ollama y TGI no se mencionan en la documentación y no están confirmados para estos ficheros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Audante/gemma-4-12B-it-MLX-5bit | ≈12B | no disponible | MLX safetensors, 5 bits | Apache 2.0 | Hugging Face, 40 descargas |
| mlx-community/gemma-4-12B-it-5bit | ≈12B | no disponible | MLX safetensors, 5 bits | Apache 2.0 | Hugging Face (fuente de esta copia) |
| google/gemma-4-12B-it | ≈12B | no disponible | safetensors (bf16 presumiblemente) | Apache 2.0 | Hugging Face (modelo original) |

La comparativa se limita a las tres variantes del mismo modelo base, ya que la documentación disponible no aporta datos de rendimiento ni de contexto que permitan contrastarlo con arquitecturas alternativas de tamaño similar. La diferencia entre las tres entradas es exclusivamente de formato y cuantización, no de capacidades del modelo.

## Limitaciones y advertencias

- No es una publicación oficial de Google: el autor lo declara explícitamente. Para uso en producción conviene referenciar el repositorio original o el de mlx-community.
- La cuantización a 5 bits puede degradar la calidad respecto a los pesos en bf16; no se aportan mediciones de esa pérdida en la documentación.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad del modelo base en los materiales proporcionados.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento adecuado en castellano ni en otras lenguas sin evaluación previa.
- Longitud de contexto no disponible: no es posible planificar cargas de contexto largo sin consultar la documentación del modelo original.
- Licencia Apache 2.0 permite uso comercial, pero al tratarse de una copia conviene verificar los términos del modelo base y conservar el fichero `LICENSE` incluido.
- Repositorio con muy poca tracción (40 descargas, 0 likes) y sin pipeline declarado; la ausencia de `pipeline_tag` puede afectar a la integración automática en algunas herramientas.
- Compatibilidad limitada al ecosistema MLX: no es directamente utilizable en stacks CUDA sin conversión adicional.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Audante/gemma-4-12B-it-MLX-5bit
- Repositorio fuente (mlx-community): https://huggingface.co/mlx-community/gemma-4-12B-it-5bit
- Modelo base (Google): https://huggingface.co/google/gemma-4-12B-it
- Librería MLX: https://github.com/ml-explore/mlx
- MLX-LM (inferencia de LLM en MLX): https://github.com/ml-explore/mlx-lm
