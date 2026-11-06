# aynad/excavate-listen

## Resumen

`aynad/excavate-listen` no es un modelo de pesos, sino un binario de inferencia para reconocimiento automatico del habla (ASR) empaquetado en un repositorio de Hugging Face. Lo publica el desarrollador `aynad` como componente del motor de transcripcion de Excavate, una aplicacion de busqueda local para Windows que indexa grabaciones por su contenido hablado. El repositorio contiene ejecutables y bibliotecas compiladas a partir de whisper.cpp (tag `b5454`, commit `d1be6fd`), no ficheros de parametros entrenados.

El problema que resuelve es de distribucion: whisper.cpp no publica builds oficiales para Windows con backend Vulkan, y su build CUDA para Windows omite cuBLAS, lo que degrada la ejecucion a CPU. Este paquete ofrece un unico programa que carga modelos Whisper y Parakeet, mantiene un modelo residente en memoria y acepta audio por una tuberia (pipe), con soporte para cualquier GPU o para CPU. El repositorio ocupa 0,7 GB e incluye los runtimes redistribuibles de NVIDIA CUDA 12.9 y de Microsoft.

Por tanto, la ficha describe un runtime de ASR, no una arquitectura neuronal con parametros propios: el modelo efectivo es el que el usuario cargue desde los repositorios de ggml-org (`ggerganov/whisper.cpp`, `ggml-org/parakeet-GGUF`, `ggml-org/whisper-vad`), y los pesos no se incluyen en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica al repositorio: es un runner compilado de whisper.cpp (backends como bibliotecas cargables, `GGML_BACKEND_DL`). Los modelos que ejecuta son Whisper (transformer encoder-decoder) y Parakeet (via `parakeet-GGUF`) |
| Parametros totales | No disponible (el repositorio no contiene pesos; dependen del modelo cargado) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (depende del modelo Whisper/Parakeet cargado; whisper.cpp trabaja con ventanas de audio de 30 s por defecto) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (los GGUF de whisper.cpp y parakeet-GGUF admiten cuantizaciones ggml; el repositorio no las enumera) |
| Idiomas soportados | No disponible (el campo de idiomas de Hugging Face figura como no disponible; depende del modelo cargado) |
| Licencia | `mit-with-redistributables`, con enlace a la licencia MIT de whisper.cpp; el listener es MIT; el runtime CUDA y cuBLAS se redistribuyen bajo la EULA de NVIDIA CUDA Toolkit; el runtime C++ de Microsoft bajo los terminos de Visual Studio para uso app-local |
| Formato de pesos | No contiene pesos. Los modelos se obtienen aparte en formato GGUF (whisper.cpp y parakeet-GGUF) |

## Arquitectura y entrenamiento

El repositorio no entrena ni contiene un modelo. Es un artefacto de compilacion: dos archivos ZIP con el ejecutable `excavate-listen.exe`, las bibliotecas de whisper.cpp y los backends de ggml. El ZIP Vulkan (`excavate-listen-b5454-vulkan.zip`, 18 MB) incluye las variantes para todos los procesadores, Vulkan y el runtime C++ de Microsoft. El ZIP CUDA 12 (`excavate-listen-b5454-cuda12.zip`, 660 MB, opcional) anade la biblioteca CUDA de whisper.cpp, el runtime CUDA 12.9 de NVIDIA y cuBLAS; esta compilado para arquitecturas desde Turing hasta Blackwell (GTX 16 y RTX 20 en adelante).

La innovacion tecnica relevante es la carga dinamica de backends (`GGML_BACKEND_DL`), que permite seleccionar en tiempo de ejecucion entre Vulkan, CUDA o CPU sin recompilar, junto con la persistencia del modelo en memoria y la recepcion de audio por pipe. El codigo fuente del listener y su script de compilacion son `tools/listen/listen.cpp` y `tools/listen/build.bat` del repositorio de Excavate. No hay datos de entrenamiento, dataset ni fases de RLHF/DPO porque no se entrena ningun modelo en este repositorio.

## Capacidades

- Reconocimiento automatico del habla (speech-to-text) sobre audio recibido por tuberia, con el modelo Whisper o Parakeet que se cargue.
- Ejecucion acelerada por GPU mediante Vulkan (cualquier tarjeta compatible) o CUDA 12 (NVIDIA desde Turing/GTX 16 y RTX 20 en adelante), con fallback a CPU.
- Carga persistente del modelo: el proceso mantiene el modelo en memoria entre peticiones, evitando recargas.
- Deteccion de actividad de voz mediante `ggml-org/whisper-vad`, referenciado entre los modelos que consume.
- Verificacion de integridad: Excavate comprueba el SHA-256 de cada archivo antes de usarlo.
- No incluye capacidades de vision, audio generativo, tool calling ni agentes; es un runner de transcripcion.

## Casos de uso

- Indexacion de grabaciones en una aplicacion de busqueda local en Windows: Excavate transcribe el audio con este runner y hace las grabaciones buscables por su contenido hablado, manteniendo el modelo residente para procesar lotes sin recargarlo.
- Transcripcion por lotes en equipos sin GPU NVIDIA: el ZIP Vulkan funciona con tarjetas de cualquier fabricante compatibles con Vulkan, lo que cubre equipos Intel y AMD que quedarian fuera del build CUDA.
- Despliegue en estaciones de trabajo con GPU NVIDIA: el ZIP CUDA 12 aporta cuBLAS, evitando la caida a CPU del build CUDA oficial de whisper.cpp en Windows.
- Integracion como proceso auxiliar en aplicaciones de escritorio: al aceptar audio por pipe, encaja en arquitecturas donde la app principal captura el audio y delega la transcripcion en un proceso separado con el modelo ya cargado.
- Seleccion de modelo segun recursos: permite intercambiar entre modelos Whisper y Parakeet en formato GGUF sin cambiar de binario, ajustando el coste de computo al hardware disponible.
- Verificacion de integridad en distribucion: util para pipelines que necesitan validar binarios de terceros antes de ejecutarlos, gracias a los hashes SHA-256 publicados y comprobados por Excavate.
- Transcripcion offline con deteccion de voz: la integracion de `whisper-vad` permite segmentar el audio antes de transcribir en escenarios sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del modelo Whisper o Parakeet cargado y de su cuantizacion, no del runner.
- GPU compatibles con el ZIP CUDA 12: NVIDIA desde Turing hasta Blackwell (GTX 16 y RTX 20 en adelante). El ZIP Vulkan cubre tarjetas con soporte Vulkan de cualquier fabricante.
- Ejecucion en CPU: soportada; el runner incluye las variantes de procesador de whisper.cpp.
- GPU de consumo: si, siempre que sean compatibles con Vulkan o con la lista CUDA indicada; no se publican requisitos minimos de VRAM.
- Opciones de despliegue: ejecutable nativo de Windows (`excavate-listen.exe`) con backends cargables; no se documenta integracion con vLLM, llama.cpp, Ollama o TGI, que no aplican a este artefacto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Alternativa | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `aynad/excavate-listen` | Runner binario de whisper.cpp para Windows (Vulkan/CUDA) | No contiene pesos | No disponible | MIT con redistribuibles (incluye EULA de NVIDIA CUDA) | Hugging Face, 0 descargas |
| whisper.cpp oficial (`ggerganov/whisper.cpp`) | Runtime de inferencia y modelos GGUF | Segun modelo Whisper | Ventanas de audio de 30 s en la configuracion por defecto | MIT | GitHub, ampliamente usado |
| `ggml-org/parakeet-GGUF` | Modelos Parakeet en GGUF para whisper.cpp | No disponible | No disponible | No disponible en la informacion proporcionada | Hugging Face |

La diferencia principal frente a whisper.cpp oficial es de empaquetado: builds listos para Windows con Vulkan y con CUDA mas cuBLAS incluidos, y un proceso persistente que acepta audio por pipe. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, por lo que no puede evaluarse en terminos de calidad de transcripcion sin cargar un Whisper o Parakeet aparte.
- Solo Windows: los binarios son `.exe` y `.dll`; no hay builds para Linux ni macOS en la informacion disponible.
- El ZIP CUDA 12 redistribuye el runtime y cuBLAS de NVIDIA bajo la EULA de CUDA Toolkit, con condiciones distintas a la licencia MIT del resto; conviene revisarlas antes de redistribuir.
- El ZIP CUDA esta compilado para Turing-Blackwell; tarjetas NVIDIA anteriores a GTX 16 no estan cubiertas por ese build.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no ha publicado historial de mantenimiento; el tag `b5454` fija una version concreta de whisper.cpp que habra que actualizar manualmente.
- Sin benchmarks publicados ni idiomas declarados, no hay evidencia disponible sobre calidad, sesgos o cobertura multilingue del pipeline.
- Riesgo de alucinacion heredado del modelo ASR que se cargue; whisper.cpp no incluye mecanismos propios de mitigacion en este artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/aynad/excavate-listen
- Perfil del autor: https://huggingface.co/aynad
- Licencia de whisper.cpp referenciada: https://github.com/ggml-org/whisper.cpp/blob/d1be6fd/LICENSE
- whisper.cpp (upstream): https://github.com/ggml-org/whisper.cpp
- Modelos Parakeet en GGUF: https://huggingface.co/ggml-org/parakeet-GGUF
- Deteccion de voz para whisper.cpp: https://huggingface.co/ggml-org/whisper-vad
