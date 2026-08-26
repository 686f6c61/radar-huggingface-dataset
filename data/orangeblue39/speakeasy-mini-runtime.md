# orangeblue39/speakeasy-mini-runtime

## Resumen

El repositorio `orangeblue39/speakeasy-mini-runtime` no contiene un modelo de inteligencia artificial, sino un ejecutable compilado para Windows x64: el worker de inferencia CUDA de SpeakEasy Mini, una aplicación de dictado por voz local. Este worker ejecuta el modelo de reconocimiento de voz `ibm-granite/granite-speech-4.1-2b-GGUF`, que se descarga por separado desde HuggingFace. El proyecto está desarrollado por el autor `orangeblue39` y su código fuente se encuentra en el repositorio `kwp490/speakeasy-granite-rust-mini`.

La relevancia de este repositorio radica en que permite desplegar un sistema de dictado completamente local, sin enviar datos a servidores externos, utilizando una GPU NVIDIA compatible. El ejecutable está construido sobre llama.cpp/ggml y CUDA 13.x, e incluye verificación de integridad mediante hashes SHA-256 para garantizar que el binario no haya sido alterado. No se trata de un modelo entrenado, sino de un componente de software que sirve de puente entre la aplicación y el modelo de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene un modelo; el modelo subyacente es `ibm-granite/granite-speech-4.1-2b-GGUF`, cuyas especificaciones no se proporcionan) |
| Parametros totales | no disponible (el modelo subyacente tiene 2B parametros segun su nombre, pero no se confirma en esta informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo se distribuye en formato GGUF, pero no se especifican las variantes) |
| Idiomas soportados | no disponible |
| Licencia | MIT (para el codigo propio y dependencias MIT; los componentes NVIDIA estan sujetos a su propia EULA) |
| Formato de pesos | no aplicable (el repositorio contiene un ejecutable `.exe`, no pesos de modelo) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, por lo que no hay arquitectura de red neuronal ni proceso de entrenamiento que describir. El ejecutable `granite-worker.exe` es un worker de inferencia compilado en Rust con las bibliotecas llama.cpp/ggml, que carga el modelo GGUF de IBM Granite Speech 4.1 (2B parametros) y ejecuta la transcripcion de audio en la GPU mediante CUDA. El codigo fuente esta disponible en el repositorio `kwp490/speakeasy-granite-rust-mini` y se compila con `cargo build --release -p speakeasy-granite-worker --features cuda` contra CUDA Toolkit 13.3.

El worker no incluye ningun tipo de entrenamiento o ajuste; su funcion es exclusivamente la inferencia. La aplicacion SpeakEasy Mini se encarga de capturar audio, enviarlo al worker y recibir la transcripcion. Todo el procesamiento ocurre en la maquina local, sin comunicacion con servidores externos. El ejecutable depende de las bibliotecas `cublas64_13.dll` y `cublasLt64_13.dll` de NVIDIA, que se cargan en tiempo de ejecucion, y de un driver NVIDIA que proporcione `nvcuda.dll`.

## Capacidades

- Ejecucion local de inferencia de reconocimiento de voz mediante el modelo Granite Speech 4.1 (2B) en formato GGUF.
- Transcripcion de audio a texto en tiempo real, verificada en una NVIDIA RTX 4070 Laptop GPU con una latencia de 361.2 ms para un clip de prueba.
- Compatibilidad con CUDA 13.x, sin fallback a CPU (el ejecutable no funciona sin GPU NVIDIA).
- Verificacion de integridad del binario mediante hashes SHA-256 antes de su ejecucion.
- Integracion con la aplicacion SpeakEasy Mini para dictado por voz en Windows.
- No incluye capacidades de generacion de texto, razonamiento, codigo, vision ni tool calling; es un componente especifico para transcripcion de voz.

## Casos de uso

- Dictado de documentos en aplicaciones de oficina: el usuario puede redactar informes o correos mediante voz, con transcripcion local que preserva la privacidad al no enviar audio a la nube.
- Asistencia a personas con movilidad reducida: permite escribir en el ordenador usando solo la voz, con baja latencia gracias a la aceleracion CUDA.
- Transcripcion de reuniones o entrevistas en tiempo real: el worker puede integrarse en herramientas de captura de audio para generar texto al instante, siempre que se disponga de una GPU NVIDIA compatible.
- Automatizacion de subtitulos para contenido multimedia: el modelo de voz puede transcribir audio de video o podcast, y el worker proporciona la infraestructura de inferencia local.
- Desarrollo de aplicaciones de dictado personalizadas: los desarrolladores pueden reutilizar el worker como componente de backend en sus propias aplicaciones Rust o Python, aprovechando la integracion con llama.cpp.
- Entornos con requisitos estrictos de privacidad: empresas o profesionales que manejan informacion confidencial pueden desplegar un sistema de dictado sin depender de servicios externos, cumpliendo politicas de proteccion de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento mencionado es una verificacion en una NVIDIA RTX 4070 Laptop GPU: transcripcion de un clip de prueba en 361.2 ms, con salida identica a la version de CPU. No hay comparaciones con otros modelos ni metricas estandar como WER (Word Error Rate) o latencia media en conjuntos de datos publicos.

## Requisitos de hardware

- GPU NVIDIA compatible con CUDA 13.x (se requiere `nvcuda.dll` y las bibliotecas `cublas64_13.dll` y `cublasLt64_13.dll`).
- El ejecutable no funciona sin GPU; no hay modo CPU.
- VRAM estimada: no disponible, pero el modelo subyacente es de 2B parametros en formato GGUF, por lo que probablemente quepa en GPUs con 4 GB o mas, aunque no se confirma.
- GPU recomendada: NVIDIA RTX 4070 Laptop (verificada), aunque cualquier GPU con soporte CUDA 13 deberia funcionar.
- Sistema operativo: Windows x64 (el binario es especifico para Windows).
- Opciones de despliegue: el worker se integra en la aplicacion SpeakEasy Mini; no se mencionan opciones como vLLM, Ollama o TGI, ya que es un componente cerrado.
- Latencia: 361.2 ms para un clip de prueba en RTX 4070 Laptop, segun la verificacion del autor.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo, sino un runtime de inferencia. El modelo subyacente (Granite Speech 4.1 2B) no tiene comparativas publicadas en la informacion proporcionada. No se pueden comparar parametros, contexto ni rendimiento con alternativas como Whisper o Parakeet, ya que no hay datos suficientes.

## Limitaciones y advertencias

- El repositorio no contiene un modelo; es un ejecutable compilado. Cualquier evaluacion de capacidades debe realizarse sobre el modelo `ibm-granite/granite-speech-4.1-2b-GGUF`, no sobre este repositorio.
- El ejecutable es exclusivo para Windows x64 y requiere una GPU NVIDIA con CUDA 13.x; no hay soporte para Linux, macOS ni CPU.
- Depende de bibliotecas NVIDIA externas (`cublas64_13.dll`, `cublasLt64_13.dll`) que deben descargarse por separado desde los servidores de NVIDIA.
- La licencia MIT se aplica al codigo propio y a las dependencias MIT, pero los componentes NVIDIA estan sujetos a la EULA de NVIDIA CUDA Toolkit, lo que puede imponer restricciones adicionales en entornos comerciales.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de idioma del modelo de voz subyacente.
- El binario no es bit-reproducible (MSVC incrusta timestamps y rutas PDB), por lo que los hashes SHA-256 solo identifican esta compilacion concreta.
- Para uso en produccion, es necesario verificar la compatibilidad con el modelo GGUF especifico y asegurar que las bibliotecas CUDA esten correctamente instaladas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/orangeblue39/speakeasy-mini-runtime
- Modelo subyacente (IBM Granite Speech 4.1 2B GGUF): https://huggingface.co/ibm-granite/granite-speech-4.1-2b-GGUF
- Codigo fuente del worker: https://github.com/kwp490/speakeasy-granite-rust-mini
- EULA de NVIDIA CUDA Toolkit: https://docs.nvidia.com/cuda/eula/index.html
