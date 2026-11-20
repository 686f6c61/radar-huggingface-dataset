# medismera/Qwen3.8-27B-OBLITERATED-Agentic

## Resumen

Qwen3.8-27B-OBLITERATED-Agentic es un ajuste fino del checkpoint abliterado Qwen3.8-27B-OBLITERATED, a su vez derivado del modelo base Qwen/Qwen3.8-27B. Lo publica el usuario medismera en Hugging Face bajo licencia Apache 2.0. El modelo parte de la familia Qwen3.5 (tag `qwen3_5`) y se presenta como una configuracion "production-engineered": plantilla de chat corregida, soporte nativo de tool calling, protocolo de razonamiento propio (Mythos-Class) y ventana de contexto ampliada hasta 128K tokens en produccion, con techo nativo declarado de 256K.

El problema que aborda es concreto: segun la model card, los checkpoints abliterados upstream arrastraban una plantilla de chat truncada de 506 bytes, descarte silencioso de mensajes con `role: "tool"`, etiquetas de pensamiento invertidas y bucles infinitos de cadena de pensamiento. Esta version sustituye la plantilla por una Jinja2 de 9,4 KB con 22 rutas de resolucion de tool calling y anade descomposicion jerarquica de tareas (Task Tree) y auto-revision adversarial dentro del bloque `<think>`. El resultado es un modelo orientado a agentes, generacion de codigo y flujos multi-paso.

Con 27.781.427.952 parametros (unos 27,8B), formato exclusivamente safetensors y ramas cuantizadas FP8 y AWQ, el modelo es relevante para quien necesite un LLM denso de ~28B con contexto largo, capacidades agenticas fiables y despliegue en una sola GPU de 24 GB mediante la rama AWQ. La model card declara soporte multimodal de entrada (pipeline `image-text-to-text` en los tags), aunque no detalla el componente de vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5, con componentes de atencion lineal y Mamba segun los tags del repositorio; detalles exactos no disponibles |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | 131.072 tokens (128K) probados en produccion; hasta 262.144 (256K) nativos segun la model card |
| Tipos de cuantizacion | BF16 (completa), FP8 (8 bits), AWQ (4 bits con MTP y Marlin); no se ofrecen GGUF |
| Idiomas soportados | Ingles (en), chino (zh), arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (29 shards en BF16, 2 en FP8) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio, que mencionan `mamba` y `linear-attention` junto a `qwen3_5`. Esto sugiere una variante hibrida de la familia Qwen3.5 con capas de atencion lineal o estado recurrente combinadas con atencion clasica, pero no se especifica el numero de capas, cabezas, dimension oculta ni la proporcion entre tipos de capa. El modelo es denso, no MoE, a tenor del recuento de parametros y de la ausencia de parametros activos en la informacion.

Tampoco se publican datos sobre el corpus de entrenamiento original (numero de tokens, composicion, fases de RLHF o DPO) ni sobre el proceso de abliteracion aplicado por OBLITERATUS. Lo que si documenta la model card es la intervencion de medismera: sustitucion de la plantilla de chat por una Jinja2 canonica de 9,4 KB con 22 rutas de resolucion de tool calling, inyeccion del protocolo Mythos-Class (descomposicion en arbol de tareas, auto-revision adversarial y convergencia antes de cerrar `</think>`) y ampliacion del techo de generacion por turno a 16.384 tokens. Se recomienda muestreo con `temperature 0.65`, `repetition_penalty 1.15` y `presence_penalty 0.15` para evitar los bucles de razonamiento documentados en el checkpoint upstream.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 128K tokens en produccion.
- Razonamiento con cadena de pensamiento explicita en bloques `<think>`, con protocolo de auto-revision adversarial para reducir bucles.
- Descomposicion jerarquica de tareas (Task Tree): el modelo estructura objetivos complejos en fases de analisis, verificacion e implementacion.
- Tool calling y function calling nativos, con soporte declarado para Hermes Agent, Aider y OpenCode, y parsers dedicados en SGLang (`qwen3_coder`) y vLLM (`hermes`).
- Ejecucion agentica multi-paso con llamadas a herramientas encadenadas (terminal, lectura y escritura de ficheros, validacion).
- Generacion de codigo y tareas de razonamiento matematico y logico.
- Capacidad multimodal de entrada declarada en los tags (`image-text-to-text`), sin detalle de resolucion o encoder.
- Multilinguee en ingles, chino y arabe; no se declara soporte de castellano.
- Modo "uncensored" por herencia del checkpoint abliterado, con rechazo reducido a peticiones que el modelo base filtraria.

## Casos de uso

- Agentes de codigo autonomos: con tool calling nativo y 16.384 tokens de salida por turno, el modelo puede leer un repositorio, planificar cambios en un arbol de tareas, escribir parches y ejecutar tests en un bucle cerrado dentro de herramientas como Aider u OpenCode.
- Automatizacion de operaciones y pentesting autorizado: la plantilla incluye ejemplos de flujo con terminal, inspeccion de codigo y validacion de exploits; encaja en pipelines de reconocimiento y analisis de vulnerabilidades sobre entornos propios.
- Atencion al cliente multi-turno: la ventana de 128K permite mantener historiales largos y documentacion de producto en contexto sin truncar, con respuestas en ingles, chino o arabe.
- Analisis de documentos extensos: informes, contratos o bases de codigo que superan los 100K tokens se pueden procesar en una sola pasada, con resumen y extraccion estructurada.
- Generacion de codigo en produccion: la rama AWQ cabe en una RTX 4090 y permite servir una API compatible con OpenAI mediante vLLM, integrble en pipelines de CI/CD para revision o generacion de tests.
- Razonamiento multi-paso con verificacion: el protocolo Mythos-Class fuerza al modelo a cuestionar sus hipotesis antes de responder, util en diagnostico de fallos, analisis de causa raiz o planificacion tecnica.
- Despliegue soberano o de investigacion sin restricciones de filtrado: al ser abliterado y Apache 2.0, sirve para estudiar comportamiento de modelos sin capas de rechazo, siempre con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni comparativas numericas con otros modelos; solo describe correcciones funcionales y de plantilla respecto al checkpoint upstream.

## Requisitos de hardware

- BF16 (completa): ~60 GB de VRAM; requiere 2x A100, 2x RTX 4090, H100 o configuracion tensor-parallel equivalente.
- FP8 (8 bits): ~30 GB de VRAM; cabe en 1x A100 (40 u 80 GB) o en 2x RTX 3090/4090.
- AWQ (4 bits): ~16 GB de VRAM; cabe en una sola GPU de 24 GB (RTX 3090, RTX 4090, A5000).
- Motores soportados: SGLang (recomendado por RadixAttention para agentes), vLLM, TGI y TRT-LLM en BF16; SGLang, vLLM y LMDeploy en AWQ.
- KV cache en FP8 (`--kv-cache-dtype fp8_e5m2`) recomendada para sostener 128K de contexto sin agotar memoria.
- No se ofrece ruta GGUF/llama.cpp ni Ollama; el autor opta por safetensors para evitar bugs de kernels GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| medismera/Qwen3.8-27B-OBLITERATED-Agentic | ~27,8B | 128K (256K nativo) | Apache 2.0 | Safetensors (BF16, FP8, AWQ) | Tool calling corregido, protocolo Mythos, abliterado |
| OBLITERATUS/Qwen3.8-27B-OBLITERATED | ~27,8B | 32K nativo | Apache 2.0 | Safetensors | Checkpoint upstream; plantilla truncada y tool calling roto segun la model card |
| Qwen/Qwen3.8-27B | ~27,8B | No disponible | No disponible | No disponible | Modelo base original; comportamiento alineado y sin abliterar |

No se dispone de datos de rendimiento comparado ni de especificaciones detalladas de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterado: se ha eliminado o reducido el direccionamiento de rechazo, por lo que puede producir contenido que el modelo base filtraria. Requiere moderacion externa en produccion.
- Riesgo de alucinacion inherente a la familia y agravado por el modo de razonamiento extendido; la auto-revision Mythos-Class mitiga bucles pero no garantiza veracidad.
- Idiomas limitados a ingles, chino y arabe; el castellano no esta declarado y su calidad no esta verificada.
- La model card no documenta sesgos conocidos ni evaluaciones de seguridad; no hay benchmarks publicados.
- El contexto de 256K es un maximo nativo declarado, pero solo 128K estan probados en produccion; por encima de ese umbral el comportamiento no esta garantizado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B y el checkpoint OBLITERATUS pueden tener condiciones adicionales que conviene revisar antes de desplegar.
- No hay soporte GGUF ni Ollama; el despliegue en CPU o en hardware sin GPU compatible con safetensors y FP8/AWQ no esta cubierto.
- La arquitectura hibrida con componentes Mamba y atencion lineal no esta documentada en detalle, lo que complica estimar el rendimiento real en contextos largos.
- El repositorio ocupa 233,6 GB, lo que exige espacio de almacenamiento considerable incluso descargando solo una rama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/medismera/Qwen3.8-27B-OBLITERATED-Agentic
- Checkpoint base abliterado: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Discusion sobre bucles de razonamiento en el upstream: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED/discussions/7
- Discusion sobre plantilla de chat truncada (issue #9): https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED/discussions/9
- Discusion sobre plantilla de chat truncada (issue #14): https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED/discussions/14
