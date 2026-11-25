# AXERA-TECH/Qwen3.5-2B-AX8860-llama.cpp

## Resumen

Qwen3.5-2B-AX8860-llama.cpp es un paquete de despliegue, publicado por AXERA-TECH, que permite ejecutar el modelo Qwen3.5-2B (desarrollado por Qwen/Alibaba) sobre la NPU del SoC Axera AX8860 mediante una bifurcacion de llama.cpp con backend ggml-axera. No se trata de un modelo nuevo ni de un ajuste fino: los pesos son los del Qwen3.5-2B original, cuantizados a Q8_0 (2,08 GB) y acompanados de un codificador visual en BF16 (0,8 GB), binarios estaticos para la placa y kernels especificos para la NPU.

El interes principal esta en la eficiencia en hardware de borde: el modelo completo (1.942.653.248 parametros) se ejecuta en una NPU de consumo integrada en un SoC, alcanzando 76,2 tokens/s en decodificacion y hasta 128,5 tokens/s con decodificacion especulativa MTP adaptativa, con un prefill de 6.774 tokens/s para prompts de 4k. Soporta entrada de texto e imagen y expone un servidor compatible con la API de OpenAI.

Es relevante ahora porque demuestra que un modelo multimodal de ~2B puede servir en produccion sobre silicio de borde sin GPU dedicada, con contexto de hasta 16.384 tokens. La ficha se centra en las capacidades documentadas por el autor; los datos sobre licencia, idiomas y benchmarks estandar del modelo base no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-2B); inferencia via llama.cpp con backend ggml-axera sobre NPU AX8860 |
| Parametros totales | 1.942.653.248 (~1,94B) |
| Parametros activos | no disponible (no se documenta como MoE) |
| Longitud de contexto | hasta 16.384 tokens |
| Tipos de cuantizacion | Q8_0 para pesos (2,08 GB); BF16 para el codificador visual (0,8 GB) |
| Idiomas soportados | no disponible (la model card muestra pruebas en chino e ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (`qwen3.5-2b-q8_0.gguf`, `mmproj-Qwen3.5-2B-BF16.gguf`) + binarios estaticos y kernels NPU |
| Modelo base | Qwen/Qwen3.5-2B |
| Hardware objetivo | Axera AX8860, SDK V0.5.1 o superior |
| Tamano del repo | 4,9 GB |
| Decodificacion especulativa | MTP opcional (adaptativa o forzada) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-2B, un transformer de ~1,94B parametros del que no se detallan en la informacion disponible los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO). Lo que si documenta el autor es la capa de despliegue: una bifurcacion de llama.cpp (rama `axera-dev` del repositorio ZHEQIUSHUI/llama.cpp, commit `6613735ce`) con kernels compilados para la NPU del AX8860, junto con un codificador visual separado en formato mmproj que habilita la entrada de imagenes.

La innovacion tecnica destacable es el modo MTP (multi-token prediction) opcional: un cabecera de borrador predice varios tokens que el modelo objetivo verifica en una pasada de 4 filas, con tasas de aceptacion entre 0,50 y 0,63 segun el tipo de contenido. El modo adaptativo solo lo activa en contenido estructurado (listas de comandos, matematicas, tablas Markdown, traduccion, codigo) y mantiene decodificacion normal en prosa o cuando se usa muestreo, para no degradar la calidad. Cada borrador se verifica contra el modelo objetivo: en una prueba codiciosa de 64 tokens, 63 coincidieron con la decodificacion normal.

## Capacidades

- Generacion de texto conversacional en chino e ingles (idiomas verificados en las pruebas del autor).
- Entrada de imagen: descripcion de escenas con vehiculos, texto en imagen y personas, mediante el codificador visual BF16.
- Razonamiento y matematicas: el autor incluye escenarios de resolucion de problemas matematicos en sus benchmarks.
- Generacion de codigo: escenarios de codigo y listas de comandos Linux evaluados con MTP.
- Traduccion chino-ingles.
- Generacion de contenido estructurado: tablas Markdown y listas.
- Servidor compatible con la API de OpenAI (`endpoints_compatible`), con plantilla de chat propia (`chat_template.jinja`).
- Soporte de clientes de agentes: acepta mensajes system en mitad de la conversacion (probado con Codex).
- Modo de pensamiento desactivado por defecto (`--reasoning off`), configurable en el servidor.
- Cache de prompt en memoria de 4 GB, ampliable a disco via `CACHE_DIR` para persistir entre reinicios.

## Casos de uso

- Asistente conversacional en dispositivo de borde: el modelo corre integramente en la NPU del AX8860 con 76,2 tokens/s, suficiente para interaccion por voz o chat en tiempo real sin conexion a la nube ni GPU dedicada.
- Descripcion de imagenes en camaras o dispositivos IoT: con el codificador visual BF16 integrado, se puede enviar una imagen y obtener una descripcion textual (vehiculos, texto, personas) en el propio dispositivo, util para videovigilancia o accesibilidad.
- Automatizacion de terminal y agentes de codigo: el soporte de mensajes system en mitad de la conversacion y la aceleracion MTP en listas de comandos Linux (1,68x) lo hacen adecuado como backend local para clientes tipo Codex que generan comandos de shell.
- Traduccion chino-ingles en linea: el escenario de traduccion alcanza 108,0 tokens/s con MTP adaptativo, lo que permite traduccion casi en tiempo real en un dispositivo empotrado.
- Generacion de documentacion tecnica con tablas: el modo MTP acelera especialmente las tablas Markdown (1,54x), por lo que es util para generar informes o documentacion estructurada en local.
- Servicio local compatible con OpenAI: al exponer un endpoint OpenAI-compatible (`sh run.sh -s 8080`), se puede integrar como backend de herramientas existentes (SDKs de OpenAI, frameworks de agentes) sin modificar el codigo cliente.
- Procesamiento de prompts largos: con 6.774 tokens/s de prefill y 16.384 tokens de contexto, es viable analizar documentos o conversaciones extensas en el dispositivo.

## Benchmarks y rendimiento

Rendimiento medido por el autor sobre AX8860 con contexto de 16.384 tokens (`sh bench.sh mtp`, hasta 256 tokens generados, decodificacion codiciosa salvo indicacion):

| Escenario | Sin MTP (tokens/s) | MTP adaptativo (tokens/s) | Aceleracion | Tasa de aceptacion |
|---|---:|---:|---:|---:|
| Lista de comandos Linux | 76,7 | 128,5 | 1,68x | 0,633 |
| Matematicas | 77,3 | 124,0 | 1,60x | 0,605 |
| Tabla Markdown | 76,7 | 117,7 | 1,54x | 0,589 |
| Traduccion chino-ingles | 75,8 | 108,0 | 1,42x | 0,500 |
| Codigo | 76,3 | 108,0 | 1,42x | 0,529 |
| Ensayo en chino | 76,7 | 77,3 | 1,01x | no disponible |
| Relato en ingles | 76,5 | 77,0 | 1,01x | no disponible |
| Explicacion en chino | 76,9 | 77,5 | 1,01x | no disponible |
| Codigo con muestreo | 76,3 | 76,6 | 1,00x | no disponible |

Metricas adicionales de `sh bench.sh` (128 tokens generados):

| Prompt | Contexto (`-c`) | Tiempo de prompt | Decodificacion (tokens/s) |
|---|---:|---:|---:|
| 3.908 tokens | 8192 | 0,58 s | 75,0 |
| 3.908 tokens | 16384 | 0,60 s | 73,8 |
| 3.908 tokens (muestreo) | 8192 | 0,59 s | 72,2 |
| 47 tokens | 8192 | 0,08 s | no disponible |
| 5 tokens | 16384 | 0,06 s | no disponible |

Calidad: perplexity sobre `ppl_zh.txt` (`-c 512 --chunks 2`) de 12,3236 con `-ub 1` y 12,3143 con `-ub 4`, con MTP desactivado. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Hardware obligatorio: SoC Axera AX8860 con SDK V0.5.1 o superior; no funciona en GPU convencional ni en CPU de proposito general con este paquete.
- Memoria: el runtime reserva los 4 nucleos NPU en exclusiva y una cache de prompt de 4 GB en memoria del host (ampliable a SSD con `CACHE_DIR`).
- Almacenamiento: repo de 4,9 GB; pesos Q8_0 de 2,08 GB y codificador visual de 0,8 GB.
- No cabe en GPU de consumo tipo RTX 4090 porque el paquete esta compilado para la NPU AX8860; para ejecutar el modelo base en GPU habria que usar los pesos originales de Qwen3.5-2B con llama.cpp u otro runtime, extremo no documentado aqui.
- Despliegue: scripts `run.sh` (texto, imagen, chat interactivo, servidor OpenAI-compatible) y `bench.sh`, invocados con `sh` porque los ficheros descargados de Hugging Face no conservan permisos de ejecucion.
- Latencia y throughput: 76,2 tokens/s en decodificacion, hasta 128,5 tokens/s con MTP adaptativo, 6.774 tokens/s de prefill para 4k y 0,58 s para procesar un prompt de 3.908 tokens.
- Nota operativa: en algunos entornos se observa un fallo ocasional `ret = -3` en peticiones consecutivas; el autor recomienda reintentar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware | Rendimiento documentado | Licencia |
|---|---|---:|---|---|---|
| Qwen3.5-2B-AX8860 (este paquete) | ~1,94B | 16.384 | NPU Axera AX8860 | 76,2 tok/s; 128,5 tok/s con MTP | no disponible |
| Qwen/Qwen3.5-2B (modelo base) | ~1,94B | no disponible | GPU/CPU generica | no disponible | no disponible |
| Alternativas de ~2B en llama.cpp | no disponible | no disponible | GPU/CPU generica | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones de licencia de modelos comparables que permitan una comparacion cuantitativa rigurosa. La comparativa relevante es funcional: este paquete es especifico para la NPU AX8860, mientras que el modelo base Qwen3.5-2B puede desplegarse en otros runtimes, aunque su rendimiento en ellos no esta documentado aqui.

## Limitaciones y advertencias

- Dependencia total de hardware: solo funciona en Axera AX8860 con SDK V0.5.1 o superior; no es portable a otras NPU ni GPU sin recompilar kernels.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; hay que verificar la licencia del modelo base Qwen3.5-2B y la de los binarios/kernels del autor antes de produccion.
- Idiomas no declarados formalmente: las pruebas del autor cubren chino e ingles; el comportamiento en castellano u otros idiomas no esta verificado.
- Riesgo de alucinacion inherente a un modelo de ~2B: no se han publicado evaluaciones de fidelidad factual ni benchmarks estandar.
- El modo MTP solo acelera peticiones codiciosas con `presence_penalty: 0`; en modo adaptativo, las peticiones con muestreo y la prosa no se benefician (aceleracion ~1,00-1,01x).
- El pensamiento (reasoning) esta desactivado por defecto en el servidor; hay que activarlo explicitamente si se necesita.
- Fallo intermitente `ret = -3` en peticiones consecutivas en algunos entornos; requiere logica de reintento en produccion.
- La NPU se reserva en exclusiva (4 nucleos, `-np 1`), lo que limita la concurrencia del servidor a una peticion simultanea.
- Los ficheros descargados no tienen permisos de ejecucion; hay que invocarlos con `sh`.

## Enlaces

- Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3.5-2B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Bifurcacion de llama.cpp usada: https://github.com/ZHEQIUSHUI/llama.cpp (rama `axera-dev`, commit `6613735ce`)
- Documentacion MTP incluida en el repo: `MTP.md` y directorio `scenes/`
- Scripts de referencia: `run.sh`, `bench.sh`, `chat_template.jinja`
