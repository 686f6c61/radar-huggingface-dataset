# Jeesup/svd-safety-l3_remove30_swapgapiter_b010_r05

## Resumen

`svd-safety-l3_remove30_swapgapiter_b010_r05` es un artefacto de investigacion publicado por el usuario Jeesup en HuggingFace. Se trata de un checkpoint derivado de `meta-llama/Meta-Llama-3-8B-Instruct` al que se le ha aplicado una compresion por descomposicion en valores singulares mediante el metodo SVD-LLM, eliminando el 30,01 % de los parametros densos, seguida de un proceso de edicion de parametros denominado *parameter-neutral swap*. El resultado declarado es una fraccion de parametros de 0,6999 respecto del modelo denso original.

El interes del checkpoint no es su calidad como asistente, sino su papel como sujeto experimental. Forma parte de una rejilla de experimentos que estudia como la compresion SVD degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes repara mejor ese dano. En esta celda concreta la regla de seleccion es `gap_iter`, el presupuesto de restauracion es del 1,000 % de los parametros densos, se han aplicado 5 de las 10 rondas iterativas previstas (0,100 % de parametros por ronda) y se han restaurado 5.598 componentes sustituyendo otros tantos.

La model card advierte de forma explicita de que varias ramas de la rejilla estan "deliberadamente degradadas en seguridad" respecto al modelo base y de que este checkpoint concreto es una ronda intermedia de una ejecucion mas larga. No es, por tanto, un modelo desplegable, sino una pieza de laboratorio para cuantificar el compromiso entre seguridad y utilidad bajo compresion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3); no se documentan modificaciones estructurales adicionales |
| Parametros totales | 8.030.261.248 segun los metadatos de safetensors (la model card declara una fraccion resultante de 0,6999 respecto del denso) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (heredada del modelo base; no se especifica en la model card) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en precision completa; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible en la model card; el modelo base declara ingles como idioma principal y soporte limitado en aleman, frances, italiano, portugues, hindi, espanol y thai |
| Licencia | Meta Llama 3 Community License (etiqueta `llama3`); se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Tamano del repositorio | 16,1 GB |
| Metodo de compresion | SVD-LLM, 30,01 % de parametros eliminados |
| Regla de seleccion de componentes | `gap_iter` |
| Presupuesto de restauracion | 1,000 % de los parametros densos (0,100 % por ronda) |
| Componentes restaurados / sustituidos | 5.598 restaurados y 5.598 sustituidos |
| Parametros intercambiados | 34.866.176 (0,50 % de los parametros de proyeccion densos) |
| Valor de swap | `insert` (solo valor de insercion; desalojo ordenado por sigma) |
| Semilla | 42 |
| Rondas iterativas aplicadas | 5 de 10 (checkpoint intermedio) |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-3-8B-Instruct: un transformer decoder-only denso con atencion causal, normalizacion RMSNorm, activacion SwiGLU y atencion con consultas agrupadas (GQA). Sobre esa base no se ha realizado un reentrenamiento, sino una intervencion post-hoc en los pesos en dos fases. La primera es una compresion SVD-LLM que elimina el 30,01 % de los parametros densos; la segunda es un procedimiento de edicion iterativa llamado *parameter-neutral swap*, que en cada ronda sustituye un conjunto de componentes por otros seleccionados con la regla `gap_iter`, con un presupuesto de 0,100 % de los parametros densos por ronda.

Los datos de entrenamiento no se detallan en la informacion disponible: no se indica numero de tokens, composicion del dataset, ni si hubo fases de RLHF o DPO adicionales. La unica alineacion conocida es la del modelo base Meta Llama 3 8B Instruct, que se mantiene parcialmente y que la propia model card senala como degradada por efecto de la compresion. La innovacion tecnica del artefacto es, precisamente, el protocolo de compresion y reparacion: 5.598 componentes restaurados frente a 5.598 desalojados, un total de 34.866.176 parametros intercambiados (0,50 % de los parametros de proyeccion densos) y una semilla fija (42) para permitir la reproduccion.

Conviene senalar una discrepancia objetiva entre los metadatos y la model card: el conteo de parametros de safetensors (8.030.261.248) y el tamano del repositorio (16,1 GB) coinciden con los de un checkpoint denso de 8B en fp16, no con una fraccion de 0,6999, que corresponderia a unos 5.620 millones de parametros y a unos 11,2 GB. La model card no explica esta diferencia, por lo que la interpretacion de que la compresion reduce el numero de tensores almacenados no puede darse por confirmada.

## Capacidades

- Generacion de texto conversacional e instrucciones: conserva la interfaz de chat del modelo base, aunque con calidad no verificada tras la compresion.
- Razonamiento y tareas de conocimiento general: capacidades heredadas de Llama-3-8B-Instruct, sin evaluacion publicada en esta celda (no hay MMLU, GSM8K ni HumanEval medidos).
- Generacion de codigo: presumiblemente mantenida del modelo base, no verificada en este checkpoint.
- Soporte multilingue: no especificado; el modelo base esta orientado a ingles con soporte limitado en otros idiomas.
- Tool calling / function calling: no documentado en este checkpoint; el modelo base soporta plantillas de herramientas, pero no hay confirmacion de que la compresion preserve esta capacidad.
- Modo de razonamiento explicito (*thinking*): no disponible.
- Vision o audio: no disponible (modelo exclusivamente de texto).
- Capacidad diferencial del artefacto: servir como sujeto de medida de seguridad. La model card reporta una tasa de exito de ataque (ASR) de 0,1700 en AdvBench y 0,2700 en StrongREJECT, ambas evaluadas con el juez HarmBench, y un macro over-refusal de 0,0711 medido con WildGuard.

## Casos de uso

- Auditoria de seguridad de pipelines de compresion: el checkpoint permite reproducir las tasas ASR de AdvBench (0,1700) y StrongREJECT (0,2700) con el juez HarmBench para cuantificar cuanto dano de seguridad introduce la eliminacion del 30 % de parametros por SVD antes de aplicar reparaciones.
- Estudio comparado de reglas de seleccion de componentes: al fijar la regla `gap_iter`, esta celda sirve como punto de referencia frente a otras celdas de la rejilla que usan reglas distintas, manteniendo constante la semilla (42) y el presupuesto por ronda (0,100 %).
- Investigacion sobre sobre-rechazo: el valor de macro over-refusal de 0,0711 medido con WildGuard permite calibrar el equilibrio entre rechazo de peticiones daninas y utilidad, un eje critico cuando la compresion degrada la alineacion.
- Red-teaming controlado en laboratorio: al ser un modelo deliberadamente degradado y no desplegable, es adecuado como objetivo de pruebas de ataque en entornos aislados donde no se expone a usuarios finales.
- Reproducibilidad de experimentos de compresion: la publicacion de la semilla, el numero de componentes restaurados (5.598) y el numero de parametros intercambiados (34.866.176) permite a otros grupos replicar exactamente la ronda 5 de 10 y verificar el efecto de aplicar las cinco rondas restantes.
- Analisis de interpretabilidad de pesos: los 5.598 componentes sustituidos y los 34.866.176 parametros intercambiados constituyen un conjunto acotado sobre el que estudiar que subconjuntos de pesos sostienen el comportamiento de rechazo.
- Linea base para futuros metodos de reparacion: cualquier tecnica nueva (destilacion, fine-tuning selectivo, edicion de bajo rango) puede compararse contra esta celda bajo las mismas condiciones de compresion y presupuesto.
- Validacion de arneses de evaluacion de seguridad: permite comprobar que los pipelines internos de AdvBench, StrongREJECT, HarmBench y WildGuard producen cifras estables sobre un modelo con ASR conocido y publicado.

## Benchmarks y rendimiento

La model card solo publica metricas de seguridad, no resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Valor | Instrumento de evaluacion |
|---|---|---|
| AdvBench ASR | 0,1700 | Juez HarmBench |
| StrongREJECT ASR | 0,2700 | Juez HarmBench |
| Macro over-refusal | 0,0711 | WildGuard |

No se han publicado resultados de benchmarks de capacidad general en la informacion disponible. Tampoco se proporcionan comparaciones directas contra el modelo base sin comprimir ni contra otras celdas de la rejilla, por lo que no es posible determinar cuanto de estos valores se debe a la compresion y cuanto al proceso de swap.

## Requisitos de hardware

Las cifras siguientes son estimaciones generales para un modelo denso de aproximadamente 8.000 millones de parametros; la model card no publica requisitos de hardware ni medidas de latencia.

- VRAM estimada en fp16/bf16: en torno a 16-17 GB solo para los pesos, mas overhead de cache KV y activaciones.
- VRAM estimada en cuantizacion de 8 bits: en torno a 9-10 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 5-6 GB, siempre que se genere una version cuantizada (no se distribuye ninguna).
- GPU profesionales: A100 40/80 GB, H100 80 GB o L40S, con margen amplio para lotes grandes y contextos largos.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en fp16 con contexto moderado; en tarjetas de 8-12 GB seria necesario cuantizar a 4 bits.
- Opciones de despliegue: el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con TGI; tambien deberia poder servirse con vLLM o con la pila estandar de `transformers`. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, algo que el autor no proporciona.
- Latencia y throughput: no disponibles. No se publican medidas de tokens por segundo ni de tiempo hasta el primer token.
- Nota de despliegue: dado que el checkpoint esta pensado como artefacto de investigacion y presenta degradacion de seguridad declarada, no se recomienda su servicio en produccion ni su exposicion publica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l3_remove30_swapgapiter_b010_r05 | 8.030 M declarados en safetensors; fraccion densa 0,6999 segun la model card | 8.192 tokens (heredado del base) | ASR AdvBench 0,1700; ASR StrongREJECT 0,2700; macro over-refusal 0,0711 | Meta Llama 3 Community License | Publico en HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| meta-llama/Meta-Llama-3-8B-Instruct (base sin comprimir) | 8.030 M | 8.192 tokens | No disponible en la informacion proporcionada | Meta Llama 3 Community License | Publico y ampliamente utilizado |
| Otras celdas de la rejilla del mismo autor (distintas reglas de seleccion y presupuestos) | No disponible | No disponible | No disponible | Meta Llama 3 Community License | Referenciadas en la model card como parte del mismo estudio |
| Metodos alternativos de compresion de Llama-3-8B (por ejemplo, poda estructurada o cuantizacion) | No disponible | No disponible | No disponible | Depende de cada publicacion | No disponible |

No se dispone de resultados de benchmarks comparables entre el checkpoint comprimido y el modelo base, por lo que la comparativa de rendimiento se limita a las metricas de seguridad publicadas en esta celda.

## Limitaciones y advertencias

- Modelo deliberadamente degradado en seguridad: la propia model card advierte de que varias ramas de la rejilla elevan la tasa de exito de ataque respecto a Llama-3-8B-Instruct. Los valores publicados (ASR 0,1700 en AdvBench y 0,2700 en StrongREJECT) deben leerse como medidas de dano, no como logros.
- No es un asistente desplegable: el autor indica explicitamente que cada celda debe tratarse como sujeto experimental y no como un asistente listo para uso general.
- Riesgo de alucinacion: no se ha medido ni documentado en esta celda; la compresion SVD puede incrementarlo, pero no hay datos que lo cuantifiquen.
- Discrepancia en el conteo de parametros: los metadatos de safetensors (8.030.261.248) y el tamano del repositorio (16,1 GB) corresponden a un modelo denso de 8B en fp16, no a la fraccion 0,6999 declarada en la model card. Conviene verificar la estructura real de los tensores antes de asumir cualquier ahorro de memoria.
- Idiomas: no especificados. La herencia multilingue del modelo base es limitada y no se ha verificado tras la compresion.
- Contexto limitado a 8.192 tokens en el modelo base, sin indicacion de que se haya extendido.
- Ausencia de benchmarks de capacidad general: no hay MMLU, GSM8K, HumanEval ni evaluaciones de tool calling, de modo que la utilidad real del checkpoint fuera del eje de seguridad es desconocida.
- Sin versiones cuantizadas publicadas: desplegarlo en hardware de consumo requiere generar las cuantizaciones por cuenta propia y validarlas.
- Licencia: uso sujeto a la Meta Llama 3 Community License y a `USE_POLICY.md`, incluidos en el repositorio. Esto implica obligaciones de atribucion ("Built with Meta Llama 3"), condiciones sobre denominacion de productos derivados y limites de uso comercial ligados al umbral de usuarios activos mensuales de la licencia de Meta.
- Madurez y soporte: el repositorio tiene 0 descargas y 0 likes, sin issues ni documentacion adicional, y el checkpoint corresponde a una ronda intermedia (5 de 10) de una ejecucion mas larga, por lo que no representa el resultado final del experimento.
- Validacion por parte del usuario: la model card recomienda evaluar el modelo por cuenta propia antes de extraer conclusiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove30_swapgapiter_b010_r05
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia del modelo base (Meta Llama 3 Community License): https://llama.meta.com/llama3/license/
- Politica de uso aceptable de Meta Llama 3 (`USE_POLICY.md`, incluida en el repositorio): https://llama.meta.com/llama3/use-policy/
- Paper de SVD-LLM (metodo de compresion referenciado en la model card; el autor no incluye el enlace explicito): no disponible en la informacion proporcionada
- Repositorio de codigo del estudio: no disponible en la informacion proporcionada
- Demos o espacios asociados: no disponible en la informacion proporcionada
- Nota sobre la busqueda web: los resultados recuperados no guardan relacion con el modelo (contenido generico sobre Microsoft) y no aportan enlaces adicionales utilizables.
