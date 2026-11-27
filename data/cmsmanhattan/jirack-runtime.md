# CMSManhattan/JiRack-runtime

## Resumen

JiRack-runtime no es un modelo de lenguaje, sino un artefacto de distribución de binarios: un paquete de compilaciones de llama.cpp preparadas por el usuario CMSManhattan para las demos de JiRack alojadas en Hugging Face Spaces. El repositorio contiene un archivo `llama-c6a0ff11a-cuda-sm120.zip` con el binario `llama-server` compilado a partir del commit c6a0ff11a de llama.cpp, junto con las bibliotecas de runtime de CUDA necesarias para su ejecución.

La relevancia de este paquete es acotada pero concreta: la compilación está dirigida a la arquitectura sm_120 de NVIDIA (Blackwell), lo que permite ejecutar el servidor de inferencia de llama.cpp en GPUs de esa generación cuando las builds estándar no incluyen los kernels correspondientes. El repositorio ocupa 13,2 GB, un tamaño desproporcionado para lo que describe la model card y que conviene verificar antes de descargarlo.

No hay información sobre pesos, arquitectura de red, tokenizador ni dataset: al tratarse de un runtime, los parámetros del modelo que se ejecute con él dependerán del archivo GGUF que se cargue, no de este repositorio. Cualquier evaluación de capacidades debe hacerse sobre el modelo concreto que se sirva con este binario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (runtime de inferencia, no modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del GGUF cargado y de la configuracion de llama-server) |
| Tipos de cuantizacion | no disponible (llama.cpp soporta GGUF; el repo no enumera cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | llama.cpp: MIT (archivo `LICENSE-llama.cpp` dentro del zip); bibliotecas NVIDIA: licencia CUDA de NVIDIA; licencia del repositorio: no disponible |
| Formato de pesos | no aplica; se distribuye un ZIP con binarios (`llama-server`) y librerias CUDA |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: este repositorio no contiene un modelo entrenado. El contenido descrito es una compilación de llama.cpp en el commit c6a0ff11a, empaquetada como `llama-c6a0ff11a-cuda-sm120.zip`, que incluye el ejecutable `llama-server` y las bibliotecas de runtime de CUDA requeridas. El sufijo `sm120` indica que los kernels CUDA se compilaron para compute capability 12.0, es decir, GPUs NVIDIA Blackwell.

La model card no documenta datos de entrenamiento, proceso de alineamiento, innovaciones de decodificación ni composición del dataset, porque no hay modelo subyacente. El rendimiento y las capacidades dependerán enteramente del archivo GGUF que se cargue en `llama-server` y de los parámetros de lanzamiento (contexto, offload de capas, batch, etc.).

## Capacidades

- Servir modelos en formato GGUF mediante `llama-server`, la implementación de servidor HTTP de llama.cpp con API compatible con OpenAI.
- Ejecución en GPUs NVIDIA Blackwell (sm_120) gracias a la compilación CUDA específica.
- Inclusión de las bibliotecas de runtime CUDA necesarias, lo que simplifica el despliegue en entornos sin CUDA toolkit instalado.
- Capacidades de generación, razonamiento, código, tool calling o multimodal: no disponibles, ya que dependen del modelo GGUF que se cargue.
- Soporte multilingüe: no disponible por la misma razón.

## Casos de uso

- Despliegue de demos en Hugging Face Spaces con GPU Blackwell: el paquete permite arrancar `llama-server` en Spaces con hardware sm_120 sin compilar llama.cpp desde fuente.
- Servicio de inferencia local en estaciones con RTX 50xx: al incluir las librerías CUDA, se reduce la fricción de instalación en máquinas con drivers recientes y GPUs de nueva generación.
- Backend compatible con OpenAI para prototipos: `llama-server` expone endpoints tipo `/v1/chat/completions`, lo que permite apuntar clientes existentes al servidor local sin cambios de código.
- Reproducción de un entorno fijado: al estar compilado sobre el commit c6a0ff11a, sirve para replicar el comportamiento de esa revisión concreta de llama.cpp en pruebas de regresión.
- Evaluación comparativa de GGUF en Blackwell: útil para medir throughput y latencia de distintas cuantizaciones sobre sm_120 con un binario conocido.
- Base para pipelines de CI que necesiten un servidor de inferencia reproducible: el ZIP se puede cachear y desplegar en contenedores con GPU, evitando builds largas de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de latencia, throughput ni comparaciones con otras builds de llama.cpp.

## Requisitos de hardware

- GPU: NVIDIA con compute capability 12.0 (Blackwell). La compilación sm_120 no es compatible con arquitecturas anteriores (Ampere, Ada, Hopper) sin recompilar.
- VRAM: no disponible para el runtime; depende del GGUF cargado y del número de capas offloaded a GPU.
- GPU recomendadas: cualquier GPU Blackwell; el resto de generaciones requeriría una build distinta de llama.cpp.
- Opciones de despliegue: `llama-server` incluido en el ZIP; alternativas equivalentes serían compilar llama.cpp para la arquitectura objetivo o usar otras builds (CUDA genérica, Vulkan, CPU).
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 13,2 GB, muy por encima de lo esperable para un ZIP de binarios y librerías CUDA; conviene revisar el contenido antes de descargarlo.

## Comparativa con modelos similares

| Alternativa | Tipo | Compatibilidad | Licencia | Disponibilidad |
|---|---|---|---|---|
| JiRack-runtime (este repo) | Build de llama.cpp para sm_120 | Solo Blackwell | llama.cpp MIT + CUDA NVIDIA; repo sin licencia declarada | Hugging Face, 0 descargas |
| llama.cpp oficial (releases) | Builds oficiales de llama.cpp | Varias arquitecturas según release | MIT | GitHub |
| Ollama | Runtime con gestión de modelos | Amplio soporte de GPU | MIT | ollama.com |
| vLLM | Servidor de inferencia de alto rendimiento | CUDA en Ampere/Hopper/Blackwell según versión | Apache 2.0 | PyPI / GitHub |

## Limitaciones y advertencias

- No es un modelo: no contiene pesos ni tokenizador; no se puede evaluar en tareas de NLP por sí mismo.
- Compatibilidad restringida a GPUs NVIDIA Blackwell (sm_120); en otras arquitecturas el binario no arrancará o fallará al cargar kernels.
- Licencia del repositorio no declarada: la reutilización del paquete completo queda en un limbo legal, aunque sus componentes (llama.cpp MIT, CUDA de NVIDIA) sí tienen licencia explícita. Verificar la licencia CUDA antes de redistribuir.
- Tamaño del repositorio (13,2 GB) desproporcionado respecto a lo descrito en la model card; posible contenido adicional no documentado.
- Sin descargas ni likes, sin pipeline declarado y sin idiomas declarados: señal de proyecto incipiente y sin validación comunitaria.
- El commit c6a0ff11a fija el comportamiento a una revisión concreta; no recibirá correcciones de seguridad o rendimiento de versiones posteriores salvo que el autor regenere el paquete.
- Sin garantías de soporte ni mantenimiento por parte del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/CMSManhattan/JiRack-runtime
- Proyecto llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit referenciado (c6a0ff11a): https://github.com/ggml-org/llama.cpp/commit/c6a0ff11a
- Licencia CUDA de NVIDIA: https://docs.nvidia.com/cuda/eula/index.html
