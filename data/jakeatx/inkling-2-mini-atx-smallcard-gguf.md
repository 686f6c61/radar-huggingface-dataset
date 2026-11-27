# jakeatx/Inkling-2-Mini-ATX-SmallCard-GGUF

## Resumen

Inkling 2 Mini ATX SmallCard GGUF es una cuantización del modelo base `thinkingmachines/Inkling-2-Mini`, publicada por el usuario jakeatx, orientada específicamente a tarjetas gráficas de gama consumer con 8, 10 o 12 GB de VRAM (familia RTX 30-series Ampere). El modelo base es un transformer de tipo Mixture of Experts (MoE) con 26.070.389.248 parámetros totales y capacidad multimodal image-text-to-text, según los metadatos del repositorio.

La particularidad de esta publicación es que no funciona con llama.cpp estándar: requiere un fork denominado **llamAmpere** (v0.7.4.1 o superior), que implementa una estrategia de offload en la que los expertos del MoE residen en RAM del sistema y se mantiene una caché de expertos en VRAM cuyo tamaño se ajusta automáticamente al espacio libre de la tarjeta. La caché KV se almacena en formato de 4 bits (K 4-bit, V 4-bit).

El interés de esta ficha radica en que demuestra una vía práctica para ejecutar un MoE de 26B parámetros con contexto de hasta 262.144 tokens en GPUs de 8-12 GB, algo que con cuantizaciones convencionales de llama.cpp resultaría inviable. La licencia es Apache 2.0, lo que facilita el uso comercial, aunque las dependencias de software (llamAmpere) son un factor a evaluar en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), según tags del repo; detalles internos no disponibles |
| Parámetros totales | 26.070.389.248 (26,07 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (212.992 en preset de 8 GB) |
| Tipos de cuantización | 3.7 bpw (fichero 8/10 GB) y 4.2 bpw (fichero 12 GB); KV cache en 4-bit (K y V) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (requiere llamAmpere, no compatible con llama.cpp estándar) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini, desarrollado por Thinking Machines, es un transformer con arquitectura Mixture of Experts de 26,07 mil millones de parámetros totales, según los metadatos de safetensors del repositorio. La model card de esta cuantización no detalla el número de parámetros activos por token, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se especifica si incorpora innovaciones como decodificación especulativa (la model card menciona un "drafter" desactivado en las pruebas de velocidad, lo que sugiere que el runtime soporta decodificación especulativa, aunque no se detalla el modelo drafter).

La innovación técnica destacable de esta publicación no está en el modelo sino en el runtime: **llamAmpere** implementa un esquema de offload de expertos MoE a RAM del sistema con caché dinámica en VRAM, ajustada automáticamente al espacio libre tras reservar el contexto y el KV cache. El KV cache usa un formato de 4 bits para K y V, lo que permite sostener contextos de 262.144 tokens en tarjetas de 12 GB. La cuantización se realizó con un objetivo de bits por peso (3.7 o 4.2 bpw) y se validó mediante divergencia KL contra la referencia en precisión completa sobre 16.200 tokens de chats de código, agentes y RAG, obteniendo valores de 0.011 y 0.0080 respectivamente.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag `conversational`.
- Entrada de imágenes (image-text-to-text): el servidor acepta partes `image_url` en `/v1/chat/completions` cuando se carga el proyector visual `mmproj-Inkling-2-Mini-F16.gguf` o `mmproj-Inkling-2-Mini-Q8_0.gguf`.
- Razonamiento y chats agénticos: la validación de calidad (KLD) se realizó sobre conversaciones de código, agentes y RAG, lo que indica que el modelo base está orientado a estos usos.
- Contexto largo: hasta 262.144 tokens (212.992 en el preset de 8 GB), adecuado para documentos extensos y conversaciones prolongadas.
- Compatibilidad con API OpenAI: el servidor `llama-server` de llamAmpere expone endpoints compatibles con OpenAI (`/v1/chat/completions`), lo que facilita la integración con clientes existentes.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- **Asistente de código en estación de trabajo con GPU de 8-12 GB**: el modelo puede mantener conversaciones largas sobre repositorios completos gracias a su contexto de hasta 262.144 tokens, y la validación de calidad incluye chats de código, lo que respalda su uso para revisión, explicación y generación de parches en un entorno local sin depender de la nube.
- **RAG sobre documentación extensa en hardware consumer**: con 262.144 tokens de contexto y KV cache en 4 bits, es posible inyectar decenas de documentos recuperados en un solo prompt; el caso de RAG está explícitamente cubierto en la evaluación de KLD del autor.
- **Análisis de imágenes en local**: cargando el proyector `mmproj-Inkling-2-Mini-F16.gguf` (0,64 GB) o el `Q8_0` (0,35 GB), el servidor acepta imágenes junto con texto, útil para transcripción de capturas, descripción de diagramas o extracción de datos de documentos escaneados en un equipo sin GPU de gran capacidad.
- **Automatización agéntica de tareas multi-paso**: el modelo base está evaluado en chats agénticos y el runtime expone API compatible con OpenAI, lo que permite conectarlo a frameworks de agentes que envían historiales largos; la caché de expertos en VRAM mantiene un throughput aceptable (38-60 tok/s de decodificación según tarjeta).
- **Prototipado de chatbots de atención al cliente con contexto largo**: la ventana de 212.992-262.144 tokens permite arrastrar el historial completo de una conversación y el catálogo de productos sin truncar; el despliegue en una RTX 3060 de 12 GB o similar reduce costes frente a instancias cloud.
- **Investigación y experimentación con MoE en GPUs pequeñas**: este repositorio sirve como banco de pruebas para estudiar el comportamiento de un MoE de 26B con offload de expertos, comparando presets de 8, 10 y 12 GB y midiendo KLD y throughput en hardware asequible.
- **Despliegue de inferencia local con API compatible OpenAI en Windows o Linux**: el servidor `llama-server` escucha en `http://127.0.0.1:8080` y puede integrarse en pipelines internos que ya consumen la API de OpenAI, sustituyendo llamadas externas por inferencia local.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Sí incluye métricas de calidad de cuantización (divergencia KL) y de velocidad medidas en una RTX 3090 limitada a la VRAM de cada preset, PCIe 4.0 x16, drafter desactivado, con una respuesta de 5.120 tokens a temperatura 1 tras un prompt de 100K tokens, 6 semillas por build:

| Tarjeta | Fichero | Decode (tok/s) | Prefill (tok/s) |
|---|---|---:|---:|
| 12 GB | `Inkling-2-Mini-ATX-12GB-4.2bpw.gguf` | 60,0 | 638 |
| 10 GB | `Inkling-2-Mini-ATX-8GB-10GB-3.7bpw.gguf` | 58,0 | 403 |
| 8 GB | `Inkling-2-Mini-ATX-8GB-10GB-3.7bpw.gguf` | 38,8 | 404 |

Calidad de cuantización (KLD frente a referencia en precisión completa, 16.200 tokens evaluados, KV de 4 bits):

| Fichero | Tamaño | KLD media | Mismo token top-1 |
|---|---|---:|---:|
| `Inkling-2-Mini-ATX-8GB-10GB-3.7bpw.gguf` | 12,21 GB | 0,011 | 96,1% |
| `Inkling-2-Mini-ATX-12GB-4.2bpw.gguf` | 13,54 GB | 0,0080 | 96,5% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM**: 8, 10 o 12 GB según el preset (`--preset 8ink`, `10ink`, `12ink`). Los presets asumen un escritorio que consume ~1 GB de VRAM; en tarjetas headless se usa la variante `-headless` (por ejemplo `8ink-headless`) que reserva un margen de 500 MiB.
- **RAM del sistema**: al menos el tamaño del fichero (12,2 GB o 13,6 GB) libre por encima del uso del sistema operativo, porque los expertos se leen desde RAM. El mínimo de RAM no está validado por el autor.
- **GPU recomendadas**: RTX 30-series (Ampere) de 8, 10 o 12 GB; las pruebas se hicieron en una RTX 3090 limitada a la VRAM de cada preset. Para tarjetas de 24 GB existe el repositorio hermano `jakeatx/Inkling-2-Mini-ATX-GGUF`.
- **Cabe en GPU consumer**: sí, en RTX 3060 12 GB, RTX 3060 Ti / 3070 / 3070 Ti 8 GB, RTX 3080 10 GB, RTX 3080 Ti 12 GB y equivalentes, siempre que se use llamAmpere.
- **Opciones de despliegue**: exclusivamente llamAmpere v0.7.4.1 o superior (Linux y Windows); los ficheros no cargan en llama.cpp estándar. El servidor `llama-server` expone API compatible con OpenAI en `http://127.0.0.1:8080`. Para entrada de imágenes, añadir `--mmproj models/inkling/mmproj-Inkling-2-Mini-F16.gguf` (o el Q8_0); el proyector corre en CPU por defecto y `--mmproj-offload` lo mueve a GPU (consumiendo VRAM de la caché de expertos).
- **Latencia y throughput**: 38,8-60,0 tok/s de decodificación y 403-638 tok/s de prefill según tarjeta, medidos con la build v0.7.5 (la v0.7.4.1 es igual o hasta un 4% más lenta). El rendimiento depende del ancho de banda PCIe.
- **Ajuste automático**: si otros programas ocupan más VRAM de la esperada, el servidor reduce primero el contexto y lo notifica al arrancar; también se puede fijar manualmente con `-c` (por ejemplo `-c 131072`).

## Comparativa con modelos similares

No se dispone de datos de benchmarks estándar del modelo base ni de esta cuantización, por lo que la comparación se limita a parámetros, contexto y licencia frente a alternativas de la misma categoría (MoE de ~20-30B ejecutables en hardware consumer). Los datos de los modelos comparados no están en la información proporcionada y se marcan como no disponibles cuando no se conocen con certeza.

| Modelo | Parámetros totales | Contexto | Licencia | Formato / runtime | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini (esta cuantización) | 26,07 B (MoE) | 262.144 (212.992 en 8 GB) | Apache 2.0 | GGUF + llamAmpere | Hugging Face, 595 descargas |
| Inkling-2-Mini (base, full precision) | 26,07 B (MoE) | no disponible | Apache 2.0 | safetensors | Hugging Face (thinkingmachines/Inkling-2-Mini) |
| Inkling-2-Mini ATX GGUF (24 GB) | 26,07 B (MoE) | no disponible | Apache 2.0 | GGUF + llamAmpere | Hugging Face (jakeatx/Inkling-2-Mini-ATX-GGUF) |
| Otras alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Dependencia de un fork no estándar**: los ficheros no cargan en llama.cpp estándar; requieren llamAmpere v0.7.4.1 o superior. Esto limita la portabilidad, el soporte comunitario y la integración con herramientas que asumen llama.cpp upstream (Ollama, LM Studio, TGI, vLLM, etc. no están soportados según la información disponible).
- **Gestión manual de la VRAM**: si otras aplicaciones consumen VRAM, el servidor reduce el contexto automáticamente; en producción conviene monitorizar y fijar el contexto con `-c` para evitar degradaciones silenciosas.
- **Requisito de RAM del sistema**: los expertos se leen desde RAM, por lo que se necesita al menos el tamaño del fichero (12,2-13,6 GB) libre; el mínimo de RAM no está validado por el autor, lo que introduce incertidumbre en despliegues con poca memoria.
- **El fichero de 12 GB fue reemplazado en v0.7.4.1**: si se descargó la versión anterior, debe volverse a descargar para obtener la build más rápida y con menor KLD.
- **Idiomas no especificados**: la model card no documenta los idiomas soportados; no se puede asumir un rendimiento multilingüe equilibrado sin evaluación propia.
- **Riesgo de alucinación**: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinación en la información disponible; como en cualquier LLM, es esperable en ausencia de datos.
- **Sesgos**: no se documentan sesgos conocidos del modelo base ni de la cuantización; se desconoce la composición del dataset de entrenamiento.
- **Licencia**: Apache 2.0 permite uso comercial, pero la licencia del runtime llamAmpere no se detalla en la información proporcionada y debe verificarse por separado.
- **Calidad de cuantización**: la KLD de 0,011 (3.7 bpw) y 0,0080 (4.2 bpw) es baja pero no nula; en tareas sensibles a la precisión (código crítico, matemáticas exactas) conviene validar contra la versión full precision.
- **Proyector visual en CPU por defecto**: con imágenes, el proyector corre en CPU salvo que se use `--mmproj-offload`, lo que añade latencia en entrada visual; activarlo reduce la caché de expertos en VRAM.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/jakeatx/Inkling-2-Mini-ATX-SmallCard-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantización para tarjetas de 24 GB: https://huggingface.co/jakeatx/Inkling-2-Mini-ATX-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Runtime llamAmpere: no disponible en la información proporcionada (la model card lo menciona pero no enlaza repositorio)
- Paper del modelo base: no disponible
- Blog o demo: no disponible
