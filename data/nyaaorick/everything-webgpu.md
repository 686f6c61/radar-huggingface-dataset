# nyaaorick/everything-webgpu

## Resumen

everything-webgpu es una librería JavaScript/TypeScript publicada en npm que permite ejecutar modelos de lenguaje locales (LLM) en el navegador mediante WebGPU, actuando como una capa de compatibilidad sobre `@mlc-ai/web-llm`. Desarrollada por nyaaorick (Junyao), resuelve el problema de desplegar inferencia on-device sin servidor, añadiendo un planificador de tareas con prioridades, decodificación multi-paso y tres fuentes de carga de modelos (identificador precompilado, URL o carpeta local). Su relevancia actual radica en que ofrece una alternativa ligera (53 kB en el chunk inicial) y con mejoras de rendimiento frente a WebLLM, manteniendo la misma API de OpenAI para `chat.completions.create()`. No es un modelo de lenguaje en sí, sino un runtime de inferencia para navegador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Tipo de artefacto | Librería npm (runtime de inferencia en navegador) |
| Arquitectura | No aplica (no es un modelo; envuelve MLC/WebLLM) |
| Parametros totales | No aplica (depende del modelo cargado) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (depende del modelo cargado) |
| Tipos de cuantizacion | No aplica (soporta los formatos de MLC, p. ej. q4f16_1) |
| Idiomas soportados | No disponible (depende del modelo subyacente) |
| Licencia | ISC |
| Formato de pesos | No aplica (carga pesos MLC/WebLLM, normalmente safetensors) |
| Dependencia principal | @mlc-ai/web-llm (6 MB, cargado de forma diferida) |
| Tamaño del paquete | 53 kB (~19 kB gzip) en el chunk de entrada |

## Arquitectura y entrenamiento

everything-webgpu no es un modelo entrenado, sino una librería que orquesta la inferencia de modelos MLC/WebLLM en el navegador. Su arquitectura de software incluye un planificador (scheduler) que gestiona sesiones, prioridades, tareas y peticiones interrumpibles, creando un motor por tarea y ampliando el pool bajo demanda. Incorpora decodificación multi-paso (multi-step decoding) que ejecuta K pasos de forward por sincronización de GPU, logrando en un modelo de 0.8B pasar de 9.6 a 25.9 tokens por segundo. Aplica dos parches en tiempo de compilación: uno para el límite de 9 storage buffers de Firefox y otro que agrupa los compute passes en uno solo por flush. No hay entrenamiento involucrado; la librería se limita a cargar y ejecutar modelos ya compilados para WebGPU.

## Capacidades

- Ejecución de modelos MLC/WebLLM en el navegador con WebGPU, sin servidor.
- API compatible con OpenAI: `engine.chat.completions.create()` acepta y devuelve las mismas estructuras, incluyendo streaming y finish reasons.
- Planificador con `session`, `priority`, `task` y `preemptible` en cada petición.
- Tres fuentes de modelos: identificador precompilado, URL alojada por el usuario, o carpeta local sin red en ningún momento.
- Decodificación multi-paso (multi-step decoding) para mejorar el throughput.
- Streaming de respuestas con chunks idénticos a WebLLM.
- Soporte de embeddings (según la documentación de API).
- Errores tipados con ocho códigos distintos, cada uno orientado a una acción correctiva del llamador.
- Carga diferida de WebLLM: solo se descarga cuando se invoca `load()` o `listAvailableModels()`.

## Casos de uso

- Chatbots en el navegador sin backend: un asistente conversacional que se ejecuta íntegramente en el cliente, ideal para aplicaciones con requisitos de privacidad o sin infraestructura de servidor.
- Extensiones de navegador (MV2/MV3): el ejemplo `webext/` muestra cómo integrar la librería en una extensión de Firefox usando `browser.storage.local` como almacén y gestionando la CSP necesaria para el runtime WASM.
- Prototipado rápido de aplicaciones LLM: con cuatro líneas de código se puede tener un motor funcional, lo que acelera la validación de ideas sin configurar entornos de servidor.
- Aplicaciones offline o con conectividad intermitente: tras la primera descarga de pesos, el modelo se cachea en IndexedDB y funciona sin red.
- Asistentes de productividad en el navegador: redacción de correos, resúmenes o generación de texto directamente en la página, con la ventaja de que el usuario mantiene el control de sus datos.
- Demostraciones y educación: ejecutar modelos locales en una página web para enseñar conceptos de LLM o evaluar el rendimiento de WebGPU en distintos dispositivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales en la información disponible. La model card reporta una mejora de rendimiento concreta: en un modelo de 0.8B, la decodificación multi-paso eleva el throughput de 9.6 a 25.9 tokens por segundo. No hay comparaciones con otros runtimes ni métricas estandarizadas (MMLU, HumanEval, etc.) porque no se trata de un modelo de lenguaje.

## Requisitos de hardware

- Navegador compatible con WebGPU (verificado en Firefox 154 / macOS / M4; en Firefox puede requerir activar `dom.webgpu.enabled` y flags relacionados).
- GPU con soporte WebGPU; Chrome se espera más rápido que Firefox, aunque no se ha medido.
- La VRAM necesaria depende del modelo cargado: por ejemplo, un modelo de 1B cuantizado a q4f16_1 ocupa ~0.8 GB de descarga y requiere una GPU con al menos esa memoria disponible.
- El paquete npm pesa 53 kB (~19 kB gzip) en el chunk inicial; WebLLM (6 MB) se carga de forma diferida solo cuando se necesita.
- Opciones de despliegue: integración con Vite mediante el plugin `everythingWebGPU()`, o uso directo en proyectos vanilla, React o extensiones de navegador.
- No requiere servidor; toda la inferencia ocurre en el dispositivo del usuario.

## Comparativa con modelos similares

| Característica | everything-webgpu | @mlc-ai/web-llm | transformers.js |
|---|---|---|---|
| Tipo | Librería wrapper con scheduler | Librería de inferencia WebGPU | Librería de inferencia WASM/WebGPU |
| API | OpenAI-compatible (chat.completions) | OpenAI-compatible | Transformers.js propia |
| Planificador | Sí (prioridades, sesiones, preemptible) | No | No |
| Multi-step decoding | Sí | No | No |
| Fuentes de modelo | Prebuilt, URL, carpeta local | Prebuilt, URL | HuggingFace Hub |
| Tamaño del paquete | 53 kB + 6 MB lazy | ~6 MB | ~1 MB (núcleo) |
| Licencia | ISC | Apache 2.0 | Apache 2.0 |
| Estado | Pre-1.0, ESM only | Estable | Estable |

## Limitaciones y advertencias

- Requiere WebGPU; no funciona en navegadores sin esta API (p. ej. Safari antes de versiones recientes, o navegadores con WebGPU deshabilitado).
- Versión pre-1.0: la API puede cambiar, aunque la capa de compatibilidad con WebLLM se declara estable.
- Solo ESM (`"type": "module"`); no compatible con CommonJS directamente.
- El rendimiento depende del hardware del cliente; en GPUs integradas o antiguas la velocidad puede ser baja.
- No incluye modelos propios; depende de compilaciones MLC/WebLLM existentes (por ejemplo, `Llama-3.2-1B-Instruct-q4f16_1-MLC`).
- En Firefox, el límite de 9 storage buffers puede requerir parches (ya aplicados en la librería) y flags de configuración manual.
- La licencia ISC permite uso comercial, pero los modelos subyacentes tienen sus propias licencias (verificar cada uno).
- Riesgo de alucinación y sesgos inherentes a los modelos cargados; la librería no añade ninguna capa de moderación.

## Enlaces

- HuggingFace: https://huggingface.co/nyaaorick/everything-webgpu
- npm: https://www.npmjs.com/package/everything-webgpu
- GitHub: https://github.com/nyaaorick/everything-webgpu
- Gist de inicio rápido: https://gist.github.com/nyaaorick/1d84c3bfce1dc237b319306127519238
- Perfil del autor: https://huggingface.co/nyaaorick
- Modelo relacionado del autor (Qwen3.8-2B MLC): https://huggingface.co/nyaaorick/Qwen3.8-2B-q4f16_1-MLC
