# alfodaniello/Qwen3-Coder-Next-RedLite-GGUF

## Resumen

Qwen3-Coder-Next-RedLite-CF2 es una cuantizacion GGUF de 2 bits del modelo Qwen/Qwen3-Coder-Next, publicada por el usuario alfodaniello. El modelo base es un transformer MoE (Mixture of Experts) de aproximadamente 80 000 millones de parametros totales que activa unos 3000 millones por token, especializado en tareas de agente de programacion, con una ventana de contexto de 256 000 tokens segun la documentacion publica del modelo original. La relevancia de esta ficha concreta no esta en el modelo base, sino en el metodo de cuantizacion: en lugar de aplicar un tipo fijo por regla, redistribuye los bits asignando tipos mas precisos (Q4_K) a las proyecciones densas que se leen en cada token y reservando IQ2_XS para las capas de expertos 40-47, manteniendo IQ1_M en el resto.

El resultado, segun el autor, es un archivo de 19,32 GB con la misma huella en disco que el IQ2_XXS de Bartowski, pero con una perplejidad un 3,3 % menor sobre un corpus de codigo (2,537 frente a 2,623) y 12 de 12 tareas de agente superadas en un Mac M4 Pro de 24 GiB, frente a 7 de 12 del archivo de referencia. La cuantizacion esta pensada para DwarfStar Red Lite, un runtime Metal nativo para Apple Silicon, aunque el archivo es GGUF estandar y carga tambien en llama.cpp.

Es un artefacto de nicho: no compite en calidad absoluta con cuantizaciones de 4 u 8 bits, sino que apunta a ejecutar un modelo de 80B en equipos de 24 GB de memoria unificada con calidad util para tareas de agente de codigo. Su licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Qwen3-Next), con capas DeltaNet y de atencion |
| Parametros totales | 79 674 391 296 (~80B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 256 000 tokens (modelo base); el autor recomienda 32 768 en Red Lite |
| Tipos de cuantizacion | Mezcla por tensor: Q4_K (proyecciones densas y parte de expertos compartidos), IQ2_XS (expertos en capas 40-47), IQ1_M (resto), resto de tensores con el tipo del IQ2_XXS de referencia; ~2,06 bits efectivos |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo MoE con aproximadamente 80 000 millones de parametros totales y unos 3000 millones activos por token, disenado especificamente para agentes de codigo. La familia Qwen3-Next combina capas DeltaNet con capas de atencion, lo que reduce el coste de inferencia en contextos largos. El modelo original se distribuye con licencia Apache-2.0 por el equipo Qwen y esta pensado para tool calling, razonamiento multi-paso y ejecucion de tareas de agente en entornos de desarrollo.

Sobre el proceso de cuantizacion, el autor parte del Q8_0 de Bartowski y de su importance matrix (`imatrix.gguf`), y ejecuta `llama-quantize` con un tipo asignado por tensor mediante el script `quant_mix.py` del repositorio Red Lite. La innovacion concreta es el mapeo de tipos: en el IQ2_XXS de referencia las proyecciones de entrada de DeltaNet y atencion, y parte de los expertos compartidos, quedan en 2,06 bits pese a ser tensores que se leen en cada token; en CF2 pasan a Q4_K. Los expertos de las capas 40-47 suben a IQ2_XS y el resto de expertos se mantiene o baja a IQ1_M para compensar el tamano. No hay informacion disponible en la documentacion proporcionada sobre el dataset de entrenamiento del modelo base, el numero de tokens ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de codigo y asistencia de programacion en tareas multi-archivo.
- Razonamiento de agente multi-paso: el autor reporta sesiones de agente con pi sobre un repositorio de ~1900 lineas de C.
- Tool calling / function calling (el modelo base lo soporta; la guia de uso emplea el flag `--jinja` en llama-server).
- Comprension y explicacion de codigo existente, incluida la lectura de servidores grandes.
- Correccion de errores sin modificar los tests (tarea verificada en la bateria del autor).
- Extension de interfaces de linea de comandos anadiendo tests.
- Contexto largo: el modelo base soporta 256K tokens; el autor fija 32K en sus pruebas.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Agente de codigo en local sobre Apple Silicon: cargar el GGUF en Red Lite o llama.cpp en un Mac de 24 GiB o mas y ejecutar un agente tipo pi con contexto de 32K, que es exactamente el escenario medido por el autor (12 de 12 tareas superadas con todos los expertos residentes en GPU).
- Explicacion de bases de codigo heredadas: el modelo puede recorrer un servidor C de ~1900 lineas y describir sus componentes, una de las tareas de la bateria de evaluacion.
- Correccion de bugs con restriccion de no tocar los tests: util en pipelines donde la suite de pruebas es la fuente de verdad y el agente debe limitarse al codigo de produccion.
- Ampliacion de herramientas CLI anadiendo cobertura de tests: tarea de refactor controlado tipica de un flujo de integracion continua.
- Asistencia de codigo offline o en entornos air-gapped: al ser un GGUF de 19,3 GB, se puede distribuir en un USB o imagen interna y ejecutar sin conexion, algo relevante en entornos con requisitos de confidencialidad.
- Prototipado de agentes de codigo en hardware de consumo: permite validar disenos de agente multi-paso en un solo equipo antes de escalar a infraestructura de servidor con cuantizaciones mayores.
- Generacion de codigo en produccion con tool calling: integrable mediante llama-server con plantilla Jinja para exponer el modelo como endpoint compatible con API de chat.
- Sustitucion de modelos propietarios en tareas de codigo de baja criticidad donde el coste por token importa mas que la calidad punta.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Perplejidad a contexto 512 sobre un corpus de texto congelado (111 fragmentos) y un corpus de codigo congelado (90 fragmentos, `llama-vocab.cpp` de llama.cpp).

| Metrica | Bartowski IQ2_XXS | CE3 | RedLite CF2 |
|---|---:|---:|---:|
| Tamano | 19,30 GB | 19,30 GB | 19,32 GB |
| Perplejidad, codigo | 2,623 | 2,584 | 2,537 |
| Perplejidad, texto | 18,53 | 18,24 | 18,72 |
| Tareas de agente, M4 Pro 24 GiB | 7 / 12 | 11 / 12 | 12 / 12 |
| Tareas de agente, M4 Max 48 GiB | 10 / 12 | 12 / 12 | 12 / 12 |
| Tarea de agente mas lenta, M4 Pro | 600 s (limite) | 506 s | 270 s |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada: 19,32 GB solo para los pesos; el autor ejecuta con todos los expertos residentes en GPU en un M4 Pro de 24 GiB y un M4 Max de 48 GiB. La guia general del modelo base cifra el uso practico en 30-45 GB de memoria unificada para cuantizaciones habituales.
- Apple Silicon: objetivo principal. Mac con 24 GiB o mas; el autor recomienda Red Lite como runtime nativo Metal.
- GPU dedicadas: no hay datos especificos de VRAM para A100, H100 o RTX 4090 en la informacion proporcionada. Por tamano de archivo, una GPU con 24 GB (RTX 4090, A10G 24GB) podria alojar los pesos, pero no se confirma compatibilidad ni rendimiento.
- Opciones de despliegue: DwarfStar Red Lite (`redlite serve --native`), llama.cpp (`llama-server -m ... --jinja`, requiere build con soporte Qwen3-Next) y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles como cifras de tokens por segundo. Como referencia de tiempo de tarea, la tarea de agente mas lenta tardo 270 s en M4 Pro y la mas rapida no se especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Coder-Next-RedLite-CF2 (esta ficha) | ~80B totales, ~3B activos | 256K (32K en pruebas) | GGUF, 19,32 GB | Apache-2.0 | HuggingFace, 0 descargas |
| Bartowski IQ2_XXS de Qwen3-Coder-Next | ~80B totales, ~3B activos | 256K | GGUF, 19,30 GB | Apache-2.0 | HuggingFace |
| CE3 (variante intermedia del autor) | ~80B totales, ~3B activos | 256K | GGUF, 19,30 GB | Apache-2.0 | Referenciada en la model card |
| Qwen3-Next-80B-A3B-Instruct-RedLite | ~80B totales, ~3B activos | 256K | GGUF | Apache-2.0 | HuggingFace |

La comparacion se limita a variantes de cuantizacion del mismo modelo base, porque la informacion proporcionada no incluye datos de rendimiento frente a otros modelos de codigo. No disponible comparativa con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Cuantizacion de 2 bits: la perdida de calidad frente al modelo en Q8_0 o BF16 es sustancial, especialmente en prosa. El propio autor indica que en texto CF2 no mejora al IQ2_XXS de Bartowski.
- Sobre texto la perplejidad empeora ligeramente frente a CE3 (18,72 frente a 18,24). Es un archivo optimizado para codigo y agentes, no para generacion de prosa.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado por el autor, pero inherente a cualquier modelo de lenguaje, agravado por la cuantizacion agresiva.
- Temperatura: a 0,7 o mas el modelo a veces repite una llamada a herramienta hasta agotar el tiempo limite. El autor usa 0,3 en sus pruebas (12 sesiones sin repeticion).
- Muestra pequena en la evaluacion de agentes: cuatro tareas por tres ejecuciones (12 en total). El propio autor advierte que 12/12 frente a 10/12 es una muestra reducida.
- La perplejidad se midio sobre un unico corpus de texto y un unico corpus de codigo, lo que limita la generalizacion de los numeros.
- Requiere build de llama.cpp con soporte Qwen3-Next; no funciona con versiones antiguas.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias sobre el artefacto cuantizado.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingue sin verificacion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alfodaniello/Qwen3-Coder-Next-RedLite-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Variante RedLite del modelo instruct: https://huggingface.co/alfodaniello/Qwen3-Next-80B-A3B-Instruct-RedLite-GGUF
- Runtime DwarfStar Red Lite: https://github.com/alfofire2/dwarfstar-red-lite
- Documentacion de cuantizacion y muestreo: https://github.com/alfofire2/dwarfstar-red-lite/blob/main/docs/REDLITE_DEV63_CODER_QUANT_SAMPLING.md
- Cuantizaciones de referencia de Bartowski: https://huggingface.co/bartowski/Qwen_Qwen3-Coder-Next-GGUF
- Informe tecnico de Qwen3-Coder-Next: https://arxiv.org/pdf/2603.00729v1
- Repositorio QwenLM/Qwen3-Coder: https://github.com/QwenLM/Qwen3-Coder
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Agente pi: https://github.com/earendil-works/pi
- Articulo divulgativo sobre Qwen3-Coder-Next GGUF: https://dev.co/ai/llms/qwen3-coder-next-gguf
