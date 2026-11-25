# Langzaigg/moss_anime_turbo_aio

## Resumen

MOSS Anime Turbo AIO v1.2 es un derivado no oficial del modelo de difusion MOSS-Image, orientado a la generacion de imagenes de estilo anime. Lo publica el usuario Langzaigg en Hugging Face y se construye a partir del checkpoint comunitario `MossYume_v01` en BF16, que a su vez deriva del modelo oficial `OpenMOSS-Team/MOSS-Image-SFT`. El repositorio distribuye unicamente el componente DiT (Diffusion Transformer) ya fusionado con varios adaptadores, en formatos BF16 e INT8 ConvRot.

La propuesta del modelo es ofrecer una "receta" de generacion completa preempaquetada: el autor fusiona en los pesos un LoRA Turbo DMD2 a fuerza 1.0, un LoRA de estilo a 0.3 y un DoRA de anime cute a 0.3, de modo que no hace falta cargar adaptadores en tiempo de inferencia ni aplicar parches de remapeo QKV. El resultado es un DiT que genera imagenes en 4 pasos con CFG 1.0, pensado para flujos de ComfyUI.

Es relevante ahora porque simplifica el despliegue de text-to-image anime de alta calidad con muy pocos pasos de muestreo, aunque conviene tener presente que es una mezcla de comunidad, no una release oficial de OpenMOSS, y que requiere componentes externos (text encoder Qwen3.5-9B INT8 y VAE FLUX.2) que no se incluyen en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con atencion fused-QKV; derivado de MOSS-Image |
| Parametros totales | no disponible (pesos BF16 de 10.164.655.840 bytes / 9,47 GiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; entrada de prompt via text encoder Qwen3.5-9B) |
| Tipos de cuantizacion | BF16 e INT8 ConvRot (row-wise, escalas FP32, group size 256) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (single-file, DiT unicamente) |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer (DiT) derivado de MOSS-Image, con layout de atencion fused-QKV. Sobre el checkpoint base `MossYume_v01` (BF16) el autor fusiona tres adaptadores: `8-steps-dmd2-lora` a fuerza 1.0, `moss_pussy_lora_v2.0` a 0.3 y `moss-cute-anime` (DoRA) a 0.3. La fusion del DoRA se realiza integrando sus componentes de magnitud y direccion mediante la operacion de normalizacion correspondiente, en lugar de una simple suma de bajo rango. Tras la fusion no se requiere ningun LoRA, DoRA ni parche de remapeo QKV en tiempo de ejecucion.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; al tratarse de un modelo de difusion, el ajuste fino se basa en adaptadores de bajo rango sobre el modelo base. La variante INT8 ConvRot almacena 168 pesos de proyeccion de las capas del transformer como INT8 row-wise con escalas FP32 y grupo de 256; normas, embedders, capas de modulacion y cabeceras de salida permanecen en BF16. El autor reporta que el fichero BF16 contiene 379 tensores y paso una lectura completa de tensores, 84 comprobaciones de pesos de atencion no nulos y una generacion real en ComfyUI con el flujo por defecto.

## Capacidades

- Generacion de imagenes text-to-image de estilo anime con muy pocos pasos (4 pasos recomendados).
- Inferencia con CFG 1.0 y prompt negativo vacio, lo que reduce coste computacional por imagen.
- Generacion de escenas variadas (el autor evalua 19 escenas distintas con prompts fijos).
- Renderizado de texto corto y literal en imagen (funciona mejor con cadenas breves).
- Integracion con ComfyUI mediante flujo de tres componentes: `UNETLoader` + `CLIPLoader` (tipo `moss_image`) + `VAELoader`.
- API HTTP e integracion MCP a traves de ComfyUI-AnimaFlow.
- No soporta tool calling ni razonamiento multi-paso (es un modelo de difusion, no un LLM).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Ilustracion anime para produccion rapida: con 4 pasos y CFG 1.0, el modelo permite generar lotes grandes de imagenes en menos tiempo que un modelo de difusion convencional de 20-30 pasos, adecuado para prototipado visual y moodboards.
- Generacion de assets para videojuegos indie: personajes y escenarios de estilo anime con resolucion aproximada de 1 MP (ancho y alto multiplos de 16), integrables en pipelines de arte conceptual.
- Creacion de contenido para redes sociales: el flujo ComfyUI-AnimaFlow expone una API HTTP que permite automatizar la generacion de ilustraciones a partir de prompts en un backend.
- Ilustracion editorial y fanzines: la licencia Apache-2.0 del derivado facilita su uso en publicaciones, siempre revisando las licencias de los componentes base y comunitarios fusionados.
- Integracion en agentes via MCP: ComfyUI-AnimaFlow incluye integracion MCP, lo que permite que un agente LLM solicite imagenes bajo demanda en un flujo multi-herramienta.
- Despliegue en GPU de consumo con la variante INT8: el fichero INT8 ConvRot (5,04 GiB) reduce el uso de memoria del DiT frente al BF16 (9,47 GiB), util en equipos con VRAM limitada cuando la precision maxima no es critica.
- Experimentacion e investigacion en difusion: sirve como caso de estudio de fusion de LoRA/DoRA en un DiT y de cuantizacion INT8 row-wise con escalas FP32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks objetivos en la informacion disponible. El autor realiza una comparacion cualitativa con semillas fijas sobre 19 escenas, con 4 pasos, CFG 1.0 y sampler `res_multistep + simple`, entre seis configuraciones (MossYume + DMD2, MossYume + Turbo anterior, DMD2 + pussy 0.3, DMD2 + pussy 0.7, DMD2 + pussy 0.3 + cute DoRA 0.3 y DMD2 + pussy 0.7 + cute DoRA 0.3). Las seis completaron 19/19 escenas y la receta final (pussy 0.3 + cute 0.3) se eligio por inspeccion manual lado a lado. Estos datos son comparaciones cualitativas, no puntuaciones de benchmark.

| Configuracion evaluada | Escenas completadas | Criterio de seleccion |
|---|---|---|
| MossYume + DMD2 | 19/19 | Comparacion cualitativa |
| MossYume + Turbo anterior (4 pasos) | 19/19 | Comparacion cualitativa |
| DMD2 + pussy 0.3 | 19/19 | Comparacion cualitativa |
| DMD2 + pussy 0.7 | 19/19 | Comparacion cualitativa |
| DMD2 + pussy 0.3 + cute DoRA 0.3 | 19/19 | Seleccionada como receta final |
| DMD2 + pussy 0.7 + cute DoRA 0.3 | 19/19 | Comparacion cualitativa |

## Requisitos de hardware

- VRAM estimada para inferencia: el DiT BF16 ocupa 9,47 GiB y el INT8 ConvRot 5,04 GiB; a ello hay que sumar el text encoder Qwen3.5-9B INT8 y el VAE FLUX.2, que no se incluyen en el repositorio.
- En GPUs de 16 GB el autor advierte de presion de memoria y paginacion sustancial con el DiT BF16 y el text encoder grande; la variante INT8 alivia parte de esa presion.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; por el tamano del DiT y del text encoder, se requiere al menos una GPU de 16 GB para BF16 y margen adicional para el encoder.
- Cabe en GPU de consumo con la variante INT8 si se dispone de suficiente VRAM para el conjunto DiT + text encoder + VAE; no se confirma un modelo concreto.
- Opciones de despliegue: ComfyUI (flujo `UNETLoader` + `CLIPLoader` tipo `moss_image` + `VAELoader`), con API HTTP e integracion MCP via ComfyUI-AnimaFlow. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de este tipo).
- Latencia y throughput: no disponibles; el modelo esta optimizado para 4 pasos, lo que reduce el coste frente a muestreos de 20-30 pasos, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS Anime Turbo AIO v1.2 (este) | DiT text-to-image anime, 4 pasos | no disponible (DiT BF16 9,47 GiB) | no disponible | Apache-2.0 | Hugging Face, ComfyUI |
| OpenMOSS-Team/MOSS-Image-SFT | DiT text-to-image base | no disponible | no disponible | no disponible | Hugging Face |
| MossYume_v01 | DiT comunitario derivado de MOSS-Image | no disponible | no disponible | no disponible | checkpoint comunitario |
| Modelos de difusion anime de referencia (p. ej. derivados de SDXL/FLUX) | DiT/UNet text-to-image | no disponible | no disponible | variable | no disponible |

No se dispone de datos objetivos de rendimiento que permitan una comparacion cuantitativa con alternativas; la comparativa se limita a la relacion de derivacion y a la licencia declarada.

## Limitaciones y advertencias

- Anatomia compleja, interacciones entre objetos, adherencia exacta al layout y supresion de conceptos negativos pueden fallar.
- Accesorios que definen al personaje y vestimenta exacta no estan garantizados.
- Texto pequeno o de varios parrafos puede salir malformado; funcionan mejor las cadenas literales cortas.
- En GPUs de 16 GB, el DiT BF16 y el text encoder grande pueden generar presion de memoria y paginacion sustancial.
- La variante INT8 solo paso una prueba de humo y no se incluyo en la comparacion cualitativa completa de seis grupos.
- Es una mezcla de comunidad, no una release oficial de OpenMOSS; hay que revisar las licencias y terminos del checkpoint base y de cada componente comunitario fusionado antes de redistribuir o usar en produccion.
- No se especifican sesgos conocidos ni riesgos de alucinacion en la informacion disponible (es un modelo de generacion de imagen, no de texto).
- La recomendacion de 4 pasos es especifica de este derivado y no debe aplicarse sin mas al modelo SFT oficial.
- Los ficheros del repositorio contienen solo el DiT; no son checkpoints AIO de un solo archivo y no deben cargarse con `CheckpointLoaderSimple`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Langzaigg/moss_anime_turbo_aio
- Modelo base oficial: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- ComfyUI-AnimaFlow (workflow, API HTTP, MCP): https://github.com/Langzaigg/ComfyUI-AnimaFlow
