# emee-ai/Inkling-2-Mini-DFlash2

## Resumen

Inkling-2-Mini-DFlash2 es un modelo borrador (draft model) para decodificación especulativa, no un modelo de lenguaje autónomo. Lo publica emee-ai y está diseñado específicamente para acelerar la inferencia de `thinkingmachines/Inkling-2-Mini`, el modelo objetivo al que está vinculado como fine-tuning. Su función es proponer bloques de tokens que el modelo objetivo verifica después, manteniendo intacta la distribución de muestreo del modelo grande.

La innovación principal es que DFlash 2 emplea difusión por bloques (block diffusion) en lugar de drafting autorregresivo: predice un bloque completo de tokens en una sola pasada y conserva los mejores candidatos en cada posición, tras lo cual un selector ligero traza una ruta coherente entre ellos. Incorpora convoluciones dinámicas de dos tomas (two-tap dynamic convolutions) en el backbone para evitar la degradación de la calidad del borrador hacia el final del bloque.

Con 494.983.424 parámetros (aproximadamente 495 M) y un repositorio de 1,0 GB, es un modelo compacto pensado para desplegarse junto al modelo objetivo en servidores de inferencia SGLang. Su relevancia radica en las ganancias de throughput reportadas: hasta 2,77× frente a decodificación autorregresiva en concurrencia 1, y entre 1,37× y 1,92× en concurrencia 32, según los datos del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con block diffusion (draft model para decodificación especulativa), backbone con convoluciones dinámicas de dos tomas |
| Parametros totales | 494.983.424 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DFlash 2 es un drafter de difusión por bloques para decodificación especulativa. A diferencia de los drafters autorregresivos clásicos, predice un bloque entero de tokens en una única pasada y mantiene los mejores candidatos en cada posición del bloque; un selector ligero escoge después una trayectoria coherente a través de esos candidatos. El backbone incorpora convoluciones dinámicas de dos tomas para contrarrestar la pérdida de calidad del borrador conforme avanza el bloque. La verificación contra el modelo objetivo preserva la distribución de muestreo del target, de modo que la aceleración no altera la salida estadística del modelo grande.

El modelo es un fine-tuning de `thinkingmachines/Inkling-2-Mini`. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La evaluación del autor se realizó con SGLang sobre una NVIDIA H200, con FlashAttention 4 tanto en la atención del target como en la del draft, tamaño de bloque de especulación 8 (7 tokens borrador por paso de verificación), temperatura 1.0, top-p 1.0, top-k desactivado, esfuerzo de razonamiento por defecto y un máximo de 4096 tokens nuevos.

## Capacidades

- Generación de borradores de tokens para decodificación especulativa sobre `thinkingmachines/Inkling-2-Mini`; no genera texto de forma autónoma.
- Predicción paralela de bloques de tokens con selección de trayectoria coherente entre candidatos.
- Integración con SGLang mediante el algoritmo `DFLASH` y el parche de compatibilidad `sglang_inkling_dflash2.py`.
- Preservación de la distribución de muestreo del modelo objetivo gracias a la verificación del target.
- Aceleración del throughput de decodificación en tareas de razonamiento matemático, código y conversación (GSM8K, MATH-500, HumanEval, MBPP, MT-Bench).
- No soporta tool calling, agentes, visión ni audio por sí mismo; esas capacidades dependerían del modelo objetivo.

## Casos de uso

- Servicio de inferencia de alto throughput para Inkling-2-Mini: desplegar el par target+draft en SGLang con `--speculative-algorithm DFLASH` permite multiplicar los tokens por segundo servidos, según los datos del autor, hasta 2,68× en GSM8K con concurrencia 1.
- Razonamiento matemático en producción: en MATH-500 el modelo reporta 525,8 tok/s frente a 190,5 tok/s autorregresivos a concurrencia 1, lo que resulta adecuado para asistentes que resuelven problemas paso a paso con cadenas de razonamiento largas.
- Generación de código asistida: HumanEval y MBPP muestran aceleraciones de 2,50× y 2,77× a concurrencia 1, útil en IDE o pipelines de revisión de código donde la latencia de primera respuesta importa.
- Chat multi-turno: MT-Bench mejora de 190,7 a 387,3 tok/s a concurrencia 1, lo que reduce el tiempo de respuesta percibido en interfaces conversacionales.
- Despliegue con batching de alta concurrencia: a concurrencia 32 el modelo mantiene ganancias de 1,48× a 1,92×, lo que lo hace apto para endpoints compartidos con muchas peticiones simultáneas.
- Sustitución de MTP (DSpark) en infraestructuras existentes de Inkling-2-Mini: el draft DFlash 2 supera al MTP integrado en todas las tareas evaluadas, tanto en longitud de aceptación como en throughput, por lo que es un reemplazo directo en el mismo servidor SGLang.

## Benchmarks y rendimiento

Longitud de aceptación (tokens de completion por paso de verificación; mayor es mejor):

| Tarea | MTP (DSpark) | DFlash 2 |
|---|---:|---:|
| GSM8K | 3,52 | 4,96 |
| MATH-500 | 3,47 | 4,97 |
| HumanEval | 3,66 | 4,80 |
| MBPP | 3,49 | 4,88 |
| MT-Bench | 2,95 | 3,90 |

Throughput a concurrencia 1 (tok/s de salida; entre paréntesis, speedup frente a autorregresivo):

| Tarea | Autorregresivo | MTP (DSpark) | DFlash 2 |
|---|---:|---:|---:|
| GSM8K | 180,1 | 375,0 (2,08×) | 482,1 (2,68×) |
| MATH-500 | 190,5 | 375,7 (1,97×) | 525,8 (2,76×) |
| HumanEval | 190,2 | 374,7 (1,97×) | 475,9 (2,50×) |
| MBPP | 181,7 | 393,8 (2,17×) | 503,4 (2,77×) |
| MT-Bench | 190,7 | 297,6 (1,56×) | 387,3 (2,03×) |

Throughput a concurrencia 8 (tok/s de salida; speedup entre paréntesis):

| Tarea | Autorregresivo | MTP (DSpark) | DFlash 2 |
|---|---:|---:|---:|
| GSM8K | 851,1 | 1.100,8 (1,29×) | 1.452,2 (1,71×) |
| MATH-500 | 919,4 | 1.157,5 (1,26×) | 1.522,3 (1,66×) |
| HumanEval | 879,3 | 1.136,8 (1,29×) | 1.425,4 (1,62×) |
| MBPP | 845,1 | 1.160,3 (1,37×) | 1.524,6 (1,80×) |
| MT-Bench | 847,3 | 893,7 (1,05×) | 1.158,3 (1,37×) |

Throughput a concurrencia 32 (tok/s de salida; speedup entre paréntesis):

| Tarea | Autorregresivo | MTP (DSpark) | DFlash 2 |
|---|---:|---:|---:|
| GSM8K | 1.462,1 | 2.049,9 (1,40×) | 2.582,1 (1,77×) |
| MATH-500 | 1.577,1 | 2.173,1 (1,38×) | 2.855,4 (1,81×) |
| HumanEval | 1.522,0 | 2.120,9 (1,39×) | 2.686,1 (1,76×) |
| MBPP | 1.516,0 | 2.230,1 (1,47×) | 2.908,4 (1,92×) |
| MT-Bench | 1.494,8 | 1.713,7 (1,15×) | 2.206,8 (1,48×) |

No se han publicado en la información disponible resultados de benchmarks de calidad del modelo objetivo (MMLU, HumanEval como evaluación de capacidad, etc.); los datos anteriores miden exclusivamente el rendimiento del draft en decodificación especulativa.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,0 GB en safetensors, por lo que el draft requiere del orden de 1 GB adicional sobre el modelo objetivo; el consumo total del sistema lo domina Inkling-2-Mini.
- GPU recomendadas: la evaluación oficial se realizó sobre una NVIDIA H200 con FlashAttention 4. El uso de FA4 para target y draft es un requisito explícito de la configuración publicada.
- GPU de consumo: no disponible; el autor no documenta ejecución en GPUs consumer ni cuantizaciones del draft.
- Opciones de despliegue: SGLang con la imagen `lmsysorg/sglang:inkling-2-mini` y el parche `sglang_inkling_dflash2.py`; parámetros `--speculative-algorithm DFLASH`, `--speculative-draft-model-path`, `--speculative-num-draft-tokens 8`, `--attention-backend fa4` y `--speculative-draft-attention-backend fa4`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; a concurrencia 1 se alcanzan entre 387,3 y 525,8 tok/s según la tarea, y a concurrencia 32 entre 1.158,3 y 2.908,4 tok/s.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---:|---|---|---|---|
| Inkling-2-Mini-DFlash2 | Draft por block diffusion | 495 M | no disponible | Aceptación 3,90-4,97; hasta 2,77× sobre autorregresivo | Apache 2.0 | Hugging Face (emee-ai) |
| MTP (DSpark) de Inkling-2-Mini | Draft integrado (multi-token prediction) | no disponible | no disponible | Aceptación 2,95-3,66; hasta 2,17× sobre autorregresivo | la del modelo objetivo | Integrado en Inkling-2-Mini |
| Decodificación autorregresiva de Inkling-2-Mini | Sin draft | los del modelo objetivo | no disponible | Línea base (180-1.577 tok/s según concurrencia) | la del modelo objetivo | Hugging Face (thinkingmachines) |

No se dispone en la información proporcionada de otros drafters comparables de la familia DFlash para este mismo modelo objetivo.

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: solo funciona dentro de un servidor de decodificación especulativa junto a `thinkingmachines/Inkling-2-Mini`; cargarlo de forma aislada no produce texto útil.
- Dependencia estricta de SGLang y de la imagen `lmsysorg/sglang:inkling-2-mini` con el parche de compatibilidad; no se documenta soporte para otros motores de inferencia.
- Requiere FlashAttention 4 en la configuración publicada, lo que limita las GPUs compatibles (la evaluación se hizo en H200).
- El autor marca `inference: false` en la model card, señal de que no está pensado para uso directo.
- Sesgos conocidos: no disponible; al no generar contenido de forma autónoma, los sesgos de salida dependen del modelo objetivo.
- Riesgo de alucinación: no aplica directamente al draft, ya que la verificación del target preserva la distribución de muestreo; el riesgo recae en Inkling-2-Mini.
- Idiomas soportados: no disponible.
- Longitud de contexto: no disponible; el draft opera con bloques de especulación de tamaño 8, pero la ventana efectiva la fija el modelo objetivo.
- Licencia Apache 2.0, permisiva para uso comercial; conviene verificar igualmente las condiciones del modelo base `thinkingmachines/Inkling-2-Mini`.
- Los datos de rendimiento proceden del propio autor y de una única configuración de hardware (H200, FA4, SGLang); no se han replicado de forma independiente en la información disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/emee-ai/Inkling-2-Mini-DFlash2
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Repositorio GitHub de DFlash: https://github.com/z-lab/dflash
