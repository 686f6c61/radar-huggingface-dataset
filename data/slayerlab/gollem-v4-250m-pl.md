# SlayerLab/gollem-v4-250m-pl

## Resumen

GoLLeM v4 250M (polski) es un modelo de lenguaje tipo decoder, de 250 millones de parametros, entrenado desde cero sobre un corpus integramente polaco por el Laboratorio Slayer (autor: Arkadiusz Słota). El repositorio publicado en HuggingFace no contiene un modelo terminado, sino una serie de instantaneas intermedias de entrenamiento («checkpoints») que cubren aproximadamente del 4 % al 61 % del presupuesto de computo planificado. Su proposito declarado es exclusivamente de investigacion: estudiar la dinamica de aprendizaje, la evolucion de la perdida y la tokenizacion de un modelo monolingue en polaco.

Tecnicamente es un transformer decoder-only de 17 capas, dimension 1024, 16 cabezas de atencion (dimension de cabeza 64) y vocabulario de 32.000 tokens con tokenizer BPE polaco (V32k). Usa normalizacion pre-LayerNorm, atencion causal con SDPA, MLP con GELU de expansion 4x y embeddings posicionales aprendidos (no RoPE), con pesos compartidos entre el embedding de entrada y la cabeza de salida al estilo GPT-2. La longitud de contexto es de 1024 tokens.

Es relevante ahora porque documenta de forma inusualmente transparente la trayectoria completa de un entrenamiento de 24.000 millones de tokens (objetivo) ejecutado en una unica GPU de consumo (RTX 5090), con 14 instantaneas publicadas y metricas de perdida de validacion y BPB por etapa. Se trata de un modelo base, no ajustado a instrucciones, que solo entiende polaco y que el propio autor desaconseja explicitamente para uso en produccion o para evaluar la calidad final del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT: pre-LayerNorm, atencion causal SDPA, MLP con GELU 4x, embeddings posicionales aprendidos (nn.Embedding, no RoPE) y weight tying entre embedding y cabeza de salida |
| Parametros totales | 247.954.432 (~250 M, con embeddings compartidos) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors; no se documentan versiones cuantizadas ni ficheros GGUF |
| Idiomas soportados | Polaco (pl) |
| Licencia | other (licencia no concretada; el autor declara uso exclusivamente de investigacion) |
| Formato de pesos | safetensors (sin pickle), un fichero ckpt_*.safetensors por instantanea; incluye config.json y modeling_gollem.py |
| Capas (n_layer) | 17 |
| Dimension del modelo (d_model) | 1024 |
| Cabezas de atencion | 16 (dimension de cabeza 64) |
| Vocabulario | 32.000 tokens (tokenizer V32k, BPE polaco) |
| Estado | Work in progress; instantaneas hasta ckpt_30000 (~61 % del presupuesto) |
| Tamano del repositorio | 13,9 GB |
| Descargas / likes | 1.059 descargas / 1 like |
| Fecha de creacion / actualizacion | 14 de septiembre de 2026 / 15 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only no estandar respecto a la implementacion de referencia de HuggingFace: no se carga mediante `transformers` ni `AutoModel`, y requiere el cargador propio `modeling_gollem.py` incluido en el repositorio, que solo depende de `torch`, `tokenizers` y `safetensors`. Emplea pre-LayerNorm, atencion causal con SDPA, un MLP con activacion GELU de factor 4, embeddings posicionales aprendidos en lugar de RoPE y comparticion de pesos entre el embedding de entrada y la proyeccion de salida (weight tying), siguiendo el patron de GPT-2. El recuento exacto de parametros es 247.954.432, con vocabulario de 32.000 tokens y contexto de 1024 posiciones.

El entrenamiento usa el corpus `SlayerLab/gollem-corpus-16b-pl`, de 16,58 mil millones de tokens y 100 % en polaco, limpiado mediante deduplicacion, filtrado de datos personales y dekontaminacion. La composicion es: web (HPLT v3 PL) 14,62 mil millones de tokens (88,2 %), enciclopedico (Wikipedia PL) 984 millones (5,9 %), ciencia 522 millones (3,1 %), noticias 211 millones (1,3 %), juridico 176 millones (1,1 %), literario 60 millones (0,4 %) y mixto 1,6 millones (0,01 %). El objetivo declarado es entrenar sobre 24.000 millones de tokens (aproximadamente 1,45 epocas), un regimen de sobrentrenamiento deliberado de unas 5 veces respecto a la receta de Chinchilla, justificado por el coste de inferencia y no por el de entrenamiento. Todo el entrenamiento se ejecuta en una sola RTX 5090.

No se documenta ninguna fase de RLHF, DPO ni ajuste por instrucciones: es un modelo puramente preentrenado. La innovacion destacable del repositorio no es arquitectonica sino metodologica: la publicacion de la trayectoria de entrenamiento con 14 instantaneas y la verificacion de la extrapolacion de las curvas de perdida y BPB, incluyendo comprobaciones fuera del intervalo de ajuste.

## Capacidades

- Generacion de texto en polaco: el modelo es un modelo base que continua el texto proporcionado, sin seguir instrucciones.
- Analisis de dinamica de entrenamiento: cada instantanea representa un punto distinto de la curva de aprendizaje, lo que permite comparar estados intermedios del mismo modelo.
- Modelado de lenguaje y medicion de perplejidad: publica perdida de validacion y BPB para cada checkpoint.
- Capacidades multilingues: no disponibles; el modelo entiende unicamente polaco y, segun el autor, rinde mal en ingles y en respuestas a preguntas sin contexto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision, audio u otras modalidades: no disponible.
- Finalizacion fiable de secuencias: no disponible en esta fase; el modelo no inserta de forma estable el token `<|endoftext|>` y genera hasta alcanzar el limite de longitud fijado.

## Casos de uso

- Investigacion sobre dinamica de aprendizaje y leyes de escala: las 14 instantaneas (de ckpt_2000 a ckpt_30000) permiten reconstruir la curva de perdida de validacion y BPB y compararla con extrapolaciones power-law, algo poco habitual en modelos publicados.
- Validacion de recetas de sobrentrenamiento: con un objetivo de 24.000 millones de tokens sobre un corpus de 16,58 mil millones (unas 1,45 epocas y ~5x respecto a Chinchilla), sirve para estudiar el efecto del sobrentrenamiento en la perdida final de un modelo de 250 M.
- Analisis de tokenizacion y vocabulario: el tokenizer V32k de BPE polaco puede estudiarse de forma aislada para medir eficiencia de compresion y cobertura morfologica del polaco.
- Pruebas de fluidez y continuacion de texto en polaco: util para comparar la coherencia local entre checkpoints tempranos y tardios con prompts en polaco, fijando temperatura y top-k.
- Experimentos controlados de aumentacion de datos: generar continuaciones en polaco sobre dominios concretos (juridico, cientifico, noticias) para estudiar sesgos de dominio, siempre con revision manual y sin uso en produccion.
- Docencia y reproducibilidad de bajo coste: al caber en una GPU de consumo e incluso en CPU, permite reproducir experimentos de inferencia y decodificacion sin infraestructura especializada.
- Estudio del comportamiento de modelos base en fase temprana: sirve para analizar por que un modelo preentrenado no respeta instrucciones ni cierra secuencias, con evidencia empirica de cada etapa.
- Analisis de sesgos del corpus web polaco: al proceder el 88,2 % de los tokens de HPLT v3 PL, permite estudiar la huella del sesgo de datos web en las generaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y los resultados de la busqueda web no aportan metricas del modelo.

La unica informacion de rendimiento disponible es la trayectoria de entrenamiento publicada por el autor, con perdida de validacion y BPB por instantanea:

| Instantanea | Paso | % de entrenamiento | Perdida de validacion | BPB |
|---|---|---|---|---|
| ckpt_2000 | 2000 | ~4 % | 3,416 | 1,135 |
| ckpt_6000 | 6000 | ~12 % | 2,966 | 1,001 |
| ckpt_8000 | 8000 | ~16 % | 2,937 | 0,978 |
| ckpt_10000 | 10000 | ~20 % | 2,878 | 0,961 |
| ckpt_12000 | 12000 | ~25 % | 2,846 | 0,947 |
| ckpt_14000 | 14000 | ~29 % | 2,849 | 0,938 |
| ckpt_16000 | 16000 | ~33 % | 2,789 | 0,932 |
| ckpt_18000 | 18000 | ~37 % | 2,799 | 0,924 |
| ckpt_20000 | 20000 | ~41 % | 2,757 | 0,915 |
| ckpt_22000 | 22000 | ~45 % | 2,756 | 0,910 |
| ckpt_24000 | 24000 | ~49 % | 2,689 | 0,903 |
| ckpt_26000 | 26000 | ~53 % | 2,670 | 0,901 |
| ckpt_28000 | 28000 | ~57 % | 2,652 | 0,897 |
| ckpt_30000 | 30000 | ~61 % | 2,672 | 0,891 |

El autor indica que la perdida de validacion se mantiene en linea con la de entrenamiento (sin sobreajuste), que el BPB cae de forma monotona de 0,978 a 0,891 y que las fluctuaciones de la perdida son ruido de un unico batch. La previsible al final del entrenamiento (24.000 millones de tokens, ~48.828 pasos) es de un BPB en torno a 0,87-0,89 y una perdida de validacion de ~2,5-2,8, presentados como intervalo manual derivado de un ajuste power-law sobre 11 puntos (pasos 2000-22000), no como un intervalo de confianza formal. El autor senala que la cifra es movil y no esta validada, ya que todos los puntos son anteriores al annealing del learning rate y el suelo teorico del idioma se estima en ~0,83 de BPB.

## Requisitos de hardware

- VRAM estimada para los pesos: en fp32 unos 1 GB; en bf16/fp16 unos 0,5 GB; en int8 unos 0,25 GB teoricos. Son estimaciones derivadas del recuento de 247.954.432 parametros, no valores publicados por el autor.
- Memoria adicional de inferencia: la cache KV a 1024 tokens en fp16 ocupa aproximadamente 70 MB (17 capas x 16 cabezas x 64 dimensiones x 1024 posiciones x 2 tensores), por lo que el consumo total es muy bajo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; no se requiere A100, H100 ni hardware de centro de datos. El propio entrenamiento se realizo en una unica RTX 5090.
- Cabe en GPU de consumo: si, de forma holgada, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o equivalentes, y tambien en modo CPU.
- Opciones de despliegue: no se ha documentado soporte para vLLM, TGI, llama.cpp u Ollama. Debido a que la arquitectura no es compatible con `transformers`, el unico camino documentado es el cargador propio `modeling_gollem.py` junto con `generate.py`, con las dependencias `torch`, `tokenizers` y `safetensors`.
- Latencia y throughput estimados: no disponible. No se publican cifras de tokens por segundo ni de latencia.

## Comparativa con modelos similares

No disponible. La documentacion facilitada no incluye comparaciones con otros modelos y la busqueda web realizada no ha devuelto resultados relevantes sobre el modelo ni sobre alternativas de la misma categoria, por lo que no se dispone de datos verificables de parametros, contexto, rendimiento, licencia o disponibilidad de modelos comparables.

## Limitaciones y advertencias

- Estado de investigacion: es un modelo en entrenamiento. Las instantaneas cubren hasta el ~61 % del presupuesto y su calidad aumentara en fases posteriores; no debe usarse para juzgar la calidad final de GoLLeM.
- Uso en produccion desaconsejado: el autor prohibe explicitamente su uso en aplicaciones productivas.
- No es un modelo de instrucciones: es un modelo base, continua texto y no obedece ordenes ni responde preguntas sin contexto.
- Monolingue: solo polaco. El rendimiento en ingles y en tareas sin contexto es deficiente por diseno.
- Cierre de secuencia poco fiable: no inserta de forma estable `<|endoftext|>` y genera hasta el limite de longitud configurado.
- Contexto corto: 1024 tokens, insuficiente para tareas de contexto largo o conversaciones multi-turno extensas.
- Riesgo de alucinacion: inherente a un modelo base preentrenado sin ajuste por preferencias ni verificacion factual.
- Sesgos: el 88,2 % del corpus procede de datos web (HPLT v3 PL), por lo que es esperable heredar sesgos de esa fuente; no se documenta ninguna evaluacion de sesgo.
- Compatibilidad: no funciona con `transformers`/`AutoModel`, lo que complica su integracion en pipelines estandar y en frameworks de serving habituales.
- Licencia restrictiva en la practica: la licencia es «other» sin texto concreto; el autor limita el uso a investigacion, por lo que el uso comercial no esta autorizado de forma explicita.
- Sin benchmarks: no hay evaluaciones estandar publicadas que permitan situar el modelo frente a alternativas.
- Adopcion muy baja: 1.059 descargas y 1 like, sin validacion independiente conocida.
- Incertidumbre en las previsiones: el intervalo de BPB y perdida final es un ajuste manual no bancarizado y podria cambiar durante la fase de annealing del learning rate.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SlayerLab/gollem-v4-250m-pl
- Corpus de entrenamiento: https://huggingface.co/datasets/SlayerLab/gollem-corpus-16b-pl
- La busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo (los resultados obtenidos corresponden a foros en frances sin relacion con el proyecto), por lo que no se dispone de papers, blogs, repositorios ni demos adicionales que enlazar.
