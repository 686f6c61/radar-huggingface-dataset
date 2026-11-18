# IFM/K2-Horizon-MoVA-36B-A4B

## Resumen
K2-Horizon-MoVA-36B-A4B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por IFM, con 36 000 millones de parámetros almacenados y aproximadamente 4 000 millones activados por token. Forma parte de la familia K2-Horizon y su rasgo diferencial es el uso de una atención denominada MoVA (Mixture-of-Values attention), una variante de atención que combina valores de múltiples cabezas o expertos. El modelo está publicado con pesos abiertos, datos de entrenamiento y código de entrenamiento.

El modelo resuelve el problema de obtener rendimiento de gama alta en tareas de razonamiento y agentes con un coste de inferencia reducido, gracias a su ratio de activación de 4B parámetros. Su ventana de contexto nativa es de 524 288 tokens (512K), lo que lo sitúa en el rango de modelos de contexto largo orientados a agentes y documentos extensos.

Es relevante ahora porque IFM publica no solo los checkpoints finales, sino también checkpoints intermedios, el dataset de preentrenamiento y midtraining, y el código de entrenamiento, lo que permite reproducir y estudiar la evolución de capacidades a lo largo del entrenamiento. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts con atención MoVA (Mixture-of-Values attention) |
| Parametros totales | 37 444 792 020 (~37,4B; la model card indica 36B) |
| Parametros activos | ~4B por token |
| Longitud de contexto | 524 288 tokens (512K), nativa desde midtraining |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `custom_code` de `transformers`) |

## Arquitectura y entrenamiento
La arquitectura es un transformer disperso de tipo Mixture-of-Experts: el modelo almacena unos 37,4B parámetros en safetensors y activa aproximadamente 4B por token, lo que reduce el coste computacional por paso de decodificación frente a un modelo denso del mismo tamaño. La innovación destacada es la atención MoVA (Mixture-of-Values attention), que según la model card combina valores de forma mezclada dentro del mecanismo de atención; no se detalla en la información disponible el número de expertos, la estrategia de enrutamiento ni la proporción de capas MoE.

El modelo se entrena en al menos dos fases documentadas: preentrenamiento (dataset `IFM/K2-Horizon-Pretrain-Data`) y midtraining (dataset `IFM/K2-Horizon-Midtrain-Data`), siendo en la fase de midtraining donde se establece el contexto nativo de 524 288 tokens. IFM publica el código de entrenamiento (xllm) y el código de evaluación (Eval360). No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades
- Generación de texto conversacional en inglés.
- Razonamiento y tareas agénticas: la model card destaca resultados competitivos en benchmarks de agentes y razonamiento.
- Contexto largo: ventana nativa de 512K tokens, adecuada para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidad de ejecución con bajo coste por token gracias a los ~4B parámetros activos.
- No se documentan en la información disponible capacidades de visión, audio, tool calling explícito ni modo de razonamiento dedicado; deben verificarse en la documentación del autor antes de asumirlas.

## Casos de uso
- Análisis de documentación extensa: con 512K tokens de contexto, el modelo puede ingerir contratos, informes o bases de código completas en una sola pasada sin fragmentación.
- Agentes autónomos multi-paso: su perfil de 4B parámetros activos permite ejecutar bucles de razonamiento y llamadas a herramientas con menor coste de inferencia que un modelo denso equivalente.
- Asistentes conversacionales de atención al cliente: la ventana larga mantiene el historial completo de la conversación y el contexto del cliente sin truncar.
- Procesamiento por lotes de texto a gran escala: el bajo número de parámetros activos reduce el coste por token en pipelines de generación masiva.
- Investigación sobre entrenamiento de MoE: la publicación de checkpoints intermedios, datos y código permite estudiar la evolución de capacidades durante el entrenamiento.
- Reproducción y ajuste fino: la licencia Apache 2.0 y los pesos en safetensors permiten adaptar el modelo a dominios específicos y desplegarlo en producción propia.
- Evaluación comparativa de arquitecturas de atención: la atención MoVA puede compararse frente a atención estándar en tareas de contexto largo.

## Benchmarks y rendimiento
La model card incluye una tabla comparativa con modelos abiertos (Nemotron 3 Ultra, Nemotron 3 Super, G9v3-39A5B, Qwen3.6-35B-A3B, Muse Glimmer-30B, Gemma 4 31B-it) y afirma resultados de primer nivel en benchmarks de agentes y razonamiento. Sin embargo, en la información proporcionada solo se incluye el encabezado y las filas de número de parámetros y parámetros activos de dicha tabla; los valores numéricos de los benchmarks no están disponibles.

| Modelo | Params totales | Params activos |
|---|---|---|
| K2-Horizon-MoVA-36B-A4B | 36B | 4B |
| Nemotron 3 Ultra | 550B | 55B |
| Nemotron 3 Super | 120B | 12B |
| G9v3-39A5B | 39B | no disponible |
| Qwen3.6-35B-A3B | 35B | no disponible |
| Muse Glimmer-30B | 30B | no disponible |
| Gemma 4 31B-it | 31B | no disponible |

No se han publicado en la información disponible los resultados numéricos por benchmark (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware
- VRAM estimada: con pesos en bf16/fp16, el modelo requiere aproximadamente 75 GB solo para pesos, más caché KV; con cuantización a 8 bits, unos 38 GB, y a 4 bits, unos 19 GB (estimaciones a partir de los 37,4B parámetros, no confirmadas por el autor).
- GPU recomendadas: para bf16 se necesitan varias GPU de 80 GB (A100, H100) o una H200; para cuantización de 4-8 bits puede caber en una RTX 4090 (24 GB) o A6000 (48 GB), con margen limitado por la caché KV a contexto largo.
- Contexto largo: 512K tokens implican una caché KV muy grande; el despliegue a contexto completo requiere hardware con memoria abundante o técnicas de atención eficiente.
- Opciones de despliegue: `transformers` con `custom_code` (requerido por la arquitectura MoVA); no se confirma soporte en vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Params totales | Params activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| K2-Horizon-MoVA-36B-A4B | 36B | 4B | 512K | Apache 2.0 | Pesos, datos y código abiertos |
| Qwen3.6-35B-A3B | 35B | no disponible | no disponible | no disponible | no disponible |
| G9v3-39A5B | 39B | no disponible | no disponible | no disponible | no disponible |
| Gemma 4 31B-it | 31B | denso | no disponible | no disponible | no disponible |

La comparativa se limita a los datos de tamaño que aparecen en la tabla de la model card; no hay datos de rendimiento ni de contexto de los modelos alternativos en la información disponible.

## Limitaciones y advertencias
- Idioma: el modelo solo declara soporte de inglés; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: no se documentan medidas específicas de mitigación en la información disponible.
- Sesgos: no se documentan evaluaciones de sesgo o seguridad.
- Contexto largo: aunque la ventana nativa es de 512K tokens, el rendimiento efectivo en contextos muy largos no está verificado con datos públicos en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero debe revisarse el cumplimiento de las licencias de los datasets publicados.
- Despliegue: requiere `custom_code` en `transformers`; la compatibilidad con motores de inferencia populares no está confirmada, lo que puede complicar la puesta en producción.
- Tamaño del repositorio: 5167,6 GB, lo que implica una descarga y almacenamiento considerables.

## Enlaces
- Hugging Face: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Código de entrenamiento: https://github.com/ifm-ai/xllm
- Código de evaluación: https://github.com/ifm-ai/Eval360
- Datos de entrenamiento: https://github.com/ifm-ai/DATA_NAVIGATOR
- Dataset de preentrenamiento: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data
- Dataset de midtraining: https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data
