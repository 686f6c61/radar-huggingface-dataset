# RedHatAI/Qwen3.8-2.4T-A95B-NVFP4-REAP-50

## Resumen

RedHatAI/Qwen3.8-2.4T-A95B-NVFP4-REAP-50 es una version cuantizada y podada del modelo MoE de Qwen, Qwen/Qwen3.8-2.4T-A95B, desarrollada por Red Hat AI. El modelo original es un Mixture-of-Experts de 2,4 billones de parametros con aproximadamente 95 mil millones de parametros activos por token, disenado para razonamiento avanzado, codigo y tareas agente de largo alcance. Esta variante aplica cuantizacion NVFP4 en las capas MoE y una poda uniforme del 50% de los expertos, reduciendo significativamente el uso de memoria y mejorando el rendimiento de inferencia en entornos multi-GPU.

El modelo fue calibrado con 1024 muestras del dataset open-perfectblend y esta pensado para su despliegue con vLLM, con soporte para paralelismo de tensores y de expertos. Es relevante ahora porque ofrece una alternativa eficiente para ejecutar un modelo de clase Qwen-Max en infraestructuras de 8 GPUs, manteniendo una calidad cercana al original en benchmarks como GPQA Diamond (90,7 frente a 92,6). La licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con backbone hibrido de atencion, 92 capas, 512 expertos enrutados + 1 compartido, 10 activos por token |
| Parametros totales | 2,4 billones (2,4 T) |
| Parametros activos | ~95 B |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (capas MoE) con sparsity uniforme del 50% en expertos |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible (probablemente safetensors con compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-2.4T-A95B emplea una arquitectura MoE de 92 capas con atencion hibrida (mezcla de atencion completa y lineal), 512 expertos enrutados con 10 activos por token mas un experto compartido. La cuantizacion NVFP4 se aplica a las capas de MoE, reduciendo la precision de los pesos a 4 bits en formato NVFP4, y la sparsidad uniforme elimina el 50% de los expertos en cada capa. El proceso de calibracion utilizo 1024 muestras del dataset open-perfectblend para ajustar los parametros de cuantizacion y minimizar la degradacion de rendimiento.

El modelo no ha sido reentrenado; es una version comprimida del original. La compresion se realizo con la libreria llm-compressor y compressed-tensors de RedHat, optimizada para inferencia con vLLM. No se menciona el uso de RLHF o DPO adicionales; las capacidades de razonamiento provienen del modelo base, que incorpora un modo de pensamiento (reasoning) explicito.

## Capacidades

- Generacion de texto y razonamiento avanzado con modo de pensamiento (thinking mode) activable mediante el parametro de razonamiento (por ejemplo, `reasoning-effort xhigh` en los ejemplos de evaluacion).
- Razonamiento multi-paso y resolucion de problemas complejos en dominios cientificos y tecnicos (GPQA Diamond, DeepSWE).
- Generacion y comprension de codigo, incluyendo tareas de ingenieria de software de largo alcance (DeepSWE 1.1).
- Soporte para despliegue en vLLM con paralelismo de tensores y de expertos, optimizado para inferencia distribuida.
- Capacidades de agente de largo plazo (long-horizon agentic tasks) segun la descripcion del modelo base Qwen3.8.
- No se ha confirmado soporte de vision, audio o tool calling explicito en esta variante especifica; el modelo base Qwen3.8-Max ofrece vision y herramientas, pero esta variante no lo documenta.

## Casos de uso

- Inferencia de alto rendimiento en produccion: el modelo esta disenado para servirse con vLLM en 8 GPUs, con `--tensor-parallel-size 8` y `--enable-expert-parallel 8`, lo que permite atender peticiones con baja latencia en entornos empresariales.
- Razonamiento cientifico y academico: puede resolver problemas de nivel de doctorado en fisica, quimica y biologia, como se refleja en GPQA Diamond (90,7), util para asistentes de investigacion automatizados.
- Ingenieria de software autonoma: con capacidad para resolver tareas complejas de SWE (DeepSWE 1.1), puede integrarse en pipelines de CI/CD para revision de codigo, generacion de parches o resolucion de incidencias.
- Agentes de largo plazo: su arquitectura y contexto largo (262K tokens) permiten mantener conversaciones multi-turno con memoria amplia, adecuado para agentes de planificacion y ejecucion de tareas en entornos empresariales.
- Desarrollo de asistentes de codigo con razonamiento explicito: al activar el modo de pensamiento, el modelo puede desglosar problemas de programacion complejos antes de generar soluciones, util en entornos de desarrollo integrado.
- Evaluacion y pruebas de modelos de IA: como modelo de referencia cuantizado, sirve para medir el impacto de la compresion en el rendimiento, permitiendo a equipos de ML evaluar la viabilidad de despliegues eficientes.

## Benchmarks y rendimiento

| Benchmark | `Qwen/Qwen3.8-2.4T-A95B` | `RedHatAI/Qwen3.8-2.4T-A95B-NVFP4-REAP-50` | `RedHatAI/Qwen3.8-2.4T-A95B-NVFP4-REAP-25` | `RedHatAI/Qwen3.8-2.4T-A95B-NVFP4` |
|---|---|---|---|---|
| GPQA Diamond | 92.6 | 90.7 | 91.5 | 92.9 |
| DeepSWE 1.1 | 56.6 | No reportado | 56.6 | No reportado |

Los resultados muestran que la cuantizacion NVFP4 sin sparsidad mantiene incluso un rendimiento ligeramente superior al modelo original (92.9 en GPQA Diamond). La sparsidad del 50% (REAP-50) degrada el rendimiento en 1.9 puntos en GPQA, mientras que la del 25% solo lo reduce en 1.1. No se han publicado resultados para DeepSWE en esta variante concreta.

## Requisitos de hardware

- VRAM estimada: alrededor de 900 GB para el modelo con sparsidad del 25% (segun LLM Explorer); para la variante con 50% de sparsidad, la VRAM seria menor, pero no se ha publicado el valor exacto.
- GPUs recomendadas: el comando de despliegue del README utiliza `--tensor-parallel-size 8`, sugiriendo 8 GPUs de alto rendimiento (por ejemplo, A100 de 80 GB o H100 de 80 GB). Con 8 GPUs de 80 GB se alcanza aproximadamente 640 GB, por lo que probablemente se requieran 8 GPUs de 100 GB o mas, o 16 GPUs de 80 GB si no se dispone de 100 GB.
- No cabe en GPUs de consumo (RTX 4090 u similares) por el tamano de los parametros activos y la memoria necesaria.
- Despliegue optimizado con vLLM, que soporta paralelismo de tensores y de expertos. Tambien compatible con la libreria transformers para cargas de trabajo de investigacion.
- La latencia y el throughput no estan publicados; dependen de la configuracion de hardware y del nivel de razonamiento (reasoning effort) configurado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GPQA Diamond | DeepSWE 1.1 | Licencia |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-2.4T-A95B | 2.4T totales, ~95B activos | 262K (ampliable a 1M) | 92.6 | 56.6 | MIT |
| RedHatAI/Qwen3.8-2.4T-A95B-NVFP4-REAP-25 | 2.4T totales, ~95B activos (con sparsidad 25%) | 262K | 91.5 | 56.6 | MIT |
| RedHatAI/Qwen3.8-2.4T-A95B-NVFP4 | 2.4T totales, ~95B activos | 262K | 92.9 | No reportado | MIT |
| RedHatAI/Qwen3.8-2.4T-A95B-NVFP4-REAP-50 | 2.4T totales, ~95B activos (con sparsidad 50%) | 262K | 90.7 | No reportado | MIT |

Comparado con el modelo base, la variante REAP-50 sacrifica 1.9 puntos en GPQA Diamond a cambio de una reduccion de memoria significativa. La variante NVFP4 sin sparsidad incluso mejora ligeramente el rendimiento del base, lo que sugiere que la cuantizacion no es el factor limitante, sino la sparsidad de expertos.

## Limitaciones y advertencias

- La sparsidad del 50% de expertos introduce una perdida de precision de aproximadamente 2 puntos en GPQA Diamond, que puede ser inaceptable para aplicaciones criticas.
- No se han publicado datos sobre sesgos o alucinaciones; al ser un modelo de razonamiento, puede generar respuestas falsas pero plausibles en dominios especializados.
- La longitud de contexto de 262K tokens es amplia pero inferior a la de la version oficial Qwen3.8-Max (1M), y no se documenta soporte para vision ni herramientas en esta variante.
- La licencia MIT permite uso comercial, pero la cuantizacion y sparsidad pueden afectar a la reproducibilidad de resultados en comparacion con el modelo original.
- El despliegue requiere infraestructura de multiples GPUs de alta gama (8 o mas), lo que limita su uso a entornos con recursos significativos.
- La calibracion se realizo con un dataset concreto (open-perfectblend) y puede no generalizar a todos los dominios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Qwen3.8-2.4T-A95B-NVFP4-REAP-50
- Modelo base Qwen3.8-2.4T-A95B: https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B
- Dataset de calibracion open-perfectblend: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Repositorio de Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Receta de vLLM para el modelo base: https://recipes.vllm.ai/Qwen/Qwen3.8-2.4T-A95B
- Variante con sparsidad del 25%: https://huggingface.co/RedHatAI/Qwen3.8-2.4T-A95B-NVFP4-REAP-25
