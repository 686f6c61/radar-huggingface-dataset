# loom-draft/unsloth-QwQ-32B-loom

## Resumen

`loom-draft/unsloth-QwQ-32B-loom` es un paquete de despliegue para el runtime AMD Loom, no un modelo nuevo. Empaqueta el checkpoint GGUF sin modificar `QwQ-32B-Q4_K_M.gguf` de `unsloth/QwQ-32B-GGUF` junto con programas `.loom` generados y una tarjeta `model.json`, orientados a las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB). El generador empleado es `loom-next`, sin intervención de un LLM en el bucle.

El modelo subyacente es QwQ-32B, un transformer denso de 32.000 millones de parametros con modo de razonamiento siempre activo, publicado por el equipo Qwen. Este paquete no aporta pesos nuevos ni fine-tuning: su valor esta en ofrecer una ruta de inferencia nativa en ROCm/HIP para hardware AMD consumer y profesional, con API compatible con OpenAI.

La relevancia es acotada: el paquete es un borrador (autor `loom-draft`, cero descargas) y su propia model card indica que las mediciones de rendimiento y las puertas de correccion (`kernel_tests`, `golden`, `compare`, `agent`, `sampling`, etc.) "aun no se han vuelto a medir" en ambas GPU. Debe tratarse como material experimental, no como artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (QwQ-32B); paquete de despliegue para runtime AMD Loom |
| Parametros totales | 32.000 millones (modelo base QwQ-32B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens por peticion (segun la tarjeta del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`QwQ-32B-Q4_K_M.gguf`) mas programas `.loom` y `weights.loom` generados |

Otros parametros operativos declarados: maximo de 4.096 tokens de salida (preset `max_tokens`), 4 peticiones concurrentes, API estilo OpenAI en `/v1/chat/completions`, tool calling con `tools`/`tool_calls`, razonamiento siempre activo, sin decodificacion especulativa, sin entrada de imagen ni audio.

## Arquitectura y entrenamiento

El modelo subyacente QwQ-32B es un transformer denso de 32.000 millones de parametros con atencion completa y un modo de razonamiento explicito siempre activo. La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens, ni si hubo RLHF o DPO; estos datos corresponden a la model card original de QwQ-32B, que no se incluye en la informacion proporcionada.

La innovacion tecnica de este artefacto no esta en el modelo sino en el empaquetado: `loom-next` genera kernels y programas `.loom` especificos para las arquitecturas gfx1151 y gfx1201 a partir de `llm_config.json`, con verificacion sha256 de los ficheros fuente mediante `loom-fetch`. La tarjeta describe puertas de correccion frente a llama.cpp (tokens greedy, top-5 log-probs, consistencia bajo concurrencia, tool calling multi-turno, muestreo, logits en host), pero ninguna tiene evidencia registrada en el momento de publicacion.

## Capacidades

- Generacion de texto y razonamiento explicito con modo "thinking" siempre activo.
- Tool calling estilo OpenAI (`tools` y `tool_calls`), con puerta de validacion `agent` prevista para bucles multi-turno.
- API compatible con OpenAI (`/v1/chat/completions`), lo que facilita integracion con clientes existentes.
- Concurrencia de hasta 4 peticiones simultaneas.
- Contexto de 32.768 tokens por peticion, adecuado para documentos largos de hasta 32k segun la puerta `golden`.
- Sin decodificacion especulativa, sin vision, sin audio ni salida de audio.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidad de decision (choice, score, probabilidades) prevista en la puerta `decision`.

## Casos de uso

- Razonamiento sobre documentos largos en estaciones AMD: el contexto de 32.768 tokens permite cargar contratos, informes o transcripciones completas y formular preguntas sobre ellos en una sola peticion, sin fragmentar.
- Asistente de codigo local en un Ryzen AI Max+ 395: el paquete se sirve con `loom-serve` y expone un endpoint compatible con OpenAI, por lo que puede conectarse a extensiones de IDE que ya hablan ese protocolo.
- Automatizacion de agentes con tool calling: la API acepta `tools` y devuelve `tool_calls`, lo que permite orquestar llamadas a funciones en flujos multi-paso; conviene validar la puerta `agent` antes de usarlo en produccion.
- Despliegue en GPU profesional Radeon AI PRO R9700 de 32 GB: el checkpoint Q4_K_M cabe en los 32 GB de VRAM de esa tarjeta, lo que permite servir el modelo en un solo dispositivo sin repartir pesos entre host y GPU.
- Prototipado de inferencia ROCm/HIP: util para equipos que quieran evaluar el runtime Loom frente a llama.cpp con el mismo GGUF y comparar tokens greedy y log-probs.
- Servicio interno de chat con concurrencia moderada: 4 peticiones simultaneas y 4.096 tokens de salida por peticion encajan en un equipo de trabajo pequeno o en un entorno de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "aun no se han vuelto a medir", y que todas las puertas de correccion figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: el checkpoint Q4_K_M de un modelo de 32.000 millones de parametros ronda los 19-20 GB de pesos; el paquete declara un pool de memoria fijo (`--pool_backing=fixed`) cuyo tamano exacto no se detalla en la informacion disponible.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Cabe en la R9700 de 32 GB; en Strix Halo depende de la memoria unificada asignada a la GPU, no especificada.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones para este paquete concreto.
- Flags relevantes: `completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU, consume CPU), `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| `loom-draft/unsloth-QwQ-32B-loom` | 32B denso | 32.768 | Q4_K_M | Apache 2.0 | GGUF + programas `.loom`, runtime AMD Loom |
| `unsloth/QwQ-32B-GGUF` (base) | 32B denso | no disponible en la informacion | multiples GGUF en el repo original | Apache 2.0 | GGUF, runtime llama.cpp y compatibles |
| QwQ-32B original (Qwen) | 32B denso | no disponible en la informacion | safetensors y derivados | Apache 2.0 | safetensors, transformers y ecosistema |

La comparacion se limita al mismo modelo en distintos empaquetados, ya que la informacion proporcionada no incluye datos de rendimiento ni de otros modelos de la misma categoria. No se dispone de cifras para comparar throughput, latencia ni calidad frente a alternativas.

## Limitaciones y advertencias

- Artefacto en estado de borrador: autor `loom-draft`, cero descargas y cero likes; no hay evidencia de uso en produccion.
- Ninguna puerta de correccion tiene resultados registrados; no hay verificacion publicada de que la salida coincida con llama.cpp.
- Sin mediciones de rendimiento: no se puede afirmar que sea mas rapido o mas lento que llama.cpp en el mismo hardware.
- El modo de razonamiento esta siempre activo y no se puede desactivar mediante "reasoning effort" (no aplicable segun la tarjeta), lo que incrementa el consumo de tokens en cada respuesta.
- Limite de 4.096 tokens de salida y 4 peticiones concurrentes por defecto; insuficiente para cargas de alta concurrencia.
- Sin soporte de vision ni audio, aunque la puerta `vision` figure en la lista (marcada como no aplicable en features).
- Idiomas soportados no declarados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero al tratarse de un paquete de despliegue conviene verificar la licencia del modelo base QwQ-32B y del GGUF de unsloth por separado.
- Riesgo de alucinacion inherente a un modelo de 32B con razonamiento explicito; sin datos de evaluacion en este paquete no es posible acotarlo.
- Dependencia de hardware AMD especifico (gfx1151, gfx1201); no se declara compatibilidad con otras GPU.
- La busqueda web realizada devuelve resultados sobre el producto Loom de grabacion de pantalla y la marca de ropa Loom, no relacionados con este runtime; no aportan informacion tecnica adicional.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/unsloth-QwQ-32B-loom
- Modelo base GGUF: https://huggingface.co/unsloth/QwQ-32B-GGUF
- Repositorio del runtime: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
