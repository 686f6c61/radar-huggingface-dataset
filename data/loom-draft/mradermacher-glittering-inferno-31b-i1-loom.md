# loom-draft/mradermacher-Glittering-Inferno-31B-i1-loom

## Resumen

Glittering-Inferno-31B-i1 es un modelo de lenguaje de 31 mil millones de parámetros, según se deduce de su denominación, distribuido originalmente en formato GGUF por el usuario mradermacher. La ficha que nos ocupa, publicada por loom-draft, no contiene los pesos originales, sino un paquete de despliegue para el ecosistema Loom de AMD: un conjunto de programas `.loom` y un `model.json` que permiten servir el checkpoint GGUF `Glittering-Inferno-31B.i1-Q4_K_M.gguf` sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El paquete se ha generado con la herramienta `loom-next` de forma automática, sin intervención de un LLM en el proceso, y expone un servidor con API compatible con OpenAI (`/v1/chat/completions`). Está pensado para desarrolladores que quieran ejecutar inferencia local sobre hardware AMD con aceleración ROCm, evitando depender de CUDA o de infraestructura en la nube.

La relevancia actual del paquete es acotada: el repositorio no contiene pesos (tamaño de 0.0 GB), no registra descargas ni interacciones, y las mediciones de rendimiento y las puertas de corrección aún no se han vuelto a medir para esta versión. La información disponible sobre el modelo subyacente (arquitectura, entrenamiento, datos) es prácticamente nula en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 31B (según denominación del modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | 53.248 tokens por petición |
| Tipos de cuantización | Q4_K_M (checkpoint GGUF empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (checkpoint base); paquete Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo subyacente en la documentación proporcionada. La denominación "31B" indica el orden de magnitud del número de parámetros, y la referencia a "i1" en el nombre del checkpoint es coherente con la convención de imatrix de llama.cpp, aunque este extremo no se confirma explícitamente en la información disponible. Tampoco se detallan datos de entrenamiento, composición del corpus, ni si se aplicaron técnicas de RLHF, DPO o ajuste por preferencias.

El paquete Loom en sí no modifica los pesos: empaqueta el GGUF original en un formato servible con kernels generados para las GPU AMD objetivo. La generación se realizó con `loom-next` en modo "generator alone, no LLM in the loop", lo que sugiere una traducción automática del grafo de cómputo a programas `.loom`. El paquete incluye dos presets (`chat` para Strix Halo y `chat-r9700` para R9700) y parámetros de despliegue como `--pool_backing=fixed` y `--parameter_mode=preload`, que afectan a la reserva de memoria y a la carga de pesos en host.

## Capacidades

- Generación de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling con formato OpenAI (`tools` y `tool_calls`), lo que permite integración en agentes y pipelines con funciones externas.
- Modo de razonamiento (thinking) opcional, desactivado por defecto y activable con `chat_template_kwargs: {"enable_thinking": true}`.
- Soporte de hasta 4 peticiones concurrentes.
- Límite de 4.096 tokens de salida por petición (preset `max_tokens`).
- Ventana de contexto de 53.248 tokens por petición.
- Entrada de imagen: no soportada por Loom, aunque el modelo original la admite según la model card.
- Entrada y salida de audio: no soportadas por Loom, aunque el modelo original las admite según la model card.
- Decodificación especulativa: no aplicable en este paquete.
- Ajuste de "reasoning effort": no aplicable.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local sobre hardware AMD: el paquete permite servir el modelo en una estación de trabajo con Ryzen AI Max+ 395 o Radeon AI PRO R9700, con API compatible con OpenAI, lo que facilita integrarlo en aplicaciones existentes sin reescribir el cliente.
- Procesamiento de documentos largos: con 53.248 tokens de contexto por petición, es adecuado para resumir contratos, analizar informes técnicos o responder preguntas sobre bases documentales de decenas de miles de tokens en una sola pasada.
- Agentes con tool calling: el soporte de `tools` y `tool_calls` en formato OpenAI permite construir agentes que consulten APIs, bases de datos o sistemas internos, con historial multi-turno gestionado por el servidor.
- Automatización de soporte técnico interno: despliegue en una GPU R9700 de 32 GB para atender hasta 4 conversaciones concurrentes con razonamiento opcional, útil en equipos pequeños que quieran evitar costes de API en la nube.
- Generación asistida de código en entornos con requisitos de soberanía de datos: al ejecutarse en local sobre ROCm, el modelo no envía prompts a terceros, lo que encaja en organizaciones con restricciones de confidencialidad.
- Prototipado y evaluación de modelos: investigadores que necesiten comparar el comportamiento del GGUF original frente a la implementación Loom pueden usar las puertas de corrección (`golden`, `compare`, `agent`) para validar la fidelidad de la salida, aunque en esta versión aún no se han vuelto a medir.
- Pruebas de razonamiento con modo thinking: activando `enable_thinking` se puede evaluar el comportamiento del modelo en tareas de razonamiento multi-paso, con la salvedad de que no hay benchmarks publicados para esta configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured". Las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran todas como "not yet re-measured" en ambas plataformas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El checkpoint es Q4_K_M sobre 31B, lo que sitúa el peso de los pesos en torno a 18-19 GB, aunque la cifra exacta no se confirma en la documentación. El preset `chat-r9700` está pensado para una GPU de 32 GB.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU NVIDIA: no soportadas por este paquete, que está orientado a ROCm/AMD.
- Compatibilidad con GPU de consumo: no confirmada; el paquete está diseñado para las dos plataformas AMD indicadas.
- Despliegue: `hrx-loom[hf]==0.2.0` (instalable con `pipx`), con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. Parámetros relevantes: `--materialize=copy`, `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` para espera activa de completaciones GPU.
- Latencia y throughput: no disponibles; las mediciones aún no se han vuelto a realizar para esta versión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Glittering-Inferno-31B-i1 (paquete Loom) | 31B | 53.248 tokens | apache-2.0 | GGUF + paquete Loom | Repositorio HF (0 descargas) |
| mradermacher/Glittering-Inferno-31B-i1-GGUF (base) | 31B | no disponible | no disponible en la información | GGUF | Repositorio HF de origen |
| Alternativas de 30B-32B en GGUF | no disponible | no disponible | no disponible | GGUF | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos (tamaño de 0.0 GB); es un paquete de despliegue que referencia el GGUF original de mradermacher, por lo que requiere descargar el checkpoint por separado.
- No hay mediciones de rendimiento ni resultados de las puertas de corrección para esta versión; no se puede afirmar que la salida sea fiel al comportamiento de llama.cpp sobre el mismo GGUF.
- La entrada de imagen y de audio del modelo original no están soportadas por Loom, según la propia model card.
- La decodificación especulativa no está disponible en este paquete.
- El límite de concurrencia es de 4 peticiones simultáneas y el de salida de 4.096 tokens por petición, lo que puede ser insuficiente para cargas de producción exigentes.
- No se especifican sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas del modelo subyacente en la información disponible.
- Aunque la licencia declarada es apache-2.0, conviene verificar la licencia del checkpoint original de mradermacher antes de un uso comercial, ya que la información proporcionada no la detalla.
- El paquete está restringido a hardware AMD específico (Strix Halo y R9700); no es portable a otras GPU sin regeneración de kernels.
- El repositorio no registra descargas ni interacciones, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio Hugging Face del paquete: https://huggingface.co/loom-draft/mradermacher-Glittering-Inferno-31B-i1-loom
- Checkpoint GGUF de origen: https://huggingface.co/mradermacher/Glittering-Inferno-31B-i1-GGUF
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sistema ROCm HRX (referenciado en la model card): https://github.com/ROCm/hrx-system
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
