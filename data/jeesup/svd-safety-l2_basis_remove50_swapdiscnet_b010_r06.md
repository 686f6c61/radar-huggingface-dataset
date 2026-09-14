# Jeesup/svd-safety-l2_basis_remove50_swapdiscnet_b010_r06

## Resumen

`Jeesup/svd-safety-l2_basis_remove50_swapdiscnet_b010_r06` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` que ha sido comprimido con Basis Sharing (ICLR 2025), una tecnica basada en descomposicion en valores singulares (SVD) que comparte bases entre grupos de 2 capas adyacentes, eliminando el 50,00 % de los parametros densos de proyeccion. Sobre ese checkpoint comprimido se aplica un proceso de edicion iterativa de parametros ("parameter-neutral swap") seleccionado por la regla `swapdiscnet_iter`, que restaura y sustituye componentes para intentar recuperar el comportamiento de seguridad degradado por la compresion.

El modelo lo publica el usuario `Jeesup` como artefacto de investigacion dentro de un estudio sobre como la compresion SVD danana la seguridad y que regla de seleccion de componentes la repara mejor. No es un asistente conversacional de proposito general: la propia model card advierte que varias celdas de la rejilla experimental estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat, y que este checkpoint concreto es una ronda intermedia (6 de 10) de una ejecucion mas larga.

La relevancia actual es metodologica: aporta una celda reproducible de una rejilla sobre reglas de seleccion y presupuestos de restauracion, con metricas de tasa de exito de ataque (ASR) medidas con jueces de HarmBench sobre AdvBench y StrongREJECT, y de sobrerrechazo con WildGuard. Arquitectonicamente sigue siendo un transformer decoder-only tipo Llama, con 4096 tokens de contexto heredados del modelo base y pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama, comprimido con Basis Sharing (bases SVD compartidas entre grupos de 2 capas adyacentes) |
| Parametros totales | 6.738.415.616 (segun metadatos safetensors de HuggingFace); la ficha del autor declara una fraccion de parametros resultante de 0,4998 sobre las proyecciones densas |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4096 tokens (heredada del modelo base; no se explicita en la ficha del autor) |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados) |
| Idiomas soportados | no disponible (el modelo base se entrena principalmente en ingles; la ficha del autor no declara idiomas) |
| Licencia | Llama 2 Community License (`LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio) |
| Formato de pesos | safetensors (libreria `transformers`) |

Otros datos de la ficha: pipeline `text-generation`, tamano del repositorio 13,5 GB, semilla 42, creado el 2026-09-14 y actualizado el 2026-09-14, 0 descargas y 0 likes.

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: parte de `meta-llama/Llama-2-7b-chat-hf` (transformer decoder-only de 6.738.415.616 parametros, atencion multi-cabeza con 32 capas y contexto de 4096 tokens) y se somete a una compresion estructural por Basis Sharing, que factoriza las matrices de proyeccion con SVD y comparte las bases entre pares de capas adyacentes. En esta celda se elimina el 50,00 % de los parametros densos de proyeccion, dejando una fraccion resultante de 0,4998.

Tras la compresion se aplica una recuperacion con LoRA de rango 8 restringida a los coeficientes por capa (bases congeladas, presupuesto sin cambios): 2 epocas, learning rate 1e-4, batch 64 y dataset `alpaca-cleaned`. Despues se ejecuta la edicion iterativa de "parameter-neutral swap" con la regla de seleccion `swapdiscnet_iter`: presupuesto total de la ejecucion completa del 1,000 % de los parametros densos, en fragmentos de 0,100 % por ronda, con 6 de 10 rondas aplicadas en este checkpoint (por tanto, ronda intermedia). Se restauran 2684 componentes y se sustituyen otros 2684, con 38.827.008 parametros intercambiados (0,60 % de los parametros de proyeccion densos) y valor de intercambio `net` (valor de insercion mas valor de eliminacion de la expulsion ordenada por sigma). No se documentan ni RLHF ni DPO adicionales sobre este checkpoint, ni decodificacion especulativa u otras tecnicas de inferencia.

## Capacidades

- Generacion de texto conversacional: al derivar de Llama-2-7b-chat, conserva la capacidad de mantener dialogos multi-turno dentro de los 4096 tokens de contexto, aunque con el comportamiento de seguridad alterado por la compresion y la edicion.
- Generacion de texto en ingles: el modelo base esta entrenado principalmente en ingles; no hay datos de capacidades multilingues en la informacion disponible.
- Razonamiento, codigo y matematicas: no se publican evaluaciones de estas capacidades para este checkpoint; se desconoce el grado de degradacion causado por la compresion.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Modo "thinking" explicito: no disponible.
- Vision o audio: no disponible (modelo exclusivamente de texto).
- Capacidad especial objeto de estudio: servir como sujeto experimental para medir el compromiso seguridad/utilidad bajo compresion SVD y para probar reglas de reparacion de componentes.

## Casos de uso

- Investigacion sobre compresion y seguridad: usar este checkpoint como una celda reproducible (regla `swapdiscnet_iter`, presupuesto del 1,000 %, ronda 6 de 10) para cuantificar como la eliminacion del 50 % de parametros densos eleva la tasa de exito de ataque y hasta que punto la edicion posterior la reduce.
- Comparacion de reglas de seleccion de componentes: al ser una celda dentro de una rejilla sobre reglas y presupuestos, permite contrastar `swapdiscnet_iter` frente a otras reglas manteniendo constante el modelo base, la semilla y el presupuesto.
- Auditoria de seguridad y red-teaming: sus valores medidos (ASR de 0,0346 en AdvBench y 0,0799 en StrongREJECT con juez de HarmBench) sirven como referencia para validar jueces automaticos y protocolos de ataque antes de aplicarlos a modelos en produccion.
- Estudios de sobrerrechazo: la metrica de sobrerrechazo macro de 0,3503 con WildGuard permite analizar el coste en utilidad de las intervenciones de seguridad, comparando celdas con distinto presupuesto de restauracion.
- Interpretabilidad de subespacios SVD: las bases compartidas y los 2684 componentes restaurados/sustituidos por ronda ofrecen un objetivo concreto para estudiar que direcciones de pesos estan asociadas a comportamientos de rechazo o de obediencia a peticiones daninas.
- Analisis de metodologias de edicion de pesos: la combinacion de LoRA sobre coeficientes con bases congeladas y posterior swap de componentes es un caso practico para evaluar tecnicas de reparacion post-compresion sin reentrenamiento completo.
- Reproduccion de experimentos: con semilla fija (42) y presupuesto declarado, permite replicar el pipeline de compresion-edicion y verificar la trazabilidad de las metricas publicadas.
- Docencia y formacion: como ejemplo didactico de artefacto de investigacion que no debe desplegarse, util para ilustrar por que una model card puede declarar explicitamente un uso no recomendado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas metricas publicadas son de seguridad y sobrerrechazo:

| Metrica | Valor | Juez / metodo |
|---|---|---|
| AdvBench ASR | 0,0346 | HarmBench judge |
| StrongREJECT ASR | 0,0799 | HarmBench judge |
| Sobrerrechazo macro | 0,3503 | WildGuard |

No se proporcionan los valores equivalentes del modelo base sin comprimir, por lo que no es posible cuantificar en esta ficha el delta exacto atribuible a la compresion y a la edicion.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16 los pesos ocupan aproximadamente 13,5 GB (coincide con el tamano del repositorio), mas cache KV. Con 32 capas, 32 cabezas de atencion y dimension de cabeza 128, la cache KV en fp16 consume aproximadamente 512 KiB por token, es decir unos 2 GB con los 4096 tokens de contexto llenos. Estimacion practica: 16-20 GB de VRAM en fp16 con lotes pequenos.
- Cuantizaciones estimadas (no publicadas, calculadas sobre el recuento de parametros): aproximadamente 7 GB en int8 y 4-5 GB en 4 bits, lo que en teoria permitiria ejecutarlo en GPUs consumer de 8 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para fp16 con lotes grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para fp16 con lotes pequenos; RTX 4070/3070 (8-12 GB) solo con cuantizacion de 4 bits.
- Cabe en GPU consumer: si, en fp16 en tarjetas de 24 GB; en 4 bits en tarjetas de 8 GB. Estas cifras son estimaciones tecnicas, no requisitos verificados por el autor.
- Opciones de despliegue: la libreria declarada es `transformers` y el modelo incluye los tags `text-generation-inference` y `endpoints_compatible`, por lo que es desplegable con TGI y con endpoints compatibles. El soporte en vLLM, llama.cpp, Ollama u otros motores no esta verificado, y en el caso de llama.cpp/Ollama requeriria convertir a GGUF, algo no publicado y potencialmente no trivial dada la estructura de bases compartidas.
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Datos de seguridad comparables |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l2_basis_remove50_swapdiscnet_b010_r06` | 6,74 B declarados en safetensors; fraccion densa resultante 0,4998 | 4096 tokens (heredado) | Llama 2 Community License | safetensors, transformers | ASR AdvBench 0,0346; ASR StrongREJECT 0,0799; sobrerrechazo 0,3503 |
| `meta-llama/Llama-2-7b-chat-hf` (modelo base) | 6,74 B | 4096 tokens | Llama 2 Community License | safetensors, transformers | no disponible en la informacion proporcionada |
| `meta-llama/Llama-3.1-8B-Instruct` (alternativa generalista) | 8,03 B | 131.072 tokens | Llama 3.1 Community License | safetensors, transformers | no disponible en la informacion proporcionada |
| `mistralai/Mistral-7B-Instruct-v0.3` (alternativa generalista) | 7,25 B | 32.768 tokens | Apache-2.0 | safetensors, transformers | no disponible en la informacion proporcionada |

Las alternativas generalistas se incluyen como referencia de categoria y tamano, pero no son equivalentes funcionales: este checkpoint es un artefacto experimental de seguridad, no un asistente listo para produccion, y no existe en la informacion disponible una comparacion de ASR entre estos modelos bajo el mismo protocolo de evaluacion.

## Limitaciones y advertencias

- Uso no recomendado como asistente: la propia model card indica que el checkpoint existe para medir compromisos seguridad/utilidad y que debe tratarse como sujeto experimental, no como modelo desplegable.
- Degradacion deliberada de seguridad: la compresion por si sola eleva la tasa de exito de ataque, y varias celdas de la rejilla estan degradadas a proposito respecto a Llama-2-7b-chat; este checkpoint es una de ellas.
- Reinchazo elevado: un 0,3503 de sobrerrechazo macro (WildGuard) implica que el modelo rechaza peticiones legitimas en aproximadamente un tercio de los casos medidos, lo que limita su utilidad conversacional.
- Riesgo de alucinacion: no evaluado ni cuantificado en la informacion disponible; la compresion agresiva de parametros es un factor de riesgo adicional no medido aqui.
- Sesgos conocidos: no documentados en la informacion disponible; hereda los sesgos de Llama-2-7b-chat y de `alpaca-cleaned`, sin evaluacion especifica en esta ficha.
- Limitaciones de contexto e idioma: 4096 tokens de contexto y entrenamiento predominantemente en ingles, sin datos de rendimiento en castellano ni en otros idiomas.
- Ausencia de benchmarks de utilidad: no hay resultados publicados de MMLU, HumanEval, GSM8K ni similares, por lo que se desconoce el coste real en capacidad general de la compresion y la edicion.
- Restricciones de licencia: Llama 2 Community License, con las obligaciones de atribucion ("Built with Llama 2"), las restricciones de uso del `USE_POLICY.md` y las clausulas de escala de usuarios activos mensuales aplicables al uso comercial.
- Falta de validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin revision por parte de la comunidad.
- Checkpoint intermedio: corresponde a la ronda 6 de 10 de una ejecucion mas larga, con presupuesto de restauracion completo del 1,000 %; los resultados no son extrapolables directamente a la ejecucion completa.
- Posible discrepancia de metadatos: el recuento de parametros reportado por safetensors (6.738.415.616) coincide exactamente con el de Llama-2-7b-chat sin comprimir y con un tamano de repositorio de 13,5 GB en fp16, mientras la ficha declara una fraccion densa resultante de 0,4998; conviene verificar la estructura real de los tensores antes de asumir un ahorro de memoria.
- Fechas de publicacion: el repositorio figura como creado el 2026-09-14, lo que sugiere metadatos sinteticos o mal registrados y refuerza la necesidad de verificar la procedencia antes de reutilizarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove50_swapdiscnet_b010_r06
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Referencia metodologica citada en la model card: Basis Sharing, ICLR 2025 (no se ha encontrado URL en la busqueda web realizada)
- Dataset de recuperacion citado: `alpaca-cleaned` (no se proporciona enlace en la model card)
- Jueces y conjuntos de evaluacion citados: HarmBench (AdvBench, StrongREJECT) y WildGuard (no se proporcionan enlaces en la model card)
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo, al paper de Basis Sharing ni a documentacion adicional; los unicos resultados devueltos corresponden a paginas de inicio de sesion y ayuda de Zoho One, sin relacion con este modelo.
