# liodon-ai/Qwen2.5-0.5B-Instruct-FP8

## Resumen

Este modelo es una versión cuantizada en FP8 del modelo Qwen2.5-0.5B-Instruct, publicada por Liodon AI. La cuantización reduce el tamaño del modelo de 1.0 GB a 0.6 GB mediante el esquema FP8_DYNAMIC, que convierte los pesos a FP8 (E4M3) por canal y cuantiza las activaciones dinámicamente por token en inferencia, sin necesidad de un dataset de calibración. Esto hace que los pesos cuantizados sean numéricamente equivalentes a una conversión directa del original, evitando sesgos introducidos por la calibración. El modelo base, Qwen2.5-0.5B-Instruct, es un modelo de lenguaje pequeño de la familia Qwen2.5 con 494 millones de parámetros, diseñado para seguir instrucciones y con capacidades mejoradas en codificación y matemáticas respecto a versiones anteriores. La licencia Apache 2.0 permite uso comercial sin restricciones, y el formato es compatible con vLLM, TGI y SGLang, lo que facilita su despliegue en entornos de producción con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (E4M3) dinamico, pesos por canal, activaciones por token |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con vLLM, TGI, SGLang) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del modelo base Qwen2.5-0.5B-Instruct, no un entrenamiento nuevo. El modelo base es un transformer decoder-only de la familia Qwen2.5, con 0.5 mil millones de parametros, entrenado por Alibaba Cloud con un enfoque en instrucciones y mejoras en codificacion y matematicas. La cuantizacion se realizo con la libreria llm-compressor de vLLM, utilizando el esquema FP8_DYNAMIC: los pesos se convierten a FP8 E4M3 por canal de forma estatica, mientras que las activaciones se cuantizan dinamicamente por token en tiempo de inferencia. Este esquema no requiere dataset de calibracion, por lo que no introduce sesgos de calibracion. La capa `lm_head` se deja sin cuantizar, una practica estandar para preservar la calidad de la salida. El resultado es una reduccion del 40% en el tamano del modelo (de 1.0 GB a 0.6 GB) manteniendo la precision numerica del modelo original.

## Capacidades

- Generacion de texto y seguimiento de instrucciones en lenguaje natural.
- Razonamiento basico, codificacion y matematicas, heredadas del modelo base Qwen2.5-0.5B-Instruct.
- Capacidad para tareas de clasificacion, extraccion de informacion y resumen en textos cortos.
- No se documenta soporte explicito para tool calling, agentes o razonamiento multi-paso.
- No se especifican idiomas soportados en la ficha; el modelo base Qwen2.5 soporta multiples idiomas, pero no se confirma en esta version cuantizada.

## Casos de uso

- Atencion al cliente en dispositivos edge: el modelo puede gestionar conversaciones de soporte basico en tiempo real en hardware con poca memoria, gracias a su tamano reducido y baja latencia en GPUs compatibles con FP8.
- Generacion de codigo simple en entornos de desarrollo integrado: puede autocompletar funciones o snippets en lenguajes como Python o JavaScript, adecuado para asistentes de programacion ligeros.
- Clasificacion de texto y analisis de sentimiento: util para filtrar comentarios, correos o mensajes en aplicaciones de bajo coste, procesando lotes con un consumo minimo de VRAM.
- Asistentes de voz en tiempo real: al ser un modelo pequeno, puede ejecutarse en dispositivos con GPU integrada o en la nube con baja latencia, generando respuestas habladas a partir de transcripciones.
- Prototipado rapido de aplicaciones de lenguaje: permite validar ideas de productos sin invertir en infraestructura grande, gracias a su despliegue sencillo con vLLM o TGI.
- Procesamiento de texto en lote en pipelines de datos: puede resumir o extraer entidades de documentos en entornos con recursos limitados, reduciendo costes de inferencia en comparacion con modelos mas grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen2.5-0.5B-Instruct tiene resultados publicados por Alibaba Cloud, pero no se incluyen en la ficha de esta cuantizacion. Se recomienda consultar la documentacion del modelo base para referencias de rendimiento.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0.6 GB para los pesos cuantizados, mas overhead de activaciones y memoria de ejecucion; cabe en GPUs con 1-2 GB de VRAM.
- GPU recomendadas: NVIDIA con compute capability >= 8.9 (Ada, Hopper, Blackwell) para ejecucion FP8 nativa, como RTX 40-series, L4/L40S, H100/H200, B100/B200. En GPUs mas antiguas (compute capability < 8.9), vLLM/TGI dequantizara el modelo, perdiendo los beneficios de velocidad y memoria.
- Opciones de despliegue: vLLM (`vllm serve`), Text Generation Inference (TGI) mediante Docker, y SGLang (`sglang.launch_server`).
- Latencia y throughput: no disponibles; dependen del hardware y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | Licencia | Contexto |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct (base) | 494M | Sin cuantizar | 1.0 GB | Apache 2.0 | No disponible |
| Qwen2.5-0.5B-Instruct-FP8 (este) | 494M | FP8 dinamico | 0.6 GB | Apache 2.0 | No disponible |
| Qwen2.5-0.5B-Instruct-GGUF (no verificado) | 494M | GGUF (varias) | Variable | Apache 2.0 | No disponible |

La comparativa se limita a diferencias de cuantizacion y tamano, ya que no se dispone de datos de rendimiento especificos. El modelo FP8 ofrece una reduccion del 40% en tamano respecto al base, con la ventaja de no requerir calibracion y mantener la precision numerica. Otras cuantizaciones como GGUF pueden ofrecer mayor compatibilidad con CPUs, pero no se dispone de datos concretos.

## Limitaciones y advertencias

- Modelo pequeno (0.5B parametros): su capacidad de razonamiento y conocimiento es limitada en comparacion con modelos de mayor tamano; puede producir respuestas imprecisas o incompletas en tareas complejas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en dominios especializados.
- Requisito de hardware especifico: la ejecucion FP8 nativa solo esta disponible en GPUs NVIDIA con compute capability >= 8.9; en hardware mas antiguo se pierden los beneficios de velocidad y memoria.
- Idiomas no especificados: no se documenta que idiomas soporta esta version cuantizada; se asume herencia del modelo base, pero no se garantiza.
- Sin datos de contexto: no se indica la longitud de contexto soportada, lo que puede afectar a tareas que requieran ventanas largas.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base para posibles restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liodon-ai/Qwen2.5-0.5B-Instruct-FP8
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Sitio web de Liodon AI: https://liodon.ai/
- Modelo base en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-0.5B-Instruct
- Pagina de Ollama para Qwen2.5: https://ollama.com/library/qwen2.5:0.5b-instruct
