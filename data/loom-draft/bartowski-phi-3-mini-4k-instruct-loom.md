# loom-draft/bartowski-Phi-3-mini-4k-instruct-loom

## Resumen

`loom-draft/bartowski-Phi-3-mini-4k-instruct-loom` es un paquete de despliegue para el runtime AMD Loom que empaqueta el checkpoint GGUF sin modificar `bartowski/Phi-3-mini-4k-instruct-GGUF` (concretamente la cuantizacion `Phi-3-mini-4k-instruct-Q4_K_M.gguf`). No se trata de un modelo nuevo ni de un fine-tune: es una distribucion de artefactos generados (programas `.loom`, `weights.loom` y una tarjeta `model.json`) que permiten servir el modelo Phi-3 mini de Microsoft sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

El paquete lo publica el usuario `loom-draft` y se ha generado con `loom-next`, el generador del ecosistema Loom, sin intervencion de un LLM en el bucle. Su interes practico es que ofrece una via de inferencia nativa sobre ROCm/HIP para hardware AMD concreto, exponiendo una API compatible con `/v1/chat/completions` de OpenAI a traves de `loom-serve`, en lugar de depender de llama.cpp u otros backends.

El modelo subyacente, Phi-3-mini-4k-instruct, es un transformer denso de 3.800 millones de parametros con una ventana de contexto de 4.096 tokens, entrenado por Microsoft para instrucciones. La relevancia de este paquete es, por tanto, de infraestructura: valida el modelo original sobre GPU AMD consumer y profesional mediante un stack alternativo. En el momento de la publicacion no hay mediciones de rendimiento ni evidencias de correccion registradas para este paquete concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Phi-3-mini de Microsoft), empaquetado como programas Loom para GPU AMD |
| Parametros totales | 3.800 millones (modelo base Phi-3-mini); el paquete redistribuye el GGUF Q4_K_M |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado); el paquete no lista otras variantes |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | MIT |
| Formato de pesos | GGUF (`Phi-3-mini-4k-instruct-Q4_K_M.gguf`) convertido a `weights.loom` y programas `program/*.loom`; incluye `tokenizer.json`, `llm_config.json`, `info.json` y `model.json` |
| Modelo base | `bartowski/Phi-3-mini-4k-instruct-GGUF` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Concurrencia | 4 peticiones concurrentes |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |

## Arquitectura y entrenamiento

El modelo subyacente es Phi-3-mini-4k-instruct de Microsoft: un transformer decoder-only denso de 3.800 millones de parametros con atencion multi-cabeza estandar y una ventana de contexto de 4.096 tokens, afinado para seguir instrucciones. La model card del paquete no aporta detalles sobre el dataset de entrenamiento, el numero de tokens, ni sobre si hubo RLHF, DPO u otras fases de alineamiento; esa informacion corresponde a la documentacion oficial de Microsoft y no se incluye aqui.

La innovacion del paquete no esta en el modelo sino en el runtime. `loom-next` genera programas `.loom` especificos para el GGUF y para cada GPU objetivo, y `loom-serve` los ejecuta sobre ROCm/HIP con parametros de despliegue concretos: `completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU), `--pool_backing=fixed` (pool de memoria reservado por adelantado) y `--parameter_mode=preload` (carga de pesos en host). El paquete incluye gates de correccion (kernel_tests, golden, compare, consistency, sampling, logits, entre otros) que comparan la salida contra una referencia de llama.cpp sobre el mismo GGUF, aunque en esta version todos aparecen como "not yet re-measured".

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredadas de Phi-3-mini-4k-instruct.
- Razonamiento basico y respuesta a preguntas en formato chat multi-turno.
- Generacion de codigo y matematicas a nivel de modelo pequeno (capacidad del base, no verificada en este paquete).
- API compatible con OpenAI: endpoint `/v1/chat/completions` servido por `loom-serve` en `127.0.0.1:8080`.
- Soporte de concurrencia: hasta 4 peticiones simultaneas.
- Tool calling: marcado como "not applicable" en la model card del paquete.
- Modo de razonamiento / thinking: "not applicable".
- Decodificacion especulativa: "not applicable".
- Entrada de imagen y audio: estado "not determined" (no confirmado).
- Muestreo (temperature, top_k, seed): estado "not determined" en la tabla de caracteristicas, aunque existe un gate `sampling` definido.

## Casos de uso

- Despliegue de un asistente conversacional local en estaciones de trabajo con Ryzen AI Max+ 395: el paquete permite arrancar `loom-serve` y consumir el endpoint OpenAI sin instalar llama.cpp, con 4 peticiones concurrentes y contexto de 4.096 tokens, adecuado para un unico usuario o un equipo pequeno.
- Prototipado de aplicaciones sobre ROCm en GPU AMD: al exponer una API compatible con OpenAI, cualquier cliente que ya hable con OpenAI puede apuntar a `http://127.0.0.1:8080/v1/chat/completions` cambiando solo la URL base, lo que facilita portar demos existentes a hardware AMD.
- Validacion de la cadena de herramientas Loom: el paquete sirve como caso de prueba para verificar que `loom-fetch` materializa correctamente los artefactos, que `loom-serve` arranca con los flags prescritos y que la tokenizacion coincide con la referencia.
- Generacion de texto y resumenes de documentos cortos: con 4.096 tokens de contexto, encaja en tareas de resumen de correos, actas o fragmentos de documentacion tecnica de hasta unas pocas paginas.
- Educacion y experimentacion con modelos pequenos: el tamano de 3.800 millones en Q4_K_M permite ejecutarlo en una GPU de 32 GB junto con otros procesos, lo que lo hace util para cursos y talleres sobre inferencia en GPU AMD.
- Backend de pruebas en CI para aplicaciones de chat: al ser un paquete autocontenido con `model.json` y hashes verificados por `loom-fetch`, se puede fijar una version concreta y usarla como servidor de pruebas determinista en pipelines de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo y Radeon AI PRO R9700, pero ambas indican que "the results for this package are not yet re-measured". Del mismo modo, todos los gates de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" para ambas GPU.

## Requisitos de hardware

- VRAM estimada: el checkpoint es Q4_K_M de un modelo de 3.800 millones de parametros; una estimacion razonable ronda los 2,5-3 GB de pesos, mas overhead de KV cache y del pool de memoria fijo que reserva `--pool_backing=fixed`. La model card no publica una cifra exacta de VRAM.
- GPU soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para RTX 4090, A100, H100 ni otras GPU NVIDIA; el paquete esta orientado a AMD via ROCm/HIP.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI como alternativas para este paquete.
- Latencia y throughput: no disponibles; las mediciones frente a llama.cpp estan pendientes de re-medicion en ambas GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Este paquete (Phi-3-mini-4k-instruct Q4_K_M para Loom) | 3.800 M | 4.096 | MIT | GGUF convertido a `.loom`, runtime `loom-serve` sobre ROCm | Solo GPU AMD Strix Halo y R9700; sin benchmarks publicados |
| `bartowski/Phi-3-mini-4k-instruct-GGUF` | 3.800 M | 4.096 | MIT | GGUF, runtime llama.cpp | Mismo checkpoint sin empaquetar; referencia usada por los gates de Loom |
| Phi-3-mini-4k-instruct original (Microsoft) | 3.800 M | 4.096 | MIT | safetensors, runtime PyTorch/Transformers | Modelo base oficial, sin cuantizar |
| Phi-3.5-mini-instruct (Microsoft) | 3.800 M | 128.000 | MIT | safetensors, GGUF en terceros | Generacion posterior con contexto mucho mayor; no es objeto de este paquete |

La comparativa se limita a variantes del mismo modelo base porque la informacion proporcionada no incluye datos de rendimiento que permitan contrastarlo con otros modelos de tamano similar.

## Limitaciones y advertencias

- El paquete no aporta evidencias de correccion: todos los gates de la model card figuran como "not yet re-measured", por lo que no hay validacion publicada de que la salida coincida con la referencia de llama.cpp en esta version.
- No hay mediciones de rendimiento publicadas para ninguna de las dos GPU objetivo; se desconoce el throughput y la latencia reales.
- El contexto esta limitado a 4.096 tokens por peticion, insuficiente para documentos largos o conversaciones extensas.
- Tool calling, modo de razonamiento y decodificacion especulativa estan marcados como "not applicable"; no se debe asumir soporte de agentes multi-paso.
- El soporte de imagen, audio y muestreo figura como "not determined": no hay confirmacion de que funcionen.
- La concurrencia esta limitada a 4 peticiones simultaneas, lo que restringe su uso como backend de produccion con trafico alto.
- El hardware soportado es muy especifico (Strix Halo gfx1151 y R9700 gfx1201); no se documenta compatibilidad con otras GPU AMD ni con NVIDIA.
- El modelo base Phi-3-mini puede alucinar y presenta sesgos inheritos a su dataset de entrenamiento; la model card del paquete no documenta evaluaciones de sesgo ni de seguridad.
- La licencia MIT del paquete no exime de verificar la licencia del checkpoint base y de los terminos de uso de Microsoft para Phi-3.
- El paquete se publico con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-Phi-3-mini-4k-instruct-loom
- Checkpoint base en Hugging Face: https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
