# SolsticeAI/Arete-27B-Unlocked-Uncensored-Heretic-mlx-5Bit

## Resumen

Arete-27B-Unlocked-Uncensored-Heretic-mlx-5Bit es una conversión al formato MLX (cuantización de 5 bits) del modelo SolsticeAI/Arete-27B-Unlocked-Uncensored-Heretic, un modelo de lenguaje de aproximadamente 26.900 millones de parámetros derivado de la familia Qwen 3.5 según la etiqueta `qwen3_5` del repositorio. El autor, SolsticeAI, lo distribuye bajo licencia Apache 2.0 y lo orienta a generación de texto y conversación, con un ajuste fino supervisado (SFT) sobre el dataset NousResearch/arete-data-pairs y un proceso declarado de "value alignment" que incluye técnicas de tipo *abliteration* o *decensoring* para reducir los rechazos del modelo base.

El interés práctico de esta variante concreta es que está empaquetada específicamente para Apple Silicon mediante la librería MLX (convertida con mlx-lm 0.31.2), lo que permite ejecutar un modelo de casi 27.000 millones de parámetros en equipos Mac con memoria unificada, algo imposible con muchas alternativas en FP16. El repositorio ocupa 18,5 GB, coherente con una cuantización de 5 bits de los pesos originales.

Se trata de un modelo recién publicado (creado el 12 de noviembre de 2026) sin descargas ni valoraciones registradas en el momento de redactar esta ficha, y la información pública disponible es muy limitada: la model card solo documenta el proceso de conversión a MLX y el uso básico con mlx-lm, sin detallar arquitectura interna, datos de entrenamiento ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, segun tag `qwen3_5`; detalles internos no disponibles) |
| Parametros totales | 26.895.993.856 (~26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits (formato MLX); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5`, que sugiere que el modelo base pertenece a la familia Qwen 3.5 de Alibaba. El modelo original fue sometido a un ajuste fino supervisado (SFT) sobre el dataset NousResearch/arete-data-pairs, según los tags del repositorio, y a un proceso de alineación de valores ("value-alignment") que el autor combina con técnicas etiquetadas como *heretic*, *uncensored*, *decensored* y *abliterated*. Estas etiquetas describen habitualmente intervenciones sobre las direcciones de activación o los pesos para reducir la tendencia del modelo a rechazar peticiones, pero no se especifica en la información proporcionada qué metodología exacta se aplicó ni con qué hiperparámetros.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset más allá de su nombre, ni si hubo etapas de RLHF o DPO. La única innovación técnica documentada es la conversión a formato MLX mediante mlx-lm 0.31.2, que permite la inferencia nativa en hardware Apple Silicon con cuantización de 5 bits.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado `text-generation` y la etiqueta `conversational`.
- Ajuste fino supervisado sobre pares de datos de NousResearch, orientado presumiblemente a seguir instrucciones (no se detalla el contenido exacto del dataset).
- Comportamiento "uncensored"/"abliterated": el modelo está diseñado para reducir rechazos ante peticiones que el modelo base podría declinar.
- Soporte de plantilla de chat: la model card muestra el uso de `tokenizer.apply_chat_template`, por lo que conserva el formato conversacional del modelo base.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Tool calling, function calling, agentes, razonamiento multi-paso, visión o audio: no disponible (no se documentan en la información proporcionada).

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX de 5 bits y sus 18,5 GB permiten cargar el modelo en Macs con memoria unificada alta (por ejemplo, 32 GB o más), usando `mlx-lm` como runtime. Es el caso de uso principal y el único documentado explícitamente por el autor.
- Prototipado de asistentes conversacionales en local: la plantilla de chat y el pipeline de generación de texto permiten montar un chatbot multi-turno sin depender de servicios en la nube, útil para pruebas de concepto con datos sensibles que no deben salir del equipo.
- Investigación sobre alineación y censura: al ser un modelo "abliterated" y "decensored", sirve como objeto de estudio para comparar el comportamiento de un modelo alineado frente a su variante intervenida, por ejemplo midiendo tasas de rechazo.
- Evaluación de técnicas de cuantización: la variante de 5 bits frente al modelo original permite estudiar la degradación de calidad asociada a la cuantización en un modelo de ~27B, comparando respuestas entre ambos.
- Generación de texto creativo sin filtros: para proyectos de escritura, guion o narrativa donde se requiera menor intervención del modelo en la selección de contenido.
- Fine-tuning posterior sobre MLX: el formato y la licencia Apache 2.0 permiten usar este checkpoint como base para ajustes adicionales en entornos Apple, aunque no se documentan recetas de entrenamiento en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio pesa 18,5 GB en cuantización de 5 bits; se necesita al menos esa cantidad de memoria unificada más el overhead del runtime y del contexto (estimación práctica: 20-24 GB en total, aunque el autor no publica cifras oficiales).
- Hardware objetivo: Apple Silicon (series M1/M2/M3/M4 y superiores) con memoria unificada suficiente; el formato MLX no está pensado para GPU NVIDIA.
- ¿Cabe en consumer GPU? No en el sentido habitual: al ser un formato MLX, está orientado a Macs. Para GPU NVIDIA habría que usar el modelo original o generar una cuantización GGUF/AWQ propia (no disponible en este repositorio).
- Despliegue: `mlx-lm` (versión 0.31.2 usada en la conversión) mediante Python; no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI para este artefacto concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Arete-27B-Unlocked-Uncensored-Heretic-mlx-5Bit | ~26,9B | no disponible | MLX safetensors 5 bits | Apache 2.0 | Variante local para Apple Silicon, sin benchmarks publicados |
| SolsticeAI/Arete-27B-Unlocked-Uncensored-Heretic (modelo base) | ~26,9B | no disponible | safetensors (presumiblemente FP16/BF16) | Apache 2.0 | Mismo ajuste fino, sin cuantizar; requiere más memoria |
| Familia Qwen 3.5 (modelos oficiales) | no disponible | no disponible | safetensors, GGUF (segun variante) | variable segun modelo | Modelo de referencia del que deriva; alineación estándar, no "abliterated" |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas de calidad, razonamiento o código publicadas, por lo que no es posible evaluar la degradación introducida por el ajuste fino ni por la cuantización de 5 bits.
- Riesgo de alucinación: no cuantificado; como en cualquier modelo de ~27B sin evaluación publicada, debe validarse en el dominio de uso.
- Modelo "uncensored"/"abliterated": el proceso de reducción de rechazos puede aumentar la probabilidad de generar contenido dañino, sesgado o inexacto; requiere filtros y salvaguardas propias en producción.
- Idiomas no documentados: se desconoce el soporte real de castellano u otras lenguas más allá de lo que herede del modelo base.
- Contexto no documentado: no se conoce la ventana máxima, lo que impide planificar casos de uso con documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable del cumplimiento normativo del contenido generado y de las obligaciones de atribución.
- Formato MLX: no es portable directamente a GPU NVIDIA ni a la mayoría de infraestructuras cloud estándar; limita el despliegue a hardware Apple.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado su comportamiento.
- Fecha de creación futura respecto a los datos habituales de referencia (2026): conviene verificar la procedencia y reproducibilidad del checkpoint antes de usarlo en entornos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SolsticeAI/Arete-27B-Unlocked-Uncensored-Heretic-mlx-5Bit
- Modelo base: https://huggingface.co/SolsticeAI/Arete-27B-Unlocked-Uncensored-Heretic
- Dataset de ajuste fino: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
- Documentación de MLX: https://ml-explore.github.io/mlx/
