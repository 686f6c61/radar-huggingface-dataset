# RolanDorisTech/Qwen3.8-9B-Distill-MLX-6bit

## Resumen

Qwen3.8-9B-Distill-MLX-6bit es una version cuantizada en formato MLX nativo del modelo empero-ai/Qwen3.8-9B-Distill, un destilado de 9.000 millones de parametros que transfiere razonamiento en cadena de pensamiento (chain-of-thought) desde la familia Qwen3.8 a la arquitectura Qwen3.5-9B. La publica el usuario RolanDorisTech y esta pensado para ejecucion local en Apple Silicon mediante la libreria mlx-lm.

El repositorio es un alias de busqueda del canonico RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ6e: comparte exactamente los mismos pesos y el mismo metodo de cuantizacion oQ6e. Este metodo aplica cuantizacion de precision mixta (aproximadamente 6 bits por peso de media, no uniforme) con ponderacion por importancia de activaciones (imatrix) para asignar mas bits a las capas sensibles (lm_head, embeddings, primeros y ultimos bloques) y menos a las tolerantes.

Es relevante porque permite desplegar un modelo de 9B con 262.144 tokens de contexto nativo en un unico equipo con Apple Silicon, con un tamano de archivo de 7,0 GB y licencia Apache-2.0, sin depender de GPU dedicada. El modelo base conserva capacidades de razonamiento, function calling nativo y un contexto muy largo, lo que lo hace util para agentes y tareas de codigo en local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (arquitectura Qwen/Qwen3.5-9B) |
| Parametros totales | 9.000 millones (9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | oQ6e (~6 bits de media, precision mixta con imatrix); existe variante hermana oQ5e |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors |
| Tamano del repositorio | 7,0 GB |
| Libreria | mlx (mlx-lm, oMLX, LM Studio, mlx-swift) |
| Modelo base | empero-ai/Qwen3.8-9B-Distill |
| Plantilla de chat | Qwen3 chat template con etiquetas `<think>` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder basado en la arquitectura Qwen3.5-9B. El modelo base empero-ai/Qwen3.8-9B-Distill es un destilado que traslada el razonamiento en cadena de pensamiento de la familia Qwen3.8 hacia esa arquitectura de 9B, entrenado sobre aproximadamente 70.000 trazas del profesor (teacher traces). Esta orientado a despliegue en una sola GPU y conserva el contexto nativo de 262.144 tokens, ademas de function calling nativo.

Sobre este base, RolanDorisTech aplica la cuantizacion oMLX Universal Dynamic Quantization con el metodo oQe. En lugar de un presupuesto de bits uniforme, oQ mide la sensibilidad real de cada capa al error de cuantizacion mediante datos de calibracion y reparte una precision mixta en consecuencia; oQe anade una pasada de calibracion de importancia de activaciones (imatrix) que pondera el error por canal segun su relevancia durante la calibracion. El resultado declarado es un archivo de 7,0 GB con una media de ~6 bits por peso, no equivalente al algoritmo Q6_K_M ni a un 6-bit uniforme. No se dispone de informacion detallada sobre el dataset de destilacion, el uso de RLHF/DPO ni la composicion exacta de los datos de entrenamiento del modelo base.

## Capacidades

- Generacion de texto en formato conversacional y de continuacion libre (pipeline text-generation).
- Razonamiento en cadena de pensamiento mediante la plantilla Qwen3 con etiquetas `<think>`, heredado del destilado.
- Function calling nativo y soporte para tool calling, segun el modelo base.
- Escenarios de agentes y razonamiento multi-paso, apoyados en el contexto de 262.144 tokens.
- Generacion de codigo, segun las caracteristicas del modelo base (no se detallan benchmarks especificos en la informacion disponible).
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Inferencia local en Apple Silicon mediante MLX, con compatibilidad de formato con mlx-lm, oMLX, LM Studio y mlx-swift.

## Casos de uso

- Asistente de razonamiento local en Mac: el modelo puede ejecutarse con mlx-lm sobre un equipo Apple Silicon para tareas de analisis paso a paso, gracias al modo de pensamiento y a un contexto de 262.144 tokens que permite cargar documentos extensos completos.
- Agente de codigo en entorno de desarrollo: al soportar function calling nativo, puede integrarse como backend de herramientas que invocan funciones (ejecutar tests, consultar repositorios) dentro de un flujo de trabajo local sin enviar codigo a servicios externos.
- Analisis de documentacion tecnica larga: con 262.144 tokens de contexto se pueden procesar manuales, especificaciones o bases de codigo extensas en una sola pasada, sin fragmentar en trozos.
- Atencion al cliente automatizada en local: el contexto largo y la plantilla conversacional permiten mantener dialogos multi-turno con historial extenso en un despliegue on-premise.
- Prototipado rapido en LM Studio: al ser compatible con LM Studio, un desarrollador puede descargar el modelo y probar prompts sin configurar infraestructura adicional.
- Investigacion sobre cuantizacion: por su naturaleza de alias del repo oQ6e, sirve como referencia practica de como la precision mixta con imatrix afecta al rendimiento de razonamiento de un modelo de 9B en Apple Silicon.
- Generacion de resumenes y sintesis de informes: el contexto amplio y las capacidades de generacion permiten condensar grandes volumenes de texto conservando coherencia a lo largo de documentos largos.
- Automatizacion de tareas multi-paso con herramientas: combinando function calling y contexto largo, puede orquestar cadenas de acciones (consultar datos, transformarlos, generar salida) en pipelines locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este modelo en la informacion disponible. La model card incluye una tabla de rendimiento de la metodologia oQ, medida sobre Qwen3.5-35B-A3B con MMLU y 300 muestras, que documenta el metodo de cuantizacion y no la calidad de este modelo concreto:

| Bits | Cuantizacion uniforme (mlx-lm) | oQ |
|---:|---:|---:|
| 2-bit | 14,0% | 64,0% |
| 3-bit | 76,3% | 85,0% |
| 4-bit | 79,7% | 83,3% |

Se cita tambien como referencia el articulo de SqueezeLLM (arXiv:2306.07629), que reporta para LLaMA-7B en perplexity sobre C4: 28,26 con RTN uniforme, 18,08 con cuantizacion no uniforme agnostica a la sensibilidad y 7,75 con cuantizacion no uniforme basada en sensibilidad. Asimismo, el observer `imatrix_mse` de LLM Compressor (vLLM) reduce la perplexity en WikiText-2 de Llama-3.1-8B (W4A16) de 6,96 a 6,85, y a 6,83 con GPTQ. Estos datos corresponden a otros modelos y no deben interpretarse como resultados de este modelo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el archivo oQ6e ocupa 7,0 GB, por lo que se recomienda al menos 8-10 GB de memoria unificada libre. La variante hermana oQ5e ocupa 6,0 GB. El modelo base en precision completa se estima en unos 19,3 GB de VRAM (dato de LLM Explorer para el modelo base).
- Plataforma objetivo: Apple Silicon (series M1/M2/M3/M4 y superiores), dado que el formato es MLX nativo.
- GPU dedicadas: no se documenta soporte para A100, H100 o RTX 4090, ya que MLX esta orientado a Apple Silicon. Para otras GPU habria que buscar una version GGUF o de otro formato.
- Cabe en hardware consumer: si, en equipos Apple Silicon con memoria unificada suficiente (recomendado 16 GB o mas para dejar margen al contexto de 262.144 tokens).
- Opciones de despliegue: mlx-lm (`mlx_lm.generate`), oMLX, LM Studio y mlx-swift. El formato son safetensors MLX estandar.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RolanDorisTech/Qwen3.8-9B-Distill-MLX-6bit (oQ6e) | 9B | 262.144 | oQ6e (~6 bits), MLX safetensors (7,0 GB) | Apache-2.0 | Hugging Face |
| RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ5e | 9B | 262.144 | oQ5e, MLX safetensors (6,0 GB) | Apache-2.0 | Hugging Face |
| empero-ai/Qwen3.8-9B-Distill (base) | 9B | 262.144 | precision completa, safetensors (~19,3 GB estimados) | Apache-2.0 | Hugging Face |

La diferencia principal entre las dos variantes MLX es el tamano (7,0 GB frente a 6,0 GB) y el nivel de precision mixta, lo que se traduce en un compromiso entre fidelidad de razonamiento y uso de memoria. El modelo base sin cuantizar ofrece la maxima fidelidad pero requiere bastante mas memoria. No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan tasas especificas para este modelo. La cuantizacion a ~6 bits puede incrementar ligeramente el error respecto al modelo base sin cuantizar.
- Limitaciones de contexto o idioma: se declaran 262.144 tokens nativos, pero la lista de idiomas soportados no esta disponible; el rendimiento fuera del ingles y el chino puede no estar garantizado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y atribucion. Conviene verificar las condiciones del modelo base empero-ai/Qwen3.8-9B-Distill.
- Naturaleza de alias: este repositorio es un alias de busqueda de RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ6e; los pesos y el metodo son identicos. La documentacion completa esta en el repositorio canonico.
- Compatibilidad: el formato es MLX safetensors, por lo que no funciona de forma directa fuera del ecosistema MLX (Apple Silicon). Quien necesite CUDA debera buscar una conversion GGUF u otro formato.
- Comportamiento en produccion: la model card advierte de que la compatibilidad de ejecucion debe verificarse contra la version concreta de la aplicacion. El modelo se publico muy recientemente (creado el 25 de septiembre de 2026) y no tiene descargas ni likes, por lo que carece de validacion de la comunidad.

## Enlaces

- Hugging Face (este repositorio, alias): https://huggingface.co/RolanDorisTech/Qwen3.8-9B-Distill-MLX-6bit
- Hugging Face (repositorio canonico oQ6e): https://huggingface.co/RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ6e
- Hugging Face (variante oQ5e): https://huggingface.co/RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ5e
- Hugging Face (modelo base): https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- GitHub (serie Qwen3.8): https://github.com/QwenLM/Qwen3.8
- Documentacion del metodo oQ: https://github.com/jundot/omlx/blob/main/docs/oQ_Quantization.md
- Paper de SqueezeLLM: https://arxiv.org/abs/2306.07629
- Documentacion de imatrix en LLM Compressor (vLLM): https://docs.vllm.ai/projects/llm-compressor/en/latest/examples/imatrix/
- Ficha en AIAny: https://aiany.app/item/qwen3-8-9b-distill
- Ficha en LLM Explorer: https://llm-explorer.com/model/empero-ai%2FQwen3.8-9B-Distill,29cLTTRCa7fKBTVEjWwzUc
- Canal de YouTube del autor: https://www.youtube.com/@RolanDorisTech
