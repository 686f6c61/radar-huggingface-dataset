# loom-draft/manuelgutierrez-WhiteRabbitNeo-33B-v1.5-loom

## Resumen

`loom-draft/manuelgutierrez-WhiteRabbitNeo-33B-v1.5-loom` no es un modelo entrenado desde cero, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `manuelgutierrez/WhiteRabbitNeo-33B-v1.5-GGUF`, en su cuantizacion Q4_K_M (`whiterabbitneo-33b-v1.5.Q4_K_M.gguf`). El paquete lo publica la organizacion `loom-draft` y se ha generado con la herramienta `loom-next`, que traduce el grafo del modelo a kernels especificos para GPUs AMD.

El objetivo del artefacto es ejecutar un modelo de 33B en hardware AMD de consumo y estacion de trabajo (Ryzen AI Max+ 395 "Strix Halo", gfx1151, y Radeon AI PRO R9700, gfx1201 con 32 GB) mediante `loom-serve`, que expone una API compatible con `/v1/chat/completions` de OpenAI. El modelo subyacente es WhiteRabbitNeo 33B v1.5, un finetune orientado a ciberseguridad (analisis ofensivo y defensivo, generacion de exploits y asistencia en pentesting) derivado de la familia Llama.

La relevancia de esta ficha es doble: por un lado documenta un formato de empaquetado alternativo a llama.cpp para GPUs AMD; por otro, advierte de que el paquete esta en estado de borrador, sin mediciones de rendimiento ni verificaciones de correctitud registradas, y con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only (heredada del checkpoint base WhiteRabbitNeo-33B-v1.5); no se detalla en la informacion disponible |
| Parametros totales | 33B (segun el nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens por peticion (limite del preset Loom) |
| Tipos de cuantizacion | Q4_K_M (unico peso incluido en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF de origen, empaquetado como programas `.loom` (`program/*.loom`, `weights.loom`) mas `tokenizer.json`, `llm_config.json` y `model.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Version de runtime | `hrx-loom[hf]==0.2.0` |

## Arquitectura y entrenamiento

El paquete no incluye informacion sobre el entrenamiento del modelo subyacente: la model card solo describe el proceso de empaquetado. El checkpoint base es WhiteRabbitNeo-33B-v1.5, un finetune de 33B parametros orientado a ciberseguridad, del que no se documentan en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla la arquitectura interna (numero de capas, dimension oculta, atencion GQA o MHA) mas alla de que se trata de un transformer decoder-only compatible con llama.cpp.

La innovacion tecnica del artefacto esta en la capa de ejecucion: `loom-next` genera programas `.loom` (kernels) a partir del grafo del modelo y de `llm_config.json`, y `loom-serve` los ejecuta sobre ROCm/HIP en GPUs AMD, con opciones de reserva de memoria (`--pool_backing=fixed`), precarga de pesos en host (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). El paquete incluye un conjunto de puertas de correctitud (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) que comparan la salida contra llama.cpp sobre el mismo GGUF, pero en esta version todas aparecen como "not yet re-measured".

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI (`/v1/chat/completions`).
- Asistencia en ciberseguridad heredada del finetune WhiteRabbitNeo: analisis de vulnerabilidades, redaccion de PoCs y explicacion de tecnicas ofensivas y defensivas.
- Generacion de codigo y scripts, incluyendo utilidades de explotacion y automatizacion.
- Soporte de 4 peticiones concurrentes con salida de hasta 4.096 tokens por respuesta.
- Tool calling: no aplicable segun la model card.
- Modo razonamiento / thinking: no aplicable segun la model card.
- Decodificacion especulativa: no aplicable segun la model card.
- Entrada de imagen: no determinada ("not determined").
- Entrada y salida de audio: no determinada ("not determined").
- Idiomas: no disponible.

## Casos de uso

- Laboratorio de seguridad ofensiva: el modelo puede generar y explicar PoCs y cadenas de explotacion en un entorno aislado, aprovechando el sesgo de dominio del finetune WhiteRabbitNeo y los 16.384 tokens de contexto para pegar informes de escaneo completos.
- Analisis de codigo y triaje de vulnerabilidades: con 16k de contexto se pueden pasar fragmentos de repositorio o resultados de SAST y pedir clasificacion de hallazgos y sugerencias de remediacion.
- Formacion y CTFs: servir como asistente local para resolver retos de seguridad sin enviar datos a APIs externas, usando el despliegue en Strix Halo o R9700.
- Evaluacion de hardware AMD: banco de pruebas para medir el rendimiento de `loom-serve` frente a llama.cpp en GPUs gfx1151 y gfx1201 con un modelo de 33B en Q4_K_M.
- Automatizacion de documentacion tecnica de seguridad: generacion de informes de pentesting a partir de notas y salidas de herramientas, con hasta 4 peticiones concurrentes.
- Prototipado de asistentes especializados: punto de partida para construir un chatbot interno de seguridad con API compatible con OpenAI, sustituible por otro backend sin cambiar el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo y Radeon AI PRO R9700 "are not yet re-measured", y que todas las puertas de correctitud aparecen sin ejecucion registrada.

| Medicion | Strix Halo (gfx1151) | Radeon AI PRO R9700 (gfx1201) |
|---|---|---|
| Rendimiento vs llama.cpp | no medida | no medida |
| `kernel_tests` | sin registrar | sin registrar |
| `golden` | sin registrar | sin registrar |
| `compare` | sin registrar | sin registrar |
| `consistency` | sin registrar | sin registrar |
| `spec` | sin registrar | sin registrar |
| `agent` | sin registrar | sin registrar |
| `sampling` | sin registrar | sin registrar |
| `logits` | sin registrar | sin registrar |
| `decision` | sin registrar | sin registrar |

## Requisitos de hardware

- VRAM estimada: un modelo de 33B en Q4_K_M ocupa aproximadamente 19-20 GB de pesos; con overhead de contexto (16k tokens) y buffers de ejecucion conviene reservar 22-26 GB. No se han publicado cifras oficiales en la informacion disponible.
- GPU objetivo declaradas: AMD Radeon AI PRO R9700 (32 GB, gfx1201) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada).
- Cabe en GPU de consumo AMD con 24 GB o mas (por ejemplo, Radeon RX 7900 XTX) siempre que el runtime Loom soporte el target; no confirmado en la informacion disponible.
- Despliegue: `loom-serve` mediante `pipx install "hrx-loom[hf]==0.2.0"` y `loom-fetch` para descargar el paquete desde Hugging Face.
- Opciones de despliegue alternativas: al tratarse de un GGUF, el checkpoint base puede servirse con llama.cpp u otros runtimes GGUF, aunque esta ficha documenta el paquete Loom.
- Latencia y throughput: no disponibles (mediciones pendientes).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WhiteRabbitNeo-33B-v1.5 (Loom, este paquete) | 33B | 16.384 | MIT | `.loom` + GGUF Q4_K_M | Paquete de despliegue para AMD; sin benchmarks publicados |
| WhiteRabbitNeo-33B-v1.5-GGUF (base) | 33B | no disponible | MIT | GGUF | Checkpoint original; ejecutable con llama.cpp |
| Alternativas de seguridad de 30-34B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones verificables de alternativas en la informacion proporcionada, por lo que no se incluye una comparativa cuantitativa.

## Limitaciones y advertencias

- Paquete en estado de borrador: 0 descargas, 0 likes y sin verificaciones de correctitud registradas; no debe considerarse listo para produccion.
- El modelo subyacente esta especializado en ciberseguridad ofensiva; puede generar contenido de doble uso (exploits, malware) y requiere politicas de uso y supervision humana.
- Riesgo de alucinacion inherente a los modelos de 33B, agravado en dominios tecnicos donde una respuesta incorrecta puede tener consecuencias de seguridad.
- Contexto limitado a 16.384 tokens por peticion y salida maxima de 4.096 tokens, inferior a modelos actuales con ventanas de 128k.
- Idiomas soportados no documentados; no se garantiza un rendimiento adecuado en castellano.
- Tool calling, modo thinking y decodificacion especulativa no estan soportados en este paquete.
- Soporte de imagen y audio sin determinar.
- Dependencia de un runtime joven (`hrx-loom 0.2.0`) y de hardware AMD especifico; la portabilidad a otras GPUs no esta confirmada.
- La licencia MIT se aplica al paquete, pero conviene verificar las condiciones del checkpoint base y de los datos de entrenamiento originales antes de un uso comercial.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/manuelgutierrez-WhiteRabbitNeo-33B-v1.5-loom
- Modelo base GGUF: https://huggingface.co/manuelgutierrez/WhiteRabbitNeo-33B-v1.5-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
