# Jeesup/svd-safety-l2_remove50_swapgapiter_b010_r04

## Resumen

svd-safety-l2_remove50_swapgapiter_b010_r04 es un checkpoint de investigacion publicado por el usuario Jeesup que parte de meta-llama/Llama-2-7b-chat-hf y le aplica dos transformaciones sucesivas: una compresion mediante SVD-LLM que elimina el 50,01% de los parametros densos, y una edicion posterior consistente en 4 de las 10 rondas previstas de un procedimiento de intercambio iterativo de parametros ("parameter-neutral swap") guiado por la regla de seleccion `gap_iter`.

El artefacto forma parte de un estudio sobre como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes repara mejor ese dano. No es un asistente conversacional de proposito general: el propio autor lo describe como una celda de una rejilla experimental sobre reglas de seleccion y presupuestos de restauracion.

Su relevancia es por tanto metodologica y de interpretabilidad: cuantifica el trade-off entre seguridad y utilidad bajo compresion, y publica mediciones reproducibles de tasa de exito de ataque (ASR) y de sobre-rechazo antes de sacar conclusiones. El checkpoint corresponde a una ronda intermedia (4 de 10) de una ejecucion mas larga, con una fraccion de parametros resultante de 0,4999 y semilla 42.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 2, derivada de meta-llama/Llama-2-7b-chat-hf |
| Parametros totales | 6.738.415.616 (segun safetensors) |
| Parametros activos | no aplica: modelo denso, no es una arquitectura MoE |
| Longitud de contexto | no especificada en la model card; el modelo base Llama-2-7b-chat emplea 4.096 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin variantes cuantizadas (GGUF, AWQ, GPTQ) |
| Idiomas soportados | no disponible en la model card |
| Licencia | Llama 2 Community License (incluye LICENSE.txt y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (libreria transformers, pipeline text-generation) |
| Fraccion de parametros resultante | 0,4999 tras la compresion y la edicion aplicada |
| Metodo de compresion | SVD-LLM, 50,01% de parametros eliminados |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000% de los parametros densos |
| Componentes restaurados / sustituidos | 2.772 / 2.772 |
| Parametros intercambiados | 25.894.656 (0,40% de los parametros de proyeccion densos) |
| Rondas iterativas aplicadas | 4 de 10 (bloques de 0,100% de parametros densos por ronda) |
| Semilla | 42 |
| Tamano del repositorio | 13,5 GB |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

La base es un transformer decoder-only con atencion causal y normalizacion RMSNorm, propio de la familia Llama 2 en su variante de 7.000 millones de parametros, ya ajustada por instrucciones (chat). Sobre ese checkpoint no se ha reentrenado nada: la intervencion es post-hoc y consta de dos fases. Primero se aplica SVD-LLM, una compresion de bajo rango que descompone las matrices de proyeccion y elimina el 50,01% de los parametros densos. Despues se ejecuta un bucle iterativo de intercambio de parametros neutral en numero: en cada ronda se restauran 2.772 componentes desde el modelo denso original y se expulsan otros tantos, con ordenacion sigma para la expulsion y valor de insercion `insert`.

La celda documentada corresponde a 4 de las 10 rondas del bucle completo, con un presupuesto total de restauracion del 1,000% de los parametros densos y un bloque del 0,100% por ronda. En esta ronda intermedia se han intercambiado 25.894.656 parametros, equivalentes al 0,40% de los parametros de proyeccion densos. No se documenta en la informacion disponible ninguna fase de RLHF, DPO o ajuste adicional posterior a la compresion y edicion, ni el volumen o la composicion del dataset de entrenamiento original, que corresponde integramente a Llama-2-7b-chat.

## Capacidades

- Generacion de texto conversacional heredada del modelo base Llama-2-7b-chat, con capacidad degradada respecto al original por efecto de la compresion.
- Mitigacion parcial de comportamiento inseguro: las rondas de intercambio de parametros reducen la tasa de exito de ataque respecto al checkpoint comprimido sin editar, segun el estudio del autor.
- Medicion de seguridad reproducible: el checkpoint se evalua con AdvBench, StrongREJECT y WildGuard, con un juez HarmBench.
- Interpretabilidad de componentes: al estar documentados los componentes restaurados y expulsados (2.772 por ronda), permite analisis de que subconjuntos de pesos sostienen el comportamiento de rechazo.
- Generacion de texto en el sentido generico del pipeline `text-generation`, con inferencia compatible con transformers y con endpoints compatibles con TGI.
- Soporte de tool calling / function calling: no disponible, no se documenta en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible, no se documenta.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Modo thinking, vision o audio: no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Investigacion sobre seguridad bajo compresion: usar el checkpoint como sujeto experimental para medir cuanto degrada la compresion SVD-LLM la tasa de rechazo de peticiones daninas (AdvBench ASR 0,2000; StrongREJECT ASR 0,1700) frente al modelo denso de partida.
- Auditoria de trade-off seguridad-utilidad: comparar la macro de sobre-rechazo sobre WildGuard (0,2107) con la ASR para decidir si una regla de seleccion concreta compensa la perdida de utilidad que introduce.
- Comparacion de reglas de seleccion de componentes: al ser una celda de una rejilla, permite aislar el efecto de la regla `gap_iter` frente a otras reglas con el mismo presupuesto del 1,000%.
- Analisis de interpretabilidad: examinar los 2.772 componentes restaurados por ronda para identificar que matrices de proyeccion concentran el comportamiento de rechazo y cuales son prescindibles.
- Reproducibilidad y evaluacion de jueces: emplear el checkpoint como entrada controlada (semilla 42, ronda 4 de 10) para validar que un pipeline de evaluacion con juez HarmBench produce resultados estables.
- Docencia y divulgacion tecnica: ilustrar con un caso real y medible por que un checkpoint comprimido no debe desplegarse como asistente sin una evaluacion de seguridad previa.
- Pruebas de pipelines de inferencia: validar la integracion con transformers o TGI sobre un modelo del mismo tamano que Llama-2-7b-chat antes de mover cargas a produccion.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,2000 |
| StrongREJECT ASR (juez HarmBench) | 0,1700 |
| Macro sobre-rechazo (WildGuard) | 0,2107 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas de capacidad general en la informacion disponible. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia, a partir de los 6.738.415.616 parametros: unos 13,5 GB en FP16/BF16 (coincide con el tamano del repositorio), unos 27 GB en FP32, unos 6,7 GB en int8 y entre 3,5 y 4 GB en cuantizacion de 4 bits.
- Cache KV adicional estimada en unos 2 GB para 4.096 tokens en FP16, segun la configuracion habitual de Llama-2-7b (32 capas, atencion multi-cabeza).
- GPU de datacenter: A100 de 40 o 80 GB, H100, L40S; sobran para FP16 incluso con contexto completo.
- GPU de consumo: cabe en FP16 en RTX 4090, RTX 3090 y RTX 4080 de 24 GB (esta ultima con poco margen); en 4 bits cabe en RTX 3060 de 12 GB, RTX 4070 y RTX 4060 Ti de 16 GB; en 8 bits cabe en T4 de 16 GB.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (el repositorio incluye el tag y es endpoints_compatible) y vLLM. llama.cpp u Ollama requeririan convertir los pesos a GGUF, conversion que no se publica en el repositorio.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de seguridad |
|---|---|---|---|---|---|
| svd-safety-l2_remove50_swapgapiter_b010_r04 | 6.738.415.616 (0,4999 del denso) | no disponible (base: 4.096) | Llama 2 Community License | HuggingFace, 0 descargas | AdvBench ASR 0,2000; StrongREJECT ASR 0,1700; WildGuard 0,2107 |
| meta-llama/Llama-2-7b-chat-hf (modelo base) | no disponible en la informacion proporcionada | 4.096 tokens segun la arquitectura Llama 2 | Llama 2 Community License | HuggingFace | no disponible en la informacion proporcionada |
| Otras celdas de la rejilla del mismo estudio (otras reglas y presupuestos) | del orden de 6,7 mil millones | no disponible | Llama 2 Community License | no disponible | no disponible |
| SVD-LLM como metodo de compresion (referencia metodologica) | no aplica | no aplica | no disponible | no disponible | no disponible |

No se dispone de resultados de benchmarks comparables de terceros para establecer una comparacion cuantitativa de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un asistente desplegable: el propio autor lo define como artefacto de investigacion y advierte que varias ramas de la rejilla estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat.
- La compresion por si sola eleva la tasa de exito de ataque; las 4 rondas de intercambio aplicadas solo la reducen parcialmente. Las cifras de ASR de 0,2000 y 0,1700 siguen siendo elevadas para cualquier uso real.
- La macro de sobre-rechazo de 0,2107 indica que el modelo rechaza de forma injustificada una proporcion relevante de peticiones benignas, lo que degrada la utilidad conversacional.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al tratarse de un modelo comprimido y editado sin reentrenamiento posterior, la fidelidad factual puede diferir de la del modelo base.
- El checkpoint corresponde a una ronda intermedia (4 de 10), no al resultado final del bucle de edicion; los numeros publicados no son extrapolables a la ejecucion completa.
- No se declaran idiomas soportados ni se documentan capacidades de tool calling, agentes o multimodalidad; asumir su presencia no esta justificado por la informacion disponible.
- Licencia: Llama 2 Community License, con las restricciones de uso comercial y de politica de uso aceptable que impone el titular original. Cualquier uso derivado queda vinculado a LICENSE.txt y USE_POLICY.md incluidos en el repositorio.
- Modelo con 0 descargas y 0 likes: no hay validacion externa ni reportes de terceros sobre su comportamiento real.
- Fecha de creacion registrada el 17 de septiembre de 2026, lo que conviene verificar antes de citarlo como trabajo consolidado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapgapiter_b010_r04
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- No se han encontrado en la busqueda web enlaces relevantes al modelo, al metodo SVD-LLM ni al estudio de referencia; los resultados devueltos no guardan relacion con el contenido de esta ficha.
