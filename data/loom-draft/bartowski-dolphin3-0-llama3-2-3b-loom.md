# loom-draft/bartowski-Dolphin3.0-Llama3.2-3B-loom

## Resumen

Dolphin3.0-Llama3.2-3B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el usuario `loom-draft` a partir del checkpoint GGUF `bartowski/Dolphin3.0-Llama3.2-3B-GGUF`, en concreto la cuantizacion Q4_K_M. No se trata de un modelo nuevo ni de un fine-tune adicional: los pesos subyacentes son los del Dolphin 3.0 de Cognitive Computations sobre Llama 3.2 de 3B, sin modificaciones. El aporte del repositorio es exclusivamente el empaquetado para el runtime Loom sobre GPUs AMD.

El paquete esta orientado a dos aceleradores concretos: el APU AMD Ryzen AI Max+ 395, nombre en clave "Strix Halo" (objetivo gfx1151), y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM). Se genera con la herramienta `loom-next` y se sirve mediante `loom-serve`, que expone una API compatible con el endpoint `/v1/chat/completions` de OpenAI.

Su relevancia es acotada pero especifica: permite ejecutar un modelo de 3B cuantizado a Q4_K_M sobre hardware AMD con soporte ROCm, sin depender de llama.cpp, con un contexto declarado de 131.072 tokens por peticion y 4 peticiones concurrentes. El repositorio tiene cero descargas y cero likes, y las mediciones de rendimiento y las puertas de correccion aun no se han vuelto a medir, por lo que debe considerarse un artefacto en estado preliminar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 3B, pesos sin modificar) |
| Parametros totales | 3B (aproximado, segun el nombre del checkpoint base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens por peticion (segun la model card del paquete Loom) |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como programas `.loom` y `weights.loom` |

## Arquitectura y entrenamiento

El modelo subyacente es Llama 3.2 3B, un transformer decoder-only denso de aproximadamente 3.000 millones de parametros, afinado posteriormente por Cognitive Computations en la familia Dolphin 3.0. El paquete Loom no altera ni reentrena los pesos: toma el GGUF Q4_K_M publicado por bartowski y genera programas `.loom` especificos para los objetivos gfx1151 y gfx1201 mediante `loom-next`, un generador que opera sin LLM en el bucle segun la propia model card.

No se dispone de informacion en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset del fine-tune Dolphin 3.0, ni sobre si se aplicaron tecnicas de RLHF, DPO o similares. Tampoco se detallan innovaciones de atencion (no hay atencion lineal ni decodificacion especulativa: la tabla de caracteristicas del paquete marca "speculative decoding" como no aplicable). El paquete incluye `tokenizer.json` y `llm_config.json`, y `model.json.lock` fija los ficheros de origen con verificacion sha256 en `loom-fetch`.

## Capacidades

- Generacion de texto conversacional y razonamiento general, heredadas del checkpoint Dolphin 3.0 sobre Llama 3.2 3B.
- Servicio mediante API compatible con OpenAI en `/v1/chat/completions`.
- Contexto de 131.072 tokens por peticion, adecuado para documentos largos o historiales extensos.
- Concurrencia de hasta 4 peticiones simultaneas.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Tool calling: no aplicable segun la tabla de caracteristicas del paquete.
- Modo razonamiento / thinking: no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen: no aplicable.
- Entrada o salida de audio: no aplicable.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue de un asistente conversacional local en estaciones de trabajo con Ryzen AI Max+ 395: el paquete se instala con `pipx install "hrx-loom[hf]==0.2.0"` y se sirve con `loom-serve`, sin necesidad de configurar llama.cpp ni de compilar kernels a mano.
- Procesamiento de documentos largos en local: los 131.072 tokens de contexto permiten ingerir contratos, informes o transcripciones extensas en una sola peticion sobre hardware de escritorio AMD.
- Prototipado de aplicaciones con SDK de OpenAI: al exponer `/v1/chat/completions`, cualquier cliente compatible con la API de OpenAI puede apuntar a `http://127.0.0.1:8080` cambiando solo la URL base y el nombre del modelo.
- Evaluacion de la cadena de herramientas Loom en un equipo Radeon AI PRO R9700: sirve como banco de pruebas para validar `loom-fetch`, `loom-serve` y las puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`) antes de adoptar el runtime en produccion.
- Generacion de texto por lotes en un servidor con una sola GPU de 32 GB: con 4 peticiones concurrentes y un modelo de 3B en Q4_K_M, el consumo de VRAM es reducido y deja margen para otros servicios en la misma GPU.
- Tareas de clasificacion, resumen y reescritura de texto en entornos con requisitos de soberania del dato: al ejecutarse integramente en local sobre hardware AMD, el contenido no sale de la maquina.
- Base para experimentos de ajuste fino posteriores: el checkpoint GGUF original de bartowski puede reutilizarse con otras herramientas una vez validado el comportamiento del modelo en el runtime Loom.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" para este paquete, y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". Una puerta sin ejecucion registrada no aporta evidencia.

## Requisitos de hardware

- VRAM estimada: un modelo de 3B en Q4_K_M ocupa del orden de 2 GB de pesos; el pool de memoria se reserva por adelantado con `--pool_backing=fixed`, por lo que el consumo real depende del preset y del contexto configurado. Cifra exacta no disponible.
- GPUs objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs consumer: no disponible; el paquete solo declara soporte para los dos objetivos AMD anteriores.
- Despliegue: `hrx-loom[hf]==0.2.0` mediante `pipx`, con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Opciones de servicio relevantes: `completion_spin_ns=4294967295` activa la espera activa de finalizaciones de GPU (consume CPU mientras hay trabajo en vuelo); `--pool_backing=fixed` compromete el pool de memoria por adelantado; `--parameter_mode=preload` solo cambia la carga de pesos en el host.
- Latencia y throughput: no disponibles; las filas de rendimiento de la model card estan pendientes de medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Dolphin3.0-Llama3.2-3B-loom (este) | 3B | 131.072 tokens | GGUF Q4_K_M empaquetado en `.loom` | llama3.2 | Solo objetivos AMD gfx1151 y gfx1201; sin benchmarks publicados |
| bartowski/Dolphin3.0-Llama3.2-3B-GGUF | 3B | no disponible en la informacion proporcionada | GGUF (multiples cuantizaciones) | llama3.2 | Checkpoint de origen; ejecutable con llama.cpp en hardware variado |
| Llama 3.2 3B Instruct (Meta) | 3B | no disponible en la informacion proporcionada | safetensors, GGUF | llama3.2 | Modelo base sobre el que se construye Dolphin 3.0 |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto preliminar: cero descargas y cero likes, creado y actualizado el mismo dia (2026-11-19), sin mediciones de rendimiento ni evidencia de correccion registrada.
- Las puertas de correccion (`golden`, `compare`, `consistency`, `sampling`, `logits`, etc.) figuran como no re-medidas; no hay garantia documentada de que la salida coincida token a token con la referencia de llama.cpp.
- Compatibilidad de hardware muy restringida: solo se declaran los objetivos gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700). No hay soporte declarado para NVIDIA ni para otras GPUs AMD.
- Sin tool calling, sin modo de razonamiento, sin decodificacion especulativa y sin entrada multimodal: la tabla de caracteristicas del paquete los marca como no aplicables.
- Limite de 4.096 tokens de salida por peticion, lo que restringe tareas de generacion larga pese al contexto de 131.072 tokens.
- Concurrencia maxima de 4 peticiones, insuficiente para cargas de servidor de alta demanda.
- Licencia Llama 3.2 Community License: impone restricciones de uso comercial (clausula de 700 millones de usuarios mensuales), obligaciones de atribucion y una politica de uso aceptable que debe revisarse antes de desplegar en produccion.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion proporcionada; al ser un modelo de 3B, la fiabilidad en razonamiento complejo y tareas factuales es limitada en comparacion con modelos de mayor tamano.
- Idiomas soportados no declarados; no hay garantia documentada de calidad en castellano.
- El modo de espera activa (`completion_spin_ns=4294967295`) consume CPU de forma sostenida mientras hay trabajo en la GPU, lo que puede afectar a otros procesos del sistema.
- Los resultados de busqueda web proporcionados corresponden a servicios no relacionados (Loom como grabador de pantalla y marca de ropa), por lo que no aportan informacion tecnica sobre este modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-Dolphin3.0-Llama3.2-3B-loom
- Checkpoint GGUF de origen: https://huggingface.co/bartowski/Dolphin3.0-Llama3.2-3B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
