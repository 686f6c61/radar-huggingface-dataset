# nile-academy/smollm3-3b-gguf

## Resumen

nile-academy/smollm3-3b-gguf es una conversión a GGUF del modelo SmolLM3-3B de HuggingFaceTB, publicada por el usuario nile-academy como artefacto de primera parte para el proyecto BookAlive. No se trata de un modelo entrenado desde cero, sino de una cuantización Q4_K_M derivada de los pesos originales en safetensors, pensada para generación de texto local sin dependencia de GPUs de gama alta. El repositorio contiene únicamente datos: un fichero `SmolLM3-3B-Q4_K_M.gguf` de 1.915.305.792 bytes, sin runtime de inferencia ni código Python.

El modelo conserva los 3.075.098.624 parámetros del modelo base (aproximadamente 3,08 mil millones), por lo que se sitúa en la franja de los modelos pequeños que caben en GPU de consumo e incluso en CPU con memoria unificada. La licencia declarada es Apache-2.0, heredada del publicador original, y el repositorio se marca como `endpoints_compatible` y `conversational`. El autor advierte explícitamente de que la conversión no ha sido validada numéricamente frente al modelo original y de que es un candidato de desarrollo, no una versión apta para producción.

Su relevancia es acotada pero concreta: ofrece una ruta reproducible y documentada (revisión fijada del modelo padre, revisión concreta de llama.cpp, hashes de entrada y salida en `conversion.json`) para desplegar SmolLM3-3B en entornos locales de generación de texto, con el foco puesto en la narración de audiolibros y la generación de explicaciones tipo clase magistral. A fecha de la ficha acumula 0 descargas y 0 valoraciones en HuggingFace, por lo que su adopción es todavía nula y no existe retroalimentación de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada; corresponde a la del modelo base SmolLM3-3B (transformer decoder-only) |
| Parametros totales | 3.075.098.624 (aproximadamente 3,08 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la informacion proporcionada; el repositorio incluye la model card original como `README.upstream.md` |
| Tipos de cuantizacion | GGUF Q4_K_M (unica variante publicada en este repositorio); el proceso documentado es safetensors -> F16 GGUF -> Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`SmolLM3-3B-Q4_K_M.gguf`, 1.915.305.792 bytes, SHA-256 `cbf626619fe9883b27593b3454b36a79805ab3ca4362b65672fb00ba2bd17e55`) |
| Modelo base | HuggingFaceTB/SmolLM3-3B, revision fijada `a07cc9a04f16550a088caea529712d1d335b0ac1` |
| Relacion con el modelo base | `quantized` |
| Tamano del repositorio | 1,9 GB |
| Modalidad | solo texto (no se incluye proyector de vision) |
| Libreria | gguf / llama.cpp |

## Arquitectura y entrenamiento

Este repositorio no documenta entrenamiento propio: es una conversión de pesos. El pipeline declarado es safetensors de entrada -> GGUF en F16 -> cuantización Q4_K_M, realizada sin calibración mediante matriz de importancia (importance matrix). La conversión se ejecutó en modo offline, con el código personalizado de modelo y tokenizador descargado deshabilitado, usando la revisión de llama.cpp `c173a53bdfca1047c710018dc934a6d67a8b010f`. Los hashes exactos de entrada y salida, el parche del exportador y las versiones de las dependencias quedan registrados en `conversion.json`.

La arquitectura subyacente, por tanto, es la del modelo base SmolLM3-3B, cuyas características internas (tipo de atención, número de capas, estrategia de razonamiento) no se detallan en la información proporcionada más allá de la referencia al repositorio de HuggingFaceTB y de la model card que se incluye como `README.upstream.md`. La innovación técnica destacable de esta publicación no está en el modelo sino en la trazabilidad del proceso de cuantización: revisión fija del padre, revisión fija del conversor y verificación de que los bytes del prompt revisado coinciden con la plantilla del publicador original.

## Capacidades

- Generacion de texto en modo `text-generation`, con etiqueta `conversational` declarada en el repositorio.
- Generacion de narracion para audiolibros: es el caso de uso principal declarado por el autor para el proyecto BookAlive.
- Generacion de explicaciones tipo clase magistral: el autor menciona pruebas con "explanation-lecture probes".
- Inferencia local en CPU: la validacion realizada incluye "synthetic CPU readiness".
- Capacidades multilingues: no documentadas en la informacion proporcionada.
- Tool calling / function calling: no documentado en este repositorio.
- Soporte de agentes y razonamiento multi-paso: no documentado en este repositorio.
- Vision, audio u otras modalidades: no disponibles; el autor indica explicitamente que es una via solo texto y que no se incluye proyector de vision.
- Modo de razonamiento explicito (thinking): no documentado en este repositorio.

## Casos de uso

- **Generacion de audiolibros en local**: el modelo se distribuye como parte del instalador de BookAlive y se ha probado con "constrained audiobook probes"; permite sintetizar texto narrativo en una maquina sin GPU dedicada, con el fichero GGUF cargado desde disco.
- **Generacion de material docente**: las pruebas de "explanation-lecture probes" apuntan a la produccion de explicaciones largas y estructuradas para contenido educativo, generadas de forma offline.
- **Prototipado de asistentes conversacionales**: al ser un GGUF de 1,9 GB y con etiqueta `conversational`, se puede levantar un servidor `llama-server` en un portatil para iterar sobre prompts y plantillas antes de escalar a un modelo mayor.
- **Procesamiento por lotes en CPU**: para pipelines nocturnos de resumen o reescritura de textos donde no hay GPU disponible, basta con RAM suficiente y llama.cpp compilado para el hardware objetivo.
- **Integracion en aplicaciones de escritorio**: al contener solo datos y no runtime, el modelo se puede empaquetar como recurso dentro de un instalador y ejecutarse con la libreria que elija la aplicacion anfitriona.
- **Base para ajuste fino ligero posterior**: al ser un GGUF derivado de SmolLM3-3B, sirve como referencia de comportamiento para comparar contra el modelo original en F16 antes de decidir una cuantizacion distinta.
- **Pruebas de regresion de infraestructura**: util como carga de trabajo estandarizada para medir throughput de llama.cpp en distintas CPUs, GPUs y plataformas moviles, dado su tamano reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye cifras de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni comparativas numericas con el modelo original en F16.

La unica validacion descrita es cualitativa y de integracion: superacion de pruebas sinteticas de preparacion en CPU, pruebas acotadas de audiolibro y pruebas de explicacion tipo clase magistral. El propio autor aclara que estas comprobaciones establecen un comportamiento de integracion acotado, no equivalencia numerica, fidelidad semantica, calidad de escucha ni precision clinica, y que no se han realizado evaluaciones del modelo ni revision humana.

## Requisitos de hardware

- **Peso en disco y en memoria**: el fichero GGUF ocupa 1.915.305.792 bytes (aproximadamente 1,78 GiB / 1,92 GB). La VRAM o RAM minima para los pesos es de unos 2 GB.
- **VRAM estimada para inferencia**: del orden de 2,5 a 4 GB en total, sumando pesos y cache KV, en funcion de la longitud de contexto configurada. Es una estimacion, no un dato publicado.
- **GPU de consumo**: cabe holgadamente en GPUs con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 3050 de 8 GB, GTX 1660 de 6 GB). En GPUs de 4 GB el modelo entra por poco y obliga a reducir la ventana de contexto.
- **CPU**: es viable la inferencia solo en CPU, ya que el autor reporta pruebas de preparacion en CPU con este formato.
- **Memoria unificada**: apto para equipos Apple Silicon, asignando el modelo a memoria unificada.
- **GPU de datacenter**: no es el publico objetivo; el modelo tambien funciona en A100 o H100, pero no aprovecha su capacidad.
- **Opciones de despliegue**: llama.cpp (binario `llama-server` o `llama-cli`), Ollama, LM Studio, `llama-cpp-python` y koboldcpp. vLLM tiene soporte de GGUF con limitaciones. TGI no carga GGUF de forma nativa. El autor indica que el runtime compilado se distribuye por separado mediante el instalador de la aplicacion.
- **Latencia y throughput**: no disponible. El autor afirma explicitamente que no se han realizado cualificaciones de latencia, termicas, de GPU con 8 GB de VRAM, de navegador ni de movil.

## Comparativa con modelos similares

Los datos de terceros que aparecen a continuacion son caracteristicas publicas de esos modelos y no se han verificado en este repositorio; se incluyen solo como referencia de categoria.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| nile-academy/smollm3-3b-gguf (este) | 3,08 mil millones | no disponible | Apache-2.0 | GGUF Q4_K_M | 0 descargas, publicacion reciente |
| HuggingFaceTB/SmolLM3-3B (origen) | 3,08 mil millones | no disponible en la informacion proporcionada | Apache-2.0 | safetensors | modelo de referencia del que deriva esta conversion |
| Otras conversiones GGUF del mismo modelo base | 3,08 mil millones | no disponible | Apache-2.0 | GGUF | existen publicaciones de terceros, sin datos verificados aqui |
| Qwen2.5-3B-Instruct (categoria similar) | aproximadamente 3,09 mil millones | 32 768 tokens, ampliable | Apache-2.0 | safetensors, GGUF | ampliamente desplegado |
| Llama-3.2-3B-Instruct (categoria similar) | aproximadamente 3,21 mil millones | 128 000 tokens | Llama 3.2 Community License | safetensors, GGUF | ampliamente desplegado |
| Phi-3.5-mini-instruct (categoria similar) | aproximadamente 3,8 mil millones | 128 000 tokens | MIT | safetensors, GGUF | ampliamente desplegado |

No hay datos de rendimiento comparado disponibles para este repositorio, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- **Sin validacion de equivalencia**: el autor indica que las comprobaciones realizadas establecen un comportamiento de integracion acotado, no equivalencia numerica ni fidelidad semantica respecto al modelo original.
- **Cuantizacion sin calibracion**: la conversion Q4_K_M se hizo sin matriz de importancia, lo que en la practica puede degradar mas la calidad que una cuantizacion calibrada del mismo bit-width.
- **Candidato de desarrollo**: la model card lo describe explicitamente como "development candidate, not release-qualified".
- **Sin cualificacion de rendimiento**: no se han realizado pruebas de latencia, de comportamiento termico, de GPU con 8 GB de VRAM, de movil ni de navegador.
- **Riesgo de alucinacion**: no cuantificado en la informacion disponible; al ser un modelo de 3 mil millones de parametros, la generacion de contenido no verificado es esperable, pero no hay mediciones publicadas.
- **Sesgos**: no documentados en la informacion proporcionada.
- **Idiomas**: no se declara ninguna lista de idiomas soportados, lo que impide garantizar un comportamiento correcto en castellano sin evaluacion previa.
- **Contexto**: se desconoce la longitud de contexto efectiva con la que se puede operar este fichero sin degradacion.
- **Vision**: no hay proyector de vision; cualquier caso de uso multimodal queda descartado.
- **Dependencia del instalador**: el runtime compilado se distribuye aparte, de modo que el repositorio por si solo no permite ejecutar inferencia sin montar llama.cpp u otro cargador compatible.
- **Scripts con verificaciones pendientes**: el autor senala que los scripts basados en fuentes todavia requieren comprobaciones estructurales, de procedencia, de integridad y de derechos.
- **Licencia**: Apache-2.0 permite uso comercial, pero al tratarse de una conversion de un modelo de terceros conviene conservar los avisos de licencia y de atribucion del publicador original.
- **Adopcion nula**: 0 descargas y 0 valoraciones implican ausencia de validacion independiente por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nile-academy/smollm3-3b-gguf
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Revision fijada del modelo padre: https://huggingface.co/HuggingFaceTB/SmolLM3-3B/tree/a07cc9a04f16550a088caea529712d1d335b0ac1
- Conversor llama.cpp: https://github.com/ggml-org/llama.cpp
- Revision de llama.cpp usada en la conversion: c173a53bdfca1047c710018dc934a6d67a8b010f
- Artefactos del repositorio: `SmolLM3-3B-Q4_K_M.gguf`, `README.upstream.md`, `conversion.json`
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada (los resultados de busqueda web recibidos no guardan relacion con este modelo)
