# cfontes/GLM-5.3-Flash-DFlash2-TR3-v3

## Resumen

Este modelo es un *drafter* de decodificación especulativa, no un modelo de lenguaje independiente. Ha sido desarrollado por cfontes para acelerar la inferencia de GLM-5.3-Flash, un modelo MoE de 320B parámetros con 18B activos, cuando este se sirve cuantizado con EXL3 en un stack vLLM con tensor parallelism 4 sobre cuatro nodos NVIDIA DGX Spark (GB10). El drafter se basa en la técnica DFlash2 (Block Diffusion for Flash Speculative Decoding) y ha sido reentrenado sobre capturas de *hidden states* del propio stack de servicio, de modo que aprende exactamente la distribución que va a predecir.

Con 1.171.080.448 parámetros (aproximadamente 1.17B) y un peso de 2.3 GB, este modelo consigue 31.7 tokens por segundo en *single-stream* con K=2 y *CUDA graphs*, lo que supone un incremento del 68% en *throughput* respecto al *drafter* del fabricante original. Su relevancia radica en que aborda el cuello de botella de la decodificación especulativa en modelos cuantizados de gran tamaño, donde el límite de aceptación viene impuesto por el ruido de cuantización de las capas intermedias, no por la capacidad del *drafter*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2 block-diffusion drafter (basado en transformer) |
| Parametros totales | 1.171.080.448 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bf16, safetensors) |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un *drafter* de decodificación especulativa basado en la técnica DFlash2, que utiliza difusión por bloques para predecir múltiples tokens futuros de forma paralela. Su arquitectura es la misma que la de `incoai/GLM-5.3-Flash-DFlash2`, con la configuración de bloques y capas objetivo sin cambios: block 8, selector rank 256 / top-16, y capas objetivo en las posiciones 5, 14, 24, 33 y 42.

El entrenamiento se realizó sobre 427.444 archivos de captura de *hidden states* (160 GB) grabados desde el stack de servicio EXL3-TR3 TP4 en funcionamiento. Los datos incluyen una mezcla de prompts de 54 dominios, con ponderación especial hacia contenido de código y más de 886.000 tokens de salida. El objetivo de optimización combina varias pérdidas: `1.0·block_CE(0.85^k decay) + 0.5·KL(top-256 teacher, T=1.0) + 2.0·selector-CE(top-16) + 0.5·anchor-KL + 0.1·hidden-cosine`. El entrenamiento se ejecutó en una sola etapa A, donde las capas del *decoder* permanecen congeladas y solo se entrenan los componentes de `fc`, `hidden_norm`, `hidden_projection` y los *codebooks* del selector. Se usaron 4 épocas, 164 pasos, en bf16, sobre un único nodo DGX Spark.

## Capacidades

- Aceleración de decodificación especulativa: predice secuencias de tokens para el modelo objetivo GLM-5.3-Flash cuantizado con EXL3.
- Alcanza 31.7 tokens por segundo en *single-stream* con K=2 y *CUDA graphs* en un stack TP4 de 4 nodos DGX Spark.
- Longitud media de aceptación de 1.83 tokens por propuesta.
- Soporte de *block-diffusion* (DFlash2) para generar múltiples candidatos de tokens en paralelo.
- No es un modelo de lenguaje general: no genera texto por sí solo ni dispone de capacidades de *tool calling*, visión, audio o razonamiento autónomo.
- Integración con vLLM y kernels nativos `vllm-exl3` para el modo EXL3.

## Casos de uso

- Despliegue de GLM-5.3-Flash en producción con vLLM y decodificación especulativa: el *drafter* se integra como modelo auxiliar en el *pipeline* de vLLM, reduciendo la latencia percibida en servicios de chat interactivo.
- Optimización de *throughput* en clústeres DGX Spark: al aumentar el rendimiento de 18.9 a 31.7 tokens por segundo, se puede atender más tráfico con los mismos recursos hardware.
- Servicios de generación de código en tiempo real: el entrenamiento con ponderación *code-heavy* hace que el *drafter* sea especialmente eficaz en cargas de trabajo de autocompletado o asistencia de programación.
- Reducción de costes de inferencia en entornos con GPU limitadas: permite aprovechar la cuantización EXL3 y la decodificación especulativa para obtener mayor velocidad sin necesidad de escalar horizontalmente.
- Investigación sobre límites de aceptación en decodificación especulativa: los resultados del modelo documentan que el techo de rendimiento está fijado por el ruido de cuantización de EXL3, lo que sirve como referencia para futuros diseños de *drafters*.
- Evaluación de estrategias de *draft length*: el modelo se ha probado con valores K de 1 a 7, confirmando que K=2 es el óptimo en este stack, lo que puede guiar la configuración de otros despliegues.

## Benchmarks y rendimiento

Los únicos benchmarks publicados corresponden al rendimiento de decodificación especulativa en el stack EXL3 TP4, no a métricas de calidad de lenguaje (MMLU, HumanEval, GSM8K, etc.), ya que este modelo no es un modelo base.

| Drafter | Tok/s | Accept len |
|---|---|---|
| Vendor (v1) | 18.9 | 1.07 |
| v2 (adapter fold) | 25.9 | 1.71 |
| Este modelo (v3) | 31.7 | 1.83 |

Condiciones de la medición: mismo stack EXL3, K=2, temperatura 0, c=1.

## Requisitos de hardware

- El repositorio de pesos ocupa 2.3 GB; la VRAM necesaria para el *drafter* en sí no está especificada, pero es pequeña en comparación con el modelo base.
- El despliegue completo requiere el modelo base GLM-5.3-Flash cuantizado con EXL3 y un stack vLLM con tensor parallelism 4.
- GPU recomendadas: 4 nodos NVIDIA DGX Spark (GB10), según la configuración de referencia del autor.
- No cabe en GPU de consumo de forma completa, porque el modelo base es un MoE de 320B parámetros.
- Opciones de despliegue: vLLM con TP4 y kernels `vllm-exl3` nativos. No se menciona soporte para llama.cpp, Ollama ni TGI.
- Rendimiento medido: 31.7 tokens por segundo en *single-stream* con K=2 y *CUDA graphs* en el stack descrito.

## Comparativa con modelos similares

La comparativa se limita a los *drafters* de decodificación especulativa para GLM-5.3-Flash en el mismo stack EXL3 TP4.

| Modelo | Parametros | Tok/s | Accept len | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vendor (v1) | No disponible | 18.9 | 1.07 | No disponible | No disponible |
| v2 (adapter fold) | No disponible | 25.9 | 1.71 | No disponible | cfontes/GLM-5.3-Flash-DFlash2-TP4-Spark |
| Este modelo (v3) | 1.171.080.448 | 31.7 | 1.83 | other | cfontes/GLM-5.3-Flash-DFlash2-TR3-v3 |

No se dispone de datos sobre otros *drafters* de modelos similares de otros fabricantes.

## Limitaciones y advertencias

- El *teacher-forcing* satura: aumentar el número de pasos de entrenamiento en un factor de 8 solo mejoró la aceptación en +0.02.
- Una variante v4 con ruido aumentado en los *hidden states* (σ=5%) no produjo mejoras (31.1 tok/s, accept 1.75), lo que indica que el techo de aceptación está fijado por el ruido de cuantización EXL3 de las capas intermedias, no por la capacidad del *drafter*.
- K=2 es la longitud de borrador óptima en este stack; usar valores mayores no aporta beneficios.
- La licencia es `other`, por lo que es necesario revisar los términos antes de cualquier uso comercial.
- No se han publicado datos sobre idiomas soportados ni longitud de contexto.
- El modelo no funciona de forma autónoma: requiere el modelo base GLM-5.3-Flash, el stack vLLM con TP4 y la cuantización EXL3 para ser útil.
- Los resultados de rendimiento son específicos del hardware y la configuración del autor; pueden variar en otros entornos.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/cfontes/GLM-5.3-Flash-DFlash2-TR3-v3
- Repositorio del stack de servicio completo: https://huggingface.co/cfontes/GLM-5.3-Flash-EXL3-TP4-Spark
- Documentación del despliegue TP4: https://huggingface.co/cfontes/glm-5.3-flash-dflash2-tp4
- Drafter v2 con adapter plegado: https://huggingface.co/cfontes/GLM-5.3-Flash-DFlash2-TP4-Spark
- Modelo base de Z.ai: https://huggingface.co/zai-org/GLM-5.3-Flash
- Punto de partida del entrenamiento: https://huggingface.co/incoai/GLM-5.3-Flash-DFlash2
- Receta de servicio de referencia (Mia): https://github.com/MiaAI-Lab/GLM-5.3-Flash-EXL3-2x-DGX-Sparks
