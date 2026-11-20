# infosave/SenseNova-Loop-9B-Preview-cmf

## Resumen

SenseNova-Loop-9B-Preview-cmf es la distribucion cuantizada del modelo multimodal SenseNova-Loop-9B-Preview, publicada por el usuario infosave en formato CMF (un contenedor propio del motor de inferencia cortiq, escrito en Rust). El modelo base, desarrollado por sensenova, es un transformer multimodal de aproximadamente 9.000 millones de parametros cuyo decodificador ejecuta dos veces un bloque de 24 capas con pesos compartidos, de modo que cada token atraviesa 56 ejecuciones de capa a partir de 32 capas fisicas. Incorpora dos flujos residuales con manifold-constrained hyper-connections (mHC) dentro del bucle, atencion hibrida (lineal y completa) y un codificador de vision que procesa imagenes a resolucion nativa.

La relevancia de esta publicacion no esta en el modelo en si, sino en el empaquetado: los ficheros CMF permiten ejecutar el modelo con cortiq, un motor sin Python ni frameworks de ML, sobre GPUs NVIDIA (CUDA o Vulkan), AMD e Intel (Vulkan/DX12), Apple Silicon (Metal) y CPU. Se ofrecen dos variantes: `q4tp` (lenguaje en 4 bits, vision en 16 bits, 5,62 GB) y `q8_2f` (lenguaje en 8 bits, vision en 16 bits, 9,92 GB), con perplejidad en wikitext-2 de 13,20 y 13,44 respectivamente.

El modelo soporta ingles, chino y ruso, licencia Apache-2.0, y una ventana de contexto no especificada en la informacion disponible. Su interes practico es llevar un modelo multimodal de 9B con atencion hibrida y bucle de capas a hardware de consumo y a plataformas sin soporte CUDA, con un rendimiento medido de 52,4 tok/s de decodificacion en una RTX A5000.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con decodificador de bucle (looped transformer): bloque de 24 capas ejecutado dos veces con pesos compartidos, 56 ejecuciones de capa sobre 32 capas fisicas; atencion hibrida lineal/completa; mHC (manifold-constrained hyper-connections) con dos flujos residuales; codificador de vision a resolucion nativa |
| Parametros totales | Aproximadamente 9.000 millones (segun el nombre del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | `q4tp` (lenguaje 4 bits, vision 16 bits) y `q8_2f` (lenguaje 8 bits, vision 16 bits); routers mHC en float32; vision encoder ejecutado en float32 |
| Idiomas soportados | Ingles, chino, ruso |
| Licencia | Apache-2.0 |
| Formato de pesos | CMF (contenedor propio de cortiq); el modelo base original esta en safetensors |

## Arquitectura y entrenamiento

El decodificador es un transformer con una innovacion estructural central: un bloque de 24 capas que se ejecuta dos veces con los mismos pesos, de forma que cada token pasa por 56 ejecuciones de capa partiendo de 32 capas fisicas. Dentro del bucle se mantienen dos flujos residuales gestionados mediante manifold-constrained hyper-connections (mHC), con routers que se conservan en float32 tal como los publica el autor original. La atencion es hibrida, combinando mecanismos lineales y completos. El codificador de vision procesa imagenes a resolucion nativa, con parches de 16x16 fusionados 2x2 en un token, y admite hasta 16,7 millones de pixeles.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La model card de esta distribucion se limita a describir el proceso de conversion y cuantizacion realizado con cortiq (`cortiq convert --model sensenova/SenseNova-Loop-9B-Preview --quant q4tp`), que preserva el plan de bucle (capas 4-27 dos veces, cada pasada con su propia cache), los routers mHC y el procesador de imagenes dentro del fichero CMF.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento (thinking) activado por defecto; `--no-think` lo desactiva y los tokens de pensamiento cuentan para `--max-tokens`.
- Comprension de imagenes y texto (pipeline image-text-to-text): descripcion de imagenes, lectura de graficos, comparacion entre varias imagenes.
- Entrada de multiples imagenes en una misma peticion (`--image` repetible, con rutas locales, data URLs o URLs HTTP(S)).
- Procesamiento de imagenes a resolucion nativa, con control del limite de pixeles mediante `--image-max-pixels`.
- Generacion de codigo (el ejemplo de la model card incluye la escritura de una funcion Python para fusionar listas ordenadas).
- Soporte multilingue en ingles, chino y ruso.
- Servidor compatible con la API de OpenAI (`cortiq serve`) con partes `image_url`.
- Muestreo configurable: temperatura 1.0 y top-p 0.95 por defecto, o decodificacion greedy con `--greedy`.

## Casos de uso

- Descripcion y etiquetado automatico de imagenes en pipelines de gestion de activos digitales: el modelo acepta rutas o URLs y procesa la imagen a resolucion nativa, util para generar metadatos en lote sin depender de CUDA.
- Lectura de graficos y capturas de pantalla: la model card demuestra la lectura de valores de un grafico (`--image chart.png --prompt "Read the values of the chart."`) y el procesamiento de una captura de 2206x1048 en 5,9 s sobre una A40, adecuado para extraccion de datos de dashboards.
- Comparacion de imagenes en control de calidad o monitorizacion de cambios: la entrada multiple (`--image a.png --image b.png`) permite preguntar que ha cambiado entre dos capturas, aplicable a diffs visuales en CI o auditoria de interfaces.
- Asistencia a la programacion en entornos sin Python: al ejecutarse con cortiq sobre Metal, Vulkan o CPU, puede integrarse en flujos de desarrollo en macOS o en estaciones sin GPU NVIDIA para generar y revisar codigo.
- Despliegue en hardware de consumo: con unos 8 GB de VRAM para `q4tp`, cabe en GPUs de gama media y en Apple Silicon con 16 GB de memoria unificada, lo que permite prototipado local de asistentes multimodales.
- Servicio de inferencia compatible con OpenAI: `cortiq serve --port 8080` expone el modelo con partes `image_url`, de modo que aplicaciones existentes que usan el cliente de OpenAI pueden apuntar al endpoint sin cambios de codigo.
- Procesamiento por lotes en CPU: con `CMF_GPU=0` el modelo funciona sin GPU, util para tareas offline donde la latencia no es critica.

## Benchmarks y rendimiento

Rendimiento de inferencia medido por el autor (cortiq bench):

| Hardware | Fichero | Decodificacion (tok/s) | Prefill | Notas |
|---|---|---:|---|---|
| RTX A5000 (24 GB), CUDA, cortiq 0.8.96 | `q4tp` | 52,4 | 1818 tok/s en prompt de 4096 tokens; primer token 2,25 s | 50,8 tok/s tras el prompt largo |
| NVIDIA A40 (48 GB), Vulkan, cortiq 0.8.51 | `q4tp` | 29,1 | 338 tok/s en prompt de 2k | 27,8 tok/s a 2k |
| NVIDIA A40 (48 GB), Vulkan, cortiq 0.8.51 | `q8_2f` | 21,3 | 293 tok/s en prompt de 2k | 20,8 tok/s a 2k |
| Apple M4, Metal | `q4tp` | 11,1 | 80 tok/s en prompt de 512 tokens | Vision encoder: 1,2 s para 512x512 |

Calidad de cuantizacion (perplejidad en los primeros 2048 tokens de wikitext-2):

| Fichero | Perplejidad | Equivalencia con el original (greedy) |
|---|---:|---|
| `q4tp` | 13,20 | No (mismo contenido, otras palabras) |
| `q8_2f` | 13,44 | Si, en las tres pruebas |

El autor no publica resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: `q4tp` necesita unos 8 GB de memoria de GPU; `q8_2f` unos 12 GB.
- GPUs NVIDIA: soporte CUDA (probado en RTX A5000 y A40) y Vulkan; compilacion con `cargo install cortiq-cli --features cuda` para el backend CUDA.
- GPUs AMD e Intel: mediante Vulkan o DX12.
- Apple Silicon: Metal por defecto; se requieren 16 GB de memoria unificada para `q4tp`.
- CPU: modo solo CPU con `CMF_GPU=0`.
- Cabe en GPUs de consumo: si, con `q4tp` en tarjetas de 8 GB o mas (la model card no enumera modelos concretos de consumo).
- Despliegue: motor cortiq (CLI `cortiq run` y servidor `cortiq serve` compatible con OpenAI); requiere cortiq 0.8.51 o superior, con binarios precompilados para Linux, macOS y Windows. En Linux headless con Vulkan hay que instalar `libvulkan1 libglvnd0 libegl1 libgl1 libglx0` y definir `XDG_RUNTIME_DIR=/tmp`.
- Latencia y throughput: ver tabla de benchmarks; el vision encoder tarda 5,9 s para una captura de 2206x1048 (9108 parches, 2277 tokens de lenguaje) en una A40, y 1,9 s hasta el primer token para una imagen de 512x512 con `cortiq serve`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato / motor |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-Preview-cmf (`q4tp`) | ~9B | No disponible | Si (imagen-texto) | Apache-2.0 | CMF / cortiq |
| SenseNova-Loop-9B-Preview (original) | ~9B | No disponible | Si (imagen-texto) | Apache-2.0 | Safetensors / Transformers |
| Alternativas de ~9B multimodales | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoria, por lo que no es posible establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; al entrenarse con datos web en ingles, chino y ruso, es previsible que herede sesgos de esas fuentes, pero no hay evaluacion publicada en la informacion disponible.
- Riesgo de alucinacion no cuantificado: no se publican evaluaciones de fidelidad ni de tasas de error en tareas de vision o texto.
- El modo de pensamiento esta activado por defecto y consume tokens de `--max-tokens`; en produccion conviene usar `--no-think` o ajustar el limite para controlar latencia y coste.
- Idiomas limitados a ingles, chino y ruso; no hay soporte declarado de castellano, lo que degradara la calidad en ese idioma.
- La longitud de contexto no esta especificada; el rendimiento de prefill medido se limita a prompts de 4096 tokens.
- La cuantizacion `q4tp` no reproduce la salida greedy del modelo original (mismo contenido, palabras distintas); para paridad estricta debe usarse `q8_2f`.
- Dependencia de un motor poco comun (cortiq, en Rust) y de un formato propietario (CMF): no es compatible con vLLM, llama.cpp, Ollama ni TGI, lo que limita la integracion en stacks existentes.
- El vision encoder se ejecuta en float32 y conserva 16 bits, por lo que el ahorro de memoria de la cuantizacion afecta solo al modelo de lenguaje.
- Licencia Apache-2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base original antes de desplegar en produccion.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/infosave/SenseNova-Loop-9B-Preview-cmf
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Repositorio del formato CMF y del motor cortiq: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
- Scripts de referencia y paridad: https://github.com/infosave2007/cmf/tree/master/scripts/four
