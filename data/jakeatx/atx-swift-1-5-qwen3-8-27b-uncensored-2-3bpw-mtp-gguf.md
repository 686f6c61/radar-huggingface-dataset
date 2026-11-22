# jakeatx/ATX-Swift-1.5-Qwen3.8-27B-Uncensored-2.3bpw-MTP-GGUF

## Resumen

ATX-Swift-1.5-Qwen3.8-27B-Uncensored-2.3bpw-MTP-GGUF es una cuantizacion nativa a aproximadamente 2,3 bits por peso del checkpoint BF16 Swift 1.5 Qwen3.8-27B Uncensored, publicada por el usuario jakeatx. El modelo base deriva de UkisAI's Swift 1.5, construido sobre Qwen3.8-27B, y ha sido sometido a un proceso de "abliteration" para reducir rechazos. Esta version esta disenada especificamente para tarjetas graficas de 12 GB de VRAM, permitiendo ejecutar un modelo de 27.327 millones de parametros con una ventana de contexto de 204.800 tokens mediante compresion agresiva del KV cache y decodificacion especulativa con la cabeza MTP integrada.

La relevancia de esta ficha radica en que demuestra una tendencia tecnica concreta: la re-codificacion nativa en formatos de muy baja precision (EXL3 trellis) combinada con tecnicas de compresion de KV cache (SJ-KVaRN) y drafting multi-token (MTP) para hacer viable un modelo de clase 27B en hardware de gama media. No obstante, el propio autor advierte que este build esta obsoleto y ha sido reemplazado por una version mas nueva, y que retiene aproximadamente el 85% de la puntuacion de referencia del BF16 original, por lo que no sustituye a una cuantizacion de 4 bits en una tarjeta de 24 GB.

El modelo solo funciona con el runtime llamAmpere (un fork de llama.cpp orientado a GPUs NVIDIA Ampere) y no carga en llama.cpp estandar, lo que limita su portabilidad. Requiere llamAmpere v0.5 o superior. El GGUF contiene el modelo de texto y la capa MTP de drafting, pero no incluye la torre de vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-27B) con cabeza MTP para decodificacion especulativa; re-codificacion nativa EXL3 trellis |
| Parametros totales | 27.327.153.664 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 204.800 tokens (configuracion para 12 GB con SJ-KVaRN) |
| Tipos de cuantizacion | 2,3 bpw nativo con tipos de tensor EXL3_2, EXL3_3, EXL3_4; KV cache SJ-KVaRN 3-bit K/V con cuerpo trellis; estado recurrente Gated DeltaNet a q8_0 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (un unico archivo: `ATX-Swift-1.5-Qwen3.8-27B-Uncensored-2.3bpw-MTP.gguf`, 9,00 GB / 9.003.017.888 bytes) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint BF16 `d0xin/Swift-1.5-Qwen3.8-27B-Uncensored-BF16` (revision de origen `15165fce17cb716934a2b15e746d9c7b061d4a0f`), que a su vez deriva de UkisAI's Swift 1.5 sobre Qwen3.8-27B. La arquitectura subyacente es un transformer de 27,3B parametros con una cabeza MTP (multi-token prediction) que actua como drafter especulativo. La innovacion principal de este artefacto no esta en el entrenamiento sino en la codificacion: cada peso ha sido re-codificado nativamente a ~2,3 bits por peso usando tipos de tensor EXL3 trellis, con una asignacion de bits por tensor inspirada en los modelos Mirai (Mirai S, un Qwen3.8-27B de 2,4 bits) y su port comunitario a llama.cpp por alesha-pro. El autor indica explicitamente que no se incluyen pesos de Mirai: todos los pesos proceden del BF16 de Swift 1.5.

El GGUF integra la cabeza MTP para drafting (hasta 4 tokens por paso) y esta pensado para ejecutarse con compresion de KV cache SJ-KVaRN (3 bits en K y V, cuerpo trellis, sink de 128 tokens en f16, staging tq6_0 y cola adaptativa de 4.096-8.192 tokens) y con el estado recurrente de Gated DeltaNet almacenado a 8 bits. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base. El proceso de "abliteration" (reduccion de rechazos) se aplico en el checkpoint base, no en esta cuantizacion.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso, con modo de razonamiento ("reasoning effort xhigh" en las pruebas del autor).
- Generacion de codigo, evaluada por el autor en LiveCodeBench v6 con un 77,7% agrupado sobre 7 ejecuciones en tarjetas de 12 GB.
- Razonamiento cientifico y de preguntas de opcion multiple (GPQA en el conjunto de pruebas del autor).
- Ejecucion de tareas de agente con contexto largo: en la tarea Pagoda, con 204.800 tokens de contexto, genero una pagina funcional en 3 de 3 ejecuciones usando entre 30K y 42K tokens de razonamiento por ejecucion.
- Decodificacion especulativa integrada mediante cabeza MTP (hasta 4 tokens borrador por paso).
- Capacidad multilingue: no disponible (no se documentan idiomas).
- Vision: no soportada en este GGUF (la torre de vision no esta incluida).
- Tool calling / function calling: no documentado explicitamente en la informacion disponible.
- Modo "uncensored": reduccion de rechazos respecto al modelo base, derivada del checkpoint abliterated.

## Casos de uso

- Asistencia de codigo en estaciones de trabajo con GPU de 12 GB: el modelo puede generar y razonar sobre codigo con un contexto efectivo de 204.800 tokens, adecuado para repositorios medianos o sesiones largas, aunque con una fidelidad de benchmark inferior (~85% del BF16) que conviene validar en el dominio concreto.
- Agentes autonomos de navegacion web o automatizacion de tareas: la prueba Pagoda del autor muestra que el modelo completa tareas de agente con 30K-42K tokens de razonamiento y contexto largo, lo que lo hace util para pipelines de agentes en hardware limitado.
- Analisis de documentos extensos en local: con 200K de contexto y 9 GB de pesos, permite procesar contratos, informes o bases de codigo en una unica pasada sin depender de la nube.
- Prototipado de asistentes sin censura para investigacion sobre seguridad y alineacion: el caracter abliterated permite estudiar respuestas sin rechazos, siempre que se respete la licencia y se apliquen salvaguardas externas.
- Razonamiento cientifico y resolucion de problemas de opcion multiple: el conjunto de pruebas del autor incluye GPQA, lo que sugiere uso en tareas de QA tecnico, aunque sin datos publicos de puntuacion mas alla de LiveCodeBench.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse en local con llamAmpere sobre una RTX 3060/3080 de 12 GB, los datos no salen del equipo, lo que encaja en sectores regulados.
- Evaluacion comparativa de tecnicas de cuantizacion extrema: util para investigadores que estudien el impacto de 2,3 bpw, EXL3 trellis y SJ-KVaRN en la calidad frente al BF16.

## Benchmarks y rendimiento

| Benchmark | Este modelo (2,3 bpw) | Swift 1.5 IQ4_XS-M (4,56 bpw) | Qwen BF16 (publicado) |
|---|---|---|---|
| LiveCodeBench v6 | 77,7% (agrupado, 7 ejecuciones, 12 GB) | 89,25% | 90,3% |
| Uso de tokens de salida vs Qwen3.8-27B stock a 4 bits | 0,73x (n=24, IC 90% 0,54-0,98) | 0,81x | 1,0x (referencia) |
| Razonamiento a temperatura 1.0 vs Swift 1.5 IQ4_XS-M | 1,22x (IC 90% 1,11-1,33, 348 respuestas) | 1,0x (referencia) | no disponible |
| Tarea Pagoda (contexto 204.800, presupuesto 12 GB) | 3/3 paginas funcionales, 30K-42K tokens de razonamiento | no disponible | no disponible |

El autor advierte que la comparacion entre el 77,7% y el 84,3% del modelo sucesor no es emparejada, ya que se midieron en configuraciones distintas. No se han publicado resultados de MMLU, GSM8K, HumanEval ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~9 GB para los pesos (archivo de 9,00 GB) mas el KV cache comprimido con SJ-KVaRN y la cache del drafter; el autor lo dimensiona para tarjetas de 12 GB con 204.800 tokens de contexto.
- GPU objetivo: NVIDIA Ampere, es decir, RTX 3060 12 GB, RTX 3080 12 GB y RTX 3080 Ti. El runtime llamAmpere esta orientado a la serie RTX 30.
- Cabe en GPU de consumo: si, en las tarjetas Ampere de 12 GB indicadas. No se documenta soporte para GPUs de otras arquitecturas ni para CPU.
- Opciones de despliegue: exclusivamente llamAmpere v0.5 o superior (fork de llama.cpp de JakeATX). llama.cpp estandar no carga el archivo. El modelo sucesor requiere llamAmpere v0.6.2 o superior.
- Latencia y throughput: no disponibles de forma numerica; el autor reporta que el modelo usa 0,73x los tokens de salida de Qwen3.8-27B stock a 4 bits en 24 preguntas, y que el drafting MTP genera hasta 4 tokens por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | LiveCodeBench v6 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ATX-Swift-1.5-Qwen3.8-27B-Uncensored 2,3 bpw MTP (este) | 27,3B | 204.800 | 77,7% | swift-open-license-1.0 | GGUF, solo llamAmpere |
| Swift 1.5 IQ4_XS-M (4,56 bpw) | 27,3B | no disponible | 89,25% | swift-open-license-1.0 | GGUF, llama.cpp |
| Qwen3.8-27B BF16 (referencia) | 27,3B | no disponible | 90,3% (publicado) | no disponible | safetensors |
| Mirai S (Qwen3.8-27B-S-experimental, 2,4 bits) | 27,3B | no disponible | no disponible | no disponible | formato propio y port comunitario GGUF |
| Ternary Bonsai 2 27B (referencia del autor en Pagoda) | 27B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo obsoleto: el autor lo marca como deprecado y recomienda migrar a `jakeatx/qwen3.8-27b-Swift1.5-Uncensored-ATX-AI2`, con mayor LiveCodeBench v6 (84,3%) y menor KLD. Este archivo no recibira actualizaciones.
- Perdida de calidad significativa: retiene aproximadamente el 85% de la puntuacion BF16 en LiveCodeBench v6 (77,7% frente a 90,3%). No es sustituto de una cuantizacion de 4 bits en una GPU de 24 GB.
- Dependencia de runtime no estandar: solo funciona con llamAmpere v0.5+, un fork no oficial de llama.cpp; no hay soporte en vLLM, TGI, Ollama ni llama.cpp upstream.
- Sin torre de vision: el GGUF no incluye capacidades multimodales.
- Modelo "uncensored" y abliterated: reduce los rechazos de seguridad, lo que aumenta el riesgo de generar contenido danino o inapropiado. Requiere salvaguardas externas en produccion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad ni tasas de alucinacion.
- Idiomas no documentados: se desconoce el soporte multilingue real.
- Licencia restrictiva y poco convencional: swift-open-license-1.0 (etiquetada como "other"); es necesario revisar los terminos antes de cualquier uso comercial.
- Reproducibilidad limitada: los benchmarks del autor se midieron en configuraciones no emparejadas con el modelo sucesor y con conjuntos de prueba propios (n=24, 348 respuestas), sin validacion independiente.
- Hardware restringido: sin soporte documentado fuera de NVIDIA Ampere de 12 GB; el rendimiento en otras GPUs o en CPU es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jakeatx/ATX-Swift-1.5-Qwen3.8-27B-Uncensored-2.3bpw-MTP-GGUF
- Modelo base (BF16): https://huggingface.co/d0xin/Swift-1.5-Qwen3.8-27B-Uncensored-BF16
- Swift 1.5 original de UkisAI: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Dataset de pruebas (LiveCodeBench y Pagoda): https://huggingface.co/datasets/jakeatx/ATX-Swift-1.5-Qwen3.8-27B-Uncensored-2.3bpw-LiveCodeBench-Pagoda
- Runtime llamAmpere: https://github.com/JakeATX/llamAmpere
- Release llamAmpere v0.6.2: https://github.com/JakeATX/llamAmpere/releases/tag/v0.6.2
- Modelo sucesor recomendado: https://huggingface.co/jakeatx/qwen3.8-27b-Swift1.5-Uncensored-ATX-AI2
- Mirai S (referencia de formato): https://huggingface.co/trymirai/Qwen3.8-27B-S-experimental
- Port comunitario Mirai a GGUF: https://huggingface.co/alesha-pro/Qwen3.8-27B-S-mirai-GGUF
