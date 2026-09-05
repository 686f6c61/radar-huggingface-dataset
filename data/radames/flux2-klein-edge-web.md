# radames/flux2-klein-edge-web

## Resumen

El repositorio `radames/flux2-klein-edge-web` contiene los pesos cuantizados del modelo FLUX.2 Klein 4B de Black Forest Labs, preparados para ejecutar el pipeline completo de generación de imágenes directamente en un navegador web mediante WebGPU y onnxruntime-web. El desarrollador es `radames`, quien ha creado una versión del modelo que funciona sin servidor: el transformer se ejecuta en WGSL (WebGPU) y los componentes de text encoder y VAE se ejecutan con ONNX. Esto permite que aplicaciones web generen imágenes desde el cliente, sin necesidad de infraestructura GPU en el backend.

El modelo base es un transformer de difusión de 4 mil millones de parámetros, acompañado de un text encoder destilado de 0.6B y un VAE destilado. El repositorio ofrece dos conjuntos de pesos: una versión de escritorio en int8 (3.8 GB) y una versión móvil en int4 (2.3 GB), además de una LoRA de destilación a 2 pasos para reducir el tiempo de muestreo. Es relevante ahora porque permite ejecutar modelos de generación de imágenes de última generación en dispositivos del usuario final, con soporte de caché local mediante el sistema de archivos privado del origen (OPFS), lo que reduce drásticamente los tiempos de carga en visitas posteriores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FLUX.2 Klein 4B (transformer de difusion) con text encoder destilado y VAE destilado; pesos cuantizados para ejecucion en navegador |
| Parametros totales | 4B (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (per-row absmax) para escritorio; int4 (asimétrico group-wise, grupo 64) para movil; text encoder ONNX con MatMulNBits q8; LoRA int8 para 2 pasos |
| Idiomas soportados | No disponible (el tokenizer es Qwen3, pero no se especifican los idiomas) |
| Licencia | flux-2-klein |
| Formato de pesos | ONNX (text encoder y VAE), WGSL shaders para el transformer, binarios con manifest JSON; el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es FLUX.2 Klein 4B, un modelo de difusion de texto a imagen desarrollado por Black Forest Labs. El repositorio no incluye los pesos originales en formato safetensors, sino cuantizaciones especificas para ejecucion en navegador. El transformer esta implementado en WGSL (WebGPU) y se distribuye en 9 shards int8 para escritorio o 6 shards int4 para movil, junto con un manifest que describe los rangos de bytes de cada tensor. El text encoder y el VAE se sirven como graficos ONNX, ejecutados con onnxruntime-web.

No se proporciona informacion sobre los datos de entrenamiento, el numero de tokens ni si hubo RLHF o DPO. La innovacion principal de este repo no esta en el entrenamiento, sino en la ingenieria de despliegue: cuantizacion int8 per-row absmax e int4 asimetrico group-wise, destilacion a 2 pasos mediante una LoRA separada, y un sistema de cache en OPFS que valida los ficheros descargados contra el ETag del Hub, de modo que una re-subida de pesos invalida automaticamente la cache del navegador. La paridad con el modelo de referencia en f32 es rel-L2 ≈ 1e-2, descrita como ruido de redondeo a escala bf16.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) y transformacion de imagenes existentes (image-to-image).
- Ejecucion completa en el navegador mediante WebGPU y onnxruntime-web, sin necesidad de backend.
- Dos modos de cuantizacion: int8 para escritorio y int4 para dispositivos moviles, con un peso total de descarga de aproximadamente 5 GB y 3.2 GB respectivamente.
- Soporte de LoRA de destilacion a 2 pasos, que permite reducir el numero de pasos de muestreo y acelerar la generacion.
- Cache persistente en el origin private file system (OPFS), de modo que la segunda visita arranca en segundos.
- Text encoder destilado de 0.6B y VAE destilado, ambos en formato ONNX.
- Tokenizer Qwen3 con plantilla de chat aplicada en el cliente.
- No se mencionan capacidades de tool calling, agentes ni razonamiento multi-paso, ya que es un modelo de generacion de imagenes.

## Casos de uso

- Aplicaciones web de generacion de imagenes sin backend: el modelo se ejecuta localmente en el navegador, permitiendo que editores de imagenes online generen ilustraciones sin coste de servidor ni envio de datos a terceros.
- Prototipado rapido de interfaces de usuario: los disenadores pueden generar imagenes de referencia directamente en el navegador, sin depender de APIs externas ni esperas de red.
- Herramientas de diseno colaborativo: un editor de imagenes integrado en una web puede ofrecer generacion de assets manteniendo todos los datos en el dispositivo del usuario, lo que mejora la privacidad.
- Aplicaciones moviles web progresivas (PWA): la version int4 esta pensada para telefonos, lo que permite generacion de imagenes en moviles con soporte WebGPU, sin instalar aplicaciones nativas.
- Demos educativas y experimentos de difusion: al ejecutarse en el navegador, es posible mostrar el funcionamiento interno de FLUX.2 Klein sin necesidad de GPU dedicada, facilitando el aprendizaje y la experimentacion.
- Generacion de assets para juegos web: crear sprites, fondos o texturas proceduralmente en el cliente, evitando la descarga de ficheros pregenerados y reduciendo el almacenamiento del juego.
- Image-to-image con privacidad: modificar imagenes existentes (por ejemplo, retoque de estilo o inpainting) sin subir las imagenes a un servidor, lo que resulta util en aplicaciones de fotografia online.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Solo se menciona que la paridad contra la referencia f32 es rel-L2 ≈ 1e-2, pero no se aportan metricas de calidad de imagen (FID, CLIP, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible. La memoria GPU necesaria no se especifica; el transformer int8 ocupa 3.8 GB en disco, el text encoder 0.96 GB y el VAE 1.2 GB. La version movil int4 reduce el transformer a 2.3 GB.
- GPU recomendadas: cualquier GPU compatible con WebGPU. No se indican modelos concretos; en escritorio, GPUs modernas de NVIDIA, AMD o Intel deberian ser suficientes. En movil, la version int4 esta disenada para telefonos con WebGPU.
- Si cabe en GPU de consumo: probablemente si, dado que el modelo es de 4B y esta cuantizado a int8/int4. La ejecucion en navegador implica ademas un limite de memoria compartida, por lo que se recomienda probar en el dispositivo objetivo.
- Opciones de despliegue: el despliegue principal es mediante el paquete npm `flux-klein.js`, que se integra en cualquier aplicacion web. No se listan vLLM, llama.cpp, Ollama ni TGI, ya que no son opciones para este formato de pesos. El modelo base original se puede ejecutar con el repositorio oficial de FLUX.2 en Python.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| radames/flux2-klein-edge-web | 4B (base) | int8 / int4 | flux-2-klein | ONNX + WGSL + binarios | HuggingFace |
| black-forest-labs/FLUX.2-klein-4B | 4B | f32 (sin cuantizar) | flux-2-klein | safetensors | HuggingFace |
| Otras alternativas de difusion en navegador | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes para comparar con otros modelos de generacion de imagenes en navegador. La referencia mas directa es el modelo base sin cuantizar, que requiere un servidor con GPU y no ofrece ejecucion en cliente.

## Limitaciones y advertencias

- La licencia es `flux-2-klein`, una licencia personalizada que debe aceptarse. Los terminos exactos no estan incluidos en este repositorio; es necesario revisar el enlace a la licencia para conocer las restricciones de uso comercial.
- Los pesos estan cuantizados, por lo que la calidad de las imagenes puede ser ligeramente inferior a la del modelo en f32. La paridad declarada es rel-L2 ≈ 1e-2, lo que implica cierta perdida de precision.
- La ejecucion requiere un navegador compatible con WebGPU. Navegadores como Safari o Firefox pueden tener soporte parcial o incompleto, lo que puede impedir su uso.
- La primera descarga es grande: aproximadamente 5 GB en escritorio y 3.2 GB en movil. Esto requiere una conexion estable y espacio de almacenamiento en el dispositivo.
- No se proporcionan datos sobre sesgos, riesgos de alucinacion ni limitaciones de idioma. Al ser un modelo de generacion de imagenes, los sesgos pueden estar presentes en los datos de entrenamiento del modelo base, pero no se han evaluado en esta version.
- El repositorio es mantenido por un usuario individual y no es un lanzamiento oficial de Black Forest Labs, por lo que el soporte y la actualizacion pueden ser limitados.
- No hay benchmarks publicados, por lo que no se puede evaluar el rendimiento frente a otros modelos de forma objetiva.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/radames/flux2-klein-edge-web
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/radames/flux-klein-web
- Repositorio oficial de FLUX.2: https://github.com/black-forest-labs/flux2
- Licencia FLUX.2 Klein: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B/blob/main/LICENSE.md
- Paquete npm flux-klein.js: https://github.com/radames/flux-klein.js
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
