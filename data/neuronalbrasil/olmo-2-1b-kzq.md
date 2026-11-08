# neuronalbrasil/Olmo-2-1b-kzq

## Resumen

`neuronalbrasil/Olmo-2-1b-kzq` es un artefacto publicado en Hugging Face por el usuario `neuronalbrasil` que toma como base el modelo `allenai/OLMo-2-0425-1B`, el modelo de lenguaje abierto de 1.485 millones de parametros desarrollado por el Allen Institute for AI (Ai2). El repositorio no contiene un modelo afinado en el sentido habitual, sino el resultado de un estudio empirico de cuantizacion e inferencia nativa realizado con el runtime propietario "Kaz", un lenguaje de sistemas compilado con JIT (Cranelift) y runtime tensorial propio, sin dependencias de PyTorch, ONNX ni llama.cpp. El autor del estudio se identifica como Armando Soares (`armandosds`).

El trabajo compara la inferencia de OLMo-2 1B en FP32 dentro de Kaz frente a la referencia GGUF de `llama.cpp` (build b9562), evaluando formatos de cuantizacion propios (`KZQ`, contenedor `.kzm`) contra formatos GGUF estandar (`F32`, `F16`, `Q4_K_M`, `Q4_0`, `Q3_K_M`). Se reportan tamanos exactos en bytes, bitrates de archivo completo en bits por peso (bpw), intervalos de confianza de Wilson al 95 %, tests de McNemar para significancia pareada y throughput de decodificacion en CPU con AVX2 bajo el protocolo `llama-bench` (-p 0 -n 64, 5 repeticiones).

La relevancia del artefacto es doble: por un lado documenta el comportamiento de OLMo-2 1B bajo cuantizacion de baja precision en CPU commodity; por otro, introduce un ecosistema de inferencia alternativo (Kaz) que reclama paridad bit a bit con GGUF F32 partiendo de los mismos safetensors. La model card esta incompleta en el momento de la consulta (se corta a mitad de la tabla de tamanos), y el repositorio registra 0 descargas y 0 likes, por lo que debe tratarse como material experimental y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-2), 16 capas, `dim = 2048`, `intermediate_size = 8192`, 16 cabezas de atencion, RMSNorm con pesos entrenables (post-attention y post-feedforward), Q/K-normalization (`q_norm`, `k_norm`), activacion SwiGLU, RoPE con theta = 500.000 |
| Parametros totales | 1.484.965.888 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base OLMo-2 1B soporta contexto largo, pero no se especifica la cifra en la model card) |
| Tipos de cuantizacion | KZQ (familia de formatos de cuantizacion por bloques alineados a SIMD AVX2/FMA, contenedor `.kzm`); GGUF `F32`, `F16`, `Q4_K_M`, `Q4_0`, `Q3_K_M` como referencia comparativa |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors FP32 sharded (origen: `model-00001-of-00002.safetensors` + `model-00002-of-00002.safetensors`, 5.939.687.552 bytes / 5.664,5 MiB); contenedor propio `.kzm` (zero-copy mmap) y GGUF |
| Vocabulario | 100.352 tokens |
| Modelo base | `allenai/OLMo-2-0425-1B` (base, no instruct) |
| Runtime de evaluacion | Kaz (lenguaje de sistemas compilado, JIT Cranelift, runtime tensorial propio, SIMD x86-64 AVX2/FMA, sin Python/PyTorch/C++) frente a `llama.cpp` b9562 |

## Arquitectura y entrenamiento

El modelo subyacente es OLMo-2 1B en su variante base (no instruct), un transformer decoder-only de 16 capas con dimension oculta 2048, tamaño intermedio 8192 y 16 cabezas de atencion. Incorpora RMSNorm con pesos entrenables tanto tras la atencion como tras el feed-forward, normalizacion adicional de queries y keys (`q_norm`, `k_norm`), activacion SwiGLU y RoPE con theta de 500.000, lo que habilita ventanas de contexto largas. El vocabulario es de 100.352 tokens y el recuento total de parametros asciende a 1.484.965.888. No se aporta en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; el modelo base de Ai2 es conocido por publicar su flujo completo (datos, codigo y pesos), pero los detalles concretos no figuran en la model card consultada.

La innovacion tecnica del repositorio no reside en el entrenamiento sino en el motor de inferencia. Kaz implementa un compilador propio, una maquina virtual de bytecode, un JIT nativo via Cranelift y un runtime tensorial independiente, con primitivas de mapeo de memoria zero-copy (`mmap`) y arenas sin locks. El formato `.kzm` actua como contenedor binario mapeable en memoria para pesos y cabeceras de cuantizacion, y `KZQ` define formatos de cuantizacion por bloques disenados para aritmetica SIMD de baja precision en CPU. El estudio verifica paridad a nivel de token entre Kaz FP32 y GGUF F32 partiendo de los mismos safetensors, y mide la retencion de precision de cada formato cuantizado contra su propia linea base sin cuantizar, con intervalos de confianza de Wilson al 95 % y tests de McNemar pareados sobre N = 100.

## Capacidades

- Generacion de texto autoregresiva en ingles y otros idiomas, heredada del modelo base OLMo-2 1B (modelo base, no afinado para instrucciones).
- Razonamiento y conocimiento general de un modelo de 1.500 millones de parametros, adecuado para tareas acotadas y no para razonamiento complejo de multiples pasos.
- Inferencia nativa en CPU x86-64 con SIMD AVX2/FMA sin dependencias de Python, PyTorch, ONNX ni llama.cpp.
- Cuantizacion de baja precision (KZQ y GGUF Q3/Q4) con medicion de retencion de precision frente a FP32.
- Ejecucion con mapeo de memoria zero-copy mediante el contenedor `.kzm`, lo que reduce la huella de RAM al cargar pesos.
- Comparabilidad directa con `llama.cpp` b9562 bajo el protocolo `llama-bench` (decodificacion de 64 tokens, 5 repeticiones).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Evaluacion de motores de inferencia alternativos: el artefacto sirve para reproducir la comparacion Kaz frente a `llama.cpp` sobre los mismos pesos y verificar paridad de tokens entre FP32 nativo y GGUF F32, util para equipos que investigan runtimes sin dependencias de Python.
- Investigacion en cuantizacion de baja precision: los formatos KZQ y los GGUF `Q3_K_M`, `Q4_0` y `Q4_K_M` permiten medir retencion de precision con tests de McNemar pareados sobre N = 100, un diseno estadistico poco habitual en model cards de cuantizacion.
- Despliegue en CPU commodity: con tamanos de 742,9 MiB (`Q3_K_M`) a 892,2 MiB (`Q4_K_M`), el modelo cabe en cualquier portatil moderno y puede ejecutarse en entornos sin GPU, lo que encaja en escenarios de edge computing y estaciones de trabajo sin acelerador.
- Auditoria de procedencia de pesos: el estudio documenta el SHA-256 del payload de cada tensor (por ejemplo, `token_embd.weight`, 822.083.584 bytes) y de cada artefacto GGUF, lo que facilita la verificacion de integridad en pipelines de suministro de software.
- Docencia y experimentacion con modelos abiertos: al ser un modelo base de 1.500 millones de parametros con licencia Apache 2.0 y pesos FP32 completos, es adecuado para cursos de arquitecturas transformer y de tecnicas de cuantizacion.
- Generacion de texto y prototipado en ingles: pese a ser un modelo base sin afinado de instrucciones, puede usarse para completar texto, generar borradores o servir de punto de partida para un fine-tuning posterior con datos propios.
- Benchmarking de hardware: el protocolo `llama-bench` (-p 0 -n 64, 5 repeticiones) permite obtener cifras de throughput de decodificacion reproducibles en maquinas con AVX2 para comparar CPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la metodologia (intervalos de confianza de Wilson al 95 %, tests de McNemar pareados, N = 100, protocolo `llama-bench`) y anuncia tablas de retencion de precision y throughput, pero el contenido proporcionado se interrumpe antes de mostrar los valores numericos, por lo que no se reproducen cifras que no constan de forma explicita.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 5.664,5 MiB en FP32 (5.939.687.552 bytes), 2.835,9 MiB en GGUF `F16`, 892,2 MiB en `Q4_K_M`, 850,9 MiB en `Q4_0` y 742,9 MiB en `Q3_K_M`.
- GPU recomendadas: no se documentan requisitos de GPU en la informacion disponible; el estudio se centra en ejecucion nativa en CPU x86-64 con AVX2/FMA.
- Compatibilidad con GPU de consumo: los formatos cuantizados Q3/Q4 caben holgadamente en cualquier GPU de consumo con 4 GB o mas de VRAM, aunque el estudio no reporta despliegue en GPU.
- Opciones de despliegue: runtime Kaz (nativo, sin dependencias) y `llama.cpp` b9562 para los artefactos GGUF. No se mencionan vLLM, TGI, Ollama ni otros servidores de inferencia.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card anuncia mediciones con `llama-bench` (-p 0 -n 64, 5 repeticiones) en maquina inactiva, pero los valores no aparecen en el extracto consultado.
- Almacenamiento: el estudio reporta tamanos en MiB binarios (1 MiB = 1.048.576 bytes) y bitrates de archivo completo en bpw calculados sobre 1.484.965.888 parametros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `neuronalbrasil/Olmo-2-1b-kzq` | 1.484.965.888 | no disponible | Apache 2.0 | Safetensors FP32, `.kzm`, GGUF | Repositorio con 0 descargas y 0 likes |
| `allenai/OLMo-2-0425-1B` | 1.484.965.888 | no disponible en la informacion | Apache 2.0 | Safetensors FP32 sharded | Repositorio oficial de Ai2 |
| `allenai/OLMo-2-0425-1B-GGUF` | 1.484.965.888 | no disponible en la informacion | Apache 2.0 | GGUF `F32`, `F16`, `Q4_K_M`, `Q4_0`, `Q3_K_M` | Repositorio oficial de Ai2 con artefactos verificados por SHA-256 |
| Tercer modelo comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a las variantes del propio OLMo-2 1B porque la informacion proporcionada no incluye datos de modelos alternativos de tamano similar (por ejemplo, Llama 3.2 1B o Qwen2.5 1.5B) que permitan contrastar parametros, contexto o rendimiento sin inventar cifras.

## Limitaciones y advertencias

- Modelo base, no instruct: no esta afinado para seguir instrucciones ni para dialogos de tipo chat; su uso directo produce continuaciones de texto, no respuestas alineadas.
- Model card incompleta: el documento se corta a mitad de la tabla de tamanos y no incluye los resultados de benchmarks, throughput ni las tablas de retencion de precision anunciadas, lo que impide validar las afirmaciones de paridad y rendimiento.
- Cero traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso o validacion independiente.
- Runtime propietario: la evaluacion depende del lenguaje Kaz y su cadena de herramientas, un ecosistema sin adopcion documentada; los formatos `.kzm` y `KZQ` no son estandar y requieren el runtime del autor.
- Riesgo de alucinacion: inherente a un modelo de 1.500 millones de parametros sin afinado de instrucciones; la generacion puede producir contenido factualmente incorrecto con fluidez.
- Idiomas: no se especifican los idiomas soportados; el modelo base de Ai2 esta orientado principalmente al ingles, con cobertura limitada de otras lenguas.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; los sesgos del corpus de entrenamiento del modelo base se heredan sin mitigacion adicional.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre los artefactos derivados ni sobre el comportamiento del runtime Kaz.
- Produccion: no recomendado como componente critico sin una evaluacion independiente de calidad, latencia y estabilidad; el estado experimental del repositorio y la falta de datos de rendimiento lo desaconsejan.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/neuronalbrasil/Olmo-2-1b-kzq
- Modelo base en Hugging Face: https://huggingface.co/allenai/OLMo-2-0425-1B
- GGUF oficiales de Ai2: https://huggingface.co/allenai/OLMo-2-0425-1B-GGUF
- Documentacion de Olmo en Ai2: https://docs.allenai.org/models/olmo/index.html
- Pagina oficial de Olmo: https://allenai.org/olmo
