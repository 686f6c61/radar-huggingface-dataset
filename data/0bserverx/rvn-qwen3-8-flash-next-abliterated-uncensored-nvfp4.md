# 0bserverx/RVN-Qwen3.8-Flash-Next-Abliterated-Uncensored-NVFP4

## Resumen

El modelo **RVN-Qwen3.8-Flash-Next-Abliterated-Uncensored-NVFP4** es una cuantización NVFP4 (W4A16) del modelo base **0bserverx/RVN-Qwen3.8-Flash-Next-Abliterated-Uncensored**, publicado por el usuario **0bserverx** en Hugging Face. No se trata de un nuevo entrenamiento ni de una nueva pasada de abliteración, sino de una exportación a formato NVFP4 solicitada por la comunidad para facilitar la inferencia en hardware NVIDIA con soporte para este formato.

El modelo subyacente es un modelo experimental de mezcla de expertos (MoE) de la familia Qwen4 Exp (arquitectura `Qwen4ExpForCausalLM`), con un total de **116.545.921.955 parámetros** y un tamaño de repositorio de **180,3 GB**. Es un modelo de generación de texto conversacional, publicado bajo la licencia **qwen-community-1.0**, con pesos en formato `safetensors`. La etiqueta "abliterated" y "uncensored" indica que el modelo base fue sometido a técnicas de abliteración para reducir ciertas negativas o restricciones de seguridad, lo que lo orienta a usos donde se busca minimizar filtros de contenido.

Su relevancia radica en ser una de las primeras cuantizaciones NVFP4 de un modelo MoE tan grande, con métricas de control de calidad publicadas por el autor. Estas métricas muestran una degradación de perplejidad muy pequeña en comparación con la referencia BF16, aunque la prueba operativa estricta no alcanzó el umbral declarado del 90 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4ExpForCausalLM (qwen4_exp_text) |
| Parametros totales | 116.545.921.955 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A16) con backend Marlin; también se menciona un experimento W4A4/CUTLASS no oficial |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (242 shards, 296.110 tensores) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura experimental **Qwen4ExpForCausalLM**, de tipo *mixture-of-experts*. Según el README del autor, se mantiene únicamente el CausalLM principal, sin cabeza MTP activa. El checkpoint incluye un tensor PLE de gran tamaño que se conservó sin modificar en su shard original.

La cuantización emplea **W4A16_NVFP4**: pesos NVFP4 E2M1 empaquetados, escalas FP8 E4M3 con grupo de 16, escalas de segundo nivel en FP32 y activaciones en BF16. Los campos escalares `input_scale=1` no son calibración de activaciones, sino ranuras vacías del cargador W4A16. El formato no es W4A4 ni una cuantización ModelOpt calibrada, y **no todos los pesos están en 4 bits**.

El modelo base fue sometido a un proceso de **abliteración** (según las etiquetas del repositorio), pero no se proporcionan datos sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO. La documentación indica expresamente que esta versión NVFP4 no es un nuevo entrenamiento ni una nueva ejecución de abliteración, sino una conversión directa del checkpoint BF16 de referencia.

## Capacidades

- Generación de texto en modo conversacional (pipeline `text-generation`).
- Inferencia de lenguaje natural con soporte para *streaming* a través de una API compatible con `/v1/completions` (como se usó en las pruebas de calidad).
- El modelo es de tipo MoE, lo que permite activar solo una fracción de los parámetros en cada token (aunque no se especifica el número de parámetros activos).
- No se documentan capacidades de visión, audio, *tool calling* ni *function calling* en la información disponible.
- No se confirma soporte nativo de *thinking mode* ni de razonamiento multi-paso más allá de la generación conversacional estándar.

## Casos de uso

- **Experimentación con cuantización NVFP4 en modelos MoE a gran escala**: este checkpoint sirve como referencia para estudiar el impacto de W4A16 en modelos de 116B parámetros. Las métricas de perplejidad publicadas (PPL 6,5998 frente a 6,5872 en BF16) permiten comparar la degradación cuantitativa en un entorno controlado.
- **Investigación sobre técnicas de abliteración y alineación**: al ser una versión "abliterated" y "uncensored", puede utilizarse para analizar cómo la eliminación de ciertas restricciones afecta al comportamiento del modelo en tareas de generación sin filtros, siempre dentro de un marco académico y con las advertencias legales correspondientes.
- **Pruebas de rendimiento en hardware Blackwell**: el autor reporta cargas de 84,97 GiB por GPU con tensor parallel 2 en RTX PRO 6000 Blackwell, y un throughput de 25,59 tokens/s en un escenario de streaming con concurrencia 1. Esto lo hace adecuado para validar la viabilidad de inferencia en estaciones de trabajo con doble GPU.
- **Despliegue en servidores de chat con API compatible OpenAI**: dado que se probó a través de `/v1/completions`, el modelo puede integrarse en aplicaciones de chatbot existentes, siempre que se disponga de los recursos de GPU necesarios y se asuma la limitación de la prueba operativa.
- **Benchmark de calidad en cuantización**: la métrica de perplejidad en WikiText-2 (test split) proporciona un caso de uso directo para comparar distintas estrategias de cuantización en la misma arquitectura, incluyendo el experimento W4A4/CUTLASS no oficial que también se documenta.
- **Análisis de tolerancia a fallos en generación**: las pruebas operacionales de 48 casos (con seis categorías) y la detección de salidas degeneradas permiten evaluar la robustez del modelo cuantizado en tareas de formato estricto, aunque no superó el umbral declarado.

## Benchmarks y rendimiento

El autor publica los siguientes resultados, todos obtenidos sobre el split **test** de WikiText-2 con 603 ventanas de 512 tokens y 308.104 tokens objetivo.

| Medicion | Referencia BF16 | Candidato NVFP4 |
|---|---|---|
| Perplejidad (PPL) | 6,587224 | 6,599824 |
| Casos operacionales | 42/48 | 42/48 |
| Salidas degeneradas | 0 | 0 |

| Umbral declarado para NVFP4 | Medido | Limite |
|---|---|---|
| Ratio PPL agregado | 1,001913 | ≤ 1,05 |
| Incremento de PPL | 0,1913 % | derivado del ratio |
| Ratio p95 de PPL por ventana | 1,032587 | ≤ 1,15 |
| Ratio maximo de PPL por ventana | 1,065311 | ≤ 1,35 |
| Tasa de exito operacional | 87,50 % | ≥ 90 % |

Se realizaron además pruebas adicionales en 2 x RTX PRO 6000 Blackwell con tensor parallel 2 y sin offload de CPU, donde se obtuvo una PPL de 6,598805 y 41/48 casos operacionales, así como un experimento W4A4/CUTLASS no oficial con PPL de 6,622774 y 43/48 casos. En streaming, con concurrencia 1 y salida de 128 tokens, se midió **25,59 tokens/s** para W4A16/Marlin frente a **23,55 tokens/s** para W4A4/CUTLASS.

## Requisitos de hardware

- **VRAM estimada**: según el autor, el modelo no cabe en GPUs de 16, 24 o 32 GB. En una configuración con 2 x RTX PRO 6000 (97.887 MiB cada una) y tensor parallel 2, se midió una carga de **84,97 GiB por rank** y un pico de uso de aproximadamente **90,48 GiB por GPU**. En una GPU de 95 GB, la referencia BF16 requirió offload de CPU.
- **GPU recomendadas**: se ha probado con éxito en **NVIDIA RTX PRO 6000 Blackwell Workstation Edition** (2 GPUs). No se mencionan resultados en A100, H100 ni RTX 4090.
- **Inferencia en GPU de consumo**: no es viable en GPUs de consumo típicas (16-32 GB) debido al tamaño de los pesos cuantizados.
- **Opciones de despliegue**: no se especifican en la documentación, pero se menciona el **backend Marlin** y el uso de una API compatible con `/v1/completions`. No hay referencias a vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput**: en el escenario de streaming medido (concurrencia 1, ejecución eager, longitudes de entrada 512/1536, salida 128, semillas 17/23, 8 requests por celda), se obtuvo **25,59 tokens/s** con W4A16/Marlin.

## Comparativa con modelos similares

No se han publicado resultados comparativos con otros modelos en la información disponible. El autor solo compara su propio checkpoint cuantizado con la referencia BF16 y con un experimento W4A4/CUTLASS no oficial. No se dispone de datos de otros modelos de la misma categoría (MoE de ~116B cuantizados) para establecer una tabla comparativa.

## Limitaciones y advertencias

- La prueba operacional estricta **no superó el umbral declarado del 90 %** (42/48 = 87,50 %). El autor advierte que esto incluye fallos en JSON con delimitadores, explicaciones adicionales y coincidencia exacta de casos.
- El incremento de PPL es pequeño (0,1913 %), pero el autor señala explícitamente que **no se midió la divergencia KL completa** y que el resultado no establece una preservación universal de capacidades, calidad en contexto largo, throughput ni seguridad.
- El modelo es **"uncensored" y "abliterated"**, lo que puede implicar un menor filtrado de contenido potencialmente dañino o sesgado. Es necesario evaluar los sesgos y riesgos antes de cualquier uso en producción.
- La licencia **qwen-community-1.0** debe revisarse detenidamente para confirmar los términos de uso comercial y las restricciones aplicables, especialmente al tratarse de un modelo derivado.
- No se dispone de información sobre el contexto máximo, los idiomas soportados ni los parámetros activos, lo que limita la evaluación de idoneidad en tareas multilingües o de contexto largo.
- Las pruebas de calidad se realizaron con una ventana de 512 tokens, por lo que **no se ha validado el comportamiento en entradas largas** ni en escenarios de uso intensivo de memoria.
- La documentación advierte que el formato NVFP4 **no es W4A4 ni una cuantización calibrada con ModelOpt**, y que no todos los pesos están en 4 bits, lo que puede generar expectativas incorrectas sobre el rendimiento o la compatibilidad.

## Enlaces

- Modelo en Hugging Face: [0bserverx/RVN-Qwen3.8-Flash-Next-Abliterated-Uncensored-NVFP4](https://huggingface.co/0bserverx/RVN-Qwen3.8-Flash-Next-Abliterated-Uncensored-NVFP4)
- Modelo base: [0bserverx/RVN-Qwen3.8-Flash-Next-Abliterated-Uncensored](https://huggingface.co/0bserverx/RVN-Qwen3.8-Flash-Next-Abliterated-Uncensored)
- Versión GGUF del modelo base: [0bserverx/RVN-Qwen3.8-Flash-Next-Abliterated-Uncensored-GGUF](https://huggingface.co/0bserverx/RVN-Qwen3.8-Flash-Next-Abliterated-Uncensored-GGUF)
- Discusión que motivó esta versión NVFP4: [Could you please provide the NVFP4 version? - discussion #1](https://huggingface.co/0bserverx/RVN-Qwen3.8-Flash-Next-Abliterated-Uncensored/discussions/1)
