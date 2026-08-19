# incoai/Muse-Glimmer-30B-DFlash2

## Resumen

Muse-Glimmer-30B-DFlash2 es un modelo auxiliar de decodificación especulativa, no un modelo de lenguaje independiente. Ha sido desarrollado por Inco AI como un drafter de bloques (block-diffusion) para acelerar la inferencia del modelo objetivo `meta-models/Muse-Glimmer-30B`, un modelo agéntico multimodal de 30.000 millones de parámetros publicado por Meta. Este drafter se integra en servidores de inferencia como SGLang o vLLM y predice bloques completos de tokens que el modelo principal verifica, logrando aceleraciones de hasta 4,6 veces en throughput respecto a la decodificación autorregresiva.

El modelo está finetuneado a partir del drafter oficial de Meta (`Muse-Glimmer-30B-assistant`) y utiliza la arquitectura DFlash 2, que introduce convoluciones dinámicas de dos taps para mantener la calidad del borrador en bloques largos. Con 2.772 millones de parámetros y un peso de 11,1 GB en formato safetensors, es un modelo ligero en comparación con el objetivo de 30B, lo que permite ejecutarlo en paralelo con el modelo principal sin un coste adicional significativo. Su relevancia radica en que permite desplegar modelos grandes en hardware de consumo con una latencia reducida, un aspecto crítico para aplicaciones agénticas en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block-diffusion drafter (DFlash 2) con convoluciones dinámicas de dos taps |
| Parametros totales | 2.772.159.744 (2,77B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (hereda la del modelo objetivo, no especificada en la ficha) |
| Tipos de cuantizacion | No disponibles |
| Idiomas soportados | No disponibles (depende del modelo objetivo Muse-Glimmer-30B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DFlash 2 es un drafter de bloques para decodificación especulativa. A diferencia de los drafters autorregresivos tradicionales, predice un bloque completo de tokens en una sola pasada y mantiene los mejores candidatos en cada posición. Un selector ligero traza después una trayectoria coherente a través de esos candidatos. La columna vertebral incluye convoluciones dinámicas de dos taps que evitan que la calidad del borrador se degrade hacia el final del bloque. La decodificación es sin pérdidas: la salida greedy coincide exactamente con la del modelo objetivo y el muestreo conserva la distribución original.

El modelo se finetunea a partir de `meta-models/Muse-Glimmer-30B-assistant`, el drafter oficial que Meta distribuye con Muse-Glimmer-30B. No se especifican los datos de entrenamiento ni el número de tokens utilizados en el finetune. La inferencia se realiza dentro de un servidor de decodificación especulativa (SGLang o vLLM) que ejecuta el drafter en paralelo con el modelo principal, verificando los tokens propuestos.

## Capacidades

- No es un modelo de generación de texto independiente; su única función es proponer tokens candidatos para el modelo objetivo Muse-Glimmer-30B.
- Soporta decodificación especulativa con bloques de hasta 16 tokens (15 tokens de borrador por paso de verificación).
- Integración nativa con SGLang (algoritmo `DFLASH`) y vLLM (configuración `speculative-config` con método `dflash`).
- Aceleración de inferencia sin pérdida de calidad: la salida greedy es idéntica a la del modelo objetivo y el muestreo preserva la distribución.
- Capacidad de trabajar con alta concurrencia (hasta 32 peticiones simultáneas en las pruebas publicadas).
- No tiene capacidades propias de razonamiento, visión ni tool calling; todas las capacidades funcionales las aporta el modelo objetivo.

## Casos de uso

- Despliegue de Muse-Glimmer-30B en servidores de inferencia de baja latencia: el drafter se usa para reducir el tiempo de respuesta en aplicaciones agénticas que requieren interacción en tiempo real, como asistentes personales o agentes de automatización.
- Aumento de throughput en entornos de producción con alta concurrencia: al acelerar la verificación de tokens, se puede atender a más usuarios simultáneos con el mismo hardware, reduciendo el coste por petición.
- Ejecución de modelos grandes en hardware de consumo: aunque el modelo objetivo requiere GPUs con suficiente VRAM, el drafter ligero (2,77B) permite que la decodificación especulativa funcione en tarjetas de gama media (por ejemplo, RTX 4090) sin comprometer la velocidad.
- Integración en pipelines de generación de código y razonamiento matemático: las pruebas muestran aceleraciones de 4,59× en GSM8K y 4,09× en HumanEval, lo que hace viable el uso interactivo de herramientas de programación asistida.
- Optimización de costes en infraestructura cloud: al reducir el tiempo de cómputo por token, se disminuye el consumo de GPU y la factura asociada en despliegues de Muse-Glimmer-30B.
- Investigación en decodificación especulativa: sirve como referencia para estudiar técnicas de block-diffusion y comparar con otros drafters como DSpark o el DFlash oficial.

## Benchmarks y rendimiento

La model card publica resultados de aceptación de tokens y throughput en una NVIDIA H200 con SGLang, usando un bloque de especulación de 16 tokens (15 de borrador) y los parámetros de muestreo recomendados por Meta (temperatura 1,0, top-p 0,95, top-k 64). Se comparan cuatro métodos: decodificación autorregresiva, DFlash oficial, DSpark y DFlash 2.

### Acceptance length (media de tokens aceptados por paso de verificación)

| Tarea | DFlash oficial | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: |
| GSM8K | 5,43 | 5,45 | **6,57** |
| MATH-500 | 5,39 | 5,01 | **6,56** |
| HumanEval | 4,11 | 4,33 | **5,66** |
| MBPP | 3,74 | 4,02 | **5,30** |
| MT-Bench | 3,52 | 3,59 | **4,42** |

### Throughput (tok/s y speedup vs. autorregresivo)

#### Concurrencia 1

| Tarea | Autorregresivo | DFlash oficial | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: | ---: |
| GSM8K | 63,9 | 247,8 (3,88×) | 236,5 (3,70×) | **293,7 (4,59×)** |
| MATH-500 | 64,0 | 246,3 (3,85×) | 218,4 (3,41×) | **295,5 (4,62×)** |
| HumanEval | 65,1 | 210,5 (3,23×) | 201,4 (3,09×) | **266,2 (4,09×)** |
| MBPP | 63,9 | 196,8 (3,08×) | 192,7 (3,02×) | **264,8 (4,14×)** |
| MT-Bench | 64,0 | 164,6 (2,57×) | 159,7 (2,49×) | **197,4 (3,08×)** |

#### Concurrencia 8

| Tarea | Autorregresivo | DFlash oficial | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: | ---: |
| GSM8K | 476,6 | 1.574,4 (3,30×) | 1.456,1 (3,06×) | **1.816,6 (3,81×)** |
| MATH-500 | 466,0 | 1.582,9 (3,40×) | 1.386,0 (2,97×) | **1.859,3 (3,99×)** |
| HumanEval | 499,9 | 1.419,8 (2,84×) | 1.315,4 (2,63×) | **1.784,9 (3,57×)** |
| MBPP | 491,6 | 1.278,9 (2,60×) | 1.266,6 (2,58×) | **1.719,7 (3,50×)** |
| MT-Bench | 470,0 | 1.078,4 (2,29×) | 1.052,6 (2,24×) | **1.288,9 (2,74×)** |

#### Concurrencia 32

| Tarea | Autorregresivo | DFlash oficial | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: | ---: |
| GSM8K | 1.705,6 | 2.330,3 (1,37×) | 2.301,7 (1,35×) | **2.818,3 (1,65×)** |
| MATH-500 | 1.710,2 | 2.427,3 (1,42×) | 2.185,0 (1,28×) | **2.869,6 (1,68×)** |
| HumanEval | 1.798,1 | 2.170,0 (1,21×) | 2.068,9 (1,15×) | **2.780,2 (1,55×)** |
| MBPP | 1.717,5 | 1.964,6 (1,14×) | 2.006,5 (1,17×) | **2.685,4 (1,56×)** |
| MT-Bench | 1.721,8 | 1.668,0 (0,97×) | 1.627,2 (0,95×) | **1.975,5 (1,15×)** |

## Requisitos de hardware

- El drafter tiene 2,77B parámetros, lo que en FP16 ocupa aproximadamente 5,5 GB de VRAM (el repo pesa 11,1 GB en safetensors, probablemente con pesos en BF16/FP16 y posiblemente duplicados). Puede ejecutarse en GPUs con al menos 8 GB de VRAM, aunque el modelo objetivo Muse-Glimmer-30B requiere considerablemente más (típicamente 60-80 GB en FP16, o cuantizado para GPUs de consumo).
- Las pruebas de la model card se realizaron en una NVIDIA H200 con FlashAttention 3 tanto para la atención del objetivo como para la del drafter.
- Para uso en consumer GPU, se recomienda una RTX 4090 (24 GB) o similar, siempre que el modelo objetivo esté cuantizado (por ejemplo, AWQ o GPTQ) y el drafter se ejecute en FP16.
- Opciones de despliegue: SGLang (con el flag `--speculative-algorithm DFLASH` y `--speculative-draft-model-path`) o vLLM (con `--speculative-config` indicando método `dflash`). También puede usarse con TGI si se adapta, aunque no está documentado.
- La latencia y el throughput dependen del hardware y la concurrencia; los datos publicados muestran entre 197 y 2.870 tok/s según la tarea y la concurrencia en una H200.

## Comparativa con modelos similares

Este modelo se compara con otros drafters para el mismo objetivo Muse-Glimmer-30B. No es comparable con modelos de lenguaje completos.

| Caracteristica | DFlash 2 (este modelo) | DFlash oficial (Meta) | DSpark (DaoCloud) |
| :--- | :--- | :--- | :--- |
| Parámetros | 2,77B | No disponible (similar al drafter oficial) | No disponible |
| Arquitectura | Block-diffusion con convoluciones dinámicas | Block-diffusion (DFlash original) | No especificada |
| Acceptance length media (GSM8K) | 6,57 | 5,43 | 5,45 |
| Speedup vs. autorregresivo (GSM8K, conc. 1) | 4,59× | 3,88× | 3,70× |
| Licencia | Apache 2.0 | Apache 2.0 (presumible) | No disponible |
| Disponibilidad | HuggingFace (incoai y z-lab) | HuggingFace (meta-models) | HuggingFace (DaoCloud) |

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: no puede generar texto, razonar ni ejecutar tareas por sí mismo. Solo funciona como drafter dentro de un servidor de decodificación especulativa junto al modelo objetivo.
- Requiere el modelo objetivo `meta-models/Muse-Glimmer-30B` y un motor de inferencia compatible (SGLang o vLLM con soporte para DFLASH). Sin esa integración, el modelo es inútil.
- Los idiomas soportados y la longitud de contexto dependen enteramente del modelo objetivo; no se especifican en la ficha del drafter.
- No se han publicado datos sobre sesgos, alucinaciones o calidad de generación, ya que el modelo no genera contenido.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse que el modelo objetivo también tenga una licencia compatible (Muse-Glimmer-30B de Meta tiene su propia licencia, que puede imponer restricciones adicionales).
- Las pruebas de rendimiento se realizaron en una única configuración de hardware (H200) y con un tamaño de bloque fijo (16 tokens); los resultados pueden variar en otros entornos.
- El modelo está pensado para entornos de producción con alta demanda; su beneficio se reduce en cargas muy bajas o con poca concurrencia, donde la sobrecarga del drafter puede no compensar.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/incoai/Muse-Glimmer-30B-DFlash2)
- [Espejo en HuggingFace (z-lab)](https://huggingface.co/z-lab/Muse-Glimmer-30B-DFlash2)
- [Modelo objetivo Muse-Glimmer-30B](https://huggingface.co/meta-models/Muse-Glimmer-30B)
- [Blog de DFlash 2](https://inco.ai/blog/dflash2/)
- [Repositorio GitHub de DFlash](https://github.com/z-lab/dflash)
- [Paper original de DFlash (ICML 2026)](https://github.com/z-lab/dflash) (referencia citada en la model card)
