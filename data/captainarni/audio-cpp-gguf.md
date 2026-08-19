# CaptainArni/audio.cpp-gguf

## Resumen

Este repositorio contiene la conversión a formato GGUF del modelo ACE-Step 1.5 XL Turbo, un transformador de difusión (DiT) de gran tamaño diseñado para generación de música a partir de texto. La conversión ha sido realizada por CaptainArni para su uso con [audio.cpp](https://github.com/0xShug0/audio.cpp), un framework de inferencia nativo basado en ggml que permite ejecutar modelos de audio en CPU y GPU sin dependencias pesadas.

El archivo GGUF incluye todos los componentes necesarios (DiT XL, planner LM, text encoder y VAE) en un único fichero autocontenido de 14.2 GB en precisión bf16. Esto simplifica el despliegue, ya que no requiere descargas adicionales. El modelo es una redistribución de los pesos originales de ACE-Step, con licencia MIT, y está pensado para tareas de text-to-music (generación de pistas musicales a partir de descripciones textuales).

La relevancia de esta conversión radica en que permite ejecutar un modelo de generación musical de última generación en entornos donde no se dispone de las librerías de PyTorch o CUDA completas, gracias a la portabilidad de GGUF y la eficiencia de ggml. Se han medido tiempos de generación de 20 segundos de audio en 15 segundos (incluyendo carga del modelo) en una RTX 5090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) XL, 32 capas de 2560 dimensiones, 32 cabezas de atencion de 128 |
| Parametros totales | no disponible (archivo de 14.2 GB en bf16) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de generacion de audio, no texto) |
| Tipos de cuantizacion | bf16 (unico formato proporcionado) |
| Idiomas soportados | no disponible (la entrada es texto, pero no se especifican idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (bf16) |

## Arquitectura y entrenamiento

El modelo base es ACE-Step 1.5 XL Turbo, un transformador de difusion (DiT) de 32 capas con dimensiones ocultas de 2560 y 32 cabezas de atencion de 128. A diferencia de la variante "turbo" estandar (24 capas de 2048), la version XL es significativamente mayor. El archivo GGUF empaqueta cuatro componentes: el DiT principal, un LM planificador (planner), un codificador de texto y un VAE (autoencoder variacional). Todos ellos se combinan en un unico fichero autocontenido.

No se dispone de informacion detallada sobre el proceso de entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF o DPO). La conversion a GGUF se realizo con la herramienta `audiocpp_gguf --type bf16` a partir de los pesos float32 originales. No se han introducido cambios en los pesos, solo en el formato de contenedor.

## Capacidades

- Generacion de musica a partir de descripciones textuales (text-to-music), como "warm lo-fi hip hop with a soft rhodes piano".
- Generacion de audio de duracion configurable (por ejemplo, 60 segundos en el ejemplo de uso).
- Soporte para tareas de texto a audio (pipeline `text-to-audio`).
- Incluye componentes integrados de codificacion de texto y VAE, lo que permite un pipeline completo en un solo archivo.
- Compatible con el framework audio.cpp, que ofrece backend CUDA para aceleracion por GPU.
- No se mencionan capacidades de tool calling, agentes ni razonamiento multi-paso, ya que es un modelo generativo de audio.

## Casos de uso

- **Produccion musical rapida**: un compositor puede generar bocetos de pistas a partir de descripciones textuales (genero, instrumentos, ambiente) para usarlos como base en su flujo de trabajo. El modelo produce audio de 20 segundos en 15 segundos en una GPU moderna, lo que permite iterar rapidamente.
- **Generacion de musica de fondo para videojuegos**: los desarrolladores pueden crear bandas sonoras adaptativas describiendo el estado emocional o la escena (por ejemplo, "tension oscura con percusion minima") y generar clips que se integran en el motor del juego.
- **Prototipado de audio para publicidad**: agencias de marketing pueden generar demos musicales para spots sin necesidad de contratar a un compositor, evaluando multiples opciones en minutos.
- **Creacion de samples y loops para produccion electronica**: el modelo puede generar loops de bateria, lineas de bajo o pads atmosfericos a partir de texto, que luego se importan en DAWs como Ableton o FL Studio.
- **Educacion musical**: profesores pueden generar ejemplos auditivos de distintos generos o estilos para ilustrar conceptos teoricos en clase, sin depender de bibliotecas de audio preexistentes.
- **Accesibilidad en creacion de contenido**: creadores de video (YouTube, Twitch) pueden generar musica de fondo libre de derechos describiendo el tono deseado, evitando problemas de licencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento proporcionado es una medicion realizada por el autor: generacion de 20 segundos de audio en 15 segundos (incluyendo la carga del modelo) en una RTX 5090 con backend CUDA. No hay comparaciones con otros modelos ni metricas objetivas como FAD (Fréchet Audio Distance) o CLAP score.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 14.2 GB en bf16. Para inferencia se recomienda al menos 16 GB de VRAM, aunque podria ejecutarse con cuantizaciones menores si se generaran (no se proporcionan en este repositorio).
- GPU recomendadas: RTX 5090 (usada en las pruebas), RTX 4090, A100, H100 o cualquier GPU con al menos 16 GB de memoria y soporte CUDA.
- No se menciona ejecucion en CPU, pero al estar basado en ggml, audio.cpp podria soportarla con rendimiento reducido.
- Opciones de despliegue: audio.cpp (framework nativo), con backend CUDA para GPU. No se mencionan integraciones con vLLM, Ollama u otros servidores de inferencia.
- Latencia y throughput: 20 s de audio en 15 s en RTX 5090 (incluye carga del modelo). La generacion de 60 s tardaria proporcionalmente mas, aunque no se especifica.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa cuantitativa con otros modelos de generacion de musica como MusicGen, AudioLDM o Stable Audio. El modelo es una conversion del ACE-Step 1.5 XL Turbo original, por lo que su rendimiento deberia ser identico al del modelo base (mismos pesos). La principal diferencia frente a otras opciones es el formato GGUF, que facilita el despliegue en entornos sin Python ni PyTorch. No hay informacion sobre benchmarks comparativos.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos, alucinaciones o limitaciones del modelo original. Al ser una conversion de pesos, las limitaciones de ACE-Step 1.5 XL Turbo se mantienen, pero no estan documentadas en este repositorio.
- El modelo solo genera musica; no soporta otras tareas de audio como separacion de fuentes, transcripcion o efectos.
- La calidad de la generacion depende de la claridad de la descripcion textual; descripciones ambiguas pueden producir resultados poco predecibles.
- El unico formato de cuantizacion disponible es bf16, lo que limita su uso en GPUs con menos de 16 GB de VRAM. No se ofrecen versiones cuantizadas a 8 bits o 4 bits.
- La licencia MIT permite uso comercial, pero es responsabilidad del usuario verificar que el modelo original no tenga restricciones adicionales (aunque se indica que los pesos son MIT).
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicacion reciente sin validacion comunitaria amplia.

## Enlaces

- Repositorio HuggingFace: [CaptainArni/audio.cpp-gguf](https://huggingface.co/CaptainArni/audio.cpp-gguf)
- Modelo base: [ACE-Step/acestep-v15-xl-turbo](https://huggingface.co/ACE-Step/acestep-v15-xl-turbo)
- Framework audio.cpp: [https://github.com/0xShug0/audio.cpp](https://github.com/0xShug0/audio.cpp)
- PR de soporte XL en audio.cpp: [PR #235](https://github.com/0xShug0/audio.cpp/pull/235)
