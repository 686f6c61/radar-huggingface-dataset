# gostar77/hy-memory-30b-a3b-radiance

## Resumen

Hy-Memory-30B-A3B Radiance es un paquete de artefactos de inferencia en formato `.rad` derivados del modelo Tencent Hy-Memory-30B-A3B, un transformer de mezcla de expertos (MoE) con 30.000 millones de parámetros totales y 3.000 millones activos por token. El modelo original, publicado por Tencent Hunyuan el 15 de octubre de 2026, está especializado en una única tarea: la ruta de escritura (*write path*) de sistemas de memoria externa de largo plazo, y se entrenó con aprendizaje por refuerzo atribuido para operar sobre varios marcos de memoria ya existentes (Mem0, MemOS y Hy-Memory). El repositorio lo mantiene el usuario individual gostar77, no Tencent, y no modifica los pesos: los reempaqueta para el motor de inferencia Radiance.

La relevancia de este repositorio es de infraestructura más que de modelado. Frente a los checkpoints habituales en safetensors o GGUF, aquí se distribuyen dos contenedores propietarios del motor Radiance: una referencia BF16 de 60,14 GB y una versión cuantizada W4 con GPTQ completo de 16,60 GB, que cabe en una GPU de consumo de 24 GB. El autor publica además mediciones de fidelidad de cuantización (KL de vocabulario completo frente a BF16, acuerdo top-1) y resultados de tareas y de uso de herramientas, lo que permite evaluar la pérdida introducida por la cuantización sin ejecutar el modelo.

El interés práctico está en la combinación de un modelo de memoria de 3B activos con un artefacto de 15,45 GiB y soporte declarado para hardware AMD RDNA4, con mediciones de throughput en una Radeon AI PRO R9700. La contrapartida es la dependencia total de un motor concreto con un plugin específico (`hyv3_bf16`) y la ausencia de validación independiente: el repositorio tiene cero descargas y cero valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) dispersa por activación, transformer; expertos enrutados más MLP denso en la capa 0, MLP compartido, router y normas |
| Parámetros totales | 30B (según la denominación del modelo base; desglose exacto no disponible) |
| Parámetros activos | 3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16; W4 con GPTQ completo (U4 asimétrico en atención y MLP denso de capa 0, I4 con signo en expertos enrutados, tamaño de grupo 128); RTN W4 como referencia comparativa |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos); avisos de software Radiance en `LICENSE-RADIANCE` y `NOTICE-RADIANCE` |
| Formato de pesos | `.rad` (contenedor del motor Radiance); no safetensors, no GGUF, no vLLM |
| Variantes incluidas | `hy-memory-30b-a3b-bf16.rad` (60.136.292.352 bytes; 56,00 GiB) y `hy-memory-30b-a3b-w4-gptq-full-1m.rad` (16.598.839.296 bytes; 15,45 GiB) |
| Tamaño total del repositorio | 76,7 GB |
| Motor de inferencia | Radiance con soporte HYV3 y plugin `hyv3_bf16` |
| Paralelismo probado | BF16 a TP2; W4 a TP1 y TP2 |

## Arquitectura y entrenamiento

El modelo base es una mezcla de expertos con activación dispersa: 30.000 millones de parámetros almacenados de los que se activan 3.000 millones por token, lo que sitúa el coste de cómputo en el rango de un modelo denso de 3B con la capacidad de representación de uno de 30B. La documentación del repositorio confirma la topología interna: atención, un MLP denso en la capa 0, expertos enrutados, un MLP compartido, router, normas, embeddings y cabeza de salida. El modelo está diseñado como escritor de memoria, es decir, recibe el contexto de una conversación o sesión y produce las operaciones de escritura sobre un almacén de memoria externo, mientras el lector de ese almacén permanece fijo durante el cálculo de recompensa. Según el informe técnico, se entrenó con aprendizaje por refuerzo atribuido sobre tres marcos de memoria preexistentes (Mem0, MemOS y Hy-Memory), con el objetivo de que un único escritor transfiera entre protocolos en lugar de especializarse en uno solo. No se dispone en la información proporcionada del número de tokens de entrenamiento, de la composición del corpus ni del detalle del pipeline de RLHF o DPO.

La innovación técnica del repositorio reside en el artefacto cuantizado, no en el modelo. La variante W4 aplica GPTQ calibrado sobre atención, el MLP denso de la capa 0 y los expertos enrutados, dejando en BF16 el MLP compartido, el router, las normas, los embeddings y la cabeza de salida, una decisión conservadora que protege los componentes sensibles a la precisión. La calibración (gramos, receta y procedencia) se publica en un repositorio de dataset independiente, lo que hace la cuantización reproducible en principio, aunque requiere el motor Radiance para reconstruir el checkpoint.

## Capacidades

- Generación de texto y escritura de memoria: produce operaciones de escritura (hechos, entidades, actualizaciones) sobre almacenes externos de largo plazo, su función principal declarada.
- Compatibilidad con marcos de memoria: entrenado explícitamente para Mem0, MemOS y Hy-Memory, lo que permite usar el mismo modelo como escritor en distintos backends.
- Razonamiento matemático: 183/200 en GSM8K (91,5 %) en la variante W4 con GPTQ completo, con decodificación voraz.
- Generación de código: 131/164 en HumanEval (79,9 %) y 173/257 en MBPP sanitizado (67,3 %).
- Tool calling y function calling: soporte de la API nativa `tools` de OpenAI, evaluado en un subconjunto de 113 casos de BFCL v3 con 105 aciertos exactos (92,9 %) en W4.
- Razonamiento multi-paso con herramientas: el conjunto de evaluación ejecuta llamadas reales contra una lista de permitidos determinista y reinyecta los resultados como mensajes de herramienta, lo que valida el bucle completo y no solo la emisión de la llamada.
- Capacidades multilingües: no disponibles en la documentación.
- Sin soporte declarado de visión, audio ni modo de razonamiento explícito (*thinking mode*).

## Casos de uso

- Escritura de memoria en agentes conversacionales multi-sesión: el modelo recibe el turno actual y el estado del almacén y emite las operaciones de alta, actualización o invalidación de hechos; su entrenamiento específico en la ruta de escritura evita reutilizar un modelo generalista para esta tarea.
- Migración entre backends de memoria: al estar entrenado sobre Mem0, MemOS y Hy-Memory, permite mantener un único escritor mientras se cambia de marco de memoria sin reentrenar el componente.
- Consolidación y deduplicación de recuerdos: con 3B activos y una variante de 15,45 GiB, puede ejecutarse en la misma máquina que el servicio de memoria para consolidar entradas antiguas en segundo plano con coste moderado.
- Extracción estructurada de hechos en pipelines de datos: la evaluación de tool calling con 92,9 % de aciertos exactos respalda su uso para generar llamadas con esquema fijo (JSON Schema) en lugar de texto libre.
- Asistente de código en producción: 79,9 % en HumanEval y soporte de function calling lo hacen utilizable en tareas de autocompletado y generación de parches integradas en un flujo de CI/CD, siempre que el motor Radiance esté disponible en el entorno.
- Despliegue en hardware AMD RDNA4: el artefacto W4 se midió en una Radeon AI PRO R9700 con 5.620,6 tokens/s de prefill y 89,94 tokens/s de decodificación, lo que abre un escenario de inferencia local en GPUs AMD de gama profesional sin depender de CUDA.
- Investigación sobre cuantización: el par BF16/W4 con métricas de KL y acuerdo top-1 publicadas sirve como caso de estudio reproducible de cuánto degrada GPTQ en un MoE con expertos cuantizados y router intacto.
- Nodos de memoria en el borde (*edge*): con 15,45 GiB, la variante W4 cabe en una GPU de 24 GB y permite mantener la memoria de un asistente personal en local, sin enviar el historial a un servicio externo.

## Benchmarks y rendimiento

Fidelidad de cuantización medida sobre 192 documentos disjuntos del origen (código, matemáticas, prosa y herramientas) y 66.086 posiciones de siguiente token, con profesor forzado. KL es de vocabulario completo frente a BF16:

| Variante | KL medio vs BF16 | Acuerdo top-1 | PPL de la variante (BF16: 4,1169) |
|---|---:|---:|---:|
| BF16 (referencia) | 0 | 100 % | 4,1169 |
| RTN W4 | 0,18494 | 89,22 % | 4,3287 |
| GPTQ W4 solo expertos | 0,16320 | 89,86 % | 4,2683 |
| GPTQ W4 completo | 0,10711 | 92,50 % | 4,1826 |

Resultados de tarea y de uso de herramientas (decodificación voraz, conjunto congelado de 113 casos de BFCL v3):

| Prueba | Resultado |
|---|---|
| GSM8K (GPTQ W4 completo) | 183/200 (91,5 %) |
| HumanEval (GPTQ W4 completo) | 131/164 (79,9 %) |
| MBPP sanitizado (GPTQ W4 completo) | 173/257 (67,3 %) |
| BFCL v3, BF16 | 104/113 (92,0 %) |
| BFCL v3, GPTQ W4 completo | 105/113 (92,9 %) |
| BFCL v3, RTN W4 | 103/113 (91,2 %) |

Throughput declarado por el autor, en una AMD Radeon AI PRO R9700 con TP1, sobre un prefill sintético de 10.015 tokens y una decodificación de 2.000 tokens: 5.620,6 tokens/s en prefill y 89,94 tokens/s en decodificación. El autor advierte explícitamente de que es una medida de throughput, no de calidad. No se han publicado resultados de benchmarks del modelo base frente a modelos de la misma categoría en la información disponible.

## Requisitos de hardware

- VRAM para BF16: el contenedor ocupa 60,14 GB (56,00 GiB); con caché KV y overhead del runtime hay que contar con más de 64 GB, por lo que en una sola GPU requiere A100 80 GB, H100 80 GB o MI300X. El autor lo probó únicamente a TP2 (dos GPUs).
- VRAM para W4 GPTQ completo: 16,60 GB (15,45 GiB) de pesos, lo que deja margen suficiente para caché KV en una GPU de 24 GB (RTX 4090, RTX 3090, RX 7900 XTX) y en tarjetas profesionales de 32 GB o más.
- Hardware validado: AMD Radeon AI PRO R9700 (RDNA4) a TP1 para el artefacto W4; el repositorio declara soporte para AMD RDNA4 entre sus etiquetas.
- Cabe en GPU de consumo: sí, la variante W4 en 24 GB; la BF16 no.
- Opciones de despliegue: exclusivamente el motor Radiance con soporte HYV3 y el plugin `hyv3_bf16` incluido. No hay artefactos para vLLM, TGI, llama.cpp, Ollama ni Transformers.
- Comando de ejemplo del autor: `radiance --model ./hy-memory-30b-a3b-w4-gptq-full-1m.rad --tp 1`.
- Latencia y throughput: 89,94 tokens/s de decodificación equivalen a unos 11,1 ms por token en el hardware medido; 5.620,6 tokens/s de prefill implican unos 1,8 s para llenar una ventana de 10.000 tokens en ese mismo equipo. Son cifras de una sola configuración y no deben extrapolarse a otras GPU.

## Comparativa con modelos similares

No se dispone en la información proporcionada de benchmarks de modelos alternativos de escritura de memoria (otros escritores para Mem0, MemOS u otros marcos), por lo que la comparación se limita a las variantes del propio repositorio y al checkpoint original:

| Artefacto | Formato | Tamaño | KL vs BF16 | Top-1 | BFCL v3 | Despliegue |
|---|---|---:|---:|---:|---:|---|
| Hy-Memory-30B-A3B original (Tencent) | safetensors / Transformers | no disponible | — | — | — | ecosistema HF, vLLM, TGI |
| `hy-memory-30b-a3b-bf16.rad` | `.rad` BF16 | 56,00 GiB | 0 | 100 % | 104/113 (92,0 %) | Radiance, TP2 probado |
| `hy-memory-30b-a3b-w4-gptq-full-1m.rad` | `.rad` W4 GPTQ | 15,45 GiB | 0,10711 | 92,50 % | 105/113 (92,9 %) | Radiance, TP1 y TP2 |
| RTN W4 (referencia interna, no distribuida como artefacto principal) | `.rad` W4 RTN | no disponible | 0,18494 | 89,22 % | 103/113 (91,2 %) | Radiance |

Frente al checkpoint original de Tencent, este repositorio no aporta pesos nuevos ni fine-tuning adicional: la diferencia es el empaquetado, la cuantización W4 calibrada y las mediciones asociadas. La ventaja es el tamaño (15,45 GiB frente a los 56 GiB en BF16) y la ligereza del runtime; la desventaja es la pérdida de portabilidad, ya que el formato `.rad` no se carga fuera de Radiance.

## Limitaciones y advertencias

- Repositorio no oficial: lo publica el usuario individual gostar77, no Tencent Hunyuan, y no consta validación por parte del autor del modelo base. Cero descargas y cero valoraciones en el momento de la ficha.
- Dependencia dura del motor Radiance: los `.rad` no son safetensors, GGUF ni checkpoints de vLLM. Sin una build de Radiance con soporte HYV3 y el plugin `hyv3_bf16`, los artefactos son inutilizables, lo que crea un riesgo de proveedor y de mantenimiento a largo plazo.
- Licencia del software distinta de la de los pesos: los pesos son Apache-2.0, pero los avisos de Radiance se distribuyen aparte en `LICENSE-RADIANCE` y `NOTICE-RADIANCE`. Antes de un uso comercial hay que revisar si el motor impone condiciones adicionales, porque el repositorio no concede derechos más allá de las licencias upstream.
- Pérdida de calidad medible pero no despreciable: el W4 GPTQ completo se queda en 92,50 % de acuerdo top-1 y sube la perplejidad de 4,1169 a 4,1826. El propio autor señala que el GPTQ completo mejora la verosimilitud agregada pero empeora en las trazas de herramientas del conjunto de evaluación.
- Sin victoria de calidad establecida: los intervalos pareados frente a RTN incluyen el cero, y la comparación GPTQ frente a RTN en BFCL da dos victorias solo de GPTQ, ninguna solo de RTN y un valor p de McNemar de 0,50. Las diferencias de tarea no son concluyentes.
- Evaluación de tool calling de alcance limitado: 113 casos de un subconjunto congelado y "seguro" de BFCL v3, con lista de permitidos determinista. La prosa de la respuesta final no se corrigió de forma independiente, así que el 92,9 % mide acierto de llamada, no corrección de la respuesta.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de calibración; en una tarea de escritura de memoria, un hecho inventado se persiste y contamina sesiones futuras, un fallo con consecuencias acumulativas.
- Idiomas y contexto sin documentar: no hay lista de idiomas soportados ni longitud de contexto declarada en la información disponible, lo que impide planificar despliegues multilingües o con historiales largos sin pruebas propias.
- Sesgos no evaluados: no se han publicado análisis de sesgo demográfico, político o cultural para este modelo ni para su base.
- Cifras de rendimiento de un solo equipo: el throughput se midió en una Radeon AI PRO R9700 a TP1 con un prefill sintético; no hay datos de latencia bajo carga concurrente ni de escalado a TP2 en decodificación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gostar77/hy-memory-30b-a3b-radiance
- Modelo base: https://huggingface.co/tencent/Hy-Memory-30B-A3B
- Dataset de calibración GPTQ: https://huggingface.co/datasets/gostar77/hy-memory-30b-a3b-gptq-calibration
- Informe técnico (PDF): https://arxiv.org/pdf/2610.22196
- Informe técnico (HTML): https://arxiv.org/html/2610.22196v1
- Ficha divulgativa del modelo: https://ai-tldr.dev/models/hy-memory-30b-a3b/
- Ficha de especificaciones y VRAM: https://apxml.com/models/hy-memory-30b-a3b
