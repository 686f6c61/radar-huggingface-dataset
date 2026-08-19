# SolsticeAI/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-mlx-6Bit

## Resumen

Este repositorio contiene una cuantización MLX de 6 bits del modelo `DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1`, un finetune del modelo Qwen3.8-27B de Alibaba. El finetune, desarrollado por DavidAU con la colaboración de SolsticeAI (que publica esta versión MLX), emplea la técnica de entrenamiento COLD FUSION, una combinación del método propietario GAIN (ajuste dinámico del aprendizaje por muestra) y los sistemas de entrenamiento de Unsloth. El objetivo principal es reducir drásticamente el número de tokens de razonamiento (hasta 1/10 o 1/2 respecto al Qwen3.8 original) manteniendo o mejorando el rendimiento en tareas de razonamiento, codificación y escritura creativa.

El modelo base Qwen3.8-27B es un transformer denso de 27 mil millones de parámetros con capacidades multimodales (entrada de imagen y texto), contexto de 262 000 tokens y licencia Apache 2.0. Esta versión MLX en 6 bits está optimizada para ejecutarse en hardware Apple Silicon mediante el framework MLX, conservando según el autor más del 99,986 % del rendimiento del modelo en bfloat16. Es relevante para desarrolladores que buscan un modelo de 27B con razonamiento eficiente y visión en equipos Mac con memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con visión (image-text-to-text), basado en Qwen3.8-27B |
| Parametros totales | 27B (modelo base); el repo es una cuantizacion MLX de 6 bits |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (modelo base) |
| Tipos de cuantizacion | MLX 6-bit (este repo); el modelo base ofrece GGUF en multiples bits (regular y MTP) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con arquitectura de vision-lenguaje, entrenado por Alibaba con 262K de contexto y capacidades multimodales. El finetune `Cold-Fusion-GAIN-V1.1` aplica la tecnica COLD FUSION, que combina el metodo GAIN (ajuste dinamico del proceso de entrenamiento por muestra, modificando la tasa de aprendizaje y otros parametros en tiempo real) con los trainers de Unsloth. El entrenamiento se realizo sobre los datasets `DavidAU/Polar-STRICT-Datasets` y `DavidAU/Reasoning-STRICT-Datasets`, con el objetivo de reducir el tamaño de los bloques de razonamiento (thinking tokens) entre un 50 % y un 90 % respecto al Qwen3.8 original, manteniendo la calidad de las respuestas. El modelo conserva los tres modos de razonamiento del Qwen3.8 (xhigh, medium y low) y la capacidad de vision.

Esta version MLX de 6 bits, publicada por SolsticeAI, es una conversion del finetune original a formato MLX para Apple Silicon. No se han proporcionado detalles sobre el proceso de cuantizacion mas alla de indicar que retiene mas del 99,986 % del rendimiento del modelo en bfloat16.

## Capacidades

- Generacion de texto y razonamiento avanzado con reduccion significativa de tokens de pensamiento (entre 1/10 y 1/2 del tamaño original).
- Capacidades de vision: acepta imagenes como entrada ademas de texto (pipeline image-text-to-text).
- Codificacion y generacion de codigo en multiples lenguajes.
- Escritura creativa, narrativa, ficcion y roleplaying, con ajuste fino especifico para estos dominios.
- Soporte de tres modos de razonamiento configurables (xhigh, medium, low) mediante plantilla Jinja.
- Mejora en el seguimiento de instrucciones y compresion de la salida por defecto.
- Multilingue: ingles y chino.
- Compatible con decodificacion MTP (multi-token prediction) en las versiones GGUF del modelo base, aunque esta version MLX no lo incluye explicitamente.

## Casos de uso

- Asistentes conversacionales en Mac: al ser una cuantizacion MLX, se ejecuta de forma nativa en Apple Silicon con alto rendimiento y bajo consumo de memoria, ideal para aplicaciones de chat locales.
- Razonamiento eficiente en entornos de recursos limitados: la reduccion de tokens de pensamiento permite respuestas mas rapidas y economicas en coste computacional, adecuado para prototipos y aplicaciones en tiempo real.
- Analisis de imagenes y documentos: gracias a la capacidad de vision, puede procesar capturas, diagramas o fotografias y responder preguntas sobre su contenido.
- Generacion de codigo asistida: el modelo puede completar, explicar y depurar codigo en entornos de desarrollo integrados en Mac.
- Escritura creativa y roleplaying: su ajuste especifico para ficcion y narrativa lo hace util para generacion de historias, guiones o personajes en aplicaciones de entretenimiento.
- Agentes conversacionales multilingues: con soporte de ingles y chino, puede atender usuarios en ambos idiomas en aplicaciones de atencion al cliente o educacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este repositorio MLX en la informacion disponible. La model card afirma que el modelo supera a todos los Qwen 3.8, 3.6 y 3.5 de 27B en benchmarks criticos, pero no proporciona cifras concretas. Para el modelo base Qwen3.8-27B, los resultados de busqueda web citan los siguientes valores (referidos al modelo original, no al finetune):

| Benchmark | Resultado (modelo base Qwen3.8-27B) |
|---|---|
| DeepSWE | 42,2 |
| Terminal Bench | 73,0 |
| OSWorld | 84,3 |
| MathVision | Evaluado con prompt fijo (sin puntuacion publicada) |

Estos datos deben interpretarse con cautela, ya que corresponden al modelo base y no al finetune Cold-Fusion-GAIN-V1.1 ni a esta cuantizacion MLX.

## Requisitos de hardware

- Al ser una cuantizacion MLX de 6 bits, esta disenada para Apple Silicon (M1, M2, M3, M4 y posteriores).
- Tamano del repositorio: 21,9 GB, por lo que se requiere al menos 24 GB de memoria unificada para cargar el modelo completo (recomendado 32 GB o mas para margen).
- No es compatible directamente con GPUs NVIDIA o AMD sin convertir los pesos a otro formato (por ejemplo, GGUF o safetensors de precision completa).
- Se ejecuta mediante el framework MLX, que ofrece inferencia optimizada para Apple Silicon.
- Para el modelo base en otros formatos, se recomiendan GPUs con al menos 24 GB de VRAM en cuantizacion 4-bit o 6-bit (por ejemplo, RTX 3090/4090, A100).
- Opciones de despliegue: MLX (nativo en Apple), y para el modelo base, vLLM, llama.cpp, Ollama o TGI tras convertir los pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | bfloat16, GGUF | Modelo original de Alibaba, sin finetune |
| DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1 | 27B | 262K | Apache 2.0 | bfloat16, GGUF | Finetune con COLD FUSION, reduce tokens de razonamiento |
| SolsticeAI/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-mlx-6Bit (este) | 27B | 262K | Apache 2.0 | MLX 6-bit | Cuantizacion MLX para Apple Silicon del finetune anterior |
| Qwen3.5-27B | 27B | no disponible | Apache 2.0 | bfloat16, GGUF | Version anterior de Qwen, sin las mejoras de 3.8 |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion MLX 6-bit esta limitada a hardware Apple Silicon; no puede ejecutarse directamente en GPUs de otras marcas.
- El numero de parametros indicado en los metadatos del repositorio (5.885.566.464) parece incorrecto o corresponde a otra metrica; se recomienda verificar el tamano real del modelo (27B segun el nombre y el tamano del repo).
- El finetune modifica el comportamiento de razonamiento del modelo base; es necesario probar exhaustivamente en el caso de uso concreto antes de desplegarlo en produccion.
- No se han publicado benchmarks independientes para este finetune ni para esta cuantizacion; las afirmaciones de rendimiento provienen del autor.
- El modelo soporta principalmente ingles y chino; el rendimiento en otros idiomas puede ser inferior.
- Como todo modelo de lenguaje, puede generar alucinaciones o contenido sesgado. La licencia Apache 2.0 permite uso comercial, pero el responsable del despliegue debe asumir la responsabilidad de los resultados.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/SolsticeAI/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-mlx-6Bit
- Modelo base del finetune (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Guia sobre Qwen3.8-27B (blog): https://lovableapp.org/blog/qwen3-8-27b
- Referencia del finetune anterior de DavidAU (Qwen3.6-27B-Fable-Fusion): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
