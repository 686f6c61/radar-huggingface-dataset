# groxaxo/Huihui-Qwen3.8-27B-abliterated-GPTQ-Pro-4bit-g64

## Resumen

Huihui-Qwen3.8-27B-abliterated-GPTQ-Pro-4bit-g64 es una cuantización GPTQ-Pro en INT4 del modelo abliterado Qwen3.8-27B, desarrollada por groxaxo. El modelo base, creado por huihui-ai, es una versión sin rechazo de seguridad (uncensored) del Qwen3.8-27B de Alibaba, obtenida mediante la técnica de abliteración que elimina los mecanismos de rechazo sin necesidad de reentrenamiento. Esta cuantización reduce el tamaño del modelo de aproximadamente 55 GB en BF16 a 20,1 GB, lo que permite ejecutarlo en GPUs de consumo con 24 GB de VRAM.

La arquitectura subyacente es un transformer híbrido de 64 capas con 48 capas de atención lineal y 16 de atención completa, heredada de la familia Qwen3.5. El modelo soporta una ventana de contexto de 262 000 tokens, acepta entradas multimodales (texto e imágenes) e incorpora un modo de razonamiento (thinking mode). La cuantización se realizó con GPTQ-Pro, un algoritmo optimizado para GPUs Ampere, usando calibración en CPU y offload a disco, con un preset de calidad `quality_4bit` y grupo de cuantización de 64.

Esta ficha cubre exclusivamente la versión cuantizada publicada por groxaxo, no el modelo base original. La licencia Apache-2.0 permite uso comercial, pero la eliminación de los rechazos de seguridad implica responsabilidad legal y ética del usuario final.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (model_type `qwen3_5`), transformer híbrido: 64 capas (48 atención lineal + 16 atención completa, intervalo 4), hidden 5120, head_dim 256, intermediate 17408 |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | GPTQ-Pro INT4, grupo 64, preset `quality` (`QuantizeConfig.quality_4bit`) |
| Idiomas soportados | No disponible (el modelo base de Qwen es multilingüe, pero no se especifica en la documentación) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (18 shards) con configuración GPTQ en `quantization_config` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B-abliterated fue desarrollado por huihui-ai mediante abliteración sobre el checkpoint oficial de Qwen3.8-27B. La abliteración elimina los mecanismos de rechazo de seguridad de las capas profundas (a partir de la capa 15) sin modificar las primeras 15 capas, preservando así las capacidades generales del modelo. La arquitectura reutiliza el contrato de 64 capas y 400 lineales de Qwen3.5/Qwen3.6-27B, con una mezcla de 48 capas de atención lineal (eficientes en memoria) y 16 capas de atención completa (para razonamiento de alto nivel).

La cuantización GPTQ-Pro fue realizada por groxaxo sobre el checkpoint abliterado en BF16. El proceso utilizó GPTQModel con el algoritmo Pro, calibración en CPU con 64 muestras de texto (~315 000 tokens, ~19 700 caracteres por muestra), offload a disco y un preset de calidad `quality_4bit` (4 bits, grupo 64). El bucle de cuantización tardó aproximadamente 70 minutos en una RTX 3090 con límite de potencia de 250 W, más unos 10 minutos adicionales para captura de calibración y empaquetado final. Se aplicaron comprobaciones de calidad post-cuantización: verificación estructural (bits, grupo, capas, tokenizador), carga en CPU, generación determinista de 24 tokens y detección de salidas degeneradas.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades de Qwen3.8-27B, incluyendo razonamiento matemático, lógico y de sentido común.
- Modo de pensamiento (thinking mode): el modelo puede activar un modo de razonamiento explícito antes de responder, según la documentación del modelo base.
- Entrada multimodal: acepta texto e imágenes (etiqueta `image-text-to-text`), lo que permite tareas de visión-lenguaje.
- Ventana de contexto larga: 262 000 tokens, adecuada para documentos extensos, conversaciones multi-turno y análisis de código grande.
- Soporte de tool calling y function calling: no se menciona explícitamente en la documentación de la cuantización, pero es una capacidad común en la familia Qwen3.5; no se confirma en esta ficha.
- Capacidades multilingües: no se especifican idiomas concretos, pero Qwen3.8-27B es un modelo multilingüe entrenado con datos en decenas de idiomas.
- Ausencia de rechazo de seguridad: el modelo no tiene mecanismos de rechazo de contenido, por lo que puede generar respuestas que otros modelos censurarían.

## Casos de uso

- Despliegue en hardware de consumo: gracias a la cuantización INT4 con grupo 64, el modelo ocupa ~20 GB y puede ejecutarse en GPUs de 24 GB como RTX 3090 o RTX 4090, lo que lo hace accesible para desarrolladores independientes y pequeñas empresas.
- Procesamiento de documentos largos: con 262 000 tokens de contexto, puede resumir informes anuales, analizar contratos extensos o extraer información de manuales técnicos completos en una sola pasada.
- Asistentes conversacionales sin filtros: útil para investigación en generación de diálogo abierto, simulación de personajes o entornos de rol donde se requiere libertad creativa sin restricciones de contenido.
- Análisis de imágenes y texto combinados: al aceptar entradas multimodales, puede describir imágenes, transcribir diagramas o responder preguntas sobre capturas de pantalla en contextos de soporte técnico.
- Prototipado rápido de aplicaciones de IA: la integración con vLLM y transformers permite montar endpoints de inferencia en minutos para pruebas de concepto.
- Investigación en alineación y seguridad: al ser un modelo abliterado, sirve como caso de estudio para analizar el impacto de eliminar los rechazos de seguridad en el comportamiento del modelo, siempre en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otras cuantizaciones. El único dato de rendimiento es el tiempo de cuantización (~80 minutos en RTX 3090), pero no hay mediciones de latencia o throughput de inferencia.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 20,1 GB, por lo que se recomienda al menos 24 GB de VRAM para cargar el modelo completo en memoria. Con `device_map="auto"` es posible repartir entre CPU y GPU si se dispone de menos VRAM, aunque con penalización de rendimiento.
- GPUs compatibles: RTX 3090 (24 GB), RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) y cualquier GPU con soporte para kernels GPTQ (Ampere o superior). El autor utilizó una RTX 3090 con límite de potencia de 250 W.
- Opciones de despliegue: transformers con la librería `gptqmodel` (o cualquier kernel GPTQ que lea `quantization_config`), vLLM (versión estable reciente). No se menciona compatibilidad con Ollama o llama.cpp para esta cuantización específica, ya que esos entornos suelen requerir formato GGUF.
- Latencia y throughput: no disponibles. Se espera que la inferencia en 4 bits sea más rápida que en BF16 en GPUs con soporte para kernels optimizados, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| groxaxo/Huihui-Qwen3.8-27B-abliterated-GPTQ-Pro-4bit-g64 | 27,8B | 262k | GPTQ-Pro INT4 g64 | Apache-2.0 | Cuantización 4-bit del modelo abliterado |
| huihui-ai/Qwen3.8-27B-abliterated (base) | 27,8B | 262k | BF16 | Apache-2.0 | Modelo original sin cuantizar, requiere ~55 GB VRAM |
| huihui-ai/Huihui-Qwen3.5-27B-abliterated | 27,8B | 262k (presumible) | BF16 | Apache-2.0 | Versión anterior de la familia Qwen3.5 abliterada |

La comparativa se limita a variantes del mismo modelo base. No se dispone de datos de rendimiento para comparar con otros modelos de 27B como Llama 3.3 70B o Mistral Large, ni con otras cuantizaciones (AWQ, GGUF) de este mismo modelo.

## Limitaciones y advertencias

- Ausencia de rechazo de seguridad: el modelo puede generar contenido ofensivo, ilegal o peligroso sin restricciones. El uso en producción debe contemplar filtros adicionales y cumplir con la normativa local.
- Degradación por cuantización: la cuantización INT4 con grupo 64 puede producir ligeras pérdidas de calidad en tareas de razonamiento complejo o generación de código, aunque no se han medido diferencias concretas.
- Sin benchmarks publicados: no hay evidencia cuantitativa del rendimiento de esta cuantización frente al modelo original o a otras cuantizaciones.
- Idiomas no especificados: aunque Qwen3.8 es multilingüe, no se documentan los idiomas exactos soportados ni la calidad en cada uno.
- Compatibilidad limitada: la inferencia requiere `gptqmodel` o vLLM; no es compatible directamente con Ollama, llama.cpp u otros entornos que esperan GGUF.
- Responsabilidad legal: el autor advierte que el uso debe ser responsable y acorde a las regulaciones locales, especialmente en aplicaciones comerciales.
- Fecha de creación futura: el modelo fue creado el 2026-08-19, lo que podría indicar un error de fecha o un lanzamiento planificado; se recomienda verificar la vigencia del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/groxaxo/Huihui-Qwen3.8-27B-abliterated-GPTQ-Pro-4bit-g64
- Modelo base (huihui-ai): https://huggingface.co/huihui-ai/Qwen3.8-27B-abliterated
- Proyecto GPTQ-Pro en GitHub: https://github.com/groxaxo/GPTQ-Pro
- Artículo de vgtimes sobre el modelo base: https://vgtimes.com/tech-and-hardware/164540-huihui-qwen3.8-27b-abliterated-launches-as-an-uncensored-ai-model-for-free.html
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/huihui-qwen3.8-27b-abliterated-huihui-ai
