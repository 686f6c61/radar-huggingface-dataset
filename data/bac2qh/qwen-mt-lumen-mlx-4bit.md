# bac2qh/Qwen-MT-Lumen-MLX-4bit

## Resumen

Qwen-MT-Lumen-MLX-4bit es una conversión no oficial a 4 bits en formato MLX del modelo de traducción ATH-MaaS/Qwen-MT-Lumen, un transformer de 14.769.617.920 parámetros (aproximadamente 14,8 mil millones) derivado de la familia Qwen3 y presentado como la base del envío de Lumen a la campaña WMT26. El autor de esta conversión es el usuario de Hugging Face bac2qh, que no tiene relación con el equipo original y advierte explícitamente de que el modelo no ha sido revisado ni respaldado por los autores de Qwen-MT-Lumen. El pipeline declarado es `translation` y la librería de destino es `mlx`, lo que orienta el uso a hardware Apple Silicon.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar en un equipo Mac un modelo de traducción de casi 15.000 millones de parámetros con un peso de repositorio de 8,3 GB, frente a los aproximadamente 29,5 GB de los pesos originales en BF16. Por otro, conviene subrayar que los resultados de WMT26 del equipo original no provienen solo del modelo, sino de un pipeline de decodificación con división estructurada, comprobaciones de reglas y reintentos; esta build contiene únicamente el modelo, sin esa capa.

El modelo tiene una ventana de contexto dura de 4.096 tokens que incluye prompt y salida, y está pensado para traducción guiada por instrucciones con un formato de prompt muy concreto (`#guidelines` y `#src_text`) y decodificación greedy. La licencia declarada es Apache 2.0, aunque el repositorio original no incluye fichero de licencia y el autor de esta conversión ha añadido el texto estándar de Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (según tag `qwen3` y código `mlx-lm` usado en la conversión) |
| Parametros totales | 14.769.617.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens (prompt más salida, límite duro) |
| Tipos de cuantizacion | 4 bits afín con group size 64 (MLX); los pesos originales están en BF16 |
| Idiomas soportados | no disponible en la información proporcionada; la model card original lista 23 direcciones, en su mayoría desde inglés, y no incluye chino a inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (`mlx`, cuantización 4-bit) |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como un Qwen3, es decir, un transformer decoder-only con atención causal, y el proceso de conversión se ha realizado con `mlx-lm` 0.31.1 usando el código de modelo `qwen3`. Los pesos originales están en BF16 y ocupan aproximadamente 29,5 GB; esta build los reduce a 4 bits afín con group size 64. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo fases de RLHF, DPO o ajuste fino supervisado específico para traducción.

La única modificación de configuración documentada es la adición de `"rope_theta": 10000` en el nivel superior de `config.json`, ya que el `config.json` original solo declaraba `rope_theta` dentro de `rope_parameters` (esquema de transformers 5.x) y el código `qwen3` de `mlx-lm` 0.31.1 lee la clave de nivel superior. La plantilla de chat incluida (`chat_template.jinja`) es la del modelo original, con formato `Human: … Assistant:`. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Traducción automática guiada por instrucciones en las 23 direcciones listadas por la model card original, mayoritariamente con el inglés como lengua de origen; el par chino a inglés no está entre ellas.
- Control de estilo y terminología mediante el bloque `#guidelines` del prompt, que permite inyectar instrucciones específicas de registro, dominio o vocabulario.
- Procesamiento de texto de origen delimitado en `#src_text`, lo que facilita el uso programático con plantillas.
- Generación de texto condicionada por el template `Human: … Assistant:` del modelo original.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento explícito.
- Capacidades multilingües: limitadas a las direcciones declaradas por el modelo original; no hay lista completa de idiomas en la información disponible.

## Casos de uso

- Traducción de documentación técnica en local: el modelo puede traducir ficheros Markdown o reStructuredText desde inglés a las lenguas soportadas en un Mac con Apple Silicon, usando el prompt con `#guidelines` para fijar terminología consistente por proyecto.
- Localización de interfaces y cadenas de producto: con contexto de 4.096 tokens se pueden procesar lotes de cadenas cortas en una sola llamada, manteniendo coherencia terminológica dentro del lote mediante las guías inyectadas.
- Traducción de correos y comunicaciones internas con requisitos de privacidad: al ejecutarse en MLX sobre hardware local, los textos no salen del equipo, lo que resulta adecuado para contenido confidencial que no puede enviarse a una API externa.
- Prototipado de pipelines de traducción en investigación: sirve como modelo base para experimentar con estrategias de división estructurada, comprobaciones de reglas y reintentos, replicando el enfoque del envío original a WMT26.
- Traducción de artículos y notas de prensa con control de estilo: el bloque `#guidelines` permite indicar registro formal o informal y convenciones de tratamiento por idioma.
- Evaluación comparativa de cuantizaciones: al existir los pesos BF16 originales, esta build de 4 bits permite medir la pérdida de calidad frente al modelo completo en un conjunto de validación propio, con un coste de almacenamiento de 8,3 GB frente a 29,5 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión no incluye métricas (BLEU, COMET, chrF u otras) ni comparaciones cuantitativas con el modelo BF16 original; únicamente menciona que los resultados de WMT26 del equipo original se obtuvieron con un pipeline de decodificación alrededor del modelo, no con esta build aislada.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio pesa 8,3 GB en safetensors de 4 bits; en la práctica se necesita algo más de memoria para el grafo de inferencia, el tokenizador y la caché KV de hasta 4.096 tokens, por lo que conviene disponer de 12 GB o más de memoria unificada.
- Hardware objetivo: Apple Silicon con MLX; encaja en equipos con 16 GB de memoria unificada o superior (familias M1/M2/M3/M4 en configuraciones con suficiente RAM).
- GPU NVIDIA: no es el destino de esta build; para A100, H100 o RTX 4090 habría que usar los pesos BF16 originales o generar una cuantización GGUF/AWQ propia, no documentada aquí.
- Despliegue: `mlx-lm` 0.31.1 o superior mediante `mlx_lm.load` y `mlx_lm.generate`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen-MT-Lumen-MLX-4bit (esta ficha) | 14,77 B | 4.096 tokens | MLX safetensors, 4 bits grupo 64 | Apache 2.0 | Conversión no oficial, solo Apple Silicon |
| ATH-MaaS/Qwen-MT-Lumen | 14,77 B | 4.096 tokens | BF16, ~29,5 GB | Apache 2.0 declarada | Modelo original, base del envío WMT26 con pipeline de decodificación |
| Otros modelos de traducción de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Conversión no oficial: no ha sido revisada ni respaldada por los autores de Qwen-MT-Lumen, por lo que la calidad de la cuantización a 4 bits no está validada por el equipo original.
- Los resultados de WMT26 del equipo original dependen de un pipeline de decodificación con división estructurada, comprobaciones de reglas y reintentos; esta build contiene solo el modelo y no reproduce esos resultados por sí sola.
- Contexto muy limitado: 4.096 tokens que incluyen prompt y salida, insuficiente para documentos largos sin troceado previo.
- Cobertura de idiomas restringida a las 23 direcciones del modelo original, mayoritariamente desde inglés, y sin chino a inglés; no se dispone de la lista completa de pares.
- Riesgo de alucinación y de deriva terminológica inherente a los modelos generativos, especialmente con decodificación greedy y prompts ambiguos.
- Licencia Apache 2.0 declarada, pero el repositorio original no contiene fichero de licencia; conviene verificar los términos con los autores antes de un uso comercial en producción.
- Dependencia de una versión concreta de `mlx-lm` (0.31.1) y de un cambio manual en `config.json` (`rope_theta`), lo que puede generar incompatibilidades con versiones futuras.
- Sin datos publicados de benchmarks que permitan estimar la degradación de calidad respecto al modelo BF16.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/bac2qh/Qwen-MT-Lumen-MLX-4bit
- Modelo base: https://huggingface.co/ATH-MaaS/Qwen-MT-Lumen
- Revisión concreta del modelo base usada en la conversión: https://huggingface.co/ATH-MaaS/Qwen-MT-Lumen/tree/3bf800fcf95d8ae7e58c6f2221fd1e100d9dfca8
- Librería MLX: https://github.com/ml-explore/mlx
- Texto de la licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
