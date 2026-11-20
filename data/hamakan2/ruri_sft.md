# hamakan2/ruri_SFT

## Resumen

`hamakan2/ruri_SFT` es un adaptador LoRA publicado en Hugging Face por el usuario hamakan2, construido sobre el modelo base `cl-nagoya/ruri-v3-310m`. Se trata, por tanto, de un ajuste fino mediante PEFT (Parameter-Efficient Fine-Tuning) de un modelo de la familia Ruri v3, desarrollada por cl-nagoya, orientada originalmente a tareas de recuperación y representación de texto en japones. El repositorio contiene unicamente los pesos del adaptador en formato safetensors, no el modelo completo.

El modelo base ruri-v3-310m es un encoder de aproximadamente 310 millones de parametros derivado de la arquitectura ModernBERT, disenado para embeddings de frases y recuperacion de informacion en japones. El adaptador SFT (supervised fine-tuning) sugiere un ajuste supervisado sobre ese encoder, aunque la model card no documenta la tarea concreta, el dataset ni los hiperparametros empleados.

La relevancia de esta ficha es limitada: el repositorio registra cero descargas y cero likes en el momento de la consulta, la model card es una plantilla sin rellenar y no se aportan datos de entrenamiento, evaluacion ni licencia. Se documenta aqui lo que puede inferirse de los metadatos y del modelo base, marcando explicitamente como "no disponible" todo aquello que el autor no ha especificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre encoder transformer (base: cl-nagoya/ruri-v3-310m, familia ModernBERT) |
| Parametros totales | no disponible (el modelo base declara ~310M; el adaptador LoRA anade un numero no especificado de parametros entrenables) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el adaptador; el modelo base ruri-v3-310m soporta contextos largos segun su documentacion oficial (consultar ficha de cl-nagoya) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base y del runtime) |
| Idiomas soportados | no disponible en la model card; el modelo base esta orientado a japones |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA (Low-Rank Adaptation) gestionado con la libreria PEFT en su version 0.22.0, segun los metadatos del repositorio. La arquitectura subyacente corresponde al modelo base `cl-nagoya/ruri-v3-310m`, un encoder de la familia Ruri v3 de cl-nagoya, que emplea una arquitectura tipo ModernBERT con atencion eficiente y soporte de secuencias largas. El adaptador modifica un subconjunto de las capas del encoder mediante matrices de bajo rango, sin alterar los pesos originales del modelo base.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, el regimen de precision (fp16, bf16, fp32) ni si se aplicaron tecnicas de RLHF o DPO. La model card no documenta hiperparametros de LoRA (rango, alpha, dropout) ni la funcion de perdida. El sufijo "SFT" sugiere un ajuste supervisado clasico, pero no hay confirmacion en la documentacion.

## Capacidades

- Al ser un adaptador sobre un encoder de recuperacion, la capacidad esperada es la generacion de embeddings de texto para busqueda semantica y recuperacion de informacion, no la generacion de texto libre.
- El modelo base ruri-v3-310m esta especializado en japones; se desconoce si el adaptador amplia o restringe ese soporte linguistico.
- No hay evidencia de soporte de tool calling, function calling ni razonamiento multi-paso.
- No hay evidencia de capacidades multimodales (vision, audio) ni de modo "thinking".
- No se documentan capacidades especiales adicionales; cualquier uso distinto de la representacion de texto debe validarse empiricamente.

## Casos de uso

- Busqueda semantica en corpus japoneses: el adaptador puede integrarse sobre el encoder base para generar embeddings de documentos y consultas, siempre que se valide su calidad frente al modelo base sin ajustar.
- Reordenacion (reranking) de resultados: si el ajuste SFT se oriento a una tarea de similitud o clasificacion de pares, podria emplearse como segunda etapa en un pipeline de recuperacion, previa evaluacion.
- Clasificacion de texto por similitud: usar los embeddings para agrupar o etiquetar documentos en un dominio concreto, comparando el rendimiento con el del encoder original.
- Experimentacion academica con PEFT: el adaptador sirve como ejemplo reproducible de ajuste LoRA sobre un encoder japones de 310M, util para estudiar el impacto del fine-tuning en tareas de recuperacion.
- Prototipado de sistemas RAG en japones: combinado con el modelo base, puede probarse como componente de recuperacion en un pipeline RAG, midiendo recall y precision antes de adoptarlo en produccion.
- Evaluacion comparativa de adaptadores: dado que el repositorio no documenta resultados, un uso razonable es reproducir experimentos y comparar el adaptador con el modelo base y con otros adaptadores publicos sobre el mismo benchmark.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en si ocupa un espacio minimo (el repositorio declara 0.0 GB, lo que sugiere un peso muy reducido); el coste real de inferencia lo determina el modelo base de ~310M de parametros.
- VRAM estimada para el modelo base en fp16: en torno a 0,6-0,8 GB solo para pesos, mas memoria para activaciones y batch; en fp32, aproximadamente 1,2-1,3 GB.
- Cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, asi como en CPU para inferencia por lotes pequenos.
- GPUs de datacenter (A100, H100) no son necesarias para este tamano, salvo para entrenamiento o evaluacion a gran escala.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con `transformers` + `peft` sobre el modelo base; tambien puede exportarse a otros runtimes, pero no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este artefacto concreto.
- Latencia y throughput: no disponibles; dependen del hardware, del tamano de lote y de la longitud de secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hamakan2/ruri_SFT | Adaptador sobre ~310M | no disponible | no disponible | Hugging Face, 0 descargas | Adaptador LoRA sin documentacion |
| cl-nagoya/ruri-v3-310m | ~310M | segun ficha oficial del modelo base | segun ficha oficial | Hugging Face | Modelo base de recuperacion en japones |
| cl-nagoya/ruri-v3-70m | ~70M | segun ficha oficial | segun ficha oficial | Hugging Face | Variante mas ligera de la misma familia |
| intfloat/multilingual-e5-small | ~118M | 512 tokens | MIT | Hugging Face | Alternativa multilingue de embeddings |

La comparativa se limita a datos publicos del modelo base y de alternativas conocidas; no se dispone de metricas del adaptador para comparar rendimiento de forma rigurosa.

## Limitaciones y advertencias

- La model card es una plantilla sin rellenar: no hay informacion sobre sesgos, datos de entrenamiento ni evaluacion.
- Riesgo de alucinacion no aplica directamente a un encoder de embeddings, pero si a cualquier uso generativo que se haga del modelo base.
- No se especifica la licencia, lo que impide confirmar si el uso comercial esta permitido; es imprescindible contactar con el autor o consultar la licencia del modelo base antes de usarlo en produccion.
- El repositorio registra cero descargas y cero likes, sin senales de validacion por parte de la comunidad.
- No se documenta el idioma de entrenamiento del adaptador; el modelo base esta orientado a japones y su rendimiento en castellano es incierto.
- Al ser un adaptador LoRA, requiere cargar el modelo base `cl-nagoya/ruri-v3-310m`, cuyas condiciones de uso y limitaciones se heredan.
- No hay garantias de calidad ni de reproducibilidad de los resultados; cualquier adopcion debe ir precedida de una evaluacion propia sobre el dominio objetivo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/hamakan2/ruri_SFT
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-310m
- Libreria PEFT: https://github.com/huggingface/peft
- Referencia citada en los tags (paper de impacto ambiental, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
