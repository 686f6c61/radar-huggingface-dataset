# kiteteam/Inkling-2-Mini-q4a6-MLX

## Resumen

Inkling 2 Mini q4a6 (MLX) es una cuantizacion mixta de 4 y 6 bits del modelo Inkling 2 Mini de Thinking Machines, un mixture of experts con bucles (looped MoE) de 26.400 millones de parametros totales y 3.400 millones activos. La build la publica el usuario kiteteam y esta pensada especificamente para Apple Silicon mediante el framework MLX, partiendo de la conversion BF16 de pipenetwork. El objetivo es claro: reducir el peso de 19,63 GB a 15,59 GB para que el modelo quepa y funcione con comodidad en Macs de 24 GB de memoria unificada, manteniendo una calidad cercana al original.

La receta de cuantizacion es selectiva: las proyecciones de atencion y las convoluciones cortas se mantienen en 6 bits afines (group size 64), mientras que `lm_head`, `embed_tokens` y los expertos enrutados de las capas 20 a 23 pasan a 4 bits. Los expertos de las capas 0 a 19 conservan su formato nativo NVFP4, el router sigue en float32 y la torre de vision permanece en bfloat16. El resultado conserva el 91,8% de acuerdo top-1 con la base BF16 y decodifica un 40% mas rapido a 4K de contexto.

Es relevante ahora porque demuestra que un MoE de 26B con vision y contexto largo puede ejecutarse en hardware de consumo Apple con latencias utiles (84,7 tokens/s en decodificacion a 4K en un M4 Max) y con calidad suficiente para tareas de agente multi-paso, algo que hasta hace poco requeria GPU dedicadas de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of experts con bucles (looped MoE), transformer con proyecciones de atencion y convoluciones cortas; incluye torre de vision |
| Parametros totales | 8.313.047.552 (segun safetensors del repo); el autor declara 26,4B totales y 3,4B activos para el modelo original |
| Parametros activos | 3,4B (declarado por el autor) |
| Longitud de contexto | 64K tokens en Macs de 24 GB con KV en 4 bits; 96K tokens en Macs de 32 GB o mas con KV en 8 bits |
| Tipos de cuantizacion | Mixta: 6 bits afines (group size 64) en atencion y short-conv; 4 bits afines (group size 64) en `lm_head`, `embed_tokens` y expertos de capas 20-23; NVFP4 nativo en expertos de capas 0-19; router en float32; torre de vision en bfloat16 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX), libreria `mlx` |

## Arquitectura y entrenamiento

El modelo base es un mixture of experts con bucles: los expertos enrutados se reutilizan a lo largo de varias iteraciones internas, lo que permite un ratio de activacion muy bajo (3,4B activos sobre 26,4B totales) y reduce el coste computacional por token. La arquitectura combina proyecciones de atencion (con proyecciones fusionadas `q/r/gate/sink/k/v` en capas deslizantes y `q/r/gate/sink` mas `_sconv` y `k`/`v` en capas completas), convoluciones cortas y una torre de vision para entrada image-text-to-text. El router opera en float32 y las compuertas de mensaje del bucle no se cuantizan.

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos corresponden a la model card original de Thinking Machines, que no se ha incluido en la informacion proporcionada. La innovacion tecnica destacable de esta build es la cuantizacion por capas con formatos mixtos: mantener uniformemente la atencion en 6 bits/g64 preserva las proyecciones fusionadas, mientras que bajar `lm_head` a 4 bits ahorra 110 MB y recupera velocidad de prefill y decode con un KLD practicamente identico (0,404 frente a 0,401). El modelo requiere una version de mlx-lm que incluya el PR ml-explore/mlx-lm#2086 para cargar la arquitectura.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text) mediante torre de vision.
- Tool calling y function calling, con rendimiento medido en el conjunto de pruebas de agentes del autor.
- Ejecucion de agentes con cadenas de herramientas: ficheros, programacion de tareas, mensajes, historial, persistencia, codigo, escritura, documentos, correo y asistencia.
- Razonamiento con esfuerzo configurable (`low` y `high` en la plantilla); el autor recomienda `low` para trabajo de agente.
- Capacidades multilingues limitadas al ingles.
- Contexto largo de hasta 96K tokens con KV en 8 bits en equipos de 32 GB o mas.

## Casos de uso

- Agentes locales en Mac: el modelo puede orquestar cadenas de herramientas (lectura de ficheros, envio de mensajes, persistencia de estado) en un Mac de 24 GB, con 92,04 de puntuacion headline en el conjunto de agentes con uso intensivo de herramientas del autor (89 casos, 85,1% de aprobados).
- Asistente de escritura y documentos: con 64K de contexto en 4 bits cabe un historial largo de conversacion y documentos completos, manteniendo 59,0 tokens/s de decodificacion a 64,6K en un presupuesto de 24 GB.
- Automatizacion de navegacion web: el modelo alcanza un 75,9% de acierto en la puerta de pasos de navegador (`crawl test_family`, 407 pasos), util para agentes que rellenan formularios o extraen datos de paginas.
- Generacion y revision de codigo en local: soporta tool calling y puede integrarse en flujos de edicion de ficheros y ejecucion de comandos sin salir del portatil, con 601 tokens de salida por tarea en el conjunto de agentes con herramientas.
- Procesamiento de imagenes con texto: al incluir torre de vision, sirve para describir capturas, extraer informacion de documentos escaneados o responder preguntas sobre imagenes en una aplicacion de escritorio.
- Prototipado e investigacion en Apple Silicon: permite evaluar un MoE de 26B con contexto largo y vision en un M4 Max sin GPU dedicada, con 1.050 tokens/s de prefill a 4K.
- Atencion al cliente offline: conversaciones multi-turno con contexto de 64K tokens y latencia de 49,6 a 59,0 tokens/s, adecuada para despliegues en local con requisitos de privacidad.

## Benchmarks y rendimiento

Evaluacion realizada por el autor en un Apple M4 Max (GPU de 40 nucleos, 48 GB), macOS 27.3, esfuerzo `low`, temperatura 1.

| Metrica | Base MLX (BF16 dense) | q4a6 |
|---|---|---|
| KLD frente a la base MLX (4K, 512 filas) | 0 | 0,404 (mediana 0,00016) |
| Acuerdo top-1 con la base MLX | 100% | 91,8% |
| Velocidad de decodificacion a 4K (KV 8 bits) | 60,7 tok/s | 84,7 tok/s (1,40x) |
| Velocidad de prefill a 4K | 1.101 tok/s | 1.050 tok/s |
| Memoria pico MLX a 4K | 19,83 GB | 16,02 GB (-3,81 GB) |
| Memoria pico, chat de 64,6K, KV 4 bits (presupuesto 18,08 GB en 24 GB) | no disponible | 17,61 GB (6/6 recuperados, 59,0 tok/s) |
| Memoria pico, chat de 94,9K, KV 8 bits (32/48 GB) | no disponible | 21,15 GB (6/6 recuperados, 49,6 tok/s) |
| Decodificacion a 30K / tool calls (96K, KV 8 bits) | no disponible | 64,2-65,4 tok/s / 71,9-72,5 tok/s |
| Conjunto de agentes con uso intensivo de herramientas (89 casos) | no disponible | 92,04 headline (85,1% de aprobados, 601 tokens de salida por tarea) |
| Conjunto amplio de agentes (`local-quality`, 181 casos, 295 ejecuciones) | no disponible | 68,8% de aprobados (985 tokens de salida por tarea) |
| Puerta de pasos de navegador (`crawl test_family`, 407 pasos) | no disponible | 75,9% correctos (26/27 en `fixture+sites`) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: aproximadamente 17,6 GB para un chat de 64K tokens con KV en 4 bits (Mac de 24 GB); aproximadamente 21,2 GB para un chat de 95K con KV en 8 bits (Mac de 32 GB o mas). Incluye 0,64 GB de torre de vision solo cuando se carga.
- Peso de los pesos: 15,59 GB en disco (frente a 19,63 GB de la base BF16).
- GPU recomendadas: Apple Silicon con 24 GB o mas de memoria unificada; el autor valida en un M4 Max de 40 nucleos y 48 GB. No se proporcionan datos para GPU NVIDIA o AMD.
- Cabe en GPU de consumo: si, en Macs de 24 GB o mas; no se dispone de informacion sobre GPUs de consumo NVIDIA.
- Opciones de despliegue: `mlx-lm` con el PR ml-explore/mlx-lm#2086 instalado (`pip install "git+https://github.com/ml-explore/mlx-lm@refs/pull/2086/head"`); comando `mlx_lm.generate --model kiteteam/Inkling-2-Mini-q4a6-MLX`. No se indica soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 84,7 tokens/s de decodificacion y 1.050 tokens/s de prefill a 4K en M4 Max; 59,0 tokens/s a 64,6K con KV en 4 bits; 49,6 tokens/s a 94,9K con KV en 8 bits; 71,9-72,5 tokens/s en tool calls con contexto de 96K.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato / plataforma | Notas |
|---|---|---|---|---|---|
| Inkling 2 Mini q4a6 (MLX) | 26,4B / 3,4B (declarado) | 64K-96K | Apache-2.0 | safetensors MLX, Apple Silicon | Cuantizacion mixta 4/6 bits, vision, 15,59 GB |
| Inkling 2 Mini MLX BF16 (`pipenetwork/Inkling-2-Mini-MLX-bf16`) | 26,4B / 3,4B (declarado) | no disponible | Apache-2.0 | safetensors MLX, Apple Silicon | Base densa de 19,63 GB; 60,7 tok/s a 4K |
| Inkling 2 Mini original (`thinkingmachines/Inkling-2-Mini`) | 26,4B / 3,4B (declarado) | no disponible | Apache-2.0 | no disponible | Modelo de referencia del que derivan las builds MLX |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran capacidades multilingues.
- La cuantizacion introduce perdida de calidad: 91,8% de acuerdo top-1 con la base BF16 y KLD de 0,404, con mediana de 0,00016, lo que implica divergencias puntuales en la generacion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad en la informacion disponible.
- No se detallan sesgos conocidos ni la composicion del dataset de entrenamiento en la informacion proporcionada.
- El rendimiento de agente medido por el autor (68,8% en el conjunto amplio) deja margen de error en produccion; conviene validar en el dominio concreto antes de desplegar.
- Requiere una version especifica de `mlx-lm` (PR #2086); no es compatible con loaders genericos sin soporte de cuantizacion por capas.
- El modelo DSpark draft (decodificacion especulativa) no esta incluido en esta build.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la model card original de Thinking Machines para condiciones de uso previstas y limitaciones adicionales.
- Los datos de parametros del safetensors (8.313.047.552) no coinciden con los 26,4B declarados por el autor; conviene verificar la configuracion real antes de dimensionar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiteteam/Inkling-2-Mini-q4a6-MLX
- Modelo base MLX BF16: https://huggingface.co/pipenetwork/Inkling-2-Mini-MLX-bf16
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- PR de mlx-lm que anade la arquitectura: https://github.com/ml-explore/mlx-lm/pull/2086
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
