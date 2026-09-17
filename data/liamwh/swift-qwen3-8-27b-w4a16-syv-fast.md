# liamwh/Swift-Qwen3.8-27B-W4A16-syv-fast

## Resumen

Swift-Qwen3.8-27B-W4A16-syv-fast es una build cuantizada de servicio publicada por el usuario liamwh sobre el finetune ukisai/Swift-Qwen3.8-27b, que a su vez es una variante de "razonamiento reducido" del Qwen3.8-27B de Alibaba Cloud. El repositorio no reentrena el modelo: reempaqueta pesos ya existentes (el cuerpo W4A16-AWQ de TheUnderscore) y sustituye las cabezas de salida (lm_head, MTP y embeddings) por versiones cuantizadas y calibradas especificamente sobre las activaciones y salidas de Swift, no sobre las del Qwen base. El resultado son 27.913.928.432 parametros (unos 27,9 B) almacenados en 15,9 GB de safetensors con formato compressed-tensors.

La aportacion tecnica principal es el vocabulario del cabezal de borrador (draft head) para decodificacion especulativa: se construyo contando 4,23 millones de tokens generados por el propio Swift sobre un corpus ponderado hacia agentes de codigo, lo que reduce el vocabulario del borrador a 25.879 filas frente a las 40.960 del Qwen base. Ese vocabulario derivado cubre el 99,81 % de los tokens en secuencias held-out (99,86 % en fuentes de codigo), frente al 96,69 % de la lista base, lo que se traduce en una tasa de aceptacion MTP de 0,660 y 2,98 tokens por paso.

Esta pensado para un unico escenario: el stack monousuario de syv sobre una RTX 3090 con 114.688 tokens de contexto, donde mide 98,4 tok/s de decodificacion. No es un modelo de proposito general para produccion multiusuario ni tiene todavia validacion externa: acumula 0 descargas y 0 likes desde su publicacion el 17 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.8) con cabeza de prediccion multi-token (MTP) para decodificacion especulativa; cuantizacion W4A16 sobre compressed-tensors |
| Parametros totales | 27.913.928.432 (~27,9 B) |
| Parametros activos | no disponible (no se documenta variante MoE) |
| Longitud de contexto | 114.688 tokens en la configuracion de servicio del stack syv (MAX_LEN=114688); no se declara el contexto nativo del modelo base |
| Tipos de cuantizacion | Cuerpo: W4A16 AWQ asimetrica g128 (compressed-tensors); lm_head y MTP: int4 GPTQ simetrica g128; embeddings: int8 g128 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (Swift Open License v1.0); el uso comercial por encima de su umbral de ingresos exige la Swift Enterprise License |
| Formato de pesos | safetensors (compressed-tensors), preparado para vLLM |
| Tamano del repositorio | 15,9 GB |
| Vocabulario del draft head | 25.879 filas (frente a 40.960 del Qwen base) |
| Libreria de inferencia | vLLM 0.28.0 mas la serie de parches del repositorio syv |
| Pipeline declarado | text-generation |
| Autor de la cuantizacion y calibracion | liamwh |
| Fecha de publicacion | 2026-09-17 |

## Arquitectura y entrenamiento

No hay entrenamiento nuevo. El modelo se compone de cuatro piezas: el cuerpo es la cuantizacion W4A16 AWQ asimetrica g128 en compressed-tensors de TheUnderscore, transportada sin modificar; los embeddings son int8 g128 recuantizados desde los pesos de Swift; y el lm_head junto con la cabeza MTP son int4 GPTQ g128 simetrico calibrado sobre estados ocultos del propio Swift, con 300.000 filas capturadas mediante el pipeline `drafter/` de syv. La divergencia del lm_head respecto a la cabeza bf16 original medida en KL es de 0,00234, frente a 0,00707 con cuantizacion RTN y 0,0029 de la variante rapida oficial de syv. Los errores relativos de la cabeza MTP quedan en 0,146-0,176, dentro del rango de la variante oficial.

La innovacion reseñable es el vocabulario del borrador especulativo. Se contaron 4,23 millones de tokens de salidas del propio Swift sobre un corpus ponderado para agentes de codigo (35 % Rust, 16 % TypeScript, 11 % depuracion, 10 % edicion de codigo, 8 % agentes y uso de herramientas, 10 % arquitectura, 7 % razonamiento tecnico y 3 % general, con un 61 % de generaciones en modo thinking). Swift emite muchos menos tokens distintos que el Qwen base (~25,9k frente a ~54k), de ahi que el draft head tenga 25.879 filas. En cobertura held-out (10 % de las secuencias, nunca contabilizadas), la lista derivada de Swift alcanza el 99,81 % de todos los tokens y el 99,86 % en fuentes de codigo, mientras que la lista base de 40k se queda en el 96,69 % y el 96,67 % respectivamente. El repositorio incluye `swift_draft_vocab_ids.json` con la lista exacta de identificadores que sirve el modelo.

## Capacidades

- Generacion de texto conversacional con pipeline `text-generation` y etiqueta `conversational`.
- Razonamiento en modo thinking: conserva el comportamiento de terminacion del razonamiento de Swift, verificado con decodificacion greedy.
- Codigo, con enfasis declarado en Rust, TypeScript, edicion de codigo y depuracion, segun la ponderacion del corpus de calibracion.
- Tool calling y function calling: la bateria de calidad reporta resultados limpios en esta categoria.
- Salida JSON estricta, validada en la bateria de calidad.
- Streaming de tokens compatible con el stack de servicio.
- Compatibilidad con el parser de razonamiento de qwen3.
- Decodificacion especulativa mediante cabeza MTP propia, con aceptacion medida de 0,660 y 2,98 tokens por paso.
- Vision, audio y capacidades multimodales: no disponible.
- Cobertura multilingue: no disponible, no se declaran idiomas en la model card.

## Casos de uso

- Agente de codigo en estacion de trabajo local: el modelo esta dimensionado para ejecutarse en una RTX 3090 de 24 GB con 114.688 tokens de contexto, de modo que un unico desarrollador puede mantener un agente con el repositorio completo en contexto sin depender de APIs externas.
- Refactorizacion de bases de codigo Rust y TypeScript: el vocabulario del borrador se construyo con un 35 % de Rust y un 16 % de TypeScript, por lo que la decodificacion especulativa es mas eficiente precisamente en estos dominios (99,86 % de cobertura de tokens en fuentes de codigo).
- Depuracion asistida y edicion de codigo en pipelines de CI/CD: con tool calling y JSON estricto verificados, el modelo puede invocarse desde un runner para clasificar fallos, proponer parches y devolver resultados estructurados a un orquestador.
- Extraccion de informacion estructurada en backend: la conformidad con JSON estricto y el parser de razonamiento de qwen3 permiten usarlo como extractor determinista de campos sobre documentos tecnicos largos, apoyandose en la ventana de 114.688 tokens.
- Analisis de arquitectura y razonamiento tecnico sobre documentacion extensa: el 10 % del corpus de calibracion corresponde a arquitectura y el 7 % a razonamiento tecnico, lo que alinea el borrador con consultas de diseno de sistemas.
- Despliegue en entornos aislados (air-gapped): al ser pesos safetensors autocontenidos de 15,9 GB y no requerir servicios externos, encaja en equipos con una sola GPU de 24 GB y sin acceso a Internet.
- Asistente de codigo monousuario con cache de prefijo: el stack recomienda PREFIX_CACHE=1, util para sesiones iterativas donde el mismo contexto de repositorio se reutiliza entre turnos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. Los unicos datos medidos son internos, sobre RTX 3090 con el stack syv, MTP y cache de prefijo a 114.688 tokens de contexto.

| Configuracion | Decodificacion (tok/s) | Aceptacion MTP | Tokens por paso |
|---|---|---|---|
| Este modelo | 98,4 | 0,660 | 2,98 |
| Swift con cabezas int8 y vocabulario de borrador base | 94,0 | 0,630 | 2,89 |
| Variante rapida oficial de Qwen de syv | 98,2 | 0,634 | 2,90 |

| Cobertura held-out del vocabulario de borrador | Todos los tokens | Fuentes de codigo |
|---|---|---|
| Derivado de Swift (este modelo) | 99,81 % | 99,86 % |
| Lista base de Qwen (40k) | 96,69 % | 96,67 % |

Calidad: bateria de 9 pruebas con prompts identicos, 8/9 superadas, igualando la build int8. Se reportan como limpios tool calling, JSON estricto, streaming y el parser de razonamiento de qwen3. Divergencia del lm_head respecto a la cabeza bf16: KL 0,00234 (RTN: 0,00707; variante rapida oficial: 0,0029).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio ocupa 15,9 GB y el objetivo declarado es una RTX 3090 de 24 GB, que debe absorber ademas la cache KV de hasta 114.688 tokens.
- GPU objetivo: RTX 3090 (24 GB). Por tamano de pesos, cualquier GPU de 24 GB o mas deberia poder cargarlo, aunque no se aportan mediciones en otras tarjetas.
- GPU de consumo: si, el modelo esta disenado explicitamente para una GPU de consumo de 24 GB. Para GPUs con menos de 24 GB no hay datos ni cuantizaciones alternativas publicadas.
- GPUs de centro de datos (A100, H100): compatibles por capacidad pero sin mediciones publicadas.
- Opciones de despliegue: vLLM 0.28.0 mas la serie de parches del repositorio syv. Es obligatorio el parche de vocabulario de borrador MTP para que se use la cabeza de 25.879 filas; vLLM estandar la ignorara. El arranque documentado es `MODEL=... SPEC=mtp PREFIX_CACHE=1 CTX=long MAX_LEN=114688 bash single-user/start_qwen.sh`.
- llama.cpp, Ollama, TGI y GGUF: no disponible; no se publican pesos en formato GGUF.
- Throughput medido: 98,4 tok/s de decodificacion en RTX 3090, con 2,98 tokens por paso. No se publican datos de latencia de prefill ni de rendimiento con concurrencia superior a un usuario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decodificacion medida (RTX 3090) | Aceptacion MTP | Licencia |
|---|---|---|---|---|---|
| Swift-Qwen3.8-27B-W4A16-syv-fast (este) | 27,9 B | 114.688 tokens en el stack syv | 98,4 tok/s | 0,660 | Swift Open License v1.0 |
| Swift con cabezas int8 y vocabulario de borrador base | no disponible (misma base) | 114.688 tokens en el mismo stack | 94,0 tok/s | 0,630 | Swift Open License v1.0 |
| Variante rapida oficial de Qwen de syv | no disponible | no disponible | 98,2 tok/s | 0,634 | no disponible |
| TheUnderscore/Swift-Qwen3.8-27b-W4A16-AWQ | no disponible (misma base cuantizada) | no disponible | sin datos publicados de decodificacion especulativa | no aplica | Swift Open License v1.0 |
| ukisai/Swift-Qwen3.8-27b (bf16, upstream) | no disponible; el modelo base de esta ficha deriva de el | no disponible | no disponible | no aplica | Swift Open License v1.0 |
| Alibaba Cloud Qwen3.8-27B (raiz) | no disponible en la informacion proporcionada | no disponible | no disponible | no aplica | Apache-2.0 |

La comparativa se limita a los datos medidos por el propio autor bajo condiciones identicas. No hay resultados publicados de MMLU ni de otras tareas estandar para ninguno de estos modelos en la informacion disponible, por lo que la comparacion de calidad entre alternativas no es posible.

## Limitaciones y advertencias

- Licencia restrictiva: se distribuye bajo Swift Open License v1.0, con campo `license: other`. El uso comercial por encima del umbral de ingresos de la licencia exige la Swift Enterprise License; conviene revisar el fichero LICENSE antes de cualquier despliegue productivo.
- Cadena de atribucion en cascada: Qwen3.8-27B (Apache-2.0, incluida como LICENSE-APACHE-2.0) da lugar al finetune Swift de UkisAI, este al cuerpo W4A16-AWQ de TheUnderscore y, finalmente, a las cabezas int4 GPTQ, embeddings int8 y vocabulario de borrador de este repositorio. Cada salto anade condiciones.
- Dependencia de parches no estandar: vLLM 0.28.0 por si solo no utilizara la cabeza de borrador de 25.879 filas. El script `verify.sh` del stack reporta un FAIL falso en este directorio porque asume un lm_head int8, cuando este modelo es int4 por construccion.
- Riesgo de alucinacion: no se aportan datos especificos. El modelo es un finetune de "razonamiento reducido", lo que puede afectar a tareas que requieren cadenas de razonamiento largas.
- Sesgos conocidos: no disponible. No hay evaluacion de sesgos en la informacion proporcionada.
- Limitaciones de idioma: no se declaran idiomas soportados. El corpus de calibracion esta ponderado hacia codigo y hacia el estilo de salida de Swift, por lo que la eficiencia de la decodificacion especulativa en otros dominios o idiomas puede ser inferior.
- Cobertura del vocabulario de borrador: aunque alcanza el 99,81 % en held-out, existe un 0,19 % de tokens no cubiertos que se resuelven fuera del camino especulativo, con la consiguiente penalizacion de velocidad.
- Degradacion por cuantizacion: el lm_head int4 mantiene una KL de 0,00234 frente a la cabeza bf16. Es un valor bajo, pero implica una diferencia medible respecto al modelo sin cuantizar.
- Madurez: 0 descargas y 0 likes desde el 17 de septiembre de 2026, sin validacion independiente ni resultados en benchmarks publicos.
- Rendimiento monousuario: todas las mediciones (98,4 tok/s) corresponden a un unico usuario con MTP activo. No hay datos de concurrencia, batching continuo ni latencia bajo carga, por lo que no es adecuado asumir ese rendimiento en produccion multiusuario.
- Sin alternativas de cuantizacion publicadas (GGUF, GPTQ generico para llama.cpp, etc.), lo que ata el despliegue al stack syv.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liamwh/Swift-Qwen3.8-27B-W4A16-syv-fast
- Repositorio de servicio syv (stack RTX 3090, pipeline `drafter/`): https://github.com/syv-ai/qwen38-27b-rtx3090
- Modelo base (finetune Swift): https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Modelo base (cuerpo W4A16-AWQ): https://huggingface.co/TheUnderscore/Swift-Qwen3.8-27b-W4A16-AWQ
- Lista de identificadores del vocabulario de borrador: `swift_draft_vocab_ids.json`, incluido en el repositorio
- Licencia del modelo: fichero `LICENSE` (Swift Open License v1.0) en el repositorio
- Licencia del modelo raiz: fichero `LICENSE-APACHE-2.0` en el repositorio
- Paper, blog o demo adicionales: no disponible. La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo.
