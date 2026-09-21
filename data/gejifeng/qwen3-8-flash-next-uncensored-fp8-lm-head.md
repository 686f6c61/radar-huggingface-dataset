# gejifeng/Qwen3.8-Flash-Next-Uncensored-FP8-lm-head

## Resumen

Este repositorio no contiene un modelo completo, sino un **delta de la cabeza de salida** (`lm_head`) cuantizada a FP8 E4M3 para la familia `Qwen3.8-Flash-Next-Uncensored`. El autor, `gejifeng`, publica únicamente la proyección de salida densa de forma `[248320, 2560]` en FP8 (más su escala por canal en BF16), el script exacto de cuantización, el script de aplicación sobre un checkpoint local, un parche de dos ficheros para vLLM y los scripts y resultados brutos de los benchmarks.

El problema que resuelve es concreto y medible: la cabeza de salida es una proyección densa que se lee en **cada paso de decodificación** del token objetivo, por lo que reducir a la mitad sus bytes supone un ahorro fijo por paso. El resultado declarado es pasar de 1,27 GiB a 0,64 GiB, con un aumento de steps/s del 6-20 % a un solo flujo, GSM8K idéntico (92,50 %) y MMLU dentro de 1,5 puntos (91,00 % → 90,00 % / 89,50 %, n=200). Además, como la cabeza MTP del modelo comparte `lm_head.weight`, el ahorro también afecta a la proyección de logits del *drafter* especulativo.

Su relevancia es doble: por un lado, documenta una técnica de cuantización *post-hoc* de la cabeza de salida que el propio autor integra en el esquema `compressed-tensors` ya usado por otras 300 capas del checkpoint base; por otro, incluye el parche necesario para que vLLM cargue una `ParallelLMHead` cuantizada a 4/8 bits, algo que la versión estándar no soporta. El repositorio tiene 0 descargas y 0 likes, no declara *pipeline* ni idiomas, y **no se han encontrado fuentes independientes que verifiquen los resultados**.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible para el modelo completo. El artefacto publicado es una cabeza de salida (`lm_head`) densa FP8 E4M3 sobre un transformer de la familia Qwen3.8-Flash-Next, con cabeza MTP para decodificación especulativa |
| Parametros totales | No disponible (el repositorio, de 0,6 GB, solo contiene el delta de la cabeza). La cabeza en si tiene 248320 × 2560 = 635.699.200 parametros |
| Parametros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible en la model card. La configuración de servicio empleada en las pruebas usa `--max-model-len 500000` |
| Tipos de cuantizacion | FP8 E4M3 por canal de salida (escala = amax/448, guardada en BF16) para `lm_head`; el checkpoint base usa NVFP4 y FP8 PLE con esquema `compressed-tensors`; KV cache en FP8 |
| Idiomas soportados | No disponible. Los benchmarks de velocidad incluyen prompts en ingles, codigo y chino (`zh_sci`), pero no se declara cobertura oficial |
| Licencia | `qwen-community-license-1.0` (etiquetada como `license: other`) |
| Formato de pesos | `safetensors`: `FP8/lm_head_fp8.safetensors` con `lm_head.weight` (F8_E4M3 [248320, 2560]) y `lm_head.weight_scale` (BF16 [248320, 1]). Libreria declarada: `vllm` |

## Arquitectura y entrenamiento

No hay entrenamiento implicado: se trata de una cuantización *post-hoc* de la cabeza de salida del checkpoint `lychee888/Qwen3.8-Flash-Next-Uncensored-NVFP4-FP8PLE`. El método convierte `lm_head.weight` de BF16 a FP8 E4M3 con una escala **por canal de salida** (`scale = amax / 448`, almacenada en BF16), replicando el esquema `compressed-tensors` ya presente en el modelo (`naive-quantized`, 8 bits, `strategy=channel`, simétrico). Para ello se añade `lm_head` y la expresión regular `re:.*lm_head$` a ese grupo de configuración y se elimina de la lista `ignore`. Un detalle relevante de implementación es que el nombre del módulo en vLLM es `language_model.lm_head` y no `lm_head`, de ahí el uso de regex.

El parche de vLLM consta de dos ficheros y tres ediciones: (1) en `model.py`, la cabeza principal pasa a `ParallelLMHead(..., quant_config=without_modelopt_fp4(self.quant_config))`; (2) en `mtp.py`, la cabeza del *drafter* pasa a `ParallelLMHead(..., quant_config=self.quant_config)`; y (3) un ayudante `_set_head_linear_attrs(head)` que dota a la `ParallelLMHead` cuantizada de los atributos lineales que lee el kernel FP8 W8A16 Humming (`output_partition_sizes`, `input_size`, `input_size_per_partition`, `has_bias`, `output_size`). La razón es que vLLM estándar falla con una `ParallelLMHead` de 4/8 bits: el esquema crea los parámetros y el cargador lee `lm_head.weight_scale`, pero `process_weights_after_loading` necesita esos atributos lineales.

Las mediciones exactas *solo sobre la cabeza* son: error relativo de Frobenius del 2,88 % y error espectral ‖ΔW‖/‖W‖ del 0,267 %; y en un A/B sobre 11.476 estados ocultos reales de la última capa (6.000 muestreados), acuerdo top-1 del 95,12 %, solapamiento top-5 de 0,959 y KL media BF16‖FP8 de 0,0016, con todos los cambios de top-1 situados en empates próximos (mediana del margen top1−top2 de 0,039 frente a 1,733 en el conjunto global).

## Capacidades

El delta no añade ni entrena capacidades: preserva las del modelo base. Lo medido en la model card es:

- Generacion de texto y razonamiento general: MMLU (mezcla de asignaturas) del 91,00 % con cabeza BF16 y del 90,00 % / 89,50 % con cabeza FP8 (n=200).
- Matematicas: GSM8K del 92,50 % con cabeza BF16 y del 92,50 % / 91,50 % con cabeza FP8 (n=200).
- Codigo: no se reporta HumanEval ni metrica equivalente, pero la tasa de aceptacion especulativa en prompts de codigo es del 87-88 %, la mas alta de las tres categorias probadas.
- Contexto largo: recuperacion tipo *needle* correcta a 13k y 53k tokens; la configuracion de servicio usada declara `--max-model-len 500000`.
- Decodificacion especulativa MTP: soportada via `--speculative-config {"method":"mtp","num_speculative_tokens":2}`, con la cabeza MTP compartiendo el peso de `lm_head`.
- Multilingue: se evaluan prompts en ingles, chino y codigo; no se declara lista oficial de idiomas.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo *thinking*, vision, audio): no disponible. Los benchmarks se ejecutaron con `enable_thinking=false`.
- Modelo base etiquetado como *uncensored*: implicito en el nombre del checkpoint de origen, sin especificacion tecnica de que filtros se han retirado.

## Casos de uso

- **Despliegue del modelo base en equipos con memoria unificada ajustada**: sustituir la cabeza BF16 por la version FP8 libera 0,63 GiB (de 1,27 a 0,64 GiB). En una maquina tipo DGX Spark, donde la tabla PLE de ~48 GB se pagina bajo demanda y el sistema va justo de memoria, ese margen se traduce directamente en menos presion de pagina.
- **Asistentes interactivos de un solo flujo**: con `num_speculative_tokens=2` y un solo usuario, el autor mide +20,9 % en tokens/s y +19,7 % en steps/s con prompts de codigo (40,6 → 49,1 tok/s). Es el escenario donde el ahorro por paso de decodificacion es maximo.
- **Analisis de documentos largos**: combinado con `--max-model-len 500000` y `--kv-cache-dtype fp8`, el modelo recupera informacion correctamente a 13k y 53k tokens con el prefijo evaluado, lo que permite casos de resumen y QA sobre expedientes extensos.
- **Servicio con batching moderado**: a 4 peticiones concurrentes el throughput agregado sube un 5,2 % (86,6 → 91,1 tok/s). Menos espectacular que a un flujo, pero sin coste en calidad medida.
- **Investigacion sobre sensibilidad de la cabeza de salida**: el repositorio incluye `scripts/quantize_head_fp8.py`, `bench/bench_ab.py`, `bench/bench_downstream.py` y los resultados brutos, lo que permite reproducir el A/B sobre estados ocultos y medir el efecto de cuantizar la ultima proyeccion.
- **Auditoria de cuantizacion en vLLM**: los dos ficheros parcheados (`vllm/clean-model.py`, `vllm/clean-mtp.py`) y el `Dockerfile.fp8head-v1` sirven como referencia para integrar cabezas cuantizadas en despliegues vLLM propios.
- **Pipeline de publicacion de variantes cuantizadas**: `scripts/apply_fp8_head.py` injerta la cabeza en una copia local del checkpoint actualizando el indice y `config.json`, lo que encaja en flujos automatizados de generacion de artefactos derivados.

## Benchmarks y rendimiento

Calidad, n=200 por conjunto, `enable_thinking=false`, temperatura 0:

| Benchmark | Cabeza BF16 | Cabeza FP8 | Diferencia |
|---|---|---|---|
| GSM8K | 92,50 % (185/200) | 92,50 % / 91,50 % | 0-2 preguntas |
| MMLU (mezcla de asignaturas) | 91,00 % (182/200) | 90,00 % / 89,50 % | 2-3 preguntas |

El autor indica que las diferencias estan dentro de la banda de muestreo de ±2 %.

Velocidad en decodificacion, un solo flujo, tras convergencia de calentamiento (DGX Spark GB10):

| Carga | Cabeza BF16 | Cabeza FP8 | Delta |
|---|---|---|---|
| en_code | 40,6 tok/s (14,6 steps/s) | 49,1 tok/s (17,5 steps/s) | +20,9 % / +19,7 % |
| en_prose | 36,5 tok/s (14,4 steps/s) | 44,4 tok/s (17,2 steps/s) | +21,6 % / +19,7 % |
| zh_sci | 33,8 tok/s (14,1 steps/s) | 41,2 tok/s (17,0 steps/s) | +22,0 % / +21,0 % |
| 4 concurrentes | 86,6 tok/s agregados | 91,1 tok/s agregados | +5,2 % |

Prefill (sin efecto apreciable de la cabeza, que solo se aplica al ultimo token): 802 / 1327 / 1608 / 1503 / 1412 tok/s a 1k / 4k / 16k / 64k / 128k tokens, con TTFT de 1,3 / 3,1 / 10,2 / 43,6 / 92,9 s.

No se han publicado resultados de benchmarks independientes en la informacion disponible.

## Requisitos de hardware

- **VRAM de la cabeza**: 0,64 GiB en FP8 frente a 1,27 GiB en BF16. El ahorro es de aproximadamente 0,63 GiB, constante en cada paso de decodificacion.
- **VRAM del modelo completo**: no disponible. Los datos apuntan a un despliegue que ocupa buena parte de 128 GB de memoria unificada, con una tabla PLE de aproximadamente 48 GB paginada bajo demanda.
- **GPU utilizada en las pruebas**: 1× NVIDIA DGX Spark (GB10, `sm_121`) con 128 GB de LPDDR5X unificada (~273 GB/s) y CPU de 20 nucleos, con el servicio fijado a los 10 nucleos Cortex-X925 (`cpuset 5-9,15-19`).
- **Compatibilidad con GPU de consumo**: no disponible. No se reportan pruebas en RTX 4090 ni similares, y el Dockerfile parte de una imagen concreta (`qwen38-blazux-direct:20260909`) orientada a `sm_121`.
- **Opciones de despliegue**: vLLM `v0.1.dev20073+g8e685d198` con el parche incluido (etiqueta `qwen38-fp8head:v1`). No se documentan llama.cpp, Ollama, TGI ni otras alternativas.
- **Configuracion de servicio de referencia**: `--kv-cache-dtype fp8 --async-scheduling --kv-cache-memory-bytes 19327352832 --gpu-memory-utilization 0.85 --max-model-len 500000 --max-num-seqs 8`.
- **Latencia y throughput**: los indicados en la tabla anterior. El autor advierte que los tok/s absolutos dependen del hardware y del contenido; lo que transfiere a otras maquinas de clase GB10 es el ahorro relativo.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de terceros. La comparacion relevante es interna, entre la cabeza publicada y las alternativas del mismo linaje:

| Artefacto | Que aporta | Tamano de la cabeza | Calidad medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gejifeng/Qwen3.8-Flash-Next-Uncensored-FP8-lm-head` | Cabeza `lm_head` FP8 E4M3 por canal + parche vLLM | 0,64 GiB | GSM8K 92,50 % / MMLU 90,00-89,50 % | `qwen-community-license-1.0` | Publico en HuggingFace, 0 descargas, 0 likes |
| Cabeza BF16 del checkpoint base | Referencia sin cuantizar | 1,27 GiB | GSM8K 92,50 % / MMLU 91,00 % | La del checkpoint base | Publico |
| `lychee888/Qwen3.8-Flash-Next-Uncensored-NVFP4-FP8PLE` | Checkpoint base con NVFP4 y FP8 PLE | No disponible | No disponible | No disponible | Publico |
| `orcarouter/Qwen3.8-Flash-Next-Uncensored-NVFP4` | Checkpoint base alternativo | No disponible | No disponible | No disponible | Publico |

Comparacion con modelos de otros fabricantes (Llama, Mistral, DeepSeek, etc.): no disponible.

## Limitaciones y advertencias

- **No es un modelo autonomo**: el repositorio contiene solo el delta de la cabeza de salida y utilidades auxiliares. Requiere el checkpoint base para funcionar; no puede cargarse de forma independiente.
- **Requiere parchear vLLM**: la version estandar falla al cargar una `ParallelLMHead` de 4/8 bits. Sin aplicar las tres ediciones descritas, el despliegue no arranca.
- **Resultados no verificados de forma independiente**: 0 descargas, 0 likes, sin *pipeline* declarado y sin fuentes externas que reproduzcan las cifras. Los benchmarks tienen n=200 por conjunto, un tamano muestral pequeno.
- **Datos de procedencia incierta**: las fechas de creacion y actualizacion del repositorio son del 21 de septiembre de 2026, y no se ha encontrado documentacion publica del modelo base `Qwen3.8-Flash-Next` en las busquedas realizadas.
- **Medicion de velocidad sensible al calentamiento**: el autor advierte que el equipo es ajustado de memoria y que la tabla PLE de ~48 GB se pagina bajo demanda, de modo que peticiones tras un periodo de inactividad leen paginas frias de NVMe y corren un 10-30 % mas lentas. La cifra de ~+20 % corresponde a ciclos 3-6 tras descartar los dos primeros; la misma configuracion FP8 en frio da 35-44 tok/s.
- **Contenido sin censura**: el checkpoint base esta etiquetado como *uncensored*. Su uso en produccion exige moderacion externa y evaluacion de riesgos legales y reputacionales, especialmente en aplicaciones orientadas al usuario final.
- **Restricciones de licencia**: la licencia declarada es `qwen-community-license-1.0`, con enlace al fichero de licencia del modelo base de Qwen. No se detallan en este repositorio las condiciones de uso comercial; hay que consultar el texto enlazado antes de cualquier despliegue productivo.
- **Idiomas no declarados**: la model card no especifica cobertura linguistica. Solo consta que se probaron prompts en ingles, chino y codigo.
- **Alucinacion y sesgos**: no hay informacion especifica sobre sesgos ni tasas de alucinacion del modelo base en la documentacion proporcionada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/gejifeng/Qwen3.8-Flash-Next-Uncensored-FP8-lm-head
- Modelo base 1: https://huggingface.co/lychee888/Qwen3.8-Flash-Next-Uncensored-NVFP4-FP8PLE
- Modelo base 2: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored-NVFP4
- Licencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Ficheros internos del repositorio (rutas relativas, sin URL publica confirmada): `FP8/lm_head_fp8.safetensors`, `scripts/quantize_head_fp8.py`, `scripts/apply_fp8_head.py`, `vllm/clean-model.py`, `vllm/clean-mtp.py`, `vllm/Dockerfile.fp8head-v1`, `bench/bench_ab.py`, `bench/bench_downstream.py`, `bench/bench_speed.py`, `bench/needle.py`
- Paper, blog o demo oficial: no disponible
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (los resultados obtenidos eran consultas de Zhihu sin relacion con el tema)
