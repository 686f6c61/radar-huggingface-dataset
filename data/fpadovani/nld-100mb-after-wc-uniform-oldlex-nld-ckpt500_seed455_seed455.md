# fpadovani/nld-100mb-after-wc-uniform-oldlex-nld-ckpt500_seed455_seed455

## Resumen

`nld-100mb-after-wc-uniform-oldlex-nld-ckpt500_seed455_seed455` es un modelo de generacion de texto publicado por el usuario `fpadovani` en HuggingFace. Se trata de un ajuste fino (SFT) del modelo `fpadovani/ppt-wc-uniform-oldlex-nld-100mb_seed455`, realizado con la libreria TRL sobre una arquitectura de tipo GPT-2, segun los tags declarados en el repositorio. Cuenta con 124.770.816 parametros reales (verificados en los pesos safetensors) y un repositorio de 1,7 GB.

El modelo no es un lanzamiento de produccion, sino un artefacto de investigacion. La nomenclatura del identificador (`ckpt500`, `seed455` repetido, `100mb`, `oldlex`, `nld`) y el proyecto de Weights & Biases asociado (`f-padovani-university-of-groningen/white_cotterell`) apuntan a un experimento academico controlado sobre datos de preentrenamiento, probablemente un estudio de ablacion con distintas configuraciones de lexico y presupuestos de datos, en el que se comparan variantes con una semilla fija. La repeticion de `seed455` en el nombre sugiere un ajuste fino encadenado sobre un checkpoint ya entrenado con la misma semilla.

Su relevancia es por tanto metodologica y no competitiva: sirve como punto de reproducibilidad para un estudio de entrenamiento y como ejemplo de pipeline SFT con TRL. No hay informacion publicada sobre idiomas soportados, licencia, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (segun tag `gpt2` del repositorio; familia transformer decoder-only) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la configuracion no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizacion declarada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card declara `licence: license` sin especificar terminos) |
| Formato de pesos | safetensors |
| Modelo base | fpadovani/ppt-wc-uniform-oldlex-nld-100mb_seed455 |
| Metodo de ajuste | SFT con TRL 0.23.0 |
| Tamano del repositorio | 1,7 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura declarada es GPT-2, es decir, un transformer decoder-only con atencion causal y normalizacion pre-LN, en la variante de aproximadamente 124 millones de parametros (el equivalente a GPT-2 small). El recuento exacto de 124.770.816 parametros difiere ligeramente del GPT-2 small canonico de OpenAI, lo que sugiere un vocabulario o una configuracion de embeddings distinta; no se dispone de la configuracion completa (`config.json`) en la informacion proporcionada para confirmarlo. Tampoco se dispone de la longitud de contexto efectiva ni del tamano de vocabulario.

El entrenamiento consistio en un ajuste fino supervisado (SFT) sobre el modelo base, ejecutado con TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas adicionales como RLHF o DPO. El run de entrenamiento esta registrado en Weights & Biases bajo el proyecto `white_cotterell`. El prefijo `nld-100mb-after-wc-` del nombre y la referencia a `oldlex` indican que forma parte de una matriz de experimentos sobre lexico y presupuesto de datos de 100 MB, con la variante `uniform`, y que el ajuste se realizo "despues" de una etapa previa (`after-wc`), sobre el checkpoint 500 del entrenamiento base. No se han documentado innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal u otras) en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva en modo pipeline de HuggingFace (`text-generation`), con entrada en formato de mensajes de rol (`user`) segun el ejemplo de la model card.
- Conversacion de un solo turno en el ejemplo publicado: la model card muestra una pregunta abierta y la generacion de hasta 128 tokens nuevos.
- Ajuste instruccional basico: al haber sido entrenado con SFT, esta orientado a responder a instrucciones del usuario en lugar de continuar texto arbitrario.
- Compatibilidad con `text-generation-inference` y con `endpoints_compatible`, segun los tags del repositorio, lo que permite desplegarlo con la pila de inferencia de HuggingFace.
- No hay evidencia de soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de razonamiento explicito.
- El soporte multilingue no esta documentado; se desconoce el idioma o idiomas para los que fue entrenado.

## Casos de uso

- Reproducibilidad de experimentos academicos: el modelo permite replicar el punto exacto de un estudio de ablacion sobre datos de preentrenamiento (variante `uniform`, `oldlex`, `100mb`, semilla 455, checkpoint 500) y comparar el efecto del ajuste SFT posterior frente al modelo base.
- Linea base en investigacion de ajuste instruccional: sirve como referencia de un modelo de 124 M parametros entrenado con SFT mediante TRL, util para medir la ganancia de tecnicas posteriores (DPO, RLHF) sin el coste de un modelo grande.
- Pruebas de pipelines de entrenamiento y evaluacion: por su tamano reducido, se puede usar para validar scripts de evaluacion, tokenizacion y generacion antes de escalarlos a modelos mayores.
- Docencia y divulgacion: permite ilustrar en un aula o tutorial el ciclo completo de ajuste fino con TRL y el despliegue con `transformers.pipeline` en una GPU de consumo o incluso en CPU.
- Generacion de texto de bajo coste en prototipos: para demos internas donde la calidad linguistica no es critica y se prioriza que el modelo quepa en cualquier hardware.
- Servidor de inferencia de pruebas con TGI o endpoints compatibles: al estar etiquetado como `text-generation-inference` y `endpoints_compatible`, puede desplegarse para validar configuraciones de serving, batching y limites de tokens antes de pasar a modelos en produccion.
- Estudio de sesgos y comportamiento de modelos pequenos: al ser un artefacto de un experimento controlado con semilla fija, resulta util para analizar como varian las salidas con el entrenamiento y el ajuste posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (MMLU, HumanEval, GSM8K, Perplexity ni ninguna otra) y el repositorio no declara evaluaciones. Tampoco se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 0,5 GB solo para pesos, mas activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 0,25 GB de pesos; en int8 alrededor de 0,13 GB y en cuantizacion de 4 bits alrededor de 0,08 GB.
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o en CPU para inferencia de baja concurrencia.
- GPU de datacenter (A100, H100, L40S) no son necesarias; solo tendrian sentido para servir muchas replicas concurrentes en paralelo.
- Opciones de despliegue: `transformers` con `pipeline` (metodo documentado por el autor), Text Generation Inference (TGI) al estar el modelo etiquetado como `text-generation-inference`, y endpoints compatibles de HuggingFace. Para llama.cpp u Ollama seria necesario convertir previamente los pesos safetensors a GGUF, algo que no esta documentado ni verificado en la informacion disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

Los datos de modelos alternativos que aparecen a continuacion corresponden a caracteristicas publicas ampliamente conocidas de esos modelos, no a mediciones realizadas sobre este modelo ni a informacion aportada en la busqueda. No hay datos de rendimiento comparables para este checkpoint.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| nld-100mb-after-wc-uniform-oldlex-nld-ckpt500_seed455_seed455 | 124,77 M | no disponible | no disponible | HuggingFace, 0 descargas | no disponible |
| GPT-2 small (OpenAI) | ~124 M | 1024 tokens | Modified MIT | Ampliamente disponible | no disponible (sin evaluacion comun publicada para este checkpoint) |
| DistilGPT-2 | ~82 M | 1024 tokens | Apache-2.0 | Ampliamente disponible | no disponible |
| Pythia-160M (EleutherAI) | ~162 M | 2048 tokens | Apache-2.0 | Ampliamente disponible | no disponible |

## Limitaciones y advertencias

- No hay ninguna metrica publicada de calidad, por lo que se desconoce si el modelo produce texto coherente o util mas alla del ejemplo de la model card.
- Riesgo elevado de alucinacion: con 124 M parametros y sin datos de entrenamiento documentados, la generacion de hechos es poco fiable por construccion.
- Idiomas soportados desconocidos: no se puede asumir que el modelo funcione correctamente en castellano ni en ningun otro idioma concreto.
- Licencia no disponible: la model card declara `licence: license` sin terminos concretos, por lo que no hay base legal clara para uso comercial. Conviene contactar con el autor antes de cualquier uso fuera de investigacion.
- Sesgos desconocidos: no se ha publicado ningun analisis de sesgos ni la composicion del corpus de entrenamiento.
- Artefacto de investigacion: el nombre del checkpoint (`ckpt500`, `seed455`) indica que es un punto intermedio de un experimento, no un modelo final optimizado ni validado para produccion.
- Sin garantia de mantenimiento: 0 descargas y 0 "likes" en el momento de la consulta, sin documentacion de soporte ni comunidad asociada.
- La busqueda web asociada al identificador no devuelve resultados relevantes: los enlaces encontrados corresponden a zapatillas Adidas NMD y no guardan relacion con el modelo.
- Sin informacion sobre la longitud de contexto, no se deben disenar aplicaciones que dependan de ventanas largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/nld-100mb-after-wc-uniform-oldlex-nld-ckpt500_seed455_seed455
- Modelo base: https://huggingface.co/fpadovani/ppt-wc-uniform-oldlex-nld-100mb_seed455
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/x9don2ya
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de TRL (von Werra et al., 2020), citado en la model card: sin URL directa en la informacion disponible
- Resultados de busqueda web: no relevantes (corresponden a productos de calzado Adidas NMD, sin relacion con el modelo)
