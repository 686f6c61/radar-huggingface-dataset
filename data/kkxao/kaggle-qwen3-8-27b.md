# kkxao/KAGGLE-Qwen3.8-27b

## Resumen

`kkxao/KAGGLE-Qwen3.8-27b` es un repositorio de HuggingFace publicado por el usuario kkxao el 13 de octubre de 2026 que, segun su propia model card, no contiene pesos de un modelo de lenguaje, sino un paquete de despliegue para `kaggrun boot`: un binario de `llama-server` compilado para sm_75 (Tesla T4), una copia espejo del binario `cloudflared` 2026.10.0 y la plantilla de chat Qwen-Sharp-Chat-Templates v22.5.0. El nombre sugiere una variante de la familia Qwen3 de unos 27.000 millones de parametros, pero la model card no confirma arquitectura, numero de parametros ni ventana de contexto del modelo subyacente.

El valor tecnico del repositorio esta en la reproducibilidad: cada artefacto esta fijado por sha256 y el arranque falla si los bytes descargados no coinciden con los declarados. El motor se compila desde `ggml-org/llama.cpp` en el commit `539f24529bdf99e0baefd54fefff1660034bfe7b` con `-DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=75`, con la particularidad de que el tarball guarda los alias SONAME como copias de fichero y no como enlaces simbolicos.

Con 0,2 GB de tamano y cero descargas y cero likes en el momento de la consulta, se trata de un artefacto de infraestructura mas que de un modelo publicable de forma autonoma. La licencia del repositorio no esta declarada; la unica licencia explicita que aparece en la model card es Apache-2.0, asociada al proyecto de plantillas de chat referenciado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la arquitectura del modelo; el nombre sugiere familia Qwen3, sin confirmar) |
| Parametros totales | no disponible (el sufijo "27b" del nombre no se confirma en la documentacion) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio no incluye pesos; el motor incluido, llama.cpp, es compatible con GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible para el repositorio; la plantilla de chat Qwen-Sharp-Chat-Templates v22.5.0 se declara Apache-2.0 |
| Formato de pesos | no disponible (no se incluyen pesos; los artefactos son un binario de llama.cpp, el binario cloudflared y una plantilla Jinja) |
| Autor | kkxao |
| Fecha de creacion | 2026-10-13 |
| Fecha de actualizacion | 2026-10-13 |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del modelo subyacente, el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO. La model card no incluye ficha tecnica del modelo, sino la descripcion de un paquete de arranque reproducible con cuatro componentes: `engine/llama-cpp-t4-539f245.tar.gz` (binario `llama-server` para sm_75 construido desde fuente), `engine/BUILDINFO.json` (procedencia con commit, argumentos de cmake y huella de la imagen), `cloudflared/cloudflared` (espejo literal del asset de release de GitHub, version 2026.10.0, linux-amd64) y `chat_template/qwen_sharp_chat_template.jinja` (Qwen-Sharp-Chat-Templates v22.5.0, procedente del proyecto `peculiar-ragdoll`).

El detalle tecnico mas relevante documentado es la necesidad de inyectar un `drv_stub.cmake` en la compilacion: la imagen de GPU de Kaggle incluye `libcuda.so.1` sin enlace simbolico de desarrollo, y sin el stub CMake omite `CUDA::cuda_driver`, lo que degrada silenciosamente el dimensionado de la rejilla de FlashAttention en un rango medido de 15 a 30 veces de ralentizacion. Respecto a la plantilla de chat, el autor afirma que, medida sobre este mismo modelo y motor, mantiene la velocidad de decodificacion y acelera el extremo a extremo unas 3,8 veces en prompts reales porque reduce los tokens de razonamiento. Tambien se advierte de que un campo `reasoning_effort` de nivel superior en el cuerpo de la peticion lo consume el servidor de llama.cpp y nunca llega a la plantilla, por lo que debe usarse `chat_template_kwargs`.

## Capacidades

- Generacion de texto: no documentada explicitamente, pero el paquete incluye un `llama-server` y una plantilla de chat, lo que implica un uso conversacional.
- Razonamiento con tokens de pensamiento: la plantilla Qwen-Sharp reduce los tokens de razonamiento manteniendo la velocidad de decodificacion, segun el autor.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades multimodales (vision, audio): no disponible.
- Servicio de inferencia con API compatible con llama.cpp: si, a traves del binario incluido en `engine/`.
- Exposicion publica del endpoint: si, mediante el binario `cloudflared` incluido, que permite tunelizar el servidor.
- Verificacion de integridad de artefactos: si, mediante hashes sha256 fijados por fichero.

## Casos de uso

- Despliegue de un LLM en una Kaggle Notebook con GPU Tesla T4: el binario esta compilado especificamente para sm_75, de modo que se puede arrancar `llama-server` dentro del entorno de Kaggle sin recompilar y servir el modelo por HTTP.
- Exposicion de un endpoint temporal mediante tunel: el binario `cloudflared` incluido permite publicar el servidor local sin depender de que github.com sea accesible durante el arranque, util para demos y pruebas con colaboradores externos.
- Reduccion de coste en tokens de razonamiento: la plantilla Qwen-Sharp esta pensada para recortar los tokens de pensamiento en prompts reales, lo que reduce la latencia extremo a extremo y el consumo de contexto en cargas conversacionales.
- Entornos con verificacion de supply chain: al fijar cada artefacto por sha256, encaja en pipelines que exigen procedencia verificable y fallan de forma explicita ante bytes inesperados, algo habitual en auditorias de infraestructura de IA.
- Reproduccion de mediciones de rendimiento: el binario se ancla a un commit concreto de llama.cpp para que los numeros de throughput de un informe de benchmarking companero sigan siendo aplicables.
- Base para reconstruir el mismo motor en otras arquitecturas: los argumentos de cmake y el `BUILDINFO.json` documentan la receta de compilacion, lo que sirve como plantilla para recompilar en sm_80, sm_86 o sm_89 cambiando `CMAKE_CUDA_ARCHITECTURES`.
- Pruebas de integracion de plantillas de chat: el fichero Jinja versionado permite validar el comportamiento de la plantilla frente a cambios del servidor, incluida la diferencia entre `reasoning_effort` y `chat_template_kwargs`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un "informe de benchmarking companero" cuyos numeros de throughput se mantendrian aplicables gracias al anclaje al commit `539f24529bdf99e0baefd54fefff1660034bfe7b`, pero dicho informe no forma parte de la informacion proporcionada. El unico dato cuantitativo recogido es la afirmacion del autor de que la plantilla de chat mantiene la velocidad de decodificacion y acelera el extremo a extremo aproximadamente 3,8 veces en prompts reales, asi como la degradacion de 15 a 30 veces que se evita al incluir el stub de CUDA.

## Requisitos de hardware

- Arquitectura de GPU objetivo: exclusivamente sm_75 (Tesla T4), segun `-DCMAKE_CUDA_ARCHITECTURES=75`; el binario no funcionara en otras arquitecturas sin recompilar.
- VRAM estimada para inferencia: no disponible (depende del modelo y de la cuantizacion, que no se documentan).
- Toolkit de CUDA: el binario se construyo contra CUDA 12 (`/usr/local/cuda-12`), con `CMAKE_LIBRARY_PATH` apuntando a `/usr/local/cuda/lib64/stubs` y `/usr/local/nvidia/lib64`.
- GPU recomendadas por el autor: Tesla T4 (sm_75). Otras GPU requieren recompilacion.
- Cabe en GPU de consumo: no disponible; no se especifica que el binario se haya probado en GPU de consumo.
- Opciones de despliegue: llama.cpp (`llama-server`) y tunelizado con cloudflared. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponible; no se aportan numeros en la informacion proporcionada.
- Requisito de compilacion opcional: `-DLLAMA_CURL=OFF` y `-DCMAKE_BUILD_TYPE=Release` son los flags usados en la receta documentada.

## Comparativa con modelos similares

No disponible. No se puede establecer una comparativa fiable porque el repositorio no publica pesos, licencia, numero de parametros, contexto ni resultados de benchmarks del modelo subyacente, y porque su naturaleza es la de un paquete de despliegue y no la de una distribucion de modelo. Como artefactos funcionalmente equivalentes existirian imagenes de contenedor con llama.cpp o vLLM precompilado, pero la informacion proporcionada no incluye datos de rendimiento ni de licencia que permitan tabular una comparacion.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo; los 0,2 GB corresponden a motor, binario de tunelizado y plantilla de chat. Cualquier uso real exige obtener los pesos por otra via.
- Licencia del repositorio sin declarar: no hay autorizacion explicita de uso comercial para el conjunto, lo que supone un riesgo legal en produccion. La licencia Apache-2.0 citada corresponde a la plantilla de chat de terceros.
- Ausencia de ficha tecnica del modelo: no se documentan parametros, contexto, idiomas, cuantizaciones ni datos de entrenamiento, por lo que no se puede evaluar idoneidad ni sesgos.
- Riesgo de alucinacion: no evaluado ni documentado.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto e idioma: no disponibles.
- Cero descargas y cero likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Dependencia de binarios precompilados de terceros (espejo de cloudflared) y de la plantilla `peculiar-ragdoll`; la verificacion por sha256 garantiza integridad frente al valor declarado, no la bondad del contenido.
- El binario esta ligado a sm_75: en cualquier otra GPU el rendimiento o la ejecucion no estan garantizados, y omitir el stub de CUDA provoca una degradacion de 15 a 30 veces en FlashAttention sin aviso explicito.
- Trampa de configuracion documentada: `reasoning_effort` a nivel de cuerpo es consumido por el servidor y no llega a la plantilla; hay que usar `chat_template_kwargs`, de lo contrario el ajuste del esfuerzo de razonamiento no surte efecto.
- Los alias SONAME del tarball son copias y no enlaces simbolicos, lo que puede romper herramientas que esperen enlaces reales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kkxao/KAGGLE-Qwen3.8-27b
- Motor base llama.cpp (commit de referencia `539f24529bdf99e0baefd54fefff1660034bfe7b`): https://github.com/ggml-org/llama.cpp
- Proyecto de plantillas de chat Qwen-Sharp-Chat-Templates v22.5.0 (`peculiar-ragdoll`), incluido `PERF.md`: URL no disponible en la informacion proporcionada
- Release de cloudflared 2026.10.0 linux-amd64: URL no disponible en la informacion proporcionada
- Informe de benchmarking companero citado en la model card: no disponible en la informacion proporcionada
