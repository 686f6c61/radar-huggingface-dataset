# drofn/SenseNova-Loop-9B-GGUF

## Resumen

SenseNova-Loop-9B-GGUF es la version cuantizada en formato GGUF del modelo SenseNova-Loop-9B, desarrollado por el equipo SenseNova y cuantizado por el usuario drofn. Se trata de un modelo multimodal de tipo image-text-to-text con arquitectura de transformer con bucles (looped-transformer), 9.200 millones de parametros y una cabeza MTP (multi-token prediction) integrada que habilita decodificacion especulativa. El repositorio ofrece 24 niveles de cuantizacion distintos, desde Q8_0 (9,80 GB) hasta IQ2_XS (3,54 GB), generados con imatrix y siguiendo el diseno del pull request upstream #32588 de llama.cpp.

La relevancia de esta publicacion es doble: por un lado, permite ejecutar un modelo de 9B con capacidades de vision en GPUs de consumo (desde 6 GB de VRAM en adelante) mediante llama.cpp; por otro, es una de las primeras cuantizaciones que preserva la cabeza MTP del modelo original, lo que abre la puerta a decodificacion especulativa en hardware modesto. El modelo soporta ingles, chino y turco, y se distribuye bajo licencia Apache 2.0.

Un caveat importante: los archivos requieren una compilacion especifica del PR #32588 (rama `sensenova-loop` del fork `blueswhen/llama.cpp`), ya que ni llama.cpp estable, ni LM Studio ni Ollama pueden cargarlos todavia. El propio autor advierte de que el PR fue force-pusheado y que el formato podria cambiar de nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer (transformer con bucles) con cabeza MTP y soporte de vision |
| Parametros totales | 9.200.240.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Hasta 98.304 tokens medidos en IQ2_M con KV cache q8_0 y MTP activo; 49.152 en Q4_K_M; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | 24 variantes: Q8_0, Q6_K, Q5_K_M, Q5_1, Q4_K_M, IQ4_XS, Q3_K_M, IQ3_XXS, IQ2_M, IQ2_XS, entre otras |
| Idiomas soportados | Ingles, chino, turco |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con proyectores multimodales mmproj en F16 (918 MB) y Q8_0 (624 MB) |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea una arquitectura de transformer con bucles (looped-transformer), en la que ciertos bloques se reutilizan iterativamente para aumentar la profundidad efectiva sin incrementar proporcionalmente el numero de parametros. Incorpora una cabeza MTP (multi-token prediction) en el bloque 56, que permite decodificacion especulativa: el modelo predice varios tokens por paso y un verificador los valida, acelerando la generacion. El repositorio GGUF incluye esta cabeza en todos los archivos.

Los detalles sobre el dataset de entrenamiento (numero de tokens, composicion, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada. La cuantizacion se realizo con imatrix y recetas propias del autor (etiquetadas como "full", "q8_0 rule", "preset" o "none" segun el archivo), y se evaluo la divergencia KL frente a los logits en BF16 en cuatro conjuntos de prueba, ademas de una bateria de 7 comprobaciones cualitativas con el modo thinking desactivado.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, chino y turco.
- Razonamiento con modo thinking (desactivable mediante `--reasoning-format deepseek` en llama.cpp).
- Comprension de imagenes (image-text-to-text) mediante los proyectores mmproj incluidos.
- Decodificacion especulativa nativa via cabeza MTP (`--spec-type draft-mtp`).
- Soporte de plantillas Jinja (`--jinja`) para formateo de conversaciones.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documenta soporte explicito de tool calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Asistente conversacional local en GPU de consumo: con Q4_K_M (5,94 GB) cabe en una RTX 4060 de 8 GB y ofrece 49.152 tokens de contexto, suficiente para dialogos largos con historial extenso.
- Analisis de documentos e imagenes en local: el proyector mmproj Q8_0 (624 MB) permite procesar capturas, diagramas o fotos junto a texto sin enviar datos a la nube, util en entornos con requisitos de privacidad.
- Procesamiento de contexto largo en equipos modestos: IQ2_M (3,89 GB) alcanza 98.304 tokens de contexto medidos, adecuado para resumir o consultar corpus extensos en tarjetas de 8 GB.
- Prototipado de aplicaciones multilingues EN/ZH/TR: el soporte nativo de estos tres idiomas lo hace util para herramientas de traduccion o atencion al cliente en mercados turco y chino.
- Experimentacion con decodificacion especulativa: la inclusion de la cabeza MTP permite investigar y medir aceleraciones por speculative decoding en llama.cpp sin necesidad de un modelo draft separado.
- Despliegue en pipelines de investigacion sobre arquitecturas looped-transformer: sirve para comparar el comportamiento de un modelo con bucles frente a transformers convencionales de tamano similar en tareas de razonamiento.
- Inferencia en servidor ligero con llama-server: el flag `--jinja` y el formato de razonamiento deepseek facilitan integrarlo como backend compatible con APIs conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor proporciona metricas de calidad de cuantizacion (divergencia KL frente a BF16 y coincidencia del token top-1) y de velocidad:

| Metrica | Q8_0 | Q6_K | Q4_K_M | IQ4_XS | Q3_K_M | IQ2_M |
|---|---:|---:|---:|---:|---:|---:|
| Tamano (GB) | 9,80 | 7,68 | 5,94 | 5,40 | 4,92 | 3,89 |
| KLD set 1 (menor mejor) | 0,005 | 0,013 | 0,062 | 0,095 | 0,196 | 0,557 |
| Coincidencia top-1, set 1 | 97,1% | 95,1% | no disponible | no disponible | no disponible | no disponible |
| Test cualitativo (7 checks) | 7/7 | 7/7 | no disponible | no disponible | no disponible | no disponible |
| Contexto maximo medido | no probado | no probado | 49.152 | 65.536 | 81.920 | 98.304 |

Velocidad medida en RTX 4060 8 GB (c=8192, 400 tokens generados):

| Build y archivo | MTP off | MTP on |
|---|---:|---:|
| Fork antiguo con kernels CUDA mHC, archivo 8GB-v3 | 25,4 tok/s | 48,7 tok/s |
| PR #32588, Q4_K_M | 18,1 tok/s | 21,0 tok/s |
| PR #32588, IQ2_M | 22,5 tok/s | 16,6 tok/s |

## Requisitos de hardware

- VRAM estimada: desde 3,54 GB (IQ2_XS) hasta 9,80 GB (Q8_0) solo para los pesos; anadir el KV cache (q8_0 en K y V) y el proyector de vision (624-918 MB) si se usa.
- GPU recomendadas: RTX 4060 8 GB (medida por el autor), RTX 3060 12 GB, RTX 4070/4080 16 GB, A100/H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: si, desde tarjetas de 6 GB (IQ3_XXS o IQ2_M, no probado) y 8 GB (Q4_K_M, IQ4_XS, Q3_K_M, IQ2_M, medidos).
- Opciones de despliegue: exclusivamente llama.cpp compilado desde el PR #32588 (rama `sensenova-loop`); llama-server y llama-cli. No funciona en llama.cpp estable, LM Studio ni Ollama.
- Latencia y throughput: 18-22 tok/s en RTX 4060 8 GB con el build del PR; el fork antiguo con kernels CUDA alcanza 25-49 tok/s pero usa otro formato de archivo.
- El build del PR parece depender de tiempo de CPU libre; con cargas de CPU concurrentes el rendimiento cae (hasta 14-17 tok/s en Q4_K_M).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-Loop-9B (GGUF, este repo) | 9,2B | hasta 98.304 medidos (IQ2_M) | Si (mmproj) | Apache 2.0 | Requiere build del PR #32588 |
| SenseNova-Loop-9B-8GB-v3-GGUF (drofn) | 9,2B | no disponible | Si | Apache 2.0 | Fork propio con kernels CUDA, mas rapido |
| Modelos GGUF de ~9B de proposito general | ~7-9B | 32.768-131.072 tipico | Variable | Variable | llama.cpp estable, Ollama, LM Studio |

No se dispone de datos de benchmarks comparativos con otras familias de modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Requiere una compilacion no oficial de llama.cpp (PR #32588); el PR estaba abierto y sin fusionar el 2026-11-20 y fue force-pusheado, por lo que el formato puede romperse en futuras revisiones.
- Los archivos de repos anteriores del mismo autor (6GB, 8GB-v2, 8GB-v3) no cargan en este build, y estos archivos no cargan en esos forks; la interoperabilidad es fragil.
- Rendimiento mas lento que el fork propio del autor: 18-22 tok/s frente a 25-49 tok/s en RTX 4060, porque el PR no incluye kernels especificos de backend (CUDA y Vulkan son trabajo futuro).
- El comportamiento de MTP es inconsistente: mejora Q4_K_M pero empeora IQ2_M en el build del PR.
- El contexto maximo medido se obtuvo sin el proyector de vision; con vision activa el contexto disponible sera menor.
- Solo tres idiomas documentados (en, zh, tr); el rendimiento en castellano no esta verificado.
- Riesgo de alucinacion y sesgos del modelo base no documentados en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero la dependencia de un PR no fusionado anade riesgo operativo en produccion.
- Vision no evaluada en las pruebas de cuantizacion del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/drofn/SenseNova-Loop-9B-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Fork de llama.cpp con soporte: https://github.com/blueswhen/llama.cpp (rama `sensenova-loop`)
- Pull request upstream: https://github.com/ggml-org/llama.cpp/pull/32588
- Version alternativa mas rapida: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-v3-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
