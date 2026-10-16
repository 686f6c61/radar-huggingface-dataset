# luokelabs/Qwen3.5-0.8B-Base-4bit

## Resumen

`luokelabs/Qwen3.5-0.8B-Base-4bit` es una version cuantizada a 4 bits del modelo base `Qwen/Qwen3.5-0.8B-Base` de Alibaba Qwen, publicada por Luoke Labs (螺壳实验室). La conversion se ha realizado con `mlx-lm` mediante cuantizacion afin (affine) de 4 bits con group size 64, y el resultado son 752.393.024 parametros almacenados en un unico `model.safetensors` de 424 MB. El repositorio no incluye ningun entrenamiento ni ajuste fino: solo se modifican los pesos, mientras que tokenizer, plantilla de chat y configuracion se copian tal cual del modelo original.

La relevancia de esta publicacion no esta en una mejora de capacidades, sino en el empaquetado: permite ejecutar un modelo base de ~0,75B parametros en memoria unificada de Apple Silicon con un consumo de disco inferior a medio gigabyte. El autor declara un uso principal muy concreto, el reranking de candidatos y la prediccion de la siguiente palabra dentro del metodo de entrada (IME) de Luoke, con descarga y verificacion de hash por fichero por parte de la aplicacion anfitriona.

Se trata, por tanto, de un artefacto de despliegue mas que de un modelo nuevo. Esto condiciona su evaluacion: no hay benchmarks publicados, no se documentan idiomas soportados ni longitud de contexto, y al derivar de un modelo base sin instruccion no cabe esperar seguimiento de ordenes ni alineacion de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (etiqueta `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 752.393.024 (segun los pesos safetensors) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afin (affine), group size 64, generada con `mlx-lm`; no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache License 2.0 (heredada del modelo original) |
| Formato de pesos | safetensors para MLX (`model.safetensors`, 424 MB, mas `model.safetensors.index.json`) |
| Modelo base | `Qwen/Qwen3.5-0.8B-Base` |
| Libreria de inferencia | mlx |
| Tamano del repositorio | 0,4 GB |
| Ficheros incluidos | `config.json` (con campo `quantization`), `tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja` |
| Fecha de publicacion en el Hub | 2026-10-16 |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo base mas alla de la etiqueta `qwen3_5`, propia de la familia Qwen3.5. No se detallan numero de capas, dimension de embedding, tipo de atencion ni estrategia de posicionamiento, por lo que cualquier afirmacion al respecto seria especulativa. Lo unico verificable es el recuento de parametros: 752.393.024, coherente con la nomenclatura comercial "0,8B" del modelo original.

En cuanto al proceso de produccion, el autor indica explicitamente que no ha habido entrenamiento ni ajuste fino. La unica transformacion aplicada a los pesos es la cuantizacion afin a 4 bits con group size 64, realizada con `mlx-lm`. Ese esquema de grupo explica el tamano final del fichero: a 4 bits por peso, 752 millones de parametros ocuparian unos 376 MB, y los factores de escala y sesgo por grupo de 64 anaden el resto hasta los 424 MB observados. No se documenta ningun tipo de RLHF, DPO, destilacion ni decodificacion especulativa asociada a este repositorio.

## Capacidades

- Generacion de texto autoregresiva y scoring de secuencias: es un modelo base, por lo que su salida natural es la probabilidad del siguiente token, no la respuesta a una instruccion.
- Reranking contextual de candidatos: la funcion declarada por el autor para el IME de Luoke, que reordena las opciones de entrada segun el contexto previo.
- Prediccion de la siguiente palabra, tambien declarada por el autor como uso previsto.
- Plantilla de chat incluida (`chat_template.jinja`) heredada del modelo original, aunque no hay evidencia de un ajuste por instrucciones que la haga funcional en la practica.
- Capacidades multilingues: no disponibles. El autor no documenta idiomas, y la etiqueta `conversational` del Hub no va acompanada de informacion adicional.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (modo thinking, vision, audio): no documentadas.

## Casos de uso

- Reranking de candidatos en un metodo de entrada: el modelo puntua cada candidato del IME en funcion de la frase ya escrita y los reordena. Es el caso de uso declarado por el autor y la razon de existir del repositorio; encaja porque la tarea requiere latencia muy baja y el modelo ocupa menos de 0,5 GB.
- Prediccion de la siguiente palabra en escritura asistida: integrado como servicio local en una aplicacion de escritorio de macOS, genera la continuacion mas probable del texto en curso sin salir del dispositivo.
- Puntuacion de frases para filtrado de corpus: al ser un modelo base, la perplejidad que asigna a una secuencia es util como criterio de calidad o de deduplicacion en la preparacion de datasets en castellano o en otros idiomas, siempre que se valide antes el comportamiento idiomatico, que no esta documentado.
- Prototipado de pipelines de cuantizacion MLX: sirve como caso de referencia para comprobar el impacto de la cuantizacion afin a 4 bits con group size 64 frente a los pesos originales, midiendo degradacion de perplejidad.
- Inferencia completamente offline en equipos Apple Silicon: permite funcionalidades de texto en aplicaciones sin conexion ni coste de API, incluyendo entornos con requisitos de privacidad estrictos donde los datos no pueden salir del dispositivo.
- Etiquetado y clasificacion ligera por scoring: mediante prompts de continuacion ("Esta resena es positiva porque..."), el modelo puede usarse para clasificacion poco exigente en procesos por lotes, asumiendo que no hay evaluacion publicada de su precision.
- Autocompletado en editores y herramientas internas: dado su tamano, se puede mantener cargado de forma permanente en memoria mientras el usuario trabaja, con generaciones cortas de tipo snippet o plantilla.
- Generacion de continuaciones de bajo coste en tareas de relleno: creacion de texto de relleno, resumenes muy cortos o variaciones de plantillas en pipelines internos donde la calidad no es critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye cifras de MMLU, HumanEval, GSM8K ni de perplejidad antes y despues de la cuantizacion, y la busqueda web realizada no devolvio ningun resultado relevante sobre este repositorio (unicamente enlaces genericos de Facebook, sin relacion con el modelo). Tampoco se documentan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM / memoria: los pesos ocupan 424 MB en disco. Con los buffers de runtime de MLX, el consumo durante la inferencia se situa aproximadamente en 0,7-1,0 GB de memoria unificada; es una estimacion, no una cifra publicada por el autor.
- Plataforma: MLX solo se ejecuta en Apple Silicon (familias M1, M2, M3 y M4). No hay soporte CUDA ni ROCm en este repositorio.
- GPU recomendadas: no aplica el catalogo habitual de NVIDIA (A100, H100, RTX 4090); el modelo esta pensado para la GPU integrada de los chips de Apple. Cualquier Mac con Apple Silicon y 8 GB de memoria unificada deberia poder cargarlo.
- Cabe en GPU de consumo: si, en cualquier Mac con chip de la serie M. En GPU NVIDIA de consumo no se puede ejecutar directamente por el formato MLX.
- Opciones de despliegue: `mlx-lm` en Python (`mlx_lm.generate`, y el servidor incluido en la libreria) y carga directa en aplicaciones Swift o Python sobre MLX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la conversion a GGUF no esta descrita por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| `luokelabs/Qwen3.5-0.8B-Base-4bit` (este) | 752.393.024 | 4 bits afin MLX, group 64 | no disponible | Apache 2.0 | safetensors (MLX), 424 MB |
| `Qwen/Qwen3.5-0.8B-Base` (original) | no confirmado en la informacion disponible | sin cuantizar (precision original no documentada) | no disponible | Apache 2.0 | safetensors |

No se dispone de datos verificables en la informacion proporcionada sobre otros modelos comparables de la misma categoria (alternativas de menos de 1.000 millones de parametros), ni de cifras de rendimiento que permitan una comparacion rigurosa. Cualquier tabla con resultados numericos seria inventada, por lo que se omite.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue ordenes de forma fiable, no mantiene un rol de asistente y no debe usarse como chatbot sin un ajuste posterior.
- No ha pasado por RLHF, DPO ni ninguna fase de alineacion conocida, por lo que puede producir contenido sesgado, ofensivo o inseguro ante entradas adversarias, y no incorpora filtros de moderacion.
- La cuantizacion a 4 bits introduce degradacion respecto a los pesos originales; el autor no publica mediciones de esa perdida, asi que no se puede cuantificar de antemano.
- Riesgo de alucinacion propio de un modelo pequeno: en tareas factuales o de razonamiento extendido la fiabilidad es limitada y no hay evaluacion publicada que la acote.
- Idiomas soportados no documentados: no se puede asumir un buen rendimiento en castellano sin una evaluacion propia.
- Longitud de contexto no documentada: no se puede planificar un caso de uso que dependa de ventanas largas sin medirlo antes.
- Licencia Apache 2.0: permite uso comercial, pero obliga a conservar los avisos de copyright y licencia del modelo original y a indicar los cambios realizados (la cuantizacion). Las condiciones de Qwen se heredan sin modificacion.
- Dependencia de plataforma: el formato MLX limita el despliegue a Apple Silicon y a la libreria `mlx-lm`, lo que excluye servidores Linux con GPU NVIDIA sin una conversion adicional no documentada.
- Empaquetado sin validacion de la comunidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin issues ni terceros que hayan replicado el resultado.
- Inconsistencia en la documentacion del autor: el ejemplo de la model card usa el identificador `zhixianio/Qwen3.5-0.8B-Base-4bit`, distinto del identificador real del repositorio (`luokelabs/...`). Conviene verificar la procedencia antes de integrarlo.
- Model card redactada en chino: no hay version en castellano ni en ingles, lo que dificulta la revision por parte de equipos que no lean ese idioma.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/luokelabs/Qwen3.5-0.8B-Base-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base/blob/main/LICENSE
- Libreria de inferencia mlx-lm: https://github.com/ml-explore/mlx-lm
- Framework MLX de Apple: https://github.com/ml-explore/mlx
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: los unicos resultados fueron paginas de inicio de sesion de Facebook, sin relacion con el repositorio.
