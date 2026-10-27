# LiquidAI/LFM3-VL-2B-GGUF

## Resumen

LFM3-VL-2B-GGUF es la distribucion en formato GGUF del modelo vision-lenguaje LFM3-VL-2B de Liquid AI, publicada por el propio laboratorio para inferencia local en CPU y GPU mediante llama.cpp. El modelo original forma parte de la familia LFM3 y esta disenado para tareas image-text-to-text: recibe una imagen (y, en la version original, tambien video) junto con una instruccion en lenguaje natural y genera texto. Con 1.728.801.600 parametros reales en los pesos safetensors del modelo base, se comercializa como "2B" y esta pensado para despliegue en dispositivo (edge, portatil, movil) donde no hay GPU de datacenter.

Su relevancia ahora es doble: por un lado, Liquid AI ha anunciado LFM3 como su nueva generacion de modelos eficientes, con la variante VL enfocada en comprension visual y razonamiento paso a paso; por otro, esta publicacion lleva ese modelo a GGUF, el formato que permite ejecutarlo con llama.cpp en hardware modesto. El repositorio incluye una build Q4_0 especial obtenida mediante Quantization-Aware Distillation (QAD), entrenada explicitamente para recuperar la precision perdida por la cuantizacion a 4 bits, lo que baja el peso del modelo a aproximadamente 1 GB sin degradar tanto la calidad como una cuantizacion post-hoc.

La ficha del repositorio es, en la practica, un contenedor de cuantizaciones: la model card remite al modelo original para arquitectura y detalles de entrenamiento. El soporte en llama.cpp esta todavia en revision (PR ggml-org/llama.cpp#31252) y, en esa revision, sin entrada de video por el momento; por tanto, el uso en produccion de la variante GGUF hoy exige compilar desde esa rama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo vision-lenguaje de la familia LFM3; la model card remite al modelo base) |
| Parametros totales | 1.728.801.600 (~1,73B; comercializado como 2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_0 (incluye checkpoint QAD especifico: `LFM3-VL-2B-QAD-Q4_0.gguf`); el repositorio ofrece otras cuantizaciones seleccionables por tag, sin listado detallado |
| Idiomas soportados | 16: en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (etiquetada como `license: other`, `license_name: lfm1.0`) |
| Formato de pesos | GGUF (llama.cpp); pesos originales del modelo base en safetensors |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 15,6 GB (incluye multiples cuantizaciones y el proyector de vision) |
| Fecha de publicacion | 19 de octubre de 2026 (actualizado el 27 de octubre de 2026) |
| Descargas / likes | 83 descargas, 15 likes |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo: la model card de este repositorio GGUF es deliberadamente minimalista y remite a [LiquidAI/LFM3-VL-2B](https://huggingface.co/LiquidAI/LFM3-VL-2B) para arquitectura y detalles de uso. Lo que si se deduce de los artefactos publicados es la presencia de un proyector de vision que llama.cpp descarga automaticamente con el flag `-hf`, es decir, un encoder visual acoplado a un decodificador de lenguaje, con los tensores visuales empaquetados aparte del cuerpo del LLM.

El dato tecnico mas relevante del repositorio es el uso de Quantization-Aware Distillation en la build Q4_0: el checkpoint `LFM3-VL-2B-QAD-Q4_0.gguf` no es una cuantizacion post-entrenamiento al uso, sino un modelo destilado para operar en precision Q4_0 y recuperar la exactitud que se pierde al cuantizar. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO, aunque la presencia del flag `--no-reasoning-preserve` en los ejemplos de uso apunta a un modo de razonamiento explicito con tokens intermedios que el usuario puede decidir conservar o descartar del contexto.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text): descripcion de escenas, respuesta a preguntas visuales, extraccion de informacion de documentos y graficos.
- Comprension de video en el modelo original: el anuncio de LFM3-VL-2B menciona soporte de entrada de video; en la build GGUF y en la revision actual de llama.cpp (PR #31252) el video no esta soportado todavia.
- Razonamiento paso a paso: los ejemplos oficiales incluyen `--no-reasoning-preserve`, lo que implica un modo de razonamiento con trazas intermedias.
- Capacidades multilingues: 16 idiomas declarados, incluyendo espanol, arabe, chino, japones, coreano, hindi, ruso, tailandes, vietnamita e indonesio.
- Formato conversacional: la etiqueta `conversational` indica plantilla de chat multi-turno; los parametros recomendados son `temp 0.1`, `top-p 1.0`, `top-k 50`, `min-p 0.0`, `repeat-penalty 1.1`.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere despliegue en Hugging Face Inference Endpoints para el modelo base.
- Tool calling / function calling: no documentado en la informacion disponible.
- Audio: no soportado por esta variante (la capacidad omni-modal corresponde a LFM3-Omni-2B, otro modelo de la familia).

## Casos de uso

- Descripcion de imagenes en dispositivo: ejecucion con llama.cpp sobre portatil o mini-PC sin GPU dedicada, usando la build QAD Q4_0 (~1 GB de pesos) para generar texto alternativo accesible en catalogos de imagenes o aplicaciones de accesibilidad, con la ventaja de que ninguna imagen sale del dispositivo.
- Extraccion de datos de documentos: lectura de facturas, tickets y formularios escaneados enviando la imagen junto a una instruccion del tipo "extrae fecha, importe y proveedor en JSON", aprovechando el modo de razonamiento y la temperatura baja (0,1) recomendada para tareas deterministas.
- Asistencia visual en atencion al cliente: el usuario adjunta una captura de pantalla de un error o de un producto y el modelo responde en el idioma del cliente (16 idiomas cubiertos), integrado en un backend ligero que puede correr en la misma maquina que el resto del servicio.
- Inspeccion visual en entornos industriales o sanitarios: clasificacion y descripcion de imagenes de sensores o camaras en plantas donde no se permite enviar datos a la nube, desplegando el GGUF en un equipo local con llama.cpp o llama-cpp-python.
- Prototipado rapido de aplicaciones VLM: uso del playground y la API de Liquid AI para validar el comportamiento antes de mover la carga a local, gracias a que los pesos GGUF replican el mismo modelo con identica plantilla de chat.
- Traduccion y localizacion multimodal: traduccion de texto dentro de imagenes (carteles, menus, interfaces) a cualquiera de los 16 idiomas soportados, en una app movil o web que llama a un servidor llama.cpp.
- Educacion y asistencia a la accesibilidad: lectura comprensiva de diagramas y figuras para estudiantes, con respuestas paso a paso y capacidad de operar offline en equipos de bajo coste.
- Preprocesado de datasets: etiquetado y captioning masivo de imagenes en pipelines de datos antes de entrenar otros modelos, ejecutando el GGUF en lote sobre CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta variante GGUF no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de evaluacion visual, y las busquedas web realizadas solo aportan anuncios de la familia LFM3 sin cifras. Tampoco se documenta la degradacion concreta que introduce Q4_0 frente a los pesos originales, mas alla de la afirmacion del autor de que el checkpoint QAD fue entrenado para recuperar la precision perdida.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (calculo aritmetico a partir de 1,73B parametros, sin contar el proyector de vision ni el KV cache): ~3,5 GB en FP16, ~1,8 GB en Q8_0, ~1,0-1,1 GB en Q4_0. El repositorio ocupa 15,6 GB en total por acumular varias cuantizaciones y el proyector de vision.
- CPU: al ser un GGUF para llama.cpp, esta disenado explicitamente para inferencia en CPU; un equipo de escritorio moderno con AVX2 puede ejecutarlo en RAM.
- GPU consumer: cabe holgadamente en cualquier GPU con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 4090, Apple Silicon via Metal). En Q4_0 es viable incluso en iGPU con memoria unificada.
- GPU de datacenter: no es el objetivo del modelo; A100/H100 solo tendrian sentido para servir muchas instancias concurrentes, y en ese caso conviene partir del modelo base en safetensors.
- Opciones de despliegue: llama.cpp (`llama-cli -hf LiquidAI/LFM3-VL-2B-GGUF:Q4_0`), llama-cpp-python, y cualquier frontend compatible con GGUF. vLLM y TGI no estan confirmados para esta variante. El soporte oficial de LFM3-VL en llama.cpp esta en revision (PR #31252), por lo que hoy hace falta compilar esa rama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-GGUF (este) | ~1,73B | no disponible | imagen + texto (video en el modelo original) | lfm1.0 | GGUF en HF, llama.cpp en revision |
| LFM3-VL-2B (base) | ~1,73B | no disponible | imagen + video + texto | lfm1.0 | safetensors en HF |
| LFM3-Omni-2B | ~2B (no confirmado en detalle) | no disponible | texto, imagen, video y audio | no disponible | familia LFM3, anunciado |
| LFM3-1.7B | ~1,7B | no disponible | solo texto | no disponible | safetensors en HF |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones completas de las alternativas, por lo que la comparativa se limita a parametros, modalidades y licencia. Frente a la variante Omni de la misma familia, este modelo renuncia al audio y, en la build GGUF actual, tambien al video, a cambio de un peso menor y de una ruta de despliegue en CPU bien definida.

## Limitaciones y advertencias

- Soporte incompleto en llama.cpp: la integracion esta en revision (PR #31252) y sin entrada de video; no hay release estable que garantice el funcionamiento, por lo que el uso en produccion requiere compilar la rama y asumir cambios de API.
- Licencia lfm1.0: es una licencia propia de Liquid AI con condiciones adicionales (etiquetada como `license: other`). Antes de un uso comercial hay que leer el fichero LICENSE del repositorio; no es una licencia permisiva tipo Apache 2.0 ni MIT.
- Riesgo de alucinacion: como todo VLM de menos de 2B parametros, tiende a inventar detalles en imagenes con texto pequeno, tablas densas o graficos complejos; conviene validar salidas en tareas de extraccion de datos.
- Cuantizacion: la build Q4_0, incluso con QAD, sigue siendo una cuantizacion de 4 bits; la calidad en OCR fino y razonamiento visual puede diferir de los pesos originales, y el autor no publica la magnitud de esa diferencia.
- Cobertura idiomatica desigual: los 16 idiomas declarados no implican el mismo rendimiento en todos; el espanol esta soportado, pero no se aportan metricas por idioma.
- Ventana de contexto: no documentada en esta ficha; planificar prompts largos o muchas imagenes por sesion sin asumir una ventana grande.
- Funciones no confirmadas: no hay evidencia en la informacion disponible de soporte de tool calling, agentes multi-paso o salidas estructuradas garantizadas.
- Madurez del artefacto: 83 descargas y 15 likes en el momento de la consulta indican una publicacion muy reciente, con poca validacion de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Pull request de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31252
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Guia de despliegue en llama.cpp de Liquid AI: https://docs.liquid.ai/deployment/on-device/llama-cpp
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Consola / API: https://console.liquid.ai/dashboard
- Pagina de modelos de Liquid AI: https://www.liquid.ai/models
- Organizacion en Hugging Face: https://huggingface.co/LiquidAI
- Anuncio de LFM3 en X: https://x.com/liquidai/status/2115128329003303107
- Anuncio de LFM3-VL-2B y LFM3-Omni-2B en X: https://x.com/liquidai/status/2115128344769687701
- Hilo en r/LocalLLaMA: https://www.reddit.com/r/LocalLLaMA/comments/1xgy8s3/liquidailfm317b_hugging_face/
