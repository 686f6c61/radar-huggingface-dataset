# jiabins0303/product-photos-webgpu

## Resumen

`jiabins0303/product-photos-webgpu` es un paquete de pesos derivado de FLUX.2 [klein] 4B, el modelo de generacion de imagen de Black Forest Labs, preparado especificamente para ejecutarse en el navegador mediante WebGPU. No se trata de un modelo entrenado desde cero ni de un fine-tuning: es una redistribucion reorganizada y cuantizada de pesos existentes, empaquetada para su uso por la aplicacion de fotografia de producto de backgroundless.io. El repositorio contiene el transformer en 4 bits, el decodificador VAE, un codificador de imagen de referencia en fp16 y 44 codificaciones de prompt fijas.

La relevancia de esta ficha es acotada y conviene ser explicito: el artefacto es un componente de infraestructura para una aplicacion concreta, no un modelo de proposito general para investigadores. Su interes tecnico reside en como se ha empaquetado el modelo base para inferencia en el cliente (navegador, WebGPU), incluyendo la reordenacion de pesos a channels-last y el uso de copias comprimidas con gzip, lo que permite servir un modelo de difusion de 4B parametros sin infraestructura de GPU en servidor.

El modelo base, FLUX.2 [klein] 4B, es un modelo de difusion de texto-a-imagen e imagen-a-imagen de la familia FLUX.2. Este paquete concreto implementa la tarea image-to-image para generar escenas de producto a partir de una imagen de referencia. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (transformer, DiT) derivado de FLUX.2 [klein] 4B; pesos del transformer cuantizados a 4 bits |
| Parametros totales | 4B (modelo base); desglose por componente no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits para el transformer (`core/`); fp16 para el codificador (`encoder/`) y las codificaciones de prompt (`prompts/`) |
| Idiomas soportados | No disponible (el modelo base es de imagen; las codificaciones de prompt son fijas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos binarios organizados por carpetas (`core/`, `decoder/`, `encoder/`, `prompts/`), con copias comprimidas en gzip; no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El paquete no incluye entrenamiento propio. El transformer procede de `BasinShapers/flux2-klein-4b-webgpu` (carpeta `dit/`, commit 5c4f0f7) sin modificaciones, y el decodificador de la carpeta `vae/` del mismo repositorio. El autor solo ha empaquetado de nuevo el codificador de imagen de referencia a partir del VAE de FLUX.2 [klein] 4B, convirtiendo los pesos a fp16 y reordenando los pesos 3x3 a channels-last, un formato mas eficiente para las operaciones de WebGPU. Las 44 codificaciones de prompt fijas se calcularon con el codificador de texto Qwen3-4B en 4 bits incluido en el repositorio de origen.

La innovacion practica del artefacto es el objetivo de despliegue: inferencia de un modelo de difusion de 4B parametros en el navegador. Para ello se combinan cuantizacion a 4 bits del transformer, compresion gzip de los ficheros servidos y un conjunto cerrado de prompts precalculados que elimina la necesidad de ejecutar el codificador de texto en el cliente. El runtime empleado es Kaminos (MIT), segun indica la model card. No se detallan datos de entrenamiento, composicion del dataset ni tecnicas de alineacion como RLHF o DPO, ya que corresponden al modelo base y no se documentan aqui.

## Capacidades

- Generacion de imagenes de producto a partir de una imagen de referencia (image-to-image).
- Composicion de escenas de producto en el navegador, sin backend de GPU.
- Ejecucion en cliente mediante WebGPU, con pesos servidos comprimidos en gzip.
- Seleccion entre 44 prompts fijos precalculados; no hay generacion de prompt libre en el cliente.
- Codificacion de imagen de referencia en fp16 con pesos reordenados a channels-last.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking.

## Casos de uso

- Fotografia de producto en navegador: la aplicacion integra el paquete para generar escenas de producto a partir de una foto del articulo, ejecutando el modelo en la GPU del usuario via WebGPU y evitando subir imagenes a un servidor.
- Prototipado de experiencias de edicion de imagen sin backend: util para equipos que quieran validar un flujo image-to-image en el cliente sin montar infraestructura de inferencia.
- Demos y pruebas de concepto de difusion en el navegador: el paquete permite evaluar el rendimiento de un transformer de 4B en 4 bits sobre WebGPU en hardware de consumo.
- Catalogos de e-commerce con privacidad de datos: al procesarse la imagen localmente, el flujo es adecuado para escenarios donde la imagen del producto no debe salir del dispositivo del usuario.
- Referencia de empaquetado para otros desarrolladores: sirve como ejemplo de reordenacion de pesos a channels-last y de precalculo de codificaciones de prompt para despliegues WebGPU.
- Integracion en herramientas de escritorio basadas en web (Electron, PWA): el mismo runtime WebGPU puede reutilizarse en aplicaciones empaquetadas que necesiten generacion de imagenes local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 2,1 GB, lo que da una idea del peso total de los artefactos servidos; el consumo en VRAM depende de la cuantizacion a 4 bits del transformer y del codificador en fp16, y no se detalla en la informacion disponible.
- Requiere un navegador con soporte de WebGPU y una GPU compatible; no se especifican modelos concretos de GPU en la model card.
- No se confirma compatibilidad con GPUs de consumo especificas (RTX 4090, etc.); el diseno apunta a ejecucion en el cliente, pero no hay cifras de VRAM ni de latencia publicadas.
- Opciones de despliegue: runtime Kaminos (MIT) sobre WebGPU; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de difusion de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| product-photos-webgpu (este) | 4B (base) | Image-to-image, empaquetado para WebGPU | No disponible | Apache 2.0 | Hugging Face, 0 descargas |
| FLUX.2 [klein] 4B (base) | 4B | Texto-a-imagen e imagen-a-imagen | No disponible | Apache 2.0 | Hugging Face (Black Forest Labs) |
| BasinShapers/flux2-klein-4b-webgpu | 4B (base) | Difusion para WebGPU | No disponible | No disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete esta disenado para una aplicacion concreta (backgroundless.io/product-photos); no es un modelo de proposito general ni se ha validado fuera de ese flujo.
- Solo admite 44 prompts fijos precalculados: no hay codificador de texto en el cliente, por lo que no se puede generar con prompts arbitrarios.
- Al ser una redistribucion de pesos de terceros, la calidad y el comportamiento dependen enteramente de FLUX.2 [klein] 4B y del empaquetado de `BasinShapers/flux2-klein-4b-webgpu`; el autor no documenta evaluaciones propias.
- Riesgo de alucinacion visual y de artefactos propios de los modelos de difusion, especialmente con cuantizacion a 4 bits; no se han publicado metricas de fidelidad.
- Dependencia de WebGPU: la compatibilidad depende del navegador y de la GPU del usuario; no se documentan requisitos minimos ni fallbacks.
- La licencia Apache 2.0 se declara para el paquete, pero conviene verificar las condiciones del modelo base y de los pesos de origen antes de un uso comercial.
- No se documentan sesgos, idiomas soportados ni limitaciones de contexto; el modelo base es de imagen y las codificaciones de prompt son fijas, por lo que el sesgo relevante seria el del conjunto de prompts incluido.
- Repositorio con 0 descargas y 0 likes: sin validacion de la comunidad ni issues conocidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jiabins0303/product-photos-webgpu
- Modelo base FLUX.2 [klein] 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Repositorio de pesos de origen: https://huggingface.co/BasinShapers/flux2-klein-4b-webgpu
- Runtime Kaminos: https://github.com/lyonsno/kaminos
- Aplicacion que lo usa: https://www.backgroundless.io/product-photos
