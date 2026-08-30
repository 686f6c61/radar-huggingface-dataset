# oakmindai/GLM-5.3-NVFP4-FTW

## Resumen

GLM-5.3-NVFP4-FTW es un checkpoint de conversión del modelo GLM-5.3, desarrollado originalmente por Z.AI, preparado específicamente para ejecutarse en una NVIDIA DGX Spark con su superchip Grace Blackwell GB10. El trabajo de conversión lo ha realizado OakMind AI sobre el checkpoint cuantizado NVFP4 publicado por Inferact, que a su vez usó NVIDIA Model Optimizer. El resultado es un formato de ejecución FTW (de SparkLab) que permite cargar el modelo completo en los 128 GB de memoria unificada de la DGX Spark, utilizando una combinación de cuantización NVFP4 para los expertos enrutados y FP8 W8A16 para las proyecciones densas.

Este modelo no introduce ninguna novedad arquitectónica ni entrenamiento adicional: es una adaptación de formato y de ejecución. Su relevancia radica en que demuestra la viabilidad de ejecutar un modelo de la escala de GLM-5.3 en hardware de escritorio de gama alta, aunque con un rendimiento de decodificación muy limitado (0.813 tokens por segundo medido en la validación). La licencia es la personalizada de Z.AI, no MIT a pesar de lo que afirma alguna fuente externa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con expertos enrutados (detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base GLM-5.3 soporta 1M tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados), FP8 W8A16 (proyecciones densas, attention y output) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia personalizada de Z.AI; algunas fuentes indican MIT, pero la model card de HuggingFace especifica "other") |
| Formato de pesos | FTW (formato de ejecución de SparkLab), 77 shards, payload de 428,713,099,264 bytes |

## Arquitectura y entrenamiento

GLM-5.3 es un modelo de arquitectura MoE (mixture of experts) desarrollado por Z.AI, con un contexto nativo de 1M tokens y orientado a tareas de codificación y razonamiento de largo horizonte. El checkpoint aquí presentado no supone ningún cambio arquitectónico: es una conversión del checkpoint NVFP4 de Inferact al formato FTW de SparkLab. No se realizó ningún entrenamiento ni fine-tuning durante el proceso.

La conversión mantiene los expertos enrutados en su representación NVFP4 original, dispuestos como bancos de expertos direccionables de forma independiente. Las proyecciones grandes de atención, densas y de salida, que originalmente estaban en BF16, se convierten a una representación FP8 W8A16 por fila para reducir el uso de memoria. El runtime SparkLab gestiona la ejecución con respaldo en disco (NVMe) para los expertos MoE, utilizando una caché LRU por capas. El manifiesto del payload tiene una huella `a0e799b03bceb4bf` y el checkpoint fuente se referencia con el commit `ce67b36f3669192b5bb233819f0fda6c8a9837f8` del repositorio de Inferact.

## Capacidades

- Generación de texto: entrada y salida de texto únicamente, validado para ese alcance en la DGX Spark.
- Razonamiento y codificación: al ser el modelo GLM-5.3, hereda las capacidades de codificación y razonamiento de largo horizonte del modelo base, aunque no se han realizado pruebas de calidad en esta conversión.
- Soporte de tool calling / function calling: no confirmado para este checkpoint.
- Soporte de agentes y multi-step reasoning: no confirmado para este checkpoint.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: sin visión ni otras modalidades; la model card indica explícitamente que visión y otras modalidades quedan fuera del alcance validado.

## Casos de uso

- Evaluación local de GLM-5.3 en hardware DGX Spark: permite a investigadores y desarrolladores probar el modelo completo en un equipo de escritorio de gama alta sin necesidad de infraestructura en la nube, gracias al empaquetado FTW y al runtime SparkLab.
- Prototipado de aplicaciones de generación de texto con contexto largo: el modelo base soporta 1M tokens de contexto, lo que lo hace adecuado para tareas de análisis de documentos extensos o conversaciones de larga duración, aunque el bajo throughput limita su uso interactivo.
- Investigación en cuantización y formatos de ejecución: este checkpoint sirve como referencia para estudiar el impacto de NVFP4 y FP8 W8A16 en el rendimiento y la calidad de un modelo MoE grande.
- Desarrollo de pipelines de inferencia con OpenAI-compatible API: SparkLab ofrece un servidor compatible con la API de OpenAI, lo que facilita la integración en aplicaciones existentes mediante `curl` o clientes estándar.
- Pruebas de concepto de despliegue en memoria unificada: el caso de uso demuestra cómo un modelo de ~400 GB puede ejecutarse en 128 GB de memoria unificada usando cuantización agresiva y offloading a disco.
- Benchmarking de hardware: el modelo se puede usar para medir las capacidades reales de la DGX Spark en términos de throughput, latencia y gestión de memoria en cargas de trabajo de MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint específico en la información disponible. La model card solo incluye métricas de rendimiento de hardware medidas en una DGX Spark:

| Metrica | Valor |
|---|---|
| Decode throughput | 0.813 tok/s |
| Warm TTFT | 2.530 s |
| OOM events | 0 |
| Swap-out growth | 0 |

Estas métricas se obtuvieron con un prompt de 54 tokens y un límite de 256 tokens de salida. No constituyen una certificación de calidad, contexto, concurrencia ni producción. No hay datos comparativos con otros modelos.

## Requisitos de hardware

- Hardware validado: NVIDIA DGX Spark con superchip Grace Blackwell GB10 y 128 GB de memoria unificada.
- VRAM estimada: no aplicable directamente, ya que el modelo se ejecuta en memoria unificada del SoC; el payload completo ocupa ~428 GB en disco, pero la ejecución utiliza cuantización y offloading a NVMe para caber en los 128 GB.
- GPU recomendadas: solo se ha validado la DGX Spark; no se proporcionan recomendaciones para otras GPU.
- En consumer GPU: no, el modelo está diseñado específicamente para la DGX Spark y su arquitectura de memoria unificada.
- Opciones de despliegue: SparkLab (repositorio GitHub) con servidor OpenAI-compatible; el comando `sparklab serve` incluye parámetros específicos como `--moe-backend offload`, `--moe-storage disk`, `--nvfp4-backend flashinfer` y `--moe-cache-size 675`.
- Latencia y throughput: decode throughput de 0.813 tok/s y warm TTFT de 2.530 s en la configuración medida; el throughput es muy bajo para uso interactivo.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos. Se pueden indicar diferencias de formato y requisitos:

| Modelo | Formato | Hardware objetivo | Cuantizacion | Licencia |
|---|---|---|---|---|
| oakmindai/GLM-5.3-NVFP4-FTW | FTW (SparkLab) | DGX Spark (128 GB unificados) | NVFP4 + FP8 W8A16 | other (Z.AI) |
| Inferact/GLM-5.3-NVFP4 | safetensors (original) | GPU con suficiente VRAM | NVFP4 | other (Z.AI) |
| zai-org/GLM-5.3-BF16 | safetensors (original) | GPU con suficiente VRAM | BF16 | other (Z.AI) |

El checkpoint FTW es una conversión del NVFP4 de Inferact, por lo que no hay diferencias de calidad entre ambos; la diferencia está en el formato de ejecución y el hardware objetivo.

## Limitaciones y advertencias

- Rendimiento de decodificación muy bajo (0.813 tok/s), no apto para aplicaciones interactivas en tiempo real ni para producción con alta concurrencia.
- Solo se ha validado entrada y salida de texto; visión y otras modalidades quedan explícitamente fuera del alcance.
- La licencia es "other" (personalizada de Z.AI), no MIT; hay que revisar los términos completos en la model card del modelo base antes de cualquier uso comercial.
- No se han realizado pruebas de calidad, contexto completo, concurrencia ni resistencia en este checkpoint; los resultados de rendimiento son acotados y no constituyen certificación.
- El modelo requiere el runtime SparkLab y hardware DGX Spark específico; no se puede ejecutar con herramientas estándar como vLLM, llama.cpp u Ollama sin adaptación.
- El payload es muy grande (~428 GB) y requiere almacenamiento NVMe de alta velocidad para el offloading de expertos.
- No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, etc.) para esta conversión concreta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oakmindai/GLM-5.3-NVFP4-FTW
- Modelo base (Z.AI): https://huggingface.co/zai-org/GLM-5.3-BF16
- Checkpoint NVFP4 fuente (Inferact): https://huggingface.co/Inferact/GLM-5.3-NVFP4
- Repositorio de SparkLab: https://github.com/sixteen-miles-labs/sparklab
- Herramienta de cuantización (NVIDIA Model Optimizer): https://github.com/NVIDIA/Model-Optimizer
- Investigación de FreeToken (ancestría): https://github.com/FlashML-org/FreeToken
- Repositorio de GLM-5 (Z.AI): https://github.com/zai-org/GLM-5
