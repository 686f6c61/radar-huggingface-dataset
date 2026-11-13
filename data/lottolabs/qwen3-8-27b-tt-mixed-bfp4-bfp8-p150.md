# Lottolabs/Qwen3.8-27B-TT-Mixed-BFP4-BFP8-P150

## Resumen

Qwen3.8-27B-TT-Mixed-BFP4-BFP8-P150 es un checkpoint cuantizado y un runtime a medida derivado de Qwen/Qwen3.8-27B, publicado por Lottolabs para su ejecucion exclusiva sobre una tarjeta Tenstorrent Blackhole P150. No se trata de un modelo nuevo ni de un formato estandar de cuantizacion: es una adaptacion hardware-especifica que combina pesos en precision mixta BFP4/BFP8 generados mediante GPTQ con un runtime propio (ttnn/tt-metal) que implementa decodificacion especulativa DFlash2, prefix caching y verificacion compartida entre peticiones.

El modelo base es un transformer multimodal de 27.000 millones de parametros con entrada de texto, imagen y video, y una ventana de contexto nativa de 262.144 tokens. La release documentada como `s27v7-20261112` no modifica los tensores del checkpoint (manifest sha256 `47b781ab…`) sino el runtime: introduce rondas de verificacion compartidas que permiten a varios usuarios decodificar simultaneamente con especulacion, ademas de corregir un cuelgue latente del dispositivo en la barrera atomica NoC previa a la LM head.

Su relevancia es acotada pero clara: demuestra que un modelo de 27B con contexto de 262K y capacidades de vision puede servirse en una unica tarjeta Tenstorrent con aceleracion especulativa multiusuario, con ganancias medidas de hasta 2,35x en throughput agregado respecto a la release anterior. Es una publicacion experimental de comunidad, no oficial de Qwen ni de Tenstorrent, y no es compatible con `transformers.from_pretrained()` ni con Inference Providers alojados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B con capas GDN (recurrentes) y atencion con page table por peticion; runtime ttnn/tt-metal |
| Parametros totales | 27.000 millones (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos; perfiles de servicio 8K, 128K y 262K |
| Tipos de cuantizacion | BFP4/BFP8 en precision mixta, generados con GPTQ; no es GGUF, AWQ, int4 GPTQModel, bitsandbytes ni NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint especifico para Tenstorrent; tamano del repo 92,5 GB) |

## Arquitectura y entrenamiento

El checkpoint deriva de Qwen/Qwen3.8-27B, revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`. La arquitectura combina capas de atencion con capas GDN (recurrentes con estado por peticion), lo que obliga al runtime a gestionar estados recurrentes de 48 capas por solicitud. La cuantizacion es en precision mixta BFP4/BFP8 obtenida mediante GPTQ, un formato nativo del hardware Tenstorrent que no sigue los esquemas habituales de la comunidad (GGUF, AWQ, bitsandbytes, NVFP4).

La innovacion principal esta en el runtime, no en los pesos. DFlash2 implementa decodificacion especulativa con profundidades de borrador de 0 a 7 tokens por peticion, planificadas segun la tasa de aceptacion medida y el coste del paso. La release `s27v7` introduce rondas de verificacion compartidas: un paso de decodificacion verifica simultaneamente todas las peticiones greedy en curso, encadenando las filas de cada peticion desde su propio estado recurrente y leyendo su historial KV mediante su propia page table, con rollback al prefijo aceptado. Ademas, un pase del drafter genera borradores para hasta 4 peticiones a la vez, cada una con su contexto de 2.048 filas, de modo que los pesos del drafter se leen una sola vez por pase. El resultado es exacto respecto a la configuracion sin especulacion: mismos token ids, mismo texto, mismo finish reason y mismas tool calls, verificado sobre HTTP en 45/45 comprobaciones con 4 usuarios y 81/81 con 8 usuarios.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activable (`chat` y `gsm8k` se evaluan con thinking on).
- Entrada multimodal de imagen y video, con pipeline `image-text-to-text`.
- Contexto largo nativo de 262.144 tokens, con prefix caching para reutilizar prefijos entre peticiones.
- Tool calling y function calling, con paridad verificada entre modo con y sin especulacion.
- Generacion de codigo y edicion de codigo (workload `code_edit`: reescritura de un fichero Python con una edicion pequena).
- Razonamiento matematico (workload `gsm8k` en las pruebas del autor).
- Servicio multiusuario concurrente (perfiles de 1, 2, 4 y 8 usuarios) con especulacion activa en todos ellos.
- Muestreo con semilla (seeded sampling) y cadenas de parada (stop strings) con paridad exacta verificada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo gestiona conversaciones multi-turno con contexto de hasta 262K tokens, lo que permite mantener historial completo de cliente, documentacion de producto y transcripciones previas en una sola ventana, con prefix caching para abaratar turnos sucesivos sobre el mismo prefijo.
- Generacion y edicion de codigo en produccion: el workload `code_edit` demuestra reescritura de ficheros Python con ediciones pequenas; combinado con tool calling, encaja en pipelines que aplican parches sobre repositorios y verifican resultados.
- Analisis de documentos e imagenes combinados: al aceptar entrada image-text-to-text, sirve para extraer datos de facturas, capturas o diagramas junto a texto de referencia, sin pipeline separado de OCR.
- Procesamiento de video con contexto largo: la entrada de video junto a 262K de contexto permite resumir o interrogar grabaciones extensas manteniendo la transcripcion y los fotogramas relevantes en la misma ventana.
- Razonamiento matematico asistido: el modo thinking con `gsm8k` esta entre los workloads medidos, adecuado para tutoria o verificacion de calculos paso a paso en entornos educativos.
- Servicio multiusuario en infraestructura Tenstorrent: con `--users 4` u `--users 8` en perfil 8K, varios usuarios decodifican con especulacion a la vez; el benchmark reporta 42,2 tok/s agregados con 1 usuario y 61,9 tok/s con 2 usuarios en el servidor de 4, frente a 18,0 y 35,5 tok/s en la release anterior.
- Despliegue en borde o centro de datos con una sola tarjeta: al caber en una unica Blackhole P150, sirve para escenarios donde no se quiere un clúster GPU multi-tarjeta pero se necesita contexto largo y vision.

## Benchmarks y rendimiento

Rendimiento HTTP medido por el autor, perfil 8K, greedy, 256 tokens por peticion, todas las peticiones arrancan juntas, mediana de 3 ejecuciones (tok/s agregados incluyen prefill):

| Servidor | Workload | Usuarios | s27v6 total tok/s | s27v7 total tok/s | Aceleracion | s27v6 por usuario | s27v7 por usuario |
|---|---|---:|---:|---:|---:|---:|---:|
| `--users 4` | chat | 1 | 18,0 | 42,2 | 2,35x | 18,2 | 43,5 |
| `--users 4` | chat | 2 | 35,5 | 61,9 | 1,74x | 18,2 | 35,2 |
| `--users 4` | chat | 4 | 68 | no disponible en el extracto | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; los datos anteriores son exclusivamente de throughput de servicio.

## Requisitos de hardware

- Tarjeta objetivo: una unica Tenstorrent Blackhole P150. El checkpoint esta compilado y validado para ese hardware concreto.
- VRAM estimada: no disponible; el repo pesa 92,5 GB y el modelo se sirve con precision mixta BFP4/BFP8 en memoria del acelerador.
- GPU: no aplica. No hay soporte documentado para A100, H100, RTX 4090 ni otras GPU NVIDIA o AMD; las rutas de lanzamiento estandar (`transformers.from_pretrained()`, Inference Providers alojados) no estan soportadas.
- Despliegue: runtime propio basado en ttnn y tt-metal, con imagenes de runtime por perfil (`ctx5-s27v7` para 8K y 128K; la imagen de 262K permanece en `s27v6`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput medido: 43,5 tok/s por usuario con 1 usuario en servidor de 4 y 35,2 tok/s por usuario con 2 usuarios; 42,2 y 61,9 tok/s agregados respectivamente.
- Estabilidad: tras el parche de drenaje de transacciones NoC, unas 12.800 rondas compartidas y unas 24.600 pasos multiusuario sin cuelgues, mas 200.000 repeticiones del bloque norm + LM head.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Hardware objetivo | Formato |
|---|---|---|---|---|---|---|
| Lottolabs/Qwen3.8-27B-TT-Mixed-BFP4-BFP8-P150 | 27B | 262.144 | Si (imagen y video) | Apache 2.0 | Tenstorrent Blackhole P150 | safetensors BFP4/BFP8 + runtime propio |
| Qwen/Qwen3.8-27B (base) | 27B | 262.144 | Si (imagen y video) | Apache 2.0 | GPU generica | safetensors Transformers |
| Versiones GGUF/AWQ del mismo base | 27B | 262.144 | Si (imagen y video) | Apache 2.0 | CPU/GPU consumer | GGUF, AWQ |
| s27v6 (release anterior de Lottolabs) | 27B | 262.144 | Si (imagen y video) | Apache 2.0 | Tenstorrent Blackhole P150 | safetensors BFP4/BFP8 + runtime propio |

No hay datos de benchmarks de calidad que permitan comparar rendimiento cognitivo frente a alternativas; la comparacion disponible es de formato, hardware y throughput de servicio.

## Limitaciones y advertencias

- Publicacion experimental de comunidad (Lottolabs); no es una release oficial de Qwen ni de Tenstorrent y no debe tratarse como referencia de soporte.
- Solo funciona en una Tenstorrent Blackhole P150 con el runtime propio; no es portable a GPU ni a stacks estandar de inferencia.
- El formato de pesos no es GGUF, AWQ, AutoGPTQ/GPTQModel int4, bitsandbytes ni NVFP4, lo que rompe la interoperabilidad con el ecosistema habitual.
- El perfil de 262K sigue en la imagen `s27v6`, que conserva el riesgo latente de cuelgue en la barrera atomica NoC previa a la LM head (observado aproximadamente una vez cada 20.000 pasos de decodificacion); el parche solo esta en la imagen `ctx5-s27v7` de 8K y 128K.
- La causa raiz del cuelgue es una inferencia a partir del triaje del dispositivo y del codigo de los kernels, no una prueba concluyente.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Idiomas soportados: no disponible; no se documenta cobertura multilingue.
- Aunque la licencia es Apache 2.0, la viabilidad en produccion depende de hardware Tenstorrent y de un runtime mantenido por un tercero, con 0 descargas y 2 likes en el momento de la consulta.
- Las pruebas de exactitud comparan contra la misma configuracion del servidor con especulacion desactivada, no contra el modelo base en otro hardware.

## Enlaces

- Hugging Face: https://huggingface.co/Lottolabs/Qwen3.8-27B-TT-Mixed-BFP4-BFP8-P150
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Evidencias de release incluidas en el repo: `evidence/s27v7/gates-built-image/gates.log`, `evidence/s27v7/gates-built-image/u4chk/gate.json`, `evidence/s27v7/gates-built-image/u8chk/gate.json`
- Evidencias de estabilidad: `evidence/s27v7/hang/stress1.triage.txt`, `evidence/s27v7/hang/stress3.json`, `evidence/s27v7/hang/stress4.json`, `evidence/s27v7/hang/nlstress_drained.log`
- Evidencias de paridad de modelo: `evidence/s27v7/model-level/su_ref2.json`, `evidence/s27v7/model-level/su_ref3.json`
- Benchmarks HTTP: `evidence/s27v7/http-bench/bench.log`
- Paper, blog, repositorio de codigo y demo: no disponible
