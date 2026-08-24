# 0xMiami305/Qwen3.8-27B-DFlash2-W4A16-MLP-only

## Resumen

El modelo `0xMiami305/Qwen3.8-27B-DFlash2-W4A16-MLP-only` no es un modelo de lenguaje independiente, sino un *draft model* diseñado para el mecanismo de decodificación especulativa DFlash2. Su función es acelerar la inferencia del modelo base `z-lab/Qwen3.8-27B-DFlash2`, que a su vez es una variante del Qwen3.8-27B de Alibaba con el algoritmo de difusión de bloques DFlash2. Este draft se publica como una cuantización selectiva W4A16 (pesos INT4, activaciones BF16) aplicada únicamente a cinco núcleos MLP del modelo base, manteniendo el resto de componentes (QKV, proyecciones, rutas de convolución dinámica, etc.) en BF16.

La relevancia de este checkpoint radica en que reduce el consumo de VRAM del draft en aproximadamente un 6,7 % (de 24,80 GiB a 23,13 GiB en la configuración probada) y, según el benchmark de un solo run incluido en la model card, mejora la tasa de aceptación especulativa en todas las posiciones K1-K7 y aumenta el throughput en un 8,24 % respecto al draft BF16 original. Está pensado para entornos de producción que usan vLLM con soporte para DFlash2, especialmente en hardware con recursos de memoria limitados.

El modelo está publicado bajo licencia Apache-2.0, con formato de pesos safetensors y un tamaño de repositorio de 1,9 GB. Los parámetros totales registrados en los safetensors son 1.924.404.480, muy inferiores a los 27B del modelo base porque solo se cuantizan las matrices de los MLP seleccionados; el resto de pesos permanece en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B) con DFlash2; draft MLP-only cuantizado W4A16 |
| Parametros totales | 1.924.404.480 (solo pesos cuantizados; el modelo base completo tiene ~27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; en la configuracion de prueba se uso max-model-len 32768 |
| Tipos de cuantizacion | W4A16 (INT4 pesos, BF16 activaciones), group size 128, simetrica, sin zero points, solo MLP |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-27B soporta multilingue, pero no se especifica para este draft) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion selectiva del draft DFlash2 original. DFlash2 es un metodo de decodificacion especulativa basado en difusion de bloques que genera multiples tokens candidatos en paralelo mediante una ruta de convolucion dinamica y un clasificador de aceptacion. El draft model completo (BF16) incluye cinco MLP con sus proyecciones gate, up y down, ademas de rutas de convolucion, un FC compartido, selector y normas. En esta version, exactamente cinco nucleos MLP se cuantizan a INT4 con activaciones BF16, group size 128, cuantizacion simetrica y sin zero points. Las matrices cuantizadas son 15 (gate, up y down de cada MLP), representadas como 10 modulos fusionados en runtime (`gate_up_proj` y `down_proj`). El resto de pesos (QKV, `o_proj`, rutas de convolucion, FC compartido, selector, normas y auxiliares) permanecen en BF16.

No se proporcionan datos sobre el entrenamiento del draft ni sobre el dataset utilizado; el modelo base Qwen3.8-27B fue entrenado por Alibaba con un corpus multilingue extenso, pero esa informacion no esta disponible en la model card de este checkpoint. La cuantizacion se realizo con la libreria Compressed-Tensors, y el resultado se probo con vLLM-XPU usando un parche especifico del PR #53122 para el mapeo de modulos fusionados.

## Capacidades

- No es un modelo de generacion autonomo: solo funciona como *draft model* dentro del pipeline de decodificacion especulativa DFlash2.
- Acelera la inferencia del modelo base Qwen3.8-27B generando hasta 7 tokens especulativos por paso (configuracion probada).
- Mantiene la calidad del modelo base al ser rechazado o aceptado por el modelo objetivo (target) en el mecanismo de verificacion.
- Reduce el consumo de VRAM del draft en comparacion con la version BF16 (23,13 GiB frente a 24,80 GiB en la configuracion de prueba).
- Compatible con vLLM (version con soporte para DFlash2 y el parche de mapeo de modulos empaquetados).
- No soporta tool calling, vision, audio ni otras capacidades por si mismo; esas capacidades dependen del modelo base Qwen3.8-27B.

## Casos de uso

- Despliegue de Qwen3.8-27B con DFlash2 en produccion: el draft se integra en vLLM mediante `--speculative-config` para acelerar la generacion de texto manteniendo la calidad del modelo base.
- Reduccion de costes de inferencia en entornos con VRAM limitada: al cuantizar solo los MLP del draft, se libera memoria adicional que puede destinarse a una mayor longitud de contexto o a un mayor tamano de lote.
- Servicios de chat y asistentes virtuales con baja latencia: la mejora del 8,24 % en throughput y la mayor tasa de aceptacion en posiciones tardias (K5-K7) reducen el tiempo de respuesta en conversaciones multi-turno.
- Generacion de codigo asistida: el modelo base Qwen3.8-27B tiene capacidades de codigo; el draft acelera la inferencia en entornos de autocompletado o agentes de programacion.
- Razonamiento y matematicas: el benchmark incluido usa el dataset GSM8K, lo que sugiere su uso en tareas de razonamiento aritmetico con mayor velocidad.
- Experimentacion con decodificacion especulativa: este checkpoint sirve como referencia para estudiar el impacto de la cuantizacion selectiva en la tasa de aceptacion y el rendimiento de DFlash2.

## Benchmarks y rendimiento

La model card incluye un benchmark de un solo run (sin significancia estadistica) comparando el draft BF16 original con este draft W4A16, ambos sirviendo al mismo modelo objetivo `RedHatAI/Qwen3.8-27B-INT4` en una Intel Arc Pro B70 con 128 prompts de GSM8K. Los resultados son:

| Metrica | BF16 DFlash2 | W4A16 draft |
|---|---|---|
| Throughput (tok/s) | 100,30 | 108,56 |
| Aceptacion especulativa bruta | 59,420 % | 60,174 % |
| Longitud media de aceptacion | 5,1594 | 5,2122 |
| VRAM no-KV (GiB) | 24,80 | 23,13 |

| Posicion de draft aceptada | BF16 DFlash2 | W4A16 draft | Delta |
|---|---|---|---|
| K1 | 91,403 % | 91,499 % | +0,096 pp |
| K2 | 79,796 % | 79,875 % | +0,079 pp |
| K3 | 68,156 % | 69,077 % | +0,921 pp |
| K4 | 57,964 % | 59,062 % | +1,098 pp |
| K5 | 47,558 % | 48,708 % | +1,150 pp |
| K6 | 39,259 % | 40,144 % | +0,884 pp |
| K7 | 31,801 % | 32,850 % | +1,049 pp |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el draft W4A16 ocupa 23,13 GiB de VRAM no-KV en la configuracion probada (con FP8 KV cache y max-model-len 32768). El modelo base completo (27B) requiere VRAM adicional para los pesos y la cache KV.
- GPU recomendadas: la prueba se realizo en una Intel Arc Pro B70. Para despliegue en produccion se recomiendan GPUs con al menos 32 GiB de VRAM (por ejemplo, A100 40GB, H100, RTX 4090 24GB podria ser insuficiente para el modelo completo con contexto largo).
- No cabe en GPUs de consumo de gama baja (8-12 GB) debido al tamano del modelo base.
- Opciones de despliegue: vLLM con soporte para DFlash2 (requiere el parche del PR #53122 o una version equivalente). No se menciona compatibilidad con llama.cpp, Ollama o TGI.
- Latencia y throughput: en el benchmark, el throughput fue de 108,56 tok/s con concurrency 1 y 128 prompts. La latencia no se reporta directamente.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|---|
| `0xMiami305/Qwen3.8-27B-DFlash2-W4A16-MLP-only` | Draft DFlash2 cuantizado | 1,92B (solo MLP) | No disponible (32K en prueba) | Apache-2.0 | Aceleracion especulativa |
| `z-lab/Qwen3.8-27B-DFlash2` | Draft DFlash2 BF16 | ~27B (completo) | No disponible | Apache-2.0 | Aceleracion especulativa |
| `RedHatAI/Qwen3.8-27B-INT4` | Modelo base cuantizado INT4 | ~27B | No disponible | Apache-2.0 | Inferencia directa sin especulacion |

La comparativa directa con otros draft models de DFlash2 no esta disponible en la informacion proporcionada. Este checkpoint se distingue por cuantizar solo los MLP, lo que reduce VRAM y mejora la aceptacion en el benchmark de un solo run.

## Limitaciones y advertencias

- No es un modelo autonomo: no puede usarse para generar texto por si mismo; requiere el modelo objetivo y el runtime DFlash2.
- Dependencia de vLLM con un parche especifico (PR #53122) que puede no estar disponible en versiones estables; la compatibilidad es fragil.
- El benchmark es de un solo run, sin significancia estadistica; los resultados pueden variar en otros entornos o con otras configuraciones.
- La cuantizacion selectiva solo afecta a los MLP; el resto de pesos permanece en BF16, por lo que el ahorro de VRAM es limitado (1,67 GiB en la prueba).
- Se recomienda desactivar el prefix caching en vLLM-XPU, ya que en las pruebas producia corrupcion silenciosa.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de idioma; estos dependen del modelo base Qwen3.8-27B.
- La licencia Apache-2.0 permite uso comercial, pero hay que revisar los avisos de terceros (THIRD_PARTY_NOTICES.md) para cumplir con las atribuciones.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/0xMiami305/Qwen3.8-27B-DFlash2-W4A16-MLP-only)
- [Modelo base z-lab/Qwen3.8-27B-DFlash2](https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2)
- [Modelo incoai/Qwen3.8-27B-DFlash2](https://huggingface.co/incoai/Qwen3.8-27B-DFlash2)
- [Modelo objetivo RedHatAI/Qwen3.8-27B-INT4](https://huggingface.co/RedHatAI/Qwen3.8-27B-INT4)
- [PR #53122 de vLLM](https://github.com/vllm-project/vllm/pull/53122)
- [Articulo de HackerNoon sobre Qwen3.8-27B-DFlash2](https://hackernoon.com/qwen38-27b-dflash2-a-guide-to-faster-qwen-inference)
