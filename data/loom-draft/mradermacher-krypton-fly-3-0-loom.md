# loom-draft/mradermacher-Krypton-Fly-3.0-loom

## Resumen

Krypton-Fly-3.0-loom es un paquete de despliegue en formato Loom para el checkpoint GGUF cuantizado `Krypton-Fly-3.0.Q4_K_M.gguf`, publicado por el usuario `loom-draft`. No se trata de un modelo entrenado desde cero, sino de un artefacto de empaquetado: contiene los programas `.loom` y un fichero `model.json` que permiten servir el GGUF original de `mradermacher` mediante el runtime `loom-serve` (paquete `hrx-loom`) sobre GPUs AMD. El modelo base es multimodal de tipo imagen-texto-a-texto, con soporte de razonamiento (thinking mode) y tool calling, según la información de la model card.

El interes practico inmediato es la integracion con el hardware objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete incluye comandos de arranque concretos y mediciones de rendimiento frente a llama.cpp ROCm en Strix Halo, con cifras de decodificación de 39,7 tok/s en prompt corto y 33,5 tok/s a 32k de contexto, y prefill de hasta 1717,6 tok/s en documentos de 8k. Es relevante para desarrolladores que quieran evaluar el stack Loom sobre silicio AMD sin tener que generar el paquete desde cero.

La licencia declarada es MIT y el pipeline es `image-text-to-text`. El repositorio tiene un tamano de 0.0 GB y cero descargas en el momento de la consulta, lo que sugiere un artefacto recien creado (26 de noviembre de 2026) y de alcance experimental. No se dispone de informacion sobre el modelo subyacente (arquitectura, parametros, datos de entrenamiento) en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal imagen-texto-a-texto; el paquete no documenta la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 65536 tokens (valor usado en la configuracion de llama.cpp de referencia: `-c 65536`) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint `Krypton-Fly-3.0.Q4_K_M.gguf`), empaquetado como programas `.loom` + `model.json` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo subyacente (transformer, MoE, hibrido u otra), el numero de parametros ni la composicion del dataset de entrenamiento. La model card del paquete Loom no describe el modelo, solo el mecanismo de despliegue.

Lo que si documenta el paquete es la capa de ejecucion: `loom-serve` sirve el GGUF sin modificarlo, con un pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parametros en host (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). El paquete se genero con `loom-next` (el generador, sin LLM en el bucle). No hay informacion sobre RLHF, DPO ni innovaciones de atencion. La model card indica que no existe cabeza MTP en el GGUF ni drafter publicado para este modelo exacto, por lo que la decodificacion especulativa no esta disponible.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Entrada multimodal imagen-texto (pipeline `image-text-to-text`).
- Razonamiento / thinking mode activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling en estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Servicio multi-stream: la model card reporta rendimiento agregado con 4 peticiones paralelas.
- Idiomas soportados: no disponible.

## Casos de uso

- Evaluacion de rendimiento del stack Loom frente a llama.cpp en hardware AMD: el paquete incluye la metodologia y las cifras medidas en Strix Halo, lo que permite reproducir la comparativa con el mismo GGUF, los mismos prompts y el mismo runner.
- Despliegue local de un asistente multimodal en un Ryzen AI Max+ 395: el comando de arranque documentado levanta el servicio en `127.0.0.1:8080` con el modelo precargado, adecuado para prototipos de escritorio con vision.
- Servicio de chat con tool calling para agentes: la API expone `tools`/`tool_calls` en formato OpenAI, lo que permite conectarlo a orquestadores de agentes existentes sin adaptadores propietarios.
- Procesamiento de documentos largos: con contexto de 65536 tokens y prefill medido de 1503,3 tok/s a 32k, es viable ingerir documentos extensos en una sola pasada en Strix Halo.
- Razonamiento multi-paso con thinking mode: util para tareas que requieren cadena de razonamiento explicita, activada por defecto y desactivable cuando se prioriza latencia.
- Despliegue en Radeon AI PRO R9700 (32 GB): el paquete incluye comandos especificos para gfx1201, aunque las metricas de rendimiento para esa GPU aun no se han re-medido segun la model card.
- Banco de pruebas de cuantizacion Q4_K_M: al servir el mismo GGUF que llama.cpp, sirve para comparar fidelidad y velocidad entre motores de inferencia sobre el mismo artefacto.

## Benchmarks y rendimiento

Rendimiento medido en AMD Strix Halo (gfx1151), Loom vs llama.cpp ROCm `llamacpp-rocm/b1374`, mismo GGUF y mismos prompts, mediana de 3 sesiones:

| Metrica | llama.cpp | Loom |
|---|---|---|
| Decode tok/s, prompt corto | no medido | 39,7 |
| Decode tok/s, contexto 2k | no medido | 38,7 |
| Decode tok/s, contexto 32k | no medido | 33,5 |
| Prefill tok/s, documento 1k | no medido | 1682,6 |
| Prefill tok/s, documento 2k | no medido | 1698,2 |
| Prefill tok/s, documento 8k | no medido | 1717,6 |
| Prefill tok/s, documento 16k | no medido | 1642,9 |
| Prefill tok/s, documento 32k | no medido | 1503,3 |
| 4 streams, decode agregado tok/s | no medido | 143,0 |
| Decodificacion especulativa | n/a | n/a |

La model card indica que los valores de llama.cpp para estas filas no estan medidos ("— not measured") y que el margen frente al mejor llama.cpp no se calculo por falta de backend valido. La roofline no se computo. Para Radeon AI PRO R9700 (gfx1201, 32 GB) los resultados "no se han re-medido todavia". No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- GPUs objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M y el contexto de referencia configurado es de 65536 tokens.
- Cabe en consumer GPU: si, en las GPUs AMD objetivo del paquete; no hay datos para GPUs NVIDIA.
- Despliegue: runtime `loom-serve` mediante `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. El paquete esta pensado para Loom, no para vLLM, llama.cpp, Ollama o TGI.
- Throughput medido (Strix Halo): 39,7 tok/s decode en prompt corto, 33,5 tok/s a 32k de contexto, 143,0 tok/s agregados con 4 streams, prefill entre 1503,3 y 1717,6 tok/s segun longitud.
- Latencia: no disponible de forma desagregada (solo tok/s).
- Entorno medido: AMD DevLab Dispatch runner X2-LA03-S01-D03, Linux, hrx-loom 0.2.0, medicion del 2026-11-26.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Krypton-Fly-3.0-loom (este paquete) | no disponible | 65536 | GGUF + `.loom` | MIT | Servido con `loom-serve` en AMD gfx1151/gfx1201 |
| mradermacher/Krypton-Fly-3.0-GGUF (base) | no disponible | no disponible | GGUF | no disponible en la informacion | Checkpoint original sin empaquetar |
| llama.cpp ROCm b1374 (motor, no modelo) | n/a | configurable | n/a | MIT (proyecto) | Referencia de rendimiento; valores no medidos en la tabla de la model card |

No se dispone de datos de benchmarks de calidad ni de especificaciones del modelo base que permitan una comparativa con alternativas de la misma categoria. La comparativa disponible es exclusivamente de motor de inferencia (Loom vs llama.cpp) sobre el mismo GGUF.

## Limitaciones y advertencias

- El repositorio no incluye los pesos: el tamano es 0.0 GB y el paquete referencia el GGUF externo de `mradermacher`; hay que descargarlo aparte mediante `loom-fetch`.
- Cero descargas y cero likes en el momento de la consulta: artefacto sin validacion comunitaria.
- Solo hay metricas para Strix Halo; para Radeon AI PRO R9700 la model card indica que no se han re-medido.
- Los valores de llama.cpp en la tabla comparativa no estan medidos, por lo que no hay margen calculado frente al motor de referencia.
- No hay decodificacion especulativa disponible (sin cabeza MTP ni drafter publicado), lo que limita el throughput en decodificacion.
- No se documentan sesgos, riesgo de alucinacion ni limitaciones idiomaticas del modelo subyacente; se desconoce su comportamiento en produccion.
- La licencia MIT aplica al paquete Loom; la licencia del modelo base no se detalla en la informacion proporcionada y debe verificarse antes de uso comercial.
- Dependencia fuerte del ecosistema Loom (`hrx-loom==0.2.0`, `loom-next`): no es portable a otros runtimes sin conversion.
- El contexto de 65536 tokens es el valor de configuracion usado en la comparativa con llama.cpp, no una especificacion confirmada del modelo.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/mradermacher-Krypton-Fly-3.0-loom
- Modelo base GGUF: https://huggingface.co/mradermacher/Krypton-Fly-3.0-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecucion de referencia (DevLab Dispatch): https://github.com/loom-fun/loom-next/actions/runs/45881063329
