# mlx-community/Qwen3.8-27B-Uncensored-OptiQ-4bit

## Resumen

El modelo `mlx-community/Qwen3.8-27B-Uncensored-OptiQ-4bit` es una cuantización de precisión mixta del modelo base `orcarouter/Qwen3.8-27B-Uncensored`, un modelo de la familia Qwen3.8 de 27 000 millones de parámetros, adaptado para ejecutarse en Apple Silicon mediante la librería MLX. La cuantización utiliza el método OptiQ, que asigna 4 u 8 bits por capa según la sensibilidad, reduciendo el tamaño en disco a 19 GB y permitiendo inferencia local en hardware de Apple sin pérdida significativa de capacidades.

El modelo base es una versión "uncensored" de Qwen3.8-27B, obtenida mediante abliteración (eliminación de la dirección de rechazo) y conserva intactas la torre de visión, la cabeza de predicción multi-token (MTP) y el soporte de herramientas. Esto lo convierte en un modelo multimodal (texto e imagen), con razonamiento, function calling y contexto largo de 262 000 tokens. La cuantización OptiQ preserva la arquitectura original, incluida la cabeza MTP para decodificación especulativa, lo que acelera la generación en Apple Silicon.

Relevante para desarrolladores que necesitan un modelo local, sin censura, con capacidades de agente y visión, ejecutable en Mac con memoria unificada suficiente. La licencia Apache 2.0 permite uso comercial sin restricciones, aunque el carácter "uncensored" exige implementar capas de moderación propias en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8), con torre de visión y cabeza MTP |
| Parametros totales | 27B (modelo base); 5 277 883 904 en safetensors cuantizados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262 000 tokens |
| Tipos de cuantizacion | OptiQ de precision mixta: 237 componentes a 4 bits y 261 a 8 bits, group size 64 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un Qwen3.8-27B, un transformer denso con atención estándar, diseñado para razonamiento, uso de herramientas y multimodalidad (texto e imagen). Incluye una cabeza de predicción multi-token (MTP) que permite decodificación especulativa, acelerando la generación. El entrenamiento original de Qwen3.8 no se detalla en la información disponible, pero se sabe que el modelo base fue sometido a un proceso de abliteración para eliminar la direccionalidad de rechazo, manteniendo las capacidades originales. La cuantización OptiQ aplica una asignación de bits por capa basada en sensibilidad, reutilizando la receta del modelo Qwen3.8-27B estándar, lo que evita un barrido específico por modelo. El resultado es un modelo de 19 GB en disco, con la cabeza MTP preservada en un archivo separado (`optiq/mtp.safetensors`) para su uso como modelo de borrador.

## Capacidades

- Generacion de texto y razonamiento multi-paso, incluido modo "thinking" (generoso presupuesto de tokens).
- Soporte de tool calling y function calling, permitiendo integracion con APIs y ejecucion de acciones.
- Capacidades de agente: puede encadenar llamadas a herramientas y razonar sobre los resultados.
- Multimodal: procesa texto e imagenes (vision tower intacta, segun la informacion del modelo base).
- Contexto largo de 262 000 tokens, adecuado para documentos extensos o conversaciones prolongadas.
- Prediccion multi-token (MTP) para decodificacion especulativa, reduciendo la latencia en Apple Silicon.
- Modelo "uncensored": no aplica filtros de rechazo por defecto, lo que permite respuestas sin restricciones tematicas (con los riesgos asociados).

## Casos de uso

- Asistente de codigo local: el modelo puede generar, revisar y depurar codigo en multiples lenguajes, integrado en editores o CLIs mediante tool calling. Su contexto largo permite cargar repositorios enteros y razonar sobre ellos.
- Agente de automatizacion de tareas: con function calling, puede interactuar con APIs (envio de correos, gestion de calendarios, consultas a bases de datos) y ejecutar flujos multi-paso de forma autonoma.
- Analisis de documentos extensos: gracias a los 262K tokens de contexto, puede resumir, extraer informacion o responder preguntas sobre libros, informes tecnicos o contratos sin necesidad de chunking.
- Soporte al cliente sin filtros: en entornos controlados, puede gestionar conversaciones complejas con usuarios, manteniendo el historial completo y usando herramientas para consultar sistemas externos.
- Investigacion en seguridad de IA: al ser "uncensored", es util para estudiar mecanismos de rechazo, hacer red-teaming y evaluar robustez de guardarrailes, como indica el repositorio del modelo base.
- Prototipado de aplicaciones multimodales: procesa imagenes junto con texto para tareas como descripcion de graficos, OCR o analisis de capturas, todo localmente en Mac.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval u otras, y no se encontraron datos comparativos en la busqueda web.

## Requisitos de hardware

- Disco: 19 GB para los pesos en safetensors.
- Memoria unificada (RAM) estimada: para inferencia con MLX, se recomienda al menos 24 GB de memoria unificada en Apple Silicon, aunque 32 GB o mas son preferibles para el contexto largo.
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No se ejecuta en GPU NVIDIA o AMD.
- Opciones de despliegue: mediante `mlx-lm` (libreria oficial de MLX) o `optiq serve`, que ofrece un endpoint compatible con OpenAI y Anthropic, con cache KV de precision mixta.
- Latencia y throughput: no disponibles. La decodificacion especulativa con la cabeza MTP puede reducir la latencia, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-27B (original) | 27B | 262K | Apache 2.0 | safetensors, GGUF | Modelo base con censura, disponible en multiples cuantizaciones |
| mlx-community/Qwen3.8-27B-Uncensored-OptiQ-4bit | 27B | 262K | Apache 2.0 | MLX (safetensors) | Cuantizado para Apple Silicon, sin censura, con MTP |
| orcarouter/Qwen3.8-27B-Uncensored (GGUF) | 27B | 262K | Apache 2.0 | GGUF, FP8 | Version sin cuantizar para CPU/GPU, sin censura |

La principal diferencia frente al modelo original es la ausencia de filtros de rechazo (abliteracion) y la optimizacion para MLX. Frente a otras cuantizaciones, OptiQ ofrece precision mixta por capa, lo que puede mejorar la fidelidad frente a cuantizaciones uniformes de 4 bits.

## Limitaciones y advertencias

- Modelo "uncensored": puede generar contenido inapropiado, ofensivo o peligroso. No debe desplegarse en produccion sin una capa de moderacion propia.
- Sesgos: al ser una variante abliterada, los sesgos del modelo original pueden amplificarse al no existir rechazo. No se han publicado evaluaciones de sesgo.
- Riesgo de alucinacion: como todo LLM, puede inventar hechos o codigo incorrecto, especialmente en tareas de razonamiento complejo.
- Idioma: solo soporta ingles de forma fiable; otros idiomas pueden degradar el rendimiento.
- Hardware limitado: requiere Apple Silicon con suficiente memoria unificada; no es portable a otras arquitecturas sin conversion adicional.
- Licencia Apache 2.0 permite uso comercial, pero el caracter "uncensored" puede generar responsabilidades legales si se usa para generar contenido danino.
- La cuantizacion puede introducir degradacion en tareas de alta precision (matematicas, codigo) respecto al modelo en FP16, aunque no se han medido diferencias.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/mlx-community/Qwen3.8-27B-Uncensored-OptiQ-4bit
- Proyecto OptiQ: https://mlx-optiq.com
- Catalogo de modelos OptiQ: https://mlx-optiq.com/models
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Repositorio del modelo base (GitHub): https://github.com/onurburak9/Qwen3.8-27B-Uncensored
- Demo MLX del modelo base: https://huggingface.co/spaces/ZeroxZhang/Qwen3.8-27B-Uncensored-MLX-Demo
- Articulo de ExplainX sobre la version MLX: https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026
