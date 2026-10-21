# abenzerps/Spark-X2.6-4B-MLX-8bit

## Resumen

Spark-X2.6-4B-MLX-8bit es la cuantización a 8 bits en formato MLX del modelo XHToken/Spark-X2.6-4B, un modelo de lenguaje de 4.112.079.360 parámetros (aproximadamente 4,11 mil millones) con arquitectura de atención híbrida y una ventana de contexto nativa de 1.048.576 tokens (1M). Lo publica el usuario abenzerps, un tercero que distribuye conversiones MLX del modelo original de XHToken, no el desarrollador del modelo base.

El interés de esta ficha no está en el modelo en sí —que ya existe en su versión original— sino en el hecho de que esta conversión permite ejecutar un modelo de 4B con contexto de un millón de tokens en Apple Silicon mediante MLX y mlx-lm, sin depender de CUDA ni de infraestructura en la nube. El modelo base está etiquetado por su autor como «on-device» y orientado a la ejecución de agentes, lo que encaja con el objetivo de despliegue local que persigue esta cuantización.

La licencia es Apache-2.0, heredada del modelo fuente, lo que permite uso comercial sin restricciones adicionales conocidas. El repositorio ocupa 4,4 GB y se distribuye con la plantilla de chat original (`chat_template.jinja`) y un fichero de sumas de verificación SHA256. La información pública disponible sobre arquitectura interna, datos de entrenamiento y resultados numéricos de benchmarks es muy limitada: la model card remite a una imagen comparativa del modelo upstream y no publica cifras.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (hybrid-attention); el modelo base se describe como «on-device hybrid-attention language model». La proporción exacta de capas de atención completa frente a capas lineales no está disponible |
| Parámetros totales | 4.112.079.360 (~4,11 B), según los safetensors del repositorio |
| Parámetros activos | No aplica: no hay indicios de que sea un modelo MoE |
| Longitud de contexto | 1.048.576 tokens (1M) nativos, según la model card |
| Tipos de cuantización | 8 bits (esta versión, 4,37 GB); el mismo autor publica 6 bits (3,34 GB) y 4 bits (2,32 GB). El modelo base se distribuye en precisión original |
| Idiomas soportados | No disponible: la model card no declara lista de idiomas ni el campo `language` está poblado |
| Licencia | Apache-2.0 (heredada de XHToken/Spark-X2.6-4B) |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`); incluye `chat_template.jinja` y `SHA256SUMS.txt` |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura de atención híbrida, según la descripción de la model card, combinando mecanismos de atención con el objetivo de reducir el coste computacional y de memoria en contextos muy largos. Esa es precisamente la condición que hace viable una ventana de 1M tokens en un modelo de 4B pensado para ejecución en dispositivo. No se especifica en la información disponible cuántas capas son de atención completa, cuántas son lineales o de otro tipo, ni la dimensión oculta, el número de cabezas o el vocabulario.

Tampoco hay datos públicos sobre el entrenamiento: no se indica el número de tokens, la composición del corpus, si hubo fases de RLHF, DPO u otro ajuste por preferencias, ni detalles del tokenizador. La model card menciona que el modelo base tiene un «thinking mode» (modo de razonamiento), ya que los benchmarks citados se reportaron en ese modo, pero no se documenta cómo se activa ni su formato exacto. Esta versión concreta no introduce cambios arquitectónicos: es una cuantización de pesos a 8 bits realizada con las herramientas de MLX, que preserva la estructura del modelo original y sustituye los tensores por versiones de menor precisión.

## Capacidades

- Generación de texto conversacional, con plantilla de chat incluida en el repositorio para el formato de turnos del modelo original.
- Procesamiento de contexto largo: ventana nativa de 1.048.576 tokens, adecuada para documentos completos, bases de código extensas o historiales de conversación muy prolongados.
- Modo de razonamiento («thinking mode») heredado del modelo base, citado por el autor al reportar los benchmarks upstream.
- Orientación a agentes: el modelo base se describe explícitamente como «engineered for high-efficiency agent execution», lo que sugiere uso en bucles de decisión y ejecución de tareas.
- Ejecución en dispositivo sobre Apple Silicon mediante MLX, sin necesidad de GPU dedicada ni de conexión a servicios externos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se declara cobertura de idiomas.
- Visión, audio u otras modalidades: no disponibles; el pipeline declarado es únicamente `text-generation`.

## Casos de uso

- Agentes locales en macOS: el modelo puede ejecutarse con mlx-lm sobre un Mac con Apple Silicon y actuar como motor de decisión de un agente que llama a herramientas locales (ficheros, shell, APIs internas), manteniendo todos los datos en la máquina. Su orientación a agentes y su contexto de 1M son adecuados para historiales de ejecución largos.
- Análisis de repositorios completos: con 1M tokens de contexto se puede inyectar el código de un proyecto de tamaño medio y pedir auditorías, explicaciones de arquitectura o localización de bugs entre módulos, sin trocear en fragmentos que rompan las referencias cruzadas.
- Asistencia sobre documentación extensa: resumen y consulta de normativas, manuales técnicos o contratos de cientos de páginas en un único pase, útil en entornos donde no se permite enviar documentos a la nube.
- Prototipado rápido en portátil: un desarrollador puede validar prompts, plantillas de chat y flujos de agente con `python -m mlx_lm generate` o la API de Python antes de invertir en infraestructura GPU o en la versión completa del modelo.
- Procesamiento por lotes de transcripciones y registros: ingesta de transcripciones de reuniones o logs de varias horas en una sola ventana para extraer decisiones, tareas y entidades, ejecutado de forma local y sin coste por token.
- Evaluación comparativa de cuantizaciones: al existir versiones de 8, 6 y 4 bits del mismo modelo, sirve para medir en un Mac la pérdida de calidad frente al ahorro de memoria antes de fijar la variante de producción.
- Investigación sobre atención híbrida: al ser un modelo pequeño con contexto declarado de 1M, es un banco de pruebas asequible para estudiar degradación de recuperación de información a lo largo de la ventana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente una imagen (`assets/benchmark.png`) descrita como «benchmark comparison» del modelo upstream Spark-X2.6-4B, reportada por XHToken en modo thinking, sin cifras textuales ni tabla con valores. No se dispone por tanto de datos verificables de MMLU, HumanEval, GSM8K ni de ninguna otra métrica para esta cuantización.

## Requisitos de hardware

- MLX requiere Apple Silicon (familias M1, M2, M3, M4 o posteriores); no funciona sobre GPUs NVIDIA ni CPU x86 convencional a través de esta librería.
- Peso de los parámetros en 8 bits: aproximadamente 4,37 GB (el repositorio completo ocupa 4,4 GB). A ello hay que sumar el coste del caché KV, que crece con la longitud de contexto y no está cuantificado en la documentación.
- Estimación orientativa de memoria unificada: 8 GB es el mínimo ajustado para la variante de 4 bits (2,32 GB de pesos) con contextos moderados; 16 GB es un punto de partida razonable para la de 8 bits; para explotar contextos de cientos de miles de tokens conviene disponer de 32 GB o más. Son estimaciones, no cifras publicadas por el autor.
- GPU recomendadas: no aplica en el sentido habitual; el hardware objetivo son los chips de Apple. Para el modelo base en otros formatos, la información no está disponible en esta ficha.
- Despliegue: `mlx-lm` (CLI `mlx_lm generate` y API Python `load`/`generate`). No se distribuyen pesos GGUF, por lo que llama.cpp y Ollama no pueden consumir este repositorio directamente; tampoco hay soporte declarado para vLLM o TGI.
- Latencia y throughput: no disponibles. Dependen del chip concreto, del ancho de banda de memoria y de la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-4B-MLX-8bit (esta ficha) | 4,11 B | 1.048.576 | MLX safetensors, 8 bits (4,37 GB) | Apache-2.0 | HuggingFace, 0 descargas, 1 like |
| Spark-X2.6-4B-MLX-6bit | 4,11 B | 1.048.576 | MLX safetensors, 6 bits (3,34 GB) | Apache-2.0 | HuggingFace, mismo autor |
| Spark-X2.6-4B-MLX-4bit | 4,11 B | 1.048.576 | MLX safetensors, 4 bits (2,32 GB) | Apache-2.0 | HuggingFace, mismo autor |
| XHToken/Spark-X2.6-4B (modelo base) | 4,11 B | 1.048.576 | Pesos originales en safetensors | Apache-2.0 | HuggingFace, autor original |
| Spark-X2.5-4B / Spark-X2.5-1.7B (generación anterior) | No disponible | No disponible | No disponible | No disponible | Citados en la galería de modelos de LocalAI |

No se han identificado en la información proporcionada otros modelos de la misma categoría con datos verificables (parámetros, contexto, benchmarks) como para establecer una comparación cuantitativa fiable frente a alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Sesgos: no hay documentación sobre sesgos, composición del corpus ni evaluación de seguridad del modelo base ni de esta cuantización.
- Alucinación: es un modelo de 4B de parámetros; la probabilidad de generar información incorrecta con apariencia de verosimilitud es relevante, especialmente en tareas factuales sin recuperación externa. No se han publicado evaluaciones de fidelidad.
- Idiomas: la lista de idiomas no está declarada. No se puede asumir un rendimiento correcto en castellano sin una evaluación propia.
- Contexto: los 1M tokens son una capacidad declarada, pero no hay datos sobre la degradación de la recuperación de información a lo largo de la ventana. El coste de memoria del caché KV para contextos extremos puede superar la memoria unificada de muchos equipos.
- Cuantización: los 8 bits introducen una pérdida de precisión respecto al modelo original. No se publica ninguna comparación de calidad entre la versión de 8 bits y el modelo base.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero conviene conservar los avisos de copyright y verificar la licencia del modelo base en su repositorio original antes de redistribuir.
- Procedencia: es una conversión de un tercero (`abenzerps`), no una publicación oficial de XHToken. El repositorio incluye sumas SHA256 para verificar la integridad de los ficheros, pero no se documenta el procedimiento de cuantización empleado.
- Madurez: el repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que no existe validación de la comunidad sobre su funcionamiento en producción.
- Ecosistema: al ser un formato MLX, queda fuera de los pipelines habituales basados en CUDA (vLLM, TGI) y de llama.cpp/Ollama, lo que limita su integración en infraestructuras existentes.
- Benchmarks: la única referencia de rendimiento es una imagen sin cifras; no es posible auditar los resultados.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/abenzerps/Spark-X2.6-4B-MLX-8bit
- Cuantización 6 bits del mismo autor: https://huggingface.co/abenzerps/Spark-X2.6-4B-MLX-6bit
- Cuantización 4 bits del mismo autor: https://huggingface.co/abenzerps/Spark-X2.6-4B-MLX-4bit
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Licencia del modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B/blob/main/LICENSE
- Sumas de verificación del repositorio: https://huggingface.co/abenzerps/Spark-X2.6-4B-MLX-8bit/blob/main/SHA256SUMS.txt
- Formulario de peticiones de modelos del autor: https://abenzerps.com/request-a-model/
- Galería de modelos de LocalAI (mención de la familia Spark-X2.5): https://localai.io/docs/gallery.html
