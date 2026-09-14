# Jeesup/svd-safety-l2_basis_remove40_swapdiscnet_b010_r01

## Resumen

`svd-safety-l2_basis_remove40_swapdiscnet_b010_r01` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf`, publicado por el usuario Jeesup (Jeesup en HuggingFace), que forma parte de un estudio sobre como la compresion por descomposicion en valores singulares (SVD) degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes lo repara mejor. El modelo base se comprime con la tecnica Basis Sharing (ICLR 2025), que comparte bases SVD entre grupos de 2 capas adyacentes y elimina el 40,00% de los parametros, dejando una fraccion de parametros densos de 0,5999. Sobre ese checkpoint comprimido se aplica una ronda de edicion de parametros mediante intercambio neutral ("parameter-neutral swap"), seleccionada por la regla `swapdiscnet_iter`, con un presupuesto del 1,000% de los parametros densos repartido en 10 rondas.

Se trata de un artefacto de investigacion, no de un asistente conversacional desplegable. La propia model card indica explicitamente que varias celdas de la cuadricula experimental estan "deliberadamente degradadas en seguridad" respecto a Llama-2-7b-chat y que la finalidad del estudio es cuantificar ese deterioro y probar su recuperacion. El checkpoint publicado corresponde a la ronda 1 de 10 de una ejecucion mas larga, con 454 componentes restaurados y 454 sustituidos (6.475.264 parametros intercambiados, el 0,10% de los parametros de proyeccion densos), semilla 42 y una recuperacion posterior mediante LoRA de rango 8 sobre los coeficientes por capa.

Su relevancia actual es metodologica: aporta evidencia medible sobre el compromiso entre seguridad y utilidad en modelos comprimidos, con metricas de tasa de exito de ataque (ASR) sobre AdvBench y StrongREJECT y de sobrerrechazo macro sobre WildGuard. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 13,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama-2-7b-chat) con compresion Basis Sharing (bases SVD compartidas sobre grupos de 2 capas adyacentes) y edicion por intercambio de parametros; la model card no detalla la arquitectura interna resultante |
| Parametros totales | 6.738.415.616 (recuento real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Fraccion de parametros densos resultante | 0,5999 (40,00% de parametros densos eliminados) |
| Parametros intercambiados en esta ronda | 6.475.264 (0,10% de los parametros de proyeccion densos) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama-2-7b-chat emplea 4.096 tokens, dato no confirmado en esta model card) |
| Tipos de cuantizacion | No disponible; el repositorio publica unicamente pesos en safetensors (repo de 13,5 GB) |
| Idiomas soportados | No disponible (la model card no declara idiomas; el comportamiento multilingue depende del modelo base) |
| Licencia | Llama 2 Community License (`license: llama2`), con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio |
| Formato de pesos | safetensors (libreria `transformers`) |
| Pipeline declarado | text-generation |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Semilla | 42 |
| Fecha de creacion / actualizacion | 2026-09-14 / 2026-09-14 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

El punto de partida es Llama-2-7b-chat, un transformer decoder-only. Sobre el se aplica Basis Sharing (ICLR 2025), un esquema de compresion que factoriza matrices de proyeccion mediante SVD y comparte las bases entre grupos de 2 capas adyacentes, lo que permite eliminar el 40,00% de los parametros densos manteniendo una fraccion resultante de 0,5999. Sobre ese modelo comprimido se ejecuta un procedimiento de reparacion por rondas: en cada ronda se seleccionan componentes candidatos mediante la regla `swapdiscnet_iter`, se extraen 454 componentes y se insertan otros 454, con un valor de intercambio definido como `net` (valor de insercion mas valor de eliminacion de la expulsion ordenada por sigma). El presupuesto total de la ejecucion completa es del 1,000% de los parametros densos, dividido en 10 rondas de 0,100% cada una; este checkpoint corresponde a la ronda 1. El numero exacto de tokens de entrenamiento del proceso de compresion y edicion no se especifica en la informacion disponible.

Tras el intercambio se aplica una recuperacion ligera: LoRA de rango 8 unicamente sobre los coeficientes por capa (bases congeladas y presupuesto sin cambios), durante 2 epocas, con tasa de aprendizaje 0,0001, tamano de lote 64 y el dataset alpaca-cleaned. No se documenta en la model card el uso de RLHF ni de DPO adicionales; la alineacion conversacional procede del modelo base Llama-2-7b-chat. La innovacion tecnica destacable es doble: por un lado, el uso de bases compartidas entre capas como mecanismo de compresion; por otro, la formulacion de la reparacion como un problema de seleccion de componentes bajo presupuesto, con una regla concreta (`swapdiscnet_iter`) evaluada frente a otras reglas en una cuadricula experimental.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad de Llama-2-7b-chat, aunque la model card advierte que no debe tratarse como un asistente desplegable.
- Razonamiento y respuesta a instrucciones: capacidad residual del modelo base, no medida ni garantizada en este checkpoint.
- Generacion de codigo y matematicas: no documentada especificamente para esta celda; depende del modelo base.
- Tool calling / function calling: no disponible en la informacion proporcionada (no se declara soporte explicito).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Comportamiento de seguridad medible: es la capacidad central del artefacto, con metricas de ASR sobre AdvBench (0,0808) y StrongREJECT (0,0863) y sobrerrechazo macro sobre WildGuard (0,2700).
- Modo "thinking", vision o audio: no disponibles; no se declaran.
- Compatibilidad declarada con text-generation-inference y endpoints de HuggingFace (`text-generation-inference`, `endpoints_compatible` en las etiquetas).

## Casos de uso

- Investigacion sobre compresion y seguridad: usar esta celda como punto de medida para cuantificar cuanto aumenta la tasa de exito de ataque (ASR de 0,0808 en AdvBench y 0,0863 en StrongREJECT) cuando se elimina el 40,00% de los parametros densos de Llama-2-7b-chat.
- Analisis de interpretabilidad de subespacios SVD: los 454 componentes restaurados y 454 sustituidos, con valor de intercambio `net`, permiten estudiar que direcciones de las bases compartidas entre pares de capas concentran el comportamiento de rechazo.
- Red-teaming y evaluacion de robustez: integrar el checkpoint en un pipeline de evaluacion con juez HarmBench para medir ASR de forma reproducible con la semilla 42 y comparar contra otras celdas de la cuadricula.
- Ablacion de reglas de seleccion de componentes: reproducir la comparacion entre `swapdiscnet_iter` y otras reglas del estudio manteniendo fijo el presupuesto (1,000% total, 0,100% por ronda).
- Estudio del compromiso seguridad/utilidad: la metrica de sobrerrechazo macro (0,2700) sobre WildGuard permite analizar el coste en utilidad conversacional de las intervenciones de reparacion.
- Experimentos de recuperacion con LoRA de bajo rango: la configuracion documentada (r=8, 2 epocas, lr 0,0001, lote 64, alpaca-cleaned, bases congeladas) sirve como linea base reproducible para explorar tecnicas de recuperacion posteriores a la compresion.
- Control negativo en benchmarks de seguridad: al ser un checkpoint intermedio con degradacion esperada, puede emplearse como referencia inferior frente a Llama-2-7b-chat sin comprimir en estudios comparativos.
- Validacion de pipelines de carga: dado que el repositorio declara `transformers` y `text-generation-inference`, puede usarse para comprobar la compatibilidad de checkpoints comprimidos con herramientas de despliegue antes de generalizar a otros artefactos.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / herramienta | Direccion deseable |
|---|---|---|---|
| AdvBench ASR | 0,0808 | HarmBench judge | Menor es mejor |
| StrongREJECT ASR | 0,0863 | HarmBench judge | Menor es mejor |
| Sobrerrechazo macro | 0,2700 | WildGuard | Menor es mejor |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas de capacidad general, ni cifras comparativas del modelo base sin comprimir. La model card tampoco incluye el numero de componentes de evaluacion ni los intervalos de confianza de estas metricas.

## Requisitos de hardware

- VRAM estimada para inferencia en precision de 16 bits: aproximadamente 13,5 GB solo de pesos (coincide con el tamano del repositorio), por lo que se recomienda un minimo de 16 GB de VRAM contando cache de activaciones y contexto. Estimacion derivada del recuento de parametros, no publicada por el autor.
- VRAM estimada en cuantizacion de 8 bits: del orden de 7 GB de pesos, mas overhead. Estimacion aritmetica.
- VRAM estimada en cuantizacion de 4 bits: del orden de 4 GB de pesos, mas overhead. Estimacion aritmetica.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para fp16 sin margen amplio de contexto; RTX 3090 o 4080 (16-24 GB) en fp16 con contexto reducido; GPUs de 8-12 GB solo en cuantizacion de 4-8 bits.
- Cabe en GPU de consumo: si en tarjetas de 24 GB en fp16, y en tarjetas de 12-16 GB con cuantizacion o contexto corto, siempre que la arquitectura comprimida sea compatible con la herramienta de inferencia elegida.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (etiqueta del repositorio), HuggingFace Inference Endpoints (`endpoints_compatible`), y potencialmente vLLM, llama.cpp u Ollama si se convierte a GGUF. La model card no confirma si el checkpoint requiere codigo personalizado ni si las herramientas anteriores lo cargan sin modificaciones.
- Latencia y throughput: no disponibles. La reduccion al 0,5999 de los parametros de proyeccion densos no implica necesariamente una ganancia proporcional en velocidad, ya que el repositorio mantiene 13,5 GB de pesos y no se documentan mediciones de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmark de seguridad | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l2_basis_remove40_swapdiscnet_b010_r01` | 6.738.415.616 (fraccion densa 0,5999) | No disponible | Llama 2 Community License | AdvBench ASR 0,0808; StrongREJECT ASR 0,0863; sobrerrechazo 0,2700 | Publico en HuggingFace, 0 descargas |
| `meta-llama/Llama-2-7b-chat-hf` (base sin comprimir) | No disponible en la informacion proporcionada | No disponible | Llama 2 Community License | No disponible (referencia de comparacion del estudio) | Publico en HuggingFace |
| Otras celdas de la cuadricula del estudio (otras reglas y presupuestos) | No disponible | No disponible | Llama 2 Community License | No disponible | No identificadas en la informacion proporcionada |

No se han identificado en la informacion disponible otros checkpoints publicos comparables de reparacion de seguridad tras compresion SVD, por lo que la comparativa cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Artefacto de investigacion, no un asistente desplegable: la propia model card lo indica de forma explicita.
- Degradacion de seguridad esperada: la compresion por si sola eleva la tasa de exito de ataque; varias celdas de la cuadricula estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat, y esta es una celda intermedia (ronda 1 de 10) de una ejecucion mayor.
- Checkpoint intermedio: el modelo corresponde a una unica ronda de un total de 10, con solo el 0,10% de los parametros densos intercambiados frente al 1,000% previsto en la ejecucion completa.
- Discrepancia de recuento: el numero de parametros en safetensors (6.738.415.616) coincide con el recuento habitual del Llama-2-7b completo, mientras que la model card declara una fraccion densa de 0,5999; conviene verificar que componente del modelo se ha comprimido antes de inferir ahorros de memoria o de computo.
- Riesgo de alucinacion y de respuestas danadas: no se documentan tasas de alucinacion ni evaluaciones de veracidad; las metricas de seguridad no cubren otros modos de fallo.
- Sesgos: no se documenta ningun analisis de sesgos ni de toxicidad mas alla de las metricas de rechazo y ataque.
- Idiomas: no se declaran idiomas soportados; el rendimiento fuera del ingles no esta medido.
- Contexto: la model card no especifica la longitud de contexto efectiva del checkpoint comprimido.
- Restricciones de licencia: se aplica la Llama 2 Community License junto con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio; el uso comercial de este derivado queda sujeto a ambas. Es imprescindible revisar la clausula de uso aceptable y los requisitos de atribucion ("Built with Llama 2").
- Compatibilidad y produccion: no se confirma si la arquitectura comprimida requiere codigo personalizado ni si funciona sin ajustes en vLLM, llama.cpp, Ollama o TGI; la ausencia de descargas y de validacion externa reduce la confianza en un uso productivo.
- Reproducibilidad limitada: se declara semilla 42 y configuracion de LoRA, pero no se publican los datos de la cuadricula completa ni las curvas de las 10 rondas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove40_swapdiscnet_b010_r01
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: incluida en el repositorio como `LICENSE.txt`, junto con `USE_POLICY.md`. URL publica no disponible en la informacion proporcionada.
- Referencia de la tecnica de compresion: Basis Sharing, ICLR 2025. No se ha facilitado la URL del paper en la informacion disponible.
- Repositorio de codigo del estudio: no disponible.
- Demo o space: no disponible.
- Resultados de la busqueda web: las entradas recuperadas no guardan relacion con el modelo (se refieren a tarjetas y postales escolares) y no aportan enlaces utiles, por lo que no se incluyen.
