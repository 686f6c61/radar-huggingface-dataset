# fusorlabs/d3-web

## Resumen

Decision 3.0 Web es la compilación para navegador de los modelos de enrutamiento semántico Decision 3.0 de vLLM Semantic Router, publicada por fusorlabs. El repositorio empaqueta dos variantes —d3-lite (984 MB, perfil `q7`) y d3-nano (2066 MB, perfil `mix`)— en el formato propietario de bundles de fusor-ai, pensado para ser cargado por el runtime WebAssembly d3-wasm directamente en la CPU del dispositivo. No se distribuyen como checkpoints de PyTorch ni safetensors: solo funcionan dentro de ese runtime.

El modelo resuelve un problema muy concreto: decidir, en el propio cliente y sin llamadas a servidor, cuestiones sobre texto, imágenes y vídeos (clasificación y enrutamiento semántico multimodal). Está construido sobre Qwen3.5 según la model card, y el repositorio incluye las licencias Apache-2.0 y los ficheros NOTICE de cada tamaño.

Su relevancia actual radica en el despliegue on-device vía WebAssembly: permite incorporar un clasificador multimodal en aplicaciones web sin infraestructura de inferencia, con verificación de integridad de pesos mediante hashes BLAKE3 al cargar. El repo tiene 3,0 GB, 0 descargas y 0 likes en el momento de la consulta, y no declara idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.5; compilado a bundle fusor-ai para runtime WebAssembly |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | d3-lite: perfil `q7` (matrices grandes a 7 bits, 984 MB); d3-nano: perfil `mix` (feed-forwards a 4 bits, resto a 7 bits, 2066 MB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con ficheros LICENSE y NOTICE por tamano) |
| Formato de pesos | Bundle fusor-ai: `manifest.json` con lista de tensores y partes, cada parte nombrada por su hash BLAKE3; no es safetensors ni GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que los modelos subyacentes (vllm-sr/d3-lite y vllm-sr/d3-nano) estan construidos sobre Qwen3.5 y que la tarea es image-text-to-text, orientada a enrutamiento semantico (Decision 3.0 de vLLM Semantic Router). No se especifican numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica destacable esta en el empaquetado y el runtime: los pesos se compilan a un formato de bundle con manifiesto y partes verificables por hash BLAKE3, que el runtime d3-wasm comprueba durante la carga. La compilacion se reproduce con `just model` en el repositorio d3-wasm, que descarga los checkpoints originales y genera los mismos bundles. Las revisiones de origen citadas son `03560c26f5199c3c04129a2ccb38960c913635e0` (d3-lite) y `462efc366229ea268cf4eed3738b3fc4415e4817` (d3-nano).

## Capacidades

- Decision sobre texto, imagenes y videos: el modelo responde cuestiones de clasificacion y enrutamiento semantico sobre estas tres modalidades.
- Inferencia on-device en CPU: se ejecuta dentro del runtime WebAssembly d3-wasm, sin GPU ni servidor.
- Verificacion de integridad: el runtime comprueba los hashes BLAKE3 de cada parte al cargar los pesos.
- Dos perfiles de calidad/tamano: d3-lite (984 MB, 7 bits) y d3-nano (2066 MB, 4 bits en feed-forwards).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling, agentes, modo thinking, audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Enrutamiento de peticiones en aplicaciones web: el modelo decide en el cliente a que modelo o servicio derivar una consulta, evitando un salto de red y reduciendo coste de inferencia en servidor.
- Moderacion y clasificacion de contenido multimodal en el navegador: permite etiquetar texto, imagenes y videos subidos por el usuario antes de enviarlos al backend.
- Filtrado previo en formularios y subidas de ficheros: d3-lite (984 MB) puede cargarse en clientes con recursos limitados para validar si una imagen o un texto cumple criterios antes de procesarlo.
- Demos y prototipos sin infraestructura: el Space fusorlabs/d3-wasm permite probar ambos tamanos en el navegador, util para evaluar el enrutamiento antes de integrarlo.
- Aplicaciones con requisitos de privacidad: al ejecutarse en la CPU del dispositivo, los datos de texto, imagen y video no salen del cliente durante la decision.
- Pipelines de enrutamiento semantico en produccion web: integrable en frontends que necesiten decidir entre varios backends o modelos sin depender de un servicio de clasificacion externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia se ejecuta en CPU mediante WebAssembly, sin GPU.
- Memoria y almacenamiento: el bundle d3-lite ocupa 984 MB y d3-nano 2066 MB; el repo completo son 3,0 GB.
- GPU recomendadas: no aplica (runtime d3-wasm sobre CPU).
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: exclusivamente el runtime d3-wasm (WebAssembly); no carga en PyTorch, safetensors, GGUF, llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| fusorlabs/d3-web (d3-lite / d3-nano) | no disponible | no disponible | Bundle fusor-ai (WASM) | Apache-2.0 | Solo runtime d3-wasm en navegador |
| vllm-sr/d3-lite (origen) | no disponible | no disponible | Checkpoint original | no disponible | Servidor (vLLM Semantic Router) |
| vllm-sr/d3-nano (origen) | no disponible | no disponible | Checkpoint original | no disponible | Servidor (vLLM Semantic Router) |

No se dispone de datos de rendimiento ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Portabilidad nula: los pesos solo cargan en el runtime d3-wasm; no son checkpoints de PyTorch ni safetensors y no funcionan con herramientas estandar como transformers, llama.cpp o vLLM.
- Sin datos de rendimiento: no hay benchmarks publicados, por lo que no se puede evaluar la calidad del enrutamiento frente a alternativas.
- Idiomas y contexto no declarados: se desconoce el soporte multilingue y la ventana de contexto, lo que limita la planificacion en produccion.
- Tamano considerable para navegador: 984 MB (d3-lite) y 2066 MB (d3-nano) implican descargas largas y consumo de memoria en el cliente.
- Adopcion temprana: 0 descargas y 0 likes; el ecosistema fusor-ai y d3-wasm es reciente y poco validado.
- Sesgos y alucinacion: no hay informacion sobre sesgos conocidos ni sobre el comportamiento en casos ambiguos; al ser un modelo de decision, los errores de clasificacion afectan directamente al enrutamiento.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar los ficheros NOTICE incluidos por las condiciones de los modelos base Qwen3.5.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fusorlabs/d3-web
- Space de demostracion: https://huggingface.co/spaces/fusorlabs/d3-wasm
- Runtime d3-wasm: https://github.com/fusor-rs/d3-wasm
- Libreria fusor-ai: https://github.com/fusor-rs/fusor-ai
- Modelo base d3-lite: https://huggingface.co/vllm-sr/d3-lite
- Modelo base d3-nano: https://huggingface.co/vllm-sr/d3-nano
