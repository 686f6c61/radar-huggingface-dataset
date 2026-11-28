# Baidu-Baige/KODA-35B

## Resumen

KODA-35B es un modelo de generacion y optimizacion de kernels CUDA desarrollado por Baidu-Baige, obtenido por ajuste fino supervisado del modelo base Qwen3.6-35B-A3B. Con 35.107.181.936 parametros totales y aproximadamente 3B parametros activos por token (arquitectura Mixture of Experts), el modelo esta especializado en una tarea muy concreta: dada una implementacion de referencia, proponer un kernel CUDA equivalente y refinarlo de forma iterativa a partir de diagnosticos del compilador, tests de correccion, mediciones de tiempo de ejecucion y realimentacion de perfilado.

La relevancia del modelo reside en su enfoque de adaptacion de dominio sobre un LLM generalista. En lugar de entrenar desde cero, Baidu-Baige parte de Qwen3.6-35B-A3B y lo especializa mediante el framework de RL LoongSage y el agente KODA, que compila y evalua los candidatos en sandboxes gestionados y devuelve los resultados al modelo. Segun la model card, este ajuste mejora la correccion en 35,2 puntos porcentuales en KernelBench y 31,1 puntos en SOL-ExecBench respecto al modelo base.

El modelo se distribuye con licencia Apache 2.0, en formato safetensors y con la libreria transformers, y esta pensado para servirse con motores de inferencia compatibles (vLLM o SGLang) y conectarse via API al agente KODA. Su pipeline declarado es image-text-to-text, aunque la especializacion real es la generacion de codigo CUDA de bajo nivel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (qwen3_5_moe) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | Aproximadamente 3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

KODA-35B hereda la arquitectura del modelo base Qwen3.6-35B-A3B, un transformer con capas Mixture of Experts identificado en los tags de Hugging Face como `qwen3_5_moe`. El modelo activa aproximadamente 3B parametros por token sobre un total de 35,1B, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. El repositorio ocupa 70,2 GB e incluye pesos, tokenizer y configuracion en formato Hugging Face.

El entrenamiento consiste en un ajuste fino de dominio sobre Qwen3.6-35B-A3B. El proceso se apoya en el agente KODA, que compila y evalua cada kernel candidato en sandboxes gestionados y realimenta al modelo con diagnosticos del compilador, resultados de tests de correccion, mediciones de runtime y datos de perfilado, permitiendo una revision iterativa en varias rondas. El framework de RL empleado es LoongSage, tambien publicado por Baidu-Baige. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas adicionales como DPO o RLHF mas alla del bucle de realimentacion descrito.

## Capacidades

- Generacion de kernels CUDA a partir de una implementacion de referencia.
- Optimizacion iterativa de kernels usando diagnosticos del compilador, tests de correccion, mediciones de runtime y perfilado.
- Razonamiento multi-step orientado a la revision y mejora de codigo de bajo nivel.
- Capacidad de conversacion multi-turno para refinar propuestas a lo largo de rondas.
- Integracion con el agente KODA mediante API de modelo servido en vLLM o SGLang.
- Pipeline declarado image-text-to-text, aunque la especializacion documentada es la generacion de codigo CUDA.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio especificos: no disponibles en la informacion proporcionada.

## Casos de uso

- Optimizacion de kernels en produccion: dado un kernel de referencia lento, KODA-35B propone una version CUDA y la refina con mediciones de runtime hasta obtener aceleraciones significativas, como refleja su mediana de 3,15x en KernelBench.
- Integracion en pipelines de CI/CD de codigo GPU: el modelo puede generar y validar kernels candidatos dentro del agente KODA, que compila y ejecuta tests de correccion en sandboxes antes de aceptar cambios.
- Aceleracion de operadores en frameworks de deep learning: para operadores como atencion, normalizacion o convoluciones, el modelo genera alternativas CUDA evaluables contra la implementacion de referencia.
- Portabilidad de codigo a GPU: a partir de implementaciones en otros lenguajes o frameworks, KODA-35B propone equivalentes CUDA y los ajusta con realimentacion del compilador.
- Investigacion en sintesis de codigo de bajo nivel: el modelo sirve como banco de pruebas para estudiar adaptacion de dominio y RL aplicado a generacion de kernels.
- Asistencia a ingenieros de rendimiento: el modelo actua como asistente conversacional multi-turno que recibe resultados de perfilado y propone la siguiente revision del kernel.
- Evaluacion comparativa de modelos de codigo GPU: su rendimiento publicado en KernelBench y SOL-ExecBench permite usarlo como referencia en estudios de sintesis de kernels.

## Benchmarks y rendimiento

Resultados publicados en la model card. Mejores valores en negrita, incluyendo empates.

### KernelBench (270 problemas)

| Modelo | Correctness | Fast@1 | Fast@2 | Mediana de speedup |
| --- | ---: | ---: | ---: | ---: |
| KODA-35B | 95,6% | 88,9% | 61,9% | 3,15x |
| Qwen3.6-35B-A3B (base) | 60,4% | 24,1% | 10,7% | 0,94x |
| Qwen3.8-Flash-Next | 94,8% | 82,2% | 51,9% | 2,27x |
| DeepSeek-V4.1-Flash-1017 | 92,6% | 90,0% | 70,4% | 4,31x |
| DeepSeek-V4-Flash-0731 | 95,6% | 77,4% | 52,6% | 2,26x |
| GLM-5.3 | 94,1% | 84,4% | 62,6% | 2,97x |
| GLM-5.3-Flash | 95,6% | 80,0% | 48,1% | 2,02x |
| Kimi-K3 | 93,7% | 84,8% | 64,1% | 2,99x |
| MiMo-v2.6-Flash-MOPD | 89,6% | 71,1% | 39,6% | 1,72x |
| Recursive-Flint-40B | 68,9% | 18,1% | 9,3% | 0,48x |
| MusaCoder-27B | 73,0% | 26,7% | 14,1% | 0,95x |
| Kevin-32B | 5,2% | 1,1% | 0,7% | 0,64x |
| IndustrialCoder-32B-Thinking | 23,7% | 3,0% | 1,1% | 0,27x |

### SOL-ExecBench (202 problemas con muestreo de carga fijo)

| Modelo | Correctness | Fast@1 | Fast@2 | Mediana de speedup |
| --- | ---: | ---: | ---: | ---: |
| KODA-35B | 95,5% | 78,7% | 48,0% | 2,10x |
| Qwen3.6-35B-A3B (base) | 64,4% | 17,8% | 8,9% | 0,73x |
| Qwen3.8-Flash-Next | 95,5% | 74,8% | 44,1% | 1,70x |
| DeepSeek-V4.1-Flash-1017 | 91,6% | 81,7% | 54,5% | 3,15x |
| DeepSeek-V4-Flash-0731 | 98,0% | 67,3% | 41,1% | 1,37x |
| GLM-5.3 | 93,6% | 78,7% | 50,0% | 2,28x |
| GLM-5.3-Flash | 96,0% | 72,8% | 43,6% | 1,57x |
| Kimi-K3 | 94,6% | 78,2% | 44,6% | 1,81x |
| MiMo-v2.6-Flash-MOPD | 82,2% | 57,4% | 32,7% | 1,43x |
| Recursive-Flint-40B | 65,8% | 13,4% | 8,4% | 0,30x |
| MusaCoder-27B | 71,3% | 26,7% | 14,9% | 0,87x |
| Kevin-32B | 2,5% | 0,0% | 0,0% | 0,74x |
| IndustrialCoder-32B-Thinking | 25,7% | 3,5% | 2,0% | 0,59x |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El repositorio de pesos ocupa 70,2 GB en safetensors, lo que orienta sobre el orden de magnitud en precision completa.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Encaje en GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: la model card menciona vLLM y SGLang como motores compatibles. La evaluacion de kernels y el servicio del modelo usan recursos GPU separados.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa centrada en la tarea de generacion y optimizacion de kernels, con los datos publicados en la model card.

| Modelo | Parametros | Correctness KernelBench | Mediana speedup KernelBench | Correctness SOL-ExecBench | Licencia |
| --- | --- | ---: | ---: | ---: | --- |
| KODA-35B | 35,1B (aprox. 3B activos) | 95,6% | 3,15x | 95,5% | Apache 2.0 |
| Qwen3.6-35B-A3B | 35B (aprox. 3B activos) | 60,4% | 0,94x | 64,4% | no disponible |
| DeepSeek-V4.1-Flash-1017 | no disponible | 92,6% | 4,31x | 91,6% | no disponible |
| GLM-5.3 | no disponible | 94,1% | 2,97x | 93,6% | no disponible |
| Kimi-K3 | no disponible | 93,7% | 2,99x | 94,6% | no disponible |

KODA-35B destaca por alcanzar la mayor correccion en KernelBench junto a DeepSeek-V4-Flash-0731 y GLM-5.3-Flash, y por situarse en la segunda mejor mediana de speedup en KernelBench tras DeepSeek-V4.1-Flash-1017, que sin embargo obtiene menor correccion.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta ajustado para generacion y optimizacion de kernels CUDA; su comportamiento en tareas generales de conversacion o codigo no esta documentado.
- Dependencia del agente: el flujo de mejora iterativa requiere el agente KODA y sandboxes de evaluacion con GPU, ademas de recursos GPU separados para el servicio del modelo.
- Riesgo de alucinacion en codigo: como todo modelo generativo, puede producir kernels sintacticamente validos pero semanticamente incorrectos; la model card enfatiza la necesidad de tests de correccion.
- Idiomas soportados no documentados: no se especifica el soporte multilingue.
- Longitud de contexto no documentada: se desconoce la ventana maxima, lo que condiciona el tamano de las implementaciones de referencia y los historiales de perfilado que puede procesar.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia: Apache 2.0 permite uso comercial, pero el codigo del agente y los datasets de benchmark tienen licencias propias que deben revisarse por separado.
- Validacion en produccion: los resultados de benchmark provienen de la propia model card y no de una evaluacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Baidu-Baige/KODA-35B
- Repositorio del agente KODA: https://github.com/baidu-baige/KODA
- Framework de RL LoongSage: https://github.com/baidu-baige/LoongSage
- Playground LoongSage: http://play.loongsage.org/
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
