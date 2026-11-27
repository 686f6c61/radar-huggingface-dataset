# loom-draft/mradermacher-miscii-14b-0218-i1-loom

## Resumen

`loom-draft/mradermacher-miscii-14b-0218-i1-loom` no es un modelo entrenado desde cero, sino un paquete de despliegue en formato Loom (`.loom` más una tarjeta `model.json`) para el checkpoint GGUF `miscii-14b-0218.i1-Q4_K_M.gguf`, publicado originalmente por mradermacher. El paquete lo genera `loom-next` (el generador, sin LLM en el bucle) para ejecutar el modelo sobre GPUs AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Su relevancia es de infraestructura: permite servir un modelo de 14B cuantizado en Q4_K_M sobre hardware AMD con una API compatible con OpenAI.

El modelo subyacente es un transformer de aproximadamente 14.000 millones de parámetros, distribuido en cuantización Q4_K_M. La información disponible no detalla la arquitectura interna, los datos de entrenamiento ni el contexto máximo del checkpoint original; esta ficha se limita a lo que declara el paquete Loom y a sus mediciones de rendimiento publicadas.

El interés práctico está en las cifras de rendimiento frente a llama.cpp ROCm: en Strix Halo, Loom alcanza 25,3 tok/s de decodificación en contexto corto frente a 24,2 (+5 %), y 14,0 tok/s a 32k de contexto frente a 6,5 (+115 %). En prefill de documentos de 8k llega a 839,7 tok/s frente a 561,4 (+50 %). Las mediciones para la R9700 aún no se han repetido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle interno no disponible) |
| Parametros totales | ~14B (derivado del nombre del checkpoint; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la model card; las pruebas de rendimiento cubren hasta 32k tokens |
| Tipos de cuantizacion | Q4_K_M (unico peso incluido en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (empaquetado como programa Loom `.loom` + `model.json`) |

## Arquitectura y entrenamiento

El paquete no describe la arquitectura del checkpoint base: solo indica que envuelve el GGUF `miscii-14b-0218.i1-Q4_K_M.gguf` sin modificarlo. Por el nombre y el tamaño se trata de un transformer denso de unos 14B parámetros, pero no hay información sobre número de capas, atención, tokenizador ni contexto nativo. Tampoco se documentan tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

La innovación del paquete es el runtime, no el modelo: Loom sirve el GGUF con un pool de memoria fijado de antemano (`--pool_backing=fixed`), precarga de parámetros en host (`--parameter_mode=preload`) y espera activa de las finalizaciones de GPU (`completion_spin_ns=4294967295`). Según la metodología declarada, no hay decodificación especulativa en ninguna de las dos partes (ni cabeza MTP en el GGUF ni drafter publicado para este modelo exacto), y la comparación con llama.cpp se hizo sin barrido de ajustes en ninguno de los dos motores.

## Capacidades

- Generación de texto conversacional mediante API estilo OpenAI (`/v1/chat/completions`).
- Servicio multi-stream: la model card reporta pruebas con 4 peticiones paralelas (93,5 tok/s agregados en Strix Halo).
- Procesamiento de prompts largos: prefill medido hasta documentos de 32k tokens.
- Tool calling: no aplicable según la tabla de características del paquete.
- Razonamiento / thinking mode: no aplicable.
- Ajuste de esfuerzo de razonamiento (reasoning effort): no aplicable.
- Decodificación especulativa: no aplicable.
- Capacidades multilingües, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Servicio local de chat sobre Strix Halo: levantar un endpoint compatible con OpenAI con `loom-serve` y consumirlo desde aplicaciones existentes sin cambiar el cliente, aprovechando los 25,3 tok/s de decodificación en contexto corto.
- Asistentes con documentos largos: el rendimiento a 32k de contexto (14,0 tok/s frente a 6,5 de llama.cpp) hace viable mantener conversaciones o resúmenes sobre documentos extensos en una iGPU Strix Halo.
- Procesamiento por lotes de prompts: con 962,9 tok/s de prefill en documentos de 1k, resulta adecuado para tareas de extracción o clasificación sobre muchos textos cortos.
- Despliegue en estación de trabajo con R9700: el paquete incluye un preset específico (`chat-r9700`) para la GPU de 32 GB, pensado para entornos de escritorio profesionales con AMD.
- Servicio multiusuario ligero: los 93,5 tok/s agregados con 4 streams permiten atender a un pequeño equipo interno con un solo nodo.
- Evaluación comparativa de runtimes: sirve como referencia reproducible para medir Loom frente a llama.cpp ROCm con el mismo GGUF y los mismos prompts.

## Benchmarks y rendimiento

Rendimiento medido en AMD Strix Halo (gfx1151) el 2026-11-26, hrx-loom 0.2.0, mediana de 3 sesiones, frente a llama.cpp ROCm b1374:

| Metrica | llama.cpp | Loom | Margen |
|---|---|---|---|
| Decode tok/s, prompt corto | 24,2 | 25,3 | +5 % |
| Decode tok/s, contexto 2k | 21,7 | 23,3 | +7 % |
| Decode tok/s, contexto 32k | 6,5 | 14,0 | +115 % |
| Prefill tok/s, documento 1k | 700,7 | 962,9 | +37 % |
| Prefill tok/s, documento 2k | 684,3 | 990,2 | +45 % |
| Prefill tok/s, documento 8k | 561,4 | 839,7 | +50 % |
| Prefill tok/s, documento 16k | 438,1 | 669,9 | +53 % |
| Prefill tok/s, documento 32k | 300,3 | 530,9 | +77 % |
| 4 streams, decode agregado tok/s | 74,6 | 93,5 | +25 % |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Para la Radeon AI PRO R9700 los resultados aún no se han vuelto a medir.

## Requisitos de hardware

- GPUs objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible de forma explícita; un Q4_K_M de ~14B ocupa del orden de 8-9 GB de pesos, pero la model card no publica el consumo del pool de memoria.
- GPU consumer: no se documenta soporte para GPUs de consumo NVIDIA o AMD distintas de las dos plataformas indicadas.
- Despliegue: `hrx-loom[hf]==0.2.0` instalado con pipx; `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI como alternativas dentro del paquete (llama.cpp solo aparece como referencia de comparación).
- Throughput: 25,3 tok/s de decode en contexto corto y 962,9 tok/s de prefill a 1k en Strix Halo; sin datos para R9700.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| miscii-14b-0218-i1 (este paquete) | ~14B | no disponible (probado hasta 32k) | MIT | GGUF Q4_K_M empaquetado en Loom | Optimizado para Strix Halo y R9700 |
| mradermacher/miscii-14b-0218-i1-GGUF | ~14B | no disponible | MIT | GGUF | Checkpoint base sin empaquetar; ejecutable con llama.cpp |
| llama.cpp ROCm (runtime) | n/a | configurable (`-c 65536` en la prueba) | MIT | n/a | Referencia de rendimiento: 24,2 tok/s decode corto, 6,5 tok/s a 32k en Strix Halo |

No se dispone de datos de benchmarks de calidad para comparar con otros modelos de 14B; la comparación anterior es de empaquetado y runtime, no de capacidad.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni evaluación de alucinación del modelo base.
- Idiomas soportados no disponibles; no se puede garantizar calidad fuera del idioma principal del checkpoint original.
- Contexto máximo nativo no declarado; las pruebas llegan a 32k pero no confirman ese límite como máximo del modelo.
- Sin soporte de tool calling, thinking mode ni decodificación especulativa según la tabla de características.
- El paquete está atado a dos plataformas AMD concretas (gfx1151 y gfx1201); no hay garantía de funcionamiento en otras GPUs.
- Las cifras de rendimiento se midieron en runners de DevLab que difieren entre sesiones y con espera activa de GPU, lo que consume CPU durante la inferencia.
- Los resultados para la R9700 no se han vuelto a medir; no deben extrapolarse los de Strix Halo.
- La licencia MIT se hereda del checkpoint, pero conviene verificar las condiciones del modelo base antes de uso comercial.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/mradermacher-miscii-14b-0218-i1-loom
- Checkpoint base: https://huggingface.co/mradermacher/miscii-14b-0218-i1-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecución de referencia (DevLab Dispatch): https://github.com/loom-fun/loom-next/actions/runs/45881067723
