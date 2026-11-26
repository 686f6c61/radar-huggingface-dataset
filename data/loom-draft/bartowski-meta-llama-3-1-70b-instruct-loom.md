# loom-draft/bartowski-Meta-Llama-3.1-70B-Instruct-loom

## Resumen
Este repositorio no contiene un modelo entrenado por su autor, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `Meta-Llama-3.1-70B-Instruct-Q4_K_M.gguf` de bartowski. El modelo subyacente es Llama 3.1 70B Instruct, un transformer denso de Meta con 70 mil millones de parametros y ventana de contexto nativa de 128 000 tokens, aqui limitada a 96 256 tokens por peticion en la configuracion del preset. El paquete lo publica `loom-draft` y esta pensado para ejecutarse con `loom-serve` (runtime `hrx-loom` 0.2.0) sobre GPUs AMD concretas: Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

La relevancia es de infraestructura, no de modelado: ofrece una via para servir un 70B en cuantizacion Q4_K_M sobre hardware AMD consumer y de estacion de trabajo mediante kernels generados, con API compatible con OpenAI, soporte de tool calling y hasta 4 peticiones concurrentes. El paquete se genero con `loom-next` sin intervencion de un LLM en el bucle, y el autor declara explicita y repetidamente que las mediciones de rendimiento y las puertas de correccion aun no se han vuelto a medir para este paquete concreto.

Conviene tratarlo como artefacto experimental: 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks publicados y con todas las puertas de validacion marcadas como "not yet re-measured". La licencia declarada en el repositorio es MIT, mientras que los pesos originales de Llama 3.1 se rigen por la Llama 3.1 Community License, una discrepancia que hay que resolver antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) del checkpoint base Llama 3.1 70B Instruct; el repositorio empaqueta kernels generados en formato Loom |
| Parametros totales | 70 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 96 256 tokens por peticion en el preset; contexto nativo del modelo base 128 000 tokens |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint referenciado: `Meta-Llama-3.1-70B-Instruct-Q4_K_M.gguf`) |
| Idiomas soportados | no disponible en la informacion del repositorio (el modelo base Llama 3.1 es multilingue, con enfasis en ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | MIT declarada en el repositorio; los pesos base estan sujetos a la Llama 3.1 Community License |
| Formato de pesos | GGUF de origen, empaquetado como programas `.loom` y `weights.loom` |
| Salida maxima | 4 096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | `/v1/chat/completions` estilo OpenAI |
| Tool calling | Si, estilo OpenAI (`tools` y `tool_calls`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento
El modelo subyacente es Llama 3.1 70B Instruct, un transformer decoder-only denso de Meta AI. La informacion proporcionada no incluye detalles de entrenamiento (numero de tokens, composicion del dataset, fases de RLHF o DPO) ni innovaciones de arquitectura del checkpoint original; esos datos corresponden a la documentacion de Meta y no aparecen en este repositorio. Lo que si describe el repositorio es la capa de despliegue: `loom-next` genera programas `.loom` especificos para cada GPU a partir del GGUF sin modificar, y `loom-serve` los ejecuta sobre el runtime IREE/ROCm. El paquete incluye `model.json` y `model.json.lock` con los ficheros fuente fijados y verificacion sha256 en `loom-fetch`.

La configuracion de ejecucion usa `--pool_backing=fixed` para reservar el pool de memoria por adelantado y, en el caso de la R9700, `--parameter_mode=preload` para precargar pesos en el host (solo afecta a la carga, no al rendimiento medido). El parametro `completion_spin_ns=4294967295` activa espera activa de las finalizaciones de GPU, consumiendo CPU mientras hay trabajo en vuelo. En hosts con el limite memlock por defecto de 8 MiB, el autor indica arrancar mediante `systemd-run` con `SystemCallFilter=~io_uring_setup` para que IREE use su proactor POSIX, o bien elevar `ulimit -l`. No se documenta decodificacion especulativa, modo thinking ni cuantizacion adicional.

## Capacidades
- Generacion de texto conversacional e instrucciones en el estilo de Llama 3.1 Instruct, con plantilla de chat propia del modelo base.
- Tool calling / function calling con esquema compatible con OpenAI (`tools` y `tool_calls`), validado por la puerta `agent` del banco de pruebas (aunque sin medicion registrada para este paquete).
- API HTTP compatible con OpenAI en `/v1/chat/completions`, lo que permite reutilizar clientes y SDK existentes.
- Concurrencia de hasta 4 peticiones simultaneas con la puerta `consistency` definida para verificar que la salida concurrente coincide con la secuencial.
- Contexto de 96 256 tokens por peticion, adecuado para documentos largos y conversaciones multi-turno extensas.
- Salida de hasta 4 096 tokens por respuesta.
- Capacidades multilingues heredadas del modelo base (no verificadas en este paquete).
- No soporta razonamiento explicito o thinking mode, ni entrada de imagen, ni audio, ni decodificacion especulativa: la tabla de features del autor marca esas filas como no aplicables.
- El muestreo (`temperature`, `top_k`, `seed`) figura como "not determined" en la tabla de features, aunque existe una puerta `sampling` definida sin medicion registrada.

## Casos de uso
- Servicio de chat autohospedado en estacion de trabajo AMD: desplegar `loom-serve` en una Radeon AI PRO R9700 de 32 GB y exponer un endpoint compatible con OpenAI para herramientas internas, reutilizando clientes existentes sin adaptadores.
- Procesamiento de documentos largos: con 96 256 tokens por peticion se pueden analizar contratos, informes o bases de codigo de decenas de miles de tokens en una sola pasada, sin trocear el contexto.
- Asistentes con herramientas en flujos internos: el soporte de `tools`/`tool_calls` permite construir agentes que consulten APIs o bases de datos, siempre que se validen previamente las puertas `agent` y `agent_think_off`, que en este paquete no tienen medicion registrada.
- Evaluacion de hardware AMD para inferencia de modelos grandes: el paquete sirve como banco de pruebas para comparar Strix Halo y R9700 frente a llama.cpp con el mismo GGUF, mediante las puertas `golden` y `compare`.
- Laboratorio de investigacion en compilacion de kernels: los programas `.loom` generados por `loom-next` permiten estudiar la generacion automatica de kernels para una GPU concreta y contrastar su correccion con las puertas `kernel_tests` y `logits`.
- Prototipado de aplicaciones conversacionales con concurrencia limitada: 4 peticiones simultaneas bastan para demos, entornos de staging o equipos pequenos, no para produccion con trafico alto.
- Entornos con requisitos de soberania del dato: al ejecutarse en hardware local sin dependencia de API externa, encaja en escenarios donde el texto no puede salir de la infraestructura propia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El repositorio declara explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No hay cifras de MMLU, HumanEval, GSM8K, tokens por segundo ni latencia para este paquete.

## Requisitos de hardware
- VRAM estimada: un 70B en Q4_K_M ocupa del orden de 40-42 GB de pesos, por encima de los 32 GB de la Radeon AI PRO R9700; el autor no documenta como se reparte la memoria entre VRAM y memoria unificada en cada plataforma. No disponible la cifra exacta de VRAM requerida por el preset.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- No se documenta soporte para A100, H100 ni RTX 4090; el paquete esta generado para las arquitecturas AMD indicadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve` con `--pool_backing=fixed`; en R9700 se anade `--parameter_mode=preload`.
- En hosts con memlock de 8 MiB, arrancar con `systemd-run --user --pty --same-dir -p SystemCallFilter=~io_uring_setup -p SystemCallErrorNumber=ENOSYS` o elevar `ulimit -l`.
- No se documentan alternativas de despliegue como vLLM, llama.cpp, Ollama o TGI para este paquete; llama.cpp aparece unicamente como referencia de correccion en las puertas del banco de pruebas.
- Latencia y throughput: no disponibles; el autor indica que las mediciones aun no se han repetido para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Este paquete (Llama 3.1 70B Instruct Q4_K_M, Loom) | 70B densos | 96 256 tokens por peticion | `.loom` + `loom-serve` sobre AMD gfx1151 / gfx1201 | MIT declarada (pesos: Llama 3.1 Community License) | Sin benchmarks ni puertas de correccion medidas |
| `bartowski/Meta-Llama-3.1-70B-Instruct-GGUF` | 70B densos | 128 000 tokens nativos | GGUF para llama.cpp y derivados | Llama 3.1 Community License | Checkpoint de origen, mismo Q4_K_M; ecosistema amplio y probado |
| Llama 3.1 70B Instruct (pesos originales de Meta) | 70B densos | 128 000 tokens | safetensors (FP16/BF16) | Llama 3.1 Community License | Referencia oficial; requiere mucha mas memoria |
| Alternativas de 70B en Q4 para hardware consumer | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias
- Ausencia total de validacion publicada: todas las puertas de correccion del banco de pruebas figuran como no medidas para este paquete, y no hay benchmarks de calidad ni de rendimiento.
- Rendimiento sin verificar: el autor no ha vuelto a medir las tablas comparativas frente a llama.cpp para ninguna de las dos GPUs objetivo.
- Discrepancia de licencia: el repositorio declara MIT, pero los pesos de Llama 3.1 estan sujetos a la Llama 3.1 Community License, con condiciones de atribucion, nomenclatura y umbral de usuarios activos mensuales para uso comercial. Verificar antes de desplegar en produccion.
- Contexto reducido respecto al modelo base: 96 256 tokens por peticion frente a los 128 000 nativos, y salida maxima de 4 096 tokens.
- Concurrencia muy limitada: 4 peticiones simultaneas, insuficiente para cargas de produccion con trafico real.
- Dependencia fuerte de hardware y runtime concretos: solo se documentan Strix Halo (gfx1151) y Radeon R9700 (gfx1201); no hay garantia en otras GPUs, incluidas NVIDIA.
- Configuracion delicada del host: limites de memlock, necesidad de `systemd-run` o `ulimit -l`, y espera activa de GPU que consume CPU durante la inferencia.
- Riesgo de alucinacion y sesgos: heredados del modelo base Llama 3.1 Instruct; no se documenta ninguna mitigacion adicional en este paquete.
- Idiomas: no se declara lista de idiomas soportados en el repositorio; el comportamiento multilingue no esta verificado para este empaquetado.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia (26 de noviembre de 2026), sin comunidad ni soporte documentado.
- Muestreo no determinado: la tabla de features marca `sampling` como "not determined", lo que anade incertidumbre sobre la reproducibilidad de las salidas.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-Meta-Llama-3.1-70B-Instruct-loom
- Checkpoint GGUF de origen: https://huggingface.co/bartowski/Meta-Llama-3.1-70B-Instruct-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
