# ryugyosoft/ACE-Step-1.5-XL-onwx-music

## Resumen

ACE-Step-1.5-XL-onwx-music es un paquete de pesos y programas compilados que adapta el modelo de generacion de musica ACE-Step 1.5 XL turbo (arquitectura DiT de 4.000 millones de parametros) para ejecutarse integramente en la NPU XDNA2 de los procesadores AMD Ryzen AI 300 y Ryzen AI Max. Lo publica el usuario ryugyosoft como complemento del runtime onwx-music (version 0.7.0 o superior), que permite cargar el modelo y generar audio a partir de texto y letras sin depender de GPU dedicada.

El modelo base, ACE-Step/acestep-v15-xl-turbo, es un text-to-audio con licencia MIT desarrollado por el equipo ACE-Step. Esta variante no introduce cambios en la arquitectura ni en el entrenamiento: reorganiza los pesos (DiT, encoder de texto, encoder de letras y decodificador VAE) en formato bfp16 y los acompaña de programas precompilados con AMD IRON / mlir-aie para la NPU. El resultado es una mejora de calidad sonora frente a la variante turbo del mismo autor, a costa de aproximadamente 1,5 veces mas tiempo de generacion.

Su relevancia radica en que demuestra la viabilidad de ejecutar un modelo generativo de audio de gran tamano en hardware de consumo con NPU integrada, con un pico de memoria de 7-8 GB y soporte para canciones de entre 10 y 600 segundos. Esta pensado para equipos con al menos 16 GB de RAM y no requiere compilacion en el PC del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de 4.000 millones de parametros, con encoder de texto Qwen3-Embedding-0.6B, encoder de letras y decodificador VAE |
| Parametros totales | 4.000 millones (DiT); el resto de componentes no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generacion de audio de 10 a 600 segundos) |
| Tipos de cuantizacion | Pesos en bfp16; GEMM de entrada del DiT (q, k, v, cross-q, gate, up) con desdoblamiento hi+lo en X manteniendo pesos en una sola copia |
| Idiomas soportados | no disponible (el modelo base es text-to-audio; el README esta en japones e ingles) |
| Licencia | MIT |
| Formato de pesos | Pesos propios en bfp16 organizados en directorios `dit/`, `enc/`, `vae/`, junto con programas NPU precompilados en `programs/` y tokenizadores |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del ACE-Step 1.5 XL turbo original: un Diffusion Transformer de 4.000 millones de parametros que genera latentes de audio condicionados por embeddings de texto (Qwen3-Embedding-0.6B) y de letras, que posteriormente decodifica un VAE. Esta variante no reentrena ni ajusta el modelo; unicamente reorganiza los pesos para la NPU y sustituye el encoder por la version XL (algunos pesos difieren del turbo) mientras mantiene el VAE identico al de turbo.

La innovacion tecnica esta en el empaquetado para NPU: los programas se generan con AMD IRON / mlir-aie y se distribuyen ya compilados, de modo que el usuario no compila nada. Para preservar precision, las GEMM de la entrada del DiT calculan X en dos copias (hi + lo) manteniendo los pesos en una sola. La precision declarada frente al calculo oficial en fp32 es una error relativo de 0,25 en el latente tras 8 pasos y un error en la velocidad del DiT de 0,14 en el primer paso y 0,024 en el ultimo. No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens ni uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de musica a partir de texto (text-to-audio) con condicionamiento por letras.
- Generacion de pistas de 10 a 600 segundos de duracion.
- Ejecucion integra en la NPU XDNA2: encoder de texto, encoder de letras, DiT y VAE corren todos en la NPU.
- Mayor calidad sonora que la variante turbo del mismo autor, con un coste temporal de aproximadamente 1,5 veces.
- Inferencia en 8 pasos de difusion (segun la metrica de precision reportada).
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Generacion de musica de fondo para videojuegos independientes: el modelo produce pistas de hasta 600 segundos en equipos con Ryzen AI, lo que permite iterar localmente sin coste por API ni conexion a la nube.
- Prototipado musical en portatiles con NPU: un Ryzen AI Max+ 395 genera 30 segundos en unos 22 segundos y 120 segundos en unos 46 segundos, suficiente para sesiones de ideacion rapida.
- Creacion de jingles y cortinillas publicitarias: la generacion condicionada por texto y letras permite adaptar el contenido a un briefing concreto y regenerar variaciones en minutos.
- Bandas sonoras para podcasts: pistas largas (300-600 segundos) generadas en 105-228 segundos encajan en la produccion de episodios sin depender de GPU dedicada.
- Investigacion en generacion de audio en hardware heterogeneo: sirve como referencia para estudiar el rendimiento de DiT de 4.000 millones de parametros sobre NPU XDNA2 con precision bfp16 y desdoblamiento hi+lo.
- Demostraciones y talleres sobre IA local: al no requerir compilacion y caber en 16 GB de RAM, es adecuado para entornos docentes con portatiles AMD Ryzen AI.
- Generacion de maquetas vocales/instrumentales: el condicionamiento por letras permite explorar melodias y estructuras antes de pasar a produccion profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no aplican a un modelo text-to-audio. Los unicos datos de rendimiento proporcionados son tiempos de generacion en un Ryzen AI Max+ 395:

| Duracion de la pista | Tiempo (esta variante) | Tiempo (turbo) |
|---|---|---|
| 30 segundos | aprox. 22 s | aprox. 15-18 s |
| 120 segundos | aprox. 46 s | aprox. 30 s |
| 300 segundos | aprox. 105 s | no disponible |
| 600 segundos | aprox. 228 s | no disponible |

Precision frente a fp32 oficial: error relativo del latente tras 8 pasos de 0,25; error de velocidad del DiT de 0,14 en el primer paso y 0,024 en el ultimo.

## Requisitos de hardware

- VRAM/RAM estimada: pico de 7-8 GB durante la generacion (la variante turbo consume unos 4 GB).
- Memoria del sistema recomendada: 16 GB o superior.
- NPU: AMD Ryzen AI 300 o Ryzen AI Max con NPU XDNA2 (obligatoria; no se documenta fallback a CPU o GPU).
- GPU dedicada: no requerida ni soportada segun la informacion disponible.
- Tamano de descarga: aproximadamente 7,1 GB (repo de 7,6 GB).
- Despliegue: exclusivamente a traves del runtime onwx-music 0.7.0 o superior, seleccionando el modelo desde el menu MODELS y cargandolo con la clave load.
- No compatible con vLLM, llama.cpp, Ollama ni TGI, al tratarse de un paquete de programas NPU precompilados.
- Throughput observado: 30 s de audio en 22 s (aprox. 1,36x tiempo real) y 120 s en 46 s (aprox. 2,6x tiempo real) en Ryzen AI Max+ 395.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/duracion | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACE-Step-1.5-XL-onwx-music (este) | 4.000 M (DiT) | 10-600 s de audio | NPU XDNA2 (Ryzen AI 300/Max) | MIT | HuggingFace, runtime onwx-music |
| ACE-Step-1.5-onwx-music (turbo) | no disponible | no disponible | NPU XDNA2 | MIT | HuggingFace, runtime onwx-music |
| ACE-Step/acestep-v15-xl-turbo (base) | 4.000 M (DiT) | no disponible | GPU/CPU generico | MIT | HuggingFace |

La comparativa con alternativas de otros desarrolladores (por ejemplo, modelos text-to-audio de gran tamano) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia total de hardware AMD Ryzen AI con NPU XDNA2; no funciona en equipos Intel, Apple Silicon ni GPUs NVIDIA.
- Requiere el runtime onwx-music 0.7.0 o superior; no es un modelo cargable en frameworks genericos.
- Pico de memoria de 7-8 GB, lo que descarta equipos con menos de 16 GB de RAM.
- Menor precision que el calculo oficial en fp32 (error relativo de 0,25 en el latente tras 8 pasos), con posible degradacion audible en pasajes complejos.
- Tiempo de generacion aproximadamente 1,5 veces mayor que la variante turbo.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible; al ser un modelo generativo de audio, puede producir contenido musical no solicitado o de baja calidad en briefings ambiguos.
- Idiomas soportados no documentados; la calidad del condicionamiento por texto y letras en castellano no esta verificada.
- Licencia MIT heredada del modelo base, lo que permite uso comercial, pero se recomienda verificar las licencias de los componentes (Qwen3-Embedding-0.6B es Apache-2.0 y el VAE proviene de ACE-Step/Ace-Step1.5).
- El paquete no incluye compilacion en el PC del usuario; cualquier modificacion de los programas NPU requiere el toolchain AMD IRON / mlir-aie.
- Modelo con muy poca adopcion (32 descargas, 0 likes) y publicado recientemente; no hay validacion independiente de su calidad.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/ryugyosoft/ACE-Step-1.5-XL-onwx-music
- Runtime onwx-music: https://huggingface.co/ryugyosoft/onwx-music
- Variante turbo del mismo autor: https://huggingface.co/ryugyosoft/ACE-Step-1.5-onwx-music
- Modelo base: https://huggingface.co/ACE-Step/acestep-v15-xl-turbo
- VAE original: https://huggingface.co/ACE-Step/Ace-Step1.5
- Encoder de texto: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
