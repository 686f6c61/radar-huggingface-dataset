# antareslabs/hunch-0.6b-preview-MLX

## Resumen

hunch-0.6b-preview-MLX es la conversión al framework MLX del modelo antareslabs/hunch-0.6b-preview, publicada por el propio equipo antareslabs. MLX es el framework de Apple para ejecutar modelos de forma nativa sobre silicio de Apple mediante Metal, de modo que esta variante permite cargar y ejecutar el modelo en equipos Mac con chips de la serie M sin depender de CUDA ni de GPU NVIDIA.

El modelo base tiene un tamaño de aproximadamente 0,6 mil millones de parametros, segun se deduce de su nomenclatura (0.6b), aunque no se confirma en la informacion disponible. La aportacion principal de esta conversion no es un cambio de capacidades, sino una validacion de equivalencia numerica: cada archivo publicado se evaluo sobre 6.000 preguntas reservadas frente a la ejecucion en fp32 del mismo checkpoint en PyTorch.

Solo se publica la precision F16 (hunch-0.6b-preview-mlx-f16), que cambia 0 de esas 6.000 respuestas respecto a fp32, mientras que una variante bf16 cambiaria 28. La distribucion se realiza bajo licencia Apache-2.0. No se documentan en la informacion disponible la arquitectura interna, los idiomas soportados ni la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | ≈0,6 mil millones (indicado por la nomenclatura del modelo; no confirmado en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (MLX). Se evaluo tambien bf16, que no se publica como archivo en este repositorio y cambia 28 de 6.000 respuestas frente a fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |
| Autor | antareslabs |
| Modelo base | antareslabs/hunch-0.6b-preview |
| Tamaño del repositorio | 1,2 GB |
| Libreria | mlx |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo base (transformer, MoE, SSM u otra) ni los datos de entrenamiento, el numero de tokens, la composicion del dataset o si hubo ajuste con RLHF/DPO. Al tratarse de una conversion de formato y no de un reentrenamiento, la arquitectura, los pesos y el comportamiento esperado son los del checkpoint antareslabs/hunch-0.6b-preview.

La innovacion tecnica documentada es el procedimiento de conversion y su puerta de equivalencia. Cada archivo MLX se puntuo sobre las 6.000 preguntas reservadas frente a la ejecucion en fp32 del mismo checkpoint en PyTorch. Para la variante F16 el resultado es de 0 cambios de respuesta, con un max TV de 5,69e-03 frente a un umbral (floor) de 7,68e-02, y el gate se marca como "pass". La variante bf16, como referencia, cambia 28 respuestas. La temperatura de release viene embebida en el archivo y se aplica por defecto.

## Capacidades

- La informacion proporcionada no documenta capacidades de tarea especificas (generacion de texto, razonamiento, codigo, matematicas, vision, tool calling o agentes) para este modelo ni para su base.
- Ejecucion de inferencia nativa en Apple silicon mediante MLX sobre Metal.
- Carga mediante el cargador especifico `hunch.formats.hunch_mlx.load(path)` del repositorio de Hunch.
- Aplicacion automatica de la temperatura de release, embebida en el propio archivo de pesos.
- Equivalencia numerica verificada frente a la ejecucion fp32 del checkpoint base en las 6.000 preguntas reservadas.
- Distribucion en formato safetensors para MLX.

No se dispone de informacion sobre soporte multilingue, modos de razonamiento (thinking mode) ni capacidades multimodales.

## Casos de uso

- Inferencia local en Mac con Apple silicon: cargar el modelo con MLX y ejecutarlo sobre Metal aprovecha la memoria unificada de los chips de la serie M, evitando depender de GPU NVIDIA para disponer de una instancia local del modelo.
- Prototipado y desarrollo en el portatil del desarrollador: al ocupar los pesos F16 aproximadamente 1,2 GB, el modelo se puede mantener cargado en memoria mientras se prueba una aplicacion cliente sin necesidad de infraestructura remota.
- Validacion de conversiones y control de calidad: el gate de equivalencia sobre 6.000 preguntas reservadas sirve como plantilla metodologica para verificar que una conversion de precision no degrada las respuestas de un modelo respecto a su ejecucion en fp32.
- Evaluacion previa a un despliegue mayor: permite comprobar en local el comportamiento del checkpoint antes de decidir su integracion en un servicio con mas recursos.
- Experimentacion con cuantizacion y precision: la comparacion entre F16 (0 cambios) y bf16 (28 cambios) sobre el mismo conjunto de preguntas es un caso concreto para estudiar la sensibilidad de un modelo a la precision numerica.
- Entornos sin soporte CUDA: equipos de desarrollo o laboratorios basados exclusivamente en hardware de Apple pueden ejecutar este modelo con la libreria mlx en lugar de recurrir a stacks CUDA/ROCm.
- Docencia y practicas sobre formatos de pesos: el repositorio ilustra el flujo conversion, validacion y carga a traves de un cargador propio, util como material de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica evaluacion documentada es el gate de equivalencia numerica de la conversion, que se recoge a continuacion:

| Metrica | Valor |
|---|---|
| Preguntas reservadas evaluadas | 6.000 |
| Respuestas distintas de fp32, F16 | 0 de 6.000 |
| Respuestas distintas de fp32, bf16 (referencia) | 28 de 6.000 |
| Max TV (F16) | 5,69e-03 |
| Umbral (floor) del gate | 7,68e-02 |
| Resultado del gate (F16) | pass |

## Requisitos de hardware

- Tamaño de los pesos F16: aproximadamente 1,2 GB (coincide con el tamaño del repositorio).
- VRAM/RAM estimada para inferencia: del orden de 1,2 GB solo para los pesos, mas el overhead de la cache KV y las activaciones; con contexto y lote moderados, en torno a 2-4 GB de memoria unificada.
- GPU recomendadas: al ser un modelo MLX, se ejecuta sobre silicio de Apple (Metal); no esta pensado para GPU NVIDIA (A100, H100, RTX 4090) con CUDA.
- Cabe en hardware de consumo: si, en cualquier Mac con chip de la serie M; no se documentan requisitos minimos exactos de generacion de chip ni de memoria.
- Opciones de despliegue: libreria mlx (y el ecosistema mlx-lm) y el cargador `hunch.formats.hunch_mlx.load(path)` del repositorio de Hunch. No es compatible directamente con vLLM, TGI, llama.cpp u Ollama, que no consumen pesos MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion disponible no incluye comparaciones con otros modelos. La unica comparacion que puede establecerse con datos es entre esta conversion y el checkpoint base del que deriva:

| Modelo | Parametros | Contexto | Licencia | Formato | Precision de referencia |
|---|---|---|---|---|---|
| antareslabs/hunch-0.6b-preview | ≈0,6 mil millones | no disponible | Apache-2.0 | PyTorch (safetensors) | fp32 |
| antareslabs/hunch-0.6b-preview-MLX (este) | ≈0,6 mil millones | no disponible | Apache-2.0 | MLX (safetensors) | F16 |

No se identifican en la informacion proporcionada otros modelos comparables de la misma categoria con especificaciones verificables, por lo que la comparativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Version preview: la nomenclatura indica que no es una version definitiva del modelo.
- La equivalencia se ha validado solo sobre 6.000 preguntas reservadas y con un criterio propio del autor; no sustituye a una evaluacion de capacidades ni garantiza un comportamiento identico en todos los dominios.
- Sensibilidad a la precision: aunque F16 no cambia ninguna respuesta en el conjunto evaluado, la variante bf16 cambia 28, lo que indica que las variaciones de precision pueden alterar la salida.
- Formato exclusivo MLX: no se ejecuta en stacks CUDA o ROCm, lo que limita su uso a hardware de Apple.
- No se documentan idiomas soportados, por lo que no puede garantizarse cobertura multilingue ni descartar un sesgo hacia un idioma concreto.
- Al ser un modelo de aproximadamente 0,6 mil millones de parametros, cabe esperar una capacidad limitada en tareas de razonamiento complejo o contexto largo en comparacion con modelos de mayor tamano, aunque no se aportan datos que lo cuantifiquen.
- Licencia Apache-2.0: permite uso comercial, con las obligaciones de atribucion y aviso habituales de esta licencia.
- El repositorio registra 0 descargas y 0 "me gusta", por lo que carece de validacion por parte de la comunidad.
- La temperatura de release viene embebida en el archivo y se aplica por defecto; hay que tenerlo en cuenta al reproducir resultados o al fijar la temperatura manualmente.
- La carga requiere un cargador especifico (`hunch.formats.hunch_mlx.load`), lo que puede dificultar su integracion en herramientas estandar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/antareslabs/hunch-0.6b-preview-MLX
- Modelo base: https://huggingface.co/antareslabs/hunch-0.6b-preview
- Model card del modelo base: https://huggingface.co/antareslabs/hunch-0.6b-preview
- Repositorio de Hunch (README): https://github.com/antareslabsorg/hunch/blob/main/README.md
- Reglas del gate y builds que no lo superaron (FORMATS.md): https://github.com/antareslabsorg/hunch/blob/main/FORMATS.md
