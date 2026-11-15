# goodmai/gemma-4-26B-A4B-it-QTIP-2.5bpw-MLX

## Resumen

`goodmai/gemma-4-26B-A4B-it-QTIP-2.5bpw-MLX` es un checkpoint experimental de cuantizacion extrema del modelo Gemma 4 26B-A4B de Google, publicado por el usuario goodmai dentro del ecosistema Basalt. Se trata de una derivacion del checkpoint `mlx-community/gemma-4-26B-A4B-it-qat-4bit`, que a su vez parte de `google/gemma-4-26B-A4B-it`. El resultado es un artefacto orientado exclusivamente a Apple Silicon, empaquetado en formato MLX (safetensors) y pensado para ejecutarse con la herramienta Basalt, que no requiere Python.

La propuesta tecnica consiste en aplicar QTIP 2.5 bpw con trellis bitshift (L=16, V=2, HYB Q=9), rotacion de Hadamard aleatoria de Kronecker (Kronecker RHT) y retroalimentacion de Hessiano BlockLDLQ sobre 205 proyecciones densas del modelo, manteniendo los expertos enrutados en 4 bits. El resultado son 14,94 GB de pesos con una perplejidad WikiText-2 de 348,23 en una ventana de 4×4096, muy lejos de los 27.082,19 de una cuantizacion RTN a 2 bits, lo que sugiere que el pipeline QTIP preserva una parte significativa de la calidad del modelo original a costa de una degradacion notable frente al checkpoint de 4 bits.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de cuantizacion agresiva poco habitual en el ecosistema abierto; por otro, advierte de las limitaciones de un checkpoint con cero descargas, sin benchmarks estandar publicados y con un rendimiento medido en una unica metrica interna. Los parametros totales reales reportados en safetensors son 24.290.569.981, no 26B, y el autor no especifica la longitud de contexto ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de Gemma 4 26B-A4B; detalles internos no disponibles |
| Parametros totales | 24.290.569.981 (segun safetensors) |
| Parametros activos | no disponible (el nombre A4B sugiere ~4B activos, sin confirmar en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QTIP 2.5 bpw trellis (L=16, V=2, HYB Q=9) en 205 proyecciones densas; expertos enrutados en 4 bits |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (MLX), tamano de repo 15,0 GB |
| Tamano de pesos | 14,94 GB (205 lineales densas a 2,5 bpw, expertos enrutados a 4 bits) |
| Modelo base | google/gemma-4-26B-A4B-it (via mlx-community/gemma-4-26B-A4B-it-qat-4bit) |
| Libreria | mlx |
| Plataforma objetivo | Apple Silicon (macOS 27+ con Basalt) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base Gemma 4 26B-A4B, que por el sufijo A4B se interpreta como un transformer con mezcla de expertos de aproximadamente 4.000 millones de parametros activos, aunque la model card no detalla el numero de expertos, la dimension oculta ni el mecanismo de enrutamiento. El autor tampoco documenta el entrenamiento original: no se indica el volumen de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. Toda esa informacion corresponde al modelo base de Google y no se reproduce en este repositorio.

La innovacion tecnica de esta publicacion es la cuantizacion. Se aplica QTIP 2.5 bpw con trellis bitshift, parametrizada con L=16, V=2 y cuantizacion hibrida Q=9, combinada con una rotacion de Hadamard aleatoria de Kronecker (Kronecker RHT) y retroalimentacion de Hessiano BlockLDLQ (referencia interna #409) para corregir el error de cuantizacion en 205 proyecciones densas. Los expertos enrutados se mantienen en 4 bits, presumiblemente porque son mas sensibles a la cuantizacion agresiva. El autor reporta que el paso inicial de la conversion presenta una divergencia KL de 0,399 frente a una cuantizacion RTN a 2 bits, cuyo valor es de 27.082,19, lo que cuantifica la mejora del pipeline QTIP frente a una cuantizacion de referencia ingenua.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Gemma 4 26B-A4B, aunque la cuantizacion a 2,5 bpw en las capas densas puede degradar tareas de razonamiento largo.
- Codigo y matematicas: no se documentan evaluaciones especificas en la model card; se asume capacidad heredada del base, sin garantias.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado; el autor solo reporta una prueba de "System One Accuracy" de 294/300 (98,0%), que no se describe con detalle.
- Capacidades multilingues: no disponibles; la model card incluye botones de lanzamiento en ruso e ingles, pero no declara idiomas soportados.
- Capacidades especiales: no se documentan modos de pensamiento (thinking), vision ni audio en este checkpoint.
- Ejecucion local en Apple Silicon sin Python mediante Basalt (macOS 27+), con servidor REST integrado.

## Casos de uso

- Prototipado local en Mac con memoria unificada limitada: con 14,94 GB de pesos, el modelo cabe en equipos Apple Silicon de 24 GB o mas, lo que permite experimentar con un MoE de ~24B parametros sin GPU dedicada. Es adecuado para pruebas de concepto, no para produccion critica.
- Evaluacion de tecnicas de cuantizacion: investigadores que estudien QTIP, trellis bitshift o BlockLDLQ pueden usar este checkpoint como referencia reproducible con el comando `basalt models convert mlx-community/gemma-4-26B-A4B-it-qat-4bit --experimental-qtip 2.5 --out ./out`.
- Asistentes conversacionales offline en macOS: el servidor REST de Basalt permite integrar el modelo en aplicaciones de escritorio o CLI para tareas de chat con contexto moderado, aceptando la perdida de calidad frente al checkpoint de 4 bits.
- Generacion de texto asistida en entornos sin conectividad: al ejecutarse localmente en Apple Silicon, es util para redaccion, resumen o clasificacion en escenarios con requisitos de privacidad, siempre que se valide la calidad en el dominio concreto.
- Comparacion de perplejidad y calidad entre cuantizaciones: el dato de WikiText-2 16k PPL (348,23) sirve como punto de referencia para medir el coste de bajar de 4 bits a 2,5 bpw en modelos MoE.
- Docencia y demostraciones de tecnicas de compresion: permite ilustrar en un aula o taller como la rotacion de Hadamard y la retroalimentacion de Hessiano reducen el error de cuantizacion frente a RTN.

## Benchmarks y rendimiento

| Metrica | Valor medido | Contexto |
|---|---|---|
| WikiText-2 16k PPL (ventana 4×4096) | 348,23 | Checkpoint QTIP 2.5 bpw |
| KL Step-0 vs RTN 2 bits | 0,399 vs 27.082,19 | Divergencia en el paso inicial de conversion |
| System One Accuracy (N=300) | 294/300 (98,0%) | Metrica interna del autor, sin definicion publica |
| Huella de pesos | 14,94 GB | 205 lineales densas a 2,5 bpw; expertos 4 bits |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos son las metricas internas del autor, medidas en un Apple M4 Pro de 24 GB, y no permiten comparacion directa con otros modelos.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 15 GB solo para pesos; con overhead de ejecucion y cache KV, se recomienda un minimo de 24 GB de memoria unificada.
- Hardware validado por el autor: Apple M4 Pro con 24 GB, donde se midieron las metricas reportadas.
- GPU dedicadas: no aplicable; el checkpoint esta en formato MLX y la model card lo orienta exclusivamente a Apple Silicon.
- Cabe en consumer GPU: no en el sentido habitual (NVIDIA/AMD); si cabe en Mac con chip M-series de 24 GB o superior.
- Opciones de despliegue: Basalt (macOS 27+, sin Python) con `basalt serve --model goodmai/gemma-4-26B-A4B-it-QTIP-2.5bpw-MLX --rest`; tambien se puede usar la libreria MLX directamente, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles; el autor no publica tokens por segundo ni tiempos de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Plataforma |
|---|---|---|---|---|---|
| goodmai/gemma-4-26B-A4B-it-QTIP-2.5bpw-MLX | 24,29B totales | QTIP 2,5 bpw + expertos 4 bits | no disponible | gemma | Apple Silicon (MLX) |
| mlx-community/gemma-4-26B-A4B-it-qat-4bit | no disponible | 4 bits QAT | no disponible | gemma | Apple Silicon (MLX) |
| google/gemma-4-26B-A4B-it | no disponible | BF16 original | no disponible | gemma | Multiples (incluye MLX via conversion) |

La comparativa se limita a la familia Gemma 4 porque la informacion proporcionada no incluye alternativas de otros fabricantes con caracteristicas equivalentes. Frente al checkpoint QAT de 4 bits del que deriva, este QTIP reduce el tamano de pesos a 14,94 GB a costa de una perplejidad de 348,23 en WikiText-2; no se dispone de la perplejidad del checkpoint de 4 bits en la informacion facilitada, por lo que no se puede cuantificar la perdida relativa.

## Limitaciones y advertencias

- Cuantizacion experimental: el propio autor la etiqueta como experimental y el pipeline QTIP 2,5 bpw no es un estandar consolidado; los resultados pueden variar entre conversiones.
- Degradacion de calidad: la perplejidad de 348,23 en WikiText-2 es alta en terminos absolutos y sugiere una perdida sustancial de modelado de lenguaje frente al modelo original en BF16 o al checkpoint de 4 bits.
- Cero validacion externa: el repositorio tiene 0 descargas y 0 likes, y las metricas publicadas son internas, sin definicion publica de "System One Accuracy".
- Sin benchmarks estandar: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones multilingues, lo que impide comparar con otros modelos.
- Plataforma restringida: solo Apple Silicon con MLX y Basalt en macOS 27+; no es desplegable en vLLM, TGI, llama.cpp ni Ollama con los formatos publicados.
- Idiomas y contexto no declarados: se desconocen la ventana de contexto efectiva y la cobertura linguistica, lo que impide planificar su uso en produccion multilingue.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de la Gemma Terms of Use de Google, que imponen restricciones de redistribucion y obligaciones de atribucion; conviene revisarlos antes de cualquier despliegue.
- Riesgo de alucinacion: no evaluado en la model card; la cuantizacion agresiva puede incrementar la generacion de contenido incorrecto en tareas factuales.
- Sesgos: no documentados; se heredan los del modelo base de Google, sin analisis especifico en este checkpoint.
- Fecha de publicacion futura (2026-11-15) en los metadatos de Hugging Face, lo que puede indicar un artefacto de prueba o un error de marcado temporal.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/goodmai/gemma-4-26B-A4B-it-QTIP-2.5bpw-MLX
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Checkpoint de origen de la cuantizacion: https://huggingface.co/mlx-community/gemma-4-26B-A4B-it-qat-4bit
- Repositorio Basalt en GitHub: https://github.com/goodmai/basalt
- Demo "Run with Basalt" (chat, ingles): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2Fgemma-4-26B-A4B-it-QTIP-2.5bpw-MLX&role=chat&lang=en
- Demo "Run with Basalt" (chat, ruso): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2Fgemma-4-26B-A4B-it-QTIP-2.5bpw-MLX&role=chat&lang=ru
