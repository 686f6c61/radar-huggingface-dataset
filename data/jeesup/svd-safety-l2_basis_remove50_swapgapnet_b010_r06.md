# Jeesup/svd-safety-l2_basis_remove50_swapgapnet_b010_r06

## Resumen

svd-safety-l2_basis_remove50_swapgapnet_b010_r06 es un artefacto de investigacion derivado de meta-llama/Llama-2-7b-chat-hf. Se ha comprimido con Basis Sharing (ICLR 2025), una tecnica que comparte bases SVD entre grupos de 2 capas adyacentes y elimina el 50,00% de los parametros densos. Sobre ese checkpoint se aplicaron 6 de 10 rondas de un procedimiento iterativo de intercambio de parametros neutro (parameter-neutral swap) guiado por la regla de seleccion swapgapnet_iter, con un presupuesto de restauracion del 1,000% de los parametros densos.

Lo publica el usuario Jeesup y su proposito no es conversar, sino medir como la compresion por SVD degrada el comportamiento de seguridad y que regla de seleccion de componentes lo repara mejor. Es una celda concreta de una rejilla experimental sobre reglas de seleccion y presupuestos, no un asistente desplegable. Los datos medidos apuntan a una tasa de exito de ataque (ASR) de 0,3731 en AdvBench y 0,3770 en StrongREJECT, con un sobre-rechazo macro de 0,0470.

El checkpoint corresponde a rondas intermedias (6 de 10) de una ejecucion mas larga y el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 2, con bases SVD compartidas por grupos de 2 capas adyacentes (Basis Sharing) sobre los pesos de proyeccion |
| Parametros totales | 6.738.415.616 (6,74 mil millones) segun safetensors |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama-2-7b-chat declara 4.096 tokens |
| Tipos de cuantizacion | No se publican variantes cuantizadas; los pesos estan en safetensors |
| Idiomas soportados | No disponible (la model card no lo especifica) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,5 GB |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Semilla | 42 |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Llama 2 (transformer decoder-only con pre-normalizacion, activacion SwiGLU y embeddings posicionales rotatorios) y la modifica en el plano de los pesos, no en el grafo de computo. Basis Sharing agrupa las capas de dos en dos y hace que compartan las bases de una descomposicion en valores singulares, de forma que se elimina el 50,00% de los parametros densos de proyeccion; la fraccion de parametros resultante declarada es 0,4998.

Sobre ese punto de partida se ejecuta un bucle iterativo: en cada ronda se seleccionan componentes con la regla swapgapnet_iter y se intercambia un 0,100% de los parametros densos, hasta un presupuesto total del 1,000%. Se restauran 2.679 componentes y se retiran otros 2.679, con 38.832.640 parametros introducidos (0,60% de los parametros de proyeccion densos) y un valor de intercambio «net» (valor de insercion mas valor de eliminacion del desalojo ordenado por sigma). Despues se aplica una recuperacion con LoRA de rango 8 unicamente sobre los coeficientes por capa, con las bases congeladas y sin alterar el presupuesto: 2 epocas, learning rate 0,0001, batch 64 y dataset alpaca-cleaned. No se especifican el numero total de tokens de entrenamiento original ni la composicion completa del dataset mas alla de alpaca-cleaned en la fase de recuperacion.

Existe una discrepancia sin resolver en la informacion disponible: la model card declara una fraccion de parametros resultante de 0,4998, pero el recuento de safetensors (6.738.415.616) coincide con el del Llama-2-7b denso. La informacion proporcionada no permite reconciliar ambas cifras.

## Capacidades

- Generacion de texto autoregresiva y uso conversacional (pipeline text-generation, etiqueta conversational).
- Edicion de pesos orientada a seguridad: el checkpoint forma parte de un estudio sobre como reparar el dano de seguridad inducido por la compresion SVD.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (no documentadas).
- Capacidades especiales: no se documentan vision, audio ni modo de razonamiento explicito. La funcion del checkpoint es servir como sujeto experimental con metricas de ASR y sobre-rechazo publicadas.
- Compatibilidad declarada con text-generation-inference y endpoints (etiquetas del repositorio).

## Casos de uso

- Auditoria de seguridad bajo compresion: el checkpoint permite medir el ASR antes y despues de comprimir Llama-2-7b-chat al 50% de parametros densos, usando AdvBench y StrongREJECT con juez HarmBench.
- Comparacion de reglas de seleccion de componentes: al ser una celda de una rejilla sobre reglas y presupuestos, sirve para contrastar swapgapnet_iter frente a otras reglas con el mismo presupuesto de restauracion (1,000%).
- Evaluacion de jueces automaticos de seguridad: sus cifras (0,3731 y 0,3770 de ASR) permiten calibrar la sensibilidad de clasificadores tipo HarmBench o WildGuard sobre modelos degradados.
- Estudio del sobre-rechazo: el valor de sobre-rechazo macro de 0,0470 (WildGuard) es util para analizar como la compresion y la reparacion afectan a la utilidad conversacional.
- Reproduccion de experimentos: con semilla 42 y todos los hiperparametros declarados (LoRA r=8, 2 epocas, lr 0,0001, batch 64, alpaca-cleaned), el artefacto es replicable en un entorno de investigacion.
- Analisis de interpretabilidad de pesos SVD: permite inspeccionar que componentes (2.679 restaurados y 2.679 retirados) son responsables de que comportamientos de seguridad.
- Ablacion de recuperacion con LoRA sobre bases congeladas: sirve para aislar cuanto de la reparacion proviene del intercambio de parametros y cuanto de la adaptacion de bajo rango.
- Material docente sobre compresion de LLM: caso realista de trade-off entre eficiencia, seguridad y utilidad, con metricas publicadas.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,3731 |
| StrongREJECT | ASR (juez HarmBench) | 0,3770 |
| WildGuard | Sobre-rechazo macro | 0,0470 |

En estas metricas, un ASR mas alto indica peor seguridad: el modelo acepta la instruccion danina en torno al 37% de los casos. La model card no aporta cifras equivalentes del modelo base ni de otros brazos de la rejilla, por lo que no es posible presentar una comparacion numerica directa. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: unos 13,5 GB solo de pesos (el repositorio ocupa 13,5 GB) mas overhead de activaciones y cache KV; en la practica, 16 GB o mas de VRAM.
- VRAM estimada en INT8: aproximadamente 7 GB de pesos, mas overhead; 10-12 GB de VRAM recomendables.
- VRAM estimada en INT4: aproximadamente 3,5-4 GB de pesos; 8 GB de VRAM pueden ser suficientes con contexto reducido.
- GPU consumer: cabe en RTX 4090 y RTX 3090 (24 GB) en FP16; en RTX 4080, 4070 Ti Super o 4060 Ti de 16 GB conviene INT8; en GPUs de 8-12 GB, solo INT4 y con contexto limitado.
- GPU de datacenter: A100 40/80 GB, H100 y L40S ejecutan el modelo sin dificultad; para lotes grandes o contexto maximo es preferible A100 80 GB.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta tgi presente en el repositorio) y vLLM. Para llama.cpp u Ollama seria necesario convertir a GGUF, formato que no se publica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmark publicado en la informacion | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_basis_remove50_swapgapnet_b010_r06 | 6,74 mil millones | no disponible | Llama 2 Community License | AdvBench ASR 0,3731; StrongREJECT ASR 0,3770; sobre-rechazo 0,0470 | HuggingFace |
| meta-llama/Llama-2-7b-chat-hf (base) | 6,74 mil millones | el modelo base declara 4.096 tokens | Llama 2 Community License | no disponible en la informacion proporcionada | HuggingFace |
| Otros brazos de la rejilla de seleccion y presupuesto | no disponible | no disponible | Llama 2 Community License (previsible) | no disponible | no disponible |

El unico punto de referencia claro es el modelo base sin comprimir. La model card no nombra ni enlaza otros checkpoints comparables, por lo que no se puede construir una comparativa de rendimiento con alternativas.

## Limitaciones y advertencias

- La propia model card advierte de que varios brazos de la rejilla estan deliberadamente degradados en seguridad respecto a Llama-2-7b-chat y que el artefacto es un sujeto experimental, no un asistente desplegable.
- La compresion por si sola eleva la tasa de exito de ataque; este checkpoint registra un ASR de 0,3731 en AdvBench y 0,3770 en StrongREJECT con juez HarmBench.
- Riesgo de alucinacion: no se mide ni se documenta en la model card; al ser underivado comprimido, la degradacion de capacidades es esperable.
- Sesgos conocidos: hereda los de Llama 2, que no se analizan en esta ficha.
- Limitaciones de idioma: no se declaran idiomas soportados; Llama 2 se entrena principalmente en ingles.
- Longitud de contexto no confirmada para este checkpoint comprimido.
- Discrepancia no resuelta entre la fraccion de parametros declarada (0,4998) y el recuento de safetensors (6.738.415.616), identico al del modelo denso.
- Es un checkpoint de ronda intermedia (6 de 10) de una ejecucion mas larga, no el resultado final.
- Restricciones de licencia: Llama 2 Community License, con las condiciones habituales de atribucion («Built with Llama 2») y el limite de 700 millones de usuarios activos mensuales que exige licencia adicional de Meta. Se incluyen LICENSE.txt y USE_POLICY.md en el repositorio.
- Adopcion nula: 0 descargas y 0 «likes», sin validacion independiente por parte de la comunidad.
- Fecha de creacion registrada el 14 de septiembre de 2026, posterior a la fecha de consulta habitual de referencias; conviene verificar la vigencia de los enlaces.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove50_swapgapnet_b010_r06
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper de Basis Sharing (ICLR 2025): referenciado en la model card, sin URL en la informacion proporcionada.
- Repositorio de codigo, demo o blog del autor: no disponible.
- Ficheros de licencia y politica de uso incluidos en el repositorio: LICENSE.txt y USE_POLICY.md.
