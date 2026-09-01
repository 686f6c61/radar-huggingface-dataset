# mrutkows/granite-4.2-8b-bf16-mlx

## Resumen

El repositorio `mrutkows/granite-4.2-8b-bf16-mlx` contiene una conversión del modelo base `ibm-granite/granite-4.2-8b` al formato MLX, realizada por el usuario mrutkows para permitir inferencia nativa en hardware Apple Silicon (chips de la serie M). Granite 4.2 es una familia de modelos de lenguaje de IBM con arquitectura densa decoder-only, publicada bajo licencia Apache 2.0, que incorpora capacidades de razonamiento nativo (thinking mode), soporte multilingüe, generación de código, uso de herramientas (tool calling), salida JSON estructurada y recuperación aumentada (RAG). Esta variante concreta es la de precisión BFloat16, que ofrece la máxima calidad de salida a costa de un mayor consumo de memoria unificada (se recomiendan al menos 16 GB). El modelo está pensado para desarrolladores e investigadores que trabajan en ecosistemas Apple y necesitan ejecutar un LLM de 8.000 millones de parámetros de forma local, sin depender de GPUs NVIDIA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only |
| Parametros totales | 8.000 millones (8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (precisión completa), q8 (8 bits, group-size 64), q4 (4 bits, group-size 64) |
| Idiomas soportados | Multilingüe (idiomas específicos no listados en la documentación disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

Granite 4.2 emplea una arquitectura de transformer denso decoder-only, sin mezcla de expertos (MoE). El modelo base fue entrenado por IBM con un proceso de curado de datos y entrenamiento diseñado específicamente para escenarios empresariales, que incluye evaluaciones de gobernanza, riesgo y cumplimiento (GRC) además de los procedimientos estándar de limpieza de documentos y control de calidad de IBM. No se han proporcionado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. La innovación técnica más destacable es el modo de razonamiento nativo (thinking mode), que permite al modelo generar una cadena de pensamiento interna antes de producir la respuesta final, controlable mediante los parámetros `enable_thinking` y `reasoning_effort` en la plantilla de chat. Esta variante MLX no introduce cambios arquitectónicos respecto al modelo base; únicamente adapta los pesos al formato de MLX para su ejecución en Apple Silicon.

## Capacidades

- Generación de texto en lenguaje natural con soporte multilingüe.
- Razonamiento paso a paso mediante thinking mode integrado, activable o desactivable según necesidad.
- Generación de código en múltiples lenguajes de programación.
- Uso de herramientas (tool calling / function calling) para integración con APIs y agentes.
- Salida JSON estructurada, útil para aplicaciones que requieren respuestas formateadas.
- Soporte de recuperación aumentada (RAG) para incorporar conocimiento externo en las respuestas.
- No incluye capacidades de visión ni audio; es exclusivamente un modelo de texto.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con razonamiento interno, lo que permite resolver consultas complejas de soporte técnico o comercial manteniendo coherencia en el diálogo.
- Generación de código en producción: gracias al soporte de tool calling y salida JSON, puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests unitarios o documentar APIs.
- Agentes autónomos: el thinking mode y la capacidad de invocar herramientas permiten construir agentes que planifican y ejecutan tareas multi-paso, como consultas a bases de datos o llamadas a servicios web.
- Análisis de datos y generación de informes: el modelo puede resumir grandes volúmenes de texto, extraer métricas clave y producir informes estructurados en JSON para su posterior procesamiento.
- Asistente de documentación técnica: genera explicaciones, tutoriales y respuestas a preguntas frecuentes sobre productos de software, aprovechando su capacidad multilingüe para audiencias internacionales.
- Prototipado rápido de aplicaciones de lenguaje: al ejecutarse localmente en Mac, permite iterar sobre prompts y flujos de razonamiento sin coste de API ni dependencia de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas como MMLU, HumanEval o GSM8K, y la documentación de IBM consultada tampoco proporciona cifras concretas para esta variante. Se recomienda consultar la ficha del modelo base en Hugging Face para obtener datos de rendimiento si están disponibles.

## Requisitos de hardware

- La variante bf16 requiere al menos 16 GB de memoria unificada en Apple Silicon; el tamaño del repositorio es de 17,6 GB, por lo que se necesita espacio de almacenamiento suficiente.
- La variante q8 reduce el consumo de memoria aproximadamente un 50 % respecto a bf16, siendo adecuada para equipos con 8-12 GB de memoria unificada.
- La variante q4 es la más eficiente y puede ejecutarse en equipos con 8 GB de memoria unificada, como los Mac con chip M1 o M2 de gama básica.
- GPUs recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4 o posterior). No es compatible con GPUs NVIDIA ni CUDA.
- Opciones de despliegue: el paquete `mlx-lm` permite inferencia y fine-tuning; también se puede ejecutar de forma efímera con `uvx --with "mlx[cpu]" mlx_lm.generate`.
- Latencia y throughput: no se han proporcionado datos medidos en la documentación disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mrutkows/granite-4.2-8b-bf16-mlx (este) | 8B | No disponible | Apache 2.0 | MLX | Variante para Apple Silicon, con thinking mode |
| ibm-granite/granite-4.2-8b (base) | 8B | No disponible | Apache 2.0 | safetensors (original) | Modelo original de IBM, sin conversión MLX |
| mrutkows/granite-4.1-8b-GGUF | 8B | No disponible | Apache 2.0 | GGUF | Generación anterior (4.1), formato GGUF para llama.cpp |

La comparativa se limita a variantes del mismo modelo base y a la generación anterior, ya que no se dispone de datos de rendimiento para establecer comparaciones con otros modelos de 8B como Llama 3.1 o Qwen 2.5. La principal diferencia entre las variantes MLX es la cuantización, que afecta al consumo de memoria y a la calidad de salida.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la información disponible, pero al ser un modelo entrenado con datos web y corporativos, puede reflejar sesgos presentes en esos datos.
- Riesgo de alucinación inherente a todos los modelos de lenguaje; se recomienda verificar las respuestas en aplicaciones críticas.
- La longitud de contexto no está especificada en la documentación consultada, por lo que se desconoce el límite máximo de tokens de entrada.
- El modelo solo puede ejecutarse en hardware Apple Silicon; no es compatible con entornos CUDA ni con GPUs de otros fabricantes.
- Aunque la licencia Apache 2.0 permite uso comercial, la variante MLX es una conversión no oficial realizada por un tercero; se recomienda revisar la documentación del modelo base para confirmar cualquier restricción adicional.
- Para obtener resultados óptimos, es necesario pasar explícitamente los parámetros de generación recomendados (temperatura 0.7, top-p 0.9), ya que `mlx-lm` no los lee del archivo de configuración.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrutkows/granite-4.2-8b-bf16-mlx
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- Documentación de IBM sobre Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Repositorio GitHub de los modelos Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Documentación de mlx-lm: https://github.com/ml-explore/mlx-examples/tree/main/llms
- Variante GGUF de Granite 4.1 (mismo autor): https://huggingface.co/mrutkows/granite-4.1-8b-GGUF
