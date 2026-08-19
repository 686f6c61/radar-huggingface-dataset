# Lynxpda/DeepSeek-V4-Flash-0731-DSpark-Drafter-Q2_K_S-GGUF

## Resumen

DeepSeek-V4-Flash-0731 DSpark Drafter Q2_K_S es un modelo de borrador (draft model) diseñado específicamente para decodificación especulativa junto al modelo principal DeepSeek-V4-Flash-0731. Ha sido cuantizado a Q2_K_S mediante llama.cpp con overrides de tipos de tensor para minimizar la pérdida de calidad, reduciendo el tamaño del archivo de 10,79 GB (BF16) a 6,60 GB, un 39 % más pequeño. El autor reporta una caída de aceptación de solo el 0,46 % y una mejora de velocidad del 7,0 % en hardware AMD Strix Halo.

Este modelo resulta relevante porque permite acelerar la inferencia de modelos MoE de gran tamaño en hardware de gama media o con memoria limitada, sin necesidad de mantener el modelo completo en BF16. Está pensado para desarrolladores que despliegan DeepSeek-V4-Flash-0731 en entornos con restricciones de VRAM o que buscan reducir la latencia en aplicaciones de generación de código y texto en inglés. La licencia MIT facilita su integración en proyectos comerciales y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (inferida de la estructura de pesos; sin especificacion oficial) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K_S (con overrides mixtos: Q2_K, Q5_K, Q6_K, Q8_0, F16, F32) |
| Idiomas soportados | en, code |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un drafter optimizado para decodificacion especulativa, derivado del modelo base DeepSeek-V4-Flash-0731. Aunque no se detalla la arquitectura interna, la estructura de pesos indica que se trata de un modelo de mezcla de expertos (MoE), con pesos de expertos (gate, up, down) que representan el 92 % del modelo y que han sido cuantizados a Q2_K. Los componentes criticos como el router MoE, los pesos markov y las conexiones hiper se mantienen en F16 o Q8_0, mientras que normas, sinks y biases se conservan en F32 para preservar la estabilidad numerica.

La cuantizacion se realizo con la herramienta `llama-quantize` de llama.cpp upstream, utilizando la opcion `--allow-requantize` y overrides personalizados por tipo de tensor. No se proporcionan datos sobre el entrenamiento original del modelo base, como el numero de tokens o la composicion del dataset. El drafter no ha sido entrenado de forma independiente; su funcion es generar tokens candidatos que el modelo principal verifica, acelerando asi la generacion autoregresiva.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa con DeepSeek-V4-Flash-0731.
- Compatibilidad con el modelo principal a traves del formato GGUF y la integracion con llama.cpp.
- Optimizacion para tareas de codigo y texto en ingles, segun los idiomas declarados.
- Preservacion de pesos criticos (router, normas, biases) mediante cuantizacion mixta para minimizar la degradacion.
- Reduccion del uso de memoria en comparacion con el modelo BF16 original, manteniendo una tasa de aceptacion cercana al 66 %.
- Integracion con el fork strix-halo-llamacpp, que incluye Flash Attention y correcciones de prefill MoE para AMD Strix Halo (gfx1151).

## Casos de uso

- Despliegue de DeepSeek-V4-Flash-0731 en servidores con GPUs de gama media: al reducir el tamano del drafter a 6,60 GB, se libera VRAM para el modelo principal y se permite ejecutar el conjunto en hardware con 16 GB o menos de memoria.
- Reduccion de latencia en aplicaciones de chat en tiempo real: la decodificacion especulativa con este drafter puede aumentar el throughput de tokens por segundo, como se observa en los 28,32 tok/s medidos en AMD Strix Halo.
- Optimizacion de costes en entornos cloud: al usar un drafter cuantizado, se reduce el coste de inferencia por peticion sin sacrificar significativamente la calidad de la generacion.
- Generacion de codigo en pipelines de CI/CD: el modelo puede integrarse en herramientas de autocompletado o revision de codigo, aprovechando su soporte para el idioma "code".
- Investigacion en decodificacion especulativa: sirve como referencia para estudiar el impacto de la cuantizacion agresiva en la tasa de aceptacion y la velocidad de generacion.
- Ejecucion en dispositivos edge con aceleradores Vulkan/HIP: gracias al fork strix-halo-llamacpp, puede desplegarse en APUs como AMD Strix Halo sin necesidad de una GPU dedicada de alta gama.

## Benchmarks y rendimiento

El autor proporciona mediciones propias en AMD Strix Halo (gfx1151) para una tarea de generacion de codigo JavaScript, promedio de dos ejecuciones:

| Modelo | Tamano | Aceptacion | Velocidad | Longitud de borrador |
|---|---|---|---|---|
| BF16 (original) | 10,79 GB | 66,53 % | 26,46 tok/s | 3,00 |
| Q2_K_S (este modelo) | 6,60 GB | 66,07 % | 28,32 tok/s | 2,99 |

Resultados reportados: 39 % mas pequeno, 0,46 % de caida en aceptacion y 7,0 % mas rapido. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Tamano del archivo: 6,60 GB en Q2_K_S, lo que requiere al menos 8 GB de VRAM para cargar el modelo, aunque se recomienda 12 GB o mas para dejar margen al contexto y a los estados de inferencia.
- Probado en AMD Strix Halo (gfx1151) con el fork strix-halo-llamacpp, que incluye Flash Attention, correcciones de prefill MoE y drivers Mesa (Vulkan + HIP) empaquetados.
- Compatible con GPUs consumer de gama media como RTX 4060/4070 o equivalentes con 8-12 GB de VRAM, aunque no se han publicado mediciones en esas plataformas.
- Opciones de despliegue: llama.cpp upstream, el fork strix-halo-llamacpp, y cualquier framework que soporte GGUF (Ollama, LM Studio, etc.).
- Latencia y throughput: 28,32 tok/s medidos en AMD Strix Halo con la tarea de codigo JavaScript; los valores variaran segun el hardware y la configuracion.

## Comparativa con modelos similares

La comparativa se limita al mismo modelo en su version BF16, ya que no se dispone de otros drafters comparables en la informacion proporcionada.

| Modelo | Tamano | Cuantizacion | Aceptacion | Velocidad | Licencia |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 DSpark Drafter BF16 | 10,79 GB | BF16 | 66,53 % | 26,46 tok/s | MIT |
| DeepSeek-V4-Flash-0731 DSpark Drafter Q2_K_S | 6,60 GB | Q2_K_S | 66,07 % | 28,32 tok/s | MIT |

La version Q2_K_S ofrece un 39 % menos de tamano y un 7 % mas de velocidad con una perdida minima de aceptacion, lo que la hace preferible en entornos con restricciones de memoria.

## Limitaciones y advertencias

- Es un modelo de borrador, no apto para generacion autonoma; requiere el modelo principal DeepSeek-V4-Flash-0731 para funcionar.
- La cuantizacion Q2_K es agresiva y puede degradar la calidad en tareas fuera de las probadas (solo se ha validado generacion de codigo JavaScript).
- Solo soporta ingles y codigo; no se garantiza un rendimiento adecuado en otros idiomas.
- La tasa de aceptacion del 66 % implica que aproximadamente un tercio de los tokens generados por el drafter son rechazados, lo que puede anadir sobrecarga en algunos escenarios.
- No se han publicado datos sobre sesgos, alucinaciones o comportamiento en contextos largos.
- El pipeline de inferencia no esta documentado; la integracion requiere conocimientos de llama.cpp y decodificacion especulativa.
- La licencia MIT permite uso comercial, pero el modelo base DeepSeek-V4-Flash-0731 puede tener sus propias restricciones; se recomienda verificar su licencia.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Lynxpda/DeepSeek-V4-Flash-0731-DSpark-Drafter-Q2_K_S-GGUF)
- [Modelo base DeepSeek-V4-Flash-0731](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731)
- [GGUF BF16 de unsloth](https://huggingface.co/unsloth/DeepSeek-V4-Flash-0731-GGUF)
- [Fork strix-halo-llamacpp](https://github.com/Nathanw1014/strix-halo-llamacpp)
- [llama.cpp upstream](https://github.com/ggml-org/llama.cpp)
