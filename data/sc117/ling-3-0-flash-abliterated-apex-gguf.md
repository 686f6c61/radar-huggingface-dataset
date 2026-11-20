# SC117/Ling-3.0-flash-abliterated-APEX-GGUF

## Resumen

Ling-3.0-flash-abliterated-APEX-GGUF es una compilación comunitaria del modelo Ling-3.0-flash de inclusionAI, publicada por el usuario SC117 en Hugging Face. Se trata de un modelo de lenguaje de arquitectura híbrida MoE (mixture of experts) con 127.486 millones de parámetros totales y aproximadamente 5.100 millones de parámetros activos, lo que lo sitúa en la categoría de modelos dispersos de gran escala pero con coste de inferencia contenido. El modelo base emplea una pila híbrida nativa desde el preentrenamiento que combina atención lineal Kimi Delta Attention (KDA) y gated MLA en una proporción 5:1, junto con un MoE disperso 1/64 con 512 expertos enrutados (top-8) más un experto compartido, dos capas densas y una cabeza MTP entrenada.

La relevancia de esta ficha concreta reside en que no es una publicación oficial de inclusionAI, sino una modificación en dos pasos: primero se aplica una receta de eliminación de rechazos (abliteration) mediante un LoRA de abliterix v6 trial 21 fusionado estáticamente en BF16, y después se convierte a GGUF con cuantización de precisión mixta APEX. El resultado es un modelo con una tasa de rechazo notablemente inferior a la del original, empaquetado en formato GGUF para su despliegue en llama.cpp y entornos compatibles.

El contexto oficial del modelo base sigue una programación de 8K a 32K y hasta 256K tokens, con el modo de razonamiento (thinking) activado por defecto en la model card oficial. La licencia es MIT, lo que facilita el uso comercial, aunque la naturaleza abliterada del paquete exige una evaluación de seguridad y cumplimiento por parte del integrador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida MoE con pila híbrida lineal: Kimi Delta Attention (KDA) + gated MLA en proporción 5:1; MoE disperso 1/64; arquitectura GGUF `bailingmoe3` |
| Parámetros totales | 127.486.405.600 (~127,5B) |
| Parámetros activos | ~5,1B (124B-A5.1B según el autor) |
| Longitud de contexto | 8K → 32K → 256K (programación oficial del modelo base) |
| Tipos de cuantización | GGUF con cuantización de precisión mixta APEX (sin imatrix en estos niveles); el repo incluye múltiples archivos de cuantización |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (conversión desde BF16); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Ling-3.0-flash emplea una arquitectura híbrida nativa diseñada desde el preentrenamiento, no una adaptación posterior. Combina capas de atención lineal Kimi Delta Attention (KDA) con capas de gated MLA en una proporción 5:1, lo que reduce el coste computacional del mecanismo de atención en secuencias largas manteniendo la capacidad expresiva de la atención completa en una fracción de las capas. La componente MoE es dispersa con ratio 1/64: 512 expertos enrutados con activación top-8 más un experto compartido, sobre dos capas densas. Incluye además una cabeza MTP (multi-token prediction) entrenada, que permite decodificación especulativa y predicción de varios tokens por paso.

El paquete comunitario añade dos transformaciones sobre los pesos oficiales. Primero, una edición de rechazos mediante la receta abliterix v6 trial 21: un LoRA de rango 3 aplicado únicamente a las proyecciones `o_proj` y `down_proj`, con normalización de pesos completa (MPOA `weight_normalization=full`), fusionado estáticamente en BF16 (no es la variante runtime-only v36 posterior). Segundo, la conversión a GGUF con tipos de tensor de precisión mixta generados por APEX, sin matriz de importancia (imatrix) en estos niveles. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional y de formato largo, con pipeline declarado `text-generation`.
- Razonamiento explícito en modo thinking, activado por defecto en la model card oficial del modelo base.
- Razonamiento multi-paso y descomposición de problemas, apoyado por la cabeza MTP y el modo de pensamiento.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling y function calling: no confirmado en la información disponible para este paquete.
- Soporte de agentes: no confirmado explícitamente; la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estándar.
- Tasa de rechazo reducida respecto al modelo oficial (17/98, un 17,3 %, en la evaluación de búsqueda citada por el autor), lo que amplía el rango de respuestas generadas.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación sobre alineación y seguridad: el paquete permite estudiar el efecto de la abliteración sobre la tasa de rechazo (17,3 % en la evaluación del autor) comparándolo con el modelo oficial, en entornos controlados y con auditoría de accesos.
- Generación de texto creativo y de ficción: la reducción de rechazos permite abordar narrativas con temáticas sensibles que el modelo original declinaría, útil en escritura editorial con revisión humana posterior.
- Despliegue local en estaciones de trabajo con GPU de consumo: al ser GGUF con cuantización mixta APEX y ~5,1B de parámetros activos, el coste por token es contenido frente a modelos densos de tamaño comparable, lo que facilita la inferencia en llama.cpp.
- Procesamiento de documentos largos: la ventana de hasta 256K tokens del modelo base permite resumir, extraer y razonar sobre contratos, informes o expedientes completos en una sola pasada, siempre que la cuantización elegida preserve la calidad en contextos extensos.
- Asistentes conversacionales autoalojados: la licencia MIT y el formato GGUF permiten integrar el modelo en productos propios sin restricciones de uso comercial, con control total sobre los datos.
- Evaluación comparativa de cuantizaciones: el repositorio incluye varios niveles APEX, lo que permite medir la degradación de calidad y el throughput entre cuantizaciones sobre una misma base abliterada.
- Generación de código y razonamiento técnico: el modelo base es un modelo de razonamiento híbrido; puede emplearse en tareas de explicación de código y resolución de problemas, aunque el soporte de tool calling no está confirmado en este paquete.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de evaluación proporcionado por el autor es la tasa de rechazo en una evaluación de búsqueda: 17/98 (17,3 %) tras la fusión de abliterix v6 trial 21. No se aportan resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo MoE de ~127,5B totales en GGUF requiere mantener en memoria los pesos totales de la cuantización elegida; los niveles APEX de precisión mixta reducen el tamaño frente a BF16, pero el repositorio completo ocupa 489,3 GB, lo que refleja la suma de todas las variantes publicadas.
- GPU recomendadas: no disponibles en la información proporcionada. Para los niveles de cuantización más bajos, un MoE con ~5,1B activos puede ser viable en GPU de consumo con suficiente VRAM para los pesos totales; para los niveles altos se requieren GPUs de centro de datos (A100, H100) o configuraciones multi-GPU.
- Viabilidad en GPU de consumo: depende del nivel de cuantización APEX seleccionado; no se especifican tamaños por archivo en la información disponible.
- Opciones de despliegue: llama.cpp y entornos compatibles con GGUF (por ejemplo, Ollama o servidores basados en llama.cpp); la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia. vLLM y TGI no están confirmados para este paquete GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ling-3.0-flash-abliterated-APEX-GGUF (este) | ~127,5B / ~5,1B | 8K–256K (base) | MIT | GGUF (APEX) | Abliterado, comunitario, tasa de rechazo 17,3 % |
| inclusionAI/Ling-3.0-flash (base oficial) | ~127,5B / ~5,1B | 8K–256K | MIT | safetensors | Modelo oficial, thinking por defecto, sin abliterar |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de otros modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- La abliteración reduce la tasa de rechazo (17,3 % en la evaluación del autor), lo que implica que el modelo puede generar contenido que el original declinaría; es responsabilidad del integrador evaluar el cumplimiento normativo y la seguridad del caso de uso.
- No es una publicación oficial de inclusionAI; el autor declara explícitamente que se trata de un paquete comunitario y que el comportamiento puede diferir del modelo base.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se han publicado evaluaciones de fidelidad factual para este paquete.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingüe homogéneo.
- La fusión estática del LoRA (v6 trial 21) no equivale a la variante runtime-only posterior (v36); los resultados pueden variar entre ambas.
- Las cuantizaciones APEX de este repositorio no emplean imatrix, lo que puede afectar a la calidad en los niveles más agresivos.
- El tamaño del repositorio (489,3 GB) exige planificación de almacenamiento y ancho de banda para su descarga.
- Aunque la licencia es MIT, deben respetarse los términos de inclusionAI y la legislación local aplicable.
- No hay datos publicados de benchmarks que permitan validar el rendimiento en tareas estándar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SC117/Ling-3.0-flash-abliterated-APEX-GGUF
- Modelo base oficial: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Licencia del modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Repositorio abliterix: https://github.com/wuwangzhang1216/abliterix
- Herramienta APEX de cuantización: https://github.com/mudler/apex-quant
- Documentación en chino del paquete: https://huggingface.co/SC117/Ling-3.0-flash-abliterated-APEX-GGUF/blob/main/README_zh.md
