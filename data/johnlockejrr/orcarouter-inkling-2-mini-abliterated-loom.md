# johnlockejrr/orcarouter-Inkling-2-Mini-abliterated-loom

## Resumen

orcarouter-Inkling-2-Mini-abliterated-loom es un paquete de despliegue en formato Loom para el checkpoint GGUF cuantizado `Inkling-2-Mini-abliterated-UD-Q4_K_XL.gguf`, publicado por el usuario johnlockejrr. No se trata de un modelo entrenado desde cero, sino de un artefacto de empaquetado que contiene programas `.loom` y una tarjeta `model.json` que permiten servir el GGUF original a través de `loom-serve` sobre GPUs AMD integradas de la familia Strix Halo (Ryzen AI Max+ 395). El modelo subyacente deriva de la familia Inkling-2-Mini, en su variante "abliterated" (eliminación de direcciones de rechazo mediante edición de pesos), y se distribuye bajo licencia MIT.

La relevancia del paquete es fundamentalmente de infraestructura: demuestra un flujo de trabajo completo para servir un modelo de contexto largo (262.144 tokens por petición) en hardware AMD de consumo mediante el stack ROCm y Loom, con decodificación especulativa activada por defecto (DFlash, profundidad 3) y una API compatible con OpenAI. El repositorio tiene un tamaño de 0,0 GB y cero descargas en el momento de la consulta, lo que indica que es un artefacto experimental de reciente creación (25 de noviembre de 2026).

La información disponible no incluye el número de parámetros del modelo base, la composición del dataset de entrenamiento ni resultados de benchmarks de calidad. La model card se centra en métricas de rendimiento de inferencia, pero todas las filas de la tabla comparativa con llama.cpp aparecen sin valores ("—"), por lo que no es posible extraer cifras de throughput.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Inkling-2-Mini, presumiblemente transformer; no confirmado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | UD-Q4_K_XL (GGUF); otras cuantizaciones no disponibles en este paquete |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF empaquetado en formato Loom (`.loom` + `model.json`) |
| Tamaño del repositorio | 0,0 GB |
| Tokens máximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| Decodificación especulativa | DFlash, profundidad 3, activada por defecto (drafter: unsloth/Inkling-2-Mini-GGUF) |
| API | OpenAI-compatible `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (GPU integrada, ROCm) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Inkling-2-Mini: la model card del paquete Loom no documenta tipo de transformer, número de capas, dimensión oculta, atención (completa, lineal o híbrida), ni si emplea mezcla de expertos. Tampoco se detalla el volumen de tokens de entrenamiento, la composición del corpus ni si hubo fases de RLHF, DPO o similares. La variante "abliterated" implica una modificación post-entrenamiento de los pesos orientada a suprimir comportamientos de rechazo, pero el método concreto (por ejemplo, proyección ortogonal de direcciones de rechazo) no se especifica.

La innovación técnica documentada pertenece al plano de la inferencia, no del entrenamiento. El paquete Loom incorpora decodificación especulativa DFlash con profundidad 3 activada por defecto, usando un modelo drafter separado (`unsloth/Inkling-2-Mini-GGUF`), y una puerta de verificación (`spec` gate) que comprueba que la salida con decodificación especulativa coincide exactamente con la salida sin ella; según la model card, esa puerta pasa. También se documenta una puerta de consistencia bajo concurrencia que falla, lo que sugiere que las cuatro peticiones simultáneas no reproducen necesariamente la misma salida que en ejecución aislada.

## Capacidades

- Generación de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Razonamiento explícito ("thinking") activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Control granular del esfuerzo de razonamiento mediante `reasoning_effort` con siete niveles: none, minimal, low, medium, high, xhigh, max (por defecto high).
- Tool calling estilo OpenAI: acepta el campo `tools` y devuelve `tool_calls`.
- Bucles de tool calling multi-turno: la model card menciona una puerta `agent` que evalúa el renderizado exacto del prompt, la reutilización de historial y la validez de las llamadas a herramientas.
- Decodificación especulativa DFlash con profundidad 3 para acelerar la generación.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Entrada de imagen: estado no determinado ("?" en la model card).
- Entrada y salida de audio: estado no determinado ("?" en la model card).
- Capacidades multilingües: no documentadas.

## Casos de uso

- Despliegue local en estaciones de trabajo con APU AMD Strix Halo: el paquete está diseñado específicamente para `loom-serve` sobre Ryzen AI Max+ 395, de modo que un equipo sin GPU discreta puede servir un modelo de 262k de contexto mediante ROCm y memoria unificada. Es el escenario natural de este artefacto.
- Procesamiento de documentos largos: con 262.144 tokens de ventana por petición, el modelo puede ingerir contratos, informes o bases de código completas en una sola pasada sin troceado, siempre que el pool de memoria configurado (`--pool_backing=fixed`) lo permita en la APU.
- Asistentes conversacionales con razonamiento configurable: el campo `reasoning_effort` permite degradar a `none` o `minimal` en turnos simples para reducir latencia y reservar `high` o `max` para consultas complejas, dentro de un mismo endpoint.
- Automatización de agentes con herramientas: el soporte de `tools`/`tool_calls` y la puerta `agent` documentada permiten construir bucles de razonamiento multi-paso que invocan APIs externas, con historial reutilizado entre turnos.
- Evaluación comparativa de motores de inferencia en AMD: el paquete incluye la metodología para comparar Loom frente a llama.cpp ROCm con el mismo GGUF y los mismos prompts, lo que lo hace útil como banco de pruebas para medir el impacto de DFlash o del modo de espera activa (`completion_spin_ns`).
- Investigación sobre alineación y edición de pesos: al ser una variante "abliterated", sirve para estudiar cómo cambia el comportamiento del modelo al eliminar direcciones de rechazo, comparándolo con el checkpoint original de Inkling-2-Mini.
- Prototipado de servicios con API OpenAI: al exponer `/v1/chat/completions`, cualquier cliente compatible con OpenAI puede apuntar a `127.0.0.1:8080` sin cambios de código, lo que facilita migrar prototipos a este backend local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card incluye una tabla de rendimiento de inferencia frente a llama.cpp ROCm, pero todas las celdas de métricas aparecen sin medir ("—"):

| Métrica | llama.cpp | Loom | Margen | Roofline | Loom % roofline |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | — | — | — | — | — |
| Decode tok/s, contexto 2k | — | — | — | — | — |
| Decode tok/s, contexto 32k | — | — | — | — | — |
| Prefill tok/s, documento 1k | — | — | — | — | — |
| Prefill tok/s, documento 2k | — | — | — | — | — |
| Prefill tok/s, documento 8k | — | — | — | — | — |
| Prefill tok/s, documento 16k | — | — | — | — | — |
| Prefill tok/s, documento 32k | — | — | — | — | — |
| 4 streams, decode agregado | — | — | — | — | — |
| Tokens draft aceptados | — | — | — | n/a | n/a |

La metodología indica que las mediciones se realizaron en runners AMD DevLab Dispatch Strix Halo (`devlab-perf`), con espera activa en Loom y sin ajuste fino en ninguno de los dos motores, pero los valores concretos no se registraron.

## Requisitos de hardware

- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (APU con GPU integrada y memoria unificada); es el único hardware mencionado en la model card.
- VRAM estimada: no disponible. Al tratarse de una APU con memoria unificada, el modelo reside en el pool configurado por `--pool_backing=fixed`, cuyo tamaño no se especifica.
- GPU discretas (A100, H100, RTX 4090): no documentadas para este paquete; el stack Loom está orientado a ROCm y al hardware citado.
- Cabe en GPU de consumo: el paquete apunta a una APU de consumo profesional (Strix Halo), pero no se confirma compatibilidad con GPUs de consumo NVIDIA.
- Despliegue: `loom-serve` mediante `pipx install "hrx-loom[hf]==0.2.0"` y `loom-fetch` para materializar el paquete desde Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este artefacto (llama.cpp solo aparece como referencia de comparación).
- Opciones de arranque relevantes: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa para completaciones de GPU, consume CPU mientras hay trabajo en vuelo) y `--pool_backing=fixed` (compromete el pool de memoria por adelantado).
- Latencia y throughput: no disponibles; las celdas de la tabla de rendimiento están sin medir.

## Comparativa con modelos similares

No se dispone de datos de parámetros, contexto ni rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible. A continuación se indican las alternativas identificables y lo que se sabe de cada una:

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| orcarouter-Inkling-2-Mini-abliterated-loom (este) | no disponible | 262.144 tokens | sin benchmarks publicados | MIT | Hugging Face (0 descargas) |
| johnlockejrr/orcarouter-Inkling-2-Mini-abliterated-GGUF (base directa) | no disponible | no disponible | no disponible | MIT (según este paquete) | Hugging Face |
| unsloth/Inkling-2-Mini-GGUF (usado como drafter) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| llama.cpp ROCm (motor de referencia) | n/a | configurable por argumentos de servidor | sin valores registrados en la comparación | MIT | GitHub / builds ROCm |

La comparación real que propone el autor es de motores (Loom frente a llama.cpp ROCm) sobre el mismo GGUF, no de modelos; y esa comparación carece de cifras en la documentación disponible.

## Limitaciones y advertencias

- La puerta de consistencia (`consistency`) falla según la propia model card: las peticiones concurrentes no producen necesariamente la misma salida que las mismas peticiones ejecutadas de forma aislada. Es un riesgo directo para despliegues con cuatro streams simultáneos.
- Las puertas `kernel_tests`, `golden` y `compare` figuran como "sin evidencia", de modo que no está verificado que los kernels generados coincidan con implementaciones de referencia ni que la salida codiciosa coincida token a token con llama.cpp.
- El estado de las entradas de imagen y audio es indeterminado ("?"), por lo que no debe asumirse capacidad multimodal.
- Al ser una variante "abliterated", es esperable una reducción de los comportamientos de rechazo ante peticiones dañinas o sensibles; no se documenta ninguna evaluación de seguridad ni de sesgos.
- Riesgo de alucinación: no cuantificado; no hay benchmarks de veracidad ni de seguimiento de instrucciones.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano ni en otros idiomas distintos del inglés.
- La licencia MIT se declara en el paquete, pero no se verifican las condiciones del modelo base Inkling-2-Mini ni del drafter de unsloth; conviene comprobar las licencias upstream antes de uso comercial.
- El repositorio tiene 0,0 GB y cero descargas, con fecha de creación y actualización separadas por tres segundos: es un artefacto recién publicado y sin validación comunitaria.
- Dependencia de hardware muy específico (Strix Halo con ROCm) y de una versión concreta del tooling (`hrx-loom[hf]==0.2.0`); la reproducibilidad en otros entornos no está garantizada.
- La tabla de rendimiento no contiene mediciones, por lo que no hay evidencia publicada del beneficio de DFlash ni de la espera activa en este hardware.

## Enlaces

- Repositorio del paquete: https://huggingface.co/johnlockejrr/orcarouter-Inkling-2-Mini-abliterated-loom
- Modelo base GGUF: https://huggingface.co/johnlockejrr/orcarouter-Inkling-2-Mini-abliterated-GGUF
- Drafter de decodificación especulativa: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Stack Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
