# leomaurodesenv/electra-base-discriminator-trustairlab-jailbreak-augmented

## Resumen

El modelo `leomaurodesenv/electra-base-discriminator-trustairlab-jailbreak-augmented` es un clasificador de texto en inglés derivado de `google/electra-base-discriminator`, ajustado por el usuario leomaurodesenv para la deteccion de intentos de jailbreak o prompts maliciosos (la etiqueta "trustairlab-jailbreak" del nombre apunta al conjunto de datos TrustAIRLab, aunque la model card no lo confirma). Se trata de un encoder transformer de 109.483.778 parametros, sin capa generativa: su salida es una etiqueta de clasificacion, no texto.

El problema que resuelve es el filtrado de entradas hostiles en aplicaciones basadas en LLM: guardrails de entrada, moderacion de prompts y politicas de seguridad en pipelines de agentes. Frente a soluciones basadas en LLM, un encoder de 110 M de parametros ofrece una latencia muy baja y un coste de inferencia minimo, lo que lo hace apto como capa de pre-filtrado previa a un modelo mayor.

La relevancia actual del modelo es limitada y hay que ser honesto al respecto: el repositorio acumula 0 descargas y 0 "likes", la model card es la plantilla autogenerada por el `Trainer` de Hugging Face y no documenta ni el dataset, ni las etiquetas, ni los usos previstos. El unico dato de rendimiento declarado es una exactitud de 0,9388 y una perdida de 0,1905 sobre un conjunto de evaluacion no descrito. Debe tratarse, por tanto, como un artefacto experimental reproducible, no como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ELECTRA (discriminador), heredada de `google/electra-base-discriminator` |
| Parametros totales | 109.483.778 (dato real de los pesos safetensors) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 512 tokens (valor de `max_position_embeddings` del modelo base; la model card no lo especifica) |
| Tipos de cuantizacion | No disponible. Los pesos se distribuyen en safetensors (precision completa); no se publican variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible (campo de idiomas vacio en la model card). El tokenizador heredado del base es WordPiece en ingles sin distincion de mayusculas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |
| Pipeline | `text-classification` |
| Tarea / etiquetas | Clasificacion de texto binaria (presumiblemente jailbreak / no jailbreak; no confirmado) |
| Modelo base | `google/electra-base-discriminator` |
| Tamano del repositorio | 3,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 12 de septiembre de 2026 |
| Ultima actualizacion | 12 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la del discriminador ELECTRA-base: un transformer bidireccional con atencion completa, pensado para ser preentrenado con la tarea de deteccion de tokens sustituidos (replaced token detection) en lugar del enmascaramiento clasico. Sobre ese checkpoint se ha anadido una cabeza de clasificacion de secuencia. Al tratarse de un encoder, no dispone de decodificacion autoregresiva, decodificacion especulativa, atencion lineal ni ninguna innovacion de inferencia: es una pasada forward que devuelve logits por clase.

El ajuste fino se realizo con `Trainer` de Hugging Face sobre un dataset que la model card describe literalmente como "unknown dataset". Los hiperparametros documentados son: `learning_rate` 2e-05, `train_batch_size` 8, `eval_batch_size` 8, `gradient_accumulation_steps` 2 (batch total 16), optimizador `adamw_torch_fused` con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 50 pasos de calentamiento, semilla 42 y 10 epocas configuradas. No se documenta ningun proceso de RLHF, DPO ni ajuste por preferencias, algo esperable en un modelo discriminativo. Las versiones de framework declaradas son Transformers 5.2.0, PyTorch 2.10.0+cu128, Datasets 4.5.0 y Tokenizers 0.22.2.

Un detalle relevante para la reproducibilidad: aunque `num_epochs` es 10, la tabla de entrenamiento solo registra cinco epocas (hasta el paso 3025). La mejor exactitud de validacion de esa tabla es 0,9392 en la epoca 3 y 0,9388 en la epoca 5, mientras que el valor publicado como final en la cabecera es 0,9388. No se indica que se aplicara early stopping ni cual es el checkpoint efectivamente subido.

## Capacidades

- Clasificacion de texto: asigna una etiqueta a una secuencia de entrada, presumiblemente para distinguir prompts de jailbreak de prompts legitimos.
- Filtrado de entrada (input guardrail): puede usarse como primera barrera antes de enviar una peticion a un LLM generativo.
- Inferencia rapida en CPU: con 110 M de parametros y sin generacion autoregresiva, es viable ejecutarlo en CPU con latencias del orden de milisegundos por secuencia corta.
- Procesamiento por lotes: al ser un encoder, admite batching de cientos de secuencias cortas en una sola pasada.
- No soporta tool calling ni function calling: no es un modelo generativo ni produce texto estructurado.
- No soporta uso como agente ni razonamiento multi-paso: no hay bucle de razonamiento ni modo "thinking".
- No tiene vision, audio ni capacidades multimodales.
- Capacidades multilingues: no disponibles / no declaradas. El tokenizador heredado es de vocabulario ingles, por lo que el comportamiento fuera del ingles es una incognita.
- Capacidad especial: ninguna declarada mas alla de la clasificacion.

## Casos de uso

- Guardrail de entrada en un chatbot: cada mensaje del usuario se clasifica antes de llegar al LLM; si se marca como jailbreak, se corta la peticion o se redirige a una respuesta plantilla. Es adecuado por su coste marginal casi nulo frente al coste de una llamada a un modelo generativo.
- Moderacion de contenido generado por usuarios en foros o comentarios: clasificacion por lotes de grandes volumenes de texto en CPU, sin necesidad de GPU.
- Pre-filtrado en pipelines de agentes: en un sistema con multiples herramientas, un clasificador de 110 M puede descartar instrucciones hostiles antes de que el planificador las ejecute, reduciendo la superficie de ataque de prompt injection.
- Etiquetado y auditoria de datasets de seguridad: uso como anotador automatico de primer nivel sobre corpus historicos de prompts, seguido de revision humana de los casos dudosos.
- Red teaming y evaluacion de robustez: medir la tasa de evasion de un sistema frente a variantes de ataques conocidos, usando este clasificador como detector de referencia dentro del banco de pruebas.
- Enrutado de peticiones (routing): derivar a un modelo con politicas de seguridad mas estrictas solo aquellas peticiones marcadas como sospechosas, ahorrando coste en el resto.
- Filtrado en tiempo real en el borde (edge): al caber holgadamente en memoria y en CPU, puede desplegarse en un contenedor pequeno o en un dispositivo local para decidir si la peticion sale del perimetro.
- Investigacion academica sobre deteccion de jailbreak: sirve como linea base de encoder afinado frente a la que comparar tecnicas nuevas, dado que los hiperparametros de entrenamiento si estan documentados.

## Benchmarks y rendimiento

El campo `model-index` de la model card declara la entrada `electra-base-discriminator-trustairlab-jailbreak` con una lista de resultados vacia, por lo que no hay benchmarks estandar (MMLU, HumanEval, GSM8K u otros) publicados. Los unicos datos disponibles son las metricas de evaluacion y la traza de entrenamiento que el `Trainer` volco en la model card, sobre un conjunto de evaluacion no descrito y con una metrica de exactitud cuya clase positiva no se especifica:

| Metrica (conjunto de evaluacion no descrito) | Valor |
|---|---|
| Loss | 0,1905 |
| Accuracy | 0,9388 |

| Epoca | Paso | Training loss | Validation loss | Accuracy |
|---|---|---|---|---|
| 1.0 | 605 | 0,2734 | 0,2173 | 0,9359 |
| 2.0 | 1210 | 0,1792 | 0,1904 | 0,9384 |
| 3.0 | 1815 | 0,2315 | 0,2045 | 0,9392 |
| 4.0 | 2420 | 0,1664 | 0,1956 | 0,9379 |
| 5.0 | 3025 | 0,0775 | 0,2416 | 0,9388 |

Advertencia: al no publicarse la matriz de confusion, la precision, el recall ni el F1, una exactitud del 93,9 % es insuficiente para juzgar el modelo en una tarea de deteccion, donde el desequilibrio de clases suele ser fuerte. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): en torno a 450 MB de pesos mas activaciones y memoria del runtime; menos de 1 GB en total para lotes moderados.
- VRAM estimada en fp16/bf16: aproximadamente 220 MB de pesos; util si se convierte el checkpoint, ya que no se publican variantes de precision reducida.
- VRAM estimada con cuantizacion dinamica int8 de PyTorch: del orden de 110-150 MB.
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU y en CPU. No requiere A100 ni H100.
- El repositorio ocupa 3,1 GB, lo que sugiere que incluye estados del optimizador o checkpoints intermedios ademas de los pesos; la descarga puede reducirse major si solo se solicitan los safetensors del modelo final.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, exportacion a ONNX Runtime para inferencia en CPU, TorchServe o un endpoint de Inferentia. Es compatible con `endpoints_compatible`, por lo que puede servirse en Hugging Face Inference Endpoints. Para vLLM o TGI no esta claro que aporten ventaja al no ser un modelo generativo.
- Latencia y throughput: no disponibles. No se publican mediciones. Como referencia cualitativa, un encoder de 110 M con secuencias de 128-512 tokens es del orden de unos pocos milisegundos por lote en GPU moderna y de decenas de milisegundos por lote en CPU, pero estos valores no estan verificados en este modelo concreto.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparables de este modelo, por lo que la comparacion se limita a caracteristicas estructurales. Los datos de los modelos alternativos no se han verificado en la busqueda realizada y deben confirmarse en sus respectivas model cards.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `leomaurodesenv/electra-base-discriminator-trustairlab-jailbreak-augmented` | 109,5 M | 512 tokens (heredado del base) | Clasificacion de texto (jailbreak) | Apache 2.0 | Hugging Face, 0 descargas |
| `google/electra-base-discriminator` | ~110 M | 512 tokens | Modelo base (replaced token detection) | Apache 2.0 | Ampliamente usado |
| `protectai/deberta-v3-base-prompt-injection` | No disponible | No disponible | Deteccion de prompt injection | No disponible (consultar model card) | Hugging Face |
| `meta-llama/Prompt-Guard-86M` | 86 M | No disponible | Clasificacion de jailbreak / prompt injection | No disponible (consultar model card) | Hugging Face |

Las diferencias clave que si se pueden afirmar: este modelo no publica dataset de entrenamiento ni metricas desglosadas, mientras que las alternativas citadas cuentan con documentacion mas completa y una adopcion mucho mayor. En rendimiento, no hay datos que permitan establecer una comparacion honesta.

## Limitaciones y advertencias

- Model card practicamente vacia: el autor no documenta dataset, etiquetas, proposito previsto, sesgos ni poblacion objetivo. La seccion de descripcion dice literalmente "More information needed".
- Metrica ambigua: se reporta un unico valor de exactitud (0,9388) sin precision, recall, F1, AUC ni matriz de confusion. En tareas de deteccion con clases desequilibradas, la exactitud aislada puede ser enganosa.
- Inconsistencia entre `num_epochs` (10) y las epocas registradas (5): no esta claro que checkpoint corresponde a los pesos publicados ni si se aplico parada temprana.
- El nombre sugiere el uso del corpus TrustAIRLab, pero la model card afirma que el dataset es "unknown". La procedencia y el etiquetado de los datos no estan verificados, lo que impide evaluar la validez de la tarea.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe el riesgo de que el clasificador marque como benigno un ataque novedoso (falso negativo) o que bloquee consultas legitimas con vocabulario similar al de un jailbreak (falso positivo). Es especialmente vulnerable a ataques de evasion por ofuscacion, cambio de idioma o reformulacion, ya que no hay datos de robustez.
- Limitacion idiomatica: el campo de idiomas esta vacio y el tokenizador heredado es de vocabulario ingles, por lo que el comportamiento en castellano u otros idiomas es una incognita y probablemente deficiente sin ajuste adicional.
- Limite de contexto de 512 tokens: los prompts mas largos se truncaran, lo que permite ataques de "payload" situado al final de una entrada larga.
- 0 descargas y 0 likes: no hay evidencia de uso en produccion, ni informes de terceros, ni mantenimiento posterior a la fecha de publicacion.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni asume responsabilidad. Al derivar de `google/electra-base-discriminator` (tambien Apache 2.0), no hay conflicto de licencias conocido.
- Para produccion: no debe desplegarse como unico mecanismo de seguridad. Actua como una senal mas dentro de un sistema por capas, con umbral calibrado sobre datos propios y monitorizacion de falsos positivos y falsos negativos.
- La busqueda web realizada no devolvio ningun resultado relevante: todos los resultados obtenidos eran contenido no relacionado (videos y articulos en neerlandes sobre un programa de television y una cancion). No se ha encontrado documentacion, paper ni repositorio asociado a este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leomaurodesenv/electra-base-discriminator-trustairlab-jailbreak-augmented
- Modelo base: https://huggingface.co/google/electra-base-discriminator
- Paper de ELECTRA (arquitectura del modelo base): https://arxiv.org/abs/2003.10555
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante; todas las coincidencias devueltas eran contenido no relacionado con el modelo.
