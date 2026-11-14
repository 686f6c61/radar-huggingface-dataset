# jabbatheduck/Qwen3.8-27B-QUATt

## Resumen

Qwen3.8-27B-QUATt es un checkpoint cuantizado en formato Basalt `NVFP4_PLANES` derivado de un modelo de la familia Qwen3.5, según indican las etiquetas del repositorio. Lo publica el usuario jabbatheduck y se distribuye como un único fichero `.basalt` de 20 GB, pensado para cargarse con el motor de inferencia Basalt. El modelo parte de un checkpoint original en `compressed-tensors` NVFP4 con cuantización QUAT/QAT e incorpora pesos de decodificación especulativa DFlash/MTP, lo que explica sus tasas de aceptación de borradores en las pruebas publicadas.

La relevancia del artefacto es fundamentalmente práctica: ofrece en un solo fichero de 20 GB (17,8 GiB de VRAM cargada) un modelo de aproximadamente 27 000 millones de parámetros en precisión de 4 bits, con decodificación especulativa integrada y KV cache en int8. Según las mediciones del autor en una RTX 5090 a 475 W, alcanza 13 821 tok/s en prefill de 16 384 tokens y entre 202 y 810 tok/s en generación, dependiendo del tipo de texto.

Conviene subrayar que la información disponible es muy limitada: no hay model card del modelo base, no se especifican arquitectura exacta, longitud de contexto, idiomas ni licencia, y el repositorio no registra descargas ni interacciones. Los datos de rendimiento proceden exclusivamente de la model card del autor y comparan este checkpoint con otra variante NVFP4 del mismo modelo, no con los pesos originales en BF16 en términos de velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3_5`; presumiblemente transformer denso, sin confirmar) |
| Parametros totales | aproximadamente 27 000 millones (deducido del nombre; no confirmado en la model card) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el benchmark usa prefill de 16 384 tokens, sin confirmar que sea el máximo) |
| Tipos de cuantizacion | NVFP4 (`NVFP4_PLANES`), con KV cache int8 (`--kv int8`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Basalt `.basalt` (un unico fichero de 20 GB) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base. Las etiquetas del repositorio (`qwen3_5`, `quantized`, `nvfp4`, `speculative-decoding`) y el nombre del fichero apuntan a un modelo de la familia Qwen3.5 de aproximadamente 27 000 millones de parámetros, pero la model card no detalla número de capas, dimensión oculta, tipo de atención ni composición del dataset de entrenamiento.

El proceso que sí está documentado es el de cuantización: el checkpoint se convierte a formato Basalt `NVFP4_PLANES` a partir de un checkpoint `compressed-tensors` NVFP4 con cuantización QUAT/QAT, e incorpora pesos de decodificación especulativa DFlash/MTP. Es decir, el modelo conserva el cabezal de borrador (draft) que permite proponer varios tokens por paso y validarlos en paralelo, con longitudes de borrador medias observadas de 4,17 a 14,12 tokens según el tipo de texto. No se indica si hubo RLHF, DPO ni ninguna otra fase de alineamiento posterior.

## Capacidades

- Generación de texto en modo conversacional y en modo prosa, con velocidades medidas diferenciadas para cada uno.
- Generación estructurada (JSON, código u otros formatos con sintaxis predecible), donde la decodificación especulativa alcanza la mayor tasa de aceptación (88,9 %) y el mayor rendimiento (810 tok/s).
- Decodificación especulativa integrada mediante pesos DFlash/MTP, con aceptación de borradores entre el 39,9 % y el 88,9 % según el dominio.
- Prefill de contextos largos: 13 821 tok/s con 16 384 tokens de entrada en una RTX 5090.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling, razonamiento multi-paso, visión o audio: no disponibles en la información proporcionada.
- Modo de pensamiento (thinking): no disponible en la información proporcionada.

## Casos de uso

- Generación de JSON y salidas estructuradas en producción: el modelo rinde a 810 tok/s en modo estructurado con una aceptación del 88,9 % y longitudes de borrador de 14,12 tokens, lo que lo hace adecuado para pipelines que necesitan extraer datos en esquemas fijos con baja latencia.
- Asistentes conversacionales de baja latencia: con 253 tok/s en modo conversacional y 17,8 GiB de VRAM, cabe en una única GPU de consumo de gama alta y permite servir chat multi-turno sin clúster.
- Procesamiento de documentos largos: el prefill de 13 821 tok/s a 16 384 tokens facilita tareas de resumen, extracción o pregunta-respuesta sobre documentos extensos en una sola pasada.
- Redacción y generación de prosa a gran escala: 202 tok/s en modo prosa permite generar artículos, descripciones o correos con throughput superior al de la variante NVFP4 de referencia (171 tok/s).
- Despliegue en estaciones de trabajo con una sola GPU: el fichero de 20 GB y 17,8 GiB cargados encajan en tarjetas de 24 GB o más, lo que habilita entornos de desarrollo local con un modelo de 27 000 millones de parámetros.
- Evaluación comparativa de técnicas de cuantización: al publicarse métricas de KLD, PPL y Same Top-1 frente a BF16, sirve como referencia para medir la degradación introducida por NVFP4 en pipelines de investigación.
- Servicio de autocompletado o generación de código con formato rígido: la alta aceptación especulativa en texto estructurado reduce el coste por token en escenarios de plantillas y código.

## Benchmarks y rendimiento

Mediciones del autor en RTX 5090 a 475 W con `--kv int8`, comparando este checkpoint con la variante NVFP4 estándar del mismo modelo:

| Metrica | Qwen3.8-27B-QUATt | Qwen3.8-27B-NVFP4 |
|---|---|---|
| Tamano en disco | 20 GB | 23 GB |
| VRAM cargada (cuda0) | 17,8 GiB | 20,8 GiB |
| pp16384 (engine) | 13 821 tok/s | 11 547 tok/s (11 298 ± 21 con `--seed 1 -r 2`) |
| tg conv (`--seed 1 -r 2`) | 253 ± 8 tok/s (50,3 % accept, draft 4,82) | 229 ± 8 tok/s (51,0 % accept) |
| tg struct (`--seed 1 -r 2`) | 810 ± 1 tok/s (88,9 % accept, draft 14,12) | 710 ± 3 tok/s (86,1 % accept) |
| tg prose (`--seed 1 -r 2`) | 202 ± 2 tok/s (39,9 % accept, draft 4,17) | 171 ± 2 tok/s (40,5 % accept) |
| PPL en 20 chunks | 7,1048 ± 0,2451 | 6,9336 |
| KLD media en 20 chunks (vs BF16) | 0,03501 (mediana 0,01982, p99 0,2839, max 2,6216) | 0,02429 |
| Same Top-1 en 20 chunks | 90,61 % | 92,06 % |

No se han publicado resultados de benchmarks de calidad estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 17,8 GiB cargados en `cuda0` con KV cache int8 según el autor; el fichero en disco ocupa 20 GB.
- GPU recomendadas: RTX 5090 (plataforma de las mediciones), y por capacidad de memoria cualquier GPU con 24 GB o más (RTX 4090, RTX 3090, A10G, L4 de 24 GB, A100, H100).
- GPU de consumo: sí cabe en RTX 5090 y RTX 4090; en tarjetas de 16 GB no hay margen confirmado para el modelo cargado más KV cache.
- Opciones de despliegue: exclusivamente el motor Basalt, que requiere soporte de `compressed-tensors` NVFP4 y `NVFP4_PLANES` (PR #361). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 13 821 tok/s de prefill a 16 384 tokens; 253 tok/s en conversación, 810 tok/s en texto estructurado y 202 tok/s en prosa, todos con decodificación especulativa activa y KV cache int8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-QUATt | ~27 000 M | no disponible | Basalt NVFP4 | no disponible | 20 GB en disco, 17,8 GiB VRAM, 810 tok/s en estructurado |
| Qwen3.8-27B-NVFP4 | ~27 000 M | no disponible | Basalt NVFP4 | no disponible | 23 GB en disco, 20,8 GiB VRAM, 710 tok/s en estructurado, menor KLD |
| Modelos Qwen3.5 de ~27 000 M en BF16 | ~27 000 M | no disponible | safetensors | no disponible | Referencia de calidad frente a la que se mide la KLD, sin datos de velocidad publicados |

La comparación disponible se limita a variantes del mismo modelo base; no se han publicado comparaciones con modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- La cuantización NVFP4 introduce degradación medible: KLD media de 0,03501 frente a BF16, con un p99 de 0,2839 y un máximo de 2,6216, y una coincidencia Same Top-1 del 90,61 %.
- La perplejidad es superior a la de la variante NVFP4 estándar (7,1048 frente a 6,9336), por lo que la ganancia en velocidad y tamaño conlleva una pérdida de calidad en la distribución de salida.
- El rendimiento depende fuertemente del tipo de texto: la aceptación especulativa cae al 39,9 % en prosa, lo que reduce el throughput a 202 tok/s.
- Licencia no disponible: no puede confirmarse el uso comercial ni las condiciones de redistribución del modelo base ni del checkpoint cuantizado.
- Idiomas soportados no disponibles: no hay garantía documentada de cobertura multilingüe.
- Longitud máxima de contexto no confirmada: el benchmark usa 16 384 tokens, pero no se indica si es el límite.
- Dependencia de un motor específico (Basalt con soporte de `NVFP4_PLANES`): no hay ruta de despliegue documentada en vLLM, llama.cpp, Ollama o TGI.
- Repositorio sin descargas ni interacciones y con fecha de creación posterior a la de esta ficha: no hay validación independiente de las métricas publicadas.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jabbatheduck/Qwen3.8-27B-QUATt
- Motor Basalt: https://github.com/jesdga95/basalt
- PR de soporte NVFP4_PLANES en Basalt: https://github.com/jesdga95/basalt/pull/361
