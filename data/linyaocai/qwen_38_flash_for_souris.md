# linyaocai/Qwen_38_flash_for_Souris

## Resumen

Souris · Qwen3.8 Flash Next es un paquete de pesos y un runtime de inferencia local publicado por el usuario linyaocai en Hugging Face, orientado a ejecutar un modelo de la familia Qwen (denominado en la model card "Qwen3.8 Flash Next") en una unica GPU de 24 GB con una ventana de contexto de 32K tokens. No se trata de un modelo entrenado desde cero por el autor, sino de una distribucion cuantizada y empaquetada de un modelo base de Qwen, acompanada de un runtime propio en C++/CUDA con frontend Python compatible con la API de OpenAI.

La propuesta tecnica se centra en la ingenieria de despliegue: cuantizacion mixta (IQ2_XXS para las proyecciones gate/up y Q4_0 para down), un contenedor de pesos propietario llamado SRS1 que agrupa pesos densos, 144 roles de expertos, tokenizer y checksums en un unico fichero `.bin`, y un motor de decodificacion especulativa basado en MTP (multi-token prediction) con hasta 4 borradores. El repositorio ocupa 22,9 GB en Hugging Face (dividido en 12 fragmentos de 10 GB) y los pesos consolidados alcanzan 118,7 GB, lo que confirma que el modelo subyacente es de escala muy grande pese a la cuantizacion agresiva.

El interes actual del artefacto es doble: por un lado, demuestra que es posible servir un modelo de gran tamano con contexto largo en hardware de consumo mediante offloading de expertos a disco con `O_DIRECT` y una cache SLRU en GPU; por otro lado, su naturaleza experimental (0 descargas, 0 likes, licencia no especificada, solo chino) lo convierte en un objeto de estudio mas que en una dependencia de produccion. La model card reporta cifras de throughput medidas en una RTX 4090, pero el propio autor advierte que no son metricas de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), inferida por la presencia de 144 roles de expertos y pesos gate/up/down; no se detalla el numero de capas ni dimensiones |
| Parametros totales | no disponible (los pesos consolidados ocupan 118,7 GB en IQ2_XXS/Q4_0) |
| Parametros activos | no disponible |
| Longitud de contexto | 33.280 tokens (maximo de prompt: 32.768 tokens) |
| Tipos de cuantizacion | IQ2_XXS (gate/up) + Q4_0 (down); KV cache en Q8_0 |
| Idiomas soportados | zh (chino) segun los metadatos del repositorio |
| Licencia | no disponible |
| Formato de pesos | SRS1 v1 (contenedor propietario `.bin`); no es GGUF ni safetensors; MTP en `weights.bin` + `manifest.json` |

## Arquitectura y entrenamiento

La model card describe un transformer con mezcla de expertos: el contenedor SRS1 alberga "144 expert role" junto a los pesos densos, y el motor de inferencia implementa un `ExpertRepository` que lee registros de expertos desde disco con `O_DIRECT`, un `SlotPool` que gestiona las ranuras finales en GPU con politica SLRU y transacciones temporales para MTP, y un `TransferEngine` que reutiliza staging pinned. El prefill se ejecuta con kernels MMQ de GGML: un producto para gate/up con epilogo SwiGLU + Q8_1, otro para down y un scatter ponderado, con `mmq_group=16` por defecto y reutilizacion de activaciones cuantizadas dentro del mismo tile.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base paso por RLHF, DPO u otras etapas de alineamiento. El autor no entreno el modelo: redistribuye pesos de Qwen en un formato propio. Las innovaciones tecnicas documentadas son de runtime, no de modelado: contenedor monolitico SRS1 con layout y checksums, cuantizacion mixta por tipo de proyeccion, decodificacion especulativa MTP con KV privada y commit in-place tras verificacion, y un `SessionManager` que mantiene hasta 8 checkpoints GDN/PLE para reutilizacion de prefijo sin copiar KV ni cachear hidden states ni logits.

## Capacidades

- Generacion de texto autoregresiva en chino, con soporte de parametros `temperature`, `top_p`, `seed` y `stop`.
- Razonamiento multi-turno y conversacion con contexto de hasta 32.768 tokens de prompt.
- Tool calling / function calling a traves del frontend Python compatible con OpenAI (chat completions, resultados de herramientas, reintentos ante errores de esquema y truncamiento de tool).
- Streaming SSE de las respuestas.
- Integracion con agentes: la model card documenta explicitamente el uso con el cliente Pi mediante un provider local.
- Decodificacion especulativa MTP opcional (hasta 4 borradores) para acelerar la fase de decode en contextos largos.
- Reutilizacion de prefijo entre peticiones para reducir coste de prefill en sesiones repetidas.
- Capacidades de vision, audio o thinking mode: no disponibles en la informacion proporcionada.
- Capacidades multilingues: solo se declara chino; no hay evidencia de otros idiomas.

## Casos de uso

- Asistente de codigo local con contexto largo: con 32K tokens de prompt se puede cargar un repositorio mediano o varios ficheros completos y mantener una sesion de refactorizacion; el autor reporta 28,4 tok/s de decode en prompts de codigo reales de 29.247 tokens con MTP activado.
- Agente autonomo sobre Pi u otro cliente compatible con OpenAI: el frontend expone `/v1` con tool calls, streaming e idempotencia, lo que permite conectar el modelo a un bucle de agente sin escribir adaptadores a medida.
- Analisis de documentacion extensa en chino: la ventana de 32K y el soporte declarado de zh lo hacen adecuado para resumir contratos, manuales o expedientes que no caben en modelos de contexto corto desplegados en una sola GPU.
- Servicio de chat interno con requisitos de privacidad: al ejecutarse integramente en local sobre una RTX 4090 o 3090, los datos no salen de la maquina, lo que encaja en entornos con restricciones de confidencialidad.
- Laboratorio de investigacion sobre serving eficiente: el codigo y el formato SRS1 permiten experimentar con offloading de expertos, politicas SLRU, decodificacion especulativa y reutilizacion de prefijo en un caso real de modelo grande.
- Pruebas de regresion de agentes: la idempotencia de peticiones y el manejo de errores de esquema en tool calls facilitan construir suites de evaluacion reproducibles para pipelines de agentes.
- Prototipado de asistentes con contexto conversacional largo: la reutilizacion de prefijo con hasta 8 checkpoints reduce el coste de prefill en conversaciones multi-turno con historial extenso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo reporta metricas de throughput y capacidad medidas en una RTX 4090 de 24 GB con contexto de 33.280 tokens, `max_prompt_tokens=32768`, `staging_mib=1024`, `read_threads=8`, `mmq_group=16` y generacion de 512 tokens:

| Escenario | Prefill (tok/s) | Decode (tok/s) | Notas |
|---|---:|---:|---|
| 30K + 512, MTP off | 3090,10 | 68,47 | Entrada sintetica de 30K |
| 30K + 512, MTP on | 2990,01 | 102,69 | Aceptacion MTP 98,59% |
| 32K exacto + 512, MTP off | 3184,12 | 71,37 | Entrada sintetica repetida |
| 32K exacto + 512, MTP on | 3156,99 | 151,86 | Aceptacion MTP 99,73% |
| Codigo real 29.247, MTP off | 1855,4 | 16,5 | Prompt de codigo real |
| Codigo real 29.247, MTP on | 1811,5 | 28,4 | Aceptacion MTP 57,7% |

El propio autor advierte que las cifras con entrada sintetica repetida miden capacidad y ancho de banda, no calidad sobre texto real, y que en prompts cortos el MTP puede ralentizar la generacion.

## Requisitos de hardware

- GPU objetivo: RTX 4090 o RTX 3090 con 24 GB de VRAM; el diseno esta calibrado para ese limite.
- VRAM: el modelo no cabe completo en VRAM; los pesos consolidados son 118,7 GB y se sirven mediante offloading de expertos desde disco con `O_DIRECT`, manteniendo en GPU las ranuras activas, la KV cache en Q8_0 y el staging pinned (1 GiB por defecto).
- Almacenamiento: se requieren al menos 118,7 GB para el fichero `souris-iq2xxs.bin` consolidado mas los fragmentos de descarga, y un SSD con buen rendimiento de lectura aleatoria para el `ExpertRepository`.
- Memoria del sistema: no disponible; la model card no especifica requisitos de RAM, aunque la cache de expertos en RAM se dimensiona en tiempo de arranque segun la VRAM libre.
- Software: Linux, CUDA, CMake, `build-essential` y `libssl-dev`; compilacion con `-DGGML_CUDA=ON`.
- Despliegue: backend C++ `souris serve` con fichero TOML de configuracion y frontend Python (`frontend/server.py`) que expone una API compatible con OpenAI en `/v1`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el formato SRS1 no es compatible con GGUF.
- Rendimiento: prefill de hasta 3184 tok/s y decode de hasta 151,86 tok/s en cargas sinteticas; en codigo real el decode baja a 28,4 tok/s con MTP.
- Limitacion de escalado: el frontend es un unico proceso Python; el despliegue multi-worker requiere disenar sesiones e idempotencia adicionales.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de benchmarks de calidad ni identificacion precisa del modelo base de Qwen, por lo que no es posible establecer una comparacion rigurosa con alternativas de la misma categoria. Como referencia estructural, el artefacto se posiciona frente a otros runtimes de inferencia local para modelos grandes (llama.cpp, vLLM, TGI) por su formato propietario SRS1 y su enfoque de offloading de expertos, pero no se dispone de cifras comparables de rendimiento o calidad en la documentacion analizada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial permitido; hay que contactar con el autor o consultar el modelo base de Qwen antes de cualquier despliegue en produccion.
- Estado experimental: 0 descargas y 0 likes en el momento de la ficha, creado y actualizado el mismo dia, sin pipeline declarado ni historial de mantenimiento.
- Solo chino declarado: el rendimiento en castellano u otros idiomas no esta verificado y probablemente sea deficiente.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad, tasas de alucinacion ni resultados de benchmarks de calidad; el autor lo indica explicitamente.
- Cuantizacion muy agresiva: IQ2_XXS en gate/up degrada la calidad frente a los pesos originales; el propio autor senala que solo la combinacion `(IQ2_XXS, IQ2_XXS, Q4_0)` esta validada y que otras combinaciones son rutas de codigo no verificadas.
- Dependencia de disco: el rendimiento depende criticamente de la latencia y el ancho de banda del SSD; en almacenamiento lento el decode puede degradarse de forma severa.
- MTP no es una aceleracion universal: en prompts cortos puede ralentizar; el beneficio se concentra en decode con contexto largo.
- Bug conocido: el autor documenta un problema pendiente de consistencia top-1 exacta en peticiones de codigo real repetidas.
- Un solo proceso de frontend: no hay soporte listo para despliegue multi-worker ni para alta disponibilidad.
- Formato propietario: el fichero `.bin` no se puede cargar con herramientas estandar (GGUF, safetensors, Transformers); requiere el runtime Souris, cuyo codigo fuente se mantiene por separado y no se incluye en el repositorio.
- Fecha de creacion futura (2026-11-23) en los metadatos de Hugging Face: conviene verificar la integridad y procedencia de los pesos antes de usarlos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/linyaocai/Qwen_38_flash_for_Souris
- Modelo base Qwen (referencia generica): https://huggingface.co/Qwen
- GGML (infraestructura de cuantizacion y MMQ citada): https://github.com/ggerganov/ggml
- Cliente Pi (integracion documentada en la model card): no disponible como enlace verificado en la informacion proporcionada
- Paper, blog o demo del runtime Souris: no disponible en la informacion proporcionada
