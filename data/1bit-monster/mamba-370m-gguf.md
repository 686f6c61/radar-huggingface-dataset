# 1bit-MONSTER/Mamba-370M-GGUF

## Resumen

Mamba-370M-GGUF es una conversión al formato GGUF del modelo Zyphra/Mamba-370M, publicada por el usuario 1bit-MONSTER como parte del catálogo de arquitecturas soportadas por su motor de inferencia (1bit engine). El modelo base es un Mamba-1 puro, es decir, una arquitectura de espacio de estados (SSM) sin mecanismo de atención ni mezcla de expertos, desarrollada originalmente por Zyphra. Con 371.516.416 parámetros, se sitúa en la gama pequeña y está pensado como caso de referencia y validación de kernels más que como modelo de producción.

La relevancia de este repositorio es fundamentalmente técnica: documenta la corrección del kernel `SSM_SCAN` para Mamba-1 en el backend Vulkan del motor, que elevó el rendimiento de decodificación de 25,8 a 173,5 tokens por segundo en hardware Strix Halo. Además, incluye una evaluación de calidad de cuantizaciones mediante divergencia KL contra los logits del f16, con un hallazgo relevante: las cuantizaciones de 4 bits estándar degradan el tensor `ssm_dt` y requieren un tratamiento específico.

El modelo se distribuye bajo licencia Apache 2.0, heredada del modelo base, e incluye pesos en f16, Q8_0, Q6_K, Q5_K_M y Q4_K_M. No se trata de un modelo afinado ni instruido: es una conversión de formato del checkpoint original con fines de reproducción y benchmarking.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-1 (SSM puro, sin atención ni MoE) |
| Parametros totales | 371.516.416 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es Mamba-1, una arquitectura de espacio de estados selectivo que sustituye la atención por un mecanismo de recurrencia con parámetros dependientes de la entrada. Esto permite un coste de inferencia lineal con la longitud de secuencia, en contraste con el coste cuadrático de la atención estándar. No incorpora capas de atención, mezcla de expertos ni componentes híbridos, según la model card del repositorio.

Este repositorio concreto no aporta información sobre el entrenamiento del modelo base: no se detallan el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. La contribución técnica del autor es la conversión a GGUF y la corrección del kernel `SSM_SCAN` en Vulkan, que resolvió una brecha de corrección y rendimiento que limitaba la velocidad de decodificación. Asimismo, se documenta que las cuantizaciones que asignan un tipo de 4 bits al tensor `ssm_dt` (de 64 columnas) producen salidas degeneradas, y que mantener únicamente ese tensor en q8_0 restaura la calidad.

## Capacidades

- Generación de texto autoregresiva mediante arquitectura SSM, sin atención.
- Modelo base sin ajuste por instrucciones: no está diseñado para seguir instrucciones ni para diálogo directo.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas.
- Sin modo de razonamiento (thinking), visión ni audio.
- Valor principal como banco de pruebas de kernels SSM y de evaluación de cuantización.

## Casos de uso

- Validación de kernels SSM en producción: sirve como caso de referencia para verificar la corrección del kernel `SSM_SCAN` en backends Vulkan y comparar el rendimiento antes y después de una corrección, con cifras reproducibles (25,8 frente a 173,5 tok/s).
- Evaluación de pipelines de cuantización: permite medir divergencia KL y coincidencia top-1 frente al f16 para calibrar qué tipos de cuantización son aceptables en modelos SSM pequeños, y detectar tensores sensibles como `ssm_dt`.
- Pruebas de integración de motores de inferencia: al ser un GGUF pequeño (385 MiB en Q8_0), es adecuado para tests automáticos de carga, generación y regresión en CI sin consumo relevante de recursos.
- Investigación sobre arquitecturas no transformer: útil para experimentos académicos que comparen SSM frente a transformers en tareas de modelado de lenguaje a pequeña escala.
- Despliegue en hardware de gama baja o embebido: con 222 MiB en Q4_K_M y un coste de inferencia lineal, puede ejecutarse en dispositivos con recursos muy limitados, aceptando la pérdida de calidad documentada.
- Reproducción de benchmarks en hardware específico: el repositorio incluye cifras medidas en Strix Halo (pp512 de 6530 tok/s, tg128 de 163 tok/s en F16) que sirven para comparar plataformas y backends.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos publicados son de rendimiento de inferencia y de fidelidad de cuantización.

| Metrica | Valor | Contexto |
|---|---|---|
| pp512 (prefill) | 6530 tok/s | Strix Halo, Vulkan, F16 |
| tg128 (decodificacion) | 163 tok/s | Strix Halo, Vulkan, F16 |
| tg128 tras correccion SSM_SCAN | 173,5 tok/s | Strix Halo, Vulkan (antes: 25,8 tok/s) |

| Fichero | Tamano | KLD medio vs F16 | Top-1 coincidente | HRX tg128 |
|---|---|---|---|---|
| Q8_0 | 385 MiB | 0,0186 | 91,6 % | 167 tok/s |
| Q6_K | 301 MiB | 0,1346 | 77,6 % | 197 tok/s |
| Q5_K_M | 259 MiB | 0,1577 | 75,5 % | 103 tok/s |
| Q4_K_M | 222 MiB | 0,2626 | 71,0 % | 108 tok/s |

Las mediciones de KLD se realizaron con `llama-perplexity --kl-divergence` sobre 16 ventanas de 512 tokens de wikitext-2 en CPU. Ningún fichero cuantizado cumple el criterio del autor (KLD medio ≤ 0,03 y top-1 ≥ 95 %), por lo que se recomienda el f16.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,8 GB en F16 (tamaño del repo 2,0 GB incluye todos los ficheros); 385 MiB en Q8_0; 222 MiB en Q4_K_M.
- Cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1650, RTX 3060, RTX 4090 y GPUs integradas.
- Despliegue mediante llama.cpp y el motor 1bit (`1bit serve -m mamba-370m-f16.gguf --device hrx`); compatibilidad con vLLM, TGI u Ollama no documentada.
- Rendimiento medido en Strix Halo (GPU integrada AMD) con backend Vulkan: 6530 tok/s en prefill y 163 tok/s en decodificación en F16.
- El backend Vulkan fue retirado del motor; las cifras actuales corresponden a la ruta HRX GPU y están pendientes de remedición.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Mamba-370M-GGUF (este) | 371,5 M | Mamba-1 (SSM) | no disponible | Apache 2.0 | GGUF |
| Zyphra/Mamba-370M | 371,5 M | Mamba-1 (SSM) | no disponible | Apache 2.0 | safetensors |
| Otros modelos de ~350-400 M tipo transformer | ~350-400 M | Transformer | no disponible | variable | safetensors, GGUF |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no debe usarse directamente en aplicaciones conversacionales sin un proceso de fine-tuning o prompting adecuado.
- Degradación severa con cuantizaciones de 4 bits estándar: Q4_0, IQ4_XS y Q3_K_M producen salidas degeneradas (KLD medio ~21, top-1 ~2 %) por el tratamiento del tensor `ssm_dt`; es necesario forzar `--tensor-type ssm_dt=q8_0`.
- Incluso las cuantizaciones recomendadas incumplen el criterio de calidad del autor; el f16 es la única opción que cumple el umbral declarado.
- Riesgo de alucinación inherente a un modelo de 370 M de parámetros, con conocimiento factual muy limitado.
- Idiomas soportados no documentados; el rendimiento en castellano no está verificado.
- Longitud de contexto no especificada en la información disponible.
- Las cifras de rendimiento provienen de mediciones en un único equipo compartido y con un backend ya retirado; no deben tomarse como garantía en otras plataformas.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de ajuste limita su aplicabilidad directa en producción.
- Repositorio con solo 24 descargas y 0 likes: ecosistema y validación comunitaria mínimos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/1bit-MONSTER/Mamba-370M-GGUF
- Modelo base: https://huggingface.co/Zyphra/Mamba-370M
- Motor 1bit: https://github.com/1bit-MONSTER/engine
- Issue sobre cuantización de `ssm_dt`: https://github.com/1bit-MONSTER/engine/issues/3531
- Familias del autor: https://huggingface.co/1bit-MONSTER#families
- Punto de entrada del autor: https://huggingface.co/1bit-MONSTER#start-here
