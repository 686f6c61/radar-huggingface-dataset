# positron-ai/mistralai_Mixtral-8x7B-Instruct-v0.1-tron-best-gptq

## Resumen

Este repositorio contiene una versión cuantizada en 4 bits mediante GPTQ del modelo Mixtral-8x7B-Instruct-v0.1, publicada por Positron AI. El modelo original, desarrollado por Mistral AI, es un transformer de solo decodificador con arquitectura de mezcla de expertos (MoE) que combina 8 expertos por capa y activa 2 de ellos por token, sumando 46 700 millones de parámetros totales. La cuantización GPTQ reduce el tamaño del repositorio a 25,6 GB, lo que permite una inferencia más eficiente en términos de memoria y cómputo, manteniendo un rendimiento competitivo en tareas de generación de texto e instrucciones.

Esta versión está pensada para despliegues en producción donde el ahorro de memoria es crítico. Al ser un modelo Instruct, hereda la capacidad de seguir instrucciones del modelo base, que supera a Llama 2 70B en la mayoría de los benchmarks con una inferencia hasta seis veces más rápida. Sin embargo, no se proporcionan métricas completas de validación, como divergencia KL o perplejidad, y la licencia se indica como "other", lo que obliga a revisar los términos del modelo original antes de su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con 8 expertos por capa y 2 activos por token |
| Parametros totales | 46 702 792 704 (46,7 B) |
| Parametros activos | No disponible (8 expertos, 2 activos por token) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GPTQ de 4 bits, grupo de 64, activación simétrica, desc_act true |
| Idiomas soportados | No disponibles |
| Licencia | other (se aplica la licencia del modelo base) |
| Formato de pesos | safetensors (GPTQ) |

## Arquitectura y entrenamiento

El modelo base es Mixtral-8x7B-Instruct-v0.1, un transformer decoder-only con arquitectura MoE. En cada capa, un enrutador selecciona dos de los ocho expertos para procesar cada token y combina sus salidas, lo que reduce el coste computacional efectivo a pesar de los 46,7 B de parámetros. El proceso de cuantización GPTQ ha sido realizado por Positron AI con el conjunto de herramientas GPTQModel 5.8.0, transformers 4.57.6, torch 2.9.1 y CUDA 12.8. Se emplearon 128 muestras de calibración de dominios mixtos con una longitud de secuencia de 1024, y la cuantización es simétrica con desc_act activado. No se especifican detalles sobre el entrenamiento original, como el número de tokens o la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto en modo conversacional y de instrucciones, gracias a la variante Instruct del modelo base.
- Razonamiento de múltiples pasos y resolución de tareas complejas, con buen rendimiento en benchmarks de conocimiento general y razonamiento.
- Generación de código, dado que el modelo base muestra competencia en tareas de programación.
- Soporte multilingüe, aunque la model card no especifica los idiomas concretos.
- No se documentan capacidades adicionales como tool calling, visión o audio; el modelo se limita a texto.
- Compatible con el ecosistema de Hugging Face y con herramientas de inferencia como text-generation-inference y endpoints compatibles.

## Casos de uso

- Despliegue de asistentes conversacionales en entornos con recursos limitados: la cuantización 4 bits reduce la huella de memoria, permitiendo servir un modelo de 47 B en una sola GPU de gama alta con 32 GB de VRAM.
- Generación de código en entornos de integración continua (CI/CD): el modelo puede completar funciones o explicar fragmentos de código con baja latencia, aunque no se garantiza la corrección en todos los casos.
- Análisis de documentos y resumen automático: al ser un modelo instruct, puede procesar textos largos y extraer información relevante, siempre que la ventana de contexto sea suficiente (el valor no se ha especificado en esta ficha).
- Automatización de respuestas en atención al cliente: el modelo puede mantener conversaciones de varios turnos, aunque requiere supervisión para evitar respuestas inapropiadas.
- Prototipado rápido de aplicaciones de lenguaje natural en entornos de desarrollo, gracias a su compatibilidad con pipelines de Hugging Face.
- Inferencia en tiempo real en aplicaciones con baja latencia, aprovechando la arquitectura MoE que solo activa dos expertos por token.

## Benchmarks y rendimiento

La model card incluye un único dato de validación:

| Metric | Resultado | Referencia |
|---|---|---|
| MMLU (mean) | 0,8125 | source/mistralai--Mixtral-8x7B-Instruct-v0.1 |

El valor de MMLU se calculó con una cobertura del 10%. No se han publicado otros benchmarks (como HumanEval, GSM8K o perplejidad) en la información disponible. La divergencia KL y las métricas de acuerdo top-1 no se han medido para esta versión cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia en 4 bits: alrededor de 25,6 GB para los pesos, más overhead de activaciones y memoria del enrutador. Se recomienda una GPU con al menos 32 GB de VRAM.
- GPU recomendadas: NVIDIA A100 (40 GB), H100 (80 GB) o RTX A6000 (48 GB). En entornos con múltiples GPU, se puede utilizar vLLM o TGI para repartir el modelo.
- En GPU de consumo, una RTX 4090 (24 GB) no es suficiente para cargar los pesos completos sin offloading o cuantización adicional; se necesitaría una solución de memoria compartida o dividir el modelo entre varias GPU.
- Opciones de despliegue: vLLM, Hugging Face Text Generation Inference (TGI) y endpoints compatibles, según los tags del repositorio. No se proporciona soporte nativo para GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Formato |
|---|---|---|---|---|---|
| Mixtral-8x7B-Instruct-v0.1 (original) | 46,7 B | No disponible | No disponible | Apache 2.0 | safetensors (FP16) |
| Este modelo (GPTQ 4-bit) | 46,7 B | No disponible | 0,8125 (10% cobertura) | other | safetensors (GPTQ) |
| Llama 2 70B (referencia) | 70 B | No disponible | No disponible | Llama 2 | safetensors |

El modelo cuantizado mantiene el mismo número de parámetros que el original, pero reduce el peso en memoria. La licencia «other» puede ser más restrictiva que la del modelo base (Apache 2.0), aunque la model card indica que se aplican las restricciones del modelo original.

## Limitaciones y advertencias

- La cuantización GPTQ puede degradar el rendimiento en tareas de razonamiento complejo o generación de código, aunque el MMLU reportado es similar al del modelo base.
- El modelo original Mixtral-8x7B-Instruct no incluye mecanismos de moderación; puede generar contenido sesgado o inapropiado si se usa sin control.
- La licencia se indica como «other», lo que obliga a revisar la licencia del modelo base antes de un uso comercial o de redistribución.
- No se han medido métricas de divergencia KL ni perplejidad para esta versión, por lo que la calidad de la cuantización no está validada más allá del MMLU.
- No se especifica el contexto máximo, lo que puede limitar su uso en tareas que requieran ventanas largas.
- La latencia y el throughput no se han documentado, por lo que se recomienda realizar pruebas de rendimiento antes del despliegue.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/positron-ai/mistralai_Mixtral-8x7B-Instruct-v0.1-tron-best-gptq
- Modelo original de Mistral: https://huggingface.co/mistralai/Mixtral-8x7B-Instruct-v0.1
- Documentación oficial de Mixtral: https://docs.mistral.ai/models/mixtral-8x7b-0-1
- Catálogo de modelos de Microsoft Foundry: https://ai.azure.com/catalog/models/mistralai-Mixtral-8x7B-Instruct-v01
