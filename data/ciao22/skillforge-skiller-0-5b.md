# Ciao22/skillforge-skiller-0.5B

## Resumen

skillforge-skiller-0.5B es un ajuste fino por LoRA del modelo Qwen2.5-0.5B-Instruct, desarrollado por el usuario Ciao22 para actuar como asistente local en la aplicación skillforge.cc.cd/skiller. El modelo cumple una doble función: mantener conversaciones multi-turno y transformar material en bruto en documentos de "skill" completos y ejecutables, que la aplicación valida antes de aceptarlos. Su relevancia radica en que está empaquetado en dos formatos cuantizados que se ejecutan íntegramente en el navegador, sin servidor: MLC `q4f16_1` para WebGPU mediante WebLLM y GGUF `Q4_K_M` para CPU mediante wllama (llama.cpp compilado a WebAssembly).

Arquitectónicamente no introduce cambios respecto al modelo base: se trata de un transformer denso de 494.032.768 parámetros (aproximadamente 0,5 mil millones), con la misma estructura que Qwen2.5-0.5B-Instruct, de modo que los kernels precompilados de MLC ejecutan estos pesos sin modificaciones. El ajuste se realizó sobre un conjunto mixto de 54 turnos de conversación bajo el prompt de chat y 12 pares (material → skill) bajo el prompt del generador, con la pérdida calculada únicamente sobre los turnos del asistente.

El modelo está pensado como opción gratuita, privada y on-device, no como sustituto de un modelo frontera. Su tamaño reducido y su entrenamiento sobre un conjunto pequeño y escrito a mano lo hacen adecuado para skills cortos y bien delimitados y para conversación cotidiana, con un rendimiento notablemente inferior en documentos largos o sutiles. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), sin cambios respecto al modelo base |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens en la configuración WebGPU (`context_window_size: 4096`); 2048 tokens en el ejemplo de carga con wllama (`n_ctx: 2048`) |
| Tipos de cuantizacion | MLC `q4f16_1` (WebGPU); GGUF `Q4_K_M` con embeddings y capa de salida en `q4_0` (CPU) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC (`params_shard_0..7.bin`, `mlc-chat-config.json`, `tensor-cache.json`, `ndarray-cache.json`) y GGUF (4 shards en `gguf/`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-0.5B-Instruct, un transformer denso decoder-only de 494 millones de parámetros. El ajuste fino emplea LoRA con rango r=16 sobre un conjunto de datos mixto: 54 turnos de chat bajo el prompt de conversación y los 12 pares (material → skill) del producto bajo el prompt del generador. Cada ejemplo se presenta como una lista `messages` y la pérdida se calcula solo sobre los turnos del asistente, de forma que el modelo aprende tanto a conversar como a producir la estructura de documento que la aplicación valida.

Una revisión anterior se había entrenado únicamente con los pares (material → skill) bajo el prompt del generador, lo que impedía la conversación: un saludo devolvía un fragmento de definición porque el modelo nunca había visto un diálogo. El conjunto mixto corrige ese comportamiento sin perder la tarea de generación. La arquitectura permanece idéntica a la del base, lo que permite reutilizar los kernels WebGPU precompilados (`Qwen2-0.5B-Instruct-q4f16_1_cs1k-webgpu.wasm`). El pipeline de entrenamiento es reproducible y solo requiere CPU; los scripts (`build_mixed.py`, `train_mixed.py`, `mlc_export.py`) están publicados en el repositorio skiller-training. El exportador MLC reimplementa el cuantizador sin TVM y es byte-idéntico al conversor oficial de MLC. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Generación de documentos de "skill" estructurados y ejecutables a partir de material en bruto, con el formato que valida la aplicación skillforge.
- Conversación cotidiana y respuestas breves y bien delimitadas.
- Ejecución on-device en navegador: WebGPU vía WebLLM y CPU vía wllama (WebAssembly).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Asistente conversacional embebido en aplicaciones web: el modelo gestiona diálogos multi-turno con una ventana de 4096 tokens en WebGPU, suficiente para conversaciones de soporte o guía dentro de la propia página, sin enviar datos a un servidor.
- Generación de skills a partir de material del usuario: el modelo recibe texto en bruto y devuelve un documento de skill completo con la estructura que la aplicación valida, lo que permite crear contenido reutilizable de forma local y privada.
- Procesamiento de datos sensibles en el cliente: al ejecutarse íntegramente en el dispositivo, es adecuado para material que no puede salir del navegador del usuario (notas personales, documentación interna, borradores).
- Modo degradado sin GPU: la variante GGUF `Q4_K_M` de aproximadamente 330 MB permite ofrecer la funcionalidad en equipos sin GPU mediante wllama, con un rendimiento medido de unas 53 tokens/s en una máquina de CPU pura.
- Prototipado de aplicaciones WebLLM: sirve como ejemplo funcional de integración de un modelo ajustado con WebLLM y wllama, incluyendo configuración de `appConfig`, `model_lib` y carga de shards GGUF encadenados.
- Educación y demostraciones offline: al no requerir servidor ni conexión tras la descarga inicial, es útil para talleres o demos en entornos con conectividad limitada.
- Filtrado y estructuración de notas breves: para tareas de extracción o reformateo de fragmentos cortos donde la latencia local y la privacidad priman sobre la profundidad del razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato de rendimiento medido que aporta la model card es el throughput de la variante GGUF en CPU: aproximadamente 53 tokens/s en una máquina de CPU pura. No se documentan cifras de latencia ni de throughput para la variante WebGPU.

## Requisitos de hardware

- VRAM estimada para WebGPU: 944,62 MB según la configuración de WebLLM (`vram_required_MB`), con `low_resource_required: true`.
- Tamaño de la variante MLC `q4f16_1`: 8 shards, 277.996.288 bytes, 267 tensores.
- Tamaño de la variante GGUF `Q4_K_M`: 4 shards, 329.740.704 bytes en total (unos 330 MB).
- GPU recomendadas: no se especifican modelos concretos; se requiere un navegador con soporte de WebGPU. La variante CPU está pensada para equipos sin GPU.
- Cabe en GPUs de consumo: el requisito de VRAM inferior a 1 GB sugiere que sí, aunque la model card no enumera modelos concretos (RTX 4090, etc. no se mencionan).
- Opciones de despliegue: WebLLM (WebGPU) y wllama (llama.cpp compilado a WebAssembly) en el navegador. El repositorio incluye también pesos GGUF compatibles con llama.cpp.
- Latencia y throughput: aproximadamente 53 tokens/s en CPU pura para la variante GGUF; no disponible para WebGPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| skillforge-skiller-0.5B | 494 M | 4096 (WebGPU) / 2048 (ejemplo CPU) | Apache 2.0 | MLC q4f16_1, GGUF Q4_K_M; WebLLM y wllama | Ajuste LoRA para chat y generación de skills; solo inglés |
| Qwen/Qwen2.5-0.5B-Instruct | 494 M | no disponible en la información proporcionada | Apache 2.0 | safetensors y múltiples cuantizaciones | Modelo base sin ajuste; no especializado en generación de skills |
| mlc-ai/Qwen2.5-0.5B-Instruct-q4f16_1-MLC | 494 M | no disponible en la información proporcionada | Apache 2.0 | MLC q4f16_1 | Build oficial de MLC del modelo base; el exportador del autor lo reproduce byte a byte |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre sí.

## Limitaciones y advertencias

- Entrenado sobre un conjunto muy pequeño y escrito a mano (54 turnos de chat y 12 pares material → skill), lo que limita la generalización a dominios y formatos no vistos.
- Modelo de 0,5 mil millones de parámetros: adecuado para skills cortos y bien delimitados y chat cotidiano, pero más débil que un modelo alojado grande en documentos largos o sutiles.
- Riesgo de alucinación inherente a un modelo de este tamaño, especialmente en la generación de documentos de skill con contenido factual.
- Solo soporta inglés; no se documenta capacidad multilingüe.
- La ventana de contexto efectiva depende de la configuración de carga: 4096 tokens en el ejemplo WebGPU y 2048 en el ejemplo wllama.
- La ruta CPU es más lenta que la WebGPU y está pensada para dispositivos sin GPU.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero no se documentan garantías ni soporte por parte del autor.
- El modelo está diseñado como opción local y privada, no como sustituto de un modelo frontera en producción de alta exigencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ciao22/skillforge-skiller-0.5B
- Aplicación skillforge/skiller: https://skillforge.cc.cd/skiller
- WebLLM: https://github.com/mlc-ai/web-llm
- wllama: https://github.com/ngxson/wllama
- Scripts de entrenamiento (skiller-training): https://github.com/ciao22king/redesigned-funicular/tree/cloudflare-workers/skiller-training
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
