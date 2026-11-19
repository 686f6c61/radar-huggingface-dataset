# loom-draft/bartowski-Kwaipilot_KAT-Coder-V2.5-Dev-loom

## Resumen

`loom-draft/bartowski-Kwaipilot_KAT-Coder-V2.5-Dev-loom` es un paquete de despliegue en formato Loom (`.loom` más una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/Kwaipilot_KAT-Coder-V2.5-Dev-GGUF`, en su cuantización Q4_K_M. No es un modelo entrenado por `loom-draft`, sino un artefacto de empaquetado que traduce los pesos GGUF originales a un formato ejecutable por el runtime Loom sobre GPUs AMD concretas: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se ha generado con `loom-next`, el generador del ecosistema Loom, sin intervención de un LLM en el bucle.

El modelo subyacente es KAT-Coder-V2.5-Dev, un modelo de la familia Kwaipilot orientado a generación de código, del que esta ficha solo puede documentar lo que expone la tarjeta del paquete: contexto de 262.144 tokens por petición, soporte de tool calling estilo OpenAI, modo de razonamiento activado por defecto y una `max_tokens` de salida de 4.096 en el preset. La tarjeta no declara arquitectura, número de parámetros ni composición del dataset de entrenamiento, por lo que esos campos se marcan como no disponibles.

La relevancia de este paquete es de infraestructura más que de modelado: permite servir un modelo de código con ventana de 256K sobre hardware AMD de consumo y profesional sin pasar por CUDA, con una API compatible con OpenAI y hasta cuatro peticiones concurrentes. Las mediciones de rendimiento y las puertas de corrección (`kernel_tests`, `golden`, `compare`, `agent`, etc.) figuran como "not yet re-measured" en la tarjeta, de modo que no hay evidencia publicada de paridad con llama.cpp para esta build concreta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base KAT-Coder-V2.5-Dev; el paquete Loom no la declara) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantización | Q4_K_M (GGUF de origen); el paquete Loom se distribuye con esa cuantización |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como programa Loom (`.loom` + `model.json`) |
| Salida máxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | sí, estilo OpenAI (`tools` / `tool_calls`) |
| Modo thinking | activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}` |
| Decodificación especulativa | no aplicable en este paquete |
| Entrada de imagen | no soportada por Loom (el modelo upstream sí la tiene) |
| Entrada/salida de audio | no aplicable |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base KAT-Coder-V2.5-Dev: la tarjeta del paquete Loom solo documenta el proceso de empaquetado, no la topología de red, el número de capas, el esquema de atención ni si se trata de un transformer denso o de un modelo con mezcla de expertos. Tampoco se indica el volumen de tokens de entrenamiento, la composición del corpus, ni si hubo fases de RLHF, DPO o ajuste por refuerzo sobre tareas de código. Cualquier afirmación sobre estos puntos sería especulativa y no se incluye.

Lo que sí está documentado es la capa de ejecución. `loom-next` genera kernels específicos para las arquitecturas AMD gfx1151 y gfx1201 a partir del GGUF original, y `loom-serve` los ejecuta con un pool de memoria de respaldo fijo (`--pool_backing=fixed`) y precarga de parámetros en host (`--parameter_mode=preload`). El parámetro `completion_spin_ns=4294967295` habilita espera activa de las finalizaciones de GPU, consumiendo CPU mientras hay trabajo en vuelo; según la tarjeta, las mediciones de rendimiento se tomaron con esa configuración. No hay innovaciones de decodificación propias: la decodificación especulativa se marca como no aplicable y el muestreo figura como "not determined".

## Capacidades

- Generación de texto y código: el modelo base es un coder de la familia Kwaipilot; el paquete expone chat completions estándar sobre él.
- Razonamiento con modo thinking: activado por defecto y desactivable por petición mediante `enable_thinking: false`.
- Tool calling estilo OpenAI: acepta el array `tools` y devuelve `tool_calls`, lo que habilita bucles de agente multi-turno (la puerta `agent` de la tarjeta valida el renderizado exacto del prompt, la reutilización de historial y la validez de las llamadas).
- Contexto largo: 262.144 tokens por petición, adecuado para documentos extensos o repositorios medianos en una sola ventana.
- Concurrencia limitada: 4 peticiones simultáneas con la puerta `consistency` diseñada para verificar que la salida concurrente coincide con la ejecución aislada.
- Multilingüismo: no disponible; la tarjeta no declara idiomas.
- Visión: el modelo upstream tiene entrada de imagen, pero Loom no la soporta en este paquete, por lo que la capacidad no está disponible en la práctica.
- Audio: no aplicable.
- Sin decodificación especulativa ni control de "reasoning effort".

## Casos de uso

- Asistente de código en IDE sobre estación de trabajo AMD: servir el paquete con `loom-serve` en una Radeon AI PRO R9700 y apuntar el plugin del editor a `http://127.0.0.1:8080/v1/chat/completions`; los 262K de contexto permiten incluir varios ficheros del proyecto en cada petición sin trocear.
- Revisión de pull requests con contexto de repositorio: enviar el diff junto con los ficheros afectados en una sola ventana de hasta 256K tokens para obtener comentarios coherentes entre módulos, con thinking activado para análisis multi-paso.
- Agente de refactorización con tool calling: usar el bucle `tools`/`tool_calls` para que el modelo invoque funciones de lectura y escritura de ficheros, ejecute tests y encadene pasos; la puerta `agent_think_off` de la tarjeta está pensada exactamente para validar ese flujo con thinking desactivado y menor latencia.
- Generación de tests unitarios en pipelines de CI: desplegar el servicio en el runner con GPU AMD y consumirlo desde un job que genere tests para los ficheros modificados, limitando la salida a los 4.096 tokens del preset.
- Documentación técnica automatizada: generar docstrings y guías de API a partir del código fuente completo, aprovechando la ventana larga para mantener consistencia terminológica en todo el repositorio.
- Evaluación de modelos de código en hardware no-CUDA: usar el paquete como banco de pruebas para comparar la salida de Loom contra llama.cpp sobre el mismo GGUF, ejecutando las puertas `golden` y `compare` de `loom-benchmark` en Strix Halo o R9700.
- Prototipado local sin conexión: al ejecutarse íntegramente en la GPU local con pesos Q4_K_M, sirve para entornos con requisitos de confidencialidad donde el código no puede salir a una API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta del paquete indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". Tampoco se aportan cifras de MMLU, HumanEval, GSM8K ni latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible con cifras del autor; el paquete está pensado para la Radeon AI PRO R9700, que tiene 32 GB, y para el Ryzen AI Max+ 395 "Strix Halo", cuya memoria gráfica se asigna desde la RAM unificada del sistema.
- GPU soportadas explícitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se declara soporte para GPUs NVIDIA ni para otras Radeon.
- GPU de consumo: no hay confirmación de que quepa en GPUs de consumo; el hardware declarado es un APU de gama alta y una GPU profesional. Cualquier otra combinación queda fuera de lo documentado.
- Despliegue: exclusivamente mediante el runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch`, `loom-serve`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este paquete; llama.cpp se usa solo como referencia de corrección en las puertas de validación.
- Opciones de servicio: `--pool_backing=fixed` (pool de memoria comprometido de antemano), `--parameter_mode=preload` (precarga de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU).
- Latencia y throughput: no disponibles; las filas de rendimiento frente a llama.cpp no se han vuelto a medir para este paquete.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría. A modo de referencia estructural, se compara el artefacto con sus dos vecinos directos en la cadena de dependencias:

| Artefacto | Naturaleza | Contexto | Licencia | Formato | Hardware |
|---|---|---|---|---|---|
| `loom-draft/bartowski-Kwaipilot_KAT-Coder-V2.5-Dev-loom` | Paquete de despliegue Loom generado con `loom-next` | 262.144 tokens | Apache 2.0 | `.loom` + `model.json` | AMD gfx1151 / gfx1201 |
| `bartowski/Kwaipilot_KAT-Coder-V2.5-Dev-GGUF` | Checkpoint GGUF cuantizado (origen, Q4_K_M) | no disponible en esta ficha | Apache 2.0 (heredada) | GGUF | Genérico (llama.cpp y afines) |
| KAT-Coder-V2.5-Dev (modelo upstream) | Modelo original de Kwaipilot | no disponible en esta ficha | Apache 2.0 (heredada) | safetensors presumiblemente, no confirmado | Genérico |

## Limitaciones y advertencias

- El paquete no aporta ninguna medición de rendimiento ni de corrección para esta build: todas las puertas figuran como "not yet re-measured", por lo que no hay evidencia publicada de paridad con llama.cpp en tokens greedy ni en log-probs.
- La entrada de imagen del modelo upstream no está disponible en Loom; si el caso de uso depende de visión, este paquete no sirve.
- El muestreo figura como "not determined": no hay garantía documentada sobre el comportamiento de temperatura, top-k y semilla frente a la referencia.
- Sin decodificación especulativa, la latencia por token en generación larga dependerá únicamente del runtime Loom; no hay cifras para planificar capacidad.
- Concurrencia máxima de 4 peticiones y salida máxima de 4.096 tokens por respuesta: insuficiente para generar ficheros completos grandes en una sola llamada.
- El modo thinking está activado por defecto y consume tokens de salida dentro de ese límite de 4.096; conviene desactivarlo explícitamente en flujos sensibles a latencia o a longitud.
- Sin datos de sesgos, alucinación ni cobertura idiomática del modelo base en la información disponible; al ser un modelo de código, el riesgo de generar APIs o funciones inexistentes es relevante y debe mitigarse con verificación automática (compilación, tests).
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar la licencia y las condiciones del checkpoint GGUF de origen y del modelo upstream antes de redistribuir.
- Dependencia de un runtime joven (`hrx-loom 0.2.0`) y de dos arquitecturas AMD concretas: no hay soporte declarado para otras GPUs, lo que limita la portabilidad.
- El paquete tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto recién publicado sin validación comunitaria.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-Kwaipilot_KAT-Coder-V2.5-Dev-loom
- Checkpoint GGUF de origen: https://huggingface.co/bartowski/Kwaipilot_KAT-Coder-V2.5-Dev-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
