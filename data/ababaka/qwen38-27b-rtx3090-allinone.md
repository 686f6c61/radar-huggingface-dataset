# ababaka/qwen38-27b-rtx3090-allinone

## Resumen

`ababaka/qwen38-27b-rtx3090-allinone` es un paquete autocontenido publicado en HuggingFace por el usuario `ababaka`, pensado para ejecutar un modelo denominado Qwen3.8-27B en una única GPU RTX 3090 de 24 GB. No se trata solo de pesos: el repositorio (15,8 GB) incluye los pesos cuantizados W4A16-AutoRound, un runtime de vLLM 0.27.1 con ocho parches, perfiles de arranque y un `Dockerfile`, de modo que el autor garantiza que el paquete sigue siendo funcional aunque desaparezcan repositorios de terceros de los que dependa.

El problema que resuelve es de despliegue: sirve una API compatible con OpenAI en `http://127.0.0.1:18020/v1` con un solo comando (`./install.sh long`), ofreciendo tres perfiles preajustados para esa tarjeta concreta (contexto rápido de 64k, contexto largo de 160k y un perfil multimodal de ~120k con soporte de imágenes). Según las mediciones del autor, el perfil largo alcanza 863 tok/s de prefill con 145k tokens llenos y 74 tok/s de decodificación, con una puntuación GSM8K (n=200) de 0,945–0,960.

La relevancia del repositorio es acotada pero clara: demuestra una receta reproducible de cuantización de 4 bits con activaciones de 16 bits y decodificación especulativa MTP sobre hardware de consumo, un escenario muy habitual para desarrolladores e investigadores sin acceso a clústeres. La ficha del repositorio no declara licencia, idiomas soportados ni pipeline, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que debe tratarse como material experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La documentación describe un decodificador de lenguaje con encoder visual asociado (perfil `vision`), pero no especifica si se trata de un transformer denso, un MoE o una arquitectura híbrida |
| Parametros totales | 27B segun la denominacion del repositorio (no confirmado en la model card) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 160k tokens en el perfil `long` (por defecto); 64k en `fast`; ~120k en `vision`; existe un perfil `huge` de 200k excluido deliberadamente del paquete |
| Tipos de cuantizacion | Pesos W4A16 (AutoRound, formato compressed-tensors); ruta Marlin con activaciones int8 en las capas MLP si se define `INT8_ACT` (por defecto vacío, W4A16 puro). Cache KV en bf16 (`fast`) o fp8 (`long`, `vision`) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (etiqueta del repositorio); ruta `models/Qwen3.8-27B-W4A16-AutoRound-fast`. No se menciona GGUF |

Otros datos del repositorio: tamano de 15,8 GB, 0 descargas, 0 likes, creado y actualizado el 2026-09-13.

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base (numero de capas, tipo de atencion, si hay mezcla de expertos, composicion del dataset de entrenamiento, numero de tokens ni si hubo RLHF o DPO). Lo unico deducible de la model card es que existe un componente de lenguaje y un encoder visual: el perfil `vision` invoca `start_qwen_max160k_vl.sh` y acepta bloques `image_url` de la API de OpenAI (hasta cuatro imagenes por prompt), mientras que el perfil de texto usa `--language-model-only`. El autor advierte que el borrador de MTP no dispone de procesador multimodal, de modo que al activar decodificacion especulativa el servidor cae silenciosamente a modo solo texto.

La innovacion tecnica documentada esta en el plano del despliegue mas que en el del entrenamiento: cuantizacion W4A16 generada con AutoRound y almacenada en formato compressed-tensors, ejecucion sobre la ruta Marlin con posibilidad de activaciones int8 en las MLP, decodificacion especulativa basada en prediccion multi-token (MTP) con k=4 en el perfil rapido y k=3 en el perfil largo, y una cache KV en fp8 para reducir el consumo al ampliar contexto. El paquete fija CUDA 13.0, Python 3.12, torch 2.13.0, transformers 5.15.0, flashinfer 0.6.16 y vLLM 0.27.1 con ocho parches propios. La puntuacion GSM8K varia dentro del ruido (±0,014) segun la plantilla de chat utilizada (stock, froggeric o Sharp), y las respuestas de Sharp son aproximadamente un 30% mas cortas con la misma puntuacion.

## Capacidades

- Generacion de texto y razonamiento en el perfil de solo lenguaje (`--language-model-only`), con ventanas de hasta 160k tokens.
- Razonamiento aritmetico de varios pasos: la model card reporta 0,945-0,965 en GSM8K (n=200) segun perfil, sin desglose por categoria.
- Procesamiento de imagenes en el perfil `vision`: entrada mediante bloques `image_url`, hasta cuatro imagenes por prompt. La unica validacion publicada es funcional (lectura de texto y conteo de objetos en una imagen de prueba), no una bateria de benchmarks multimodales.
- Decodificacion especulativa MTP (k=4 o k=3) para aumentar el throughput en los perfiles de texto.
- Servicio de inferencia con API compatible con OpenAI (`/v1`) mediante vLLM, lo que habilita clientes estandar.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado como capacidad especifica; el limite practico lo marca la ventana de contexto.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades adicionales (audio, thinking mode explicito, etc.): no disponibles en la informacion proporcionada.

## Casos de uso

- Servidor de inferencia local para un desarrollador individual: el paquete arranca con `./install.sh long` y expone una API compatible con OpenAI en `127.0.0.1:18020`, de modo que cualquier cliente que ya hable ese protocolo funciona sin cambios. Es el escenario para el que esta disenado el repositorio.
- Analisis de documentos largos: el perfil `long` permite llenar 145k tokens manteniendo 863 tok/s de prefill, por lo que resumir o extraer datos de contratos, informes o expedientes extensos es viable en una sola pasada, sin troceado ni recuperacion externa.
- Recuperacion aumentada (RAG) con contexto amplio: los 160k tokens admiten inyectar decenas de fragmentos recuperados por consulta, reduciendo la perdida de informacion tipica de pipelines con ventanas cortas; el coste de prefill medido (863 tok/s con contexto lleno) da una referencia para dimensionar el numero de fragmentos.
- Procesamiento por lotes en local: vLLM gestiona batching continuo, y el throughput medido (86-98 tok/s de decodificacion en `fast`) sirve para estimar el tiempo de tareas de clasificacion, extraccion o generacion masiva que se ejecuten de noche en una unica RTX 3090.
- Extraccion de informacion de capturas, diagramas o documentos escaneados: el perfil `vision` acepta hasta cuatro imagenes por prompt y, segun la comprobacion funcional del autor, lee texto y cuenta objetos. Adecuado para prototipos de digitalizacion de formularios o capturas de interfaz.
- Asistente de programacion en local: con 64k de contexto en el perfil `fast` y plantillas de chat configurables, puede mantenerse como copiloto sobre repositorios medianos sin enviar codigo a servicios externos. Conviene verificar antes el soporte de tool calling, que no esta documentado.
- Laboratorio de evaluacion de cuantizacion: el repositorio permite reproducir la comparativa W4A16 con y sin activaciones int8 en las MLP, y medir el efecto de la decodificacion especulativa y de la cache KV en fp8 sobre la calidad (GSM8K) y la velocidad, usando el mismo hardware de referencia.

## Benchmarks y rendimiento

Los unicos datos publicados son los que el autor incluye en la model card, medidos sobre una RTX 3090 con contexto lleno y decodificacion voraz (greedy). No se han publicado resultados comparativos con otros modelos en la informacion disponible.

| Perfil | Contexto | Prefill | Decode | GSM8K (n=200) |
|---|---|---|---|---|
| `fast` | 64k (65k llenos en la medicion) | 1282 tok/s | 86-98 tok/s | 0,955-0,965 |
| `long` | 160k (145k llenos en la medicion) | 863 tok/s | 74 tok/s | 0,945-0,960 |
| `vision` | ~120k | No disponible | Mas lento (sin MTP) | Comprobacion funcional: lee texto y cuenta objetos |

Notas: la dispersion de GSM8K entre las plantillas stock, froggeric y Sharp esta dentro del ruido (±0,014). En el perfil `vision`, el encoder visual consume el pool de cache KV: 160k tokens no arranca y 120k si, segun validacion del autor. No hay datos de MMLU, HumanEval ni de benchmarks multimodales.

## Requisitos de hardware

- GPU: RTX 3090 de 24 GB. Los perfiles estan ajustados explicitamente para esa tarjeta; no se documenta validacion en otras GPU (incluidas las de 24 GB como la RTX 4090, que requeriria verificar los parches y la version de flashinfer).
- VRAM: los pesos ocupan 15 GB en W4A16, dejando el resto para cache KV (bf16 o fp8) y buffers de activaciones. El contexto maximo depende de ello: 160k con KV en fp8, 120k cuando se anade el encoder visual.
- Disco: aproximadamente 40 GB libres (imagen Docker ~15 GB mas pesos de 15 GB).
- Entorno: driver NVIDIA mas `nvidia-container-toolkit` y Docker. No hay soporte documentado para CPU, Apple Silicon o GPU AMD.
- Stack de software: CUDA 13.0, Python 3.12, torch 2.13.0, transformers 5.15.0, flashinfer 0.6.16, vLLM 0.27.1 con ocho parches incluidos en `patches/`.
- Opciones de despliegue: exclusivamente vLLM dentro de contenedor segun la documentacion. No se mencionan llama.cpp, Ollama, TGI, SGLang ni formatos GGUF.
- Rendimiento y latencia: prefill de 1282 tok/s (64k) y 863 tok/s (145k); decodificacion de 86-98 tok/s en `fast` y 74 tok/s en `long`. El perfil `vision` es mas lento al no usar MTP.
- Perfil de 200k (`KVarN/huge`): excluido del paquete, mantenido en un arbol experimental separado segun la model card.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada: la busqueda web no devolvio resultados relevantes (unicamente paginas generales de Google) y la model card no incluye comparaciones con otras alternativas. No es posible, por tanto, contrastar parametros, contexto, rendimiento ni licencia frente a otros modelos de la misma categoria.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ababaka/qwen38-27b-rtx3090-allinone` | 27B (segun denominacion) | 64k / 160k / ~120k segun perfil | GSM8K 0,945-0,965; 74-98 tok/s de decodificacion en RTX 3090 | No disponible | Publico en HuggingFace, 0 descargas |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin terminos explicitos, no hay autorizacion clara para uso comercial ni para redistribucion. Es un bloqueante para cualquier despliegue en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion independiente de los resultados publicados.
- Los datos de rendimiento y de GSM8K son autodeclarados por el autor, sobre una unica GPU y un unico conjunto de evaluacion (GSM8K n=200, greedy). No hay evaluacion de MMLU, HumanEval ni de calidad multimodal.
- Riesgo de alucinacion: no se documentan evaluaciones de veracidad, fidelidad ni tasas de error; solo se reporta una tarea aritmetica.
- Idiomas soportados no declarados: se desconoce el comportamiento real en castellano y en otros idiomas distintos del ingles.
- Sesgos: no hay informacion sobre los datos de entrenamiento del modelo base ni sobre analisis de sesgo.
- Cobertura de contexto: el maximo documentado y validado es 160k tokens; el encoder visual obliga a bajar a 120k, y un contexto de 160k con vision no llega a arrancar. El perfil de 200k queda fuera del paquete.
- Multimodalidad poco validada: el perfil `vision` solo se ha comprobado de forma funcional (lectura de texto y conteo de objetos) y pierde la decodificacion especulativa, con menor velocidad.
- Fragilidad del stack: el paquete depende de vLLM 0.27.1 mas ocho parches y de versiones muy concretas de CUDA, torch y flashinfer. Cualquier actualizacion de esas dependencias puede romper la receta.
- Soporte de tool calling y de flujos de agente no documentado: no debe asumirse su funcionamiento sin pruebas previas.
- Dependencia de hardware: requiere NVIDIA con `nvidia-container-toolkit` y Docker; no hay alternativa documentada para CPU ni para GPU de otros fabricantes.
- Sensibilidad a la plantilla de chat: la longitud de las respuestas y la puntuacion de GSM8K varian segun la plantilla empleada, lo que exige fijar una plantilla concreta para comparar resultados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ababaka/qwen38-27b-rtx3090-allinone
- La busqueda web realizada no devolvio enlaces relevantes sobre el modelo (unicamente paginas generales de Google: buscador, Google Earth, Google Translate, Google Imagenes y Google Trends). No se han localizado papers, blogs, repositorios de codigo ni demos asociados en la informacion disponible.
