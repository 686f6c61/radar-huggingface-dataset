# jolymmiels/Inkling-2-Mini-Gate5

## Resumen

Inkling-2-Mini-Gate5 es un ajuste fino (post-entrenamiento) del modelo multimodal `thinkingmachines/Inkling-2-Mini`, publicado por el usuario `jolymmiels` bajo licencia Apache 2.0. Se trata de un modelo de arquitectura MoE dispersa (mixture of experts) con 26.400 millones de parametros totales, de los cuales 3.400 millones son parametros unicos activos y 5.400 millones efectivos por token, incluyendo una torre de vision y un nucleo central con capas intermedias repetidas en bucle (loop).

La propuesta central del autor es un post-entrenamiento con "cero parametros anadidos": el checkpoint conserva exactamente el formato nativo, el numero de tensores (1.244), las formas, los tipos de dato y el footprint de servicio del modelo base. Solo se actualizan 314 tensores nativos (194 del nucleo de control de bucle y 120 de atencion y compuertas), de modo que el modelo es intercambiable con el original en `vllm serve` y `transformers`, incluyendo la cabeza de decodificacion especulativa DSpark.

El interes del modelo radica en sus ganancias reportadas sin coste adicional de inferencia: +7,72 puntos porcentuales en micro-promedio sobre 803 items de benchmarks publicos de razonamiento, codigo e instrucciones, y +21,67 puntos en suites de ingenieria selladas, reduciendo ademas la longitud mediana de salida entre un 35 % y un 48 %. Es un caso de estudio de hasta donde llega el ajuste fino anclado por KL (SFT, DPO y GRPO con recompensas verificables) sin tocar la arquitectura ni anadir adaptadores en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE dispersa, 24 capas, con nucleo central repetido en bucle (capas 6..17, 3 pasadas) y torre de vision |
| Parametros totales | 26.388.646.440 (26,4 B) |
| Parametros activos | 3,4 B unicos; 5,4 B efectivos por token (8 de 128 expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos MoE nativos en NVFP4 (capas L0..19) y MXFP8 (capas L20..23); etiqueta de repo `8-bit`; no se detallan otras opciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); incluye `mtp.safetensors` con la cabeza especulativa DSpark |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE disperso de 24 capas con 8 de 128 expertos activados por token y un nucleo central (capas 6 a 17) que se ejecuta tres veces en bucle, con controladores de mensaje, olvido y bajada, ademas de consultas de atencion cruzada entre pasadas. El modelo incluye una torre de vision, lo que lo habilita para la tarea image-text-to-text, y una cabeza de decodificacion especulativa DSpark empaquetada como artefacto separado. Los pesos MoE se almacenan en NVFP4 y MXFP8, mientras que las capas de atencion y compuertas permanecen en BF16.

El post-entrenamiento sigue una receta por etapas estrictamente anclada por divergencia KL y sin datos de benchmarks publicos: primero SFT destilado en contexto y DPO con regularizacion KL Top-32 sobre los logits del modelo base (checkpoints Gate 2 y Gate 3); despues una interpolacion lineal de deltas de pesos (Soup50); y finalmente dos iteraciones de GRPO on-policy con recorte asimetrico DAPO Clip-Higher `[0,20, 0,28]` y `kl_coef = 0,02`, puntuadas exclusivamente con recompensas verificables de compilador, tests unitarios y comprobador de pruebas Lean 4.36 en tres dominios internos (codigo, resolucion de conflictos de busqueda y Lean). Los adaptadores LoRA (13,37 M de parametros) y los parametros del nucleo de control de bucle (28,55 M) se fusionaron directamente en los pesos BF16 nativos, sin anadir parametros de inferencia.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento formal y matematico, con mejoras reportadas en AIME 2025, GPQA Diamond y MATH-500.
- Generacion y resolucion de codigo, evaluada con tests unitarios y compilador (LiveCodeBench v6, suites de ingenieria).
- Demostracion de teoremas en Lean 4.36 como dominio de entrenamiento por refuerzo.
- Entrada de imagen y texto (pipeline image-text-to-text, torre de vision intacta).
- Soporte nativo de tool calling y parsers de razonamiento y llamadas a herramientas del modelo base en vLLM.
- Decodificacion especulativa mediante la cabeza DSpark incluida.
- Seguimiento estricto de instrucciones (IFBench en modos estricto y laxo).
- Modo de razonamiento nativo (`inkling` reasoning parser).
- Capacidades multilingues: no disponible.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD y validarse con tests unitarios automaticos, ya que fue entrenado con recompensas de compilador y pruebas; su soporte de tool calling permite invocar linters y ejecutar codigo.
- Razonamiento cientifico asistido: con una mejora de +11,62 pp en GPQA Diamond, es adecuado para responder preguntas de nivel posgrado en fisica, quimica y biologia dentro de un asistente de investigacion con verificacion humana.
- Resolucion de matematicas competitivas: el incremento en AIME 2025 (+10 pp) y MATH-500 lo hace util para tutoria automatica de problemas de olimpiada, con la salvedad de que el contexto maximo no esta documentado.
- Agentes de codificacion multi-paso: la combinacion de tool calling, modo de razonamiento y decodificacion especulativa permite construir agentes que planifican, editan ficheros y ejecutan pruebas en bucle, con menor longitud de salida y por tanto menor coste por tarea.
- Asistentes con entrada visual: al conservar la torre de vision, puede procesar capturas de pantalla, diagramas o documentos escaneados junto a texto, por ejemplo para extraer y explicar errores en imagenes de trazas.
- Verificacion formal de especificaciones: entrenado con Lean 4.36, puede emplearse como borrador de pruebas y lemas en entornos de verificacion formal, siempre con validacion por el comprobador de tipos.
- Cumplimiento estricto de instrucciones en produccion: con +8,33 pp en IFBench estricto y una reduccion de la longitud mediana de salida de 3.027 a 1.569,5 tokens, encaja en flujos con formatos de salida rigidos y presupuesto de tokens limitado.
- Despliegue drop-in sobre infraestructura existente: al mantener el mismo checkpoint y footprint, puede sustituir al modelo base en un servidor vLLM ya operativo sin cambios de configuracion.

## Benchmarks y rendimiento

Resultados publicos zero-shot sobre 803 items, `max_tokens=4096`, con prueba de McNemar de dos colas:

| Benchmark | N | Base | Gate 5 | Delta | p (McNemar) | Tokens medianos |
|---|---:|---:|---:|---:|---:|---:|
| AIME 2025 | 30 | 36,67 % | 46,67 % | +10,00 pp | 0,2500 | 4096 → 4096 |
| GPQA Diamond | 198 | 38,89 % | 50,51 % | +11,62 pp | 0,0001 | 4096 → 3060 |
| MATH-500 (slice) | 100 | 83,00 % | 86,00 % | +3,00 pp | 0,4531 | 499,5 → 435,5 |
| IFBench (estricto) | 300 | 44,67 % | 53,00 % | +8,33 pp | 0,0035 | 3027 → 1569,5 |
| IFBench (laxo) | 300 | 46,33 % | 55,67 % | +9,33 pp | 0,0009 | — |
| LiveCodeBench v6 | 175 | 37,14 % | 41,71 % | +4,57 pp | 0,0963 | 4096 → 4096 |
| Total 803 (micro) | 803 | 46,08 % | 53,80 % | +7,72 pp | < 0,0001 | 3534 → 1856 |
| Macro 5 benchmarks | 5 | 48,07 % | 55,58 % | +7,50 pp | — | densidad 2,22× |

Tareas de ingenieria selladas (120 tareas, modo RAW, sin system prompt, `max_tokens=1400`):

| Dominio | N | Base | Gate 5 | Delta | p (McNemar) | Tokens medianos |
|---|---:|---:|---:|---:|---:|---:|
| Codigo | 60 | 46,67 % | 75,00 % | +28,33 pp | 0,0001 | 1509 → 1562,5 |
| Resto de suites (busqueda y Lean) | 60 | no disponible en el extracto | no disponible en el extracto | +21,67 pp agregado en 120 tareas | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: con 26,4 B de parametros totales en BF16 serian necesarios unos 53 GB solo para pesos; con los pesos MoE en NVFP4/MXFP8 el repo ocupa 20,2 GB, por lo que un despliegue completo requiere del orden de 24-32 GB de VRAM, mas overhead de cache KV no cuantificada.
- GPU recomendadas: A100 80 GB o H100 para servicio en BF16 con contexto largo; L40S 48 GB o RTX 6000 Ada 48 GB como minimo comodo para pesos cuantizados.
- GPU de consumo: cabe en una RTX 4090 24 GB solo si el runtime respeta la cuantizacion nativa de los pesos MoE y la cache KV se mantiene pequena; no hay datos publicados de pruebas en consumer.
- Despliegue: `vllm serve` (soporta la decodificacion especulativa DSpark y los parsers nativos `inkling`) y `transformers`. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La reduccion de longitud mediana de salida (hasta -47,5 %) implica menor coste por consulta, pero no se publican metricas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Gate5 | 26,4 B | 3,4 B unicos / 5,4 B efectivos | no disponible | Apache 2.0 | Ajuste fino drop-in del base con ganancias reportadas |
| thinkingmachines/Inkling-2-Mini | 26,4 B | 3,4 B unicos / 5,4 B efectivos | no disponible | no disponible en la informacion | Modelo base; Gate5 mejora +7,72 pp micro en 803 items |
| Alternativas de ~25-30 B MoE | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de otros modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 24 de noviembre de 2026: no hay validacion independiente de los resultados reportados.
- Todos los benchmarks y ganancias proceden de la propia model card del autor; las suites de ingenieria son internas y no auditables.
- AIME 2025 (p = 0,2500), MATH-500 (p = 0,4531) y LiveCodeBench v6 (p = 0,0963) no alcanzan significacion estadistica al 5 %; las mejoras en esos benchmarks deben tomarse con cautela.
- La longitud de contexto no esta documentada, lo que impide planificar despliegues con prompts largos.
- No se declaran idiomas soportados ni evaluaciones multilingues; el rendimiento fuera del ingles es desconocido.
- Riesgo de alucinacion no cuantificado; el entrenamiento con recompensas verificables reduce errores en codigo y Lean, pero no garantiza correccion en dominios abiertos.
- El modo RAW sin system prompt usado en las suites internas puede no reflejar el comportamiento con prompts de sistema en produccion.
- Aunque la licencia es Apache 2.0, el modelo base `thinkingmachines/Inkling-2-Mini` no declara licencia en la informacion disponible; conviene verificar los terminos del base antes de uso comercial.
- El despliegue depende de la cuantizacion nativa NVFP4/MXFP8; runtimes que no la soporten pueden requerir conversion y perder las ventajas de footprint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jolymmiels/Inkling-2-Mini-Gate5
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
