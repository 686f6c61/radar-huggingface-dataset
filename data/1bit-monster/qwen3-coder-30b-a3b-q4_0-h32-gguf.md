# 1bit-MONSTER/Qwen3-Coder-30B-A3B-Q4_0-H32-GGUF

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una versión cuantizada y transformada de Qwen/Qwen3-Coder-30B-A3B-Instruct, publicada por 1bit-MONSTER para su propio motor de inferencia. Se trata de un fichero GGUF en Q4_0 cuyos pesos de multiplicación matricial —incluidos los expertos del MoE— han sido rotados mediante una transformada de Walsh-Hadamard de 32 puntos (`onebit.hadamard_q4_0 = 32`). El objetivo es habilitar cálculo W4A4 (pesos de 4 bits por activaciones de 4 bits) sobre las unidades matriciales de la GPU, manteniendo las activaciones cuantizadas cerca de las del modelo completo.

El modelo está diseñado específicamente para la ruta de procesamiento de prompt del motor 1bit sobre AMD Strix Halo (Ryzen AI Max+ 395, Radeon 8060S). Su caso de uso declarado son agentes y herramientas de programación, cuyos prompts son largos: el autor recomienda emparejarlo con un GGUF ordinario del mismo modelo y enrutar a este fichero las conversaciones que arrancan con 2.048 tokens de prompt o más. La relevancia práctica está en que, a partir de 8.192 tokens de prompt, este fichero supera al Q4_K_M sobre Vulkan en velocidad efectiva, y reduce el tiempo hasta el primer token en prompts de 16K de 24,9 s a 13,8 s.

El proyecto es muy reciente (creado y actualizado el 28 de septiembre de 2026), sin descargas ni valoraciones, y su uso está fuertemente restringido: solo funciona correctamente con la compilación *lean* ROCm del motor 1bit. llama.cpp puede cargar el fichero, pero produce resultados incorrectos porque no aplica la rotación equivalente a las activaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE heredada de Qwen3-Coder-30B-A3B-Instruct (no detallada en la ficha consultada) |
| Parámetros totales | No disponible en la información proporcionada; la nomenclatura del modelo base indica ~30B |
| Parámetros activos | No disponible en la información proporcionada; la nomenclatura del modelo base indica ~3B (A3B) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | Q4_0 con rotación Walsh-Hadamard de 32 puntos en los pesos de matmul; embedding en Q4_0 sin rotar; cabeza de salida Q6_K; normas y router en F32. 4,53 bits por peso |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con el campo `onebit.hadamard_q4_0 = 32`) |
| Tamaño del fichero | 16.503 MiB |
| Cuantización de activaciones | W4A4 (4 bits) por defecto en atención y expertos |
| Motor compatible | 1bit engine, compilación *lean* ROCm (`-DONEBIT_LEAN=ON -DONEBIT_LEAN_ROCM=ON`) |
| Hash sha256 | `8aa9bf38cc9fd47cfd0b6e68ef40b79d69fde45ff3c1c903ffeec71de16b6b5f` |

## Arquitectura y entrenamiento

El autor no ha entrenado ni afinado el modelo: ha recuantizado el Q8_0 de Unsloth (revisión `b17cb02d`) mediante la herramienta `tools/hadamard_q4_0.py`. Se rotan las proyecciones de atención y los expertos enrutados (336 tensores) con una transformada de Walsh-Hadamard de 32 puntos, de modo que las activaciones de 4 bits se mantengan próximas a las del modelo completo. El token embedding queda en Q4_0 sin rotar (es una búsqueda por filas, no una multiplicación matricial), la cabeza de salida en Q6_K, y las normas y el router en F32.

La innovación técnica es doble. Por un lado, la rotación Hadamard permite ejecutar W4A4 con una degradación de precisión contenida: el KLD medio frente al Q8_0 de Unsloth sobre wikitext-2 (40 x 512; PPL del Q8_0 = 8,489) es de 0,081, frente a 0,137 del mismo esquema W4A4 aplicado sobre un Q4_0 sin rotar. Por otro, el fichero está pensado para la ruta de *prompt processing* del motor sobre ROCm, lo que acelera el prefill en prompts largos. No se aplicó imatrix a este fichero: las claves `quantize.imatrix.*` que arrastra son herencia del Q8_0 de Unsloth, y sobre un Q4_0 rotado una imatrix no tiene efecto según la documentación del motor. No se documenta ningún proceso de RLHF o DPO adicional por parte de este autor.

## Capacidades

- Generación de texto y de código: hereda las capacidades de Qwen3-Coder-30B-A3B-Instruct, orientado a programación y flujos agénticos según la ficha del autor.
- Procesamiento de prompts largos: es su ventaja principal, con W4A4 en atención y expertos sobre las unidades matriciales de la GPU.
- Flujos agénticos y herramientas de programación: el autor lo recomienda explícitamente para agentes y herramientas de código, que generan prompts largos.
- Enrutado por longitud de prompt: el motor `1bit serve` reconoce el fichero por su marca Hadamard y elige la ruta adecuada; con `--long-model` se combina con un GGUF ordinario para derivar a este fichero las conversaciones de 2.048 tokens o más.
- Soporte de *function calling* o *tool calling*: no detallado en la ficha consultada.
- Capacidades multilingües: no disponible; no se declara lista de idiomas.
- Visión, audio u otras modalidades: no disponible; el *pipeline* declarado es `text-generation`.
- Modo *thinking* explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente de código en local sobre Strix Halo: desplegado con `1bit serve` en una máquina Ryzen AI Max+ 395, el modelo cubre tareas de autocompletado y refactorización sin depender de servicios en la nube, gracias a que los 16.503 MiB de pesos caben en la memoria unificada del equipo.
- Agente de programación con contexto de repositorio: al mantener 27,0 tok/s efectivos con prompts de 8.192 tokens, permite iteraciones multi-turno con varios ficheros de código inyectados en el contexto sin que la generación se degrade como ocurre en la ruta Vulkan (20,3 tok/s).
- Generación y revisión de código en pipelines de integración continua local: para revisiones de PR con diffs extensos, el prefill a 2.048 tokens rinde 2.048 tok/s en llama-bench, lo que hace viable procesar lotes de ficheros en una máquina de desarrollo.
- Recuperación aumentada (RAG) sobre documentación técnica extensa: los prompts construidos con muchos fragmentos recuperados superan con frecuencia los 8.192 tokens, rango en el que este fichero mantiene 27,0 tok/s frente a los 20,3 tok/s del Q4_K_M sobre Vulkan.
- Servidor de inferencia mixto con dos ficheros: mediante `1bit serve -m Qwen3-Coder-30B-A3B-Instruct-Q4_K_M.gguf --long-model Qwen3-Coder-30B-A3B-Q4_0-H32.gguf` se pueden atender consultas cortas por la ruta Vulkan (71,3 tok/s a 512 tokens) y derivar las largas a este fichero, optimizando el coste por consulta.
- Procesamiento por lotes de prompts largos: tareas de análisis, resumen o extracción sobre documentos de más de 16.000 tokens, donde el primer token llega en 13,8 s en lugar de 24,9 s con la ruta alternativa.
- Generación de pruebas y documentación a partir de ficheros completos: al no necesitar trocear tanto el contexto como en modelos de ventana corta, se reduce la pérdida de coherencia entre módulos al generar documentación o suites de test de un fichero entero.

## Benchmarks y rendimiento

Datos medidos por el autor en Strix Halo el 28-09-2026. La velocidad efectiva se define como los tokens de salida divididos por el tiempo total (primer token incluido), con 256 tokens de salida y mediana de 3 ejecuciones (`tools/e2e_bench.py`), en tok/s:

| Tokens de prompt | 512 | 2.048 | 8.192 | 16.384 |
|---|---|---|---|---|
| Vulkan, Q4_K_M | 70,7 | 52,1 | 20,3 | 8,6 |
| ROCm W4A4, este fichero | 66,6 | 55,0 | 27,0 | 13,4 |
| `1bit serve --long-model` (ambos) | 71,3 | 53,1 | 25,5 | 13,1 |

Precisión y rendimiento en bruto (KLD frente al Q8_0 de Unsloth sobre wikitext-2, 40 x 512, con PPL del Q8_0 de 8,489; velocidad con llama-bench, 3 ejecuciones):

| Configuración | pp512 | pp2048 | tg128 | KLD medio | Mismo token top |
|---|---|---|---|---|---|
| Ruta int8 exacta (`GGML_W4A4_TENSORS=`) | 1.218 | 1.186 | 79,0 | 0,048 | 91,5% |
| W4A4 en atención y expertos (por defecto) | 2.156 | 2.048 | 79,2 | 0,081 | 88,7% |
| W4A4 sobre un Q4_0 sin rotar (comparación) | 2.155 | 2.058 | 79,0 | 0,137 | 85,3% |

No se han publicado en la información disponible resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, SWE-bench u otros) para este fichero ni para su modelo base.

## Requisitos de hardware

- Plataforma objetivo: AMD Strix Halo (Ryzen AI Max+ 395 con Radeon 8060S) bajo ROCm. Es el único entorno validado por el autor.
- Memoria: los pesos ocupan 16.503 MiB, por lo que se necesita al menos esa cantidad de memoria unificada disponible, más el espacio para el contexto y los búferes de activaciones.
- GPU discretas (A100, H100, RTX 4090 y similares): no disponible; la información proporcionada no describe ninguna compilación del motor para estas tarjetas.
- GPU de consumo: no soportado en esta configuración, ya que depende de una compilación *lean* ROCm del motor 1bit y de la rotación Hadamard de las activaciones.
- llama.cpp: carga el fichero, pero calcula resultados incorrectos. No es una opción de despliegue válida.
- Opciones de despliegue válidas: motor 1bit compilado con `-DONEBIT_LEAN=ON -DONEBIT_LEAN_ROCM=ON`; ejecución directa con `1bit serve -m Qwen3-Coder-30B-A3B-Q4_0-H32.gguf` o combinada con `--long-model`. No se documenta soporte para vLLM, TGI, Ollama ni otros servidores.
- Throughput medido: 79,2 tok/s en generación (tg128) y 2.156 tok/s en prefill de 512 tokens. En extremo a extremo, 55,0 tok/s con prompts de 2.048 tokens y 13,4 tok/s con prompts de 16.384.
- Latencia hasta el primer token: 13,8 s con 16.384 tokens de prompt, frente a 24,9 s de la alternativa evaluada.

## Comparativa con modelos similares

| Modelo / variante | Cuantización y ruta | Tamaño | Prefill (pp2048) | Velocidad efectiva a 2K / 8K | KLD medio | Compatibilidad | Licencia |
|---|---|---|---|---|---|---|---|
| Este fichero (Q4_0-H32) | Q4_0 rotado, W4A4, 1bit engine ROCm | 16.503 MiB (4,53 bpw) | 2.048 tok/s | 55,0 / 27,0 tok/s | 0,081 | Solo motor 1bit *lean* ROCm | Apache-2.0 |
| Qwen3-Coder-30B-A3B-Instruct Q4_K_M | GGUF estándar, Vulkan | No disponible | No disponible | 52,1 / 20,3 tok/s | No disponible | llama.cpp y derivados | Apache-2.0 |
| Q4_0 sin rotar con W4A4 | Q4_0 sin rotar, W4A4, 1bit engine ROCm | No disponible | 2.058 tok/s | No disponible | 0,137 | Motor 1bit *lean* ROCm | Apache-2.0 |
| Qwen3-Coder-30B-A3B-Instruct Q8_0 (origen, Unsloth) | Q8_0 | No disponible | No disponible | No disponible | Referencia (PPL 8,489) | llama.cpp y derivados | Apache-2.0 |

No se dispone de datos de otros modelos comparables (por ejemplo, alternativas de código de tamaño similar) en la información proporcionada, por lo que la comparación se limita a las variantes del mismo modelo base documentadas por el autor.

## Limitaciones y advertencias

- Dependencia absoluta del motor: solo funciona correctamente con la compilación *lean* ROCm del motor 1bit. Cualquier otro *runtime*, incluido llama.cpp, carga los pesos pero produce resultados incorrectos al no aplicar la rotación equivalente a las activaciones.
- Degradación por cuantización: el KLD medio frente al Q8_0 es de 0,081 y solo el 88,7% de los tokens top coinciden con la referencia. Es aceptable para generación asistida, pero conviene validar en tareas sensibles a la precisión.
- Sin imatrix efectiva: las claves `quantize.imatrix.*` del fichero son herencia del Q8_0 de origen y no tienen efecto sobre un Q4_0 rotado, según la documentación del motor.
- Idiomas: no se declara ninguna lista de idiomas soportados; el comportamiento multilingüe no está documentado.
- Contexto: no se especifica la longitud de contexto en la información disponible, por lo que no puede garantizarse el comportamiento en ventanas muy largas más allá de los 16.384 tokens medidos.
- Benchmarks de tareas: no hay resultados publicados de MMLU, HumanEval, GSM8K, SWE-bench ni similares en la información disponible; solo métricas de velocidad y divergencia respecto al Q8_0.
- Madurez del proyecto: cero descargas y cero valoraciones, con creación y última actualización el mismo día (28-09-2026). No hay validación independiente de los resultados.
- Licencia: Apache-2.0, la misma que el modelo base, lo que en principio permite uso comercial. Aun así, conviene revisar los términos del modelo Qwen3-Coder original y de la cuantización de Unsloth, así como las licencias de terceros del motor.
- Alucinación: no se documentan evaluaciones de veracidad ni mitigaciones específicas; aplican los riesgos habituales de un modelo de código cuantizado a 4 bits.
- Portabilidad: el fichero está ligado a una arquitectura de hardware concreta (Strix Halo) y a una compilación concreta del motor, lo que limita su uso en infraestructura de servidores convencional.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/1bit-MONSTER/Qwen3-Coder-30B-A3B-Q4_0-H32-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Repositorio del motor 1bit: https://github.com/1bit-MONSTER/engine
- Cuantización de origen (Unsloth): https://huggingface.co/unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF
- Licencia del modelo: https://huggingface.co/1bit-MONSTER/Qwen3-Coder-30B-A3B-Q4_0-H32-GGUF/blob/main/LICENSE
- Documentación del motor citada en la ficha: `docs/serve.md` ("Short and long prompts"), `docs/lean.md` y `tools/e2e_bench.py` dentro del repositorio del motor.

Nota sobre la búsqueda web: los resultados obtenidos (artículos genéricos sobre el término "bit" en Wikipedia y plataformas comerciales no relacionadas) no guardan relación con este modelo, por lo que no se incluyen como referencias técnicas.
