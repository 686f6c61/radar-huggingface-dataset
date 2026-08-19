# infosave/Qwen3.8-27B-cmf

## Resumen

El modelo `infosave/Qwen3.8-27B-cmf` es una conversión del checkpoint oficial `Qwen/Qwen3.8-27B` al formato CMF (Container for Memory-mapped Files), un contenedor de un solo archivo diseñado para ser ejecutado por `cortiq`, un binario escrito en Rust que no depende de ningún framework de machine learning. El autor, `infosave`, publica este repositorio con el objetivo de simplificar el despliegue de modelos grandes: un único archivo `.cmf` que se mapea en memoria y se ejecuta directamente sobre Vulkan, Metal o DX12, con soporte de CPU como respaldo.

El modelo base, Qwen3.8-27B, es un modelo híbrido de 27 mil millones de parámetros que combina 48 capas de atención lineal GatedDeltaNet con 16 capas de atención completa, alcanzando una ventana de contexto de 262 144 tokens e incorporando un modo de razonamiento (thinking). Esta conversión mantiene todas las capacidades del original, pero añade ventajas operativas: no requiere Python, no necesita instalar PyTorch ni Transformers, y ofrece velocidades de decodificación notables — 45,6 tokens por segundo en una RTX 5090 con la cuantización de 4 bits.

La relevancia de este modelo radica en su facilidad de despliegue en entornos de producción heterogéneos. Al usar Vulkan como capa de abstracción, el mismo archivo funciona en GPUs de NVIDIA, AMD, Intel y Apple Silicon, y el runtime permite particionar el modelo entre varias GPUs o incluso a través de la red. Esto lo convierte en una opción atractiva para equipos que buscan ejecutar un LLM de 27B sin la complejidad habitual de los stacks de inferencia basados en Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 capas GatedDeltaNet (atención lineal) + 16 capas de atención completa |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | q4t (4-bit tiled) y q8_2f (8-bit) |
| Idiomas soportados | Inglés, ruso, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (archivo `.cmf`, memory-mapped) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.8-27B es híbrida: combina 48 capas de atención lineal basadas en GatedDeltaNet con 16 capas de atención completa (full attention). Esta combinación reduce el coste computacional y de memoria frente a un transformer denso puro, manteniendo la capacidad de modelar dependencias de largo alcance gracias a las capas de atención completa. El modelo soporta un contexto de 262 144 tokens y un modo de razonamiento (thinking) que genera cadenas de pensamiento antes de responder.

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la documentación proporcionada. El repositorio `infosave/Qwen3.8-27B-cmf` se limita a convertir el checkpoint oficial al formato CMF, sin modificar los pesos. La innovación principal de este repositorio es el propio formato CMF y el runtime `cortiq`, que permite cargar el modelo mediante mapeo de memoria, ejecutarlo sin dependencias de frameworks ML y distribuirlo entre múltiples GPUs o nodos de red.

## Capacidades

- Generación de texto y razonamiento: el modelo hereda las capacidades de Qwen3.8-27B, incluyendo razonamiento multi-paso y modo thinking.
- Generación de código: el ejemplo incluido en el repositorio genera una escena Three.js completa a partir de una especificación en ruso, demostrando capacidad para producir código funcional.
- Servidor compatible con la API de OpenAI: `cortiq serve` expone los endpoints `/v1/chat/completions`, `/v1/completions` y `/v1/models`, lo que permite integrar el modelo con cualquier herramienta que hable con OpenAI.
- Compatibilidad con Ollama: mediante la opción `--ollama`, el servidor escucha en un puerto compatible con el protocolo de Ollama.
- Multilingüe: soporta inglés, ruso y chino según la declaración del repositorio.
- Inferencia multi-GPU y distribuida: soporta particionado de capas entre dos GPUs locales o a través de la red, así como modo réplica para throughput.
- Ejecución sin Python: el runtime es un binario Rust autocontenido, lo que elimina la necesidad de entornos Python y gestores de dependencias.

## Casos de uso

- Despliegue en producción sin dependencias de Python: en entornos donde no se desea instalar PyTorch, Transformers u otros frameworks, `cortiq` permite servir el modelo con un único binario y un archivo `.cmf`. Es adecuado para contenedores ligeros o sistemas embebidos con GPU.
- Inferencia en GPUs heterogéneas: gracias a Vulkan, el mismo archivo funciona en NVIDIA, AMD, Intel y Apple Silicon. Un equipo con GPUs variadas puede ejecutar el modelo sin recompilar ni adaptar el código.
- Generación de código asistida: el modelo puede generar fragmentos de código complejos (como el ejemplo de Three.js) a partir de especificaciones en lenguaje natural, útil en herramientas de desarrollo asistido.
- Servidor de chat compatible con OpenAI: al exponer la API de OpenAI, se puede conectar a frontends existentes (como Open WebUI, LibreChat u otros) sin modificaciones, usando `cortiq serve`.
- Razonamiento extendido con modo thinking: para tareas que requieren análisis profundo, como resolución de problemas matemáticos o planificación, el modo thinking genera cadenas de razonamiento antes de la respuesta final.
- Distribución de carga entre múltiples GPUs: con `--gpus 2` o el modo worker, se puede ejecutar el modelo en configuraciones multi-GPU para reducir la latencia o aumentar el throughput, especialmente útil en servidores con varias tarjetas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El repositorio solo proporciona mediciones de velocidad de decodificación en estado estacionario sobre Vulkan con relojes bloqueados, en una RTX 5090:

| Archivo | Bits | Tamaño | Decodificación (RTX 5090) |
|---|---|---|---|
| `qwen38-27b-q4t.cmf` | 4-bit tiled | 15,4 GB | 45,6 tok/s |
| `qwen38-27b-q8_2f.cmf` | 8-bit | 27,4 GB | 28,9 tok/s |

La familia está limitada por ancho de banda de memoria, por lo que la versión de 4 bits decodifica aproximadamente 1,6 veces más rápido que la de 8 bits.

## Requisitos de hardware

- VRAM estimada: la cuantización q4t ocupa 15,4 GB, por lo que cabe en una GPU de 24 GB dejando espacio para el contexto. La q8_2f ocupa 27,4 GB y requiere al menos 32 GB para residir completamente en memoria.
- GPUs recomendadas: cualquier GPU compatible con Vulkan, Metal o DX12. Las pruebas se realizaron en una RTX 5090, pero el runtime soporta NVIDIA, AMD, Intel y Apple Silicon.
- CPU fallback: si no se detecta GPU, `cortiq` puede ejecutarse en CPU, aunque con rendimiento significativamente menor.
- Opciones de despliegue: CLI (`cortiq run`), servidor con API OpenAI (`cortiq serve`), modo Ollama (`--ollama`), multi-GPU local (`--gpus 2`) y distribución en red (`cortiq worker` + `--peer`).
- Latencia y throughput: no se proporcionan datos de latencia por petición ni throughput en modo servidor. Las velocidades de decodificación indicadas son para un único stream en estado estacionario.

## Comparativa con modelos similares

La comparativa se realiza con el modelo base original y con alternativas de la misma categoría (modelos densos de ~27B). No se dispone de datos de rendimiento en benchmarks para esta conversión, por lo que la comparación se limita a características técnicas.

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262 144 | safetensors | Apache 2.0 | Checkpoint oficial, requiere Python y frameworks ML |
| infosave/Qwen3.8-27B-cmf | 27B | 262 144 | CMF | Apache 2.0 | Conversión al formato CMF, ejecutable con `cortiq` sin Python |
| Qwen2.5-27B (referencia) | 27B | 32 768 | safetensors | Apache 2.0 | Generación anterior, contexto menor, sin modo thinking |

La principal diferencia frente al original es el formato de pesos y el runtime: CMF elimina la dependencia de Python y permite ejecución en GPUs variadas vía Vulkan. Frente a Qwen2.5-27B, el modelo Qwen3.8-27B ofrece un contexto muy superior y arquitectura híbrida.

## Limitaciones y advertencias

- La cuantización (especialmente la de 4 bits) puede introducir degradación en la calidad de las respuestas frente al modelo en precisión completa. El repositorio no proporciona métricas de calidad comparativas.
- El tamaño de la caché KV está limitado a 32 768 tokens por defecto (`CMF_MAX_SEQ`), aunque el modelo soporta 262 144. Si una generación supera ese límite, la caché se evicta a la mitad y la calidad se degrada, con una advertencia en el log.
- El formato CMF y el runtime `cortiq` son relativamente nuevos y su ecosistema es limitado en comparación con formatos establecidos como GGUF o safetensors. La documentación y el soporte comunitario pueden ser escasos.
- Los idiomas declarados son inglés, ruso y chino. Aunque el modelo base podría soportar más idiomas, la conversión no garantiza un rendimiento óptimo fuera de esos tres.
- No se ha publicado información sobre sesgos, alucinaciones o comportamientos no deseados específicos de esta conversión. Se recomienda evaluar el modelo en el dominio de uso antes de desplegarlo en producción.
- El repositorio tiene 0 descargas y 1 like, lo que sugiere una adopción muy limitada y poca validación externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/infosave/Qwen3.8-27B-cmf
- Repositorio del formato CMF: https://github.com/infosave2007/cmf
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
