# SceneWorks/qwen3.8-27b-dflash2

## Resumen

SceneWorks/qwen3.8-27b-dflash2 es un re-host sin modificaciones del modelo borrador (draft model) `incoai/Qwen3.8-27B-DFlash2`, fijado a la revisión `015e795645c74b1a0eeef3b570031fb62e769bc5`. No se trata de un modelo de lenguaje autónomo: es un drafter de decodificación especulativa que se ejecuta dentro de un servidor de inferencia (SGLang o vLLM) junto al modelo objetivo `Qwen/Qwen3.8-27B`, generando tokens candidatos que el modelo grande verifica. SceneWorks lo redistribuye para que su aplicación descargue el borrador en una revisión fijada, junto con los otros niveles del mismo modelo base.

La innovación técnica es DFlash 2, un drafter de difusión por bloques que predice un bloque completo de tokens en una sola pasada y conserva los mejores candidatos en cada posición; un selector ligero traza después una ruta coherente a través de ellos. La decodificación es sin pérdidas: la salida greedy coincide exactamente con la del modelo objetivo y el muestreo preserva su distribución. Según la model card, en un H200 con SGLang alcanza aceleraciones de hasta 3,43× frente a decodificación autorregresiva con concurrencia 1.

El checkpoint tiene 1.924.404.480 parámetros (aproximadamente 1,9 mil millones) y un tamaño de repositorio de 3,8 GB en safetensors. La licencia es Apache-2.0 y el modelo base declarado es Qwen/Qwen3.8-27B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Drafter de difusión por bloques (block-diffusion) para decodificación especulativa, con convoluciones dinámicas de dos tomas en el backbone y un selector de ruta de candidatos |
| Parámetros totales | 1.924.404.480 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

DFlash 2 es un modelo borrador diseñado específicamente para decodificación especulativa sobre Qwen3.8-27B. En lugar de generar tokens de uno en uno, predice un bloque entero en una única pasada y mantiene los candidatos mejor puntuados en cada posición del bloque. Un selector ligero recorre esos candidatos y elige una trayectoria coherente, que el modelo objetivo verifica después. Las convoluciones dinámicas de dos tomas del backbone evitan que la calidad del borrador se degrade hacia el final del bloque, un problema habitual en los drafters paralelos.

El mecanismo es sin pérdidas por construcción: en modo greedy la salida coincide exactamente con la del modelo objetivo y, en muestreo, se preserva la distribución del objetivo. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esos datos no están disponibles. El bloque de especulación empleado en la evaluación es de 8 (7 tokens borrador por paso de verificación).

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen3.8-27B; no genera texto de forma autónoma.
- Decodificación sin pérdidas: la salida greedy coincide con la del modelo objetivo y el muestreo preserva su distribución.
- Predicción paralela de bloques completos con selección de ruta entre candidatos por posición.
- Integración nativa con SGLang (`--speculative-algorithm DFLASH`) y con vLLM (`"method": "dflash"`).
- Compatible con decodificación especulativa de 7 tokens por paso de verificación (bloque de 8).
- Capacidades lingüísticas, de razonamiento, código o tool calling: heredadas del modelo objetivo, no disponibles en la información del propio drafter.

## Casos de uso

- Aceleración de inferencia en producción con SGLang: desplegar Qwen3.8-27B con `--speculative-draft-model-path` apuntando a este checkpoint para multiplicar el throughput de salida hasta 3,43× con concurrencia 1 en tareas de matemáticas (GSM8K) sobre un H200.
- Servicio de chat interactivo de baja latencia: con concurrencia 1 en MT-Bench el modelo alcanza 184,0 tok/s frente a 68,9 tok/s autorregresivos (2,67×), lo que reduce el tiempo hasta el primer bloque de respuesta en asistentes conversacionales.
- Generación de código en pipelines: en HumanEval y MBPP logra 3,11× y 3,29× de aceleración respectivamente con concurrencia 1, adecuado para autocompletado y generación de tests en CI/CD.
- Razonamiento matemático por lotes: en MATH-500 mantiene 2,85× de aceleración con concurrencia 8 (1.368,3 tok/s), útil para evaluaciones masivas de problemas matemáticos.
- Despliegue con vLLM en clústeres existentes: la configuración `speculative-config` con `num_speculative_tokens: 7` permite añadir el drafter sin cambiar el motor de serving.
- Sustitución de MTP o DSpark en despliegues ya existentes: con concurrencia 32 el modelo sigue superando a la decodificación autorregresiva en GSM8K (1,45×) y MATH-500 (1,30×), mientras que MTP y DSpark caen por debajo de 1× en varias tareas.

## Benchmarks y rendimiento

Longitud de aceptación (media de tokens de completion por paso de verificación; mayor es mejor):

| Tarea | MTP | DSpark | DFlash 2 |
|---|---:|---:|---:|
| GSM8K | 5,02 | 4,36 | **5,46** |
| MATH-500 | 4,72 | 3,92 | **5,28** |
| HumanEval | 3,91 | 3,30 | **4,39** |
| MBPP | 3,99 | 3,51 | **4,79** |
| MT-Bench | 3,74 | 3,01 | **4,10** |

Throughput con concurrencia 1 (tok/s de salida y aceleración frente a autorregresivo):

| Tarea | Autorregresivo | MTP | DSpark | DFlash 2 |
|---|---:|---:|---:|---:|
| GSM8K | 68,9 | 178,5 (2,59×) | 185,3 (2,69×) | **236,1 (3,43×)** |
| MATH-500 | 69,0 | 172,8 (2,51×) | 174,5 (2,53×) | **230,7 (3,34×)** |
| HumanEval | 69,0 | 151,9 (2,20×) | 159,9 (2,32×) | **214,6 (3,11×)** |
| MBPP | 69,0 | 153,1 (2,22×) | 163,3 (2,37×) | **226,9 (3,29×)** |
| MT-Bench | 68,9 | 134,9 (1,96×) | 137,6 (2,00×) | **184,0 (2,67×)** |

Throughput con concurrencia 8:

| Tarea | Autorregresivo | MTP | DSpark | DFlash 2 |
|---|---:|---:|---:|---:|
| GSM8K | 467,2 | 1.022,1 (2,19×) | 1.040,8 (2,23×) | **1.328,7 (2,84×)** |
| MATH-500 | 480,0 | 1.023,5 (2,13×) | 1.025,8 (2,14×) | **1.368,3 (2,85×)** |
| HumanEval | 483,4 | 934,2 (1,93×) | 956,5 (1,98×) | **1.291,5 (2,67×)** |
| MBPP | 478,0 | 938,1 (1,96×) | 974,1 (2,04×) | **1.328,0 (2,78×)** |
| MT-Bench | 480,5 | 835,2 (1,74×) | 802,3 (1,67×) | **1.090,2 (2,27×)** |

Throughput con concurrencia 32:

| Tarea | Autorregresivo | MTP | DSpark | DFlash 2 |
|---|---:|---:|---:|---:|
| GSM8K | 1.329,8 | 1.381,1 (1,04×) | 1.506,5 (1,13×) | **1.922,5 (1,45×)** |
| MATH-500 | 1.505,8 | 1.415,6 (0,94×) | 1.429,0 (0,95×) | **1.951,8 (1,30×)** |
| HumanEval | 1.546,5 | 1.296,8 (0,84×) | 1.330,1 (0,86×) | **1.799,0 (1,16×)** |
| MBPP | 1.507,7 | 1.314,9 (0,87×) | 1.361,3 (0,90×) | **1.886,8 (1,25×)** |
| MT-Bench | 1.507,4 | 1.159,7 (0,77×) | 1.115,5 (0,74×) | **1.525,3 (1,01×)** |

Condiciones de la evaluación: SGLang sobre una NVIDIA H200, FlashAttention 3 para atención del objetivo y del borrador, bloque de especulación de 8 (7 tokens borrador por verificación), parámetros recomendados de Qwen3.8 (temperatura 1,0, top-p 0,95, top-k 20) con esfuerzo de razonamiento `xhigh`, máximo de 4096 tokens nuevos, y prompts con el formato de `z-lab/dflash`.

## Requisitos de hardware

- VRAM estimada para el drafter: no disponible de forma explícita; con 1,9 mil millones de parámetros en safetensors y un repositorio de 3,8 GB, la huella en precisión nativa ronda los 4 GB, a los que hay que sumar la del modelo objetivo Qwen3.8-27B (no disponible en la información proporcionada).
- GPU de referencia en la evaluación: NVIDIA H200, una unidad, con FlashAttention 3.
- No se han publicado pruebas en GPU de consumo (RTX 4090, etc.); no disponible.
- Motores de despliegue soportados: SGLang (instalación desde el repositorio git con `sglang[all]`) y vLLM (build desde el PR 52816).
- Configuración SGLang: `--speculative-algorithm DFLASH --speculative-draft-model-path incoai/Qwen3.8-27B-DFlash2 --speculative-num-draft-tokens 8`.
- Configuración vLLM: `--speculative-config '{"method": "dflash", "model": "incoai/Qwen3.8-27B-DFlash2", "num_speculative_tokens": 7}'`.
- Throughput medido en H200: 236,1 tok/s (GSM8K, concurrencia 1) y 1.922,5 tok/s (GSM8K, concurrencia 32).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Tokens borrador por paso | Aceleración GSM8K (conc. 1) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| DFlash 2 (este) | Difusión por bloques | 1.924.404.480 | 7 | 3,43× | Apache-2.0 | HF (incoai, z-lab, SceneWorks) |
| MTP de Qwen3.8 | Multi-token prediction integrado | no disponible | 7 | 2,59× | la del modelo objetivo | Integrado en Qwen3.8-27B |
| DSpark (RadixArk) | Drafter comunitario | no disponible | 7 | 2,69× | no disponible | HF (RadixArk/Qwen3.8-27B-DSpark) |

DFlash 2 supera a ambos alternativas en longitud de aceptación en las cinco tareas evaluadas y en throughput en todas las combinaciones de concurrencia y tarea, salvo MT-Bench con concurrencia 32, donde MTP y DSpark quedan por debajo del autorregresivo y DFlash 2 apenas lo iguala (1,01×).

## Limitaciones y advertencias

- No es un modelo autónomo: requiere Qwen3.8-27B y un servidor de decodificación especulativa (SGLang o vLLM); cargarlo con transformers de forma directa no produce generación de texto útil.
- Sesgos conocidos: no disponible en la información proporcionada; al heredar la distribución del modelo objetivo, cualquier sesgo de Qwen3.8-27B se preserva.
- Riesgo de alucinación: la decodificación es sin pérdidas respecto al objetivo, por lo que el drafter no introduce alucinaciones adicionales, pero tampoco las corrige.
- Limitaciones de contexto o idioma: no disponible.
- Licencia Apache-2.0 declarada en la model card; el repositorio upstream no incluye fichero LICENSE y el re-host añade el texto estándar de Apache-2.0. Verificar términos antes de uso comercial.
- El re-host fija la revisión `015e795645c74b1a0eeef3b570031fb62e769bc5`; `config.json` y `model.safetensors` son idénticos byte a byte al upstream, pero no se garantizan actualizaciones futuras.
- vLLM requiere una build desde un PR concreto (52816), no una versión estable publicada; esto complica el despliegue en producción.
- En concurrencia 32 el beneficio se reduce drásticamente (1,01× en MT-Bench) y MTP y DSpark quedan por debajo del autorregresivo; planificar el dimensionamiento según la carga esperada.
- No hay datos publicados sobre cuantización ni sobre comportamiento en GPU de consumo.

## Enlaces

- Hugging Face (este re-host): https://huggingface.co/SceneWorks/qwen3.8-27b-dflash2
- Upstream original: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Mirror: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter DSpark comparable: https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Repositorio GitHub: https://github.com/z-lab/dflash
- SGLang: https://github.com/sgl-project/sglang
- vLLM (PR 52816): https://github.com/vllm-project/vllm/pull/52816
- Organización SceneWorks en GitHub: https://github.com/SceneWorks
