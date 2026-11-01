# loom-fun/unsloth-Qwen3.8-27B-loom

## Resumen

`loom-fun/unsloth-Qwen3.8-27B-loom` es un paquete de despliegue para Loom, el runtime de inferencia de AMD orientado a GPUs integradas y APUs con soporte ROCm. No se trata de un modelo entrenado desde cero ni de un fine-tuning con pesos propios: es un artefacto que empaqueta los programas `.loom` y una tarjeta `model.json` para ejecutar el checkpoint GGUF sin modificar `unsloth/Qwen3.8-27B-GGUF` en su cuantizacion `Q4_K_M`.

El paquete fue generado con el flujo de trabajo de la fabrica `loom-skills` sobre un AMD Ryzen AI Max+ 395, la APU de la familia Strix Halo con memoria unificada. Su relevancia practica esta en que permite servir un modelo de 27B en hardware de consumo AMD sin GPU discreta, exponiendo una API compatible con OpenAI en `127.0.0.1:8080` mediante `loom-serve`.

El repositorio no incluye los pesos: `loom-fetch` descarga los programas desde este repositorio y el GGUF desde el repositorio de Unsloth, verificando la integridad contra `model.json.lock`. La licencia declarada es Apache 2.0. No hay informacion publicada sobre arquitectura interna, contexto o idiomas del modelo base en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del checkpoint `unsloth/Qwen3.8-27B-GGUF`) |
| Parametros totales | 27B (segun el nombre del checkpoint base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `Q4_K_M` (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (pesos no incluidos en este repositorio); artefactos `.loom` y `model.json` |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino un paquete de despliegue. Los pesos provienen del checkpoint `unsloth/Qwen3.8-27B-GGUF` en cuantizacion `Q4_K_M`, que se descarga aparte mediante `loom-fetch` y se verifica contra el fichero de bloqueo `model.json.lock`. Los programas `.loom` describen como cargar y servir ese checkpoint en el runtime Loom.

El paquete se genero en un AMD Ryzen AI Max+ 395 (Strix Halo) mediante el flujo automatizado `loom-skills`. No se dispone de informacion sobre la arquitectura del transformer subyacente, el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto y conversacion multi-turno a traves de la API `/v1/chat/completions` con formato compatible con OpenAI.
- Servido local mediante `loom-serve` en `127.0.0.1:8080`, lo que facilita la integracion con clientes y SDKs que ya hablan el protocolo de OpenAI.
- Ejecucion en GPUs AMD mediante el backend `--device=amdgpu` del runtime Loom.
- Carga verificada de pesos: `loom-fetch` comprueba el GGUF contra `model.json.lock` antes de materializarlo.
- Capacidades especificas del modelo base (razonamiento, codigo, matematicas, tool calling, vision, modo thinking): no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio local de chat sobre APU AMD: desplegar un endpoint compatible con OpenAI en una maquina con Ryzen AI Max+ 395 permite usar el modelo desde herramientas que esperan la API de OpenAI sin depender de la nube, aprovechando la memoria unificada de Strix Halo para un modelo de 27B en `Q4_K_M`.
- Prototipado de aplicaciones LLM en estaciones de trabajo AMD: al exponer `/v1/chat/completions`, se pueden conectar frameworks como LangChain o LlamaIndex apuntando a `127.0.0.1:8080` y validar flujos antes de moverlos a produccion.
- Evaluacion de modelos de 27B en hardware de consumo: el paquete permite medir latencia y calidad de un 27B cuantizado a 4 bits en una APU, un escenario antes reservado a GPUs discretas de gama alta.
- Reproducibilidad de despliegues: el par `model.json` mas `model.json.lock` fija la version del GGUF y de los programas, lo que facilita reconstruir un entorno identico en otra maquina con `loom-fetch`.
- Integracion en pipelines internos de CI: el comando de instalacion y servido es determinista y puede scriptarse para levantar un servidor de inferencia efimero durante pruebas de integracion.
- Desarrollo sin conexion tras la primera descarga: una vez materializado el modelo con `--materialize=copy`, el servidor funciona en local sin llamadas externas, util en entornos con restricciones de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware de referencia: AMD Ryzen AI Max+ 395 (Strix Halo), la plataforma en la que se genero el paquete.
- VRAM estimada: no disponible de forma explicita; un checkpoint de 27B en `Q4_K_M` ronda los 16-17 GB de pesos, aunque la cifra exacta no se documenta en la informacion proporcionada.
- GPU recomendadas: GPUs AMD con soporte ROCm; el comando de ejemplo usa `--device=amdgpu`. No se especifican modelos concretos de GPU discreta.
- GPU de consumo: el paquete esta pensado para APUs con memoria unificada como Strix Halo; la compatibilidad con GPUs de consumo tipo RX 7000/9000 no se detalla.
- Despliegue: SDK Loom (`pip install "hrx-loom[hf]"`), `loom-fetch` para materializar y `loom-serve` para servir.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| `loom-fun/unsloth-Qwen3.8-27B-loom` | 27B | no disponible | `Q4_K_M` | Apache 2.0 | Paquete de despliegue para runtime Loom en AMD |
| `unsloth/Qwen3.8-27B-GGUF` | 27B | no disponible | GGUF (incluye `Q4_K_M`) | no disponible | Checkpoint GGUF original de Unsloth |
| Alternativas de 27B en GGUF | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al checkpoint base porque la informacion disponible no identifica otros paquetes Loom ni modelos equivalentes con datos verificables.

## Limitaciones y advertencias

- Este repositorio no contiene pesos: sin ejecutar `loom-fetch` no hay modelo que cargar. El comando requiere acceso a Hugging Face y espacio en disco para el GGUF.
- Dependencia del runtime Loom y de ROCm: el despliegue esta atado al SDK `hrx-loom` y a hardware AMD; no es portable a CUDA ni a otros backends sin trabajo adicional.
- La cuantizacion `Q4_K_M` introduce perdida de precision respecto al modelo en precision completa; el impacto concreto en calidad no esta documentado aqui.
- No hay informacion sobre sesgos, tasa de alucinacion, idiomas soportados ni limitaciones de contexto del modelo base.
- Aunque la licencia declarada es Apache 2.0, conviene verificar la licencia del checkpoint `unsloth/Qwen3.8-27B-GGUF` antes de un uso comercial, ya que este repositorio solo empaqueta los artefactos de despliegue.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- El endpoint escucha en `127.0.0.1:8080` por defecto; exponerlo en red requiere configuracion adicional y controles de acceso propios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun/unsloth-Qwen3.8-27B-loom
- Checkpoint base: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Fabrica loom-skills: https://github.com/loom-fun/loom-skills
