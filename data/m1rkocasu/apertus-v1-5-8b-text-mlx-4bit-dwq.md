# m1rkocasu/Apertus-v1.5-8B-text-MLX-4bit-DWQ

## Resumen

Apertus v1.5 8B es una familia de modelos de lenguaje de 8.000 millones de parámetros desarrollada por la Swiss AI Initiative (EPFL, ETH Zúrich y el Centro Nacional de Supercomputación de Suiza) sobre datos completamente abiertos. Esta versión concreta, `m1rkocasu/Apertus-v1.5-8B-text-MLX-4bit-DWQ`, es la rama de solo texto del modelo base, convertida al formato MLX y cuantizada a 4 bits mediante *distilled weight quantization* (DWQ). Está pensada para ejecutarse en Apple Silicon a través de la librería `mlx-lm`, ofreciendo un tamaño en disco de 4,53 GB y una ventana de contexto de 262.144 tokens.

El modelo base Apertus 1.5 es un *continued pretraining* de Apertus 1.0, al que se añadieron 4 billones de tokens de entrenamiento adicionales. La cuantización DWQ entrena las escalas y los sesgos de cada grupo de 64 pesos usando como profesor la versión de 8 bits del mismo modelo, logrando una perplejidad de 10,97 en wikitext-2, solo un 5,4 % superior a la referencia de 8 bits. Es una opción interesante para desarrolladores que necesitan un modelo multilingüe, de contexto muy largo y con licencia Apache 2.0, ejecutable en hardware de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ApertusForCausalLM (transformer decoder, 32 capas, hidden size 4096, 32 cabezas de atencion, 8 cabezas key-value) |
| Parametros totales | 1.258.565.632 (segun safetensors; el modelo base es de 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4-bit DWQ (4,500 bits por peso) |
| Idiomas soportados | multilingue (lista especifica no disponible) |
| Licencia | Apache 2.0 con politica de uso aceptable de Apertus 1.5 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Apertus v1.5 8B es un transformer decoder con 32 capas, dimension oculta de 4096, 32 cabezas de atencion y 8 cabezas key-value, con activacion xIELU y un vocabulario de 131.072 tokens de texto. Se trata de un *continued pretraining* de Apertus 1.0, al que se anadieron 4 billones de tokens de datos de texto y multimodales (aunque esta rama es solo texto). El entrenamiento se realizo con datos abiertos y el modelo se publica con pesos, datos y detalles de entrenamiento completamente abiertos.

La version MLX 4-bit DWQ parte de una conversion estandar a 4 bits con grupo de 64, y luego entrena las escalas y los sesgos de cada grupo mediante destilacion desde la version de 8 bits del mismo modelo. El corpus de destilacion fue una muestra de 10.000 documentos de The Pile (512 ventanas de 1025 tokens), con una pasada, learning rate de 1e-6 y batch de 2. La perdida de validacion de la destilacion bajo de 0,099 a 0,051. El resultado es una cuantizacion que mantiene el mismo tamano de archivo que una cuantizacion 4-bit plana, pero con mejor perplejidad (10,97 frente a 11,59).

## Capacidades

- Generacion de texto conversacional y de larga forma, con soporte de contexto de hasta 262.144 tokens.
- Razonamiento y resolucion de problemas en multiples idiomas (el modelo es multilingue, aunque no se detalla la lista exacta).
- Generacion de codigo y soporte de *function calling* (segun la documentacion de LLMTR).
- Capacidad de procesar documentos largos completos en una sola pasada gracias a su amplia ventana de contexto.
- Soporte de salida en formato JSON y flujos de transformacion de datos.
- Esta rama es exclusivamente de texto (text in, text out); no incluye capacidades de vision.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo, manteniendo el historial completo de la interaccion gracias a sus 262.144 tokens de ventana.
- Analisis y resumen de documentos extensos: contratos, informes anuales o articulos cientificos pueden procesarse en una sola llamada, sin necesidad de dividir el texto.
- Generacion de codigo en produccion: con soporte de *function calling*, puede integrarse en pipelines de CI/CD para autocompletar, revisar o documentar codigo.
- Clasificacion y extraccion de informacion: adecuado para tareas de etiquetado, extraccion de entidades o transformacion de datos estructurados, con salida en JSON.
- Asistentes virtuales multilingues: al ser multilingue, puede servir de base para chatbots en varios idiomas sin necesidad de modelos separados.
- Prototipado rapido en Apple Silicon: al ser un modelo MLX de 4,53 GB, se puede ejecutar localmente en un Mac con suficiente RAM, ideal para desarrollo y pruebas sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la perplejidad en el conjunto de test de `Salesforce/wikitext` (configuracion `wikitext-2-raw-v1`), medida sobre 200 ventanas no solapadas de 512 tokens (102.400 tokens puntuados). La tabla siguiente compara esta cuantizacion con otras variantes del mismo modelo:

| Variante | Bits por peso | Tamano | Perplejidad | Diferencia frente a 8-bit |
|---|---|---|---|---|
| 8-bit | 8,500 | 8,54 GB | 10,41 | referencia |
| 6-bit | 6,500 | 6,54 GB | 10,46 | +0,5 % |
| 5-bit | 5,500 | 5,54 GB | 10,53 | +1,1 % |
| 4-bit DWQ (este repo) | 4,500 | 4,53 GB | 10,97 | +5,4 % |
| MXFP4 | 4,250 | 4,28 GB | 11,71 | +12,5 % |

La perplejidad compara cuantizaciones del mismo modelo sobre un mismo corpus; no indica como se comporta el modelo frente a otros modelos ni su capacidad para seguir instrucciones.

## Requisitos de hardware

- Disenado para Apple Silicon (M1, M2, M3, M4 y posteriores) con macOS 26.5 o superior (segun la version de mlx-lm usada).
- Tamano en disco: 4,53 GB, por lo que cabe en Macs con 8 GB de RAM o mas, aunque se recomienda al menos 16 GB para una experiencia fluida.
- No requiere GPU dedicada; utiliza la memoria unificada del chip de Apple.
- Ejecucion mediante `mlx-lm` (CLI o Python) o servidor OpenAI-compatible con `mlx_lm.server`.
- No hay datos de latencia o throughput publicados para esta cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Apertus v1.5 8B (base) | 8B | 262.144 | Apache 2.0 | safetensors (bfloat16) | Modelo original, multimodal, requiere mas recursos |
| Apertus v1.5 8B MLX 4-bit DWQ (este) | 1,26B en safetensors | 262.144 | Apache 2.0 | MLX safetensors | Cuantizado para Apple Silicon, solo texto |
| Llama 3.1 8B | 8B | 128.000 | Llama 3.1 Community License | safetensors, GGUF | Alternativa popular, no multilingue de forma nativa |
| Mistral 7B | 7B | 32.000 | Apache 2.0 | safetensors, GGUF | Menor contexto, menos parametros |

La comparativa se basa en caracteristicas generales; no se dispone de resultados de benchmarks comunes para establecer una comparacion de rendimiento directa.

## Limitaciones y advertencias

- Es una cuantizacion 4-bit, por lo que puede presentar una ligera perdida de calidad frente al modelo en bfloat16 o 8 bits (perplejidad +5,4 % respecto a 8-bit).
- Esta rama es solo de texto; no incluye las capacidades multimodales del modelo base.
- La lista exacta de idiomas soportados no esta documentada en la informacion disponible.
- La licencia Apache 2.0 incluye una politica de uso aceptable de Apertus 1.5; es necesario revisarla antes de un despliegue comercial.
- No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, etc.), por lo que su rendimiento en tareas especificas no esta validado.
- El modelo puede alucinar o generar informacion incorrecta, como cualquier LLM; se recomienda validacion humana en aplicaciones criticas.
- Al estar disenado para Apple Silicon, no es directamente utilizable en entornos CUDA sin una conversion adicional.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/m1rkocasu/Apertus-v1.5-8B-text-MLX-4bit-DWQ
- Modelo base: https://huggingface.co/swiss-ai/Apertus-v1.5-8B
- Sitio oficial de Apertus AI: https://apertus-ai.org/
- Documentacion de Apertus: https://apertus-ai.org/pages/documentation/
- Articulo de Apertus 1.5: https://apertus-ai.org/articles/2026-07-apertus-1-5/
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
