# loom-fun/ggml-org-Muse-Glimmer-30B-loom

## Resumen

Muse-Glimmer-30B es un modelo de lenguaje y vision de 30 000 millones de parametros desarrollado por Meta, disenado especificamente para agentes locales que funcionan de forma continua en un unico dispositivo. Segun la documentacion de Meta, acepta entradas de texto e imagen, produce salidas de texto y esta entrenado con datos de mas de cien idiomas. Su enfoque principal es el uso de herramientas (tool use), la planificacion multi-paso y la recuperacion ante fallos, capacidades en las que Meta situa al modelo en el estado del arte de su clase de tamano frente a Gemma4-31B y Qwen3.6-27B.

La ficha que nos ocupa, sin embargo, no es el modelo original, sino un paquete de despliegue publicado por `loom-fun` para el runtime AMD Loom. Se trata de un artefacto que empaqueta el checkpoint GGUF sin modificar `ggml-org/Muse-Glimmer-30B-GGUF` (concretamente la cuantizacion `Q4_K_M`) junto con programas `.loom` y una tarjeta `model.json`, generado en un AMD Ryzen AI Max+ 395 "Strix Halo" mediante el flujo de trabajo `loom-skills`. El paquete expone un servidor compatible con la API de OpenAI en `127.0.0.1:8080` y anade decodificacion especulativa con un modelo borrador DFlash de `z-lab`.

Su relevancia actual es doble: por un lado, documenta el rendimiento real de Muse-Glimmer-30B en hardware de consumo AMD (GPU integrada Radeon 8060S, 216 GB/s de ancho de banda) frente a llama.cpp, con ganancias de entre el 3 % y el 50 % segun la metrica; por otro, demuestra que un modelo de 30B con contexto de 131 072 tokens y entrada de imagen puede servirse en un equipo de sobremesa con aceleracion ROCm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer multimodal texto-imagen; detalles no publicados en la informacion disponible) |
| Parametros totales | 30 000 millones (30B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131 072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (paquete Loom); existe tambien UD-Q5_K_M en el paquete de unsloth; proyector de vision en BF16 |
| Idiomas soportados | mas de cien idiomas (entrenamiento); lista concreta no disponible |
| Licencia | Apache 2.0 (segun Meta); la licencia del paquete Loom no se especifica en la informacion disponible |
| Formato de pesos | GGUF (checkpoint base), empaquetado como programas `.loom` + `model.json`; proyector `mmproj-Muse-Glimmer-30B-BF16.gguf` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (tipo de atencion, capas, cabezas, uso de MoE o de mecanismos hibridos). Lo que si se documenta es que Muse-Glimmer-30B es un modelo multimodal que acepta texto e imagen y genera texto, entrenado por Meta con datos de mas de cien idiomas y cuantizado a aproximadamente 4 bits para permitir inferencia en una sola GPU. Meta lo posiciona como un modelo "abierto" orientado a agentes locales siempre activos, ajustado para uso de herramientas, tareas largas y recuperacion ante fallos. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

El paquete Loom anade una capa de ejecucion sobre el GGUF sin modificar: kernels generados y validados contra implementaciones de referencia (37/37 pruebas unitarias superadas), decodificacion especulativa activada por defecto con un borrador DFlash de profundidad 5 (`z-lab/Muse-Glimmer-30B-DFlash2-GGUF`), y un proyector de vision BF16 para las entradas de imagen. La correccion se verifica mediante compuertas (`golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `needle`) que comparan la salida con la referencia de llama.cpp sobre el mismo GGUF, con divergencias limitadas a empates cercanos.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" siempre activo (no se puede desactivar ni ajustar el esfuerzo de razonamiento).
- Entrada de imagen: acepta partes `image_url` al estilo OpenAI mediante el proyector `mmproj-Muse-Glimmer-30B-BF16.gguf`.
- Tool calling / function calling: soporta `tools` y `tool_calls` al estilo OpenAI, con bucles multi-turno validados en la compuerta `agent`.
- Razonamiento multi-paso y planificacion para tareas agenticas, con recuperacion ante fallos segun la documentacion de Meta.
- Capacidades multilingues: entrenado con datos de mas de cien idiomas.
- Decodificacion especulativa integrada (DFlash, profundidad 5, activada por defecto) con una tasa de aceptacion del 57 % en la compuerta `spec`.
- Muestreo configurable: `temperature`, `top_p`, `top_k` y `seed`.
- Concurrencia de hasta 4 peticiones simultaneas y limite de 4096 tokens de salida por peticion (preset `max_tokens`).
- Sin soporte de audio (ni entrada ni salida) y sin soporte de ajuste de esfuerzo de razonamiento.

## Casos de uso

- Agentes locales siempre activos: el modelo esta disenado por Meta para ejecutarse de forma continua en un unico equipo; el paquete Loom lo sirve en `127.0.0.1:8080` con API compatible con OpenAI, lo que permite conectarlo a frameworks de agentes sin infraestructura en la nube.
- Automatizacion de uso de herramientas: con soporte nativo de `tool_calls` y bucles multi-turno validados, puede orquestar llamadas a APIs internas, ejecutar comandos y encadenar pasos con recuperacion ante errores.
- Asistentes sobre documentos largos: la ventana de 131 072 tokens permite procesar contratos, informes o bases de codigo extensas en una sola peticion; la compuerta `needle` valida la recuperacion de informacion hasta la mitad del contexto.
- Analisis de imagenes en local: la entrada multimodal via `image_url` habilita tareas de descripcion, extraccion de datos de capturas o clasificacion visual sin enviar imagenes a servicios externos.
- Desarrollo y depuracion de codigo asistida: el modelo puede integrarse en editores o pipelines mediante la API OpenAI-style, con tool calling para consultar repositorios o ejecutar pruebas.
- Atencion al cliente multilingue: el entrenamiento en mas de cien idiomas y el contexto largo permiten gestionar conversaciones multi-turno con historial extenso en un solo equipo.
- Prototipado en hardware de consumo: con 39 GB de memoria reservada en un Ryzen AI Max+ 395, sirve como banco de pruebas para agentes antes de desplegar en servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Meta afirma estado del arte en su clase en benchmarks agenticos frente a Gemma4-31B y Qwen3.6-27B, pero sin cifras concretas en las fuentes consultadas.

Los unicos datos numericos disponibles son de rendimiento de inferencia del paquete Loom frente a llama.cpp sobre el mismo GGUF en un AMD Ryzen AI Max+ 395 (Radeon 8060S, 216 GB/s, 59 TFLOP/s):

| Metrica | llama.cpp | Loom | Margen | Techo roofline | % del techo (Loom) |
|---|---|---|---|---|---|
| Decodificacion tok/s, prompt corto | 21,8 | 26,6 | +22 % | 33,3 | 80 % |
| Decodificacion tok/s, contexto 2k | 19,8 | 21,8 | +10 % | 30,6 | 71 % |
| Decodificacion tok/s, contexto 32k | 21,9 | 22,5 | +3 % | 36,3 | 62 % |
| Prefill tok/s, documento 1k | 339,6 | 447,1 | +32 % | 1162,5 | 38 % |
| Prefill tok/s, documento 2k | 332,8 | 484,5 | +46 % | 1152,8 | 42 % |
| Prefill tok/s, documento 8k | 335,1 | 484,4 | +45 % | 1124,1 | 43 % |
| Prefill tok/s, documento 16k | 322,1 | 476,0 | +48 % | 1106,1 | 43 % |
| Prefill tok/s, documento 32k | 304,2 | 456,6 | +50 % | 1071,9 | 43 % |
| 4 flujos, decodificacion agregada tok/s | 64,6 | 39,5 | -39 % | 185,5 | 21 % |
| Tokens borrador aceptados (spec decoding) | no medido | 57 % | no aplicable | no aplicable | no aplicable |

Notas de medicion: mismas condiciones de GGUF en ambos motores; Loom con decodificacion especulativa DFlash a profundidad 5; tiempos del lado del cliente en Loom y del servidor en llama.cpp; media de 1-2 ejecuciones en decodificacion y prefill, mediana de 1 en 4 flujos; medido el 2026-11-07 con hrx-loom 0.1.0 sobre Ubuntu 24.04.

## Requisitos de hardware

- VRAM/memoria estimada: el ejemplo de arranque del paquete reserva `--memory_bytes=39000000000` (unos 39 GB) en memoria unificada del sistema; el GGUF Q4_K_M de 30B ocupa aproximadamente 17-18 GB, mas el proyector BF16 y el borrador DFlash.
- GPU recomendadas: el paquete esta validado en AMD Ryzen AI Max+ 395 "Strix Halo" con Radeon 8060S (gfx1151) y ROCm; no se documentan pruebas en A100, H100 ni RTX 4090 en la informacion disponible.
- GPU de consumo: si cabe en un equipo de sobremesa con memoria unificada de 64 GB o mas (Strix Halo); en GPUs discretas de consumo con 24 GB (RTX 4090) el Q4_K_M podria caber solo el modelo, sin margen para contexto largo ni proyector, aunque no hay confirmacion en las fuentes.
- Despliegue: `hrx-loom` (`pip install "hrx-loom[hf]"`), `loom-fetch` para materializar el paquete y `loom-serve --device=amdgpu`; el GGUF base tambien es compatible con llama.cpp (build `llamacpp-rocm/b1369` probado) y, por formato, con el ecosistema GGUF habitual (Ollama, llama.cpp), aunque no se documenta su uso.
- Rendimiento medido: 26,6 tok/s de decodificacion con prompt corto y 447-484 tok/s de prefill en documentos de 1k-32k en Strix Halo; 4 flujos concurrentes rinden 39,5 tok/s agregados, un 39 % por debajo de llama.cpp en ese escenario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Muse-Glimmer-30B (este paquete) | 30B | 131 072 | Apache 2.0 (modelo base) | Multimodal texto-imagen, orientado a agentes locales; paquete Loom para ROCm |
| Gemma4-31B | 31B (segun nombre) | no disponible | no disponible | Referencia de Meta para comparar rendimiento agentico en su clase |
| Qwen3.6-27B | 27B (segun nombre) | no disponible | no disponible | Referencia de Meta para comparar rendimiento agentico en su clase |
| unsloth/Muse-Glimmer-30B-GGUF | 30B | 131 072 (heredado) | Apache 2.0 (modelo base) | Misma familia en cuantizacion UD-Q5_K_M; tambien empaquetado por loom-fun |

Meta situa a Muse-Glimmer-30B por delante de Gemma4-31B y Qwen3.6-27B en uso de herramientas, planificacion multi-paso y completado de tareas agenticas, pero no se han proporcionado cifras que permitan verificar esa comparacion.

## Limitaciones y advertencias

- No hay evidencia de que el modelo sirva correctamente una peticion needle-in-a-haystack con el contexto completo (compuerta `needle_full` marcada como "sin evidencia"); la validacion solo cubre hasta la mitad del contexto.
- El razonamiento esta siempre activo y no se puede ajustar el esfuerzo, lo que incrementa el coste de tokens en tareas simples.
- Limite de 4096 tokens de salida por peticion y de 4 peticiones concurrentes en el servidor Loom; en regimen de 4 flujos el rendimiento cae un 39 % frente a llama.cpp.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan evaluaciones de factualidad en la informacion disponible.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad en las fuentes consultadas.
- La licencia Apache 2.0 corresponde al modelo base segun Meta; la licencia del paquete Loom y de los pesos GGUF redistribuidos no se especifica, por lo que conviene verificar antes de uso comercial.
- El paquete esta generado y validado unicamente en AMD Strix Halo con ROCm; el soporte en otras GPU AMD o NVIDIA no esta documentado.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-07: es un artefacto reciente y sin adopcion verificable.
- El nombre "Loom" colisiona con el servicio comercial de grabacion de pantalla; los enlaces de busqueda sobre loom.com no son relevantes para este modelo.

## Enlaces

- Paquete Loom en Hugging Face: https://huggingface.co/loom-fun/ggml-org-Muse-Glimmer-30B-loom
- Checkpoint GGUF base: https://huggingface.co/ggml-org/Muse-Glimmer-30B-GGUF
- Modelo borrador DFlash: https://huggingface.co/z-lab/Muse-Glimmer-30B-DFlash2-GGUF
- Paquete Loom alternativo (unsloth, UD-Q5_K_M): https://huggingface.co/loom-fun/unsloth-Muse-Glimmer-30B-loom
- Repositorio del runtime Loom: https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion de referencia (DevLab Dispatch): https://github.com/loom-fun/loom-skills/actions/runs/42343793411
- Publicacion de Meta: https://ai.meta.com/research/publications/muse-glimmer-30b-an-on-device-agentic-model/
- Pagina del modelo en Meta AI: https://dev.meta.ai/models/muse-glimmer
