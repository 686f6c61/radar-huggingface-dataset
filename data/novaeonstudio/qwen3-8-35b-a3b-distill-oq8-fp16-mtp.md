# NovaeonStudio/Qwen3.8-35B-A3B-Distill-oQ8-fp16-mtp

## Resumen
El modelo `NovaeonStudio/Qwen3.8-35B-A3B-Distill-oQ8-fp16-mtp` es una cuantizacion en formato oMLX (8 bits, escalas fp16) del modelo `empero-ai/Qwen3.8-35B-A3B-Distill`, una destilacion de los profesores de la familia Qwen3.8 (Qwen3.8 2.4T-A95B y Qwen3.8 Flash Next) sobre la arquitectura MoE dispersa Qwen3.6-35B-A3B. Lo publica NovaeonStudio, un estudio centrado en ejecucion local de agentes sobre Apple Silicon, y su proposito es ofrecer razonamiento destilado de gama alta a 8 bits en el motor oMLX, con un perfil de servicio afinado y documentado.

Tecnicamente es un MoE de 35.951.822.704 parametros totales y aproximadamente 3.000 millones activos, con 256 expertos (8 enrutados), 40 capas y atencion hibrida (lineal GDN mas atencion completa), ademas de un encoder de vision conservado del modelo base. La ventana de contexto nativa es de 262.144 tokens y el checkpoint incluye una cabeza MTP (multi-token prediction) nativa que, segun el autor, acelera realmente la decodificacion bajo esta cuantizacion.

Su relevancia actual es doble: por un lado, acerca razonamiento destilado con soporte de tool calling y vision a equipos de consumo Apple Silicon; por otro, documenta un perfil de inferencia medido (MTP on, draft 6, ANE-prefill off) que sirve como referencia reproducible para despliegues locales con agentes. Es una publicacion reciente (creada el 17 de septiembre de 2026) con traccion todavia muy baja (0 descargas, 1 like).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE de la familia Qwen3.5/3.6 + encoder de vision; atencion hibrida (GDN lineal + atencion completa); 40 capas; 256 expertos con 8 enrutados |
| Parametros totales | 35.951.822.704 (~35,9 B) |
| Parametros activos | ~3 B (aproximadamente 3.000 millones) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | oQ8 (8 bits casi uniforme, router en fp16), group size 64, escalas y pesos no cuantizados en float16; ~8,6 bpw efectivos. Otros formatos: no disponible |
| Idiomas soportados | en (ingles, declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato nativo oMLX (libreria MLX); tamano del repo 39,5 GB |
| Entradas/salidas | image-text-to-text (texto e imagen de entrada, texto de salida) |
| Motor de inferencia | oMLX (Apple MLX), motor VLM |
| Cabeza MTP | Nativa, incluida en el checkpoint (`mtp.*` en `model.safetensors.index.json`); reconocida por oMLX (`mtp_compatible: true`) |

## Arquitectura y entrenamiento
La base es un transformer MoE disperso de la familia Qwen3.6-35B-A3B: 40 capas con 256 expertos y 8 expertos enrutados por token, lo que da 35,9 B de parametros totales con unos 3 B activos por token. La atencion es hibrida: combina capas de atencion lineal GDN con capas de atencion completa, lo que reduce el coste de la cache KV y explica, segun el autor, el tamano reducido de KV observado en produccion. El modelo conserva el encoder de vision del base, por lo que mantiene la modalidad image-text-to-text. Sobre el checkpoint se anade una cabeza MTP nativa para decodificacion especulativa.

En cuanto al entrenamiento, la informacion disponible indica que `empero-ai/Qwen3.8-35B-A3B-Distill` se obtuvo por destilacion (SFT sobre trazas de chain-of-thought de los profesores Qwen3.8 2.4T-A95B y Qwen3.8 Flash Next, con mayor peso en matematicas y codigo). No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO. El autor si documenta un comportamiento derivado del entrenamiento: cada respuesta se abre con un bloque `<think>` servido como `reasoning_content`, desactivable con `enable_thinking: false`. Esta publicacion concreta no reentrena el modelo, sino que aplica una cuantizacion oQ8 con router en fp16 y un perfil de servicio optimizado (MTP activado, 6 tokens de draft, ANE-prefill desactivado, cuantizacion KV de 8 bits).

## Capacidades
- Generacion de texto y razonamiento con bloque de pensamiento explicito (`<think>`), desactivable mediante `enable_thinking: false`.
- Razonamiento matematico y de codigo reforzado por el sesgo del dataset de destilacion (traza de profesores con mayor peso en math/code).
- Tool calling y function calling: la model card reporta 6/6 en su suite de pruebas controlada (seleccion de herramienta, llamadas paralelas, cadenas secuenciales, fidelidad de argumentos, abstencion correcta y ausencia de herramientas alucinadas).
- Comportamiento agentico multi-paso orientado a flujos de agente locales.
- Capacidades de vision conservadas del modelo base (entrada de imagen + texto a texto).
- Cumplimiento de instrucciones medido localmente con IFEval sobre estos pesos cuantizados (84,86 de media, pensamiento desactivado).
- Decodificacion especulativa funcional mediante cabeza MTP nativa.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso
- Agentes locales sobre Apple Silicon: el modelo esta empaquetado en formato oMLX y su perfil optimo esta documentado, por lo que puede ejecutarse como trabajador de razonamiento en un Mac con memoria unificada amplia, gestionando cadenas de herramientas con contexto de hasta 262.144 tokens.
- Automatizacion de atencion al cliente multi-turno: la ventana nativa de 262.144 tokens permite mantener historiales largos y documentacion adjunta en el mismo contexto, y el modo `enable_thinking: false` reduce latencia en respuestas conversacionales directas.
- Asistencia de codigo integrada en el IDE o en pipelines: el modelo puede invocarse mediante tool calling y function calling, y su entrenamiento ponderado hacia codigo lo hace apto para generacion, refactorizacion y explicacion de fragmentos.
- Automatizacion de tareas con navegador o APIs internas: con tool selection y llamadas paralelas verificadas, encaja como planificador que decide que herramienta invocar y con que argumentos.
- Analisis de documentos con imagenes: al conservar el encoder de vision, puede extraer informacion de capturas, diagramas o formularios escaneados combinados con texto.
- Procesamiento por lotes de instrucciones estructuradas: su IFEval de 84,86 (medido en estos pesos) lo hace util para tareas de transformacion de texto con formato y restricciones estrictas.
- Prototipado e investigacion local sin dependencia de la nube: al ser apache-2.0 y ejecutarse en el propio equipo, sirve para experimentar con agentes y destilacion sin coste por token.

## Benchmarks y rendimiento
Los siguientes datos son los publicados por el autor y medidos en un Apple M5 Max de 128 GB con oMLX, sobre estos pesos exactos y con el perfil optimo (pensamiento desactivado). No proceden de una evaluacion independiente.

Rendimiento de decodificacion y tiempo hasta el primer token segun contexto:

| Contexto de prompt | ~0 | ~3,9k | ~7,9k | ~15,9k | ~31,9k | ~64,7k |
|---|---|---|---|---|---|---|
| Decode (tok/s) | 93 | 81 | 82 | 69 | 57 | 41 |
| TTFT (s) | 0,30 | 1,4 | 1,4 | 2,0 | 2,2 | 3,7 |

El autor indica ademas una carga en frio de aproximadamente 1 segundo con registro caliente, y un pico de ~110 tok/s en contexto corto con MTP y 6 tokens de draft en condiciones ideales.

IFEval sobre estos pesos cuantizados (541 prompts, 834 instrucciones, verificador oficial, pensamiento desactivado):

| Metrica | prompt-strict | prompt-loose | inst-strict | inst-loose | Media |
|---|---|---|---|---|---|
| Qwen3.8-35B-A3B-Distill oQ8-fp16-mtp | 80,22 | 83,92 | 86,33 | 88,97 | 84,86 |

Prueba agentica propia del autor: 6/6 (temperatura 0) en seleccion de herramienta, llamadas paralelas, cadenas secuenciales, fidelidad de argumentos, abstencion sin herramienta necesaria y ausencia de herramientas alucinadas. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar comparables.

## Requisitos de hardware
- Memoria: los pesos ocupan aproximadamente 39,5 GB en disco (oQ8, ~8,6 bpw). Con cache KV en 8 bits y contexto moderado, se recomienda un equipo con al menos 48 GB de memoria unificada; la referencia medida por el autor es un Apple M5 Max con 128 GB.
- GPU compatibles: al estar en formato MLX, la ejecucion esta pensada para Apple Silicon. No se documenta soporte CUDA, por lo que no aplica a A100, H100, RTX 4090 ni similares en esta publicacion concreta.
- Cabe en GPU de consumo: no en el sentido habitual (GPU discreta), pero si en equipos Apple Silicon de gama alta con memoria unificada suficiente (M-series Max/Ultra). El autor mantiene los expertos residentes (`moe_expert_offload_enabled: false`) porque considera 128 GB suficientes.
- Opciones de despliegue: oMLX es el motor de referencia (motor VLM de Apple MLX). El ajuste de servicio recomendado es `mtp_enabled: true`, `mtp_num_draft_tokens: 6`, `qwen35_ane_prefill_enabled: false`, `turboquant_kv_enabled: true` con 8 bits, `qwen35_oq_a8_enabled: false`, `dflash_enabled: false` y `moe_expert_offload_enabled: false`. Otros motores: no disponible en la informacion proporcionada.
- Latencia y throughput medidos: TTFT de 0,30 s en contexto casi nulo y hasta 3,7 s a ~64,7k tokens; decodificacion de 93 tok/s en contexto corto, degradando hasta 41 tok/s a ~64,7k tokens. El autor atribuye parte de la mejora de decodificacion a la cabeza MTP (aproximadamente +40 % en contexto corto).

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato/formato de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NovaeonStudio/Qwen3.8-35B-A3B-Distill-oQ8-fp16-mtp | 35,9 B | ~3 B | 262.144 | oQ8 / safetensors MLX, 39,5 GB | apache-2.0 | HuggingFace (0 descargas, 1 like) |
| empero-ai/Qwen3.8-35B-A3B-Distill (modelo base) | 35 B (aproximado segun nomenclatura) | ~3 B | no disponible en la informacion proporcionada | no disponible | apache-2.0 | HuggingFace |
| Otras builds 35B-A3B del mismo autor | no disponible | no disponible | no disponible | no disponible | no disponible | mencionadas de forma generica en la model card, sin datos |

Las busquedas web realizadas no han devuelto informacion utilizable sobre modelos comparables (los resultados fueron enlaces genericos a YouTube), por lo que no se incluyen alternativas adicionales de la misma categoria.

## Limitaciones y advertencias
- Idiomas: la model card solo declara ingles (`en`). No hay evidencia de soporte fiable en castellano ni en otros idiomas; el rendimiento multilingue es no disponible.
- Procedencia de los datos: todas las cifras de rendimiento, incluidos IFEval y la suite agentica, son mediciones propias del autor en su hardware; no hay verificacion independiente ni resultados de benchmarks estandar.
- Riesgo de alucinacion: inherente a los modelos destilados con decodificacion generativa; aunque la prueba de herramientas reporta ausencia de herramientas alucinadas en 6/6 casos, se trata de una muestra muy reducida y no elimina el riesgo en produccion.
- Dependencia de plataforma: el formato es MLX/oMLX, por lo que no es directamente desplegable en stacks CUDA (vLLM, TGI) ni en llama.cpp/Ollama sin conversion, que no esta documentada en la informacion disponible.
- Perfil de servicio especifico: el rendimiento documentado depende de una configuracion concreta (MTP activo con 6 drafts, ANE-prefill desactivado, KV de 8 bits). Otras configuraciones pueden degradar la decodificacion, segun las pruebas A/B del autor.
- Naturaleza del artefacto: es una cuantizacion de terceros sobre un modelo destilado, no un modelo entrenado desde cero; modificaciones de peso pueden introducir divergencias respecto al base no cuantificado.
- Adopcion y mantenimiento: con 0 descargas y 1 like en la fecha de creacion (17 de septiembre de 2026), no hay comunidad que valide el comportamiento en distintos entornos.
- Licencia: apache-2.0, que permite uso comercial, pero conviene revisar las condiciones del modelo base y de los profesores citados antes de un despliegue en produccion.
- Uso de contexto largo: la degradacion medida es notable (de 93 a 41 tok/s entre contexto casi nulo y ~64,7k tokens), lo que debe tenerse en cuenta para dimensionar latencias en agentes con historiales extensos.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/NovaeonStudio/Qwen3.8-35B-A3B-Distill-oQ8-fp16-mtp
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Repositorio de oMLX: https://github.com/jundot/omlx
- Sitio del autor: https://novaeon.studio
- Resultados de la busqueda web: no se han encontrado enlaces relevantes (los resultados devueltos fueron enlaces genericos a YouTube sin relacion con el modelo).
