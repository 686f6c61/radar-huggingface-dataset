# executorch-community/ExecuTorch-WebGPU-Runtime

## Resumen

ExecuTorch WebGPU Runtime no es un modelo de lenguaje ni una red neuronal entrenada, sino un runtime de inferencia: el motor de ejecución de ExecuTorch compilado a WebAssembly con su backend WebGPU habilitado. Lo publica la organización executorch-community y su función es cargar programas `.pte` (el formato de exportación de ExecuTorch, basado en FlatBuffers) y ejecutarlos dentro de un navegador web, delegando el cálculo de los tensores en la GPU del visitante a través de la API WebGPU. El código WebAssembly se encarga de la orquestación y el scheduling; las operaciones matemáticas del modelo corren en la GPU.

El artefacto se distribuye como dos ficheros que forman una única build y deben usarse juntos: `executorch_wasm_lib.wasm` (6,6 MB) y `executorch_wasm_lib.js` (166 KB). Este último define la función `createExecuTorch()`; tras `await et.initWebGPU()`, un programa `.pte` se carga con `et.Module.load(path)` y se ejecuta con una llamada asíncrona `forward([tensors])`. El repositorio no contiene pesos de ningún modelo: el tamaño total del repo es de 0,0 GB.

Su relevancia actual es la de servir de infraestructura para inferencia en el lado del cliente sin instalación ni backend: es el componente que alimenta el ExecuTorch WebGPU Playground (anunciado en executorch.ai), cuyos modelos se alojan por separado en la colección ExecuTorch WebGPU de HuggingFace. Al no incluir un modelo concreto, no tiene parámetros, longitud de contexto ni idiomas propios; todas esas características dependen de los programas `.pte` que se carguen en él.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Runtime de inferencia en WebAssembly con backend de ejecución WebGPU (no es una red neuronal; no define capas ni pesos) |
| Parametros totales | no disponible (no aplica: el repositorio no contiene parametros de modelo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del programa `.pte` cargado en el runtime) |
| Tipos de cuantizacion | no disponible (el runtime no impone un esquema; depende del grafo exportado en el `.pte`) |
| Idiomas soportados | no disponible (el runtime es agnostico al idioma; depende del modelo y del tokenizador que se usen) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no aplica; carga programas ExecuTorch `.pte` (FlatBuffers) |
| Tipo de artefacto | Build WebAssembly + envoltorio JavaScript (`executorch_wasm_lib.wasm`, `executorch_wasm_lib.js`) |
| Tamano del binario | 6,6 MB el `.wasm`; 166 KB el `.js` |
| Hash SHA-256 (.wasm) | `35a9087d0b6cd86c279e7111adfd54a58156bd993928b20f63348f1043652eb4` |
| Hash SHA-256 (.js) | `8a631b1537927f8f2ef184d9f1b343061f47df0a32ddb8f5190d74e80d40618e` |
| Toolchain de compilacion | Emscripten 4.0.19, con `EXECUTORCH_BUILD_WASM_WEBGPU=ON` sobre `extension/wasm` |
| API de JavaScript | `createExecuTorch()`, `et.initWebGPU()`, `et.Module.load(path)`, `forward([tensors])` (asincrono) |
| Descargas en HuggingFace | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-10-16 |
| Ultima actualizacion | 2026-10-17 |

## Arquitectura y entrenamiento

No hay entrenamiento. Se trata de una compilacion de codigo fuente: la build se genera a partir de las fuentes publicas de ExecuTorch, en concreto del directorio `extension/wasm`, activando la bandera `EXECUTORCH_BUILD_WASM_WEBGPU=ON` y utilizando Emscripten 4.0.19 como toolchain. El fichero `BUILD_INFO.md` del repositorio documenta el toolchain, las fuentes y los comandos exactos empleados. El resultado se divide en un modulo WebAssembly que contiene el runtime y una capa JavaScript que expone la API de carga y ejecucion.

En cuanto a la arquitectura interna, el runtime se apoya en dos capas: el codigo WebAssembly, que gestiona la carga del programa `.pte`, la planificacion del trabajo y la gestion de memoria, y el backend WebGPU, que traduce las operaciones del grafo a llamadas de computacion en GPU mediante WebGPU. La build incluye estaticamente emdawnwebgpu (Dawn), el runtime de Emscripten, musl, libc++, libc++abi, compiler-rt y FlatBuffers; las licencias de estos componentes se recogen en `THIRD_PARTY_NOTICES.txt`. Ademas, el repositorio incluye `vendor/transformers/transformers.min.js`, que es `@huggingface/transformers` 3.0.2 byte a byte identico a la release de npm (Apache-2.0), con `@huggingface/jinja` y `onnxruntime-web` empaquetados bajo licencia MIT. El playground lo utiliza unicamente para tokenizadores y plantillas de chat, y verifica su SHA-256 antes de importarlo.

## Capacidades

- Carga y ejecucion de programas ExecuTorch en formato `.pte` dentro de un navegador web.
- Delegacion de la computacion de tensores a la GPU del cliente mediante el backend WebGPU.
- Ejecucion asincrona de inferencia a traves de `forward([tensors])`, lo que permite no bloquear el hilo principal si se gestiona adecuadamente.
- Inicializacion explicita del backend de GPU con `et.initWebGPU()` antes de cargar modulos.
- Verificacion de integridad de los artefactos por SHA-256, tanto del `.wasm` como del fichero de tokenizadores, tal como hace el playground.
- Integracion con tokenizadores y plantillas de chat de `@huggingface/transformers` 3.0.2 para el preprocesado y postprocesado de texto cuando el modelo cargado lo requiera.
- Ejecucion en el lado del cliente sin backend propio: no requiere servidor de inferencia ni instalacion por parte del usuario.
- Soporte de modelos multimodales o de texto en funcion del `.pte` que se cargue; el runtime en si no impone una modalidad.
- No incluye tool calling, function calling, modo de razonamiento ni agentes a nivel de runtime: esas capacidades, si existen, dependen del modelo exportado y del codigo de la aplicacion que lo orquesta.
- No dispone de capacidades multilingues propias; dependen del tokenizador y del modelo utilizados.

## Casos de uso

- Demostraciones interactivas en navegador sin backend: un desarrollador puede publicar un modelo exportado a `.pte` en una pagina web y dejar que la inferencia ocurra en la GPU del visitante, eliminando el coste de servidores de inferencia y la latencia de red asociada.
- Playground de experimentacion de modelos: es precisamente el caso de uso declarado del artefacto, que alimenta el ExecuTorch WebGPU Playground de executorch.ai con los modelos de la coleccion ExecuTorch WebGPU.
- Prototipado rapido de integraciones de IA en front-end: permite validar la viabilidad de una funcion de IA en el navegador antes de invertir en infraestructura de servidor, usando la API `createExecuTorch()` sobre un `.pte` de prueba.
- Aplicaciones con requisitos de privacidad estrictos: al ejecutar la inferencia en el dispositivo del usuario, los datos de entrada no tienen por que salir del navegador, lo que resulta adecuado para escenarios con datos personales o sensibles donde se quiera evitar el envio a un servidor.
- Distribucion de demos de investigacion: un equipo puede publicar un modelo en HuggingFace junto con una pagina que cargue este runtime, de modo que revisores y lectores prueben el modelo sin instalar dependencias ni GPUs locales.
- Herramientas educativas sobre inferencia en el borde: sirve para explicar como funciona la delegacion de grafos, el particionado de operadores y el scheduling en un runtime de ejecucion, con la ventaja de que el resultado es visible directamente en el navegador.
- Validacion de exportaciones: comprobar que un grafo exportado a `.pte` se ejecuta correctamente bajo WebGPU antes de integrarlo en otros entornos, verificando ademas el SHA-256 del binario para descartar corrupciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye cifras de latencia, throughput, consumo de memoria ni comparativas de rendimiento frente a otros backends.

## Requisitos de hardware

- VRAM estimada: no disponible. Al no incluir pesos, la memoria necesaria depende enteramente del modelo `.pte` que se cargue y del esquema de cuantizacion con el que se haya exportado.
- GPU recomendadas: no aplica en el sentido habitual. El requisito real es un navegador con soporte de WebGPU y una GPU compatible con dicha API; no se especifican modelos concretos en la informacion disponible.
- Compatibilidad con GPU de consumo: no disponible. Depende de la implementacion de WebGPU del navegador y del controlador grafico del sistema, no de una eleccion de hardware por parte del desarrollador.
- Opciones de despliegue: la propia build WebAssembly mas el backend WebGPU. El runtime de ExecuTorch es compatible con otros despliegues (por ejemplo, entornos nativos), pero esta publicacion concreta esta orientada a navegador.
- Latencia y throughput estimados: no disponibles. Dependen del modelo cargado, de la GPU del cliente y de la implementacion de WebGPU del navegador.
- Requisitos de red: la descarga inicial del binario es de 6,6 MB para el `.wasm` y 166 KB para el `.js`, a lo que hay que sumar el tamano del modelo `.pte` que se cargue.

## Comparativa con modelos similares

No disponible en sentido estricto: este artefacto no es un modelo, por lo que no compite con modelos de lenguaje o vision, sino con otros runtimes de inferencia en navegador. La comparacion se plantea por tanto a nivel de runtime.

| Runtime | Tipo de artefacto | Backend de aceleracion | Licencia | Notas |
|---|---|---|---|---|
| ExecuTorch WebGPU Runtime | WebAssembly + JS | WebGPU | BSD-3-Clause | Carga programas `.pte`; verifica SHA-256 de sus artefactos |
| ONNX Runtime Web | WebAssembly + JS | WebGPU / WebNN / WASM | no disponible en la informacion proporcionada | Aparece empaquetado dentro de `transformers.min.js`, usado por el playground para tokenizadores |
| @huggingface/transformers 3.0.2 | Biblioteca JavaScript | Segun el backend de ONNX Runtime | Apache-2.0 | Incluida en el repositorio bajo `vendor/transformers/`, solo para tokenizadores y plantillas de chat |

Los datos de rendimiento comparado entre estos runtimes no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo: no genera texto ni produce predicciones por si mismo. Cualquier evaluacion de calidad debe hacerse sobre el modelo `.pte` que se cargue en el.
- Dependencia de WebGPU: el backend principal requiere que el navegador y el sistema operativo soporten WebGPU. En entornos sin ese soporte, el artefacto no puede utilizarse tal cual y no se documenta un camino de respaldo.
- Ausencia de datos de rendimiento: no hay benchmarks publicados, por lo que no es posible estimar latencia o throughput sin medirlos en el escenario objetivo.
- Sin datos de sesgo ni de alucinacion: al no contener un modelo, no procede hablar de sesgos propios. Las limitaciones de este tipo corresponden al modelo que se ejecute sobre el runtime.
- Sin informacion de idiomas: no se declara ninguna lista de idiomas soportados a nivel de runtime.
- Superficie de confianza: el propio playground descarga el `.wasm` desde este repositorio y comprueba su SHA-256 antes de pasarlo al cargador. Cualquier integracion deberia replicar esa verificacion de integridad y aplicar una politica de origen adecuada, dado que se ejecuta codigo compilado de terceros.
- Licencia: BSD-3-Clause para ExecuTorch y su build. Los componentes incluidos estaticamente (emdawnwebgpu/Dawn, Emscripten, musl, libc++, libc++abi, compiler-rt, FlatBuffers) tienen sus propias licencias recogidas en `THIRD_PARTY_NOTICES.txt`, y el tokenizador empaquetado es Apache-2.0 con partes MIT. Es necesario revisar esos ficheros antes de un uso comercial o de una redistribucion.
- Version pinneada del tokenizador: `vendor/transformers/transformers.min.js` corresponde exactamente a `@huggingface/transformers` 3.0.2; actualizarlo requiere revisar la compatibilidad y recalcular el SHA-256 que verifica el playground.
- Fechas de publicacion: el repositorio indica creacion el 2026-10-16 y ultima actualizacion el 2026-10-17, con 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto reciente y con poca validacion externa registrada.
- Repositorio de 0,0 GB: no incluye pesos, de modo que cualquier despliegue debe obtener los modelos `.pte` por separado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/executorch-community/ExecuTorch-WebGPU-Runtime
- Coleccion ExecuTorch WebGPU en HuggingFace: https://huggingface.co/collections/executorch-community/executorch-webgpu-6ad04f227dfe83b94306a8b1
- Repositorio de ExecuTorch en GitHub: https://github.com/pytorch/executorch
- Sitio del playground: https://executorch.ai
- Ficheros del repositorio: `executorch_wasm_lib.wasm`, `executorch_wasm_lib.js`, `BUILD_INFO.md`, `LICENSE`, `THIRD_PARTY_NOTICES.txt`, `vendor/transformers/transformers.min.js`, `vendor/transformers/LICENSE`, `vendor/transformers/THIRD_PARTY_NOTICES.txt`
