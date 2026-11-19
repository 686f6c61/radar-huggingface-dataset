# skaledev/paddle-dgx

## Resumen

`skaledev/paddle-dgx` no es un modelo de IA, sino un repositorio de distribucion de wheels precompilados de `paddlepaddle-gpu` para la plataforma NVIDIA DGX Spark (SoC GB10 Grace Blackwell, arquitectura aarch64 con capacidad de computo sm_121 y CUDA 13). PaddlePaddle, el framework de deep learning de Baidu, no publica wheels oficiales para esta combinacion de plataforma y toolkit CUDA, y segun el autor tampoco tiene previsto hacerlo (referencia al issue PaddlePaddle/Paddle#76215). Este repositorio cubre ese hueco con artefactos binarios listos para instalar via `pip`.

El problema que resuelve es puramente de empaquetado e infraestructura: sin un wheel compatible, cualquier intento de usar PaddlePaddle o sus ecosistemas derivados (PaddleOCR, PaddleNLP, PaddleDetection) en un DGX Spark obliga a compilar desde fuente, con la complejidad que implica para una arquitectura ARM64 con CUDA 13. El autor publica dos versiones del wheel (v3.3.0 y v3.3.1) con verificacion mediante `run_check()` en GPU y ficheros sidecar de checksum SHA-256.

El repositorio ocupa 0,5 GB y contiene unicamente los binarios `.whl` y sus ficheros `.sha256`. No incluye pesos de modelo, tokenizadores ni codigo de inferencia. La receta de compilacion y los parches aplicados se mantienen en el repositorio de GitHub `github.com/devskale/paddle-dgx`, que el autor senala como fuente de verdad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (distribucion de wheels binarios, no modelo neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | wheels Python (`.whl`) para `paddlepaddle-gpu`; no contiene pesos de modelo |

## Arquitectura y entrenamiento

No aplica. Este repositorio no contiene un modelo entrenado ni una arquitectura neuronal. Distribuye dos wheels binarios de `paddlepaddle-gpu` compilados para Python 3.12 (`cp312`), Linux `aarch64`, CUDA 13 y capacidad de computo `sm_121`. Las versiones publicadas son `paddlepaddle_gpu-3.3.0.dev20260319-cp312-cp312-linux_aarch64.whl` (etiquetada como v3.3.1) y `paddlepaddle_gpu-3.3.0.dev20251226-cp312-cp312-linux_aarch64.whl` (v3.3.0). Cada wheel va acompanado de un fichero `.sha256` para verificacion de integridad.

Segun la model card, el wheel v3.3.1 pasa `run_check()` en GPU y el v3.3.0 pasa `run_check()` en GPU ademas de ejecutar OCR de la linea PP-OCRv6 sobre escaneos reales. El entorno de referencia declarado es Python 3.12, Ubuntu 24.04 arm64, CUDA 13 y driver 580.x. Los wheels se construyen a partir del codigo fuente de PaddlePaddle/Paddle (Apache-2.0) aplicando parches propios cuya receta se documenta en el repositorio de GitHub del autor.

## Capacidades

- Instalacion de `paddlepaddle-gpu` funcional en NVIDIA DGX Spark (GB10) mediante un unico comando `pip install` apuntando a la URL del wheel.
- Compatibilidad con `paddleocr` sin que este arrastre una version CPU de `paddlepaddle` como dependencia.
- Verificacion de integridad de los binarios mediante ficheros sidecar SHA-256 (`sha256sum -c`).
- Comprobacion rapida de que el binario esta compilado con soporte CUDA: `python -c "import paddle; print(paddle.is_compiled_with_cuda())"` debe devolver `True`.
- Soporte de la linea PP-OCRv6 verificada sobre escaneos reales en la version v3.3.0.
- No ofrece generacion de texto, razonamiento, codigo, vision, tool calling, agentes ni capacidades multilingues propias: esas capacidades dependerian de los modelos que el usuario cargue sobre PaddlePaddle.

## Casos de uso

- Puesta en marcha de PaddlePaddle en un DGX Spark: instalar el wheel con `pip` evita compilar el framework desde fuente en aarch64 + CUDA 13, una combinacion para la que no hay binarios oficiales.
- Despliegue de PaddleOCR en produccion sobre GB10: el wheel v3.3.0 esta verificado con PP-OCRv6 sobre escaneos reales, lo que permite montar pipelines de digitalizacion documental con aceleracion GPU en esta plataforma.
- Entornos de investigacion con hardware Grace Blackwell: permite ejecutar experimentos en PaddlePaddle sobre la misma maquina donde se desarrolla, sin depender de un nodo x86 separado.
- CI/CD para proyectos que usan PaddlePaddle: fijar la URL del wheel y su checksum en el pipeline garantiza builds reproducibles en runners aarch64 con CUDA 13.
- Migracion de cargas de trabajo de PaddleNLP o PaddleDetection a DGX Spark: al disponer de un wheel funcional, los modelos de estos ecosistemas pueden cargarse y ejecutarse en GPU sin adaptaciones de build.
- Validacion de integridad en entornos regulados: el uso de ficheros `.sha256` junto a cada wheel permite auditar el binario instalado antes de desplegarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta verificaciones funcionales (`run_check()` en GPU y ejecucion de PP-OCRv6 sobre escaneos reales), sin metricas de latencia, throughput ni comparativas numericas.

## Requisitos de hardware

- GPU: NVIDIA DGX Spark con SoC GB10 Grace Blackwell (aarch64, `sm_121`). No esta pensado para otras GPU ni para x86_64.
- Toolkit CUDA: CUDA 13.
- Driver: rama 580.x.
- Sistema operativo: Ubuntu 24.04 arm64.
- Version de Python: 3.12 (`cp312`).
- VRAM: no disponible (depende del modelo que se cargue sobre PaddlePaddle, no del wheel).
- Despliegue: instalacion directa con `pip install <url-del-wheel>`; no aplica vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque este repositorio no es un modelo, sino una distribucion de binarios. La alternativa funcional seria compilar `paddlepaddle-gpu` desde fuente para aarch64 + CUDA 13 + `sm_121`, opcion que el autor indica que el proyecto upstream no soporta ni planea soportar.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa imagenes por si mismo. Cualquier evaluacion como modelo es un error de categoria.
- Solo valido para DGX Spark (GB10, aarch64, `sm_121`, CUDA 13). No funcionara en GPU x86_64, en arquitecturas anteriores ni con versiones de CUDA distintas.
- Wheels de desarrollo (`3.3.0.dev*`): pueden contener comportamiento inestable o cambios no consolidados respecto a una release estable de PaddlePaddle.
- Verificacion limitada: la model card solo reporta `run_check()` y una prueba de PP-OCRv6; no hay bateria de tests publicada ni resultados de benchmarks.
- Dependencia de un unico mantenedor (`skaledev`): el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica bajo contraste de la comunidad.
- La receta de compilacion y los parches viven en GitHub, no en Hugging Face; la trazabilidad completa exige consultar ambos repositorios.
- Licencia Apache-2.0 heredada de PaddlePaddle/Paddle: permite uso comercial, pero conviene revisar los terminos del proyecto upstream y de los modelos de terceros que se carguen encima.
- Sin datos de sesgos, alucinacion o limitaciones linguisticas porque no aplica a un binario de framework.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/skaledev/paddle-dgx
- Receta de build y parches (GitHub): https://github.com/devskale/paddle-dgx
- Codigo fuente de PaddlePaddle: https://github.com/PaddlePaddle/Paddle
- Issue upstream sobre soporte de plataforma: https://github.com/PaddlePaddle/Paddle/issues/76215
