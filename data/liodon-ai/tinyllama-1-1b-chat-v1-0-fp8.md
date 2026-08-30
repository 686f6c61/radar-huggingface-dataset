# liodon-ai/TinyLlama-1.1B-Chat-v1.0-FP8

## Resumen

TinyLlama-1.1B-Chat-v1.0-FP8 es una cuantización en punto flotante de 8 bits (FP8) del modelo TinyLlama-1.1B-Chat-v1.0, publicada por Liodon AI. El modelo original, desarrollado por el proyecto TinyLlama, es un modelo de lenguaje conversacional de 1.100 millones de parámetros entrenado sobre 3 billones de tokens, con arquitectura y tokenizador compatibles con Llama 2. Esta versión cuantizada reduce el tamaño de los pesos de 2,2 GB a 1,2 GB, lo que facilita su despliegue en entornos con recursos limitados.

La cuantización utiliza el esquema FP8_DYNAMIC implementado con la librería llm-compressor: los pesos se convierten a FP8 (E4M3) por canal de forma estática, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. Al no requerir dataset de calibración, los pesos cuantizados son una conversión directa del original, sin sesgo inducido por calibración. El modelo está pensado para ejecutarse en GPUs modernas de NVIDIA con compute capability ≥ 8.9, donde ofrece ventajas de velocidad y memoria frente a la versión original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (similar a Llama 2) |
| Parametros totales | 1.100.048.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (E4M3) dinamica |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base TinyLlama-1.1B-Chat-v1.0 es un transformer decoder-only con arquitectura Llama 2, entrenado por el proyecto TinyLlama sobre 3 billones de tokens. La versión FP8 no introduce cambios arquitectónicos: es una cuantización post-entrenamiento que convierte los pesos a FP8 por canal y deja las activaciones en cuantización dinámica por token. El cabezal de salida (`lm_head`) se mantiene sin cuantizar, práctica estándar por su tamaño despreciable y su impacto desproporcionado en la calidad si se cuantizara. No se ha aplicado ningún ajuste fino adicional ni calibración.

## Capacidades

- Generación de texto conversacional: el modelo base fue ajustado para diálogo, por lo que responde en formato chat.
- Razonamiento básico y comprensión de instrucciones, heredados del modelo base.
- Generación de código y resolución de problemas matemáticos simples, aunque con limitaciones propias de un modelo de 1.1B.
- Soporte multilingüe limitado, dependiente del corpus de entrenamiento del modelo base (no se especifican idiomas concretos).
- No se documenta soporte explícito para tool calling, agentes o razonamiento multi-paso.
- La cuantización FP8 no altera las capacidades funcionales del modelo original, solo su representación numérica.

## Casos de uso

- Chatbots en dispositivos edge: al ocupar solo 1,2 GB, puede ejecutarse en GPUs de gama baja o integradas, permitiendo asistentes conversacionales locales sin conexión a la nube.
- Prototipado rápido de aplicaciones de texto: su tamaño reducido y compatibilidad con vLLM, TGI y SGLang facilitan levantar un endpoint de generación en minutos para pruebas de concepto.
- Filtrado y clasificación de texto: puede usarse para tareas de análisis de sentimiento o categorización en pipelines de procesamiento de lenguaje natural con requisitos de latencia moderados.
- Generación de código en entornos con restricciones de memoria: para autocompletado o sugerencias en IDEs ligeros, donde un modelo de 7B o más no cabe.
- Educación e investigación: sirve como modelo de referencia para estudiar el impacto de la cuantización FP8 en la calidad de generación frente a la versión FP16.
- Despliegue en infraestructura compartida: al reducir el uso de VRAM, permite ejecutar múltiples instancias en una misma GPU, aumentando el throughput en servicios de inferencia multiusuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. Se recomienda evaluar el modelo en las tareas específicas de uso antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2 GB para los pesos, más overhead de activaciones y memoria de trabajo; en la práctica se recomienda al menos 2-4 GB de VRAM para inferencia cómoda.
- GPU recomendadas: NVIDIA con compute capability ≥ 8.9 (Ada, Hopper, Blackwell), como RTX 40-series, L4, L40S, H100, H200, B100, B200 o GB10.
- En GPUs más antiguas (compute capability < 8.9), vLLM y TGI dequantizan los pesos a FP16, perdiendo la ventaja de velocidad y memoria, pero el modelo sigue siendo funcional.
- Opciones de despliegue: vLLM (`vllm serve`), Text Generation Inference (TGI) mediante contenedor Docker, y SGLang.
- Latencia y throughput: no disponibles en la información proporcionada; dependen de la GPU y del número de tokens generados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia |
|---|---|---|---|---|---|
| TinyLlama-1.1B-Chat-v1.0 (original) | 1.1B | no disponible | FP16 | 2,2 GB | other |
| TinyLlama-1.1B-Chat-v1.0-FP8 (este) | 1.1B | no disponible | FP8 dinamica | 1,2 GB | other |
| TinyLlama-1.1B-Chat-v1.0-imatrix-GGUF | 1.1B | no disponible | GGUF (imatrix) | no disponible | other |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos de otros modelos de tamaño similar (p. ej., Qwen2.5-0.5B, Phi-3-mini) en la información proporcionada.

## Limitaciones y advertencias

- Licencia "other" sin especificar: no se detallan los términos exactos, por lo que se debe contactar con el autor o revisar el modelo base antes de un uso comercial.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido falso o inconsistente, especialmente en tareas de razonamiento complejo.
- Contexto limitado: no se especifica la longitud de contexto, pero el modelo base TinyLlama tiene una ventana de 2048 tokens; para aplicaciones de contexto largo puede ser insuficiente.
- Idiomas no documentados: no se garantiza un rendimiento uniforme en idiomas distintos del inglés.
- Requisito de hardware específico: la ventaja de FP8 solo se materializa en GPUs con compute capability ≥ 8.9; en hardware antiguo se pierde el beneficio.
- Sin benchmarks publicados: no hay evidencia cuantitativa del rendimiento de esta cuantización frente a la versión original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liodon-ai/TinyLlama-1.1B-Chat-v1.0-FP8
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Variante GGUF imatrix: https://huggingface.co/liodon-ai/TinyLlama-1.1B-Chat-v1.0-imatrix-GGUF
- Repositorio del proyecto TinyLlama: https://github.com/mirseo/tinyllama
- Ejemplo de uso en navegador: https://harisnae.github.io/browser-based-LLM/
