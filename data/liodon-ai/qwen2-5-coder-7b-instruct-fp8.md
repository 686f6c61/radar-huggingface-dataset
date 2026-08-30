# liodon-ai/Qwen2.5-Coder-7B-Instruct-FP8

## Resumen

El modelo `liodon-ai/Qwen2.5-Coder-7B-Instruct-FP8` es una cuantización FP8 dinámica del modelo original `Qwen/Qwen2.5-Coder-7B-Instruct`, publicada por Liodon AI. Esta versión reduce el tamaño de los pesos de 15,2 GB a 8,7 GB, manteniendo las capacidades del modelo base de generación y razonamiento de código, y está diseñada para acelerar la inferencia en GPUs modernas con soporte nativo para FP8 (compute capability ≥ 8.9).

La cuantización utiliza el esquema `FP8_DYNAMIC` de la librería `llm-compressor`: los pesos se convierten a FP8 (E4M3) por canal de forma estática, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. Al no requerir dataset de calibración, los pesos cuantizados son un cast directo de los originales, lo que evita sesgos introducidos por la calibración. El `lm_head` se deja sin cuantizar por ser de tamaño despreciable y por su impacto desproporcionado en la calidad si se cuantizara.

Este modelo es relevante para desarrolladores que necesitan desplegar un asistente de código de 7B parámetros en entornos con memoria limitada o que buscan reducir la latencia en producción, siempre que dispongan de hardware compatible con FP8. Es compatible con los principales motores de inferencia como vLLM, TGI y SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen2.5) |
| Parametros totales | 7.615.616.512 (~7,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (E4M3) dinamico, `lm_head` sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | other (consulte la licencia del modelo base) |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion, no un entrenamiento desde cero. El modelo base `Qwen/Qwen2.5-Coder-7B-Instruct` es un transformer decoder-only de 7,6B parametros, entrenado sobre 5,5 billones de tokens de codigo, texto y datos sinteticos, segun la informacion recopilada en la busqueda web. La cuantizacion FP8 se realizo con `llm-compressor` usando el esquema `FP8_DYNAMIC`: los pesos se convierten a FP8 por canal de forma estatica, y las activaciones se cuantizan dinamicamente por token en inferencia. No se utilizo dataset de calibracion, por lo que los pesos cuantizados son numericamente un cast directo de los originales, sin sesgo de calibracion. El `lm_head` se mantiene en precision original para preservar la calidad de la salida.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, razonamiento sobre logica de codigo y correccion de errores, segun las capacidades del modelo base.
- Seguimiento de instrucciones en conversaciones multi-turno, optimizado para tareas de chat y asistencia tecnica.
- Capacidad de razonamiento y resolucion de problemas, util para tareas de depuracion y refactorizacion.
- La cuantizacion FP8 no altera las capacidades funcionales del modelo base; solo reduce el tamano y acelera la inferencia en hardware compatible.

## Casos de uso

- Asistente de programacion en IDE: el modelo puede integrarse en editores como VS Code o JetBrains para ofrecer autocompletado, sugerencias de codigo y explicaciones contextuales, aprovechando su capacidad de seguir instrucciones multi-turno.
- Generacion de codigo en pipelines CI/CD: puede utilizarse para generar pruebas unitarias, documentacion o fragmentos de codigo repetitivos dentro de un flujo de integracion continua, reduciendo el trabajo manual de los desarrolladores.
- Revision de codigo automatizada: el modelo puede analizar pull requests, detectar posibles errores logicos o de estilo, y sugerir correcciones, gracias a su entrenamiento en razonamiento sobre codigo.
- Chatbot tecnico de soporte: desplegado como servicio de chat, puede responder preguntas sobre APIs, librerias o fragmentos de codigo, manteniendo el contexto de la conversacion.
- Educacion en programacion: como tutor virtual, puede explicar conceptos, generar ejemplos y resolver dudas de estudiantes en tiempo real.
- Refactorizacion de codigo: el modelo puede proponer reescrituras de funciones o clases para mejorar legibilidad o rendimiento, basandose en su comprension de patrones de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 8,7 GB, por lo que se recomienda al menos 12 GB de VRAM para dejar margen a las activaciones y al overhead del runtime.
- GPU recomendadas: NVIDIA RTX 40-series (compute capability 8.9), L4/L40S, H100/H200, B100/B200/GB10. En GPUs con compute capability inferior (por ejemplo, RTX 30-series), vLLM o TGI dequantizaran los pesos a FP16/BF16, perdiendo la ventaja de velocidad y memoria.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI) y SGLang, todos compatibles con el formato safetensors FP8.
- Latencia y throughput: no se proporcionan datos especificos, pero la cuantizacion FP8 reduce el ancho de banda de memoria requerido, lo que suele traducirse en menor latencia y mayor throughput en GPUs con soporte nativo.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano pesos | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| Qwen2.5-Coder-7B-Instruct (base) | 7,6B | 15,2 GB | safetensors (BF16) | other | No disponible |
| liodon-ai/Qwen2.5-Coder-7B-Instruct-FP8 | 7,6B | 8,7 GB | safetensors (FP8) | other | No disponible |
| liodon-ai/Qwen2.5-Coder-7B-Instruct-imatrix-GGUF | 7,6B | No disponible | GGUF | other | No disponible |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos de rendimiento para comparar con otros modelos de codigo de tamano similar como CodeLlama-7B o DeepSeek-Coder-7B.

## Limitaciones y advertencias

- La cuantizacion FP8 puede introducir una ligera degradacion en la precision numerica, aunque al ser un cast directo sin calibracion, el impacto esperado es minimo. No se han publicado evaluaciones que cuantifiquen esta perdida.
- La licencia del modelo se indica como "other", lo que puede implicar restricciones de uso comercial. Se recomienda revisar la licencia del modelo base `Qwen/Qwen2.5-Coder-7B-Instruct` antes de utilizarlo en produccion.
- En GPUs sin soporte nativo para FP8, el modelo se dequantiza automaticamente, lo que anula los beneficios de memoria y velocidad, y puede requerir mas VRAM que la version original.
- El modelo puede alucinar codigo o generar soluciones incorrectas en casos complejos, como cualquier LLM de codigo. Es necesario validar las salidas en entornos criticos.
- No se dispone de informacion sobre los idiomas soportados ni sobre la longitud de contexto, por lo que se recomienda verificar estos parametros en el modelo base antes de un despliegue que dependa de ellos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/liodon-ai/Qwen2.5-Coder-7B-Instruct-FP8)
- [Modelo base Qwen2.5-Coder-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct)
- [Version GGUF del mismo autor](https://huggingface.co/liodon-ai/Qwen2.5-Coder-7B-Instruct-imatrix-GGUF)
