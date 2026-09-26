# ManniX-ITA/opencoti-llamafile-dev

## Resumen

`ManniX-ITA/opencoti-llamafile-dev` no es un modelo de lenguaje, sino un repositorio de compilaciones de desarrollo (*development builds*) del motor de inferencia opencoti llamafile, mantenido por el usuario ManniX-ITA. El repositorio existe para que proyectos downstream (xollama y otros) puedan integrar y probar trabajo que todavia no se ha publicado como version estable. La version estable, fijada y respaldada vive en un repositorio aparte, `ManniX-ITA/opencoti-llamafile`; este contiene unicamente instantaneas de desarrollo para pruebas de integracion.

El motor se apoya en la cadena llamafile/llama.cpp (asi lo indican las etiquetas `llamafile` y `llama.cpp`) y se distribuye como ejecutable APE generado con cosmocc, capaz de ejecutarse en Linux x86_64/aarch64, macOS y Windows (como `.exe`), acompanado opcionalmente de una DSO CUDA (`ggml-cuda.so`) que se carga lateralmente. El repositorio ocupa 7,1 GB e incluye, ademas de los binarios, ficheros `BUILD_INFO.md` y `SHA256SUMS` por compilacion.

Su relevancia es acotada pero concreta: permite a integradores acceder a series de parches, flags y documentacion de uso antes de su publicacion oficial, con la advertencia explicita de que no son releases, de que las instantaneas pueden reemplazarse o eliminarse y de que deben fijarse por revision de commit y sha256, nunca por la rama `main`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: el repositorio no contiene pesos de red neuronal. Es un motor de inferencia derivado de llamafile/llama.cpp |
| Parametros totales | No aplica (no es un modelo) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo GGUF que el usuario cargue en el motor) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; al etiquetarse como `llama.cpp`, es esperable el soporte de los formatos GGUF habituales de esa cadena, dato no confirmado por el autor |
| Idiomas soportados | No disponible (depende del modelo cargado) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica: se publican binarios. Ejecutable APE (cosmocc) y DSO CUDA `ggml-cuda.so`, mas `SHA256SUMS` y `BUILD_INFO.md` |
| Tamano del repositorio | 7,1 GB |
| Autor | ManniX-ITA |
| ID de HuggingFace | ManniX-ITA/opencoti-llamafile-dev |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-09-25 |
| Descargas / likes | 0 / 1 |
| Plataformas del binario | Linux x86_64, Linux aarch64, macOS y Windows (como `.exe`) |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

No hay entrenamiento asociado a este repositorio. Se trata de un artefacto de *build*: el binario anfitrion es un APE (Actually Portable Executable) generado con cosmocc, un formato que empaqueta un unico fichero ejecutable multiplataforma. El motor subyacente pertenece a la cadena llamafile/llama.cpp, y la parte de opencoti corresponde a series de parches y flags propios que se reflejan tambien en el repositorio de releases. La aceleracion por GPU se resuelve mediante una DSO CUDA de carga lateral (`ggml-cuda.so`) que debe colocarse junto al binario; el directorio del ejecutable tiene prioridad en la busqueda.

El versionado de cada compilacion es un punto tecnico importante: un build de desarrollo arrastra en su cadena de version la etiqueta de la release *anterior*, por ejemplo `opencoti-0.10.5-c7-<YYMMDDHHMM><NNN>`. Ese identificador es el id del build de desarrollo, no una afirmacion de que el binario sea esa release. Cada instantanea ha superado unicamente las puertas de validacion (*gates*) declaradas en su `BUILD_INFO.md`, y una iteracion que solo cambia la DSO de CUDA no genera un id nuevo.

La distribucion sigue un formato de *pin* (`pin/llamafile-binary.txt`) con directivas `repo`, `rev` y `tag`, y una fila por activo con campos `kind` (bin o dso), `arch`, ruta en HuggingFace y sha256. La descarga se realiza por URL de revision fija y la verificacion se delega en el sha256 del pin.

## Capacidades

- Ejecucion de modelos de lenguaje en formato local mediante un unico fichero ejecutable multiplataforma (Linux x86_64/aarch64, macOS y Windows).
- Aceleracion opcional por GPU NVIDIA a traves de la DSO CUDA cargada lateralmente.
- Capacidad de fijado (*pinning*) reproducible por revision de commit y sha256, apta para automatizacion.
- Distribucion de series de parches y flags de opencoti antes de su publicacion como release estable.
- No incluye pesos de modelo: no genera texto, no razona, no ejecuta codigo ni ofrece *tool calling* por si mismo; todas esas capacidades dependen del modelo que se cargue en el motor.
- No se declaran capacidades multimodales, de audio, de vision ni modos de razonamiento propios en la informacion disponible.
- No se declaran capacidades de agente ni de razonamiento multi-paso a nivel de motor.

## Casos de uso

- Pruebas de integracion de proyectos downstream: xollama y otros clientes pueden compilar y validar su integracion contra compilaciones de opencoti que aun no existen como release, usando el id de build y el sha256 del pin para reproducir el entorno.
- Validacion en pipelines de CI/CD: el formato de pin por revision y sha256 permite descargar y verificar el binario de forma determinista, evitando que una compilacion cambie bajo los pies del pipeline.
- Reproduccion y reporte de errores: el repositorio exige adjuntar el id de build y el sha256 de la DSO al reportar un fallo, de modo que un mantenedor puede reconstruir exactamente el artefacto afectado.
- Pruebas de la ruta CUDA: la posibilidad de sustituir solo `ggml-cuda.so` permite iterar sobre el soporte de GPU sin regenerar el binario anfitrion, util para comparar kernels o drivers.
- Empaquetado de distribuciones de terceros: un mantenedor de paquetes puede fijar una instantanea concreta, verificar su hash y empaquetarla para su propio canal, asumiendo que la instantanea puede desaparecer.
- Evaluacion temprana de flags y cambios de comportamiento del motor: equipos que dependen de opencoti pueden medir el impacto de una serie de parches antes de que se convierta en release, sin comprometerse con la rama `main`.
- Despliegue en entornos con sistema operativo heterogeneo: al ser un APE, el mismo artefacto puede probarse en Linux, macOS y Windows, lo que simplifica matrices de validacion multiplataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye pesos de modelo ni datos de evaluacion (MMLU, HumanEval, GSM8K u otros); cualquier cifra de rendimiento dependeria del modelo GGUF cargado y de la GPU empleada, y no se proporciona ninguna medicion de latencia ni de throughput.

## Requisitos de hardware

- VRAM: no disponible. Depende integramente del modelo que se cargue, no del repositorio, que solo contiene el motor.
- GPU: la DSO `ggml-cuda.so` esta pensada para aceleracion NVIDIA. No se especifican arquitecturas minimas, versiones de CUDA ni VRAM (no disponible).
- Inferencia en CPU: soportada por el binario APE en Linux x86_64/aarch64, macOS y Windows.
- GPU de consumo: no se puede determinar con la informacion disponible, ya que depende del modelo y la cuantizacion elegidos.
- Opciones de despliegue: ejecucion directa del binario APE con la DSO CUDA colocada junto a el. El repositorio no documenta integraciones con vLLM, TGI, Ollama ni otros servidores.
- Latencia y throughput: no disponibles.
- Espacio en disco: el repositorio completo ocupa 7,1 GB, repartidos entre binarios y DSO por compilacion.

## Comparativa con modelos similares

La categoria correcta aqui no es "modelo", sino "motor de inferencia / runtime de distribucion". La comparacion se establece con herramientas equivalentes.

| Herramienta | Tipo | Licencia | Multiplataforma en un solo fichero | Aceleracion GPU | Estado de este repositorio |
|---|---|---|---|---|---|
| opencoti-llamafile-dev (ManniX-ITA) | Motor derivado de llamafile/llama.cpp | Apache-2.0 | Si (APE con cosmocc) | CUDA mediante DSO lateral | Compilaciones de desarrollo, sin cadencia, no son releases |
| llamafile (mozilla-ai) | Motor y distribucion de LLM en un fichero | No disponible en la informacion proporcionada | Si | No disponible en la informacion proporcionada | Proyecto de referencia, con releases publicas |
| llama.cpp | Motor de inferencia GGUF | No disponible en la informacion proporcionada | No en un solo fichero, se compila y ejecuta | Si (CUDA, Metal, Vulkan, etc., segun build) | Base tecnica sobre la que se apoya opencoti |
| opencoti-llamafile (ManniX-ITA) | Motor, repositorio de releases | Apache-2.0 | Si | CUDA mediante DSO lateral | Releases estables, fijadas y respaldadas |

No se dispone de datos de rendimiento comparativo entre estas herramientas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo: no incluye pesos, no genera texto y no puede evaluarse con benchmarks de lenguaje.
- No son releases: el propio autor indica que las instantaneas son exclusivamente para pruebas de integracion y que pueden reemplazarse o eliminarse sin aviso.
- Fijado obligatorio: debe anclarse por revision de commit y sha256; usar `main` no garantiza estabilidad.
- Version potencialmente enganosa: la cadena de version incluye la etiqueta de la release anterior, lo que puede inducir a confundir un build de desarrollo con esa release.
- Validacion limitada: cada build solo ha superado las puertas declaradas en su `BUILD_INFO.md`, y nada mas.
- Una iteracion que solo cambia la DSO de CUDA no genera un id nuevo, lo que complica la trazabilidad si no se registra el sha256 de la DSO.
- Senales de adopcion minimas: 0 descargas y 1 like en el momento de la consulta, lo que implica poca validacion por parte de la comunidad.
- Licencia: Apache-2.0 para el motor. Los modelos que se carguen en el pueden tener licencias distintas, y su uso comercial depende de esas licencias, no de la de este repositorio.
- Soporte de idiomas, contexto y cuantizaciones: no disponible, y en todo caso determinado por el modelo cargado.
- No se documentan en la informacion proporcionada integraciones con servidores de inferencia de produccion (vLLM, TGI, Ollama) ni garantias de estabilidad para entornos productivos.

## Enlaces

- Repositorio de desarrollo en HuggingFace: https://huggingface.co/ManniX-ITA/opencoti-llamafile-dev
- Repositorio de releases estables: https://huggingface.co/ManniX-ITA/opencoti-llamafile
- llamafile (mozilla-ai) en GitHub: https://github.com/mozilla-ai/llamafile
- Documentacion de modelos de OpenCode: https://opencode.ai/docs/models/
- Descarga de OpenCode: https://opencode.ai/download
