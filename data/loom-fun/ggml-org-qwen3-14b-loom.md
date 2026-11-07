# loom-fun/ggml-org-Qwen3-14B-loom

## Resumen

`loom-fun/ggml-org-Qwen3-14B-loom` es un paquete de despliegue para el checkpoint GGUF `Qwen3-14B-Q4_K_M.gguf` de `ggml-org/Qwen3-14B-GGUF`, empaquetado en el formato nativo de Loom (programas `.loom` y una tarjeta `model.json`). No se trata de un modelo nuevo ni de un fine-tune: el autor declara explicitamente que los pesos son el checkpoint GGUF sin modificar. El valor anadido esta en el runtime: Loom es un motor de inferencia orientado a GPUs AMD (ROCm) que genera kernels especializados para el hardware objetivo y anade decodificacion especulativa por n-gram prompt lookup activada por defecto.

El paquete se genero en un AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) con el flujo `loom-skills`, y la model card reporta comparativas directas frente a llama.cpp sobre el mismo GGUF: entre un 24 % y un 82 % mas de tokens por segundo en decodificacion, y entre un 69 % y un 141 % mas en prefill, con el mismo sustrato de pesos. Expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling y modo de razonamiento, con 40.960 tokens de contexto por peticion y 4 peticiones concurrentes.

Es relevante ahora por dos motivos: por un lado, demuestra que es posible obtener mejoras sustanciales de rendimiento en hardware AMD de consumo (APUs con memoria unificada) sin reentrenar ni recuantizar el modelo, solo con generacion de kernels y decodificacion especulativa; por otro, introduce un formato de distribucion (`.loom`) con verificacion sha256 de los ficheros fuente y una bateria de puertas de correccion (`golden`, `compare`, `consistency`, `spec`, `agent`, `needle`) que comparan la salida token a token contra llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3), pesos GGUF sin modificar; runtime Loom con kernels generados |
| Parametros totales | 14B (aprox.; el repo base `ggml-org/Qwen3-14B-GGUF` figura con 15B en la busqueda web) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens por peticion (runtime Loom); contexto nativo del modelo base no disponible en esta ficha |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no la declara; la del modelo base Qwen3-14B debe consultarse en su repositorio) |
| Formato de pesos | GGUF (Q4_K_M) empaquetado en programas `.loom` + `weights.loom` + `model.json` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-14B, un transformer denso de la familia Qwen3. Esta ficha no dispone de datos sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, fases de RLHF/DPO) porque la informacion proporcionada no los incluye; deben consultarse en el repositorio `Qwen/Qwen3-14B`.

La innovacion tecnica de este paquete no esta en los pesos sino en el runtime Loom. El flujo `loom-skills` genera programas `.loom` y kernels especificos para la GPU objetivo (en este caso gfx1151 de Strix Halo) a partir de un `llm_config.json`, y el servidor `loom-serve` los ejecuta con decodificacion especulativa por n-gram prompt lookup con profundidad 2, activada por defecto. La model card reporta una tasa de aceptacion de tokens redactados del 10 % en la puerta `spec`, con variacion por regimen (3 % en decodificacion corta, 5 % a 2k de contexto, 18 % a 32k). El paquete incluye verificacion sha256 de los ficheros fuente fijados en `model.json.lock`.

## Capacidades

- Generacion de texto y razonamiento: modo "thinking" activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`. No soporta ajuste de esfuerzo de razonamiento (`reasoning effort`).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`; la puerta `agent` valida el bucle multi-turno de llamadas a herramientas.
- API compatible con OpenAI: endpoint `/v1/chat/completions` en `127.0.0.1:8080`.
- Decodificacion especulativa: n-gram prompt lookup, profundidad 2, activada por defecto; la puerta `spec` verifica que la salida con especulacion es identica a la salida sin ella.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Concurrencia: hasta 4 peticiones simultaneas, con la puerta `consistency` verificando que la salida concurrente coincide con la secuencial.
- Contexto largo: hasta 40.960 tokens por peticion; la puerta `needle` valida needle-in-a-haystack hasta la mitad del contexto.
- Sin vision: la entrada de imagen no esta soportada (la puerta `vision` figura como no aplicable).
- Sin audio: ni entrada ni salida.
- Limite de salida: 4.096 tokens (`max_tokens` preestablecido).

## Casos de uso

- Asistente de codigo en local sobre APU AMD: con Q4_K_M y 40.960 tokens de contexto, el modelo cabe en la memoria unificada de un Ryzen AI Max+ 395 y ofrece 25,5 tok/s en decodificacion corta, suficiente para autocompletado interactivo y revision de parches en un equipo de sobremesa sin GPU dedicada.
- Agente con tool calling en pipelines internos: la API compatible con OpenAI y el soporte validado de `tools`/`tool_calls` permiten conectarlo a frameworks de agentes existentes sin adaptadores, usando el bucle multi-turno verificado por la puerta `agent`.
- Procesamiento de documentos largos: con 967,9 tok/s de prefill en documentos de 1k y 479,4 tok/s a 32k, resulta adecuado para resumir o extraer informacion de contratos, informes o expedientes que ocupen decenas de miles de tokens en una sola peticion.
- Razonamiento con traza visible: el modo thinking por defecto permite obtener cadenas de razonamiento para tareas de matematicas, logica o analisis, y desactivarlo cuando se prioriza latencia o formato de salida estricto.
- Servicio multiusuario ligero: con 4 peticiones concurrentes y 61,2 tok/s agregados en decodificacion, puede atender a un equipo pequeno (por ejemplo, un grupo de investigacion) como endpoint interno compatible con OpenAI.
- Evaluacion comparativa de runtimes: al incluir puertas de correccion contra llama.cpp (`golden`, `compare`, `sampling`), sirve como banco de pruebas para medir el impacto de la decodificacion especulativa y de los kernels generados sobre el mismo GGUF.
- Despliegue reproducible con integridad verificada: `loom-fetch` con `--materialize=copy` y comprobacion sha256 de `model.json.lock` facilita replicar exactamente el mismo binario de inferencia en varias maquinas Strix Halo.

## Benchmarks y rendimiento

Rendimiento medido por el autor el 2026-11-07 en AMD Ryzen AI Max+ 395 con Radeon 8060S, Ubuntu 26.04, hrx-loom 0.1.0, mismo GGUF en ambos motores:

| Metrica | llama.cpp | Loom | Margen | Roofline | Loom % del roofline |
|---|---|---|---|---|---|
| Decodificacion tok/s, prompt corto | 20,6 | 25,5 | +24 % | 26,8 | 95 % |
| Decodificacion tok/s, contexto 2k | 17,3 | 22,8 | +32 % | 26,6 | 86 % |
| Decodificacion tok/s, contexto 32k | 7,3 | 13,3 | +82 % | 21,4 | 62 % |
| Prefill tok/s, documento 1k | 571,8 | 967,9 | +69 % | 2198,7 | 44 % |
| Prefill tok/s, documento 2k | 496,5 | 997,8 | +101 % | 2165,7 | 46 % |
| Prefill tok/s, documento 8k | 430,7 | 865,5 | +101 % | 1986,5 | 44 % |
| Prefill tok/s, documento 16k | 305,5 | 712,1 | +133 % | 1789,1 | 40 % |
| Prefill tok/s, documento 32k | 199,0 | 479,4 | +141 % | 1492,5 | 32 % |
| 4 flujos, decodificacion agregada tok/s | 36,9 | 61,2 | +66 % | 115,8 | 53 % |
| Tokens redactados aceptados (especulacion) | — | 10 % | — | n/a | n/a |

Notas metodologicas declaradas por el autor: llama.cpp con build `llamacpp-rocm/b1370` y argumentos `-ngl 99 -cram 0 --spec-type ngram-simple -c 35024 -kvu -np 4`; Loom con decodificacion especulativa activada (n-gram prompt lookup, profundidad 2); tiempos de Loom medidos en cliente y de llama.cpp en servidor; valores de decodificacion y prefill como media de 1-2 ejecuciones y los de 4 flujos como mediana de 1. El roofline se calcula con `loom-roofline` a 216 GB/s y 59 TFLOP/s para gfx1151, sin contar el coste del redactor especulativo.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: el ejemplo de arranque de la model card usa `--memory_bytes=31000000000` (31 GB) para el checkpoint Q4_K_M con 40.960 tokens de contexto. En APUs con memoria unificada esa cifra se reparte entre RAM y VRAM.
- Hardware de referencia: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), memoria unificada de 216 GB/s de ancho de banda y 59 TFLOP/s. El paquete esta generado especificamente para esta GPU; no se declara compatibilidad con otras.
- GPU dedicadas (A100, H100, RTX 4090): no disponible. La model card no reporta ejecuciones en esas plataformas y los kernels generados son especificos de gfx1151.
- Opcion consumer: si, en APUs Strix Halo con memoria unificada suficiente; no se documenta su ejecucion en GPUs de consumo discretas.
- Despliegue: `pip install "hrx-loom[hf]"`, `loom-fetch` para materializar el modelo y `loom-serve --device=amdgpu`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete; llama.cpp se usa solo como referencia de comparacion.
- Latencia y throughput: 25,5 tok/s de decodificacion en prompt corto y hasta 997,8 tok/s de prefill en documentos de 2k; 61,2 tok/s agregados con 4 flujos concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| loom-fun/ggml-org-Qwen3-14B-loom | 14B (aprox.) | 40.960 tok/peticion | no disponible | `.loom` + GGUF Q4_K_M, runtime Loom (ROCm) | Optimizado para AMD gfx1151; +24 % a +141 % frente a llama.cpp en el mismo hardware |
| Qwen/Qwen3-14B | 14B | no disponible en esta ficha | no disponible en esta ficha | safetensors (original) | Modelo base oficial; sin optimizacion de runtime especifica |
| ggml-org/Qwen3-14B-GGUF | 15B (segun busqueda web) | no disponible en esta ficha | no disponible en esta ficha | GGUF (multiples cuantizaciones) | Checkpoint de referencia usado por Loom; ejecutable en llama.cpp y derivados |

La comparacion de rendimiento con llama.cpp sobre el mismo GGUF y el mismo hardware esta en la seccion de benchmarks. No se dispone de datos para comparar con otras alternativas de la misma categoria en esta informacion.

## Limitaciones y advertencias

- No es un modelo nuevo: es un empaquetado del GGUF sin modificar. Cualquier limitacion del Qwen3-14B base (sesgos, alucinacion, cobertura idiomatica) se hereda integra.
- Licencia no declarada en la model card: antes de uso comercial hay que verificar la licencia del modelo base Qwen3-14B y la del propio runtime Loom.
- Hardware muy especifico: los kernels se generan para gfx1151 (Strix Halo). No hay evidencia de funcionamiento en otras GPUs AMD ni en NVIDIA.
- Cobertura de contexto incompleta: la puerta `needle_full` (needle-in-a-haystack a contexto completo) figura como "sin evidencia"; solo se valido hasta la mitad del contexto.
- Limite de salida de 4.096 tokens y de 4 peticiones concurrentes: puede ser insuficiente para generacion larga o cargas multiusuario mayores.
- Sin vision ni audio, y sin control de esfuerzo de razonamiento.
- Tasa de aceptacion especulativa baja en contextos cortos (3 %): la ganancia de la decodificacion especulativa es modesta fuera de contextos largos (18 % a 32k).
- Diferencias metodologicas en los benchmarks: Loom mide en cliente y llama.cpp en servidor, con 1-2 ejecuciones por valor; los margenes deben tomarse como indicativos, no como comparacion estricta.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-11-07; no hay evidencia de uso en produccion por terceros.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican las precauciones habituales en despliegues de atencion al cliente o generacion factual.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun/ggml-org-Qwen3-14B-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/Qwen3-14B-GGUF
- Modelo original Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Runtime Loom (hrx-system): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
