# jaakkomoller/Qwen3.8-27B-q3mix-NInfer

## Resumen

Qwen3.8-27B-q3mix-NInfer es una distribucion cuantizada del modelo multimodal Qwen/Qwen3.8-27B, convertida por el usuario jaakkomoller al formato nativo de pesos `.ninfer` del motor de inferencia NInfer. No se trata de un checkpoint de Transformers ni de un archivo GGUF o safetensors: es un artefacto de 13,73 GiB pensado exclusivamente para el runtime NInfer, con un perfil de cuantizacion selectiva de 3 bits (`q3mix`) optimizado para tarjetas NVIDIA RTX 5060 Ti de 16 GB de VRAM.

El objetivo declarado del artefacto es reducir el peso residente de los pesos en unos 680 MiB respecto al perfil Q4 puro de 16 GB, de modo que una ventana de contexto de aproximadamente 100.000 tokens con decodificacion especulativa MTP3 quepa en una GPU de consumo de 16 GB. El modelo base es multimodal (pipeline `image-text-to-text`) e incorpora torre de vision, cabezas de prediccion multi-token (MTP) y un esquema de cuantizacion heterogeneo por rol de capa.

Es relevante ahora porque demuestra un caso de despliegue local de un modelo de ~27B con contexto cercano a 100k en hardware de gama de consumo (Blackwell `sm_120a`), algo que hasta hace poco requeria GPU de datacenter. La contrapartida es un ecosistema muy cerrado: requiere compilar NInfer desde fuente, no admite alternativas como vLLM, llama.cpp u Ollama, y el servidor HTTP esta configurado por defecto para una unica peticion concurrente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con capas GDN (recurrentes, con estado `gdn/value_z` y `gdn/output`), torre de vision y cabezas MTP (multi-token prediction) |
| Parametros totales | 27B (segun la denominacion del modelo base Qwen/Qwen3.8-27B); dimension oculta deducida de las proyecciones `mlp/down` [5120, 17408] y 64 capas de texto |
| Parametros activos | No disponible (no se indica que la arquitectura sea MoE) |
| Longitud de contexto | Hasta 100.000 tokens con `--spec mtp --draft-tokens 3 --no-prefix-reuse`; 119.168 con flags de produccion sin tope explicito; 107.904 con los valores por defecto (reutilizacion de prefijo activada) |
| Tipos de cuantizacion | Perfil selectivo `q3mix`: `Q3G64_F16S` en las 64 proyecciones `mlp/down` de texto; `Q4G64_F16S` en `attention/gate_value`, `attention/output`, `gdn/value_z` y `gdn/output`; matrices MTP en mix Q4; embedding de tokens y cabeza de salida completa en `W8G32_F16S`; matrices de vision en asignacion W8/Q6; estado recurrente GDN en INT8 con escalas FP16 por (cabeza, fila `dv`); cache KV paginada en INT4 con una escala FP16 por grupo de 64 elementos |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (contenedor version 2), 14.823.303.168 bytes (13,73 GiB); no es safetensors, GGUF ni checkpoint de Transformers |
| Tamano del repositorio | 14,8 GB |
| Objetos almacenados | 1.124 (1.118 tensores y 6 recursos: vision, MTP, proposal head, tokenizer, chat template, generacion y media processor) |
| SHA-256 del artefacto | `704282c8aa3fd7763cd3a93bc8fa41580c204db978ecf895150d3e08ede630ea` |
| ID interno NInfer | `qwen3.8-27b`, weights ID `groupwise-int`, target key `qwen3_8_27b` |

## Arquitectura y entrenamiento

La informacion disponible describe el artefacto cuantizado, no el entrenamiento del modelo base. Se sabe que Qwen3.8-27B combina atencion con capas GDN (un esquema recurrente con estado interno, almacenado en INT8 con escalas FP16 por cabeza y fila `dv`), dispone de 64 capas de texto y de una torre de vision que se activa solo con el flag `--vision` en el servidor NInfer. Las cabezas MTP (multi-token prediction) permiten decodificacion especulativa con `--draft-tokens 3`, y el modelo conserva el modo de razonamiento (`--preserve-thinking`).

El esquema de cuantizacion es el elemento diferencial: se aplica 3 bits (`Q3G64_F16S`) unicamente a las proyecciones `mlp/down` de texto, que son las de mayor huella, mientras que los roles mas sensibles (atencion, `gdn/value_z`, `gdn/output`) permanecen en 4 bits y las matrices de embedding y de salida en 8 bits. La cache KV paginada se almacena en INT4 con una escala FP16 por grupo de 64 elementos. Segun el autor, esta asignacion ahorra aproximadamente 680 MiB de pesos residentes frente al perfil Q4 puro de 16 GB, y es lo que permite ajustar un contexto MTP3 de ~100.000 tokens en 16 GB.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se documenta el proceso de conversion ni si se realizo calibracion especifica para el perfil `q3mix`.

## Capacidades

- Generacion de texto y conversacion multi-turno (tag `conversational`).
- Procesamiento de imagenes y video: pipeline `image-text-to-text` y objetos de vision incluidos en el artefacto; **desactivado por defecto**, requiere `--vision` en `ninfer-serve`.
- Razonamiento con modo de pensamiento persistente, mediante el flag `--preserve-thinking`.
- Tool calling y function calling: la documentacion de NInfer cubre explicitamente llamadas a herramientas y el servidor acepta historial de chat estructurado.
- Codigo y matematicas: el perfil de referencia se midio con un prompt de codigo de 5.113 tokens y con LiveCodeBench v6.
- Razonamiento multi-paso y uso en agentes, apoyado en las cabezas MTP para decodificacion especulativa.
- Contexto largo: hasta ~100.000 tokens verificados de extremo a extremo con prompts de 90.000 tokens.
- Capacidades multilingues: no disponible.
- Inferencia de una sola secuencia concurrente en la configuracion de produccion documentada (`--max-concurrency 1`).

## Casos de uso

- **Asistencia de codigo a nivel de repositorio en una estacion de trabajo**: con ~100.000 tokens de contexto se puede cargar un arbol de proyecto amplio, interfaces y tests en una sola ventana, manteniendo la GPU en 16 GB. El rendimiento medido (615,9 tok/s de prefill, 46,13 tok/s de decode con MTP3) es suficiente para uso interactivo de un unico desarrollador.
- **RAG sobre documentacion extensa**: la ventana de casi 100k tokens permite insertar manuales, contratos o expedientes completos sin troceado agresivo, reduciendo la perdida de contexto entre fragmentos. La reutilizacion de prefijo por defecto acelera las consultas repetidas sobre el mismo documento.
- **Revision de codigo en pipelines de CI**: el modelo admite tool calling y salida estructurada, por lo que puede integrarse como paso de analisis que invoca herramientas del repositorio y devuelve un informe; conviene fijar `--max-new` y desactivar la reutilizacion de prefijo para lotes homogeneos.
- **Analisis de capturas, diagramas y documentos escaneados**: activando `--vision`, el servidor acepta imagenes y video, lo que habilita transcripcion de diagramas de arquitectura, lectura de tablas en capturas y descripcion de fotogramas.
- **Prototipado de agentes locales sin datos salientes**: al ejecutarse integramente en la GPU local con CUDA 13.1 y NInfer compilado desde fuente, es adecuado para entornos con requisitos de confidencialidad donde no se puede enviar codigo o documentos a una API externa.
- **Generacion de tests y documentacion bajo demanda**: con contexto largo se puede alimentar el modulo completo y pedir cobertura de casos borde; el modo de pensamiento persistente ayuda a conservar la traza de razonamiento entre pasos.
- **Evaluacion comparativa de tecnicas de cuantizacion**: el artefacto es un caso de estudio reproducible para medir el impacto de un perfil selectivo de 3 bits frente a 4 bits en tareas de codigo (LiveCodeBench v6) y en velocidad de decodificacion.
- **Asistente de codigo offline para formacion**: en aulas o talleres con equipos RTX 5060 Ti, se puede servir un endpoint HTTP local (`ninfer-serve`) para que los alumnos practiquen sin coste de API, asumiendo una sola peticion concurrente.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo, marcados como `verified: false` (no verificados de forma independiente):

| Prueba | Metrica | Valor |
|---|---|---|
| RTX 5060 Ti, prompt de codigo de 5.113 tokens | MTP3 prefill (tok/s) | 615,9 |
| RTX 5060 Ti, prompt de codigo de 5.113 tokens | MTP3 decode (tok/s) | 46,13 |
| RTX 5060 Ti, prompt de codigo de 5.113 tokens | MTP3 tasa de aceptacion (%) | 86,67 |
| RTX 5060 Ti, prompt de codigo de 5.113 tokens | MTP0 decode (tok/s) | 23,03 |
| LiveCodeBench v6 (subconjunto de 175 problemas) | Precision prompt-level strict (greedy, 1 muestra) | 24,57 % |

Techo de contexto alcanzable en la configuracion INT4 de KV (RTX 5060 Ti 16 GB):

| Configuracion | Contexto maximo | `--kv-capacity` automatico | Nota |
|---|---:|---:|---|
| `--no-prefix-reuse --spec mtp --draft-tokens 3 --max-context 100000` | 100.000 | 100.032 (1.563 grupos) | 371 MiB de margen planificado; prompts de 90k tokens verificados de extremo a extremo |
| Flags de produccion, sin tope explicito | 119.168 | 119.168 (1.862 grupos) | 33 MiB de margen planificado; 119.232 se rechaza antes de la subida |
| Valores por defecto (reutilizacion de prefijo activada) | 107.904 | 107.904 (1.686 grupos) | 193 MiB de margen planificado |

La comparativa cabeza a cabeza frente al perfil Q4 puro (mismo prompt de 5.113 tokens, 128 tokens generados, greedy, `--max-context 6144 --prefill-chunk 128 --no-prefix-reuse`) aparece truncada en la informacion disponible, por lo que no se reproducen sus cifras. No se han publicado otros resultados de benchmarks (MMLU, GSM8K, HumanEval u otros) en la informacion disponible.

## Requisitos de hardware

- **VRAM**: 13,73 GiB de pesos en disco y en memoria; se requiere un minimo de 16 GB de VRAM. Con cache KV en INT4 caben ~100.000 tokens en 16 GB; el limite maximo sin tope explicito es de 119.168 tokens.
- **GPU compatibles**: exclusivamente NVIDIA Blackwell con arquitectura `sm_120a`; validado en una GeForce RTX 5060 Ti de 16 GB. No se documenta soporte para Ampere, Ada Lovelace, Turing ni GPU de datacenter (A100, H100) en la informacion disponible.
- **Cabe en GPU de consumo**: si, en RTX 5060 Ti 16 GB; es el unico hardware de referencia declarado.
- **Software**: Linux de 64 bits, CUDA Toolkit 13.1 o superior, y la rama `rtx-5060ti` del repositorio `jaakkomoller/ninfer-5060ti` en el commit `b2c9f8c6` o posterior, compilada desde fuente. NInfer no distribuye binarios ni objetivo de instalacion.
- **Opciones de despliegue**: `ninfer` (CLI) y `ninfer-serve` (servidor HTTP, endpoint local en el puerto 8086 en el ejemplo). No hay soporte para vLLM, llama.cpp, Ollama, TGI ni Transformers, y la model card marca `inference: false` para la Inference API de Hugging Face.
- **Latencia y throughput**: 615,9 tok/s de prefill y 46,13 tok/s de decode con MTP3 y 86,67 % de aceptacion, frente a 23,03 tok/s de decode con MTP0, sobre un prompt de 5.113 tokens en RTX 5060 Ti.
- **Concurrencia**: la configuracion de produccion documentada usa `--max-concurrency 1 --max-pending-requests 2 --pending-timeout-ms 60000`; no es un servidor orientado a alta concurrencia.
- **Flags relevantes**: `--prefill-chunk 128`, `--kv-dtype int4`, `--spec mtp --draft-tokens 3`, `--preserve-thinking`, `--vision` (desactivado por defecto).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables de terceros. La comparacion posible se limita a las tres variantes documentadas dentro del propio ecosistema NInfer:

| Variante | Parametros | Contexto maximo documentado | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (q3mix) | 27B (base) | 100.000 tokens MTP3 (119.168 sin tope) | `.ninfer` v2, 13,73 GiB | Apache 2.0 | Hugging Face, requiere NInfer compilado desde fuente |
| Perfil Q4 puro para 16 GB | 27B (base) | No disponible en la informacion | `.ninfer` | Apache 2.0 | Mismo repositorio de NInfer |
| Qwen/Qwen3.8-27B original | 27B | No disponible en la informacion | No disponible (no es `.ninfer`) | No disponible en la informacion | Hugging Face |

El unico dato comparativo cuantificado aportado es el ahorro de ~680 MiB de pesos residentes del perfil `q3mix` frente al perfil Q4 puro de 16 GB. Frente a modelos de otros fabricantes (Llama, Mistral, Gemma, etc.) no hay datos en la informacion proporcionada.

## Limitaciones y advertencias

- **Ecosistema cerrado**: el artefacto solo funciona con NInfer, que debe compilarse desde fuente en la rama `rtx-5060ti` en el commit `b2c9f8c6` o posterior. No hay binarios, ni soporte para safetensors, GGUF, vLLM, llama.cpp, Ollama o TGI.
- **Hardware restringido**: requiere una GPU Blackwell `sm_120a` con al menos 16 GB de VRAM; no se documenta funcionamiento en A100, H100 ni en generaciones anteriores. Sin CUDA 13.1 o superior, el despliegue no es viable.
- **Estado de publicacion**: el repositorio tiene 0 descargas y 0 likes en el momento del analisis, y las fechas de creacion y actualizacion son del 27 de septiembre de 2026, con apenas siete minutos de diferencia. Es un artefacto reciente y sin validacion externa.
- **Cuantizacion agresiva**: el uso de 3 bits en las 64 proyecciones `mlp/down` introduce perdida de precision no cuantificada en la model card mas alla del resultado de LiveCodeBench (24,57 % en el subconjunto de 175 problemas). No se publica comparacion con el perfil Q4 en tareas de precision.
- **Benchmarks sin verificar**: todos los resultados declarados tienen `verified: false`; ademas, la tabla comparativa q3mix frente a Q4 esta truncada en la informacion disponible.
- **Riesgo de alucinacion**: no disponible de forma especifica; al ser un modelo cuantizado de forma selectiva, la degradacion esperada es mayor en tareas de recuperacion precisa de hechos poco frecuentes.
- **Concurrencia limitada**: la configuracion de produccion usa una unica peticion concurrente con dos pendientes y 60 s de timeout, lo que descarta escenarios de alto QPS.
- **Vision desactivada por defecto**: hay que anadir `--vision` explicitamente; sin ese flag el servidor rechaza entradas de imagen o video.
- **Idiomas**: no se documenta la cobertura linguistica del modelo ni de este artefacto; no hay garantia de calidad en castellano.
- **Licencia**: el artefacto se distribuye bajo Apache 2.0, pero la licencia del modelo base Qwen/Qwen3.8-27B no se detalla en la informacion proporcionada; conviene verificarla antes de un uso comercial.
- **Sin informacion de entrenamiento**: no se documentan datos de entrenamiento, alineamiento ni sesgos conocidos.

## Enlaces

- Hugging Face: https://huggingface.co/jaakkomoller/Qwen3.8-27B-q3mix-NInfer
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio NInfer (rama rtx-5060ti): https://github.com/jaakkomoller/ninfer-5060ti/tree/rtx-5060ti
- Commit minimo requerido: https://github.com/jaakkomoller/ninfer-5060ti/commit/b2c9f8c662209ff07f31d2727f59ce07054102cf
- README de NInfer: https://github.com/jaakkomoller/ninfer-5060ti/blob/rtx-5060ti/README.md
- Documentacion de NInfer: https://github.com/jaakkomoller/ninfer-5060ti/tree/rtx-5060ti/docs

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo; los enlaces obtenidos correspondian a contenidos no relacionados (automocion), por lo que no se incluyen.
