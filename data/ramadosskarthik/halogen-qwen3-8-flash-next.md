# ramadosskarthik/halogen-qwen3.8-flash-next

## Resumen
halogen-qwen3.8-flash-next es un paquete de pesos cuantizados del modelo Qwen/Qwen3.8-Flash-Next, reconstruido en el formato propietario `.hgn` de la libreria halogen y pensado exclusivamente para ejecutarse en el motor halogen-flash-server sobre hardware AMD Strix Halo (arquitectura gfx1151). Lo publica el usuario ramadosskarthik, aunque la model card atribuye el trabajo al proyecto peonist-ai. No es un modelo nuevo: es una redistribucion optimizada del checkpoint base, con cuantizacion a 4 bits y una tabla de busqueda n-gram asociada.

El objetivo del autor es ofrecer inferencia local de un modelo de tipo Mixture of Experts (MoE) y ventana larga en un APU AMD, un escenario donde las pilas habituales (transformers, vLLM, llama.cpp) no cubren bien gfx1151. Los pesos en `.hgn` no cargan en ninguna de esas herramientas: solo lo hacen dentro del contenedor halogen-flash-server, que expone una API compatible con OpenAI en el puerto 8731.

La relevancia actual es doble: por un lado demuestra un camino de despliegue para MoE cuantizados sobre memoria unificada AMD; por otro, documenta trucos poco comunes como una tabla de busqueda n-gram separada, una torre de vision opcional, una cabeza de borrador (draft head) para decodificacion especulativa y salidas estructuradas `json_schema` forzadas durante la decodificacion. No hay datos publicados sobre parametros, contexto o idiomas del modelo base en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) sobre transformer, segun etiquetas del repositorio |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (etiquetado como "long-context") |
| Tipos de cuantizacion | 4-bit en formato `.hgn`; variante `ht43` con expertos en menos bits; ruta GGUF con expertos IQ4_NL / IQ4_XS / IQ3_S / Q4_0 y capas densas Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `.hgn` (propietario de halogen); tambien acepta GGUF de llama.cpp repackado en memoria |

Datos adicionales del repositorio: tamano de 307,1 GB, 0 descargas, 0 likes, creado y actualizado el 2 de octubre de 2026, `pipeline_tag` de text-generation y `inference: false` (el widget esta desactivado deliberadamente porque ningun visor del Hub puede cargar archivos `.hgn`).

## Arquitectura y entrenamiento
No hay informacion de entrenamiento en el material proporcionado: se desconoce el numero de tokens, la composicion del dataset y si hubo RLHF, DPO u otro ajuste. Lo unico deducible es la arquitectura, marcada con las etiquetas `moe` y `mixture-of-experts`, y la vocacion de contexto largo (`long-context`). El modelo base es Qwen/Qwen3.8-Flash-Next, del que no se aportan especificaciones en esta ficha.

La aportacion tecnica del repositorio es de inferencia, no de modelado. El paquete incluye: un checkpoint principal (`qwen38-flash-next-v2.hgn`, 62,1 GiB) con su tabla de busqueda n-gram (`ngram.hgn`, 47,7 GiB) que debe descargarse obligatoriamente junto a el; un checkpoint alternativo de menor huella (`ht43.hgn`, 53,7 GiB) que guarda los expertos en menos bits y ahorra unos 8 GiB en memoria; una torre de vision opcional (`vision.hgn`, 0,84 GiB) que se activa con `HALOGEN_VISION_TOWER=1`; y una cabeza de borrador (`mtp.hgn`, 1,42 GiB) que aporta los 31 tensores de cabeza del checkpoint, con las 18 proyecciones densas a 8 bits, para habilitar decodificacion especulativa cuando se ejecuta un GGUF de terceros. El motor puede abrir un GGUF de llama.cpp (por ejemplo el `UD-IQ4_XS` de unsloth) y repackarlo sin perdida en RAM al arrancar.

## Capacidades
- Generacion de texto autoregresiva en modo servidor, con endpoints `/v1/chat/completions`, `/v1/completions`, `/v1/models` y `/v1/responses`.
- Compatibilidad con la Responses API de OpenAI, lo que permite usar directamente la OpenAI Codex CLI apuntando un `model_providers` con `wire_api = "responses"`.
- Tool calling y function calling a traves de los endpoints compatibles con OpenAI.
- Salidas estructuradas forzadas durante la decodificacion: `json_schema` y `json_object` (o `text.format` en la ruta Responses) garantizan respuestas validas segun el esquema.
- Capacidad de vision opcional si se instala la torre `vision.hgn`; sin ella el servidor es solo texto y rechaza imagenes indicando el ajuste que las activa.
- Decodificacion especulativa mediante cabeza de borrador (`mtp.hgn`) cuando se sirve un GGUF.
- Razonamiento en contexto largo por la etiqueta `long-context` del repositorio (sin cifra publicada).
- Capacidades multilingues: no disponible.

## Casos de uso
- Asistente de codigo local en estaciones AMD Strix Halo: apuntando la Codex CLI al endpoint `/v1/responses` del servidor, se obtiene un asistente con tool calling integrado sin enviar codigo a la nube.
- Generacion de respuestas JSON validadas en pipelines: con `response_format` de tipo `json_schema` la salida es valida por construccion, util para integrar el modelo en automatizaciones que consumen datos estructurados.
- Analisis de capturas de pantalla e imagenes: activando la torre de vision opcional se pueden enviar screenshots al modelo; con texto unicamente se puede prescindir del archivo `vision.hgn` sin cambiar el comportamiento del modo texto.
- Servicio de atencion al cliente con privacidad estricta: el despliegue en un contenedor local y la ausencia de llamadas externas permiten gestionar conversaciones multi-turno sin filtrar datos fuera de la organizacion.
- Aceleracion de inferencia sobre GGUF existentes: si ya se dispone de un GGUF compatible de este modelo, el motor lo repacka en RAM y usa `mtp.hgn` como cabeza de borrador para decodificacion especulativa.
- Entornos air-gapped: al exponer una API compatible con OpenAI dentro de una red aislada, sirve como backend de aplicaciones que ya hablan ese estandar sin necesidad de adaptadores.
- Investigacion sobre cuantizacion MoE en hardware AMD: permite comparar variantes como `v2`, `ht43` y el checkpoint `w4b` de la version 0.14 midiendo consumo de memoria y latencia de lectura.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas tipo MMLU, HumanEval o GSM8K, ni cifras de latencia o throughput. Solo se indica de forma cualitativa que el checkpoint `ht43` lee los prompts algo mas despacio y decodifica con la cabeza de borrador unos pocos por ciento mas lento que el `v2` por defecto.

## Requisitos de hardware
- Hardware objetivo unico: AMD Strix Halo con iGPU gfx1151 (familia Ryzen AI / Radeon) sobre ROCm. No hay soporte declarado para GPU NVIDIA ni para otras arquitecturas AMD.
- Memoria: el checkpoint `v2` ocupa 62,1 GiB en residente y necesita ademas su tabla n-gram mapeada en memoria (47,7 GiB); el total de descarga ronda los 110 GiB. La variante `ht43` ahorra unos 8 GiB de memoria.
- Host recomendado: el autor aconseja una maquina dedicada con 128 GB; con las opciones por defecto el servidor ocupa la mayor parte y deja poco espacio contiguo para otros procesos grandes.
- No cabe en GPU de consumo tipo RTX 4090: el diseno depende de memoria unificada de un APU AMD, no de VRAM discreta.
- Despliegue: exclusivamente a traves del contenedor `ghcr.io/peonist-ai/halogen-flash-server:0.16.0`, con Podman o Docker, pasando `/dev/kfd` y `/dev/dri` y `--group-add keep-groups` (en Docker, en su lugar, `--group-add video --group-add render`).
- Endpoint: API compatible con OpenAI en el puerto 8731. Variables relevantes: `HALOGEN_DOWNLOAD`, `HALOGEN_CHECKPOINT`, `HALOGEN_VISION_TOWER`.
- Latencia y throughput: no disponible; el autor remite a mediciones en su propio repositorio del servidor.

## Comparativa con modelos similares

| Solucion | Formato de pesos | Hardware objetivo | Contexto del modelo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| halogen-flash (este paquete) | `.hgn` propietario; acepta GGUF repackado | AMD Strix Halo gfx1151 | no disponible | apache-2.0 | Contenedor en ghcr.io, repo de 307,1 GB |
| llama.cpp / GGUF de Qwen3.8-Flash-Next | GGUF | Multiples (CPU, CUDA, ROCm, Metal) | no disponible | apache-2.0 (modelo base) | Amplia, pero sin kernels especificos de gfx1151 |
| vLLM | safetensors | GPU NVIDIA y AMD CDNA principalmente | no disponible | apache-2.0 (modelo base) | No soporta los pesos `.hgn` |
| Ollama | GGUF | Multiples | no disponible | apache-2.0 (modelo base) | No soporta los pesos `.hgn` |

Los datos de parametros, contexto y rendimiento del modelo base no estan disponibles en la informacion proporcionada, por lo que la comparativa se limita a formato, hardware y licencia.

## Limitaciones y advertencias
- Los pesos en `.hgn` no cargan en transformers, vLLM ni llama.cpp: quedan atados al motor halogen-flash-server y a la version del contenedor.
- Dependencia total de hardware AMD Strix Halo gfx1151; no es portable a otras GPU.
- Huella de memoria muy alta: mas de 100 GiB entre residente y tabla mapeada, con riesgo de bloqueos largos de CPU (no cuelgues) si compite con otros procesos por la memoria restante.
- No hay resultados de benchmarks publicados, por lo que no se puede validar la calidad frente a otras cuantizaciones del modelo base.
- No se declaran idiomas soportados; el rendimiento multilingue es desconocido.
- Cuantizacion a 4 bits y variantes con expertos en aun menos bits (`ht43`): cabe esperar degradacion de calidad frente al modelo en precision completa, aunque no se cuantifica.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan mitigaciones especificas mas alla del forzado de `json_schema` cuando se usa salida estructurada.
- Sesgos conocidos: no disponible.
- Licencia apache-2.0 declarada tanto en el repositorio como en la model card; conviene verificar tambien la licencia del modelo base Qwen/Qwen3.8-Flash-Next antes de un uso comercial.
- El autor observa que los pesos provienen del modelo base y que el repositorio aparece bajo el usuario ramadosskarthik, mientras la model card y los comandos de descarga apuntan a `peonist-ai`; conviene confirmar la procedencia antes de desplegar.
- La model card esta truncada en el material facilitado, por lo que pueden existir limitaciones adicionales no recogidas aqui.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/ramadosskarthik/halogen-qwen3.8-flash-next
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor de inferencia halogen-flash-server: https://github.com/peonist-ai/halogen-flash-server
- Imagen de contenedor: ghcr.io/peonist-ai/halogen-flash-server:0.16.0
- Discord del proyecto: https://discord.gg/bcm6QknaV6
