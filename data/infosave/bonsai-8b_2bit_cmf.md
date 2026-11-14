# infosave/Bonsai-8B_2bit_cmf

## Resumen

Bonsai-8B_2bit_cmf es una conversión del modelo de lenguaje Bonsai-8B (desarrollado por prism-ml) al formato CMF (Cortiq Model Format) con codificación ternaria q1t, que combina representaciones de 1 y 2 bits por peso. El resultado es un único fichero de 2,32 GB que puede mapearse directamente en memoria (mmap) y ejecutarse con el runtime en Rust `cortiq`, sin dependencias de Python, PyTorch ni toolchain de C++. El autor de la conversión es el usuario infosave, responsable también del formato CMF y del motor de inferencia.

El modelo base es un transformer de 8.000 millones de parámetros entrenado específicamente para representaciones de baja precisión extrema, lo que convierte la cuantización q1t en su representación nativa: según la model card, la generación es idéntica token a token a la del modelo almacenado a mayor precisión. Esto elimina la degradación típica de las cuantizaciones agresivas y permite desplegar un modelo de 8B en hardware muy modesto, incluidos portátiles Apple Silicon o GPUs de consumo.

La relevancia actual reside en la combinación de tamaño reducido (2,32 GB), licencia Apache-2.0, contexto de 4096 posiciones y un rendimiento medido de 140 tok/s en una RTX A5000 con CUDA y ~20 tok/s en un MacBook con Metal. Es una opción interesante para inferencia en el borde, aplicaciones de escritorio y despliegues donde el coste de memoria y la portabilidad del runtime son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Bonsai-8B); runtime CMF con backend CPU, Metal, CUDA y Vulkan |
| Parametros totales | 8.000 millones (aproximado, según nombre del modelo base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 4096 posiciones |
| Tipos de cuantizacion | q1t (ternario 1-bit/2-bit, nativo del modelo); el formato CMF soporta además q8, q4 y vbit |
| Idiomas soportados | no disponible (la model card muestra ejemplos en ruso, pero no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | CMF (Cortiq Model Format), fichero único de 2,32 GB; no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo base Bonsai-8B es un transformer de 8.000 millones de parámetros entrenado por prism-ml con el objetivo explícito de soportar representaciones de muy baja precisión. La model card de esta conversión afirma que, al haber sido entrenado para sparsity y baja precisión extremas, la codificación q1t constituye su representación nativa y la salida greedy coincide token a token con la del modelo a mayor precisión. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación principal de esta ficha no está en el modelo base sino en el contenedor y el runtime. CMF empaqueta pesos, tokenizador y plantilla de chat en un solo fichero con verificación de integridad, carga perezosa por páginas mediante mmap (la RAM residente se aproxima al tamaño del fichero) y cuantización por tensor. El runtime incluye una opción de atención O(1) (`--o1`) que convierte la atención en un operador de streaming con memoria constante sin reentrenamiento y con pesos byte-idénticos, y un sistema de "skills" que permite empaquetar varios especialistas que comparten modelo base con autoenrutamiento. Los backends disponibles son CPU, Metal (grafo whole-token), CUDA y Vulkan.

## Capacidades

- Generación de texto en modo chat (la plantilla va incluida en el fichero) y en modo completación cruda (`--raw --greedy`).
- Inferencia determinista en modo greedy, idéntica entre backends CPU y CUDA según la model card.
- Servidor compatible con la API de OpenAI (`cortiq serve`), con dashboard web incluido, lo que permite usar SDKs y clientes existentes sin cambios.
- Ejecución en dispositivo mediante la app móvil Flutter `cmfmobile`, que ejecuta ficheros CMF en el teléfono.
- Atención con memoria constante mediante la opción `--o1` para contextos largos sin crecimiento de RAM.
- Soporte de "skills": múltiples especialistas en un mismo fichero compartiendo modelo base, con enrutamiento automático.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Inferencia en portátiles Apple Silicon: con `CMF_GPU=1` el modelo decodifica a ~20,2 tok/s en un MacBook M-series y mantiene la RAM cerca del tamaño del fichero (2,32 GB) gracias al mmap, lo que permite trabajar con un modelo de 8B en equipos de 8-16 GB de RAM.
- Asistentes de escritorio offline: al ser un único fichero con tokenizador y plantilla de chat y no requerir Python ni CUDA, se puede distribuir como recurso de una aplicación de escritorio y ejecutar sin instalación de dependencias pesadas.
- Servicio interno compatible con OpenAI: `cortiq serve` expone `/v1/chat/completions`, de modo que aplicaciones existentes que ya usan la API de OpenAI pueden apuntar al servidor local sin modificar el código cliente.
- Procesamiento por lotes en GPU de gama media: en una RTX A5000 el prefill de un prompt de 3072 tokens alcanza ~2971 tok/s (primer token en 1,03 s) y la decodificación posterior se mantiene en ~121 tok/s, adecuado para pipelines de resumen o clasificación sobre documentos de hasta el límite de contexto.
- Aplicaciones móviles on-device: mediante `cmfmobile` (Flutter), el fichero CMF de 2,32 GB puede ejecutarse en el propio dispositivo para tareas de texto sin enviar datos a la nube, útil en escenarios de privacidad.
- Despliegue en entornos sin toolchain de compilación: al existir binarios precompilados para macOS arm64/x86_64, Linux y Windows, se puede integrar en imágenes de contenedor mínimas o en sistemas donde instalar CUDA o PyTorch no es viable.
- Enrutamiento entre especialistas: con el sistema de skills, un único fichero puede contener varios especialistas que comparten el modelo base y autoenrutar la petición, reduciendo el número de artefactos a desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos publicados son de rendimiento de inferencia:

| Escenario | Modo | Rendimiento |
|---|---|---|
| Apple M-series MacBook | decode, `CMF_GPU=1` (Metal whole-token) | ~20,2 tok/s |
| Apple M-series MacBook | decode, solo CPU | ~4,2 tok/s |
| RTX A5000 24 GB, CUDA 12.x, cortiq 0.8.96 | decode (64 tokens, `--ignore-eos`) | 140,4–141,1 tok/s |
| RTX A5000 24 GB, CUDA | prompt de 3072 tokens | 2971 tok/s (primer token 1,03 s) |
| RTX A5000 24 GB, CUDA | decode tras prompt de 3072 tokens | 121,1 tok/s |
| RTX A5000 24 GB, Vulkan | decode | 8,3 tok/s |
| RTX A5000 24 GB, Vulkan | prompt de 3072 tokens | 36 tok/s (primer token 75 s) |
| Cualquier backend | memoria residente | ≈ tamaño del fichero (mmap) |

## Requisitos de hardware

- VRAM/RAM: al usar mmap, la memoria residente se aproxima al tamaño del fichero (2,32 GB), más overhead del runtime y de la caché KV para el contexto activo. No se especifica en la información disponible el consumo exacto de la caché KV para las 4096 posiciones.
- GPU recomendadas: RTX A5000 24 GB verificada con backend CUDA a 140 tok/s; Apple Silicon con Metal a ~20 tok/s. No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: el modelo cabe holgadamente en cualquier GPU con 4 GB o más de VRAM; el límite práctico lo marca el backend (CUDA o Vulkan) y no el tamaño de los pesos.
- Despliegue: runtime `cortiq` (binarios precompilados para macOS arm64/x86_64, Linux y Windows, o `cargo install cortiq-cli` con feature `cuda` para NVIDIA). No se soportan en este repositorio vLLM, llama.cpp, Ollama ni TGI, ya que el formato es CMF propietario del runtime.
- Latencia y throughput: ver tabla de benchmarks. El backend Vulkan es notablemente más lento que CUDA en la misma GPU (8,3 tok/s frente a 140 tok/s en decode), por lo que conviene usar CUDA cuando haya GPU NVIDIA disponible.
- Móvil: ejecutable mediante la app Flutter `cmfmobile`, sin cifras de rendimiento publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bonsai-8B_2bit_cmf (esta ficha) | ~8B | 4096 | CMF, runtime cortiq (Rust) | Apache-2.0 | Hugging Face, binarios precompilados |
| prism-ml/Bonsai-8B (modelo base) | ~8B | no disponible | Pesos originales (safetensors presumiblemente) | Apache-2.0 | Hugging Face |
| Alternativas de 8B cuantizadas a 2-4 bits en GGUF | ~8B | variable según modelo | GGUF, llama.cpp/Ollama | según modelo base | amplia |

No se dispone en la información proporcionada de datos de benchmarks que permitan comparar la calidad de Bonsai-8B frente a otros modelos de 8B, ni de cifras de rendimiento de las alternativas en el mismo hardware. La comparación relevante es de formato y despliegue: frente a GGUF, CMF ofrece fichero único con tokenizador y plantilla incluidos, mmap-first y backends Metal/CUDA/Vulkan en un runtime Rust sin dependencias, a cambio de un ecosistema mucho más reducido y sin soporte en las herramientas estándar (llama.cpp, Ollama, vLLM).

## Limitaciones y advertencias

- No se han publicado evaluaciones de calidad (benchmarks, evaluaciones de sesgo o de alucinación) en la información disponible; la afirmación de equivalencia token a token con el modelo a mayor precisión procede de la model card del autor y no se ha verificado de forma independiente.
- Contexto limitado a 4096 posiciones, insuficiente para casos de uso que requieran documentos largos o conversaciones muy extensas.
- No se declara la lista de idiomas soportados; los ejemplos de la model card están en ruso, pero no hay garantía documentada de calidad multilingüe.
- El formato CMF es propietario y solo lo soporta el runtime `cortiq`; no es compatible con llama.cpp, Ollama, vLLM, TGI ni transformers, lo que limita la integración con herramientas y pipelines existentes.
- El backend Vulkan rinde muy por debajo de CUDA en la misma GPU (8,3 frente a 140 tok/s en decode), por lo que en GPUs sin CUDA la latencia puede ser problemática.
- El repositorio tiene muy poca tracción comunitaria (1 like, ~1025 descargas), lo que reduce la probabilidad de que los problemas se detecten y corrijan rápidamente.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones del modelo base prism-ml/Bonsai-8B antes de un uso comercial, así como las del runtime `cortiq` (repositorio separado).
- No hay información sobre sesgos conocidos, datos de entrenamiento ni filtros de seguridad del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/Bonsai-8B_2bit_cmf
- Modelo base: https://huggingface.co/prism-ml/Bonsai-8B
- Repositorio del formato y motor CMF: https://github.com/infosave2007/cmf
- Guía de skills: https://github.com/infosave2007/cmf/blob/master/docs/SKILLS.md
- App móvil Flutter: https://github.com/infosave2007/cmfmobile
- Binarios precompilados: https://github.com/infosave2007/cmf/releases/latest
