# SirSahOl/K2-Horizon-7B-chat-mlx-8bit

## Resumen

K2-Horizon-7B-chat-mlx-8bit es una conversión cuantizada en 8 bits del modelo IFM/K2-Horizon-7B, realizada por SirSahOl y optimizada para ejecución nativa en Apple Silicon mediante el framework MLX de Apple. El modelo original es un modelo de lenguaje denso que se denomina de 7 mil millones de parámetros, aunque el archivo safetensors de esta conversión contiene 8.999.178.240 parámetros (aproximadamente 9 mil millones). Dispone de una ventana de contexto de 524.288 tokens, lo que lo hace adecuado para procesar documentos largos y conversaciones extensas.

Esta variante 8-bit ofrece un equilibrio entre precisión y consumo de memoria, con un footprint de VRAM activo de aproximadamente 7,8 GB, lo que permite ejecutarlo en Macs con 16 GB de memoria unificada. Está pensado para tareas de chat, instrucción, razonamiento y generación de código, y se distribuye bajo licencia Apache 2.0. Su relevancia radica en que permite ejecutar un modelo de gran contexto en hardware de consumo sin necesidad de servicios en la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | K2HorizonForCausalLM |
| Parametros totales | 8.999.178.240 (aprox. 9 mil millones; el modelo base se denomina 7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens |
| Tipos de cuantizacion | 8-bit (media de 8,25 bits por peso); existen variantes 4-bit y 16-bit en otros repos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura densa denominada K2HorizonForCausalLM, de la que no se detalla si se basa en un transformer estándar o en alguna variante. Según la model card, el modelo fue entrenado con dos conjuntos de datos propios de IFM: IFM/K2-Horizon-Pretrain-Data para el preentrenamiento e IFM/K2-Horizon-Midtrain-Data para el entrenamiento intermedio. No se proporciona información sobre el número de tokens, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

La conversión a MLX 8-bit se realizó con una media de 8,25 bits por peso, lo que reduce el tamaño del modelo a unos 9,6 GB en disco y un footprint de memoria activa de unos 7,8 GB. Esta cuantización es una de las tres variantes ofrecidas por el autor, junto a una versión 4-bit y otra 16-bit.

## Capacidades

- Generación de texto conversacional con plantilla de chat (ChatML), tal y como se muestra en el ejemplo de uso de la model card.
- Razonamiento estructurado, matemáticas y código, según las afirmaciones del autor en las tablas de rendimiento. No hay benchmarks públicos que verifiquen estas capacidades.
- Soporte de instrucciones ("instruction following") y razonamiento multi-paso, según el README.
- Ejecución nativa en Apple Silicon mediante MLX, con soporte de la librería mlx-lm.
- Sin soporte de vision ni audio documentado.
- No se especifican idiomas soportados; la etiqueta "en" sugiere inglés, pero no hay confirmación.

## Casos de uso

- Asistente de chat local en Macs con Apple Silicon: gracias a los ~7,8 GB de footprint, puede ejecutarse en un Mac de 16 GB con memoria unificada, permitiendo conversaciones multi-turno sin necesidad de servidores externos.
- Generación de código asistida: el autor afirma capacidades de "code", por lo que podría usarse para autocompletar o revisar fragmentos de código en entornos locales.
- Análisis de datos y razonamiento estructurado: con una ventana de 524.288 tokens, podría procesar documentos largos y realizar tareas de extracción o análisis.
- Prototipado de agentes conversacionales: el soporte de plantilla ChatML y la posibilidad de ejecutar múltiples instancias (según las tablas de rendimiento) permiten experimentar con flujos de agente.
- Desarrollo de herramientas de escritura: generación de textos, resúmenes o reescritura de contenido con un modelo local y sin dependencia de la nube.
- Evaluación de modelos cuantizados: al existir variantes 4-bit, 8-bit y 16-bit, permite comparar el efecto de la cuantización en la calidad de salida en un mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona únicamente estimaciones de rendimiento de inferencia en hardware Apple Silicon, que se recogen en la sección de requisitos de hardware.

## Requisitos de hardware

- VRAM activa estimada: ~7,8 GB para la variante 8-bit.
- Memoria unificada mínima recomendada: 16 GB.
- Velocidades estimadas por el autor (según tier de Apple Silicon):
  - M1/M2/M3/M4 base: ~22 tokens/s, TTFT ~160 ms.
  - M1/M2/M3/M4 Pro: ~34 tokens/s, TTFT ~110 ms.
  - M1/M2/M3/M4 Max: ~48 tokens/s, TTFT ~70 ms.
  - M1/M2/M3 Ultra: ~72 tokens/s, TTFT ~45 ms.
- Despliegue: recomendado mediante mlx-lm (CLI o Python API). También se menciona LM Studio en la guía de configuración, con stop strings personalizadas.
- No se mencionan opciones para vLLM, llama.cpp, TGI ni otros runtimes.

## Comparativa con modelos similares

No se han encontrado datos comparativos con modelos de la misma categoría en la información proporcionada. La única comparación disponible es entre las variantes de cuantización del propio modelo (4-bit, 8-bit y 16-bit), que difieren en tamaño, footprint y precisión.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados.
- Riesgo de alucinación: no especificado; al ser un modelo conversacional, se recomienda supervisión en producción.
- Idiomas soportados: no se especifican en la model card; el uso con idiomas distintos al inglés no está validado.
- Discrepancia de parámetros: la model card lo denomina "7B", pero el archivo safetensors contiene 8.999.178.240 parámetros. Esta diferencia puede deberse a una designación comercial o a la inclusión de pesos adicionales.
- Al ser una conversión no oficial de un tercero (SirSahOl), no hay garantía de que la cuantización preserve la calidad del modelo original.
- El modelo requiere Apple Silicon para ejecutarse de forma nativa; no se proporciona soporte para GPUs NVIDIA ni otros backends.
- La licencia Apache 2.0 permite uso comercial, pero se debe respetar la atribución y la inclusión de la licencia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/SirSahOl/K2-Horizon-7B-chat-mlx-8bit
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Variante 4-bit: https://huggingface.co/SirSahOl/K2-Horizon-7B-chat-mlx-4bit
- Variante 16-bit: https://huggingface.co/SirSahOl/K2-Horizon-7B-chat-mlx-16bit
- Framework MLX: https://github.com/ml-explore/mlx
