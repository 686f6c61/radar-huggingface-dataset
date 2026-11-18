# infosave/SenseNova-Loop-9B-cmf

## Resumen

SenseNova-Loop-9B-cmf es la distribucion cuantizada del modelo multimodal SenseNova-Loop-9B (publicado por SenseNova el 2026-11-17), empaquetada en formato CMF por el usuario infosave para `cortiq`, un motor de inferencia escrito en Rust que no depende de Python ni de frameworks de machine learning. El modelo base es un transformer con bucles (looped transformer) de 9B parametros que ejecuta 24 de sus 32 capas de decodificador dos veces, resultando en 56 pasadas de capa, y que mantiene dos flujos residuales (mHC) dentro del bucle. Combina atencion lineal y atencion completa, procesa imagenes y soporta 512K tokens de contexto mediante YaRN con factor 2.

La relevancia de esta ficha radica en que demuestra un camino de despliegue alternativo al ecosistema Python: inferencia nativa en Rust con backends CUDA, Vulkan/DX12, Metal y CPU, con cuantizaciones GPTQ de 4 bits (`q4tp`) y 8 bits (`q8_2f`), y con decodificacion especulativa mediante una cabeza MTP (multi-token prediction) incluida en los pesos. En una RTX A5000 de 24 GB alcanza 88 tok/s en generacion de codigo con drafts activos sobre CUDA, y mantiene 30,5 tok/s de decodificacion con prompts de 128 000 tokens.

El paquete incluye el codificador de vision en 16 bits, la cabeza MTP, el plan de bucle (capas 4-27 dos veces, cada pasada con su propia cache), los routers mHC en float32 y el procesador de imagenes. La licencia es Apache 2.0 y los idiomas declarados son ingles, ruso y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer con atencion mixta (lineal + completa), doble flujo residual (mHC) y cabeza MTP |
| Parametros totales | 9B (modelo base SenseNova-Loop-9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512K tokens (modelo base); YaRN factor 2 aplicado a toda longitud |
| Tipos de cuantizacion | `q4tp` (4 bits, GPTQ), `q8_2f` (8 bits); vision encoder en 16 bits; routers mHC en float32 |
| Idiomas soportados | en, ru, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (un fichero por cuantizacion: `sensenova-loop-9b-q4tp.cmf`, `sensenova-loop-9b-q8_2f.cmf`) |

## Arquitectura y entrenamiento

El modelo base es un transformer con bucles: de las 32 capas del decodificador, 24 (capas 4 a 27) se ejecutan dos veces, dando 56 pasadas de capa en total, y cada pasada mantiene su propia cache. Dentro del bucle conviven dos flujos residuales gestionados por routers mHC (multi-hyper-connection) que se conservan en float32 tal como los publica el release original. La atencion mezcla capas lineales y capas de atencion completa, lo que reduce el coste cuadratico en contextos largos. El modelo incorpora una cabeza MTP (multi-token prediction) que actua como modelo borrador para decodificacion especulativa verificada en un solo lote.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. Si se documenta que el release original aplica YaRN con factor 2 en todas las longitudes y que los ficheros CMF replican ese comportamiento. Las perplexidades reportadas en wikitext-2 (primeros 2048 tokens) son 11,90 para Transformers en float32, 11,78 para `q8_2f` y 12,95 para `q4tp`; en texto de chat de 4096 tokens, 1,848 para `q8_2f` y 1,942 para `q4tp`.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento (thinking) activable o desactivable mediante `--no-think`.
- Generacion de codigo, con rendimiento medido especificamente en prompts de programacion.
- Comprension de imagenes: pipeline `image-text-to-text`, con soporte de rutas locales, data URLs y URLs HTTP(S) en el CLI, y posibilidad de pasar varias imagenes.
- Decodificacion especulativa mediante cabeza MTP incluida en los pesos, con tasas de aceptacion de drafts del 30-52 % en codigo sobre CUDA.
- Procesamiento de contexto largo: hasta 512K tokens en el modelo base, con rendimiento medido hasta 128 000 tokens en esta distribucion.
- Capacidades multilingues en ingles, ruso y chino.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso en la informacion disponible.

## Casos de uso

- Generacion de codigo interactiva en estacion de trabajo: con `q4tp` sobre CUDA en una RTX A5000 se obtienen 88,1 tok/s con drafts en prompts de programacion, suficiente para autocompletado y refactorizacion en editor sin salir de la GPU local.
- Analisis de documentos largos con imagen: la ventana de 512K tokens y el codificador de vision permiten pasar un informe escaneado o un diagrama junto a un prompt extenso; a 32 000 tokens el primer token llega en 22,6 s y la decodificacion se mantiene en 43,5 tok/s.
- Despliegue en hardware no NVIDIA: el backend Vulkan 1.3 o DX12 permite ejecutar el modelo en GPUs AMD e Intel con 4,8 GB de memoria de tarjeta en `q4tp`, util para equipos heterogeneos en laboratorio.
- Inferencia en Apple silicon: el backend Metal permite ejecutar los mismos ficheros CMF en Macs sin dependencias adicionales, adecuado para prototipado local.
- Procesamiento por lotes de descripcion de imagenes: el pipeline `image-text-to-text` con soporte de multiples `--image` sirve para etiquetar o describir catalogos de imagenes en un pipeline Rust.
- Servicio de traduccion y redaccion en en/ru/zh: los tres idiomas declarados cubren documentacion tecnica trilingue, con contexto largo para mantener coherencia entre secciones.
- Evaluacion de tecnicas de decodificacion especulativa: la cabeza MTP y las metricas de aceptacion publicadas (30-52 % en codigo, 19-40 % en preguntas generales sobre CUDA) permiten reproducir y comparar estrategias de drafting.

## Benchmarks y rendimiento

Rendimiento de inferencia medido en RTX A5000 (24 GB) con `cortiq run --greedy --no-think`, 256 tokens generados, cuatro prompts por categoria:

| Backend | Tipo de prompt | Con drafts (tok/s) | Sin drafts (tok/s) | Drafts aceptados |
|---|---|---:|---:|---:|
| CUDA | codigo | 88,1 (74,4-98,9) | 51,0 | 30-52 % |
| CUDA | preguntas generales | 57,9 (52,7-62,4) | 49,8 | 19-40 % |
| Vulkan | codigo | 39,7 (32,9-47,3) | 34,2 | 35-58 % |
| Vulkan | preguntas generales | 33,5 (30,4-37,1) | 33,0 | 32-40 % |

Escalado con la longitud del prompt (`cortiq bench --core`, sin drafts, 128 tokens de salida, `q4tp`, CUDA):

| Prompt (tokens) | Primer token (s) | Decodificacion (tok/s) | Memoria pico (GB) |
|---:|---:|---:|---:|
| 1 000 | 1,5 | 51,9 | 7,8 |
| 4 000 | 2,3 | 50,4 | 8,0 |
| 16 000 | 10,1 | 47,1 | 8,9 |
| 32 000 | 22,6 | 43,5 | 10,0 |
| 64 000 | 53,0 | 38,1 | 12,2 |
| 128 000 | 141,9 | 30,5 | 16,5 |

`q8_2f` sobre CUDA: 34,0 / 33,7 / 32,1 tok/s y 9,1 / 9,3 / 10,1 GB con prompts de 1 000 / 4 000 / 16 000 tokens.

Perplexidad:

| Configuracion | wikitext-2 (2048 tokens) | Chat (4096 tokens) |
|---|---:|---:|
| Transformers float32 | 11,90 | no disponible |
| `q8_2f` | 11,78 | 1,848 |
| `q4tp` | 12,95 | 1,942 |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Memoria de tarjeta en prompts cortos: 7,8 GB (`q4tp`) y 9,1 GB (`q8_2f`) sobre CUDA en RTX A5000; 4,8 GB y 8,2 GB respectivamente sobre Vulkan.
- Memoria pico con contexto largo (`q4tp`, CUDA): 10,0 GB a 32K tokens, 12,2 GB a 64K y 16,5 GB a 128K. Por encima de 64K tokens el autor recomienda el fichero Turbo para contener memoria y velocidad.
- GPU recomendadas: NVIDIA RTX A5000 (medida de referencia); cualquier GPU NVIDIA con driver CUDA 12.x que exponga `libnvrtc` y `libcublas` en tiempo de ejecucion; GPUs AMD e Intel con Vulkan 1.3 o DX12; Apple silicon via Metal.
- Cabe en GPUs de consumo con al menos 8-10 GB de VRAM en `q4tp` para contextos moderados; `q8_2f` requiere aproximadamente 1,3 GB adicionales.
- Opciones de despliegue: motor `cortiq` (CLI `cortiq-cli`), instalable via `cargo install --git https://github.com/infosave2007/cmf --branch sensenova-loop9b`. Compilacion con `--features cuda` para CUDA; features por defecto para Vulkan/DX12 y Metal. Requiere la version de cortiq posterior a 0.9.4; la 0.9.4 lee los ficheros y produce el mismo texto pero ejecuta operacion por operacion en GPU.
- En Linux headless con Vulkan hacen falta `libvulkan1 libglvnd0 libegl1 libgl1 libglx0` y `XDG_RUNTIME_DIR=/tmp`.
- Throughput medido: 88,1 tok/s en codigo con drafts sobre CUDA; 51,0 tok/s sin drafts; 30,5 tok/s a 128K tokens de contexto. La latencia de primer token va de 1,5 s (1K) a 141,9 s (128K).
- Variables de entorno relevantes: `CMF_GPU=cuda` para seleccionar backend, `CMF_MTP=0` para desactivar la cabeza de drafts.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato / motor |
|---|---:|---:|---|---|---|
| SenseNova-Loop-9B-cmf (esta ficha) | 9B | 512K | texto + imagen | Apache 2.0 | CMF / cortiq |
| SenseNova-Loop-9B (base) | 9B | 512K | texto + imagen | Apache 2.0 | safetensors / Transformers |
| SenseNova-Loop-9B-Turbo-cmf | 9B | 512K | texto + imagen | Apache 2.0 | CMF / cortiq (optimizado para contexto largo) |

No se dispone en la informacion proporcionada de datos de benchmarks comparativos frente a modelos de otros desarrolladores con el mismo tamano o la misma tarea, por lo que la comparativa se limita a las variantes del propio modelo base.

## Limitaciones y advertencias

- Solo se declaran tres idiomas (en, ru, zh); el rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Riesgo de alucinacion inherente a los modelos generativos; el modo de pensamiento consume tokens de `--max-tokens`, lo que puede truncar respuestas si no se ajusta el limite.
- La decodificacion especulativa no garantiza texto identico entre backends: sobre Vulkan, cuatro de ocho respuestas se separaron del texto greedy plano en empates cercanos, porque el lote que verifica los drafts redondea de forma distinta al grafo de un token. Sobre CUDA el texto es identico con y sin drafts.
- El modelo base aplica YaRN factor 2 en todas las longitudes, lo que puede afectar a la calidad en contextos cortos frente a un escalado selectivo.
- Dependencia de un motor de inferencia especifico (`cortiq`) y de una version posterior a 0.9.4; la 0.9.4 funciona pero sin aceleracion por GPU por operacion.
- La cuantizacion `q4tp` degrada la perplexidad respecto al float32 (12,95 frente a 11,90 en wikitext-2); para maxima fidelidad debe usarse `q8_2f`.
- No se documenta soporte de tool calling ni de flujos agenticos, lo que limita su uso en pipelines que dependan de function calling.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-18, un dia despues del modelo base; se trata de una distribucion de terceros, no oficial de SenseNova.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la cuantizacion no ofrece garantias sobre la fidelidad de los pesos convertidos.

## Enlaces

- Repositorio Hugging Face de esta distribucion: https://huggingface.co/infosave/SenseNova-Loop-9B-cmf
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Variante Turbo para contexto largo: https://huggingface.co/infosave/SenseNova-Loop-9B-Turbo-cmf
- Motor de inferencia cortiq / formato CMF: https://github.com/infosave2007/cmf
- Grafico de drafts sobre CUDA: https://huggingface.co/infosave/SenseNova-Loop-9B-cmf/resolve/main/assets/drafts_cuda_en.png
- Grafico de drafts sobre Vulkan: https://huggingface.co/infosave
