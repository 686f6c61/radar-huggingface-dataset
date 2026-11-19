# loom-draft/Jackrong-Qwopus3.6-27B-Coder-loom

## Resumen

Jackrong-Qwopus3.6-27B-Coder-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el usuario `loom-draft` a partir del checkpoint GGUF sin modificar `Jackrong/Qwopus3.6-27B-Coder-GGUF`, en su variante `Qwopus3.6-27B-Coder-Q4_K_M.gguf`. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los del modelo base y lo que aporta el repositorio es un artefacto de empaquetado para ejecutar ese GGUF sobre GPUs AMD concretas mediante el runtime Loom (`hrx-loom`).

El objetivo del paquete es habilitar la inferencia del modelo en hardware AMD de consumo y estación de trabajo: el AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se generó con la herramienta `loom-next`, que produce los programas de kernel y la tarjeta de modelo sin intervención de un LLM en el bucle, según la model card.

El modelo subyacente es un coder de 27B con capacidades de visión (pipeline `image-text-to-text`, proyector `mmproj-F32.gguf`), ventana de contexto de 262.144 tokens por petición, tool calling estilo OpenAI y modo de razonamiento activado por defecto. La relevancia del repositorio es fundamentalmente operativa: demuestra la ruta de despliegue de un coder multimodal de 27B en el ecosistema ROCm/AMD fuera de llama.cpp. El repositorio está vacío (0,0 GB) y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base no documentado en la informacion proporcionada) |
| Parametros totales | 27B (segun el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete incluye un preset por GPU |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como programas `.loom` + `model.json`; proyector de vision `mmproj-F32.gguf` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| API | OpenAI-compatible `/v1/chat/completions` |
| Decodificacion especulativa | no aplicable |
| Entrada de audio | no aplicable |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base `Jackrong/Qwopus3.6-27B-Coder-GGUF`: no se detalla si es un transformer denso, MoE o hibrido, ni la composicion del dataset de entrenamiento, el numero de tokens vistos o si hubo fases de RLHF/DPO. Lo unico deducible del nombre y del pipeline es que se trata de un modelo de 27.000 millones de parametros orientado a codigo y con capacidad multimodal de entrada de imagen, servido mediante un proyector de vision independiente (`mmproj-F32.gguf`).

Lo que si documenta la model card es la capa de despliegue. El paquete Loom contiene programas de kernel generados por `loom-next` y una tarjeta `model.json` con los ficheros fuente fijados por hash SHA-256, verificados por `loom-fetch`. El runtime expone un servidor compatible con la API de OpenAI y ofrece opciones de ejecucion relevantes para el rendimiento: `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, consume CPU mientras hay trabajo en vuelo), `--pool_backing=fixed` (compromiso previo del pool de memoria en lugar de crecimiento elastico) y `--parameter_mode=preload` (afecta solo a la carga de pesos en host). No se documenta ninguna innovacion de arquitectura propia del modelo; la innovacion del repositorio es el propio pipeline de generacion de kernels para AMD.

## Capacidades

- Generacion de texto y codigo: el modelo base esta etiquetado como coder de 27B, orientado a tareas de programacion.
- Razonamiento con modo thinking: activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`. No soporta niveles configurables de esfuerzo de razonamiento (`reasoning effort`: no aplicable).
- Tool calling: soporte de `tools` y `tool_calls` en formato OpenAI, validado por las puertas de correccion `agent` y `agent_think_off` del banco de pruebas Loom (aunque sin mediciones registradas en este paquete).
- Entrada de imagen: acepta partes `image_url` estilo OpenAI mediante el proyector `mmproj-F32.gguf`; pipeline `image-text-to-text`.
- Contexto largo: 262.144 tokens por peticion, adecuado para repositorios completos o documentos extensos.
- Concurrencia: hasta 4 peticiones simultaneas con salida identica a la ejecucion aislada (puerta `consistency`).
- Multilingue: no disponible; la model card no declara idiomas.
- Audio: no soportado (entrada y salida de audio no aplicables).
- Decodificacion especulativa: no soportada en este paquete.

## Casos de uso

- Asistente de codigo en IDE sobre estaciones AMD: un desarrollador con una Radeon AI PRO R9700 puede servir el modelo localmente con `loom-serve` y consumirlo desde un plugin de editor via `/v1/chat/completions`, manteniendo el codigo en la maquina. El contexto de 262.144 tokens permite incluir varios ficheros del repositorio en cada consulta.
- Revision de codigo con capturas de pantalla: al aceptar `image_url`, el modelo puede recibir capturas de interfaces, diagramas de arquitectura o errores renderizados junto al codigo y comentarlos en una sola peticion.
- Agente de refactorizacion multi-turno: el soporte de `tool_calls` permite encadenar lecturas de ficheros, ediciones y ejecuciones de tests en un bucle de agente; la puerta `agent` del banco Loom esta disenada precisamente para validar el renderizado exacto del prompt, la reutilizacion de historial y la validez de las llamadas.
- Documentacion tecnica a partir de codigo: con contexto largo se puede pasar un modulo completo y pedir docstrings, guias de API o resumenes de cambios entre versiones.
- Prototipado en hardware de consumo: el Ryzen AI Max+ 395 «Strix Halo» es un APU con memoria unificada; el preset `chat` del paquete permite ejecutar un modelo de 27B en Q4_K_M sin GPU dedicada, util para demos y entornos de desarrollo.
- Evaluacion de portabilidad ROCm: equipos que quieran comparar el comportamiento de un GGUF en llama.cpp frente a un runtime alternativo pueden usar las puertas de correccion (`golden`, `compare`, `vision`, `logits`) como referencia metodologica, aunque en este paquete aun no hay mediciones registradas.
- Generacion de tests y correccion de errores en CI: con 4 peticiones concurrentes se puede integrar en un job que analice fallos de test y proponga parches, limitando la salida a 4.096 tokens por peticion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) «no se han vuelto a medir» para este paquete, y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) aparecen como «not yet re-measured» en ambas GPUs. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El modelo se distribuye en Q4_K_M y el preset `chat-r9700` esta pensado para una GPU de 32 GB; el preset `chat` esta pensado para el APU Strix Halo con memoria unificada.
- GPU recomendadas: AMD Radeon AI PRO R9700 (32 GB, gfx1201) y AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151). No se documenta soporte para GPUs NVIDIA ni para otras Radeon en este paquete.
- GPU de consumo: el paquete no declara compatibilidad con RTX 4090 ni con Radeon RX de consumo; el hardware soportado explicitamente es el indicado arriba.
- Despliegue: runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch`, `loom-serve`). No se documenta compatibilidad con vLLM, TGI, Ollama o llama.cpp para este paquete concreto, aunque el GGUF de origen es ejecutable con llama.cpp segun la propia model card (se usa como referencia de correccion).
- Latencia y throughput: no disponibles; las filas de rendimiento del paquete no se han vuelto a medir.
- Memoria: el preset usa `--pool_backing=fixed`, que reserva el pool completo por adelantado; conviene dimensionar la memoria del sistema en consecuencia.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento del modelo base ni de alternativas comparables, por lo que no es posible establecer una comparacion rigurosa de parametros, contexto, benchmarks o throughput. Como referencia estructural, el unico punto de comparacion documentado es el propio GGUF `Jackrong/Qwopus3.6-27B-Coder-GGUF` ejecutado con llama.cpp, que el paquete Loom usa como referencia de correccion (mismos tokens voraces, top-5 log-probs y salida de vision), pero sin cifras publicadas.

## Limitaciones y advertencias

- El repositorio tiene 0,0 GB y 0 descargas: el artefacto puede estar incompleto o no ser reproducible en el momento de la consulta.
- No hay mediciones de correccion registradas: todas las puertas del banco Loom aparecen como «not yet re-measured», por lo que no hay evidencia publicada de que la salida coincida con llama.cpp en este paquete.
- El modelo base no esta documentado en la informacion disponible: se desconoce la composicion del dataset, los idiomas y los sesgos, lo que impide evaluar riesgos de alucinacion o sesgo con fundamento.
- Licencia Apache 2.0 declarada por el empaquetador, pero la licencia y las condiciones del modelo base (`Jackrong/Qwopus3.6-27B-Coder-GGUF`) deben verificarse por separado antes de un uso comercial.
- Compatibilidad de hardware muy restringida: solo se declaran dos dispositivos AMD (gfx1151 y gfx1201); no hay soporte documentado para NVIDIA, Apple Silicon ni ROCm en otras GPU.
- Limite de salida de 4.096 tokens por peticion, que puede ser insuficiente para generacion de ficheros completos o refactorizaciones largas.
- Concurrencia limitada a 4 peticiones; no es adecuado como backend de alta concurrencia sin escalado horizontal.
- El ajuste `completion_spin_ns=4294967295` consume CPU de forma activa mientras hay trabajo en GPU; en despliegues compartidos puede degradar otros procesos.
- El modo thinking esta activado por defecto y no admite niveles de esfuerzo, lo que puede aumentar la latencia y el consumo de tokens si no se desactiva explicitamente.
- No hay soporte de decodificacion especulativa ni de audio en este paquete.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/Jackrong-Qwopus3.6-27B-Coder-loom
- Modelo base (GGUF): https://huggingface.co/Jackrong/Qwopus3.6-27B-Coder-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
