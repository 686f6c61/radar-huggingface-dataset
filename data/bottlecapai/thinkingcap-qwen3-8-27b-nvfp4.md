# bottlecapai/ThinkingCap-Qwen3.8-27B-NVFP4

## Resumen

ThinkingCap-Qwen3.8-27B-NVFP4 es una version cuantizada a NVFP4 del modelo multimodal bottlecapai/ThinkingCap-Qwen3.8-27B, desarrollada por BottleCap AI. Emplea cuantizacion de solo pesos en 4 bits (esquema NVFP4A16, formato `nvfp4-pack-quantized` de compressed-tensors, con grupos de 16 elementos en FP4 y escalas en FP8) generada con la libreria llm-compressor. El objetivo es reducir la huella de memoria y elevar el rendimiento de decodificacion manteniendo la precision dentro de los intervalos de confianza de los pesos bf16 originales.

El modelo es de tipo image-text-to-text: acepta imagenes y texto como entrada y genera texto, e incorpora un modo de razonamiento (*thinking*) con esfuerzo configurable; las evaluaciones publicadas usan el esfuerzo por defecto de la plantilla de chat (`xhigh`). Se mantienen en bf16 la torre de vision, la cabeza MTP, `lm_head` y las proyecciones GDN `in_proj_a` / `in_proj_b`; solo se cuantizan los pesos de las capas lineales principales.

Con 16.713.682.560 parametros reales segun los safetensors (el nombre comercial indica 27B, una discrepancia a tener en cuenta) y 20,6 GB de repositorio, esta pensado para servirse con vLLM 0.29 sobre GPUs Hopper (mediante kernels Marlin) y Blackwell. Su relevancia actual radica en ofrecer razonamiento multimodal de contexto largo con decodificacion especulativa MTP integrada y un coste de memoria contenido, bajo licencia PolyForm Small Business 1.0.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; modelo multimodal con proyecciones GDN, cabeza MTP y torre de vision (etiqueta de arquitectura `qwen3_5`) |
| Parametros totales | 16.713.682.560 (~16,7 B) segun safetensors; el nombre del modelo indica 27B |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible; las evaluaciones incluyen AA-LCR (contexto largo) y un limite de generacion de 65.536 tokens |
| Tipos de cuantizacion | NVFP4 weight-only (NVFP4A16, `nvfp4-pack-quantized`, grupos de 16 elementos FP4 con escalas FP8); torre de vision, cabeza MTP, `lm_head` e `in_proj_a`/`in_proj_b` en bf16 |
| Idiomas soportados | No disponible |
| Licencia | PolyForm Small Business 1.0.0 + concesion de uso personal de BottleCap; materiales upstream de Qwen bajo Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de una recalibracion de pesos del modelo bf16 bottlecapai/ThinkingCap-Qwen3.8-27B mediante llm-compressor. La receta de cuantizacion deja en bf16 los componentes sensibles a la precision: la torre de vision, la cabeza MTP (*multi-token prediction*), el `lm_head` y las proyecciones GDN `in_proj_a` e `in_proj_b`. Las dos proyecciones GDN que vLLM fusiona en un unico GEMM (`in_proj_qkv` e `in_proj_z`) comparten una escala global, porque vLLM mantiene una sola escala para el GEMM fusionado y escalas separadas de-cuantizarian una de las dos con un factor demasiado pequeno.

El kernel resultante funciona en Hopper (via Marlin) y en Blackwell, y se sirve con vLLM 0.29 sin necesidad de `--trust-remote-code`. La cabeza MTP habilita decodificacion autoespeculativa: en las mediciones publicadas alcanza una longitud de aceptacion de 2,54 tokens (maximo 4) y un factor de aceleracion de 1,23x sobre la decodificacion estandar, inferior al 1,70x del modelo bf16. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generacion de texto y razonamiento explicito con modo *thinking* y esfuerzo de razonamiento configurable mediante la plantilla de chat (por defecto, `xhigh`).
- Entrada multimodal image-text-to-text: procesa imagenes junto a texto y responde en lenguaje natural; obtiene 0,825 en RealWorldQA.
- Razonamiento cientifico de nivel de posgrado: 0,864 en GPQA-Diamond con 198 preguntas y 4 semillas.
- Seguimiento de instrucciones complejas: 0,780 en IFBench (300 preguntas, 2 semillas).
- Razonamiento sobre contexto largo: 0,780 en AA-LCR con 100 preguntas de contexto largo.
- Decodificacion autoespeculativa mediante la cabeza MTP integrada, con 74,9 tok/s en H200 bajo 16 peticiones concurrentes.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado de forma explicita, aunque el modo *thinking* y la ventana de generacion de hasta 65.536 tokens lo permiten en la practica.

## Casos de uso

- Inferencia multimodal en produccion con coste de memoria reducido: al ocupar 20,6 GB de repositorio en lugar de los pesos bf16, permite servir un modelo con torre de vision en GPUs de 24-48 GB, con vLLM 0.29 y kernels NVFP4 nativos en Hopper y Blackwell.
- Asistencia tecnica sobre documentos con imagenes: informes escaneados, capturas de pantalla o diagramas tecnicos pueden enviarse junto a la pregunta; el modelo mantiene una precision de 0,825 en RealWorldQA, lo que lo hace fiable en preguntas sobre escenas y graficos.
- Analisis cientifico y de ingenieria: con 0,864 en GPQA-Diamond, es adecuado para responder consultas de nivel de posgrado en fisica, quimica y biologia dentro de un asistente de investigacion, siempre con verificacion humana de las respuestas.
- Procesamiento de expedientes y contratos de contexto largo: las 100 preguntas de AA-LCR se resuelven con 0,780 de exactitud y longitudes de respuesta de 844-920 tokens de mediana, lo que encaja en flujos de revision documental que requieren localizar y sintetizar informacion dispersa.
- Agentes que deben obedecer especificaciones estrictas: el 0,780 en IFBench indica una capacidad solida de seguir formatos, restricciones y plantillas, util en pipelines que generan JSON o informes estructurados de forma automatizada.
- Servicio de alta concurrencia con decodificacion especulativa: activando MTP se alcanzan 74,9 tok/s con 16 peticiones concurrentes en una H200 y 1,7 s por tarea en MMLU-Pro, lo que reduce el coste por consulta en endpoints de chat con razonamiento.
- Evaluacion comparativa de tecnicas de cuantizacion: al publicar la receta (`recipe.yaml`) y las mediciones bf16 frente a NVFP4 sobre cinco benchmarks, sirve como caso de referencia para validar pipelines de llm-compressor en modelos multimodales con componentes mixtos en precision.
- Clasificacion y descripcion de imagenes en catalogos: la combinacion de torre de vision en bf16 con el resto de la red cuantizada permite generar descripciones detalladas y responder preguntas sobre el contenido visual de un producto sin desplegar dos modelos separados.

## Benchmarks y rendimiento

Precision frente a los pesos bf16 de origen. `acc` es la media sobre semillas y el intervalo es del 95 % sobre las preguntas. Decodificacion con temperature 1.0, top_p 0.95, top_k 20, min_p 0.0 y limite de 65.536 tokens de generacion.

| Benchmark | ThinkingCap-Qwen3.8-27B bf16 | NVFP4 | Diferencia |
|---|---|---|---|
| MMLU-Pro (razonamiento, 1.500 preguntas, 1 semilla) | 0,841 ± 0,018 | 0,851 ± 0,018 | +0,010 |
| RealWorldQA (vision, 765 preguntas, 2 semillas) | 0,831 ± 0,024 | 0,825 ± 0,025 | -0,006 |
| GPQA-Diamond (ciencia, 198 preguntas, 4 semillas) | 0,880 ± 0,037 | 0,864 ± 0,038 | -0,016 |
| IFBench (seguimiento de instrucciones, 300 preguntas, 2 semillas) | 0,797 ± 0,040 | 0,780 ± 0,041 | -0,017 |
| AA-LCR (contexto largo, 100 preguntas, 1 semilla) | 0,810 ± 0,077 | 0,780 ± 0,081 | -0,030 |

Longitud de las respuestas (razonamiento mas respuesta) en tokens:

| Benchmark | bf16 (mediana / media) | NVFP4 (mediana / media) |
|---|---|---|
| MMLU-Pro | 166 / 1.436 | 170 / 1.330 |
| RealWorldQA | 112 / 488 | 116 / 461 |
| GPQA-Diamond | 1.045 / 7.115 | 1.136 / 6.618 |
| IFBench | 1.819 / 4.531 | 2.011 / 4.103 |
| AA-LCR | 844 / 1.718 | 920 / 1.508 |

Velocidad de decodificacion (MMLU-Pro, 32 preguntas, 1 semilla, vLLM 0.26 sobre una H200, 16 peticiones concurrentes):

| Configuracion | Tokens mediana | tok/s | s / tarea | Aceleracion MTP | accept_len (max 4) |
|---|---|---|---|---|---|
| Qwen3.8-27B base, estandar | 484 | 51,3 | 8,9 | 1,00x | — |
| Qwen3.8-27B base, MTP | 502 | 91,0 | 4,2 | 1,77x | 2,59 |
| ThinkingCap bf16, estandar | 232 | 50,5 | 3,7 | 1,00x | — |
| ThinkingCap bf16, MTP | 216 | 85,7 | 2,0 | 1,70x | 2,60 |
| NVFP4, estandar | 216 | 61,0 | 2,6 | 1,00x | — |
| NVFP4, MTP | 215 | 74,9 | 1,7 | 1,23x | 2,54 |

El propio autor advierte que la cuantizacion esta "evaluada, no demostrada sin perdida": los intervalos de confianza dejan margen para diferencias de varios puntos, y la mayor brecha observada es de 3,0 puntos en AA-LCR sobre 100 preguntas.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 20,6 GB, por lo que se necesitan al menos unos 21-22 GB solo para los pesos, mas la cache KV y los buffers de activaciones. Con 16 peticiones concurrentes sobre MMLU-Pro se midio en una H200, pero no se publica el consumo exacto de memoria.
- GPU recomendadas por el autor: familia Hopper (H100, H200) mediante el kernel Marlin y familia Blackwell de forma nativa. El autor no menciona soporte en Ampere ni en Ada Lovelace.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 ni con otras GPU Ada, ya que la model card solo cita Hopper y Blackwell. El tamano de 20,6 GB dejaria ademas muy poco margen en una GPU de 24 GB para la cache KV.
- Opciones de despliegue: vLLM 0.29 con soporte de NVFP4 (no requiere `--trust-remote-code`; las mediciones se hicieron con vLLM 0.26). Los pesos se generaron con llm-compressor. No se documenta compatibilidad con llama.cpp, Ollama ni TGI.
- Rendimiento medido: 61,0 tok/s en decodificacion estandar y 74,9 tok/s con MTP sobre una H200 con 16 peticiones concurrentes; 2,6 s/tarea y 1,7 s/tarea respectivamente en MMLU-Pro, frente a 3,7 s/tarea del modelo bf16 sin MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-27B-NVFP4 | 16,7 B (safetensors) | No disponible | 0,851 | PolyForm Small Business 1.0.0 | HuggingFace, con solicitud de acceso |
| ThinkingCap-Qwen3.8-27B (bf16) | No disponible | No disponible | 0,841 | PolyForm Small Business 1.0.0 | HuggingFace, con solicitud de acceso |
| Qwen3.8-27B base | No disponible | No disponible | No disponible | Apache-2.0 (materiales upstream de Qwen) | No disponible |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada; el autor solo publica comparaciones contra su propio modelo bf16 y contra la base Qwen3.8-27B en la tabla de velocidad.

## Limitaciones y advertencias

- El acceso al modelo es *gated*: es necesario rellenar un formulario con nombre, empresa y correo de trabajo y aceptar las condiciones antes de descargar los pesos.
- Licencia PolyForm Small Business 1.0.0 mas una concesion de uso personal de BottleCap: el uso comercial esta restringido a las empresas que encajen en la definicion de pequena empresa de la propia licencia. Conviene leer el texto completo de LICENSE antes de cualquier despliegue en produccion, y revisar el NOTICE para los materiales upstream de Qwen bajo Apache-2.0.
- Discrepancia entre el nombre comercial (27B) y el recuento real de safetensors (16,7 B): hay que verificar el presupuesto de memoria con el dato real y no con el nombre del modelo.
- El autor declara que el NVFP4 esta "evaluado, no demostrado sin perdida". La mayor caida observada es de 3,0 puntos en AA-LCR, con intervalos de confianza que no descartan diferencias de varios puntos en el resto de benchmarks.
- La aceleracion por MTP cae de 1,70x en bf16 a 1,23x en NVFP4, con una longitud de aceptacion similar (2,54 frente a 2,60). En escenarios muy sensibles al throughput conviene medir ambas configuraciones.
- Compatibilidad de hardware limitada: solo se documentan Hopper (Marlin) y Blackwell. No hay confirmacion de funcionamiento en Ampere o Ada, lo que excluye buena parte de las GPU de consumo y de centros de datos mas antiguos.
- Riesgo de alucinacion: no se publican tasas de fidelidad factual ni de calibracion; el modelo genera razonamientos largos (hasta 7.115 tokens de media en GPQA-Diamond en bf16), lo que aumenta la superficie de error en respuestas sin verificacion externa.
- Idiomas soportados no documentados: no hay lista oficial de idiomas ni evaluaciones multilingues, por lo que no se recomienda asumir un rendimiento homogeneo fuera del ingles.
- No se documenta soporte de tool calling, function calling ni de agentes, por lo que cualquier integracion de este tipo requiere validacion propia.
- El limite de generacion empleado en las evaluaciones es de 65.536 tokens; la longitud de contexto real del modelo no se especifica en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B-NVFP4
- Modelo base (bf16): https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- Licencia: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B-NVFP4/blob/main/LICENSE
- Aviso de materiales upstream: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B-NVFP4/blob/main/NOTICE
- Formulario de solicitud de acceso: https://docs.google.com/forms/d/e/1FAIpQLSdU8MyVP_mVx0_y55d6QCMXVyCKsQ6yg68KEqWm_EIptKB0Nw/viewform
- Web de BottleCap AI: https://www.bottlecapai.com/
- LinkedIn: https://www.linkedin.com/company/bottlecap-ai/
- Instagram: https://www.instagram.com/bottlecapai/
- X: https://x.com/BottleCapAI
- Contacto enterprise: mailto:enterprise@bottlecapai.com
