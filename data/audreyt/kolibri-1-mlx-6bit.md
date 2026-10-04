# audreyt/Kolibri-1-MLX-6bit

## Resumen

Kolibri-1 MLX 6-bit es una conversion cuantizada del modelo Aleph-Alpha/Kolibri-1, publicada por el usuario audreyt en HuggingFace. No es un modelo entrenado desde cero: es un artefacto de despliegue que toma la publicacion oficial en block-FP8 de Aleph Alpha y la convierte al formato MLX con cuantizacion afina de 6 bits y tamano de grupo 64, con un coste medio de 6,506 bits por peso. El modelo resultante ocupa 59,16 GiB de tensor payload repartidos en 13 shards de safetensors, con 78.103.055.360 parametros totales y un repositorio de 63,5 GB.

El objetivo es permitir la inferencia local del modelo Kolibri-1 en Apple Silicon. La arquitectura subyacente es un transformer con mezcla de expertos (MoE) que incluye expertos enrutados, un experto compartido y 50 routers (`mlp.gate`) que se mantienen en BF16 en lugar de cuantizarse, igual que las bias de enrutado (`expert_bias`) y todas las normas. Esto preserva la precision del mecanismo de enrutado, que es la parte mas sensible a la cuantizacion en un MoE.

Es relevante porque Kolibri-1 no dispone de una implementacion oficial en mlx-lm: la arquitectura `kolibri1` requiere un fork no publicado, lo que convierte a esta conversion en una de las pocas vias practicas de ejecutar el modelo en un Mac. El autor la etiqueta explicitamente como experimental y advierte de que el comportamiento en contexto largo, el tool calling y la calidad relativa al modelo original no se han medido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) con expertos enrutados y experto compartido; arquitectura identificada como `kolibri1` |
| Parametros totales | 78.103.055.360 (78,1 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 6-bit con group size 64 (6,506 bits por peso); routers `mlp.gate`, `expert_bias` y normas en BF16 |
| Idiomas soportados | en (ingles), de (aleman) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (13 shards, 1.907 tensores, 63.517.765.120 bytes / 59,16 GiB) |

## Arquitectura y entrenamiento

La conversion parte de la revision `e52eb4627d11516b0c01de49210ab5a4e4061444` del repositorio oficial Aleph-Alpha/Kolibri-1, que se publica en block-FP8. Cada bloque FP8 se desquantizo a BF16 y se volvio a cuantizar una sola vez a 6 bits, sin formato intermedio. La cuantizacion se aplica a expertos enrutados, experto compartido, proyecciones de atencion, embedding y cabeza de salida. Los 50 routers MoE conservan sus pesos BF16 originales porque la regla de cuantizacion propia del modelo los excluye; el autor advierte que las recetas `--quant-predicate mixed_*` sustituyen esa regla y cuantizarian tambien los routers, por lo que la reproduccion debe usar `-q` simple.

El proceso se ejecuto con `mlx_lm.convert` sobre MLX 0.32.3 y un build concreto del fork `here-be-dragons-ai/mlx-lm` (commit `5bc45adb`), con un tiempo de conversion de 19,4 segundos y un pico de memoria de 18,3 GB en un Apple M5 Max con 128 GB de memoria unificada. Se trata, por tanto, de una conversion de pesos ya cuantizados, no de una cuantizacion directa desde el checkpoint BF16 de entrenamiento.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo original uso RLHF, DPO u otras tecnicas de alineamiento. Tampoco se documenta en esta ficha ninguna innovacion de decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y conversacion multi-turno mediante `pipeline_tag: text-generation` y plantilla de chat propia del tokenizer.
- Modo de razonamiento configurable mediante el parametro `reasoning_effort`, que acepta los valores `none`, `low`, `medium` y `high`. Segun la publicacion original, el modelo no razona a menos que se active.
- Generacion de bloques de razonamiento delimitados por `<think>`: una ejecucion con `mlx_lm.generate` sin pasar `reasoning_effort` abrio igualmente un bloque de 873 tokens.
- Aritmetica basica verificada en la prueba de humo del autor: la peticion "What is 17 x 23?" devolvio `391` con `reasoning_effort="none"`.
- Capacidad multilingue limitada a ingles y aleman; el autor probo tambien muestras de codigo y CJK a nivel de tokenizacion, pero no se declaran idiomas CJK soportados.
- Tool calling / function calling: no medido por el autor; no disponible.
- Comportamiento agentico y razonamiento multi-paso: no medido; no disponible.
- Capacidades de vision o audio: no disponibles; el repositorio no carga en mlx-vlm porque los pesos usan nombres de clave de mlx-lm sin el prefijo `language_model.`.

## Casos de uso

- Inferencia local en estaciones de trabajo Apple Silicon: el modelo puede ejecutarse integramente en un Mac con 96 GB o 128 GB de memoria unificada, sin GPU dedicada ni conexion a servicios en la nube, usando el fork de mlx-lm indicado por el autor.
- Procesamiento de texto en aleman e ingles en entornos aislados: al ejecutarse en local, encaja en flujos con requisitos de confidencialidad donde no se permite enviar datos a APIs externas.
- Investigacion sobre cuantizacion de MoE: la preservacion de los 50 routers y de `expert_bias` en BF16 lo convierte en un caso de estudio util para medir el impacto de cuantizar o no el enrutado en modelos de mezcla de expertos.
- Comparacion de formatos de cuantizacion sobre un mismo modelo base: junto con las conversiones NVFP4-W4A16 y MLX 3-bit del mismo autor y del repositorio here-be-dragons-ai, permite estudios comparativos de tamano, velocidad y calidad.
- Prototipado de asistentes conversacionales en aleman: con `reasoning_effort="low"` el modelo produce un bloque de razonamiento breve seguido de una respuesta correcta, tal como se verifico en la prueba de humo con una pregunta en aleman.
- Evaluacion de tareas aritmeticas simples en local: el caso verificado de 17 x 23 sugiere utilidad como banco de pruebas para cadenas de razonamiento corto (`reasoning_effort="none"`).
- Benchmarking de rendimiento en MLX: sirve para medir throughput de prompt y generacion en hardware Apple de gama alta (504,6 tok/s de prompt y 116,3 tok/s de generacion en M5 Max con esta cuantizacion).
- Docencia y divulgacion sobre MoE: el tamano manejable del repositorio y las velocidades documentadas permiten demostraciones en vivo de un modelo de 78.000 millones de parametros en un solo equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que las cifras de la tabla siguiente son pruebas de humo (smoke tests), no puntuaciones de benchmark, y que no se han medido el comportamiento en contexto largo, el tool calling ni la calidad relativa al modelo original.

| Prueba | `reasoning_effort` | Resultado | Velocidad de prompt | Velocidad de generacion |
|---|---|---|---:|---:|
| Explicar un modelo de mezcla de expertos en dos frases en aleman | `low` | Bloque de razonamiento breve y respuesta correcta en dos frases | no disponible (primera llamada, calentamiento) | 91,2 tok/s |
| "What is 17 x 23?" | `none` | `391` (correcto) | 504,6 tok/s | 116,3 tok/s |

Pico de memoria durante la generacion: 63,6 GB. Ajustes de muestreo recomendados por Aleph Alpha y usados en la prueba: `temperature=1.0`, `top_p=0.97`, `top_k=128`.

## Requisitos de hardware

- Memoria unificada: aproximadamente 64 GB libres como minimo; el autor considera que un Mac de 96 GB o 128 GB es el minimo practico.
- Pico de memoria medido durante la generacion: 63,6 GB.
- Pico de memoria durante la conversion: 18,3 GB (proceso distinto, no necesario para inferencia).
- Hardware de referencia usado por el autor: Apple M5 Max con 128 GB de memoria unificada.
- GPU compatibles: exclusivamente Apple Silicon mediante MLX. No hay soporte para GPU NVIDIA, AMD o Intel en este repositorio.
- Encaje en GPU de consumo: no disponible para GPU NVIDIA o AMD; en Apple Silicon requiere 96-128 GB de memoria unificada, muy por encima de la configuracion tipica de consumo.
- Opciones de despliegue: unicamente el fork `here-be-dragons-ai/mlx-lm` fijado al commit `5bc45adb`, porque la arquitectura `kolibri1` no forma parte de una version publicada de mlx-lm. No se documenta compatibilidad con vLLM, TGI, llama.cpp, Ollama ni LM Studio para este repositorio. mlx-vlm y su servidor no cargan estos pesos.
- Instalacion indicada: `pip install mlx "git+https://github.com/here-be-dragons-ai/mlx-lm@5bc45adb8733f9af29c1c03e9ea947d155328b75"`.
- Latencia y throughput: 504,6 tok/s de procesamiento de prompt y 116,3 tok/s de generacion en el caso aritmetico con `reasoning_effort="none"`; 91,2 tok/s de generacion en el caso aleman con `reasoning_effort="low"`. Cifras de prueba de humo, no representativas de todos los prompts.

## Comparativa con modelos similares

No hay informacion disponible sobre modelos de la misma categoria mas alla de las conversiones alternativas del mismo modelo base, que el propio autor documenta:

| Repositorio | Formato | Runtime | Tamano | Hardware objetivo |
|---|---|---|---:|---|
| audreyt/Kolibri-1-NVFP4-W4A16 | Expertos ModelOpt NVFP4, atencion BF16 | vLLM sobre GPU NVIDIA | 44,14 GiB | GPU NVIDIA |
| here-be-dragons-ai/Kolibri-1-MLX-3bit-mlxlm | Expertos MLX 3-bit, resto 6-bit | fork de mlx-lm | 33 GiB | Macs de 48 GB |
| audreyt/Kolibri-1-MLX-6bit (este repositorio) | MLX 6-bit en todo el modelo, routers BF16 | fork de mlx-lm | 59,16 GiB | Macs de 96 GB o mas |
| Aleph-Alpha/Kolibri-1 | block-FP8 (modelo original) | plugin vLLM de Aleph Alpha | no disponible | GPU NVIDIA |
| Aleph-Alpha/Kolibri-1 (checkpoint base) | BF16 | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo etiquetado explicitamente como experimental por el autor; no se han medido el comportamiento en contexto largo, el tool calling ni la calidad frente al modelo original.
- No se han publicado resultados de benchmarks; las unicas cifras disponibles son pruebas de humo del autor y no deben extrapolarse.
- Riesgo de alucinacion: no evaluado en la informacion disponible, pero es inherente a los modelos generativos de este tipo.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas: solo se declaran ingles y aleman. Aunque el tokenizer se probo con muestras de codigo y CJK, no se declaran estos idiomas como soportados.
- Longitud de contexto: no documentada. No es posible planificar cargas de trabajo de contexto largo con los datos disponibles.
- Restricciones de licencia: el repositorio conserva la licencia apache-2.0 del modelo original en el fichero `LICENSE`, lo que permite uso comercial segun los terminos de dicha licencia. Al ser una conversion de pesos derivados, conviene verificar las condiciones aplicables al modelo base y al checkpoint FP8 de origen.
- Dependencia de software no publicado: requiere un fork concreto de mlx-lm fijado a un commit; no funciona con versiones estables de mlx-lm ni con mlx-vlm.
- Requisito de memoria elevado: 64 GB libres como minimo y un Mac de 96-128 GB como minimo practico, lo que excluye la mayoria de equipos de consumo.
- Tamano de descarga: 63,5 GB de repositorio.
- Advertencia del tokenizer: las versiones recientes de `transformers` avisan de que este tokenizer tiene un patron regex incorrecto y sugieren `fix_mistral_regex=True`. En las pruebas del autor con aleman, ingles, codigo y CJK, ambos ajustes produjeron los mismos IDs de token, pero la advertencia sigue vigente.
- El modelo no razona a menos que se ajuste `reasoning_effort`; sin ese parametro, la publicacion original indica que no se activa el razonamiento, aunque una ejecucion por defecto del build si abrio un bloque `<think>` de 873 tokens.
- Sin telemetria de uso: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de adopcion ni de validacion independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/audreyt/Kolibri-1-MLX-6bit
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1
- Conversion NVFP4-W4A16 del mismo autor: https://huggingface.co/audreyt/Kolibri-1-NVFP4-W4A16
- Conversion MLX 3-bit: https://huggingface.co/here-be-dragons-ai/Kolibri-1-MLX-3bit-mlxlm
- Plugin vLLM oficial de Aleph Alpha: https://github.com/Aleph-Alpha/aleph-alpha-inference
- MLX: https://github.com/ml-explore/mlx
- Fork de mlx-lm usado: https://github.com/here-be-dragons-ai/mlx-lm/tree/kolibri1
- Commit concreto del fork: https://github.com/here-be-dragons-ai/mlx-lm/tree/5bc45adb8733f9af29c1c03e9ea947d155328b75
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; los unicos resultados obtenidos fueron enlaces a TikTok sin relacion con el contenido de esta ficha.
