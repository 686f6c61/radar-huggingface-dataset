# james58899/gemma-4-12B-it-qat-ONNX

## Resumen

Esta ficha corresponde a una conversión comunitaria a ONNX del modelo Gemma 4 12B IT en su variante QAT Q4_0, publicada por el usuario james58899 en Hugging Face. El modelo base es google/gemma-4-12B-it-qat-q4_0-unquantized, un modelo instruido (instruction-tuned) de Google de la familia Gemma 4, con pesos cuantizados a 4 bits mediante entrenamiento consciente de la cuantización (QAT, Quantization-Aware Training). La relevancia de esta conversión es doble: por un lado, permite ejecutar un modelo de 12 mil millones de parámetros con pesos de 4 bits, reduciendo drásticamente los requisitos de memoria; por otro, el formato ONNX habilita su despliegue con onnxruntime en entornos donde las herramientas habituales del ecosistema PyTorch o GGUF no son la mejor opción, incluyendo CPU y aceleradores diversos.

Es importante señalar que se trata de una conversión de texto únicamente (text-only): el checkpoint original corresponde a una arquitectura unificada (Gemma4UnifiedForCausalLM), pero esta exportación no incluye los codificadores de visión ni de audio, solo la parte de generación de texto. Además, el propio autor advierte en la model card que los scripts de conversión fueron generados con asistencia de IA (Claude) y recomienda verificar los resultados antes de usar el modelo en producción.

Al tratarse de un repositorio comunitario reciente (creado en octubre de 2026, con 226 descargas y sin likes en el momento de la extracción de datos), no se han publicado benchmarks propios ni documentación técnica detallada más allá de la estructura del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma4UnifiedForCausalLM, parte de texto unicamente) |
| Parametros totales | 12 mil millones (aproximado, segun denominacion del modelo base) |
| Parametros activos | no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QAT Q4_0 (pesos de 4 bits, bloques de 32); variantes q4 (activaciones y KV cache en fp32) y q4f16 (activaciones y KV cache en fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (segun la licencia de Gemma 4 de Google) |
| Formato de pesos | ONNX (convertido desde safetensors del checkpoint original) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 12B IT QAT Q4_0, un modelo instruido de Google cuya arquitectura se denomina en la configuracion Gemma4UnifiedForCausalLM, lo que sugiere una arquitectura unificada multimodal en el checkpoint original. Sin embargo, esta conversion ONNX contiene exclusivamente la parte de texto: no incluye codificadores de vision ni de audio, por lo que solo puede procesar y generar texto. Los pesos conservan la cuantizacion de 4 bits del entrenamiento QAT original (esquema de bloques de 32), una tecnica en la que el modelo se entrena simulando la cuantizacion, de modo que la perdida de calidad respecto al modelo en precisión completa es notablemente menor que con cuantizacion post-entrenamiento (PTQ).

Sobre el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO), la informacion disponible no ofrece detalles. La conversion a ONNX incluye dos variantes: q4, con activaciones y KV cache en fp32, y q4f16, con activaciones y KV cache en fp16; en ambas los pesos de 4 bits son identicos. Se incluyen tambien el tokenizador, la plantilla de chat y la configuracion de generacion copiadas del checkpoint original, asi como los scripts de conversion en el directorio scripts/.

## Capacidades

- Generacion de texto conversacional: al tratarse de un modelo instruido (IT), esta preparado para seguir instrucciones y mantener dialogos mediante su plantilla de chat.
- Comprension y generacion de codigo, razonamiento y matematicas: propios de la familia Gemma en su variante instruida, aunque sin datos cuantificados en la informacion disponible.
- Soporte de KV cache en la exportacion ONNX, lo que permite generacion eficiente de secuencias largas con onnxruntime.
- Dos modos de precision para activaciones (fp32 y fp16), lo que permite ajustar el equilibrio entre velocidad y calidad segun el hardware.
- No incluye capacidades de vision ni de audio en esta conversion, aunque el checkpoint original sea de arquitectura unificada.
- Soporte de tool calling, agentes y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en entornos con recursos limitados: gracias a los pesos QAT de 4 bits, el modelo ocupa aproximadamente 14,4 GB en el repositorio, lo que lo hace viable en estaciones de trabajo con GPU de consumo para inferencia de modelos de 12B.
- Integracion en aplicaciones .NET, Java o C++: onnxruntime tiene bindings de primera clase en estos lenguajes, por lo que esta conversion es util para incorporar un LLM a aplicaciones empresariales sin depender del ecosistema Python.
- Inferencia en CPU: onnxruntime ofrece optimizaciones para CPU (incluida cuantizacion de activaciones), y la variante q4f16 puede acelerar la ejecucion en hardware con soporte fp16.
- Chatbots y asistentes conversacionales: al ser un modelo instruido con plantilla de chat incluida, puede servir como base de dialogo multi-turno en productos que ya usen ONNX Runtime.
- Prototipado de pipelines de inferencia portables: ONNX facilita mover el modelo entre distintos backends (CPU, CUDA, DirectML, CoreML) sin reescribir el codigo de inferencia.
- Generacion de texto en servicios con restricciones de licencia: la licencia Apache 2.0 permite uso comercial, lo que lo hace adecuado para productos de codigo abierto o comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de una conversion comunitaria, el autor no incluye evaluaciones de MMLU, HumanEval, GSM8K ni otras metricas, ni comparaciones de calidad entre las variantes q4 y q4f16. Para datos de rendimiento del modelo base, habria que consultar la documentacion oficial de Google sobre Gemma 4.

## Requisitos de hardware

- VRAM estimada: el repositorio completo pesa 14,4 GB; la variante q4f16, con KV cache y activaciones en fp16, deberia funcionar en torno a 12-16 GB de VRAM considerando cache y sobrecargas; la variante q4 (fp32 en activaciones) requerira mas memoria. Estas cifras son estimaciones basadas en el tamano del repositorio, no datos publicados.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 (24 GB) deberia alojar la variante q4f16 con holgura; para la variante q4 con activaciones fp32, GPUs con mas memoria como A100 o H100 ofrecen margen adicional. No hay datos oficiales de requisitos.
- Consumer GPUs: en principio cabe en GPUs de consumo con 16 GB o mas de VRAM (RTX 4080/4090, RTX 5080/5090) usando la variante q4f16; con 12 GB el margen seria ajustado y dependeria de la longitud de contexto.
- Opciones de despliegue: onnxruntime (libreria nativa de este repositorio), incluido onnxruntime-genai para generacion con KV cache. No es un repositorio GGUF, por lo que llama.cpp u Ollama no lo consumen directamente; vLLM y TGI tampoco cargan ONNX de este formato de forma estandar.
- Latencia y throughput: no disponible; dependeran del backend de ejecucion (CPU, CUDA, DirectML) y de la variante elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| james58899/gemma-4-12B-it-qat-ONNX | 12B (aprox.) | QAT Q4_0 | ONNX | Apache 2.0 | Conversion comunitaria, solo texto |
| google/gemma-4-12B-it-qat-q4_0-unquantized | 12B (aprox.) | QAT Q4_0 | Safetensors (PyTorch) | Gemma 4 / Apache 2.0 | Modelo base oficial de Google |
| Equivalentes GGUF de 12B (p. ej., conversiones Q4 de Gemma 12B) | 12B (aprox.) | Q4_K/Q4_0 | GGUF | Segun modelo base | Compatibles con llama.cpp y Ollama |

La principal diferencia practica frente al checkpoint oficial es el formato de despliegue: ONNX frente a PyTorch/safetensors. Frente a las conversiones GGUF, el formato ONNX es preferible cuando se integra con onnxruntime en aplicaciones no Python, mientras que GGUF ofrece un ecosistema de herramientas mas maduro para inferencia local en escritorio.

## Limitaciones y advertencias

- Conversion comunitaria sin verificacion oficial: el autor advierte explicitamente que los scripts de conversion fueron escritos con asistencia de IA y pide comprobar los resultados antes de usarlos; conviene validar las salidas contra el modelo base.
- Solo texto: se han eliminado los codificadores de vision y audio de la arquitectura unificada original; no puede procesar imagenes ni audio.
- Sin benchmarks ni evaluaciones de calidad publicadas para esta conversion; la calidad real de las variantes q4 y q4f16 no esta documentada.
- Datos del modelo base incompletos: longitud de contexto, idiomas soportados y detalles de entrenamiento no estan disponibles en la informacion proporcionada.
- Advertencia del autor: "use it at your own risk" (uselo bajo su propia responsabilidad), lo que desaconseja su uso en produccion sin pruebas exhaustivas.
- Bajo nivel de adopcion: 226 descargas y 0 likes en el momento de la extraccion, sin comunidad de soporte detras.
- Licencia: Apache 2.0 segun la model card, con enlace a los terminos de licencia de Gemma 4 de Google; conviene revisar las condiciones de uso de Gemma para aplicaciones comerciales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/james58899/gemma-4-12B-it-qat-ONNX
- Modelo base oficial: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Licencia Gemma 4 de Google: https://ai.google.dev/gemma/docs/gemma_4_license
