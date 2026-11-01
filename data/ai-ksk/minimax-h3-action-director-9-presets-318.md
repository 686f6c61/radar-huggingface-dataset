# AI-KSK/minimax-h3-action-director-9-presets-318

## Resumen
MiniMax H3 Action Director — Nine Presets in One Workflow es un paquete de flujo de trabajo para ComfyUI publicado por el usuario AI-KSK en HuggingFace. No se trata de un modelo de pesos ni de una release de checkpoint: el repositorio contiene unicamente un grafo JSON de ComfyUI (95 nodos, 160 enlaces) y una imagen promocional de portada. El grafo esta disenado para orquestar generacion de video con audio a partir de tres rutas de entrada distintas (texto a video, primer/ultimo fotograma y generacion con referencia), nueve recetas aritmeticas de LoRA y una etapa opcional de refinamiento de latentes.

El proposito declarado es ofrecer un unico flujo con nueve presets de "accion" (combate, armas, GunFu, reparacion de movimiento y fight flow) que modifican coeficientes de LoRA conectados, no cadenas de prompt. El paquete depende de pesos externos que no se incluyen en el repositorio: un UNet `minimax_h3_fl2va_pruned_int8_convrot.safetensors`, un text encoder `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors`, VAE de video y audio, un LoRA de referencia y varios LoRA de accion. El tamano del repo es 0.0 GB, las descargas y los likes son 0 y no hay pipeline, licencia ni idiomas declarados en la ficha de HuggingFace.

La relevancia es limitada y de naturaleza practica: sirve como plantilla reproducible para quien ya dispone del stack MiniMax H3 en ComfyUI y quiere explorar combinaciones de LoRA sin reconstruir el grafo. No aporta evidencia de inferencia, rendimiento ni compatibilidad hardware, y la propia model card advierte que no deben inferirse arquitectura, mecanica de cuantizacion ni derechos a partir de los nombres de fichero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete es un grafo ComfyUI; los nombres de fichero sugieren un UNet MiniMax H3 FL2VA, un text encoder Qwen3-VL 32B y VAE de video/audio, pero no se confirma) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible como spec del modelo; los ficheros referenciados incluyen variantes int8 convrot, nvfp4 AWQ, fp32 y bf16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no incluidos en el repo; el workflow referencia safetensors externos y un JSON de ComfyUI |

## Arquitectura y entrenamiento
No hay informacion sobre arquitectura ni entrenamiento del modelo subyacente en la informacion proporcionada. El repositorio es un workflow de ComfyUI con 95 nodos y 160 enlaces que integra tres rutas de condicionamiento: texto a video, primer/ultimo fotograma y generacion con referencia. La ruta de referencia anade un LoRA de referencia (`minimax_h3_ref_lora_layer20-49adaln_proj_rank_256_bf16.safetensors`) sobre el mismo UNet FL2VA. El sampler seleccionado es `res_multistep`; el selector de pasos enruta 20 pasos para las rutas ordinarias y 25 para la ruta de referencia, y el scheduler de primera etapa almacena `simple/denoise 1` mientras el refinamiento almacena `simple/denoise 0.3`. La duracion se calcula con una expresion de fotogramas que da 124 para 5 segundos y 243 para 10 segundos, cumpliendo la forma 17n+5. La resolucion por defecto es 16:9 con objetivo de 0.98 megapixeles y alineacion 32; con refinamiento activo, la primera etapa recibe 896x512 y el nodo de refinamiento apunta a 1344x768.

Las nueve recetas de preset son evaluaciones aritmeticas de las expresiones guardadas con los dos interruptores manuales desactivados, no mediciones de efectos renderizados. El orden de coeficientes es Combat / Weapon / GunFu / Motion / Fight Flow. Los valores de refinamiento solo aplican cuando esa etapa esta activa. Cambiar el preset modifica coeficientes conectados, no las tres cadenas de prompt separadas, por lo que el usuario debe ajustar el prompt a la escena ficticia que pretende.

## Capacidades
- Orquestacion de generacion de video con audio en ComfyUI mediante un unico grafo con tres rutas de entrada seleccionables por interruptores de modo.
- Ruta texto a video: requiere poner ambos controles de modo en falso y editar el prompt 17.
- Ruta primer/ultimo fotograma: requiere modo principal falso, secundario verdadero, sustituir las imagenes 97/98 y editar el prompt 96.
- Ruta de referencia: requiere modo principal verdadero, sustituir las imagenes 26/27 y editar el prompt 25; el modo principal tiene precedencia sobre el secundario.
- Aplicacion de nueve presets de LoRA de accion con coeficientes aritmeticos predefinidos (A0 a A8).
- Etapa opcional de refinamiento de latentes con upscaler 3D y resolucion objetivo superior.
- Control de duracion mediante expresion de fotogramas y selector de resolucion con alineacion configurable.
- Decodificacion de video y audio y guardado mediante CreateVideo y SaveVideo.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso ni multilingues en la informacion disponible.

## Casos de uso
- Prototipado de escenas de accion con ComfyUI: el grafo permite alternar entre nueve recetas de LoRA (combate, armas, GunFu, movimiento, fight flow) cambiando un unico valor de preset, lo que acelera la exploracion creativa sin reconstruir el pipeline.
- Generacion de video a partir de texto para prevision visual: con ambos modos en falso y el prompt 17 editado, el flujo produce un video de 5 o 10 segundos a 16:9 con objetivo de 0.98 MP, util para moodboards animados.
- Interpolacion entre primer y ultimo fotograma: con modo principal falso y secundario verdadero, se sustituyen las imagenes 97/98 para generar la transicion intermedia, adecuado para animaticos y transiciones de montaje.
- Generacion condicionada por referencia: con modo principal verdadero y las imagenes 26/27 sustituidas, el LoRA de referencia permite mantener consistencia de personaje o estilo entre tomas.
- Refinamiento de latentes para entrega final: activando el nodo de refinamiento se pasa de 896x512 a un objetivo 1344x768, util para subir resolucion antes de guardar el resultado.
- Reproduccion de tutoriales y comparativas de preset: el paquete incluye enlaces a tutoriales en YouTube y Bilibili, por lo que sirve como material de practica para validar las nueve recetas sobre escenas propias.
- Integracion en pipelines de experimentacion: el JSON preserva los bytes fuente, lo que permite versionar el grafo y comparar configuraciones de coeficientes entre ejecuciones.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se incluye ninguna prueba nueva de inferencia, rendimiento, memoria o compatibilidad, y que las recetas son evaluaciones aritmeticas de expresiones guardadas, no mediciones de efectos renderizados.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible. Los pesos externos referenciados incluyen un text encoder Qwen3-VL de 32B en nvfp4 AWQ y un UNet en int8 convrot, lo que sugiere requisitos elevados, pero no hay mediciones publicadas.
- GPU recomendadas: no disponible. No se aportan datos de compatibilidad con A100, H100, RTX 4090 ni otras GPU.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en ninguna GPU consumer.
- Opciones de despliegue: ComfyUI con nodos MiniMax H3 de condicionamiento/decodificacion, ComfyMathExpression, ResolutionSelector, switches y la implementacion de handoff de refinamiento. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Advertencia de importacion: la nota fuente senala que una extension de refinamiento ausente puede impedir la importacion o validacion incluso con el refinamiento desactivado; no se suministra una alternativa verificada de una sola etapa.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria, y el objeto publicado es un workflow de ComfyUI, no un modelo con parametros, contexto o benchmarks propios.

## Limitaciones y advertencias
- No es un modelo ni una release de pesos: es un paquete de workflow; los pesos y las entradas de imagen/audio seleccionadas no estan incluidos.
- El repositorio ocupa 0.0 GB, tiene 0 descargas y 0 likes, sin pipeline, licencia ni idiomas declarados en HuggingFace.
- Los nombres de fichero no deben usarse para inferir arquitectura, mecanica de cuantizacion, compatibilidad GPU ni derechos.
- La portada es arte promocional, no un resultado de video verificado ni una imagen de referencia incluida.
- Las nueve recetas son evaluaciones aritmeticas de expresiones con los interruptores manuales en falso; no describen todas las configuraciones manuales posibles.
- La tabla de presets no cubre configuraciones con controles manuales activos, que alteran las entradas de la formula.
- El modo principal tiene precedencia sobre el secundario; una configuracion incoherente puede producir una ruta distinta de la esperada.
- El loader de audio 109 esta guardado en modo 4 con seleccion None pese a su conexion al nodo de referencia; hay que revisar el manejo de audio antes de encolar.
- El prefijo de guardado conserva terminologia Veda, pero las rutas de aceleracion Turbo/Veda fueron eliminadas; no debe publicitarse como ruta de ocho pasos.
- Las duraciones de 124 y 243 fotogramas son presupuestos de fotogramas, no mediciones de fichero de salida.
- El refinamiento no equivale a 20 o 25 iteraciones adicionales ejecutadas completas; el scheduler de refinamiento almacena denoise 0.3.
- Los decodificadores de video y audio consumen el latente seleccionado; no hay evidencia de remux de audio fuente.
- Falta resolver nodos obligatorios y pesos compatibles exactos antes de encolar; selecciones de LoRA con peso cero no prueban que ficheros ausentes sean aceptados.
- No se incluyen pruebas de inferencia, rendimiento, memoria ni compatibilidad, por lo que no hay garantia de funcionamiento en produccion.
- Riesgo de sesgos y alucinacion del modelo subyacente: no disponible en la informacion proporcionada.
- Restricciones de licencia para uso comercial: no disponible.

## Enlaces
- HuggingFace: https://huggingface.co/AI-KSK/minimax-h3-action-director-9-presets-318
- Tutorial en YouTube: https://www.youtube.com/watch?v=t7pv8YAzpzY
- Tutorial en Bilibili: https://www.bilibili.com/video/BV1oFJ16BEH5
- RunningHub (internacional): https://www.runninghub.ai/post/2110642838903279617?inviteCode=rh-v1111
