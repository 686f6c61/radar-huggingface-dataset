# loom-fun/unsloth-Muse-Glimmer-30B-loom

## Resumen

Muse-Glimmer-30B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF `unsloth/Muse-Glimmer-30B-GGUF`, concretamente la cuantizacion `Muse-Glimmer-30B-UD-Q5_K_M.gguf`. Lo publica el usuario `loom-fun` y no contiene pesos: es una capa de orquestacion que `loom-fetch` materializa descargando los programas desde el repositorio y el GGUF, el proyector de vision y el drafter desde sus repositorios de origen, verificados por sha256 contra `model.json.lock`.

El modelo subyacente es multimodal (pipeline `image-text-to-text`), con 30B de parametros segun la nomenclatura del checkpoint, y se sirve mediante `loom-serve` sobre GPUs AMD (probado en un Ryzen AI Max+ 395 "Strix Halo" con memoria unificada). La innovacion principal es la decodificacion especulativa integrada y activada por defecto: el drafter `z-lab/Muse-Glimmer-30B-DFlash2-GGUF` propone 3 tokens por paso y el modelo los verifica en la misma pasada, con una tasa de aceptacion del 72 % sobre 5577 propuestas y salidas identicas a la decodificacion sin drafting (16/16 completions identicas).

Es relevante ahora porque ofrece una ruta de inferencia optimizada para hardware AMD consumer y de gama alta integrada (Strix Halo), con ventajas medidas frente a llama.cpp ROCm b1355 en prefill (+41 % a +63 % segun longitud del documento) y en decodificacion de un solo flujo (+6 % a +27 %), manteniendo una API compatible con OpenAI en `/v1/chat/completions`. El contexto declarado es de 131 072 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; el paquete no detalla la arquitectura interna) |
| Parametros totales | 30B (segun el nombre del checkpoint `Muse-Glimmer-30B`) |
| Parametros activos | no disponible |
| Longitud de contexto | 131 072 tokens |
| Tipos de cuantizacion | Q5_K_M (variante UD, Unsloth Dynamic); el paquete incluye solo `Muse-Glimmer-30B-UD-Q5_K_M.gguf` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (pesos no incluidos en el repo; se descargan aparte via `loom-fetch`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base (tipo de transformer, atencion, composicion del dataset de entrenamiento, numero de tokens vistos ni si hubo RLHF o DPO). La model card del paquete Loom no describe el entrenamiento de Muse-Glimmer-30B, solo el proceso de empaquetado y optimizacion de inferencia.

La innovacion tecnica documentada se situa en la capa de inferencia, no en el modelo. Por un lado, la decodificacion especulativa integrada con un drafter DFlash2 que propone 3 tokens por paso y verificacion en la misma pasada, con garantia de equivalencia respecto a la decodificacion sin drafting. Por otro, dos optimizaciones de prefill: orden de GEMM "rows-fastest" con reutilizacion de paneles de activacion (cada tile de pesos se lee una vez por chunk en lugar de una vez por tile de fila) y decodificacion del quinto bit de los pesos Q5_K sobre palabras de 32 bits, que aporta aproximadamente un 8 % de mejora en el GEMM aislado. El resultado agregado medido es de +11 % a 2k de prompt y +12 % a 8k frente a la build anterior.

## Capacidades

- Generacion de texto y razonamiento en conversaciones multi-turno mediante API compatible con OpenAI (`/v1/chat/completions`, con streaming).
- Entrada de imagen: el proyector de vision acepta partes `image_url` al estilo OpenAI, lo que habilita tareas image-text-to-text.
- Tool calling / function calling: el servidor responde a peticiones con herramientas declaradas.
- Razonamiento: la model card menciona soporte de "reasoning" en las respuestas del endpoint.
- Decodificacion especulativa activada por defecto con salidas identicas a la decodificacion estandar.
- Contexto largo de 131 072 tokens, verificado en las pruebas de aguja ("needle") del banco de pruebas.
- Capacidades de agente: el banco `loom-benchmark` incluye una prueba especifica de agente que pasa en nivel `quick`.

## Casos de uso

- Asistente conversacional de contexto largo: con 131 072 tokens de ventana puede mantener hilos multi-turno extensos o procesar documentos completos en una sola peticion sin truncar, usando el endpoint compatible con OpenAI.
- Analisis de documentos con imagen: informes escaneados, capturas de pantalla o diagramas pueden enviarse como partes `image_url` junto a la pregunta textual, aprovechando el proyector de vision.
- Automatizacion de agentes con herramientas: el soporte de tool calling y la prueba de agente del banco permiten integrarlo en flujos donde el modelo decide que funcion invocar y encadena varios pasos.
- Despliegue en estaciones de trabajo AMD: el paquete esta pensado para `loom-serve --device=amdgpu` con alrededor de 39 GB de memoria, lo que encaja en equipos con memoria unificada como el Ryzen AI Max+ 395 y evita depender de CUDA.
- Procesamiento por lotes de prompts largos: el prefill medido entre 441 y 466 tok/s en documentos de 1k a 32k lo hace adecuado para tareas donde el coste dominante es la lectura del contexto (resumen, extraccion, clasificacion sobre documentos largos).
- Servicio local de bajo volumen con latencia interactiva: la decodificacion de un solo flujo a 25 tok/s con prompt corto y 20,9 tok/s a 32k de contexto permite uso interactivo en local; conviene evitar escenarios de alta concurrencia (ver limitaciones).
- Evaluacion y comparacion de motores de inferencia: al incluir `info.json` con todas las metricas y un banco reproducible (`loom-benchmark`), sirve como referencia para medir llama.cpp frente a Loom sobre el mismo GGUF y drafter.

## Benchmarks y rendimiento

Rendimiento de inferencia medido en un Ryzen AI Max+ 395 "Strix Halo", mismo GGUF y drafter, una sola sesion, dos ejecuciones por motor (medias). Los numeros de Loom son del lado cliente; los de llama.cpp son de su servidor, lo que segun el autor favorece ligeramente a llama.cpp.

| Metrica | llama.cpp ROCm b1355 | Loom | Diferencia |
|---|---|---|---|
| Decode tok/s (prompt corto) | 19,7 | 25,0 | +27 % |
| Decode tok/s a 2k de contexto | 21,6 | 22,9 | +6 % |
| Decode tok/s a 32k de contexto | 18,9 | 20,9 | +11 % |
| Prefill tok/s, documento de 1k | 312,1 | 441,5 | +41 % |
| Prefill tok/s, documento de 2k | 309,7 | 464,4 | +50 % |
| Prefill tok/s, documento de 8k | 311,6 | 455,6 | +46 % |
| Prefill tok/s, documento de 16k | 302,9 | 465,9 | +54 % |
| Prefill tok/s, documento de 32k | 273,6 | 446,5 | +63 % |
| 4 flujos, agregado sostenido tok/s | 68,2 | 51,0 | -25 % |

Mejora de prefill frente a la build anterior del propio paquete (mismo GGUF, A/B intercalado, sin drafting, 4 rondas):

| Prompt | Build anterior | Esta build | Cambio |
|---|---|---|---|
| 2k | 415,3 | 459,1 | +11 % |
| 8k | 414,4 | 465,2 | +12 % |

Resultados de correccion (`loom-benchmark`, `LEVEL=quick`): PASS en golden, compare, vision, consistency, spec, sampling, needle y agent. En la comparacion golden contra llama.cpp, 24 prompts con 14 coincidencias exactas token a token y todas las divergencias fueron casi empates (diferencia maxima de log-prob de 0,214). En equivalencia de decodificacion especulativa, 16/16 completions identicas, 0 casi empates y aceptacion del 72 % sobre 5577 propuestas.

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el ejemplo de arranque usa `--memory_bytes=39000000000`, es decir, unos 39 GB de memoria para el modelo en Q5_K_M junto con el proyector y el drafter.
- Hardware de referencia: AMD Ryzen AI Max+ 395 "Strix Halo" con memoria unificada; el paquete esta orientado a `--device=amdgpu`.
- GPU dedicadas: no se documenta compatibilidad ni rendimiento en A100, H100 o RTX 4090; el paquete no incluye kernels CUDA.
- GPU consumer: con 30B en Q5_K_M y ~39 GB de memoria, no cabe en GPUs consumer de 8-24 GB de VRAM; encaja en equipos con memoria unificada grande como Strix Halo.
- Opciones de despliegue: `loom-serve` (SDK `hrx-loom[hf]`, instalacion con `pip install "hrx-loom[hf]"` y materializacion con `loom-fetch`). El autor compara contra llama.cpp ROCm b1355, que tambien puede servir el mismo GGUF y drafter. No se mencionan vLLM, TGI, Ollama ni llama.cpp en modo no-ROCm.
- Latencia y throughput: 25 tok/s de decodificacion con prompt corto, 20,9 tok/s a 32k de contexto, prefill de 441-466 tok/s entre 1k y 32k, y 51 tok/s agregados con 4 flujos concurrentes. El servidor escucha en `127.0.0.1:8080`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Motor / formato | Licencia | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-loom (este paquete) | 30B | 131 072 | Loom, GGUF Q5_K_M, AMD | no disponible | Drafting integrado; +41 % a +63 % en prefill y +6 % a +27 % en decode de un flujo frente a llama.cpp; -25 % en 4 flujos |
| Muse-Glimmer-30B en llama.cpp ROCm b1355 | 30B | 131 072 | llama.cpp, GGUF Q5_K_M, AMD | no disponible | Mismo GGUF y drafter; mejor agregado en 4 flujos (68,2 frente a 51,0 tok/s) |
| unsloth/Muse-Glimmer-30B-GGUF | 30B | no disponible en la informacion | GGUF (varias cuantizaciones) | no disponible | Checkpoint de origen sin empaquetado Loom; es la base de este paquete |

No se dispone de datos para comparar con alternativas de otro proveedor o familia en parametros, contexto y rendimiento dentro de la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos: sin ejecutar `loom-fetch` no hay modelo utilizable, y la descarga depende de repositorios externos (GGUF, proyector y drafter) verificados por sha256.
- El paquete esta atado a hardware AMD y al runtime Loom; no hay evidencia de funcionamiento en CUDA ni en otras GPUs.
- El rendimiento concurrente es peor que llama.cpp: 51,0 frente a 68,2 tok/s agregados con 4 flujos (-25 %), por lo que no es la mejor opcion para servir muchos usuarios simultaneos.
- La licencia no esta disponible, lo que impide confirmar si el uso comercial esta permitido; hay que consultar la licencia del modelo base `unsloth/Muse-Glimmer-30B-GGUF`.
- Los idiomas soportados no estan documentados; no se puede garantizar calidad fuera del ingles sin evaluacion propia.
- No hay benchmarks de calidad (razonamiento, codigo, matematicas) publicados en la informacion disponible; las metricas presentadas miden velocidad y consistencia, no capacidad.
- Riesgo de alucinacion: no cuantificado por el autor; al ser un modelo generativo de 30B en cuantizacion Q5_K_M, se recomienda validacion en produccion.
- Sesgos conocidos: no documentados.
- El estado del repositorio es muy reciente (creado y actualizado el 2026-11-05) y con 0 descargas y 0 likes, por lo que no hay validacion de la comunidad.
- La comparacion golden contra llama.cpp muestra 14 de 24 coincidencias exactas token a token; las divergencias se describen como casi empates, pero implican que las salidas no son bit a bit identicas entre motores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/loom-fun/unsloth-Muse-Glimmer-30B-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Muse-Glimmer-30B-GGUF
- Drafter de decodificacion especulativa: https://huggingface.co/z-lab/Muse-Glimmer-30B-DFlash2-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Pull request de optimizacion de prefill: https://github.com/loom-fun/loom-skills/pull/25
- Proyecto gufo (tecnicas de prefill): https://github.com/gufo-org/gufo
