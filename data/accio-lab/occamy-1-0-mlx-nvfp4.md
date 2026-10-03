# Accio-Lab/occamy-1.0-MLX-nvfp4

## Resumen

Occamy-1.0-MLX-nvfp4 es un checkpoint cuantizado del modelo Occamy-1.0, desarrollado por Accio-Lab (Laboratorio Accio), distribuido en formato nativo de MLX con cuantización NVFP4 de 4 bits y tamano de grupo 16. Se trata de un artefacto derivado del modelo base `Accio-Lab/occamy-1.0`, que segun la etiqueta de arquitectura del repositorio (`qwen3_5_moe`) es un transformer con mezcla de expertos (MoE) de aproximadamente 34.660 millones de parametros totales, orientado a generacion de texto y uso conversacional. El checkpoint ocupa 19.508.964.296 bytes (19,51 GB / 18,169 GiB) en pesos y esta pensado para ejecucion local en hardware Apple Silicon mediante MLX.

El problema que resuelve es el de reduccion de huella de memoria y coste de despliegue: al pasar de BF16 a un formato NVFP4 de 4 bits, el modelo cabe en equipos de gama alta de consumo, con una perdida de perplejidad medida y acotada (8,3074 en BF16 frente a 8,9242 en NVFP4 sobre un subconjunto reservado de WikiText). Ademas, forma parte de una familia completa de cuantizaciones MLX (8bit, 6bit, 5bit, 4bit, 3bit, mxfp8, mxfp4 y nvfp4) publicada por el mismo autor.

Su relevancia actual es doble: por un lado, amplia el ecosistema de pesos cuantizados nativos para MLX sin requerir readaptadores en tiempo de carga; por otro, el checkpoint se publica explicitamente como "candidate release", con la aceptacion en Mac Metal pendiente de verificacion, lo que lo convierte en un artefacto adecuado para evaluacion tecnica pero no todavia para produccion critica. El modelo acompania al informe tecnico "Occamy-1.0: Open Pareto-frontier 35B Intelligence for Co-work" (arXiv:2609.11977) y mantiene licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (etiqueta de repositorio `qwen3_5_moe`); detalles internos completos no disponibles |
| Parametros totales | 34.660.608.768 (34,66 mil millones, dato real de safetensors) |
| Parametros activos | no disponible (modelo MoE; el autor no publica numero de parametros activos ni total de expertos) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4 nativo de MLX, 4 bits, tamano de grupo 16 en los pesos; puertas de router y de expertos compartidos en 8 bits afines, tamano de grupo 64; activaciones de inferencia en BF16 |
| Idiomas soportados | no disponible como declaracion oficial; los fixtures de validacion cubren instrucciones en ingles y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato nativo MLX (`mlx` / `mlx-lm`); vision y MTP son exportaciones separadas |
| Tamano de los pesos | 19.508.964.296 bytes = 19,51 GB = 18,169 GiB |
| Revision del modelo base | `8f8e0e58a3c9df042be1a3fa2c191fd8047acfb8` |
| Versionado de exportacion | mlx 0.32.2, mlx-lm 0.31.3, transformers 5.8.1 |
| Modalidad de entrada | solo texto |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creacion | 2026-10-02 |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como perteneciente al tipo `qwen3_5_moe`, es decir, un transformer con capas de mezcla de expertos. El checkpoint cuantizado conserva 512 modulos cuantizados y, durante la conversion, el adaptador sin perdida incluido (`layout_adapter.py`) apila 30.720 tensores de experto separados en orden numerico dentro de 120 grupos e invoca una unica vez el sanitizador oficial de MLX. La cuantizacion se realizo directamente desde BF16 usando las API nativas de MLX, sin entradas recuantizadas, y los pesos exportados se recargan directamente con `mlx-lm` estandar, sin necesidad de adaptador.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo base utilizo RLHF, DPO u otra tecnica de alineacion; estos datos corresponden a la ficha del modelo base `Accio-Lab/occamy-1.0` y no se detallan en el repositorio consultado. La innovacion tecnica destacable de este checkpoint concreto es el formato NVFP4 nativo de MLX con grupo de 16, que combina pesos de 4 bits con activaciones BF16, ademas del esquema diferenciado de cuantizacion para las puertas de enrutamiento (8 bits, grupo 64), lo que protege la seleccion de expertos frente a la perdida de precision.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y chino, segun los fixtures de validacion incluidos.
- Modo de razonamiento explicito ("thinking"), activable o desactivable mediante el parametro `enable_thinking` de la plantilla de chat.
- Aritmetica basica y tareas de calculo directo (se incluye un fixture de comprobacion aritmetica).
- Salida en formato JSON estructurado (fixture de validacion especifico).
- Memoria de conversacion dentro del contexto: se valida un fixture de memoria conversacional.
- Servidor HTTP local compatible con la API OpenAI (`mlx_lm.server`, endpoints `/v1/chat/completions`).
- Generacion greedy determinista verificada con 8 fixtures de comparacion exacta.

No hay evidencia en la informacion proporcionada de soporte verificado de tool calling o function calling, ni de integracion con agentes o razonamiento multi-paso. La model card indica explicitamente que la aceptacion de integracion con herramientas y agentes permanece sin verificar. Tampoco se incluye vision ni MTP en este checkpoint: son exportaciones separadas segun la propia ficha.

## Casos de uso

- Co-work de desarrollo en local: el modelo esta pensado para asistencia de programacion y co-trabajo en el puesto de trabajo, con 34,66 mil millones de parametros totales comprimidos a 18,169 GiB, lo que permite mantenerlo residente en un unico equipo Apple Silicon sin depender de servicios externos.
- API local compatible con OpenAI: mediante `mlx_lm.server` se expone en `http://127.0.0.1:8000/v1` y se integra directamente en clientes y herramientas que ya hablan el protocolo de OpenAI, sin cambios de codigo en el cliente.
- Generacion de codigo en entornos con requisitos de privacidad: al ejecutarse en hardware propio y no requerir conexion saliente, resulta adecuado para bases de codigo que no pueden enviarse a APIs en la nube; la validacion Linux se realizo ademas sobre MLX CUDA 12 en NVIDIA B200, lo que abre la via de servidores con GPU NVIDIA.
- Procesamiento de instrucciones bilingues ingles-chino: los fixtures de calidad cubren explicitamente ambos idiomas, por lo que encaja en equipos y flujos de trabajo mixtos angloparlantes y sinoparlantes.
- Extraccion de datos con salida JSON: el fixture de validacion de JSON confirma la capacidad de devolver estructuras serializables, aprovechable en pipelines de normalizacion, clasificacion o rellenado de formularios.
- Asistentes conversacionales con memoria de contexto: el fixture de memoria de conversacion valida el mantenimiento de informacion entre turnos, util en atencion al cliente o asistentes internos de documentacion.
- Razonamiento aritmetico y de varios pasos con modo thinking: activando `enable_thinking` se puede forzar una cadena de razonamiento antes de la respuesta, apropiado para verificaciones de calculo, presupuestos o comprobaciones logicas.
- Evaluacion comparativa de tecnicas de cuantizacion: el par BF16 frente a NVFP4 con la misma semilla, tokenizador y conjunto de evaluacion (misma particion, 8.192 identificadores de token, 16 fragmentos de contexto 512) permite medir el coste real de la cuantizacion de 4 bits con grupo 16 en un protocolo reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato cuantitativo de calidad es la perplejidad comparada sobre un subconjunto reservado de WikiText:

| Comprobacion nativa MLX emparejada | Perplejidad (subconjunto reservado de WikiText) |
|---|---:|
| BF16 | 8,3074 |
| MLX NVFP4 | 8,9242 |

Condiciones del test, identicas para ambas variantes: mismo tokenizador, 8.192 identificadores de token, 16 fragmentos independientes con contexto 512 y 4.096 tokens puntuados, con prefijo no puntuado de 256 tokens por fragmento y estado de modelo reiniciado. La propia model card advierte que esta prueba es reducida, que no establece calidad de benchmark completa y que los numeros solo deben compararse dentro del puntuador nativo de MLX; los resultados GGUF usan un protocolo de runtime reportado por separado.

Resultados de validacion funcional declarados por el autor:

| Comprobacion | Resultado |
|---|---|
| Fixtures greedy en cache (ingles/chino, aritmetica, JSON, memoria de conversacion) | 8/8 correctos |
| Comprobaciones HTTP con servidor estandar | 2/2 correctas |
| Sondeos de kernel SwitchLinear/MoE nativos en CPU y CUDA | superados en los cuatro modos |
| Recarga estricta con `mlx-lm` estandar y logits finitos en todo el vocabulario | correcta |

No se declara ninguna clasificacion de velocidad: "Mac, tool-call y agent integration acceptance remain unverified" y "no speed ranking is claimed".

## Requisitos de hardware

- Huella de pesos: 19,51 GB (18,169 GiB) en disco. Esta cifra no determina por si sola el uso de memoria en tiempo de ejecucion ni la velocidad, tal como advierte el autor.
- Memoria en ejecucion (estimacion): a los pesos hay que sumar activaciones en BF16 y cache KV; en la practica conviene reservar del orden de 22 a 26 GB de memoria unificada o VRAM, cifra orientativa no confirmada por el autor.
- Apple Silicon: es el destino natural del formato MLX. Un equipo con 32 GB de memoria unificada (familias M2/M3/M4 Max o M3 Ultra) es el perfil mas razonable; en maquinas de 24 GB el margen es muy ajustado. Importante: la aceptacion en Mac Metal esta pendiente y la inferencia en Apple Silicon permanece sin verificar en este lote.
- GPU NVIDIA: las comprobaciones de conversion y validacion en Linux se ejecutaron con MLX CUDA 12 sobre NVIDIA B200. Tambien existen exportaciones separadas en formato NVFP4 para NVIDIA (`Accio-Lab/occamy-1.0-NVFP4`), que es la via recomendada para ese hardware en lugar de este checkpoint MLX.
- Despliegue: `mlx-lm` (Python) para inferencia directa y `mlx_lm.server` para una API local compatible con OpenAI. No se documenta soporte de vLLM, TGI, llama.cpp u Ollama para este artefacto concreto; la model card menciona resultados GGUF bajo un protocolo de runtime distinto, no vinculado a este checkpoint.
- Latencia y rendimiento: no disponibles. La model card indica explicitamente que el rendimiento y el throughput no se probaron en este lote y que no se reclama ninguna clasificacion de velocidad.
- Requisitos de software: versiones fijadas mlx 0.32.2, mlx-lm 0.31.3 y transformers 5.8.1 (superiores o distintas no estan validadas).

## Comparativa con modelos similares

La comparacion mas directa es dentro de la propia familia Occamy-1.0, que comparte los 34,66 mil millones de parametros totales y difiere unicamente en el formato de cuantizacion:

| Variante | Formato / precision | Tamano de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|
| occamy-1.0 | BF16 (modelo base) | no disponible | Apache 2.0 | HuggingFace |
| occamy-1.0-MLX-nvfp4 (este) | NVFP4 nativo MLX, 4 bits, grupo 16 | 19,51 GB | Apache 2.0 | HuggingFace |
| occamy-1.0-MLX-8bit / 6bit / 5bit / 4bit / 3bit | Cuantizacion MLX por bits | no disponible | Apache 2.0 | HuggingFace |
| occamy-1.0-MLX-mxfp8 / mxfp4 | Formatos MX de MLX | no disponible | Apache 2.0 | HuggingFace |
| occamy-1.0-NVFP4 | NVFP4 para runtime NVIDIA | no disponible | Apache 2.0 | HuggingFace |

No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoria (por ejemplo, otras familias MoE de aproximadamente 30 a 35 mil millones de parametros). Cualquier comparacion de rendimiento con alternativas externas queda, por tanto, como no disponible.

## Limitaciones y advertencias

- Estado de publicacion: la model card lo declara explicitamente "candidate release"; la aceptacion en Mac Metal esta pendiente.
- Inferencia en Apple Silicon sin verificar: el artefacto se describe como un artefacto MLX nativo para Linux, y las pruebas realizadas se ejecutaron con MLX CUDA 12 en NVIDIA B200, no en hardware Apple.
- Integracion con herramientas y agentes sin aceptar: tool calling, function calling y flujos de agente no estan verificados en este lote.
- Vision y MTP no incluidos: son exportaciones separadas; este checkpoint es solo texto.
- Perdida de calidad por cuantizacion: la perplejidad sube de 8,3074 (BF16) a 8,9242 (NVFP4), un incremento de 0,6168 puntos en el protocolo reducido empleado. La prueba es pequena y no garantiza el comportamiento en contextos largos, codigo o tareas de herramientas.
- Contexto largo no probado: la model card indica que el contexto largo, el codigo, las herramientas y la vision no se probaron en este lote.
- Idiomas no declarados oficialmente: la ficha de HuggingFace no lista idiomas; la evidencia disponible se limita a fixtures en ingles y chino, por lo que el comportamiento en castellano u otros idiomas no esta documentado.
- Licencia: Apache 2.0 permite uso comercial, pero se debe citar el informe original ("Occamy-1.0: Open Pareto-frontier 35B Intelligence for Co-work") al utilizar el modelo. Los pesos conservan la licencia Apache 2.0.
- Riesgo de alucinacion: no se documenta ninguna evaluacion especifica de veracidad o tasa de alucinacion para este checkpoint; al ser un modelo de generacion de texto, el riesgo generico de fabricar informacion persiste y no esta cuantificado.
- Sesgos: no se dispone de informacion sobre evaluaciones de sesgo, composicion del dataset de entrenamiento ni procesos de alineacion.
- Adopcion nula verificable: 0 descargas y 0 likes en HuggingFace en la fecha de consulta, sin comunidad que haya reportado resultados independientes.
- Reproducibilidad: los comandos y el servidor requieren versiones fijadas exactas (mlx 0.32.2, mlx-lm 0.31.3, transformers 5.8.1); otras combinaciones no han sido validadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-nvfp4
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0
- Revision exacta del modelo base: https://huggingface.co/Accio-Lab/occamy-1.0/tree/8f8e0e58a3c9df042be1a3fa2c191fd8047acfb8
- Checkpoint NVFP4 para NVIDIA: https://huggingface.co/Accio-Lab/occamy-1.0-NVFP4
- Variante MLX 8bit: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-8bit
- Variante MLX 6bit: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-6bit
- Variante MLX 5bit: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-5bit
- Variante MLX 4bit: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-4bit
- Variante MLX 3bit: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-3bit
- Variante MLX mxfp8: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-mxfp8
- Variante MLX mxfp4: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-mxfp4
- Coleccion Occamy-1.0: https://huggingface.co/collections/Accio-Lab/occamy-10-6ac00729659e8a86ec11e216
- Coleccion MLX: https://huggingface.co/collections/Accio-Lab/occamy-10-mlx-6ac0072a7c1cdbc5e418e90b
- Explorador de checkpoints (Space): https://huggingface.co/spaces/Accio-Lab/Occamy-Explorer
- Pagina del proyecto: https://accio-lab.github.io/occamy/
- Informe tecnico: https://arxiv.org/abs/2609.11977
- Marca grafica del proyecto: https://accio-lab.github.io/occamy/brand/accio.svg
- Adaptador de conversion sin perdida (mencionado en la model card): `layout_adapter.py` dentro del repositorio
- Ficheros de validacion del repositorio: `validation_summary.json`, `validation.json`, `api_validation.json`, `conversion.json`, `SHA256SUMS`, `quality/README.md`

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces anteriores proceden exclusivamente de la informacion de HuggingFace y de la model card.
