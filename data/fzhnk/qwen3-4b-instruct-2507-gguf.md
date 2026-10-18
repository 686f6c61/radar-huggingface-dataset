# fzhnk/qwen3-4b-instruct-2507-gguf

## Resumen

Este repositorio no es un modelo nuevo, sino un espejo de un único archivo GGUF: `qwen3-4b-instruct-2507-q4_K_M.gguf`, una cuantización Q4_K_M de Qwen3-4B-Instruct-2507, el modelo denso de 4.022.468.096 parámetros desarrollado por el equipo Qwen (Alibaba). El autor, `fzhnk`, lo publica como dependencia de la aplicación de escritorio interview-bro, que lo descarga en el primer arranque y verifica su integridad mediante SHA-256 antes de usarlo. Los bytes son exactamente los del modelo `qwen3:4b-instruct-2507-q4_K_M` de la librería de Ollama, sin modificaciones, y el archivo pesa 2.497.280.480 bytes (unos 2,5 GB).

La relevancia práctica es doble. Por un lado, ofrece una ruta de despliegue local reproducible y verificable de un modelo de 4B con licencia Apache 2.0, pensado para ejecutarse con `llama-server` de llama.cpp en hardware modesto. Por otro lado, al ser un espejo de un artefacto concreto y con hash publicado, sirve como referencia fija para mediciones y benchmarks de aplicaciones que necesitan que el archivo no cambie entre ejecuciones.

Conviene subrayar que el repositorio contiene solo ese archivo: no incluye tokenizador, plantillas de chat ni configuración adicional, y no está mantenido por el equipo Qwen. La ficha del modelo base es la fuente autoritativa para arquitectura, contexto y datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), con atención multi-cabeza con consultas agrupadas (GQA), RoPE, SwiGLU y RMSNorm |
| Parametros totales | 4.022.468.096 (~4,02 B), dato real de safetensors del modelo base |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 262.144 tokens según la ficha del modelo base Qwen3-4B-Instruct-2507; no indicado en el repositorio del espejo |
| Tipos de cuantizacion | Este repositorio contiene unicamente Q4_K_M (GGUF); el modelo base se distribuye en safetensors BF16 |
| Idiomas soportados | No disponible en los metadatos del repositorio; la ficha del modelo base declara soporte multilingue, sin detalle de lista de idiomas |
| Licencia | Apache 2.0 (archivo `LICENSE` sin cambios respecto al original) |
| Formato de pesos | GGUF, archivo unico `qwen3-4b-instruct-2507-q4_K_M.gguf` de 2.497.280.480 bytes; el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only denso de la familia Qwen3, con 36 capas, dimensión oculta de 2560, 32 cabezas de atención y 8 cabezas de clave/valor (GQA), `head_dim` de 128 y vocabuario de 151.936 tokens con embeddings atados. Esa configuración cuadra con los 4.022.468.096 parámetros reportados: aproximadamente 944 M en bloques de atención, 2,69 B en las MLP y 389 M en los embeddings compartidos. Al ser denso, todos los parámetros se activan en cada token, a diferencia de las variantes MoE de la misma familia.

La variante `Instruct-2507` corresponde a la versión de julio de 2025 del ajuste instruccional, orientada a modo de respuesta directa (sin bloque de razonamiento ` thinking`) y con mejoras en seguimiento de instrucciones, conocimiento general y cobertura multilingue respecto a la iteración anterior. Sobre el proceso exacto de entrenamiento (número de tokens, composición del corpus, uso de RLHF o DPO) no hay información en los materiales proporcionados para esta ficha, por lo que se marca como no disponible. La contribución de este repositorio es exclusivamente la cuantización Q4_K_M: no hay reentrenamiento, fine-tuning ni modificación de pesos, solo la conversión a GGUF de 4 bits con escala K-quant mixta.

## Capacidades

- Generación de texto conversacional multi-turno, con formato de chat instruccional (la plantilla de chat debe aportarla el motor de inferencia, ya que el repositorio no la incluye).
- Razonamiento y respuesta directa en modo no-thinking: la variante 2507 no emite bloques de razonamiento explícitos, lo que reduce latencia y longitud de salida.
- Generación de código y tareas de edición de texto técnico, dentro de lo esperable en un modelo de 4B.
- Resolución de problemas matemáticos de complejidad media, con menor fiabilidad en problemas de varios pasos.
- Soporte multilingue declarado en el modelo base, sin lista cerrada de idiomas en los metadatos de este espejo.
- Integración con `llama-server`: expone una API compatible con el esquema de OpenAI (`/v1/chat/completions`), lo que habilita el uso de clientes y orquestadores existentes.
- Capacidad de ejecución totalmente local y offline, sin dependencia de servicios externos.
- Soporte de tool calling / function calling: no confirmado en la información disponible para esta cuantización; debe validarse con el motor y la plantilla concretos.
- Capacidades de visión o audio: no disponibles; el modelo es solo de texto.
- Verificación de integridad mediante SHA-256 publicado, útil para pipelines que requieren artefactos inmutables.

## Casos de uso

- Asistente de escritorio embebido: es el uso original del espejo. La aplicación interview-bro descarga el GGUF en el primer arranque y lo carga con `llama-server`; con 2,5 GB en disco y unos 3-4 GB de VRAM en contexto corto, cabe en portátiles con GPU integrada o en CPU.
- Generación de texto en local sin conexión: entornos con requisitos de privacidad (sanidad, legal, administración) donde el texto no puede salir del equipo; el modelo procesa la conversación íntegramente en local.
- Prototipado rápido de aplicaciones de chat: al ser un archivo único compatible con llama.cpp y Ollama, permite tener un endpoint compatible con OpenAI en minutos, sin descargar safetensors de 8 GB.
- Procesamiento de documentos largos: con la ventana de 262.144 tokens del modelo base, se pueden resumir o extraer datos de contratos, actas o transcripciones extensas en una sola pasada, siempre que la VRAM permita el KV cache necesario.
- Generación asistida de código en editors locales: autocompletado y explicación de fragmentos con latencia baja, integrable mediante la API HTTP de `llama-server` en plugins de VS Code o Neovim.
- Clasificación y extracción de información estructurada: convertir correos o incidencias en JSON con campos fijos, usando decodificación restringida por gramática de llama.cpp para garantizar el formato de salida.
- Base para evaluación comparativa de cuantizaciones: al estar fijado el hash del archivo, sirve como referencia reproducible para medir la degradación de Q4_K_M frente a BF16 en tareas concretas.
- Filtrado y moderación previa en pipelines: una primera pasada local y barata que descarte o marque contenido antes de enviarlo a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio del espejo no incluye mediciones propias ni reproduce las cifras del modelo base. Cualquier comparación numérica con Qwen3-4B-Instruct-2507 en BF16 exigiría ejecutar la misma batería (MMLU, HumanEval, GSM8K) sobre este archivo Q4_K_M, ya que la cuantización de 4 bits introduce una degradación que no está cuantificada en los materiales disponibles.

## Requisitos de hardware

- VRAM para inferencia: el archivo de pesos ocupa 2,5 GB; con overhead de contexto y buffers de llama.cpp se estiman 3,5-4 GB para ventanas de 4K-8K tokens.
- KV cache: atendiendo a la arquitectura del modelo base (36 capas, 8 cabezas KV, `head_dim` 128), el cache en FP16 ronda los 144 KiB por token, es decir, unos 4,8 GB a 32.768 tokens y unos 38 GB a la ventana completa de 262.144 tokens. Es una estimación orientativa; usar cache cuantizado (Q8_0) en llama.cpp reduce el consumo aproximadamente a la mitad y permite ventanas largas en GPU de 24 GB.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, GTX 1660 6 GB y RX 6600 8 GB para contexto corto; también funciona en Apple Silicon con Metal (M1 8 GB en adelante, con contexto moderado).
- CPU: viable en x86-64 con AVX2 y 8 GB de RAM o más, con velocidades del orden de pocos tokens por segundo; en ARM (Apple M-series, Snapdragon X) el rendimiento mejora con backends Metal o KleidiAI.
- Despliegue: `llama-server` de llama.cpp (el motor indicado por el autor), Ollama (los bytes coinciden con la capa `qwen3:4b-instruct-2507-q4_K_M` de su librería), LM Studio y `llama-cpp-python`. vLLM solo con soporte GGUF experimental; TGI no está pensado para este formato.
- Latencia y throughput: no hay cifras publicadas en la información disponible; depende del backend, del ancho de banda de memoria y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este repositorio (Qwen3-4B-Instruct-2507 Q4_K_M) | 4,02 B (denso) | 262.144 tokens segun modelo base | GGUF, 2,5 GB | Apache 2.0 | Espejo de un unico archivo, con SHA-256 publicado |
| Qwen3-4B-Instruct-2507 (original) | 4,02 B (denso) | 262.144 tokens | safetensors BF16, ~8 GB | Apache 2.0 | Fuente autoritativa, mantenida por el equipo Qwen; sin perdida por cuantizacion |
| Llama 3.2 3B Instruct | 3,2 B (denso) | 131.072 tokens | safetensors, GGUF | Licencia comunitaria Llama 3.2 | Menor tamano y contexto; licencia con restricciones adicionales para uso comercial a gran escala |
| Gemma 3 4B Instruct | ~4 B (denso) | 131.072 tokens | safetensors, GGUF | Terminos de uso de Gemma | Contexto menor; licencia propia con obligaciones de uso aceptable |
| Phi-4-mini-instruct | ~3,8 B (denso) | 131.072 tokens | safetensors, GGUF | MIT | Alternativa permisiva con contexto menor |

Las cifras de los modelos comparados provienen de sus fichas publicas y no se han verificado en esta busqueda; el rendimiento relativo en tareas concretas no esta disponible y requeriria una evaluacion propia.

## Limitaciones y advertencias

- No es un modelo original: es un espejo de un archivo de terceros. No hay garantia de mantenimiento, actualizaciones ni soporte por parte del equipo Qwen.
- El repositorio contiene un unico archivo GGUF sin tokenizador, plantilla de chat ni `config.json`; el motor de inferencia debe aportar la plantilla correcta o la calidad conversacional se degradará.
- La cuantización Q4_K_M introduce pérdida de precisión frente a BF16, especialmente visible en matemáticas de varios pasos, código con APIs poco frecuentes y tareas de recuperación exacta de datos.
- Riesgo de alucinación inherente a un modelo de 4B: puede inventar referencias, cifras o APIs con fluidez. No debe usarse como fuente de verdad sin verificación.
- Ventana de contexto larga en teoria, pero el KV cache a 262.144 tokens requiere decenas de GB y hace inviable la ventana completa en hardware consumer sin cache cuantizado y técnicas de compresión.
- Sesgos: no hay información sobre la composición del corpus de entrenamiento ni sobre evaluaciones de sesgo en los materiales disponibles.
- Idiomas: la cobertura real por idioma no está documentada en este repositorio; el rendimiento en castellano no está verificado.
- Sin historial de uso: 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe validación comunitaria del archivo.
- Recomendación operativa: verificar el SHA-256 `85e4a5b7b8ef0e48af0e8658f5aaab9c2324c76c1641493f4d1e25fce54b18b9` antes de cargar el archivo, tal como hace la aplicación de origen.
- Licencia Apache 2.0: permite uso comercial y modificaciones, con obligación de conservar el aviso de licencia y el archivo `LICENSE`, y de indicar cambios si se redistribuye.

## Enlaces

- Repositorio del espejo en HuggingFace: https://huggingface.co/fzhnk/qwen3-4b-instruct-2507-gguf
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo de la librería de Ollama del que proceden los bytes: `qwen3:4b-instruct-2507-q4_K_M` (capa `sha256:85e4a5b7…`), referenciado en la model card del espejo
- Paper, blog, repositorio de código o demo adicionales: no disponibles en la información proporcionada
