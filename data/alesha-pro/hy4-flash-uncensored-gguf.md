# alesha-pro/Hy4-flash-Uncensored-GGUF

## Resumen

Hy4-flash Uncensored GGUF es una cuantización comunitaria del modelo multimodal Hy4-flash de Tencent, publicada por el usuario alesha-pro bajo el paraguas de su proyecto Project Maya. El modelo base es un transformer de tipo mixture-of-experts (MoE) de 220 000 millones de parámetros con una ventana de contexto de 262 144 tokens, capacidad de entrada de imagen y decodificación especulativa mediante múltiples tokens de predicción (MTP). Esta versión GGUF añade un vector de abliteración que proyecta fuera del flujo residual las direcciones de rechazo medidas capa a capa, reduciendo drásticamente las negativas del modelo ante peticiones que el modelo original rechazaría.

La relevancia de esta ficha reside en dos factores. Por un lado, demuestra que un modelo MoE de 220B con contexto completo de 256K y visión puede ejecutarse en hardware de consumo (una a cuatro RTX 3090) gracias a una cuantización agresiva y a una tabla Engram que puede residir en NVMe. Por otro, el autor publica métricas concretas de velocidad, calidad de cuantización y eficacia de la abliteración, lo que permite evaluar el compromiso entre fidelidad al modelo base y eliminación de rechazos.

No se dispone de información sobre los idiomas soportados ni de resultados de benchmarks de tareas estándar (MMLU, HumanEval, GSM8K) en la documentación proporcionada. El repositorio ocupa 201,7 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con hyper-connections, MTP y torre de visión (según model card) |
| Parametros totales | 220 000 millones (220B, según model card) |
| Parametros activos | no disponible |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | Q3_K (expertos Q3_K/Q4_K, atención Q8_0, capa MTP Q3_K/Q8_0/F32), IQ2 (expertos), BF16 (torre de visión) |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License, Version 1.0 (derivada de Apache 2.0 con términos adicionales para grandes negocios de Model-as-a-Service en la sección 10) |
| Formato de pesos | GGUF (trunk dividido en dos partes, tabla Engram separada, mmproj para visión) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture-of-experts de 220B parámetros según la model card del autor de la cuantización. La arquitectura incorpora hyper-connections (cuatro flujos residuales por capa, según se deduce de la descripción del vector de rechazo), una capa MTP (multi-token prediction) identificada como `blk.42` con 21 tensores, y una torre de visión separada que se distribuye como `mmproj-Hy4-flash-bf16.gguf`. El contexto nativo es de 262 144 tokens.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF, DPO u otras técnicas de alineación. La model card de esta cuantización no detalla el proceso de entrenamiento del modelo original de Tencent. La innovación técnica destacable de esta publicación es el mecanismo de abliteración: un fichero de 4 MB (`Hy4-flash-refusal-directions.bin`) que contiene direcciones de rechazo para cada capa y cada uno de los cuatro flujos de hyper-connection, y que el motor Project Maya proyecta fuera del flujo residual durante la inferencia. Los pesos permanecen intactos; la modificación es de runtime y se activa con la variable `HY4F_ABLATE`.

## Capacidades

- Generación de texto y razonamiento con ventana de contexto de 262 144 tokens.
- Procesamiento de imágenes (pipeline `image-text-to-text`): la torre de visión en BF16 se distribuye como fichero `mmproj` independiente.
- Modo de razonamiento explícito ("thinking"), con métricas de rechazo separadas para thinking on y thinking off.
- Decodificación especulativa mediante capa MTP, que acelera la generación.
- Modo "uncensored" opcional: reducción de rechazos mediante proyección de direcciones de rechazo en tiempo de inferencia.
- Soporte de API compatible con OpenAI Chat Completions en `/v1` a través del servidor de Project Maya.
- No se documenta soporte de tool calling, function calling ni capacidades de agente multi-paso en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación sobre alineación y abliteración: el fichero de direcciones de rechazo y las métricas de AdvBench y JailbreakBench permiten estudiar empíricamente cómo se distribuyen las direcciones de rechazo por capa y flujo residual, y cuantificar el coste en fidelidad (85,7 % de coincidencia en el token superior frente al 88,3 % entre dos ejecuciones del modelo original).
- Despliegue de un modelo de 220B en laboratorio con GPUs de consumo: con cuatro RTX 3090 en Q3_K se obtienen 176-251 tok/s de decodificación y 2947 tok/s de prefill, suficiente para prototipado interactivo de asistentes con contexto largo sin acceso a clústeres A100/H100.
- Procesamiento de documentos extensos con imagen: la combinación de 256K de contexto y entrada de imagen permite analizar informes, planos o capturas junto con texto largo en una sola pasada, útil para auditoría documental interna.
- Generación de texto creativo sin restricciones de contenido: el modo abliterado reduce los rechazos en un 77 % (de 139 a 32 sobre AdvBench 64 + JailbreakBench 82 con thinking off), lo que resulta adecuado para entornos de investigación creativa controlados donde el operador asume la responsabilidad del contenido.
- Evaluación comparativa de cuantizaciones: los ficheros Q3_K e IQ2 con la misma tabla Engram permiten medir el impacto de la cuantización de expertos (88,3-88,5 % de coincidencia en Q3_K frente a 74-76 % en IQ2) sobre la calidad de salida en tareas propias.
- Servicio de inferencia local con API OpenAI: el servidor `serve.server` expone `/v1` compatible con clientes existentes, lo que facilita integrar el modelo en herramientas de desarrollo sin reescribir la capa de cliente.
- Escenarios con memoria limitada: el modo Engram en NVMe con `HY4F_ENGRAM_IO=direct` permite ejecutar el modelo en una sola RTX 3090 con 45 GiB de RAM y 54-68 tok/s en IQ2, útil para estaciones de trabajo con un solo acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye métricas de velocidad, de rechazos y de fidelidad de cuantización, que se reproducen a continuación.

Rendimiento de inferencia (según model card):

| Configuracion | Decodificacion (tok/s) | Prefill (tok/s) | RAM |
|---|---:|---:|---:|
| 4x RTX 3090, Q3_K | 176-251 | 2947 | ~60 GiB |
| 2x RTX 3090, Q3_K | 70-104 | 1225 | 137 GiB |
| 2x RTX 3090, IQ2 | 95-123 | 1999 | no disponible |
| 1x RTX 3090, Q3_K | 37-54 | 1510 | 137 GiB (78 GiB con Engram en NVMe) |
| 1x RTX 3090, IQ2, Engram en NVMe | 54-68 | 1184-1199 | 45 GiB |

Rechazos en conjuntos held-out (juzgados por el modelo original):

| Conjunto | Original | Abliterado |
|---|---:|---:|
| AdvBench 64 + JailbreakBench 82, thinking off | 139 | 32 |
| AdvBench 24, thinking on | 22 | 3 |
| Peticiones inocuas 64 | 1 | 0 |

Fidelidad de cuantización (frente a la ejecución Q3_K en 4 tarjetas, 512 posiciones):

| Configuracion | Coincidencia en token superior |
|---|---:|
| 2 tarjetas, Q3_K | 88,3 % |
| 1 tarjeta, Q3_K | 88,5 % |
| Expertos IQ2 | 74-76 % |
| Dos ejecuciones del modelo original (referencia de ruido) | 88,3 % |

Coste de la abliteración: en texto largo, el token superior coincide con el modelo original en el 85,7 % de las posiciones, con una KL mediana de 0,014.

## Requisitos de hardware

- VRAM/RAM estimada: el trunk Q3_K ocupa 86,2 GB más la tabla Engram de 63,4 GB (150 GB en total); el trunk IQ2 ocupa 51,1 GB más la misma tabla Engram (115 GB en total). La torre de visión en BF16 añade 1,04 GB.
- GPU recomendadas: RTX 3090 (24 GB) en configuraciones de 1, 2 o 4 tarjetas, según las métricas publicadas. No se documentan pruebas en A100, H100, RTX 4090 ni otras GPU.
- Cabe en GPU de consumo: sí, en RTX 3090. En una sola tarjeta es necesario el modo Engram en NVMe (`HY4F_ENGRAM_IO=direct`), que reduce la RAM a 45 GiB en la configuración IQ2.
- Opciones de despliegue: exclusivamente el motor Project Maya (rama `hy4-flash`, target `maya-hy4f`), con servidor compatible con OpenAI en `/v1`. La model card indica explícitamente que llama.cpp estándar no carga el modelo. No se documenta soporte de vLLM, Ollama, TGI ni otros motores.
- Latencia y throughput: ver tabla de benchmarks. El prefill oscila entre 1184 y 2947 tok/s según configuración; la decodificación, entre 37 y 251 tok/s.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de tareas ni de especificaciones completas de modelos comparables en la información proporcionada. La siguiente tabla recoge únicamente los datos disponibles de esta publicación y de sus referencias directas.

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Hy4-flash Uncensored GGUF (esta ficha) | 220B | 262 144 | Sí | Tencent Hy License 1.0 | GGUF Q3_K/IQ2 | Abliterado, requiere Project Maya |
| tencent/Hy4-flash (base) | 220B | 262 144 | Sí | Tencent Hy License 1.0 | no disponible | Modelo original sin abliterar |
| AngelSlim/Hy4-flash-GGUF | 220B | 262 144 | Sí | Tencent Hy License 1.0 | GGUF Q3_K | Cuantización de referencia del trunk y Engram |
| AtomicChat/Hy4-flash-GGUF | 220B | 262 144 | Sí | Tencent Hy License 1.0 | GGUF IQ2 | Origen de los expertos IQ2 |

No se dispone de información sobre modelos de otros desarrolladores (por ejemplo, alternativas MoE de tamaño similar) en la documentación consultada.

## Limitaciones y advertencias

- La abliteración no elimina todos los rechazos: sobre AdvBench 64 + JailbreakBench 82 con thinking off quedan 32 rechazos de 139 originales; con thinking on, 3 de 22. El propio autor lo indica: "Most refusals are gone, not all".
- La abliteración altera la distribución de salida: el token superior coincide con el modelo original en el 85,7 % de las posiciones en texto largo, con KL mediana de 0,014. No es una copia fiel del modelo base.
- La cuantización IQ2 se aleja más del modelo original (74-76 % de coincidencia en token superior) que Q3_K (88,3-88,5 %). Para tareas sensibles a la fidelidad, Q3_K es preferible.
- El modelo solo se ejecuta con Project Maya; llama.cpp estándar no lo carga. Esto limita la portabilidad y obliga a compilar una rama específica con CUDA.
- Riesgo de alucinación: no se documenta ninguna evaluación específica. Al tratarse de un modelo de 220B con abliteración, el operador debe asumir los riesgos habituales de generación factual.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento en castellano ni en otros idiomas distintos del inglés.
- Licencia: Tencent Hy License 1.0, derivada de Apache 2.0, con términos adicionales en la sección 10 para grandes negocios de Model-as-a-Service. Es responsabilidad del operador revisar dichos términos antes de un uso comercial a escala.
- La model card no documenta soporte de tool calling ni de agentes multi-paso; no debe asumirse su disponibilidad en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-19). No hay evidencia de validación independiente por parte de terceros.
- El uso de un modelo abliterado puede incumplir políticas de plataformas o de proveedores de servicios; la responsabilidad legal y ética recae sobre el operador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/alesha-pro/Hy4-flash-Uncensored-GGUF
- Modelo base en Hugging Face: https://huggingface.co/tencent/Hy4-flash
- Cuantización Q3_K de referencia (AngelSlim): https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- Expertos IQ2 de referencia (AtomicChat): https://huggingface.co/AtomicChat/Hy4-flash-GGUF
- Motor Project Maya (rama `hy4-flash`): https://github.com/alesha-pro/project-maya/tree/hy4-flash
- Documentación de Project Maya para Hy4-flash: https://github.com/alesha-pro/project-maya/blob/hy4-flash/docs/HY4-FLASH.md
- Proyecto original Project Maya: https://github.com/mw00/project-maya
- Proyecto Strata (origen del motor): https://github.com/Niko1221/Strata
- llama.cpp y ggml: https://github.com/ggml-org/llama.cpp
