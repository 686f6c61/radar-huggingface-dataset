# releaseworthy/dasiwa-minimax-h3-turbo-int8

## Resumen

DaSiWa MiniMax H3 Hybrid v4 Turbo int8 es un espejo (mirror) de un checkpoint de generacion de video a partir de imagen (image-to-video) publicado originalmente en Civitai bajo el identificador de modelo 2877206, version `DaSiWa_Hybrid_v4_Turbo`. El repositorio de Hugging Face lo mantiene el usuario `releaseworthy` con el unico proposito de servir el fichero de pesos a instancias de GPU alquiladas a mayor velocidad de la que ofrece la CDN de Civitai, que limita a un solo host a entre 11 y 33 MB/s tras los primeros gigabytes. No se trata, por tanto, de un desarrollo propio ni de un modelo entrenado por el autor del repositorio.

El artefacto consiste en un unico fichero `safetensors` de 20.967.668.616 bytes (aproximadamente 21 GB) en cuantizacion int8, disenado para ejecutarse en ComfyUI con los flujos de trabajo DaSiWa MiniMax H3 y su node pack, en tan solo 4 pasos de inferencia (variante "turbo"). El modelo base pertenece a la familia MiniMax H3, orientada a la sintesis de video, y este checkpoint concreto es un refinamiento hibrido de la comunidad.

La relevancia de esta ficha es acotada: se documenta un artefacto de redistribucion con licencia Civitai Model License, sin model card tecnica propia, sin datos de entrenamiento publicados y sin benchmarks. Cualquier evaluacion rigurosa del modelo debe remitirse al autor original en Civitai y a los repositorios de los componentes auxiliares (text encoder, VAE, upscaler) que no se incluyen en este espejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion para image-to-video, familia MiniMax H3) |
| Parametros totales | no disponible (fichero de pesos de 20,97 GB en int8) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (checkpoint pre-cuantizado) |
| Idiomas soportados | no disponible |
| Licencia | civitai-model-license (etiquetada como "other") |
| Formato de pesos | safetensors (`DasiwaMinimaxH3_dasiwaHybridV4Turbo_int8.safetensors`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo en la documentacion proporcionada. Por la etiqueta de pipeline (`image-to-video`) y por el ecosistema en el que se integra (ComfyUI, node pack especifico, VAE y text encoder externos), se trata de un modelo de difusion condicionado por texto e imagen para la generacion de video. El checkpoint es una variante "hibrida" y "turbo" del modelo MiniMax H3, lo que en la practica se traduce en un regimen de muestreo reducido a 4 pasos, segun indica el autor del espejo.

Tampoco se detallan los datos de entrenamiento: no hay cifra de tokens, composicion del dataset, ni mention de tecnicas de alineacion como RLHF o DPO. El autor del repositorio declara explicitamente que todo el credito del checkpoint corresponde al autor original en Civitai y que este repositorio unicamente re-aloja el fichero bajo la licencia con la que se publico. El sha256 del fichero es `36471afb817747b711b9abad3d8e6b7c88a7c2b91b4887d040a8dcb7ee82b2d6`, util para verificar la integridad de la descarga.

## Capacidades

- Generacion de video a partir de una imagen de entrada (image-to-video) en 4 pasos de inferencia.
- Integracion con los flujos de trabajo DaSiWa MiniMax H3 para ComfyUI: T2VA (texto a video con audio), FL2VA (first-last frame to video with audio) y REF2VA (referencia a video con audio), segun la nomenclatura citada en la model card.
- Compatibilidad con el node pack de DaSiWa para ComfyUI.
- Uso conjunto con text encoder, VAE y upscaler latente externos, que no se incluyen en este repositorio.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes ni soporte multilingue, por tratarse de un modelo generativo de video y no de un modelo de lenguaje.

## Casos de uso

- Prototipado rapido de video generativo en ComfyUI: el checkpoint se carga directamente en los flujos DaSiWa y permite obtener clips en 4 pasos, lo que reduce el tiempo de iteracion frente a muestreos de 20-50 pasos.
- Animacion de imagenes fijas para storyboards: a partir de una ilustracion o fotograma clave se genera una secuencia animada, util en previsualizacion de anuncios o cortinillas.
- Generacion de video con audio sincronizado: los flujos T2VA y FL2VA del ecosistema DaSiWa permiten producir clips con pista de audio asociada, aplicable a demos musicales o contenido para redes.
- Interpolacion entre primer y ultimo fotograma (FL2VA): util para transiciones controladas en montaje, donde se fijan los extremos del plano y el modelo rellena el movimiento intermedio.
- Transferencia de referencia visual (REF2VA): permite condicionar el video generado a una imagen de referencia de estilo o identidad, aplicable a campanas de marca con coherencia visual.
- Despliegue en infraestructura alquilada: el espejo existe precisamente para que instancias de GPU efimeras descarguen los 21 GB a velocidad completa y arranquen el pipeline sin cuellos de botella de CDN.
- Reproduccion de resultados de la comunidad: al fijar la version `DaSiWa_Hybrid_v4_Turbo` y verificar el sha256, equipos de investigacion pueden replicar exactamente las salidas publicadas por otros usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un checkpoint de 20,97 GB en int8 requiere al menos ~21 GB solo para los pesos, a los que hay que sumar text encoder, VAE, upscaler latente y activaciones; en la practica se recomienda una GPU con 24 GB o mas.
- GPU recomendadas: no especificadas por el autor. Por el volumen de pesos, encajan tarjetas de 24 GB en adelante (RTX 4090, RTX 5090, A100 40/80 GB, H100).
- Cabe en GPU de consumo: previsiblemente si en RTX 4090/5090 (24-32 GB) siempre que se gestionen con cuidado los componentes auxiliares; no se confirma en la documentacion.
- Opciones de despliegue: ComfyUI con los flujos DaSiWa MiniMax H3 y su node pack. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El autor solo indica que el muestreo se realiza en 4 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DaSiWa MiniMax H3 Hybrid v4 Turbo int8 (este) | no disponible (21 GB int8) | no disponible | image-to-video, 4 pasos | civitai-model-license | espejo en Hugging Face |
| MiniMax H3 base (Comfy-Org/MiniMax-H3) | no disponible | no disponible | image-to-video | no disponible | Hugging Face |
| MiniMax-H3-INT4-ConvRot (Merserk) | no disponible | no disponible | image-to-video, int4 | no disponible | Hugging Face |
| MiniMax-H3-experimental (Kijai) | no disponible | no disponible | image-to-video, experimental | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada. La comparativa se limita a la disponibilidad y al rol de cada repositorio dentro del ecosistema.

## Limitaciones y advertencias

- Este repositorio es un espejo, no el origen del modelo: no hay garantia de mantenimiento, actualizaciones ni soporte por parte del autor original.
- La licencia es Civitai Model License, que impone restricciones especificas de uso; es imprescindible revisar los terminos en el enlace de Civitai antes de cualquier uso comercial. La etiqueta `license: other` en Hugging Face no aclara por si sola los permisos.
- El checkpoint no incluye text encoder, VAE ni upscaler latente: sin descargar los repositorios auxiliares (Merserk, Kijai, Comfy-Org, LBH-123-AI) el modelo no es funcional.
- No hay model card tecnica, ficha de datos de entrenamiento ni evaluacion de sesgos; se desconoce la composicion del dataset y los sesgos potenciales en rostros, culturas o estilos.
- Riesgo de alucinacion visual y artefactos propios de la generacion de video con difusion, especialmente en movimientos rapidos, manos y texto en pantalla; el muestreo a 4 pasos puede amplificar estos defectos frente a configuraciones con mas pasos.
- No se documentan idiomas soportados ni calidad multilingue de los prompts.
- El uso en produccion exige verificar el sha256 del fichero y asumir que la version `DaSiWa_Hybrid_v4_Turbo` puede quedar obsoleta o retirarse de Civitai.
- El tamano de 21 GB y la dependencia de ComfyUI limitan el despliegue a entornos con GPU de gama alta y flujos preconfigurados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/releaseworthy/dasiwa-minimax-h3-turbo-int8
- Modelo original en Civitai: https://civitai.com/models/2877206
- Flujos de trabajo DaSiWa en Civitai: https://civitai.com/models/2831978
- Text encoder / VAE (Merserk): https://huggingface.co/Merserk/MiniMax-H3-INT4-ConvRot
- Componentes experimentales (Kijai): https://huggingface.co/Kijai/MiniMax-H3-experimental
- Repositorio oficial Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3
- Upscaler latente (LBH-123-AI): https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler
