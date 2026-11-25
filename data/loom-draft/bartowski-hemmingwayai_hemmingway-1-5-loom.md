# loom-draft/bartowski-HemmingwayAI_Hemmingway-1.5-loom

## Resumen

Loom-draft/bartowski-HemmingwayAI_Hemmingway-1.5-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado con la herramienta loom-next a partir del checkpoint GGUF sin modificar `bartowski/HemmingwayAI_Hemmingway-1.5-GGUF`, en concreto la cuantizacion `HemmingwayAI_Hemmingway-1.5-Q4_K_M.gguf`. No se trata de un modelo nuevo ni de un fine-tuning: es un artefacto de empaquetado orientado a la inferencia en GPUs AMD, especificamente el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El paquete esta pensado para el runtime `loom-serve` (distribuido como `hrx-loom[hf]==0.2.0`) y expone un endpoint compatible con la API de chat completions de OpenAI en `127.0.0.1:8080/v1/chat/completions`. Incluye presets de memoria (`--pool_backing=fixed`), precarga de parametros (`--parameter_mode=preload`) y decodificacion especulativa basada en MTP (multi-token prediction), con profundidad de borrador 3.

Su relevancia es acotada pero concreta: ofrece una ruta de despliegue optimizada para hardware AMD consumer y de estacion de trabajo, con mediciones publicadas frente a llama.cpp ROCm sobre el mismo GGUF y los mismos prompts. En Strix Halo reporta 34,7 tok/s de decodificacion en prompt corto frente a 29,2 de llama.cpp (+19 %) y 523,0 tok/s de prefill en documento de 1k frente a 327,2 (+60 %). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamano de 0,0 GB, lo que sugiere que los pesos no estan alojados en el propio repo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del checkpoint base Hemmingway-1.5; el empaquetado no la modifica) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens (configuracion de servicio de llama.cpp de referencia: `-c 65536`); contexto medido hasta 32k en las pruebas publicadas |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF dentro de paquete Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

El paquete no define arquitectura ni entrenamiento propios: envuelve el GGUF `HemmingwayAI_Hemmingway-1.5-Q4_K_M.gguf` de bartowski, derivado a su vez del modelo HemmingwayAI Hemmingway-1.5. La informacion disponible no detalla el numero de parametros, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo RLHF o DPO. Cualquier afirmacion al respecto requeriria consultar la model card del checkpoint original, que no forma parte de la informacion proporcionada.

La innovacion tecnica esta en la capa de ejecucion. Loom incorpora decodificacion especulativa mediante MTP con profundidad de borrador 3, activa por defecto en el preset del paquete, y un modo de espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`) que consume CPU mientras hay trabajo en vuelo a cambio de reducir latencia. El pool de memoria se reserva por adelantado (`--pool_backing=fixed`) en lugar de crecer de forma elastica, y los pesos pueden precargarse en el host (`--parameter_mode=preload`). La generacion del paquete se realizo con loom-next sin LLM en el bucle, es decir, de forma puramente mecanica sobre el checkpoint.

## Capacidades

- Generacion de texto conversacional mediante API compatible con chat completions de OpenAI.
- Plantilla de chat con parametro `enable_thinking` para activar o desactivar el modo de razonamiento extendido; el ejemplo de la model card lo desactiva explicitamente.
- Decodificacion especulativa MTP integrada en el preset, con profundidad de borrador 3.
- Servicio multipeticion: las pruebas incluyen 4 streams paralelos con decodificacion agregada.
- Procesamiento de prompts largos: prefill medido hasta 32k tokens de documento.
- Capacidades de codigo, matematicas, vision, tool calling, agentes o multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue local en Strix Halo para asistentes conversacionales: el paquete arranca con dos comandos (`loom-fetch` y `loom-serve`) y expone un endpoint compatible con OpenAI, lo que permite conectar clientes existentes sin adaptadores. El prefill de 523 tok/s en documentos de 1k hace viable inyectar contexto de referencia en cada turno.
- Procesamiento de documentos largos en estacion de trabajo AMD: con contexto configurado a 65.536 tokens y prefill medido de 459,7 tok/s a 32k, resulta adecuado para resumir o extraer informacion de contratos, informes o transcripciones extensas en una sola pasada.
- Servicio multiusuario ligero: con 4 streams en paralelo y 46,4 tok/s agregados en Strix Halo, puede atender a un equipo pequeno en tareas de redaccion o consulta sin depender de la nube.
- Evaluacion comparativa de runtimes en hardware AMD: al fijar el mismo GGUF, los mismos prompts y el mismo runner, el paquete sirve como referencia reproducible para medir Loom frente a llama.cpp ROCm en gfx1151 y gfx1201.
- Prototipado de aplicaciones con modo thinking conmutable: el parametro `enable_thinking` permite alternar entre respuestas rapidas y razonamiento extendido segun la tarea, sin cambiar de modelo ni de endpoint.
- Inferencia en Radeon AI PRO R9700 para entornos de escritorio profesional: el preset `chat-r9700` esta ajustado a los 32 GB de esa GPU, lo que permite ejecutar el modelo en una unica tarjeta de estacion de trabajo.

## Benchmarks y rendimiento

Rendimiento comparado frente a llama.cpp ROCm `llamacpp-rocm/b1374` sobre el mismo GGUF, mismo runner y mismos prompts. Medianas de 3 sesiones; Loom cronometrado por el cliente, llama.cpp por su servidor. Medido el 2026-11-25 en AMD DevLab Dispatch, Strix Halo (runner X2-LA03-S04-D06), con hrx-loom 0.2.0.

| Metrica (Strix Halo, gfx1151) | llama.cpp | Loom | Margen |
|---|---|---|---|
| Decode tok/s, prompt corto | 29,2 | 34,7 | +19 % |
| Decode tok/s, contexto 2k | 31,8 | 36,9 | +16 % |
| Decode tok/s, contexto 32k | 27,3 | 30,5 | +12 % |
| Prefill tok/s, documento 1k | 327,2 | 523,0 | +60 % |
| Prefill tok/s, documento 2k | 336,5 | 527,1 | +57 % |
| Prefill tok/s, documento 8k | 339,3 | 534,2 | +57 % |
| Prefill tok/s, documento 16k | 322,9 | 507,9 | +57 % |
| Prefill tok/s, documento 32k | 291,1 | 459,7 | +58 % |
| 4 streams, decode agregado tok/s | 38,0 | 46,4 | +22 % |
| Decodificacion especulativa, tokens aceptados | no medido | no medido | n/a |

Notas metodologicas: en las filas de un solo stream se activo MTP en ambos motores con profundidad de borrador 3 en Loom y el valor por defecto de `--spec-draft-n-max` en llama.cpp; en las de 4 streams se desactivo el borrado en ambos. Argumentos de llama.cpp: `-ngl 99 -cram 0 --spec-type draft-mtp -c 65536 -np 1`. La roofline no se calculo. No se publican resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- GPU soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan otras.
- VRAM estimada: no disponible; el paquete usa un pool de memoria de tamano fijo definido por el preset, sin cifra publicada.
- Prefill y decodificacion medidos solo en Strix Halo; no hay cifras publicadas para R9700.
- Cabe en GPU consumer AMD de la familia indicada; no hay datos sobre GPUs NVIDIA ni sobre iGPUs distintas de Strix Halo.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` con el preset `chat` o `chat-r9700` y `loom-serve`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete.
- Throughput de referencia en Strix Halo: 34,7 tok/s en decodificacion de prompt corto y hasta 534,2 tok/s de prefill (documento de 8k). La espera activa (`completion_spin_ns=4294967295`) es la configuracion con la que se midieron estas cifras y consume CPU durante el trabajo en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| bartowski/HemmingwayAI_Hemmingway-1.5-GGUF (checkpoint base) | no disponible | no disponible | no disponible | GGUF | Mismo pesos; sin empaquetado Loom ni presets para AMD |
| loom-draft/bartowski-HemmingwayAI_Hemmingway-1.5-loom | no disponible | 65.536 (config. de servicio) | MIT | Loom + GGUF | Paquete optimizado para gfx1151 y gfx1201 con MTP y espera activa |
| Alternativas de terceros de tamano o tarea comparable | no disponible | no disponible | no disponible | no disponible | No se dispone de datos para una comparacion fundamentada |

La unica comparacion cuantitativa disponible es de motor de inferencia, no de modelo: Loom frente a llama.cpp ROCm sobre el mismo checkpoint, con los margenes de la tabla de benchmarks.

## Limitaciones y advertencias

- El paquete no aporta mejoras de calidad del modelo: hereda integramente el comportamiento, los sesgos y el riesgo de alucinacion del checkpoint Hemmingway-1.5, sobre el que no se proporciona informacion.
- El repo tiene 0 descargas, 0 likes y un tamano de 0,0 GB; los pesos no parecen alojarse aqui y la disponibilidad a largo plazo del artefacto no esta garantizada.
- Soporte de hardware muy restringido: solo se documentan Strix Halo y R9700. En otras GPU el despliegue no esta verificado.
- Dependencia de una version concreta del runtime (`hrx-loom[hf]==0.2.0`) y de un commit de hrx-system que la propia model card marca como desconocido.
- Las cifras de rendimiento provienen de runners de DevLab que varian entre sesiones y de medianas de solo 3 ejecuciones; los margenes dentro de +-3 % se consideran empate.
- La espera activa consume CPU de forma continua mientras hay trabajo en GPU, lo que puede degradar otras cargas en el mismo host.
- No hay datos publicados de benchmarks de calidad, cobertura de idiomas ni evaluaciones de sesgo; no debe asumirse un rendimiento concreto en tareas de razonamiento o codigo.
- La licencia MIT del paquete no aclara por si sola los terminos del checkpoint base; conviene verificar la licencia del modelo original antes de un uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-HemmingwayAI_Hemmingway-1.5-loom
- Checkpoint base en Hugging Face: https://huggingface.co/bartowski/HemmingwayAI_Hemmingway-1.5-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecucion de referencia DevLab Dispatch 45508840575: https://github.com/loom-fun/loom-next/actions/runs/45508840575
- Resultados de busqueda web: no se encontro ningun enlace relevante al modelo; los resultados corresponden a Loom (loom.com), Loom (loom.fr) y Loom (app.loom.ag), servicios no relacionados con este paquete.
