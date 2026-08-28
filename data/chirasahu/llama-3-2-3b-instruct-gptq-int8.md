# ChiraSahu/Llama-3.2-3B-Instruct-GPTQ-Int8

## Resumen

El modelo `ChiraSahu/Llama-3.2-3B-Instruct-GPTQ-Int8` es una cuantización GPTQ de 8 bits del checkpoint instructivo `meta-llama/Llama-3.2-3B-Instruct`, realizada por ChiraSahu como parte del proyecto "Phase-Aware Energy and Efficiency Profiling of Quantized LLM Inference on Edge GPUs" del SPIT Mumbai. El objetivo declarado es servir como referencia para comparaciones de eficiencia energética y de rendimiento en GPUs de borde, no como un checkpoint optimizado para despliegue en producción.

La cuantización se realizó con la librería GPTQModel, con bits=8, group_size=128, y calibración sobre 512 documentos de `allenai/c4` (en, shard 1 de 1024) empaquetados en bloques de 2048 tokens, siguiendo la convención del artículo original de GPTQ. El proceso tardó 45,8 minutos en una Tesla T4 de Kaggle. El modelo resultante conserva la arquitectura original de Llama 3.2 3B (transformer decoder con 3.212.749.824 parámetros) y se distribuye en formato safetensors con un tamaño de repositorio de 3,7 GB.

Aunque el autor no publica métricas de calidad, esta cuantización es útil para evaluar el impacto de la precisión Int8 en tareas de razonamiento, generación y tool calling, y para medir consumo energético en entornos con recursos limitados. No se han publicado benchmarks propios, por lo que cualquier evaluación debe realizarse directamente sobre el checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.2) |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base soporta 128k tokens) |
| Tipos de cuantizacion | GPTQ Int8, group_size=128 |
| Idiomas soportados | no disponible (el modelo base soporta multiples idiomas) |
| Licencia | no disponible (el modelo base usa Llama 3.2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento (PTQ) del checkpoint `meta-llama/Llama-3.2-3B-Instruct`, sin modificaciones en la arquitectura. La arquitectura base es un transformer decoder con atencion por ventana deslizante y atencion global alternada, disenada para manejar contextos largos (el modelo base soporta hasta 128k tokens). No se realizo ningun entrenamiento adicional ni fine-tuning; solo se aplico GPTQ con precision de 8 bits por grupo de 128 pesos.

La calibracion se hizo con 512 documentos de C4 en ingles, empaquetados en bloques de 2048 tokens, lo que permite estimar los rangos de activacion y pesos para minimizar el error de cuantizacion. El autor destaca que no existia un checkpoint GPTQ-Int8 sin modificar para este modelo base en el momento de la cuantizacion, por lo que este repositorio cubre ese hueco para estudios comparativos controlados.

## Capacidades

- Generacion de texto e instrucciones: hereda las capacidades del modelo base Llama-3.2-3B-Instruct, incluyendo seguimiento de instrucciones, resumen, reescritura y dialogo multi-turno.
- Razonamiento y matematicas: el modelo base es competente en tareas de razonamiento logico y aritmetico, aunque la cuantizacion Int8 puede introducir ligeras degradaciones.
- Tool calling y function calling: el modelo base soporta invocacion de herramientas y estructuras JSON, util para agentes y automatizacion.
- Multilingue: el modelo base maneja varios idiomas, aunque la calibracion de la cuantizacion se hizo solo con datos en ingles, lo que podria afectar a lenguas no representadas.
- Contexto largo: el modelo base soporta hasta 128k tokens, aunque la cuantizacion no altera esta capacidad.

## Casos de uso

- Evaluacion de eficiencia energetica en GPUs de borde: el proposito principal del autor es medir el consumo y la latencia de inferencia con cuantizacion Int8 en hardware limitado (por ejemplo, Jetson, RTX 4060, T4). Se puede integrar en pipelines de profiling con herramientas como `nvprof` o `pytorch profiler`.
- Benchmarking de cuantizacion: sirve como referencia para comparar el impacto de GPTQ Int8 frente a otras precisiones (FP16, Int4) sobre el mismo modelo base, en tareas de generacion y razonamiento.
- Prototipado rapido en entornos con poca VRAM: al ocupar unos 3,2 GB en disco, puede cargarse en GPUs con 4-6 GB de VRAM, permitiendo experimentar con el modelo base sin necesidad de hardware de gama alta.
- Inferencia en tiempo real en chatbots ligeros: para aplicaciones de atencion al cliente o asistentes virtuales donde la latencia es critica, la cuantizacion Int8 reduce el uso de memoria y puede acelerar la inferencia en GPUs consumer.
- Investigacion academica sobre cuantizacion: util para estudios que analicen la relacion entre precision numerica, rendimiento y consumo de recursos en modelos de 3B de parametros.
- Despliegue en servidores con multiples modelos concurrentes: al reducir el tamano del modelo, se pueden servir varias instancias en una sola GPU, aumentando el throughput agregado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni comparaciones con otras cuantizaciones. Para obtener datos de rendimiento, es necesario ejecutar evaluaciones propias sobre el checkpoint.

## Requisitos de hardware

- VRAM estimada: el checkpoint en Int8 ocupa aproximadamente 3,2 GB en disco. Durante la inferencia, se necesita memoria adicional para activaciones y buffers; se estima un consumo de 4-5 GB en FP16 o BF16 para el modelo base, pero en Int8 la huella se reduce a unos 3,5-4 GB. Cabe en GPUs con 4 GB de VRAM (por ejemplo, RTX 3050, GTX 1650) con cuantizacion adicional o en 6 GB (RTX 2060, RTX 3060) con margen.
- GPU recomendadas: Tesla T4 (usada para la cuantizacion), RTX 3060, RTX 4060, Jetson Orin Nano (para edge). Para produccion, se recomienda al menos 8 GB de VRAM si se desea contexto largo.
- Opciones de despliegue: al ser safetensors, se puede cargar con Transformers, vLLM, TGI o llama.cpp (convertiendo a GGUF). No hay archivos GGUF en el repositorio, pero se puede convertir.
- Latencia y throughput: no hay datos publicados. En una T4, un modelo de 3B en Int8 suele generar entre 20 y 40 tokens por segundo con batch 1, pero depende de la implementacion y del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChiraSahu/Llama-3.2-3B-Instruct-GPTQ-Int8 | 3.2B | no disponible (base 128k) | GPTQ Int8 | no disponible | HuggingFace |
| meta-llama/Llama-3.2-3B-Instruct (FP16) | 3.2B | 128k | FP16 | Llama 3.2 Community | HuggingFace |
| meta-llama/Llama-3.2-3B-Instruct-GPTQ-4bit (existente) | 3.2B | 128k | GPTQ Int4 | Llama 3.2 Community | HuggingFace |
| google/gemma-2-2.6b-it | 2.6B | 8k | FP16 | Gemma License | HuggingFace |

La comparativa se basa en datos publicos de los modelos base. No hay benchmarks propios del checkpoint cuantizado, por lo que la comparacion de rendimiento no es posible sin evaluacion independiente.

## Limitaciones y advertencias

- Cuantizacion sin ajuste para produccion: el autor indica explicitamente que el checkpoint esta cuantizado para benchmarking, no para calidad de despliegue. Puede haber degradacion en tareas de razonamiento complejo o generacion de codigo.
- Calibracion solo en ingles: la cuantizacion se calibro con documentos de C4 en ingles, por lo que el error de cuantizacion puede ser mayor en otros idiomas.
- Sin licencia especificada: aunque el modelo base usa la Llama 3.2 Community License, la cuantizacion no declara su propia licencia. Se debe consultar al autor antes de uso comercial.
- Riesgo de alucinacion: inherente al modelo base; la cuantizacion no lo mitiga.
- Sin soporte de vision ni audio: es un modelo de texto puro.
- Contexto largo no verificado: aunque el modelo base soporta 128k, la cuantizacion no ha sido probada en contextos extremadamente largos; se recomienda validar la coherencia con ventanas superiores a 32k.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ChiraSahu/Llama-3.2-3B-Instruct-GPTQ-Int8
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Libreria GPTQModel: https://github.com/ModelCloud/GPTQModel
- Proyecto del autor (SPIT Mumbai): no se proporciona enlace directo en la informacion disponible.
