# amd/Qwen3.6-35B-A3B_rai_1.9.0_m_1.0.1_npu

## Resumen

Este repositorio contiene una versión cuantizada en formato ONNX del modelo Qwen3.6-35B-A3B, preparada específicamente para su ejecución en NPUs (Unidades de Procesamiento Neuronal) de AMD mediante Ryzen AI Software. El modelo base es un MoE (mixture of experts) de la familia Qwen de Alibaba, con 35 mil millones de parámetros totales de los cuales aproximadamente 3 mil millones se activan por token, lo que permite combinar la capacidad de un modelo grande con la latencia de uno pequeño.

La relevancia de esta ficha radica en el despliegue local: AMD publica estos artefactos optimizados para que los desarrolladores con portátiles o equipos equipados con NPUs Ryzen AI (serie Ryzen 8040/8050 y posteriores) puedan ejecutar modelos de gran tamaño sin depender de GPUs dedicadas ni de servicios en la nube. El repositorio está restringido (gated), por lo que es necesario aceptar las condiciones de uso en HuggingFace antes de descargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) |
| Parametros totales | 35B (aproximado, segun denominacion del modelo) |
| Parametros activos | 3B (aproximado, segun denominacion A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato ONNX optimizado para NPU) |
| Idiomas soportados | Ingles (según metadatos del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (optimizado para Ryzen AI NPU) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen3.5 MoE, una arquitectura transformer con enrutado de expertos (mixture of experts) en la que solo una fraccion de los parametros se activa en cada pasada hacia adelante. En el caso de la variante 35B-A3B, se activan alrededor de 3 mil millones de parametros por token, lo que reduce drasticamente el coste computacional de la inferencia manteniendo la capacidad de conocimiento del modelo completo.

Los detalles sobre el preentrenamiento (numero de tokens, composicion del corpus, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada. Cabe destacar que este repositorio no contiene los pesos originales en safetensors, sino una conversion a ONNX realizada por AMD, con las optimizaciones necesarias para el flujo de ejecucion de Ryzen AI Software (versiones indicadas en el nombre: rai 1.9.0, m 1.0.1, npu). Esto implica que el modelo esta pensado para ejecutarse sobre la pila de software de AMD y no de forma generica con cualquier runtime ONNX.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational)
- Razonamiento general y generacion de codigo heredadas del modelo base Qwen3.6 (según capacidades de la familia, no verificadas para esta conversion)
- Ejecucion local en NPU de AMD Ryzen AI, sin necesidad de GPU dedicada ni conexion a servicios remotos
- Integracion con la pila Ryzen AI Software para inferencia en dispositivos de consumo
- No hay evidencia en los metadatos de soporte de vision, audio ni tool calling para esta conversion especifica

## Casos de uso

- Asistentes conversacionales locales: al ser un modelo conversacional con activacion de 3B parametros, es adecuado para chatbots que se ejecutan completamente en el dispositivo, garantizando privacidad de los datos del usuario.
- Prototipado en portatiles con NPU: los desarrolladores con hardware Ryzen AI pueden probar un modelo de 35B parametros sin alquilar GPUs en la nube, acelerando el ciclo de experimentacion.
- Procesamiento de documentos sensible: empresas que no pueden enviar texto a APIs externas pueden usar este modelo en equipos corporativos con NPUs para resumir y clasificar documentos internos.
- Generacion de codigo asistida offline: el modelo base de la familia Qwen destaca en codigo; esta version permite asistentes de completado que funcionan sin conexion.
- Aplicaciones edge con coste energetico reducido: la NPU consume menos potencia que una GPU discreta, lo que lo hace util para despliegues en equipos con batería.
- Validacion de pipelines de inferencia ONNX: util como modelo de referencia para probar integraciones con la pila Ryzen AI antes de convertir modelos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para evaluar el rendimiento del modelo base, se recomienda consultar la ficha del modelo original de la familia Qwen3.6 en HuggingFace.

## Requisitos de hardware

- El repositorio pesa 22,1 GB, por lo que se necesita al menos esa capacidad de almacenamiento y memoria suficiente para alojar el modelo (se recomienda 32 GB de RAM del sistema, dado que las NPUs acceden a memoria compartida).
- Hardware objetivo: procesadores AMD Ryzen con NPU (series Ryzen AI, como Ryzen 8040/8050 o posteriores).
- No requiere GPU dedicada para el flujo NPU, aunque Ryzen AI Software tambien soporta ejecucion hibrida o en iGPU.
- Software necesario: Ryzen AI Software (version 1.9.0 segun el nombre del repo) y el runtime ONNX correspondiente.
- No es compatible directamente con llama.cpp, Ollama, vLLM o TGI al tratarse de pesos ONNX optimizados para la pila de AMD.
- No disponible: mediciones concretas de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Formato | Licencia | Objetivo |
|---|---|---|---|---|---|
| amd/Qwen3.6-35B-A3B_rai_1.9.0_m_1.0.1_npu | 35B | 3B | ONNX (NPU) | Apache 2.0 | NPU AMD Ryzen AI |
| Modelos base Qwen3.6 MoE (safetensors) | 35B | 3B | Safetensors | Apache 2.0 | GPU/servidor, uso general |
| Otras conversiones ONNX para Ryzen AI publicadas por AMD | no disponible | no disponible | ONNX (NPU) | varia segun modelo | NPU AMD Ryzen AI |

La diferencia clave frente al modelo base es el formato y el objetivo de despliegue: esta version esta dirigida exclusivamente a NPUs de AMD, mientras que los pesos originales admiten cualquier framework de inferencia moderno.

## Limitaciones y advertencias

- Acceso restringido (gated): hay que aceptar las condiciones en HuggingFace y estar autenticado para descargar los pesos.
- Los metadatos indican soporte de ingles; el rendimiento en castellano no esta garantizado ni documentado para esta conversion.
- La longitud de contexto no esta documentada en el repositorio; debe verificarse en la ficha del modelo base antes de planificar aplicaciones con documentos largos.
- La conversion a ONNX puede introducir diferencias de calidad respecto a los pesos originales en safetensors; AMD no publica evaluaciones comparativas en la informacion disponible.
- Dependencia de la pila Ryzen AI Software: la version del software (1.9.0) debe coincidir con la esperada por el artefacto, lo que limita la portabilidad.
- Al tratarse de un modelo de lenguaje generativo, conserva los riesgos genericos de alucinacion y sesgos heredados del entrenamiento del modelo base Qwen.
- La licencia Apache 2.0 permite uso comercial, pero deben respetarse los terminos de uso del modelo base Qwen y las condiciones de acceso del repositorio gated.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/amd/Qwen3.6-35B-A3B_rai_1.9.0_m_1.0.1_npu
- Documentacion de Ryzen AI Software (AMD): no disponible en la informacion proporcionada
- Ficha del modelo base Qwen3.6: no disponible en la informacion proporcionada
