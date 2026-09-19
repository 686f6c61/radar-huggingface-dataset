# Jeesup/svd-safety-l3_swift_remove30_swapgapiter_b010

## Resumen

svd-safety-l3_swift_remove30_swapgapiter_b010 es un checkpoint derivado de meta-llama/Meta-Llama-3-8B-Instruct obtenido mediante compresion SVD-LLM hasta el 70,0 % de los parametros densos y una posterior edicion iterativa de parametros. Lo publica el usuario Jeesup en HuggingFace y no es un modelo conversacional de proposito general, sino un artefacto de investigacion: una celda concreta dentro de una rejilla experimental que mide como la compresion por descomposicion en valores singulares (SVD) degrada el comportamiento de seguridad del modelo y que regla de seleccion de componentes lo repara mejor.

La intervencion consiste en 10 rondas de 10 de sustituciones de parametros "neutrales" seleccionadas por la regla `gap_iter`, con un presupuesto de restauracion del 1,000 % de los parametros densos (0,100 % por ronda), 10.145 componentes restaurados y 10.145 sustituidos, semilla 42 y un total de 69.736.448 parametros intercambiados. El resultado es un modelo de pesos safetensors, pipeline de text-generation y licencia Llama 3 Community, con 0 descargas y 0 likes en el momento de redactar esta ficha.

Su relevancia es metodologica y acotada: proporciona numeros medidos de tasa de exito de ataque (ASR) en AdvBench y StrongREJECT, sobre-rechazo macro en WildGuard y perplejidad en WikiText-2, lo que permite comparar presupuestos de reparacion entre celdas de la misma rejilla. La propia model card advierte que varias ramas del estudio estan deliberadamente degradadas en seguridad y que cualquier celda debe tratarse como sujeto experimental, no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), derivada de Meta-Llama-3-8B-Instruct |
| Parametros totales | 8.030.261.248 segun el recuento de safetensors de HuggingFace; la model card declara una fraccion de parametros densos resultante de 0,7003 y 69.736.448 parametros intercambiados (1,00 % de las proyecciones densas), lo que implicaria un modelo efectivo de aproximadamente 5,9B. La discrepancia entre ambas cifras no se explica en la informacion disponible |
| Parametros activos | No aplica (no es un modelo MoE; es denso comprimido) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama-3-8B-Instruct soporta 8.192 tokens |
| Tipos de cuantizacion | No se publican variantes cuantizadas. El repositorio contiene unicamente pesos en safetensors, por lo que la cuantizacion a 8 bits o 4 bits requeriria un proceso externo |
| Idiomas soportados | No disponible (la model card no los declara; como derivado de Llama 3 hereda su soporte multilingue, con predominio del ingles) |
| Licencia | Llama 3 Community License (Meta Llama 3 Community License), con LICENSE y USE_POLICY.md incluidos en el repositorio |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3-8B-Instruct: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, rotary position embeddings (RoPE) y atencion con grouped-query attention (GQA). Sobre ese checkpoint no se ha realizado ningun reentrenamiento ni ajuste fino adicional; la unica operacion es de edicion estructural de pesos. La primera fase aplica compresion SVD-LLM, que elimina el 29,97 % de los parametros de las matrices de proyeccion reduciendo su rango via descomposicion en valores singulares, dejando una fraccion densa de 0,7003.

La segunda fase es el experimento propiamente dicho: 10 rondas iterativas de sustitucion "neutral en parametros" (parameter-neutral swap) guiadas por la regla de seleccion `gap_iter`. En cada ronda se restauran y se expulsan 10.145 componentes, con un presupuesto de 0,100 % de los parametros densos por ronda y un total de 1,000 %, lo que suma 69.736.448 parametros reinsertados. El valor de intercambio es `insert` (solo valor de insercion) con desalojo ordenado por sigma. No hay datos en la informacion disponible sobre composicion del dataset de entrenamiento, numero de tokens ni etapas de RLHF o DPO, ya que el modelo no se ha entrenado: se limita a modificar pesos preexistentes con semilla fija 42.

## Capacidades

- Generacion de texto autoregresiva en ingles principalmente, heredada de Llama-3-8B-Instruct, aunque degradada respecto al modelo original por la compresion SVD.
- Razonamiento y tareas conversacionales basicas, con calidad reducida: la perplejidad en WikiText-2 medida es de 22,8250.
- Capacidad de rechazo de peticiones daninas, parcialmente reparada por las 10 rondas de sustitucion: AdvBench ASR de 0,0212 y StrongREJECT ASR de 0,0383.
- Soporte de tool calling / function calling: no verificado ni documentado para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no verificado ni documentado.
- Modo "thinking" explicito: no disponible.
- Vision, audio o modalidades adicionales: no disponibles (modelo solo texto).
- Capacidades multilingues: no documentadas en la model card.

## Casos de uso

- Investigacion sobre seguridad y compresion: el checkpoint sirve como celda de una rejilla experimental para cuantificar cuanto dano introduce la compresion SVD en el comportamiento de rechazo y cuanto recupera la regla `gap_iter` con un presupuesto del 1,000 %.
- Comparacion de reglas de seleccion de componentes: al existir otras celdas con reglas y presupuestos distintos, este modelo permite aislar el efecto de `gap_iter` frente a alternativas bajo la misma semilla (42) y el mismo numero de rondas.
- Evaluacion de red-teaming reproducida: sus valores de ASR en AdvBench (0,0212) y StrongREJECT (0,0383) con juez HarmBench permiten contrastar pipelines de evaluacion de seguridad entre laboratorios.
- Estudio de sobre-rechazo: el valor de 0,5891 en sobre-rechazo macro medido con WildGuard es un punto de referencia para analizar el coste en utilidad de las intervenciones de reparacion de seguridad.
- Analisis de interpretabilidad de componentes: los 10.145 componentes restaurados y los 10.145 expulsados son una lista concreta y auditable que permite estudiar que subconjuntos de pesos concentran el comportamiento de seguridad.
- Baseline de perplejidad bajo compresion: la cifra de 22,8250 en WikiText-2 sirve como referencia para comparar metodos de compresion alternativos (cuantizacion, poda estructurada) sobre el mismo modelo base.
- Docencia y reproduccion metodologica: al incluir procedencia completa (base, regla, presupuesto, semilla, componentes), es util como ejemplo reproducible de experimento controlado sobre pesos.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| AdvBench ASR (juez HarmBench) | 0,0212 | Menor es mejor |
| StrongREJECT ASR (juez HarmBench) | 0,0383 | Menor es mejor |
| Sobre-rechazo macro (WildGuard) | 0,5891 | Mayor es mejor; 0,5891 indica un nivel elevado de rechazo indebido |
| Perplejidad WikiText-2 | 22,8250 | Menor es mejor |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras baterias de capacidad general en la informacion disponible. Tampoco se proporcionan los valores del modelo base sin comprimir ni de otras celdas de la rejilla, por lo que no es posible calcular la delta de degradacion a partir de los datos facilitados.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 11,8 GB si el modelo efectivo es de ~5,9B parametros; hasta ~16,1 GB (tamano del repositorio) si finalmente se materializan los 8.030.261.248 parametros del recuento de safetensors.
- VRAM estimada en 8 bits: aproximadamente 6-9 GB. En 4 bits: aproximadamente 3-5 GB. Estas cifras son estimaciones de ingenieria, no medidas publicadas por el autor.
- GPU de centro de datos: A100 (40 GB y 80 GB), H100, L40S y A10G son suficientes con holgura en FP16. H100 resulta sobredimensionada para un modelo de este tamano salvo por requisitos de throughput agregado.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en FP16; en RTX 4080 (16 GB) conviene cuantizar; en GPUs de 12 GB como la RTX 3060 solo con cuantizacion agresiva de 4 bits.
- Opciones de despliegue: vLLM y HuggingFace TGI son las vias directas, ya que el repositorio esta marcado como `endpoints_compatible` y usa transformers con safetensors. llama.cpp y Ollama requeririan una conversion previa a GGUF que no se distribuye en el repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l3_swift_remove30_swapgapiter_b010 | 8.030.261.248 segun safetensors; fraccion densa declarada 0,7003 | No disponible (base: 8.192) | Llama 3 Community License | safetensors | Publico en HuggingFace, 0 descargas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030.261.248 | 8.192 tokens | Llama 3 Community License | safetensors | Publico, ampliamente distribuido |
| Otros derivados comprimidos de Llama 3 (SVD-LLM, poda, cuantizacion) | No disponible | No disponible | Depende del autor | safetensors o GGUF segun el caso | No disponible en la informacion proporcionada |
| Llama-3.1-8B-Instruct | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Llama 3.1 Community License | safetensors | Publico |

No se dispone de datos de benchmarks comparables entre estas alternativas dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento cuantitativa.

## Limitaciones y advertencias

- No es un modelo desplegable. La model card lo describe explicitamente como artefacto de investigacion y no como asistente de proposito general; su uso en produccion no esta respaldado por el autor.
- Degradacion deliberada de seguridad en varias ramas del estudio. La propia documentacion advierte que la compresion por si sola eleva la tasa de exito de ataque y que parte de la rejilla esta degradada a proposito.
- Sobre-rechazo elevado. El valor de 0,5891 en sobre-rechazo macro implica que el modelo rechaza con frecuencia peticiones legitimas, lo que lo hace inadecuado como asistente conversacional.
- Riesgo de alucinacion no evaluado. No se han publicado mediciones de fidelidad factual ni de tasas de alucinacion para este checkpoint; la perplejidad de 22,8250 sugiere una modelizacion del lenguaje notablemente peor que la del modelo sin comprimir.
- Incertidumbre sobre el recuento real de parametros. La discrepancia entre los 8.030.261.248 parametros del recuento de safetensors y la fraccion densa de 0,7003 declarada en la model card no se aclara, lo que complica estimar requisitos de memoria con precision.
- Idiomas no documentados. La model card no declara la cobertura linguistica; cabe esperar un comportamiento inferior al del modelo base en idiomas distintos del ingles.
- Sin variantes cuantizadas publicadas. Solo hay pesos safetensors, lo que obliga a cuantizar por cuenta propia si se quiere desplegar en hardware limitado.
- Restricciones de licencia. Se aplica la Meta Llama 3 Community License; el uso comercial esta sujeto a sus terminos, incluidos los de la politica de uso aceptable recogida en USE_POLICY.md, y cualquier redistribucion debe conservar la atribucion "Built with Meta Llama 3".
- Adopcion nula. El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion independiente de la comunidad sobre su comportamiento real.
- Fechas del repositorio. La model card indica creacion y actualizacion en septiembre de 2026, dato que conviene verificar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_swift_remove30_swapgapiter_b010
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia y politica de uso: LICENSE y USE_POLICY.md incluidos en el repositorio del modelo (no se ha proporcionado una URL directa)
- Paper de SVD-LLM: no disponible en la informacion proporcionada
- Repositorio de codigo, demo o blog del autor: no disponible en la informacion proporcionada
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces recuperados correspondian a paginas corporativas de Microsoft y no guardan relacion con el checkpoint.
