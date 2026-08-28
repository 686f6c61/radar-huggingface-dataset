# ailexleon/Orion-26B-A4B-v1-mlx-4Bit

## Resumen

Orion-26B-A4B-v1-mlx-4Bit es una conversión del modelo Gemma 4 26B A4B (desarrollado por Google) al formato MLX con cuantización de 4 bits, realizada por el usuario ailexleon. El modelo original es un transformer de mezcla de expertos (MoE) con 26 mil millones de parámetros totales y 4 mil millones activos por token, diseñado para generación de texto y conversación. Esta versión MLX está optimizada para ejecutarse en hardware Apple Silicon (Macs con chips M-series) mediante la librería mlx-lm, lo que permite desplegar un modelo de gran tamaño en equipos de consumo sin necesidad de GPUs dedicadas. El repositorio incluye los pesos en formato safetensors (14.2 GB) y una plantilla de chat para uso conversacional. Aunque el nombre sugiere 26B totales, el archivo safetensors contiene 3.944.621.086 parámetros, una discrepancia que podría deberse a una cuantización parcial o a una versión recortada; no se dispone de más detalles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) basado en Gemma 4 |
| Parametros totales | 3.944.621.086 (segun safetensors; el nombre indica 26B totales) |
| Parametros activos | 4B (segun el nombre "A4B"; no confirmado en los archivos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo original, Gemma 4 26B A4B, es un transformer con arquitectura de mezcla de expertos (MoE) que activa solo 4 mil millones de parámetros por token, lo que reduce el coste computacional en inferencia manteniendo una capacidad total de 26 mil millones. Esta versión MLX conserva la arquitectura original pero convierte los pesos a cuantización de 4 bits para reducir el uso de memoria y acelerar la inferencia en Apple Silicon. No se dispone de información sobre los datos de entrenamiento, el número de tokens procesados ni las técnicas de alineación (RLHF, DPO, etc.) en la documentación proporcionada. El tag "gemma4" confirma que se trata de una adaptación del modelo de Google, pero no se detallan innovaciones adicionales más allá de la conversión a MLX.

## Capacidades

- Generacion de texto y conversacion multi-turno gracias a la plantilla de chat incluida.
- Razonamiento y comprension del lenguaje natural en ingles (unico idioma declarado).
- Probable soporte de tool calling y function calling, heredado de Gemma 4, aunque no esta confirmado en esta version especifica.
- Capacidad de ejecucion en hardware Apple Silicon mediante la libreria mlx-lm, con inferencia local y privada.
- No se mencionan capacidades de vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede integrarse en aplicaciones de chat privadas usando mlx-lm, aprovechando la cuantizacion 4-bit para caber en la memoria unificada de un Mac con 16 GB o mas.
- Generacion de texto creativo: redaccion de articulos, correos o guiones en ingles, con la ventaja de ejecucion sin conexion a internet.
- Prototipado de agentes conversacionales: al ser un modelo MoE con 4B activos, ofrece latencia reducida en comparacion con modelos densos del mismo tamano, adecuado para pruebas de concepto.
- Analisis de sentimiento o clasificacion de texto: puede usarse como backend de procesamiento de lenguaje natural en entornos donde la privacidad de los datos es critica.
- Educacion y aprendizaje: demostraciones de modelos de lenguaje grandes en equipos de consumo, sin necesidad de GPUs de alta gama.
- Desarrollo de aplicaciones multiplataforma: al estar en formato MLX, se integra con el ecosistema de Apple (Swift, Xcode) para crear apps nativas con capacidades de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para esta conversion especifica. El rendimiento en inferencia depende del hardware Apple Silicon y de la implementacion de mlx-lm; no se proporcionan cifras de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 14.2 GB, por lo que se recomienda un Mac con al menos 16 GB de memoria unificada para cargar el modelo en 4-bit. Con 32 GB se puede operar con mayor margen.
- GPU recomendadas: no aplica (especifico para Apple Silicon, no para GPUs NVIDIA o AMD).
- Compatibilidad: funciona en Macs con chips M1, M2, M3 o M4, siempre que tengan suficiente RAM unificada.
- Opciones de despliegue: mediante la libreria mlx-lm (pip install mlx-lm) y el codigo de ejemplo proporcionado en la model card. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles; dependen del chip y de la cantidad de memoria disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Orion-26B-A4B-v1-mlx-4Bit (este) | 3.94B (segun safetensors) | 4B (nominal) | no disponible | no disponible | MLX 4-bit |
| google/gemma-4-26B-A4B (original) | 26B | 4B | no disponible | Gemma Terms of Use | safetensors (BF16) |
| beaverai/Orion-26B-A4B-v1f-GGUF | 26B (nominal) | 4B | no disponible | no disponible | GGUF |

La comparativa se basa en el nombre y los tags; no hay datos de rendimiento publicados para ninguna de estas versiones. El modelo original de Google es la referencia, pero esta conversion MLX esta pensada exclusivamente para Apple Silicon, mientras que la version GGUF (de otro autor) apunta a CPU/GPU genericas.

## Limitaciones y advertencias

- Licencia no disponible: no se puede verificar si el uso comercial esta permitido; se recomienda contactar al autor o consultar la licencia del modelo original de Google (Gemma Terms of Use) antes de usarlo en produccion.
- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede generar contenido incorrecto o sesgado; no se han realizado evaluaciones de sesgo en esta version.
- Idioma limitado: solo se declara soporte para ingles; el rendimiento en otros idiomas no esta garantizado.
- Discrepancia en parametros: el archivo safetensors contiene 3.94B parametros, mientras que el nombre indica 26B; esto sugiere que podria ser una version parcial o cuantizada de forma no estandar, lo que podria afectar a la calidad de las respuestas.
- Sin soporte de vision ni audio: a diferencia de otras variantes de Gemma 4, esta conversion solo maneja texto.
- Dependencia de MLX: el modelo solo funciona con la libreria mlx-lm, lo que limita su portabilidad a otros entornos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ailexleon/Orion-26B-A4B-v1-mlx-4Bit
- Modelo original de Google: https://huggingface.co/google/gemma-4-26B-A4B
- Repositorio de referencia para conversiones MLX de Gemma 4: https://github.com/FakeRocket543/mlx-gemma4/tree/main/gemma4-26b-a4b-mlx-4bit
- Articulo sobre despliegue de Gemma 4 26B A4B en RTX 5090 (no directamente relacionado, pero util para comparar): https://pub.towardsai.net/deploying-gemma-4-26b-a4b-on-an-rtx-5090-69dacb0c116d
