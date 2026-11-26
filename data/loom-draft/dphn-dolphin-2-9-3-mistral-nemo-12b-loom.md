# loom-draft/dphn-dolphin-2.9.3-mistral-nemo-12b-loom

## Resumen

`loom-draft/dphn-dolphin-2.9.3-mistral-nemo-12b-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `dphn/dolphin-2.9.3-mistral-nemo-12b-gguf`, concretamente el fichero `dolphin-2.9.3-mistral-nemo-12b.Q4_K_M.gguf`. No es un modelo nuevo ni un fine-tune: es un artefacto de empaquetado que traduce los pesos y la configuración del modelo base a programas ejecutables por el runtime Loom sobre GPUs AMD.

El paquete lo publica el usuario `loom-draft` y se ha generado con la herramienta `loom-next` (el generador, sin LLM en el bucle). Está dirigido a dos plataformas concretas: la APU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El modelo base subyacente es un Mistral Nemo de 12B afinado por Cognitive Computations (Dolphin 2.9.3), con licencia MIT.

Su relevancia es acotada y práctica: permite servir un modelo de 12B cuantizado en Q4_K_M sobre hardware AMD con una API compatible con OpenAI (`/v1/chat/completions`), sin depender de llama.cpp. La tarjeta del paquete no incluye mediciones de rendimiento ni resultados de las puertas de corrección para este artefacto concreto, por lo que la evaluación cuantitativa queda pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (modelo base Mistral Nemo de 12B; el paquete Loom no detalla la arquitectura interna) |
| Parametros totales | 12B (según el nombre del modelo base) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (único checkpoint empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (origen) empaquetado como programas `.loom` y `weights.loom` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| API | compatible con OpenAI (`/v1/chat/completions`) |
| Tool calling | no soportado (marcado como «not applicable») |
| Razonamiento / thinking | no soportado (marcado como «not applicable») |
| Decodificacion especulativa | no soportada (marcada como «not applicable») |
| Entrada de imagen | no soportada |
| Entrada/salida de audio | no soportada |
| Muestreo | no determinado («not determined») |
| Hardware objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura del modelo subyacente ni sus datos de entrenamiento; esa información corresponde al modelo base `dphn/dolphin-2.9.3-mistral-nemo-12b-gguf`, del que esta ficha no dispone de detalles técnicos en la información proporcionada. Lo que sí describe la tarjeta es la arquitectura del artefacto Loom: un conjunto de programas `.loom` generados automáticamente por `loom-next` a partir del GGUF original, acompañados de `model.json`/`model.json.lock` (con verificación sha256 de los ficheros de origen por parte de `loom-fetch`), `tokenizer.json`, `llm_config.json` y `weights.loom`.

El runtime Loom expone opciones de servicio relevantes: `--pool_backing=fixed` (reserva por adelantado el pool de memoria del preset en lugar de crecimiento elástico) y `--parameter_mode=preload` (cambia solo cómo se cargan los pesos en el host). Además, `completion_spin_ns=4294967295` activa la espera activa de finalizaciones de GPU, consumiendo CPU mientras hay trabajo en vuelo; según la tarjeta, las mediciones de rendimiento del preset usan ese ajuste. No se documentan en la información disponible datos de entrenamiento, tokens vistos, RLHF/DPO ni innovaciones de atención del modelo base.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`), con una ventana de contexto de 262.144 tokens por petición.
- Servicio concurrente de hasta 4 peticiones simultáneas.
- Generación de hasta 4.096 tokens de salida por petición (límite del preset).
- Ejecución sobre GPUs AMD mediante el runtime Loom, con dos presets específicos de hardware (Strix Halo y R9700).
- Tool calling: no soportado según la tarjeta («not applicable»).
- Razonamiento / modo thinking: no soportado según la tarjeta.
- Decodificación especulativa: no soportada.
- Entrada de imagen, audio o salida de audio: no soportadas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Muestreo (temperatura, top_k, semilla): estado «not determined» en la tarjeta.

## Casos de uso

- Servicio local de chat sobre hardware AMD: desplegar un asistente conversacional en una APU Strix Halo o una R9700 con `loom-serve` y consumirlo desde una aplicación cliente mediante el endpoint compatible con OpenAI, sin necesidad de llama.cpp.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite pasar contratos, informes o transcripciones extensas en una sola petición para tareas de resumen o extracción, siempre que el prompt quepa en el contexto efectivo del modelo base.
- Prototipado en estaciones de trabajo AMD: usar el paquete como banco de pruebas de la pila Loom (`loom-fetch`, `loom-serve`) para validar integraciones antes de pasar a producción, dado que el artefacto está generado y verificado por hash.
- Evaluación comparativa frente a llama.cpp: la tarjeta define puertas de corrección (`golden`, `compare`, `consistency`, `sampling`, etc.) pensadas para contrastar la salida del runtime Loom con la referencia de llama.cpp sobre el mismo GGUF, lo que lo hace útil como banco de validación de kernels.
- Generación de texto por lotes en local: con concurrencia de 4 peticiones y salida máxima de 4.096 tokens, sirve para tareas de redacción, clasificación o reformulación en entornos con requisitos de privacidad donde los datos no deben salir del equipo.
- Entornos de investigación con hardware AMD: reproducir experimentos de inferencia sobre gfx1151/gfx1201 con un modelo de 12B cuantizado en Q4_K_M y licencia MIT, sin ataduras de licencia para uso interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), «the results for this package are not yet re-measured», y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como «not yet re-measured». No hay datos de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint Q4_K_M de un modelo de 12B ronda habitualmente los 7-8 GB de pesos, pero la tarjeta no confirma el consumo del runtime Loom ni el tamaño del pool reservado con `--pool_backing=fixed`.
- GPUs objetivo declaradas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se indica compatibilidad con GPUs de consumo; las únicas plataformas documentadas son las dos AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch huggingface:loom-draft/dphn-dolphin-2.9.3-mistral-nemo-12b-loom:chat` (o `:chat-r9700` para la R9700) y `loom-serve --model=dolphin-2.9.3-mistral-nemo-12b '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Alternativas de despliegue como vLLM, llama.cpp, Ollama o TGI: no documentadas para este paquete; el artefacto está atado al runtime Loom.
- Latencia y throughput: no disponibles (las mediciones del paquete aún no se han repetido).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| `loom-draft/dphn-dolphin-2.9.3-mistral-nemo-12b-loom` (este paquete) | 12B | 262.144 tokens | MIT | GGUF empaquetado como `.loom`; runtime Loom | Solo GPUs AMD gfx1151 y gfx1201; sin benchmarks publicados |
| `dphn/dolphin-2.9.3-mistral-nemo-12b-gguf` (modelo base) | 12B | no disponible en esta información | MIT | GGUF; llama.cpp y otros runtimes GGUF | Checkpoint de origen sin modificar; referencia de corrección del paquete |
| Otros modelos de ~12B con licencia permisiva | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El artefacto no aporta mediciones: todas las puertas de corrección y las filas de rendimiento figuran como «not yet re-measured», por lo que no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp en este paquete concreto.
- El muestreo está marcado como «not determined»: no se garantiza el comportamiento de temperatura, top_k y semilla según la tarjeta.
- Sin tool calling, sin modo thinking, sin decodificación especulativa y sin entrada de imagen o audio: no es apto para flujos de agentes con funciones ni para tareas multimodales.
- Dependencia fuerte del runtime Loom y de dos plataformas AMD concretas; no se documenta compatibilidad con otras GPUs ni con pilas estándar como vLLM u Ollama.
- La espera activa (`completion_spin_ns=4294967295`) consume CPU mientras hay trabajo en GPU; conviene evaluar su impacto en servidores con CPU compartida.
- Licencia MIT sobre el paquete y el modelo base: permite uso comercial, pero conviene verificar las condiciones del checkpoint de origen y de las dependencias del runtime.
- Riesgo de alucinación y sesgos del modelo base: no se documentan en la información proporcionada; deben evaluarse con el checkpoint `dphn/dolphin-2.9.3-mistral-nemo-12b-gguf` directamente.
- Idiomas soportados no declarados: no se puede garantizar calidad multilingüe sin evaluación previa.
- Paquete con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/dphn-dolphin-2.9.3-mistral-nemo-12b-loom
- Modelo base en Hugging Face: https://huggingface.co/dphn/dolphin-2.9.3-mistral-nemo-12b-gguf
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
