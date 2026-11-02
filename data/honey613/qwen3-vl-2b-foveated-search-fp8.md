# honey613/qwen3-vl-2b-foveated-search-fp8

## Resumen

qwen3-vl-2b-foveated-search-fp8 es una version cuantizada en FP8 de un ajuste fino de Qwen3-VL-2B orientado a la busqueda visual de objetos mediante un patron de atencion "foveal": el modelo observa primero una miniatura de la imagen, emite un punto de interes en coordenadas normalizadas, confirma el objeto sobre un recorte nitido y, si es necesario, vuelve a mirar. El autor del ajuste es Keerthana Reddy Katasani (cuenta de HuggingFace honey613) y el modelo deriva del checkpoint base honey613/qwen3-vl-2b-foveated-search.

La relevancia de esta variante es practica: reduce el coste de inferencia sin degradar la precision. Segun los resultados del repositorio del proyecto, mantiene una precision de busqueda visual del 85,1 % frente al 85,6 % del BF16 (diferencia de -0,4 puntos porcentuales, IC 95 % emparejado [-2,0, +1,1]) sobre un benchmark de 450 consultas de COCO, y responde un 24 % mas rapido en una NVIDIA L4 (667 ms frente a 507 ms de mediana). El checkpoint pasa de 4,26 GB en BF16 a 2,85 GB.

Con 2.127.532.032 parametros, licencia Apache-2.0 y soporte directo en vLLM, es una opcion ligera para tareas de localizacion de objetos guiada por lenguaje en entornos con GPUs de gama media o con aceleracion FP8 nativa (Ada, Hopper). El modelo solo declara soporte de ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3-VL (vision tower + mergers vision-lenguaje + modelo de lenguaje); capas lineales del LM en FP8 |
| Parametros totales | 2.127.532.032 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de despliegue usa `--max-model-len 6144` |
| Tipos de cuantizacion | FP8_DYNAMIC (pesos FP8 con escalas por canal, activaciones FP8 con escalas dinamicas por token, sin datos de calibracion); vision tower, mergers y `lm_head` permanecen en BF16 (105 modulos) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen3-VL-2B, una arquitectura multimodal compuesta por un codificador visual (vision tower), modulos de fusion vision-lenguaje (mergers) y un modelo de lenguaje autorregresivo. La innovacion del ajuste no esta en la arquitectura sino en el procedimiento de busqueda: el modelo aprende a operar sobre una miniatura de baja resolucion para localizar candidatos con muy pocos tokens visuales y a validar despues sobre un recorte de alta resolucion, emulando el ciclo de fijacion y sacada de la vision humana.

La cuantizacion se realizo con llm-compressor en modo FP8_DYNAMIC: solo las capas lineales del modelo de lenguaje se convierten a FP8, mientras que el vision tower, los mergers y la cabeza de salida se mantienen en BF16. No se emplearon datos de calibracion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de ajuste fino ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto multimodal: responde a instrucciones en lenguaje natural sobre imagenes.
- Localizacion visual de objetos: emite coordenadas `point_2d` normalizadas en el rango 0-1000 relativas a la imagen, o la marca `{"absent": true}` si el objeto no aparece.
- Busqueda foveal multi-paso: mira una miniatura, apunta, confirma sobre un recorte nitido y vuelve a mirar si es necesario (logica implementada en el repositorio del proyecto).
- Salidas estructuradas: compatible con `structured_outputs` en vLLM para restringir la respuesta a un esquema JSON.
- Procesamiento de imagenes a resolucion nativa hasta 1920x1440 (con `longest_edge` 2764800 en el procesador multimodal).
- Idiomas: solo ingles.

## Casos de uso

- Busqueda de productos en catalogos fotograficos: el modelo localiza un articulo descrito en texto sobre una imagen de catalogo emitiendo un punto normalizado, lo que permite recortar y enlazar la ficha del producto sin procesar la imagen completa a alta resolucion.
- Anotacion semiautomatica de datasets de vision: dado un conjunto de imagenes y descripciones, genera puntos de interes en JSON que pueden usarse para preetiquetar bounding boxes o puntos clave, con un coste por imagen muy inferior al de un modelo que atiende el frame completo.
- Asistencia a personas con discapacidad visual: el ciclo miniatura-punto-recorte permite responder "donde esta X" en fotos de escenas cotidianas con latencia baja (0,58 s frente a 1,05 s en una foto de 1920x1440, segun el proyecto).
- Control de calidad en lineas de produccion: verificar la presencia o ausencia de un objeto concreto en capturas de camara industrial, usando la salida `absent` para descartes rapidos y el punto para inspeccion detallada.
- Automatizacion de tareas de interfaz grafica: localizar elementos visuales descritos en lenguaje natural sobre capturas de pantalla, aprovechando la salida estructurada para alimentar agentes de automatizacion.
- Moderacion de contenido visual: comprobar si aparece un objeto o categoria concreta en imagenes subidas por usuarios, con un coste de inferencia reducido gracias al uso de miniaturas y a la cuantizacion FP8.
- Prototipado en GPUs de gama media: al ocupar 2,93 GiB de pesos en vLLM, permite desplegar busqueda visual en tarjetas con aceleracion FP8 sin renunciar a la precision del modelo en BF16.

## Benchmarks y rendimiento

| Metrica | FP8 | BF16 (referencia) | Notas |
|---|---|---|---|
| Precision de busqueda visual (COCO, 450 consultas) | 85,1 % | 85,6 % | Diferencia de -0,4 pp; IC 95 % emparejado [-2,0, +1,1] |
| Precision mirando el frame completo (COCO) | no disponible | 94,2 % | El modo de frame completo sigue siendo mas preciso que el foveal |
| Tiempo mediano hasta la respuesta (NVIDIA L4, 1 peticion) | 507 ms | 667 ms | Mejora del 24 % |
| Peso de los pesos en vLLM | 2,93 GiB | 4,24 GiB | Reduccion por la cuantizacion FP8 |
| Busqueda en foto de 1920x1440 | 0,58 s | 1,05 s | Con 17,2x menos tokens visuales que el frame completo |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 2,93 GiB en vLLM; con cache KV y overhead del servidor, un despliegue practico requiere del orden de 6-8 GiB, aunque el valor exacto depende de la longitud de contexto y del numero de peticiones concurrentes.
- GPUs recomendadas: NVIDIA L4 (usada en las mediciones del proyecto), asi como GPUs Ada (RTX 4090, L40S) y Hopper (H100) con soporte nativo de FP8.
- GPUs consumer: cabe en tarjetas consumer con FP8 nativo, como la RTX 4090; en GPUs sin FP8 nativo el modelo puede cargarse pero perdera la ventaja de velocidad.
- Opciones de despliegue: vLLM (soporte directo, con los parametros `--max-model-len`, `--limit-mm-per-prompt` y `--mm-processor-kwargs` indicados en la model card); tambien es cargable con transformers al ser safetensors.
- Latencia y throughput: 507 ms de mediana por peticion en L4 con una peticion a la vez; 0,58 s para localizar un objeto en una foto de 1920x1440 mediante el ciclo foveal. No se dispone de datos de throughput con concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision busqueda visual | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-vl-2b-foveated-search-fp8 | 2,13 B | no disponible | 85,1 % (COCO, 450 consultas) | Apache-2.0 | HuggingFace, vLLM |
| qwen3-vl-2b-foveated-search (BF16) | 2,13 B | no disponible | 85,6 % (COCO, 450 consultas) | Apache-2.0 | HuggingFace |
| Qwen3-VL-2B (base, sin ajuste foveal) | 2 B (aproximado) | no disponible | no disponible | Apache-2.0 | HuggingFace |

No se dispone de datos de benchmarks comparables con otros modelos de localizacion visual en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; las consultas en castellano no estan cubiertas por la model card.
- El modo de busqueda foveal es menos preciso que mirar el frame completo: 85,6 % frente a 94,2 % en COCO. Para aplicaciones donde la precision es critica conviene evaluar ambos modos.
- La cuantizacion FP8 solo afecta al modelo de lenguaje; el vision tower y los mergers siguen en BF16, por lo que el ahorro de memoria es parcial.
- Requiere GPUs con FP8 nativo (Ada o Hopper) para aprovechar la aceleracion; en otras arquitecturas el rendimiento puede degradarse.
- Riesgo de alucinacion en las coordenadas: el modelo puede emitir un punto plausible para un objeto ausente si no se usa la restriccion de salida `absent` o un esquema JSON estricto.
- El checkpoint tiene 0 descargas y 1 like en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- No se han publicado datos sobre sesgos, composicion del dataset de ajuste ni evaluaciones de robustez fuera de COCO.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/honey613/qwen3-vl-2b-foveated-search-fp8
- Modelo base (BF16): https://huggingface.co/honey613/qwen3-vl-2b-foveated-search
- Repositorio del proyecto (codigo, resultados y bucle de busqueda): https://github.com/Keerthanareddy17/foveated-vlm-search
- Demo interactiva: https://keerthanareddy17.github.io/foveated-vlm-search/
- llm-compressor (herramienta de cuantizacion): https://github.com/vllm-project/llm-compressor
- vLLM (servidor de inferencia): https://github.com/vllm-project/vllm
