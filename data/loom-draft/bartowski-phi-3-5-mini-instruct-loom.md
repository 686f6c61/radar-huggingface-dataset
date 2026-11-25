# loom-draft/bartowski-Phi-3.5-mini-instruct-loom

## Resumen

`loom-draft/bartowski-Phi-3.5-mini-instruct-loom` es un paquete de despliegue para el runtime AMD Loom, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF `Phi-3.5-mini-instruct-Q4_K_M.gguf` de bartowski, que a su vez es una cuantizacion del modelo Phi-3.5-mini-instruct de Microsoft, en forma de programas `.loom` y una tarjeta `model.json`. El paquete lo genera la herramienta `loom-next` (el generador, sin LLM en el bucle) y esta orientado a dos aceleradores concretos: la APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente, Phi-3.5-mini-instruct, es un transformer decoder-only de 3.800 millones de parametros con 131.072 tokens de contexto, disenado por Microsoft para instrucciones, razonamiento y codigo en entornos con recursos limitados. Este paquete concreto expone ese modelo a traves de una API compatible con OpenAI (`/v1/chat/completions`) servida por `loom-serve`, con soporte declarado para 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por preset.

La relevancia del artefacto es de infraestructura: permite ejecutar un modelo de 3,8 B en cuantizacion Q4_K_M sobre hardware AMD consumer y profesional (Strix Halo, R9700) mediante kernels generados especificamente para esas arquitecturas, en lugar de depender de llama.cpp. No obstante, en el momento de la publicacion el paquete no incluye mediciones de rendimiento ni evidencia de las puertas de correccion: todas las filas de rendimiento y de `gates` figuran como "not yet re-measured".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-3.5-mini-instruct, segun modelo base); empaquetado como programas `.loom` generados |
| Parametros totales | 3.800 millones (modelo base Phi-3.5-mini); el paquete distribuye pesos cuantizados Q4_K_M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete solo declara esta variante |
| Idiomas soportados | no disponible (la model card del paquete no los enumera) |
| Licencia | MIT |
| Formato de pesos | GGUF de origen; empaquetado como `weights.loom` y programas `program/*.loom`, mas `tokenizer.json`, `llm_config.json`, `model.json` e `info.json` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | Compatible OpenAI (`/v1/chat/completions`) |
| Aceleradores objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Version del runtime | `hrx-loom[hf]==0.2.0` |

## Arquitectura y entrenamiento

El paquete no entrena ni modifica el modelo: reutiliza el checkpoint GGUF `Phi-3.5-mini-instruct-Q4_K_M.gguf` de bartowski, derivado de Phi-3.5-mini-instruct de Microsoft. La capa aportada por Loom consiste en programas `.loom` generados por `loom-next` a partir de `llm_config.json`, que implementan la inferencia sobre los kernels especificos de gfx1151 y gfx1201. El repositorio incluye `weights.loom`, `tokenizer.json`, `llm_config.json`, `model.json` con sus ficheros fuente fijados por sha256 (verificados por `loom-fetch`) e `info.json` con mediciones, evidencia de puertas y versiones.

El modelo subyacente es un transformer decoder-only de 3,8 B parametros con atencion estandar y ventana de 131.072 tokens, entrenado por Microsoft con un pipeline que combina datos web filtrados y datos sinteticos, seguido de ajuste por instrucciones y preferencias (SFT y DPO). No se dispone en la informacion proporcionada de detalles adicionales sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion empleadas. El paquete no implementa decodificacion especulativa, modo de razonamiento, tool calling ni entrada de imagen o audio: la tabla de caracteristicas las marca como "not applicable".

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones multi-turno, heredado de Phi-3.5-mini-instruct.
- Razonamiento basico y resolucion de problemas de matematicas de nivel escolar y universitario introductorio (capacidad del modelo base).
- Generacion y explicacion de codigo en lenguajes habituales (capacidad del modelo base).
- Contexto largo de hasta 131.072 tokens por peticion, adecuado para documentos extensos o historiales largos.
- Servicio concurrente de hasta 4 peticiones simultaneas con salida identica a ejecuciones aisladas (segun la puerta `consistency` definida, aunque sin evidencia registrada).
- API compatible con OpenAI para integracion directa con clientes existentes.
- Tool calling: no soportado en este paquete ("not applicable").
- Modo de razonamiento o thinking: no soportado ("not applicable").
- Decodificacion especulativa: no soportada ("not applicable").
- Entrada de imagen o audio: no soportada ("not applicable").
- Muestreo (temperature, top_k, seed): estado "not determined" en la model card.

## Casos de uso

- Asistente conversacional local en estacion de trabajo AMD: desplegar `loom-serve` sobre una Radeon AI PRO R9700 o un equipo Strix Halo y exponer un endpoint compatible con OpenAI para herramientas internas de chat, aprovechando los 131.072 tokens de contexto para conversaciones con historial extenso.
- Procesamiento de documentos largos: resumir o extraer informacion de contratos, informes o documentacion tecnica de hasta 131k tokens en una sola peticion, sin necesidad de trocear el texto.
- Generacion de codigo en entornos sin GPU NVIDIA: usar el paquete como backend de autocompletado o generacion de codigo en pipelines de desarrollo sobre hardware AMD, con un limite de 4.096 tokens de salida por peticion.
- Prototipado de aplicaciones LLM en hardware AMD: validar integraciones con SDKs compatibles con OpenAI contra un servidor local antes de migrar a infraestructura mayor, gracias a la compatibilidad de la API.
- Despliegue en entornos con requisitos de licencia permisiva: al ser MIT tanto el paquete como el modelo base, puede integrarse en productos comerciales sin obligaciones de atribucion mas alla de las habituales de MIT.
- Evaluacion de kernels generados para gfx1151/gfx1201: usar el paquete como banco de pruebas para comparar la salida de Loom frente a llama.cpp con el mismo GGUF (puertas `golden`, `compare`, `kernel_tests`), una vez se registren mediciones.
- Servicio de bajo volumen con concurrencia limitada: atender hasta 4 peticiones simultaneas en un unico acelerador para herramientas internas o demos, con un modelo de 3,8 B que cabe holgadamente en 32 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran sin evidencia registrada en ambas plataformas. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput para este paquete.

## Requisitos de hardware

- VRAM estimada: el checkpoint Q4_K_M de un modelo de 3,8 B ocupa del orden de 2,3-2,5 GB en pesos; el paquete no publica una cifra oficial de VRAM total necesaria (incluyendo pool de KV cache y buffers), por lo que no disponible.
- GPU objetivo declaradas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151).
- Compatibilidad con GPU consumer: no se declara soporte para GPUs de consumo AMD o NVIDIA; el paquete esta generado especificamente para gfx1151 y gfx1201.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servir el endpoint. Opciones recomendadas en la model card: `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU).
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles para este formato; el paquete solo se sirve con `loom-serve`.
- Latencia y throughput: no disponibles (sin mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Phi-3.5-mini-instruct (paquete Loom, este artefacto) | 3,8 B | 131.072 | MIT | GGUF Q4_K_M empaquetado en `.loom`; `loom-serve` | Solo gfx1151 y gfx1201; sin benchmarks ni puertas de correccion registradas |
| Phi-3.5-mini-instruct (GGUF de bartowski) | 3,8 B | 131.072 | MIT | GGUF; llama.cpp y derivados | Referencia de correccion del paquete Loom; ejecutable en CPU y en GPUs variadas |
| Phi-3.5-mini-instruct (original de Microsoft) | 3,8 B | 131.072 | MIT | safetensors; transformers, vLLM, TGI | Checkpoint de referencia sin cuantizar |
| Llama 3.2 3B Instruct | 3,2 B | 131.072 | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamano similar; licencia no MIT y con restricciones de uso |

La comparacion se limita a parametros, contexto y licencia porque no hay datos de rendimiento publicados para este paquete. No se dispone de comparativas de throughput o calidad frente a llama.cpp en las mismas GPU objetivo.

## Limitaciones y advertencias

- Ausencia total de evidencia de correccion: las once puertas de `loom-benchmark` figuran como "not yet re-measured" en ambas plataformas; no hay garantia publicada de que la salida coincida con llama.cpp.
- Sin mediciones de rendimiento: no se puede estimar latencia ni throughput frente a llama.cpp en Strix Halo ni en R9700.
- Compatibilidad de hardware muy restringida: solo gfx1151 y gfx1201; no funciona en GPUs NVIDIA, en GPUs AMD de otras arquitecturas ni, segun la documentacion, en CPU.
- Capacidades ausentes: sin tool calling, sin modo de razonamiento, sin decodificacion especulativa, sin vision ni audio. El estado del muestreo figura como "not determined".
- Limite de salida de 4.096 tokens por peticion, que puede ser insuficiente para generacion de documentos largos o cadenas de razonamiento extensas.
- Concurrencia maxima de 4 peticiones, inadecuada para cargas de produccion con muchos usuarios simultaneos.
- Riesgo de alucinacion inherente al modelo base Phi-3.5-mini, agravado por la cuantizacion Q4_K_M; no se han publicado evaluaciones de sesgo para este paquete.
- Idiomas soportados no declarados en la model card del paquete; debe consultarse la documentacion de Phi-3.5-mini-instruct para el detalle.
- Licencia MIT permisiva para uso comercial, pero el usuario debe verificar las condiciones del checkpoint de origen y de los ficheros fuente fijados por sha256.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion por terceros.
- El paquete incluye espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`) en las mediciones de referencia, lo que consume CPU mientras hay trabajo en vuelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-Phi-3.5-mini-instruct-loom
- Modelo base GGUF: https://huggingface.co/bartowski/Phi-3.5-mini-instruct-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
