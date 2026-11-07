# CladeTeam/CENO-rice-cds

## Resumen

CENO-rice-cds es un modelo de lenguaje de ADN desarrollado por CladeTeam, resultado del ajuste fino durante una época del modelo base CladeTeam/CENO-base-1b-preview sobre secuencias CDS (coding sequences) de *Oryza sativa* (arroz). El modelo pertenece a la familia CENO, derivada a su vez de la arquitectura Nemotron-H de NVIDIA, y está pensado como herramienta de puntuación de secuencias mediante log-verosimilitud, no como predictor de función biológica.

Con 1.302.429.280 parámetros totales (aproximadamente 1,3 mil millones), el modelo se distribuye en formato safetensors con código remoto de Transformers personalizado (`CENOForCausalLM` y `CENOCharLevelTokenizer`), lo que exige cargarlo con `trust_remote_code=True`. Su tokenizador es a nivel de carácter sobre el alfabeto de ADN, lo que lo aleja de los modelos de lenguaje naturales convencionales.

La relevancia del modelo es acotada y específica: el autor lo publica explícitamente para reproducir experimentos de puntuación de secuencias HTT/polyQ, y advierte que las puntuaciones de log-verosimilitud reflejan la probabilidad del modelo de secuencia, no la aptitud biológica ni la patogenicidad. Es, por tanto, una pieza de infraestructura de investigación en genómica computacional más que un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de NVIDIA Nemotron-H (hibrida, con componentes Mamba y atencion; implementacion renombrada como CENO) |
| Parametros totales | 1.302.429.280 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el entrenamiento uso max_length=8192) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | dna (ADN; tokenizador a nivel de caracter) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | CladeTeam/CENO-base-1b-preview |
| Tamano del repositorio | 2,6 GB |
| Descargas | 144 |
| Fecha de creacion | 2026-06-20 |
| Ultima actualizacion | 2026-11-07 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Nemotron-H de NVIDIA, que combina capas de tipo Mamba con mecanismos de atencion en un diseno hibrido. El codigo remoto incluido en el repositorio (`configuration_ceno.py`, `modeling_ceno.py`) es un renombrado de la implementacion upstream de Nemotron-H, con modificaciones de CladeTeam. La configuracion incluida establece `use_mamba_kernels=false`, de modo que se emplea el fallback de Mamba en PyTorch puro y no es necesario instalar `mamba-ssm` ni `causal-conv1d` para la inferencia basica, aunque el codigo depende del stack Mamba/Triton de Nemotron-H.

El ajuste fino se realizo durante 1 epoca sobre secuencias CDS de arroz, con learning rate de 5e-5, batch efectivo de 64, precision bf16 y longitud maxima de 8192, sobre 8 GPUs. Las metricas de entrenamiento reportadas muestran una `train_loss` de 10,052 y una `eval_loss` de 1,2155. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; dado que se trata de un ajuste fino supervisado sobre un modelo base de ADN, lo mas probable es que no se hayan usado, pero este extremo no se confirma en la documentacion.

## Capacidades

- Generacion y puntuacion de secuencias de ADN, en particular secuencias codificantes (CDS).
- Modelado de lenguaje causal a nivel de caracter sobre el alfabeto de ADN.
- Calculo de log-verosimilitud de secuencias, que es el uso principal declarado por el autor.
- Puntuacion de secuencias con repeticiones HTT/polyQ en experimentos de investigacion.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- No es multilingue en el sentido convencional: su unico "idioma" es la secuencia de ADN.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Puntuacion de secuencias CDS de arroz: el modelo calcula la log-verosimilitud de secuencias codificantes de *Oryza sativa*, lo que permite comparar y ordenar variantes segun su ajuste al modelo entrenado en ese genoma.
- Reproduccion de experimentos HTT/polyQ: el autor publica el modelo especificamente para reproducir sus experimentos de puntuacion de secuencias con repeticiones polyQ, de modo que otros grupos pueden replicar los resultados con los mismos pesos.
- Filtrado de candidatos en pipelines genomicos: al puntuar secuencias con el modelo se puede priorizar un subconjunto de variantes o construcciones antes de un analisis experimental costoso, usando la log-verosimilitud como criterio de ordenacion.
- Deteccion de secuencias atipicas: secuencias con puntuaciones muy bajas respecto a la distribucion del modelo pueden senalarse para revision manual, como aproximacion a la deteccion de anomalias en datos genomicos.
- Investigacion en modelos de lenguaje de ADN: sirve como punto de comparacion para estudiar como se comporta un modelo hibrido tipo Nemotron-H de ~1,3B en dominios biologicos frente a alternativas transformer puras.
- Generacion controlada de secuencias en entornos de laboratorio: el modelo puede generar secuencias de ADN sinteticas para experimentos in silico, siempre con validacion biologica posterior y sin asumir que la generacion es funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas metricas reportadas son las de entrenamiento: `train_loss` de 10,052 y `eval_loss` de 1,2155 tras una epoca.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 2,6 GB solo para los pesos, mas overhead de activaciones y cache; en la practica, un minimo de 6-8 GB de VRAM para secuencias cortas y bastante mas para longitudes cercanas a 8192.
- GPU recomendadas: A100 o H100 para entrenamiento y para inferencia con contexto largo; RTX 4090 o GPUs consumer de gama alta con 16-24 GB para inferencia en precision reducida.
- Cabe en GPU consumer: si, en tarjetas con al menos 8-12 GB de VRAM para secuencias moderadas; con cuantizacion no documentada, el margen podria ser mayor, pero no se dispone de datos oficiales al respecto.
- Opciones de despliegue: Transformers con `trust_remote_code=True` es la via documentada. El autor menciona que HF y vLLM usan entornos separados, lo que sugiere compatibilidad con vLLM, aunque no se detalla la configuracion. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Stack probado: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| CENO-rice-cds | 1,3B | no disponible (entrenado a 8192) | Apache-2.0 | ADN, ajuste fino en CDS de arroz |
| CladeTeam/CENO-base-1b-preview | ~1B (por nombre) | no disponible | no disponible | Modelo base de ADN de la misma familia |
| Nemotron-H (NVIDIA) | no disponible | no disponible | Apache-2.0 | Arquitectura hibrida origen, proposito general |

No se identifican en la informacion disponible otros modelos de ADN comparables con datos verificables de parametros y contexto.

## Limitaciones y advertencias

- Las puntuaciones de log-verosimilitud reflejan la probabilidad del modelo de secuencia, no la aptitud biologica ni la patogenicidad; el propio autor lo advierte de forma explicita.
- El modelo esta ajustado unicamente sobre CDS de arroz, por lo que su comportamiento fuera de ese dominio (otras especies, regiones no codificantes) es incierto y no esta documentado.
- La correccion numerica no garantiza generaciones libres de repeticiones ni biologicamente funcionales, segun la propia model card.
- Requiere `trust_remote_code=True` y ejecucion de codigo remoto del repositorio, lo que implica un riesgo de seguridad que debe evaluarse antes de usarlo en produccion.
- Depende del stack Mamba/Triton de Nemotron-H; el fallback en PyTorch puro puede ser mas lento y no se han publicado metricas de latencia.
- No se documentan sesgos, pero al ser un modelo de secuencias biologicas, cualquier uso predictivo sobre poblaciones o fenotipos carece de validacion.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no esta validado para aplicaciones clinicas ni de diagnostico.
- El numero de descargas (144) y la ausencia de likes sugieren una adopcion muy limitada y poca validacion externa.
- El modelo base es una "preview", lo que anade incertidumbre sobre la estabilidad de la familia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CladeTeam/CENO-rice-cds
- Repositorio de codigo y uso actual: https://github.com/CladeTeam/CENO
- Modelo base: https://huggingface.co/CladeTeam/CENO-base-1b-preview
- Ficha en free2aitools: https://free2aitools.com/model/cladeteam/ceno-rice-cds
