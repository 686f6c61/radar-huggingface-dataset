# abdallahsalah0/qwen25-1.5b-arafinnews-lora

## Resumen

qwen25-1.5b-arafinnews-lora es un adaptador LoRA entrenado por el usuario abdallahsalah0 sobre el modelo instructivo Qwen/Qwen2.5-1.5B-Instruct. El adaptador se publica en formato PEFT (safetensors) y esta pensado para ajustar el modelo base a un corpus de noticias denominado news_finetune_train, del que no se ofrece informacion adicional sobre composicion, idioma o procedencia. El entrenamiento se realizo con LLaMA-Factory y se completo en una sola epoca (300 pasos), con un loss de validacion final de 0,3690.

Se trata, por tanto, de un artefacto de ajuste fino de proposito especifico y no de un modelo independiente: no incluye pesos completos y requiere descargar aparte el modelo base Qwen2.5-1.5B-Instruct para poder ejecutarse. Su tamano de repositorio es de 0,9 GB, coherente con un adaptador de rango bajo sobre un modelo de aproximadamente 1,5 mil millones de parametros.

Su relevancia es limitada y acotada: resulta util como ejemplo reproducible de un pipeline de fine-tuning con LLaMA-Factory sobre Qwen2.5, y como adaptador de bajo coste para dominios de noticias, pero no se han publicado evaluaciones de calidad, benchmarks, ni documentacion sobre los datos de entrenamiento. Cualquier uso en produccion deberia ir precedido de una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5) con adaptador LoRA sobre pesos congelados |
| Parametros totales | Aproximadamente 1,5 B en el modelo base (denominacion oficial Qwen2.5-1.5B); numero exacto de parametros del adaptador: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada para el adaptador. El modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens segun su documentacion oficial; el adaptador LoRA no modifica esta ventana |
| Tipos de cuantizacion | No disponible para el adaptador (se distribuye en precision completa del adaptador, safetensors). La cuantizacion aplicaria al modelo base combinado |
| Idiomas soportados | No disponible (el campo de idiomas del repositorio esta vacio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, formato de adaptador PEFT/LoRA (no contiene pesos completos) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de la familia Qwen2.5 con atencion causal. Al ser un ajuste mediante LoRA, solo se entrenan matrices de bajo rango insertadas en las capas del modelo base, cuyos pesos permanecen congelados; en inferencia, el adaptador debe combinarse con el modelo base (carga directa via PEFT o fusion de pesos). El repositorio ocupa 0,9 GB, lo que corresponde al adaptador mas los ficheros asociados.

El entrenamiento se ejecuto con LLaMA-Factory en configuracion multi-GPU (2 dispositivos) durante 1,0 epocas y 300 pasos. Hiperparametros declarados: learning rate 1e-4, scheduler coseno con warmup del 10 %, optimizador AdamW (variante torch fused, betas 0,9/0,999, epsilon 1e-8), batch size por dispositivo 1, acumulacion de gradientes 4, batch total efectivo 8, seed 42. La perdida de validacion descendio de forma monotona desde 0,5640 (paso 20) hasta 0,3691 (paso 300), con un loss de entrenamiento final de 0,3798. No se documenta si hubo etapas de RLHF, DPO u otro alineamiento posterior, ni el numero de tokens de entrenamiento, la composicion del dataset news_finetune_train o su procedencia.

Versiones de framework declaradas: PEFT 0.18.1, Transformers 5.0.0, PyTorch 2.10.0+cu128, Datasets 4.0.0, Tokenizers 0.22.2.

## Capacidades

- Generacion de texto y respuesta conversacional, heredadas del modelo base Qwen2.5-1.5B-Instruct.
- Ajuste orientado a contenido de noticias (dominio news_finetune_train), sin que se detalle el comportamiento resultante ni se aporten ejemplos de salida.
- Capacidades potenciales heredadas del modelo base (razonamiento basico, generacion de codigo, matematicas elementales, tool calling y soporte multilingue): no verificadas en este adaptador, ya que no se han publicado evaluaciones.
- Capacidad multilingue: no disponible en la informacion del repositorio.
- Modo thinking, vision o audio: no disponible; el modelo base es exclusivamente de texto.
- No se declara soporte explicito de agentes, multi-step reasoning ni function calling especifico para este adaptador.

## Casos de uso

- Clasificacion y etiquetado de noticias: el adaptador puede emplearse para categorizar titulares y cuerpos de texto periodistico por tematica, siempre que se valide antes su comportamiento sobre el dataset concreto, dado que no hay evaluaciones publicadas.
- Resumen de articulos periodisticos: generar resumenes de piezas informativas con el modelo combinado, aprovechando el ajuste sobre corpus de noticias y un contexto base de 32.768 tokens.
- Extraccion de entidades y datos estructurados: identificar personas, organizaciones, lugares y fechas en textos de prensa para alimentar bases de datos o indices de busqueda.
- Generacion de titulares y entradillas: producir variantes de titular a partir de un cuerpo de noticia, con supervision editorial humana previa a publicacion.
- Prototipado de asistentes conversacionales de actualidad: construir un bot de preguntas y respuestas sobre noticias en un entorno de bajo coste, usando el modelo fusionado en una unica GPU de gama media.
- Base para investigacion en fine-tuning eficiente: servir como referencia reproducible del flujo LLaMA-Factory mas PEFT sobre Qwen2.5, util para comparar hiperparametros y estrategias de LoRA.
- Filtrado y moderacion de contenido editorial: puntuar o clasificar textos entrantes en un CMS, con revision humana obligatoria por el riesgo de alucinacion.
- Analisis de sentimiento en prensa economica: procesar lotes de noticias para estimar tono y polaridad como senal auxiliar, nunca como decision automatica.

## Benchmarks y rendimiento

El model-index del repositorio no contiene resultados de benchmarks: la lista de resultados esta vacia. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar en la informacion disponible. El unico dato de rendimiento aportado es la curva de perdida del entrenamiento:

| Loss de entrenamiento | Epoca | Paso | Loss de validacion |
|:---:|:---:|:---:|:---:|
| 0,5741 | 0,064 | 20 | 0,5640 |
| 0,4806 | 0,128 | 40 | 0,5053 |
| 0,4420 | 0,192 | 60 | 0,4764 |
| 0,4583 | 0,256 | 80 | 0,4523 |
| 0,4155 | 0,320 | 100 | 0,4363 |
| 0,4347 | 0,384 | 120 | 0,4234 |
| 0,4245 | 0,448 | 140 | 0,4116 |
| 0,3894 | 0,512 | 160 | 0,4012 |
| 0,4519 | 0,576 | 180 | 0,3923 |
| 0,3419 | 0,640 | 200 | 0,3864 |
| 0,3823 | 0,704 | 220 | 0,3800 |
| 0,3744 | 0,768 | 240 | 0,3755 |
| 0,3825 | 0,832 | 260 | 0,3720 |
| 0,3745 | 0,896 | 280 | 0,3701 |
| 0,3798 | 0,960 | 300 | 0,3691 |

El loss final declarado en la model card es 0,3690. Este valor solo es interpretable respecto al dataset de evaluacion del propio autor, no es comparable con metricas de benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para el modelo combinado (base + adaptador fusionado): aproximadamente 3,1 GB en FP16/BF16, unos 1,6 GB en cuantizacion de 8 bits y alrededor de 1 GB en cuantizacion de 4 bits, sin contar la cache KV, que crece con la longitud de contexto.
- El adaptador por si solo ocupa 0,9 GB en disco (tamano total del repositorio).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM puede ejecutar el modelo en FP16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 lo ejecutan con holgura. Cabe en GPU de consumo de gama media y baja.
- Despliegue: carga del adaptador con la libreria PEFT sobre Transformers; llama.cpp y Ollama requieren fusionar previamente el adaptador con el modelo base y exportar a GGUF. vLLM y TGI admiten en general modelos con adaptadores LoRA, aunque no se documenta compatibilidad verificada con este adaptador concreto.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia para este modelo.

## Comparativa con modelos similares

No hay resultados de benchmarks publicados que permitan comparar el rendimiento de este adaptador con alternativas. La tabla siguiente contrasta caracteristicas estructurales basicas; los datos de los modelos alternativos proceden de su documentacion publica y no de una evaluacion conjunta.

| Modelo | Parametros | Contexto | Licencia | Tipo de artefacto |
|---|---|---|---|---|
| qwen25-1.5b-arafinnews-lora | Adaptador sobre base de aproximadamente 1,5 B | Heredado del base: 32.768 tokens | apache-2.0 | Adaptador LoRA (PEFT) |
| Qwen2.5-1.5B-Instruct | Aproximadamente 1,5 B | 32.768 tokens | apache-2.0 | Pesos completos |
| Qwen2.5-3B-Instruct | Aproximadamente 3 B | 32.768 tokens | qwen-research (uso condicionado) | Pesos completos |
| Llama 3.2 1B Instruct | Aproximadamente 1,2 B | 128.000 tokens | Llama 3.2 Community License | Pesos completos |

No disponible: comparacion de calidad, benchmarks, throughput o latencia frente a estos modelos.

## Limitaciones y advertencias

- No contiene pesos completos: es imprescindible descargar Qwen/Qwen2.5-1.5B-Instruct y cargar el adaptador mediante PEFT o fusionarlo antes de usarlo.
- La model card es la plantilla autogenerada por el entrenador y deja sin rellenar las secciones de descripcion, usos previstos, limitaciones y datos de entrenamiento. No hay informacion sobre el origen, idioma, tamano ni licencia del dataset news_finetune_train.
- No se han publicado benchmarks ni evaluaciones de calidad; el unico dato objetivo es el loss de validacion sobre un conjunto no descrito.
- Riesgo de alucinacion: inherente a un modelo de 1,5 B de parametros, previsiblemente mayor en tareas de conocimiento factual y en contextos largos.
- Sesgos: no documentados. Al ser un ajuste sobre un corpus de noticias sin descripcion, puede heredar y amplificar sesgos editoriales, politicos o geograficos del mismo.
- Cobertura idiomatica desconocida: no se declara que idiomas soporta el ajuste ni si el corpus era multilingue o de un unico idioma.
- Entrenamiento muy corto (una epoca, 300 pasos) y con batch efectivo de 8: riesgo de sobreajuste al estilo y vocabulario del corpus, con degradacion de capacidades generales del modelo base.
- Licencia apache-2.0 en el adaptador, pero conviene verificar las condiciones de la licencia del modelo base para el uso previsto; el modelo base Qwen2.5-1.5B-Instruct se publica bajo apache-2.0, mientras que otras variantes de la familia usan licencias distintas.
- Sin garantias de soporte, mantenimiento ni actualizaciones: el repositorio no registra descargas ni interacciones.
- Uso en produccion no recomendado sin una evaluacion propia previa sobre el dominio objetivo y sin supervision humana en tareas sensibles (informacion, moderacion, decisiones editoriales).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abdallahsalah0/qwen25-1.5b-arafinnews-lora
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
- LLaMA-Factory (framework de entrenamiento declarado): https://github.com/hiyouga/LLaMA-Factory
- Paper, blog o demo especificos de este adaptador: no disponible
- Dataset news_finetune_train: no disponible
- Nota sobre la busqueda web: los resultados obtenidos (paginas de inicio de sesion de GitHub, Reddit, Zhihu, un repositorio de prompts DAN y la pagina de descarga de GitHub Desktop) no guardan relacion con este modelo y no aportan informacion adicional.
