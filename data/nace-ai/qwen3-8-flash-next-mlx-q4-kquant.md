# nace-ai/Qwen3.8-Flash-Next-MLX-Q4-KQuant

## Resumen

Qwen3.8-Flash-Next-MLX-Q4-KQuant es una cuantización de 4 bits del modelo multimodal Qwen3.8-Flash-Next de Alibaba Qwen, publicada por el usuario independiente nace-ai para su uso en Macs con Apple Silicon mediante la librería MLX. El modelo base es un transformer multimodal de tipo image-text-to-text con 179.999.981.459 parámetros totales (aproximadamente 180 mil millones), lo que lo sitúa en la categoría de modelos densos de gran escala. Esta versión concreta emplea una cuantización mixta: grupos de 64 en 4 bits con 696 módulos elevados a 8 bits, lo que reduce el peso del modelo de lenguaje a 105,20 GB frente a los 110,62 GB de una cuantización 4-bit convencional de mlx-community.

La relevancia de este pack radica en su fidelidad respecto al modelo original en BF16: el autor reporta una divergencia KL de 0,067, frente a 0,249 de la alternativa de mlx-community, lo que indica una degradación notablemente menor pese a ocupar menos espacio. Está pensado para ejecutarse en equipos con 192 GB de memoria unificada o más (Mac Studio M3 Ultra, por ejemplo), y requiere versiones recientes de mlx-vlm (0.7.8) o del motor propietario Kapitsa de Nace, ya que mlx-lm 0.32.2 no soporta aún esta arquitectura. El modelo conserva las capacidades del original: modo thinking configurable, tool calling y procesamiento de imagen y texto.

La ficha se basa exclusivamente en la información disponible en Hugging Face y en la model card del autor; los datos sobre entrenamiento, benchmarks o idiomas del modelo base no se detallan en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 179.999.981.459 (~180 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit con grupos de 64 y 696 modulos en 8-bit (grupos de 64 o 128); formato MLX |
| Idiomas soportados | No disponible |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors (pack MLX), cuantizacion Q4 KQuant |
| Tamano del repo | 179,1 GB (descarga Q4: 107,6 GB) |
| Libreria | mlx (mlx-vlm 0.7.8, MLX 0.32.4) |
| Modelo base | Qwen/Qwen3.8-Flash-Next |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer multimodal que acepta entradas de imagen y texto y genera texto (pipeline image-text-to-text). Con ~180 mil millones de parámetros, se trata de un modelo denso, no de una arquitectura MoE, según los datos de safetensors disponibles. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación; tampoco se especifican innovaciones arquitectónicas internas como atención lineal o decodificación especulativa.

La contribución técnica de esta ficha es la cuantización: nace-ai aplica un esquema Q4 KQuant con grupos de 64 elementos y eleva selectivamente 696 módulos a 8 bits, lo que reduce el peso del modelo de lenguaje a 105,20 GB manteniendo una divergencia KL de 0,067 respecto al BF16 original. El autor indica que esta cifra es sustancialmente mejor que la de mlx-community 4-bit (KL 0,249) y que la de otros packs públicos como TensorFold 4-bit y TensorFold oQ4-MTP. El pack incluye un modo thinking activado por defecto, con profundidades configurables (`low`, `medium`, `xhigh`) y posibilidad de desactivarlo mediante `enable_thinking=False` o `reasoning_effort: "none"`.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat compatible con el tokenizador de Qwen.
- Procesamiento de imagen y texto (image-text-to-text): el pipeline declarado admite entradas visuales junto a prompts textuales.
- Modo thinking (razonamiento extendido) activado por defecto, con control de profundidad mediante `reasoning_effort` (`low`, `medium`, `xhigh`) y desactivación explícita.
- Tool calling / function calling: la model card documenta un ciclo completo con definiciones de herramientas estilo OpenAI a través del servidor Kapitsa (`kapitsa serve`), incluyendo el envío del resultado de la herramienta y la generación de la respuesta final.
- Servicio de APIs compatibles con OpenAI, Anthropic y Ollama mediante Kapitsa, además de una interfaz web de chat.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de audio ni de agente autónomo multi-paso más allá del tool calling descrito.

## Casos de uso

- Asistente conversacional local en Mac Studio: con 107,6 GB de descarga y un requisito estimado de 192 GB de memoria unificada, el modelo puede servir un chat multi-turno con modo thinking en un equipo de sobremesa Apple Silicon, sin depender de la nube.
- Automatización con tool calling: integrado mediante `kapitsa serve`, el modelo puede invocar funciones externas (por ejemplo, consultas meteorológicas, APIs internas) siguiendo el esquema de herramientas de OpenAI, lo que permite construir asistentes que ejecutan acciones y devuelven resultados al usuario.
- Análisis de documentos con imagen: al ser un modelo image-text-to-text, puede recibir capturas, diagramas o páginas escaneadas junto a instrucciones textuales para extraer información o responder preguntas sobre el contenido visual.
- Razonamiento matemático asistido: el modo thinking con profundidad configurable permite tareas como cálculos y problemas de varios pasos (la model card usa `17 * 23` como ejemplo de consulta), ajustando el esfuerzo de razonamiento según la complejidad.
- Sustitución de APIs en desarrollo: al exponer endpoints compatibles con OpenAI, Anthropic y Ollama, el modelo puede actuar como backend local para prototipos de aplicaciones que ya usan esos SDK, sin cambiar el código cliente.
- Evaluación de cuantizaciones: investigadores pueden comparar la fidelidad de este pack Q4 (KL 0,067) frente a alternativas de mlx-community o TensorFold en sus propias tareas, usando el mismo modelo base y el mismo runtime MLX.
- Despliegue en pipelines de CI o entornos de investigación: la licencia qwen-community-1.0 y el formato MLX permiten integrar el modelo en flujos de trabajo internos sobre hardware Apple, siempre que se cumplan los términos de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la divergencia KL respecto al modelo BF16 original:

| Metrica | Nace Q4 (este repo) | mlx-community 4-bit | TensorFold 4-bit | TensorFold oQ4-MTP |
|---|---|---|---|---|
| KL a BF16 (menor es mejor) | 0,067 | 0,249 | No disponible | No disponible |
| Peso del modelo de lenguaje (GB) | 105,20 | 110,62 | No disponible | No disponible |

No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 192 GB o más según la regla del autor (descarga de 107,6 GB más 2 GB para conversación dentro de la cuota de GPU por defecto de macOS). Kapitsa puede ajustarse en un tamaño inferior porque omite las partes que no usa; `kapitsa doctor` verifica un Mac concreto.
- GPU recomendadas: Apple Silicon con memoria unificada de 192 GB o superior (por ejemplo, Mac Studio con M3 Ultra). El autor verificó la carga con mlx-vlm 0.7.8 y MLX 0.32.4 en CUDA sobre NVIDIA H200, pero no en un Mac.
- ¿Cabe en GPU de consumo? No: 107,6 GB de pesos superan la VRAM de cualquier GPU consumer actual (RTX 4090 con 24 GB, por ejemplo). Solo es viable en equipos Apple con memoria unificada muy alta.
- Opciones de despliegue: mlx-vlm 0.7.8 (verificado en el release check), Kapitsa 0.2.36 (sirve una revisión anterior del repo, `8fda1047`, no los archivos de `Q4/`; el soporte para `Q4/` llegará en una versión posterior). mlx-lm 0.32.2 no puede cargar esta arquitectura y otras aplicaciones MLX no fueron probadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KL a BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nace Q4 (este repo) | ~180 B | No disponible | 4-bit KQuant (696 modulos a 8-bit) | 0,067 | qwen-community-1.0 | Hugging Face, 107,6 GB |
| mlx-community 4-bit | No disponible (mismo base) | No disponible | 4-bit | 0,249 | No disponible | Hugging Face |
| TensorFold 4-bit | No disponible (mismo base) | No disponible | 4-bit | No disponible | No disponible | Hugging Face |
| TensorFold oQ4-MTP | No disponible (mismo base) | No disponible | 4-bit | No disponible | No disponible | Hugging Face |

Las alternativas comparadas son otras cuantizaciones del mismo modelo base Qwen3.8-Flash-Next; no se dispone de datos de modelos de distinta familia para una comparación cruzada.

## Limitaciones y advertencias

- Requisito de hardware muy elevado: 192 GB de memoria unificada como regla general; no cabe en GPUs de consumo ni en la mayoría de estaciones de trabajo convencionales.
- Compatibilidad limitada: mlx-lm 0.32.2 no carga esta arquitectura; solo mlx-vlm 0.7.8 está verificado, y Kapitsa 0.2.36 sirve una revisión anterior del repo, no los archivos de `Q4/`. Otras aplicaciones MLX no han sido probadas.
- El release check se ejecutó en CUDA (NVIDIA H200), no en un Mac; el autor no garantiza el funcionamiento en Apple Silicon pese a ser el público objetivo del pack.
- La cuantización introduce una divergencia respecto al BF16 (KL 0,067), que aunque baja puede afectar a tareas sensibles a la precisión.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; se aplican los riesgos habituales de los modelos de lenguaje de gran escala, sin datos específicos.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Licencia qwen-community-1.0: es una licencia "other" que puede imponer restricciones al uso comercial; debe revisarse el archivo LICENSE antes de desplegar en producción.
- El modo thinking está activado por defecto y consume hasta 32.768 tokens de salida en tareas complejas; con valores altos de `presence_penalty` el modelo puede mezclar idiomas, según advierte la model card.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible, por lo que la evaluación del rendimiento real queda pendiente de pruebas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX-Q4-KQuant
- Repositorio del pack MLX (raíz): https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Mejores practicas del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next#best-practices
- Revision anterior servida por Kapitsa 0.2.36: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX/tree/8fda104737236c4bbe1d6fb2784fb499ffd0a4cd
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Assets de la model card (grafico KL vs tamano): https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX/resolve/main/assets/nace-dark.svg
