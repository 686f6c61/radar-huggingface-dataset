# nikitastheo/v6-mixed-25k-lower-ewc0.1-ell-ell-sequential

## Resumen

El modelo `nikitastheo/v6-mixed-25k-lower-ewc0.1-ell-ell-sequential` es un modelo de lenguaje causal (decoder-only) de 104.716.800 parametros, publicado por el usuario nikitastheo en HuggingFace bajo la libreria `transformers`. Por su nomenclatura y por los datos de la model card, se trata de un artefacto de investigacion orientado al estudio de aprendizaje continuo (continual learning) sobre corpus de bajos recursos: el sufijo `ewc0.1` apunta al uso de Elastic Weight Consolidation con un coeficiente de 0,1, `sequential` sugiere un regimen de entrenamiento secuencial por tareas o idiomas, y `ell-lower` remite al codigo ISO 639-2 del griego en texto en minusculas.

El modelo parte de una configuracion denominada `gpt_base_config.json` y fue entrenado con `train_clm.py`, un script de entrenamiento causal-LM basado en Hugging Face Accelerate y no en la clase `Trainer`. Se entrenaron 17.430 pasos con un batch total de 32 secuencias, learning rate de 1e-4, scheduler lineal y 1.743 pasos de warmup (el 10 % del total). La model card menciona un `language switch epoch: 10`, lo que indica un cambio de idioma o de fase de datos en la decima epoca, coherente con un curriculum o con un experimento de aprendizaje secuencial.

La relevancia del modelo es fundamentalmente metodologica: se enmarca en la linea de trabajo tipo BabyLM, donde se estudia que arquitecturas y regimenes de entrenamiento permiten aprender lenguaje con presupuestos de datos reducidos. No obstante, conviene advertir que el repositorio no incluye licencia, idiomas declarados ni resultados de evaluacion, y que acumula cero descargas y cero "likes" en el momento de la consulta, por lo que debe considerarse un experimento sin validacion externa publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM) tipo GPT, definida en `configurations/gpt_base_config.json` |
| Parametros totales | 104.716.800 (aproximadamente 104,7 M), con embeddings atados |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio (no se publican pesos GGUF ni versiones cuantizadas); al estar en safetensors admite conversion externa a int8/int4 |
| Idiomas soportados | no declarado por el autor; el tokenizer asociado (`nikitastheo/babylm-25k-ell-lower-tokenizer`) apunta a griego en minusculas |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`) |
| Vocabulario del tokenizer | 25.000 entradas (segun el nombre del tokenizer asociado) |
| Tamano del repositorio | 15,9 GB (muy superior a los aproximadamente 0,42 GB que ocuparian los pesos en fp32, lo que sugiere la inclusion de checkpoints intermedios, estados del optimizador o artefactos de entrenamiento) |
| Fecha de creacion | 7 de octubre de 2026 |
| Ultima actualizacion | 7 de octubre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only con atencion completa, sin indicios de mecanismos alternativos (SSM, atencion lineal, MoE o hibridos) en la informacion disponible. El fichero de configuracion referenciado, `configurations/gpt_base_config.json`, corresponde a una configuracion "base" de la familia GPT; el recuento exacto de parametros (104.716.800) es coherente con un modelo de 12 capas, 768 de dimension oculta, 12 cabezas de atencion y un vocabulario de 25.000 tokens con embeddings atados, aunque esta correspondencia es una inferencia a partir del numero de parametros y no un dato confirmado en la model card, por lo que debe tratarse con cautela.

El entrenamiento se realizo con `train_clm.py`, un script propio basado en Hugging Face Accelerate que evita la clase `Trainer`. Los hiperparametros documentados son: 17.430 pasos maximos, learning rate de 0,0001, scheduler lineal, 1.743 pasos de warmup, batch de 32 por dispositivo y sin acumulacion de gradientes (batch total de 32). No se especifica el numero total de tokens procesados ni la composicion del dataset; el volumen efectivo depende de la longitud de contexto, que no se declara. La nomenclatura del modelo (`mixed`, `ewc0.1`, `sequential`, `language switch epoch: 10`) sugiere un entrenamiento por fases sobre una mezcla de datos (`mixed`), con regularizacion mediante Elastic Weight Consolidation de coeficiente 0,1 para mitigar el olvido catastrofico, y un cambio de idioma o de subcorpus en la decima epoca. Ninguno de estos extremos esta desarrollado en la model card, por lo que se trata de hipotesis basadas en el identificador del repositorio.

## Capacidades

- Generacion de texto causal: es la unica tarea declarada (`pipeline: text-generation`, etiquetas `causal-lm` y `text-generation`).
- Modelado de lenguaje y calculo de perplejidad: utilizable como base para experimentos de evaluacion tipo BabyLM (por ejemplo, tareas BLiMP o puntuaciones de perplejidad sobre corpus griegos), siempre que se valide con el tokenizer correcto.
- Generacion en griego en minusculas: el tokenizer `babylm-25k-ell-lower-tokenizer` esta especializado en texto griego normalizado en minusculas, por lo que la generacion fuera de ese dominio sera deficiente.
- Tool calling / function calling: no disponible; no hay plantilla de chat, tokens especiales ni documentacion al respecto.
- Soporte de agentes y razonamiento multi-paso: no disponible; un modelo de 104,7 M de parametros no esta orientado a este tipo de tareas.
- Capacidades multilingues: no declaradas; la evidencia indirecta apunta a un unico idioma (griego).
- Capacidades especiales (modo "thinking", vision, audio): ninguna documentada.
- Compatibilidad de despliegue: las etiquetas `text-generation-inference` y `endpoints_compatible` indican que el repositorio esta preparado para TGI y para HuggingFace Inference Endpoints.

## Casos de uso

- Investigacion en aprendizaje continuo: el modelo es un punto de partida directo para reproducir experimentos de Elastic Weight Consolidation (coeficiente 0,1) y comparar la tasa de olvido catastrofico frente a variantes sin regularizacion o con otros valores de lambda.
- Experimentos tipo BabyLM con presupuesto de datos reducido: sirve como baseline de 104,7 M de parametros para estudiar que regimenes de entrenamiento rinden mejor cuando el corpus es limitado.
- Investigacion sobre tokenizers de bajos recursos: al estar vinculado a un tokenizer propio de 25.000 entradas para griego en minusculas, permite analizar el impacto del vocabulario y de la normalizacion en el rendimiento del modelo.
- Generacion de texto griego experimental: puede emplearse para producir candidatos de texto sintetico en griego normalizado en minusculas, siempre con supervision humana y filtrado posterior, dado el riesgo de salida incoherente.
- Despliegue en hardware muy limitado: con aproximadamente 105 M de parametros, es viable ejecutarlo en CPU o en GPU de gama baja para demostraciones, prototipos docentes o entornos sin acelerador dedicado.
- Docencia y formacion: resulta adecuado como ejemplo reproducible de pipeline completo de entrenamiento causal-LM con Accelerate, tokenizer propio y regularizacion por pesos, sin requerir infraestructura de gran escala.
- Ablaciones de hiperparametros: la configuracion documentada (lr 1e-4, scheduler lineal, warmup del 10 %, batch de 32) permite replicar y modificar condiciones de forma controlada en estudios comparativos.
- Base para ajuste fino posterior: al ser un modelo pequeno, admite fine-tuning en una unica GPU consumer para tareas concretas de clasificacion o generacion en griego, siempre que se resuelva previamente la ambiguedad de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,42 GB en fp32, 0,21 GB en fp16/bf16, 0,10 GB en int8 y 0,05 GB en int4 (calculado a partir de los 104,7 M de parametros, sin contar el KV cache ni el overhead del runtime).
- Cabe en cualquier GPU consumer: desde una GTX 1050 Ti de 4 GB hasta una RTX 4090, y tambien en iGPU con memoria compartida suficiente. Es ejecutable en CPU con memoria RAM muy reducida.
- GPU recomendadas: no requiere GPU dedicada. Para lotes grandes o entrenamiento, una RTX 3090/4090 o una A100 resultan sobredimensionadas; una RTX 3060 de 12 GB permite incluso reentrenar el modelo con el batch documentado si el contexto es moderado.
- Opciones de despliegue: `transformers` (nativo, formato safetensors), Text Generation Inference (etiqueta `text-generation-inference`) y HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`). vLLM es compatible con la arquitectura GPT, aunque no hay configuracion publicada. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion que el repositorio no incluye.
- Latencia y throughput: no disponibles. No se han publicado mediciones, y la longitud de contexto y el hardware de referencia no estan documentados.
- Nota sobre el repositorio: sus 15,9 GB frente a los aproximadamente 0,42 GB de pesos en fp32 indican que puede contener checkpoints intermedios o estados del optimizador; conviene revisar el contenido antes de descargarlo completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nikitastheo/v6-mixed-25k-lower-ewc0.1-ell-ell-sequential | 104,7 M | no disponible | griego (no confirmado) | no disponible | HuggingFace, safetensors |
| GPT-2 (124M) | 124 M | 1.024 tokens | ingles principalmente | MIT | Ampliamente replicado; pesos en safetensors y GGUF |
| Pythia-160M | 160 M | 2.048 tokens | ingles | Apache 2.0 | EleutherAI; safetensors y multiples checkpoints |
| SmolLM2-135M | 135 M | 8.192 tokens | ingles | Apache 2.0 | HuggingFace; safetensors y GGUF |

La comparacion debe interpretarse con cautela: los tres modelos de referencia cuentan con licencia explicita, contexto documentado y evaluaciones publicas, mientras que el modelo analizado carece de esos tres elementos. Su unico diferencial verificable es la especializacion en griego en minusculas y el regimen de entrenamiento con EWC, orientado a investigacion mas que a produccion.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial esta permitido. En ausencia de licencia explicita, debe asumirse que no hay autorizacion clara y contactar con el autor antes de cualquier uso en produccion.
- Ausencia total de evaluacion: no hay benchmarks, ni resultados de perplejidad, ni comparaciones publicadas, por lo que el rendimiento real es desconocido.
- Riesgo de alucinacion elevado: con 104,7 M de parametros y un presupuesto de datos presumiblemente reducido (regimen tipo BabyLM), la generacion puede ser incoherente, repetitiva o factualmente incorrecta.
- Sesgos: al no documentarse la composicion del dataset, se desconocen los sesgos de genero, origen o ideologia presentes en los datos. Cualquier sesgo del corpus griego empleado se trasladara al modelo.
- Limitaciones idiomaticas: la evidencia apunta a un unico idioma (griego) y a texto normalizado en minusculas. El rendimiento fuera de ese dominio, o con mayusculas y signos diacriticos griegos, sera previsiblemente bajo.
- Limitaciones de contexto: la longitud de contexto no esta declarada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Longitud de generacion: no se documenta un token de fin de secuencia especifico ni una plantilla de prompt, lo que complica el control de la salida.
- Idoneidad para produccion: descargas y likes nulos, sin versionado semantico ni commits de mantenimiento visibles; es un artefacto experimental, no un modelo soportado.
- Tamano del repositorio: los 15,9 GB pueden incluir checkpoints u optimizador, lo que incrementa innecesariamente el coste de descarga y almacenamiento.
- Reproducibilidad parcial: los hiperparametros estan documentados, pero no se especifican el dataset, la semilla, la longitud de contexto ni el numero de tokens totales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-ewc0.1-ell-ell-sequential
- Tokenizer asociado: https://huggingface.co/nikitastheo/babylm-25k-ell-lower-tokenizer
- Perfil del autor: https://huggingface.co/nikitastheo
- Script de entrenamiento `train_clm.py`: no disponible como enlace publico
- Fichero de configuracion `configurations/gpt_base_config.json`: no disponible como enlace publico
- Paper, blog o demo asociados: no disponibles
